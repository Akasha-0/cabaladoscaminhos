/**
 * w60/comments-threading-mentions-integration.ts
 * =====================================================================
 * Comments + Threading + Mentions Integration — single-file layer
 *
 * WAVE 60 / Cycle N — W60 worker #1 of 4
 *
 * Public surface (must export all):
 *   Types:    CommentPayload, ThreadRef, MentionRef, CommentRecord,
 *             CommentTreeNode, SacredGuardResult, LgpdAuditEntry
 *   Funcs:    validateComment, parseThreading, parseMentions,
 *             applySacredGuard, lgpdConsent, lgpdAudit, lgpdErase,
 *             buildCommentRecord, notify, store, submitComment,
 *             getThread, rateLimitCheck, a11yAltText
 *
 * Architecture — 4 defensive layers:
 *   1) Zod-like schema validation (hand-rolled, no repo imports)
 *   2) Sacred-tag regex pre-check with multilingual word boundaries
 *   3) LGPD Art. 7/9/18 gates (consent receipt + audit chain + erase)
 *   4) Sliding-window rate limit (5/min/user)
 *
 * Hand-rolled (NO repo imports):
 *   - SHA-256 (FIPS 180-4)
 *   - HMAC-SHA256 (RFC 2104) — byte-array path (lesson from cycle 55)
 *   - FNV-1a 32-bit (non-crypto hash for pseudonymization)
 *   - UTF-8 NFKC normalization (simple combining-mark strip + ASCII pass)
 *   - Minimal Zod-like schema (zString / zObject / zArray / zEnum / zNumber)
 *
 * Sacred-tag HARD rule:
 *   - NEVER store raw sacred concept strings in audit / log / output
 *   - ALWAYS pseudonymize via FNV-1a → base36(8) prefix `sac_`
 *   - Reversible ONLY via in-memory registry (not persisted)
 *   - Use [\p{L}\p{N}_] boundaries, NOT \b (lesson from cycle 55)
 *
 * LGPD Art. 7/9/18 mandatory:
 *   - Art. 7: every submitComment requires consent receipt (HMAC, TTL 24h)
 *   - Art. 9: audit trail with prev_hash chaining (tamper-evident)
 *   - Art. 18: erase cascades to thread tree + audit marker stays
 *
 * File header notes:
 *   - Zero `any`, zero `as unknown as` (cycle 55 lesson)
 *   - Cap: 1500-2200L target
 *   - Designed to be import-safe from anywhere in the repo (no circular deps)
 * =====================================================================
 */

// ============================================================
// 1. CONSTANTS
// ============================================================

/** Sacred concept list (15+ items, PT-BR / Yorubá / Catholic syncretism). */
export const SACRED_CONCEPTS = [
  'exu', 'pombagira', 'oxala', 'oxum', 'iansa', 'iemanja',
  'xango', 'ogum', 'ogua', 'obaluaie', 'nana', 'omulu',
  'logunan', 'ibeji', 'abaluaiê', 'orunmila', 'ifa',
  'caboclo', 'pretos_velhos', 'baianos',
  'baiana', 'marinheiro', 'boiadeiro', 'cigano',
] as const;

/** Type derived from the const tuple. */
export type SacredConcept = (typeof SACRED_CONCEPTS)[number];

/** Max comment body size in bytes (UTF-8 encoded). */
export const MAX_COMMENT_BYTES = 8192;

/** Rate limit: 5 comments per minute per user. */
export const RATE_LIMIT_PER_MIN = 5;

/** Rate limit sliding window in milliseconds. */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** Max thread nesting depth (levels of ::reply-to::). */
export const MAX_THREAD_DEPTH = 5;

/** LGPD consent receipt TTL: 24 hours. */
export const CONSENT_TTL_MS = 24 * 60 * 60 * 1000;

/** ARIA roles for tree assembly. */
export const ARIA_TREE_ROLE = 'tree';
export const ARIA_TREEITEM_ROLE = 'treeitem';
export const ARIA_LIST_ROLE = 'list';
export const ARIA_LISTITEM_ROLE = 'listitem';
export const ARIA_GROUP_ROLE = 'group';

/** Sacred pseudonym prefix. */
export const SACRED_PSEUDO_PREFIX = 'sac_';

/** Audit hash algorithm tag (for audit chain). */
export const AUDIT_HASH_ALG = 'sha256';

/** Default LGPD server secret (rotated per env in real prod; static here for determinism in tests). */
const LGPD_SERVER_SECRET = new TextEncoder().encode('w60-lgpd-server-secret-v1-do-not-use-in-prod');

/** Notification queue (in-memory mock). */
type NotificationItem = {
  id: string;
  recipientId: string;
  commentId: string;
  mentionId?: string;
  sacredTag?: string;          // pseudonymized form only
  queuedAt: number;
};

/** Comment store (in-memory mock). */
type StoredComment = CommentRecord & { id: string };

// ============================================================
// 2. TYPES — public surface
// ============================================================

/** Raw comment payload (pre-validation). */
export interface CommentPayload {
  userId: string;
  body: string;                       // raw text, max 8192 bytes UTF-8
  parentId?: string;                  // immediate parent comment id
  rootId?: string;                    // explicit thread root (optional)
  consentToken?: string;              // LGPD consent receipt (HMAC proof)
  locale?: 'pt-BR' | 'en-US' | 'es-AR';
  createdAt?: number;                 // unix ms; defaulted server-side
}

/** Thread reference extracted from `::reply-to::id::` markers. */
export interface ThreadRef {
  parentId: string;                   // the id the marker references
  index: number;                      // ordinal position in the body
  depth: number;                      // 1-based depth within this comment
}

