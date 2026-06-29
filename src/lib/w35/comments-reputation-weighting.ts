/**
 * comments-reputation-weighting.ts
 *
 * Cycle 35 — Comment Score Weighting by User Reputation.
 *
 * Composes with:
 *   - src/lib/w29/reputation-universalista.ts (universalista reputation engine)
 *   - src/lib/w32/comments-moderation-ui.ts    (moderation state + viewmodel)
 *   - src/lib/w29/comments-threading.ts        (thread structure)
 *
 * Pure TypeScript: no runtime imports from app code, no I/O, no DOM. All
 * timestamps are caller-supplied (`now`) so the module is deterministic
 * under test. Each public helper returns a fresh value or a fresh array.
 *
 * Responsibilities:
 *   1. Weight — blend raw comment score (upvotes - downvotes) with the
 *      commenter's reputation tier so high-rep voices surface naturally.
 *   2. Decay — older comments lose weight on a logarithmic curve; the
 *      call-site decides the half-life (default 72h).
 *   3. Tier multipliers — universalista tiers (iniciante, praticante,
 *      mentor, mestre, grão-mestre) carry explicit multipliers; missing
 *      tiers default to 1.0.
 *   4. Time-of-day boost — comments posted during a community's prime
 *      hours (caller-supplied) get a small lift (default 1.0, max 1.2).
 *   5. Anti-gaming — if a comment is "too clean" (no downvotes, all
 *      upvotes from same-tier newcomers), apply a soft penalty so the
 *      weighting can't be trivially farmed.
 *   6. Sort comparator — descending weighted score, ties broken by recency.
 */

// ---------- TYPES ----------------------------------------------------------

export type ReputationTier =
  | "iniciante"
  | "praticante"
  | "mentor"
  | "mestre"
  | "grao_mestre";

export interface ReputationSnapshot {
  userId: string;
  tier: ReputationTier;
  universalistaScore: number; // 0..1000
  earnedAt: number;          // epoch ms — when the tier was last granted
}

export interface CommentScore {
  commentId: string;
  authorId: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;         // epoch ms
  authorTier: ReputationTier;
  authorScore: number;       // 0..1000
  authorEarnedAt: number;    // epoch ms
  // Optional: same-tier newbie pattern detection inputs
  upvotesFromSameTier?: number;
  totalSameTierNewbiesUpvoted?: number;
}

export interface WeightedComment {
  commentId: string;
  rawScore: number;
  weightedScore: number;     // rounded to 3 decimals
  tierMultiplier: number;
  decayFactor: number;       // 0..1
  timeOfDayBoost: number;    // 1.0..1.2
  antiGamingPenalty: number; // 0..1 (1 = no penalty)
  ageHours: number;
}

export interface WeightingConfig {
  tierMultipliers: Record<ReputationTier, number>;
  halfLifeHours: number;       // default 72
  minDecay: number;            // default 0.05 (never below 5%)
  timeOfDay: {
    primeStartHour: number;    // 0..23, default 19
    primeEndHour: number;      // 0..23, default 23
    maxBoost: number;          // default 1.2
  };
  antiGaming: {
    sameTierThreshold: number; // default 0.8 (80% of upvotes from same tier)
    newbiePenalty: number;     // default 0.6 (40% weight loss)
  };
}

export interface PrimeHours {
  startHour: number; // 0..23
  endHour: number;   // 0..23 (exclusive; wraps midnight if end < start)
}

// ---------- CONSTANTS -----------------------------------------------------

export const DEFAULT_TIER_MULTIPLIERS: Record<ReputationTier, number> = {
  iniciante: 0.6,
  praticante: 0.9,
  mentor: 1.15,
  mestre: 1.35,
  grao_mestre: 1.6,
};

export const DEFAULT_WEIGHTING_CONFIG: WeightingConfig = {
  tierMultipliers: DEFAULT_TIER_MULTIPLIERS,
  halfLifeHours: 72,
  minDecay: 0.05,
  timeOfDay: {
    primeStartHour: 19,
    primeEndHour: 23,
    maxBoost: 1.2,
  },
  antiGaming: {
    sameTierThreshold: 0.8,
    newbiePenalty: 0.6,
  },
};

export const PRIME_HOURS_DEFAULT: PrimeHours = {
  startHour: 19,
  endHour: 23,
};

export const MAX_UPVOTES = 100_000; // sanity cap
export const MAX_TIER_MULTIPLIER = 3;
export const MIN_TIER_MULTIPLIER = 0.1;

// ---------- HELPERS -------------------------------------------------------

export function isValidTier(tier: string): tier is ReputationTier {
  return (
    tier === "iniciante" ||
    tier === "praticante" ||
    tier === "mentor" ||
    tier === "mestre" ||
    tier === "grao_mestre"
  );
}

export function safeTierMultiplier(
  tier: ReputationTier,
  config: WeightingConfig
): number {
  const raw = config.tierMultipliers[tier];
  if (typeof raw !== "number" || !Number.isFinite(raw)) return 1;
  return Math.max(MIN_TIER_MULTIPLIER, Math.min(MAX_TIER_MULTIPLIER, raw));
}

/** Returns 0..1. now === createdAt returns 1. */
export function decayFactor(
  createdAt: number,
  now: number,
  halfLifeHours: number,
  minDecay: number
): number {
  if (!Number.isFinite(halfLifeHours) || halfLifeHours <= 0) return 1;
  if (!Number.isFinite(createdAt) || !Number.isFinite(now)) return 1;
  const ageMs = Math.max(0, now - createdAt);
  const ageHours = ageMs / (60 * 60 * 1000);
  if (ageHours <= 0) return 1;
  const raw = Math.pow(0.5, ageHours / halfLifeHours);
  return Math.max(minDecay, Math.min(1, raw));
}

