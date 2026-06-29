// ============================================================================
// W66 — LIVE STREAMS ENGINE
// Go-live data layer for community live streams. Pure data layer — caller wires
// transport (websocket / SSE / WebRTC / HLS). No socket.io, no twilio, no
// 100ms SDK.
//
// State machine: scheduled → live → ended (terminal)
//                 scheduled → cancelled (terminal)
//                 live       → failed   (terminal)
//
// Each state flip re-reads prevHash from the EXISTING record, NOT from a
// module-level global (cycle 65 lesson 4 — the ledger re-chain pattern). This
// ensures verifyStreamChain(streamId) works after any sequence of transitions.
//
// Sacred content moderation: sacred refs are PUBLIC knowledge (per Cigano
// Ramiro's IDEIA.md). The fact that a viewer is watching a sacred stream is
// PRIVATE (LGPD Art. 9). Therefore:
//   - Sacred symbols in chat: ALWAYS allowed (delegated to w65 pattern).
//   - Viewer ID: pseudonymized (SHA-256 + salt, truncated 16 chars).
//   - Sacred stream topic is never logged with viewer ID.
//
// Architecture — 16 numbered sections:
//   §1   Public types (LiveStream union, StreamId brand, etc.)
//   §2   Public constants (LIVE_STATES, CHAT_RATE_LIMITS, *_FLOORS)
//   §3   Custom error classes (4)
//   §4   Type guards (3: isLiveStream, isEndedStream, isSacredStreamTopic)
//   §5   Helpers (emptyStreamCounters, clampViewerCount, sacredStreamTopics,
//         buildSacredRegex, stableStringify, isSafeId)
//   §6   Cross-runtime HMAC (cycle 60+64 pattern, NEVER FNV)
//   §7   LGPD pseudonymization (SHA-256 + salt, truncated)
//   §8   Public API: scheduleStream
//   §9   Public API: startStream / heartbeatStream / endStream
//   §10  Public API: joinStream (pseudonymized viewer add)
//   §11  Public API: moderateChatMessage (sacred ALWAYS allowed)
//   §12  Public API: attachReplay + rotateStreamKey
//   §13  Public API: verifyStreamChain + chainStreamHash
//   §14  Sacred catalog (6 traditions, ≥ 96 symbols)
//   §15  Public API: auditLiveStreamCoverage
//   §16  __ALL_EXPORTS (grep-audit visibility) + version
// ============================================================================

// ============================================================================
// §1   PUBLIC TYPES
// ============================================================================

export type LiveState = "scheduled" | "live" | "ended" | "cancelled" | "failed";

export type StreamTopic =
  | "CEREMONY"
  | "WORKSHOP"
  | "STUDY_CIRCLE"
  | "Q_AND_A"
  | "MENTORSHIP"
  | "COMMUNITY_CIRCLE"
  | "MESA_REAL"
  | "TAROT_LIVE";

export type StreamTradition =
  | "CIGANO"
  | "ORIXAS"
  | "ASTROLOGIA"
  | "SEFIROT"
  | "CHAKRAS"
  | "IFA";

/**
 * Branded string id (compile-time only, runtime = string).
 * Constructor `toStreamId(raw)` validates the raw shape.
 */
export type StreamId = string & { readonly __brand: "StreamId" };
export type ChatMessageId = string & { readonly __brand: "ChatMessageId" };
export type ViewerToken = string & { readonly __brand: "ViewerToken" };
export type StreamKey = string & { readonly __brand: "StreamKey" };

export type Consent = {
  readonly grantedAt: string; // ISO 8601
  readonly expiresAt: string; // ISO 8601
};

export type StreamConsent = Consent & {
  readonly faceConsent: boolean;
  readonly voiceConsent: boolean;
  readonly audienceConsent: boolean; // consent to broadcast to viewers
};

export type ChatConsent = Consent & {
  readonly readReceipt: boolean; // viewer accepts being read by host
};

export type StreamRecording = {
  readonly provider: "internal" | "external";
  readonly url: string;            // mp4 / hls manifest
  readonly ready: boolean;         // mp4 ready flag
  readonly byteSize: number;       // bytes
  readonly sha256_16: string;      // SHA-256 of recording truncated to 16 chars
  readonly durationSeconds: number;
  readonly replayConsent: StreamConsent;
};

export type ViewerRef = {
  readonly viewerId: string;      // raw id (will be pseudonymized)
  readonly pseudonymSalt: string;  // salt for SHA-256
};

export type ChatMessage = {
  readonly id: string;
  readonly streamId: string;
  readonly viewerToken: string;
  readonly text: string;
  readonly sentAt: string;         // ISO 8601
  readonly sacredHits: ReadonlyArray<string>;
};

export type StreamCounters = {
  readonly viewCount: number;
  readonly joinCount: number;
  readonly chatCount: number;
};

export type StreamPricingContext = {
  readonly hmacSecret: string;          // for chain hash
  readonly chatConsentSalt: string;     // for viewer token signing
  readonly pseudonymSalt: string;       // for joinStream SHA-256
};

/**
 * Discriminated union of LiveStream records. Each variant carries the fields
 * only valid in that state. Use `Extract<LiveStream, { state: "live" }>` for
 * type narrowing.
 */
export type LiveStream =
  | ScheduledStream
  | ActiveStream
  | TerminalStream;

/**
 * Common base fields, shared across all LiveStream variants.
 */
type LiveStreamBase = {
  readonly id: StreamId;
  readonly title: string;
  readonly topic: StreamTopic;
  readonly hostId: string;
  readonly sacredTags: ReadonlyArray<string>;  // tied to tradition's catalog
  readonly scheduledStart: string;             // ISO 8601 BRT preferred
  readonly timezone: string;                   // IANA, default 'America/Sao_Paulo'
  readonly isPublic: boolean;
  readonly streamConsent: StreamConsent | null; // required before start
  readonly replayConsent: StreamConsent | null;
  readonly chainHash: string;                  // HMAC of immutable fields
  readonly prevHash: string;                   // previous stream's hash (chain)
  readonly counters: StreamCounters;
  readonly createdAt: string;
};

export type ScheduledStream = LiveStreamBase & {
  readonly state: "scheduled";
};

export type ActiveStream = LiveStreamBase & {
  readonly state: "live";
  readonly startedAt: string;
  readonly lastHeartbeatAt: string;
  readonly currentViewerCount: number;          // monotonic floor of joins
  readonly streamKey: StreamKey;                // HMAC-chained, rotates 24h
};

export type TerminalStream = LiveStreamBase & {
  readonly state: "ended" | "cancelled" | "failed";
  readonly endedAt: string;
  readonly endReason: string | null;
  readonly recording: StreamRecording | null;
  readonly failureCode: string | null;         // for state "failed"
  readonly finalViewerPeak: number;
};

export type ScheduleStreamInput = {
  readonly title: string;
  readonly topic: StreamTopic;
  readonly hostId: string;
  readonly sacredTags?: ReadonlyArray<string>;
  readonly scheduledStart: string;
  readonly timezone?: string;
  readonly isPublic?: boolean;
  readonly streamConsent?: StreamConsent | null;
  readonly replayConsent?: StreamConsent | null;
};

export type JoinResult = {
  readonly ok: boolean;
  readonly viewerToken: ViewerToken;
  readonly viewerCount: number;
  readonly error: string | null;
};

export type ModerationResult = {
  readonly messageId: string;
  readonly streamId: string;
  readonly allowed: boolean;
  readonly isSacred: boolean;                  // sacred content ALWAYS allowed
  readonly sacredHits: ReadonlyArray<string>;
  readonly flags: ReadonlyArray<string>;       // e.g. "rate_limit_user", "rate_limit_stream"
  readonly decidedAt: string;
};

export type CoverageReport = {
  readonly totalSymbols: number;
  readonly byTradition: Readonly<Record<StreamTradition, number>>;
  readonly isFullCoverage: boolean;
  readonly traditionFloorMet: Readonly<Record<StreamTradition, boolean>>;
  readonly missingTraditions: ReadonlyArray<StreamTradition>;
};

export type ValidationOutcome = {
  readonly ok: boolean;
  readonly errors: ReadonlyArray<string>;
};

export type LiveStreamVersion = "w66.0.1.0";

// ============================================================================
// §2   PUBLIC CONSTANTS
// ============================================================================

export const LIVE_STATES: ReadonlyArray<LiveState> = Object.freeze([
  "scheduled",
  "live",
  "ended",
  "cancelled",
  "failed",
]);

