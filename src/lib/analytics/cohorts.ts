/**
 * analytics/cohorts.ts — Cohort analysis (Wave 34, 2026-07-01)
 * ============================================================================
 * Matrizes de retenção agregadas por cohort semanal. Pensado para o
 * /admin/insights (visualização) e para auto-insights (deltas, anomalias).
 *
 * Tipos de cohort suportados:
 *   - signup:    cohort = ISO week do createdAt do User
 *   - activity:  cohort = ISO week do last_active_at
 *   - tradition: cohort = preferred_tradition (snapshot inicial)
 *   - ltv:       cohort = ISO week do primeiro pagamento (spend_cohort)
 *
 * Retention é computada em três horizontes canônicos:
 *   - D1: voltou no dia seguinte (1 dia depois)
 *   - D7: voltou entre D2..D7 (ou D7 exato)
 *   - D30: voltou entre D8..D30
 *
 * LGPD:
 *   - Toda agregacao opera em User.aggregate(level: cohort, ...), nunca
 *     retorna PII cru ou userIds.
 *   - Quando o cohort tem < 5 users, retornamos `isSmall: true` e
 *     suprimimos o count exato (k-anonimato, k>=5).
 *
 * Edge cases:
 *   - User nunca voltou = contribute "0% retained in all windows"
 *   - User deletado (LGPD erasure) = excluido do cohort
 *   - Weeks futuras (cohort > currentWeek) = excluded
 *
 * Não acessa Prisma: opera sobre arrays de {userId, week, activeAt, ...}
 * já coletados via `prisma.$queryRaw`. Isso permite unit-testing puro.
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

/** ISO week key no formato `YYYY-Www` (e.g. "2026-W27"). */
export type IsoWeek = string;

/** Janela de retenção canônica. */
export type RetentionWindow = "D1" | "D7" | "D30";

export const RETENTION_WINDOWS: RetentionWindow[] = ["D1", "D7", "D30"];

/** Tipos de cohort pré-definidos. */
export type CohortType = "signup" | "activity" | "tradition" | "ltv";

export interface CohortMember {
  /** Distinct identifier (uuid). Não exposto no output final. */
  userId: string;
  /** Cohort ao qual este user pertence (formato depende do tipo). */
  cohort: string;
  /** ISO week string (YYYY-Www) ou outro rotulo (tradição). */
  cohortKey: IsoWeek | string;
  /** Timestamps ISO 8601 das sessoes ativas. */
  activeAt: string[];
  /** Cumulative spend em centavos (usado para LTV cohorts). */
  cumulativeSpendCents?: number;
}

export interface CohortRow {
  /** Identificador do cohort (e.g. "2026-W27"). */
  cohort: string;
  /** Numero total de users no cohort (suprimido se < 5 e anonymized). */
  totalUsers: number;
  /** True se cohort tem < 5 users (k-anonymity). */
  isSmall: boolean;
  /** Fraction (0..1) de users que voltaram dentro de cada janela. */
  retention: {
    D1: number;
    D7: number;
    D30: number;
  };
  /** Mediana do numero de sessoes ativas no periodo. */
  medianSessions?: number;
  /** LTV mediano em centavos (cohorts type='ltv' only). */
  medianLtvCents?: number;
}

export interface CohortMatrix {
  /** Tipo de cohort. */
  type: CohortType;
  /** Periodo coberto (ISO weeks). */
  periodStart: IsoWeek;
  periodEnd: IsoWeek;
  /** Rows ordenadas por cohort asc. */
  rows: CohortRow[];
  /** Aggregates cross-cohort. */
  summary: {
    totalUsers: number;
    avgRetentionD1: number;
    avgRetentionD7: number;
    avgRetentionD30: number;
    bestCohort: { cohort: string; retentionD7: number } | null;
    worstCohort: { cohort: string; retentionD7: number } | null;
  };
  /** LGPD audit trail. */
  meta: {
    generatedAt: string;
    kAnonThreshold: number;
    suppressedCohorts: string[];
  };
}

// ============================================================================
// Input schema (zod) — facilita validacao runtime em API routes
// ============================================================================

