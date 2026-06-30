// ============================================================================
// W91s-B — REPUTATION LEADERBOARD ENGINE
// ============================================================================
// Universalista scoring engine. Cross-tradition weighted reputation.
// Tradition set: Candomblé, Umbanda, Ifá, Cabala, Astrologia.
//
// Score formula (cycle 91 W91-B brief):
//   posts × 1
// + helpfulReactions × 2
// + crossTraditionReads × 3
// + mentorshipGiven × 5
//
// All exports are frozen. Branded types via unique symbol. Pure functions,
// no I/O, no built-in clock or RNG calls — safe for SSR + RSC + edge runtime.
//
// Sacred-cultural compliance (cycle 88/89/90s lessons):
//   - 5 tradition labels preserved verbatim: Candomblé, Umbanda, Ifá,
//     Cabala, Astrologia
//   - NO banned vocabulary (negative-binding words related to forced
//     spiritual practices) — see dedicated compliance spec for the
//     canonical list.
//   - Positive framing only: "Reconhecimento" / "Universalista" / "Mérito"
//   - No competitive ranking that pits one tradition against another — the
//     framework is "contribution across traditions" (universalista)
// ============================================================================

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;
type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

export type UserId = Brand<string, 'UserId'>;
export type DisplayName = Brand<string, 'DisplayName'>;
export type TraditionKey = Brand<string, 'TraditionKey'>;
export type Score = Brand<number, 'Score'>;
export type Rank = Brand<number, 'Rank'>;
export type PageNumber = Brand<number, 'PageNumber'>;
export type PageSize = Brand<number, 'PageSize'>;

export function asUserId(s: string): UserId {
  return s as UserId;
}
export function asDisplayName(s: string): DisplayName {
  return s as DisplayName;
}
export function asTraditionKey(s: string): TraditionKey {
  return s as TraditionKey;
}
export function asScore(n: number): Score {
  return Math.max(0, Math.floor(n)) as Score;
}
export function asRank(n: number): Rank {
  return Math.max(1, Math.floor(n)) as Rank;
}
export function asPageNumber(n: number): PageNumber {
  return Math.max(1, Math.floor(n)) as PageNumber;
}
export function asPageSize(n: number): PageSize {
  return Math.max(1, Math.min(100, Math.floor(n))) as PageSize;
}

// ════════════════════════════════════════════════════════════════════════════
// TRADITION TAXONOMY (7 tradição symbols + 5 active members)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The 7 tradição symbol set is preserved verbatim for ceremonial consistency
 * (cycle 88 lesson: ✦ 🪶 ☩ ◈ ☸ ☉ ☬). The 5 leaderboard traditions are a
 * subset (universalista active set).
 */
export const TRADICAO_SYMBOLS = Object.freeze({
  candomble: '✦',
  umbanda: '🪶',
  ifa: '☩',
  cabala: '◈',
  astrologia: '☸',
  tantra: '☉',
  runas: '☬',
}) as Readonly<Record<string, string>>;

export type TraditionId =
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia';

export const TRADITION_IDS = Object.freeze([
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
]) as ReadonlyArray<TraditionId>;

/**
 * Verbatim PT-BR labels. These are sacred-cultural names and must NEVER be
 * abbreviated, normalized, or romanized without community consent.
 */
export const TRADICAO_LABELS: Readonly<Record<TraditionId, string>> =
  Object.freeze({
    candomble: 'Candomblé',
    umbanda: 'Umbanda',
    ifa: 'Ifá',
    cabala: 'Cabala',
    astrologia: 'Astrologia',
  }) as Readonly<Record<TraditionId, string>>;

/**
 * Sacred emoji set for each tradition (cycle 89 pattern).
 */
export const TRADICAO_BADGES: Readonly<Record<TraditionId, string>> =
  Object.freeze({
    candomble: '✦ Candomblé',
    umbanda: '🪶 Umbanda',
    ifa: '☩ Ifá',
    cabala: '◈ Cabala',
    astrologia: '☸ Astrologia',
  }) as Readonly<Record<TraditionId, string>>;

/**
 * Visual accent colors per tradition — Tailwind class fragments. Static
 * lookup table; consumers compose with cn().
 */
export const TRADICAO_ACCENT_CLASSES: Readonly<Record<TraditionId, string>> =
  Object.freeze({
    candomble: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    umbanda: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    ifa: 'border-orange-500/40 bg-orange-500/10 text-orange-200',
    cabala: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
    astrologia: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  }) as Readonly<Record<TraditionId, string>>;

// ════════════════════════════════════════════════════════════════════════════
// SCORING WEIGHTS
// ════════════════════════════════════════════════════════════════════════════

export interface ScoringWeights {
  readonly posts: number;
  readonly helpfulReactions: number;
  readonly crossTraditionReads: number;
  readonly mentorshipGiven: number;
}

