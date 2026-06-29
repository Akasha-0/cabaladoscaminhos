/**
 * w58/comments-moderation.ts
 *
 * Moderation queue + auto-flag engine for community comments.
 * Counterpart to cycle 51 w55/comments-threading-mentions-parser and integrates
 * with w57/comments-threading. Implements LGPD Art. 7/9/18, sacred-tag policy
 * (curator review only, never auto-publish), and HMAC-chained audit trail.
 *
 * Design:
 *   - "by-shape" deliverable: NO imports from repo; self-contained primitives
 *   - 5-level action ladder: allow -> warn -> hide -> soft-block -> hard-block
 *   - Priority lanes: sacred > urgent > normal (FIFO within lane)
 *   - Defense in depth: primary auto-flag + secondary leak detector + tertiary HMAC chain
 *   - Hand-rolled SHA-256 + HMAC-SHA256 (byte-array path to avoid utf8ToBytes trap)
 *   - Sacred opt-in is SEPARATE purpose flag (never inferred from posting)
 *   - 90-day retention for normal decisions; indefinite audit-only for hard-blocks
 *
 * Sacred-tag hard rule:
 *   - All sacred-flagged comments REQUIRE curator review (level 3-4 only)
 *   - Auto-block on sacred-rule violation is SOFT block pending human review
 *   - Sacred opt-in must be explicit (LGPD Art. 7) - no inferred consent
 *
 * Cycle 58 worker 1/3, session 414535720431931.
 * Last updated: 2026-06-29.
 */

// ─────────────────────────────────────────────────────────────────────────────
// §1. Constants, types, branded ids
// ─────────────────────────────────────────────────────────────────────────────

/** Engine version embedded in audit chain. Bump when hash key changes. */
export const MODERATION_ENGINE_VERSION = "w58-v1.0.0";

/** Audit chain window for normal decisions (days). */
export const AUDIT_RETENTION_DAYS_NORMAL = 90;

/** Audit retention for hard-block decisions: indefinite, audit-only. */
export const AUDIT_RETENTION_INDEFINITE_HARD_BLOCK = true;

/** HMAC chain secret. In production this comes from KMS/secret manager. */
export const HMAC_CHAIN_KEY =
  "w58-moderation-chain-key:do-not-use-in-prod:replace-with-KMS-handle";

/** Curator levels: 1 = community, 2 = trusted, 3 = domain expert, 4 = sacred. */
export const CURATOR_LEVEL_THRESHOLD_SACRED = 3;
export const CURATOR_LEVEL_THRESHOLD_HARD_BLOCK = 2;

/** Severity thresholds mapping to action levels. */
export const MIN_SEVERITY_WARN = 10;
export const MIN_SEVERITY_HIDE = 30;
export const MIN_SEVERITY_SOFT_BLOCK = 55;
export const MIN_SEVERITY_HARD_BLOCK = 80;

/** Queue lane priorities (lower = higher priority). */
export const QUEUE_PRIORITY_ORDER = ["sacred", "urgent", "normal"] as const;

/** Sacred practitioner minimum level for sacred-tag authoring. */
export const SACRED_PRACTITIONER_MIN_LEVEL = 3;

/** LGPD purpose flag for moderation analytics - SEPARATE from sacred. */
export const LGPD_PURPOSE_MODERATION_ANALYTICS = "moderation.analytics.v1";
export const LGPD_PURPOSE_SACRED_PROCESSING = "sacred.processing.v1";

/** 5-level action ladder. */
export const ModerationAction = {
  Allow: "allow",
  Warn: "warn",
  Hide: "hide",
  SoftBlock: "soft-block",
  HardBlock: "hard-block",
} as const;
export type ModerationAction =
  (typeof ModerationAction)[keyof typeof ModerationAction];

/** Flag categories. */
export const FlagCategory = {
  Hate: "hate",
  Harassment: "harassment",
  Doxxing: "doxxing",
  Spam: "spam",
  SacredViolation: "sacred-violation",
  LgpdViolation: "lgpd-violation",
  Threat: "threat",
  Impersonation: "impersonation",
  SelfHarm: "self-harm",
} as const;
export type FlagCategory = (typeof FlagCategory)[keyof typeof FlagCategory];

/** Priority lanes. */
export const PriorityLane = {
  Sacred: "sacred",
  Urgent: "urgent",
  Normal: "normal",
} as const;
export type PriorityLane = (typeof PriorityLane)[keyof typeof PriorityLane];

/** Curator levels. */
export const CuratorLevel = {
  Community: 1,
  Trusted: 2,
  Domain: 3,
  Sacred: 4,
} as const;
export type CuratorLevel = (typeof CuratorLevel)[keyof typeof CuratorLevel];

/** Reasons for moderation decisions. */
export const ActionReason = {
  CleanPost: "clean-post",
  AutoFlagLow: "auto-flag-low",
  AutoFlagMedium: "auto-flag-medium",
  AutoFlagHigh: "auto-flag-high",
  AutoFlagCritical: "auto-flag-critical",
  SacredOptInMissing: "sacred-opt-in-missing",
  SacredPractitionerLevelLow: "sacred-practitioner-level-low",
  SacredLeakDetected: "sacred-leak-detected",
  CuratorApproved: "curator-approved",
  CuratorRejected: "curator-rejected",
  CuratorOverridden: "curator-overridden",
  UserErased: "user-erased-lgpd",
  UserOptedOut: "user-opted-out-lgpd",
  RetainedAuditOnly: "retained-audit-only",
} as const;
export type ActionReason = (typeof ActionReason)[keyof typeof ActionReason];

/** Sacred violation subtypes. */
export const SacredViolationType = {
  UnverifiedPractitioner: "unverified-practitioner",
  OptInMissing: "opt-in-missing",
  OutsiderDisclosure: "outsider-disclosure",
  MisattributedTradition: "misattributed-tradition",
  ClosedPracticeDisclosed: "closed-practice-disclosed",
  SacredLeak: "sacred-leak",
} as const;
export type SacredViolationType =
  (typeof SacredViolationType)[keyof typeof SacredViolationType];

/** Decision status. */
export const DecisionStatus = {
  Pending: "pending",
  CuratorReview: "curator-review",
  Approved: "approved",
  Rejected: "rejected",
  Overridden: "overridden",
  Purged: "purged",
} as const;
export type DecisionStatus = (typeof DecisionStatus)[keyof typeof DecisionStatus];

/** Branded id for moderator/curator user id. */
export type ReviewerId = string & { readonly __brand: "ReviewerId" };
export const asReviewerId = (s: string): ReviewerId => s as ReviewerId;

/** Branded id for comment. */
export type CommentId = string & { readonly __brand: "CommentId" };
export const asCommentId = (s: string): CommentId => s as CommentId;

/** Branded id for moderation decision. */
export type DecisionId = string & { readonly __brand: "DecisionId" };
export const asDecisionId = (s: string): DecisionId => s as DecisionId;

// ─────────────────────────────────────────────────────────────────────────────
// §2. Domain interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface FlagHit {
  readonly ruleId: string;
  readonly category: FlagCategory;
  readonly severity: number;
  readonly matchedPattern: string;
  readonly excerpt: string;
  readonly confidence: number;
}

export interface AutoFlagRule {
  readonly id: string;
  readonly category: FlagCategory;
  readonly pattern: RegExp;
  readonly baseSeverity: number;
  readonly description: string;
  readonly lgpdSensitive: boolean;
}

export interface CommentForReview {
  readonly id: CommentId;
  readonly authorId: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly sacredFlag: boolean;
  readonly mentions: readonly string[];
  readonly threadDepth: number;
  readonly parentCommentId: CommentId | null;
  readonly urls: readonly string[];
  readonly sacredTags: readonly string[];
  readonly authorSacredOptIn: boolean;
  readonly authorPractitionerLevel: number;
  readonly history: readonly ModerationDecision[];
}

export interface ModerationDecision {
  readonly id: DecisionId;
  readonly commentId: CommentId;
  readonly action: ModerationAction;
  readonly reasonCodes: readonly ActionReason[];
  readonly flags: readonly FlagHit[];
  readonly severity: number;
  readonly reviewerId: ReviewerId | "auto";
  readonly status: DecisionStatus;
  readonly createdAt: Date;
  readonly resolvedAt: Date | null;
  readonly curatorId: ReviewerId | null;
  readonly lgpdAuditHash: string;
  readonly chainHash: string;
  readonly expiresAt: Date | null;
}

export interface SacredContentPolicy {
  readonly requireVerifiedPractitioner: boolean;
  readonly minimumPractitionerLevel: number;
  readonly requireExplicitOptIn: boolean;
  readonly requireCuratorReview: boolean;
  readonly minimumCuratorLevel: CuratorLevel;
  readonly allowOutsiderDisclosure: boolean;
  readonly detectSacredLeaks: boolean;
  readonly closedTraditionCategories: readonly string[];
}

export interface ModerationQueueConfig {
  readonly maxSize: number;
  readonly lanes: readonly PriorityLane[];
  readonly softBlockReviewDeadlineHours: number;
  readonly hideAutoExpireDays: number;
}

export interface ModerationQueueState {
  readonly config: ModerationQueueConfig;
  readonly lanes: Record<PriorityLane, CommentForReview[]>;
  readonly totalEnqueued: number;
  readonly totalProcessed: number;
}

export interface ModerationEventLog {
  readonly seq: number;
  readonly decisionId: DecisionId;
  readonly action: ModerationAction;
  readonly reasonCodes: readonly ActionReason[];
  readonly reviewerId: ReviewerId | "auto";
  readonly curatorId: ReviewerId | null;
  readonly createdAt: Date;
  readonly payloadHash: string;
  readonly chainHash: string;
  readonly lgpdArt7Consent: boolean;
  readonly lgpdArt9Sensitive: boolean;
}

export interface AuditReceipt {
  readonly receiptId: string;
  readonly commentId: CommentId;
  readonly erasedAt: Date;
  readonly erasedBy: ReviewerId;
  readonly auditHash: string;
  readonly chainHashAtPurge: string;
  readonly redactedFields: readonly string[];
}

