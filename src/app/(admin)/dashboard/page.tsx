// ============================================================================
// /admin/dashboard — Painel principal admin (Wave 20)
// ============================================================================
// Server Component — agrega todas as métricas em paralelo, renderiza cards
// + charts + top lists. Mobile-first: 1 coluna no mobile, 2/4 no desktop.
//
// Métricas carregadas:
//   - kpi (4 KPIs: DAU/MAU, signups 7d, posts 7d, NPS 30d)
//   - user-growth (line, 30d)
//   - engagement (bar, 14d)
//   - retention (heatmap, 6 cohorts × 6 weeks)
//   - top-tradicoes, top-artigos, top-contribuidores
// ============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import {
  LineChart,
  BarChart,
  Heatmap,
} from '@/components/admin/charts-client';
import {
  getKpiCards,
  getUserGrowthSeries,
  getEngagementSeries,
  getRetentionCohort,
  getTopTraditions,
  getTopArticles,
  getTopContributors,
} from '@/lib/admin/metrics';

export const metadata: Metadata = {
  title: 'Admin · Dashboard',
  description: 'Painel administrativo do Akasha Portal — métricas, moderação e gestão de usuários.',
  robots: { index: false, follow: false },
};

export const revalidate = 60;

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function formatNps(n: number): { label: string; tone: 'good' | 'neutral' | 'bad' } {
  if (n >= 50) return { label: `${n}`, tone: 'good' };
  if (n >= 0) return { label: `${n}`, tone: 'neutral' };
  return { label: `${n}`, tone: 'bad' };
}

export default async function AdminDashboardPage() {
  // Carregar tudo em paralelo (cada função já é independente)
  const [kpis, userGrowth, engagement, retention, topTrad, topArt, topContrib] =
    await Promise.all([
      getKpiCards(),
      getUserGrowthSeries(30),
      getEngagementSeries(14),
      getRetentionCohort(6),
      getTopTraditions(10),
      getTopArticles(10),
      getTopContributors(10),
    ]);

  const dauMau = pct(kpis.dau_mau_ratio);
  const npsView = formatNps(kpis.nps_30d);

  return (
    <>
      <AdminNav active="/admin/dashboard" />

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Visão geral da atividade da comunidade · atualizado agora
        </p>
      </header>

      {/* ============================== */}
      {/* KPIs (4 cards topo)            */}
      {/* ============================== */}
      <section
        aria-label="KPIs"
        className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <KpiCard
          label="DAU / MAU"
          value={dauMau}
          hint={`${kpis.dau_mau_sample.dau} ativos hoje · ${kpis.dau_mau_sample.mau} nos últimos 30d`}
          tone="info"
        />
        <KpiCard
          label="Signups (7d)"
          value={String(kpis.signups_7d)}
          hint="Novos usuários na última semana"
        />
        <KpiCard
          label="Posts (7d)"
          value={String(kpis.posts_7d)}
          hint="Publicados (não-draft)"
        />
        <KpiCard
          label="NPS (30d)"
          value={npsView.label}
          hint={
            kpis.nps_sample.total >= 5
              ? `${kpis.nps_sample.promoters} 👍 / ${kpis.nps_sample.detractors} 👎`
              : 'Amostra < 5 — insuficente'
          }
          tone={npsView.tone}
        />
      </section>

      {/* ============================== */}
      {/* Charts (3)                     */}
      {/* ============================== */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Crescimento de usuários" subtitle="Signups por dia · últimos 30d">
          <LineChart
            series={[
              {
                label: 'Novos usuários',
                color: 'rgb(251, 191, 36)', // amber-400
                data: userGrowth,
              },
            ]}
            yLabel="users/dia"
          />
        </ChartCard>

        <ChartCard title="Engajamento" subtitle="Posts · Likes · Comments · últimos 14d">
          <BarChart
            data={engagement}
            series={[
              { key: 'posts', label: 'Posts', color: 'rgb(96, 165, 250)' }, // blue-400
              { key: 'likes', label: 'Likes', color: 'rgb(251, 113, 133)' }, // rose-400
              { key: 'comments', label: 'Comments', color: 'rgb(74, 222, 128)' }, // green-400
            ]}
          />
        </ChartCard>
      </section>

      <section className="mb-8">
        <ChartCard
          title="Retenção por cohort"
          subtitle="% de signups da semana que retornaram nas semanas seguintes"
        >
          <Heatmap
            cohorts={retention.cohorts}
            weeks={retention.weeks}
            cells={retention.cells}
          />
        </ChartCard>
      </section>

      {/* ============================== */}
      {/* Top listas (3)                 */}
      {/* ============================== */}
      <section className="grid gap-4 lg:grid-cols-3">
        <TopListCard
          title="Top tradições ativas"
          subtitle="Posts (30d) + membros totais"
        >
          <ol className="space-y-1.5">
            {topTrad.length === 0 && (
              <li className="text-xs text-slate-500">Sem dados ainda.</li>
            )}
            {topTrad.map((t, i) => (
              <li
                key={t.slug}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{i + 1}.</span>
                  <span className="text-slate-200">{t.slug}</span>
                </span>
                <span className="text-xs text-slate-400">
                  {t.posts}p · {t.members}m
                </span>
              </li>
            ))}
          </ol>
        </TopListCard>

        <TopListCard
          title="Top artigos lidos"
          subtitle="Biblioteca Akasha — views totais"
        >
          <ol className="space-y-1.5">
            {topArt.length === 0 && (
              <li className="text-xs text-slate-500">Sem artigos publicados.</li>
            )}
            {topArt.map((a, i) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-sm"
              >
                <span className="flex items-start gap-2">
                  <span className="font-mono text-xs text-slate-500">{i + 1}.</span>
                  <a
                    href={`/biblioteca/${a.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-2 text-slate-200 hover:text-amber-300"
                  >
                    {a.title}
                  </a>
                </span>
                <span className="shrink-0 font-mono text-xs text-slate-400">
                  {a.viewCount.toLocaleString('pt-BR')}
                </span>
              </li>
            ))}
          </ol>
        </TopListCard>

        <TopListCard
          title="Top contributors"
          subtitle="Posts (30d) + likes recebidos"
        >
          <ol className="space-y-1.5">
            {topContrib.length === 0 && (
              <li className="text-xs text-slate-500">Sem atividade recente.</li>
            )}
            {topContrib.map((c, i) => (
              <li
                key={c.userId}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{i + 1}.</span>
                  <span className="truncate text-slate-200">{c.nomeCompleto}</span>
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {c.postsCount}p · {c.likesReceived}♡
                </span>
              </li>
            ))}
          </ol>
        </TopListCard>
      </section>

      <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
        Cache: 60s · Dados agregados via <code>prisma.*</code> + 3 raw SQL.
      </footer>
    </>
  );
}

// ============================================================================
// Subcomponentes locais
// ============================================================================

function KpiCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'info' | 'good' | 'bad';
}) {
  const toneClass = {
    neutral: 'text-slate-100',
    info: 'text-sky-300',
    good: 'text-emerald-300',
    bad: 'text-rose-300',
  }[tone];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${toneClass}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <Suspense
        fallback={<div className="h-32 animate-pulse rounded bg-slate-800/60" />}
      >
        {children}
      </Suspense>
    </div>
  );
}

function TopListCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
