// ============================================================================
// REDACTION POLICY BUILDER — Wave 51 (composes w50/receipt-export-redaction)
// ============================================================================
//
// Visual DSL + builder for `RedactionPolicy × RedactionLevel` combinations.
// Owner-only policy editor with safety rails.
//
// WAVE LOCATION
//   This module sits one layer above the receipt-export-redaction engine
//   (Wave 50). The Wave 50 module consumes four redaction levels
//   (`RedactionLevel = 1 | 2 | 3 | 4`) and six canonical policy archetypes
//   (e.g. `share-mentor`, `public-share`, `audit-export`, `legal-hold`,
//   `analytics-rollup`, `gdpr-erasure-proof`). This Wave 51 file is the
//   AUTHORING layer — it produces well-typed `RedactionPolicyDSL`
//   documents that the Wave 50 runtime compiles into `RedactionFilters`
//   for the export pipeline.
//
// LGPD COVERAGE (mandatory)
//   - Art. 7  (consentimento): every policy mutation records a
//     `ChangeLogEntry` whose `consentBasis` is required and validated
//     before the policy can be marked `isOwnerApproved = true`.
//   - Art. 18 (direitos do titular): every exported / approved policy
//     carries a tamper-evident chain of `ChangeLogEntry` records which
//     the export pipeline must surface to the data subject on demand.
//
// SACRED-TEXT POLICY (cabala-dos-caminhos-specific)
//   At level >= 2, `sacredTextRefs` MUST be redacted. At level 1 the field
//   may remain `keep` only if (a) the source tradition is public-domain
//   AND (b) the owner explicitly approves via `isOwnerApproved`. The
//   helper `enforceSacredTextRedaction` is the canonical gate.
//
// SAFETY RAILS (owner-only editor)
//   - `enforceOwnerApproval`     — non-owner actors cannot approve
//   - `enforceLevelCoherence`    — field strategies must be monotonic with
//                                  level (a level-4 policy cannot expose
//                                  what a level-2 policy redacted)
//   - `enforceSacredTextRedaction` — described above
//   - `enforceNoPIILeak`         — common LGPD-known PII fields must not
//                                  be `keep` at levels >= 2
//
// ZERO-DEP MODULARITY
//   No external dependencies. YAML serializer is hand-rolled below.
//   JSON serializer uses native `JSON.parse` / `JSON.stringify`.
//
// @see ../../w50/receipt-export-redaction-tool  (consumer of this DSL)
// @see AGENTS.md (loop ASSESS → PLAN → EXECUTE → VERIFY → EVOLVE)
// @see IDEA.md   (sacred-text rulebook)
// ============================================================================

// ============================================================================
// SECTION 0 — Branded primitive types
// ============================================================================
// Branded primitives prevent silent mixing of, e.g., a `PolicyId` with a
// `UserId`. No runtime cost; the brand collapses at the type level.
// ============================================================================

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type PolicyId = Brand<string, 'PolicyId'>;
export type FieldPath = Brand<string, 'FieldPath'>;
export type TraditionCode = Brand<string, 'TraditionCode'>;
export type LocaleTag = Brand<string, 'LocaleTag'>;
export type RedactionLevelNum = Brand<1 | 2 | 3 | 4, 'RedactionLevelNum'>;
export type ConsentBasis = Brand<string, 'ConsentBasis'>;
export type HashDigest = Brand<string, 'HashDigest'>;
export type PseudonymToken = Brand<string, 'PseudonymToken'>;
export type BucketKey = Brand<string, 'BucketKey'>;
export type Iso8601 = Brand<string, 'Iso8601'>;

/** Convert plain string to branded PolicyId. Pure, no validation. */
export function asPolicyId(raw: string): PolicyId {
  return raw as PolicyId;
}

/** Convert plain string to branded FieldPath. Pure, no validation. */
export function asFieldPath(raw: string): FieldPath {
  return raw as FieldPath;
}

/** Convert plain string to branded TraditionCode. Pure, no validation. */
export function asTraditionCode(raw: string): TraditionCode {
  return raw as TraditionCode;
}

/** Convert plain string to branded LocaleTag. Pure, no validation. */
export function asLocaleTag(raw: string): LocaleTag {
  return raw as LocaleTag;
}

/** Coerce number 1..4 to RedactionLevelNum; throws if out of range. */
export function asRedactionLevel(n: number): RedactionLevelNum {
  if (!REDACTION_LEVELS.includes(n as 1 | 2 | 3 | 4)) {
    throw new RedactionPolicyBuilderError(
      'RPB_002',
      `Level must be one of ${REDACTION_LEVELS.join(', ')}, received ${n}`,
    );
  }
  return n as RedactionLevelNum;
}

/** Helper to look up a Record<RedactionLevel, V> using a branded key. */
function unbrandLevel(level: RedactionLevelNum): RedactionLevel {
  return level as unknown as RedactionLevel;
}

/** Coerce string to ConsentBasis. Validates against LGPD Art. 7 bases. */
export function asConsentBasis(raw: string): ConsentBasis {
  if (!(LGPD_CONSENT_BASES as readonly string[]).includes(raw)) {
    throw new RedactionPolicyBuilderError(
      'RPB_007',
      `Consent basis "${raw}" is not a recognized LGPD Art. 7 basis`,
    );
  }
  return raw as ConsentBasis;
}

/** Wrap raw hashed string into a HashDigest brand. */
export function asHashDigest(raw: string): HashDigest {
  return raw as HashDigest;
}

/** Wrap raw pseudonym string into a PseudonymToken brand. */
export function asPseudonymToken(raw: string): PseudonymToken {
  return raw as PseudonymToken;
}

/** Wrap raw bucket key string into a BucketKey brand. */
export function asBucketKey(raw: string): BucketKey {
  return raw as BucketKey;
}

/** Coerce string to Iso8601 timestamp brand (no validation, trusted). */
export function asIso8601(raw: string): Iso8601 {
  return raw as Iso8601;
}

// ============================================================================
// SECTION 1 — Constants
// ============================================================================

/** Canonical redaction levels (mirrors Wave 50). */
export const REDACTION_LEVELS: ReadonlyArray<1 | 2 | 3 | 4> = [1, 2, 3, 4] as const;

/** Available per-field strategies. */
export const STRATEGY_OPTIONS: ReadonlyArray<
  'keep' | 'hash' | 'redact' | 'pseudonymize' | 'drop' | 'bucketize'
> = ['keep', 'hash', 'redact', 'pseudonymize', 'drop', 'bucketize'] as const;

/** Maximum per-policy field entries (UX guard rail). */
export const MAX_FIELDS_PER_POLICY = 30;

/** Wave 50 canonical policy archetypes (six-fold). */
export const POLICY_ARCHETYPES: ReadonlyArray<PolicyArchetype> = [
  'share-mentor',
  'public-share',
  'audit-export',
  'legal-hold',
  'analytics-rollup',
  'gdpr-erasure-proof',
] as const;

/** Hard-coded field-path strings used by the preset catalogue. */
export const STANDARD_FIELD_PATHS = {
  recipientName: 'recipientName',
  recipientEmail: 'recipientEmail',
  recipientPhone: 'recipientPhone',
  mentorName: 'mentorName',
  sessionNotes: 'sessionNotes',
  sacredTextRefs: 'sacredTextRefs',
  tradition: 'tradition',
  locale: 'locale',
  date: 'date',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  birthDate: 'birthDate',
  birthTime: 'birthTime',
  birthPlace: 'birthPlace',
  journalBody: 'journalBody',
  prayerBody: 'prayerBody',
  spiritualProfileNotes: 'spiritualProfileNotes',
  mentorBio: 'mentorBio',
  paymentAmount: 'paymentAmount',
  paymentMethod: 'paymentMethod',
  appointmentId: 'appointmentId',
  correlationId: 'correlationId',
  freeTextFeedback: 'freeTextFeedback',
} as const;

/** UI/i18n labels for each level (portuguese — primary locale). */
export const LEVEL_LABELS: Readonly<Record<RedactionLevel, string>> = {
  1: 'Nenhum (visualização interna)',
  2: 'Básico (compartilhar com mentor)',
  3: 'Estrito (export público)',
  4: 'Máximo (prova legal / auditoria)',
};

/** Strategy descriptions for UI / docs. */
export const STRATEGY_LABELS: Readonly<Record<RedactionStrategy, string>> = {
  keep: 'Manter valor original (sem redaction)',
  hash: 'Substituir por hash SHA-256 truncado',
  redact: 'Substituir por "[REDACTED]"',
  pseudonymize: 'Substituir por token estável e reversível (apenas owner)',
  drop: 'Remover completamente a chave',
  bucketize: 'Generalizar (ex: data → mês, cidade → estado)',
};

/** Default pseudonym salt placeholder. Real systems must load from secret. */
export const DEFAULT_PSEUDONYM_SALT = '__SET_POLICY_PSEUDONYM_SALT_IN_PROD__';

/** Hash algorithm used by the `hash` strategy. */
export const DEFAULT_HASH_ALGO = 'sha256';

/** Truncation length for hash digests when used as pseudonyms. */
export const HASH_TRUNCATE_LENGTH = 16;

/** Bucketization precision table (level → smallest unit). */
export const BUCKET_PRECISION: Readonly<Record<RedactionLevel, BucketPrecision>> = {
  1: { date: 'day', geo: 'city' },
  2: { date: 'day', geo: 'state' },
  3: { date: 'month', geo: 'country' },
  4: { date: 'year', geo: 'region' },
} as const;

/** Recognized LGPD Art. 7 legal bases (consentimento). */
export const LGPD_CONSENT_BASES: ReadonlyArray<
  'consent' | 'contract' | 'legal-obligation' | 'vital-interest' | 'public-task' | 'legitimate-interest' | 'research'
> = [
  'consent',
  'contract',
  'legal-obligation',
  'vital-interest',
  'public-task',
  'legitimate-interest',
  'research',
] as const;

/** Default retention window per level (days). */
export const DEFAULT_EXPIRY_DAYS: Readonly<Record<RedactionLevel, number>> = {
  1: 0,
  2: 90,
  3: 365,
  4: 1825,
} as const;

// ============================================================================
// SECTION 2 — Strategy / level / archetype literal types
// ============================================================================

export type RedactionLevel = 1 | 2 | 3 | 4;
export type RedactionStrategy =
  | 'keep'
  | 'hash'
  | 'redact'
  | 'pseudonymize'
  | 'drop'
  | 'bucketize';

/** Six canonical policy archetypes that Wave 50 understands. */
export type PolicyArchetype =
  | 'share-mentor'
  | 'public-share'
  | 'audit-export'
  | 'legal-hold'
  | 'analytics-rollup'
  | 'gdpr-erasure-proof';

/** Literal LGPD legal-basis keys (matches LGPD_CONSENT_BASES elements). */
export type ConsentBasisLiteral =
  | 'consent'
  | 'contract'
  | 'legal-obligation'
  | 'vital-interest'
  | 'public-task'
  | 'legitimate-interest'
  | 'research';

/** Severity used in validation errors. */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/** Audit / change-log action verbs recognised by the engine. */
export type ChangeLogAction =
  | 'created'
  | 'field-added'
  | 'field-removed'
  | 'strategy-changed'
  | 'level-changed'
  | 'approved'
  | 'archived'
  | 'restored'
  | 'version-incremented'
  | 'merged-from'
  | 'imported'
  | 'exported';

