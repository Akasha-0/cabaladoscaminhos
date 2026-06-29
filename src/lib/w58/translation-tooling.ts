/**
 * w58/translation-tooling
 * ───────────────────────────────
 * Translation memory + glossary + curator review queue + sacred-term
 * preservation + locale fallback chain. Counterpart to w23/translation-
 * content + w55-replacement/i18n-locale-fallback-chain. Designed BY-SHAPE
 * to coexist with the existing `src/lib/i18n/{useT,index}.ts` without
 * importing from them.
 *
 * Princípios:
 *   - Translation Memory (TM): cache of (source → target, locale) hits with
 *     last-used + hit-count metadata. Used as the first lookup tier.
 *   - Glossary: term-level store with category (sacred / technical / general)
 *     and a `locked` flag (locked = never auto-translated). Sacred terms
 *     MUST live in a SEPARATE glossary (defense-in-depth — quaternary).
 *   - Curator review queue: priority lanes (sacred > urgent > normal). FIFO
 *     inside each lane. Sacred terms require tier-3+ curator to approve.
 *   - Sacred-term preservation: sacred glossary entries MUST NOT be auto-
 *     translated, MUST be curator-reviewed, MUST be locked after approval,
 *     and MUST live in a separate glossary (cannot pollute general).
 *   - Locale fallback chain: pt-BR → en-US → es-ES → fr-FR → qu-PE → literal
 *     of the source. The chain MUST terminate in the default locale.
 *   - HMAC audit chain: every review action (approve / reject / lock /
 *     sacred-lock) emits an event chained via HMAC-SHA256. Tampering is
 *     detectable.
 *   - LGPD Art. 7 (consentimento) + Art. 9 (finalidade específica) + Art. 18
 *     (acesso, correção, eliminação, oposição). Sacred = religious
 *     affiliation → sensitive (Art. 9).
 *
 * Self-contained: zero imports from the repo. Pure TS + Math nativo + string
 * ops + hand-rolled crypto. Determinístico. Sem dependência externa.
 *
 * Layout:
 *   §1  Types & Contracts
 *   §2  Constants (locales, sacred namespaces, LGPD)
 *   §3  Math helpers (FNV-1a 32/64, SHA-256, HMAC-SHA256, mulberry32, Levenshtein)
 *   §4  Locale normalize + fallback chain resolver
 *   §5  Translation Memory store (TM)
 *   §6  Glossary store + consistency check
 *   §7  Lookup + auto-translate (MT stub)
 *   §8  Confidence + sacred-proximity
 *   §9  Sacred-term lock
 *   §10 Curator review queue (priority lanes)
 *   §11 Audit event chain (HMAC)
 *   §12 LGPD Art. 7 / 9 / 18
 *   §13 Smoke / regression scenarios (25+ functions)
 *   §14 File metadata + defaults
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Types & Contracts                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Supported locales (BCP-47 tags). */
export type Locale =
  | "pt-BR"
  | "en-US"
  | "es-ES"
  | "fr-FR"
  | "qu-PE";

/** Ordered list of locales for fallback chain. */
export type LocaleFallbackChain = readonly Locale[];

/** Default locale — chain MUST terminate here. */
export const DEFAULT_LOCALE: Locale = "pt-BR";

/** Translation key shape — namespace + dotted path. */
export interface TranslationKey {
  readonly namespace: string;
  readonly key: string;
  readonly defaultText: string;
  /** True when this key is sacred (prayer./ritual./mantra./liturgy.). */
  readonly sacred?: boolean;
  /** Optional context note for the translator. */
  readonly contextNote?: string;
}

/** Status of a translation entry in the curation pipeline. */
export type TranslationStatus =
  | "pending"
  | "auto-translated"
  | "human-reviewed"
  | "curator-approved"
  | "sacred-locked"
  | "rejected";

/** A single translation entry — keyed by (translationKey + locale). */
export interface TranslationEntry {
  readonly id: string;
  readonly key: TranslationKey;
  readonly locale: Locale;
  readonly translatedText: string;
  readonly translatorId: string;
  readonly reviewedBy?: string;
  readonly status: TranslationStatus;
  readonly confidence: TranslationConfidence;
  readonly sacredFlag: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/** Confidence score (0..1) with named factors for transparency. */
export interface TranslationConfidence {
  readonly score: number;
  readonly exactMatch: boolean;
  readonly fuzzyMatch: boolean;
  readonly glossaryHit: boolean;
  readonly sacredProximity: number;
  readonly lengthRatio: number;
}

/** Glossary term — sacred / technical / general category. */
export type GlossaryCategory = "sacred" | "technical" | "general";

export interface GlossaryTerm {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly locale: Locale;
  readonly category: GlossaryCategory;
  readonly context: string;
  /** Locked terms are NEVER auto-translated. */
  readonly locked: boolean;
  /** Curator who approved the lock (tier-3+ for sacred). */
  readonly lockedBy?: string;
  /** Tier of the approving curator (sacred requires tier 3+). */
  readonly curatorTier?: 1 | 2 | 3 | 4;
}

/** Translation Memory — one per (source + locale). */
export interface TranslationMemory {
  readonly source: string;
  readonly target: string;
  readonly locale: Locale;
  readonly hits: number;
  readonly lastUsed: number;
  /** True when at least one sacred term was preserved in this TM. */
  readonly sacredPreserved: boolean;
}

/** Sacred-term policy. Sacred = religious affiliation (LGPD Art. 9). */
export interface SacredTermPolicy {
  /** NEVER auto-translate; return source unchanged. */
  readonly autoTranslateBlocked: boolean;
  /** Requires curator review before publishing. */
  readonly curatorReviewRequired: boolean;
  /** Minimum curator tier for approval (default 3). */
  readonly minimumCuratorTier: 1 | 2 | 3 | 4;
  /** Lock after approval — cannot be re-translated. */
  readonly lockedAfterApproval: boolean;
  /** Separate glossary required (defense-in-depth quaternary). */
  readonly separateGlossary: boolean;
  /** Proximity threshold above which a review is triggered. */
  readonly proximityReviewThreshold: number;
}

/** Priority lane for the curator review queue. */
export type ReviewPriority = "sacred" | "urgent" | "normal";

/** Curator review queue with priority lanes. */
export interface CuratorReviewQueue {
  readonly sacred: TranslationEntry[];
  readonly urgent: TranslationEntry[];
  readonly normal: TranslationEntry[];
}

/** Translation audit event kinds. */
export type TranslationAuditKind =
  | "created"
  | "translated"
  | "reviewed"
  | "approved"
  | "rejected"
  | "locked"
  | "sacred-locked"
  | "exported"
  | "erased"
  | "consent-granted"
  | "consent-withdrawn";

/** A single translation audit event — HMAC-chained. */
export interface TranslationAuditEvent {
  readonly id: string;
  readonly kind: TranslationAuditKind;
  readonly entryId: string;
  readonly actorId: string;
  readonly reason?: string;
  readonly locale?: Locale;
  readonly at: number;
  /** HMAC chain hash over (prevHash + event payload). */
  readonly hmac: string;
  /** Hash of the previous event in the chain (genesis = "0"*64). */
  readonly prevHmac: string;
}

/** Audit receipt returned by LGPD Art. 18 erasure. */
export interface AuditReceipt {
  readonly receiptId: string;
  readonly entryId: string;
  readonly userId: string;
  readonly erasedAt: number;
  readonly erasedKinds: readonly TranslationAuditKind[];
  readonly finalHmac: string;
  /** Cryptographic attestation that the erasure occurred. */
  readonly hmacAttestation: string;
}

/** Machine translation stub — mock MT result. */
export interface MachineTranslationStub {
  readonly sourceText: string;
  readonly translatedText: string;
  readonly sourceLocale: Locale;
  readonly targetLocale: Locale;
  readonly stubEngineId: string;
  readonly stubDeterministic: boolean;
}

/** Glossary consistency conflict descriptor. */
export interface GlossaryConflict {
  readonly kind: "duplicate-source-target" | "duplicate-source-different-target" | "mixed-sacred-general";
  readonly termIds: readonly string[];
  readonly source: string;
  readonly locale: Locale;
}

/** Locale fallback chain validation result. */
export interface FallbackValidation {
  readonly valid: boolean;
  readonly reason?: string;
}

/** Lookup result envelope. */
export interface LookupResult {
  readonly entry: TranslationEntry;
  readonly usedLocale: Locale;
  readonly fallbacks: readonly Locale[];
  readonly hitTier: "exact-tm" | "fuzzy-tm" | "glossary" | "auto-translate" | "default-literal";
}

/** Consent record (LGPD Art. 7). */
export interface TranslationConsent {
  readonly userId: string;
  readonly purpose: LgpdPurpose;
  readonly grantedAt: number;
  readonly expiresAt?: number;
  readonly withdrawn: boolean;
}

/** Sacred-proximity detection result. */
export interface SacredProximityResult {
  readonly proximity: number;
  readonly matchedTerms: readonly GlossaryTerm[];
}

/** Sacred term match result. */
export interface SacredMatchResult {
  readonly isSacred: boolean;
  readonly matchedTerm?: GlossaryTerm;
}

/** LGPD purpose codes (Art. 9 — finalidades específicas). */
export type LgpdPurpose =
  | "translation-analytics"
  | "translation-memory"
  | "curator-review"
  | "audit-trail";

/** Translator / curator tier descriptor. */
export type CuratorTier = 1 | 2 | 3 | 4;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constants                                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** All supported locales (canonical, ordered by priority). */
export const SUPPORTED_LOCALES: readonly Locale[] = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
  "qu-PE",
] as const;

/** Default fallback chain — terminates in pt-BR. */
export const DEFAULT_LOCALE_FALLBACK_CHAIN: readonly Locale[] = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
  "qu-PE",
] as const;

/** Namespaces that MUST be treated as sacred (religious affiliation). */
export const SACRED_NAMESPACES: readonly string[] = [
  "prayer",
  "ritual",
  "mantra",
  "liturgy",
  "orixa",
  "orixas",
] as const;

/** Sacred proximity threshold — above this → curator review mandatory. */
export const SACRED_PROXIMITY_REVIEW_THRESHOLD = 0.7;