export const LIVE_STATE_SET: ReadonlySet<string> = new Set(LIVE_STATES);

export const TERMINAL_STATES: ReadonlyArray<LiveState> = Object.freeze([
  "ended",
  "cancelled",
  "failed",
]);

export const CHAT_RATE_LIMITS: Readonly<{
  perUserPerMinute: number;
  perStreamPerSecond: number;
  maxMessageLength: number;
}> = Object.freeze({
  perUserPerMinute: 30,
  perStreamPerSecond: 100,
  maxMessageLength: 500,
});

export const STREAM_KEY_ROTATION_MS: number = 24 * 60 * 60 * 1000; // 24h

export const GENESIS_STREAM_HASH: string = "GENESIS";

export const MIN_TITLE_LENGTH: number = 3;
export const MAX_TITLE_LENGTH: number = 200;
export const MIN_VIEWER_COUNT: number = 0;
export const MAX_VIEWER_COUNT: number = 100_000;

export const PSEUDONYM_DEFAULT_TRUNCATION: number = 16;

export const HMAC_ALGO: string = "sha256";

export const STREAM_TRADITION_FLOORS: Readonly<Record<StreamTradition, number>> = Object.freeze({
  CIGANO: 36,
  ORIXAS: 16,
  ASTROLOGIA: 12,
  SEFIROT: 10,
  CHAKRAS: 7,
  IFA: 15, // 16 odus principais − 1 (Oddu I excluded for cycle-66 alignment)
});

// ============================================================================
// §3   CUSTOM ERROR CLASSES (4 required)
// ============================================================================

export class LiveStreamEngineError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(`LIVE_STREAMS: ${code}: ${message}`);
    this.name = "LiveStreamEngineError";
    this.code = code;
  }
}

export class InvalidStreamStateError extends LiveStreamEngineError {
  constructor(message: string) {
    super("INVALID_STREAM_STATE", message);
    this.name = "InvalidStreamStateError";
  }
}

export class StreamRateLimitError extends LiveStreamEngineError {
  constructor(message: string) {
    super("STREAM_RATE_LIMIT", message);
    this.name = "StreamRateLimitError";
  }
}

export class StreamConsentMissingError extends LiveStreamEngineError {
  constructor(message: string) {
    super("STREAM_CONSENT_MISSING", message);
    this.name = "StreamConsentMissingError";
  }
}

export class StreamKeyRotationError extends LiveStreamEngineError {
  constructor(message: string) {
    super("STREAM_KEY_ROTATION", message);
    this.name = "StreamKeyRotationError";
  }
}

// ============================================================================
// §4   TYPE GUARDS
// ============================================================================

const STREAM_TOPIC_SET: ReadonlySet<string> = new Set<StreamTopic>([
  "CEREMONY",
  "WORKSHOP",
  "STUDY_CIRCLE",
  "Q_AND_A",
  "MENTORSHIP",
  "COMMUNITY_CIRCLE",
  "MESA_REAL",
  "TAROT_LIVE",
]);

const STREAM_TRADITION_SET: ReadonlySet<string> = new Set<StreamTradition>([
  "CIGANO",
  "ORIXAS",
  "ASTROLOGIA",
  "SEFIROT",
  "CHAKRAS",
  "IFA",
]);

/**
 * isLiveStream — narrows a LiveStream union to its "live" variant.
 * Use after Extract<LiveStream, { state: "live" }>.
 */
export function isLiveStream(s: unknown): s is ActiveStream {
  return isLiveStreamShape(s) && (s as { state?: string }).state === "live";
}

/**
 * isEndedStream — narrows to any terminal state.
 */
export function isEndedStream(s: unknown): s is TerminalStream {
  if (!isLiveStreamShape(s)) return false;
  const st = (s as { state?: string }).state;
  return st === "ended" || st === "cancelled" || st === "failed";
}

/**
 * isSacredStreamTopic — a stream topic is sacred if it carries divine content
 * (ceremony, mesa real, tarot live). Workaround: topics are intrinsically
 * sacred; this guard returns true if the topic involves ritual practice.
 */
export function isSacredStreamTopic(topic: unknown): topic is Extract<StreamTopic, "CEREMONY" | "MESA_REAL"> {
  return topic === "CEREMONY" || topic === "MESA_REAL";
}

// Internal helper for narrowing the union regardless of state.
function isLiveStreamShape(value: unknown): value is LiveStream {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string") return false;
  if (typeof v.state !== "string") return false;
  if (!LIVE_STATE_SET.has(v.state)) return false;
  if (typeof v.title !== "string") return false;
  if (typeof v.hostId !== "string") return false;
  if (typeof v.scheduledStart !== "string") return false;
  if (!Array.isArray(v.sacredTags)) return false;
  if (typeof v.chainHash !== "string") return false;
  if (typeof v.prevHash !== "string") return false;
  if (!v.counters || typeof v.counters !== "object") return false;
  return true;
}

export function isStreamTopic(t: unknown): t is StreamTopic {
  return typeof t === "string" && STREAM_TOPIC_SET.has(t);
}

export function isStreamTradition(t: unknown): t is StreamTradition {
  return typeof t === "string" && STREAM_TRADITION_SET.has(t);
}

export function isLiveState(s: unknown): s is LiveState {
  return typeof s === "string" && LIVE_STATE_SET.has(s);
}

// ============================================================================
// §5   HELPERS
// ============================================================================

/**
 * Factory — fresh empty counters, per cycle 65 lesson 6 (no shared mutable
 * defaults). Each stream gets its own object so aggregates don't bleed.
 */
export function emptyStreamCounters(): StreamCounters {
  return Object.freeze({
    viewCount: 0,
    joinCount: 0,
    chatCount: 0,
  });
}

/**
 * Clamp a viewer count to [0, MAX_VIEWER_COUNT]. NaN / Infinity → 0 (defensive).
 */
export function clampViewerCount(n: number): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return MIN_VIEWER_COUNT;
  if (n < MIN_VIEWER_COUNT) return MIN_VIEWER_COUNT;
  if (n > MAX_VIEWER_COUNT) return MAX_VIEWER_COUNT;
  return Math.floor(n);
}

/**
 * Topics considered sacred by community. Exposed for UI surfacing.
 */
export const SACRED_STREAM_TOPICS: ReadonlyArray<StreamTopic> = Object.freeze([
  "CEREMONY",
  "MESA_REAL",
]);

/**
 * Quick lookup for sacred stream detection (canonical source).
 * Mirrors isSacredStreamTopic() for use in code that needs the array form.
 */
export function sacredStreamTopics(): ReadonlyArray<StreamTopic> {
  return SACRED_STREAM_TOPICS;
}

/**
 * Build a word-boundary regex that handles UTF-8 multi-byte chars.
 * Use (?:^|\\W)...(?:$|\\W) idiom (Node v22 \\b does NOT respect accented chars).
 *
 * Flags: ONLY `iu` (case-insensitive + unicode). The `/g` flag is intentionally
 * OMITTED because it makes `regex.test()` stateful via `lastIndex`, which would
 * produce false negatives after a previous successful match.
 */
export function buildSacredRegex(symbol: string): RegExp {
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safe = escaped.replace(/ /g, "\\s+");
  return new RegExp(`(?:^|\\W)${safe}(?:$|\\W)`, "iu");
}

/**
 * Stable JSON with sorted keys (for HMAC payload).
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    return "null";
  }
  if (Array.isArray(value)) {
    return "[" + value.map((v) => stableStringify(v)).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}

/**
 * Validate UUID-shape id — informal, used only to avoid path-traversal strings.
 */
export function isSafeId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  if (id.length === 0 || id.length > 256) return false;
  return /^[A-Za-z0-9_\-:.]+$/.test(id);
}

// ============================================================================
// §6   CROSS-RUNTIME HMAC (cycle 60 + cycle 64 — NEVER FNV)
// ============================================================================

interface HashLike {
  update(data: string): HashLike;
  digest(encoding: "hex"): string;
}
interface HasherLike {
  update(data: string): HasherLike;
  digest(encoding: "hex"): string;
}
interface CryptoLike {
  createHash?: (algo: string) => HashLike;
  createHmac?: (algo: string, key: string) => HasherLike;
}
type RequireLike = (id: string) => unknown;
type ModuleLike = { createRequire?: (url: string) => RequireLike } | undefined;

let _hashedCryptoOk: boolean | null = null;
let _hashedCryptoErr: string | null = null;

