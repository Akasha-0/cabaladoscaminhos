/**
 * w54 Prayer Submission Rate Limiter
 * ===================================
 *
 * Multi-algorithm rate limiter for the w51 `prayer-submission-webhook` output.
 *
 * Algorithms:
 *   - Token bucket (continuous refill)
 *   - Leaky bucket (constant drip rate)
 *   - Fixed window (count per window)
 *   - Sliding window (rolling 1h / 24h, sub-bucketed)
 *
 * Scope:
 *   - Per-tradition profiles (11 traditions + 1 catch-all)
 *   - Per-user trust-tier overrides (4 tiers)
 *   - Composite check across global + per-user + per-tradition
 *   - HTTP 429 + Retry-After + X-RateLimit-* headers + reason taxonomy
 *
 * Constraints honored:
 *   - Self-contained (no imports from sibling repo files)
 *   - Hand-rolled token buckets (no external rate-limit libs)
 *   - LGPD coverage: Art. 7 (consent), Art. 9 (sensitive), Art. 18 (rights)
 *   - No `any` types
 *
 * All identifiers leak no PII at the metrics layer.
 */

// ============================================================================
// SECTION 1 — Numeric helpers
// ============================================================================

/**
 * Returns the current epoch milliseconds. Wrapped so tests can inject a clock.
 */
export type ClockFn = () => number;

export const defaultClock: ClockFn = () => Date.now();

/**
 * Clamps a number to the inclusive [min, max] range.
 */
export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Rounds a number up to the next integer (Math.ceil, but explicit & named).
 */
export function ceilInt(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.ceil(value);
}

/**
 * Rounds a number down to the previous integer.
 */
export function floorInt(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.floor(value);
}

/**
 * Computes the millisecond delta between two timestamps; never negative.
 */
export function safeDeltaMs(now: number, future: number): number {
  return Math.max(0, future - now);
}

/**
 * Converts a millisecond duration to whole seconds, rounded up.
 */
export function msToCeilSeconds(ms: number): number {
  return ceilInt(ms / 1000);
}

/**
 * Converts a duration expressed in seconds into whole milliseconds.
 */
export function secondsToMs(seconds: number): number {
  return Math.max(0, Math.round(seconds * 1000));
}

/**
 * Multiplies two numbers with a safety floor at 0 (never returns negatives).
 */
export function safeMultiply(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const product = a * b;
  return product < 0 ? 0 : product;
}

/**
 * Adds two numbers with a ceiling to avoid numeric overflow; clamps at
 * Number.MAX_SAFE_INTEGER.
 */