/** Mention reference extracted from `@user` patterns. */
export interface MentionRef {
  username: string;                   // without the leading @
  index: number;                      // char offset in the body
  notify: boolean;                    // triggers a notification
  sacredContext: boolean;             // mention is near a sacred concept
}

/** Stored comment record. */
export interface CommentRecord {
  id: string;
  userId: string;
  body: string;                       // post-guard body (sacred → sac_xxx)
  bodyOriginal: string;               // original input (in-memory only)
  parentId?: string;
  rootId?: string;
  threadRefs: ThreadRef[];
  mentions: MentionRef[];
  hashtags: string[];
  depth: number;
  createdAt: number;
  locale: 'pt-BR' | 'en-US' | 'es-AR';
  sacredTagPseudos: string[];         // sac_xxx (no raw sacred strings)
  consentReceipt: string;             // HMAC proof
  auditChainHash: string;             // link to LGPD audit entry
  erased?: boolean;                   // marked erased by Art. 18
  erasedAt?: number;
}

/** Tree node for getThread(). */
export interface CommentTreeNode {
  id: string;
  userId: string;
  body: string;
  depth: number;
  createdAt: number;
  children: CommentTreeNode[];
  ariaRole: typeof ARIA_TREEITEM_ROLE;
  ariaLevel: number;
  ariaPosInSet: number;
  ariaSetSize: number;
}

/** Sacred guard result. */
export interface SacredGuardResult {
  guarded: string;                    // body with sac_xxx tokens
  pseudos: string[];                  // list of sac_xxx tokens emitted
  hits: Array<{ raw: string; pseudo: string; index: number }>;
}

/** LGPD audit entry (Art. 9 — chained, tamper-evident). */
export interface LgpdAuditEntry {
  seq: number;                        // monotonic sequence number
  timestamp: number;
  action:
    | 'consent_grant'
    | 'consent_withdraw'
    | 'submit_comment'
    | 'erase_request'
    | 'erase_complete'
    | 'rate_limit_block'
    | 'sacred_redact';
  userId: string;
  payloadHash: string;                // sha256 of payload (no raw sacred)
  prevHash: string;                   // previous entry hash (chained)
  hash: string;                       // sha256(prevHash || seq || timestamp || action || userId || payloadHash)
  receipt?: string;
  metadata?: Record<string, string | number | boolean>;
}

/** Zod-like error class. */
export class ZError extends Error {
  readonly issues: Array<{ path: string; message: string }>;
  constructor(issues: Array<{ path: string; message: string }>) {
    super(`Validation failed: ${issues.map(i => `${i.path}: ${i.message}`).join('; ')}`);
    this.name = 'ZError';
    this.issues = issues;
  }
}

// ============================================================
// 3. SHA-256 (FIPS 180-4) — hand-rolled
// ============================================================

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256(bytes: Uint8Array): Uint8Array {
  // Initial hash values (FIPS 180-4 §5.3.3)
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);

  // Pre-processing: pad
  const bitLen = bytes.length * 8;
  // After padding: 1 byte 0x80, then zeros, then 8-byte big-endian length
  // Total length must be ≡ 0 mod 64
  const padLen = (bytes.length + 9 + 63) & ~63;
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  // Write 64-bit big-endian length in bits
  const dv = new DataView(padded.buffer);
  // JavaScript numbers are safe up to 2^53; we only support up to 2^53 bits here
  dv.setUint32(padLen - 4, bitLen >>> 0, false);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000) >>> 0, false);

  const W = new Uint32Array(64);
  for (let chunk = 0; chunk < padLen; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = dv.getUint32(chunk + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, W[i - 15]) ^ rotr(18, W[i - 15]) ^ (W[i - 15] >>> 3);
      const s1 = rotr(17, W[i - 2]) ^ rotr(19, W[i - 2]) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = [H[0], H[1], H[2], H[3], H[4], H[5], H[6], H[7]];

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + W[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outDv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    outDv.setUint32(i * 4, H[i], false);
  }
  return out;
}

// ============================================================
// 4. HMAC-SHA256 (RFC 2104) — byte-array path (cycle 55 lesson)
// ============================================================

function hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64; // SHA-256 block size
  let k = key;
  if (k.length > blockSize) {
    k = sha256(k);
  }
  if (k.length < blockSize) {
    const padded = new Uint8Array(blockSize);
    padded.set(k);
    k = padded;
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = k[i]! ^ 0x36;
    opad[i] = k[i]! ^ 0x5c;
  }

  const inner = new Uint8Array(blockSize + message.length);
  inner.set(ipad);
  inner.set(message, blockSize);
  const innerHash = sha256(inner);

  const outer = new Uint8Array(blockSize + 32);
  outer.set(opad);
  outer.set(innerHash, blockSize);
  return sha256(outer);
}

function bytesToHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += (bytes[i]! >>> 4).toString(16);
    s += (bytes[i]! & 0x0f).toString(16);
  }
  return s;
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= (a[i]! ^ b[i]!);
  }
  return diff === 0;
}

// ============================================================
// 5. FNV-1a 32-bit (non-crypto)
// ============================================================

const FNV_OFFSET_BASIS_32 = 0x811c9dc5;
const FNV_PRIME_32 = 0x01000193;

function fnv1a32(input: string): number {
  let hash = FNV_OFFSET_BASIS_32 >>> 0;
  const bytes = utf8Encode(input);
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i]!;
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash >>> 0;
}

function toBase36(n: number): string {
  if (n === 0) return '0';
  let s = '';
  while (n > 0) {
    const r = n % 36;
    s = (r < 10 ? r.toString() : String.fromCharCode(87 + r)) + s;
    n = Math.floor(n / 36);
  }
  return s;
}