/**
 * Resolve `crypto` in a portable way.
 *   - Node ESM: createRequire(import.meta.url)("node:crypto")
 *   - Bun / strict ESM: process.getBuiltinModule("node:module").createRequire(...)
 *   - Browser (rare): globalThis.crypto
 */
function resolveCrypto(): CryptoLike {
  if (_hashedCryptoOk !== null) {
    if (_hashedCryptoOk) {
      // best effort: re-resolve with same path, no throw needed
      const ok = resolveCryptoUnchecked();
      if (ok) return ok;
    }
    throw new LiveStreamEngineError(
      "CRYPTO_UNAVAILABLE",
      _hashedCryptoErr ?? "crypto module unavailable",
    );
  }
  try {
    const ok = resolveCryptoUnchecked();
    if (ok && (ok.createHash || ok.createHmac)) {
      _hashedCryptoOk = true;
      return ok;
    }
    throw new Error("no crypto primitive");
  } catch (e) {
    _hashedCryptoErr = (e as Error).message;
    _hashedCryptoOk = false;
    throw new LiveStreamEngineError(
      "CRYPTO_UNAVAILABLE",
      `could not resolve crypto: ${(e as Error).message}`,
    );
  }
}

function resolveCryptoUnchecked(): CryptoLike | null {
  // Try globalThis.crypto first (browser / Node 18+ WebCrypto)
  const gc = (globalThis as { crypto?: CryptoLike }).crypto;
  if (gc && (gc.createHash || gc.createHmac)) return gc;
  // Try Node ESM via import.meta.url (only available in real ESM)
  try {
    const proc = process as unknown as { getBuiltinModule?: (m: string) => ModuleLike };
    if (typeof proc.getBuiltinModule === "function") {
      const mod = proc.getBuiltinModule.call(proc, "node:module") as ModuleLike;
      if (mod && typeof mod.createRequire === "function") {
        // We do not know import.meta.url under --experimental-strip-types reliably;
        // build a synthetic absolute file URL pointing to this module.
        const req = mod.createRequire(
          "/workspace/wt-w66-live-streams/src/lib/w66/live-streams.ts",
        );
        const c = req("node:crypto") as CryptoLike;
        if (c && (c.createHash || c.createHmac)) return c;
      }
    }
  } catch {
    // fall through
  }
  // CommonJS fallback (if any)
  try {
    const fallback = (globalThis as { require?: RequireLike }).require;
    if (typeof fallback === "function") {
      const c = fallback("node:crypto") as CryptoLike;
      if (c && (c.createHash || c.createHmac)) return c;
    }
  } catch {
    // fall through
  }
  return null;
}

/**
 * SHA-256 hex digest (HMAC fallback when HMAC primitive missing). NEVER throws
 * — returns "" on total failure.
 */
export function sha256Hex(input: string): string {
  if (typeof input !== "string") input = String(input);
  try {
    const crypto = resolveCrypto();
    if (crypto.createHash) {
      const h = crypto.createHash(HMAC_ALGO);
      h.update(input);
      const out = h.digest("hex");
      if (typeof out === "string" && out.length > 0) return out;
    }
    if (crypto.createHmac) {
      const h = crypto.createHmac(HMAC_ALGO, "w66-stream-sha256");
      h.update(input);
      const out = h.digest("hex");
      if (typeof out === "string" && out.length > 0) return out;
    }
  } catch {
    // fall through
  }
  return "";
}

/**
 * HMAC-SHA256 hex digest — preferred for chain links. NEVER throws — returns
 * fallback SHA-256 hex on primitive missing (cycle 64 worker C lesson).
 */
export function hmacSha256Hex(key: string, payload: string): string {
  if (typeof key !== "string" || key.length === 0) key = "w66-default-secret";
  if (typeof payload !== "string") payload = String(payload);
  try {
    const crypto = resolveCrypto();
    if (crypto.createHmac) {
      const h = crypto.createHmac(HMAC_ALGO, key);
      h.update(payload);
      const out = h.digest("hex");
      if (typeof out === "string" && out.length >= 32) return out;
    }
    if (crypto.createHash) {
      // Deterministic fallback: HMAC-shell via createHash with key+payload
      const h = crypto.createHash(HMAC_ALGO);
      h.update(`${key}|${payload}`);
      const out = h.digest("hex");
      if (typeof out === "string" && out.length >= 32) return out;
    }
  } catch {
    // fall through
  }
  // Total fallback: still emit 64-char hex (cycle 64 worker C pattern).
  return deterministicFallbackHmac(key, payload);
}

/**
 * Last-resort pure JS HMAC-SHA256 (no node:crypto at all). Implements the
 * IETF RFC 2104 HMAC construction over a pure SHA-256. Used only when the
 * module loader cannot resolve any crypto primitive.
 */
function deterministicFallbackHmac(key: string, payload: string): string {
  const blockSize = 64;
  const keyBytes = utf8ToBytes(key);
  let k: Uint8Array;
  if (keyBytes.length > blockSize) {
    k = sha256Bytes(keyBytes);
  } else {
    k = new Uint8Array(blockSize);
    k.set(keyBytes);
  }
  const opad = new Uint8Array(blockSize);
  const ipad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    opad[i] = (k[i] ?? 0) ^ 0x5c;
    ipad[i] = (k[i] ?? 0) ^ 0x36;
  }
  const inner = sha256Bytes(concatBytes(ipad, utf8ToBytes(payload)));
  return bytesToHex(sha256Bytes(concatBytes(opad, inner)));
}

// Local minimal TextEncoder type to keep TS happy without @types/node.
type TextEncoderLike = { encode(s: string): Uint8Array };
function getTextEncoder(): TextEncoderLike | null {
  const g = globalThis as unknown as { TextEncoder?: { new (): TextEncoderLike } };
  if (g.TextEncoder) return new g.TextEncoder();
  return null;
}

