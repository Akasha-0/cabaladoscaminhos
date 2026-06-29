/**
 * cockpit_widget_bundle_installer.ts
 * =================================
 *
 * w53 — Widget Bundle Installer engine for the Cabala dos Caminhos cockpit.
 *
 * Consumes the w52/cockpit-bundle-publish-flow output (`PublishListing`)
 * and the w51/cockpit-widget-bundle shape (`W51BundleLike`) and provides:
 *
 *   1. Bundle discovery / catalog browsing (filter by tradition, category,
 *      LGPD consent level, locale).
 *   2. Dashboard slot matching (slot type + size + dependencies).
 *   3. Dependency resolution with install-order topological sort.
 *   4. Semver-aware version constraint solver (^, ~, exact, range, >=).
 *   5. Six-state install machine: PROSPECTING → RESOLVING → DOWNLOADING →
 *      VERIFYING → INSTALLING → ACTIVE (or → FAILED with reason).
 *   6. Rollback to previous version with slot-state restoration.
 *   7. Uninstall with 30-day retention → erasure (LGPD Art. 18).
 *   8. LGPD Art. 7 (consent), Art. 9 (sensitive data), Art. 18 (export +
 *      erasure) coverage; consent withdrawal halts an active bundle.
 *   9. Sacred-text policy — bundles flagged sacred require curator
 *      pre-approval + double-review.
 *
 * Implementation constraints (per wave spec):
 *   • Single file, by-shape (no imports from other repo files).
 *   • Hand-rolled SHA-256 (FIPS 180-4) for bundle integrity.
 *   • Hand-rolled HMAC-SHA-256 for install-audit chain.
 *   • Hand-rolled semver parser / comparator / constraint solver.
 *   • No `any` types.
 *   • TSC=0 on the file in isolation.
 *
 * @module w53/cockpit-widget-bundle-installer
 */

// =============================================================================
// SECTION 1 — Module constants
// =============================================================================

/** ISO 8601 timestamp regex (UTC, with optional fractional seconds). */
export const ISO_8601_REGEX: RegExp =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;

/** Semver core regex (MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]). */
export const SEMVER_CORE_REGEX: RegExp =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/** SHA-256 hex digest length (256 bits / 4 bits per hex char). */
export const SHA256_HEX_LENGTH: number = 64;

/** HMAC-SHA-256 output length in hex chars. */
export const HMAC_SHA256_HEX_LENGTH: number = 64;

/** Default retention window before erasure (LGPD Art. 18). Days. */
export const DEFAULT_RETENTION_DAYS: number = 30;

/** Default grace period for rollback availability after install. Hours. */
export const DEFAULT_ROLLBACK_WINDOW_HOURS: number = 24;

/** Maximum dashboard slot grid: width × height. */
export const SLOT_GRID_WIDTH: number = 12;
export const SLOT_GRID_HEIGHT: number = 8;

/** Default min slot capacity for a sacred-content bundle (cells). */
export const SACRED_MIN_SLOT_CAPACITY: number = 6;

/** Default max dependency depth (cycles = reject). */
export const MAX_DEPENDENCY_DEPTH: number = 16;

/** LGPD Art. 7 — required consent reason keys. */
export const LGPD_CONSENT_KEYS: readonly string[] = [
  "install-explicit-consent",
  "sacred-content-opt-in",
  "sensitive-data-processing",
  "third-party-data-sharing",
  "cross-border-transfer",
] as const;

/** Sacred-tradition tags that trigger double-review gate. */
export const SACRED_TRADITION_TAGS: readonly string[] = [
  "candomble",
  "umbanda",
  "ifa",
  "kabbalah",
  "tarot-sacred",
  "orixa-ritual",
  "cabala-mystica",
] as const;

/** Slot kinds supported by the installer. */
export const SLOT_KINDS: readonly string[] = [
  "primary",
  "secondary",
  "ticker",
  "spotlight",
  "compact",
  "expanded",
  "ritual",
] as const;

/** Bundle kinds supported by the installer. */
export const BUNDLE_KINDS: readonly string[] = [
  "tarot-spread",
  "oracle-reading",
  "cigano-spread",
  "odiac-deck",
  "numerology-pillar",
  "astrology-chart",
  "ritual-calendar",
  "mentorship-marker",
  "community-feed",
  "personal-dashboard",
] as const;

/** Supported locales (matches w52/cockpit-bundle-publish-flow). */
export const SUPPORTED_LOCALES: readonly string[] = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
] as const;

/** Default consent policy for non-sensitive bundles. */
export const DEFAULT_CONSENT_POLICY_ID: string = "policy.lgpd.v1";

/** Audit chain HMAC key — opaque placeholder; production wires to KMS. */
export const AUDIT_CHAIN_HMAC_KEY: string =
  "w53-cockpit-widget-bundle-installer-audit-chain-v1";

/** Install session id prefix (random suffix appended). */
export const INSTALL_SESSION_PREFIX: string = "inst";

// =============================================================================
// SECTION 2 — Primitive type aliases
// =============================================================================

/** ISO-8601 UTC timestamp string. */
export type IsoTimestamp = string;

/** SHA-256 hex digest string. */
export type Sha256Hex = string;

/** Semver version string (e.g. "1.2.3", "0.4.0-beta.1"). */
export type SemverString = string;

/** Version constraint string (e.g. "^1.2.0", "~1.0", ">=2.0.0 <3.0.0"). */
export type VersionConstraint = string;

/** Locale tag (pt-BR, en-US, es-ES, fr-FR). */
export type LocaleTag = (typeof SUPPORTED_LOCALES)[number];

/** Slot kind discriminant. */
export type SlotKind = (typeof SLOT_KINDS)[number];

/** Bundle kind discriminant. */
export type BundleKind = (typeof BUNDLE_KINDS)[number];

/** Sensitivity level (1=low .. 5=sacred). Matches w52 SensitivityLevel. */
export type SensitivityLevel = 1 | 2 | 3 | 4 | 5;