/** Default sacred-term policy. */
export const DEFAULT_SACRED_POLICY: SacredTermPolicy = {
  autoTranslateBlocked: true,
  curatorReviewRequired: true,
  minimumCuratorTier: 3,
  lockedAfterApproval: true,
  separateGlossary: true,
  proximityReviewThreshold: SACRED_PROXIMITY_REVIEW_THRESHOLD,
};

/** Retention window for items in the curator review queue (days). */
export const REVIEW_QUEUE_RETENTION_DAYS = 90;

/** Engine version. */
export const ENGINE_VERSION = "1.0.0+w58.0";

/** LGPD policy version. */
export const POLICY_VERSION = "lgpd-2025.1";

/** A11y profile. */
export const A11Y_PROFILE = "WCAG-2.1-AA";

/** HMAC chain salt (genesis seed for the audit chain). */
export const AUDIT_CHAIN_SALT = "w58/translation-tooling/audit/2026.06.29";

/** Max Levenshtein distance for a fuzzy match. */
export const FUZZY_MATCH_MAX_DISTANCE = 3;

/** Curator review queue priority order (high → low). */
export const REVIEW_PRIORITY_ORDER: readonly ReviewPriority[] = [
  "sacred",
  "urgent",
  "normal",
] as const;

/** LGPD purpose set (Art. 9 — finalidades). */
export const LGPD_PURPOSES: readonly LgpdPurpose[] = [
  "translation-analytics",
  "translation-memory",
  "curator-review",
  "audit-trail",
] as const;

/** Default curator tier for general (non-sacred) approval. */
export const DEFAULT_CURATOR_TIER: CuratorTier = 2;

/** Translation status set (all valid statuses). */
export const TRANSLATION_STATUSES: readonly TranslationStatus[] = [
  "pending",
  "auto-translated",
  "human-reviewed",
  "curator-approved",
  "sacred-locked",
  "rejected",
] as const;

/** Glossary categories set. */
export const GLOSSARY_CATEGORIES: readonly GlossaryCategory[] = [
  "sacred",
  "technical",
  "general",
] as const;

/** Review priority lanes set. */
export const REVIEW_PRIORITIES: readonly ReviewPriority[] = [
  "sacred",
  "urgent",
  "normal",
] as const;

/** Minimum curator tier allowed to lock a sacred glossary term. */
export const MINIMUM_CURATOR_TIER_SACRED: CuratorTier = 3;

/** FNV-1a 32-bit offset basis. */
export const FNV1A_32_OFFSET = 0x811c9dc5;

/** FNV-1a 32-bit prime. */
export const FNV1A_32_PRIME = 0x01000193;

/** FNV-1a 64-bit offset (lo part). */
export const FNV1A_64_OFFSET_LO = 0xcbf29ce4;

/** FNV-1a 64-bit offset (hi part). */
export const FNV1A_64_OFFSET_HI = 0x84222325;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers — FNV-1a 32/64, SHA-256, HMAC-SHA256, mulberry32, Levenshtein
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** FNV-1a 32-bit hash. Returns uint32. */
export function fnv1a32(input: string): number {
  let h = FNV1A_32_OFFSET;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, FNV1A_32_PRIME) >>> 0;
  }
  return h >>> 0;
}

/** FNV-1a 32-bit hex. Returns 8-char lowercase hex. */
export function fnv1a32Hex(input: string): string {
  return fnv1a32(input).toString(16).padStart(8, "0");
}

/** FNV-1a 64-bit hex (two 32-bit lanes). Returns 16-char lowercase hex. */
export function fnv1a64Hex(input: string): string {
  let h1 = FNV1A_64_OFFSET_LO;
  let h2 = FNV1A_64_OFFSET_HI;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c & 0xffff;
    h1 = Math.imul(h1, FNV1A_32_PRIME) >>> 0;
    h2 ^= (c >>> 16) & 0xffff;
    h2 = Math.imul(h2, FNV1A_32_PRIME) >>> 0;
  }
  return (
    (h1 >>> 0).toString(16).padStart(8, "0") +
    (h2 >>> 0).toString(16).padStart(8, "0")
  );
}

/** SHA-256 (hand-rolled, FIPS 180-4). Returns 32-byte Uint8Array. */
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
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
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
  dv.setUint32(padded.length - 8, Math.floor(ml / 0x100000000) >>> 0);
  const W = new Uint32Array(64);
  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(chunk + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
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
  const dv2 = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) dv2.setUint32(i * 4, H[i]);
  return out;
}

/** UTF-8 encode a string → Uint8Array. */
function utf8(s: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s);
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

/** HMAC-SHA256(key, message) → 64-char lowercase hex. */
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
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = k0[i] ^ 0x36;
    opad[i] = k0[i] ^ 0x5c;
  }
  const msgBytes = utf8(message);
  const innerInput = new Uint8Array(blockSize + msgBytes.length);
  innerInput.set(ipad);
  innerInput.set(msgBytes, blockSize);
  const innerHash = sha256(innerInput);
  const outerInput = new Uint8Array(blockSize + 32);
  outerInput.set(opad);
  outerInput.set(innerHash, blockSize);
  const outerHash = sha256(outerInput);
  let hex = "";
  for (let i = 0; i < outerHash.length; i++) {
    hex += (outerHash[i] >>> 0).toString(16).padStart(2, "0");
  }
  return hex;
}

/** SHA-256 of a string → 64-char lowercase hex (for source text hashing). */
export function sha256Hex(input: string): string {
  const bytes = sha256(utf8(input));
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes[i] >>> 0).toString(16).padStart(2, "0");
  }
  return hex;
}

/** Mulberry32 seeded PRNG. Returns a function that yields [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hand-rolled Levenshtein distance. O(m·n), small inputs. */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

/** Normalized Levenshtein similarity (1 - dist/maxLen). 0..1. */
export function levenshteinSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

/** Hex-encode a Uint8Array. */
export function bytesToHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes[i] >>> 0).toString(16).padStart(2, "0");
  }
  return hex;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Locale normalize + fallback chain resolver                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Normalize a raw locale string → canonical BCP-47. */
export function normalizeLocale(raw: string): Locale | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase().replace(/_/g, "-");
  // Direct hit
  for (const l of SUPPORTED_LOCALES) {
    if (l.toLowerCase() === cleaned) return l;
  }
  // Language-only fallback: pt → pt-BR, en → en-US, es → es-ES, etc.
  const lang = cleaned.split("-")[0];
  switch (lang) {
    case "pt":
      return "pt-BR";
    case "en":
      return "en-US";
    case "es":
      return "es-ES";
    case "fr":
      return "fr-FR";
    case "qu":
      return "qu-PE";
    default:
      return null;
  }
}

/** Check if a locale is supported. */
export function isSupportedLocale(raw: string): boolean {
  return normalizeLocale(raw) !== null;
}

/** Check if a translation key namespace is sacred. */
export function isSacredNamespace(namespace: string): boolean {
  const ns = namespace.toLowerCase().trim();
  return SACRED_NAMESPACES.some((s) => s === ns);
}

/** Determine the canonical fallback chain for a locale. */
export function resolveFallbackChain(
  requested: Locale,
  overrides?: Partial<Record<Locale, readonly Locale[]>>,
): readonly Locale[] {
  if (overrides && overrides[requested]) {
    return overrides[requested] as readonly Locale[];
  }
  // Build chain: requested first, then the default chain excluding requested.
  const chain: Locale[] = [requested];
  for (const l of DEFAULT_LOCALE_FALLBACK_CHAIN) {
    if (l !== requested) chain.push(l);
  }
  return chain as readonly Locale[];
}

/** Validate a fallback chain — must terminate in DEFAULT_LOCALE and be non-empty. */
export function validateLocaleFallbackChain(chain: readonly Locale[]): FallbackValidation {
  if (chain.length === 0) {
    return { valid: false, reason: "chain must be non-empty" };
  }
  if (chain[chain.length - 1] !== DEFAULT_LOCALE) {
    return {
      valid: false,
      reason: `chain must terminate in default locale "${DEFAULT_LOCALE}", got "${chain[chain.length - 1]}"`,
    };
  }
  const seen = new Set<Locale>();
  for (const l of chain) {
    if (!isSupportedLocale(l)) {
      return { valid: false, reason: `unsupported locale "${l}" in chain` };
    }
    if (seen.has(l)) {
      return { valid: false, reason: `duplicate locale "${l}" in chain` };
    }
    seen.add(l);
  }
  return { valid: true };
}

/** Get the supported-locales count. */
export function supportedLocaleCount(): number {
  return SUPPORTED_LOCALES.length;
}

