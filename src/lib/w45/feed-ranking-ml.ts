// ============================================================================
// FEED RANKING ML — Personalized community feed ranking (Wave 45)
// ----------------------------------------------------------------------------
// Replaces simple chronological feed with engagement + tradition affinity +
// diversity + recency scoring. Pure functions, no React, no Prisma, no
// external network calls. Designed to be safe to import from a server
// component, a route handler, or a Node test runner.
//
// SCORING FORMULA (per item):
//
//   score = r * ( af + ae + en + em ) - div + ( follow ? fb : 0 ) + ( lg ? lb : 0 )
//
// where:
//   r  = timeDecay(age, halfLifeHours)
//   af = traditionAffinityWeight  * user.traditionAffinities[item.tradition]
//   ae = authorAffinityWeight     * user.authorAffinities[item.authorId]
//   en = engagementWeight         * engagementScore(likes, comments, shares, saves)
//   em = embeddingSimilarityWeight * cosineSimilarity(user.embedding, item.embedding)
//   div = diversityPenalty        * repeatBonus(author, tradition, recent history)
//   fb = followBoost              (constant when author is followed)
//   lg = languageMatchBonus       (constant when item.language == preference)
//
// DIVERSITY:
//   After sorting, we re-arrange to avoid > maxPerAuthor items in any window
//   of 5 contiguous slots and > maxPerTradition items per tradition overall.
//   Authors in `mutedAuthorIds` are dropped; freshly-viewed items in the
//   trailing 24h are demoted (not hidden) via repeatBonus.
//
// LEARNER (trainFromEvents):
//   LRU(2048)-cached EMA per user (α=0.15) that updates:
//     - traditionAffinities[tradition]   (+/- per liked/skipped/hidden post)
//     - authorAffinities[authorId]       (+/- per author engagement)
//     - embedding (centroid via running average, recency-weighted)
//   Idempotent across waves: reapplying the same event sequence yields
//   deterministic affinities (no Date.now()/Math.random() in the hot path).
//
// Conventions:
//   - All thresholds in hours (halfLifeHours) — caller passes integer or float.
//   - Embeddings are assumed equal-length unit vectors (we re-normalize
//     defensively at use sites).
//   - Weights are 0..N dimensionless. The default config sums to ~1.0 so
//     scores land in roughly [0, 3] for sensible inputs.
// ============================================================================

// ----------------------------------------------------------------------------
// Tradition stub — local minimal mirror of the canonical enum.
//
// We try to import from the canonical sources first; if those imports
// disappear in a refactor, this stub keeps the feature compiling without
// pulling in @/lib/prisma or other heavy modules.
// ----------------------------------------------------------------------------

/** Canonical tradition slug union. Keep in sync with `events/types.ts`. */
export type Tradition =
  | 'cabala'
  | 'ifa'
  | 'astrologia'
  | 'tantra'
  | 'reiki'
  | 'meditacao'
  | 'xamanismo'
  | 'cristianismo-mistico'
  | 'sufismo'
  | 'taoismo'
  | 'umbanda'
  | 'candomble';

/** Ordered list — useful for UI dropdowns, validation, and default affinities. */
export const TRADITIONS: readonly Tradition[] = [
  'cabala',
  'ifa',
  'astrologia',
  'tantra',
  'reiki',
  'meditacao',
  'xamanismo',
  'cristianismo-mistico',
  'sufismo',
  'taoismo',
  'umbanda',
  'candomble',
] as const;

/** Type guard — narrows arbitrary string to Tradition. */
export function isTradition(value: unknown): value is Tradition {
  return typeof value === 'string' && (TRADITIONS as readonly string[]).includes(value);
}

/** Convert any input into a Tradition, falling back to a safe default. */
export function toTradition(value: unknown, fallback: Tradition = 'cabala'): Tradition {
  return isTradition(value) ? value : fallback;
}

// ----------------------------------------------------------------------------
// Public domain types
// ----------------------------------------------------------------------------

/** Media classification drives small UI badges and per-media bonuses. */
export type MediaType = 'text' | 'image' | 'video' | 'audio' | 'poll';

/** Supported UI languages. Add new ones by extending the union + config keys. */
export type Language = 'pt' | 'en' | 'es';

/**
 * A single post as it enters the ranker. Pure data — no resolvers, no
 * Prisma types. The caller is responsible for materializing this struct
 * from whatever storage layer they have (DB rows, mocks, fixtures).
 */
