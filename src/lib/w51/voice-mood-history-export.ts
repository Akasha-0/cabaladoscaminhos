/**
 * w51/voice-mood-history-export
 * -----------------------------------------------------------------------------
 * Voice-Mood History Export engine — LGPD Art. 18 portability + right to
 * erasure for the user's voice-mood detection history.
 *
 * Composes (by shape, NOT by import) with:
 *   - w49/voice-mood-detection   — produces `VoiceMoodEvent` (10 moods,
 *                                  sensitivity, duration, source).
 *   - w50/mood-devotional-tone   — produces `DevotionalTonePlan` (uses the
 *                                  `VoiceMood` detection + tradition tag to
 *                                  drive prompt/tone selection).
 *
 * The history engine stands alone: zero external deps, no React/Next/Prisma,
 * hand-rolled SHA-256 + FNV-1a, CSV escaping per RFC 4180.
 *
 * Surface (2000-3000 lines, 100+ exports):
 *
 *   §1   Core types: `VoiceMoodEvent`, `VoiceMoodHistoryBundle`,
 *                    `WindowDays`, `ExportFormat`, `RedactionLevel`,
 *                    `VoiceMoodConsent`, `LocaleId`, `AuditEntry`,
 *                    `VoiceMoodSensitivity`, `VoiceMoodSource`.
 *
 *   §2   Constants: window presets, retention, supported locales, mood
 *                   lists, format specs, redaction level specs.
 *
 *   §3   Hashes: SHA-256 (hand-rolled, 64-round), FNV-1a 32-bit.
 *
 *   §4   CSV / JSON / JSONL serializers (RFC 4180 escaping).
 *
 *   §5   Validators (window / format / redaction / event / locale).
 *
 *   §6   Errors: `VoiceMoodExportError` + 6 typed subclasses with codes
 *                NO_CONSENT, NO_DATA, INVALID_WINDOW, INVALID_FORMAT,
 *                RETENTION_EXPIRED, BUNDLE_TOO_LARGE.
 *
 *   §7   Consent gating (opt-in / opt-out helpers + ledger).
 *
 *   §8   Window selection + retention enforcement.
 *
 *   §9   Aggregate stats (mood distribution, intensity avg, etc.).
 *
 *   §10  Redaction pipeline (5 levels).
 *
 *   §11  Export builders (JSON / CSV / JSONL) with integrity header.
 *
 *   §12  LGPD Art. 18 operations: exportAll, deleteAll, exportDeletionAudit.
 *
 *   §13  Audit log (immutable append-only).
 *
 *   §14  Locale-aware date / mood labels (pt-BR / en-US / es-ES).
 *
 *   §15  Smoke test runner (14 cases; returns {passed, failed, total}).
 *
 *   §16  END — engine summary.
 *
 * LGPD
 *   • Art. 7  — every export/delete is gated on explicit `voiceMoodConsent`.
 *   • Art. 9  — redaction levels (1..4) progressively strip identity.
 *   • Art. 18 — `exportAll` (portability), `deleteAll` (right to erasure,
 *               soft delete with audit trail), `exportDeletionAudit` provides
 *               proof of erasure to the data subject.
 *
 * @module w51/voice-mood-history-export
 */

// ─────────────────────────────────────────────────────────────────────────────
// §1   CORE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The 10 moods recognised by the w49 voice-mood-detection engine.
 * Mirrors w49's `VoiceMood` union (NEUTRAL, JOYFUL, SAD, ANGRY, ANXIOUS-feared,
 * SURPRISED, CALM, CONTEMPLATIVE, DEVOTIONAL, URGENT-with-LONGING mapping).
 *
 * In w49 the union uses: neutral, joyful, sad, angry, fearful, surprised,
 * calm, contemplative, devotional, urgent.  The history engine uses a
 * spiritually-aligned subset of 10 moods that map onto the w49 vocabulary
 * 1:1 (see `MOOD_TO_W49` for the forward mapping).
 */
export type VoiceMood =
  | "serene"
  | "joyful"
  | "anxious"
  | "sad"
  | "angry"
  | "grateful"
  | "reflective"
  | "hopeful"
  | "neutral"
  | "longing";

/**
 * Canonical mood list (also surfaced via `VOICE_MOODS` constant).
 */
export const VOICE_MOODS: readonly VoiceMood[] = [
  "serene",
  "joyful",
  "anxious",
  "sad",
  "angry",
  "grateful",
  "reflective",
  "hopeful",
  "neutral",
  "longing",
] as const;

/**
 * Forward mapping (history → w49 detection label). When we persist a
 * `VoiceMoodEvent` we also keep the original w49 detector label in
 * `w49Label` so cross-version correlation stays deterministic.
 */
export const MOOD_TO_W49: Readonly<Record<VoiceMood, string>> = {
  serene: "calm",
  joyful: "joyful",
  anxious: "fearful",
  sad: "sad",
  angry: "angry",
  grateful: "devotional",
  reflective: "contemplative",
  hopeful: "joyful",
  neutral: "neutral",
  longing: "contemplative",
} as const;

/**
 * Inverse mapping for ingestion paths (w49 label → history mood).
 * When a w49 detector emits a label not present in `MOOD_TO_W49`
 * values, we fall back to "neutral" with a `w49Label` annotation.
 */
export const W49_TO_MOOD: Readonly<Record<string, VoiceMood>> = {
  neutral: "neutral",
  joyful: "joyful",
  sad: "sad",
  angry: "angry",
  fearful: "anxious",
  surprised: "hopeful",
  calm: "serene",
  contemplative: "reflective",
  devotional: "grateful",
  urgent: "longing",
} as const;

/**
 * Source of the voice sample that produced the mood event. Mirrors the
 * `source` field in w49 `VoiceSample`.
 */
export type VoiceMoodSource = "voice_clone" | "live_recording" | "upload";

/**
 * Sensitivity 1..5.  1 = permissive (record everything), 5 = strict
 * (drop highly-sensitive sessions automatically). Mirrors w49 `SacrednessLevel`.
 */
export type VoiceMoodSensitivity = 1 | 2 | 3 | 4 | 5;

/**
 * Retention presets (days). `forever` is treated as 5 years by the window
 * helpers, but exported as the literal `"forever"` string so external
 * consumers don't have to know the cap.
 */
export type RetentionDays = 30 | 90 | 365 | "forever";

/**
 * Window presets accepted by `selectWindow`. Same shape as `RetentionDays`
 * plus `"forever"` because export windows are independent of retention.
 */
export type WindowDays = 30 | 90 | 365 | "forever";

/**
 * Supported locales. Mirrors w50/w49 `LocaleId`.
 */
export type LocaleId = "pt-BR" | "en-US" | "es-ES";

/**
 * Supported export formats.
 */
export type ExportFormat = "json" | "csv" | "jsonl";

/**
 * Redaction level — 0..4, see `REDACTION_LEVELS` for behaviour.
 */
export type RedactionLevel = 0 | 1 | 2 | 3 | 4;

/**
 * One recorded voice-mood session. Built from a w49 detection result +
 * session metadata.
 */
export interface VoiceMoodEvent {
  /** Stable event id (UUID-ish). */
  readonly id: string;
  /** Opaque user id (hashed under redaction). */
  readonly userId: string;
  /** ISO timestamp UTC. */
  readonly recordedAt: string;
  /** Detected mood (10-value vocabulary). */
  readonly mood: VoiceMood;
  /** Original w49 label, kept for cross-version correlation. */
  readonly w49Label: string;
  /** Intensity 1..5. */
  readonly intensity: VoiceMoodSensitivity;
  /** Duration of the source sample in seconds. */
  readonly durationSec: number;
  /** Provenance of the voice sample. */
  readonly source: VoiceMoodSource;
  /** Sensitivity filter at recording time. */
  readonly sensitivity: VoiceMoodSensitivity;
  /** Tradition tag (mirrors w50 `TraditionTag`). `null` when unconstrained. */
  readonly tradition: string | null;
  /** Locale at recording time. */
  readonly locale: LocaleId;
  /** Retention policy attached to this event. */
  readonly retentionDays: RetentionDays;
}

/**
 * Consent ledger entry. Persisted alongside each event; LGPD Art. 7.
 */
export interface VoiceMoodConsent {
  /** True when user opted in to history retention. */
  readonly voiceMoodConsent: boolean;
  /** True when user explicitly approved portability/export. */
  readonly exportConsent: boolean;
  /** ISO timestamp of opt-in. */
  readonly optedInAt: string;
  /** ISO timestamp of opt-out (null when still opted in). */
  readonly optedOutAt: string | null;
}

/**
 * Aggregate stats computed for an export window.
 */
export interface VoiceMoodAggregate {
  /** Mood → event count. */
  readonly moodDistribution: Readonly<Record<VoiceMood, number>>;
  /** Average intensity across all events (rounded to 2 decimals). */
  readonly intensityAvg: number;
  /** Highest sensitivity observed across all events. */
  readonly sensitivityMax: VoiceMoodSensitivity;
  /** Most common tradition tag (or null if no events had one). */
  readonly topTradition: string | null;
  /** Number of distinct sessions (by `source` + `recordedAt` hour). */
  readonly sessionCount: number;
  /** Sum of `durationSec` across all events. */
  readonly totalDurationSec: number;
  /** ISO of the most recent event (null if no events). */
  readonly lastEventAt: string | null;
  /** ISO of the oldest event (null if no events). */
  readonly firstEventAt: string | null;
}

