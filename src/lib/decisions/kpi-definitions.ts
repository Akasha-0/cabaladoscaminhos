/**
 * decisions/kpi-definitions — 18 KPIs da open beta decision matrix (W37)
 * ============================================================================
 * Catálogo canônico dos 18 KPIs que alimentam o go/no-go da Wave 4 (open beta
 * 500 users). Cada KPI tem target, weight (importância), categoria (Retention,
 * Engagement, Health), direction (higher-is-better / lower-is-better / target-is-band),
 * e P0-flag (true = bloqueia GO se RED).
 *
 * Origem dos números:
 *   - W32-8 strategic plan (BETA-LAUNCH-STRATEGY-W32.md §4)
 *   - W37 open beta decision framework (WAVE-37-OPEN-BETA-DECISION.md)
 *   - Benchmarks externos (Phiture, Amplitude, web.dev thresholds)
 *
 * Pesos (somam ~1.0):
 *   - Retention (3 KPIs):  0.05 × 3 = 0.15  (validam H1)
 *   - Engagement (6 KPIs): 0.06 × 6 = 0.36  (validam H2/H3)
 *   - Health     (9 KPIs): 0.055 × 9 = 0.495 (risco operacional)
 *
 * Calibration:
 *   - Total weight = 0.15 + 0.36 + 0.495 = 1.005 (over-spec por arredondamento — OK)
 *   - P0 flags = 9 (todos os KPIs Health). Retention/Engagement NÃO são P0
 *     individualmente (um único KPI abaixo não bloqueia GO) — risco é
 *     AGREGADO via weighted score.
 *
 * LGPD:
 *   - Definições são puramente numéricas e categóricas.
 *   - Coleta de actuals acontece em collector separado (não nesta file).
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type KpiCategory = "retention" | "engagement" | "health";

/**
 * Direction:
 *   - "higher": actual >= target é bom. ex.: D7 retention, NPS.
 *   - "lower":  actual <= target é bom. ex.: p95 latency, crash rate.
 *   - "band":  actual em [target_min, target_max] é bom (pass-through).
 */
export type KpiDirection = "higher" | "lower" | "band";

export type TrafficLight = "green" | "yellow" | "red";

export interface KpiDefinition {
  /** Stable ID (kebab-case). */
  id: string;
  /** Human-readable label. */
  label: string;
  /** Long-form description of operational definition. */
  description: string;
  /** Cohort grouping. */
  category: KpiCategory;
  /** Unit (%, ms, count, etc.). Display only. */
  unit: string;
  /** Direction of goodness. */
  direction: KpiDirection;
  /** Target value (operational threshold). */
  target: number;
  /** For "band" direction only: lower bound. */
  targetMin?: number;
  /** For "band" direction only: upper bound. */
  targetMax?: number;
  /** Importance weight (0..1). All weights MUST sum to ~1.0. */
  weight: number;
  /** True = blocks GO if RED (P0 — primarily health metrics). */
  p0: boolean;
  /** Data source identifier (admin-friendly). */
  source: string;
}

// ============================================================================
// Cohort A — Retention (3 KPIs, total weight 0.15)
// ============================================================================

export const RETENTION_KPIS: KpiDefinition[] = [
  {
    id: "retention-d1",
    label: "D1 Retention",
    description:
      "Fraction of users who returned on the day after signup. Indicates onboarding quality.",
    category: "retention",
    unit: "%",
    direction: "higher",
    target: 50,
    weight: 0.05,
    p0: false,
    source: "PostHog `signup` → `active_next_day`",
  },
  {
    id: "retention-d7",
    label: "D7 Retention",
    description:
      "Fraction of users who had ≥ 1 session between D2 and D7 post-signup. Validates H1.",
    category: "retention",
    unit: "%",
    direction: "higher",
    target: 35,
    weight: 0.05,
    p0: false,
    source: "PostHog cohort matrix `computeCohortMatrix(type='signup')`",
  },
  {
    id: "retention-d30",
    label: "D30 Retention",
    description:
      "Fraction of users who had ≥ 1 session between D8 and D30 post-signup. Validates H1.",
    category: "retention",
    unit: "%",
    direction: "higher",
    target: 25,
    weight: 0.05,
    p0: false,
    source: "PostHog cohort matrix",
  },
];