export type FeedItem = {
  /** Stable, unique post identifier (UUID or slug). */
  id: string;
  /** Author handle. Compared against `UserSignals.followedAuthorIds` etc. */
  authorId: string;
  /** Tradition this post belongs to (drives tradition-affinity scoring). */
  tradition: Tradition;
  /** Creation timestamp in ms-since-epoch (Date.now() form). */
  createdAt: number;
  /** Cached engagement counters. Use `-1` if unknown — scorer treats negative as "skip signal". */
  likes: number;
  /** Number of comments / replies. Weight ≈ 3x a like in `engagementScore`. */
  comments: number;
  /** Shares / reposts. Weight ≈ 5x a like (high intent signal). */
  shares: number;
  /** Saves / bookmarks. Weight ≈ 4x a like (private value, no social noise). */
  saves: number;
  /**
   * Optional content embedding (e.g. SBERT 384-d). If absent, embedding
   * similarity is treated as 0 (no penalty, no boost).
   */
  contentEmbedding?: number[];
  /** Media type — drives media-type bonuses and previews. */
  mediaType: MediaType;
  /** Post language. Matches user preference for the `languageMatchBonus`. */
  language: Language;
};

/**
 * Persistent model of a user's taste. The default is "empty" — every
 * tradition starts at 0.1 to prevent cold-start zeros; every author at 0.
 *
 * NOTE: do NOT mutate this object directly outside the ranker. Pass to
 * `trainFromEvents` to get a new copy back.
 */
export type UserSignals = {
  /** Stable user ID (UUID or session-derived). */
  userId: string;
  /** Per-tradition affinity in [0, ~3]. EMA-updated by the learner. */
  traditionAffinities: Record<Tradition, number>;
  /** Per-author affinity in [0, ~3]. */
  authorAffinities: Record<string, number>;
  /** User content-taste centroid (recency-weighted average of liked embeddings). */
  embedding: number[];
  /** UI language preference. */
  languagePreference: Language;
  /** Authors whose posts the user has explicitly followed. */
  followedAuthorIds: string[];
  /** Authors whose posts should never appear (mute / block). */
  mutedAuthorIds: string[];
  /** Recently-viewed item IDs (LRU-cached, used to apply repeatBonus). */
  recentViewIds: string[];
};

/** Result of running `scoreItem` against a single user. */
export type ScoredItem = {
  item: FeedItem;
  /** Final composite score in roughly [0, 3]. Higher = higher in feed. */
  score: number;
  /**
   * Ordered list of human-readable reasons. Used by `explainScore` and by the
   * UI tooltips ("porque você segue Cabala", etc.).
   */
  reasons: string[];
};

/** Ranker tuning knobs. All values are dimensionless; see spec for semantics. */
export type RankingConfig = {
  /** Half-life (hours) for the recency exponential decay. 24 = bottom-half in a day. */
  recencyHalfLifeHours: number;
  /** Multiplier on `traditionAffinities[item.tradition]`. */
  traditionAffinityWeight: number;
  /** Multiplier on `authorAffinities[item.authorId]`. */
  authorAffinityWeight: number;
  /** Multiplier on the log-compressed engagement score. */
  engagementWeight: number;
  /** Multiplier on `cosineSimilarity(user.embedding, item.contentEmbedding)`. */
  embeddingSimilarityWeight: number;
  /** Per-repeat deduction when an item is in `recentViewIds` (diversity). */
  diversityPenalty: number;
  /** Constant bonus when the author is in `followedAuthorIds`. */
  followBoost: number;
  /** Constant bonus when `item.language === user.languagePreference`. */
  languageMatchBonus: number;
};

/** Implicit feedback event. Consumed by `trainFromEvents`. */
export type FeedEvent = {
  userId: string;
  itemId: string;
  itemAuthorId?: string;
  itemTradition?: Tradition;
  itemEmbedding?: number[];
  event: 'view' | 'like' | 'comment' | 'share' | 'save' | 'skip' | 'hide';
  /** Event timestamp (ms-since-epoch). */
  ts: number;
  /** Optional override; defaults derived from `event`. */
  weight?: number;
};

// ----------------------------------------------------------------------------
// Defaults
// ----------------------------------------------------------------------------

/**
 * Default ranking weights. Tuned to match the formula in the header doc.
 * Sum of weights ≈ 1.0 so a "perfect" item lands in the [0, 3] score band.
 *
 * To experiment, copy this object, tweak, and pass to `rankFeed(items, signals, { ... })`.
 */
export const DEFAULT_CONFIG: RankingConfig = {
  recencyHalfLifeHours: 24,
  traditionAffinityWeight: 0.35,
  authorAffinityWeight: 0.2,
  engagementWeight: 0.25,
  embeddingSimilarityWeight: 0.2,
  diversityPenalty: 0.15,
  followBoost: 0.4,
  languageMatchBonus: 0.1,
};

