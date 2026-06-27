'use server';

// ============================================================================
// SERVER ACTIONS — POSTS / COMMENTS / LIKES
// ============================================================================
// Mutações server-side que podem ser chamadas direto de Client Components
// sem precisar fazer fetch manual. As actions revalidam a rota /feed.
// ============================================================================

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  CreatePostSchema,
  UpdatePostSchema,
  CreateCommentSchema,
  type CreatePostInput,
  type UpdatePostInput,
  type CreateCommentInput,
} from '@/lib/validators/posts';
import {
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  createComment,
  postToDto,
  commentToDto,
  PostNotFoundError,
  PostForbiddenError,
} from '@/lib/community/posts';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { checkPostRateLimit } from '@/lib/community/rate-limit';
import { prisma } from '@/lib/prisma';

// ============================================================================
// TYPES
// ============================================================================

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]>; code?: number };

function fieldErrorsFromZod(err: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join('.') || '_';
    if (!out[path]) out[path] = [];
    out[path].push(issue.message);
  }
  return out;
}

function errorFromUnknown(err: unknown): {
  error: string;
  code?: number;
  statusCode?: number;
} {
  if (err instanceof PostNotFoundError) return { error: err.message, code: 404 };
  if (err instanceof PostForbiddenError) return { error: err.message, code: 403 };
  if (err instanceof Error) {
    const statusCode = (err as Error & { statusCode?: number }).statusCode;
    return { error: err.message, code: statusCode ?? 500 };
  }
  return { error: 'Erro inesperado', code: 500 };
}

// ============================================================================
// CREATE POST
// ============================================================================

export async function createPostAction(
  input: CreatePostInput
): Promise<ActionResult<Awaited<ReturnType<typeof createPost>>>> {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    return { ok: false, error: e.message ?? 'Não autenticado', code: e.statusCode ?? 401 };
  }

  const rl = checkPostRateLimit(viewer.id);
  if (!rl.allowed) {
    return {
      ok: false,
      error: `Você está postando rápido demais. Tente novamente em ${Math.ceil(rl.resetIn / 1000)}s.`,
      code: 429,
    };
  }

  const parsed = CreatePostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dados inválidos',
      fieldErrors: fieldErrorsFromZod(parsed.error),
      code: 400,
    };
  }

  try {
    const post = await createPost({
      authorId: viewer.id,
      content: parsed.data.content,
      type: parsed.data.type,
      tradition: parsed.data.tradition ?? null,
      topic: parsed.data.topic ?? null,
      groupSlug: parsed.data.groupSlug ?? null,
      mediaUrls: parsed.data.mediaUrls ?? [],
      references: parsed.data.references ?? null,
    });

    revalidatePath('/feed');
    return { ok: true, data: post };
  } catch (err) {
    const e = errorFromUnknown(err);
    return { ok: false, error: e.error, code: e.code };
  }
}

// ============================================================================
// UPDATE POST
// ============================================================================

export async function updatePostAction(
  postId: string,
  input: UpdatePostInput
): Promise<ActionResult<Awaited<ReturnType<typeof updatePost>>>> {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    return { ok: false, error: e.message ?? 'Não autenticado', code: e.statusCode ?? 401 };
  }

  const parsed = UpdatePostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dados inválidos',
      fieldErrors: fieldErrorsFromZod(parsed.error),
      code: 400,
    };
  }

  try {
    const post = await updatePost({
      postId,
      authorId: viewer.id,
      data: parsed.data,
    });

    revalidatePath('/feed');
    revalidatePath(`/post/${postId}`);
    return { ok: true, data: post };
  } catch (err) {
    const e = errorFromUnknown(err);
    return { ok: false, error: e.error, code: e.code };
  }
}

// ============================================================================
// DELETE POST
// ============================================================================

export async function deletePostAction(
  postId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    return { ok: false, error: e.message ?? 'Não autenticado', code: e.statusCode ?? 401 };
  }

  try {
    await deletePost({ postId, authorId: viewer.id });
    revalidatePath('/feed');
    return { ok: true, data: { deleted: true } };
  } catch (err) {
    const e = errorFromUnknown(err);
    return { ok: false, error: e.error, code: e.code };
  }
}

// ============================================================================
// LIKE POST (toggle)
// ============================================================================

export async function toggleLikeAction(
  postId: string
): Promise<ActionResult<{ liked: boolean; likesCount: number }>> {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    return { ok: false, error: e.message ?? 'Não autenticado', code: e.statusCode ?? 401 };
  }

  try {
    const result = await toggleLike({ postId, userId: viewer.id });
    revalidatePath('/feed');
    return { ok: true, data: result };
  } catch (err) {
    const e = errorFromUnknown(err);
    return { ok: false, error: e.error, code: e.code };
  }
}

// ============================================================================
// CREATE COMMENT
// ============================================================================

export async function createCommentAction(
  postId: string,
  input: CreateCommentInput
): Promise<ActionResult<Awaited<ReturnType<typeof createComment>>>> {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    return { ok: false, error: e.message ?? 'Não autenticado', code: e.statusCode ?? 401 };
  }

  const parsed = CreateCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dados inválidos',
      fieldErrors: fieldErrorsFromZod(parsed.error),
      code: 400,
    };
  }

  try {
    const comment = await createComment({
      postId,
      authorId: viewer.id,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
    });

    revalidatePath('/feed');
    revalidatePath(`/post/${postId}`);
    return { ok: true, data: comment };
  } catch (err) {
    const e = errorFromUnknown(err);
    return { ok: false, error: e.error, code: e.code };
  }
}

// ============================================================================
// SERVER-ONLY QUERIES (usado em Server Components)
// ============================================================================

/**
 * Loader para Server Components. Retorna o feed paginado usando o viewer
 * da request atual. Cacheado pelo Next por padrão.
 */
export async function getFeedServer(input: {
  cursor?: string;
  limit?: number;
  tradition?: string;
  topic?: string;
}) {
  const viewer = await getViewer();
  const where = {
    deletedAt: null,
    ...(input.tradition ? { tradition: input.tradition } : {}),
    ...(input.topic ? { topic: input.topic } : {}),
  };

  const rows = await prisma.post.findMany({
    where,
    include: {
      group: true,
      likes: { select: { userId: true } },
      comments: { select: { id: true } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: input.limit ?? 20,
    ...(input.cursor
      ? {
          skip: 1,
          cursor: { id: input.cursor },
        }
      : {}),
  });

  return rows.map((p) => postToDto(p, viewer?.id ?? null));
}