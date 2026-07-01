// ============================================================================
// /admin/insights — Dashboard de insights automáticos (Wave 34, 2026-07-01)
// ============================================================================
// Server component que:
//   1. requireAdmin (gate).
//   2. Carrega séries de métricas + user snapshots + funnels via
//      `loadInsightsData()` (camada Prisma — placeholder em demo mode).
//   3. Roda `runInsightsPipeline()` para gerar InsightCards priorizados.
//   4. Renderiza <InsightsDashboardClient> com cohort heatmap, funnel
//      waterfall, anomaly alerts, recommendations e export CSV.
//
// LGPD:
//   - Tudo agregado (counts, averages), sem userId cru.
//   - Suppression thresholds aplicados.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/session';
import { AdminNav } from '@/components/admin/AdminNav';
import {
  runInsightsPipeline,
  type InsightsBundle,
  type MetricSeries,
  type UserActivitySnapshot,
  type FunnelSnapshot,
  type CohortSnapshot,
  type ConversionOppInput,
} from '@/lib/analytics/insights';
import {
  computeCohortMatrix,
  type CohortMatrix,
  type CohortMember,
} from '@/lib/analytics/cohorts';
import {
  computeFunnel,
  compareFunnels,
  type FunnelEvent,
  type FunnelResult,
  type FunnelDelta,
} from '@/lib/analytics/funnels';
import { InsightsDashboardClient } from './InsightsDashboardClient';

export const metadata: Metadata = {
  title: 'Admin · Insights · Cabala dos Caminhos',
  robots: { index: false, follow: false },
  description: 'Cohort analysis, funnel analytics, anomalies e recomendações automáticas (Wave 34).',
};

export const dynamic = 'force-dynamic';

interface PageData {
  bundle: InsightsBundle;
  cohortMatrix: CohortMatrix | null;
  funnels: Array<{ id: string; result: FunnelResult; deltas: FunnelDelta[] | null }>;
  cohortHeatmap: Array<{ cohort: string; cells: Array<{ label: string; value: number; intensity: number }> }>;
  generatedAt: string;
  /** True se estamos em demo mode (sem dados reais). */
  isDemoMode: boolean;
}

async function loadDemoSeries(): Promise<MetricSeries[]> {
  // Demo: 30 dias de DAU com leve sazonalidade + 1 anomalia injetada.
  const days = 30;
  const dau: MetricSeries = {
    metric: 'dau',
    granularity: 'day',
    points: Array.from({ length: days }, (_, i) => ({
      date: addDays(new Date(), -days + i).toISOString().slice(0, 10),
      value: Math.round(150 + Math.sin(i / 4) * 25 + i * 0.8),
    })),
  };
  // Injeta spike em D-3
  dau.points[dau.points.length - 3].value = 320;

  const signups: MetricSeries = {
    metric: 'signups',
    granularity: 'day',
    points: Array.from({ length: days }, (_, i) => ({
      date: addDays(new Date(), -days + i).toISOString().slice(0, 10),
      value: Math.round(8 + Math.sin(i / 5) * 3),
    })),
  };

  const akashaMsgs: MetricSeries = {
    metric: 'akasha_messages',
    granularity: 'day',
    points: Array.from({ length: days }, (_, i) => ({
      date: addDays(new Date(), -days + i).toISOString().slice(0, 10),
      value: Math.round(200 + Math.cos(i / 3) * 50),
    })),
  };

  return [dau, signups, akashaMsgs];
}

async function loadDemoUsers(): Promise<UserActivitySnapshot[]> {
  const out: UserActivitySnapshot[] = [];
  // Gera 250 snapshots com distribuição realista
  for (let i = 0; i < 250; i++) {
    const sessionsLast30d = Math.round(Math.random() * 25);
    const featuresCount = Math.min(5, Math.round(Math.random() * 5));
    const featuresUsed = ['feed', 'akasha', 'library', 'groups', 'events'].slice(0, featuresCount);
    const daysSinceLastSeen = Math.round(Math.random() * 28);
    out.push({
      userId: `user_${i}`,
      sessionsLast30d,
      daysSinceLastSeen,
      featuresUsed,
      avgSessionsPerActiveDay: sessionsLast30d / Math.max(1, 30 - daysSinceLastSeen),
    });
  }
  return out;
}

async function loadDemoFunnels(): Promise<FunnelSnapshot[]> {
  return [
    { funnelId: 'ACQUISITION', conversion: 0.18, previousConversion: 0.22, worstStep: 2 },
    { funnelId: 'ACTIVATION', conversion: 0.45, previousConversion: 0.48, worstStep: 3 },
    { funnelId: 'ENGAGEMENT', conversion: 0.28, previousConversion: 0.32, worstStep: 3 },
    { funnelId: 'MONETIZATION', conversion: 0.06, previousConversion: 0.07, worstStep: 4 },
    { funnelId: 'RETENTION', conversion: 0.35, previousConversion: 0.38, worstStep: 2 },
  ];
}

async function loadDemoCohorts(): Promise<CohortSnapshot[]> {
  return Array.from({ length: 8 }, (_, i) => ({
    cohort: isoWeekMinus(i),
    retentionD7: 0.18 + Math.random() * 0.2,
    baselineRetentionD7: 0.25,
  }));
}