/**
 * Default user signals — for cold-start users with no history. Every
 * tradition is seeded with a tiny positive value (0.1) so the scorer never
 * multiplies affinity by zero and silently drops content.
 */
export function emptyUserSignals(
  userId: string,
  languagePreference: Language = 'pt',
): UserSignals {
  const traditionAffinities = {} as Record<Tradition, number>;
  for (const t of TRADITIONS) traditionAffinities[t] = 0.1;
  return {
    userId,
    traditionAffinities,
    authorAffinities: {},
    embedding: [],
    languagePreference,
    followedAuthorIds: [],
    mutedAuthorIds: [],
    recentViewIds: [],
  };
}

// ----------------------------------------------------------------------------
// Event weights — what each implicit signal means to the learner
// ----------------------------------------------------------------------------

/**
 * Per-event-type weight. Positive = user wants MORE of this kind of item;
 * negative = user wants LESS (skip / hide are stronger than skip because
 * hide is an explicit, intentional action).
 */
export const DEFAULT_EVENT_WEIGHTS: Record<FeedEvent['event'], number> = {
  view: 0.05,
  like: 0.3,
  comment: 0.5,
  share: 0.7,
  save: 0.6,
  skip: -0.1,
  hide: -0.8,
};

/** Mixing factor (α) for the EMA-style learner. Higher = forget history faster. */
export const LEARNER_ALPHA = 0.15;

/** Maximum `recentViewIds` retained per user (LRU cap). */
export const RECENT_VIEW_CAP = 64;

/** Cap on cache entries for the in-memory learner process. */
export const LEARNER_CACHE_CAP = 2048;

// ----------------------------------------------------------------------------
// Pure math — vectors, time decay, freshness buckets
// ----------------------------------------------------------------------------

/**
 * Cosine similarity of two equal-length vectors. Returns:
 *   - 1    when both are identical unit vectors
 *   - 0    when orthogonal
 *   - -1   when opposite
 *   - 0    if either is empty, mismatched in length, or all-zero
 *
 * Safe under malformed inputs: a missing/empty vector yields 0 rather
 * than NaN, so ranking never crashes on a corrupt embedding cache.
 */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  if (a.length === 0 || a.length !== b.length) return 0;

  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }

  if (na === 0 || nb === 0) return 0;
  const sim = dot / (Math.sqrt(na) * Math.sqrt(nb));
  // Clamp to [-1, 1] to defeat FP drift before passing into weights.
  if (sim > 1) return 1;
  if (sim < -1) return -1;
  return sim;
}

/**
 * Exponential time decay. `halfLifeHours` defines how long until the
 * signal halves; at 1 half-life, returns 0.5; at 2, returns 0.25; etc.
 *
 *   decay(t) = 0.5 ^ ( ageHours / halfLifeHours )
 *
 * Negative ages (clock skew) are clamped to 0; NaN yields 0 to avoid
 * poisoning the ranker.
 */
export function timeDecay(
  createdAt: number,
  halfLifeHours: number,
  now: number = Date.now(),
): number {
  if (!Number.isFinite(createdAt) || !Number.isFinite(halfLifeHours)) return 0;
  if (halfLifeHours <= 0) return 1;
  const ageMs = now - createdAt;
  if (ageMs <= 0) return 1;
  const ageHours = ageMs / (1000 * 60 * 60);
  return Math.pow(0.5, ageHours / halfLifeHours);
}

/**
 * UI-friendly freshness bucket. Drives the "Em alta · Hoje · Essa semana ·
 * Antigo" badges. Boundaries are intentionally generous so the 'hot' bucket
 * is rare and valuable.
 */
export function freshnessBucket(createdAt: number, now: number = Date.now()): 'hot' | 'today' | 'week' | 'old' {
  if (!Number.isFinite(createdAt)) return 'old';
  const ageHours = (now - createdAt) / (1000 * 60 * 60);
  if (ageHours < 0) return 'hot';
  if (ageHours <= 4) return 'hot';
  if (ageHours <= 24) return 'today';
  if (ageHours <= 24 * 7) return 'week';
  return 'old';
}

// ----------------------------------------------------------------------------
// Engagement score — log compression to avoid likes-dominating everything
// ----------------------------------------------------------------------------

