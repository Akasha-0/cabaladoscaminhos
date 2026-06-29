// ============================================================================
// Admin Cockpit UI — Engine Data Layer (Wave 50, 2026-06-29)
// ============================================================================
//
// Filosofia:
//   - Camada pura: sem imports de react/next/prisma. Apenas types + functions
//     puras para que o cockpit UI (Next.js client + server components) seja
//     um wrapper fino sobre este engine.
//   - LGPD Art. 7 (consentimento) + Art. 8 (legitimidade) + Art. 18 (direitos
//     do titular): toda ação administrativa passa por `auditAdminAction`
//     que registra actor + target + reason + timestamp + base legal.
//   - Determinístico: hashes via FNV-1a 32-bit (sem crypto.randomUUID para
//     garantir snapshots estáveis em ambientes edge).
//   - RBAC em duas camadas: (1) `requireAdminRole` (gate), (2)
//     `getEffectivePermissions` (fine-grained por seção).
//
// Compõe (sem importar diretamente — apenas tipos esperados):
//   - w48/sacred-symbols-registry     — listagem, filter, attribution ledger
//   - w48/daily-reflection-push        — schedules ativas, delivery metrics
//   - w49/push-ab-experiment-dashboard — A/B experiment metrics
//   - w49/symbol-render-component      — render spec consumption
//   - w49/voice-mood-detection         — mood distribution analytics
//   - w49/recap-share-receipts         — receipt state
//   - w49/tradition-prayer-corpus      — corpus coverage
//
// Saída do módulo:
//   - 30+ named exports
//   - 0 `any` types
//   - 0 `console.log` em produção
//   - 1500-2500 linhas
//
// ============================================================================

// ----------------------------------------------------------------------------
// SECTION 0 — Branded primitives (zero-cost, readability + safety)
// ----------------------------------------------------------------------------

declare const __cockpit_brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__cockpit_brand]: B };

export type WidgetId = Brand<string, "WidgetId">;
export type SectionId = Brand<AdminCockpitSection, "SectionId">;
export type AdminActorId = Brand<string, "AdminActorId">;
export type TargetId = Brand<string, "TargetId">;
export type CorrelationId = Brand<string, "CorrelationId">;
export type AuditLogId = Brand<string, "AuditLogId">;
export type CacheKey = Brand<string, "CacheKey">;
export type IsoTimestamp = Brand<string, "IsoTimestamp">;
export type LocaleCode = Brand<string, "LocaleCode">;

export const asWidgetId = (s: string): WidgetId => s as WidgetId;
export const asAdminActorId = (s: string): AdminActorId => s as AdminActorId;
export const asTargetId = (s: string): TargetId => s as TargetId;
export const asCorrelationId = (s: string): CorrelationId => s as CorrelationId;
export const asAuditLogId = (s: string): AuditLogId => s as AuditLogId;
export const asCacheKey = (s: string): CacheKey => s as CacheKey;
export const asIsoTimestamp = (s: string): IsoTimestamp => s as IsoTimestamp;
export const asLocaleCode = (s: string): LocaleCode => s as LocaleCode;

// ----------------------------------------------------------------------------
// SECTION 1 — Sections & roles (taxonomy)
// ----------------------------------------------------------------------------

export type AdminCockpitSection =
  | "sacred_symbols"
  | "push_schedules"
  | "ab_experiments"
  | "voice_mood_distribution"
  | "prayer_corpus_coverage"
  | "recap_receipts"
  | "moderation_queue"
  | "audit_log";

export const ADMIN_COCKPIT_SECTIONS: readonly AdminCockpitSection[] = [
  "sacred_symbols",
  "push_schedules",
  "ab_experiments",
  "voice_mood_distribution",
  "prayer_corpus_coverage",
  "recap_receipts",
  "moderation_queue",
  "audit_log",
] as const;

export type AdminRole = "owner" | "admin" | "curator" | "moderator" | "viewer";

export const ADMIN_ROLE_VALUES: readonly AdminRole[] = [
  "owner",
  "admin",
  "curator",
  "moderator",
  "viewer",
] as const;

export type DataShape = "scalar" | "timeseries" | "distribution" | "list" | "funnel";

export const DATA_SHAPE_VALUES: readonly DataShape[] = [
  "scalar",
  "timeseries",
  "distribution",
  "list",
  "funnel",
] as const;

export type SensitivityLevel = "public" | "curated" | "initiate" | "restricted";

export const SENSITIVITY_VALUES: readonly SensitivityLevel[] = [
  "public",
  "curated",
  "initiate",
  "restricted",
] as const;

export type PushScheduleState = "draft" | "active" | "paused" | "archived";

export const PUSH_STATE_VALUES: readonly PushScheduleState[] = [
  "draft",
  "active",
  "paused",
  "archived",
] as const;

export type ExperimentState =
  | "draft"
  | "running"
  | "decided"
  | "abandoned"
  | "promoted";

export const EXPERIMENT_STATE_VALUES: readonly ExperimentState[] = [
  "draft",
  "running",
  "decided",
  "abandoned",
  "promoted",
] as const;

export type Tradition =
  | "umbanda"
  | "candomble"
  | "ifá"
  | "cabala"
  | "budismo"
  | "xamanismo"
  | "cristianismo_mistico"
  | "espiritismo"
  | "sufismo"
  | "hinduismo"
  | "taoismo"
  | "outros";

export const TRADITION_VALUES: readonly Tradition[] = [
  "umbanda",
  "candomble",
  "ifá",
  "cabala",
  "budismo",
  "xamanismo",
  "cristianismo_mistico",
  "espiritismo",
  "sufismo",
  "hinduismo",
  "taoismo",
  "outros",
] as const;

export type VoiceMoodLabel =
  | "contemplative"
  | "celebratory"
  | "urgent"
  | "luminous"
  | "grounding"
  | "transcendent"
  | "protective"
  | "neutral";

export const VOICE_MOOD_VALUES: readonly VoiceMoodLabel[] = [
  "contemplative",
  "celebratory",
  "urgent",
  "luminous",
  "grounding",
  "transcendent",
  "protective",
  "neutral",
] as const;

export type RecapReceiptState =
  | "pending"
  | "sent"
  | "delivered"
  | "viewed"
  | "acknowledged"
  | "declined"
  | "expired";

export const RECAP_STATE_VALUES: readonly RecapReceiptState[] = [
  "pending",
  "sent",
  "delivered",
  "viewed",
  "acknowledged",
  "declined",
  "expired",
] as const;

export type ModerationQueueStatus = "open" | "in_review" | "sla_breached" | "appealed" | "resolved";

export const MODERATION_STATUS_VALUES: readonly ModerationQueueStatus[] = [
  "open",
  "in_review",
  "sla_breached",
  "appealed",
  "resolved",
] as const;

export type AdminActionKind =
  | "view_widget"
  | "export_snapshot"
  | "merge_context"
  | "force_refresh"
  | "mark_stale"
  | "permission_grant"
  | "permission_revoke"
  | "moderation_resolve"
  | "moderation_escalate"
  | "schedule_pause"
  | "schedule_resume"
  | "experiment_abandon"
  | "experiment_promote"
  | "receipt_resend"
  | "audit_export"
  | "consent_revoke";

export const ADMIN_ACTION_KINDS: readonly AdminActionKind[] = [
  "view_widget",
  "export_snapshot",
  "merge_context",
  "force_refresh",
  "mark_stale",
  "permission_grant",
  "permission_revoke",
  "moderation_resolve",
  "moderation_escalate",
  "schedule_pause",
  "schedule_resume",
  "experiment_abandon",
  "experiment_promote",
  "receipt_resend",
  "audit_export",
  "consent_revoke",
] as const;

export type LgpdLegalBasis =
  | "consentimento"
  | "cumprimento_obrigacao_legal"
  | "execucao_contrato"
  | "interesse_legitimo"
  | "exercicio_regular_direitos"
  | "tutela_da_saude"
  | "interesse_publico";

export const LGPD_LEGAL_BASIS: readonly LgpdLegalBasis[] = [
  "consentimento",
  "cumprimento_obrigacao_legal",
  "execucao_contrato",
  "interesse_legitimo",
  "exercicio_regular_direitos",
  "tutela_da_saude",
  "interesse_publico",
] as const;

// ----------------------------------------------------------------------------
// SECTION 2 — Section metadata + permission matrix
// ----------------------------------------------------------------------------

export interface CockpitSectionMeta {
  readonly section: AdminCockpitSection;
  readonly titleI18nKey: string;
  readonly descriptionI18nKey: string;
  readonly defaultRefreshSec: number;
  readonly defaultTtlSec: number;
  readonly dataShape: DataShape;
  readonly lgpdArticle: "Art.7" | "Art.8" | "Art.18" | "Art.7+Art.18" | "Art.8+Art.18";
}