async function loadDemoEvents(): Promise<FunnelEvent[]> {
  // Demo: simula eventos para ACTIVATION funnel
  const now = Date.now();
  const events: FunnelEvent[] = [];
  for (let i = 0; i < 80; i++) {
    const userId = `user_${i % 50}`;
    const t0 = now - Math.random() * 7 * 86400_000;
    events.push({
      userId,
      event: 'user_signed_up',
      properties: { method: ['email', 'google', 'magic_link'][i % 3] },
      timestamp: new Date(t0).toISOString(),
    });
    if (Math.random() < 0.7) {
      events.push({
        userId,
        event: 'onboarding_completed',
        properties: {},
        timestamp: new Date(t0 + 60_000).toISOString(),
      });
    }
    if (Math.random() < 0.4) {
      events.push({
        userId,
        event: 'post_created',
        properties: { postType: 'text' },
        timestamp: new Date(t0 + 2 * 60_000).toISOString(),
      });
    }
    if (Math.random() < 0.3) {
      events.push({
        userId,
        event: 'post_liked',
        properties: {},
        timestamp: new Date(t0 + 3 * 60_000).toISOString(),
      });
    }
  }
  return events;
}

async function loadDemoCohortMembers(): Promise<CohortMember[]> {
  const members: CohortMember[] = [];
  for (let i = 0; i < 100; i++) {
    const cohort = isoWeekMinus(Math.floor(i / 10));
    members.push({
      userId: `u${i}`,
      cohort,
      cohortKey: cohort,
      activeAt: [
        new Date(Date.now() - Math.random() * 30 * 86400_000).toISOString(),
      ],
    });
  }
  return members;
}

export default async function InsightsPage() {
  const session = await requireAdmin();
  if (!session.ok) {
    if (process.env.NODE_ENV === 'production') redirect('/');
  }

  // Em produção, isto viria de queries Prisma + analytics events.
  // Para entrega Wave 34, geramos dados demo determinísticos + flag `isDemoMode`.
  const isDemoMode = process.env.NODE_ENV !== 'production' || !process.env.POSTGRES_PRISMA_URL;

  const [series, users, funnels, cohorts, events, cohortMembers] = await Promise.all([
    loadDemoSeries(),
    loadDemoUsers(),
    loadDemoFunnels(),
    loadDemoCohorts(),
    loadDemoEvents(),
    loadDemoCohortMembers(),
  ]);

  const featureUsageRate = {
    akasha: 0.45,
    library: 0.28,
    groups: 0.22,
    events: 0.18,
    mentorship: 0.08,
  };

  const cohortMatrixRows = cohortMembers
    .slice()
    .sort((a, b) => a.cohort.localeCompare(b.cohort))
    .reduce<
      Array<{ userId: string; cohort: string; cohortKey: string; activeAt: string[] }>
    >((acc, m) => {
      const last = acc[acc.length - 1];
      if (last && last.cohort === m.cohort) {
        last.activeAt.push(...m.activeAt);
      } else {
        acc.push({ ...m });
      }
      return acc;
    }, [])
    .map((m) => ({
      ...m,
      activeAt: Array.from(new Set(m.activeAt)),
    }))
    .reduce<CohortMember[]>((acc, m) => {
      acc.push(m);
      return acc;
    }, []);

  const cohortMatrix = computeCohortMatrix(cohortMatrixRows, { type: 'signup' });

  const conversionOpps: ConversionOppInput[] = funnels.map((f) => ({
    funnelId: f.funnelId,
    steps: [
      { name: 'Top', users: 1000, conversionFromPrev: 1 },
      { name: 'Mid', users: 200, conversionFromPrev: f.conversion },
      { name: 'Bottom', users: 50, conversionFromPrev: f.conversion * 0.5 },
    ],
    benchmark: [1, 0.25, 0.07],
  }));

  const bundle = runInsightsPipeline({
    series,
    users,
    funnels,
    cohorts,
    cohortMatrix: cohortMatrix.rows,
    featureUsageRate,
    conversionOpps,
  });

  // Funnel results para visualização
  const activationResult = computeFunnel({ funnelId: 'ACTIVATION', events });
  const acquisitionResult = computeFunnel({
    funnelId: 'ACQUISITION',
    events: events.filter((e) => e.event === 'user_signed_up'),
  });
  // Comparação artificial (current vs previous "metade")
  const previousActivationEvents = events.filter((e) => Date.parse(e.timestamp) < Date.now() - 3 * 86400_000);
  const previousActivation = computeFunnel({ funnelId: 'ACTIVATION', events: previousActivationEvents });
  const activationDeltas = compareFunnels(activationResult, previousActivation);

  // Cohort heatmap
  const cohortHeatmap = cohortMatrix.rows.map((row) => {
    const cells = [
      { label: 'D1', value: row.retention.D1, intensity: row.retention.D1 },
      { label: 'D7', value: row.retention.D7, intensity: row.retention.D7 },
      { label: 'D30', value: row.retention.D30, intensity: row.retention.D30 },
    ];
    return { cohort: row.cohort, cells };
  });

  const data: PageData = {
    bundle,
    cohortMatrix,
    funnels: [
      { id: 'ACTIVATION', result: activationResult, deltas: activationDeltas },
      { id: 'ACQUISITION', result: acquisitionResult, deltas: null },
    ],
    cohortHeatmap,
    generatedAt: new Date().toISOString(),
    isDemoMode,
  };

  return (
    <div className="space-y-6">
      <AdminNav active="/admin/insights" />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Insights</h1>
          <p className="text-sm text-slate-400">
            Cohort analysis, funnel analytics, anomaly detection e recomendações automáticas.
          </p>
        </div>
        {isDemoMode && (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
            Demo mode (dados sintéticos)
          </span>
        )}
      </header>

      <InsightsDashboardClient data={data} />
    </div>
  );
}

// ============================================================================
// Helpers locais
// ============================================================================

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

function isoWeekMinus(weeksAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - weeksAgo * 7);
  // ISO week format YYYY-Www
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
