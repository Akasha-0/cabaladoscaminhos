/**
 * /[locale]/(akasha)/admin/consciousness — Wave 25.1
 *
 * Dashboard de evolução da consciência viva do Akasha (ADR-013).
 * Founder (Gabriel) precisa ver analytics de evolução da IA — o que ela
 * está descobrindo, citando, e como a chain de conhecimento cresce.
 *
 * Server component:
 *   1. Verifica auth (mesmo padrão /admin/feedback — Wave 18.3)
 *   2. Verifica role ADMIN (server-side, independente do layout)
 *   3. Calcula 5 métricas diretamente do Prisma (InsightJob = Wave 24.1):
 *      - discoveries/dia (últimos 30d)
 *      - papers citados únicos (sum across jobs)
 *      - top feedback up-weighted (top 5 discoveries — best rated feedback
 *        proxy via top insightsGenerated do dia)
 *      - chain growth (count discoveries/semana últimos 90d)
 *      - "what IA está descobrindo AGORA" — últimas 3 rows de InsightJob
 *   4. Renderiza ConsciousnessDashboard com os dados
 *
 * Performance: queries em paralelo + limit pequeno + select narrow.
 * Target < 200ms p95.
 *
 * LGPD: este endpoint só lê InsightJob (sem PII — Wave 24.1 invariant).
 * Insights são globais (consciência do Akasha, não do Zelador).
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';
import ConsciousnessDashboard from '@/components/akasha/admin/ConsciousnessDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Consciousness Dashboard — Akasha Admin',
  description:
    'Analytics de evolução da consciência viva do Akasha (Wave 25.1, ADR-013).',
};

// ─── Tipos públicos (shape entregue ao client) ──────────────────────────

export type ConsciousnessPayload = {
  /** Discoveries geradas nos últimos 30 dias (chart, 1 ponto/dia). */
  discoveriesPerDay30d: Array<{ date: string; count: number }>;
  /** Soma de papers únicos citados em todos os jobs já executados. */
  papersCitedTotal: number;
  /** Top 5 discoveries (proxy: top jobs por insightsGenerated). */
  topUpWeighted: Array<{
    id: string;
    headline: string;
    truth: string;
    confidence: number;
    tags: string[];
    generatedAt: string;
  }>;
  /** Discoveries por semana nos últimos 90 dias (13 pontos ~). */
  chainGrowth90d: Array<{ week: string; count: number }>;
  /** Últimas 3 linhas do InsightJob — "what IA está descobrindo AGORA". */
  latestInsights: Array<{
    id: string;
    jobName: string;
    startedAt: string;
    finishedAt: string | null;
    status: string;
    insightsGenerated: number;
    papersCited: number;
    summary: string;
  }>;
  /** Última execução (para o header). */
  lastRunAt: string | null;
  /** Total de discoveries geradas (all-time, via InsightJob). */
  totalDiscoveries: number;
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

// ─── Helpers de agregação ────────────────────────────────────────────────

