// ============================================================================
// GET /api/search — Busca unificada (Onda 12 + Wave 18)
// ============================================================================
// Tipos: all, posts, articles, users, groups, tags
// Query params:
//   q               — query obrigatória
//   type            — escopo (all|posts|articles|users|groups|tags)
//   cursor, limit   — paginação cursor
//   tradition       — slug canônico (cabala, ifa, tantra, ...)
//   tag             — topic (posts) ou tag (articles)
//   level           — ANECDOTAL | LOW | MEDIUM | HIGH (articles only)
//   format          — SCIENTIFIC_PAPER | BOOK | VIDEO | ... (articles only)
//   author          — author name (articles only)
//   dateFrom/dateTo — janela temporal (alias semântico)
//   from/to         — janela temporal (legado, mantido p/ compat)
//   hasAudio/hasVideo — boolean (Wave 18)
//   sort            — relevance | recent | popular
// Resposta: { data: SearchResults, meta }
// ============================================================================

import { NextRequest } from 'next/server';
import { SearchQuerySchema } from '@/lib/validators/search';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { search } from '@/lib/community/search';

// ============================================================================
// Caching strategy — ISR with 60-second TTL (per query key)
// ============================================================================
// Search results depend on the query string + filters; Next.js keys the
// cache per unique request. 60s is a sweet spot for "fresh enough, fast
// enough" — the same query hitting the same results within a minute is a
// common pattern during exploration sessions.
// ============================================================================
export const revalidate = 60;
export const runtime = 'nodejs';   // precisa de $queryRaw com Prisma

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const parsed = SearchQuerySchema.safeParse({
      q: sp.get('q') ?? '',
      type: sp.get('type') ?? undefined,
      cursor: sp.get('cursor') ?? undefined,
      limit: sp.get('limit') ?? undefined,
      tradition: sp.get('tradition') ?? undefined,
      tag: sp.get('tag') ?? undefined,
      level: sp.get('level') ?? undefined,
      format: sp.get('format') ?? undefined,
      author: sp.get('author') ?? undefined,
      dateFrom: sp.get('dateFrom') ?? undefined,
      dateTo: sp.get('dateTo') ?? undefined,
      from: sp.get('from') ?? undefined,
      to: sp.get('to') ?? undefined,
      hasAudio: sp.get('hasAudio') ?? undefined,
      hasVideo: sp.get('hasVideo') ?? undefined,
      sort: sp.get('sort') ?? undefined,
    });

    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const results = await search(parsed.data);

    return ok(results, {
      meta: {
        query: parsed.data.q,
        took_ms: results.took_ms,
        nextCursor: results.nextCursor,
        total: results.facets.total,
        facets: results.facets,
      },
      // Wave 11 perf — explicit Cache-Control mirroring the ISR revalidate
      // window so Vercel Edge / browsers / proxies honor the same TTL.
      cache: {
        sMaxage: 60,
        staleWhileRevalidate: 300,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

// 405 para qualquer outro método
export async function POST() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}
