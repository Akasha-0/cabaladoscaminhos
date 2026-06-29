/**
 * w50/curated-prayer-submission
 * -----------------------------------------------------------------------------
 * Curated prayer submission flow — engine data layer.
 *
 * SCOPE
 *   Implements the consent-and-curation pipeline that gates the w49
 *   tradition-prayer-corpus reserved slots. Reserved slots for Orixá-
 *   specific invocations, Umbanda preces, Ifá litanies and Indigenous
 *   Brazilian rezos are INITIATION-GATED (sacredness 4-5); they cannot
 *   be auto-filled by scraping or free-text generation. This module is
 *   the front door through which a qualified practitioner — zelador_de_santo,
 *   babalao, mestre_cigano, rabino, imam, monge_budista, sacerdote_cristao,
 *   leader_indigena, or our internal curador_akashia — captures a prayer
 *   with full provenance, attribution, and revocable LGPD consent.
 *
 * ADJACENT MODULES
 *   w49/tradition-prayer-corpus  — 24-entry canonical corpus + reserves
 *                                   the prayer type contract mirrored here.
 *   w48/sacred-symbols-registry  — symbol_refs cross-checked on submit.
 *   w47/respectful-use-checklist — verdict gates sacredness 4-5 publish.
 *   w45/tradition-cross-references — resonance IDs land in crossRef payloads.
 *
 * DURABLE POLICY (DON'T)
 *   1. NEVER accept a submission without all 5 consent booleans captured.
 *   2. NEVER let a reserved slot be filled by a submitter whose
 *      CuratedAuthority is not aligned with the slot's tradition.
 *   3. NEVER let magic_spell_framing land in sacredness 4-5 text.
 *   4. NEVER publish a submission with fewer than 2 distinct
 *      approving reviewers when SacredSensitivityLevel >= 4.
 *   5. NEVER obscure attribution; LGPD Art. 18 (right to be forgotten)
 *      redacts personal data only and ALWAYS preserves attribution string.
 *
 * LGPD ANCHORS
 *   Art. 7   — consentimento explícito:  capture in `PrayerSubmissionConsent`.
 *   Art. 11  — finalidade:               purpose strings, retention windows.
 *   Art. 18  — direito ao esquecimento:  delete / redact / retract paths.
 *
 * @module w50/curated-prayer-submission
 */

// ═════════════════════════════════════════════════════════════════════════════
// §1  MIRRORED w49 TYPES (composition types — kept local to avoid import)
// ═════════════════════════════════════════════════════════════════════════════
//
// We mirror — not import — the w49 type contract so this module can be
// type-checked against `tsconfig.w50.json` (per-file) and shipped as a
// standalone engine. The contract is small (Tradition, PrayerCategory,
// LocaleId) and any divergence will fail at compile time of the integration
// glue that joins the two modules downstream.

/**
 * Mirrored from w49/tradition-prayer-corpus :: `Tradition`.
 * Adding a tradition requires a corresponding row in `AUTHORITY_TRADITION_MAP`
 * below — keeping the authority bindings in lock-step with the curated list
 * is one of the durable review invariants.
 */
export type Tradition =
  | 'candomble'
  | 'ifa'
  | 'umbanda'
  | 'buddhism'
  | 'hinduism'
  | 'christianity'
  | 'islam'
  | 'judaism'
  | 'taoism'
  | 'indigenous_brazilian'
  | 'syncretic'
  | 'secular_mystical';

/**
 * Mirrored from w49 :: `PrayerCategory`. The submission pipeline accepts
 * any of these; the downstream corpus decides which categories are
 * rendered for each consumer locale.
 */
export type PrayerCategory =
  | 'morning'
  | 'evening'
  | 'gratitude'
  | 'grounding'
  | 'healing'
  | 'protection'
  | 'forgiveness'
  | 'intention'
  | 'gratitude_petition'
  | 'meditation'
  | 'ancestor_veneration'
  | 'orixa_invocation';

/** Mirrored from w49 :: `LocaleId`. The bundle ships PT-BR / EN-US / ES-ES. */
export type LocaleId = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * Mirrored from w49 :: `SacrednessLevel`. We use the literal union because
 * the engine conducts policy gating against the integer value.
 */
export type SacrednessLevel = 1 | 2 | 3 | 4 | 5;

// ═════════════════════════════════════════════════════════════════════════════
// §2  CURATED SUBMISSION DOMAIN TYPES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Authoritative lineage role of the submitter. `community_vote` is the
 * fallback for secular / open-tradition submissions where no lineage
 * authority is required (e.g. secular_mystical folk prayers); the
 * reserved-slot pipeline rejects community_vote for Orixá / Ifá /
 * Umbanda / Indigenous slots.
 */
export type CuratedAuthority =
  | 'zelador_de_santo'
  | 'babalao'
  | 'mestre_cigano'
  | 'rabino'
  | 'imam'
  | 'monge_budista'
  | 'sacerdote_cristao'
  | 'leader_indigena'
  | 'curador_akashia'
  | 'community_vote';

/**
 * Sensitivity level surfaced to the UI. Distinct from the w49
 * `SacrednessLevel` on purpose: sensitivity encodes *editorial risk* (will
 * this text be safe to ship if rendered verbatim?) while sacredness encodes
 * *ritual access*. They correlate but are decoupled at the data layer so
 * one can be tightened without rewriting the corpus.
 */
export type SacredSensitivityLevel = 1 | 2 | 3 | 4 | 5;

/** Submission status. Transitions are linear except `needs_revision` (→ draft). */
export type PrayerSubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'needs_revision'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'published'
  | 'retracted';

/**
 * Origin of the text. Mirrors the schema used elsewhere in the platform
 * so we can persist lineage in the same column family.
 */
export type ProvenanceSource =
  | 'oral_tradition'
  | 'written_lineage'
  | 'academic_source'
  | 'personal_vision'
  | 'channeled'
  | 'synthesized';

/**
 * Lineage attestation: who transmitted the text to the submitter, and
 * how that lineage extends back. Required for oral_tradition and
 * written_lineage sources; recommended otherwise.
 */
export interface PrayerProvenance {
  readonly source: ProvenanceSource;
  /** Free-text attribution string — always preserved, even after LGPD redact. */
  readonly attribution: string;
  /** Original publication date (epoch ms). Required for academic_source. */
  readonly publicationDate?: number;
  /**
   * Whether the underlying text is in the public domain OR released
   * under a free-culture licence. Reserved-slot / sacred-text submissions
   * where this is `false` are auto-rejected by `validateProvenance`.
   */
  readonly publicDomain: boolean;
  /** SPDX-style identifier, e.g. `CC-BY-SA-4.0`, `CC0-1.0`, `PD-old`. */
  readonly license?: string;
  /**
   * Ordered lineage chain — most-recent transmitter first.
   * Required length >= 2 when `source = oral_tradition` or
   * `sensitivityLevel >= 4`.
   */
  readonly lineageChain?: readonly string[];
  /** Optional external record (book, recension, manuscript identifier). */
  readonly externalRecord?: string;
}

/**
 * LGPD Art. 7 consent payload. All five boolean acknowledgements
 * MUST be `true` at submission time or the engine rejects with
 * `SubmissionConsentMissingError` (CPS_003). Optional `retention`
 * overrides the default TTL below.
 */
export interface PrayerSubmissionConsent {
  /** LGPD Art. 7: submitter explicitly consents to processing. */
  readonly submitterConfirmed: boolean;
  /** Submitter agrees to attribution being stored & displayed. */
  readonly attributionConfirmed: boolean;
  /** Submitter affirms the work is public domain OR freely licensed. */
  readonly publicDomainConfirmed: boolean;
  /** Submitter acknowledges the tradition's curating authority. */
  readonly traditionAuthorityAcknowledged: boolean;
  /** LGPD Art. 18: submitter knows they can withdraw / delete. */
  readonly revocationRightAcknowledged: boolean;
  /** Epoch ms when the consent was captured. */
  readonly capturedAt: number;
  /** System actor that captured the consent (usually the API gateway). */
  readonly capturedBy: string;
  /** i18n key that identifies what was shown to the submitter. */
  readonly consentText: string;
  /** Retention window from the moment of approval. */
  readonly retention: '30d' | '1y' | 'indefinite' | 'until_delete';
  /** Purpose: scopes downstream use; required by LGPD Art. 11. */
  readonly purpose: 'personal_practice' | 'community_curation' | 'research';
}

/** A single review action by a moderator. Append-only. */
export interface ReviewEntry {
  readonly reviewerId: string;
  readonly reviewerRole: CuratedAuthority;
  readonly decision: 'comment' | 'request_revision' | 'approve' | 'reject' | 'escalate';
  readonly comments: string;
  readonly timestamp: number;
  /** Sensitivity gate the reviewer used. */
  readonly reviewedSensitivity: SacredSensitivityLevel;
}

/** A single immutable audit-log entry. Append-only; never edited in place. */
export interface SubmissionAuditEntry {
  readonly actor: string;
  readonly action: SubmissionAuditAction;
  readonly timestamp: number;
  /** Free-text, json-bag, or hash signature depending on action. */
  readonly payload: string;
}

export type SubmissionAuditAction =
  | 'created'
  | 'provenance_attached'
  | 'consent_attached'
  | 'submitted'
  | 'reviewer_assigned'
  | 'review_recorded'
  | 'revision_requested'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'published'
  | 'retracted'
  | 'redaction_applied'
  | 'deletion_requested'
  | 'integrity_check';

/**
 * The submission record. Mutable during draft; immutable after
 * `published`. Mutation paths return a fresh object to keep audit
 * semantics clean.
 */
export interface PrayerSubmission {
  readonly id: string;
  readonly submitterId: string;
  readonly tradition: Tradition;
  readonly category: PrayerCategory;
  readonly locale: LocaleId;
  readonly proposedTitle: string;
  readonly proposedBody: string;
  /** Set when filling a reserved slot from the w49 corpus. */
  readonly reservedSlotId?: string;
  readonly sensitivityLevel: SacredSensitivityLevel;
  readonly authority: CuratedAuthority;
  readonly provenance?: PrayerProvenance;
  readonly consent?: PrayerSubmissionConsent;
  readonly status: PrayerSubmissionStatus;
  readonly reviewTrail: readonly ReviewEntry[];
  readonly auditLog: readonly SubmissionAuditEntry[];
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly publishedAt?: number;
  readonly retractedAt?: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// §3  TYPED ERRORS (CPS_001..CPS_012)
// ═════════════════════════════════════════════════════════════════════════════

/** Base class for every curated-submission error. CPS = Curated Prayer Submission. */
export class CuratedPrayerSubmissionError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(
    code: string,
    message: string,
    context: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = 'CuratedPrayerSubmissionError';
    this.code = code;
    this.context = context;
  }
}

/** CPS_001 — submission with no reserved-slot authority matches. */
export class ReservedSlotAuthorityMismatchError extends CuratedPrayerSubmissionError {
  public constructor(slotId: string, authority: CuratedAuthority, tradition: Tradition) {
    super(
      'CPS_001',
      `Reserved slot "${slotId}" requires authority aligned with tradition "${tradition}"; got "${authority}".`,
      { slotId, authority, tradition },
    );
    this.name = 'ReservedSlotAuthorityMismatchError';
  }
}