export const COCKPIT_SECTION_REGISTRY: Readonly<Record<AdminCockpitSection, CockpitSectionMeta>> = {
  sacred_symbols: {
    section: "sacred_symbols",
    titleI18nKey: "cockpit.sacred_symbols.title",
    descriptionI18nKey: "cockpit.sacred_symbols.description",
    defaultRefreshSec: 300,
    defaultTtlSec: 600,
    dataShape: "distribution",
    lgpdArticle: "Art.7",
  },
  push_schedules: {
    section: "push_schedules",
    titleI18nKey: "cockpit.push_schedules.title",
    descriptionI18nKey: "cockpit.push_schedules.description",
    defaultRefreshSec: 60,
    defaultTtlSec: 120,
    dataShape: "funnel",
    lgpdArticle: "Art.7",
  },
  ab_experiments: {
    section: "ab_experiments",
    titleI18nKey: "cockpit.ab_experiments.title",
    descriptionI18nKey: "cockpit.ab_experiments.description",
    defaultRefreshSec: 60,
    defaultTtlSec: 120,
    dataShape: "distribution",
    lgpdArticle: "Art.7+Art.18",
  },
  voice_mood_distribution: {
    section: "voice_mood_distribution",
    titleI18nKey: "cockpit.voice_mood.title",
    descriptionI18nKey: "cockpit.voice_mood.description",
    defaultRefreshSec: 300,
    defaultTtlSec: 900,
    dataShape: "distribution",
    lgpdArticle: "Art.7",
  },
  prayer_corpus_coverage: {
    section: "prayer_corpus_coverage",
    titleI18nKey: "cockpit.prayer_corpus.title",
    descriptionI18nKey: "cockpit.prayer_corpus.description",
    defaultRefreshSec: 3600,
    defaultTtlSec: 7200,
    dataShape: "distribution",
    lgpdArticle: "Art.7",
  },
  recap_receipts: {
    section: "recap_receipts",
    titleI18nKey: "cockpit.recap_receipts.title",
    descriptionI18nKey: "cockpit.recap_receipts.description",
    defaultRefreshSec: 60,
    defaultTtlSec: 120,
    dataShape: "funnel",
    lgpdArticle: "Art.7+Art.18",
  },
  moderation_queue: {
    section: "moderation_queue",
    titleI18nKey: "cockpit.moderation.title",
    descriptionI18nKey: "cockpit.moderation.description",
    defaultRefreshSec: 30,
    defaultTtlSec: 60,
    dataShape: "list",
    lgpdArticle: "Art.7+Art.18",
  },
  audit_log: {
    section: "audit_log",
    titleI18nKey: "cockpit.audit_log.title",
    descriptionI18nKey: "cockpit.audit_log.description",
    defaultRefreshSec: 30,
    defaultTtlSec: 60,
    dataShape: "list",
    lgpdArticle: "Art.18",
  },
};

export const DEFAULT_COCKPIT_REFRESH_INTERVALS: Readonly<
  Record<AdminCockpitSection, number>
> = {
  sacred_symbols: 300,
  push_schedules: 60,
  ab_experiments: 60,
  voice_mood_distribution: 300,
  prayer_corpus_coverage: 3600,
  recap_receipts: 60,
  moderation_queue: 30,
  audit_log: 30,
};

export const DEFAULT_COCKPIT_TTLS: Readonly<Record<AdminCockpitSection, number>> = {
  sacred_symbols: 600,
  push_schedules: 120,
  ab_experiments: 120,
  voice_mood_distribution: 900,
  prayer_corpus_coverage: 7200,
  recap_receipts: 120,
  moderation_queue: 60,
  audit_log: 60,
};

// RBAC: section × role. true = pode ver.
export const COCKPIT_PERMISSION_MATRIX: Readonly<
  Record<AdminCockpitSection, ReadonlyArray<AdminRole>>
> = {
  sacred_symbols: ["owner", "admin", "curator"],
  push_schedules: ["owner", "admin"],
  ab_experiments: ["owner", "admin"],
  voice_mood_distribution: ["owner", "admin", "curator"],
  prayer_corpus_coverage: ["owner", "admin", "curator"],
  recap_receipts: ["owner", "admin"],
  moderation_queue: ["owner", "admin", "moderator"],
  audit_log: ["owner", "admin"],
};

export const ADMIN_ROLE_HIERARCHY: Readonly<Record<AdminRole, number>> = {
  owner: 100,
  admin: 80,
  curator: 60,
  moderator: 40,
  viewer: 20,
};

// ----------------------------------------------------------------------------
// SECTION 3 — Source domain types (interfaces esperadas dos wave-features)
// ----------------------------------------------------------------------------
// Estes são os tipos esperados dos wave-features. Não importamos os módulos
// diretamente — escrevemos conforme a forma documentada por cada wave.
//
// w48/sacred-symbols-registry
export interface SacredSymbolRecord {
  readonly id: string;
  readonly slug: string;
  readonly displayName: string;
  readonly tradition: Tradition;
  readonly sensitivity: SensitivityLevel;
  readonly attributedAt: number;
  readonly attributedBy: string;
  readonly attributionLedger: ReadonlyArray<SacredSymbolAttribution>;
  readonly renderSpecId: string | null;
  readonly locale: string;
  readonly tags: ReadonlyArray<string>;
  readonly updatedAt: number;
}

export interface SacredSymbolAttribution {
  readonly attributedBy: string;
  readonly attributedAt: number;
  readonly note: string;
  readonly previousSensitivity: SensitivityLevel | null;
}

// w48/daily-reflection-push
export interface PushScheduleRecord {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly state: PushScheduleState;
  readonly timezone: string;
  readonly cron: string;
  readonly createdBy: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly locale: string;
  readonly linkedExperimentId: string | null;
}

export interface PushDeliveryRecord {
  readonly id: string;
  readonly scheduleId: string;
  readonly userId: string;
  readonly deliveredAt: number;
  readonly opened: boolean;
  readonly channel: "web_push" | "email" | "in_app";
  readonly locale: string;
  readonly variant: string | null;
}

// w49/push-ab-experiment-dashboard
export interface ABExperimentRecord {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly state: ExperimentState;
  readonly startedAt: number;
  readonly endedAt: number | null;
  readonly variants: ReadonlyArray<ABVariantRecord>;
  readonly primaryMetric: string;
  readonly lgpdBasis: LgpdLegalBasis;
}

export interface ABVariantRecord {
  readonly id: string;
  readonly label: string;
  readonly exposures: number;
  readonly conversions: number;
  readonly meanMetric: number;
  readonly varianceMetric: number;
}

// w49/voice-mood-detection
export interface VoiceMoodPrediction {
  readonly id: string;
  readonly userId: string;
  readonly predictedAt: number;
  readonly mood: VoiceMoodLabel;
  readonly confidence: number;
  readonly durationMs: number;
  readonly sessionId: string;
  readonly locale: string;
}

// w49/recap-share-receipts
export interface RecapReceiptRecord {
  readonly id: string;
  readonly recapId: string;
  readonly recipientId: string;
  readonly state: RecapReceiptState;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly channel: "link" | "qr" | "email";
  readonly declineReason: string | null;
}

// w49/tradition-prayer-corpus
export interface PrayerCorpusEntry {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly tradition: Tradition;
  readonly category: string;
  readonly locale: string;
  readonly reserved: boolean;
  readonly approvedAt: number | null;
  readonly corpusTags: ReadonlyArray<string>;
}

// moderation (interno)
export interface ModerationQueueEntry {
  readonly id: string;
  readonly targetType: "prayer" | "symbol" | "comment" | "user";
  readonly targetId: string;
  readonly reason: string;
  readonly status: ModerationQueueStatus;
  readonly slaDueAt: number;
  readonly createdAt: number;
  readonly assignedTo: string | null;
  readonly appealed: boolean;
  readonly locale: string;
}

// audit log (interno)
export interface AuditLogEntry {
  readonly id: string;
  readonly actorId: string;
  readonly actorRole: AdminRole;
  readonly action: AdminActionKind;
  readonly targetType: string;
  readonly targetId: string;
  readonly section: AdminCockpitSection;
  readonly lgpdBasis: LgpdLegalBasis;
  readonly reason: string;
  readonly occurredAt: number;
  readonly correlationId: string;
  readonly metadata: Readonly<Record<string, string | number | boolean>>;
}

// ----------------------------------------------------------------------------
// SECTION 4 — Widget data types (per section)
// ----------------------------------------------------------------------------

export interface SacredSymbolsWidgetData {
  readonly totalSymbols: number;
  readonly bySensitivity: Readonly<Record<SensitivityLevel, number>>;
  readonly byTradition: Readonly<Record<Tradition, number>>;
  readonly lastAttributionUpdateMs: number;
  readonly attributedThisWeek: number;
  readonly pendingReview: number;
  readonly locale: string;
}

export interface PushSchedulesWidgetData {
  readonly totalSchedules: number;
  readonly byState: Readonly<Record<PushScheduleState, number>>;
  readonly deliverySuccessRate: number; // 0..1
  readonly openRate: number; // 0..1
  readonly totalDeliveries24h: number;
  readonly byTimezone: Readonly<Record<string, number>>;
  readonly byChannel: Readonly<Record<"web_push" | "email" | "in_app", number>>;
  readonly locale: string;
}

export interface ABExperimentsWidgetData {
  readonly runningCount: number;
  readonly decidedThisWeek: number;
  readonly totalExposures: number;
  readonly significantCount: number;
  readonly byState: Readonly<Record<ExperimentState, number>>;
  readonly topWinner: {
    readonly experimentId: string;
    readonly variantId: string;
    readonly upliftPct: number;
    readonly exposures: number;
  } | null;
  readonly locale: string;
}

export interface VoiceMoodWidgetData {
  readonly windowMs: number;
  readonly totalPredictions: number;
  readonly byMood: Readonly<Record<VoiceMoodLabel, number>>;
  readonly meanConfidence: number;
  readonly distinctSessions: number;
  readonly locale: string;
}

export interface PrayerCorpusWidgetData {
  readonly totalEntries: number;
  readonly approvedEntries: number;
  readonly pendingEntries: number;
  readonly reservedSlotsPending: number;
  readonly byTradition: Readonly<Record<Tradition, number>>;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly byLocale: Readonly<Record<string, number>>;
  readonly locale: string;
}

export interface RecapReceiptsWidgetData {
  readonly total: number;
  readonly byState: Readonly<Record<RecapReceiptState, number>>;
  readonly funnelRates: {
    readonly sentToDelivered: number;
    readonly deliveredToViewed: number;
    readonly viewedToAcknowledged: number;
  };
  readonly declineReasons: ReadonlyArray<{ readonly reason: string; readonly count: number }>;
  readonly last24h: number;
}