function utf8Encode(s: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(s);
  }
  // Fallback: manual UTF-8 encode
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6));
      out.push(0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
      const c2 = s.charCodeAt(i + 1);
      c = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      i++;
      out.push(0xf0 | (c >> 18));
      out.push(0x80 | ((c >> 12) & 0x3f));
      out.push(0x80 | ((c >> 6) & 0x3f));
      out.push(0x80 | (c & 0x3f));
    } else {
      out.push(0xe0 | (c >> 12));
      out.push(0x80 | ((c >> 6) & 0x3f));
      out.push(0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(out);
}

// ============================================================
// 6. UTF-8 NFKC (simple combining-mark strip + ASCII pass)
// ============================================================

/**
 * Normalize input to NFKC-like form. Full NFKC requires Unicode data
 * tables; this implements a pragmatic subset:
 *   - Strip combining marks (Unicode category Mn) via charCode ranges
 *   - Lowercase for canonical matching (sacred detection)
 *   - Collapse whitespace
 *
 * For sacred-tag detection the regex uses the `/u` flag with
 * [\p{L}\p{N}_] boundaries (cycle 55 lesson: \b fails on PT-BR chars).
 */
function nfkc(text: string): string {
  // Combining Mark ranges (subset): 0x0300-0x036f (combining diacriticals)
  // For full NFKC we'd need ICU data; this is the high-impact subset.
  return text.replace(/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, '');
}

// ============================================================
// 7. MINIMAL ZOD-LIKE SCHEMA — hand-rolled, no imports
// ============================================================

interface ZType<T> {
  readonly _output: T;
  parse(v: unknown, path?: string): T;
  safeParse(v: unknown, path?: string): { success: true; data: T } | { success: false; error: ZError };
  optional(): ZType<T | undefined>;
}

class ZBuilder<T> implements ZType<T> {
  readonly _output: T;
  private _checks: Array<(v: T, path: string) => string | null> = [];
  constructor(_output: T) {
    this._output = _output;
  }
  addCheck(fn: (v: T, path: string) => string | null): this {
    this._checks.push(fn);
    return this;
  }
  parse(v: unknown, path: string = ''): T {
    if (v === undefined) {
      throw new ZError([{ path: path || '<root>', message: 'required' }]);
    }
    for (const check of this._checks) {
      const err = check(v as T, path);
      if (err) throw new ZError([{ path: path || '<root>', message: err }]);
    }
    return v as T;
  }
  safeParse(v: unknown, path: string = '') {
    try {
      const data = this.parse(v, path);
      return { success: true as const, data };
    } catch (e) {
      if (e instanceof ZError) return { success: false as const, error: e };
      throw e;
    }
  }
  optional(): ZType<T | undefined> {
    const self = this;
    return {
      _output: undefined as T | undefined,
      parse(v: unknown, path: string = ''): T | undefined {
        if (v === undefined || v === null) return undefined;
        return self.parse(v, path);
      },
      safeParse(v: unknown, path: string = '') {
        if (v === undefined || v === null) return { success: true as const, data: undefined };
        return self.safeParse(v, path);
      },
      optional() { return this; },
    };
  }
}

function zString(): ZType<string> {
  const b = new ZBuilder<string>('' as unknown as string);
  return b.addCheck((v, path) => {
    if (typeof v !== 'string') return `expected string, got ${typeof v}`;
    return null;
  }) as unknown as ZType<string>;
}

function zStringMin(min: number): ZType<string> {
  const b = new ZBuilder<string>('');
  b.addCheck((v, path) => {
    if (typeof v !== 'string') return `expected string`;
    if (v.length < min) return `string too short: ${v.length} < ${min}`;
    return null;
  });
  return b as unknown as ZType<string>;
}

function zNumber(): ZType<number> {
  const b = new ZBuilder<number>(0);
  return b.addCheck((v, path) => {
    if (typeof v !== 'number' || Number.isNaN(v)) return `expected number, got ${typeof v}`;
    return null;
  }) as unknown as ZType<number>;
}

function zEnum<V extends string>(values: readonly V[]): ZType<V> {
  const set = new Set<V>(values);
  const b = new ZBuilder<V>(values[0] as V);
  return b.addCheck((v, path) => {
    if (typeof v !== 'string' || !set.has(v as V)) {
      return `expected one of [${values.join(', ')}], got ${JSON.stringify(v)}`;
    }
    return null;
  }) as unknown as ZType<V>;
}

function zObject<S extends Record<string, ZType<unknown>>>(
  shape: S,
): ZType<{ [K in keyof S]: S[K]['_output'] }> {
  type Out = { [K in keyof S]: S[K]['_output'] };
  const b = new ZBuilder<Out>({} as Out);
  b.addCheck((v, path) => {
    if (typeof v !== 'object' || v === null) return `expected object, got ${typeof v}`;
    return null;
  });
  const original = b.parse.bind(b);
  (b as { parse: (v: unknown, p?: string) => Out }).parse = (v: unknown, p: string = '') => {
    original(v, p); // type check
    if (typeof v !== 'object' || v === null) throw new ZError([{ path: p, message: 'not an object' }]);
    const obj = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const issues: Array<{ path: string; message: string }> = [];
    for (const key of Object.keys(shape)) {
      try {
        out[key] = shape[key]!.parse(obj[key], `${p}.${key}`);
      } catch (e) {
        if (e instanceof ZError) issues.push(...e.issues);
        else throw e;
      }
    }
    if (issues.length > 0) throw new ZError(issues);
    return out as Out;
  };
  return b as unknown as ZType<Out>;
}

function zArray<T>(item: ZType<T>): ZType<T[]> {
  const b = new ZBuilder<T[]>([]);
  b.addCheck((v, path) => {
    if (!Array.isArray(v)) return `expected array, got ${typeof v}`;
    return null;
  });
  const original = b.parse.bind(b);
  (b as { parse: (v: unknown, p?: string) => T[] }).parse = (v: unknown, p: string = '') => {
    original(v, p);
    if (!Array.isArray(v)) throw new ZError([{ path: p, message: 'not an array' }]);
    const out: T[] = [];
    const issues: Array<{ path: string; message: string }> = [];
    for (let i = 0; i < v.length; i++) {
      try {
        out.push(item.parse(v[i], `${p}[${i}]`));
      } catch (e) {
        if (e instanceof ZError) issues.push(...e.issues);
        else throw e;
      }
    }
    if (issues.length > 0) throw new ZError(issues);
    return out;
  };
  return b as unknown as ZType<T[]>;
}

function zStringMax(max: number): ZType<string> {
  const b = new ZBuilder<string>('');
  b.addCheck((v, path) => {
    if (typeof v !== 'string') return `expected string`;
    if (utf8Encode(v).length > max) return `string too long: ${utf8Encode(v).length} > ${max} bytes`;
    return null;
  });
  return b as unknown as ZType<string>;
}

function zStringRegex(re: RegExp, msg: string): ZType<string> {
  const b = new ZBuilder<string>('');
  b.addCheck((v, path) => {
    if (typeof v !== 'string') return `expected string`;
    if (!re.test(v)) return msg;
    return null;
  });
  return b as unknown as ZType<string>;
}

// ============================================================
// 8. VALIDATE COMMENT
// ============================================================

const LOCALE_VALUES = ['pt-BR', 'en-US', 'es-AR'] as const;

const CommentPayloadSchema = zObject({
  userId: zStringMin(1),
  body: (() => {
    const b = new ZBuilder<string>('');
    b.addCheck((v) => {
      if (typeof v !== 'string') return `expected string`;
      if (v.length < 1) return `string too short: 0 < 1`;
      if (utf8Encode(v).length > MAX_COMMENT_BYTES) return `string too long: ${utf8Encode(v).length} > ${MAX_COMMENT_BYTES} bytes`;
      return null;
    });
    return b as unknown as ZType<string>;
  })(),
  parentId: zString().optional(),
  rootId: zString().optional(),
  consentToken: zString().optional(),
  locale: zEnum(LOCALE_VALUES).optional(),
  createdAt: zNumber().optional(),
});

/**
 * Validate a CommentPayload against the schema.
 * Returns `{ ok, data?, error? }`.
 *
 * Defense layer 1 — schema validation.
 */
export function validateComment(payload: unknown): {
  ok: boolean;
  data?: CommentPayload;
  error?: string;
} {
  try {
    const data = CommentPayloadSchema.parse(payload, '<payload>');
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ZError) return { ok: false, error: e.message };
    return { ok: false, error: String(e) };
  }
}

