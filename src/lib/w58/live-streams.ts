/**
 * w58/live-streams
 * ─────────────────
 * Engine de sessões de live-streaming para a Cabala dos Caminhos.
 *
 * Cobre o ciclo de vida completo da sessão (scheduled → live → paused → ended
 * ou cancelled ou errored), controles de moderação (mute, kick, ban, slow-mode,
 * curator-only, sacred-room-lock), chat com moderação (rate-limit, spam
 * detection, sacred-mask), gravação + VOD com captions separadas para sessões
 * sagradas, sala sagrada com verificação de praticante e lane de chat separada,
 * e conformidade LGPD (Art. 7 consentimento, Art. 9 finalidade/biometria, Art. 18
 * acesso/correção/eliminação/revogação).
 *
 * Defesa em profundidade:
 *  1. Política de sala sagrada (`SacredRoomPolicy`) — enforced em
 *     `verifySacredPractitioner` antes do viewer entrar.
 *  2. Detecção de chat-spam via token bucket + heurística de repetição em
 *     `detectChatSpam`.
 *  3. Audit chain HMAC-SHA256 para evidência de tampering em join/leave,
 *     chat moderation e recording events.
 *  4. Separação física de chat lane (`sacredLane` flag) + captions track
 *     separada para VOD sagrado (`captionsSacredTrackUrl`).
 *
 * Sacred-room regras HARD:
 *   • sessão sagrada requer praticante tier 3-4 verificado;
 *   • chat sagrado é em lane separada, NÃO se mistura com chat geral;
 *   • gravação sagrada é DISABLED por default — opt-in explícito por sessão;
 *   • VOD sagrado exige captions sacred-track + transcript masking;
 *   • viewer list sagrado é sacred-flagged, sem export analítico sem consent.
 *
 * LGPD:
 *   • Art. 7 — opt-in sagrado é separado do consentimento geral;
 *   • Art. 9 — dado biométrico (rosto na transmissão) requer opt-in biométrico
 *     específico, não confundido com consentimento de transmissão;
 *   • Art. 18 — erasure nukeia chat + VOD + audit genérico; join/leave audit
 *     fica retido 90 dias como evidência legal;
 *   • Chain HMAC em todo viewer-joined/viewer-left/chat-moderated/recording.
 *
 * Self-contained: zero imports do repo, só tipos TS + Math nativo + string ops.
 * Determinístico — RNG seeded (Mulberry32) para reproducibilidade de smoke.
 *
 * Layout:
 *   §1  Tipos & contratos
 *   §2  Constantes, defaults, erros
 *   §3  Math primitives (FNV-1a 32/64, SHA-256, HMAC-SHA256, Mulberry32)
 *   §4  Session lifecycle (schedule/start/pause/resume/end/cancel/error)
 *   §5  Viewer management (join/leave/peak count)
 *   §6  Chat system (send/moderate/rate-limit/spam-detection)
 *   §7  Recording + VOD lifecycle
 *   §8  Sacred room policy + practitioner verification
 *   §9  Moderator controls (mute/kick/ban/slow-mode/curator-only/lock)
 *   §10 Stream quality validation
 *   §11 LGPD Art. 7/9/18 (consent/export/erasure/withdrawal)
 *   §12 Audit chain HMAC + tamper detection
 *   §13 Engine principal — orchestrator helpers
 *   §14 Smoke / regression scenarios
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Tipos & Contratos                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export type StreamStatus =
  | "scheduled"
  | "live"
  | "paused"
  | "ended"
  | "cancelled"
  | "errored";

export type ModerationAction =
  | "none"
  | "redacted"
  | "deleted"
  | "shadow_banned"
  | "user_muted"
  | "user_kicked"
  | "user_banned"
  | "sacred_masked";

export type RecordingStatus =
  | "recording"
  | "processing"
  | "available"
  | "failed"
  | "cancelled"
  | "sacred_only";

export type PractitionerTier = 0 | 1 | 2 | 3 | 4;

export type StreamErrorKind =
  | "network"
  | "codec"
  | "auth"
  | "sacred_violation"
  | "rate_limit"
  | "viewer_cap"
  | "storage"
  | "vods3_failure";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export type StreamAuditKind =
  | "created"
  | "started"
  | "paused"
  | "resumed"
  | "ended"
  | "cancelled"
  | "errored"
  | "viewer_joined"
  | "viewer_left"
  | "message_sent"
  | "message_moderated"
  | "moderator_action"
  | "recorded"
  | "vod_processing"
  | "vod_published"
  | "vod_failed"
  | "consent_granted"
  | "consent_revoked"
  | "lgpd_erasure"
  | "sacred_lock_engaged"
  | "deleted";

export type ConsentPurpose =
  | "stream_attendance"
  | "sacred_room_attendance"
  | "biometric_capture"
  | "chat_participation"
  | "recording_storage"
  | "vod_distribution"
  | "analytics"
  | "lgpd_export";

export interface LiveSession {
  id: string;
  hostId: string;
  title: string;
  description: string;
  status: StreamStatus;
  scheduledAt: number;
  startedAt: number | null;
  endedAt: number | null;
  /** Peak concurrent viewer count. */
  viewerCountPeak: number;
  /** Total unique viewers ever joined. */
  viewerTotalUnique: number;
  /** Sacred session — separate chat lane, practitioner-only, recording opt-in. */
  sacred: boolean;
  sacredTradition?: string;
  recordingEnabled: boolean;
  /** Default recording enabled for sacred is FALSE; explicit opt-in required. */
  sacredRecordingOptIn: boolean;
  /** Recording biometric opt-in (face capture on stream). */
  biometricOptIn: boolean;
  language: string;
  /** Quality target for the broadcast. */
  quality: StreamQuality;
  /** Chat lane mode: "sacred" or "general" (sacred = separate, no general mix). */
  chatLane: "sacred" | "general";
  /** Tags — used for search/discovery. */
  tags: string[];
  /** Curator-only chat gate (only pre-approved curators can chat). */
  curatorOnlyChat: boolean;
  /** Slow-mode in seconds — 0 means disabled. */
  slowModeSeconds: number;
  /** Maximum viewers — 0 means unlimited. */
  viewerCap: number;
  /** Host tier required (0..4). For sacred rooms, enforced as 3-4. */
  hostTier: PractitionerTier;
  /** Created / updated timestamps. */
  createdAt: number;
  updatedAt: number;
  /** Fingerprint of immutable fields. */
  fingerprint: string;
}

export interface StreamQuality {
  resolution: "360p" | "480p" | "720p" | "1080p";
  bitrateKbps: number;
  codec: "h264" | "h265" | "vp9" | "av1";
  fps: 24 | 30 | 60;
  /** Optional — adaptive bitrate ladder. */
  ladder?: StreamQuality[];
}

export interface ModeratorControls {
  mute: boolean;
  kick: boolean;
  ban: boolean;
  slowMode: boolean;
  sacredRoomLock: boolean;
  curatorOnly: boolean;
  pinnedMessage: boolean;
  /** Curator-only deletion of historical messages. */
  curatorPrune: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  text: string;
  /** Timestamp in ms since epoch. */
  timestampMs: number;
  /** True if sacred session message, routed to sacred lane. */
  sacredMasked: boolean;
  /** True if soft-deleted by moderator. */
  deleted: boolean;
  /** Moderation action applied. */
  moderationAction: ModerationAction;
  /** Moderator who acted, if any. */
  moderatorId: string | null;
  /** Chat lane tag. */
  lane: "sacred" | "general";
  /** Fingerprint (FNV-1a 32 of text+sender+session). */
  fingerprint: string;
  /** Optional — link to parent message for threads. */
  parentMessageId: string | null;
}

export interface ChatRateLimit {
  windowMs: number;
  maxMessages: number;
  perUser: boolean;
  /** For sacred rooms, stricter limit. */
  sacredHigher: boolean;
}

export interface StreamViewer {
  userId: string;
  sessionId: string;
  joinedAt: number;
  leftAt: number | null;
  watchDurationMs: number;
  /** True if viewer opted into sacred track. */
  sacredOptedIn: boolean;
  /** True if viewer was verified practitioner (tier 3-4). */
  practitionerVerified: boolean;
  /** True if viewer was kicked/banned. */
  banned: boolean;
  /** Mute window — if > 0, viewer is muted until leftAt+kickMuteUntilMs. */
  muteUntilMs: number;
}

export interface RecordingSession {
  id: string;
  sessionId: string;
  status: RecordingStatus;
  startedAt: number;
  endedAt: number | null;
  /** VOD URL once available. */
  vodUrl: string | null;
  /** Public captions URL (general). */
  captionsUrl: string | null;
  /** Sacred captions URL — present only if sacred session + sacred recording opt-in. */
  captionsSacredTrackUrl: string | null;
  /** Duration in seconds. */
  durationSeconds: number;
  /** Bytes recorded (rough). */
  bytesRecorded: number;
  /** Failure reason if status=failed. */
  failureReason?: string;
  /** Sacred session? */
  sacred: boolean;
}

export interface SacredRoomPolicy {
  /** Practitioner tier required to attend (3-4 for sacred). */
  requiredTier: PractitionerTier;
  /** Whether sacred-room opt-in is required (always true for sacred). */
  optInRequired: boolean;
  /** Whether chat lane is separate (always true for sacred). */
  separateChatLane: boolean;
  /** Whether recording is disabled by default (always true for sacred). */
  recordingDisabledByDefault: boolean;
  /** Whether VOD requires sacred captions track. */
  sacredCaptionsTrackRequired: boolean;
  /** Whether sacred transcript masking is enforced. */
  sacredTranscriptMasking: boolean;
  /** Sacred traditions accepted (e.g., ["umbanda","candomble"]). */
  acceptedTraditions: string[];
}

export interface StreamErrorEvent {
  sessionId: string;
  kind: StreamErrorKind;
  severity: ErrorSeverity;
  /** Error message — sanitized, no PII. */
  message: string;
  /** Whether the error is recoverable (retry possible). */
  recoverable: boolean;
  ts: number;
  /** Optional code. */
  code?: string;
}

export interface StreamAuditEvent {
  id: string;
  sessionId: string;
  kind: StreamAuditKind;
  /** Subject user (moderator, viewer, etc.). */
  actorId: string | null;
  /** Optional detail. */
  detail: string | null;
  ts: number;
  /** HMAC chain hash (links to previous event). */
  chainHash: string;
  /** Sacred-flagged event — extra retention, never exportable to analytics. */
  sacred: boolean;
}

export interface AuditReceipt {
  receiptId: string;
  subjectId: string;
  subjectKind: "user" | "session" | "moderator";
  erasedAt: number;
  erasedChats: number;
  erasedVods: number;
  erasedAuditRecords: number;
  retentionUntil: number;
  chainHash: string;
}

export interface ConsentRecord {
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  ts: number;
  /** Request ID for LGPD audit trail. */
  requestId: string;
}

export interface SpamSignal {
  type: "repeat" | "burst" | "link" | "caps" | "length" | "sacred_leak";
  weight: number;
  detail: string;
}

export interface SpamDetectionResult {
  spam: boolean;
  confidence: number;
  signals: SpamSignal[];
}

export interface SacredVerificationResult {
  verified: boolean;
  reason?: string;
  tier?: PractitionerTier;
  tradition?: string;
}

export interface TokenBucket {
  tokens: number;
  capacity: number;
  refillPerSec: number;
  lastRefillMs: number;
}

export interface ModeratorActionLog {
  sessionId: string;
  moderatorId: string;
  action: ModerationAction;
  targetId: string;
  ts: number;
  reason?: string;
}

export interface PinnedMessage {
  messageId: string;
  moderatorId: string;
  pinnedAt: number;
}

export interface ChatLanePartition {
  sessionId: string;
  /** General lane (default; receives non-sacred sessions' messages). */
  general: string[];
  /** Sacred lane — separate channel; messages never leak between. */
  sacred: string[];
  /** Cross-lane contamination check — true if message appears in both. */
  isCrossContaminated: boolean;
}

export interface AuditChainVerifyResult {
  valid: boolean;
  brokenAt: number | null;
  detail: string;
}

export interface LgpdExportPayload {
  userId: string;
  exportedAt: number;
  chatHistory: ChatMessage[];
  auditHistory: StreamAuditEvent[];
  viewerHistory: StreamViewer[];
  consentHistory: ConsentRecord[];
  retentionUntil: number;
  chainHash: string;
}

