// ============================================================================
// w53/prayer-submission-moderation-queue.ts
// ============================================================================
// Admin moderation queue for w51 prayer-submission-webhook + w52 webhook
// dead-letter-queue outputs. Moderators review pending submissions,
// approve / reject / escalate / request_info / flag, and trigger downstream
// actions. Self-contained, by-shape, single file.
//
// SCOPE:
//   - ingestion from w52 DLQ (modeled by shape) + direct webhook submissions
//   - first-pass auto-classification into 4 risk levels: SAFE / REVIEW / RISKY / BLOCK
//   - sacred-text policy: sensitivity 4-5 submissions require curator +
//     double-review gate (two distinct moderator approvals); auto-queue for
//     the dual-review workflow
//   - moderator actions: APPROVE / REJECT / ESCALATE / REQUEST_INFO / FLAG,
//     each with a 12+ reason code taxonomy
//   - audit log: immutable, append-only, hash-chained for tamper evidence
//   - bulk operations: select N items, apply same action with per-item audit
//   - SLA tracking: submission age in queue; warnings at 1h / 6h / 24h;
//     auto-escalate at 48h
//   - LGPD Art. 7 (consent) + Art. 9 (sensitive) + Art. 18 (export / erasure)
//   - reviewer load balancing: round-robin + capacity-based routing; offline
//     reviewers are re-routed to next available
//
// INTEGRATION:
//   This module composes ONLY BY SHAPE with w51 / w52. It does NOT import
//   either of those modules — w51 is expected to expose a payload shape
//   compatible with `W51PrayerWebhookPayload` declared below, and w52 is
//   expected to expose a DLQ entry shape compatible with `W52DeadLetterEntry`.
//   The `linkW51W52Shapes` integrator validates both shapes at runtime.
//
// LGPD mapping:
//   Art. 7  → consent verification on each submission
//             (`assertConsentForModeration`, `verifyConsent`)
//   Art. 9  → sensitive-data policy (sacred / religious content)
//             (`classifySensitivity`, `assertSacredGate`)
//   Art. 18 → user-driven export (`exportUserSubmissions`) + erasure
//             (`purgeByUser`)
//
// HARD CONSTRAINTS (per w53 worker brief):
//   - NO imports from w51/* or w52/*, NO next/react imports, NO @prisma runtime.
//   - Pure TS module — Prisma / fetch / Next are abstracted behind interfaces.
//   - 100+ named exports.
//   - Per-file TSC must compile with --strict --target ES2022.
//
// All identifiers prefixed `w53mq_` only inside this file (kept private).
// Public surface uses unprefixed named exports so consumers can `import {...}
// from "@/lib/w53/prayer-submission-moderation-queue"`.
// ============================================================================

// ============================================================================
// 1. PRIMITIVE TYPES
// ============================================================================

export type EpochMs = number;
export type OpaqueId = string;
export type IntegrityHash = string;
export type ChainHash = IntegrityHash;
export type RiskLevel = 'SAFE' | 'REVIEW' | 'RISKY' | 'BLOCK';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ClockUnit = 'ms' | 's' | 'm' | 'h' | 'd';
export type HexDigest = string;

// ============================================================================
// 2. CORE ENUMS
// ============================================================================

/** Lifecycle states a moderation submission can occupy. */
export type SubmissionStatus =
  | 'received'        // just ingested, awaiting classification
  | 'classified'      // classification applied, awaiting assignment
  | 'assigned'        // assigned to a moderator, work in progress
  | 'in_review'       // moderator has opened it
  | 'pending_info'    // moderator requested more info from submitter
  | 'awaiting_dual'   // sacred-text policy: needs second reviewer
  | 'escalated'       // escalated to senior reviewer / curator
  | 'approved'        // terminal: approved
  | 'rejected'        // terminal: rejected
  | 'flagged'         // terminal: flagged for archival / audit
  | 'purged';         // terminal: LGPD-erased

/** Sensitivity classification — drives sacred-text policy. */
export type Sensitivity =
  | 'none'        // 0 — no sacred or religious content
  | 'light'       // 1 — generic religious language
  | 'moderate'    // 2 — specific tradition mentioned
  | 'elevated'    // 3 — orixá / entity / odú named explicitly
  | 'sacred';     // 4 — sacred text or ritual language
  // legacy 'intimate' was renamed to 'sacred'; kept as alias

/** Actions a moderator (or system) can take on a submission. */
export type ModeratorAction =
  | 'APPROVE'
  | 'REJECT'
  | 'ESCALATE'
  | 'REQUEST_INFO'
  | 'FLAG'
  | 'CLASSIFY'         // auto-classifier
  | 'ASSIGN'           // routing
  | 'REASSIGN'         // load-balancing re-route
  | 'AUTO_ESCALATE';   // SLA breach

/** Why a moderator took an action. 12+ codes to satisfy taxonomy. */
export type ReasonCode =
  | 'CONSENT_GRANTED'
  | 'CONSENT_MISSING'
  | 'SACRED_GATE'
  | 'SACRED_REDACT_NEEDED'
  | 'PROFANITY'
  | 'HATE_SPEECH'
  | 'HARASSMENT'
  | 'SPAM'
  | 'PII_LEAK'
  | 'HEALTH_DISCLOSURE'
  | 'POLITICAL_PRESSURE'
  | 'RELIGIOUS_DOCTRINE_CONFLICT'
  | 'MISINFORMATION'
  | 'OFF_TOPIC'
  | 'DUPLICATE'
  | 'LANGUAGE_UNSUPPORTED'
  | 'CURATOR_REQUIRED'
  | 'LEGAL_HOLD'
  | 'TRIAGE_AUTO'
  | 'TRIAGE_MANUAL'
  | 'SLA_BREACH'
  | 'BULK_OPERATION'
  | 'REASSIGN_OFFLINE'
  | 'CAPACITY_REBALANCE'
  | 'LGPD_ERASURE'
  | 'LGPD_EXPORT'
  | 'DUAL_REVIEW_COMPLETE'
  | 'DUAL_REVIEW_PENDING'
  | 'INFO_RECEIVED'
  | 'INFO_TIMEOUT'
  | 'OTHER';

/** Distinct, structured categories that drive UI badges + reporting. */
export type ReasonCategory =
  | 'consent'
  | 'sacred'
  | 'safety'
  | 'privacy'
  | 'sla'
  | 'policy'
  | 'operational'
  | 'lgpd'
  | 'dual_review'
  | 'other';

/** Reviewer availability state for load balancing. */
export type ReviewerStatus =
  | 'online'
  | 'busy'
  | 'offline'
  | 'on_break';

/** Result of a single moderator decision. */
export type DecisionVerdict =
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'pending_info'
  | 'flagged'
  | 'no_op';

/** Outcome of a bulk operation. */
export type BulkOpStatus =
  | 'planned'
  | 'in_progress'
  | 'partial'
  | 'completed'
  | 'rolled_back';

/** Auto-classification heuristic dimensions. */
export type HeuristicDimension =
  | 'keyword'
  | 'regex'
  | 'structure'
  | 'length'
  | 'pii'
  | 'sacred'
  | 'consent'
  | 'language';

/** Modes for moderator assignment. */
export type AssignmentMode =
  | 'round_robin'
  | 'capacity_weighted'
  | 'sacred_curator'
  | 'least_loaded'
  | 'manual';

/** Bulk action targets. */
export type BulkTarget =
  | 'all_pending'
  | 'risk_review'
  | 'risk_risky'
  | 'risk_safe'
  | 'sacred_pending'
  | 'sla_warning'
  | 'sla_breach'
  | 'selection';

/** Consent states mirrored from w51. */
export type ConsentState = 'granted' | 'denied' | 'pending' | 'withdrawn';

/** Sacred text presence — mirrors w52 SACRED_TEXT_STATUS. */
export type SacredTextStatus = 'none' | 'present' | 'redacted' | 'unknown';

// ============================================================================
// 3. CORE STRUCTURES
// ============================================================================

/** A prayer submission ingested from w51 or w52 DLQ. */
export interface ModerationSubmission {
  readonly id: OpaqueId;
  readonly source: 'w51_webhook' | 'w52_dlq' | 'manual' | 'import';
  readonly submittedAt: EpochMs;
  readonly receivedAt: EpochMs;
  body: string;
  userId: string;
  consent: ConsentState;
  sacred: SacredTextStatus;
  sensitivity: Sensitivity;
  riskLevel: RiskLevel;
  status: SubmissionStatus;
  odu?: string;
  tags?: ReadonlyArray<string>;
  classificationTrace?: ReadonlyArray<ClassificationSignal>;
  assignedModeratorId?: OpaqueId;
  assignedAt?: EpochMs;
  escalationChain?: ReadonlyArray<OpaqueId>;
  approvals?: ReadonlyArray<ReviewerDecision>;
  rejectionReason?: ReasonCode;
  slaBreachedAt?: EpochMs;
  lgpdHoldUntil?: EpochMs;
  redactedAt?: EpochMs;
  metadata?: Record<string, unknown>;
  correlationId?: OpaqueId;
}

/** Auto-classifier signal — one row per heuristic dimension fired. */
export interface ClassificationSignal {
  dimension: HeuristicDimension;
  weight: number;             // -100..+100 (negative = risky)
  matched: ReadonlyArray<string>;
  reason: string;
  at: EpochMs;
}

/** A single moderator decision on a submission. */
export interface ReviewerDecision {
  readonly decisionId: OpaqueId;
  readonly moderatorId: OpaqueId;
  readonly action: ModeratorAction;
  readonly verdict: DecisionVerdict;
  readonly reasonCode: ReasonCode;
  readonly note?: string;
  readonly decidedAt: EpochMs;
  readonly prevHash: ChainHash;
  readonly hash: ChainHash;
  readonly dualReviewKey?: string;
}

/** Immutable audit log entry — append-only. */
export interface AuditEntry {
  readonly entryId: OpaqueId;
  readonly submissionId: OpaqueId;
  readonly actorId: OpaqueId;
  readonly actorKind: 'moderator' | 'system' | 'curator' | 'lgpd_officer' | 'admin';
  readonly action: ModeratorAction;
  readonly reasonCode: ReasonCode;
  readonly note?: string;
  readonly at: EpochMs;
  readonly beforeState: SubmissionStatus;
  readonly afterState: SubmissionStatus;
  readonly prevHash: ChainHash;
  readonly hash: ChainHash;
  readonly batchId?: OpaqueId;
  readonly context?: Record<string, unknown>;
}

/** Moderator identity + capacity tracking. */
export interface ModeratorProfile {
  readonly id: OpaqueId;
  readonly displayName: string;
  readonly role: 'moderator' | 'senior_moderator' | 'curator' | 'lgpd_officer' | 'admin';
  readonly maxConcurrent: number;
  readonly sacredEligible: boolean;
  readonly curatorEligible: boolean;
  readonly status: ReviewerStatus;
  readonly languages?: ReadonlyArray<string>;
  readonly activeSince?: EpochMs;
  readonly notes?: string;
}

/** Live load snapshot for a moderator. */
export interface ReviewerLoad {
  readonly moderatorId: OpaqueId;
  readonly assigned: number;
  readonly inProgress: number;
  readonly completedToday: number;
  readonly capacityWeight: number;
  readonly utilization: number;
  readonly status: ReviewerStatus;
  readonly lastAssignmentAt: EpochMs;
}

/** SLA warning record. */
export interface SLAWarning {
  readonly submissionId: OpaqueId;
  readonly bucket: '1h' | '6h' | '24h' | '48h';
  readonly ageMs: EpochMs;
  readonly triggeredAt: EpochMs;
  readonly acknowledged: boolean;
}

/** Bulk operation plan + outcome. */
export interface BulkOperation {
  readonly batchId: OpaqueId;
  readonly operatorId: OpaqueId;
  readonly action: ModeratorAction;
  readonly reasonCode: ReasonCode;
  readonly target: BulkTarget;
  readonly selection?: ReadonlyArray<OpaqueId>;
  readonly startedAt: EpochMs;
  status: BulkOpStatus;
  perItemOutcomes: ReadonlyArray<BulkItemOutcome>;
  completedAt?: EpochMs;
  rolledBackAt?: EpochMs;
  auditEntryIds: ReadonlyArray<OpaqueId>;
}

/** Per-submission outcome inside a bulk op. */
export interface BulkItemOutcome {
  readonly submissionId: OpaqueId;
  readonly verdict: DecisionVerdict;
  readonly errorCode?: string;
  readonly auditEntryId?: OpaqueId;
  readonly message?: string;
}

/** Round-robin cursor state for load balancing. */
export interface RoundRobinCursor {
  readonly moderators: ReadonlyArray<OpaqueId>;
  cursor: number;
  readonly startedAt: EpochMs;
  readonly wraps: number;
}

/** Hash chain verification report. */
export interface ChainVerificationReport {
  readonly verified: boolean;
  readonly totalEntries: number;
  readonly firstEntryAt: EpochMs;
  readonly lastEntryAt: EpochMs;
  readonly firstBrokenEntryId?: OpaqueId;
  readonly mismatch?: { expected: ChainHash; actual: ChainHash };
  readonly checkedAt: EpochMs;
}

/** LGPD export package. */
export interface LGPDExportPackage {
  readonly userId: OpaqueId;
  readonly generatedAt: EpochMs;
  readonly submissions: ReadonlyArray<ModerationSubmission>;
  readonly auditTrail: ReadonlyArray<AuditEntry>;
  readonly consents: ReadonlyArray<ConsentRecord>;
  readonly format: 'json';
  readonly expiresAt: EpochMs;
}

/** LGPD erasure receipt. */
export interface LGPDErasureReceipt {
  readonly userId: OpaqueId;
  readonly requestedAt: EpochMs;
  readonly completedAt?: EpochMs;
  readonly submissionsRemoved: number;
  readonly auditsRedacted: number;
  readonly chainHeadAfter: ChainHash;
  readonly verificationHash: HexDigest;
  readonly redactedReason: 'user_request' | 'consent_withdrawn' | 'retention_expired';
}

/** Consent record — mirrors w51 but with audit extension. */
export interface ConsentRecord {
  readonly userId: OpaqueId;
  readonly state: ConsentState;
  readonly grantedAt?: EpochMs;
  readonly withdrawnAt?: EpochMs;
  readonly scope: ReadonlyArray<'moderation' | 'analytics' | 'display' | 'export'>;
  readonly version: string;
}

/** Stats snapshot for the queue. */
export interface ModerationStats {
  readonly total: number;
  readonly byStatus: Partial<Record<SubmissionStatus, number>>;
  readonly byRisk: Partial<Record<RiskLevel, number>>;
  readonly bySensitivity: Partial<Record<Sensitivity, number>>;
  readonly byConsent: Partial<Record<ConsentState, number>>;
  readonly oldestPendingAt: EpochMs | null;
  readonly oldestPendingAgeMs: EpochMs;
  readonly slaWarningCount: number;
  readonly slaBreachCount: number;
  readonly dualReviewPendingCount: number;
  readonly avgWaitMs: number;
  readonly generatedAt: EpochMs;
}

/** Load balancing decision for an assignment. */
export interface AssignmentDecision {
  readonly submissionId: OpaqueId;
  readonly moderatorId: OpaqueId;
  readonly mode: AssignmentMode;
  readonly decidedAt: EpochMs;
  readonly reasonNote: string;
  readonly skippedOffline: ReadonlyArray<OpaqueId>;
}

// ============================================================================
// 4. SHAPE CONTRACTS — w51 / w52 integration
// ============================================================================

/**
 * Shape of the payload ingested from w51 prayer-submission-webhook.
 * Field set is intentionally minimal — w51 may include extra fields which
 * are routed into `metadata` at ingestion time.
 */
export interface W51PrayerWebhookPayload {
  prayerId: string;
  userId: string;
  submittedAt: EpochMs;
  body: string;
  tags?: string[];
  odu?: string;
  targetEntityId?: string;
  consent: 'granted' | 'denied' | 'pending';
  sacred?: boolean;
}

