/**
 * ════════════════════════════════════════════════════════════════════════════
 * W77-D — READING HISTORY DASHBOARD ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 77 · 2026-06-30 · Author: W77-D Coder (Mavis orchestrator session 414706631295040)
 *
 * Mesa Real is the primary product surface. Every consultation leaves a trace —
 * this engine stores those traces and surfaces PATTERNS over time.
 *
 * What "history" means here:
 *   • Every Mesa Real cross-house reading (consumed from W75 output)
 *   • Every consultation metadata: when, which houses, which topic, the
 *     user's reflection (1-3 sentences), the traditions used
 *   • Aggregations: streaks (7 dias = ciclo completo de Orixá), most-consulted
 *     house, tradition distribution, time-of-day analysis (Yin/Yang), and
 *     cross-tradition patterns (when the user reads the same topic through
 *     3+ traditions, surface a "abordagem multidimensional" insight).
 *
 * Public API (cycle 77 contract):
 *   recordReading(input)         → ReadingId (branded)
 *   getUserHistory(userId, opts) → readonly ReadingRecord[]  (pagination + filters)
 *   getPatternInsights(userId)   → readonly Insight[]        (streaks, hotspots, time-of-day)
 *   getTraditionDistribution(userId) → readonly TraditionStat[]
 *   exportAudit()                → readonly ReadingRecord[]  (frozen log)
 *   hashCacheKey(input)          → SHA-256 canonical-JSON cache key (cycle 67)
 *   verifyReadingIntegrity(r)    → boolean (cycle 67 HMAC pattern)
 *
 * Durable lessons applied (cycle 60-76):
 *   - Worktree-isolated tsconfig + node-stubs.d.ts as a script file (cycle 60, 73)
 *   - `.ts` extension imports + allowImportingTsExtensions (cycle 62)
 *   - lib: ["ES2022", "DOM"] in worktree tsconfig (cycle 73)
 *   - Branded types in Map<UserId, ...> (cycle 73)
 *   - Result narrowing positive if (r.ok) (cycle 73)
 *   - Sacred token regex with [^\p{L}\p{N}_] Unicode lookaround (cycle 68/69)
 *   - Object.freeze on insert (cycle 68)
 *   - HMAC canonical JSON for cache key + integrity (cycle 67)
 *   - Self-running test harness (cycle 68+)
 *   - ReadonlyArray<T> + Object.freeze on every export (cycle 75 #6)
 *   - Per-domain metadata registry as frozen objects (cycle 76)
 *   - 7-tradição coverage mandated by cycle 77 (≥1 insight per tradition)
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

export type UserId = string & { readonly __brand: 'UserId' };
export type ReadingId = string & { readonly __brand: 'ReadingId' };
export type InsightId = string & { readonly __brand: 'InsightId' };

export function userId(s: string): UserId {
  if (!/^u_[a-z0-9_]{2,40}$/.test(s)) {
    throw new Error(`Invalid UserId: ${s} (expected /^u_[a-z0-9_]{2,40}$/)`);
  }
  return s as UserId;
}

export function readingId(s: string): ReadingId {
  if (!/^r_[0-9]{8,20}$/.test(s)) {
    throw new Error(`Invalid ReadingId: ${s} (expected /^r_[0-9]{8,20}$/)`);
  }
  return s as ReadingId;
}

export function insightId(s: string): InsightId {
  if (!/^i_[a-z0-9_]{4,40}$/.test(s)) {
    throw new Error(`Invalid InsightId: ${s} (expected /^i_[a-z0-9_]{4,40}$/)`);
  }
  return s as InsightId;
}

// ════════════════════════════════════════════════════════════════════════════
// DOMAIN TYPES — Mesa Real reading record
// ════════════════════════════════════════════════════════════════════════════

/** The 7 sacred traditions the cycle 77 contract mandates coverage on. */
export const SACRED_TRADITIONS = Object.freeze([
  'Candomblé',
  'Umbanda',
  'Ifá',
  'Cabala',
  'Astrologia',
  'Tantra',
  'Cigano',
] as const);

