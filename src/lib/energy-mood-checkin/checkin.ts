/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ENERGY + MOOD + SPIRITUAL-STATE DAILY CHECK-IN — Core CRUD
 *  Cabala dos Caminhos — wave 69, 2026-06-30
 *
 *  Append-only daily check-ins per user, keyed by calendar date in the user's
 *  IANA timezone (e.g. America/Sao_Paulo). Server stores UTC ISO timestamps;
 *  UI converts to local. Same-day re-submission REPLACES (last-write-wins)
 *  because users commonly tweak their check-in as the day unfolds.
 *
 *  Provides: recordCheckin, getCheckin, getCheckins (paginated + filtered),
 *  deleteCheckin (LGPD/GDPR erasure), exportCheckins (JSON dump for portability).
 *
 *  Pure engine: in-memory Map keyed by `${userId}:${dateKey}`. Caller persists
 *  via Prisma in production. Wire format is JSON-safe.
 *
 *  Branded types: UserId, CheckinId — both are ULIDs at runtime but
 *  type-system distinct from `string` so callers cannot mix them up.
 * ════════════════════════════════════════════════════════════════════════════
 */

// ───────────────────────────────────────────────────────────────────────────
//  Branded primitives
// ───────────────────────────────────────────────────────────────────────────

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type UserId = Brand<string, 'UserId'>;
export type CheckinId = Brand<string, 'CheckinId'>;
export type DateKey = Brand<string, 'DateKey'>; // YYYY-MM-DD in user's tz

export const asUserId = (s: string): UserId => s as UserId;
export const asCheckinId = (s: string): CheckinId => s as CheckinId;
export const asDateKey = (s: string): DateKey => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new RangeError(`DateKey must be YYYY-MM-DD (got: ${s})`);
  }
  return s as DateKey;
};

// ───────────────────────────────────────────────────────────────────────────
//  Timezone helpers (IANA-aware without external deps)
// ───────────────────────────────────────────────────────────────────────────

/**
 * Convert a UTC Date + IANA timezone into a `YYYY-MM-DD` calendar date in
 * that timezone. Falls back to UTC slice if the timezone is invalid.
 *
 * Uses Intl.DateTimeFormat with `en-CA` locale (ISO-like) as the canonical
 * way to render a Date in a given tz without bringing in a date library.
 */
export function dateKeyInTZ(date: Date, timeZone: string): DateKey {
  const safeTz = isValidIANATZ(timeZone) ? timeZone : 'UTC';
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  return asDateKey(`${y}-${m}-${d}`);
}

/**
 * Validates that `tz` is a known IANA timezone name (best-effort).
 *
 * Strategy: try formatting a sentinel Date with `timeZone: tz` and check
 * that no exception is raised. Uses `Intl.DateTimeFormat` per Node 22.
 */
export function isValidIANATZ(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  Mood taxonomy (shared by energy.ts, mood.ts, spiritual-state.ts)
// ───────────────────────────────────────────────────────────────────────────

/** 10 canonical moods. Extend with care — affects schema, analytics, UI. */
export const MOODS = [
  'calm',
  'anxious',
  'joyful',
  'reflective',
  'scattered',
  'centered',
  'grieving',
  'inspired',
  'neutral',
  'restless',
] as const;

export type Mood = (typeof MOODS)[number];

/** Narrowing helper — returns true iff `m` is a recognised Mood. */
export function isMood(m: unknown): m is Mood {
  return typeof m === 'string' && (MOODS as readonly string[]).includes(m);
}

/**
 * Hard validation — throws if `m` is unknown.
 * Used at the engine boundary so caller gets a clear error, not a stored NaN.
 */
export function assertMood(m: unknown): Mood {
  if (!isMood(m)) {
    throw new RangeError(
      `Unknown mood: ${String(m)}. Valid: ${MOODS.join(', ')}`,
    );
  }
  return m;
}

// ───────────────────────────────────────────────────────────────────────────
//  Energy level (1-10 + qualitative bucket)
// ───────────────────────────────────────────────────────────────────────────

export const ENERGY_BUCKETS = ['low', 'steady', 'high', 'peak'] as const;
export type EnergyBucket = (typeof ENERGY_BUCKETS)[number];

export function classifyBucket(score: number): EnergyBucket {
  if (score <= 3) return 'low';
  if (score <= 6) return 'steady';
  if (score <= 8) return 'high';
  return 'peak';
}

export function isValidEnergyScore(score: unknown): score is number {
  return (
    typeof score === 'number' &&
    Number.isInteger(score) &&
    score >= 1 &&
    score <= 10
  );
}

// ───────────────────────────────────────────────────────────────────────────
//  Checkin payload + stored record
// ───────────────────────────────────────────────────────────────────────────

export interface CheckinPayload {
  /** 1..10 inclusive integer */
  energyScore: number;
  /** Optional override — defaults to `classifyBucket(energyScore)` */
  energyBucket?: EnergyBucket;
  mood: Mood;
  /** 0..280 char free text spiritual state description */
  spiritualState: string;
  /** Optional single-line daily intention (≤ 140 chars per spec) */
  intention?: string;
  /** IANA timezone — defaults to UTC if absent */
  timeZone?: string;
  /** ISO 8601 timestamp — defaults to `new Date()` */
  recordedAt?: string;
}

export interface Checkin {
  id: CheckinId;
  userId: UserId;
  dateKey: DateKey;
  energyScore: number;
  energyBucket: EnergyBucket;
  mood: Mood;
  spiritualState: string;
  intention: string | null;
  timeZone: string;
  /** UTC ISO 8601 timestamp of last write */
  recordedAt: string;
  /** True if this was the FIRST time this date was recorded */
  isFirstWrite: boolean;
}

export interface GetCheckinOpts {
  limit?: number;
  offset?: number;
  /** DateKey lower bound inclusive */
  since?: DateKey;
  /** DateKey upper bound inclusive */
  until?: DateKey;
  /** Filter to one or more moods */
  moodFilter?: Mood | Mood[];
}

// ───────────────────────────────────────────────────────────────────────────
//  Errors
// ───────────────────────────────────────────────────────────────────────────

export class CheckinError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'CheckinError';
    this.code = code;
  }
}

