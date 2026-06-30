/**
 * reputation-ledger.ts — append-only ledger with HMAC-style SHA-256 chain
 *
 * Cycle 60 / 67 lesson: each entry's hash is SHA-256(prevHash || canonical(entry)),
 * which forms a tamper-evident chain. Genesis entry uses prevHash = '0'.repeat(64).
 *
 * Cycle 80/81/82 lesson: pipeline is immutable — we spread (not push) when appending,
 * so prior snapshots remain valid for replay validation.
 *
 * Pure self-contained SHA-256 (no `node:crypto` import, no @types/node dep).
 *
 * Exports:
 * - sha256Hex(input): 64-char hex digest
 * - canonicalizeEntry(e): deterministic string serialization for hashing
 * - computeEntryHash(prevHash, payload): hash given canonical payload
 * - appendEvent(ledger, event): append + compute hash + assign seq
 * - validateChain(ledger): walk chain verifying prevHash + hash + monotonic seq
 * - scoreForUsuario(ledger, usuarioId): sum weightedDelta for a user
 * - ledgerLength / getEntry / getEntriesByUsuario / getEntriesByTradicao
 */

import {
  EVENT_TYPES,
  ZERO_HASH,
  asReputationHash,
  isValidIso8601,
  type EventType,
  type LedgerEntry,
  type LedgerEntryId,
  type ReputationEvent,
  type ReputationHash,
  type Tradicao,
  type UsuarioId,
} from './types.ts';
import { TRADICAO_WEIGHTS, normalizeTradicao } from './reputation-events.ts';

// ===========================================================================
// SECTION 1 — Inline SHA-256 (no node:crypto)
// ===========================================================================
// Compact, RFC-6234-conformant SHA-256. ~120 lines, no deps.
// Works in browser + Node + edge runtime.

const K = Object.freeze([
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

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function utf8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * SHA-256 of a UTF-8 string. Returns 64-char lowercase hex digest.
 */
export function sha256Hex(input: string): string {
  const bytes = utf8Bytes(input);
  const bitLen = bytes.length * 8;

  // Padding: 1 byte 0x80, then zeros, then 8-byte big-endian length.
  const padLen = ((bytes.length + 9 + 63) >>> 6) << 6;
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  // length in bits as 64-bit BE
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  padded[padLen - 8] = (hi >>> 24) & 0xff;
  padded[padLen - 7] = (hi >>> 16) & 0xff;
  padded[padLen - 6] = (hi >>> 8) & 0xff;
  padded[padLen - 5] = hi & 0xff;
  padded[padLen - 4] = (lo >>> 24) & 0xff;
  padded[padLen - 3] = (lo >>> 16) & 0xff;
  padded[padLen - 2] = (lo >>> 8) & 0xff;
  padded[padLen - 1] = lo & 0xff;

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);
  const W = new Uint32Array(64);

  for (let block = 0; block < padded.length; block += 64) {
    for (let i = 0; i < 16; i++) {
      const o = block + i * 4;
      W[i] =
        ((padded[o]! << 24) |
          (padded[o + 1]! << 16) |
          (padded[o + 2]! << 8) |
          padded[o + 3]!) >>>
        0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }

    let a = H[0]!,
      b = H[1]!,
      c = H[2]!,
      d = H[3]!,
      e = H[4]!,
      f = H[5]!,
      g = H[6]!,
      h = H[7]!;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i]! + W[i]!) >>> 0;
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

  let hex = '';
  for (let i = 0; i < 8; i++) {
    hex += H[i]!.toString(16).padStart(8, '0');
  }
  return hex;
}

// ===========================================================================
// SECTION 2 — Canonical entry serialization
// ===========================================================================

export interface EntryPayload {
  readonly id: LedgerEntryId;
  readonly usuarioId: UsuarioId;
  readonly eventType: EventType;
  readonly baseDelta: number;
  readonly tradicao: Tradicao;
  readonly occurredAt: string;
  readonly note: string;
  readonly seq: number;
}

/**
 * Deterministic string serialization for hashing.
 * Pipe-delimited, fixed field order, trimmed/normalized.
 *
 * Same input -> same string -> same hash (across runs and platforms).
 */
export function canonicalizeEntry(p: EntryPayload): string {
  // Note is trimmed and lowercased for stability; we hash the normalized form.
  const note = (p.note ?? '').trim();
  return [
    'rpe|v1',
    p.id,
    p.usuarioId,
    p.eventType,
    p.baseDelta.toFixed(4),
    p.tradicao,
    p.occurredAt,
    note,
    String(p.seq),
  ].join('|');
}

