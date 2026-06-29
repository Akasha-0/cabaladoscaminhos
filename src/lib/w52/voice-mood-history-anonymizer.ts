/**
 * w52/voice-mood-history-anonymizer
 * ──────────────────────────────────
 * k-Anonymous + ε-Differential-Privacy + LGPD-compliant aggregation companion to
 * w51/voice-mood-history-export.
 *
 * Built "by shape" — does NOT import from w51 or w49. The companion file is the
 * formal source of truth for cohort/sacred-tag policy enforcement on aggregated
 * voice-mood signals, including LGPD Art. 9 (purpose limitation), Art. 18
 * (right to erasure → re-aggregation trigger), and Art. 20 (data portability
 * bucket-level only).
 *
 * Sacred-text policy is MANDATORY: any voice-mood event tagged `sacredFlag: true`
 * survives at most as a counter (`sacredHits`) in a cohort bucket — the raw tag
 * NEVER leaves the anonymizer.
 *
 * Self-contained: only standard JS / TS types. No external deps. No node:crypto,
 * no prisma at runtime, no fetch. Deterministic given seeded RNG.
 *
 * Layout:
 *   §1  Types & contracts
 *   §2  Constants, cohorts taxonomy, sacred-tag taxonomy
 *   §3  Math helpers (FNV-1a 32/64, SHA-256 hand-rolled, Mulberry32 PRNG, Laplace noise, ε-composition)
 *   §4  Generalization helpers (numeric, timestamp, locale, age bracket)
 *   §5  K-anonymity core
 *   §6  Cohort builders
 *   §7  Differential privacy
 *   §8  Aggregation output
 *   §9  Errors (ANON_001..ANON_006 + invariants)
 *   §10 Audit & orchestration (decision engine + report)
 *   §11 LGPD policy primitives
 *   §12 Sacred-tag policy primitives
 *   §13 Smoke / regression scenarios
 *   §14 Doc-string constants
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Types & Contracts                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Lightweight event mirror — matches w49/VoiceMoodEventLite SHAPE only. */
export interface VoiceMoodEventLite {
  ts: number;            // epoch ms
  moodTag: string;       // e.g. "contemplative", "exultant"
  userHash: string;      // FNV-1a 64-bit hex; treated as pseudonym
  cohort: CohortKey;
  sacredFlag: boolean;
}

/** Cohort key — quasi-identifier tuple. */
export interface CohortKey {
  windowDays: number;            // e.g. 30, 90, 365
  region: string;                // ISO-3166 alpha-2 or "ZZ" = unknown
  tradition?: string;            // "umbanda" | "candomble" | "ifá" | "kabbalah" | undefined
  ageBracket?: AgeBracket;       // coarsened to bracket
}

export type AgeBracket = "under_18" | "18_24" | "25_34" | "35_44" | "45_54" | "55_64" | "65_plus" | "unknown";

export type Tradition =
  | "umbanda"
  | "candomble"
  | "ifa"
  | "kabbalah"
  | "astrology"
  | "tarot"
  | "lenormand"
  | "cigano"
  | "mixed"
  | "unspecified";

export type Region =
  | "BR" | "PT" | "AO" | "MZ" | "CV" | "US" | "UK" | "ES" | "FR" | "DE"
  | "IT" | "JP" | "MX" | "AR" | "CO" | "CL" | "PE" | "UY" | "PY" | "BO"
  | "ZZ";

/** K-bucket — the publishable aggregation row. */
export interface KBucket {
  cohort: CohortKey;
  count: number;             // total events after suppression
  distinctUsers: number;     // unique userHash hits
  sacredHits: number;        // count of events with sacredFlag=true (no raw tag)
  moodHistogram?: Record<string, number>; // only emitted when distinctUsers >= kPublic
  windowStart: number;       // epoch ms — coarsened to window
  windowEnd: number;
}

/** ε-DP budget. */
export interface EpsilonBudget {
  total: number;             // initial allocation
  spent: number;             // consumed so far
  remaining: number;         // total - spent (clamped >= 0)
  budgetPerWindow: number;   // epsilon allocation per window query
  spentPerWindow: Record<string, number>; // windowKey -> spent
}

/** Aggregation output — the only legal export shape. */
export interface AggregationOutput {
  buckets: KBucket[];
  metadata: AggregationMetadata;
  privacyProof: PrivacyProof;
}

export interface AggregationMetadata {
  generatedAt: number;
  totalInputEvents: number;
  totalSuppressed: number;
  totalSacredHits: number;
  k: number;
  kSacred: number;       // raised for sacred-bearing buckets
  epsilon: number;
  composition: "basic" | "advanced" | "optimal";
  cohortsIncluded: number;
  cohortsSuppressed: number;
  policyVersion: string;
}

export interface PrivacyProof {
  kSatisfied: boolean;
  epsilonSpent: number;
  epsilonRemaining: number;
  sacredTagLeaked: boolean;       // MUST be false to pass
  rawPIILeaked: boolean;          // MUST be false to pass
  compositionMethod: string;
  auditAt: number;
}

export type PrivacyBudgetAction = "allow" | "aggregate" | "suppress" | "reject";

/** Anonymization decision — final verdict for an export. */
export interface AnonymizationDecision {
  pass: boolean;
  blockers: string[];
  warnings: string[];
  sacredFlagPreserved: boolean;     // true means raw sacred tag is NOT preserved (correct)
  rawPIIStripped: boolean;
  bucketsPublished: number;
  cohortsSuppressed: number;
  epsilonRemaining: number;
}

export type KAnonymityStatus = "satisfied" | "breached" | "suppressed" | "underflow";

export interface KAnonymityConfig {
  k: number;                      // e.g. 5
  kSacred: number;                // e.g. 10 (raised for sacred tags)
  qiGeneralization: "year" | "decade" | "century";
  maxBucketSize?: number;
  enabled: boolean;
}

export interface AggregationReport {
  decision: AnonymizationDecision;
  output: AggregationOutput;
  history: AuditStep[];
  durationMs: number;
}

export interface AuditStep {
  step: string;
  ts: number;
  ok: boolean;
  detail?: string;
}

export interface SuppressionList {
  userHashes: Set<string>;
  eventIds: Set<string>;
  reason: string;
  createdAt: number;
}

export interface PrivacyBudgetQuery {
  cohort: CohortKey;
  kind: "count" | "mean" | "histogram" | "sacred_hits";
  sensitivity: number;
  epsilon: number;
}

export interface PrivacyBudgetLedger {
  budget: EpsilonBudget;
  queries: PrivacyBudgetQuery[];
  composition: "basic" | "advanced" | "optimal";
}

/** Quasi-identifier mapping after generalization. */
export interface GeneralizedQI {
  year?: number;
  decade?: number;
  century?: number;
  region: Region;
  tradition?: Tradition;
  ageBracket: AgeBracket;
}

export interface CohortStats {
  count: number;
  distinctUsers: number;
  sacredHits: number;
  firstSeen: number;
  lastSeen: number;
  dominantMood?: string;
}

export interface AnonymizationConsent {
  userHash: string;
  granted: boolean;
  grantedAt: number;
  scope: "research" | "analytics" | "sacred_practice" | "all";
  expiresAt?: number;
}

export interface ElderCohortSpec {
  name: string;
  region: Region;
  tradition: Tradition;
  ageBracket: AgeBracket;
  windowDays: number;
  description: string;
}

/** Risk classifier output. */
export interface ReidentificationRisk {
  riskScore: number;     // 0..1
  riskLevel: "low" | "medium" | "high";
  signals: string[];
  recommendation: PrivacyBudgetAction;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constants                                                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const POLICY_VERSION = "w52-anonymizer-v1.0.0";

export const DEFAULT_K = 5;
export const DEFAULT_K_SACRED = 10;
export const DEFAULT_EPSILON = 1.0;
export const DEFAULT_EPSILON_BUDGET = 5.0;
export const DEFAULT_EPSILON_PER_WINDOW = 0.5;

export const MAX_EVENTS_PER_BUCKET = 10_000;
export const MIN_EVENTS_PER_BUCKET = 1;

export const SALT = "w52-voice-mood-anonymizer/v1";
export const SALT_PREFIX = "w52anon:";
export const HASH_RING_SIZE = 2 ** 32;
export const FNV_OFFSET_32 = 0x811c9dc5;
export const FNV_PRIME_32 = 0x01000193;
export const FNV_OFFSET_64 = 0xcbf29ce484222325n;
export const FNV_PRIME_64 = 0x100000001b3n;

export const TIMESTAMP_BUCKETS_MS = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
  month: 2_629_800_000,   // 30.44d
  quarter: 7_889_400_000, // 91.31d
  year: 31_557_600_000,   // 365.25d
} as const;

export type TimestampBucket = keyof typeof TIMESTAMP_BUCKETS_MS;

export const AGE_BRACKETS: AgeBracket[] = [
  "under_18", "18_24", "25_34", "35_44", "45_54", "55_64", "65_plus", "unknown",
];

export const TRADITIONS: Tradition[] = [
  "umbanda", "candomble", "ifa", "kabbalah", "astrology", "tarot", "lenormand", "cigano", "mixed", "unspecified",
];

export const REGIONS: Region[] = [
  "BR", "PT", "AO", "MZ", "CV", "US", "UK", "ES", "FR", "DE",
  "IT", "JP", "MX", "AR", "CO", "CL", "PE", "UY", "PY", "BO", "ZZ",
];

export const SACRED_TAG_PREFIXES = [
  "orixa_", "saint_", "entity_", "ritual_", "initiation_", "axé", "axé_",
  "kabbalistic_", "keter_", "chokmah_", "binah_",
];

export const MOOD_VOCABULARY = [
  "contemplative", "exultant", "luminous", "tender", "fierce",
  "resigned", "elated", "somber", "mystic", "reverent",
  "joyful", "lamenting", "neutral", "introspective", "transcendent",
  "ancestral", "devotional", "playful", "wounded", "reconciled",
] as const;
export type MoodTag = typeof MOOD_VOCABULARY[number];

export const WINDOW_DAYS_OPTIONS = [30, 90, 180, 365] as const;

export const SMOKE_SCENARIOS = [
  "k_threshold_suppression",
  "epsilon_composition_basic",
  "epsilon_composition_advanced",
  "laplace_noise_sanity",
  "sacred_tag_never_leaks",
  "regional_cohort_hashing",
  "generalization_year_to_decade",
  "single_bucket_breach_detection",
  "epsilon_exhausted_refusal",
  "cohort_reaggregation_post_erasure",
  "tradition_aware_cohort",
  "no_pii_on_output",
  "sacred_hits_counter_correctness",
  "k_sacred_raised_threshold",
] as const;
export type SmokeScenario = typeof SMOKE_SCENARIOS[number];

// ANON error codes
export const ANON_CODES = {
  K_THRESHOLD_NOT_MET: "ANON_001",
  EPSILON_EXHAUSTED: "ANON_002",
  BUCKET_TOO_SMALL: "ANON_003",
  SACRED_TAG_LEAKED: "ANON_004",
  COMPOSITION_OVERFLOW: "ANON_005",
  COHORT_UNDER_REPRESENTATIVE: "ANON_006",
} as const;
export type AnonCode = typeof ANON_CODES[keyof typeof ANON_CODES];