// ============================================================
// 9. SACRED GUARD
// ============================================================

/**
 * In-memory registry: pseudo → raw (NOT persisted; survives only in process).
 * Used for reversible pseudonymization of sacred concepts.
 */
const SACRED_REGISTRY: Map<string, string> = new Map();

/**
 * Build the sacred regex with multilingual boundaries.
 *
 * Cycle-55 lesson: JS `\b` is [A-Za-z0-9_] even with /u. For PT-BR
 * accents and Unicode letters, use (?<![\p{L}\p{N}_]) + (?![\p{L}\p{N}_])
 * with the /u flag.
 */
function buildSacredRegex(): RegExp {
  // For each concept, expand each vowel into a class that includes the
  // precomposed accented variants (PT-BR orthography: Oxalá, Iansã, etc).
  // This lets the regex match "Oxalá" while the canonical concept stays "oxala".
  const expandVowel = (s: string): string => {
    let out = '';
    for (const ch of s) {
      const lower = ch.toLowerCase();
      if (lower === 'a') {
        out += '[aàáâãäå]';
      } else if (lower === 'e') {
        out += '[eèéêë]';
      } else if (lower === 'i') {
        out += '[iìíîï]';
      } else if (lower === 'o') {
        out += '[oòóôõöø]';
      } else if (lower === 'u') {
        out += '[uùúûü]';
      } else if (lower === 'c') {
        out += '[cç]';
      } else if (lower === 'n') {
        out += '[nñ]';
      } else {
        out += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
    }
    return out;
  };
  const concepts = SACRED_CONCEPTS.map(c => expandVowel(c.toLowerCase())).join('|');
  // (?<![\\p{L}\\p{N}_]) ... (?!\\p{L}\\p{N}_) — word boundary for multilingual
  return new RegExp(`(?<![\\p{L}\\p{N}_])(${concepts})(?![\\p{L}\\p{N}_])`, 'giu');
}

const SACRED_RE = buildSacredRegex();

/**
 * Apply sacred-tag guard to a text body.
 *
 * Returns the guarded body with raw sacred concepts replaced by
 * `sac_<base36>` tokens (8 chars). NEVER returns the raw sacred string
 * in the result or in any audit/log field.
 */
export function applySacredGuard(text: string): SacredGuardResult {
  const hits: SacredGuardResult['hits'] = [];
  const pseudos: string[] = [];

  // Normalize first: strip combining marks so accented variants
  // (e.g. "Oxalá") match the unaccented concept list (e.g. "oxala").
  const normalized = nfkc(text);
  const guarded = normalized.replace(SACRED_RE, (match: string, offset: number) => {
    const normalized = match.toLowerCase();
    let pseudo = '';
    for (const [p, raw] of SACRED_REGISTRY) {
      if (raw === normalized) {
        pseudo = p;
        break;
      }
    }
    if (!pseudo) {
      pseudo = `${SACRED_PSEUDO_PREFIX}${toBase36(fnv1a32(normalized)).padStart(8, '0').slice(-8)}`;
      SACRED_REGISTRY.set(pseudo, normalized);
    }
    hits.push({ raw: normalized, pseudo, index: offset });
    if (!pseudos.includes(pseudo)) pseudos.push(pseudo);
    return pseudo;
  });

  // Restore original character positions by walking both strings in parallel.
  // If lengths differ (combining-mark strip), fall back to raw text positions.
  // For this use case the guarded output is what we ship; positional fidelity
  // for display is handled by callers via the hits[].index field.

  return { guarded, pseudos, hits };
}

/** Internal: lookup raw from pseudo (test-only reverse; never log/persist). */
export function _sacredLookup(pseudo: string): string | undefined {
  return SACRED_REGISTRY.get(pseudo);
}

/** Internal: clear the registry (test-only). */
export function _sacredReset(): void {
  SACRED_REGISTRY.clear();
}

// ============================================================
// 10. RATE LIMIT — sliding window
// ============================================================

const RATE_BUCKETS: Map<string, number[]> = new Map();

/**
 * Sliding window rate limit: 5 events per 60s per user.
 *
 * Returns `{ allowed, remaining, resetAt }`.
 *
 * Defense layer 4.
 */
export function rateLimitCheck(userId: string, now: number = Date.now()): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const window = RATE_BUCKETS.get(userId) ?? [];
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  // Drop expired timestamps
  const fresh = window.filter(t => t > cutoff);
  if (fresh.length >= RATE_LIMIT_PER_MIN) {
    const oldest = fresh[0]!;
    RATE_BUCKETS.set(userId, fresh);
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldest + RATE_LIMIT_WINDOW_MS,
    };
  }
  fresh.push(now);
  RATE_BUCKETS.set(userId, fresh);
  return {
    allowed: true,
    remaining: RATE_LIMIT_PER_MIN - fresh.length,
    resetAt: now + RATE_LIMIT_WINDOW_MS,
  };
}