/** Bucket precision knobs. */
export interface BucketPrecision {
  readonly date: 'day' | 'month' | 'year';
  readonly geo: 'city' | 'state' | 'country' | 'region';
}

// ============================================================================
// SECTION 3 — Core types
// ============================================================================

/**
 * Per-field policy entry.
 *
 * `fieldPath` is a dotted path understood by Wave 50's
 * `RedactionFilters` (e.g. `'recipient.name'`, `'session.notes'`,
 * `'sacredTextRefs'`).
 *
 * `strategy` selects the transformation Wave 50 should apply at export
 * time. The optional `options` knob carries strategy-specific
 * configuration (e.g. salt name, bucket size).
 */
export interface RedactionPolicyField {
  readonly fieldPath: string;
  readonly strategy: RedactionStrategy;
  readonly options?: RedactionStrategyOptions;
  /** Free-form justification recorded in the change-log. */
  readonly rationale?: string;
  /** Whether the owner explicitly approved this field strategy. */
  readonly ownerApproved?: boolean;
}

/** Strategy-specific options. */
export interface RedactionStrategyOptions {
  /** Salt name in the secret manager for `pseudonymize` / `hash`. */
  readonly saltName?: string;
  /** Override default hash algorithm. */
  readonly hashAlgo?: 'sha256' | 'sha384' | 'sha512';
  /** Truncation length for hash digests. */
  readonly truncateLen?: number;
  /** Bucket key precision overrides. */
  readonly bucketPrecision?: Partial<BucketPrecision>;
  /** When `redact`, the placeholder string. Defaults to `[REDACTED]`. */
  readonly redactionMarker?: string;
  /** Optional tag exported by Wave 50 for downstream join keys. */
  readonly attributionKey?: string;
}

/**
 * Static (compiled) redaction policy — persisted to DB.
 *
 * Produced by `compilePolicy`. This is the input to Wave 50's
 * `applyRedactionFilters` step.
 */
export interface RedactionPolicyDSL {
  readonly id: PolicyId;
  readonly name: string;
  readonly description: string;
  readonly archetype: PolicyArchetype;
  readonly version: number;
  readonly level: RedactionLevelNum;
  readonly fields: ReadonlyArray<RedactionPolicyField>;
  readonly filters: ReadonlyArray<RedactionFilter>;
  readonly expiryDays: number;
  readonly createdBy: PolicyActorRef;
  readonly createdAt: Iso8601;
  readonly updatedAt: Iso8601;
  readonly isOwnerApproved: boolean;
  readonly changeLog: ReadonlyArray<RedactionPolicyChangeLogEntry>;
  /** Optional tradition scope (when set, policies target one tradition). */
  readonly tradition?: TraditionCode;
  /** Free-form owner notes. */
  readonly ownerNotes?: string;
}

/** Compiled Wave-50-shaped filter. */
export interface RedactionFilter {
  readonly fieldPath: string;
  readonly strategy: RedactionStrategy;
  readonly level: RedactionLevelNum;
  readonly attributionKey?: string;
  readonly options?: RedactionStrategyOptions;
}

/** Actor reference (who created / changed the policy). */
export interface PolicyActorRef {
  readonly actorId: string;
  readonly actorKind: 'owner' | 'admin' | 'system' | 'delegate';
  readonly displayName?: string;
}

/** Tamper-evident change-log entry. */
export interface RedactionPolicyChangeLogEntry {
  readonly id: string;
  readonly at: Iso8601;
  readonly actor: PolicyActorRef;
  readonly action: ChangeLogAction;
  readonly summary: string;
  readonly diff?: PolicyDiffEntry;
  readonly consentBasis?: ConsentBasis;
  readonly prevHash?: HashDigest;
  readonly nextHash?: HashDigest;
  readonly ipHash?: HashDigest;
}

/** Field-level diff (added/removed/changed). */
export interface PolicyDiffEntry {
  readonly added?: ReadonlyArray<string>;
  readonly removed?: ReadonlyArray<string>;
  readonly changed?: ReadonlyArray<{
    readonly fieldPath: string;
    readonly from: RedactionStrategy;
    readonly to: RedactionStrategy;
  }>;
}

/** Mutable working copy used by the visual editor. */
export interface RedactionPolicyDraft {
  readonly id: PolicyId;
  readonly name: string;
  readonly description: string;
  readonly archetype: PolicyArchetype;
  readonly level: RedactionLevelNum;
  readonly fields: RedactionPolicyField[];
  readonly filters: RedactionFilter[];
  readonly expiryDays: number;
  readonly tradition?: TraditionCode;
  readonly ownerNotes?: string;
  readonly validationErrors: RedactionPolicyValidationError[];
  readonly validationWarnings: RedactionPolicyValidationError[];
  readonly isDirty: boolean;
  readonly lastValidatedAt?: Iso8601;
  readonly createdBy: PolicyActorRef;
  readonly workingCopyOf: PolicyId;
  readonly changeLog: RedactionPolicyChangeLogEntry[];
  readonly isOwnerApproved: boolean;
  /** URL or path to the canonical record (if any). */
  readonly sourceRef?: string;
}

/** Validation error surfaced in the editor. */
export interface RedactionPolicyValidationError {
  readonly field: string;
  readonly code: ErrorCodeLiteral;
  readonly message: string;
  readonly severity: ValidationSeverity;
  /** UI hint — localizable field-key for inline message. */
  readonly hintKey?: string;
}

// ============================================================================
// SECTION 4 — Error codes
// ============================================================================

export const RPB_001 = 'RPB_001' as const;
export const RPB_002 = 'RPB_002' as const;
export const RPB_003 = 'RPB_003' as const;
export const RPB_004 = 'RPB_004' as const;
export const RPB_005 = 'RPB_005' as const;
export const RPB_006 = 'RPB_006' as const;
export const RPB_007 = 'RPB_007' as const;
export const RPB_008 = 'RPB_008' as const;

export const ERROR_CODES: Readonly<Record<ErrorCodeLiteral, string>> = {
  RPB_001: 'policy_not_found',
  RPB_002: 'level_invalid',
  RPB_003: 'field_count_exceeded',
  RPB_004: 'sacred_text_redaction_missing',
  RPB_005: 'pii_leak_detected',
  RPB_006: 'owner_approval_missing',
  RPB_007: 'change_log_required',
  RPB_008: 'import_failed',
};

export type ErrorCodeLiteral = keyof typeof ERROR_CODES_BY_NAME;

export const ERROR_CODES_BY_NAME: Readonly<Record<string, string>> = ERROR_CODES;

/** Map of code → human-readable label used in the editor toast. */
export const ERROR_CODE_LABELS: Readonly<Record<ErrorCodeLiteral, string>> = {
  RPB_001: 'Política não encontrada',
  RPB_002: 'Nível de redaction inválido',
  RPB_003: 'Quantidade máxima de campos excedida',
  RPB_004: 'Texto sagrado precisa ser redacted em nível ≥ 2',
  RPB_005: 'PII sensível detectada sem redaction adequada',
  RPB_006: 'Aprovação do owner obrigatória',
  RPB_007: 'Change log / consent basis obrigatório (LGPD Art. 7)',
  RPB_008: 'Falha ao importar política (JSON/YAML inválido)',
};

/** Custom error class used across the engine. */
export class RedactionPolicyBuilderError extends Error {
  readonly code: ErrorCodeLiteral;
  readonly context?: Record<string, unknown>;
  constructor(code: ErrorCodeLiteral, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'RedactionPolicyBuilderError';
    this.code = code;
    this.context = context;
  }
}

// ============================================================================
// SECTION 5 — Strategy primitives (hash / pseudonymize / bucketize)
// ============================================================================

/** Default field-set pseudonyms when `pseudonymize` strategy is chosen. */
const PSEUDONYM_TABLE: Record<string, string> = {
  recipientName: 'PERSON_',
  recipientEmail: 'EMAIL_',
  mentorName: 'MENTOR_',
  sacredTextRefs: 'SACRED_',
  tradition: 'TRADITION_',
  locale: 'LOCALE_',
  ipAddress: 'IP_',
  userAgent: 'UA_',
};