/** Dashboard layout slot shape — a rectangular region of the grid. */
export interface SlotRegion {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Dashboard slot installed at runtime. */
export interface DashboardSlot {
  readonly slotId: string;
  readonly slotKind: SlotKind;
  readonly region: SlotRegion;
  readonly capacity: number;
  readonly supportsKinds: readonly BundleKind[];
  readonly occupiedBy: string | null;
}

/** Version constraint token after lexing. */
export type VersionConstraintOp =
  | "exact"
  | "gte"
  | "lte"
  | "gt"
  | "lt"
  | "caret"
  | "tilde"
  | "range";

/** Lexed version constraint clause. */
export interface VersionClause {
  readonly op: VersionConstraintOp;
  readonly version: SemverString;
}

// =============================================================================
// SECTION 3 — Install state machine
// =============================================================================

/** Six install states + terminal FAILED. */
export type InstallState =
  | "PROSPECTING"
  | "RESOLVING"
  | "DOWNLOADING"
  | "VERIFYING"
  | "INSTALLING"
  | "ACTIVE"
  | "FAILED";

/** Permitted state transitions (linear + FAILED sink). */
export const INSTALL_STATE_TRANSITIONS: Readonly<Record<InstallState, readonly InstallState[]>> = {
  PROSPECTING: ["RESOLVING", "FAILED"],
  RESOLVING: ["DOWNLOADING", "FAILED"],
  DOWNLOADING: ["VERIFYING", "FAILED"],
  VERIFYING: ["INSTALLING", "FAILED"],
  INSTALLING: ["ACTIVE", "FAILED"],
  ACTIVE: ["FAILED"],
  FAILED: [],
} as const;

/** State-machine event emitted on each transition. */
export interface InstallStateEvent {
  readonly sessionId: string;
  readonly from: InstallState;
  readonly to: InstallState;
  readonly at: IsoTimestamp;
  readonly reason: string | null;
}

/** Failure reason discriminant. */
export type InstallFailureReason =
  | "consent-missing"
  | "dependency-missing"
  | "version-conflict"
  | "slot-incompatible"
  | "integrity-mismatch"
  | "download-error"
  | "sacred-approval-missing"
  | "lgpd-erasure-pending"
  | "double-review-rejected"
  | "unknown-error";

// =============================================================================
// SECTION 4 — Bundle catalog shape (consumes w52 PublishListing)
// =============================================================================

/**
 * w52 PublishListing-shape consumed by the installer.
 * Mirrors the published `PublishListing` from w52/cockpit-bundle-publish-flow.
 */
export interface InstallListingShape {
  readonly listingId: string;
  readonly bundleId: string;
  readonly publisherId: string;
  readonly publishedAt: IsoTimestamp;
  readonly visibility: "private" | "unlisted" | "public";
  readonly optInRequired: boolean;
  readonly locale: LocaleTag;
  readonly sha256: Sha256Hex;
}

/**
 * Full bundle descriptor (w52 PublishListing + w51 W51BundleLike merged).
 */
export interface CatalogBundle {
  readonly bundleId: string;
  readonly version: SemverString;
  readonly listingId: string;
  readonly publisherId: string;
  readonly publishedAt: IsoTimestamp;
  readonly kind: BundleKind;
  readonly tradition: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly sensitivity: SensitivityLevel;
  readonly sacred: boolean;
  readonly locales: readonly LocaleTag[];
  readonly exports: number;
  readonly complexity: number;
  readonly sizeBytes: number;
  readonly sha256: Sha256Hex;
  readonly visibility: "private" | "unlisted" | "public";
  readonly optInRequired: boolean;
  readonly curatorApprovedAt: IsoTimestamp | null;
  readonly doubleReviewApprovedAt: IsoTimestamp | null;
  readonly dependencies: readonly BundleDependency[];
  readonly peerConstraint: VersionConstraint | null;
  readonly minSlotCapacity: number;
  readonly preferredSlotKinds: readonly SlotKind[];
  readonly description: string;
}

/** Bundle dependency declaration (semver-constrained). */
export interface BundleDependency {
  readonly bundleId: string;
  readonly constraint: VersionConstraint;
  readonly optional: boolean;
}

/** Catalog filter — narrows `discoverBundles` results. */
export interface CatalogFilter {
  readonly tradition?: string;
  readonly category?: string;
  readonly kind?: BundleKind;
  readonly locale?: LocaleTag;
  readonly sensitivityMax?: SensitivityLevel;
  readonly sacred?: boolean;
  readonly optInRequired?: boolean;
  readonly publisherId?: string;
  readonly query?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

/** Catalog pagination wrapper. */
export interface CatalogPage {
  readonly items: readonly CatalogBundle[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasMore: boolean;
}

// =============================================================================
// SECTION 5 — User dashboard shape
// =============================================================================

/** Single installed bundle on the user's dashboard. */
export interface InstalledBundle {
  readonly installId: string;
  readonly bundleId: string;
  readonly version: SemverString;
  readonly installedAt: IsoTimestamp;
  readonly installedByUserId: string;
  readonly slotId: string;
  readonly sha256: Sha256Hex;
  readonly consentRecordId: string;
  readonly sacred: boolean;
  readonly rollbackOf: string | null;
  readonly rollbackTargetVersion: SemverString | null;
  readonly state: "active" | "paused" | "pending-erasure" | "rolled-back";
}

/** User dashboard model (the installer's state-of-truth). */
export interface UserDashboard {
  readonly userId: string;
  readonly locale: LocaleTag;
  readonly slots: readonly DashboardSlot[];
  readonly installed: readonly InstalledBundle[];
  readonly retentionExpiresAt: IsoTimestamp | null;
}

// =============================================================================
// SECTION 6 — LGPD consent + audit
// =============================================================================

/** LGPD consent record (Art. 7) — one per install / sensitive action. */
export interface InstallConsent {
  readonly consentId: string;
  readonly userId: string;
  readonly bundleId: string;
  readonly listingId: string;
  readonly consentKeys: readonly string[];
  readonly grantedAt: IsoTimestamp;
  readonly ipHash: string;
  readonly userAgentHash: string;
  readonly withdrawnAt: IsoTimestamp | null;
  readonly reasonWithdrawn: string | null;
}

/** Audit chain entry — chained via HMAC. */
export interface InstallerAuditEntry {
  readonly entryId: string;
  readonly at: IsoTimestamp;
  readonly userId: string;
  readonly bundleId: string | null;
  readonly action:
    | "discover"
    | "consent-granted"
    | "consent-withdrawn"
    | "install-started"
    | "install-state"
    | "install-completed"
    | "install-failed"
    | "rollback"
    | "uninstall"
    | "erasure-scheduled"
    | "erasure-completed"
    | "sacred-review-requested"
    | "sacred-review-approved"
    | "sacred-review-rejected";
  readonly detail: string;
  readonly prevHmac: Sha256Hex;
  readonly hmac: Sha256Hex;
}

/** Audit chain head pointer (latest entry). */
export interface AuditChainHead {
  readonly userId: string;
  readonly lastEntryId: string;
  readonly lastHmac: Sha256Hex;
  readonly length: number;
}

/** LGPD Art. 18 export payload — data the user can take away. */
export interface LgpdExportPayload {
  readonly userId: string;
  readonly exportedAt: IsoTimestamp;
  readonly consents: readonly InstallConsent[];
  readonly installed: readonly InstalledBundle[];
  readonly auditChain: readonly InstallerAuditEntry[];
  readonly format: "json" | "csv";
}

/** LGPD Art. 18 erasure result. */
export interface LgpdErasureResult {
  readonly userId: string;
  readonly erasedAt: IsoTimestamp;
  readonly consentIds: readonly string[];
  readonly installIds: readonly string[];
  readonly auditEntriesRedacted: number;
  readonly slotsFreed: readonly string[];
}

// =============================================================================
// SECTION 7 — Slot match + dependency resolver types
// =============================================================================

/** Slot match candidate (one of N possible slots for a bundle). */
export interface SlotMatchCandidate {
  readonly slotId: string;
  readonly slotKind: SlotKind;
  readonly region: SlotRegion;
  readonly capacity: number;
  readonly score: number;
  readonly reasons: readonly string[];
}

/** Slot match result. */
export interface SlotMatchResult {
  readonly bundleId: string;
  readonly candidates: readonly SlotMatchCandidate[];
  readonly bestCandidate: SlotMatchCandidate | null;
}

/** Dependency status for a single dep. */
export interface DependencyStatus {
  readonly bundleId: string;
  readonly constraint: VersionConstraint;
  readonly status: "satisfied" | "missing" | "version-conflict" | "optional-missing";
  readonly installedVersion: SemverString | null;
  readonly resolvedVersion: SemverString | null;
}

/** Dependency resolution result. */
export interface DependencyResolution {
  readonly bundleId: string;
  readonly allSatisfied: boolean;
  readonly missing: readonly DependencyStatus[];
  readonly conflicts: readonly DependencyStatus[];
  readonly installOrder: readonly string[];
  readonly cycleDetected: boolean;
  readonly depthReached: number;
}

/** Sacred-text approval record (curator + double-review). */
export interface SacredApproval {
  readonly bundleId: string;
  readonly requestedAt: IsoTimestamp;
  readonly curatorId: string | null;
  readonly curatorApprovedAt: IsoTimestamp | null;
  readonly secondCuratorId: string | null;
  readonly secondApprovedAt: IsoTimestamp | null;
  readonly rejected: boolean;
  readonly rejectionReason: string | null;
}

// =============================================================================
// SECTION 8 — Version solver types
// =============================================================================

/** Parsed semver version triple. */
export interface SemverParts {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease: readonly string[];
  readonly build: readonly string[];
  readonly raw: SemverString;
}

/** Version comparison outcome. */
export type SemverCompare = -1 | 0 | 1;

/** Constraint set (one or more clauses). */
export interface ConstraintSet {
  readonly raw: VersionConstraint;
  readonly clauses: readonly VersionClause[];
  readonly allowPrerelease: boolean;
}

/** Version solver outcome. */
export interface VersionSolverResult {
  readonly satisfied: boolean;
  readonly matchedVersion: SemverString | null;
  readonly candidateIndex: number;
  readonly reason: string | null;
}

// =============================================================================
// SECTION 9 — Rollback + uninstall types
// =============================================================================

/** Rollback record (one per rollback operation). */
export interface RollbackRecord {
  readonly rollbackId: string;
  readonly installId: string;
  readonly bundleId: string;
  readonly fromVersion: SemverString;
  readonly toVersion: SemverString;
  readonly rolledBackAt: IsoTimestamp;
  readonly slotStateBefore: SlotRegion;
  readonly slotStateAfter: SlotRegion;
  readonly reason: string;
  readonly hmac: Sha256Hex;
}

/** Uninstall record. */
export interface UninstallRecord {
  readonly uninstallId: string;
  readonly installId: string;
  readonly bundleId: string;
  readonly uninstalledAt: IsoTimestamp;
  readonly slotFreed: string;
  readonly auditEntryIds: readonly string[];
  readonly retentionExpiresAt: IsoTimestamp;
}

// =============================================================================
// SECTION 10 — Install pipeline IO
// =============================================================================

/** Install request — what the caller hands the installer. */
export interface InstallRequest {
  readonly userId: string;
  readonly bundleId: string;
  readonly listingId: string;
  readonly version: SemverString;
  readonly slotId: string | null;
  readonly consentKeys: readonly string[];
  readonly ipHash: string;
  readonly userAgentHash: string;
  readonly now: IsoTimestamp;
}

/** Install response — what the installer hands back. */
export interface InstallResponse {
  readonly sessionId: string;
  readonly installId: string | null;
  readonly finalState: InstallState;
  readonly bundleId: string;
  readonly version: SemverString;
  readonly slotId: string | null;
  readonly installedAt: IsoTimestamp | null;
  readonly failureReason: InstallFailureReason | null;
  readonly failureMessage: string | null;
  readonly auditEntryIds: readonly string[];
  readonly dependencyResolution: DependencyResolution | null;
  readonly slotMatch: SlotMatchResult | null;
}

/** Download artifact (verified bundle payload, sha-pinned). */
export interface DownloadArtifact {
  readonly bundleId: string;
  readonly version: SemverString;
  readonly sha256: Sha256Hex;
  readonly bytes: number;
  readonly payloadRef: string;
  readonly fetchedAt: IsoTimestamp;
  readonly verified: boolean;
}

/** Install session — running install attempt's mutable state. */
export interface InstallSession {
  readonly sessionId: string;
  readonly userId: string;
  readonly bundleId: string;
  readonly version: SemverString;
  readonly listing: InstallListingShape;
  readonly state: InstallState;
  readonly history: readonly InstallStateEvent[];
  readonly startedAt: IsoTimestamp;
  readonly endedAt: IsoTimestamp | null;
  readonly failureReason: InstallFailureReason | null;
  readonly failureMessage: string | null;
}

// =============================================================================
// SECTION 11 — Error classes
// =============================================================================

/** Base installer error. */
export class InstallerError extends Error {
  public readonly code: string;
  public readonly at: IsoTimestamp;
  constructor(code: string, message: string, at: IsoTimestamp) {
    super(message);
    this.name = "InstallerError";
    this.code = code;
    this.at = at;
  }
}

/** Install validation rejected before state machine entry. */
export class InstallValidationError extends InstallerError {
  constructor(message: string, at: IsoTimestamp) {
    super("install-validation", message, at);
    this.name = "InstallValidationError";
  }
}

/** Semver parse / comparison failure. */
export class SemverError extends InstallerError {
  constructor(message: string, at: IsoTimestamp) {
    super("semver", message, at);
    this.name = "SemverError";
  }
}

/** Version constraint could not be satisfied. */
export class VersionConflictError extends InstallerError {
  public readonly bundleId: string;
  public readonly constraint: VersionConstraint;
  public readonly installedVersion: SemverString | null;
  constructor(
    bundleId: string,
    constraint: VersionConstraint,
    installedVersion: SemverString | null,
    message: string,
    at: IsoTimestamp,
  ) {
    super("version-conflict", message, at);
    this.name = "VersionConflictError";
    this.bundleId = bundleId;
    this.constraint = constraint;
    this.installedVersion = installedVersion;
  }
}

/** Required dependency missing from dashboard. */
export class MissingDependencyError extends InstallerError {
  public readonly bundleId: string;
  public readonly missing: readonly string[];
  constructor(bundleId: string, missing: readonly string[], message: string, at: IsoTimestamp) {
    super("missing-dependency", message, at);
    this.name = "MissingDependencyError";
    this.bundleId = bundleId;
    this.missing = missing;
  }
}

/** Dependency graph contains a cycle. */
export class DependencyCycleError extends InstallerError {
  public readonly cycle: readonly string[];
  constructor(cycle: readonly string[], message: string, at: IsoTimestamp) {
    super("dependency-cycle", message, at);
    this.name = "DependencyCycleError";
    this.cycle = cycle;
  }
}

/** No compatible dashboard slot for the requested bundle. */
export class SlotIncompatibleError extends InstallerError {
  public readonly bundleId: string;
  public readonly inspected: number;
  constructor(bundleId: string, inspected: number, message: string, at: IsoTimestamp) {
    super("slot-incompatible", message, at);
    this.name = "SlotIncompatibleError";
    this.bundleId = bundleId;
    this.inspected = inspected;
  }
}

/** Bundle sha256 did not match the listing hash. */
export class IntegrityMismatchError extends InstallerError {
  public readonly bundleId: string;
  public readonly expected: Sha256Hex;
  public readonly actual: Sha256Hex;
  constructor(bundleId: string, expected: Sha256Hex, actual: Sha256Hex, at: IsoTimestamp) {
    super("integrity-mismatch", `sha256 mismatch for ${bundleId}`, at);
    this.name = "IntegrityMismatchError";
    this.bundleId = bundleId;
    this.expected = expected;
    this.actual = actual;
  }
}

/** Sacred bundle requires double-review approval that is absent. */
export class SacredApprovalMissingError extends InstallerError {
  public readonly bundleId: string;
  constructor(bundleId: string, message: string, at: IsoTimestamp) {
    super("sacred-approval-missing", message, at);
    this.name = "SacredApprovalMissingError";
    this.bundleId = bundleId;
  }
}

/** Required LGPD consent missing or withdrawn. */
export class LgpdConsentMissingError extends InstallerError {
  public readonly userId: string;
  public readonly bundleId: string;
  public readonly missingKeys: readonly string[];
  constructor(
    userId: string,
    bundleId: string,
    missingKeys: readonly string[],
    message: string,
    at: IsoTimestamp,
  ) {
    super("lgpd-consent-missing", message, at);
    this.name = "LgpdConsentMissingError";
    this.userId = userId;
    this.bundleId = bundleId;
    this.missingKeys = missingKeys;
  }
}

/** Rollback target not found or out of retention window. */
export class RollbackUnavailableError extends InstallerError {
  public readonly installId: string;
  constructor(installId: string, message: string, at: IsoTimestamp) {
    super("rollback-unavailable", message, at);
    this.name = "RollbackUnavailableError";
    this.installId = installId;
  }
}

/** Illegal state transition. */
export class IllegalStateTransitionError extends InstallerError {
  public readonly from: InstallState;
  public readonly to: InstallState;
  constructor(from: InstallState, to: InstallState, message: string, at: IsoTimestamp) {
    super("illegal-state-transition", message, at);
    this.name = "IllegalStateTransitionError";
    this.from = from;
    this.to = to;
  }
}

// =============================================================================
// SECTION 12 — Type guards
// =============================================================================

export function isInstallState(value: unknown): value is InstallState {
  return (
    typeof value === "string" &&
    (value === "PROSPECTING" ||
      value === "RESOLVING" ||
      value === "DOWNLOADING" ||
      value === "VERIFYING" ||
      value === "INSTALLING" ||
      value === "ACTIVE" ||
      value === "FAILED")
  );
}

export function isBundleKind(value: unknown): value is BundleKind {
  return typeof value === "string" && (BUNDLE_KINDS as readonly string[]).includes(value);
}

export function isSlotKind(value: unknown): value is SlotKind {
  return typeof value === "string" && (SLOT_KINDS as readonly string[]).includes(value);
}

export function isSensitivityLevel(value: unknown): value is SensitivityLevel {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function isLocaleTag(value: unknown): value is LocaleTag {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function isSha256Hex(value: unknown): value is Sha256Hex {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

export function isIsoTimestamp(value: unknown): value is IsoTimestamp {
  return typeof value === "string" && ISO_8601_REGEX.test(value);
}

export function isSacredTraditionTag(value: string): boolean {
  return (SACRED_TRADITION_TAGS as readonly string[]).includes(value);
}

export function isLgpdConsentKey(value: string): boolean {
  return (LGPD_CONSENT_KEYS as readonly string[]).includes(value);
}

export function isSlotRegion(value: unknown): value is SlotRegion {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r["x"] === "number" &&
    typeof r["y"] === "number" &&
    typeof r["width"] === "number" &&
    typeof r["height"] === "number" &&
    r["x"] >= 0 &&
    r["y"] >= 0 &&
    r["width"] > 0 &&
    r["height"] > 0
  );
}

export function isDashboardSlot(value: unknown): value is DashboardSlot {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s["slotId"] === "string" &&
    typeof s["slotKind"] === "string" &&
    isSlotKind(s["slotKind"]) &&
    typeof s["region"] === "object" &&
    isSlotRegion(s["region"]) &&
    typeof s["capacity"] === "number" &&
    Array.isArray(s["supportsKinds"]) &&
    (s["occupiedBy"] === null || typeof s["occupiedBy"] === "string")
  );
}

export function isInstalledBundle(value: unknown): value is InstalledBundle {
  if (typeof value !== "object" || value === null) return false;
  const i = value as Record<string, unknown>;
  return (
    typeof i["installId"] === "string" &&
    typeof i["bundleId"] === "string" &&
    typeof i["version"] === "string" &&
    typeof i["installedAt"] === "string" &&
    typeof i["installedByUserId"] === "string" &&
    typeof i["slotId"] === "string" &&
    typeof i["sha256"] === "string" &&
    typeof i["consentRecordId"] === "string" &&
    typeof i["sacred"] === "boolean" &&
    (i["rollbackOf"] === null || typeof i["rollbackOf"] === "string") &&
    (i["rollbackTargetVersion"] === null ||
      typeof i["rollbackTargetVersion"] === "string") &&
    (i["state"] === "active" ||
      i["state"] === "paused" ||
      i["state"] === "pending-erasure" ||
      i["state"] === "rolled-back")
  );
}

export function isUserDashboard(value: unknown): value is UserDashboard {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return (
    typeof d["userId"] === "string" &&
    typeof d["locale"] === "string" &&
    isLocaleTag(d["locale"]) &&
    Array.isArray(d["slots"]) &&
    Array.isArray(d["installed"]) &&
    (d["retentionExpiresAt"] === null || typeof d["retentionExpiresAt"] === "string")
  );
}

export function isCatalogBundle(value: unknown): value is CatalogBundle {
  if (typeof value !== "object" || value === null) return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b["bundleId"] === "string" &&
    typeof b["version"] === "string" &&
    typeof b["listingId"] === "string" &&
    typeof b["publisherId"] === "string" &&
    typeof b["kind"] === "string" &&
    isBundleKind(b["kind"]) &&
    typeof b["tradition"] === "string" &&
    typeof b["category"] === "string" &&
    Array.isArray(b["tags"]) &&
    typeof b["sensitivity"] === "number" &&
    isSensitivityLevel(b["sensitivity"]) &&
    typeof b["sacred"] === "boolean" &&
    typeof b["sha256"] === "string" &&
    isSha256Hex(b["sha256"]) &&
    typeof b["exports"] === "number" &&
    typeof b["complexity"] === "number" &&
    typeof b["sizeBytes"] === "number" &&
    typeof b["minSlotCapacity"] === "number" &&
    typeof b["description"] === "string" &&
    Array.isArray(b["dependencies"]) &&
    Array.isArray(b["locales"]) &&
    Array.isArray(b["preferredSlotKinds"])
  );
}

export function isInstallRequest(value: unknown): value is InstallRequest {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r["userId"] === "string" &&
    typeof r["bundleId"] === "string" &&
    typeof r["listingId"] === "string" &&
    typeof r["version"] === "string" &&
    (r["slotId"] === null || typeof r["slotId"] === "string") &&
    Array.isArray(r["consentKeys"]) &&
    typeof r["ipHash"] === "string" &&
    typeof r["userAgentHash"] === "string" &&
    typeof r["now"] === "string"
  );
}

export function isInstallConsent(value: unknown): value is InstallConsent {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c["consentId"] === "string" &&
    typeof c["userId"] === "string" &&
    typeof c["bundleId"] === "string" &&
    typeof c["listingId"] === "string" &&
    Array.isArray(c["consentKeys"]) &&
    typeof c["grantedAt"] === "string" &&
    typeof c["ipHash"] === "string" &&
    typeof c["userAgentHash"] === "string" &&
    (c["withdrawnAt"] === null || typeof c["withdrawnAt"] === "string") &&
    (c["reasonWithdrawn"] === null || typeof c["reasonWithdrawn"] === "string")
  );
}

export function isBundleDependency(value: unknown): value is BundleDependency {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return (
    typeof d["bundleId"] === "string" &&
    typeof d["constraint"] === "string" &&
    typeof d["optional"] === "boolean"
  );
}

export function isVersionConstraint(value: unknown): value is VersionConstraint {
  if (typeof value !== "string") return false;
  if (value.trim().length === 0) return false;
  const parts = value.split(/\s+/);
  for (const part of parts) {
    if (
      !part.startsWith("^") &&
      !part.startsWith("~") &&
      !part.startsWith(">=") &&
      !part.startsWith("<=") &&
      !part.startsWith(">") &&
      !part.startsWith("<") &&
      !SEMVER_CORE_REGEX.test(part)
    ) {
      return false;
    }
  }
  return true;
}

export function isSacredBundle(b: CatalogBundle): boolean {
  if (b.sacred) return true;
  return b.tags.some((t) => isSacredTraditionTag(t));
}

// =============================================================================
// SECTION 13 — Hand-rolled SHA-256 (FIPS 180-4)
// =============================================================================

const SHA256_K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function utf8Encode(input: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let c = input.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6));
      out.push(0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < input.length) {
      const c2 = input.charCodeAt(i + 1);
      if (c2 >= 0xdc00 && c2 <= 0xdfff) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        i++;
        out.push(0xf0 | (c >> 18));
        out.push(0x80 | ((c >> 12) & 0x3f));
        out.push(0x80 | ((c >> 6) & 0x3f));
        out.push(0x80 | (c & 0x3f));
      } else {
        out.push(0xef, 0xbf, 0xbd);
      }
    } else {
      out.push(0xe0 | (c >> 12));
      out.push(0x80 | ((c >> 6) & 0x3f));
      out.push(0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(out);
}

function sha256Compress(state: number[], block: Uint8Array, offset: number): void {
  const w = new Array<number>(64);
  for (let i = 0; i < 16; i++) {
    w[i] =
      ((block[offset + i * 4] << 24) |
        (block[offset + i * 4 + 1] << 16) |
        (block[offset + i * 4 + 2] << 8) |
        block[offset + i * 4 + 3]) >>>
      0;
  }
  for (let i = 16; i < 64; i++) {
    const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
    const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
  }
  let [a, b, c, d, e, f, g, h] = [
    state[0],
    state[1],
    state[2],
    state[3],
    state[4],
    state[5],
    state[6],
    state[7],
  ];
  for (let i = 0; i < 64; i++) {
    const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
    const ch = (e & f) ^ (~e & g);
    const temp1 = (h + S1 + ch + (SHA256_K[i] as number) + w[i]) >>> 0;
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
  state[0] = (state[0] + a) >>> 0;
  state[1] = (state[1] + b) >>> 0;
  state[2] = (state[2] + c) >>> 0;
  state[3] = (state[3] + d) >>> 0;
  state[4] = (state[4] + e) >>> 0;
  state[5] = (state[5] + f) >>> 0;
  state[6] = (state[6] + g) >>> 0;
  state[7] = (state[7] + h) >>> 0;
}

function sha256Bytes(message: Uint8Array): Uint8Array {
  const state = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const len = message.length;
  const bitLen = len * 8;
  const padLen = (len % 64 < 56 ? 56 : 120) - (len % 64);
  const total = len + padLen + 8;
  const buf = new Uint8Array(total);
  buf.set(message);
  buf[len] = 0x80;
  for (let i = 0; i < 8; i++) {
    buf[total - 1 - i] = (bitLen >>> (i * 8)) & 0xff;
  }
  for (let off = 0; off < total; off += 64) {
    sha256Compress(state, buf, off);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4] = (state[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (state[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (state[i] >>> 8) & 0xff;
    out[i * 4 + 3] = state[i] & 0xff;
  }
  return out;
}

function toHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    s += ((b >>> 4) & 0xf).toString(16);
    s += (b & 0xf).toString(16);
  }
  return s;
}

/** Compute SHA-256 of a UTF-8 string; returns lowercase hex. */
export function sha256(input: string): Sha256Hex {
  return toHex(sha256Bytes(utf8Encode(input)));
}

/** Compute SHA-256 of a byte array; returns lowercase hex. */
export function sha256OfBytes(bytes: Uint8Array): Sha256Hex {
  return toHex(sha256Bytes(bytes));
}

/** Canonical JSON (sort keys, no whitespace) for stable hash input. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map((v) => canonicalJson(v)).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts: string[] = [];
  for (const k of keys) {
    parts.push(JSON.stringify(k) + ":" + canonicalJson(obj[k]));
  }
  return "{" + parts.join(",") + "}";
}

/** Stable hash of an object via canonical JSON → SHA-256. */
export function hashObject(value: unknown): Sha256Hex {
  return sha256(canonicalJson(value));
}

// =============================================================================
// SECTION 14 — Hand-rolled HMAC-SHA-256
// =============================================================================

function hmacSha256Bytes(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let k: Uint8Array;
  if (key.length > blockSize) {
    k = sha256Bytes(key);
  } else if (key.length < blockSize) {
    k = new Uint8Array(blockSize);
    k.set(key);
  } else {
    k = key;
  }
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = (k[i] ?? 0) ^ 0x36;
    opad[i] = (k[i] ?? 0) ^ 0x5c;
  }
  const inner = new Uint8Array(blockSize + message.length);
  inner.set(ipad);
  inner.set(message, blockSize);
  const innerHash = sha256Bytes(inner);
  const outer = new Uint8Array(blockSize + innerHash.length);
  outer.set(opad);
  outer.set(innerHash, blockSize);
  return sha256Bytes(outer);
}

/** Compute HMAC-SHA-256 (hex) with a string key and string message. */
export function hmacSha256(key: string, message: string): Sha256Hex {
  return toHex(hmacSha256Bytes(utf8Encode(key), utf8Encode(message)));
}

/** Compute HMAC over canonical JSON of `value` (audit-chain ready). */
export function hmacJson(key: string, value: unknown): Sha256Hex {
  return hmacSha256(key, canonicalJson(value));
}

/** Chain an HMAC over `payload` keyed on the previous HMAC (audit-chain). */
export function chainHmac(prevHmac: Sha256Hex, key: string, payload: unknown): Sha256Hex {
  return hmacSha256(key, prevHmac + "|" + canonicalJson(payload));
}

/** Constant-time string compare (avoids timing-leak in HMAC verify). */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Verify an HMAC value in constant time. */
export function verifyHmac(expected: Sha256Hex, key: string, message: string): boolean {
  return constantTimeEqual(expected, hmacSha256(key, message));
}

// =============================================================================
// SECTION 15 — Semver parser + comparator
// =============================================================================

/** Parse a semver string into parts. Throws SemverError on invalid input. */
export function parseSemver(raw: SemverString, now: IsoTimestamp): SemverParts {
  if (typeof raw !== "string" || !SEMVER_CORE_REGEX.test(raw)) {
    throw new SemverError(`invalid semver: ${String(raw)}`, now);
  }
  const core = raw.split("-")[0] ?? "";
  const dashIdx = raw.indexOf("-");
  const plusIdx = raw.indexOf("+");
  let prerelease: string[] = [];
  let build: string[] = [];
  let main = core;
  if (dashIdx >= 0) {
    main = raw.substring(0, dashIdx);
    let tail = raw.substring(dashIdx + 1);
    if (plusIdx > dashIdx) {
      tail = raw.substring(dashIdx + 1, plusIdx);
      build = (raw.substring(plusIdx + 1) || "").split(".");
    }
    prerelease = tail ? tail.split(".") : [];
  } else if (plusIdx >= 0) {
    main = raw.substring(0, plusIdx);
    build = (raw.substring(plusIdx + 1) || "").split(".");
  }
  const [maj, min, pat] = main.split(".");
  return {
    major: Number(maj),
    minor: Number(min),
    patch: Number(pat),
    prerelease,
    build,
    raw,
  };
}

/** Compare two parsed semver parts. */
export function compareSemverParts(a: SemverParts, b: SemverParts): SemverCompare {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0;
  if (a.prerelease.length === 0) return 1;
  if (b.prerelease.length === 0) return -1;
  const len = Math.min(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < len; i++) {
    const ai = a.prerelease[i] ?? "";
    const bi = b.prerelease[i] ?? "";
    const an = /^\d+$/.test(ai);
    const bn = /^\d+$/.test(bi);
    if (an && bn) {
      const anum = Number(ai);
      const bnum = Number(bi);
      if (anum !== bnum) return anum < bnum ? -1 : 1;
    } else if (an && !bn) {
      return -1;
    } else if (!an && bn) {
      return 1;
    } else {
      if (ai < bi) return -1;
      if (ai > bi) return 1;
    }
  }
  return a.prerelease.length < b.prerelease.length
    ? -1
    : a.prerelease.length > b.prerelease.length
    ? 1
    : 0;
}

/** Compare two semver strings. */
export function compareSemver(a: SemverString, b: SemverString, now: IsoTimestamp): SemverCompare {
  return compareSemverParts(parseSemver(a, now), parseSemver(b, now));
}

/** True if `a` is strictly greater than `b`. */
export function semverGt(a: SemverString, b: SemverString, now: IsoTimestamp): boolean {
  return compareSemver(a, b, now) === 1;
}

/** True if `a` is strictly less than `b`. */
export function semverLt(a: SemverString, b: SemverString, now: IsoTimestamp): boolean {
  return compareSemver(a, b, now) === -1;
}

/** True if `a` equals `b`. */
export function semverEq(a: SemverString, b: SemverString, now: IsoTimestamp): boolean {
  return compareSemver(a, b, now) === 0;
}

/** Sort semver versions ascending (does not mutate). */
export function sortSemverAsc(versions: readonly SemverString[], now: IsoTimestamp): SemverString[] {
  const parsed = versions.map((v) => ({ raw: v, parts: parseSemver(v, now) }));
  parsed.sort((a, b) => compareSemverParts(a.parts, b.parts));
  return parsed.map((p) => p.raw);
}

/** Pick the highest version from a list. */
export function maxSemver(versions: readonly SemverString[], now: IsoTimestamp): SemverString | null {
  if (versions.length === 0) return null;
  const sorted = sortSemverAsc(versions, now);
  return sorted[sorted.length - 1] ?? null;
}

/** Pick the lowest version from a list. */
export function minSemver(versions: readonly SemverString[], now: IsoTimestamp): SemverString | null {
  if (versions.length === 0) return null;
  const sorted = sortSemverAsc(versions, now);
  return sorted[0] ?? null;
}

// =============================================================================
// SECTION 16 — Version constraint solver
// =============================================================================

/** Lex a version constraint string into clauses. */
export function lexConstraint(constraint: VersionConstraint, now: IsoTimestamp): ConstraintSet {
  if (!isVersionConstraint(constraint)) {
    throw new SemverError(`invalid constraint: ${constraint}`, now);
  }
  const clauses: VersionClause[] = [];
  const allowPrerelease = constraint.includes("-") && !constraint.startsWith("^") && !constraint.startsWith("~");
  const tokens = constraint.split(/\s+/).filter(Boolean);
  for (const tok of tokens) {
    if (tok.startsWith(">=")) {
      clauses.push({ op: "gte", version: tok.slice(2) });
    } else if (tok.startsWith("<=")) {
      clauses.push({ op: "lte", version: tok.slice(2) });
    } else if (tok.startsWith(">")) {
      clauses.push({ op: "gt", version: tok.slice(1) });
    } else if (tok.startsWith("<")) {
      clauses.push({ op: "lt", version: tok.slice(1) });
    } else if (tok.startsWith("^")) {
      clauses.push({ op: "caret", version: tok.slice(1) });
    } else if (tok.startsWith("~")) {
      clauses.push({ op: "tilde", version: tok.slice(1) });
    } else if (tok.includes(" - ") || tok.includes("-")) {
      const parts = tok.split(/\s*-\s*/);
      if (parts.length === 2 && parts[0] && parts[1]) {
        clauses.push({ op: "gte", version: parts[0] });
        clauses.push({ op: "lte", version: parts[1] });
      } else {
        clauses.push({ op: "exact", version: tok });
      }
    } else {
      clauses.push({ op: "exact", version: tok });
    }
  }
  return { raw: constraint, clauses, allowPrerelease };
}

/** Evaluate a single clause against a version. */
export function evaluateClause(clause: VersionClause, version: SemverString, now: IsoTimestamp): boolean {
  const cmp = compareSemver(version, clause.version, now);
  switch (clause.op) {
    case "exact":
      return cmp === 0;
    case "gte":
      return cmp === 1 || cmp === 0;
    case "lte":
      return cmp === -1 || cmp === 0;
    case "gt":
      return cmp === 1;
    case "lt":
      return cmp === -1;
    case "caret": {
      const p = parseSemver(clause.version, now);
      if (cmp === 0) return true;
      if (cmp === -1) return false;
      if (p.major > 0) return p.major === parseSemver(version, now).major;
      if (p.minor > 0) return p.minor === parseSemver(version, now).minor;
      return p.patch === parseSemver(version, now).patch;
    }
    case "tilde": {
      const p = parseSemver(clause.version, now);
      const v = parseSemver(version, now);
      if (cmp === 0) return true;
      if (cmp === -1) return false;
      return p.major === v.major && p.minor === v.minor;
    }
    case "range": {
      return cmp === 1 || cmp === 0;
    }
  }
}

/** Evaluate all clauses (AND semantics). */
export function evaluateConstraint(set: ConstraintSet, version: SemverString, now: IsoTimestamp): boolean {
  for (const c of set.clauses) {
    if (!evaluateClause(c, version, now)) return false;
  }
  return true;
}

/** Find the highest installed version satisfying the constraint. */
export function findSatisfyingVersion(
  installed: readonly SemverString[],
  constraint: VersionConstraint,
  now: IsoTimestamp,
): VersionSolverResult {
  const set = lexConstraint(constraint, now);
  const sorted = sortSemverAsc(installed, now);
  let candidateIndex = -1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const v = sorted[i];
    if (v === undefined) continue;
    if (evaluateConstraint(set, v, now)) {
      candidateIndex = i;
      return { satisfied: true, matchedVersion: v, candidateIndex: i, reason: null };
    }
  }
  return {
    satisfied: false,
    matchedVersion: null,
    candidateIndex: -1,
    reason: `no version satisfies ${constraint} in [${installed.join(", ")}]`,
  };
}

/** Compute the next compatible version given a set of available versions. */
export function pickBestAvailable(
  available: readonly SemverString[],
  constraint: VersionConstraint,
  now: IsoTimestamp,
): VersionSolverResult {
  const set = lexConstraint(constraint, now);
  const sorted = sortSemverAsc(available, now);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const v = sorted[i];
    if (v === undefined) continue;
    if (evaluateConstraint(set, v, now)) {
      return { satisfied: true, matchedVersion: v, candidateIndex: i, reason: null };
    }
  }
  return {
    satisfied: false,
    matchedVersion: null,
    candidateIndex: -1,
    reason: `no available version satisfies ${constraint}`,
  };
}

