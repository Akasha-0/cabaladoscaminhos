// ============================================================================
// POSTS — /api/posts/[id]/comments
// ============================================================================
// GET  → lista comentários paginados
// POST → cria comentário (autenticado). Side-effect: notif pro autor do post.
// ============================================================================

import { NextRequest } from 'next/server';
import {
  CommentQuerySchema,
  CreateCommentSchema,
} from '@/lib/validators/posts';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { listComments, createComment } from '@/lib/community/posts';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import {
  createNotification,
  fetchActorSnapshot,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const sp = request.nextUrl.searchParams;
    const parsed = CommentQuerySchema.safeParse({
      cursor: sp.get('cursor') ?? undefined,
      limit: sp.get('limit') ?? undefined,
      parentId: sp.get('parentId') ?? undefined,
    });
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const viewer = await getViewer();
    const result = await listComments({
      postId: id,
      viewerId: viewer?.id ?? null,
      cursor: parsed.data.cursor,
      limit: parsed.data.limit,
      parentId: parsed.data.parentId ?? null,
    });

    return ok(result, {
      meta: { nextCursor: result.nextCursor },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
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
        'Você precisa estar logado para comentar'
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = CreateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const comment = await createComment({
      postId: id,
      authorId: viewer.id,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
    });

    // Side-effects: notificações
    try {
      const post = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true, content: true, deletedAt: true },
      });

      if (post && !post.deletedAt) {
        const excerpt = parsed.data.content.slice(0, 200);
        const actorSnapshot = await fetchActorSnapshot(viewer.id);

        if (parsed.data.parentId) {
          // Reply — notifica o autor do comentário pai (se diferente do viewer)
          const parentComment = await prisma.comment.findUnique({
            where: { id: parsed.data.parentId },
            select: { authorId: true, postId: true },
          });
          if (
            parentComment &&
            parentComment.authorId !== viewer.id &&
            parentComment.postId === id
          ) {
            await createNotification({
              userId: parentComment.authorId,
              type: 'POST_REPLY',
              actorId: viewer.id,
              entityType: 'COMMENT',
              entityId: comment.id,
              postId: id,
              commentId: comment.id,
              payload: {
                preview: `${viewer.displayName} respondeu seu comentário`,
                excerpt,
                link: `/post/${id}#comment-${comment.id}`,
              },
              actorSnapshot,
            });
          }
        } else if (post.authorId !== viewer.id) {
          // Top-level comment — notifica o autor do post
          await createNotification({
            userId: post.authorId,
            type: 'COMMENT',
            actorId: viewer.id,
            entityType: 'COMMENT',
            entityId: comment.id,
            postId: id,
            commentId: comment.id,
            payload: {
              preview: `${viewer.displayName} comentou no seu post`,
              excerpt,
              link: `/post/${id}#comment-${comment.id}`,
            },
            actorSnapshot,
          });
        }
      }
    } catch (notifErr) {
      console.error('[posts/comments] notification trigger failed', notifErr);
    }

    return ok(comment, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
