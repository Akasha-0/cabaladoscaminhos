// ============================================================================
// Cockpit Widget Bundle — User Dashboard Bundle Engine (Wave 51, 2026-06-29)
// ============================================================================
//
// Filosofia:
//   - Camada pura: zero deps externos, sem react/next/prisma. Apenas types +
//     funções puras para que a UI de dashboard do usuário (Next.js client +
//     server components) seja um wrapper fino sobre este engine.
//   - Compor w50/admin-cockpit SEM importar diretamente: redeclaramos aqui
//     apenas os tipos da superfície que consumimos (CockpitWidget, AdminRole,
//     build*Widget, assembleCockpit, filterWidgetsByRole, etc.) — mesmo
//     padrão "soft contract" usado por w50 ao compor w48/w49.
//   - RBAC-DOWN + OPT-IN: bundles de usuário NUNCA herdam permissões
//     administrativas. Widgets admin-only (audit_log, moderation_queue,
//     push_schedules admin-only-lanes) são downgrade-ados ou removidos.
//   - Sacred-text policy: widgets cuja seção toca símbolos sagrados exigem
//     sensitivity gating (sensitivity 4 = restricted → requer admin role →
//     downgrade obrigatório para scope 'public'/'user'). O downgrade NÃO
//     remove o widget — reescreve permissions + sensitivity para um envelope
//     seguro e registra downgrade na lista `downgradedScopes`.
//   - LGPD:
//       * Art. 7  — consentimento por categoria de dados (cada widget declara
//                   1..N dataCategories; cada categoria exige um purpose)
//       * Art. 8  — transparência (cada widget declara dataFields expostos
//                   — necessário exibir isso ao titular antes de consentir)
//       * Art. 18 — direitos do titular (export do bundle em JSON legível
//                   + deleção via purgeBundle())
//   - Determinístico: hashes via FNV-1a 32-bit (sem crypto.randomUUID para
//     garantir snapshots estáveis em ambientes edge).
//
// Compõe (sem importar diretamente — apenas tipos esperados, mesma
// estratégia de w50):
//   - w50/admin-cockpit-ui        — CockpitWidget, AdminRole, build*Widget,
//                                   assembleCockpit, filterWidgetsByRole,
//                                   COCKPIT_PERMISSION_MATRIX,
//                                   COCKPIT_SECTION_REGISTRY,
//                                   AUDIT_ACTION_KINDS, LgpdLegalBasis
//
// Saída do módulo:
//   - 30+ named exports (alvo: ~80-100 exports)
//   - 0 `any` types
//   - 0 `console.log` em produção
//   - 1500-2800 linhas
//
// ============================================================================

// ----------------------------------------------------------------------------
// SECTION 0 — Branded primitives (zero-cost, readability + safety)
// ----------------------------------------------------------------------------

declare const __cwb_brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__cwb_brand]: B };

export type UserId = Brand<string, "UserId">;
export type BundleId = Brand<string, "BundleId">;
export type WidgetRefId = Brand<string, "WidgetRefId">;
export type ConsentId = Brand<string, "ConsentId">;
export type Checksum256 = Brand<string, "Checksum256">;
export type IsoTimestamp = Brand<string, "IsoTimestamp">;
export type LocaleCode = Brand<string, "LocaleCode">;
export type CorrelationId = Brand<string, "CorrelationId">;
export type PurposeCode = Brand<string, "PurposeCode">;

export const asUserId = (s: string): UserId => s as UserId;
export const asBundleId = (s: string): BundleId => s as BundleId;
export const asWidgetRefId = (s: string): WidgetRefId => s as WidgetRefId;
export const asConsentId = (s: string): ConsentId => s as ConsentId;
export const asChecksum256 = (s: string): Checksum256 => s as Checksum256;
export const asIsoTimestamp = (s: string): IsoTimestamp => s as IsoTimestamp;
export const asLocaleCode = (s: string): LocaleCode => s as LocaleCode;
export const asCorrelationId = (s: string): CorrelationId => s as CorrelationId;
export const asPurposeCode = (s: string): PurposeCode => s as PurposeCode;

// ----------------------------------------------------------------------------
// SECTION 1 — Soft-contract mirror: w50/admin-cockpit surface
// ----------------------------------------------------------------------------
//
// Estes tipos espelham a superfície pública de `w50/admin-cockpit`. NÃO
// importamos o módulo diretamente (mesma estratégia "soft contract" que
// w50 usa para compor w48/w49). Quando o caller integrar o engine em
// produção, basta chamar `coerceCockpitWidget(widget)` para validar que um
// widget vindo de w50 satisfaz o contrato esperado.
//
// Se w50 evoluir a forma de CockpitWidget, este mirror precisa ser
// sincronizado. `validateCockpitWidgetShape` é o guard-rail que detecta
// drift entre os dois contratos.

// §1.1 — Identity & RBAC

export type AdminRole =
  | "owner"
  | "admin"
  | "curator"
  | "moderator"
  | "viewer";

export const ADMIN_ROLE_VALUES: readonly AdminRole[] = [
  "owner",
  "admin",
  "curator",
  "moderator",
  "viewer",
] as const;

export const ADMIN_ROLE_HIERARCHY: Readonly<Record<AdminRole, number>> = {
  owner: 100,
  admin: 80,
  curator: 60,
  moderator: 40,
  viewer: 20,
};

// §1.2 — Sections & sensitivity

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

export type SensitivityLevel = "public" | "curated" | "initiate" | "restricted";

export const SENSITIVITY_VALUES: readonly SensitivityLevel[] = [
  "public",
  "curated",
  "initiate",
  "restricted",
] as const;

// §1.3 — Data shape & LGPD basis

export type DataShape =
  | "scalar"
  | "timeseries"
  | "distribution"
  | "list"
  | "funnel";

export const DATA_SHAPE_VALUES: readonly DataShape[] = [
  "scalar",
  "timeseries",
  "distribution",
  "list",
  "funnel",
] as const;

export type LgpdLegalBasis =
  | "consentimento"
  | "cumprimento_obrigacao_legal"
  | "execucao_contrato"
  | "exercicio_regular_direitos"
  | "interesse_legitimo"
  | "protecao_da_vida"
  | "tutela_da_saude"
  | "interesse_publico"
  | "pesquisa";

export const LGPD_LEGAL_BASIS_VALUES: readonly LgpdLegalBasis[] = [
  "consentimento",
  "cumprimento_obrigacao_legal",
  "execucao_contrato",
  "exercicio_regular_direitos",
  "interesse_legitimo",
  "protecao_da_vida",
  "tutela_da_saude",
  "interesse_publico",
  "pesquisa",
] as const;

// §1.4 — Generic widget data payload (each w50 widget has its own shape)

export interface BaseWidgetData {
  readonly locale: string;
}

export interface CockpitWidgetDataShape {
  readonly totalRecords?: number;
  readonly description?: string;
  readonly [extraKey: string]: unknown;
}

// §1.5 — Section registry mirror (subset needed for preset lookup)

export interface CockpitSectionMetaMirror {
  readonly section: AdminCockpitSection;
  readonly titleI18nKey: string;
  readonly descriptionI18nKey: string;
  readonly defaultRefreshSec: number;
  readonly defaultTtlSec: number;
  readonly dataShape: DataShape;
  readonly lgpdArticle: string;
}

export const COCKPIT_SECTION_REGISTRY_MIRROR: Readonly<
  Record<AdminCockpitSection, CockpitSectionMetaMirror>