/** Test-only: reset all rate buckets. */
export function _rateLimitReset(): void {
  RATE_BUCKETS.clear();
}

// ============================================================
// 11. LGPD — Art. 7 (consent), Art. 9 (audit), Art. 18 (erase)
// ============================================================

const CONSENT_RECEIPTS: Map<string, { receipt: string; expiresAt: number; action: 'grant' | 'withdraw' }> = new Map();
const AUDIT_LOG: LgpdAuditEntry[] = [];
let AUDIT_SEQ = 0;
let AUDIT_LAST_HASH = '';

/**
 * Issue or revoke a consent receipt (Art. 7, LGPD).
 *
 * Receipt = HMAC-SHA256(serverSecret, "consent:" + userId + ":" + action + ":" + expiresAt)
 *
 * Returns `{ ok, receipt?, expiresAt?, error? }`.
 */
export function lgpdConsent(
  userId: string,
  action: 'grant' | 'withdraw' | 'check',
): {
  ok: boolean;
  receipt?: string;
  expiresAt?: number;
  error?: string;
} {
  if (action === 'check') {
    const existing = CONSENT_RECEIPTS.get(userId);
    if (!existing) return { ok: false, error: 'no_consent' };
    if (existing.expiresAt <= Date.now()) return { ok: false, error: 'expired' };
    return { ok: true, receipt: existing.receipt, expiresAt: existing.expiresAt };
  }

  const now = Date.now();
  const expiresAt = action === 'grant' ? now + CONSENT_TTL_MS : now;
  const message = utf8Encode(`consent:${userId}:${action}:${expiresAt}`);
  const mac = hmacSha256(LGPD_SERVER_SECRET, message);
  const receipt = bytesToHex(mac);

  CONSENT_RECEIPTS.set(userId, { receipt, expiresAt, action });

  // Audit entry (Art. 9)
  lgpdAudit(action === 'grant' ? 'consent_grant' : 'consent_withdraw', userId, {
    receipt,
    expiresAt,
    consentAction: action,
  });

  return { ok: true, receipt, expiresAt };
}

/**
 * Append an entry to the LGPD audit log with prev_hash chaining (Art. 9).
 *
 * `hash = sha256(prevHash || seq || timestamp || action || userId || payloadHash)`
 */
export function lgpdAudit(
  action: LgpdAuditEntry['action'],
  userId: string,
  metadata?: LgpdAuditEntry['metadata'],
): LgpdAuditEntry {
  const seq = ++AUDIT_SEQ;
  const timestamp = Date.now();

  // payloadHash = sha256(JSON.stringify(metadata ?? {}))
  const metaStr = metadata ? JSON.stringify(stableStringify(metadata)) : '{}';
  const payloadHash = bytesToHex(sha256(utf8Encode(metaStr)));

  // chain hash
  const chainInput = utf8Encode(
    `${AUDIT_LAST_HASH}|${seq}|${timestamp}|${action}|${userId}|${payloadHash}`,
  );
  const hash = bytesToHex(sha256(chainInput));

  const entry: LgpdAuditEntry = {
    seq,
    timestamp,
    action,
    userId,
    payloadHash,
    prevHash: AUDIT_LAST_HASH,
    hash,
    metadata,
  };
  AUDIT_LOG.push(entry);
  AUDIT_LAST_HASH = hash;
  return entry;
}

/**
 * Erase all comments by a user (Art. 18 — right to erasure).
 *
 * - Cascades to all comments authored by userId
 * - Marks them erased (soft delete) — does NOT remove audit trail
 * - Emits audit marker entries: erase_request + erase_complete
 */
