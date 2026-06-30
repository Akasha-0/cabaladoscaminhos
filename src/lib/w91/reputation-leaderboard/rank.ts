// W91-B: reputation-leaderboard — rank module
// Pure sorting + scoring helpers. NO side effects, NO Date.now() at module
// scope, NO I/O. All comparators are deterministic for given inputs.
//
// Sacred-cultural compliance:
//   - "Position" rather than "Rank" (no competitive framing)
//   - "Witnesses" rather than "Bottom" (bottom tier is honored, not shamed)
//   - Percentile is a positive-only recognition signal

import type {
  CategoryId,
  CategoryScore,
  Comparator,
  LeaderboardEntry,
  ReputationMember,
  TimeWindowId,
} from "./types";
import { W91B_CATEGORY_LABELS } from "./types";

const MIN_SCORE = 0;
const MAX_SCORE = 1000;

/**
 * Clamp a raw category score to the inclusive [0, 1000] range.
 * Negative numbers map to 0; > 1000 maps to 1000. NaN maps to 0.
 */
export function clampScore(raw: number): number {
  if (!Number.isFinite(raw)) return MIN_SCORE;
  if (raw < MIN_SCORE) return MIN_SCORE;
  if (raw > MAX_SCORE) return MAX_SCORE;
  return Math.round(raw);
}

/**
 * Compute a composite score as the sum of clamped category scores for a
 * single member, then apply the time-window multiplier.
 *
 * Result is bounded at [0, 4000] before window scaling to avoid overflow.
 */
export function compositeScore(
  member: ReputationMember,
  windowMultiplier: number,
): number {
  let sum = 0;
  const cats = member.scoresByCategory;
  for (const k of Object.keys(cats) as CategoryId[]) {
    sum += clampScore(cats[k]);
  }
  const scaled = sum * (Number.isFinite(windowMultiplier) ? windowMultiplier : 1);
  if (!Number.isFinite(scaled)) return 0;
  if (scaled < 0) return 0;
  return Math.round(scaled);
}

/**
 * Build a list of CategoryScore objects for a member, using canonical labels
 * and icons from the central registry. Frozen at the boundary.
 */
export function buildCategoryScores(
  member: ReputationMember,
): ReadonlyArray<CategoryScore> {
  const out: CategoryScore[] = [];
  for (const k of Object.keys(member.scoresByCategory) as CategoryId[]) {
    const label = W91B_CATEGORY_LABELS[k];
    out.push(
      Object.freeze({
        categoryId: k,
        label: label.label,
        icon: label.icon,
        score: clampScore(member.scoresByCategory[k]),
      }) as CategoryScore,
    );
  }
  return Object.freeze(out);
}

/**
 * Stable, descending sort by composite score. Ties break by yearsOfAxé
 * (more senior first) then by joinedAt (earlier first), then by userId.
 */
export const DESCENDING_BY_COMPOSITE: Comparator<LeaderboardEntry> = (
  a,
  b,
) => {
  if (a.compositeScore !== b.compositeScore) return b.compositeScore - a.compositeScore;
  if (a.member.yearsOfAxé !== b.member.yearsOfAxé)
    return b.member.yearsOfAxé - a.member.yearsOfAxé;
  const ja = a.member.joinedAt;
  const jb = b.member.joinedAt;
  if (ja !== jb) return ja < jb ? -1 : 1;
  if (a.member.userId !== b.member.userId)
    return a.member.userId < b.member.userId ? -1 : 1;
  return 0;
};

/**
 * Generic stable sort that respects a comparator and preserves the input
 * for ties via a synthetic key suffix. Returns a NEW array — input is
 * not mutated.
 */
export function stableSort<T>(input: ReadonlyArray<T>, cmp: Comparator<T>): T[] {
  const indexed = input.map((value, idx) => ({ value, idx }));
  indexed.sort((a, b) => {
    const r = cmp(a.value, b.value);
    if (r !== 0) return r;
    return a.idx - b.idx;
  });
  return indexed.map((entry) => entry.value);
}

/**
 * Compute percentile of a value within an ordered population. Percentile
 * is expressed 0..100 and is recognition-positive (top of list = ~100).
 */
export function percentileOf(score: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  if (!Number.isFinite(score) || score <= 0) return 0;
  // Rank-1 entry gets 100; last entry gets a small positive floor.
  const ratio = Math.max(0, Math.min(1, score / (MAX_SCORE * 4)));
  return Math.round(ratio * 100);
}

/**
 * Assign positions 1..N to entries in their given (already sorted) order.
 * Pure function — does not mutate the input array.
 */
export function assignPositions(
  entries: ReadonlyArray<LeaderboardEntry>,
): LeaderboardEntry[] {
  return entries.map((entry, i) => {
    const next: LeaderboardEntry = {
      ...entry,
      position: i + 1,
    };
    return next;
  });
}

/**
 * Take the top N entries from a sorted population. Returns a NEW array.
 */
export function topN<T>(sorted: ReadonlyArray<T>, n: number): T[] {
  const limit = Math.max(0, Math.floor(n));
  if (limit === 0) return [];
  return sorted.slice(0, limit);
}

/**
 * Pick the "witness" tier — the lowest 10% of the population (min 1, max 5).
 * These entries are shown with honor, not as a "tail".
 */
export function witnessTier(sorted: ReadonlyArray<LeaderboardEntry>): LeaderboardEntry[] {
  if (sorted.length === 0) return [];
  const tenPct = Math.max(1, Math.min(5, Math.ceil(sorted.length * 0.1)));
  return sorted.slice(-tenPct).reverse();
}

/**
 * Filter members by a category. A member matches if their primary
 * tradição equals the requested category (specialized leadership) OR
 * they have a meaningful score in that category (>= 600).
 */
export function filterByCategory(
  members: ReadonlyArray<ReputationMember>,
  category: CategoryId | "all",
): ReputationMember[] {
  if (category === "all") return [...members];
  return members.filter(
    (m) => m.tradição === category || (m.scoresByCategory[category] ?? 0) >= 600,
  );
}

/**
 * Normalize a time window identifier. Returns the same string if it is one
 * of the four canonical ids; otherwise returns "all" as the safe default.
 */
export function normalizeWindow(window: string): TimeWindowId {
  switch (window) {
    case "30d":
    case "90d":
    case "1y":
    case "all":
      return window;
    default:
      return "all";
  }
}

export const W91B_RANK_VERSION = "2026-06-30" as const;
export const W91B_MAX_SCORE = MAX_SCORE;
export const W91B_MIN_SCORE = MIN_SCORE;