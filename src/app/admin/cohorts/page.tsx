// ============================================================================
// /admin/cohorts — Cohort analysis with filters (Wave 38, 2026-07-01)
// ============================================================================
// Filters: cohort week, tradition, region, age range.
// Metrics: retention D1/D7/D30, activity, churn risk.
// Visualizations: heatmap, line chart, cohort table.
// LGPD: k-anonymity (k>=5) applied; no PII.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/session';
import { AdminNav } from '@/components/admin/AdminNav';
import { CohortsClient } from './CohortsClient';

export const metadata: Metadata = {
  title: 'Admin · Cohorts · Cabala dos Caminhos',
  robots: { index: false, follow: false },
  description: 'Cohort analysis with retention D1/D7/D30, churn risk, and segment filters.',
};

export const dynamic = 'force-dynamic';

const TRADITIONS = ['umbanda', 'candomble', 'espiritismo', 'budismo', 'catolicismo'];
const REGIONS = ['norte', 'nordeste', 'centro_oeste', 'sudeste', 'sul'];
const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

export default async function CohortsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; tradition?: string; region?: string; ageRange?: string }>;
}) {
  const session = await requireAdmin();
  if (!session.ok) {
    if (process.env.NODE_ENV === 'production') redirect('/');
  }
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <AdminNav />
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cohort analysis</h1>
          <p className="text-sm text-slate-400">
            Retenção D1/D7/D30, atividade média e risco de churn por cohort.
          </p>
        </div>
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
          Filtros ativos: {[params.week, params.tradition, params.region, params.ageRange].filter(Boolean).length}
        </span>
      </header>

      <CohortsClient
        filters={{
          week: params.week,
          tradition: params.tradition,
          region: params.region,
          ageRange: params.ageRange,
        }}
        facets={{
          traditions: TRADITIONS,
          regions: REGIONS,
          ageRanges: AGE_RANGES,
        }}
      />
    </div>
  );
}