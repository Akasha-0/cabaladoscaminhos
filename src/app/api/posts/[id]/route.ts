// ============================================================================
// POSTS — /api/posts/[id]
// ============================================================================
// GET    → detalhe de um post
// PATCH  → atualiza (somente autor)
// DELETE → soft delete (somente autor)
// ============================================================================

import { NextRequest } from 'next/server';
import { UpdatePostSchema } from '@/lib/validators/posts';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { prisma } from '@/lib/prisma';
import { postToDto, updatePost, deletePost } from '@/lib/community/posts';
import { getViewer, requireViewer } from '@/lib/community/auth';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        group: true,
        likes: { select: { userId: true } },
        comments: { select: { id: true } },
      },
    });

    if (!post || post.deletedAt) {
      return fail(404, ErrorCode.NOT_FOUND, 'Post não encontrado');
    }

    const viewer = await getViewer();
    return ok(postToDto(post, viewer?.id ?? null));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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
        'Você precisa estar logado para editar'
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = UpdatePostSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const updated = await updatePost({
      postId: id,
      authorId: viewer.id,
      data: parsed.data,
    });

    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
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
        'Você precisa estar logado para deletar'
      );
    }

    await deletePost({ postId: id, authorId: viewer.id });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}