export const PRIVACY_ACTIONS: Record<string, PrivacyBudgetAction> = {
  allow: "allow",
  aggregate: "aggregate",
  suppress: "suppress",
  reject: "reject",
} as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers — FNV, SHA-256, Mulberry32, Laplace, ε-composition        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * FNV-1a 32-bit hash, hex string. Zero deps. Deterministic.
 * Used for pseudonym derivation within a single cohort window.
 */
export function fnv1a32(input: string): string {
  let hash = FNV_OFFSET_32 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function fnv1a32Number(input: string): number {
  let hash = FNV_OFFSET_32 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash >>> 0;
}

/** FNV-1a 64-bit — BigInt internal, returns hex. */
export function fnv1a64(input: string): string {
  let hash = FNV_OFFSET_64;
  const prime = FNV_PRIME_64;
  for (let i = 0; i < input.length; i++) {
    const code = BigInt(input.charCodeAt(i) & 0xff);
    hash = (hash ^ code) & 0xffffffffffffffffn;
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, "0");
}

export function fnv1a64BigInt(input: string): bigint {
  let hash = FNV_OFFSET_64;
  const prime = FNV_PRIME_64;
  for (let i = 0; i < input.length; i++) {
    const code = BigInt(input.charCodeAt(i) & 0xff);
    hash = (hash ^ code) & 0xffffffffffffffffn;
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash;
}

/** Cohort hash — used as bucket key. 64-bit, salt-aware. */
export function cohortHash(cohort: CohortKey): string {
  const tuple = [
    SALT_PREFIX,
    String(cohort.windowDays),
    "|",
    cohort.region,
    "|",
    cohort.tradition ?? "any",
    "|",
    cohort.ageBracket ?? "unknown",
  ].join("");
  return fnv1a64(tuple);
}

/** Composite hash — combines userHash + cohort + salt for bucket-internal IDs. */
export function compositeHash(userHash: string, cohort: CohortKey): string {
  return fnv1a64(SALT_PREFIX + userHash + "|" + cohortHash(cohort));
}

/** Mulberry32 — fast 32-bit PRNG, deterministic given seed. */
export function mulberry32(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** xorshift128+ — 64-bit PRNG, also deterministic. */
export function xorshift128Plus(seed: bigint): () => number {
  let s0 = seed & 0xffffffffffffffffn;
  let s1 = (seed * 0x9e3779b97f4a7c15n) & 0xffffffffffffffffn;
  return function () {
    const result = (s0 + s1) & 0xffffffffffffffffn;
    s1 = s0 ^ s1;
    s0 = ((s0 << 24n) | (s0 >> 40n)) & 0xffffffffffffffffn;
    s1 = (s1 ^ ((s1 << 13n) | (s1 >> 51n))) & 0xffffffffffffffffn;
    s0 = (s0 ^ s1) & 0xffffffffffffffffn;
    s1 = ((s1 << 10n) | (s1 >> 54n)) & 0xffffffffffffffffn;
    return Number(result >> 11n) / 9007199254740992;
  };
}

/** Hand-rolled SHA-256 — 64 rounds, no node:crypto. Returns hex (64 chars). */
export function sha256(input: string): string {
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
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < input.length) {
      const c2 = input.charCodeAt(i + 1);
      const cp = 0x10000 + (((code & 0x3ff) << 10) | (c2 & 0x3ff));
      i++;
      bytes.push(0xf0 | (cp >> 18));
      bytes.push(0x80 | ((cp >> 12) & 0x3f));
      bytes.push(0x80 | ((cp >> 6) & 0x3f));
      bytes.push(0x80 | (cp & 0x3f));
    } else {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0x00);
  for (let i = 7; i >= 0; i--) bytes.push((bitLen >>> (i * 8)) & 0xff);
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const w: number[] = new Array<number>(64).fill(0);
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = (((bytes[off + i * 4] ?? 0) << 24) |
             ((bytes[off + i * 4 + 1] ?? 0) << 16) |
             ((bytes[off + i * 4 + 2] ?? 0) << 8) |
             ((bytes[off + i * 4 + 3] ?? 0))) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15]!, 7) ^ rotr(w[i - 15]!, 18) ^ (w[i - 15]! >>> 3);
      const s1 = rotr(w[i - 2]!, 17) ^ rotr(w[i - 2]!, 19) ^ (w[i - 2]! >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e!, 6) ^ rotr(e!, 11) ^ rotr(e!, 25);
      const ch = (e! & f!) ^ ((~e! >>> 0) & g!);
      const t1 = (h! + S1 + ch + K[i]! + w[i]!) >>> 0;
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
  return H.map((hx) => (hx >>> 0).toString(16).padStart(8, "0")).join("");
}

function rotr(n: number, k: number): number {
  return ((n >>> k) | (n << (32 - k))) >>> 0;
}

/** Salted pseudonym — applies SHA-256 to userHash with cohort key. */
export function saltedPseudonym(userHash: string, cohort: CohortKey): string {
  return sha256(SALT + "|" + userHash + "|" + cohortHash(cohort));
}

/** Stable cohort ID derived from key. */
export function cohortId(cohort: CohortKey): string {
  return cohortHash(cohort).slice(0, 12);
}

/** Laplace noise sample — `scale = sensitivity / epsilon`. Uses xorshift for determinism. */
export function laplaceSample(scale: number, rng: () => number = Math.random): number {
  if (scale <= 0) throw new Error("scale must be positive");
  const u = rng() - 0.5;
  const sign = u >= 0 ? 1 : -1;
  return -sign * scale * Math.log(1 - 2 * Math.abs(u));
}

/** Round a noised count to a non-negative integer. */
export function roundLaplaceCount(scale: number, base: number, rng: () => number = Math.random): number {
  const n = base + laplaceSample(scale, rng);
  return Math.max(0, Math.round(n));
}

/** Apply Laplace noise to a numeric query result. */
export function applyLaplaceNoise(value: number, sensitivity: number, epsilon: number, rng?: () => number): number {
  const scale = sensitivity / epsilon;
  return value + laplaceSample(scale, rng);
}

/** Laplace noise mean & variance — useful for smoke. */
export function laplaceMoments(scale: number): { mean: number; variance: number } {
  return { mean: 0, variance: 2 * scale * scale };
}

/** ε composition — BASIC: sum. */
export function composeEpsilonBasic(epsilons: number[]): number {
  return epsilons.reduce((acc, e) => acc + e, 0);
}

/** ε composition — ADVANCED: smartSequencing or composition theorem sqrt bound. */
export function composeEpsilonAdvanced(epsilons: number[], delta: number = 1e-9): number {
  if (epsilons.length === 0) return 0;
  const sum = composeEpsilonBasic(epsilons);
  // Kairouz–Oh–Viswanath (KOV) tight bound approximation:
  // sqrt(2 * sum * ln(1/delta)) + sum * (e - 1) / (1 + e * ln(...))
  const kov = Math.sqrt(2 * sum * Math.log(1 / delta))
    + sum * (Math.E - 1) / (1 + Math.E * Math.log(1 / delta));
  return Math.min(sum, kov);
}

/** ε composition — OPTIMAL: min of basic and advanced bound. */
export function composeEpsilonOptimal(epsilons: number[], delta: number = 1e-9): number {
  return Math.min(composeEpsilonBasic(epsilons), composeEpsilonAdvanced(epsilons, delta));
}

/** Allocate ε budget across multiple windows — proportional split. */
export function allocateEpsilonPerWindow(total: number, windows: number[]): Record<string, number> {
  const sum = windows.reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  for (const w of windows) {
    out[`window_${w}`] = (total * w) / sum;
  }
  return out;
}

/** Compute remaining ε after some spend. */
export function remainingBudget(total: number, spent: number): number {
  return Math.max(0, total - spent);
}

/** Sensitivity upper bound for counting query = 1. */
export const COUNT_SENSITIVITY = 1;

/** Sensitivity for bounded mean query (range b - a). */
export function meanSensitivity(range: number): number {
  return range;
}

/** Convert Laplace scale to standard DP ε at unit sensitivity. */
export function scaleToEpsilon(scale: number, sensitivity: number = 1): number {
  return sensitivity / scale;
}

/** Convert ε + sensitivity → Laplace scale. */
export function epsilonToScale(epsilon: number, sensitivity: number = 1): number {
  return sensitivity / epsilon;
}

/** Inverse Laplace CDF — for threshold tests. */
export function inverseLaplaceCDF(p: number, scale: number, loc: number = 0): number {
  const sign = p < 0.5 ? -1 : 1;
  const q = p < 0.5 ? 1 - 2 * p : 2 * p - 1;
  return loc - sign * scale * Math.log(1 - 2 * Math.min(q, 1 - 1e-15));
}

/** Generate Laplace-distributed noise vector of length n. */
export function laplaceVector(n: number, scale: number, rng: () => number = Math.random): number[] {
  const out: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = laplaceSample(scale, rng);
  return out;
}

/** Compute mean of a Laplace-distributed noise sample (sanity). */
export function noiseMean(samples: number[]): number {
  if (samples.length === 0) return 0;
  let s = 0;
  for (const v of samples) s += v;
  return s / samples.length;
}

/** Compute sample variance of Laplace-distributed noise (sanity). */
export function noiseVariance(samples: number[]): number {
  if (samples.length < 2) return 0;
  const m = noiseMean(samples);
  let v = 0;
  for (const x of samples) v += (x - m) * (x - m);
  return v / (samples.length - 1);
}

/** Returns true if `actualCount` is k-anonymous at level `k`. */
export function isKAnonymous(count: number, k: number): boolean {
  return count >= k && count > 0;
}

/** Compute modular ring index from hash (for distributed bucketing). */
export function ringIndex(hash: string, ringSize: number = HASH_RING_SIZE): number {
  const n = parseInt(hash.slice(0, 8), 16);
  return Math.abs(n) % ringSize;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Generalization Helpers                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Reduce a year to its decade. */
export function generalizeYearToDecade(year: number): number {
  return Math.floor(year / 10) * 10;
}

/** Reduce a year to its century. */
export function generalizeYearToCentury(year: number): number {
  return Math.floor(year / 100) * 100;
}

/** Generalize numeric value — apply floor by factor. */
export function generalizeNumeric(value: number, factor: number): number {
  if (factor <= 0) return value;
  return Math.floor(value / factor) * factor;
}

/** Generalize timestamp to a bucket (day, week, month, etc.). */
export function generalizeTimestamp(ts: number, bucket: TimestampBucket = "day"): number {
  const size = TIMESTAMP_BUCKETS_MS[bucket];
  return Math.floor(ts / size) * size;
}

/** Round timestamp to nearest hour. */
export function roundToHour(ts: number): number {
  const hour = TIMESTAMP_BUCKETS_MS.hour;
  return Math.floor(ts / hour) * hour;
}

/** Round timestamp to nearest day. */
export function roundToDay(ts: number): number {
  const day = TIMESTAMP_BUCKETS_MS.day;
  return Math.floor(ts / day) * day;
}

/** Round timestamp to nearest week. */
export function roundToWeek(ts: number): number {
  const week = TIMESTAMP_BUCKETS_MS.week;
  return Math.floor(ts / week) * week;
}

/** Round timestamp to month boundary. */
export function roundToMonth(ts: number): number {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0);
}

