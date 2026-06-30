/**
 * ════════════════════════════════════════════════════════════════════════════
 * READING HISTORY STATISTICS — Wave 69
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Aggregation layer over `history.ts`. All read-only — never mutates the
 * underlying history log. Windowing is "look back N days from `now`"
 * unless an explicit `until` reference is passed.
 *
 * Stat conventions:
 *  - `totalReadings`    — count of entries in scope.
 *  - `totalCardsDrawn`  — sum of `entry.cards.length`.
 *  - `activeDays`       — distinct calendar days with ≥1 reading.
 *  - `windowDays`       — defaults to 365 for "year-in-review" feel.
 *  - `streakDays`       — consecutive days ending TODAY (UTC date) with ≥1.
 *  - `empty`            — convenience flag for UI ("no readings yet").
 *
 * `topCards(n, opts?)` — TIE-BREAKING: most-recent-first, then alphabetical.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  TRADITIONS,
  type CardKey,
  type ReadingHistoryEntry,
  type Tradition,
  type UserId,
  getHistory,
} from './history.ts';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface HistoryStats {
  readonly userId: UserId;
  readonly windowDays: number;
  readonly totalReadings: number;
  readonly totalCardsDrawn: number;
  readonly activeDays: number;
  readonly firstReadingAt: Date | null;
  readonly lastReadingAt: Date | null;
  readonly readingsPerDay: number;
  readonly readingsPerWeek: number;
  readonly empty: boolean;
  readonly computedAt: Date;
}

export interface TopCard {
  readonly key: CardKey;
  readonly name: string;
  readonly tradition: Tradition;
  readonly count: number;
  readonly lastSeenAt: Date;
  readonly rank: number;
}

export interface TopCardsOptions {
  readonly tradition?: Tradition;
  readonly since?: Date;
  readonly until?: Date;
}

export interface TraditionBreakdownEntry {
  readonly tradition: Tradition;
  readonly count: number;
  readonly percent: number;
}

export interface CardStats {
  readonly mean: number;
  readonly median: number;
  readonly p95: number;
  readonly min: number;
  readonly max: number;
  readonly sampleSize: number;
}

// ════════════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════════════

export class StatsError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'StatsError';
    this.code = code;
    Object.freeze(this);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ════════════════════════════════════════════════════════════════════════════

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function utcDayKey(d: Date): string {
  // "YYYY-MM-DD" anchored at UTC midnight (not local TZ — deterministic for stats).
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function differenceInDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / MS_PER_DAY);
}

function startOfWindow(windowDays: number, now: Date): Date {
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    throw new StatsError('INVALID_WINDOW', `windowDays must be > 0, got ${windowDays}`);
  }
  return new Date(now.getTime() - windowDays * MS_PER_DAY);
}

/** Filter helper — applies since/until/tradition on top of getHistory. */
function loadScope(userId: UserId, opts: { since?: Date; until?: Date; tradition?: Tradition }): readonly ReadingHistoryEntry[] {
  // Use one-shot pagination to fetch everything in scope, avoiding the cost
  // of calling getHistory() with paginated offsets in a loop.
  const page = getHistory(userId, { limit: Number.POSITIVE_INFINITY, offset: 0, ...opts });
  return page.entries;
}

// ════════════════════════════════════════════════════════════════════════════
// computeStats
// ════════════════════════════════════════════════════════════════════════════