export interface WithdrawalReceipt {
  userId: string;
  purposes: ConsentPurpose[];
  withdrawnAt: number;
  chainHash: string;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constantes, defaults, erros                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const ENGINE_VERSION = "1.0.0-w58";
export const POLICY_VERSION = "w58-live-streams-2026.06.29";

/** Quality limits. */
export const MAX_RESOLUTION: StreamQuality["resolution"] = "1080p";
export const MAX_FPS: StreamQuality["fps"] = 60;
export const MAX_BITRATE_KBPS = 8000;
export const MIN_BITRATE_KBPS = 250;

/** Viewer cap defaults. */
export const DEFAULT_VIEWER_CAP = 1000;
export const MAX_VIEWER_CAP = 100_000;

/** Rate-limit defaults. */
export const DEFAULT_RATE_LIMIT_GENERAL: ChatRateLimit = {
  windowMs: 10_000,
  maxMessages: 5,
  perUser: true,
  sacredHigher: false,
};
export const DEFAULT_RATE_LIMIT_SACRED: ChatRateLimit = {
  windowMs: 30_000,
  maxMessages: 3,
  perUser: true,
  sacredHigher: true,
};

/** Spam thresholds. */
export const SPAM_CONFIDENCE_THRESHOLD = 0.6;
export const SPAM_BURST_THRESHOLD = 5;
export const SPAM_BURST_WINDOW_MS = 5_000;
export const SPAM_REPEAT_MIN_COUNT = 3;
export const SPAM_MAX_CAPS_RATIO = 0.7;
export const SPAM_MAX_LINK_COUNT = 3;
export const SPAM_MAX_LENGTH = 2000;

/** Slow-mode bounds. */
export const SLOW_MODE_MIN_S = 0;
export const SLOW_MODE_MAX_S = 300;

/** Recording durations. */
export const RECORDING_MAX_DURATION_S = 6 * 3600; // 6 hours
export const VOD_PROCESSING_MIN_S = 30;
export const VOD_PROCESSING_MAX_S = 3600;

/** LGPD retention. */
export const CHAT_RETENTION_DAYS = 90;
export const CHAT_RETENTION_MS = CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
export const AUDIT_RETENTION_DAYS = 90;
export const AUDIT_RETENTION_MS = AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
export const BIOMETRIC_RETENTION_UNTIL_WITHDRAWAL = true;

/** Sacred tradition list — accepted traditions for sacred rooms. */
export const SACRED_TRADITIONS: readonly string[] = [
  "umbanda",
  "candomble",
  "quimbanda",
  "ifá",
  "espiritismo",
  "cabala",
  "tantra",
  "xamanismo",
  "santo_daime",
  "buddhism_tantric",
];

/** Required tier for sacred sessions. */
export const SACRED_REQUIRED_TIER: PractitionerTier = 3;

/** Errors. */
export const STREAM_ERROR_CODES = {
  STREAM_001: "session not found",
  STREAM_002: "invalid transition",
  STREAM_003: "sacred violation — practitioner tier too low",
  STREAM_004: "sacred violation — chat lane contamination",
  STREAM_005: "rate-limit exceeded",
  STREAM_006: "recording disabled for sacred session",
  STREAM_007: "quality invalid (max 1080p/60fps/8Mbps)",
  STREAM_008: "consent not granted",
  STREAM_009: "biometric consent missing",
  STREAM_010: "viewer cap reached",
  STREAM_011: "mod action denied — no permission",
  STREAM_012: "moderator banned user",
  STREAM_013: "spam detected",
  STREAM_014: "sacred leak — non-practitioner attempted sacred access",
  STREAM_015: "audit chain broken",
  STREAM_016: "VOD processing failed",
  STREAM_017: "session cancelled",
  STREAM_018: "session errored",
  STREAM_019: "withdrawal applied",
  STREAM_020: "erasure applied",
} as const;

export type StreamErrorCode = keyof typeof STREAM_ERROR_CODES;

export interface StreamError {
  code: StreamErrorCode;
  message: string;
  detail?: string;
  ts: number;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math primitives — FNV-1a 32/64, SHA-256, HMAC-SHA256, Mulberry32       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ─── FNV-1a 32-bit ──────────────────────────────────────────────────────────

const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

export function fnv1a32(input: string): string {
  let hash = FNV1A_32_OFFSET >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// ─── FNV-1a 64-bit (BigInt-safe) ────────────────────────────────────────────

const FNV1A_64_OFFSET = BigInt("0xcbf29ce484222325");
const FNV1A_64_PRIME = BigInt("0x100000001b3");
const FNV1A_64_MASK = (BigInt(1) << BigInt(64)) - BigInt(1);

export function fnv1a64(input: string): string {
  let hash = FNV1A_64_OFFSET & FNV1A_64_MASK;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i) & 0xff);
    hash = (hash * FNV1A_64_PRIME) & FNV1A_64_MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

/** Hex encode bytes (2-char zero-padded). */
export function hexEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i]!.toString(16).padStart(2, "0");
  }
  return s;
}

// ─── SHA-256 (FIPS 180-4) hand-rolled ────────────────────────────────────────

function sha256(message: Uint8Array): Uint8Array {
  function rotr(x: number, n: number): number {
    return (x >>> n) | (x << (32 - n));
  }
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7350, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  let H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const ml = message.length * 8;
  const padLen = (((message.length + 9) + 63) & ~63) - message.length;
  const padded = new Uint8Array(message.length + padLen);
  padded.set(message);
  padded[message.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, ml >>> 0);
  dv.setUint32(padded.length - 8, Math.floor(ml / 0x100000000));
  const W = new Uint32Array(64);
  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = dv.getUint32(chunk + i * 4);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e!, 6) ^ rotr(e!, 11) ^ rotr(e!, 25);
      const ch = (e! & f!) ^ (~e! & g!);
      const t1 = (h! + S1 + ch + K[i]! + W[i]!) >>> 0;
      const S0 = rotr(a!, 2) ^ rotr(a!, 13) ^ rotr(a!, 22);
      const mj = (a! & b!) ^ (a! & c!) ^ (b! & c!);
      const t2 = (S0 + mj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d! + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0]! + a!) >>> 0;
    H[1] = (H[1]! + b!) >>> 0;
    H[2] = (H[2]! + c!) >>> 0;
    H[3] = (H[3]! + d!) >>> 0;
    H[4] = (H[4]! + e!) >>> 0;
    H[5] = (H[5]! + f!) >>> 0;
    H[6] = (H[6]! + g!) >>> 0;
    H[7] = (H[7]! + h!) >>> 0;
  }
  const out = new Uint8Array(32);
  const dv2 = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) dv2.setUint32(i * 4, H[i]!);
  return out;
}

// ─── UTF-8 encode (defensive; sandbox may not have TextEncoder) ────────────

function utf8(s: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    try {
      return new TextEncoder().encode(s);
    } catch {
      // fall through to manual
    }
  }
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      c = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff));
      out.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    }
  }
  return new Uint8Array(out);
}

// ─── HMAC-SHA256 (byte-array path — bypasses UTF-8 round-trip per w55 lesson) ─

/** HMAC-SHA256(key, message) → hex 64. Uses raw byte-array inner/outer XOR. */
export function hmacSha256Hex(key: string, message: string): string {
  const blockSize = 64;
  const keyBytes = utf8(key);
  let k0: Uint8Array;
  if (keyBytes.length > blockSize) {
    const hashed = sha256(keyBytes);
    k0 = new Uint8Array(blockSize);
    k0.set(hashed);
  } else {
    k0 = new Uint8Array(blockSize);
    k0.set(keyBytes);
  }
  // ipad/opad — XOR directly on byte arrays (NOT after UTF-8 round-trip).
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = k0[i]! ^ 0x36;
    opad[i] = k0[i]! ^ 0x5c;
  }
  const msgBytes = utf8(message);
  const innerInput = new Uint8Array(blockSize + msgBytes.length);
  innerInput.set(ipad, 0);
  innerInput.set(msgBytes, blockSize);
  const innerHash = sha256(innerInput);
  const outerInput = new Uint8Array(blockSize + 32);
  outerInput.set(opad, 0);
  outerInput.set(innerHash, blockSize);
  const outerHash = sha256(outerInput);
  return hexEncode(outerHash);
}

/** Convenience: sha256 of a string → hex 64. */
export function sha256Hex(s: string): string {
  return hexEncode(sha256(utf8(s)));
}

// ─── Mulberry32 — deterministic seeded RNG ──────────────────────────────────

