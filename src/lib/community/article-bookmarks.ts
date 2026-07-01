// ============================================================================
// COMMUNITY ARTICLE BOOKMARKS — "Salvar artigos para ler depois" (Wave 29)
// ============================================================================
// Wrapper sobre o modelo Bookmark existente (Prisma schema).
// Wave 29 — Knowledge Base architecture. Não duplica modelo: usa Bookmark
// que já tem articleId (vide prisma/schema.prisma linha 883).
//
// Decisões:
//   - toggle: delete-if-exists + insert. Idempotente via @@unique.
//   - list: retorna artigos salvos pelo user (com DTO + meta).
//   - isBookmarked: checagem rápida para UI.
// ============================================================================

import { prisma } from '@/lib/prisma';

// Inline reading time helper (não depende de export privado em articles.ts).
// 200 palavras/minuto é a média usada pela maioria dos sites de leitura.
function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

// ============================================================================
// Toggle bookmark
// ============================================================================

export interface ToggleArticleBookmarkInput {
  userId: string;
  articleId: string;
}

export interface ToggleArticleBookmarkResult {
  bookmarked: boolean;
  bookmarkCount: number;
}

export async function toggleArticleBookmark(
  input: ToggleArticleBookmarkInput
): Promise<ToggleArticleBookmarkResult> {
  const article = await prisma.article.findUnique({
    where: { id: input.articleId },
    select: { id: true, publishedAt: true, bookmarkCount: true },
  });
  if (!article) {
    const err = new Error('Artigo não encontrado');
    (err as Error & { name: string }).name = 'NotFoundError';
    throw err;
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_articleId: {
        userId: input.userId,
        articleId: input.articleId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    const updated = await prisma.article.update({
      where: { id: input.articleId },
      data: { bookmarkCount: { decrement: 1 } },
      select: { bookmarkCount: true },
    });
    // Garante floor 0 (concorrência pode ter deixado negativo em race raro)
    const safeCount = Math.max(0, updated.bookmarkCount);
    if (safeCount !== updated.bookmarkCount) {
      await prisma.article.update({
        where: { id: input.articleId },
        data: { bookmarkCount: safeCount },
      });
    }
    return { bookmarked: false, bookmarkCount: safeCount };
  }

  await prisma.bookmark.create({
    data: {
      userId: input.userId,
      articleId: input.articleId,
    },
  });
  const updated = await prisma.article.update({
    where: { id: input.articleId },
    data: { bookmarkCount: { increment: 1 } },
    select: { bookmarkCount: true },
  });
  return { bookmarked: true, bookmarkCount: updated.bookmarkCount };
}

// ============================================================================
// List bookmarks
// ============================================================================

export interface ArticleBookmarkItem {
  bookmarkId: string;
  bookmarkedAt: string;
  article: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    type: string;
    evidenceLevel: string;
    tradition: string | null;
    tags: string[];
    authors: string[];
    year: number;
    viewCount: number;
    bookmarkCount: number;
    citations: number;
    readingTimeMinutes: number;
  };
}

export async function listArticleBookmarks(input: {
  userId: string;
  limit?: number;
}): Promise<{ items: ArticleBookmarkItem[]; total: number }> {
  const limit = Math.min(Math.max(input.limit ?? 30, 1), 100);

  const rows = await prisma.bookmark.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const articleIds = rows.map((r) => r.articleId);
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      type: true,
      evidenceLevel: true,
      tradition: true,
      tags: true,
      authors: true,
      year: true,
      viewCount: true,
      bookmarkCount: true,
      citations: true,
      content: true,
    },
  });
  const articleMap = new Map(articles.map((a) => [a.id, a]));

  const items: ArticleBookmarkItem[] = rows
    .map((r) => {
      const a = articleMap.get(r.articleId);
      if (!a) return null;
      return {
        bookmarkId: r.id,
        bookmarkedAt: r.createdAt.toISOString(),
        article: {
          id: a.id,
          slug: a.slug,
          title: a.title,
          summary: a.summary,
          type: a.type,
          evidenceLevel: a.evidenceLevel,
          tradition: a.tradition,
          tags: a.tags,
          authors: a.authors,
          year: a.year,
          viewCount: a.viewCount,
          bookmarkCount: a.bookmarkCount,
          citations: a.citations,
          readingTimeMinutes: estimateReadingTime(a.content ?? a.summary),
        },
      };
    })
    .filter((x): x is ArticleBookmarkItem => x !== null);

  return { items, total: items.length };
}

// ============================================================================
// Is bookmarked (checagem rápida)
// ============================================================================

export async function isArticleBookmarked(input: {
  userId: string;
  articleId: string;
}): Promise<boolean> {
  const row = await prisma.bookmark.findUnique({
    where: {
      userId_articleId: {
        userId: input.userId,
        articleId: input.articleId,
      },
    },
    select: { id: true },
  });
  return row !== null;
}

// ============================================================================
// List bookmarked slugs (batch)
// ============================================================================

export async function listBookmarkedArticleIds(input: {
  userId: string;
  articleIds: string[];
}): Promise<Set<string>> {
  if (input.articleIds.length === 0) return new Set();
  const rows = await prisma.bookmark.findMany({
    where: {
      userId: input.userId,
      articleId: { in: input.articleIds },
    },
    select: { articleId: true },
  });
  return new Set(rows.map((r) => r.articleId));
}