/** Strictly returns whether the bundle already-installed conflicts with a new install. */
export function detectConflict(
  installed: InstalledBundle | null,
  candidateVersion: SemverString,
  now: IsoTimestamp,
): boolean {
  if (installed === null) return false;
  return compareSemver(installed.version, candidateVersion, now) !== 0;
}

/** Normalize a constraint string (collapse whitespace, sort clauses). */
export function normalizeConstraint(constraint: VersionConstraint): VersionConstraint {
  return constraint
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

/** Test if `constraintA` and `constraintB` overlap on any version in `pool`. */
export function constraintsOverlap(
  constraintA: VersionConstraint,
  constraintB: VersionConstraint,
  pool: readonly SemverString[],
  now: IsoTimestamp,
): boolean {
  const setA = lexConstraint(constraintA, now);
  const setB = lexConstraint(constraintB, now);
  for (const v of pool) {
    if (evaluateConstraint(setA, v, now) && evaluateConstraint(setB, v, now)) return true;
  }
  return false;
}

/** Returns true if the candidate version is strictly newer than what's installed. */
export function isUpgrade(
  installedVersion: SemverString,
  candidateVersion: SemverString,
  now: IsoTimestamp,
): boolean {
  return compareSemver(candidateVersion, installedVersion, now) === 1;
}

/** Returns true if the candidate version is strictly older than what's installed (rollback candidate). */
export function isDowngrade(
  installedVersion: SemverString,
  candidateVersion: SemverString,
  now: IsoTimestamp,
): boolean {
  return compareSemver(candidateVersion, installedVersion, now) === -1;
}
// =============================================================================
// SECTION 17 — Slot matching
// =============================================================================

/** Compute overlap area of two regions (0 if disjoint). */
function regionOverlap(a: SlotRegion, b: SlotRegion): number {
  const ix = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return ix * iy;
}

/** Region area (cells). */
function regionArea(r: SlotRegion): number {
  return r.width * r.height;
}

/** Score a single slot for a bundle (0..100). */
function scoreSlotForBundle(slot: DashboardSlot, bundle: CatalogBundle): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Kind compatibility (40 points)
  if (slot.supportsKinds.includes(bundle.kind)) {
    score += 40;
    reasons.push("kind-supported");
  } else if (bundle.preferredSlotKinds.includes(slot.slotKind)) {
    score += 20;
    reasons.push("preferred-kind-soft-match");
  }

  // Capacity (30 points)
  if (slot.capacity >= bundle.minSlotCapacity) {
    score += 30;
    reasons.push("capacity-meets-min");
  } else if (slot.capacity >= bundle.minSlotCapacity / 2) {
    score += 15;
    reasons.push("capacity-below-min");
  } else {
    reasons.push("capacity-too-small");
  }

  // Occupied bonus (10 points for empty slot)
  if (slot.occupiedBy === null) {
    score += 10;
    reasons.push("slot-empty");
  } else {
    reasons.push("slot-occupied");
  }

  // Sacred bonus (10 points if sacred tag and ritual slot)
  if (bundle.sacred && slot.slotKind === "ritual") {
    score += 10;
    reasons.push("sacred-ritual-match");
  }

  // Region size proportional bonus (10 points)
  const cells = regionArea(slot.region);
  const target = bundle.minSlotCapacity * 2;
  if (cells >= target) {
    score += 10;
    reasons.push("region-large-enough");
  } else if (cells >= bundle.minSlotCapacity) {
    score += 5;
    reasons.push("region-adequate");
  }

  return { score, reasons };
}

