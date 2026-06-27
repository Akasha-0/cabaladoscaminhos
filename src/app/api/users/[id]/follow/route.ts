// ============================================================================
// FOLLOW — /api/users/[id]/follow
// ============================================================================
// POST → toggle follow (autenticado).
// Side-effect: notif para o usuário seguido quando follow é criado.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { checkUserRateLimit, userRateLimitMessage } from '@/lib/rate-limit-user';
import {
  createNotification,
  fetchActorSnapshot,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id: followedId } = await context.params;

    if (!followedId) {
      return fail(400, ErrorCode.BAD_REQUEST, 'id obrigatório');
    }

    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para seguir'
      );
    }

    if (viewer.id === followedId) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Você não pode seguir a si mesmo');
    }

    // Wave 11 — rate limit granular por user (follow: 50/h)
    const userRl = checkUserRateLimit(viewer.id, 'follow');
    if (!userRl.allowed) {
      return fail(
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        userRateLimitMessage('follow', userRl.resetIn)
      );
    }

    // Verifica que o target existe (best-effort)
    // Como não temos User model, pulamos validação rigorosa

    // Toggle: se já existe, deleta; senão, cria
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: viewer.id,
          followedId,
        },
      },
    });

    let following: boolean;
    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followedId: {
            followerId: viewer.id,
            followedId,
          },
        },
      });
      following = false;
    } else {
      await prisma.follow.create({
        data: {
          followerId: viewer.id,
          followedId,
        },
      });
      following = true;

      // Side-effect: notificar o seguido
      try {
        await createNotification({
          userId: followedId,
          type: 'FOLLOW',
          actorId: viewer.id,
          entityType: 'USER',
          entityId: viewer.id,
          payload: {
            preview: `${viewer.displayName} começou a seguir você`,
            link: `/u/${viewer.id}`,
          },
          actorSnapshot: await fetchActorSnapshot(viewer.id),
        });
      } catch (notifErr) {
        console.error('[follow] notification trigger failed', notifErr);
      }
    }

    // Contar followers
    const followersCount = await prisma.follow.count({
      where: { followedId },
    });

    return ok({ following, followersCount });
  } catch (err) {
    return handleError(err);
  }
}