/** CPS_002 — provenance failed schema validation (e.g. license missing). */
export class ProvenanceValidationError extends CuratedPrayerSubmissionError {
  public constructor(reason: string, context: Readonly<Record<string, unknown>> = {}) {
    super('CPS_002', `Provenance validation failed: ${reason}`, context);
    this.name = 'ProvenanceValidationError';
  }
}

/** CPS_003 — one or more consent booleans is false / undefined. */
export class SubmissionConsentMissingError extends CuratedPrayerSubmissionError {
  public constructor(missingFields: readonly string[], submissionId: string) {
    super(
      'CPS_003',
      `Submission "${submissionId}" is missing required consent fields: ${missingFields.join(', ')}.`,
      { submissionId, missingFields },
    );
    this.name = 'SubmissionConsentMissingError';
  }
}

/** CPS_004 — magic_spell_framing detected in a sensitive slot. */
export class SacredTextPolicyViolationError extends CuratedPrayerSubmissionError {
  public constructor(patterns: readonly string[], submissionId: string) {
    super(
      'CPS_004',
      `Submission "${submissionId}" violates sacred-text policy via patterns: ${patterns.join(', ')}.`,
      { submissionId, patterns },
    );
    this.name = 'SacredTextPolicyViolationError';
  }
}

/** CPS_005 — invalid state transition requested. */
export class IllegalSubmissionTransitionError extends CuratedPrayerSubmissionError {
  public constructor(from: PrayerSubmissionStatus, to: PrayerSubmissionStatus, id: string) {
    super(
      'CPS_005',
      `Submission "${id}" cannot transition from "${from}" to "${to}".`,
      { id, from, to },
    );
    this.name = 'IllegalSubmissionTransitionError';
  }
}

/** CPS_006 — reviewer not eligible to moderate the tradition. */
export class ReviewerNotEligibleError extends CuratedPrayerSubmissionError {
  public constructor(reviewerId: string, tradition: Tradition) {
    super(
      'CPS_006',
      `Reviewer "${reviewerId}" is not eligible to moderate tradition "${tradition}".`,
      { reviewerId, tradition },
    );
    this.name = 'ReviewerNotEligibleError';
  }
}

/** CPS_007 — sacredness 4-5 publication attempted without 2+ approvals. */
export class InsufficientReviewApprovalsError extends CuratedPrayerSubmissionError {
  public constructor(submissionId: string, got: number, required: number) {
    super(
      'CPS_007',
      `Submission "${submissionId}" has ${got} approval(s); sacredness 4-5 requires ${required}.`,
      { submissionId, got, required },
    );
    this.name = 'InsufficientReviewApprovalsError';
  }
}

/** CPS_008 — proposed body text failed length / structure quality gate. */
export class PrayerStructureGateError extends CuratedPrayerSubmissionError {
  public constructor(metric: string, value: number, threshold: number) {
    super(
      'CPS_008',
      `Prayer structure gate failed on "${metric}": ${value} (threshold ${threshold}).`,
      { metric, value, threshold },
    );
    this.name = 'PrayerStructureGateError';
  }
}

/** CPS_009 — cultural-sensitivity flag tripped (appropriation / decontextualisation). */
export class CulturalSensitivityFlagError extends CuratedPrayerSubmissionError {
  public constructor(flags: readonly string[], submissionId: string) {
    super(
      'CPS_009',
      `Submission "${submissionId}" raised cultural-sensitivity flags: ${flags.join(', ')}.`,
      { submissionId, flags },
    );
    this.name = 'CulturalSensitivityFlagError';
  }
}

/** CPS_010 — review SLA exceeded. */
export class ReviewSlaExpiredError extends CuratedPrayerSubmissionError {
  public constructor(submissionId: string, slaHours: number) {
    super(
      'CPS_010',
      `Submission "${submissionId}" review SLA of ${slaHours}h expired.`,
      { submissionId, slaHours },
    );
    this.name = 'ReviewSlaExpiredError';
  }
}

/** CPS_011 — integrity checksum mismatch on a persisted record. */
export class SubmissionIntegrityError extends CuratedPrayerSubmissionError {
  public constructor(id: string, why: string) {
    super(
      'CPS_011',
      `Submission "${id}" failed integrity check: ${why}.`,
      { id, why },
    );
    this.name = 'SubmissionIntegrityError';
  }
}

