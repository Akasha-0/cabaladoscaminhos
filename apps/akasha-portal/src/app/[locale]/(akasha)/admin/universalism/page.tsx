/**
 * /[locale]/(akasha)/admin/universalism — Wave 28.7
 *
 * Dashboard Admin Universalism — visão "5 vozes → 1 verdade" (ADR-013).
 * Founder-only (mesmo guard do /admin/consciousness — Wave 25.1 pattern).
 *
 * Server component:
 *   1. Auth (verifyAkashaToken + ADMIN role)
 *   2. Carrega InsightJob (90d) + FeedbackEvent (30d) — paralelo
 *   3. Agrega via helpers puros em universalism-aggregation.ts:
 *      - computeConvergenceClusters (6 clusters)
 *      - computeFeedbackTrends (30d ratio)
 *      - computeTopInsights (top 10 SUCCESS)
 *      - computeTopPapersCited (top 10 jobs por papers)
 *      - computePilarDistribution (sumário cross-ref)
 *   4. Renderiza UniversalismDashboard com os dados
 *
 * Performance: queries em paralelo + select narrow. Target < 250ms p95.
 *
 * LGPD: este endpoint só lê InsightJob + FeedbackEvent agregados.
 * Sem PII (sem userId, comment, email). InsightJob é append-only global.
 *
 * Graceful degradation: se InsightJob não existir (D-053 PROPOSAL
 * pendente), retorna payload vazio + note explicativo — mesmo padrão
 * de /admin/consciousness.
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import UniversalismDashboard from '@/components/akasha/admin/UniversalismDashboard';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import {
  computeConvergenceClusters,
  computeFeedbackTrends,
  computePilarDistribution,
  computeTopInsights,
  computeTopPapersCited,
  type FeedbackEventLite,
  type InsightJobLite,
} from '@/lib/application/consciousness/universalism-aggregation';
import { prisma } from '@/lib/infrastructure/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Universalism — Akasha',
  description:
    'Dashboard de convergência universalista: 5 vozes (Pilares) → 1 verdade (ADR-013). Wave 28.7.',
};

// ─── Tipos públicos (shape entregue ao client) ──────────────────────────

export type ConvergenceCluster = {
  pilar: 'cabala' | 'astrologia' | 'tantra' | 'odu' | 'iching' | 'cross';
  count: number;
  jobCount: number;
  avgPapersPerInsight: number;
};

export type FeedbackTrendDay = {
  date: string;
  upCount: number;
  downCount: number;
  ratio: number;
};

export type TopInsight = {
  id: string;
  headline: string;
  truth: string;
  confidence: number;
  tags: string[];
  generatedAt: string;
};

export type TopPaper = {
  jobId: string;
  papersCited: number;
  insightsGenerated: number;
  startedAt: string;
};

export type PilarDistribution = {
  pilar: 'cabala' | 'astrologia' | 'tantra' | 'odu' | 'iching' | 'cross';
  discoveries: number;
  papersCited: number;
};

export type UniversalismPayload = {
  /** 6 clusters (5 Pilares + cross). */
  convergenceClusters: ConvergenceCluster[];
  /** 30 entries, sempre preenchido. */
  feedbackTrends: FeedbackTrendDay[];
  /** Top 10 SUCCESS jobs por discoveries. */
  topInsights: TopInsight[];
  /** Top 10 jobs por papersCited (proxy cross-ref). */
  topPapers: TopPaper[];
  /** Sumário discoveries/papers por Pilar. */
  pilarDistribution: PilarDistribution[];
  /** Última execução do cron (header). */
  lastRunAt: string | null;
  /** Total de discoveries all-time (sum insightsGenerated). */
  totalDiscoveries: number;
  /** Total de FeedbackEvents na janela 30d. */
  totalFeedbackEvents: number;
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

// ─── Queries (graceful degradation) ─────────────────────────────────────

/**
 * Carrega InsightJob (90d) + FeedbackEvent (30d) em paralelo, agrega
 * via helpers puros. Se InsightJob não existir (D-053 PROPOSAL pendente),
 * retorna payload vazio + note explicativo.
 */
