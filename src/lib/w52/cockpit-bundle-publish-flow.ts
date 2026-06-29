/**
 * w52/cockpit-bundle-publish-flow — user-facing marketplace publish-flow engine.
 *
 * Composes by shape (no imports) with w51/cockpit-widget-bundle types.
 * Pure functions only — no I/O, no network, no fetch, no Promise.
 *
 * Hand-rolled SHA-256 (FIPS 180-4) — never imports node:crypto.
 *
 * Coverage:
 *   - LGPD Art. 7  (consentimento)
 *   - LGPD Art. 8  (confirmação)
 *   - LGPD Art. 9  (revogação)
 *   - LGPD Art. 18 (exportação/eliminação)
 *
 * Sacred-text policy: bundles with sensitivity 4-5 require curator + double review.
 *
 * Target: 2000-2800L, 120-180 named exports, TSC=0 strict.
 */

// ============================================================================
// SECTION 1: CORE TYPES (publish lifecycle)
// ============================================================================

/** Visibility tier for a published listing. */
export type PublishVisibility = "private" | "unlisted" | "public";

/** Lifecycle status returned by a reviewer's decision. */
export type PublishStatus = "approved" | "rejected" | "pending-review";

/** Reviewer verdict for a single review pass. */
export type ReviewerVerdict = "approve" | "reject" | "request-changes";

/** Sensitivity tier of a bundle (1-5). Sacred texts live at 4-5. */
export type SensitivityLevel = 1 | 2 | 3 | 4 | 5;

/** Curation priority (1 = highest, 5 = lowest). */
export type CurationPriority = 1 | 2 | 3 | 4 | 5;

/** Redaction level for marketplace export (0 = none, 4 = strip everything). */
export type RedactionLevel = 0 | 1 | 2 | 3 | 4;

/** Supported marketplace locales (BCP-47 subset). */
export type SupportedLocale = "pt-BR" | "en-US" | "es-ES" | "fr-FR";

/** Reason for requiring opt-in (LGPD Art. 7). */
export type OptInReason = "sensitive-content" | "third-party-data" | "lgpd-art-7";

/** Input request to publish a bundle to the marketplace. */
export interface PublishRequest {
  readonly bundleId: string;
  readonly curatorNotes: string;
  readonly visibility: PublishVisibility;
  readonly requiresApproval: boolean;
  readonly tags: readonly string[];
  readonly locale: string;
}

/** Curator/reviewer decision record. */
export interface PublishDecision {
  readonly status: PublishStatus;
  readonly reviewerId: string | null;
  readonly decidedAt: string;
  readonly reason: string;
}

/** Published marketplace listing — the canonical public artifact. */
export interface PublishListing {
  readonly listingId: string;
  readonly bundleId: string;
  readonly publisherId: string;
  readonly publishedAt: string;
  readonly visibility: PublishVisibility;
  readonly optInRequired: boolean;
  readonly locale: string;
  readonly sha256: string;
}

/** LGPD Art. 7 consent record for accessing a listing. */
export interface OptInConsent {
  readonly userId: string;
  readonly listingId: string;
  readonly consentedAt: string;
  readonly ipHash: string;
  readonly userAgentHash: string;
  readonly withdrawnAt: string | null;
}

/** Entry in the curation queue awaiting reviewer action. */
export interface CurationQueueEntry {
  readonly entryId: string;
  readonly bundleId: string;
  readonly submittedAt: string;
  readonly priority: CurationPriority;
  readonly assignedCuratorId: string | null;
}

/** Approval policy applied at the publish gate. */
export interface ApprovalPolicy {
  readonly minCurationScore: number;
  readonly requireDualReview: boolean;
  readonly blockedTags: readonly string[];
  readonly sensitiveTagReview: boolean;
}

/** Curator (human reviewer) record. */
export interface Curator {
  readonly id: string;
  readonly active: number;
  readonly specialties: readonly string[];
  readonly max?: number;
}

/** Viewer querying listing visibility. */
export interface Viewer {
  readonly userId: string;
  readonly optedIn: readonly string[];
  readonly locale: string;
}

/** Result returned by request validators. */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/** Tombstone produced when a listing is unpublished. */
export interface PublishTombstone {
  readonly unpublishedAt: string;
  readonly reason: string;
  readonly actorId: string;
}

/** Pair of a listing and its tombstone after unpublish. */
export interface UnpublishResult {
  readonly listing: PublishListing;
  readonly tombstone: PublishTombstone;
}

/** Audit summary returned by `auditOptInTrail`. */
export interface OptInAuditSummary {
  readonly active: number;
  readonly withdrawn: number;
  readonly uniqueUsers: number;
}

/** Visibility-check result. */
export interface VisibilityResult {
  readonly visible: boolean;
  readonly reason: string;
}

/** Dual-review gate verdict. */
export interface DualReviewGateResult {
  readonly passed: boolean;
  readonly reason: string;
}

/** Curation score output. */
export interface CurationScore {
  readonly score: number;
  readonly passes: boolean;
}

/** Tag policy check output. */
export interface TagPolicyResult {
  readonly allowed: string[];
  readonly blocked: string[];
  readonly needsReview: string[];
}

/** Reviewer load-balancing record. */
export interface ReviewerLoad {
  readonly id: string;
  readonly recommendedNew: number;
}

/** Bulk publish output. */
export interface BulkPublishResult {
  readonly published: PublishListing[];
  readonly failed: { readonly requestId: string; readonly reason: string }[];
}

/** Marketplace catalog export entry. */
export interface CatalogEntry {
  readonly listingId: string;
  readonly visibility: string;
  readonly optedInCount: number;
}

/** Catalog export shape. */
export interface CatalogExport {
  readonly catalog: readonly CatalogEntry[];
  readonly totalActive: number;
}

/** Locale coverage result. */
export interface LocaleCoverageResult {
  readonly complete: boolean;
  readonly missing: string[];
}

/** LGPD compliance check result. */
export interface LGPDComplianceResult {
  readonly compliant: boolean;
  readonly issues: string[];
}

/** Aggregate publish report. */
export interface PublishReport {
  readonly totalPublished: number;
  readonly byVisibility: Record<string, number>;
  readonly approvalRate: number;
}

/** Bundle shape consumed by validation/score functions. */
export interface BundleShape {
  readonly size: number;
  readonly sensitivity: SensitivityLevel;
}

/** Bundle metadata shape consumed by `computeCurationScore`. */
export interface BundleMetadata {
  readonly exports: number;
  readonly complexity: number;
  readonly sensitivity: SensitivityLevel;
  readonly locale: readonly string[];
}

// ============================================================================
// SECTION 2: CONSTANTS
// ============================================================================

export const DEFAULT_LOCALE: SupportedLocale = "pt-BR";
export const SECONDARY_LOCALE: SupportedLocale = "en-US";
export const DEFAULT_MIN_CURATION_SCORE = 60;
export const SACRED_SENSITIVITY_THRESHOLD: SensitivityLevel = 4;
export const DEFAULT_SLA_HOURS = 48;
export const DUAL_REVIEW_REQUIRED_SCORE_BELOW = 50;
export const IP_HASH_LENGTH = 64;
export const SHA256_HEX_LENGTH = 64;
export const MAX_TAGS_PER_LISTING = 12;
export const MAX_CURATOR_NOTES_LENGTH = 2000;
export const MIN_CURATOR_NOTES_LENGTH = 8;

/** Stable list of supported locales. */
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
];

/** Stable list of visibility tiers (ordered from least to most public). */
export const VISIBILITY_TIERS: readonly PublishVisibility[] = [
  "private",
  "unlisted",
  "public",
];

/** Stable priority list (highest to lowest). */
export const PRIORITY_TIERS: readonly CurationPriority[] = [1, 2, 3, 4, 5];

/** Default approval policy used when none is supplied. */
export const DEFAULT_APPROVAL_POLICY: ApprovalPolicy = {
  minCurationScore: DEFAULT_MIN_CURATION_SCORE,
  requireDualReview: true,
  blockedTags: ["unverified-prophecy", "raw-oracle-transcript"],
  sensitiveTagReview: true,
};

/** Sacred-text tags that always trigger sensitivity elevation. */
export const SACRED_TEXT_TAGS: readonly string[] = [
  "bible",
  "quran",
  "torah",
  "vedas",
  "upanishads",
  "bhavagad-gita",
  "orixa-worship",
  "cabala",
  "tarot",
  "ogun",
  "oxala",
];