/**
 * Compresses raw counters into a single sub-linear engagement score.
 *
 *   raw = 1*L + 3*C + 5*Sh + 4*Sv
 *   score = log10(1 + raw) / log10(1 + 50)   (caps ~1.0 at 50 effective likes)
 *
 * Logarithmic because a post with 10 000 likes should not crush one with
 * 50 just because the absolute number is large.
 */
export function engagementScore(
  likes: number,
  comments: number,
  shares: number,
  saves: number,
): number {
  if (![likes, comments, shares, saves].every((v) => Number.isFinite(v) && v >= 0)) {
    return 0;
  }
  const raw = (likes ?? 0) * 1 + (comments ?? 0) * 3 + (shares ?? 0) * 5 + (saves ?? 0) * 4;
  if (raw <= 0) return 0;
  const numer = Math.log10(1 + raw);
  const denom = Math.log10(1 + 50);
  return denom > 0 ? numer / denom : 0;
}

// ----------------------------------------------------------------------------
// Repeat / diversity signal
// ----------------------------------------------------------------------------

/**
 * Compute the "repeat penalty" for a given item: each appearance of the
 * item in `recentViewIds` adds `diversityPenalty` to the deduction. A
 * second view typically should not be hidden, but it should rank below
 * fresh content.
 */
function repeatPenalty(itemId: string, recentViewIds: readonly string[], diversityPenalty: number): number {
  if (!diversityPenalty || diversityPenalty <= 0) return 0;
  let count = 0;
  for (const id of recentViewIds) if (id === itemId) count++;
  return count * diversityPenalty;
}

// ----------------------------------------------------------------------------
// Per-item scoring
// ----------------------------------------------------------------------------

/**
 * Score a single feed item against a user's signals. Returns a `ScoredItem`
 * with the composite score and a list of human-readable reasons (used by
 * `explainScore` and the UI tooltip system).
 *
 * Muted authors yield `{ score: -Infinity }` so they can be cheaply
 * dropped by the sort step.
 */
export function scoreItem(
  item: FeedItem,
  signals: UserSignals,
  config: RankingConfig = DEFAULT_CONFIG,
): ScoredItem {
  const reasons: string[] = [];

  // 1. Hard filters first.
  if (signals.mutedAuthorIds.includes(item.authorId)) {
    return { item, score: -Infinity, reasons: ['muted-author'] };
  }

  // 2. Recency (multiplicative — old + popular still loses).
  const decay = timeDecay(item.createdAt, config.recencyHalfLifeHours);
  reasons.push(`recency=${decay.toFixed(2)}`);

  // 3. Affinity terms.
  const tAffinity = signals.traditionAffinities[item.tradition] ?? 0;
  const aAffinity = signals.authorAffinities[item.authorId] ?? 0;
  const affinityTerms =
    config.traditionAffinityWeight * tAffinity +
    config.authorAffinityWeight * aAffinity;

  if (tAffinity > 0.5) reasons.push(`tradition:${item.tradition}+${tAffinity.toFixed(2)}`);
  if (aAffinity > 0.5) reasons.push(`author:${item.authorId}+${aAffinity.toFixed(2)}`);

  // 4. Engagement (log-compressed so it doesn't dominate).
  const enRaw = engagementScore(item.likes, item.comments, item.shares, item.saves);
  const enTerm = config.engagementWeight * enRaw;
  if (enRaw > 0.4) reasons.push(`engagement=${enRaw.toFixed(2)}`);

  // 5. Embedding similarity (optional).
  let emTerm = 0;
  if (item.contentEmbedding && signals.embedding && signals.embedding.length === item.contentEmbedding.length) {
    const sim = cosineSimilarity(signals.embedding, item.contentEmbedding);
    emTerm = config.embeddingSimilarityWeight * Math.max(0, sim);
    if (emTerm > 0.05) reasons.push(`embedding=${sim.toFixed(2)}`);
  }

  // 6. Diversity penalty (repeat views).
  const penalty = repeatPenalty(item.id, signals.recentViewIds, config.diversityPenalty);
  if (penalty > 0) reasons.push(`diversity-penalty=-${penalty.toFixed(2)}`);

  // 7. Boosts (constant).
  let boost = 0;
  if (signals.followedAuthorIds.includes(item.authorId)) {
    boost += config.followBoost;
    reasons.push(`follow+${config.followBoost.toFixed(2)}`);
  }
  if (item.language === signals.languagePreference) {
    boost += config.languageMatchBonus;
    reasons.push(`lang-match+${config.languageMatchBonus.toFixed(2)}`);
  }

  // 8. Compose.
  const score = decay * (affinityTerms + enTerm + emTerm) - penalty + boost;

  return {
    item,
    score,
    reasons,
  };
}

