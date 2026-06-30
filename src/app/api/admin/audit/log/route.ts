// ============================================================================
// ADMIN AUDIT LOG — GET /api/admin/audit/log
// ============================================================================
// Wave 21 (2026-06-28) — endpoint de auditoria LGPD Art. 37.
//
// Lista registros de AuditLog com filtros (userId, action, dateFrom,
// dateTo) e pagination. Suporta export CSV via `?format=csv` para
// entregar ao DPO em solicitações de titular.
//
// Auth: admin only (requireAdmin — verifica ADMIN_EMAILS env var OU
//       User.planoAssinatura='ADMIN' como escape hatch).
//
// Query params:
//   userId    — filtra actorId
//   targetId  — filtra targetId
//   action    — AuditAction enum value (LOGIN_SUCCESS, POST_CREATED, ...)
//   dateFrom  — ISO 8601 (createdAt >= dateFrom)
//   dateTo    — ISO 8601 (createdAt <= dateTo)
//   page      — 1-based (default 1)
//   pageSize  — default 50, max 500
//   format    — 'json' (default) | 'csv'
//
// Resposta JSON:
//   { data: AuditLogEntry[], total, page, pageSize }
// Resposta CSV:
//   text/csv com header row
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// Schema
// ============================================================================

const QuerySchema = z.object({
  userId: z.string().trim().min(1).max(80).optional(),
  targetId: z.string().trim().min(1).max(80).optional(),
  action: z.string().trim().min(1).max(80).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).max(10_000).optional(),
  pageSize: z.coerce.number().int().min(1).max(500).optional(),
  format: z.enum(['json', 'csv']).optional(),
});

// ============================================================================
// Types
// ============================================================================

interface AuditLogEntry {
  id: string;
  actorId: string | null;
  targetId: string | null;
  action: string;
  metadata: unknown;
  requestId: string | null;
  createdAt: string;
}

// ============================================================================
// CSV helpers
// ============================================================================

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(rows: AuditLogEntry[]): string {
  const header = ['id', 'actorId', 'targetId', 'action', 'requestId', 'createdAt', 'metadata'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.id),
        csvEscape(r.actorId),
        csvEscape(r.targetId),
        csvEscape(r.action),
        csvEscape(r.requestId),
        csvEscape(r.createdAt),
        csvEscape(r.metadata),
      ].join(',')
    );
  }
  return lines.join('\n') + '\n';
}

// ============================================================================
// GET handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(
        403,
        ErrorCode.FORBIDDEN,
        `Admin required (${session.reason})`
      );
    }

    const sp = request.nextUrl.searchParams;
    const parsed = QuerySchema.safeParse({
      userId: sp.get('userId') ?? undefined,
      targetId: sp.get('targetId') ?? undefined,
      action: sp.get('action') ?? undefined,
      dateFrom: sp.get('dateFrom') ?? undefined,
      dateTo: sp.get('dateTo') ?? undefined,
      page: sp.get('page') ?? undefined,
      pageSize: sp.get('pageSize') ?? undefined,
      format: sp.get('format') ?? undefined,
    });
    if (!parsed.success) return fromZodError(parsed.error);

    const {
      userId,
      targetId,
      action,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 50,
      format = 'json',
    } = parsed.data;

    // ------------------------------------------------------------------------
    // Build where clause
    // ------------------------------------------------------------------------
    const where: Prisma.AuditLogWhereInput = {};
    if (userId) where.actorId = userId;
    if (targetId) where.targetId = targetId;
    if (action) where.action = action as Prisma.EnumAuditActionFilter['equals'];
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // ------------------------------------------------------------------------
    // Query
    // ------------------------------------------------------------------------
    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const items: AuditLogEntry[] = rows.map((r: any) => ({
      id: r.id,
      actorId: r.actorId,
      targetId: r.targetId,
      action: r.action,
      metadata: r.metadata,
      requestId: r.requestId,
      createdAt: r.createdAt.toISOString(),
    }));

    // ------------------------------------------------------------------------
    // CSV export (sem envelope, retorna text/csv cru)
    // ------------------------------------------------------------------------
    if (format === 'csv') {
      const csv = buildCsv(items);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-log-${new Date()
            .toISOString()
            .slice(0, 10)}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // ------------------------------------------------------------------------
    // JSON default
    // ------------------------------------------------------------------------
    return ok(items, {
      meta: { total, page, pageSize, adminEmail: session.email },
      cache: { sMaxage: 30, staleWhileRevalidate: 60 },
    });
  } catch (err) {
    return handleError(err);
  }
}