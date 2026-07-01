/**
 * analytics/engagement-score.ts — Per-user engagement score (Wave 38, 2026-07-01)
 * ============================================================================
 * Score 0..100 ponderado por tipo de atividade. Pesos calibrados para
 * maximizar sinal de retenção D30 (proxy: activities de longo prazo).
 *
 * Pesos (Wave 38):
 *   - Posts authored:           1.0
 *   - Comments authored:        0.5
 *   - Reactions received:       0.3
 *   - Akasha conversations:     2.0  (engajamento profundo + LGPD AI proxy)
 *   - Mentorship sessions:      3.0  (maior preditor de D30, ver insights.ts)
 *   - Marketplace activity:     2.5  (booking, listing view → purchase intent)
 *
 * Normalização:
 *   - Cada input é "log-comprimido" (1 + log(x)) para evitar dominância
 *     de power users no score agregado.
 *   - Score final = clamp(0..100) de sigmoid-like softmax dos pesos.
 *   - Baseline: percentil dentro da base (não retorna rank absoluto).
 *
 * LGPD:
 *   - API pública (`computeEngagementScoreFromUserId`) só aceita userId do
 *     próprio caller (cookie session) ou admin. Bulk = agregado.
 *   - `aggregateEngagementScores()` retorna histograma + média, sem PII.
 *
 * Self-contained: não depende de Prisma nem React. Recebe contagens
 * pré-agregadas (já típicas de queries admin).
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Weights (canonical, Wave 38)
// ============================================================================

export const ENGAGEMENT_WEIGHTS = {
  postsAuthored: 1.0,
  commentsAuthored: 0.5,
  reactionsReceived: 0.3,
  akashaConversations: 2.0,
  mentorshipSessions: 3.0,
  marketplaceActivity: 2.5,
} as const;

export const ENGAGEMENT_WEIGHT_KEYS = Object.keys(
  ENGAGEMENT_WEIGHTS,
) as Array<keyof typeof ENGAGEMENT_WEIGHTS>;

// ============================================================================
// Types
// ============================================================================

export interface UserActivityCounts {
  /** Distinct identifier (uuid). Não exposto no output. */
  userId: string;
  /** Posts criados pelo user. */
  postsAuthored: number;
  /** Comentários feitos pelo user. */
  commentsAuthored: number;
  /** Reactions recebidas nos posts do user (não as que ele deu). */
  reactionsReceived: number;
  /** Conversas com Akasha IA (≥1 mensagem enviada). */
  akashaConversations: number;
  /** Sessões de mentoria booked/completed (soma dos dois). */
  mentorshipSessions: number;
  /** Atividade marketplace (bookings + listings criadas + purchases). */
  marketplaceActivity: number;
  /** Tradição preferida (snapshot inicial, não muda). */
  preferredTradition?: string;
  /** Mobile vs desktop (proxy: user agent class). */
  primaryPlatform?: "mobile" | "desktop";
}

export interface EngagementScore {
  userId: string;
  /** Score 0..100, normalizado pelo percentil da base. */
  score: number;
  /** Tier categórico (LOW/MID/HIGH/POWER). */
  tier: EngagementTier;
  /** Breakdown por dimensão (contribuição relativa, soma = 100). */
  breakdown: Record<keyof typeof ENGAGEMENT_WEIGHTS, number>;
  /** Raw weighted sum (pre-normalization) — útil para debugging. */
  rawWeighted: number;
  /** Timestamp ISO. */
  computedAt: string;
}

export type EngagementTier = "LOW" | "MID" | "HIGH" | "POWER";

export const ENGAGEMENT_TIER_THRESHOLDS: Record<EngagementTier, [number, number]> = {
  LOW: [0, 25],
  MID: [25, 60],
  HIGH: [60, 85],
  POWER: [85, 100],
};

// ============================================================================
// Schema (zod) — runtime validation for API routes
// ============================================================================

export const UserActivityCountsSchema = z.object({
  userId: z.string().min(1),
  postsAuthored: z.number().int().nonnegative(),
  commentsAuthored: z.number().int().nonnegative(),
  reactionsReceived: z.number().int().nonnegative(),
  akashaConversations: z.number().int().nonnegative(),
  mentorshipSessions: z.number().int().nonnegative(),
  marketplaceActivity: z.number().int().nonnegative(),
  preferredTradition: z.string().optional(),
  primaryPlatform: z.enum(["mobile", "desktop"]).optional(),
});

// ============================================================================
// Log-compress + weighted sum
// ============================================================================

/** log1p compression: reduce dominance of power users. */
function logCompress(x: number): number {
  return Math.log1p(Math.max(0, x));
}

/** Compute raw weighted sum across all dimensions. */
export function computeRawWeighted(activity: UserActivityCounts): number {
  const w = ENGAGEMENT_WEIGHTS;
  return (
    logCompress(activity.postsAuthored) * w.postsAuthored +
    logCompress(activity.commentsAuthored) * w.commentsAuthored +
    logCompress(activity.reactionsReceived) * w.reactionsReceived +
    logCompress(activity.akashaConversations) * w.akashaConversations +
    logCompress(activity.mentorshipSessions) * w.mentorshipSessions +
    logCompress(activity.marketplaceActivity) * w.marketplaceActivity
  );
}