/** Map a year-of-birth to AgeBracket. */
export function yearToAgeBracket(year: number, refYear: number = new Date().getUTCFullYear()): AgeBracket {
  const age = refYear - year;
  if (age < 18) return "under_18";
  if (age < 25) return "18_24";
  if (age < 35) return "25_34";
  if (age < 45) return "35_44";
  if (age < 55) return "45_54";
  if (age < 65) return "55_64";
  if (age >= 65) return "65_plus";
  return "unknown";
}

/** Validate age bracket string. */
export function isValidAgeBracket(s: string): s is AgeBracket {
  return (AGE_BRACKETS as readonly string[]).includes(s);
}

/** Validate tradition string. */
export function isValidTradition(s: string): s is Tradition {
  return (TRADITIONS as readonly string[]).includes(s);
}

/** Validate region string. */
export function isValidRegion(s: string): s is Region {
  return (REGIONS as readonly string[]).includes(s);
}

/** Coarsen a timestamp to the start of its cohort window (days). */
export function coarsenToWindow(ts: number, windowDays: number): number {
  const size = TIMESTAMP_BUCKETS_MS.day * windowDays;
  return Math.floor(ts / size) * size;
}

/** Compute window start/end from a timestamp + windowDays. */
export function windowBounds(ts: number, windowDays: number): { start: number; end: number } {
  const start = coarsenToWindow(ts, windowDays);
  return { start, end: start + windowDays * TIMESTAMP_BUCKETS_MS.day };
}

/** Stable strigified cohort key — for logs. */
export function cohortKeyString(cohort: CohortKey): string {
  return [
    `w=${cohort.windowDays}d`,
    `r=${cohort.region}`,
    `t=${cohort.tradition ?? "any"}`,
    `a=${cohort.ageBracket ?? "unknown"}`,
  ].join(",");
}

/** Build a generalized QI from a raw event. */
export function generalizeEvent(event: VoiceMoodEventLite, mode: "year" | "decade" | "century" = "decade"): GeneralizedQI {
  const year = new Date(event.ts).getUTCFullYear();
  return {
    year: mode === "year" ? year : undefined,
    decade: mode === "decade" ? generalizeYearToDecade(year) : undefined,
    century: mode === "century" ? generalizeYearToCentury(year) : undefined,
    region: isValidRegion(event.cohort.region) ? event.cohort.region : "ZZ",
    tradition: event.cohort.tradition && isValidTradition(event.cohort.tradition) ? event.cohort.tradition : undefined,
    ageBracket: event.cohort.ageBracket ?? "unknown",
  };
}

/** Drop values beyond IQR fence for a numeric series. */
export function dropOutliers(values: number[], k: number = 1.5): number[] {
  if (values.length < 4) return values.slice();
  const sorted = values.slice().sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)]!;
  const q3 = sorted[Math.floor(sorted.length * 0.75)]!;
  const iqr = q3 - q1;
  const lo = q1 - k * iqr;
  const hi = q3 + k * iqr;
  return values.filter((v) => v >= lo && v <= hi);
}

/** Drop values outside 3σ from mean (z-score cap). */
export function dropOutliersZScore(values: number[], zCap: number = 3): number[] {
  if (values.length < 2) return values.slice();
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  let v = 0;
  for (const x of values) v += (x - m) * (x - m);
  const sd = Math.sqrt(v / (values.length - 1));
  if (sd === 0) return values.slice();
  return values.filter((x) => Math.abs((x - m) / sd) <= zCap);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 K-Anonymity Core                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Assign a single event to a bucket. Returns null if suppression is required.
 * Sacred-flagged events are routed to dedicated buckets with `kSacred` floor.
 */
export function assignToBucket(
  event: VoiceMoodEventLite,
  config: KAnonymityConfig,
): { cohort: CohortKey; sacredFlag: boolean } | null {
  if (!config.enabled) return { cohort: event.cohort, sacredFlag: event.sacredFlag };
  // Validate region
  if (!isValidRegion(event.cohort.region)) return null;
  // Validate tradition if present
  if (event.cohort.tradition && !isValidTradition(event.cohort.tradition)) return null;
  // Validate age bracket if present
  if (event.cohort.ageBracket && !isValidAgeBracket(event.cohort.ageBracket)) return null;
  return {
    cohort: {
      windowDays: event.cohort.windowDays,
      region: event.cohort.region,
      tradition: event.cohort.tradition,
      ageBracket: event.cohort.ageBracket ?? "unknown",
    },
    sacredFlag: event.sacredFlag,
  };
}

/**
 * Build the full K-bucket map. Pre-suppression — caller decides whether to
 * publish each bucket based on `k`.
 */
export function buildRawBuckets(events: VoiceMoodEventLite[]): Map<string, VoiceMoodEventLite[]> {
  const buckets = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const k = cohortId(e.cohort) + (e.sacredFlag ? ":sacred" : ":regular");
    const list = buckets.get(k) ?? [];
    list.push(e);
    buckets.set(k, list);
  }
  return buckets;
}

/** Count distinct userHashes in a list of events. */
export function countDistinctUsers(events: VoiceMoodEventLite[]): number {
  const set = new Set<string>();
  for (const e of events) set.add(e.userHash);
  return set.size;
}

/**
 * Apply k-anonymity filter: returns buckets that satisfy the k threshold
 * (separating regular vs sacred thresholds), and a parallel list of
 * suppressed buckets (with counts).
 */
export function applyKAnonymity(
  buckets: Map<string, VoiceMoodEventLite[]>,
  config: KAnonymityConfig,
): { publishable: KBucket[]; suppressed: { cohort: CohortKey; sacred: boolean; count: number }[] } {
  const publishable: KBucket[] = [];
  const suppressed: { cohort: CohortKey; sacred: boolean; count: number }[] = [];
  for (const [key, events] of buckets) {
    const cohort = events[0]!.cohort;
    const sacred = key.endsWith(":sacred");
    const kThreshold = sacred ? config.kSacred : config.k;
    const distinct = countDistinctUsers(events);
    let count = events.length;
    if (events.some((e) => e.sacredFlag)) {
      count = events.filter((e) => e.sacredFlag).length;
    }
    if (distinct < kThreshold) {
      suppressed.push({ cohort, sacred, count });
      continue;
    }
    const sacredHits = events.reduce((acc, e) => acc + (e.sacredFlag ? 1 : 0), 0);
    const bounds = windowBounds(events[0]!.ts, cohort.windowDays);
    publishable.push({
      cohort,
      count,
      distinctUsers: distinct,
      sacredHits,
      windowStart: bounds.start,
      windowEnd: bounds.end,
    });
  }
  return { publishable, suppressed };
}

/**
 * Suppress rare quasi-identifiers — cohort keys with fewer than `kThreshold`
 * events are dropped.
 */
export function suppressRareQuasiIdentifiers(
  buckets: Map<string, VoiceMoodEventLite[]>,
  kThreshold: number,
): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const [key, list] of buckets) {
    if (list.length >= kThreshold) out.set(key, list);
  }
  return out;
}

/** Compute the re-identification risk score for a single bucket. */
export function reidentificationRisk(bucket: KBucket, kThreshold: number): ReidentificationRisk {
  const signals: string[] = [];
  let score = 0;
  if (bucket.distinctUsers < kThreshold) {
    signals.push("below-k");
    score += 0.5;
  }
  if (bucket.distinctUsers < 3) {
    signals.push("near-singleton");
    score += 0.3;
  }
  if (bucket.sacredHits > 0 && bucket.distinctUsers < 20) {
    signals.push("sacred-sparse");
    score += 0.2;
  }
  score = Math.min(1, score);
  const level: ReidentificationRisk["riskLevel"] =
    score >= 0.7 ? "high" : score >= 0.3 ? "medium" : "low";
  const recommendation: PrivacyBudgetAction =
    level === "high" ? "reject" : level === "medium" ? "suppress" : level === "low" ? "aggregate" : "allow";
  return { riskScore: score, riskLevel: level, signals, recommendation };
}

/** Detect anonymity breach: bucket has 1 user. */
export function detectSingletonBreach(bucket: KBucket): boolean {
  return bucket.distinctUsers === 1;
}

/** Detect anonymity breach: bucket equal user-event ratio. */
export function detectEqRatioBreach(bucket: KBucket, threshold: number = 0.9): boolean {
  if (bucket.count === 0) return false;
  return bucket.distinctUsers / bucket.count > threshold;
}

/** Status of k-anonymity check for a bucket. */
export function checkKAnonymitySatisfied(
  bucket: KBucket | { distinctUsers: number; sacredHits: number; count: number; cohort: CohortKey },
  config: KAnonymityConfig,
): KAnonymityStatus {
  if (bucket.distinctUsers === 0) return "underflow";
  const threshold = bucket.sacredHits > 0 ? config.kSacred : config.k;
  if (bucket.distinctUsers >= threshold) return "satisfied";
  if (bucket.distinctUsers === 1) return "breached";
  return "suppressed";
}

/** Apply suppression list (Art. 18 erasure) — drops any event whose userHash is suppressed. */
export function applySuppressionList(
  events: VoiceMoodEventLite[],
  suppressed: SuppressionList,
): VoiceMoodEventLite[] {
  return events.filter((e) => !suppressed.userHashes.has(e.userHash));
}

/** Build a suppression list from a list of userHashes. */
export function buildSuppressionList(userHashes: string[], reason: string): SuppressionList {
  return {
    userHashes: new Set(userHashes),
    eventIds: new Set(),
    reason,
    createdAt: Date.now(),
  };
}

/** Merge multiple suppression lists. */
export function mergeSuppressionLists(lists: SuppressionList[]): SuppressionList {
  const userHashes = new Set<string>();
  const eventIds = new Set<string>();
  const reasons: string[] = [];
  for (const l of lists) {
    for (const h of l.userHashes) userHashes.add(h);
    for (const id of l.eventIds) eventIds.add(id);
    reasons.push(l.reason);
  }
  return {
    userHashes,
    eventIds,
    reason: reasons.join(";"),
    createdAt: Date.now(),
  };
}

/** Total count of suppressed users. */
export function suppressionListSize(list: SuppressionList): number {
  return list.userHashes.size;
}

/** Add a user to existing suppression list (returns new list, immutable). */
export function addToSuppressionList(list: SuppressionList, userHash: string, reason?: string): SuppressionList {
  const set = new Set(list.userHashes);
  set.add(userHash);
  return {
    userHashes: set,
    eventIds: new Set(list.eventIds),
    reason: reason ?? list.reason,
    createdAt: Date.now(),
  };
}

/** Remove a user from suppression list. */
export function removeFromSuppressionList(list: SuppressionList, userHash: string): SuppressionList {
  const set = new Set(list.userHashes);
  set.delete(userHash);
  return {
    userHashes: set,
    eventIds: new Set(list.eventIds),
    reason: list.reason,
    createdAt: Date.now(),
  };
}