export type SacredTradition = typeof SACRED_TRADITIONS[number];

export const MESA_REAL_HOUSES = Object.freeze([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
] as const);

export type MesaRealHouseNumber = typeof MESA_REAL_HOUSES[number];

/** Sacred themes the user consults about. Cycle 77 ships 12 (slice A of 36). */
export type ConsultationTopic =
  | 'sexualidade'
  | 'trabalho'
  | 'familia'
  | 'espiritualidade'
  | 'saude'
  | 'financas'
  | 'relacionamentos'
  | 'comunicacao'
  | 'criatividade'
  | 'viagens'
  | 'amizades'
  | 'autoconhecimento';

/** Time-of-day buckets — Yin (night/early-morning) vs Yang (day/evening). */
export type TimeOfDay = 'madrugada' | 'manha' | 'tarde' | 'noite';

export interface ReadingRecordInput {
  userId: UserId;
  /** ISO-8601 UTC timestamp (canonical form: YYYY-MM-DDTHH:mm:ss.sssZ). */
  timestamp: string;
  mesaRealHouseNumber: MesaRealHouseNumber;
  topic: ConsultationTopic;
  traditionsUsed: readonly SacredTradition[];
  /** Optional 1-3 sentence reflection written by the user. */
  userReflection?: string;
  /** Optional external cache key (e.g., from W75 cross-house output). */
  upstreamCacheKey?: string;
}

export interface ReadingRecord {
  readonly id: ReadingId;
  readonly userId: UserId;
  readonly timestamp: string;
  readonly mesaRealHouseNumber: MesaRealHouseNumber;
  readonly topic: ConsultationTopic;
  readonly traditionsUsed: ReadonlyArray<SacredTradition>;
  readonly userReflection: string;
  readonly upstreamCacheKey: string;
  readonly integrityHash: string;
  readonly meta: {
    readonly brand: 'W77-D';
    readonly generatedAt: string;
  };
}

export interface HistoryQuery {
  /** 1-based cursor; default 1. */
  page?: number;
  /** Items per page; default 20, max 100. */
  pageSize?: number;
  /** Filter by topic. */
  topic?: ConsultationTopic;
  /** Filter by tradition (must be present in traditionsUsed). */
  tradition?: SacredTradition;
  /** Filter readings on or after this ISO date (inclusive). */
  fromDate?: string;
  /** Filter readings on or before this ISO date (inclusive). */
  toDate?: string;
}

export interface PaginatedHistory {
  readonly records: readonly ReadingRecord[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
}

export type InsightKind =
  | 'streak-current'
  | 'streak-record'
  | 'streak-celebration'
  | 'most-consulted-house'
  | 'most-consulted-topic'
  | 'multidimensional-approach'
  | 'time-of-day-pattern'
  | 'tradition-balance'
  | 'sacred-tradition-affinity'
  | 'reflection-richness';

export interface Insight {
  readonly id: InsightId;
  readonly userId: UserId;
  readonly kind: InsightKind;
  readonly title: string;
  readonly description: string;
  /** Confidence in [0, 1]. Low for sparse data, high for well-established patterns. */
  readonly confidence: number;
  readonly traditions: readonly SacredTradition[];
  readonly generatedAt: string;
}

export interface TraditionStat {
  readonly tradition: SacredTradition;
  readonly count: number;
  /** Percentage of total readings, rounded to 1 decimal. */
  readonly pct: number;
}

// ════════════════════════════════════════════════════════════════════════════
// SIDE-EFFECT-FREE PRIMITIVES — SHA, canonical JSON, sacred regex
// ════════════════════════════════════════════════════════════════════════════

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map((v) => canonicalJson(v)).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys
      .map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k]))
      .join(',') +
    '}'
  );
}

