// ============================================================================
// COMMUNITY POSTS — Backend helpers (Prisma → API DTO mapping, queries)
// ============================================================================
// Funções que ficam entre os route handlers/server actions e o Prisma.
// Centralizam: queries, transformações, cursor pagination.
// ============================================================================

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Post, Author, PostReference, Comment } from '@/types/community';
import type { FeedQuery } from '@/lib/validators/posts';

// ============================================================================
// DTO mapping
// ============================================================================

type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    group: true;
    likes: { select: { userId: true } };
    comments: { select: { id: true } };
  };
}>;

type CommentWithReplies = Prisma.CommentGetPayload<{
  include: {
    likes: { select: { userId: true } };
  };
}>;

/**
 * Converte Post do Prisma para o DTO da API. Adiciona flags por usuário
 * (liked, bookmarked) quando o viewerId é informado.
 */
export function postToDto(
  post: PostWithRelations,
  viewerId?: string | null
): Post {
  const liked = viewerId
    ? post.likes.some((l) => l.userId === viewerId)
    : false;

  const initials = post.authorId
    ? post.authorId.slice(0, 2).toUpperCase()
    : 'AN';

  return {
    id: post.id,
    author: {
      id: post.authorId,
      handle: post.authorId,
      displayName: extractDisplayName(post.authorId),
      avatarUrl: null,
      spiritualTag: null,
      orixa: null,
      // Para evitar placeholder poluído, geramos um initials no client
      // usando displayName via post.authorId; nada de mock no server.
      ...(false && { __initials: initials }),
    } as Author,
    content: post.content,
    type: post.type,
    tradition: post.tradition ?? null,
    topic: post.topic ?? null,
    groupName: post.group?.name ?? null,
    groupSlug: post.group?.slug ?? null,
    mediaUrls: post.mediaUrls,
    references: (post.references as unknown as PostReference[]) ?? [],
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    sharesCount: post.sharesCount,
    liked,
    bookmarked: false,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

/**
 * Em produção, buscaríamos o perfil espiritual via SpiritualProfile.
 * Para o MVP, geramos um handle estável a partir do authorId. O frontend pode
 * usar `/u/[handle]` que futuramente vai bater na API de usuários.
 */
function extractDisplayName(authorId: string): string {
  // Heurística simples: pega os primeiros 8 chars
  if (!authorId) return 'Anônimo';
  return `Membro ${authorId.slice(-4)}`;
}

export function commentToDto(
  comment: CommentWithReplies,
  viewerId?: string | null
): Comment {
  return {
    id: comment.id,
    postId: comment.postId,
    author: {
      id: comment.authorId,
      handle: comment.authorId,
      displayName: extractDisplayName(comment.authorId),
    },
    content: comment.content,
    parentId: comment.parentId ?? null,
    likesCount: comment.likesCount,
    liked: viewerId ? comment.likes.some((l) => l.userId === viewerId) : false,
    createdAt: comment.createdAt.toISOString(),
  };
}

// ============================================================================
// Feed query — cursor pagination
// ============================================================================

export interface FeedResult {
  posts: Post[];
  nextCursor: string | null;
  total: number;
}

export async function getFeed(
  query: FeedQuery,
  viewerId?: string | null
): Promise<FeedResult> {
  const { cursor, limit = 20, tradition, topic, authorId, groupSlug } = query;

  const where: Prisma.PostWhereInput = {
    deletedAt: null,
  };

  if (tradition) where.tradition = tradition;
  if (topic) where.topic = topic;
  if (authorId) where.authorId = authorId;
  if (groupSlug) where.group = { slug: groupSlug };

  if (cursor) {
    // cursor = base64({createdAt, id})
    const decoded = decodeCursor(cursor);
    if (decoded) {
      where.OR = [
        { createdAt: { lt: decoded.createdAt } },
        {
          AND: [
            { createdAt: decoded.createdAt },
            { id: { lt: decoded.id } },
          ],
        },
      ];
    }
  }

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        group: true,
        likes: { select: { userId: true } },
        comments: { select: { id: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    }),
    prisma.post.count({ where: { deletedAt: null, ...where, OR: undefined } }),
  ]);

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore
    ? encodeCursor({
        createdAt: slice[slice.length - 1]!.createdAt,
        id: slice[slice.length - 1]!.id,
      })
    : null;

  return {
    posts: slice.map((p) => postToDto(p, viewerId)),
    nextCursor,
    total,
  };
}

// ============================================================================
// Cursor helpers
// ============================================================================

export interface Cursor {
  createdAt: Date;
  id: string;
}

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(
    JSON.stringify({ t: cursor.createdAt.toISOString(), i: cursor.id })
  ).toString('base64url');
}

export function decodeCursor(raw: string): Cursor | null {
  try {
    const json = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!json || typeof json.t !== 'string' || typeof json.i !== 'string') {
      return null;
    }
    return { createdAt: new Date(json.t), id: json.i };
  } catch {
    return null;
  }
}

// ============================================================================
// Per-user mutations
// ============================================================================

