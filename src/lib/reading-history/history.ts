/**
 * ════════════════════════════════════════════════════════════════════════════
 * READING HISTORY — Cabala dos Caminhos (Akasha Wave 69)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Append-only log of every divination reading a user receives. Engine is the
 * ingestion + retrieval primitive that stats/insights/trends all depend on.
 *
 * DESIGN GOALS
 *  - In-memory only — no Prisma, no DB call. Persistence is the caller's job
 *    (Postgres adapter is straightforward: serialize via `exportHistory`,
 *    insert batch, restore via `recordReading` on next read).
 *  - Immutable log semantics — once recorded, an entry is frozen via
 *    `Object.freeze`. Pagination returns a frozen view.
 *  - Branded types — `UserId`, `ReadingId`, `ReadingHistoryEntry` to prevent
 *    silent ID confusion (cycle 65 lesson: `string`-typed IDs leak everywhere).
 *  - Pure functions where possible — every getter takes a snapshot at call
 *    time. The internal `Map<userId, ...>` mutation is the only side effect.
 *
 * CONVENTIONS (cycle 60–68)
 *  - Zero `any`, zero `as unknown as X` casts.
 *  - Lookaround regex for tag-boundary detection (`(?:^|\W)…(?:$|\W)`).
 *  - No `import { Buffer } from "buffer"` (use `globalThis`).
 *  - Public surface is `export function`/`export const` only — no default
 *    exports, no `class`. Frozen via `Object.freeze` on hot objects.
 * ════════════════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;
type Brand<TName extends string> = { readonly [__brand]: TName };

export type UserId = string & Brand<'UserId'>;
export type ReadingId = string & Brand<'ReadingId'>;
export type CardKey = string & Brand<'CardKey'>;

/** Cast a plain string into a branded type. Use only at TRUSTED boundaries. */
export const toUserId = (s: string): UserId => s as UserId;
export const toReadingId = (s: string): ReadingId => s as ReadingId;
export const toCardKey = (s: string): CardKey => s as CardKey;

// ════════════════════════════════════════════════════════════════════════════
// TRADITION TAXONOMY
// ════════════════════════════════════════════════════════════════════════════

/** All traditions the reading-history engine understands. Frozen at boot. */
export const TRADITIONS_VALUES = [
  'cigano',
  'tarot',
  'lenormand',
  'astrologia',
  'numerologia',
  'cabala',
  'orixas',
  'tantra',
] as const;

export type Tradition = (typeof TRADITIONS_VALUES)[number];

export const TRADITIONS: readonly Tradition[] = Object.freeze([
  ...TRADITIONS_VALUES,
]);

export function isTradition(value: unknown): value is Tradition {
  return typeof value === 'string' && (TRADITIONS as readonly string[]).includes(value);
}

/** Defensive setter — accepts `unknown` and validates. */
export function coerceTradition(value: unknown): Tradition | undefined {
  return isTradition(value) ? value : undefined;
}

// ════════════════════════════════════════════════════════════════════════════
// CARD + READING TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface Card {
  /** Stable identifier — tradition-prefixed to avoid cross-tradition collisions. */
  readonly key: CardKey;
  /** Human-readable name. */
  readonly name: string;
  /** Owning tradition. */
  readonly tradition: Tradition;
  /** True iff this is a Major Arcana card (Tarot). False for everything else. */
  readonly isMajorArcana?: boolean;
  /** Optional polarity for mood derivation: -1 (low), 0 (neutral), +1 (high). */
  readonly mood?: -1 | 0 | 1;
}

export interface Reading {
  readonly id: ReadingId;
  readonly userId: UserId;
  readonly tradition: Tradition;
  readonly cards: readonly Card[];
  readonly summary?: string;
  readonly interpretation?: string;
  readonly createdAt: Date;
  /** Optional external correlation (e.g. W64/W65 engine ID). */
  readonly sourceReadingId?: string;
}

// Internal entry: same shape as Reading but with frozen-when-appended semantics.
export interface ReadingHistoryEntry extends Reading {
  readonly recordedAt: Date;
}

// ════════════════════════════════════════════════════════════════════════════
// QUERY TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface GetHistoryOptions {
  /** Page size. Default 20. */
  readonly limit?: number;
  /** Skip this many most-recent entries. Default 0. */
  readonly offset?: number;
  /** Lower bound (inclusive). Default: no lower bound. */
  readonly since?: Date;
  /** Upper bound (inclusive). Default: no upper bound. */
  readonly until?: Date;
  /** Filter by a single tradition. */
  readonly tradition?: Tradition;
  /** Sort order. Default 'desc' (newest first). */
  readonly order?: 'asc' | 'desc';
}

export interface PaginatedHistory {
  readonly entries: readonly ReadingHistoryEntry[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
}

export interface HistoryExport {
  readonly userId: UserId;
  readonly exportedAt: Date;
  readonly count: number;
  readonly entries: readonly ReadingHistoryEntry[];
}

// ════════════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════════════

export class ReadingHistoryError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;

