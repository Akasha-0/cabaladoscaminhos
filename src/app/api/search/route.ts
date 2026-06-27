// ============================================================================
// GET /api/search — Busca unificada (Onda 12, 2026-06-27)
// ============================================================================
// Tipos: all, posts, articles, users, groups, tags
// Query params: q, type, cursor, limit, tradition, tag, sort, from, to
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
      sort: sp.get('sort') ?? undefined,
      from: sp.get('from') ?? undefined,
      to: sp.get('to') ?? undefined,
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
    });
  } catch (err) {
    return handleError(err);
  }
}

// 405 para qualquer outro método
export async function POST() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}