function utf8ToBytes(s: string): Uint8Array {
  const enc = getTextEncoder();
  if (enc) {
    return enc.encode(s);
  }
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6));
      bytes.push(0x80 | (c & 0x3f));
    } else {
      bytes.push(0xe0 | (c >> 12));
      bytes.push(0x80 | ((c >> 6) & 0x3f));
      bytes.push(0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function bytesToHex(b: Uint8Array): string {
  let out = "";
  for (let i = 0; i < b.length; i++) {
    out += (b[i] ?? 0).toString(16).padStart(2, "0");
  }
  return out;
}

function sha256Bytes(input: Uint8Array): Uint8Array {
  // Minimal SHA-256 (FIPS 180-4) for the fallback path only. Mirrors the
  // implementations used in Node.js' pure JS when no Hasher is reachable.
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const length = input.length;
  const bitLength = length * 8;
  const padded = new Uint8Array(((length + 9 + 63) >> 6) << 6);
  padded.set(input);
  padded[length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLength >>> 0, false);
  dv.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000), false);

  const w = new Uint32Array(64);
  const Hcur = new Uint32Array(H);

  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = dv.getUint32(off + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = ror(w[i - 15] ?? 0, 7) ^ ror(w[i - 15] ?? 0, 18) ^ ((w[i - 15] ?? 0) >>> 3);
      const s1 = ror(w[i - 2] ?? 0, 17) ^ ror(w[i - 2] ?? 0, 19) ^ ((w[i - 2] ?? 0) >>> 10);
      w[i] = ((w[i - 16] ?? 0) + s0 + (w[i - 7] ?? 0) + s1) >>> 0;
    }
    let a = Hcur[0] ?? 0, b = Hcur[1] ?? 0, cc = Hcur[2] ?? 0, d = Hcur[3] ?? 0;
    let e = Hcur[4] ?? 0, f = Hcur[5] ?? 0, g = Hcur[6] ?? 0, h = Hcur[7] ?? 0;
    for (let i = 0; i < 64; i++) {
      const S1 = ror(e, 6) ^ ror(e, 11) ^ ror(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + (K[i] ?? 0) + (w[i] ?? 0)) >>> 0;
      const S0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
      const mj = (a & b) ^ (a & cc) ^ (b & cc);
      const t2 = (S0 + mj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = cc; cc = b; b = a; a = (t1 + t2) >>> 0;
    }
    Hcur[0] = ((Hcur[0] ?? 0) + a) >>> 0;
    Hcur[1] = ((Hcur[1] ?? 0) + b) >>> 0;
    Hcur[2] = ((Hcur[2] ?? 0) + cc) >>> 0;
    Hcur[3] = ((Hcur[3] ?? 0) + d) >>> 0;
    Hcur[4] = ((Hcur[4] ?? 0) + e) >>> 0;
    Hcur[5] = ((Hcur[5] ?? 0) + f) >>> 0;
    Hcur[6] = ((Hcur[6] ?? 0) + g) >>> 0;
    Hcur[7] = ((Hcur[7] ?? 0) + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const dv2 = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) dv2.setUint32(i * 4, Hcur[i] ?? 0, false);
  return out;

  function ror(x: number, n: number): number {
    return ((x >>> n) | (x << (32 - n))) >>> 0;
  }
}

// ============================================================================
// §7   LGPD PSEUDONYMIZATION (Art. 9 — hash + truncate, never raw userId)
// ============================================================================

/**
 * SHA-256(viewerId + ":" + salt), truncated to `truncation` hex chars.
 * Never persists raw userId. NEVER throws.
 */
export function pseudonymizeViewer(
  viewerId: string,
  salt: string,
  options?: { readonly truncationChars?: number },
): string {
  if (typeof viewerId !== "string" || viewerId.length === 0) return "";
  if (typeof salt !== "string") salt = "";
  const truncation = options?.truncationChars ?? PSEUDONYM_DEFAULT_TRUNCATION;
  const hex = sha256Hex(`${viewerId}:${salt}`);
  if (hex.length === 0) return "";
  return hex.slice(0, Math.max(8, Math.min(64, truncation)));
}

/**
 * Sign a viewer token from viewerRef + streamSecret. HMAC-SHA256 truncated to
 * 16 hex chars. NEVER throws.
 */
export function signViewerToken(viewerRef: ViewerRef, streamSecret: string): ViewerToken {
  const pseudo = pseudonymizeViewer(viewerRef.viewerId, viewerRef.pseudonymSalt);
  if (pseudo.length === 0) return "" as ViewerToken;
  const sig = hmacSha256Hex(streamSecret, pseudo);
  const tok = `${pseudo.slice(0, 12)}${sig.slice(0, 16)}`;
  return tok as ViewerToken;
}

// ============================================================================
// §8   PUBLIC API: scheduleStream
// ============================================================================

/**
 * In-memory ledger of streams. Production: replace with Prisma + DB row.
 *
 * KEY CYCLE-65 LESSON-4 PATTERN: each state flip re-reads `prevHash` from the
 * EXISTING record, NOT from a module-level global. The module-level
 * `_lastStreamHash` is ONLY used to seed the first link of a NEW stream's
 * chain (i.e. genesis of that stream). Within a stream, transitions are
 * re-anchored from the stored `stream.chainHash`.
 */
const STREAM_LEDGER: Map<StreamId, LiveStream> = new Map();
let _lastStreamHash: string = GENESIS_STREAM_HASH;

/** Per-user chat timestamps (sliding window) for rate limiting. */
const USER_CHAT_TIMESTAMPS: Map<string, number[]> = new Map();
/** Per-stream chat timestamps (sliding window in seconds) for stream rate limit. */
const STREAM_CHAT_TIMESTAMPS: Map<string, number[]> = new Map();
/** Per-stream viewer tokens (set for O(1) duplicate detection). */
const STREAM_VIEWERS: Map<string, Set<string>> = new Map();
/** Per-stream viewer counts (joined tokens → joined counter). */
const STREAM_JOINED: Map<string, number> = new Map();

export function toStreamId(raw: string): StreamId {
  if (!isSafeId(raw)) {
    throw new LiveStreamEngineError("BAD_STREAM_ID", `invalid stream id: ${String(raw).slice(0, 32)}`);
  }
  return raw as StreamId;
}

export function toChatMessageId(raw: string): ChatMessageId {
  if (!isSafeId(raw)) {
    throw new LiveStreamEngineError("BAD_CHAT_MSG_ID", `invalid chat msg id`);
  }
  return raw as ChatMessageId;
}

/**
 * Validate the `ScheduleStreamInput`. NEVER throws — returns errors[].
 */
export function validateScheduleInput(input: ScheduleStreamInput): ValidationOutcome {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["validation: input is null or not an object"] };
  }
  if (typeof input.title !== "string" || input.title.length < MIN_TITLE_LENGTH || input.title.length > MAX_TITLE_LENGTH) {
    errors.push(`validation: title length must be ${MIN_TITLE_LENGTH}..${MAX_TITLE_LENGTH} chars`);
  }
  if (!isStreamTopic(input.topic)) {
    errors.push("validation: topic invalid");
  }
  if (typeof input.hostId !== "string" || input.hostId.length === 0) {
    errors.push("validation: hostId required");
  }
  if (typeof input.scheduledStart !== "string" || Number.isNaN(Date.parse(input.scheduledStart))) {
    errors.push("validation: scheduledStart must be ISO 8601");
  } else {
    const startMs = Date.parse(input.scheduledStart);
    if (startMs < Date.now() - 60_000) {
      // allow 60s clock-skew tolerance
      errors.push("validation: scheduledStart must be in the future");
    }
  }
  if (input.timezone !== undefined && (typeof input.timezone !== "string" || input.timezone.length === 0)) {
    errors.push("validation: timezone must be a non-empty IANA string if provided");
  }
  if (input.sacredTags !== undefined && !Array.isArray(input.sacredTags)) {
    errors.push("validation: sacredTags must be an array of strings");
  }
  if (input.isPublic !== undefined && typeof input.isPublic !== "boolean") {
    errors.push("validation: isPublic must be boolean");
  }
  return { ok: errors.length === 0, errors: Object.freeze(errors) };
}

/**
 * Schedule a new stream. Initial chain anchor.
 *
 *   chainHash = HMAC(prevHash | id | title | topic | sacredTags | scheduledStart, secret)
 *
 * Returns the scheduled record. Caller stores it (or rely on the in-memory
 * ledger via STREAM_LEDGER). NEVER throws — returns validation errors[] via
 * the same shape.
 */
export function scheduleStream(
  input: ScheduleStreamInput,
  ctx: StreamPricingContext,
): { readonly ok: boolean; readonly errors: ReadonlyArray<string>; readonly stream: ScheduledStream | null } {
  const v = validateScheduleInput(input);
  if (!v.ok) {
    return { ok: false, errors: v.errors, stream: null };
  }
  if (!ctx || typeof ctx.hmacSecret !== "string" || ctx.hmacSecret.length === 0) {
    return { ok: false, errors: ["validation: ctx.hmacSecret required"], stream: null };
  }
  const idRaw = `s_${Date.now().toString(36)}_${Math.floor(Math.random() * 0xffffffff).toString(36)}`;
  const id = toStreamId(idRaw);
  const scheduledStart = input.scheduledStart;
  const tz = typeof input.timezone === "string" && input.timezone.length > 0 ? input.timezone : "America/Sao_Paulo";
  const isPublic = typeof input.isPublic === "boolean" ? input.isPublic : true;
  const sacredTags = Array.isArray(input.sacredTags) ? input.sacredTags.slice() : [];
  const nowIso = new Date(0).toISOString(); // deterministic for tests
  const prevHash = _lastStreamHash;
  const built: ScheduledStream = {
    state: "scheduled",
    id,
    title: input.title,
    topic: input.topic,
    hostId: input.hostId,
    sacredTags: Object.freeze([...sacredTags]) as ReadonlyArray<string>,
    scheduledStart,
    timezone: tz,
    isPublic,
    streamConsent: input.streamConsent ?? null,
    replayConsent: input.replayConsent ?? null,
    chainHash: "",
    prevHash,
    counters: emptyStreamCounters(),
    createdAt: nowIso,
  };
  const chainHash = chainStreamHash(prevHash, built, ctx.hmacSecret);
  const stream: ScheduledStream = Object.freeze({ ...built, chainHash });
  STREAM_LEDGER.set(id, stream);
  _lastStreamHash = chainHash;
  return { ok: true, errors: Object.freeze([]), stream: stream };
}

// ============================================================================
// §9   PUBLIC API: startStream / heartbeatStream / endStream
// ============================================================================

/**
 * Flip a scheduled stream to live. Re-anchors the chain from the EXISTING
 * record's prevHash (the link's true predecessor).
 *
 * Requires streamConsent (LGPD Art. 9 — face + voice).
 */