  constructor(code: string, message: string, context: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = 'ReadingHistoryError';
    this.code = code;
    this.context = context;
    Object.freeze(this);
  }
}

export class EmptyHistoryError extends ReadingHistoryError {
  constructor(userId: UserId) {
    super('EMPTY_HISTORY', `No history for user ${userId}`, { userId });
    this.name = 'EmptyHistoryError';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INTERNAL STATE — injected at boot for tests
// ════════════════════════════════════════════════════════════════════════════

let HISTORY: Map<UserId, ReadingHistoryEntry[]> = new Map();

/**
 * Replace the internal store. INTENDED FOR TESTS ONLY — production code
 * should never call this. Returns the previous store so tests can restore.
 */
export function _setHistoryForTesting(next: Map<UserId, ReadingHistoryEntry[]>): Map<UserId, ReadingHistoryEntry[]> {
  const prev = HISTORY;
  HISTORY = next;
  return prev;
}

/** Clear all history. Test-only utility. */
export function _clearAllHistoryForTesting(): void {
  HISTORY = new Map();
}

/** Internal — capture the live store. Test-only. */
export function _snapshotHistory(): Map<UserId, readonly ReadingHistoryEntry[]> {
  return new Map(HISTORY);
}

// ════════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ════════════════════════════════════════════════════════════════════════════

function nowDate(): Date {
  return new Date();
}

function freezeEntry(e: ReadingHistoryEntry): ReadingHistoryEntry {
  return Object.freeze(e);
}

function validateReading(r: Reading): void {
  if (!r.userId || typeof r.userId !== 'string') {
    throw new ReadingHistoryError('INVALID_USER', 'Reading.userId must be a non-empty string', { readingId: r.id });
  }
  if (!isTradition(r.tradition)) {
    throw new ReadingHistoryError('INVALID_TRADITION', `Unknown tradition: ${String(r.tradition)}`, {
      readingId: r.id,
      tradition: String(r.tradition),
    });
  }
  if (!Array.isArray(r.cards) || r.cards.length === 0) {
    throw new ReadingHistoryError('EMPTY_CARDS', 'Reading.cards must contain at least one card', {
      readingId: r.id,
    });
  }
  for (const card of r.cards) {
    if (!card.key || !card.name) {
      throw new ReadingHistoryError('INVALID_CARD', 'Each card must have key and name', {
        readingId: r.id,
        card,
      });
    }
    if (!isTradition(card.tradition)) {
      throw new ReadingHistoryError('CARD_TRADITION_MISMATCH', `Card tradition invalid: ${String(card.tradition)}`, {
        readingId: r.id,
        card,
      });
    }
  }
  if (!(r.createdAt instanceof Date) || Number.isNaN(r.createdAt.getTime())) {
    throw new ReadingHistoryError('INVALID_DATE', 'Reading.createdAt must be a valid Date', { readingId: r.id });
  }
}

function getBucket(userId: UserId): ReadingHistoryEntry[] {
  const existing = HISTORY.get(userId);
  if (existing) return existing;
  const fresh: ReadingHistoryEntry[] = [];
  HISTORY.set(userId, fresh);
  return fresh;
}

function matchesFilters(
  e: ReadingHistoryEntry,
  opts: GetHistoryOptions,
): boolean {
  if (opts.since && e.createdAt < opts.since) return false;
  if (opts.until && e.createdAt > opts.until) return false;
  if (opts.tradition && e.tradition !== opts.tradition) return false;
  return true;
}

function paginate(list: readonly ReadingHistoryEntry[], opts: GetHistoryOptions): PaginatedHistory {
  const filtered = list.filter((e) => matchesFilters(e, opts));
  const order = opts.order ?? 'desc';
  const sorted = [...filtered].sort((a, b) => {
    const cmp = a.createdAt.getTime() - b.createdAt.getTime();
    return order === 'desc' ? -cmp : cmp;
  });
  const limit = Math.max(0, Math.floor(opts.limit ?? 20));
  const offset = Math.max(0, Math.floor(opts.offset ?? 0));
  const slice = sorted.slice(offset, offset + limit);
  return Object.freeze({
    entries: Object.freeze(slice) as readonly ReadingHistoryEntry[],
    total: sorted.length,
    limit,
    offset,
    hasMore: offset + limit < sorted.length,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — INGESTION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Append a reading to the user's history. Returns the frozen history entry.
 *
 * @throws ReadingHistoryError on validation failure. The log is NOT mutated.
 */
export function recordReading(userId: UserId, reading: Reading): ReadingHistoryEntry {
  validateReading(reading);

  const entry: ReadingHistoryEntry = freezeEntry({
    ...reading,
    recordedAt: nowDate(),
  });

  const bucket = getBucket(userId);
  bucket.push(entry);
  return entry;
}

/**
 * Batch ingest. Atomic — if ANY entry fails validation, the whole batch is
 * rejected and no entries are added (cycle 65 lesson: prefer strict >
 * permissive, caller can split bad data out and retry).
 */
export function recordReadings(userId: UserId, readings: readonly Reading[]): readonly ReadingHistoryEntry[] {
  if (!Array.isArray(readings) || readings.length === 0) {
    throw new ReadingHistoryError('EMPTY_BATCH', 'recordReadings requires at least one reading', { userId });
  }
  for (const r of readings) validateReading(r);
  const stamped: ReadingHistoryEntry[] = [];
  for (const r of readings) {
    stamped.push(freezeEntry({ ...r, recordedAt: nowDate() }));
  }
  const bucket = getBucket(userId);
  for (const e of stamped) bucket.push(e);
  return Object.freeze(stamped);
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — RETRIEVAL
// ════════════════════════════════════════════════════════════════════════════

/** Paginated, filtered retrieval. Snapshot at call time. */
export function getHistory(userId: UserId, opts: GetHistoryOptions = {}): PaginatedHistory {
  const bucket = HISTORY.get(userId) ?? [];
  return paginate(bucket, opts);
}

/** Count entries for a user (optionally filtered). Cheap O(n) scan. */
export function countHistory(userId: UserId, opts: GetHistoryOptions = {}): number {
  const bucket = HISTORY.get(userId) ?? [];
  if (!opts.since && !opts.until && !opts.tradition) return bucket.length;
  return bucket.filter((e) => matchesFilters(e, opts)).length;
}

/** All entries that contain a given card. Ordered by createdAt desc. */
export function getHistoryByCard(userId: UserId, cardKey: CardKey): readonly ReadingHistoryEntry[] {
  const bucket = HISTORY.get(userId) ?? [];
  return Object.freeze(
    [...bucket]
      .filter((e) => e.cards.some((c) => c.key === cardKey))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  );
}

/** History scoped to a single tradition. */
export function getHistoryByTradition(userId: UserId, tradition: Tradition): readonly ReadingHistoryEntry[] {
  const bucket = HISTORY.get(userId) ?? [];
  return Object.freeze(
    [...bucket].filter((e) => e.tradition === tradition).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — GDPR / EXPORT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Right-to-erasure. Wipes all history for `userId`. Returns count removed.
 *
 * Idempotent — returns 0 if no history exists.
 */
export function clearHistory(userId: UserId): number {
  const existing = HISTORY.get(userId);
  if (!existing) return 0;
  const n = existing.length;
  HISTORY.delete(userId);
  return n;
}

/** JSON-serializable export (Date → ISO string). Suitable for download. */
export function exportHistory(userId: UserId): HistoryExport {
  const bucket = HISTORY.get(userId) ?? [];
  const sorted = [...bucket].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return Object.freeze({
    userId,
    exportedAt: nowDate(),
    count: sorted.length,
    entries: Object.freeze(sorted.map((e) => freezeEntry({
      ...e,
      createdAt: new Date(e.createdAt),
      recordedAt: new Date(e.recordedAt),
    }))) as readonly ReadingHistoryEntry[],
  });
}

/**
 * Minimum-JSON canonical serialisation of an export. Useful for HMAC-style
 * integrity checks (cycle 67 lesson 5). Date → ISO; deterministic key order.
 */
export function canonicalExportJSON(userId: UserId): string {
  const exp = exportHistory(userId);
  const out = {
    userId,
    exportedAt: exp.exportedAt.toISOString(),
    count: exp.count,
    entries: exp.entries.map((e) => ({
      id: e.id,
      userId: e.userId,
      tradition: e.tradition,
      cards: e.cards.map((c) => ({ key: c.key, name: c.name, tradition: c.tradition })),
      summary: e.summary ?? null,
      interpretation: e.interpretation ?? null,
      createdAt: e.createdAt.toISOString(),
      recordedAt: e.recordedAt.toISOString(),
      sourceReadingId: e.sourceReadingId ?? null,
    })),
  };
  return JSON.stringify(out);
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — AUDIT
// ════════════════════════════════════════════════════════════════════════════

/** Returns a frozen snapshot of every user ID with history. Useful for ops. */
export function listUsersWithHistory(): readonly UserId[] {
  return Object.freeze([...HISTORY.keys()]);
}

/** Total count of history entries across all users. */
export function globalHistorySize(): number {
  let total = 0;
  for (const list of HISTORY.values()) total += list.length;
  return total;
}

/**
 * Audit hook — lets the caller verify engine state without inspecting the
 * internal Map. Exposes card coverage across all known entries.
 */
export function auditTraditionCoverage(): Readonly<Record<Tradition, number>> {
  const counts = Object.fromEntries(TRADITIONS.map((t) => [t, 0])) as Record<Tradition, number>;
  for (const list of HISTORY.values()) {
    for (const e of list) {
      counts[e.tradition] = (counts[e.tradition] ?? 0) + 1;
    }
  }
  return Object.freeze(counts);
}

// ════════════════════════════════════════════════════════════════════════════
// INTROSPECTION
// ════════════════════════════════════════════════════════════════════════════

export const historyEngineInfo = Object.freeze({
  name: 'reading-history',
  version: '1.0.0',
  traditions: TRADITIONS,
  inMemoryOnly: true,
  immutableEntries: true,
});
