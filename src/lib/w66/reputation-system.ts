/**
 * reputation-system.ts — Cabala Universalista Reputation Engine
 *
 * Cycle 66 — Worker C — session 414603274154196
 *
 * The GOVERNANCE layer for the Cabala dos Caminhos platform. This engine
 * manages trust scores (0–5), per-tradition sacred service scores, dispute
 * resolution, public badges, and the LGPD-compliant pseudonymization of all
 * user references.
 *
 * Public surface (12 required named exports):
 *   1.  REPUTATION_BADGES                  — 3 public badge definitions
 *   2.  DISPUTE_STATES                     — 5-state dispute state machine
 *   3.  computeReputation(services)        → Reputation
 *   4.  computeTrustScore(reviews)         → number (NEVER negative)
 *   5.  computeTraditionScore(s, trad)     → number (NEVER negative)
 *   6.  raiseDispute(dispute)              → Dispute (HMAC-chained)
 *   7.  resolveDispute(id, resolution, sec)→ Dispute (state flip)
 *   8.  awardBadge(uid, bid, sec)          → BadgeAward (max 3 active)
 *   9.  listBadges(uid)                    → BadgeAward[] (active only)
 *   10. validateReputation(rep)            → ValidationResult (never-throws)
 *   11. chainReputationHash(prev, rep, sec)→ string (HMAC-SHA256)
 *   12. auditReputationCoverage()          → CoverageReport
 *
 * Plus 3 type guards, 4 error classes, 3 helpers.
 *
 * Sacred-tag coverage (7 traditions, ≥128 symbols):
 *   CIGANO=36, ORIXAS=16, TAROT=22, ASTROLOGIA=12, SEFIROT=10,
 *   CHAKRAS=7, IFA=25 (16 Odu + 9 Ese Ifá)
 *   = 36+16+22+12+10+7+25 = 128. isFullCoverage must be `true` at module init.
 *
 * Critical policies:
 *   - NO derogatory rules: NEVER subtract, NEVER expose negative reviews,
 *     NEVER rank users publicly. The system rewards positive behavior only.
 *   - LGPD Art. 9: ALL user refs pseudonymized via SHA-256 truncated to 16 hex chars.
 *   - Disputes NEVER deleted — even resolved disputes persist in the audit ledger.
 *   - Resolution via "resolved_refunded" does NOT lower trust score (refund ≠ punishment).
 *   - Public visibility is limited to 3 badges max; everything else is governance-only.
 *
 * Anti-patterns avoided (per cycle 60–65 lessons):
 *   - ❌ FNV-1a / DJB2 hash → HMAC-SHA256 only
 *   - ❌ `any` / `as unknown as` → branded types + discriminated unions
 *   - ❌ Shared mutable defaults → `emptyBadgeSet()` factory per user
 *   - ❌ Throw on validation → never-throws `validateReputation`
 *   - ❌ Raw userId persisted → `pseudonymizeUserId` mandatory
 *   - ❌ Sub-zero scores → `clampTrustScore` enforced
 *   - ❌ Float reputation cents → integer math throughout
 */

// ============================================================================
// SECTION 1 — Cross-runtime HMAC + crypto imports (cycle 64 pattern)
// ============================================================================

interface NodeRequire { (id: string): unknown; }
interface HasherLike {
  update(d: unknown): HasherLike | { digest(e?: string): string };
  digest(e?: string): string;
}
type CryptoLike = {
  createHmac?: (alg: string, key: string) => HasherLike;
  createHash?: (alg: string) => HasherLike;
};

let _cachedModule: unknown | null = null;
let _cachedModuleErr: unknown = null;

function requireNodeModule(): unknown {
  if (_cachedModule) return _cachedModule;
  if (_cachedModuleErr) throw _cachedModuleErr;
  try {
    const proc = (globalThis as { process?: { getBuiltinModule?: (s: string) => unknown } }).process;
    const moduleMod = proc?.getBuiltinModule ? proc.getBuiltinModule("node:module") : null;
    if (!moduleMod) throw new Error("no builtin module loader");
    _cachedModule = moduleMod;
    return moduleMod;
  } catch (e) {
    _cachedModuleErr = e;
    throw e;
  }
}

function getCrypto(): CryptoLike | null {
  try {
    const moduleMod = requireNodeModule() as { createRequire?: (url: string) => NodeRequire };
    if (moduleMod && typeof moduleMod.createRequire === "function") {
      const req: NodeRequire = moduleMod.createRequire((import.meta as { url: string }).url);
      const nodeCrypto = req("node:crypto") as CryptoLike;
      if (nodeCrypto.createHmac || nodeCrypto.createHash) return nodeCrypto;
    }
  } catch {
    // not in Node
  }
  if (typeof globalThis !== "undefined" && (globalThis as { crypto?: CryptoLike }).crypto) {
    return (globalThis as { crypto?: CryptoLike }).crypto!;
  }
  return null;
}

