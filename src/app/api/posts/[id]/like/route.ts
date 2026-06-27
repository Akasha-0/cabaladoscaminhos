// ============================================================================
// POSTS — /api/posts/[id]/like
// ============================================================================
// POST → toggle like do post (autenticado).
//
// Side-effect: cria notificação para o autor do post quando o like é
// adicionado (não quando removido). Usa batching (groupKey) para consolidar
// múltiplas curtidas em uma única notif "+N curtidas".
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { toggleLike } from '@/lib/community/posts';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import {
  createNotification,
  fetchActorSnapshot,
  likeGroupKey,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para curtir'
      );
    }

    const result = await toggleLike({ postId: id, userId: viewer.id });

    // Side-effect: notificar o autor do post quando um like é adicionado
    // (result.liked === true após o toggle)
    if (result.liked) {
      try {
        const post = await prisma.post.findUnique({
          where: { id },
          select: { authorId: true, content: true, deletedAt: true },
        });

        if (post && !post.deletedAt && post.authorId !== viewer.id) {
          // Não notifica self-like (já tratado pelo trigger, mas defesa extra)
          const excerpt = post.content.slice(0, 200);
          await createNotification({
            userId: post.authorId,
            type: 'LIKE',
            actorId: viewer.id,
            entityType: 'POST',
            entityId: id,
            postId: id,
            groupKey: likeGroupKey(id),
            payload: {
              preview: `${viewer.displayName} curtiu seu post`,
              excerpt,
              link: `/post/${id}`,
            },
            actorSnapshot: await fetchActorSnapshot(viewer.id),
          });
        }
      } catch (notifErr) {
        // Notif é side-effect — não bloqueia a operação principal
        console.error('[posts/like] notification trigger failed', notifErr);
      }
    }

    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