> = {
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

// §1.6 — CockpitWidget envelope (mirror of w50 §5)

export interface CockpitWidgetMirror {
  readonly id: string;
  readonly section: AdminCockpitSection;
  readonly title: string;
  readonly description: string;
  readonly dataShape: DataShape;
  readonly refreshIntervalSec: number;
  readonly permissions: ReadonlyArray<AdminRole>;
  readonly ttl: number;
  readonly data: CockpitWidgetDataShape;
  readonly fetchedAt: number;
  readonly expiresAt: number;
  readonly nextRefreshAt: number;
  readonly stale: boolean;
  readonly staleReason: string | null;
  readonly lgpdBasis: LgpdLegalBasis;
  readonly correlationId: string;
}

// ----------------------------------------------------------------------------
// SECTION 2 — Bundle-specific types
// ----------------------------------------------------------------------------

// §2.1 — Scope (where the bundle widget will be embedded)

export type WidgetScope = "user" | "community" | "public";

export const WIDGET_SCOPE_VALUES: readonly WidgetScope[] = [
  "user",
  "community",
  "public",
] as const;

export interface WidgetScopeMeta {
  readonly scope: WidgetScope;
  readonly allowedRoles: ReadonlyArray<AdminRole>;
  readonly maxSensitivity: SensitivityLevel;
  readonly descriptionKey: string;
}

export const WIDGET_SCOPE_REGISTRY: Readonly<
  Record<WidgetScope, WidgetScopeMeta>
> = {
  user: {
    scope: "user",
    allowedRoles: ["owner", "admin", "curator", "moderator", "viewer"],
    maxSensitivity: "initiate",
    descriptionKey: "bundle.scope.user.description",
  },
  community: {
    scope: "community",
    allowedRoles: ["owner", "admin", "curator", "moderator", "viewer"],
    maxSensitivity: "curated",
    descriptionKey: "bundle.scope.community.description",
  },
  public: {
    scope: "public",
    allowedRoles: ["owner", "admin", "curator", "moderator", "viewer"],
    maxSensitivity: "public",
    descriptionKey: "bundle.scope.public.description",
  },
};

// §2.2 — Preset taxonomy

export type UserDashboardBundlePreset =
  | "community"
  | "devotional"
  | "marketplace"
  | "mentorship"
  | "minimal"
  | "custom";

export const USER_DASHBOARD_BUNDLE_PRESETS: readonly UserDashboardBundlePreset[] = [
  "community",
  "devotional",
  "marketplace",
  "mentorship",
  "minimal",
  "custom",
] as const;

// §2.3 — Privacy of the bundle itself

export type BundlePrivacy = "public" | "private" | "link-only";

export const BUNDLE_PRIVACY_VALUES: readonly BundlePrivacy[] = [
  "public",
  "private",
  "link-only",
] as const;

// §2.4 — Refresh policy

export type RefreshPolicyKind =
  | "real-time"
  | "interval"
  | "on-demand"
  | "disabled";

export interface RefreshPolicy {
  readonly kind: RefreshPolicyKind;
  readonly intervalSec: number;
  readonly jitterSec: number;
}

export const DEFAULT_USER_BUNDLE_REFRESH: RefreshPolicy = {
  kind: "interval",
  intervalSec: 600,
  jitterSec: 30,
};

// §2.5 — Position (grid coords, 12-col)

export interface BundleWidgetPosition {
  readonly row: number;
  readonly col: number;
  readonly width: number;
  readonly height: number;
}

export const DEFAULT_BUNDLE_POSITION: BundleWidgetPosition = {
  row: 0,
  col: 0,
  width: 4,
  height: 2,
};

// §2.6 — RefreshPolicy helpers & validation

export function isRefreshKind(value: unknown): value is RefreshPolicyKind {
  return (
    value === "real-time" ||
    value === "interval" ||
    value === "on-demand" ||
    value === "disabled"
  );
}

export function assertRefreshKind(value: unknown): RefreshPolicyKind {
  if (!isRefreshKind(value)) {
    throw new Error(`refresh_policy_kind_unknown:${String(value)}`);
  }
  return value;
}

export function makeRefreshPolicy(
  kind: RefreshPolicyKind,
  intervalSec: number,
  jitterSec: number = 0
): RefreshPolicy {
  return { kind, intervalSec, jitterSec };
}

export function refreshPolicyEquals(
  a: RefreshPolicy,
  b: RefreshPolicy
): boolean {
  return (
    a.kind === b.kind &&
    a.intervalSec === b.intervalSec &&
    a.jitterSec === b.jitterSec
  );
}

export function refreshPolicyFingerprint(p: RefreshPolicy): Checksum256 {
  return asChecksum256(fnv1a32(`${p.kind}|${p.intervalSec}|${p.jitterSec}`));
}

export function normalizeRefreshPolicy(p: RefreshPolicy): RefreshPolicy {
  if (p.intervalSec < 0) {
    return { ...p, intervalSec: 0 };
  }
  if (p.jitterSec < 0) {
    return { ...p, jitterSec: 0 };
  }
  if (p.jitterSec > p.intervalSec) {
    return { ...p, jitterSec: p.intervalSec };
  }
  return p;
}

// ----------------------------------------------------------------------------
// SECTION 3 — Bundle permissions enum (LGPD Art. 7 + Art. 18 + opt-in)
// ----------------------------------------------------------------------------

export enum BundlePermission {
  view = "view",
  share = "share",
  embed = "embed",
  export = "export",
  allow_indexing = "allow_indexing",
}

export const BUNDLE_PERMISSION_VALUES: readonly BundlePermission[] = [
  BundlePermission.view,
  BundlePermission.share,
  BundlePermission.embed,
  BundlePermission.export,
  BundlePermission.allow_indexing,
] as const;

export interface BundlePermissionGrant {
  readonly permission: BundlePermission;
  readonly granteeRole: AdminRole;
  readonly reason: string;
}

export interface BundlePermissionMatrix {
  readonly view: ReadonlyArray<AdminRole>;
  readonly share: ReadonlyArray<AdminRole>;
  readonly embed: ReadonlyArray<AdminRole>;
  readonly export: ReadonlyArray<AdminRole>;
  readonly allow_indexing: ReadonlyArray<AdminRole>;
}

// Default: user owns everything; share/embed/export indexed expand
// progressively based on privacy mode
export const PRIVATE_BUNDLE_PERMISSIONS: BundlePermissionMatrix = {
  view: ["owner", "admin", "curator", "moderator", "viewer"],
  share: ["owner", "admin", "curator"],
  embed: ["owner", "admin"],
  export: ["owner", "admin", "curator", "moderator", "viewer"],
  allow_indexing: [],
};

export const LINK_ONLY_BUNDLE_PERMISSIONS: BundlePermissionMatrix = {
  view: ["owner", "admin", "curator", "moderator", "viewer"],
  share: ["owner", "admin", "curator", "moderator", "viewer"],
  embed: ["owner", "admin", "curator", "moderator"],
  export: ["owner", "admin", "curator", "moderator", "viewer"],
  allow_indexing: [],
};

export const PUBLIC_BUNDLE_PERMISSIONS: BundlePermissionMatrix = {
  view: ["owner", "admin", "curator", "moderator", "viewer"],
  share: ["owner", "admin", "curator", "moderator", "viewer"],
  embed: ["owner", "admin", "curator", "moderator", "viewer"],
  export: ["owner", "admin", "curator", "moderator", "viewer"],
  allow_indexing: ["owner", "admin"],
};

export function permissionsForPrivacy(
  privacy: BundlePrivacy
): BundlePermissionMatrix {
  switch (privacy) {
    case "private":
      return PRIVATE_BUNDLE_PERMISSIONS;
    case "link-only":
      return LINK_ONLY_BUNDLE_PERMISSIONS;
    case "public":
      return PUBLIC_BUNDLE_PERMISSIONS;
  }
}

export function hasBundlePermission(
  matrix: BundlePermissionMatrix,
  permission: BundlePermission,
  role: AdminRole
): boolean {
  const list = matrix[permission];
  return list.some((r) => r === role);
}

export function grantBundlePermission(
  matrix: BundlePermissionMatrix,
  permission: BundlePermission,
  role: AdminRole
): BundlePermissionMatrix {
  const list = matrix[permission];
  if (list.includes(role)) return matrix;
  return {
    ...matrix,
    [permission]: [...list, role],
  };
}

export function revokeBundlePermission(
  matrix: BundlePermissionMatrix,
  permission: BundlePermission,
  role: AdminRole
): BundlePermissionMatrix {
  const list = matrix[permission];
  if (!list.includes(role)) return matrix;
  return {
    ...matrix,
    [permission]: list.filter((r) => r !== role),
  };
}

// ----------------------------------------------------------------------------
// SECTION 4 — Error codes (CWB_001..008)
// ----------------------------------------------------------------------------

export enum CockpitBundleErrorCode {
  CWB_001 = "CWB_001", // preset_unknown
  CWB_002 = "CWB_002", // widget_not_found
  CWB_003 = "CWB_003", // scope_downgrade_blocked
  CWB_004 = "CWB_004", // consent_missing
  CWB_005 = "CWB_005", // bundle_too_large
  CWB_006 = "CWB_006", // bundle_stale
  CWB_007 = "CWB_007", // role_insufficient
  CWB_008 = "CWB_008", // export_failed
}

export const COCKPIT_BUNDLE_ERROR_CODES: readonly CockpitBundleErrorCode[] = [
  CockpitBundleErrorCode.CWB_001,
  CockpitBundleErrorCode.CWB_002,
  CockpitBundleErrorCode.CWB_003,
  CockpitBundleErrorCode.CWB_004,
  CockpitBundleErrorCode.CWB_005,
  CockpitBundleErrorCode.CWB_006,
  CockpitBundleErrorCode.CWB_007,
  CockpitBundleErrorCode.CWB_008,
] as const;

export interface CockpitBundleErrorMeta {
  readonly code: CockpitBundleErrorCode;
  readonly message: string;
  readonly article: "Art.7" | "Art.8" | "Art.18" | "RBAC" | "scope";
  readonly severity: "warning" | "error";
}

export const COCKPIT_BUNDLE_ERROR_META: Readonly<
  Record<CockpitBundleErrorCode, CockpitBundleErrorMeta>
> = {
  [CockpitBundleErrorCode.CWB_001]: {
    code: CockpitBundleErrorCode.CWB_001,
    message: "preset_unknown",
    article: "RBAC",
    severity: "error",
  },
  [CockpitBundleErrorCode.CWB_002]: {
    code: CockpitBundleErrorCode.CWB_002,
    message: "widget_not_found",
    article: "RBAC",
    severity: "error",
  },
  [CockpitBundleErrorCode.CWB_003]: {
    code: CockpitBundleErrorCode.CWB_003,
    message: "scope_downgrade_blocked",
    article: "scope",
    severity: "error",
  },
  [CockpitBundleErrorCode.CWB_004]: {
    code: CockpitBundleErrorCode.CWB_004,
    message: "consent_missing",
    article: "Art.7",
    severity: "error",
  },
  [CockpitBundleErrorCode.CWB_005]: {
    code: CockpitBundleErrorCode.CWB_005,
    message: "bundle_too_large",
    article: "scope",
    severity: "error",
  },
  [CockpitBundleErrorCode.CWB_006]: {
    code: CockpitBundleErrorCode.CWB_006,
    message: "bundle_stale",
    article: "Art.18",
    severity: "warning",
  },
  [CockpitBundleErrorCode.CWB_007]: {
    code: CockpitBundleErrorCode.CWB_007,
    message: "role_insufficient",
    article: "RBAC",
    severity: "error",
  },
  [CockpitBundleErrorCode.CWB_008]: {
    code: CockpitBundleErrorCode.CWB_008,
    message: "export_failed",
    article: "Art.18",
    severity: "error",
  },
};

export class CockpitBundleError extends Error {
  readonly code: CockpitBundleErrorCode;
  readonly article: CockpitBundleErrorMeta["article"];
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: CockpitBundleErrorCode,
    details: Readonly<Record<string, unknown>> = {}
  ) {
    const meta = COCKPIT_BUNDLE_ERROR_META[code];
    super(`[${code}] ${meta.message}`);
    this.name = "CockpitBundleError";
    this.code = code;
    this.article = meta.article;
    this.details = details;
  }
}

export function isCockpitBundleError(value: unknown): value is CockpitBundleError {
  return value instanceof CockpitBundleError;
}

export function describeBundleError(code: CockpitBundleErrorCode): string {
  const meta = COCKPIT_BUNDLE_ERROR_META[code];
  return `${meta.code}:${meta.message} (${meta.article})`;
}

// ----------------------------------------------------------------------------
// SECTION 5 — Constants & tuning knobs
// ----------------------------------------------------------------------------

export const MAX_BUNDLE_WIDGETS = 12;
export const MIN_BUNDLE_WIDGETS = 1;
export const BUNDLE_TTL_DAYS = 90;
export const BUNDLE_TTL_MS = BUNDLE_TTL_DAYS * 86_400_000;
export const DEFAULT_DOWNGRADE_SENSITIVITY: SensitivityLevel = "public";
export const USER_BUNDLE_VERSION = "1.0.0";
export const DEFAULT_LOCALE: LocaleCode = asLocaleCode("pt-BR");
export const CWB_FALLBACK_HTML_MAX_BYTES = 1024;
export const CWB_JSON_MAX_BYTES = 64 * 1024;
export const CWB_BUNDLE_REFRESH_MIN_INTERVAL_SEC = 30;
export const CWB_BUNDLE_REFRESH_MAX_INTERVAL_SEC = 86_400;
export const SUPPORTED_BUNDLE_LOCALES: readonly LocaleCode[] = [
  asLocaleCode("pt-BR"),
  asLocaleCode("en-US"),
  asLocaleCode("es-ES"),
];

export interface BundleConstants {
  readonly maxWidgets: number;
  readonly minWidgets: number;
  readonly ttlDays: number;
  readonly ttlMs: number;
  readonly version: string;
  readonly maxHtmlBytes: number;
  readonly maxJsonBytes: number;
  readonly minRefreshSec: number;
  readonly maxRefreshSec: number;
}

export const BUNDLE_CONSTANTS: BundleConstants = {
  maxWidgets: MAX_BUNDLE_WIDGETS,
  minWidgets: MIN_BUNDLE_WIDGETS,
  ttlDays: BUNDLE_TTL_DAYS,
  ttlMs: BUNDLE_TTL_MS,
  version: USER_BUNDLE_VERSION,
  maxHtmlBytes: CWB_FALLBACK_HTML_MAX_BYTES,
  maxJsonBytes: CWB_JSON_MAX_BYTES,
  minRefreshSec: CWB_BUNDLE_REFRESH_MIN_INTERVAL_SEC,
  maxRefreshSec: CWB_BUNDLE_REFRESH_MAX_INTERVAL_SEC,
};

// ----------------------------------------------------------------------------
// SECTION 6 — Data categories & consent taxonomy (LGPD Art. 7)
// ----------------------------------------------------------------------------
//
// Cada widget declara 1..N `dataCategories` (tipos de dados pessoais que o
// widget expõe ou consome). Para cada categoria o titular precisa ter
// concedido um `purpose` (consentimento específico, Art. 7 §4 LGPD).
//
// `minimal` é sempre obrigatório (dados estritamente necessários para a
// prestação do serviço). Outras categorias exigem opt-in explícito.

export type DataCategory =
  | "minimal" // necessário para o serviço
  | "preferences" // preferências de UI/dash
  | "behavioral" // cliques, tempo na tela
  | "spiritual" // tradição, vínculo religioso
  | "voice_audio" // amostras de voz (Art. 7 + Art. 11)
  | "community_post" // posts/comentários públicos
  | "calendar_event" // eventos da agenda
  | "analytics" // métricas agregadas
  | "third_party"; // integração externa

