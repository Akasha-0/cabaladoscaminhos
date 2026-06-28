// ============================================================================
// GET /api/admin/metrics/[name] — métrica individual (Wave 20)
// ===========================================================================
// Suporta:
//   - kpi           → 4 KPIs agregados (DAU/MAU, signups 7d, posts 7d, NPS 30d)
//   - user-growth   → série de signups por dia (30d)
//   - engagement    → série multi (posts/likes/comments por dia, 14d)
//   - retention     → matriz cohort × week (6 cohorts × 6 weeks)
//   - top-tradições → top 10 tradições ativas
//   - top-artigos   → top 10 artigos por views
//   - top-contribs  → top 10 contributors
//
// Cache: s-maxage=60, swr=300 (dashboard recarrega a cada 1min, fallback OK)
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import {
  getKpiCards,
  getUserGrowthSeries,
  getEngagementSeries,
  getRetentionCohort,
  getTopTraditions,
  getTopArticles,
  getTopContributors,
} from '@/lib/admin/metrics';

export const runtime = 'nodejs';
export const revalidate = 60; // ISR fallback

const VALID = new Set([
  'kpi',
  'user-growth',
  'engagement',
  'retention',
  'top-traditions',
  'top-articles',
  'top-contributors',
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(ErrorCode.FORBIDDEN, `Admin required (${session.reason})`, 403);
    }

    const { name: rawName } = await params;
    const name = decodeURIComponent(rawName ?? '');
    if (!VALID.has(name)) {
      return fail(
        ErrorCode.BAD_REQUEST,
        `Métrica desconhecida: ${name}. Válidas: ${[...VALID].join(', ')}`,
        400
      );
    }

    let data: unknown;
    switch (name) {
      case 'kpi':
        data = await getKpiCards();
        break;
      case 'user-growth':
        data = await getUserGrowthSeries(30);
        break;
      case 'engagement':
        data = await getEngagementSeries(14);
        break;
      case 'retention':
        data = await getRetentionCohort(6);
        break;
      case 'top-traditions':
        data = await getTopTraditions(10);
        break;
      case 'top-articles':
        data = await getTopArticles(10);
        break;
      case 'top-contributors':
        data = await getTopContributors(10);
        break;
    }

    return ok(data, {
      meta: { metric: name },
      cache: { sMaxage: 60, staleWhileRevalidate: 300 },
    });
  } catch (err) {
    return handleError(err, 'GET /api/admin/metrics/[name]');
  }
}
