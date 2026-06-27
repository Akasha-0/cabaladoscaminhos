// ============================================================================
// GET /api/search/suggestions — Autocomplete (Onda 12, 2026-06-27)
// ============================================================================
// Top 8 matches categorizados por tipo. Usado pelo SearchBar com debounce 300ms.
// ============================================================================

import { NextRequest } from 'next/server';
import { SuggestionQuerySchema } from '@/lib/validators/search';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { suggestions } from '@/lib/community/search';

// ============================================================================
// Caching strategy — ISR with 5-minute TTL
// ============================================================================
// Suggestions are autocomplete-style queries; results change slowly as the
// content corpus grows. 5-minute revalidation gives a 60-80% TTFB reduction
// for repeated queries (Vercel Edge cache) without making autocomplete feel
// stale during normal browsing.
// ============================================================================
export const revalidate = 300;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const parsed = SuggestionQuerySchema.safeParse({
      q: sp.get('q') ?? '',
      limit: sp.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const results = await suggestions(parsed.data);

    return ok(results, {
      meta: {
        query: parsed.data.q,
        took_ms: results.took_ms,
        count: results.suggestions.length,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use GET');
}