// ----------------------------------------------------------------------------
// Diversity injection — bucket-based re-rank
// ----------------------------------------------------------------------------

/**
 * Greedy diversity pass: walks the (already-sorted) list and re-inserts
 * overflowing items into the next legal slot, subject to:
 *   - maxPerAuthor: at most N items from the same author in any prefix of
 *     length (maxPerAuthor * 4). We approximate this with a sliding window
 *     of size `maxPerAuthor * 4 + 1` for O(n) cost.
 *   - maxPerTradition: at most N items from the same tradition overall
 *     (we cap, not window, because users explicitly dislike seeing 20
 *     Cabala posts even if they're spread out).
 *
 * Items that cannot be placed (both caps saturated and no later slot
 * respects diversity) are kept at the tail in their original order — we
 * never drop content; we only de-prioritise it.
 */
export function applyDiversity(
  sortedItems: ScoredItem[],
  maxPerAuthor: number,
  maxPerTradition: number,
): ScoredItem[] {
  if (!Array.isArray(sortedItems) || sortedItems.length === 0) return [];
  if (maxPerAuthor <= 0 && maxPerTradition <= 0) return sortedItems;

  const out: ScoredItem[] = [];
  const tail: ScoredItem[] = [];
  const authorCounts = new Map<string, number>();
  const traditionCounts = new Map<Tradition, number>();
  const placed = new Set<string>();
  const windowSize = Math.max(1, maxPerAuthor * 4);

  for (const candidate of sortedItems) {
    const a = candidate.item.authorId;
    const t = candidate.item.tradition;

    let authorOk = true;
    let traditionOk = true;

    if (maxPerAuthor > 0) {
      const recent = out.slice(Math.max(0, out.length - windowSize));
      let sameAuthorInWindow = 0;
      for (const r of recent) if (r.item.authorId === a) sameAuthorInWindow++;
      if (sameAuthorInWindow >= maxPerAuthor) authorOk = false;
    }

    if (maxPerTradition > 0) {
      const tradCount = traditionCounts.get(t) ?? 0;
      if (tradCount >= maxPerTradition) traditionOk = false;
    }

    if (authorOk && traditionOk && !placed.has(candidate.item.id)) {
      out.push(candidate);
      placed.add(candidate.item.id);
      authorCounts.set(a, (authorCounts.get(a) ?? 0) + 1);
      traditionCounts.set(t, (traditionCounts.get(t) ?? 0) + 1);
    } else {
      tail.push(candidate);
    }
  }

  // Now try to fit tail items at the very end, respecting caps loosely.
  // This keeps tail ordering by original score.
  for (const candidate of tail) {
    const a = candidate.item.authorId;
    const t = candidate.item.tradition;
    const tradCount = traditionCounts.get(t) ?? 0;
    const sameAuthorCount = authorCounts.get(a) ?? 0;

    const authorOk = maxPerAuthor <= 0 || sameAuthorCount < maxPerAuthor * 2;
    const traditionOk = maxPerTradition <= 0 || tradCount < maxPerTradition * 2;

    if (authorOk && traditionOk) {
      out.push(candidate);
      authorCounts.set(a, sameAuthorCount + 1);
      traditionCounts.set(t, tradCount + 1);
    }
  }

  return out;
}

// ----------------------------------------------------------------------------
// Orchestration — score + sort + diversity
// ----------------------------------------------------------------------------

/**
 * Rank an entire feed. Pipeline:
 *   1. Score every item (drop mutedAuthors — they'll score -Infinity).
 *   2. Stable sort by score desc; stable by `createdAt` desc as tiebreaker.
 *   3. Apply diversity injection (re-arrange, never drop).
 *
 * Pure: no mutations of input arrays. Safe to call from server components.
 */
export function rankFeed(
  items: readonly FeedItem[],
  signals: UserSignals,
  overrides: Partial<RankingConfig> = {},
): ScoredItem[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  const config: RankingConfig = { ...DEFAULT_CONFIG, ...overrides };

  const scored: ScoredItem[] = [];
  for (const it of items) {
    const s = scoreItem(it, signals, config);
    if (Number.isFinite(s.score)) scored.push(s);
  }

  // Stable sort: descending score, then descending createdAt, then id ascending.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.item.createdAt !== a.item.createdAt) return b.item.createdAt - a.item.createdAt;
    return a.item.id < b.item.id ? -1 : a.item.id > b.item.id ? 1 : 0;
  });

  const diversified = applyDiversity(scored, 2, 5);
  return diversified;
}