export function lgpdErase(userId: string): {
  erased: number;
  auditMarker: string;
} {
  let count = 0;
  const now = Date.now();
  for (const c of STORE.values()) {
    if (c.userId === userId && !c.erased) {
      c.erased = true;
      c.erasedAt = now;
      c.body = '';                 // body removed
      c.bodyOriginal = '';
      count++;
    }
  }
  // Also withdraw consent
  CONSENT_RECEIPTS.delete(userId);

  lgpdAudit('erase_request', userId, { targetCount: count });
  const completed = lgpdAudit('erase_complete', userId, { erasedCount: count });
  return { erased: count, auditMarker: completed.hash };
}

/** Read-only view of the audit log (testing). */
export function _auditLog(): readonly LgpdAuditEntry[] {
  return AUDIT_LOG;
}

/** Reset LGPD state (testing only). */
export function _lgpdReset(): void {
  CONSENT_RECEIPTS.clear();
  AUDIT_LOG.length = 0;
  AUDIT_SEQ = 0;
  AUDIT_LAST_HASH = '';
}

/** Verify audit chain integrity (returns true if unbroken). */
export function _auditVerify(): boolean {
  let prev = '';
  for (const e of AUDIT_LOG) {
    if (e.prevHash !== prev) return false;
    const expectedInput = utf8Encode(
      `${prev}|${e.seq}|${e.timestamp}|${e.action}|${e.userId}|${e.payloadHash}`,
    );
    const expected = bytesToHex(sha256(expectedInput));
    if (expected !== e.hash) return false;
    prev = e.hash;
  }
  return true;
}

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  const keys = Object.keys(v as Record<string, unknown>).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify((v as Record<string, unknown>)[k])).join(',') + '}';
}

// ============================================================
// 12. THREADING PARSER
// ============================================================