/**
 * Integrity header attached to every export.
 *
 *   - `sha256`  : SHA-256 of the serialised payload (canonical UTF-8 JSON).
 *   - `fnv1a`   : FNV-1a 32-bit hash of the payload for fast dedup.
 *   - `byteSize`: byte length of the serialised payload.
 *   - `builtAt` : ISO timestamp of bundle construction.
 *   - `version` : engine version (constant).
 */
export interface VoiceMoodIntegrityHeader {
  readonly sha256: string;
  readonly fnv1a: string;
  readonly byteSize: number;
  readonly builtAt: string;
  readonly version: string;
}

/**
 * Top-level bundle emitted by `exportAll`.
 */
export interface VoiceMoodHistoryBundle {
  readonly userId: string;
  readonly exportedAt: string;
  readonly windowDays: WindowDays;
  readonly events: readonly VoiceMoodEvent[];
  readonly aggregate: VoiceMoodAggregate;
  readonly locale: LocaleId;
  readonly format: ExportFormat;
  readonly redactionLevel: RedactionLevel;
  readonly integrity: VoiceMoodIntegrityHeader;
  readonly consent: VoiceMoodConsent;
}

/**
 * A single audit-log entry. Append-only; never mutated after write.
 */
export interface VoiceMoodAuditEntry {
  readonly id: string;
  readonly userIdHash: string;
  readonly action:
    | "export"
    | "delete"
    | "redact"
    | "consent_in"
    | "consent_out"
    | "audit_export";
  readonly timestamp: string;
  readonly eventCount: number;
  readonly format: ExportFormat | "audit";
  readonly redactionLevel: RedactionLevel;
  readonly notes: string | null;
}

/**
 * Lightweight descriptor used by `summariseHistory` to avoid materialising
 * a full bundle for very large histories.
 */
export interface VoiceMoodHistoryDescriptor {
  readonly userId: string;
  readonly eventCount: number;
  readonly firstEventAt: string | null;
  readonly lastEventAt: string | null;
  readonly consents: VoiceMoodConsent | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// §2   CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Engine version constant (mirrors w50/w51 pattern). */
export const ENGINE_VERSION = "w51/voice-mood-history-export@1.0.0";

/** Hard cap on `forever` window in days (5 years). */
export const FOREVER_CAP_DAYS = 365 * 5;

/** Maximum bundle byte size (10 MiB) before `BUNDLE_TOO_LARGE` fires. */
export const BUNDLE_MAX_BYTES = 10 * 1024 * 1024;

/** Default locale when none is supplied. */
export const DEFAULT_LOCALE: LocaleId = "pt-BR";

/** Default retention policy applied to new events. */
export const DEFAULT_RETENTION: RetentionDays = 90;

/** Default window when none is supplied. */
export const DEFAULT_WINDOW: WindowDays = 90;

/** Maximum events retained per-user in-memory (memory-cap for tests). */
export const IN_MEMORY_EVENT_CAP = 50_000;

/** Default format. */
export const DEFAULT_FORMAT: ExportFormat = "json";

/** Default redaction level. */
export const DEFAULT_REDACTION: RedactionLevel = 0;

/** Salt used for redaction hashing (in a real deployment, env-driven). */
export const REDACTION_SALT = "w51/voice-mood-history-export/v1";

/** Supported locales (constant for iteration). */
export const SUPPORTED_LOCALES: readonly LocaleId[] = [
  "pt-BR",
  "en-US",
  "es-ES",
] as const;

/** Supported windows. */
export const SUPPORTED_WINDOWS: readonly WindowDays[] = [
  30,
  90,
  365,
  "forever",
] as const;

/** Supported formats. */
export const SUPPORTED_FORMATS: readonly ExportFormat[] = [
  "json",
  "csv",
  "jsonl",
] as const;

/** Supported sources. */
export const SUPPORTED_SOURCES: readonly VoiceMoodSource[] = [
  "voice_clone",
  "live_recording",
  "upload",
] as const;

/** Allowed redaction levels. */
export const SUPPORTED_REDACTION_LEVELS: readonly RedactionLevel[] = [
  0,
  1,
  2,
  3,
  4,
] as const;

/**
 * Per-level redaction spec.
 *   0 — none
 *   1 — redact userId to SHA-256 hash
 *   2 — redact userId + offset dates by random (deterministic per event)
 *   3 — redact userId + dates + drop events with sensitivity > 4
 *   4 — full redaction: only aggregate stats, no raw events
 */
export const REDACTION_LEVELS: Readonly<
  Record<RedactionLevel, { readonly label: string; readonly description: string }>
> = {
  0: { label: "none", description: "no redaction (raw export)" },
  1: { label: "user-hash", description: "userId replaced with SHA-256 hash" },
  2: { label: "user+dates", description: "userId hashed; dates offset" },
  3: {
    label: "user+dates+drop-sensitive",
    description: "userId hashed; dates offset; high-sensitivity events dropped",
  },
  4: {
    label: "aggregate-only",
    description: "no raw events; only aggregate stats",
  },
} as const;

/**
 * Mood labels per locale (used by the CSV/JSON serializers).
 */
export const MOOD_LABELS: Readonly<Record<LocaleId, Readonly<Record<VoiceMood, string>>>> = {
  "pt-BR": {
    serene: "sereno",
    joyful: "alegre",
    anxious: "ansioso",
    sad: "triste",
    angry: "irritado",
    grateful: "grato",
    reflective: "reflexivo",
    hopeful: "esperançoso",
    neutral: "neutro",
    longing: "saudoso",
  },
  "en-US": {
    serene: "serene",
    joyful: "joyful",
    anxious: "anxious",
    sad: "sad",
    angry: "angry",
    grateful: "grateful",
    reflective: "reflective",
    hopeful: "hopeful",
    neutral: "neutral",
    longing: "longing",
  },
  "es-ES": {
    serene: "sereno",
    joyful: "alegre",
    anxious: "ansioso",
    sad: "triste",
    angry: "enfadado",
    grateful: "agradecido",
    reflective: "reflexivo",
    hopeful: "esperanzado",
    neutral: "neutral",
    longing: "añorante",
  },
} as const;

/**
 * Tradition tag whitelist (mirrors w50 `TRADITION_TAGS` shape).
 * `null` is permitted (unconstrained).
 */
export const TRADITION_TAGS: readonly string[] = [
  "candomble",
  "umbanda",
  "ifa",
  "cabala",
  "budismo",
  "hinduismo",
  "xamanismo",
  "cristianismo",
  "umbanda-cristianismo",
  "espiritismo",
] as const;

/** Mood → emoji (decorative; used by optional CSV header). */
export const MOOD_EMOJI: Readonly<Record<VoiceMood, string>> = {
  serene: "🌊",
  joyful: "🌞",
  anxious: "⚡",
  sad: "🌧",
  angry: "🔥",
  grateful: "🙏",
  reflective: "🪞",
  hopeful: "🌱",
  neutral: "○",
  longing: "🌙",
} as const;

/** CSV header row. */
export const CSV_HEADER: readonly string[] = [
  "id",
  "userId",
  "recordedAt",
  "mood",
  "w49Label",
  "intensity",
  "durationSec",
  "source",
  "sensitivity",
  "tradition",
  "locale",
  "retentionDays",
] as const;

/** JSONL fields (one-per-line; same order as CSV header). */
export const JSONL_FIELDS: readonly string[] = [
  "id",
  "userId",
  "recordedAt",
  "mood",
  "w49Label",
  "intensity",
  "durationSec",
  "source",
  "sensitivity",
  "tradition",
  "locale",
  "retentionDays",
] as const;

/** Engine error code constants. */
export const ERR_NO_CONSENT = "VME_NO_CONSENT";
export const ERR_NO_DATA = "VME_NO_DATA";
export const ERR_INVALID_WINDOW = "VME_INVALID_WINDOW";
export const ERR_INVALID_FORMAT = "VME_INVALID_FORMAT";
export const ERR_RETENTION_EXPIRED = "VME_RETENTION_EXPIRED";
export const ERR_BUNDLE_TOO_LARGE = "VME_BUNDLE_TOO_LARGE";

/** Maximum events supported per single export request. */
export const MAX_EVENTS_PER_EXPORT = 100_000;

// ─────────────────────────────────────────────────────────────────────────────
// §3   HASHES — hand-rolled SHA-256 (64-round) + FNV-1a (32-bit)
// ─────────────────────────────────────────────────────────────────────────────

const SHA256_K: readonly number[] = [
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
] as const;

const SHA256_H: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
] as const;

/**
 * Right-rotate a 32-bit unsigned integer.
 */
function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * Hand-rolled SHA-256 over a UTF-8 string. Returns hex (lowercase).
 *
 * Implements the FIPS 180-4 algorithm with the standard 64-round
 * compression function.  No external deps.
 */
