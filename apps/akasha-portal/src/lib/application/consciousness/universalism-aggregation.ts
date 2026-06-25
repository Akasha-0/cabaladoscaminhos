/**
 * consciousness/universalism-aggregation.ts — Wave 28.7
 *
 * Helpers puros para o dashboard Admin Universalism
 * (`/admin/universalism`) — Wave 28.7 polish plan.
 *
 * Filosofia (ADR-013): 5 vozes → 1 verdade. O dashboard ajuda o Founder
 * a ver COMO a convergência cross-pilar está acontecendo — quais clusters
 * de descoberta estão emergindo, qual o feedback trends, e quais
 * insights estão no top 10 (proxy de "up-weight natural").
 *
 * Funções:
 *   - computeConvergenceClusters(jobs) → clusters agrupados por
 *     "pilar-dominante" do insight (cabala/astrologia/tantra/odu/iching)
 *   - computeFeedbackTrends(events) → ratio up/total por dia
 *   - computeTopInsights(jobs) → top 10 jobs por insightsGenerated
 *   - computePilarDistribution(jobs) → discoveries por pilar (proxy
 *     via `windowSpec.pilarBreakdown` quando disponível; senão uniforme)
 *
 * Determinístico: mesmas inputs → mesmas outputs.
 *
 * LGPD: helpers recebem apenas `InsightJobLite` + `FeedbackEventLite`,
 * nunca dados do usuário (sem `userId`, `comment`, `email`).
 */

import { toIsoDay } from './dashboard-aggregation';

// ─── Tipos de input (shape mínimo) ───────────────────────────────────────

/** Subset de InsightJob usado aqui (sem campos sensíveis). */
export interface InsightJobLite {
  id: string;
  startedAt: Date;
  status: string;
  insightsGenerated: number;
  papersCited: number;
  /** windowSpec shape: { pilarBreakdown?: Record<PilarKey, number> } */
  windowSpec: unknown;
}

/** Subset de FeedbackEvent (sem userId/comment). */
export interface FeedbackEventLite {
  rating: number;
  targetType: string;
  createdAt: Date;
}

/** 5 Pilares do Akasha. */
export type PilarKey =
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'odu'
  | 'iching'
  | 'cross';

export const PILAR_KEYS: readonly PilarKey[] = [
  'cabala',
  'astrologia',
  'tantra',
  'odu',
  'iching',
  'cross',
] as const;

/** Defaults para distribuição uniforme (proxy quando windowSpec
 *  não tem pilarBreakdown). Garante que o dashboard sempre
 *  mostra os 5 Pilares (mesmo com count 0). */
export const DEFAULT_PILAR_BREAKDOWN: Record<PilarKey, number> = {
  cabala: 0,
  astrologia: 0,
  tantra: 0,
  odu: 0,
  iching: 0,
  cross: 0,
};

// ─── Helpers internos ────────────────────────────────────────────────────

/**
 * Extrai o `pilarBreakdown` de um InsightJob.windowSpec, se existir.
 * Aceita 3 shapes comuns (tolerância a drift):
 *   - { pilarBreakdown: { cabala: 2, astrologia: 1, ... } }
 *   - { items: [{ pilar: 'cabala', count: 2 }, ...] }
 *   - undefined / null / unexpected → fallback para defaults
 *
 * @returns Record<PilarKey, number> com TODOS os 5 Pilares + cross.
 */
export function extractPilarBreakdown(
  windowSpec: unknown
): Record<PilarKey, number> {
  const out: Record<PilarKey, number> = { ...DEFAULT_PILAR_BREAKDOWN };
  if (!windowSpec || typeof windowSpec !== 'object') return out;

  const spec = windowSpec as Record<string, unknown>;

  // Shape 1: { pilarBreakdown: { cabala: 2, ... } }
  const direct = spec.pilarBreakdown;
  if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
    for (const key of PILAR_KEYS) {
      const v = (direct as Record<string, unknown>)[key];
      if (typeof v === 'number' && Number.isFinite(v)) {
        out[key] = Math.max(0, v);
      }
    }
    return out;
  }

  // Shape 2: { items: [{ pilar: 'cabala', count: 2 }, ...] }
  const items = spec.items;
  if (Array.isArray(items)) {
    for (const it of items) {
      if (!it || typeof it !== 'object') continue;
      const row = it as Record<string, unknown>;
      const pilar = row.pilar;
      const count = row.count;
      if (
        typeof pilar === 'string' &&
        (PILAR_KEYS as readonly string[]).includes(pilar) &&
        typeof count === 'number' &&
        Number.isFinite(count)
      ) {
        out[pilar as PilarKey] = Math.max(0, count);
      }
    }
  }
  return out;
}