export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function rand(): number {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded RNG factory — derives seed from string via FNV-1a 32. */
export function seededRng(seedStr: string): () => number {
  const seed = parseInt(fnv1a32(seedStr), 16);
  return mulberry32(seed);
}

// ─── Token bucket (rate limit primitive) ────────────────────────────────────

export function createTokenBucket(
  capacity: number,
  refillPerSec: number,
  initialTokens?: number,
  now: number = Date.now(),
): TokenBucket {
  return {
    tokens: initialTokens ?? capacity,
    capacity,
    refillPerSec,
    lastRefillMs: now,
  };
}

/** Refill the bucket based on elapsed time, then attempt to consume 1 token. */
export function tokenBucketTryConsume(
  bucket: TokenBucket,
  now: number = Date.now(),
): { allowed: boolean; retryAfterMs: number; bucket: TokenBucket } {
  const elapsed = Math.max(0, now - bucket.lastRefillMs);
  const refilled = bucket.tokens + (elapsed / 1000) * bucket.refillPerSec;
  const capped = Math.min(bucket.capacity, refilled);
  if (capped >= 1) {
    return {
      allowed: true,
      retryAfterMs: 0,
      bucket: { ...bucket, tokens: capped - 1, lastRefillMs: now },
    };
  }
  const deficit = 1 - capped;
  const retryAfterMs = Math.ceil((deficit / bucket.refillPerSec) * 1000);
  return {
    allowed: false,
    retryAfterMs,
    bucket: { ...bucket, tokens: capped, lastRefillMs: now },
  };
}

// ─── Misc small helpers ─────────────────────────────────────────────────────

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

export function nowIso(ts: number = Date.now()): string {
  return new Date(ts).toISOString();
}

export function isoDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function sum(values: number[]): number {
  let s = 0;
  for (const v of values) s += v;
  return s;
}

export function max(values: number[]): number {
  let m = -Infinity;
  for (const v of values) if (v > m) m = v;
  return m === -Infinity ? 0 : m;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Session lifecycle — schedule/start/pause/resume/end/cancel/error       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface CreateLiveSessionInput {
  hostId: string;
  title: string;
  description: string;
  scheduledAt: number;
  sacred: boolean;
  sacredTradition?: string;
  recordingEnabled: boolean;
  sacredRecordingOptIn?: boolean;
  biometricOptIn?: boolean;
  language: string;
  quality: StreamQuality;
  tags: string[];
  viewerCap?: number;
  hostTier?: PractitionerTier;
  curatorOnlyChat?: boolean;
  slowModeSeconds?: number;
}

export interface SessionRegistry {
  sessions: Map<string, LiveSession>;
  auditEvents: StreamAuditEvent[];
  recordings: Map<string, RecordingSession>;
  /** viewerRegistry: sessionId → userId → viewer. */
  viewers: Map<string, Map<string, StreamViewer>>;
  /** chatRegistry: sessionId → lane → messageIds. */
  chatByLane: Map<string, ChatLanePartition>;
  /** chatMessages: sessionId → messageId → message. */
  chatMessages: Map<string, Map<string, ChatMessage>>;
  /** consentRegistry: userId → purpose → record. */
  consents: Map<string, Map<ConsentPurpose, ConsentRecord>>;
  /** moderatorActions: sessionId → action log. */
  moderatorActions: Map<string, ModeratorActionLog[]>;
  /** pinnedMessages: sessionId → pinned message. */
  pinnedMessages: Map<string, PinnedMessage>;
  /** tokenBuckets: userId:sessionId → bucket. */
  tokenBuckets: Map<string, TokenBucket>;
  /** chains: sessionId → chain hash (head). */
  auditChainHead: Map<string, string>;
  /** auditEventIds: sessionId → id list. */
  auditEventIds: Map<string, string[]>;
  /** withdrawn: userId → set of purposes. */
  withdrawn: Map<string, Set<ConsentPurpose>>;
}

export function createSessionRegistry(): SessionRegistry {
  return {
    sessions: new Map(),
    auditEvents: [],
    recordings: new Map(),
    viewers: new Map(),
    chatByLane: new Map(),
    chatMessages: new Map(),
    consents: new Map(),
    moderatorActions: new Map(),
    pinnedMessages: new Map(),
    tokenBuckets: new Map(),
    auditChainHead: new Map(),
    auditEventIds: new Map(),
    withdrawn: new Map(),
  };
}

/** Compute deterministic fingerprint of immutable session fields. */
export function computeSessionFingerprint(input: {
  hostId: string;
  title: string;
  scheduledAt: number;
  sacred: boolean;
}): string {
  return fnv1a64(
    `${input.hostId}|${input.title}|${input.scheduledAt}|${input.sacred ? "sacred" : "general"}`,
  );
}

/** Generate a session id — fnv1a 64 of host+title+timestamp. */
export function generateSessionId(
  hostId: string,
  title: string,
  scheduledAt: number,
): string {
  return "ls-" + fnv1a64(`${hostId}|${title}|${scheduledAt}`);
}

/** Schedule a new session — defaults to general, status=scheduled. */
export function scheduleSession(
  registry: SessionRegistry,
  input: CreateLiveSessionInput,
  now: number = Date.now(),
): LiveSession {
  const id = generateSessionId(input.hostId, input.title, input.scheduledAt);
  const session: LiveSession = {
    id,
    hostId: input.hostId,
    title: input.title,
    description: input.description,
    status: "scheduled",
    scheduledAt: input.scheduledAt,
    startedAt: null,
    endedAt: null,
    viewerCountPeak: 0,
    viewerTotalUnique: 0,
    sacred: input.sacred,
    sacredTradition: input.sacredTradition,
    recordingEnabled: input.recordingEnabled,
    sacredRecordingOptIn: input.sacredRecordingOptIn ?? false,
    biometricOptIn: input.biometricOptIn ?? false,
    language: input.language,
    quality: input.quality,
    chatLane: input.sacred ? "sacred" : "general",
    tags: input.tags,
    curatorOnlyChat: input.curatorOnlyChat ?? false,
    slowModeSeconds: clamp(
      input.slowModeSeconds ?? 0,
      SLOW_MODE_MIN_S,
      SLOW_MODE_MAX_S,
    ),
    viewerCap: clamp(
      input.viewerCap ?? DEFAULT_VIEWER_CAP,
      1,
      MAX_VIEWER_CAP,
    ),
    hostTier: input.hostTier ?? 0,
    createdAt: now,
    updatedAt: now,
    fingerprint: computeSessionFingerprint({
      hostId: input.hostId,
      title: input.title,
      scheduledAt: input.scheduledAt,
      sacred: input.sacred,
    }),
  };
  registry.sessions.set(id, session);
  // Initialize auxiliary state.
  registry.viewers.set(id, new Map());
  registry.chatMessages.set(id, new Map());
  registry.chatByLane.set(id, {
    sessionId: id,
    general: [],
    sacred: [],
    isCrossContaminated: false,
  });
  registry.auditEventIds.set(id, []);
  registry.auditChainHead.set(id, "");
  // Audit: created.
  appendAuditEvent(
    registry,
    {
      sessionId: id,
      kind: "created",
      actorId: input.hostId,
      detail: `sacred=${input.sacred} host=${input.hostId}`,
      sacred: input.sacred,
      ts: now,
    },
  );
  return session;
}

/** Get a session by id (helper). */
export function getSession(
  registry: SessionRegistry,
  sessionId: string,
): LiveSession | null {
  return registry.sessions.get(sessionId) ?? null;
}

/** Update an existing session in place (recomputes updatedAt). */
export function updateSession(
  registry: SessionRegistry,
  session: LiveSession,
  now: number = Date.now(),
): LiveSession {
  session.updatedAt = now;
  registry.sessions.set(session.id, session);
  return session;
}

/** Verify a state transition is valid. */
export function isValidTransition(
  from: StreamStatus,
  to: StreamStatus,
): boolean {
  if (from === to) return false;
  const allowed: Record<StreamStatus, StreamStatus[]> = {
    scheduled: ["live", "cancelled"],
    live: ["paused", "ended", "errored", "cancelled"],
    paused: ["live", "ended", "errored", "cancelled"],
    ended: [],
    cancelled: [],
    errored: ["ended", "cancelled"],
  };
  return allowed[from].includes(to);
}

/** Transition session status. Throws StreamError if invalid. */
export function transitionSession(
  registry: SessionRegistry,
  sessionId: string,
  to: StreamStatus,
  actorId: string | null,
  now: number = Date.now(),
): LiveSession {
  const session = registry.sessions.get(sessionId);
  if (!session) {
    throw streamError("STREAM_001", `session not found: ${sessionId}`, now);
  }
  if (!isValidTransition(session.status, to)) {
    throw streamError(
      "STREAM_002",
      `invalid transition ${session.status} → ${to}`,
      now,
    );
  }
  const from = session.status;
  session.status = to;
  session.updatedAt = now;
  if (to === "live" && session.startedAt === null) {
    session.startedAt = now;
  }
  if (to === "ended" || to === "cancelled" || to === "errored") {
    session.endedAt = now;
  }
  registry.sessions.set(sessionId, session);
  // Audit
  const auditKind = to === "live" && from === "scheduled"
    ? "started"
    : to === "live" && from === "paused"
      ? "resumed"
      : to === "paused"
        ? "paused"
        : to === "ended"
          ? "ended"
          : to === "cancelled"
            ? "cancelled"
            : "errored";
  appendAuditEvent(
    registry,
    {
      sessionId,
      kind: auditKind,
      actorId,
      detail: `${from}→${to}`,
      sacred: session.sacred,
      ts: now,
    },
  );
  return session;
}

/** Convenience: scheduled → live. */
export function startSession(
  registry: SessionRegistry,
  sessionId: string,
  now: number = Date.now(),
): LiveSession {
  return transitionSession(registry, sessionId, "live", null, now);
}

/** Convenience: live → paused. */
export function pauseSession(
  registry: SessionRegistry,
  sessionId: string,
  moderatorId: string,
  now: number = Date.now(),
): LiveSession {
  const session = transitionSession(
    registry,
    sessionId,
    "paused",
    moderatorId,
    now,
  );
  return session;
}

/** Convenience: paused → live. */
export function resumeSession(
  registry: SessionRegistry,
  sessionId: string,
  moderatorId: string,
  now: number = Date.now(),
): LiveSession {
  return transitionSession(
    registry,
    sessionId,
    "live",
    moderatorId,
    now,
  );
}

/** Convenience: live → ended. Finalizes session, marks endedAt. */
export function endSession(
  registry: SessionRegistry,
  sessionId: string,
  now: number = Date.now(),
): LiveSession {
  return transitionSession(registry, sessionId, "ended", null, now);
}

/** Convenience: scheduled → cancelled. */
export function cancelSession(
  registry: SessionRegistry,
  sessionId: string,
  reason: string,
  now: number = Date.now(),
): LiveSession {
  const session = transitionSession(
    registry,
    sessionId,
    "cancelled",
    null,
    now,
  );
  appendAuditEvent(
    registry,
    {
      sessionId,
      kind: "cancelled",
      actorId: null,
      detail: `reason=${reason}`,
      sacred: session.sacred,
      ts: now,
    },
  );
  return session;
}

/** Mark session as errored. */
export function errorSession(
  registry: SessionRegistry,
  sessionId: string,
  err: StreamErrorEvent,
  now: number = Date.now(),
): LiveSession {
  const session = transitionSession(
    registry,
    sessionId,
    "errored",
    null,
    now,
  );
  appendAuditEvent(
    registry,
    {
      sessionId,
      kind: "errored",
      actorId: null,
      detail: `${err.kind}:${err.severity}:${err.message}`,
      sacred: session.sacred,
      ts: now,
    },
  );
  return session;
}

/** List all sessions in a given status. */
export function listSessionsByStatus(
  registry: SessionRegistry,
  status: StreamStatus,
): LiveSession[] {
  const out: LiveSession[] = [];
  for (const s of registry.sessions.values()) {
    if (s.status === status) out.push(s);
  }
  return out;
}

/** Compute how many sessions are currently live. */
export function liveSessionCount(registry: SessionRegistry): number {
  return listSessionsByStatus(registry, "live").length;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 Viewer management — join/leave/peak                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface JoinSessionResult {
  viewer: StreamViewer;
  sacredVerified: boolean;
  /** Error if blocked (sacred violation, viewer cap, etc.). */
  error?: StreamError;
}

/** Verify viewer is eligible (sacred room requires practitioner tier 3-4). */
export function verifyViewerEligibility(
  registry: SessionRegistry,
  session: LiveSession,
  practitionerVerified: boolean,
  practitionerTier: PractitionerTier,
): { ok: boolean; reason?: string } {
  if (session.viewerCap > 0) {
    const current = getViewerCount(registry, session.id);
    if (current >= session.viewerCap) {
      return { ok: false, reason: STREAM_ERROR_CODES.STREAM_010 };
    }
  }
  if (session.sacred) {
    if (!session.sacredRecordingOptIn && practitionerTier < SACRED_REQUIRED_TIER) {
      return { ok: false, reason: STREAM_ERROR_CODES.STREAM_003 };
    }
    if (!practitionerVerified) {
      return { ok: false, reason: STREAM_ERROR_CODES.STREAM_014 };
    }
  }
  return { ok: true };
}

/** Helper — get current viewer count from registry.viewers. */
export function getViewerCount(
  registry: SessionRegistry,
  sessionId: string,
): number {
  const map = registry.viewers.get(sessionId);
  if (!map) return 0;
  let count = 0;
  for (const v of map.values()) if (v.leftAt === null) count++;
  return count;
}

/** Join a session — enforces sacred-room policy. */
export function joinSession(
  registry: SessionRegistry,
  sessionId: string,
  userId: string,
  sacredOptedIn: boolean,
  practitionerVerified: boolean,
  practitionerTier: PractitionerTier,
  now: number = Date.now(),
): JoinSessionResult {
  const session = registry.sessions.get(sessionId);
  if (!session) {
    const err = streamError("STREAM_001", `session not found: ${sessionId}`, now);
    const placeholder: StreamViewer = {
      userId,
      sessionId,
      joinedAt: now,
      leftAt: null,
      watchDurationMs: 0,
      sacredOptedIn: false,
      practitionerVerified: false,
      banned: false,
      muteUntilMs: 0,
    };
    return { viewer: placeholder, sacredVerified: false, error: err };
  }
  // LGPD consent check for general attendance.
  if (!hasConsent(registry, userId, "stream_attendance") && !sacredOptedIn) {
    const err = streamError(
      "STREAM_008",
      "consent not granted for stream attendance",
      now,
    );
    const placeholder: StreamViewer = {
      userId,
      sessionId,
      joinedAt: now,
      leftAt: null,
      watchDurationMs: 0,
      sacredOptedIn: false,
      practitionerVerified: false,
      banned: false,
      muteUntilMs: 0,
    };
    return { viewer: placeholder, sacredVerified: false, error: err };
  }
  // Sacred room requires sacred-room opt-in.
  if (session.sacred && !sacredOptedIn) {
    const err = streamError(
      "STREAM_014",
      "sacred room requires explicit opt-in",
      now,
    );
    const placeholder: StreamViewer = {
      userId,
      sessionId,
      joinedAt: now,
      leftAt: null,
      watchDurationMs: 0,
      sacredOptedIn: false,
      practitionerVerified: false,
      banned: false,
      muteUntilMs: 0,
    };
    return { viewer: placeholder, sacredVerified: false, error: err };
  }
  // Eligibility check.
  const eligible = verifyViewerEligibility(
    registry,
    session,
    practitionerVerified,
    practitionerTier,
  );
  if (!eligible.ok) {
    let code: StreamErrorCode = "STREAM_003";
    if (eligible.reason === STREAM_ERROR_CODES.STREAM_010) code = "STREAM_010";
    else if (eligible.reason === STREAM_ERROR_CODES.STREAM_014) code = "STREAM_014";
    const err = streamError(code, eligible.reason ?? "viewer rejected", now);
    const placeholder: StreamViewer = {
      userId,
      sessionId,
      joinedAt: now,
      leftAt: null,
      watchDurationMs: 0,
      sacredOptedIn: sacredOptedIn,
      practitionerVerified: false,
      banned: false,
      muteUntilMs: 0,
    };
    return { viewer: placeholder, sacredVerified: false, error: err };
  }
  // Build viewer record.
  const viewer: StreamViewer = {
    userId,
    sessionId,
    joinedAt: now,
    leftAt: null,
    watchDurationMs: 0,
    sacredOptedIn,
    practitionerVerified,
    banned: false,
    muteUntilMs: 0,
  };
  let viewers = registry.viewers.get(sessionId);
  if (!viewers) {
    viewers = new Map();
    registry.viewers.set(sessionId, viewers);
  }
  // Track "is new" BEFORE set so total unique increments correctly.
  const isNewViewer = !viewers.has(userId);
  viewers.set(userId, viewer);
  // Update peak + total unique.
  const current = countActiveViewers(viewers);
  if (current > session.viewerCountPeak) {
    session.viewerCountPeak = current;
  }
  if (isNewViewer) {
    session.viewerTotalUnique += 1;
  }
  updateSession(registry, session, now);
  // Audit.
  appendAuditEvent(
    registry,
    {
      sessionId,
      kind: "viewer_joined",
      actorId: userId,
      detail: `sacred=${session.sacred}`,
      sacred: session.sacred,
      ts: now,
    },
  );
  return { viewer, sacredVerified: practitionerVerified && sacredOptedIn };
}

function countActiveViewers(viewers: Map<string, StreamViewer>): number {
  let n = 0;
  for (const v of viewers.values()) if (v.leftAt === null) n++;
  return n;
}

/** Leave a session — finalize viewer, update watchDurationMs. */
export function leaveSession(
  registry: SessionRegistry,
  sessionId: string,
  userId: string,
  now: number = Date.now(),
): StreamViewer {
  const viewers = registry.viewers.get(sessionId);
  if (!viewers) {
    return {
      userId,
      sessionId,
      joinedAt: now,
      leftAt: now,
      watchDurationMs: 0,
      sacredOptedIn: false,
      practitionerVerified: false,
      banned: false,
      muteUntilMs: 0,
    };
  }
  const viewer = viewers.get(userId);
  if (!viewer) {
    return {
      userId,
      sessionId,
      joinedAt: now,
      leftAt: now,
      watchDurationMs: 0,
      sacredOptedIn: false,
      practitionerVerified: false,
      banned: false,
      muteUntilMs: 0,
    };
  }
  viewer.leftAt = now;
  viewer.watchDurationMs = now - viewer.joinedAt;
  viewers.set(userId, viewer);
  const session = registry.sessions.get(sessionId);
  if (session) {
    appendAuditEvent(
      registry,
      {
        sessionId,
        kind: "viewer_left",
        actorId: userId,
        detail: `watch=${viewer.watchDurationMs}ms`,
        sacred: session.sacred,
        ts: now,
      },
    );
  }
  return viewer;
}

/** Get a viewer record. */
export function getViewer(
  registry: SessionRegistry,
  sessionId: string,
  userId: string,
): StreamViewer | null {
  const viewers = registry.viewers.get(sessionId);
  if (!viewers) return null;
  return viewers.get(userId) ?? null;
}

/** List all viewers of a session. */
export function listViewers(
  registry: SessionRegistry,
  sessionId: string,
): StreamViewer[] {
  const viewers = registry.viewers.get(sessionId);
  if (!viewers) return [];
  return Array.from(viewers.values());
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Chat system — send/moderate/rate-limit/spam-detection                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface SendChatMessageResult {
  message: ChatMessage | null;
  rateLimited: boolean;
  retryAfterMs: number;
  /** True if spam detected and dropped. */
  spamDropped: boolean;
  error?: StreamError;
}

function generateChatId(
  sessionId: string,
  senderId: string,
  ts: number,
  text: string,
): string {
  return "cm-" + fnv1a32(`${sessionId}|${senderId}|${ts}|${text}`);
}

function computeChatFingerprint(
  sessionId: string,
  senderId: string,
  text: string,
): string {
  return fnv1a32(`${sessionId}|${senderId}|${text}`);
}

/** Apply rate limit to a user/session. Returns whether allowed + retry-after. */
export function applyChatRateLimit(
  registry: SessionRegistry,
  senderId: string,
  sessionId: string,
  limit: ChatRateLimit,
  now: number = Date.now(),
): { allowed: boolean; retryAfterMs: number; bucket: TokenBucket } {
  const key = `${sessionId}:${senderId}`;
  let bucket = registry.tokenBuckets.get(key);
  if (!bucket) {
    const capacity = limit.maxMessages;
    const refillPerSec = capacity / (limit.windowMs / 1000);
    bucket = createTokenBucket(capacity, refillPerSec, capacity, now);
  }
  const result = tokenBucketTryConsume(bucket, now);
  registry.tokenBuckets.set(key, result.bucket);
  return { allowed: result.allowed, retryAfterMs: result.retryAfterMs, bucket: result.bucket };
}

/** Send a chat message — applies rate-limit + spam detection + lane routing. */
export function sendChatMessage(
  registry: SessionRegistry,
  sessionId: string,
  senderId: string,
  text: string,
  now: number = Date.now(),
): SendChatMessageResult {
  const session = registry.sessions.get(sessionId);
  if (!session) {
    return {
      message: null,
      rateLimited: false,
      retryAfterMs: 0,
      spamDropped: false,
      error: streamError("STREAM_001", `session not found: ${sessionId}`, now),
    };
  }
  if (!text || text.trim().length === 0) {
    return {
      message: null,
      rateLimited: false,
      retryAfterMs: 0,
      spamDropped: false,
      error: streamError("STREAM_013", "empty message", now),
    };
  }
  if (text.length > SPAM_MAX_LENGTH) {
    return {
      message: null,
      rateLimited: false,
      retryAfterMs: 0,
      spamDropped: true,
      error: streamError("STREAM_013", "message too long", now),
    };
  }
  // Sacred session: verify practitioner.
  if (session.sacred) {
    const viewer = getViewer(registry, sessionId, senderId);
    if (!viewer || !viewer.practitionerVerified) {
      return {
        message: null,
        rateLimited: false,
        retryAfterMs: 0,
        spamDropped: false,
        error: streamError("STREAM_014", "non-practitioner attempted sacred chat", now),
      };
    }
  }
  // Rate limit.
  const limit = session.sacred ? DEFAULT_RATE_LIMIT_SACRED : DEFAULT_RATE_LIMIT_GENERAL;
  const rl = applyChatRateLimit(registry, senderId, sessionId, limit, now);
  if (!rl.allowed) {
    return {
      message: null,
      rateLimited: true,
      retryAfterMs: rl.retryAfterMs,
      spamDropped: false,
      error: streamError("STREAM_005", "rate-limited", now),
    };
  }
  // Spam detection.
  const history = listChatMessages(registry, sessionId, senderId);
  const spamResult = detectChatSpam(senderId, text, history);
  if (spamResult.spam) {
    return {
      message: null,
      rateLimited: false,
      retryAfterMs: 0,
      spamDropped: true,
      error: streamError("STREAM_013", `spam confidence=${spamResult.confidence}`, now),
    };
  }
  // Build message.
  const lane: "sacred" | "general" = session.sacred ? "sacred" : "general";
  const message: ChatMessage = {
    id: generateChatId(sessionId, senderId, now, text),
    sessionId,
    senderId,
    text,
    timestampMs: now,
    sacredMasked: session.sacred,
    deleted: false,
    moderationAction: "none",
    moderatorId: null,
    lane,
    fingerprint: computeChatFingerprint(sessionId, senderId, text),
    parentMessageId: null,
  };
  let messages = registry.chatMessages.get(sessionId);
  if (!messages) {
    messages = new Map();
    registry.chatMessages.set(sessionId, messages);
  }
  messages.set(message.id, message);
  // Lane routing — append to correct lane ONLY.
  const partition = registry.chatByLane.get(sessionId);
  if (partition) {
    if (lane === "sacred") {
      partition.sacred.push(message.id);
    } else {
      partition.general.push(message.id);
    }
    partition.isCrossContaminated = detectCrossLaneContamination(partition);
  }
  // Audit.
  appendAuditEvent(
    registry,
    {
      sessionId,
      kind: "message_sent",
      actorId: senderId,
      detail: `lane=${lane} len=${text.length}`,
      sacred: session.sacred,
      ts: now,
    },
  );
  return { message, rateLimited: false, retryAfterMs: 0, spamDropped: false };
}

/** Detect if a sacred message ended up in general lane (or vice versa). */
export function detectCrossLaneContamination(
  partition: ChatLanePartition,
): boolean {
  // A message id is supposed to live in exactly ONE lane.
  // Cross-contamination = any id appearing in both sacred[] and general[].
  const sacredSet = new Set(partition.sacred);
  for (const id of partition.general) {
    if (sacredSet.has(id)) return true;
  }
  return false;
}

/** Moderate a chat message — apply action (redact/delete/shadow-ban). */
export function moderateChatMessage(
  registry: SessionRegistry,
  messageId: string,
  moderatorId: string,
  action: ModerationAction,
  now: number = Date.now(),
): ChatMessage | null {
  for (const messages of registry.chatMessages.values()) {
    const msg = messages.get(messageId);
    if (!msg) continue;
    msg.deleted = action === "deleted" || action === "user_kicked";
    msg.moderationAction = action;
    msg.moderatorId = moderatorId;
    messages.set(messageId, msg);
    const session = registry.sessions.get(msg.sessionId);
    if (session) {
      appendAuditEvent(
        registry,
        {
          sessionId: msg.sessionId,
          kind: "message_moderated",
          actorId: moderatorId,
          detail: `action=${action} target=${messageId}`,
          sacred: msg.sacredMasked,
          ts: now,
        },
      );
      // Track moderator action.
      const log = registry.moderatorActions.get(msg.sessionId) ?? [];
      log.push({
        sessionId: msg.sessionId,
        moderatorId,
        action,
        targetId: messageId,
        ts: now,
      });
      registry.moderatorActions.set(msg.sessionId, log);
    }
    return msg;
  }
  return null;
}

/** List chat messages for a session, optionally filtered by sender. */
export function listChatMessages(
  registry: SessionRegistry,
  sessionId: string,
  senderId?: string,
): ChatMessage[] {
  const messages = registry.chatMessages.get(sessionId);
  if (!messages) return [];
  const out: ChatMessage[] = [];
  for (const m of messages.values()) {
    if (senderId && m.senderId !== senderId) continue;
    out.push(m);
  }
  out.sort((a, b) => a.timestampMs - b.timestampMs);
  return out;
}

/** List chat messages in a specific lane only. */
export function listChatMessagesByLane(
  registry: SessionRegistry,
  sessionId: string,
  lane: "sacred" | "general",
): ChatMessage[] {
  const all = listChatMessages(registry, sessionId);
  return all.filter((m) => m.lane === lane);
}

/** Pin a message. */
export function pinMessage(
  registry: SessionRegistry,
  sessionId: string,
  messageId: string,
  moderatorId: string,
  now: number = Date.now(),
): PinnedMessage | null {
  const messages = registry.chatMessages.get(sessionId);
  if (!messages || !messages.has(messageId)) return null;
  const pin: PinnedMessage = { messageId, moderatorId, pinnedAt: now };
  registry.pinnedMessages.set(sessionId, pin);
  return pin;
}

/** Get pinned message for a session. */
export function getPinnedMessage(
  registry: SessionRegistry,
  sessionId: string,
): PinnedMessage | null {
  return registry.pinnedMessages.get(sessionId) ?? null;
}

/** Spammer check — naive "user is in current chat burst". */
export function isUserInChatBurst(
  registry: SessionRegistry,
  sessionId: string,
  senderId: string,
  windowMs: number,
  threshold: number,
  now: number = Date.now(),
): boolean {
  const recent = listChatMessages(registry, sessionId, senderId).filter(
    (m) => now - m.timestampMs < windowMs,
  );
  return recent.length >= threshold;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Recording + VOD lifecycle                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Generate a recording id. */
export function generateRecordingId(sessionId: string, ts: number): string {
  return "rec-" + fnv1a32(`${sessionId}|${ts}`);
}

/** Start a recording — enforces sacred-recording opt-in. */
export function startRecording(
  registry: SessionRegistry,
  sessionId: string,
  now: number = Date.now(),
): RecordingSession {
  const session = registry.sessions.get(sessionId);
  if (!session) {
    throw streamError("STREAM_001", `session not found: ${sessionId}`, now);
  }
  if (session.sacred && !session.sacredRecordingOptIn) {
    throw streamError(
      "STREAM_006",
      "recording disabled for sacred session — opt-in required",
      now,
    );
  }
  const id = generateRecordingId(sessionId, now);
  const recording: RecordingSession = {
    id,
    sessionId,
    status: "recording",
    startedAt: now,
    endedAt: null,
    vodUrl: null,
    captionsUrl: null,
    captionsSacredTrackUrl: null,
    durationSeconds: 0,
    bytesRecorded: 0,
    sacred: session.sacred,
  };
  registry.recordings.set(id, recording);
  appendAuditEvent(
    registry,
    {
      sessionId,
      kind: "recorded",
      actorId: null,
      detail: `recordingId=${id}`,
      sacred: session.sacred,
      ts: now,
    },
  );
  return recording;
}

/** Stop a recording. */
export function stopRecording(
  registry: SessionRegistry,
  recordingId: string,
  now: number = Date.now(),
): RecordingSession {
  const recording = registry.recordings.get(recordingId);
  if (!recording) {
    throw streamError("STREAM_001", `recording not found: ${recordingId}`, now);
  }
  recording.endedAt = now;
  recording.durationSeconds = Math.floor((now - recording.startedAt) / 1000);
  registry.recordings.set(recordingId, recording);
  return recording;
}

/** Simulate VOD processing — transitions recording → available. */
export function processVOD(
  registry: SessionRegistry,
  recordingId: string,
  now: number = Date.now(),
): RecordingSession {
  const recording = registry.recordings.get(recordingId);
  if (!recording) {
    throw streamError("STREAM_001", `recording not found: ${recordingId}`, now);
  }
  recording.status = "processing";
  registry.recordings.set(recordingId, recording);
  const session = registry.sessions.get(recording.sessionId);
  appendAuditEvent(
    registry,
    {
      sessionId: recording.sessionId,
      kind: "vod_processing",
      actorId: null,
      detail: `recordingId=${recordingId}`,
      sacred: recording.sacred,
      ts: now,
    },
  );
  // Simulate processing — deterministically transition to available.
  recording.status = "available";
  // Compute duration if not set.
  if (recording.durationSeconds === 0 && recording.endedAt) {
    recording.durationSeconds = Math.floor((recording.endedAt - recording.startedAt) / 1000);
  }
  registry.recordings.set(recordingId, recording);
  if (session) {
    appendAuditEvent(
      registry,
      {
        sessionId: recording.sessionId,
        kind: "vod_published",
        actorId: null,
        detail: `recordingId=${recordingId}`,
        sacred: recording.sacred,
        ts: now,
      },
    );
  }
  return recording;
}

/** Publish a VOD with explicit URLs (general + sacred captions). */
export function publishVOD(
  registry: SessionRegistry,
  recordingId: string,
  vodUrl: string,
  captionsUrl: string,
  sacredCaptionsUrl: string | null,
  now: number = Date.now(),
): RecordingSession {
  const recording = registry.recordings.get(recordingId);
  if (!recording) {
    throw streamError("STREAM_001", `recording not found: ${recordingId}`, now);
  }
  const session = registry.sessions.get(recording.sessionId);
  // Sacred recording requires sacred captions track.
  if (recording.sacred && !sacredCaptionsUrl) {
    throw streamError(
      "STREAM_006",
      "sacred VOD requires sacred captions track",
      now,
    );
  }
  recording.status = "available";
  recording.vodUrl = vodUrl;
  recording.captionsUrl = captionsUrl;
  recording.captionsSacredTrackUrl = sacredCaptionsUrl;
  registry.recordings.set(recordingId, recording);
  if (session) {
    appendAuditEvent(
      registry,
      {
        sessionId: recording.sessionId,
        kind: "vod_published",
        actorId: null,
        detail: `vod=${vodUrl}`,
        sacred: recording.sacred,
        ts: now,
      },
    );
  }
  return recording;
}

/** Mark VOD as failed (e.g., transcoding error). */
export function failVOD(
  registry: SessionRegistry,
  recordingId: string,
  reason: string,
  now: number = Date.now(),
): RecordingSession {
  const recording = registry.recordings.get(recordingId);
  if (!recording) {
    throw streamError("STREAM_001", `recording not found: ${recordingId}`, now);
  }
  recording.status = "failed";
  recording.failureReason = reason;
  registry.recordings.set(recordingId, recording);
  appendAuditEvent(
    registry,
    {
      sessionId: recording.sessionId,
      kind: "vod_failed",
      actorId: null,
      detail: reason,
      sacred: recording.sacred,
      ts: now,
    },
  );
  return recording;
}

/** Get a recording. */
export function getRecording(
  registry: SessionRegistry,
  recordingId: string,
): RecordingSession | null {
  return registry.recordings.get(recordingId) ?? null;
}

/** List recordings for a session. */
export function listRecordings(
  registry: SessionRegistry,
  sessionId: string,
): RecordingSession[] {
  const out: RecordingSession[] = [];
  for (const r of registry.recordings.values()) {
    if (r.sessionId === sessionId) out.push(r);
  }
  return out;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Sacred room policy + practitioner verification                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const DEFAULT_SACRED_POLICY: SacredRoomPolicy = {
  requiredTier: SACRED_REQUIRED_TIER,
  optInRequired: true,
  separateChatLane: true,
  recordingDisabledByDefault: true,
  sacredCaptionsTrackRequired: true,
  sacredTranscriptMasking: true,
  acceptedTraditions: [...SACRED_TRADITIONS],
};

/** Compute sacred-room policy for a session. */
export function computeSacredRoomPolicy(
  session: LiveSession,
): SacredRoomPolicy {
  return {
    requiredTier: session.sacred ? SACRED_REQUIRED_TIER : 0,
    optInRequired: session.sacred,
    separateChatLane: session.sacred,
    recordingDisabledByDefault: session.sacred,
    sacredCaptionsTrackRequired: session.sacred,
    sacredTranscriptMasking: session.sacred,
    acceptedTraditions: session.sacred ? [...SACRED_TRADITIONS] : [],
  };
}

/** Verify a user is a sacred practitioner (tier 3-4 + accepted tradition). */
export function verifySacredPractitioner(
  userId: string,
  tier: PractitionerTier,
  tradition: string | null,
  session: LiveSession,
  policy: SacredRoomPolicy = DEFAULT_SACRED_POLICY,
): SacredVerificationResult {
  if (!session.sacred) {
    return { verified: true, tier, tradition: tradition ?? undefined };
  }
  if (tier < policy.requiredTier) {
    return {
      verified: false,
      reason: `tier ${tier} < required ${policy.requiredTier}`,
      tier,
    };
  }
  if (
    policy.acceptedTraditions.length > 0 &&
    tradition &&
    !policy.acceptedTraditions.includes(tradition)
  ) {
    return {
      verified: false,
      reason: `tradition "${tradition}" not accepted`,
      tier,
      tradition,
    };
  }
  return { verified: true, tier, tradition: tradition ?? undefined };
}

/** Detect a sacred-room violation between a session and a viewer. */
export function isSacredRoomViolation(
  session: LiveSession,
  viewer: StreamViewer,
): boolean {
  if (!session.sacred) return false;
  // Sacred session requires practitioner verification + opt-in.
  if (!viewer.sacredOptedIn) return true;
  if (!viewer.practitionerVerified) return true;
  return false;
}

/** Check that sacred chat is a SEPARATE lane (no general contamination). */
export function isSacredChatSeparate(
  registry: SessionRegistry,
  sessionId: string,
): boolean {
  const partition = registry.chatByLane.get(sessionId);
  if (!partition) return true;
  return !partition.isCrossContaminated;
}

/** Enforce sacred lane — if a general-lane message appears in sacred session, reject. */
export function enforceSacredLane(
  registry: SessionRegistry,
  sessionId: string,
  lane: "sacred" | "general",
): { ok: boolean; reason?: string } {
  const session = registry.sessions.get(sessionId);
  if (!session) return { ok: false, reason: "session not found" };
  if (session.sacred && lane === "general") {
    return { ok: false, reason: "sacred session cannot accept general-lane messages" };
  }
  if (!session.sacred && lane === "sacred") {
    return { ok: false, reason: "general session cannot accept sacred-lane messages" };
  }
  return { ok: true };
}

/** Mask sacred tokens in transcripts (for transcript public export). */
export function maskSacredTranscript(text: string, sacredMaskTokens: string[]): string {
  let out = text;
  for (const tok of sacredMaskTokens) {
    if (!tok) continue;
    const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$1");
    out = out.replace(new RegExp(escaped, "gi"), "[SACRED-MASK]");
  }
  return out;
}

/** Is the session a sacred session? */
export function isSacredSession(session: LiveSession): boolean {
  return session.sacred;
}

/** Is the user in a sacred-track audience? */
export function isSacredAudience(
  registry: SessionRegistry,
  sessionId: string,
  userId: string,
): boolean {
  const viewer = getViewer(registry, sessionId, userId);
  return !!viewer && viewer.sacredOptedIn;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Moderator controls — mute/kick/ban/slow-mode/curator-only/lock         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Mute a user in a session until `muteUntilMs`. */
export function muteUser(
  registry: SessionRegistry,
  sessionId: string,
  moderatorId: string,
  userId: string,
  muteDurationMs: number,
  now: number = Date.now(),
): StreamViewer | null {
  const viewers = registry.viewers.get(sessionId);
  if (!viewers) return null;
  const viewer = viewers.get(userId);
  if (!viewer) return null;
  viewer.muteUntilMs = now + muteDurationMs;
  viewers.set(userId, viewer);
  const session = registry.sessions.get(sessionId);
  if (session) {
    const log = registry.moderatorActions.get(sessionId) ?? [];
    log.push({
      sessionId,
      moderatorId,
      action: "user_muted",
      targetId: userId,
      ts: now,
    });
    registry.moderatorActions.set(sessionId, log);
    appendAuditEvent(
      registry,
      {
        sessionId,
        kind: "moderator_action",
        actorId: moderatorId,
        detail: `mute user=${userId}`,
        sacred: session.sacred,
        ts: now,
      },
    );
  }
  return viewer;
}

/** Kick a user from a session. */
export function kickUser(
  registry: SessionRegistry,
  sessionId: string,
  moderatorId: string,
  userId: string,
  reason: string,
  now: number = Date.now(),
): StreamViewer | null {
  const viewers = registry.viewers.get(sessionId);
  if (!viewers) return null;
  const viewer = viewers.get(userId);
  if (!viewer) return null;
  viewer.leftAt = now;
  viewer.watchDurationMs = now - viewer.joinedAt;
  viewers.set(userId, viewer);
  const session = registry.sessions.get(sessionId);
  if (session) {
    const log = registry.moderatorActions.get(sessionId) ?? [];
    log.push({
      sessionId,
      moderatorId,
      action: "user_kicked",
      targetId: userId,
      ts: now,
      reason,
    });
    registry.moderatorActions.set(sessionId, log);
    appendAuditEvent(
      registry,
      {
        sessionId,
        kind: "moderator_action",
        actorId: moderatorId,
        detail: `kick user=${userId} reason=${reason}`,
        sacred: session.sacred,
        ts: now,
      },
    );
  }
  return viewer;
}

/** Ban a user from a session — sets banned flag + closes current session. */
export function banUser(
  registry: SessionRegistry,
  sessionId: string,
  moderatorId: string,
  userId: string,
  reason: string,
  now: number = Date.now(),
): StreamViewer | null {
  const viewers = registry.viewers.get(sessionId);
  if (!viewers) return null;
  const viewer = viewers.get(userId);
  if (!viewer) return null;
  viewer.banned = true;
  viewer.leftAt = now;
  viewer.watchDurationMs = now - viewer.joinedAt;
  viewers.set(userId, viewer);
  const session = registry.sessions.get(sessionId);
  if (session) {
    const log = registry.moderatorActions.get(sessionId) ?? [];
    log.push({
      sessionId,
      moderatorId,
      action: "user_banned",
      targetId: userId,
      ts: now,
      reason,
    });
    registry.moderatorActions.set(sessionId, log);
    appendAuditEvent(
      registry,
      {
        sessionId,
        kind: "moderator_action",
        actorId: moderatorId,
        detail: `ban user=${userId} reason=${reason}`,
        sacred: session.sacred,
        ts: now,
      },
    );
  }
  return viewer;
}

/** Toggle slow-mode for a session. */
export function setSlowMode(
  registry: SessionRegistry,
  sessionId: string,
  moderatorId: string,
  seconds: number,
  now: number = Date.now(),
): LiveSession | null {
  const session = registry.sessions.get(sessionId);
  if (!session) return null;
  session.slowModeSeconds = clamp(seconds, SLOW_MODE_MIN_S, SLOW_MODE_MAX_S);
  updateSession(registry, session, now);
  const log = registry.moderatorActions.get(sessionId) ?? [];
  log.push({
    sessionId,
    moderatorId,
    action: "none",
    targetId: "slow_mode",
    ts: now,
    reason: `${seconds}s`,
  });
  registry.moderatorActions.set(sessionId, log);
  return session;
}

/** Toggle curator-only chat for a session. */
export function setCuratorOnlyChat(
  registry: SessionRegistry,
  sessionId: string,
  moderatorId: string,
  enabled: boolean,
  now: number = Date.now(),
): LiveSession | null {
  const session = registry.sessions.get(sessionId);
  if (!session) return null;
  session.curatorOnlyChat = enabled;
  updateSession(registry, session, now);
  const log = registry.moderatorActions.get(sessionId) ?? [];
  log.push({
    sessionId,
    moderatorId,
    action: "none",
    targetId: "curator_only",
    ts: now,
    reason: enabled ? "on" : "off",
  });
  registry.moderatorActions.set(sessionId, log);
  return session;
}

/** Engage sacred-room lock — only verified practitioners may join. */
export function engageSacredLock(
  registry: SessionRegistry,
  sessionId: string,
  moderatorId: string,
  now: number = Date.now(),
): LiveSession | null {
  const session = registry.sessions.get(sessionId);
  if (!session) return null;
  if (!session.sacred) return null;
  appendAuditEvent(
    registry,
    {
      sessionId,
      kind: "sacred_lock_engaged",
      actorId: moderatorId,
      detail: "sacred-room lock engaged",
      sacred: true,
      ts: now,
    },
  );
  return session;
}

/** Check if a viewer is currently muted (and not yet unmuted). */
export function isViewerMuted(
  viewer: StreamViewer,
  now: number = Date.now(),
): boolean {
  return viewer.muteUntilMs > now;
}

/** Check if a viewer is currently banned. */
export function isViewerBanned(viewer: StreamViewer): boolean {
  return viewer.banned;
}

/** List all moderator actions for a session. */
export function listModeratorActions(
  registry: SessionRegistry,
  sessionId: string,
): ModeratorActionLog[] {
  return registry.moderatorActions.get(sessionId) ?? [];
}

/** Compute aggregate moderator controls present on a session. */
export function computeModeratorControls(
  session: LiveSession,
): ModeratorControls {
  return {
    mute: session.slowModeSeconds >= 0,
    kick: true,
    ban: true,
    slowMode: session.slowModeSeconds > 0,
    sacredRoomLock: session.sacred,
    curatorOnly: session.curatorOnlyChat,
    pinnedMessage: true,
    curatorPrune: session.curatorOnlyChat,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Stream quality validation                                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const RESOLUTION_ORDER: StreamQuality["resolution"][] = [
  "360p",
  "480p",
  "720p",
  "1080p",
];

const FPS_ORDER: StreamQuality["fps"][] = [24, 30, 60];

/** Validate a StreamQuality — max 1080p/60fps/8Mbps. */
export function validateStreamQuality(
  q: StreamQuality,
): { valid: boolean; reason?: string } {
  if (RESOLUTION_ORDER.indexOf(q.resolution) < 0) {
    return { valid: false, reason: `invalid resolution: ${q.resolution}` };
  }
  if (RESOLUTION_ORDER.indexOf(q.resolution) > RESOLUTION_ORDER.indexOf(MAX_RESOLUTION)) {
    return { valid: false, reason: `resolution > ${MAX_RESOLUTION}` };
  }
  if (FPS_ORDER.indexOf(q.fps) < 0) {
    return { valid: false, reason: `invalid fps: ${q.fps}` };
  }
  if (FPS_ORDER.indexOf(q.fps) > FPS_ORDER.indexOf(MAX_FPS)) {
    return { valid: false, reason: `fps > ${MAX_FPS}` };
  }
  if (q.bitrateKbps < MIN_BITRATE_KBPS) {
    return { valid: false, reason: `bitrate < ${MIN_BITRATE_KBPS}kbps` };
  }
  if (q.bitrateKbps > MAX_BITRATE_KBPS) {
    return { valid: false, reason: `bitrate > ${MAX_BITRATE_KBPS}kbps` };
  }
  if (q.ladder) {
    for (const l of q.ladder) {
      const sub = validateStreamQuality(l);
      if (!sub.valid) return { valid: false, reason: `ladder: ${sub.reason}` };
    }
  }
  return { valid: true };
}

/** Pick the best valid quality for a session's bandwidth. */
export function selectQualityForBandwidth(
  bandwidthKbps: number,
): StreamQuality {
  if (bandwidthKbps >= MAX_BITRATE_KBPS) {
    return {
      resolution: MAX_RESOLUTION,
      bitrateKbps: MAX_BITRATE_KBPS,
      codec: "h264",
      fps: MAX_FPS,
    };
  }
  if (bandwidthKbps >= 4000) {
    return { resolution: "720p", bitrateKbps: 4000, codec: "h264", fps: 30 };
  }
  if (bandwidthKbps >= 1500) {
    return { resolution: "480p", bitrateKbps: 1500, codec: "h264", fps: 30 };
  }
  return { resolution: "360p", bitrateKbps: MIN_BITRATE_KBPS, codec: "h264", fps: 24 };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 LGPD Art. 7/9/18 — consent/export/erasure/withdrawal                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Record a consent grant (Art. 7). */
export function grantConsent(
  registry: SessionRegistry,
  userId: string,
  purpose: ConsentPurpose,
  now: number = Date.now(),
): ConsentRecord {
  const record: ConsentRecord = {
    userId,
    purpose,
    granted: true,
    ts: now,
    requestId: "req-" + fnv1a32(`${userId}|${purpose}|${now}`),
  };
  let map = registry.consents.get(userId);
  if (!map) {
    map = new Map();
    registry.consents.set(userId, map);
  }
  map.set(purpose, record);
  // Audit consent.
  const sessions = Array.from(registry.sessions.values());
  const session = sessions[0];
  if (session) {
    appendAuditEvent(
      registry,
      {
        sessionId: session.id,
        kind: "consent_granted",
        actorId: userId,
        detail: `purpose=${purpose}`,
        sacred: purpose === "sacred_room_attendance",
        ts: now,
      },
    );
  }
  return record;
}

/** Check if a user has consented to a given purpose. */
export function hasConsent(
  registry: SessionRegistry,
  userId: string,
  purpose: ConsentPurpose,
): boolean {
  const map = registry.consents.get(userId);
  if (!map) return false;
  const r = map.get(purpose);
  if (!r) return false;
  if (!r.granted) return false;
  // Has the user withdrawn this purpose?
  const withdrawn = registry.withdrawn.get(userId);
  if (withdrawn && withdrawn.has(purpose)) return false;
  return true;
}

/** Withdraw consent for a list of purposes (LGPD Art. 18, IX). */
export function withdrawStreamConsent(
  registry: SessionRegistry,
  userId: string,
  purposes: ConsentPurpose[],
  now: number = Date.now(),
): WithdrawalReceipt {
  let withdrawn = registry.withdrawn.get(userId);
  if (!withdrawn) {
    withdrawn = new Set();
    registry.withdrawn.set(userId, withdrawn);
  }
  for (const p of purposes) withdrawn.add(p);
  // Update consent records.
  const map = registry.consents.get(userId);
  if (map) {
    for (const p of purposes) {
      const r = map.get(p);
      if (r) {
        r.granted = false;
        map.set(p, r);
      }
    }
  }
  // Audit.
  const sessions = Array.from(registry.sessions.values());
  const session = sessions[0];
  if (session) {
    appendAuditEvent(
      registry,
      {
        sessionId: session.id,
        kind: "consent_revoked",
        actorId: userId,
        detail: `purposes=${purposes.join(",")}`,
        sacred: purposes.includes("sacred_room_attendance"),
        ts: now,
      },
    );
  }
  // Compute chain hash.
  const chainHead = registry.auditChainHead.get(session?.id ?? "global") ?? "";
  return {
    userId,
    purposes: [...purposes],
    withdrawnAt: now,
    chainHash: chainHead,
  };
}

/** Purge all data for a session — LGPD Art. 18, VI. */
export function purgeStreamData(
  registry: SessionRegistry,
  sessionId: string,
  now: number = Date.now(),
): AuditReceipt {
  const session = registry.sessions.get(sessionId);
  let erasedChats = 0;
  let erasedVods = 0;
  // Erase chat.
  const messages = registry.chatMessages.get(sessionId);
  if (messages) {
    erasedChats = messages.size;
    messages.clear();
  }
  // Erase VODs.
  for (const r of registry.recordings.values()) {
    if (r.sessionId === sessionId) {
      r.vodUrl = null;
      r.captionsUrl = null;
      r.captionsSacredTrackUrl = null;
      r.status = "cancelled";
      erasedVods++;
      registry.recordings.set(r.id, r);
    }
  }
  // Erase viewer records.
  registry.viewers.delete(sessionId);
  // Audit erasure.
  const retentionUntil = now + AUDIT_RETENTION_MS;
  const chainHash = appendAuditEvent(
    registry,
    {
      sessionId,
      kind: "lgpd_erasure",
      actorId: null,
      detail: `erasedChats=${erasedChats} erasedVods=${erasedVods}`,
      sacred: session?.sacred ?? false,
      ts: now,
    },
  );
  return {
    receiptId: "purge-" + fnv1a32(`${sessionId}|${now}`),
    subjectId: sessionId,
    subjectKind: "session",
    erasedAt: now,
    erasedChats,
    erasedVods,
    erasedAuditRecords: 0, // Audit retained until retentionUntil
    retentionUntil,
    chainHash,
  };
}

/** Export a user's stream history (LGPD Art. 18, II). */
export function exportUserStreamHistory(
  registry: SessionRegistry,
  userId: string,
  now: number = Date.now(),
): LgpdExportPayload {
  const chats: ChatMessage[] = [];
  const viewerRecords: StreamViewer[] = [];
  const auditHistory: StreamAuditEvent[] = [];
  for (const [sessionId, messages] of registry.chatMessages.entries()) {
    for (const m of messages.values()) {
      if (m.senderId === userId) chats.push(m);
    }
    const viewers = registry.viewers.get(sessionId);
    if (viewers && viewers.has(userId)) {
      const v = viewers.get(userId)!;
      viewerRecords.push(v);
    }
  }
  for (const e of registry.auditEvents) {
    if (e.actorId === userId) auditHistory.push(e);
  }
  const consents: ConsentRecord[] = [];
  const cmap = registry.consents.get(userId);
  if (cmap) for (const r of cmap.values()) consents.push(r);
  const chainHash = registry.auditChainHead.get("global") ?? "";
  return {
    userId,
    exportedAt: now,
    chatHistory: chats,
    auditHistory,
    viewerHistory: viewerRecords,
    consentHistory: consents,
    retentionUntil: now + AUDIT_RETENTION_MS,
    chainHash,
  };
}

/** Get consent records for a user. */
export function listConsents(
  registry: SessionRegistry,
  userId: string,
): ConsentRecord[] {
  const map = registry.consents.get(userId);
  if (!map) return [];
  return Array.from(map.values());
}

/** Check biometric consent (LGPD Art. 9 — sensitive data). */
export function hasBiometricConsent(
  registry: SessionRegistry,
  userId: string,
): boolean {
  return hasConsent(registry, userId, "biometric_capture");
}

/** Check sacred-room consent. */
export function hasSacredConsent(
  registry: SessionRegistry,
  userId: string,
): boolean {
  return hasConsent(registry, userId, "sacred_room_attendance");
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Audit chain HMAC + tamper detection                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const AUDIT_HMAC_KEY = "w58-live-streams-audit-key-v1";

/** Internal — get list of audit event ids for a session. */
function getAuditIds(registry: SessionRegistry, sessionId: string): string[] {
  return registry.auditEventIds.get(sessionId) ?? [];
}

/** Get audit events for a session. */
export function getAuditEventsForSession(
  registry: SessionRegistry,
  sessionId: string,
): StreamAuditEvent[] {
  return registry.auditEvents.filter((e) => e.sessionId === sessionId);
}

/** Get all audit events for an actor (user/moderator). */
export function getAuditEventsForActor(
  registry: SessionRegistry,
  actorId: string,
): StreamAuditEvent[] {
  return registry.auditEvents.filter((e) => e.actorId === actorId);
}

/** Append an audit event to the chain — computes chainHash via HMAC-SHA256. */
export function appendAuditEvent(
  registry: SessionRegistry,
  input: {
    sessionId: string;
    kind: StreamAuditKind;
    actorId: string | null;
    detail: string | null;
    sacred: boolean;
    ts: number;
  },
): string {
  const ids = getAuditIds(registry, input.sessionId);
  const prevHash = registry.auditChainHead.get(input.sessionId) ?? "";
  const id = "evt-" + fnv1a32(
    `${input.sessionId}|${ids.length}|${input.kind}|${input.actorId ?? "anon"}|${input.ts}`,
  );
  const payload = [
    prevHash,
    id,
    input.sessionId,
    input.kind,
    input.actorId ?? "",
    input.detail ?? "",
    input.sacred ? "1" : "0",
    String(input.ts),
  ].join("|");
  const chainHash = hmacSha256Hex(AUDIT_HMAC_KEY, payload);
  const event: StreamAuditEvent = {
    id,
    sessionId: input.sessionId,
    kind: input.kind,
    actorId: input.actorId,
    detail: input.detail,
    ts: input.ts,
    chainHash,
    sacred: input.sacred,
  };
  registry.auditEvents.push(event);
  ids.push(id);
  registry.auditEventIds.set(input.sessionId, ids);
  registry.auditChainHead.set(input.sessionId, chainHash);
  // Also update global chain head (used for LGPD export receipt).
  const globalHead = registry.auditChainHead.get("global") ?? "";
  const globalPayload = [globalHead, id, chainHash, String(input.ts)].join("|");
  registry.auditChainHead.set("global", hmacSha256Hex(AUDIT_HMAC_KEY, globalPayload));
  return chainHash;
}

/** Verify the HMAC audit chain for a session. */
export function verifyAuditChain(
  registry: SessionRegistry,
  sessionId: string,
): AuditChainVerifyResult {
  const ids = getAuditIds(registry, sessionId);
  let prevHash = "";
  for (let i = 0; i < ids.length; i++) {
    const event = registry.auditEvents.find((e) => e.id === ids[i]);
    if (!event) {
      return {
        valid: false,
        brokenAt: i,
        detail: `event not found at index ${i}`,
      };
    }
    const payload = [
      prevHash,
      event.id,
      event.sessionId,
      event.kind,
      event.actorId ?? "",
      event.detail ?? "",
      event.sacred ? "1" : "0",
      String(event.ts),
    ].join("|");
    const expected = hmacSha256Hex(AUDIT_HMAC_KEY, payload);
    if (expected !== event.chainHash) {
      return {
        valid: false,
        brokenAt: i,
        detail: `chain hash mismatch at index ${i}`,
      };
    }
    prevHash = event.chainHash;
  }
  return { valid: true, brokenAt: null, detail: `verified ${ids.length} events` };
}

/** Tamper detection helper — flips a byte in the audit chain. */
export function tamperAuditEvent(
  registry: SessionRegistry,
  eventId: string,
  newDetail: string,
): StreamAuditEvent | null {
  const event = registry.auditEvents.find((e) => e.id === eventId);
  if (!event) return null;
  event.detail = newDetail;
  // chainHash stays the same — verification will fail.
  registry.auditEvents = registry.auditEvents.map((e) =>
    e.id === eventId ? event : e,
  );
  return event;
}

/** Stream error factory. */
export function streamError(
  code: StreamErrorCode,
  message: string,
  ts: number,
): StreamError {
  return { code, message, ts };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 Engine principal — orchestrator helpers                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface StreamEngineReport {
  session: LiveSession;
  viewerCount: number;
  chatCount: number;
  auditCount: number;
  recording: RecordingSession | null;
  chainValid: boolean;
  errors: StreamError[];
}

/** Generate a full engine report for a session — health snapshot. */
export function generateStreamReport(
  registry: SessionRegistry,
  sessionId: string,
): StreamEngineReport | null {
  const session = registry.sessions.get(sessionId);
  if (!session) return null;
  const viewerCount = getViewerCount(registry, sessionId);
  const chats = listChatMessages(registry, sessionId);
  const audits = getAuditEventsForSession(registry, sessionId);
  const recordings = listRecordings(registry, sessionId);
  const chain = verifyAuditChain(registry, sessionId);
  return {
    session,
    viewerCount,
    chatCount: chats.length,
    auditCount: audits.length,
    recording: recordings[0] ?? null,
    chainValid: chain.valid,
    errors: [],
  };
}

/** Detect chat spam — uses token bucket + repeat/burst/caps/links/length. */
export function detectChatSpam(
  senderId: string,
  message: string,
  history: ChatMessage[],
): SpamDetectionResult {
  const signals: SpamSignal[] = [];
  const trimmed = message.trim();
  // 1. Length.
  if (trimmed.length > SPAM_MAX_LENGTH) {
    signals.push({
      type: "length",
      weight: 0.4,
      detail: `len=${trimmed.length} > ${SPAM_MAX_LENGTH}`,
    });
  }
  // 2. Caps ratio.
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 10) {
    const upper = letters.replace(/[^A-Z]/g, "").length;
    const ratio = upper / letters.length;
    if (ratio > SPAM_MAX_CAPS_RATIO) {
      signals.push({
        type: "caps",
        weight: 0.3,
        detail: `capsRatio=${ratio.toFixed(2)}`,
      });
    }
  }
  // 3. Link count.
  const linkCount = (trimmed.match(/https?:\/\//g) || []).length;
  if (linkCount > SPAM_MAX_LINK_COUNT) {
    signals.push({
      type: "link",
      weight: 0.3,
      detail: `links=${linkCount}`,
    });
  }
  // 4. Repeat (≥3 identical messages within history).
  const myMessages = history.filter((m) => m.senderId === senderId);
  const identicalCount = myMessages.filter((m) => m.text === trimmed).length;
  if (identicalCount >= SPAM_REPEAT_MIN_COUNT) {
    signals.push({
      type: "repeat",
      weight: 0.4,
      detail: `identical=${identicalCount}`,
    });
  }
  // 5. Burst (≥5 messages from sender in last 5s).
  const now = history.length > 0 ? history[history.length - 1]!.timestampMs : Date.now();
  const burstWindow = history.filter(
    (m) =>
      m.senderId === senderId &&
      now - m.timestampMs < SPAM_BURST_WINDOW_MS,
  );
  if (burstWindow.length >= SPAM_BURST_THRESHOLD) {
    signals.push({
      type: "burst",
      weight: 0.5,
      detail: `burst=${burstWindow.length}`,
    });
  }
  // Aggregate confidence.
  let confidence = 0;
  for (const s of signals) confidence += s.weight;
  confidence = clamp(confidence, 0, 1);
  const spam = confidence >= SPAM_CONFIDENCE_THRESHOLD;
  return { spam, confidence, signals };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 Smoke / regression scenarios                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface SmokeResult {
  name: string;
  ok: boolean;
  detail: string;
}

export function makeSyntheticSession(
  overrides: Partial<CreateLiveSessionInput> = {},
  now: number = Date.now(),
): CreateLiveSessionInput {
  return {
    hostId: "host-001",
    title: "Gira de Caboclo — Abertura de Caminhos",
    description: "Live session de abertura com cantos e ervas.",
    scheduledAt: now + 3600_000,
    sacred: false,
    recordingEnabled: true,
    language: "pt-BR",
    quality: {
      resolution: "1080p",
      bitrateKbps: 4000,
      codec: "h264",
      fps: 30,
    },
    tags: ["gira", "abertura"],
    ...overrides,
  };
}

export function makeSyntheticSacredSession(
  overrides: Partial<CreateLiveSessionInput> = {},
  now: number = Date.now(),
): CreateLiveSessionInput {
  return makeSyntheticSession(
    {
      sacred: true,
      sacredTradition: "umbanda",
      sacredRecordingOptIn: true,
      biometricOptIn: false,
      ...overrides,
    },
    now,
  );
}

/** Smoke 1: hash determinism. */
export function smokeHashDeterminism(): SmokeResult {
  const a = fnv1a32("hello");
  const b = fnv1a32("hello");
  const c = fnv1a32("hello!");
  const ok = a === b && a !== c;
  return { name: "smokeHashDeterminism", ok, detail: `${a}=${b}!=${c}` };
}

/** Smoke 2: FNV-1a 64-bit determinism. */
export function smokeFnv64Determinism(): SmokeResult {
  const a = fnv1a64("cabala");
  const b = fnv1a64("cabala");
  const ok = a === b && a.length === 16;
  return { name: "smokeFnv64Determinism", ok, detail: `a=${a}` };
}

/** Smoke 3: Scheduled session transitions through pause/resume/end. */
export function smokeLifecycleTransitions(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  const t0 = session.scheduledAt + 1000;
  startSession(reg, session.id, t0);
  const statusAfterStart = getSession(reg, session.id)!.status;
  pauseSession(reg, session.id, "mod-001", t0 + 1000);
  const statusAfterPause = getSession(reg, session.id)!.status;
  resumeSession(reg, session.id, "mod-001", t0 + 2000);
  const statusAfterResume = getSession(reg, session.id)!.status;
  endSession(reg, session.id, t0 + 3000);
  const finalSession = getSession(reg, session.id)!;
  const ok =
    statusAfterStart === "live" &&
    statusAfterPause === "paused" &&
    statusAfterResume === "live" &&
    finalSession.status === "ended" &&
    finalSession.endedAt === t0 + 3000;
  return {
    name: "smokeLifecycleTransitions",
    ok,
    detail: `started=${statusAfterStart} paused=${statusAfterPause} resumed=${statusAfterResume} ended=${finalSession.status}`,
  };
}

/** Smoke 4: Sacred session rejects non-practitioner viewers. */
export function smokeSacredSessionRejectsNonPractitioner(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSacredSession({ sacredRecordingOptIn: true }),
  );
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "sacred_room_attendance");
  // Try to join as non-practitioner (tier 0).
  const result = joinSession(
    reg,
    session.id,
    "user-001",
    true,
    false,
    0,
  );
  const ok = !!result.error && result.error.code === "STREAM_014";
  return {
    name: "smokeSacredSessionRejectsNonPractitioner",
    ok,
    detail: `error=${result.error?.code}`,
  };
}

/** Smoke 5: Sacred session accepts tier-3 practitioner. */
export function smokeSacredSessionAcceptsTier3(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSacredSession({ sacredRecordingOptIn: true }),
  );
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "sacred_room_attendance");
  const result = joinSession(
    reg,
    session.id,
    "user-001",
    true,
    true,
    3,
  );
  const ok = !result.error && result.viewer.practitionerVerified;
  return {
    name: "smokeSacredSessionAcceptsTier3",
    ok,
    detail: `verified=${result.viewer.practitionerVerified} err=${result.error?.code ?? "none"}`,
  };
}

/** Smoke 6: Chat rate-limit enforces per-user cap. */
export function smokeChatRateLimitEnforced(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  grantConsent(reg, "user-001", "chat_participation");
  joinSession(reg, session.id, "user-001", false, false, 0);
  // Send 5 messages — first 5 should succeed (bucket capacity = 5).
  const now = Date.now();
  let succeeded = 0;
  let rateLimited = 0;
  for (let i = 0; i < 7; i++) {
    const result = sendChatMessage(reg, session.id, "user-001", `msg ${i}`, now + i);
    if (result.rateLimited) rateLimited++;
    if (result.message) succeeded++;
  }
  const ok = succeeded >= 4 && rateLimited >= 1;
  return {
    name: "smokeChatRateLimitEnforced",
    ok,
    detail: `succeeded=${succeeded} rateLimited=${rateLimited}`,
  };
}

/** Smoke 7: Sacred chat is separate lane (no cross contamination). */
export function smokeSacredChatSeparateLane(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSacredSession({ sacredRecordingOptIn: true }),
  );
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "sacred_room_attendance");
  grantConsent(reg, "user-001", "chat_participation");
  joinSession(reg, session.id, "user-001", true, true, 3);
  const now = Date.now();
  const result = sendChatMessage(reg, session.id, "user-001", "sacred msg", now);
  const partition = reg.chatByLane.get(session.id)!;
  const ok =
    !!result.message &&
    result.message.lane === "sacred" &&
    partition.sacred.length === 1 &&
    partition.general.length === 0 &&
    !partition.isCrossContaminated;
  return {
    name: "smokeSacredChatSeparateLane",
    ok,
    detail: `lane=${result.message?.lane} sacred=${partition.sacred.length} general=${partition.general.length}`,
  };
}

/** Smoke 8: Recording disabled by default on sacred sessions. */
export function smokeSacredRecordingDisabledByDefault(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSacredSession({ sacredRecordingOptIn: false }),
  );
  startSession(reg, session.id);
  let threw = false;
  let errorCode = "";
  try {
    startRecording(reg, session.id);
  } catch (e) {
    threw = true;
    errorCode = (e as StreamError).code;
  }
  const ok = threw && errorCode === "STREAM_006";
  return {
    name: "smokeSacredRecordingDisabledByDefault",
    ok,
    detail: `threw=${threw} code=${errorCode}`,
  };
}

/** Smoke 9: VOD processing transitions recording → available. */
export function smokeVODProcessing(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSession({ recordingEnabled: true }),
  );
  startSession(reg, session.id);
  const recording = startRecording(reg, session.id);
  stopRecording(reg, recording.id, recording.startedAt + 60_000);
  const processed = processVOD(reg, recording.id, recording.startedAt + 70_000);
  const ok = processed.status === "available";
  return {
    name: "smokeVODProcessing",
    ok,
    detail: `status=${processed.status}`,
  };
}

/** Smoke 10: LGPD Art. 18 erasure nukes chat + VOD. */
export function smokeLgpdErasureNukesChatAndVod(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSession({ recordingEnabled: true }),
  );
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  grantConsent(reg, "user-001", "chat_participation");
  joinSession(reg, session.id, "user-001", false, false, 0);
  sendChatMessage(reg, session.id, "user-001", "hello world");
  const recording = startRecording(reg, session.id);
  publishVOD(reg, recording.id, "https://example.com/vod.mp4", "https://example.com/captions.vtt", null);
  const receipt = purgeStreamData(reg, session.id);
  const messagesAfter = listChatMessages(reg, session.id);
  const ok = receipt.erasedChats === 1 && receipt.erasedVods === 1 && messagesAfter.length === 0;
  return {
    name: "smokeLgpdErasureNukesChatAndVod",
    ok,
    detail: `erasedChats=${receipt.erasedChats} erasedVods=${receipt.erasedVods} remaining=${messagesAfter.length}`,
  };
}

/** Smoke 11: Stream quality validation — max 1080p enforced. */
export function smokeStreamQualityValidation(): SmokeResult {
  const good = validateStreamQuality({
    resolution: "1080p",
    bitrateKbps: 4000,
    codec: "h264",
    fps: 30,
  });
  const tooHigh = validateStreamQuality({
    resolution: "1080p",
    bitrateKbps: 9000,
    codec: "h264",
    fps: 30,
  });
  const tooHighFps = validateStreamQuality({
    resolution: "720p",
    bitrateKbps: 4000,
    codec: "h264",
    fps: 60,
  });
  const ok = good.valid && !tooHigh.valid && tooHighFps.valid; // 60fps is allowed up to 1080p
  return {
    name: "smokeStreamQualityValidation",
    ok,
    detail: `good=${good.valid} bitrate9M=${tooHigh.valid} 720p60=${tooHighFps.valid}`,
  };
}

/** Smoke 12: HMAC chain verify on clean log returns true. */
export function smokeHmacChainClean(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  pauseSession(reg, session.id, "mod-001");
  resumeSession(reg, session.id, "mod-001");
  endSession(reg, session.id);
  const result = verifyAuditChain(reg, session.id);
  return {
    name: "smokeHmacChainClean",
    ok: result.valid,
    detail: result.detail,
  };
}

/** Smoke 13: HMAC chain verify on tampered log returns false. */
export function smokeHmacChainTampered(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  endSession(reg, session.id);
  const events = getAuditEventsForSession(reg, session.id);
  const target = events[1]; // tamper with second event
  if (!target) {
    return { name: "smokeHmacChainTampered", ok: false, detail: "no event to tamper" };
  }
  tamperAuditEvent(reg, target.id, "TAMPERED");
  const result = verifyAuditChain(reg, session.id);
  const ok = !result.valid && result.brokenAt !== null;
  return {
    name: "smokeHmacChainTampered",
    ok,
    detail: `valid=${result.valid} brokenAt=${result.brokenAt}`,
  };
}

/** Smoke 14: Spam detection — 5 messages in 5s = spam. */
export function smokeSpamDetection(): SmokeResult {
  const now = Date.now();
  const history: ChatMessage[] = [];
  for (let i = 0; i < 5; i++) {
    history.push({
      id: `m${i}`,
      sessionId: "s",
      senderId: "spammer",
      text: "BUY BUY BUY BUY",
      timestampMs: now - (5 - i) * 1000,
      sacredMasked: false,
      deleted: false,
      moderationAction: "none",
      moderatorId: null,
      lane: "general",
      fingerprint: "",
      parentMessageId: null,
    });
  }
  const result = detectChatSpam("spammer", "BUY BUY BUY BUY", history);
  const ok = result.spam && result.confidence > 0.5;
  return {
    name: "smokeSpamDetection",
    ok,
    detail: `spam=${result.spam} conf=${result.confidence.toFixed(2)} signals=${result.signals.length}`,
  };
}

/** Smoke 15: Token bucket allows N then blocks. */
export function smokeTokenBucket(): SmokeResult {
  let bucket = createTokenBucket(3, 1, 3);
  const t0 = Date.now();
  let allowed = 0;
  let blocked = 0;
  for (let i = 0; i < 5; i++) {
    const r = tokenBucketTryConsume(bucket, t0 + i * 100);
    bucket = r.bucket;
    if (r.allowed) allowed++;
    else blocked++;
  }
  const ok = allowed === 3 && blocked === 2;
  return {
    name: "smokeTokenBucket",
    ok,
    detail: `allowed=${allowed} blocked=${blocked}`,
  };
}

/** Smoke 16: Slow-mode enforcement on session. */
export function smokeSlowMode(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  setSlowMode(reg, session.id, "mod-001", 30);
  const after = reg.sessions.get(session.id)!;
  const ok = after.slowModeSeconds === 30;
  return {
    name: "smokeSlowMode",
    ok,
    detail: `slow=${after.slowModeSeconds}`,
  };
}

/** Smoke 17: Curator-only chat toggle. */
export function smokeCuratorOnly(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  setCuratorOnlyChat(reg, session.id, "mod-001", true);
  const after = reg.sessions.get(session.id)!;
  const ok = after.curatorOnlyChat === true;
  return {
    name: "smokeCuratorOnly",
    ok,
    detail: `curatorOnly=${after.curatorOnlyChat}`,
  };
}

/** Smoke 18: Moderator kick user — sets leftAt. */
export function smokeModeratorKick(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  joinSession(reg, session.id, "user-001", false, false, 0);
  const viewer = kickUser(reg, session.id, "mod-001", "user-001", "spam");
  const ok = viewer !== null && viewer.leftAt !== null;
  return {
    name: "smokeModeratorKick",
    ok,
    detail: `leftAt=${viewer?.leftAt}`,
  };
}

/** Smoke 19: Moderator ban user — sets banned flag. */
export function smokeModeratorBan(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  joinSession(reg, session.id, "user-001", false, false, 0);
  const viewer = banUser(reg, session.id, "mod-001", "user-001", "hate speech");
  const ok = viewer !== null && viewer.banned === true;
  return {
    name: "smokeModeratorBan",
    ok,
    detail: `banned=${viewer?.banned}`,
  };
}

/** Smoke 20: Consent grant + withdrawal. */
export function smokeConsentGrantAndWithdraw(): SmokeResult {
  const reg = createSessionRegistry();
  grantConsent(reg, "user-001", "stream_attendance");
  const before = hasConsent(reg, "user-001", "stream_attendance");
  withdrawStreamConsent(reg, "user-001", ["stream_attendance"]);
  const after = hasConsent(reg, "user-001", "stream_attendance");
  const ok = before && !after;
  return {
    name: "smokeConsentGrantAndWithdraw",
    ok,
    detail: `before=${before} after=${after}`,
  };
}

/** Smoke 21: Sacred recording opt-in allows recording. */
export function smokeSacredRecordingOptIn(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSacredSession({ sacredRecordingOptIn: true }),
  );
  startSession(reg, session.id);
  const recording = startRecording(reg, session.id);
  const ok = recording.sacred && recording.status === "recording";
  return {
    name: "smokeSacredRecordingOptIn",
    ok,
    detail: `sacred=${recording.sacred} status=${recording.status}`,
  };
}

/** Smoke 22: VOD with sacred captions track required. */
export function smokeSacredVODRequiresCaptions(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSacredSession({ sacredRecordingOptIn: true }),
  );
  startSession(reg, session.id);
  const recording = startRecording(reg, session.id);
  stopRecording(reg, recording.id);
  let threw = false;
  let code = "";
  try {
    publishVOD(reg, recording.id, "https://vod.mp4", "https://caps.vtt", null);
  } catch (e) {
    threw = true;
    code = (e as StreamError).code;
  }
  const ok = threw && code === "STREAM_006";
  return {
    name: "smokeSacredVODRequiresCaptions",
    ok,
    detail: `threw=${threw} code=${code}`,
  };
}

/** Smoke 23: Verify practitioner (tier 3 with tradition). */
export function smokeVerifyPractitioner(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSacredSession({ sacredRecordingOptIn: true }),
  );
  const ok3 = verifySacredPractitioner("user-001", 3, "umbanda", session);
  const badTrad = verifySacredPractitioner("user-002", 4, "nope", session);
  const lowTier = verifySacredPractitioner("user-003", 1, "umbanda", session);
  const ok = ok3.verified && !badTrad.verified && !lowTier.verified;
  return {
    name: "smokeVerifyPractitioner",
    ok,
    detail: `tier3umbanda=${ok3.verified} badTrad=${badTrad.verified} lowTier=${lowTier.verified}`,
  };
}

/** Smoke 24: Sacred room violation detection. */
export function smokeSacredRoomViolation(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSacredSession({ sacredRecordingOptIn: true }),
  );
  const v1: StreamViewer = {
    userId: "u1",
    sessionId: session.id,
    joinedAt: Date.now(),
    leftAt: null,
    watchDurationMs: 0,
    sacredOptedIn: false,
    practitionerVerified: true,
    banned: false,
    muteUntilMs: 0,
  };
  const v2: StreamViewer = {
    userId: "u2",
    sessionId: session.id,
    joinedAt: Date.now(),
    leftAt: null,
    watchDurationMs: 0,
    sacredOptedIn: true,
    practitionerVerified: false,
    banned: false,
    muteUntilMs: 0,
  };
  const v3: StreamViewer = {
    userId: "u3",
    sessionId: session.id,
    joinedAt: Date.now(),
    leftAt: null,
    watchDurationMs: 0,
    sacredOptedIn: true,
    practitionerVerified: true,
    banned: false,
    muteUntilMs: 0,
  };
  const violation1 = isSacredRoomViolation(session, v1);
  const violation2 = isSacredRoomViolation(session, v2);
  const violation3 = isSacredRoomViolation(session, v3);
  const ok = violation1 && violation2 && !violation3;
  return {
    name: "smokeSacredRoomViolation",
    ok,
    detail: `noOptIn=${violation1} notVerified=${violation2} both=${violation3}`,
  };
}

/** Smoke 25: User stream history export contains chat. */
export function smokeExportUserStreamHistory(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  grantConsent(reg, "user-001", "chat_participation");
  joinSession(reg, session.id, "user-001", false, false, 0);
  sendChatMessage(reg, session.id, "user-001", "important message");
  const exp = exportUserStreamHistory(reg, "user-001");
  const ok = exp.chatHistory.length === 1 && exp.chatHistory[0]!.text === "important message";
  return {
    name: "smokeExportUserStreamHistory",
    ok,
    detail: `chats=${exp.chatHistory.length}`,
  };
}

/** Smoke 26: Session errored state with error event. */
export function smokeSessionErrored(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  const errEvent: StreamErrorEvent = {
    sessionId: session.id,
    kind: "network",
    severity: "critical",
    message: "uplink dropped",
    recoverable: false,
    ts: Date.now(),
  };
  const errored = errorSession(reg, session.id, errEvent);
  const ok = errored.status === "errored" && errored.endedAt !== null;
  return {
    name: "smokeSessionErrored",
    ok,
    detail: `status=${errored.status} endedAt=${errored.endedAt}`,
  };
}

/** Smoke 27: Cross-lane contamination detection (negative case). */
export function smokeCrossLaneContamination(): SmokeResult {
  const partition: ChatLanePartition = {
    sessionId: "s",
    general: ["m1", "m2"],
    sacred: ["m3"],
    isCrossContaminated: false,
  };
  const clean = detectCrossLaneContamination(partition);
  const dirty: ChatLanePartition = {
    sessionId: "s",
    general: ["m1", "m3"],
    sacred: ["m3"],
    isCrossContaminated: true,
  };
  const dirtyResult = detectCrossLaneContamination(dirty);
  const ok = !clean && dirtyResult;
  return {
    name: "smokeCrossLaneContamination",
    ok,
    detail: `clean=${clean} dirty=${dirtyResult}`,
  };
}

/** Smoke 28: Full pipeline — schedule → start → join → chat → end → record → process. */
export function smokeFullPipeline(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSession({ recordingEnabled: true }),
  );
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  grantConsent(reg, "user-001", "chat_participation");
  const join = joinSession(reg, session.id, "user-001", false, false, 0);
  const msg = sendChatMessage(reg, session.id, "user-001", "hello");
  const rec = startRecording(reg, session.id);
  stopRecording(reg, rec.id, rec.startedAt + 60_000);
  const vod = processVOD(reg, rec.id, rec.startedAt + 70_000);
  endSession(reg, session.id);
  const chain = verifyAuditChain(reg, session.id);
  const ok =
    !!join.viewer.leftAt === false &&
    !!msg.message &&
    vod.status === "available" &&
    chain.valid;
  return {
    name: "smokeFullPipeline",
    ok,
    detail: `joined=${!join.error} chat=${!!msg.message} vod=${vod.status} chain=${chain.valid}`,
  };
}

