/**
 * consciousness/dashboard-aggregation.ts — Wave 25.1
 *
 * Helpers puros para o dashboard de evolução (`/admin/consciousness`).
 * Extraídos do `page.tsx` para serem testáveis isoladamente (lesson N+24
 * — tests co-located, mas lógica pura em lib). Sem dependências Next/React.
 *
 * Funções:
 *   - toIsoDay(d) → 'yyyy-mm-dd'
 *   - toIsoWeek(d) → 'yyyy-Www' (ISO 8601)
 *   - fillDailyGaps(rows) → 30 dias preenchidos (zeros onde vazio)
 *   - fillWeeklyGaps(rows) → 13 semanas preenchidas (zeros onde vazio)
 *   - aggregateByTimeBucket(jobs) → { byDay, byWeek, totalInsights, totalPapers }
 *
 * Determinístico: mesmas inputs → mesmas outputs.
 */

/** ISO yyyy-mm-dd para uma data UTC. */
export function toIsoDay(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** ISO yyyy-Www — anchor Monday (ISO 8601). */
export function toIsoWeek(d: Date): string {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** Preenche buracos: array de 30 dias (mesmo se 0). */
export function fillDailyGaps(
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
export function fillWeeklyGaps(
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

/** Input mínimo para `aggregateByTimeBucket`. */
export interface InsightJobLite {
  startedAt: Date;
  insightsGenerated: number;
  papersCited: number;
}

/** Output da agregação. */
export interface TimeAggregation {
  /** discoveries/dia — mapa pré-ordenado por `date` ISO. */
  byDay: Array<{ date: string; count: number }>;
  /** discoveries/semana — mapa pré-ordenado por `week` ISO. */
  byWeek: Array<{ week: string; count: number }>;
  /** Soma total de insights gerados. */
  totalInsights: number;
  /** Soma total de papers citados (pode duplicar — não-unique). */
  totalPapers: number;
}

/**
 * Agrega jobs em buckets temporais (dia + semana) + somatórios.
 * Determinístico — iteração em ordem de inserção preservada.
 */
export function aggregateByTimeBucket(jobs: InsightJobLite[]): TimeAggregation {
  const dayMap = new Map<string, number>();
  const weekMap = new Map<string, number>();
  let totalInsights = 0;
  let totalPapers = 0;

  for (const j of jobs) {
    const dayKey = toIsoDay(j.startedAt);
    const weekKey = toIsoWeek(j.startedAt);
    dayMap.set(dayKey, (dayMap.get(dayKey) ?? 0) + j.insightsGenerated);
    weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + j.insightsGenerated);
    totalInsights += j.insightsGenerated;
    totalPapers += j.papersCited;
  }

  return {
    byDay: Array.from(dayMap.entries()).map(([date, count]) => ({ date, count })),
    byWeek: Array.from(weekMap.entries()).map(([week, count]) => ({ week, count })),
    totalInsights,
    totalPapers,
  };
}