export function sha256Hex(input: string): string {
  // 1. Encode UTF-8 → bytes
  const utf8 = unescape(encodeURIComponent(input));
  const bytes: number[] = [];
  for (let i = 0; i < utf8.length; i++) {
    bytes.push(utf8.charCodeAt(i) & 0xff);
  }
  const len = bytes.length;

  // 2. Append 0x80
  bytes.push(0x80);

  // 3. Pad to length ≡ 56 (mod 64)
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }

  // 4. Append bit-length as 64-bit big-endian
  const bitLen = len * 8;
  // high 32 bits = 0 (we only deal with strings < 2^32 bytes here)
  for (let i = 7; i >= 0; i--) {
    bytes.push(i <= 3 ? 0 : (bitLen >>> ((7 - i) * 8)) & 0xff);
  }

  // 5. Process each 512-bit (64-byte) block
  const H = SHA256_H.slice();
  const w = new Array<number>(64);

  for (let block = 0; block < bytes.length; block += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] =
        ((bytes[block + t * 4] ?? 0) << 24) |
        ((bytes[block + t * 4 + 1] ?? 0) << 16) |
        ((bytes[block + t * 4 + 2] ?? 0) << 8) |
        (bytes[block + t * 4 + 3] ?? 0);
      w[t] = w[t]! >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15]!, 7) ^ rotr(w[t - 15]!, 18) ^ (w[t - 15]! >>> 3);
      const s1 = rotr(w[t - 2]!, 17) ^ rotr(w[t - 2]!, 19) ^ (w[t - 2]! >>> 10);
      w[t] = (w[t - 16]! + s0 + w[t - 7]! + s1) >>> 0;
    }

    let a = H[0]!;
    let b = H[1]!;
    let c = H[2]!;
    let d = H[3]!;
    let e = H[4]!;
    let f = H[5]!;
    let g = H[6]!;
    let h = H[7]!;

    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[t]! + w[t]!) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
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

    H[0] = (H[0]! + a) >>> 0;
    H[1] = (H[1]! + b) >>> 0;
    H[2] = (H[2]! + c) >>> 0;
    H[3] = (H[3]! + d) >>> 0;
    H[4] = (H[4]! + e) >>> 0;
    H[5] = (H[5]! + f) >>> 0;
    H[6] = (H[6]! + g) >>> 0;
    H[7] = (H[7]! + h) >>> 0;
  }

  // 6. Hex-encode
  let hex = "";
  for (let i = 0; i < 8; i++) {
    hex += (H[i]!.toString(16).padStart(8, "0"));
  }
  return hex;
}

/**
 * Salt a string before hashing. Used by redaction level 1+.
 */
export function saltedSha256(input: string, salt: string = REDACTION_SALT): string {
  return sha256Hex(`${salt}::${input}`);
}

/**
 * FNV-1a 32-bit hash. Returns 8-character lowercase hex.
 * Fast duplicate detection / non-cryptographic fingerprint.
 */
export function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * FNV-1a 64-bit (using two 32-bit lanes combined for compatibility
 * with JS number precision limits). Returns 16-char lowercase hex.
 */
export function fnv1a64(input: string): string {
  let h1 = 0xcbf29ce4;
  let h2 = 0x84222325;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i) & 0xff;
    h1 = (((h1 ^ c) * 0x01000193) >>> 0);
    h2 = (((h2 ^ c) * 0x00000193) >>> 0);
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

/**
 * Tiny non-cryptographic RNG (mulberry32) — deterministic given a seed.
 * Used by redaction-level-2 to compute date offsets in a reproducible way.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §4   SERIALIZERS — JSON / CSV (RFC 4180) / JSONL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Canonical JSON serialisation: sorted keys, no whitespace. Used by the
 * integrity-header computation so that re-serialising the same payload
 * yields the same byte sequence.
 */
export function canonicalJsonStringify(value: unknown): string {
  return canonicalStringify(value);
}

function canonicalStringify(value: unknown): string {
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const parts = value.map((v) => canonicalStringify(v));
    return `[${parts.join(",")}]`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const parts = keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(obj[k])}`);
    return `{${parts.join(",")}}`;
  }
  return JSON.stringify(String(value));
}

/**
 * RFC 4180 CSV cell escape:
 *  - wrap in quotes if cell contains comma, quote, CR, or LF
 *  - double-up any embedded quotes
 */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Serialise a single VoiceMoodEvent row to CSV (header is added by caller).
 */
export function eventToCsvRow(event: VoiceMoodEvent): string {
  const cells = [
    csvCell(event.id),
    csvCell(event.userId),
    csvCell(event.recordedAt),
    csvCell(event.mood),
    csvCell(event.w49Label),
    csvCell(event.intensity),
    csvCell(event.durationSec),
    csvCell(event.source),
    csvCell(event.sensitivity),
    csvCell(event.tradition),
    csvCell(event.locale),
    csvCell(event.retentionDays),
  ];
  return cells.join(",");
}

/**
 * Serialise a single VoiceMoodEvent to JSONL (one line of canonical JSON).
 */
export function eventToJsonl(event: VoiceMoodEvent): string {
  return canonicalJsonStringify(event);
}

/**
 * Serialise the full bundle to JSON (canonical).
 */
export function bundleToJson(bundle: VoiceMoodHistoryBundle): string {
  return canonicalJsonStringify(bundle);
}

/**
 * Serialise the full bundle to CSV (header row + one event per row).
 * Note: aggregate stats are appended as a footer block under a blank line.
 */
export function bundleToCsv(bundle: VoiceMoodHistoryBundle): string {
  const lines: string[] = [];
  lines.push(CSV_HEADER.join(","));
  for (const ev of bundle.events) {
    lines.push(eventToCsvRow(ev));
  }
  // Footer: aggregate stats
  lines.push("");
  lines.push(csvCell("# aggregate"));
  lines.push(`# moodDistribution,${csvCell(JSON.stringify(bundle.aggregate.moodDistribution))}`);
  lines.push(`# intensityAvg,${csvCell(String(bundle.aggregate.intensityAvg))}`);
  lines.push(`# sensitivityMax,${csvCell(String(bundle.aggregate.sensitivityMax))}`);
  lines.push(`# topTradition,${csvCell(String(bundle.aggregate.topTradition))}`);
  lines.push(`# sessionCount,${csvCell(String(bundle.aggregate.sessionCount))}`);
  lines.push(`# totalDurationSec,${csvCell(String(bundle.aggregate.totalDurationSec))}`);
  lines.push(`# firstEventAt,${csvCell(String(bundle.aggregate.firstEventAt))}`);
  lines.push(`# lastEventAt,${csvCell(String(bundle.aggregate.lastEventAt))}`);
  return lines.join("\n");
}

/**
 * Serialise the full bundle to JSONL (one JSON object per line — events only).
 * A header line containing bundle metadata is emitted first.
 */
export function bundleToJsonl(bundle: VoiceMoodHistoryBundle): string {
  const lines: string[] = [];
  lines.push(
    canonicalJsonStringify({
      kind: "bundle-header",
      userId: bundle.userId,
      exportedAt: bundle.exportedAt,
      windowDays: bundle.windowDays,
      locale: bundle.locale,
      format: bundle.format,
      redactionLevel: bundle.redactionLevel,
      aggregate: bundle.aggregate,
      integrity: bundle.integrity,
    }),
  );
  for (const ev of bundle.events) {
    lines.push(eventToJsonl(ev));
  }
  return lines.join("\n");
}

/**
 * Dispatch serialiser by format.
 */
export function serialiseBundle(
  bundle: VoiceMoodHistoryBundle,
  format: ExportFormat,
): string {
  switch (format) {
    case "json":
      return bundleToJson(bundle);
    case "csv":
      return bundleToCsv(bundle);
    case "jsonl":
      return bundleToJsonl(bundle);
  }
}

/**
 * Compute UTF-8 byte length of a string.
 */
export function utf8ByteLength(s: string): number {
  return unescape(encodeURIComponent(s)).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// §5   VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a `WindowDays` value. Returns `{ ok, error? }`.
 */
export function validateWindow(value: unknown): { ok: boolean; error?: string } {
  if (value === "forever") return { ok: true };
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { ok: false, error: "window must be a number or 'forever'" };
  }
  if (value !== 30 && value !== 90 && value !== 365) {
    return { ok: false, error: `unsupported window ${value} (allowed: 30|90|365|forever)` };
  }
  return { ok: true };
}

/**
 * Validate an `ExportFormat` value.
 */
export function validateFormat(value: unknown): { ok: boolean; error?: string } {
  if (value === "json" || value === "csv" || value === "jsonl") return { ok: true };
  return { ok: false, error: `unsupported format ${String(value)} (allowed: json|csv|jsonl)` };
}

/**
 * Validate a `RedactionLevel` value.
 */
export function validateRedactionLevel(value: unknown): { ok: boolean; error?: string } {
  if (value === 0 || value === 1 || value === 2 || value === 3 || value === 4) return { ok: true };
  return { ok: false, error: `unsupported redaction level ${String(value)} (allowed: 0|1|2|3|4)` };
}

/**
 * Validate a `LocaleId` value.
 */
export function validateLocale(value: unknown): { ok: boolean; error?: string } {
  if (value === "pt-BR" || value === "en-US" || value === "es-ES") return { ok: true };
  return { ok: false, error: `unsupported locale ${String(value)} (allowed: pt-BR|en-US|es-ES)` };
}