export interface ModerationQueueWidgetData {
  readonly openCount: number;
  readonly slaBreached: number;
  readonly appealsPending: number;
  readonly byStatus: Readonly<Record<ModerationQueueStatus, number>>;
  readonly oldestOpenMs: number;
  readonly avgResolutionMs: number;
}

export interface AuditLogWidgetData {
  readonly windowMs: number;
  readonly totalActions: number;
  readonly byActionKind: Readonly<Record<AdminActionKind, number>>;
  readonly byRole: Readonly<Record<AdminRole, number>>;
  readonly uniqueActors: number;
  readonly entries: ReadonlyArray<AuditLogEntry>;
  readonly roleFilter: AdminRole | "all";
}

export type WidgetData =
  | SacredSymbolsWidgetData
  | PushSchedulesWidgetData
  | ABExperimentsWidgetData
  | VoiceMoodWidgetData
  | PrayerCorpusWidgetData
  | RecapReceiptsWidgetData
  | ModerationQueueWidgetData
  | AuditLogWidgetData;

// ----------------------------------------------------------------------------
// SECTION 5 — Widget envelope
// ----------------------------------------------------------------------------

export interface CockpitWidget<TData extends WidgetData = WidgetData> {
  readonly id: WidgetId;
  readonly section: AdminCockpitSection;
  readonly title: string;
  readonly description: string;
  readonly dataShape: DataShape;
  readonly refreshIntervalSec: number;
  readonly permissions: ReadonlyArray<AdminRole>;
  readonly ttl: number;
  readonly data: TData;
  readonly fetchedAt: number;
  readonly expiresAt: number;
  readonly nextRefreshAt: number;
  readonly stale: boolean;
  readonly staleReason: string | null;
  readonly lgpdBasis: LgpdLegalBasis;
  readonly correlationId: CorrelationId;
}

// ----------------------------------------------------------------------------
// SECTION 6 — Actor & context
// ----------------------------------------------------------------------------

export interface AdminActor {
  readonly id: AdminActorId;
  readonly role: AdminRole;
  readonly locale: string;
  readonly consentVersion: string;
  readonly consentGrantedAt: number;
}

export interface CockpitContext {
  readonly actor: AdminActor;
  readonly nowMs: number;
  readonly locale: string;
  readonly correlationId: CorrelationId;
  readonly lgpdBasis: LgpdLegalBasis;
}

export interface CockpitSnapshot {
  readonly widgetCount: number;
  readonly widgets: ReadonlyArray<CockpitWidget>;
  readonly summary: CockpitSummary;
  readonly capturedAt: number;
  readonly capturedBy: AdminActorId;
  readonly correlationId: CorrelationId;
}

export interface CockpitSummary {
  readonly healthy: number;
  readonly stale: number;
  readonly expiringSoon: number;
  readonly sectionsCovered: number;
  readonly worstSection: AdminCockpitSection | null;
  readonly totalRefreshLoad: number;
}

// ----------------------------------------------------------------------------
// SECTION 7 — Type guards & assertions
// ----------------------------------------------------------------------------

const ADMIN_ROLE_SET: ReadonlySet<string> = new Set(ADMIN_ROLE_VALUES);
const SECTION_SET: ReadonlySet<string> = new Set(ADMIN_COCKPIT_SECTIONS);
const SENSITIVITY_SET: ReadonlySet<string> = new Set(SENSITIVITY_VALUES);
const PUSH_STATE_SET: ReadonlySet<string> = new Set(PUSH_STATE_VALUES);
const EXPERIMENT_STATE_SET: ReadonlySet<string> = new Set(EXPERIMENT_STATE_VALUES);
const TRADITION_SET: ReadonlySet<string> = new Set(TRADITION_VALUES);
const VOICE_MOOD_SET: ReadonlySet<string> = new Set(VOICE_MOOD_VALUES);
const RECAP_STATE_SET: ReadonlySet<string> = new Set(RECAP_STATE_VALUES);
const MODERATION_STATUS_SET: ReadonlySet<string> = new Set(MODERATION_STATUS_VALUES);
const ACTION_KIND_SET: ReadonlySet<string> = new Set(ADMIN_ACTION_KINDS);
const LGPD_BASIS_SET: ReadonlySet<string> = new Set(LGPD_LEGAL_BASIS);

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && ADMIN_ROLE_SET.has(value);
}

export function assertAdminRole(value: unknown): AdminRole {
  if (!isAdminRole(value)) {
    throw new CockpitInvariantError(
      `Invalid AdminRole: ${String(value)} (expected one of ${ADMIN_ROLE_VALUES.join(", ")})`
    );
  }
  return value;
}

export function isSection(value: unknown): value is AdminCockpitSection {
  return typeof value === "string" && SECTION_SET.has(value);
}

export function assertSection(value: unknown): AdminCockpitSection {
  if (!isSection(value)) {
    throw new CockpitInvariantError(
      `Invalid AdminCockpitSection: ${String(value)} (expected one of ${ADMIN_COCKPIT_SECTIONS.join(", ")})`
    );
  }
  return value;
}

export function isSensitivity(value: unknown): value is SensitivityLevel {
  return typeof value === "string" && SENSITIVITY_SET.has(value);
}

export function isPushState(value: unknown): value is PushScheduleState {
  return typeof value === "string" && PUSH_STATE_SET.has(value);
}

export function isExperimentState(value: unknown): value is ExperimentState {
  return typeof value === "string" && EXPERIMENT_STATE_SET.has(value);
}

export function isTradition(value: unknown): value is Tradition {
  return typeof value === "string" && TRADITION_SET.has(value);
}

export function isVoiceMood(value: unknown): value is VoiceMoodLabel {
  return typeof value === "string" && VOICE_MOOD_SET.has(value);
}

export function isRecapState(value: unknown): value is RecapReceiptState {
  return typeof value === "string" && RECAP_STATE_SET.has(value);
}

export function isModerationStatus(value: unknown): value is ModerationQueueStatus {
  return typeof value === "string" && MODERATION_STATUS_SET.has(value);
}

export function isActionKind(value: unknown): value is AdminActionKind {
  return typeof value === "string" && ACTION_KIND_SET.has(value);
}

export function isLgpdBasis(value: unknown): value is LgpdLegalBasis {
  return typeof value === "string" && LGPD_BASIS_SET.has(value);
}

// ----------------------------------------------------------------------------
// SECTION 8 — Errors
// ----------------------------------------------------------------------------

export class CockpitInvariantError extends Error {
  readonly code = "COCKPIT_INVARIANT" as const;
  constructor(message: string) {
    super(message);
    this.name = "CockpitInvariantError";
  }
}

export class CockpitPermissionError extends Error {
  readonly code = "COCKPIT_PERMISSION" as const;
  constructor(
    message: string,
    readonly actorId: string,
    readonly required: ReadonlyArray<AdminRole>
  ) {
    super(message);
    this.name = "CockpitPermissionError";
  }
}

export class CockpitValidationError extends Error {
  readonly code = "COCKPIT_VALIDATION" as const;
  constructor(
    message: string,
    readonly field: string
  ) {
    super(message);
    this.name = "CockpitValidationError";
  }
}

// ----------------------------------------------------------------------------
// SECTION 9 — RBAC
// ----------------------------------------------------------------------------

export function requireAdminRole(actor: AdminActor, required: AdminRole): void {
  if (!hasRole(actor.role, required)) {
    throw new CockpitPermissionError(
      `actor ${actor.id} (${actor.role}) lacks required role ${required}`,
      actor.id,
      [required]
    );
  }
}

export function hasRole(actual: AdminRole, required: AdminRole): boolean {
  return ADMIN_ROLE_HIERARCHY[actual] >= ADMIN_ROLE_HIERARCHY[required];
}

export function getEffectivePermissions(
  actor: AdminActor,
  section: AdminCockpitSection
): ReadonlyArray<AdminRole> {
  const allowed = COCKPIT_PERMISSION_MATRIX[section];
  return allowed.filter((role) => hasRole(actor.role, role));
}

export function canViewSection(actor: AdminActor, section: AdminCockpitSection): boolean {
  const allowed = COCKPIT_PERMISSION_MATRIX[section];
  return allowed.some((role) => hasRole(actor.role, role));
}

// ----------------------------------------------------------------------------
// SECTION 10 — Hashing & utilities (FNV-1a 32-bit, deterministic)
// ----------------------------------------------------------------------------

export function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function safeNow(): number {
  // Edge runtime (workerd/V8 isolates) expõe Date.now estável.
  return Date.now();
}

export function isoNow(): IsoTimestamp {
  return asIsoTimestamp(new Date(safeNow()).toISOString());
}