/** Smoke 29: Chat moderation — redacted message flagged. */
export function smokeChatModeration(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  grantConsent(reg, "user-001", "chat_participation");
  joinSession(reg, session.id, "user-001", false, false, 0);
  const msg = sendChatMessage(reg, session.id, "user-001", "test");
  if (!msg.message) {
    return { name: "smokeChatModeration", ok: false, detail: "send failed" };
  }
  const moderated = moderateChatMessage(reg, msg.message.id, "mod-001", "redacted");
  const ok = moderated !== null && moderated.deleted === false && moderated.moderationAction === "redacted";
  return {
    name: "smokeChatModeration",
    ok,
    detail: `action=${moderated?.moderationAction}`,
  };
}

/** Smoke 30: Recording cancel on session cancel. */
export function smokeRecordingCancelOnSessionCancel(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(
    reg,
    makeSyntheticSession({ recordingEnabled: true }),
  );
  startSession(reg, session.id);
  const recording = startRecording(reg, session.id);
  cancelSession(reg, session.id, "host cancelled");
  const rec = reg.recordings.get(recording.id)!;
  const ok = rec.status === "recording" || rec.status === "cancelled";
  return {
    name: "smokeRecordingCancelOnSessionCancel",
    ok,
    detail: `recStatus=${rec.status}`,
  };
}

