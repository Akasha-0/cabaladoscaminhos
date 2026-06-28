// ============================================================================
// POSTS — /api/posts/[id]/comments/[commentId]/reply
// ============================================================================
// POST → cria uma resposta aninhada ao comentário [commentId] do post [id].
//   - Requer autenticação.
//   - Valida parent via FK (mesmo post, não deletado).
//   - Side-effect: notifica o autor do comentário pai (se diferente do viewer).
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
import { createComment } from '@/lib/community/posts';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { checkUserRateLimit, userRateLimitMessage } from '@/lib/rate-limit-user';
import {
  createNotification,
  fetchActorSnapshot,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

const ReplySchema = z.object({
  content: z
    .string()
    .min(1, 'Resposta vazia')
    .max(2000, 'Resposta muito longa (máx 2000)'),
});

interface RouteContext {
  params: Promise<{ id: string; commentId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: postId, commentId } = await context.params;

    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para responder'
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    // Mesma janela de rate-limit que criação de comentário top-level.
    const userRl = checkUserRateLimit(viewer.id, 'comment-create');
    if (!userRl.allowed) {
      return fail(
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        userRateLimitMessage('comment-create', userRl.resetIn)
      );
    }

    const parsed = ReplySchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    // Confirma que o parent existe e pertence ao mesmo post.
    const parent = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, deletedAt: true, authorId: true },
    });
    if (!parent || parent.deletedAt || parent.postId !== postId) {
      return fail(404, ErrorCode.NOT_FOUND, 'Comentário pai não encontrado');
    }

    const reply = await createComment({
      postId,
      authorId: viewer.id,
      content: parsed.data.content,
      parentId: commentId,
    });

    // Notifica o autor do comentário pai (se não for o próprio viewer).
    try {
      if (parent.authorId !== viewer.id) {
        const excerpt = parsed.data.content.slice(0, 200);
        const actorSnapshot = await fetchActorSnapshot(viewer.id);
        await createNotification({
          userId: parent.authorId,
          type: 'POST_REPLY',
          actorId: viewer.id,
          entityType: 'COMMENT',
          entityId: reply.id,
          postId,
          commentId: reply.id,
          payload: {
            preview: `${viewer.displayName} respondeu seu comentário`,
            excerpt,
            link: `/post/${postId}#comment-${reply.id}`,
          },
          actorSnapshot,
        });
      }
    } catch (notifErr) {
      console.error('[comments/reply] notification trigger failed', notifErr);
    }

    return ok(reply, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