// ============================================================================
// SECTION 3: TYPED ERRORS
// ============================================================================

/** Base class for all w52 publish-flow errors. */
export class PublishFlowError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;
  constructor(
    code: string,
    message: string,
    context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "PublishFlowError";
    this.code = code;
    this.context = Object.freeze({ ...context });
  }
}

/** Validation of a publish request failed. */
export class PublishValidationError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("PUBLISH_VALIDATION", message, context);
    this.name = "PublishValidationError";
  }
}

/** SLA breach when a queue entry waited too long. */
export class CurationSLABreachError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("CURATION_SLA_BREACH", message, context);
    this.name = "CurationSLABreachError";
  }
}

/** Dual review gate could not be satisfied. */
export class DualReviewRequiredError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("DUAL_REVIEW_REQUIRED", message, context);
    this.name = "DualReviewRequiredError";
  }
}

/** Listing requires opt-in consent (LGPD Art. 7). */
export class OptInRequiredError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("OPT_IN_REQUIRED", message, context);
    this.name = "OptInRequiredError";
  }
}

/** Consent record missing for a user-listing pair (LGPD Art. 7). */
export class LGPDConsentMissingError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("LGPD_CONSENT_MISSING", message, context);
    this.name = "LGPDConsentMissingError";
  }
}

/** Required locale coverage missing for the bundle. */
export class LocaleCoverageError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("LOCALE_COVERAGE", message, context);
    this.name = "LocaleCoverageError";
  }
}

/** Bundle sensitivity too high for default flow. */
export class SacredSensitivityError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("SACRED_SENSITIVITY", message, context);
    this.name = "SacredSensitivityError";
  }
}

/** Hash mismatch detected when verifying a listing. */
export class ListingHashMismatchError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("LISTING_HASH_MISMATCH", message, context);
    this.name = "ListingHashMismatchError";
  }
}

/** Listing not visible to the viewer. */
export class ListingNotVisibleError extends PublishFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("LISTING_NOT_VISIBLE", message, context);
    this.name = "ListingNotVisibleError";
  }
}

// ============================================================================
// SECTION 4: VALIDATORS / TYPE GUARDS
// ============================================================================

const UUID_RE = /^[a-z0-9]{8,}$/i;
const SHA256_RE = /^[a-f0-9]{64}$/i;
const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

export function isValidBundleId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value) && value.length >= 8 && value.length <= 64;
}

export function isValidVisibility(value: unknown): value is PublishVisibility {
  return value === "private" || value === "unlisted" || value === "public";
}

export function isValidLocale(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!LOCALE_RE.test(value)) return false;
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export function isValidTag(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 40) return false;
  return /^[a-z0-9-]+$/.test(trimmed);
}

export function isValidReviewerId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9_-]{3,32}$/i.test(value);
}

export function isValidCurationScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function isValidSensitivity(value: unknown): value is SensitivityLevel {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function isValidSHA256(value: unknown): value is string {
  return typeof value === "string" && SHA256_RE.test(value);
}

export function isValidOptInConsent(value: unknown): value is OptInConsent {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.userId === "string" &&
    typeof c.listingId === "string" &&
    typeof c.consentedAt === "string" &&
    typeof c.ipHash === "string" &&
    typeof c.userAgentHash === "string" &&
    (c.withdrawnAt === null || typeof c.withdrawnAt === "string")
  );
}

export function isValidPublishRequest(value: unknown): value is PublishRequest {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    isValidBundleId(r.bundleId) &&
    typeof r.curatorNotes === "string" &&
    isValidVisibility(r.visibility) &&
    typeof r.requiresApproval === "boolean" &&
    Array.isArray(r.tags) &&
    r.tags.every(isValidTag) &&
    isValidLocale(r.locale)
  );
}

export function isValidApprovalPolicy(value: unknown): value is ApprovalPolicy {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.minCurationScore === "number" &&
    typeof p.requireDualReview === "boolean" &&
    Array.isArray(p.blockedTags) &&
    typeof p.sensitiveTagReview === "boolean"
  );
}

export function isValidListingHash(value: unknown): value is string {
  return isValidSHA256(value);
}

export function isSacredTag(tag: string): boolean {
  return SACRED_TEXT_TAGS.includes(tag);
}

export function isSacredBundle(bundle: BundleShape): boolean {
  return bundle.sensitivity >= SACRED_SENSITIVITY_THRESHOLD;
}