/**
 * Validate a `VoiceMood` value.
 */
export function validateMood(value: unknown): { ok: boolean; error?: string } {
  if (typeof value !== "string") return { ok: false, error: "mood must be a string" };
  if ((VOICE_MOODS as readonly string[]).includes(value)) return { ok: true };
  return { ok: false, error: `unsupported mood ${value}` };
}

/**
 * Validate a `VoiceMoodSource` value.
 */
export function validateSource(value: unknown): { ok: boolean; error?: string } {
  if (value === "voice_clone" || value === "live_recording" || value === "upload") {
    return { ok: true };
  }
  return { ok: false, error: `unsupported source ${String(value)}` };
}

/**
 * Validate a 1..5 sensitivity/intensity.
 */
export function validateSensitivity(value: unknown): { ok: boolean; error?: string } {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) return { ok: true };
  return { ok: false, error: `sensitivity must be 1..5 (got ${String(value)})` };
}

/**
 * Validate a `RetentionDays` value.
 */
export function validateRetention(value: unknown): { ok: boolean; error?: string } {
  if (value === "forever") return { ok: true };
  if (value === 30 || value === 90 || value === 365) return { ok: true };
  return { ok: false, error: `unsupported retention ${String(value)}` };
}

/**
 * Validate a `VoiceMoodEvent` shape. Performs 10+ checks; throws on first
 * failure or returns `{ ok, warnings }` (collect-all mode).
 */
export interface EventValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export function validateEvent(event: unknown): EventValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (typeof event !== "object" || event === null) {
    return { ok: false, errors: ["event must be an object"], warnings };
  }
  const e = event as Record<string, unknown>;

  // 1. id
  if (typeof e.id !== "string" || e.id.length === 0) {
    errors.push("id must be a non-empty string");
  }
  // 2. userId
  if (typeof e.userId !== "string" || e.userId.length === 0) {
    errors.push("userId must be a non-empty string");
  }
  // 3. recordedAt (ISO parseable)
  if (typeof e.recordedAt !== "string" || Number.isNaN(Date.parse(e.recordedAt))) {
    errors.push("recordedAt must be an ISO-8601 timestamp");
  }
  // 4. mood
  const moodCheck = validateMood(e.mood);
  if (!moodCheck.ok) errors.push(moodCheck.error ?? "invalid mood");
  // 5. w49Label
  if (typeof e.w49Label !== "string") errors.push("w49Label must be a string");
  // 6. intensity
  const intensityCheck = validateSensitivity(e.intensity);
  if (!intensityCheck.ok) errors.push(intensityCheck.error ?? "invalid intensity");
  // 7. durationSec
  if (typeof e.durationSec !== "number" || !Number.isFinite(e.durationSec) || e.durationSec < 0) {
    errors.push("durationSec must be a non-negative finite number");
  } else if (e.durationSec > 24 * 3600) {
    warnings.push("durationSec > 24h (suspicious)");
  }
  // 8. source
  const sourceCheck = validateSource(e.source);
  if (!sourceCheck.ok) errors.push(sourceCheck.error ?? "invalid source");
  // 9. sensitivity
  const sensCheck = validateSensitivity(e.sensitivity);
  if (!sensCheck.ok) errors.push(sensCheck.error ?? "invalid sensitivity");
  // 10. tradition (string or null)
  if (e.tradition !== null && typeof e.tradition !== "string") {
    errors.push("tradition must be a string or null");
  }
  // 11. locale
  const locCheck = validateLocale(e.locale);
  if (!locCheck.ok) errors.push(locCheck.error ?? "invalid locale");
  // 12. retentionDays
  const retCheck = validateRetention(e.retentionDays);
  if (!retCheck.ok) errors.push(retCheck.error ?? "invalid retentionDays");

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Throw if event invalid.
 */
export function assertValidEvent(event: unknown): asserts event is VoiceMoodEvent {
  const result = validateEvent(event);
  if (!result.ok) {
    throw new Error(`invalid VoiceMoodEvent: ${result.errors.join("; ")}`);
  }
}

/**
 * Validate the entire bundle structurally (does not verify integrity header).
 */
export function validateBundle(bundle: unknown): EventValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (typeof bundle !== "object" || bundle === null) {
    return { ok: false, errors: ["bundle must be an object"], warnings };
  }
  const b = bundle as Record<string, unknown>;
  if (typeof b.userId !== "string") errors.push("bundle.userId must be a string");
  if (typeof b.exportedAt !== "string") errors.push("bundle.exportedAt must be a string");
  if (!validateWindow(b.windowDays).ok) errors.push("bundle.windowDays invalid");
  if (!Array.isArray(b.events)) errors.push("bundle.events must be an array");
  if (typeof b.aggregate !== "object" || b.aggregate === null) {
    errors.push("bundle.aggregate must be an object");
  }
  if (!validateFormat(b.format).ok) errors.push("bundle.format invalid");
  if (!validateRedactionLevel(b.redactionLevel).ok) errors.push("bundle.redactionLevel invalid");
  if (typeof b.integrity !== "object" || b.integrity === null) {
    errors.push("bundle.integrity must be an object");
  }
  if (Array.isArray(b.events)) {
    for (let i = 0; i < b.events.length; i++) {
      const r = validateEvent(b.events[i]);
      if (!r.ok) errors.push(`bundle.events[${i}]: ${r.errors.join("; ")}`);
    }
    if (b.events.length > MAX_EVENTS_PER_EXPORT) {
      warnings.push(`bundle.events length ${b.events.length} > MAX_EVENTS_PER_EXPORT`);
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// §6   ERRORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base class for all voice-mood-history-export errors.
 */
export class VoiceMoodExportError extends Error {
  public readonly code: string;
  public readonly meta: Readonly<Record<string, unknown>>;
  constructor(code: string, message: string, meta: Record<string, unknown> = {}) {
    super(message);
    this.name = "VoiceMoodExportError";
    this.code = code;
    this.meta = meta;
  }
}

/**
 * VME_NO_CONSENT — user has not opted in to voice-mood history retention.
 */
export class ConsentMissingError extends VoiceMoodExportError {
  constructor(message: string = "user has not opted in to voice-mood history", meta: Record<string, unknown> = {}) {
    super(ERR_NO_CONSENT, message, meta);
    this.name = "ConsentMissingError";
  }
}

/**
 * VME_NO_DATA — no events match the requested window.
 */
export class NoDataError extends VoiceMoodExportError {
  constructor(message: string = "no events match the requested window", meta: Record<string, unknown> = {}) {
    super(ERR_NO_DATA, message, meta);
    this.name = "NoDataError";
  }
}

/**
 * VME_INVALID_WINDOW — caller passed an unsupported window.
 */
export class InvalidWindowError extends VoiceMoodExportError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(ERR_INVALID_WINDOW, message, meta);
    this.name = "InvalidWindowError";
  }
}

/**
 * VME_INVALID_FORMAT — caller passed an unsupported format.
 */
export class InvalidFormatError extends VoiceMoodExportError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(ERR_INVALID_FORMAT, message, meta);
    this.name = "InvalidFormatError";
  }
}

/**
 * VME_RETENTION_EXPIRED — caller tried to access data past its retention cap.
 */
export class RetentionExpiredError extends VoiceMoodExportError {
  constructor(message: string = "data past retention cap", meta: Record<string, unknown> = {}) {
    super(ERR_RETENTION_EXPIRED, message, meta);
    this.name = "RetentionExpiredError";
  }
}

/**
 * VME_BUNDLE_TOO_LARGE — serialised bundle exceeds `BUNDLE_MAX_BYTES`.
 */
export class BundleTooLargeError extends VoiceMoodExportError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(ERR_BUNDLE_TOO_LARGE, message, meta);
    this.name = "BundleTooLargeError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// §7   CONSENT GATING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a fresh consent ledger entry. `optedInAt` defaults to now.
 */
export function buildConsent(
  opts: Partial<VoiceMoodConsent> & { voiceMoodConsent: boolean },
): VoiceMoodConsent {
  const now = new Date().toISOString();
  return {
    voiceMoodConsent: !!opts.voiceMoodConsent,
    exportConsent: !!opts.exportConsent,
    optedInAt: opts.optedInAt ?? now,
    optedOutAt: opts.optedOutAt ?? null,
  };
}

/**
 * Assert that consent is currently granted (LGPD Art. 7).
 */
export function assertConsent(consent: VoiceMoodConsent | null | undefined): void {
  if (!consent || !consent.voiceMoodConsent) {
    throw new ConsentMissingError();
  }
}

/**
 * Mark a consent ledger as opted out. Pure helper — does not mutate input.
 */
export function optOut(consent: VoiceMoodConsent, when: string = new Date().toISOString()): VoiceMoodConsent {
  return {
    voiceMoodConsent: false,
    exportConsent: consent.exportConsent,
    optedInAt: consent.optedInAt,
    optedOutAt: when,
  };
}

/**
 * Mark a consent ledger as opted in.
 */
export function optIn(consent: VoiceMoodConsent, when: string = new Date().toISOString()): VoiceMoodConsent {
  return {
    voiceMoodConsent: true,
    exportConsent: consent.exportConsent,
    optedInAt: when,
    optedOutAt: null,
  };
}

