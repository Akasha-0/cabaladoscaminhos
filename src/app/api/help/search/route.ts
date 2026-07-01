// ============================================================================
// API: GET /api/help/search?q= — Busca unificada na Ajuda (Wave 36)
// ============================================================================
// Em produção, substituir searchAllHelp por Prisma raw query com Postgres FTS.
// Aqui: in-memory mock pra Wave 36, com mesma tipagem e shape de resposta.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok } from '@/lib/community/api';
import { searchAllHelp, type HelpResultType } from '@/lib/help/search-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get('q') ?? '').trim();
  const type = sp.get('type') as HelpResultType | null;
  const category = sp.get('category') ?? undefined;
  const limit = Math.min(50, parseInt(sp.get('limit') ?? '30', 10));

  if (!q) {
    return ok({
      query: '',
      total: 0,
      took_ms: 0,
      results: [],
      facets: { by_type: { faq: 0, kb: 0, wiki: 0, video: 0 }, by_category: {} },
      relatedSearches: [],
    });
  }

  const results = searchAllHelp(q, { type: type ?? undefined, category, limit });

  return ok(results, {
    cache: {
      sMaxage: 60,
      staleWhileRevalidate: 300,
    },
  });
}