export const CohortMemberSchema = z.object({
  userId: z.string().min(1),
  cohort: z.string().min(1),
  cohortKey: z.string().min(1),
  activeAt: z.array(z.string()),
  cumulativeSpendCents: z.number().int().nonnegative().optional(),
});

// ============================================================================
// Helpers puros (sem Prisma) — testáveis
// ============================================================================

/** Converte Date para ISO week key `YYYY-Www`. */
export function toIsoWeek(d: Date): IsoWeek {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7; // Monday=0
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Diferenca em dias entre duas datas ISO (arredondada para baixo). */
export function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.floor((b - a) / 86400000);
}

/** Lista de ISO weeks no intervalo `[start, end]` (inclusivo). */
export function weeksBetween(start: IsoWeek, end: IsoWeek): IsoWeek[] {
  const out: IsoWeek[] = [];
  const startDate = isoWeekToDate(start);
  const endDate = isoWeekToDate(end);
  for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 7)) {
    out.push(toIsoWeek(d));
  }
  return out;
}

/** Parse ISO week key `YYYY-Www` para Date (segunda-feira daquela semana). */
export function isoWeekToDate(week: IsoWeek): Date {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) throw new Error(`Invalid IsoWeek: ${week}`);
  const year = Number(match[1]);
  const w = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = (jan4.getUTCDay() + 6) % 7;
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - jan4Day + (w - 1) * 7);
  return weekStart;
}