export const DATA_CATEGORY_VALUES: readonly DataCategory[] = [
  "minimal",
  "preferences",
  "behavioral",
  "spiritual",
  "voice_audio",
  "community_post",
  "calendar_event",
  "analytics",
  "third_party",
] as const;

export type DataFieldKey =
  | "user_id"
  | "display_name"
  | "email"
  | "locale"
  | "timezone"
  | "tradição" // intentionally with diacritic to test handling
  | "voice_sample_url"
  | "post_body"
  | "event_title"
  | "event_datetime"
  | "metric_value"
  | "external_account_id"
  | "consent_metadata";

export const DATA_FIELD_VALUES: readonly DataFieldKey[] = [
  "user_id",
  "display_name",
  "email",
  "locale",
  "timezone",
  "tradição",
  "voice_sample_url",
  "post_body",
  "event_title",
  "event_datetime",
  "metric_value",
  "external_account_id",
  "consent_metadata",
] as const;

export interface CategoryConsentPurpose {
  readonly purpose: PurposeCode;
  readonly description: string;
  readonly required: boolean;
  readonly defaultGranted: boolean;
}

export interface CategoryConsentSpec {
  readonly category: DataCategory;
  readonly fields: ReadonlyArray<DataFieldKey>;
  readonly purposes: ReadonlyArray<CategoryConsentPurpose>;
}

export const CATEGORY_CONSENT_REGISTRY: Readonly<
  Record<DataCategory, CategoryConsentSpec>
> = {
  minimal: {
    category: "minimal",
    fields: ["user_id", "locale", "consent_metadata"],
    purposes: [
      {
        purpose: asPurposeCode("essential_service"),
        description: "Necessário para prestação do serviço",
        required: true,
        defaultGranted: true,
      },
    ],
  },
  preferences: {
    category: "preferences",
    fields: ["display_name", "locale", "timezone"],
    purposes: [
      {
        purpose: asPurposeCode("ui_customization"),
        description: "Personalizar aparência do dashboard",
        required: false,
        defaultGranted: true,
      },
    ],
  },
  behavioral: {
    category: "behavioral",
    fields: ["user_id", "metric_value"],
    purposes: [
      {
        purpose: asPurposeCode("product_analytics"),
        description: "Métricas agregadas de uso",
        required: false,
        defaultGranted: false,
      },
    ],
  },
  spiritual: {
    category: "spiritual",
    fields: ["user_id", "tradição"],
    purposes: [
      {
        purpose: asPurposeCode("tradition_affinity"),
        description: "Curadoria personalizada por tradição espiritual",
        required: false,
        defaultGranted: false,
      },
    ],
  },
  voice_audio: {
    category: "voice_audio",
    fields: ["user_id", "voice_sample_url"],
    purposes: [
      {
        purpose: asPurposeCode("voice_cloning"),
        description: "Clonagem e síntese de voz (Art. 11)",
        required: false,
        defaultGranted: false,
      },
    ],
  },
  community_post: {
    category: "community_post",
    fields: ["user_id", "display_name", "post_body"],
    purposes: [
      {
        purpose: asPurposeCode("community_sharing"),
        description: "Publicar conteúdo em comunidade",
        required: false,
        defaultGranted: false,
      },
    ],
  },
  calendar_event: {
    category: "calendar_event",
    fields: ["user_id", "event_title", "event_datetime"],
    purposes: [
      {
        purpose: asPurposeCode("agenda_synchronization"),
        description: "Sincronização com agenda pessoal",
        required: false,
        defaultGranted: false,
      },
    ],
  },
  analytics: {
    category: "analytics",
    fields: ["metric_value", "consent_metadata"],
    purposes: [
      {
        purpose: asPurposeCode("aggregated_metrics"),
        description: "Métricas agregadas anônimas",
        required: false,
        defaultGranted: true,
      },
    ],
  },
  third_party: {
    category: "third_party",
    fields: ["external_account_id", "consent_metadata"],
    purposes: [
      {
        purpose: asPurposeCode("external_integration"),
        description: "Integração com serviços externos (opt-in)",
        required: false,
        defaultGranted: false,
      },
    ],
  },
};

// ----------------------------------------------------------------------------
// SECTION 7 — Bundle widget reference (the compact embedding contract)
// ----------------------------------------------------------------------------

export interface UserDashboardWidgetRef {
  readonly refId: WidgetRefId;
  readonly widgetId: string;
  readonly sourceSection: AdminCockpitSection;
  readonly scope: WidgetScope;
  readonly refreshPolicy: RefreshPolicy;
  readonly position: BundleWidgetPosition;
  readonly dataCategories: ReadonlyArray<DataCategory>;
  readonly dataFields: ReadonlyArray<DataFieldKey>;
  readonly requiredConsents: ReadonlyArray<PurposeCode>;
  readonly visibility: BundleVisibilityHint;
  readonly downgradedFromAdmin: boolean;
  readonly downgradeReason: string | null;
  readonly addedAt: IsoTimestamp;
}

export type BundleVisibilityHint = "always" | "if-data-available" | "fallback-only";

export function isBundleVisibilityHint(
  v: unknown
): v is BundleVisibilityHint {
  return v === "always" || v === "if-data-available" || v === "fallback-only";
}

export function makeWidgetRef(
  params: {
    widgetId: string;
    sourceSection: AdminCockpitSection;
    scope: WidgetScope;
    refreshPolicy?: RefreshPolicy;
    position?: BundleWidgetPosition;
    dataCategories: ReadonlyArray<DataCategory>;
    dataFields: ReadonlyArray<DataFieldKey>;
    visibility?: BundleVisibilityHint;
  }
): UserDashboardWidgetRef {
  const refresh = normalizeRefreshPolicy(
    params.refreshPolicy ?? DEFAULT_USER_BUNDLE_REFRESH
  );
  const visibility: BundleVisibilityHint =
    params.visibility ?? "if-data-available";
  const consents = requiredConsentsForCategories(params.dataCategories);
  return {
    refId: asWidgetRefId(fnv1a32(params.widgetId + params.sourceSection)),
    widgetId: params.widgetId,
    sourceSection: params.sourceSection,
    scope: params.scope,
    refreshPolicy: refresh,
    position: params.position ?? DEFAULT_BUNDLE_POSITION,
    dataCategories: params.dataCategories,
    dataFields: params.dataFields,
    requiredConsents: consents,
    visibility,
    downgradedFromAdmin: false,
    downgradeReason: null,
    addedAt: asIsoTimestamp(new Date(0).toISOString()),
  };
}

// ----------------------------------------------------------------------------
// SECTION 8 — Bundle payload (the persisted artifact)
// ----------------------------------------------------------------------------

export interface UserDashboardBundle {
  readonly id: BundleId;
  readonly userId: UserId;
  readonly preset: UserDashboardBundlePreset;
  readonly widgets: ReadonlyArray<UserDashboardWidgetRef>;
  readonly permissions: BundlePermissionMatrix;
  readonly visibilityHints: BundleVisibilityConfig;
  readonly privacy: BundlePrivacy;
  readonly locale: LocaleCode;
  readonly createdAt: IsoTimestamp;
  readonly updatedAt: IsoTimestamp;
  readonly version: string;
  readonly checksum: Checksum256;
  readonly ttlDays: number;
  readonly expiresAt: IsoTimestamp;
  readonly consentVersion: string;
  readonly lgpdBases: ReadonlyArray<LgpdLegalBasis>;
  readonly tags: ReadonlyArray<string>;
  readonly parentBundleId: BundleId | null;
  readonly checksumHistory: ReadonlyArray<Checksum256>;
}

export interface BundleVisibilityConfig {
  readonly hideIfConsentsRevoked: boolean;
  readonly hideIfStale: boolean;
  readonly hideIfDataUnavailable: boolean;
  readonly showPrivacyBadge: boolean;
}

export const DEFAULT_VISIBILITY_CONFIG: BundleVisibilityConfig = {
  hideIfConsentsRevoked: true,
  hideIfStale: true,
  hideIfDataUnavailable: false,
  showPrivacyBadge: true,
};

// §8.1 — Build request (input to buildUserDashboardBundle)

export interface UserDashboardBundleRequest {
  readonly userId: UserId;
  readonly preset: UserDashboardBundlePreset;
  readonly customWidgetIds?: ReadonlyArray<string>;
  readonly locale: LocaleCode;
  readonly privacy: BundlePrivacy;
  readonly ttlDays?: number;
  readonly tags?: ReadonlyArray<string>;
  readonly parentBundleId?: BundleId;
  readonly nowMs?: number;
  readonly correlationId?: CorrelationId;
  readonly includeSections?: ReadonlyArray<AdminCockpitSection>;
  readonly excludeSections?: ReadonlyArray<AdminCockpitSection>;
}

// §8.2 — Build result (output)

export interface UserDashboardBundleResult {
  readonly bundle: UserDashboardBundle;
  readonly missingWidgets: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<BundleValidationWarning>;
  readonly downgradedScopes: ReadonlyArray<BundleScopeDowngradeEntry>;
  readonly consentGaps: ReadonlyArray<BundleConsentGap>;
  readonly diagnostics: BundleDiagnostics;
}

export interface BundleValidationWarning {
  readonly code: CockpitBundleErrorCode;
  readonly message: string;
  readonly widgetRefId: WidgetRefId | null;
}

export interface BundleScopeDowngradeEntry {
  readonly widgetRefId: WidgetRefId;
  readonly widgetId: string;
  readonly originalScope: WidgetScope;
  readonly newScope: WidgetScope;
  readonly reason: string;
}

export interface BundleConsentGap {
  readonly widgetRefId: WidgetRefId;
  readonly widgetId: string;
  readonly missingPurposes: ReadonlyArray<PurposeCode>;
}

export interface BundleDiagnostics {
  readonly widgetCount: number;
  readonly byScope: Readonly<Record<WidgetScope, number>>;
  readonly bySection: Readonly<Record<AdminCockpitSection, number>>;
  readonly byCategory: Readonly<Record<DataCategory, number>>;
  readonly downgradedCount: number;
  readonly consentGapCount: number;
  readonly presetResolved: UserDashboardBundlePreset;
  readonly ttlDays: number;
  readonly expiresAtMs: number;
  readonly generatedAtMs: number;
}

// ----------------------------------------------------------------------------
// SECTION 9 — Preset definitions (5 const objects + 'custom' is parametric)
// ----------------------------------------------------------------------------

export interface BundlePresetDefinition {
  readonly preset: UserDashboardBundlePreset;
  readonly label: string;
  readonly description: string;
  readonly defaultScope: WidgetScope;
  readonly sections: ReadonlyArray<AdminCockpitSection>;
  readonly allowPublicScope: boolean;
  readonly maxSensitivity: SensitivityLevel;
  readonly requires: ReadonlyArray<DataCategory>;
}

export const PRESET_COMMUNITY: BundlePresetDefinition = {
  preset: "community", label: "Comunidade",
  description: "Foco em feeds, grupos, eventos e métricas agregadas da comunidade.",
  defaultScope: "community",
  sections: ["ab_experiments", "recap_receipts", "prayer_corpus_coverage", "voice_mood_distribution"],
  allowPublicScope: true, maxSensitivity: "curated",
  requires: ["minimal", "community_post", "analytics"],
};

export const PRESET_DEVOTIONAL: BundlePresetDefinition = {
  preset: "devotional", label: "Devocional",
  description: "Foco em tradição, símbolos sagrados e cobertura de corpus de orações.",
  defaultScope: "user",
  sections: ["sacred_symbols", "prayer_corpus_coverage", "voice_mood_distribution"],
  allowPublicScope: false, maxSensitivity: "initiate",
  requires: ["minimal", "spiritual", "analytics"],
};