export async function createPost(input: {
  authorId: string;
  content: string;
  type?: 'TEXT' | 'LINK' | 'ARTICLE' | 'QUESTION' | 'EXPERIENCE' | 'PRACTICE';
  tradition?: string | null;
  topic?: string | null;
  groupSlug?: string | null;
  mediaUrls?: string[];
  references?: unknown;
}) {
  let groupId: string | null = null;
  if (input.groupSlug) {
    const group = await prisma.group.findUnique({
      where: { slug: input.groupSlug },
      select: { id: true },
    });
    groupId = group?.id ?? null;
  }

  const post = await prisma.post.create({
    data: {
      authorId: input.authorId,
      content: input.content,
      type: input.type ?? 'TEXT',
      tradition: input.tradition ?? null,
      topic: input.topic ?? null,
      mediaUrls: input.mediaUrls ?? [],
      references: (input.references as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      groupId,
    },
    include: {
      group: true,
      likes: { select: { userId: true } },
      comments: { select: { id: true } },
    },
  });

  // Best-effort: dispara notificações para membros do grupo + atualiza contador
  if (groupId) {
    try {
      const { notifyGroupOnNewPost } = await import('@/lib/community/notifications');
      await notifyGroupOnNewPost({
        groupId,
        postId: post.id,
        authorId: input.authorId,
      });
      await prisma.group.update({
        where: { id: groupId },
        data: { postsCount: { increment: 1 } },
      });
    } catch {
      // best-effort; não bloqueia criação do post
    }
  }

  return postToDto(post, input.authorId);
}

export async function updatePost(input: {
  postId: string;
  authorId: string;
  data: {
    content?: string;
    type?: 'TEXT' | 'LINK' | 'ARTICLE' | 'QUESTION' | 'EXPERIENCE' | 'PRACTICE';
    tradition?: string | null;
    topic?: string | null;
    mediaUrls?: string[];
    references?: unknown;
  };
}) {
  const existing = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { authorId: true, deletedAt: true },
  });

  if (!existing || existing.deletedAt) {
    throw new PostNotFoundError();
  }
  if (existing.authorId !== input.authorId) {
    throw new PostForbiddenError();
  }

  const post = await prisma.post.update({
    where: { id: input.postId },
    data: {
      content: input.data.content,
      type: input.data.type,
      tradition: input.data.tradition ?? undefined,
      topic: input.data.topic ?? undefined,
      mediaUrls: input.data.mediaUrls,
      references:
        input.data.references !== undefined
          ? (input.data.references as Prisma.InputJsonValue)
          : undefined,
    },
    include: {
      group: true,
      likes: { select: { userId: true } },
      comments: { select: { id: true } },
    },
  });

  return postToDto(post, input.authorId);
}

export async function deletePost(input: { postId: string; authorId: string }) {
  const existing = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { authorId: true, deletedAt: true },
  });

  if (!existing || existing.deletedAt) {
    throw new PostNotFoundError();
  }
  if (existing.authorId !== input.authorId) {
    throw new PostForbiddenError();
  }

  await prisma.post.update({
    where: { id: input.postId },
    data: { deletedAt: new Date() },
  });
}

export async function toggleLike(input: { postId: string; userId: string }) {
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, deletedAt: true },
  });
  if (!post || post.deletedAt) throw new PostNotFoundError();

  const existing = await prisma.like.findUnique({
    where: {
      userId_postId: { userId: input.userId, postId: input.postId },
    },
  });

  let liked: boolean;
  if (existing) {
    await prisma.like.delete({
      where: {
        userId_postId: { userId: input.userId, postId: input.postId },
      },
    });
    await prisma.post.update({
      where: { id: input.postId },
      data: { likesCount: { decrement: 1 } },
    });
    liked = false;
  } else {
    await prisma.like.create({
      data: { userId: input.userId, postId: input.postId },
    });
    await prisma.post.update({
      where: { id: input.postId },
      data: { likesCount: { increment: 1 } },
    });
    liked = true;
  }

  const fresh = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { likesCount: true },
  });

  return { liked, likesCount: fresh?.likesCount ?? 0 };
}

// ============================================================================
// Comments
// ============================================================================

export async function listComments(input: {
  postId: string;
  viewerId?: string | null;
  cursor?: string;
  limit: number;
  parentId?: string | null;
}) {
  const where: Prisma.CommentWhereInput = {
    postId: input.postId,
    deletedAt: null,
    parentId: input.parentId ?? null,
  };

  if (input.cursor) {
    const decoded = decodeCursor(input.cursor);
    if (decoded) {
      where.OR = [
        { createdAt: { lt: decoded.createdAt } },
        {
          AND: [
            { createdAt: decoded.createdAt },
            { id: { lt: decoded.id } },
          ],
        },
      ];
    }
  }

  const rows = await prisma.comment.findMany({
    where,
    include: { likes: { select: { userId: true } } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: input.limit + 1,
  });

  const hasMore = rows.length > input.limit;
  const slice = hasMore ? rows.slice(0, input.limit) : rows;
  const nextCursor = hasMore
    ? encodeCursor({
        createdAt: slice[slice.length - 1]!.createdAt,
        id: slice[slice.length - 1]!.id,
      })
    : null;

  return {
    comments: slice.map((c) => commentToDto(c, input.viewerId)),
    nextCursor,
  };
}

export async function createComment(input: {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
}) {
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, deletedAt: true },
  });
  if (!post || post.deletedAt) throw new PostNotFoundError();

  if (input.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { postId: true },
    });
    if (!parent || parent.postId !== input.postId) {
      throw new ValidationError('parentId inválido');
    }
  }

  const comment = await prisma.comment.create({
    data: {
      postId: input.postId,
      authorId: input.authorId,
      content: input.content,
      parentId: input.parentId ?? null,
    },
    include: { likes: { select: { userId: true } } },
  });

  // Increment commentsCount on parent post
  await prisma.post.update({
    where: { id: input.postId },
    data: { commentsCount: { increment: 1 } },
  });

  return commentToDto(comment, input.authorId);
}

// ============================================================================
// Errors
// ============================================================================

export class PostNotFoundError extends Error {
  constructor() {
    super('Post não encontrado');
    this.name = 'PostNotFoundError';
  }
}
export class PostForbiddenError extends Error {
  constructor() {
    super('Você não tem permissão para esta ação');
    this.name = 'PostForbiddenError';
  }
}
export class ValidationError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'ValidationError';
  }
}