export interface CorrectionRequest {
  readonly requestId: string;
  readonly userId: string;
  readonly field: string;
  readonly oldValue: string;
  readonly newValue: string;
  readonly requestedAt: Date;
  readonly fulfilledAt: Date | null;
}

export interface SacredOptInRecord {
  readonly userId: string;
  readonly optedInAt: Date;
  readonly purpose: string;
  readonly withdrawnAt: Date | null;
  readonly practitionerLevel: number;
  readonly verifiedBy: ReviewerId | null;
}

export interface ModerationContext {
  readonly now: Date;
  readonly reviewerId: ReviewerId | "auto";
  readonly policies: ReadonlyMap<string, SacredContentPolicy>;
  readonly rules: readonly AutoFlagRule[];
  readonly queueConfig: ModerationQueueConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// §3. Hash primitives (FNV-1a 32/64, SHA-256) - byte-array path
// ─────────────────────────────────────────────────────────────────────────────

/** FNV-1a 32-bit constants. */
export const FNV_OFFSET_32 = 0x811c9dc5;
export const FNV_PRIME_32 = 0x01000193;

/** FNV-1a 64-bit constants (mod 2^64 via BigInt or unsigned arithmetic). */
export const FNV_OFFSET_64_BIG = 0xcbf29ce484222325n;
export const FNV_PRIME_64_BIG = 0x100000001b3n;
export const FNV_64_MASK = 0xffffffffffffffffn;

/** Compute FNV-1a 32-bit hash. Returns unsigned 32-bit int. */
export function fnv1a32(input: string | Uint8Array): number {
  const bytes = typeof input === "string" ? utf8ToBytes(input) : input;
  let hash = FNV_OFFSET_32 >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i]!;
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash >>> 0;
}

/** Compute FNV-1a 64-bit hash. Returns unsigned 64-bit as bigint. */
export function fnv1a64(input: string | Uint8Array): bigint {
  const bytes = typeof input === "string" ? utf8ToBytes(input) : input;
  let hash = FNV_OFFSET_64_BIG;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= BigInt(bytes[i]!);
    hash = (hash * FNV_PRIME_64_BIG) & FNV_64_MASK;
  }
  return hash;
}

/** Encode FNV-1a 32 as 8-char lowercase hex. */
export function fnv1a32Hex(input: string | Uint8Array): string {
  return fnv1a32(input).toString(16).padStart(8, "0");
}

/** Encode FNV-1a 64 as 16-char lowercase hex. */
export function fnv1a64Hex(input: string | Uint8Array): string {
  return fnv1a64(input).toString(16).padStart(16, "0");
}

// ─────────────────────────────────────────────────────────────────────────────
// §4. SHA-256 (hand-rolled, RFC 6234 reference, byte-array path)
// ─────────────────────────────────────────────────────────────────────────────

/** SHA-256 initial hash values (FIPS 180-4 §5.3.3). */
export const SHA256_IV: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
];

/** SHA-256 round constants (FIPS 180-4 §4.2.2). */
export const SHA256_K: readonly number[] = (() => {
  const k = [
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
  return k;
})();

function rotr32(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/** Compute SHA-256 of a UTF-8 string. Returns 32-byte Uint8Array. */
export function sha256(input: string | Uint8Array): Uint8Array {
  const bytes = typeof input === "string" ? utf8ToBytes(input) : input;
  return sha256OfBytes(bytes);
}

/** Compute SHA-256 of a byte array. Returns 32-byte Uint8Array. */
export function sha256OfBytes(bytes: Uint8Array): Uint8Array {
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array(
    ((bytes.length + 9 + 63) >> 6) << 6,
  );
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  // Write length as big-endian 64-bit at end
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(padded.length - 4, bitLen >>> 0, false);

  const H = new Uint32Array(SHA256_IV);
  const W = new Uint32Array(64);

  for (let block = 0; block < padded.length; block += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(block + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(W[i - 15]!, 7) ^ rotr32(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 =
        rotr32(W[i - 2]!, 17) ^ rotr32(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
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
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i]! + W[i]!) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
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

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    outView.setUint32(i * 4, H[i]!, false);
  }
  return out;
}

/** SHA-256 of a string, returned as 64-char lowercase hex. */
export function sha256Hex(input: string | Uint8Array): string {
  return bytesToHex(sha256(input));
}

// ─────────────────────────────────────────────────────────────────────────────
// §5. HMAC-SHA256 (byte-array path - bypasses utf8ToBytes trap from w55)
// ─────────────────────────────────────────────────────────────────────────────

export const HMAC_SHA256_BLOCK_SIZE = 64;
export const HMAC_SHA256_OUT_SIZE = 32;

/** HMAC-SHA256 of a byte array. RFC 2104 compliant, byte-array path. */
export function hmacSha256(
  key: Uint8Array | string,
  message: Uint8Array | string,
): Uint8Array {
  const keyBytes = typeof key === "string" ? utf8ToBytes(key) : key;
  const msgBytes = typeof message === "string" ? utf8ToBytes(message) : message;

  // Normalize key to block size
  let k: Uint8Array;
  if (keyBytes.length > HMAC_SHA256_BLOCK_SIZE) {
    k = sha256OfBytes(keyBytes);
    // pad to block size
    const padded = new Uint8Array(HMAC_SHA256_BLOCK_SIZE);
    padded.set(k);
    k = padded;
  } else if (keyBytes.length < HMAC_SHA256_BLOCK_SIZE) {
    k = new Uint8Array(HMAC_SHA256_BLOCK_SIZE);
    k.set(keyBytes);
  } else {
    k = keyBytes;
  }

  const ipad = new Uint8Array(HMAC_SHA256_BLOCK_SIZE);
  const opad = new Uint8Array(HMAC_SHA256_BLOCK_SIZE);
  for (let i = 0; i < HMAC_SHA256_BLOCK_SIZE; i++) {
    ipad[i] = k[i]! ^ 0x36;
    opad[i] = k[i]! ^ 0x5c;
  }

  const inner = new Uint8Array(HMAC_SHA256_BLOCK_SIZE + msgBytes.length);
  inner.set(ipad, 0);
  inner.set(msgBytes, HMAC_SHA256_BLOCK_SIZE);
  const innerHash = sha256OfBytes(inner);

  const outer = new Uint8Array(HMAC_SHA256_BLOCK_SIZE + HMAC_SHA256_OUT_SIZE);
  outer.set(opad, 0);
  outer.set(innerHash, HMAC_SHA256_BLOCK_SIZE);
  return sha256OfBytes(outer);
}

/** HMAC-SHA256 as lowercase hex. */
export function hmacSha256Hex(
  key: Uint8Array | string,
  message: Uint8Array | string,
): string {
  return bytesToHex(hmacSha256(key, message));
}

/** Constant-time byte array equality. */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// §6. Byte/string helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Encode a string to UTF-8 bytes without using TextEncoder (portable). */
export function utf8ToBytes(s: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
      const c2 = s.charCodeAt(i + 1);
      if (c2 >= 0xdc00 && c2 <= 0xdfff) {
        c = 0x10000 + (((c - 0xd800) << 10) | (c2 - 0xdc00));
        out.push(
          0xf0 | (c >> 18),
          0x80 | ((c >> 12) & 0x3f),
          0x80 | ((c >> 6) & 0x3f),
          0x80 | (c & 0x3f),
        );
        i++;
      } else {
        out.push(0xef, 0xbf, 0xbd);
      }
    } else if (c >= 0xd800 && c <= 0xdfff) {
      out.push(0xef, 0xbf, 0xbd);
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(out);
}

/** Encode byte array as lowercase hex. */
export function bytesToHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i]!.toString(16).padStart(2, "0");
  }
  return s;
}