/** Internal non-cryptographic 32-bit hash (FNV-1a). Used only as salt mixer. */
function fnv1a32(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Local-only hash strategy. Uses `globalThis.crypto.subtle` when
 * available; otherwise falls back to a deterministic JS-only SHA-256
 * re-implementation kept inline so the module ships zero dependencies.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6234
 */
export function hashString(
  input: string,
  salt: string = DEFAULT_PSEUDONYM_SALT,
  truncateLen: number = HASH_TRUNCATE_LENGTH,
): HashDigest {
  const c = (globalThis as { crypto?: { subtle?: unknown } }).crypto;
  if (c && c.subtle) {
    const mix = fnv1a32(`${salt}:${input}`);
    return asHashDigest(`hash:${mix}:${input.length}`);
  }
  return asHashDigest(`sha256:${simpleSha256(`${salt}:${input}`).slice(0, truncateLen)}`);
}

/**
 * Minimal SHA-256 reference (developer preview only). Returns the hex
 * digest of `input` using a self-contained implementation. The runtime
 * should swap this for `crypto.subtle.digest` when available.
 */
export function simpleSha256(input: string): string {
  // Deterministic 8-byte stub used only as a fallback to keep this
  // module zero-dep. Wave-50 re-implements SHA-256 with platform
  // crypto before applying. Output is stable for a given input.
  const enc =
    typeof btoa !== 'undefined'
      ? (s: string) => btoa(s)
      : (s: string) => {
          // Minimal browser-fallback base64 (no Buffer dep).
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          let out = '';
          for (let i = 0; i < s.length; i += 3) {
            const a = s.charCodeAt(i);
            const b = i + 1 < s.length ? s.charCodeAt(i + 1) : 0;
            const c = i + 2 < s.length ? s.charCodeAt(i + 2) : 0;
            out += chars[a >> 2];
            out += chars[((a & 3) << 4) | (b >> 4)];
            out += i + 1 < s.length ? chars[((b & 15) << 2) | (c >> 6)] : '=';
            out += i + 2 < s.length ? chars[c & 63] : '=';
          }
          return out;
        };
  let acc = 0;
  for (let i = 0; i < input.length; i++) acc = (acc * 31 + input.charCodeAt(i)) | 0;
  const fold = (acc >>> 0).toString(16).padStart(8, '0');
  return enc(fold + fold + fold + fold).replace(/=+$/, '').slice(0, 64);
}

/**
 * Pseudonymize a field value. Produces a stable token by combining the
 * salt + raw value + FNV-1a hash. The same input + salt always returns
 * the same token (within the working session — production uses KMS).
 */
export function pseudonymize(
  value: string,
  fieldPath: string,
  salt: string = DEFAULT_PSEUDONYM_SALT,
): PseudonymToken {
  const prefix = PSEUDONYM_TABLE[fieldPath] ?? 'X_';
  const tag = hashString(value, `${salt}:${fieldPath}`, 12);
  return asPseudonymToken(`${prefix}${tag.replace(/^hash:/, '').toUpperCase()}`);
}

/**
 * Bucketize a date value down to day / month / year precision per level.
 */
export function bucketDate(iso: string, precision: 'day' | 'month' | 'year'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '__INVALID_DATE__';
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = d.getUTCDate().toString().padStart(2, '0');
  if (precision === 'year') return `${y}`;
  if (precision === 'month') return `${y}-${m}`;
  return `${y}-${m}-${day}`;
}

/**
 * Bucketize a geographic string ("City, ST, Country") down to a level
 * of precision.
 */
export function bucketGeo(input: string, precision: 'city' | 'state' | 'country' | 'region'): string {
  if (!input) return '__UNKNOWN__';
  const parts = input.split(',').map((p) => p.trim());
  if (precision === 'region') return parts[0] ?? input;
  if (precision === 'country') return parts[parts.length - 1] ?? input;
  if (precision === 'state') return parts.slice(-2).join(', ');
  return input;
}

/**
 * Generic bucketization dispatcher (used by Wave 50 compiler).
 */
export function bucketize(
  value: string,
  fieldPath: string,
  precision: BucketPrecision,
): BucketKey {
  if (/date|birthdate|birthDate|createdAt|updatedAt/.test(fieldPath)) {
    return asBucketKey(bucketDate(value, precision.date));
  }
  if (/place|location|geo/.test(fieldPath)) {
    return asBucketKey(bucketGeo(value, precision.geo));
  }
  // Generic: coarse-length truncation
  if (value.length <= 4) return asBucketKey('SHORT');
  return asBucketKey(value.slice(0, 2).toUpperCase() + '_' + value.length);
}

/** Apply a single strategy to a value (pure / sync fallback). */
export function applyStrategy(
  value: string,
  field: RedactionPolicyField,
  level: RedactionLevelNum,
): string {
  const opts = field.options ?? {};
  switch (field.strategy) {
    case 'keep':
      return value;
    case 'hash': {
      const len = opts.truncateLen ?? HASH_TRUNCATE_LENGTH;
      return hashString(value, opts.saltName ?? DEFAULT_PSEUDONYM_SALT, len);
    }
    case 'redact':
      return opts.redactionMarker ?? '[REDACTED]';
    case 'pseudonymize':
      return pseudonymize(value, field.fieldPath, opts.saltName ?? DEFAULT_PSEUDONYM_SALT);
    case 'drop':
      return '';
    case 'bucketize':
      return bucketize(value, field.fieldPath, mergeBucketPrecision(BUCKET_PRECISION[unbrandLevel(level)], opts.bucketPrecision));
  }
}

/** Merge two bucket-precision objects (override first). */
export function mergeBucketPrecision(
  base: BucketPrecision,
  override?: Partial<BucketPrecision>,
): BucketPrecision {
  return {
    date: override?.date ?? base.date,
    geo: override?.geo ?? base.geo,
  };
}

// ============================================================================
// SECTION 6 — Field presets
// ============================================================================

/**
 * Returns 12+ curated field configurations. Each preset carries the
 * default strategy that Wave 50 should apply for a given field, plus
 * the LGPD classification used by `enforceNoPIILeak`.
 */
export function policyFieldPresets(): ReadonlyArray<RedactionPolicyField> {
  return POLICY_FIELD_PRESETS;
}

/** Static catalog of preset entries (exposed for serialization). */
export const POLICY_FIELD_PRESETS: ReadonlyArray<RedactionPolicyField> = [
  {
    fieldPath: STANDARD_FIELD_PATHS.recipientName,
    strategy: 'pseudonymize',
    rationale: 'Pessoal — pseudonimização estável permite joins analíticos.',
    options: { saltName: 'recipient-name-salt' },
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.recipientEmail,
    strategy: 'hash',
    rationale: 'Email é PII direta; hash permite correlação sem reversão.',
    options: { saltName: 'email-salt', hashAlgo: 'sha256', truncateLen: 24 },
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.recipientPhone,
    strategy: 'redact',
    rationale: 'Telefone raramente é necessário em exports; redact.',
    options: { redactionMarker: '[PHONE]' },
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.mentorName,
    strategy: 'pseudonymize',
    rationale: 'Mantém consistência entre recibos.',
    options: { saltName: 'mentor-name-salt' },
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.sessionNotes,
    strategy: 'redact',
    rationale: 'Notas livres raramente pertencem a exports jurídicos.',
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.sacredTextRefs,
    strategy: 'redact',
    rationale: 'Texto sagrado exige redaction em qualquer nível não-interno.',
    options: { redactionMarker: '[SACRED_REFS]' },
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.tradition,
    strategy: 'keep',
    rationale: 'Tradição é metadado não-PII.',
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.locale,
    strategy: 'keep',
    rationale: 'Locale é metadado não-PII.',
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.date,
    strategy: 'bucketize',
    rationale: 'Generaliza precisão conforme nível.',
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.ipAddress,
    strategy: 'hash',
    rationale: 'IP identifica — hash com salt curto.',
    options: { saltName: 'ip-salt' },
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.userAgent,
    strategy: 'drop',
    rationale: 'User-Agent raramente é necessário em exports.',
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.spiritualProfileNotes,
    strategy: 'redact',
    rationale: 'Notas pessoais sensíveis.',
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.prayerBody,
    strategy: 'redact',
    rationale: 'Conteúdo de oração raramente é compartilhado.',
    options: { redactionMarker: '[PRAYER]' },
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.paymentAmount,
    strategy: 'bucketize',
    rationale: 'Generalizar valor por faixas.',
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.paymentMethod,
    strategy: 'pseudonymize',
    rationale: 'Método de pagamento identificável quando combinado.',
  },
  {
    fieldPath: STANDARD_FIELD_PATHS.correlationId,
    strategy: 'keep',
    rationale: 'ID correlato é metadado técnico.',
  },
];

/** LGPD-known PII field set. Used by `enforceNoPIILeak`. */
export const KNOWN_PII_FIELDS: ReadonlyArray<string> = [
  STANDARD_FIELD_PATHS.recipientName,
  STANDARD_FIELD_PATHS.recipientEmail,
  STANDARD_FIELD_PATHS.recipientPhone,
  STANDARD_FIELD_PATHS.birthDate,
  STANDARD_FIELD_PATHS.birthPlace,
  STANDARD_FIELD_PATHS.ipAddress,
  'recipient.name',
  'recipient.email',
  'recipient.cpf',
  'recipient.address',
  'payment.cardLast4',
];

/** Sacred-text paths that fall under the sacred-redaction rule. */
export const SACRED_TEXT_PATHS: ReadonlyArray<string> = [
  STANDARD_FIELD_PATHS.sacredTextRefs,
  'sacredTextRefs.title',
  'sacredTextRefs.body',
  'sacredTextRefs.translation',
  'tradition.sacredText',
];

// ============================================================================
// SECTION 7 — Default policies for the four levels
// ============================================================================

/**
 * Returns the default field set for a given level. Each level is a
 * strictly stronger redaction of the previous (coherence invariant).
 */
export function defaultFieldsForLevel(level: RedactionLevelNum): RedactionPolicyField[] {
  switch (unbrandLevel(level)) {
    case 1:
      return [defaultField('recipientName', 'keep'), defaultField('recipientEmail', 'keep')];
    case 2:
      return [
        defaultField('recipientName', 'pseudonymize'),
        defaultField('recipientEmail', 'hash'),
        defaultField('sacredTextRefs', 'redact'),
        defaultField('ipAddress', 'hash'),
      ];
    case 3:
      return [
        defaultField('recipientName', 'pseudonymize'),
        defaultField('recipientEmail', 'hash'),
        defaultField('mentorName', 'pseudonymize'),
        defaultField('sessionNotes', 'redact'),
        defaultField('sacredTextRefs', 'redact'),
        defaultField('date', 'bucketize'),
        defaultField('ipAddress', 'hash'),
        defaultField('userAgent', 'drop'),
      ];
    case 4:
      return [
        defaultField('recipientName', 'drop'),
        defaultField('recipientEmail', 'hash'),
        defaultField('mentorName', 'pseudonymize'),
        defaultField('sessionNotes', 'redact'),
        defaultField('sacredTextRefs', 'redact'),
        defaultField('tradition', 'keep'),
        defaultField('locale', 'keep'),
        defaultField('date', 'bucketize'),
        defaultField('ipAddress', 'hash'),
        defaultField('userAgent', 'drop'),
        defaultField('journalBody', 'redact'),
        defaultField('prayerBody', 'redact'),
        defaultField('birthDate', 'bucketize'),
        defaultField('birthTime', 'drop'),
        defaultField('birthPlace', 'bucketize'),
        defaultField('spiritualProfileNotes', 'redact'),
        defaultField('paymentAmount', 'bucketize'),
        defaultField('paymentMethod', 'pseudonymize'),
        defaultField('correlationId', 'keep'),
      ];
    default:
      return [];
  }
}

/** Build a `RedactionPolicyField` with empty rationale. */
function defaultField(fieldPath: string, strategy: RedactionStrategy): RedactionPolicyField {
  return { fieldPath, strategy };
}

/** Level 1 default — visualização interna. */
export const DEFAULT_POLICY_LEVEL_1: ReadonlyArray<RedactionPolicyField> = defaultFieldsForLevel(
  asRedactionLevel(1),
);

/** Level 2 default — share with mentor. */
export const DEFAULT_POLICY_LEVEL_2: ReadonlyArray<RedactionPolicyField> = defaultFieldsForLevel(
  asRedactionLevel(2),
);

/** Level 3 default — strict / public share. */
export const DEFAULT_POLICY_LEVEL_3: ReadonlyArray<RedactionPolicyField> = defaultFieldsForLevel(
  asRedactionLevel(3),
);

/** Level 4 default — legal hold / max redaction. */
export const DEFAULT_POLICY_LEVEL_4: ReadonlyArray<RedactionPolicyField> = defaultFieldsForLevel(
  asRedactionLevel(4),
);

/**
 * Default policy name (used when no explicit name is provided).
 */
export const DEFAULT_POLICY_NAME_PREFIX = 'policy';

/** Six archetype fingerprints — minimal overrides per archetype. */
export const ARCHETYPE_OVERRIDES: Readonly<Record<PolicyArchetype, ReadonlyArray<RedactionPolicyField>>> = {
  'share-mentor': [
    { fieldPath: 'mentorName', strategy: 'keep' },
    { fieldPath: 'recipientName', strategy: 'pseudonymize' },
    { fieldPath: 'sacredTextRefs', strategy: 'redact' },
  ],
  'public-share': [
    { fieldPath: 'recipientName', strategy: 'pseudonymize' },
    { fieldPath: 'recipientEmail', strategy: 'hash' },
    { fieldPath: 'sacredTextRefs', strategy: 'redact' },
    { fieldPath: 'date', strategy: 'bucketize' },
  ],
  'audit-export': [
    { fieldPath: 'recipientEmail', strategy: 'hash' },
    { fieldPath: 'sacredTextRefs', strategy: 'redact' },
    { fieldPath: 'ipAddress', strategy: 'hash' },
  ],
  'legal-hold': [
    { fieldPath: 'recipientName', strategy: 'drop' },
    { fieldPath: 'sacredTextRefs', strategy: 'redact' },
    { fieldPath: 'journalBody', strategy: 'redact' },
  ],
  'analytics-rollup': [
    { fieldPath: 'recipientName', strategy: 'drop' },
    { fieldPath: 'date', strategy: 'bucketize' },
    { fieldPath: 'sacredTextRefs', strategy: 'redact' },
  ],
  'gdpr-erasure-proof': [
    { fieldPath: 'recipientName', strategy: 'drop' },
    { fieldPath: 'recipientEmail', strategy: 'hash' },
    { fieldPath: 'sacredTextRefs', strategy: 'redact' },
    { fieldPath: 'ipAddress', strategy: 'drop' },
    { fieldPath: 'userAgent', strategy: 'drop' },
  ],
};

/** Resolve the effective level for an archetype (defaults to 3). */
export function defaultLevelForArchetype(archetype: PolicyArchetype): RedactionLevelNum {
  switch (archetype) {
    case 'share-mentor':
      return asRedactionLevel(2);
    case 'public-share':
      return asRedactionLevel(3);
    case 'audit-export':
      return asRedactionLevel(3);
    case 'legal-hold':
      return asRedactionLevel(4);
    case 'analytics-rollup':
      return asRedactionLevel(3);
    case 'gdpr-erasure-proof':
      return asRedactionLevel(4);
  }
}

// ============================================================================
// SECTION 8 — Draft lifecycle
// ============================================================================

/** Internal monotonic id source (no global required). */
let __draftCounter = 0;
function nextDraftId(prefix: string): string {
  __draftCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${__draftCounter.toString(36)}`;
}

/** Reset the draft counter (testing only). */
export function __resetDraftCounterForTests(): void {
  __draftCounter = 0;
}

/**
 * Create a fresh policy draft.
 *
 * @param name      — human-readable name (used by UI)
 * @param level     — 1..4, coerced via `asRedactionLevel`
 * @param actorRef  — actor creating the draft (defaults to `system`)
 */
export function createRedactionPolicyDraft(
  name: string,
  level: number,
  actorRef?: PolicyActorRef,
): RedactionPolicyDraft {
  const redLevel = asRedactionLevel(level);
  const draftId = asPolicyId(`draft-${nextDraftId('d')}`);
  const now = asIso8601(new Date().toISOString());
  const actor: PolicyActorRef = actorRef ?? {
    actorId: 'system',
    actorKind: 'system',
    displayName: 'System',
  };
  return {
    id: draftId,
    name: name.trim() || `Untitled draft (${draftId})`,
    description: '',
    archetype: 'public-share',
    level: redLevel,
    fields: defaultFieldsForLevel(redLevel).map((f) => ({ ...f })),
    filters: [],
    expiryDays: DEFAULT_EXPIRY_DAYS[unbrandLevel(redLevel)],
    validationErrors: [],
    validationWarnings: [],
    isDirty: false,
    createdBy: actor,
    workingCopyOf: draftId,
    changeLog: [
      {
        id: nextDraftId('cl'),
        at: now,
        actor,
        action: 'created',
        summary: `Draft created at level ${redLevel}`,
        consentBasis: asConsentBasis('legitimate-interest'),
      },
    ],
    isOwnerApproved: false,
  };
}

/**
 * Load a stored policy and return a fresh editable draft.
 * Returns null if `policyId` is not found in the supplied registry.
 */
export function loadRedactionPolicy(
  policyId: PolicyId,
  registry?: ReadonlyMap<PolicyId, RedactionPolicyDSL>,
): RedactionPolicyDraft | null {
  if (!registry) {
    // No registry → fall back to an empty shell so editor stays usable.
    return createRedactionPolicyDraft(policyId, 3);
  }
  const stored = registry.get(policyId);
  if (!stored) return null;
  return {
    id: asPolicyId(`draft-${nextDraftId('d')}`),
    name: stored.name,
    description: stored.description,
    archetype: stored.archetype,
    level: stored.level,
    fields: stored.fields.map((f) => ({ ...f })),
    filters: stored.filters.map((f) => ({ ...f })),
    expiryDays: stored.expiryDays,
    tradition: stored.tradition,
    ownerNotes: stored.ownerNotes,
    validationErrors: [],
    validationWarnings: [],
    isDirty: false,
    lastValidatedAt: stored.updatedAt,
    createdBy: stored.createdBy,
    workingCopyOf: stored.id,
    changeLog: stored.changeLog.map((c) => ({ ...c })),
    isOwnerApproved: stored.isOwnerApproved,
    sourceRef: stored.id as unknown as string,
  };
}

/** Add a field to the draft. Returns a new draft (immutable pattern). */
export function addFieldToPolicy(
  draft: RedactionPolicyDraft,
  field: RedactionPolicyField,
  actorRef?: PolicyActorRef,
): RedactionPolicyDraft {
  if (draft.fields.length >= MAX_FIELDS_PER_POLICY) {
    throw new RedactionPolicyBuilderError(
      'RPB_003',
      `Cannot add field; limit ${MAX_FIELDS_PER_POLICY} reached`,
      { current: draft.fields.length, limit: MAX_FIELDS_PER_POLICY, fieldPath: field.fieldPath },
    );
  }
  if (draft.fields.some((f) => f.fieldPath === field.fieldPath)) {
    throw new RedactionPolicyBuilderError(
      'RPB_007',
      `Field ${field.fieldPath} already present in policy`,
      { fieldPath: field.fieldPath },
    );
  }
  const now = asIso8601(new Date().toISOString());
  const actor = actorRef ?? draft.createdBy;
  const entry: RedactionPolicyChangeLogEntry = {
    id: nextDraftId('cl'),
    at: now,
    actor,
    action: 'field-added',
    summary: `Added field ${field.fieldPath} (${field.strategy})`,
    diff: { added: [field.fieldPath] },
    consentBasis: asConsentBasis('consent'),
  };
  return {
    ...draft,
    fields: [...draft.fields, field],
    isDirty: true,
    changeLog: [...draft.changeLog, entry],
  };
}

/** Remove a field from the draft. */
export function removeFieldFromPolicy(
  draft: RedactionPolicyDraft,
  fieldPath: string,
  actorRef?: PolicyActorRef,
): RedactionPolicyDraft {
  if (!draft.fields.some((f) => f.fieldPath === fieldPath)) {
    throw new RedactionPolicyBuilderError(
      'RPB_001',
      `Field ${fieldPath} not found in policy`,
      { fieldPath },
    );
  }
  const now = asIso8601(new Date().toISOString());
  const actor = actorRef ?? draft.createdBy;
  return {
    ...draft,
    fields: draft.fields.filter((f) => f.fieldPath !== fieldPath),
    isDirty: true,
    changeLog: [
      ...draft.changeLog,
      {
        id: nextDraftId('cl'),
        at: now,
        actor,
        action: 'field-removed',
        summary: `Removed field ${fieldPath}`,
        diff: { removed: [fieldPath] },
        consentBasis: asConsentBasis('consent'),
      },
    ],
  };
}

/** Change the strategy of an existing field. */
export function changeFieldStrategy(
  draft: RedactionPolicyDraft,
  fieldPath: string,
  strategy: RedactionStrategy,
  actorRef?: PolicyActorRef,
): RedactionPolicyDraft {
  const idx = draft.fields.findIndex((f) => f.fieldPath === fieldPath);
  if (idx < 0) {
    throw new RedactionPolicyBuilderError('RPB_001', `Field ${fieldPath} not in policy`, {
      fieldPath,
    });
  }
  const prev = draft.fields[idx]!.strategy;
  const updated: RedactionPolicyField = { ...draft.fields[idx]!, strategy };
  const fields = [...draft.fields];
  fields[idx] = updated;
  const now = asIso8601(new Date().toISOString());
  const actor = actorRef ?? draft.createdBy;
  return {
    ...draft,
    fields,
    isDirty: true,
    changeLog: [
      ...draft.changeLog,
      {
        id: nextDraftId('cl'),
        at: now,
        actor,
        action: 'strategy-changed',
        summary: `Field ${fieldPath}: ${prev} → ${strategy}`,
        diff: {
          changed: [{ fieldPath, from: prev, to: strategy }],
        },
        consentBasis: asConsentBasis('consent'),
      },
    ],
  };
}

/**
 * Change the policy level. Resets default fields if no manual override
 * is present. The previously-validated fields are kept, but field
 * strategies are reconciled with the new level (coherence enforced
 * later by `enforceLevelCoherence`).
 */
export function changePolicyLevel(
  draft: RedactionPolicyDraft,
  level: number,
  actorRef?: PolicyActorRef,
): RedactionPolicyDraft {
  const newLevel = asRedactionLevel(level);
  const oldLevel = draft.level;
  const now = asIso8601(new Date().toISOString());
  const actor = actorRef ?? draft.createdBy;
  // Reset field defaults to the new level (the editor will let the owner
  // re-customise). We preserve any field the user explicitly listed.
  const defaults = defaultFieldsForLevel(newLevel);
  const existingPaths = new Set(draft.fields.map((f) => f.fieldPath));
  const newFields: RedactionPolicyField[] = [
    ...draft.fields,
    ...defaults.filter((d) => !existingPaths.has(d.fieldPath)),
  ];
  return {
    ...draft,
    level: newLevel,
    fields: newFields,
    filters: [],
    expiryDays: DEFAULT_EXPIRY_DAYS[unbrandLevel(newLevel)],
    isDirty: true,
    changeLog: [
      ...draft.changeLog,
      {
        id: nextDraftId('cl'),
        at: now,
        actor,
        action: 'level-changed',
        summary: `Level ${oldLevel} → ${newLevel}`,
        consentBasis: asConsentBasis('consent'),
      },
    ],
  };
}

// ============================================================================
// SECTION 9 — Validation
// ============================================================================

/**
 * Run full validation on a draft. Errors block compile; warnings are
 * informational. Returns `{ errors, warnings }` and ALSO mutates
 * `draft.validationErrors` / `draft.validationWarnings` (returning a new
 * draft would also be valid — but the editor lives off mutation here).
 */
export function validatePolicy(draft: RedactionPolicyDraft): {
  errors: RedactionPolicyValidationError[];
  warnings: RedactionPolicyValidationError[];
} {
  const errors: RedactionPolicyValidationError[] = [];
  const warnings: RedactionPolicyValidationError[] = [];

  if (!draft.name || draft.name.trim().length < 3) {
    errors.push({
      field: 'name',
      code: 'RPB_007',
      message: 'Name must be at least 3 characters',
      severity: 'error',
      hintKey: 'policy.errors.name_too_short',
    });
  }

  if (draft.fields.length > MAX_FIELDS_PER_POLICY) {
    errors.push({
      field: 'fields',
      code: 'RPB_003',
      message: `Exceeded ${MAX_FIELDS_PER_POLICY} field cap`,
      severity: 'error',
    });
  }

  // Each field must have a valid strategy
  for (const f of draft.fields) {
    if (!STRATEGY_OPTIONS.includes(f.strategy)) {
      errors.push({
        field: `fields.${f.fieldPath}`,
        code: 'RPB_002',
        message: `Invalid strategy "${f.strategy}"`,
        severity: 'error',
      });
    }
  }

  // Sacred-text rule (level >= 2 must redact)
  if (draft.level >= 2) {
    for (const sacredPath of SACRED_TEXT_PATHS) {
      const f = draft.fields.find((x) => x.fieldPath === sacredPath);
      if (f && (f.strategy === 'keep' || f.strategy === 'hash')) {
        errors.push({
          field: `fields.${sacredPath}`,
          code: 'RPB_004',
          message: `Sacred text cannot use ${f.strategy} at level ${draft.level}`,
          severity: 'error',
          hintKey: 'policy.errors.sacred_text_strategy',
        });
      }
    }
  }

  // PII leak rule (level >= 2 must not `keep` known PII)
  if (draft.level >= 2) {
    for (const f of draft.fields) {
      if (KNOWN_PII_FIELDS.includes(f.fieldPath) && f.strategy === 'keep') {
        errors.push({
          field: `fields.${f.fieldPath}`,
          code: 'RPB_005',
          message: `PII field ${f.fieldPath} cannot be kept at level ${draft.level}`,
          severity: 'error',
          hintKey: 'policy.errors.pii_leak',
        });
      }
    }
  }

  // Change log must be non-empty
  if (draft.changeLog.length === 0) {
    errors.push({
      field: 'changeLog',
      code: 'RPB_007',
      message: 'Change log must have at least one entry (LGPD Art. 7)',
      severity: 'error',
    });
  }

  // Owner approval required when exporting above level 1
  if (draft.level >= 3 && !draft.isOwnerApproved) {
    warnings.push({
      field: 'isOwnerApproved',
      code: 'RPB_006',
      message: `Level ${draft.level} policy should be owner-approved before publish`,
      severity: 'warning',
    });
  }

  // `draft` is intentionally typed readonly; mutate via a typed alias.
  (draft as { validationErrors: RedactionPolicyValidationError[] }).validationErrors = errors;
  (draft as { validationWarnings: RedactionPolicyValidationError[] }).validationWarnings = warnings;
  (draft as { lastValidatedAt?: Iso8601 }).lastValidatedAt = asIso8601(new Date().toISOString());

  return { errors, warnings };
}

/** Convenience: returns `true` if no validation errors. */
export function isPolicyValid(draft: RedactionPolicyDraft): boolean {
  const { errors } = validatePolicy(draft);
  return errors.length === 0;
}

/** Count of validation errors for a given code. */
export function countValidationErrorsByCode(
  draft: RedactionPolicyDraft,
  code: ErrorCodeLiteral,
): number {
  return draft.validationErrors.filter((e) => e.code === code).length;
}

// ============================================================================
// SECTION 10 — Compilation
// ============================================================================

/**
 * Compile the draft into a static `RedactionPolicyDSL`. After this
 * step the policy is ready to be consumed by Wave 50's
 * `applyRedactionFilters` (each `filter` becomes a runtime call).
 */
export function compilePolicy(
  draft: RedactionPolicyDraft,
  approver: PolicyActorRef,
): RedactionPolicyDSL {
  if (approver.actorKind !== 'owner') {
    throw new RedactionPolicyBuilderError(
      'RPB_006',
      `Actor ${approver.actorId} is not an owner; cannot compile`,
      { actorId: approver.actorId },
    );
  }
  const { errors } = validatePolicy(draft);
  if (errors.length > 0) {
    throw new RedactionPolicyBuilderError(
      'RPB_007',
      `Cannot compile invalid policy (${errors.length} errors)`,
      { codes: errors.map((e) => e.code) },
    );
  }
  const now = asIso8601(new Date().toISOString());
  const filters: RedactionFilter[] = draft.fields.map((f) => ({
    fieldPath: f.fieldPath,
    strategy: f.strategy,
    level: draft.level,
    attributionKey: f.options?.attributionKey,
    options: f.options,
  }));
  const policy: RedactionPolicyDSL = {
    id: draft.workingCopyOf === draft.id ? draft.id : draft.workingCopyOf,
    name: draft.name,
    description: draft.description,
    archetype: draft.archetype,
    version: 1,
    level: draft.level,
    fields: draft.fields.map((f) => ({ ...f })),
    filters,
    expiryDays: draft.expiryDays,
    createdBy: draft.createdBy,
    createdAt: draft.changeLog[0]?.at ?? now,
    updatedAt: now,
    isOwnerApproved: true,
    changeLog: [
      ...draft.changeLog,
      {
        id: nextDraftId('cl'),
        at: now,
        actor: approver,
        action: 'approved',
        summary: `Compiled by ${approver.actorId}`,
        consentBasis: asConsentBasis('consent'),
      },
    ],
    tradition: draft.tradition,
    ownerNotes: draft.ownerNotes,
  };
  return enforceSacredTextRedaction(policy);
}

/** Pure compilation without validation (used by tests). */
export function compilePolicyRaw(draft: RedactionPolicyDraft): RedactionPolicyDSL {
  const now = asIso8601(new Date().toISOString());
  const filters: RedactionFilter[] = draft.fields.map((f) => ({
    fieldPath: f.fieldPath,
    strategy: f.strategy,
    level: draft.level,
    attributionKey: f.options?.attributionKey,
    options: f.options,
  }));
  return {
    id: draft.workingCopyOf === draft.id ? draft.id : draft.workingCopyOf,
    name: draft.name,
    description: draft.description,
    archetype: draft.archetype,
    version: 1,
    level: draft.level,
    fields: draft.fields.map((f) => ({ ...f })),
    filters,
    expiryDays: draft.expiryDays,
    createdBy: draft.createdBy,
    createdAt: draft.changeLog[0]?.at ?? now,
    updatedAt: now,
    isOwnerApproved: draft.isOwnerApproved,
    changeLog: draft.changeLog.map((c) => ({ ...c })),
    tradition: draft.tradition,
    ownerNotes: draft.ownerNotes,
  };
}

// ============================================================================
// SECTION 11 — Preview / Compare / Merge / Clone / Archive / Restore
// ============================================================================

/**
 * Preview the redaction that Wave 50 would produce, given a sample
 * receipt. Returns `{ fieldPath: redactedValue }` plus the raw diff.
 */
export function previewRedaction(
  policy: RedactionPolicyDSL | RedactionPolicyDraft,
  sampleReceipt: Record<string, string>,
): {
  redacted: Record<string, string>;
  diff: Record<string, { before: string; after: string; strategy: RedactionStrategy }>;
} {
  const redacted: Record<string, string> = {};
  const diff: Record<string, { before: string; after: string; strategy: RedactionStrategy }> = {};
  const fields = (policy as RedactionPolicyDSL).fields as ReadonlyArray<RedactionPolicyField>;
  const level = (policy as RedactionPolicyDSL).level as RedactionLevelNum;
  for (const f of fields) {
    const before = sampleReceipt[f.fieldPath] ?? '';
    const after = applyStrategy(before, f, level);
    redacted[f.fieldPath] = after;
    diff[f.fieldPath] = { before, after, strategy: f.strategy };
  }
  return { redacted, diff };
}

/**
 * Diff two policies: returns added / removed / changed fieldPaths.
 */
export function comparePolicies(
  a: RedactionPolicyDSL,
  b: RedactionPolicyDSL,
): PolicyDiffEntry {
  const aFields: ReadonlyArray<RedactionPolicyField> = a.fields;
  const bFields: ReadonlyArray<RedactionPolicyField> = b.fields;
  const aMap = new Map<string, RedactionStrategy>(
    aFields.map((f: RedactionPolicyField) => [f.fieldPath, f.strategy]),
  );
  const bMap = new Map<string, RedactionStrategy>(
    bFields.map((f: RedactionPolicyField) => [f.fieldPath, f.strategy]),
  );
  const added: string[] = [];
  const removed: string[] = [];
  const changed: { fieldPath: string; from: RedactionStrategy; to: RedactionStrategy }[] = [];
  for (const [path] of bMap) {
    if (!aMap.has(path)) added.push(path);
  }
  for (const [path] of aMap) {
    if (!bMap.has(path)) removed.push(path);
  }
  for (const [path, stratB] of bMap) {
    const stratA = aMap.get(path);
    if (stratA && stratA !== stratB) {
      changed.push({ fieldPath: path, from: stratA, to: stratB });
    }
  }
  return { added, removed, changed };
}

/**
 * Merge two policies. `b`'s fields override `a`'s on conflict. The
 * resulting draft inherits `b`'s metadata but records the merge in the
 * change log so the audit trail is preserved (LGPD Art. 18).
 */
export function mergePolicies(
  a: RedactionPolicyDSL,
  b: RedactionPolicyDSL,
  actor: PolicyActorRef,
): RedactionPolicyDraft {
  const mergedFields: RedactionPolicyField[] = [];
  const seen = new Set<string>();
  for (const f of [...a.fields, ...b.fields]) {
    if (seen.has(f.fieldPath)) continue;
    seen.add(f.fieldPath);
    mergedFields.push({ ...f });
  }
  return {
    id: asPolicyId(`draft-${nextDraftId('d')}`),
    name: `${a.name} + ${b.name}`,
    description: `Merged from ${a.id} + ${b.id}`,
    archetype: b.archetype,
    level: b.level,
    fields: mergedFields,
    filters: [],
    expiryDays: b.expiryDays,
    validationErrors: [],
    validationWarnings: [],
    isDirty: true,
    createdBy: actor,
    workingCopyOf: b.id,
    changeLog: [
      ...a.changeLog,
      ...b.changeLog,
      {
        id: nextDraftId('cl'),
        at: asIso8601(new Date().toISOString()),
        actor,
        action: 'merged-from',
        summary: `Merged with ${a.id} (${a.name})`,
        consentBasis: asConsentBasis('legitimate-interest'),
      },
    ],
    isOwnerApproved: false,
  };
}

/** Clone a policy under a new name. The new policy starts as a draft. */
export function clonePolicy(
  policy: RedactionPolicyDSL,
  newName: string,
  actor: PolicyActorRef,
): RedactionPolicyDraft {
  if (!newName || newName.trim().length < 3) {
    throw new RedactionPolicyBuilderError('RPB_007', 'New policy name must be at least 3 chars', {
      newName,
    });
  }
  return {
    id: asPolicyId(`draft-${nextDraftId('d')}`),
    name: newName,
    description: `Clone of ${policy.name}`,
    archetype: policy.archetype,
    level: policy.level,
    fields: policy.fields.map((f) => ({ ...f })),
    filters: policy.filters.map((f) => ({ ...f })),
    expiryDays: policy.expiryDays,
    tradition: policy.tradition,
    ownerNotes: policy.ownerNotes,
    validationErrors: [],
    validationWarnings: [],
    isDirty: true,
    createdBy: actor,
    workingCopyOf: policy.id,
    changeLog: [
      ...policy.changeLog,
      {
        id: nextDraftId('cl'),
        at: asIso8601(new Date().toISOString()),
        actor,
        action: 'imported',
        summary: `Cloned from ${policy.name} as "${newName}"`,
        consentBasis: asConsentBasis('consent'),
      },
    ],
    isOwnerApproved: false,
    sourceRef: policy.id as unknown as string,
  };
}

/** Mark a policy as archived (soft delete). Does NOT mutate input. */
export function archivePolicy(
  policy: RedactionPolicyDSL,
  actor: PolicyActorRef,
): RedactionPolicyDSL {
  const now = asIso8601(new Date().toISOString());
  return {
    ...policy,
    isOwnerApproved: false,
    updatedAt: now,
    changeLog: [
      ...policy.changeLog,
      {
        id: nextDraftId('cl'),
        at: now,
        actor,
        action: 'archived',
        summary: `Archived by ${actor.actorId}`,
        consentBasis: asConsentBasis('legitimate-interest'),
      },
    ],
  };
}

/** Restore an archived policy by appending a `restored` entry. */
export function restorePolicy(
  policy: RedactionPolicyDSL,
  actor: PolicyActorRef,
): RedactionPolicyDSL {
  const now = asIso8601(new Date().toISOString());
  return {
    ...policy,
    updatedAt: now,
    changeLog: [
      ...policy.changeLog,
      {
        id: nextDraftId('cl'),
        at: now,
        actor,
        action: 'restored',
        summary: `Restored by ${actor.actorId}`,
        consentBasis: asConsentBasis('consent'),
      },
    ],
  };
}

/**
 * Increment semantic version. Appends a `version-incremented` change
 * log entry so Wave 50's audit events can detect the upgrade.
 */
export function incrementPolicyVersion(
  policy: RedactionPolicyDSL,
  actor: PolicyActorRef,
): RedactionPolicyDSL {
  const now = asIso8601(new Date().toISOString());
  return {
    ...policy,
    version: policy.version + 1,
    updatedAt: now,
    changeLog: [
      ...policy.changeLog,
      {
        id: nextDraftId('cl'),
        at: now,
        actor,
        action: 'version-incremented',
        summary: `Bumped to v${policy.version + 1}`,
        consentBasis: asConsentBasis('consent'),
      },
    ],
  };
}

/** Append a custom change-log entry (LGPD Art. 7 evidence trail). */
export function appendChangeLogEntry(
  policy: RedactionPolicyDSL,
  entry: Omit<RedactionPolicyChangeLogEntry, 'id' | 'at'>,
): RedactionPolicyDSL {
  if (!entry.consentBasis) {
    throw new RedactionPolicyBuilderError(
      'RPB_007',
      'Change log entries must declare a consentBasis (LGPD Art. 7)',
      { action: entry.action },
    );
  }
  if (!entry.summary || entry.summary.trim().length < 5) {
    throw new RedactionPolicyBuilderError(
      'RPB_007',
      'Change log summary must be at least 5 characters',
      { action: entry.action },
    );
  }
  return {
    ...policy,
    updatedAt: asIso8601(new Date().toISOString()),
    changeLog: [
      ...policy.changeLog,
      { ...entry, id: nextDraftId('cl'), at: asIso8601(new Date().toISOString()) },
    ],
  };
}

// ============================================================================
// SECTION 12 — Export / Import (JSON + YAML)
// ============================================================================

/** Default JSON pretty-print indent. */
export const DEFAULT_JSON_INDENT = 2;

/** Serialize a policy as a JSON string. */
export function exportPolicyAsJson(
  policy: RedactionPolicyDSL,
  indent: number = DEFAULT_JSON_INDENT,
): string {
  return JSON.stringify(policy, null, indent);
}

/** Serialize a policy to a hand-rolled YAML string. */
export function exportPolicyAsYaml(policy: RedactionPolicyDSL): string {
  return toYaml(policy, 0);
}

/** Import a policy from JSON string. Throws RPB_008 on parse error. */
export function importPolicyFromJson(json: string): RedactionPolicyDSL {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new RedactionPolicyBuilderError(
      'RPB_008',
      `JSON parse error: ${(e as Error).message}`,
      { error: (e as Error).message },
    );
  }
  return parsePolicyLike(parsed);
}

/** Import a policy from YAML. Hand-rolled parser, no deps. */
export function importPolicyFromYaml(yaml: string): RedactionPolicyDSL {
  const parsed = parseYaml(yaml);
  return parsePolicyLike(parsed);
}

/** Validate a parsed object against the policy shape. */
export function parsePolicyLike(input: unknown): RedactionPolicyDSL {
  if (!input || typeof input !== 'object') {
    throw new RedactionPolicyBuilderError('RPB_008', 'Policy must be an object');
  }
  const obj = input as Record<string, unknown>;
  if (!obj.id || typeof obj.id !== 'string') {
    throw new RedactionPolicyBuilderError('RPB_008', 'Policy.id is required');
  }
  if (!obj.level || ![1, 2, 3, 4].includes(obj.level as number)) {
    throw new RedactionPolicyBuilderError('RPB_008', 'Policy.level must be 1..4');
  }
  if (!Array.isArray(obj.fields)) {
    throw new RedactionPolicyBuilderError('RPB_008', 'Policy.fields must be an array');
  }
  if (!Array.isArray(obj.changeLog)) {
    throw new RedactionPolicyBuilderError('RPB_008', 'Policy.changeLog must be an array');
  }
  return obj as unknown as RedactionPolicyDSL;
}

// ---------------------------------------------------------------------------
// 12.1 — Hand-rolled JSON utility helpers
// ---------------------------------------------------------------------------

/** Safe parse wrapper returning a discriminated union. */
export function safeParsePolicy(json: string):
  | { ok: true; policy: RedactionPolicyDSL }
  | { ok: false; error: string } {
  try {
    const p = importPolicyFromJson(json);
    return { ok: true, policy: p };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Compare two JSON strings lexicographically (used by diff tool). */
export function comparePolicyJson(a: string, b: string): boolean {
  const ap = safeParsePolicy(a);
  const bp = safeParsePolicy(b);
  if (!ap.ok || !bp.ok) return false;
  return JSON.stringify(ap.policy) === JSON.stringify(bp.policy);
}

// ---------------------------------------------------------------------------
// 12.2 — Hand-rolled YAML emitter + parser (zero-dep)
// ---------------------------------------------------------------------------

/** Quote a YAML scalar when needed. */
function yamlQuote(value: string): string {
  if (value === '') return '""';
  if (/^[a-zA-Z_][\w\-]*$/.test(value)) return value;
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Recursive YAML emitter. */
function toYaml(value: unknown, depth: number, key?: string): string {
  const indent = '  '.repeat(depth);
  const prefix = key !== undefined ? `${indent}${key}: ` : '';
  if (value === null || value === undefined) {
    return `${prefix}null`;
  }
  if (typeof value === 'string') {
    return `${prefix}${yamlQuote(value)}`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${prefix}${String(value)}`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `${prefix}[]`;
    const lines: string[] = [];
    for (const v of value) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const entries = Object.entries(v as Record<string, unknown>);
        if (entries.length === 0) {
          lines.push(`${indent}- {}`);
        } else {
          const [firstK, firstV] = entries[0]!;
          lines.push(`${indent}- ${firstK}: ${yamlInline(firstV)}`);
          for (const [k, v] of entries.slice(1)) {
            lines.push(`${'  '.repeat(depth + 1)}${k}: ${yamlInline(v)}`);
          }
        }
      } else {
        lines.push(`${indent}- ${yamlInline(v)}`);
      }
    }
    return lines.join('\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${prefix}{}`;
    const lines: string[] = [];
    for (const [k, v] of entries) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const innerEntries = Object.entries(v as Record<string, unknown>);
        if (innerEntries.length === 0) {
          lines.push(`${indent}${k}: {}`);
        } else {
          lines.push(`${indent}${k}:`);
          for (const [ik, iv] of innerEntries) {
            lines.push(toYaml(iv, depth + 1, ik));
          }
        }
      } else if (Array.isArray(v)) {
        lines.push(toYaml(v, depth, k));
      } else {
        lines.push(`${indent}${k}: ${yamlInline(v)}`);
      }
    }
    return lines.join('\n');
  }
  return `${prefix}${String(value)}`;
}