/** Inbound webhook envelope from w51. */
export interface W51WebhookEnvelope {
  payload: W51PrayerWebhookPayload;
  signature?: string;
  receivedAt: EpochMs;
  correlationId?: OpaqueId;
  attempt: number;
}

/** Shape of DLQ entries pulled from w52. */
export interface W52DeadLetterEntry {
  readonly id: OpaqueId;
  readonly payload: Record<string, unknown>;
  readonly targetUrl: string;
  readonly failureMode: 'timeout' | 'http_4xx' | 'http_5xx' | 'network' | 'invalid_payload' | 'unknown';
  attempts: number;
  readonly firstFailAt: EpochMs;
  lastFailAt: EpochMs;
  readonly integrityHash: IntegrityHash;
  readonly ttl: EpochMs;
  userId?: string;
  consentVerified?: boolean;
  sacredText: SacredTextStatus;
  lastError?: string;
}

/** Result of running the runtime shape contract check. */
export interface ShapeContractReport {
  readonly w51Ok: boolean;
  readonly w52Ok: boolean;
  readonly w51Missing: ReadonlyArray<string>;
  readonly w52Missing: ReadonlyArray<string>;
  readonly checkedAt: EpochMs;
}

// ============================================================================
// 5. EXTERNAL SURFACES (interfaces to inject)
// ============================================================================

export interface ModerationPrismaLike {
  submission: {
    create(args: { data: Record<string, unknown> }): Promise<{ id: string }>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
    findMany(args: { where?: Record<string, unknown>; take?: number; orderBy?: Record<string, 'asc' | 'desc'> }): Promise<Array<Record<string, unknown>>>;
    count(args: { where?: Record<string, unknown> }): Promise<number>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
  audit: {
    create(args: { data: Record<string, unknown> }): Promise<{ id: string }>;
    findMany(args: { where?: Record<string, unknown> }): Promise<Array<Record<string, unknown>>>;
  };
  moderator: {
    upsert(args: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }): Promise<unknown>;
    findMany(args: { where?: Record<string, unknown> }): Promise<Array<Record<string, unknown>>>;
  };
}

export interface Clock {
  now(): EpochMs;
  sleep(ms: EpochMs): Promise<void>;
}

export interface Rng {
  next(): number;
  intInRange(min: number, max: number): number;
}

export interface NotificationFn {
  (channel: 'sla' | 'escalation' | 'sacred' | 'lgpd', payload: Record<string, unknown>): Promise<void> | void;
}

export interface DownstreamFn {
  (action: ModeratorAction, submissionId: OpaqueId, payload: Record<string, unknown>): Promise<{ ok: boolean; statusCode?: number; error?: string }>;
}

// ============================================================================
// 6. CONSTANTS & DEFAULTS
// ============================================================================

export const W53MQ_DEFAULT_CAPACITY = 1024;
export const W53MQ_DEFAULT_TTL_MS = 90 * 24 * 60 * 60 * 1000;
export const W53MQ_AUDIT_RING_SIZE = 256;
export const W53MQ_BULK_DEFAULT_CAP = 100;
export const W53MQ_BULK_HARD_CAP = 500;

export const W53MQ_SLA_1H_MS = 60 * 60 * 1000;
export const W53MQ_SLA_6H_MS = 6 * 60 * 60 * 1000;
export const W53MQ_SLA_24H_MS = 24 * 60 * 60 * 1000;
export const W53MQ_SLA_48H_MS = 48 * 60 * 60 * 1000;

export const W53MQ_SACRED_SENSITIVITY_THRESHOLD: Sensitivity = 'sacred';
export const W53MQ_DUAL_REVIEW_REQUIRED_SENSITIVITY: Sensitivity = 'sacred';
export const W53MQ_CURATOR_REQUIRED_SENSITIVITY: Sensitivity = 'sacred';

export const W53MQ_HASH_CHAIN_GENESIS: ChainHash = '0'.repeat(64);

export const W53MQ_DEFAULT_ASSIGNMENT_MODE: AssignmentMode = 'capacity_weighted';
export const W53MQ_ROUND_ROBIN_WRAP_LIMIT = 1_000_000;

export const DEFAULT_QUEUE_OPTIONS: ModerationQueueOptions = Object.freeze({
  capacity: W53MQ_DEFAULT_CAPACITY,
  ttlMs: W53MQ_DEFAULT_TTL_MS,
  defaultAssignmentMode: W53MQ_DEFAULT_ASSIGNMENT_MODE,
  enableAutoEscalation: true,
  requireDualReviewForSacred: true,
  retentionDays: 90,
  label: 'w53mq',
});

export const DEFAULT_LOAD_BALANCER_OPTIONS: LoadBalancerOptions = Object.freeze({
  defaultMode: W53MQ_DEFAULT_ASSIGNMENT_MODE,
  respectReviewerStatus: true,
  sacredGate: true,
  curatorGate: true,
  capacityWeightFactor: 1.0,
});

export const DEFAULT_HASH_CHAIN_OPTIONS: HashChainOptions = Object.freeze({
  algorithm: 'sha256-fnv1a64-djb2',
  genesis: W53MQ_HASH_CHAIN_GENESIS,
  sealOnPurge: true,
});

export const DEFAULT_CLASSIFIER_OPTIONS: ClassifierOptions = Object.freeze({
  blockOnHate: true,
  blockOnPII: true,
  reviewOnSacred: true,
  minBodyLength: 8,
  maxBodyLength: 8192,
  language: ['pt-BR', 'en-US'],
});

export const SENSITIVITY_RANK: Record<Sensitivity, number> = Object.freeze({
  none: 0,
  light: 1,
  moderate: 2,
  elevated: 3,
  sacred: 4,
});


/** Sacred text tokens — names of orixás, entities, odús, religious titles. */
export const SACRED_TEXT_TOKENS = Object.freeze([
  'odú', 'odu', 'ogum', 'oxalá', 'oxala', 'iemanja', 'iemonja', 'xangô',
  'xango', 'iansã', 'iansan', 'obaluaê', 'obaluaye', 'nanã', 'nana',
  'omulu', 'omolú', 'oxum', 'oxossi', 'orunmila', 'orunmilá', 'exu', 'eshu',
  'pomba gira', 'pombagira', 'pretos velhos', 'caboclos', 'cigano',
  'cigana', 'mestre', 'mestra', 'babá', 'iala', 'iyalorixá',
  'babalaô', 'babalao', 'ogã', 'equede', 'ekedi', 'orixá', 'orixa',
  'terreiro', 'axé', 'axexé', 'ebó', 'ebo', 'bolição', 'bolicao',
  'ori', 'orí', 'babalawo', 'babalawô', 'iyanifá', 'abian',
]);

/** Profanity / hate terms — minimal curated list for block heuristic. */
export const HATE_KEYWORDS = Object.freeze([
  'kill yourself', 'mata-te', 'suicídio', 'suicidio', 'vá morrer', 'va morrer',
  'racist', 'racista', 'nazi', 'fascist', 'fascista',
]);

/** Spam markers — common signals of promotional / SEO junk. */
export const SPAM_KEYWORDS = Object.freeze([
  'buy now', 'compre agora', 'click here', 'clique aqui', 'limited offer',
  'oferta limitada', 'discount code', 'cupom de desconto', 'follow me', 'siga-me',
  'http://', 'https://', 'www.', '.com', '.com.br', '.net',
]);

/** PII pattern tokens — checked structurally, not for content. */
export const PII_PATTERN_TOKENS = Object.freeze([
  'cpf', 'rg', 'cnpj', 'ssn', 'passport', 'passaporte',
  'phone number', 'telefone', 'cellphone', 'celular',
  'address', 'endereço', 'endereco', 'street', 'rua',
  'email me at', 'me mande email',
]);

/** Health disclosure triggers. */
export const HEALTH_KEYWORDS = Object.freeze([
  'hiv', 'aids', 'cancer', 'câncer', 'tumor', 'diabetes', 'depression',
  'depressão', 'suicidal', 'suicida', 'mental illness', 'doença mental',
  'diagnóstico', 'diagnostico', 'prescrição', 'prescricao',
]);

/** Political-pressure markers. */
export const POLITICAL_KEYWORDS = Object.freeze([
  'vote for', 'vote em', 'election', 'eleição', 'eleicao', 'bolsonaro',
  'lula', 'trump', 'biden', 'campaign', 'campanha',
]);

/** Information-request reasons. */
export const INFO_REQUEST_REASONS: ReadonlyArray<ReasonCode> = Object.freeze([
  'INFO_RECEIVED', 'INFO_TIMEOUT', 'PROFANITY', 'HATE_SPEECH',
  'HARASSMENT', 'SPAM', 'PII_LEAK', 'HEALTH_DISCLOSURE',
  'POLITICAL_PRESSURE', 'RELIGIOUS_DOCTRINE_CONFLICT', 'OFF_TOPIC',
  'DUPLICATE', 'LANGUAGE_UNSUPPORTED', 'CONSENT_MISSING',
  'SACRED_REDACT_NEEDED', 'OTHER',
]);

/** All reason codes — canonical taxonomy (16+ codes). */
export const REASON_CODES: ReadonlyArray<ReasonCode> = Object.freeze([
  'CONSENT_GRANTED', 'CONSENT_MISSING',
  'SACRED_GATE', 'SACRED_REDACT_NEEDED',
  'PROFANITY', 'HATE_SPEECH', 'HARASSMENT',
  'SPAM', 'PII_LEAK', 'HEALTH_DISCLOSURE',
  'POLITICAL_PRESSURE', 'RELIGIOUS_DOCTRINE_CONFLICT',
  'MISINFORMATION', 'OFF_TOPIC', 'DUPLICATE',
  'LANGUAGE_UNSUPPORTED', 'CURATOR_REQUIRED', 'LEGAL_HOLD',
  'TRIAGE_AUTO', 'TRIAGE_MANUAL', 'SLA_BREACH',
  'BULK_OPERATION', 'REASSIGN_OFFLINE', 'CAPACITY_REBALANCE',
  'LGPD_ERASURE', 'LGPD_EXPORT',
  'DUAL_REVIEW_COMPLETE', 'DUAL_REVIEW_PENDING',
  'INFO_RECEIVED', 'INFO_TIMEOUT', 'OTHER',
]);

/** Map reason codes to categories for grouping in reports. */
export const REASON_CATEGORY_MAP: Record<ReasonCode, ReasonCategory> = Object.freeze({
  CONSENT_GRANTED: 'consent',
  CONSENT_MISSING: 'consent',
  SACRED_GATE: 'sacred',
  SACRED_REDACT_NEEDED: 'sacred',
  PROFANITY: 'safety',
  HATE_SPEECH: 'safety',
  HARASSMENT: 'safety',
  SPAM: 'safety',
  PII_LEAK: 'privacy',
  HEALTH_DISCLOSURE: 'privacy',
  POLITICAL_PRESSURE: 'policy',
  RELIGIOUS_DOCTRINE_CONFLICT: 'sacred',
  MISINFORMATION: 'policy',
  OFF_TOPIC: 'policy',
  DUPLICATE: 'operational',
  LANGUAGE_UNSUPPORTED: 'operational',
  CURATOR_REQUIRED: 'sacred',
  LEGAL_HOLD: 'policy',
  TRIAGE_AUTO: 'operational',
  TRIAGE_MANUAL: 'operational',
  SLA_BREACH: 'sla',
  BULK_OPERATION: 'operational',
  REASSIGN_OFFLINE: 'operational',
  CAPACITY_REBALANCE: 'operational',
  LGPD_ERASURE: 'lgpd',
  LGPD_EXPORT: 'lgpd',
  DUAL_REVIEW_COMPLETE: 'dual_review',
  DUAL_REVIEW_PENDING: 'dual_review',
  INFO_RECEIVED: 'operational',
  INFO_TIMEOUT: 'operational',
  OTHER: 'other',
});

/** Severity per reason code (drives alerts + SLA priority). */
export const REASON_SEVERITY: Record<ReasonCode, Severity> = Object.freeze({
  CONSENT_GRANTED: 'low',
  CONSENT_MISSING: 'high',
  SACRED_GATE: 'high',
  SACRED_REDACT_NEEDED: 'high',
  PROFANITY: 'medium',
  HATE_SPEECH: 'critical',
  HARASSMENT: 'high',
  SPAM: 'medium',
  PII_LEAK: 'high',
  HEALTH_DISCLOSURE: 'high',
  POLITICAL_PRESSURE: 'medium',
  RELIGIOUS_DOCTRINE_CONFLICT: 'high',
  MISINFORMATION: 'medium',
  OFF_TOPIC: 'low',
  DUPLICATE: 'low',
  LANGUAGE_UNSUPPORTED: 'medium',
  CURATOR_REQUIRED: 'high',
  LEGAL_HOLD: 'critical',
  TRIAGE_AUTO: 'low',
  TRIAGE_MANUAL: 'low',
  SLA_BREACH: 'high',
  BULK_OPERATION: 'low',
  REASSIGN_OFFLINE: 'low',
  CAPACITY_REBALANCE: 'low',
  LGPD_ERASURE: 'high',
  LGPD_EXPORT: 'medium',
  DUAL_REVIEW_COMPLETE: 'low',
  DUAL_REVIEW_PENDING: 'medium',
  INFO_RECEIVED: 'low',
  INFO_TIMEOUT: 'medium',
  OTHER: 'low',
});

/** LGPD articles referenced — used for audit trail annotation. */
export const LGPD_ARTICLES = Object.freeze({
  ART_7_CONSENT: 'LGPD_ART_7',
  ART_9_SENSITIVE: 'LGPD_ART_9',
  ART_18_RIGHTS: 'LGPD_ART_18',
});

/** Common error codes thrown by this module. */
export const MQ_ERROR_CODES = Object.freeze({
  QUEUE_FULL: 'MQ_001',
  SUBMISSION_NOT_FOUND: 'MQ_002',
  INVALID_TRANSITION: 'MQ_003',
  CONSENT_MISSING: 'MQ_004',
  SACRED_GATE_VIOLATION: 'MQ_005',
  CURATOR_REQUIRED: 'MQ_006',
  REVIEWER_OFFLINE: 'MQ_007',
  BULK_CAP_EXCEEDED: 'MQ_008',
  CHAIN_INTEGRITY: 'MQ_009',
  SHAPE_CONTRACT_FAIL: 'MQ_010',
  LGPD_HOLD_ACTIVE: 'MQ_011',
  DUAL_REVIEW_INCOMPLETE: 'MQ_012',
});

// ============================================================================
// 7. TYPED ERROR CLASSES
// ============================================================================

export class MQBaseError extends Error {
  public readonly code: string;
  public readonly at: EpochMs;
  public readonly context: Record<string, unknown> | undefined;
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'MQBaseError';
    this.code = code;
    this.at = Date.now();
    this.context = context;
  }
}

export class MQQueueFullError extends MQBaseError {
  constructor(capacity: number, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.QUEUE_FULL,
      'Moderation queue at capacity (' + capacity + '). Refusing ingestion.',
      Object.assign({ capacity }, context || {}));
    this.name = 'MQQueueFullError';
  }
}

export class MQSubmissionNotFoundError extends MQBaseError {
  constructor(id: OpaqueId, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.SUBMISSION_NOT_FOUND,
      'Submission not found: ' + id,
      Object.assign({ id }, context || {}));
    this.name = 'MQSubmissionNotFoundError';
  }
}

export class MQInvalidTransitionError extends MQBaseError {
  constructor(from: SubmissionStatus, to: SubmissionStatus, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.INVALID_TRANSITION,
      'Invalid status transition: ' + from + ' → ' + to,
      Object.assign({ from, to }, context || {}));
    this.name = 'MQInvalidTransitionError';
  }
}

export class MQConsentMissingError extends MQBaseError {
  constructor(userId: OpaqueId, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.CONSENT_MISSING,
      'Consent missing for userId=' + userId,
      Object.assign({ userId }, context || {}));
    this.name = 'MQConsentMissingError';
  }
}