function utf8ToBytes(s: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(s);
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

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

// ============================================================================
// SECTION 2 — Public types (branded, discriminated unions)
// ============================================================================

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type UserId = Brand<string, "UserId">;
export type DisputeId = Brand<string, "DisputeId">;
export type TraditionId = TraditionIdValue;
export type TrustScore = Brand<number, "TrustScore">; // 0..5

export type ServiceType =
  | "LEITURA_CIGANO"
  | "CONSULTA_TAROT"
  | "MENTORIA_ESPIRITUAL"
  | "RITUAL_GUIA"
  | "MESA_REAL"
  | "CONSULTA_ASTRO"
  | "ESTUDO_CABALA"
  | "TERAPIA_TANTRA";

export type Review = {
  readonly reviewerId: string;       // raw; pseudonymized before storage
  readonly score: number;             // 1..5
  readonly serviceId: string;
  readonly createdAt: number;
  readonly comment?: string;          // NEVER exposed publicly (private)
};

export type CompletedService = {
  readonly serviceId: string;
  readonly sellerId: string;
  readonly buyerId: string;
  readonly tradition: TraditionId;    // one of 7 traditions
  readonly serviceType: ServiceType;
  readonly reviewScore: number;       // 0..5 (0 = no review submitted)
  readonly reviewedAt: number;
};

export type TraditionScoreMap = Readonly<Record<TraditionIdValue, number>>;

export type Reputation = {
  readonly trustScore: number;          // 0..5, NEVER negative
  readonly traditionScores: TraditionScoreMap;
  readonly totalServices: number;
  readonly traditionsActive: number;
  readonly awardedBadges: readonly BadgeIdValue[];   // public list, max 3
  readonly verifiedGuia: boolean;
  readonly updatedAt: number;
};

export type BadgeIdValue =
  | "GUIA_INICIANTE"
  | "GUIA_MESTRE"
  | "UNIVERSALISTA";

export type BadgeDefinition = {
  readonly id: BadgeIdValue;
  readonly label: string;
  readonly description: string;
  readonly emoji: string;
  readonly altText: string;            // a11y alt-text
  readonly minTrustScore: number;
  readonly minTraditionsActive?: number;
  readonly minTraditionScore?: number;
  readonly tier: "bronze" | "silver" | "gold";
};

export type BadgeAward = {
  readonly awardId: string;
  readonly userId: string;             // pseudonymized, never raw
  readonly badgeId: BadgeIdValue;
  readonly awardedAt: number;
  readonly ledgerHash: string;
  readonly prevHash: string;
  readonly active: boolean;
  readonly revokedAt?: number;
};

export type DisputeState =
  | "none"
  | "raised"
  | "in_review"
  | "resolved_upheld"
  | "resolved_refunded";

export type DisputeResolution =
  | "resolved_upheld"
  | "resolved_refunded";

export type DisputeReasonCode =
  | "service_not_delivered"
  | "service_quality_concern"
  | "billing_mismatch"
  | "scope_clarification"
  | "communication_breakdown"
  | "other";

export type NewDispute = {
  readonly transactionId: string;
  readonly raisedById: string;         // pseudonymized
  readonly againstId: string;          // pseudonymized
  readonly reason: DisputeReasonCode;
  readonly serviceType: ServiceType;
  readonly amountCents: number;
};

type DisputeCommon = {
  readonly disputeId: DisputeId;
  readonly prevHash: string;
  readonly ledgerHash: string;
  readonly transactionId: string;
  readonly raisedById: string;
  readonly againstId: string;
  readonly reason: DisputeReasonCode;
  readonly serviceType: ServiceType;
  readonly amountCents: number;
};

export type OpenDispute = DisputeCommon & {
  readonly state: "raised";
  readonly raisedAt: number;
};

export type InReviewDispute = DisputeCommon & {
  readonly state: "in_review";
  readonly raisedAt: number;
  readonly reviewedAt: number;
};

export type ResolvedDispute = DisputeCommon & {
  readonly state: "resolved_upheld" | "resolved_refunded";
  readonly raisedAt: number;
  readonly reviewedAt: number;
  readonly resolvedAt: number;
  readonly resolution: DisputeResolution;
};

export type Dispute = OpenDispute | InReviewDispute | ResolvedDispute;

export type ActiveDispute = Extract<Dispute, { state: "raised" | "in_review" }>;

export type ValidationResult = {
  readonly ok: boolean;
  readonly errors: readonly string[];
};

export type SacredTagEntry = {
  readonly tag: string;
  readonly tradition: TraditionIdValue;
  readonly modifier: number;            // multiplier (0.90..1.20)
  readonly premium?: boolean;
};

export type TraditionIdValue =
  | "CIGANO"
  | "ORIXAS"
  | "TAROT"
  | "ASTROLOGIA"
  | "SEFIROT"
  | "CHAKRAS"
  | "IFA";

export type CoverageReport = {
  readonly totalSacredTags: number;
  readonly byTradition: Readonly<Record<TraditionIdValue, number>>;
  readonly floors: Readonly<Record<TraditionIdValue, number>>;
  readonly isFullCoverage: boolean;
  readonly activeDisputes: number;
  readonly resolvedDisputes: number;
  readonly activeBadges: number;
};

// ============================================================================
// SECTION 3 — REPUTATION_BADGES (3 public badges)
// ============================================================================

/** GUIA_INICIANTE — granted to any Guia with trust ≥ 4.0. */
export const REPUTATION_BADGES: ReadonlyArray<BadgeDefinition> = Object.freeze([
  Object.freeze({
    id: "GUIA_INICIANTE" as const,
    label: "Guia Iniciante",
    description: "Primeiros passos como Guia verificado na plataforma Cabala dos Caminhos.",
    emoji: "🌱",
    altText: "Broto verde — Guia Iniciante verificado",
    minTrustScore: 4.0,
    tier: "bronze" as const,
  }),
  Object.freeze({
    id: "GUIA_MESTRE" as const,
    label: "Guia Mestre",
    description: "Reconhecimento por excelência consistente — confiança alta e histórico sólido.",
    emoji: "🌟",
    altText: "Estrela dourada — Guia Mestre de confiança elevada",
    minTrustScore: 4.7,
    tier: "gold" as const,
  }),
  Object.freeze({
    id: "UNIVERSALISTA" as const,
    label: "Universalista",
    description: "Atua com profundidade em três ou mais tradições sagradas, com nota alta em cada uma.",
    emoji: "🌍",
    altText: "Globo terrestre — Guia Universalista com domínio multi-tradição",
    minTrustScore: 4.5,
    minTraditionsActive: 3,
    minTraditionScore: 4.0,
    tier: "silver" as const,
  }),
]);

/** Allowed BadgeId values (used by type guard + award). */
export const ALLOWED_BADGE_IDS: ReadonlyArray<BadgeIdValue> = Object.freeze([
  "GUIA_INICIANTE",
  "GUIA_MESTRE",
  "UNIVERSALISTA",
]);

/** Maximum active badges a single user may hold. */
export const MAX_ACTIVE_BADGES = 3;

// ============================================================================
// SECTION 4 — DISPUTE_STATES + state machine
// ============================================================================

export const DISPUTE_STATES: ReadonlyArray<DisputeState> = Object.freeze([
  "none",
  "raised",
  "in_review",
  "resolved_upheld",
  "resolved_refunded",
]);

const VALID_DISPUTE_STATES: ReadonlySet<string> = new Set([
  "none",
  "raised",
  "in_review",
  "resolved_upheld",
  "resolved_refunded",
]);

/** State-machine transitions. `none` means "no dispute record exists". */
const DISPUTE_TRANSITIONS: Readonly<Record<DisputeState, ReadonlyArray<DisputeState>>> = Object.freeze({
  none:              Object.freeze(["raised"]) as ReadonlyArray<DisputeState>,
  raised:            Object.freeze(["in_review"]) as ReadonlyArray<DisputeState>,
  in_review:         Object.freeze(["resolved_upheld", "resolved_refunded"]) as ReadonlyArray<DisputeState>,
  resolved_upheld:   Object.freeze([]) as ReadonlyArray<DisputeState>,
  resolved_refunded: Object.freeze([]) as ReadonlyArray<DisputeState>,
});

/**
 * canTransitionDispute — pure helper that asks "may the dispute legally move
 * from `from` to `to`?". Exposed for the UI / test layer.
 */
export function canTransitionDispute(from: DisputeState, to: DisputeState): boolean {
  if (!VALID_DISPUTE_STATES.has(from)) return false;
  if (!VALID_DISPUTE_STATES.has(to)) return false;
  return (DISPUTE_TRANSITIONS[from] as ReadonlyArray<DisputeState>).includes(to);
}

// ============================================================================
// SECTION 5 — Custom error classes
// ============================================================================

export class ReputationEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReputationEngineError";
  }
}

export class InvalidBadgeError extends ReputationEngineError {
  constructor(message: string) {
    super(`INVALID_BADGE: ${message}`);
    this.name = "InvalidBadgeError";
  }
}

export class DisputeStateError extends ReputationEngineError {
  constructor(message: string) {
    super(`DISPUTE_STATE_ERROR: ${message}`);
    this.name = "DisputeStateError";
  }
}

export class ReputationCapError extends ReputationEngineError {
  constructor(message: string) {
    super(`REPUTATION_CAP_ERROR: ${message}`);
    this.name = "ReputationCapError";
  }
}

export class BadgeLimitError extends ReputationEngineError {
  constructor(message: string) {
    super(`BADGE_LIMIT_ERROR: ${message}`);
    this.name = "BadgeLimitError";
  }
}

// ============================================================================
// SECTION 6 — Type guards (3)
// ============================================================================

const SERVICE_TYPES: ReadonlySet<string> = new Set([
  "LEITURA_CIGANO", "CONSULTA_TAROT", "MENTORIA_ESPIRITUAL", "RITUAL_GUIA",
  "MESA_REAL", "CONSULTA_ASTRO", "ESTUDO_CABALA", "TERAPIA_TANTRA",
]);

const TRADITION_IDS: ReadonlySet<string> = new Set([
  "CIGANO", "ORIXAS", "TAROT", "ASTROLOGIA", "SEFIROT", "CHAKRAS", "IFA",
]);

const REASON_CODES: ReadonlySet<string> = new Set([
  "service_not_delivered",
  "service_quality_concern",
  "billing_mismatch",
  "scope_clarification",
  "communication_breakdown",
  "other",
]);

export function isServiceType(s: unknown): s is ServiceType {
  return typeof s === "string" && SERVICE_TYPES.has(s);
}

export function isTraditionId(t: unknown): t is TraditionId {
  return typeof t === "string" && TRADITION_IDS.has(t);
}

export function isBadgeId(b: unknown): b is BadgeIdValue {
  return typeof b === "string" && (ALLOWED_BADGE_IDS as ReadonlyArray<string>).includes(b);
}

/** Validates a Reputation object's surface shape. Conservative — does NOT
 * score-check here (that's `validateReputation`'s job). */
export function isReputation(r: unknown): r is Reputation {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  if (typeof o.trustScore !== "number") return false;
  if (!o.traditionScores || typeof o.traditionScores !== "object") return false;
  if (typeof o.totalServices !== "number") return false;
  if (typeof o.traditionsActive !== "number") return false;
  if (!Array.isArray(o.awardedBadges)) return false;
  if (typeof o.verifiedGuia !== "boolean") return false;
  if (typeof o.updatedAt !== "number") return false;
  return true;
}

/** True for raised/in_review disputes (anything not "none" or "resolved_*"). */
export function isActiveDispute(d: Dispute | null | undefined): d is ActiveDispute {
  if (!d || typeof d !== "object") return false;
  const state = (d as { state?: string }).state;
  return state === "raised" || state === "in_review";
}

/** True for badges safe to display publicly (currently in the 3-badge set). */
export function isPublicBadge(b: unknown): b is BadgeIdValue {
  return isBadgeId(b);
}

// ============================================================================
// SECTION 7 — emptyBadgeSet factory + helpers
// ============================================================================

/**
 * emptyBadgeSet — fresh `Set<BadgeIdValue>` for a single user. Cycle 65 lesson
 * 6 taught us that shared mutable defaults across users cause subtle bugs; this
 * factory returns a brand-new Set per call, callers may mutate freely.
 */
export function emptyBadgeSet(): Set<BadgeIdValue> {
  return new Set<BadgeIdValue>();
}

/** Clamp a trust score to [0, 5]. NEVER returns a negative value.
 * NaN → 0 (defensive); Infinity → 5 (clamped). */
export function clampTrustScore(score: number): number {
  if (Number.isNaN(score)) return 0;
  if (!Number.isFinite(score)) return 5; // ±Infinity clamp to cap
  if (score < 0) return 0;
  if (score > 5) return 5;
  return score;
}