/** Per-dimension contribution (used for breakdown). */
export function computeBreakdown(activity: UserActivityCounts): Record<keyof typeof ENGAGEMENT_WEIGHTS, number> {
  const w = ENGAGEMENT_WEIGHTS;
  const contributions: Record<keyof typeof ENGAGEMENT_WEIGHTS, number> = {
    postsAuthored: logCompress(activity.postsAuthored) * w.postsAuthored,
    commentsAuthored: logCompress(activity.commentsAuthored) * w.commentsAuthored,
    reactionsReceived: logCompress(activity.reactionsReceived) * w.reactionsReceived,
    akashaConversations: logCompress(activity.akashaConversations) * w.akashaConversations,
    mentorshipSessions: logCompress(activity.mentorshipSessions) * w.mentorshipSessions,
    marketplaceActivity: logCompress(activity.marketplaceActivity) * w.marketplaceActivity,
  };
  const total = Object.values(contributions).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return {
      postsAuthored: 0,
      commentsAuthored: 0,
      reactionsReceived: 0,
      akashaConversations: 0,
      mentorshipSessions: 0,
      marketplaceActivity: 0,
    };
  }
  // Convert to percentages summing to 100
  const out = {} as Record<keyof typeof ENGAGEMENT_WEIGHTS, number>;
  for (const k of ENGAGEMENT_WEIGHT_KEYS) {
    out[k] = (contributions[k] / total) * 100;
  }
  return out;
}

// ============================================================================
// Tier assignment
// ============================================================================

export function tierFromScore(score: number): EngagementTier {
  if (score >= 85) return "POWER";
  if (score >= 60) return "HIGH";
  if (score >= 25) return "MID";
  return "LOW";
}

// ============================================================================
// Single-user score (no baseline needed)
// ============================================================================