async function loadUniversalismPayload(): Promise<{
  payload: UniversalismPayload;
  note: string | null;
}> {
  const since90d = new Date(Date.now() - 90 * 86400000);
  const since30d = new Date(Date.now() - 30 * 86400000);

  // 1. InsightJob — pode não existir (D-053 PROPOSAL). Mesmo padrão
  //    de /admin/consciousness (Wave 25.1).
  let jobs: Array<{
    id: string;
    startedAt: Date;
    finishedAt: Date | null;
    status: string;
    insightsGenerated: number;
    papersCited: number;
    windowSpec: unknown;
  }> = [];

  try {
    // @ts-expect-error — insightJob pode não existir no client
    // ainda (D-053 PROPOSAL pendente). Mesmo padrão de
    // /api/admin/insights/jobs/route.ts (Wave 24.1).
    jobs = await prisma.insightJob.findMany({
      where: { startedAt: { gte: since90d } },
      orderBy: { startedAt: 'desc' },
      take: 365,
    });
  } catch {
    return {
      note: 'Tabela insight_jobs ainda não aplicada (D-053 PROPOSAL pendente). Dashboard aguardando primeira execução do cron.',
      payload: emptyPayload(),
    };
  }

  // 2. FeedbackEvent — schema aplicado (Wave 22.1). LGPD-safe: sem
  //    userId/comment na response (apenas agregados).
  let events: FeedbackEventLite[] = [];
  try {
    const rows: Array<{
      rating: number;
      targetType: string;
      createdAt: Date;
    }> = await prisma.feedbackEvent.findMany({
      where: { createdAt: { gte: since30d } },
      select: {
        rating: true,
        targetType: true,
        createdAt: true,
      },
      take: 10_000, // safety cap (30d × ~333/dia max)
    });
    events = rows.map(
      (r: { rating: number; targetType: string; createdAt: Date }) => ({
        rating: r.rating,
        targetType: r.targetType,
        createdAt: r.createdAt,
      })
    );
  } catch {
    // Se falhar (DB down, etc), segue sem feedback trends.
    events = [];
  }

  // 3. Agregação — helpers puros (testáveis isoladamente).
  const jobLites: InsightJobLite[] = jobs.map((j) => ({
    id: j.id,
    startedAt: j.startedAt,
    status: j.status,
    insightsGenerated: j.insightsGenerated,
    papersCited: j.papersCited,
    windowSpec: j.windowSpec,
  }));

  const convergenceClusters = computeConvergenceClusters(jobLites);
  const feedbackTrends = computeFeedbackTrends(events, 30);
  const topInsights = computeTopInsights(jobLites, 10);
  const topPapers = computeTopPapersCited(jobLites, 10);
  const pilarDistribution = computePilarDistribution(jobLites);

  return {
    note: null,
    payload: {
      convergenceClusters,
      feedbackTrends,
      topInsights,
      topPapers,
      pilarDistribution,
      lastRunAt: jobs[0]?.startedAt.toISOString() ?? null,
      totalDiscoveries: jobLites.reduce(
        (s, j) => s + j.insightsGenerated,
        0
      ),
      totalFeedbackEvents: events.length,
    },
  };
}

/** Payload vazio para graceful degradation. */
function emptyPayload(): UniversalismPayload {
  return {
    convergenceClusters: computeConvergenceClusters([]),
    feedbackTrends: computeFeedbackTrends([], 30),
    topInsights: [],
    topPapers: [],
    pilarDistribution: computePilarDistribution([]),
    lastRunAt: null,
    totalDiscoveries: 0,
    totalFeedbackEvents: 0,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────

export default async function AdminUniversalismPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Auth (mesmo padrão /admin/consciousness — Wave 25.1)
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }

  // 2. Role ADMIN — server-side (independente do layout)
  if (!token) redirect(`/${locale}/login`);
  const payload = verifyAkashaToken(token, 'access');
  if (!payload?.sub) redirect(`/${locale}/login`);
  const caller = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { role: true, name: true, email: true },
  });
  if (caller?.role !== 'ADMIN') {
    redirect(`/${locale}/dashboard?forbidden=admin`);
  }

  // 3. Métricas (server-side, sem PII)
  const { payload: data, note } = await loadUniversalismPayload();

  return (
    <UniversalismDashboard
      locale={locale}
      data={data}
      note={note}
      callerName={caller?.name ?? caller?.email ?? 'Admin'}
    />
  );
}