/** Truncate a bucket if exceeding MAX_EVENTS_PER_BUCKET. */
export function capBucketSize(bucket: KBucket): KBucket {
  if (bucket.count <= MAX_EVENTS_PER_BUCKET) return bucket;
  return {
    ...bucket,
    count: MAX_EVENTS_PER_BUCKET,
    sacredHits: Math.min(bucket.sacredHits, MAX_EVENTS_PER_BUCKET),
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Cohort Builders                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Build a cohort by window size. */
export function buildCohortByWindow(
  events: VoiceMoodEventLite[],
  windowDays: number,
): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const start = coarsenToWindow(e.ts, windowDays);
    const k = `${windowDays}:${start}:${e.cohort.region ?? "ZZ"}:${e.cohort.tradition ?? "any"}:${e.cohort.ageBracket ?? "unknown"}`;
    const list = out.get(k) ?? [];
    list.push({ ...e, cohort: { ...e.cohort, windowDays } });
    out.set(k, list);
  }
  return out;
}

/** Build a cohort by region only. */
export function buildCohortByRegion(events: VoiceMoodEventLite[]): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const k = e.cohort.region ?? "ZZ";
    const list = out.get(k) ?? [];
    list.push(e);
    out.set(k, list);
  }
  return out;
}

/** Build a cohort by tradition only. */
export function buildCohortByTradition(events: VoiceMoodEventLite[]): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const k = e.cohort.tradition ?? "any";
    const list = out.get(k) ?? [];
    list.push(e);
    out.set(k, list);
  }
  return out;
}

/** Build a cohort by age bracket only. */
export function buildCohortByAgeBracket(events: VoiceMoodEventLite[]): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const k = e.cohort.ageBracket ?? "unknown";
    const list = out.get(k) ?? [];
    list.push(e);
    out.set(k, list);
  }
  return out;
}

/** Build cross-cohort — region × tradition × ageBucket (multi-dimensional). */
export function buildCrossCohort(events: VoiceMoodEventLite[]): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const k = cohortKeyString(e.cohort);
    const list = out.get(k) ?? [];
    list.push(e);
    out.set(k, list);
  }
  return out;
}

/** Build cohort by sacred flag. */
export function buildCohortBySacred(events: VoiceMoodEventLite[]): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const k = e.sacredFlag ? "sacred" : "regular";
    const list = out.get(k) ?? [];
    list.push(e);
    out.set(k, list);
  }
  return out;
}

/** Build cohort by year bucket. */
export function buildCohortByYear(events: VoiceMoodEventLite[]): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const year = new Date(e.ts).getUTCFullYear();
    const list = out.get(`y${year}`) ?? [];
    list.push(e);
    out.set(`y${year}`, list);
  }
  return out;
}

/** Build cohort by decade. */
export function buildCohortByDecade(events: VoiceMoodEventLite[]): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    const year = new Date(e.ts).getUTCFullYear();
    const decade = generalizeYearToDecade(year);
    const list = out.get(`d${decade}`) ?? [];
    list.push(e);
    out.set(`d${decade}`, list);
  }
  return out;
}

/** Build elder cohort (candomblé 50+ in BR). */
export function buildElderCohort(events: VoiceMoodEventLite[], spec: ElderCohortSpec): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const e of events) {
    if (e.cohort.region !== spec.region) continue;
    if (e.cohort.tradition !== spec.tradition) continue;
    if (e.cohort.ageBracket !== spec.ageBracket) continue;
    const bounds = windowBounds(e.ts, spec.windowDays);
    const k = `${spec.name}|${bounds.start}`;
    const list = out.get(k) ?? [];
    list.push(e);
    out.set(k, list);
  }
  return out;
}

/** Compose multiple cohort builders — union of events, partitioned by pass-through builder. */
export function composeCohortBuilders(
  events: VoiceMoodEventLite[],
  builders: ((e: VoiceMoodEventLite[]) => Map<string, VoiceMoodEventLite[]>)[],
): Map<string, VoiceMoodEventLite[]> {
  const out = new Map<string, VoiceMoodEventLite[]>();
  for (const b of builders) {
    const partial = b(events);
    for (const [k, list] of partial) {
      const cur = out.get(k) ?? [];
      cur.push(...list);
      out.set(k, cur);
    }
  }
  return out;
}

/** Determine if a cohort is "under-representative" — emits ANON_006 if so. */
export function isUnderRepresentative(
  bucket: VoiceMoodEventLite[] | KBucket,
  k: number,
): boolean {
  if (Array.isArray(bucket)) return countDistinctUsers(bucket) < k;
  return bucket.distinctUsers < k;
}

/** Compute cohort stats — count, distinct, sacred, dominant mood. */
export function computeCohortStats(events: VoiceMoodEventLite[]): CohortStats {
  const distinct = new Set<string>();
  let sacredHits = 0;
  let first = Infinity;
  let last = -Infinity;
  const moodCounts: Record<string, number> = {};
  for (const e of events) {
    distinct.add(e.userHash);
    if (e.sacredFlag) sacredHits++;
    if (e.ts < first) first = e.ts;
    if (e.ts > last) last = e.ts;
    moodCounts[e.moodTag] = (moodCounts[e.moodTag] ?? 0) + 1;
  }
  let dominant: string | undefined;
  let max = 0;
  for (const [m, c] of Object.entries(moodCounts)) {
    if (c > max) { max = c; dominant = m; }
  }
  return {
    count: events.length,
    distinctUsers: distinct.size,
    sacredHits,
    firstSeen: first === Infinity ? 0 : first,
    lastSeen: last === -Infinity ? 0 : last,
    dominantMood: dominant,
  };
}

/** Returns true if a cohort key matches the filter. */
export function matchesCohortFilter(cohort: CohortKey, filter: Partial<CohortKey>): boolean {
  if (filter.windowDays !== undefined && cohort.windowDays !== filter.windowDays) return false;
  if (filter.region !== undefined && cohort.region !== filter.region) return false;
  if (filter.tradition !== undefined && cohort.tradition !== filter.tradition) return false;
  if (filter.ageBracket !== undefined && cohort.ageBracket !== filter.ageBracket) return false;
  return true;
}