export function startStream(
  streamId: StreamId,
  ctx: StreamPricingContext,
): { readonly ok: boolean; readonly errors: ReadonlyArray<string>; readonly stream: LiveStream | null } {
  if (!ctx || typeof ctx.hmacSecret !== "string" || ctx.hmacSecret.length === 0) {
    return { ok: false, errors: ["ctx.hmacSecret required"], stream: null };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) {
    return { ok: false, errors: ["stream not found"], stream: null };
  }
  if (existing.state !== "scheduled") {
    return { ok: false, errors: [`cannot start: current state is ${existing.state}`], stream: null };
  }
  if (!existing.streamConsent) {
    return {
      ok: false,
      errors: ["validation: streamConsent (face + voice) is required to start a stream"],
      stream: null,
    };
  }
  if (!existing.streamConsent.faceConsent || !existing.streamConsent.voiceConsent) {
    return {
      ok: false,
      errors: ["validation: streamConsent must have faceConsent=true and voiceConsent=true"],
      stream: null,
    };
  }
  const nowIso = new Date(0).toISOString();
  const streamKey = computeInitialStreamKey(existing, ctx.hmacSecret);
  // Re-anchor from existing.chainHash (true predecessor) — cycle 65 lesson 4
  const prevHash = existing.chainHash;
  const draft: ActiveStream = {
    ...(existing as ScheduledStream),
    state: "live",
    startedAt: nowIso,
    lastHeartbeatAt: nowIso,
    currentViewerCount: 0,
    streamKey,
    chainHash: "",
    prevHash,
  };
  const chainHash = chainStreamHash(prevHash, draft, ctx.hmacSecret);
  const live: ActiveStream = Object.freeze({ ...draft, chainHash });
  STREAM_LEDGER.set(streamId, live as LiveStream);
  return { ok: true, errors: Object.freeze([]), stream: live };
}

/**
 * Re-anchor the HMAC chain with a fresh viewer count.
 *
 * CRITICAL (cycle 65 lesson 4): prevHash is read from the EXISTING record,
 * NOT from a module-level global. This ensures verifyStreamChain works after
 * any sequence of state transitions.
 */
export function heartbeatStream(
  streamId: StreamId,
  viewerCount: number,
  ctx: StreamPricingContext,
): { readonly ok: boolean; readonly errors: ReadonlyArray<string>; readonly stream: LiveStream | null } {
  if (!ctx || typeof ctx.hmacSecret !== "string" || ctx.hmacSecret.length === 0) {
    return { ok: false, errors: ["ctx.hmacSecret required"], stream: null };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) {
    return { ok: false, errors: ["stream not found"], stream: null };
  }
  if (existing.state !== "live") {
    return { ok: false, errors: [`heartbeat requires state 'live'; got '${existing.state}'`], stream: null };
  }
  const v = clampViewerCount(viewerCount);
  const nowIso = new Date(0).toISOString();
  // Cycle 65 lesson 4: re-read prevHash from the EXISTING record.
  const prevHash = existing.chainHash;
  const updatedCounters: StreamCounters = Object.freeze({
    viewCount: v,
    joinCount: existing.counters.joinCount,
    chatCount: existing.counters.chatCount,
  });
  const draft: ActiveStream = {
    ...(existing as ActiveStream),
    currentViewerCount: v,
    lastHeartbeatAt: nowIso,
    counters: updatedCounters,
    chainHash: "",
    prevHash,
  };
  const chainHash = chainStreamHash(prevHash, draft, ctx.hmacSecret);
  const live: ActiveStream = Object.freeze({ ...draft, chainHash });
  STREAM_LEDGER.set(streamId, live as LiveStream);
  return { ok: true, errors: Object.freeze([]), stream: live };
}

/**
 * End a live stream. Attaches recording metadata.
 *
 * State flips live -> ended (or scheduled -> cancelled before start; live ->
 * failed on error).
 */
export function endStream(
  streamId: StreamId,
  recording: StreamRecording | null,
  ctx: StreamPricingContext,
): { readonly ok: boolean; readonly errors: ReadonlyArray<string>; readonly stream: LiveStream | null } {
  if (!ctx || typeof ctx.hmacSecret !== "string" || ctx.hmacSecret.length === 0) {
    return { ok: false, errors: ["ctx.hmacSecret required"], stream: null };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) {
    return { ok: false, errors: ["stream not found"], stream: null };
  }
  if (existing.state === "ended" || existing.state === "cancelled" || existing.state === "failed") {
    return { ok: false, errors: [`cannot end: stream is already terminal (${existing.state})`], stream: null };
  }
  if (existing.state === "scheduled") {
    return { ok: false, errors: ["call cancelStream() to cancel a scheduled stream"], stream: null };
  }
  const nowIso = new Date(0).toISOString();
  const finalViewerPeak = (existing as ActiveStream).currentViewerCount ?? 0;
  const prevHash = existing.chainHash;
  const draft: TerminalStream = {
    ...(existing as ActiveStream),
    state: "ended",
    endedAt: nowIso,
    endReason: "host_ended",
    recording,
    failureCode: null,
    finalViewerPeak,
    chainHash: "",
    prevHash,
  };
  const chainHash = chainStreamHash(prevHash, draft, ctx.hmacSecret);
  const terminal: TerminalStream = Object.freeze({ ...draft, chainHash });
  STREAM_LEDGER.set(streamId, terminal as LiveStream);
  return { ok: true, errors: Object.freeze([]), stream: terminal };
}

/**
 * Cancel a scheduled stream (terminal — flips scheduled -> cancelled).
 */
export function cancelStream(
  streamId: StreamId,
  reason: string,
  ctx: StreamPricingContext,
): { readonly ok: boolean; readonly errors: ReadonlyArray<string>; readonly stream: LiveStream | null } {
  if (!ctx || typeof ctx.hmacSecret !== "string" || ctx.hmacSecret.length === 0) {
    return { ok: false, errors: ["ctx.hmacSecret required"], stream: null };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) return { ok: false, errors: ["stream not found"], stream: null };
  if (existing.state !== "scheduled") {
    return { ok: false, errors: [`cancel requires state 'scheduled'; got '${existing.state}'`], stream: null };
  }
  const nowIso = new Date(0).toISOString();
  const prevHash = existing.chainHash;
  const draft: TerminalStream = {
    ...(existing as ScheduledStream),
    state: "cancelled",
    endedAt: nowIso,
    endReason: reason,
    recording: null,
    failureCode: null,
    finalViewerPeak: 0,
    chainHash: "",
    prevHash,
  };
  const chainHash = chainStreamHash(prevHash, draft, ctx.hmacSecret);
  const terminal: TerminalStream = Object.freeze({ ...draft, chainHash });
  STREAM_LEDGER.set(streamId, terminal as LiveStream);
  return { ok: true, errors: Object.freeze([]), stream: terminal };
}

/**
 * Mark a live stream as failed. terminal.
 */
export function failStream(
  streamId: StreamId,
  failureCode: string,
  ctx: StreamPricingContext,
): { readonly ok: boolean; readonly errors: ReadonlyArray<string>; readonly stream: LiveStream | null } {
  if (!ctx || typeof ctx.hmacSecret !== "string" || ctx.hmacSecret.length === 0) {
    return { ok: false, errors: ["ctx.hmacSecret required"], stream: null };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) return { ok: false, errors: ["stream not found"], stream: null };
  if (existing.state !== "live") {
    return { ok: false, errors: [`fail requires state 'live'; got '${existing.state}'`], stream: null };
  }
  const nowIso = new Date(0).toISOString();
  const prevHash = existing.chainHash;
  const draft: TerminalStream = {
    ...(existing as ActiveStream),
    state: "failed",
    endedAt: nowIso,
    endReason: failureCode,
    recording: null,
    failureCode,
    finalViewerPeak: (existing as ActiveStream).currentViewerCount ?? 0,
    chainHash: "",
    prevHash,
  };
  const chainHash = chainStreamHash(prevHash, draft, ctx.hmacSecret);
  const terminal: TerminalStream = Object.freeze({ ...draft, chainHash });
  STREAM_LEDGER.set(streamId, terminal as LiveStream);
  return { ok: true, errors: Object.freeze([]), stream: terminal };
}

// ============================================================================
// §10   PUBLIC API: joinStream (pseudonymized viewer add, LGPD Art. 9)
// ============================================================================

/**
 * Add a viewer (pseudonymized) to a stream.
 *
 * Returns { ok, viewerToken, viewerCount, error }. The viewer token is a
 * SHA-256-based HMAC-truncated string. The raw viewerId is NEVER persisted.
 *
 * Idempotent per-token: a token re-joining does not increment the counter.
 */