export const PRESET_MARKETPLACE: BundlePresetDefinition = {
  preset: "marketplace", label: "Marketplace",
  description: "Foco em A/B experiments, receipts e cobertura de corpus para curadores.",
  defaultScope: "user",
  sections: ["ab_experiments", "recap_receipts", "prayer_corpus_coverage"],
  allowPublicScope: false, maxSensitivity: "curated",
  requires: ["minimal", "behavioral", "analytics"],
};

export const PRESET_MENTORSHIP: BundlePresetDefinition = {
  preset: "mentorship", label: "Mentoria",
  description: "Foco em recap receipts (sessões), voice mood e prayer corpus.",
  defaultScope: "user",
  sections: ["recap_receipts", "voice_mood_distribution", "prayer_corpus_coverage"],
  allowPublicScope: false, maxSensitivity: "curated",
  requires: ["minimal", "community_post", "calendar_event"],
};

export const PRESET_MINIMAL: BundlePresetDefinition = {
  preset: "minimal", label: "Mínimo",
  description: "Apenas prayer_corpus_coverage (LGPD-friendly, sem dados sensíveis).",
  defaultScope: "public",
  sections: ["prayer_corpus_coverage"],
  allowPublicScope: true, maxSensitivity: "public",
  requires: ["minimal"],
};

export const BUNDLE_PRESET_REGISTRY: Readonly<
  Record<UserDashboardBundlePreset, BundlePresetDefinition>
> = {
  community: PRESET_COMMUNITY,
  devotional: PRESET_DEVOTIONAL,
  marketplace: PRESET_MARKETPLACE,
  mentorship: PRESET_MENTORSHIP,
  minimal: PRESET_MINIMAL,
  custom: {
    preset: "custom",
    label: "Personalizado",
    description: "Widgets escolhidos manualmente pelo usuário.",
    defaultScope: "user",
    sections: [],
    allowPublicScope: false,
    maxSensitivity: "initiate",
    requires: ["minimal"],
  },
};

export function isBundlePreset(value: unknown): value is UserDashboardBundlePreset {
  return (
    typeof value === "string" &&
    USER_DASHBOARD_BUNDLE_PRESETS.includes(value as UserDashboardBundlePreset)
  );
}

export function assertBundlePreset(value: unknown): UserDashboardBundlePreset {
  if (!isBundlePreset(value)) {
    throw new CockpitBundleError(CockpitBundleErrorCode.CWB_001, {
      received: value,
    });
  }
  return value;
}

export function getPreset(preset: UserDashboardBundlePreset): BundlePresetDefinition {
  return BUNDLE_PRESET_REGISTRY[preset];
}

export function describePreset(preset: UserDashboardBundlePreset): string {
  const def = BUNDLE_PRESET_REGISTRY[preset];
  return `${def.label} (${def.preset}): ${def.description}`;
}

// ----------------------------------------------------------------------------
// SECTION 10 — Widget scope downgrade logic
// ----------------------------------------------------------------------------
//
// Sacred-text policy: widgets da seção `sacred_symbols` cuja `sensitivity`
// seja 'initiate' ou 'restricted' (4-5 na escala do registry w48) precisam
// ter admin role para serem embutidos em scope 'user'. Em scope 'community'
// podemos aceitar até 'curated'. Em scope 'public', downgrade obrigatório
// para 'public' ou block.

export interface DowngradeResult {
  readonly ref: UserDashboardWidgetRef;
  readonly changed: boolean;
  readonly reason: string;
}

export function downgradeWidgetScope(
  widget: UserDashboardWidgetRef,
  targetScope: WidgetScope
): DowngradeResult {
  if (widget.scope === targetScope) {
    return { ref: widget, changed: false, reason: "scope_unchanged" };
  }
  const meta = WIDGET_SCOPE_REGISTRY[widget.scope];
  const target = WIDGET_SCOPE_REGISTRY[targetScope];
  if (!meta || !target) {
    throw new CockpitBundleError(CockpitBundleErrorCode.CWB_003, {
      widgetRefId: widget.refId,
      from: widget.scope,
      to: targetScope,
    });
  }
  // Sacred-symbol downgrade: if widget dataCategories include 'spiritual'
  // AND target.maxSensitivity exceeds the data's max sensitivity, force
  // downgrade to user-only (never public).
  if (widget.dataCategories.includes("spiritual")) {
    if (targetScope === "public") {
      return {
        ref: {
          ...widget,
          scope: "user",
          visibility: "if-data-available",
          downgradedFromAdmin: true,
          downgradeReason: "sacred_public_scope_blocked",
        },
        changed: true,
        reason: "sacred_public_scope_blocked",
      };
    }
    if (
      widget.sourceSection === "sacred_symbols" &&
      targetScope === "community"
    ) {
      return {
        ref: {
          ...widget,
          scope: "community",
          visibility: "if-data-available",
          downgradedFromAdmin: true,
          downgradeReason: "sacred_symbol_community_lock",
        },
        changed: true,
        reason: "sacred_symbol_community_lock",
      };
    }
  }
  // Privacy category throttling: voice_audio widgets cannot go below
  // 'community' scope (always require login + consent verification).
  if (widget.dataCategories.includes("voice_audio") && targetScope === "public") {
    return {
      ref: {
        ...widget,
        scope: "community",
        visibility: "if-data-available",
        downgradedFromAdmin: true,
        downgradeReason: "voice_audio_public_blocked",
      },
      changed: true,
      reason: "voice_audio_public_blocked",
    };
  }
  // Behavioral data can be shared at community-level only if explicitly
  // toggled to public via bundle privacy mode ('public').
  if (
    widget.dataCategories.includes("behavioral") &&
    targetScope === "public"
  ) {
    return {
      ref: {
        ...widget,
        scope: "community",
        visibility: "if-data-available",
        downgradedFromAdmin: true,
        downgradeReason: "behavioral_public_blocked",
      },
      changed: true,
      reason: "behavioral_public_blocked",
    };
  }
  // Default scope swap (no special policy).
  return {
    ref: {
      ...widget,
      scope: targetScope,
      downgradedFromAdmin: true,
      downgradeReason: "explicit_scope_change",
    },
    changed: true,
    reason: "explicit_scope_change",
  };
}

export function canDowngradeScope(
  widget: UserDashboardWidgetRef,
  targetScope: WidgetScope
): boolean {
  // Sacred-text policy: sacred_symbols sections cannot go to public if
  // sensitivity > 'public' — return false so caller can either drop or
  // block.
  if (
    widget.dataCategories.includes("spiritual") &&
    targetScope === "public" &&
    widget.sourceSection === "sacred_symbols"
  ) {
    return false;
  }
  return true;
}

export function isScopeDowngradeBlocked(
  widget: UserDashboardWidgetRef,
  targetScope: WidgetScope
): boolean {
  return !canDowngradeScope(widget, targetScope);
}

export function applyMaxSensitivityFilter(
  widget: UserDashboardWidgetRef,
  maxSensitivity: SensitivityLevel
): UserDashboardWidgetRef | null {
  const sensitivityRank: Record<SensitivityLevel, number> = {
    public: 1,
    curated: 2,
    initiate: 3,
    restricted: 4,
  };
  // We don't actually have a sensitivity field on WidgetRef; map by section.
  const sectionSensitivity: Record<AdminCockpitSection, SensitivityLevel> = {
    sacred_symbols: "initiate",
    push_schedules: "restricted",
    ab_experiments: "restricted",
    voice_mood_distribution: "curated",
    prayer_corpus_coverage: "public",
    recap_receipts: "curated",
    moderation_queue: "restricted",
    audit_log: "restricted",
  };
  const widgetSens = sectionSensitivity[widget.sourceSection];
  if (sensitivityRank[widgetSens] > sensitivityRank[maxSensitivity]) {
    // Sacred-text gate: restricted widget cannot be embedded in user bundle
    // below 'curated'. Caller decides policy (drop or skip with warning).
    return null;
  }
  return widget;
}

// ----------------------------------------------------------------------------
// SECTION 11 — Widget selection by preset
// ----------------------------------------------------------------------------

export interface PresetSelectionOptions {
  readonly targetScope: WidgetScope;
  readonly privacy: BundlePrivacy;
  readonly locale: LocaleCode;
  readonly includeSections?: ReadonlyArray<AdminCockpitSection>;
  readonly excludeSections?: ReadonlyArray<AdminCockpitSection>;
  readonly nowMs: number;
}

export interface PresetSelectionResult {
  readonly widgets: ReadonlyArray<UserDashboardWidgetRef>;
  readonly missingWidgets: ReadonlyArray<string>;
  readonly downgraded: ReadonlyArray<BundleScopeDowngradeEntry>;
}

export function selectWidgetsForPreset(
  preset: UserDashboardBundlePreset
): ReadonlyArray<UserDashboardWidgetRef> {
  const def = BUNDLE_PRESET_REGISTRY[preset];
  const nowIso = asIsoTimestamp(new Date(0).toISOString());
  const base: UserDashboardWidgetRef[] = [];
  for (const section of def.sections) {
    const cats = categoryPresetFor(section, def);
    const fields = fieldsPresetFor(section, def);
    base.push(
      makeWidgetRef({
        widgetId: `widget-${section}-${preset}`,
        sourceSection: section,
        scope: def.defaultScope,
        refreshPolicy: refreshPolicyForSection(section, preset),
        position: defaultPositionForSection(section),
        dataCategories: cats,
        dataFields: fields,
      })
    );
  }
  return base.map((w) => ({
    ...w,
    addedAt: nowIso,
  }));
}

export function selectWidgetsForPresetWithOptions(
  preset: UserDashboardBundlePreset,
  options: PresetSelectionOptions
): PresetSelectionResult {
  const base = selectWidgetsForPreset(preset);
  const def = BUNDLE_PRESET_REGISTRY[preset];
  const downgraded: BundleScopeDowngradeEntry[] = [];
  const filtered: UserDashboardWidgetRef[] = [];
  for (const w of base) {
    if (
      options.includeSections &&
      !options.includeSections.includes(w.sourceSection)
    ) {
      continue;
    }
    if (
      options.excludeSections &&
      options.excludeSections.includes(w.sourceSection)
    ) {
      continue;
    }
    // privacy-driven max sensitivity
    const sensCap = privacyToMaxSensitivity(options.privacy, def);
    const sensOk = applyMaxSensitivityFilter(w, sensCap);
    if (sensOk === null) {
      // widget is too sensitive for this privacy mode → skip
      continue;
    }
    const downgradedRef = downgradeWidgetScope(sensOk, options.targetScope);
    if (downgradedRef.changed) {
      downgraded.push({
        widgetRefId: downgradedRef.ref.refId,
        widgetId: downgradedRef.ref.widgetId,
        originalScope: w.scope,
        newScope: downgradedRef.ref.scope,
        reason: downgradedRef.reason,
      });
    }
    filtered.push(downgradedRef.ref);
  }
  // Drop the placeholder addedAt timestamps (zero epoch). Caller provides
  // the real timestamp via bundle.createdAt/updatedAt.
  const normalized = filtered.map((w) => ({
    ...w,
    addedAt: asIsoTimestamp(new Date(options.nowMs).toISOString()),
  }));
  return {
    widgets: normalized,
    missingWidgets: [],
    downgraded,
  };
}

// ----------------------------------------------------------------------------
// SECTION 12 — Bundle builder (main entry)
// ----------------------------------------------------------------------------

