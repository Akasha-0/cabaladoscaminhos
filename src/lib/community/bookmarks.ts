// ============================================================================
// COMMUNITY POST BOOKMARKS + READING HISTORY
// ============================================================================
// Backend helpers para as features de "salvar para ler depois" e histórico
// de leitura pessoal. Mantém a lógica entre o Prisma e os route handlers.
//
// Decisões de design:
//   - "collectionName" é opcional. Vazio / null / 'default' são normalizados
//     para 'default' para garantir unicidade coerente.
//   - "toggle" = delete-if-exists + insert. Idempotente via @@unique.
//   - "read" = upsert (last-write-wins). percentRead sempre cresce
//     monotônico (não regredimos a barra de progresso).
//   - "history" retorna até `limit` posts lidos recentemente, ordenados
//     por readAt desc. Inclui join com Post (somente campos públicos).
// ============================================================================

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Post } from '@/types/community';
import { postToDto } from './posts';

const DEFAULT_COLLECTION = 'default';
const MAX_COLLECTION_NAME = 60;
const MAX_PERCENT = 100;
const MIN_PERCENT = 0;
const HISTORY_DEFAULT_LIMIT = 30;
const HISTORY_MAX_LIMIT = 100;

// ============================================================================
// Helpers internos
// ============================================================================

function normalizeCollection(name?: string | null): string {
  if (!name) return DEFAULT_COLLECTION;
  const trimmed = name.trim().toLowerCase();
  if (trimmed.length === 0) return DEFAULT_COLLECTION;
  if (trimmed.length > MAX_COLLECTION_NAME) {
    return trimmed.slice(0, MAX_COLLECTION_NAME);
  }
  return trimmed;
}

function clampPercent(n: unknown): number {
  const num = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  if (num < MIN_PERCENT) return MIN_PERCENT;
  if (num > MAX_PERCENT) return MAX_PERCENT;
  return Math.round(num);
}

// ============================================================================
// Bookmarks
// ============================================================================

/**
 * Toggle: se já existe bookmark (userId, postId, collection) → remove;
 * caso contrário → cria. Retorna o estado final (bookmarked) e o total do
 * post (bookmarksCount não é denormalizado, então calculamos on-demand).
 */
export async function togglePostBookmark(input: {
  userId: string;
  postId: string;
  collectionName?: string | null;
}) {
  const collectionName = normalizeCollection(input.collectionName);

  // Confirma que o post existe (e não está soft-deleted) — FK cascade
  // não filtra deletedAt, então checamos manualmente.
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, deletedAt: true },
  });
  if (!post || post.deletedAt) {
    const err = new Error('Post não encontrado');
    (err as Error & { name: string }).name = 'PostNotFoundError';
    throw err;
  }

  const existing = await prisma.postBookmark.findUnique({
    where: {
      userId_postId_collectionName: {
        userId: input.userId,
        postId: input.postId,
        collectionName,
      },
    },
  });

  if (existing) {
    await prisma.postBookmark.delete({
      where: { id: existing.id },
    });
    return { bookmarked: false, collectionName };
  }

  await prisma.postBookmark.create({
    data: {
      userId: input.userId,
      postId: input.postId,
      collectionName,
    },
  });
  return { bookmarked: true, collectionName };
}

/**
 * Remove bookmark (userId, postId, collection). Idempotente: se não
 * existir, retorna { removed: false } sem erro.
 */
export async function removePostBookmark(input: {
  userId: string;
  postId: string;
  collectionName?: string | null;
}) {
  const collectionName = normalizeCollection(input.collectionName);
  const existing = await prisma.postBookmark.findUnique({
    where: {
      userId_postId_collectionName: {
        userId: input.userId,
        postId: input.postId,
        collectionName,
      },
    },
  });
  if (!existing) return { removed: false, collectionName };

  await prisma.postBookmark.delete({ where: { id: existing.id } });
  return { removed: true, collectionName };
}

type BookmarkWithPost = Prisma.PostBookmarkGetPayload<{
  include: Record<string, never>;
}>;

/**
 * Lista os bookmarks do usuário, opcionalmente filtrando por collection.
 * Retorna os posts (DTO) e o agrupamento por collection pra UI.
 */