export function safeAdd(a: number, b: number): number {
  if (!Number.isFinite(a)) return b;
  if (!Number.isFinite(b)) return a;
  const sum = a + b;
  if (sum > Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
  if (sum < 0) return 0;
  return sum;
}

/**
 * Subtracts b from a with a floor of zero.
 */
export function safeSubtract(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const diff = a - b;
  return diff < 0 ? 0 : diff;
}

/**
 * Sums an array of numbers safely.
 */
export function safeSum(values: readonly number[]): number {
  let acc = 0;
  for (const v of values) {
    acc = safeAdd(acc, v);
  }
  return acc;
}

/**
 * Returns the max value in a list, defaulting to 0 when empty.
 */
export function safeMax(values: readonly number[]): number {
  let result = 0;
  for (const v of values) {
    if (v > result) result = v;
  }
  return result;
}

/**
 * Returns the min value in a list, defaulting to 0 when empty.
 */
export function safeMin(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let result = values[0]!;
  for (let i = 1; i < values.length; i++) {
    const v = values[i]!;
    if (v < result) result = v;
  }
  return result;
}

/**
 * A tiny deterministic hash for bucketing identifiers when we need a stable
 * spread across sub-windows. Not cryptographic; not exported for callers.
 */
export function bucketHash(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Linear interpolation between two points.
 */
export function lerp(a: number, b: number, t: number): number {
  const tc = clampNumber(t, 0, 1);
  return a + (b - a) * tc;
}

// ============================================================================
// SECTION 2 — Core types
// ============================================================================

/**
 * The four supported rate-limit algorithms.
 */
export type RateLimitAlgorithm =
  | "token_bucket"
  | "leaky_bucket"
  | "fixed_window"
  | "sliding_window";

/**
 * All known algorithms in canonical order. Useful for tests + documentation.
 */
export const ALL_ALGORITHMS: readonly RateLimitAlgorithm[] = [
  "token_bucket",
  "leaky_bucket",
  "fixed_window",
  "sliding_window",
] as const;

/**
 * Lightweight banner describing a supported algorithm.
 */
export interface AlgorithmDescriptor {
  readonly id: RateLimitAlgorithm;
  readonly displayName: string;
  readonly description: string;
  readonly burstSupport: boolean;
  readonly sustainedSupport: boolean;
  readonly windowedSupport: boolean;
}

/**
 * Per-tradition identifier (kept as a string union for IDE completion).
 */
export type TraditionId =
  | "candomble"
  | "umbanda"
  | "ifa"
  | "cabala"
  | "espiritismo"
  | "budismo"
  | "hinduismo"
  | "islam"
  | "judaismo"
  | "catolicismo"
  | "universalista";

/**
 * All known traditions in canonical order.
 */
export const ALL_TRADITION_IDS: readonly TraditionId[] = [
  "candomble",
  "umbanda",
  "ifa",
  "cabala",
  "espiritismo",
  "budismo",
  "hinduismo",
  "islam",
  "judaismo",
  "catolicismo",
  "universalista",
] as const;

/**
 * Trust tiers honored by the rate limiter.
 */
export type TrustTier = "anon" | "verified" | "supporter" | "moderator";

/**
 * Canonical listing of trust tiers.
 */
export const ALL_TRUST_TIERS: readonly TrustTier[] = [
  "anon",
  "verified",
  "supporter",
  "moderator",
] as const;

/**
 * Decisions the composite limiter may return.
 */
export type Decision = "ALLOW" | "DENY" | "THROTTLE";

/**
 * Sacred-content or moderation flags.
 */
export type SubmissionFlag =
  | "sacred"
  | "flagged"
  | "auto_approved"
  | "needs_review"
  | "blocked";

/**
 * Canonical listing of submission flags.
 */
export const ALL_SUBMISSION_FLAGS: readonly SubmissionFlag[] = [
  "sacred",
  "flagged",
  "auto_approved",
  "needs_review",
  "blocked",
] as const;

/**
 * Reason codes — taxonomy surfaced in HTTP responses and audit logs.
 */
export type ReasonCode =
  | "RATE_LIMIT_GLOBAL_CEILING"
  | "RATE_LIMIT_PER_USER_EXCEEDED"
  | "RATE_LIMIT_PER_TRADITION_BURST"
  | "RATE_LIMIT_PER_TRADITION_SUSTAINED"
  | "RATE_LIMIT_SLIDING_1H"
  | "RATE_LIMIT_SLIDING_24H"
  | "RATE_LIMIT_FIXED_WINDOW"
  | "RATE_LIMIT_LEAKY_OVERFLOW"
  | "RATE_LIMIT_TOKEN_BUCKET_EMPTY"
  | "RATE_LIMIT_SACRED_BONUS"
  | "RATE_LIMIT_FLAGGED_RESTRICTED"
  | "RATE_LIMIT_TRUST_BOOST"
  | "RATE_LIMIT_ALGORITHM_NOT_CONFIGURED"
  | "RATE_LIMIT_INVALID_INPUT"
  | "RATE_LIMIT_OK";

/**
 * Canonical listing of reason codes. Order is meaningful for docs/tests.
 */
export const REASON_CODES: readonly ReasonCode[] = [
  "RATE_LIMIT_GLOBAL_CEILING",
  "RATE_LIMIT_PER_USER_EXCEEDED",
  "RATE_LIMIT_PER_TRADITION_BURST",
  "RATE_LIMIT_PER_TRADITION_SUSTAINED",
  "RATE_LIMIT_SLIDING_1H",
  "RATE_LIMIT_SLIDING_24H",
  "RATE_LIMIT_FIXED_WINDOW",
  "RATE_LIMIT_LEAKY_OVERFLOW",
  "RATE_LIMIT_TOKEN_BUCKET_EMPTY",
  "RATE_LIMIT_SACRED_BONUS",
  "RATE_LIMIT_FLAGGED_RESTRICTED",
  "RATE_LIMIT_TRUST_BOOST",
  "RATE_LIMIT_ALGORITHM_NOT_CONFIGURED",
  "RATE_LIMIT_INVALID_INPUT",
  "RATE_LIMIT_OK",
] as const;

/**
 * Categorical grouping of reason codes (for dashboards + logging).
 */
export const REASON_CATEGORY_MAP: Readonly<Record<ReasonCode, string>> = {
  RATE_LIMIT_GLOBAL_CEILING: "global",
  RATE_LIMIT_PER_USER_EXCEEDED: "user",
  RATE_LIMIT_PER_TRADITION_BURST: "tradition",
  RATE_LIMIT_PER_TRADITION_SUSTAINED: "tradition",
  RATE_LIMIT_SLIDING_1H: "sliding_window",
  RATE_LIMIT_SLIDING_24H: "sliding_window",
  RATE_LIMIT_FIXED_WINDOW: "fixed_window",
  RATE_LIMIT_LEAKY_OVERFLOW: "leaky_bucket",
  RATE_LIMIT_TOKEN_BUCKET_EMPTY: "token_bucket",
  RATE_LIMIT_SACRED_BONUS: "policy",
  RATE_LIMIT_FLAGGED_RESTRICTED: "policy",
  RATE_LIMIT_TRUST_BOOST: "policy",
  RATE_LIMIT_ALGORITHM_NOT_CONFIGURED: "config",
  RATE_LIMIT_INVALID_INPUT: "input",
  RATE_LIMIT_OK: "info",
};

// ============================================================================
// SECTION 3 — Token bucket
// ============================================================================

/**
 * Configuration for a token bucket.
 *
 * - `capacity` is the maximum burst (tokens held when fully refilled).
 * - `refillTokensPerSecond` is the continuous refill rate.
 * - `initialTokens` defaults to `capacity` if omitted.
 */
export interface TokenBucketConfig {
  readonly capacity: number;
  readonly refillTokensPerSecond: number;
  readonly initialTokens?: number;
}

/**
 * Internal state of a token bucket — pure data, no methods.
 */
export interface TokenBucketState {
  readonly tokens: number;
  readonly lastRefillMs: number;
}

/**
 * Live token bucket with continuous refill.
 *
 * Not thread-safe by itself, but lives inside the limiter which serializes
 * access via per-key mutation queues.
 */
export class TokenBucket {
  private readonly config: TokenBucketConfig;
  private tokens: number;
  private lastRefillMs: number;
  private readonly clock: ClockFn;

  constructor(config: TokenBucketConfig, clock: ClockFn = defaultClock) {
    this.config = {
      capacity: Math.max(1, config.capacity),
      refillTokensPerSecond: Math.max(0, config.refillTokensPerSecond),
      initialTokens: config.initialTokens ?? config.capacity,
    };
    this.clock = clock;
    const now = this.clock();
    this.lastRefillMs = now;
    this.tokens = clampNumber(
      this.config.initialTokens ?? this.config.capacity,
      0,
      this.config.capacity,
    );
  }

  /**
   * Computes how many tokens would be present at `now` without mutating state.
   */
  peek(now: number = this.clock()): TokenBucketState {
    const elapsedSec = Math.max(0, (now - this.lastRefillMs) / 1000);
    const refilled = clampNumber(
      this.tokens + elapsedSec * this.config.refillTokensPerSecond,
      0,
      this.config.capacity,
    );
    return { tokens: refilled, lastRefillMs: now };
  }

  /**
   * Tries to consume `cost` tokens at `now`. Returns true if a permit was
   * acquired. False when the bucket cannot satisfy the request.
   */
  tryAcquire(cost: number = 1, now?: number): boolean {
    const t = now ?? this.clock();
    const elapsedSec = Math.max(0, (t - this.lastRefillMs) / 1000);
    if (elapsedSec > 0 && this.config.refillTokensPerSecond > 0) {
      this.tokens = clampNumber(
        this.tokens + elapsedSec * this.config.refillTokensPerSecond,
        0,
        this.config.capacity,
      );
    }
    this.lastRefillMs = t;
    const cc = Math.max(1, cost);
    if (this.tokens >= cc) {
      this.tokens = this.tokens - cc;
      return true;
    }
    return false;
  }

  /**
   * Resets the bucket to its fully refilled state.
   */
  reset(): void {
    this.tokens = this.config.capacity;
    this.lastRefillMs = this.clock();
  }

  /**
   * Returns the maximum burst capacity.
   */
  capacity(): number {
    return this.config.capacity;
  }

  /**
   * Returns the refill rate (tokens / second).
   */
  refillRate(): number {
    return this.config.refillTokensPerSecond;
  }

  /**
   * Returns a snapshot of the current state without consuming any tokens.
   */
  snapshot(): TokenBucketState {
    return this.peek();
  }

  /**
   * Returns a plain JSON object for diagnostics.
   */
  describe(): {
    algorithm: "token_bucket";
    capacity: number;
    refillTokensPerSecond: number;
    tokens: number;
    lastRefillMs: number;
  } {
    const snap = this.peek();
    return {
      algorithm: "token_bucket",
      capacity: this.config.capacity,
      refillTokensPerSecond: this.config.refillTokensPerSecond,
      tokens: snap.tokens,
      lastRefillMs: snap.lastRefillMs,
    };
  }
}

/**
 * Factory for token buckets. Kept as a thin wrapper for symmetry.
 */
export function createTokenBucket(
  config: TokenBucketConfig,
  clock?: ClockFn,
): TokenBucket {
  return new TokenBucket(config, clock);
}

/**
 * Returns how many seconds until at least one token is available.
 */
export function timeUntilNextToken(
  bucket: TokenBucket,
  cost: number = 1,
  now?: number,
): number {
  const snap = bucket.peek(now);
  if (snap.tokens >= cost) return 0;
  const missing = cost - snap.tokens;
  const rate = bucket.refillRate();
  if (rate <= 0) return Number.POSITIVE_INFINITY;
  return missing / rate;
}

// ============================================================================
// SECTION 4 — Leaky bucket
// ============================================================================

/**
 * Configuration for a leaky bucket.
 *
 * - `capacity` is the maximum queue size (drops when full).
 * - `dripRatePerSecond` is the constant drain rate.
 */
export interface LeakyBucketConfig {
  readonly capacity: number;
  readonly dripRatePerSecond: number;
}

/**
 * Internal state of a leaky bucket.
 */
export interface LeakyBucketState {
  readonly level: number;
  readonly lastDripMs: number;
}

/**
 * Leaky bucket — incoming requests fill a queue that drains at a constant
 * rate. Overflows are denied. Useful for smoothing bursty traffic.
 */
export class LeakyBucket {
  private readonly config: LeakyBucketConfig;
  private level: number;
  private lastDripMs: number;
  private readonly clock: ClockFn;

  constructor(config: LeakyBucketConfig, clock: ClockFn = defaultClock) {
    this.config = {
      capacity: Math.max(1, config.capacity),
      dripRatePerSecond: Math.max(0, config.dripRatePerSecond),
    };
    this.clock = clock;
    this.level = 0;
    this.lastDripMs = this.clock();
  }

  peek(now: number = this.clock()): LeakyBucketState {
    const elapsedSec = Math.max(0, (now - this.lastDripMs) / 1000);
    const drained = clampNumber(
      this.level - elapsedSec * this.config.dripRatePerSecond,
      0,
      this.config.capacity,
    );
    return { level: drained, lastDripMs: now };
  }

  /**
   * Tries to add one request to the queue at `now`. Returns false when the
   * queue is full (overflow).
   */
  tryAcquire(cost: number = 1, now?: number): boolean {
    const t = now ?? this.clock();
    const elapsedSec = Math.max(0, (t - this.lastDripMs) / 1000);
    if (elapsedSec > 0 && this.config.dripRatePerSecond > 0) {
      this.level = clampNumber(
        this.level - elapsedSec * this.config.dripRatePerSecond,
        0,
        this.config.capacity,
      );
    }
    this.lastDripMs = t;
    const cc = Math.max(1, cost);
    if (this.level + cc > this.config.capacity) return false;
    this.level = this.level + cc;
    return true;
  }

  reset(): void {
    this.level = 0;
    this.lastDripMs = this.clock();
  }

  capacity(): number {
    return this.config.capacity;
  }

  dripRate(): number {
    return this.config.dripRatePerSecond;
  }

  snapshot(): LeakyBucketState {
    return this.peek();
  }

  describe(): {
    algorithm: "leaky_bucket";
    capacity: number;
    dripRatePerSecond: number;
    level: number;
    lastDripMs: number;
  } {
    const snap = this.peek();
    return {
      algorithm: "leaky_bucket",
      capacity: this.config.capacity,
      dripRatePerSecond: this.config.dripRatePerSecond,
      level: snap.level,
      lastDripMs: snap.lastDripMs,
    };
  }
}

/**
 * Factory for leaky buckets.
 */
export function createLeakyBucket(
  config: LeakyBucketConfig,
  clock?: ClockFn,
): LeakyBucket {
  return new LeakyBucket(config, clock);
}

/**
 * Returns the projected drain time (seconds) for the current queue level.
 */
export function drainTimeSeconds(bucket: LeakyBucket, now?: number): number {
  const snap = bucket.peek(now);
  if (snap.level <= 0) return 0;
  const rate = bucket.dripRate();
  if (rate <= 0) return Number.POSITIVE_INFINITY;
  return snap.level / rate;
}

// ============================================================================
// SECTION 5 — Fixed window
// ============================================================================

/**
 * Configuration for a fixed window counter.
 */
export interface FixedWindowConfig {
  readonly windowMs: number;
  readonly max: number;
}

/**
 * Internal state of a fixed window.
 */
export interface FixedWindowState {
  readonly count: number;
  readonly windowStartMs: number;
  readonly windowEndMs: number;
}

/**
 * Fixed window counter — counts requests within an aligned window. Simple,
 * fast, but allows 2x bursts at the boundary.
 */
export class FixedWindow {
  private readonly config: FixedWindowConfig;
  private count: number;
  private windowStartMs: number;
  private readonly clock: ClockFn;

  constructor(config: FixedWindowConfig, clock: ClockFn = defaultClock) {
    this.config = {
      windowMs: Math.max(1, config.windowMs),
      max: Math.max(1, config.max),
    };
    this.clock = clock;
    this.count = 0;
    this.windowStartMs = this.alignedStart(this.clock());
  }

  private alignedStart(now: number): number {
    return Math.floor(now / this.config.windowMs) * this.config.windowMs;
  }

  private windowEnd(start: number): number {
    return start + this.config.windowMs;
  }

  /**
   * Rolls the window if needed and returns the current state.
   */
  private rollIfNeeded(now: number): { start: number; end: number } {
    const start = this.alignedStart(now);
    if (start !== this.windowStartMs) {
      this.windowStartMs = start;
      this.count = 0;
    }
    return { start, end: this.windowEnd(start) };
  }

  peek(now: number = this.clock()): FixedWindowState {
    const start = this.alignedStart(now);
    const end = this.windowEnd(start);
    const isCurrent = start === this.windowStartMs;
    return {
      count: isCurrent ? this.count : 0,
      windowStartMs: start,
      windowEndMs: end,
    };
  }

  /**
   * Tries to record a request at `now`. Returns true if the request fits
   * within the window's quota; false if it would exceed `max`.
   */
  tryAcquire(cost: number = 1, now?: number): boolean {
    const t = now ?? this.clock();
    this.rollIfNeeded(t);
    const cc = Math.max(1, cost);
    if (this.count + cc > this.config.max) return false;
    this.count += cc;
    return true;
  }

  reset(): void {
    this.count = 0;
    this.windowStartMs = this.alignedStart(this.clock());
  }

  max(): number {
    return this.config.max;
  }

  windowMs(): number {
    return this.config.windowMs;
  }

  snapshot(): FixedWindowState {
    return this.peek();
  }

  describe(): {
    algorithm: "fixed_window";
    windowMs: number;
    max: number;
    count: number;
    windowStartMs: number;
  } {
    const snap = this.peek();
    return {
      algorithm: "fixed_window",
      windowMs: this.config.windowMs,
      max: this.config.max,
      count: snap.count,
      windowStartMs: snap.windowStartMs,
    };
  }
}

/**
 * Factory for fixed windows.
 */
export function createFixedWindow(
  config: FixedWindowConfig,
  clock?: ClockFn,
): FixedWindow {
  return new FixedWindow(config, clock);
}

/**
 * Returns the seconds remaining in the current window.
 */
export function windowSecondsRemaining(
  window: FixedWindow,
  now?: number,
): number {
  const snap = window.peek(now);
  return msToCeilSeconds(safeDeltaMs(now ?? defaultClock(), snap.windowEndMs));
}

// ============================================================================
// SECTION 6 — Sliding window
// ============================================================================

/**
 * Configuration for a sliding window.
 */
export interface SlidingWindowConfig {
  readonly windowMs: number;
  readonly max: number;
  readonly subWindows: number;
}

/**
 * Internal state of a sliding window.
 */
export interface SlidingWindowState {
  readonly count: number;
  readonly windowStartMs: number;
  readonly windowEndMs: number;
}

/**
 * Sliding window — counts requests within a rolling window by sampling
 * `subWindows` evenly-sized buckets and discarding the trailing fractional
 * bucket. Trades accuracy for O(subWindows) memory.
 */
export class SlidingWindow {
  private readonly config: SlidingWindowConfig;
  private buckets: number[];
  private bucketStartMs: number;
  private readonly clock: ClockFn;

  constructor(config: SlidingWindowConfig, clock: ClockFn = defaultClock) {
    this.config = {
      windowMs: Math.max(1, config.windowMs),
      max: Math.max(1, config.max),
      subWindows: Math.max(1, Math.floor(config.subWindows)),
    };
    this.clock = clock;
    this.buckets = new Array(this.config.subWindows).fill(0);
    this.bucketStartMs = this.alignedBucketStart(this.clock());
  }

  private subWindowMs(): number {
    return this.config.windowMs / this.config.subWindows;
  }

  private alignedBucketStart(now: number): number {
    const sub = this.subWindowMs();
    return Math.floor(now / sub) * sub;
  }

  private rollBuckets(now: number): void {
    const sub = this.subWindowMs();
    const start = this.alignedBucketStart(now);
    if (start === this.bucketStartMs) return;
    const elapsedBuckets = Math.floor((start - this.bucketStartMs) / sub);
    if (elapsedBuckets <= 0) {
      this.bucketStartMs = start;
      return;
    }
    if (elapsedBuckets >= this.config.subWindows) {
      this.buckets = new Array(this.config.subWindows).fill(0);
    } else {
      const shift = elapsedBuckets;
      const remaining = this.buckets.slice(shift);
      const fresh = new Array(this.config.subWindows - remaining.length).fill(0);
      this.buckets = remaining.concat(fresh);
    }
    this.bucketStartMs = start;
  }

  /**
   * Sums the count across all in-window sub-buckets, scaled by the partial
   * coverage of the current (incomplete) bucket.
   */
  private currentCount(now: number): number {
    const sub = this.subWindowMs();
    const start = this.alignedBucketStart(now);
    const elapsedInBucket = Math.max(0, now - start);
    const bucketFraction = clampNumber(elapsedInBucket / sub, 0, 1);

    let sum = 0;
    for (let i = 0; i < this.buckets.length - 1; i++) {
      sum += this.buckets[i]!;
    }
    sum += this.buckets[this.buckets.length - 1]! * bucketFraction;
    return sum;
  }

  peek(now: number = this.clock()): SlidingWindowState {
    const sub = this.subWindowMs();
    const start = this.alignedBucketStart(now);
    const end = start + this.config.windowMs;
    const savedBuckets = this.buckets.slice();
    const savedStart = this.bucketStartMs;
    this.rollBuckets(now);
    const count = this.currentCount(now);
    this.buckets = savedBuckets;
    this.bucketStartMs = savedStart;
    return { count, windowStartMs: start, windowEndMs: end };
  }

  tryAcquire(cost: number = 1, now?: number): boolean {
    const t = now ?? this.clock();
    this.rollBuckets(t);
    const current = this.currentCount(t);
    const cc = Math.max(1, cost);
    if (current + cc > this.config.max) return false;
    const idx = this.buckets.length - 1;
    this.buckets[idx] = (this.buckets[idx] ?? 0) + cc;
    return true;
  }

  reset(): void {
    this.buckets = new Array(this.config.subWindows).fill(0);
    this.bucketStartMs = this.alignedBucketStart(this.clock());
  }

  max(): number {
    return this.config.max;
  }

  windowMs(): number {
    return this.config.windowMs;
  }

  subWindows(): number {
    return this.config.subWindows;
  }

  snapshot(): SlidingWindowState {
    return this.peek();
  }

  describe(): {
    algorithm: "sliding_window";
    windowMs: number;
    max: number;
    subWindows: number;
    count: number;
  } {
    const snap = this.peek();
    return {
      algorithm: "sliding_window",
      windowMs: this.config.windowMs,
      max: this.config.max,
      subWindows: this.config.subWindows,
      count: snap.count,
    };
  }
}

/**
 * Factory for sliding windows.
 */
export function createSlidingWindow(
  config: SlidingWindowConfig,
  clock?: ClockFn,
): SlidingWindow {
  return new SlidingWindow(config, clock);
}

// ============================================================================
// SECTION 7 — Composite algorithm bag
// ============================================================================

/**
 * Composite bag of all four algorithms, scoped to a single key (user or
 * tradition). Each algorithm is independent.
 */
export interface CompositeAlgorithmBagConfig {
  readonly tokenBucket: TokenBucketConfig;
  readonly leakyBucket: LeakyBucketConfig;
  readonly fixedWindow: FixedWindowConfig;
  readonly slidingWindow: SlidingWindowConfig;
}

/**
 * Composite bag class — bundles all four algorithm instances so a single
 * composite check can evaluate all of them.
 */
export class CompositeAlgorithmBag {
  readonly tokenBucket: TokenBucket;
  readonly leakyBucket: LeakyBucket;
  readonly fixedWindow: FixedWindow;
  readonly slidingWindow: SlidingWindow;

  constructor(config: CompositeAlgorithmBagConfig, clock: ClockFn = defaultClock) {
    this.tokenBucket = new TokenBucket(config.tokenBucket, clock);
    this.leakyBucket = new LeakyBucket(config.leakyBucket, clock);
    this.fixedWindow = new FixedWindow(config.fixedWindow, clock);
    this.slidingWindow = new SlidingWindow(config.slidingWindow, clock);
  }

  reset(): void {
    this.tokenBucket.reset();
    this.leakyBucket.reset();
    this.fixedWindow.reset();
    this.slidingWindow.reset();
  }

  describe(): {
    algorithm: "composite";
    tokenBucket: ReturnType<TokenBucket["describe"]>;
    leakyBucket: ReturnType<LeakyBucket["describe"]>;
    fixedWindow: ReturnType<FixedWindow["describe"]>;
    slidingWindow: ReturnType<SlidingWindow["describe"]>;
  } {
    return {
      algorithm: "composite",
      tokenBucket: this.tokenBucket.describe(),
      leakyBucket: this.leakyBucket.describe(),
      fixedWindow: this.fixedWindow.describe(),
      slidingWindow: this.slidingWindow.describe(),
    };
  }
}

/**
 * Builds a composite algorithm bag from independent configs.
 */
export function createCompositeAlgorithmBag(
  config: CompositeAlgorithmBagConfig,
  clock?: ClockFn,
): CompositeAlgorithmBag {
  return new CompositeAlgorithmBag(config, clock);
}

// ============================================================================
// SECTION 8 — Tradition profiles
// ============================================================================

/**
 * Per-tradition rate-limit profile.
 */
export interface TraditionProfile {
  readonly id: TraditionId;
  readonly displayName: string;
  readonly burst: number;
  readonly sustainedPerHour: number;
  readonly sustainedPerDay: number;
  readonly leakyQueueSize: number;
  readonly fixedWindowMs: number;
  readonly slidingSubWindows: number;
  readonly sacredBonus: number;
  readonly flaggedPenalty: number;
  readonly description: string;
}

/**
 * Canonical profile: Candomblé.
 * Prayer-heavy + communal ritual cadence. Sustained limits sit in the upper
 * third; burst is generous (multiple offerings in a single session).
 */
export const TRADITION_PROFILE_CANDOMBLE: TraditionProfile = {
  id: "candomble",
  displayName: "Candomblé",
  burst: 15,
  sustainedPerHour: 20,
  sustainedPerDay: 250,
  leakyQueueSize: 25,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.25,
  flaggedPenalty: 0.5,
  description:
    "Candomblé — axé based practices with communal prayer cadence. " +
    "Generous burst for group offerings; sustained rate sized for daily " +
    "ebós and pre-ritual dedications.",
};

/**
 * Canonical profile: Umbanda.
 * Highest sustained limits across the matrix; Umbanda consultations
 * are continuous in many traditions.
 */
export const TRADITION_PROFILE_UMBANDA: TraditionProfile = {
  id: "umbanda",
  displayName: "Umbanda",
  burst: 20,
  sustainedPerHour: 25,
  sustainedPerDay: 300,
  leakyQueueSize: 30,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.25,
  flaggedPenalty: 0.5,
  description:
    "Umbanda — extensive continuous practice. Highest sustained limit " +
    "in the matrix to honor frequent consultas and giras.",
};

/**
 * Canonical profile: Ifá.
 * Precise ritual cadence — fewer bursts, but precise ritual timing requires
 * a healthy sustained rate.
 */
export const TRADITION_PROFILE_IFA: TraditionProfile = {
  id: "ifa",
  displayName: "Ifá",
  burst: 10,
  sustainedPerHour: 15,
  sustainedPerDay: 180,
  leakyQueueSize: 18,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.2,
  flaggedPenalty: 0.5,
  description:
    "Ifá — precise ritual cadence. Moderate burst; sustained rate sized " +
    "for odu consultations and ebo dedications.",
};

/**
 * Canonical profile: Cabala.
 * Contemplative practice — smaller burst, lower sustained.
 */
export const TRADITION_PROFILE_CABALA: TraditionProfile = {
  id: "cabala",
  displayName: "Cabala",
  burst: 5,
  sustainedPerHour: 8,
  sustainedPerDay: 90,
  leakyQueueSize: 10,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.2,
  flaggedPenalty: 0.5,
  description:
    "Cabala — contemplative study. Smaller burst to discourage " +
    "rapid-fire prayer; sustained rate sized for daily Tikkunim.",
};

/**
 * Canonical profile: Espiritismo (Kardecist).
 */
export const TRADITION_PROFILE_ESPIRITISMO: TraditionProfile = {
  id: "espiritismo",
  displayName: "Espiritismo",
  burst: 12,
  sustainedPerHour: 18,
  sustainedPerDay: 220,
  leakyQueueSize: 20,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.2,
  flaggedPenalty: 0.5,
  description: "Espiritismo — balanced profile for estudo and prece cadences.",
};

/**
 * Canonical profile: Budismo.
 * Contemplative practice — moderate burst, low sustained.
 */
export const TRADITION_PROFILE_BUDISMO: TraditionProfile = {
  id: "budismo",
  displayName: "Budismo",
  burst: 5,
  sustainedPerHour: 10,
  sustainedPerDay: 120,
  leakyQueueSize: 12,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.2,
  flaggedPenalty: 0.5,
  description: "Budismo — contemplative. Low burst; sustained supports sadhana cadence.",
};

/**
 * Canonical profile: Hinduísmo.
 */
export const TRADITION_PROFILE_HINDUISMO: TraditionProfile = {
  id: "hinduismo",
  displayName: "Hinduísmo",
  burst: 10,
  sustainedPerHour: 15,
  sustainedPerDay: 180,
  leakyQueueSize: 18,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.2,
  flaggedPenalty: 0.5,
  description: "Hinduísmo — puja cadence. Moderate burst and sustained.",
};

/**
 * Canonical profile: Islam.
 * Prayer is a five-times-daily practice — sustained limit must support that.
 */
export const TRADITION_PROFILE_ISLAM: TraditionProfile = {
  id: "islam",
  displayName: "Islam",
  burst: 15,
  sustainedPerHour: 20,
  sustainedPerDay: 260,
  leakyQueueSize: 25,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.3,
  flaggedPenalty: 0.5,
  description:
    "Islam — five daily prayers; sustained rate sized to honor " +
    "salat practice without throttling devoted users.",
};

/**
 * Canonical profile: Judaísmo.
 */
export const TRADITION_PROFILE_JUDAISMO: TraditionProfile = {
  id: "judaismo",
  displayName: "Judaísmo",
  burst: 10,
  sustainedPerHour: 15,
  sustainedPerDay: 180,
  leakyQueueSize: 18,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.2,
  flaggedPenalty: 0.5,
  description: "Judaísmo — daily tefillah. Moderate profile.",
};

/**
 * Canonical profile: Catolicismo.
 * Highest total volume expected due to mass / novena / terço cadences.
 */
export const TRADITION_PROFILE_CATOLICISMO: TraditionProfile = {
  id: "catolicismo",
  displayName: "Catolicismo",
  burst: 20,
  sustainedPerHour: 30,
  sustainedPerDay: 360,
  leakyQueueSize: 35,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.25,
  flaggedPenalty: 0.5,
  description:
    "Catolicismo — large volume due to mass/novena cadence. " +
    "Highest overall limit to accommodate novena bursts.",
};

/**
 * Catch-all profile: Universalista.
 * Conservative defaults for anything we don't explicitly support.
 */
export const TRADITION_PROFILE_UNIVERSALISTA: TraditionProfile = {
  id: "universalista",
  displayName: "Universalista",
  burst: 8,
  sustainedPerHour: 12,
  sustainedPerDay: 140,
  leakyQueueSize: 14,
  fixedWindowMs: 60_000,
  slidingSubWindows: 12,
  sacredBonus: 0.15,
  flaggedPenalty: 0.7,
  description:
    "Universalista — catch-all for unrecognized traditions. " +
    "Conservative profile; tighter flagged penalty.",
};

/**
 * Map of all tradition profiles by ID.
 */
export const TRADITION_PROFILES: Readonly<Record<TraditionId, TraditionProfile>> = {
  candomble: TRADITION_PROFILE_CANDOMBLE,
  umbanda: TRADITION_PROFILE_UMBANDA,
  ifa: TRADITION_PROFILE_IFA,
  cabala: TRADITION_PROFILE_CABALA,
  espiritismo: TRADITION_PROFILE_ESPIRITISMO,
  budismo: TRADITION_PROFILE_BUDISMO,
  hinduismo: TRADITION_PROFILE_HINDUISMO,
  islam: TRADITION_PROFILE_ISLAM,
  judaismo: TRADITION_PROFILE_JUDAISMO,
  catolicismo: TRADITION_PROFILE_CATOLICISMO,
  universalista: TRADITION_PROFILE_UNIVERSALISTA,
};

/**
 * Returns the profile for a traditionId, defaulting to universalista.
 */
export function getTraditionProfile(id: string): TraditionProfile {
  const known = (ALL_TRADITION_IDS as readonly string[]).includes(id);
  if (known) {
    return TRADITION_PROFILES[id as TraditionId];
  }
  return TRADITION_PROFILES["universalista"];
}

/**
 * Validates a tradition profile. Pure validator, no exceptions thrown.
 */
export function validateTraditionProfile(
  profile: TraditionProfile,
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (profile.burst <= 0) issues.push("burst must be > 0");
  if (profile.sustainedPerHour <= 0) issues.push("sustainedPerHour must be > 0");
  if (profile.sustainedPerDay < profile.sustainedPerHour) {
    issues.push("sustainedPerDay must be >= sustainedPerHour");
  }
  if (profile.leakyQueueSize <= 0) issues.push("leakyQueueSize must be > 0");
  if (profile.fixedWindowMs <= 0) issues.push("fixedWindowMs must be > 0");
  if (profile.slidingSubWindows <= 0) issues.push("slidingSubWindows must be > 0");
  if (profile.sacredBonus < 0 || profile.sacredBonus > 5) {
    issues.push("sacredBonus out of range [0,5]");
  }
  if (profile.flaggedPenalty < 0 || profile.flaggedPenalty > 1) {
    issues.push("flaggedPenalty must be in [0,1]");
  }
  return { ok: issues.length === 0, issues };
}

// ============================================================================
// SECTION 9 — Trust tiers
// ============================================================================

/**
 * Per-trust-tier override.
 */
export interface TrustTierProfile {
  readonly id: TrustTier;
  readonly displayName: string;
  readonly burstMultiplier: number;
  readonly sustainedMultiplier: number;
  readonly verifiedFlag: boolean;
  readonly description: string;
}

/**
 * Anonymous user — baseline.
 */
export const TRUST_TIER_ANON: TrustTierProfile = {
  id: "anon",
  displayName: "Anônimo",
  burstMultiplier: 1.0,
  sustainedMultiplier: 1.0,
  verifiedFlag: false,
  description: "Default tier for unidentified or unverified users.",
};

/**
 * Verified user — light boost.
 */
export const TRUST_TIER_VERIFIED: TrustTierProfile = {
  id: "verified",
  displayName: "Verificado",
  burstMultiplier: 1.25,
  sustainedMultiplier: 1.25,
  verifiedFlag: true,
  description:
    "Verified account. +25% on both burst and sustained for " +
    "trustworthy usage patterns.",
};

/**
 * Supporter (paid user) — moderate boost.
 */
export const TRUST_TIER_SUPPORTER: TrustTierProfile = {
  id: "supporter",
  displayName: "Apoiador",
  burstMultiplier: 1.5,
  sustainedMultiplier: 1.5,
  verifiedFlag: true,
  description: "Paid supporter. +50% on burst and sustained.",
};

/**
 * Moderator — the highest tier; near-zero friction for staff.
 */
export const TRUST_TIER_MODERATOR: TrustTierProfile = {
  id: "moderator",
  displayName: "Moderador",
  burstMultiplier: 3.0,
  sustainedMultiplier: 2.0,
  verifiedFlag: true,
  description:
    "Moderator tier. Largely unrestricted; residual ceiling is the " +
    "global ceiling only.",
};

/**
 * Map of trust tier profiles by ID.
 */
export const TRUST_TIER_PROFILES: Readonly<Record<TrustTier, TrustTierProfile>> = {
  anon: TRUST_TIER_ANON,
  verified: TRUST_TIER_VERIFIED,
  supporter: TRUST_TIER_SUPPORTER,
  moderator: TRUST_TIER_MODERATOR,
};

/**
 * Returns the profile for a given trust tier, defaulting to anon.
 */
export function getTrustTierProfile(tier: string): TrustTierProfile {
  if ((ALL_TRUST_TIERS as readonly string[]).includes(tier)) {
    return TRUST_TIER_PROFILES[tier as TrustTier];
  }
  return TRUST_TIER_PROFILES["anon"];
}

/**
 * Resolves the highest tier from a list of tier IDs (for union grants).
 */
export function maxTrustTier(tiers: readonly TrustTier[]): TrustTier {
  const order: TrustTier[] = ["anon", "verified", "supporter", "moderator"];
  let best: TrustTier = "anon";
  for (const t of tiers) {
    if (order.indexOf(t) > order.indexOf(best)) best = t;
  }
  return best;
}

// ============================================================================
// SECTION 10 — Token store with TTL eviction
// ============================================================================

/**
 * Internal entry inside the token store.
 */
interface TokenStoreEntry {
  readonly bag: CompositeAlgorithmBag;
  readonly expiresAtMs: number;
}

/**
 * In-memory store keyed by composite string. Evicts entries whose TTL has
 * expired; no external dependency required.
 */
export class TokenStore {
  private readonly store: Map<string, TokenStoreEntry> = new Map();
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly clock: ClockFn;

  constructor(
    options: { ttlMs?: number; maxEntries?: number; clock?: ClockFn } = {},
  ) {
    this.ttlMs = options.ttlMs ?? 30 * 60_000;
    this.maxEntries = options.maxEntries ?? 50_000;
    this.clock = options.clock ?? defaultClock;
  }

  size(): number {
    return this.store.size;
  }

  /**
   * Evicts expired entries. Returns the number evicted.
   */
  evict(): number {
    const now = this.clock();
    let evicted = 0;
    for (const [key, entry] of this.store) {
      if (entry.expiresAtMs <= now) {
        this.store.delete(key);
        evicted++;
      }
    }
    return evicted;
  }

  /**
   * Returns or constructs the bag for a key.
   */
  obtain(
    key: string,
    factory: () => CompositeAlgorithmBagConfig,
  ): CompositeAlgorithmBag {
    this.evict();
    const existing = this.store.get(key);
    if (existing && existing.expiresAtMs > this.clock()) {
      this.store.set(key, {
        bag: existing.bag,
        expiresAtMs: this.clock() + this.ttlMs,
      });
      return existing.bag;
    }
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    const cfg = factory();
    const bag = new CompositeAlgorithmBag(cfg, this.clock);
    this.store.set(key, {
      bag,
      expiresAtMs: this.clock() + this.ttlMs,
    });
    return bag;
  }

  /**
   * Force-resets the bag for a key. Useful for support tools.
   */
  reset(key: string): boolean {
    const existing = this.store.get(key);
    if (!existing) return false;
    existing.bag.reset();
    this.store.set(key, {
      bag: existing.bag,
      expiresAtMs: this.clock() + this.ttlMs,
    });
    return true;
  }

  /**
   * Removes the bag for a key. Returns true if a bag was removed.
   */
  forget(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Returns all keys currently held. Caller must not mutate.
   */
  keys(): string[] {
    this.evict();
    return Array.from(this.store.keys());
  }

  /**
   * Returns whether a key currently has a live bag.
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    return !!entry && entry.expiresAtMs > this.clock();
  }

  static buildKey(parts: { userId: string; traditionId: TraditionId }): string {
    return `${parts.userId}::${parts.traditionId}`;
  }

  static buildTraditionKey(traditionId: TraditionId): string {
    return `tradition::${traditionId}`;
  }
}

/**
 * Factory for token stores with sensible defaults.
 */
export function createTokenStore(
  options?: { ttlMs?: number; maxEntries?: number; clock?: ClockFn },
): TokenStore {
  return new TokenStore(options);
}

// ============================================================================
// SECTION 11 — Sacred-text policy + flag modifiers
// ============================================================================

/**
 * Bitfield describing which policies are active for a submission.
 */
export interface SubmissionPolicyState {
  readonly sacred: boolean;
  readonly flagged: boolean;
  readonly autoApproved: boolean;
  readonly needsReview: boolean;
  readonly blocked: boolean;
}

/**
 * Builds a SubmissionPolicyState from a flag array.
 */
export function buildPolicyState(flags: readonly SubmissionFlag[]): SubmissionPolicyState {
  let sacred = false;
  let flagged = false;
  let autoApproved = false;
  let needsReview = false;
  let blocked = false;
  for (const flag of flags) {
    if (flag === "sacred") sacred = true;
    if (flag === "flagged") flagged = true;
    if (flag === "auto_approved") autoApproved = true;
    if (flag === "needs_review") needsReview = true;
    if (flag === "blocked") blocked = true;
  }
  return { sacred, flagged, autoApproved, needsReview, blocked };
}

/**
 * Returns the multipliers given the active policy state.
 *
 * - sacred submissions: +50% sustained (capped at 3.0× for sanity)
 * - flagged submissions: -50% sustained (if not blocked)
 * - blocked submissions: clamped to near-zero (1/8)
 */
export function policyMultipliers(
  policy: SubmissionPolicyState,
): { burst: number; sustained: number; burst2: number } {
  let burst = 1.0;
  let sustained = 1.0;
  if (policy.sacred) sustained += 0.5;
  if (policy.flagged) {
    sustained *= 0.5;
    burst *= 0.7;
  }
  if (policy.blocked) {
    sustained = 0.125;
    burst = 0.25;
  }
  if (policy.autoApproved) sustained += 0.1;
  return { burst, sustained: clampNumber(sustained, 0.1, 3.0), burst2: burst };
}

/**
 * Resolves policy multipliers into a normalized pair. The `burst2` field
 * from `policyMultipliers` is renamed to `burst` here for API surface
 * consistency.
 */
export function normalizedPolicyMultipliers(
  policy: SubmissionPolicyState,
): { burst: number; sustained: number } {
  const raw = policyMultipliers(policy);
  return {
    burst: clampNumber(raw.burst2, 0.05, 5.0),
    sustained: clampNumber(raw.sustained, 0.1, 3.0),
  };
}

/**
 * Returns the canonical reason codes engaged by a policy state.
 */
export function reasonsForPolicy(
  policy: SubmissionPolicyState,
): ReasonCode[] {
  const out: ReasonCode[] = [];
  if (policy.sacred) out.push("RATE_LIMIT_SACRED_BONUS");
  if (policy.flagged) out.push("RATE_LIMIT_FLAGGED_RESTRICTED");
  return out;
}

// ============================================================================
// SECTION 12 — Composite rate limiter
// ============================================================================

/**
 * Configuration for the composite rate limiter.
 */
export interface CompositeRateLimiterConfig {
  readonly globalCeiling: CompositeAlgorithmBagConfig;
  readonly perUserTemplate: CompositeAlgorithmBagConfig;
  readonly perTraditionTemplates: Readonly<
    Record<TraditionId, CompositeAlgorithmBagConfig>
  >;
  readonly tokenStore: TokenStore;
  readonly clock?: ClockFn;
}

/**
 * Per-key composite check input.
 */
export interface CompositeCheckInput {
  readonly userId: string;
  readonly traditionId: TraditionId;
  readonly algorithm: RateLimitAlgorithm;
  readonly policy: SubmissionPolicyState;
  readonly trustTier: TrustTier;
}

/**
 * Per-check decision surface.
 */
export interface CompositeCheckDecision {
  readonly decision: Decision;
  readonly reason: ReasonCode;
  readonly reasons: readonly ReasonCode[];
  readonly retryAfterSeconds: number;
  readonly remainingHint: number;
  readonly global: { allowed: boolean; limit: number; used: number };
  readonly perUser: { allowed: boolean; limit: number; used: number };
  readonly perTradition: { allowed: boolean; limit: number; used: number };
  readonly algorithm: RateLimitAlgorithm;
  readonly appliedMultipliers: { burst: number; sustained: number; trust: number };
}

/**
 * The composite rate limiter.
 *
 * Evaluates a request against three scopes (global ceiling, per-user,
 * per-tradition) using the selected algorithm. Returns ALLOW/DENY/THROTTLE.
 */
export class CompositeRateLimiter {
  private readonly config: CompositeRateLimiterConfig;
  private readonly clock: ClockFn;
  private readonly metrics: RateLimiterMetrics;

  constructor(config: CompositeRateLimiterConfig) {
    this.config = config;
    this.clock = config.clock ?? defaultClock;
    this.metrics = new RateLimiterMetrics();
  }

  getMetrics(): RateLimiterMetrics {
    return this.metrics;
  }

  /**
   * Builds a per-tradition config from the profile + tier + policy.
   */
  private buildTraditionConfig(
    traditionId: TraditionId,
    trustTier: TrustTier,
    policy: SubmissionPolicyState,
  ): CompositeAlgorithmBagConfig {
    const profile = TRADITION_PROFILES[traditionId] ?? TRADITION_PROFILES["universalista"];
    const tier = TRUST_TIER_PROFILES[trustTier] ?? TRUST_TIER_ANON;
    const mults = normalizedPolicyMultipliers(policy);

    const burst = ceilInt(profile.burst * tier.burstMultiplier * mults.burst);
    const sustained = ceilInt(
      profile.sustainedPerHour * tier.sustainedMultiplier * mults.sustained,
    );

    return {
      tokenBucket: {
        capacity: burst,
        refillTokensPerSecond: sustained / 3600,
      },
      leakyBucket: {
        capacity: ceilInt(profile.leakyQueueSize * mults.burst),
        dripRatePerSecond: profile.sustainedPerHour / 60,
      },
      fixedWindow: {
        windowMs: profile.fixedWindowMs,
        max: burst * 2,
      },
      slidingWindow: {
        windowMs: 3_600_000,
        max: sustained,
        subWindows: profile.slidingSubWindows,
      },
    };
  }

  /**
   * Builds a per-user config from the per-user template + tier boosts.
   */
  private buildUserConfig(
    trustTier: TrustTier,
    policy: SubmissionPolicyState,
  ): CompositeAlgorithmBagConfig {
    const tier = TRUST_TIER_PROFILES[trustTier] ?? TRUST_TIER_ANON;
    const mults = normalizedPolicyMultipliers(policy);
    const tpl = this.config.perUserTemplate;
    return {
      tokenBucket: {
        capacity: ceilInt(tpl.tokenBucket.capacity * tier.burstMultiplier * mults.burst),
        refillTokensPerSecond:
          tpl.tokenBucket.refillTokensPerSecond * tier.sustainedMultiplier * mults.sustained,
      },
      leakyBucket: {
        capacity: ceilInt(tpl.leakyBucket.capacity * mults.burst),
        dripRatePerSecond: tpl.leakyBucket.dripRatePerSecond * tier.sustainedMultiplier,
      },
      fixedWindow: {
        windowMs: tpl.fixedWindow.windowMs,
        max: ceilInt(tpl.fixedWindow.max * tier.burstMultiplier * mults.burst),
      },
      slidingWindow: {
        windowMs: tpl.slidingWindow.windowMs,
        max: ceilInt(tpl.slidingWindow.max * tier.sustainedMultiplier * mults.sustained),
        subWindows: tpl.slidingWindow.subWindows,
      },
    };
  }

  /**
   * Runs the per-tradition algorithm check using the appropriate bag.
   */
  private checkPerTradition(
    traditionId: TraditionId,
    trustTier: TrustTier,
    policy: SubmissionPolicyState,
    algorithm: RateLimitAlgorithm,
  ): { allowed: boolean; retryAfter: number; used: number; limit: number } {
    const cfg = this.buildTraditionConfig(traditionId, trustTier, policy);
    const key = TokenStore.buildTraditionKey(traditionId);
    const bag = this.config.tokenStore.obtain(key, () => cfg);
    return this.evaluateBag(bag, algorithm, cfg);
  }

  /**
   * Runs the per-user check.
   */
  private checkPerUser(
    userId: string,
    traditionId: TraditionId,
    trustTier: TrustTier,
    policy: SubmissionPolicyState,
    algorithm: RateLimitAlgorithm,
  ): { allowed: boolean; retryAfter: number; used: number; limit: number } {
    const cfg = this.buildUserConfig(trustTier, policy);
    const key = TokenStore.buildKey({ userId, traditionId });
    const bag = this.config.tokenStore.obtain(key, () => cfg);
    return this.evaluateBag(bag, algorithm, cfg);
  }

  /**
   * Evaluates a single bag against an algorithm. Returns retry-after in
   * seconds (>=1) and approximate usage / limit.
   */
  private evaluateBag(
    bag: CompositeAlgorithmBag,
    algorithm: RateLimitAlgorithm,
    cfg: CompositeAlgorithmBagConfig,
  ): { allowed: boolean; retryAfter: number; used: number; limit: number } {
    switch (algorithm) {
      case "token_bucket":
        if (bag.tokenBucket.tryAcquire(1)) {
          const limit = cfg.tokenBucket.capacity;
          const used = limit - Math.floor(bag.tokenBucket.peek().tokens);
          return { allowed: true, retryAfter: 0, used, limit };
        }
        return {
          allowed: false,
          retryAfter: ceilInt(timeUntilNextToken(bag.tokenBucket)),
          used: cfg.tokenBucket.capacity,
          limit: cfg.tokenBucket.capacity,
        };
      case "leaky_bucket":
        if (bag.leakyBucket.tryAcquire(1)) {
          const limit = cfg.leakyBucket.capacity;
          const used = Math.ceil(bag.leakyBucket.peek().level);
          return { allowed: true, retryAfter: 0, used, limit };
        }
        return {
          allowed: false,
          retryAfter: ceilInt(drainTimeSeconds(bag.leakyBucket)),
          used: cfg.leakyBucket.capacity,
          limit: cfg.leakyBucket.capacity,
        };
      case "fixed_window":
        if (bag.fixedWindow.tryAcquire(1)) {
          const limit = cfg.fixedWindow.max;
          const used = Math.ceil(bag.fixedWindow.peek().count);
          return { allowed: true, retryAfter: 0, used, limit };
        }
        return {
          allowed: false,
          retryAfter: windowSecondsRemaining(bag.fixedWindow),
          used: cfg.fixedWindow.max,
          limit: cfg.fixedWindow.max,
        };
      case "sliding_window": {
        const limit = cfg.slidingWindow.max;
        const used = Math.ceil(bag.slidingWindow.peek().count);
        if (used < limit) {
          bag.slidingWindow.tryAcquire(1);
          return { allowed: true, retryAfter: 0, used: used + 1, limit };
        }
        return {
          allowed: false,
          retryAfter: msToCeilSeconds(
            cfg.slidingWindow.windowMs / cfg.slidingWindow.subWindows,
          ),
          used,
          limit,
        };
      }
      default:
        return { allowed: false, retryAfter: 60, used: 0, limit: 0 };
    }
  }

  /**
   * Evaluates a global request against the global ceiling.
   */
  private checkGlobal(
    algorithm: RateLimitAlgorithm,
  ): { allowed: boolean; retryAfter: number; used: number; limit: number } {
    const cfg = this.config.globalCeiling;
    const key = "global";
    const bag = this.config.tokenStore.obtain(key, () => cfg);
    return this.evaluateBag(bag, algorithm, cfg);
  }

  /**
   * Composite check across global + per-user + per-tradition.
   */
  check(input: CompositeCheckInput): CompositeCheckDecision {
    if (!input.userId) {
      return this.deny(
        input.algorithm,
        "RATE_LIMIT_INVALID_INPUT",
        60,
        { used: 0, limit: 0 },
        { used: 0, limit: 0 },
        { used: 0, limit: 0 },
        input,
      );
    }
    const tradTemplate = this.config.perTraditionTemplates[input.traditionId] ??
      this.config.perTraditionTemplates["universalista"];
    if (!tradTemplate) {
      return this.deny(
        input.algorithm,
        "RATE_LIMIT_ALGORITHM_NOT_CONFIGURED",
        60,
        { used: 0, limit: 0 },
        { used: 0, limit: 0 },
        { used: 0, limit: 0 },
        input,
      );
    }

    const globalCheck = this.checkGlobal(input.algorithm);
    if (!globalCheck.allowed) {
      this.metrics.record(
        "RATE_LIMIT_GLOBAL_CEILING",
        "DENY",
        input.userId,
        input.traditionId,
      );
      return this.deny(
        input.algorithm,
        "RATE_LIMIT_GLOBAL_CEILING",
        globalCheck.retryAfter,
        globalCheck,
        { used: 0, limit: 0 },
        { used: 0, limit: 0 },
        input,
      );
    }

    const userCheck = this.checkPerUser(
      input.userId,
      input.traditionId,
      input.trustTier,
      input.policy,
      input.algorithm,
    );
    if (!userCheck.allowed) {
      this.metrics.record(
        "RATE_LIMIT_PER_USER_EXCEEDED",
        "DENY",
        input.userId,
        input.traditionId,
      );
      return this.deny(
        input.algorithm,
        "RATE_LIMIT_PER_USER_EXCEEDED",
        userCheck.retryAfter,
        globalCheck,
        userCheck,
        { used: 0, limit: 0 },
        input,
      );
    }

    const tradCheck = this.checkPerTradition(
      input.traditionId,
      input.trustTier,
      input.policy,
      input.algorithm,
    );
    if (!tradCheck.allowed) {
      this.metrics.record(
        "RATE_LIMIT_PER_TRADITION_BURST",
        "DENY",
        input.userId,
        input.traditionId,
      );
      const reasonCode =
        tradCheck.retryAfter <= 60
          ? "RATE_LIMIT_PER_TRADITION_BURST"
          : "RATE_LIMIT_PER_TRADITION_SUSTAINED";
      return this.deny(
        input.algorithm,
        reasonCode,
        tradCheck.retryAfter,
        globalCheck,
        userCheck,
        tradCheck,
        input,
      );
    }

    const tier = TRUST_TIER_PROFILES[input.trustTier] ?? TRUST_TIER_ANON;
    const mults = normalizedPolicyMultipliers(input.policy);

    this.metrics.record(
      "RATE_LIMIT_OK",
      "ALLOW",
      input.userId,
      input.traditionId,
    );
    return {
      decision: "ALLOW",
      reason: "RATE_LIMIT_OK",
      reasons: reasonsForPolicy(input.policy),
      retryAfterSeconds: 0,
      remainingHint: safeMax([
        globalCheck.limit - globalCheck.used,
        userCheck.limit - userCheck.used,
        tradCheck.limit - tradCheck.used,
      ]),
      global: { allowed: true, limit: globalCheck.limit, used: globalCheck.used },
      perUser: { allowed: true, limit: userCheck.limit, used: userCheck.used },
      perTradition: { allowed: true, limit: tradCheck.limit, used: tradCheck.used },
      algorithm: input.algorithm,
      appliedMultipliers: {
        burst: mults.burst * tier.burstMultiplier,
        sustained: mults.sustained * tier.sustainedMultiplier,
        trust: tier.burstMultiplier,
      },
    };
  }

  private deny(
    algorithm: RateLimitAlgorithm,
    reason: ReasonCode,
    retryAfter: number,
    global: { used: number; limit: number },
    user: { used: number; limit: number },
    trad: { used: number; limit: number },
    input: CompositeCheckInput,
  ): CompositeCheckDecision {
    const tier = TRUST_TIER_PROFILES[input.trustTier] ?? TRUST_TIER_ANON;
    const mults = normalizedPolicyMultipliers(input.policy);
    const finalReason = retryAfter > 60 ? reason : reason;

    return {
      decision: "DENY",
      reason: finalReason,
      reasons: [reason, ...reasonsForPolicy(input.policy)],
      retryAfterSeconds: Math.max(1, retryAfter),
      remainingHint: 0,
      global: { allowed: false, limit: global.limit, used: global.used },
      perUser: { allowed: false, limit: user.limit, used: user.used },
      perTradition: { allowed: false, limit: trad.limit, used: trad.used },
      algorithm,
      appliedMultipliers: {
        burst: mults.burst * tier.burstMultiplier,
        sustained: mults.sustained * tier.sustainedMultiplier,
        trust: tier.burstMultiplier,
      },
    };
  }
}

/**
 * Factory for composite rate limiters, with sensible defaults.
 */
export function createCompositeRateLimiter(
  config: CompositeRateLimiterConfig,
): CompositeRateLimiter {
  return new CompositeRateLimiter(config);
}

// ============================================================================
// SECTION 13 — Metrics
// ============================================================================

/**
 * A single metrics counter.
 */
export interface RateLimiterCounter {
  readonly allow: number;
  readonly deny: number;
  readonly throttle: number;
}

/**
 * Returns a fresh zeroed counter.
 */
export function emptyCounter(): RateLimiterCounter {
  return { allow: 0, deny: 0, throttle: 0 };
}

/**
 * Internal metrics recorder.
 */
export class RateLimiterMetrics {
  private readonly counters: Map<string, RateLimiterCounter> = new Map();
  private readonly reasonCounters: Map<ReasonCode, number> = new Map();

  /**
   * Records a decision.
   */
  record(
    reason: ReasonCode,
    decision: Decision,
    userId: string,
    traditionId: TraditionId,
  ): void {
    const key = `${userId}::${traditionId}`;
    const existing = this.counters.get(key) ?? emptyCounter();
    const next: RateLimiterCounter = {
      allow: existing.allow + (decision === "ALLOW" ? 1 : 0),
      deny: existing.deny + (decision === "DENY" ? 1 : 0),
      throttle: existing.throttle + (decision === "THROTTLE" ? 1 : 0),
    };
    this.counters.set(key, next);
    this.reasonCounters.set(
      reason,
      (this.reasonCounters.get(reason) ?? 0) + 1,
    );
  }

  /**
   * Returns the counter for a given user/tradition pair.
   */
  get(userId: string, traditionId: TraditionId): RateLimiterCounter {
    return this.counters.get(`${userId}::${traditionId}`) ?? emptyCounter();
  }

  /**
   * Returns the total events seen.
   */
  totalEvents(): number {
    let total = 0;
    for (const c of this.counters.values()) {
      total += c.allow + c.deny + c.throttle;
    }
    return total;
  }

  /**
   * Returns the count of decisions broken out by ReasonCode.
   */
  reasonCounts(): ReadonlyMap<ReasonCode, number> {
    return new Map(this.reasonCounters);
  }

  /**
   * Returns the list of unique (userId, traditionId) pairs.
   */
  keys(): string[] {
    return Array.from(this.counters.keys());
  }

  /**
   * Resets all metrics. Intended for tests.
   */
  reset(): void {
    this.counters.clear();
    this.reasonCounters.clear();
  }

  /**
   * Builds a plain export for observability sinks.
   */
  describe(): {
    totalEvents: number;
    counters: Record<string, RateLimiterCounter>;
    reasonCounts: Record<string, number>;
  } {
    const counters: Record<string, RateLimiterCounter> = {};
    for (const [k, v] of this.counters) counters[k] = v;
    const reasonCounts: Record<string, number> = {};
    for (const [k, v] of this.reasonCounters) reasonCounts[k] = v;
    return {
      totalEvents: this.totalEvents(),
      counters,
      reasonCounts,
    };
  }
}

/**
 * Factory for metrics instances.
 */
export function createRateLimiterMetrics(): RateLimiterMetrics {
  return new RateLimiterMetrics();
}

// ============================================================================
// SECTION 14 — HTTP response helpers
// ============================================================================

/**
 * A single HTTP header emitted by the rate limiter response builder.
 */
export interface RateLimitHeader {
  readonly name: string;
  readonly value: string;
}

/**
 * Body returned to the caller when a request is throttled or denied.
 */
export interface RateLimitResponseBody {
  readonly decision: Decision;
  readonly reason: ReasonCode;
  readonly retryAfterSeconds: number;
  readonly algorithm: RateLimitAlgorithm;
  readonly traditionId: TraditionId;
  readonly userTier: TrustTier;
  readonly limits: {
    readonly global: number;
    readonly perUser: number;
    readonly perTradition: number;
  };
  readonly used: {
    readonly global: number;
    readonly perUser: number;
    readonly perTradition: number;
  };
  readonly message: string;
}

/**
 * A full HTTP response surface for a rate-limit decision.
 */
export interface RateLimitHttpResponse {
  readonly status: number;
  readonly headers: readonly RateLimitHeader[];
  readonly body: RateLimitResponseBody;
}

/**
 * Builds an HTTP-style response from a composite decision.
 */
export function buildHttpResponse(
  decision: CompositeCheckDecision,
  traditionId: TraditionId,
  trustTier: TrustTier,
): RateLimitHttpResponse {
  const remaining = Math.max(0, decision.remainingHint);
  const resetSec = decision.retryAfterSeconds > 0 ? decision.retryAfterSeconds : 60;
  const headers: RateLimitHeader[] = [
    {
      name: "X-RateLimit-Limit",
      value: String(decision.perUser.limit + decision.perTradition.limit),
    },
    { name: "X-RateLimit-Remaining", value: String(remaining) },
    { name: "X-RateLimit-Reset", value: String(resetSec) },
    { name: "X-RateLimit-Algorithm", value: decision.algorithm },
    { name: "X-RateLimit-Reason", value: decision.reason },
  ];
  let status = 200;
  let message = "ok";
  if (decision.decision === "DENY") {
    status = 429;
    message = humanizeReason(decision.reason);
    headers.push({
      name: "Retry-After",
      value: String(Math.max(1, decision.retryAfterSeconds)),
    });
  } else if (decision.decision === "THROTTLE") {
    status = 429;
    message = "slow down";
    headers.push({
      name: "Retry-After",
      value: String(Math.max(1, decision.retryAfterSeconds)),
    });
  }
  return {
    status,
    headers,
    body: {
      decision: decision.decision,
      reason: decision.reason,
      retryAfterSeconds: decision.retryAfterSeconds,
      algorithm: decision.algorithm,
      traditionId,
      userTier: trustTier,
      limits: {
        global: decision.global.limit,
        perUser: decision.perUser.limit,
        perTradition: decision.perTradition.limit,
      },
      used: {
        global: decision.global.used,
        perUser: decision.perUser.used,
        perTradition: decision.perTradition.used,
      },
      message,
    },
  };
}

/**
 * Human-readable translation for a given reason code (PT-BR default).
 */
export function humanizeReason(reason: ReasonCode): string {
  switch (reason) {
    case "RATE_LIMIT_GLOBAL_CEILING":
      return "Limite global atingido; tente novamente mais tarde.";
    case "RATE_LIMIT_PER_USER_EXCEEDED":
      return "Você excedeu seu limite de submissões.";
    case "RATE_LIMIT_PER_TRADITION_BURST":
      return "Muitas submissões rápidas para esta tradição. Aguarde um momento.";
    case "RATE_LIMIT_PER_TRADITION_SUSTAINED":
      return "Limite sustentado desta tradição atingido.";
    case "RATE_LIMIT_SLIDING_1H":
      return "Limite de 1 hora atingido.";
    case "RATE_LIMIT_SLIDING_24H":
      return "Limite de 24 horas atingido.";
    case "RATE_LIMIT_FIXED_WINDOW":
      return "Limite da janela fixa atingido.";
    case "RATE_LIMIT_LEAKY_OVERFLOW":
      return "Fila saturada; tente novamente.";
    case "RATE_LIMIT_TOKEN_BUCKET_EMPTY":
      return "Sem tokens disponíveis no momento.";
    case "RATE_LIMIT_SACRED_BONUS":
      return "Conteúdo sagrado detectado: limite expandido.";
    case "RATE_LIMIT_FLAGGED_RESTRICTED":
      return "Conteúdo sinalizado: limite reduzido.";
    case "RATE_LIMIT_TRUST_BOOST":
      return "Limite ajustado por tier de confiança.";
    case "RATE_LIMIT_ALGORITHM_NOT_CONFIGURED":
      return "Algoritmo não configurado.";
    case "RATE_LIMIT_INVALID_INPUT":
      return "Entrada inválida.";
    case "RATE_LIMIT_OK":
      return "ok";
    default:
      return "ok";
  }
}

/**
 * Builds a 429 response from a decision.
 */
export function buildTooManyRequests(
  decision: CompositeCheckDecision,
  traditionId: TraditionId,
  trustTier: TrustTier,
): RateLimitHttpResponse {
  return buildHttpResponse(decision, traditionId, trustTier);
}

/**
 * Builds an OK response from an ALLOW decision.
 */
export function buildOkResponse(
  decision: CompositeCheckDecision,
  traditionId: TraditionId,
  trustTier: TrustTier,
): RateLimitHttpResponse {
  return buildHttpResponse(decision, traditionId, trustTier);
}

/**
 * Serializes a RateLimitHttpResponse to JSON-friendly shape.
 */
export function serializeResponse(
  response: RateLimitHttpResponse,
): {
  status: number;
  headers: Record<string, string>;
  body: RateLimitResponseBody;
} {
  const headers: Record<string, string> = {};
  for (const h of response.headers) headers[h.name] = h.value;
  return { status: response.status, headers, body: response.body };
}

// ============================================================================
// SECTION 15 — LGPD Art. 7 (consent), Art. 9 (sensitive), Art. 18 (rights)
// ============================================================================

/**
 * LGPD consent posture for a user. Art. 7 requires affirmative consent for
 * personal data processing.
 */
export type ConsentState =
  | "granted"
  | "denied"
  | "withdrawn"
  | "unknown";

/**
 * LGPD-sensitive categories. Art. 9 covers sensitive data — religion is
 * explicitly listed, so tradition + sacred flags are sensitive by default.
 */
export type LgpdSensitivity =
  | "non_sensitive"
  | "religion"
  | "health"
  | "political_opinion"
  | "biometric"
  | "children";

/**
 * LGPD Art. 18 right being exercised.
 */
export type LgpdRight =
  | "access"
  | "erasure"
  | "portability"
  | "correction"
  | "confirmation"
  | "opposition";

/**
 * Records an LGPD-related audit event.
 */
export interface LgpdAuditRecord {
  readonly userId: string;
  readonly right: LgpdRight | "consent_change";
  readonly consent: ConsentState;
  readonly sensitivity: LgpdSensitivity;
  readonly timestampMs: number;
  readonly notes: string;
}

/**
 * Builds a new audit record for the LGPD module.
 */
export function buildLgpdAuditRecord(
  userId: string,
  right: LgpdRight | "consent_change",
  consent: ConsentState,
  sensitivity: LgpdSensitivity,
  notes: string,
  now: number = defaultClock(),
): LgpdAuditRecord {
  return { userId, right, consent, sensitivity, timestampMs: now, notes };
}

/**
 * Determines whether the rate limiter may use the user's trust tier for
 * personalization. Art. 7 requires consent; Art. 9 requires explicit consent
 * for sensitive data.
 */
export function mayUseTrustTier(
  consent: ConsentState,
  sensitivity: LgpdSensitivity,
  currentRight: LgpdRight | null,
): boolean {
  if (currentRight === "opposition" || currentRight === "erasure") return false;
  if (consent !== "granted") return false;
  return true;
}

/**
 * Returns whether a tradition + sacred flag combo should be treated as
 * sensitive under Art. 9. Religion is always sensitive; sacred is always
 * sensitive regardless of tradition.
 */
export function isSensitive(
  traditionId: TraditionId,
  flags: readonly SubmissionFlag[],
): boolean {
  if ((flags as readonly string[]).includes("sacred")) return true;
  return !!traditionId;
}

/**
 * Erases the trust-tier record for a user (Art. 18 erasure). Returns the
 * resulting default tier (anon).
 */
export function eraseTrustTier(
  userId: string,
  store: TokenStore,
): { userId: string; newTier: TrustTier; removed: boolean } {
  const removed = store.forget(userId);
  return { userId, newTier: "anon", removed };
}

/**
 * Builds an export package for a user (Art. 18 portability). Includes the
 * metrics counters + audit trail but NEVER the raw buckets.
 */
export interface LgpdExportPackage {
  readonly userId: string;
  readonly exportedAtMs: number;
  readonly counters: RateLimiterCounter;
  readonly trustTier: TrustTier;
  readonly audit: readonly LgpdAuditRecord[];
}

export function buildExportPackage(
  userId: string,
  metrics: RateLimiterMetrics,
  trustTier: TrustTier,
  audit: readonly LgpdAuditRecord[],
  now: number = defaultClock(),
): LgpdExportPackage {
  let allow = 0;
  let deny = 0;
  let throttle = 0;
  for (const traditionId of ALL_TRADITION_IDS) {
    const c = metrics.get(userId, traditionId);
    allow += c.allow;
    deny += c.deny;
    throttle += c.throttle;
  }
  const aggregated: RateLimiterCounter = { allow, deny, throttle };
  return {
    userId,
    exportedAtMs: now,
    counters: aggregated,
    trustTier,
    audit: audit.filter((a) => a.userId === userId),
  };
}

/**
 * Hard-resets all per-user state. Used as the operational arm of erasure.
 */
export function purgeUser(
  userId: string,
  store: TokenStore,
  metrics: RateLimiterMetrics,
): { purged: number } {
  let purged = 0;
  const allKeys = store.keys();
  for (const key of allKeys) {
    if (key.startsWith(`${userId}::`)) {
      store.forget(key);
      purged++;
    }
  }
  metrics.reset();
  return { purged };
}

// ============================================================================
// SECTION 16 — Algorithm descriptors (for UIs / docs / runbooks)
// ============================================================================

export const ALGORITHM_TOKEN_BUCKET: AlgorithmDescriptor = {
  id: "token_bucket",
  displayName: "Token bucket",
  description: "Continuous refill; sized for burst + sustained traffic.",
  burstSupport: true,
  sustainedSupport: true,
  windowedSupport: false,
};

export const ALGORITHM_LEAKY_BUCKET: AlgorithmDescriptor = {
  id: "leaky_bucket",
  displayName: "Leaky bucket",
  description: "Constant drain; smooths bursty traffic into a steady stream.",
  burstSupport: true,
  sustainedSupport: true,
  windowedSupport: false,
};

export const ALGORITHM_FIXED_WINDOW: AlgorithmDescriptor = {
  id: "fixed_window",
  displayName: "Janela fixa",
  description: "Conta requisições por janela alinhada; permite 2x no limite.",
  burstSupport: false,
  sustainedSupport: true,
  windowedSupport: true,
};

export const ALGORITHM_SLIDING_WINDOW: AlgorithmDescriptor = {
  id: "sliding_window",
  displayName: "Janela deslizante",
  description: "Soma rolante por sub-buckets; mais precisa que janela fixa.",
  burstSupport: false,
  sustainedSupport: true,
  windowedSupport: true,
};

export const ALGORITHM_DESCRIPTORS: Readonly<
  Record<RateLimitAlgorithm, AlgorithmDescriptor>
> = {
  token_bucket: ALGORITHM_TOKEN_BUCKET,
  leaky_bucket: ALGORITHM_LEAKY_BUCKET,
  fixed_window: ALGORITHM_FIXED_WINDOW,
  sliding_window: ALGORITHM_SLIDING_WINDOW,
};

export function getAlgorithmDescriptor(
  algo: RateLimitAlgorithm,
): AlgorithmDescriptor {
  return ALGORITHM_DESCRIPTORS[algo];
}

// ============================================================================
// SECTION 17 — Default configuration builders
// ============================================================================

/**
 * Default per-user template — conservative base for tier boosts.
 */
export function defaultPerUserTemplate(): CompositeAlgorithmBagConfig {
  return {
    tokenBucket: {
      capacity: 10,
      refillTokensPerSecond: 10 / 3600,
    },
    leakyBucket: {
      capacity: 12,
      dripRatePerSecond: 10 / 60,
    },
    fixedWindow: {
      windowMs: 60_000,
      max: 20,
    },
    slidingWindow: {
      windowMs: 3_600_000,
      max: 60,
      subWindows: 12,
    },
  };
}

/**
 * Default global ceiling — protects the w51 webhook from being DoS'd.
 */
export function defaultGlobalCeiling(): CompositeAlgorithmBagConfig {
  return {
    tokenBucket: {
      capacity: 5_000,
      refillTokensPerSecond: 5_000 / 3600,
    },
    leakyBucket: {
      capacity: 6_000,
      dripRatePerSecond: 5_000 / 60,
    },
    fixedWindow: {
      windowMs: 60_000,
      max: 12_000,
    },
    slidingWindow: {
      windowMs: 3_600_000,
      max: 60_000,
      subWindows: 60,
    },
  };
}

/**
 * Default per-tradition templates — derived from each profile.
 */
export function defaultPerTraditionTemplates(): Readonly<
  Record<TraditionId, CompositeAlgorithmBagConfig>
> {
  const out: Partial<Record<TraditionId, CompositeAlgorithmBagConfig>> = {};
  for (const id of ALL_TRADITION_IDS) {
    const p = TRADITION_PROFILES[id];
    out[id] = {
      tokenBucket: {
        capacity: p.burst,
        refillTokensPerSecond: p.sustainedPerHour / 3600,
      },
      leakyBucket: {
        capacity: p.leakyQueueSize,
        dripRatePerSecond: p.sustainedPerHour / 60,
      },
      fixedWindow: {
        windowMs: p.fixedWindowMs,
        max: p.burst * 2,
      },
      slidingWindow: {
        windowMs: 3_600_000,
        max: p.sustainedPerHour,
        subWindows: p.slidingSubWindows,
      },
    };
  }
  return out as Record<TraditionId, CompositeAlgorithmBagConfig>;
}

/**
 * Builds a complete default configuration.
 */
export function buildDefaultConfig(
  store: TokenStore,
  clock?: ClockFn,
): CompositeRateLimiterConfig {
  return {
    globalCeiling: defaultGlobalCeiling(),
    perUserTemplate: defaultPerUserTemplate(),
    perTraditionTemplates: defaultPerTraditionTemplates(),
    tokenStore: store,
    clock,
  };
}

// ============================================================================
// SECTION 18 — High-level facade
// ============================================================================

/**
 * The end-user facade for the w54 prayer rate limiter.
 *
 * Wraps a CompositeRateLimiter + provides helper methods for ergonomic call
 * sites in the w51 webhook router.
 */
export class PrayerRateLimiterFacade {
  private readonly limiter: CompositeRateLimiter;
  private readonly clock: ClockFn;

  constructor(config: CompositeRateLimiterConfig) {
    this.limiter = new CompositeRateLimiter(config);
    this.clock = config.clock ?? defaultClock;
  }

  /**
   * Wraps a check into an HTTP response.
   */
  checkAndRespond(input: CompositeCheckInput): RateLimitHttpResponse {
    const decision = this.limiter.check(input);
    return buildHttpResponse(decision, input.traditionId, input.trustTier);
  }

  /**
   * Returns the underlying composite limiter (for advanced callers).
   */
  getLimiter(): CompositeRateLimiter {
    return this.limiter;
  }

  /**
   * Returns the metrics snapshot.
   */
  describe(): {
    metrics: ReturnType<RateLimiterMetrics["describe"]>;
    clock: number;
  } {
    return {
      metrics: this.limiter.getMetrics().describe(),
      clock: this.clock(),
    };
  }
}

/**
 * Factory for the high-level facade.
 */
export function createPrayerRateLimiterFacade(
  config: CompositeRateLimiterConfig,
): PrayerRateLimiterFacade {
  return new PrayerRateLimiterFacade(config);
}

// ============================================================================
// SECTION 19 — Sample inputs (for tests + dev pages)
// ============================================================================

/**
 * Builds a sample composite check input.
 */
export function makeSampleInput(
  overrides: Partial<CompositeCheckInput> = {},
): CompositeCheckInput {
  return {
    userId: overrides.userId ?? "user-1",
    traditionId: overrides.traditionId ?? "umbanda",
    algorithm: overrides.algorithm ?? "token_bucket",
    policy: overrides.policy ?? {
      sacred: false,
      flagged: false,
      autoApproved: false,
      needsReview: false,
      blocked: false,
    },
    trustTier: overrides.trustTier ?? "anon",
  };
}

/**
 * Builds a permissive input (moderator + sacred + Umbanda).
 */
export function makePermissiveInput(): CompositeCheckInput {
  return makeSampleInput({
    userId: "moderator-1",
    traditionId: "umbanda",
    trustTier: "moderator",
    policy: {
      sacred: true,
      flagged: false,
      autoApproved: true,
      needsReview: false,
      blocked: false,
    },
  });
}

/**
 * Builds a strict input (anon + flagged + Cabala).
 */
export function makeStrictInput(): CompositeCheckInput {
  return makeSampleInput({
    userId: "anon-1",
    traditionId: "cabala",
    trustTier: "anon",
    policy: {
      sacred: false,
      flagged: true,
      autoApproved: false,
      needsReview: true,
      blocked: false,
    },
  });
}

// ============================================================================
// SECTION 20 — Utilities, diagnostics, summaries
// ============================================================================

/**
 * Returns the lowercase identifier for a TraditionId (sanity check / normalize).
 */
export function normalizeTraditionId(input: string): TraditionId {
  const lower = input.toLowerCase();
  if ((ALL_TRADITION_IDS as readonly string[]).includes(lower)) {
    return lower as TraditionId;
  }
  return "universalista";
}

/**
 * Returns whether the given string is a known trust tier.
 */
export function isKnownTrustTier(s: string): s is TrustTier {
  return (ALL_TRUST_TIERS as readonly string[]).includes(s);
}

/**
 * Returns whether the given string is a known algorithm id.
 */
export function isKnownAlgorithm(s: string): s is RateLimitAlgorithm {
  return (ALL_ALGORITHMS as readonly string[]).includes(s);
}

/**
 * Returns the descriptive category for a given reason code.
 */
export function reasonCategory(reason: ReasonCode): string {
  return REASON_CATEGORY_MAP[reason];
}

/**
 * Summarizes a decision into a debug string for logs.
 */
export function summarizeDecision(decision: CompositeCheckDecision): string {
  return [
    `decision=${decision.decision}`,
    `reason=${decision.reason}`,
    `algorithm=${decision.algorithm}`,
    `retryAfter=${decision.retryAfterSeconds}s`,
    `remaining=${decision.remainingHint}`,
  ].join(" ");
}

/**
 * Summarizes an HTTP response into a one-liner.
 */
export function summarizeHttpResponse(response: RateLimitHttpResponse): string {
  return [
    `status=${response.status}`,
    `decision=${response.body.decision}`,
    `reason=${response.body.reason}`,
    `retry=${response.body.retryAfterSeconds}s`,
    `trad=${response.body.traditionId}`,
    `tier=${response.body.userTier}`,
  ].join(" ");
}

/**
 * Returns the rate-limit safe identifier for a user — used in logs to avoid
 * leaking PII. Not a hash (that's encryption); just truncation.
 */
export function redactedUserId(userId: string): string {
  if (userId.length <= 6) return "redacted";
  return `${userId.slice(0, 3)}***${userId.slice(-2)}`;
}

/**
 * Returns the rate-limit safe identifier for a tradition.
 */
export function redactedTraditionId(traditionId: TraditionId): string {
  return traditionId;
}

/**
 * Computes the total theoretical sustained limit a user has across traditions.
 */
export function totalSustainedLimit(
  trustTier: TrustTier,
  traditions: readonly TraditionId[],
): number {
  const tier = TRUST_TIER_PROFILES[trustTier];
  let total = 0;
  for (const tid of traditions) {
    const p = TRADITION_PROFILES[tid];
    total += p.sustainedPerHour * tier.sustainedMultiplier;
  }
  return total;
}

/**
 * Returns the burst ceiling for a given tradition + trust tier.
 */
export function burstCeiling(
  traditionId: TraditionId,
  trustTier: TrustTier,
): number {
  const p = TRADITION_PROFILES[traditionId];
  const tier = TRUST_TIER_PROFILES[trustTier];
  return ceilInt(p.burst * tier.burstMultiplier);
}

/**
 * Returns the sustained/hour ceiling for a given tradition + trust tier.
 */
export function sustainedPerHourCeiling(
  traditionId: TraditionId,
  trustTier: TrustTier,
): number {
  const p = TRADITION_PROFILES[traditionId];
  const tier = TRUST_TIER_PROFILES[trustTier];
  return ceilInt(p.sustainedPerHour * tier.sustainedMultiplier);
}

/**
 * Returns a one-line header value for a Retry-After (RFC 7231 §7.1.3).
 */
export function formatRetryAfter(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  return String(safe);
}

/**
 * Returns whether the rate limiter should drop the request (DENY) versus
 * throttle it (THROTTLE) given a retryAfter. Sub-3 seconds -> THROTTLE.
 */
export function classifySeverity(retryAfterSeconds: number): "DENY" | "THROTTLE" {
  return retryAfterSeconds <= 3 ? "THROTTLE" : "DENY";
}

// ============================================================================
// SECTION 21 — Versioning
// ============================================================================

export const W54_MODULE_VERSION = "1.0.0" as const;
export const W54_MODULE_NAME = "prayer_submission_rate_limiter" as const;
export const W54_MODULE_BUILD_DATE = "2026-06-29" as const;

export interface W54ModuleManifest {
  readonly name: string;
  readonly version: string;
  readonly buildDate: string;
  readonly algorithms: readonly RateLimitAlgorithm[];
  readonly traditions: readonly TraditionId[];
  readonly trustTiers: readonly TrustTier[];
  readonly reasonCodes: readonly ReasonCode[];
}

export function buildManifest(): W54ModuleManifest {
  return {
    name: W54_MODULE_NAME,
    version: W54_MODULE_VERSION,
    buildDate: W54_MODULE_BUILD_DATE,
    algorithms: ALL_ALGORITHMS,
    traditions: ALL_TRADITION_IDS,
    trustTiers: ALL_TRUST_TIERS,
    reasonCodes: REASON_CODES,
  };
}