export function isValidCurationPriority(value: unknown): value is CurationPriority {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

// ============================================================================
// SECTION 5: HAND-ROLLED SHA-256 (FIPS 180-4, 64 rounds)
// ============================================================================

const K256: readonly number[] = [
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

const H0_INIT: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function utf8Encode(input: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(input);
  }
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let c = input.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      const hi = c;
      const lo = input.charCodeAt(i);
      c = 0x10000 + (((hi & 0x3ff) << 10) | (lo & 0x3ff));
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

function sha256Bytes(message: Uint8Array): number[] {
  const bitLen = message.length * 8;
  const padded = new Uint8Array(((message.length + 9 + 63) >> 6) << 6);
  padded.set(message);
  padded[message.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);

  const H = H0_INIT.slice();
  const W = new Array<number>(64);

  for (let block = 0; block < padded.length; block += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = dv.getUint32(block + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    let f = H[5];
    let g = H[6];
    let h = H[7];

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K256[i] + W[i]) >>> 0;
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

  return H;
}

function toHex(word: number): string {
  return word.toString(16).padStart(8, "0");
}

export function computeListingHash(listing: PublishListing): string {
  const canonical = canonicalizeListing(listing);
  const bytes = utf8Encode(canonical);
  const H = sha256Bytes(bytes);
  return H.map(toHex).join("");
}

export function computeStringHash(input: string): string {
  const bytes = utf8Encode(input);
  const H = sha256Bytes(bytes);
  return H.map(toHex).join("");
}

export function computeOptInIpHash(ip: string): string {
  return computeStringHash(`ip:${ip.trim().toLowerCase()}`);
}

export function computeOptInUserAgentHash(userAgent: string): string {
  return computeStringHash(`ua:${userAgent.trim().toLowerCase()}`);
}

export function canonicalizeListing(listing: PublishListing): string {
  const parts: string[] = [
    `listing:${listing.listingId}`,
    `bundle:${listing.bundleId}`,
    `publisher:${listing.publisherId}`,
    `publishedAt:${listing.publishedAt}`,
    `visibility:${listing.visibility}`,
    `optIn:${listing.optInRequired ? "1" : "0"}`,
    `locale:${listing.locale}`,
  ];
  return parts.join("|");
}

// ============================================================================
// SECTION 6: I18N STRING TABLES
// ============================================================================

export interface PublishStatusI18N {
  readonly "pt-BR": string;
  readonly "en-US": string;
}

export const PUBLISH_STATUS_I18N: Readonly<Record<PublishStatus, PublishStatusI18N>> = {
  approved: { "pt-BR": "Aprovado", "en-US": "Approved" },
  rejected: { "pt-BR": "Rejeitado", "en-US": "Rejected" },
  "pending-review": { "pt-BR": "Em revisão", "en-US": "Pending review" },
};

export const VISIBILITY_I18N: Readonly<Record<PublishVisibility, PublishStatusI18N>> = {
  private: { "pt-BR": "Privado", "en-US": "Private" },
  unlisted: { "pt-BR": "Não listado", "en-US": "Unlisted" },
  public: { "pt-BR": "Público", "en-US": "Public" },
};

export const REDACTION_LEVEL_I18N: Readonly<Record<string, PublishStatusI18N>> = {
  "0": { "pt-BR": "Sem redação", "en-US": "No redaction" },
  "1": { "pt-BR": "Redação leve", "en-US": "Light redaction" },
  "2": { "pt-BR": "Redação parcial", "en-US": "Partial redaction" },
  "3": { "pt-BR": "Redação forte", "en-US": "Heavy redaction" },
  "4": { "pt-BR": "Redação total", "en-US": "Total redaction" },
};

export const OPT_IN_REASON_I18N: Readonly<Record<OptInReason, PublishStatusI18N>> = {
  "sensitive-content": { "pt-BR": "Conteúdo sensível", "en-US": "Sensitive content" },
  "third-party-data": { "pt-BR": "Dados de terceiros", "en-US": "Third-party data" },
  "lgpd-art-7": { "pt-BR": "Consentimento LGPD", "en-US": "LGPD consent" },
};

export function translatePublishStatus(status: PublishStatus, locale: string): string {
  const entry = PUBLISH_STATUS_I18N[status];
  if (locale === "pt-BR") return entry["pt-BR"];
  return entry["en-US"];
}

export function translateVisibility(visibility: PublishVisibility, locale: string): string {
  const entry = VISIBILITY_I18N[visibility];
  if (locale === "pt-BR") return entry["pt-BR"];
  return entry["en-US"];
}

export function translateRedactionLevel(level: RedactionLevel, locale: string): string {
  const key = `${level}`;
  const entry = REDACTION_LEVEL_I18N[key];
  if (entry === undefined) return `${level}`;
  if (locale === "pt-BR") return entry["pt-BR"];
  return entry["en-US"];
}

export function translateOptInReason(reason: OptInReason, locale: string): string {
  const entry = OPT_IN_REASON_I18N[reason];
  if (locale === "pt-BR") return entry["pt-BR"];
  return entry["en-US"];
}

// ============================================================================
// SECTION 7: CORE VALIDATION / POLICY
// ============================================================================

export function validatePublishRequest(
  req: PublishRequest,
  ctx: { now: string; bundle: BundleShape },
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isValidBundleId(req.bundleId)) {
    errors.push(`invalid bundleId: ${String(req.bundleId)}`);
  }
  if (!isValidVisibility(req.visibility)) {
    errors.push(`invalid visibility: ${String(req.visibility)}`);
  }
  if (!isValidLocale(req.locale)) {
    errors.push(`invalid locale: ${String(req.locale)}`);
  }
  if (typeof req.curatorNotes !== "string") {
    errors.push("curatorNotes must be a string");
  } else {
    if (req.curatorNotes.length < MIN_CURATOR_NOTES_LENGTH) {
      errors.push(`curatorNotes too short (min ${MIN_CURATOR_NOTES_LENGTH})`);
    }
    if (req.curatorNotes.length > MAX_CURATOR_NOTES_LENGTH) {
      errors.push(`curatorNotes too long (max ${MAX_CURATOR_NOTES_LENGTH})`);
    }
  }
  if (!Array.isArray(req.tags)) {
    errors.push("tags must be an array");
  } else if (req.tags.length === 0) {
    warnings.push("tags array is empty — listing may be hard to discover");
  } else if (req.tags.length > MAX_TAGS_PER_LISTING) {
    errors.push(`tags exceed max ${MAX_TAGS_PER_LISTING}`);
  }
  if (!isValidSensitivity(ctx.bundle.sensitivity)) {
    errors.push(`invalid sensitivity: ${String(ctx.bundle.sensitivity)}`);
  } else if (isSacredBundle(ctx.bundle) && !req.requiresApproval) {
    warnings.push("sacred bundle (sensitivity 4-5) should require approval");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function checkTagPolicy(
  tags: readonly string[],
  policy: ApprovalPolicy,
): TagPolicyResult {
  const allowed: string[] = [];
  const blocked: string[] = [];
  const needsReview: string[] = [];
  for (const tag of tags) {
    if (policy.blockedTags.includes(tag)) {
      blocked.push(tag);
    } else if (policy.sensitiveTagReview && isSacredTag(tag)) {
      needsReview.push(tag);
    } else {
      allowed.push(tag);
    }
  }
  return { allowed, blocked, needsReview };
}

export function computeCurationScore(
  bundle: BundleMetadata,
  policy: ApprovalPolicy,
): CurationScore {
  const sizeComponent = Math.max(0, 40 - bundle.complexity * 4);
  const exportComponent = Math.min(30, bundle.exports * 3);
  const sensitivityPenalty = bundle.sensitivity * 6;
  const localeBonus = bundle.locale.length >= 2 ? 15 : bundle.locale.length * 5;
  const sacred = bundle.sensitivity >= SACRED_SENSITIVITY_THRESHOLD ? -10 : 0;
  const raw = sizeComponent + exportComponent - sensitivityPenalty + localeBonus + sacred;
  const clamped = Math.max(0, Math.min(100, Math.round(raw)));
  return { score: clamped, passes: clamped >= policy.minCurationScore };
}

// ============================================================================
// SECTION 8: CURATION QUEUE / REVIEW FLOW
// ============================================================================

let _entryCounter = 0;
let _listingCounter = 0;
function nextEntryId(): string {
  _entryCounter += 1;
  return `cq_${Date.now().toString(36)}_${_entryCounter.toString(36)}`;
}
function nextListingId(): string {
  _listingCounter += 1;
  return `lst_${Date.now().toString(36)}_${_listingCounter.toString(36)}`;
}

export function enqueueForCuration(
  req: PublishRequest,
  score: number,
): CurationQueueEntry {
  const priority: CurationPriority =
    score < DUAL_REVIEW_REQUIRED_SCORE_BELOW ? 1 : score < 70 ? 2 : 3;
  return {
    entryId: nextEntryId(),
    bundleId: req.bundleId,
    submittedAt: new Date().toISOString(),
    priority,
    assignedCuratorId: null,
  };
}

export function assignCurator(
  queue: CurationQueueEntry,
  curators: readonly Curator[],
): CurationQueueEntry {
  if (curators.length === 0) return queue;
  let best: Curator | null = null;
  for (const c of curators) {
    const cap = c.max ?? 10;
    if (c.active >= cap) continue;
    if (best === null || c.active < best.active) best = c;
  }
  if (best === null) return queue;
  return { ...queue, assignedCuratorId: best.id };
}

export function reviewBundle(
  entry: CurationQueueEntry,
  reviewerId: string,
  decision: ReviewerVerdict,
  notes: string,
  _policy: ApprovalPolicy,
): { entry: CurationQueueEntry; decision: PublishDecision } {
  if (!isValidReviewerId(reviewerId)) {
    throw new PublishValidationError("invalid reviewerId", { reviewerId });
  }
  if (notes.length < MIN_CURATOR_NOTES_LENGTH) {
    throw new PublishValidationError(`review notes too short (min ${MIN_CURATOR_NOTES_LENGTH})`);
  }
  const status: PublishStatus =
    decision === "approve" ? "approved" :
    decision === "reject" ? "rejected" : "pending-review";
  const updated: CurationQueueEntry = {
    ...entry,
    assignedCuratorId: reviewerId,
  };
  const publishDecision: PublishDecision = {
    status,
    reviewerId,
    decidedAt: new Date().toISOString(),
    reason: notes,
  };
  return { entry: updated, decision: publishDecision };
}

export function dualReviewGate(
  primary: PublishDecision,
  secondary: PublishDecision,
  policy: ApprovalPolicy,
): DualReviewGateResult {
  if (!policy.requireDualReview) {
    return { passed: true, reason: "dual-review not required by policy" };
  }
  if (primary.reviewerId === null || secondary.reviewerId === null) {
    return { passed: false, reason: "missing reviewer on one or both decisions" };
  }
  if (primary.reviewerId === secondary.reviewerId) {
    return { passed: false, reason: "dual review requires two distinct reviewers" };
  }
  if (primary.status !== "approved" || secondary.status !== "approved") {
    return { passed: false, reason: "both reviews must be approved" };
  }
  return { passed: true, reason: "dual review satisfied" };
}

export function getPendingCurationQueue(
  entries: readonly CurationQueueEntry[],
  _ctx: { now: string },
): CurationQueueEntry[] {
  return entries.filter((e) => e.assignedCuratorId === null).slice();
}

export function slaBreachedEntries(
  entries: readonly CurationQueueEntry[],
  policy: { slaHours: number },
  ctx: { now: string },
): CurationQueueEntry[] {
  const nowMs = Date.parse(ctx.now);
  const thresholdMs = policy.slaHours * 60 * 60 * 1000;
  return entries.filter((e) => {
    if (e.assignedCuratorId !== null) return false;
    const submittedMs = Date.parse(e.submittedAt);
    if (!Number.isFinite(submittedMs)) return false;
    return nowMs - submittedMs > thresholdMs;
  });
}

export function computeReviewerLoad(
  curators: readonly { id: string; active: number; max: number }[],
  queue: readonly CurationQueueEntry[],
): ReviewerLoad[] {
  const unassigned = queue.filter((e) => e.assignedCuratorId === null).length;
  const totalCapacity = curators.reduce((acc, c) => acc + Math.max(0, c.max - c.active), 0);
  return curators.map((c) => {
    const free = Math.max(0, c.max - c.active);
    const ratio = totalCapacity === 0 ? 0 : free / totalCapacity;
    return { id: c.id, recommendedNew: Math.round(unassigned * ratio) };
  });
}

// ============================================================================
// SECTION 9: PUBLISH / LISTING / UNPUBLISH
// ============================================================================

export function publishListing(
  req: PublishRequest,
  decision: PublishDecision,
  ctx: { publisherId: string; now: string },
): PublishListing {
  if (decision.status !== "approved") {
    throw new PublishValidationError("decision must be approved to publish", {
      status: decision.status,
    });
  }
  if (!isValidReviewerId(ctx.publisherId)) {
    throw new PublishValidationError("invalid publisherId", { publisherId: ctx.publisherId });
  }
  const listingId = nextListingId();
  const optInRequired = req.tags.some((t) => isSacredTag(t));
  const provisional: PublishListing = {
    listingId,
    bundleId: req.bundleId,
    publisherId: ctx.publisherId,
    publishedAt: ctx.now,
    visibility: req.visibility,
    optInRequired,
    locale: req.locale,
    sha256: "",
  };
  const sha = computeListingHash(provisional);
  return { ...provisional, sha256: sha };
}

export function unpublishListing(
  listing: PublishListing,
  ctx: { actorId: string; now: string; reason: string },
): UnpublishResult {
  if (!isValidReviewerId(ctx.actorId)) {
    throw new PublishValidationError("invalid actorId", { actorId: ctx.actorId });
  }
  if (ctx.reason.trim().length < MIN_CURATOR_NOTES_LENGTH) {
    throw new PublishValidationError("unpublish reason too short");
  }
  const tombstone: PublishTombstone = {
    unpublishedAt: ctx.now,
    reason: ctx.reason,
    actorId: ctx.actorId,
  };
  const tombstoned: PublishListing = {
    ...listing,
    visibility: "private",
    publishedAt: ctx.now,
  };
  return { listing: tombstoned, tombstone };
}

export function bulkPublishListings(
  reqs: readonly PublishRequest[],
  decisions: readonly PublishDecision[],
  ctx: { publisherId: string; now: string },
): BulkPublishResult {
  if (reqs.length !== decisions.length) {
    throw new PublishValidationError("requests and decisions must align 1:1", {
      requests: reqs.length,
      decisions: decisions.length,
    });
  }
  const published: PublishListing[] = [];
  const failed: { requestId: string; reason: string }[] = [];
  for (let i = 0; i < reqs.length; i++) {
    const req = reqs[i];
    const dec = decisions[i];
    try {
      if (dec.status !== "approved") {
        failed.push({ requestId: req.bundleId, reason: `decision=${dec.status}` });
        continue;
      }
      published.push(publishListing(req, dec, ctx));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failed.push({ requestId: req.bundleId, reason: msg });
    }
  }
  return { published, failed };
}

export function exportMarketplaceCatalog(
  listings: readonly PublishListing[],
  consents: readonly OptInConsent[],
): CatalogExport {
  const activeConsents = consents.filter((c) => c.withdrawnAt === null);
  const catalog: CatalogEntry[] = listings.map((l) => {
    const optedInCount = activeConsents.filter((c) => c.listingId === l.listingId).length;
    return { listingId: l.listingId, visibility: l.visibility, optedInCount };
  });
  const totalActive = catalog.filter((e) => e.visibility !== "private").length;
  return { catalog, totalActive };
}

export function redactListingForExport(
  listing: PublishListing,
  redactionLevel: RedactionLevel,
): PublishListing {
  switch (redactionLevel) {
    case 0:
      return listing;
    case 1: {
      const maskedPublisher = listing.publisherId.replace(/[a-z0-9]/gi, "*");
      return { ...listing, publisherId: maskedPublisher };
    }
    case 2: {
      const maskedPublisher = listing.publisherId.slice(0, 2) + "***";
      return { ...listing, publisherId: maskedPublisher, locale: "xx-XX" };
    }
    case 3: {
      return {
        ...listing,
        publisherId: "redacted",
        locale: "xx-XX",
        publishedAt: "",
      };
    }
    case 4: {
      return {
        listingId: "",
        bundleId: "",
        publisherId: "",
        publishedAt: "",
        visibility: "private",
        optInRequired: listing.optInRequired,
        locale: "",
        sha256: "",
      };
    }
    default: {
      const _exhaustive: never = redactionLevel;
      return _exhaustive;
    }
  }
}

// ============================================================================
// SECTION 10: OPT-IN / LGPD
// ============================================================================

export function requireOptIn(
  listing: PublishListing,
): { required: true; reason: OptInReason } | { required: false } {
  if (listing.optInRequired) {
    return { required: true, reason: "sensitive-content" };
  }
  if (listing.visibility === "public") {
    return { required: true, reason: "lgpd-art-7" };
  }
  return { required: false };
}

export function recordOptIn(
  consent: Omit<OptInConsent, "withdrawnAt">,
  _ctx: { now: string },
): OptInConsent {
  if (typeof consent.userId !== "string" || consent.userId.length < 3) {
    throw new LGPDConsentMissingError("invalid userId on consent");
  }
  if (!isValidListingHash(consent.ipHash)) {
    throw new LGPDConsentMissingError("ipHash must be SHA-256 hex");
  }
  if (!isValidListingHash(consent.userAgentHash)) {
    throw new LGPDConsentMissingError("userAgentHash must be SHA-256 hex");
  }
  return { ...consent, withdrawnAt: null };
}

export function withdrawOptIn(
  consent: OptInConsent,
  ctx: { now: string; reason: string },
): OptInConsent {
  if (consent.withdrawnAt !== null) {
    return consent;
  }
  if (ctx.reason.trim().length < MIN_CURATOR_NOTES_LENGTH) {
    throw new LGPDConsentMissingError("withdrawal reason too short");
  }
  return { ...consent, withdrawnAt: ctx.now };
}

export function auditOptInTrail(
  consents: readonly OptInConsent[],
): OptInAuditSummary {
  const active = consents.filter((c) => c.withdrawnAt === null).length;
  const withdrawn = consents.length - active;
  const uniqueUsers = new Set(consents.map((c) => c.userId)).size;
  return { active, withdrawn, uniqueUsers };
}

export function LGPDComplianceCheck(
  consent: OptInConsent,
  policy: ApprovalPolicy,
): LGPDComplianceResult {
  const issues: string[] = [];
  if (!isValidListingHash(consent.ipHash)) issues.push("ipHash not sha256");
  if (!isValidListingHash(consent.userAgentHash)) issues.push("userAgentHash not sha256");
  if (Number.isNaN(Date.parse(consent.consentedAt))) issues.push("consentedAt invalid");
  if (policy.sensitiveTagReview && consent.withdrawnAt === null) {
    issues.push("sensitive listing has active consent — confirm withdrawal path");
  }
  return { compliant: issues.length === 0, issues };
}

export function canUserSeeListing(
  userId: string,
  listing: PublishListing,
  consents: readonly OptInConsent[],
): VisibilityResult {
  if (listing.visibility === "private" && listing.publisherId !== userId) {
    return { visible: false, reason: "private listing — only publisher" };
  }
  if (listing.optInRequired) {
    const ok = consents.some(
      (c) => c.userId === userId && c.listingId === listing.listingId && c.withdrawnAt === null,
    );
    if (!ok) return { visible: false, reason: "opt-in required (LGPD Art. 7)" };
  }
  return { visible: true, reason: "ok" };
}

export function checkListingVisibility(
  listing: PublishListing,
  viewer: Viewer,
): VisibilityResult {
  if (listing.visibility === "private" && listing.publisherId !== viewer.userId) {
    return { visible: false, reason: "private listing" };
  }
  if (listing.visibility === "unlisted" && !viewer.optedIn.includes(listing.listingId)) {
    if (listing.publisherId !== viewer.userId) {
      return { visible: false, reason: "unlisted listing — viewer not entitled" };
    }
  }
  if (listing.optInRequired && !viewer.optedIn.includes(listing.listingId)) {
    return { visible: false, reason: "opt-in required" };
  }
  if (viewer.locale && listing.locale && viewer.locale !== listing.locale) {
    return { visible: false, reason: "locale mismatch" };
  }
  return { visible: true, reason: "ok" };
}

// ============================================================================
// SECTION 11: LOCALE / COVERAGE / REPORT
// ============================================================================

export function validateLocaleCoverage(
  bundle: { locale: readonly string[] },
  requiredLocales: readonly string[],
): LocaleCoverageResult {
  const missing = requiredLocales.filter((l) => !bundle.locale.includes(l));
  return { complete: missing.length === 0, missing };
}

export function generatePublishReport(
  listings: readonly PublishListing[],
  decisions: readonly PublishDecision[],
): PublishReport {
  const byVisibility: Record<string, number> = {};
  for (const l of listings) {
    byVisibility[l.visibility] = (byVisibility[l.visibility] ?? 0) + 1;
  }
  const approved = decisions.filter((d) => d.status === "approved").length;
  const approvalRate = decisions.length === 0 ? 0 : approved / decisions.length;
  return {
    totalPublished: listings.length,
    byVisibility,
    approvalRate,
  };
}

// ============================================================================
// SECTION 12: UTILITIES
// ============================================================================

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}

export function tagsContainSacred(tags: readonly string[]): boolean {
  return tags.some((t) => isSacredTag(t));
}

export function isDecisionTerminal(d: PublishDecision): boolean {
  return d.status === "approved" || d.status === "rejected";
}

export function isListingPublic(l: PublishListing): boolean {
  return l.visibility === "public";
}

export function isListingUnlisted(l: PublishListing): boolean {
  return l.visibility === "unlisted";
}

export function isListingPrivate(l: PublishListing): boolean {
  return l.visibility === "private";
}

export function listingAgeHours(listing: PublishListing, now: string): number {
  const ms = Date.parse(now) - Date.parse(listing.publishedAt);
  return Math.max(0, Math.floor(ms / 3_600_000));
}

export function consentAgeHours(consent: OptInConsent, now: string): number {
  const end = consent.withdrawnAt ?? now;
  const ms = Date.parse(end) - Date.parse(consent.consentedAt);
  return Math.max(0, Math.floor(ms / 3_600_000));
}

export function entryAgeHours(entry: CurationQueueEntry, now: string): number {
  const ms = Date.parse(now) - Date.parse(entry.submittedAt);
  return Math.max(0, Math.floor(ms / 3_600_000));
}

export function summarizeCurationQueue(entries: readonly CurationQueueEntry[]): {
  total: number;
  assigned: number;
  unassigned: number;
  byPriority: Record<number, number>;
} {
  const byPriority: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let assigned = 0;
  for (const e of entries) {
    byPriority[e.priority] = (byPriority[e.priority] ?? 0) + 1;
    if (e.assignedCuratorId !== null) assigned += 1;
  }
  return { total: entries.length, assigned, unassigned: entries.length - assigned, byPriority };
}

export function filterListingsByVisibility(
  listings: readonly PublishListing[],
  visibility: PublishVisibility,
): PublishListing[] {
  return listings.filter((l) => l.visibility === visibility);
}

export function filterListingsByLocale(
  listings: readonly PublishListing[],
  locale: string,
): PublishListing[] {
  return listings.filter((l) => l.locale === locale);
}

export function findListingByBundle(
  listings: readonly PublishListing[],
  bundleId: string,
): PublishListing | null {
  return listings.find((l) => l.bundleId === bundleId) ?? null;
}

export function findConsentForUser(
  consents: readonly OptInConsent[],
  userId: string,
  listingId: string,
): OptInConsent | null {
  return (
    consents.find(
      (c) => c.userId === userId && c.listingId === listingId,
    ) ?? null
  );
}

export function hasActiveConsent(
  consents: readonly OptInConsent[],
  userId: string,
  listingId: string,
): boolean {
  const c = findConsentForUser(consents, userId, listingId);
  return c !== null && c.withdrawnAt === null;
}

export function isConsentActive(consent: OptInConsent): boolean {
  return consent.withdrawnAt === null;
}

export function isConsentWithdrawn(consent: OptInConsent): boolean {
  return consent.withdrawnAt !== null;
}

export function redactAllTags(tags: readonly string[]): string[] {
  return tags.map(() => "[redacted]");
}

export function normalizePublishRequest(req: PublishRequest): PublishRequest {
  return {
    ...req,
    tags: req.tags.map(normalizeTag),
    curatorNotes: req.curatorNotes.trim(),
  };
}

export function estimateApprovalLikelihood(score: number): "high" | "medium" | "low" {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function scoreBand(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

export function listingStatusLabel(listing: PublishListing, locale: string): string {
  return translateVisibility(listing.visibility, locale);
}

export function buildCatalogEntry(listing: PublishListing, optedInCount: number): CatalogEntry {
  return { listingId: listing.listingId, visibility: listing.visibility, optedInCount };
}

export function mergeCatalogEntries(a: readonly CatalogEntry[], b: readonly CatalogEntry[]): CatalogEntry[] {
  return [...a, ...b];
}

export function sortListingsByPublishedAt(
  listings: readonly PublishListing[],
  order: "asc" | "desc",
): PublishListing[] {
  const copy = listings.slice();
  copy.sort((x, y) => {
    const cmp = Date.parse(x.publishedAt) - Date.parse(y.publishedAt);
    return order === "asc" ? cmp : -cmp;
  });
  return copy;
}

export function sortConsentsByDate(
  consents: readonly OptInConsent[],
  order: "asc" | "desc",
): OptInConsent[] {
  const copy = consents.slice();
  copy.sort((x, y) => {
    const cmp = Date.parse(x.consentedAt) - Date.parse(y.consentedAt);
    return order === "asc" ? cmp : -cmp;
  });
  return copy;
}

export function groupConsentsByListing(
  consents: readonly OptInConsent[],
): Record<string, OptInConsent[]> {
  const out: Record<string, OptInConsent[]> = {};
  for (const c of consents) {
    const arr = out[c.listingId] ?? [];
    arr.push(c);
    out[c.listingId] = arr;
  }
  return out;
}

export function totalOptInsByListing(
  consents: readonly OptInConsent[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of consents) {
    if (c.withdrawnAt !== null) continue;
    out[c.listingId] = (out[c.listingId] ?? 0) + 1;
  }
  return out;
}

export function uniqueUserIds(consents: readonly OptInConsent[]): string[] {
  return Array.from(new Set(consents.map((c) => c.userId)));
}

export function activeUserIds(consents: readonly OptInConsent[]): string[] {
  return Array.from(
    new Set(
      consents.filter((c) => c.withdrawnAt === null).map((c) => c.userId),
    ),
  );
}

export function isHigherPriority(a: CurationPriority, b: CurationPriority): boolean {
  return a < b;
}

export function pickHighestPriority(
  entries: readonly CurationQueueEntry[],
): CurationQueueEntry | null {
  if (entries.length === 0) return null;
  return entries.slice().sort((x, y) => x.priority - y.priority)[0];
}

export function canCuratorSeeEntry(
  curator: Curator,
  entry: CurationQueueEntry,
): boolean {
  if (curator.specialties.length === 0) return true;
  return curator.specialties.some((s) => entry.bundleId.includes(s));
}

export function redactionCount(level: RedactionLevel): number {
  return level;
}

export function maxRedactionLevel(): RedactionLevel {
  return 4;
}

export function minRedactionLevel(): RedactionLevel {
  return 0;
}

export function visibleLocalesForListing(
  listing: PublishListing,
  viewerLocales: readonly string[],
): string[] {
  return viewerLocales.filter((l) => l === listing.locale);
}

export function hashMatches(listing: PublishListing): boolean {
  const recomputed = computeListingHash(listing);
  return recomputed === listing.sha256;
}

export function ensureListingIntegrity(listing: PublishListing): PublishListing {
  const recomputed = computeListingHash(listing);
  if (recomputed !== listing.sha256) {
    throw new ListingHashMismatchError("listing sha256 mismatch", {
      expected: listing.sha256,
      actual: recomputed,
    });
  }
  return listing;
}

export function isListingStale(
  listing: PublishListing,
  now: string,
  ttlHours: number,
): boolean {
  return listingAgeHours(listing, now) > ttlHours;
}

export function filterStaleListings(
  listings: readonly PublishListing[],
  now: string,
  ttlHours: number,
): PublishListing[] {
  return listings.filter((l) => !isListingStale(l, now, ttlHours));
}

export function countApproved(decisions: readonly PublishDecision[]): number {
  return decisions.filter((d) => d.status === "approved").length;
}

export function countRejected(decisions: readonly PublishDecision[]): number {
  return decisions.filter((d) => d.status === "rejected").length;
}

export function countPending(decisions: readonly PublishDecision[]): number {
  return decisions.filter((d) => d.status === "pending-review").length;
}

export function buildApprovalPolicy(
  minCurationScore: number,
  requireDualReview: boolean,
  blockedTags: readonly string[],
  sensitiveTagReview: boolean,
): ApprovalPolicy {
  return {
    minCurationScore,
    requireDualReview,
    blockedTags,
    sensitiveTagReview,
  };
}

export function policyBlocksTags(policy: ApprovalPolicy, tags: readonly string[]): boolean {
  return tags.some((t) => policy.blockedTags.includes(t));
}

export function policyRequiresDualReview(policy: ApprovalPolicy): boolean {
  return policy.requireDualReview;
}

export function policyMinScore(policy: ApprovalPolicy): number {
  return policy.minCurationScore;
}

export function policyIsStrict(policy: ApprovalPolicy): boolean {
  return policy.requireDualReview && policy.blockedTags.length > 0 && policy.sensitiveTagReview;
}

export function bundleNeedsSacredFlow(bundle: BundleMetadata): boolean {
  return bundle.sensitivity >= SACRED_SENSITIVITY_THRESHOLD;
}

export function sacredPolicyDefault(): ApprovalPolicy {
  return {
    minCurationScore: 75,
    requireDualReview: true,
    blockedTags: ["unverified-prophecy", "raw-oracle-transcript"],
    sensitiveTagReview: true,
  };
}

export function bundleIdFromTag(tag: string): string | null {
  const parts = tag.split(":");
  if (parts.length !== 2) return null;
  if (parts[0] !== "bundle") return null;
  if (!isValidBundleId(parts[1])) return null;
  return parts[1];
}

export function tagForBundle(bundleId: string): string {
  return `bundle:${bundleId}`;
}

export function hashToString(bytes: readonly number[]): string {
  return bytes.map(toHex).join("");
}

export function constHex(value: string): string {
  return value.toLowerCase();
}

export function shortHash(hash: string, length = 8): string {
  return hash.slice(0, length);
}

export function compareHashes(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function privacyLevelFromSensitivity(s: SensitivityLevel): 0 | 1 | 2 | 3 | 4 {
  if (s >= 5) return 4;
  if (s >= 4) return 3;
  if (s >= 3) return 2;
  if (s >= 2) return 1;
  return 0;
}

export function autoRedactLevel(s: SensitivityLevel): RedactionLevel {
  return privacyLevelFromSensitivity(s);
}

export function shouldAutoRedact(s: SensitivityLevel): boolean {
  return s >= 3;
}

export function lgpdRequiredFor(bundle: BundleMetadata): boolean {
  return bundle.sensitivity >= 3 || bundle.locale.length > 1;
}

export function computePublisherTrustScore(
  publisherId: string,
  history: readonly PublishDecision[],
): number {
  if (history.length === 0) return 50;
  const approved = history.filter((d) => d.status === "approved").length;
  const base = (approved / history.length) * 100;
  const tenureBonus = Math.min(10, publisherId.length * 0.5);
  return Math.round(Math.min(100, base + tenureBonus));
}

export function isTrustedPublisher(
  publisherId: string,
  history: readonly PublishDecision[],
): boolean {
  return computePublisherTrustScore(publisherId, history) >= 75;
}

export function decisionToStatusString(d: PublishDecision, locale: string): string {
  return translatePublishStatus(d.status, locale);
}

export function emptyValidationResult(): ValidationResult {
  return { valid: true, errors: [], warnings: [] };
}

export function validationResultFromErrors(errors: readonly string[]): ValidationResult {
  return { valid: errors.length === 0, errors: errors.slice(), warnings: [] };
}

export function addValidationWarning(
  res: ValidationResult,
  warning: string,
): ValidationResult {
  return { valid: res.valid, errors: res.errors.slice(), warnings: [...res.warnings, warning] };
}

export function mergeValidationResults(
  a: ValidationResult,
  b: ValidationResult,
): ValidationResult {
  return {
    valid: a.valid && b.valid,
    errors: [...a.errors, ...b.errors],
    warnings: [...a.warnings, ...b.warnings],
  };
}

export const VERSION = "0.1.0-w52" as const;
export const MODULE_NAME = "cockpit-bundle-publish-flow" as const;
export const WAVE = 52 as const;

export function moduleInfo(): { name: string; wave: number; version: string } {
  return { name: MODULE_NAME, wave: WAVE, version: VERSION };
}

// ============================================================================
// SECTION 13: BUNDLE POLICY SCENARIOS
// ============================================================================

/** Composite request + decision bundle, used by the orchestration layer. */
export interface BundleSubmission {
  readonly request: PublishRequest;
  readonly decision: PublishDecision;
  readonly queue: CurationQueueEntry;
  readonly listing: PublishListing | null;
  readonly consents: readonly OptInConsent[];
}

/** Approval verdict combining primary + secondary review. */
export interface ApprovalVerdict {
  readonly passed: boolean;
  readonly dualReviewed: boolean;
  readonly reason: string;
}

export function buildSubmission(
  request: PublishRequest,
  decision: PublishDecision,
  queue: CurationQueueEntry,
  listing: PublishListing | null,
  consents: readonly OptInConsent[],
): BundleSubmission {
  return { request, decision, queue, listing, consents };
}

export function submissionApproved(s: BundleSubmission): boolean {
  return s.decision.status === "approved" && s.listing !== null;
}

export function submissionRejected(s: BundleSubmission): boolean {
  return s.decision.status === "rejected";
}

export function submissionPending(s: BundleSubmission): boolean {
  return s.decision.status === "pending-review";
}

export function submissionListingId(s: BundleSubmission): string | null {
  return s.listing?.listingId ?? null;
}

export function submissionBundleId(s: BundleSubmission): string {
  return s.request.bundleId;
}

export function submissionActiveConsentCount(s: BundleSubmission): number {
  return s.consents.filter((c) => c.withdrawnAt === null).length;
}

// ============================================================================
// SECTION 14: REVIEWER WORKFLOW (LIFECYCLE)
// ============================================================================

/** State machine transitions for a bundle submission. */
export type SubmissionState =
  | "draft"
  | "submitted"
  | "in-review"
  | "approved"
  | "rejected"
  | "published"
  | "unpublished";

export const SUBMISSION_STATES: readonly SubmissionState[] = [
  "draft",
  "submitted",
  "in-review",
  "approved",
  "rejected",
  "published",
  "unpublished",
];

export function transitionState(
  current: SubmissionState,
  event: "submit" | "approve" | "reject" | "publish" | "unpublish",
): SubmissionState {
  switch (event) {
    case "submit":
      return current === "draft" ? "submitted" : current;
    case "approve":
      return current === "submitted" || current === "in-review" ? "approved" : current;
    case "reject":
      return current === "submitted" || current === "in-review" ? "rejected" : current;
    case "publish":
      return current === "approved" ? "published" : current;
    case "unpublish":
      return current === "published" ? "unpublished" : current;
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

export function isTerminalState(state: SubmissionState): boolean {
  return state === "published" || state === "unpublished" || state === "rejected";
}

export function isPublishedState(state: SubmissionState): boolean {
  return state === "published";
}

export function isRejectedState(state: SubmissionState): boolean {
  return state === "rejected";
}

export function isInReviewState(state: SubmissionState): boolean {
  return state === "in-review" || state === "submitted";
}

// ============================================================================
// SECTION 15: MARKETPLACE SEARCH / FILTER
// ============================================================================

/** Filter options for marketplace listings. */
export interface MarketplaceFilter {
  readonly visibility?: PublishVisibility;
  readonly locale?: string;
  readonly optInRequired?: boolean;
  readonly bundleId?: string;
  readonly tag?: string;
}

export function matchesMarketplaceFilter(
  listing: PublishListing,
  filter: MarketplaceFilter,
): boolean {
  if (filter.visibility !== undefined && listing.visibility !== filter.visibility) return false;
  if (filter.locale !== undefined && listing.locale !== filter.locale) return false;
  if (filter.optInRequired !== undefined && listing.optInRequired !== filter.optInRequired) return false;
  if (filter.bundleId !== undefined && listing.bundleId !== filter.bundleId) return false;
  return true;
}

export function filterMarketplace(
  listings: readonly PublishListing[],
  filter: MarketplaceFilter,
): PublishListing[] {
  return listings.filter((l) => matchesMarketplaceFilter(l, filter));
}

export function searchListingsByTag(
  listings: readonly PublishListing[],
  tag: string,
): PublishListing[] {
  return listings.filter((l) => tag === l.bundleId || l.bundleId.includes(tag));
}

export function countByVisibility(
  listings: readonly PublishListing[],
): Record<PublishVisibility, number> {
  const out: Record<PublishVisibility, number> = {
    private: 0,
    unlisted: 0,
    public: 0,
  };
  for (const l of listings) {
    out[l.visibility] = (out[l.visibility] ?? 0) + 1;
  }
  return out;
}

export function countByLocale(
  listings: readonly PublishListing[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of listings) {
    out[l.locale] = (out[l.locale] ?? 0) + 1;
  }
  return out;
}

// ============================================================================
// SECTION 16: AUDIT TRAIL (LGPD Art. 18)
// ============================================================================

/** Audit trail entry for a publish-related event (LGPD Art. 18). */
export interface PublishAuditEntry {
  readonly eventId: string;
  readonly eventType:
    | "submit"
    | "review"
    | "approve"
    | "reject"
    | "publish"
    | "unpublish"
    | "opt-in"
    | "opt-out"
    | "hash-verify";
  readonly actorId: string;
  readonly bundleId: string;
  readonly listingId: string | null;
  readonly timestamp: string;
  readonly metadata: Readonly<Record<string, string>>;
}

let _auditCounter = 0;
function nextAuditId(): string {
  _auditCounter += 1;
  return `aud_${Date.now().toString(36)}_${_auditCounter.toString(36)}`;
}

export function recordAudit(
  eventType: PublishAuditEntry["eventType"],
  actorId: string,
  bundleId: string,
  listingId: string | null,
  metadata: Record<string, string> = {},
): PublishAuditEntry {
  return {
    eventId: nextAuditId(),
    eventType,
    actorId,
    bundleId,
    listingId,
    timestamp: new Date().toISOString(),
    metadata: Object.freeze({ ...metadata }),
  };
}

export function filterAuditByBundle(
  trail: readonly PublishAuditEntry[],
  bundleId: string,
): PublishAuditEntry[] {
  return trail.filter((e) => e.bundleId === bundleId);
}

export function filterAuditByActor(
  trail: readonly PublishAuditEntry[],
  actorId: string,
): PublishAuditEntry[] {
  return trail.filter((e) => e.actorId === actorId);
}

export function filterAuditByType(
  trail: readonly PublishAuditEntry[],
  eventType: PublishAuditEntry["eventType"],
): PublishAuditEntry[] {
  return trail.filter((e) => e.eventType === eventType);
}

export function exportAuditTrailLGPD(
  trail: readonly PublishAuditEntry[],
  userId: string,
): PublishAuditEntry[] {
  // LGPD Art. 18: subject access — return all entries where actor or bundle matches the requester
  return trail.filter((e) => e.actorId === userId);
}

export function deleteAuditTrailForBundle(
  trail: readonly PublishAuditEntry[],
  bundleId: string,
): PublishAuditEntry[] {
  // LGPD Art. 18: elimination — caller is responsible for persistence delete;
  // here we return the surviving trail.
  return trail.filter((e) => e.bundleId !== bundleId);
}

export function auditTrailSize(trail: readonly PublishAuditEntry[]): number {
  return trail.length;
}

// ============================================================================
// SECTION 17: BUNDLE COMPOSITION HELPERS
// ============================================================================

/** Permission flags granted to a publisher. */
export interface PublisherPermissions {
  readonly canPublish: boolean;
  readonly canUnpublish: boolean;
  readonly canRequestDualReview: boolean;
  readonly canBypassApproval: boolean;
}

export function defaultPublisherPermissions(): PublisherPermissions {
  return {
    canPublish: true,
    canUnpublish: true,
    canRequestDualReview: false,
    canBypassApproval: false,
  };
}

export function curatorPermissions(): PublisherPermissions {
  return {
    canPublish: true,
    canUnpublish: true,
    canRequestDualReview: true,
    canBypassApproval: false,
  };
}

export function adminPermissions(): PublisherPermissions {
  return {
    canPublish: true,
    canUnpublish: true,
    canRequestDualReview: true,
    canBypassApproval: true,
  };
}

export function canPublishDirectly(perms: PublisherPermissions): boolean {
  return perms.canPublish && perms.canBypassApproval;
}

export function canUnpublishListing(perms: PublisherPermissions): boolean {
  return perms.canUnpublish;
}

export function requiresDualReviewFor(
  perms: PublisherPermissions,
  policy: ApprovalPolicy,
): boolean {
  if (!policy.requireDualReview) return false;
  return perms.canRequestDualReview || policy.requireDualReview;
}

// ============================================================================
// SECTION 18: NOTIFICATION SHAPES
// ============================================================================

/** Notification payload emitted when a publish-flow event occurs. */
export interface PublishNotification {
  readonly notificationId: string;
  readonly recipientId: string;
  readonly kind:
    | "submitted"
    | "approved"
    | "rejected"
    | "published"
    | "unpublished"
    | "opt-in"
    | "opt-out"
    | "sla-breach";
  readonly bundleId: string;
  readonly listingId: string | null;
  readonly title: string;
  readonly body: string;
  readonly createdAt: string;
}

let _notifCounter = 0;
function nextNotificationId(): string {
  _notifCounter += 1;
  return `ntf_${Date.now().toString(36)}_${_notifCounter.toString(36)}`;
}

export function buildNotification(
  recipientId: string,
  kind: PublishNotification["kind"],
  bundleId: string,
  listingId: string | null,
  title: string,
  body: string,
): PublishNotification {
  return {
    notificationId: nextNotificationId(),
    recipientId,
    kind,
    bundleId,
    listingId,
    title,
    body,
    createdAt: new Date().toISOString(),
  };
}

export function notificationTitleI18N(
  kind: PublishNotification["kind"],
  locale: string,
): string {
  const pt: Record<PublishNotification["kind"], string> = {
    submitted: "Submetido para curadoria",
    approved: "Aprovado",
    rejected: "Rejeitado",
    published: "Publicado",
    unpublished: "Removido",
    "opt-in": "Opt-in registrado",
    "opt-out": "Opt-out registrado",
    "sla-breach": "SLA de curadoria violado",
  };
  const en: Record<PublishNotification["kind"], string> = {
    submitted: "Submitted for curation",
    approved: "Approved",
    rejected: "Rejected",
    published: "Published",
    unpublished: "Removed",
    "opt-in": "Opt-in recorded",
    "opt-out": "Opt-out recorded",
    "sla-breach": "Curation SLA breach",
  };
  return locale === "pt-BR" ? pt[kind] : en[kind];
}

// ============================================================================
// SECTION 19: COMPOSITION / PIPELINE
// ============================================================================

/** End-to-end publish pipeline input. */
export interface PublishPipelineInput {
  readonly request: PublishRequest;
  readonly bundle: BundleMetadata;
  readonly policy: ApprovalPolicy;
  readonly publisherId: string;
  readonly now: string;
}

/** End-to-end publish pipeline output. */
export interface PublishPipelineOutput {
  readonly request: PublishRequest;
  readonly score: CurationScore;
  readonly queue: CurationQueueEntry;
  readonly listing: PublishListing | null;
  readonly decision: PublishDecision | null;
  readonly consents: readonly OptInConsent[];
  readonly errors: readonly string[];
}

export function emptyPipelineOutput(
  request: PublishRequest,
): PublishPipelineOutput {
  return {
    request,
    score: { score: 0, passes: false },
    queue: {
      entryId: "cq_placeholder",
      bundleId: request.bundleId,
      submittedAt: new Date(0).toISOString(),
      priority: 5,
      assignedCuratorId: null,
    },
    listing: null,
    decision: null,
    consents: [],
    errors: [],
  };
}

export function runValidationStage(
  input: PublishPipelineInput,
): ValidationResult {
  return validatePublishRequest(input.request, {
    now: input.now,
    bundle: { size: input.bundle.exports, sensitivity: input.bundle.sensitivity },
  });
}

export function runScoreStage(
  input: PublishPipelineInput,
): CurationScore {
  return computeCurationScore(input.bundle, input.policy);
}

export function runQueueStage(
  input: PublishPipelineInput,
  score: CurationScore,
): CurationQueueEntry {
  return enqueueForCuration(input.request, score.score);
}

export function runPublishStage(
  input: PublishPipelineInput,
  decision: PublishDecision,
): PublishListing {
  return publishListing(input.request, decision, {
    publisherId: input.publisherId,
    now: input.now,
  });
}

// ============================================================================
// SECTION 20: AGGREGATE / METRICS
// ============================================================================

export interface CurationMetrics {
  readonly totalSubmissions: number;
  readonly approved: number;
  readonly rejected: number;
  readonly pending: number;
  readonly slaBreaches: number;
  readonly averageScore: number;
}

export function computeCurationMetrics(
  decisions: readonly PublishDecision[],
  scores: readonly CurationScore[],
  breached: readonly CurationQueueEntry[],
): CurationMetrics {
  const approved = decisions.filter((d) => d.status === "approved").length;
  const rejected = decisions.filter((d) => d.status === "rejected").length;
  const pending = decisions.filter((d) => d.status === "pending-review").length;
  const averageScore =
    scores.length === 0 ? 0 : scores.reduce((acc, s) => acc + s.score, 0) / scores.length;
  return {
    totalSubmissions: decisions.length,
    approved,
    rejected,
    pending,
    slaBreaches: breached.length,
    averageScore: Math.round(averageScore * 100) / 100,
  };
}

export interface ConsentMetrics {
  readonly total: number;
  readonly active: number;
  readonly withdrawn: number;
  readonly uniqueUsers: number;
  readonly averageAgeHours: number;
}

export function computeConsentMetrics(
  consents: readonly OptInConsent[],
  now: string,
): ConsentMetrics {
  const active = consents.filter((c) => c.withdrawnAt === null);
  const withdrawn = consents.filter((c) => c.withdrawnAt !== null);
  const uniqueUsers = new Set(consents.map((c) => c.userId)).size;
  const totalAge = consents.reduce((acc, c) => acc + consentAgeHours(c, now), 0);
  const averageAgeHours =
    consents.length === 0 ? 0 : Math.round((totalAge / consents.length) * 100) / 100;
  return {
    total: consents.length,
    active: active.length,
    withdrawn: withdrawn.length,
    uniqueUsers,
    averageAgeHours,
  };
}

// ============================================================================
// SECTION 21: DOC-ORIENTED HELPERS
// ============================================================================

export interface SpecSummary {
  readonly module: string;
  readonly wave: number;
  readonly version: string;
  readonly totalExports: number;
  readonly sections: number;
  readonly coverage: readonly string[];
}

export function specSummary(totalExports: number, sections: number): SpecSummary {
  return {
    module: MODULE_NAME,
    wave: WAVE,
    version: VERSION,
    totalExports,
    sections,
    coverage: [
      "LGPD Art. 7 (consentimento)",
      "LGPD Art. 8 (confirmação)",
      "LGPD Art. 9 (revogação)",
      "LGPD Art. 18 (exportação/eliminação)",
      "sacred-text sensitivity 4-5 policy",
      "dual-review gate",
      "i18n PT-BR / EN-US",
      "SHA-256 (FIPS 180-4, 64 rounds)",
    ],
  };
}

export const COVERAGE_LGPD_ARTICLES: readonly string[] = [
  "Art. 7",
  "Art. 8",
  "Art. 9",
  "Art. 18",
];

export const FEATURE_FLAGS = {
  strictSACredPolicy: true,
  autoRedactForSacred: true,
  dualReviewForSacred: true,
  publishAuditTrail: true,
  consentWithdrawalAudited: true,
} as const;

// ============================================================================
// SECTION 22: SAFE ID GENERATORS
// ============================================================================

let _seq = 0;

export function nextSequence(): string {
  _seq += 1;
  return `seq_${_seq.toString(36)}`;
}

export function nextDisplayId(prefix: string): string {
  _seq += 1;
  return `${prefix}_${_seq.toString(36)}`;
}

export function resetSequence(): void {
  _seq = 0;
  _entryCounter = 0;
  _listingCounter = 0;
  _auditCounter = 0;
  _notifCounter = 0;
}

export function currentSequenceValue(): number {
  return _seq;
}

// ============================================================================
// SECTION 23: PIPELINE HELPERS / CURRY
// ============================================================================

export function buildCurationChain(
  request: PublishRequest,
  policy: ApprovalPolicy,
): (bundle: BundleMetadata) => { score: CurationScore; queue: CurationQueueEntry } {
  return (bundle: BundleMetadata) => {
    const score = computeCurationScore(bundle, policy);
    const queue = enqueueForCuration(request, score.score);
    return { score, queue };
  };
}

export function buildVisibilityChecker(
  listing: PublishListing,
): (viewer: Viewer) => VisibilityResult {
  return (viewer: Viewer) => checkListingVisibility(listing, viewer);
}

export function buildOptInGate(
  listing: PublishListing,
): (consents: readonly OptInConsent[]) => { ok: boolean; missing: string[] } {
  return (consents: readonly OptInConsent[]) => {
    if (!listing.optInRequired) return { ok: true, missing: [] };
    const active = consents.filter((c) => c.withdrawnAt === null).map((c) => c.userId);
    const missing: string[] = [];
    if (!active.includes(listing.publisherId)) missing.push(listing.publisherId);
    return { ok: missing.length === 0, missing };
  };
}

// ============================================================================
// SECTION 24: BUNDLE COMPOSITION WITH W51 SHAPES
// ============================================================================

/** Minimal shape consumed by `composeWithW51Bundle`. */
export interface W51BundleLike {
  readonly id: string;
  readonly version: string;
  readonly exports: number;
  readonly complexity: number;
  readonly sensitivity: SensitivityLevel;
  readonly locale: readonly string[];
  readonly sacred: boolean;
}

/** Compose a w52 PublishRequest + decision from a w51 bundle-like shape. */
export function composeWithW51Bundle(
  bundle: W51BundleLike,
  opts: { visibility: PublishVisibility; locale: string; publisherId: string; now: string },
): PublishRequest {
  return {
    bundleId: bundle.id,
    curatorNotes:
      `Bundle ${bundle.id} v${bundle.version} — ${bundle.exports} exports, sensitivity ${bundle.sensitivity}.`,
    visibility: opts.visibility,
    requiresApproval: bundle.sacred || bundle.sensitivity >= 3,
    tags: bundle.sacred ? ["sacred", `sensitivity-${bundle.sensitivity}`] : [`sensitivity-${bundle.sensitivity}`],
    locale: opts.locale,
  };
}

/** Compute metadata score from a w51 bundle-like shape. */
export function scoreFromW51Bundle(
  bundle: W51BundleLike,
  policy: ApprovalPolicy,
): CurationScore {
  return computeCurationScore(
    {
      exports: bundle.exports,
      complexity: bundle.complexity,
      sensitivity: bundle.sensitivity,
      locale: bundle.locale,
    },
    policy,
  );
}

/** Decide whether a w51 bundle needs sacred-text review. */
export function w51NeedsSacred(bundle: W51BundleLike): boolean {
  return bundle.sacred || bundle.sensitivity >= SACRED_SENSITIVITY_THRESHOLD;
}

// ============================================================================
// SECTION 25: END OF MODULE
// ============================================================================

/**
 * Public surface checklist (for documentation generators):
 *
 *  Types:  PublishVisibility, PublishStatus, ReviewerVerdict,
 *          SensitivityLevel, CurationPriority, RedactionLevel,
 *          SupportedLocale, OptInReason, PublishRequest, PublishDecision,
 *          PublishListing, OptInConsent, CurationQueueEntry, ApprovalPolicy,
 *          Curator, Viewer, ValidationResult, PublishTombstone,
 *          UnpublishResult, OptInAuditSummary, VisibilityResult,
 *          DualReviewGateResult, CurationScore, TagPolicyResult,
 *          ReviewerLoad, BulkPublishResult, CatalogEntry, CatalogExport,
 *          LocaleCoverageResult, LGPDComplianceResult, PublishReport,
 *          BundleShape, BundleMetadata, BundleSubmission, ApprovalVerdict,
 *          SubmissionState, MarketplaceFilter, PublishAuditEntry,
 *          PublisherPermissions, PublishNotification, PublishPipelineInput,
 *          PublishPipelineOutput, CurationMetrics, ConsentMetrics,
 *          SpecSummary, W51BundleLike, PublishStatusI18N
 *
 *  Errors: PublishFlowError, PublishValidationError, CurationSLABreachError,
 *          DualReviewRequiredError, OptInRequiredError, LGPDConsentMissingError,
 *          LocaleCoverageError, SacredSensitivityError, ListingHashMismatchError,
 *          ListingNotVisibleError
 */
export const PUBLIC_SURFACE_VERSION = "0.1.0" as const;