export async function listPostBookmarks(input: {
  userId: string;
  collectionName?: string | null;
  limit?: number;
}): Promise<{
  items: Array<{ bookmarkId: string; post: Post; collectionName: string; createdAt: string }>;
  collections: Array<{ name: string; count: number }>;
  total: number;
}> {
  const limit = Math.min(
    Math.max(input.limit ?? HISTORY_DEFAULT_LIMIT, 1),
    HISTORY_MAX_LIMIT
  );

  // Filtro de collection opcional
  const where: Prisma.PostBookmarkWhereInput = { userId: input.userId };
  if (input.collectionName !== undefined && input.collectionName !== null) {
    where.collectionName = normalizeCollection(input.collectionName);
  }

  // 1. Lista os bookmarks (sem relation — Post não está relacionado no Prisma)
  const bookmarks = await prisma.postBookmark.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // 2. Carrega os posts correspondentes
  const postIds = bookmarks.map((b: any) => b.postId);
  const posts = await prisma.post.findMany({
    where: { id: { in: postIds }, deletedAt: null },
    include: {
      group: true,
      likes: { select: { userId: true } },
      comments: { select: { id: true } },
    },
  });
  const postMap = new Map(posts.map((p) => [p.id, p]));

  // 3. Conta por collection (para o sidebar da página /me/bookmarks)
  const grouped = await prisma.postBookmark.groupBy({
    by: ['collectionName'],
    where: { userId: input.userId },
    _count: { _all: true },
  });
  const collections = grouped
    .map((g: any) => ({ name: g.collectionName, count: g._count._all }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  // 4. Mapeia para DTO
  const items = (
    await Promise.all(
      bookmarks.map(async (b: any) => {
        const p = postMap.get(b.postId);
        if (!p) return null; // post foi deletado
        return {
          bookmarkId: b.id,
          post: await postToDto(p, input.userId),
          collectionName: b.collectionName,
          createdAt: b.createdAt.toISOString(),
        };
      })
    )
  ).filter((x: any): x is NonNullable<typeof x> => x !== null);

  return {
    items,
    collections,
    total: items.length,
  };
}

// ============================================================================
// Reading History
// ============================================================================

/**
 * Registra/atualiza o progresso de leitura. Idempotente via upsert em
 * (userId, postId). percentRead nunca regride (regra de negócio: o usuário
 * não "perde" progresso).
 */
export async function trackPostRead(input: {
  userId: string;
  postId: string;
  percentRead?: number;
}) {
  const percentRead = clampPercent(input.percentRead ?? 0);

  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, deletedAt: true },
  });
  if (!post || post.deletedAt) {
    const err = new Error('Post não encontrado');
    (err as Error & { name: string }).name = 'PostNotFoundError';
    throw err;
  }

  // Upsert: se já existe, manter o maior percentRead (não regredir)
  const existing = await prisma.readingHistory.findUnique({
    where: {
      userId_postId: { userId: input.userId, postId: input.postId },
    },
  });

  if (existing) {
    const finalPercent = Math.max(existing.percentRead, percentRead);
    const updated = await prisma.readingHistory.update({
      where: { id: existing.id },
      data: { percentRead: finalPercent, readAt: new Date() },
    });
    return {
      postId: updated.postId,
      percentRead: updated.percentRead,
      readAt: updated.readAt.toISOString(),
    };
  }

  const created = await prisma.readingHistory.create({
    data: {
      userId: input.userId,
      postId: input.postId,
      percentRead,
    },
  });
  return {
    postId: created.postId,
    percentRead: created.percentRead,
    readAt: created.readAt.toISOString(),
  };
}

/**
 * Lista o histórico pessoal de leituras, mais recente primeiro. Inclui
 * o post (DTO) e o percentRead. Soft-deleted posts são filtrados.
 */
export async function listReadingHistory(input: {
  userId: string;
  limit?: number;
}): Promise<{
  items: Array<{ post: Post; percentRead: number; readAt: string }>;
  total: number;
}> {
  const limit = Math.min(
    Math.max(input.limit ?? HISTORY_DEFAULT_LIMIT, 1),
    HISTORY_MAX_LIMIT
  );

  const rows = await prisma.readingHistory.findMany({
    where: { userId: input.userId },
    orderBy: { readAt: 'desc' },
    take: limit,
  });

  const postIds = rows.map((r: any) => r.postId);
  const posts = await prisma.post.findMany({
    where: { id: { in: postIds }, deletedAt: null },
    include: {
      group: true,
      likes: { select: { userId: true } },
      comments: { select: { id: true } },
    },
  });
  const postMap = new Map(posts.map((p) => [p.id, p]));

  const items = (
    await Promise.all(
      rows.map(async (r: any) => {
        const p = postMap.get(r.postId);
        if (!p) return null;
        return {
          post: await postToDto(p, input.userId),
          percentRead: r.percentRead,
          readAt: r.readAt.toISOString(),
        };
      })
    )
  ).filter((x: any): x is NonNullable<typeof x> => x !== null);

  return { items, total: items.length };
}