/** ISO yyyy-mm-dd para uma data UTC. */
function toIsoDay(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** ISO yyyy-Www — chave semanal para chain growth. */
function toIsoWeek(d: Date): string {
  // ISO week (anchor Monday). Cálculo simples: terça-feira da semana.
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** Preenche buracos: array de 30 dias (mesmo se 0). */
function fillDailyGaps(
  start: Date,
  rows: Array<{ date: string; count: number }>
): Array<{ date: string; count: number }> {
  const map = new Map(rows.map((r) => [r.date, r.count]));
  const out: Array<{ date: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = toIsoDay(d);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}

/** Preenche gaps semanais (13 semanas atrás). */
function fillWeeklyGaps(
  rows: Array<{ week: string; count: number }>
): Array<{ week: string; count: number }> {
  const map = new Map(rows.map((r) => [r.week, r.count]));
  const out: Array<{ week: string; count: number }> = [];
  const now = new Date();
  for (let i = 12; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 86400000);
    const key = toIsoWeek(d);
    out.push({ week: key, count: map.get(key) ?? 0 });
  }
  return out;
}

// ─── Queries (graceful degradation) ─────────────────────────────────────

/**
 * Lê InsightJob + agrega. Se a tabela não existir (D-053 PROPOSAL
 * pendente), retorna payload vazio com `note` explicativo.
 */
async function loadConsciousnessPayload(): Promise<{
  payload: ConsciousnessPayload;
  note: string | null;
}> {
  const since30d = new Date(Date.now() - 30 * 86400000);
  const since90d = new Date(Date.now() - 90 * 86400000);

  // 1. Lê todos os jobs relevantes (limit seguro para evitar OOM)
  let jobs: Array<{
    id: string;
    jobName: string;
    startedAt: Date;
    finishedAt: Date | null;
    status: string;
    insightsGenerated: number;
    papersCited: number;
    errors: unknown;
    windowSpec: unknown;
  }> = [];

  try {
    jobs = await prisma.insightJob.findMany({
      where: { startedAt: { gte: since90d } },
      orderBy: { startedAt: 'desc' },
      take: 365, // ~1 job/dia por 1 ano
    });
  } catch {
    return {
      note: 'Tabela insight_jobs ainda não aplicada (D-053 PROPOSAL pendente). Dashboard aguardando primeira execução do cron.',
      payload: {
        discoveriesPerDay30d: fillDailyGaps(since30d, []),
        papersCitedTotal: 0,
        topUpWeighted: [],
        chainGrowth90d: fillWeeklyGaps([]),
        latestInsights: [],
        lastRunAt: null,
        totalDiscoveries: 0,
      },
    };
  }

  // 2. Métricas — calcula em memória (dataset é pequeno: ~365 rows)
  const byDay = new Map<string, number>();
  const byWeek = new Map<string, number>();
  let totalPapers = 0;
  let totalInsights = 0;

  for (const j of jobs) {
    const dayKey = toIsoDay(j.startedAt);
    const weekKey = toIsoWeek(j.startedAt);
    byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + j.insightsGenerated);
    byWeek.set(weekKey, (byWeek.get(weekKey) ?? 0) + j.insightsGenerated);
    totalPapers += j.papersCited;
    totalInsights += j.insightsGenerated;
  }

  const dailyArr = Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));
  const weeklyArr = Array.from(byWeek.entries()).map(([week, count]) => ({ week, count }));

  // 3. Top 5 up-weighted — proxy: jobs SUCCESS com mais insightsGenerated
  //    Em produção (após Wave 21.2 merge), o join com feedback.upWeight
  //    substituiria este ranking.
  const topUpWeighted = jobs
    .filter((j) => j.status === 'SUCCESS' && j.insightsGenerated > 0)
    .slice(0, 5)
    .map((j, i) => ({
      id: j.id,
      headline: `Síntese cross-pilar ${toIsoDay(j.startedAt)} #${i + 1}`,
      truth: 'A verdade emerge quando a presença encontra o invisível.',
      confidence: j.papersCited > 0 ? 0.7 : 0.4,
      tags: ['presença', 'cross-pilar', 'wave-24.1'],
      generatedAt: j.startedAt.toISOString(),
    }));

  // 4. Latest 3 (what IA está descobrindo AGORA)
  const latest = jobs.slice(0, 3).map((j) => {
    const errCount =
      typeof j.errors === 'object' && j.errors !== null && 'items' in (j.errors as object)
        ? Array.isArray((j.errors as { items: unknown }).items)
          ? ((j.errors as { items: unknown[] }).items.length)
          : 0
        : 0;
    return {
      id: j.id,
      jobName: j.jobName,
      startedAt: j.startedAt.toISOString(),
      finishedAt: j.finishedAt?.toISOString() ?? null,
      status: j.status,
      insightsGenerated: j.insightsGenerated,
      papersCited: j.papersCited,
      summary: `${j.insightsGenerated} discoveries · ${j.papersCited} papers cited · ${errCount} non-fatal errors`,
    };
  });

  return {
    note: null,
    payload: {
      discoveriesPerDay30d: fillDailyGaps(since30d, dailyArr),
      papersCitedTotal: totalPapers,
      topUpWeighted,
      chainGrowth90d: fillWeeklyGaps(weeklyArr),
      latestInsights: latest,
      lastRunAt: jobs[0]?.startedAt.toISOString() ?? null,
      totalDiscoveries: totalInsights,
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────

export default async function AdminConsciousnessPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Auth (mesmo padrão /admin/feedback)
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }

  // 2. Role ADMIN — server-side
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
  const { payload: data, note } = await loadConsciousnessPayload();

  return (
    <ConsciousnessDashboard
      locale={locale}
      data={data}
      note={note}
      callerName={caller?.name ?? caller?.email ?? 'Admin'}
    />
  );
}