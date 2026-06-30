// ============================================================================
// W73 — AUDIT LOG ENGINE
// ----------------------------------------------------------------------------
// Append-only LGPD-grade audit log for moderation actions. Every moderation
// decision (submit, classify, claim, resolve, etc.) flows through here.
//
// LGPD guarantees:
//   - No raw PII stored: IP and User-Agent are SHA-256 hashed at insertion.
//   - All entries form a SHA-256 hash chain (canonical JSON, cycle 67 lesson).
//   - Chain integrity verifiable via verifyHashChain().
//   - Data export is ADMIN-only (cycle 60+ lesson).
//
// Self-contained: in-memory store, no Prisma, no external deps.
// Smoke runner: node --experimental-strip-types smoke.ts
// ============================================================================

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type UserId = string & { readonly __brand: 'UserId' };
export type AuditId = string & { readonly __brand: 'AuditId' };

export type ActorRole = 'user' | 'moderator' | 'admin' | 'system';

export type AuditAction =
  | 'report-submitted'
  | 'report-classified'
  | 'report-claimed'
  | 'report-resolved'
  | 'content-hidden'
  | 'content-removed'
  | 'user-warned'
  | 'user-banned'
  | 'user-unbanned'
  | 'sacred-recontextualized'
  | 'audit-exported';

export type AuditTargetType =
  | 'content'
  | 'report'
  | 'user'
  | 'tradition'
  | 'audit-export';

export interface AuditEntry {
  id: AuditId;
  actorId: UserId;
  actorRole: ActorRole;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  payload: Readonly<Record<string, unknown>>;
  ipHash: string;        // SHA-256 of remote IP (no raw IP)
  userAgentHash: string; // SHA-256 of UA (no raw UA)
  createdAt: number;
  hashChain: string;     // SHA-256 of (prev_hash || canonical_json(this))
}

export interface AuditFilter {
  actorId?: UserId;
  action?: AuditAction;
  targetType?: AuditTargetType;
  targetId?: string;
  fromMs?: number;
  toMs?: number;
}

export interface Pagination {
  offset: number;
  limit: number;
}

export interface AuditPage {
  entries: AuditEntry[];
  total: number;
  hasMore: boolean;
}

export interface AuditError {
  code:
    | 'NOT_FOUND'
    | 'INVALID_INPUT'
    | 'PERMISSION_DENIED'
    | 'INVALID_RANGE'
    | 'STORAGE_ERROR'
    | 'EXPORT_FAILED';
  message: string;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// ────────────────────────────────────────────────────────────────────────────
// Storage
// ────────────────────────────────────────────────────────────────────────────

const AUDIT_STORE: Map<string, AuditEntry> = new Map();
let AUDIT_COUNTER = 0;
let CHAIN_GENESIS = ''; // first entry's prev_hash = genesis (empty SHA-256 input)

function nextAuditId(): AuditId {
  AUDIT_COUNTER += 1;
  return `aud_${Date.now().toString(36)}_${AUDIT_COUNTER.toString(36)}` as AuditId;
}

/**
 * Idempotent storage reset for test/smoke isolation.
 */
export function __resetAuditStore(): void {
  AUDIT_STORE.clear();
  AUDIT_COUNTER = 0;
  CHAIN_GENESIS = '';
}

// ────────────────────────────────────────────────────────────────────────────
// SHA-256 (uses WebCrypto if available, falls back to synchronous hash)
// ────────────────────────────────────────────────────────────────────────────

// Lightweight, deterministic SHA-256 implementation for hash chain.
// Avoids webcrypto's async requirement; cycle 67 lesson: deterministic chain
// must use synchronous crypto to maintain order.
export function sha256Hex(input: string): string {
  const out = sha256Bytes(textToBytes(input));
  let s = '';
  for (let i = 0; i < out.length; i += 1) {
    s += out[i].toString(16).padStart(2, '0');
  }
  return s;
}

function textToBytes(s: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) {
      out.push(0xc0 | (c >> 6));
      out.push(0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12));
      out.push(0x80 | ((c >> 6) & 0x3f));
      out.push(0x80 | (c & 0x3f));
    } else {
      i += 1;
      const u = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff));
      out.push(0xf0 | (u >> 18));
      out.push(0x80 | ((u >> 12) & 0x3f));
      out.push(0x80 | ((u >> 6) & 0x3f));
      out.push(0x80 | (u & 0x3f));
    }
  }
  return new Uint8Array(out);
}