export function computeStats(userId: UserId, windowDays = 365): HistoryStats {
  const now = new Date();
  const since = startOfWindow(windowDays, now);
  const entries = loadScope(userId, { since });

  if (entries.length === 0) {
    return Object.freeze({
      userId,
      windowDays,
      totalReadings: 0,
      totalCardsDrawn: 0,
      activeDays: 0,
      firstReadingAt: null,
      lastReadingAt: null,
      readingsPerDay: 0,
      readingsPerWeek: 0,
      empty: true,
      computedAt: now,
    });
  }

  let totalCards = 0;
  const days = new Set<string>();
  let first: Date | null = null;
  let last: Date | null = null;

  for (const e of entries) {
    totalCards += e.cards.length;
    days.add(utcDayKey(e.createdAt));
    if (first === null || e.createdAt < first) first = e.createdAt;
    if (last === null || e.createdAt > last) last = e.createdAt;
  }

  const totalReadings = entries.length;
  const activeDays = days.size;
  const readingsPerDay = totalReadings / Math.max(activeDays, 1);
  const readingsPerWeek = totalReadings / Math.max(activeDays / 7, 1);

  return Object.freeze({
    userId,
    windowDays,
    totalReadings,
    totalCardsDrawn: totalCards,
    activeDays,
    firstReadingAt: first,
    lastReadingAt: last,
    readingsPerDay,
    readingsPerWeek,
    empty: false,
    computedAt: now,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// topCards
// ════════════════════════════════════════════════════════════════════════════

export function topCards(userId: UserId, n: number, opts: TopCardsOptions = {}): readonly TopCard[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new StatsError('INVALID_N', `n must be a positive integer, got ${n}`);
  }
  const entries = loadScope(userId, opts);
  if (entries.length === 0) return Object.freeze([]);

  interface Accumulator {
    count: number;
    lastSeen: number;
    name: string;
    tradition: Tradition;
  }
  const acc = new Map<CardKey, Accumulator>();

  for (const entry of entries) {
    const ts = entry.createdAt.getTime();
    for (const card of entry.cards) {
      const cur = acc.get(card.key);
      if (cur === undefined) {
        acc.set(card.key, { count: 1, lastSeen: ts, name: card.name, tradition: card.tradition });
      } else {
        cur.count += 1;
        if (ts > cur.lastSeen) cur.lastSeen = ts;
      }
    }
  }

  // Sort: count desc → most-recent desc → alphabetical asc (deterministic).
  const arr = [...acc.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.lastSeen !== a.lastSeen) return b.lastSeen - a.lastSeen;
      return a.name.localeCompare(b.name);
    });

  return Object.freeze(
    arr.slice(0, n).map((row, i) =>
      Object.freeze({
        key: row.key,
        name: row.name,
        tradition: row.tradition,
        count: row.count,
        lastSeenAt: new Date(row.lastSeen),
        rank: i + 1,
      }),
    ),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// traditionBreakdown
// ════════════════════════════════════════════════════════════════════════════

export function traditionBreakdown(userId: UserId): readonly TraditionBreakdownEntry[] {
  const entries = loadScope(userId, {});
  const buckets = Object.fromEntries(TRADITIONS.map((t) => [t, 0])) as Record<Tradition, number>;
  for (const e of entries) {
    buckets[e.tradition] = (buckets[e.tradition] ?? 0) + 1;
  }
  const total = entries.length;
  const out: TraditionBreakdownEntry[] = TRADITIONS.map((t) => {
    const count = buckets[t] ?? 0;
    const percent = total === 0 ? 0 : (count / total) * 100;
    return Object.freeze({ tradition: t, count, percent });
  });
  return Object.freeze(out);
}

// ════════════════════════════════════════════════════════════════════════════
// averageCardsPerReading
// ════════════════════════════════════════════════════════════════════════════

export function averageCardsPerReading(userId: UserId): CardStats {
  const entries = loadScope(userId, {});
  if (entries.length === 0) {
    return Object.freeze({ mean: 0, median: 0, p95: 0, min: 0, max: 0, sampleSize: 0 });
  }
  const sizes = entries.map((e) => e.cards.length).sort((a, b) => a - b);
  const sum = sizes.reduce((acc, n) => acc + n, 0);
  const mean = sum / sizes.length;
  const median = sizes[Math.floor(sizes.length / 2)] ?? 0;
  // p95: ceiling-bias favors p95 actual value on ties — use ceil for consistency.
  const idx = Math.min(sizes.length - 1, Math.ceil(sizes.length * 0.95) - 1);
  const p95 = sizes[Math.max(0, idx)] ?? 0;
  return Object.freeze({
    mean,
    median,
    p95,
    min: sizes[0] ?? 0,
    max: sizes[sizes.length - 1] ?? 0,
    sampleSize: sizes.length,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// streakDays
// ════════════════════════════════════════════════════════════════════════════

export function streakDays(userId: UserId, now: Date = new Date()): number {
  const entries = loadScope(userId, {});
  if (entries.length === 0) return 0;

  const activeDays = new Set<string>();
  for (const e of entries) activeDays.add(utcDayKey(e.createdAt));

  let streak = 0;
  let cursor = new Date(now.getTime());
  // Walk backwards day-by-day while activeDays has the cursor.
  // Cap at 4000 days (~10y) to avoid runaway loops in corrupted data.
  for (let i = 0; i < 4000; i++) {
    const key = utcDayKey(cursor);
    if (!activeDays.has(key)) break;
    streak += 1;
    cursor = new Date(cursor.getTime() - MS_PER_DAY);
  }
  return streak;
}

// ════════════════════════════════════════════════════════════════════════════
// lastReadingAt
// ════════════════════════════════════════════════════════════════════════════

export function lastReadingAt(userId: UserId): Date | null {
  const entries = loadScope(userId, {});
  if (entries.length === 0) return null;
  let last = entries[0]!.createdAt;
  for (const e of entries) if (e.createdAt > last) last = e.createdAt;
  return last;
}

/** Days since last reading. Negative if future timestamp. */
export function daysSinceLastReading(userId: UserId, now: Date = new Date()): number {
  const last = lastReadingAt(userId);
  if (last === null) return Number.POSITIVE_INFINITY;
  return differenceInDays(now, last);
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT
// ════════════════════════════════════════════════════════════════════════════

export const statsEngineInfo = Object.freeze({
  name: 'reading-history-stats',
  version: '1.0.0',
  dependsOn: 'history',
  readOnly: true,
  defaultWindowDays: 365,
});

export const STATS_AUDIT = Object.freeze({
  exportedFunctions: [
    'computeStats',
    'topCards',
    'traditionBreakdown',
    'averageCardsPerReading',
    'streakDays',
    'lastReadingAt',
    'daysSinceLastReading',
  ] as const,
  immutableOutputs: true,
  inMemoryOnly: true,
});
