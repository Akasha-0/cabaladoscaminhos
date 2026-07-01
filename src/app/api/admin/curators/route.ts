// ============================================================================
// GET /api/admin/curators — Wave 35 (2026-07-01)
// ============================================================================// Lista curadores ativos/inativos e convites pendentes. Visão
// consolidada para o dashboard /admin/curators.
//
// Query params:
//   active     — true|false (default true)
//   tradition  — slug canônico
//
// Retorna:
//   {
//     curators: CuratorListItem[],
//     invitations: PendingInvitation[],
//     totals: { active, invited, accepted, pending }
//   }
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { listCurators, listPendingInvitations, resolveUserRole } from '@/lib/curators/service';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const QuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
  tradition: z.string().trim().max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(ErrorCode.FORBIDDEN, `Admin/Iyá required (${session.reason})`, 403);
    }
    const role = await resolveUserRole(session.userId, session.email);
    if (role !== 'ADMIN' && role !== 'IYA') {
      return fail(ErrorCode.FORBIDDEN, `Apenas admin ou Iyá (atual=${role})`, 403);
    }

    const sp = request.nextUrl.searchParams;
    const parsed = QuerySchema.safeParse({
      active: sp.get('active') ?? undefined,
      tradition: sp.get('tradition') ?? undefined,
    });
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const filters = {
      active: parsed.data.active === undefined ? true : parsed.data.active === 'true',
      tradition: parsed.data.tradition,
    };

    const [curators, invitations, totals] = await Promise.all([
      listCurators(filters),
      listPendingInvitations(),
      prisma.curatorProfile
        .groupBy({
          by: ['active'],
          _count: { _all: true },
        })
        .catch(() => [] as Array<{ active: boolean; _count: { _all: number } }>),
    ]);

    const invitedAgg = await prisma.curatorInvitation
      .groupBy({
        by: ['status'],
        _count: { _all: true },
      })
      .catch(() => [] as Array<{ status: string; _count: { _all: number } }>);

    return ok({
      curators,
      invitations,
      totals: {
        active: curators.filter((c) => c.active).length,
        inactive: curators.filter((c) => !c.active).length,
        invitedByStatus: Object.fromEntries(invitedAgg.map((r) => [r.status, r._count._all])),
        activeByStatus: Object.fromEntries(totals.map((r) => [String(r.active), r._count._all])),
      },
    });
  } catch (err) {
    return handleError(err, 'GET /api/admin/curators');
  }
}