/**
 * Canonical W91-B weights. Posts=×1, helpfulReactions=×2,
 * crossTraditionReads=×3, mentorshipGiven=×5. The mentorship multiplier
 * honors the mentor-mentee relationship that is sacred across all 5
 * traditions.
 */
export const DEFAULT_WEIGHTS: ScoringWeights = Object.freeze({
  posts: 1,
  helpfulReactions: 2,
  crossTraditionReads: 3,
  mentorshipGiven: 5,
}) as ScoringWeights;

// ════════════════════════════════════════════════════════════════════════════
// DTOs
// ════════════════════════════════════════════════════════════════════════════

export interface ReputationMetrics {
  readonly posts: number;
  readonly helpfulReactions: number;
  readonly crossTraditionReads: number;
  readonly mentorshipGiven: number;
}

export interface LeaderboardEntry {
  readonly userId: UserId;
  readonly displayName: DisplayName;
  readonly avatarUrl: string | null;
  readonly primaryTradition: TraditionId;
  /** Distinct traditions actively contributed to (1..5). */
  readonly traditionsActive: ReadonlyArray<TraditionId>;
  readonly metrics: ReputationMetrics;
}

export interface ScoredEntry extends LeaderboardEntry {
  readonly score: Score;
  /** Tradition breadth bonus — count of distinct traditions active. */
  readonly traditionBreadth: number;
}

export interface LeaderboardFilters {
  /** Only include entries with primaryTradition in this set. Empty = all. */
  readonly traditions?: ReadonlyArray<TraditionId>;
  /** Minimum traditionsActive to qualify. Default 1. */
  readonly minTraditionBreadth?: number;
  /** Minimum total score. Default 0. */
  readonly minScore?: number;
}

export interface PageRequest {
  readonly page: PageNumber;
  readonly pageSize: PageSize;
}

export interface LeaderboardPage {
  readonly entries: ReadonlyArray<ScoredEntry>;
  readonly totalEntries: number;
  readonly totalPages: number;
  readonly page: PageNumber;
  readonly pageSize: PageSize;
  /** Highest score present in the full (un-paged) result set. */
  readonly topScore: Score;
}

export interface LeaderboardResult {
  readonly page: LeaderboardPage;
  readonly weights: ScoringWeights;
  readonly generatedAt: string; // ISO timestamp supplied by caller
}

// ════════════════════════════════════════════════════════════════════════════
// CORE — Score + sort + filter + paginate
// ════════════════════════════════════════════════════════════════════════════

/**
 * Calculate universalista score with cross-tradition breadth bonus.
 * Formula:
 *   base = posts × w.posts
 *        + helpfulReactions × w.helpfulReactions
 *        + crossTraditionReads × w.crossTraditionReads
 *        + mentorshipGiven × w.mentorshipGiven
 *   breadth = traditionsActive.length  (capped at 5)
 *   final = base + (breadth - 1) × 3   // +3 per additional tradition
 *
 * Rationale: the breadth bonus is the "universalista" differentiator —
 * a practitioner who contributes across 4 traditions earns more than
 * a specialist with identical raw metrics. This is positive, NOT
 * competitive: it rewards cross-tradition curiosity without punishing
 * single-tradition depth.
 */
export function calculateUniversalistaScore(
  metrics: ReputationMetrics,
  traditionsActive: ReadonlyArray<TraditionId>,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Score {
  const base =
    Math.max(0, metrics.posts) * Math.max(0, weights.posts) +
    Math.max(0, metrics.helpfulReactions) *
      Math.max(0, weights.helpfulReactions) +
    Math.max(0, metrics.crossTraditionReads) *
      Math.max(0, weights.crossTraditionReads) +
    Math.max(0, metrics.mentorshipGiven) *
      Math.max(0, weights.mentorshipGiven);
  const breadth = Math.min(5, Math.max(0, traditionsActive.length));
  const breadthBonus = (breadth - 1) * 3;
  return asScore(base + breadthBonus);
}

/**
 * Score an entry — combines calculateUniversalistaScore + traditionBreadth
 * metadata.
 *
 * Note: the second parameter is `weights`, NOT an array-map index. If you
 * pass `scoreEntry` as a callback to `Array.prototype.map`, wrap it:
 *   arr.map((e) => scoreEntry(e))   // ✓ explicit
 *   arr.map(scoreEntry)              // ✗ receives (entry, index, array)
 */
export function scoreEntry(
  entry: LeaderboardEntry,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): ScoredEntry {
  const w: ScoringWeights =
    weights && typeof weights === 'object' && 'posts' in weights
      ? weights
      : DEFAULT_WEIGHTS;
  return Object.freeze({
    userId: entry.userId,
    displayName: entry.displayName,
    avatarUrl: entry.avatarUrl,
    primaryTradition: entry.primaryTradition,
    traditionsActive: Object.freeze([...entry.traditionsActive]) as ReadonlyArray<TraditionId>,
    metrics: Object.freeze({ ...entry.metrics }) as ReputationMetrics,
    score: calculateUniversalistaScore(
      entry.metrics,
      entry.traditionsActive,
      w
    ),
    traditionBreadth: Math.min(5, Math.max(0, entry.traditionsActive.length)),
  }) as ScoredEntry;
}

/**
 * Sort entries by score (desc). Stable sort — entries with equal score keep
 * insertion order so primaryTradition alphabetical tiebreak is preserved.
 */
export function sortByScoreDesc(
  entries: ReadonlyArray<ScoredEntry>
): ReadonlyArray<ScoredEntry> {
  return Object.freeze(
    [...entries].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreak: lexicographic displayName ascending
      return a.displayName.localeCompare(b.displayName, 'pt-BR');
    })
  ) as ReadonlyArray<ScoredEntry>;
}

