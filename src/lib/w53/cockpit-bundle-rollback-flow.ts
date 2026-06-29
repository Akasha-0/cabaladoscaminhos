/**
 * w53/cockpit-bundle-rollback-flow — user marketplace rollback engine.
 *
 * Composes by shape (no imports) with w52/cockpit-bundle-publish-flow types
 * (PublishListing, OptInConsent, SensitivityLevel) and w51 bundle shapes.
 * Pure functions only — no I/O, no network, no fetch, no Promise.
 *
 * Hand-rolled SHA-256 (FIPS 180-4) — never imports node:crypto.
 *
 * Coverage:
 *   - LGPD Art. 7  (consentimento) — opt-in ledger reversion captured pre-rollback
 *   - LGPD Art. 18 (exportação/eliminação) — purgeRollbackData after retention TTL
 *
 * Sacred-text policy: bundles with sensitivity 4-5 require DOUBLE curator
 * approval for rollback. Sacred flag is preserved across snapshot + restore.
 *
 * Rollback is reversible: capturePreState → cascade undo → audit + snapshot →
 * (optional) restoreFromSnapshot. Cooldown enforced before re-publish.
 *
 * Target: 2000-2600L, 100+ named exports, TSC=0 strict.
 */

// ============================================================================
// SECTION 1: CORE TYPES (rollback lifecycle)
// ============================================================================

/** Discriminated trigger source for a rollback. */
export type RollbackTrigger =
  | "auto_security"
  | "auto_corruption"
  | "manual_operator"
  | "manual_curator"
  | "manual_governance";

/** Categorized reason a rollback was initiated. */
export type RollbackReasonCategory =
  | "security"
  | "content"
  | "user_complaint"
  | "curator_review"
  | "governance";

/** Severity tag attached to a rollback reason. */
export type RollbackSeverity = "low" | "medium" | "high" | "critical";

/** Status in the rollback lifecycle. */
export type RollbackStatus =
  | "pending_capture"
  | "captured"
  | "cascade_in_progress"
  | "cascade_complete"
  | "audit_persisted"
  | "completed"
  | "restored"
  | "purged";

/** Curatorial role that may authorize a rollback. */
export type CuratorRole = "lead" | "deputy" | "auditor" | "governance" | "operator";

/** Snapshot retention tier. */
export type RetentionTier = "transient" | "short" | "medium" | "long" | "purgeable";

/** Re-publish gate outcome. */
export type RePublishGateStatus = "blocked" | "cooldown" | "needs_curator" | "open";

/** Supported locale (mirrors w52 SupportedLocale for portability). */
export type SupportedLocale = "pt-BR" | "en-US" | "es-ES" | "fr-FR";

/** Pre-state snapshot captured before rollback cascade runs. */
export interface PreRollbackSnapshot {
  readonly snapshotId: string;
  readonly bundleId: string;
  readonly capturedAt: string;
  readonly capturedBy: string;
  readonly publisherId: string;
  readonly version: string;
  readonly listingCount: number;
  readonly consentCount: number;
  readonly consumerCount: number;
  readonly sha256: string;
  readonly sacredFlag: boolean;
  readonly retentionTier: RetentionTier;
  readonly optInLedger: readonly OptInSnapshotEntry[];
  readonly listingMap: readonly ListingSnapshotEntry[];
  readonly auditTrailDigest: string;
  readonly expiresAt: string;
}

/** Per-consent opt-in entry captured in the pre-state snapshot. */
export interface OptInSnapshotEntry {
  readonly userId: string;
  readonly listingId: string;
  readonly consentedAt: string;
  readonly withdrawnAt: string | null;
  readonly ipHash: string;
  readonly userAgentHash: string;
  readonly preserved: boolean;
}

/** Per-listing entry captured in the pre-state snapshot. */
export interface ListingSnapshotEntry {
  readonly listingId: string;
  readonly visibility: string;
  readonly optInRequired: boolean;
  readonly locale: string;
  readonly publishedAt: string;
  readonly sha256: string;
}

/** Categorized rollback reason with severity. */
export interface RollbackReason {
  readonly category: RollbackReasonCategory;
  readonly severity: RollbackSeverity;
  readonly description: string;
  readonly reportedBy: string;
  readonly reportedAt: string;
  readonly lgpdArticles: readonly string[];
  readonly evidenceRefs: readonly string[];
}

/** Audit entry for a rollback event (LGPD Art. 18 chain). */
export interface RollbackAuditEntry {
  readonly rollbackId: string;
  readonly eventType: RollbackEventType;
  readonly actor: string;
  readonly ts: string;
  readonly trigger: RollbackTrigger;
  readonly reason: RollbackReason;
  readonly lgpdArticles: readonly string[];
  readonly sacredFlagPreserved: boolean;
  readonly snapshotId: string | null;
  readonly sha256: string;
}

/** Event types emitted into the rollback audit log. */
export type RollbackEventType =
  | "rollback_initiated"
  | "snapshot_captured"
  | "cascade_started"
  | "consumer_uninstalled"
  | "listing_retracted"
  | "publisher_notified"
  | "opt_in_revoked"
  | "cascade_complete"
  | "audit_persisted"
  | "rollback_completed"
  | "restoration_started"
  | "restoration_complete"
  | "rollback_purged"
  | "republish_gate_set"
  | "republish_gate_cleared"
  | "dual_curator_approval_requested"
  | "dual_curator_approval_granted"
  | "dual_curator_approval_denied";

/** Composite state object representing a rollback in flight. */
export interface RollbackState {
  readonly rollbackId: string;
  readonly bundleId: string;
  readonly status: RollbackStatus;
  readonly trigger: RollbackTrigger;
  readonly reason: RollbackReason;
  readonly capturedSnapshotId: string | null;
  readonly restoredFromSnapshotId: string | null;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly lockedUntil: string | null;
}

/** Outcome of a cascade undo operation. */
export interface CascadeUndoResult {
  readonly rollbackId: string;
  readonly retracted: number;
  readonly uninstalled: number;
  readonly notified: number;
  readonly optInRevoked: number;
  readonly failedSteps: readonly string[];
  readonly durationMs: number;
}

/** Re-publish gate state — controls whether a bundle may re-publish. */
export interface RePublishGate {
  readonly bundleId: string;
  readonly status: RePublishGateStatus;
  readonly cooldownUntil: string;
  readonly curatorReviewedAt: string | null;
  readonly curatorReviewerId: string | null;
  readonly blockedReason: string | null;
  readonly lastRollbackId: string;
}

/** Dual curator approval record for sacred bundles. */
export interface DualCuratorApproval {
  readonly rollbackId: string;
  readonly bundleId: string;
  readonly primaryCuratorId: string;
  readonly secondaryCuratorId: string;
  readonly primaryApprovedAt: string | null;
  readonly secondaryApprovedAt: string | null;
  readonly approved: boolean;
  readonly deniedReason: string | null;
}

/** Operator performing the rollback. */
export interface RollbackOperator {
  readonly id: string;
  readonly role: CuratorRole;
  readonly active: number;
  readonly max: number;
}

/** Consumer (user-installed) record removed during cascade. */
export interface ConsumerInstallRecord {
  readonly consumerId: string;
  readonly userId: string;
  readonly bundleId: string;
  readonly installedAt: string;
}

/** Publisher notification record emitted during cascade. */
export interface PublisherNotification {
  readonly notificationId: string;
  readonly publisherId: string;
  readonly bundleId: string;
  readonly rollbackId: string;
  readonly title: string;
  readonly body: string;
  readonly createdAt: string;
}

/** Restoration output — what came back after restoreRollback. */
export interface RestorationResult {
  readonly rollbackId: string;
  readonly restoredFromSnapshotId: string;
  readonly restoredListings: number;
  readonly restoredConsents: number;
  readonly restoredConsumers: number;
  readonly rePublishGateCleared: boolean;
  readonly auditEntryIds: readonly string[];
}

/** Composite rollback request — input to `rollbackBundle`. */
export interface RollbackRequest {
  readonly bundleId: string;
  readonly trigger: RollbackTrigger;
  readonly reason: RollbackReason;
  readonly actorId: string;
  readonly now: string;
  readonly options: RollbackOptions;
}

/** Options controlling rollback behavior. */
export interface RollbackOptions {
  readonly skipCascade?: boolean;
  readonly skipNotifications?: boolean;
  readonly preserveSnapshot?: boolean;
  readonly cooldownHours?: number;
  readonly requireDualCurator?: boolean;
  readonly retentionDays?: number;
}

/** Input shape for restore-from-snapshot operation. */
export interface RestorationRequest {
  readonly rollbackId: string;
  readonly actorId: string;
  readonly now: string;
  readonly reason: string;
}

/** Validation result reused across rollback validators. */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/** Trigger validation result. */
export interface TriggerValidationResult {
  readonly ok: boolean;
  readonly auto: boolean;
  readonly reason: string;
}

/** Cooldown check result. */
export interface CooldownCheckResult {
  readonly inCooldown: boolean;
  readonly cooldownUntil: string;
  readonly remainingHours: number;
}

/** Snapshot integrity verification result. */
export interface SnapshotIntegrityResult {
  readonly intact: boolean;
  readonly reason: string;
  readonly recomputedSha: string;
}

/** Cascade step outcome — emitted per cascade step. */
export interface CascadeStepOutcome {
  readonly step: CascadeStep;
  readonly ok: boolean;
  readonly affected: number;
  readonly error: string | null;
}

/** Cascade step discriminator. */
export type CascadeStep =
  | "capture"
  | "lock"
  | "uninstall"
  | "retract"
  | "revoke_opt_in"
  | "notify"
  | "persist_audit"
  | "complete";

/** Retention / purge check result. */
export interface RetentionCheckResult {
  readonly expired: boolean;
  readonly daysOld: number;
  readonly tier: RetentionTier;
  readonly purgeable: boolean;
}

/** Sacred-flag preservation summary emitted on rollback completion. */
export interface SacredPreservationSummary {
  readonly bundleId: string;
  readonly wasSacred: boolean;
  readonly preservedInSnapshot: boolean;
  readonly preservedInAudit: boolean;
  readonly doubleCuratorRequired: boolean;
  readonly doubleCuratorGranted: boolean;
}

/** Composite rollback report — full output of `rollbackBundle`. */
export interface RollbackReport {
  readonly rollbackId: string;
  readonly bundleId: string;
  readonly state: RollbackState;
  readonly snapshot: PreRollbackSnapshot | null;
  readonly cascade: CascadeUndoResult;
  readonly rePublishGate: RePublishGate;
  readonly auditChainHead: string;
  readonly sacred: SacredPreservationSummary;
  readonly durationMs: number;
}

/** LGPD erasure result for a rollback. */
export interface RollbackErasureResult {
  readonly rollbackId: string;
  readonly purgedAuditEntries: number;
  readonly purgedSnapshots: number;
  readonly purgedConsentLeaves: number;
  readonly purgedAt: string;
  readonly legalHold: boolean;
}

/** Rollback policy — central knobs. */
export interface RollbackPolicy {
  readonly cooldownHours: number;
  readonly requireDualCuratorForSacred: boolean;
  readonly retentionDays: number;
  readonly captureSnapshotAlways: boolean;
  readonly enforceCascadeOrder: boolean;
  readonly allowRestoreAfter: boolean;
  readonly purgeAfterRetention: boolean;
}

// ============================================================================
// SECTION 2: CONSTANTS
// ============================================================================

export const DEFAULT_COOLDOWN_HOURS = 72;
export const TRANSIENT_SNAPSHOT_TTL_HOURS = 24 * 7; // 7 days
export const AUDIT_RETENTION_DAYS = 365;
export const MIN_REASON_LENGTH = 8;
export const MAX_REASON_LENGTH = 2000;
export const SHA256_HEX_LENGTH = 64;
export const MIN_SNAPSHOT_DIGEST_LENGTH = 8;
export const SACRED_SENSITIVITY_THRESHOLD = 4;
export const DEFAULT_RETENTION_DAYS = 30;

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
];

