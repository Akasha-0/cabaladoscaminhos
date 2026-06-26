/**
 * POST /api/cron/consolidate-memory
 *
 * Wave 31.5 — Long-term Memory Distillation (cron semanal).
 *
 * Consolida memórias antigas (>30 dias) em insights. Idempotente.
 *
 * Auth: CRON_SECRET header (verifyCronSecret). Mesmo padrão dos outros
 * cron endpoints (daily-push, discoveries/cron).
 *
 * Body opcional:
 *   { userId?: string, workspaceId?: string, since?: string ISO }
 *
 *   - userId/workspaceId: se fornecidos, consolida só esse user.
 *     Se omitidos, varre TODOS os usuários ativos (último login <90d).
 *   - since: override da data inicial (default = 30 dias atrás).
 *
 * Response 200:
 *   { processed: number, totalInserted: number, results: [...] }
 *
 * Response 401: CRON_SECRET ausente ou inválido.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/application/auth/cron-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { consolidateForUser } from '@/lib/infrastructure/memory/prisma-storage';

export const runtime = 'nodejs';
export const maxDuration = 60; // segundos — Next.js serverless max
export const dynamic = 'force-dynamic';

interface ConsolidateBody {
  userId?: string;
  workspaceId?: string;
  since?: string;
}

interface UserJob {
  userId: string;
  workspaceId: string;
}

const DEFAULT_LOOKBACK_DAYS = 30;
/** Bound para varredura: usuários ativos = último login <90d. */
const ACTIVE_LOOKBACK_DAYS = 90;
/** Limite duro de usuários por execução do cron (cost guard). */
const MAX_USERS_PER_RUN = 500;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Auth — verifyCronSecret
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  // 2. Parse body (opcional)
  let body: ConsolidateBody = {};
  try {
    if (request.headers.get('content-length') !== '0') {
      const raw = await request.json();
      if (raw && typeof raw === 'object') {
        body = raw as ConsolidateBody;
      }
    }
  } catch {
    // Body vazio ou inválido → defaults
  }

  // 3. Determina jobs (lista de {userId, workspaceId})
  const since = parseSince(body.since) ?? defaultSince();
  const jobs: UserJob[] = await collectJobs(body);

  if (jobs.length === 0) {
    return NextResponse.json(
      { processed: 0, totalInserted: 0, results: [], message: 'nenhum job' },
      { status: 200 }
    );
  }

  // 4. Executa consolidação para cada job (sequencial, com bound)
  let totalInserted = 0;
  const results: Array<{
    userId: string;
    workspaceId: string;
    sourcesRead: number;
    clustersCreated: number;
    inserted: number;
  }> = [];

  for (const job of jobs) {
    try {
      const out = await consolidateForUser({
        prisma: prisma as unknown as Parameters<typeof consolidateForUser>[0]['prisma'],
        userId: job.userId,
        workspaceId: job.workspaceId,
        since,
      });
      totalInserted += out.clustersCreated;
      results.push({
        userId: job.userId,
        workspaceId: job.workspaceId,
        sourcesRead: out.sourcesRead,
        clustersCreated: out.clustersCreated,
        inserted: out.clustersCreated,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'erro desconhecido';
      results.push({
        userId: job.userId,
        workspaceId: job.workspaceId,
        sourcesRead: 0,
        clustersCreated: 0,
        inserted: 0,
      });
      // Log para diagnóstico sem expor PII (apenas IDs)
      console.error('[consolidate-memory] failed', {
        userId: job.userId,
        workspaceId: job.workspaceId,
        message,
      });
    }
  }

  return NextResponse.json(
    {
      processed: jobs.length,
      totalInserted,
      results,
    },
    { status: 200 }
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/**
 * Decide quais jobs rodar:
 *   - Se body.userId + body.workspaceId: 1 job explícito.
 *   - Se só body.userId: varre workspaces desse user.
 *   - Se nada: varre usuários ativos (último login < ACTIVE_LOOKBACK_DAYS).
 */
async function collectJobs(body: ConsolidateBody): Promise<UserJob[]> {
  if (body.userId && body.workspaceId) {
    return [{ userId: body.userId, workspaceId: body.workspaceId }];
  }

  if (body.userId) {
    // workspaces do user
    const memberships = await prisma.sessao.findMany({
      where: { userId: body.userId },
      select: { userId: true, workspaceId: true },
      distinct: ['workspaceId'],
      take: MAX_USERS_PER_RUN,
    });
    const seen = new Set<string>();
    const out: UserJob[] = [];
    for (const m of memberships) {
      const k = `${m.userId}:${m.workspaceId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ userId: m.userId, workspaceId: m.workspaceId });
    }
    return out;
  }

  // Default: varre todos os usuários ativos
  const activeSince = new Date();
  activeSince.setUTCDate(activeSince.getUTCDate() - ACTIVE_LOOKBACK_DAYS);

  const recentSessoes = await prisma.sessao.findMany({
    where: { createdAt: { gte: activeSince } },
    select: { userId: true, workspaceId: true },
    distinct: ['userId', 'workspaceId'],
    take: MAX_USERS_PER_RUN,
  });

  const seen = new Set<string>();
  const out: UserJob[] = [];
  for (const s of recentSessoes) {
    const k = `${s.userId}:${s.workspaceId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ userId: s.userId, workspaceId: s.workspaceId });
  }
  return out;
}

function parseSince(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function defaultSince(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - DEFAULT_LOOKBACK_DAYS);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}