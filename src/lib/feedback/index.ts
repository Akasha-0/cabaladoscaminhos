// ============================================================================
// lib/feedback — centraliza helpers do sistema de feedback Wave 33
// ============================================================================
// Camada de domínio isolada para evitar crescimento dos route handlers.
// Inclui: rate limit (3/dia/user), validação zod, helpers admin (CSV export),
// classification Net Promoter, e audit logging.
//
// LGPD: feedback é "tratamento de dados" sob art. 5. Toda operação em
// FeedbackSubmission/NpsResponse gera entrada em AuditLog (art. 37).
// ============================================================================

import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ============================================================================
// Enums re-exportados (single source of truth = Prisma schema)
// ============================================================================
export {
  FeedbackType,
  FeedbackStatus,
  NpsTrigger,
} from '@prisma/client';

// ============================================================================
// Schemas Zod (input validation)
// ============================================================================
export const FeedbackTypeSchema = z.enum([
  'BUG',
  'FEATURE',
  'CONTENT',
  'USABILITY',
  'COMMUNITY',
  'OTHER',
]);

export const FeedbackSubmissionSchema = z.object({
  type: FeedbackTypeSchema,
  category: z.string().trim().max(64).optional().nullable(),
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .nullable(),
  nps: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .nullable(),
  message: z
    .string()
    .trim()
    .min(10, 'Mensagem muito curta — conte mais (mínimo 10 caracteres).')
    .max(4000, 'Mensagem muito longa (máximo 4000 caracteres).'),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const NpsSubmissionSchema = z.object({
  score: z
    .number()
    .int('A nota precisa ser um número inteiro 0-10.')
    .min(0)
    .max(10),
  reason: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable(),
  trigger: z.enum([
    'DAY_1',
    'DAY_3',
    'DAY_7',
    'DAY_14',
    'DAY_30',
    'QUARTERLY',
    'MANUAL',
  ]),
  triggerAt: z
    .string()
    .datetime()
    .optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

// ============================================================================
// Rate limit — 3 submissions/dia/user (IP fallback para anônimos)
// ============================================================================
const DAILY_LIMIT = 3;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkFeedbackRateLimit(
  userId: string | null,
  ipHash: string | null,
): Promise<RateLimitResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const where: Prisma.FeedbackSubmissionWhereInput = userId
    ? { userId, createdAt: { gte: since } }
    : { userId: null, createdAt: { gte: since }, metadata: { path: ['ipHash'], equals: ipHash } };
  const used = await prisma.feedbackSubmission.count({ where });
  const remaining = Math.max(0, DAILY_LIMIT - used);
  return {
    allowed: used < DAILY_LIMIT,
    remaining,
    resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

// ============================================================================
// NPS classification (Net Promoter Score methodology)
// ============================================================================
export type NpsCategory = 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';

export function classifyNps(score: number): NpsCategory {
  if (score >= 9) return 'PROMOTER';
  if (score >= 7) return 'PASSIVE';
  return 'DETRACTOR';
}

export function npsScore(promoters: number, detractors: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((promoters - detractors) / total) * 100);
}

// ============================================================================
// Admin: CSV export (LGPD Art. 18 — titular pode pedir seus dados)
// ============================================================================
export function feedbackToCsv(rows: Array<{
  id: string;
  userId: string | null;
  type: string;
  category: string | null;
  rating: number | null;
  nps: number | null;
  message: string;
  status: string;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}>): string {
  const headers = [
    'id', 'userId', 'type', 'category', 'rating', 'nps',
    'message', 'status', 'createdAt', 'reviewedAt', 'reviewedBy',
  ];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s}"`;
    }
    return s;
  };
  const body = rows
    .map((r) => headers.map((h) => escape(r[h as keyof typeof r])).join(','))
    .join('\n');
  return `${headers.join(',')}\n${body}\n`;
}

// ============================================================================
// Admin: filtragem de listagem
// ============================================================================
export interface FeedbackListFilters {
  type?: string;
  status?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  priority?: number;
}

export function buildFeedbackListWhere(filters: FeedbackListFilters): Prisma.FeedbackSubmissionWhereInput {
  const where: Prisma.FeedbackSubmissionWhereInput = {};
  if (filters.type) where.type = filters.type as Prisma.EnumFeedbackTypeFilter['equals'];
  if (filters.status) where.status = filters.status as Prisma.EnumFeedbackStatusFilter['equals'];
  if (filters.userId) where.userId = filters.userId;
  if (filters.priority !== undefined) where.priority = filters.priority;
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }
  return where;
}