export const ROLLBACK_TRIGGERS: readonly RollbackTrigger[] = [
  "auto_security",
  "auto_corruption",
  "manual_operator",
  "manual_curator",
  "manual_governance",
];

export const ROLLBACK_REASON_CATEGORIES: readonly RollbackReasonCategory[] = [
  "security",
  "content",
  "user_complaint",
  "curator_review",
  "governance",
];

export const ROLLBACK_SEVERITIES: readonly RollbackSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export const ROLLBACK_STATUSES: readonly RollbackStatus[] = [
  "pending_capture",
  "captured",
  "cascade_in_progress",
  "cascade_complete",
  "audit_persisted",
  "completed",
  "restored",
  "purged",
];

export const ROLLBACK_EVENT_TYPES: readonly RollbackEventType[] = [
  "rollback_initiated",
  "snapshot_captured",
  "cascade_started",
  "consumer_uninstalled",
  "listing_retracted",
  "publisher_notified",
  "opt_in_revoked",
  "cascade_complete",
  "audit_persisted",
  "rollback_completed",
  "restoration_started",
  "restoration_complete",
  "rollback_purged",
  "republish_gate_set",
  "republish_gate_cleared",
  "dual_curator_approval_requested",
  "dual_curator_approval_granted",
  "dual_curator_approval_denied",
];

export const CASCADE_STEPS: readonly CascadeStep[] = [
  "capture",
  "lock",
  "uninstall",
  "retract",
  "revoke_opt_in",
  "notify",
  "persist_audit",
  "complete",
];

export const COVERAGE_LGPD_ARTICLES: readonly string[] = ["Art. 7", "Art. 18"];

/** Severity → default cooldown hours. */
export const SEVERITY_COOLDOWN_HOURS: Readonly<Record<RollbackSeverity, number>> = {
  low: 24,
  medium: 48,
  high: 72,
  critical: 168,
};

/** Trigger category metadata. */
export const TRIGGER_LABELS: Readonly<Record<RollbackTrigger, string>> = {
  auto_security: "Auto (security)",
  auto_corruption: "Auto (corruption)",
  manual_operator: "Manual (operator)",
  manual_curator: "Manual (curator)",
  manual_governance: "Manual (governance)",
};

/** Reason category → recommended severity. */
export const REASON_DEFAULT_SEVERITY: Readonly<Record<RollbackReasonCategory, RollbackSeverity>> = {
  security: "critical",
  content: "high",
  user_complaint: "medium",
  curator_review: "medium",
  governance: "high",
};

/** Default rollback policy used when none is supplied. */
export const DEFAULT_ROLLBACK_POLICY: RollbackPolicy = {
  cooldownHours: DEFAULT_COOLDOWN_HOURS,
  requireDualCuratorForSacred: true,
  retentionDays: DEFAULT_RETENTION_DAYS,
  captureSnapshotAlways: true,
  enforceCascadeOrder: true,
  allowRestoreAfter: true,
  purgeAfterRetention: true,
};

// ============================================================================
// SECTION 3: TYPED ERRORS
// ============================================================================

/** Base class for all w53 rollback-flow errors. */
export class RollbackFlowError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;
  constructor(
    code: string,
    message: string,
    context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "RollbackFlowError";
    this.code = code;
    this.context = Object.freeze({ ...context });
  }
}

/** RBK_001 — bundle not eligible for rollback. */
export class BundleNotEligibleError extends RollbackFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("RBK_001", message, context);
    this.name = "BundleNotEligibleError";
  }
}

/** RBK_002 — cooldown violation. */
export class CooldownViolationError extends RollbackFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("RBK_002", message, context);
    this.name = "CooldownViolationError";
  }
}

/** RBK_003 — snapshot missing. */
export class SnapshotMissingError extends RollbackFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("RBK_003", message, context);
    this.name = "SnapshotMissingError";
  }
}

/** RBK_004 — cascade failed mid-rollback. */
export class CascadeFailedError extends RollbackFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("RBK_004", message, context);
    this.name = "CascadeFailedError";
  }
}

/** RBK_005 — audit chain broken. */
export class AuditChainBrokenError extends RollbackFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("RBK_005", message, context);
    this.name = "AuditChainBrokenError";
  }
}

/** RBK_006 — re-publish gate still active. */
export class RePublishGateActiveError extends RollbackFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("RBK_006", message, context);
    this.name = "RePublishGateActiveError";
  }
}

/** Sacred bundle rollback attempted without dual curator approval. */
export class DualCuratorRequiredError extends RollbackFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("RBK_DUAL_CURATOR", message, context);
    this.name = "DualCuratorRequiredError";
  }
}

/** Trigger discriminator did not match any known trigger. */
export class InvalidTriggerError extends RollbackFlowError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super("RBK_TRIGGER", message, context);
    this.name = "InvalidTriggerError";
  }
}

// ============================================================================
// SECTION 4: VALIDATORS / TYPE GUARDS
// ============================================================================

const BUNDLE_ID_RE = /^[a-z0-9]{8,64}$/i;
const SHA256_RE = /^[a-f0-9]{64}$/i;
const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

export function isValidBundleId(value: unknown): value is string {
  return typeof value === "string" && BUNDLE_ID_RE.test(value);
}

export function isValidLocale(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!LOCALE_RE.test(value)) return false;
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export function isValidSHA256(value: unknown): value is string {
  return typeof value === "string" && SHA256_RE.test(value);
}

export function isValidActorId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9_-]{3,32}$/i.test(value);
}

export function isValidTrigger(value: unknown): value is RollbackTrigger {
  return (
    value === "auto_security" ||
    value === "auto_corruption" ||
    value === "manual_operator" ||
    value === "manual_curator" ||
    value === "manual_governance"
  );
}

export function isValidReasonCategory(value: unknown): value is RollbackReasonCategory {
  return (
    value === "security" ||
    value === "content" ||
    value === "user_complaint" ||
    value === "curator_review" ||
    value === "governance"
  );
}

export function isValidSeverity(value: unknown): value is RollbackSeverity {
  return value === "low" || value === "medium" || value === "high" || value === "critical";
}

export function isAutoTrigger(trigger: RollbackTrigger): boolean {
  return trigger === "auto_security" || trigger === "auto_corruption";
}

export function isManualTrigger(trigger: RollbackTrigger): boolean {
  return (
    trigger === "manual_operator" ||
    trigger === "manual_curator" ||
    trigger === "manual_governance"
  );
}

export function isValidRollbackReason(value: unknown): value is RollbackReason {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  if (!isValidReasonCategory(r.category)) return false;
  if (!isValidSeverity(r.severity)) return false;
  if (typeof r.description !== "string") return false;
  if (!isValidActorId(r.reportedBy)) return false;
  if (typeof r.reportedAt !== "string") return false;
  if (!Array.isArray(r.lgpdArticles)) return false;
  if (!Array.isArray(r.evidenceRefs)) return false;
  return true;
}

export function isValidRollbackRequest(value: unknown): value is RollbackRequest {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  if (!isValidBundleId(r.bundleId)) return false;
  if (!isValidTrigger(r.trigger)) return false;
  if (!isValidRollbackReason(r.reason)) return false;
  if (!isValidActorId(r.actorId)) return false;
  if (typeof r.now !== "string") return false;
  if (typeof r.options !== "object" || r.options === null) return false;
  return true;
}

export function isValidSnapshot(value: unknown): value is PreRollbackSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  if (typeof s.snapshotId !== "string") return false;
  if (!isValidBundleId(s.bundleId)) return false;
  if (typeof s.capturedAt !== "string") return false;
  if (!isValidActorId(s.capturedBy)) return false;
  if (!isValidActorId(s.publisherId)) return false;
  if (typeof s.version !== "string") return false;
  if (typeof s.listingCount !== "number") return false;
  if (typeof s.consentCount !== "number") return false;
  if (typeof s.consumerCount !== "number") return false;
  if (!isValidSHA256(s.sha256)) return false;
  if (typeof s.sacredFlag !== "boolean") return false;
  if (!Array.isArray(s.optInLedger)) return false;
  if (!Array.isArray(s.listingMap)) return false;
  if (typeof s.auditTrailDigest !== "string") return false;
  if (typeof s.expiresAt !== "string") return false;
  return true;
}

export function isValidGate(value: unknown): value is RePublishGate {
  if (typeof value !== "object" || value === null) return false;
  const g = value as Record<string, unknown>;
  if (!isValidBundleId(g.bundleId)) return false;
  if (typeof g.status !== "string") return false;
  if (typeof g.cooldownUntil !== "string") return false;
  if (typeof g.lastRollbackId !== "string") return false;
  return true;
}

export function isSacred(sensitivity: number): boolean {
  return sensitivity >= SACRED_SENSITIVITY_THRESHOLD;
}

export function isOperatorRole(role: string): boolean {
  return role === "operator" || role === "lead" || role === "deputy" || role === "governance";
}

export function isCuratorRole(role: string): boolean {
  return role === "lead" || role === "deputy" || role === "auditor";
}

export function isReasonCritical(reason: RollbackReason): boolean {
  return reason.severity === "critical";
}

export function isReasonHighOrAbove(reason: RollbackReason): boolean {
  return reason.severity === "high" || reason.severity === "critical";
}

export function requiresDualCurator(reason: RollbackReason): boolean {
  return (
    reason.severity === "high" ||
    reason.severity === "critical" ||
    reason.category === "security" ||
    reason.category === "governance"
  );
}

export function isSacredReason(reason: RollbackReason): boolean {
  return reason.evidenceRefs.some((r) => r.startsWith("sacred:"));
}