export function clamp0to1(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function safePct(num: number, denom: number): number {
  if (denom <= 0) return 0;
  return clamp0to1(num / denom);
}

export function safeRatio(num: number, denom: number): number {
  if (denom <= 0) return 0;
  return num / denom;
}

export function daysAgoMs(now: number, days: number): number {
  return now - days * 86_400_000;
}

export function hoursAgoMs(now: number, hours: number): number {
  return now - hours * 3_600_000;
}

// ----------------------------------------------------------------------------
// SECTION 11 — Widget builders
// ----------------------------------------------------------------------------

function makeWidgetEnvelope<T extends WidgetData>(
  section: AdminCockpitSection,
  data: T,
  nowMs: number
): Pick<
  CockpitWidget<T>,
  "id" | "section" | "dataShape" | "refreshIntervalSec" | "permissions" | "ttl" |
  "fetchedAt" | "expiresAt" | "nextRefreshAt" | "stale" | "staleReason" |
  "lgpdBasis" | "correlationId"
> {
  const meta = COCKPIT_SECTION_REGISTRY[section];
  const id = asWidgetId(fnv1a32(`cockpit/${section}/${nowMs}`));
  const correlationId = asCorrelationId(fnv1a32(`corr/${section}/${nowMs}`));
  const ttl = meta.defaultTtlSec;
  const refreshIntervalSec = meta.defaultRefreshSec;
  return {
    id,
    section,
    dataShape: meta.dataShape,
    permissions: COCKPIT_PERMISSION_MATRIX[section],
    refreshIntervalSec,
    ttl,
    fetchedAt: nowMs,
    expiresAt: nowMs + ttl * 1000,
    nextRefreshAt: nowMs + refreshIntervalSec * 1000,
    stale: false,
    staleReason: null,
    lgpdBasis: meta.lgpdArticle === "Art.18" ? "exercicio_regular_direitos" : "interesse_legitimo",
    correlationId,
  };
}

function widgetTitleFor(section: AdminCockpitSection): string {
  return `cockpit.${section.replace(/_/g, ".")}.title`;
}

function widgetDescriptionFor(section: AdminCockpitSection): string {
  return `cockpit.${section.replace(/_/g, ".")}.description`;
}

function emptyRecord<K extends string>(keys: readonly K[]): Readonly<Record<K, number>> {
  const out: Record<string, number> = {};
  for (const k of keys) out[k] = 0;
  return out as Readonly<Record<K, number>>;
}

export function buildSacredSymbolsWidget(
  symbols: ReadonlyArray<SacredSymbolRecord>,
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<SacredSymbolsWidgetData> {
  const bySensitivity = emptyRecord(SENSITIVITY_VALUES) as Record<SensitivityLevel, number>;
  const byTradition = emptyRecord(TRADITION_VALUES) as Record<Tradition, number>;
  let lastAttributionUpdateMs = 0;
  let attributedThisWeek = 0;
  let pendingReview = 0;
  const oneWeekMs = 7 * 86_400_000;

  for (const sym of symbols) {
    bySensitivity[sym.sensitivity] += 1;
    if (isTradition(sym.tradition)) byTradition[sym.tradition] += 1;
    if (sym.attributedAt > lastAttributionUpdateMs) lastAttributionUpdateMs = sym.attributedAt;
    if (nowMs - sym.attributedAt <= oneWeekMs) attributedThisWeek += 1;
    if (sym.sensitivity === "restricted" || sym.sensitivity === "initiate") pendingReview += 1;
  }

  const data: SacredSymbolsWidgetData = {
    totalSymbols: symbols.length,
    bySensitivity,
    byTradition,
    lastAttributionUpdateMs,
    attributedThisWeek,
    pendingReview,
    locale,
  };

  const env = makeWidgetEnvelope("sacred_symbols", data, nowMs);
  return {
    ...env,
    title: widgetTitleFor("sacred_symbols"),
    description: widgetDescriptionFor("sacred_symbols"),
    data,
  };
}

export function buildPushSchedulesWidget(
  schedules: ReadonlyArray<PushScheduleRecord>,
  deliveries: ReadonlyArray<PushDeliveryRecord>,
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<PushSchedulesWidgetData> {
  const byState = emptyRecord(PUSH_STATE_VALUES) as Record<PushScheduleState, number>;
  const byTimezone: Record<string, number> = {};
  const byChannel: Record<"web_push" | "email" | "in_app", number> = {
    web_push: 0,
    email: 0,
    in_app: 0,
  };
  for (const s of schedules) {
    byState[s.state] += 1;
    byTimezone[s.timezone] = (byTimezone[s.timezone] ?? 0) + 1;
  }
  const last24hCutoff = hoursAgoMs(nowMs, 24);
  let delivered = 0;
  let opened = 0;
  let total24h = 0;
  for (const d of deliveries) {
    byChannel[d.channel] += 1;
    if (d.deliveredAt >= last24hCutoff) {
      total24h += 1;
      delivered += 1;
      if (d.opened) opened += 1;
    }
  }
  const data: PushSchedulesWidgetData = {
    totalSchedules: schedules.length,
    byState,
    deliverySuccessRate: safePct(delivered, total24h),
    openRate: safePct(opened, delivered),
    totalDeliveries24h: total24h,
    byTimezone,
    byChannel,
    locale,
  };

  const env = makeWidgetEnvelope("push_schedules", data, nowMs);
  return {
    ...env,
    title: widgetTitleFor("push_schedules"),
    description: widgetDescriptionFor("push_schedules"),
    data,
  };
}

export function buildABExperimentsWidget(
  experiments: ReadonlyArray<ABExperimentRecord>,
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<ABExperimentsWidgetData> {
  const byState = emptyRecord(EXPERIMENT_STATE_VALUES) as Record<ExperimentState, number>;
  let runningCount = 0;
  let totalExposures = 0;
  let significantCount = 0;
  let decidedThisWeek = 0;
  const oneWeekMs = 7 * 86_400_000;
  let topWinner: ABExperimentsWidgetData["topWinner"] = null;

  for (const exp of experiments) {
    byState[exp.state] += 1;
    if (exp.state === "running") runningCount += 1;
    if (exp.state === "decided" && exp.endedAt !== null && nowMs - exp.endedAt <= oneWeekMs) {
      decidedThisWeek += 1;
    }
    let bestVariant: ABVariantRecord | null = null;
    let bestConversion = 0;
    let baselineRate = 0;
    let bestRate = 0;
    for (let i = 0; i < exp.variants.length; i += 1) {
      const v = exp.variants[i];
      totalExposures += v.exposures;
      const rate = safeRatio(v.conversions, v.exposures);
      if (i === 0) baselineRate = rate;
      if (rate > bestRate) {
        bestRate = rate;
        bestVariant = v;
        bestConversion = v.conversions;
      }
    }
    if (bestVariant !== null && bestVariant.exposures >= 100) {
      const uplift = safePct(bestConversion, bestVariant.exposures) - baselineRate;
      if (uplift >= 0.02 && baselineRate > 0) {
        significantCount += 1;
        if (topWinner === null || uplift > topWinner.upliftPct) {
          topWinner = {
            experimentId: exp.id,
            variantId: bestVariant.id,
            upliftPct: clamp0to1(uplift),
            exposures: bestVariant.exposures,
          };
        }
      }
    }
  }

  const data: ABExperimentsWidgetData = {
    runningCount,
    decidedThisWeek,
    totalExposures,
    significantCount,
    byState,
    topWinner,
    locale,
  };

  const env = makeWidgetEnvelope("ab_experiments", data, nowMs);
  return {
    ...env,
    title: widgetTitleFor("ab_experiments"),
    description: widgetDescriptionFor("ab_experiments"),
    data,
  };
}

export function buildVoiceMoodWidget(
  predictions: ReadonlyArray<VoiceMoodPrediction>,
  windowMs: number,
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<VoiceMoodWidgetData> {
  const byMood = emptyRecord(VOICE_MOOD_VALUES) as Record<VoiceMoodLabel, number>;
  const sessions = new Set<string>();
  let totalConfidence = 0;
  let count = 0;
  const cutoff = nowMs - Math.max(0, windowMs);
  for (const p of predictions) {
    if (p.predictedAt < cutoff) continue;
    byMood[p.mood] += 1;
    sessions.add(p.sessionId);
    totalConfidence += p.confidence;
    count += 1;
  }
  const data: VoiceMoodWidgetData = {
    windowMs,
    totalPredictions: count,
    byMood,
    meanConfidence: safeRatio(totalConfidence, count),
    distinctSessions: sessions.size,
    locale,
  };
  const env = makeWidgetEnvelope("voice_mood_distribution", data, nowMs);
  return {
    ...env,
    title: widgetTitleFor("voice_mood_distribution"),
    description: widgetDescriptionFor("voice_mood_distribution"),
    data,
  };
}

export function buildPrayerCorpusWidget(
  corpus: ReadonlyArray<PrayerCorpusEntry>,
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<PrayerCorpusWidgetData> {
  let totalEntries = 0;
  let approvedEntries = 0;
  let pendingEntries = 0;
  let reservedSlotsPending = 0;
  const byTradition = emptyRecord(TRADITION_VALUES) as Record<Tradition, number>;
  const byCategory: Record<string, number> = {};
  const byLocale: Record<string, number> = {};
  for (const e of corpus) {
    totalEntries += 1;
    if (e.approvedAt !== null) approvedEntries += 1;
    else pendingEntries += 1;
    if (e.reserved && e.approvedAt === null) reservedSlotsPending += 1;
    if (isTradition(e.tradition)) byTradition[e.tradition] += 1;
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
    byLocale[e.locale] = (byLocale[e.locale] ?? 0) + 1;
  }
  const data: PrayerCorpusWidgetData = {
    totalEntries,
    approvedEntries,
    pendingEntries,
    reservedSlotsPending,
    byTradition,
    byCategory,
    byLocale,
    locale,
  };
  const env = makeWidgetEnvelope("prayer_corpus_coverage", data, nowMs);
  return {
    ...env,
    title: widgetTitleFor("prayer_corpus_coverage"),
    description: widgetDescriptionFor("prayer_corpus_coverage"),
    data,
  };
}

export function buildRecapReceiptsWidget(
  receipts: ReadonlyArray<RecapReceiptRecord>,
  nowMs: number = safeNow()
): CockpitWidget<RecapReceiptsWidgetData> {
  const byState = emptyRecord(RECAP_STATE_VALUES) as Record<RecapReceiptState, number>;
  const declineMap: Record<string, number> = {};
  let sent = 0;
  let delivered = 0;
  let viewed = 0;
  let acknowledged = 0;
  let last24h = 0;
  const cutoff24h = hoursAgoMs(nowMs, 24);
  for (const r of receipts) {
    byState[r.state] += 1;
    if (r.state === "sent" || r.state === "delivered" || r.state === "viewed" || r.state === "acknowledged") sent += 1;
    if (r.state === "delivered" || r.state === "viewed" || r.state === "acknowledged") delivered += 1;
    if (r.state === "viewed" || r.state === "acknowledged") viewed += 1;
    if (r.state === "acknowledged") acknowledged += 1;
    if (r.state === "declined" && r.declineReason !== null) {
      declineMap[r.declineReason] = (declineMap[r.declineReason] ?? 0) + 1;
    }
    if (r.createdAt >= cutoff24h) last24h += 1;
  }
  const declineReasons: Array<{ reason: string; count: number }> = [];
  for (const reason of Object.keys(declineMap)) {
    declineReasons.push({ reason, count: declineMap[reason] ?? 0 });
  }
  declineReasons.sort((a, b) => b.count - a.count);

  const data: RecapReceiptsWidgetData = {
    total: receipts.length,
    byState,
    funnelRates: {
      sentToDelivered: safePct(delivered, sent),
      deliveredToViewed: safePct(viewed, delivered),
      viewedToAcknowledged: safePct(acknowledged, viewed),
    },
    declineReasons,
    last24h,
  };
  const env = makeWidgetEnvelope("recap_receipts", data, nowMs);
  return {
    ...env,
    title: widgetTitleFor("recap_receipts"),
    description: widgetDescriptionFor("recap_receipts"),
    data,
  };
}

export function buildModerationQueueWidget(
  queue: ReadonlyArray<ModerationQueueEntry>,
  nowMs: number = safeNow()
): CockpitWidget<ModerationQueueWidgetData> {
  const byStatus = emptyRecord(MODERATION_STATUS_VALUES) as Record<ModerationQueueStatus, number>;
  let openCount = 0;
  let slaBreached = 0;
  let appealsPending = 0;
  let oldestOpenMs = 0;
  let resolutionTotalMs = 0;
  let resolutionCount = 0;
  for (const entry of queue) {
    byStatus[entry.status] += 1;
    if (entry.status === "open" || entry.status === "in_review") {
      openCount += 1;
      const ageMs = nowMs - entry.createdAt;
      if (ageMs > oldestOpenMs) oldestOpenMs = ageMs;
      if (nowMs > entry.slaDueAt) slaBreached += 1;
    }
    if (entry.status === "appealed") appealsPending += 1;
    if (entry.status === "resolved") {
      const ageMs = entry.slaDueAt > entry.createdAt ? entry.slaDueAt - entry.createdAt : 0;
      resolutionTotalMs += ageMs;
      resolutionCount += 1;
    }
  }
  const data: ModerationQueueWidgetData = {
    openCount,
    slaBreached,
    appealsPending,
    byStatus,
    oldestOpenMs,
    avgResolutionMs: safeRatio(resolutionTotalMs, resolutionCount),
  };
  const env = makeWidgetEnvelope("moderation_queue", data, nowMs);
  return {
    ...env,
    title: widgetTitleFor("moderation_queue"),
    description: widgetDescriptionFor("moderation_queue"),
    data,
  };
}

export function buildAuditLogWidget(
  entries: ReadonlyArray<AuditLogEntry>,
  roleFilter: AdminRole | "all",
  nowMs: number = safeNow()
): CockpitWidget<AuditLogWidgetData> {
  const windowMs = 86_400_000;
  const cutoff = nowMs - windowMs;
  const filtered = roleFilter === "all"
    ? entries.filter((e) => e.occurredAt >= cutoff)
    : entries.filter((e) => e.occurredAt >= cutoff && e.actorRole === roleFilter);

  const byActionKind = emptyRecord(ADMIN_ACTION_KINDS) as Record<AdminActionKind, number>;
  const byRole = emptyRecord(ADMIN_ROLE_VALUES) as Record<AdminRole, number>;
  const actorSet = new Set<string>();
  const windowed: AuditLogEntry[] = [];
  for (const e of filtered) {
    byActionKind[e.action] += 1;
    byRole[e.actorRole] += 1;
    actorSet.add(e.actorId);
    windowed.push(e);
  }
  windowed.sort((a, b) => b.occurredAt - a.occurredAt);

  const data: AuditLogWidgetData = {
    windowMs,
    totalActions: filtered.length,
    byActionKind,
    byRole,
    uniqueActors: actorSet.size,
    entries: windowed,
    roleFilter,
  };
  const env = makeWidgetEnvelope("audit_log", data, nowMs);
  return {
    ...env,
    title: widgetTitleFor("audit_log"),
    description: widgetDescriptionFor("audit_log"),
    data,
  };
}

// ----------------------------------------------------------------------------
// SECTION 12 — Composition & filtering
// ----------------------------------------------------------------------------

export interface AssembleCockpitInput {
  readonly actor: AdminActor;
  readonly nowMs: number;
  readonly locale: string;
  readonly correlationId: CorrelationId;
  readonly sacredSymbols: ReadonlyArray<SacredSymbolRecord>;
  readonly pushSchedules: ReadonlyArray<PushScheduleRecord>;
  readonly pushDeliveries: ReadonlyArray<PushDeliveryRecord>;
  readonly experiments: ReadonlyArray<ABExperimentRecord>;
  readonly voiceMoods: ReadonlyArray<VoiceMoodPrediction>;
  readonly prayerCorpus: ReadonlyArray<PrayerCorpusEntry>;
  readonly receipts: ReadonlyArray<RecapReceiptRecord>;
  readonly moderationQueue: ReadonlyArray<ModerationQueueEntry>;
  readonly auditLog: ReadonlyArray<AuditLogEntry>;
  readonly auditRoleFilter: AdminRole | "all";
  readonly voiceMoodWindowMs: number;
}

export function assembleCockpit(input: AssembleCockpitInput): ReadonlyArray<CockpitWidget> {
  const allWidgets: CockpitWidget[] = [
    buildSacredSymbolsWidget(input.sacredSymbols, input.locale, input.nowMs),
    buildPushSchedulesWidget(input.pushSchedules, input.pushDeliveries, input.locale, input.nowMs),
    buildABExperimentsWidget(input.experiments, input.locale, input.nowMs),
    buildVoiceMoodWidget(input.voiceMoods, input.voiceMoodWindowMs, input.locale, input.nowMs),
    buildPrayerCorpusWidget(input.prayerCorpus, input.locale, input.nowMs),
    buildRecapReceiptsWidget(input.receipts, input.nowMs),
    buildModerationQueueWidget(input.moderationQueue, input.nowMs),
    buildAuditLogWidget(input.auditLog, input.auditRoleFilter, input.nowMs),
  ];
  const ctx: CockpitContext = {
    actor: input.actor,
    nowMs: input.nowMs,
    locale: input.locale,
    correlationId: input.correlationId,
    lgpdBasis: "interesse_legitimo",
  };
  void ctx;
  return filterWidgetsByRole(allWidgets, input.actor.role);
}

export function filterWidgetsByRole(
  widgets: ReadonlyArray<CockpitWidget>,
  role: AdminRole
): ReadonlyArray<CockpitWidget> {
  return widgets.filter((w) => w.permissions.some((allowed) => hasRole(role, allowed)));
}

// ----------------------------------------------------------------------------
// SECTION 13 — Cache & refresh
// ----------------------------------------------------------------------------

export function cacheKeyForWidget(widget: CockpitWidget): CacheKey {
  const inputs = [
    widget.section,
    widget.dataShape,
    widget.refreshIntervalSec,
    widget.ttl,
  ].join("|");
  return asCacheKey(fnv1a32(inputs));
}

export function shouldRefreshWidget(widget: CockpitWidget, nowMs: number): boolean {
  if (widget.stale) return true;
  if (nowMs >= widget.expiresAt) return true;
  return nowMs >= widget.nextRefreshAt;
}

export function markWidgetStale(widget: CockpitWidget, reason: string): CockpitWidget {
  return { ...widget, stale: true, staleReason: reason };
}

export function markSectionStale(
  widgets: ReadonlyArray<CockpitWidget>,
  section: AdminCockpitSection,
  reason: string
): ReadonlyArray<CockpitWidget> {
  return widgets.map((w) => (w.section === section ? markWidgetStale(w, reason) : w));
}

// ----------------------------------------------------------------------------
// SECTION 14 — Merge & diff
// ----------------------------------------------------------------------------

export function mergeCockpitContext(
  existing: ReadonlyArray<CockpitWidget>,
  fresh: ReadonlyArray<CockpitWidget>
): ReadonlyArray<CockpitWidget> {
  const freshBySection = new Map<AdminCockpitSection, CockpitWidget>();
  for (const w of fresh) freshBySection.set(w.section, w);
  const result: CockpitWidget[] = [];
  for (const w of existing) {
    const replacement = freshBySection.get(w.section);
    if (replacement !== undefined) {
      result.push(replacement);
      freshBySection.delete(w.section);
    } else {
      result.push(w);
    }
  }
  for (const remaining of freshBySection.values()) {
    result.push(remaining);
  }
  return result;
}

export type MergeMode = "replace" | "preserveStale" | "deepMerge";

export function mergeWidgetData<T extends WidgetData>(
  existing: CockpitWidget<T>,
  fresh: CockpitWidget<T>,
  mode: MergeMode
): CockpitWidget<T> {
  if (existing.section !== fresh.section) {
    throw new CockpitInvariantError(
      `mergeWidgetData: section mismatch (${existing.section} vs ${fresh.section})`
    );
  }
  if (mode === "replace") return fresh;
  if (mode === "preserveStale") return existing.stale ? existing : fresh;
  // deepMerge: shallow object-level merge com freshness-by-fetchedAt
  return existing.fetchedAt >= fresh.fetchedAt ? existing : fresh;
}

export interface CockpitDiffEntry {
  readonly section: AdminCockpitSection;
  readonly changedAt: number;
  readonly beforeHash: string;
  readonly afterHash: string;
  readonly changeKind: "added" | "removed" | "modified" | "unchanged";
}

export function diffCockpitSnapshots(
  before: ReadonlyArray<CockpitWidget>,
  after: ReadonlyArray<CockpitWidget>,
  nowMs: number = safeNow()
): ReadonlyArray<CockpitDiffEntry> {
  const beforeMap = new Map<AdminCockpitSection, CockpitWidget>();
  for (const w of before) beforeMap.set(w.section, w);
  const afterMap = new Map<AdminCockpitSection, CockpitWidget>();
  for (const w of after) afterMap.set(w.section, w);

  const diffs: CockpitDiffEntry[] = [];
  const allSections = new Set<AdminCockpitSection>([
    ...beforeMap.keys(),
    ...afterMap.keys(),
  ]);

  for (const section of allSections) {
    const b = beforeMap.get(section);
    const a = afterMap.get(section);
    if (b === undefined && a !== undefined) {
      diffs.push({
        section,
        changedAt: nowMs,
        beforeHash: "0".repeat(8),
        afterHash: a.id,
        changeKind: "added",
      });
      continue;
    }
    if (b !== undefined && a === undefined) {
      diffs.push({
        section,
        changedAt: nowMs,
        beforeHash: b.id,
        afterHash: "0".repeat(8),
        changeKind: "removed",
      });
      continue;
    }
    if (b !== undefined && a !== undefined) {
      const changed = b.fetchedAt !== a.fetchedAt || b.stale !== a.stale;
      diffs.push({
        section,
        changedAt: nowMs,
        beforeHash: b.id,
        afterHash: a.id,
        changeKind: changed ? "modified" : "unchanged",
      });
    }
  }
  return diffs;
}

// ----------------------------------------------------------------------------
// SECTION 15 — Summary
// ----------------------------------------------------------------------------

export function summarizeCockpit(widgets: ReadonlyArray<CockpitWidget>): CockpitSummary {
  let healthy = 0;
  let stale = 0;
  let expiringSoon = 0;
  let totalRefreshLoad = 0;
  const sections = new Set<AdminCockpitSection>();
  let worstSection: AdminCockpitSection | null = null;
  let worstAge = -1;
  for (const w of widgets) {
    sections.add(w.section);
    totalRefreshLoad += w.refreshIntervalSec;
    if (w.stale) stale += 1;
    else healthy += 1;
    const ageMs = w.fetchedAt;
    if (ageMs > worstAge) {
      worstAge = ageMs;
      worstSection = w.section;
    }
    if (w.expiresAt - w.fetchedAt < 60_000) expiringSoon += 1;
  }
  return {
    healthy,
    stale,
    expiringSoon,
    sectionsCovered: sections.size,
    worstSection,
    totalRefreshLoad,
  };
}

// ----------------------------------------------------------------------------
// SECTION 16 — Validation & serialization
// ----------------------------------------------------------------------------

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly widgetId: WidgetId;
}

export function validateWidget(widget: CockpitWidget): ValidationResult {
  const errors: string[] = [];
  if (widget.id.length === 0) errors.push("id must be non-empty");
  if (!isSection(widget.section)) errors.push(`invalid section: ${widget.section}`);
  if (widget.refreshIntervalSec <= 0) errors.push("refreshIntervalSec must be positive");
  if (widget.ttl <= 0) errors.push("ttl must be positive");
  if (widget.expiresAt <= widget.fetchedAt) errors.push("expiresAt must be after fetchedAt");
  if (widget.nextRefreshAt < widget.fetchedAt) errors.push("nextRefreshAt must be >= fetchedAt");
  if (widget.permissions.length === 0) errors.push("permissions must not be empty");
  if (!isLgpdBasis(widget.lgpdBasis)) errors.push(`invalid lgpdBasis: ${widget.lgpdBasis}`);
  return { ok: errors.length === 0, errors, widgetId: widget.id };
}

export interface SerializedCockpit {
  readonly version: "1.0.0";
  readonly exportedAt: IsoTimestamp;
  readonly widgetCount: number;
  readonly widgets: ReadonlyArray<Record<string, unknown>>;
}

export function serializeCockpit(widgets: ReadonlyArray<CockpitWidget>): SerializedCockpit {
  const exported: Record<string, unknown>[] = [];
  for (const w of widgets) {
    exported.push(JSON.parse(JSON.stringify(w)) as Record<string, unknown>);
  }
  return {
    version: "1.0.0",
    exportedAt: isoNow(),
    widgetCount: widgets.length,
    widgets: exported,
  };
}

export interface ParsedWidgetSnapshot {
  readonly ok: boolean;
  readonly widget: CockpitWidget | null;
  readonly errors: ReadonlyArray<string>;
}

export function parseWidgetSnapshot(json: unknown): ParsedWidgetSnapshot {
  if (typeof json !== "object" || json === null) {
    return { ok: false, widget: null, errors: ["snapshot is not an object"] };
  }
  const obj = json as Record<string, unknown>;
  const id = obj["id"];
  const section = obj["section"];
  if (typeof id !== "string" || id.length === 0) {
    return { ok: false, widget: null, errors: ["id missing or invalid"] };
  }
  if (!isSection(section)) {
    return { ok: false, widget: null, errors: ["section missing or invalid"] };
  }
  return {
    ok: true,
    widget: {
      id: asWidgetId(id),
      section,
      title: typeof obj["title"] === "string" ? obj["title"] : "",
      description: typeof obj["description"] === "string" ? obj["description"] : "",
      dataShape: (typeof obj["dataShape"] === "string" ? obj["dataShape"] : "scalar") as DataShape,
      refreshIntervalSec: typeof obj["refreshIntervalSec"] === "number" ? obj["refreshIntervalSec"] : 60,
      permissions: Array.isArray(obj["permissions"])
        ? (obj["permissions"] as ReadonlyArray<unknown>).filter(isAdminRole)
        : [],
      ttl: typeof obj["ttl"] === "number" ? obj["ttl"] : 60,
      data: (obj["data"] ?? {}) as WidgetData,
      fetchedAt: typeof obj["fetchedAt"] === "number" ? obj["fetchedAt"] : 0,
      expiresAt: typeof obj["expiresAt"] === "number" ? obj["expiresAt"] : 0,
      nextRefreshAt: typeof obj["nextRefreshAt"] === "number" ? obj["nextRefreshAt"] : 0,
      stale: obj["stale"] === true,
      staleReason: typeof obj["staleReason"] === "string" ? obj["staleReason"] : null,
      lgpdBasis: isLgpdBasis(obj["lgpdBasis"]) ? obj["lgpdBasis"] : "interesse_legitimo",
      correlationId: asCorrelationId(
        typeof obj["correlationId"] === "string" ? obj["correlationId"] : fnv1a32(`corr/${section}/${id}`)
      ),
    },
    errors: [],
  };
}

export function deserializeCockpit(json: unknown): ReadonlyArray<CockpitWidget> {
  if (typeof json !== "object" || json === null) return [];
  const obj = json as Record<string, unknown>;
  const widgetsRaw = obj["widgets"];
  if (!Array.isArray(widgetsRaw)) return [];
  const out: CockpitWidget[] = [];
  for (const raw of widgetsRaw) {
    const parsed = parseWidgetSnapshot(raw);
    if (parsed.ok && parsed.widget !== null) {
      out.push(parsed.widget);
    }
  }
  return out;
}

// ----------------------------------------------------------------------------
// SECTION 17 — LGPD audit
// ----------------------------------------------------------------------------

export interface AuditEntry {
  readonly id: AuditLogId;
  readonly actorId: AdminActorId;
  readonly actorRole: AdminRole;
  readonly action: AdminActionKind;
  readonly targetType: string;
  readonly targetId: TargetId;
  readonly section: AdminCockpitSection;
  readonly lgpdBasis: LgpdLegalBasis;
  readonly reason: string;
  readonly occurredAt: number;
  readonly correlationId: CorrelationId;
  readonly metadata: Readonly<Record<string, string | number | boolean>>;
}

export interface AuditActionInput {
  readonly actor: AdminActor;
  readonly action: AdminActionKind;
  readonly targetType: string;
  readonly targetId: string;
  readonly section: AdminCockpitSection;
  readonly reason: string;
  readonly nowMs?: number;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
  readonly lgpdBasis?: LgpdLegalBasis;
}

export function auditAdminAction(input: AuditActionInput): AuditEntry {
  requireAdminRole(input.actor, "admin");
  const nowMs = input.nowMs ?? safeNow();
  const id = asAuditLogId(fnv1a32(`audit/${input.action}/${input.actor.id}/${nowMs}`));
  const correlationId = asCorrelationId(fnv1a32(`corr/audit/${input.actor.id}/${nowMs}`));
  const lgpdBasis = input.lgpdBasis ?? defaultLgpdBasisForAction(input.action);
  const entry: AuditEntry = {
    id,
    actorId: input.actor.id,
    actorRole: input.actor.role,
    action: input.action,
    targetType: input.targetType,
    targetId: asTargetId(input.targetId),
    section: input.section,
    lgpdBasis,
    reason: input.reason,
    occurredAt: nowMs,
    correlationId,
    metadata: input.metadata ?? {},
  };
  return entry;
}

export function defaultLgpdBasisForAction(action: AdminActionKind): LgpdLegalBasis {
  switch (action) {
    case "view_widget":
    case "export_snapshot":
    case "merge_context":
    case "force_refresh":
    case "mark_stale":
    case "audit_export":
      return "interesse_legitimo";
    case "permission_grant":
    case "permission_revoke":
    case "moderation_resolve":
    case "moderation_escalate":
      return "cumprimento_obrigacao_legal";
    case "schedule_pause":
    case "schedule_resume":
    case "experiment_abandon":
    case "experiment_promote":
    case "receipt_resend":
      return "execucao_contrato";
    case "consent_revoke":
      return "exercicio_regular_direitos";
    default:
      return "interesse_legitimo";
  }
}

// ----------------------------------------------------------------------------
// SECTION 18 — Helpers adicionais (operational exports)
// ----------------------------------------------------------------------------

export function widgetForSection<T extends WidgetData>(
  widgets: ReadonlyArray<CockpitWidget>,
  section: AdminCockpitSection
): CockpitWidget<T> | null {
  for (const w of widgets) {
    if (w.section === section) return w as CockpitWidget<T>;
  }
  return null;
}

export function widgetsBySection(
  widgets: ReadonlyArray<CockpitWidget>
): ReadonlyMap<AdminCockpitSection, ReadonlyArray<CockpitWidget>> {
  const out = new Map<AdminCockpitSection, CockpitWidget[]>();
  for (const w of widgets) {
    const list = out.get(w.section);
    if (list === undefined) {
      out.set(w.section, [w]);
    } else {
      list.push(w);
    }
  }
  return out;
}

export function totalWidgetCount(widgets: ReadonlyArray<CockpitWidget>): number {
  return widgets.length;
}

export function staleWidgetCount(widgets: ReadonlyArray<CockpitWidget>): number {
  let count = 0;
  for (const w of widgets) if (w.stale) count += 1;
  return count;
}

export function expiredWidgetCount(
  widgets: ReadonlyArray<CockpitWidget>,
  nowMs: number = safeNow()
): number {
  let count = 0;
  for (const w of widgets) if (nowMs >= w.expiresAt) count += 1;
  return count;
}

export function sectionCoverage(widgets: ReadonlyArray<CockpitWidget>): ReadonlyArray<AdminCockpitSection> {
  const seen = new Set<AdminCockpitSection>();
  const out: AdminCockpitSection[] = [];
  for (const w of widgets) {
    if (!seen.has(w.section)) {
      seen.add(w.section);
      out.push(w.section);
    }
  }
  return out;
}

export function missingSections(
  widgets: ReadonlyArray<CockpitWidget>
): ReadonlyArray<AdminCockpitSection> {
  const present = new Set<AdminCockpitSection>();
  for (const w of widgets) present.add(w.section);
  return ADMIN_COCKPIT_SECTIONS.filter((s) => !present.has(s));
}

// ----------------------------------------------------------------------------
// SECTION 19 — Advanced: time-bucketed series (extra para analyses)
// ----------------------------------------------------------------------------

export interface TimeBucket {
  readonly bucketStartMs: number;
  readonly bucketEndMs: number;
  readonly count: number;
}

export function bucketPredictionsByHour(
  predictions: ReadonlyArray<VoiceMoodPrediction>,
  nowMs: number = safeNow()
): ReadonlyArray<TimeBucket> {
  const buckets: TimeBucket[] = [];
  const hourMs = 3_600_000;
  const last24hStart = nowMs - 24 * hourMs;
  const counts: number[] = new Array<number>(24).fill(0);
  for (const p of predictions) {
    if (p.predictedAt < last24hStart) continue;
    const idx = Math.floor((p.predictedAt - last24hStart) / hourMs);
    if (idx < 0 || idx >= 24) continue;
    counts[idx] = (counts[idx] ?? 0) + 1;
  }
  for (let i = 0; i < 24; i += 1) {
    buckets.push({
      bucketStartMs: last24hStart + i * hourMs,
      bucketEndMs: last24hStart + (i + 1) * hourMs,
      count: counts[i] ?? 0,
    });
  }
  return buckets;
}

export function topSymbolsByAttribution(
  symbols: ReadonlyArray<SacredSymbolRecord>,
  limit: number = 10
): ReadonlyArray<SacredSymbolRecord> {
  const sorted = [...symbols].sort((a, b) => b.attributedAt - a.attributedAt);
  return sorted.slice(0, Math.max(0, limit));
}

export function countBy<K extends string>(
  items: ReadonlyArray<{ readonly [P in K]: string }>,
  key: K
): Readonly<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const v = item[key];
    out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}

export function distinctBy<K extends string, T>(
  items: ReadonlyArray<T>,
  selector: (item: T) => K
): ReadonlyArray<T> {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const item of items) {
    const k = selector(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

// ----------------------------------------------------------------------------
// SECTION 20 — Operational snapshots
// ----------------------------------------------------------------------------

export function captureCockpitSnapshot(
  widgets: ReadonlyArray<CockpitWidget>,
  actor: AdminActor,
  nowMs: number = safeNow()
): CockpitSnapshot {
  return {
    widgetCount: widgets.length,
    widgets,
    summary: summarizeCockpit(widgets),
    capturedAt: nowMs,
    capturedBy: actor.id,
    correlationId: asCorrelationId(fnv1a32(`snapshot/${actor.id}/${nowMs}`)),
  };
}

export function applySnapshot(
  snapshot: CockpitSnapshot,
  nowMs: number = safeNow()
): ReadonlyArray<CockpitWidget> {
  return snapshot.widgets.map((w) => {
    if (nowMs >= w.expiresAt) return markWidgetStale(w, "snapshot expired");
    return w;
  });
}

// ----------------------------------------------------------------------------
// SECTION 21 — Cron / scheduling helper
// ----------------------------------------------------------------------------

export interface RefreshSchedule {
  readonly nextRunMs: number;
  readonly intervalSec: number;
  readonly widgetId: WidgetId;
}

export function nextRefreshSchedule(
  widget: CockpitWidget,
  nowMs: number = safeNow()
): RefreshSchedule {
  const target = Math.max(widget.nextRefreshAt, widget.expiresAt);
  return {
    nextRunMs: target,
    intervalSec: widget.refreshIntervalSec,
    widgetId: widget.id,
  };
}

export function mergeRefreshSchedules(
  schedules: ReadonlyArray<RefreshSchedule>
): ReadonlyArray<RefreshSchedule> {
  return [...schedules].sort((a, b) => a.nextRunMs - b.nextRunMs);
}

// ----------------------------------------------------------------------------
// SECTION 22 — Snapshot integrity helpers
// ----------------------------------------------------------------------------

export function widgetChecksum(widget: CockpitWidget): string {
  return fnv1a32(JSON.stringify(widget));
}

export function widgetsChecksum(widgets: ReadonlyArray<CockpitWidget>): string {
  let acc = "";
  for (const w of widgets) acc += widgetChecksum(w);
  return fnv1a32(acc);
}

// ----------------------------------------------------------------------------
// SECTION 23 — Cross-section analytics (composition over assembly)
// ----------------------------------------------------------------------------

export interface CrossSectionAnalytics {
  readonly sectionsHealthy: number;
  readonly sectionsStale: number;
  readonly heaviestRefreshSec: number;
  readonly lightestRefreshSec: number;
  readonly meanRefreshSec: number;
  readonly totalEntries24h: number;
}

export function crossSectionAnalytics(
  widgets: ReadonlyArray<CockpitWidget>,
  nowMs: number = safeNow()
): CrossSectionAnalytics {
  let heaviest = 0;
  let lightest = Number.POSITIVE_INFINITY;
  let total = 0;
  let healthy = 0;
  let stale = 0;
  for (const w of widgets) {
    if (w.stale) stale += 1;
    else healthy += 1;
    heaviest = Math.max(heaviest, w.refreshIntervalSec);
    lightest = Math.min(lightest, w.refreshIntervalSec);
    total += w.refreshIntervalSec;
  }
  const mean = safeRatio(total, widgets.length);
  const cutoff = hoursAgoMs(nowMs, 24);
  let entries24h = 0;
  for (const w of widgets) if (w.fetchedAt >= cutoff) entries24h += 1;
  return {
    sectionsHealthy: healthy,
    sectionsStale: stale,
    heaviestRefreshSec: heaviest,
    lightestRefreshSec: lightest === Number.POSITIVE_INFINITY ? 0 : lightest,
    meanRefreshSec: mean,
    totalEntries24h: entries24h,
  };
}

// ----------------------------------------------------------------------------
// SECTION 24 — Formatting & display helpers (i18n-aware string keys)
// ----------------------------------------------------------------------------

export function humanizeRefreshInterval(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  return `${Math.round(sec / 3600)}h`;
}

export function humanizeCount(n: number, locale: string = "pt-BR"): string {
  try {
    return new Intl.NumberFormat(locale).format(n);
  } catch {
    return String(n);
  }
}

export function humanizePct(pct: number, locale: string = "pt-BR"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(pct);
  } catch {
    return `${(pct * 100).toFixed(1)}%`;
  }
}

// ----------------------------------------------------------------------------
// SECTION 25 — Empty / placeholder builders (used during loading states)
// ----------------------------------------------------------------------------

export function emptySacredSymbolsWidget(
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<SacredSymbolsWidgetData> {
  return buildSacredSymbolsWidget([], locale, nowMs);
}

export function emptyPushSchedulesWidget(
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<PushSchedulesWidgetData> {
  return buildPushSchedulesWidget([], [], locale, nowMs);
}

export function emptyABExperimentsWidget(
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<ABExperimentsWidgetData> {
  return buildABExperimentsWidget([], locale, nowMs);
}

export function emptyVoiceMoodWidget(
  locale: string,
  windowMs: number = 3_600_000,
  nowMs: number = safeNow()
): CockpitWidget<VoiceMoodWidgetData> {
  return buildVoiceMoodWidget([], windowMs, locale, nowMs);
}

export function emptyPrayerCorpusWidget(
  locale: string,
  nowMs: number = safeNow()
): CockpitWidget<PrayerCorpusWidgetData> {
  return buildPrayerCorpusWidget([], locale, nowMs);
}

export function emptyRecapReceiptsWidget(
  nowMs: number = safeNow()
): CockpitWidget<RecapReceiptsWidgetData> {
  return buildRecapReceiptsWidget([], nowMs);
}

export function emptyModerationQueueWidget(
  nowMs: number = safeNow()
): CockpitWidget<ModerationQueueWidgetData> {
  return buildModerationQueueWidget([], nowMs);
}

export function emptyAuditLogWidget(
  nowMs: number = safeNow()
): CockpitWidget<AuditLogWidgetData> {
  return buildAuditLogWidget([], "all", nowMs);
}

// ----------------------------------------------------------------------------
// SECTION 26 — Permission helpers
// ----------------------------------------------------------------------------

export function isOwner(role: AdminRole): boolean {
  return role === "owner";
}

export function isAdmin(role: AdminRole): boolean {
  return role === "owner" || role === "admin";
}

export function isCurator(role: AdminRole): boolean {
  return role === "owner" || role === "admin" || role === "curator";
}

export function isModerator(role: AdminRole): boolean {
  return role === "owner" || role === "admin" || role === "moderator";
}

export function canExportAuditLog(role: AdminRole): boolean {
  return role === "owner" || role === "admin";
}

export function canResolveModeration(role: AdminRole): boolean {
  return role === "owner" || role === "admin" || role === "moderator";
}

export function canEditPrayers(role: AdminRole): boolean {
  return role === "owner" || role === "admin" || role === "curator";
}

export function canManageSchedules(role: AdminRole): boolean {
  return role === "owner" || role === "admin";
}

// ----------------------------------------------------------------------------
// SECTION 27 — Compliance report
// ----------------------------------------------------------------------------

export interface LgpdComplianceReport {
  readonly generatedAt: IsoTimestamp;
  readonly sectionsCovered: ReadonlyArray<AdminCockpitSection>;
  readonly lgpdArticles: ReadonlyArray<CockpitWidget["lgpdBasis"]>;
  readonly actionsAudited: ReadonlyArray<AdminActionKind>;
  readonly auditEntryCount: number;
  readonly ok: boolean;
}

export function buildLgpdComplianceReport(
  widgets: ReadonlyArray<CockpitWidget>,
  auditEntries: ReadonlyArray<AuditEntry>
): LgpdComplianceReport {
  const sections = new Set<AdminCockpitSection>();
  const bases = new Set<CockpitWidget["lgpdBasis"]>();
  const actions = new Set<AdminActionKind>();
  for (const w of widgets) {
    sections.add(w.section);
    bases.add(w.lgpdBasis);
  }
  for (const e of auditEntries) actions.add(e.action);
  const articleList = Array.from(bases);
  const ok = widgets.length > 0 && widgets.every((w) => isLgpdBasis(w.lgpdBasis));
  return {
    generatedAt: isoNow(),
    sectionsCovered: Array.from(sections),
    lgpdArticles: articleList,
    actionsAudited: Array.from(actions),
    auditEntryCount: auditEntries.length,
    ok,
  };
}

// ----------------------------------------------------------------------------
// SECTION 28 — Diagnostics
// ----------------------------------------------------------------------------

export interface CockpitDiagnostics {
  readonly generatedAt: IsoTimestamp;
  readonly totalWidgets: number;
  readonly widgetsStale: number;
  readonly widgetsExpired: number;
  readonly sectionsCovered: number;
  readonly sectionsMissing: ReadonlyArray<AdminCockpitSection>;
  readonly meanRefreshSec: number;
  readonly heaviestRefreshSec: number;
  readonly ok: boolean;
}

export function diagnoseCockpit(
  widgets: ReadonlyArray<CockpitWidget>,
  nowMs: number = safeNow()
): CockpitDiagnostics {
  const missing = missingSections(widgets);
  const stats = crossSectionAnalytics(widgets, nowMs);
  const expired = expiredWidgetCount(widgets, nowMs);
  return {
    generatedAt: isoNow(),
    totalWidgets: widgets.length,
    widgetsStale: staleWidgetCount(widgets),
    widgetsExpired: expired,
    sectionsCovered: widgets.length === 0 ? 0 : sectionCoverage(widgets).length,
    sectionsMissing: missing,
    meanRefreshSec: stats.meanRefreshSec,
    heaviestRefreshSec: stats.heaviestRefreshSec,
    ok: missing.length === 0 && stats.sectionsStale === 0 && expired === 0,
  };
}

// ----------------------------------------------------------------------------
// SECTION 29 — Build helpers (combine widgets into snapshot)
// ----------------------------------------------------------------------------

export function buildMinimalCockpit(
  actor: AdminActor,
  locale: string,
  nowMs: number = safeNow()
): ReadonlyArray<CockpitWidget> {
  return filterWidgetsByRole(
    [
      emptySacredSymbolsWidget(locale, nowMs),
      emptyPrayerCorpusWidget(locale, nowMs),
    ],
    actor.role
  );
}

export function buildFullCockpit(
  input: AssembleCockpitInput
): ReadonlyArray<CockpitWidget> {
  return assembleCockpit(input);
}

// ----------------------------------------------------------------------------
// SECTION 30 — Convenience: top-level "compose + summarize" pipeline
// ----------------------------------------------------------------------------

export interface CockpitPipelineResult {
  readonly snapshot: CockpitSnapshot;
  readonly summary: CockpitSummary;
  readonly diagnostics: CockpitDiagnostics;
  readonly compliance: LgpdComplianceReport;
}

export function runCockpitPipeline(
  input: AssembleCockpitInput,
  auditEntries: ReadonlyArray<AuditEntry> = []
): CockpitPipelineResult {
  const widgets = assembleCockpit(input);
  const summary = summarizeCockpit(widgets);
  const diagnostics = diagnoseCockpit(widgets, input.nowMs);
  const snapshot = captureCockpitSnapshot(widgets, input.actor, input.nowMs);
  const compliance = buildLgpdComplianceReport(widgets, auditEntries);
  return { snapshot, summary, diagnostics, compliance };
}

// ----------------------------------------------------------------------------
// SECTION 31 — Stable sort & partition (utilities)
// ----------------------------------------------------------------------------

export function sortWidgetsBySection(
  widgets: ReadonlyArray<CockpitWidget>
): ReadonlyArray<CockpitWidget> {
  const order = new Map<AdminCockpitSection, number>();
  ADMIN_COCKPIT_SECTIONS.forEach((s, i) => order.set(s, i));
  return [...widgets].sort((a, b) => (order.get(a.section) ?? 99) - (order.get(b.section) ?? 99));
}

export function partitionByHealth(
  widgets: ReadonlyArray<CockpitWidget>
): { readonly healthy: ReadonlyArray<CockpitWidget>; readonly stale: ReadonlyArray<CockpitWidget> } {
  const healthy: CockpitWidget[] = [];
  const stale: CockpitWidget[] = [];
  for (const w of widgets) {
    if (w.stale) stale.push(w);
    else healthy.push(w);
  }
  return { healthy, stale };
}

// ----------------------------------------------------------------------------
// SECTION 32 — Public aggregates
// ----------------------------------------------------------------------------

export interface CockpitAggregate {
  readonly section: AdminCockpitSection;
  readonly stale: boolean;
  readonly age: number;
  readonly weight: number;
}

export function aggregateWidgets(
  widgets: ReadonlyArray<CockpitWidget>,
  nowMs: number = safeNow()
): ReadonlyArray<CockpitAggregate> {
  return widgets.map((w) => ({
    section: w.section,
    stale: w.stale,
    age: Math.max(0, nowMs - w.fetchedAt),
    weight: w.refreshIntervalSec,
  }));
}

// ----------------------------------------------------------------------------
// SECTION 33 — Audit helpers (chains)
// ----------------------------------------------------------------------------

export interface AuditChain {
  readonly entries: ReadonlyArray<AuditEntry>;
}

export function auditChain(entries: ReadonlyArray<AuditEntry>): AuditChain {
  return { entries };
}

export function appendAudit(
  chain: AuditChain,
  entry: AuditEntry
): AuditChain {
  return { entries: [...chain.entries, entry] };
}

export function filterAuditByAction(
  chain: AuditChain,
  action: AdminActionKind
): AuditChain {
  return { entries: chain.entries.filter((e) => e.action === action) };
}

export function filterAuditByActor(
  chain: AuditChain,
  actorId: AdminActorId
): AuditChain {
  return { entries: chain.entries.filter((e) => e.actorId === actorId) };
}

export function auditChainSize(chain: AuditChain): number {
  return chain.entries.length;
}

// ----------------------------------------------------------------------------
// SECTION 34 — Default exports registry (operational metadata)
// ----------------------------------------------------------------------------

export interface CockpitEngineMeta {
  readonly engineVersion: string;
  readonly builtAt: IsoTimestamp;
  readonly wave: string;
  readonly sections: ReadonlyArray<AdminCockpitSection>;
}

export function engineMeta(): CockpitEngineMeta {
  return {
    engineVersion: "1.0.0",
    builtAt: isoNow(),
    wave: "w50",
    sections: ADMIN_COCKPIT_SECTIONS,
  };
}

// ----------------------------------------------------------------------------
// SECTION 35 — Public exports registry (introspection)
// ----------------------------------------------------------------------------

export const COCKPIT_PUBLIC_API: ReadonlyArray<string> = [
  "buildSacredSymbolsWidget",
  "buildPushSchedulesWidget",
  "buildABExperimentsWidget",
  "buildVoiceMoodWidget",
  "buildPrayerCorpusWidget",
  "buildRecapReceiptsWidget",
  "buildModerationQueueWidget",
  "buildAuditLogWidget",
  "assembleCockpit",
  "filterWidgetsByRole",
  "mergeCockpitContext",
  "diffCockpitSnapshots",
  "summarizeCockpit",
  "validateWidget",
  "serializeCockpit",
  "deserializeCockpit",
  "cacheKeyForWidget",
  "shouldRefreshWidget",
  "markWidgetStale",
  "auditAdminAction",
  "requireAdminRole",
  "getEffectivePermissions",
  "DEFAULT_COCKPIT_REFRESH_INTERVALS",
  "COCKPIT_PERMISSION_MATRIX",
  "COCKPIT_SECTION_REGISTRY",
  "ADMIN_ROLE_HIERARCHY",
  "isAdminRole",
  "assertAdminRole",
  "parseWidgetSnapshot",
  "mergeWidgetData",
];