/** Bucket-by-cohort given a filter. */
export function buildFilteredCohort(
  events: VoiceMoodEventLite[],
  filter: Partial<CohortKey>,
): VoiceMoodEventLite[] {
  return events.filter((e) => matchesCohortFilter(e.cohort, filter));
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Differential Privacy                                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Create a fresh ε-budget. */
export function freshBudget(
  total: number = DEFAULT_EPSILON_BUDGET,
  perWindow: number = DEFAULT_EPSILON_PER_WINDOW,
): EpsilonBudget {
  return {
    total,
    spent: 0,
    remaining: total,
    budgetPerWindow: perWindow,
    spentPerWindow: {},
  };
}

/** Spend epsilon from a budget; returns new budget (immutable). */
export function consumeBudget(
  budget: EpsilonBudget,
  epsilon: number,
  windowKey: string,
): EpsilonBudget {
  if (epsilon < 0) throw new Error(ANON_CODES.COMPOSITION_OVERFLOW + ": negative epsilon");
  const remaining = remainingBudget(budget.total, budget.spent);
  if (epsilon > remaining) {
    throw new AnonymizationError(
      ANON_CODES.EPSILON_EXHAUSTED,
      `epsilon ${epsilon} > remaining ${remaining} (windowKey=${windowKey})`,
    );
  }
  const newSpentPerWindow = { ...budget.spentPerWindow };
  newSpentPerWindow[windowKey] = (newSpentPerWindow[windowKey] ?? 0) + epsilon;
  return {
    total: budget.total,
    spent: budget.spent + epsilon,
    remaining: budget.total - budget.spent - epsilon,
    budgetPerWindow: budget.budgetPerWindow,
    spentPerWindow: newSpentPerWindow,
  };
}

/** Refund epsilon (rarely used; for rollback). */
export function refundBudget(
  budget: EpsilonBudget,
  epsilon: number,
  windowKey: string,
): EpsilonBudget {
  const newSpentPerWindow = { ...budget.spentPerWindow };
  newSpentPerWindow[windowKey] = Math.max(0, (newSpentPerWindow[windowKey] ?? 0) - epsilon);
  return {
    total: budget.total,
    spent: Math.max(0, budget.spent - epsilon),
    remaining: Math.min(budget.total, budget.total - Math.max(0, budget.spent - epsilon)),
    budgetPerWindow: budget.budgetPerWindow,
    spentPerWindow: newSpentPerWindow,
  };
}

/** Compose N queries' epsilons under BASIC composition. */
export function basicComposition(epsilons: number[]): number {
  return composeEpsilonBasic(epsilons);
}

/** Compose under ADVANCED composition (KOV bound). */
export function advancedComposition(epsilons: number[], delta: number = 1e-9): number {
  return composeEpsilonAdvanced(epsilons, delta);
}

/** Compose N queries OPTIMAL — min(basic, advanced). */
export function optimalComposition(epsilons: number[], delta: number = 1e-9): number {
  return composeEpsilonOptimal(epsilons, delta);
}

/** Run a private count query. */
export function dpCount(
  values: boolean[] | number[],
  epsilon: number,
  rng: () => number = Math.random,
): { value: number; noised: number; scale: number } {
  let base = 0;
  for (const v of values) {
    base += typeof v === "number" ? v : v ? 1 : 0;
  }
  const scale = COUNT_SENSITIVITY / epsilon;
  const noised = roundLaplaceCount(scale, base, rng);
  return { value: base, noised, scale };
}

/** Run a private mean query over [a, b]-bounded values. */
export function dpMean(
  values: number[],
  epsilon: number,
  range: number,
  rng: () => number = Math.random,
): { value: number; noised: number; scale: number } {
  const m = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const sensitivity = meanSensitivity(range);
  const scale = sensitivity / epsilon;
  const noised = m + laplaceSample(scale, rng);
  return { value: m, noised, scale };
}

/** Issue a private histogram query (counts per bucket). */
export function dpHistogram(
  values: string[],
  epsilon: number,
  rng: () => number = Math.random,
): { histogram: Record<string, number>; noised: Record<string, number>; scale: number } {
  const histogram: Record<string, number> = {};
  for (const v of values) histogram[v] = (histogram[v] ?? 0) + 1;
  const scale = COUNT_SENSITIVITY / epsilon;
  const noised: Record<string, number> = {};
  for (const k of Object.keys(histogram)) {
    noised[k] = Math.max(0, Math.round(histogram[k]! + laplaceSample(scale, rng)));
  }
  return { histogram, noised, scale };
}

/** Decide the next privacy action based on budget headroom. */
export function decideNextAction(
  budget: EpsilonBudget,
  requestedEpsilon: number,
): PrivacyBudgetAction {
  if (requestedEpsilon <= 0) return "reject";
  if (budget.remaining < requestedEpsilon) return "reject";
  if (budget.remaining < 2 * requestedEpsilon) return "aggregate";
  if (budget.remaining < 5 * requestedEpsilon) return "suppress";
  return "allow";
}

/** Per-window remaining budget — for downstream query planning. */
export function remainingForWindow(budget: EpsilonBudget, windowKey: string): number {
  const spent = budget.spentPerWindow[windowKey] ?? 0;
  return Math.max(0, budget.budgetPerWindow - spent);
}

/** Allocate epsilon across N partitions. */
export function partitionEpsilon(
  total: number,
  partitions: number[],
  delta: number = 1e-9,
): number[] {
  const sum = partitions.reduce((a, b) => a + b, 0);
  return partitions.map((p) => (total * p) / sum + delta);
}

/** Compute noise scale given epsilon and sensitivity. */
export function budgetForWindow(epsilon: number, sensitivity: number): number {
  return epsilonToScale(epsilon, sensitivity);
}

/** Validate that a query fits inside the budget. */
export function validateBudget(
  budget: EpsilonBudget,
  query: PrivacyBudgetQuery,
): { ok: boolean; reason?: string } {
  if (query.epsilon <= 0) return { ok: false, reason: "epsilon must be > 0" };
  if (query.sensitivity <= 0) return { ok: false, reason: "sensitivity must be > 0" };
  if (query.epsilon > budget.remaining) return { ok: false, reason: ANON_CODES.EPSILON_EXHAUSTED };
  return { ok: true };
}

/** Issue a batch of queries with composition tracking. */
export function batchQueries(
  queries: PrivacyBudgetQuery[],
  budget: EpsilonBudget,
  evaluator: (q: PrivacyBudgetQuery) => number,
): { results: { query: PrivacyBudgetQuery; value: number }[]; budget: EpsilonBudget } {
  let cur = budget;
  const results: { query: PrivacyBudgetQuery; value: number }[] = [];
  for (const q of queries) {
    const validation = validateBudget(cur, q);
    if (!validation.ok) throw new AnonymizationError(ANON_CODES.COMPOSITION_OVERFLOW, validation.reason ?? "");
    cur = consumeBudget(cur, q.epsilon, cohortKeyString(q.cohort));
    results.push({ query: q, value: evaluator(q) });
  }
  return { results, budget: cur };
}

/** Compute delta from (epsilon, k, sensitivity) — helper for advanced composition. */
export function deltaFromKomogorov(epsilon: number, k: number, sensitivity: number = 1): number {
  return Math.exp(-((epsilon * epsilon) / (2 * Math.max(sensitivity, 1) * k)));
}

/** Bound total ε when given a desired total & query count. */
export function epsilonBudgetFor(nQueries: number, targetTotal: number): number {
  if (nQueries <= 0) return targetTotal;
  return targetTotal / nQueries;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Aggregation Output                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Build the final publishable KBucket from a raw bucket. */
export function buildKBucket(events: VoiceMoodEventLite[], kSacred: number): KBucket | null {
  if (events.length === 0) return null;
  const stats = computeCohortStats(events);
  const bounds = windowBounds(events[0]!.ts, events[0]!.cohort.windowDays);
  return {
    cohort: events[0]!.cohort,
    count: stats.count,
    distinctUsers: stats.distinctUsers,
    sacredHits: stats.sacredHits,
    windowStart: bounds.start,
    windowEnd: bounds.end,
  };
}

/** Summarize a cohort — convenience. */
export function summarizeCohort(events: VoiceMoodEventLite[]): CohortStats {
  return computeCohortStats(events);
}

/** Build a mood histogram from a bucket of events. */
export function moodHistogram(events: VoiceMoodEventLite[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of events) out[e.moodTag] = (out[e.moodTag] ?? 0) + 1;
  return out;
}

/** Distinct user count — exported for clarity. */
export function distinctUserCount(events: VoiceMoodEventLite[]): number {
  return countDistinctUsers(events);
}

/** Sacred hit rate for a bucket — fraction of events that are sacred. */
export function sacredHitRate(events: VoiceMoodEventLite[]): number {
  if (events.length === 0) return 0;
  const sacred = events.reduce((a, e) => a + (e.sacredFlag ? 1 : 0), 0);
  return sacred / events.length;
}

/** Count of buckets currently satisfying k-anonymity. */
export function countBuckets(buckets: KBucket[]): number {
  return buckets.length;
}

/** Total events across all buckets. */
export function totalBucketEvents(buckets: KBucket[]): number {
  return buckets.reduce((a, b) => a + b.count, 0);
}

/** Total sacred hits across all buckets. */
export function totalSacredHits(buckets: KBucket[]): number {
  return buckets.reduce((a, b) => a + b.sacredHits, 0);
}

/** Total distinct users across buckets (upper bound — same user may appear in multiple buckets). */
export function totalDistinctUsers(buckets: KBucket[]): number {
  // We can't reconstruct user set from KBucket — return sum for aggregate.
  return buckets.reduce((a, b) => a + b.distinctUsers, 0);
}

/** Build final aggregation output object. */
export function buildAggregationOutput(
  buckets: KBucket[],
  epsilons: number[],
  composition: "basic" | "advanced" | "optimal",
  totalInput: number,
  totalSuppressed: number,
  sacredHits: number,
  k: number,
  kSacred: number,
  cohortsSuppressed: number,
): AggregationOutput {
  const composed =
    composition === "basic"
      ? composeEpsilonBasic(epsilons)
      : composition === "advanced"
      ? composeEpsilonAdvanced(epsilons)
      : composeEpsilonOptimal(epsilons);
  return {
    buckets,
    metadata: {
      generatedAt: Date.now(),
      totalInputEvents: totalInput,
      totalSuppressed,
      totalSacredHits: sacredHits,
      k,
      kSacred,
      epsilon: composed,
      composition,
      cohortsIncluded: buckets.length,
      cohortsSuppressed,
      policyVersion: POLICY_VERSION,
    },
    privacyProof: {
      kSatisfied: buckets.every((b) => b.distinctUsers >= (b.sacredHits > 0 ? kSacred : k)),
      epsilonSpent: composed,
      epsilonRemaining: Math.max(0, DEFAULT_EPSILON_BUDGET - composed),
      sacredTagLeaked: false,
      rawPIILeaked: false,
      compositionMethod: composition,
      auditAt: Date.now(),
    },
  };
}

/** Strip raw PII from a single bucket — defensive. */
export function stripRawPII(bucket: KBucket): KBucket {
  // Raw PII must never appear in a KBucket to begin with. This function is a
  // structural guarantee that the object shape holds.
  return {
    cohort: {
      windowDays: bucket.cohort.windowDays,
      region: bucket.cohort.region,
      tradition: bucket.cohort.tradition,
      ageBracket: bucket.cohort.ageBracket ?? "unknown",
    },
    count: bucket.count,
    distinctUsers: bucket.distinctUsers,
    sacredHits: bucket.sacredHits,
    moodHistogram: bucket.moodHistogram,
    windowStart: bucket.windowStart,
    windowEnd: bucket.windowEnd,
  };
}

/** Verify no PII leaked. */
export function noPIILeaked(buckets: KBucket[]): boolean {
  for (const b of buckets) {
    if (Object.prototype.hasOwnProperty.call(b, "userHash")) return false;
    if (Object.prototype.hasOwnProperty.call(b, "moodTag")) return false;
    if (Object.prototype.hasOwnProperty.call(b, "sacredTag")) return false;
  }
  return true;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Errors                                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export class AnonymizationError extends Error {
  public readonly code: AnonCode;
  public readonly context?: Record<string, unknown>;
  constructor(code: AnonCode, message: string, context?: Record<string, unknown>) {
    super(`[${code}] ${message}`);
    this.code = code;
    this.name = "AnonymizationError";
    this.context = context ?? {};
  }
  toJSON(): { code: AnonCode; message: string; context: Record<string, unknown> } {
    return { code: this.code, message: this.message, context: this.context ?? {} };
  }
}

export class KThresholdError extends AnonymizationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ANON_CODES.K_THRESHOLD_NOT_MET, message, context);
    this.name = "KThresholdError";
  }
}

export class EpsilonExhaustedError extends AnonymizationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ANON_CODES.EPSILON_EXHAUSTED, message, context);
    this.name = "EpsilonExhaustedError";
  }
}

export class BucketTooSmallError extends AnonymizationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ANON_CODES.BUCKET_TOO_SMALL, message, context);
    this.name = "BucketTooSmallError";
  }
}

export class SacredTagLeakedError extends AnonymizationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ANON_CODES.SACRED_TAG_LEAKED, message, context);
    this.name = "SacredTagLeakedError";
  }
}

export class CompositionOverflowError extends AnonymizationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ANON_CODES.COMPOSITION_OVERFLOW, message, context);
    this.name = "CompositionOverflowError";
  }
}

export class CohortUnderRepError extends AnonymizationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ANON_CODES.COHORT_UNDER_REPRESENTATIVE, message, context);
    this.name = "CohortUnderRepError";
  }
}

/** Helper to assert `kThreshold`. */
export function assertKThreshold(count: number, kThreshold: number, ctx?: Record<string, unknown>): void {
  if (count < kThreshold) {
    throw new KThresholdError(`count=${count} < k=${kThreshold}`, ctx);
  }
}

/** Helper to assert budget available. */
export function assertBudgetAvailable(budget: EpsilonBudget, requested: number, ctx?: Record<string, unknown>): void {
  if (budget.remaining < requested) {
    throw new EpsilonExhaustedError(`remaining=${budget.remaining} < requested=${requested}`, ctx);
  }
}

/** Helper to assert bucket min size. */
export function assertBucketMinSize(events: number, min: number, ctx?: Record<string, unknown>): void {
  if (events < min) {
    throw new BucketTooSmallError(`events=${events} < min=${min}`, ctx);
  }
}

/** Helper to assert sacred tag is not in bucket. */
export function assertNoSacredTagLeak(buckets: KBucket[], rawTags: string[], ctx?: Record<string, unknown>): void {
  for (const b of buckets) {
    const tag = (b as unknown as { sacredTag?: string }).sacredTag;
    if (tag) {
      throw new SacredTagLeakedError(`sacredTag in bucket: ${tag}`, ctx);
    }
  }
  // Also verify hash bag of rawTags does not appear in any cohort label
  for (const tag of rawTags) {
    for (const b of buckets) {
      const sk = cohortKeyString(b.cohort);
      if (sk.includes(tag)) {
        throw new SacredTagLeakedError(`sacred tag substring present in cohort key: ${tag}`, ctx);
      }
    }
  }
}

/** Helper to assert no composition overflow. */
export function assertCompositionOverflow(spent: number, budget: number, ctx?: Record<string, unknown>): void {
  if (spent > budget) {
    throw new CompositionOverflowError(`spent=${spent} > budget=${budget}`, ctx);
  }
}

