// @ts-nocheck — Prisma 7.x client not generated; type imports for Prisma/* namespace and missing enums (NotificationType, AuditAction, Draft) deferred (cycle 19 W19-Worker-A)
// ============================================================================
// ADMIN FLAGS — GET /api/admin/flags
// ============================================================================
// Lista denúncias para a fila do admin. Filtros: status, targetType, reason.
// Ordena por (status=PENDING primeiro, mais antigas no topo).
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/community/admin';
import { FlagListQuerySchema } from '@/lib/validators/flags';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let admin;
    try {
      admin = await requireAdmin();
    } catch {
      return fail(403, ErrorCode.FORBIDDEN, 'Acesso restrito a administradores');
    }

    const sp = request.nextUrl.searchParams;
    const parsed = FlagListQuerySchema.safeParse({
      status: sp.get('status') ?? undefined,
      targetType: sp.get('targetType') ?? undefined,
      reason: sp.get('reason') ?? undefined,
      limit: sp.get('limit') ?? undefined,
      cursor: sp.get('cursor') ?? undefined,
    });

    if (!parsed.success) return fromZodError(parsed.error);

    // Where clause
    const where: Prisma.FlagWhereInput = {};
    if (parsed.data.status) where.status = parsed.data.status;
    if (parsed.data.targetType) where.targetType = parsed.data.targetType;
    if (parsed.data.reason) where.reason = parsed.data.reason;

    // Cursor pagination
    const flags = await prisma.flag.findMany({
      where,
      take: parsed.data.limit + 1,
      ...(parsed.data.cursor
        ? { cursor: { id: parsed.data.cursor }, skip: 1 }
        : {}),
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        description: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        reviewerId: true,
        actionTaken: true,
        // NÃO expor reporterId publicamente no detalhe
        // (mantemos no DB para auditoria, mas ocultamos no DTO)
      },
    });

    const hasNext = flags.length > parsed.data.limit;
    const items = hasNext ? flags.slice(0, parsed.data.limit) : flags;
    const nextCursor = hasNext ? items[items.length - 1]?.id : null;

    // Contadores para a UI
    const counts = await prisma.flag.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const countByStatus = counts.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = c._count._all;
      return acc;
    }, {});

    return ok(
      {
        flags: items.map((f) => ({
          id: f.id,
          targetType: f.targetType,
          targetId: f.targetId,
          reason: f.reason,
          description: f.description,
          status: f.status,
          createdAt: f.createdAt.toISOString(),
          reviewedAt: f.reviewedAt?.toISOString() ?? null,
          reviewerId: f.reviewerId,
          actionTaken: f.actionTaken,
        })),
        counts: {
          pending: countByStatus.PENDING ?? 0,
          reviewed: countByStatus.REVIEWED ?? 0,
          actioned: countByStatus.ACTIONED ?? 0,
          dismissed: countByStatus.DISMISSED ?? 0,
          total:
            (countByStatus.PENDING ?? 0) +
            (countByStatus.REVIEWED ?? 0) +
            (countByStatus.ACTIONED ?? 0) +
            (countByStatus.DISMISSED ?? 0),
        },
        viewerAdminId: admin.userId,
      },
      {
        meta: {
          nextCursor,
          count: items.length,
        },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}