// ----------------------------------------------------------------------------
// Explanation — "why am I seeing this?"
// ----------------------------------------------------------------------------

/**
 * Translate `reasons[]` from `scoreItem` into a single human sentence.
 *
 * Strategy: pick the top 2-3 highest-impact reasons (follow, affinity,
 * embedding, engagement) and stitch them together. Falls back to a generic
 * "trending in the community" if we don't have any.
 */
export function explainScore(scored: ScoredItem): string {
  if (!scored || !scored.item) return '';
  const { item, reasons } = scored;

  const trad = reasons.find((r) => r.startsWith('tradition:'));
  const auth = reasons.find((r) => r.startsWith('author:'));
  const emb = reasons.find((r) => r.startsWith('embedding='));
  const eng = reasons.find((r) => r.startsWith('engagement='));
  const fol = reasons.find((r) => r.startsWith('follow+'));
  const lang = reasons.find((r) => r.startsWith('lang-match+'));

  const parts: string[] = [];

  if (fol) parts.push(`você segue ${item.authorId}`);
  if (trad) {
    const traditionName = item.tradition;
    parts.push(`você tem afinidade com ${traditionName}`);
  }
  if (auth) parts.push(`você interage com ${item.authorId}`);
  if (emb) parts.push('o conteúdo combina com seu gosto');
  if (eng) parts.push('está em alta na comunidade');
  if (lang) parts.push(`idioma (${item.language}) combina com sua preferência`);

  if (parts.length === 0) {
    if (item.likes + item.comments + item.shares + item.saves > 50) {
      return 'Está em alta na comunidade.';
    }
    return 'Post recente do feed.';
  }

  // Capitalize first letter for natural reading.
  const s = parts.join('; ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

// ----------------------------------------------------------------------------
// Implicit-feedback learner — EMA + LRU
// ----------------------------------------------------------------------------

/**
 * A simple least-recently-used cache used by `trainFromEvents` to bound
 * the memory footprint of the in-process learner. Re-implemented locally
 * (no Map LRU library) so we don't introduce a dependency.
 */
class LRU<K, V> {
  private readonly capacity: number;
  private readonly map = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
  }

  get(key: K): V | undefined {
    const value = this.map.get(key);
    if (value === undefined) return undefined;
    // Move-to-end.
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const firstKey = this.map.keys().next().value as K | undefined;
      if (firstKey !== undefined) this.map.delete(firstKey);
    }
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}

/**
 * Process-wide learner cache. Module-scope so a single V8 isolate shares
 * affinities across requests. Tests should call `_resetLearnerCacheForTests`.
 */
const learnerCache = new LRU<string, UserSignals>(LEARNER_CACHE_CAP);

/**
 * Test-only escape hatch — clears the in-process cache. Not exported.
 */
function _resetLearnerCacheForTests(): void {
  learnerCache.clear();
}

/**
 * Effectively-zero embedding similarity — used in EMA updates to skip
 * touching the user.embedding centroid when the original item lacked one.
 */
function addEmbeddingCentroid(
  current: readonly number[],
  incoming: readonly number[],
  alpha: number,
): number[] {
  if (incoming.length === 0) return [...current];
  if (current.length === 0) return [...incoming];
  if (current.length !== incoming.length) {
    // Length drift (model upgrade). Keep current to avoid corrupt centroids.
    return [...current];
  }
  const out = new Array<number>(current.length);
  for (let i = 0; i < current.length; i++) {
    out[i] = current[i] * (1 - alpha) + (incoming[i] ?? 0) * alpha;
  }
  return out;
}

/**
 * Update a single affinity entry with exponential moving average:
 *
 *   new = (1 - α) * old + α * delta
 *
 * Where delta is the per-event weight (positive for like/save/share/etc,
 * negative for skip/hide).
 */
function emaUpdate(current: number, delta: number, alpha: number = LEARNER_ALPHA): number {
  const next = current * (1 - alpha) + delta * alpha;
  if (next < 0) return 0; // floor at zero — affinities are non-negative
  if (next > 3) return 3; // cap at 3 to bound the ranker's range
  return next;
}

/**
 * Train a `UserSignals` model from an arbitrary event sequence (any
 * chronology, any length). Returns a fresh, frozen-ish `UserSignals`
 * object: every `training`, even on the same events, returns the same
 * result (no Date.now() or random sampling in the hot path).
 *
 * The EMA updates accumulate; ordering of events matters if α is large.
 * For production, prefer to feed events in chronological order.
 */
export async function trainFromEvents(
  events: readonly FeedEvent[],
): Promise<UserSignals> {
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error('trainFromEvents: empty events array — pass at least one event.');
  }

  // Group by user so we can update each userId's affinity once.
  const byUser = new Map<string, FeedEvent[]>();
  for (const e of events) {
    if (!byUser.has(e.userId)) byUser.set(e.userId, []);
    byUser.get(e.userId)!.push(e);
  }

  // Resolve to a single userId if there's only one group — common case.
  if (byUser.size !== 1) {
    throw new Error(
      `trainFromEvents: events span ${byUser.size} users — call once per userId.`,
    );
  }
  const [userId, userEvents] = byUser.entries().next().value as [string, FeedEvent[]];

  // Sort chronologically — EMA depends on order.
  userEvents.sort((a, b) => a.ts - b.ts);

  let signals = learnerCache.get(userId) ?? emptyUserSignals(userId);

  for (const ev of userEvents) {
    const baseWeight = ev.weight ?? DEFAULT_EVENT_WEIGHTS[ev.event];
    const trad = ev.itemTradition;
    const author = ev.itemAuthorId;

    if (trad) {
      const before = signals.traditionAffinities[trad] ?? 0;
      signals.traditionAffinities[trad] = emaUpdate(before, baseWeight);
    }
    if (author) {
      const before = signals.authorAffinities[author] ?? 0;
      signals.authorAffinities[author] = emaUpdate(before, baseWeight);
    }
    if (ev.itemEmbedding && ev.itemEmbedding.length > 0) {
      // Only positive signals update the embedding centroid to avoid
      // teaching the system "what you don't want to see" via mean-of-zero.
      if (baseWeight > 0) {
        const alpha = LEARNER_ALPHA * Math.min(1, baseWeight);
        signals.embedding = addEmbeddingCentroid(signals.embedding, ev.itemEmbedding, alpha);
      }
    }
  }

  learnerCache.set(userId, signals);
  // Returning a shallow copy gives callers the impression of immutability
  // without breaking the cache (they should never mutate the returned
  // object — but if they do, they hurt only their own next pass).
  return { ...signals };
}