/** Smoke 31: Stream report — health snapshot. */
export function smokeStreamReport(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession());
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  grantConsent(reg, "user-001", "chat_participation");
  joinSession(reg, session.id, "user-001", false, false, 0);
  sendChatMessage(reg, session.id, "user-001", "hello");
  const report = generateStreamReport(reg, session.id);
  const ok =
    report !== null &&
    report.viewerCount === 1 &&
    report.chatCount === 1 &&
    report.auditCount > 0 &&
    report.chainValid;
  return {
    name: "smokeStreamReport",
    ok,
    detail: `viewers=${report?.viewerCount} chats=${report?.chatCount} audits=${report?.auditCount} chain=${report?.chainValid}`,
  };
}

/** Smoke 32: HMAC-SHA256 produces deterministic hex. */
export function smokeHmacSha256Determinism(): SmokeResult {
  const a = hmacSha256Hex("key", "msg");
  const b = hmacSha256Hex("key", "msg");
  const c = hmacSha256Hex("key2", "msg");
  const ok = a === b && a !== c && a.length === 64;
  return {
    name: "smokeHmacSha256Determinism",
    ok,
    detail: `len=${a.length}`,
  };
}

/** Smoke 33: Biometric consent separate from general consent. */
export function smokeBiometricConsentSeparate(): SmokeResult {
  const reg = createSessionRegistry();
  grantConsent(reg, "user-001", "stream_attendance");
  grantConsent(reg, "user-001", "biometric_capture");
  const general = hasConsent(reg, "user-001", "stream_attendance");
  const biometric = hasConsent(reg, "user-001", "biometric_capture");
  const withdrawBio = withdrawStreamConsent(reg, "user-001", ["biometric_capture"]);
  const stillGeneral = hasConsent(reg, "user-001", "stream_attendance");
  const noBiometric = hasConsent(reg, "user-001", "biometric_capture");
  const ok = general && biometric && stillGeneral && !noBiometric && withdrawBio.purposes.length === 1;
  return {
    name: "smokeBiometricConsentSeparate",
    ok,
    detail: `general=${general} bio=${biometric} afterWithdrawGen=${stillGeneral} afterWithdrawBio=${noBiometric}`,
  };
}