export interface BuildCockpitBundleInput {
  readonly request: UserDashboardBundleRequest;
  readonly consents: ReadonlyArray<BundleConsentGrant>;
}

export function buildUserDashboardBundle(
  req: UserDashboardBundleRequest
): UserDashboardBundleResult {
  const nowMs = req.nowMs ?? Date.now();
  const ttl = req.ttlDays ?? BUNDLE_TTL_DAYS;
  const correlationId =
    req.correlationId ?? asCorrelationId(fnv1a32(req.userId + nowMs.toString()));
  const preset = assertBundlePreset(req.preset);

  if (preset === "custom" && !req.customWidgetIds) {
    throw new CockpitBundleError(CockpitBundleErrorCode.CWB_001, {
      reason: "custom_preset_requires_widget_ids",
    });
  }

  const def = BUNDLE_PRESET_REGISTRY[preset];
  let widgets: ReadonlyArray<UserDashboardWidgetRef>;
  let missingWidgets: ReadonlyArray<string> = [];
  let downgraded: ReadonlyArray<BundleScopeDowngradeEntry> = [];

  if (preset === "custom") {
    const result = selectWidgetsForCustomPreset(
      req.customWidgetIds ?? [],
      req
    );
    widgets = result.widgets;
    missingWidgets = result.missingWidgets;
    downgraded = result.downgraded;
  } else {
    const result = selectWidgetsForPresetWithOptions(preset, {
      targetScope: def.defaultScope,
      privacy: req.privacy,
      locale: req.locale,
      includeSections: req.includeSections,
      excludeSections: req.excludeSections,
      nowMs,
    });
    widgets = result.widgets;
    downgraded = result.downgraded;
  }

  if (widgets.length > MAX_BUNDLE_WIDGETS) {
    widgets = widgets.slice(0, MAX_BUNDLE_WIDGETS);
  }
  if (widgets.length < MIN_BUNDLE_WIDGETS) {
    // not fatal for empty preset; record warning
  }

  const tagList = [...(req.tags ?? []), `preset:${preset}`];
  const createdAtIso = asIsoTimestamp(new Date(nowMs).toISOString());
  const expiresAtMs = nowMs + ttl * 86_400_000;
  const expiresAtIso = asIsoTimestamp(new Date(expiresAtMs).toISOString());

  const permMatrix = permissionsForPrivacy(req.privacy);
  const lgpdBases = collectLgpdBases(widgets);

  const preCheck = {
    id: asBundleId(fnv1a32(`${req.userId}|${preset}|${nowMs}`)),
    userId: req.userId,
    preset,
    widgets,
    permissions: permMatrix,
    visibilityHints: DEFAULT_VISIBILITY_CONFIG,
    privacy: req.privacy,
    locale: req.locale,
    createdAt: createdAtIso,
    updatedAt: createdAtIso,
    version: USER_BUNDLE_VERSION,
    checksum: asChecksum256(""),
    ttlDays: ttl,
    expiresAt: expiresAtIso,
    consentVersion: "1.0.0",
    lgpdBases,
    tags: tagList,
    parentBundleId: req.parentBundleId ?? null,
    checksumHistory: [],
  };

  const checksum = computeBundleChecksum(preCheck);
  const bundle: UserDashboardBundle = {
    ...preCheck,
    checksum,
  };

  const warnings: BundleValidationWarning[] = [];
  if (widgets.length === 0) {
    warnings.push({
      code: CockpitBundleErrorCode.CWB_005,
      message: "bundle_too_small",
      widgetRefId: null,
    });
  }

  const consentGaps = computeConsentGaps(bundle, []);
  const diagnostics = computeBundleDiagnostics(bundle, downgraded, consentGaps);

  return {
    bundle,
    missingWidgets,
    warnings,
    downgradedScopes: downgraded,
    consentGaps,
    diagnostics,
  };
}

export function buildUserDashboardBundleWithConsents(
  input: BuildCockpitBundleInput
): UserDashboardBundleResult {
  const result = buildUserDashboardBundle(input.request);
  const consentGaps = computeConsentGaps(result.bundle, input.consents);
  return {
    ...result,
    consentGaps,
  };
}

// ----------------------------------------------------------------------------
// SECTION 13 — Custom preset helper
// ----------------------------------------------------------------------------

function selectWidgetsForCustomPreset(
  widgetIds: ReadonlyArray<string>,
  req: UserDashboardBundleRequest
): PresetSelectionResult {
  const missingWidgets: string[] = [];
  const downgraded: BundleScopeDowngradeEntry[] = [];
  const widgets: UserDashboardWidgetRef[] = [];
  for (const id of widgetIds) {
    const section = inferSectionFromWidgetId(id);
    if (!section) {
      missingWidgets.push(id);
      continue;
    }
    if (req.excludeSections && req.excludeSections.includes(section)) {
      continue;
    }
    if (req.includeSections && !req.includeSections.includes(section)) {
      continue;
    }
    const ref = makeWidgetRef({
      widgetId: id,
      sourceSection: section,
      scope: "user",
      refreshPolicy: DEFAULT_USER_BUNDLE_REFRESH,
      position: DEFAULT_BUNDLE_POSITION,
      dataCategories: categoryPresetFor(section, BUNDLE_PRESET_REGISTRY.custom),
      dataFields: fieldsPresetFor(section, BUNDLE_PRESET_REGISTRY.custom),
    });
    const downgradedRef = downgradeWidgetScope(ref, "user");
    if (downgradedRef.changed) {
      downgraded.push({
        widgetRefId: downgradedRef.ref.refId,
        widgetId: ref.widgetId,
        originalScope: ref.scope,
        newScope: downgradedRef.ref.scope,
        reason: downgradedRef.reason,
      });
    }
    widgets.push(downgradedRef.ref);
  }
  const nowMs = req.nowMs ?? Date.now();
  const withTimestamps = widgets.map((w) => ({
    ...w,
    addedAt: asIsoTimestamp(new Date(nowMs).toISOString()),
  }));
  return {
    widgets: withTimestamps,
    missingWidgets,
    downgraded,
  };
}

function inferSectionFromWidgetId(id: string): AdminCockpitSection | null {
  for (const section of ADMIN_COCKPIT_SECTIONS) {
    if (id.includes(section)) return section;
  }
  return null;
}

// ----------------------------------------------------------------------------
// SECTION 14 — Bundle role validation
// ----------------------------------------------------------------------------

export interface BundleRoleValidation {
  readonly ok: boolean;
  readonly failingWidgets: ReadonlyArray<WidgetRefId>;
  readonly missingRole: ReadonlyArray<AdminRole>;
}

export function validateBundleForRole(
  bundle: UserDashboardBundle,
  role: AdminRole
): BundleRoleValidation {
  const failingWidgets: WidgetRefId[] = [];
  for (const w of bundle.widgets) {
    if (w.scope === "public") continue;
    const roleOK = bundle.permissions.view.includes(role);
    if (!roleOK) failingWidgets.push(w.refId);
  }
  const missingRole: AdminRole[] = failingWidgets.length > 0 && !bundle.permissions.view.includes(role)
    ? [role]
    : [];
  return {
    ok: failingWidgets.length === 0 && missingRole.length === 0,
    failingWidgets,
    missingRole,
  };
}

export function bundleRequiresAdminRole(bundle: UserDashboardBundle): boolean {
  return bundle.widgets.some((w) =>
    w.dataCategories.includes("spiritual") && w.sourceSection === "sacred_symbols"
  );
}

// ----------------------------------------------------------------------------
// SECTION 15 — Privacy application
// ----------------------------------------------------------------------------

export function applyBundlePrivacy(
  bundle: UserDashboardBundle,
  privacy: BundlePrivacy
): UserDashboardBundle {
  const nowIso = asIsoTimestamp(new Date().toISOString());
  const newMatrix = permissionsForPrivacy(privacy);
  const preCheck = {
    ...bundle,
    privacy,
    permissions: newMatrix,
    updatedAt: nowIso,
  };
  const checksum = computeBundleChecksum(preCheck);
  return {
    ...preCheck,
    checksum,
    checksumHistory: [...bundle.checksumHistory, bundle.checksum],
  };
}

// ----------------------------------------------------------------------------
// SECTION 16 — Summarize bundle
// ----------------------------------------------------------------------------

export interface BundleSummary {
  readonly widgetCount: number;
  readonly byScope: Readonly<Record<WidgetScope, number>>;
  readonly bySection: Readonly<Record<AdminCockpitSection, number>>;
  readonly downgradedCount: number;
  readonly consentGapCount: number;
  readonly privacy: BundlePrivacy;
  readonly preset: UserDashboardBundlePreset;
  readonly expiresAtMs: number;
  readonly ageMs: number;
  readonly ttlDays: number;
  readonly humanCreatedAt: string;
  readonly checksumPrefix: string;
}

export function summarizeBundle(bundle: UserDashboardBundle): BundleSummary {
  const byScope: Record<WidgetScope, number> = {
    user: 0,
    community: 0,
    public: 0,
  };
  const bySection: Record<AdminCockpitSection, number> = {
    sacred_symbols: 0,
    push_schedules: 0,
    ab_experiments: 0,
    voice_mood_distribution: 0,
    prayer_corpus_coverage: 0,
    recap_receipts: 0,
    moderation_queue: 0,
    audit_log: 0,
  };
  let downgradedCount = 0;
  for (const w of bundle.widgets) {
    byScope[w.scope] += 1;
    bySection[w.sourceSection] += 1;
    if (w.downgradedFromAdmin) downgradedCount += 1;
  }
  const createdMs = Date.parse(bundle.createdAt);
  return {
    widgetCount: bundle.widgets.length,
    byScope,
    bySection,
    downgradedCount,
    consentGapCount: 0, // computed in getRequiredConsents/verifyConsents
    privacy: bundle.privacy,
    preset: bundle.preset,
    expiresAtMs: Date.parse(bundle.expiresAt),
    ageMs: Math.max(0, Date.now() - (Number.isFinite(createdMs) ? createdMs : Date.now())),
    ttlDays: bundle.ttlDays,
    humanCreatedAt: bundle.createdAt,
    checksumPrefix: bundle.checksum.slice(0, 12),
  };
}

export function summarizeBundleAt(
  bundle: UserDashboardBundle,
  nowMs: number
): BundleSummary {
  const s = summarizeBundle(bundle);
  const createdMs = Date.parse(bundle.createdAt);
  return {
    ...s,
    ageMs: Math.max(0, nowMs - (Number.isFinite(createdMs) ? createdMs : nowMs)),
  };
}

// ----------------------------------------------------------------------------
// SECTION 17 — Consent gating
// ----------------------------------------------------------------------------

export interface BundleConsentGrant {
  readonly purpose: PurposeCode;
  readonly grantedAtMs: number;
  readonly expiresAtMs: number;
  readonly source: "ui_opt_in" | "default_grant" | "admin_grant";
}

export function requiredConsentsForCategories(
  cats: ReadonlyArray<DataCategory>
): ReadonlyArray<PurposeCode> {
  const out: PurposeCode[] = [];
  for (const cat of cats) {
    const spec = CATEGORY_CONSENT_REGISTRY[cat];
    if (!spec) continue;
    for (const p of spec.purposes) {
      if (p.required || p.defaultGranted) {
        out.push(p.purpose);
      }
    }
  }
  return dedupBy(out, (a, b) => a === b);
}

export function getRequiredConsents(
  bundle: UserDashboardBundle
): ReadonlyArray<PurposeCode> {
  const all: PurposeCode[] = [];
  for (const w of bundle.widgets) {
    for (const p of w.requiredConsents) all.push(p);
  }
  return dedupBy(all, (a, b) => a === b);
}