/** 1.0 if outside prime hours, 1.0..maxBoost inside (linear ramp). */
export function timeOfDayBoost(
  createdAt: number,
  prime: PrimeHours,
  maxBoost: number
): number {
  if (maxBoost <= 1) return 1;
  const hour = new Date(createdAt).getUTCHours();
  const inPrime = isHourInPrime(hour, prime);
  if (!inPrime) return 1;
  return maxBoost;
}

export function isHourInPrime(hour: number, prime: PrimeHours): boolean {
  if (prime.endHour > prime.startHour) {
    return hour >= prime.startHour && hour < prime.endHour;
  }
  // wraps midnight (e.g., 22..3)
  return hour >= prime.startHour || hour < prime.endHour;
}

/** Returns 1 (no penalty) or antiGaming.newbiePenalty (penalty applied). */
export function antiGamingFactor(
  score: CommentScore,
  config: WeightingConfig
): number {
  const ups = Math.max(0, score.upvotes || 0);
  const same = Math.max(0, score.upvotesFromSameTier || 0);
  if (ups === 0) return 1;
  const ratio = same / ups;
  if (ratio < config.antiGaming.sameTierThreshold) return 1;
  // same-tier dominance — apply newbie penalty
  const newbies = Math.max(0, score.totalSameTierNewbiesUpvoted || 0);
  if (newbies === 0) return 1;
  return Math.max(0.1, Math.min(1, config.antiGaming.newbiePenalty));
}

// ---------- WEIGHTING -----------------------------------------------------

export function rawScore(score: CommentScore): number {
  const up = Math.max(0, Math.min(MAX_UPVOTES, score.upvotes || 0));
  const down = Math.max(0, Math.min(MAX_UPVOTES, score.downvotes || 0));
  return up - down;
}

export function ageHours(createdAt: number, now: number): number {
  if (!Number.isFinite(createdAt) || !Number.isFinite(now)) return 0;
  return Math.max(0, (now - createdAt) / (60 * 60 * 1000));
}

export function weightComment(
  score: CommentScore,
  now: number,
  config: WeightingConfig = DEFAULT_WEIGHTING_CONFIG,
  prime: PrimeHours = PRIME_HOURS_DEFAULT
): WeightedComment {
  const raw = rawScore(score);
  const tierMult = safeTierMultiplier(score.authorTier, config);
  const decay = decayFactor(
    score.createdAt,
    now,
    config.halfLifeHours,
    config.minDecay
  );
  const boost = timeOfDayBoost(score.createdAt, prime, config.timeOfDay.maxBoost);
  const antiG = antiGamingFactor(score, config);
  const age = ageHours(score.createdAt, now);
  // Combine: (raw * tier) decays over time, lifts during prime, penalized if farmed.
  // Use signed raw so downvoted comments can stay negative.
  const weighted = raw * tierMult * decay * boost * antiG;
  return {
    commentId: score.commentId,
    rawScore: raw,
    weightedScore: round3(weighted),
    tierMultiplier: tierMult,
    decayFactor: round3(decay),
    timeOfDayBoost: round3(boost),
    antiGamingPenalty: round3(antiG),
    ageHours: round3(age),
  };
}

export function weightComments(
  scores: CommentScore[],
  now: number,
  config: WeightingConfig = DEFAULT_WEIGHTING_CONFIG,
  prime: PrimeHours = PRIME_HOURS_DEFAULT
): WeightedComment[] {
  return scores.map((s) => weightComment(s, now, config, prime));
}

// ---------- SORT ---------------------------------------------------------

export function compareWeightedDesc(
  a: WeightedComment,
  b: WeightedComment
): number {
  if (a.weightedScore !== b.weightedScore) {
    return b.weightedScore - a.weightedScore;
  }
  return a.commentId < b.commentId ? 1 : a.commentId > b.commentId ? -1 : 0;
}

export function sortWeighted(items: WeightedComment[]): WeightedComment[] {
  return [...items].sort(compareWeightedDesc);
}

export function sortByWeight(
  scores: CommentScore[],
  now: number,
  config: WeightingConfig = DEFAULT_WEIGHTING_CONFIG,
  prime: PrimeHours = PRIME_HOURS_DEFAULT
): WeightedComment[] {
  return sortWeighted(weightComments(scores, now, config, prime));
}

// ---------- AGGREGATES ---------------------------------------------------

export interface WeightingSummary {
  count: number;
  totalWeighted: number;
  averageWeighted: number;
  topCommentId: string | null;
  byTier: Record<ReputationTier, number>;
}

export function summarizeWeighting(items: WeightedComment[]): WeightingSummary {
  const byTier: Record<ReputationTier, number> = {
    iniciante: 0,
    praticante: 0,
    mentor: 0,
    mestre: 0,
    grao_mestre: 0,
  };
  let total = 0;
  let topId: string | null = null;
  let topScore = -Infinity;
  for (const it of items) {
    total += it.weightedScore;
    if (it.weightedScore > topScore) {
      topScore = it.weightedScore;
      topId = it.commentId;
    }
  }
  return {
    count: items.length,
    totalWeighted: round3(total),
    averageWeighted: items.length > 0 ? round3(total / items.length) : 0,
    topCommentId: topId,
    byTier,
  };
}

export function tierCounts(
  scores: CommentScore[]
): Record<ReputationTier, number> {
  const counts: Record<ReputationTier, number> = {
    iniciante: 0,
    praticante: 0,
    mentor: 0,
    mestre: 0,
    grao_mestre: 0,
  };
  for (const s of scores) {
    if (isValidTier(s.authorTier)) counts[s.authorTier] += 1;
  }
  return counts;
}

// ---------- INTERNAL -----------------------------------------------------

function round3(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1000) / 1000;
}