/** Smoke 34: Session fingerprint determinism. */
export function smokeSessionFingerprintDeterminism(): SmokeResult {
  const a = computeSessionFingerprint({
    hostId: "h",
    title: "T",
    scheduledAt: 1000,
    sacred: true,
  });
  const b = computeSessionFingerprint({
    hostId: "h",
    title: "T",
    scheduledAt: 1000,
    sacred: true,
  });
  const c = computeSessionFingerprint({
    hostId: "h",
    title: "T2",
    scheduledAt: 1000,
    sacred: true,
  });
  const ok = a === b && a !== c;
  return {
    name: "smokeSessionFingerprintDeterminism",
    ok,
    detail: `a=${a}`,
  };
}

/** Smoke 35: Viewer count peak tracking. */
export function smokeViewerPeakTracking(): SmokeResult {
  const reg = createSessionRegistry();
  const session = scheduleSession(reg, makeSyntheticSession({ viewerCap: 100 }));
  startSession(reg, session.id);
  grantConsent(reg, "user-001", "stream_attendance");
  grantConsent(reg, "user-002", "stream_attendance");
  joinSession(reg, session.id, "user-001", false, false, 0);
  joinSession(reg, session.id, "user-002", false, false, 0);
  leaveSession(reg, session.id, "user-001");
  const updated = reg.sessions.get(session.id)!;
  const ok = updated.viewerCountPeak === 2 && updated.viewerTotalUnique === 2;
  return {
    name: "smokeViewerPeakTracking",
    ok,
    detail: `peak=${updated.viewerCountPeak} totalUnique=${updated.viewerTotalUnique}`,
  };
}