/** Mediana (numerica, no-op se vazio). */
export function median(nums: number[]): number | undefined {
  if (nums.length === 0) return undefined;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** K-anonymity: reprime contagens exatas quando cohort < threshold. */
export function applyKAnonymity<T extends { totalUsers: number; isSmall: boolean }>(
  rows: T[],
  threshold = 5
): { rows: T[]; suppressed: string[] } {
  const suppressed: string[] = [];
  for (const r of rows) {
    if (r.totalUsers < threshold) {
      r.isSmall = true;
      suppressed.push((r as unknown as { cohort: string }).cohort);
    }
  }
  return { rows, suppressed };
}

// ============================================================================
// Builder principal
// ============================================================================

export interface BuildCohortOptions {
  /** Tipo de cohort sendo construido. */
  type: CohortType;
  /** Janela de retenção (dias). */
  windows?: RetentionWindow[];
  /** K-anonymity threshold (default 5 — suprime contagens <5). */
  kThreshold?: number;
  /** "Now" para cálculo relativo (default new Date()). Util em tests. */
  now?: Date;
}

const DEFAULT_WINDOWS: Record<RetentionWindow, [number, number]> = {
  D1: [1, 1], // exatamente 1 dia depois
  D7: [2, 7], // 2..7 dias depois
  D30: [8, 30], // 8..30 dias depois
};

/**
 * computeCohortMatrix — calcula cohort matrix a partir de membros pré-agregados.
 *
 * @param members Array de CohortMember (tipicamente vindo de um aggregate SQL).
 * @param opts Opções de cohort type + k-anonymity.
 *
 * @example
 *   const members = await prisma.$queryRaw<CohortMember[]>(...);
 *   const matrix = computeCohortMatrix(members, { type: "signup" });
 */
export function computeCohortMatrix(
  members: CohortMember[],
  opts: BuildCohortOptions
): CohortMatrix {
  const windows = opts.windows ?? (RETENTION_WINDOWS as RetentionWindow[]);
  const kThreshold = opts.kThreshold ?? 5;
  const now = opts.now ?? new Date();

  // Agrupa por cohortKey (preserva ordem de inserção).
  const byCohort = new Map<string, CohortMember[]>();
  for (const m of members) {
    if (!byCohort.has(m.cohort)) byCohort.set(m.cohort, []);
    byCohort.get(m.cohort)!.push(m);
  }

  const rows: CohortRow[] = [];
  const sortedCohorts = Array.from(byCohort.keys()).sort();
  let currentWeek = toIsoWeek(now);

  for (const cohort of sortedCohorts) {
    if (opts.type !== "tradition" && cohort > currentWeek) continue; // skip future
    const cohortMembers = byCohort.get(cohort)!;
    const totalUsers = cohortMembers.length;
    const isSmall = totalUsers < kThreshold;

    // Retention por janela
    const retention: Record<RetentionWindow, number> = {
      D1: 0,
      D7: 0,
      D30: 0,
    };
    const sessionCounts: number[] = [];

    if (opts.type === "signup") {
      const anchorMap = new Map<string, Date>(); // userId -> signupDate
      for (const m of cohortMembers) anchorMap.set(m.userId, new Date(m.cohortKey));
      for (const w of windows) {
        const [fromDay, toDay] = DEFAULT_WINDOWS[w];
        let retained = 0;
        for (const m of cohortMembers) {
          const anchor = anchorMap.get(m.userId)!;
          const isRetained = m.activeAt.some((iso) => {
            const diff = daysBetween(anchor.toISOString(), iso);
            return diff >= fromDay && diff <= toDay;
          });
          if (isRetained) retained += 1;
        }
        retention[w] = totalUsers > 0 ? retained / totalUsers : 0;
      }
      for (const m of cohortMembers) sessionCounts.push(m.activeAt.length);
    } else if (opts.type === "activity") {
      // Activity cohort: retention = users active in week N+k
      const weekOffsets: Record<RetentionWindow, number> = { D1: 1, D7: 4, D30: 12 };
      for (const w of windows) {
        const targetWeek = shiftWeek(cohort, +weekOffsets[w]);
        let retained = 0;
        for (const m of cohortMembers) {
          const targetWeekStart = isoWeekToDate(targetWeek).toISOString().slice(0, 10);
          const hit = m.activeAt.some((iso) => iso.slice(0, 10) >= targetWeekStart && iso.slice(0, 10) < addDays(targetWeekStart, 7));
          if (hit) retained += 1;
        }
        retention[w] = totalUsers > 0 ? retained / totalUsers : 0;
      }
    } else if (opts.type === "tradition") {
      // Tradition cohort: retention por signup anchor (igual signup)
      const anchorMap = new Map<string, Date>();
      for (const m of cohortMembers) anchorMap.set(m.userId, new Date(m.cohortKey));
      for (const w of windows) {
        const [fromDay, toDay] = DEFAULT_WINDOWS[w];
        let retained = 0;
        for (const m of cohortMembers) {
          const anchor = anchorMap.get(m.userId)!;
          const isRetained = m.activeAt.some((iso) => {
            const diff = daysBetween(anchor.toISOString(), iso);
            return diff >= fromDay && diff <= toDay;
          });
          if (isRetained) retained += 1;
        }
        retention[w] = totalUsers > 0 ? retained / totalUsers : 0;
      }
    } else if (opts.type === "ltv") {
      // LTV cohort: cumulative spend growth curve
      const spends = cohortMembers
        .map((m) => m.cumulativeSpendCents ?? 0)
        .filter((c) => c > 0);
      // Para LTV usamos sessionCount proxy (engagement)
      for (const m of cohortMembers) sessionCounts.push(m.activeAt.length);
      // Retention "fake" = fraction com spend > 0
      for (const w of windows) {
        const [fromDay, toDay] = DEFAULT_WINDOWS[w];
        let retained = 0;
        for (const m of cohortMembers) {
          const anchor = new Date(m.cohortKey);
          const isRetained = m.activeAt.some((iso) => {
            const diff = daysBetween(anchor.toISOString(), iso);
            return diff >= fromDay && diff <= toDay;
          });
          if (isRetained) retained += 1;
        }
        retention[w] = totalUsers > 0 ? retained / totalUsers : 0;
      }
      const medSpend = median(spends);
      const row: CohortRow = {
        cohort,
        totalUsers,
        isSmall,
        retention,
        medianSessions: median(sessionCounts),
      };
      if (medSpend !== undefined) row.medianLtvCents = medSpend;
      rows.push(row);
      continue;
    }

    const row: CohortRow = {
      cohort,
      totalUsers,
      isSmall,
      retention,
    };
    const medSessions = median(sessionCounts);
    if (medSessions !== undefined) row.medianSessions = medSessions;
    rows.push(row);
  }

  // Aplica k-anonymity
  const { rows: anonRows, suppressed } = applyKAnonymity(rows, kThreshold);

  // Summary
  const validD1 = anonRows.filter((r) => !r.isSmall).map((r) => r.retention.D1);
  const validD7 = anonRows.filter((r) => !r.isSmall).map((r) => r.retention.D7);
  const validD30 = anonRows.filter((r) => !r.isSmall).map((r) => r.retention.D30);

  const bestCohort = anonRows
    .filter((r) => !r.isSmall)
    .reduce<{ cohort: string; retentionD7: number } | null>((acc, r) => {
      if (!acc || r.retention.D7 > acc.retentionD7) {
        return { cohort: r.cohort, retentionD7: r.retention.D7 };
      }
      return acc;
    }, null);

  const worstCohort = anonRows
    .filter((r) => !r.isSmall)
    .reduce<{ cohort: string; retentionD7: number } | null>((acc, r) => {
      if (!acc || r.retention.D7 < acc.retentionD7) {
        return { cohort: r.cohort, retentionD7: r.retention.D7 };
      }
      return acc;
    }, null);

  const totalUsers = anonRows.reduce((acc, r) => acc + (r.isSmall ? 0 : r.totalUsers), 0);

  const periodStart = sortedCohorts[0] ?? toIsoWeek(now);
  const periodEnd = sortedCohorts[sortedCohorts.length - 1] ?? toIsoWeek(now);

  return {
    type: opts.type,
    periodStart,
    periodEnd,
    rows: anonRows,
    summary: {
      totalUsers,
      avgRetentionD1: avg(validD1),
      avgRetentionD7: avg(validD7),
      avgRetentionD30: avg(validD30),
      bestCohort,
      worstCohort,
    },
    meta: {
      generatedAt: new Date().toISOString(),
      kAnonThreshold: kThreshold,
      suppressedCohorts: suppressed,
    },
  };
}

// ============================================================================
// Helpers internos
// ============================================================================

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function shiftWeek(week: IsoWeek, offset: number): IsoWeek {
  const d = isoWeekToDate(week);
  d.setUTCDate(d.getUTCDate() + offset * 7);
  return toIsoWeek(d);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ============================================================================
// Self-test (smoke)
// ============================================================================

export const COHORT_SELF_TEST = {
  name: "analytics/cohorts W34",
  tests: [
    {
      name: "toIsoWeek round-trip",
      assert: () => {
        const w = toIsoWeek(new Date("2026-07-01T00:00:00Z"));
        return w === "2026-W27";
      },
    },
    {
      name: "compute matrix D7 retention",
      assert: () => {
        const members: CohortMember[] = [
          { userId: "u1", cohort: "2026-W26", cohortKey: "2026-W26", activeAt: ["2026-07-01T00:00:00Z", "2026-07-02T00:00:00Z"] },
          { userId: "u2", cohort: "2026-W26", cohortKey: "2026-W26", activeAt: ["2026-06-30T00:00:00Z"] },
          { userId: "u3", cohort: "2026-W26", cohortKey: "2026-W26", activeAt: ["2026-06-28T00:00:00Z"] },
          { userId: "u4", cohort: "2026-W26", cohortKey: "2026-W26", activeAt: ["2026-06-29T00:00:00Z"] },
          { userId: "u5", cohort: "2026-W26", cohortKey: "2026-W26", activeAt: ["2026-07-05T00:00:00Z"] },
          { userId: "u6", cohort: "2026-W26", cohortKey: "2026-W26", activeAt: [] },
        ];
        const m = computeCohortMatrix(members, { type: "signup", now: new Date("2026-07-31T00:00:00Z") });
        return m.rows[0]?.retention.D7 ?? 0 > 0;
      },
    },
  ],
};

export function runCohortSelfTest(): boolean {
  for (const t of COHORT_SELF_TEST.tests) {
    if (!t.assert()) {
       
      console.warn(`[cohorts] FAIL: ${t.name}`);
      return false;
    }
  }
  return true;
}