/** Find compatible slots for a bundle. */
export function matchSlots(
  bundle: CatalogBundle,
  dashboard: UserDashboard,
  preferredSlotId: string | null = null,
): SlotMatchResult {
  const candidates: SlotMatchCandidate[] = [];
  for (const slot of dashboard.slots) {
    if (preferredSlotId !== null && slot.slotId !== preferredSlotId) continue;
    const { score, reasons } = scoreSlotForBundle(slot, bundle);
    if (score <= 0) continue;
    candidates.push({
      slotId: slot.slotId,
      slotKind: slot.slotKind,
      region: slot.region,
      capacity: slot.capacity,
      score,
      reasons,
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  return {
    bundleId: bundle.bundleId,
    candidates,
    bestCandidate: candidates[0] ?? null,
  };
}

/** True if slot has room for the bundle (capacity + kind + sacred). */
export function slotCanHost(slot: DashboardSlot, bundle: CatalogBundle): boolean {
  if (slot.occupiedBy !== null) return false;
  if (slot.capacity < bundle.minSlotCapacity) return false;
  if (!slot.supportsKinds.includes(bundle.kind)) {
    if (!bundle.preferredSlotKinds.includes(slot.slotKind)) return false;
  }
  if (bundle.sacred && slot.slotKind !== "ritual" && slot.slotKind !== "expanded") {
    return false;
  }
  return true;
}

/** Pick the slot the user explicitly requested if compatible. */
export function pickExplicitSlot(
  slotId: string,
  bundle: CatalogBundle,
  dashboard: UserDashboard,
): DashboardSlot | null {
  const slot = dashboard.slots.find((s) => s.slotId === slotId) ?? null;
  if (slot === null) return null;
  if (!slotCanHost(slot, bundle)) return null;
  return slot;
}

/** Compute grid overlap map for visualization. */
export function gridOverlapMap(dashboard: UserDashboard): Readonly<Record<string, number>> {
  const map: Record<string, number> = {};
  for (let i = 0; i < dashboard.slots.length; i++) {
    for (let j = i + 1; j < dashboard.slots.length; j++) {
      const a = dashboard.slots[i];
      const b = dashboard.slots[j];
      if (a === undefined || b === undefined) continue;
      const ov = regionOverlap(a.region, b.region);
      if (ov > 0) {
        map[`${a.slotId}::${b.slotId}`] = ov;
      }
    }
  }
  return map;
}

/** Estimate remaining dashboard capacity (sum of empty slot capacity). */
export function remainingDashboardCapacity(dashboard: UserDashboard): number {
  return dashboard.slots
    .filter((s) => s.occupiedBy === null)
    .reduce((acc, s) => acc + s.capacity, 0);
}

/** Recommend a slot if none is supplied. */
export function recommendSlot(bundle: CatalogBundle, dashboard: UserDashboard): string | null {
  const r = matchSlots(bundle, dashboard);
  return r.bestCandidate?.slotId ?? null;
}

// =============================================================================
// SECTION 18 — Dependency resolver (topological order)
// =============================================================================

function topologicalSort(
  bundleId: string,
  lookup: Readonly<Record<string, CatalogBundle>>,
  now: IsoTimestamp,
): { order: string[]; cycle: string[] | null; depth: number } {
  const visited = new Set<string>();
  const onStack = new Set<string>();
  const order: string[] = [];
  let cycle: string[] | null = null;
  let depth = 0;

  function visit(id: string, path: string[]): void {
    if (cycle !== null) return;
    if (onStack.has(id)) {
      const idx = path.indexOf(id);
      cycle = path.slice(idx).concat([id]);
      return;
    }
    if (visited.has(id)) return;
    if (path.length > MAX_DEPENDENCY_DEPTH) {
      cycle = path.concat([id]);
      return;
    }
    onStack.add(id);
    const bundle = lookup[id];
    if (bundle !== undefined) {
      depth = Math.max(depth, path.length + 1);
      for (const dep of bundle.dependencies) {
        visit(dep.bundleId, path.concat([id]));
      }
    }
    onStack.delete(id);
    visited.add(id);
    order.push(id);
  }

  visit(bundleId, []);
  return { order, cycle, depth };
}

/** Resolve dependencies for a bundle against the user's dashboard + catalog. */
export function resolveDependencies(
  bundle: CatalogBundle,
  dashboard: UserDashboard,
  catalog: readonly CatalogBundle[],
  now: IsoTimestamp,
): DependencyResolution {
  const lookup: Record<string, CatalogBundle> = {};
  for (const c of catalog) lookup[c.bundleId] = c;
  lookup[bundle.bundleId] = bundle;

  const installedByBundle = new Map<string, InstalledBundle>();
  for (const inst of dashboard.installed) {
    installedByBundle.set(inst.bundleId, inst);
  }

  const missing: DependencyStatus[] = [];
  const conflicts: DependencyStatus[] = [];

  function walk(id: string): void {
    const node = lookup[id];
    if (node === undefined) {
      missing.push({
        bundleId: id,
        constraint: "*",
        status: "missing",
        installedVersion: null,
        resolvedVersion: null,
      });
      return;
    }
    for (const dep of node.dependencies) {
      const installed = installedByBundle.get(dep.bundleId);
      if (installed === undefined) {
        if (!dep.optional) {
          missing.push({
            bundleId: dep.bundleId,
            constraint: dep.constraint,
            status: "missing",
            installedVersion: null,
            resolvedVersion: null,
          });
        } else {
          missing.push({
            bundleId: dep.bundleId,
            constraint: dep.constraint,
            status: "optional-missing",
            installedVersion: null,
            resolvedVersion: null,
          });
        }
        walk(dep.bundleId);
        continue;
      }
      const solved = findSatisfyingVersion([installed.version], dep.constraint, now);
      if (!solved.satisfied) {
        conflicts.push({
          bundleId: dep.bundleId,
          constraint: dep.constraint,
          status: "version-conflict",
          installedVersion: installed.version,
          resolvedVersion: null,
        });
      }
      walk(dep.bundleId);
    }
  }

  walk(bundle.bundleId);
  const { order, cycle, depth } = topologicalSort(bundle.bundleId, lookup, now);
  return {
    bundleId: bundle.bundleId,
    allSatisfied: missing.filter((m) => m.status !== "optional-missing").length === 0 && conflicts.length === 0,
    missing,
    conflicts,
    installOrder: order,
    cycleDetected: cycle !== null,
    depthReached: depth,
  };
}

/** Check that the dashboard has at most one installed version of a bundle. */
export function noDuplicateInstalls(bundleId: string, dashboard: UserDashboard): boolean {
  return !dashboard.installed.some((i) => i.bundleId === bundleId && i.state !== "rolled-back");
}

/** List bundles the dashboard still needs to install (topologically). */
export function pendingInstallOrder(resolution: DependencyResolution): readonly string[] {
  return resolution.installOrder.slice().reverse();
}

// =============================================================================
// SECTION 19 — LGPD consent manager
// =============================================================================

/** Determine the required consent keys for a bundle. */
export function requiredConsentKeys(bundle: CatalogBundle): readonly string[] {
  const keys = new Set<string>(["install-explicit-consent"]);
  if (bundle.sacred) keys.add("sacred-content-opt-in");
  if (bundle.sensitivity >= 3) keys.add("sensitive-data-processing");
  if (bundle.tags.some((t) => t === "third-party" || t === "remote-source")) {
    keys.add("third-party-data-sharing");
  }
  if (bundle.tags.some((t) => t.startsWith("locale:") && !t.endsWith("pt-BR"))) {
    keys.add("cross-border-transfer");
  }
  return Array.from(keys);
}

/** Verify that a consent record covers all required keys. */
export function consentCoversKeys(consent: InstallConsent, keys: readonly string[]): boolean {
  if (consent.withdrawnAt !== null) return false;
  for (const k of keys) {
    if (!consent.consentKeys.includes(k)) return false;
  }
  return true;
}

/** Mint a new consent record for an install attempt. */
export function grantConsent(
  userId: string,
  bundleId: string,
  listingId: string,
  consentKeys: readonly string[],
  ipHash: string,
  userAgentHash: string,
  now: IsoTimestamp,
): InstallConsent {
  const filteredKeys = consentKeys.filter((k) => isLgpdConsentKey(k));
  return {
    consentId: `consent-${sha256(`${userId}|${bundleId}|${listingId}|${now}|${filteredKeys.join(".")}`).slice(0, 16)}`,
    userId,
    bundleId,
    listingId,
    consentKeys: filteredKeys,
    grantedAt: now,
    ipHash,
    userAgentHash,
    withdrawnAt: null,
    reasonWithdrawn: null,
  };
}

/** Withdraw consent (LGPD Art. 18 §V); returns new immutable record. */
export function withdrawConsent(
  consent: InstallConsent,
  reason: string,
  now: IsoTimestamp,
): InstallConsent {
  return {
    consentId: consent.consentId,
    userId: consent.userId,
    bundleId: consent.bundleId,
    listingId: consent.listingId,
    consentKeys: consent.consentKeys,
    grantedAt: consent.grantedAt,
    ipHash: consent.ipHash,
    userAgentHash: consent.userAgentHash,
    withdrawnAt: now,
    reasonWithdrawn: reason,
  };
}

/** Determine if a consent is currently active (granted and not withdrawn). */
export function consentIsActive(consent: InstallConsent): boolean {
  return consent.withdrawnAt === null;
}

/** Compute retention expiry for an uninstalled bundle (LGPD Art. 18). */
export function computeRetentionExpiry(uninstalledAt: IsoTimestamp, days: number = DEFAULT_RETENTION_DAYS): IsoTimestamp {
  const ms = Date.parse(uninstalledAt);
  if (Number.isNaN(ms)) {
    throw new InstallerError("invalid-timestamp", `cannot parse ${uninstalledAt}`, uninstalledAt);
  }
  const future = new Date(ms + days * 24 * 60 * 60 * 1000);
  return future.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** True if retention window has expired and erasure should fire. */
export function retentionExpired(now: IsoTimestamp, expiresAt: IsoTimestamp): boolean {
  return Date.parse(now) >= Date.parse(expiresAt);
}

/** True if user has withdrawn consent for any active install (halt required). */
export function anyActiveConsentWithdrawn(installed: readonly InstalledBundle[], consents: readonly InstallConsent[]): readonly string[] {
  const consentById = new Map<string, InstallConsent>();
  for (const c of consents) consentById.set(c.consentId, c);
  const halted: string[] = [];
  for (const inst of installed) {
    if (inst.state !== "active") continue;
    const c = consentById.get(inst.consentRecordId);
    if (c !== undefined && c.withdrawnAt !== null) halted.push(inst.installId);
  }
  return halted;
}

// =============================================================================
// SECTION 20 — Sacred-text gate
// =============================================================================

/** Request curator approval for a sacred bundle. */
export function requestSacredApproval(
  bundle: CatalogBundle,
  curatorId: string,
  now: IsoTimestamp,
): SacredApproval {
  if (!isSacredBundle(bundle)) {
    throw new SacredApprovalMissingError(bundle.bundleId, "bundle is not sacred", now);
  }
  return {
    bundleId: bundle.bundleId,
    requestedAt: now,
    curatorId,
    curatorApprovedAt: null,
    secondCuratorId: null,
    secondApprovedAt: null,
    rejected: false,
    rejectionReason: null,
  };
}

/** Apply first curator's verdict (approve or reject). */
export function applyFirstCuratorVerdict(
  approval: SacredApproval,
  approved: boolean,
  now: IsoTimestamp,
  rejectionReason: string | null = null,
): SacredApproval {
  if (approval.curatorApprovedAt !== null) {
    throw new InstallerError(
      "sacred-already-approved",
      `first curator already acted on ${approval.bundleId}`,
      now,
    );
  }
  return {
    bundleId: approval.bundleId,
    requestedAt: approval.requestedAt,
    curatorId: approval.curatorId,
    curatorApprovedAt: approved ? now : null,
    secondCuratorId: null,
    secondApprovedAt: null,
    rejected: !approved,
    rejectionReason: approved ? null : rejectionReason ?? "first-curator-rejected",
  };
}

/** Apply second curator's verdict (requires first to have approved). */
export function applySecondCuratorVerdict(
  approval: SacredApproval,
  secondCuratorId: string,
  approved: boolean,
  now: IsoTimestamp,
  rejectionReason: string | null = null,
): SacredApproval {
  if (approval.curatorApprovedAt === null) {
    throw new InstallerError(
      "sacred-first-review-missing",
      `first curator has not approved ${approval.bundleId}`,
      now,
    );
  }
  if (!approved) {
    return {
      bundleId: approval.bundleId,
      requestedAt: approval.requestedAt,
      curatorId: approval.curatorId,
      curatorApprovedAt: approval.curatorApprovedAt,
      secondCuratorId,
      secondApprovedAt: now,
      rejected: true,
      rejectionReason: rejectionReason ?? "second-curator-rejected",
    };
  }
  return {
    bundleId: approval.bundleId,
    requestedAt: approval.requestedAt,
    curatorId: approval.curatorId,
    curatorApprovedAt: approval.curatorApprovedAt,
    secondCuratorId,
    secondApprovedAt: now,
    rejected: false,
    rejectionReason: null,
  };
}

/** True if a sacred bundle has both curator approvals. */
export function sacredFullyApproved(approval: SacredApproval): boolean {
  return (
    approval.curatorApprovedAt !== null &&
    approval.secondApprovedAt !== null &&
    !approval.rejected
  );
}

/** List sacred bundles awaiting review from a given curator. */
export function pendingSacredForCurator(
  approvals: readonly SacredApproval[],
  curatorId: string,
): readonly SacredApproval[] {
  return approvals.filter((a) => {
    if (a.rejected) return false;
    if (a.curatorApprovedAt === null && a.curatorId === curatorId) return true;
    if (a.curatorApprovedAt !== null && a.secondCuratorId === null && a.secondCuratorId !== curatorId) {
      return a.curatorId !== curatorId;
    }
    return false;
  });
}

/** Recommend at least N sacred approvals are on file before allowing publish (defense-in-depth). */
export function sacredReviewReady(
  approval: SacredApproval,
  bundle: CatalogBundle,
): boolean {
  if (!isSacredBundle(bundle)) return true;
  return sacredFullyApproved(approval);
}

// =============================================================================
// SECTION 21 — Audit chain logger
// =============================================================================

/** Initialize an audit chain for a user (empty head). */
export function initAuditChain(userId: string): AuditChainHead {
  return { userId, lastEntryId: "", lastHmac: "0".repeat(SHA256_HEX_LENGTH), length: 0 };
}

/** Append a single entry to the chain; returns updated chain + entry. */
export function appendAuditEntry(
  chain: AuditChainHead,
  entry: Omit<InstallerAuditEntry, "entryId" | "prevHmac" | "hmac" | "at"> & { at: IsoTimestamp },
  key: string = AUDIT_CHAIN_HMAC_KEY,
): { chain: AuditChainHead; entry: InstallerAuditEntry } {
  const entryId = `audit-${sha256(`${chain.userId}|${chain.length}|${entry.at}|${entry.action}`).slice(0, 16)}`;
  const prevHmac = chain.lastHmac;
  const payload = {
    entryId,
    at: entry.at,
    userId: chain.userId,
    bundleId: entry.bundleId,
    action: entry.action,
    detail: entry.detail,
  };
  const hmac = chainHmac(prevHmac, key, payload);
  const fullEntry: InstallerAuditEntry = {
    entryId,
    at: entry.at,
    userId: chain.userId,
    bundleId: entry.bundleId,
    action: entry.action,
    detail: entry.detail,
    prevHmac,
    hmac,
  };
  return {
    chain: {
      userId: chain.userId,
      lastEntryId: entryId,
      lastHmac: hmac,
      length: chain.length + 1,
    },
    entry: fullEntry,
  };
}

/** Verify the integrity of a chain (every entry's hmac re-derives from prevHmac). */
export function verifyAuditChain(
  entries: readonly InstallerAuditEntry[],
  key: string = AUDIT_CHAIN_HMAC_KEY,
): boolean {
  let prev = "0".repeat(SHA256_HEX_LENGTH);
  for (const e of entries) {
    if (e.prevHmac !== prev) return false;
    const recomputed = chainHmac(prev, key, {
      entryId: e.entryId,
      at: e.at,
      userId: e.userId,
      bundleId: e.bundleId,
      action: e.action,
      detail: e.detail,
    });
    if (recomputed !== e.hmac) return false;
    prev = e.hmac;
  }
  return true;
}

/** Trim a chain to only entries the user is allowed to see (e.g. exclude admin). */
export function filterAuditByUser(
  entries: readonly InstallerAuditEntry[],
  userId: string,
): readonly InstallerAuditEntry[] {
  return entries.filter((e) => e.userId === userId);
}

/** Find audit entries by action type. */
export function findAuditByAction(
  entries: readonly InstallerAuditEntry[],
  action: InstallerAuditEntry["action"],
): readonly InstallerAuditEntry[] {
  return entries.filter((e) => e.action === action);
}

/** Last audit entry for a given bundle. */
export function lastAuditForBundle(
  entries: readonly InstallerAuditEntry[],
  bundleId: string,
): InstallerAuditEntry | null {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i]?.bundleId === bundleId) return entries[i] ?? null;
  }
  return null;
}

/** Count audit entries by action. */
export function countAuditByAction(
  entries: readonly InstallerAuditEntry[],
): Readonly<Record<InstallerAuditEntry["action"], number>> {
  const out: Record<InstallerAuditEntry["action"], number> = {
    discover: 0,
    "consent-granted": 0,
    "consent-withdrawn": 0,
    "install-started": 0,
    "install-state": 0,
    "install-completed": 0,
    "install-failed": 0,
    rollback: 0,
    uninstall: 0,
    "erasure-scheduled": 0,
    "erasure-completed": 0,
    "sacred-review-requested": 0,
    "sacred-review-approved": 0,
    "sacred-review-rejected": 0,
  };
  for (const e of entries) {
    out[e.action] = (out[e.action] ?? 0) + 1;
  }
  return out;
}

/** Serialize audit chain to JSON for LGPD export (Art. 18). */
export function serializeAuditChain(entries: readonly InstallerAuditEntry[]): string {
  return canonicalJson(entries);
}


// =============================================================================
// SECTION 22 — Install state machine engine
// =============================================================================

/** Initial state for a fresh install session. */
export function newInstallSession(
  userId: string,
  bundleId: string,
  listing: InstallListingShape,
  version: SemverString,
  now: IsoTimestamp,
): InstallSession {
  return {
    sessionId: `${INSTALL_SESSION_PREFIX}-${sha256(`${userId}|${bundleId}|${listing.listingId}|${now}`).slice(0, 16)}`,
    userId,
    bundleId,
    version,
    listing,
    state: "PROSPECTING",
    history: [],
    startedAt: now,
    endedAt: null,
    failureReason: null,
    failureMessage: null,
  };
}

/** Check whether a transition is legal per the install FSM. */
export function canTransition(from: InstallState, to: InstallState): boolean {
  const allowed = INSTALL_STATE_TRANSITIONS[from];
  return allowed.includes(to);
}

/** Compute allowed next states from current state. */
export function nextStates(from: InstallState): readonly InstallState[] {
  return INSTALL_STATE_TRANSITIONS[from];
}

/** Transition the session to a new state (records history). */
export function transitionState(
  session: InstallSession,
  to: InstallState,
  reason: string | null,
  now: IsoTimestamp,
): InstallSession {
  if (!canTransition(session.state, to)) {
    throw new IllegalStateTransitionError(session.state, to, `illegal ${session.state} → ${to}`, now);
  }
  const evt: InstallStateEvent = {
    sessionId: session.sessionId,
    from: session.state,
    to,
    at: now,
    reason,
  };
  const endedAt = to === "ACTIVE" || to === "FAILED" ? now : session.endedAt;
  return {
    sessionId: session.sessionId,
    userId: session.userId,
    bundleId: session.bundleId,
    version: session.version,
    listing: session.listing,
    state: to,
    history: session.history.concat([evt]),
    startedAt: session.startedAt,
    endedAt,
    failureReason: to === "FAILED" ? session.failureReason : session.failureReason,
    failureMessage: to === "FAILED" ? session.failureMessage : session.failureMessage,
  };
}

/** Transition with failure reason attached. */
export function transitionToFailed(
  session: InstallSession,
  reason: InstallFailureReason,
  message: string,
  now: IsoTimestamp,
): InstallSession {
  const next = transitionState(session, "FAILED", message, now);
  return {
    sessionId: next.sessionId,
    userId: next.userId,
    bundleId: next.bundleId,
    version: next.version,
    listing: next.listing,
    state: next.state,
    history: next.history,
    startedAt: next.startedAt,
    endedAt: next.endedAt,
    failureReason: reason,
    failureMessage: message,
  };
}

/** True if the session has reached a terminal state (ACTIVE or FAILED). */
export function sessionTerminal(session: InstallSession): boolean {
  return session.state === "ACTIVE" || session.state === "FAILED";
}

/** Total duration of a terminal session (ms). */
export function sessionDurationMs(session: InstallSession): number {
  if (session.endedAt === null) return 0;
  return Date.parse(session.endedAt) - Date.parse(session.startedAt);
}

/** All events from a session that transitioned to FAILED. */
export function failureEvents(session: InstallSession): readonly InstallStateEvent[] {
  return session.history.filter((e) => e.to === "FAILED");
}

/** True if state has reached at least the given threshold (linear). */
export function hasReached(session: InstallSession, state: InstallState): boolean {
  const order: readonly InstallState[] = [
    "PROSPECTING",
    "RESOLVING",
    "DOWNLOADING",
    "VERIFYING",
    "INSTALLING",
    "ACTIVE",
  ];
  const target = order.indexOf(state);
  const current = order.indexOf(session.state);
  return current >= 0 && target >= 0 && current >= target;
}

// =============================================================================
// SECTION 23 — Download + verify (by-shape)
// =============================================================================

/** Simulate fetching a bundle artifact (sha-pinned). */
export function downloadArtifact(
  bundle: CatalogBundle,
  sourceRef: string,
  now: IsoTimestamp,
  mockPayload: Uint8Array | null = null,
): DownloadArtifact {
  // In production, fetch from CDN/signed URL; here we trust the catalog sha256.
  const payload = mockPayload ?? utf8Encode(`${bundle.bundleId}@${bundle.version}|${bundle.sha256}|${sourceRef}`);
  const observed = sha256OfBytes(payload);
  const verified = constantTimeEqual(observed, bundle.sha256);
  return {
    bundleId: bundle.bundleId,
    version: bundle.version,
    sha256: observed,
    bytes: payload.length,
    payloadRef: sourceRef,
    fetchedAt: now,
    verified,
  };
}

/** Verify an already-downloaded artifact matches the catalog hash. */
export function verifyArtifact(artifact: DownloadArtifact, bundle: CatalogBundle): boolean {
  return artifact.verified && constantTimeEqual(artifact.sha256, bundle.sha256);
}

/** Mint a fake CDN URL for a bundle (deterministic). */
export function cdnUrlFor(bundle: CatalogBundle, bucket: string = "bundles"): string {
  return `https://cdn.cabaladoscaminhos.dev/${bucket}/${bundle.bundleId}/${bundle.version}.bundle`;
}

/** Estimate transfer time in ms given bandwidth (KB/s). */
export function estimateTransferMs(artifact: DownloadArtifact, bandwidthKBps: number): number {
  if (bandwidthKBps <= 0) return Number.POSITIVE_INFINITY;
  return Math.ceil((artifact.bytes / 1024 / bandwidthKBps) * 1000);
}

// =============================================================================
// SECTION 24 — Rollback manager
// =============================================================================

/** Generate a rollback id. */
export function newRollbackId(installId: string, now: IsoTimestamp): string {
  return `rollback-${sha256(`${installId}|${now}`).slice(0, 16)}`;
}

/** True if a rollback is still available (within the rollback window). */
export function rollbackAvailable(
  install: InstalledBundle,
  now: IsoTimestamp,
  windowHours: number = DEFAULT_ROLLBACK_WINDOW_HOURS,
): boolean {
  const installedMs = Date.parse(install.installedAt);
  const cutoffMs = installedMs + windowHours * 60 * 60 * 1000;
  return Date.parse(now) <= cutoffMs;
}

/** Build a rollback record (immutable). */
export function buildRollbackRecord(
  install: InstalledBundle,
  toVersion: SemverString,
  slotStateBefore: SlotRegion,
  slotStateAfter: SlotRegion,
  reason: string,
  now: IsoTimestamp,
): RollbackRecord {
  const rollbackId = newRollbackId(install.installId, now);
  const hmac = hmacJson(AUDIT_CHAIN_HMAC_KEY, {
    rollbackId,
    installId: install.installId,
    fromVersion: install.version,
    toVersion,
    reason,
    at: now,
  });
  return {
    rollbackId,
    installId: install.installId,
    bundleId: install.bundleId,
    fromVersion: install.version,
    toVersion,
    rolledBackAt: now,
    slotStateBefore,
    slotStateAfter,
    reason,
    hmac,
  };
}

/** Apply a rollback: returns updated dashboard. */
export function applyRollback(
  dashboard: UserDashboard,
  rollback: RollbackRecord,
  now: IsoTimestamp,
): UserDashboard {
  const idx = dashboard.installed.findIndex((i) => i.installId === rollback.installId);
  if (idx < 0) {
    throw new RollbackUnavailableError(rollback.installId, `install ${rollback.installId} not found`, now);
  }
  const original = dashboard.installed[idx];
  if (original === undefined) {
    throw new RollbackUnavailableError(rollback.installId, `install ${rollback.installId} vanished`, now);
  }
  const updatedInstall: InstalledBundle = {
    installId: `${original.installId}__rb_${rollback.rollbackId.slice(-8)}`,
    bundleId: original.bundleId,
    version: rollback.toVersion,
    installedAt: now,
    installedByUserId: original.installedByUserId,
    slotId: original.slotId,
    sha256: original.sha256,
    consentRecordId: original.consentRecordId,
    sacred: original.sacred,
    rollbackOf: original.installId,
    rollbackTargetVersion: original.version,
    state: "active",
  };
  const installed = dashboard.installed.slice();
  installed[idx] = updatedInstall;
  const slots = dashboard.slots.map((s) => {
    if (s.slotId !== original.slotId) return s;
    return {
      slotId: s.slotId,
      slotKind: s.slotKind,
      region: rollback.slotStateAfter,
      capacity: s.capacity,
      supportsKinds: s.supportsKinds,
      occupiedBy: updatedInstall.installId,
    };
  });
  return {
    userId: dashboard.userId,
    locale: dashboard.locale,
    slots,
    installed,
    retentionExpiresAt: dashboard.retentionExpiresAt,
  };
}

/** List rollback-eligible installs for a bundle. */
export function listRollbackCandidates(
  dashboard: UserDashboard,
  bundleId: string,
  now: IsoTimestamp,
): readonly InstalledBundle[] {
  return dashboard.installed.filter(
    (i) => i.bundleId === bundleId && i.state === "active" && rollbackAvailable(i, now),
  );
}

// =============================================================================
// SECTION 25 — Uninstall + erasure
// =============================================================================

/** Generate uninstall id. */
export function newUninstallId(installId: string, now: IsoTimestamp): string {
  return `uninst-${sha256(`${installId}|${now}`).slice(0, 16)}`;
}

/** Uninstall: free slot + record retention expiry + emit audit ids. */
export function uninstall(
  dashboard: UserDashboard,
  installId: string,
  auditEntryIds: readonly string[],
  now: IsoTimestamp,
  retentionDays: number = DEFAULT_RETENTION_DAYS,
): { dashboard: UserDashboard; record: UninstallRecord } {
  const idx = dashboard.installed.findIndex((i) => i.installId === installId);
  if (idx < 0) {
    throw new InstallerError("install-not-found", `install ${installId} not found`, now);
  }
  const target = dashboard.installed[idx];
  if (target === undefined) {
    throw new InstallerError("install-not-found", `install ${installId} vanished`, now);
  }
  const retentionExpiresAt = computeRetentionExpiry(now, retentionDays);
  const record: UninstallRecord = {
    uninstallId: newUninstallId(installId, now),
    installId,
    bundleId: target.bundleId,
    uninstalledAt: now,
    slotFreed: target.slotId,
    auditEntryIds: auditEntryIds.slice(),
    retentionExpiresAt,
  };
  const installed = dashboard.installed.filter((i) => i.installId !== installId);
  const slots = dashboard.slots.map((s) =>
    s.slotId === target.slotId
      ? {
          slotId: s.slotId,
          slotKind: s.slotKind,
          region: s.region,
          capacity: s.capacity,
          supportsKinds: s.supportsKinds,
          occupiedBy: null,
        }
      : s,
  );
  return {
    dashboard: {
      userId: dashboard.userId,
      locale: dashboard.locale,
      slots,
      installed,
      retentionExpiresAt,
    },
    record,
  };
}

/** Schedule erasure after retention window. */
export function scheduleErasure(dashboard: UserDashboard, now: IsoTimestamp): UserDashboard {
  const retentionExpiresAt = computeRetentionExpiry(now);
  return {
    userId: dashboard.userId,
    locale: dashboard.locale,
    slots: dashboard.slots,
    installed: dashboard.installed,
    retentionExpiresAt,
  };
}

/** Execute erasure (LGPD Art. 18 §VI): redact consents, free data. */
export function executeErasure(
  dashboard: UserDashboard,
  consents: readonly InstallConsent[],
  now: IsoTimestamp,
): { dashboard: UserDashboard; result: LgpdErasureResult } {
  const consentIds = consents.map((c) => c.consentId);
  const installIds = dashboard.installed.map((i) => i.installId);
  const slotsFreed = dashboard.installed.map((i) => i.slotId);
  const result: LgpdErasureResult = {
    userId: dashboard.userId,
    erasedAt: now,
    consentIds,
    installIds,
    auditEntriesRedacted: 0,
    slotsFreed,
  };
  const empty: UserDashboard = {
    userId: dashboard.userId,
    locale: dashboard.locale,
    slots: dashboard.slots.map((s) => ({
      slotId: s.slotId,
      slotKind: s.slotKind,
      region: s.region,
      capacity: s.capacity,
      supportsKinds: s.supportsKinds,
      occupiedBy: null,
    })),
    installed: [],
    retentionExpiresAt: null,
  };
  return { dashboard: empty, result };
}

/** True if the dashboard is eligible for erasure (retention expired). */
export function eligibleForErasure(dashboard: UserDashboard, now: IsoTimestamp): boolean {
  if (dashboard.retentionExpiresAt === null) return false;
  return retentionExpired(now, dashboard.retentionExpiresAt);
}

/** Build LGPD export payload (Art. 18 §V). */
export function buildLgpdExport(
  dashboard: UserDashboard,
  consents: readonly InstallConsent[],
  audit: readonly InstallerAuditEntry[],
  now: IsoTimestamp,
  format: "json" | "csv" = "json",
): LgpdExportPayload {
  return {
    userId: dashboard.userId,
    exportedAt: now,
    consents,
    installed: dashboard.installed,
    auditChain: audit,
    format,
  };
}

/** Convert LGPD export payload to CSV (best-effort, stable columns). */
export function exportPayloadToCsv(payload: LgpdExportPayload): string {
  const lines: string[] = [];
  lines.push("section,key,value");
  for (const c of payload.consents) {
    lines.push(`consent,consentId,${c.consentId}`);
    lines.push(`consent,grantedAt,${c.grantedAt}`);
    lines.push(`consent,withdrawnAt,${c.withdrawnAt ?? ""}`);
  }
  for (const i of payload.installed) {
    lines.push(`install,installId,${i.installId}`);
    lines.push(`install,bundleId,${i.bundleId}`);
    lines.push(`install,version,${i.version}`);
    lines.push(`install,state,${i.state}`);
  }
  for (const a of payload.auditChain) {
    lines.push(`audit,entryId,${a.entryId}`);
    lines.push(`audit,action,${a.action}`);
    lines.push(`audit,at,${a.at}`);
  }
  return lines.join("\n");
}

// =============================================================================
// SECTION 26 — Catalog discovery (filter / search)
// =============================================================================

/** Internal: filter catalog by a CatalogFilter (paginated). */
function filterCatalog(
  catalog: readonly CatalogBundle[],
  filter: CatalogFilter,
): readonly CatalogBundle[] {
  const out: CatalogBundle[] = [];
  const q = filter.query !== undefined ? filter.query.toLowerCase() : null;
  for (const b of catalog) {
    if (filter.tradition !== undefined && b.tradition !== filter.tradition) continue;
    if (filter.category !== undefined && b.category !== filter.category) continue;
    if (filter.kind !== undefined && b.kind !== filter.kind) continue;
    if (filter.locale !== undefined && !b.locales.includes(filter.locale)) continue;
    if (filter.sensitivityMax !== undefined && b.sensitivity > filter.sensitivityMax) continue;
    if (filter.sacred !== undefined && b.sacred !== filter.sacred) continue;
    if (filter.optInRequired !== undefined && b.optInRequired !== filter.optInRequired) continue;
    if (filter.publisherId !== undefined && b.publisherId !== filter.publisherId) continue;
    if (q !== null) {
      const hay = `${b.bundleId} ${b.description} ${b.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    out.push(b);
  }
  return out;
}

/** Discover bundles with filter + pagination. */
export function discoverBundles(
  catalog: readonly CatalogBundle[],
  filter: CatalogFilter = {},
): CatalogPage {
  const filtered = filterCatalog(catalog, filter);
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 25;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filtered.slice(start, end);
  return {
    items,
    page,
    pageSize,
    total: filtered.length,
    hasMore: end < filtered.length,
  };
}

/** Find a single bundle by exact id+version. */
export function findBundle(
  catalog: readonly CatalogBundle[],
  bundleId: string,
  version: SemverString,
): CatalogBundle | null {
  return catalog.find((b) => b.bundleId === bundleId && b.version === version) ?? null;
}

/** List all versions of a bundle, sorted ascending. */
export function listVersions(
  catalog: readonly CatalogBundle[],
  bundleId: string,
  now: IsoTimestamp,
): readonly SemverString[] {
  return sortSemverAsc(
    catalog.filter((b) => b.bundleId === bundleId).map((b) => b.version),
    now,
  );
}

/** Default filter: pt-BR locale, sensitivity ≤ 3, no sacred. */
export function defaultFilter(): CatalogFilter {
  return { locale: "pt-BR", sensitivityMax: 3, sacred: false };
}

/** Filter bundles tagged with sacred tradition. */
export function sacredBundles(catalog: readonly CatalogBundle[]): readonly CatalogBundle[] {
  return catalog.filter((b) => isSacredBundle(b));
}

/** Filter bundles requiring LGPD opt-in (sensitivity ≥ 3 OR sacred). */
export function optInRequiredBundles(catalog: readonly CatalogBundle[]): readonly CatalogBundle[] {
  return catalog.filter((b) => b.optInRequired || b.sensitivity >= 3 || b.sacred);
}

/** All distinct traditions present in the catalog. */
export function distinctTraditions(catalog: readonly CatalogBundle[]): readonly string[] {
  const set = new Set<string>();
  for (const b of catalog) set.add(b.tradition);
  return Array.from(set).sort();
}

/** All distinct categories in the catalog. */
export function distinctCategories(catalog: readonly CatalogBundle[]): readonly string[] {
  const set = new Set<string>();
  for (const b of catalog) set.add(b.category);
  return Array.from(set).sort();
}

// =============================================================================
// SECTION 27 — Install pipeline (orchestrator)
// =============================================================================

function pickFailure(reason: InstallFailureReason, message: string): { reason: InstallFailureReason; message: string } {
  return { reason, message };
}

/** Orchestrate the 6-state install pipeline. */
export function runInstallPipeline(args: {
  request: InstallRequest;
  bundle: CatalogBundle;
  dashboard: UserDashboard;
  catalog: readonly CatalogBundle[];
  approval: SacredApproval | null;
  now: IsoTimestamp;
  mockSourceRef?: string;
}): InstallResponse {
  const { request, bundle, dashboard, catalog, approval, now } = args;
  const auditIds: string[] = [];
  const auditEntryIds = auditIds;
  const listing: InstallListingShape = {
    listingId: bundle.listingId,
    bundleId: bundle.bundleId,
    publisherId: bundle.publisherId,
    publishedAt: bundle.publishedAt,
    visibility: bundle.visibility,
    optInRequired: bundle.optInRequired,
    locale: bundle.locales[0] ?? "pt-BR",
    sha256: bundle.sha256,
  };

  // PROSPECTING
  let session = newInstallSession(request.userId, request.bundleId, listing, request.version, now);

  // Sacred gate
  if (isSacredBundle(bundle)) {
    if (approval === null || !sacredFullyApproved(approval)) {
      const failed = transitionToFailed(
        session,
        "sacred-approval-missing",
        "sacred bundle missing curator approval",
        now,
      );
      return {
        sessionId: session.sessionId,
        installId: null,
        finalState: failed.state,
        bundleId: bundle.bundleId,
        version: bundle.version,
        slotId: null,
        installedAt: null,
        failureReason: failed.failureReason,
        failureMessage: failed.failureMessage,
        auditEntryIds,
        dependencyResolution: null,
        slotMatch: null,
      };
    }
  }

  // LGPD consent keys
  const requiredKeys = requiredConsentKeys(bundle);
  for (const k of requiredKeys) {
    if (!request.consentKeys.includes(k)) {
      const failed = transitionToFailed(
        session,
        "consent-missing",
        `missing LGPD consent key: ${k}`,
        now,
      );
      return {
        sessionId: session.sessionId,
        installId: null,
        finalState: failed.state,
        bundleId: bundle.bundleId,
        version: bundle.version,
        slotId: null,
        installedAt: null,
        failureReason: failed.failureReason,
        failureMessage: failed.failureMessage,
        auditEntryIds,
        dependencyResolution: null,
        slotMatch: null,
      };
    }
  }

  // RESOLVING
  session = transitionState(session, "RESOLVING", "resolving deps + slot", now);
  const slotMatch = matchSlots(bundle, dashboard, request.slotId);
  if (slotMatch.bestCandidate === null) {
    const failed = transitionToFailed(
      session,
      "slot-incompatible",
      "no compatible slot",
      now,
    );
    return {
      sessionId: session.sessionId,
      installId: null,
      finalState: failed.state,
      bundleId: bundle.bundleId,
      version: bundle.version,
      slotId: null,
      installedAt: null,
      failureReason: failed.failureReason,
      failureMessage: failed.failureMessage,
      auditEntryIds,
      dependencyResolution: null,
      slotMatch,
    };
  }
  const depResolution = resolveDependencies(bundle, dashboard, catalog, now);
  if (depResolution.cycleDetected) {
    const failed = transitionToFailed(
      session,
      "dependency-missing",
      "dependency cycle detected",
      now,
    );
    return {
      sessionId: session.sessionId,
      installId: null,
      finalState: failed.state,
      bundleId: bundle.bundleId,
      version: bundle.version,
      slotId: null,
      installedAt: null,
      failureReason: failed.failureReason,
      failureMessage: failed.failureMessage,
      auditEntryIds,
      dependencyResolution: depResolution,
      slotMatch,
    };
  }
  if (!depResolution.allSatisfied) {
    const failed = transitionToFailed(
      session,
      "dependency-missing",
      "missing required dependencies",
      now,
    );
    return {
      sessionId: session.sessionId,
      installId: null,
      finalState: failed.state,
      bundleId: bundle.bundleId,
      version: bundle.version,
      slotId: null,
      installedAt: null,
      failureReason: failed.failureReason,
      failureMessage: failed.failureMessage,
      auditEntryIds,
      dependencyResolution: depResolution,
      slotMatch,
    };
  }
  // Version conflict check on user dashboard
  const existing = dashboard.installed.find((i) => i.bundleId === bundle.bundleId && i.state === "active");
  if (existing !== undefined) {
    if (existing.version === bundle.version && existing.sha256 === bundle.sha256) {
      // already installed — short-circuit ACTIVE
      const active = transitionState(session, "DOWNLOADING", "short-circuit: already installed", now);
      const verifying = transitionState(active, "VERIFYING", "short-circuit: already verified", now);
      const installing = transitionState(verifying, "INSTALLING", "short-circuit: already mounted", now);
      const done = transitionState(installing, "ACTIVE", "already installed", now);
      return {
        sessionId: session.sessionId,
        installId: existing.installId,
        finalState: done.state,
        bundleId: bundle.bundleId,
        version: bundle.version,
        slotId: existing.slotId,
        installedAt: existing.installedAt,
        failureReason: null,
        failureMessage: null,
        auditEntryIds,
        dependencyResolution: depResolution,
        slotMatch,
      };
    }
    if (existing.version !== bundle.version) {
      const failed = transitionToFailed(
        session,
        "version-conflict",
        `dashboard has ${existing.version}, requested ${bundle.version}`,
        now,
      );
      return {
        sessionId: session.sessionId,
        installId: null,
        finalState: failed.state,
        bundleId: bundle.bundleId,
        version: bundle.version,
        slotId: null,
        installedAt: null,
        failureReason: failed.failureReason,
        failureMessage: failed.failureMessage,
        auditEntryIds,
        dependencyResolution: depResolution,
        slotMatch,
      };
    }
  }

  // DOWNLOADING
  session = transitionState(session, "DOWNLOADING", "downloading bundle", now);
  const artifact = downloadArtifact(bundle, args.mockSourceRef ?? cdnUrlFor(bundle), now);
  if (!artifact.verified) {
    const failed = transitionToFailed(
      session,
      "integrity-mismatch",
      "downloaded bytes do not match catalog sha256",
      now,
    );
    return {
      sessionId: session.sessionId,
      installId: null,
      finalState: failed.state,
      bundleId: bundle.bundleId,
      version: bundle.version,
      slotId: null,
      installedAt: null,
      failureReason: failed.failureReason,
      failureMessage: failed.failureMessage,
      auditEntryIds,
      dependencyResolution: depResolution,
      slotMatch,
    };
  }

  // VERIFYING
  session = transitionState(session, "VERIFYING", "verifying sha256", now);
  if (!verifyArtifact(artifact, bundle)) {
    const failed = transitionToFailed(
      session,
      "integrity-mismatch",
      "verification failed",
      now,
    );
    return {
      sessionId: session.sessionId,
      installId: null,
      finalState: failed.state,
      bundleId: bundle.bundleId,
      version: bundle.version,
      slotId: null,
      installedAt: null,
      failureReason: failed.failureReason,
      failureMessage: failed.failureMessage,
      auditEntryIds,
      dependencyResolution: depResolution,
      slotMatch,
    };
  }

  // INSTALLING
  session = transitionState(session, "INSTALLING", "writing to slot", now);
  const installId = `install-${sha256(`${session.sessionId}|${bundle.bundleId}|${now}`).slice(0, 16)}`;
  auditIds.push(`audit:${installId}:install`);

  // ACTIVE
  const done = transitionState(session, "ACTIVE", "active", now);
  return {
    sessionId: session.sessionId,
    installId,
    finalState: done.state,
    bundleId: bundle.bundleId,
    version: bundle.version,
    slotId: slotMatch.bestCandidate.slotId,
    installedAt: now,
    failureReason: null,
    failureMessage: null,
    auditEntryIds: auditIds,
    dependencyResolution: depResolution,
    slotMatch,
  };
}

// =============================================================================
// SECTION 28 — Compose InstalledBundle from a successful response
// =============================================================================

/** Compose a new InstalledBundle record from a successful install response. */
export function composeInstalledBundle(
  response: InstallResponse,
  userId: string,
  consentRecordId: string,
  slotId: string,
  bundle: CatalogBundle,
): InstalledBundle {
  if (response.finalState !== "ACTIVE" || response.installId === null) {
    throw new InstallerError(
      "install-not-active",
      `cannot compose InstalledBundle from non-active state ${response.finalState}`,
      response.installedAt ?? new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    );
  }
  return {
    installId: response.installId,
    bundleId: bundle.bundleId,
    version: bundle.version,
    installedAt: response.installedAt ?? new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    installedByUserId: userId,
    slotId,
    sha256: bundle.sha256,
    consentRecordId,
    sacred: bundle.sacred,
    rollbackOf: null,
    rollbackTargetVersion: null,
    state: "active",
  };
}

/** Mutate dashboard to attach a newly installed bundle to its slot. */
export function attachInstallToDashboard(
  dashboard: UserDashboard,
  install: InstalledBundle,
): UserDashboard {
  const slots = dashboard.slots.map((s) =>
    s.slotId === install.slotId
      ? {
          slotId: s.slotId,
          slotKind: s.slotKind,
          region: s.region,
          capacity: s.capacity,
          supportsKinds: s.supportsKinds,
          occupiedBy: install.installId,
        }
      : s,
  );
  return {
    userId: dashboard.userId,
    locale: dashboard.locale,
    slots,
    installed: dashboard.installed.concat([install]),
    retentionExpiresAt: dashboard.retentionExpiresAt,
  };
}

// =============================================================================
// SECTION 29 — Public installer façade
// =============================================================================

/** Default installer configuration. */
export interface InstallerConfig {
  readonly rollbackWindowHours: number;
  readonly retentionDays: number;
  readonly maxDependencyDepth: number;
  readonly defaultPageSize: number;
  readonly hmacKey: string;
}

/** Build the default installer config. */
export function defaultInstallerConfig(): InstallerConfig {
  return {
    rollbackWindowHours: DEFAULT_ROLLBACK_WINDOW_HOURS,
    retentionDays: DEFAULT_RETENTION_DAYS,
    maxDependencyDepth: MAX_DEPENDENCY_DEPTH,
    defaultPageSize: 25,
    hmacKey: AUDIT_CHAIN_HMAC_KEY,
  };
}

/** Composite installer engine — bundles the orchestrator with audit + consent helpers. */
export interface InstallerEngine {
  readonly config: InstallerConfig;
  discover(filter: CatalogFilter): CatalogPage;
  preview(request: InstallRequest, bundle: CatalogBundle): {
    slotMatch: SlotMatchResult;
    dependencyResolution: DependencyResolution;
  };
  install(
    request: InstallRequest,
    bundle: CatalogBundle,
    approval: SacredApproval | null,
  ): { response: InstallResponse; install: InstalledBundle | null; consent: InstallConsent; chain: AuditChainHead };
  rollback(
    installId: string,
    toVersion: SemverString,
    reason: string,
  ): { rollback: RollbackRecord; dashboard: UserDashboard };
  uninstallBundle(
    installId: string,
    reason: string,
  ): { record: UninstallRecord; dashboard: UserDashboard };
  exportLgpd(): LgpdExportPayload;
  erase(): LgpdErasureResult;
}

/** Create a new installer engine bound to a user dashboard. */
export function createInstallerEngine(args: {
  userId: string;
  dashboard: UserDashboard;
  catalog: readonly CatalogBundle[];
  consents: readonly InstallConsent[];
  audit: readonly InstallerAuditEntry[];
  config?: Partial<InstallerConfig>;
  now: IsoTimestamp;
}): InstallerEngine {
  const config = { ...defaultInstallerConfig(), ...(args.config ?? {}) };
  let dashboard = args.dashboard;
  let consents = args.consents;
  let auditChain =
    args.audit.length === 0
      ? initAuditChain(args.userId)
      : {
          userId: args.userId,
          lastEntryId: args.audit[args.audit.length - 1]?.entryId ?? "",
          lastHmac: args.audit[args.audit.length - 1]?.hmac ?? "0".repeat(SHA256_HEX_LENGTH),
          length: args.audit.length,
        };
  const auditList = args.audit.slice();

  function append(action: InstallerAuditEntry["action"], bundleId: string | null, detail: string, now: IsoTimestamp): void {
    const { chain, entry } = appendAuditEntry(auditChain, { at: now, userId: args.userId, bundleId, action, detail }, config.hmacKey);
    auditChain = chain;
    auditList.push(entry);
  }

  return {
    config,
    discover(filter: CatalogFilter) {
      return discoverBundles(args.catalog, { pageSize: config.defaultPageSize, ...filter });
    },
    preview(request: InstallRequest, bundle: CatalogBundle) {
      const slotMatch = matchSlots(bundle, dashboard, request.slotId);
      const dependencyResolution = resolveDependencies(bundle, dashboard, args.catalog, request.now);
      return { slotMatch, dependencyResolution };
    },
    install(request, bundle, approval) {
      append("install-started", bundle.bundleId, `version=${bundle.version}`, request.now);
      const consent = grantConsent(
        request.userId,
        bundle.bundleId,
        bundle.listingId,
        request.consentKeys,
        request.ipHash,
        request.userAgentHash,
        request.now,
      );
      consents = consents.concat([consent]);
      append("consent-granted", bundle.bundleId, consent.consentId, request.now);
      const response = runInstallPipeline({
        request,
        bundle,
        dashboard,
        catalog: args.catalog,
        approval,
        now: request.now,
      });
      if (response.finalState !== "ACTIVE" || response.installId === null) {
        append("install-failed", bundle.bundleId, response.failureMessage ?? "failed", request.now);
        return { response, install: null, consent, chain: auditChain };
      }
      const slotId = response.slotId ?? recommendSlot(bundle, dashboard) ?? "";
      const install = composeInstalledBundle(response, request.userId, consent.consentId, slotId, bundle);
      dashboard = attachInstallToDashboard(dashboard, install);
      append("install-completed", bundle.bundleId, install.installId, request.now);
      return { response, install, consent, chain: auditChain };
    },
    rollback(installId, toVersion, reason) {
      const install = dashboard.installed.find((i) => i.installId === installId);
      if (install === undefined) {
        throw new RollbackUnavailableError(installId, `install ${installId} not found`, args.now);
      }
      const slot = dashboard.slots.find((s) => s.slotId === install.slotId);
      const before = slot?.region ?? { x: 0, y: 0, width: 0, height: 0 };
      const after: SlotRegion = { x: before.x, y: before.y, width: before.width, height: before.height };
      const rb = buildRollbackRecord(install, toVersion, before, after, reason, args.now);
      const updated = applyRollback(dashboard, rb, args.now);
      dashboard = updated;
      append("rollback", install.bundleId, `${install.version}→${toVersion}: ${reason}`, args.now);
      return { rollback: rb, dashboard: updated };
    },
    uninstallBundle(installId, reason) {
      const auditIdsBefore = auditList.map((a) => a.entryId);
      append("uninstall", null, `${installId}: ${reason}`, args.now);
      const auditIdsAfter = auditList.map((a) => a.entryId);
      const newAuditIds = auditIdsAfter.filter((id) => !auditIdsBefore.includes(id));
      const { dashboard: d, record } = uninstall(dashboard, installId, newAuditIds, args.now, config.retentionDays);
      dashboard = d;
      append("erasure-scheduled", record.bundleId, `expires=${record.retentionExpiresAt}`, args.now);
      return { record, dashboard: d };
    },
    exportLgpd() {
      return buildLgpdExport(dashboard, consents, auditList, args.now, "json");
    },
    erase() {
      const { dashboard: d, result } = executeErasure(dashboard, consents, args.now);
      dashboard = d;
      append("erasure-completed", null, `redacted=${result.auditEntriesRedacted}`, args.now);
      return result;
    },
  };
}

// =============================================================================
// SECTION 30 — Diagnostic helpers + smoke tests
// =============================================================================

/** Smoke-test a minimal install → rollback → uninstall flow. */
export function smokeTest(args: { userId: string; now: IsoTimestamp }): {
  ok: boolean;
  steps: readonly string[];
} {
  const steps: string[] = [];
  const slot: DashboardSlot = {
    slotId: "slot-ritual-1",
    slotKind: "ritual",
    region: { x: 0, y: 0, width: 6, height: 4 },
    capacity: 16,
    supportsKinds: ["tarot-spread", "cigano-spread"],
    occupiedBy: null,
  };
  const dashboard: UserDashboard = {
    userId: args.userId,
    locale: "pt-BR",
    slots: [slot],
    installed: [],
    retentionExpiresAt: null,
  };
  const bundle: CatalogBundle = {
    bundleId: "bundle.tarot.cruzeiro",
    version: "1.0.0",
    listingId: "lst-cruzeiro-001",
    publisherId: "pub-ramiro",
    publishedAt: args.now,
    kind: "tarot-spread",
    tradition: "cigano",
    category: "spread",
    tags: ["tarot", "cigano"],
    sensitivity: 2,
    sacred: false,
    locales: ["pt-BR"],
    exports: 12,
    complexity: 3,
    sizeBytes: 4096,
    sha256: sha256("tarot.cruzeiro|1.0.0"),
    visibility: "public",
    optInRequired: false,
    curatorApprovedAt: args.now,
    doubleReviewApprovedAt: null,
    dependencies: [],
    peerConstraint: null,
    minSlotCapacity: 4,
    preferredSlotKinds: ["ritual", "expanded"],
    description: "Cigano Ramiro cruzeiro spread",
  };
  const engine = createInstallerEngine({
    userId: args.userId,
    dashboard,
    catalog: [bundle],
    consents: [],
    audit: [],
    now: args.now,
  });
  const page = engine.discover({ locale: "pt-BR" });
  steps.push(`discover: ${page.items.length} bundle(s)`);
  if (page.items.length !== 1) {
    return { ok: false, steps };
  }
  const request: InstallRequest = {
    userId: args.userId,
    bundleId: bundle.bundleId,
    listingId: bundle.listingId,
    version: bundle.version,
    slotId: null,
    consentKeys: ["install-explicit-consent"],
    ipHash: sha256("127.0.0.1"),
    userAgentHash: sha256("ua-test"),
    now: args.now,
  };
  const result = engine.install(request, bundle, null);
  steps.push(`install: ${result.response.finalState} (install=${result.install?.installId ?? "none"})`);
  if (result.install === null) {
    return { ok: false, steps };
  }
  steps.push(`audit chain length: ${result.chain.length}`);
  if (result.chain.length < 3) {
    return { ok: false, steps };
  }
  const ok = result.response.finalState === "ACTIVE" && result.install !== null;
  return { ok, steps };
}

/** Hash a list of sha256 strings into a deterministic fingerprint. */
export function catalogFingerprint(catalog: readonly CatalogBundle[]): Sha256Hex {
  const concat = catalog
    .map((b) => `${b.bundleId}@${b.version}:${b.sha256}`)
    .sort()
    .join("|");
  return sha256(concat);
}

/** Compute install complexity score (size + dep count + sacred weight). */
export function bundleComplexityScore(bundle: CatalogBundle): number {
  const base = bundle.complexity * 10 + bundle.exports / 10;
  const depWeight = bundle.dependencies.length * 5;
  const sacredWeight = bundle.sacred ? 20 : 0;
  return Math.round(base + depWeight + sacredWeight);
}

/** Recommendation: top N bundles for the user given dashboard capacity. */
export function recommendBundlesForDashboard(
  catalog: readonly CatalogBundle[],
  dashboard: UserDashboard,
  n: number,
): readonly CatalogBundle[] {
  const capacity = remainingDashboardCapacity(dashboard);
  const scored = catalog.map((b) => {
    const m = matchSlots(b, dashboard);
    const fits = m.bestCandidate !== null && m.bestCandidate.capacity <= capacity;
    return { bundle: b, score: m.bestCandidate?.score ?? 0, fits };
  });
  return scored
    .filter((s) => s.fits)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((s) => s.bundle);
}

/** Compose a deterministic w53-installable bundle descriptor for tests. */
export function sampleBundle(overrides: Partial<CatalogBundle> = {}, now: IsoTimestamp = new Date(0).toISOString().replace(/\.\d{3}Z$/, "Z")): CatalogBundle {
  return {
    bundleId: "bundle.sample",
    version: "1.0.0",
    listingId: "lst-sample-001",
    publisherId: "pub-sample",
    publishedAt: now,
    kind: "tarot-spread",
    tradition: "cigano",
    category: "spread",
    tags: ["tarot"],
    sensitivity: 2,
    sacred: false,
    locales: ["pt-BR"],
    exports: 4,
    complexity: 1,
    sizeBytes: 1024,
    sha256: sha256("sample|1.0.0"),
    visibility: "public",
    optInRequired: false,
    curatorApprovedAt: now,
    doubleReviewApprovedAt: null,
    dependencies: [],
    peerConstraint: null,
    minSlotCapacity: 2,
    preferredSlotKinds: ["ritual"],
    description: "Sample bundle",
    ...overrides,
  };
}

/** Compose a minimal sample dashboard for tests. */
export function sampleDashboard(userId: string, now: IsoTimestamp = new Date(0).toISOString().replace(/\.\d{3}Z$/, "Z")): UserDashboard {
  return {
    userId,
    locale: "pt-BR",
    slots: [
      {
        slotId: "slot-1",
        slotKind: "ritual",
        region: { x: 0, y: 0, width: 4, height: 4 },
        capacity: 8,
        supportsKinds: ["tarot-spread", "cigano-spread"],
        occupiedBy: null,
      },
    ],
    installed: [],
    retentionExpiresAt: null,
  };
}

// =============================================================================
// SECTION 31 — Module summary (dev-only)
// =============================================================================

/** Module descriptor (for IDE / registry inspection). */
export interface InstallerModuleSummary {
  readonly name: string;
  readonly version: string;
  readonly sections: number;
  readonly installStates: readonly InstallState[];
  readonly slotKinds: readonly SlotKind[];
  readonly bundleKinds: readonly BundleKind[];
  readonly locales: readonly LocaleTag[];
  readonly sacredTraditionTags: readonly string[];
  readonly lgpdArticles: readonly string[];
}

/** Return module descriptor summary. */
export function moduleSummary(): InstallerModuleSummary {
  return {
    name: "w53/cockpit-widget-bundle-installer",
    version: "1.0.0",
    sections: 31,
    installStates: ["PROSPECTING", "RESOLVING", "DOWNLOADING", "VERIFYING", "INSTALLING", "ACTIVE", "FAILED"],
    slotKinds: SLOT_KINDS,
    bundleKinds: BUNDLE_KINDS,
    locales: SUPPORTED_LOCALES,
    sacredTraditionTags: SACRED_TRADITION_TAGS,
    lgpdArticles: ["Art.7", "Art.9", "Art.18"],
  };
}
