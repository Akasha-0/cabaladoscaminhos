// ============================================================================
// ADMIN LGPD AUDIT LOG API — GET /api/admin/lgpd/audit-log
// ============================================================================
// Wrapper sobre /api/admin/audit/log com filtros específicos de LGPD e
// verificador de hash chain. Suporta export CSV para ofício ANPD.
//
// Auth: admin only.
//
// Query params:
//   userId, action, dateFrom, dateTo, page, pageSize (idem /api/admin/audit/log)
//   verifyChain=true → roda verifyAuditChain() antes de retornar
//   format=csv|json
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  ok,
  fail,
  fromZodError,
  handleError,
  ErrorCode,
} from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import { verifyAuditChain, logSensitiveAction } from '@/lib/lgpd';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  userId: z.string().trim().min(1).max(80).optional(),
  action: z.string().trim().min(1).max(80).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).max(10_000).optional(),
  pageSize: z.coerce.number().int().min(1).max(500).optional(),
  format: z.enum(['json', 'csv']).optional(),
  verifyChain: z.coerce.boolean().optional(),
});

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(403, ErrorCode.FORBIDDEN, 'Acesso restrito a administradores');
    }

    const url = new URL(request.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) return fromZodError(parsed.error);

    const {
      userId,
      action,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 100,
      format = 'json',
      verifyChain = false,
    } = parsed.data;

    const where: Prisma.AuditLogWhereInput = {};
    if (userId) where.OR = [{ actorId: userId }, { targetId: userId }];
    if (action) where.action = action as Prisma.EnumAuditActionFilter;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [rows, total, chainStatus] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
      verifyChain ? verifyAuditChain({ sinceDays: 365, limit: 10000 }) : Promise.resolve(null),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      actorId: r.actorId,
      targetId: r.targetId,
      action: r.action,
      metadata: r.metadata,
      requestId: r.requestId,
      createdAt: r.createdAt.toISOString(),
    }));

    // Audit: registrar o próprio acesso (anti-mascaramento)
    if (format === 'csv') {
      await logSensitiveAction({
        action: 'AUDIT_LOG_EXPORTED',
        actorId: session.userId,
        changes: {
          queryParams: Object.fromEntries(url.searchParams),
          totalReturned: items.length,
        },
        ip: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      });
    }

    if (format === 'csv') {
      const header = [
        'id',
        'createdAt',
        'action',
        'actorId',
        'targetId',
        'requestId',
        'metadata',
      ].join(',');
      const lines = items.map((i) =>
        [
          csvEscape(i.id),
          csvEscape(i.createdAt),
          csvEscape(i.action),
          csvEscape(i.actorId),
          csvEscape(i.targetId),
          csvEscape(i.requestId),
          csvEscape(i.metadata),
        ].join(',')
      );
      const csv = [header, ...lines].join('\n');

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-log-lgpd-${new Date()
            .toISOString()
            .slice(0, 10)}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return ok(items, {
      meta: {
        total,
        page,
        pageSize,
        adminEmail: session.email,
        hashChain: chainStatus ?? undefined,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}