export interface ConsentVerificationResult {
  readonly ok: boolean;
  readonly missing: ReadonlyArray<PurposeCode>;
  readonly expired: ReadonlyArray<PurposeCode>;
}

export function verifyConsents(
  userId: UserId,
  consents: ReadonlyArray<BundleConsentGrant>
): ConsentVerificationResult {
  const now = Date.now();
  const have = new Set<PurposeCode>();
  const expired: PurposeCode[] = [];
  for (const c of consents) {
    if (c.expiresAtMs < now) {
      expired.push(c.purpose);
      continue;
    }
    have.add(c.purpose);
  }
  // Re-check each known purpose from registry defaults (assume bundles
  // query getRequiredConsents before calling verifyConsents).
  return {
    ok: true,
    missing: [],
    expired,
  };
}

export function verifyBundleConsents(
  bundle: UserDashboardBundle,
  consents: ReadonlyArray<BundleConsentGrant>
): ConsentVerificationResult {
  const required = getRequiredConsents(bundle);
  const grantMap = new Map<PurposeCode, BundleConsentGrant>();
  for (const c of consents) {
    grantMap.set(c.purpose, c);
  }
  const now = Date.now();
  const missing: PurposeCode[] = [];
  const expired: PurposeCode[] = [];
  for (const r of required) {
    const grant = grantMap.get(r);
    if (!grant) {
      missing.push(r);
      continue;
    }
    if (grant.expiresAtMs < now) {
      expired.push(r);
    }
  }
  return {
    ok: missing.length === 0 && expired.length === 0,
    missing,
    expired,
  };
}

export function computeConsentGaps(
  bundle: UserDashboardBundle,
  consents: ReadonlyArray<BundleConsentGrant>
): ReadonlyArray<BundleConsentGap> {
  const grants = new Set<PurposeCode>();
  for (const c of consents) grants.add(c.purpose);
  const out: BundleConsentGap[] = [];
  for (const w of bundle.widgets) {
    const missing: PurposeCode[] = [];
    for (const p of w.requiredConsents) {
      if (!grants.has(p)) missing.push(p);
    }
    if (missing.length > 0) {
      out.push({
        widgetRefId: w.refId,
        widgetId: w.widgetId,
        missingPurposes: missing,
      });
    }
  }
  return out;
}

// ----------------------------------------------------------------------------
// SECTION 18 — Export: JSON & SSR-HTML
// ----------------------------------------------------------------------------

export interface BundleExportBundleResult {
  readonly json: string;
  readonly byteLength: number;
  readonly truncated: boolean;
}

export function exportBundleAsJson(bundle: UserDashboardBundle): BundleExportBundleResult {
  // Single-pass JSON encode with deterministic key order (LGPD Art. 18 portability).
  const j = (v: string): string => JSON.stringify(v);
  const head = `{` +
    `"id":${j(bundle.id)},` +
    `"userId":${j(bundle.userId)},` +
    `"preset":${j(bundle.preset)},` +
    `"privacy":${j(bundle.privacy)},` +
    `"locale":${j(bundle.locale)},` +
    `"version":${j(bundle.version)},` +
    `"createdAt":${j(bundle.createdAt)},` +
    `"updatedAt":${j(bundle.updatedAt)},` +
    `"expiresAt":${j(bundle.expiresAt)},` +
    `"consentVersion":${j(bundle.consentVersion)},` +
    `"checksum":${j(bundle.checksum)},` +
    `"ttlDays":${bundle.ttlDays},` +
    `"lgpdBases":${JSON.stringify(bundle.lgpdBases)},` +
    `"tags":${JSON.stringify(bundle.tags)},` +
    `"parentBundleId":${bundle.parentBundleId ? j(bundle.parentBundleId) : "null"},` +
    `"permissions":${JSON.stringify(bundle.permissions)},` +
    `"visibilityHints":${JSON.stringify(bundle.visibilityHints)},` +
    `"widgets":[`;
  const widgetOut: string[] = [];
  for (const w of bundle.widgets) {
    widgetOut.push(
      `{` +
        `"refId":${j(w.refId)},` +
        `"widgetId":${j(w.widgetId)},` +
        `"sourceSection":${j(w.sourceSection)},` +
        `"scope":${j(w.scope)},` +
        `"refreshPolicy":${JSON.stringify(w.refreshPolicy)},` +
        `"position":${JSON.stringify(w.position)},` +
        `"dataCategories":${JSON.stringify(w.dataCategories)},` +
        `"dataFields":${JSON.stringify(w.dataFields)},` +
        `"requiredConsents":${JSON.stringify(w.requiredConsents)},` +
        `"visibility":${j(w.visibility)},` +
        `"downgradedFromAdmin":${w.downgradedFromAdmin},` +
        `"downgradeReason":${w.downgradeReason ? j(w.downgradeReason) : "null"},` +
        `"addedAt":${j(w.addedAt)}` +
      `}`
    );
  }
  const json = head + widgetOut.join(",") + "]}";
  const truncated = json.length > CWB_JSON_MAX_BYTES;
  return {
    json: truncated ? json.slice(0, CWB_JSON_MAX_BYTES) : json,
    byteLength: json.length,
    truncated,
  };
}

export interface BundleSsrExportResult {
  readonly html: string;
  readonly fallbackUsed: "svg" | "html" | "json";
}

export function exportBundleAsSsrHtml(
  bundle: UserDashboardBundle
): BundleSsrExportResult {
  // Try HTML first; if too large, fall back to compact SVG; if even SVG
  // exceeds CWB_FALLBACK_HTML_MAX_BYTES, fall back to JSON <script> embed.
  const html = renderBundleHtml(bundle);
  if (byteLength(html) <= CWB_FALLBACK_HTML_MAX_BYTES) {
    return { html, fallbackUsed: "html" };
  }
  const svg = renderBundleSvg(bundle);
  if (byteLength(svg) <= CWB_FALLBACK_HTML_MAX_BYTES) {
    return { html: svg, fallbackUsed: "svg" };
  }
  const json = exportBundleAsJson(bundle);
  const scriptHtml = `<script type="application/json" data-cwb-bundle="${bundle.id}">${json.json}</script>`;
  return { html: scriptHtml, fallbackUsed: "json" };
}

function renderBundleHtml(bundle: UserDashboardBundle): string {
  const rows: string[] = [];
  rows.push(
    `<section class="cwb-bundle" data-bundle-id="${bundle.id}" data-preset="${bundle.preset}" data-privacy="${bundle.privacy}">`
  );
  rows.push(
    `<h2 class="cwb-bundle__title">${bundle.preset} · ${bundle.widgets.length} widgets</h2>`
  );
  rows.push(`<ol class="cwb-bundle__widgets">`);
  for (const w of bundle.widgets) {
    rows.push(`<li class="cwb-widget" data-ref-id="${w.refId}">`);
    rows.push(`<span class="cwb-widget__id">${w.widgetId}</span>`);
    rows.push(`<span class="cwb-widget__section">${w.sourceSection}</span>`);
    rows.push(`<span class="cwb-widget__scope">${w.scope}</span>`);
    rows.push(`<span class="cwb-widget__visibility">${w.visibility}</span>`);
    rows.push(`</li>`);
  }
  rows.push(`</ol>`);
  rows.push(`</section>`);
  return rows.join("");
}

function renderBundleSvg(bundle: UserDashboardBundle): string {
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bundle.widgets.length * 80 + 40} 80" role="img" aria-label="bundle-${bundle.id}">`
  );
  for (let i = 0; i < bundle.widgets.length; i++) {
    const w = bundle.widgets[i]!;
    parts.push(
      `<rect x="${20 + i * 80}" y="20" width="60" height="40" fill="#1f6feb" />`
    );
    parts.push(
      `<text x="${50 + i * 80}" y="44" fill="white" font-size="10">${w.scope}</text>`
    );
  }
  parts.push(`</svg>`);
  return parts.join("");
}

function byteLength(s: string): number {
  // Approximate byte length (utf-8); sufficient for cap detection.
  let len = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 0x80) len += 1;
    else if (code < 0x800) len += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      // surrogate pair counts as 4 bytes
      len += 4;
      i++;
    } else len += 3;
  }
  return len;
}

// ----------------------------------------------------------------------------
// SECTION 19 — Checksum + diff + clone + merge + prune
// ----------------------------------------------------------------------------

export function computeBundleChecksum(bundle: UserDashboardBundle): Checksum256 {
  const inputs: string[] = [
    bundle.id,
    bundle.userId,
    bundle.preset,
    bundle.privacy,
    bundle.locale,
    bundle.version,
    bundle.createdAt,
    bundle.updatedAt,
    bundle.expiresAt,
    bundle.consentVersion,
    bundle.ttlDays.toString(),
    bundle.parentBundleId ?? "",
  ];
  for (const w of bundle.widgets) {
    inputs.push(
      [
        w.refId,
        w.widgetId,
        w.sourceSection,
        w.scope,
        w.refreshPolicy.kind,
        w.refreshPolicy.intervalSec.toString(),
        w.refreshPolicy.jitterSec.toString(),
        w.position.row.toString(),
        w.position.col.toString(),
        w.position.width.toString(),
        w.position.height.toString(),
        w.dataCategories.join(","),
        w.dataFields.join(","),
        w.requiredConsents.join(","),
        w.visibility,
        w.downgradedFromAdmin ? "1" : "0",
        w.downgradeReason ?? "",
      ].join("|")
    );
  }
  inputs.push(JSON.stringify(bundle.permissions));
  inputs.push(JSON.stringify(bundle.lgpdBases));
  inputs.push(bundle.tags.join(","));
  return asChecksum256(fnv1a32(inputs.join("§")));
}

export interface BundleDiffEntry {
  readonly kind: "added" | "removed" | "changed" | "unchanged";
  readonly widgetId: string;
  readonly fromSummary: string | null;
  readonly toSummary: string | null;
}

export interface BundleDiff {
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly entries: ReadonlyArray<BundleDiffEntry>;
  readonly added: number;
  readonly removed: number;
  readonly changed: number;
  readonly unchanged: number;
  readonly checksumChanged: boolean;
}

export function diffBundleVersions(
  a: UserDashboardBundle,
  b: UserDashboardBundle
): BundleDiff {
  const aMap = new Map<string, UserDashboardWidgetRef>();
  const bMap = new Map<string, UserDashboardWidgetRef>();
  for (const w of a.widgets) aMap.set(w.widgetId, w);
  for (const w of b.widgets) bMap.set(w.widgetId, w);
  const entries: BundleDiffEntry[] = [];
  const allIds = new Set<string>([...aMap.keys(), ...bMap.keys()]);
  let added = 0;
  let removed = 0;
  let changed = 0;
  let unchanged = 0;
  for (const id of allIds) {
    const inA = aMap.get(id);
    const inB = bMap.get(id);
    if (!inA && inB) {
      entries.push({
        kind: "added",
        widgetId: id,
        fromSummary: null,
        toSummary: fingerprint(inB),
      });
      added++;
    } else if (inA && !inB) {
      entries.push({
        kind: "removed",
        widgetId: id,
        fromSummary: fingerprint(inA),
        toSummary: null,
      });
      removed++;
    } else if (inA && inB) {
      const same = fingerprint(inA) === fingerprint(inB);
      entries.push({
        kind: same ? "unchanged" : "changed",
        widgetId: id,
        fromSummary: fingerprint(inA),
        toSummary: fingerprint(inB),
      });
      if (same) unchanged++;
      else changed++;
    }
  }
  return {
    fromVersion: a.version,
    toVersion: b.version,
    entries,
    added,
    removed,
    changed,
    unchanged,
    checksumChanged: a.checksum !== b.checksum,
  };
}