// ============================================================================
// Cohort B — Engagement (6 KPIs, total weight 0.36)
// ============================================================================

export const ENGAGEMENT_KPIS: KpiDefinition[] = [
  {
    id: "engagement-dau-mau",
    label: "DAU/MAU Ratio",
    description:
      "Daily active users divided by monthly active users. Stickiness indicator.",
    category: "engagement",
    unit: "%",
    direction: "higher",
    target: 30,
    weight: 0.06,
    p0: false,
    source: "PostHog `daily_active` / `monthly_active`",
  },
  {
    id: "engagement-session-time",
    label: "Avg Session Time",
    description: "Median duration of a logged-in session in minutes.",
    category: "engagement",
    unit: "min",
    direction: "higher",
    target: 10,
    weight: 0.06,
    p0: false,
    source: "PostHog `session_duration`",
  },
  {
    id: "engagement-posts-per-week",
    label: "Posts / User / Week",
    description:
      "Average number of posts (top-level + comments) per active user per week.",
    category: "engagement",
    unit: "count",
    direction: "higher",
    target: 2,
    weight: 0.06,
    p0: false,
    source: "PostHog `post_created`",
  },
  {
    id: "engagement-akasha-convos",
    label: "Akasha Convos / User",
    description:
      "Average number of Akasha IA conversations per active user per month.",
    category: "engagement",
    unit: "count",
    direction: "higher",
    target: 5,
    weight: 0.06,
    p0: false,
    source: "PostHog `akasha_message_sent`",
  },
  {
    id: "engagement-nps",
    label: "NPS (Wave-aggregated)",
    description:
      "Net Promoter Score from in-app survey (Day 14 / Day 30). Scale 0–100.",
    category: "engagement",
    unit: "score",
    direction: "higher",
    target: 40,
    weight: 0.06,
    p0: false,
    source: "Survey engine + manual aggregation",
  },
  {
    id: "engagement-feature-adoption",
    label: "Feature Adoption Rate",
    description:
      "Fraction of active users who tried ≥ 3 distinct product features in 30d.",
    category: "engagement",
    unit: "%",
    direction: "higher",
    target: 60,
    weight: 0.06,
    p0: false,
    source: "PostHog `feature_used` (distinct feature count ≥ 3)",
  },
];

// ============================================================================
// Cohort C — Health (9 KPIs, total weight 0.495) — ALL P0
// ============================================================================

export const HEALTH_KPIS: KpiDefinition[] = [
  {
    id: "health-crash-free",
    label: "Crash-free Rate",
    description:
      "Fraction of all sessions without any reported exception (client + server).",
    category: "health",
    unit: "%",
    direction: "higher",
    target: 99,
    weight: 0.055,
    p0: true,
    source: "Sentry `sessions.crash_free`",
  },
  {
    id: "health-api-p95",
    label: "API Latency p95",
    description:
      "95th percentile of API response time across all routes, in seconds.",
    category: "health",
    unit: "s",
    direction: "lower",
    target: 2,
    weight: 0.055,
    p0: true,
    source: "PostHog `api_request_duration`",
  },
  {
    id: "health-lcp-p95",
    label: "LCP p95",
    description:
      "95th percentile of Largest Contentful Paint on the landing page.",
    category: "health",
    unit: "s",
    direction: "lower",
    target: 3,
    weight: 0.055,
    p0: true,
    source: "Web Vitals `web_vital_lcp`",
  },
  {
    id: "health-cls-p95",
    label: "CLS p95",
    description:
      "95th percentile of Cumulative Layout Shift across all pages.",
    category: "health",
    unit: "score",
    direction: "lower",
    target: 0.15,
    weight: 0.055,
    p0: true,
    source: "Web Vitals `web_vital_cls`",
  },
  {
    id: "health-inp-p95",
    label: "INP p95",
    description:
      "95th percentile of Interaction to Next Paint across user flows.",
    category: "health",
    unit: "ms",
    direction: "lower",
    target: 250,
    weight: 0.055,
    p0: true,
    source: "Web Vitals `web_vital_inp`",
  },
  {
    id: "health-auth-success",
    label: "Auth Success Rate",
    description:
      "Fraction of authentication attempts (login, signup, refresh) that succeed.",
    category: "health",
    unit: "%",
    direction: "higher",
    target: 97,
    weight: 0.055,
    p0: true,
    source: "Auth metrics `auth_success` / `auth_attempt`",
  },
  {
    id: "health-payment-success",
    label: "Payment Success Rate",
    description:
      "Fraction of checkout attempts that complete (Stripe + marketplace escrow).",
    category: "health",
    unit: "%",
    direction: "higher",
    target: 95,
    weight: 0.055,
    p0: true,
    source: "Stripe webhook + Marketplace escrow log",
  },
  {
    id: "health-akasha-refusal-precision",
    label: "Akasha Refusal Precision",
    description:
      "Among flagged refusals (harmful / off-topic), the fraction that are TRUE refusals (precision).",
    category: "health",
    unit: "%",
    direction: "higher",
    target: 85,
    weight: 0.055,
    p0: true,
    source: "Akasha audit log (manual weekly sample, n=50)",
  },
  {
    id: "health-moderation-sla",
    label: "Moderation Queue SLA",
    description:
      "Fraction of moderation reports reviewed within 24h (P1) / 12h (P2).",
    category: "health",
    unit: "%",
    direction: "higher",
    target: 90,
    weight: 0.055,
    p0: true,
    source: "Moderation queue log",
  },
];

