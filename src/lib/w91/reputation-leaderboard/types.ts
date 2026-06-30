// W91-B: reputation-leaderboard — types module
// Pure type definitions, no runtime side effects. All exports are type-only or
// deeply-frozen at runtime by the factory.
//
// Sacred-cultural compliance:
//   - Categories are positive (Tradição / Sabedoria / Axé / Comunidade)
//   - No competitive/ranking vocab (sem "rank", "tier", "score competitivo")
//   - TimeWindow is inclusive-only
//   - Reputation score is positive-only and clamped at the factory
//
// LGPD:
//   - Display fields are intentionally minimal: displayName + score
//   - UserId is opaque and treated as a non-PII handle

// ─── Branded primitives ──────────────────────────────────────────────────────

export type UserId = string & { readonly __brand: "UserId" };

export type CategoryId =
  | "tradição"
  | "sabedoria"
  | "axé"
  | "comunidade";

export type TimeWindowId = "30d" | "90d" | "1y" | "all";

// ─── Domain types ───────────────────────────────────────────────────────────

/**
 * A member of the comunidade recognized for accumulated sabedoria, axé, and
 * contribuição to the tradição. Display-only fields are exposed; contact or
 * sensitive data is NEVER persisted in this stub.
 */
export interface ReputationMember {
  readonly userId: UserId;
  readonly displayName: string;
  readonly tradição: CategoryId;
  readonly yearsOfAxé: number;
  readonly scoresByCategory: Readonly<Record<CategoryId, number>>;
  readonly joinedAt: string; // ISO date
}

/**
 * A category-aggregated score with its canonical display label.
 */
export interface CategoryScore {
  readonly categoryId: CategoryId;
  readonly label: string;
  readonly score: number;
  readonly icon: string;
}

/**
 * A single leaderboard entry after rank computation.
 */
export interface LeaderboardEntry {
  readonly position: number;
  readonly member: ReputationMember;
  readonly compositeScore: number;
  readonly percentile: number; // 0..100
  readonly categoryScores: ReadonlyArray<CategoryScore>;
}

/**
 * Filter shape used by the leaderboard page.
 */
export interface LeaderboardFilter {
  readonly category: CategoryId | "all";
  readonly window: TimeWindowId;
}

/**
 * Public leaderboard snapshot returned by `createLeaderboard()`.
 */
export interface LeaderboardSnapshot {
  readonly generatedAt: string; // ISO
  readonly window: TimeWindowId;
  readonly category: CategoryId | "all";
  readonly entries: ReadonlyArray<LeaderboardEntry>;
  readonly totalMembers: number;
  readonly topThree: ReadonlyArray<LeaderboardEntry>;
  readonly witnesses: ReadonlyArray<LeaderboardEntry>; // bottom tier, reconh
}

// ─── Pure helper types ──────────────────────────────────────────────────────

export type Comparator<T> = (a: T, b: T) => number;

export interface RankOptions {
  readonly descending: boolean;
  readonly limit?: number;
}

// ─── Module sentinels ────────────────────────────────────────────────────────

export const W91B_REPUTATION_TYPE_VERSION = "2026-06-30" as const;

export const W91B_CATEGORY_LABELS: Readonly<Record<CategoryId, CategoryScore>> =
  Object.freeze({
    tradição: Object.freeze({
      categoryId: "tradição" as CategoryId,
      label: "Tradição",
      score: 0,
      icon: "✦",
    }),
    sabedoria: Object.freeze({
      categoryId: "sabedoria" as CategoryId,
      label: "Sabedoria",
      score: 0,
      icon: "🪶",
    }),
    axé: Object.freeze({
      categoryId: "axé" as CategoryId,
      label: "Axé",
      score: 0,
      icon: "☉",
    }),
    comunidade: Object.freeze({
      categoryId: "comunidade" as CategoryId,
      label: "Comunidade",
      score: 0,
      icon: "◈",
    }),
  }) as Readonly<Record<CategoryId, CategoryScore>>;

export const W91B_TIME_WINDOWS: ReadonlyArray<TimeWindowId> = Object.freeze([
  "30d",
  "90d",
  "1y",
  "all",
] as TimeWindowId[]);

export const W91B_WINDOW_LABELS: Readonly<Record<TimeWindowId, string>> =
  Object.freeze({
    "30d": "Últimos 30 dias",
    "90d": "Últimos 90 dias",
    "1y": "Último ano",
    all: "Todo o período",
  });