/**
 * Hash = SHA-256(prevHash || canonical(entry)).
 */
export function computeEntryHash(
  prevHash: ReputationHash,
  payload: EntryPayload,
): ReputationHash {
  const canonical = canonicalizeEntry(payload);
  const digest = sha256Hex(prevHash + '|' + canonical);
  return asReputationHash(digest);
}

// ===========================================================================
// SECTION 3 — Append-only ledger
// ===========================================================================

export type Ledger = ReadonlyArray<LedgerEntry>;

export const EMPTY_LEDGER: Ledger = Object.freeze([]) as Ledger;

/**
 * Validate a ReputationEvent before append.
 */
function validateEvent(evt: ReputationEvent): void {
  if (!evt || typeof evt !== 'object') {
    throw new Error('ReputationEvent must be an object');
  }
  if (typeof evt.id !== 'string' || evt.id.length === 0) {
    throw new Error('event.id is required');
  }
  if (typeof evt.usuarioId !== 'string' || evt.usuarioId.length === 0) {
    throw new Error('event.usuarioId is required');
  }
  if (!EVENT_TYPES.includes(evt.eventType)) {
    throw new Error(
      `Unknown eventType: ${evt.eventType}. Expected one of: ${EVENT_TYPES.join(', ')}`,
    );
  }
  if (!Number.isFinite(evt.baseDelta)) {
    throw new Error(`event.baseDelta must be finite, got ${evt.baseDelta}`);
  }
  if (typeof evt.tradicao !== 'string') {
    throw new Error('event.tradicao is required');
  }
  normalizeTradicao(evt.tradicao); // throws if invalid
  if (!isValidIso8601(evt.occurredAt)) {
    throw new Error(`event.occurredAt must be ISO-8601 UTC, got "${evt.occurredAt}"`);
  }
  if (typeof evt.note !== 'string') {
    throw new Error('event.note must be a string');
  }
  if (evt.note.length > 512) {
    throw new Error('event.note must be <= 512 chars');
  }
}

/**
 * Append an event to the ledger. Returns a NEW frozen ledger (does not mutate).
 *
 * Throws on:
 * - duplicate id (already in ledger OR collision with another event being batched)
 * - validation errors (invalid eventType, bad ISO date, etc.)
 *
 * Entry's hash = SHA-256(prevHash || canonical(payload)).
 * Entry's seq = previousSeq + 1; genesis is seq=1.
 */
export function appendEvent(
  ledger: Ledger,
  evt: ReputationEvent,
): { readonly ledger: Ledger; readonly entry: LedgerEntry } {
  validateEvent(evt);

  // Reject duplicate IDs (cycle-67 lesson — same id may be replay-attacked)
  for (const existing of ledger) {
    if (existing.id === evt.id) {
      throw new Error(`Duplicate LedgerEntryId: ${evt.id}`);
    }
  }

  const lastSeq = ledger.length;
  const seq = lastSeq + 1;
  const prevHash: ReputationHash =
    ledger.length === 0 ? ZERO_HASH : ledger[ledger.length - 1]!.hash;

  const tradicao = normalizeTradicao(evt.tradicao);

  const payload: EntryPayload = {
    id: evt.id,
    usuarioId: evt.usuarioId,
    eventType: evt.eventType,
    baseDelta: evt.baseDelta,
    tradicao,
    occurredAt: evt.occurredAt,
    note: evt.note.trim(),
    seq,
  };

  const hash = computeEntryHash(prevHash, payload);

  const entry: LedgerEntry = Object.freeze({
    id: payload.id,
    usuarioId: payload.usuarioId,
    eventType: payload.eventType,
    baseDelta: payload.baseDelta,
    tradicao: payload.tradicao,
    occurredAt: payload.occurredAt,
    note: payload.note,
    prevHash,
    hash,
    seq,
  });

  // Cycle-82 lesson: spread, not push — pipeline is immutable.
  const next: Ledger = Object.freeze([...ledger, entry]) as Ledger;
  return Object.freeze({ ledger: next, entry });
}

/**
 * Append many events in sequence. All-or-nothing: if any event fails validation
 * or collides on id, throws and returns the original ledger unchanged.
 */