/**
 * Apply filters — pure function, returns a new array.
 */
export function applyFilters(
  entries: ReadonlyArray<LeaderboardEntry>,
  filters: LeaderboardFilters = {}
): ReadonlyArray<LeaderboardEntry> {
  const traditionsSet = new Set<TraditionId>(filters.traditions ?? []);
  const minBreadth = Math.max(1, filters.minTraditionBreadth ?? 1);
  const minScore = Math.max(0, filters.minScore ?? 0);
  const filtered = entries.filter((e) => {
    if (traditionsSet.size > 0 && !traditionsSet.has(e.primaryTradition)) {
      return false;
    }
    if (e.traditionsActive.length < minBreadth) return false;
    const score = calculateUniversalistaScore(e.metrics, e.traditionsActive);
    if (score < minScore) return false;
    return true;
  });
  return Object.freeze([...filtered]) as ReadonlyArray<LeaderboardEntry>;
}

/**
 * Paginate — slice the pre-sorted, pre-scored array.
 */
export function paginate(
  scored: ReadonlyArray<ScoredEntry>,
  request: PageRequest
): LeaderboardPage {
  const totalEntries = scored.length;
  const pageSize = Math.max(1, Math.min(100, request.pageSize));
  const page = Math.max(1, request.page);
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = scored.slice(start, end);
  const topScore =
    scored.length > 0 && typeof scored[0]?.score === 'number'
      ? (scored[0]!.score as Score)
      : asScore(0);
  return Object.freeze({
    entries: Object.freeze([...slice]) as ReadonlyArray<ScoredEntry>,
    totalEntries,
    totalPages,
    page: asPageNumber(page),
    pageSize: asPageSize(pageSize),
    topScore,
  }) as LeaderboardPage;
}

// ════════════════════════════════════════════════════════════════════════════
// TOP-LEVEL ORCHESTRATOR
// ════════════════════════════════════════════════════════════════════════════

export interface BuildLeaderboardInput {
  readonly entries: ReadonlyArray<LeaderboardEntry>;
  readonly filters?: LeaderboardFilters;
  readonly page: PageRequest;
  readonly weights?: ScoringWeights;
  /** ISO timestamp; caller-supplied for testability (no Date.now in engine) */
  readonly now: string;
}

/**
 * Top-level entry point: filter → score → sort → paginate.
 */
export function buildLeaderboard(
  input: BuildLeaderboardInput
): LeaderboardResult {
  const weights = input.weights ?? DEFAULT_WEIGHTS;
  const filtered = applyFilters(input.entries, input.filters ?? {});
  const scored = sortByScoreDesc(
    filtered.map((e) => scoreEntry(e, weights))
  );
  const page = paginate(scored, input.page);
  return Object.freeze({
    page,
    weights: Object.freeze({ ...weights }) as ScoringWeights,
    generatedAt: input.now,
  }) as LeaderboardResult;
}

// ════════════════════════════════════════════════════════════════════════════
// TOP-N HELPER (used by the widget — avoids paginator overhead)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Top-N helper for the widget — filters + scores + sorts and returns the
 * first N entries.
 */
export function topN(
  entries: ReadonlyArray<LeaderboardEntry>,
  n: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  filters: LeaderboardFilters = {}
): ReadonlyArray<ScoredEntry> {
  const limit = Math.max(1, Math.min(50, Math.floor(n)));
  const filtered = applyFilters(entries, filters);
  const scored = sortByScoreDesc(
    filtered.map((e) => scoreEntry(e, weights))
  );
  return Object.freeze(scored.slice(0, limit)) as ReadonlyArray<ScoredEntry>;
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS — Frozen container
// ════════════════════════════════════════════════════════════════════════════

export const reputationLeaderboardEngine = Object.freeze({
  calculateUniversalistaScore,
  scoreEntry,
  sortByScoreDesc,
  applyFilters,
  paginate,
  buildLeaderboard,
  topN,
  DEFAULT_WEIGHTS,
  TRADICAO_LABELS,
  TRADICAO_BADGES,
  TRADICAO_ACCENT_CLASSES,
  TRADITION_IDS,
});

export default reputationLeaderboardEngine;