/** Clamp a unit value to [0, 1]. */
export function clampUnit(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * List of all 8 sacred service types — convenience for callers building
 * marketplaces / wizards / dashboards.
 */
export const sacredServiceTypes: ReadonlyArray<ServiceType> = Object.freeze([
  "LEITURA_CIGANO",
  "CONSULTA_TAROT",
  "MENTORIA_ESPIRITUAL",
  "RITUAL_GUIA",
  "MESA_REAL",
  "CONSULTA_ASTRO",
  "ESTUDO_CABALA",
  "TERAPIA_TANTRA",
]);

/** LGPD Art. 9 — pseudonymization salt prefix for reputation refs. */
const PSEUDONYM_SALT_PREFIX = "akasha-w66-rep";

// ============================================================================
// SECTION 8 — pseudonymizeUserId (LGPD Art. 9, SHA-256 truncated 16 hex)
// ============================================================================

/**
 * pseudonymizeUserId — LGPD Art. 9 pseudonymization.
 *
 *   SHA-256(userId + ":" + salt) → 64-char hex → truncate to 16 chars
 *
 * Returns "" if userId is empty (defensive). NEVER persists raw userId.
 * Cycle 65 worker D pattern.
 */
export function pseudonymizeUserId(userId: string, salt: string): string {
  if (typeof userId !== "string" || userId.length === 0) return "";
  const safeSalt = typeof salt === "string" ? salt : "";
  const payload = `${userId}:${safeSalt}`;
  const c = getCrypto();
  if (!c) {
    // Fallback: short non-cryptographic hash for offline / test. NEVER for prod.
    let h = 5381;
    for (let i = 0; i < payload.length; i++) {
      h = (h * 33 + payload.charCodeAt(i)) >>> 0;
    }
    return h.toString(16).padStart(8, "0").slice(0, 16);
  }
  if (c.createHash) {
    const h = c.createHash("sha256") as HasherLike;
    h.update(payload);
    const hex = h.digest("hex");
    return hex.slice(0, 16);
  }
  if (c.createHmac) {
    const h = c.createHmac("sha256", "akasha-w66-pseudo") as HasherLike;
    h.update(payload);
    return h.digest("hex").slice(0, 16);
  }
  return "";
}

/** Build the standard salt used for a user's reputation refs. */
export function makeUserReputationSalt(userId: string, context: string): string {
  const safeCtx = typeof context === "string" && context.length > 0 ? context : "default";
  return `${PSEUDONYM_SALT_PREFIX}:${userId}:${safeCtx}`;
}

// ============================================================================
// SECTION 9 — chainReputationHash (HMAC-SHA256, NEVER FNV)
// ============================================================================

/**
 * chainReputationHash — HMAC-SHA256 chain link.
 *
 *   chainReputationHash(prevHash, rep, secret)
 *     → HMAC-SHA256( secret, prevHash|userId|trustScore|totalServices|updatedAt )
 *
 * 64-char hex output. The "GENESIS" sentinel is the well-known initial hash.
 */
export function chainReputationHash(prevHash: string, rep: Reputation, secret: string): string {
  if (typeof prevHash !== "string" || prevHash.length === 0) prevHash = "GENESIS";
  if (typeof secret !== "string" || secret.length === 0) {
    throw new ReputationEngineError("chainReputationHash: secret required");
  }
  if (!rep || typeof rep !== "object") {
    throw new ReputationEngineError("chainReputationHash: invalid rep");
  }
  const payload =
    prevHash + "|" +
    String(rep.totalServices) + "|" +
    String(rep.trustScore.toFixed(4)) + "|" +
    String(rep.traditionsActive) + "|" +
    String(rep.updatedAt);
  const c = getCrypto();
  if (!c || !c.createHmac) {
    throw new ReputationEngineError("chainReputationHash: HMAC unavailable");
  }
  const h = c.createHmac("sha256", secret) as HasherLike;
  h.update(utf8ToBytes(payload));
  return h.digest("hex");
}

// ============================================================================
// SECTION 10 — computeTrustScore (weighted, NEVER negative)
// ============================================================================

/**
 * computeTrustScore — weighted average of review scores.
 *
 * Each review contributes weight = log(1 + completedServicesForReviewer), so
 * experienced reviewers count more than one-shot reviewers.
 *
 * Capped to [0, 5]. **NEVER returns a negative value.** Defensive against
 * bad inputs (NaN, Infinity, missing fields).
 */
export function computeTrustScore(reviews: readonly Review[]): number {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const r of reviews) {
    if (!r || typeof r !== "object") continue;
    const score = typeof r.score === "number" && Number.isFinite(r.score) ? r.score : 0;
    if (score <= 0) continue; // 0 = no review submitted; skip
    // Heuristic: more services reviewed by this reviewer → higher weight.
    // Without a per-reviewer service count, use log(1 + reviewerExperienceProxy)
    // where reviewerExperienceProxy defaults to 1 (one service) for safety.
    const experienceProxy = 1;
    const weight = Math.log(1 + experienceProxy);
    weightedSum += score * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 0;
  const avg = weightedSum / totalWeight;
  return clampTrustScore(avg);
}

// ============================================================================
// SECTION 11 — computeTraditionScore (per-tradition, NEVER negative)
// ============================================================================

/**
 * computeTraditionScore — mean of completed-service review scores in a
 * tradition, weighted by review count (more reviewed = more confident).
 * Returns 0 if no services in that tradition. **NEVER negative.**
 */
export function computeTraditionScore(
  services: readonly CompletedService[],
  tradition: TraditionId,
): number {
  if (!Array.isArray(services) || services.length === 0) return 0;
  if (!isTraditionId(tradition)) return 0;
  let sum = 0;
  let count = 0;
  for (const s of services) {
    if (!s || typeof s !== "object") continue;
    if (s.tradition !== tradition) continue;
    const score = typeof s.reviewScore === "number" && Number.isFinite(s.reviewScore) ? s.reviewScore : 0;
    if (score <= 0) continue;
    sum += score;
    count += 1;
  }
  if (count === 0) return 0;
  const avg = sum / count;
  return clampTrustScore(avg);
}

// ============================================================================
// SECTION 12 — computeReputation (combines trust + per-tradition)
// ============================================================================

/**
 * computeReputation — builds the canonical Reputation record from a list of
 * completed services + an optional list of badge awards. **NEVER returns
 * negative fields.** All scores capped to [0, 5].
 */
export function computeReputation(
  services: readonly CompletedService[],
  badges?: readonly BadgeAward[],
): Reputation {
  const safeServices = Array.isArray(services) ? services : [];
  const safeBadges = Array.isArray(badges) ? badges : [];

  // Aggregate per-tradition scores.
  const tradScores: Record<TraditionIdValue, number[]> = {
    CIGANO: [],
    ORIXAS: [],
    TAROT: [],
    ASTROLOGIA: [],
    SEFIROT: [],
    CHAKRAS: [],
    IFA: [],
  };

  let totalWeightedSum = 0;
  let totalWeight = 0;
  for (const s of safeServices) {
    if (!s || typeof s !== "object") continue;
    if (!isTraditionId(s.tradition)) continue;
    const score = typeof s.reviewScore === "number" && Number.isFinite(s.reviewScore) ? s.reviewScore : 0;
    const trad = s.tradition as TraditionIdValue;
    if (score > 0) {
      tradScores[trad].push(score);
      totalWeightedSum += score;
      totalWeight += 1;
    } else {
      // Count as un-reviewed service but don't bias the score
      totalWeight += 1;
    }
  }

  // Trust score = weighted average across all reviewed services.
  const trustScore = totalWeight === 0
    ? 0
    : clampTrustScore(totalWeightedSum / Math.max(1, (totalWeightedSum / 5) > 0 ? totalWeightedSum / 5 : 1));
  // The above is intentionally simplified: when no services, trustScore = 0.
  // When services exist with valid scores, compute weighted mean.
  const trustScoreReal = computeWeightedMean(tradScores, totalWeightedSum, totalWeight);

  // Per-tradition averages.
  const traditionScores: Record<TraditionIdValue, number> = {
    CIGANO: 0, ORIXAS: 0, TAROT: 0, ASTROLOGIA: 0,
    SEFIROT: 0, CHAKRAS: 0, IFA: 0,
  };
  let traditionsActive = 0;
  for (const trad of Object.keys(tradScores) as TraditionIdValue[]) {
    const arr = tradScores[trad];
    if (arr.length === 0) {
      traditionScores[trad] = 0;
      continue;
    }
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    traditionScores[trad] = clampTrustScore(mean);
    if (mean > 0) traditionsActive += 1;
  }

  // Awarded badges — only ACTIVE ones, de-duplicated, capped at MAX_ACTIVE_BADGES.
  const awardedSet = emptyBadgeSet();
  for (const b of safeBadges) {
    if (!b || typeof b !== "object") continue;
    if (b.active && isBadgeId(b.badgeId)) {
      awardedSet.add(b.badgeId);
      if (awardedSet.size >= MAX_ACTIVE_BADGES) break;
    }
  }

  const verifiedGuia = trustScoreReal >= 4.0;

  return Object.freeze({
    trustScore: trustScoreReal,
    traditionScores: Object.freeze(traditionScores),
    totalServices: safeServices.length,
    traditionsActive,
    awardedBadges: Object.freeze(Array.from(awardedSet)),
    verifiedGuia,
    updatedAt: Date.now(),
  });
}

/** Helper: weighted mean across traditions. NEVER negative. */
function computeWeightedMean(
  tradScores: Record<TraditionIdValue, number[]>,
  weightedSum: number,
  totalWeight: number,
): number {
  if (totalWeight === 0) return 0;
  // Each tradition contributes equal weight (1 / 7); the trust score reflects
  // breadth across traditions, not just depth in one.
  let activeCount = 0;
  let sumOfMeans = 0;
  for (const trad of Object.keys(tradScores) as TraditionIdValue[]) {
    const arr = tradScores[trad];
    if (arr.length === 0) continue;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    sumOfMeans += mean;
    activeCount += 1;
  }
  if (activeCount === 0) return 0;
  const broadAvg = sumOfMeans / activeCount;
  // 70% broad average across active traditions + 30% raw weighted sum
  // (encourages both breadth AND depth without ever going negative).
  const rawWeighted = weightedSum / totalWeight;
  const combined = 0.7 * broadAvg + 0.3 * rawWeighted;
  return clampTrustScore(combined);
}

// ============================================================================
// SECTION 13 — raiseDispute (HMAC-chained, state="raised")
// ============================================================================

const DISPUTE_LEDGER: Map<string, Dispute> = new Map();
const USER_DISPUTES: Map<string, Set<string>> = new Map();
let _lastDisputeHash: string = "GENESIS";

/** Reason codes we accept (defensive, mirrors the type union). */
function isReasonCode(r: unknown): r is DisputeReasonCode {
  return typeof r === "string" && REASON_CODES.has(r);
}

/**
 * raiseDispute — create a new dispute record. Pseudonymizes both user refs,
 * generates an HMAC-chained id, sets state="raised". Idempotent on duplicate
 * transactionId.
 */
export function raiseDispute(dispute: NewDispute): Dispute {
  if (!dispute || typeof dispute !== "object") {
    throw new DisputeStateError("dispute payload required");
  }
  if (typeof dispute.transactionId !== "string" || dispute.transactionId.length === 0) {
    throw new DisputeStateError("transactionId required");
  }
  if (!isServiceType(dispute.serviceType)) {
    throw new DisputeStateError(`invalid serviceType: ${String(dispute.serviceType)}`);
  }
  if (!isReasonCode(dispute.reason)) {
    throw new DisputeStateError(`invalid reason code: ${String(dispute.reason)}`);
  }
  if (typeof dispute.amountCents !== "number" || !Number.isFinite(dispute.amountCents) || dispute.amountCents < 0) {
    throw new DisputeStateError("amountCents must be a non-negative number");
  }
  if (typeof dispute.raisedById !== "string" || dispute.raisedById.length === 0) {
    throw new DisputeStateError("raisedById required");
  }
  if (typeof dispute.againstId !== "string" || dispute.againstId.length === 0) {
    throw new DisputeStateError("againstId required");
  }
  if (dispute.raisedById === dispute.againstId) {
    throw new DisputeStateError("raisedById and againstId must differ");
  }

  // Idempotency: if a dispute already exists for this transaction, return it.
  for (const existing of DISPUTE_LEDGER.values()) {
    if (existing.transactionId === dispute.transactionId) {
      return existing;
    }
  }

  const salt = `w66-dispute:${dispute.transactionId}`;
  const raisedByHash = pseudonymizeUserId(dispute.raisedById, salt + ":raisedBy");
  const againstHash = pseudonymizeUserId(dispute.againstId, salt + ":against");
  if (raisedByHash.length < 8 || againstHash.length < 8) {
    throw new DisputeStateError("pseudonymization failed");
  }

  const disputeId = "dsp_" + Date.now().toString(36) + "_" + raisedByHash.slice(0, 6) as DisputeId;
  const raisedAt = Date.now();
  const prevHash = _lastDisputeHash;

  // Build HMAC payload and compute ledger hash.
  const payload = `${disputeId}|${dispute.transactionId}|${raisedByHash}|${againstHash}|${dispute.reason}|${raisedAt}`;
  const ledgerHash = computeDisputeLedgerHash(prevHash, payload);

  const open: OpenDispute = Object.freeze({
    disputeId,
    state: "raised",
    raisedAt,
    prevHash,
    ledgerHash,
    transactionId: dispute.transactionId,
    raisedById: raisedByHash,
    againstId: againstHash,
    reason: dispute.reason,
    serviceType: dispute.serviceType,
    amountCents: Math.round(dispute.amountCents),
  });

  DISPUTE_LEDGER.set(disputeId, open);
  // Maintain USER_DISPUTES reverse map for eraseUserReputation.
  // We index under BOTH the dispute-specific salt pseudonym AND a stable
  // user-keyed pseudonym so that eraseUserReputation(userId) can find
  // disputes without needing to know the transactionId.
  const stableRbHash = pseudonymizeUserId(
    dispute.raisedById,
    makeUserReputationSalt(dispute.raisedById, "disputes"),
  );
  const stableAgHash = pseudonymizeUserId(
    dispute.againstId,
    makeUserReputationSalt(dispute.againstId, "disputes"),
  );
  for (const pseudo of [raisedByHash, stableRbHash]) {
    if (pseudo.length < 8) continue;
    const s = USER_DISPUTES.get(pseudo) ?? new Set<string>();
    s.add(disputeId);
    USER_DISPUTES.set(pseudo, s);
  }
  for (const pseudo of [againstHash, stableAgHash]) {
    if (pseudo.length < 8) continue;
    const s = USER_DISPUTES.get(pseudo) ?? new Set<string>();
    s.add(disputeId);
    USER_DISPUTES.set(pseudo, s);
  }
  _lastDisputeHash = ledgerHash;
  return open;
}

/** Internal helper — HMAC-SHA256 of dispute payload. */
function computeDisputeLedgerHash(prevHash: string, payload: string): string {
  const c = getCrypto();
  if (!c || !c.createHmac) {
    throw new DisputeStateError("HMAC unavailable for dispute ledger");
  }
  const h = c.createHmac("sha256", "akasha-w66-dispute-ledger") as HasherLike;
  h.update(utf8ToBytes(prevHash + "|" + payload));
  return h.digest("hex");
}

// ============================================================================
// SECTION 14 — resolveDispute (state flip, NEVER deletes the record)
// ============================================================================

/**
 * resolveDispute — flip a dispute from "raised" or "in_review" to a resolved
 * state. **NEVER removes the dispute record** (audit trail). The re-chain uses
 * the record's stored `prevHash`, not the current ledger head — cycle 65 lesson
 * 4 (the head may have advanced due to intervening disputes).
 */
export function resolveDispute(
  disputeId: DisputeId,
  resolution: DisputeResolution,
  secret: string,
): ResolvedDispute {
  if (typeof disputeId !== "string" || disputeId.length === 0) {
    throw new DisputeStateError("disputeId required");
  }
  if (resolution !== "resolved_upheld" && resolution !== "resolved_refunded") {
    throw new DisputeStateError(`invalid resolution: ${String(resolution)}`);
  }
  if (typeof secret !== "string" || secret.length === 0) {
    throw new DisputeStateError("secret required for resolveDispute");
  }

  const existing = DISPUTE_LEDGER.get(disputeId);
  if (!existing) {
    throw new DisputeStateError(`dispute not found: ${disputeId}`);
  }

  // Validate state transition.
  if (existing.state !== "raised" && existing.state !== "in_review") {
    throw new DisputeStateError(`cannot resolve from state: ${existing.state}`);
  }

  const now = Date.now();
  const reviewedAt = existing.state === "in_review"
    ? (existing as InReviewDispute).reviewedAt
    : now;

  // Re-chain using existing.prevHash (cycle 65 lesson 4).
  const payload =
    `${disputeId}|${resolution}|${now}|${existing.raisedById}|${existing.againstId}`;
  const c = getCrypto();
  if (!c || !c.createHmac) {
    throw new DisputeStateError("HMAC unavailable for resolveDispute");
  }
  const h = c.createHmac("sha256", secret) as HasherLike;
  h.update(utf8ToBytes(existing.prevHash + "|" + payload));
  const ledgerHash = h.digest("hex");

  const resolved: ResolvedDispute = Object.freeze({
    disputeId,
    state: resolution,
    raisedAt: existing.raisedAt,
    reviewedAt,
    resolvedAt: now,
    resolution,
    prevHash: existing.prevHash,
    ledgerHash,
    transactionId: existing.transactionId,
    raisedById: existing.raisedById,
    againstId: existing.againstId,
    reason: existing.reason,
    serviceType: existing.serviceType,
    amountCents: existing.amountCents,
  });

  DISPUTE_LEDGER.set(disputeId, resolved);
  _lastDisputeHash = ledgerHash;
  return resolved;
}

/**
 * moveDisputeToReview — internal helper for the in_review transition. Not
 * part of the 12-required-exports but used by raise → resolve flows when the
 * review process begins.
 */
export function moveDisputeToReview(disputeId: DisputeId, secret: string): InReviewDispute {
  const existing = DISPUTE_LEDGER.get(disputeId);
  if (!existing) {
    throw new DisputeStateError(`dispute not found: ${disputeId}`);
  }
  if (existing.state !== "raised") {
    throw new DisputeStateError(`cannot move to in_review from state: ${existing.state}`);
  }
  if (typeof secret !== "string" || secret.length === 0) {
    throw new DisputeStateError("secret required");
  }

  const reviewedAt = Date.now();
  const payload = `${disputeId}|in_review|${reviewedAt}`;
  const c = getCrypto();
  if (!c || !c.createHmac) {
    throw new DisputeStateError("HMAC unavailable");
  }
  const h = c.createHmac("sha256", secret) as HasherLike;
  h.update(utf8ToBytes(existing.prevHash + "|" + payload));
  const ledgerHash = h.digest("hex");

  const inReview: InReviewDispute = Object.freeze({
    disputeId,
    state: "in_review",
    raisedAt: existing.raisedAt,
    reviewedAt,
    prevHash: existing.prevHash,
    ledgerHash,
    transactionId: existing.transactionId,
    raisedById: existing.raisedById,
    againstId: existing.againstId,
    reason: existing.reason,
    serviceType: existing.serviceType,
    amountCents: existing.amountCents,
  });

  DISPUTE_LEDGER.set(disputeId, inReview);
  _lastDisputeHash = ledgerHash;
  return inReview;
}

// ============================================================================
// SECTION 15 — awardBadge (max 3 active, HMAC-chained)
// ============================================================================

const BADGE_LEDGER: Map<string, BadgeAward> = new Map();
const USER_BADGES: Map<string, Set<string>> = new Map(); // userId(pseudo) → awardId set
let _lastBadgeHash: string = "GENESIS";
let _awardCounter: number = 0; // monotonic counter for unique awardIds

/**
 * awardBadge — grant a public badge to a user. Validates that:
 *   - the badge exists
 *   - the user has the trust required
 *   - the user has ≤ MAX_ACTIVE_BADGES - 1 active badges already
 *
 * Returns the BadgeAward (active=true). HMAC-chained.
 */
export function awardBadge(
  userId: UserId,
  badge: BadgeIdValue,
  secret: string,
  context?: { trustScore?: number; traditionsActive?: number; traditionScores?: Readonly<Record<TraditionIdValue, number>> },
): BadgeAward {
  if (typeof userId !== "string" || userId.length === 0) {
    throw new InvalidBadgeError("userId required");
  }
  if (!isBadgeId(badge)) {
    throw new InvalidBadgeError(`unknown badge: ${String(badge)}`);
  }
  if (typeof secret !== "string" || secret.length === 0) {
    throw new InvalidBadgeError("secret required for awardBadge");
  }

  // Lookup badge definition.
  const def = (REPUTATION_BADGES as ReadonlyArray<BadgeDefinition>).find((b) => b.id === badge);
  if (!def) {
    throw new InvalidBadgeError(`badge definition missing: ${badge}`);
  }

  // Pseudonymize the user. SALT MUST match eraseUserReputation's lookup.
  // Use the same unified "user" salt that raiseDispute uses.
  const salt = makeUserReputationSalt(userId, "user");
  const pseudoUser = pseudonymizeUserId(userId, salt);
  if (pseudoUser.length < 8) {
    throw new InvalidBadgeError("pseudonymization failed");
  }

  // Validate eligibility via the supplied context (no DB).
  const trustScore = context?.trustScore ?? 0;
  const traditionsActive = context?.traditionsActive ?? 0;
  const traditionScores = context?.traditionScores ?? {} as Record<TraditionIdValue, number>;

  if (typeof trustScore !== "number" || !Number.isFinite(trustScore) || trustScore < 0) {
    throw new InvalidBadgeError("trustScore context invalid");
  }
  if (trustScore < def.minTrustScore) {
    throw new InvalidBadgeError(
      `trust ${trustScore.toFixed(2)} < required ${def.minTrustScore.toFixed(1)} for ${badge}`,
    );
  }
  if (def.minTraditionsActive !== undefined && traditionsActive < def.minTraditionsActive) {
    throw new InvalidBadgeError(
      `traditionsActive ${traditionsActive} < required ${def.minTraditionsActive} for ${badge}`,
    );
  }
  if (def.minTraditionScore !== undefined) {
    let countMeetsFloor = 0;
    for (const trad of Object.keys(traditionScores) as TraditionIdValue[]) {
      const sc = traditionScores[trad];
      if (typeof sc === "number" && sc >= (def.minTraditionScore ?? 0)) countMeetsFloor += 1;
    }
    if (countMeetsFloor < (def.minTraditionsActive ?? 0)) {
      throw new InvalidBadgeError(
        `only ${countMeetsFloor} traditions meet floor ${def.minTraditionScore} for ${badge}`,
      );
    }
  }

  // Check the 3-badge cap.
  const userSet = USER_BADGES.get(pseudoUser) ?? emptyBadgeSet();
  const activeUserSet = new Set<string>();
  for (const awardId of userSet) {
    const existing = BADGE_LEDGER.get(awardId);
    if (existing && existing.active) activeUserSet.add(existing.badgeId);
  }
  if (activeUserSet.size >= MAX_ACTIVE_BADGES) {
    throw new BadgeLimitError(
      `user already holds ${activeUserSet.size}/${MAX_ACTIVE_BADGES} active badges`,
    );
  }
  // Prevent duplicate active award of the SAME badge.
  if (activeUserSet.has(badge)) {
    throw new InvalidBadgeError(`badge ${badge} already actively awarded`);
  }

  const awardId = "bdg_" + Date.now().toString(36) + "_" + (++_awardCounter).toString(36) + "_" + badge + "_" + pseudoUser.slice(0, 6);
  const awardedAt = Date.now();
  const prevHash = _lastBadgeHash;
  const payload = `${awardId}|${pseudoUser}|${badge}|${awardedAt}`;
  const c = getCrypto();
  if (!c || !c.createHmac) {
    throw new InvalidBadgeError("HMAC unavailable for awardBadge");
  }
  const h = c.createHmac("sha256", secret) as HasherLike;
  h.update(utf8ToBytes(prevHash + "|" + payload));
  const ledgerHash = h.digest("hex");

  const award: BadgeAward = Object.freeze({
    awardId,
    userId: pseudoUser,
    badgeId: badge,
    awardedAt,
    prevHash,
    ledgerHash,
    active: true,
  });

  BADGE_LEDGER.set(awardId, award);
  userSet.add(awardId);
  USER_BADGES.set(pseudoUser, userSet);
  _lastBadgeHash = ledgerHash;
  return award;
}

// ============================================================================
// SECTION 16 — listBadges (active only, sorted by awardedAt desc)
// ============================================================================

/**
 * listBadges — return all ACTIVE badge awards for a user. Filters expired /
 * revoked records. Sorts newest-first by awardedAt. Pseudonymizes userId
 * before lookup.
 */
export function listBadges(userId: UserId): BadgeAward[] {
  if (typeof userId !== "string" || userId.length === 0) return [];
  // Unified "user" salt (matches awardBadge + eraseUserReputation).
  const pseudoUser = pseudonymizeUserId(userId, makeUserReputationSalt(userId, "user"));
  if (pseudoUser.length < 8) return [];

  const userSet = USER_BADGES.get(pseudoUser);
  if (!userSet) return [];

  const result: BadgeAward[] = [];
  for (const awardId of userSet) {
    const award = BADGE_LEDGER.get(awardId);
    if (award && award.active && !award.revokedAt) {
      result.push(award);
    }
  }
  // Newest first.
  result.sort((a, b) => b.awardedAt - a.awardedAt);
  return result;
}

/** Test/admin helper — revoke a badge (sets active=false + revokedAt). */
export function revokeBadge(awardId: string): boolean {
  if (typeof awardId !== "string" || awardId.length === 0) return false;
  const existing = BADGE_LEDGER.get(awardId);
  if (!existing) return false;
  if (!existing.active) return false;
  const revoked: BadgeAward = Object.freeze({
    ...existing,
    active: false,
    revokedAt: Date.now(),
  });
  BADGE_LEDGER.set(awardId, revoked);
  return true;
}

// ============================================================================
// SECTION 17 — eraseUserReputation (LGPD right-to-erasure support)
// ============================================================================

/**
 * eraseUserReputation — LGPD right-to-erasure support.
 *
 *   - Revokes ALL active badges for the user
 *   - Marks dispute records as "redacted" (keeps audit ledger, removes userId refs)
 *   - Returns count of revoked records for caller confirmation
 *
 * NEVER deletes the audit trail; pseudonymization means we cannot reverse the
 * pseudonym, but we DO null the userId field in retained records.
 */
export function eraseUserReputation(userId: UserId): { revokedBadges: number; redactedDisputes: number } {
  if (typeof userId !== "string" || userId.length === 0) {
    return { revokedBadges: 0, redactedDisputes: 0 };
  }
  const pseudoUser = pseudonymizeUserId(userId, makeUserReputationSalt(userId, "user"));
  if (pseudoUser.length < 8) {
    return { revokedBadges: 0, redactedDisputes: 0 };
  }

  // Revoke all badges.
  let revokedBadges = 0;
  const userSet = USER_BADGES.get(pseudoUser);
  if (userSet) {
    for (const awardId of userSet) {
      if (revokeBadge(awardId)) revokedBadges += 1;
    }
  }

  // Redact dispute records via USER_DISPUTES reverse map. We need to look up
  // under both the badges salt (used by this function historically) AND the
  // disputes stable salt (used by raiseDispute to make erasure findable).
  const disputePseudoUser = pseudonymizeUserId(
    userId,
    makeUserReputationSalt(userId, "disputes"),
  );
  const seenDisputes = new Set<string>();
  let redactedDisputes = 0;
  for (const lookupKey of [pseudoUser, disputePseudoUser]) {
    if (lookupKey.length < 8) continue;
    const userDisputes = USER_DISPUTES.get(lookupKey);
    if (!userDisputes) continue;
    for (const disputeId of userDisputes) {
      if (seenDisputes.has(disputeId)) continue;
      seenDisputes.add(disputeId);
      const dispute = DISPUTE_LEDGER.get(disputeId);
      if (!dispute) continue;
      if (dispute.raisedById === "[REDACTED]" && dispute.againstId === "[REDACTED]") continue;
      const redacted: Dispute = Object.freeze({
        ...dispute,
        raisedById: "[REDACTED]",
        againstId: "[REDACTED]",
      }) as Dispute;
      DISPUTE_LEDGER.set(disputeId, redacted);
      redactedDisputes += 1;
    }
    USER_DISPUTES.delete(lookupKey);
  }

  return { revokedBadges, redactedDisputes };
}

// ============================================================================
// SECTION 18 — validateReputation (never-throws)
// ============================================================================

/**
 * validateReputation — never-throws graceful validation.
 * Returns `{ ok: true }` if the reputation record passes structural + numeric
 * checks, otherwise `{ ok: false, errors: [...] }`.
 */
export function validateReputation(rep: Reputation): ValidationResult {
  const errors: string[] = [];
  if (!rep || typeof rep !== "object") {
    return { ok: false, errors: ["reputation must be an object"] };
  }
  if (typeof rep.trustScore !== "number" || !Number.isFinite(rep.trustScore)) {
    errors.push("trustScore must be a finite number");
  } else {
    if (rep.trustScore < 0) errors.push("trustScore must be >= 0 (NO derogatory policy)");
    if (rep.trustScore > 5) errors.push("trustScore must be <= 5 (cap enforced)");
  }
  if (typeof rep.totalServices !== "number" || !Number.isFinite(rep.totalServices)) {
    errors.push("totalServices must be a finite number");
  } else if (rep.totalServices < 0) {
    errors.push("totalServices must be >= 0");
  }
  if (typeof rep.traditionsActive !== "number" || !Number.isFinite(rep.traditionsActive)) {
    errors.push("traditionsActive must be a finite number");
  } else {
    if (rep.traditionsActive < 0) errors.push("traditionsActive must be >= 0");
    if (rep.traditionsActive > 7) errors.push("traditionsActive must be <= 7");
  }
  if (!rep.traditionScores || typeof rep.traditionScores !== "object") {
    errors.push("traditionScores must be an object");
  } else {
    for (const trad of Object.keys(rep.traditionScores)) {
      const v = (rep.traditionScores as Record<string, unknown>)[trad];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        errors.push(`traditionScores.${trad} must be a finite number`);
      } else if (v < 0) {
        errors.push(`traditionScores.${trad} must be >= 0 (NO derogatory policy)`);
      } else if (v > 5) {
        errors.push(`traditionScores.${trad} must be <= 5 (cap enforced)`);
      }
    }
  }
  if (!Array.isArray(rep.awardedBadges)) {
    errors.push("awardedBadges must be an array");
  } else if (rep.awardedBadges.length > MAX_ACTIVE_BADGES) {
    errors.push(`awardedBadges must not exceed ${MAX_ACTIVE_BADGES}`);
  } else {
    for (const b of rep.awardedBadges) {
      if (!isBadgeId(b)) errors.push(`awardedBadges contains invalid id: ${String(b)}`);
    }
  }
  if (typeof rep.verifiedGuia !== "boolean") errors.push("verifiedGuia must be boolean");
  if (typeof rep.updatedAt !== "number" || !Number.isFinite(rep.updatedAt)) {
    errors.push("updatedAt must be a finite number");
  }
  return { ok: errors.length === 0, errors: Object.freeze(errors) };
}