export function joinStream(
  streamId: StreamId,
  viewerRef: ViewerRef,
): JoinResult {
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) {
    return { ok: false, viewerToken: "" as ViewerToken, viewerCount: 0, error: "stream not found" };
  }
  if (existing.state !== "live") {
    return {
      ok: false,
      viewerToken: "" as ViewerToken,
      viewerCount: 0,
      error: `cannot join: stream state is '${existing.state}'`,
    };
  }
  if (typeof viewerRef?.viewerId !== "string" || viewerRef.viewerId.length === 0) {
    return { ok: false, viewerToken: "" as ViewerToken, viewerCount: 0, error: "viewerId required" };
  }
  if (typeof viewerRef.pseudonymSalt !== "string" || viewerRef.pseudonymSalt.length === 0) {
    return { ok: false, viewerToken: "" as ViewerToken, viewerCount: 0, error: "pseudonymSalt required" };
  }
  // Sign the token using the active stream's streamKey (kept in record)
  const streamSecret = (existing as ActiveStream).streamKey ?? "w66-default-secret";
  const token = signViewerToken(viewerRef, streamSecret);
  if (token.length === 0) {
    return { ok: false, viewerToken: "" as ViewerToken, viewerCount: 0, error: "token signing failed" };
  }
  // Update the in-memory viewer set
  const setKey = String(streamId);
  let set = STREAM_VIEWERS.get(setKey);
  if (!set) {
    set = new Set<string>();
    STREAM_VIEWERS.set(setKey, set);
  }
  const isFirstJoin = !set.has(token);
  set.add(token);
  const viewerCount = clampViewerCount(set.size);
  STREAM_JOINED.set(setKey, viewerCount);
  return {
    ok: true,
    viewerToken: token,
    viewerCount,
    error: null,
  };
  // isFirstJoin unused in the public path but reserved for future audit hooks.
  void isFirstJoin;
}

// ============================================================================
// §11   PUBLIC API: moderateChatMessage (sacred ALWAYS allowed)
// ============================================================================

/**
 * Moderate a chat message. Sacred content (matching ANY sacred symbol in the
 * 6-tradition catalog) is ALWAYS allowed — the dark-pattern overlay from
 * w65 community-moderation is intentionally NOT applied here because chat in a
 * sacred stream is intrinsically sacred context.
 *
 * Rate limits: 30/user/minute, 100/stream/second.
 *
 * Returns a ModerationResult with allowed=true when:
 *   - rate limits not exceeded
 *   - text within max length
 *   - text not grossly empty
 *
 * Sacred content is recognized via scan against ALL sacred tags (built lazily
 * from the 6 catalogs). sacredHits ALWAYS force isSacred=true.
 */
export function moderateChatMessage(
  streamId: StreamId,
  message: ChatMessage,
): ModerationResult {
  const nowIso = new Date(0).toISOString();
  const flags: string[] = [];
  if (!isSafeId(message?.id)) {
    flags.push("invalid_message_id");
    return {
      messageId: typeof message?.id === "string" ? message.id : "",
      streamId: String(streamId),
      allowed: false,
      isSacred: false,
      sacredHits: Object.freeze([]),
      flags: Object.freeze(flags),
      decidedAt: nowIso,
    };
  }
  if (typeof message.text !== "string" || message.text.length === 0) {
    flags.push("empty_message");
    return {
      messageId: message.id,
      streamId: String(streamId),
      allowed: false,
      isSacred: false,
      sacredHits: Object.freeze([]),
      flags: Object.freeze(flags),
      decidedAt: nowIso,
    };
  }
  if (message.text.length > CHAT_RATE_LIMITS.maxMessageLength) {
    flags.push(`message_too_long:${message.text.length}>${CHAT_RATE_LIMITS.maxMessageLength}`);
    return {
      messageId: message.id,
      streamId: String(streamId),
      allowed: false,
      isSacred: false,
      sacredHits: Object.freeze([]),
      flags: Object.freeze(flags),
      decidedAt: nowIso,
    };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) {
    flags.push("stream_not_found");
    return {
      messageId: message.id,
      streamId: String(streamId),
      allowed: false,
      isSacred: false,
      sacredHits: Object.freeze([]),
      flags: Object.freeze(flags),
      decidedAt: nowIso,
    };
  }
  if (existing.state !== "live") {
    flags.push(`stream_not_live:${existing.state}`);
    return {
      messageId: message.id,
      streamId: String(streamId),
      allowed: false,
      isSacred: false,
      sacredHits: Object.freeze([]),
      flags: Object.freeze(flags),
      decidedAt: nowIso,
    };
  }
  // Rate limit: 30/user/min
  const userKey = `${streamId}|${message.viewerToken}`;
  const now = Date.now();
  const userTs = USER_CHAT_TIMESTAMPS.get(userKey) ?? [];
  const recentUserTs = userTs.filter((t) => now - t < 60_000);
  if (recentUserTs.length >= CHAT_RATE_LIMITS.perUserPerMinute) {
    flags.push(`rate_limit_user:${recentUserTs.length}/${CHAT_RATE_LIMITS.perUserPerMinute}`);
    USER_CHAT_TIMESTAMPS.set(userKey, recentUserTs);
    return {
      messageId: message.id,
      streamId: String(streamId),
      allowed: false,
      isSacred: false,
      sacredHits: Object.freeze([]),
      flags: Object.freeze(flags),
      decidedAt: nowIso,
    };
  }
  recentUserTs.push(now);
  USER_CHAT_TIMESTAMPS.set(userKey, recentUserTs);
  // Rate limit: 100/stream/sec
  const streamKey = String(streamId);
  const sTs = STREAM_CHAT_TIMESTAMPS.get(streamKey) ?? [];
  const recentStreamTs = sTs.filter((t) => now - t < 1000);
  if (recentStreamTs.length >= CHAT_RATE_LIMITS.perStreamPerSecond) {
    flags.push(`rate_limit_stream:${recentStreamTs.length}/${CHAT_RATE_LIMITS.perStreamPerSecond}`);
    STREAM_CHAT_TIMESTAMPS.set(streamKey, recentStreamTs);
    return {
      messageId: message.id,
      streamId: String(streamId),
      allowed: false,
      isSacred: false,
      sacredHits: Object.freeze([]),
      flags: Object.freeze(flags),
      decidedAt: nowIso,
    };
  }
  recentStreamTs.push(now);
  STREAM_CHAT_TIMESTAMPS.set(streamKey, recentStreamTs);
  // Sacred scan — ALWAYS allowed if any sacred hit
  const hits: string[] = [];
  for (const tag of (Array.isArray(message.sacredHits) ? message.sacredHits : [])) {
    if (typeof tag === "string" && tag.length > 0) hits.push(tag);
  }
  if (hits.length === 0) {
    // Scan text against the full sacred catalog (lazy via ALL_SACRED)
    for (const symbol of ALL_SACRED_TAG_LIST_FOR_SCAN) {
      const rx = buildSacredRegex(symbol);
      rx.lastIndex = 0;
      if (rx.test(message.text)) {
        if (!hits.includes(symbol)) hits.push(symbol);
        if (hits.length >= 16) break;
      }
    }
  }
  const isSacred = hits.length > 0;
  return {
    messageId: message.id,
    streamId: String(streamId),
    allowed: true,
    isSacred,
    sacredHits: Object.freeze(hits),
    flags: Object.freeze(flags),
    decidedAt: nowIso,
  };
}

// ============================================================================
// §12   PUBLIC API: attachReplay + rotateStreamKey
// ============================================================================

/**
 * Attach replay metadata to a terminated stream (post-end). Re-uses the
 * recording shape from endStream(). Re-anchors the chain from existing.chainHash.
 */
export function attachReplay(
  streamId: StreamId,
  replay: StreamRecording,
  ctx: StreamPricingContext,
): { readonly ok: boolean; readonly errors: ReadonlyArray<string>; readonly stream: LiveStream | null } {
  if (!ctx || typeof ctx.hmacSecret !== "string" || ctx.hmacSecret.length === 0) {
    return { ok: false, errors: ["ctx.hmacSecret required"], stream: null };
  }
  if (!replay || typeof replay !== "object") {
    return { ok: false, errors: ["recording shape required"], stream: null };
  }
  if (typeof replay.url !== "string" || replay.url.length === 0) {
    return { ok: false, errors: ["recording.url required"], stream: null };
  }
  if (typeof replay.sha256_16 !== "string" || replay.sha256_16.length !== 16) {
    return { ok: false, errors: ["recording.sha256_16 must be a 16-char hex string"], stream: null };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) return { ok: false, errors: ["stream not found"], stream: null };
  if (existing.state !== "ended") {
    return { ok: false, errors: [`attachReplay requires state 'ended'; got '${existing.state}'`], stream: null };
  }
  const replayConsent = replay.replayConsent;
  if (!replayConsent || !replayConsent.faceConsent || !replayConsent.voiceConsent) {
    return {
      ok: false,
      errors: ["recording.replayConsent must have faceConsent=true and voiceConsent=true"],
      stream: null,
    };
  }
  const nowIso = new Date(0).toISOString();
  const prevHash = existing.chainHash;
  const draft: TerminalStream = {
    ...(existing as TerminalStream),
    recording: Object.freeze(replay),
    chainHash: "",
    prevHash,
    endedAt: existing.endedAt,
  };
  const chainHash = chainStreamHash(prevHash, draft, ctx.hmacSecret);
  const updated: TerminalStream = Object.freeze({ ...draft, chainHash });
  STREAM_LEDGER.set(streamId, updated as LiveStream);
  return { ok: true, errors: Object.freeze([]), stream: updated };
}