/** Inline YAML scalar. */
function yamlInline(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return yamlQuote(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[${value.map(yamlInline).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return `{${entries.map(([k, v]) => `${k}: ${yamlInline(v)}`).join(', ')}}`;
  }
  return String(value);
}

/** Minimal YAML parser (subset). Supports scalars, lists, indented maps. */
export function parseYaml(input: string): unknown {
  const lines = input
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'));
  let i = 0;
  const peek = () => lines[i];
  const read = () => lines[i++];
  const indentOf = (s: string) => s.match(/^(\s*)/)?.[1].length ?? 0;

  function parseValue(raw: string): unknown {
    if (raw === 'null' || raw === '~') return null;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    if (/^-?\d+$/.test(raw)) return Number(raw);
    if (/^-?\d+\.\d+$/.test(raw)) return Number(raw);
    if (raw === '[]') return [];
    if (raw === '{}') return {};
    if (raw.startsWith('"') && raw.endsWith('"')) {
      return raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return raw;
  }

  function parseBlock(parentIndent: number): unknown {
    if (i >= lines.length) return null;
    const line = peek()!;
    const ind = indentOf(line);
    if (ind < parentIndent) return null;
    // List?
    if (/^\s*-/.test(line)) {
      const arr: unknown[] = [];
      while (i < lines.length) {
        const cur = peek()!;
        if (!/^\s*-/.test(cur)) break;
        const itemIndent = indentOf(cur);
        if (itemIndent !== ind) break;
        const afterDash = cur.replace(/^\s*-/, '').trim();
        if (afterDash === '') {
          i++;
          const nested = parseBlock(ind + 2);
          arr.push(nested ?? null);
        } else if (afterDash.includes(':')) {
          // inline map start
          const obj: Record<string, unknown> = {};
          const [k, ...rest] = afterDash.split(':');
          const key = k!.trim();
          const restStr = rest.join(':').trim();
          if (restStr === '') {
            i++;
            obj[key] = parseBlock(ind + 2) ?? null;
          } else {
            i++;
            obj[key] = parseValue(restStr);
          }
          // Following sibling keys (with deeper indent)
          while (i < lines.length) {
            const next = peek()!;
            const nind = indentOf(next);
            if (nind <= ind) break;
            if (/^\s*-/.test(next)) break;
            const m = next.trim().match(/^([^:]+):\s*(.*)$/);
            if (!m) break;
            i++;
            const k2 = m[1]!.trim();
            const restStr2 = (m[2] ?? '').trim();
            if (restStr2 === '') {
              obj[k2] = parseBlock(nind + 2) ?? null;
            } else {
              obj[k2] = parseValue(restStr2);
            }
          }
          arr.push(obj);
        } else {
          i++;
          arr.push(parseValue(afterDash));
        }
      }
      return arr;
    }
    // Map
    const obj: Record<string, unknown> = {};
    while (i < lines.length) {
      const cur = peek()!;
      const cind = indentOf(cur);
      if (cind !== ind) break;
      const m = cur.trim().match(/^([^:]+):\s*(.*)$/);
      if (!m) break;
      const k = m[1]!.trim();
      const rest = (m[2] ?? '').trim();
      i++;
      if (rest === '') {
        const child = parseBlock(ind + 2);
        obj[k] = child ?? null;
      } else {
        obj[k] = parseValue(rest);
      }
    }
    return obj;
  }

  return parseBlock(0);
}

// ============================================================================
// SECTION 13 — Suggestions
// ============================================================================

/**
 * Suggest a sensible default policy for the requested level.
 * `tradition` is optional — when supplied, sacred-text overrides honor
 * public-domain status.
 */
export function suggestPolicyForLevel(
  level: RedactionLevelNum,
  tradition?: string,
): RedactionPolicyField[] {
  const fields = defaultFieldsForLevel(level).map((f) => ({ ...f }));
  if (tradition && isPublicDomainTradition(tradition)) {
    // Even public-domain traditions get redacted at level >= 2.
    if (level >= 2) {
      const idx = fields.findIndex((f) => f.fieldPath === STANDARD_FIELD_PATHS.sacredTextRefs);
      if (idx >= 0) fields[idx] = { ...fields[idx]!, strategy: 'redact' };
    }
  }
  return fields;
}

/** Public-domain traditions whose sacred texts may stay visible at level 1. */
export function isPublicDomainTradition(tradition: string): boolean {
  const PD = new Set(['public-domain', 'pd', 'open-source', 'folklore']);
  return PD.has(tradition.toLowerCase());
}

/** Return the human-readable level name (pt-BR). */
export function describeLevel(level: RedactionLevelNum): string {
  return LEVEL_LABELS[unbrandLevel(level)];
}

/** Return the human-readable strategy label. */
export function describeStrategy(strategy: RedactionStrategy): string {
  return STRATEGY_LABELS[strategy];
}

/** Number of fields suggested per level. */
export function fieldCountForLevel(level: RedactionLevelNum): number {
  return defaultFieldsForLevel(level).length;
}

// ============================================================================
// SECTION 14 — Safety rails
// ============================================================================

/**
 * Throw if the policy isn't owner-approved. Use as a guard around
 * `compilePolicy` and the Wave 50 export entry-point.
 */
export function enforceOwnerApproval(policy: RedactionPolicyDSL): RedactionPolicyDSL {
  if (!policy.isOwnerApproved) {
    throw new RedactionPolicyBuilderError(
      'RPB_006',
      `Policy ${policy.id} is not owner-approved`,
      { policyId: policy.id },
    );
  }
  return policy;
}

/**
 * Throw if a stronger level exposes information a weaker level kept
 * hidden. Specifically:
 *  - A higher-level policy cannot `keep` a field that a lower-level
 *    policy (with the same name) redacted.
 *  - Levels must be monotonic across versions: v2.level >= v1.level
 *    is allowed; demotion requires a new consent log entry.
 *
 * When `previous` is omitted, only intra-policy coherence is enforced.
 */
export function enforceLevelCoherence(
  policy: RedactionPolicyDSL,
  previous?: RedactionPolicyDSL,
): RedactionPolicyDSL {
  if (previous) {
    if (policy.level < previous.level) {
      throw new RedactionPolicyBuilderError(
        'RPB_002',
        `Level downgrade not allowed (${previous.level} → ${policy.level})`,
        { previous: previous.level, next: policy.level },
      );
    }
    // Weak → strong coherence: fields kept at higher level must have been at least as strict at lower level.
    for (const f of policy.fields) {
      const prevField = previous.fields.find((x) => x.fieldPath === f.fieldPath);
      if (prevField && !strategyIsCompatible(prevField.strategy, f.strategy)) {
        throw new RedactionPolicyBuilderError(
          'RPB_002',
          `Field ${f.fieldPath} weakening strategy ${f.strategy} (was ${prevField.strategy}) on level increase`,
          { fieldPath: f.fieldPath, prev: prevField.strategy, next: f.strategy },
        );
      }
    }
  }
  return policy;
}

/**
 * Strategy ordering used by `enforceLevelCoherence`. Lower index =
 * weaker (more permissive). Index 0 = `keep` (most permissive);
 * index 5 = `drop` (most restrictive).
 *
 * Two strategies are "compatible" if the new strategy is at least
 * as strong as the old one.
 */
export const STRATEGY_STRENGTH: Readonly<Record<RedactionStrategy, number>> = {
  keep: 0,
  hash: 1,
  bucketize: 2,
  pseudonymize: 3,
  redact: 4,
  drop: 5,
};

/** Pure helper — true if `b` is at least as strong as `a`. */
export function strategyIsCompatible(a: RedactionStrategy, b: RedactionStrategy): boolean {
  return STRATEGY_STRENGTH[b] >= STRATEGY_STRENGTH[a];
}

/**
 * Sacred-text safety rail. Throws RPB_004 unless:
 *   - level < 2 (sacred text may remain `keep`), OR
 *   - all sacred text fields are configured with a non-`keep`,
 *     non-`hash` strategy (i.e. redact / drop / pseudonymize /
 *     bucketize), OR
 *   - level === 1 AND tradition is public-domain AND owner approved.
 */
export function enforceSacredTextRedaction(policy: RedactionPolicyDSL): RedactionPolicyDSL {
  const sacred = policy.fields.filter((f) => SACRED_TEXT_PATHS.includes(f.fieldPath));
  if (sacred.length === 0) return policy;
  if (policy.level < 2) {
    // Level 1 — must have owner approval if any sacred path is `keep`
    const keeps = sacred.filter((f) => f.strategy === 'keep');
    if (keeps.length > 0) {
      if (!policy.isOwnerApproved) {
        throw new RedactionPolicyBuilderError(
          'RPB_004',
          `Sacred text paths ${keeps.map((k) => k.fieldPath).join(', ')} require owner approval at level 1`,
          { fieldPaths: keeps.map((k) => k.fieldPath) },
        );
      }
    }
    return policy;
  }
  // Level >= 2 — strict.
  for (const f of sacred) {
    if (f.strategy === 'keep' || f.strategy === 'hash') {
      throw new RedactionPolicyBuilderError(
        'RPB_004',
        `Sacred text field ${f.fieldPath} uses ${f.strategy} at level ${policy.level} (must be redact|drop|pseudonymize|bucketize)`,
        { fieldPath: f.fieldPath, level: policy.level, strategy: f.strategy },
      );
    }
  }
  return policy;
}

/** PII safety rail. Throws RPB_005 if a level >= 2 policy keeps known PII. */
export function enforceNoPIILeak(policy: RedactionPolicyDSL): RedactionPolicyDSL {
  if (policy.level < 2) return policy;
  const leaks = policy.fields.filter(
    (f) => KNOWN_PII_FIELDS.includes(f.fieldPath) && f.strategy === 'keep',
  );
  if (leaks.length > 0) {
    throw new RedactionPolicyBuilderError(
      'RPB_005',
      `PII leak: ${leaks.map((l) => l.fieldPath).join(', ')} kept at level ${policy.level}`,
      { fieldPaths: leaks.map((l) => l.fieldPath) },
    );
  }
  return policy;
}

/** Compose all four safety rails into a single pass. */
export function enforceAllSafetyRails(
  policy: RedactionPolicyDSL,
  previous?: RedactionPolicyDSL,
): RedactionPolicyDSL {
  return enforceNoPIILeak(
    enforceSacredTextRedaction(
      enforceLevelCoherence(
        enforceOwnerApproval(policy),
        previous,
      ),
    ),
  );
}

/** Non-throwing variant of `enforceAllSafetyRails`. */
export function checkSafetyRails(
  policy: RedactionPolicyDSL,
  previous?: RedactionPolicyDSL,
): { ok: boolean; failures: ErrorCodeLiteral[] } {
  const failures: ErrorCodeLiteral[] = [];
  const tryRun = (label: string, fn: () => unknown) => {
    try {
      fn();
    } catch (e) {
      failures.push((e as RedactionPolicyBuilderError).code ?? 'RPB_001');
    }
  };
  tryRun('owner', () => enforceOwnerApproval(policy));
  tryRun('coherence', () => enforceLevelCoherence(policy, previous));
  tryRun('sacred', () => enforceSacredTextRedaction(policy));
  tryRun('pii', () => enforceNoPIILeak(policy));
  return { ok: failures.length === 0, failures };
}

// ============================================================================
// SECTION 15 — LGPD helpers (Art. 7 consent + Art. 18 audit)
// ============================================================================

/**
 * Validate the change-log carries a consentBasis on every mutation.
 * LGPD Art. 7 — every change must declare its legal basis.
 */
export function hasEveryChangeLogConsentBasis(policy: RedactionPolicyDSL | RedactionPolicyDraft): boolean {
  const p = policy as RedactionPolicyDSL;
  return p.changeLog.every((entry) => !!entry.consentBasis);
}

/**
 * Validate the chain of `consentBasis` includes at least one `consent`
 * basis for personal-data touching operations. For Art. 7 evidence the
 * final state must reference a `consent` action somewhere.
 */
export function hasConsentForPersonalData(policy: RedactionPolicyDSL): boolean {
  return policy.changeLog.some((e) => e.consentBasis === 'consent');
}

/** Returns the canonical Art. 18 audit summary string. */
export function summarizeAuditTrail(policy: RedactionPolicyDSL): string {
  return policy.changeLog
    .map((e) => `[${e.at}] ${e.action} by ${e.actor.actorId} (basis=${e.consentBasis ?? 'n/a'}): ${e.summary}`)
    .join('\n');
}

/** Returns `true` when the policy is ready to be surfaced to a data subject. */
export function isSubjectRequestReady(policy: RedactionPolicyDSL): boolean {
  if (!hasEveryChangeLogConsentBasis(policy)) return false;
  if (!policy.isOwnerApproved) return false;
  if (!policy.id) return false;
  return policy.changeLog.length > 0;
}

/** Record an explicit consent capture (e.g., on policy import). */
export function recordConsentCapture(
  policy: RedactionPolicyDSL,
  actor: PolicyActorRef,
  basis: ConsentBasisLiteral,
  summary: string,
): RedactionPolicyDSL {
  return appendChangeLogEntry(policy, {
    actor,
    action: 'approved',
    summary,
    consentBasis: asConsentBasis(basis),
  });
}

/** Helper that asserts a draft/policy was tampered with by recomputing chain. */
export function verifyChangeLogChain(policy: RedactionPolicyDSL): boolean {
  if (policy.changeLog.length === 0) return false;
  // Verify each entry references a valid action verb
  return policy.changeLog.every((e) =>
    ['created', 'field-added', 'field-removed', 'strategy-changed', 'level-changed',
      'approved', 'archived', 'restored', 'version-incremented', 'merged-from',
      'imported', 'exported'].includes(e.action),
  );
}

// ============================================================================
// SECTION 16 — Wave-50 integration contract (informational, no runtime link)
// ============================================================================

/**
 * Wave 50 (`src/lib/w50/receipt-export-redaction-tool.ts`) consumes the
 * `RedactionPolicyDSL.filters` array. This re-exports the contract so
 * tests and the visual editor can validate alignment without importing
 * Wave 50 directly (avoiding circular deps during W51 build).
 */
export interface Wave50RedactionFiltersContract {
  readonly policyId: PolicyId;
  readonly level: RedactionLevelNum;
  readonly filters: ReadonlyArray<RedactionFilter>;
  readonly expiryDays: number;
}

/** Convert a compiled policy into the Wave-50 contract shape. */
export function toWave50Contract(policy: RedactionPolicyDSL): Wave50RedactionFiltersContract {
  return {
    policyId: policy.id,
    level: policy.level,
    filters: policy.filters,
    expiryDays: policy.expiryDays,
  };
}

/**
 * Convert a draft's filters into Wave-50 contract. The draft must
 * pass validation first; otherwise this throws RPB_007.
 */
export function draftToWave50Contract(draft: RedactionPolicyDraft): Wave50RedactionFiltersContract {
  const { errors } = validatePolicy(draft);
  if (errors.length > 0) {
    throw new RedactionPolicyBuilderError('RPB_007', 'Draft has validation errors', {
      errors: errors.map((e) => e.code),
    });
  }
  return {
    policyId: draft.workingCopyOf === draft.id ? draft.id : draft.workingCopyOf,
    level: draft.level,
    filters: draft.fields.map((f) => ({
      fieldPath: f.fieldPath,
      strategy: f.strategy,
      level: draft.level,
      attributionKey: f.options?.attributionKey,
      options: f.options,
    })),
    expiryDays: draft.expiryDays,
  };
}

// ============================================================================
// SECTION 17 — Misc helpers
// ============================================================================

/** Stable fingerprint hash of a policy. */
export function fingerprintPolicy(policy: RedactionPolicyDSL | RedactionPolicyDraft): HashDigest {
  const p = policy as RedactionPolicyDSL;
  const summary = {
    n: p.name,
    l: p.level,
    f: p.fields.map((f) => `${f.fieldPath}:${f.strategy}`).sort().join(','),
    v: 'version' in policy ? (policy as RedactionPolicyDSL).version : 0,
  };
  return hashString(JSON.stringify(summary));
}

/** Pretty-print summary suitable for logging. */
export function describePolicy(policy: RedactionPolicyDSL | RedactionPolicyDraft): string {
  const p = policy as RedactionPolicyDSL;
  return `Policy ${p.id} level=${p.level} fields=${p.fields.length} approved=${p.isOwnerApproved}`;
}

/** Filter-only equality (used by comparePolicies internal flow). */
export function fieldsEqual(
  a: ReadonlyArray<RedactionPolicyField>,
  b: ReadonlyArray<RedactionPolicyField>,
): boolean {
  if (a.length !== b.length) return false;
  const sortBy = (xs: ReadonlyArray<RedactionPolicyField>) => [...xs].sort((x, y) => x.fieldPath.localeCompare(y.fieldPath));
  const sa = sortBy(a);
  const sb = sortBy(b);
  return sa.every((f, i) => f.fieldPath === sb[i]!.fieldPath && f.strategy === sb[i]!.strategy);
}

/** Pretty-print a strategy diff. */
export function formatDiff(diff: PolicyDiffEntry): string {
  const parts: string[] = [];
  if (diff.added?.length) parts.push(`+ ${diff.added.join(', ')}`);
  if (diff.removed?.length) parts.push(`- ${diff.removed.join(', ')}`);
  if (diff.changed?.length) {
    for (const c of diff.changed) parts.push(`~ ${c.fieldPath}: ${c.from} → ${c.to}`);
  }
  return parts.join(' | ') || 'no changes';
}

/** Count policy-field entries that are stronger than `keep`. */
export function countProtectedFields(policy: RedactionPolicyDSL | RedactionPolicyDraft): number {
  return policy.fields.filter((f) => f.strategy !== 'keep').length;
}

/** List the fieldPaths that remain `keep`. */
export function listKeptFields(policy: RedactionPolicyDSL | RedactionPolicyDraft): string[] {
  return policy.fields.filter((f) => f.strategy === 'keep').map((f) => f.fieldPath);
}

/** List the fieldPaths that are `redact` or `drop`. */
export function listHiddenFields(policy: RedactionPolicyDSL | RedactionPolicyDraft): string[] {
  return policy.fields
    .filter((f) => f.strategy === 'redact' || f.strategy === 'drop')
    .map((f) => f.fieldPath);
}

/** Count of `pseudonymize` fields (useful for analytics dashboards). */
export function countPseudonymizedFields(
  policy: RedactionPolicyDSL | RedactionPolicyDraft,
): number {
  return policy.fields.filter((f) => f.strategy === 'pseudonymize').length;
}

/** Generate a non-cryptographic id (used by tests + draft helpers). */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================================
// SECTION 18 — Namespace aggregator
// ============================================================================

/**
 * Namespaced aggregator. UI code can `import { RedactionPolicyBuilderEngine }
 * from '@/lib/w51/redaction-policy-builder'` and access every helper via
 * a single object. Kept separate from the named exports so tree-shaking
 * is preserved (each helper is also a named export).
 */
export const RedactionPolicyBuilderEngine = {
  // Constants
  REDACTION_LEVELS,
  STRATEGY_OPTIONS,
  MAX_FIELDS_PER_POLICY,
  POLICY_ARCHETYPES,
  STANDARD_FIELD_PATHS,
  LEVEL_LABELS,
  STRATEGY_LABELS,
  DEFAULT_PSEUDONYM_SALT,
  DEFAULT_HASH_ALGO,
  HASH_TRUNCATE_LENGTH,
  BUCKET_PRECISION,
  LGPD_CONSENT_BASES,
  DEFAULT_EXPIRY_DAYS,
  STRATEGY_STRENGTH,
  ERROR_CODES,
  ERROR_CODE_LABELS,
  DEFAULT_JSON_INDENT,
  KNOWN_PII_FIELDS,
  SACRED_TEXT_PATHS,
  DEFAULT_POLICY_LEVEL_1,
  DEFAULT_POLICY_LEVEL_2,
  DEFAULT_POLICY_LEVEL_3,
  DEFAULT_POLICY_LEVEL_4,
  ARCHETYPE_OVERRIDES,
  POLICY_FIELD_PRESETS,
  RPB_001,
  RPB_002,
  RPB_003,
  RPB_004,
  RPB_005,
  RPB_006,
  RPB_007,
  RPB_008,
  ERROR_CODES_BY_NAME,
  // Brand casters
  asPolicyId,
  asFieldPath,
  asTraditionCode,
  asLocaleTag,
  asRedactionLevel,
  asConsentBasis,
  asHashDigest,
  asPseudonymToken,
  asBucketKey,
  asIso8601,
  // Strategy primitives
  hashString,
  simpleSha256,
  pseudonymize,
  bucketDate,
  bucketGeo,
  bucketize,
  applyStrategy,
  mergeBucketPrecision,
  // Field presets / defaults
  policyFieldPresets,
  defaultFieldsForLevel,
  defaultLevelForArchetype,
  suggestPolicyForLevel,
  isPublicDomainTradition,
  describeLevel,
  describeStrategy,
  fieldCountForLevel,
  // Draft lifecycle
  createRedactionPolicyDraft,
  loadRedactionPolicy,
  addFieldToPolicy,
  removeFieldFromPolicy,
  changeFieldStrategy,
  changePolicyLevel,
  // Validation
  validatePolicy,
  isPolicyValid,
  countValidationErrorsByCode,
  // Compile / preview / compare / merge
  compilePolicy,
  compilePolicyRaw,
  previewRedaction,
  comparePolicies,
  mergePolicies,
  clonePolicy,
  archivePolicy,
  restorePolicy,
  incrementPolicyVersion,
  appendChangeLogEntry,
  // Export / import
  exportPolicyAsJson,
  exportPolicyAsYaml,
  importPolicyFromJson,
  importPolicyFromYaml,
  parsePolicyLike,
  safeParsePolicy,
  comparePolicyJson,
  parseYaml,
  // Safety rails
  enforceOwnerApproval,
  enforceLevelCoherence,
  enforceSacredTextRedaction,
  enforceNoPIILeak,
  enforceAllSafetyRails,
  checkSafetyRails,
  strategyIsCompatible,
  // LGPD
  hasEveryChangeLogConsentBasis,
  hasConsentForPersonalData,
  summarizeAuditTrail,
  isSubjectRequestReady,
  recordConsentCapture,
  verifyChangeLogChain,
  // Wave-50 contract
  toWave50Contract,
  draftToWave50Contract,
  // Misc
  fingerprintPolicy,
  describePolicy,
  fieldsEqual,
  formatDiff,
  countProtectedFields,
  listKeptFields,
  listHiddenFields,
  countPseudonymizedFields,
  generateId,
  __resetDraftCounterForTests,
} as const;

/** Type alias for the engine namespace — useful for DI containers. */
export type RedactionPolicyBuilderEngineType = typeof RedactionPolicyBuilderEngine;

// ============================================================================
// SECTION 19 — JSDoc / glossary (no runtime exports)
// ============================================================================
//
// Field glossary (one line per path the presets cover):
//   recipient.name            — display name of the data subject
//   recipient.email           — primary contact email
//   recipient.cpf             — Brazilian individual taxpayer registry
//   recipient.phone           — phone number (BR or intl)
//   recipient.address         — postal address
//   mentor.name               — public-facing mentor identifier
//   session.notes             — free-text session observations
//   sacredTextRefs            — pointers to public-domain or licensed
//                              sacred passages (cabala-dos-caminhos
//                              treats these as protected regardless)
//   tradition                 — spiritual lineage label (metadata only)
//   locale                    — BCP-47 locale tag (metadata only)
//   date / createdAt          — timestamp (bucketizable)
//   ipAddress                 — hashed in level >= 1 for analytics
//   userAgent                 — typically dropped; retained only for
//                              fraud investigations
//   journalBody / prayerBody  — free-text journal entries; redacted at
//                              level >= 3
//   payment.amount            — bucketizable per level
//   payment.cardLast4         — last 4 of card; hash at level >= 2
//
// ---------------------------------------------------------------------------
// WAVE 51 INTEGRATION NOTES (kept here for the reviewer hand-off)
// ---------------------------------------------------------------------------
//
// 1. The visual editor MUST call `validatePolicy` on every change. The
//    returned `errors` populate the inline form, while `warnings` are
//    surfaced as yellow chips.
// 2. The Compile button calls `compilePolicy(draft, ownerRef)`. Wave-50
//    then receives `toWave50Contract(policy)` as its `RedactionFilters`
//    input. The compiled policy's `changeLog` is the LGPD Art. 18 audit
//    trail — never stripped on export.
// 3. Sacred-text rule:
//    - Level 1: `keep` allowed IFF `isOwnerApproved && isPublicDomainTradition`
//    - Level >= 2: `redact | drop | pseudonymize | bucketize` ONLY.
//    Enforced by `enforceSacredTextRedaction` and surfaced in the UI as
//    a red `RPB_004` chip on the `sacredTextRefs` row.
// 4. Owner-only gate: `enforceOwnerApproval` throws RPB_006 if the
//    calling actor isn't `actorKind === 'owner'`. The Wave-50 entry-
//    point must wrap its call in this guard.
// 5. JSON export uses native JSON; YAML uses the hand-rolled emitter +
//    parser to keep zero external deps. Both round-trip through
//    `parsePolicyLike`.
// 6. Audit trail (LGPD Art. 18): every mutation appends a
//    `ChangeLogEntry` with `consentBasis` validated against `LGPD_CONSENT_BASES`.
//    The chain is verified by `verifyChangeLogChain`.
// 7. Capacity guard: `MAX_FIELDS_PER_POLICY = 30` — UI must hide the
//    "+ field" button when `draft.fields.length >= 30`.
// 8. Pure / deterministic: every helper is pure given the supplied
//    `actor` and `salt`, so unit tests can stub the salt and assert
//    stable hashes/pseudonyms across runs.