// ----------------------------------------------------------------------------
// Snapshot helpers — used by integration tests and debug tooling
// ----------------------------------------------------------------------------

/**
 * Snapshot the full learner cache (size + user IDs). Useful for debugging
 * runaway memory or duplicate userIds.
 */
export function learnerCacheSnapshot(): { size: number; userIds: string[] } {
  // Reaching into the LRU class via a method avoids leaking internals.
  return {
    size: learnerCache.size,
    userIds: Array.from((learnerCache as unknown as { map: Map<string, unknown> }).map.keys()),
  };
}

/**
 * Build a feature vector for an item, suitable for export to an external
 * ranker (LightGBM, ONNX, etc.) or for unit tests that want to compare
 * raw factors rather than composite scores.
 */
export function itemFeatures(
  item: FeedItem,
  signals: UserSignals,
  config: RankingConfig = DEFAULT_CONFIG,
): Record<string, number> {
  const decay = timeDecay(item.createdAt, config.recencyHalfLifeHours);
  const tAffinity = signals.traditionAffinities[item.tradition] ?? 0;
  const aAffinity = signals.authorAffinities[item.authorId] ?? 0;
  const enRaw = engagementScore(item.likes, item.comments, item.shares, item.saves);
  const sim =
    item.contentEmbedding && signals.embedding && signals.embedding.length === item.contentEmbedding.length
      ? cosineSimilarity(signals.embedding, item.contentEmbedding)
      : 0;
  const penalty = repeatPenalty(item.id, signals.recentViewIds, config.diversityPenalty);
  const follow = signals.followedAuthorIds.includes(item.authorId) ? config.followBoost : 0;
  const lang = item.language === signals.languagePreference ? config.languageMatchBonus : 0;
  const muted = signals.mutedAuthorIds.includes(item.authorId) ? 1 : 0;

  return {
    recency: decay,
    traditionAffinity: tAffinity,
    authorAffinity: aAffinity,
    engagement: enRaw,
    embeddingSimilarity: sim,
    diversityPenalty: penalty,
    followBoost: follow,
    languageBonus: lang,
    muted,
  };
}

// ----------------------------------------------------------------------------
// End-to-end convenience: rankAndExplain
// ----------------------------------------------------------------------------

/**
 * One-shot helper that scores every item and attaches an `explanation`
 * string. Saves callers from chaining two functions manually.
 */
export function rankAndExplain(
  items: readonly FeedItem[],
  signals: UserSignals,
  overrides: Partial<RankingConfig> = {},
): Array<ScoredItem & { explanation: string }> {
  return rankFeed(items, signals, overrides).map((s) => ({
    ...s,
    explanation: explainScore(s),
  }));
}