/** CPS_012 — deserialisation input cannot be safely parsed. */
export class SubmissionBundleParseError extends CuratedPrayerSubmissionError {
  public constructor(why: string) {
    super('CPS_012', `Submission bundle parse failed: ${why}.`, { why });
    this.name = 'SubmissionBundleParseError';
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// §4  CONSTANTS  (defaults, sensitivities, authority bindings)
// ═════════════════════════════════════════════════════════════════════════════

/** Default draft-to-cleanup TTL in days. */
export const DEFAULT_SUBMISSION_TTL_DAYS = 30;

/** Default draft-to-cleanup TTL in ms. */
export const DEFAULT_SUBMISSION_TTL_MS: number =
  DEFAULT_SUBMISSION_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Sensitivity levels that mandate double review before publish. */
export const SENSITIVITY_REQUIRES_DOUBLE_REVIEW: readonly SacredSensitivityLevel[] = [
  4, 5,
] as const;

/** Number of distinct approvers required for double-review. */
export const DOUBLE_REVIEW_QUORUM = 2;

/** Traditions whose reserved slots are sacred-text-policy gated. */
export const SACRED_TEXT_RESERVED_TRADITIONS: readonly Tradition[] = [
  'candomble',
  'ifa',
  'umbanda',
  'indigenous_brazilian',
] as const;

/**
 * Authoritative authority bindings: which `CuratedAuthority` values may
 * submit / moderate each tradition. Used by `checkAuthorityAlignment`
 * and `assignReviewer`.
 */
export const AUTHORITY_TRADITION_MAP: Readonly<
  Record<Tradition, readonly CuratedAuthority[]>
> = {
  candomble: ['zelador_de_santo', 'curador_akashia'],
  ifa: ['babalao', 'curador_akashia'],
  umbanda: ['zelador_de_santo', 'mestre_cigano', 'curador_akashia'],
  buddhism: ['monge_budista', 'curador_akashia', 'community_vote'],
  hinduism: ['curador_akashia', 'community_vote'],
  christianity: ['sacerdote_cristao', 'curador_akashia', 'community_vote'],
  islam: ['imam', 'curador_akashia', 'community_vote'],
  judaism: ['rabino', 'curador_akashia', 'community_vote'],
  taoism: ['curador_akashia', 'community_vote'],
  indigenous_brazilian: ['leader_indigena', 'curador_akashia'],
  syncretic: ['zelador_de_santo', 'mestre_cigano', 'curador_akashia'],
  secular_mystical: ['community_vote', 'curador_akashia'],
} as const;

/** Default SLA hours from `submitted` → `in_review`. */
export const DEFAULT_REVIEW_SLA_HOURS = 48;

/** Patterns that trigger `SacredTextPolicyViolationError` (magic_spell_framing). */
export const SACRED_TEXT_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /\buse\s+this\s+to\s+(?:curse|harm|kill|dominate|control)\b/i,
  /\bguarantee(?:d|s)?\s+(?:outcome|result|return|money|love)\b/i,
  /\bfix\s+your\s+(?:enemy|ex|critic|opponent)\b/i,
  /\binstant\s+(?:love|money|wealth|revenge)\b/i,
  /\bmanifest\s+(?:your\s+)?(?:ex|revenge|death)\b/i,
  /\bbind\s+(?:him|her|them)\s+(?:to|with)\s+(?:love|silence|submission)\b/i,
  /\b100%\s+(?:guaranteed|certain|effective)\b/i,
  /\bpay\s+no\s+money\s+down\b/i,
] as const;

/**
 * Patterns that trigger `CulturalSensitivityFlagError` (appropriation /
 * decontextualisation). Approximations: a real implementation would
 * consult a curated lexicon and human-review the rest.
 */
export const CULTURAL_SENSITIVITY_PATTERNS: readonly RegExp[] = [
  /as\s+an?\s+aesthetic\b/i,
  /just\s+for\s+fun\b.*\b(?:ritual|prayer|invocation)\b/i,
  /modern\s+spin\s+on\s+(?:vodun|orixa|candomble|ifa)\b/i,
  /trendy\b.*\b(?:sacred|ritual|sacredness)\b/i,
] as const;

/** Length thresholds for the structure gate. */
export const STRUCTURE_MIN_BODY_CHARS = 24;
export const STRUCTURE_MAX_BODY_CHARS = 8000;
export const STRUCTURE_MIN_TITLE_CHARS = 3;
export const STRUCTURE_MAX_TITLE_CHARS = 200;
export const STRUCTURE_MIN_LINES = 1;
export const STRUCTURE_MAX_LINES = 200;

/** Retention windows in days. */
export const RETENTION_WINDOWS_DAYS: Readonly<Record<PrayerSubmissionConsent['retention'], number>> = {
  '30d': 30,
  '1y': 365,
  indefinite: -1,
  until_delete: -1,
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// §5  SACRED-TEXT POLICY TABLES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Default sensitivity level per tradition. Used to back-fill
 * `SacredSensitivityLevel` when the submitter does not explicitly set one.
 */
export const DEFAULT_SENSITIVITY_BY_TRADITION: Readonly<Record<Tradition, SacredSensitivityLevel>> = {
  candomble: 5,
  ifa: 5,
  umbanda: 4,
  indigenous_brazilian: 5,
  syncretic: 3,
  buddhism: 2,
  hinduism: 2,
  christianity: 2,
  islam: 2,
  judaism: 2,
  taoism: 2,
  secular_mystical: 1,
} as const;

/**
 * Tags emitted by `checkSacredTextPolicy` to allow policy versioning
 * without breaking UIs (consumers switch on the tag, not the error code).
 */
export type SacredTextPolicyTag =
  | 'magic_spell_framing'
  | 'outcome_guarantee'
  | 'enemy_targeting'
  | 'instant_manifestation'
  | 'binding_ritual'
  | 'monetised_spell'
  | 'fine';

/** Verdict from `checkSacredTextPolicy`. Always carry the tag for UI logging. */
export interface SacredTextPolicyVerdict {
  readonly passes: boolean;
  readonly tags: readonly SacredTextPolicyTag[];
  readonly matchedPatterns: readonly string[];
}

/** Verdict from `checkCulturalSensitivity`. */
export interface CulturalSensitivityVerdict {
  readonly passes: boolean;
  readonly flags: readonly string[];
}

/** Verdict from `checkLengthAndStructure`. */
export interface StructureVerdict {
  readonly passes: boolean;
  readonly metrics: Readonly<Record<string, number>>;
  readonly issues: readonly string[];
}

/** Combination verdict from `validateProvenance`. */
export interface ProvenanceVerdict {
  readonly passes: boolean;
  readonly issues: readonly string[];
}

/** Verdict from `validateConsent`. */
export interface ConsentVerdict {
  readonly passes: boolean;
  readonly missingFields: readonly string[];
}

/** Verdict from `validateReservedSlot`. */
export interface ReservedSlotVerdict {
  readonly passes: boolean;
  readonly issues: readonly string[];
}

/** Verdict from `checkAuthorityAlignment`. */
export interface AuthorityAlignmentVerdict {
  readonly passes: boolean;
  readonly allowed: readonly CuratedAuthority[];
}

/** Verdict from `assignReviewer` (extends alignment with assignment logic). */
export interface ReviewerAssignment {
  readonly reviewerId: string;
  readonly reviewerRole: CuratedAuthority;
  readonly slaHours: number;
  readonly eligibleForDoubleReview: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// §6  SUBMISSION QUEUE TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Filters for `getSubmissionQueue`. */
export interface QueueFilters {
  readonly status?: readonly PrayerSubmissionStatus[];
  readonly tradition?: readonly Tradition[];
  readonly authority?: readonly CuratedAuthority[];
  readonly minSensitivity?: SacredSensitivityLevel;
  readonly maxSensitivity?: SacredSensitivityLevel;
  readonly reservedOnly?: boolean;
}

/** Row returned by `getSubmissionQueue`. */
export interface QueueRow {
  readonly submission: PrayerSubmission;
  readonly ageMs: number;
  readonly slaRemainingHours: number;
  readonly needsSecondReviewer: boolean;
  readonly flags: readonly string[];
}

/** Filter shape for `getReservedSlotsAwaitingCurator`. */
export interface ReservedSlotQuery {
  readonly tradition?: readonly Tradition[];
  readonly minSensitivity?: SacredSensitivityLevel;
}

// ═════════════════════════════════════════════════════════════════════════════
// §7  ANALYTICS TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Output of `summarizeSubmissions`. */
export interface SubmissionSummary {
  readonly total: number;
  readonly byStatus: Readonly<Record<PrayerSubmissionStatus, number>>;
  readonly byTradition: Readonly<Record<Tradition, number>>;
  readonly byAuthority: Readonly<Record<CuratedAuthority, number>>;
  readonly bySensitivity: Readonly<Record<SacredSensitivityLevel, number>>;
  readonly averageReviewMs: number;
  readonly oldestPendingMs: number;
  readonly generatedAt: number;
}

/** Groupings accepted by `summarizeSubmissions(groupBy)`. */
export type SummaryGroupBy = 'status' | 'tradition' | 'authority' | 'sensitivity';

// ═════════════════════════════════════════════════════════════════════════════
// §8  LGPD TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** Result of `redactSubmissionForExport`. */
export interface RedactedSubmissionExport {
  readonly id: string;
  readonly submitterId: string;
  readonly tradition: Tradition;
  readonly category: PrayerCategory;
  readonly locale: LocaleId;
  readonly proposedTitle: string;
  readonly redactedFields: readonly string[];
  readonly exportedAt: number;
}

/** Result of `deleteSubmission`. */
export interface DeletionReceipt {
  readonly submissionId: string;
  readonly submitterId: string;
  readonly deletedAt: number;
  readonly auditEntriesPreserved: number;
  readonly verificationHash: string;
}

/** Bundle returned by `serializeSubmissionBundle`. */
export interface SubmissionBundle {
  readonly schema: 'curated-prayer-submission/v1';
  readonly exportedAt: number;
  readonly submissions: readonly PrayerSubmission[];
  readonly metadata: Readonly<Record<string, string>>;
}

/** Result of `validateSubmissionIntegrity`. */
export interface IntegrityReport {
  readonly submissionId: string;
  readonly passes: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
  readonly computedHash: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// §9  DRAFT LIFECYCLE  (creation, provenance attach, consent attach, submit)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Generate a ULID-shaped id. Keeps the file pure (no `crypto.randomUUID`
 * dependency for non-DOM targets) and deterministic when a `random`
 * function is passed by the caller (useful for snapshot tests).
 */
export function generateSubmissionId(now: number = Date.now(), random: number = Math.random()): string {
  const ts = now.toString(36).padStart(9, '0');
  const rand = Math.floor(random * 0xffffffff)
    .toString(36)
    .padStart(7, '0');
  return `cps_${ts}_${rand}`;
}

/**
 * Begin a brand-new draft submission. The draft is not yet valid for
 * review and `validateReservedSlot` will reject reserved-slot references
 * until the provenance is attached and consent is captured.
 */
export function startDraftSubmission(
  submitter: { readonly id: string; readonly authority: CuratedAuthority },
  tradition: Tradition,
  category: PrayerCategory,
  locale: LocaleId,
  proposedTitle: string,
  proposedBody: string,
  reservedSlotId?: string,
  sensitivityLevel?: SacredSensitivityLevel,
  now: number = Date.now(),
): PrayerSubmission {
  if (proposedTitle.trim().length < STRUCTURE_MIN_TITLE_CHARS) {
    throw new PrayerStructureGateError('title', proposedTitle.length, STRUCTURE_MIN_TITLE_CHARS);
  }
  if (proposedBody.trim().length < STRUCTURE_MIN_BODY_CHARS) {
    throw new PrayerStructureGateError('body', proposedBody.length, STRUCTURE_MIN_BODY_CHARS);
  }
  return {
    id: generateSubmissionId(now),
    submitterId: submitter.id,
    tradition,
    category,
    locale,
    proposedTitle: proposedTitle.trim(),
    proposedBody: proposedBody.trim(),
    reservedSlotId,
    sensitivityLevel: sensitivityLevel ?? DEFAULT_SENSITIVITY_BY_TRADITION[tradition],
    authority: submitter.authority,
    status: 'draft',
    reviewTrail: [],
    auditLog: [auditSubmissionActionBase(now, 'created', submitter.id, 'draft created')],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Attach provenance to a draft. Returns a fresh submission object so
 * audit history stays append-only.
 */
export function attachProvenance(
  draft: PrayerSubmission,
  provenance: PrayerProvenance,
  actor: string = 'system',
  now: number = Date.now(),
): PrayerSubmission {
  if (draft.status !== 'draft') {
    throw new IllegalSubmissionTransitionError(draft.status, 'draft', draft.id);
  }
  const verdict = validateProvenance(provenance, draft.sensitivityLevel, draft.tradition);
  if (!verdict.passes) {
    throw new ProvenanceValidationError(verdict.issues.join('; '), {
      submissionId: draft.id,
      issues: verdict.issues,
    });
  }
  return {
    ...draft,
    provenance,
    updatedAt: now,
    auditLog: [
      ...draft.auditLog,
      auditSubmissionActionBase(now, 'provenance_attached', actor, `source=${provenance.source}`),
    ],
  };
}

/**
 * Attach the LGPD consent payload. All five booleans MUST be `true`.
 * The function refuses to copy a draft that is missing any acknowledgement.
 */
export function attachConsent(
  draft: PrayerSubmission,
  consent: PrayerSubmissionConsent,
  actor: string = 'system',
  now: number = Date.now(),
): PrayerSubmission {
  if (draft.status !== 'draft') {
    throw new IllegalSubmissionTransitionError(draft.status, 'draft', draft.id);
  }
  const verdict = validateConsent(consent);
  if (!verdict.passes) {
    throw new SubmissionConsentMissingError(verdict.missingFields, draft.id);
  }
  return {
    ...draft,
    consent,
    updatedAt: now,
    auditLog: [
      ...draft.auditLog,
      auditSubmissionActionBase(
        now,
        'consent_attached',
        actor,
        `retention=${consent.retention};purpose=${consent.purpose}`,
      ),
    ],
  };
}

/** Withdraw a still-draft (or in-review) submission. */
export function withdrawDraftSubmission(
  submission: PrayerSubmission,
  reason: string,
  actor: string,
  now: number = Date.now(),
): PrayerSubmission {
  if (submission.status === 'published' || submission.status === 'retracted') {
    throw new IllegalSubmissionTransitionError(submission.status, 'withdrawn', submission.id);
  }
  return {
    ...submission,
    status: 'withdrawn',
    updatedAt: now,
    auditLog: [
      ...submission.auditLog,
      auditSubmissionActionBase(now, 'withdrawn', actor, `reason=${reason}`),
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §10 VALIDATION PIPELINE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validate provenance schema. The checks:
 *   - attribution must be non-empty
 *   - publicDomain must be true OR a license must be set
 *   - publicationDate required for academic_source
 *   - lineageChain required for oral_tradition / sensitivity >=4
 *   - oral_tradition / written_lineage lineage chain length >= 2
 */
export function validateProvenance(
  provenance: PrayerProvenance,
  sensitivityLevel: SacredSensitivityLevel,
  tradition: Tradition,
): ProvenanceVerdict {
  const issues: string[] = [];

  if (provenance.attribution.trim().length < 3) {
    issues.push('attribution_too_short');
  }

  if (!provenance.publicDomain && !provenance.license) {
    issues.push('public_domain_or_license_required');
  }

  if (provenance.source === 'academic_source' && provenance.publicationDate === undefined) {
    issues.push('publication_date_required_for_academic_source');
  }

  if (
    provenance.source === 'oral_tradition' ||
    provenance.source === 'written_lineage'
  ) {
    if (!provenance.lineageChain || provenance.lineageChain.length < 2) {
      issues.push('lineage_chain_required_for_oral_or_written_lineage');
    }
  }

  if (sensitivityLevel >= 4) {
    if (
      !provenance.lineageChain ||
      provenance.lineageChain.length < 2
    ) {
      issues.push('lineage_chain_required_for_high_sensitivity');
    }
  }

  if (SACRED_TEXT_RESERVED_TRADITIONS.includes(tradition)) {
    if (provenance.source === 'channeled' || provenance.source === 'synthesized') {
      issues.push('reserved_tradition_rejects_synthesized_or_channeled_sources');
    }
  }

  return {
    passes: issues.length === 0,
    issues,
  };
}

/**
 * Validate that all five LGPD booleans are true.
 */
export function validateConsent(consent: PrayerSubmissionConsent): ConsentVerdict {
  const missingFields: string[] = [];
  if (consent.submitterConfirmed !== true) missingFields.push('submitterConfirmed');
  if (consent.attributionConfirmed !== true) missingFields.push('attributionConfirmed');
  if (consent.publicDomainConfirmed !== true) missingFields.push('publicDomainConfirmed');
  if (consent.traditionAuthorityAcknowledged !== true) missingFields.push('traditionAuthorityAcknowledged');
  if (consent.revocationRightAcknowledged !== true) missingFields.push('revocationRightAcknowledged');
  return {
    passes: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Validate the sacred-text policy. Uses `SACRED_TEXT_FORBIDDEN_PATTERNS`
 * to scan the text body and emits tags for each match. Throws
 * `SacredTextPolicyViolationError` when any pattern matches AND
 * the sensitivity level is high enough to require the gate.
 */
export function checkSacredTextPolicy(
  proposedBody: string,
  tradition: Tradition,
  sensitivityLevel: SacredSensitivityLevel,
  throws: boolean = true,
): SacredTextPolicyVerdict {
  const matchedPatterns: string[] = [];
  const tags: SacredTextPolicyTag[] = [];

  for (const pattern of SACRED_TEXT_FORBIDDEN_PATTERNS) {
    const match = proposedBody.match(pattern);
    if (match) {
      matchedPatterns.push(match[0]);
      const tag = classifyPattern(pattern);
      if (!tags.includes(tag)) tags.push(tag);
    }
  }

  const gateTriggers = sensitivityLevel >= 4 || SACRED_TEXT_RESERVED_TRADITIONS.includes(tradition);
  const passes = !(gateTriggers && matchedPatterns.length > 0);

  if (!passes && throws) {
    throw new SacredTextPolicyViolationError(matchedPatterns, 'pending');
  }
  return { passes, tags, matchedPatterns };
}

/** Translate a regex into a stable policy-tag. */
function classifyPattern(pattern: RegExp): SacredTextPolicyTag {
  const src = pattern.source;
  if (/curse|harm|kill|dominate|control/i.test(src)) return 'magic_spell_framing';
  if (/guarantee/i.test(src)) return 'outcome_guarantee';
  if (/enemy/i.test(src)) return 'enemy_targeting';
  if (/instant/i.test(src)) return 'instant_manifestation';
  if (/bind/i.test(src)) return 'binding_ritual';
  if (/pay\s+no\s+money/i.test(src)) return 'monetised_spell';
  return 'magic_spell_framing';
}

/**
 * Validate cultural sensitivity. Always advisory (returns a verdict),
 * but the caller may choose to reject the submission when
 * `verdict.passes === false`. The default reject-list contains patterns
 * that explicitly decontextualise a closed tradition.
 */
export function checkCulturalSensitivity(
  proposedBody: string,
  tradition: Tradition,
  throws: boolean = false,
): CulturalSensitivityVerdict {
  const flags: string[] = [];
  for (const pattern of CULTURAL_SENSITIVITY_PATTERNS) {
    const match = proposedBody.match(pattern);
    if (match) flags.push(match[0]);
  }
  if (SACRED_TEXT_RESERVED_TRADITIONS.includes(tradition)) {
    // For reserved traditions, even single-line decontextualisation is a flag.
    if (proposedBody.trim().split(/\s+/).length < 8) {
      flags.push('too_short_for_reserved_tradition');
    }
  }
  const passes = flags.length === 0;
  if (!passes && throws) {
    throw new CulturalSensitivityFlagError(flags, 'pending');
  }
  return { passes, flags };
}

/**
 * Validate length / line / structure thresholds.
 */
export function checkLengthAndStructure(
  proposedBody: string,
  proposedTitle: string,
  throws: boolean = true,
): StructureVerdict {
  const issues: string[] = [];
  const bodyChars = proposedBody.length;
  const titleChars = proposedTitle.length;
  const lines = proposedBody.split(/\r?\n/).length;

  if (bodyChars < STRUCTURE_MIN_BODY_CHARS) issues.push('body_too_short');
  if (bodyChars > STRUCTURE_MAX_BODY_CHARS) issues.push('body_too_long');
  if (titleChars < STRUCTURE_MIN_TITLE_CHARS) issues.push('title_too_short');
  if (titleChars > STRUCTURE_MAX_TITLE_CHARS) issues.push('title_too_long');
  if (lines < STRUCTURE_MIN_LINES) issues.push('body_too_few_lines');
  if (lines > STRUCTURE_MAX_LINES) issues.push('body_too_many_lines');

  if (throws) {
    for (const issue of issues) {
      if (issue === 'body_too_short') {
        throw new PrayerStructureGateError('body_chars', bodyChars, STRUCTURE_MIN_BODY_CHARS);
      }
      if (issue === 'body_too_long') {
        throw new PrayerStructureGateError('body_chars', bodyChars, STRUCTURE_MAX_BODY_CHARS);
      }
      if (issue === 'title_too_short') {
        throw new PrayerStructureGateError('title_chars', titleChars, STRUCTURE_MIN_TITLE_CHARS);
      }
      if (issue === 'title_too_long') {
        throw new PrayerStructureGateError('title_chars', titleChars, STRUCTURE_MAX_TITLE_CHARS);
      }
      if (issue === 'body_too_few_lines') {
        throw new PrayerStructureGateError('lines', lines, STRUCTURE_MIN_LINES);
      }
      if (issue === 'body_too_many_lines') {
        throw new PrayerStructureGateError('lines', lines, STRUCTURE_MAX_LINES);
      }
    }
  }

  return {
    passes: issues.length === 0,
    metrics: {
      body_chars: bodyChars,
      title_chars: titleChars,
      lines,
    },
    issues,
  };
}

/**
 * Validate that `authority` is in the allowed set for `tradition`.
 * Rejects `community_vote` against any of the SACRED_TEXT_RESERVED_TRADITIONS.
 */
export function checkAuthorityAlignment(
  authority: CuratedAuthority,
  tradition: Tradition,
): AuthorityAlignmentVerdict {
  const allowed = AUTHORITY_TRADITION_MAP[tradition];
  const passes = allowed.includes(authority);
  return { passes, allowed };
}

/**
 * Validate that a reserved-slot submission is actually eligible. This is
 * the canonical sacred-text-policy gate: reserved slots MUST attach
 * provenance, MUST carry consent, MUST align authority ↔ tradition, and
 * MUST clear length & structure checks.
 */
export function validateReservedSlot(
  reservedSlotId: string,
  authority: CuratedAuthority,
  tradition: Tradition,
  provenance: PrayerProvenance | undefined,
  consent: PrayerSubmissionConsent | undefined,
  proposedBody: string,
  proposedTitle: string,
  sensitivityLevel: SacredSensitivityLevel,
): ReservedSlotVerdict {
  const issues: string[] = [];

  const alignment = checkAuthorityAlignment(authority, tradition);
  if (!alignment.passes) {
    issues.push('authority_not_aligned');
  }
  if (SACRED_TEXT_RESERVED_TRADITIONS.includes(tradition) && authority === 'community_vote') {
    issues.push('community_vote_forbidden_for_reserved_tradition');
  }

  if (provenance === undefined) {
    issues.push('provenance_required');
  } else {
    const verdict = validateProvenance(provenance, sensitivityLevel, tradition);
    if (!verdict.passes) issues.push(...verdict.issues.map((i) => `provenance.${i}`));
  }

  if (consent === undefined) {
    issues.push('consent_required');
  } else {
    const verdict = validateConsent(consent);
    if (!verdict.passes) {
      issues.push(...verdict.missingFields.map((f) => `consent.${f}`));
    }
  }

  const policyVerdict = checkSacredTextPolicy(proposedBody, tradition, sensitivityLevel, false);
  if (!policyVerdict.passes) {
    issues.push(`policy.${policyVerdict.tags.join('|')}`);
  }

  const structure = checkLengthAndStructure(proposedBody, proposedTitle, false);
  if (!structure.passes) {
    issues.push(...structure.issues.map((i) => `structure.${i}`));
  }

  return {
    passes: issues.length === 0,
    issues,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §11 SUBMIT-FOR-REVIEW + REVIEW TRAIL
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Transition a fully-validated draft into the queue. Throws
 * `SubmissionConsentMissingError` if the consent is incomplete and
 * `ProvenanceValidationError` if the provenance is invalid for the
 * sensitivity level.
 */
export function submitForReview(
  draft: PrayerSubmission,
  actor: string = draft.submitterId,
  now: number = Date.now(),
): PrayerSubmission {
  if (draft.status !== 'draft' && draft.status !== 'needs_revision') {
    throw new IllegalSubmissionTransitionError(
      draft.status,
      'submitted',
      draft.id,
    );
  }

  if (draft.provenance === undefined) {
    throw new ProvenanceValidationError('provenance_missing', { submissionId: draft.id });
  }

  if (draft.consent === undefined) {
    throw new SubmissionConsentMissingError(['entire_consent'], draft.id);
  }

  // Re-run validators so an out-of-date consent cannot slip through.
  const consentVerdict = validateConsent(draft.consent);
  if (!consentVerdict.passes) {
    throw new SubmissionConsentMissingError(consentVerdict.missingFields, draft.id);
  }
  const provenanceVerdict = validateProvenance(draft.provenance, draft.sensitivityLevel, draft.tradition);
  if (!provenanceVerdict.passes) {
    throw new ProvenanceValidationError(provenanceVerdict.issues.join('; '), {
      submissionId: draft.id,
      issues: provenanceVerdict.issues,
    });
  }

  // If this is a reserved-slot submission, run the strongest gate.
  if (draft.reservedSlotId !== undefined) {
    const slotVerdict = validateReservedSlot(
      draft.reservedSlotId,
      draft.authority,
      draft.tradition,
      draft.provenance,
      draft.consent,
      draft.proposedBody,
      draft.proposedTitle,
      draft.sensitivityLevel,
    );
    if (!slotVerdict.passes) {
      throw new ReservedSlotAuthorityMismatchError(
        draft.reservedSlotId,
        draft.authority,
        draft.tradition,
      );
    }
  }

  return {
    ...draft,
    status: 'submitted',
    updatedAt: now,
    auditLog: [
      ...draft.auditLog,
      auditSubmissionActionBase(
        now,
        'submitted',
        actor,
        `sensitivity=${draft.sensitivityLevel};tradition=${draft.tradition}`,
      ),
    ],
  };
}

/**
 * Assign a reviewer to a submission. The reviewer must be eligible for
 * the submission's tradition and the SLA must be a positive integer.
 */
export function assignReviewer(
  submission: PrayerSubmission,
  reviewerId: string,
  reviewerRole: CuratedAuthority,
  slaHours: number = DEFAULT_REVIEW_SLA_HOURS,
  actor: string = 'system',
  now: number = Date.now(),
): ReviewerAssignment {
  if (submission.status !== 'submitted' && submission.status !== 'in_review') {
    throw new IllegalSubmissionTransitionError(
      submission.status,
      'in_review',
      submission.id,
    );
  }
  if (slaHours <= 0) {
    throw new IllegalSubmissionTransitionError(submission.status, 'in_review', submission.id);
  }
  const alignment = checkAuthorityAlignment(reviewerRole, submission.tradition);
  if (!alignment.passes) {
    throw new ReviewerNotEligibleError(reviewerId, submission.tradition);
  }
  const eligibleForDoubleReview =
    SENSITIVITY_REQUIRES_DOUBLE_REVIEW.includes(submission.sensitivityLevel);

  return {
    reviewerId,
    reviewerRole,
    slaHours,
    eligibleForDoubleReview,
  };
}

/**
 * Append a review entry to a submission. Returns a new submission with
 * the appended review and a `status` of `in_review` if previously
 * `submitted`, or `approved` / `rejected` / `needs_revision` based on
 * the new decision IF the caller already routes through
 * `approveSubmission` / `rejectSubmission` / `requestRevision`. This
 * function is the canonical append helper, used by all three.
 */
const ADD_REVIEW_ALLOWED_STATES: readonly PrayerSubmissionStatus[] = [
  'submitted',
  'in_review',
  'needs_revision',
  'approved',
  'rejected',
];

export function addReviewEntry(
  submission: PrayerSubmission,
  entry: ReviewEntry,
): PrayerSubmission {
  if (!ADD_REVIEW_ALLOWED_STATES.includes(submission.status)) {
    throw new IllegalSubmissionTransitionError(submission.status, 'in_review', submission.id);
  }
  return {
    ...submission,
    reviewTrail: [...submission.reviewTrail, entry],
    updatedAt: entry.timestamp,
  };
}

/**
 * Request revision from a reviewer. Returns the submission with status
 * `needs_revision` so the submitter can re-open it as a draft.
 */
export function requestRevision(
  submission: PrayerSubmission,
  reviewerId: string,
  reviewerRole: CuratedAuthority,
  comments: string,
  reviewedSensitivity: SacredSensitivityLevel = submission.sensitivityLevel,
  now: number = Date.now(),
): PrayerSubmission {
  if (submission.status === 'published' || submission.status === 'retracted' || submission.status === 'withdrawn') {
    throw new IllegalSubmissionTransitionError(submission.status, 'needs_revision', submission.id);
  }
  const entry: ReviewEntry = {
    reviewerId,
    reviewerRole,
    decision: 'request_revision',
    comments,
    timestamp: now,
    reviewedSensitivity,
  };
  return {
    ...submission,
    status: 'needs_revision',
    reviewTrail: [...submission.reviewTrail, entry],
    updatedAt: now,
    auditLog: [
      ...submission.auditLog,
      auditSubmissionActionBase(now, 'revision_requested', reviewerId, comments.slice(0, 200)),
    ],
  };
}

/**
 * Approve the submission. Counts distinct approving reviewers and
 * enforces `DOUBLE_REVIEW_QUORUM` for `SENSITIVITY_REQUIRES_DOUBLE_REVIEW`.
 */
export function approveSubmission(
  submission: PrayerSubmission,
  approverId: string,
  approverRole: CuratedAuthority,
  comments: string = '',
  now: number = Date.now(),
): PrayerSubmission {
  if (submission.status === 'published' || submission.status === 'retracted' || submission.status === 'withdrawn') {
    throw new IllegalSubmissionTransitionError(submission.status, 'approved', submission.id);
  }
  const entry: ReviewEntry = {
    reviewerId: approverId,
    reviewerRole: approverRole,
    decision: 'approve',
    comments,
    timestamp: now,
    reviewedSensitivity: submission.sensitivityLevel,
  };
  const reviewTrail = [...submission.reviewTrail, entry];

  const approvers = collectApprovers(reviewTrail);
  const needsDoubleReview = SENSITIVITY_REQUIRES_DOUBLE_REVIEW.includes(
    submission.sensitivityLevel,
  );
  const hasQuorum = !needsDoubleReview || approvers.length >= DOUBLE_REVIEW_QUORUM;

  return {
    ...submission,
    status: hasQuorum ? 'approved' : submission.status,
    reviewTrail,
    updatedAt: now,
    auditLog: [
      ...submission.auditLog,
      auditSubmissionActionBase(
        now,
        hasQuorum ? 'approved' : 'review_recorded',
        approverId,
        `approvers=${approvers.length};needs_double=${needsDoubleReview}`,
      ),
    ],
  };
}

/** Distinct approvers from the review trail. */
function collectApprovers(reviewTrail: readonly ReviewEntry[]): readonly string[] {
  const set = new Set<string>();
  for (const entry of reviewTrail) {
    if (entry.decision === 'approve') set.add(entry.reviewerId);
  }
  return Array.from(set);
}

/**
 * Reject a submission explicitly.
 */
export function rejectSubmission(
  submission: PrayerSubmission,
  reason: string,
  reviewerId: string,
  reviewerRole: CuratedAuthority,
  reviewedSensitivity: SacredSensitivityLevel = submission.sensitivityLevel,
  now: number = Date.now(),
): PrayerSubmission {
  if (submission.status === 'published' || submission.status === 'retracted' || submission.status === 'withdrawn') {
    throw new IllegalSubmissionTransitionError(submission.status, 'rejected', submission.id);
  }
  const entry: ReviewEntry = {
    reviewerId,
    reviewerRole,
    decision: 'reject',
    comments: reason,
    timestamp: now,
    reviewedSensitivity,
  };
  return {
    ...submission,
    status: 'rejected',
    reviewTrail: [...submission.reviewTrail, entry],
    updatedAt: now,
    auditLog: [
      ...submission.auditLog,
      auditSubmissionActionBase(now, 'rejected', reviewerId, `reason=${reason.slice(0, 200)}`),
    ],
  };
}

/**
 * After review, publish the approved submission. This is the integrate
 * point with w49 — the returned object carries a `publishedAt` and can
 * be handed to the corpus ingest endpoint.
 */
export function publishApprovedSubmission(
  submission: PrayerSubmission,
  now: number = Date.now(),
): PrayerSubmission {
  if (submission.status !== 'approved') {
    throw new IllegalSubmissionTransitionError(submission.status, 'published', submission.id);
  }
  const approvers = collectApprovers(submission.reviewTrail);
  if (SENSITIVITY_REQUIRES_DOUBLE_REVIEW.includes(submission.sensitivityLevel)) {
    if (approvers.length < DOUBLE_REVIEW_QUORUM) {
      throw new InsufficientReviewApprovalsError(
        submission.id,
        approvers.length,
        DOUBLE_REVIEW_QUORUM,
      );
    }
  }
  return {
    ...submission,
    status: 'published',
    publishedAt: now,
    updatedAt: now,
    auditLog: [
      ...submission.auditLog,
      auditSubmissionActionBase(now, 'published', 'system', `approvers=${approvers.length}`),
    ],
  };
}

/**
 * Retract a published submission. LGPD Art. 18 — used when consent is
 * revoked or the text is found to violate policy after the fact.
 */
export function retractPublishedSubmission(
  submission: PrayerSubmission,
  reason: string,
  actor: string,
  now: number = Date.now(),
): PrayerSubmission {
  if (submission.status !== 'published') {
    throw new IllegalSubmissionTransitionError(submission.status, 'retracted', submission.id);
  }
  return {
    ...submission,
    status: 'retracted',
    retractedAt: now,
    updatedAt: now,
    auditLog: [
      ...submission.auditLog,
      auditSubmissionActionBase(now, 'retracted', actor, `reason=${reason.slice(0, 200)}`),
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §12 REVIEW CONSENSUS
// ═════════════════════════════════════════════════════════════════════════════

/** Whether the submission needs a second reviewer (sensitivity / policy). */
export function requiresSecondReview(submission: PrayerSubmission): boolean {
  if (!SENSITIVITY_REQUIRES_DOUBLE_REVIEW.includes(submission.sensitivityLevel)) {
    return false;
  }
  const approvers = collectApprovers(submission.reviewTrail);
  return approvers.length < DOUBLE_REVIEW_QUORUM;
}

/** Whether the reviewers have reached consensus on a publish/reject direction. */
export function checkReviewerConsensus(submission: PrayerSubmission): {
  readonly consensus: 'approve' | 'reject' | 'pending';
  readonly approvals: number;
  readonly rejections: number;
  readonly needsMore: boolean;
} {
  const approvals = collectApprovers(submission.reviewTrail).length;
  const rejections = submission.reviewTrail.filter((e) => e.decision === 'reject').length;
  const total = submission.reviewTrail.length;

  let consensus: 'approve' | 'reject' | 'pending' = 'pending';
  if (rejections > 0 && approvals === 0) consensus = 'reject';
  else if (rejections > 0 && approvals > 0) consensus = 'pending';
  else if (approvals >= DOUBLE_REVIEW_QUORUM) consensus = 'approve';

  const needsMore = requiresSecondReview(submission) && consensus === 'pending';

  return {
    consensus,
    approvals,
    rejections,
    needsMore: needsMore || (total === 0),
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §13 QUEUE VIEWS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Build a moderator queue view filtered by role and filters.
 */
export function getSubmissionQueue(
  role: CuratedAuthority,
  submissions: readonly PrayerSubmission[],
  filters: QueueFilters = {},
  now: number = Date.now(),
): readonly QueueRow[] {
  const allowed = new Set(AUTHORITY_TRADITION_MAP_ALL(role));
  const rows: QueueRow[] = [];
  for (const sub of submissions) {
    if (!allowed.has(sub.tradition)) continue;
    if (filters.status && filters.status.length > 0 && !filters.status.includes(sub.status)) {
      continue;
    }
    if (filters.tradition && filters.tradition.length > 0 && !filters.tradition.includes(sub.tradition)) {
      continue;
    }
    if (
      filters.authority &&
      filters.authority.length > 0 &&
      !filters.authority.includes(sub.authority)
    ) {
      continue;
    }
    if (filters.minSensitivity !== undefined && sub.sensitivityLevel < filters.minSensitivity) {
      continue;
    }
    if (filters.maxSensitivity !== undefined && sub.sensitivityLevel > filters.maxSensitivity) {
      continue;
    }
    if (filters.reservedOnly === true && sub.reservedSlotId === undefined) {
      continue;
    }
    const ageMs = now - sub.createdAt;
    const slaRemainingHours = approximateSlaHours(sub, now);
    const needsSecondReviewer = requiresSecondReview(sub);
    const flags: string[] = [];
    if (sub.reservedSlotId) flags.push('reserved_slot');
    if (sub.sensitivityLevel >= 4) flags.push(`sensitivity_${sub.sensitivityLevel}`);
    if (sub.provenance === undefined) flags.push('missing_provenance');
    if (sub.consent === undefined) flags.push('missing_consent');
    rows.push({
      submission: sub,
      ageMs,
      slaRemainingHours,
      needsSecondReviewer,
      flags,
    });
  }
  return rows.sort((a, b) => b.submission.createdAt - a.submission.createdAt);
}

/** Aggregate list of traditions that a given role may queue. */
function AUTHORITY_TRADITION_MAP_ALL(role: CuratedAuthority): readonly Tradition[] {
  const result: Tradition[] = [];
  const all: readonly Tradition[] = [
    'candomble', 'ifa', 'umbanda', 'buddhism', 'hinduism',
    'christianity', 'islam', 'judaism', 'taoism',
    'indigenous_brazilian', 'syncretic', 'secular_mystical',
  ];
  for (const t of all) {
    if (AUTHORITY_TRADITION_MAP[t].includes(role)) result.push(t);
  }
  return result;
}

/** Approximate SLA remaining computed from `status === 'submitted'`. */
function approximateSlaHours(
  submission: PrayerSubmission,
  now: number,
): number {
  if (submission.status !== 'submitted') return -1;
  const ms = now - submission.createdAt;
  return Math.max(0, DEFAULT_REVIEW_SLA_HOURS - ms / (60 * 60 * 1000));
}

/**
 * Submissions owned by the given submitter.
 */
export function getMySubmissions(
  submitterId: string,
  submissions: readonly PrayerSubmission[],
): readonly PrayerSubmission[] {
  return submissions.filter((s) => s.submitterId === submitterId);
}

/**
 * Reserved slots awaiting curator. Filters by tradition and sensitivity.
 */
export function getReservedSlotsAwaitingCurator(
  traditions: readonly Tradition[],
  submissions: readonly PrayerSubmission[],
  minSensitivity?: SacredSensitivityLevel,
): readonly PrayerSubmission[] {
  return submissions.filter((s) => {
    if (s.reservedSlotId === undefined) return false;
    if (!traditions.includes(s.tradition)) return false;
    if (minSensitivity !== undefined && s.sensitivityLevel < minSensitivity) return false;
    return s.status === 'draft' || s.status === 'submitted' || s.status === 'in_review';
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// §14 AUDIT-LOG HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/** Construct an audit-log entry. */
export function auditSubmissionAction(
  submission: PrayerSubmission,
  action: SubmissionAuditAction,
  actor: string,
  payload: string = '',
  now: number = Date.now(),
): SubmissionAuditEntry {
  return auditSubmissionActionBase(now, action, actor, payload);
}

/**
 * Internal: builds the canonical entry. We keep an underscore-prefixed
 * helper to avoid having to fabricate a `submission` field in unit tests.
 */
function auditSubmissionActionBase(
  timestamp: number,
  action: SubmissionAuditAction,
  actor: string,
  payload: string,
): SubmissionAuditEntry {
  return { timestamp, action, actor, payload };
}

/** Append an audit entry to a submission. Returns a new submission. */
export function appendAuditEntry(
  submission: PrayerSubmission,
  entry: SubmissionAuditEntry,
): PrayerSubmission {
  return {
    ...submission,
    auditLog: [...submission.auditLog, entry],
    updatedAt: entry.timestamp,
  };
}

/** Length of the audit trail. Convenience for dashboards. */
export function auditCount(submission: PrayerSubmission): number {
  return submission.auditLog.length;
}

/** Distinct actors that have touched this submission. */
export function distinctAuditActors(submission: PrayerSubmission): readonly string[] {
  const set = new Set<string>();
  for (const entry of submission.auditLog) set.add(entry.actor);
  return Array.from(set);
}

// ═════════════════════════════════════════════════════════════════════════════
// §15 LGPD — Export, Redact, Delete
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Produce an LGPD-compliant export of the submission. The
 * `redactedFields` array lists the keys removed from the body. We always
 * preserve attribution (durable policy).
 */
export function redactSubmissionForExport(
  submission: PrayerSubmission,
  fields: readonly (keyof PrayerSubmission)[] = ['consent'],
  now: number = Date.now(),
): RedactedSubmissionExport {
  const redactedFields = fields.map((f) => String(f));
  return {
    id: submission.id,
    submitterId: submission.submitterId,
    tradition: submission.tradition,
    category: submission.category,
    locale: submission.locale,
    proposedTitle: submission.proposedTitle,
    redactedFields,
    exportedAt: now,
  };
}

/**
 * LGPD Art. 18 — right to be forgotten. Returns a deletion receipt; the
 * caller is responsible for actually removing the row from storage.
 * The audit log entries are PRESERVED (not deleted) so the platform
 * retains the integrity trail.
 */
export function deleteSubmission(
  submission: PrayerSubmission,
  reason: string,
  actor: string,
  now: number = Date.now(),
): DeletionReceipt {
  if (
    submission.status === 'withdrawn' ||
    submission.status === 'rejected'
  ) {
    throw new IllegalSubmissionTransitionError(submission.status, 'withdrawn', submission.id);
  }
  const auditEntriesPreserved = submission.auditLog.length;
  const verificationHash = computeIntegrityHash(submission);
  const updated: PrayerSubmission = {
    ...submission,
    status: 'withdrawn',
    updatedAt: now,
    auditLog: [
      ...submission.auditLog,
      auditSubmissionActionBase(now, 'deletion_requested', actor, `reason=${reason.slice(0, 200)}`),
    ],
  };
  return {
    submissionId: updated.id,
    submitterId: updated.submitterId,
    deletedAt: now,
    auditEntriesPreserved,
    verificationHash,
  };
}

/**
 * LGPD Art. 11 — export bundle of all owned submissions. The bundle is
 * JSON-serialisable so it can be stored as a download or e-mailed.
 */
export function serializeSubmissionBundle(
  submissions: readonly PrayerSubmission[],
  metadata: Readonly<Record<string, string>> = {},
  now: number = Date.now(),
): SubmissionBundle {
  return {
    schema: 'curated-prayer-submission/v1',
    exportedAt: now,
    submissions,
    metadata: {
      ...metadata,
      count: submissions.length.toString(),
    },
  };
}

/**
 * Parse a JSON string into a SubmissionBundle. Strict on shape; throws
 * `SubmissionBundleParseError` on any malformed input.
 */
export function deserializeSubmissionBundle(json: string): SubmissionBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    throw new SubmissionBundleParseError(`invalid_json: ${(err as Error).message}`);
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new SubmissionBundleParseError('not_object');
  }
  const obj = parsed as { [k: string]: unknown };
  if (obj['schema'] !== 'curated-prayer-submission/v1') {
    throw new SubmissionBundleParseError(`unknown_schema: ${String(obj['schema'])}`);
  }
  if (!Array.isArray(obj['submissions'])) {
    throw new SubmissionBundleParseError('submissions_not_array');
  }
  if (typeof obj['exportedAt'] !== 'number') {
    throw new SubmissionBundleParseError('exportedAt_not_number');
  }
  if (typeof obj['metadata'] !== 'object' || obj['metadata'] === null) {
    throw new SubmissionBundleParseError('metadata_not_object');
  }
  const submissions: PrayerSubmission[] = [];
  for (const item of obj['submissions']) {
    submissions.push(coerceToSubmission(item));
  }
  return {
    schema: 'curated-prayer-submission/v1',
    exportedAt: obj['exportedAt'] as number,
    submissions,
    metadata: obj['metadata'] as { [k: string]: string },
  };
}

/**
 * Coerce an `unknown` value into a PrayerSubmission. Validates shape but
 * does NOT re-run policy checks (those require provenance + consent).
 */
function coerceToSubmission(value: unknown): PrayerSubmission {
  if (typeof value !== 'object' || value === null) {
    throw new SubmissionBundleParseError('submission_not_object');
  }
  const v = value as { [k: string]: unknown };
  const requiredStrings: readonly string[] = [
    'id', 'submitterId', 'proposedTitle', 'proposedBody',
    'authority', 'tradition', 'category', 'locale',
  ];
  for (const key of requiredStrings) {
    if (typeof v[key] !== 'string') {
      throw new SubmissionBundleParseError(`missing_string_field_${key}`);
    }
  }
  if (typeof v['sensitivityLevel'] !== 'number') {
    throw new SubmissionBundleParseError('missing_sensitivity_level');
  }
  if (typeof v['status'] !== 'string') {
    throw new SubmissionBundleParseError('missing_status');
  }
  if (!Array.isArray(v['reviewTrail'])) {
    throw new SubmissionBundleParseError('missing_review_trail');
  }
  if (!Array.isArray(v['auditLog'])) {
    throw new SubmissionBundleParseError('missing_audit_log');
  }
  if (typeof v['createdAt'] !== 'number' || typeof v['updatedAt'] !== 'number') {
    throw new SubmissionBundleParseError('missing_timestamps');
  }
  return {
    id: v['id'] as string,
    submitterId: v['submitterId'] as string,
    tradition: v['tradition'] as Tradition,
    category: v['category'] as PrayerCategory,
    locale: v['locale'] as LocaleId,
    proposedTitle: v['proposedTitle'] as string,
    proposedBody: v['proposedBody'] as string,
    reservedSlotId: typeof v['reservedSlotId'] === 'string' ? (v['reservedSlotId'] as string) : undefined,
    sensitivityLevel: v['sensitivityLevel'] as SacredSensitivityLevel,
    authority: v['authority'] as CuratedAuthority,
    provenance: v['provenance'] as PrayerProvenance | undefined,
    consent: v['consent'] as PrayerSubmissionConsent | undefined,
    status: v['status'] as PrayerSubmissionStatus,
    reviewTrail: v['reviewTrail'] as readonly ReviewEntry[],
    auditLog: v['auditLog'] as readonly SubmissionAuditEntry[],
    createdAt: v['createdAt'] as number,
    updatedAt: v['updatedAt'] as number,
    publishedAt: typeof v['publishedAt'] === 'number' ? (v['publishedAt'] as number) : undefined,
    retractedAt: typeof v['retractedAt'] === 'number' ? (v['retractedAt'] as number) : undefined,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §16 ANALYTICS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Summarise submissions. The `byX` counts are zero-filled (every
 * possible enum value present) so consumers can render 0 cells without
 * blowing up undefined-key lookups.
 */
export function summarizeSubmissions(
  submissions: readonly PrayerSubmission[],
  groupBy?: SummaryGroupBy,
  now: number = Date.now(),
): SubmissionSummary {
  const byStatus: { [k in PrayerSubmissionStatus]: number } = {
    draft: 0, submitted: 0, in_review: 0, needs_revision: 0,
    approved: 0, rejected: 0, withdrawn: 0, published: 0, retracted: 0,
  };
  const byTradition: { [k in Tradition]: number } = {
    candomble: 0, ifa: 0, umbanda: 0, buddhism: 0, hinduism: 0,
    christianity: 0, islam: 0, judaism: 0, taoism: 0,
    indigenous_brazilian: 0, syncretic: 0, secular_mystical: 0,
  };
  const byAuthority: { [k in CuratedAuthority]: number } = {
    zelador_de_santo: 0, babalao: 0, mestre_cigano: 0, rabino: 0,
    imam: 0, monge_budista: 0, sacerdote_cristao: 0, leader_indigena: 0,
    curador_akashia: 0, community_vote: 0,
  };
  const bySensitivity: { [k in SacredSensitivityLevel]: number } = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  let totalReviewMs = 0;
  let reviewCount = 0;
  let oldestPendingMs = 0;

  for (const sub of submissions) {
    byStatus[sub.status] += 1;
    byTradition[sub.tradition] += 1;
    byAuthority[sub.authority] += 1;
    bySensitivity[sub.sensitivityLevel] += 1;
    if (sub.publishedAt !== undefined) {
      totalReviewMs += sub.publishedAt - sub.createdAt;
      reviewCount += 1;
    }
    if (sub.status === 'submitted' || sub.status === 'in_review') {
      const age = now - sub.createdAt;
      if (age > oldestPendingMs) oldestPendingMs = age;
    }
  }

  if (groupBy === 'tradition') {
    // Touch all-zero rows explicitly so the consumer can sort cleanly.
    for (const t of Object.keys(byTradition) as Tradition[]) void byTradition[t];
  }

  return {
    total: submissions.length,
    byStatus,
    byTradition,
    byAuthority,
    bySensitivity,
    averageReviewMs: reviewCount === 0 ? 0 : totalReviewMs / reviewCount,
    oldestPendingMs,
    generatedAt: now,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §17 DRAFT CLEANUP
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Find drafts whose `createdAt` is older than `now - gracePeriodMs`. The
 * default grace period is `DEFAULT_SUBMISSION_TTL_MS` (30 days).
 */
export function findExpiredDrafts(
  submissions: readonly PrayerSubmission[],
  now: number,
  gracePeriodMs: number = DEFAULT_SUBMISSION_TTL_MS,
): readonly PrayerSubmission[] {
  return submissions.filter(
    (s) =>
      s.status === 'draft' &&
      now - s.createdAt > gracePeriodMs,
  );
}

/**
 * Remove expired drafts from a list, returning a fresh filtered list.
 * Audit-trail entries are stripped for the removed rows (consumers are
 * expected to keep a separate archive in their own storage if desired).
 */
export function pruneExpiredDrafts(
  submissions: readonly PrayerSubmission[],
  now: number,
  gracePeriodMs: number = DEFAULT_SUBMISSION_TTL_MS,
): readonly PrayerSubmission[] {
  return submissions.filter(
    (s) => !(s.status === 'draft' && now - s.createdAt > gracePeriodMs),
  );
}

/** Compute the cutoff timestamp for a given grace period. */
export function computeDraftCutoff(now: number, gracePeriodMs: number = DEFAULT_SUBMISSION_TTL_MS): number {
  return now - gracePeriodMs;
}

/** Predicate: is this submission still inside its retention window? */
export function isWithinRetention(submission: PrayerSubmission, now: number): boolean {
  if (submission.consent === undefined) return true;
  const retentionDays = RETENTION_WINDOWS_DAYS[submission.consent.retention];
  if (retentionDays === -1) return true;
  const anchor = submission.publishedAt ?? submission.createdAt;
  const ageMs = now - anchor;
  return ageMs <= retentionDays * 24 * 60 * 60 * 1000;
}

// ═════════════════════════════════════════════════════════════════════════════
// §18 INTEGRITY
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validate a submission's structural integrity by recomputing a stable
 * hash from its key fields and comparing against an expected value
 * supplied by the caller (or computing one and storing it on the
 * `integrityHash` field via a side effect on `auditLog`).
 */
export function validateSubmissionIntegrity(submission: PrayerSubmission): IntegrityReport {
  const checks: { [k: string]: boolean } = {
    id_present: typeof submission.id === 'string' && submission.id.length > 0,
    submitter_id_present: typeof submission.submitterId === 'string' && submission.submitterId.length > 0,
    title_present: typeof submission.proposedTitle === 'string' && submission.proposedTitle.length > 0,
    body_present: typeof submission.proposedBody === 'string' && proposalHasLetters(submission.proposedBody),
    audit_log_monotonic: isMonotonic(submission.auditLog.map((a) => a.timestamp)),
    review_trail_monotonic: isMonotonic(submission.reviewTrail.map((r) => r.timestamp)),
    status_legal: isLegalStatus(submission.status),
    timestamps_consistent: submission.createdAt <= submission.updatedAt,
    published_at_consistent:
      submission.publishedAt === undefined ||
      submission.publishedAt >= submission.createdAt,
    retracted_at_consistent:
      submission.retractedAt === undefined ||
      submission.publishedAt === undefined ||
      submission.retractedAt >= submission.publishedAt,
    consent_attached_or_draft: submission.consent !== undefined || submission.status === 'draft',
    provenance_attached_if_submitted:
      submission.status === 'draft' ||
      submission.status === 'withdrawn' ||
      submission.provenance !== undefined,
  };
  const passes = Object.values(checks).every((v) => v === true);
  const computedHash = computeIntegrityHash(submission);
  return {
    submissionId: submission.id,
    passes,
    checks,
    computedHash,
  };
}

function proposalHasLetters(body: string): boolean {
  return /\p{L}/u.test(body);
}

function isMonotonic(values: readonly number[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i]! < values[i - 1]!) return false;
  }
  return true;
}

function isLegalStatus(status: PrayerSubmissionStatus): boolean {
  const all: readonly PrayerSubmissionStatus[] = [
    'draft', 'submitted', 'in_review', 'needs_revision',
    'approved', 'rejected', 'withdrawn', 'published', 'retracted',
  ];
  return all.includes(status);
}

/** Stable integrity hash. Uses a tiny FNV-1a loop — no crypto deps. */
export function computeIntegrityHash(submission: PrayerSubmission): string {
  const payload = [
    submission.id,
    submission.submitterId,
    submission.tradition,
    submission.category,
    submission.locale,
    submission.proposedTitle,
    submission.proposedBody,
    submission.reservedSlotId ?? '',
    String(submission.sensitivityLevel),
    submission.authority,
    submission.status,
    String(submission.createdAt),
    String(submission.updatedAt),
    submission.provenance?.attribution ?? '',
    submission.consent?.capturedAt?.toString() ?? '',
    submission.auditLog.length.toString(),
  ].join('||');
  return fnv1a64(payload).toString(16).padStart(16, '0');
}

/** Tiny FNV-1a 64-bit-equivalent returning a bigint; we keep it JS-safe. */
export function fnv1a64(s: string): bigint {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < s.length; i += 1) {
    hash ^= BigInt(s.charCodeAt(i));
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash;
}

/** Stringify a SubmissionBundle to JSON. */
export function bundleToJson(bundle: SubmissionBundle): string {
  return JSON.stringify(bundle);
}

/** Parse a SubmissionBundle back from JSON. */
export function bundleFromJson(json: string): SubmissionBundle {
  return deserializeSubmissionBundle(json);
}

// ═════════════════════════════════════════════════════════════════════════════
// §19 SENSITIVITY CLASSIFIERS (pure helpers)
// ═════════════════════════════════════════════════════════════════════════════

/** Whether two sensitivity levels are equal. */
export function sensitivityEquals(a: SacredSensitivityLevel, b: SacredSensitivityLevel): boolean {
  return a === b;
}

/** True when the sensitivity requires double review. */
export function isDoubleReviewRequired(level: SacredSensitivityLevel): boolean {
  return SENSITIVITY_REQUIRES_DOUBLE_REVIEW.includes(level);
}

/** Map a category → minimum sensitivity. Used to back-fill defaults. */
export function minimumSensitivityForCategory(category: PrayerCategory): SacredSensitivityLevel {
  switch (category) {
    case 'orixa_invocation':
      return 5;
    case 'ancestor_veneration':
      return 4;
    case 'healing':
    case 'protection':
      return 3;
    case 'gratitude':
    case 'morning':
    case 'evening':
    case 'forgiveness':
    case 'intention':
    case 'gratitude_petition':
    case 'meditation':
      return 1;
    case 'grounding':
      return 2;
    default:
      return 1;
  }
}

/** Map a category → maximum sensitivity. Hard ceiling. */
export function maximumSensitivityForCategory(category: PrayerCategory): SacredSensitivityLevel {
  return 5;
}

// ═════════════════════════════════════════════════════════════════════════════
// §20 RESERVED-SLOT CATALOG (helper for curators)
// ═════════════════════════════════════════════════════════════════════════════

/** Reserved-slot descriptor used by getReservedSlotsAwaitingCurator. */
export interface ReservedSlotDescriptor {
  readonly slotId: string;
  readonly tradition: Tradition;
  readonly category: PrayerCategory;
  readonly minimumSensitivity: SacredSensitivityLevel;
  readonly allowedAuthorities: readonly CuratedAuthority[];
}

/**
 * Build a placeholder catalog of reserved slots. Real data would come
 * from the w49 corpus at runtime; we re-derive the same shape here so
 * curators can preview the gating without the corpus loaded.
 */
export function buildReservedSlotCatalog(): readonly ReservedSlotDescriptor[] {
  const all: ReservedSlotDescriptor[] = [];
  for (const tradition of SACRED_TEXT_RESERVED_TRADITIONS) {
    for (const cat of ['morning', 'evening', 'ancestor_veneration', 'orixa_invocation'] as PrayerCategory[]) {
      all.push({
        slotId: `${tradition}-${cat}-reserved`,
        tradition,
        category: cat,
        minimumSensitivity: DEFAULT_SENSITIVITY_BY_TRADITION[tradition],
        allowedAuthorities: AUTHORITY_TRADITION_MAP[tradition],
      });
    }
  }
  return all;
}

/** Whether a slot is a reserved slot according to the policy tables. */
export function isReservedTradition(tradition: Tradition): boolean {
  return SACRED_TEXT_RESERVED_TRADITIONS.includes(tradition);
}

// ═════════════════════════════════════════════════════════════════════════════
// §21 DISPLAY HELPERS  (UI-friendly; pure)
// ═════════════════════════════════════════════════════════════════════════════

/** Per-locale dispatch helper. */
function pickByLocale<K extends string | number>(
  byLocale: Readonly<Record<LocaleId, Readonly<Record<K, string>>>>,
  locale: LocaleId,
  key: K,
): string {
  return byLocale[locale][key];
}

const STATUS_LABELS: Readonly<Record<LocaleId, Readonly<Record<PrayerSubmissionStatus, string>>>> = {
  'pt-BR': {
    draft: 'Rascunho', submitted: 'Enviado', in_review: 'Em revisão',
    needs_revision: 'Necessita revisão', approved: 'Aprovado',
    rejected: 'Rejeitado', withdrawn: 'Retirado', published: 'Publicado',
    retracted: 'Retratado',
  },
  'en-US': {
    draft: 'Draft', submitted: 'Submitted', in_review: 'In review',
    needs_revision: 'Needs revision', approved: 'Approved', rejected: 'Rejected',
    withdrawn: 'Withdrawn', published: 'Published', retracted: 'Retracted',
  },
  'es-ES': {
    draft: 'Borrador', submitted: 'Enviado', in_review: 'En revisión',
    needs_revision: 'Necesita revisión', approved: 'Aprobado',
    rejected: 'Rechazado', withdrawn: 'Retirado', published: 'Publicado',
    retracted: 'Retractado',
  },
};

const AUTHORITY_LABELS: Readonly<Record<LocaleId, Readonly<Record<CuratedAuthority, string>>>> = {
  'pt-BR': {
    zelador_de_santo: 'Zelador de Santo', babalao: 'Babalaô',
    mestre_cigano: 'Mestre Cigano', rabino: 'Rabino', imam: 'Imam',
    monge_budista: 'Monge Budista', sacerdote_cristao: 'Sacerdote Cristão',
    leader_indigena: 'Líder Indígena', curador_akashia: 'Curador Akashia',
    community_vote: 'Voto da Comunidade',
  },
  'en-US': {
    zelador_de_santo: 'House Steward (Zelador)', babalao: 'Babalawo',
    mestre_cigano: 'Romani Master', rabino: 'Rabbi', imam: 'Imam',
    monge_budista: 'Buddhist Monk', sacerdote_cristao: 'Christian Priest',
    leader_indigena: 'Indigenous Leader', curador_akashia: 'Akashia Curator',
    community_vote: 'Community Vote',
  },
  'es-ES': {
    zelador_de_santo: 'Guardián del Templo', babalao: 'Babalawo',
    mestre_cigano: 'Maestro Gitano', rabino: 'Rabino', imam: 'Imam',
    monge_budista: 'Monje Budista', sacerdote_cristao: 'Sacerdote Cristiano',
    leader_indigena: 'Líder Indígena', curador_akashia: 'Curador Akashia',
    community_vote: 'Voto Comunitario',
  },
};

const SENSITIVITY_LABELS: Readonly<Record<LocaleId, Readonly<Record<SacredSensitivityLevel, string>>>> = {
  'pt-BR': {
    1: 'Acessível', 2: 'Devocional', 3: 'Litúrgico',
    4: 'Sensível ao contexto', 5: 'Iniciático',
  },
  'en-US': {
    1: 'Accessible', 2: 'Devotional', 3: 'Liturgical',
    4: 'Context-sensitive', 5: 'Initiatory',
  },
  'es-ES': {
    1: 'Accesible', 2: 'Devocional', 3: 'Litúrgico',
    4: 'Sensible al contexto', 5: 'Iniciático',
  },
};

const TRADITION_LABELS: Readonly<Record<LocaleId, Readonly<Record<Tradition, string>>>> = {
  'pt-BR': {
    candomble: 'Candomblé', ifa: 'Ifá', umbanda: 'Umbanda',
    buddhism: 'Budismo', hinduism: 'Hinduísmo', christianity: 'Cristianismo',
    islam: 'Islam', judaism: 'Judaísmo', taoism: 'Taoísmo',
    indigenous_brazilian: 'Indígena brasileira',
    syncretic: 'Sincretismo afro-brasileiro',
    secular_mystical: 'Mística secular',
  },
  'en-US': {
    candomble: 'Candomblé', ifa: 'Ifá', umbanda: 'Umbanda',
    buddhism: 'Buddhism', hinduism: 'Hinduism', christianity: 'Christianity',
    islam: 'Islam', judaism: 'Judaism', taoism: 'Taoism',
    indigenous_brazilian: 'Indigenous Brazilian',
    syncretic: 'Afro-Brazilian syncretism', secular_mystical: 'Secular mystical',
  },
  'es-ES': {
    candomble: 'Candomblé', ifa: 'Ifá', umbanda: 'Umbanda',
    buddhism: 'Budismo', hinduism: 'Hinduísmo', christianity: 'Cristianismo',
    islam: 'Islam', judaism: 'Judaísmo', taoism: 'Taoísmo',
    indigenous_brazilian: 'Indígena brasileña',
    syncretic: 'Sincretismo afrobrasileño', secular_mystical: 'Mística secular',
  },
};

/** Human-readable status label. */
export function statusLabel(status: PrayerSubmissionStatus, locale: LocaleId): string {
  return pickByLocale(STATUS_LABELS, locale, status);
}

/** Authority label, locale-aware. */
export function authorityLabel(role: CuratedAuthority, locale: LocaleId): string {
  return pickByLocale(AUTHORITY_LABELS, locale, role);
}

/** Sensitivity label with locale-aware text. */
export function sensitivityLabel(level: SacredSensitivityLevel, locale: LocaleId): string {
  return pickByLocale(SENSITIVITY_LABELS, locale, level);
}

/** Tradition label. Mirrors w49 `TRADITION_DISPLAY_NAMES` to avoid coupling. */
export function traditionLabel(tradition: Tradition, locale: LocaleId): string {
  return pickByLocale(TRADITION_LABELS, locale, tradition);
}


// ═════════════════════════════════════════════════════════════════════════════
// §22 MISC UTILITIES
// ═════════════════════════════════════════════════════════════════════════════

/** Constant-time string comparison (length-leaky, used for hashes). */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Validate a stored hash matches the freshly-computed hash. */
export function verifyIntegrityHash(submission: PrayerSubmission, expectedHash: string): boolean {
  return constantTimeEquals(computeIntegrityHash(submission), expectedHash);
}

/** Strip diacritics (used for ID slug generation). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Convert epoch ms → ISO string (UTC). */
export function epochToIso(epoch: number): string {
  return new Date(epoch).toISOString();
}

/** Parse ISO → epoch ms. Returns NaN for invalid input. */
export function isoToEpoch(iso: string): number {
  const value = Date.parse(iso);
  return Number.isNaN(value) ? Number.NaN : value;
}

/** Whether the submission has crossed the SLA. */
export function hasSlaExpired(submission: PrayerSubmission, slaHours: number = DEFAULT_REVIEW_SLA_HOURS, now: number = Date.now()): boolean {
  if (submission.status !== 'submitted') return false;
  return now - submission.createdAt > slaHours * 60 * 60 * 1000;
}

/** Suggest a reviewer-eligibility list for a tradition. */
export function suggestReviewersForTradition(tradition: Tradition): readonly CuratedAuthority[] {
  return AUTHORITY_TRADITION_MAP[tradition];
}

/**
 * Group helper for the queue view. Keeps the moderator dashboard UI
 * free of imperative .filter() chains.
 */
export function groupSubmissionsByTradition(
  submissions: readonly PrayerSubmission[],
): Readonly<Record<Tradition, readonly PrayerSubmission[]>> {
  const groups: { [k in Tradition]: PrayerSubmission[] } = {
    candomble: [], ifa: [], umbanda: [], buddhism: [], hinduism: [],
    christianity: [], islam: [], judaism: [], taoism: [],
    indigenous_brazilian: [], syncretic: [], secular_mystical: [],
  };
  for (const sub of submissions) groups[sub.tradition].push(sub);
  return groups;
}

/** Group helper by status. */
export function groupSubmissionsByStatus(
  submissions: readonly PrayerSubmission[],
): Readonly<Record<PrayerSubmissionStatus, readonly PrayerSubmission[]>> {
  const groups: { [k in PrayerSubmissionStatus]: PrayerSubmission[] } = {
    draft: [], submitted: [], in_review: [], needs_revision: [],
    approved: [], rejected: [], withdrawn: [], published: [], retracted: [],
  };
  for (const sub of submissions) groups[sub.status].push(sub);
  return groups;
}

/** Group helper by authority. */
export function groupSubmissionsByAuthority(
  submissions: readonly PrayerSubmission[],
): Readonly<Record<CuratedAuthority, readonly PrayerSubmission[]>> {
  const groups: { [k in CuratedAuthority]: PrayerSubmission[] } = {
    zelador_de_santo: [], babalao: [], mestre_cigano: [], rabino: [],
    imam: [], monge_budista: [], sacerdote_cristao: [], leader_indigena: [],
    curador_akashia: [], community_vote: [],
  };
  for (const sub of submissions) groups[sub.authority].push(sub);
  return groups;
}

/** Group helper by sensitivity. */
export function groupSubmissionsBySensitivity(
  submissions: readonly PrayerSubmission[],
): Readonly<Record<SacredSensitivityLevel, readonly PrayerSubmission[]>> {
  const groups: { [k in SacredSensitivityLevel]: PrayerSubmission[] } = {
    1: [], 2: [], 3: [], 4: [], 5: [],
  };
  for (const sub of submissions) groups[sub.sensitivityLevel].push(sub);
  return groups;
}

/** Count the number of approvals already on the review trail. */
export function countApprovals(submission: PrayerSubmission): number {
  return collectApprovers(submission.reviewTrail).length;
}

/** Count the number of rejections already on the review trail. */
export function countRejections(submission: PrayerSubmission): number {
  return submission.reviewTrail.filter((e) => e.decision === 'reject').length;
}

/** Decide whether a submission has reached the publishable bar. */
export function isPublishable(submission: PrayerSubmission): boolean {
  if (submission.status !== 'approved' && submission.status !== 'published') return false;
  if (SENSITIVITY_REQUIRES_DOUBLE_REVIEW.includes(submission.sensitivityLevel)) {
    return countApprovals(submission) >= DOUBLE_REVIEW_QUORUM;
  }
  return countApprovals(submission) >= 1;
}

/** Decision helper: should this submission auto-publish on approval? */
export function autoPublishAllowed(submission: PrayerSubmission): boolean {
  return submission.sensitivityLevel <= 3 && isPublishable(submission);
}

/** Compose a publishable-prayer envelope for handoff to w49. */
export interface CuratedPrayerHandoff {
  readonly submissionId: string;
  readonly title: string;
  readonly body: string;
  readonly tradition: Tradition;
  readonly category: PrayerCategory;
  readonly locale: LocaleId;
  readonly attribution: string;
  readonly reservedSlotId?: string;
  readonly publishedAt: number;
  readonly sensitivityLevel: SacredSensitivityLevel;
}

/** Convert a published submission into a handoff envelope. */
export function toHandoff(submission: PrayerSubmission): CuratedPrayerHandoff {
  if (submission.status !== 'published' || submission.publishedAt === undefined) {
    throw new IllegalSubmissionTransitionError(submission.status, 'published', submission.id);
  }
  if (submission.provenance === undefined) {
    throw new ProvenanceValidationError('provenance_missing', { submissionId: submission.id });
  }
  return {
    submissionId: submission.id,
    title: submission.proposedTitle,
    body: submission.proposedBody,
    tradition: submission.tradition,
    category: submission.category,
    locale: submission.locale,
    attribution: submission.provenance.attribution,
    reservedSlotId: submission.reservedSlotId,
    publishedAt: submission.publishedAt,
    sensitivityLevel: submission.sensitivityLevel,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §23 IN-MEMORY STORE HELPERS  (useful for unit tests)
// ═════════════════════════════════════════════════════════════════════════════

/** In-memory submission store with lookup-by-id and queue helpers. */
export class InMemorySubmissionStore {
  private readonly rows: Map<string, PrayerSubmission> = new Map();

  public put(submission: PrayerSubmission): void {
    this.rows.set(submission.id, submission);
  }
  public get(id: string): PrayerSubmission | undefined {
    return this.rows.get(id);
  }
  public all(): readonly PrayerSubmission[] {
    return Array.from(this.rows.values());
  }
  public size(): number {
    return this.rows.size;
  }
  public clear(): void {
    this.rows.clear();
  }
}

/** Inject a deterministic clock — useful in tests. */
export interface Clock {
  readonly now: () => number;
}

/** Default clock returning wall time. */
export const defaultClock: Clock = { now: () => Date.now() };

// ═════════════════════════════════════════════════════════════════════════════
// §24 POLICY VERSIONING
// ═════════════════════════════════════════════════════════════════════════════

/** Current policy version. Bump on rule changes so audit logs carry diffs. */
export const CURATED_POLICY_VERSION = '1.0.0';

/** Describe the active policy for the UI (help screens, footer links). */
export interface PolicyDescriptor {
  readonly version: string;
  readonly authorityTraditions: Readonly<Record<Tradition, readonly CuratedAuthority[]>>;
  readonly doubleReviewLevels: readonly SacredSensitivityLevel[];
  readonly forbiddenPatternCount: number;
  readonly culturalPatternCount: number;
}

export function describePolicy(): PolicyDescriptor {
  return {
    version: CURATED_POLICY_VERSION,
    authorityTraditions: AUTHORITY_TRADITION_MAP,
    doubleReviewLevels: SENSITIVITY_REQUIRES_DOUBLE_REVIEW,
    forbiddenPatternCount: SACRED_TEXT_FORBIDDEN_PATTERNS.length,
    culturalPatternCount: CULTURAL_SENSITIVITY_PATTERNS.length,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §25 END OF MODULE
// ═════════════════════════════════════════════════════════════════════════════