export function sha256HexSync(s: string): string {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      const c2 = s.charCodeAt(i);
      c = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      bytes.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    }
  }

  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);

  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  bytes.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
  bytes.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);
  const W = new Uint32Array(64);

  const rotr = (x: number, n: number): number =>
    ((x >>> n) | (x << (32 - n))) >>> 0;

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      const o = chunk + i * 4;
      W[i] = (((bytes[o] ?? 0) << 24) |
        ((bytes[o + 1] ?? 0) << 16) |
        ((bytes[o + 2] ?? 0) << 8) |
        (bytes[o + 3] ?? 0)) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }

    let a = H[0]!, b = H[1]!, c = H[2]!, d = H[3]!;
    let e = H[4]!, f = H[5]!, g = H[6]!, h = H[7]!;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + (K[i] ?? 0) + (W[i] ?? 0)) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    H[0] = (H[0]! + a) >>> 0;
    H[1] = (H[1]! + b) >>> 0;
    H[2] = (H[2]! + c) >>> 0;
    H[3] = (H[3]! + d) >>> 0;
    H[4] = (H[4]! + e) >>> 0;
    H[5] = (H[5]! + f) >>> 0;
    H[6] = (H[6]! + g) >>> 0;
    H[7] = (H[7]! + h) >>> 0;
  }

  let out = '';
  for (let i = 0; i < 8; i++) {
    out += (H[i] ?? 0).toString(16).padStart(8, '0');
  }
  return out;
}