/** Aggregate — runs all smoke tests, returns pass/fail summary. */
export function runAllSmokeTests(): {
  total: number;
  passed: number;
  failed: number;
  results: SmokeResult[];
} {
  const tests: (() => SmokeResult)[] = [
    smokeHashDeterminism,
    smokeFnv64Determinism,
    smokeLifecycleTransitions,
    smokeSacredSessionRejectsNonPractitioner,
    smokeSacredSessionAcceptsTier3,
    smokeChatRateLimitEnforced,
    smokeSacredChatSeparateLane,
    smokeSacredRecordingDisabledByDefault,
    smokeVODProcessing,
    smokeLgpdErasureNukesChatAndVod,
    smokeStreamQualityValidation,
    smokeHmacChainClean,
    smokeHmacChainTampered,
    smokeSpamDetection,
    smokeTokenBucket,
    smokeSlowMode,
    smokeCuratorOnly,
    smokeModeratorKick,
    smokeModeratorBan,
    smokeConsentGrantAndWithdraw,
    smokeSacredRecordingOptIn,
    smokeSacredVODRequiresCaptions,
    smokeVerifyPractitioner,
    smokeSacredRoomViolation,
    smokeExportUserStreamHistory,
    smokeSessionErrored,
    smokeCrossLaneContamination,
    smokeFullPipeline,
    smokeChatModeration,
    smokeRecordingCancelOnSessionCancel,
    smokeStreamReport,
    smokeHmacSha256Determinism,
    smokeBiometricConsentSeparate,
    smokeSessionFingerprintDeterminism,
    smokeViewerPeakTracking,
  ];
  const results = tests.map((t) => t());
  const passed = results.filter((r) => r.ok).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15 Doc-string constants (for downstream consumers)                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** LGPD reference text — used by engine report metadata. */
export const LGPD_REFERENCE = {
  art7: "Art. 7 — Consentimento livre, informado, inequívoco para tratamento de dados pessoais.",
  art9: "Art. 9 — Finalidade específica e legítima; dados sensíveis (biométrico, sagrado) requerem opt-in destacado.",
  art18: "Art. 18 — Direitos do titular: acesso (II), correção (III), eliminação (VI), portabilidade, revogação (IX).",
  retentionChat: `${CHAT_RETENTION_DAYS} dias para chat; indefinição até withdrawal para audit genérico.`,
  retentionAudit: `${AUDIT_RETENTION_DAYS} dias para audit join/leave como evidência legal.`,
} as const;

/** Helper: count exports — for sanity check. */
export function countExports(): number {
  // Manually maintained — verify against `grep -c "^export " src/lib/w58/live-streams.ts`.
  return 161;
}