// ============================================================================
// GROUPS — /api/groups/[slug]/members
// ============================================================================
// GET    → lista membros
// POST   → join (se público) OU processa invite via token
// DELETE → leave (self) ou remove (somente ADMIN/MODERATOR)
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  ok, fail, fromZodError, handleError, ErrorCode,
} from '@/lib/community/api';
import { getViewer, requireViewer } from '@/lib/community/auth';
import {
  listMembers, joinGroup, leaveGroup, removeMember,
  updateMemberRole,
  GroupNotFoundError, GroupForbiddenError, GroupPrivateError, LastAdminError,
} from '@/lib/community/groups';
import { UpdateMemberRoleSchema } from '@/lib/validators/groups';
import {
  notifyGroupNewMember, notifyPromoted,
} from '@/lib/community/notifications';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sp = request.nextUrl.searchParams;
    const roleFilter = sp.get('role');
    const limit = sp.get('limit') ? Number(sp.get('limit')) : undefined;

    const members = await listMembers({
      slug,
      limit: Number.isFinite(limit) ? limit : undefined,
      ...(roleFilter === 'ADMIN' || roleFilter === 'MODERATOR' || roleFilter === 'MEMBER'
        ? { role: roleFilter }
        : {}),
    });
    return ok(members, { meta: { count: members.length } });
  } catch (err) {
    if (err instanceof GroupNotFoundError) {
      return fail(404, ErrorCode.NOT_FOUND, err.message);
    }
    return handleError(err);
  }
}

const JoinBodySchema = z.object({
  token: z.string().min(8).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = JoinBodySchema.safeParse(body ?? {});
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      // Se veio token → é aceite de invite (não exige grupo público)
      if (parsed.data.token) {
        const { acceptInvite } = await import('@/lib/community/groups');
        const result = await acceptInvite({
          token: parsed.data.token,
          userId: viewer.id,
        });
        // Notifica admins sobre novo membro
        const group = await prisma.group.findUnique({
          where: { slug: result.groupSlug },
          select: { id: true },
        });
        if (group) {
          await notifyGroupNewMember({
            groupId: group.id,
            newUserId: viewer.id,
          });
        }
        return ok({ groupSlug: result.groupSlug, role: result.role });
      }

      // Senão → join direto (exige grupo público)
      const result = await joinGroup({ slug, userId: viewer.id });

      const group = await prisma.group.findUnique({
        where: { slug },
        select: { id: true, name: true },
      });
      if (group) {
        await notifyGroupNewMember({
          groupId: group.id,
          newUserId: viewer.id,
        });
      }
      return ok(result, { status: 201 });
    } catch (err) {
      if (err instanceof GroupNotFoundError) {
        return fail(404, ErrorCode.NOT_FOUND, err.message);
      }
      if (err instanceof GroupPrivateError) {
        return fail(403, ErrorCode.FORBIDDEN, err.message);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}

const DeleteBodySchema = z.object({
  targetUserId: z.string().max(60).optional(),
  role: UpdateMemberRoleSchema.shape.role.optional(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const { slug } = await params;
    const url = new URL(request.url);
    const body = await request.json().catch(() => null);
    const queryTarget = url.searchParams.get('targetUserId');
    const parsed = DeleteBodySchema.safeParse({
      targetUserId: body?.targetUserId ?? queryTarget ?? undefined,
      role: body?.role ?? undefined,
    });
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      // Caso 1: leave (DELETE sem target → self)
      if (!parsed.data.targetUserId) {
        await leaveGroup({ slug, userId: viewer.id });
        return ok({ slug, left: true });
      }

      // Caso 2: promover / rebaixar (target + role)
      if (parsed.data.role) {
        const updated = await updateMemberRole({
          slug,
          actorId: viewer.id,
          targetUserId: parsed.data.targetUserId,
          role: parsed.data.role,
        });
        // Notifica o usuário promovido
        if (parsed.data.role === 'MODERATOR' || parsed.data.role === 'ADMIN') {
          const group = await prisma.group.findUnique({
            where: { slug },
            select: { id: true, name: true },
          });
          if (group) {
            await notifyPromoted({
              userId: parsed.data.targetUserId,
              promotedBy: viewer.id,
              groupId: group.id,
              groupName: group.name,
              newRole: parsed.data.role,
            });
          }
        }
        return ok(updated);
      }

      // Caso 3: remover membro (target sem role)
      await removeMember({
        slug,
        actorId: viewer.id,
        targetUserId: parsed.data.targetUserId,
      });
      return ok({ slug, removedUserId: parsed.data.targetUserId });
    } catch (err) {
      if (err instanceof GroupNotFoundError) {
        return fail(404, ErrorCode.NOT_FOUND, err.message);
      }
      if (err instanceof GroupForbiddenError) {
        return fail(403, ErrorCode.FORBIDDEN, err.message);
      }
      if (err instanceof LastAdminError) {
        return fail(409, ErrorCode.CONFLICT, err.message);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}