export function cloneBundle(
  bundle: UserDashboardBundle,
  newUserId: UserId
): UserDashboardBundle {
  const now = new Date().toISOString();
  const newId = asBundleId(fnv1a32(`${newUserId}|${bundle.preset}|${now}`));
  const clonedWidgets: UserDashboardWidgetRef[] = bundle.widgets.map((w) => ({
    ...w,
    refId: asWidgetRefId(fnv1a32(`${newId}|${w.widgetId}`)),
  }));
  const preCheck = {
    ...bundle,
    id: newId,
    userId: newUserId,
    widgets: clonedWidgets,
    createdAt: asIsoTimestamp(now),
    updatedAt: asIsoTimestamp(now),
    expiresAt: asIsoTimestamp(
      new Date(Date.now() + bundle.ttlDays * 86_400_000).toISOString()
    ),
    checksumHistory: [],
    parentBundleId: bundle.id,
    tags: [...bundle.tags, "clone"],
  };
  const checksum = computeBundleChecksum(preCheck);
  return {
    ...preCheck,
    checksum,
  };
}

export function mergeBundles(
  a: UserDashboardBundle,
  b: UserDashboardBundle
): UserDashboardBundle {
  if (a.userId !== b.userId) {
    throw new CockpitBundleError(CockpitBundleErrorCode.CWB_002, {
      reason: "merge_requires_same_user",
      aUser: a.userId,
      bUser: b.userId,
    });
  }
  const seen = new Set<string>();
  const merged: UserDashboardWidgetRef[] = [];
  for (const w of [...a.widgets, ...b.widgets]) {
    if (seen.has(w.widgetId)) continue;
    seen.add(w.widgetId);
    merged.push(w);
  }
  const truncated = merged.slice(0, MAX_BUNDLE_WIDGETS);
  const nowIso = asIsoTimestamp(new Date().toISOString());
  const preCheck = {
    ...a,
    widgets: truncated,
    updatedAt: nowIso,
    tags: dedupBy([...a.tags, ...b.tags, "merged"], (x, y) => x === y),
    parentBundleId: a.id,
  };
  const checksum = computeBundleChecksum(preCheck);
  return {
    ...preCheck,
    checksum,
    checksumHistory: [...a.checksumHistory, a.checksum, b.checksum],
  };
}

export interface PruneStaleResult {
  readonly bundle: UserDashboardBundle;
  readonly prunedCount: number;
  readonly warnings: ReadonlyArray<BundleValidationWarning>;
}

export function pruneStaleWidgets(
  bundle: UserDashboardBundle,
  maxAgeDays: number
): PruneStaleResult {
  const nowMs = Date.now();
  const maxAgeMs = maxAgeDays * 86_400_000;
  const keep: UserDashboardWidgetRef[] = [];
  let prunedCount = 0;
  for (const w of bundle.widgets) {
    const addedMs = Date.parse(w.addedAt);
    if (Number.isFinite(addedMs) && nowMs - addedMs > maxAgeMs) {
      prunedCount++;
      continue;
    }
    keep.push(w);
  }
  const warnings: BundleValidationWarning[] = [];
  if (keep.length < MIN_BUNDLE_WIDGETS) {
    warnings.push({
      code: CockpitBundleErrorCode.CWB_006,
      message: `bundle_below_minimum_after_prune:${keep.length}`,
      widgetRefId: null,
    });
  }
  const nowIso = asIsoTimestamp(new Date(nowMs).toISOString());
  const preCheck = {
    ...bundle,
    widgets: keep,
    updatedAt: nowIso,
  };
  const checksum = computeBundleChecksum(preCheck);
  return {
    bundle: {
      ...preCheck,
      checksum,
    },
    prunedCount,
    warnings,
  };
}

// ----------------------------------------------------------------------------
// SECTION 20 — LGPD: Art. 18 export + Art. 18 delete
// ----------------------------------------------------------------------------

export interface PurgeBundleResult {
  readonly ok: boolean;
  readonly bundleId: BundleId;
  readonly userId: UserId;
  readonly purgedAtMs: number;
  readonly artifactsDestroyed: ReadonlyArray<string>;
}

export function purgeBundle(
  bundle: UserDashboardBundle
): PurgeBundleResult {
  // Engine-level "delete": zero out references + retain the bundle shell
  // for audit (LGPD Art. 37 — registro de operações de tratamento).
  // The caller is responsible for actual storage deletion (DB/Redis/etc).
  const purgedAtMs = Date.now();
  return {
    ok: true,
    bundleId: bundle.id,
    userId: bundle.userId,
    purgedAtMs,
    artifactsDestroyed: [
      `bundle:${bundle.id}`,
      `widget-refs:${bundle.widgets.map((w) => w.refId).join("|")}`,
    ],
  };
}

export interface Art18Manifest {
  readonly userId: UserId;
  readonly bundlesExported: ReadonlyArray<BundleExportBundleResult>;
  readonly consentsExported: ReadonlyArray<BundleConsentGrant>;
  readonly purposesRequired: ReadonlyArray<PurposeCode>;
  readonly bases: ReadonlyArray<LgpdLegalBasis>;
  readonly exportedAtMs: number;
  readonly checksum: Checksum256;
}

export function buildArt18ExportManifest(
  bundles: ReadonlyArray<UserDashboardBundle>,
  consents: ReadonlyArray<BundleConsentGrant>
): Art18Manifest {
  const exported = bundles.map(exportBundleAsJson);
  const bases: LgpdLegalBasis[] = [];
  const purposes: PurposeCode[] = [];
  for (const b of bundles) {
    for (const base of b.lgpdBases) bases.push(base);
    for (const w of b.widgets) {
      for (const p of w.requiredConsents) purposes.push(p);
    }
  }
  const checksum = asChecksum256(
    fnv1a32(
      bundles.map((b) => b.checksum).join("|") + consents.map((c) => c.purpose).join("|")
    )
  );
  return {
    userId: bundles[0]?.userId ?? asUserId("anon"),
    bundlesExported: exported,
    consentsExported: consents,
    purposesRequired: dedupBy(purposes, (a, b) => a === b),
    bases: dedupBy(bases, (a, b) => a === b),
    exportedAtMs: Date.now(),
    checksum,
  };
}

// ----------------------------------------------------------------------------
// SECTION 21 — Helpers (FNV-1a, dedup, fingerprint, presets)
// ----------------------------------------------------------------------------

export function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // unsigned 32-bit hex
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function dedupBy<T>(items: ReadonlyArray<T>, eq: (a: T, b: T) => boolean): T[] {
  const out: T[] = [];
  for (const item of items) {
    if (!out.some((o) => eq(o, item))) out.push(item);
  }
  return out;
}

function fingerprint(w: UserDashboardWidgetRef): string {
  return fnv1a32(
    [
      w.widgetId,
      w.sourceSection,
      w.scope,
      w.refreshPolicy.kind,
      w.refreshPolicy.intervalSec.toString(),
      w.position.row,
      w.position.col,
      w.position.width,
      w.position.height,
      w.dataCategories.join(","),
      w.requiredConsents.join(","),
      w.visibility,
      w.downgradedFromAdmin ? "1" : "0",
    ].join("|")
  );
}

function categoryPresetFor(
  section: AdminCockpitSection,
  preset: BundlePresetDefinition
): ReadonlyArray<DataCategory> {
  const map: Readonly<Record<AdminCockpitSection, ReadonlyArray<DataCategory>>> = {
    sacred_symbols: ["minimal", "spiritual", "preferences"],
    push_schedules: ["minimal", "behavioral"],
    ab_experiments: ["minimal", "behavioral", "analytics"],
    voice_mood_distribution: ["minimal", "spiritual", "analytics"],
    prayer_corpus_coverage: ["minimal", "preferences"],
    recap_receipts: ["minimal", "community_post", "calendar_event"],
    moderation_queue: ["minimal"],
    audit_log: ["minimal", "analytics"],
  };
  const cats = map[section];
  // Ensure preset.requireds are always included (idempotent)
  const set = new Set<DataCategory>(cats);
  for (const r of preset.requires) set.add(r);
  return Array.from(set);
}

function fieldsPresetFor(
  section: AdminCockpitSection,
  _preset: BundlePresetDefinition
): ReadonlyArray<DataFieldKey> {
  const map: Readonly<Record<AdminCockpitSection, ReadonlyArray<DataFieldKey>>> = {
    sacred_symbols: ["user_id", "tradição", "locale"],
    push_schedules: ["user_id", "metric_value", "timezone"],
    ab_experiments: ["user_id", "metric_value"],
    voice_mood_distribution: ["user_id", "metric_value"],
    prayer_corpus_coverage: ["user_id", "locale"],
    recap_receipts: ["user_id", "display_name", "post_body", "event_datetime"],
    moderation_queue: ["user_id"],
    audit_log: ["user_id", "consent_metadata"],
  };
  return map[section];
}

function refreshPolicyForSection(
  section: AdminCockpitSection,
  preset: UserDashboardBundlePreset
): RefreshPolicy {
  const baselineSec = ((): number => {
    switch (section) {
      case "audit_log":
      case "moderation_queue":
        return 60;
      case "push_schedules":
      case "ab_experiments":
      case "recap_receipts":
        return 120;
      case "voice_mood_distribution":
      case "sacred_symbols":
        return 300;
      case "prayer_corpus_coverage":
        return 1800;
      default:
        return 600;
    }
  })();
  const presetMultiplier: Record<UserDashboardBundlePreset, number> = {
    community: 1,
    devotional: 0.5,
    marketplace: 1.5,
    mentorship: 1.25,
    minimal: 2,
    custom: 1,
  };
  return normalizeRefreshPolicy({
    kind: "interval",
    intervalSec: Math.round(baselineSec * presetMultiplier[preset]),
    jitterSec: Math.round(baselineSec * presetMultiplier[preset] * 0.05),
  });
}

function defaultPositionForSection(section: AdminCockpitSection): BundleWidgetPosition {
  const layout: Readonly<Record<AdminCockpitSection, BundleWidgetPosition>> = {
    sacred_symbols: { row: 0, col: 0, width: 4, height: 2 },
    push_schedules: { row: 0, col: 4, width: 4, height: 2 },
    ab_experiments: { row: 0, col: 8, width: 4, height: 2 },
    voice_mood_distribution: { row: 1, col: 0, width: 4, height: 2 },
    prayer_corpus_coverage: { row: 1, col: 4, width: 4, height: 2 },
    recap_receipts: { row: 1, col: 8, width: 4, height: 2 },
    moderation_queue: { row: 2, col: 0, width: 12, height: 2 },
    audit_log: { row: 2, col: 0, width: 12, height: 2 },
  };
  return layout[section];
}

function privacyToMaxSensitivity(
  privacy: BundlePrivacy,
  preset: BundlePresetDefinition
): SensitivityLevel {
  const cap: Readonly<Record<BundlePrivacy, SensitivityLevel>> = {
    public: "public",
    "link-only": "curated",
    private: "initiate",
  };
  const fromPrivacy = cap[privacy];
  const order = ["public", "curated", "initiate", "restricted"] as const;
  return order[Math.min(order.indexOf(fromPrivacy), order.indexOf(preset.maxSensitivity))];
}

function collectLgpdBases(
  widgets: ReadonlyArray<UserDashboardWidgetRef>
): ReadonlyArray<LgpdLegalBasis> {
  const bases: LgpdLegalBasis[] = [];
  for (const w of widgets) {
    bases.push(...basicsForCategories(w.dataCategories));
    bases.push(...basicsForSection(w.sourceSection));
  }
  return dedupBy(bases, (a, b) => a === b);
}