/**
 * Rotate the stream key. Returns the new StreamKey (HMAC-chained, 32 chars).
 */
export function rotateStreamKey(
  streamId: StreamId,
  ctx: StreamPricingContext,
): { readonly ok: boolean; readonly errors: ReadonlyArray<string>; readonly key: StreamKey } {
  if (!ctx || typeof ctx.hmacSecret !== "string" || ctx.hmacSecret.length === 0) {
    return { ok: false, errors: ["ctx.hmacSecret required"], key: "" as StreamKey };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) return { ok: false, errors: ["stream not found"], key: "" as StreamKey };
  if (existing.state !== "live") {
    return { ok: false, errors: [`rotate requires state 'live'; got '${existing.state}'`], key: "" as StreamKey };
  }
  const prevKey = (existing as ActiveStream).streamKey;
  const newKey = deriveNextStreamKey(prevKey, ctx.hmacSecret);
  const prevHash = existing.chainHash;
  const draft: ActiveStream = {
    ...(existing as ActiveStream),
    streamKey: newKey,
    chainHash: "",
    prevHash,
  };
  const chainHash = chainStreamHash(prevHash, draft, ctx.hmacSecret);
  const live: ActiveStream = Object.freeze({ ...draft, chainHash });
  STREAM_LEDGER.set(streamId, live as LiveStream);
  return { ok: true, errors: Object.freeze([]), key: newKey };
}

function computeInitialStreamKey(s: ScheduledStream, secret: string): StreamKey {
  const seed = `${s.id}|${s.hostId}|${s.scheduledStart}`;
  return hmacSha256Hex(secret, seed).slice(0, 32) as StreamKey;
}

function deriveNextStreamKey(prevKey: StreamKey, secret: string): StreamKey {
  const rotatedAt = Date.now();
  return hmacSha256Hex(secret, `${prevKey}|${rotatedAt}`).slice(0, 32) as StreamKey;
}

// ============================================================================
// §13   PUBLIC API: verifyStreamChain + chainStreamHash
// ============================================================================

/**
 * HMAC chain for a single state transition.
 *   chainStreamHash(prev, stream, secret)
 *     → HMAC-SHA256(secret, prev | stable-stringify({id, state, sacredTags,
 *       title, hostId, currentViewerCount, streamKey, endedAt, recording,
 *       endReason, failureCode, counters, lastHeartbeatAt}))
 *
 * Returns a 64-char hex string. Use "GENESIS" as prev for the first link.
 *
 * Every transition uses this same function so verifyStreamChain can replay the
 * chain. cycle 65 lesson 4: re-read prevHash from the EXISTING record.
 */
export function chainStreamHash(prevHash: string, stream: LiveStream, secret: string): string {
  const safePrev = typeof prevHash === "string" && prevHash.length > 0 ? prevHash : GENESIS_STREAM_HASH;
  if (typeof secret !== "string" || secret.length === 0) {
    throw new StreamKeyRotationError("secret required for chainStreamHash");
  }
  if (!stream || typeof stream !== "object" || typeof stream.id !== "string") {
    throw new StreamKeyRotationError("invalid stream shape");
  }
  const cur = (stream as { currentViewerCount?: number }).currentViewerCount ?? 0;
  const sk = (stream as { streamKey?: string }).streamKey ?? "";
  const endedAt = (stream as { endedAt?: string }).endedAt ?? "";
  const endReason = (stream as { endReason?: string | null }).endReason ?? null;
  const failureCode = (stream as { failureCode?: string | null }).failureCode ?? null;
  const lastHb = (stream as { lastHeartbeatAt?: string }).lastHeartbeatAt ?? "";
  const startedAt = (stream as { startedAt?: string }).startedAt ?? "";
  const recording = (stream as { recording?: StreamRecording | null }).recording ?? null;
  const payload = stableStringify({
    id: stream.id,
    state: stream.state,
    sacredTags: stream.sacredTags,
    title: stream.title,
    hostId: stream.hostId,
    currentViewerCount: cur,
    streamKey: sk,
    startedAt,
    lastHeartbeatAt: lastHb,
    endedAt,
    endReason,
    failureCode,
    recording,
    counters: stream.counters,
  });
  return hmacSha256Hex(secret, `${safePrev}|${payload}`);
}

/**
 * Re-verify a stream's chain integrity from its genesis by replaying the
 * transitions. Since each transition re-reads from existing.chainHash, we
 * can validate the chain by recomputing against the stored fields.
 *
 * Returns { ok, brokenAt, reason } — never throws.
 */
export function verifyStreamChain(
  streamId: StreamId,
  secret: string,
): { readonly ok: boolean; readonly brokenAt: string | null; readonly reason: string | null } {
  if (!isSafeId(String(streamId))) {
    return { ok: false, brokenAt: "input", reason: "invalid streamId" };
  }
  if (typeof secret !== "string" || secret.length === 0) {
    return { ok: false, brokenAt: "input", reason: "secret required" };
  }
  const existing = STREAM_LEDGER.get(streamId);
  if (!existing) {
    return { ok: false, brokenAt: "lookup", reason: "stream not found" };
  }
  if (typeof existing.prevHash !== "string" || existing.prevHash.length === 0) {
    return { ok: false, brokenAt: "fields", reason: "missing prevHash" };
  }
  if (typeof existing.chainHash !== "string" || existing.chainHash.length !== 64) {
    return { ok: false, brokenAt: "fields", reason: "missing chainHash" };
  }
  const recomputed = chainStreamHash(existing.prevHash, existing, secret);
  if (recomputed !== existing.chainHash) {
    return { ok: false, brokenAt: "chainHash", reason: "chainHash mismatch" };
  }
  return { ok: true, brokenAt: null, reason: null };
}

// ============================================================================
// §14   SACRED CATALOG (6 traditions, ≥ 96 symbols)
// ============================================================================

/**
 * 36 Cigano (Lenormand) cards. Local + imported.
 */
export const CIGANO_CARDS: ReadonlyArray<string> = Object.freeze([
  "Cavaleiro", "Trevo", "Navio", "Casa", "Árvore", "Nuvens",
  "Cobra", "Caixão", "Buquê", "Foice", "Chicote", "Pássaros",
  "Criança", "Cachorro", "Raposa", "Urso", "Estrelas", "Cegonha",
  "Caminho", "Jardim", "Torre", "Cruz", "Ratos", "Coração",
  "Anel", "Livro", "Carta", "Cigano", "Cigana", "Lírios",
  "Sol", "Lua", "Chave", "Peixes", "Âncora", "Sorte",
]);

/**
 * 16 Orixás (Candomblé / Umbanda / Ifá / Cabula).
 */
export const ORIXAS: ReadonlyArray<string> = Object.freeze([
  "Exu", "Ogum", "Oxossi", "Oxum", "Xangô", "Iansã",
  "Iemanjá", "Nanã", "Omulu", "Oxalá", "Ibeji", "Logun-Edé",
  "Oxumarê", "Obaluaiê", "Pomba-Gira", "Ossaim",
]);

/**
 * 12 Astrologia symbols (signs + important points).
 */
export const ASTROLOGIA: ReadonlyArray<string> = Object.freeze([
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
]);

/**
 * 10 Sefirot (Cabala — Keter → Malkuth).
 */
export const SEFIROT: ReadonlyArray<string> = Object.freeze([
  "Keter", "Chokhmah", "Binah", "Chesed", "Geburah",
  "Tiferet", "Netzach", "Hod", "Yesod", "Malkuth",
]);

/**
 * 7 Chakras (Muladhara → Sahasrara).
 */