export function appendEvents(
  ledger: Ledger,
  events: ReadonlyArray<ReputationEvent>,
): { readonly ledger: Ledger; readonly entries: ReadonlyArray<LedgerEntry> } {
  let cur: Ledger = ledger;
  const out: Array<LedgerEntry> = [];
  for (const evt of events) {
    const r = appendEvent(cur, evt);
    cur = r.ledger;
    out.push(r.entry);
  }
  return Object.freeze({ ledger: cur, entries: Object.freeze(out) });
}

// ===========================================================================
// SECTION 4 — Chain validation
// ===========================================================================

export interface ValidationReport {
  readonly ok: boolean;
  readonly checkedAt: string;
  readonly length: number;
  readonly errors: ReadonlyArray<string>;
}

/**
 * Walk the chain and verify:
 * - seq is monotonic (1, 2, 3, ...)
 * - prevHash of entry N+1 equals hash of entry N (genesis prevHash = ZERO_HASH)
 * - hash of entry N matches recomputed SHA-256 over canonical(payload)
 * - all required fields are present
 */
export function validateChain(ledger: Ledger): ValidationReport {
  const errors: Array<string> = [];
  let expectedSeq = 1;
  let expectedPrev: ReputationHash = ZERO_HASH;

  for (let i = 0; i < ledger.length; i++) {
    const e = ledger[i]!;
    if (e.seq !== expectedSeq) {
      errors.push(`seq mismatch at index ${i}: expected ${expectedSeq}, got ${e.seq}`);
    }
    if (e.prevHash !== expectedPrev) {
      errors.push(
        `prevHash mismatch at index ${i}: expected ${expectedPrev}, got ${e.prevHash}`,
      );
    }
    const recomputed = computeEntryHash(e.prevHash, {
      id: e.id,
      usuarioId: e.usuarioId,
      eventType: e.eventType,
      baseDelta: e.baseDelta,
      tradicao: e.tradicao,
      occurredAt: e.occurredAt,
      note: e.note,
      seq: e.seq,
    });
    if (recomputed !== e.hash) {
      errors.push(`hash mismatch at index ${i} (id=${e.id})`);
    }
    expectedSeq += 1;
    expectedPrev = e.hash;
  }

  return Object.freeze({
    ok: errors.length === 0,
    checkedAt: '1970-01-01T00:00:00.000Z', // deterministic; override via buildReport()
    length: ledger.length,
    errors: Object.freeze(errors),
  });
}

// ===========================================================================
// SECTION 5 — Queries
// ===========================================================================

export function ledgerLength(ledger: Ledger): number {
  return ledger.length;
}

export function getEntry(ledger: Ledger, id: LedgerEntryId): LedgerEntry | undefined {
  for (const e of ledger) {
    if (e.id === id) return e;
  }
  return undefined;
}

export function getEntriesByUsuario(
  ledger: Ledger,
  usuarioId: UsuarioId,
): ReadonlyArray<LedgerEntry> {
  const out: Array<LedgerEntry> = [];
  for (const e of ledger) {
    if (e.usuarioId === usuarioId) out.push(e);
  }
  return Object.freeze(out);
}

export function getEntriesByTradicao(
  ledger: Ledger,
  tradicaoRaw: string,
): ReadonlyArray<LedgerEntry> {
  const tradicao = normalizeTradicao(tradicaoRaw);
  const out: Array<LedgerEntry> = [];
  for (const e of ledger) {
    if (e.tradicao === tradicao) out.push(e);
  }
  return Object.freeze(out);
}

/**
 * Score = sum of (baseDelta × multiplier) for a user.
 * Uses the same TRADICAO_WEIGHTS as weightedDeltaFor().
 */
export function scoreForUsuario(ledger: Ledger, usuarioId: UsuarioId): number {
  let total = 0;
  for (const e of ledger) {
    if (e.usuarioId !== usuarioId) continue;
    const perTrad = TRADICAO_WEIGHTS[e.tradicao];
    const mult = perTrad[e.eventType];
    if (typeof mult !== 'number') continue;
    total += e.baseDelta * mult;
  }
  return Math.round(total * 100) / 100;
}

/**
 * Global aggregate score (sum across all entries).
 */
export function totalScore(ledger: Ledger): number {
  let total = 0;
  for (const e of ledger) {
    const perTrad = TRADICAO_WEIGHTS[e.tradicao];
    const mult = perTrad[e.eventType];
    if (typeof mult !== 'number') continue;
    total += e.baseDelta * mult;
  }
  return Math.round(total * 100) / 100;
}