// ============================================================================
// Audit log helper (LGPD Art. 37)
// ============================================================================
export async function auditFeedback(
  actorId: string | null,
  action: string,
  targetId: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType: 'FeedbackSubmission',
        targetId,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    // Audit é nice-to-have, nunca bloqueia a operação principal
    console.warn('[feedback audit]', action, targetId, err);
  }
}

// ============================================================================
// NPS schedule — calcula próximo trigger para um user
// ============================================================================
const NPS_DAYS: Record<'DAY_1' | 'DAY_3' | 'DAY_7' | 'DAY_14' | 'DAY_30', number> = {
  DAY_1: 1, DAY_3: 3, DAY_7: 7, DAY_14: 14, DAY_30: 30,
};

export function nextNpsTrigger(
  createdAt: Date,
  triggersShown: string[],
  now: Date = new Date(),
): { trigger: keyof typeof NPS_DAYS; triggerAt: Date } | null {
  for (const [trigger, days] of Object.entries(NPS_DAYS) as Array<[keyof typeof NPS_DAYS, number]>) {
    if (triggersShown.includes(trigger)) continue;
    const triggerAt = new Date(createdAt.getTime() + days * 24 * 60 * 60 * 1000);
    if (now >= triggerAt) return { trigger, triggerAt };
  }
  return null;
}

// ============================================================================
// Summary helper — para dashboard admin
// ============================================================================
export interface FeedbackSummary {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  avgRating: number | null;
  avgNps: number | null;
  npsBreakdown: { promoters: number; passives: number; detractors: number };
  openCount: number;
  resolvedLast7d: number;
}

export async function computeFeedbackSummary(
  where: Prisma.FeedbackSubmissionWhereInput = {},
): Promise<FeedbackSummary> {
  const [rows, openCount, resolvedLast7d] = await Promise.all([
    prisma.feedbackSubmission.findMany({
      where,
      select: { type: true, status: true, rating: true, nps: true },
    }),
    prisma.feedbackSubmission.count({
      where: { ...where, status: { in: ['NEW', 'IN_REVIEW', 'PLANNED'] } },
    }),
    prisma.feedbackSubmission.count({
      where: {
        ...where,
        status: { in: ['DONE', 'WONT_FIX'] },
        reviewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let ratingSum = 0;
  let ratingCount = 0;
  let npsSum = 0;
  let npsCount = 0;
  let promoters = 0;
  let passives = 0;
  let detractors = 0;
  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    byType[r.type] = (byType[r.type] ?? 0) + 1;
    if (typeof r.rating === 'number') {
      ratingSum += r.rating;
      ratingCount += 1;
    }
    if (typeof r.nps === 'number') {
      npsSum += r.nps;
      npsCount += 1;
      if (r.nps >= 9) promoters += 1;
      else if (r.nps >= 7) passives += 1;
      else detractors += 1;
    }
  }
  return {
    total: rows.length,
    byStatus,
    byType,
    avgRating: ratingCount > 0 ? ratingSum / ratingCount : null,
    avgNps: npsCount > 0 ? npsSum / npsCount : null,
    npsBreakdown: { promoters, passives, detractors },
    openCount,
    resolvedLast7d,
  };
}
