// ============================================================================
// GET /api/articles/featured — Artigos em destaque (Wave 29)
// ============================================================================
// Estratégia: combina "HIGH evidence + recentes" com "mais vistos + mais
// salvos". Para a home do /library e para integração com a home principal.
//
// Lógica:
//   - 4 artigos HIGH evidence (random entre top 20 do ano corrente e anterior)
//   - 3 artigos "trending" (mix de viewCount + bookmarkCount + citations)
//   - 2 artigos "editor's pick" (source=manual* ou curatedBy não-nulo)
//
// Cache: s-maxage=120, swr=600 (conteúdo curado muda devagar).
// ============================================================================

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CURRENT_YEAR = new Date().getFullYear();
const MAX_LIMIT = 10;

interface FeaturedArticle {
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
  /** Categoria interna: 'evidence' | 'trending' | 'editorial' */
  featuredReason: 'evidence' | 'trending' | 'editorial';
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const requestedLimit = Math.min(
      Math.max(Number(sp.get('limit') ?? 9), 1),
      MAX_LIMIT
    );

    // 1) HIGH evidence (últimos 2 anos) — ouro científico
    const evidenceRows = await prisma.article.findMany({
      where: {
        evidenceLevel: 'HIGH',
        year: { gte: CURRENT_YEAR - 2 },
      },
      orderBy: [{ citations: 'desc' }, { viewCount: 'desc' }, { id: 'asc' }],
      take: 20,
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
      },
    });

    // 2) Trending — mais vistos + salvos + citados (últimos 5 anos)
    const trendingRows = await prisma.$queryRaw<
      Array<{
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
      }>
    >(Prisma.sql`
      SELECT id, slug, title, summary, type::text AS type,
             "evidenceLevel"::text AS "evidenceLevel", tradition, tags, authors,
             year, "viewCount", "bookmarkCount", citations
      FROM articles
      WHERE year >= ${CURRENT_YEAR - 5}
        AND ("viewCount" > 0 OR "bookmarkCount" > 0 OR citations > 0)
      ORDER BY ("viewCount" + "bookmarkCount" * 3 + citations * 2) DESC,
               id DESC
      LIMIT 20
    `);

    // 3) Editorial — curadoria humana (curatedBy não-nulo OU source manual)
    const editorialRows = await prisma.article.findMany({
      where: {
        OR: [
          { curatedBy: { not: null } },
          { source: { startsWith: 'manual' } },
        ],
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: 10,
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
      },
    });

    // Merge com ordem de prioridade: editorial → evidence → trending
    // Deduplica por id; cap final em `requestedLimit`.
    const seen = new Set<string>();
    const merged: FeaturedArticle[] = [];

    const pushBatched = (
      rows: typeof editorialRows,
      reason: FeaturedArticle['featuredReason']
    ) => {
      for (const r of rows) {
        if (merged.length >= requestedLimit) break;
        if (seen.has(r.id)) continue;
        seen.add(r.id);
        merged.push({
          id: r.id,
          slug: r.slug,
          title: r.title,
          summary: r.summary,
          type: r.type,
          evidenceLevel: r.evidenceLevel,
          tradition: r.tradition,
          tags: r.tags,
          authors: r.authors,
          year: r.year,
          viewCount: r.viewCount,
          bookmarkCount: r.bookmarkCount,
          citations: r.citations,
          featuredReason: reason,
        });
      }
    };

    pushBatched(editorialRows, 'editorial');
    pushBatched(evidenceRows, 'evidence');
    pushBatched(trendingRows, 'trending');

    return ok(
      { articles: merged, total: merged.length },
      {
        meta: { limit: requestedLimit, year: CURRENT_YEAR },
        cache: { sMaxage: 120, staleWhileRevalidate: 600 },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}

// 405 para mutações
export async function POST() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}
export async function PUT() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}
export async function DELETE() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}