// ============================================================================
// GROUPS — /api/groups/[slug]/invite
// ============================================================================
// POST → cria convite (somente ADMIN/MODERATOR)
//   body: { inviteeUserId? } ou { inviteeEmail? }
// GET  → lista convites pendentes do grupo (somente ADMIN/MODERATOR)
// ============================================================================

import { NextRequest } from 'next/server';
import {
  ok, fail, fromZodError, handleError, ErrorCode,
} from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { CreateInviteSchema } from '@/lib/validators/groups';
import {
  createInvite, GroupNotFoundError, GroupForbiddenError,
} from '@/lib/community/groups';
import { notifyGroupInvite } from '@/lib/community/notifications';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    const body = await request.json().catch(() => null);
    if (!body) return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');

    const parsed = CreateInviteSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      const invite = await createInvite({
        slug,
        invitedBy: viewer.id,
        inviteeUserId: parsed.data.inviteeUserId ?? null,
        inviteeEmail: parsed.data.inviteeEmail ?? null,
      });

      // Notifica o usuário convidado (se tiver userId)
      if (invite.inviteeUserId) {
        const group = await prisma.group.findUnique({
          where: { slug },
          select: { id: true, name: true },
        });
        if (group) {
          await notifyGroupInvite({
            inviteeUserId: invite.inviteeUserId,
            invitedBy: viewer.id,
            groupId: group.id,
            groupName: group.name,
          });
        }
      }

      return ok(invite, { status: 201 });
    } catch (err) {
      if (err instanceof GroupNotFoundError) {
        return fail(404, ErrorCode.NOT_FOUND, err.message);
      }
      if (err instanceof GroupForbiddenError) {
        return fail(403, ErrorCode.FORBIDDEN, err.message);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(
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
    const group = await prisma.group.findUnique({
      where: { slug },
      select: {
        id: true,
        members: {
          where: { userId: viewer.id },
          select: { role: true },
        },
      },
    });
    if (!group) {
      return fail(404, ErrorCode.NOT_FOUND, 'Grupo não encontrado');
    }
    const role = group.members[0]?.role;
    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      return fail(403, ErrorCode.FORBIDDEN, 'Apenas ADMIN/MODERATOR podem ver convites');
    }

    const invites = await prisma.groupInvite.findMany({
      where: { groupId: group.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return ok(
      invites.map((i) => ({
        id: i.id,
        token: i.token,
        inviteeUserId: i.inviteeUserId,
        inviteeEmail: i.inviteeEmail,
        status: i.status,
        expiresAt: i.expiresAt.toISOString(),
        createdAt: i.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    return handleError(err);
  }
}