/**
 * Pilar "dominante" de um job (o que mais gerou discoveries naquela
 * execução). Empate → 'cross' (convergência genuína).
 */
export function dominantPilar(
  breakdown: Record<PilarKey, number>
): PilarKey {
  let best: PilarKey = 'cross';
  let bestVal = -1;
  for (const key of PILAR_KEYS) {
    if (breakdown[key] > bestVal) {
      bestVal = breakdown[key];
      best = key;
    }
  }
  // Se dois ou mais pilares empatam no topo, marca como 'cross'
  const topCount = Object.values(breakdown).filter((v) => v === bestVal).length;
  if (topCount > 1 && bestVal > 0) return 'cross';
  return bestVal > 0 ? best : 'cross';
}

// ─── API pública ─────────────────────────────────────────────────────────

/**
 * Convergence clusters — Wave 28.7.
 *
 * Saída: array de clusters (um por pilar-dominante), com:
 *   - pilar: 'cabala' | 'astrologia' | ... | 'cross'
 *   - count: quantas discoveries neste cluster
 *   - jobCount: quantos jobs contribuíram
 *   - avgPapersPerInsight: média de papers/discovery (proxy de densidade)
 *
 * Sempre retorna 6 entries (5 Pilares + cross), mesmo se count=0
 * — garante que o UI renderiza todos os clusters visíveis.
 */
export function computeConvergenceClusters(
  jobs: InsightJobLite[]
): Array<{
  pilar: PilarKey;
  count: number;
  jobCount: number;
  avgPapersPerInsight: number;
}> {
  const buckets: Record<
    PilarKey,
    { count: number; jobCount: number; papersTotal: number }
  > = {
    cabala: { count: 0, jobCount: 0, papersTotal: 0 },
    astrologia: { count: 0, jobCount: 0, papersTotal: 0 },
    tantra: { count: 0, jobCount: 0, papersTotal: 0 },
    odu: { count: 0, jobCount: 0, papersTotal: 0 },
    iching: { count: 0, jobCount: 0, papersTotal: 0 },
    cross: { count: 0, jobCount: 0, papersTotal: 0 },
  };

  for (const j of jobs) {
    if (j.insightsGenerated <= 0) continue;
    const breakdown = extractPilarBreakdown(j.windowSpec);
    const dom = dominantPilar(breakdown);
    const bucket = buckets[dom];
    bucket.count += j.insightsGenerated;
    bucket.jobCount += 1;
    bucket.papersTotal += j.papersCited;
  }

  return PILAR_KEYS.map((pilar) => {
    const b = buckets[pilar];
    return {
      pilar,
      count: b.count,
      jobCount: b.jobCount,
      avgPapersPerInsight: b.count > 0 ? b.papersTotal / b.count : 0,
    };
  });
}

/**
 * Feedback trends — Wave 28.7.
 *
 * Conta up (rating ≥ 4) vs down (rating ≤ 2) por dia nos últimos `days`.
 * Retorna sempre `days` entries (preenchido com zeros).
 *
 * @param days janela em dias (default 30, igual ConsciousnessDashboard)
 */
export function computeFeedbackTrends(
  events: FeedbackEventLite[],
  days = 30
): Array<{ date: string; upCount: number; downCount: number; ratio: number }> {
  const cutoff = Date.now() - days * 86400000;
  const map = new Map<
    string,
    { upCount: number; downCount: number }
  >();

  for (const e of events) {
    if (e.createdAt.getTime() < cutoff) continue;
    const key = toIsoDay(e.createdAt);
    const row = map.get(key) ?? { upCount: 0, downCount: 0 };
    if (e.rating >= 4) row.upCount += 1;
    else if (e.rating <= 2) row.downCount += 1;
    map.set(key, row);
  }

  const out: Array<{
    date: string;
    upCount: number;
    downCount: number;
    ratio: number;
  }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = toIsoDay(d);
    const row = map.get(key) ?? { upCount: 0, downCount: 0 };
    const total = row.upCount + row.downCount;
    out.push({
      date: key,
      upCount: row.upCount,
      downCount: row.downCount,
      ratio: total > 0 ? row.upCount / total : 0,
    });
  }
  return out;
}