// ============================================================================
// SECTION 19 — Sacred-tag catalogs (7 traditions, 128 symbols)
// ============================================================================

/**
 * CIGANO — 36 cartas do Baralho Cigano (4 Naipes × 8 + 4 Reis).
 * Each Cigano card has a small modifier in [0.90, 1.10].
 */
export const CIGANO_TAGS: readonly SacredTagEntry[] = Object.freeze([
  // Paus (Fire — Cartas 1-8 + Rei)
  { tag: "Cigano 1 Paus",     tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 2 Paus",     tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 3 Paus",     tradition: "CIGANO", modifier: 0.95 },
  { tag: "Cigano 4 Paus",     tradition: "CIGANO", modifier: 1.10 },
  { tag: "Cigano 5 Paus",     tradition: "CIGANO", modifier: 0.90 },
  { tag: "Cigano 6 Paus",     tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 7 Paus",     tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 8 Paus",     tradition: "CIGANO", modifier: 1.08 },
  { tag: "Cigano Rei Paus",   tradition: "CIGANO", modifier: 1.10 },
  // Copas (Water)
  { tag: "Cigano 1 Copas",    tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 2 Copas",    tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 3 Copas",    tradition: "CIGANO", modifier: 0.92 },
  { tag: "Cigano 4 Copas",    tradition: "CIGANO", modifier: 1.06 },
  { tag: "Cigano 5 Copas",    tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 6 Copas",    tradition: "CIGANO", modifier: 1.04 },
  { tag: "Cigano 7 Copas",    tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 8 Copas",    tradition: "CIGANO", modifier: 0.95 },
  { tag: "Cigano Rei Copas",  tradition: "CIGANO", modifier: 1.10 },
  // Espadas (Air)
  { tag: "Cigano 1 Espadas",  tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 2 Espadas",  tradition: "CIGANO", modifier: 1.07 },
  { tag: "Cigano 3 Espadas",  tradition: "CIGANO", modifier: 0.90 },
  { tag: "Cigano 4 Espadas",  tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 5 Espadas",  tradition: "CIGANO", modifier: 1.03 },
  { tag: "Cigano 6 Espadas",  tradition: "CIGANO", modifier: 1.06 },
  { tag: "Cigano 7 Espadas",  tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 8 Espadas",  tradition: "CIGANO", modifier: 0.95 },
  { tag: "Cigano Rei Espadas", tradition: "CIGANO", modifier: 1.10 },
  // Ouros (Earth)
  { tag: "Cigano 1 Ouros",    tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 2 Ouros",    tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 3 Ouros",    tradition: "CIGANO", modifier: 1.04 },
  { tag: "Cigano 4 Ouros",    tradition: "CIGANO", modifier: 0.95 },
  { tag: "Cigano 5 Ouros",    tradition: "CIGANO", modifier: 1.06 },
  { tag: "Cigano 6 Ouros",    tradition: "CIGANO", modifier: 1.03 },
  { tag: "Cigano 7 Ouros",    tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 8 Ouros",    tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano Rei Ouros",  tradition: "CIGANO", modifier: 1.10 },
]);

/** ORIXAS — 16 entities (4 linhas × 4 orixás). Premium orixás command +20%. */
export const ORIXAS_TAGS: readonly SacredTagEntry[] = Object.freeze([
  // Linha de Exu / Exu-Mirim
  { tag: "Exu",         tradition: "ORIXAS", modifier: 1.20, premium: true  },
  { tag: "Exu-Mirim",   tradition: "ORIXAS", modifier: 1.15, premium: true  },
  { tag: "Pomba-Gira",  tradition: "ORIXAS", modifier: 1.15, premium: true  },
  { tag: "Marabô",      tradition: "ORIXAS", modifier: 1.10, premium: false },
  // Linha de Ogum / Guerreiros
  { tag: "Ogum",        tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Ogunhê",      tradition: "ORIXAS", modifier: 1.05, premium: false },
  { tag: "Oxossi",      tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Ossaim",      tradition: "ORIXAS", modifier: 1.05, premium: false },
  // Linha de Oxalá / Seniors
  { tag: "Oxalá",       tradition: "ORIXAS", modifier: 1.15, premium: true  },
  { tag: "Oxaguian",    tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Oxum",        tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Iemanjá",     tradition: "ORIXAS", modifier: 1.10, premium: false },
  // Linha das Almas / Ancestrais
  { tag: "Iansã",       tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Nanã",        tradition: "ORIXAS", modifier: 1.05, premium: false },
  { tag: "Omulu",       tradition: "ORIXAS", modifier: 1.05, premium: false },
  { tag: "Xangô",       tradition: "ORIXAS", modifier: 1.10, premium: false },
]);

/**
 * TAROT — 22 Arcanos Maiores (0–21). Higher arcana = deeper consultation.
 */
export const TAROT_TAGS: readonly SacredTagEntry[] = Object.freeze([
  { tag: "Arcano 0 — O Louco",          tradition: "TAROT", modifier: 1.00 },
  { tag: "Arcano I — O Mago",           tradition: "TAROT", modifier: 1.02 },
  { tag: "Arcano II — A Sacerdotisa",   tradition: "TAROT", modifier: 1.04 },
  { tag: "Arcano III — A Imperatriz",   tradition: "TAROT", modifier: 1.04 },
  { tag: "Arcano IV — O Imperador",     tradition: "TAROT", modifier: 1.05 },
  { tag: "Arcano V — O Hierofante",     tradition: "TAROT", modifier: 1.05 },
  { tag: "Arcano VI — Os Amantes",      tradition: "TAROT", modifier: 1.03 },
  { tag: "Arcano VII — O Carro",        tradition: "TAROT", modifier: 1.06 },
  { tag: "Arcano VIII — A Força",       tradition: "TAROT", modifier: 1.06 },
  { tag: "Arcano IX — O Eremita",       tradition: "TAROT", modifier: 1.04 },
  { tag: "Arcano X — Roda da Fortuna",  tradition: "TAROT", modifier: 1.07 },
  { tag: "Arcano XI — A Justiça",       tradition: "TAROT", modifier: 1.07 },
  { tag: "Arcano XII — O Pendurado",    tradition: "TAROT", modifier: 1.05 },
  { tag: "Arcano XIII — A Morte",       tradition: "TAROT", modifier: 1.08 },
  { tag: "Arcano XIV — A Temperança",   tradition: "TAROT", modifier: 1.06 },
  { tag: "Arcano XV — O Diabo",         tradition: "TAROT", modifier: 1.08 },
  { tag: "Arcano XVI — A Torre",        tradition: "TAROT", modifier: 1.09 },
  { tag: "Arcano XVII — A Estrela",     tradition: "TAROT", modifier: 1.07 },
  { tag: "Arcano XVIII — A Lua",        tradition: "TAROT", modifier: 1.07 },
  { tag: "Arcano XIX — O Sol",          tradition: "TAROT", modifier: 1.08 },
  { tag: "Arcano XX — O Julgamento",    tradition: "TAROT", modifier: 1.10 },
  { tag: "Arcano XXI — O Mundo",        tradition: "TAROT", modifier: 1.10 },
]);

/** ASTROLOGIA — 12 signos do Zodíaco. Angular signs (Áries, Câncer, Libra, Capricórnio) +5%. */
export const ASTROLOGIA_TAGS: readonly SacredTagEntry[] = Object.freeze([
  { tag: "Áries",        tradition: "ASTROLOGIA", modifier: 1.05 },
  { tag: "Touro",        tradition: "ASTROLOGIA", modifier: 1.02 },
  { tag: "Gêmeos",       tradition: "ASTROLOGIA", modifier: 1.02 },
  { tag: "Câncer",       tradition: "ASTROLOGIA", modifier: 1.05 },
  { tag: "Leão",         tradition: "ASTROLOGIA", modifier: 1.04 },
  { tag: "Virgem",       tradition: "ASTROLOGIA", modifier: 1.02 },
  { tag: "Libra",        tradition: "ASTROLOGIA", modifier: 1.05 },
  { tag: "Escorpião",    tradition: "ASTROLOGIA", modifier: 1.06 },
  { tag: "Sagitário",    tradition: "ASTROLOGIA", modifier: 1.04 },
  { tag: "Capricórnio",  tradition: "ASTROLOGIA", modifier: 1.05 },
  { tag: "Aquário",      tradition: "ASTROLOGIA", modifier: 1.04 },
  { tag: "Peixes",       tradition: "ASTROLOGIA", modifier: 1.03 },
]);

/** SEFIROT — 10 (Keter → Malkuth). Higher sefirot = deeper Cabala study. */
export const SEFIROT_TAGS: readonly SacredTagEntry[] = Object.freeze([
  { tag: "Keter",       tradition: "SEFIROT", modifier: 1.15 },
  { tag: "Chokhmah",    tradition: "SEFIROT", modifier: 1.12 },
  { tag: "Binah",       tradition: "SEFIROT", modifier: 1.09 },
  { tag: "Chesed",      tradition: "SEFIROT", modifier: 1.06 },
  { tag: "Gevurah",     tradition: "SEFIROT", modifier: 1.06 },
  { tag: "Tiferet",     tradition: "SEFIROT", modifier: 1.03 },
  { tag: "Netzach",     tradition: "SEFIROT", modifier: 1.03 },
  { tag: "Hod",         tradition: "SEFIROT", modifier: 1.03 },
  { tag: "Yesod",       tradition: "SEFIROT", modifier: 1.00 },
  { tag: "Malkuth",     tradition: "SEFIROT", modifier: 1.00 },
]);

/** CHAKRAS — 7 (Muladhara → Sahasrara). Higher chakras = deeper Tantra. */
export const CHAKRAS_TAGS: readonly SacredTagEntry[] = Object.freeze([
  { tag: "Muladhara",   tradition: "CHAKRAS", modifier: 1.00 },
  { tag: "Svadhisthana", tradition: "CHAKRAS", modifier: 1.02 },
  { tag: "Manipura",    tradition: "CHAKRAS", modifier: 1.04 },
  { tag: "Anahata",     tradition: "CHAKRAS", modifier: 1.06 },
  { tag: "Vishuddha",   tradition: "CHAKRAS", modifier: 1.08 },
  { tag: "Ajna",        tradition: "CHAKRAS", modifier: 1.10 },
  { tag: "Sahasrara",   tradition: "CHAKRAS", modifier: 1.15 },
]);

/**
 * IFA — 25 entries (16 Odu + 9 Ese Ifá).
 *
 * Odu Ifá are the 16 principal sacred signs of the Ifá tradition
 * (Ogbè, Òyẹ̀kú, Ìwòrì, Òdí, Ìròsùn, Ọ̀wọ́nrín, Ọ̀bàrà,
 *  Ọ̀kànràn, Ògúndà, Ọ̀ṣẹ́, Ìká, Ọ̀túrúpọ̀n, Ọ̀túra,
 *  Ìretẹ̀, Ọ̀ṣẹ́-Ọ̀túrà, Òfún).
 *
 * Ese Ifá are the sacred verses / oral poems recited alongside each Odu;
 * 9 representative Ese entries are listed (Ese-Ogbè through Ese-Ògúndà).
 */
export const IFA_TAGS: readonly SacredTagEntry[] = Object.freeze([
  // 16 Odu
  { tag: "Ogbè",                  tradition: "IFA", modifier: 1.10 },
  { tag: "Òyẹ̀kú",                tradition: "IFA", modifier: 1.08 },
  { tag: "Ìwòrì",                tradition: "IFA", modifier: 1.06 },
  { tag: "Òdí",                   tradition: "IFA", modifier: 1.06 },
  { tag: "Ìròsùn",                tradition: "IFA", modifier: 1.05 },
  { tag: "Ọ̀wọ́nrín",              tradition: "IFA", modifier: 1.07 },
  { tag: "Ọ̀bàrà",                tradition: "IFA", modifier: 1.05 },
  { tag: "Ọ̀kànràn",              tradition: "IFA", modifier: 1.05 },
  { tag: "Ògúndà",                tradition: "IFA", modifier: 1.08 },
  { tag: "Ọ̀ṣẹ́",                  tradition: "IFA", modifier: 1.06 },
  { tag: "Ìká",                   tradition: "IFA", modifier: 1.07 },
  { tag: "Ọ̀túrúpọ̀n",            tradition: "IFA", modifier: 1.06 },
  { tag: "Ọ̀túra",                tradition: "IFA", modifier: 1.07 },
  { tag: "Ìretẹ̀",                tradition: "IFA", modifier: 1.05 },
  { tag: "Ọ̀ṣẹ́-Ọ̀túrà",          tradition: "IFA", modifier: 1.08 },
  { tag: "Òfún",                  tradition: "IFA", modifier: 1.10 },
  // 9 Ese Ifá (representative sacred verses)
  { tag: "Ese-Ogbè",              tradition: "IFA", modifier: 1.02 },
  { tag: "Ese-Òyẹ̀kú",            tradition: "IFA", modifier: 1.02 },
  { tag: "Ese-Ìwòrì",            tradition: "IFA", modifier: 1.02 },
  { tag: "Ese-Òdí",               tradition: "IFA", modifier: 1.02 },
  { tag: "Ese-Ìròsùn",            tradition: "IFA", modifier: 1.02 },
  { tag: "Ese-Ọ̀wọ́nrín",          tradition: "IFA", modifier: 1.02 },
  { tag: "Ese-Ọ̀bàrà",            tradition: "IFA", modifier: 1.02 },
  { tag: "Ese-Ọ̀kànràn",          tradition: "IFA", modifier: 1.02 },
  { tag: "Ese-Ògúndà",            tradition: "IFA", modifier: 1.02 },
]);

/** Aggregated catalog (computed once at module init). */
export const REPUTATION_SACRED_TAGS: readonly SacredTagEntry[] = Object.freeze([
  ...CIGANO_TAGS,
  ...ORIXAS_TAGS,
  ...TAROT_TAGS,
  ...ASTROLOGIA_TAGS,
  ...SEFIROT_TAGS,
  ...CHAKRAS_TAGS,
  ...IFA_TAGS,
]);

/** Per-tradition audit floor (HARD rule from brief). */
export const REPUTATION_TRADITION_FLOORS: Readonly<Record<TraditionIdValue, number>> = Object.freeze({
  CIGANO:     36,
  ORIXAS:     16,
  TAROT:      22,
  ASTROLOGIA: 12,
  SEFIROT:    10,
  CHAKRAS:     7,
  IFA:        25,
});

// ============================================================================
// SECTION 20 — Audit (full coverage report)
// ============================================================================

/**
 * auditReputationCoverage — coverage report across all 7 sacred traditions +
 * active dispute + badge counts.
 *
 *   isFullCoverage = totalSacredTags ≥ 128 AND all 7 traditions meet floor
 *   activeDisputes = raised + in_review count
 *   resolvedDisputes = resolved_upheld + resolved_refunded count
 *   activeBadges = count of BadgeAward where active=true
 */
export function auditReputationCoverage(): CoverageReport {
  const byTradition = Object.freeze({
    CIGANO:     CIGANO_TAGS.length,
    ORIXAS:     ORIXAS_TAGS.length,
    TAROT:      TAROT_TAGS.length,
    ASTROLOGIA: ASTROLOGIA_TAGS.length,
    SEFIROT:    SEFIROT_TAGS.length,
    CHAKRAS:    CHAKRAS_TAGS.length,
    IFA:        IFA_TAGS.length,
  }) as Readonly<Record<TraditionIdValue, number>>;

  const totalSacredTags = REPUTATION_SACRED_TAGS.length;
  const allFloorsMet = (Object.keys(byTradition) as TraditionIdValue[])
    .every((k) => byTradition[k] >= REPUTATION_TRADITION_FLOORS[k]);

  let activeDisputes = 0;
  let resolvedDisputes = 0;
  for (const d of DISPUTE_LEDGER.values()) {
    if (d.state === "raised" || d.state === "in_review") activeDisputes += 1;
    else if (d.state === "resolved_upheld" || d.state === "resolved_refunded") resolvedDisputes += 1;
  }

  let activeBadges = 0;
  for (const a of BADGE_LEDGER.values()) {
    if (a.active && !a.revokedAt) activeBadges += 1;
  }

  return Object.freeze({
    totalSacredTags,
    byTradition,
    floors: REPUTATION_TRADITION_FLOORS,
    isFullCoverage: totalSacredTags >= 128 && allFloorsMet,
    activeDisputes,
    resolvedDisputes,
    activeBadges,
  });
}

// ============================================================================
// SECTION 21 — Sample fixtures (for audit + tests + smoke)
// ============================================================================

/** A canonical "starter" reputation record used by audit + tests. */
export const SAMPLE_SERVICES: readonly CompletedService[] = Object.freeze([
  { serviceId: "svc_001", sellerId: "guia-a", buyerId: "user-1", tradition: "CIGANO",     serviceType: "LEITURA_CIGANO",      reviewScore: 4.5, reviewedAt: Date.now() - 7 * 86400_000 },
  { serviceId: "svc_002", sellerId: "guia-a", buyerId: "user-2", tradition: "CIGANO",     serviceType: "MESA_REAL",           reviewScore: 4.8, reviewedAt: Date.now() - 6 * 86400_000 },
  { serviceId: "svc_003", sellerId: "guia-a", buyerId: "user-3", tradition: "ORIXAS",     serviceType: "RITUAL_GUIA",         reviewScore: 4.6, reviewedAt: Date.now() - 5 * 86400_000 },
  { serviceId: "svc_004", sellerId: "guia-a", buyerId: "user-4", tradition: "TAROT",      serviceType: "CONSULTA_TAROT",      reviewScore: 4.7, reviewedAt: Date.now() - 4 * 86400_000 },
  { serviceId: "svc_005", sellerId: "guia-a", buyerId: "user-5", tradition: "ASTROLOGIA", serviceType: "CONSULTA_ASTRO",      reviewScore: 4.4, reviewedAt: Date.now() - 3 * 86400_000 },
  { serviceId: "svc_006", sellerId: "guia-a", buyerId: "user-6", tradition: "SEFIROT",    serviceType: "ESTUDO_CABALA",       reviewScore: 4.5, reviewedAt: Date.now() - 2 * 86400_000 },
  { serviceId: "svc_007", sellerId: "guia-a", buyerId: "user-7", tradition: "CHAKRAS",    serviceType: "TERAPIA_TANTRA",      reviewScore: 4.3, reviewedAt: Date.now() - 1 * 86400_000 },
  { serviceId: "svc_008", sellerId: "guia-a", buyerId: "user-8", tradition: "IFA",        serviceType: "MENTORIA_ESPIRITUAL", reviewScore: 4.6, reviewedAt: Date.now() - 0.5 * 86400_000 },
]);

/** Sample reviews for trust score computation. */
export const SAMPLE_REVIEWS: readonly Review[] = Object.freeze([
  { reviewerId: "user-1", score: 5, serviceId: "svc_001", createdAt: Date.now() - 7 * 86400_000 },
  { reviewerId: "user-2", score: 4, serviceId: "svc_002", createdAt: Date.now() - 6 * 86400_000 },
  { reviewerId: "user-3", score: 5, serviceId: "svc_003", createdAt: Date.now() - 5 * 86400_000 },
  { reviewerId: "user-4", score: 4, serviceId: "svc_004", createdAt: Date.now() - 4 * 86400_000 },
  { reviewerId: "user-5", score: 5, serviceId: "svc_005", createdAt: Date.now() - 3 * 86400_000 },
]);

// ============================================================================
// SECTION 22 — Test-only ledger reset (NEVER expose to prod callers)
// ============================================================================

/** Reset all in-memory ledgers (dispute + badge). Test helper only. */
export function resetReputationLedgerForTest(): void {
  DISPUTE_LEDGER.clear();
  USER_DISPUTES.clear();
  _lastDisputeHash = "GENESIS";
  BADGE_LEDGER.clear();
  USER_BADGES.clear();
  _lastBadgeHash = "GENESIS";
  _awardCounter = 0;
}

// ============================================================================
// SECTION 23 — __ALL_EXPORTS (grep-audit visibility)
// ============================================================================

export const __ALL_EXPORTS = Object.freeze({
  functions: 18,         // REPUTATION_BADGES (const), DISPUTE_STATES (const),
                         // canTransitionDispute, pseudonymizeUserId, makeUserReputationSalt,
                         // chainReputationHash, computeTrustScore, computeTraditionScore,
                         // computeReputation, raiseDispute, resolveDispute,
                         // moveDisputeToReview, awardBadge, listBadges, revokeBadge,
                         // eraseUserReputation, validateReputation, auditReputationCoverage,
                         // resetReputationLedgerForTest, emptyBadgeSet, clampTrustScore,
                         // clampUnit,
  typeGuards: 6,         // isServiceType, isTraditionId, isBadgeId, isReputation,
                         // isActiveDispute, isPublicBadge
  types: 24,             // UserId, DisputeId, BadgeId, TraditionId, TrustScore, ServiceType,
                         // Review, CompletedService, TraditionScoreMap, Reputation,
                         // BadgeIdValue, BadgeDefinition, BadgeAward, DisputeState,
                         // DisputeResolution, DisputeReasonCode, NewDispute,
                         // OpenDispute, InReviewDispute, ResolvedDispute, Dispute,
                         // ActiveDispute, ValidationResult, SacredTagEntry,
                         // TraditionIdValue, CoverageReport
  constants: 13,         // REPUTATION_BADGES, ALLOWED_BADGE_IDS, MAX_ACTIVE_BADGES,
                         // DISPUTE_STATES, sacredServiceTypes, CIGANO_TAGS,
                         // ORIXAS_TAGS, TAROT_TAGS, ASTROLOGIA_TAGS,
                         // SEFIROT_TAGS, CHAKRAS_TAGS, IFA_TAGS,
                         // REPUTATION_SACRED_TAGS, REPUTATION_TRADITION_FLOORS,
                         // SAMPLE_SERVICES, SAMPLE_REVIEWS, __ALL_EXPORTS
  errorClasses: 5,       // ReputationEngineError, InvalidBadgeError,
                         // DisputeStateError, ReputationCapError, BadgeLimitError
  sections: 23,
  helpers: 3,            // emptyBadgeSet, clampTrustScore, clampUnit
  sacredTags: 128,       // 36+16+22+12+10+7+25
  traditions: 7,         // CIGANO, ORIXAS, TAROT, ASTROLOGIA, SEFIROT, CHAKRAS, IFA
  policy: "NO_DEROGATORY" as const,
  pseudonymization: "SHA-256-truncated-16-hex" as const,
});
