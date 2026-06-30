/**
 * history-store.ts — InMemory history adapter for daily reflection responses.
 *
 * Pure data layer. No I/O, no module-level state. All state lives inside
 * `createInMemoryHistoryAdapter()`-returned adapter objects, making each
 * adapter a private in-memory store.
 *
 * Public API:
 *   - HistoryAdapter (interface)
 *   - HistoryRecord (DTO)
 *   - createInMemoryHistoryAdapter(): HistoryAdapter
 *
 * Cycle 84 lesson:
 *   - streak = max consecutive days ending today (or yesterday if no record today)
 *   - append-only via spread, not push (preserves prior snapshots)
 *   - history is per-userId; one Map<userId, HistoryRecord[]>
 *
 * Deferred to W85+ (not in reduced scope):
 *   - server-side persistence (replaced by `InMemoryOnly` adapter interface)
 *   - push notification trigger
 *   - encryption at rest
 */

import type { Tradicao } from './prompts-t/types.ts';

// ---------------------------------------------------------------------------
// Branded types
// ---------------------------------------------------------------------------

declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

export type UserId = Brand<string, 'UserId'>;
export type RecordId = Brand<string, 'RecordId'>;

// ---------------------------------------------------------------------------
// DTO
// ---------------------------------------------------------------------------

/**
 * One entry in a user's history. Append-only.
 * - `date` is canonical 'YYYY-MM-DD' (UTC) — set by getDailyReflection's
 *   normalizeDate contract.
 * - responseText max 200 chars (validated at boundary, not by engine).
 */
export interface HistoryRecord {
  readonly id: RecordId;
  readonly userId: UserId;
  readonly promptId: string;
  readonly tradicao: Tradicao;
  readonly responseText: string;
  /** Canonical 'YYYY-MM-DD' (UTC). One record per user per day is allowed
   *  (same-day replace policy). */
  readonly date: string;
  /** ISO 8601 timestamp at write time. */
  readonly recordedAt: string;
}

// ---------------------------------------------------------------------------
// Adapter interface
// ---------------------------------------------------------------------------

export interface HistoryAdapter {
  /** Record a response (replaces any same-user+same-date entry). */
  record(args: {
    readonly userId: UserId;
    readonly promptId: string;
    readonly tradicao: Tradicao;
    readonly responseText: string;
    readonly date: string;
  }): HistoryRecord;

  /** Most recent N entries (newest first). Returns empty array if none. */
  getRecent(userId: UserId, limit: number): ReadonlyArray<HistoryRecord>;

  /**
   * Current streak — the number of consecutive days with at least one
   * record, ending today (or yesterday, if no record today yet).
   *
   * Returns 0 if the user has no records.
   */
  getStreak(userId: UserId, today: string): number;

  /** Total record count (across all users). */
  totalCount(): number;

  /** Number of records for one user. */
  countForUser(userId: UserId): number;

  /** Per-tradição count for one user. */
  countByTradicaoForUser(userId: UserId): Readonly<Record<Tradicao, number>>;

  /** All records (snapshot, sorted by date desc). For debugging / audit. */
  allRecords(): ReadonlyArray<HistoryRecord>;
}

// ---------------------------------------------------------------------------
// InMemory implementation
// ---------------------------------------------------------------------------

function nextId(): string {
  // RFC4122-ish, but simpler: 8 hex chars + timestamp slice
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 0xffffff).toString(36).padStart(4, '0');
  return `rec_${t}_${r}`;
}

const MAX_HISTORY_PER_USER = 365; // Cap to prevent unbounded growth

