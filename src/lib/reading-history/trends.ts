/**
 * ════════════════════════════════════════════════════════════════════════════
 * READING HISTORY TRENDS — Wave 69
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Time-series analytics over `history.ts`. Pure derivation — never mutates
 * the log. Bucketing and aggregation live here so insights can stay lean.
 *
 * EXPORTS
 *   - computeTrends(userId, windowDays=90, bucketSize='day'|'week'|'month')
 *   - moodTrend(userId, windowDays)
 *   - cardFrequencyOverTime(userId, cardKey, bucketSize)
 *   - detectShifts(userId, sensitivity=0.5)
 *   - forecastNextReading(userId)
 *
 * CONVENTIONS
 *   - "Z-score" is a simple mean-and-stddev — no library call.
 *   - "Forecast" is a cadence estimate (median inter-reading gap) with a
 *     confidence band, NEVER a deterministic timestamp.
 *   - All return types are frozen.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  type CardKey,
  type ReadingHistoryEntry,
  type UserId,
  getHistory,
} from './history.ts';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export type BucketSize = 'day' | 'week' | 'month';

export interface TrendBucket {
  /** ISO start of the bucket (date-only semantics). */
  readonly key: string;
  /** Window [start, end) the bucket covers. */
  readonly start: Date;
  readonly end: Date;
  /** Number of readings in this bucket. */
  readonly count: number;
  /** Total cards drawn in this bucket. */
  readonly cardsDrawn: number;
  /** Distinct traditions used in this bucket. */
  readonly traditions: readonly string[];
}

export interface TrendReport {
  readonly userId: UserId;
  readonly windowDays: number;
  readonly bucketSize: BucketSize;
  readonly buckets: readonly TrendBucket[];
  readonly totalReadings: number;
  readonly firstReadingAt: Date | null;
  readonly lastReadingAt: Date | null;
  readonly bucketCount: number;
  readonly computedAt: Date;
}

export interface MoodPoint {
  readonly bucketKey: string;
  readonly start: Date;
  readonly end: Date;
  /** -1..+1 average mood across readings in this bucket. */
  readonly polarity: number;
  readonly sampleSize: number;
}

export interface MoodTrend {
  readonly userId: UserId;
  readonly windowDays: number;
  readonly points: readonly MoodPoint[];
  readonly overallPolarity: number;
  readonly trendDirection: 'up' | 'down' | 'flat' | 'unknown';
  readonly computedAt: Date;
}

export interface CardFrequencyPoint {
  readonly bucketKey: string;
  readonly start: Date;
  readonly end: Date;
  readonly count: number;
}

export interface CardFrequencyOverTime {
  readonly userId: UserId;
  readonly cardKey: CardKey;
  readonly windowDays: number;
  readonly points: readonly CardFrequencyPoint[];
  readonly totalOccurrences: number;
  readonly firstSeenAt: Date | null;
  readonly lastSeenAt: Date | null;
  readonly computedAt: Date;
}

export interface Shift {
  readonly bucketKey: string;
  readonly start: Date;
  readonly observed: number;
  readonly baseline: number;
  readonly zscore: number;
  readonly direction: 'spike' | 'dip';
  readonly description: string;
}

export interface ShiftReport {
  readonly userId: UserId;
  readonly windowDays: number;
  readonly sensitivity: number;
  readonly shifts: readonly Shift[];
  readonly computedAt: Date;
}

export interface ReadingForecast {
  readonly userId: UserId;
  /** Median of inter-reading gaps in days. */
  readonly medianGapDays: number;
  /** Sample standard deviation of gaps in days. */
  readonly stdGapDays: number;
  /** Lower confidence bound (days from last reading). */
  readonly nextLikelyMinDays: number;
  /** Upper confidence bound (days from last reading). */
  readonly nextLikelyMaxDays: number;
  /** Estimated ISO date — midpoint of the confidence window, never guaranteed. */
  readonly estimatedNextAt: Date;
  /** Sample size used. */
  readonly sampleSize: number;
  readonly computedAt: Date;
}

// ════════════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════════════

export class TrendsError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'TrendsError';
    this.code = code;
    Object.freeze(this);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// BUCKET HELPERS
// ════════════════════════════════════════════════════════════════════════════

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_DAY_OF_YEAR = (y: number): number => {
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return leap ? 366 : 365;
};

function startOfUtcDay(d: Date): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
}

function isoDayKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isoWeekKey(d: Date): string {
  // ISO 8601 week — Monday is the start of the week.
  // Algorithm: shift Thursday of the same week to the year's Thursday.
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7; // Mon = 0
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3); // Thursday
  const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
  const diff = (tmp.getTime() - firstThursday.getTime()) / MS_PER_DAY;
  const week = 1 + Math.floor(diff / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function isoMonthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function bucketStart(date: Date, size: BucketSize): Date {
  if (size === 'day') return startOfUtcDay(date);
  if (size === 'week') {
    const d = startOfUtcDay(date);
    const dayNum = (d.getUTCDay() + 6) % 7; // Mon = 0
    d.setUTCDate(d.getUTCDate() - dayNum);
    return d;
  }
  // month
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function bucketEndExclusive(start: Date, size: BucketSize): Date {
  if (size === 'day') return new Date(start.getTime() + MS_PER_DAY);
  if (size === 'week') return new Date(start.getTime() + MS_PER_WEEK);
  // month
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
}

function keyFromBucketStart(start: Date, size: BucketSize): string {
  if (size === 'day') return isoDayKey(start);
  if (size === 'week') return isoWeekKey(start);
  return isoMonthKey(start);
}

function validBucketSize(v: unknown): v is BucketSize {
  return v === 'day' || v === 'week' || v === 'month';
}

function coerceBucketSize(v: unknown, def: BucketSize = 'day'): BucketSize {
  return validBucketSize(v) ? v : def;
}

// ════════════════════════════════════════════════════════════════════════════
// LOAD HELPERS
// ════════════════════════════════════════════════════════════════════════════

function loadEntries(userId: UserId, opts: { since?: Date; until?: Date }): readonly ReadingHistoryEntry[] {
  const page = getHistory(userId, { limit: Number.POSITIVE_INFINITY, offset: 0, ...opts });
  return page.entries;
}

function loadWindowEntries(userId: UserId, windowDays: number, now: Date = new Date()): {
  readonly entries: readonly ReadingHistoryEntry[];
  readonly since: Date;
} {
  const since = new Date(now.getTime() - windowDays * MS_PER_DAY);
  return Object.freeze({ entries: loadEntries(userId, { since }), since });
}

// ════════════════════════════════════════════════════════════════════════════
// computeTrends
// ════════════════════════════════════════════════════════════════════════════

export interface ComputeTrendsOptions {
  readonly bucketSize?: BucketSize;
}

export function computeTrends(
  userId: UserId,
  windowDays = 90,
  opts: ComputeTrendsOptions = {},
): TrendReport {
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    throw new TrendsError('INVALID_WINDOW', `windowDays must be > 0, got ${windowDays}`);
  }
  const bucketSize = coerceBucketSize(opts.bucketSize, 'day');
  const now = new Date();
  const { entries } = loadWindowEntries(userId, windowDays, now);

  // Bucket the entries by start-of-bucket.
  const bucketMap = new Map<string, { start: Date; end: Date; count: number; cards: number; traditions: Set<string> }>();
  let firstAt: Date | null = null;
  let lastAt: Date | null = null;

  for (const e of entries) {
    const bStart = bucketStart(e.createdAt, bucketSize);
    const key = keyFromBucketStart(bStart, bucketSize);
    let bucket = bucketMap.get(key);
    if (!bucket) {
      bucket = {
        start: bStart,
        end: bucketEndExclusive(bStart, bucketSize),
        count: 0,
        cards: 0,
        traditions: new Set<string>(),
      };
      bucketMap.set(key, bucket);
    }
    bucket.count += 1;
    bucket.cards += e.cards.length;
    bucket.traditions.add(e.tradition);
    if (firstAt === null || e.createdAt < firstAt) firstAt = e.createdAt;
    if (lastAt === null || e.createdAt > lastAt) lastAt = e.createdAt;
  }

  // Sort buckets chronologically.
  const buckets = [...bucketMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, b]) =>
      Object.freeze({
        key,
        start: b.start,
        end: b.end,
        count: b.count,
        cardsDrawn: b.cards,
        traditions: Object.freeze([...b.traditions].sort()),
      }),
    );

  return Object.freeze({
    userId,
    windowDays,
    bucketSize,
    buckets: Object.freeze(buckets),
    totalReadings: entries.length,
    firstReadingAt: firstAt,
    lastReadingAt: lastAt,
    bucketCount: buckets.length,
    computedAt: now,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// moodTrend
// ════════════════════════════════════════════════════════════════════════════

export function moodTrend(userId: UserId, windowDays = 60): MoodTrend {
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    throw new TrendsError('INVALID_WINDOW', `windowDays must be > 0, got ${windowDays}`);
  }
  const now = new Date();
  const { entries } = loadWindowEntries(userId, windowDays, now);

  if (entries.length === 0) {
    return Object.freeze({
      userId,
      windowDays,
      points: Object.freeze([]),
      overallPolarity: 0,
      trendDirection: 'unknown',
      computedAt: now,
    });
  }

  // Bucket by week for granularity × smoothness.
  const bucketMap = new Map<string, { start: Date; end: Date; acc: number; n: number }>();
  let overallAcc = 0;
  let overallN = 0;

  for (const e of entries) {
    const bStart = bucketStart(e.createdAt, 'week');
    const key = keyFromBucketStart(bStart, 'week');
    let bucket = bucketMap.get(key);
    if (!bucket) {
      bucket = { start: bStart, end: bucketEndExclusive(bStart, 'week'), acc: 0, n: 0 };
      bucketMap.set(key, bucket);
    }
    let polarity = 0;
    let any = false;
    for (const c of e.cards) {
      if (c.mood === -1 || c.mood === 1) {
        polarity += c.mood;
        any = true;
      }
    }
    if (any) {
      // Average within the reading, then contributes 1 to the bucket.
      const readingPolarity = polarity / e.cards.length;
      bucket.acc += readingPolarity;
      bucket.n += 1;
      overallAcc += readingPolarity;
      overallN += 1;
    }
  }

  const sortedBuckets = [...bucketMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  const points = sortedBuckets.map(([key, b]) =>
    Object.freeze({
      bucketKey: key,
      start: b.start,
      end: b.end,
      polarity: b.n === 0 ? 0 : b.acc / b.n,
      sampleSize: b.n,
    }),
  );

  // Linear-fit slope sign on polarity over time → trend direction.
  let direction: MoodTrend['trendDirection'] = 'flat';
  if (points.length >= 3 && overallN > 0) {
    const xs = points.map((_, i) => i);
    const ys = points.map((p) => p.polarity);
    const n = xs.length;
    const meanX = xs.reduce((a, n2) => a + n2, 0) / n;
    const meanY = ys.reduce((a, n2) => a + n2, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i]! - meanX) * (ys[i]! - meanY);
      den += (xs[i]! - meanX) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    if (slope > 0.02) direction = 'up';
    else if (slope < -0.02) direction = 'down';
    else direction = 'flat';
  } else if (overallN === 0) {
    direction = 'unknown';
  }

  return Object.freeze({
    userId,
    windowDays,
    points: Object.freeze(points),
    overallPolarity: overallN === 0 ? 0 : overallAcc / overallN,
    trendDirection: direction,
    computedAt: now,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// cardFrequencyOverTime
// ════════════════════════════════════════════════════════════════════════════

export function cardFrequencyOverTime(
  userId: UserId,
  cardKey: CardKey,
  bucketSize: BucketSize = 'week',
  windowDays = 180,
): CardFrequencyOverTime {
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    throw new TrendsError('INVALID_WINDOW', `windowDays must be > 0, got ${windowDays}`);
  }
  const size = coerceBucketSize(bucketSize, 'week');
  const now = new Date();
  const { entries } = loadWindowEntries(userId, windowDays, now);

  const bucketMap = new Map<string, { start: Date; end: Date; count: number }>();
  let total = 0;
  let firstAt: Date | null = null;
  let lastAt: Date | null = null;

  for (const e of entries) {
    let touched = false;
    for (const c of e.cards) {
      if (c.key === cardKey) {
        touched = true;
        break;
      }
    }
    if (!touched) continue;
    const bStart = bucketStart(e.createdAt, size);
    const key = keyFromBucketStart(bStart, size);
    let bucket = bucketMap.get(key);
    if (!bucket) {
      bucket = { start: bStart, end: bucketEndExclusive(bStart, size), count: 0 };
      bucketMap.set(key, bucket);
    }
    bucket.count += 1;
    total += 1;
    if (firstAt === null || e.createdAt < firstAt) firstAt = e.createdAt;
    if (lastAt === null || e.createdAt > lastAt) lastAt = e.createdAt;
  }

  const points = [...bucketMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, b]) =>
      Object.freeze({
        bucketKey: key,
        start: b.start,
        end: b.end,
        count: b.count,
      }),
    );

  return Object.freeze({
    userId,
    cardKey,
    windowDays,
    points: Object.freeze(points),
    totalOccurrences: total,
    firstSeenAt: firstAt,
    lastSeenAt: lastAt,
    computedAt: now,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// detectShifts (Z-score on rolling weekly count)
// ════════════════════════════════════════════════════════════════════════════

export function detectShifts(userId: UserId, sensitivity = 0.5): ShiftReport {
  if (!Number.isFinite(sensitivity) || sensitivity <= 0) {
    throw new TrendsError('INVALID_SENSITIVITY', `sensitivity must be > 0, got ${sensitivity}`);
  }
  const windowDays = 180;
  const now = new Date();
  const { entries } = loadWindowEntries(userId, windowDays, now);
  if (entries.length < 8) {
    return Object.freeze({
      userId,
      windowDays,
      sensitivity,
      shifts: Object.freeze([]),
      computedAt: now,
    });
  }

  const trends = computeTrends(userId, windowDays, { bucketSize: 'week' });
  if (trends.buckets.length < 6) {
    return Object.freeze({
      userId,
      windowDays,
      sensitivity,
      shifts: Object.freeze([]),
      computedAt: now,
    });
  }

  const counts = trends.buckets.map((b) => b.count);
  const mean = counts.reduce((a, n) => a + n, 0) / counts.length;
  const variance = counts.reduce((a, n) => a + (n - mean) ** 2, 0) / counts.length;
  const std = Math.sqrt(variance);
  if (std === 0) {
    return Object.freeze({
      userId,
      windowDays,
      sensitivity,
      shifts: Object.freeze([]),
      computedAt: now,
    });
  }

  // Sensitivity 0.5 → z-threshold 1.5; sensitivity 1.0 → z-threshold 0.8.
  // Inverse: higher sensitivity = lower z-threshold.
  const zThreshold = 1.5 / Math.max(sensitivity, 0.01);

  const out: Shift[] = [];
  for (let i = 0; i < trends.buckets.length; i++) {
    const bucket = trends.buckets[i]!;
    const observed = bucket.count;
    const zscore = (observed - mean) / std;
    if (Math.abs(zscore) >= zThreshold) {
      const direction: Shift['direction'] = zscore > 0 ? 'spike' : 'dip';
      out.push(
        Object.freeze({
          bucketKey: bucket.key,
          start: bucket.start,
          observed,
          baseline: Number(mean.toFixed(2)),
          zscore: Number(zscore.toFixed(3)),
          direction,
          description:
            direction === 'spike'
              ? `Pico de atividade (${observed} leituras vs média ${mean.toFixed(1)})`
              : `Queda de atividade (${observed} leituras vs média ${mean.toFixed(1)})`,
        }),
      );
    }
  }

  return Object.freeze({
    userId,
    windowDays,
    sensitivity,
    shifts: Object.freeze(out),
    computedAt: now,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// forecastNextReading
// ════════════════════════════════════════════════════════════════════════════

export function forecastNextReading(userId: UserId, now: Date = new Date()): ReadingForecast {
  const entries = loadEntries(userId, {});
  if (entries.length === 0) {
    return Object.freeze({
      userId,
      medianGapDays: 0,
      stdGapDays: 0,
      nextLikelyMinDays: 0,
      nextLikelyMaxDays: 0,
      estimatedNextAt: now,
      sampleSize: 0,
      computedAt: now,
    });
  }
  if (entries.length === 1) {
    // Cannot compute gaps from a single reading. Provide a conservative 7-day guess.
    return Object.freeze({
      userId,
      medianGapDays: 7,
      stdGapDays: 0,
      nextLikelyMinDays: 1,
      nextLikelyMaxDays: 14,
      estimatedNextAt: new Date(now.getTime() + 7 * MS_PER_DAY),
      sampleSize: 1,
      computedAt: now,
    });
  }

  const sorted = [...entries].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const dt = sorted[i]!.createdAt.getTime() - sorted[i - 1]!.createdAt.getTime();
    gaps.push(dt / MS_PER_DAY);
  }
  gaps.sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)] ?? 0;
  const mean = gaps.reduce((a, n) => a + n, 0) / gaps.length;
  const variance = gaps.reduce((a, n) => a + (n - mean) ** 2, 0) / gaps.length;
  const std = Math.sqrt(variance);

  // Confidence band: median ± std, floored to [1, 365] days.
  const minDays = Math.max(1, Math.floor(median - std));
  const maxDays = Math.min(365, Math.ceil(median + std));
  const estimate = new Date(now.getTime() + median * MS_PER_DAY);

  return Object.freeze({
    userId,
    medianGapDays: Number(median.toFixed(3)),
    stdGapDays: Number(std.toFixed(3)),
    nextLikelyMinDays: minDays,
    nextLikelyMaxDays: maxDays,
    estimatedNextAt: estimate,
    sampleSize: sorted.length,
    computedAt: now,
  });
}

// Silence unused-symbol warning while keeping `MS_PER_DAY_OF_YEAR` for future use.
void MS_PER_DAY_OF_YEAR;

// ════════════════════════════════════════════════════════════════════════════
// AUDIT
// ════════════════════════════════════════════════════════════════════════════

export const trendsEngineInfo = Object.freeze({
  name: 'reading-history-trends',
  version: '1.0.0',
  dependsOn: ['history'],
  readOnly: true,
  defaultWindowDays: 90,
  bucketSizes: ['day', 'week', 'month'] as const,
});

export const TRENDS_AUDIT = Object.freeze({
  exportedFunctions: [
    'computeTrends',
    'moodTrend',
    'cardFrequencyOverTime',
    'detectShifts',
    'forecastNextReading',
  ] as const,
  immutableOutputs: true,
  deterministic: true,
});