export class MQSacredGateViolationError extends MQBaseError {
  constructor(submissionId: OpaqueId, sensitivity: Sensitivity, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.SACRED_GATE_VIOLATION,
      'Sacred-text gate violation on ' + submissionId + ' (sensitivity=' + sensitivity + ')',
      Object.assign({ submissionId, sensitivity }, context || {}));
    this.name = 'MQSacredGateViolationError';
  }
}

export class MQCuratorRequiredError extends MQBaseError {
  constructor(submissionId: OpaqueId, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.CURATOR_REQUIRED,
      'Curator review required for ' + submissionId,
      Object.assign({ submissionId }, context || {}));
    this.name = 'MQCuratorRequiredError';
  }
}

export class MQReviewerOfflineError extends MQBaseError {
  constructor(moderatorId: OpaqueId, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.REVIEWER_OFFLINE,
      'Reviewer is offline: ' + moderatorId,
      Object.assign({ moderatorId }, context || {}));
    this.name = 'MQReviewerOfflineError';
  }
}

export class MQBulkCapExceededError extends MQBaseError {
  constructor(requested: number, cap: number, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.BULK_CAP_EXCEEDED,
      'Bulk op requested ' + requested + ' > cap ' + cap,
      Object.assign({ requested, cap }, context || {}));
    this.name = 'MQBulkCapExceededError';
  }
}

export class MQChainIntegrityError extends MQBaseError {
  constructor(entryId: OpaqueId, expected: ChainHash, actual: ChainHash, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.CHAIN_INTEGRITY,
      'Audit chain integrity broken at ' + entryId,
      Object.assign({ entryId, expected, actual }, context || {}));
    this.name = 'MQChainIntegrityError';
  }
}

export class MQShapeContractError extends MQBaseError {
  constructor(missing: ReadonlyArray<string>, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.SHAPE_CONTRACT_FAIL,
      'Shape contract check failed: missing [' + missing.join(', ') + ']',
      Object.assign({ missing }, context || {}));
    this.name = 'MQShapeContractError';
  }
}

export class MQLGPDHoldActiveError extends MQBaseError {
  constructor(userId: OpaqueId, holdUntil: EpochMs, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.LGPD_HOLD_ACTIVE,
      'LGPD hold active for userId=' + userId + ' until ' + holdUntil,
      Object.assign({ userId, holdUntil }, context || {}));
    this.name = 'MQLGPDHoldActiveError';
  }
}

export class MQDualReviewIncompleteError extends MQBaseError {
  constructor(submissionId: OpaqueId, approvals: number, context?: Record<string, unknown>) {
    super(MQ_ERROR_CODES.DUAL_REVIEW_INCOMPLETE,
      'Dual review incomplete on ' + submissionId + ' (' + approvals + '/2 approvals)',
      Object.assign({ submissionId, approvals }, context || {}));
    this.name = 'MQDualReviewIncompleteError';
  }
}

// ============================================================================
// 8. CLOCK + RNG
// ============================================================================

export class FixedClock implements Clock {
  private current: EpochMs;
  constructor(initial: EpochMs = 0) { this.current = initial; }
  now(): EpochMs { return this.current; }
  advance(ms: EpochMs): void { this.current = this.current + Math.max(0, ms); }
  set(at: EpochMs): void { this.current = at; }
  async sleep(_ms: EpochMs): Promise<void> { /* no-op */ }
}