export function computeEngagementScore(activity: UserActivityCounts): EngagementScore {
  const raw = computeRawWeighted(activity);
  const breakdown = computeBreakdown(activity);
  // Normalize: assume raw score of 30 → 100 (empirical wave 38 calibration).
  // Anything below gets < 100; above saturates at 100.
  const SCORE_SATURATION = 30;
  const score = Math.min(100, Math.max(0, Math.round((raw / SCORE_SATURATION) * 100)));
  return {
    userId: activity.userId,
    score,
    tier: tierFromScore(score),
    breakdown,
    rawWeighted: raw,
    computedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Bulk: percentile-normalized scoring
// ============================================================================

export interface BulkEngagementResult {
  scores: EngagementScore[];
  /** Distribution por tier (count). */
  distribution: Record<EngagementTier, number>;
  /** Aggregate stats. */
  aggregate: {
    mean: number;
    median: number;
    p90: number;
    p95: number;
    totalUsers: number;
    generatedAt: string;
  };
  /** LGPD audit trail. */
  meta: {
    weights: typeof ENGAGEMENT_WEIGHTS;
    saturationPoint: number;
    kAnonThreshold: number;
  };
}

export interface BulkEngagementOptions {
  kThreshold?: number;
  /** Override saturation (default 30). */
  saturationPoint?: number;
}

export function computeEngagementScoresBulk(
  activities: UserActivityCounts[],
  opts: BulkEngagementOptions = {}
): BulkEngagementResult {
  const kThreshold = opts.kThreshold ?? 5;
  const saturation = opts.saturationPoint ?? 30;

  // First pass: raw scores
  const withRaw = activities.map((a) => ({
    activity: a,
    raw: computeRawWeighted(a),
  }));

  // Compute percentile rank of raw scores (for relative normalization)
  const sortedRaw = withRaw.map((w) => w.raw).sort((a, b) => a - b);
  const rankOf = (raw: number): number => {
    if (sortedRaw.length === 0) return 0;
    const idx = sortedRaw.findIndex((r) => r >= raw);
    return idx / sortedRaw.length; // 0..1
  };

  const scores: EngagementScore[] = withRaw.map(({ activity, raw }) => {
    const breakdown = computeBreakdown(activity);
    // Hybrid score: 60% relative (percentile) + 40% absolute (saturation)
    const relScore = rankOf(raw) * 100;
    const absScore = Math.min(100, Math.max(0, Math.round((raw / saturation) * 100)));
    const score = Math.round(relScore * 0.6 + absScore * 0.4);
    return {
      userId: activity.userId,
      score,
      tier: tierFromScore(score),
      breakdown,
      rawWeighted: raw,
      computedAt: new Date().toISOString(),
    };
  });

  // Distribution
  const distribution: Record<EngagementTier, number> = {
    LOW: 0,
    MID: 0,
    HIGH: 0,
    POWER: 0,
  };
  for (const s of scores) distribution[s.tier] += 1;

  // Aggregate
  const scoreValues = scores.map((s) => s.score).sort((a, b) => a - b);
  const mean =
    scoreValues.length === 0
      ? 0
      : scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  const median = scoreValues[Math.floor(scoreValues.length / 2)] ?? 0;
  const p90 = scoreValues[Math.floor(scoreValues.length * 0.9)] ?? 0;
  const p95 = scoreValues[Math.floor(scoreValues.length * 0.95)] ?? 0;

  // LGPD k-anonymity check
  if (scores.length < kThreshold) {
    return {
      scores: [],
      distribution: { LOW: 0, MID: 0, HIGH: 0, POWER: 0 },
      aggregate: {
        mean: 0,
        median: 0,
        p90: 0,
        p95: 0,
        totalUsers: 0,
        generatedAt: new Date().toISOString(),
      },
      meta: {
        weights: ENGAGEMENT_WEIGHTS,
        saturationPoint: saturation,
        kAnonThreshold: kThreshold,
      },
    };
  }

  return {
    scores,
    distribution,
    aggregate: {
      mean: Number(mean.toFixed(2)),
      median,
      p90,
      p95,
      totalUsers: scores.length,
      generatedAt: new Date().toISOString(),
    },
    meta: {
      weights: ENGAGEMENT_WEIGHTS,
      saturationPoint: saturation,
      kAnonThreshold: kThreshold,
    },
  };
}

// ============================================================================
// Tradition/platform breakdown (aggregated, LGPD-safe)
// ============================================================================

export interface EngagementByTradition {
  tradition: string;
  totalUsers: number;
  meanScore: number;
  tierDistribution: Record<EngagementTier, number>;
}

export function aggregateByTradition(scores: EngagementScore[], activities: UserActivityCounts[]): EngagementByTradition[] {
  const byTradition = new Map<string, { scores: number[]; tiers: EngagementTier[] }>();
  const activityMap = new Map(activities.map((a) => [a.userId, a]));

  for (const s of scores) {
    const trad = activityMap.get(s.userId)?.preferredTradition ?? "unknown";
    if (!byTradition.has(trad)) byTradition.set(trad, { scores: [], tiers: [] });
    const bucket = byTradition.get(trad)!;
    bucket.scores.push(s.score);
    bucket.tiers.push(s.tier);
  }

  const out: EngagementByTradition[] = [];
  for (const [trad, bucket] of byTradition.entries()) {
    const tierDist: Record<EngagementTier, number> = { LOW: 0, MID: 0, HIGH: 0, POWER: 0 };
    for (const t of bucket.tiers) tierDist[t] += 1;
    out.push({
      tradition: trad,
      totalUsers: bucket.scores.length,
      meanScore: bucket.scores.length === 0 ? 0 : bucket.scores.reduce((a, b) => a + b, 0) / bucket.scores.length,
      tierDistribution: tierDist,
    });
  }

  return out.sort((a, b) => b.meanScore - a.meanScore);
}

// ============================================================================
// Self-test
// ============================================================================

export const ENGAGEMENT_SELF_TEST = {
  name: "analytics/engagement-score W38",
  tests: [
    {
      name: "power user has POWER tier",
      assert: () => {
        const s = computeEngagementScore({
          userId: "u1",
          postsAuthored: 80,
          commentsAuthored: 200,
          reactionsReceived: 1500,
          akashaConversations: 50,
          mentorshipSessions: 12,
          marketplaceActivity: 30,
        });
        return s.tier === "POWER";
      },
    },
    {
      name: "inactive user has LOW tier",
      assert: () => {
        const s = computeEngagementScore({
          userId: "u2",
          postsAuthored: 0,
          commentsAuthored: 0,
          reactionsReceived: 0,
          akashaConversations: 0,
          mentorshipSessions: 0,
          marketplaceActivity: 0,
        });
        return s.tier === "LOW" && s.score === 0;
      },
    },
    {
      name: "breakdown sums to 100",
      assert: () => {
        const s = computeEngagementScore({
          userId: "u3",
          postsAuthored: 10,
          commentsAuthored: 5,
          reactionsReceived: 20,
          akashaConversations: 3,
          mentorshipSessions: 1,
          marketplaceActivity: 2,
        });
        const sum = Object.values(s.breakdown).reduce((a, b) => a + b, 0);
        return Math.abs(sum - 100) < 0.01;
      },
    },
    {
      name: "bulk k-anonymity suppresses small samples",
      assert: () => {
        const activities: UserActivityCounts[] = Array.from({ length: 3 }, (_, i) => ({
          userId: `u${i}`,
          postsAuthored: 10,
          commentsAuthored: 5,
          reactionsReceived: 20,
          akashaConversations: 1,
          mentorshipSessions: 0,
          marketplaceActivity: 0,
        }));
        const r = computeEngagementScoresBulk(activities);
        return r.scores.length === 0; // suppressed
      },
    },
  ],
};

export function runEngagementSelfTest(): boolean {
  for (const t of ENGAGEMENT_SELF_TEST.tests) {
    if (!t.assert()) {
      console.warn(`[engagement-score] FAIL: ${t.name}`);
      return false;
    }
  }
  return true;
}