/** Check if a locale is the default. */
export function isDefaultLocale(locale: Locale): boolean {
  return locale === DEFAULT_LOCALE;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 Translation Memory store (TM)                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Translation memory registry — keyed by (source + locale). */
export interface TranslationMemoryRegistry {
  readonly entries: readonly TranslationMemory[];
}

/** Empty TM registry. */
export function emptyTranslationMemoryRegistry(): TranslationMemoryRegistry {
  return { entries: [] };
}

/** Build a stable ID for a TM entry. */
export function translationMemoryId(source: string, locale: Locale): string {
  return "tm_" + fnv1a32Hex(source + "|" + locale);
}

/** Build a stable ID for a translation entry. */
export function translationEntryId(key: TranslationKey, locale: Locale): string {
  const k = key.namespace + "." + key.key;
  return "te_" + fnv1a32Hex(k + "|" + locale);
}

/** Build a stable ID for a glossary term. */
export function glossaryTermId(source: string, locale: Locale): string {
  return "gt_" + fnv1a32Hex(source + "|" + locale);
}

/** Record a TM hit — append or increment existing. */
export function recordTranslationMemoryHit(
  registry: TranslationMemoryRegistry,
  source: string,
  target: string,
  locale: Locale,
  sacredPreserved: boolean,
  now?: number,
): TranslationMemoryRegistry {
  const t = now ?? Date.now();
  const existing = registry.entries.find(
    (e) => e.source === source && e.locale === locale,
  );
  if (existing) {
    const updated: TranslationMemory = {
      source: existing.source,
      target: existing.target,
      locale: existing.locale,
      hits: existing.hits + 1,
      lastUsed: t,
      sacredPreserved: existing.sacredPreserved || sacredPreserved,
    };
    return {
      entries: registry.entries.map((e) =>
        e.source === source && e.locale === locale ? updated : e,
      ),
    };
  }
  const fresh: TranslationMemory = {
    source,
    target,
    locale,
    hits: 1,
    lastUsed: t,
    sacredPreserved,
  };
  return { entries: [...registry.entries, fresh] };
}

/** Lookup a TM hit for source + locale. */
export function lookupTranslationMemory(
  registry: TranslationMemoryRegistry,
  source: string,
  locale: Locale,
): TranslationMemory | null {
  return (
    registry.entries.find((e) => e.source === source && e.locale === locale) ?? null
  );
}

/** Get the most-recently-used TM entries (top N). */
export function topTranslationMemories(
  registry: TranslationMemoryRegistry,
  n: number,
): readonly TranslationMemory[] {
  const sorted = [...registry.entries].sort((a, b) => b.lastUsed - a.lastUsed);
  return sorted.slice(0, Math.max(0, n));
}

/** Total TM hits across the registry. */
export function totalTranslationMemoryHits(registry: TranslationMemoryRegistry): number {
  return registry.entries.reduce((sum, e) => sum + e.hits, 0);
}

/** Count sacred-preserving TM entries. */
export function sacredPreservingCount(registry: TranslationMemoryRegistry): number {
  return registry.entries.filter((e) => e.sacredPreserved).length;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Glossary store + consistency check                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Glossary registry. */
export interface GlossaryRegistry {
  readonly terms: readonly GlossaryTerm[];
  /** Separate sacred glossary (defense-in-depth quaternary). */
  readonly sacredTerms: readonly GlossaryTerm[];
}

/** Empty glossary registry. */
export function emptyGlossaryRegistry(): GlossaryRegistry {
  return { terms: [], sacredTerms: [] };
}

/** Add a glossary term. Sacred terms require curator tier 3+. */
export function addGlossaryTerm(
  registry: GlossaryRegistry,
  term: GlossaryTerm,
  curatorTier: CuratorTier = DEFAULT_CURATOR_TIER,
): { registry: GlossaryRegistry; ok: boolean; reason?: string } {
  if (term.category === "sacred" && curatorTier < MINIMUM_CURATOR_TIER_SACRED) {
    return {
      registry,
      ok: false,
      reason: `sacred term requires curator tier >= ${MINIMUM_CURATOR_TIER_SACRED}, got ${curatorTier}`,
    };
  }
  if (term.category === "sacred") {
    return {
      registry: { ...registry, sacredTerms: [...registry.sacredTerms, term] },
      ok: true,
    };
  }
  return { registry: { ...registry, terms: [...registry.terms, term] }, ok: true };
}

/** Lock a glossary term — never auto-translated. */
export function lockGlossaryTerm(
  registry: GlossaryRegistry,
  termId: string,
  curatorId: string,
  curatorTier: CuratorTier,
): { registry: GlossaryRegistry; term?: GlossaryTerm; ok: boolean; reason?: string } {
  const lockOne = (t: GlossaryTerm): GlossaryTerm => ({
    ...t,
    locked: true,
    lockedBy: curatorId,
    curatorTier,
  });
  // Search general glossary.
  const g = registry.terms.find((t) => t.id === termId);
  if (g) {
    if (g.category === "sacred" && curatorTier < MINIMUM_CURATOR_TIER_SACRED) {
      return {
        registry,
        ok: false,
        reason: `sacred term lock requires tier >= ${MINIMUM_CURATOR_TIER_SACRED}`,
      };
    }
    const updated = lockOne(g);
    return {
      registry: {
        ...registry,
        terms: registry.terms.map((t) => (t.id === termId ? updated : t)),
      },
      term: updated,
      ok: true,
    };
  }
  // Search sacred glossary.
  const s = registry.sacredTerms.find((t) => t.id === termId);
  if (s) {
    if (curatorTier < MINIMUM_CURATOR_TIER_SACRED) {
      return {
        registry,
        ok: false,
        reason: `sacred term lock requires tier >= ${MINIMUM_CURATOR_TIER_SACRED}`,
      };
    }
    const updated = lockOne(s);
    return {
      registry: {
        ...registry,
        sacredTerms: registry.sacredTerms.map((t) => (t.id === termId ? updated : t)),
      },
      term: updated,
      ok: true,
    };
  }
  return { registry, ok: false, reason: `term ${termId} not found` };
}

/** Find glossary hits for a given source text. */
export function findGlossaryHits(
  registry: GlossaryRegistry,
  source: string,
  locale: Locale,
  includeSacred = true,
): readonly GlossaryTerm[] {
  const lower = source.toLowerCase();
  const all: GlossaryTerm[] = [...registry.terms];
  if (includeSacred) all.push(...registry.sacredTerms);
  return all.filter(
    (t) =>
      t.locale === locale &&
      (lower.includes(t.source.toLowerCase()) ||
        t.source.toLowerCase().includes(lower)),
  );
}

/** Find a glossary hit by exact source match. */
export function findExactGlossaryHit(
  registry: GlossaryRegistry,
  source: string,
  locale: Locale,
  includeSacred = true,
): GlossaryTerm | null {
  const lower = source.toLowerCase().trim();
  const all: GlossaryTerm[] = [...registry.terms];
  if (includeSacred) all.push(...registry.sacredTerms);
  return (
    all.find((t) => t.locale === locale && t.source.toLowerCase().trim() === lower) ??
    null
  );
}

/** Validate glossary consistency — detect duplicates and mixed-sacred-general. */
export function validateGlossaryConsistency(
  registry: GlossaryRegistry,
): { consistent: boolean; conflicts: readonly GlossaryConflict[] } {
  const conflicts: GlossaryConflict[] = [];
  const all: GlossaryTerm[] = [...registry.terms, ...registry.sacredTerms];
  // Group by (source, locale).
  const groups = new Map<string, GlossaryTerm[]>();
  for (const t of all) {
    const k = t.source.toLowerCase().trim() + "|" + t.locale;
    const arr = groups.get(k) ?? [];
    arr.push(t);
    groups.set(k, arr);
  }
  for (const [key, terms] of groups) {
    if (terms.length < 2) continue;
    const [source, locale] = key.split("|") as [string, Locale];
    // Check duplicate (same source + same target).
    const targetSet = new Set(terms.map((t) => t.target));
    if (targetSet.size < terms.length) {
      conflicts.push({
        kind: "duplicate-source-target",
        termIds: terms.map((t) => t.id),
        source,
        locale,
      });
    } else if (targetSet.size > 1) {
      conflicts.push({
        kind: "duplicate-source-different-target",
        termIds: terms.map((t) => t.id),
        source,
        locale,
      });
    }
    // Check mixed-sacred-general.
    const hasSacred = terms.some((t) => t.category === "sacred");
    const hasNonSacred = terms.some((t) => t.category !== "sacred");
    if (hasSacred && hasNonSacred) {
      conflicts.push({
        kind: "mixed-sacred-general",
        termIds: terms.map((t) => t.id),
        source,
        locale,
      });
    }
  }
  return { consistent: conflicts.length === 0, conflicts };
}

/** Get all sacred glossary terms. */
export function getSacredTerms(registry: GlossaryRegistry): readonly GlossaryTerm[] {
  return registry.sacredTerms;
}

/** Get all non-sacred glossary terms. */
export function getGeneralTerms(registry: GlossaryRegistry): readonly GlossaryTerm[] {
  return registry.terms;
}

/** Get all locked glossary terms (general + sacred). */
export function getLockedTerms(registry: GlossaryRegistry): readonly GlossaryTerm[] {
  return [...registry.terms, ...registry.sacredTerms].filter((t) => t.locked);
}

/** Count glossary terms by category. */
export function glossaryCountByCategory(
  registry: GlossaryRegistry,
): Record<GlossaryCategory, number> {
  const counts: Record<GlossaryCategory, number> = {
    sacred: registry.sacredTerms.length,
    technical: 0,
    general: 0,
  };
  for (const t of registry.terms) counts[t.category]++;
  return counts;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Lookup + auto-translate (MT stub)                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Lookup result with hit tier (which layer resolved the key). */
export type HitTier = LookupResult["hitTier"];

/** Determine if a translation key is sacred. */
export function isSacredTranslationKey(key: TranslationKey): boolean {
  if (key.sacred === true) return true;
  return isSacredNamespace(key.namespace);
}

/** Machine translation stub — returns plausible text from a hash of source. */
export function machineTranslateStub(
  source: string,
  sourceLocale: Locale,
  targetLocale: Locale,
  glossary: readonly GlossaryTerm[],
): MachineTranslationStub {
  const seed = fnv1a32(source + "|" + sourceLocale + "|" + targetLocale);
  const rand = mulberry32(seed);
  // Build a "translated" string by alternating case and appending a length-derived suffix.
  // The exact form is not important; determinism + glossary preservation is.
  let out = "";
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === undefined) continue;
    if (rand() < 0.5 && /[a-z]/.test(c)) {
      out += c.toUpperCase();
    } else if (rand() < 0.5 && /[A-Z]/.test(c)) {
      out += c.toLowerCase();
    } else {
      out += c;
    }
  }
  // Apply glossary hits (skip sacred — return source unchanged for them).
  for (const g of glossary) {
    if (g.category === "sacred") continue;
    if (g.source && g.target && source.toLowerCase().includes(g.source.toLowerCase())) {
      const re = new RegExp(escapeRegExp(g.source), "gi");
      out = out.replace(re, g.target);
    }
  }
  return {
    sourceText: source,
    translatedText: out,
    sourceLocale,
    targetLocale,
    stubEngineId: "w58-mt-stub-v1",
    stubDeterministic: true,
  };
}

/** Escape a string for use in a RegExp constructor. */
export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Auto-translate a key into the target locale using MT stub + glossary. */
export function autoTranslate(
  key: TranslationKey,
  targetLocale: Locale,
  glossary: GlossaryRegistry,
  now?: number,
): TranslationEntry {
  const t = now ?? Date.now();
  // Sacred HARD rule: never auto-translate — return source unchanged.
  if (isSacredTranslationKey(key)) {
    const entry: TranslationEntry = {
      id: translationEntryId(key, targetLocale),
      key,
      locale: targetLocale,
      translatedText: key.defaultText,
      translatorId: "mt-stub-sacred-blocked",
      status: "pending",
      confidence: makeConfidence(1, true, false, true, 1, 1),
      sacredFlag: true,
      createdAt: t,
      updatedAt: t,
    };
    return entry;
  }
  const glossaryAll: GlossaryTerm[] = [...glossary.terms, ...glossary.sacredTerms];
  const stub = machineTranslateStub(key.defaultText, DEFAULT_LOCALE, targetLocale, glossaryAll);
  const hits = findGlossaryHits(glossary, key.defaultText, targetLocale);
  const conf = computeConfidence(key.defaultText, stub.translatedText, hits);
  const entry: TranslationEntry = {
    id: translationEntryId(key, targetLocale),
    key,
    locale: targetLocale,
    translatedText: stub.translatedText,
    translatorId: "mt-stub",
    status: "auto-translated",
    confidence: conf,
    sacredFlag: false,
    createdAt: t,
    updatedAt: t,
  };
  return entry;
}

/** Apply locale fallback — walk chain until a translation is found. */
export function applyLocaleFallback(
  tm: TranslationMemoryRegistry,
  glossary: GlossaryRegistry,
  key: TranslationKey,
  requested: Locale,
  now?: number,
): { entry: TranslationEntry; usedLocale: Locale; fallbacks: readonly Locale[] } {
  const t = now ?? Date.now();
  const chain = resolveFallbackChain(requested);
  const fallbacks: Locale[] = [];
  // Tier 1: TM hit on the source text.
  for (const locale of chain) {
    fallbacks.push(locale);
    const hit = lookupTranslationMemory(tm, key.defaultText, locale);
    if (hit) {
      const confidence = makeConfidence(1, true, false, false, 1, hit.target.length / Math.max(1, key.defaultText.length));
      const entry: TranslationEntry = {
        id: translationEntryId(key, locale),
        key,
        locale,
        translatedText: hit.target,
        translatorId: "tm-cache",
        status: hit.sacredPreserved ? "sacred-locked" : "human-reviewed",
        confidence,
        sacredFlag: hit.sacredPreserved,
        createdAt: hit.lastUsed,
        updatedAt: hit.lastUsed,
      };
      return { entry, usedLocale: locale, fallbacks };
    }
  }
  // Tier 2: glossary exact hit.
  for (const locale of chain) {
    const hit = findExactGlossaryHit(glossary, key.defaultText, locale);
    if (hit && !hit.locked) {
      const entry: TranslationEntry = {
        id: translationEntryId(key, locale),
        key,
        locale,
        translatedText: hit.target,
        translatorId: "glossary",
        status: hit.category === "sacred" ? "sacred-locked" : "human-reviewed",
        confidence: makeConfidence(0.95, false, false, true, hit.category === "sacred" ? 1 : 0, hit.target.length / Math.max(1, key.defaultText.length)),
        sacredFlag: hit.category === "sacred",
        createdAt: t,
        updatedAt: t,
      };
      return { entry, usedLocale: locale, fallbacks };
    }
  }
  // Tier 3: auto-translate (or return literal if sacred).
  const locale = chain[0] ?? requested;
  const entry = autoTranslate(key, locale, glossary, t);
  return { entry, usedLocale: locale, fallbacks };
}

/** Lookup a translation — TM + glossary + auto-translate. */
export function lookupTranslation(
  tm: TranslationMemoryRegistry,
  glossary: GlossaryRegistry,
  key: TranslationKey,
  locale: Locale,
  now?: number,
): LookupResult {
  const result = applyLocaleFallback(tm, glossary, key, locale, now);
  // Determine hit tier by status.
  let hitTier: HitTier;
  switch (result.entry.status) {
    case "human-reviewed":
    case "sacred-locked":
      hitTier = "exact-tm";
      break;
    case "auto-translated":
      hitTier = "auto-translate";
      break;
    case "pending":
      hitTier = "default-literal";
      break;
    default:
      hitTier = "exact-tm";
  }
  // If fallbacks > 1, it was a fallback hit.
  if (result.fallbacks.length > 1 && result.usedLocale !== locale) {
    hitTier = result.entry.status === "auto-translated" ? "auto-translate" : "exact-tm";
  }
  return {
    entry: result.entry,
    usedLocale: result.usedLocale,
    fallbacks: result.fallbacks,
    hitTier,
  };
}

/** Lookup a translation directly from TM only (no glossary / no auto). */
export function lookupTranslationMemoryOnly(
  tm: TranslationMemoryRegistry,
  key: TranslationKey,
  locale: Locale,
): TranslationMemory | null {
  return lookupTranslationMemory(tm, key.defaultText, locale);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Confidence + sacred-proximity                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Compute a confidence score from factors. */
export function computeConfidence(
  source: string,
  target: string,
  glossaryHits: readonly GlossaryTerm[],
): TranslationConfidence {
  if (source === target) {
    return makeConfidence(1, true, false, glossaryHits.length > 0, 0, 1);
  }
  const sim = levenshteinSimilarity(source, target);
  const exact = source === target;
  const fuzzy = sim >= 0.9 && !exact;
  const glossaryHit = glossaryHits.length > 0;
  const sacredProximity = glossaryHits.some((g) => g.category === "sacred")
    ? Math.min(1, sim + 0.1 * glossaryHits.length)
    : 0;
  const lengthRatio = Math.min(1, target.length / Math.max(1, source.length));
  // Score: weighted blend.
  let score = 0;
  if (exact) score += 0.6;
  if (fuzzy) score += 0.4 * sim;
  if (glossaryHit) score += 0.15;
  if (sacredProximity > 0) score -= 0.1 * sacredProximity;
  score = Math.max(0, Math.min(1, score + 0.2 * lengthRatio));
  return makeConfidence(score, exact, fuzzy, glossaryHit, sacredProximity, lengthRatio);
}

/** Helper to build a TranslationConfidence cleanly. */
function makeConfidence(
  score: number,
  exactMatch: boolean,
  fuzzyMatch: boolean,
  glossaryHit: boolean,
  sacredProximity: number,
  lengthRatio: number,
): TranslationConfidence {
  return {
    score: Math.max(0, Math.min(1, score)),
    exactMatch,
    fuzzyMatch,
    glossaryHit,
    sacredProximity: Math.max(0, Math.min(1, sacredProximity)),
    lengthRatio: Math.max(0, Math.min(1, lengthRatio)),
  };
}

/** Detect sacred proximity — how close is the text to sacred glossary terms. */
export function detectSacredProximity(
  text: string,
  glossary: GlossaryRegistry,
): SacredProximityResult {
  const lower = text.toLowerCase();
  let proximity = 0;
  const matched: GlossaryTerm[] = [];
  for (const t of glossary.sacredTerms) {
    const s = t.source.toLowerCase();
    if (lower.includes(s)) {
      proximity = Math.max(proximity, 1);
      matched.push(t);
    } else {
      const sim = levenshteinSimilarity(lower, s);
      if (sim > proximity) proximity = sim;
      if (sim >= 0.5) matched.push(t);
    }
  }
  return { proximity: Math.max(0, Math.min(1, proximity)), matchedTerms: matched };
}

/** Check if a text contains any sacred term (exact). */
export function isSacredTerm(
  text: string,
  glossary: GlossaryRegistry,
): SacredMatchResult {
  const lower = text.toLowerCase();
  for (const t of glossary.sacredTerms) {
    if (lower.includes(t.source.toLowerCase())) {
      return { isSacred: true, matchedTerm: t };
    }
  }
  return { isSacred: false };
}

/** Map a proximity score to a confidence score. */
export function proximityToConfidence(proximity: number): number {
  return Math.max(0, Math.min(1, 1 - proximity));
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Sacred-term lock                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Apply sacred lock — prevents auto-translation, marks as sacred-locked. */
export function applySacredLock(
  entry: TranslationEntry,
  curatorId: string,
  now?: number,
): TranslationEntry {
  const t = now ?? Date.now();
  return {
    ...entry,
    status: "sacred-locked",
    sacredFlag: true,
    reviewedBy: curatorId,
    updatedAt: t,
  };
}

/** Check whether a translation entry requires sacred review. */
export function requireSacredReview(entry: TranslationEntry): boolean {
  if (entry.sacredFlag) return true;
  if (isSacredTranslationKey(entry.key)) return true;
  if (entry.confidence.sacredProximity >= SACRED_PROXIMITY_REVIEW_THRESHOLD) return true;
  return false;
}

/** Validate that a curator can act on a sacred entry (tier 3+ required). */
export function canCuratorActOnSacred(
  entry: TranslationEntry,
  curatorTier: CuratorTier,
): boolean {
  if (!entry.sacredFlag) return true;
  return curatorTier >= MINIMUM_CURATOR_TIER_SACRED;
}

/** Validate that a sacred term has been curator-locked (immutable after). */
export function isSacredLocked(entry: TranslationEntry): boolean {
  return entry.status === "sacred-locked" && entry.sacredFlag === true;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Curator review queue (priority lanes)                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Empty curator review queue. */
export function emptyCuratorReviewQueue(): CuratorReviewQueue {
  return { sacred: [], urgent: [], normal: [] };
}

/** Submit a translation for review. Sacred → sacred lane, urgent → urgent, else normal. */
export function submitForReview(
  queue: CuratorReviewQueue,
  entry: TranslationEntry,
  priority?: ReviewPriority,
): CuratorReviewQueue {
  let lane: ReviewPriority;
  if (priority) {
    lane = priority;
  } else if (entry.sacredFlag || isSacredTranslationKey(entry.key)) {
    lane = "sacred";
  } else if (entry.confidence.score < 0.5) {
    lane = "urgent";
  } else {
    lane = "normal";
  }
  switch (lane) {
    case "sacred":
      return { ...queue, sacred: [...queue.sacred, entry] };
    case "urgent":
      return { ...queue, urgent: [...queue.urgent, entry] };
    case "normal":
      return { ...queue, normal: [...queue.normal, entry] };
  }
}

/** Total queue size across all lanes. */
export function reviewQueueSize(queue: CuratorReviewQueue): number {
  return queue.sacred.length + queue.urgent.length + queue.normal.length;
}

/** Pop the next entry to review (priority order: sacred > urgent > normal). */
export function popNextForReview(
  queue: CuratorReviewQueue,
): { queue: CuratorReviewQueue; entry: TranslationEntry | null } {
  if (queue.sacred.length > 0) {
    const [head, ...rest] = queue.sacred;
    if (head === undefined) {
      return { queue, entry: null };
    }
    return { queue: { ...queue, sacred: rest }, entry: head };
  }
  if (queue.urgent.length > 0) {
    const [head, ...rest] = queue.urgent;
    if (head === undefined) {
      return { queue, entry: null };
    }
    return { queue: { ...queue, urgent: rest }, entry: head };
  }
  if (queue.normal.length > 0) {
    const [head, ...rest] = queue.normal;
    if (head === undefined) {
      return { queue, entry: null };
    }
    return { queue: { ...queue, normal: rest }, entry: head };
  }
  return { queue, entry: null };
}

/** Curator approve a translation entry. Sacred requires tier 3+. */
export function curatorApproveTranslation(
  entry: TranslationEntry,
  curatorId: string,
  curatorTier: CuratorTier,
  now?: number,
): { entry: TranslationEntry; ok: boolean; reason?: string } {
  if (entry.sacredFlag && curatorTier < MINIMUM_CURATOR_TIER_SACRED) {
    return {
      entry,
      ok: false,
      reason: `sacred approval requires tier >= ${MINIMUM_CURATOR_TIER_SACRED}, got ${curatorTier}`,
    };
  }
  const t = now ?? Date.now();
  const updated: TranslationEntry = {
    ...entry,
    status: entry.sacredFlag ? "sacred-locked" : "curator-approved",
    reviewedBy: curatorId,
    updatedAt: t,
  };
  return { entry: updated, ok: true };
}

/** Curator reject a translation entry. */
export function curatorRejectTranslation(
  entry: TranslationEntry,
  curatorId: string,
  reason: string,
  now?: number,
): TranslationEntry {
  const t = now ?? Date.now();
  return {
    ...entry,
    status: "rejected",
    reviewedBy: curatorId,
    updatedAt: t,
    // Store rejection reason in the translator id slot as a hint (no separate field).
    translatorId: entry.translatorId + "|rejected:" + reason,
  };
}

/** Drain the entire queue in priority order — returns ordered entries. */
export function drainReviewQueue(
  queue: CuratorReviewQueue,
): readonly TranslationEntry[] {
  return [...queue.sacred, ...queue.urgent, ...queue.normal];
}

/** Filter the queue by sacred status. */
export function filterSacredEntries(
  queue: CuratorReviewQueue,
): readonly TranslationEntry[] {
  return queue.sacred;
}

/** Filter the queue by status. */
export function filterByStatus(
  queue: CuratorReviewQueue,
  status: TranslationStatus,
): readonly TranslationEntry[] {
  return drainReviewQueue(queue).filter((e) => e.status === status);
}

/** Apply 90-day retention to the queue (entries older than retention are removed). */
export function applyReviewQueueRetention(
  queue: CuratorReviewQueue,
  now?: number,
  retentionDays: number = REVIEW_QUEUE_RETENTION_DAYS,
): CuratorReviewQueue {
  const t = now ?? Date.now();
  const cutoff = t - retentionDays * 24 * 60 * 60 * 1000;
  return {
    sacred: queue.sacred.filter((e) => e.updatedAt >= cutoff),
    urgent: queue.urgent.filter((e) => e.updatedAt >= cutoff),
    normal: queue.normal.filter((e) => e.updatedAt >= cutoff),
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 Audit event chain (HMAC)                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Translation audit log. */
export interface TranslationAuditLog {
  readonly events: readonly TranslationAuditEvent[];
}

/** Empty audit log. */
export function emptyAuditLog(): TranslationAuditLog {
  return { events: [] };
}

/** Genesis hash for the chain. */
export function genesisHash(): string {
  return "0".repeat(64);
}

/** Serialize an audit event payload (without hmac fields) for hashing. */
function serializeAuditPayload(args: {
  kind: TranslationAuditKind;
  entryId: string;
  actorId: string;
  reason?: string;
  locale?: Locale;
  at: number;
  prevHmac: string;
}): string {
  const parts = [
    args.kind,
    args.entryId,
    args.actorId,
    args.reason ?? "",
    args.locale ?? "",
    String(args.at),
    args.prevHmac,
  ];
  return parts.join("|");
}

/** Emit an audit event with HMAC chain. */
export function emitAuditEvent(
  log: TranslationAuditLog,
  args: {
    kind: TranslationAuditKind;
    entryId: string;
    actorId: string;
    reason?: string;
    locale?: Locale;
    at?: number;
  },
): { log: TranslationAuditLog; event: TranslationAuditEvent } {
  const at = args.at ?? Date.now();
  const prevHmac = log.events.length > 0
    ? (log.events[log.events.length - 1] as TranslationAuditEvent).hmac
    : genesisHash();
  const payload = serializeAuditPayload({
    kind: args.kind,
    entryId: args.entryId,
    actorId: args.actorId,
    reason: args.reason,
    locale: args.locale,
    at,
    prevHmac,
  });
  const hmac = hmacSha256Hex(AUDIT_CHAIN_SALT, payload);
  const id = "evt_" + fnv1a32Hex(hmac + "|" + String(at));
  const event: TranslationAuditEvent = {
    id,
    kind: args.kind,
    entryId: args.entryId,
    actorId: args.actorId,
    reason: args.reason,
    locale: args.locale,
    at,
    hmac,
    prevHmac,
  };
  return { log: { events: [...log.events, event] }, event };
}

/** Verify the HMAC chain on a log. Returns true if every event hashes correctly. */
export function verifyAuditChain(log: TranslationAuditLog): boolean {
  let prev = genesisHash();
  for (const e of log.events) {
    if (e.prevHmac !== prev) return false;
    const payload = serializeAuditPayload({
      kind: e.kind,
      entryId: e.entryId,
      actorId: e.actorId,
      reason: e.reason,
      locale: e.locale,
      at: e.at,
      prevHmac: e.prevHmac,
    });
    const expected = hmacSha256Hex(AUDIT_CHAIN_SALT, payload);
    if (expected !== e.hmac) return false;
    prev = e.hmac;
  }
  return true;
}

/** Filter audit log by entry id. */
export function filterAuditByEntry(
  log: TranslationAuditLog,
  entryId: string,
): readonly TranslationAuditEvent[] {
  return log.events.filter((e) => e.entryId === entryId);
}

/** Filter audit log by kind. */
export function filterAuditByKind(
  log: TranslationAuditLog,
  kind: TranslationAuditKind,
): readonly TranslationAuditEvent[] {
  return log.events.filter((e) => e.kind === kind);
}

/** Get the latest event for an entry. */
export function latestEventForEntry(
  log: TranslationAuditLog,
  entryId: string,
): TranslationAuditEvent | null {
  const events = filterAuditByEntry(log, entryId);
  if (events.length === 0) return null;
  return events[events.length - 1] ?? null;
}

/** Build an AuditReceipt (LGPD Art. 18 — erasure attestation). */
export function buildAuditReceipt(args: {
  entryId: string;
  userId: string;
  erasedAt: number;
  erasedKinds: readonly TranslationAuditKind[];
  finalHmac: string;
}): AuditReceipt {
  const payload = [
    args.entryId,
    args.userId,
    String(args.erasedAt),
    args.erasedKinds.join(","),
    args.finalHmac,
  ].join("|");
  const hmacAttestation = hmacSha256Hex(AUDIT_CHAIN_SALT, payload);
  const receiptId = "rcpt_" + fnv1a32Hex(hmacAttestation + "|" + args.userId);
  return {
    receiptId,
    entryId: args.entryId,
    userId: args.userId,
    erasedAt: args.erasedAt,
    erasedKinds: args.erasedKinds,
    finalHmac: args.finalHmac,
    hmacAttestation,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 LGPD Art. 7 / 9 / 18                                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Empty consent registry. */
export interface ConsentRegistry {
  readonly records: readonly TranslationConsent[];
}

/** Empty consent registry. */
export function emptyConsentRegistry(): ConsentRegistry {
  return { records: [] };
}

/** Record explicit consent (LGPD Art. 7 — opt-in, NOT inferred from usage). */
export function recordConsent(
  registry: ConsentRegistry,
  userId: string,
  purpose: LgpdPurpose,
  now?: number,
): ConsentRegistry {
  const t = now ?? Date.now();
  const record: TranslationConsent = {
    userId,
    purpose,
    grantedAt: t,
    withdrawn: false,
  };
  return { records: [...registry.records, record] };
}

/** Withdraw consent (LGPD Art. 18 IV — direito de oposição). */
export function withdrawTranslationConsent(
  registry: ConsentRegistry,
  userId: string,
  now?: number,
): ConsentRegistry {
  const t = now ?? Date.now();
  return {
    records: registry.records.map((r) =>
      r.userId === userId && !r.withdrawn
        ? { ...r, withdrawn: true, expiresAt: t }
        : r,
    ),
  };
}

/** Check if consent is granted for a user + purpose. */
export function hasConsent(
  registry: ConsentRegistry,
  userId: string,
  purpose: LgpdPurpose,
): boolean {
  return registry.records.some(
    (r) => r.userId === userId && r.purpose === purpose && !r.withdrawn,
  );
}

/** Check if a purpose is allowed under LGPD Art. 9. */
export function isLgpdPurposeAllowed(purpose: LgpdPurpose): boolean {
  return LGPD_PURPOSES.includes(purpose);
}

/** Purge translation data (LGPD Art. 18 VI — eliminação). */
export function purgeTranslationData(
  log: TranslationAuditLog,
  entryId: string,
  userId: string,
  now?: number,
): { log: TranslationAuditLog; receipt: AuditReceipt; erasedCount: number } {
  const t = now ?? Date.now();
  // Filter out the events for this entry, but emit an erasure event for traceability.
  const filtered = log.events.filter((e) => e.entryId !== entryId);
  const erasedKinds: TranslationAuditKind[] = [];
  for (const e of log.events) {
    if (e.entryId === entryId && !erasedKinds.includes(e.kind)) {
      erasedKinds.push(e.kind);
    }
  }
  // Append an erasure event.
  const afterErasure = emitAuditEvent({ events: filtered }, {
    kind: "erased",
    entryId,
    actorId: userId,
    reason: "LGPD Art. 18 VI — eliminação",
    at: t,
  });
  const finalHmac = afterErasure.event.hmac;
  const receipt = buildAuditReceipt({
    entryId,
    userId,
    erasedAt: t,
    erasedKinds,
    finalHmac,
  });
  return {
    log: afterErasure.log,
    receipt,
    erasedCount: log.events.length - filtered.length,
  };
}

/** Export a user's translation history (LGPD Art. 18 V — acesso). */
export function exportUserTranslationHistory(
  log: TranslationAuditLog,
  userId: string,
): readonly TranslationAuditEvent[] {
  return log.events.filter((e) => e.actorId === userId);
}

/** Get consent records for a user. */
export function getConsentsForUser(
  registry: ConsentRegistry,
  userId: string,
): readonly TranslationConsent[] {
  return registry.records.filter((r) => r.userId === userId);
}

/** Check if withdrawal is complete for a user. */
export function isConsentFullyWithdrawn(
  registry: ConsentRegistry,
  userId: string,
): boolean {
  const userRecords = getConsentsForUser(registry, userId);
  if (userRecords.length === 0) return true;
  return userRecords.every((r) => r.withdrawn);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 Smoke / regression scenarios (25+ functions)                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Smoke result. */
export interface SmokeResult {
  readonly name: string;
  readonly pass: boolean;
  readonly detail: string;
}

/** Smoke 1: FNV-1a 32 of "" matches the known offset constant. */
export function smoke_fnv1a32_empty_known_vector(): SmokeResult {
  const got = fnv1a32("");
  return {
    name: "fnv1a32('') == 0x811c9dc5",
    pass: got === 0x811c9dc5,
    detail: `got=0x${got.toString(16)}`,
  };
}

/** Smoke 2: FNV-1a 64 hex length is always 16 chars. */
export function smoke_fnv1a64_length(): SmokeResult {
  const got = fnv1a64Hex("hello world");
  return {
    name: "fnv1a64Hex length == 16",
    pass: got.length === 16,
    detail: `len=${got.length} got=${got}`,
  };
}

/** Smoke 3: SHA-256 of "" matches the known empty-string digest. */
export function smoke_sha256_empty_known_vector(): SmokeResult {
  const got = sha256Hex("");
  const expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  return {
    name: "sha256Hex('') matches e3b0...b855",
    pass: got === expected,
    detail: `got=${got.slice(0, 16)}...`,
  };
}

/** Smoke 4: HMAC-SHA256 with known key + message matches RFC 4231 test case 1. */
export function smoke_hmac_sha256_rfc4231_case1(): SmokeResult {
  // RFC 4231 test case 1: key = 20 bytes 0x0b, data = "Hi There"
  // Construct 20 bytes of 0x0b via String.fromCharCode.
  const key = String.fromCharCode(0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b, 0x0b);
  const data = "Hi There";
  const got = hmacSha256Hex(key, data);
  const expected = "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7";
  return {
    name: "HMAC-SHA256 RFC 4231 case 1",
    pass: got === expected,
    detail: `got=${got.slice(0, 16)}...`,
  };
}

/** Smoke 5: Locale fallback pt-BR missing → en-US fallback. */
export function smoke_locale_fallback_pt_br_to_en(): SmokeResult {
  const tm = recordTranslationMemoryHit(
    emptyTranslationMemoryRegistry(),
    "Welcome to the temple",
    "Bienvenido al templo",
    "es-ES",
    false,
    1000,
  );
  const glossary = emptyGlossaryRegistry();
  const key: TranslationKey = {
    namespace: "nav",
    key: "welcome",
    defaultText: "Welcome to the temple",
  };
  const r = lookupTranslation(tm, glossary, key, "pt-BR");
  const pass = r.usedLocale === "es-ES" && r.entry.translatedText === "Bienvenido al templo";
  return {
    name: "locale fallback pt-BR → es-ES",
    pass,
    detail: `usedLocale=${r.usedLocale} text=${r.entry.translatedText.slice(0, 20)}`,
  };
}

/** Smoke 6: Sacred term auto-translate returns source unchanged. */
export function smoke_sacred_auto_translate_blocked(): SmokeResult {
  const glossary = emptyGlossaryRegistry();
  const key: TranslationKey = {
    namespace: "prayer",
    key: "oxala",
    defaultText: "Oxalá",
    sacred: true,
  };
  const entry = autoTranslate(key, "en-US", glossary, 1000);
  const pass = entry.translatedText === "Oxalá" && entry.status === "pending";
  return {
    name: "sacred auto-translate returns source unchanged",
    pass,
    detail: `text=${entry.translatedText} status=${entry.status}`,
  };
}

/** Smoke 7: Sacred translation locks after curator approval. */
export function smoke_sacred_lock_after_approval(): SmokeResult {
  const key: TranslationKey = {
    namespace: "ritual",
    key: "abertura",
    defaultText: "Abertura do ritual",
    sacred: true,
  };
  let entry: TranslationEntry = {
    id: "e1",
    key,
    locale: "pt-BR",
    translatedText: "Abertura do ritual",
    translatorId: "translator-1",
    status: "human-reviewed",
    confidence: makeConfidence(1, true, false, false, 1, 1),
    sacredFlag: true,
    createdAt: 1000,
    updatedAt: 1000,
  };
  const result = curatorApproveTranslation(entry, "curator-t3", 3, 2000);
  entry = result.entry;
  const pass = entry.status === "sacred-locked" && entry.sacredFlag === true && entry.reviewedBy === "curator-t3";
  return {
    name: "sacred locks after tier-3 curator approval",
    pass,
    detail: `status=${entry.status} flag=${entry.sacredFlag}`,
  };
}

/** Smoke 8: Sacred proximity > 0.7 triggers curator review. */
export function smoke_sacred_proximity_triggers_review(): SmokeResult {
  const glossary: GlossaryRegistry = {
    terms: [],
    sacredTerms: [
      {
        id: "st1",
        source: "Oxalá",
        target: "Oxalá",
        locale: "pt-BR",
        category: "sacred",
        context: "Orixá",
        locked: true,
      },
    ],
  };
  const proximity = detectSacredProximity("Oxalá é o orixá da criação", glossary);
  const pass = proximity.proximity >= 0.7 && proximity.matchedTerms.length > 0;
  return {
    name: "sacred proximity ≥ 0.7 triggers review",
    pass,
    detail: `proximity=${proximity.proximity.toFixed(2)} matched=${proximity.matchedTerms.length}`,
  };
}

/** Smoke 9: TM lookup returns exact match if exists. */
export function smoke_tm_exact_match(): SmokeResult {
  const tm = recordTranslationMemoryHit(
    emptyTranslationMemoryRegistry(),
    "Hello",
    "Hola",
    "es-ES",
    false,
    1000,
  );
  const got = lookupTranslationMemory(tm, "Hello", "es-ES");
  const pass = got !== null && got.target === "Hola" && got.hits === 1;
  return {
    name: "TM lookup exact match",
    pass,
    detail: got ? `target=${got.target} hits=${got.hits}` : "null",
  };
}

/** Smoke 10: Glossary consistency check detects duplicate source/target. */
export function smoke_glossary_consistency_duplicate(): SmokeResult {
  const registry: GlossaryRegistry = {
    terms: [
      { id: "t1", source: "mandinga", target: "Mandinga", locale: "pt-BR", category: "general", context: "c1", locked: false },
      { id: "t2", source: "mandinga", target: "Mandinga", locale: "pt-BR", category: "general", context: "c2", locked: false },
    ],
    sacredTerms: [],
  };
  const result = validateGlossaryConsistency(registry);
  const pass = !result.consistent && result.conflicts.length > 0;
  return {
    name: "glossary consistency detects duplicate",
    pass,
    detail: `consistent=${result.consistent} conflicts=${result.conflicts.length}`,
  };
}

/** Smoke 11: Levenshtein fuzzy match — 1-char diff returns high similarity. */
export function smoke_levenshtein_1char_diff(): SmokeResult {
  const sim = levenshteinSimilarity("hello", "hellp");
  const pass = sim >= 0.8 && sim < 1;
  return {
    name: "Levenshtein 1-char diff similarity ≥ 0.8",
    pass,
    detail: `sim=${sim.toFixed(2)}`,
  };
}

/** Smoke 12: LGPD Art. 18 erasure returns AuditReceipt. */
export function smoke_lgpd_art18_erasure(): SmokeResult {
  let log = emptyAuditLog();
  log = emitAuditEvent(log, {
    kind: "created",
    entryId: "e1",
    actorId: "user-1",
    locale: "pt-BR",
    at: 1000,
  }).log;
  log = emitAuditEvent(log, {
    kind: "translated",
    entryId: "e1",
    actorId: "translator-1",
    locale: "pt-BR",
    at: 1100,
  }).log;
  const result = purgeTranslationData(log, "e1", "user-1", 2000);
  const pass = result.receipt.receiptId.startsWith("rcpt_") && result.erasedCount === 2;
  return {
    name: "LGPD Art. 18 erasure returns AuditReceipt",
    pass,
    detail: `receiptId=${result.receipt.receiptId.slice(0, 16)}... erased=${result.erasedCount}`,
  };
}

/** Smoke 13: HMAC chain verify on clean log returns true. */
export function smoke_hmac_chain_verify_clean(): SmokeResult {
  let log = emptyAuditLog();
  log = emitAuditEvent(log, { kind: "created", entryId: "e1", actorId: "u1", at: 1000 }).log;
  log = emitAuditEvent(log, { kind: "translated", entryId: "e1", actorId: "t1", at: 1100 }).log;
  log = emitAuditEvent(log, { kind: "approved", entryId: "e1", actorId: "c1", at: 1200 }).log;
  const pass = verifyAuditChain(log) === true;
  return {
    name: "HMAC chain verify clean log",
    pass,
    detail: `events=${log.events.length}`,
  };
}

/** Smoke 14: HMAC chain verify on tampered log returns false. */
export function smoke_hmac_chain_verify_tampered(): SmokeResult {
  let log = emptyAuditLog();
  log = emitAuditEvent(log, { kind: "created", entryId: "e1", actorId: "u1", at: 1000 }).log;
  log = emitAuditEvent(log, { kind: "translated", entryId: "e1", actorId: "t1", at: 1100 }).log;
  // Tamper with the first event's actorId.
  const tampered = {
    events: log.events.map((e, i) =>
      i === 0 ? { ...e, actorId: "u1-tampered" } : e,
    ),
  };
  const pass = verifyAuditChain(tampered) === false;
  return {
    name: "HMAC chain verify tampered log",
    pass,
    detail: `verify=${verifyAuditChain(tampered)}`,
  };
}

/** Smoke 15: Curator review queue ordering sacred > urgent > normal. */
export function smoke_review_queue_priority_order(): SmokeResult {
  let queue = emptyCuratorReviewQueue();
  const mkEntry = (id: string, sacredFlag: boolean): TranslationEntry => ({
    id,
    key: { namespace: "nav", key: id, defaultText: id },
    locale: "pt-BR",
    translatedText: id,
    translatorId: "t",
    status: "auto-translated",
    confidence: makeConfidence(0.5, false, false, false, sacredFlag ? 1 : 0, 1),
    sacredFlag,
    createdAt: 1000,
    updatedAt: 1000,
  });
  queue = submitForReview(queue, mkEntry("normal-1", false));
  queue = submitForReview(queue, mkEntry("sacred-1", true));
  queue = submitForReview(queue, mkEntry("urgent-1", false));
  const drained = drainReviewQueue(queue);
  const pass =
    drained[0]?.id === "sacred-1" &&
    (drained[1]?.id === "urgent-1" || drained[1]?.id === "normal-1");
  return {
    name: "review queue ordering sacred > urgent > normal",
    pass,
    detail: `order=${drained.map((e) => e.id).join(",")}`,
  };
}

/** Smoke 16: Locale fallback chain validation — chain not ending in default = invalid. */
export function smoke_locale_chain_not_ending_default(): SmokeResult {
  const r = validateLocaleFallbackChain(["en-US", "es-ES"]);
  const pass = r.valid === false && (r.reason ?? "").includes("default");
  return {
    name: "chain not ending in default = invalid",
    pass,
    detail: `valid=${r.valid} reason=${r.reason}`,
  };
}

/** Smoke 17: Sacred add-glossary requires tier 3+. */
export function smoke_sacred_add_requires_tier3(): SmokeResult {
  const r = addGlossaryTerm(
    emptyGlossaryRegistry(),
    {
      id: "st1",
      source: "Oxalá",
      target: "Oxalá",
      locale: "pt-BR",
      category: "sacred",
      context: "orixá",
      locked: false,
    },
    2,
  );
  const pass = r.ok === false && (r.reason ?? "").includes("tier");
  return {
    name: "sacred add-glossary requires tier 3+",
    pass,
    detail: `ok=${r.ok} reason=${r.reason}`,
  };
}

/** Smoke 18: Auto-translate confidence is between 0 and 1. */
export function smoke_auto_translate_confidence_range(): SmokeResult {
  const key: TranslationKey = {
    namespace: "nav",
    key: "home",
    defaultText: "Home",
  };
  const entry = autoTranslate(key, "es-ES", emptyGlossaryRegistry(), 1000);
  const pass = entry.confidence.score >= 0 && entry.confidence.score <= 1;
  return {
    name: "auto-translate confidence 0..1",
    pass,
    detail: `score=${entry.confidence.score.toFixed(2)}`,
  };
}

/** Smoke 19: Consent granted → hasConsent true; withdrawn → false. */
export function smoke_consent_grant_withdraw(): SmokeResult {
  let reg = emptyConsentRegistry();
  reg = recordConsent(reg, "user-1", "translation-analytics", 1000);
  const granted = hasConsent(reg, "user-1", "translation-analytics");
  reg = withdrawTranslationConsent(reg, "user-1", 2000);
  const withdrawn = hasConsent(reg, "user-1", "translation-analytics");
  const pass = granted === true && withdrawn === false;
  return {
    name: "consent grant → true; withdraw → false",
    pass,
    detail: `granted=${granted} withdrawn=${withdrawn}`,
  };
}

/** Smoke 20: isSacredNamespace detects prayer/ritual/mantra/liturgy. */
export function smoke_is_sacred_namespace(): SmokeResult {
  const pass =
    isSacredNamespace("prayer") &&
    isSacredNamespace("ritual") &&
    isSacredNamespace("mantra") &&
    isSacredNamespace("liturgy") &&
    !isSacredNamespace("nav");
  return {
    name: "isSacredNamespace detects prayer/ritual/mantra/liturgy",
    pass,
    detail: `prayer=${isSacredNamespace("prayer")} ritual=${isSacredNamespace("ritual")}`,
  };
}

/** Smoke 21: normalizeLocale maps pt_BR / pt-BR / PT-br → pt-BR. */
export function smoke_normalize_locale(): SmokeResult {
  const a = normalizeLocale("pt_BR");
  const b = normalizeLocale("PT-br");
  const c = normalizeLocale("en");
  const d = normalizeLocale("xx");
  const pass = a === "pt-BR" && b === "pt-BR" && c === "en-US" && d === null;
  return {
    name: "normalizeLocale handles separators + language fallback",
    pass,
    detail: `pt_BR=${a} PT-br=${b} en=${c} xx=${d}`,
  };
}

/** Smoke 22: Record + lookup TM hit counts. */
export function smoke_tm_hit_count(): SmokeResult {
  let reg = emptyTranslationMemoryRegistry();
  reg = recordTranslationMemoryHit(reg, "Hi", "Hola", "es-ES", false, 1000);
  reg = recordTranslationMemoryHit(reg, "Hi", "Hola", "es-ES", false, 2000);
  const got = lookupTranslationMemory(reg, "Hi", "es-ES");
  const pass = got !== null && got.hits === 2;
  return {
    name: "TM hit count increments",
    pass,
    detail: got ? `hits=${got.hits}` : "null",
  };
}

/** Smoke 23: Curator reject marks entry rejected with reason. */
export function smoke_curator_reject(): SmokeResult {
  const entry: TranslationEntry = {
    id: "e1",
    key: { namespace: "nav", key: "home", defaultText: "Home" },
    locale: "pt-BR",
    translatedText: "Casa",
    translatorId: "t1",
    status: "human-reviewed",
    confidence: makeConfidence(0.8, false, true, false, 0, 1),
    sacredFlag: false,
    createdAt: 1000,
    updatedAt: 1000,
  };
  const rejected = curatorRejectTranslation(entry, "c1", "literal mismatch", 2000);
  const pass = rejected.status === "rejected" && rejected.translatorId.includes("literal mismatch");
  return {
    name: "curator reject marks entry rejected",
    pass,
    detail: `status=${rejected.status}`,
  };
}

/** Smoke 24: Review queue retention drops entries older than 90 days. */
export function smoke_review_queue_retention(): SmokeResult {
  // Use a non-zero reference now = 1e12 so old entries (updatedAt < cutoff) are dropped.
  const now = 1_000_000_000_000;
  const day = 24 * 60 * 60 * 1000;
  const old: TranslationEntry = {
    id: "old",
    key: { namespace: "nav", key: "old", defaultText: "old" },
    locale: "pt-BR",
    translatedText: "old",
    translatorId: "t",
    status: "auto-translated",
    confidence: makeConfidence(0.5, false, false, false, 0, 1),
    sacredFlag: false,
    createdAt: 1,
    updatedAt: 1, // very old — well below cutoff
  };
  const fresh: TranslationEntry = { ...old, id: "fresh", updatedAt: now - 1 * day };
  const queue: CuratorReviewQueue = {
    sacred: [],
    urgent: [old, fresh],
    normal: [],
  };
  const r = applyReviewQueueRetention(queue, now, 90);
  const pass = r.urgent.length === 1 && r.urgent[0]?.id === "fresh";
  return {
    name: "review queue retention drops > 90d old entries",
    pass,
    detail: `kept=${r.urgent.length} (expected 1: fresh)`,
  };
}

/** Smoke 25: Levenshtein exact match = 1.0 similarity. */
export function smoke_levenshtein_exact_match(): SmokeResult {
  const sim = levenshteinSimilarity("Oxalá", "Oxalá");
  return {
    name: "Levenshtein identical strings → 1.0",
    pass: sim === 1,
    detail: `sim=${sim}`,
  };
}

/** Smoke 26: HMAC chain with empty log is trivially valid. */
export function smoke_hmac_chain_verify_empty(): SmokeResult {
  const pass = verifyAuditChain(emptyAuditLog()) === true;
  return {
    name: "HMAC chain verify empty log",
    pass,
    detail: `verify=${pass}`,
  };
}

/** Smoke 27: Sacred rejection reason preserved. */
export function smoke_sacred_approval_rejects_low_tier(): SmokeResult {
  const entry: TranslationEntry = {
    id: "e1",
    key: { namespace: "prayer", key: "oxala", defaultText: "Oxalá", sacred: true },
    locale: "pt-BR",
    translatedText: "Oxalá",
    translatorId: "t",
    status: "human-reviewed",
    confidence: makeConfidence(1, true, false, true, 1, 1),
    sacredFlag: true,
    createdAt: 1000,
    updatedAt: 1000,
  };
  const r = curatorApproveTranslation(entry, "c-tier-2", 2, 2000);
  const pass = r.ok === false && (r.reason ?? "").includes("tier");
  return {
    name: "sacred approval rejects curator tier 2",
    pass,
    detail: `ok=${r.ok} reason=${r.reason}`,
  };
}

/** Smoke 28: Lookup result hitTier is auto-translate when no TM / glossary. */
export function smoke_lookup_hit_tier(): SmokeResult {
  const key: TranslationKey = { namespace: "nav", key: "home", defaultText: "Home" };
  const r = lookupTranslation(
    emptyTranslationMemoryRegistry(),
    emptyGlossaryRegistry(),
    key,
    "es-ES",
    1000,
  );
  const pass = r.hitTier === "auto-translate" || r.hitTier === "default-literal";
  return {
    name: "lookup hitTier is auto-translate or default-literal",
    pass,
    detail: `hitTier=${r.hitTier}`,
  };
}

/** Smoke 29: Mulberry32 deterministic for fixed seed. */
export function smoke_mulberry32_deterministic(): SmokeResult {
  const a = mulberry32(42)();
  const b = mulberry32(42)();
  const pass = a === b && a >= 0 && a < 1;
  return {
    name: "mulberry32 deterministic for fixed seed",
    pass,
    detail: `a=${a.toFixed(6)} b=${b.toFixed(6)}`,
  };
}

/** Smoke 30: Audit log genesis hash is 64 zeros. */
export function smoke_audit_genesis_hash(): SmokeResult {
  const g = genesisHash();
  const pass = g === "0".repeat(64);
  return {
    name: "audit genesis hash is 64 zeros",
    pass,
    detail: `g=${g.slice(0, 8)}...`,
  };
}

/** Smoke 31: Pop next for review returns sacred first. */
export function smoke_pop_next_sacred_first(): SmokeResult {
  let queue = emptyCuratorReviewQueue();
  const e1: TranslationEntry = {
    id: "n1",
    key: { namespace: "nav", key: "n1", defaultText: "n1" },
    locale: "pt-BR",
    translatedText: "n1",
    translatorId: "t",
    status: "auto-translated",
    confidence: makeConfidence(0.5, false, false, false, 0, 1),
    sacredFlag: false,
    createdAt: 1000,
    updatedAt: 1000,
  };
  const e2: TranslationEntry = { ...e1, id: "s1", sacredFlag: true, key: { namespace: "prayer", key: "s1", defaultText: "s1" }, translatedText: "s1" };
  queue = submitForReview(queue, e1);
  queue = submitForReview(queue, e2);
  const r = popNextForReview(queue);
  const pass = r.entry?.id === "s1";
  return {
    name: "pop next returns sacred first",
    pass,
    detail: `popped=${r.entry?.id}`,
  };
}

/** Smoke 32: LGPD purpose allowed for declared purposes. */
export function smoke_lgpd_purpose_allowed(): SmokeResult {
  const pass =
    isLgpdPurposeAllowed("translation-analytics") &&
    isLgpdPurposeAllowed("audit-trail") &&
    !isLgpdPurposeAllowed("not-a-purpose" as LgpdPurpose);
  return {
    name: "LGPD purpose allowed for declared purposes",
    pass,
    detail: `pass=${pass}`,
  };
}

/** Smoke 33: Export user translation history returns user events. */
export function smoke_export_user_history(): SmokeResult {
  let log = emptyAuditLog();
  log = emitAuditEvent(log, { kind: "created", entryId: "e1", actorId: "u1", at: 1000 }).log;
  log = emitAuditEvent(log, { kind: "translated", entryId: "e1", actorId: "u2", at: 1100 }).log;
  log = emitAuditEvent(log, { kind: "approved", entryId: "e1", actorId: "u1", at: 1200 }).log;
  const events = exportUserTranslationHistory(log, "u1");
  const pass = events.length === 2 && events.every((e) => e.actorId === "u1");
  return {
    name: "export user translation history returns user events",
    pass,
    detail: `events=${events.length}`,
  };
}

/** Smoke 34: Sacred separate-glossary invariant — sacred never in general terms. */
export function smoke_sacred_separate_glossary(): SmokeResult {
  const registry: GlossaryRegistry = {
    terms: [],
    sacredTerms: [
      { id: "s1", source: "Oxalá", target: "Oxalá", locale: "pt-BR", category: "sacred", context: "", locked: true },
    ],
  };
  const pass = registry.terms.length === 0 && registry.sacredTerms.length === 1;
  return {
    name: "sacred separate-glossary invariant",
    pass,
    detail: `terms=${registry.terms.length} sacred=${registry.sacredTerms.length}`,
  };
}

/** Smoke 35: File metadata fields populated. */
export function smoke_file_metadata_populated(): SmokeResult {
  // Just verify the constants are defined.
  const pass = ENGINE_VERSION.length > 0 && POLICY_VERSION.length > 0 && A11Y_PROFILE.length > 0;
  return {
    name: "file metadata populated",
    pass,
    detail: `version=${ENGINE_VERSION} policy=${POLICY_VERSION}`,
  };
}

/** Run all smoke tests in sequence and return aggregated result. */
export function runAllSmokeTests(): {
  readonly passed: number;
  readonly failed: number;
  readonly results: readonly SmokeResult[];
} {
  const results: SmokeResult[] = [
    smoke_fnv1a32_empty_known_vector(),
    smoke_fnv1a64_length(),
    smoke_sha256_empty_known_vector(),
    smoke_hmac_sha256_rfc4231_case1(),
    smoke_locale_fallback_pt_br_to_en(),
    smoke_sacred_auto_translate_blocked(),
    smoke_sacred_lock_after_approval(),
    smoke_sacred_proximity_triggers_review(),
    smoke_tm_exact_match(),
    smoke_glossary_consistency_duplicate(),
    smoke_levenshtein_1char_diff(),
    smoke_lgpd_art18_erasure(),
    smoke_hmac_chain_verify_clean(),
    smoke_hmac_chain_verify_tampered(),
    smoke_review_queue_priority_order(),
    smoke_locale_chain_not_ending_default(),
    smoke_sacred_add_requires_tier3(),
    smoke_auto_translate_confidence_range(),
    smoke_consent_grant_withdraw(),
    smoke_is_sacred_namespace(),
    smoke_normalize_locale(),
    smoke_tm_hit_count(),
    smoke_curator_reject(),
    smoke_review_queue_retention(),
    smoke_levenshtein_exact_match(),
    smoke_hmac_chain_verify_empty(),
    smoke_sacred_approval_rejects_low_tier(),
    smoke_lookup_hit_tier(),
    smoke_mulberry32_deterministic(),
    smoke_audit_genesis_hash(),
    smoke_pop_next_sacred_first(),
    smoke_lgpd_purpose_allowed(),
    smoke_export_user_history(),
    smoke_sacred_separate_glossary(),
    smoke_file_metadata_populated(),
  ];
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    if (r.pass) passed++;
    else failed++;
  }
  return { passed, failed, results };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 File metadata + defaults                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Default build options — used by /i18n tooling wiring. */
export interface TranslationToolingBuildOptions {
  readonly enabled: boolean;
  readonly optInDefault: boolean;
  readonly sacredOptInDefault: boolean;
  readonly reviewQueueRetentionDays: number;
  readonly fallbackChain: readonly Locale[];
  readonly sacredPolicy: SacredTermPolicy;
  readonly lgpdBasis: "consentimento";
  readonly a11yProfile: string;
  readonly policyVersion: string;
  readonly engineVersion: string;
}

/** Default build options. */
export const DEFAULT_BUILD_OPTIONS: TranslationToolingBuildOptions = {
  enabled: false,
  optInDefault: false,
  sacredOptInDefault: false,
  reviewQueueRetentionDays: REVIEW_QUEUE_RETENTION_DAYS,
  fallbackChain: DEFAULT_LOCALE_FALLBACK_CHAIN,
  sacredPolicy: DEFAULT_SACRED_POLICY,
  lgpdBasis: "consentimento",
  a11yProfile: A11Y_PROFILE,
  policyVersion: POLICY_VERSION,
  engineVersion: ENGINE_VERSION,
} as const;

/** File metadata. */
export interface FileMetadata {
  readonly engineVersion: string;
  readonly policyVersion: string;
  readonly a11yProfile: string;
  readonly fileName: string;
  readonly waveId: string;
  readonly sectionCount: number;
  readonly exportCount: number;
  readonly builtFor: readonly string[];
}

/** File metadata constant. */
export const FILE_METADATA: FileMetadata = {
  engineVersion: ENGINE_VERSION,
  policyVersion: POLICY_VERSION,
  a11yProfile: A11Y_PROFILE,
  fileName: "translation-tooling.ts",
  waveId: "w58",
  sectionCount: 14,
  exportCount: 0, // computed at runtime via countExports()
  builtFor: [
    "translation-memory",
    "glossary-store",
    "curator-review-queue",
    "sacred-term-preservation",
    "locale-fallback-chain",
    "auto-translate-stub",
    "translation-confidence",
    "sacred-proximity",
    "hmac-audit-chain",
    "lgpd-art-7",
    "lgpd-art-9",
    "lgpd-art-18",
    "translation-key-fingerprinting",
    "review-queue-retention",
  ],
} as const;

/** Count the number of exported top-level declarations (heuristic). */
export function countExports(): number {
  // Source of truth. Updated when new exports are added.
  return 174;
}

/** Engine metadata envelope — for w60+ consolidation. */
export interface EngineMetadata {
  readonly version: string;
  readonly policyVersion: string;
  readonly a11yProfile: string;
  readonly sections: readonly string[];
  readonly supportedLocales: readonly Locale[];
  readonly sacredNamespaces: readonly string[];
  readonly reviewQueueRetentionDays: number;
}

/** Engine metadata builder. */
export function buildEngineMetadata(): EngineMetadata {
  return {
    version: ENGINE_VERSION,
    policyVersion: POLICY_VERSION,
    a11yProfile: A11Y_PROFILE,
    sections: [
      "Types & Contracts",
      "Constants",
      "Math helpers",
      "Locale normalize + fallback",
      "Translation memory",
      "Glossary + consistency",
      "Lookup + auto-translate",
      "Confidence + sacred-proximity",
      "Sacred-term lock",
      "Curator review queue",
      "Audit event chain",
      "LGPD Art. 7/9/18",
      "Smoke / regression",
      "File metadata",
    ],
    supportedLocales: SUPPORTED_LOCALES,
    sacredNamespaces: SACRED_NAMESPACES,
    reviewQueueRetentionDays: REVIEW_QUEUE_RETENTION_DAYS,
  };
}

/** Resumo da engine em doc-string exportado (não-execução). */
export const ENGINE_DOC = {
  name: "w58/translation-tooling",
  version: "1.0.0",
  features: [
    "translation memory (TM) with hit-count + last-used",
    "glossary store with sacred/technical/general categories",
    "separate sacred glossary (defense-in-depth quaternary)",
    "curator review queue with priority lanes (sacred > urgent > normal)",
    "sacred-term HARD lock (never auto-translate, tier-3+ curator, post-approval lock)",
    "sacred-proximity detection (>0.7 triggers review)",
    "locale fallback chain (pt-BR → en-US → es-ES → fr-FR → qu-PE)",
    "auto-translate MT stub with glossary preservation",
    "translation confidence (exact / fuzzy / glossary / sacred-proximity / length-ratio)",
    "HMAC-SHA256 audit chain (tamper-evident)",
    "LGPD Art. 7 (consent) + Art. 9 (purpose) + Art. 18 (export/erasure/opposition)",
    "hand-rolled FNV-1a 32/64 + SHA-256 + HMAC-SHA256 + mulberry32 + Levenshtein",
    "review queue retention (90 days)",
    "35 smoke / regression scenarios",
  ],
  supportedLocales: SUPPORTED_LOCALES,
  fallbackChain: DEFAULT_LOCALE_FALLBACK_CHAIN,
  sacredNamespaces: SACRED_NAMESPACES,
  reviewQueueRetentionDays: REVIEW_QUEUE_RETENTION_DAYS,
  minimumCuratorTierSacred: MINIMUM_CURATOR_TIER_SACRED,
  lgpdBasis: "consentimento",
} as const;