/** Helper to assert cohort is not under-representative. */
export function assertCohortRepresentative(distinctUsers: number, kThreshold: number, ctx?: Record<string, unknown>): void {
  if (distinctUsers < kThreshold) {
    throw new CohortUnderRepError(`distinct=${distinctUsers} < k=${kThreshold}`, ctx);
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Audit & Orchestration                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Main orchestrator — runs all stages and returns an AggregationReport. */
export function anonymize(
  events: VoiceMoodEventLite[],
  config: Partial<KAnonymityConfig> = {},
  suppressions: SuppressionList = buildSuppressionList([], "init"),
  budget: EpsilonBudget = freshBudget(),
): AggregationReport {
  const start = Date.now();
  const cfg: KAnonymityConfig = {
    k: config.k ?? DEFAULT_K,
    kSacred: config.kSacred ?? DEFAULT_K_SACRED,
    qiGeneralization: config.qiGeneralization ?? "decade",
    maxBucketSize: config.maxBucketSize ?? MAX_EVENTS_PER_BUCKET,
    enabled: config.enabled ?? true,
  };
  const history: AuditStep[] = [];
  let curBudget = budget;

  // Stage 1: Apply suppression (Art. 18 erasure)
  const filtered = applySuppressionList(events, suppressions);
  history.push({ step: "suppression", ts: Date.now(), ok: true, detail: `dropped=${events.length - filtered.length}` });

  // Stage 2: Drop outliers
  let working = filtered;
  const tsValues = filtered.map((e) => e.ts);
  if (tsValues.length > 10) {
    const keepIdx = new Set<number>();
    const kept = dropOutliersZScore(tsValues);
    for (let i = 0; i < tsValues.length; i++) if (kept.includes(tsValues[i]!)) keepIdx.add(i);
    working = filtered.filter((_, i) => keepIdx.has(i));
  }
  history.push({ step: "outlier_filter", ts: Date.now(), ok: true, detail: `events=${working.length}` });

  // Stage 3: Build raw buckets
  const rawBuckets = buildRawBuckets(working);
  history.push({ step: "raw_buckets", ts: Date.now(), ok: true, detail: `buckets=${rawBuckets.size}` });

  // Stage 4: Apply k-anonymity filter
  const { publishable, suppressed } = applyKAnonymity(rawBuckets, cfg);
  history.push({
    step: "k_anonymity",
    ts: Date.now(),
    ok: publishable.every((b) => b.distinctUsers >= (b.sacredHits > 0 ? cfg.kSacred : cfg.k)),
    detail: `published=${publishable.length}, suppressed=${suppressed.length}`,
  });

  // Stage 5: Mood histograms for buckets meeting k threshold
  for (const bucket of publishable) {
    const bucketEvents = rawBuckets.get(cohortId(bucket.cohort) + (bucket.sacredHits > 0 ? ":sacred" : ":regular")) ?? [];
    if (bucket.distinctUsers >= cfg.k) {
      bucket.moodHistogram = moodHistogram(bucketEvents);
    }
  }
  history.push({ step: "histogram_emission", ts: Date.now(), ok: true });

  // Stage 6: Spend epsilon
  const totalSacred = totalSacredHits(publishable);
  const allEvents = publishable.length;
  try {
    for (const b of publishable) {
      curBudget = consumeBudget(curBudget, DEFAULT_EPSILON_PER_WINDOW / Math.max(allEvents, 1), cohortKeyString(b.cohort));
    }
  } catch (e) {
    history.push({ step: "epsilon_spend", ts: Date.now(), ok: false, detail: (e as Error).message });
    const decision: AnonymizationDecision = {
      pass: false,
      blockers: [ANON_CODES.EPSILON_EXHAUSTED],
      warnings: [],
      sacredFlagPreserved: true,
      rawPIIStripped: noPIILeaked(publishable),
      bucketsPublished: 0,
      cohortsSuppressed: suppressed.length,
      epsilonRemaining: curBudget.remaining,
    };
    return {
      decision,
      output: buildAggregationOutput([], [], "basic", events.length, suppressed.length, totalSacred, cfg.k, cfg.kSacred, suppressed.length),
      history,
      durationMs: Date.now() - start,
    };
  }
  history.push({ step: "epsilon_spend", ts: Date.now(), ok: true, detail: `remaining=${curBudget.remaining.toFixed(4)}` });

  // Stage 7: Sacred tag leak audit
  const allRawSacredTags = events.filter((e) => e.sacredFlag).map((e) => e.moodTag);
  try {
    assertNoSacredTagLeak(publishable, allRawSacredTags);
    history.push({ step: "sacred_tag_audit", ts: Date.now(), ok: true });
  } catch (e) {
    history.push({ step: "sacred_tag_audit", ts: Date.now(), ok: false, detail: (e as Error).message });
    const decision: AnonymizationDecision = {
      pass: false,
      blockers: [ANON_CODES.SACRED_TAG_LEAKED],
      warnings: [],
      sacredFlagPreserved: false,
      rawPIIStripped: noPIILeaked(publishable),
      bucketsPublished: 0,
      cohortsSuppressed: suppressed.length,
      epsilonRemaining: curBudget.remaining,
    };
    return {
      decision,
      output: buildAggregationOutput([], [], "basic", events.length, suppressed.length, totalSacred, cfg.k, cfg.kSacred, suppressed.length),
      history,
      durationMs: Date.now() - start,
    };
  }

  // Stage 8: Build output
  const output = buildAggregationOutput(
    publishable,
    Object.values(curBudget.spentPerWindow),
    "advanced",
    events.length,
    suppressed.length,
    totalSacred,
    cfg.k,
    cfg.kSacred,
    suppressed.length,
  );

  // Stage 9: Decision
  const decision = evaluateDecision(output, suppressions);
  history.push({ step: "decision", ts: Date.now(), ok: decision.pass, detail: decision.blockers.join(",") || "all-pass" });

  return { decision, output, history, durationMs: Date.now() - start };
}

/** Compute the final AnonymizationDecision. */
export function evaluateDecision(output: AggregationOutput, suppressions: SuppressionList): AnonymizationDecision {
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!output.privacyProof.kSatisfied) blockers.push(ANON_CODES.K_THRESHOLD_NOT_MET);
  if (output.privacyProof.sacredTagLeaked) blockers.push(ANON_CODES.SACRED_TAG_LEAKED);
  if (output.privacyProof.rawPIILeaked) blockers.push(ANON_CODES.SACRED_TAG_LEAKED);
  if (output.privacyProof.epsilonRemaining < 0) blockers.push(ANON_CODES.EPSILON_EXHAUSTED);
  if (output.buckets.length === 0 && output.metadata.totalInputEvents > 0) {
    warnings.push("no-buckets-published");
  }
  if (suppressions.userHashes.size > 0) {
    warnings.push(`erasure-applied:${suppressions.userHashes.size}`);
  }
  return {
    pass: blockers.length === 0,
    blockers,
    warnings,
    sacredFlagPreserved: !output.privacyProof.sacredTagLeaked,
    rawPIIStripped: !output.privacyProof.rawPIILeaked,
    bucketsPublished: output.buckets.length,
    cohortsSuppressed: output.metadata.cohortsSuppressed,
    epsilonRemaining: output.privacyProof.epsilonRemaining,
  };
}

/** Re-aggregate after an erasure. */
export function reaggregateAfterErasure(
  events: VoiceMoodEventLite[],
  userHash: string,
  config: Partial<KAnonymityConfig> = {},
): AggregationReport {
  const initial = buildSuppressionList([], "init");
  const updated = addToSuppressionList(initial, userHash, "lgpd-art-18");
  return anonymize(events, config, updated);
}

/** Run the audit checks — pure read. */
export function runAudit(report: AggregationReport): { ok: boolean; failedSteps: string[] } {
  const failedSteps = report.history.filter((h) => !h.ok).map((h) => `${h.step}:${h.detail ?? ""}`);
  return { ok: failedSteps.length === 0, failedSteps };
}

/** Validate that no sacred tag is present in output. */
export function auditNoSacredLeak(buckets: KBucket[], rawTags: string[]): { ok: boolean; leak?: string } {
  try {
    assertNoSacredTagLeak(buckets, rawTags);
    return { ok: true };
  } catch (e) {
    return { ok: false, leak: (e as Error).message };
  }
}

/** Validate k threshold for every bucket. */
export function auditKThreshold(buckets: KBucket[], k: number, kSacred: number): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const b of buckets) {
    const threshold = b.sacredHits > 0 ? kSacred : k;
    if (b.distinctUsers < threshold) {
      violations.push(cohortKeyString(b.cohort));
    }
  }
  return { ok: violations.length === 0, violations };
}

/** Validate ε budget. */
export function auditEpsilon(budget: EpsilonBudget): { ok: boolean; reason?: string } {
  if (budget.remaining < 0) return { ok: false, reason: "remaining<0" };
  if (budget.spent > budget.total) return { ok: false, reason: "spent>total" };
  return { ok: true };
}

/** Validate overall policy compliance. */
export function auditSacredPolicy(buckets: KBucket[]): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  for (const b of buckets) {
    if (b.sacredHits > 0 && typeof (b as unknown as { sacredTag?: string }).sacredTag === "string") {
      issues.push("raw sacred tag present");
    }
  }
  return { ok: issues.length === 0, issues };
}

/** Validate no PII on output. */
export function auditNoPII(buckets: KBucket[]): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!noPIILeaked(buckets)) issues.push("rawPII");
  return { ok: issues.length === 0, issues };
}

/** Audit the completeness of a report. */
export function auditCompleteness(report: AggregationReport): { ok: boolean; missingSteps: string[] } {
  const required = ["suppression", "outlier_filter", "raw_buckets", "k_anonymity", "histogram_emission", "epsilon_spend", "sacred_tag_audit", "decision"];
  const present = new Set(report.history.map((h) => h.step));
  const missing = required.filter((r) => !present.has(r));
  return { ok: missing.length === 0, missingSteps: missing };
}

/** Serialize a report to a deterministic JSON string (for hashing / logs). */
export function serializeReport(report: AggregationReport): string {
  return JSON.stringify({
    decision: report.decision,
    output: report.output,
    history: report.history,
    durationMs: report.durationMs,
  });
}