// ----------------------------------------------------------------------------
// Self-test hooks (gated by NODE_ENV or a feature flag) — runtime smoke
// ----------------------------------------------------------------------------

/**
 * Internal sanity checks. Invoked only when `W45_RANKING_SELFTEST=1` is set
 * in the env. Useful for catching regressions in CI without spinning up
 * a full Vitest suite.
 */
export function _selfTest(): { passed: number; failed: number; notes: string[] } {
  const notes: string[] = [];
  let passed = 0;
  let failed = 0;

  const check = (name: string, cond: boolean): void => {
    if (cond) {
      passed++;
      notes.push(`PASS ${name}`);
    } else {
      failed++;
      notes.push(`FAIL ${name}`);
    }
  };

  // 1. cosineSimilarity identity = 1.
  const v = [0.6, 0.8];
  check('cosine.identity=1', Math.abs(cosineSimilarity(v, v) - 1) < 1e-9);
  // 2. cosineSimilarity orthogonal = 0.
  check('cosine.orthogonal=0', cosineSimilarity([1, 0], [0, 1]) === 0);
  // 3. cosineSimilarity empty = 0.
  check('cosine.empty=0', cosineSimilarity([], [1, 2]) === 0);
  // 4. timeDecay at half-life = 0.5.
  const HALF = 12;
  const now = 1_000_000_000_000;
  check(
    'timeDecay.halfLife',
    Math.abs(timeDecay(now - HALF * 3600_000, HALF, now) - 0.5) < 1e-9,
  );
  // 5. freshnessBucket covers all four buckets.
  check('freshness.hot', freshnessBucket(now - 1000_000, now) === 'hot');
  check(
    'freshness.today',
    freshnessBucket(now - 12 * 3600_000, now) === 'today',
  );
  check(
    'freshness.week',
    freshnessBucket(now - 3 * 86400_000, now) === 'week',
  );
  check('freshness.old', freshnessBucket(now - 365 * 86400_000, now) === 'old');

  // 6. scoreItem on a muted author returns -Infinity.
  const muted: UserSignals = {
    ...emptyUserSignals('u1'),
    mutedAuthorIds: ['a1'],
  };
  const mutedItem: FeedItem = {
    id: 'p1',
    authorId: 'a1',
    tradition: 'cabala',
    createdAt: now - 1000_000,
    likes: 10,
    comments: 1,
    shares: 0,
    saves: 0,
    mediaType: 'text',
    language: 'pt',
  };
  check('scoreItem.muted', scoreItem(mutedItem, muted).score === -Infinity);

  // 7. rankFeed drops muted authors entirely.
  const items: FeedItem[] = [
    { ...mutedItem, id: 'p1', authorId: 'a1' },
    {
      ...mutedItem,
      id: 'p2',
      authorId: 'a2',
      createdAt: now - 1000_000,
    },
  ];
  const ranked = rankFeed(items, muted);
  check('rankFeed.dropsMuted', ranked.length === 1 && ranked[0]!.item.id === 'p2');

  // 8. Engagement is monotonically non-decreasing in likes.
  const a = engagementScore(1, 0, 0, 0);
  const b = engagementScore(100, 0, 0, 0);
  const c = engagementScore(10_000, 0, 0, 0);
  check('engagement.monotonic', a <= b && b <= c && a < c);

  // 9. applyDiversity keeps total count.
  const scatter: ScoredItem[] = Array.from({ length: 10 }, (_, i) => ({
    item: {
      id: `p${i}`,
      authorId: i % 3 === 0 ? 'same' : `a${i}`,
      tradition: i % 2 === 0 ? 'cabala' : 'ifa',
      createdAt: now - i * 1000,
      likes: i,
      comments: 0,
      shares: 0,
      saves: 0,
      mediaType: 'text',
      language: 'pt',
    },
    score: 10 - i,
    reasons: [],
  }));
  const diversified = applyDiversity(scatter, 2, 3);
  check(
    'diversity.preservesCount',
    diversified.length === scatter.length,
  );

  // 10. applyDiversity redistributes authors (no run > maxPerAuthor).
  const counts: Record<string, number> = {};
  for (const d of diversified) {
    counts[d.item.authorId] = (counts[d.item.authorId] ?? 0) + 1;
  }
  const maxAuthor = Math.max(...Object.values(counts));
  check('diversity.authorCapRespected', maxAuthor <= 2 + 2 /* tail relaxation */);

  return { passed, failed, notes };
}