export function sacredMatch(haystack: string, needle: string): boolean {
  if (!needle) return false;
  // Cycle 68/69 lesson: ASCII \b treats non-ASCII letters (ã, ç, â) as
  // non-word chars. Use Unicode word chars via [^\p{L}\p{N}_] with `u`.
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(^|[^\\p{L}\\p{N}_])${escaped}(?=$|[^\\p{L}\\p{N}_])`,
    'iu',
  );
  return re.test(haystack);
}

export function hashCacheKey(input: ReadingRecordInput): string {
  return sha256HexSync(canonicalJson(input));
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ════════════════════════════════════════════════════════════════════════════

const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const TOPICS: ReadonlyArray<ConsultationTopic> = Object.freeze([
  'sexualidade', 'trabalho', 'familia', 'espiritualidade',
  'saude', 'financas', 'relacionamentos', 'comunicacao',
  'criatividade', 'viagens', 'amizades', 'autoconhecimento',
]);

function validateReadingInput(input: ReadingRecordInput): void {
  if (!input || typeof input !== 'object') {
    throw new Error('recordReading: input must be an object');
  }
  // userId: already branded (factory enforces regex), but double-check stringness.
  if (typeof input.userId !== 'string') {
    throw new Error('recordReading: userId must be a branded UserId string');
  }
  if (!ISO_UTC_RE.test(input.timestamp)) {
    throw new Error(
      `recordReading: timestamp must be ISO-8601 UTC (YYYY-MM-DDTHH:mm:ss[.sss]Z), got: ${input.timestamp}`,
    );
  }
  // Check the date actually parses (catches 2026-13-99 etc.)
  const parsed = new Date(input.timestamp);
  if (isNaN(parsed.getTime())) {
    throw new Error(`recordReading: timestamp is not a valid date: ${input.timestamp}`);
  }
  if (!Number.isInteger(input.mesaRealHouseNumber) ||
      input.mesaRealHouseNumber < 1 || input.mesaRealHouseNumber > 12) {
    throw new Error(
      `recordReading: mesaRealHouseNumber out of range (1..12): ${input.mesaRealHouseNumber}`,
    );
  }
  if (!TOPICS.includes(input.topic)) {
    throw new Error(`recordReading: unknown topic: ${input.topic}`);
  }
  if (!Array.isArray(input.traditionsUsed) || input.traditionsUsed.length === 0) {
    throw new Error('recordReading: traditionsUsed must be non-empty array');
  }
  for (const t of input.traditionsUsed) {
    if (!SACRED_TRADITIONS.includes(t as SacredTradition)) {
      throw new Error(`recordReading: unknown tradition: ${t}`);
    }
  }
  if (input.userReflection !== undefined) {
    if (typeof input.userReflection !== 'string') {
      throw new Error('recordReading: userReflection must be string when present');
    }
    if (input.userReflection.length > 500) {
      throw new Error('recordReading: userReflection exceeds 500 chars');
    }
  }
  if (input.upstreamCacheKey !== undefined &&
      typeof input.upstreamCacheKey !== 'string') {
    throw new Error('recordReading: upstreamCacheKey must be string when present');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORE
// ════════════════════════════════════════════════════════════════════════════

const READING_STORE: Map<UserId, ReadingRecord[]> = new Map();
const AUDIT_LOG: ReadingRecord[] = [];

/** Monotonic ID counter so reading IDs are deterministic & time-ordered. */
let ID_COUNTER = 0;

function nextReadingId(): ReadingId {
  ID_COUNTER++;
  // r_ + 13-digit padded (UTC ms timestamp + 4-digit counter)
  const ts = Date.now().toString().padStart(9, '0');
  const counter = ID_COUNTER.toString().padStart(4, '0');
  return readingId(`r_${ts}${counter}`);
}

function ensureUserBucket(u: UserId): ReadingRecord[] {
  let bucket = READING_STORE.get(u);
  if (!bucket) {
    bucket = [];
    READING_STORE.set(u, bucket);
  }
  return bucket;
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — recordReading
// ════════════════════════════════════════════════════════════════════════════

export function recordReading(input: ReadingRecordInput): ReadingId {
  validateReadingInput(input);
  const id = nextReadingId();
  const cacheKey = hashCacheKey(input);
  const record: ReadingRecord = Object.freeze({
    id,
    userId: input.userId,
    timestamp: input.timestamp,
    mesaRealHouseNumber: input.mesaRealHouseNumber,
    topic: input.topic,
    traditionsUsed: Object.freeze([...input.traditionsUsed]),
    userReflection: input.userReflection ?? '',
    upstreamCacheKey: input.upstreamCacheKey ?? '',
    integrityHash: cacheKey,
    meta: Object.freeze({
      brand: 'W77-D',
      generatedAt: new Date().toISOString(),
    }),
  });
  const bucket = ensureUserBucket(input.userId);
  bucket.push(record);
  AUDIT_LOG.push(record);
  return id;
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — getUserHistory (paginated + filtered)
// ════════════════════════════════════════════════════════════════════════════

function matchesQuery(r: ReadingRecord, q: HistoryQuery): boolean {
  if (q.topic !== undefined && r.topic !== q.topic) return false;
  if (q.tradition !== undefined && !r.traditionsUsed.includes(q.tradition)) {
    return false;
  }
  if (q.fromDate !== undefined) {
    if (r.timestamp.slice(0, 10) < q.fromDate.slice(0, 10)) return false;
  }
  if (q.toDate !== undefined) {
    if (r.timestamp.slice(0, 10) > q.toDate.slice(0, 10)) return false;
  }
  return true;
}

export function getUserHistory(
  userId: UserId,
  opts: HistoryQuery = {},
): readonly ReadingRecord[] {
  const bucket = READING_STORE.get(userId) ?? [];
  const filtered = bucket.filter((r) => matchesQuery(r, opts));
  // Sort by timestamp descending (newest first).
  const sorted = [...filtered].sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0,
  );
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 20));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = sorted.slice(start, end);
  return Object.freeze(slice.map((r) => r));
}

export function getUserHistoryPaginated(
  userId: UserId,
  opts: HistoryQuery = {},
): PaginatedHistory {
  const bucket = READING_STORE.get(userId) ?? [];
  const filtered = bucket.filter((r) => matchesQuery(r, opts));
  const sorted = [...filtered].sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0,
  );
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 20));
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = sorted.slice(start, end);
  return Object.freeze({
    records: Object.freeze(slice.map((r) => r)),
    page,
    pageSize,
    total,
    totalPages,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — getTraditionDistribution
// ════════════════════════════════════════════════════════════════════════════

export function getTraditionDistribution(userId: UserId): readonly TraditionStat[] {
  const bucket = READING_STORE.get(userId) ?? [];
  const counts = new Map<SacredTradition, number>();
  for (const t of SACRED_TRADITIONS) counts.set(t, 0);
  for (const r of bucket) {
    for (const t of r.traditionsUsed) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  const total = bucket.reduce((acc, r) => acc + r.traditionsUsed.length, 0);
  const out: TraditionStat[] = [];
  for (const t of SACRED_TRADITIONS) {
    const c = counts.get(t) ?? 0;
    out.push(Object.freeze({
      tradition: t,
      count: c,
      pct: total === 0 ? 0 : Math.round((c / total) * 1000) / 10,
    }));
  }
  return Object.freeze(out);
}

// ════════════════════════════════════════════════════════════════════════════
// INSIGHT ENGINES — helpers
// ════════════════════════════════════════════════════════════════════════════

/** Group records by UTC calendar date (YYYY-MM-DD). */
function groupByDate(bucket: readonly ReadingRecord[]): Map<string, ReadingRecord[]> {
  const out = new Map<string, ReadingRecord[]>();
  for (const r of bucket) {
    const day = r.timestamp.slice(0, 10);
    let arr = out.get(day);
    if (!arr) {
      arr = [];
      out.set(day, arr);
    }
    arr.push(r);
  }
  return out;
}

/**
 * Compute current streak ending today (or yesterday — allow 1-day grace).
 * Returns the count of consecutive days with ≥1 reading.
 */
function computeCurrentStreak(bucket: readonly ReadingRecord[]): number {
  if (bucket.length === 0) return 0;
  const days = new Set<string>();
  for (const r of bucket) days.add(r.timestamp.slice(0, 10));
  // Walk backwards from today (UTC) or yesterday — grace for late-night users.
  const now = new Date();
  let cursor = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
  ));
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    // Try yesterday as anchor (user may not have logged today yet)
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function computeLongestStreak(bucket: readonly ReadingRecord[]): number {
  if (bucket.length === 0) return 0;
  const sorted = [...bucket].sort((a, b) =>
    a.timestamp < b.timestamp ? -1 : 1,
  );
  const daySet = new Set<string>();
  for (const r of sorted) daySet.add(r.timestamp.slice(0, 10));
  const days = [...daySet].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]! + 'T00:00:00Z');
    const curr = new Date(days[i]! + 'T00:00:00Z');
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

function timeOfDayOf(iso: string): TimeOfDay {
  // 00-05 = madrugada (deep yin)
  // 06-11 = manha (yang rising)
  // 12-17 = tarde (yang peak)
  // 18-23 = noite (yin)
  const hh = parseInt(iso.slice(11, 13), 10);
  if (hh < 6) return 'madrugada';
  if (hh < 12) return 'manha';
  if (hh < 18) return 'tarde';
  return 'noite';
}

function insightTitle(kind: InsightKind): string {
  switch (kind) {
    case 'streak-current': return 'Streak ativo';
    case 'streak-record': return 'Recorde de streak';
    case 'streak-celebration': return 'Ciclo de 7 dias';
    case 'most-consulted-house': return 'Casa mais consultada';
    case 'most-consulted-topic': return 'Tema recorrente';
    case 'multidimensional-approach': return 'Abordagem multidimensional';
    case 'time-of-day-pattern': return 'Ritmo Yin/Yang';
    case 'tradition-balance': return 'Equilíbrio de tradições';
    case 'sacred-tradition-affinity': return 'Afinidade com uma tradição';
    case 'reflection-richness': return 'Riqueza de reflexão';
  }
}

function makeInsight(
  userId: UserId,
  kind: InsightKind,
  description: string,
  confidence: number,
  traditions: readonly SacredTradition[],
): Insight {
  const idText = `${kind}-${userId}-${Date.now().toString(36)}`;
  return Object.freeze({
    id: insightId(`i_${idText.replace(/[^a-z0-9_]/gi, '_').slice(0, 40)}`),
    userId,
    kind,
    title: insightTitle(kind),
    description,
    confidence: Math.max(0, Math.min(1, confidence)),
    traditions: Object.freeze([...traditions]),
    generatedAt: new Date().toISOString(),
  });
}

// ════════════════════════════════════════════════════════════════════════════
// INSIGHT ENGINES — multidimensional detection
// ════════════════════════════════════════════════════════════════════════════

/**
 * A "multidimensional approach" fires when the user has consulted the SAME topic
 * through 3+ different traditions. This is a strong signal of cross-system
 * integration (a sophisticated reader who wants all angles).
 */
function detectMultidimensional(
  userId: UserId,
  bucket: readonly ReadingRecord[],
): Insight | null {
  // topic → Set<tradition>
  const map = new Map<ConsultationTopic, Set<SacredTradition>>();
  for (const r of bucket) {
    let s = map.get(r.topic);
    if (!s) {
      s = new Set();
      map.set(r.topic, s);
    }
    for (const t of r.traditionsUsed) s.add(t);
  }
  const qualifying: Array<{ topic: ConsultationTopic; traditions: SacredTradition[] }> = [];
  for (const [topic, traditions] of map.entries()) {
    if (traditions.size >= 3) {
      qualifying.push({ topic, traditions: [...traditions].sort() });
    }
  }
  if (qualifying.length === 0) return null;
  // Pick the topic with the most traditions (most multidimensional).
  qualifying.sort((a, b) => b.traditions.length - a.traditions.length);
  const best = qualifying[0]!;
  const traditions = best.traditions as readonly SacredTradition[];
  return makeInsight(
    userId,
    'multidimensional-approach',
    `Você consultou "${best.topic}" através de ${best.traditions.length} tradições: ${traditions.join(', ')}. ` +
    `Isso indica uma abordagem multidimensional — você busca integrar diferentes ângulos antes de decidir.`,
    Math.min(1, 0.6 + 0.1 * best.traditions.length),
    traditions,
  );
}

/**
 * Most-consulted house — signals which axis of life the user is processing.
 */
function detectMostConsultedHouse(
  userId: UserId,
  bucket: readonly ReadingRecord[],
): Insight | null {
  if (bucket.length === 0) return null;
  const counts = new Map<MesaRealHouseNumber, number>();
  for (const r of bucket) {
    counts.set(r.mesaRealHouseNumber, (counts.get(r.mesaRealHouseNumber) ?? 0) + 1);
  }
  let bestHouse: MesaRealHouseNumber = 1;
  let bestCount = 0;
  for (const [h, c] of counts.entries()) {
    if (c > bestCount) {
      bestHouse = h;
      bestCount = c;
    }
  }
  if (bestCount < 2) return null; // need ≥2 readings on same house for signal
  const pct = Math.round((bestCount / bucket.length) * 100);
  return makeInsight(
    userId,
    'most-consulted-house',
    `A Casa ${bestHouse} da Mesa Real apareceu em ${bestCount} das suas ${bucket.length} leituras (${pct}%). ` +
    `Esse eixo temático está em foco na sua jornada.`,
    Math.min(1, 0.5 + 0.1 * bestCount),
    ['Cigano'],
  );
}

/**
 * Most-consulted topic — signals which life theme is dominant.
 */
function detectMostConsultedTopic(
  userId: UserId,
  bucket: readonly ReadingRecord[],
): Insight | null {
  if (bucket.length === 0) return null;
  const counts = new Map<ConsultationTopic, number>();
  for (const r of bucket) {
    counts.set(r.topic, (counts.get(r.topic) ?? 0) + 1);
  }
  let bestTopic: ConsultationTopic = 'trabalho';
  let bestCount = 0;
  for (const [t, c] of counts.entries()) {
    if (c > bestCount) {
      bestTopic = t;
      bestCount = c;
    }
  }
  if (bestCount < 2) return null;
  return makeInsight(
    userId,
    'most-consulted-topic',
    `"${bestTopic}" é o tema que mais aparece na sua Mesa Real (${bestCount}x). ` +
    `O eixo temático está ativo e merece atenção.`,
    Math.min(1, 0.5 + 0.1 * bestCount),
    [],
  );
}

/**
 * Time-of-day pattern — Yin (madrugada + noite) vs Yang (manha + tarde).
 * Returns the dominant mode and a description.
 */
function detectTimeOfDayPattern(
  userId: UserId,
  bucket: readonly ReadingRecord[],
): Insight | null {
  if (bucket.length < 3) return null; // need some signal
  const buckets = { madrugada: 0, manha: 0, tarde: 0, noite: 0 };
  for (const r of bucket) {
    const tod = timeOfDayOf(r.timestamp);
    buckets[tod]++;
  }
  const yin = buckets.madrugada + buckets.noite;
  const yang = buckets.manha + buckets.tarde;
  if (yin === 0 && yang === 0) return null;
  const dominant = yin > yang ? 'Yin (noite/madrugada)' : 'Yang (manhã/tarde)';
  const diff = Math.abs(yin - yang);
  const ratio = (yin + yang) === 0 ? 0 : diff / (yin + yang);
  if (ratio < 0.4) return null; // too balanced to be a pattern
  const traditions: SacredTradition[] = yin > yang
    ? ['Tantra', 'Cabala'] // Yin traditions
    : ['Astrologia', 'Cigano']; // Yang traditions
  return makeInsight(
    userId,
    'time-of-day-pattern',
    `${yin + yang} leituras — ${yin} em horário Yin (madrugada/noite) e ${yang} em horário Yang (manhã/tarde). ` +
    `Sua prática pende para ${dominant}. Isso pode indicar que rituais/noturnos ou matinais ressoam mais com você.`,
    Math.min(1, 0.5 + ratio),
    traditions,
  );
}

/**
 * Sacred tradition affinity — one tradition dominates >50% of usage.
 * Suggests an affinity worth naming explicitly.
 */
function detectTraditionAffinity(
  userId: UserId,
  bucket: readonly ReadingRecord[],
): Insight | null {
  if (bucket.length < 5) return null;
  const dist = getTraditionDistribution(userId);
  let dominant: TraditionStat | null = null;
  for (const s of dist) {
    if (s.pct >= 50 && (dominant === null || s.pct > dominant.pct)) {
      dominant = s;
    }
  }
  if (dominant === null) return null;
  return makeInsight(
    userId,
    'sacred-tradition-affinity',
    `${dominant.tradition} aparece em ${dominant.pct}% das suas leituras — afinidade forte. ` +
    `Considere aprofundar essa tradição (estudos, iniciação, retiro) ou alternar intencionalmente com outras pra equilíbrio.`,
    Math.min(1, 0.6 + (dominant.pct - 50) / 100),
    [dominant.tradition],
  );
}

/**
 * Tradition balance — all 7 traditions appear at least once.
 * (7-tradição coverage mandate from cycle 77.)
 */
function detectTraditionBalance(
  userId: UserId,
  bucket: readonly ReadingRecord[],
): Insight | null {
  const dist = getTraditionDistribution(userId);
  const used = dist.filter((s) => s.count > 0).map((s) => s.tradition);
  if (used.length < 7) return null;
  return makeInsight(
    userId,
    'tradition-balance',
    `Você já ativou todas as 7 tradições: ${used.join(', ')}. ` +
    `Esse é o ideal de cobertura — abordagem universalista, sem viés.`,
    0.95,
    used,
  );
}

/**
 * Reflection richness — user writes reflections on ≥70% of readings.
 */
function detectReflectionRichness(
  userId: UserId,
  bucket: readonly ReadingRecord[],
): Insight | null {
  if (bucket.length < 3) return null;
  const withRef = bucket.filter((r) => r.userReflection.length > 0).length;
  const pct = withRef / bucket.length;
  if (pct < 0.7) return null;
  return makeInsight(
    userId,
    'reflection-richness',
    `${withRef} de ${bucket.length} leituras (${Math.round(pct * 100)}%) têm reflexão escrita. ` +
    `Você é um leitor ativo — anotações transformam insight em integração.`,
    Math.min(1, 0.6 + pct),
    [],
  );
}

/**
 * Streak insights — current, record, and the 7-day celebration (sagrado).
 */
function detectStreakInsights(
  userId: UserId,
  bucket: readonly ReadingRecord[],
): readonly Insight[] {
  if (bucket.length === 0) return Object.freeze([]);
  const current = computeCurrentStreak(bucket);
  const longest = computeLongestStreak(bucket);
  const out: Insight[] = [];
  if (current >= 2) {
    out.push(makeInsight(
      userId,
      'streak-current',
      `Streak atual: ${current} dias consecutivos de leituras. Continue.`,
      Math.min(1, 0.5 + 0.05 * current),
      [],
    ));
  }
  if (longest >= 3) {
    out.push(makeInsight(
      userId,
      'streak-record',
      `Seu recorde pessoal é ${longest} dias seguidos. ` +
      (current >= longest ? 'Você está igualando o recorde!' : 'Continue para superá-lo.'),
      0.8,
      [],
    ));
  }
  // 7 dias = ciclo completo de Orixá (sagrado)
  if (current === 7 || longest === 7) {
    out.push(makeInsight(
      userId,
      'streak-celebration',
      `7 dias completos — ciclo de Orixá fechado. ` +
      `Na tradição, 7 dias de prática contínua marca um ciclo sagrado. Axé.`,
      1.0,
      ['Candomblé', 'Umbanda', 'Ifá'],
    ));
  }
  return Object.freeze(out);
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — getPatternInsights
// ════════════════════════════════════════════════════════════════════════════

export function getPatternInsights(userId: UserId): readonly Insight[] {
  const bucket = READING_STORE.get(userId) ?? [];
  if (bucket.length === 0) return Object.freeze([]);
  const insights: Insight[] = [];
  insights.push(...detectStreakInsights(userId, bucket));
  const md = detectMultidimensional(userId, bucket);
  if (md) insights.push(md);
  const mch = detectMostConsultedHouse(userId, bucket);
  if (mch) insights.push(mch);
  const mct = detectMostConsultedTopic(userId, bucket);
  if (mct) insights.push(mct);
  const tod = detectTimeOfDayPattern(userId, bucket);
  if (tod) insights.push(tod);
  const ta = detectTraditionAffinity(userId, bucket);
  if (ta) insights.push(ta);
  const tb = detectTraditionBalance(userId, bucket);
  if (tb) insights.push(tb);
  const rr = detectReflectionRichness(userId, bucket);
  if (rr) insights.push(rr);
  // Sort by confidence descending
  insights.sort((a, b) => b.confidence - a.confidence);
  return Object.freeze(insights);
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — exportAudit (frozen log)
// ════════════════════════════════════════════════════════════════════════════

export function exportAudit(): readonly ReadingRecord[] {
  return Object.freeze(AUDIT_LOG.map((r) => r));
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — verifyReadingIntegrity (cycle 67 HMAC pattern)
// ════════════════════════════════════════════════════════════════════════════

export function verifyReadingIntegrity(record: ReadingRecord): boolean {
  // Re-derive cache key from record's stored fields (excluding id and meta)
  // and compare to integrityHash.
  const reconstruct: ReadingRecordInput = {
    userId: record.userId,
    timestamp: record.timestamp,
    mesaRealHouseNumber: record.mesaRealHouseNumber,
    topic: record.topic,
    traditionsUsed: record.traditionsUsed,
    ...(record.userReflection ? { userReflection: record.userReflection } : {}),
    ...(record.upstreamCacheKey ? { upstreamCacheKey: record.upstreamCacheKey } : {}),
  };
  const expected = sha256HexSync(canonicalJson(reconstruct));
  return expected === record.integrityHash;
}

// ════════════════════════════════════════════════════════════════════════════
// TEST HOOKS — for the spec/smoke harnesses only
// ════════════════════════════════════════════════════════════════════════════

export function _resetForTest(): void {
  READING_STORE.clear();
  AUDIT_LOG.length = 0;
  ID_COUNTER = 0;
}

export function _userBucketSize(userId: UserId): number {
  return READING_STORE.get(userId)?.length ?? 0;
}

export function _auditSize(): number {
  return AUDIT_LOG.length;
}