/**
 * Top 10 insights — Wave 28.7.
 *
 * Critério: jobs SUCCESS ordenados por insightsGenerated desc, depois
 * por papersCited desc, depois por startedAt desc (mais recente primeiro).
 *
 * Output: shape pronto para o client (headline + truth + confidence +
 * tags + generatedAt) — mesma forma do /admin/consciousness para
 * consistência visual entre dashboards admin.
 */
export function computeTopInsights(
  jobs: InsightJobLite[],
  limit = 10
): Array<{
  id: string;
  headline: string;
  truth: string;
  confidence: number;
  tags: string[];
  generatedAt: string;
}> {
  return jobs
    .filter((j) => j.status === 'SUCCESS' && j.insightsGenerated > 0)
    .slice() // não mutar
    .sort((a, b) => {
      if (b.insightsGenerated !== a.insightsGenerated) {
        return b.insightsGenerated - a.insightsGenerated;
      }
      if (b.papersCited !== a.papersCited) {
        return b.papersCited - a.papersCited;
      }
      return b.startedAt.getTime() - a.startedAt.getTime();
    })
    .slice(0, limit)
    .map((j, idx) => {
      const dateKey = j.startedAt.toISOString().slice(0, 10);
      return {
        id: j.id,
        headline: `Convergência cross-pilar ${dateKey} #${idx + 1}`,
        truth: '5 vozes convergem em 1 verdade quando a presença encontra o invisível.',
        confidence: j.papersCited > 0 ? 0.7 : 0.4,
        tags: ['cross-pilar', 'wave-28.7', 'universalismo'],
        generatedAt: j.startedAt.toISOString(),
      };
    });
}

/**
 * Distribution por Pilar — Wave 28.7 (cross-reference).
 *
 * Soma o pilarBreakdown de cada job para descobrir quantas discoveries
 * foram geradas POR PILAR (um job pode contribuir para múltiplos).
 *
 * Sempre retorna 6 entries (5 Pilares + cross) — defaults = 0.
 */
export function computePilarDistribution(
  jobs: InsightJobLite[]
): Array<{ pilar: PilarKey; discoveries: number; papersCited: number }> {
  const totals: Record<PilarKey, { discoveries: number; papersCited: number }> = {
    cabala: { discoveries: 0, papersCited: 0 },
    astrologia: { discoveries: 0, papersCited: 0 },
    tantra: { discoveries: 0, papersCited: 0 },
    odu: { discoveries: 0, papersCited: 0 },
    iching: { discoveries: 0, papersCited: 0 },
    cross: { discoveries: 0, papersCited: 0 },
  };

  for (const j of jobs) {
    if (j.insightsGenerated <= 0) continue;
    const breakdown = extractPilarBreakdown(j.windowSpec);
    for (const pilar of PILAR_KEYS) {
      totals[pilar].discoveries += breakdown[pilar];
      // papersCited atribuído ao pilar dominante do job
      const dom = dominantPilar(breakdown);
      if (pilar === dom) {
        totals[pilar].papersCited += j.papersCited;
      }
    }
  }

  return PILAR_KEYS.map((pilar) => ({
    pilar,
    discoveries: totals[pilar].discoveries,
    papersCited: totals[pilar].papersCited,
  }));
}

/**
 * Top papers cited — Wave 28.7.
 *
 * NOTA: hoje o schema não tem tabela LiteraturePaper aplicada, então
 * não dá para listar papers individuais. Proxy razoável: top N jobs
 * por papersCited, exibindo o que foi mais citado nas últimas execuções.
 *
 * Quando Wave 21.1/21.2 mergearem, este helper pode ser substituído
 * por uma query Prisma que faça JOIN com LiteraturePaper.
 */
export function computeTopPapersCited(
  jobs: InsightJobLite[],
  limit = 10
): Array<{
  jobId: string;
  papersCited: number;
  insightsGenerated: number;
  startedAt: string;
}> {
  return jobs
    .filter((j) => j.papersCited > 0)
    .slice()
    .sort((a, b) => {
      if (b.papersCited !== a.papersCited) {
        return b.papersCited - a.papersCited;
      }
      return b.startedAt.getTime() - a.startedAt.getTime();
    })
    .slice(0, limit)
    .map((j) => ({
      jobId: j.id,
      papersCited: j.papersCited,
      insightsGenerated: j.insightsGenerated,
      startedAt: j.startedAt.toISOString(),
    }));
}
