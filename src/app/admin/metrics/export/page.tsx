// ============================================================================
// /admin/metrics/export — Metrics export (Wave 38, 2026-07-01)
// ============================================================================
// CSV / JSON export, scheduled email digest configuration, ETL API.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/session';
import { AdminNav } from '@/components/admin/AdminNav';
import { MetricsExportClient } from './MetricsExportClient';

export const metadata: Metadata = {
  title: 'Admin · Metrics export · Cabala dos Caminhos',
  robots: { index: false, follow: false },
  description: 'CSV/JSON export, scheduled digest, ETL API.',
};

export const dynamic = 'force-dynamic';

const EXPORT_TARGETS = [
  { id: 'kpi', label: 'KPIs agregados (DAU/MAU, signups, posts, NPS)' },
  { id: 'user-growth', label: 'User growth (30d)' },
  { id: 'engagement', label: 'Engagement series (14d)' },
  { id: 'retention', label: 'Cohort retention (6 cohorts × 6 weeks)' },
  { id: 'top-traditions', label: 'Top tradições (10)' },
  { id: 'top-articles', label: 'Top artigos (10)' },
  { id: 'top-contributors', label: 'Top contribuidores (10)' },
  { id: 'funnels', label: 'Funis (5 funis, todos os steps)' },
  { id: 'feature-adoption', label: 'Feature adoption (9 features)' },
];

export default async function MetricsExportPage() {
  const session = await requireAdmin();
  if (!session.ok) {
    if (process.env.NODE_ENV === 'production') redirect('/');
  }
  return (
    <div className="space-y-6">
      <AdminNav />
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Metrics export</h1>
          <p className="text-sm text-slate-400">
            Exporte métricas em CSV/JSON, configure digest por email ou consuma via ETL API.
          </p>
        </div>
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
          {EXPORT_TARGETS.length} targets
        </span>
      </header>
      <MetricsExportClient targets={EXPORT_TARGETS} />
    </div>
  );
}