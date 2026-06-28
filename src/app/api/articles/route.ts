// ============================================================================
// GET /api/articles — Lista artigos da Biblioteca Akasha (Wave 21)
// ============================================================================
// Query params:
//   q               — full-text + trigram (Wave 18)
//   tradition       — slug canônico (cabala, ifa, tantra, ...)
//   tag             — match em tags[]
//   level           — ANECDOTAL | LOW | MEDIUM | HIGH
//   format          — SCIENTIFIC_PAPER | BOOK | VIDEO | PODCAST | ESSAY | MAGAZINE_ARTICLE
//   author          — author name (LIKE em authors[])
//   yearFrom/yearTo — janela temporal por ano
//   cursor, limit   — paginação cursor (limit default 20, max 50)
//   sort            — recent | popular | most-viewed | most-bookmarked | most-cited
//
// Resposta: { data: { articles, nextCursor, total }, meta }
// Cache: s-maxage=60, swr=300 (Wave 11 perf).
// ============================================================================

import { NextRequest } from 'next/server';
import { ArticleListQuerySchema } from '@/lib/validators/articles';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { listArticles } from '@/lib/community/articles';

export const runtime = 'nodejs'; // raw SQL com Prisma
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const parsed = ArticleListQuerySchema.safeParse({
      q: sp.get('q') ?? undefined,
      tradition: sp.get('tradition') ?? undefined,
      tag: sp.get('tag') ?? undefined,
      level: sp.get('level') ?? undefined,
      format: sp.get('format') ?? undefined,
      author: sp.get('author') ?? undefined,
      yearFrom: sp.get('yearFrom') ?? undefined,
      yearTo: sp.get('yearTo') ?? undefined,
      cursor: sp.get('cursor') ?? undefined,
      limit: sp.get('limit') ?? undefined,
      sort: sp.get('sort') ?? undefined,
    });

    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const result = await listArticles(parsed.data);

    return ok(result, {
      meta: {
        nextCursor: result.nextCursor,
        total: result.total,
        count: result.articles.length,
      },
      cache: {
        sMaxage: 60,
        staleWhileRevalidate: 300,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

// 405 para outros métodos
export async function POST() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}