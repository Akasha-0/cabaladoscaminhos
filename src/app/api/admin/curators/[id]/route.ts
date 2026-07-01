// ============================================================================
// PATCH/DELETE /api/admin/curators/[id] — Wave 35 (2026-07-01)
// ============================================================================// PATCH — atualiza permissions, active, curatorRole, bio, credentials.
// DELETE — desativa (soft) o curador (preserva histórico).
//
// Auth:
//   - requireAdmin + role=IYA|ADMIN
//   - Apenas Iyá pode promover a IYA ou trocar curatorRole para IYA
//
// Body PATCH:
//   {
//     active?: boolean,
//     curatorRole?: CuratorRole,
//     permissions?: Partial<CuratorPermissionSet>,
//     bio?: string,
//     credentials?: string,
//     guestExpiresAt?: string (ISO)
//   }
//
// DELETE: sem body. Status code: 204.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import {
  defaultPermissionsFor,
  resolveUserRole,
} from '@/lib/curators/service';

export const runtime = 'nodejs';

const PatchSchema = z.object({
  active: z.boolean().optional(),
  curatorRole: z
    .enum([
      'IYA',
      'CURATOR_CABALA',
      'CURATOR_IFA',
      'CURATOR_TANTRA',
      'CURATOR_ASTROLOGIA',
      'GUEST_CURATOR',
    ])
    .optional(),
  permissions: z
    .object({
      canApproveContent: z.boolean().optional(),
      canCurateLibrary: z.boolean().optional(),
      canModeratePosts: z.boolean().optional(),
      canInviteCurators: z.boolean().optional(),
      canReviewOtherTraditions: z.boolean().optional(),
    })
    .partial()
    .optional(),
  bio: z.string().max(1000).optional(),
  credentials: z.string().max(2000).optional(),
  guestExpiresAt: z.string().datetime().optional(),
  deactivatedReason: z.string().max(500).optional(),
});

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(ErrorCode.FORBIDDEN, `Admin/Iyá required (${session.reason})`, 403);
    }
    const role = await resolveUserRole(session.userId, session.email);
    if (role !== 'ADMIN' && role !== 'IYA') {
      return fail(ErrorCode.FORBIDDEN, `Apenas admin ou Iyá (atual=${role})`, 403);
    }

    const { id } = await ctx.params;
    const profile = await prisma.curatorProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!profile) {
      return fail(ErrorCode.NOT_FOUND, 'Curador não encontrado', 404);
    }

    const json = await request.json().catch(() => ({}));
    const parsed = PatchSchema.safeParse(json);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }
    const data = parsed.data;

    // Iyá-only mutations
    if ((data.curatorRole === 'IYA' || role !== 'IYA') && data.curatorRole === 'IYA') {
      return fail(ErrorCode.FORBIDDEN, 'Apenas Iyá pode promover outro a Iyá', 403);
    }

    const before = {
      active: profile.active,
      curatorRole: profile.curatorRole,
      permissions: profile.permissions,
    };

    const updated = await prisma.curatorProfile.update({
      where: { id },
      data: {
        ...(data.active !== undefined && { active: data.active }),
        ...(data.curatorRole !== undefined && { curatorRole: data.curatorRole }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.credentials !== undefined && { credentials: data.credentials }),
        ...(data.guestExpiresAt !== undefined && {
          guestExpiresAt: new Date(data.guestExpiresAt),
        }),
        ...(data.permissions !== undefined && {
          permissions: { ...(profile.permissions as object), ...data.permissions },
        }),
        ...(data.deactivatedReason !== undefined && {
          deactivatedReason: data.deactivatedReason,
        }),
        // Se ficou active novamente, registra approvedBy/approvedAt se ainda não tinha
        ...(data.active === true && !profile.approvedAt && {
          approvedBy: session.userId,
          approvedAt: new Date(),
        }),
      },
      include: { user: { select: { email: true, nomeCompleto: true } } },
    });

    await logAudit({
      action: data.active === false ? 'CURATOR_DEACTIVATED' : 'CURATOR_PROFILE_UPDATED',
      actorId: session.userId,
      targetId: id,
      metadata: {
        before,
        after: {
          active: updated.active,
          curatorRole: updated.curatorRole,
          permissions: updated.permissions,
        },
        ...(data.deactivatedReason && { reason: data.deactivatedReason }),
      },
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return ok({
      id: updated.id,
      userId: updated.userId,
      email: updated.user.email,
      displayName: updated.user.nomeCompleto,
      tradition: updated.tradition,
      curatorRole: updated.curatorRole,
      active: updated.active,
      permissions: updated.permissions,
      guestExpiresAt: updated.guestExpiresAt,
      approvedBy: updated.approvedBy,
      approvedAt: updated.approvedAt,
      deactivatedReason: updated.deactivatedReason,
      defaultPermissions: defaultPermissionsFor(updated.curatorRole),
    });
  } catch (err) {
    return handleError(err, 'PATCH /api/admin/curators/[id]');
  }
}

export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(ErrorCode.FORBIDDEN, `Admin/Iyá required (${session.reason})`, 403);
    }
    const role = await resolveUserRole(session.userId, session.email);
    if (role !== 'ADMIN' && role !== 'IYA') {
      return fail(ErrorCode.FORBIDDEN, `Apenas admin ou Iyá (atual=${role})`, 403);
    }

    const { id } = await ctx.params;
    const profile = await prisma.curatorProfile.findUnique({ where: { id } });
    if (!profile) {
      return fail(ErrorCode.NOT_FOUND, 'Curador não encontrado', 404);
    }
    if (profile.curatorRole === 'IYA') {
      return fail(
        ErrorCode.FORBIDDEN,
        'Iyá não pode desativar a si mesma; peça a outro admin',
        403
      );
    }

    const url = new URL(request.url);
    const reason = url.searchParams.get('reason') || 'Desativado por admin';

    const updated = await prisma.curatorProfile.update({
      where: { id },
      data: { active: false, deactivatedReason: reason },
    });

    await logAudit({
      action: 'CURATOR_DEACTIVATED',
      actorId: session.userId,
      targetId: id,
      metadata: { deactivatedReason: reason, userId: profile.userId },
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    // Revoga convites ainda pendentes relacionados ao mesmo email do user
    const u = await prisma.user.findUnique({ where: { id: profile.userId } });
    if (u) {
      await prisma.curatorInvitation.updateMany({
        where: { email: u.email.toLowerCase(), status: 'PENDING' },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });
    }

    return ok({ id: updated.id, active: updated.active, deactivatedReason: reason });
  } catch (err) {
    return handleError(err, 'DELETE /api/admin/curators/[id]');
  }
}