// ============================================================================
// Aggregated catalog
// ============================================================================

export const ALL_KPIS: KpiDefinition[] = [
  ...RETENTION_KPIS,
  ...ENGAGEMENT_KPIS,
  ...HEALTH_KPIS,
];

export const KPI_BY_ID: Readonly<Record<string, KpiDefinition>> = Object.freeze(
  ALL_KPIS.reduce<Record<string, KpiDefinition>>((acc, k) => {
    acc[k.id] = k;
    return acc;
  }, {}),
);

export const TOTAL_WEIGHT: number = ALL_KPIS.reduce((sum, k) => sum + k.weight, 0);

// ============================================================================
// Zod schemas (for runtime validation of actual values passed to calculator)
// ============================================================================

export const KpiActualSchema = z.object({
  id: z.string(),
  actual: z.number().finite(),
});

export const KpiActualsSchema = z.array(KpiActualSchema).superRefine((rows, ctx) => {
  const ids = new Set(rows.map((r) => r.id));
  for (const kpi of ALL_KPIS) {
    if (!ids.has(kpi.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing actual for required KPI: ${kpi.id}`,
      });
    }
  }
});

export type KpiActual = z.infer<typeof KpiActualSchema>;
export type KpiActuals = z.infer<typeof KpiActualsSchema>;

// ============================================================================
// Sample actuals (placeholder for demo mode — actual integration will pull
// from PostHog / Sentry / Stripe / moderation log at T-3 day-of-decision)
// ============================================================================

export const SAMPLE_ACTUALS_W37: ReadonlyArray<{ id: string; actual: number }> =
  Object.freeze([
    { id: "retention-d1", actual: 55 },
    { id: "retention-d7", actual: 38 },
    { id: "retention-d30", actual: 27 },
    { id: "engagement-dau-mau", actual: 32 },
    { id: "engagement-session-time", actual: 12 },
    { id: "engagement-posts-per-week", actual: 2.4 },
    { id: "engagement-akasha-convos", actual: 6 },
    { id: "engagement-nps", actual: 45 },
    { id: "engagement-feature-adoption", actual: 65 },
    { id: "health-crash-free", actual: 99.4 },
    { id: "health-api-p95", actual: 1.8 },
    { id: "health-lcp-p95", actual: 2.7 },
    { id: "health-cls-p95", actual: 0.12 },
    { id: "health-inp-p95", actual: 220 },
    { id: "health-auth-success", actual: 98 },
    { id: "health-payment-success", actual: 96 },
    { id: "health-akasha-refusal-precision", actual: 87 },
    { id: "health-moderation-sla", actual: 92 },
  ]);