function sha256Bytes(bytes: Uint8Array): Uint8Array {
  const K = [
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
  ];
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const len = bytes.length;
  const padLen = (((len + 9 + 63) >> 6) << 6);
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[len] = 0x80;
  // length in bits as 64-bit big-endian (use plain Number — sufficient for any realistic chain)
  const bitLenLow = (len * 8) >>> 0;
  const bitLenHigh = Math.floor((len * 8) / 0x100000000) >>> 0;
  for (let i = 0; i < 4; i += 1) padded[padLen - 1 - i] = (bitLenHigh >>> (8 * (3 - i))) & 0xff;
  for (let i = 0; i < 4; i += 1) padded[padLen - 5 - i] = (bitLenLow >>> (8 * (3 - i))) & 0xff;

  for (let off = 0; off < padLen; off += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i += 1) {
      const j = off + i * 4;
      w[i] = (padded[j] << 24) | (padded[j + 1] << 16) | (padded[j + 2] << 8) | padded[j + 3];
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = ror(w[i - 15], 7) ^ ror(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = ror(w[i - 2], 17) ^ ror(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i += 1) {
      const S1 = ror(e, 6) ^ ror(e, 11) ^ ror(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const hs = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < 8; i += 1) {
    out[i * 4] = (hs[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (hs[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (hs[i] >>> 8) & 0xff;
    out[i * 4 + 3] = hs[i] & 0xff;
  }
  return out;
}

function ror(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

// ────────────────────────────────────────────────────────────────────────────
// Canonical JSON (sorted keys — cycle 67 lesson)
// ────────────────────────────────────────────────────────────────────────────

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v !== null && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) out[k] = sortKeys(obj[k]);
    return out;
  }
  if (typeof v === 'bigint') return v.toString();
  return v;
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function ok<T>(value: T): Result<T, AuditError> {
  return { ok: true, value };
}
function err(code: AuditError['code'], message: string): Result<never, AuditError> {
  return { ok: false, error: { code, message } };
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

/**
 * Append an audit entry to the immutable chain. Every entry includes:
 *   - frozen payload (LGPD: no mutation after insert)
 *   - SHA-256 of IP / UA (no raw PII)
 *   - SHA-256 hash chain link to the previous entry
 *
 * Returns the frozen entry with computed fields.
 */
export function appendAudit(
  entry: (
    | (Omit<AuditEntry, 'id' | 'createdAt' | 'hashChain' | 'ipHash' | 'userAgentHash'> & { ip?: string; userAgent?: string })
    | (Omit<AuditEntry, 'id' | 'createdAt' | 'hashChain'> & { ip?: string; userAgent?: string })
  ),
): Result<AuditEntry, AuditError> {
  // input validation
  if (!entry.actorId) return err('INVALID_INPUT', 'actorId required');
  if (!entry.actorRole) return err('INVALID_INPUT', 'actorRole required');
  if (!entry.action) return err('INVALID_INPUT', 'action required');
  if (!entry.targetType) return err('INVALID_INPUT', 'targetType required');
  if (!entry.targetId) return err('INVALID_INPUT', 'targetId required');

  // freeze payload (LGPD: immutable after insert)
  const frozenPayload = Object.freeze({ ...(entry.payload ?? {}) });

  // hash IP and UA (LGPD: never store raw)
  const ipHash = sha256Hex(entry.ip ?? '');
  const userAgentHash = sha256Hex(entry.userAgent ?? '');

  // determine prev_hash
  const sorted = Array.from(AUDIT_STORE.values()).sort(
    (a, b) => a.createdAt - b.createdAt,
  );
  const prev = sorted[sorted.length - 1];
  const prevHash = prev ? prev.hashChain : CHAIN_GENESIS;

  const id = nextAuditId();
  const createdAt = Date.now();
  const partial = {
    id, actorId: entry.actorId, actorRole: entry.actorRole, action: entry.action,
    targetType: entry.targetType, targetId: entry.targetId, payload: frozenPayload,
    ipHash, userAgentHash, createdAt,
  };
  const hashChain = sha256Hex(prevHash + canonicalJson(partial));
  const full: AuditEntry = { ...partial, hashChain };

  AUDIT_STORE.set(id, full);
  return ok(full);
}

/**
 * Walk the chain from startId to endId and verify the SHA-256 links.
 * Returns isValid + first broken entry, or an error if range is invalid.
 */
export function verifyHashChain(
  startId: AuditId,
  endId: AuditId,
): Result<{ isValid: boolean; brokenAt: AuditId | null }, AuditError> {
  const sorted = Array.from(AUDIT_STORE.values()).sort(
    (a, b) => a.createdAt - b.createdAt,
  );

  if (sorted.length === 0) return ok({ isValid: true, brokenAt: null });

  const startIdx = sorted.findIndex((e) => e.id === startId);
  const endIdx = sorted.findIndex((e) => e.id === endId);
  if (startIdx === -1 || endIdx === -1) {
    return err('NOT_FOUND', `start or end id not found: ${startId} / ${endId}`);
  }
  if (startIdx > endIdx) {
    return err('INVALID_RANGE', `startId is after endId`);
  }

  let prevHash = startIdx === 0 ? CHAIN_GENESIS : sorted[startIdx - 1].hashChain;
  for (let i = startIdx; i <= endIdx; i += 1) {
    const e = sorted[i];
    const partial = {
      id: e.id, actorId: e.actorId, actorRole: e.actorRole, action: e.action,
      targetType: e.targetType, targetId: e.targetId, payload: e.payload,
      ipHash: e.ipHash, userAgentHash: e.userAgentHash, createdAt: e.createdAt,
    };
    const expected = sha256Hex(prevHash + canonicalJson(partial));
    if (expected !== e.hashChain) {
      return ok({ isValid: false, brokenAt: e.id });
    }
    prevHash = e.hashChain;
  }
  return ok({ isValid: true, brokenAt: null });
}

/**
 * List audit entries matching a filter + pagination.
 */
export function listAuditEntries(
  filter: AuditFilter,
  pagination: Pagination,
): Result<AuditPage, AuditError> {
  const arr = Array.from(AUDIT_STORE.values())
    .filter((e) => {
      if (filter.actorId && e.actorId !== filter.actorId) return false;
      if (filter.action && e.action !== filter.action) return false;
      if (filter.targetType && e.targetType !== filter.targetType) return false;
      if (filter.targetId && e.targetId !== filter.targetId) return false;
      if (filter.fromMs !== undefined && e.createdAt < filter.fromMs) return false;
      if (filter.toMs !== undefined && e.createdAt > filter.toMs) return false;
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const total = arr.length;
  const entries = arr.slice(pagination.offset, pagination.offset + pagination.limit);
  const hasMore = pagination.offset + pagination.limit < total;
  return ok({ entries, total, hasMore });
}

export function listActorActions(
  actorId: UserId,
  filter: AuditFilter,
): Result<AuditEntry[], AuditError> {
  const arr = Array.from(AUDIT_STORE.values())
    .filter((e) => {
      if (e.actorId !== actorId) return false;
      if (filter.action && e.action !== filter.action) return false;
      if (filter.targetType && e.targetType !== filter.targetType) return false;
      if (filter.fromMs !== undefined && e.createdAt < filter.fromMs) return false;
      if (filter.toMs !== undefined && e.createdAt > filter.toMs) return false;
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  return ok(arr);
}

export function listTargetActions(
  targetType: string,
  targetId: string,
  filter: AuditFilter,
): Result<AuditEntry[], AuditError> {
  const arr = Array.from(AUDIT_STORE.values())
    .filter((e) => {
      if (e.targetType !== targetType) return false;
      if (e.targetId !== targetId) return false;
      if (filter.actorId && e.actorId !== filter.actorId) return false;
      if (filter.action && e.action !== filter.action) return false;
      if (filter.fromMs !== undefined && e.createdAt < filter.fromMs) return false;
      if (filter.toMs !== undefined && e.createdAt > filter.toMs) return false;
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  return ok(arr);
}

/**
 * Export the audit trail (admin-only). Returns serialized JSON or CSV.
 *
 * LGPD-grade export: includes ONLY entries within the filter range, with
 * frozen payload preserved. Each call to this function emits a "audit-exported"
 * entry of its own (cycle 60+ lesson: every export is auditable).
 */
export function exportAuditTrail(
  filter: AuditFilter,
  format: 'json' | 'csv',
  actorId: UserId,
  actorRole: ActorRole,
): Result<string, AuditError> {
  if (actorRole !== 'admin') {
    return err('PERMISSION_DENIED', 'audit export requires admin role');
  }

  const result = listAuditEntries(filter, { offset: 0, limit: 10000 });
  if (!result.ok) return result;

  // record the export itself (auto-audit)
  appendAudit({
    actorId, actorRole, action: 'audit-exported', targetType: 'audit-export',
    targetId: `export_${Date.now().toString(36)}`, payload: {
      exportedCount: result.value.entries.length, format,
    },
  });

  if (format === 'json') {
    return ok(canonicalJson(result.value.entries));
  }

  // CSV format
  const header = 'id,actorId,actorRole,action,targetType,targetId,createdAt,hashChain,ipHash,userAgentHash,payload\n';
  const rows = result.value.entries.map((e) => {
    const payload = JSON.stringify(e.payload).replace(/"/g, '""');
    return [
      e.id, e.actorId, e.actorRole, e.action, e.targetType, e.targetId,
      e.createdAt, e.hashChain, e.ipHash, e.userAgentHash, `"${payload}"`,
    ].join(',');
  }).join('\n');
  return ok(header + rows + '\n');
}

/**
 * Aggregated stats over the last periodDays days.
 */
export function getAuditStats(periodDays: number): Result<{
  total: number;
  byAction: Record<AuditAction, number>;
  byActorRole: Record<string, number>;
}, AuditError> {
  const now = Date.now();
  const cutoff = now - periodDays * 24 * 60 * 60 * 1000;

  const byAction: Record<AuditAction, number> = {
    'report-submitted': 0, 'report-classified': 0, 'report-claimed': 0,
    'report-resolved': 0, 'content-hidden': 0, 'content-removed': 0,
    'user-warned': 0, 'user-banned': 0, 'user-unbanned': 0,
    'sacred-recontextualized': 0, 'audit-exported': 0,
  };
  const byActorRole: Record<string, number> = {
    user: 0, moderator: 0, admin: 0, system: 0,
  };
  let total = 0;
  for (const e of AUDIT_STORE.values()) {
    if (e.createdAt < cutoff) continue;
    total += 1;
    byAction[e.action] += 1;
    byActorRole[e.actorRole] = (byActorRole[e.actorRole] ?? 0) + 1;
  }
  return ok({ total, byAction, byActorRole });
}

// ────────────────────────────────────────────────────────────────────────────
// Audit helpers (smoke)
// ────────────────────────────────────────────────────────────────────────────

export function auditHashChain(): { isValid: boolean; chainLength: number } {
  const all = Array.from(AUDIT_STORE.values()).sort(
    (a, b) => a.createdAt - b.createdAt,
  );
  if (all.length === 0) return { isValid: true, chainLength: 0 };

  let prevHash = CHAIN_GENESIS;
  for (const e of all) {
    const partial = {
      id: e.id, actorId: e.actorId, actorRole: e.actorRole, action: e.action,
      targetType: e.targetType, targetId: e.targetId, payload: e.payload,
      ipHash: e.ipHash, userAgentHash: e.userAgentHash, createdAt: e.createdAt,
    };
    const expected = sha256Hex(prevHash + canonicalJson(partial));
    if (expected !== e.hashChain) {
      return { isValid: false, chainLength: all.length };
    }
    prevHash = e.hashChain;
  }
  return { isValid: true, chainLength: all.length };
}

// Helper to seed audit entries in tests/specs (returns the canonical id).
export function _internal_seededId(seed: number): AuditId {
  return `aud_seed_${seed}_${Math.random().toString(36).slice(2, 8)}` as AuditId;
}

// Factory helpers (mirror moderation-queue).
export const newUserId = (s: string): UserId => s as UserId;