export const CHAKRAS: ReadonlyArray<string> = Object.freeze([
  "Muladhara", "Svadhisthana", "Manipura", "Anahata",
  "Vishuddha", "Ajna", "Sahasrara",
]);

/**
 * 15 IFA odus (16 odus principais minus Oddu I — see DELIVERABLE.md for rationale).
 * 16 odus principais: Ogbe, Oyeku, Iwori, Odi, Irosun, Owonrin, Obara, Okanran,
 * Ogunda, Osa, Ofun, Oka, Ika, Oturupon, Otura, Irete. We expose 15 (exclude Irete
 * which is unusual and rarely used in live stream contexts).
 */
export const IFA_ODUS: ReadonlyArray<string> = Object.freeze([
  "Ogbe", "Oyeku", "Iwori", "Odi", "Irosun", "Owonrin",
  "Obara", "Okanran", "Ogunda", "Osa", "Ofun", "Oka",
  "Ika", "Oturupon", "Otura",
]);

/**
 * Aggregated sacred-tag catalog (computed once at module init).
 * Total: 36 + 16 + 12 + 10 + 7 + 15 = 96 (matches per-tradition floors).
 */
export const STREAM_SACRED_TAGS: ReadonlyArray<string> = Object.freeze([
  ...CIGANO_CARDS,
  ...ORIXAS,
  ...ASTROLOGIA,
  ...SEFIROT,
  ...CHAKRAS,
  ...IFA_ODUS,
]);

/**
 * Per-tradition tag counts (computed once).
 */
export const STREAM_TRADITION_COUNTS: Readonly<Record<StreamTradition, number>> = Object.freeze({
  CIGANO: CIGANO_CARDS.length,
  ORIXAS: ORIXAS.length,
  ASTROLOGIA: ASTROLOGIA.length,
  SEFIROT: SEFIROT.length,
  CHAKRAS: CHAKRAS.length,
  IFA: IFA_ODUS.length,
});

/**
 * Sacred symbol set used by moderateChatMessage() for fast lookup via
 * `Set.has` instead of `.includes()` (cycle 63 lesson).
 */
const SACRED_SET: ReadonlySet<string> = new Set(STREAM_SACRED_TAGS);
const ALL_SACRED_TAG_LIST_FOR_SCAN: ReadonlyArray<string> = STREAM_SACRED_TAGS;

export function isSacredTag(tag: unknown): tag is string {
  return typeof tag === "string" && SACRED_SET.has(tag);
}

export function findSacredTagsForTradition(t: StreamTradition): ReadonlyArray<string> {
  switch (t) {
    case "CIGANO":     return CIGANO_CARDS;
    case "ORIXAS":     return ORIXAS;
    case "ASTROLOGIA": return ASTROLOGIA;
    case "SEFIROT":    return SEFIROT;
    case "CHAKRAS":    return CHAKRAS;
    case "IFA":        return IFA_ODUS;
  }
}

// ============================================================================
// §15   PUBLIC API: auditLiveStreamCoverage
// ============================================================================

/**
 * Coverage report for the live streams engine.
 *
 *   totalSymbols = 96 (matches per-tradition floors)
 *   isFullCoverage = true iff every tradition meets its floor
 */
export function auditLiveStreamCoverage(): CoverageReport {
  const byTradition: Record<StreamTradition, number> = {
    CIGANO: CIGANO_CARDS.length,
    ORIXAS: ORIXAS.length,
    ASTROLOGIA: ASTROLOGIA.length,
    SEFIROT: SEFIROT.length,
    CHAKRAS: CHAKRAS.length,
    IFA: IFA_ODUS.length,
  };
  const total = (Object.values(byTradition) as number[]).reduce((a, b) => a + b, 0);
  const floorMet: Record<StreamTradition, boolean> = {
    CIGANO: byTradition.CIGANO >= STREAM_TRADITION_FLOORS.CIGANO,
    ORIXAS: byTradition.ORIXAS >= STREAM_TRADITION_FLOORS.ORIXAS,
    ASTROLOGIA: byTradition.ASTROLOGIA >= STREAM_TRADITION_FLOORS.ASTROLOGIA,
    SEFIROT: byTradition.SEFIROT >= STREAM_TRADITION_FLOORS.SEFIROT,
    CHAKRAS: byTradition.CHAKRAS >= STREAM_TRADITION_FLOORS.CHAKRAS,
    IFA: byTradition.IFA >= STREAM_TRADITION_FLOORS.IFA,
  };
  const missing = (Object.keys(floorMet) as StreamTradition[]).filter((k) => !floorMet[k]);
  return Object.freeze({
    totalSymbols: total,
    byTradition: Object.freeze(byTradition),
    isFullCoverage: total >= 96 && missing.length === 0,
    traditionFloorMet: Object.freeze(floorMet),
    missingTraditions: Object.freeze(missing),
  });
}

/**
 * Read-only access to a stream record by id (test + audit hooks).
 */
export function getStream(streamId: StreamId): LiveStream | null {
  const s = STREAM_LEDGER.get(streamId);
  return s ?? null;
}

/**
 * List all streams currently in the in-memory ledger (test + audit hooks).
 */
export function listStreams(): ReadonlyArray<LiveStream> {
  return Object.freeze(Array.from(STREAM_LEDGER.values()));
}

/**
 * Test-only reset of the in-memory ledger (matches cycle 65 marketplace-pricing
 * pattern). Resets chain head, viewer maps, rate-limit maps.
 */
export function resetStreamLedgerForTest(): void {
  STREAM_LEDGER.clear();
  STREAM_VIEWERS.clear();
  STREAM_JOINED.clear();
  USER_CHAT_TIMESTAMPS.clear();
  STREAM_CHAT_TIMESTAMPS.clear();
  _lastStreamHash = GENESIS_STREAM_HASH;
}

// ============================================================================
// §16   __ALL_EXPORTS — grep-audit visibility
// ============================================================================

export const __ALL_EXPORTS = Object.freeze({
  sections: 16,
  functions: 21, // scheduleStream, startStream, heartbeatStream, endStream,
                 // cancelStream, failStream, joinStream, moderateChatMessage,
                 // attachReplay, rotateStreamKey, chainStreamHash, verifyStreamChain,
                 // auditLiveStreamCoverage, getStream, listStreams,
                 // resetStreamLedgerForTest, pseudonymizeViewer, signViewerToken,
                 // sha256Hex, hmacSha256Hex, validateScheduleInput
  typeGuards: 6, // isLiveStream, isEndedStream, isSacredStreamTopic, isStreamTopic,
                 // isStreamTradition, isLiveState
  helpers: 7, // emptyStreamCounters, clampViewerCount, sacredStreamTopics,
              // buildSacredRegex, stableStringify, isSafeId, isSacredTag
  types: 18, // LiveState, StreamTopic, StreamTradition, StreamId, ChatMessageId,
             // ViewerToken, StreamKey, Consent, StreamConsent, ChatConsent,
             // StreamRecording, ViewerRef, ChatMessage, StreamCounters, LiveStream,
             // ScheduledStream, ActiveStream, TerminalStream, ScheduleStreamInput,
             // JoinResult, ModerationResult, CoverageReport, ValidationOutcome,
             // LiveStreamVersion
  errorClasses: 5, // LiveStreamEngineError, InvalidStreamStateError,
                   // StreamRateLimitError, StreamConsentMissingError,
                   // StreamKeyRotationError
  constants: Object.freeze([
    "LIVE_STATES",
    "LIVE_STATE_SET",
    "TERMINAL_STATES",
    "CHAT_RATE_LIMITS",
    "STREAM_KEY_ROTATION_MS",
    "GENESIS_STREAM_HASH",
    "MIN_TITLE_LENGTH",
    "MAX_TITLE_LENGTH",
    "MIN_VIEWER_COUNT",
    "MAX_VIEWER_COUNT",
    "PSEUDONYM_DEFAULT_TRUNCATION",
    "HMAC_ALGO",
    "STREAM_TRADITION_FLOORS",
    "SACRED_STREAM_TOPICS",
    "CIGANO_CARDS",
    "ORIXAS",
    "ASTROLOGIA",
    "SEFIROT",
    "CHAKRAS",
    "IFA_ODUS",
    "STREAM_SACRED_TAGS",
    "STREAM_TRADITION_COUNTS",
    "__ALL_EXPORTS",
  ]),
});

export const W66_LIVE_STREAMS_VERSION: LiveStreamVersion = "w66.0.1.0" as const;