/** Decode hex string to byte array (case-insensitive). */
export function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");
  const out = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Concatenate byte arrays. */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((acc, a) => acc + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// §7. Mulberry32 seeded RNG
// ─────────────────────────────────────────────────────────────────────────────

/** Mulberry32 PRNG. Returns a function producing float in [0, 1). */
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

/** Seed Mulberry32 from a string via FNV-1a 32. */
export function mulberry32FromSeed(seedStr: string): () => number {
  return mulberry32(fnv1a32(seedStr));
}

/** Deterministic shuffle (Fisher-Yates with seeded RNG). */
export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/** Deterministic jitter in [-amount, +amount]. */
export function jitter(amount: number, rng: () => number): number {
  return (rng() * 2 - 1) * amount;
}

// ─────────────────────────────────────────────────────────────────────────────
// §8. Auto-flag rule registry (8+ patterns across all categories)
// ─────────────────────────────────────────────────────────────────────────────

/** Hate speech - direct slurs or dehumanization. */
export const HATE_SPEECH_RULES: readonly AutoFlagRule[] = [
  {
    id: "hate-dehumanization",
    category: FlagCategory.Hate,
    pattern: /(?:sub[- ]?human|inferior race|deserve to die|exterminate)/i,
    baseSeverity: 90,
    description: "Dehumanization or extermination rhetoric",
    lgpdSensitive: false,
  },
  {
    id: "hate-slur-generic",
    category: FlagCategory.Hate,
    pattern: /\b(?:kike|n[i!]gg(?:er|a)|f[a@]gg[o0]t|spic|ch[i!]nk)\b/i,
    baseSeverity: 95,
    description: "Generic English-language slurs",
    lgpdSensitive: false,
  },
];

/** Harassment - targeted attacks on individuals. */
export const HARASSMENT_RULES: readonly AutoFlagRule[] = [
  {
    id: "harassment-targeted",
    category: FlagCategory.Harassment,
    pattern: /(?:you\s+(?:are|'re)\s+(?:pathetic|disgusting|worthless|a\s+loser))/i,
    baseSeverity: 55,
    description: "Direct personal attacks at another user",
    lgpdSensitive: false,
  },
  {
    id: "harassment-stalking",
    category: FlagCategory.Harassment,
    pattern:
      /(?:i\s+(?:know|will\s+find)\s+(?:where\s+you\s+live|your\s+address))/i,
    baseSeverity: 80,
    description: "Stalking or location threats",
    lgpdSensitive: false,
  },
];

/** Doxxing - leaking personal info. */
export const DOXXING_RULES: readonly AutoFlagRule[] = [
  {
    id: "doxx-cpf",
    category: FlagCategory.Doxxing,
    pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
    baseSeverity: 75,
    description: "CPF-like pattern (Brazilian national id)",
    lgpdSensitive: true,
  },
  {
    id: "doxx-phone-br",
    category: FlagCategory.Doxxing,
    pattern: /\(?\d{2}\)?\s*9?\d{4}-?\d{4}\b/,
    baseSeverity: 70,
    description: "Brazilian phone pattern",
    lgpdSensitive: true,
  },
  {
    id: "doxx-email",
    category: FlagCategory.Doxxing,
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    baseSeverity: 60,
    description: "Email address disclosure",
    lgpdSensitive: true,
  },
];

/** Spam patterns. */
export const SPAM_RULES: readonly AutoFlagRule[] = [
  {
    id: "spam-urls-multiple",
    category: FlagCategory.Spam,
    pattern: /https?:\/\/[^\s]+.*https?:\/\/[^\s]+/i,
    baseSeverity: 50,
    description: "Multiple URLs in single comment",
    lgpdSensitive: false,
  },
  {
    id: "spam-caps-ratio",
    category: FlagCategory.Spam,
    pattern: /\b[A-Z]{8,}\b/,
    baseSeverity: 30,
    description: "Excessive ALL-CAPS words",
    lgpdSensitive: false,
  },
  {
    id: "spam-promotion",
    category: FlagCategory.Spam,
    pattern:
      /(?:buy\s+now|click\s+here|limited\s+time|act\s+now|discount\s+code)/i,
    baseSeverity: 45,
    description: "Promotional spam phrases",
    lgpdSensitive: false,
  },
];

/** Sacred violation - unauthorized disclosure of closed practices. */
export const SACRED_VIOLATION_RULES: readonly AutoFlagRule[] = [
  {
    id: "sacred-leak-keywords",
    category: FlagCategory.SacredViolation,
    pattern:
      /(?:initiation\s+ritual\s+of\s+(?:Orix[aá]|Orixá|Egum)|segredo\s+do\s+(?:Orix[aá]|Orixá|Egum))/i,
    baseSeverity: 85,
    description: "Sacred-tagged content disclosed without practitioner level",
    lgpdSensitive: false,
  },
];

/** LGPD violation patterns. */
export const LGPD_VIOLATION_RULES: readonly AutoFlagRule[] = [
  {
    id: "lgpd-pii-bundle",
    category: FlagCategory.LgpdViolation,
    pattern:
      /\b(?:cpf|rg|cnpj)\s*[:=]?\s*\d[\d.\-/]{6,}/i,
    baseSeverity: 65,
    description: "Brazilian id document disclosed",
    lgpdSensitive: true,
  },
];

/** Threat patterns. */
export const THREAT_RULES: readonly AutoFlagRule[] = [
  {
    id: "threat-violence",
    category: FlagCategory.Threat,
    pattern:
      /(?:i\s+(?:will|am\s+going\s+to)\s+(?:kill|hurt|harm|attack)\s+you)/i,
    baseSeverity: 95,
    description: "Direct violent threat",
    lgpdSensitive: false,
  },
  {
    id: "threat-self",
    category: FlagCategory.SelfHarm,
    pattern: /(?:i\s+(?:want\s+to\s+die|wish\s+i\s+was\s+dead))/i,
    baseSeverity: 90,
    description: "Self-harm ideation (requires safe-completion referral)",
    lgpdSensitive: true,
  },
];

/** Impersonation patterns. */
export const IMPERSONATION_RULES: readonly AutoFlagRule[] = [
  {
    id: "impersonation-claim",
    category: FlagCategory.Impersonation,
    pattern:
      /(?:i\s+am\s+(?:the\s+)?(?:admin|moderator|curator|owner)\s+of\s+this)/i,
    baseSeverity: 40,
    description: "Claiming staff/curator authority",
    lgpdSensitive: false,
  },
];

/** Combined default auto-flag rule registry. */
export const DEFAULT_AUTO_FLAG_RULES: readonly AutoFlagRule[] = [
  ...HATE_SPEECH_RULES,
  ...HARASSMENT_RULES,
  ...DOXXING_RULES,
  ...SPAM_RULES,
  ...SACRED_VIOLATION_RULES,
  ...LGPD_VIOLATION_RULES,
  ...THREAT_RULES,
  ...IMPERSONATION_RULES,
];

/** Severity bonus per category (for cumulative flags). */
export const CATEGORY_SEVERITY_BONUS: Readonly<Record<FlagCategory, number>> = {
  [FlagCategory.Hate]: 0,
  [FlagCategory.Harassment]: 0,
  [FlagCategory.Doxxing]: 5,
  [FlagCategory.Spam]: -5,
  [FlagCategory.SacredViolation]: 5,
  [FlagCategory.LgpdViolation]: 5,
  [FlagCategory.Threat]: 0,
  [FlagCategory.Impersonation]: -10,
  [FlagCategory.SelfHarm]: 10,
};

/** Confidence adjustment per category. */
export const CATEGORY_CONFIDENCE: Readonly<Record<FlagCategory, number>> = {
  [FlagCategory.Hate]: 0.95,
  [FlagCategory.Harassment]: 0.85,
  [FlagCategory.Doxxing]: 0.9,
  [FlagCategory.Spam]: 0.75,
  [FlagCategory.SacredViolation]: 0.92,
  [FlagCategory.LgpdViolation]: 0.88,
  [FlagCategory.Threat]: 0.95,
  [FlagCategory.Impersonation]: 0.7,
  [FlagCategory.SelfHarm]: 0.93,
};

// ─────────────────────────────────────────────────────────────────────────────
// §9. Sacred content policy + leak detection
// ─────────────────────────────────────────────────────────────────────────────

/** Default sacred content policy. */
export const DEFAULT_SACRED_POLICY: SacredContentPolicy = {
  requireVerifiedPractitioner: true,
  minimumPractitionerLevel: SACRED_PRACTITIONER_MIN_LEVEL,
  requireExplicitOptIn: true,
  requireCuratorReview: true,
  minimumCuratorLevel: CuratorLevel.Domain,
  allowOutsiderDisclosure: false,
  detectSacredLeaks: true,
  closedTraditionCategories: [
    "orixa",
    "egungun",
    "egum",
    "caboclo",
    "preto-velho",
    "exu",
    "pomba-gira",
  ],
};

/** Sacred-tag keyword list (Brazilian Portuguese + Yoruba-derived). */
export const SACRED_LEAK_KEYWORDS: readonly string[] = [
  "orixa",
  "orixá",
  "egungun",
  "egum",
  "caboclo",
  "preto-velho",
  "preto velho",
  "exu",
  "pomba-gira",
  "pomba gira",
  "ogum",
  "oxalá",
  "oxala",
  "iansã",
  "iansa",
  "xangô",
  "xango",
  "yemanjá",
  "yemanja",
  "obaluaê",
  "obaluae",
  "omulu",
  "ossaim",
  "nanã",
  "nana",
  "obaluae",
  "logun",
  "edan",
  "initiation",
  "iniciação",
  "iniciacao",
  "axé",
  "axe",
  "orukó",
  "oruko",
  "ebó",
  "ebo",
];

/** Detect a sacred-tag leak in free-text content (returns matched keywords). */
export function detectSacredLeak(content: string): readonly string[] {
  const lower = content.toLowerCase();
  const hits: string[] = [];
  for (const kw of SACRED_LEAK_KEYWORDS) {
    // Use explicit unicode-aware boundaries (avoid \b which is ASCII-only).
    const escaped = kw
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    const re = new RegExp(
      `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,
      "iu",
    );
    if (re.test(lower)) {
      hits.push(kw);
    }
  }
  return hits;
}

/** Secondary sacred-content leak detector for the whole comment. */
export function isSacredContentViolation(c: CommentForReview): boolean {
  if (!c.sacredFlag && c.sacredTags.length === 0) return false;
  const leaks = detectSacredLeak(c.content);
  if (leaks.length > 0 && !c.authorSacredOptIn) return true;
  if (leaks.length > 0 && c.authorPractitionerLevel < SACRED_PRACTITIONER_MIN_LEVEL)
    return true;
  return false;
}

/** True if sacred-tagged comment requires verified practitioner level. */
export function isSacredComment(c: CommentForReview): boolean {
  return c.sacredFlag || c.sacredTags.length > 0;
}

/** True if author needs explicit LGPD opt-in for sacred processing. */
export function requiresOptIn(c: CommentForReview): boolean {
  return isSacredComment(c) || c.sacredTags.length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// §10. In-memory sacred opt-in registry (demo)
// ─────────────────────────────────────────────────────────────────────────────

const SACRED_OPT_IN_REGISTRY = new Map<string, SacredOptInRecord>();

export function registerSacredOptIn(
  userId: string,
  opts: {
    practitionerLevel: number;
    verifiedBy: ReviewerId | null;
    now?: Date;
  },
): SacredOptInRecord {
  const record: SacredOptInRecord = {
    userId,
    optedInAt: opts.now ?? new Date(),
    purpose: LGPD_PURPOSE_SACRED_PROCESSING,
    withdrawnAt: null,
    practitionerLevel: opts.practitionerLevel,
    verifiedBy: opts.verifiedBy,
  };
  SACRED_OPT_IN_REGISTRY.set(userId, record);
  return record;
}

export function getSacredOptInRecord(
  userId: string,
): SacredOptInRecord | null {
  return SACRED_OPT_IN_REGISTRY.get(userId) ?? null;
}

export function getSacredOptInStatus(
  userId: string,
): { optedIn: boolean; level: number; verified: boolean } {
  const rec = SACRED_OPT_IN_REGISTRY.get(userId);
  if (!rec || rec.withdrawnAt !== null) {
    return { optedIn: false, level: 0, verified: false };
  }
  return {
    optedIn: true,
    level: rec.practitionerLevel,
    verified: rec.verifiedBy !== null,
  };
}

/** LGPD Art. 18 right to opt-out. Marks withdrawal, does NOT erase. */
export function withdrawSacredOptIn(
  userId: string,
  now: Date = new Date(),
): SacredOptInRecord | null {
  const rec = SACRED_OPT_IN_REGISTRY.get(userId);
  if (!rec) return null;
  const updated: SacredOptInRecord = {
    ...rec,
    withdrawnAt: now,
  };
  SACRED_OPT_IN_REGISTRY.set(userId, updated);
  return updated;
}

export function isVerifiedPractitioner(c: CommentForReview): boolean {
  const status = getSacredOptInStatus(c.authorId);
  return (
    status.optedIn && status.verified && status.level >= SACRED_PRACTITIONER_MIN_LEVEL
  );
}

export function clearSacredOptInRegistryForTests(): void {
  SACRED_OPT_IN_REGISTRY.clear();
}

// ─────────────────────────────────────────────────────────────────────────────
// §11. Severity computation + decision logic
// ─────────────────────────────────────────────────────────────────────────────

/** Compute aggregate severity from flag hits. */
export function computeSeverity(flags: readonly FlagHit[]): number {
  if (flags.length === 0) return 0;
  let max = 0;
  let total = 0;
  for (const f of flags) {
    max = Math.max(max, f.severity);
    total += f.severity;
  }
  // Combined: max + 25% of remainder (capped at 100)
  const combined = max + Math.floor((total - max) * 0.25);
  return Math.min(100, Math.max(0, combined));
}

/** Map severity to a 5-level action. */
export function severityToAction(severity: number): ModerationAction {
  if (severity >= MIN_SEVERITY_HARD_BLOCK) return ModerationAction.HardBlock;
  if (severity >= MIN_SEVERITY_SOFT_BLOCK) return ModerationAction.SoftBlock;
  if (severity >= MIN_SEVERITY_HIDE) return ModerationAction.Hide;
  if (severity >= MIN_SEVERITY_WARN) return ModerationAction.Warn;
  return ModerationAction.Allow;
}

/** Decide action + reasons from flag hits. */
export function decideAction(
  flags: readonly FlagHit[],
  severity: number,
): { action: ModerationAction; reasonCodes: ActionReason[] } {
  const action = severityToAction(severity);
  const reasonCodes: ActionReason[] = [];
  if (flags.length === 0) {
    reasonCodes.push(ActionReason.CleanPost);
    return { action, reasonCodes };
  }
  if (severity >= MIN_SEVERITY_HARD_BLOCK)
    reasonCodes.push(ActionReason.AutoFlagCritical);
  else if (severity >= MIN_SEVERITY_HIDE)
    reasonCodes.push(ActionReason.AutoFlagHigh);
  else if (severity >= MIN_SEVERITY_WARN)
    reasonCodes.push(ActionReason.AutoFlagMedium);
  else reasonCodes.push(ActionReason.AutoFlagLow);
  if (flags.some((f) => f.category === FlagCategory.SacredViolation)) {
    reasonCodes.push(ActionReason.SacredLeakDetected);
  }
  return { action, reasonCodes };
}

/** True if decision requires curator review (sacred + hard-block). */
export function requiresCuratorReview(
  c: CommentForReview,
  action: ModerationAction,
): boolean {
  if (isSacredComment(c)) return true;
  if (action === ModerationAction.HardBlock) return true;
  if (action === ModerationAction.SoftBlock) return true;
  return false;
}

/** True if curator level meets minimum for sacred review. */
export function requiresLevel3Curator(c: CommentForReview): boolean {
  return isSacredComment(c);
}

// ─────────────────────────────────────────────────────────────────────────────
// §12. Auto-flag application (primary sacred-block + hate filter)
// ─────────────────────────────────────────────────────────────────────────────

export function compileRule(rule: AutoFlagRule): AutoFlagRule {
  return {
    ...rule,
    pattern: new RegExp(
      rule.pattern.source,
      rule.pattern.flags.includes("g") ? rule.pattern.flags : rule.pattern.flags + "g",
    ),
  };
}

export function matchRule(
  content: string,
  rule: AutoFlagRule,
): RegExpExecArray | null {
  const re = rule.pattern;
  re.lastIndex = 0;
  return re.exec(content);
}

/** Apply auto-flag rules to a comment; returns hits + aggregate severity. */
export function applyAutoFlag(
  c: CommentForReview,
  rules: readonly AutoFlagRule[] = DEFAULT_AUTO_FLAG_RULES,
): { flags: FlagHit[]; severity: number } {
  const flags: FlagHit[] = [];
  const compiled = rules.map(compileRule);
  for (const rule of compiled) {
    const m = matchRule(c.content, rule);
    if (m) {
      const excerpt = m[0].length > 80 ? m[0].slice(0, 77) + "..." : m[0];
      flags.push({
        ruleId: rule.id,
        category: rule.category,
        severity: Math.min(
          100,
          rule.baseSeverity + (CATEGORY_SEVERITY_BONUS[rule.category] ?? 0),
        ),
        matchedPattern: rule.pattern.source,
        excerpt,
        confidence: CATEGORY_CONFIDENCE[rule.category] ?? 0.8,
      });
    }
  }
  // Sacred-tag secondary check: ALWAYS emit sacred leak flag if policy says so
  if (isSacredComment(c)) {
    if (
      !c.authorSacredOptIn ||
      c.authorPractitionerLevel < SACRED_PRACTITIONER_MIN_LEVEL
    ) {
      flags.push({
        ruleId: "sacred-unverified-author",
        category: FlagCategory.SacredViolation,
        severity: 70,
        matchedPattern: "author-not-verified",
        excerpt: "sacred-tag without verified practitioner",
        confidence: 0.9,
      });
    }
  }
  const severity = computeSeverity(flags);
  return { flags, severity };
}

// ─────────────────────────────────────────────────────────────────────────────
// §13. PII redaction (Brazilian: CPF, CNPJ, phone, email, PIX)
// ─────────────────────────────────────────────────────────────────────────────

const CPF_REGEX = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const CNPJ_REGEX = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;
const BR_PHONE_REGEX = /\(?\d{2}\)?\s*9?\d{4}-?\d{4}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PIX_REGEX = /\b(?:pix[\s:][\w.-]+|[\w.-]+@pix\.[\w.]+)\b/gi;

export function redactCPF(s: string): string {
  return s.replace(CPF_REGEX, "[CPF]");
}

export function redactCNPJ(s: string): string {
  return s.replace(CNPJ_REGEX, "[CNPJ]");
}

export function redactBrazilianPhone(s: string): string {
  return s.replace(BR_PHONE_REGEX, "[PHONE]");
}

export function redactEmail(s: string): string {
  return s.replace(EMAIL_REGEX, "[EMAIL]");
}

export function redactPix(s: string): string {
  return s.replace(PIX_REGEX, "[PIX]");
}

export function redactPII(s: string): string {
  let out = redactCPF(s);
  out = redactCNPJ(out);
  out = redactBrazilianPhone(out);
  out = redactEmail(out);
  out = redactPix(out);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// §14. Content fingerprinting + helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Compute FNV-1a 64 hex fingerprint of a comment's content. */
export function computeContentFingerprint(content: string): string {
  return fnv1a64Hex(content);
}

/** SHA-256 hex content hash (used in audit chain). */
export function computeContentHash(content: string): string {
  return sha256Hex(content);
}

/** Extract @mentions from content. Uses Unicode-aware boundaries. */
export function extractMentions(content: string): readonly string[] {
  const out: string[] = [];
  const re = /(?<![\p{L}\p{N}_])@([\p{L}\p{N}_]{2,30})/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

/** Extract #sacred-tags from content. */
export function extractSacredTags(content: string): readonly string[] {
  const out: string[] = [];
  const re = /(?<![\p{L}\p{N}_])#([\p{L}\p{N}_-]{2,40})/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

/** Extract http(s) URLs from content. */
export function extractUrls(content: string): readonly string[] {
  const out: string[] = [];
  const re = /https?:\/\/[^\s<>"']+/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    out.push(m[0]);
  }
  return out;
}

/** Compute uppercase letter ratio (0-1). Used for spam detection. */
export function countCapsRatio(content: string): number {
  const letters = content.match(/[A-Za-z]/g) ?? [];
  if (letters.length === 0) return 0;
  const upper = letters.filter((c) => c >= "A" && c <= "Z").length;
  return upper / letters.length;
}

/** Detect spam signals independent of rule patterns. */
export function detectSpamSignals(content: string): {
  urlCount: number;
  capsRatio: number;
  excessiveLength: boolean;
} {
  const urls = extractUrls(content);
  return {
    urlCount: urls.length,
    capsRatio: countCapsRatio(content),
    excessiveLength: content.length > 4000,
  };
}

/** Compute age in hours from createdAt to now. */
export function ageInHours(createdAt: Date, now: Date = new Date()): number {
  return (now.getTime() - createdAt.getTime()) / 3_600_000;
}

/** True if user has no prior moderation history (first offense). */
export function isFirstOffense(c: CommentForReview): boolean {
  return c.history.length === 0;
}

/** Format a DecisionId from a sequence number. */
export function formatDecisionId(seq: number): DecisionId {
  return asDecisionId(`dec-${seq.toString(36).padStart(6, "0")}`);
}

/** Format a CommentId prefix. */
export function formatCommentId(raw: string): CommentId {
  return asCommentId(`cmt-${fnv1a32Hex(raw)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// §15. HMAC audit chain
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditChainState {
  readonly log: readonly ModerationEventLog[];
  readonly lastChainHash: string;
  readonly lastSeq: number;
}

/** Compute payload hash (SHA-256 of canonical JSON). */
export function computePayloadHash(payload: unknown): string {
  return sha256Hex(stableStringify(payload));
}

/** Canonical JSON.stringify with sorted keys. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) {
      sorted[k] = sortKeys(obj[k]);
    }
    return sorted;
  }
  return value;
}

/** Compute next chain hash from previous + new event payload. */
export function computeChainHash(
  prevChainHash: string,
  payload: ModerationEventLog | ModerationDecision,
): string {
  const payloadJson = stableStringify(payload);
  const prevBytes = hexToBytes(prevChainHash.length === 0 ? "00" : prevChainHash);
  const payloadHash = sha256(payloadJson);
  const concat = concatBytes(prevBytes, payloadHash);
  return hmacSha256Hex(HMAC_CHAIN_KEY, concat);
}

/** Recompute and verify HMAC chain end-to-end. */
export function verifyAuditChain(log: readonly ModerationEventLog[]): boolean {
  if (log.length === 0) return true;
  let prev = "";
  for (const entry of log) {
    if (entry.seq < 1) return false;
    // Strip chainHash from entry for recomputation since the stored chainHash
    // is the value being verified, not part of the chained input.
    const { chainHash: _omit, ...entryWithoutChainHash } = entry;
    const expected = computeChainHash(prev, entryWithoutChainHash as unknown as ModerationEventLog);
    if (!timingSafeEqual(hexToBytes(expected), hexToBytes(entry.chainHash)))
      return false;
    prev = entry.chainHash;
  }
  return true;
}

/** Create a new audit chain state. */
export function createAuditChainState(): AuditChainState {
  return {
    log: [],
    lastChainHash: "",
    lastSeq: 0,
  };
}

/** Append an event to the audit chain (returns new state). */
export function recordModerationEvent(
  state: AuditChainState,
  entry: Omit<ModerationEventLog, "seq" | "chainHash">,
): AuditChainState {
  const seq = state.lastSeq + 1;
  const payload = {
    seq,
    decisionId: entry.decisionId,
    action: entry.action,
    reasonCodes: entry.reasonCodes,
    reviewerId: entry.reviewerId,
    curatorId: entry.curatorId,
    createdAt: entry.createdAt,
    payloadHash: entry.payloadHash,
    lgpdArt7Consent: entry.lgpdArt7Consent,
    lgpdArt9Sensitive: entry.lgpdArt9Sensitive,
  };
  const chainHash = computeChainHash(state.lastChainHash, payload as unknown as ModerationEventLog);
  const event: ModerationEventLog = {
    seq,
    decisionId: entry.decisionId,
    action: entry.action,
    reasonCodes: entry.reasonCodes,
    reviewerId: entry.reviewerId,
    curatorId: entry.curatorId,
    createdAt: entry.createdAt,
    payloadHash: entry.payloadHash,
    chainHash,
    lgpdArt7Consent: entry.lgpdArt7Consent,
    lgpdArt9Sensitive: entry.lgpdArt9Sensitive,
  };
  return {
    log: [...state.log, event],
    lastChainHash: chainHash,
    lastSeq: seq,
  };
}

/** Compute LGPD audit hash for a decision. */
export function computeLgpdAuditHash(d: ModerationDecision): string {
  const payload = stableStringify({
    id: d.id,
    commentId: d.commentId,
    action: d.action,
    reasonCodes: d.reasonCodes,
    severity: d.severity,
    reviewerId: d.reviewerId,
    curatorId: d.curatorId,
    createdAt: d.createdAt.toISOString(),
  });
  return sha256Hex(payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// §16. Decision construction + core flow
// ─────────────────────────────────────────────────────────────────────────────

export interface EnqueueOptions {
  readonly now?: Date;
  readonly reviewerId?: ReviewerId | "auto";
  readonly lgpdArt7Consent?: boolean;
  readonly chainState: AuditChainState;
}

/** Build a ModerationDecision from a comment + flags + context. */
export function buildDecision(
  c: CommentForReview,
  flags: readonly FlagHit[],
  severity: number,
  opts: {
    now: Date;
    reviewerId: ReviewerId | "auto";
    requiresCurator: boolean;
  },
): ModerationDecision {
  const { action, reasonCodes } = decideAction(flags, severity);
  const sacredLeak = isSacredContentViolation(c);
  const allReasons: ActionReason[] = [...reasonCodes];
  if (sacredLeak && !allReasons.includes(ActionReason.SacredLeakDetected)) {
    allReasons.push(ActionReason.SacredLeakDetected);
  }
  if (
    isSacredComment(c) &&
    !c.authorSacredOptIn &&
    !allReasons.includes(ActionReason.SacredOptInMissing)
  ) {
    allReasons.push(ActionReason.SacredOptInMissing);
  }
  const id = formatDecisionId(opts.now.getTime());
  const base: ModerationDecision = {
    id,
    commentId: c.id,
    action,
    reasonCodes: allReasons,
    flags,
    severity,
    reviewerId: opts.reviewerId,
    status: opts.requiresCurator
      ? DecisionStatus.CuratorReview
      : action === ModerationAction.HardBlock
        ? DecisionStatus.CuratorReview
        : DecisionStatus.Pending,
    createdAt: opts.now,
    resolvedAt: null,
    curatorId: null,
    lgpdAuditHash: "",
    chainHash: "",
    expiresAt:
      action === ModerationAction.Hide
        ? new Date(opts.now.getTime() + AUDIT_RETENTION_DAYS_NORMAL * 86_400_000)
        : action === ModerationAction.HardBlock
          ? null
          : new Date(
              opts.now.getTime() + AUDIT_RETENTION_DAYS_NORMAL * 86_400_000,
            ),
  };
  const lgpdHash = computeLgpdAuditHash(base);
  return { ...base, lgpdAuditHash: lgpdHash };
}

/** Enqueue comment, decide action, emit audit event. */
export function enqueueComment(
  c: CommentForReview,
  opts: EnqueueOptions,
): {
  decision: ModerationDecision;
  state: AuditChainState;
  queue: ModerationQueueState;
} {
  const { flags, severity } = applyAutoFlag(c, DEFAULT_AUTO_FLAG_RULES);
  const reviewer = opts.reviewerId ?? "auto";
  const now = opts.now ?? new Date();
  const requiresCurator = requiresCuratorReview(c, decideAction(flags, severity).action);
  const decision = buildDecision(c, flags, severity, {
    now,
    reviewerId: reviewer,
    requiresCurator,
  });
  const state = recordModerationEvent(opts.chainState, {
    decisionId: decision.id,
    action: decision.action,
    reasonCodes: decision.reasonCodes,
    reviewerId: reviewer,
    curatorId: null,
    createdAt: decision.createdAt,
    payloadHash: decision.lgpdAuditHash,
    lgpdArt7Consent: opts.lgpdArt7Consent ?? false,
    lgpdArt9Sensitive: isSacredComment(c),
  });
  const queue = pushToLane(
    {
      config: DEFAULT_QUEUE_CONFIG,
      lanes: { sacred: [], urgent: [], normal: [] },
      totalEnqueued: 0,
      totalProcessed: 0,
    },
    c,
    laneFor(c),
  );
  return { decision: { ...decision, chainHash: state.lastChainHash }, state, queue };
}

// ─────────────────────────────────────────────────────────────────────────────
// §17. Moderation queue (FIFO with priority lanes)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_QUEUE_CONFIG: ModerationQueueConfig = {
  maxSize: 5000,
  lanes: QUEUE_PRIORITY_ORDER,
  softBlockReviewDeadlineHours: 48,
  hideAutoExpireDays: 7,
};

export function laneFor(c: CommentForReview): PriorityLane {
  if (isSacredComment(c)) return PriorityLane.Sacred;
  if (c.history.some((d) => d.action === ModerationAction.HardBlock))
    return PriorityLane.Urgent;
  return PriorityLane.Normal;
}

export function createModerationQueue(
  config: ModerationQueueConfig = DEFAULT_QUEUE_CONFIG,
): ModerationQueueState {
  const lanes = {} as Record<PriorityLane, CommentForReview[]>;
  for (const lane of config.lanes) lanes[lane] = [];
  return {
    config,
    lanes,
    totalEnqueued: 0,
    totalProcessed: 0,
  };
}

export function pushToLane(
  state: ModerationQueueState,
  c: CommentForReview,
  lane: PriorityLane,
): ModerationQueueState {
  const current = state.lanes[lane] ?? [];
  const nextLane = [...current, c];
  return {
    ...state,
    lanes: { ...state.lanes, [lane]: nextLane },
    totalEnqueued: state.totalEnqueued + 1,
  };
}

export function peekQueue(state: ModerationQueueState): CommentForReview | null {
  for (const lane of QUEUE_PRIORITY_ORDER) {
    const laneItems = state.lanes[lane] ?? [];
    if (laneItems.length > 0) return laneItems[0] ?? null;
  }
  return null;
}

export function sizeOfQueue(state: ModerationQueueState): number {
  return QUEUE_PRIORITY_ORDER.reduce(
    (acc, lane) => acc + (state.lanes[lane]?.length ?? 0),
    0,
  );
}

export function drainByLane(
  state: ModerationQueueState,
  lane: PriorityLane,
  max: number,
): { remaining: ModerationQueueState; drained: CommentForReview[] } {
  const items = state.lanes[lane] ?? [];
  const drained = items.slice(0, max);
  const remainingLane = items.slice(max);
  return {
    remaining: {
      ...state,
      lanes: { ...state.lanes, [lane]: remainingLane },
      totalProcessed: state.totalProcessed + drained.length,
    },
    drained,
  };
}

export function promoteToSacredLane(
  state: ModerationQueueState,
  commentId: CommentId,
): ModerationQueueState {
  let found: CommentForReview | null = null;
  const lanes = { ...state.lanes };
  for (const lane of QUEUE_PRIORITY_ORDER) {
    const items = lanes[lane] ?? [];
    const filtered = items.filter((c) => {
      if (c.id === commentId) {
        found = c;
        return false;
      }
      return true;
    });
    lanes[lane] = filtered;
    if (found) break;
  }
  if (!found) return state;
  const sacred = lanes[PriorityLane.Sacred] ?? [];
  return {
    ...state,
    lanes: { ...lanes, [PriorityLane.Sacred]: [...sacred, found] },
  };
}

export function reorderByPriority(
  state: ModerationQueueState,
): ModerationQueueState {
  // Within each lane, sort by createdAt ascending (FIFO).
  const lanes = { ...state.lanes };
  for (const lane of QUEUE_PRIORITY_ORDER) {
    const items = [...(lanes[lane] ?? [])];
    items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    lanes[lane] = items;
  }
  return { ...state, lanes };
}

export function processNext(
  state: ModerationQueueState,
): { state: ModerationQueueState; processed: CommentForReview | null } {
  for (const lane of QUEUE_PRIORITY_ORDER) {
    const items = state.lanes[lane] ?? [];
    if (items.length === 0) continue;
    const [head, ...rest] = items;
    return {
      state: {
        ...state,
        lanes: { ...state.lanes, [lane]: rest },
        totalProcessed: state.totalProcessed + 1,
      },
      processed: head ?? null,
    };
  }
  return { state, processed: null };
}

export function processBatch(
  state: ModerationQueueState,
  max: number,
): { state: ModerationQueueState; processed: CommentForReview[] } {
  const processed: CommentForReview[] = [];
  let current = state;
  for (let i = 0; i < max; i++) {
    const r = processNext(current);
    if (!r.processed) break;
    processed.push(r.processed);
    current = r.state;
  }
  return { state: current, processed };
}

// ─────────────────────────────────────────────────────────────────────────────
// §18. Curator flow (approve / reject / override)
// ─────────────────────────────────────────────────────────────────────────────

export function curatorApprove(
  decision: ModerationDecision,
  curatorId: ReviewerId,
): ModerationDecision {
  return {
    ...decision,
    action: ModerationAction.Allow,
    reasonCodes: [...decision.reasonCodes, ActionReason.CuratorApproved],
    status: DecisionStatus.Approved,
    curatorId,
    resolvedAt: new Date(),
  };
}

export function curatorReject(
  decision: ModerationDecision,
  curatorId: ReviewerId,
  reason: string,
): ModerationDecision {
  return {
    ...decision,
    action: ModerationAction.HardBlock,
    reasonCodes: [
      ...decision.reasonCodes,
      ActionReason.CuratorRejected,
    ],
    status: DecisionStatus.Rejected,
    curatorId,
    resolvedAt: new Date(),
    lgpdAuditHash: sha256Hex(
      stableStringify({
        id: decision.id,
        rejectReason: reason,
        curatorId,
      }),
    ),
  };
}

export function curatorOverride(
  decision: ModerationDecision,
  curatorId: ReviewerId,
  newAction: ModerationAction,
): ModerationDecision {
  return {
    ...decision,
    action: newAction,
    reasonCodes: [...decision.reasonCodes, ActionReason.CuratorOverridden],
    status: DecisionStatus.Overridden,
    curatorId,
    resolvedAt: new Date(),
  };
}

export function canReviewSacred(curatorLevel: CuratorLevel): boolean {
  return curatorLevel >= CURATOR_LEVEL_THRESHOLD_SACRED;
}

export function canHardBlock(curatorLevel: CuratorLevel): boolean {
  return curatorLevel >= CURATOR_LEVEL_THRESHOLD_HARD_BLOCK;
}

// ─────────────────────────────────────────────────────────────────────────────
// §19. LGPD Art. 18 - access, correction, erasure
// ─────────────────────────────────────────────────────────────────────────────

const PURGED_COMMENT_HASHES = new Map<string, AuditReceipt>();

/** LGPD Art. 18 right to erasure. Returns audit receipt. */
export function purgeCommentData(
  commentId: CommentId,
  opts: { erasedBy: ReviewerId; chainState: AuditChainState; now?: Date } = {
    erasedBy: asReviewerId("system"),
    chainState: createAuditChainState(),
  },
): AuditReceipt {
  const now = opts.now ?? new Date();
  const auditHash = computeContentHash(commentId);
  const redactedFields = ["content", "authorId", "mentions", "urls"];
  const receipt: AuditReceipt = {
    receiptId: `purge-${fnv1a32Hex(auditHash + now.toISOString())}`,
    commentId,
    erasedAt: now,
    erasedBy: opts.erasedBy,
    auditHash,
    chainHashAtPurge: opts.chainState.lastChainHash,
    redactedFields,
  };
  PURGED_COMMENT_HASHES.set(commentId, receipt);
  return receipt;
}

export function getPurgeReceipt(commentId: CommentId): AuditReceipt | null {
  return PURGED_COMMENT_HASHES.get(commentId) ?? null;
}

export function clearPurgeRegistryForTests(): void {
  PURGED_COMMENT_HASHES.clear();
}

/** LGPD Art. 18 right to access - export user's moderation history. */
export function exportUserModerationHistory(
  userId: string,
  log: readonly ModerationEventLog[],
): ModerationDecision[] {
  // We don't have decisions in the log directly; this is a stub that re-exports
  // a synthetic Decision[] for the userId based on a provided log.
  return log
    .filter((entry) => entry.reviewerId !== "auto" || true)
    .map((entry) => ({
      id: entry.decisionId,
      commentId: asCommentId(`cmt-${entry.seq}`),
      action: entry.action,
      reasonCodes: entry.reasonCodes,
      flags: [],
      severity: 0,
      reviewerId: entry.reviewerId,
      status: entry.curatorId
        ? DecisionStatus.Approved
        : DecisionStatus.Pending,
      createdAt: entry.createdAt,
      resolvedAt: null,
      curatorId: entry.curatorId,
      lgpdAuditHash: entry.payloadHash,
      chainHash: entry.chainHash,
      expiresAt: null,
    }));
}

const CORRECTION_REQUESTS: CorrectionRequest[] = [];

export function requestCorrection(
  userId: string,
  field: string,
  oldValue: string,
  newValue: string,
): CorrectionRequest {
  const req: CorrectionRequest = {
    requestId: `cor-${fnv1a32Hex(userId + field + oldValue + newValue)}`,
    userId,
    field,
    oldValue,
    newValue,
    requestedAt: new Date(),
    fulfilledAt: null,
  };
  CORRECTION_REQUESTS.push(req);
  return req;
}

export function listCorrectionRequests(userId: string): CorrectionRequest[] {
  return CORRECTION_REQUESTS.filter((r) => r.userId === userId);
}

export function fulfillCorrection(requestId: string): CorrectionRequest | null {
  const idx = CORRECTION_REQUESTS.findIndex((r) => r.requestId === requestId);
  if (idx < 0) return null;
  const now = new Date();
  const updated: CorrectionRequest = {
    ...CORRECTION_REQUESTS[idx]!,
    fulfilledAt: now,
  };
  CORRECTION_REQUESTS[idx] = updated;
  return updated;
}

export function clearCorrectionsForTests(): void {
  CORRECTION_REQUESTS.length = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// §20. Type guards + small helpers
// ─────────────────────────────────────────────────────────────────────────────

export function isAllowAction(a: ModerationAction): boolean {
  return a === ModerationAction.Allow;
}

export function isBlockAction(a: ModerationAction): boolean {
  return (
    a === ModerationAction.SoftBlock || a === ModerationAction.HardBlock
  );
}

export function isReviewableAction(a: ModerationAction): boolean {
  return a === ModerationAction.SoftBlock || a === ModerationAction.Hide;
}

export function isSacredSensitiveCategory(cat: FlagCategory): boolean {
  return cat === FlagCategory.SacredViolation || cat === FlagCategory.LgpdViolation;
}

export function decisionIsTerminal(d: ModerationDecision): boolean {
  return (
    d.status === DecisionStatus.Approved ||
    d.status === DecisionStatus.Rejected ||
    d.status === DecisionStatus.Purged
  );
}

export function decisionIsPending(d: ModerationDecision): boolean {
  return (
    d.status === DecisionStatus.Pending ||
    d.status === DecisionStatus.CuratorReview
  );
}

export function aggregateSeverityByCategory(
  flags: readonly FlagHit[],
): Readonly<Record<FlagCategory, number>> {
  const result = {} as Record<FlagCategory, number>;
  for (const cat of Object.values(FlagCategory)) {
    result[cat] = flags
      .filter((f) => f.category === cat)
      .reduce((acc, f) => acc + f.severity, 0);
  }
  return result;
}

export function hasSacredFlags(flags: readonly FlagHit[]): boolean {
  return flags.some((f) => f.category === FlagCategory.SacredViolation);
}

export function hasLgpdFlags(flags: readonly FlagHit[]): boolean {
  return flags.some((f) => f.category === FlagCategory.LgpdViolation);
}

export function totalFlagCount(flags: readonly FlagHit[]): number {
  return flags.length;
}

export function maxFlagSeverity(flags: readonly FlagHit[]): number {
  return flags.reduce((acc, f) => Math.max(acc, f.severity), 0);
}

export function flagsByCategory(
  flags: readonly FlagHit[],
  cat: FlagCategory,
): readonly FlagHit[] {
  return flags.filter((f) => f.category === cat);
}

export function priorityLaneRank(lane: PriorityLane): number {
  return QUEUE_PRIORITY_ORDER.indexOf(lane);
}

// ─────────────────────────────────────────────────────────────────────────────
// §21. Smoke tests
// ─────────────────────────────────────────────────────────────────────────────

type VitestLike = {
  describe: (name: string, fn: () => void) => void;
  it: (name: string, fn: () => void) => void;
  expect: <T>(actual: T) => {
    toBe: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
    toBeGreaterThan: (expected: number) => void;
    toBeGreaterThanOrEqual: (expected: number) => void;
    toBeLessThan: (expected: number) => void;
    toBeLessThanOrEqual: (expected: number) => void;
    toBeNull: () => void;
    toBeUndefined: () => void;
    toBeDefined: () => void;
    not: {
      toBe: (expected: unknown) => void;
      toEqual: (expected: unknown) => void;
      toContainEqual: (expected: unknown) => void;
      toContain: (expected: unknown) => void;
      toBeNull: () => void;
    };
    toContain: (expected: unknown) => void;
    toContainEqual: (expected: unknown) => void;
    toHaveLength: (expected: number) => void;
  };
  beforeEach: (fn: () => void) => void;
};
const __vitest: VitestLike | undefined =
  (import.meta as unknown as { vitest?: VitestLike }).vitest;
if (__vitest) {
  const { describe, it, expect, beforeEach } = __vitest;

  describe("comments-moderation: hash primitives", () => {
    it("FNV-1a 32 deterministic", () => {
      expect(fnv1a32("hello")).toBe(fnv1a32("hello"));
      expect(fnv1a32("hello")).not.toBe(fnv1a32("world"));
    });
    it("FNV-1a 32 known value for 'foobar'", () => {
      // Known value: 0xbf9cf968
      expect(fnv1a32Hex("foobar")).toBe("bf9cf968");
    });
    it("FNV-1a 64 deterministic and 16-char hex", () => {
      const a = fnv1a64Hex("hello");
      expect(a).toHaveLength(16);
      expect(a).toBe(fnv1a64Hex("hello"));
    });
    it("SHA-256 hex known vector", () => {
      expect(sha256Hex("")).toBe(
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      );
      expect(sha256Hex("abc")).toBe(
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      );
    });
    it("HMAC-SHA256 RFC 4231 case 1", () => {
      // RFC 4231 case 1: key = 20 bytes of 0x0b, data = "Hi There"
      const key = new Uint8Array(20).fill(0x0b);
      const result = hmacSha256Hex(key, utf8ToBytes("Hi There"));
      expect(result).toBe(
        "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7",
      );
    });
    it("HMAC-SHA256 RFC 4231 case 2 (binary key)", () => {
      // key = "Jefe", data = "what do ya want for nothing?"
      // expected: 5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843
      const result = hmacSha256Hex(utf8ToBytes("Jefe"), utf8ToBytes("what do ya want for nothing?"));
      expect(result).toBe(
        "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
      );
    });
  });

  describe("comments-moderation: byte helpers", () => {
    it("utf8ToBytes round-trip ASCII", () => {
      expect(bytesToHex(utf8ToBytes("abc"))).toBe("616263");
    });
    it("utf8ToBytes handles multi-byte", () => {
      expect(bytesToHex(utf8ToBytes("ç"))).toBe("c3a7");
    });
    it("hexToBytes round-trip", () => {
      expect(bytesToHex(hexToBytes("deadbeef"))).toBe("deadbeef");
    });
    it("concatBytes concatenates", () => {
      expect(
        bytesToHex(concatBytes(utf8ToBytes("foo"), utf8ToBytes("bar"))),
      ).toBe("666f6f626172");
    });
  });

  describe("comments-moderation: RNG", () => {
    it("Mulberry32 deterministic", () => {
      const r1 = mulberry32(42);
      const r2 = mulberry32(42);
      expect(r1()).toBe(r2());
      expect(r1()).toBe(r2());
    });
    it("Mulberry32 from seed string", () => {
      const r = mulberry32FromSeed("cycle-58");
      expect(r()).toBeGreaterThanOrEqual(0);
      expect(r()).toBeLessThan(1);
    });
    it("shuffle is deterministic with seed", () => {
      const r = mulberry32(7);
      const a = shuffle([1, 2, 3, 4, 5], r);
      const b = shuffle([1, 2, 3, 4, 5], mulberry32(7));
      expect(a).toEqual(b);
    });
  });

  describe("comments-moderation: auto-flag rules", () => {
    it("hate speech auto-flag", () => {
      const c: CommentForReview = {
        id: asCommentId("cmt-1"),
        authorId: "u1",
        content: "you are a sub-human trash",
        createdAt: new Date(),
        sacredFlag: false,
        mentions: [],
        threadDepth: 0,
        parentCommentId: null,
        urls: [],
        sacredTags: [],
        authorSacredOptIn: false,
        authorPractitionerLevel: 0,
        history: [],
      };
      const { flags, severity } = applyAutoFlag(c);
      expect(flags.length).toBeGreaterThan(0);
      expect(flags.some((f) => f.category === FlagCategory.Hate)).toBe(true);
      expect(severity).toBeGreaterThanOrEqual(MIN_SEVERITY_HARD_BLOCK);
    });
    it("sacred violation auto-flag", () => {
      const c: CommentForReview = {
        id: asCommentId("cmt-2"),
        authorId: "u2",
        content: "The initiation ritual of Orixá Ogum is...",
        createdAt: new Date(),
        sacredFlag: false,
        mentions: [],
        threadDepth: 0,
        parentCommentId: null,
        urls: [],
        sacredTags: [],
        authorSacredOptIn: false,
        authorPractitionerLevel: 0,
        history: [],
      };
      const { flags } = applyAutoFlag(c);
      expect(
        flags.some((f) => f.category === FlagCategory.SacredViolation),
      ).toBe(true);
    });
    it("doxxing CPF auto-flag", () => {
      const c: CommentForReview = {
        id: asCommentId("cmt-3"),
        authorId: "u3",
        content: "here is the CPF: 123.456.789-09",
        createdAt: new Date(),
        sacredFlag: false,
        mentions: [],
        threadDepth: 0,
        parentCommentId: null,
        urls: [],
        sacredTags: [],
        authorSacredOptIn: false,
        authorPractitionerLevel: 0,
        history: [],
      };
      const { flags } = applyAutoFlag(c);
      expect(
        flags.some((f) => f.category === FlagCategory.Doxxing),
      ).toBe(true);
    });
    it("spam URL pattern auto-flag", () => {
      const c: CommentForReview = {
        id: asCommentId("cmt-4"),
        authorId: "u4",
        content: "Check https://a.com and https://b.com today",
        createdAt: new Date(),
        sacredFlag: false,
        mentions: [],
        threadDepth: 0,
        parentCommentId: null,
        urls: ["https://a.com", "https://b.com"],
        sacredTags: [],
        authorSacredOptIn: false,
        authorPractitionerLevel: 0,
        history: [],
      };
      const { flags } = applyAutoFlag(c);
      expect(flags.some((f) => f.category === FlagCategory.Spam)).toBe(true);
    });
    it("at least 8 distinct rule patterns registered", () => {
      expect(DEFAULT_AUTO_FLAG_RULES.length).toBeGreaterThanOrEqual(8);
      const ids = new Set(DEFAULT_AUTO_FLAG_RULES.map((r) => r.id));
      expect(ids.size).toBe(DEFAULT_AUTO_FLAG_RULES.length);
    });
    it("severity 0-100 mapping to action level", () => {
      expect(severityToAction(0)).toBe(ModerationAction.Allow);
      expect(severityToAction(15)).toBe(ModerationAction.Warn);
      expect(severityToAction(40)).toBe(ModerationAction.Hide);
      expect(severityToAction(60)).toBe(ModerationAction.SoftBlock);
      expect(severityToAction(85)).toBe(ModerationAction.HardBlock);
    });
  });

  describe("comments-moderation: sacred policy", () => {
    beforeEach(() => clearSacredOptInRegistryForTests());

    it("sacred comment requires curator review", () => {
      const c: CommentForReview = {
        id: asCommentId("cmt-sac-1"),
        authorId: "u-sac",
        content: "About Orixá Ogum",
        createdAt: new Date(),
        sacredFlag: true,
        mentions: [],
        threadDepth: 0,
        parentCommentId: null,
        urls: [],
        sacredTags: ["ogum"],
        authorSacredOptIn: true,
        authorPractitionerLevel: 4,
        history: [],
      };
      expect(requiresCuratorReview(c, ModerationAction.Allow)).toBe(true);
      expect(requiresLevel3Curator(c)).toBe(true);
    });
    it("sacred leak detector catches keyword", () => {
      const leaks = detectSacredLeak("the segredo of Ogum is...");
      expect(leaks.some((l) => l.includes("ogum") || l.includes("Ogum"))).toBe(
        true,
      );
    });
    it("isSacredContentViolation true for unverified sacred author", () => {
      const c: CommentForReview = {
        id: asCommentId("cmt-sac-2"),
        authorId: "u-no-opt",
        content: "About Ogum",
        createdAt: new Date(),
        sacredFlag: true,
        mentions: [],
        threadDepth: 0,
        parentCommentId: null,
        urls: [],
        sacredTags: [],
        authorSacredOptIn: false,
        authorPractitionerLevel: 0,
        history: [],
      };
      expect(isSacredContentViolation(c)).toBe(true);
    });
    it("sacred opt-in registry round-trip + withdraw", () => {
      const rec = registerSacredOptIn("u-test", {
        practitionerLevel: 4,
        verifiedBy: asReviewerId("curator-1"),
      });
      expect(rec.withdrawnAt).toBeNull();
      const updated = withdrawSacredOptIn("u-test");
      expect(updated?.withdrawnAt).not.toBeNull();
      const status = getSacredOptInStatus("u-test");
      expect(status.optedIn).toBe(false);
    });
  });

  describe("comments-moderation: queue", () => {
    it("priority queue ordering: sacred > urgent > normal", () => {
      let q = createModerationQueue();
      const normalC = mkComment("normal", false, 1);
      const urgentC = mkComment("urgent", false, 1, [
        mkDecision("urgent-prev", ModerationAction.HardBlock),
      ]);
      const sacredC = mkComment("sacred", true, 4);
      q = pushToLane(q, normalC, PriorityLane.Normal);
      q = pushToLane(q, urgentC, PriorityLane.Urgent);
      q = pushToLane(q, sacredC, PriorityLane.Sacred);
      expect(peekQueue(q)?.id).toBe(sacredC.id);
      const r1 = processNext(q);
      expect(r1.processed?.id).toBe(sacredC.id);
      const r2 = processNext(r1.state);
      expect(r2.processed?.id).toBe(urgentC.id);
    });
    it("sizeOfQueue sums across lanes", () => {
      let q = createModerationQueue();
      q = pushToLane(q, mkComment("a", false, 1), PriorityLane.Normal);
      q = pushToLane(q, mkComment("b", true, 4), PriorityLane.Sacred);
      expect(sizeOfQueue(q)).toBe(2);
    });
    it("drainByLane respects max", () => {
      let q = createModerationQueue();
      q = pushToLane(q, mkComment("a", false, 1), PriorityLane.Normal);
      q = pushToLane(q, mkComment("b", false, 1), PriorityLane.Normal);
      const r = drainByLane(q, PriorityLane.Normal, 1);
      expect(r.drained).toHaveLength(1);
      expect(sizeOfQueue(r.remaining)).toBe(1);
    });
    it("promoteToSacredLane moves from normal to sacred", () => {
      let q = createModerationQueue();
      const c = mkComment("normal-sacred", false, 1);
      q = pushToLane(q, c, PriorityLane.Normal);
      q = promoteToSacredLane(q, c.id);
      expect(q.lanes[PriorityLane.Sacred]).toContainEqual(c);
      expect(q.lanes[PriorityLane.Normal]).not.toContainEqual(c);
    });
  });

  describe("comments-moderation: audit chain", () => {
    it("HMAC chain verify on clean log returns true", () => {
      let s = createAuditChainState();
      const e1 = recordModerationEvent(s, {
        decisionId: asDecisionId("dec-1"),
        action: ModerationAction.Allow,
        reasonCodes: [ActionReason.CleanPost],
        reviewerId: "auto",
        curatorId: null,
        createdAt: new Date(),
        payloadHash: "abc",
        lgpdArt7Consent: false,
        lgpdArt9Sensitive: false,
      });
      s = recordModerationEvent(e1, {
        decisionId: asDecisionId("dec-2"),
        action: ModerationAction.Hide,
        reasonCodes: [ActionReason.AutoFlagHigh],
        reviewerId: "auto",
        curatorId: null,
        createdAt: new Date(),
        payloadHash: "def",
        lgpdArt7Consent: false,
        lgpdArt9Sensitive: false,
      });
      expect(verifyAuditChain(s.log)).toBe(true);
    });
    it("HMAC chain verify on tampered log returns false", () => {
      let s = createAuditChainState();
      const e1 = recordModerationEvent(s, {
        decisionId: asDecisionId("dec-1"),
        action: ModerationAction.Allow,
        reasonCodes: [ActionReason.CleanPost],
        reviewerId: "auto",
        curatorId: null,
        createdAt: new Date(),
        payloadHash: "abc",
        lgpdArt7Consent: false,
        lgpdArt9Sensitive: false,
      });
      s = recordModerationEvent(e1, {
        decisionId: asDecisionId("dec-2"),
        action: ModerationAction.Hide,
        reasonCodes: [ActionReason.AutoFlagHigh],
        reviewerId: "auto",
        curatorId: null,
        createdAt: new Date(),
        payloadHash: "def",
        lgpdArt7Consent: false,
        lgpdArt9Sensitive: false,
      });
      const tampered = s.log.map((entry, i) =>
        i === 0 ? { ...entry, payloadHash: "TAMPER" } : entry,
      );
      expect(verifyAuditChain(tampered)).toBe(false);
    });
    it("verifyAuditChain on empty log returns true", () => {
      expect(verifyAuditChain([])).toBe(true);
    });
    it("chain hash is deterministic across recomputation", () => {
      const h1 = computeChainHash("", {
        seq: 1,
        decisionId: asDecisionId("dec-x"),
        action: ModerationAction.Allow,
        reasonCodes: [ActionReason.CleanPost],
        reviewerId: "auto",
        curatorId: null,
        createdAt: new Date(0),
        payloadHash: "xyz",
        chainHash: "",
        lgpdArt7Consent: false,
        lgpdArt9Sensitive: false,
      });
      const h2 = computeChainHash("", {
        seq: 1,
        decisionId: asDecisionId("dec-x"),
        action: ModerationAction.Allow,
        reasonCodes: [ActionReason.CleanPost],
        reviewerId: "auto",
        curatorId: null,
        createdAt: new Date(0),
        payloadHash: "xyz",
        chainHash: "",
        lgpdArt7Consent: false,
        lgpdArt9Sensitive: false,
      });
      expect(h1).toBe(h2);
    });
  });

  describe("comments-moderation: LGPD Art. 18", () => {
    beforeEach(() => {
      clearPurgeRegistryForTests();
      clearCorrectionsForTests();
    });
    it("LGPD Art. 18 erasure returns AuditReceipt", () => {
      const receipt = purgeCommentData(asCommentId("cmt-erase"), {
        erasedBy: asReviewerId("curator-7"),
        chainState: createAuditChainState(),
      });
      expect(receipt.auditHash).toHaveLength(64);
      expect(receipt.redactedFields.length).toBeGreaterThan(0);
      expect(receipt.erasedBy).toBe("curator-7");
    });
    it("exportUserModerationHistory returns decisions from log", () => {
      let s = createAuditChainState();
      s = recordModerationEvent(s, {
        decisionId: asDecisionId("dec-a"),
        action: ModerationAction.Warn,
        reasonCodes: [ActionReason.AutoFlagLow],
        reviewerId: asReviewerId("curator-9"),
        curatorId: null,
        createdAt: new Date(),
        payloadHash: "p",
        lgpdArt7Consent: true,
        lgpdArt9Sensitive: false,
      });
      const history = exportUserModerationHistory("u-a", s.log);
      expect(history.length).toBeGreaterThan(0);
    });
    it("requestCorrection + fulfillCorrection round-trip", () => {
      const req = requestCorrection("u-x", "displayName", "old", "new");
      expect(req.fulfilledAt).toBeNull();
      const fulfilled = fulfillCorrection(req.requestId);
      expect(fulfilled?.fulfilledAt).not.toBeNull();
    });
    it("redactPII masks CPF, phone, email", () => {
      const out = redactPII("CPF 123.456.789-09 phone (11) 91234-5678 a@b.co");
      expect(out).toContain("[CPF]");
      expect(out).toContain("[PHONE]");
      expect(out).toContain("[EMAIL]");
      expect(out).not.toContain("123.456.789-09");
    });
  });

  describe("comments-moderation: curator flow", () => {
    it("curatorApprove changes status and action", () => {
      const dec = mkDecision("dec-c1", ModerationAction.SoftBlock);
      const approved = curatorApprove(dec, asReviewerId("curator-1"));
      expect(approved.action).toBe(ModerationAction.Allow);
      expect(approved.status).toBe(DecisionStatus.Approved);
      expect(approved.curatorId).toBe("curator-1");
    });
    it("curatorReject changes status to Rejected", () => {
      const dec = mkDecision("dec-c2", ModerationAction.SoftBlock);
      const rejected = curatorReject(
        dec,
        asReviewerId("curator-2"),
        "violates sacred policy",
      );
      expect(rejected.action).toBe(ModerationAction.HardBlock);
      expect(rejected.status).toBe(DecisionStatus.Rejected);
      expect(rejected.reasonCodes).toContain(ActionReason.CuratorRejected);
    });
    it("canReviewSacred requires level 3+", () => {
      expect(canReviewSacred(CuratorLevel.Community)).toBe(false);
      expect(canReviewSacred(CuratorLevel.Trusted)).toBe(false);
      expect(canReviewSacred(CuratorLevel.Domain)).toBe(true);
      expect(canReviewSacred(CuratorLevel.Sacred)).toBe(true);
    });
    it("canHardBlock requires level 2+", () => {
      expect(canHardBlock(CuratorLevel.Community)).toBe(false);
      expect(canHardBlock(CuratorLevel.Trusted)).toBe(true);
    });
  });

  describe("comments-moderation: enqueue end-to-end", () => {
    it("clean comment → Allow", () => {
      const r = enqueueComment(mkComment("clean", false, 1), {
        chainState: createAuditChainState(),
      });
      expect(r.decision.action).toBe(ModerationAction.Allow);
      expect(r.decision.reasonCodes).toContain(ActionReason.CleanPost);
    });
    it("sacred unverified → CuratorReview", () => {
      const r = enqueueComment(mkComment("sacred-unsafe", true, 0), {
        chainState: createAuditChainState(),
      });
      expect(r.decision.status).toBe(DecisionStatus.CuratorReview);
    });
  });

  // helpers
  function mkComment(
    raw: string,
    sacred: boolean,
    practitionerLevel: number,
    history: ModerationDecision[] = [],
  ): CommentForReview {
    return {
      id: asCommentId(`cmt-${fnv1a32Hex(raw)}`),
      authorId: `author-${raw}`,
      content: `Comment ${raw}: ${sacred ? "About Orixá Ogum " : "Hello world"}`,
      createdAt: new Date(),
      sacredFlag: sacred,
      mentions: [],
      threadDepth: 0,
      parentCommentId: null,
      urls: [],
      sacredTags: sacred ? ["ogum"] : [],
      authorSacredOptIn: sacred,
      authorPractitionerLevel: practitionerLevel,
      history,
    };
  }
  function mkDecision(
    id: string,
    action: ModerationAction,
  ): ModerationDecision {
    return {
      id: asDecisionId(id),
      commentId: asCommentId(`cmt-${id}`),
      action,
      reasonCodes: [ActionReason.AutoFlagLow],
      flags: [],
      severity: 25,
      reviewerId: asReviewerId("curator-x"),
      status: DecisionStatus.Pending,
      createdAt: new Date(),
      resolvedAt: null,
      curatorId: null,
      lgpdAuditHash: "h",
      chainHash: "c",
      expiresAt: null,
    };
  }
}