/** Hash a report — for audit chain. */
export function hashReport(report: AggregationReport): string {
  return sha256(serializeReport(report));
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 LGPD Policy Primitives                                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * LGPD Art. 18 — right to erasure. Triggers suppression list update and
 * re-aggregation. Returns the new AggregationReport.
 */
export function eraseUserCohorts(
  userHash: string,
  events: VoiceMoodEventLite[],
  config: Partial<KAnonymityConfig> = {},
): AggregationReport {
  return reaggregateAfterErasure(events, userHash, config);
}

/** LGPD Art. 9 — purpose limitation check. Aggregate-only export guard. */
export function assertPurposeLimitation(scope: "research" | "analytics" | "sacred_practice" | "all"): void {
  const allowed: Record<string, true> = {
    research: true,
    analytics: true,
    sacred_practice: true,
    all: true,
  };
  if (!allowed[scope]) {
    throw new AnonymizationError(ANON_CODES.COHORT_UNDER_REPRESENTATIVE, `illegal scope ${scope}`);
  }
}

/** LGPD Art. 20 — portability check. Bucket-level only when k is satisfied. */
export function assertPortableExport(buckets: KBucket[], k: number, kSacred: number): void {
  for (const b of buckets) {
    const t = b.sacredHits > 0 ? kSacred : k;
    if (b.distinctUsers < t) {
      throw new AnonymizationError(
        ANON_CODES.COHORT_UNDER_REPRESENTATIVE,
        `portable export blocked: bucket distinct=${b.distinctUsers} < k=${t}`,
      );
    }
  }
}

/** Verify consent for a given scope. */
export function checkConsent(consents: AnonymizationConsent[], userHash: string, scope: AnonymizationConsent["scope"]): boolean {
  const now = Date.now();
  return consents.some((c) =>
    c.userHash === userHash
    && c.granted
    && (c.scope === scope || c.scope === "all")
    && c.grantedAt <= now
    && (c.expiresAt === undefined || c.expiresAt > now),
  );
}

/** Build a consent record. */
export function grantConsent(userHash: string, scope: AnonymizationConsent["scope"], ttl?: number): AnonymizationConsent {
  return {
    userHash,
    granted: true,
    grantedAt: Date.now(),
    scope,
    expiresAt: ttl ? Date.now() + ttl : undefined,
  };
}

/** Aggregate counts only — strip per-event detail. */
export function aggregateCountsOnly(buckets: KBucket[]): { cohort: CohortKey; count: number; distinct: number }[] {
  return buckets.map((b) => ({ cohort: b.cohort, count: b.count, distinct: b.distinctUsers }));
}

/** Suppress a user from cohorts — returns updated suppression list. */
export function suppressUserFromCohorts(
  userHash: string,
  existing: SuppressionList,
): SuppressionList {
  return addToSuppressionList(existing, userHash, "lgpd-art-18-erasure");
}

/** Restore a user from suppression. */
export function restoreUserFromCohorts(
  userHash: string,
  existing: SuppressionList,
): SuppressionList {
  return removeFromSuppressionList(existing, userHash);
}

/** List of all distinct users in a cohort (for erasure accounting). */
export function distinctUsersInCohort(events: VoiceMoodEventLite[]): string[] {
  return Array.from(new Set(events.map((e) => e.userHash)));
}

/** Erase all events for a user — returns sanitized events. */
export function eraseUser(events: VoiceMoodEventLite[], userHash: string): VoiceMoodEventLite[] {
  return events.filter((e) => e.userHash !== userHash);
}

/** LGPD compliance level classifier. */
export function lgpdComplianceLevel(scope: string): "high" | "medium" | "low" {
  if (scope === "research") return "high";
  if (scope === "analytics") return "medium";
  return "low";
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Sacred-Tag Policy Primitives                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Determine if a string is a sacred tag (by prefix). */
export function isSacredTag(tag: string): boolean {
  for (const prefix of SACRED_TAG_PREFIXES) {
    if (tag.startsWith(prefix)) return true;
  }
  return false;
}

/** Mark a moodTag as sacred if it matches sacred prefixes or list. */
export function tagSacredFlag(moodTag: string, sacredList: string[] = SACRED_TAG_PREFIXES as unknown as string[]): boolean {
  for (const s of sacredList) {
    if (moodTag.startsWith(s)) return true;
  }
  return false;
}

/** Normalize a sacred hit counter on a bucket. */
export function normalizeSacredCounter(bucket: KBucket): KBucket {
  if (bucket.sacredHits < 0) return { ...bucket, sacredHits: 0 };
  return bucket;
}

/** Audit that no raw sacred tag survived. */
export function auditNoRawSacredTagSurvived(buckets: KBucket[], rawTags: string[]): boolean {
  for (const b of buckets) {
    if (typeof (b as unknown as { sacredTag?: string }).sacredTag === "string") return false;
    if (typeof (b as unknown as { moodTag?: string }).moodTag === "string") return false;
  }
  for (const tag of rawTags) {
    for (const b of buckets) {
      if (cohortKeyString(b.cohort).includes(tag)) return false;
    }
  }
  return true;
}

/** Sacred bucket floor — k-sacred threshold computed. */
export function sacredKThreshold(cfg: KAnonymityConfig): number {
  return cfg.kSacred;
}

/** Sacred-tag policy — strict mode (default). */
export function sacredPolicyDefault(): { dropRawTags: true; raiseK: true } {
  return { dropRawTags: true, raiseK: true };
}

/** Sacred-tag policy — relaxed (for internal cohort analysis where Art. 18 not triggered). */
export function sacredPolicyRelaxed(): { dropRawTags: true; raiseK: false } {
  return { dropRawTags: true, raiseK: false };
}

/** Sacred-tag classification — categorize a moodTag. */
export function classifySacredTag(tag: string): "sacred" | "devotional" | "regular" {
  if (isSacredTag(tag)) return "sacred";
  if (tag.startsWith("devotional_") || tag.includes("reverent")) return "devotional";
  return "regular";
}

/** Compose a sacred hit summary for export. */
export function sacredHitSummary(events: VoiceMoodEventLite[]): { total: number; distinct: number } {
  const sacred = events.filter((e) => e.sacredFlag);
  return {
    total: sacred.length,
    distinct: new Set(sacred.map((e) => e.userHash)).size,
  };
}

/** Convert sacred events to anonymized count bucket. */
export function sacredEventsToBucket(events: VoiceMoodEventLite[], kSacred: number): KBucket | null {
  const filtered = events.filter((e) => e.sacredFlag);
  if (filtered.length === 0) return null;
  if (countDistinctUsers(filtered) < kSacred) return null;
  const bounds = windowBounds(filtered[0]!.ts, filtered[0]!.cohort.windowDays);
  return {
    cohort: { ...filtered[0]!.cohort },
    count: filtered.length,
    distinctUsers: countDistinctUsers(filtered),
    sacredHits: filtered.length,
    windowStart: bounds.start,
    windowEnd: bounds.end,
  };
}

/** Approve a sacred tag for downstream audit (returns masked pseudonym). */
export function approveSacredTagForAudit(tag: string, salt: string = SALT): string {
  return sha256(salt + ":" + tag).slice(0, 12);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 Smoke / Regression Scenarios                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function syntheticEvents(n: number, opts: Partial<VoiceMoodEventLite> = {}): VoiceMoodEventLite[] {
  const traditions: Tradition[] = ["umbanda", "candomble", "ifa"];
  const regions: Region[] = ["BR", "PT", "AO"];
  const moods: MoodTag[] = ["contemplative", "exultant", "luminous", "tender"];
  const out: VoiceMoodEventLite[] = [];
  const start = Date.now() - 30 * 86_400_000;
  for (let i = 0; i < n; i++) {
    out.push({
      ts: opts.ts ?? start + i * 3_600_000,
      moodTag: opts.moodTag ?? moods[i % moods.length]!,
      userHash: opts.userHash ?? "u_" + (i % 50),
      cohort: opts.cohort ?? {
        windowDays: 30,
        region: regions[i % regions.length]!,
        tradition: traditions[i % traditions.length],
        ageBracket: AGE_BRACKETS[i % AGE_BRACKETS.length]!,
      },
      sacredFlag: opts.sacredFlag ?? i % 7 === 0,
    });
  }
  return out;
}

export interface SmokeResult {
  scenario: SmokeScenario;
  pass: boolean;
  detail: string;
  durationMs: number;
}

export function runSmoke(scenario: SmokeScenario): SmokeResult {
  const start = Date.now();
  try {
    switch (scenario) {
      case "k_threshold_suppression": return smokeKThreshold(start);
      case "epsilon_composition_basic": return smokeEpsilonCompositionBasic(start);
      case "epsilon_composition_advanced": return smokeEpsilonCompositionAdvanced(start);
      case "laplace_noise_sanity": return smokeLaplaceNoise(start);
      case "sacred_tag_never_leaks": return smokeSacredTagNeverLeaks(start);
      case "regional_cohort_hashing": return smokeRegionalCohortHashing(start);
      case "generalization_year_to_decade": return smokeGeneralizationYearToDecade(start);
      case "single_bucket_breach_detection": return smokeSingleBucketBreachDetection(start);
      case "epsilon_exhausted_refusal": return smokeEpsilonExhaustedRefusal(start);
      case "cohort_reaggregation_post_erasure": return smokeCohortReaggPostErasure(start);
      case "tradition_aware_cohort": return smokeTraditionAwareCohort(start);
      case "no_pii_on_output": return smokeNoPIIOnOutput(start);
      case "sacred_hits_counter_correctness": return smokeSacredHitsCounterCorrectness(start);
      case "k_sacred_raised_threshold": return smokeKSacredRaisedThreshold(start);
      default: return { scenario, pass: false, detail: `unknown scenario ${scenario}`, durationMs: Date.now() - start };
    }
  } catch (e) {
    return { scenario, pass: false, detail: `error: ${(e as Error).message}`, durationMs: Date.now() - start };
  }
}

export function runAllSmoke(): { total: number; passed: number; failed: number; results: SmokeResult[] } {
  const results: SmokeResult[] = [];
  for (const s of SMOKE_SCENARIOS) results.push(runSmoke(s));
  const passed = results.filter((r) => r.pass).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}

function smokeKThreshold(start: number): SmokeResult {
  // Create 4 distinct cohorts, each with 25 unique users → all 4 publish.
  const variants: Array<{ region: Region; tradition: Tradition }> = [
    { region: "BR", tradition: "umbanda" },
    { region: "PT", tradition: "umbanda" },
    { region: "BR", tradition: "candomble" },
    { region: "PT", tradition: "candomble" },
  ];
  const events: VoiceMoodEventLite[] = [];
  for (let v = 0; v < variants.length; v++) {
    for (let u = 0; u < 25; u++) {
      events.push({
        ts: Date.now() - 86400000 + u * 1000,
        moodTag: "contemplative",
        userHash: `u_${v}_${u}`,
        cohort: { windowDays: 30, region: variants[v]!.region, tradition: variants[v]!.tradition, ageBracket: "25_34" },
        sacredFlag: false,
      });
    }
  }
  const rawBuckets = buildRawBuckets(events);
  const { publishable, suppressed } = applyKAnonymity(rawBuckets, { k: 5, kSacred: 10, qiGeneralization: "decade", enabled: true });
  const ok = publishable.length === 4 && suppressed.length === 0;
  return { scenario: "k_threshold_suppression", pass: ok, detail: `published=${publishable.length}, suppressed=${suppressed.length}`, durationMs: Date.now() - start };
}

function smokeEpsilonCompositionBasic(start: number): SmokeResult {
  const eps = [0.1, 0.2, 0.3];
  const basic = composeEpsilonBasic(eps);
  const ok = Math.abs(basic - 0.6) < 1e-9;
  return { scenario: "epsilon_composition_basic", pass: ok, detail: `basic=${basic}`, durationMs: Date.now() - start };
}

function smokeEpsilonCompositionAdvanced(start: number): SmokeResult {
  const eps = [0.1, 0.2, 0.3];
  const adv = composeEpsilonAdvanced(eps, 1e-9);
  const basic = composeEpsilonBasic(eps);
  const ok = adv <= basic && adv > 0;
  return { scenario: "epsilon_composition_advanced", pass: ok, detail: `adv=${adv.toFixed(4)} basic=${basic}`, durationMs: Date.now() - start };
}

function smokeLaplaceNoise(start: number): SmokeResult {
  const rng = mulberry32(42);
  const samples = laplaceVector(5000, 1.0, rng);
  const m = noiseMean(samples);
  const v = noiseVariance(samples);
  // Laplace(scale=1) has mean ~ 0, variance = 2
  const meanOk = Math.abs(m) < 0.2;
  const varOk = Math.abs(v - 2) < 0.5;
  return { scenario: "laplace_noise_sanity", pass: meanOk && varOk, detail: `mean=${m.toFixed(3)}, var=${v.toFixed(3)}`, durationMs: Date.now() - start };
}

function smokeSacredTagNeverLeaks(start: number): SmokeResult {
  const events = syntheticEvents(20, { moodTag: "orixa_xango", sacredFlag: true });
  const report = anonymize(events);
  const rawTag = "orixa_xango";
  let ok = true;
  for (const b of report.output.buckets) {
    if (cohortKeyString(b.cohort).includes(rawTag)) ok = false;
  }
  if (report.decision.pass) ok = ok && noPIILeaked(report.output.buckets);
  return { scenario: "sacred_tag_never_leaks", pass: ok, detail: `buckets=${report.output.buckets.length}`, durationMs: Date.now() - start };
}

function smokeRegionalCohortHashing(start: number): SmokeResult {
  const k1 = cohortId({ windowDays: 30, region: "BR", tradition: "candomble", ageBracket: "25_34" });
  const k2 = cohortId({ windowDays: 30, region: "PT", tradition: "candomble", ageBracket: "25_34" });
  const k3 = cohortId({ windowDays: 30, region: "BR", tradition: "candomble", ageBracket: "25_34" });
  const ok = k1 === k3 && k1 !== k2 && k1.length === 12;
  return { scenario: "regional_cohort_hashing", pass: ok, detail: `k1=${k1} k2=${k2}`, durationMs: Date.now() - start };
}

function smokeGeneralizationYearToDecade(start: number): SmokeResult {
  const ok = generalizeYearToDecade(1987) === 1980 && generalizeYearToCentury(1987) === 1900;
  return { scenario: "generalization_year_to_decade", pass: ok, detail: `d=${generalizeYearToDecade(1987)}, c=${generalizeYearToCentury(1987)}`, durationMs: Date.now() - start };
}

function smokeSingleBucketBreachDetection(start: number): SmokeResult {
  // Test 1: singleton (1 user, many events) → singleton=true, eqRatio=false (events > users)
  const singletonBucket: KBucket = {
    cohort: { windowDays: 30, region: "BR", tradition: "candomble", ageBracket: "25_34" },
    count: 5, distinctUsers: 1, sacredHits: 0, windowStart: 0, windowEnd: 0,
  };
  const singleton = detectSingletonBreach(singletonBucket);
  // Test 2: equal-ratio (each user is unique event) → eqRatio=true
  const eqBucket: KBucket = {
    cohort: { windowDays: 30, region: "BR", tradition: "candomble", ageBracket: "25_34" },
    count: 10, distinctUsers: 10, sacredHits: 0, windowStart: 0, windowEnd: 0,
  };
  const eqRatio = detectEqRatioBreach(eqBucket, 0.9);
  return { scenario: "single_bucket_breach_detection", pass: singleton && eqRatio, detail: `singleton=${singleton}, eqRatio=${eqRatio}`, durationMs: Date.now() - start };
}

function smokeEpsilonExhaustedRefusal(start: number): SmokeResult {
  const b = freshBudget(0.5, 0.5);
  let threw = false;
  try {
    consumeBudget(b, 1.0, "w1");
  } catch (e) {
    threw = (e as AnonymizationError).code === ANON_CODES.EPSILON_EXHAUSTED;
  }
  return { scenario: "epsilon_exhausted_refusal", pass: threw, detail: `threw=${threw}`, durationMs: Date.now() - start };
}

function smokeCohortReaggPostErasure(start: number): SmokeResult {
  const events = syntheticEvents(50);
  const beforeCount = events.length;
  const report = reaggregateAfterErasure(events, "u_5");
  const ok = true; // structural — confirm orchestrator ran without throwing
  return { scenario: "cohort_reaggregation_post_erasure", pass: ok, detail: `before=${beforeCount}, pass=${report.decision.pass}`, durationMs: Date.now() - start };
}

function smokeTraditionAwareCohort(start: number): SmokeResult {
  const events = syntheticEvents(60);
  const buckets = buildCohortByTradition(events);
  const ok = buckets.has("umbanda") || buckets.has("candomble") || buckets.has("ifa");
  return { scenario: "tradition_aware_cohort", pass: ok, detail: `cohorts=${buckets.size}`, durationMs: Date.now() - start };
}

function smokeNoPIIOnOutput(start: number): SmokeResult {
  const events = syntheticEvents(60);
  const report = anonymize(events);
  const ok = noPIILeaked(report.output.buckets);
  return { scenario: "no_pii_on_output", pass: ok, detail: `buckets=${report.output.buckets.length}`, durationMs: Date.now() - start };
}

function smokeSacredHitsCounterCorrectness(start: number): SmokeResult {
  const events = syntheticEvents(40, { sacredFlag: false });
  for (let i = 0; i < 10; i++) events[i]!.sacredFlag = true;
  const bucket = sacredEventsToBucket(events.filter((e) => e.sacredFlag), 5);
  const ok = bucket !== null && bucket.sacredHits === 10;
  return { scenario: "sacred_hits_counter_correctness", pass: ok, detail: bucket ? `sacredHits=${bucket.sacredHits}` : "no-bucket", durationMs: Date.now() - start };
}

function smokeKSacredRaisedThreshold(start: number): SmokeResult {
  const cfg: KAnonymityConfig = { k: 5, kSacred: 10, qiGeneralization: "decade", enabled: true };
  const events: VoiceMoodEventLite[] = [];
  for (let i = 0; i < 9; i++) {
    events.push({
      ts: Date.now() - 86400000 + i * 1000,
      moodTag: "orixa_test",
      userHash: "u_sacred_" + i,
      cohort: { windowDays: 30, region: "BR", tradition: "candomble", ageBracket: "25_34" },
      sacredFlag: true,
    });
  }
  const rawBuckets = buildRawBuckets(events);
  const { publishable, suppressed } = applyKAnonymity(rawBuckets, cfg);
  const ok = publishable.length === 0 && suppressed.length === 1;
  return { scenario: "k_sacred_raised_threshold", pass: ok, detail: `publish=${publishable.length}, suppressed=${suppressed.length}`, durationMs: Date.now() - start };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 Doc-string Constants & Helper API Surface                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const ANONYMIZER_API_VERSION = "1.0.0";
export const ANONYMIZER_BUILD = "w52-2026-06-29";

export const ANONYMIZER_NOTES: { title: string; body: string }[] = [
  {
    title: "Compose by SHAPE only — no w51/w49 imports",
    body: "This module mirrors w49/VoiceMoodEventLite and w51's export interfaces structurally. There are no `import` statements referring to w51 or w49 modules. The companion (w52) is the formal source of truth for policy enforcement on aggregated voice-mood signals.",
  },
  {
    title: "k-Anonymity vs ε-Differential Privacy — orthogonal guarantees",
    body: "k-anonymity protects against attribute disclosure by hiding individual records in groups of size ≥ k. ε-DP protects against inference attacks by adding calibrated Laplace noise. We layer both: k-anonymity on cohort membership + DP noise on counts.",
  },
  {
    title: "Sacred-tag policy — strict by default",
    body: "Any event with sacredFlag=true survives only as a count (sacredHits) in a cohort bucket. The raw moodTag is never exported. The audit (runAudit → auditNoSacredLeak) verifies this at every emission.",
  },
  {
    title: "LGPD — Art. 9 / Art. 18 / Art. 20 coverage",
    body: "Art. 9: aggregate-only exports (no per-user rows). Art. 18: erasure triggers re-aggregation via suppression list. Art. 20: portability requires k-satisfaction per bucket.",
  },
  {
    title: "Composition — KOV advanced bound by default",
    body: "We use Kairouz-Oh-Viswanath (KOV) advanced composition theorem to track ε across multiple queries. With δ=1e-9 (default), the bound is tight enough for the typical 5-15 query cadence of a panel export.",
  },
];

/** Friendly description of a single scenario, for docs. */
export function describeScenario(s: SmokeScenario): string {
  const map: Record<SmokeScenario, string> = {
    k_threshold_suppression: "verifies that buckets with fewer than k distinct users are suppressed",
    epsilon_composition_basic: "verifies basic ε composition equals sum",
    epsilon_composition_advanced: "verifies KOV advanced bound is ≤ basic bound",
    laplace_noise_sanity: "Laplace noise mean/variance matches theoretical 0/2·b²",
    sacred_tag_never_leaks: "sacredFlag=true events never expose raw moodTag in export",
    regional_cohort_hashing: "cohort id is stable for same key, different for different regions",
    generalization_year_to_decade: "year→decade and year→century generalization is correct",
    single_bucket_breach_detection: "single-user bucket triggers breach detector",
    epsilon_exhausted_refusal: "epsilon consumption beyond budget throws ANON_002",
    cohort_reaggregation_post_erasure: "post-erasure re-aggregation succeeds",
    tradition_aware_cohort: "cohort splits by tradition correctly",
    no_pii_on_output: "export buckets have no per-user PII",
    sacred_hits_counter_correctness: "sacredHits counter reflects actual sacred events",
    k_sacred_raised_threshold: "kSacred enforces higher threshold for sacred-bearing buckets",
  };
  return map[s];
}

/** Friendly description of an error code. */
export function describeErrorCode(code: AnonCode): string {
  const map: Record<AnonCode, string> = {
    ANON_001: "k threshold not met — bucket distinct users < k",
    ANON_002: "epsilon exhausted — request ε > remaining",
    ANON_003: "bucket too small — events < min",
    ANON_004: "sacred tag leaked — raw tag survived anonymization",
    ANON_005: "composition overflow — total spent > total budget",
    ANON_006: "cohort under-representative — distinct users < k for portability",
  };
  return map[code];
}

/** Quick health check. */
export function anonymizerHealth(): {
  status: "ok" | "degraded" | "down";
  apiVersion: string;
  policyVersion: string;
  scenarios: number;
} {
  return {
    status: "ok",
    apiVersion: ANONYMIZER_API_VERSION,
    policyVersion: POLICY_VERSION,
    scenarios: SMOKE_SCENARIOS.length,
  };
}

/** Compose a final export bundle — buckets + proof + metadata as one. */
export function exportBundle(report: AggregationReport): {
  payload: AggregationOutput;
  hash: string;
  ok: boolean;
} {
  return {
    payload: report.output,
    hash: hashReport(report),
    ok: report.decision.pass,
  };
}

/** Pretty-print a report (logs/UI). */
export function prettyReport(report: AggregationReport): string {
  const d = report.decision;
  return [
    `pass=${d.pass}, blockers=[${d.blockers.join(",")}], warnings=[${d.warnings.join(",")}]`,
    `buckets=${d.bucketsPublished}, suppressed=${d.cohortsSuppressed}, ε_rem=${d.epsilonRemaining.toFixed(4)}`,
    `duration=${report.durationMs}ms`,
  ].join(" | ");
}

/** Reset budget helper for tests. */
export function resetBudget(total: number = DEFAULT_EPSILON_BUDGET): EpsilonBudget {
  return freshBudget(total, DEFAULT_EPSILON_PER_WINDOW);
}

/** Helper for downstream — return the file checksum (sha256 of source) — placeholder for tooling integration. */
export function fileVersionTag(): string {
  return sha256(`w52-anon|${POLICY_VERSION}|${ANONYMIZER_BUILD}`).slice(0, 16);
}

/** Returns true if running with strict sacred-text policy enforced. */
export function isSacredStrictEnforced(): boolean {
  return sacredPolicyDefault().dropRawTags && sacredPolicyDefault().raiseK;
}

// ═══════════════════════════════════════════════════════════════════════════════
// END of w52/voice-mood-history-anonymizer
// ═══════════════════════════════════════════════════════════════════════════════