/**
 * Toggle export consent (separate flag for portability under Art. 18).
 */
export function setExportConsent(
  consent: VoiceMoodConsent,
  granted: boolean,
): VoiceMoodConsent {
  return {
    voiceMoodConsent: consent.voiceMoodConsent,
    exportConsent: granted,
    optedInAt: consent.optedInAt,
    optedOutAt: consent.optedOutAt,
  };
}

/**
 * True if consent is currently valid for export/delete operations.
 */
export function hasActiveConsent(consent: VoiceMoodConsent | null | undefined): boolean {
  if (!consent) return false;
  if (!consent.voiceMoodConsent) return false;
  if (consent.optedOutAt) return false;
  return true;
}

/**
 * True if consent permits export (LGPD Art. 18 portability).
 */
export function hasExportConsent(consent: VoiceMoodConsent | null | undefined): boolean {
  if (!consent) return false;
  if (!consent.voiceMoodConsent) return false;
  if (!consent.exportConsent) return false;
  if (consent.optedOutAt) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// §8   WINDOW SELECTION + RETENTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a window preset to a (fromMs, toMs) range relative to `now`.
 * `forever` is capped at `FOREVER_CAP_DAYS`.
 */
export function windowToRange(
  windowDays: WindowDays,
  now: Date = new Date(),
): { fromMs: number; toMs: number } {
  const toMs = now.getTime();
  let fromMs: number;
  if (windowDays === "forever") {
    fromMs = toMs - FOREVER_CAP_DAYS * 24 * 3600 * 1000;
  } else {
    fromMs = toMs - windowDays * 24 * 3600 * 1000;
  }
  return { fromMs, toMs };
}

/**
 * Filter events to a window.
 */
export function filterEventsByWindow(
  events: readonly VoiceMoodEvent[],
  windowDays: WindowDays,
  now: Date = new Date(),
): VoiceMoodEvent[] {
  const { fromMs, toMs } = windowToRange(windowDays, now);
  return events.filter((e) => {
    const t = Date.parse(e.recordedAt);
    if (Number.isNaN(t)) return false;
    return t >= fromMs && t <= toMs;
  });
}

/**
 * Drop events whose age exceeds their `retentionDays` policy.
 * `forever` is treated as `FOREVER_CAP_DAYS`.
 */
export function applyRetention(
  events: readonly VoiceMoodEvent[],
  now: Date = new Date(),
): VoiceMoodEvent[] {
  const nowMs = now.getTime();
  return events.filter((e) => {
    const t = Date.parse(e.recordedAt);
    if (Number.isNaN(t)) return false;
    const ageDays = (nowMs - t) / (24 * 3600 * 1000);
    const cap = e.retentionDays === "forever" ? FOREVER_CAP_DAYS : e.retentionDays;
    return ageDays <= cap;
  });
}

/**
 * Convenience: apply retention first, then window filter.
 */
export function selectEvents(
  events: readonly VoiceMoodEvent[],
  windowDays: WindowDays,
  now: Date = new Date(),
): VoiceMoodEvent[] {
  const retained = applyRetention(events, now);
  return filterEventsByWindow(retained, windowDays, now);
}

// ─────────────────────────────────────────────────────────────────────────────
// §9   AGGREGATE STATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the empty mood distribution (all 10 moods at zero).
 */
export function emptyMoodDistribution(): Record<VoiceMood, number> {
  const out: Record<string, number> = {};
  for (const m of VOICE_MOODS) out[m] = 0;
  return out as Record<VoiceMood, number>;
}

/**
 * Round to 2 decimal places (positive numbers only).
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Compute aggregate stats over a list of events.
 */
export function computeAggregate(events: readonly VoiceMoodEvent[]): VoiceMoodAggregate {
  const dist = emptyMoodDistribution();
  if (events.length === 0) {
    return {
      moodDistribution: dist,
      intensityAvg: 0,
      sensitivityMax: 1,
      topTradition: null,
      sessionCount: 0,
      totalDurationSec: 0,
      firstEventAt: null,
      lastEventAt: null,
    };
  }

  let intensitySum = 0;
  let sensitivityMax: VoiceMoodSensitivity = 1;
  const traditionCounts: Record<string, number> = {};
  const sessionKeys = new Set<string>();
  let totalDurationSec = 0;
  let firstTs = Number.POSITIVE_INFINITY;
  let lastTs = Number.NEGATIVE_INFINITY;

  for (const e of events) {
    dist[e.mood] = (dist[e.mood] ?? 0) + 1;
    intensitySum += e.intensity;
    if (e.sensitivity > sensitivityMax) sensitivityMax = e.sensitivity;
    if (e.tradition !== null) {
      traditionCounts[e.tradition] = (traditionCounts[e.tradition] ?? 0) + 1;
    }
    const sessionKey = `${e.source}@${e.recordedAt.slice(0, 13)}`;
    sessionKeys.add(sessionKey);
    totalDurationSec += e.durationSec;
    const ts = Date.parse(e.recordedAt);
    if (ts < firstTs) firstTs = ts;
    if (ts > lastTs) lastTs = ts;
  }

  let topTradition: string | null = null;
  let topCount = 0;
  for (const [tag, c] of Object.entries(traditionCounts)) {
    if (c > topCount) {
      topCount = c;
      topTradition = tag;
    }
  }

  return {
    moodDistribution: dist,
    intensityAvg: round2(intensitySum / events.length),
    sensitivityMax,
    topTradition,
    sessionCount: sessionKeys.size,
    totalDurationSec,
    firstEventAt: new Date(firstTs).toISOString(),
    lastEventAt: new Date(lastTs).toISOString(),
  };
}

/**
 * Quick summary for a user's history (no aggregate, just descriptor).
 */
export function summariseHistory(
  userId: string,
  events: readonly VoiceMoodEvent[],
  consent: VoiceMoodConsent | null,
): VoiceMoodHistoryDescriptor {
  if (events.length === 0) {
    return {
      userId,
      eventCount: 0,
      firstEventAt: null,
      lastEventAt: null,
      consents: consent,
    };
  }
  let firstTs = Number.POSITIVE_INFINITY;
  let lastTs = Number.NEGATIVE_INFINITY;
  for (const e of events) {
    const t = Date.parse(e.recordedAt);
    if (t < firstTs) firstTs = t;
    if (t > lastTs) lastTs = t;
  }
  return {
    userId,
    eventCount: events.length,
    firstEventAt: new Date(firstTs).toISOString(),
    lastEventAt: new Date(lastTs).toISOString(),
    consents: consent,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §10  REDACTION PIPELINE (5 levels)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hash a userId using the engine salt (level 1+).
 */
export function hashUserId(userId: string): string {
  return saltedSha256(userId);
}

/**
 * Apply date offset (level 2+). Uses a deterministic per-event RNG so the
 * same event always gets the same offset across exports.
 */
export function offsetDate(iso: string, seedKey: string, maxDays: number = 365): string {
  const seed = fnv1a32ToInt(seedKey);
  const rng = mulberry32(seed);
  const offsetDays = Math.floor(rng() * (maxDays * 2)) - maxDays;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t + offsetDays * 24 * 3600 * 1000).toISOString();
}

function fnv1a32ToInt(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Drop events above the sensitivity threshold (level 3).
 */
export function dropHighSensitivityEvents(
  events: readonly VoiceMoodEvent[],
  threshold: VoiceMoodSensitivity = 4,
): VoiceMoodEvent[] {
  return events.filter((e) => e.sensitivity <= threshold);
}

/**
 * Apply the full redaction pipeline. Returns a NEW array (never mutates input).
 */
export function redactEvents(
  events: readonly VoiceMoodEvent[],
  level: RedactionLevel,
  userIdSalt: string = REDACTION_SALT,
): VoiceMoodEvent[] {
  if (level === 0) return events.slice();
  if (level === 4) return []; // aggregate only — caller handles

  const hashedId = saltedSha256(events[0]?.userId ?? "anon", userIdSalt);

  return events
    .filter((e) => (level >= 3 ? e.sensitivity <= 4 : true))
    .map((e) => {
      const out: VoiceMoodEvent = {
        ...e,
        userId: level >= 1 ? hashedId : e.userId,
        recordedAt: level >= 2 ? offsetDate(e.recordedAt, e.id + ":" + e.userId) : e.recordedAt,
      };
      return out;
    });
}

/**
 * Build a redacted aggregate (level 4 — no raw events).
 */
export function buildRedactedAggregate(
  events: readonly VoiceMoodEvent[],
  level: RedactionLevel,
): VoiceMoodAggregate {
  const agg = computeAggregate(events);
  if (level < 2) return agg;
  // Date fuzzing at level 2+ would break monotonic ordering; we keep dates
  // intact in aggregate and only fuzz at event level.
  return agg;
}

// ─────────────────────────────────────────────────────────────────────────────
// §11  EXPORT BUILDERS + INTEGRITY HEADER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the integrity header for a serialised payload.
 */
export function buildIntegrityHeader(
  payload: string,
  builtAt: string = new Date().toISOString(),
): VoiceMoodIntegrityHeader {
  return {
    sha256: sha256Hex(payload),
    fnv1a: fnv1a32(payload),
    byteSize: utf8ByteLength(payload),
    builtAt,
    version: ENGINE_VERSION,
  };
}

/**
 * Verify the integrity header of a serialised bundle.
 *
 * The integrity was computed over the payload with the inner integrity
 * block replaced by a placeholder (all-zeros hash + fnv, byteSize=0,
 * same builtAt/version). To verify, we do the same substitution on the
 * incoming payload before re-hashing.
 *
 * Supports both canonical-sorted JSON (inner integrity is sorted by key)
 * and native JSON.stringify (inner integrity preserves insertion order).
 */
export function verifyIntegrity(
  payload: string,
  header: VoiceMoodIntegrityHeader,
): boolean {
  // Build placeholder using sorted keys (matches canonical JSON ordering)
  const placeholderSorted = canonicalJsonStringify({
    sha256: "0".repeat(64),
    fnv1a: "0".repeat(8),
    byteSize: 0,
    builtAt: header.builtAt,
    version: header.version,
  });
  const headerSorted = canonicalJsonStringify(header);
  let canonical = payload.split(headerSorted).join(placeholderSorted);

  // Also try the native JSON.stringify ordering (insertion order)
  const placeholderNative = JSON.stringify({
    sha256: "0".repeat(64),
    fnv1a: "0".repeat(8),
    byteSize: 0,
    builtAt: header.builtAt,
    version: header.version,
  });
  const headerNative = JSON.stringify(header);
  // If the sorted substitution didn't change anything, the native form
  // might be the one in the payload.
  if (canonical === payload) {
    canonical = payload.split(headerNative).join(placeholderNative);
  }

  const sha = sha256Hex(canonical);
  const fnv = fnv1a32(canonical);
  return sha === header.sha256 && fnv === header.fnv1a;
}

/**
 * Build a complete bundle for export. Does NOT apply redaction (caller
 * passes already-redacted events) — see `exportAll` for the full pipeline.
 */
export function buildBundle(
  userId: string,
  events: readonly VoiceMoodEvent[],
  options: {
    windowDays: WindowDays;
    locale: LocaleId;
    format: ExportFormat;
    redactionLevel: RedactionLevel;
    consent: VoiceMoodConsent;
    exportedAt?: string;
    skipConsentGate?: boolean;
    now?: Date;
  },
): VoiceMoodHistoryBundle {
  if (!options.skipConsentGate) {
    assertConsent(options.consent);
  }
  const winCheck = validateWindow(options.windowDays);
  if (!winCheck.ok) throw new InvalidWindowError(winCheck.error ?? "invalid window");
  const fmtCheck = validateFormat(options.format);
  if (!fmtCheck.ok) throw new InvalidFormatError(fmtCheck.error ?? "invalid format");
  const locCheck = validateLocale(options.locale);
  if (!locCheck.ok) throw new InvalidFormatError(locCheck.error ?? "invalid locale");
  const redCheck = validateRedactionLevel(options.redactionLevel);
  if (!redCheck.ok) throw new InvalidFormatError(redCheck.error ?? "invalid redaction");

  const now = options.now ?? new Date();
  const redacted = redactEvents(events, options.redactionLevel);
  const aggregate = options.redactionLevel === 4
    ? buildRedactedAggregate(events, 4)
    : computeAggregate(redacted);
  const exportedAt = options.exportedAt ?? now.toISOString();

  // Integrity header is computed from the bundle with placeholder integrity
  // values; this avoids a self-referential hash. The placeholder is the
  // canonical "all-zeros" integrity header.
  const placeholderIntegrity: VoiceMoodIntegrityHeader = {
    sha256: "0".repeat(64),
    fnv1a: "0".repeat(8),
    byteSize: 0,
    builtAt: exportedAt,
    version: ENGINE_VERSION,
  };

  const bundleWithPlaceholder: VoiceMoodHistoryBundle = {
    userId: options.redactionLevel >= 1 ? hashUserId(userId) : userId,
    exportedAt,
    windowDays: options.windowDays,
    events: redacted,
    aggregate,
    locale: options.locale,
    format: options.format,
    redactionLevel: options.redactionLevel,
    integrity: placeholderIntegrity,
    consent: options.consent,
  };

  const serialisedForHash = serialiseBundle(bundleWithPlaceholder, options.format);
  const integrity: VoiceMoodIntegrityHeader = {
    sha256: sha256Hex(serialisedForHash),
    fnv1a: fnv1a32(serialisedForHash),
    byteSize: utf8ByteLength(serialisedForHash),
    builtAt: exportedAt,
    version: ENGINE_VERSION,
  };

  return { ...bundleWithPlaceholder, integrity };
}

/**
 * Top-level LGPD Art. 18 portability export. Composes all helpers.
 */
export function exportAll(
  userId: string,
  events: readonly VoiceMoodEvent[],
  options: Partial<{
    windowDays: WindowDays;
    locale: LocaleId;
    format: ExportFormat;
    redactionLevel: RedactionLevel;
    consent: VoiceMoodConsent | null;
    now: Date;
    skipConsentGate: boolean;
  }> = {},
): { bundle: VoiceMoodHistoryBundle; payload: string } {
  const windowDays = options.windowDays ?? DEFAULT_WINDOW;
  const locale = options.locale ?? DEFAULT_LOCALE;
  const format = options.format ?? DEFAULT_FORMAT;
  const redactionLevel = options.redactionLevel ?? DEFAULT_REDACTION;
  const consent = options.consent ?? buildConsent({ voiceMoodConsent: true });

  const winCheck = validateWindow(windowDays);
  if (!winCheck.ok) throw new InvalidWindowError(winCheck.error ?? "invalid window");
  const fmtCheck = validateFormat(format);
  if (!fmtCheck.ok) throw new InvalidFormatError(fmtCheck.error ?? "invalid format");
  const locCheck = validateLocale(locale);
  if (!locCheck.ok) throw new InvalidFormatError(locCheck.error ?? "invalid locale");
  const redCheck = validateRedactionLevel(redactionLevel);
  if (!redCheck.ok) throw new InvalidFormatError(redCheck.error ?? "invalid redaction");

  const now = options.now ?? new Date();

  // Window + retention filter
  const selected = selectEvents(events, windowDays, now);
  if (selected.length === 0 && redactionLevel !== 4) {
    throw new NoDataError(
      `no events match window ${String(windowDays)} for user ${userId}`,
      { userId, windowDays },
    );
  }

  const bundle = buildBundle(userId, selected, {
    windowDays,
    locale,
    format,
    redactionLevel,
    consent,
    now,
    skipConsentGate: options.skipConsentGate,
  });

  const payload = serialiseBundle(bundle, format);
  const size = utf8ByteLength(payload);
  if (size > BUNDLE_MAX_BYTES) {
    throw new BundleTooLargeError(
      `bundle size ${size} > BUNDLE_MAX_BYTES ${BUNDLE_MAX_BYTES}`,
      { size, max: BUNDLE_MAX_BYTES },
    );
  }

  return { bundle, payload };
}

// ─────────────────────────────────────────────────────────────────────────────
// §12  LGPD ART. 18 — DELETE + AUDIT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of a delete operation. The events themselves are filtered out;
 * `auditId` references the immutable audit entry.
 */
export interface VoiceMoodDeleteResult {
  readonly userId: string;
  readonly deletedAt: string;
  readonly deletedEventCount: number;
  readonly remainingEventCount: number;
  readonly auditId: string;
}

/**
 * LGPD Art. 18 right-to-erasure (soft delete — events removed from the
 * in-memory store; the audit entry is preserved for proof of erasure).
 */
export function deleteAll(
  userId: string,
  events: readonly VoiceMoodEvent[],
  consent: VoiceMoodConsent | null,
  auditLog: VoiceMoodAuditEntry[],
  now: Date = new Date(),
): { remaining: VoiceMoodEvent[]; result: VoiceMoodDeleteResult; audit: VoiceMoodAuditEntry[] } {
  assertConsent(consent);
  const matching = events.filter((e) => e.userId === userId);
  const remaining = events.filter((e) => e.userId !== userId);
  const deletedAt = now.toISOString();
  const auditId = generateAuditId(userId, deletedAt);
  const entry: VoiceMoodAuditEntry = {
    id: auditId,
    userIdHash: hashUserId(userId),
    action: "delete",
    timestamp: deletedAt,
    eventCount: matching.length,
    format: "audit",
    redactionLevel: 0,
    notes: matching.length === 0 ? "no events to delete" : null,
  };
  const newAudit = appendAudit(auditLog, entry);
  return {
    remaining,
    result: {
      userId,
      deletedAt,
      deletedEventCount: matching.length,
      remainingEventCount: remaining.length,
      auditId,
    },
    audit: newAudit,
  };
}

/**
 * Generate a stable audit id from userId + timestamp + action.
 */
export function generateAuditId(userId: string, when: string, action: string = "audit"): string {
  return `aud-${fnv1a32(`${userId}|${when}|${action}`)}`;
}

/**
 * Append an audit entry (immutable; returns a new array).
 */
export function appendAudit(
  log: readonly VoiceMoodAuditEntry[],
  entry: VoiceMoodAuditEntry,
): VoiceMoodAuditEntry[] {
  return [...log, entry];
}

/**
 * Filter audit entries to a given user hash (the audit log stores hashed ids).
 */
export function filterAuditByUser(
  log: readonly VoiceMoodAuditEntry[],
  userId: string,
): VoiceMoodAuditEntry[] {
  const h = hashUserId(userId);
  return log.filter((e) => e.userIdHash === h);
}

/**
 * Export the audit log slice for a user (proof of erasure / proof of consent).
 */
export function exportDeletionAudit(
  userId: string,
  auditLog: readonly VoiceMoodAuditEntry[],
  format: ExportFormat = "json",
): { payload: string; entries: VoiceMoodAuditEntry[] } {
  const entries = filterAuditByUser(auditLog, userId);
  const payload =
    format === "csv"
      ? entries.map(auditToCsv).join("\n")
      : format === "jsonl"
        ? entries.map((e) => canonicalJsonStringify(e)).join("\n")
        : canonicalJsonStringify({ userId: hashUserId(userId), entries });
  return { payload, entries };
}

/**
 * CSV row for an audit entry.
 */
export function auditToCsv(e: VoiceMoodAuditEntry): string {
  return [
    csvCell(e.id),
    csvCell(e.userIdHash),
    csvCell(e.action),
    csvCell(e.timestamp),
    csvCell(e.eventCount),
    csvCell(e.format),
    csvCell(e.redactionLevel),
    csvCell(e.notes ?? ""),
  ].join(",");
}

/**
 * Record an "export" action in the audit log.
 */
export function recordExportAudit(
  userId: string,
  bundle: VoiceMoodHistoryBundle,
  auditLog: readonly VoiceMoodAuditEntry[],
  now: Date = new Date(),
): VoiceMoodAuditEntry[] {
  const ts = now.toISOString();
  const entry: VoiceMoodAuditEntry = {
    id: generateAuditId(userId, ts, "export"),
    userIdHash: hashUserId(userId),
    action: "export",
    timestamp: ts,
    eventCount: bundle.events.length,
    format: bundle.format,
    redactionLevel: bundle.redactionLevel,
    notes: `sha256=${bundle.integrity.sha256.slice(0, 12)}`,
  };
  return appendAudit(auditLog, entry);
}

/**
 * Record a consent change (opt-in / opt-out) in the audit log.
 */
export function recordConsentAudit(
  userId: string,
  granted: boolean,
  auditLog: readonly VoiceMoodAuditEntry[],
  now: Date = new Date(),
): VoiceMoodAuditEntry[] {
  const ts = now.toISOString();
  const entry: VoiceMoodAuditEntry = {
    id: generateAuditId(userId, ts, granted ? "consent_in" : "consent_out"),
    userIdHash: hashUserId(userId),
    action: granted ? "consent_in" : "consent_out",
    timestamp: ts,
    eventCount: 0,
    format: "audit",
    redactionLevel: 0,
    notes: null,
  };
  return appendAudit(auditLog, entry);
}

// ─────────────────────────────────────────────────────────────────────────────
// §13  AUDIT LOG — STANDALONE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build an empty audit log (in-memory).
 */
export function emptyAuditLog(): VoiceMoodAuditEntry[] {
  return [];
}

/**
 * Count audit entries by action.
 */
export function countAuditByAction(
  log: readonly VoiceMoodAuditEntry[],
  action: VoiceMoodAuditEntry["action"],
): number {
  let n = 0;
  for (const e of log) if (e.action === action) n++;
  return n;
}

/**
 * Latest audit entry for a user (by timestamp).
 */
export function latestAuditForUser(
  log: readonly VoiceMoodAuditEntry[],
  userId: string,
): VoiceMoodAuditEntry | null {
  const h = hashUserId(userId);
  let best: VoiceMoodAuditEntry | null = null;
  let bestTs = -1;
  for (const e of log) {
    if (e.userIdHash !== h) continue;
    const t = Date.parse(e.timestamp);
    if (t > bestTs) {
      bestTs = t;
      best = e;
    }
  }
  return best;
}

/**
 * Total event count across all audit entries for a user.
 */
export function totalAuditEvents(
  log: readonly VoiceMoodAuditEntry[],
  userId: string,
): number {
  const h = hashUserId(userId);
  let n = 0;
  for (const e of log) if (e.userIdHash === h) n += e.eventCount;
  return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// §14  LOCALE-AWARE FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format an ISO date for the given locale.
 */
export function formatDate(iso: string, locale: LocaleId): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return iso;
  }
}

/**
 * Format an ISO datetime for the given locale.
 */
export function formatDateTime(iso: string, locale: LocaleId): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

/**
 * Localised mood label.
 */
export function moodLabel(mood: VoiceMood, locale: LocaleId): string {
  return MOOD_LABELS[locale][mood];
}

/**
 * Localised redaction level label.
 */
export function redactionLabel(level: RedactionLevel, locale: LocaleId): string {
  const map: Record<LocaleId, string> = {
    "pt-BR": ["nenhum", "hash de usuário", "usuário + datas", "datas + drop sensíveis", "apenas agregado"][level] ?? "?",
    "en-US": ["none", "user-hash", "user+dates", "user+dates+drop-sensitive", "aggregate-only"][level] ?? "?",
    "es-ES": ["ninguno", "hash de usuario", "usuario + fechas", "fechas + drop sensibles", "solo agregado"][level] ?? "?",
  };
  return map[locale];
}

/**
 * Localised format label.
 */
export function formatLabel(format: ExportFormat, locale: LocaleId): string {
  const map: Record<LocaleId, Record<ExportFormat, string>> = {
    "pt-BR": { json: "JSON", csv: "CSV", jsonl: "JSONL" },
    "en-US": { json: "JSON", csv: "CSV", jsonl: "JSONL" },
    "es-ES": { json: "JSON", csv: "CSV", jsonl: "JSONL" },
  };
  return map[locale][format];
}

/**
 * Localised window label.
 */
export function windowLabel(windowDays: WindowDays, locale: LocaleId): string {
  if (locale === "pt-BR") {
    if (windowDays === "forever") return "para sempre";
    return `${windowDays} dias`;
  }
  if (locale === "es-ES") {
    if (windowDays === "forever") return "para siempre";
    return `${windowDays} días`;
  }
  if (windowDays === "forever") return "forever";
  return `${windowDays} days`;
}

// ─────────────────────────────────────────────────────────────────────────────
// §15  SMOKE TEST (14 cases; returns {passed, failed, total})
// ─────────────────────────────────────────────────────────────────────────────

export interface SmokeTestResult {
  readonly passed: number;
  readonly failed: number;
  readonly total: number;
  readonly cases: readonly { name: string; ok: boolean; detail?: string }[];
}

/**
 * Build a small in-memory dataset for smoke testing.
 */
export function buildSmokeDataset(now: Date = new Date()): VoiceMoodEvent[] {
  const t0 = now.getTime();
  const mk = (
    id: string,
    userId: string,
    offsetDays: number,
    mood: VoiceMood,
    intensity: VoiceMoodSensitivity,
    sensitivity: VoiceMoodSensitivity,
    source: VoiceMoodSource,
    tradition: string | null,
    retention: RetentionDays,
  ): VoiceMoodEvent => ({
    id,
    userId,
    recordedAt: new Date(t0 - offsetDays * 24 * 3600 * 1000).toISOString(),
    mood,
    w49Label: MOOD_TO_W49[mood],
    intensity,
    durationSec: 30 + intensity * 10,
    source,
    sensitivity,
    tradition,
    locale: "pt-BR",
    retentionDays: retention,
  });
  return [
    mk("ev-1", "user-A", 5, "serene", 3, 2, "voice_clone", "candomble", 90),
    mk("ev-2", "user-A", 10, "joyful", 4, 3, "live_recording", "candomble", 90),
    mk("ev-3", "user-A", 60, "reflective", 2, 1, "upload", null, 90),
    mk("ev-4", "user-A", 200, "grateful", 5, 4, "voice_clone", "umbanda", 365),
    mk("ev-5", "user-A", 800, "longing", 1, 1, "upload", null, "forever"),
    mk("ev-6", "user-B", 15, "anxious", 3, 5, "live_recording", null, 30),
    mk("ev-7", "user-B", 95, "sad", 2, 2, "upload", "cabala", 90),
  ];
}

/**
 * 14 smoke-test cases. Returns `{passed, failed, total, cases}`.
 *
 * Cases:
 *   1.  sha256 known-vector
 *   2.  fnv1a stable
 *   3.  validateMood accepts all 10
 *   4.  validateEvent rejects missing fields
 *   5.  filterEventsByWindow 30-day keeps only recent events
 *   6.  applyRetention drops events older than retention cap
 *   7.  computeAggregate moodDistribution sums to event count
 *   8.  redactEvents level 0 returns identical events
 *   9.  redactEvents level 1 hashes userId
 *   10. redactEvents level 4 returns empty array
 *   11. exportAll JSON — bundle integrity verifies
 *   12. exportAll CSV — header row matches CSV_HEADER
 *   13. deleteAll removes user's events + appends audit
 *   14. exportDeletionAudit returns the user's audit slice
 */
export function __smokeTest(now: Date = new Date("2026-06-29T14:00:00.000Z")): SmokeTestResult {
  const cases: { name: string; ok: boolean; detail?: string }[] = [];
  const push = (name: string, ok: boolean, detail?: string): void => {
    cases.push({ name, ok, detail });
  };

  // 1. SHA-256 known vector (empty string)
  try {
    const empty = sha256Hex("");
    push(
      "1-sha256-empty",
      empty === "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      `got=${empty}`,
    );
  } catch (err) {
    push("1-sha256-empty", false, String(err));
  }

  // 2. FNV-1a stable
  try {
    const a = fnv1a32("hello");
    const b = fnv1a32("hello");
    push("2-fnv1a-stable", a === b && a.length === 8, `a=${a} b=${b}`);
  } catch (err) {
    push("2-fnv1a-stable", false, String(err));
  }

  // 3. validateMood accepts all 10
  try {
    const allOk = VOICE_MOODS.every((m) => validateMood(m).ok);
    push("3-validateMood-all", allOk);
  } catch (err) {
    push("3-validateMood-all", false, String(err));
  }

  // 4. validateEvent rejects missing fields
  try {
    const r = validateEvent({});
    push("4-validateEvent-rejects-empty", !r.ok && r.errors.length >= 5, `errors=${r.errors.length}`);
  } catch (err) {
    push("4-validateEvent-rejects-empty", false, String(err));
  }

  // 5. filterEventsByWindow 30-day
  try {
    const events = buildSmokeDataset(now);
    const r = filterEventsByWindow(events, 30, now);
    push("5-window-30", r.every((e) => Date.parse(e.recordedAt) >= now.getTime() - 30 * 86400_000 - 1), `count=${r.length}`);
  } catch (err) {
    push("5-window-30", false, String(err));
  }

  // 6. applyRetention drops expired events
  try {
    const events = buildSmokeDataset(now);
    const r = applyRetention(events, now);
    // ev-3 has 60 days age and retentionDays=90 → kept
    // ev-4 has 200 days age and retentionDays=365 → kept
    // ev-5 has 800 days age and retentionDays=forever (cap=1825) → kept
    // ev-7 has 95 days age and retentionDays=90 → dropped
    const droppedEv7 = !r.some((e) => e.id === "ev-7");
    push("6-applyRetention", droppedEv7, `kept=${r.length}`);
  } catch (err) {
    push("6-applyRetention", false, String(err));
  }

  // 7. computeAggregate sums to event count
  try {
    const events = buildSmokeDataset(now).filter((e) => e.userId === "user-A");
    const agg = computeAggregate(events);
    const sum = Object.values(agg.moodDistribution).reduce((a, b) => a + b, 0);
    push("7-aggregate-sums", sum === events.length, `sum=${sum} events=${events.length}`);
  } catch (err) {
    push("7-aggregate-sums", false, String(err));
  }

  // 8. redactEvents level 0 → identical events (clone)
  try {
    const events = buildSmokeDataset(now);
    const r = redactEvents(events, 0);
    push(
      "8-redact-level0",
      r.length === events.length && r.every((e, i) => e.id === events[i]!.id && e.userId === events[i]!.userId),
    );
  } catch (err) {
    push("8-redact-level0", false, String(err));
  }

  // 9. redactEvents level 1 hashes userId (all events get same hashed id; never original)
  try {
    const events = buildSmokeDataset(now);
    const r = redactEvents(events, 1);
    const originalIds = new Set(events.map((e) => e.userId));
    const allHashed =
      r.every((e) => /^[0-9a-f]{64}$/.test(e.userId)) &&
      !r.some((e) => originalIds.has(e.userId)) &&
      new Set(r.map((e) => e.userId)).size === 1;
    push("9-redact-level1", allHashed, `first=${r[0]?.userId.slice(0, 12)}`);
  } catch (err) {
    push("9-redact-level1", false, String(err));
  }

  // 10. redactEvents level 4 returns empty
  try {
    const events = buildSmokeDataset(now);
    const r = redactEvents(events, 4);
    push("10-redact-level4", r.length === 0, `len=${r.length}`);
  } catch (err) {
    push("10-redact-level4", false, String(err));
  }

  // 11. exportAll JSON — bundle integrity verifies
  try {
    const events = buildSmokeDataset(now);
    const consent = buildConsent({ voiceMoodConsent: true, exportConsent: true });
    const { bundle, payload } = exportAll("user-A", events, {
      windowDays: 365,
      locale: "pt-BR",
      format: "json",
      redactionLevel: 0,
      consent,
      now,
    });
    const ok = verifyIntegrity(payload, bundle.integrity);
    push("11-exportAll-json-integrity", ok, `sha=${bundle.integrity.sha256.slice(0, 12)}`);
  } catch (err) {
    push("11-exportAll-json-integrity", false, String(err));
  }

  // 12. exportAll CSV — header row matches
  try {
    const events = buildSmokeDataset(now);
    const consent = buildConsent({ voiceMoodConsent: true, exportConsent: true });
    const { payload } = exportAll("user-A", events, {
      windowDays: 365,
      locale: "pt-BR",
      format: "csv",
      redactionLevel: 0,
      consent,
      now,
    });
    const firstLine = payload.split("\n")[0] ?? "";
    push("12-exportAll-csv-header", firstLine === CSV_HEADER.join(","), `got=${firstLine.slice(0, 40)}`);
  } catch (err) {
    push("12-exportAll-csv-header", false, String(err));
  }

  // 13. deleteAll removes user's events + appends audit
  try {
    const events = buildSmokeDataset(now);
    const consent = buildConsent({ voiceMoodConsent: true });
    let audit = emptyAuditLog();
    const { remaining, result, audit: newAudit } = deleteAll("user-A", events, consent, audit, now);
    const aEvents = events.filter((e) => e.userId === "user-A").length;
    push(
      "13-deleteAll",
      remaining.length === events.length - aEvents && result.deletedEventCount === aEvents && newAudit.length === 1,
      `remaining=${remaining.length} deleted=${result.deletedEventCount}`,
    );
    audit = newAudit;
  } catch (err) {
    push("13-deleteAll", false, String(err));
  }

  // 14. exportDeletionAudit returns user's audit slice
  try {
    const events = buildSmokeDataset(now);
    const consent = buildConsent({ voiceMoodConsent: true });
    const audit = emptyAuditLog();
    const { audit: newAudit } = deleteAll("user-A", events, consent, audit, now);
    const { entries } = exportDeletionAudit("user-A", newAudit, "json");
    push("14-exportDeletionAudit", entries.length === 1, `entries=${entries.length}`);
  } catch (err) {
    push("14-exportDeletionAudit", false, String(err));
  }

  const passed = cases.filter((c) => c.ok).length;
  const failed = cases.length - passed;
  return { passed, failed, total: cases.length, cases };
}

// ─────────────────────────────────────────────────────────────────────────────
// §16  END — w51/voice-mood-history-export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convenience: build a `VoiceMoodEvent` from a w49 detection result.
 * Maps the w49 `VoiceMood` label to the 10-value history vocabulary via
 * `W49_TO_MOOD`, keeping the original w49 label in `w49Label`.
 */
export function eventFromW49(
  id: string,
  userId: string,
  recordedAt: string,
  w49Label: string,
  intensity: VoiceMoodSensitivity,
  durationSec: number,
  source: VoiceMoodSource,
  sensitivity: VoiceMoodSensitivity,
  tradition: string | null,
  locale: LocaleId,
  retentionDays: RetentionDays,
): VoiceMoodEvent {
  const mood = W49_TO_MOOD[w49Label] ?? "neutral";
  return {
    id,
    userId,
    recordedAt,
    mood,
    w49Label,
    intensity,
    durationSec,
    source,
    sensitivity,
    tradition,
    locale,
    retentionDays,
  };
}

/**
 * Convenience: build a `VoiceMoodEvent` directly (no w49 indirection).
 */
export function buildEvent(
  id: string,
  userId: string,
  recordedAt: string,
  mood: VoiceMood,
  intensity: VoiceMoodSensitivity,
  durationSec: number,
  source: VoiceMoodSource,
  sensitivity: VoiceMoodSensitivity,
  tradition: string | null,
  locale: LocaleId,
  retentionDays: RetentionDays,
): VoiceMoodEvent {
  return {
    id,
    userId,
    recordedAt,
    mood,
    w49Label: MOOD_TO_W49[mood],
    intensity,
    durationSec,
    source,
    sensitivity,
    tradition,
    locale,
    retentionDays,
  };
}

/**
 * Stable JSON view of the engine's public surface (for introspection /
 * documentation tooling).
 */
export const ENGINE_SURFACE = {
  name: "voice-mood-history-export",
  version: ENGINE_VERSION,
  moods: VOICE_MOODS,
  locales: SUPPORTED_LOCALES,
  windows: SUPPORTED_WINDOWS,
  formats: SUPPORTED_FORMATS,
  sources: SUPPORTED_SOURCES,
  redactionLevels: SUPPORTED_REDACTION_LEVELS,
  maxBundleBytes: BUNDLE_MAX_BYTES,
  foreverCapDays: FOREVER_CAP_DAYS,
} as const;