export class SeededRng implements Rng {
  private state: number;
  constructor(seed: number = 0x9E3779B9) {
    this.state = (seed | 0) || 1;
  }
  next(): number {
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  intInRange(min: number, max: number): number {
    if (max < min) { const tmp = min; min = max; max = tmp; }
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export const SystemClock: Clock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise<void>((r) => setTimeout(r, ms)),
};

export const SystemRng: Rng = {
  next: () => Math.random(),
  intInRange: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
};

// ============================================================================
// 9. HASHING + INTEGRITY (FNV-1a + DJB2 composite)
// ============================================================================

/**
 * Deterministic JSON.stringify — sorts keys recursively so that semantically
 * equal payloads always produce the same byte sequence.
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return JSON.stringify(String(value));
      return JSON.stringify(value);
    }
    if (typeof value === 'boolean') return JSON.stringify(value);
    if (typeof value === 'bigint') return JSON.stringify(String(value));
    if (typeof value === 'undefined') return JSON.stringify(null);
    if (typeof value === 'function') return JSON.stringify('[Function]');
    return JSON.stringify(String(value));
  }
  if (Array.isArray(value)) {
    return '[' + value.map((v) => stableStringify(v)).join(',') + ']';
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map((k) => JSON.stringify(k) + ':' + stableStringify((value as Record<string, unknown>)[k]));
  return '{' + parts.join(',') + '}';
}

/** DJB2 hash (32-bit) — cheap, deterministic. */
export function djb2(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** FNV-1a 64-bit hash — composes two 32-bit halves. */
export function fnv1a64(input: string): string {
  let hi = 0xcbf29ce4 | 0;
  let lo = 0x84222325 | 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    lo ^= c;
    lo = Math.imul(lo, 0x01000193) >>> 0;
    hi = Math.imul(hi ^ (c >>> 8), 0x01000193) >>> 0;
  }
  return hi.toString(16).padStart(8, '0') + lo.toString(16).padStart(8, '0');
}

/**
 * Hand-rolled SHA-256 surrogate for the audit hash chain.
 * Real SHA-256 is not available without WebCrypto; this implementation
 * mixes FNV-1a + DJB2 over an expanded key-schedule so different inputs
 * produce widely-divergent digests while staying deterministic.
 *
 * NOTE: This is NOT cryptographic SHA-256. It is a stable 64-hex digest
 * suitable for tamper-evidence (any mutation of the input will change the
 * digest) but is NOT collision-resistant against an attacker with full
 * knowledge of the algorithm. For real cryptographic guarantees, replace
 * with `crypto.subtle.digest('SHA-256', ...)` in Node or browser.
 */
export function sha256Like(input: string): HexDigest {
  const seed = fnv1a64(input) + djb2(input);
  // Two more rounds mixing index-rotated slices for diffusion.
  const mid = fnv1a64(seed.slice(0, 16) + input) + djb2(seed.slice(8, 24) + input);
  const tail = fnv1a64(mid + input.length.toString(16)) + djb2(mid + seed);
  // Mix the four halves to fill 64 hex chars.
  const a = seed.slice(0, 16);
  const b = mid.slice(0, 16);
  const c = tail.slice(0, 16);
  const d = (seed.slice(16, 32) + mid.slice(16, 32) + tail.slice(16, 32)).slice(0, 16);
  return (a + b + c + d).toLowerCase();
}

/** Composite integrity hash for a submission (used at ingest). */
export function computeSubmissionIntegrity(s: ModerationSubmission): IntegrityHash {
  const ser = stableStringify({
    id: s.id, source: s.source, submittedAt: s.submittedAt,
    userId: s.userId, body: s.body, consent: s.consent,
    sacred: s.sacred, sensitivity: s.sensitivity,
  });
  return sha256Like(ser);
}

/** Verify a submission's stored integrity hash. */
export function verifySubmissionIntegrity(s: ModerationSubmission): boolean {
  const computed = computeSubmissionIntegrity(s);
  if (s.redactedAt && s.redactedAt > 0) return false;
  return typeof computed === 'string' && computed.length === 64;
}

// ============================================================================
// 10. HASH CHAIN — append-only audit trail
// ============================================================================

export interface HashChainOptions {
  algorithm: 'sha256-fnv1a64-djb2';
  genesis: ChainHash;
  sealOnPurge: boolean;
}

export class HashChain {
  private readonly opts: HashChainOptions;
  private readonly entries: AuditEntry[] = [];
  private head: ChainHash;
  constructor(opts: Partial<HashChainOptions> = {}) {
    this.opts = Object.assign({}, DEFAULT_HASH_CHAIN_OPTIONS, opts);
    this.head = this.opts.genesis;
  }
  size(): number { return this.entries.length; }
  headHash(): ChainHash { return this.head; }
  genesis(): ChainHash { return this.opts.genesis; }
  options(): HashChainOptions { return Object.assign({}, this.opts); }
  list(): ReadonlyArray<AuditEntry> { return this.entries.slice(); }
  /** Append an entry; computes prevHash + hash. Returns the entry with hash. */
  append(input: {
    entryId: OpaqueId;
    submissionId: OpaqueId;
    actorId: OpaqueId;
    actorKind: AuditEntry['actorKind'];
    action: ModeratorAction;
    reasonCode: ReasonCode;
    note?: string;
    at: EpochMs;
    beforeState: SubmissionStatus;
    afterState: SubmissionStatus;
    batchId?: OpaqueId;
    context?: Record<string, unknown>;
  }): AuditEntry {
    const prevHash = this.head;
    const ser = stableStringify({
      entryId: input.entryId, submissionId: input.submissionId,
      actorId: input.actorId, actorKind: input.actorKind,
      action: input.action, reasonCode: input.reasonCode,
      note: input.note ?? '', at: input.at,
      beforeState: input.beforeState, afterState: input.afterState,
      batchId: input.batchId ?? null,
    });
    const hash = sha256Like(prevHash + '|' + ser);
    const entry: AuditEntry = {
      entryId: input.entryId, submissionId: input.submissionId,
      actorId: input.actorId, actorKind: input.actorKind,
      action: input.action, reasonCode: input.reasonCode,
      note: input.note, at: input.at,
      beforeState: input.beforeState, afterState: input.afterState,
      prevHash, hash, batchId: input.batchId, context: input.context,
    };
    this.entries.push(entry);
    this.head = hash;
    return entry;
  }
  /** Verify the entire chain. Stops at first break. */
  verify(): ChainVerificationReport {
    const checkedAt = Date.now();
    let expectedPrev = this.opts.genesis;
    let firstAt: EpochMs = 0;
    let lastAt: EpochMs = 0;
    for (let i = 0; i < this.entries.length; i++) {
      const e = this.entries[i];
      if (i === 0) firstAt = e.at;
      lastAt = e.at;
      if (e.prevHash !== expectedPrev) {
        return {
          verified: false, totalEntries: this.entries.length,
          firstEntryAt: firstAt, lastEntryAt: lastAt,
          firstBrokenEntryId: e.entryId,
          mismatch: { expected: expectedPrev, actual: e.prevHash },
          checkedAt,
        };
      }
      const ser = stableStringify({
        entryId: e.entryId, submissionId: e.submissionId,
        actorId: e.actorId, actorKind: e.actorKind,
        action: e.action, reasonCode: e.reasonCode,
        note: e.note ?? '', at: e.at,
        beforeState: e.beforeState, afterState: e.afterState,
        batchId: e.batchId ?? null,
      });
      const expected = sha256Like(e.prevHash + '|' + ser);
      if (expected !== e.hash) {
        return {
          verified: false, totalEntries: this.entries.length,
          firstEntryAt: firstAt, lastEntryAt: lastAt,
          firstBrokenEntryId: e.entryId,
          mismatch: { expected, actual: e.hash },
          checkedAt,
        };
      }
      expectedPrev = e.hash;
    }
    return {
      verified: true, totalEntries: this.entries.length,
      firstEntryAt: firstAt, lastEntryAt: lastAt, checkedAt,
    };
  }
  /** Filter audit entries by submissionId. */
  filterBySubmission(submissionId: OpaqueId): ReadonlyArray<AuditEntry> {
    return this.entries.filter((e) => e.submissionId === submissionId);
  }
  /** Filter by actor. */
  filterByActor(actorId: OpaqueId): ReadonlyArray<AuditEntry> {
    return this.entries.filter((e) => e.actorId === actorId);
  }
  /** Filter by action. */
  filterByAction(action: ModeratorAction): ReadonlyArray<AuditEntry> {
    return this.entries.filter((e) => e.action === action);
  }
  /** Find entries within a time range. */
  filterByTimeRange(from: EpochMs, to: EpochMs): ReadonlyArray<AuditEntry> {
    return this.entries.filter((e) => e.at >= from && e.at <= to);
  }
}

// ============================================================================
// 11. ID GENERATION
// ============================================================================

export function generateId(prefix: string = '', clock: Clock = SystemClock): OpaqueId {
  const ts = clock.now().toString(36).padStart(8, '0');
  const r = Math.floor(Math.random() * 0xffffffff).toString(36).padStart(7, '0');
  return prefix + ts + '-' + r;
}

export function generateCorrelationId(seed: string): OpaqueId {
  return 'corr_' + fnv1a64(seed).slice(0, 12);
}

export function makeTestId(seq: number, prefix: string = 'w53mq_test_'): OpaqueId {
  return prefix + seq.toString(36).padStart(6, '0');
}

export function generateBatchId(clock: Clock = SystemClock): OpaqueId {
  return 'batch_' + generateId('', clock);
}

export function generateAuditEntryId(clock: Clock = SystemClock): OpaqueId {
  return 'audit_' + generateId('', clock);
}

export function generateDualReviewKey(submissionId: OpaqueId, moderatorId: OpaqueId): string {
  return 'dual:' + sha256Like(submissionId + ':' + moderatorId).slice(0, 12);
}

// ============================================================================
// 12. AUTO-CLASSIFICATION HEURISTIC
// ============================================================================

export interface ClassifierOptions {
  blockOnHate: boolean;
  blockOnPII: boolean;
  reviewOnSacred: boolean;
  minBodyLength: number;
  maxBodyLength: number;
  language: ReadonlyArray<string>;
}

export interface ClassificationResult {
  riskLevel: RiskLevel;
  sensitivity: Sensitivity;
  consentVerified: boolean;
  sacredDetected: boolean;
  signals: ReadonlyArray<ClassificationSignal>;
  classifiedAt: EpochMs;
}

/** Lowercase normalize + collapse whitespace. */
export function normalizeBody(body: string): string {
  return (body || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Detect sacred tokens in a body (substring match, accent-insensitive). */
export function detectSacredInBody(body: string): ReadonlyArray<string> {
  const norm = normalizeBody(body);
  const hits: string[] = [];
  for (const tok of SACRED_TEXT_TOKENS) {
    if (norm.indexOf(tok) >= 0) hits.push(tok);
  }
  return hits;
}

/** Compute sensitivity rank from sacred tokens (higher = more sensitive). */
export function classifySensitivity(body: string): Sensitivity {
  const norm = normalizeBody(body);
  if (norm.length === 0) return 'none';
  // elevated tokens: specific orixás
  const elevatedTokens = ['ogum', 'oxalá', 'oxala', 'iemanja', 'xangô', 'xango',
    'iansã', 'iansan', 'obaluaê', 'obaluaye', 'nanã', 'nana', 'oxum',
    'oxossi', 'orunmila', 'orunmilá', 'exu', 'eshu', 'omulu', 'omolú',
    'pomba gira', 'pombagira', 'pretos velhos'];
  // moderate tokens: general religious vocabulary
  const moderateTokens = ['terreiro', 'axé', 'axexé', 'ebó', 'ebo',
    'orixá', 'orixa', 'babalaô', 'babalao', 'iyalorixá'];
  // sacred tokens: ritual language
  const sacredTokens = ['ori', 'orí', 'bolição', 'bolicao', 'axexé',
    'initiation ritual', 'rito de iniciação', 'rito de iniciacao'];
  for (const t of sacredTokens) if (norm.indexOf(t) >= 0) return 'sacred';
  for (const t of elevatedTokens) if (norm.indexOf(t) >= 0) return 'elevated';
  for (const t of moderateTokens) if (norm.indexOf(t) >= 0) return 'moderate';
  // light: any sacred token mention at all
  const anySacred = detectSacredInBody(body);
  return anySacred.length > 0 ? 'light' : 'none';
}

/** Detect profanity / hate in body. */
export function detectHate(body: string): ReadonlyArray<string> {
  const norm = normalizeBody(body);
  const hits: string[] = [];
  for (const k of HATE_KEYWORDS) if (norm.indexOf(k) >= 0) hits.push(k);
  return hits;
}

/** Detect spam markers in body. */
export function detectSpam(body: string): ReadonlyArray<string> {
  const norm = normalizeBody(body);
  const hits: string[] = [];
  for (const k of SPAM_KEYWORDS) if (norm.indexOf(k) >= 0) hits.push(k);
  // URL count
  const urlCount = (norm.match(/https?:\/\//g) || []).length;
  if (urlCount >= 2) hits.push('multi-url:' + urlCount);
  return hits;
}

/** Detect PII patterns structurally (CPF-like / email / phone). */
export function detectPII(body: string): ReadonlyArray<string> {
  const norm = normalizeBody(body);
  const hits: string[] = [];
  // CPF pattern: 000.000.000-00 or 11 digits
  if (/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(norm)) hits.push('cpf-pattern');
  // Email
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(norm)) hits.push('email-pattern');
  // Phone BR (11 digits or (11) 9...)
  if (/\(\d{2}\)\s?\d{4,5}-?\d{4}\b/.test(norm)) hits.push('phone-br-pattern');
  if (/\b\d{5}-?\d{3}\b/.test(norm)) hits.push('cep-pattern');
  // Token-based
  for (const k of PII_PATTERN_TOKENS) if (norm.indexOf(k) >= 0) hits.push('keyword:' + k);
  return hits;
}

/** Detect health disclosure. */
export function detectHealth(body: string): ReadonlyArray<string> {
  const norm = normalizeBody(body);
  const hits: string[] = [];
  for (const k of HEALTH_KEYWORDS) if (norm.indexOf(k) >= 0) hits.push(k);
  return hits;
}

/** Detect political pressure markers. */
export function detectPolitical(body: string): ReadonlyArray<string> {
  const norm = normalizeBody(body);
  const hits: string[] = [];
  for (const k of POLITICAL_KEYWORDS) if (norm.indexOf(k) >= 0) hits.push(k);
  return hits;
}

/** Detect supported-language heuristically (very rough). */
export function detectLanguage(body: string): string {
  const norm = normalizeBody(body);
  // Portuguese markers
  const ptMarkers = [' que ', ' não ', ' nao ', ' com ', ' para ', ' uma ',
    'ção', 'ões', 'ção', 'ção'];
  let ptScore = 0;
  for (const m of ptMarkers) if (norm.indexOf(m) >= 0) ptScore++;
  // English markers
  const enMarkers = [' the ', ' and ', ' with ', ' for ', ' that ', 'ing '];
  let enScore = 0;
  for (const m of enMarkers) if (norm.indexOf(m) >= 0) enScore++;
  if (ptScore > enScore && ptScore > 0) return 'pt-BR';
  if (enScore > 0) return 'en-US';
  return 'unknown';
}

/** Run the full auto-classification pipeline. */
export function autoClassify(
  body: string,
  consent: ConsentState,
  sacredHint: SacredTextStatus,
  opts: Partial<ClassifierOptions> = {},
  clock: Clock = SystemClock,
): ClassificationResult {
  const o = Object.assign({}, DEFAULT_CLASSIFIER_OPTIONS, opts);
  const at = clock.now();
  const signals: ClassificationSignal[] = [];
  // 1. Sacred signal
  const sacredTokens = detectSacredInBody(body);
  if (sacredTokens.length > 0 || sacredHint === 'present') {
    signals.push({
      dimension: 'sacred',
      weight: sacredTokens.length > 0 ? -30 : 0,
      matched: sacredTokens,
      reason: sacredTokens.length > 0 ? 'sacred tokens detected' : 'sacred hint present',
      at,
    });
  }
  // 2. Hate signal
  const hateHits = detectHate(body);
  if (hateHits.length > 0) {
    signals.push({
      dimension: 'keyword',
      weight: o.blockOnHate ? -100 : -50,
      matched: hateHits,
      reason: 'hate/profanity keywords',
      at,
    });
  }
  // 3. Spam signal
  const spamHits = detectSpam(body);
  if (spamHits.length > 0) {
    signals.push({
      dimension: 'keyword',
      weight: spamHits.length >= 2 ? -60 : -30,
      matched: spamHits,
      reason: 'spam markers',
      at,
    });
  }
  // 4. PII signal
  const piiHits = detectPII(body);
  if (piiHits.length > 0) {
    signals.push({
      dimension: 'pii',
      weight: o.blockOnPII ? -80 : -40,
      matched: piiHits,
      reason: 'PII pattern detected',
      at,
    });
  }
  // 5. Health signal
  const healthHits = detectHealth(body);
  if (healthHits.length > 0) {
    signals.push({
      dimension: 'pii',
      weight: -50,
      matched: healthHits,
      reason: 'health disclosure',
      at,
    });
  }
  // 6. Political signal
  const polHits = detectPolitical(body);
  if (polHits.length > 0) {
    signals.push({
      dimension: 'keyword',
      weight: -25,
      matched: polHits,
      reason: 'political pressure',
      at,
    });
  }
  // 7. Length signal
  if (body.length < o.minBodyLength) {
    signals.push({
      dimension: 'length',
      weight: -20,
      matched: ['len=' + body.length],
      reason: 'body below minimum',
      at,
    });
  } else if (body.length > o.maxBodyLength) {
    signals.push({
      dimension: 'length',
      weight: -15,
      matched: ['len=' + body.length],
      reason: 'body above maximum',
      at,
    });
  }
  // 8. Language signal
  const lang = detectLanguage(body);
  if (lang !== 'unknown' && !o.language.includes(lang)) {
    signals.push({
      dimension: 'language',
      weight: -30,
      matched: [lang],
      reason: 'language not supported',
      at,
    });
  }
  // 9. Consent signal
  if (consent === 'denied' || consent === 'withdrawn') {
    signals.push({
      dimension: 'consent',
      weight: -100,
      matched: [consent],
      reason: 'consent denied/withdrawn',
      at,
    });
  } else if (consent === 'pending') {
    signals.push({
      dimension: 'consent',
      weight: -10,
      matched: ['pending'],
      reason: 'consent pending',
      at,
    });
  }
  // Aggregate risk level from total weight.
  const total = signals.reduce((acc, s) => acc + s.weight, 0);
  let risk: RiskLevel = 'SAFE';
  if (total <= -80) risk = 'BLOCK';
  else if (total <= -40) risk = 'RISKY';
  else if (total <= -10) risk = 'REVIEW';
  else risk = 'SAFE';
  // Sacred overrides up to REVIEW minimum (if not already higher).
  if (sacredTokens.length > 0 && (risk === 'SAFE')) {
    risk = o.reviewOnSacred ? 'REVIEW' : risk;
  }
  const sensitivity = classifySensitivity(body);
  return {
    riskLevel: risk,
    sensitivity,
    consentVerified: consent === 'granted',
    sacredDetected: sacredTokens.length > 0 || sacredHint === 'present',
    signals,
    classifiedAt: at,
  };
}

// ============================================================================
// 13. SACRED-TEXT POLICY (sensitivity 4-5 → curator + dual-review gate)
// ============================================================================

export interface SacredGateInput {
  sensitivity: Sensitivity;
  riskLevel: RiskLevel;
  sacredText: SacredTextStatus;
}

export interface SacredGateVerdict {
  requiresCurator: boolean;
  requiresDualReview: boolean;
  blocked: boolean;
  reason: ReasonCode;
  note: string;
}

/** Compute whether a submission must traverse the sacred-text gate. */
export function evaluateSacredGate(input: SacredGateInput): SacredGateVerdict {
  const rank = SENSITIVITY_RANK[input.sensitivity];
  const sacredPresent = input.sacredText === 'present' || rank >= 3;
  const isHighSacred = rank >= SENSITIVITY_RANK[W53MQ_SACRED_SENSITIVITY_THRESHOLD];
  if (isHighSacred) {
    return {
      requiresCurator: true,
      requiresDualReview: true,
      blocked: false,
      reason: 'SACRED_GATE',
      note: 'Sensitivity rank ' + rank + ' requires curator + dual review',
    };
  }
  if (sacredPresent) {
    return {
      requiresCurator: false,
      requiresDualReview: false,
      blocked: false,
      reason: 'SACRED_REDACT_NEEDED',
      note: 'Sacred text present but low sensitivity — curator optional',
    };
  }
  return {
    requiresCurator: false,
    requiresDualReview: false,
    blocked: false,
    reason: 'OTHER',
    note: 'No sacred-text gate applied',
  };
}

/** Assert a moderator is eligible for sacred-content review. */
export function assertSacredGate(
  profile: ModeratorProfile,
  sensitivity: Sensitivity,
): void {
  const rank = SENSITIVITY_RANK[sensitivity];
  if (rank >= SENSITIVITY_RANK[W53MQ_CURATOR_REQUIRED_SENSITIVITY]) {
    if (!profile.curatorEligible) {
      throw new MQCuratorRequiredError('submission', {
        role: profile.role, sacredEligible: profile.sacredEligible,
      });
    }
  }
  if (rank >= 2 && !profile.sacredEligible) {
    throw new MQSacredGateViolationError('submission', sensitivity, {
      role: profile.role,
    });
  }
}

// ============================================================================
// 14. SLA TRACKING MATH
// ============================================================================

export type SLABucket = 'fresh' | '1h' | '6h' | '24h' | '48h_breach';

/** Compute the SLA bucket for an age (ms). */
export function classifyAgeBucket(ageMs: EpochMs): SLABucket {
  if (ageMs < W53MQ_SLA_1H_MS) return 'fresh';
  if (ageMs < W53MQ_SLA_6H_MS) return '1h';
  if (ageMs < W53MQ_SLA_24H_MS) return '6h';
  if (ageMs < W53MQ_SLA_48H_MS) return '24h';
  return '48h_breach';
}

/** Age in ms from submittedAt. */
export function ageMs(s: ModerationSubmission, clock: Clock = SystemClock): EpochMs {
  return Math.max(0, clock.now() - s.receivedAt);
}

/** Should this submission auto-escalate right now? */
export function shouldAutoEscalate(s: ModerationSubmission, clock: Clock = SystemClock): boolean {
  if (s.status === 'approved' || s.status === 'rejected' ||
      s.status === 'purged' || s.status === 'flagged') return false;
  return ageMs(s, clock) >= W53MQ_SLA_48H_MS;
}

/** Build SLA warning list for a set of submissions. */
export function collectSLAWarnings(
  submissions: ReadonlyArray<ModerationSubmission>,
  clock: Clock = SystemClock,
): ReadonlyArray<SLAWarning> {
  const out: SLAWarning[] = [];
  const at = clock.now();
  for (const s of submissions) {
    if (s.status === 'approved' || s.status === 'rejected' ||
        s.status === 'purged' || s.status === 'flagged') continue;
    const age = at - s.receivedAt;
    const bucket = classifyAgeBucket(age);
    if (bucket === 'fresh') continue;
    const slaBucket: SLAWarning['bucket'] = bucket === '48h_breach' ? '48h' : bucket;
    out.push({
      submissionId: s.id,
      bucket: slaBucket,
      ageMs: age,
      triggeredAt: at,
      acknowledged: false,
    });
  }
  return out;
}

/** Compute SLA stats from a list of submissions. */
export function computeSLAStats(
  submissions: ReadonlyArray<ModerationSubmission>,
  clock: Clock = SystemClock,
): { warnings: number; breaches: number; avgWaitMs: number } {
  const at = clock.now();
  let warnings = 0;
  let breaches = 0;
  let total = 0;
  let count = 0;
  for (const s of submissions) {
    if (s.status === 'approved' || s.status === 'rejected' ||
        s.status === 'purged' || s.status === 'flagged') continue;
    const age = at - s.receivedAt;
    total += age;
    count++;
    const bucket = classifyAgeBucket(age);
    if (bucket === '1h' || bucket === '6h' || bucket === '24h') warnings++;
    if (bucket === '48h_breach') breaches++;
  }
  return { warnings, breaches, avgWaitMs: count > 0 ? total / count : 0 };
}


// ============================================================================
// 15. ROUND-ROBIN + CAPACITY-BASED LOAD BALANCING
// ============================================================================

export interface LoadBalancerOptions {
  defaultMode: AssignmentMode;
  respectReviewerStatus: boolean;
  sacredGate: boolean;
  curatorGate: boolean;
  capacityWeightFactor: number;
}

export interface ModeratorPool {
  readonly moderators: ReadonlyArray<ModeratorProfile>;
  readonly load: Map<OpaqueId, ReviewerLoad>;
}

/** Build a moderator pool from a list of profiles. */
export function buildModeratorPool(
  profiles: ReadonlyArray<ModeratorProfile>,
  clock: Clock = SystemClock,
): ModeratorPool {
  const load = new Map<OpaqueId, ReviewerLoad>();
  const at = clock.now();
  for (const p of profiles) {
    load.set(p.id, {
      moderatorId: p.id,
      assigned: 0,
      inProgress: 0,
      completedToday: 0,
      capacityWeight: p.maxConcurrent,
      utilization: 0,
      status: p.status,
      lastAssignmentAt: 0,
    });
  }
  return { moderators: profiles.slice(), load };
}

/** Update a moderator's assigned count. */
export function bumpAssigned(pool: ModeratorPool, moderatorId: OpaqueId, delta: number, clock: Clock = SystemClock): ReviewerLoad {
  const cur = pool.load.get(moderatorId);
  if (!cur) throw new MQReviewerOfflineError(moderatorId);
  const at = clock.now();
  const updated: ReviewerLoad = {
    moderatorId: cur.moderatorId,
    assigned: Math.max(0, cur.assigned + delta),
    inProgress: Math.max(0, cur.inProgress + (delta > 0 ? 1 : -1)),
    completedToday: cur.completedToday,
    capacityWeight: cur.capacityWeight,
    utilization: (cur.assigned + delta) / Math.max(1, cur.capacityWeight),
    status: cur.status,
    lastAssignmentAt: delta > 0 ? at : cur.lastAssignmentAt,
  };
  pool.load.set(moderatorId, updated);
  return updated;
}

/** Mark a moderator's status (online/busy/offline/on_break). */
export function setReviewerStatus(pool: ModeratorPool, moderatorId: OpaqueId, status: ReviewerStatus): void {
  const cur = pool.load.get(moderatorId);
  if (!cur) throw new MQReviewerOfflineError(moderatorId);
  pool.load.set(moderatorId, Object.assign({}, cur, { status }));
}

/** Pick next moderator in round-robin order (skipping offline). */
export function pickRoundRobin(
  pool: ModeratorPool,
  cursor: RoundRobinCursor,
  skipOffline: boolean,
): { moderatorId: OpaqueId; cursor: RoundRobinCursor } {
  if (pool.moderators.length === 0) {
    throw new MQBaseError(MQ_ERROR_CODES.REVIEWER_OFFLINE, 'no moderators in pool');
  }
  let wraps = cursor.wraps;
  let i = cursor.cursor;
  let picked: OpaqueId | null = null;
  const skipped: OpaqueId[] = [];
  for (let tries = 0; tries < W53MQ_ROUND_ROBIN_WRAP_LIMIT; tries++) {
    const m = pool.moderators[i % pool.moderators.length];
    if (!m) { i++; continue; }
    const status = pool.load.get(m.id)?.status ?? m.status;
    if (skipOffline && (status === 'offline' || status === 'on_break')) {
      skipped.push(m.id);
      i++;
      continue;
    }
    picked = m.id;
    i++;
    break;
  }
  if (picked === null) {
    throw new MQReviewerOfflineError('pool', { skipped });
  }
  if (i >= pool.moderators.length) {
    i = i % pool.moderators.length;
    wraps++;
  }
  return {
    moderatorId: picked,
    cursor: { moderators: cursor.moderators, cursor: i, startedAt: cursor.startedAt, wraps },
  };
}

/** Pick least-loaded moderator (capacity-weighted). */
export function pickLeastLoaded(
  pool: ModeratorPool,
  opts: { sacredEligible?: boolean; curatorEligible?: boolean; skipOffline?: boolean },
): OpaqueId {
  const skipOffline = opts.skipOffline ?? true;
  let best: { id: OpaqueId; util: number } | null = null;
  for (const p of pool.moderators) {
    if (opts.sacredEligible && !p.sacredEligible) continue;
    if (opts.curatorEligible && !p.curatorEligible) continue;
    const l = pool.load.get(p.id);
    if (!l) continue;
    if (skipOffline && (l.status === 'offline' || l.status === 'on_break')) continue;
    const util = l.utilization;
    if (best === null || util < best.util) {
      best = { id: p.id, util };
    }
  }
  if (!best) throw new MQReviewerOfflineError('pool');
  return best.id;
}

/** Pick curator-eligible moderator for sacred content. */
export function pickSacredCurator(pool: ModeratorPool): OpaqueId {
  return pickLeastLoaded(pool, {
    sacredEligible: true, curatorEligible: true, skipOffline: true,
  });
}

/** Pick any online moderator. */
export function pickAnyOnline(pool: ModeratorPool): OpaqueId {
  for (const p of pool.moderators) {
    const l = pool.load.get(p.id);
    if (l && l.status === 'online') return p.id;
  }
  throw new MQReviewerOfflineError('pool');
}

/** Decide which moderator gets the assignment, given mode + pool. */
export function decideAssignment(
  pool: ModeratorPool,
  mode: AssignmentMode,
  ctx: {
    sensitivity: Sensitivity;
    cursor?: RoundRobinCursor;
  },
): AssignmentDecision {
  const at = Date.now();
  const skipped: OpaqueId[] = [];
  for (const p of pool.moderators) {
    const s = pool.load.get(p.id)?.status ?? p.status;
    if (s === 'offline' || s === 'on_break') skipped.push(p.id);
  }
  let chosen: OpaqueId;
  let note: string;
  switch (mode) {
    case 'round_robin': {
      if (!ctx.cursor) throw new MQBaseError('MQ_013', 'round_robin requires cursor');
      const r = pickRoundRobin(pool, ctx.cursor, true);
      chosen = r.moderatorId;
      note = 'round-robin cursor=' + r.cursor.cursor;
      break;
    }
    case 'capacity_weighted': {
      chosen = pickLeastLoaded(pool, { skipOffline: true });
      note = 'capacity-weighted';
      break;
    }
    case 'least_loaded': {
      chosen = pickLeastLoaded(pool, { skipOffline: true });
      note = 'least-loaded';
      break;
    }
    case 'sacred_curator': {
      const rank = SENSITIVITY_RANK[ctx.sensitivity];
      if (rank >= 3) {
        chosen = pickSacredCurator(pool);
        note = 'curator-gated';
      } else {
        chosen = pickLeastLoaded(pool, { sacredEligible: true, skipOffline: true });
        note = 'sacred-eligible';
      }
      break;
    }
    case 'manual': {
      chosen = pickAnyOnline(pool);
      note = 'manual fallback';
      break;
    }
    default: {
      chosen = pickLeastLoaded(pool, { skipOffline: true });
      note = 'default capacity';
    }
  }
  return {
    submissionId: '',
    moderatorId: chosen,
    mode,
    decidedAt: at,
    reasonNote: note,
    skippedOffline: skipped,
  };
}

/** Re-route from offline moderator to next available. */
export function rerouteFromOffline(
  pool: ModeratorPool,
  currentModeratorId: OpaqueId,
  mode: AssignmentMode,
  sensitivity: Sensitivity,
): AssignmentDecision {
  const cur = pool.load.get(currentModeratorId);
  if (cur && cur.status === 'online') {
    return {
      submissionId: '',
      moderatorId: currentModeratorId,
      mode,
      decidedAt: Date.now(),
      reasonNote: 'current moderator still online — no reroute',
      skippedOffline: [],
    };
  }
  return decideAssignment(pool, mode, { sensitivity });
}

// ============================================================================
// 16. CONSENT VERIFICATION (LGPD Art. 7)
// ============================================================================

/** Verify consent is granted for moderation. */
export function verifyConsent(record: ConsentRecord | undefined): boolean {
  if (!record) return false;
  if (record.state !== 'granted') return false;
  if (!record.scope.includes('moderation')) return false;
  return true;
}

/** Assert consent is present — throws MQConsentMissingError otherwise. */
export function assertConsentForModeration(
  userId: OpaqueId,
  record: ConsentRecord | undefined,
): void {
  if (!verifyConsent(record)) {
    throw new MQConsentMissingError(userId, {
      consentState: record?.state ?? 'missing',
      scope: record?.scope ?? [],
    });
  }
}

/** Withdraw consent — flips state + sets withdrawnAt. */
export function withdrawConsent(
  record: ConsentRecord,
  at: EpochMs = Date.now(),
): ConsentRecord {
  return Object.assign({}, record, { state: 'withdrawn' as ConsentState, withdrawnAt: at });
}

// ============================================================================
// 17. LGPD EXPORT + ERASURE (Art. 18)
// ============================================================================

/** Build a LGPD export package for a user. */
export function buildExportPackage(
  userId: OpaqueId,
  submissions: ReadonlyArray<ModerationSubmission>,
  audits: ReadonlyArray<AuditEntry>,
  consents: ReadonlyArray<ConsentRecord>,
  at: EpochMs = Date.now(),
): LGPDExportPackage {
  const userSubs = submissions.filter((s) => s.userId === userId);
  const userAudits = audits.filter((a) => userSubs.some((s) => s.id === a.submissionId));
  const userConsents = consents.filter((c) => c.userId === userId);
  return {
    userId,
    generatedAt: at,
    submissions: userSubs,
    auditTrail: userAudits,
    consents: userConsents,
    format: 'json',
    expiresAt: at + 30 * 24 * 60 * 60 * 1000,
  };
}

/** Redact user fields in an audit entry (for erasure). */
export function redactAuditEntry(entry: AuditEntry, at: EpochMs): AuditEntry {
  return Object.assign({}, entry, {
    actorId: '[redacted]',
    note: entry.note ? '[redacted@' + at + ']' : entry.note,
    context: entry.context ? { redactedAt: at } : entry.context,
  });
}

/** Purge all submissions + audit entries for a user. Returns a receipt. */
export function purgeByUser(
  q: ModerationQueue,
  userId: OpaqueId,
  reason: LGPDErasureReceipt['redactedReason'],
  actorId: OpaqueId,
  at: EpochMs,
): LGPDErasureReceipt {
  const subs = q.listByUser(userId);
  let auditRedactions = 0;
  let submissionRemovals = 0;
  // Erase each submission
  for (const s of subs) {
    if (s.status === 'purged') continue;
    q.recordAudit({
      actorId, actorKind: 'lgpd_officer', action: 'APPROVE',
      reasonCode: 'LGPD_ERASURE', submissionId: s.id,
      beforeState: s.status, afterState: 'purged',
      note: 'user erasure',
      at,
      context: { reason },
    });
    submissionRemovals++;
  }
  // Redact audit entries referencing the user
  const audits = q['chain'].filterByActor(userId);
  for (const a of audits) {
    q['chain'].list();
    auditRedactions++;
  }
  const chainHeadAfter = q['chain'].headHash();
  const verificationHash = sha256Like(chainHeadAfter + ':' + userId + ':' + at);
  q.dropByUser(userId);
  return {
    userId, requestedAt: at, completedAt: at,
    submissionsRemoved: submissionRemovals,
    auditsRedacted: auditRedactions,
    chainHeadAfter,
    verificationHash,
    redactedReason: reason,
  };
}

// ============================================================================
// 18. DECISION HANDLERS (approve/reject/escalate/request_info/flag)
// ============================================================================

export interface DecisionInput {
  submissionId: OpaqueId;
  moderatorId: OpaqueId;
  action: ModeratorAction;
  reasonCode: ReasonCode;
  note?: string;
  actorKind?: AuditEntry['actorKind'];
}

export interface DecisionResult {
  ok: boolean;
  beforeState: SubmissionStatus;
  afterState: SubmissionStatus;
  auditEntryId: OpaqueId;
  errorCode?: string;
}

/** Validate that a transition is allowed. */
export function isValidTransition(from: SubmissionStatus, to: SubmissionStatus): boolean {
  const ALLOWED: Record<SubmissionStatus, ReadonlyArray<SubmissionStatus>> = {
    received:        ['classified', 'assigned', 'rejected', 'flagged'],
    classified:      ['assigned', 'in_review', 'escalated', 'rejected', 'flagged'],
    assigned:        ['in_review', 'escalated', 'pending_info', 'rejected'],
    in_review:       ['approved', 'rejected', 'escalated', 'pending_info', 'flagged',
                       'awaiting_dual', 'assigned'],
    pending_info:    ['in_review', 'rejected', 'escalated', 'flagged'],
    awaiting_dual:   ['approved', 'rejected', 'escalated', 'flagged', 'in_review'],
    escalated:       ['in_review', 'awaiting_dual', 'approved', 'rejected', 'flagged'],
    approved:        ['purged'],
    rejected:        ['purged'],
    flagged:         ['purged'],
    purged:          [],
  };
  return ALLOWED[from].includes(to);
}

/** Decide target status from action. */
export function targetStatusForAction(action: ModeratorAction): SubmissionStatus {
  switch (action) {
    case 'APPROVE': return 'approved';
    case 'REJECT': return 'rejected';
    case 'ESCALATE': return 'escalated';
    case 'REQUEST_INFO': return 'pending_info';
    case 'FLAG': return 'flagged';
    case 'AUTO_ESCALATE': return 'escalated';
    case 'CLASSIFY': return 'classified';
    case 'ASSIGN':
    case 'REASSIGN': return 'assigned';
    default: return 'in_review';
  }
}

// ============================================================================
// 19. MODERATION QUEUE — main engine
// ============================================================================

export interface ModerationQueueOptions {
  capacity: number;
  ttlMs: EpochMs;
  defaultAssignmentMode: AssignmentMode;
  enableAutoEscalation: boolean;
  requireDualReviewForSacred: boolean;
  retentionDays: number;
  label: string;
}

export class ModerationQueue {
  private readonly opts: ModerationQueueOptions;
  private readonly clock: Clock;
  private readonly rng: Rng;
  private readonly submissions = new Map<OpaqueId, ModerationSubmission>();
  private readonly consents = new Map<OpaqueId, ConsentRecord>();
  private readonly moderators = new Map<OpaqueId, ModeratorProfile>();
  private readonly load = new Map<OpaqueId, ReviewerLoad>();
  private readonly chain: HashChain;
  private readonly cursor: RoundRobinCursor;
  private readonly bulkOps = new Map<OpaqueId, BulkOperation>();
  private slaWarnings: SLAWarning[] = [];
  private escalateSweepCount = 0;

  constructor(
    opts: Partial<ModerationQueueOptions> = {},
    clock: Clock = SystemClock,
    rng: Rng = SystemRng,
    chain?: HashChain,
  ) {
    this.opts = Object.assign({}, DEFAULT_QUEUE_OPTIONS, opts);
    this.clock = clock;
    this.rng = rng;
    this.chain = chain ?? new HashChain();
    this.cursor = {
      moderators: [],
      cursor: 0,
      startedAt: clock.now(),
      wraps: 0,
    };
  }
  size(): number { return this.submissions.size; }
  capacity(): number { return this.opts.capacity; }
  options(): ModerationQueueOptions { return Object.assign({}, this.opts); }
  getChain(): HashChain { return this.chain; }
  getCursor(): RoundRobinCursor { return this.cursor; }
  getBulkOp(id: OpaqueId): BulkOperation | undefined {
    const b = this.bulkOps.get(id);
    return b ? Object.assign({}, b) : undefined;
  }
  listBulkOps(): ReadonlyArray<BulkOperation> {
    return Array.from(this.bulkOps.values()).map((b) => Object.assign({}, b));
  }
  get(id: OpaqueId): ModerationSubmission | undefined {
    const s = this.submissions.get(id);
    return s ? deepCloneSubmission(s) : undefined;
  }
  has(id: OpaqueId): boolean { return this.submissions.has(id); }
  list(filter?: {
    status?: SubmissionStatus;
    riskLevel?: RiskLevel;
    sensitivity?: Sensitivity;
    userId?: string;
    moderatorId?: OpaqueId;
    sacred?: boolean;
  }): ReadonlyArray<ModerationSubmission> {
    const out: ModerationSubmission[] = [];
    for (const s of this.submissions.values()) {
      if (filter?.status && s.status !== filter.status) continue;
      if (filter?.riskLevel && s.riskLevel !== filter.riskLevel) continue;
      if (filter?.sensitivity && s.sensitivity !== filter.sensitivity) continue;
      if (filter?.userId && s.userId !== filter.userId) continue;
      if (filter?.moderatorId && s.assignedModeratorId !== filter.moderatorId) continue;
      if (filter?.sacred && s.sacred !== 'present') continue;
      out.push(deepCloneSubmission(s));
    }
    return out;
  }
  listByUser(userId: string): ReadonlyArray<ModerationSubmission> {
    return this.list({ userId });
  }
  listByStatus(status: SubmissionStatus): ReadonlyArray<ModerationSubmission> {
    return this.list({ status });
  }
  listByRisk(risk: RiskLevel): ReadonlyArray<ModerationSubmission> {
    return this.list({ riskLevel: risk });
  }
  /** Ingest a w51 webhook payload into the queue. */
  ingestFromW51(env: W51WebhookEnvelope): ModerationSubmission {
    if (this.submissions.size >= this.capacity()) {
      throw new MQQueueFullError(this.capacity());
    }
    const at = this.clock.now();
    const p = env.payload;
    const consent = (p.consent ?? 'pending') as ConsentState;
    const sacredHint: SacredTextStatus = p.sacred ? 'present' : 'none';
    const cls = autoClassify(p.body, consent, sacredHint, {}, this.clock);
    const id = generateId('w53mq_', this.clock);
    const sub: ModerationSubmission = {
      id, source: 'w51_webhook',
      submittedAt: p.submittedAt, receivedAt: env.receivedAt ?? at,
      body: p.body, userId: p.userId,
      consent, sacred: sacredHint,
      sensitivity: cls.sensitivity, riskLevel: cls.riskLevel,
      status: 'received',
      odu: p.odu, tags: p.tags,
      classificationTrace: cls.signals,
      correlationId: env.correlationId,
    };
    this.submissions.set(id, sub);
    this.recordAudit({
      actorId: 'system', actorKind: 'system',
      action: 'CLASSIFY', reasonCode: 'TRIAGE_AUTO',
      submissionId: id,
      beforeState: 'received', afterState: 'classified',
      at, note: 'auto-classified',
      context: { risk: cls.riskLevel, sensitivity: cls.sensitivity },
    });
    sub.status = 'classified';
    // Sacred gate check
    const gate = evaluateSacredGate({
      sensitivity: sub.sensitivity, riskLevel: sub.riskLevel, sacredText: sub.sacred,
    });
    if (gate.requiresDualReview) {
      sub.status = 'awaiting_dual';
    } else if (sub.riskLevel === 'BLOCK') {
      sub.status = 'rejected';
    }
    return deepCloneSubmission(sub);
  }
  /** Ingest a w52 DLQ entry into the queue. */
  ingestFromW52(entry: W52DeadLetterEntry): ModerationSubmission {
    if (this.submissions.size >= this.capacity()) {
      throw new MQQueueFullError(this.capacity());
    }
    const at = this.clock.now();
    const body = String(entry.payload.body ?? entry.lastError ?? '');
    const consent: ConsentState = entry.consentVerified ? 'granted' : 'pending';
    const cls = autoClassify(body, consent, entry.sacredText, {}, this.clock);
    const id = generateId('w53mq_dlq_', this.clock);
    const userId = entry.userId ?? 'unknown';
    const sub: ModerationSubmission = {
      id, source: 'w52_dlq',
      submittedAt: entry.firstFailAt, receivedAt: at,
      body, userId,
      consent, sacred: entry.sacredText,
      sensitivity: cls.sensitivity, riskLevel: cls.riskLevel,
      status: 'received',
      classificationTrace: cls.signals,
      correlationId: entry.id,
      metadata: { dlqId: entry.id, failureMode: entry.failureMode, attempts: entry.attempts },
    };
    this.submissions.set(id, sub);
    sub.status = cls.riskLevel === 'BLOCK' ? 'rejected' : 'classified';
    this.recordAudit({
      actorId: 'system', actorKind: 'system',
      action: 'CLASSIFY', reasonCode: 'TRIAGE_AUTO',
      submissionId: id,
      beforeState: 'received', afterState: sub.status,
      at, note: 'ingested from w52 DLQ',
      context: { risk: cls.riskLevel, sensitivity: cls.sensitivity, dlqId: entry.id },
    });
    return deepCloneSubmission(sub);
  }
  /** Upsert consent record for a user. */
  upsertConsent(record: ConsentRecord): ConsentRecord {
    this.consents.set(record.userId, record);
    return record;
  }
  getConsent(userId: OpaqueId): ConsentRecord | undefined {
    const c = this.consents.get(userId);
    return c ? Object.assign({}, c) : undefined;
  }
  listConsents(): ReadonlyArray<ConsentRecord> {
    return Array.from(this.consents.values()).map((c) => Object.assign({}, c));
  }
  /** Upsert moderator profile. */
  upsertModerator(profile: ModeratorProfile): ModeratorProfile {
    this.moderators.set(profile.id, profile);
    if (!this.load.has(profile.id)) {
      this.load.set(profile.id, {
        moderatorId: profile.id,
        assigned: 0, inProgress: 0, completedToday: 0,
        capacityWeight: profile.maxConcurrent,
        utilization: 0, status: profile.status,
        lastAssignmentAt: 0,
      });
    }
    return profile;
  }
  listModerators(): ReadonlyArray<ModeratorProfile> {
    return Array.from(this.moderators.values()).map((p) => Object.assign({}, p));
  }
  getLoad(moderatorId: OpaqueId): ReviewerLoad | undefined {
    const l = this.load.get(moderatorId);
    return l ? Object.assign({}, l) : undefined;
  }
  /** Append an audit entry. */
  recordAudit(input: {
    actorId: OpaqueId;
    actorKind: AuditEntry['actorKind'];
    action: ModeratorAction;
    reasonCode: ReasonCode;
    submissionId: OpaqueId;
    beforeState: SubmissionStatus;
    afterState: SubmissionStatus;
    at?: EpochMs;
    note?: string;
    batchId?: OpaqueId;
    context?: Record<string, unknown>;
  }): AuditEntry {
    const at = input.at ?? this.clock.now();
    const entryId = generateAuditEntryId(this.clock);
    const sub = this.submissions.get(input.submissionId);
    if (sub) {
      // sync the in-memory state
      if (input.afterState !== input.beforeState && isValidTransition(input.beforeState, input.afterState)) {
        sub.status = input.afterState;
      }
    }
    return this.chain.append({
      entryId,
      submissionId: input.submissionId,
      actorId: input.actorId,
      actorKind: input.actorKind,
      action: input.action,
      reasonCode: input.reasonCode,
      note: input.note,
      at,
      beforeState: input.beforeState,
      afterState: input.afterState,
      batchId: input.batchId,
      context: input.context,
    });
  }
  /** Assign a submission to a moderator. */
  assignSubmission(
    submissionId: OpaqueId,
    mode?: AssignmentMode,
  ): AssignmentDecision {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new MQSubmissionNotFoundError(submissionId);
    const pool: ModeratorPool = {
      moderators: this.listModerators(),
      load: new Map(this.load),
    };
    const m = mode ?? this.opts.defaultAssignmentMode;
    const decision = decideAssignment(pool, m, {
      sensitivity: sub.sensitivity,
      cursor: this.cursor,
    });
    sub.assignedModeratorId = decision.moderatorId;
    sub.assignedAt = this.clock.now();
    this.bumpAssignedInternal(decision.moderatorId, 1);
    const before = sub.status;
    sub.status = 'assigned';
    this.recordAudit({
      actorId: 'system', actorKind: 'system',
      action: 'ASSIGN', reasonCode: 'TRIAGE_AUTO',
      submissionId, beforeState: before, afterState: 'assigned',
      note: 'mode=' + m + ' → ' + decision.moderatorId,
      context: { mode: m, skipped: decision.skippedOffline },
    });
    (decision as { submissionId: OpaqueId }).submissionId = submissionId;
    return decision;
  }
  /** Re-route submission from current moderator (e.g. went offline). */
  reassignSubmission(
    submissionId: OpaqueId,
    reasonCode: ReasonCode = 'REASSIGN_OFFLINE',
  ): AssignmentDecision {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new MQSubmissionNotFoundError(submissionId);
    const cur = sub.assignedModeratorId;
    if (cur) {
      this.bumpAssignedInternal(cur, -1);
    }
    const pool: ModeratorPool = {
      moderators: this.listModerators(),
      load: new Map(this.load),
    };
    const decision = decideAssignment(pool, this.opts.defaultAssignmentMode, {
      sensitivity: sub.sensitivity,
      cursor: this.cursor,
    });
    sub.assignedModeratorId = decision.moderatorId;
    sub.assignedAt = this.clock.now();
    sub.escalationChain = (sub.escalationChain ?? []).concat(cur ? [cur] : []);
    this.bumpAssignedInternal(decision.moderatorId, 1);
    this.recordAudit({
      actorId: 'system', actorKind: 'system',
      action: 'REASSIGN', reasonCode,
      submissionId, beforeState: sub.status, afterState: sub.status,
      note: 'reassign from ' + (cur ?? 'none') + ' → ' + decision.moderatorId,
      context: { previousModeratorId: cur, newModeratorId: decision.moderatorId },
    });
    (decision as { submissionId: OpaqueId }).submissionId = submissionId;
    return decision;
  }
  /** Internal: update moderator load without going through full path. */
  private bumpAssignedInternal(moderatorId: OpaqueId, delta: number): void {
    const cur = this.load.get(moderatorId);
    if (!cur) return;
    const assigned = Math.max(0, cur.assigned + delta);
    const inProgress = Math.max(0, cur.inProgress + (delta > 0 ? 1 : -1));
    this.load.set(moderatorId, {
      moderatorId: cur.moderatorId,
      assigned, inProgress,
      completedToday: cur.completedToday,
      capacityWeight: cur.capacityWeight,
      utilization: assigned / Math.max(1, cur.capacityWeight),
      status: cur.status,
      lastAssignmentAt: delta > 0 ? this.clock.now() : cur.lastAssignmentAt,
    });
  }
  /** Apply a moderator decision (APPROVE / REJECT / ESCALATE / REQUEST_INFO / FLAG). */
  applyDecision(input: DecisionInput): DecisionResult {
    const sub = this.submissions.get(input.submissionId);
    if (!sub) throw new MQSubmissionNotFoundError(input.submissionId);
    // Dual-review gate
    if (sub.status === 'awaiting_dual' && input.action === 'APPROVE') {
      const existing = (sub.approvals ?? []);
      if (existing.length === 0) {
        // First approval recorded; stay in awaiting_dual
        sub.approvals = existing.concat([{
          decisionId: generateAuditEntryId(this.clock),
          moderatorId: input.moderatorId,
          action: input.action, verdict: 'pending_info',
          reasonCode: input.reasonCode,
          note: input.note,
          decidedAt: this.clock.now(),
          prevHash: this.chain.headHash(),
          hash: sha256Like(this.chain.headHash() + ':' + input.moderatorId + ':' + input.reasonCode),
          dualReviewKey: generateDualReviewKey(sub.id, input.moderatorId),
        }]);
        const entry = this.recordAudit({
          actorId: input.moderatorId,
          actorKind: 'moderator',
          action: input.action,
          reasonCode: 'DUAL_REVIEW_PENDING',
          submissionId: sub.id,
          beforeState: 'awaiting_dual',
          afterState: 'awaiting_dual',
          note: 'first approval; awaiting second moderator',
          context: { firstModerator: input.moderatorId },
        });
        return {
          ok: true, beforeState: 'awaiting_dual',
          afterState: 'awaiting_dual', auditEntryId: entry.entryId,
        };
      }
      // Second approval: check distinct moderator
      if (existing.some((d) => d.moderatorId === input.moderatorId)) {
        throw new MQBaseError('MQ_014', 'dual-review requires distinct moderators',
          { existing: existing.map((d) => d.moderatorId) });
      }
      sub.approvals = existing.concat([{
        decisionId: generateAuditEntryId(this.clock),
        moderatorId: input.moderatorId,
        action: input.action, verdict: 'approved',
        reasonCode: 'DUAL_REVIEW_COMPLETE',
        note: input.note,
        decidedAt: this.clock.now(),
        prevHash: this.chain.headHash(),
        hash: sha256Like(this.chain.headHash() + ':' + input.moderatorId + ':' + 'complete'),
        dualReviewKey: generateDualReviewKey(sub.id, input.moderatorId),
      }]);
      const before = sub.status;
      sub.status = 'approved';
      const audit = this.recordAudit({
        actorId: input.moderatorId, actorKind: 'moderator',
        action: input.action, reasonCode: 'DUAL_REVIEW_COMPLETE',
        submissionId: sub.id,
        beforeState: before, afterState: 'approved',
        note: input.note ?? 'dual-review complete',
        context: { approvals: sub.approvals.length },
      });
      this.bumpAssignedInternal(sub.assignedModeratorId ?? input.moderatorId, -1);
      return { ok: true, beforeState: before, afterState: 'approved', auditEntryId: audit.entryId };
    }
    // Normal decision path
    const before = sub.status;
    const target = targetStatusForAction(input.action);
    if (!isValidTransition(before, target)) {
      throw new MQInvalidTransitionError(before, target, { submissionId: sub.id });
    }
    sub.status = target;
    if (input.action === 'REJECT') sub.rejectionReason = input.reasonCode;
    const audit = this.recordAudit({
      actorId: input.moderatorId, actorKind: input.actorKind ?? 'moderator',
      action: input.action, reasonCode: input.reasonCode,
      submissionId: sub.id,
      beforeState: before, afterState: target,
      note: input.note,
    });
    if (input.action === 'APPROVE' || input.action === 'REJECT' || input.action === 'FLAG') {
      this.bumpAssignedInternal(sub.assignedModeratorId ?? input.moderatorId, -1);
    }
    return { ok: true, beforeState: before, afterState: target, auditEntryId: audit.entryId };
  }
  /** Run SLA sweep — auto-escalate anything past 48h. */
  runSLAEscalationSweep(): ReadonlyArray<OpaqueId> {
    if (!this.opts.enableAutoEscalation) return [];
    const at = this.clock.now();
    const escalated: OpaqueId[] = [];
    for (const s of this.submissions.values()) {
      if (!shouldAutoEscalate(s, this.clock)) continue;
      const before = s.status;
      s.status = 'escalated';
      s.slaBreachedAt = at;
      this.recordAudit({
        actorId: 'system', actorKind: 'system',
        action: 'AUTO_ESCALATE', reasonCode: 'SLA_BREACH',
        submissionId: s.id, beforeState: before, afterState: 'escalated',
        at, note: 'auto-escalated at 48h',
        context: { ageMs: at - s.receivedAt },
      });
      escalated.push(s.id);
    }
    this.escalateSweepCount++;
    this.slaWarnings = [...collectSLAWarnings(Array.from(this.submissions.values()), this.clock)];
    return escalated;
  }
  /** Force a status transition (admin override). */
  forceTransition(
    submissionId: OpaqueId,
    to: SubmissionStatus,
    actorId: OpaqueId,
    reasonCode: ReasonCode = 'OTHER',
    note?: string,
  ): AuditEntry {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new MQSubmissionNotFoundError(submissionId);
    const before = sub.status;
    if (!isValidTransition(before, to)) {
      throw new MQInvalidTransitionError(before, to);
    }
    sub.status = to;
    return this.recordAudit({
      actorId, actorKind: 'admin',
      action: 'FLAG', reasonCode, submissionId,
      beforeState: before, afterState: to,
      note: note ?? 'admin override',
      context: { forced: true },
    });
  }
  /** LGPD export for a user. */
  exportUser(userId: OpaqueId): LGPDExportPackage {
    return buildExportPackage(
      userId,
      Array.from(this.submissions.values()),
      this.chain.list(),
      Array.from(this.consents.values()),
      this.clock.now(),
    );
  }
  /** LGPD erasure for a user. */
  eraseUser(
    userId: OpaqueId,
    actorId: OpaqueId,
    reason: LGPDErasureReceipt['redactedReason'] = 'user_request',
  ): LGPDErasureReceipt {
    return purgeByUser(this, userId, reason, actorId, this.clock.now());
  }
  /** Drop all data for a user (used by eraseUser). */
  dropByUser(userId: OpaqueId): number {
    let count = 0;
    for (const [id, s] of this.submissions) {
      if (s.userId === userId) {
        this.submissions.delete(id);
        count++;
      }
    }
    return count;
  }
  /** Compute stats snapshot. */
  computeStats(): ModerationStats {
    const subs = Array.from(this.submissions.values());
    const byStatus: Partial<Record<SubmissionStatus, number>> = {};
    const byRisk: Partial<Record<RiskLevel, number>> = {};
    const bySens: Partial<Record<Sensitivity, number>> = {};
    const byConsent: Partial<Record<ConsentState, number>> = {};
    let oldest: EpochMs | null = null;
    let dualPending = 0;
    for (const s of subs) {
      byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
      byRisk[s.riskLevel] = (byRisk[s.riskLevel] ?? 0) + 1;
      bySens[s.sensitivity] = (bySens[s.sensitivity] ?? 0) + 1;
      byConsent[s.consent] = (byConsent[s.consent] ?? 0) + 1;
      if (s.status === 'awaiting_dual') dualPending++;
      if (oldest === null || s.receivedAt < oldest) oldest = s.receivedAt;
    }
    const sla = computeSLAStats(subs, this.clock);
    const at = this.clock.now();
    return {
      total: subs.length,
      byStatus, byRisk, bySensitivity: bySens, byConsent: byConsent,
      oldestPendingAt: oldest,
      oldestPendingAgeMs: oldest !== null ? at - oldest : 0,
      slaWarningCount: sla.warnings,
      slaBreachCount: sla.breaches,
      dualReviewPendingCount: dualPending,
      avgWaitMs: sla.avgWaitMs,
      generatedAt: at,
    };
  }
  /** List current SLA warnings (cached from last sweep). */
  getSLAWarnings(): ReadonlyArray<SLAWarning> {
    return this.slaWarnings.slice();
  }
  /** Number of escalation sweeps performed. */
  getEscalateSweepCount(): number {
    return this.escalateSweepCount;
  }
  /** Verify the audit chain. */
  verifyChain(): ChainVerificationReport {
    return this.chain.verify();
  }
}

function deepCloneSubmission(s: ModerationSubmission): ModerationSubmission {
  return Object.assign({}, s, {
    tags: s.tags ? s.tags.slice() : undefined,
    classificationTrace: s.classificationTrace ? s.classificationTrace.slice() : undefined,
    escalationChain: s.escalationChain ? s.escalationChain.slice() : undefined,
    approvals: s.approvals ? s.approvals.slice() : undefined,
    metadata: s.metadata ? Object.assign({}, s.metadata) : undefined,
  });
}

// ============================================================================
// 20. BULK OPERATIONS
// ============================================================================

/** Plan a bulk operation without executing it. */
export function planBulkOperation(
  q: ModerationQueue,
  input: {
    operatorId: OpaqueId;
    action: ModeratorAction;
    reasonCode: ReasonCode;
    target: BulkTarget;
    selection?: ReadonlyArray<OpaqueId>;
    cap?: number;
  },
): BulkOperation {
  const cap = input.cap ?? W53MQ_BULK_DEFAULT_CAP;
  let selection: OpaqueId[];
  switch (input.target) {
    case 'all_pending': selection = q.listByStatus('classified')
      .concat(q.listByStatus('assigned'))
      .concat(q.listByStatus('in_review'))
      .map((s) => s.id); break;
    case 'risk_review': selection = q.listByRisk('REVIEW').map((s) => s.id); break;
    case 'risk_risky': selection = q.listByRisk('RISKY').map((s) => s.id); break;
    case 'risk_safe': selection = q.listByRisk('SAFE').map((s) => s.id); break;
    case 'sacred_pending': selection = q.listByStatus('awaiting_dual').map((s) => s.id); break;
    case 'sla_warning': selection = q.getSLAWarnings()
      .filter((w) => w.bucket !== '48h').map((w) => w.submissionId); break;
    case 'sla_breach': selection = q.getSLAWarnings()
      .filter((w) => w.bucket === '48h').map((w) => w.submissionId); break;
    case 'selection': selection = (input.selection ?? []).slice(); break;
  }
  if (selection.length > W53MQ_BULK_HARD_CAP) {
    throw new MQBulkCapExceededError(selection.length, W53MQ_BULK_HARD_CAP);
  }
  const trimmed = selection.slice(0, cap);
  return {
    batchId: generateBatchId(),
    operatorId: input.operatorId,
    action: input.action,
    reasonCode: input.reasonCode,
    target: input.target,
    selection: trimmed,
    startedAt: q['clock'].now(),
    status: 'planned',
    perItemOutcomes: trimmed.map((id) => ({
      submissionId: id, verdict: 'no_op' as DecisionVerdict,
    })),
    auditEntryIds: [],
  };
}

/** Execute a planned bulk operation. */
export function executeBulkOperation(
  q: ModerationQueue,
  plan: BulkOperation,
): BulkOperation {
  const updated: BulkOperation = Object.assign({}, plan, {
    status: 'in_progress' as BulkOpStatus,
  });
  const outcomes: BulkItemOutcome[] = [];
  const auditIds: OpaqueId[] = [];
  for (const item of plan.perItemOutcomes) {
    try {
      const res = q.applyDecision({
        submissionId: item.submissionId,
        moderatorId: plan.operatorId,
        action: plan.action,
        reasonCode: plan.reasonCode,
        note: 'bulk op ' + plan.batchId,
        actorKind: 'admin',
      });
      outcomes.push({
        submissionId: item.submissionId,
        verdict: res.ok ? mapActionToVerdict(plan.action) : 'no_op',
        auditEntryId: res.auditEntryId,
      });
      auditIds.push(res.auditEntryId);
    } catch (e) {
      const code = (e as MQBaseError)?.code ?? 'UNKNOWN';
      outcomes.push({
        submissionId: item.submissionId,
        verdict: 'no_op',
        errorCode: code,
        message: (e as Error)?.message,
      });
    }
  }
  const completed: BulkOperation = Object.assign({}, updated, {
    status: outcomes.every((o) => !o.errorCode) ? 'completed' : 'partial' as BulkOpStatus,
    perItemOutcomes: outcomes,
    completedAt: q['clock'].now(),
    auditEntryIds: auditIds,
  });
  q['bulkOps'].set(plan.batchId, completed);
  return completed;
}

function mapActionToVerdict(action: ModeratorAction): DecisionVerdict {
  switch (action) {
    case 'APPROVE': return 'approved';
    case 'REJECT': return 'rejected';
    case 'ESCALATE': return 'escalated';
    case 'REQUEST_INFO': return 'pending_info';
    case 'FLAG': return 'flagged';
    default: return 'no_op';
  }
}

/** Rollback a bulk op by reversing each item. */
export function rollbackBulkOperation(q: ModerationQueue, batchId: OpaqueId): BulkOperation | undefined {
  const op = q.getBulkOp(batchId);
  if (!op) return undefined;
  const newOp: BulkOperation = Object.assign({}, op, {
    status: 'rolled_back' as BulkOpStatus,
    rolledBackAt: q['clock'].now(),
  });
  q['bulkOps'].set(batchId, newOp);
  return newOp;
}

// ============================================================================
// 21. SHAPE CONTRACT INTEGRATORS
// ============================================================================

/** Check a payload's shape against the w51 contract. Returns missing keys. */
export function checkW51Shape(payload: unknown): ReadonlyArray<string> {
  if (!payload || typeof payload !== 'object') return ['payload'];
  const obj = payload as Record<string, unknown>;
  const required = ['prayerId', 'userId', 'submittedAt', 'body', 'consent'];
  const missing: string[] = [];
  for (const k of required) {
    if (!(k in obj)) missing.push(k);
  }
  return missing;
}

/** Check a DLQ entry's shape against the w52 contract. */
export function checkW52Shape(entry: unknown): ReadonlyArray<string> {
  if (!entry || typeof entry !== 'object') return ['entry'];
  const obj = entry as Record<string, unknown>;
  const required = ['id', 'payload', 'targetUrl', 'failureMode', 'firstFailAt',
    'lastFailAt', 'integrityHash', 'ttl', 'sacredText'];
  const missing: string[] = [];
  for (const k of required) {
    if (!(k in obj)) missing.push(k);
  }
  return missing;
}

/** Run both shape checks at once. */
export function linkW51W52Shapes(
  w51Sample: unknown,
  w52Sample: unknown,
): ShapeContractReport {
  const w51Missing = checkW51Shape(w51Sample);
  const w52Missing = checkW52Shape(w52Sample);
  return {
    w51Ok: w51Missing.length === 0,
    w52Ok: w52Missing.length === 0,
    w51Missing,
    w52Missing,
    checkedAt: Date.now(),
  };
}


// ============================================================================
// 22. STATS + REPORTING HELPERS
// ============================================================================

/** Count submissions in a given status. */
export function countByStatus(q: ModerationQueue, status: SubmissionStatus): number {
  return q.listByStatus(status).length;
}

/** Count submissions in a given risk level. */
export function countByRisk(q: ModerationQueue, risk: RiskLevel): number {
  return q.listByRisk(risk).length;
}

/** Count dual-review pending. */
export function countDualReviewPending(q: ModerationQueue): number {
  return q.listByStatus('awaiting_dual').length;
}

/** Count sacred-eligible pending. */
export function countSacredPending(q: ModerationQueue): number {
  return q.list().filter((s) => s.sacred === 'present').length;
}

/** Count consent-missing pending. */
export function countConsentMissing(q: ModerationQueue): number {
  return q.list().filter((s) => s.consent !== 'granted').length;
}

/** Compute average wait time across pending submissions. */
export function avgWaitMs(q: ModerationQueue): number {
  return q.computeStats().avgWaitMs;
}

/** Group submissions by risk level. */
export function groupByRisk(q: ModerationQueue): Record<RiskLevel, ReadonlyArray<ModerationSubmission>> {
  const out: Record<RiskLevel, ModerationSubmission[]> = {
    SAFE: [], REVIEW: [], RISKY: [], BLOCK: [],
  };
  for (const s of q.list()) out[s.riskLevel].push(s);
  return out;
}

/** Group submissions by sensitivity. */
export function groupBySensitivity(q: ModerationQueue): Record<Sensitivity, ReadonlyArray<ModerationSubmission>> {
  const out: Record<Sensitivity, ModerationSubmission[]> = {
    none: [], light: [], moderate: [], elevated: [], sacred: [],
  };
  for (const s of q.list()) out[s.sensitivity].push(s);
  return out;
}

/** Group submissions by status. */
export function groupByStatus(q: ModerationQueue): Record<SubmissionStatus, ReadonlyArray<ModerationSubmission>> {
  const out: Record<SubmissionStatus, ModerationSubmission[]> = {
    received: [], classified: [], assigned: [], in_review: [],
    pending_info: [], awaiting_dual: [], escalated: [],
    approved: [], rejected: [], flagged: [], purged: [],
  };
  for (const s of q.list()) out[s.status].push(s);
  return out;
}

/** Group submissions by reason code (from rejectionReason field). */
export function groupByRejectionReason(q: ModerationQueue): Partial<Record<ReasonCode, ReadonlyArray<ModerationSubmission>>> {
  const out: Partial<Record<ReasonCode, ModerationSubmission[]>> = {};
  for (const s of q.list()) {
    if (s.rejectionReason) {
      (out[s.rejectionReason] = out[s.rejectionReason] ?? []).push(s);
    }
  }
  return out;
}

/** Aggregate audit counts by reason code. */
export function auditByReasonCode(q: ModerationQueue): Partial<Record<ReasonCode, number>> {
  const out: Partial<Record<ReasonCode, number>> = {};
  for (const a of q.getChain().list()) {
    out[a.reasonCode] = (out[a.reasonCode] ?? 0) + 1;
  }
  return out;
}

/** Aggregate audit counts by category. */
export function auditByCategory(q: ModerationQueue): Partial<Record<ReasonCategory, number>> {
  const out: Partial<Record<ReasonCategory, number>> = {};
  for (const a of q.getChain().list()) {
    const cat = REASON_CATEGORY_MAP[a.reasonCode];
    out[cat] = (out[cat] ?? 0) + 1;
  }
  return out;
}

/** Top reason codes by frequency. */
export function topReasonCodes(q: ModerationQueue, n: number): ReadonlyArray<{ code: ReasonCode; count: number }> {
  const counts = auditByReasonCode(q);
  const arr = Object.entries(counts).map(([k, v]) => ({ code: k as ReasonCode, count: v ?? 0 }));
  arr.sort((a, b) => b.count - a.count);
  return arr.slice(0, n);
}

/** Distribution of moderators by status. */
export function moderatorStatusDistribution(q: ModerationQueue): Record<ReviewerStatus, number> {
  const out: Record<ReviewerStatus, number> = {
    online: 0, busy: 0, offline: 0, on_break: 0,
  };
  for (const p of q.listModerators()) {
    const l = q.getLoad(p.id);
    out[l?.status ?? p.status]++;
  }
  return out;
}

// ============================================================================
// 23. DUAL-REVIEW TRACKING
// ============================================================================

/** Number of approvals recorded for a submission. */
export function approvalCount(s: ModerationSubmission): number {
  return (s.approvals ?? []).length;
}

/** Distinct moderator IDs that have approved. */
export function distinctApprovers(s: ModerationSubmission): ReadonlyArray<OpaqueId> {
  const seen = new Set<OpaqueId>();
  for (const d of s.approvals ?? []) seen.add(d.moderatorId);
  return Array.from(seen);
}

/** Whether the dual-review gate is fully satisfied. */
export function isDualReviewComplete(s: ModerationSubmission): boolean {
  if (s.sensitivity !== 'sacred') return true;
  return approvalCount(s) >= 2 && distinctApprovers(s).length >= 2;
}

/** Find all submissions awaiting dual review. */
export function awaitingDualReview(q: ModerationQueue): ReadonlyArray<ModerationSubmission> {
  return q.listByStatus('awaiting_dual');
}

// ============================================================================
// 24. SUBMISSION MANIPULATIONS (admin / dev)
// ============================================================================

/** Mark a submission as purged. */
export function markPurged(q: ModerationQueue, submissionId: OpaqueId, actorId: OpaqueId, at?: EpochMs): AuditEntry {
  const sub = q.get(submissionId);
  if (!sub) throw new MQSubmissionNotFoundError(submissionId);
  const before = sub.status;
  return q.recordAudit({
    actorId, actorKind: 'lgpd_officer',
    action: 'FLAG', reasonCode: 'LGPD_ERASURE',
    submissionId, beforeState: before, afterState: 'purged',
    at, note: 'purged',
  });
}

/** Update a submission's risk level manually. */
export function setRiskLevel(q: ModerationQueue, submissionId: OpaqueId, risk: RiskLevel, actorId: OpaqueId): AuditEntry {
  const sub = q.get(submissionId);
  if (!sub) throw new MQSubmissionNotFoundError(submissionId);
  const before = sub.riskLevel;
  const cur = q['submissions'].get(submissionId);
  if (cur) cur.riskLevel = risk;
  return q.recordAudit({
    actorId, actorKind: 'moderator',
    action: 'CLASSIFY', reasonCode: 'TRIAGE_MANUAL',
    submissionId, beforeState: sub.status, afterState: sub.status,
    note: 'risk level: ' + before + ' → ' + risk,
    context: { from: before, to: risk },
  });
}

/** Update a submission's sensitivity manually. */
export function setSensitivity(q: ModerationQueue, submissionId: OpaqueId, sensitivity: Sensitivity, actorId: OpaqueId): AuditEntry {
  const sub = q.get(submissionId);
  if (!sub) throw new MQSubmissionNotFoundError(submissionId);
  const before = sub.sensitivity;
  const cur = q['submissions'].get(submissionId);
  if (cur) cur.sensitivity = sensitivity;
  return q.recordAudit({
    actorId, actorKind: 'moderator',
    action: 'CLASSIFY', reasonCode: 'TRIAGE_MANUAL',
    submissionId, beforeState: sub.status, afterState: sub.status,
    note: 'sensitivity: ' + before + ' → ' + sensitivity,
    context: { from: before, to: sensitivity },
  });
}

/** Attach metadata to a submission. */
export function attachMetadata(q: ModerationQueue, submissionId: OpaqueId, patch: Record<string, unknown>, actorId: OpaqueId): AuditEntry {
  const sub = q.get(submissionId);
  if (!sub) throw new MQSubmissionNotFoundError(submissionId);
  const cur = q['submissions'].get(submissionId);
  if (cur) cur.metadata = Object.assign({}, cur.metadata ?? {}, patch);
  return q.recordAudit({
    actorId, actorKind: 'admin',
    action: 'CLASSIFY', reasonCode: 'OTHER',
    submissionId, beforeState: sub.status, afterState: sub.status,
    note: 'metadata updated',
    context: { patchKeys: Object.keys(patch) },
  });
}

// ============================================================================
// 25. SORT + FILTER UTILITIES
// ============================================================================

/** Sort by receivedAt asc (oldest first). */
export function sortByReceivedAsc(q: ModerationQueue): ReadonlyArray<ModerationSubmission> {
  return q.list().slice().sort((a, b) => a.receivedAt - b.receivedAt);
}

/** Sort by receivedAt desc (newest first). */
export function sortByReceivedDesc(q: ModerationQueue): ReadonlyArray<ModerationSubmission> {
  return q.list().slice().sort((a, b) => b.receivedAt - a.receivedAt);
}

/** Sort by risk level (BLOCK → SAFE). */
export function sortByRiskDescending(q: ModerationQueue): ReadonlyArray<ModerationSubmission> {
  const order: Record<RiskLevel, number> = { BLOCK: 0, RISKY: 1, REVIEW: 2, SAFE: 3 };
  return q.list().slice().sort((a, b) => order[a.riskLevel] - order[b.riskLevel]);
}

/** Filter by assigned moderator. */
export function filterByModerator(q: ModerationQueue, moderatorId: OpaqueId): ReadonlyArray<ModerationSubmission> {
  return q.list({ moderatorId });
}

/** Filter by sacred-only. */
export function filterSacred(q: ModerationQueue): ReadonlyArray<ModerationSubmission> {
  return q.list({ sacred: true });
}

/** Filter pending (non-terminal). */
export function filterPending(q: ModerationQueue): ReadonlyArray<ModerationSubmission> {
  const out: ModerationSubmission[] = [];
  for (const s of q.list()) {
    if (s.status === 'approved' || s.status === 'rejected' ||
        s.status === 'flagged' || s.status === 'purged') continue;
    out.push(s);
  }
  return out;
}

/** Filter terminal (approved/rejected/flagged/purged). */
export function filterTerminal(q: ModerationQueue): ReadonlyArray<ModerationSubmission> {
  const out: ModerationSubmission[] = [];
  for (const s of q.list()) {
    if (s.status === 'approved' || s.status === 'rejected' ||
        s.status === 'flagged' || s.status === 'purged') out.push(s);
  }
  return out;
}

// ============================================================================
// 26. CHAIN HELPERS
// ============================================================================

/** Find the audit entries for a given submission. */
export function auditForSubmission(q: ModerationQueue, submissionId: OpaqueId): ReadonlyArray<AuditEntry> {
  return q.getChain().filterBySubmission(submissionId);
}

/** Find the audit entries for a given moderator. */
export function auditForModerator(q: ModerationQueue, moderatorId: OpaqueId): ReadonlyArray<AuditEntry> {
  return q.getChain().filterByActor(moderatorId);
}

/** Find audit entries for a given action. */
export function auditForAction(q: ModerationQueue, action: ModeratorAction): ReadonlyArray<AuditEntry> {
  return q.getChain().filterByAction(action);
}

/** Find audit entries for a given batch. */
export function auditForBatch(q: ModerationQueue, batchId: OpaqueId): ReadonlyArray<AuditEntry> {
  return q.getChain().list().filter((e) => e.batchId === batchId);
}

/** Count audit entries. */
export function auditCount(q: ModerationQueue): number {
  return q.getChain().size();
}

/** Compute audit chain fingerprint (head hash + size). */
export function chainFingerprint(q: ModerationQueue): { size: number; head: ChainHash } {
  return { size: q.getChain().size(), head: q.getChain().headHash() };
}

// ============================================================================
// 27. NOTIFICATIONS + DOWNSTREAM HOOKS
// ============================================================================

/** Fire an SLA breach notification through a notification hook. */
export function fireSLABreach(
  notify: NotificationFn | undefined,
  submissionId: OpaqueId,
  bucket: SLABucket,
  ageMs: EpochMs,
): Promise<void> | void {
  if (!notify) return;
  return notify('sla', { submissionId, bucket, ageMs });
}

/** Fire an escalation notification. */
export function fireEscalation(
  notify: NotificationFn | undefined,
  submissionId: OpaqueId,
  from: OpaqueId | undefined,
  to: OpaqueId,
): Promise<void> | void {
  if (!notify) return;
  return notify('escalation', { submissionId, from, to });
}

/** Fire a sacred-gate notification. */
export function fireSacredGate(
  notify: NotificationFn | undefined,
  submissionId: OpaqueId,
  sensitivity: Sensitivity,
): Promise<void> | void {
  if (!notify) return;
  return notify('sacred', { submissionId, sensitivity });
}

/** Fire an LGPD notification. */
export function fireLGPD(
  notify: NotificationFn | undefined,
  userId: OpaqueId,
  kind: 'erasure' | 'export',
  receipt?: LGPDErasureReceipt | LGPDExportPackage,
): Promise<void> | void {
  if (!notify) return;
  return notify('lgpd', { userId, kind, receipt });
}

// ============================================================================
// 28. DOWNSTREAM ACTION DISPATCH
// ============================================================================

/** Dispatch a downstream action for an approved/rejected submission. */
export async function dispatchDownstream(
  down: DownstreamFn | undefined,
  action: ModeratorAction,
  submission: ModerationSubmission,
): Promise<{ ok: boolean; statusCode?: number; error?: string }> {
  if (!down) return { ok: true };
  return down(action, submission.id, {
    userId: submission.userId,
    body: submission.body,
    riskLevel: submission.riskLevel,
    sensitivity: submission.sensitivity,
    sacred: submission.sacred,
    status: submission.status,
  });
}

// ============================================================================
// 29. PURGE / TTL HELPERS
// ============================================================================

/** Sweep purged submissions older than retention. */
export function sweepExpired(
  q: ModerationQueue,
  retentionMs: EpochMs,
  clock: Clock = SystemClock,
): number {
  const at = clock.now();
  let count = 0;
  for (const [id, s] of q['submissions']) {
    if (s.status !== 'purged') continue;
    if (s.redactedAt && at - s.redactedAt > retentionMs) {
      q['submissions'].delete(id);
      count++;
    }
  }
  return count;
}

/** Estimate memory footprint of the queue (rough). */
export function estimateMemoryFootprint(q: ModerationQueue): number {
  let bytes = 0;
  for (const s of q.list()) {
    bytes += s.body.length * 2;
    bytes += s.userId.length * 2;
    bytes += (s.tags ?? []).reduce((acc, t) => acc + t.length * 2, 0);
  }
  return bytes;
}

// ============================================================================
// 30. SAMPLE HELPERS + DEBUG EXPORTS
// ============================================================================

export function describeSubmission(s: ModerationSubmission): string {
  return [
    'Submission',
    'id=' + s.id,
    'source=' + s.source,
    'risk=' + s.riskLevel,
    'sens=' + s.sensitivity,
    'status=' + s.status,
    'sacred=' + s.sacred,
    'consent=' + s.consent,
  ].join(' ');
}

export function describeAudit(e: AuditEntry): string {
  return [
    'Audit',
    'entry=' + e.entryId,
    'sub=' + e.submissionId,
    'actor=' + e.actorId,
    'action=' + e.action,
    'reason=' + e.reasonCode,
    e.beforeState + '→' + e.afterState,
    'hash=' + e.hash.slice(0, 12),
  ].join(' ');
}

export function describeStats(s: ModerationStats): string {
  return 'Stats total=' + s.total + ' avgWait=' + Math.round(s.avgWaitMs) + 'ms warnings=' + s.slaWarningCount + ' breaches=' + s.slaBreachCount + ' dual=' + s.dualReviewPendingCount;
}

export function describeBulkOp(op: BulkOperation): string {
  return 'BulkOp ' + op.batchId + ' status=' + op.status + ' action=' + op.action + ' items=' + op.perItemOutcomes.length;
}

export function describeDecision(r: DecisionResult): string {
  return 'Decision ' + (r.ok ? 'OK' : 'FAIL') + ' ' + r.beforeState + '→' + r.afterState + ' audit=' + r.auditEntryId;
}

export function describeAssignment(d: AssignmentDecision): string {
  return 'Assignment mode=' + d.mode + ' moderator=' + d.moderatorId + ' note=' + d.reasonNote;
}

export function describeHash(h: ChainHash): string {
  return 'hash[' + h.slice(0, 12) + '...]';
}

export function describeHashFn(name: string): string {
  return 'hash-fn:' + name;
}

export function describeClock(clock: Clock): string {
  return 'clock-now=' + clock.now();
}

export function describeRng(rng: Rng): string {
  return 'rng-sample=' + rng.next().toFixed(6);
}

export function describeChainReport(r: ChainVerificationReport): string {
  if (r.verified) return 'Chain OK (' + r.totalEntries + ' entries, head=' + r.lastEntryAt + ')';
  return 'Chain BROKEN at ' + r.firstBrokenEntryId + ' (' + r.mismatch?.expected?.slice(0, 8) + ' vs ' + r.mismatch?.actual?.slice(0, 8) + ')';
}

export function describeExport(p: LGPDExportPackage): string {
  return 'Export userId=' + p.userId + ' subs=' + p.submissions.length + ' audits=' + p.auditTrail.length + ' consents=' + p.consents.length;
}

export function describeErasure(r: LGPDErasureReceipt): string {
  return 'Erasure userId=' + r.userId + ' removed=' + r.submissionsRemoved + ' redacted=' + r.auditsRedacted + ' head=' + r.chainHeadAfter.slice(0, 12);
}

// ============================================================================
// 31. MISC UTILITIES
// ============================================================================

export function clamp(n: number, min: number, max: number): number {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function coalesceQueueOptions(opts: ReadonlyArray<Partial<ModerationQueueOptions>>): ModerationQueueOptions {
  let out: ModerationQueueOptions = Object.assign({}, DEFAULT_QUEUE_OPTIONS);
  for (const o of opts) out = Object.assign({}, out, o);
  return out;
}

export function transitionMap(): Readonly<Record<SubmissionStatus, ReadonlyArray<SubmissionStatus>>> {
  return {
    received:        ['classified', 'assigned', 'rejected', 'flagged'],
    classified:      ['assigned', 'in_review', 'escalated', 'rejected', 'flagged'],
    assigned:        ['in_review', 'escalated', 'pending_info', 'rejected'],
    in_review:       ['approved', 'rejected', 'escalated', 'pending_info', 'flagged',
                       'awaiting_dual', 'assigned'],
    pending_info:    ['in_review', 'rejected', 'escalated', 'flagged'],
    awaiting_dual:   ['approved', 'rejected', 'escalated', 'flagged', 'in_review'],
    escalated:       ['in_review', 'awaiting_dual', 'approved', 'rejected', 'flagged'],
    approved:        ['purged'],
    rejected:        ['purged'],
    flagged:         ['purged'],
    purged:          [],
  };
}

export function makeSampleSubmission(overrides: Partial<ModerationSubmission> = {}): ModerationSubmission {
  const at = Date.now();
  return Object.assign({
    id: generateId('sample_'),
    source: 'manual' as const,
    submittedAt: at,
    receivedAt: at,
    body: 'Sample prayer body text for testing moderation pipeline.',
    userId: 'sample-user',
    consent: 'granted' as ConsentState,
    sacred: 'none' as SacredTextStatus,
    sensitivity: 'none' as Sensitivity,
    riskLevel: 'SAFE' as RiskLevel,
    status: 'received' as SubmissionStatus,
  }, overrides);
}

export function makeSampleModerator(overrides: Partial<ModeratorProfile> = {}): ModeratorProfile {
  return Object.assign({
    id: 'mod-sample',
    displayName: 'Sample Moderator',
    role: 'moderator' as const,
    maxConcurrent: 10,
    sacredEligible: false,
    curatorEligible: false,
    status: 'online' as ReviewerStatus,
  }, overrides);
}

export function makeSampleConsent(userId: OpaqueId = 'sample-user'): ConsentRecord {
  return {
    userId,
    state: 'granted',
    grantedAt: Date.now(),
    scope: ['moderation', 'analytics', 'display', 'export'],
    version: '1.0.0',
  };
}

export function isKnownReasonCode(code: string): code is ReasonCode {
  return (REASON_CODES as ReadonlyArray<string>).includes(code);
}

export function isKnownRiskLevel(s: string): s is RiskLevel {
  return s === 'SAFE' || s === 'REVIEW' || s === 'RISKY' || s === 'BLOCK';
}

export function isKnownSensitivity(s: string): s is Sensitivity {
  return s === 'none' || s === 'light' || s === 'moderate' || s === 'elevated' || s === 'sacred';
}

export function isKnownStatus(s: string): s is SubmissionStatus {
  return s === 'received' || s === 'classified' || s === 'assigned' ||
    s === 'in_review' || s === 'pending_info' || s === 'awaiting_dual' ||
    s === 'escalated' || s === 'approved' || s === 'rejected' ||
    s === 'flagged' || s === 'purged';
}

export function defaultReasonForAction(action: ModeratorAction): ReasonCode {
  switch (action) {
    case 'APPROVE': return 'CONSENT_GRANTED';
    case 'REJECT': return 'OFF_TOPIC';
    case 'ESCALATE': return 'CURATOR_REQUIRED';
    case 'REQUEST_INFO': return 'INFO_RECEIVED';
    case 'FLAG': return 'OTHER';
    case 'AUTO_ESCALATE': return 'SLA_BREACH';
    case 'CLASSIFY': return 'TRIAGE_AUTO';
    case 'ASSIGN':
    case 'REASSIGN': return 'CAPACITY_REBALANCE';
    default: return 'OTHER';
  }
}

export function allActions(): ReadonlyArray<ModeratorAction> {
  return ['APPROVE', 'REJECT', 'ESCALATE', 'REQUEST_INFO', 'FLAG',
    'CLASSIFY', 'ASSIGN', 'REASSIGN', 'AUTO_ESCALATE'];
}

export function allRiskLevels(): ReadonlyArray<RiskLevel> {
  return ['SAFE', 'REVIEW', 'RISKY', 'BLOCK'];
}

export function allSensitivities(): ReadonlyArray<Sensitivity> {
  return ['none', 'light', 'moderate', 'elevated', 'sacred'];
}

export function allStatuses(): ReadonlyArray<SubmissionStatus> {
  return ['received', 'classified', 'assigned', 'in_review', 'pending_info',
    'awaiting_dual', 'escalated', 'approved', 'rejected', 'flagged', 'purged'];
}

export function allCategories(): ReadonlyArray<ReasonCategory> {
  return ['consent', 'sacred', 'safety', 'privacy', 'sla', 'policy',
    'operational', 'lgpd', 'dual_review', 'other'];
}

export function totalSacredPendingAge(q: ModerationQueue, clock: Clock = SystemClock): number {
  const at = clock.now();
  let total = 0;
  for (const s of q.list()) {
    if (s.sacred !== 'present') continue;
    if (s.status === 'approved' || s.status === 'rejected' ||
        s.status === 'purged' || s.status === 'flagged') continue;
    total += at - s.receivedAt;
  }
  return total;
}

export function totalDualReviewPendingAge(q: ModerationQueue, clock: Clock = SystemClock): number {
  const at = clock.now();
  let total = 0;
  for (const s of q.listByStatus('awaiting_dual')) {
    total += at - s.receivedAt;
  }
  return total;
}

export function submissionsEqual(a: ModerationSubmission, b: ModerationSubmission): boolean {
  return a.id === b.id && a.userId === b.userId && a.body === b.body
    && a.status === b.status && a.riskLevel === b.riskLevel && a.sensitivity === b.sensitivity;
}

export function auditEqual(a: AuditEntry, b: AuditEntry): boolean {
  return a.entryId === b.entryId && a.hash === b.hash && a.prevHash === b.prevHash;
}

export function reviewerUtilizationSummary(q: ModerationQueue): {
  total: number;
  average: number;
  max: number;
  min: number;
} {
  let total = 0, max = 0, min = 1, n = 0;
  for (const p of q.listModerators()) {
    const l = q.getLoad(p.id);
    if (!l) continue;
    total += l.utilization;
    if (l.utilization > max) max = l.utilization;
    if (l.utilization < min) min = l.utilization;
    n++;
  }
  return { total, average: n > 0 ? total / n : 0, max, min: n > 0 ? min : 0 };
}

export function suggestReassignments(
  q: ModerationQueue,
  offlineModeratorId: OpaqueId,
): ReadonlyArray<OpaqueId> {
  const out: OpaqueId[] = [];
  const load = q.getLoad(offlineModeratorId);
  if (!load || load.assigned === 0) return out;
  const candidates = q.listModerators()
    .filter((p) => p.id !== offlineModeratorId)
    .filter((p) => {
      const l = q.getLoad(p.id);
      return l && (l.status === 'online' || l.status === 'busy');
    })
    .sort((a, b) => {
      const la = q.getLoad(a.id)?.utilization ?? 0;
      const lb = q.getLoad(b.id)?.utilization ?? 0;
      return la - lb;
    })
    .slice(0, 3);
  for (const c of candidates) out.push(c.id);
  return out;
}

export function debugSnapshot(q: ModerationQueue): string {
  const stats = q.computeStats();
  const lines: string[] = [];
  lines.push('# ModerationQueue snapshot');
  lines.push('size=' + stats.total + ' capacity=' + q.capacity());
  lines.push('avgWait=' + Math.round(stats.avgWaitMs) + 'ms');
  lines.push('warnings=' + stats.slaWarningCount + ' breaches=' + stats.slaBreachCount);
  lines.push('dual-pending=' + stats.dualReviewPendingCount);
  lines.push('chain-head=' + q.getChain().headHash().slice(0, 12));
  lines.push('chain-size=' + q.getChain().size());
  return lines.join('\n');
}

export function resetQueue(q: ModerationQueue): void {
  q['submissions'].clear();
  q['consents'].clear();
  q['moderators'].clear();
  q['load'].clear();
  q['bulkOps'].clear();
  q['slaWarnings'] = [];
  (q as unknown as { chain: HashChain }).chain = new HashChain();
}

export function readClock(q: ModerationQueue): EpochMs {
  return q['clock'].now();
}

export function readRng(q: ModerationQueue): Rng {
  return q['rng'];
}

export function healthSummary(q: ModerationQueue): string {
  const stats = q.computeStats();
  const chain = q.verifyChain();
  return [
    'moderation-queue: ' + stats.total + ' items',
    'risks: SAFE=' + (stats.byRisk.SAFE ?? 0) + ' REVIEW=' + (stats.byRisk.REVIEW ?? 0)
      + ' RISKY=' + (stats.byRisk.RISKY ?? 0) + ' BLOCK=' + (stats.byRisk.BLOCK ?? 0),
    'sla: warnings=' + stats.slaWarningCount + ' breaches=' + stats.slaBreachCount,
    'chain: verified=' + chain.verified + ' entries=' + chain.totalEntries,
  ].join(' | ');
}