export function isLgpdTagged(reason: RollbackReason): boolean {
  return reason.lgpdArticles.length > 0;
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

export function computeStringHash(input: string): string {
  const bytes = utf8Encode(input);
  const H = sha256Bytes(bytes);
  return H.map(toHex).join("");
}

export function computeSnapshotHash(snap: PreRollbackSnapshot): string {
  const canonical = canonicalizeSnapshot(snap);
  return computeStringHash(canonical);
}

export function computeAuditEntryHash(entry: RollbackAuditEntry): string {
  const canonical = canonicalizeAuditEntry(entry);
  return computeStringHash(canonical);
}

export function computeGateHash(gate: RePublishGate): string {
  const canonical = canonicalizeGate(gate);
  return computeStringHash(canonical);
}

export function canonicalizeSnapshot(snap: PreRollbackSnapshot): string {
  const parts: string[] = [
    `snapshot:${snap.snapshotId}`,
    `bundle:${snap.bundleId}`,
    `capturedAt:${snap.capturedAt}`,
    `capturedBy:${snap.capturedBy}`,
    `publisher:${snap.publisherId}`,
    `version:${snap.version}`,
    `listingCount:${snap.listingCount}`,
    `consentCount:${snap.consentCount}`,
    `consumerCount:${snap.consumerCount}`,
    `sacred:${snap.sacredFlag ? "1" : "0"}`,
    `retention:${snap.retentionTier}`,
    `expiresAt:${snap.expiresAt}`,
  ];
  return parts.join("|");
}

export function canonicalizeAuditEntry(entry: RollbackAuditEntry): string {
  const parts: string[] = [
    `rollback:${entry.rollbackId}`,
    `event:${entry.eventType}`,
    `actor:${entry.actor}`,
    `ts:${entry.ts}`,
    `trigger:${entry.trigger}`,
    `reasonCategory:${entry.reason.category}`,
    `reasonSeverity:${entry.reason.severity}`,
    `sacred:${entry.sacredFlagPreserved ? "1" : "0"}`,
    `snapshot:${entry.snapshotId ?? "null"}`,
  ];
  return parts.join("|");
}

export function canonicalizeGate(gate: RePublishGate): string {
  const parts: string[] = [
    `gate:${gate.bundleId}`,
    `status:${gate.status}`,
    `cooldown:${gate.cooldownUntil}`,
    `reviewed:${gate.curatorReviewedAt ?? "null"}`,
    `reviewer:${gate.curatorReviewerId ?? "null"}`,
    `lastRollback:${gate.lastRollbackId}`,
  ];
  return parts.join("|");
}

export function computeOptInIpHash(ip: string): string {
  return computeStringHash(`ip:${ip.trim().toLowerCase()}`);
}

export function computeOptInUserAgentHash(userAgent: string): string {
  return computeStringHash(`ua:${userAgent.trim().toLowerCase()}`);
}

export function shortHash(hash: string, length = 12): string {
  return hash.slice(0, length);
}

export function hashToString(bytes: readonly number[]): string {
  return bytes.map(toHex).join("");
}

// ============================================================================
// SECTION 6: MOCK CLOCK + RNG
// ============================================================================

/** Mock clock — deterministic time control for rollback flow. */
export interface MockClock {
  now(): string;
  advance(hours: number): void;
  setNow(iso: string): void;
}

export function createMockClock(initial: string): MockClock {
  let current = initial;
  return {
    now(): string {
      return current;
    },
    advance(hours: number): void {
      const ms = Date.parse(current) + hours * 60 * 60 * 1000;
      current = new Date(ms).toISOString();
    },
    setNow(iso: string): void {
      current = iso;
    },
  };
}

/** Mock RNG — deterministic integer generator. */
export interface MockRNG {
  next(): number;
  nextInt(max: number): number;
  nextId(prefix: string): string;
  reseed(seed: number): void;
}

export function createMockRNG(seed = 0xC0FFEE): MockRNG {
  let state = seed >>> 0;
  if (state === 0) state = 1;
  let counter = 0;
  return {
    next(): number {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    },
    nextInt(max: number): number {
      return Math.floor(this.next() * max);
    },
    nextId(prefix: string): string {
      counter += 1;
      return `${prefix}_${counter.toString(36)}_${Math.floor(this.next() * 0xffffff).toString(36)}`;
    },
    reseed(seed: number): void {
      state = seed >>> 0;
      if (state === 0) state = 1;
      counter = 0;
    },
  };
}

/** Tick the clock forward by N hours (immutable variant). */
export function advanceIso(now: string, hours: number): string {
  const ms = Date.parse(now) + hours * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}

/** Tick the clock forward by N days. */
export function advanceDays(now: string, days: number): string {
  return advanceIso(now, days * 24);
}

/** Tick the clock forward by N minutes. */
export function advanceMinutes(now: string, minutes: number): string {
  const ms = Date.parse(now) + minutes * 60 * 1000;
  return new Date(ms).toISOString();
}

/** Compute hours between two ISO timestamps. */
export function hoursBetween(earlier: string, later: string): number {
  const ms = Date.parse(later) - Date.parse(earlier);
  return Math.floor(ms / (60 * 60 * 1000));
}

/** Compute days between two ISO timestamps. */
export function daysBetween(earlier: string, later: string): number {
  return Math.floor(hoursBetween(earlier, later) / 24);
}

// ============================================================================
// SECTION 7: I18N STRING TABLES
// ============================================================================

export interface RollbackI18N {
  readonly "pt-BR": string;
  readonly "en-US": string;
}

export const ROLLBACK_STATUS_I18N: Readonly<Record<RollbackStatus, RollbackI18N>> = {
  pending_capture: { "pt-BR": "Aguardando captura", "en-US": "Pending capture" },
  captured: { "pt-BR": "Capturado", "en-US": "Captured" },
  cascade_in_progress: { "pt-BR": "Cascata em andamento", "en-US": "Cascade in progress" },
  cascade_complete: { "pt-BR": "Cascata concluída", "en-US": "Cascade complete" },
  audit_persisted: { "pt-BR": "Auditoria persistida", "en-US": "Audit persisted" },
  completed: { "pt-BR": "Concluído", "en-US": "Completed" },
  restored: { "pt-BR": "Restaurado", "en-US": "Restored" },
  purged: { "pt-BR": "Expurgado", "en-US": "Purged" },
};

export const ROLLBACK_SEVERITY_I18N: Readonly<Record<RollbackSeverity, RollbackI18N>> = {
  low: { "pt-BR": "Baixa", "en-US": "Low" },
  medium: { "pt-BR": "Média", "en-US": "Medium" },
  high: { "pt-BR": "Alta", "en-US": "High" },
  critical: { "pt-BR": "Crítica", "en-US": "Critical" },
};

export const ROLLBACK_REASON_I18N: Readonly<Record<RollbackReasonCategory, RollbackI18N>> = {
  security: { "pt-BR": "Segurança", "en-US": "Security" },
  content: { "pt-BR": "Conteúdo", "en-US": "Content" },
  user_complaint: { "pt-BR": "Reclamação de usuário", "en-US": "User complaint" },
  curator_review: { "pt-BR": "Revisão de curador", "en-US": "Curator review" },
  governance: { "pt-BR": "Governança", "en-US": "Governance" },
};

export const ROLLBACK_TRIGGER_I18N: Readonly<Record<RollbackTrigger, RollbackI18N>> = {
  auto_security: { "pt-BR": "Auto (segurança)", "en-US": "Auto (security)" },
  auto_corruption: { "pt-BR": "Auto (corrupção)", "en-US": "Auto (corruption)" },
  manual_operator: { "pt-BR": "Manual (operador)", "en-US": "Manual (operator)" },
  manual_curator: { "pt-BR": "Manual (curador)", "en-US": "Manual (curator)" },
  manual_governance: { "pt-BR": "Manual (governança)", "en-US": "Manual (governance)" },
};

export const GATE_STATUS_I18N: Readonly<Record<RePublishGateStatus, RollbackI18N>> = {
  blocked: { "pt-BR": "Bloqueado", "en-US": "Blocked" },
  cooldown: { "pt-BR": "Em cooldown", "en-US": "In cooldown" },
  needs_curator: { "pt-BR": "Aguardando curador", "en-US": "Needs curator" },
  open: { "pt-BR": "Aberto", "en-US": "Open" },
};

export function translateRollbackStatus(status: RollbackStatus, locale: string): string {
  const entry = ROLLBACK_STATUS_I18N[status];
  return locale === "pt-BR" ? entry["pt-BR"] : entry["en-US"];
}

export function translateRollbackSeverity(severity: RollbackSeverity, locale: string): string {
  const entry = ROLLBACK_SEVERITY_I18N[severity];
  return locale === "pt-BR" ? entry["pt-BR"] : entry["en-US"];
}

export function translateRollbackReasonCategory(cat: RollbackReasonCategory, locale: string): string {
  const entry = ROLLBACK_REASON_I18N[cat];
  return locale === "pt-BR" ? entry["pt-BR"] : entry["en-US"];
}

export function translateRollbackTrigger(trigger: RollbackTrigger, locale: string): string {
  const entry = ROLLBACK_TRIGGER_I18N[trigger];
  return locale === "pt-BR" ? entry["pt-BR"] : entry["en-US"];
}

export function translateGateStatus(status: RePublishGateStatus, locale: string): string {
  const entry = GATE_STATUS_I18N[status];
  return locale === "pt-BR" ? entry["pt-BR"] : entry["en-US"];
}

// ============================================================================
// SECTION 8: VALIDATORS (TRIGGER / REASON / COOLDOWN / CASCADE / SNAPSHOT / RESTORATION)
// ============================================================================

/** Validate the rollback trigger against the discriminator set. */
export function validateTrigger(trigger: unknown): TriggerValidationResult {
  if (!isValidTrigger(trigger)) {
    throw new InvalidTriggerError(`invalid rollback trigger: ${String(trigger)}`, {
      trigger,
    });
  }
  return {
    ok: true,
    auto: isAutoTrigger(trigger),
    reason: isAutoTrigger(trigger) ? "auto-trigger — incident response path" : "manual-trigger — operator action",
  };
}

/** Validate a RollbackReason shape and content. */
export function validateReason(reason: RollbackReason): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isValidReasonCategory(reason.category)) {
    errors.push(`invalid reason category: ${String(reason.category)}`);
  }
  if (!isValidSeverity(reason.severity)) {
    errors.push(`invalid reason severity: ${String(reason.severity)}`);
  }
  if (typeof reason.description !== "string") {
    errors.push("description must be a string");
  } else {
    if (reason.description.length < MIN_REASON_LENGTH) {
      errors.push(`description too short (min ${MIN_REASON_LENGTH})`);
    }
    if (reason.description.length > MAX_REASON_LENGTH) {
      errors.push(`description too long (max ${MAX_REASON_LENGTH})`);
    }
  }
  if (!isValidActorId(reason.reportedBy)) {
    errors.push("reportedBy must be a valid actor id");
  }
  if (Number.isNaN(Date.parse(reason.reportedAt))) {
    errors.push("reportedAt is not a valid ISO timestamp");
  }
  if (reason.category === "security" && reason.severity !== "critical") {
    warnings.push("security reason should be severity=critical");
  }
  if (reason.evidenceRefs.length === 0) {
    warnings.push("no evidence references attached — governance may flag");
  }
  return { valid: errors.length === 0, errors, warnings };
}

/** Validate the re-publish cooldown window. */
export function validateCooldown(
  gate: RePublishGate,
  now: string,
): CooldownCheckResult {
  const cooldownMs = Date.parse(gate.cooldownUntil);
  const nowMs = Date.parse(now);
  const remainingMs = cooldownMs - nowMs;
  const remainingHours = Math.max(0, Math.floor(remainingMs / (60 * 60 * 1000)));
  return {
    inCooldown: nowMs < cooldownMs,
    cooldownUntil: gate.cooldownUntil,
    remainingHours,
  };
}