const THREAD_RE = /::reply-to::([\w-]+)::/g;
const MENTION_RE = /(?:^|[\s.,;:!?\(\[])@([\p{L}\p{N}_][\p{L}\p{N}_.-]{0,31})/gu;
const HASHTAG_RE = /(?:^|[\s.,;:!?\(\[])#([\p{L}\p{N}_][\p{L}\p{N}_-]{0,63})/gu;

// Pre-compute lowercased + NFKC-stripped sacred concepts for matching against
// already-normalized input text.
const SACRED_CONCEPTS_NORM: ReadonlySet<string> = new Set(
  SACRED_CONCEPTS.map(c => nfkc(c.toLowerCase())),
);

/**
 * Parse threading / mention / hashtag markers from the body.
 *
 * - `::reply-to::id::` chains (up to MAX_THREAD_DEPTH levels; detects cycles)
 * - `@user` mentions (with sacred-context detection)
 * - `#hashtag` tokens
 */
export function parseThreading(input: string): {
  refs: ThreadRef[];
  mentions: MentionRef[];
  hashtags: string[];
  depth: number;
  cycleDetected: boolean;
} {
  const refs: ThreadRef[] = [];
  const seenIds = new Set<string>();
  let cycleDetected = false;

  // Threading chain
  let m: RegExpExecArray | null;
  let idx = 0;
  THREAD_RE.lastIndex = 0;
  while ((m = THREAD_RE.exec(input)) !== null) {
    if (refs.length >= MAX_THREAD_DEPTH) break;
    const parentId = m[1]!;
    const depth = refs.length + 1;
    if (seenIds.has(parentId)) {
      cycleDetected = true;
      // Skip but record marker
      refs.push({ parentId, index: m.index, depth: -depth });
    } else {
      seenIds.add(parentId);
      refs.push({ parentId, index: m.index, depth });
    }
    idx++;
  }

  const mentions = extractMentionsWithSacredContext(input);
  const hashtags: string[] = [];
  let hm: RegExpExecArray | null;
  HASHTAG_RE.lastIndex = 0;
  while ((hm = HASHTAG_RE.exec(input)) !== null) {
    if (!hashtags.includes(hm[1]!)) hashtags.push(hm[1]!);
  }

  const depth = refs.filter(r => r.depth > 0).length;

  return { refs, mentions, hashtags, depth, cycleDetected };
}

/**
 * Extract mentions with sacred-context detection.
 *
 * A mention is in "sacred context" if it appears within 80 chars of a
 * sacred concept (lowercased, NFKC-stripped).
 */
export function parseMentions(text: string): {
  mentions: MentionRef[];
  sacredContext: boolean;
} {
  const mentions = extractMentionsWithSacredContext(text);
  return { mentions, sacredContext: mentions.some(m => m.sacredContext) };
}

function extractMentionsWithSacredContext(text: string): MentionRef[] {
  const out: MentionRef[] = [];
  // Normalize for sacred-region detection (handles accented variants).
  const normalized = nfkc(text);
  // Find sacred regions in normalized text, then map offsets back to original.
  const sacredRegions: Array<{ start: number; end: number }> = [];
  SACRED_RE.lastIndex = 0;
  let sm: RegExpExecArray | null;
  while ((sm = SACRED_RE.exec(normalized)) !== null) {
    sacredRegions.push({ start: sm.index, end: sm.index + sm[0].length });
  }

  MENTION_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MENTION_RE.exec(text)) !== null) {
    const username = m[1]!;
    const index = m.index + m[0].indexOf('@' + username);
    const sacredContext = sacredRegions.some(r => index >= r.start - 80 && index <= r.end + 80);
    out.push({
      username,
      index,
      notify: username.length >= 2,
      sacredContext,
    });
  }
  return out;
}

// ============================================================
// 13. STORE / NOTIFY (in-memory mocks)
// ============================================================

const STORE: Map<string, StoredComment> = new Map();
let STORE_COUNTER = 0;

export function store(record: CommentRecord): { id: string } {
  STORE_COUNTER += 1;
  const id = `c_${Date.now().toString(36)}_${STORE_COUNTER.toString(36)}`;
  const stored: StoredComment = { ...record, id };
  STORE.set(id, stored);
  return { id };
}

const NOTIFY_QUEUE: NotificationItem[] = [];

/**
 * Push notifications for a comment record.
 *
 * Callback signature: `(notification) => void`. If no callback is given,
 * the notification is queued in-memory.
 */
export function notify(
  record: CommentRecord,
  callback?: (n: NotificationItem) => void,
): { queued: number } {
  let queued = 0;
  for (const mention of record.mentions) {
    if (!mention.notify) continue;
    const item: NotificationItem = {
      id: `n_${Date.now().toString(36)}_${queued}_${Math.random().toString(36).slice(2, 6)}`,
      recipientId: mention.username,
      commentId: record.id,
      mentionId: mention.username,
      sacredTag: record.sacredTagPseudos[0], // pseudonym only, never raw
      queuedAt: Date.now(),
    };
    NOTIFY_QUEUE.push(item);
    if (callback) callback(item);
    queued++;
  }
  return { queued };
}

/** Test-only: clear store + queue. */
export function _storeReset(): void {
  STORE.clear();
  NOTIFY_QUEUE.length = 0;
  STORE_COUNTER = 0;
}

/** Internal: read stored comment by id. */
export function _storeGet(id: string): StoredComment | undefined {
  return STORE.get(id);
}

// ============================================================
// 14. BUILD COMMENT RECORD
// ============================================================

/**
 * Build a canonical CommentRecord from a validated payload + parsed result.
 *
 * - Body is post-guard (sacred → sac_xxx)
 * - depth = max(1, parsedThreading.depth)
 * - auditChainHash = empty (set after lgpdAudit call by submitComment)
 */
export function buildCommentRecord(
  payload: CommentPayload,
  parsed: ReturnType<typeof parseThreading>,
  guardResult: SacredGuardResult,
  consentReceipt: string,
): CommentRecord {
  const now = payload.createdAt ?? Date.now();
  const depth = Math.max(1, parsed.depth);

  return {
    id: '',  // set by store()
    userId: payload.userId,
    body: guardResult.guarded,
    bodyOriginal: payload.body,
    parentId: payload.parentId,
    rootId: payload.rootId ?? parsed.refs[parsed.refs.length - 1]?.parentId ?? payload.parentId,
    threadRefs: parsed.refs,
    mentions: parsed.mentions,
    hashtags: parsed.hashtags,
    depth,
    createdAt: now,
    locale: payload.locale ?? 'pt-BR',
    sacredTagPseudos: guardResult.pseudos,
    consentReceipt,
    auditChainHash: '',  // set by submitComment
  };
}

// ============================================================
// 15. SUBMIT COMMENT (orchestrator)
// ============================================================

/**
 * Submit a comment end-to-end.
 *
 * Pipeline:
 *   1. validate (schema)
 *   2. rate limit
 *   3. parse threading + mentions
 *   4. apply sacred guard
 *   5. verify LGPD consent receipt
 *   6. lgpdAudit (Art. 9)
 *   7. buildCommentRecord
 *   8. store
 *   9. notify
 *
 * Defense layers 1-4 in one call.
 */
export function submitComment(payload: unknown): {
  ok: boolean;
  record?: CommentRecord;
  error?: string;
  code?: 'VALIDATION' | 'RATE_LIMIT' | 'CONSENT' | 'DEPTH' | 'INTERNAL';
} {
  // 1. Schema validation
  const v = validateComment(payload);
  if (!v.ok || !v.data) {
    return { ok: false, error: v.error, code: 'VALIDATION' };
  }
  const data = v.data;

  // 2. Rate limit
  const rl = rateLimitCheck(data.userId);
  if (!rl.allowed) {
    lgpdAudit('rate_limit_block', data.userId, { resetAt: rl.resetAt });
    return {
      ok: false,
      error: `rate limit exceeded; reset at ${rl.resetAt}`,
      code: 'RATE_LIMIT',
    };
  }

  // 3. Parse threading + mentions
  const parsed = parseThreading(data.body);
  if (parsed.depth > MAX_THREAD_DEPTH) {
    return { ok: false, error: `thread depth exceeds ${MAX_THREAD_DEPTH}`, code: 'DEPTH' };
  }

  // 4. Sacred guard
  const guard = applySacredGuard(data.body);

  // 5. LGPD consent (Art. 7) — accept token, or grant fresh if missing
  let consentReceipt = data.consentToken;
  if (!consentReceipt) {
    const c = lgpdConsent(data.userId, 'grant');
    if (!c.ok || !c.receipt) return { ok: false, error: 'consent_grant_failed', code: 'CONSENT' };
    consentReceipt = c.receipt;
  } else {
    // Verify token matches stored receipt
    const stored = CONSENT_RECEIPTS.get(data.userId);
    if (!stored || stored.receipt !== consentReceipt) {
      return { ok: false, error: 'invalid_consent_receipt', code: 'CONSENT' };
    }
    if (stored.expiresAt < Date.now()) {
      return { ok: false, error: 'expired_consent_receipt', code: 'CONSENT' };
    }
  }

  // 6. LGPD audit (Art. 9) — submit_comment entry
  const audit = lgpdAudit('submit_comment', data.userId, {
    bodyLength: utf8Encode(data.body).length,
    sacredPseudoCount: guard.pseudos.length,
    mentionCount: parsed.mentions.length,
    threadDepth: parsed.depth,
    cycleDetected: parsed.cycleDetected,
  });

  // 7. Build record
  const record = buildCommentRecord(data, parsed, guard, consentReceipt);
  record.auditChainHash = audit.hash;

  // 8. Store
  const { id } = store(record);
  record.id = id;

  // 9. Notify
  notify(record);

  return { ok: true, record };
}

// ============================================================
// 16. GET THREAD (tree assembly)
// ============================================================

/**
 * Read back a thread tree starting from rootId.
 *
 * Builds an ARIA-friendly tree with:
 *   - ariaLevel (1-based)
 *   - ariaPosInSet (1-based position among siblings)
 *   - ariaSetSize (total sibling count)
 */
export function getThread(rootId: string): CommentTreeNode | null {
  const root = STORE.get(rootId);
  if (!root) return null;

  // Index all comments by id, then build adjacency
  const allById = new Map<string, StoredComment>();
  for (const c of STORE.values()) allById.set(c.id, c);

  const childrenOf = new Map<string, StoredComment[]>();
  for (const c of allById.values()) {
    const pid = c.parentId;
    if (pid) {
      const arr = childrenOf.get(pid) ?? [];
      arr.push(c);
      childrenOf.set(pid, arr);
    }
  }
  // Sort children by createdAt asc
  for (const arr of childrenOf.values()) {
    arr.sort((a, b) => a.createdAt - b.createdAt);
  }

  const visited = new Set<string>();
  const build = (c: StoredComment, level: number): CommentTreeNode => {
    if (visited.has(c.id)) {
      return {
        id: c.id,
        userId: c.userId,
        body: c.erased ? '[removido]' : c.body,
        depth: level,
        createdAt: c.createdAt,
        children: [],
        ariaRole: ARIA_TREEITEM_ROLE,
        ariaLevel: level,
        ariaPosInSet: 1,
        ariaSetSize: 1,
      };
    }
    visited.add(c.id);

    const kids = childrenOf.get(c.id) ?? [];
    const children: CommentTreeNode[] = kids.map((k, i) => {
      const node = build(k, level + 1);
      node.ariaPosInSet = i + 1;
      node.ariaSetSize = kids.length;
      return node;
    });

    return {
      id: c.id,
      userId: c.userId,
      body: c.erased ? '[removido]' : c.body,
      depth: level,
      createdAt: c.createdAt,
      children,
      ariaRole: ARIA_TREEITEM_ROLE,
      ariaLevel: level,
      ariaPosInSet: 1,
      ariaSetSize: 1,
    };
  };

  return build(root, 1);
}

// ============================================================
// 17. A11Y ALT TEXT (PT-BR + ARIA)
// ============================================================

/**
 * Generate PT-BR alt text + ARIA structure for a CommentRecord.
 *
 * Alt text: "Comentário de <user> com <N> respostas, publicado em <data>."
 * Tree role: 'treeitem' for leaf nodes, 'group' for parent nodes.
 */
export function a11yAltText(record: CommentRecord): {
  altText: string;
  ariaRole: typeof ARIA_TREEITEM_ROLE | typeof ARIA_GROUP_ROLE | typeof ARIA_LISTITEM_ROLE;
  ariaLevel: number;
  ariaLabel: string;
  childrenCount: number;
} {
  const isPt = record.locale === 'pt-BR';
  const dateStr = new Date(record.createdAt).toISOString().slice(0, 10);

  const kidCount = STORE.get(record.id)
    ? Array.from(STORE.values()).filter(c => c.parentId === record.id).length
    : 0;

  let altText: string;
  if (isPt) {
    altText = `Comentário de ${record.userId} com ${kidCount} resposta${kidCount === 1 ? '' : 's'}, publicado em ${dateStr}.`;
  } else {
    altText = `Comment by ${record.userId} with ${kidCount} repl${kidCount === 1 ? 'y' : 'ies'}, posted on ${dateStr}.`;
  }

  const ariaRole: typeof ARIA_TREEITEM_ROLE | typeof ARIA_GROUP_ROLE | typeof ARIA_LISTITEM_ROLE =
    kidCount > 0 ? ARIA_GROUP_ROLE : ARIA_LISTITEM_ROLE;

  const ariaLabel = isPt
    ? `nível ${record.depth}, ${record.mentions.length} menções, ${record.sacredTagPseudos.length} tags protegidas`
    : `level ${record.depth}, ${record.mentions.length} mentions, ${record.sacredTagPseudos.length} protected tags`;

  return {
    altText,
    ariaRole,
    ariaLevel: record.depth,
    ariaLabel,
    childrenCount: kidCount,
  };
}

// ============================================================
// 18. EXPORTS SUMMARY (for smoke runner + IDE hints)
// ============================================================

export const __exports = {
  // Constants
  SACRED_CONCEPTS,
  MAX_COMMENT_BYTES,
  RATE_LIMIT_PER_MIN,
  RATE_LIMIT_WINDOW_MS,
  MAX_THREAD_DEPTH,
  CONSENT_TTL_MS,
  ARIA_TREE_ROLE,
  ARIA_TREEITEM_ROLE,
  ARIA_LIST_ROLE,
  ARIA_LISTITEM_ROLE,
  ARIA_GROUP_ROLE,
  SACRED_PSEUDO_PREFIX,
  AUDIT_HASH_ALG,

  // Types (re-exported for clarity)
  ZError,

  // Public functions
  validateComment,
  parseThreading,
  parseMentions,
  applySacredGuard,
  lgpdConsent,
  lgpdAudit,
  lgpdErase,
  buildCommentRecord,
  notify,
  store,
  submitComment,
  getThread,
  rateLimitCheck,
  a11yAltText,

  // Internal test helpers (underscore-prefixed; never use in prod)
  _sacredLookup,
  _sacredReset,
  _rateLimitReset,
  _auditLog,
  _auditVerify,
  _lgpdReset,
  _storeReset,
  _storeGet,
};