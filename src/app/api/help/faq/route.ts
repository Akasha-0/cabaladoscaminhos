// ============================================================================
// API: GET /api/help/faq — Lista de FAQs (Wave 36)
// ============================================================================
// Retorna todas as FAQs (ou filtradas por categoria/tradição).
// LGPD: nenhuma PII. Cache-control público para reduzir tráfego.
//
// Query params:
//   category   (string)
//   tradition  (string)
//   trending   (boolean)
//   q          (string — substring search)
// ============================================================================

import { NextRequest } from 'next/server';
import { ok } from '@/lib/community/api';
import {
  FAQ_ENTRIES,
  FAQ_CATEGORIES,
  getFaqByCategory,
  getFaqByTradition,
  getTrendingFaq,
  searchFaq,
  totalFaqCount,
} from '@/lib/help/faq-data';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get('category');
  const tradition = sp.get('tradition');
  const trending = sp.get('trending') === 'true';
  const q = sp.get('q');

  let data = FAQ_ENTRIES;
  if (category) data = getFaqByCategory(category as any);
  else if (tradition) data = getFaqByTradition(tradition);
  else if (trending) data = getTrendingFaq();
  else if (q) data = searchFaq(q);

  return ok(
    {
      total: data.length,
      categories: FAQ_CATEGORIES,
      entries: data,
    },
    {
      cache: {
        sMaxage: 300,
        staleWhileRevalidate: 600,
      },
      meta: {
        totalAll: totalFaqCount(),
        filtered: Boolean(category || tradition || trending || q),
        generatedAt: new Date().toISOString(),
      },
    },
  );
}