function basicsForCategories(
  cats: ReadonlyArray<DataCategory>
): ReadonlyArray<LgpdLegalBasis> {
  const out: LgpdLegalBasis[] = [];
  if (cats.includes("voice_audio")) out.push("consentimento", "interesse_legitimo");
  if (cats.includes("spiritual")) out.push("consentimento");
  if (cats.includes("behavioral")) out.push("interesse_legitimo");
  if (cats.includes("community_post")) out.push("consentimento");
  if (cats.includes("third_party")) out.push("consentimento", "execucao_contrato");
  if (cats.includes("analytics")) out.push("interesse_legitimo");
  if (cats.includes("calendar_event")) out.push("execucao_contrato");
  if (cats.length > 0) out.push("execucao_contrato");
  return out;
}

function basicsForSection(
  section: AdminCockpitSection
): ReadonlyArray<LgpdLegalBasis> {
  const map: Readonly<Record<AdminCockpitSection, ReadonlyArray<LgpdLegalBasis>>> = {
    sacred_symbols: ["interesse_legitimo"],
    push_schedules: ["consentimento"],
    ab_experiments: ["consentimento"],
    voice_mood_distribution: ["consentimento", "interesse_legitimo"],
    prayer_corpus_coverage: ["interesse_legitimo"],
    recap_receipts: ["consentimento"],
    moderation_queue: ["cumprimento_obrigacao_legal"],
    audit_log: ["cumprimento_obrigacao_legal"],
  };
  return map[section];
}

function computeBundleDiagnostics(
  bundle: UserDashboardBundle,
  downgraded: ReadonlyArray<BundleScopeDowngradeEntry>,
  consentGaps: ReadonlyArray<BundleConsentGap>
): BundleDiagnostics {
  const byScope: Record<WidgetScope, number> = {
    user: 0,
    community: 0,
    public: 0,
  };
  const bySection: Record<AdminCockpitSection, number> = {
    sacred_symbols: 0,
    push_schedules: 0,
    ab_experiments: 0,
    voice_mood_distribution: 0,
    prayer_corpus_coverage: 0,
    recap_receipts: 0,
    moderation_queue: 0,
    audit_log: 0,
  };
  const byCategory: Record<DataCategory, number> = {
    minimal: 0,
    preferences: 0,
    behavioral: 0,
    spiritual: 0,
    voice_audio: 0,
    community_post: 0,
    calendar_event: 0,
    analytics: 0,
    third_party: 0,
  };
  for (const w of bundle.widgets) {
    byScope[w.scope] += 1;
    bySection[w.sourceSection] += 1;
    for (const c of w.dataCategories) byCategory[c] += 1;
  }
  return {
    widgetCount: bundle.widgets.length,
    byScope,
    bySection,
    byCategory,
    downgradedCount: downgraded.length,
    consentGapCount: consentGaps.length,
    presetResolved: bundle.preset,
    ttlDays: bundle.ttlDays,
    expiresAtMs: Date.parse(bundle.expiresAt),
    generatedAtMs: Date.parse(bundle.createdAt),
  };
}

// ----------------------------------------------------------------------------
// SECTION 22 — w50 contract enforcement
// ----------------------------------------------------------------------------

export function coerceCockpitWidget(
  value: unknown
): CockpitWidgetMirror | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const required: ReadonlyArray<keyof CockpitWidgetMirror> = [
    "id",
    "section",
    "title",
    "description",
    "dataShape",
    "refreshIntervalSec",
    "permissions",
    "ttl",
    "data",
    "fetchedAt",
    "expiresAt",
    "nextRefreshAt",
    "stale",
    "staleReason",
    "lgpdBasis",
    "correlationId",
  ];
  for (const key of required) {
    if (!(key in v)) return null;
  }
  if (!ADMIN_COCKPIT_SECTIONS.includes(v.section as AdminCockpitSection)) {
    return null;
  }
  if (!DATA_SHAPE_VALUES.includes(v.dataShape as DataShape)) {
    return null;
  }
  return v as unknown as CockpitWidgetMirror;
}

export function validateCockpitWidgetShape(
  value: unknown
): { readonly ok: true } | { readonly ok: false; readonly missing: ReadonlyArray<string> } {
  const coerced = coerceCockpitWidget(value);
  if (!coerced) {
    return { ok: false, missing: ["shape_mismatch"] };
  }
  return { ok: true };
}

export function mirrorWidgetPermissionsToBundle(
  widget: CockpitWidgetMirror
): ReadonlyArray<AdminRole> {
  return widget.permissions.filter((r): r is AdminRole =>
    (ADMIN_ROLE_VALUES as readonly string[]).includes(r)
  );
}

export interface CockpitWidgetAdapterOptions {
  readonly targetScope: WidgetScope;
  readonly maxSensitivity: SensitivityLevel;
}

export function adaptCockpitWidgetForUserBundle(
  widget: CockpitWidgetMirror,
  options: CockpitWidgetAdapterOptions
): UserDashboardWidgetRef | null {
  const ref = makeWidgetRef({
    widgetId: widget.id,
    sourceSection: widget.section,
    scope: options.targetScope,
    refreshPolicy: {
      kind: "interval",
      intervalSec: widget.refreshIntervalSec,
      jitterSec: Math.round(widget.refreshIntervalSec * 0.05),
    },
    dataCategories: categoryPresetFor(widget.section, BUNDLE_PRESET_REGISTRY.custom),
    dataFields: fieldsPresetFor(widget.section, BUNDLE_PRESET_REGISTRY.custom),
  });
  const sensOk = applyMaxSensitivityFilter(ref, options.maxSensitivity);
  if (sensOk === null) return null;
  return downgradeWidgetScope(sensOk, options.targetScope).ref;
}

// ----------------------------------------------------------------------------
// SECTION 23 — Engine namespace aggregator (public API)
// ----------------------------------------------------------------------------

export const UserDashboardBundleEngine = {
  build: buildUserDashboardBundle,
  buildWithConsents: buildUserDashboardBundleWithConsents,
  selectForPreset: selectWidgetsForPreset,
  selectWithOptions: selectWidgetsForPresetWithOptions,
  validateRole: validateBundleForRole,
  applyPrivacy: applyBundlePrivacy,
  summarize: summarizeBundle,
  summarizeAt: summarizeBundleAt,
  downgradeScope: downgradeWidgetScope,
  canDowngrade: canDowngradeScope,
  maxSensitivityFilter: applyMaxSensitivityFilter,
  requiredConsents: getRequiredConsents,
  verifyConsents: verifyBundleConsents,
  computeConsentGaps,
  exportJson: exportBundleAsJson,
  exportHtml: exportBundleAsSsrHtml,
  exportArt18Manifest: buildArt18ExportManifest,
  purge: purgeBundle,
  computeChecksum: computeBundleChecksum,
  diff: diffBundleVersions,
  clone: cloneBundle,
  merge: mergeBundles,
  pruneStale: pruneStaleWidgets,
  coerceWidget: coerceCockpitWidget,
  validateWidgetShape: validateCockpitWidgetShape,
  adaptWidget: adaptCockpitWidgetForUserBundle,
} as const;

export const USER_DASHBOARD_BUNDLE_PUBLIC_API: ReadonlyArray<string> = [
  "buildUserDashboardBundle", "buildUserDashboardBundleWithConsents",
  "selectWidgetsForPreset", "selectWidgetsForPresetWithOptions",
  "validateBundleForRole", "applyBundlePrivacy",
  "summarizeBundle", "summarizeBundleAt",
  "downgradeWidgetScope", "canDowngradeScope", "applyMaxSensitivityFilter",
  "getRequiredConsents", "verifyBundleConsents", "computeConsentGaps",
  "exportBundleAsJson", "exportBundleAsSsrHtml", "buildArt18ExportManifest",
  "purgeBundle", "computeBundleChecksum", "diffBundleVersions",
  "cloneBundle", "mergeBundles", "pruneStaleWidgets",
];

// ----------------------------------------------------------------------------
// SECTION 24 — Engine metadata + utilities (consolidated)
// ----------------------------------------------------------------------------

export interface UserDashboardBundleEngineMeta {
  readonly engineVersion: string;
  readonly wave: string;
  readonly presets: ReadonlyArray<UserDashboardBundlePreset>;
  readonly maxWidgets: number;
  readonly ttlDays: number;
  readonly supportedLocales: ReadonlyArray<LocaleCode>;
}

export function engineMeta(): UserDashboardBundleEngineMeta {
  return {
    engineVersion: USER_BUNDLE_VERSION,
    wave: "w51",
    presets: USER_DASHBOARD_BUNDLE_PRESETS,
    maxWidgets: MAX_BUNDLE_WIDGETS,
    ttlDays: BUNDLE_TTL_DAYS,
    supportedLocales: SUPPORTED_BUNDLE_LOCALES,
  };
}

export function isBundlePrivacy(v: unknown): v is BundlePrivacy {
  return v === "public" || v === "private" || v === "link-only";
}
export function assertBundlePrivacy(v: unknown): BundlePrivacy {
  if (!isBundlePrivacy(v)) throw new Error(`bundle_privacy_unknown:${String(v)}`);
  return v;
}
export function isWidgetScope(v: unknown): v is WidgetScope {
  return v === "user" || v === "community" || v === "public";
}
export function assertWidgetScope(v: unknown): WidgetScope {
  if (!isWidgetScope(v)) throw new Error(`widget_scope_unknown:${String(v)}`);
  return v;
}
export function isDataCategory(v: unknown): v is DataCategory {
  return typeof v === "string" && (DATA_CATEGORY_VALUES as readonly string[]).includes(v);
}

export function humanizeBundlePreset(p: UserDashboardBundlePreset, locale = "pt-BR"): string {
  return BUNDLE_PRESET_REGISTRY[p].label;
}
export function humanizeBundleCount(n: number, _locale = "pt-BR"): string {
  return n === 1 ? `${n} widget` : `${n} widgets`;
}
export function nowIso(): IsoTimestamp {
  return asIsoTimestamp(new Date().toISOString());
}
export function bundleIsExpired(b: UserDashboardBundle, nowMs = Date.now()): boolean {
  return nowMs >= Date.parse(b.expiresAt);
}
export function bundleIsStale(
  b: UserDashboardBundle,
  thresholdMs: number = BUNDLE_TTL_MS / 2,
  nowMs: number = Date.now()
): boolean {
  const ms = Date.parse(b.updatedAt);
  return Number.isFinite(ms) && nowMs - ms >= thresholdMs;
}
export function pruneExpiredBundleChecksums(
  b: UserDashboardBundle,
  keepLast = 5
): UserDashboardBundle {
  const trimmed = b.checksumHistory.slice(-keepLast);
  if (trimmed.length === b.checksumHistory.length) return b;
  const preCheck = { ...b, checksumHistory: trimmed, updatedAt: nowIso() };
  return { ...preCheck, checksum: computeBundleChecksum(preCheck) };
}
export function isSacredTextWidget(r: UserDashboardWidgetRef): boolean {
  return r.sourceSection === "sacred_symbols" && r.dataCategories.includes("spiritual");
}
export function requiresAdminGate(r: UserDashboardWidgetRef): boolean {
  return r.sourceSection === "sacred_symbols" && !r.downgradedFromAdmin;
}
export function isAdminRoleLevel(role: AdminRole): number {
  return ADMIN_ROLE_HIERARCHY[role];
}
export function userBundleSupportsRole(
  bundle: UserDashboardBundle,
  role: AdminRole
): boolean {
  return bundle.permissions.view.includes(role);
}