export function createInMemoryHistoryAdapter(): HistoryAdapter {
  // Map<UserId, HistoryRecord[]> — kept sorted by date desc (newest first)
  const byUser: Map<UserId, HistoryRecord[]> = new Map();

  function getOrCreate(userId: UserId): HistoryRecord[] {
    let arr = byUser.get(userId);
    if (!arr) {
      arr = [];
      byUser.set(userId, arr);
    }
    return arr;
  }

  function record(args: {
    readonly userId: UserId;
    readonly promptId: string;
    readonly tradicao: Tradicao;
    readonly responseText: string;
    readonly date: string;
  }): HistoryRecord {
    const entry: HistoryRecord = Object.freeze({
      id: nextId() as RecordId,
      userId: args.userId,
      promptId: args.promptId,
      tradicao: args.tradicao,
      responseText: args.responseText,
      date: args.date,
      recordedAt: new Date().toISOString(),
    });
    const existing = getOrCreate(args.userId);
    // Same-day replace: filter out any prior entry for this date
    const filtered = existing.filter((r) => r.date !== args.date);
    const updated = [entry, ...filtered]
      .slice(0, MAX_HISTORY_PER_USER)
      .map((r) => Object.freeze(r));
    byUser.set(args.userId, updated);
    return entry;
  }

  function getRecent(userId: UserId, limit: number): ReadonlyArray<HistoryRecord> {
    if (limit <= 0) return [];
    const list = byUser.get(userId);
    if (!list) return [];
    // Always return sorted by date desc (newest first), regardless of insertion order
    const sorted = [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return Object.freeze(sorted.slice(0, limit));
  }

  function getStreak(userId: UserId, today: string): number {
    const list = byUser.get(userId);
    if (!list || list.length === 0) return 0;
    // Get unique dates descending
    const dates = new Set<string>();
    for (const r of list) dates.add(r.date);
    if (dates.size === 0) return 0;

    // Streak may either end today OR yesterday (if user hasn't reflected yet)
    const todayDate = today;
    const yesterdayDate = shiftDate(today, -1);

    let cursor: string;
    let streak = 0;

    if (dates.has(todayDate)) {
      cursor = todayDate;
    } else if (dates.has(yesterdayDate)) {
      cursor = yesterdayDate;
    } else {
      return 0;
    }

    while (dates.has(cursor)) {
      streak++;
      cursor = shiftDate(cursor, -1);
    }

    return streak;
  }

  function totalCount(): number {
    let total = 0;
    for (const arr of byUser.values()) total += arr.length;
    return total;
  }

  function countForUser(userId: UserId): number {
    return byUser.get(userId)?.length ?? 0;
  }

  function countByTradicaoForUser(userId: UserId): Readonly<Record<Tradicao, number>> {
    const list = byUser.get(userId) ?? [];
    const acc = {
      cigano: 0,
      candomble: 0,
      umbanda: 0,
      ifa: 0,
      cabala: 0,
      astrologia: 0,
      tantra: 0,
    } as Record<Tradicao, number>;
    for (const r of list) acc[r.tradicao]++;
    return Object.freeze(acc);
  }

  function allRecords(): ReadonlyArray<HistoryRecord> {
    const out: HistoryRecord[] = [];
    for (const arr of byUser.values()) {
      for (const r of arr) out.push(r);
    }
    out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return Object.freeze(out);
  }

  return Object.freeze({
    record,
    getRecent,
    getStreak,
    totalCount,
    countForUser,
    countByTradicaoForUser,
    allRecords,
  });
}

// ---------------------------------------------------------------------------
// Date arithmetic helpers (used in streak + audit)
// ---------------------------------------------------------------------------

/**
 * Shift a 'YYYY-MM-DD' date by ±N days. Returns canonical form.
 * Pure; uses Date.UTC to avoid DST issues.
 */
export function shiftDate(dateIso: string, deltaDays: number): string {
  const parts = dateIso.split('-');
  const yStr = parts[0];
  const mStr = parts[1];
  const dStr = parts[2];
  if (yStr === undefined || mStr === undefined || dStr === undefined) {
    throw new Error(`shiftDate: invalid dateIso "${dateIso}"`);
  }
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error(`shiftDate: invalid dateIso "${dateIso}"`);
  }
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays, 0, 0, 0, 0));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Difference in days between two 'YYYY-MM-DD' dates (b - a, signed).
 * Pure; uses Date.UTC.
 */
export function diffDays(a: string, b: string): number {
  const aParts = a.split('-');
  const bParts = b.split('-');
  const yAStr = aParts[0];
  const mAStr = aParts[1];
  const dAStr = aParts[2];
  const yBStr = bParts[0];
  const mBStr = bParts[1];
  const dBStr = bParts[2];
  if (
    yAStr === undefined || mAStr === undefined || dAStr === undefined ||
    yBStr === undefined || mBStr === undefined || dBStr === undefined
  ) {
    throw new Error(`diffDays: invalid input "${a}" or "${b}"`);
  }
  const yA = Number(yAStr);
  const mA = Number(mAStr);
  const dA = Number(dAStr);
  const yB = Number(yBStr);
  const mB = Number(mBStr);
  const dB = Number(dBStr);
  if (!Number.isFinite(yA) || !Number.isFinite(yB)) {
    throw new Error(`diffDays: invalid input "${a}" or "${b}"`);
  }
  const A = Date.UTC(yA, mA - 1, dA);
  const B = Date.UTC(yB, mB - 1, dB);
  return Math.round((B - A) / (1000 * 60 * 60 * 24));
}