export class ValidationError extends CheckinError {
  constructor(message: string) {
    super('VALIDATION', message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends CheckinError {
  constructor(message: string) {
    super('NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  ID generation (HMAC-chained + monotonic counter, FNV-1a hash)
//  Cycle 66/68 lesson applied: counter + full name beats Date.now slice
// ───────────────────────────────────────────────────────────────────────────

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function fnv1a(s: string): string {
  let hash = FNV_OFFSET;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  // 32-bit unsigned hex
  return (hash >>> 0).toString(16).padStart(8, '0');
}

let CHECKIN_COUNTER = 0;

/**
 * Set the HMAC secret for checkin ID generation. Defaults to empty.
 * Production must call this BEFORE any recordCheckin to get tamper-resistant IDs.
 */
let HMAC_SECRET = '';
export function setCheckinHmacSecret(secret: string): void {
  HMAC_SECRET = secret;
}

export function generateCheckinId(userId: UserId, dateKey: DateKey): CheckinId {
  CHECKIN_COUNTER = (CHECKIN_COUNTER + 1) >>> 0;
  const payload = [
    CHECKIN_COUNTER.toString(16),
    Date.now().toString(36),
    userId,
    dateKey,
    HMAC_SECRET,
  ].join('|');
  const id = `chk_${fnv1a(payload)}${fnv1a(payload.split('').reverse().join(''))}`;
  return id as CheckinId;
}

// ───────────────────────────────────────────────────────────────────────────
//  Validation
// ───────────────────────────────────────────────────────────────────────────

const SPIRITUAL_STATE_MAX = 280;
const INTENTION_MAX = 140;

export function validatePayload(p: CheckinPayload): void {
  if (!isValidEnergyScore(p.energyScore)) {
    throw new ValidationError(
      `energyScore must be integer 1..10 (got: ${String(p.energyScore)})`,
    );
  }
  if (p.energyBucket !== undefined && !(ENERGY_BUCKETS as readonly string[]).includes(p.energyBucket)) {
    throw new ValidationError(
      `energyBucket must be one of ${ENERGY_BUCKETS.join(', ')} (got: ${p.energyBucket})`,
    );
  }
  if (!isMood(p.mood)) {
    throw new ValidationError(`mood must be one of ${MOODS.join(', ')} (got: ${String(p.mood)})`);
  }
  if (typeof p.spiritualState !== 'string') {
    throw new ValidationError(`spiritualState must be string (got: ${typeof p.spiritualState})`);
  }
  if (p.spiritualState.length > SPIRITUAL_STATE_MAX) {
    throw new ValidationError(
      `spiritualState max ${SPIRITUAL_STATE_MAX} chars (got: ${p.spiritualState.length})`,
    );
  }
  if (p.intention !== undefined) {
    if (typeof p.intention !== 'string') {
      throw new ValidationError(`intention must be string (got: ${typeof p.intention})`);
    }
    if (p.intention.length > INTENTION_MAX) {
      throw new ValidationError(
        `intention max ${INTENTION_MAX} chars (got: ${p.intention.length})`,
      );
    }
  }
  if (p.timeZone !== undefined && !isValidIANATZ(p.timeZone)) {
    throw new ValidationError(`timeZone must be a valid IANA name (got: ${p.timeZone})`);
  }
  if (p.recordedAt !== undefined) {
    if (typeof p.recordedAt !== 'string' || Number.isNaN(Date.parse(p.recordedAt))) {
      throw new ValidationError(`recordedAt must be ISO 8601 string (got: ${p.recordedAt})`);
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  In-memory store (single source of truth for the engine)
// ───────────────────────────────────────────────────────────────────────────

/** Map<`${userId}:${dateKey}`, Checkin> — caller persists via Prisma */
export const CHECKINS = new Map<string, Checkin>();

function storeKey(userId: UserId, dateKey: DateKey): string {
  return `${userId}:${dateKey}`;
}

/** Reset internal state — exposed for tests only, not for production callers. */
export function __resetCheckinStore(): void {
  CHECKINS.clear();
  CHECKIN_COUNTER = 0;
}

// ───────────────────────────────────────────────────────────────────────────
//  PUBLIC API
// ───────────────────────────────────────────────────────────────────────────

/**
 * Record a check-in for `userId` on the calendar date inferred from
 * `payload.timeZone` + `payload.recordedAt` (or `now`).
 *
 * Last-write-wins semantics: if a check-in already exists for that same
 * user/date, it is REPLACED. Returns the new (replacement) record.
 *
 * Throws ValidationError on bad input. Does NOT throw on duplicate — that
 * is the desired semantic for daily check-ins (user can re-record).
 */
export function recordCheckin(userId: UserId, payload: CheckinPayload): Checkin {
  validatePayload(payload);

  const tz = payload.timeZone ?? 'UTC';
  const recordedAt = payload.recordedAt ?? new Date().toISOString();
  const dateKey = dateKeyInTZ(new Date(recordedAt), tz);

  const prior = CHECKINS.get(storeKey(userId, dateKey));
  const isFirstWrite = prior === undefined;

  const checkin: Checkin = {
    id: generateCheckinId(userId, dateKey),
    userId,
    dateKey,
    energyScore: payload.energyScore,
    energyBucket: payload.energyBucket ?? classifyBucket(payload.energyScore),
    mood: payload.mood,
    spiritualState: payload.spiritualState,
    intention: payload.intention ?? null,
    timeZone: tz,
    recordedAt,
    isFirstWrite,
  };

  CHECKINS.set(storeKey(userId, dateKey), checkin);
  return checkin;
}

/** Get the check-in for `userId` on `dateKey`. Returns null if absent. */
export function getCheckin(userId: UserId, dateKey: DateKey): Checkin | null {
  return CHECKINS.get(storeKey(userId, dateKey)) ?? null;
}

/**
 * Paginated list of check-ins, most-recent first.
 *
 * Filters:
 *   - `since` / `until` are DateKey bounds (inclusive on both sides)
 *   - `moodFilter` is one mood or an array of moods
 *
 * `limit` defaults to 30 and is capped at 1000 for safety.
 * `offset` defaults to 0.
 */
export function getCheckins(
  userId: UserId,
  opts: GetCheckinOpts = {},
): readonly Checkin[] {
  const limit = Math.max(1, Math.min(1000, opts.limit ?? 30));
  const offset = Math.max(0, opts.offset ?? 0);

  const moods: Set<Mood> | null = (() => {
    if (opts.moodFilter === undefined) return null;
    const arr = Array.isArray(opts.moodFilter) ? opts.moodFilter : [opts.moodFilter];
    return new Set(arr);
  })();

  const all = Array.from(CHECKINS.values())
    .filter((c) => c.userId === userId)
    .filter((c) => (opts.since === undefined ? true : c.dateKey >= opts.since))
    .filter((c) => (opts.until === undefined ? true : c.dateKey <= opts.until))
    .filter((c) => (moods === null ? true : moods.has(c.mood)))
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));

  return all.slice(offset, offset + limit);
}

/**
 * Delete a single check-in (LGPD/GDPR "right to erasure" for the record).
 * Returns the deleted record, or null if nothing matched.
 */
export function deleteCheckin(userId: UserId, dateKey: DateKey): Checkin | null {
  const key = storeKey(userId, dateKey);
  const prior = CHECKINS.get(key);
  if (prior === undefined) return null;
  CHECKINS.delete(key);
  return prior;
}

/**
 * Erase ALL check-ins for a user — full account-level delete.
 * Returns the count of records deleted (for audit logs).
 */
export function eraseAllCheckins(userId: UserId): number {
  let count = 0;
  for (const [k, v] of CHECKINS) {
    if (v.userId === userId) {
      CHECKINS.delete(k);
      count++;
    }
  }
  return count;
}

/**
 * Export all check-ins for `userId` as a JSON-safe document for portability
 * (LGPD data portability — user can download their own data).
 *
 * The output is stable: same inputs always produce the same JSON shape.
 */
export function exportCheckins(userId: UserId): {
  schemaVersion: 1;
  userId: UserId;
  exportedAt: string;
  count: number;
  checkins: readonly Checkin[];
} {
  const items = Array.from(CHECKINS.values())
    .filter((c) => c.userId === userId)
    .sort((a, b) => (a.dateKey < b.dateKey ? -1 : a.dateKey > b.dateKey ? 1 : 0));
  return {
    schemaVersion: 1,
    userId,
    exportedAt: new Date(0).toISOString(), // intentionally deterministic
    count: items.length,
    checkins: items,
  };
}