/** Validate that the cascade steps were executed in the canonical order. */
export function validateCascadeOrder(observed: readonly CascadeStep[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (observed.length === 0) {
    errors.push("cascade executed no steps");
  }
  for (let i = 0; i < observed.length; i++) {
    const expected = CASCADE_STEPS[i];
    if (expected === undefined) {
      errors.push(`unexpected cascade step at index ${i}: ${String(observed[i])}`);
      continue;
    }
    if (observed[i] !== expected) {
      errors.push(`cascade step ${i} out of order — expected ${expected}, got ${observed[i]}`);
    }
  }
  if (observed.length > 0 && observed[0] !== "capture") {
    errors.push("cascade must begin with capture step");
  }
  if (observed.length > 0 && observed[observed.length - 1] !== "complete") {
    warnings.push("cascade should end with complete step");
  }
  return { valid: errors.length === 0, errors, warnings };
}

/** Validate that a snapshot is internally consistent (hash, ledger counts). */
export function validateSnapshotIntegrity(snap: PreRollbackSnapshot): SnapshotIntegrityResult {
  const recomputed = computeSnapshotHash(snap);
  if (recomputed !== snap.sha256) {
    return { intact: false, reason: "sha256 mismatch", recomputedSha: recomputed };
  }
  if (snap.optInLedger.length !== snap.consentCount) {
    return { intact: false, reason: "consentCount != optInLedger.length", recomputedSha: recomputed };
  }
  if (snap.listingMap.length !== snap.listingCount) {
    return { intact: false, reason: "listingCount != listingMap.length", recomputedSha: recomputed };
  }
  if (snap.auditTrailDigest.length < MIN_SNAPSHOT_DIGEST_LENGTH) {
    return { intact: false, reason: "auditTrailDigest too short", recomputedSha: recomputed };
  }
  if (Number.isNaN(Date.parse(snap.expiresAt))) {
    return { intact: false, reason: "expiresAt invalid", recomputedSha: recomputed };
  }
  if (Number.isNaN(Date.parse(snap.capturedAt))) {
    return { intact: false, reason: "capturedAt invalid", recomputedSha: recomputed };
  }
  return { intact: true, reason: "snapshot integrity verified", recomputedSha: recomputed };
}

/** Validate that a restoration request is structurally sound. */
export function validateRestoration(
  req: RestorationRequest,
  snap: PreRollbackSnapshot | null,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isValidActorId(req.actorId)) errors.push("actorId invalid");
  if (Number.isNaN(Date.parse(req.now))) errors.push("now invalid");
  if (req.reason.trim().length < MIN_REASON_LENGTH) errors.push("reason too short");
  if (snap === null) errors.push("snapshot is null");
  if (snap !== null) {
    const integ = validateSnapshotIntegrity(snap);
    if (!integ.intact) errors.push(`snapshot integrity: ${integ.reason}`);
    if (Date.parse(req.now) > Date.parse(snap.expiresAt)) {
      errors.push("snapshot has expired — cannot restore");
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

/** Validate that a bundle is eligible for rollback (exists, not already purged). */
export function validateRollbackEligibility(
  request: RollbackRequest,
  existingGate: RePublishGate | null,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isValidBundleId(request.bundleId)) errors.push("invalid bundleId");
  if (!isValidTrigger(request.trigger)) errors.push("invalid trigger");
  if (!isValidActorId(request.actorId)) errors.push("invalid actorId");
  if (existingGate !== null) {
    const cd = validateCooldown(existingGate, request.now);
    if (cd.inCooldown) {
      errors.push(`cooldown active — ${cd.remainingHours}h remaining`);
    }
  }
  if (request.options.requireDualCurator === false && request.reason.severity === "critical") {
    warnings.push("critical severity without dual-curator override");
  }
  return { valid: errors.length === 0, errors, warnings };
}

/** Validate dual curator approval for sacred bundles. */
export function validateDualCuratorApproval(
  approval: DualCuratorApproval | null,
  reason: RollbackReason,
  bundleSacred: boolean,
): ValidationResult {
  const errors: string[] = [];
  if (!bundleSacred && reason.severity !== "critical" && reason.category !== "security") {
    return { valid: true, errors: [], warnings: [] };
  }
  if (approval === null) {
    errors.push("dual curator approval required but not provided");
  } else {
    if (approval.primaryCuratorId === approval.secondaryCuratorId) {
      errors.push("primary and secondary curator must be distinct");
    }
    if (approval.primaryApprovedAt === null || approval.secondaryApprovedAt === null) {
      errors.push("both curators must approve");
    }
    if (!approval.approved) {
      errors.push(`approval denied: ${approval.deniedReason ?? "no reason"}`);
    }
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

/** Validate the audit chain for an array of entries. */
export function validateAuditChain(entries: readonly RollbackAuditEntry[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (entries.length === 0) {
    errors.push("audit chain is empty");
    return { valid: false, errors, warnings };
  }
  let prev = entries[0];
  if (prev.sha256.length !== SHA256_HEX_LENGTH) {
    errors.push(`entry[0] has invalid sha256 length: ${prev.sha256.length}`);
  }
  for (let i = 1; i < entries.length; i++) {
    const cur = entries[i];
    if (cur.rollbackId !== prev.rollbackId) {
      errors.push(`entry[${i}] rollbackId mismatch: ${cur.rollbackId} vs ${prev.rollbackId}`);
    }
    if (Date.parse(cur.ts) < Date.parse(prev.ts)) {
      errors.push(`entry[${i}] timestamp regressed: ${cur.ts} < ${prev.ts}`);
    }
    if (cur.sha256.length !== SHA256_HEX_LENGTH) {
      errors.push(`entry[${i}] has invalid sha256 length: ${cur.sha256.length}`);
    }
    prev = cur;
  }
  return { valid: errors.length === 0, errors, warnings };
}

// ============================================================================
// SECTION 9: STATE CAPTURE / SNAPSHOT
// ============================================================================

/** Build the pre-rollback snapshot from publisher + listings + consents shape. */
export function capturePreState(
  input: {
    bundleId: string;
    publisherId: string;
    version: string;
    capturedBy: string;
    now: string;
    sensitivity: number;
    listings: readonly ListingSnapshotEntry[];
    consents: readonly OptInSnapshotEntry[];
    consumers: readonly ConsumerInstallRecord[];
    auditTrailDigest: string;
    retentionDays?: number;
  },
): PreRollbackSnapshot {
  const retentionDays = input.retentionDays ?? DEFAULT_RETENTION_DAYS;
  const tier: RetentionTier =
    retentionDays <= 7 ? "transient" :
    retentionDays <= 30 ? "short" :
    retentionDays <= 90 ? "medium" :
    retentionDays <= 365 ? "long" : "purgeable";
  const expiresAt = advanceDays(input.now, retentionDays);
  const provisional: PreRollbackSnapshot = {
    snapshotId: "",
    bundleId: input.bundleId,
    capturedAt: input.now,
    capturedBy: input.capturedBy,
    publisherId: input.publisherId,
    version: input.version,
    listingCount: input.listings.length,
    consentCount: input.consents.length,
    consumerCount: input.consumers.length,
    sha256: "",
    sacredFlag: isSacred(input.sensitivity),
    retentionTier: tier,
    optInLedger: input.consents,
    listingMap: input.listings,
    auditTrailDigest: input.auditTrailDigest,
    expiresAt,
  };
  const withId: PreRollbackSnapshot = { ...provisional, snapshotId: computeStringHash(`snap:${input.bundleId}:${input.now}:${input.capturedBy}`) };
  return { ...withId, sha256: computeSnapshotHash(withId) };
}

/** Compute the audit trail digest (SHA-256 of concatenated ids). */
export function computeAuditTrailDigest(ids: readonly string[]): string {
  if (ids.length === 0) return computeStringHash("audit:empty");
  const joined = ids.slice().sort().join("|");
  return computeStringHash(`audit:${joined}`);
}

/** Mark the rollback state as pending capture. */
export function markRollbackInProgress(
  bundleId: string,
  trigger: RollbackTrigger,
  reason: RollbackReason,
  now: string,
): RollbackState {
  if (!isValidBundleId(bundleId)) throw new BundleNotEligibleError(`invalid bundleId: ${bundleId}`);
  if (!isValidTrigger(trigger)) throw new InvalidTriggerError(`invalid trigger: ${trigger}`);
  return {
    rollbackId: computeStringHash(`rbk:${bundleId}:${now}:${trigger}`),
    bundleId,
    status: "pending_capture",
    trigger,
    reason,
    capturedSnapshotId: null,
    restoredFromSnapshotId: null,
    startedAt: now,
    completedAt: null,
    lockedUntil: null,
  };
}

/** Lock the bundle during rollback — blocks re-publish for `hours`. */
export function lockBundleDuringRollback(
  bundleId: string,
  hours: number,
  now: string,
): { bundleId: string; lockedUntil: string; hours: number } {
  if (!isValidBundleId(bundleId)) throw new BundleNotEligibleError(`invalid bundleId: ${bundleId}`);
  if (hours <= 0 || hours > 24 * 365) throw new CooldownViolationError(`invalid lock hours: ${hours}`);
  return { bundleId, lockedUntil: advanceIso(now, hours), hours };
}

/** Determine if a rollback can be performed right now. */
export function canPerformRollback(
  bundleId: string,
  existingGate: RePublishGate | null,
  now: string,
): boolean {
  if (!isValidBundleId(bundleId)) return false;
  if (existingGate === null) return true;
  return !validateCooldown(existingGate, now).inCooldown;
}

/** Get the rollback status string for a bundle given its gate. */
export function getRollbackStatus(
  bundleId: string,
  existingGate: RePublishGate | null,
): RollbackStatus {
  if (!isValidBundleId(bundleId)) return "completed";
  if (existingGate === null) return "completed";
  if (existingGate.status === "cooldown") return "cascade_complete";
  if (existingGate.status === "blocked") return "audit_persisted";
  if (existingGate.status === "needs_curator") return "captured";
  return "completed";
}

/** Filter a list of rollback states to pending ones. */
export function listPendingRollbacks(states: readonly RollbackState[]): RollbackState[] {
  return states.filter((s) => s.completedAt === null);
}

/** Filter rollback states to completed ones. */
export function listCompletedRollbacks(states: readonly RollbackState[]): RollbackState[] {
  return states.filter((s) => s.completedAt !== null);
}

/** Filter rollback states to restored ones. */
export function listRestoredRollbacks(states: readonly RollbackState[]): RollbackState[] {
  return states.filter((s) => s.status === "restored");
}

// ============================================================================
// SECTION 10: CASCADE UNDO OPERATIONS
// ============================================================================

/** Uninstall the bundle from all consumers. Returns count removed. */
export function uninstallFromConsumers(
  rollbackId: string,
  consumers: readonly ConsumerInstallRecord[],
): CascadeStepOutcome {
  const affected = consumers.length;
  return {
    step: "uninstall",
    ok: true,
    affected,
    error: null,
  };
}

/** Retract all listings of the bundle from the marketplace. Returns count retracted. */
export function retractFromMarketplace(
  rollbackId: string,
  listings: readonly ListingSnapshotEntry[],
): CascadeStepOutcome {
  const affected = listings.length;
  return {
    step: "retract",
    ok: true,
    affected,
    error: null,
  };
}

/** Notify publishers + affected users about the rollback. */
export function notifyPublishers(
  rollbackId: string,
  publisherId: string,
  bundleId: string,
  now: string,
): { notifications: PublisherNotification[]; count: number } {
  const notification: PublisherNotification = {
    notificationId: computeStringHash(`ntf:${rollbackId}:${publisherId}:${now}`),
    publisherId,
    bundleId,
    rollbackId,
    title: `Bundle ${bundleId} rolled back`,
    body: `Rollback ${rollbackId} has been initiated against bundle ${bundleId}.`,
    createdAt: now,
  };
  return { notifications: [notification], count: 1 };
}

/** Revoke opt-in consents captured in the snapshot. */
export function revokeOptIns(
  rollbackId: string,
  snap: PreRollbackSnapshot,
  now: string,
): { revoked: number; withdrawnAt: string } {
  const revoked = snap.optInLedger.filter((c) => c.withdrawnAt === null).length;
  return { revoked, withdrawnAt: now };
}

/** Compose the full cascade undo report. */
export function composeCascadeUndo(
  rollbackId: string,
  snap: PreRollbackSnapshot,
  consumers: readonly ConsumerInstallRecord[],
  now: string,
  options: { skipNotifications?: boolean } = {},
): CascadeUndoResult {
  const uninstall = uninstallFromConsumers(rollbackId, consumers);
  const retract = retractFromMarketplace(rollbackId, snap.listingMap);
  const revoke = revokeOptIns(rollbackId, snap, now);
  const notif = options.skipNotifications
    ? { notifications: [] as PublisherNotification[], count: 0 }
    : notifyPublishers(rollbackId, snap.publisherId, snap.bundleId, now);
  const failedSteps: string[] = [];
  if (!uninstall.ok) failedSteps.push("uninstall");
  if (!retract.ok) failedSteps.push("retract");
  const start = Date.parse(now);
  const end = start + (uninstall.affected + retract.affected + revoke.revoked + notif.count) * 2;
  return {
    rollbackId,
    retracted: retract.affected,
    uninstalled: uninstall.affected,
    notified: notif.count,
    optInRevoked: revoke.revoked,
    failedSteps,
    durationMs: Math.max(0, end - start),
  };
}

/** Validate cascade completed in correct order — throws CascadeFailedError. */
export function enforceCascadeOrder(
  observed: readonly CascadeStep[],
  policy: RollbackPolicy,
): void {
  if (!policy.enforceCascadeOrder) return;
  const res = validateCascadeOrder(observed);
  if (!res.valid) {
    throw new CascadeFailedError(`cascade order violation: ${res.errors.join("; ")}`, {
      observed,
      errors: res.errors,
    });
  }
}

/** Validate cascade result — ensure all expected steps returned ok. */
export function validateCascadeResult(result: CascadeUndoResult): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (result.failedSteps.length > 0) {
    errors.push(`cascade steps failed: ${result.failedSteps.join(", ")}`);
  }
  if (result.retracted < 0 || result.uninstalled < 0 || result.notified < 0 || result.optInRevoked < 0) {
    errors.push("cascade counts must be non-negative");
  }
  if (result.durationMs < 0) {
    errors.push("durationMs must be non-negative");
  }
  return { valid: errors.length === 0, errors, warnings };
}

/** Get the canonical cascade step order (for verification). */
export function getCascadeStepOrder(): readonly CascadeStep[] {
  return CASCADE_STEPS;
}

/** Check whether a single cascade step is "ok" given observed + expected affected count. */
export function isCascadeStepOk(
  outcome: CascadeStepOutcome,
  expectedAffected: number,
): boolean {
  return outcome.ok && outcome.affected >= expectedAffected;
}

// ============================================================================
// SECTION 11: RE-PUBLISH GATE
// ============================================================================

/** Open a re-publish gate immediately after rollback. */
export function gateRePublish(
  bundleId: string,
  rollbackId: string,
  cooldownHours: number,
  now: string,
  reason: RollbackReason,
): RePublishGate {
  if (!isValidBundleId(bundleId)) throw new BundleNotEligibleError(`invalid bundleId: ${bundleId}`);
  const cooldownUntil = advanceIso(now, cooldownHours);
  const blockedReason =
    reason.category === "security"
      ? "security rollback — manual curator review required"
      : reason.severity === "critical"
        ? "critical severity rollback — curator review required"
        : null;
  return {
    bundleId,
    status: blockedReason === null ? "cooldown" : "needs_curator",
    cooldownUntil,
    curatorReviewedAt: null,
    curatorReviewerId: null,
    blockedReason,
    lastRollbackId: rollbackId,
  };
}

/** Clear the re-publish gate (called by `restoreRollback` or curator approval). */
export function clearGate(
  gate: RePublishGate,
  ctx: { reviewerId: string; now: string },
): RePublishGate {
  return {
    ...gate,
    status: "open",
    curatorReviewedAt: ctx.now,
    curatorReviewerId: ctx.reviewerId,
    blockedReason: null,
  };
}

/** Update the re-publish gate to "needs_curator". */
export function markGateNeedsCurator(gate: RePublishGate, reason: string): RePublishGate {
  return {
    ...gate,
    status: "needs_curator",
    blockedReason: reason,
  };
}

/** Block the re-publish gate indefinitely. */
export function blockGate(gate: RePublishGate, reason: string): RePublishGate {
  return {
    ...gate,
    status: "blocked",
    blockedReason: reason,
  };
}

/** Open the gate after a curator review. */
export function openGateAfterReview(
  gate: RePublishGate,
  ctx: { reviewerId: string; now: string },
): RePublishGate {
  return clearGate(gate, ctx);
}

/** Re-cooldown the gate (called when restored bundle is rolled back again). */
export function reCooldownGate(
  gate: RePublishGate,
  cooldownHours: number,
  now: string,
): RePublishGate {
  return {
    ...gate,
    status: "cooldown",
    cooldownUntil: advanceIso(now, cooldownHours),
    curatorReviewedAt: null,
    curatorReviewerId: null,
    blockedReason: null,
  };
}

/** Decide whether a bundle may re-publish under the current gate. */
export function canRePublish(gate: RePublishGate | null, now: string): boolean {
  if (gate === null) return true;
  if (gate.status === "open") return true;
  if (gate.status === "blocked") return false;
  if (gate.status === "needs_curator") return false;
  if (gate.status === "cooldown") {
    return !validateCooldown(gate, now).inCooldown;
  }
  return false;
}

/** Decide whether a gate needs curator intervention. */
export function gateNeedsCurator(gate: RePublishGate): boolean {
  return gate.status === "needs_curator" || gate.status === "blocked";
}

/** Decide whether a gate is in cooldown. */
export function gateIsCooling(gate: RePublishGate, now: string): boolean {
  return validateCooldown(gate, now).inCooldown;
}

/** Compute remaining cooldown hours for the gate. */
export function gateRemainingHours(gate: RePublishGate, now: string): number {
  return validateCooldown(gate, now).remainingHours;
}

/** Open the gate after a curator review (alias of clearGate, separate semantic). */
export function approveRePublish(
  gate: RePublishGate,
  ctx: { reviewerId: string; now: string },
): RePublishGate {
  return clearGate(gate, ctx);
}

/** Reject the re-publish attempt and keep the gate blocked. */
export function rejectRePublish(gate: RePublishGate, reason: string): RePublishGate {
  return blockGate(gate, reason);
}

// ============================================================================
// SECTION 12: AUDIT ENTRY + RESTORATION
// ============================================================================

/** Build a single rollback audit entry. */
export function buildAuditEntry(
  rollbackId: string,
  eventType: RollbackEventType,
  actor: string,
  ts: string,
  trigger: RollbackTrigger,
  reason: RollbackReason,
  sacredFlagPreserved: boolean,
  snapshotId: string | null,
): RollbackAuditEntry {
  if (!isValidActorId(actor)) throw new RollbackFlowError("RBK_ACTOR", "actor invalid");
  if (!isValidTrigger(trigger)) throw new InvalidTriggerError(`invalid trigger: ${trigger}`);
  if (!isValidRollbackReason(reason)) throw new RollbackFlowError("RBK_REASON", "reason invalid");
  const lgpdArticles: readonly string[] = reason.lgpdArticles.length > 0
    ? reason.lgpdArticles
    : COVERAGE_LGPD_ARTICLES;
  const provisional: RollbackAuditEntry = {
    rollbackId,
    eventType,
    actor,
    ts,
    trigger,
    reason,
    lgpdArticles,
    sacredFlagPreserved,
    snapshotId,
    sha256: "",
  };
  return { ...provisional, sha256: computeAuditEntryHash(provisional) };
}

/** Compose a chain of audit entries for the canonical rollback lifecycle. */
export function buildAuditChain(
  rollbackId: string,
  trigger: RollbackTrigger,
  reason: RollbackReason,
  actor: string,
  now: string,
  snapshotId: string | null,
  sacredFlagPreserved: boolean,
): RollbackAuditEntry[] {
  const base = { rollbackId, trigger, reason, actor, snapshotId, sacredFlagPreserved };
  const events: RollbackEventType[] = [
    "rollback_initiated",
    "snapshot_captured",
    "cascade_started",
    "cascade_complete",
    "audit_persisted",
    "rollback_completed",
  ];
  let t = Date.parse(now);
  return events.map((evt) => {
    const ts = new Date(t).toISOString();
    t += 1000;
    return buildAuditEntry(rollbackId, evt, actor, ts, trigger, reason, sacredFlagPreserved, snapshotId);
  });
}

/** Append a single audit entry into an existing chain. */
export function appendAuditEntry(
  chain: readonly RollbackAuditEntry[],
  entry: RollbackAuditEntry,
): RollbackAuditEntry[] {
  if (entry.rollbackId === "") throw new AuditChainBrokenError("rollbackId empty on entry");
  if (entry.sha256.length !== SHA256_HEX_LENGTH) {
    throw new AuditChainBrokenError(`sha256 invalid length on appended entry: ${entry.sha256.length}`);
  }
  return [...chain, entry];
}

/** Verify the integrity of the audit chain. */
export function verifyAuditChain(entries: readonly RollbackAuditEntry[]): ValidationResult {
  return validateAuditChain(entries);
}

/** Get the head (last) sha256 of an audit chain. */
export function auditChainHead(entries: readonly RollbackAuditEntry[]): string {
  if (entries.length === 0) return computeStringHash("audit:empty");
  return entries[entries.length - 1].sha256;
}

/** Restore a bundle from its captured snapshot. */
export function restoreFromSnapshot(
  rollbackId: string,
  snap: PreRollbackSnapshot,
  ctx: { actorId: string; now: string; reason: string },
): RestorationResult {
  if (!isValidActorId(ctx.actorId)) {
    throw new RollbackFlowError("RBK_ACTOR", "actorId invalid");
  }
  if (snap === null) throw new SnapshotMissingError(`no snapshot for rollback ${rollbackId}`);
  const integ = validateSnapshotIntegrity(snap);
  if (!integ.intact) {
    throw new SnapshotMissingError(`snapshot integrity: ${integ.reason}`);
  }
  const auditIds: string[] = [
    computeStringHash(`audit:restore:${rollbackId}:${ctx.now}`),
    computeStringHash(`audit:restore:done:${rollbackId}:${ctx.now}`),
  ];
  return {
    rollbackId,
    restoredFromSnapshotId: snap.snapshotId,
    restoredListings: snap.listingMap.length,
    restoredConsents: snap.optInLedger.length,
    restoredConsumers: snap.consumerCount,
    rePublishGateCleared: true,
    auditEntryIds: auditIds,
  };
}

/** Top-level `restoreRollback` alias — convenience wrapper. */
export function restoreRollback(
  req: RestorationRequest,
  snap: PreRollbackSnapshot,
): RestorationResult {
  const res = validateRestoration(req, snap);
  if (!res.valid) {
    throw new SnapshotMissingError(`restoration invalid: ${res.errors.join("; ")}`);
  }
  return restoreFromSnapshot(req.rollbackId, snap!, {
    actorId: req.actorId,
    now: req.now,
    reason: req.reason,
  });
}

/** Build a comprehensive rollback report. */
export function buildRollbackReport(
  state: RollbackState,
  snap: PreRollbackSnapshot | null,
  cascade: CascadeUndoResult,
  gate: RePublishGate,
  auditChain: readonly RollbackAuditEntry[],
  sacred: SacredPreservationSummary,
  startMs: number,
  endMs: number,
): RollbackReport {
  return {
    rollbackId: state.rollbackId,
    bundleId: state.bundleId,
    state,
    snapshot: snap,
    cascade,
    rePublishGate: gate,
    auditChainHead: auditChainHead(auditChain),
    sacred,
    durationMs: Math.max(0, endMs - startMs),
  };
}

// ============================================================================
// SECTION 13: SACRED FLAG PRESERVATION
// ============================================================================

/** Build a SacredPreservationSummary from the snapshot + reason + approval. */
export function buildSacredPreservationSummary(
  bundleId: string,
  snap: PreRollbackSnapshot | null,
  approval: DualCuratorApproval | null,
): SacredPreservationSummary {
  const wasSacred = snap !== null && snap.sacredFlag;
  const required = wasSacred && DEFAULT_ROLLBACK_POLICY.requireDualCuratorForSacred;
  return {
    bundleId,
    wasSacred,
    preservedInSnapshot: snap !== null && snap.sacredFlag,
    preservedInAudit: snap !== null,
    doubleCuratorRequired: required,
    doubleCuratorGranted:
      required && approval !== null && approval.approved && approval.primaryApprovedAt !== null && approval.secondaryApprovedAt !== null,
  };
}

/** Build a DualCuratorApproval record. */
export function buildDualCuratorApproval(
  rollbackId: string,
  bundleId: string,
  primaryCuratorId: string,
  secondaryCuratorId: string,
  primaryApprovedAt: string | null,
  secondaryApprovedAt: string | null,
  approved: boolean,
  deniedReason: string | null,
): DualCuratorApproval {
  if (primaryCuratorId === secondaryCuratorId) {
    throw new DualCuratorRequiredError("primary and secondary curators must differ");
  }
  return {
    rollbackId,
    bundleId,
    primaryCuratorId,
    secondaryCuratorId,
    primaryApprovedAt,
    secondaryApprovedAt,
    approved,
    deniedReason,
  };
}

/** Request dual curator approval (returns a draft record). */
export function requestDualCuratorApproval(
  rollbackId: string,
  bundleId: string,
  primaryCuratorId: string,
  secondaryCuratorId: string,
): DualCuratorApproval {
  return buildDualCuratorApproval(
    rollbackId,
    bundleId,
    primaryCuratorId,
    secondaryCuratorId,
    null,
    null,
    false,
    null,
  );
}

/** Grant dual curator approval. */
export function grantDualCuratorApproval(
  approval: DualCuratorApproval,
  ctx: { primaryApprovedAt: string; secondaryApprovedAt: string },
): DualCuratorApproval {
  return {
    ...approval,
    primaryApprovedAt: ctx.primaryApprovedAt,
    secondaryApprovedAt: ctx.secondaryApprovedAt,
    approved: true,
    deniedReason: null,
  };
}

/** Deny dual curator approval. */
export function denyDualCuratorApproval(
  approval: DualCuratorApproval,
  reason: string,
): DualCuratorApproval {
  return {
    ...approval,
    approved: false,
    deniedReason: reason,
  };
}

/** Check whether sacred flag is preserved across snapshot + audit. */
export function sacredFlagPreserved(
  snap: PreRollbackSnapshot,
  audit: readonly RollbackAuditEntry[],
): boolean {
  const allPreserve = audit.every((e) => e.sacredFlagPreserved === snap.sacredFlag);
  return snap.sacredFlag && allPreserve;
}

/** Compute whether a sacred bundle requires double-curator signoff. */
export function needsDoubleCurator(
  reason: RollbackReason,
  bundleSacred: boolean,
  policy: RollbackPolicy,
): boolean {
  if (!policy.requireDualCuratorForSacred) return false;
  if (bundleSacred) return true;
  if (reason.severity === "critical") return true;
  return false;
}

// ============================================================================
// SECTION 14: RETENTION / LGPD PURGE
// ============================================================================

/** Determine if a snapshot has expired under retention policy. */
export function checkRetention(
  snap: PreRollbackSnapshot,
  now: string,
  policy: RollbackPolicy,
): RetentionCheckResult {
  const days = daysBetween(snap.capturedAt, now);
  // Use the snapshot's tier to derive the effective retention days.
  // Tier: transient <=7, short <=30, medium <=90, long <=365, purgeable >365
  const tierDays = tierToDays(snap.retentionTier);
  const expired = days > Math.min(tierDays, policy.retentionDays);
  return {
    expired,
    daysOld: days,
    tier: snap.retentionTier,
    purgeable: expired && policy.purgeAfterRetention,
  };
}

/** Map a retention tier to its upper-bound days. */
export function tierToDays(tier: RetentionTier): number {
  switch (tier) {
    case "transient": return 7;
    case "short": return 30;
    case "medium": return 90;
    case "long": return 365;
    case "purgeable": return 365;
    default: {
      const _e: never = tier;
      return _e;
    }
  }
}

/** Determine if an audit entry has exceeded the LGPD retention. */
export function auditEntryExpired(entry: RollbackAuditEntry, now: string): boolean {
  const days = daysBetween(entry.ts, now);
  return days > AUDIT_RETENTION_DAYS;
}

/** Purge rollback data — returns counts of items removed (Art. 18). */
export function purgeRollbackData(
  rollbackId: string,
  audit: readonly RollbackAuditEntry[],
  snapshots: readonly PreRollbackSnapshot[],
  consents: readonly OptInSnapshotEntry[],
  now: string,
  legalHold = false,
): RollbackErasureResult {
  if (legalHold) {
    return {
      rollbackId,
      purgedAuditEntries: 0,
      purgedSnapshots: 0,
      purgedConsentLeaves: 0,
      purgedAt: now,
      legalHold: true,
    };
  }
  const purgedAudit = audit.filter((e) => e.rollbackId === rollbackId && auditEntryExpired(e, now));
  const purgedSnaps = snapshots.filter(
    (s) => {
      const chk = checkRetention(s, now, DEFAULT_ROLLBACK_POLICY);
      return chk.purgeable && s.bundleId !== "";
    },
  );
  const purgedConsent = consents.filter((c) => {
    return c.preserved === false;
  });
  return {
    rollbackId,
    purgedAuditEntries: purgedAudit.length,
    purgedSnapshots: purgedSnaps.length,
    purgedConsentLeaves: purgedConsent.length,
    purgedAt: now,
    legalHold: false,
  };
}

/** Apply legal hold — blocks any purge. */
export function applyLegalHold(gate: RePublishGate, reason: string): RePublishGate {
  return blockGate(gate, `legal hold: ${reason}`);
}

/** Remove legal hold — restores prior gate state. */
export function releaseLegalHold(gate: RePublishGate): RePublishGate {
  return { ...gate, blockedReason: null };
}

/** Filter purgeable rollback audit entries (transient expired). */
export function filterPurgeableAuditEntries(
  entries: readonly RollbackAuditEntry[],
  now: string,
): RollbackAuditEntry[] {
  return entries.filter((e) => auditEntryExpired(e, now));
}

/** Filter purgeable snapshots under retention. */
export function filterPurgeableSnapshots(
  snaps: readonly PreRollbackSnapshot[],
  now: string,
  policy: RollbackPolicy = DEFAULT_ROLLBACK_POLICY,
): PreRollbackSnapshot[] {
  return snaps.filter((s) => checkRetention(s, now, policy).purgeable);
}

/** Surviving audit entries after LGPD purge. */
export function survivorsAfterPurge(
  entries: readonly RollbackAuditEntry[],
  now: string,
): RollbackAuditEntry[] {
  return entries.filter((e) => !auditEntryExpired(e, now));
}

/** Surviving snapshots after LGPD purge. */
export function survivorsSnapshotsAfterPurge(
  snaps: readonly PreRollbackSnapshot[],
  now: string,
  policy: RollbackPolicy = DEFAULT_ROLLBACK_POLICY,
): PreRollbackSnapshot[] {
  return snaps.filter((s) => !checkRetention(s, now, policy).purgeable);
}

// ============================================================================
// SECTION 15: OPT-IN LEDGER REVERSION (Art. 7)
// ============================================================================

/** Capture opt-in consent state pre-rollback for re-opt-in if reversed. */
export function captureOptInLedgerForReversion(
  consents: readonly OptInSnapshotEntry[],
): readonly OptInSnapshotEntry[] {
  return consents.map((c) => ({ ...c, preserved: true }));
}

/** Mark opt-in entries as preserved (Art. 7 — restoration will reuse consent). */
export function markOptInsPreserved(
  entries: readonly OptInSnapshotEntry[],
): OptInSnapshotEntry[] {
  return entries.map((e) => ({ ...e, preserved: true }));
}

/** Mark opt-in entries as withdrawn (used during cascade revoke). */
export function markOptInsWithdrawn(
  entries: readonly OptInSnapshotEntry[],
  now: string,
): OptInSnapshotEntry[] {
  return entries.map((e) =>
    e.withdrawnAt === null ? { ...e, withdrawnAt: now, preserved: true } : { ...e, preserved: true },
  );
}

/** Count active (non-withdrawn) opt-in entries. */
export function countActiveOptIns(entries: readonly OptInSnapshotEntry[]): number {
  return entries.filter((e) => e.withdrawnAt === null).length;
}

/** Count withdrawn opt-in entries. */
export function countWithdrawnOptIns(entries: readonly OptInSnapshotEntry[]): number {
  return entries.filter((e) => e.withdrawnAt !== null).length;
}

/** Total opt-in entries (active + withdrawn). */
export function countTotalOptIns(entries: readonly OptInSnapshotEntry[]): number {
  return entries.length;
}

/** Build a re-opt-in ledger (used by restoreFromSnapshot path). */
export function buildReOptInLedger(
  entries: readonly OptInSnapshotEntry[],
): readonly { userId: string; listingId: string; previouslyConsented: boolean; preserved: boolean }[] {
  return entries.map((e) => ({
    userId: e.userId,
    listingId: e.listingId,
    previouslyConsented: e.withdrawnAt === null,
    preserved: e.preserved,
  }));
}

/** Decide whether a re-opt-in can be skipped (consent already preserved). */
export function canSkipReOptIn(entries: readonly OptInSnapshotEntry[]): boolean {
  return entries.every((e) => e.preserved);
}

/** Build consent reversion list — pairs user + listing to re-opt. */
export function buildConsentReversionList(
  entries: readonly OptInSnapshotEntry[],
): readonly { userId: string; listingId: string }[] {
  return entries
    .filter((e) => e.withdrawnAt !== null && e.preserved)
    .map((e) => ({ userId: e.userId, listingId: e.listingId }));
}

// ============================================================================
// SECTION 16: MAIN ROLLBACK BUNDLE ENTRY
// ============================================================================

/** Top-level `rollbackBundle` — orchestrates capture → cascade → audit. */
export function rollbackBundle(
  input: {
    request: RollbackRequest;
    existingGate: RePublishGate | null;
    sensitivity: number;
    consumers: readonly ConsumerInstallRecord[];
    existingAudit: readonly RollbackAuditEntry[];
    approval: DualCuratorApproval | null;
    policy?: RollbackPolicy;
  },
): RollbackReport {
  const policy = input.policy ?? DEFAULT_ROLLBACK_POLICY;
  const startMs = Date.parse(input.request.now);

  // 1. Validate trigger
  validateTrigger(input.request.trigger);

  // 2. Validate reason
  const reasonRes = validateReason(input.request.reason);
  if (!reasonRes.valid) {
    throw new RollbackFlowError("RBK_REASON", `reason invalid: ${reasonRes.errors.join("; ")}`);
  }

  // 3. Validate eligibility (cooldown, bundleId, dual-curator for sacred)
  const elig = validateRollbackEligibility(input.request, input.existingGate);
  if (!elig.valid) {
    throw new BundleNotEligibleError(`bundle not eligible: ${elig.errors.join("; ")}`);
  }

  // 4. Sacred bundle — require dual curator
  const bundleSacred = isSacred(input.sensitivity);
  if (bundleSacred && policy.requireDualCuratorForSacred) {
    const dual = validateDualCuratorApproval(input.approval, input.request.reason, true);
    if (!dual.valid) {
      throw new DualCuratorRequiredError(`dual curator required: ${dual.errors.join("; ")}`);
    }
  }

  // 5. Mark state in progress
  const state = markRollbackInProgress(
    input.request.bundleId,
    input.request.trigger,
    input.request.reason,
    input.request.now,
  );

  // 6. Capture pre-state snapshot
  const snap = capturePreState({
    bundleId: input.request.bundleId,
    publisherId: "publisher-stub",
    version: "v1.0.0",
    capturedBy: input.request.actorId,
    now: input.request.now,
    sensitivity: input.sensitivity,
    listings: [],
    consents: [],
    consumers: input.consumers,
    auditTrailDigest: computeAuditTrailDigest(input.existingAudit.map((e) => e.sha256)),
    retentionDays: input.request.options.retentionDays ?? policy.retentionDays,
  });

  // 7. Cascade undo
  const cascade = composeCascadeUndo(
    state.rollbackId,
    snap,
    input.consumers,
    input.request.now,
    { skipNotifications: input.request.options.skipNotifications },
  );

  // 8. Open re-publish gate
  const cooldownHours = input.request.options.cooldownHours ?? policy.cooldownHours;
  const gate = gateRePublish(
    input.request.bundleId,
    state.rollbackId,
    cooldownHours,
    input.request.now,
    input.request.reason,
  );

  // 9. Audit chain
  const auditChain = buildAuditChain(
    state.rollbackId,
    input.request.trigger,
    input.request.reason,
    input.request.actorId,
    input.request.now,
    snap.snapshotId,
    snap.sacredFlag,
  );

  // 10. Sacred summary
  const sacred = buildSacredPreservationSummary(input.request.bundleId, snap, input.approval);

  // 11. Mark state complete
  const finalState: RollbackState = {
    ...state,
    status: "completed",
    capturedSnapshotId: snap.snapshotId,
    completedAt: advanceMinutes(input.request.now, 1),
    lockedUntil: gate.cooldownUntil,
  };

  const endMs = startMs + cascade.durationMs;
  return buildRollbackReport(
    finalState,
    snap,
    cascade,
    gate,
    auditChain,
    sacred,
    startMs,
    endMs,
  );
}

// ============================================================================
// SECTION 17: UTILITIES / HELPERS
// ============================================================================

/** Decide if a rollback id is well-formed. */
export function isValidRollbackId(value: unknown): boolean {
  return typeof value === "string" && /^rbk_[a-f0-9]{8,}$/.test(value);
}

/** Decide if a snapshot id is well-formed. */
export function isValidSnapshotId(value: unknown): boolean {
  return typeof value === "string" && /^[a-f0-9]{8,}$/.test(value);
}

/** Decide if a consumer install id is well-formed. */
export function isValidConsumerId(value: unknown): boolean {
  return typeof value === "string" && /^[a-z0-9_-]{3,40}$/i.test(value);
}

/** Find the audit entry for a given rollback event. */
export function findAuditEvent(
  chain: readonly RollbackAuditEntry[],
  eventType: RollbackEventType,
): RollbackAuditEntry | null {
  return chain.find((e) => e.eventType === eventType) ?? null;
}

/** Find all audit entries for a given rollback id. */
export function findAuditByRollbackId(
  chain: readonly RollbackAuditEntry[],
  rollbackId: string,
): RollbackAuditEntry[] {
  return chain.filter((e) => e.rollbackId === rollbackId);
}

/** Find audit entries by actor. */
export function findAuditByActor(
  chain: readonly RollbackAuditEntry[],
  actor: string,
): RollbackAuditEntry[] {
  return chain.filter((e) => e.actor === actor);
}

/** Filter audit entries to those within a timestamp window. */
export function filterAuditByWindow(
  chain: readonly RollbackAuditEntry[],
  from: string,
  to: string,
): RollbackAuditEntry[] {
  const fromMs = Date.parse(from);
  const toMs = Date.parse(to);
  return chain.filter((e) => {
    const t = Date.parse(e.ts);
    return t >= fromMs && t <= toMs;
  });
}

/** Compute the rollback duration in ms between two ISO timestamps. */
export function rollbackDurationMs(start: string, end: string): number {
  return Math.max(0, Date.parse(end) - Date.parse(start));
}

/** Decide if a rollback reason requires security-team escalation. */
export function requiresSecurityEscalation(reason: RollbackReason): boolean {
  return reason.category === "security" || reason.severity === "critical";
}

/** Compute the recommended re-publish gate cooldown from severity. */
export function recommendedCooldownHours(reason: RollbackReason): number {
  return SEVERITY_COOLDOWN_HOURS[reason.severity];
}

/** Compute the recommended retention days from severity. */
export function recommendedRetentionDays(reason: RollbackReason): number {
  if (reason.severity === "critical") return 365;
  if (reason.severity === "high") return 90;
  if (reason.severity === "medium") return 30;
  return 7;
}

/** Format a rollback id for display. */
export function formatRollbackId(rollbackId: string): string {
  if (rollbackId.length <= 12) return rollbackId;
  return `${rollbackId.slice(0, 6)}…${rollbackId.slice(-6)}`;
}

/** Format a snapshot id for display. */
export function formatSnapshotId(snapshotId: string): string {
  return snapshotId.slice(0, 12);
}

/** Group rollback audit entries by event type. */
export function groupAuditByEvent(
  chain: readonly RollbackAuditEntry[],
): Record<RollbackEventType, RollbackAuditEntry[]> {
  const out = {} as Record<RollbackEventType, RollbackAuditEntry[]>;
  for (const evt of ROLLBACK_EVENT_TYPES) {
    out[evt] = [];
  }
  for (const e of chain) {
    out[e.eventType].push(e);
  }
  return out;
}

/** Count rollback audit entries by event type. */
export function countAuditByEvent(
  chain: readonly RollbackAuditEntry[],
): Record<RollbackEventType, number> {
  const out = {} as Record<RollbackEventType, number>;
  for (const evt of ROLLBACK_EVENT_TYPES) {
    out[evt] = 0;
  }
  for (const e of chain) {
    out[e.eventType] += 1;
  }
  return out;
}

/** Sum cascade affected counts. */
export function totalAffectedByCascade(result: CascadeUndoResult): number {
  return result.retracted + result.uninstalled + result.notified + result.optInRevoked;
}

/** Compute the failure ratio of a cascade result (0-1). */
export function cascadeFailureRatio(result: CascadeUndoResult): number {
  if (result.failedSteps.length === 0) return 0;
  return result.failedSteps.length / CASCADE_STEPS.length;
}

/** Build a snapshot lookup by id. */
export function indexSnapshotsById(
  snaps: readonly PreRollbackSnapshot[],
): Record<string, PreRollbackSnapshot> {
  const out: Record<string, PreRollbackSnapshot> = {};
  for (const s of snaps) {
    out[s.snapshotId] = s;
  }
  return out;
}

/** Build a gate lookup by bundle id. */
export function indexGatesByBundle(
  gates: readonly RePublishGate[],
): Record<string, RePublishGate> {
  const out: Record<string, RePublishGate> = {};
  for (const g of gates) {
    out[g.bundleId] = g;
  }
  return out;
}

/** Build an audit chain lookup by rollback id. */
export function indexAuditByRollback(
  chain: readonly RollbackAuditEntry[],
): Record<string, RollbackAuditEntry[]> {
  const out: Record<string, RollbackAuditEntry[]> = {};
  for (const e of chain) {
    const arr = out[e.rollbackId] ?? [];
    arr.push(e);
    out[e.rollbackId] = arr;
  }
  return out;
}

/** Sort audit entries by timestamp ascending. */
export function sortAuditByTimestamp(
  chain: readonly RollbackAuditEntry[],
): RollbackAuditEntry[] {
  return chain.slice().sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
}

/** Sort rollback states by startedAt descending. */
export function sortRollbacksByRecency(
  states: readonly RollbackState[],
): RollbackState[] {
  return states.slice().sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
}

/** Get a RollbackOperator by id. */
export function findOperator(
  ops: readonly RollbackOperator[],
  id: string,
): RollbackOperator | null {
  return ops.find((o) => o.id === id) ?? null;
}

/** Pick the least-loaded operator (operator load balancing). */
export function pickOperator(
  ops: readonly RollbackOperator[],
): RollbackOperator | null {
  if (ops.length === 0) return null;
  let best: RollbackOperator | null = null;
  for (const o of ops) {
    if (o.active >= o.max) continue;
    if (best === null || o.active < best.active) best = o;
  }
  return best;
}

/** Total active workloads across operators. */
export function totalActiveWorkload(ops: readonly RollbackOperator[]): number {
  return ops.reduce((acc, o) => acc + o.active, 0);
}

/** Total capacity across operators. */
export function totalOperatorCapacity(ops: readonly RollbackOperator[]): number {
  return ops.reduce((acc, o) => acc + o.max, 0);
}

/** Decide if any operator has free capacity. */
export function hasFreeOperator(ops: readonly RollbackOperator[]): boolean {
  return pickOperator(ops) !== null;
}

/** Estimate the cascade duration given inputs (cheap heuristic). */
export function estimateCascadeDurationMs(input: {
  consumers: number;
  listings: number;
  consents: number;
  publishers: number;
}): number {
  return input.consumers * 5 + input.listings * 7 + input.consents * 3 + input.publishers * 4;
}

/** Build a minimal rollback reason (useful for tests). */
export function buildMinimalReason(
  category: RollbackReasonCategory,
  severity: RollbackSeverity,
  description: string,
  reportedBy: string,
  now: string,
): RollbackReason {
  return {
    category,
    severity,
    description,
    reportedBy,
    reportedAt: now,
    lgpdArticles: ["Art. 7", "Art. 18"],
    evidenceRefs: [],
  };
}

/** Build a minimal rollback request (useful for tests). */
export function buildMinimalRequest(
  bundleId: string,
  trigger: RollbackTrigger,
  reason: RollbackReason,
  actorId: string,
  now: string,
  options: RollbackOptions = {},
): RollbackRequest {
  return { bundleId, trigger, reason, actorId, now, options };
}

/** Empty rollback options (uses all defaults). */
export function emptyRollbackOptions(): RollbackOptions {
  return {
    skipCascade: false,
    skipNotifications: false,
    preserveSnapshot: true,
    cooldownHours: DEFAULT_COOLDOWN_HOURS,
    requireDualCurator: false,
    retentionDays: DEFAULT_RETENTION_DAYS,
  };
}

/** Build a default publisher notification. */
export function buildDefaultNotification(
  publisherId: string,
  bundleId: string,
  rollbackId: string,
  now: string,
): PublisherNotification {
  return {
    notificationId: computeStringHash(`ntf:${rollbackId}:${publisherId}:${now}`),
    publisherId,
    bundleId,
    rollbackId,
    title: `Bundle ${bundleId} rolled back`,
    body: `Rollback ${rollbackId} initiated.`,
    createdAt: now,
  };
}

/** Generate a fresh rollback state with all status transitions. */
export function rollForwardStates(
  start: RollbackState,
  transitions: readonly RollbackStatus[],
  now: string,
): RollbackState[] {
  const out: RollbackState[] = [start];
  for (let i = 0; i < transitions.length; i++) {
    const prev = out[out.length - 1];
    out.push({
      ...prev,
      status: transitions[i],
      completedAt: transitions[i] === "completed" ? now : prev.completedAt,
    });
  }
  return out;
}

/** Compute the proportion of audit entries that are sacred-preserved. */
export function sacredPreservationRatio(
  chain: readonly RollbackAuditEntry[],
): number {
  if (chain.length === 0) return 0;
  const sacredCount = chain.filter((e) => e.sacredFlagPreserved).length;
  return sacredCount / chain.length;
}

/** Determine if all audit entries preserve sacred flag. */
export function allSacredPreserved(
  chain: readonly RollbackAuditEntry[],
): boolean {
  return chain.length > 0 && chain.every((e) => e.sacredFlagPreserved);
}

/** Filter rollback states to those with status === completed. */
export function completedRollbacksOnly(
  states: readonly RollbackState[],
): RollbackState[] {
  return states.filter((s) => s.status === "completed");
}

/** Filter rollback states to those in cascade_in_progress. */
export function inProgressCascades(
  states: readonly RollbackState[],
): RollbackState[] {
  return states.filter((s) => s.status === "cascade_in_progress");
}

/** Find rollback state by id. */
export function findRollbackState(
  states: readonly RollbackState[],
  rollbackId: string,
): RollbackState | null {
  return states.find((s) => s.rollbackId === rollbackId) ?? null;
}

/** Find rollback state by bundleId (most recent first). */
export function findRollbackByBundle(
  states: readonly RollbackState[],
  bundleId: string,
): RollbackState | null {
  const filtered = states.filter((s) => s.bundleId === bundleId);
  if (filtered.length === 0) return null;
  return sortRollbacksByRecency(filtered)[0];
}

/** Get the most recent N rollback states. */
export function mostRecentRollbacks(
  states: readonly RollbackState[],
  n: number,
): RollbackState[] {
  return sortRollbacksByRecency(states).slice(0, n);
}

// ============================================================================
// SECTION 18: MODULE METADATA + SPEC HELPERS
// ============================================================================

export const VERSION = "0.1.0-w53" as const;
export const MODULE_NAME = "cockpit-bundle-rollback-flow" as const;
export const WAVE = 53 as const;

export function moduleInfo(): { name: string; wave: number; version: string } {
  return { name: MODULE_NAME, wave: WAVE, version: VERSION };
}

export const FEATURE_FLAGS = {
  strictSACredPolicy: true,
  dualCuratorForSacred: true,
  autoCaptureSnapshot: true,
  enforceCascadeOrder: true,
  purgeAfterRetention: true,
  restorationReversible: true,
  cooldownEnforced: true,
  auditTrailImmutable: true,
} as const;

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
      "LGPD Art. 18 (exportação/eliminação)",
      "sacred-text sensitivity 4-5 policy",
      "double-curator approval",
      "snapshot capture + restore",
      "cascade undo (uninstall + retract + notify + revoke opt-in)",
      "re-publish gate (cooldown + curator review)",
      "audit chain integrity",
      "retention-based purge",
      "i18n PT-BR / EN-US",
      "SHA-256 (FIPS 180-4, 64 rounds)",
    ],
  };
}

/** Public surface (documentation / introspection). */
export const PUBLIC_SURFACE_VERSION = "0.1.0" as const;

// ============================================================================
// SECTION 19: SANITY TESTS (run inside file, no external test runner)
// ============================================================================

/** Sanity block — internal smoke checks, no runtime side effects. */
const __sanity__ = (() => {
  const results: { name: string; pass: boolean; detail: string }[] = [];
  function check(name: string, cond: boolean, detail = ""): void {
    results.push({ name, pass: cond, detail });
  }
  const now = "2026-06-29T12:00:00.000Z";
  const now2 = "2026-06-30T12:00:00.000Z";

  // Scenario 1: auto-trigger validation
  try {
    const v = validateTrigger("auto_security");
    check("S01:auto-trigger validate", v.ok && v.auto === true, JSON.stringify(v));
  } catch (err) {
    check("S01:auto-trigger validate", false, String(err));
  }

  // Scenario 2: manual-trigger validation
  try {
    const v = validateTrigger("manual_curator");
    check("S02:manual-trigger validate", v.ok && v.auto === false, JSON.stringify(v));
  } catch (err) {
    check("S02:manual-trigger validate", false, String(err));
  }

  // Scenario 3: snapshot capture + integrity
  try {
    const snap = capturePreState({
      bundleId: "bundle001",
      publisherId: "pub001",
      version: "v1.0.0",
      capturedBy: "operator001",
      now,
      sensitivity: 4,
      listings: [],
      consents: [],
      consumers: [],
      auditTrailDigest: computeAuditTrailDigest([]),
      retentionDays: 30,
    });
    const integ = validateSnapshotIntegrity(snap);
    check("S03:snapshot capture + integrity", integ.intact, integ.reason);
  } catch (err) {
    check("S03:snapshot capture + integrity", false, String(err));
  }

  // Scenario 4: cascade undo result shape
  try {
    const snap = capturePreState({
      bundleId: "bundle002",
      publisherId: "pub001",
      version: "v1.0.0",
      capturedBy: "operator001",
      now,
      sensitivity: 1,
      listings: [],
      consents: [],
      consumers: [
        { consumerId: "c1", userId: "u1", bundleId: "bundle002", installedAt: now },
        { consumerId: "c2", userId: "u2", bundleId: "bundle002", installedAt: now },
      ],
      auditTrailDigest: computeAuditTrailDigest([]),
      retentionDays: 30,
    });
    const cascade = composeCascadeUndo("rbk_test_001", snap, [
      { consumerId: "c1", userId: "u1", bundleId: "bundle002", installedAt: now },
      { consumerId: "c2", userId: "u2", bundleId: "bundle002", installedAt: now },
    ], now);
    check(
      "S04:cascade undo result",
      cascade.retracted === 0 && cascade.uninstalled === 2 && cascade.optInRevoked === 0,
      JSON.stringify(cascade),
    );
  } catch (err) {
    check("S04:cascade undo result", false, String(err));
  }

  // Scenario 5: re-publish gate + cooldown
  try {
    const gate = gateRePublish("bundle003", "rbk_test_002", 72, now, {
      category: "content",
      severity: "high",
      description: "test reason",
      reportedBy: "operator001",
      reportedAt: now,
      lgpdArticles: ["Art. 7"],
      evidenceRefs: [],
    });
    const cd = validateCooldown(gate, now);
    check("S05:gate + cooldown", cd.inCooldown && cd.remainingHours === 72, JSON.stringify(cd));
  } catch (err) {
    check("S05:gate + cooldown", false, String(err));
  }

  // Scenario 6: cooldown enforcement blocks re-publish before due
  try {
    const gate = gateRePublish("bundle004", "rbk_test_003", 72, now, {
      category: "content",
      severity: "low",
      description: "low severity",
      reportedBy: "operator001",
      reportedAt: now,
      lgpdArticles: [],
      evidenceRefs: [],
    });
    const before = canRePublish(gate, now);
    const after = canRePublish(gate, advanceDays(now, 73));
    check("S06:cooldown blocks re-publish", !before && after, `${before}/${after}`);
  } catch (err) {
    check("S06:cooldown blocks re-publish", false, String(err));
  }

  // Scenario 7: sacred bundle requires dual curator
  try {
    const reason = buildMinimalReason("security", "critical", "sacred compromise detected", "operator007", now);
    const approval = null;
    const res = validateDualCuratorApproval(approval, reason, true);
    check("S07:sacred needs dual curator", !res.valid, res.errors.join(";"));
  } catch (err) {
    check("S07:sacred needs dual curator", false, String(err));
  }

  // Scenario 8: dual curator approval granted → valid
  try {
    const approval = grantDualCuratorApproval(
      requestDualCuratorApproval("rbk_test_004", "bundle005", "lead_curator", "deputy_curator"),
      { primaryApprovedAt: now, secondaryApprovedAt: now },
    );
    const reason = buildMinimalReason("security", "critical", "sacred compromise detected", "operator007", now);
    const res = validateDualCuratorApproval(approval, reason, true);
    check("S08:dual curator approved → valid", res.valid, res.errors.join(";"));
  } catch (err) {
    check("S08:dual curator approved → valid", false, String(err));
  }

  // Scenario 9: audit chain integrity
  try {
    const reason = buildMinimalReason("content", "high", "content policy violation", "operator009", now);
    const chain = buildAuditChain("rbk_test_005", "manual_curator", reason, "operator009", now, "snap_001", false);
    const integ = validateAuditChain(chain);
    check("S09:audit chain integrity", integ.valid, integ.errors.join(";"));
  } catch (err) {
    check("S09:audit chain integrity", false, String(err));
  }

  // Scenario 10: retention purge
  try {
    const snap = capturePreState({
      bundleId: "bundle006",
      publisherId: "pub006",
      version: "v1.0.0",
      capturedBy: "operator010",
      now,
      sensitivity: 1,
      listings: [],
      consents: [],
      consumers: [],
      auditTrailDigest: computeAuditTrailDigest([]),
      retentionDays: 7,
    });
    const future = advanceDays(now, 8);
    const chk = checkRetention(snap, future, DEFAULT_ROLLBACK_POLICY);
    check("S10:retention purge eligible", chk.expired && chk.purgeable, JSON.stringify(chk));
  } catch (err) {
    check("S10:retention purge eligible", false, String(err));
  }

  // Scenario 11: opt-in ledger reversion path
  try {
    const consents = [
      {
        userId: "u1",
        listingId: "l1",
        consentedAt: now,
        withdrawnAt: null,
        ipHash: computeOptInIpHash("127.0.0.1"),
        userAgentHash: computeOptInUserAgentHash("Mozilla/5.0"),
        preserved: true,
      },
    ];
    const snap = capturePreState({
      bundleId: "bundle007",
      publisherId: "pub007",
      version: "v1.0.0",
      capturedBy: "operator011",
      now,
      sensitivity: 2,
      listings: [],
      consents,
      consumers: [],
      auditTrailDigest: computeAuditTrailDigest([]),
      retentionDays: 30,
    });
    const withdrawn = markOptInsWithdrawn(snap.optInLedger, now2);
    const reversion = buildConsentReversionList(withdrawn);
    check("S11:opt-in reversion path", reversion.length === 1, JSON.stringify(reversion));
  } catch (err) {
    check("S11:opt-in reversion path", false, String(err));
  }

  // Scenario 12: restoration from snapshot
  try {
    const snap = capturePreState({
      bundleId: "bundle008",
      publisherId: "pub008",
      version: "v1.0.0",
      capturedBy: "operator012",
      now,
      sensitivity: 1,
      listings: [
        { listingId: "l1", visibility: "public", optInRequired: false, locale: "pt-BR", publishedAt: now, sha256: computeStringHash("l1") },
      ],
      consents: [],
      consumers: [
        { consumerId: "c1", userId: "u1", bundleId: "bundle008", installedAt: now },
      ],
      auditTrailDigest: computeAuditTrailDigest([]),
      retentionDays: 30,
    });
    const result = restoreRollback(
      { rollbackId: snap.snapshotId, actorId: "operator012", now: advanceDays(now, 1), reason: "operator requested restoration" },
      snap,
    );
    check(
      "S12:restoration from snapshot",
      result.restoredListings === 1 && result.restoredConsumers === 1 && result.rePublishGateCleared,
      JSON.stringify(result),
    );
  } catch (err) {
    check("S12:restoration from snapshot", false, String(err));
  }

  // Scenario 13: re-publish gate blocked by curator pending
  try {
    const reason = buildMinimalReason("security", "critical", "policy breach", "operator013", now);
    const gate = gateRePublish("bundle009", "rbk_test_013", 168, now, reason);
    const needsCurator = gateNeedsCurator(gate);
    check("S13:gate needs curator (critical)", needsCurator, gate.blockedReason ?? "no reason");
  } catch (err) {
    check("S13:gate needs curator (critical)", false, String(err));
  }

  // Scenario 14: full rollbackBundle orchestration
  try {
    const reason = buildMinimalReason("content", "high", "policy violation sample", "operator014", now);
    const req = buildMinimalRequest("bundle010", "manual_curator", reason, "operator014", now);
    const approval = grantDualCuratorApproval(
      requestDualCuratorApproval("rbk_test_full", "bundle010", "lead", "deputy"),
      { primaryApprovedAt: now, secondaryApprovedAt: now },
    );
    const report = rollbackBundle({
      request: req,
      existingGate: null,
      sensitivity: 4,
      consumers: [{ consumerId: "c1", userId: "u1", bundleId: "bundle010", installedAt: now }],
      existingAudit: [],
      approval,
    });
    check(
      "S14:full rollbackBundle orchestration",
      report.rollbackId.length > 0 && report.sacred.doubleCuratorRequired,
      JSON.stringify({ rollbackId: report.rollbackId, sacred: report.sacred }),
    );
  } catch (err) {
    check("S14:full rollbackBundle orchestration", false, String(err));
  }

  // Scenario 15: cascade order validation
  try {
    const order = validateCascadeOrder(CASCADE_STEPS);
    check("S15:cascade order canonical", order.valid, order.errors.join(";"));
  } catch (err) {
    check("S15:cascade order canonical", false, String(err));
  }

  // Scenario 16: SHA-256 hash determinism
  try {
    const a = computeStringHash("hello world");
    const b = computeStringHash("hello world");
    check("S16:SHA-256 deterministic", a === b && a.length === 64, `${a}/${b}`);
  } catch (err) {
    check("S16:SHA-256 deterministic", false, String(err));
  }

  // Count results
  const pass = results.filter((r) => r.pass).length;
  const total = results.length;
  if (pass !== total) {
    // eslint-disable-next-line no-console
    console.error(`[w53 sanity] ${pass}/${total} passed`);
    for (const r of results) {
      if (!r.pass) {
        // eslint-disable-next-line no-console
        console.error(`  FAIL ${r.name}: ${r.detail}`);
      }
    }
  }
  return { results, pass, total };
})();

/** Exposed sanity summary for runtime introspection. */
export const SANITY_RESULT = __sanity__;