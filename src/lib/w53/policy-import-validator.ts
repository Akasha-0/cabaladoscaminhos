// ============================================================================
// POLICY IMPORT VALIDATOR — Wave 53
// ============================================================================
// Companion to w52 policy-export-portability. Validates + applies signed
// portable policy artifacts. Composes by SHAPE ONLY (no imports from
// w52/policy-export-portability) so the contract is purely structural.
//
// Five pillars (mirror of w52):
//   1. Artifact Validator    — accept/reject signed artifacts (sig + integrity
//      + version compatible)
//   2. Apply Gate            — apply validated policy to local policy registry
//      with merge strategy (replace, merge-deep, union-rules)
//   3. Compatibility Checker — verify artifact compatible with current
//      RedactionPolicy schema + sacred-text policy
//   4. Migration Adapter     — convert portable v1/v2 policies to current
//      native format
//   5. Import Audit          — every import recorded with LGPD article,
//      signer, integrity hash, before/after diff
//   6. Sacred-text Guard     — block imports that would strip sacred protection
//
// LGPD coverage (mandatory):
//   - Art. 7  (consentimento)        → importConsent gate
//   - Art. 18 (portabilidade/erase)  → importUserPolicy + purgeImportedPolicy
//   - Art. 20 (data portability)     → explicit "data subject import" path
//
// Sacred-text policy (mandatory):
//   - Imports that strip sacred protection → IMP_004 blocked + audit log
//   - Sacred-aware migrate: never degrade sensitivity tier during migration
//   - Signer chain required: sacred-bearing policies need primary + secondary
//
// Crypto discipline:
//   - NO external crypto libs. All HMAC-SHA256 (verify-only), key derivation,
//     constant-time compare are HAND-ROLLED below.
//   - All public functions are pure (no I/O). The audit trail is appended
//     via in-memory recordEvent; consumers wire it to their storage layer.
//
// Author: Coder worker 2/5 — cycle 53 (2026-06-29)
// ============================================================================

// ============================================================================
// SECTION 1 — Error codes (IMP_001..IMP_016) + custom error class
// ============================================================================

export const IMP_001_SIGNATURE_INVALID = 'IMP_001' as const;
export const IMP_002_EXPIRY_EXCEEDED = 'IMP_002' as const;
export const IMP_003_VERSION_INCOMPATIBLE = 'IMP_003' as const;
export const IMP_004_SACRED_PROTECTION_STRIPPED = 'IMP_004' as const;
export const IMP_005_MIGRATION_BREAKS_RULE = 'IMP_005' as const;
export const IMP_006_SHADOW_CONFLICT = 'IMP_006' as const;
export const IMP_007_INTEGRITY_MISMATCH = 'IMP_007' as const;
export const IMP_008_CONSENT_MISSING = 'IMP_008' as const;
export const IMP_009_SCHEMA_INVALID = 'IMP_009' as const;
export const IMP_010_PAYLOAD_TOO_LARGE = 'IMP_010' as const;
export const IMP_011_KEY_TOO_WEAK = 'IMP_011' as const;
export const IMP_012_SIGNER_CHAIN_INCOMPLETE = 'IMP_012' as const;
export const IMP_013_REGISTRY_MISSING = 'IMP_013' as const;
export const IMP_014_MODE_REQUIRES_FORCE = 'IMP_014' as const;
export const IMP_015_DRY_RUN_VIOLATION = 'IMP_015' as const;
export const IMP_016_PURGE_NOT_FOUND = 'IMP_016' as const;

export type ImportErrorCode =
  | typeof IMP_001_SIGNATURE_INVALID
  | typeof IMP_002_EXPIRY_EXCEEDED
  | typeof IMP_003_VERSION_INCOMPATIBLE
  | typeof IMP_004_SACRED_PROTECTION_STRIPPED
  | typeof IMP_005_MIGRATION_BREAKS_RULE
  | typeof IMP_006_SHADOW_CONFLICT
  | typeof IMP_007_INTEGRITY_MISMATCH
  | typeof IMP_008_CONSENT_MISSING
  | typeof IMP_009_SCHEMA_INVALID
  | typeof IMP_010_PAYLOAD_TOO_LARGE
  | typeof IMP_011_KEY_TOO_WEAK
  | typeof IMP_012_SIGNER_CHAIN_INCOMPLETE
  | typeof IMP_013_REGISTRY_MISSING
  | typeof IMP_014_MODE_REQUIRES_FORCE
  | typeof IMP_015_DRY_RUN_VIOLATION
  | typeof IMP_016_PURGE_NOT_FOUND;

export interface ImportErrorDetail {
  readonly code: ImportErrorCode;
  readonly message: string;
  readonly field?: string;
  readonly hint?: string;
  readonly relatedImportId?: string;
}

export class ImportValidationError extends Error {
  public readonly code: ImportErrorCode;
  public readonly field: string | undefined;
  public readonly hint: string | undefined;
  public readonly relatedImportId: string | undefined;

  constructor(detail: ImportErrorDetail) {
    super(detail.message);
    this.name = 'ImportValidationError';
    this.code = detail.code;
    this.field = detail.field;
    this.hint = detail.hint;
    this.relatedImportId = detail.relatedImportId;
    Object.setPrototypeOf(this, ImportValidationError.prototype);
  }

  public toJSON(): ImportErrorDetail {
    return {
      code: this.code,
      message: this.message,
      field: this.field,
      hint: this.hint,
      relatedImportId: this.relatedImportId,
    };
  }
}

export function isImportValidationError(err: unknown): err is ImportValidationError {
  return err instanceof ImportValidationError;
}

export function makeImportError(
  code: ImportErrorCode,
  message: string,
  field?: string,
  hint?: string,
  relatedImportId?: string,
): ImportValidationError {
  return new ImportValidationError({ code, message, field, hint, relatedImportId });
}

export const IMPORT_ERROR_CODES: readonly ImportErrorCode[] = [
  IMP_001_SIGNATURE_INVALID,
  IMP_002_EXPIRY_EXCEEDED,
  IMP_003_VERSION_INCOMPATIBLE,
  IMP_004_SACRED_PROTECTION_STRIPPED,
  IMP_005_MIGRATION_BREAKS_RULE,
  IMP_006_SHADOW_CONFLICT,
  IMP_007_INTEGRITY_MISMATCH,
  IMP_008_CONSENT_MISSING,
  IMP_009_SCHEMA_INVALID,
  IMP_010_PAYLOAD_TOO_LARGE,
  IMP_011_KEY_TOO_WEAK,
  IMP_012_SIGNER_CHAIN_INCOMPLETE,
  IMP_013_REGISTRY_MISSING,
  IMP_014_MODE_REQUIRES_FORCE,
  IMP_015_DRY_RUN_VIOLATION,
  IMP_016_PURGE_NOT_FOUND,
] as const;

export function describeImportErrorCode(code: ImportErrorCode): string {
  switch (code) {
    case IMP_001_SIGNATURE_INVALID:
      return 'HMAC-SHA256 signature on imported artifact does not match.';
    case IMP_002_EXPIRY_EXCEEDED:
      return 'Imported artifact has passed its issuedAt + expiresAt window.';
    case IMP_003_VERSION_INCOMPATIBLE:
      return 'Envelope version is not within importer compatible range.';
    case IMP_004_SACRED_PROTECTION_STRIPPED:
      return 'Import would strip sacred-text multi-sig protection.';
    case IMP_005_MIGRATION_BREAKS_RULE:
      return 'Migration path produced a policy that breaks existing rules.';
    case IMP_006_SHADOW_CONFLICT:
      return 'Shadow-only import conflicts with an existing policy of the same id.';
    case IMP_007_INTEGRITY_MISMATCH:
      return 'SHA-256 integrity hash of payload does not match declared hash.';
    case IMP_008_CONSENT_MISSING:
      return 'LGPD Art. 7 explicit consent required before import.';
    case IMP_009_SCHEMA_INVALID:
      return 'Artifact failed JSON Schema validation.';
    case IMP_010_PAYLOAD_TOO_LARGE:
      return 'Payload exceeds the maximum portable artifact size.';
    case IMP_011_KEY_TOO_WEAK:
      return 'Verification key is shorter than the 32-byte minimum.';
    case IMP_012_SIGNER_CHAIN_INCOMPLETE:
      return 'Sacred-text policy requires primary + secondary signer.';
    case IMP_013_REGISTRY_MISSING:
      return 'Local policy registry does not contain the target policy id.';
    case IMP_014_MODE_REQUIRES_FORCE:
      return 'Replace mode requires explicit force flag.';
    case IMP_015_DRY_RUN_VIOLATION:
      return 'A side-effect was attempted during dry-run mode.';
    case IMP_016_PURGE_NOT_FOUND:
      return 'No imported policy exists for the requested importId.';
  }
}

// ============================================================================
// SECTION 2 — SHAPE-only mirror of w52 portable policy types
// ============================================================================
// We do NOT import the w52 module. Instead, we describe the SHAPE we expect
// (structural typing). If a real w52 instance is passed in, TypeScript will
// accept it as long as it satisfies these interfaces.

export type RedactionAction =
  | 'mask'
  | 'drop'
  | 'hash'
  | 'tokenize'
  | 'placeholder'
  | 'allow';

export interface ImportRedactionFieldRule {
  readonly path: string;
  readonly action: RedactionAction;
  readonly pattern?: string;
  readonly preserveLength?: boolean;
  readonly replacement?: string;
  readonly reason?: string;
}

export interface ImportRedactionContext {
  readonly scope: 'public' | 'community' | 'private' | 'admin';
  readonly surface:
    | 'profile'
    | 'journal'
    | 'comment'
    | 'mapa-natal'
    | 'ai-chat'
    | 'export-bundle';
  readonly roles?: readonly string[];
}

export interface ImportRedactionPolicy {
  readonly id: string;
  readonly name: string;
  readonly version: 'v1' | 'v2' | 'portable';
  readonly description?: string;
  readonly fieldRules: readonly ImportRedactionFieldRule[];
  readonly contexts: readonly ImportRedactionContext[];
  readonly protectsSacredText: boolean;
  readonly lgpdArticles: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly authorId: string;
  readonly checksumSeed?: string;
}

export interface ImportRedactionPolicyV1 extends ImportRedactionPolicy {
  readonly version: 'v1';
  readonly schemaVersion: 1;
}

export interface ImportRedactionPolicyV2 extends ImportRedactionPolicy {
  readonly version: 'v2';
  readonly schemaVersion: 2;
  readonly extendV1?: ImportRedactionPolicyV1;
  readonly scopingMatrix?: readonly { context: ImportRedactionContext; rules: readonly string[] }[];
}

export interface ImportPortablePolicyPayload {
  readonly policy: ImportRedactionPolicy;
  readonly extensionFields?: Readonly<Record<string, unknown>>;
  readonly notes?: string;
  readonly locale?: string;
}

export interface ImportSigner {
  readonly id: string;
  readonly role: 'curator' | 'data-steward' | 'compliance-officer' | 'system';
  readonly displayName: string;
  readonly publicKeyFingerprint: string;
  readonly signedAt: string;
}

export interface ImportSignerChain {
  readonly primary: ImportSigner;
  readonly secondary?: ImportSigner;
  readonly tertiary?: ImportSigner;
}

export interface ImportLgpdArticleRef {
  readonly article: '7' | '18' | '20' | '46' | '48';
  readonly description: string;
}

export interface PortablePolicyArtifact {
  readonly envelopeVersion: 1 | 2;
  readonly payload: ImportPortablePolicyPayload;
  readonly signature: string;
  readonly integrityHash: string;
  readonly issuer: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly lgpdArticles: readonly ImportLgpdArticleRef[];
  readonly signerChain: ImportSignerChain;
  readonly auditTrailId: string;
  readonly artifactId: string;
  readonly gracePeriodSeconds?: number;
  readonly migrationFrom?: 'v1' | 'v2' | 'portable';
  readonly migrationTo?: 'v1' | 'v2' | 'portable';
}

export interface ImportConsentProof {
  readonly userId: string;
  readonly grantedAt: string;
  readonly article: '7';
  readonly scope: 'export' | 'portability' | 'deletion' | 'import';
  readonly signature: string;
  readonly ipFingerprint?: string;
}

export interface ImportAuditEntry {
  readonly entryId: string;
  readonly event: 'import' | 'revalidate' | 'reject' | 'purge' | 'revert';
  readonly userId?: string;
  readonly importId?: string;
  readonly artifactId: string;
  readonly lgpdArticles: readonly ImportLgpdArticleRef[];
  readonly signerChain: ImportSignerChain;
  readonly integrityHash: string;
  readonly result: 'success' | 'failure';
  readonly errorCode?: ImportErrorCode;
  readonly timestamp: string;
  readonly notes?: string;
}

// ============================================================================
// SECTION 3 — Import-mode specific types
// ============================================================================

export type ImportMode = 'replace' | 'merge_deep' | 'union_rules' | 'shadow_only';

export const IMPORT_MODES: readonly ImportMode[] = [
  'replace',
  'merge_deep',
  'union_rules',
  'shadow_only',
] as const;

export interface ImportRequest {
  readonly artifact: PortablePolicyArtifact;
  readonly mode: ImportMode;
  readonly dryRun: boolean;
  readonly force?: boolean;
  readonly consentProof?: ImportConsentProof;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
  readonly now?: Date;
  readonly supportedVersions?: readonly number[];
  readonly allowGrace?: boolean;
  readonly targetRegistry?: ImportPolicyRegistry;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface ValidationError {
  readonly path: string;
  readonly code: string;
  readonly message: string;
  readonly expected?: string;
  readonly received?: string;
  readonly severity?: 'error' | 'warning' | 'blocker';
}

export interface ValidationBlocker {
  readonly path: string;
  readonly code: ImportErrorCode;
  readonly message: string;
  readonly field?: string;
}

export interface ValidationOutcome {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationError[];
  readonly blockers: readonly ValidationBlocker[];
}

export interface CompatibilityBlocker {
  readonly code: string;
  readonly description: string;
  readonly severity: 'blocker' | 'warning';
  readonly path?: string;
}

export interface CompatibilityResult {
  readonly compatible: boolean;
  readonly blockers: readonly CompatibilityBlocker[];
  readonly warnings: readonly CompatibilityBlocker[];
  readonly envelopeVersion?: 1 | 2;
  readonly policyVersion?: string;
  readonly supportedEnvelopeVersions: readonly number[];
  readonly missingArticles: readonly ImportLgpdArticleRef['article'][];
}

export type PolicyChangeKind =
  | 'added'
  | 'removed'
  | 'modified'
  | 'sacred-toggled'
  | 'rule-added'
  | 'rule-removed'
  | 'rule-changed'
  | 'context-added'
  | 'context-removed'
  | 'context-changed'
  | 'version-bumped'
  | 'unchanged';

export interface PolicyChange {
  readonly kind: PolicyChangeKind;
  readonly path: string;
  readonly before?: unknown;
  readonly after?: unknown;
  readonly note?: string;
}

export interface ImportDiff {
  readonly added: readonly PolicyChange[];
  readonly removed: readonly PolicyChange[];
  readonly modified: readonly PolicyChange[];
  readonly identical: boolean;
  readonly beforeHash: string;
  readonly afterHash: string;
}

export interface SacredGuard {
  readonly preservedSacred: boolean;
  readonly blockedImport: boolean;
  readonly reason?: string;
  readonly sacredBefore: boolean;
  readonly sacredAfter: boolean;
  readonly requiredSecondary: boolean;
  readonly hasSecondary: boolean;
}

// ============================================================================
// SECTION 4 — Local policy registry types
// ============================================================================

export type MergeStrategy = 'replace' | 'merge_deep' | 'union_rules' | 'shadow';

export interface RegistryEntry {
  readonly policy: ImportRedactionPolicy;
  readonly installedAt: string;
  readonly installedBy: string;
  readonly source: 'native' | 'imported' | 'migrated' | 'shadow';
  readonly importId?: string;
  readonly artifactId?: string;
  readonly sacredVerified: boolean;
  readonly integrityHash: string;
  readonly version: number;
}

export interface ImportPolicyRegistry {
  readonly entries: Readonly<Record<string, RegistryEntry>>;
  readonly schemaVersion: number;
  readonly sacredPolicyIds: readonly string[];
  readonly lgpdEnabled: boolean;
}

export interface ApplyResult {
  readonly applied: boolean;
  readonly mode: ImportMode;
  readonly importId: string;
  readonly diff: ImportDiff;
  readonly registryAfter: ImportPolicyRegistry;
  readonly warnings: readonly string[];
}

export interface ShadowSnapshot {
  readonly importId: string;
  readonly artifactId: string;
  readonly policy: ImportRedactionPolicy;
  readonly storedAt: string;
  readonly neverApplied: true;
  readonly integrityHash: string;
}

// ============================================================================
// SECTION 5 — JSON Schema types (subset used by import validators)
// ============================================================================

export type JsonSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array';

export interface JsonSchemaString {
  readonly type: 'string';
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly format?: 'date-time' | 'date' | 'email' | 'uuid' | 'uri' | 'ipv4' | 'ipv6';
  readonly enum?: readonly string[];
  readonly const?: string;
  readonly description?: string;
}

export interface JsonSchemaNumber {
  readonly type: 'number' | 'integer';
  readonly minimum?: number;
  readonly maximum?: number;
  readonly exclusiveMinimum?: number;
  readonly exclusiveMaximum?: number;
  readonly multipleOf?: number;
  readonly enum?: readonly number[];
  readonly const?: number;
  readonly description?: string;
}

export interface JsonSchemaBoolean {
  readonly type: 'boolean';
  readonly const?: boolean;
  readonly description?: string;
}

export interface JsonSchemaNull {
  readonly type: 'null';
  readonly readonly?: true;
  readonly description?: string;
}

export interface JsonSchemaObject {
  readonly type: 'object';
  readonly properties?: Readonly<Record<string, JsonSchema>>;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean | JsonSchema;
  readonly patternProperties?: Readonly<Record<string, JsonSchema>>;
  readonly minProperties?: number;
  readonly maxProperties?: number;
  readonly description?: string;
}

export interface JsonSchemaArray {
  readonly type: 'array';
  readonly items?: JsonSchema;
  readonly minItems?: number;
  readonly maxItems?: number;
  readonly uniqueItems?: boolean;
  readonly prefixItems?: readonly JsonSchema[];
  readonly description?: string;
}

export type JsonSchema =
  | JsonSchemaString
  | JsonSchemaNumber
  | JsonSchemaBoolean
  | JsonSchemaNull
  | JsonSchemaObject
  | JsonSchemaArray;

export interface JsonSchemaRoot {
  readonly $schema: 'https://json-schema.org/draft/2020-12/schema';
  readonly $id: string;
  readonly title: string;
  readonly description?: string;
  readonly type: 'object';
  readonly properties: Readonly<Record<string, JsonSchema>>;
  readonly required: readonly string[];
  readonly additionalProperties: boolean;
  readonly $defs?: Readonly<Record<string, JsonSchema>>;
}

// ============================================================================
// SECTION 6 — Migration types
// ============================================================================

export type MigrationDirection =
  | 'v1→v2'
  | 'v2→v1'
  | 'v2→portable'
  | 'portable→v2'
  | 'v1→portable'
  | 'portable→v1';

export interface MigrationEntry {
  readonly field: string;
  readonly kind:
    | 'rename'
    | 'wrap'
    | 'unwrap'
    | 'split'
    | 'merge'
    | 'inject'
    | 'strip'
    | 'coerce'
    | 'add'
    | 'remove';
  readonly description: string;
  readonly preserveIfSacred?: boolean;
  readonly sacredRequired?: boolean;
}

export interface MigrationMap {
  readonly v1ToV2: readonly MigrationEntry[];
  readonly v2ToV1: readonly MigrationEntry[];
  readonly v2ToPortable: readonly MigrationEntry[];
  readonly portableToV2: readonly MigrationEntry[];
  readonly v1ToPortable: readonly MigrationEntry[];
  readonly portableToV1: readonly MigrationEntry[];
}

export interface MigrationResult {
  readonly direction: MigrationDirection;
  readonly sourceVersion: string;
  readonly targetVersion: string;
  readonly output: ImportRedactionPolicy;
  readonly appliedEntries: readonly MigrationEntry[];
  readonly warnings: readonly string[];
  readonly blocked: boolean;
  readonly blockReason?: ImportErrorCode;
}


// ============================================================================
// SECTION 7 — HMAC-SHA256 hand-rolled implementation (verify-only emphasis)
// ============================================================================
// FIPS 180-4 SHA-256 + RFC 2104 HMAC. Pure functional, zero deps.

const SHA256_K: Readonly<Uint32Array> = (() => {
  const k = new Uint32Array(64);
  const primes = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  for (let i = 0; i < 64; i++) k[i] = primes[i]!;
  return k;
})();

function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256Compress(state: Uint32Array, block: Uint32Array): void {
  const w = new Uint32Array(64);
  for (let i = 0; i < 16; i++) w[i] = block[i]!;
  for (let i = 16; i < 64; i++) {
    const s0 = rotr(7, w[i - 15]!) ^ rotr(18, w[i - 15]!) ^ (w[i - 15]! >>> 3);
    const s1 = rotr(17, w[i - 2]!) ^ rotr(19, w[i - 2]!) ^ (w[i - 2]! >>> 10);
    w[i] = ((w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0);
  }
  let a = state[0]!;
  let b = state[1]!;
  let c = state[2]!;
  let d = state[3]!;
  let e = state[4]!;
  let f = state[5]!;
  let g = state[6]!;
  let h = state[7]!;
  for (let i = 0; i < 64; i++) {
    const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
    const ch = (e & f) ^ (~e & g);
    const temp1 = (h + S1 + ch + SHA256_K[i]! + w[i]!) >>> 0;
    const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
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
  state[0] = (state[0]! + a) >>> 0;
  state[1] = (state[1]! + b) >>> 0;
  state[2] = (state[2]! + c) >>> 0;
  state[3] = (state[3]! + d) >>> 0;
  state[4] = (state[4]! + e) >>> 0;
  state[5] = (state[5]! + f) >>> 0;
  state[6] = (state[6]! + g) >>> 0;
  state[7] = (state[7]! + h) >>> 0;
}

export function sha256(data: Uint8Array): Uint8Array {
  const state = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const bitLen = data.length * 8;
  const padded = new Uint8Array(Math.ceil((data.length + 9) / 64) * 64);
  padded.set(data);
  padded[data.length] = 0x80;
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  const lenIdx = padded.length - 8;
  padded[lenIdx] = (hi >>> 24) & 0xff;
  padded[lenIdx + 1] = (hi >>> 16) & 0xff;
  padded[lenIdx + 2] = (hi >>> 8) & 0xff;
  padded[lenIdx + 3] = hi & 0xff;
  padded[lenIdx + 4] = (lo >>> 24) & 0xff;
  padded[lenIdx + 5] = (lo >>> 16) & 0xff;
  padded[lenIdx + 6] = (lo >>> 8) & 0xff;
  padded[lenIdx + 7] = lo & 0xff;
  const block = new Uint32Array(16);
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      const off = i + j * 4;
      block[j] = ((padded[off]! << 24) | (padded[off + 1]! << 16) | (padded[off + 2]! << 8) | padded[off + 3]!) >>> 0;
    }
    sha256Compress(state, block);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4] = (state[i]! >>> 24) & 0xff;
    out[i * 4 + 1] = (state[i]! >>> 16) & 0xff;
    out[i * 4 + 2] = (state[i]! >>> 8) & 0xff;
    out[i * 4 + 3] = state[i]! & 0xff;
  }
  return out;
}

export function sha256Hex(data: Uint8Array): string {
  return bytesToHex(sha256(data));
}

export function hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let k: Uint8Array;
  if (key.length > blockSize) {
    k = sha256(key);
  } else if (key.length < blockSize) {
    k = new Uint8Array(blockSize);
    k.set(key);
  } else {
    k = key;
  }
  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = k[i]! ^ 0x5c;
    iKeyPad[i] = k[i]! ^ 0x36;
  }
  const inner = new Uint8Array(blockSize + message.length);
  inner.set(iKeyPad);
  inner.set(message, blockSize);
  const outer = new Uint8Array(blockSize + 32);
  outer.set(oKeyPad);
  outer.set(sha256(inner), blockSize);
  return sha256(outer);
}

export function hmacSha256Hex(key: Uint8Array, message: Uint8Array): string {
  return bytesToHex(hmacSha256(key, message));
}

export function hmacSha256Base64Url(key: Uint8Array, message: Uint8Array): string {
  return bytesToBase64Url(hmacSha256(key, message));
}

// ============================================================================
// SECTION 8 — Encoding helpers
// ============================================================================

export function bytesToHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    s += ((b >>> 4) & 0xf).toString(16);
    s += (b & 0xf).toString(16);
  }
  return s;
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('hex: odd length');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  if (typeof btoa === 'function') return btoa(s);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).Buffer;
  if (B && typeof B.from === 'function') return B.from(bytes).toString('base64');
  return s;
}

export function base64ToBytes(b64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).Buffer;
  if (B && typeof B.from === 'function') return new Uint8Array(B.from(b64, 'base64'));
  return new Uint8Array(0);
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return base64ToBytes(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
}

export function utf8ToBytes(s: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c >= 0xd800 && c <= 0xdbff) {
      const c2 = s.charCodeAt(++i);
      c = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  return new Uint8Array(out);
}

export function bytesToUtf8(b: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(b);
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]!);
  return s;
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i]! ^ b[i]!);
  return diff === 0;
}

export function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function safeEqualHex(a: string, b: string): boolean {
  return ctEq(a.toLowerCase(), b.toLowerCase());
}

// ============================================================================
// SECTION 9 — Salt + key derivation
// ============================================================================

export function generateSalt(length = 16): Uint8Array {
  const out = new Uint8Array(length);
  const cryptoObj: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(out);
  } else {
    // xorshift fallback for non-browser runtimes
    let seed = (Date.now() ^ 0x9e3779b9) >>> 0;
    for (let i = 0; i < out.length; i++) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      out[i] = seed & 0xff;
    }
  }
  return out;
}

export function generateSaltHex(length = 16): string {
  return bytesToHex(generateSalt(length));
}

export interface HkdfOptions {
  readonly ikm: Uint8Array;
  readonly salt?: Uint8Array;
  readonly info?: Uint8Array;
  readonly length?: number;
}

export function hkdfSha256(opts: HkdfOptions): Uint8Array {
  const length = opts.length ?? 32;
  const salt = opts.salt ?? new Uint8Array(32);
  const info = opts.info ?? new Uint8Array(0);
  const prk = hmacSha256(salt, opts.ikm);
  const out = new Uint8Array(length);
  const n = Math.ceil(length / 32);
  if (n > 255) throw new Error('hkdf: length too large');
  let t: Uint8Array = new Uint8Array(0);
  let pos = 0;
  for (let i = 1; i <= n; i++) {
    const next = new Uint8Array(t.length + info.length + 1);
    next.set(t, 0);
    next.set(info, t.length);
    next[next.length - 1] = i;
    t = hmacSha256(prk, next);
    const toCopy = Math.min(32, length - pos);
    out.set(t.subarray(0, toCopy), pos);
    pos += toCopy;
  }
  return out;
}

export function deriveVerificationKey(masterKey: Uint8Array, context: string, length = 32): Uint8Array {
  if (masterKey.length < 16) {
    throw makeImportError(IMP_011_KEY_TOO_WEAK, 'masterKey must be at least 16 bytes', 'masterKey');
  }
  return hkdfSha256({
    ikm: masterKey,
    salt: utf8ToBytes('w53-policy-import-validator'),
    info: utf8ToBytes(context),
    length,
  });
}

export function fingerprintKey(key: Uint8Array): string {
  return sha256Hex(key).substring(0, 16);
}

// ============================================================================
// SECTION 10 — Canonical JSON serializer (deterministic key ordering)
// ============================================================================

export function canonicalJson(value: unknown): string {
  return canonicalJsonInternal(value, new WeakSet<object>());
}

function canonicalJsonInternal(value: unknown, seen: WeakSet<object>): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('canonical: non-finite number');
    return JSON.stringify(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (seen.has(value)) throw new Error('canonical: cycle detected');
    seen.add(value);
    const parts: string[] = [];
    for (const v of value) parts.push(canonicalJsonInternal(v, seen));
    return '[' + parts.join(',') + ']';
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (seen.has(obj)) throw new Error('canonical: cycle detected');
    seen.add(obj);
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
    const parts: string[] = [];
    for (const k of keys) {
      parts.push(JSON.stringify(k) + ':' + canonicalJsonInternal(obj[k], seen));
    }
    return '{' + parts.join(',') + '}';
  }
  if (typeof value === 'undefined') return 'null';
  throw new Error('canonical: unsupported value type');
}

// ============================================================================
// SECTION 11 — JSON Schema emitters (subset used for import validation)
// ============================================================================

export function emitStringSchema(opts: {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: JsonSchemaString['format'];
  enum?: readonly string[];
  const?: string;
  description?: string;
} = {}): JsonSchemaString {
  const out: Record<string, unknown> = { type: 'string' };
  if (opts.minLength !== undefined) out.minLength = opts.minLength;
  if (opts.maxLength !== undefined) out.maxLength = opts.maxLength;
  if (opts.pattern !== undefined) out.pattern = opts.pattern;
  if (opts.format !== undefined) out.format = opts.format;
  if (opts.enum !== undefined) out.enum = opts.enum;
  if (opts.const !== undefined) out.const = opts.const;
  if (opts.description !== undefined) out.description = opts.description;
  return out as unknown as JsonSchemaString;
}

export function emitNumberSchema(opts: {
  type?: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  enum?: readonly number[];
  const?: number;
  description?: string;
} = {}): JsonSchemaNumber {
  const out: Record<string, unknown> = { type: opts.type ?? 'number' };
  if (opts.minimum !== undefined) out.minimum = opts.minimum;
  if (opts.maximum !== undefined) out.maximum = opts.maximum;
  if (opts.exclusiveMinimum !== undefined) out.exclusiveMinimum = opts.exclusiveMinimum;
  if (opts.exclusiveMaximum !== undefined) out.exclusiveMaximum = opts.exclusiveMaximum;
  if (opts.multipleOf !== undefined) out.multipleOf = opts.multipleOf;
  if (opts.enum !== undefined) out.enum = opts.enum;
  if (opts.const !== undefined) out.const = opts.const;
  if (opts.description !== undefined) out.description = opts.description;
  return out as unknown as JsonSchemaNumber;
}

export function emitIntegerSchema(opts: {
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  description?: string;
} = {}): JsonSchemaNumber {
  return emitNumberSchema({ ...opts, type: 'integer' });
}

export function emitBooleanSchema(opts: { const?: boolean; description?: string } = {}): JsonSchemaBoolean {
  const out: Record<string, unknown> = { type: 'boolean' };
  if (opts.const !== undefined) out.const = opts.const;
  if (opts.description !== undefined) out.description = opts.description;
  return out as unknown as JsonSchemaBoolean;
}

export function emitNullSchema(description?: string): JsonSchemaNull {
  return description !== undefined ? { type: 'null', description } : { type: 'null' };
}

export function emitObjectSchema(opts: {
  properties?: Readonly<Record<string, JsonSchema>>;
  required?: readonly string[];
  additionalProperties?: boolean | JsonSchema;
  patternProperties?: Readonly<Record<string, JsonSchema>>;
  minProperties?: number;
  maxProperties?: number;
  description?: string;
} = {}): JsonSchemaObject {
  const out: Record<string, unknown> = { type: 'object' };
  if (opts.properties !== undefined) out.properties = opts.properties;
  if (opts.required !== undefined) out.required = opts.required;
  if (opts.additionalProperties !== undefined) out.additionalProperties = opts.additionalProperties;
  if (opts.patternProperties !== undefined) out.patternProperties = opts.patternProperties;
  if (opts.minProperties !== undefined) out.minProperties = opts.minProperties;
  if (opts.maxProperties !== undefined) out.maxProperties = opts.maxProperties;
  if (opts.description !== undefined) out.description = opts.description;
  return out as unknown as JsonSchemaObject;
}

export function emitArraySchema(opts: {
  items?: JsonSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  prefixItems?: readonly JsonSchema[];
  description?: string;
} = {}): JsonSchemaArray {
  const out: Record<string, unknown> = { type: 'array' };
  if (opts.items !== undefined) out.items = opts.items;
  if (opts.minItems !== undefined) out.minItems = opts.minItems;
  if (opts.maxItems !== undefined) out.maxItems = opts.maxItems;
  if (opts.uniqueItems !== undefined) out.uniqueItems = opts.uniqueItems;
  if (opts.prefixItems !== undefined) out.prefixItems = opts.prefixItems;
  if (opts.description !== undefined) out.description = opts.description;
  return out as unknown as JsonSchemaArray;
}

export function emitEnumSchema(opts: {
  values: readonly (string | number | boolean)[];
  description?: string;
}): JsonSchema {
  if (opts.values.length === 0) throw new Error('enum: empty values');
  const first = opts.values[0]!;
  if (typeof first === 'string') {
    const out: Record<string, unknown> = { type: 'string', enum: opts.values };
    if (opts.description !== undefined) out.description = opts.description;
    return out as unknown as JsonSchema;
  }
  if (typeof first === 'number') {
    const out: Record<string, unknown> = { type: 'number', enum: opts.values };
    if (opts.description !== undefined) out.description = opts.description;
    return out as unknown as JsonSchema;
  }
  const out: Record<string, unknown> = { type: 'boolean', enum: opts.values };
  if (opts.description !== undefined) out.description = opts.description;
  return out as unknown as JsonSchema;
}

export function emitConstSchema(
  value: string | number | boolean | null,
  description?: string,
): JsonSchema {
  if (value === null) {
    return description !== undefined
      ? ({ type: 'null', description } as JsonSchemaNull)
      : ({ type: 'null' } as JsonSchemaNull);
  }
  if (typeof value === 'string') {
    const out: Record<string, unknown> = { type: 'string', const: value };
    if (description !== undefined) out.description = description;
    return out as unknown as JsonSchema;
  }
  if (typeof value === 'number') {
    const out: Record<string, unknown> = { type: 'number', const: value };
    if (description !== undefined) out.description = description;
    return out as unknown as JsonSchema;
  }
  const out: Record<string, unknown> = { type: 'boolean', const: value };
  if (description !== undefined) out.description = description;
  return out as unknown as JsonSchema;
}

export function emitAnySchema(description?: string): JsonSchemaObject {
  return description !== undefined
    ? { type: 'object', additionalProperties: true, description }
    : { type: 'object', additionalProperties: true };
}

// ============================================================================
// SECTION 12 — RedactionPolicy → JSON Schema emitter (import-side)
// ============================================================================

export function emitImportRedactionActionSchema(): JsonSchema {
  return emitEnumSchema({
    values: ['mask', 'drop', 'hash', 'tokenize', 'placeholder', 'allow'],
    description: 'Action applied when a field matches the rule pattern.',
  });
}

export function emitImportRedactionFieldRuleSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      path: emitStringSchema({ minLength: 1, description: 'JSONPath within the payload.' }),
      action: emitImportRedactionActionSchema(),
      pattern: emitStringSchema({ description: 'Optional regex.' }),
      preserveLength: emitBooleanSchema({ description: 'Keep byte length on mask.' }),
      replacement: emitStringSchema({ description: 'Custom replacement token.' }),
      reason: emitStringSchema({ description: 'Human-readable explanation.' }),
    },
    required: ['path', 'action'],
    additionalProperties: false,
    description: 'A single redaction rule.',
  });
}

export function emitImportRedactionContextSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      scope: emitEnumSchema({ values: ['public', 'community', 'private', 'admin'] }),
      surface: emitEnumSchema({
        values: ['profile', 'journal', 'comment', 'mapa-natal', 'ai-chat', 'export-bundle'],
      }),
      roles: emitArraySchema({
        items: emitStringSchema(),
        uniqueItems: true,
        description: 'Role IDs allowed to see unredacted content.',
      }),
    },
    required: ['scope', 'surface'],
    additionalProperties: false,
    description: 'Where this policy applies.',
  });
}

export function emitImportRedactionPolicySchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      id: emitStringSchema({ format: 'uuid' }),
      name: emitStringSchema({ minLength: 1, maxLength: 200 }),
      version: emitEnumSchema({ values: ['v1', 'v2', 'portable'] }),
      description: emitStringSchema(),
      fieldRules: emitArraySchema({ items: emitImportRedactionFieldRuleSchema(), minItems: 0 }),
      contexts: emitArraySchema({ items: emitImportRedactionContextSchema(), minItems: 1 }),
      protectsSacredText: emitBooleanSchema(),
      lgpdArticles: emitArraySchema({ items: emitStringSchema() }),
      createdAt: emitStringSchema({ format: 'date-time' }),
      updatedAt: emitStringSchema({ format: 'date-time' }),
      authorId: emitStringSchema({ format: 'uuid' }),
      checksumSeed: emitStringSchema(),
    },
    required: [
      'id',
      'name',
      'version',
      'fieldRules',
      'contexts',
      'protectsSacredText',
      'lgpdArticles',
      'createdAt',
      'updatedAt',
      'authorId',
    ],
    additionalProperties: true,
    description: 'A complete redaction policy.',
  });
}

export function emitPortablePolicyArtifactSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      envelopeVersion: emitEnumSchema({ values: [1, 2] }),
      payload: emitObjectSchema({
        properties: {
          policy: emitImportRedactionPolicySchema(),
          extensionFields: emitAnySchema('Free-form extension payload.'),
          notes: emitStringSchema(),
          locale: emitStringSchema(),
        },
        required: ['policy'],
        additionalProperties: true,
        description: 'Portable payload envelope.',
      }),
      signature: emitStringSchema({ minLength: 32, description: 'Base64url HMAC-SHA256.' }),
      integrityHash: emitStringSchema({ pattern: '^[0-9a-f]{64}$', description: 'SHA-256 of canonical JSON payload.' }),
      issuer: emitStringSchema({ description: 'Origin system / domain.' }),
      issuedAt: emitStringSchema({ format: 'date-time' }),
      expiresAt: emitStringSchema({ format: 'date-time' }),
      lgpdArticles: emitArraySchema({
        items: emitObjectSchema({
          properties: {
            article: emitEnumSchema({ values: ['7', '18', '20', '46', '48'] }),
            description: emitStringSchema(),
          },
          required: ['article', 'description'],
          additionalProperties: false,
        }),
        minItems: 1,
      }),
      signerChain: emitImportSignerChainSchema(),
      auditTrailId: emitStringSchema({ format: 'uuid' }),
      artifactId: emitStringSchema({ format: 'uuid' }),
      gracePeriodSeconds: emitIntegerSchema({ minimum: 0 }),
      migrationFrom: emitEnumSchema({ values: ['v1', 'v2', 'portable'] }),
      migrationTo: emitEnumSchema({ values: ['v1', 'v2', 'portable'] }),
    },
    required: [
      'envelopeVersion',
      'payload',
      'signature',
      'integrityHash',
      'issuer',
      'issuedAt',
      'expiresAt',
      'lgpdArticles',
      'signerChain',
      'auditTrailId',
      'artifactId',
    ],
    additionalProperties: false,
    description: 'Top-level portable artifact envelope.',
  });
}

export function emitImportSignerChainSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      primary: emitImportSignerSchema(),
      secondary: emitImportSignerSchema(),
      tertiary: emitImportSignerSchema(),
    },
    required: ['primary'],
    additionalProperties: false,
    description: 'Ordered list of cosigners; secondary/tertiary mandatory for sacred text.',
  });
}

export function emitImportSignerSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      id: emitStringSchema({ format: 'uuid' }),
      role: emitEnumSchema({ values: ['curator', 'data-steward', 'compliance-officer', 'system'] }),
      displayName: emitStringSchema({ minLength: 1 }),
      publicKeyFingerprint: emitStringSchema({ pattern: '^[0-9a-f]{16}$' }),
      signedAt: emitStringSchema({ format: 'date-time' }),
    },
    required: ['id', 'role', 'displayName', 'publicKeyFingerprint', 'signedAt'],
    additionalProperties: false,
  });
}

export function emitImportRequestSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      artifact: emitPortablePolicyArtifactSchema(),
      mode: emitEnumSchema({ values: ['replace', 'merge_deep', 'union_rules', 'shadow_only'] }),
      dryRun: emitBooleanSchema(),
      force: emitBooleanSchema(),
      consentProof: emitImportConsentProofSchema(),
      primaryKey: emitAnySchema('Verification primary key bytes.'),
      secondaryKey: emitAnySchema('Verification secondary key bytes.'),
      tertiaryKey: emitAnySchema('Verification tertiary key bytes.'),
      now: emitAnySchema('Optional override for current Date.'),
      supportedVersions: emitArraySchema({ items: emitIntegerSchema() }),
      allowGrace: emitBooleanSchema(),
      targetRegistry: emitAnySchema('Local policy registry (optional).'),
      metadata: emitAnySchema('Free-form metadata.'),
    },
    required: ['artifact', 'mode', 'dryRun', 'primaryKey'],
    additionalProperties: false,
    description: 'Import request shape.',
  });
}

export function emitImportConsentProofSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      userId: emitStringSchema({ format: 'uuid' }),
      grantedAt: emitStringSchema({ format: 'date-time' }),
      article: emitConstSchema('7', 'LGPD article granting consent.'),
      scope: emitEnumSchema({ values: ['export', 'portability', 'deletion', 'import'] }),
      signature: emitStringSchema({ minLength: 32 }),
      ipFingerprint: emitStringSchema(),
    },
    required: ['userId', 'grantedAt', 'article', 'scope', 'signature'],
    additionalProperties: false,
  });
}

// ============================================================================
// SECTION 13 — Schema self-validator (subset; deep enough for round-trip)
// ============================================================================

export function validateAgainstSchema(value: unknown, schema: JsonSchema, path = '$'): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  validateInternal(value, schema, path, errors, warnings, blockers);
  return { valid: errors.length === 0, errors, warnings, blockers };
}

function validateInternal(
  value: unknown,
  schema: JsonSchema,
  path: string,
  errors: ValidationError[],
  warnings: ValidationError[],
  blockers: ValidationBlocker[],
): void {
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push({ path, code: 'type', message: 'expected string', received: typeof value });
        return;
      }
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push({
          path,
          code: 'minLength',
          message: `length < ${schema.minLength}`,
          received: String(value.length),
        });
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push({
          path,
          code: 'maxLength',
          message: `length > ${schema.maxLength}`,
          received: String(value.length),
        });
      }
      if (schema.pattern !== undefined) {
        try {
          const re = new RegExp(schema.pattern);
          if (!re.test(value)) errors.push({ path, code: 'pattern', message: 'pattern mismatch', received: value });
        } catch {
          warnings.push({ path, code: 'pattern-invalid', message: 'invalid regex pattern' });
        }
      }
      if (schema.enum !== undefined && !schema.enum.includes(value)) {
        errors.push({ path, code: 'enum', message: 'not in enum' });
      }
      if (schema.const !== undefined && schema.const !== value) {
        errors.push({ path, code: 'const', message: 'must equal const' });
      }
      return;
    case 'number':
    case 'integer': {
      if (typeof value !== 'number') {
        errors.push({ path, code: 'type', message: `expected ${schema.type}`, received: typeof value });
        return;
      }
      if (schema.type === 'integer' && !Number.isInteger(value)) {
        errors.push({ path, code: 'integer', message: 'expected integer' });
      }
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({ path, code: 'minimum', message: `value < ${schema.minimum}`, received: String(value) });
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({ path, code: 'maximum', message: `value > ${schema.maximum}`, received: String(value) });
      }
      if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) {
        errors.push({ path, code: 'exclusiveMinimum', message: `value <= ${schema.exclusiveMinimum}` });
      }
      if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
        errors.push({ path, code: 'exclusiveMaximum', message: `value >= ${schema.exclusiveMaximum}` });
      }
      if (schema.multipleOf !== undefined && value % schema.multipleOf !== 0) {
        errors.push({ path, code: 'multipleOf', message: `not multiple of ${schema.multipleOf}` });
      }
      if (schema.enum !== undefined && !schema.enum.includes(value)) {
        errors.push({ path, code: 'enum', message: 'not in enum' });
      }
      if (schema.const !== undefined && schema.const !== value) {
        errors.push({ path, code: 'const', message: 'must equal const' });
      }
      return;
    }
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push({ path, code: 'type', message: 'expected boolean', received: typeof value });
      } else if (schema.const !== undefined && schema.const !== value) {
        errors.push({ path, code: 'const', message: 'must equal const' });
      }
      return;
    case 'null':
      if (value !== null) errors.push({ path, code: 'type', message: 'expected null', received: typeof value });
      return;
    case 'array': {
      if (!Array.isArray(value)) {
        errors.push({ path, code: 'type', message: 'expected array', received: typeof value });
        return;
      }
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        errors.push({
          path,
          code: 'minItems',
          message: `items < ${schema.minItems}`,
          received: String(value.length),
        });
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        errors.push({
          path,
          code: 'maxItems',
          message: `items > ${schema.maxItems}`,
          received: String(value.length),
        });
      }
      if (schema.uniqueItems) {
        const seen = new Set<string>();
        for (const v of value) {
          const k = canonicalJson(v);
          if (seen.has(k)) {
            errors.push({ path, code: 'uniqueItems', message: 'duplicate items not allowed' });
            break;
          }
          seen.add(k);
        }
      }
      if (schema.items) {
        for (let i = 0; i < value.length; i++) {
          validateInternal(value[i], schema.items, `${path}[${i}]`, errors, warnings, blockers);
        }
      }
      return;
    }
    case 'object': {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        errors.push({ path, code: 'type', message: 'expected object', received: typeof value });
        return;
      }
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj).filter((k) => obj[k] !== undefined);
      if (schema.minProperties !== undefined && keys.length < schema.minProperties) {
        errors.push({ path, code: 'minProperties', message: `properties < ${schema.minProperties}` });
      }
      if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) {
        errors.push({ path, code: 'maxProperties', message: `properties > ${schema.maxProperties}` });
      }
      if (schema.required) {
        for (const req of schema.required) {
          if (!(req in obj)) errors.push({ path, code: 'required', message: `missing required: ${req}` });
        }
      }
      const props = schema.properties ?? {};
      const patternProps = schema.patternProperties ?? {};
      const propRegexes = Object.keys(patternProps).map((p) => ({ p, re: new RegExp(p) }));
      for (const k of keys) {
        if (k in props) {
          validateInternal(obj[k], props[k]!, `${path}.${k}`, errors, warnings, blockers);
        } else if (propRegexes.some(({ p, re }) => re.test(k))) {
          for (const { p, re } of propRegexes) {
            if (re.test(k)) validateInternal(obj[k], patternProps[p]!, `${path}.${k}`, errors, warnings, blockers);
          }
        } else if (schema.additionalProperties === false) {
          errors.push({ path: `${path}.${k}`, code: 'additional', message: 'additional property not allowed' });
        } else if (typeof schema.additionalProperties === 'object') {
          validateInternal(
            obj[k],
            schema.additionalProperties,
            `${path}.${k}`,
            errors,
            warnings,
            blockers,
          );
        }
      }
      return;
    }
  }
}

// ============================================================================
// SECTION 14 — Integrity + signature verification (verify-only emphasis)
// ============================================================================

export function hashIntegrity(payload: ImportPortablePolicyPayload): string {
  return sha256Hex(utf8ToBytes(canonicalJson(payload)));
}

export interface VerifySignatureOptions {
  readonly artifact: PortablePolicyArtifact;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
}

export function verifySignature(opts: VerifySignatureOptions): boolean {
  if (opts.primaryKey.length < 16) return false;
  const expected = hashIntegrity(opts.artifact.payload);
  if (!ctEq(expected, opts.artifact.integrityHash)) return false;
  const toSign = canonicalJson({ ...opts.artifact, signature: '' });
  let chainInput = hmacSha256(opts.primaryKey, utf8ToBytes(toSign));
  if (opts.secondaryKey) chainInput = hmacSha256(opts.secondaryKey, chainInput);
  if (opts.tertiaryKey) chainInput = hmacSha256(opts.tertiaryKey, chainInput);
  return ctEq(bytesToBase64Url(chainInput), opts.artifact.signature);
}

export interface VerifyWithChainOptions {
  readonly artifact: PortablePolicyArtifact;
  readonly chain: ImportSignerChain;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
}

export function verifyWithChain(opts: VerifyWithChainOptions): boolean {
  return verifySignature({
    artifact: opts.artifact,
    primaryKey: opts.primaryKey,
    secondaryKey: opts.secondaryKey,
    tertiaryKey: opts.tertiaryKey,
  });
}

export function chainSigners(
  primary: ImportSigner,
  secondary?: ImportSigner,
  tertiary?: ImportSigner,
): ImportSignerChain {
  const out: Record<string, unknown> = { primary };
  if (secondary) out.secondary = secondary;
  if (tertiary) out.tertiary = tertiary;
  return out as unknown as ImportSignerChain;
}

export function isSacredSignerChain(chain: ImportSignerChain): boolean {
  return chain.secondary !== undefined;
}

export function validateSignerChain(chain: ImportSignerChain, sacred: boolean): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  if (!chain.primary) {
    errors.push({ path: 'signerChain.primary', code: 'required', message: 'primary signer required' });
  }
  if (sacred && !chain.secondary) {
    errors.push({
      path: 'signerChain.secondary',
      code: 'sacred-required',
      message: 'sacred-text policy requires secondary curator co-signer',
    });
    blockers.push({
      path: 'signerChain.secondary',
      code: IMP_012_SIGNER_CHAIN_INCOMPLETE,
      message: 'sacred-text policy requires secondary curator co-signer',
      field: 'signerChain.secondary',
    });
  }
  if (chain.tertiary && !chain.secondary) {
    warnings.push({
      path: 'signerChain.tertiary',
      code: 'unusual-order',
      message: 'tertiary signer without secondary is unconventional',
    });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

export function assertSignerChain(chain: ImportSignerChain, sacred: boolean): void {
  const r = validateSignerChain(chain, sacred);
  if (!r.valid) {
    throw makeImportError(
      IMP_012_SIGNER_CHAIN_INCOMPLETE,
      r.errors.map((e) => e.message).join('; '),
      'signerChain',
    );
  }
}

// ============================================================================
// SECTION 15 — Expiry + grace period (import-side)
// ============================================================================

export interface ExpiryCheckResult {
  readonly expired: boolean;
  readonly inGracePeriod: boolean;
  readonly gracePeriodExhausted: boolean;
  readonly secondsToExpiry: number;
  readonly secondsIntoGrace: number;
}

export function checkExpiry(artifact: PortablePolicyArtifact, now: Date = new Date()): ExpiryCheckResult {
  const expiresAt = Date.parse(artifact.expiresAt);
  const issuedAt = Date.parse(artifact.issuedAt);
  const nowMs = now.getTime();
  const grace = (artifact.gracePeriodSeconds ?? 0) * 1000;
  const graceEnd = expiresAt + grace;
  const expired = nowMs > expiresAt;
  const inGrace = expired && nowMs <= graceEnd;
  const graceExhausted = expired && nowMs > graceEnd;
  return {
    expired,
    inGracePeriod: inGrace,
    gracePeriodExhausted: graceExhausted,
    secondsToExpiry: Math.floor((expiresAt - nowMs) / 1000),
    secondsIntoGrace: graceExhausted ? Math.floor((nowMs - graceEnd) / 1000) : 0,
  };
}

export function validateExpiry(artifact: PortablePolicyArtifact, now: Date = new Date()): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  if (Number.isNaN(Date.parse(artifact.issuedAt))) {
    errors.push({ path: 'issuedAt', code: 'date', message: 'invalid date-time' });
  }
  if (Number.isNaN(Date.parse(artifact.expiresAt))) {
    errors.push({ path: 'expiresAt', code: 'date', message: 'invalid date-time' });
  }
  const issuedAt = Date.parse(artifact.issuedAt);
  const expiresAt = Date.parse(artifact.expiresAt);
  if (!Number.isNaN(issuedAt) && !Number.isNaN(expiresAt) && expiresAt <= issuedAt) {
    errors.push({ path: 'expiresAt', code: 'range', message: 'expiresAt must be after issuedAt' });
  }
  const check = checkExpiry(artifact, now);
  if (check.expired && !check.inGracePeriod) {
    errors.push({ path: 'expiresAt', code: 'expired', message: 'artifact expired and grace exhausted' });
    blockers.push({
      path: 'expiresAt',
      code: IMP_002_EXPIRY_EXCEEDED,
      message: 'artifact expired and grace exhausted',
      field: 'expiresAt',
    });
  } else if (check.inGracePeriod) {
    warnings.push({ path: 'expiresAt', code: 'in-grace', message: `in grace period: ${check.secondsIntoGrace}s remaining` });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

// ============================================================================
// SECTION 16 — Compatibility checks
// ============================================================================

export const W53_SUPPORTED_ENVELOPE_VERSIONS: readonly number[] = [1, 2] as const;
export const W53_REQUIRED_LGPD_ARTICLES: readonly ImportLgpdArticleRef['article'][] = ['18', '20'] as const;

export function checkCompatibility(
  artifact: PortablePolicyArtifact,
  supported: readonly number[] = W53_SUPPORTED_ENVELOPE_VERSIONS,
): CompatibilityResult {
  const blockers: CompatibilityBlocker[] = [];
  const warnings: CompatibilityBlocker[] = [];
  const missingArticles: ImportLgpdArticleRef['article'][] = [];

  if (!supported.includes(artifact.envelopeVersion)) {
    blockers.push({
      code: 'envelope-version',
      description: `envelopeVersion=${artifact.envelopeVersion} not in supported=[${supported.join(',')}]`,
      severity: 'blocker',
    });
  }
  if (artifact.envelopeVersion === 1 && artifact.signerChain.tertiary !== undefined) {
    warnings.push({
      code: 'v1-tertiary',
      description: 'envelope v1 ignores tertiary signer',
      severity: 'warning',
    });
  }
  if (artifact.payload.policy.protectsSacredText && !artifact.signerChain.secondary) {
    blockers.push({
      code: 'sacred-no-cosigner',
      description: 'sacred-text policy without secondary curator',
      severity: 'blocker',
    });
  }
  for (const required of W53_REQUIRED_LGPD_ARTICLES) {
    if (!artifact.lgpdArticles.some((a) => a.article === required)) {
      missingArticles.push(required);
      blockers.push({
        code: `lgpd-${required}-missing`,
        description: `portable artifact must reference LGPD art. ${required}`,
        severity: 'blocker',
      });
    }
  }
  return {
    compatible: blockers.length === 0,
    blockers,
    warnings,
    envelopeVersion: artifact.envelopeVersion,
    policyVersion: artifact.payload.policy.version,
    supportedEnvelopeVersions: supported,
    missingArticles,
  };
}

export function validateCompatibility(
  artifact: PortablePolicyArtifact,
  supported: readonly number[] = W53_SUPPORTED_ENVELOPE_VERSIONS,
): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  const r = checkCompatibility(artifact, supported);
  for (const b of r.blockers) {
    errors.push({ path: b.path ?? '$', code: b.code, message: b.description });
    blockers.push({ path: b.path ?? '$', code: IMP_003_VERSION_INCOMPATIBLE, message: b.description, field: b.path });
  }
  for (const w of r.warnings) {
    warnings.push({ path: w.path ?? '$', code: w.code, message: w.description });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

// ============================================================================
// SECTION 17 — Migration map + runner (import-side adapters)
// ============================================================================

export function defaultMigrationMap(): MigrationMap {
  return {
    v1ToV2: [
      { field: 'schemaVersion', kind: 'add', description: 'schemaVersion=2 added' },
      { field: 'scopingMatrix', kind: 'add', description: 'scopingMatrix populated from contexts+roles' },
      { field: 'extendV1', kind: 'inject', description: 'embed original v1 as extendV1' },
    ],
    v2ToV1: [
      { field: 'scopingMatrix', kind: 'strip', description: 'drop scopingMatrix (lossy)' },
      { field: 'extendV1', kind: 'strip', description: 'drop extendV1 (lossy)' },
      { field: 'schemaVersion', kind: 'coerce', description: 'schemaVersion → 1' },
    ],
    v2ToPortable: [
      { field: 'payload', kind: 'wrap', description: 'wrap policy in PortablePolicyPayload' },
      { field: 'signerChain', kind: 'inject', description: 'signer chain added (curator + compliance)' },
      { field: 'lgpdArticles', kind: 'inject', description: 'LGPD refs injected from policy' },
    ],
    portableToV2: [
      { field: 'payload.policy', kind: 'unwrap', description: 'unwrap portable payload to top-level policy' },
      { field: 'signerChain', kind: 'strip', description: 'signer chain dropped (metadata only)' },
      { field: 'lgpdArticles', kind: 'coerce', description: 'LGPD refs folded into policy.lgpdArticles' },
    ],
    v1ToPortable: [
      { field: 'schemaVersion', kind: 'coerce', description: 'force schemaVersion=1' },
      { field: 'payload', kind: 'wrap', description: 'wrap in portable envelope' },
      { field: 'signerChain', kind: 'inject', description: 'sacred-aware signer chain' },
    ],
    portableToV1: [
      { field: 'payload', kind: 'unwrap', description: 'unwrap portable payload' },
      { field: 'signerChain', kind: 'strip', description: 'signer chain stripped' },
      { field: 'schemaVersion', kind: 'coerce', description: 'coerce to schemaVersion=1' },
    ],
  };
}

export function findMigrationEntries(map: MigrationMap, direction: MigrationDirection): readonly MigrationEntry[] {
  switch (direction) {
    case 'v1→v2':
      return map.v1ToV2;
    case 'v2→v1':
      return map.v2ToV1;
    case 'v2→portable':
      return map.v2ToPortable;
    case 'portable→v2':
      return map.portableToV2;
    case 'v1→portable':
      return map.v1ToPortable;
    case 'portable→v1':
      return map.portableToV1;
  }
}

export function validateMigration(
  map: MigrationMap,
  direction: MigrationDirection,
  sacred: boolean,
): ValidationOutcome {
  const entries = findMigrationEntries(map, direction);
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  if (entries.length === 0) {
    errors.push({ path: direction, code: 'empty', message: 'no migration entries' });
    blockers.push({
      path: direction,
      code: IMP_003_VERSION_INCOMPATIBLE,
      message: 'no migration entries',
      field: 'direction',
    });
    return { valid: false, errors, warnings, blockers };
  }
  if (sacred) {
    if (direction === 'v2→v1' || direction === 'portable→v1' || direction === 'portable→v2') {
      const strips = entries.filter(
        (e) => e.kind === 'strip' && (e.field === 'signerChain' || e.field === 'extendV1'),
      );
      if (strips.length > 0 && !strips.every((e) => e.preserveIfSacred)) {
        errors.push({
          path: direction,
          code: 'sacred-protection-loss',
          message: 'migration strips sacred-text multi-sig protection',
        });
        blockers.push({
          path: direction,
          code: IMP_004_SACRED_PROTECTION_STRIPPED,
          message: 'migration strips sacred-text multi-sig protection',
          field: 'direction',
        });
      }
    }
  }
  for (const entry of entries) {
    if (entry.kind === 'strip' && entry.preserveIfSacred && sacred) {
      warnings.push({
        path: `${direction}.${entry.field}`,
        code: 'sacred-preserve',
        message: `strip preserved because sacred`,
      });
    }
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

// ============================================================================
// SECTION 18 — Migration runners
// ============================================================================

export interface MigrateOptions {
  readonly map?: MigrationMap;
  readonly preserveSacred?: boolean;
  readonly auditTrailId?: string;
  readonly artifactId?: string;
  readonly enforceSacred?: boolean;
}

export function detectDirection(from: string, to: string): MigrationDirection {
  const k = `${from}→${to}`;
  switch (k) {
    case 'v1→v2':
    case 'v2→v1':
    case 'v2→portable':
    case 'portable→v2':
    case 'v1→portable':
    case 'portable→v1':
      return k;
    default:
      throw makeImportError(IMP_003_VERSION_INCOMPATIBLE, `unsupported migration path: ${k}`, 'direction');
  }
}

export function portableV1ToNative(payload: ImportPortablePolicyPayload, opts: MigrateOptions = {}): MigrationResult {
  const map = opts.map ?? defaultMigrationMap();
  const policy = payload.policy;
  if (policy.version !== 'v1' && policy.version !== 'portable') {
    throw makeImportError(IMP_003_VERSION_INCOMPATIBLE, 'expected v1 or portable', 'policy.version');
  }
  const sacred = policy.protectsSacredText;
  const val = validateMigration(map, 'portable→v1', sacred);
  const warnings = val.warnings.map((w) => w.message);
  if (!val.valid) {
    return {
      direction: 'portable→v1',
      sourceVersion: policy.version,
      targetVersion: 'v1',
      output: policy,
      appliedEntries: [],
      warnings: [...warnings, ...val.errors.map((e) => e.message)],
      blocked: true,
      blockReason: IMP_004_SACRED_PROTECTION_STRIPPED,
    };
  }
  const v1: ImportRedactionPolicyV1 = {
    id: policy.id,
    name: policy.name,
    version: 'v1',
    schemaVersion: 1,
    description: policy.description,
    fieldRules: policy.fieldRules,
    contexts: policy.contexts,
    protectsSacredText: policy.protectsSacredText,
    lgpdArticles: policy.lgpdArticles,
    createdAt: policy.createdAt,
    updatedAt: policy.updatedAt,
    authorId: policy.authorId,
    checksumSeed: policy.checksumSeed,
  };
  return {
    direction: 'portable→v1',
    sourceVersion: policy.version,
    targetVersion: 'v1',
    output: v1,
    appliedEntries: map.portableToV1,
    warnings,
    blocked: false,
  };
}

export function portableV2ToNative(payload: ImportPortablePolicyPayload, opts: MigrateOptions = {}): MigrationResult {
  const map = opts.map ?? defaultMigrationMap();
  const policy = payload.policy;
  if (policy.version !== 'v2' && policy.version !== 'portable') {
    throw makeImportError(IMP_003_VERSION_INCOMPATIBLE, 'expected v2 or portable', 'policy.version');
  }
  const sacred = policy.protectsSacredText;
  const val = validateMigration(map, 'portable→v2', sacred);
  const warnings = val.warnings.map((w) => w.message);
  if (!val.valid) {
    return {
      direction: 'portable→v2',
      sourceVersion: policy.version,
      targetVersion: 'v2',
      output: policy,
      appliedEntries: [],
      warnings: [...warnings, ...val.errors.map((e) => e.message)],
      blocked: true,
      blockReason: IMP_004_SACRED_PROTECTION_STRIPPED,
    };
  }
  const v2: ImportRedactionPolicyV2 = {
    id: policy.id,
    name: policy.name,
    version: 'v2',
    schemaVersion: 2,
    description: policy.description,
    fieldRules: policy.fieldRules,
    contexts: policy.contexts,
    protectsSacredText: policy.protectsSacredText,
    lgpdArticles: policy.lgpdArticles,
    createdAt: policy.createdAt,
    updatedAt: policy.updatedAt,
    authorId: policy.authorId,
    extendV1: undefined,
    scopingMatrix: policy.contexts.map((c) => ({
      context: c,
      rules: policy.fieldRules.map((r) => r.path),
    })),
  };
  return {
    direction: 'portable→v2',
    sourceVersion: policy.version,
    targetVersion: 'v2',
    output: v2,
    appliedEntries: map.portableToV2,
    warnings,
    blocked: false,
  };
}

export function nativeToPortableV1(policy: ImportRedactionPolicy, opts: MigrateOptions = {}): MigrationResult {
  const map = opts.map ?? defaultMigrationMap();
  if (policy.version !== 'v1') {
    throw makeImportError(IMP_003_VERSION_INCOMPATIBLE, 'expected v1', 'policy.version');
  }
  const sacred = policy.protectsSacredText;
  const val = validateMigration(map, 'v1→portable', sacred);
  const warnings = val.warnings.map((w) => w.message);
  return {
    direction: 'v1→portable',
    sourceVersion: 'v1',
    targetVersion: 'portable',
    output: policy,
    appliedEntries: map.v1ToPortable,
    warnings,
    blocked: !val.valid,
    blockReason: !val.valid ? IMP_005_MIGRATION_BREAKS_RULE : undefined,
  };
}

export function nativeToPortableV2(policy: ImportRedactionPolicy, opts: MigrateOptions = {}): MigrationResult {
  const map = opts.map ?? defaultMigrationMap();
  if (policy.version !== 'v2') {
    throw makeImportError(IMP_003_VERSION_INCOMPATIBLE, 'expected v2', 'policy.version');
  }
  const sacred = policy.protectsSacredText;
  const val = validateMigration(map, 'v2→portable', sacred);
  const warnings = val.warnings.map((w) => w.message);
  return {
    direction: 'v2→portable',
    sourceVersion: 'v2',
    targetVersion: 'portable',
    output: policy,
    appliedEntries: map.v2ToPortable,
    warnings,
    blocked: !val.valid,
    blockReason: !val.valid ? IMP_005_MIGRATION_BREAKS_RULE : undefined,
  };
}

export function sacredAwareMigrate(payload: ImportPortablePolicyPayload, opts: MigrateOptions = {}): MigrationResult {
  const policy = payload.policy;
  if (policy.version === 'v1') return portableV1ToNative(payload, opts);
  if (policy.version === 'v2') return portableV2ToNative(payload, opts);
  // portable → coerce to v2 native by default
  return portableV2ToNative(payload, opts);
}

export function migratePortableToNative(payload: ImportPortablePolicyPayload, opts: MigrateOptions = {}): MigrationResult {
  return sacredAwareMigrate(payload, opts);
}

export function migrateNativeToPortable(policy: ImportRedactionPolicy, opts: MigrateOptions = {}): MigrationResult {
  if (policy.version === 'v1') return nativeToPortableV1(policy, opts);
  if (policy.version === 'v2') return nativeToPortableV2(policy, opts);
  return nativeToPortableV2(policy, opts);
}

export function migrateV1toV2(policy: ImportRedactionPolicyV1, opts: MigrateOptions = {}): MigrationResult {
  if (policy.version !== 'v1') {
    throw makeImportError(IMP_003_VERSION_INCOMPATIBLE, 'expected v1 policy', 'policy.version');
  }
  const map = opts.map ?? defaultMigrationMap();
  const sacred = policy.protectsSacredText;
  const val = validateMigration(map, 'v1→v2', sacred);
  const warnings = val.warnings.map((w) => w.message);
  const v2: ImportRedactionPolicyV2 = {
    ...policy,
    version: 'v2',
    schemaVersion: 2,
    scopingMatrix: policy.contexts.map((c) => ({
      context: c,
      rules: policy.fieldRules.map((r) => r.path),
    })),
    extendV1: policy,
  };
  return {
    direction: 'v1→v2',
    sourceVersion: 'v1',
    targetVersion: 'v2',
    output: v2,
    appliedEntries: map.v1ToV2,
    warnings,
    blocked: !val.valid,
    blockReason: !val.valid ? IMP_004_SACRED_PROTECTION_STRIPPED : undefined,
  };
}

export function migrateV2toV1(policy: ImportRedactionPolicyV2, opts: MigrateOptions = {}): MigrationResult {
  if (policy.version !== 'v2') {
    throw makeImportError(IMP_003_VERSION_INCOMPATIBLE, 'expected v2 policy', 'policy.version');
  }
  const map = opts.map ?? defaultMigrationMap();
  const sacred = policy.protectsSacredText;
  const val = validateMigration(map, 'v2→v1', sacred);
  const warnings = val.warnings.map((w) => w.message);
  if (!val.valid) {
    return {
      direction: 'v2→v1',
      sourceVersion: 'v2',
      targetVersion: 'v1',
      output: policy,
      appliedEntries: [],
      warnings: [...warnings, ...val.errors.map((e) => e.message)],
      blocked: true,
      blockReason: IMP_004_SACRED_PROTECTION_STRIPPED,
    };
  }
  const v1: ImportRedactionPolicyV1 = {
    id: policy.id,
    name: policy.name,
    version: 'v1',
    schemaVersion: 1,
    description: policy.description,
    fieldRules: policy.fieldRules,
    contexts: policy.contexts,
    protectsSacredText: policy.protectsSacredText,
    lgpdArticles: policy.lgpdArticles,
    createdAt: policy.createdAt,
    updatedAt: policy.updatedAt,
    authorId: policy.authorId,
    checksumSeed: policy.checksumSeed,
  };
  return {
    direction: 'v2→v1',
    sourceVersion: 'v2',
    targetVersion: 'v1',
    output: v1,
    appliedEntries: map.v2ToV1,
    warnings,
    blocked: false,
  };
}

// ============================================================================
// SECTION 19 — Artifact validators (10+ core functions)
// ============================================================================

export function validateArtifact(raw: unknown, opts: Omit<VerifySignatureOptions, 'artifact'> & {
  supportedVersions?: readonly number[];
  now?: Date;
  allowGrace?: boolean;
}): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  if (typeof raw !== 'object' || raw === null) {
    throw makeImportError(IMP_009_SCHEMA_INVALID, 'artifact must be an object', '$');
  }
  const obj = raw as Record<string, unknown>;
  const schema = emitPortablePolicyArtifactSchema();
  const schemaCheck = validateAgainstSchema(obj, schema);
  if (!schemaCheck.valid) {
    errors.push(...schemaCheck.errors);
    blockers.push(...schemaCheck.blockers);
  }
  warnings.push(...schemaCheck.warnings);
  const artifact = obj as unknown as PortablePolicyArtifact;
  const supported = opts.supportedVersions ?? W53_SUPPORTED_ENVELOPE_VERSIONS;
  const compat = validateCompatibility(artifact, supported);
  for (const e of compat.errors) errors.push(e);
  for (const w of compat.warnings) warnings.push(w);
  for (const b of compat.blockers) blockers.push(b);
  if (
    !verifySignature({
      artifact,
      primaryKey: opts.primaryKey,
      secondaryKey: opts.secondaryKey,
      tertiaryKey: opts.tertiaryKey,
    })
  ) {
    errors.push({ path: 'signature', code: IMP_001_SIGNATURE_INVALID, message: 'HMAC verification failed' });
    blockers.push({
      path: 'signature',
      code: IMP_001_SIGNATURE_INVALID,
      message: 'HMAC verification failed',
      field: 'signature',
    });
  }
  const expectedIntegrity = hashIntegrity(artifact.payload);
  if (!ctEq(expectedIntegrity, artifact.integrityHash)) {
    errors.push({
      path: 'integrityHash',
      code: IMP_007_INTEGRITY_MISMATCH,
      message: 'integrity hash mismatch',
    });
    blockers.push({
      path: 'integrityHash',
      code: IMP_007_INTEGRITY_MISMATCH,
      message: 'integrity hash mismatch',
      field: 'integrityHash',
    });
  }
  const expiry = validateExpiry(artifact, opts.now ?? new Date());
  if (!opts.allowGrace) {
    for (const e of expiry.errors) errors.push(e);
    for (const b of expiry.blockers) blockers.push(b);
  }
  for (const w of expiry.warnings) warnings.push(w);
  const chainVal = validateSignerChain(artifact.signerChain, artifact.payload.policy.protectsSacredText);
  for (const e of chainVal.errors) errors.push(e);
  for (const w of chainVal.warnings) warnings.push(w);
  for (const b of chainVal.blockers) blockers.push(b);
  return { valid: errors.length === 0, errors, warnings, blockers };
}

export function validateSignature(artifact: PortablePolicyArtifact, opts: VerifySignatureOptions): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  const ok = verifySignature(opts);
  if (!ok) {
    errors.push({ path: 'signature', code: IMP_001_SIGNATURE_INVALID, message: 'HMAC verification failed' });
    blockers.push({
      path: 'signature',
      code: IMP_001_SIGNATURE_INVALID,
      message: 'HMAC verification failed',
      field: 'signature',
    });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

export function validateIntegrity(artifact: PortablePolicyArtifact): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  const expected = hashIntegrity(artifact.payload);
  if (!ctEq(expected, artifact.integrityHash)) {
    errors.push({
      path: 'integrityHash',
      code: IMP_007_INTEGRITY_MISMATCH,
      message: 'integrity hash mismatch',
    });
    blockers.push({
      path: 'integrityHash',
      code: IMP_007_INTEGRITY_MISMATCH,
      message: 'integrity hash mismatch',
      field: 'integrityHash',
    });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

export function validateVersion(artifact: PortablePolicyArtifact, supported: readonly number[]): ValidationOutcome {
  return validateCompatibility(artifact, supported);
}

export function validateCompatibility2(
  artifact: PortablePolicyArtifact,
  supported: readonly number[] = W53_SUPPORTED_ENVELOPE_VERSIONS,
): ValidationOutcome {
  return validateCompatibility(artifact, supported);
}

export function validateSignerChain2(
  chain: ImportSignerChain,
  sacred: boolean,
): ValidationOutcome {
  return validateSignerChain(chain, sacred);
}

export function validateSacredPreservation(
  before: ImportRedactionPolicy | undefined,
  after: ImportRedactionPolicy,
): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  const beforeSacred = before?.protectsSacredText ?? false;
  if (beforeSacred && !after.protectsSacredText) {
    errors.push({
      path: 'protectsSacredText',
      code: IMP_004_SACRED_PROTECTION_STRIPPED,
      message: 'import would strip sacred-text protection',
    });
    blockers.push({
      path: 'protectsSacredText',
      code: IMP_004_SACRED_PROTECTION_STRIPPED,
      message: 'import would strip sacred-text protection',
      field: 'protectsSacredText',
    });
  }
  if (!beforeSacred && after.protectsSacredText) {
    warnings.push({
      path: 'protectsSacredText',
      code: 'sacred-tier-up',
      message: 'import introduces sacred-text protection (was non-sacred)',
    });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

export function validateExpiry2(artifact: PortablePolicyArtifact, now: Date = new Date()): ValidationOutcome {
  return validateExpiry(artifact, now);
}

export function validateMigration2(
  map: MigrationMap,
  direction: MigrationDirection,
  sacred: boolean,
): ValidationOutcome {
  return validateMigration(map, direction, sacred);
}

export function validateImportMode(mode: ImportMode, force: boolean | undefined): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  if (!IMPORT_MODES.includes(mode)) {
    errors.push({ path: 'mode', code: 'enum', message: `unknown mode: ${mode}` });
    blockers.push({
      path: 'mode',
      code: IMP_003_VERSION_INCOMPATIBLE,
      message: `unknown mode: ${mode}`,
      field: 'mode',
    });
  }
  if (mode === 'replace' && force !== true) {
    errors.push({
      path: 'force',
      code: IMP_014_MODE_REQUIRES_FORCE,
      message: 'replace mode requires explicit force=true',
    });
    blockers.push({
      path: 'force',
      code: IMP_014_MODE_REQUIRES_FORCE,
      message: 'replace mode requires explicit force=true',
      field: 'force',
    });
  }
  if (mode === 'shadow_only') {
    warnings.push({ path: 'mode', code: 'shadow-mode', message: 'shadow-only mode will not modify registry' });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

export function validateConsent(consent: ImportConsentProof | undefined): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  if (!consent) {
    errors.push({
      path: 'consentProof',
      code: IMP_008_CONSENT_MISSING,
      message: 'LGPD Art. 7 consent is required',
    });
    blockers.push({
      path: 'consentProof',
      code: IMP_008_CONSENT_MISSING,
      message: 'LGPD Art. 7 consent is required',
      field: 'consentProof',
    });
    return { valid: false, errors, warnings, blockers };
  }
  if (!consent.userId || !consent.signature || !consent.grantedAt) {
    errors.push({
      path: 'consentProof',
      code: IMP_008_CONSENT_MISSING,
      message: 'consent proof is incomplete',
    });
    blockers.push({
      path: 'consentProof',
      code: IMP_008_CONSENT_MISSING,
      message: 'consent proof is incomplete',
      field: 'consentProof',
    });
  }
  if (consent.article !== '7') {
    errors.push({
      path: 'consentProof.article',
      code: IMP_008_CONSENT_MISSING,
      message: 'consent article must be LGPD-7',
    });
    blockers.push({
      path: 'consentProof.article',
      code: IMP_008_CONSENT_MISSING,
      message: 'consent article must be LGPD-7',
      field: 'consentProof.article',
    });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

export function validatePayloadSize(
  payload: ImportPortablePolicyPayload,
  maxBytes: number = DEFAULT_MAX_PAYLOAD_BYTES,
): ValidationOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockers: ValidationBlocker[] = [];
  const size = utf8ToBytes(canonicalJson(payload)).length;
  if (size > maxBytes) {
    errors.push({
      path: 'payload',
      code: IMP_010_PAYLOAD_TOO_LARGE,
      message: `payload=${size} > max=${maxBytes}`,
    });
    blockers.push({
      path: 'payload',
      code: IMP_010_PAYLOAD_TOO_LARGE,
      message: `payload=${size} > max=${maxBytes}`,
      field: 'payload',
    });
  }
  return { valid: errors.length === 0, errors, warnings, blockers };
}

export const DEFAULT_MAX_PAYLOAD_BYTES = 256 * 1024;

// ============================================================================
// SECTION 20 — Registry helpers + snapshot/diff
// ============================================================================

export function emptyRegistry(opts: { schemaVersion?: number; lgpdEnabled?: boolean } = {}): ImportPolicyRegistry {
  return {
    entries: {},
    schemaVersion: opts.schemaVersion ?? 2,
    sacredPolicyIds: [],
    lgpdEnabled: opts.lgpdEnabled ?? true,
  };
}

export function snapshotBeforeApply(registry: ImportPolicyRegistry): ImportPolicyRegistry {
  return {
    entries: { ...registry.entries },
    schemaVersion: registry.schemaVersion,
    sacredPolicyIds: [...registry.sacredPolicyIds],
    lgpdEnabled: registry.lgpdEnabled,
  };
}

export function getRegistryEntry(registry: ImportPolicyRegistry, id: string): RegistryEntry | undefined {
  return registry.entries[id];
}

export function listRegistryEntries(registry: ImportPolicyRegistry): readonly RegistryEntry[] {
  return Object.values(registry.entries);
}

export function listSacredEntries(registry: ImportPolicyRegistry): readonly RegistryEntry[] {
  return registry.sacredPolicyIds
    .map((id) => registry.entries[id])
    .filter((e): e is RegistryEntry => e !== undefined);
}

export function isSacredEntry(entry: RegistryEntry): boolean {
  return entry.policy.protectsSacredText;
}

export function registryEntryCount(registry: ImportPolicyRegistry): number {
  return Object.keys(registry.entries).length;
}

export function mergeRules(
  before: readonly ImportRedactionFieldRule[],
  after: readonly ImportRedactionFieldRule[],
): readonly ImportRedactionFieldRule[] {
  const map = new Map<string, ImportRedactionFieldRule>();
  for (const r of before) map.set(r.path, r);
  for (const r of after) map.set(r.path, r);
  return Array.from(map.values());
}

export function mergeContexts(
  before: readonly ImportRedactionContext[],
  after: readonly ImportRedactionContext[],
): readonly ImportRedactionContext[] {
  const map = new Map<string, ImportRedactionContext>();
  for (const c of before) map.set(`${c.scope}:${c.surface}`, c);
  for (const c of after) map.set(`${c.scope}:${c.surface}`, c);
  return Array.from(map.values());
}

export function mergePoliciesDeep(
  before: ImportRedactionPolicy,
  after: ImportRedactionPolicy,
): ImportRedactionPolicy {
  return {
    ...before,
    ...after,
    fieldRules: mergeRules(before.fieldRules, after.fieldRules),
    contexts: mergeContexts(before.contexts, after.contexts),
    lgpdArticles: Array.from(new Set([...before.lgpdArticles, ...after.lgpdArticles])),
    protectsSacredText: before.protectsSacredText || after.protectsSacredText,
  };
}

export function unionRules(
  before: ImportRedactionPolicy,
  after: ImportRedactionPolicy,
): ImportRedactionPolicy {
  return {
    ...before,
    fieldRules: mergeRules(before.fieldRules, after.fieldRules),
    contexts: mergeContexts(before.contexts, after.contexts),
    lgpdArticles: Array.from(new Set([...before.lgpdArticles, ...after.lgpdArticles])),
    protectsSacredText: before.protectsSacredText || after.protectsSacredText,
    updatedAt: after.updatedAt,
  };
}

export function replacePolicy(
  _before: ImportRedactionPolicy | undefined,
  after: ImportRedactionPolicy,
): ImportRedactionPolicy {
  return after;
}

export function applyShadow(
  before: ImportRedactionPolicy,
  after: ImportRedactionPolicy,
): ImportRedactionPolicy {
  return { ...before, ...after, id: before.id };
}

export function computeImportDiff(
  before: ImportRedactionPolicy | undefined,
  after: ImportRedactionPolicy,
): ImportDiff {
  const added: PolicyChange[] = [];
  const removed: PolicyChange[] = [];
  const modified: PolicyChange[] = [];
  if (!before) {
    added.push({ kind: 'added', path: '$', after });
    return {
      added,
      removed,
      modified,
      identical: false,
      beforeHash: '',
      afterHash: sha256Hex(utf8ToBytes(canonicalJson(after))),
    };
  }
  if (before.name !== after.name) {
    modified.push({ kind: 'modified', path: 'name', before: before.name, after: after.name });
  }
  if (before.protectsSacredText !== after.protectsSacredText) {
    modified.push({
      kind: 'sacred-toggled',
      path: 'protectsSacredText',
      before: before.protectsSacredText,
      after: after.protectsSacredText,
    });
  }
  if (before.version !== after.version) {
    modified.push({ kind: 'version-bumped', path: 'version', before: before.version, after: after.version });
  }
  const beforeRuleMap = new Map(before.fieldRules.map((r) => [r.path, r]));
  const afterRuleMap = new Map(after.fieldRules.map((r) => [r.path, r]));
  for (const [path, rule] of afterRuleMap) {
    const old = beforeRuleMap.get(path);
    if (!old) {
      added.push({ kind: 'rule-added', path, after: rule });
    } else if (canonicalJson(old) !== canonicalJson(rule)) {
      modified.push({ kind: 'rule-changed', path, before: old, after: rule });
    }
  }
  for (const [path, rule] of beforeRuleMap) {
    if (!afterRuleMap.has(path)) removed.push({ kind: 'rule-removed', path, before: rule });
  }
  const beforeCtxMap = new Map(before.contexts.map((c) => [`${c.scope}:${c.surface}`, c]));
  const afterCtxMap = new Map(after.contexts.map((c) => [`${c.scope}:${c.surface}`, c]));
  for (const [path, ctx] of afterCtxMap) {
    const old = beforeCtxMap.get(path);
    if (!old) {
      added.push({ kind: 'context-added', path, after: ctx });
    } else if (canonicalJson(old) !== canonicalJson(ctx)) {
      modified.push({ kind: 'context-changed', path, before: old, after: ctx });
    }
  }
  for (const [path, ctx] of beforeCtxMap) {
    if (!afterCtxMap.has(path)) removed.push({ kind: 'context-removed', path, before: ctx });
  }
  if (added.length === 0 && removed.length === 0 && modified.length === 0) {
    added.push({ kind: 'unchanged', path: '$', note: 'no observable changes' });
  }
  return {
    added,
    removed,
    modified,
    identical: added.length === 1 && added[0]!.kind === 'unchanged',
    beforeHash: sha256Hex(utf8ToBytes(canonicalJson(before))),
    afterHash: sha256Hex(utf8ToBytes(canonicalJson(after))),
  };
}

// ============================================================================
// SECTION 21 — Apply gate (apply validated policy to local registry)
// ============================================================================

export interface ApplyOptions {
  readonly artifact: PortablePolicyArtifact;
  readonly policy: ImportRedactionPolicy;
  readonly mode: ImportMode;
  readonly importId: string;
  readonly installedBy: string;
  readonly registry: ImportPolicyRegistry;
  readonly force?: boolean;
  readonly dryRun?: boolean;
  readonly now?: Date;
}

export function applyPolicy(opts: ApplyOptions): ApplyResult {
  const warnings: string[] = [];
  const before = opts.registry.entries[opts.policy.id];
  let merged: ImportRedactionPolicy;
  switch (opts.mode) {
    case 'replace':
      if (!opts.force) {
        throw makeImportError(IMP_014_MODE_REQUIRES_FORCE, 'replace requires force=true', 'force');
      }
      merged = replacePolicy(before?.policy, opts.policy);
      break;
    case 'merge_deep':
      merged = before ? mergePoliciesDeep(before.policy, opts.policy) : opts.policy;
      break;
    case 'union_rules':
      merged = before ? unionRules(before.policy, opts.policy) : opts.policy;
      break;
    case 'shadow_only':
      merged = before ? applyShadow(before.policy, opts.policy) : { ...opts.policy };
      warnings.push('shadow_only: registry unchanged; import stored in shadow layer');
      break;
    default:
      throw makeImportError(IMP_003_VERSION_INCOMPATIBLE, `unknown mode: ${opts.mode as string}`, 'mode');
  }
  const diff = computeImportDiff(before?.policy, merged);
  const now = (opts.now ?? new Date()).toISOString();
  const integrityHash = hashIntegrity(opts.artifact.payload);
  const nextEntries: Record<string, RegistryEntry> = { ...opts.registry.entries };
  if (opts.mode !== 'shadow_only') {
    nextEntries[opts.policy.id] = {
      policy: merged,
      installedAt: now,
      installedBy: opts.installedBy,
      source: 'imported',
      importId: opts.importId,
      artifactId: opts.artifact.artifactId,
      sacredVerified: opts.artifact.signerChain.secondary !== undefined || !merged.protectsSacredText,
      integrityHash,
      version: (before?.version ?? 0) + 1,
    };
  }
  const nextSacred = Array.from(
    new Set([
      ...opts.registry.sacredPolicyIds,
      ...(merged.protectsSacredText ? [opts.policy.id] : []),
    ]),
  );
  const nextRegistry: ImportPolicyRegistry = {
    entries: nextEntries,
    schemaVersion: opts.registry.schemaVersion,
    sacredPolicyIds: nextSacred,
    lgpdEnabled: opts.registry.lgpdEnabled,
  };
  return {
    applied: opts.mode !== 'shadow_only' && !opts.dryRun,
    mode: opts.mode,
    importId: opts.importId,
    diff,
    registryAfter: nextRegistry,
    warnings,
  };
}

// ============================================================================
// SECTION 22 — Sacred-text guard
// ============================================================================

export function checkSacredGuard(
  before: ImportRedactionPolicy | undefined,
  after: ImportRedactionPolicy,
  chain: ImportSignerChain,
): SacredGuard {
  const beforeSacred = before?.protectsSacredText ?? false;
  const afterSacred = after.protectsSacredText;
  const preservedSacred = !beforeSacred || afterSacred;
  const requiredSecondary = afterSacred;
  const hasSecondary = chain.secondary !== undefined;
  let blockedImport = false;
  let reason: string | undefined;
  if (beforeSacred && !afterSacred) {
    blockedImport = true;
    reason = 'sacred-text protection stripped during import';
  }
  if (afterSacred && !hasSecondary) {
    blockedImport = true;
    reason = reason ?? 'sacred-text policy requires secondary curator co-signer';
  }
  return { preservedSacred, blockedImport, reason, sacredBefore: beforeSacred, sacredAfter: afterSacred, requiredSecondary, hasSecondary };
}

export function enforceSacredGuardOnImport(
  before: ImportRedactionPolicy | undefined,
  after: ImportRedactionPolicy,
  chain: ImportSignerChain,
): void {
  const g = checkSacredGuard(before, after, chain);
  if (g.blockedImport) {
    throw makeImportError(IMP_004_SACRED_PROTECTION_STRIPPED, g.reason ?? 'sacred guard failed', 'sacredGuard');
  }
}

export function requiresSacredCoSigner(policy: ImportRedactionPolicy): boolean {
  return policy.protectsSacredText === true;
}

export function detectLostSacredProtection(
  from: ImportRedactionPolicy,
  to: ImportRedactionPolicy,
): boolean {
  return from.protectsSacredText && !to.protectsSacredText;
}

// ============================================================================
// SECTION 23 — Audit trail
// ============================================================================

const inMemoryAuditLog: ImportAuditEntry[] = [];

export function recordEvent(entry: ImportAuditEntry): void {
  inMemoryAuditLog.push(entry);
}

export function getAuditLog(): readonly ImportAuditEntry[] {
  return inMemoryAuditLog;
}

export function clearAuditLog(): void {
  inMemoryAuditLog.length = 0;
}

export function filterAuditLog(predicate: (e: ImportAuditEntry) => boolean): readonly ImportAuditEntry[] {
  return inMemoryAuditLog.filter(predicate);
}

export function summarizeAuditLog(): {
  total: number;
  successes: number;
  failures: number;
  byEvent: Record<string, number>;
  byErrorCode: Record<string, number>;
} {
  const byEvent: Record<string, number> = {};
  const byErrorCode: Record<string, number> = {};
  let successes = 0;
  let failures = 0;
  for (const e of inMemoryAuditLog) {
    byEvent[e.event] = (byEvent[e.event] ?? 0) + 1;
    if (e.result === 'success') successes++;
    else failures++;
    if (e.errorCode) byErrorCode[e.errorCode] = (byErrorCode[e.errorCode] ?? 0) + 1;
  }
  return { total: inMemoryAuditLog.length, successes, failures, byEvent, byErrorCode };
}

export function auditReject(opts: {
  artifact: PortablePolicyArtifact;
  signerChain: ImportSignerChain;
  reason: ImportErrorCode;
  importId?: string;
  notes?: string;
  now?: Date;
}): ImportAuditEntry {
  const now = (opts.now ?? new Date()).toISOString();
  const entry: ImportAuditEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'reject',
    importId: opts.importId,
    artifactId: opts.artifact.artifactId,
    lgpdArticles: opts.artifact.lgpdArticles,
    signerChain: opts.signerChain,
    integrityHash: opts.artifact.integrityHash,
    result: 'failure',
    errorCode: opts.reason,
    timestamp: now,
    notes: opts.notes,
  };
  recordEvent(entry);
  return entry;
}

export function auditImport(opts: {
  artifact: PortablePolicyArtifact;
  signerChain: ImportSignerChain;
  outcome: ValidationOutcome;
  importId?: string;
  userId?: string;
  now?: Date;
}): ImportAuditEntry {
  const now = (opts.now ?? new Date()).toISOString();
  const entry: ImportAuditEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'import',
    importId: opts.importId,
    userId: opts.userId,
    artifactId: opts.artifact.artifactId,
    lgpdArticles: opts.artifact.lgpdArticles,
    signerChain: opts.signerChain,
    integrityHash: opts.artifact.integrityHash,
    result: opts.outcome.valid ? 'success' : 'failure',
    errorCode: opts.outcome.valid ? undefined : IMP_001_SIGNATURE_INVALID,
    timestamp: now,
  };
  recordEvent(entry);
  return entry;
}

export function auditPurge(opts: {
  importId: string;
  artifactId: string;
  userId?: string;
  signerChain: ImportSignerChain;
  integrityHash: string;
  now?: Date;
}): ImportAuditEntry {
  const now = (opts.now ?? new Date()).toISOString();
  const entry: ImportAuditEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'purge',
    importId: opts.importId,
    userId: opts.userId,
    artifactId: opts.artifactId,
    lgpdArticles: [{ article: '18', description: 'LGPD Art. 18 erasure.' }],
    signerChain: opts.signerChain,
    integrityHash: opts.integrityHash,
    result: 'success',
    timestamp: now,
  };
  recordEvent(entry);
  return entry;
}

export function auditRevalidate(opts: {
  artifact: PortablePolicyArtifact;
  signerChain: ImportSignerChain;
  outcome: ValidationOutcome;
  importId?: string;
  now?: Date;
}): ImportAuditEntry {
  const now = (opts.now ?? new Date()).toISOString();
  const entry: ImportAuditEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'revalidate',
    importId: opts.importId,
    artifactId: opts.artifact.artifactId,
    lgpdArticles: opts.artifact.lgpdArticles,
    signerChain: opts.signerChain,
    integrityHash: opts.artifact.integrityHash,
    result: opts.outcome.valid ? 'success' : 'failure',
    errorCode: opts.outcome.valid ? undefined : IMP_001_SIGNATURE_INVALID,
    timestamp: now,
  };
  recordEvent(entry);
  return entry;
}

export function auditRevert(opts: {
  importId: string;
  artifactId: string;
  signerChain: ImportSignerChain;
  integrityHash: string;
  now?: Date;
}): ImportAuditEntry {
  const now = (opts.now ?? new Date()).toISOString();
  const entry: ImportAuditEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'revert',
    importId: opts.importId,
    artifactId: opts.artifactId,
    lgpdArticles: [{ article: '18', description: 'LGPD Art. 18 portability rollback.' }],
    signerChain: opts.signerChain,
    integrityHash: opts.integrityHash,
    result: 'success',
    timestamp: now,
  };
  recordEvent(entry);
  return entry;
}

// ============================================================================
// SECTION 24 — LGPD consent helpers
// ============================================================================

export function recordConsent(proof: ImportConsentProof, auditTrailId: string): ImportAuditEntry {
  return {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'import',
    userId: proof.userId,
    artifactId: auditTrailId,
    lgpdArticles: [{ article: proof.article, description: 'Explicit consent recorded.' }],
    signerChain: { primary: consentSigner(proof) },
    integrityHash: sha256Hex(utf8ToBytes(canonicalJson(proof))),
    result: 'success',
    timestamp: new Date().toISOString(),
    notes: `consent scope=${proof.scope}`,
  };
}

export function consentSigner(proof: ImportConsentProof): ImportSigner {
  return {
    id: `consent_${proof.userId}`,
    role: 'system',
    displayName: 'Consent Recorder',
    publicKeyFingerprint: sha256Hex(utf8ToBytes(proof.userId)).substring(0, 16),
    signedAt: proof.grantedAt,
  };
}

export function assertConsent(proof: ImportConsentProof | undefined): void {
  if (!proof) {
    throw makeImportError(IMP_008_CONSENT_MISSING, 'LGPD Art. 7 requires explicit consent', 'consentProof');
  }
  if (!proof.userId || !proof.signature || !proof.grantedAt) {
    throw makeImportError(IMP_008_CONSENT_MISSING, 'consent proof is incomplete', 'consentProof');
  }
  if (proof.article !== '7') {
    throw makeImportError(IMP_008_CONSENT_MISSING, 'consent article must be LGPD-7', 'consentProof.article');
  }
}

export function consentToImport(consentProof: ImportConsentProof): ImportConsentProof {
  assertConsent(consentProof);
  return consentProof;
}

// ============================================================================
// SECTION 25 — LGPD Art. 7/18/20 import paths
// ============================================================================

export interface ImportUserPolicyOptions {
  readonly userId: string;
  readonly artifact: PortablePolicyArtifact;
  readonly mode: ImportMode;
  readonly dryRun: boolean;
  readonly consentProof: ImportConsentProof;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
  readonly force?: boolean;
  readonly now?: Date;
  readonly registry: ImportPolicyRegistry;
  readonly supportedVersions?: readonly number[];
  readonly allowGrace?: boolean;
  readonly installedBy?: string;
}

export function importUserPolicy(opts: ImportUserPolicyOptions): {
  result: ApplyResult;
  audit: ImportAuditEntry;
} {
  assertConsent(opts.consentProof);
  const outcome = validateArtifact(opts.artifact, {
    primaryKey: opts.primaryKey,
    secondaryKey: opts.secondaryKey,
    tertiaryKey: opts.tertiaryKey,
    now: opts.now,
    supportedVersions: opts.supportedVersions,
    allowGrace: opts.allowGrace,
  });
  const audit = auditImport({
    artifact: opts.artifact,
    signerChain: opts.artifact.signerChain,
    outcome,
    userId: opts.userId,
    now: opts.now,
  });
  if (!outcome.valid) {
    return {
      result: {
        applied: false,
        mode: opts.mode,
        importId: `imp_${bytesToHex(generateSalt(8))}`,
        diff: { added: [], removed: [], modified: [], identical: true, beforeHash: '', afterHash: '' },
        registryAfter: opts.registry,
        warnings: outcome.errors.map((e) => e.message),
      },
      audit,
    };
  }
  const importId = `imp_${bytesToHex(generateSalt(8))}`;
  const result = applyPolicy({
    artifact: opts.artifact,
    policy: opts.artifact.payload.policy,
    mode: opts.mode,
    importId,
    installedBy: opts.installedBy ?? opts.userId,
    registry: opts.registry,
    force: opts.force,
    dryRun: opts.dryRun,
    now: opts.now,
  });
  return { result, audit };
}

export interface PurgeImportedPolicyOptions {
  readonly importId: string;
  readonly registry: ImportPolicyRegistry;
  readonly userId?: string;
  readonly now?: Date;
}

export function purgeImportedPolicy(opts: PurgeImportedPolicyOptions): {
  registryAfter: ImportPolicyRegistry;
  purged: boolean;
  artifactId?: string;
} {
  const now = (opts.now ?? new Date()).toISOString();
  let purged = false;
  let artifactId: string | undefined;
  const nextEntries: Record<string, RegistryEntry> = {};
  for (const [id, entry] of Object.entries(opts.registry.entries)) {
    if (entry.importId === opts.importId) {
      purged = true;
      artifactId = entry.artifactId;
      continue;
    }
    nextEntries[id] = entry;
  }
  if (!purged) {
    throw makeImportError(IMP_016_PURGE_NOT_FOUND, `importId=${opts.importId} not found`, 'importId', undefined, opts.importId);
  }
  const nextSacred = opts.registry.sacredPolicyIds.filter((id) => id in nextEntries);
  const registryAfter: ImportPolicyRegistry = {
    entries: nextEntries,
    schemaVersion: opts.registry.schemaVersion,
    sacredPolicyIds: nextSacred,
    lgpdEnabled: opts.registry.lgpdEnabled,
  };
  auditPurge({
    importId: opts.importId,
    artifactId: artifactId ?? 'unknown',
    userId: opts.userId,
    signerChain: { primary: consentSigner({
      userId: opts.userId ?? 'system',
      grantedAt: now,
      article: '7',
      scope: 'deletion',
      signature: 'purge',
    }) },
    integrityHash: '',
    now: opts.now,
  });
  return { registryAfter, purged: true, artifactId };
}

export interface ImportDataSubjectBundleOptions {
  readonly userId: string;
  readonly artifacts: readonly PortablePolicyArtifact[];
  readonly mode: ImportMode;
  readonly dryRun: boolean;
  readonly consentProof: ImportConsentProof;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
  readonly registry: ImportPolicyRegistry;
  readonly now?: Date;
}

export function importDataSubjectBundle(opts: ImportDataSubjectBundleOptions): {
  results: readonly ApplyResult[];
  audits: readonly ImportAuditEntry[];
  article18: ImportLgpdArticleRef;
} {
  const results: ApplyResult[] = [];
  const audits: ImportAuditEntry[] = [];
  for (const artifact of opts.artifacts) {
    const out = importUserPolicy({
      userId: opts.userId,
      artifact,
      mode: opts.mode,
      dryRun: opts.dryRun,
      consentProof: opts.consentProof,
      primaryKey: opts.primaryKey,
      secondaryKey: opts.secondaryKey,
      tertiaryKey: opts.tertiaryKey,
      registry: opts.registry,
      now: opts.now,
    });
    results.push(out.result);
    audits.push(out.audit);
  }
  return { results, audits, article18: { article: '18', description: 'LGPD data subject portability.' } };
}

export function revertImport(opts: {
  importId: string;
  registry: ImportPolicyRegistry;
  now?: Date;
}): {
  registryAfter: ImportPolicyRegistry;
  purged: boolean;
  artifactId?: string;
} {
  return purgeImportedPolicy({
    importId: opts.importId,
    registry: opts.registry,
    now: opts.now,
  });
}

// ============================================================================
// SECTION 26 — Shape builders (import-side)
// ============================================================================

export function buildSigner(input: {
  id: string;
  role: ImportSigner['role'];
  displayName: string;
  publicKey: Uint8Array;
  now?: Date;
}): ImportSigner {
  return {
    id: input.id,
    role: input.role,
    displayName: input.displayName,
    publicKeyFingerprint: fingerprintKey(input.publicKey),
    signedAt: (input.now ?? new Date()).toISOString(),
  };
}

export function buildPolicyV1(input: {
  id: string;
  name: string;
  authorId: string;
  fieldRules: readonly ImportRedactionFieldRule[];
  contexts: readonly ImportRedactionContext[];
  protectsSacredText?: boolean;
  lgpdArticles?: readonly string[];
  description?: string;
  now?: Date;
}): ImportRedactionPolicyV1 {
  const now = (input.now ?? new Date()).toISOString();
  return {
    id: input.id,
    name: input.name,
    version: 'v1',
    schemaVersion: 1,
    description: input.description,
    fieldRules: input.fieldRules,
    contexts: input.contexts,
    protectsSacredText: input.protectsSacredText ?? false,
    lgpdArticles: input.lgpdArticles ?? ['18'],
    createdAt: now,
    updatedAt: now,
    authorId: input.authorId,
  };
}

export function buildPolicyV2(input: {
  id: string;
  name: string;
  authorId: string;
  fieldRules: readonly ImportRedactionFieldRule[];
  contexts: readonly ImportRedactionContext[];
  protectsSacredText?: boolean;
  lgpdArticles?: readonly string[];
  description?: string;
  extendV1?: ImportRedactionPolicyV1;
  scopingMatrix?: readonly { context: ImportRedactionContext; rules: readonly string[] }[];
  now?: Date;
}): ImportRedactionPolicyV2 {
  const now = (input.now ?? new Date()).toISOString();
  return {
    id: input.id,
    name: input.name,
    version: 'v2',
    schemaVersion: 2,
    description: input.description,
    fieldRules: input.fieldRules,
    contexts: input.contexts,
    protectsSacredText: input.protectsSacredText ?? false,
    lgpdArticles: input.lgpdArticles ?? ['18'],
    createdAt: now,
    updatedAt: now,
    authorId: input.authorId,
    extendV1: input.extendV1,
    scopingMatrix: input.scopingMatrix,
  };
}

export function generateImportId(now: Date = new Date()): string {
  const t = now.getTime().toString(16);
  const r = bytesToHex(generateSalt(8));
  return `imp_${t}_${r}`;
}

export function defaultLgpdArticlesFor(policy: ImportRedactionPolicy): readonly ImportLgpdArticleRef[] {
  const articles: ImportLgpdArticleRef[] = [
    { article: '18', description: 'Right to portability of personal data.' },
    { article: '20', description: 'Right to data portability (LGPD-equivalent).' },
  ];
  if (policy.protectsSacredText) {
    articles.push({ article: '7', description: 'Explicit consent for sacred-text redaction.' });
  }
  return articles;
}

// ============================================================================
// SECTION 27 — Helpers / utilities
// ============================================================================

export function nowIso(): string {
  return new Date().toISOString();
}

export function addSeconds(iso: string, seconds: number): string {
  return new Date(Date.parse(iso) + seconds * 1000).toISOString();
}

export function diffSeconds(a: string, b: string): number {
  return Math.floor((Date.parse(a) - Date.parse(b)) / 1000);
}

export function stripUndefined<T extends object>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export function pickFields<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k as string] = obj[k];
  return out as Pick<T, K>;
}

export function omitFields<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const out = { ...obj } as Record<string, unknown>;
  for (const k of keys) delete out[k as string];
  return out as Omit<T, K>;
}

export function isIsoDate(s: string): boolean {
  return !Number.isNaN(Date.parse(s));
}

export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

// ============================================================================
// SECTION 28 — Type guards
// ============================================================================

export function isRedactionPolicy(value: unknown): value is ImportRedactionPolicy {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    typeof v['name'] === 'string' &&
    (v['version'] === 'v1' || v['version'] === 'v2' || v['version'] === 'portable') &&
    typeof v['protectsSacredText'] === 'boolean' &&
    Array.isArray(v['fieldRules']) &&
    Array.isArray(v['contexts'])
  );
}

export function isPortablePolicyArtifact(value: unknown): value is PortablePolicyArtifact {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v['envelopeVersion'] === 1 || v['envelopeVersion'] === 2) &&
    typeof v['signature'] === 'string' &&
    typeof v['integrityHash'] === 'string' &&
    typeof v['issuer'] === 'string' &&
    typeof v['issuedAt'] === 'string' &&
    typeof v['expiresAt'] === 'string' &&
    typeof v['artifactId'] === 'string' &&
    typeof v['auditTrailId'] === 'string' &&
    typeof v['payload'] === 'object'
  );
}

export function isSignerChain(value: unknown): value is ImportSignerChain {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return isSigner(v['primary']);
}

export function isSigner(value: unknown): value is ImportSigner {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    typeof v['role'] === 'string' &&
    typeof v['displayName'] === 'string' &&
    typeof v['publicKeyFingerprint'] === 'string' &&
    typeof v['signedAt'] === 'string'
  );
}

export function isConsentProof(value: unknown): value is ImportConsentProof {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['userId'] === 'string' &&
    typeof v['grantedAt'] === 'string' &&
    v['article'] === '7' &&
    (v['scope'] === 'export' || v['scope'] === 'portability' || v['scope'] === 'deletion' || v['scope'] === 'import') &&
    typeof v['signature'] === 'string'
  );
}

export function isImportPolicyRegistry(value: unknown): value is ImportPolicyRegistry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['schemaVersion'] === 'number' &&
    typeof v['lgpdEnabled'] === 'boolean' &&
    Array.isArray(v['sacredPolicyIds']) &&
    typeof v['entries'] === 'object'
  );
}

export function isImportMode(value: unknown): value is ImportMode {
  return (
    value === 'replace' ||
    value === 'merge_deep' ||
    value === 'union_rules' ||
    value === 'shadow_only'
  );
}

// ============================================================================
// SECTION 29 — Smoke test scenarios (14+ required)
// ============================================================================

export interface SmokeScenarioResult {
  readonly name: string;
  readonly passed: boolean;
  readonly notes: string;
}

// --- Smoke helpers used by scenarios ---
function _smokeMakeKey(): Uint8Array {
  return utf8ToBytes('0123456789abcdef0123456789abcdef');
}

function _smokeBuildPortableArtifact(opts: {
  policy: ImportRedactionPolicy;
  issuer?: string;
  signerChain: ImportSignerChain;
  primaryKey: Uint8Array;
  secondaryKey?: Uint8Array;
  ttlSeconds?: number;
  gracePeriodSeconds?: number;
  now?: Date;
  migrationFrom?: 'v1' | 'v2' | 'portable';
  migrationTo?: 'v1' | 'v2' | 'portable';
}): PortablePolicyArtifact {
  const now = opts.now ?? new Date();
  const ttl = opts.ttlSeconds ?? 3600;
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + ttl * 1000).toISOString();
  const payload: ImportPortablePolicyPayload = { policy: opts.policy };
  const integrityHash = sha256Hex(utf8ToBytes(canonicalJson(payload)));
  const artifactId = `art_${bytesToHex(generateSalt(8))}`;
  const auditTrailId = `audit_${bytesToHex(generateSalt(8))}`;
  const partial = {
    envelopeVersion: 2 as const,
    payload,
    integrityHash,
    issuer: opts.issuer ?? 'test',
    issuedAt,
    expiresAt,
    lgpdArticles: defaultLgpdArticlesFor(opts.policy),
    signerChain: opts.signerChain,
    auditTrailId,
    artifactId,
    gracePeriodSeconds: opts.gracePeriodSeconds,
    migrationFrom: opts.migrationFrom,
    migrationTo: opts.migrationTo,
  };
  const toSign = canonicalJson({ ...partial, signature: '' });
  let chainInput = hmacSha256(opts.primaryKey, utf8ToBytes(toSign));
  if (opts.secondaryKey && opts.signerChain.secondary) chainInput = hmacSha256(opts.secondaryKey, chainInput);
  const signature = bytesToBase64Url(chainInput);
  return { ...partial, signature };
}

function _smokeMakePolicy(opts: {
  id?: string;
  sacred?: boolean;
  name?: string;
}): ImportRedactionPolicyV1 {
  return buildPolicyV1({
    id: opts.id ?? `p_${bytesToHex(generateSalt(4))}`,
    name: opts.name ?? 'smoke',
    authorId: 'u',
    fieldRules: [{ path: 'email', action: 'mask' }],
    contexts: [{ scope: 'private', surface: 'profile' }],
    protectsSacredText: opts.sacred ?? false,
  });
}

function _smokeConsent(userId: string): ImportConsentProof {
  return {
    userId,
    grantedAt: nowIso(),
    article: '7',
    scope: 'import',
    signature: 'sig-abc',
  };
}

// --- 14+ scenarios ---

export function smokeHmacRoundtrip(): SmokeScenarioResult {
  const key = utf8ToBytes('the-quick-brown-fox-jumps-over-the-lazy-dog');
  const msg = utf8ToBytes('hello world');
  const a = hmacSha256Hex(key, msg);
  const b = hmacSha256Hex(key, msg);
  const passed = ctEq(a, b) && a.length === 64;
  return { name: 'hmac-roundtrip', passed, notes: `digest=${a.slice(0, 16)}…` };
}

export function smokeIntegrityMismatch(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const artifact = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({}),
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const tampered: PortablePolicyArtifact = {
    ...artifact,
    payload: { ...artifact.payload, notes: (artifact.payload.notes ?? '') + 'x' },
  };
  const ok = !verifySignature({ artifact: tampered, primaryKey: key });
  return { name: 'integrity-mismatch', passed: ok, notes: 'tamper detected' };
}

export function smokeSignatureChainDual(): SmokeScenarioResult {
  const k1 = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const k2 = utf8ToBytes('fedcba9876543210fedcba9876543210');
  const signer1 = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: k1 });
  const signer2 = buildSigner({ id: 's2', role: 'compliance-officer', displayName: 'D', publicKey: k2 });
  const artifact = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({ sacred: true }),
    signerChain: { primary: signer1, secondary: signer2 },
    primaryKey: k1,
    secondaryKey: k2,
  });
  const ok = verifySignature({ artifact, primaryKey: k1, secondaryKey: k2 });
  return { name: 'sig-chain-dual', passed: ok, notes: 'multi-sig verified' };
}

export function smokeSignatureChainSingle(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const artifact = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({}),
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const ok = verifySignature({ artifact, primaryKey: key });
  return { name: 'sig-chain-single', passed: ok, notes: 'single-sig verified' };
}

export function smokeExpiryCheck(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const future = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({}),
    signerChain: { primary: signer },
    primaryKey: key,
    ttlSeconds: 3600,
  });
  // Build an artifact whose expiresAt is 60s in the past but with a 600s grace
  // window, so checkExpiry should return expired=true and inGracePeriod=true.
  const issuedAt = new Date(Date.now() - 120 * 1000);
  const past = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({}),
    signerChain: { primary: signer },
    primaryKey: key,
    now: issuedAt,
    ttlSeconds: 60,
    gracePeriodSeconds: 600,
  });
  const r1 = checkExpiry(future);
  const r2 = checkExpiry(past);
  const passed = !r1.expired && r1.secondsToExpiry > 3500 && r2.expired && r2.inGracePeriod;
  return { name: 'expiry-check', passed, notes: `valid=${!r1.expired} grace=${r2.inGracePeriod}` };
}

export function smokeSacredPreservedOnImport(): SmokeScenarioResult {
  const before = _smokeMakePolicy({ sacred: true, id: 's1' });
  const after = { ...before, name: 'updated', updatedAt: nowIso() };
  const r = validateSacredPreservation(before, after);
  const passed = r.valid;
  return { name: 'sacred-preserved', passed, notes: `valid=${r.valid}` };
}

export function smokeSacredStripped(): SmokeScenarioResult {
  const before = _smokeMakePolicy({ sacred: true, id: 's1' });
  const after = { ...before, protectsSacredText: false, updatedAt: nowIso() };
  const r = validateSacredPreservation(before, after);
  const passed = !r.valid && r.blockers.some((b) => b.code === IMP_004_SACRED_PROTECTION_STRIPPED);
  return { name: 'sacred-stripped', passed, notes: 'sacred stripped → blocked' };
}

export function smokeMigrationBothDirections(): SmokeScenarioResult {
  const v1 = _smokeMakePolicy({});
  const v2Result = migrateV1toV2(v1);
  const back = migrateV2toV1(v2Result.output as ImportRedactionPolicyV2);
  const passed = v2Result.output.version === 'v2' && back.output.version === 'v1' && !back.blocked;
  return { name: 'migration-both', passed, notes: `v1→v2→v1 ok` };
}

export function smokeCompatibilityV1V2(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const v1 = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({}),
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const r1 = checkCompatibility({ ...v1, envelopeVersion: 1 }, [1, 2]);
  const r2 = checkCompatibility(v1, [1]);
  const r3 = checkCompatibility(v1, [2]);
  const passed = r1.compatible && !r2.compatible && r3.compatible;
  return { name: 'compatibility-v1v2', passed, notes: `3/3 cases` };
}

export function smokeCompatibilitySacred(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const artifact = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({ sacred: true }),
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const r = checkCompatibility(artifact, [2]);
  const passed = !r.compatible;
  return { name: 'compatibility-sacred-no-cosigner', passed, notes: 'sacred without cosigner blocked' };
}

export function smokeCompatibilityMissingLgpd(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const artifact = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({}),
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const r = checkCompatibility({ ...artifact, lgpdArticles: [{ article: '7', description: 'only 7' }] }, [2]);
  const passed = !r.compatible && r.missingArticles.length === 2;
  return { name: 'compatibility-missing-lgpd', passed, notes: 'missing art 18/20 → blocked' };
}

export function smokeApplyReplace(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const before = _smokeMakePolicy({ id: 'p1' });
  const after = { ...before, name: 'replaced' };
  const artifact = _smokeBuildPortableArtifact({
    policy: after,
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const registry: ImportPolicyRegistry = {
    ...emptyRegistry(),
    entries: {
      p1: {
        policy: before,
        installedAt: nowIso(),
        installedBy: 'tester',
        source: 'native',
        sacredVerified: false,
        integrityHash: sha256Hex(utf8ToBytes(canonicalJson(before))),
        version: 1,
      },
    },
  };
  const result = applyPolicy({
    artifact,
    policy: after,
    mode: 'replace',
    importId: generateImportId(),
    installedBy: 'tester',
    registry,
    force: true,
  });
  const passed = result.applied && result.diff.modified.some((m) => m.path === 'name');
  return { name: 'apply-replace', passed, notes: `applied=${result.applied}` };
}

export function smokeApplyMergeDeep(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const before = _smokeMakePolicy({ id: 'p1' });
  const after: ImportRedactionPolicy = { ...before, fieldRules: [{ path: 'phone', action: 'mask' }] };
  const artifact = _smokeBuildPortableArtifact({
    policy: after,
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const registry: ImportPolicyRegistry = {
    ...emptyRegistry(),
    entries: {
      p1: {
        policy: before,
        installedAt: nowIso(),
        installedBy: 'tester',
        source: 'native',
        sacredVerified: false,
        integrityHash: sha256Hex(utf8ToBytes(canonicalJson(before))),
        version: 1,
      },
    },
  };
  const result = applyPolicy({
    artifact,
    policy: after,
    mode: 'merge_deep',
    importId: generateImportId(),
    installedBy: 'tester',
    registry,
  });
  const passed = result.applied && result.registryAfter.entries['p1']!.policy.fieldRules.length === 2;
  return { name: 'apply-merge-deep', passed, notes: 'rules unioned' };
}

export function smokeApplyUnionRules(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const before = _smokeMakePolicy({ id: 'p1' });
  const after: ImportRedactionPolicy = { ...before, fieldRules: [{ path: 'phone', action: 'mask' }] };
  const artifact = _smokeBuildPortableArtifact({
    policy: after,
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const registry: ImportPolicyRegistry = {
    ...emptyRegistry(),
    entries: {
      p1: {
        policy: before,
        installedAt: nowIso(),
        installedBy: 'tester',
        source: 'native',
        sacredVerified: false,
        integrityHash: sha256Hex(utf8ToBytes(canonicalJson(before))),
        version: 1,
      },
    },
  };
  const result = applyPolicy({
    artifact,
    policy: after,
    mode: 'union_rules',
    importId: generateImportId(),
    installedBy: 'tester',
    registry,
  });
  const passed = result.applied;
  return { name: 'apply-union-rules', passed, notes: 'union ok' };
}

export function smokeApplyShadowOnly(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const policy = _smokeMakePolicy({ id: 'p1' });
  const artifact = _smokeBuildPortableArtifact({
    policy,
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const result = applyPolicy({
    artifact,
    policy,
    mode: 'shadow_only',
    importId: generateImportId(),
    installedBy: 'tester',
    registry: emptyRegistry(),
  });
  const passed = !result.applied && result.warnings.length > 0;
  return { name: 'apply-shadow-only', passed, notes: 'shadow: no registry change' };
}

export function smokeAuditShape(): SmokeScenarioResult {
  clearAuditLog();
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const artifact = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({}),
    signerChain: { primary: signer },
    primaryKey: key,
  });
  auditImport({ artifact, signerChain: { primary: signer }, outcome: { valid: true, errors: [], warnings: [], blockers: [] } });
  auditReject({ artifact, signerChain: { primary: signer }, reason: IMP_001_SIGNATURE_INVALID });
  const log = getAuditLog();
  const summary = summarizeAuditLog();
  const passed = log.length === 2 && summary.total === 2 && summary.failures === 1;
  return { name: 'audit-shape', passed, notes: `entries=${log.length} failures=${summary.failures}` };
}

export function smokePurgeById(): SmokeScenarioResult {
  clearAuditLog();
  const before = _smokeMakePolicy({ id: 'p1' });
  const registry: ImportPolicyRegistry = {
    ...emptyRegistry(),
    entries: {
      p1: {
        policy: before,
        installedAt: nowIso(),
        installedBy: 'tester',
        source: 'imported',
        importId: 'imp_test_1',
        artifactId: 'art_test_1',
        sacredVerified: false,
        integrityHash: sha256Hex(utf8ToBytes(canonicalJson(before))),
        version: 1,
      },
    },
    sacredPolicyIds: [],
  };
  const out = purgeImportedPolicy({ importId: 'imp_test_1', registry });
  const passed = out.purged && !('p1' in out.registryAfter.entries);
  return { name: 'purge-by-id', passed, notes: `purged=${out.purged}` };
}

export function smokeImporterPortability(): SmokeScenarioResult {
  clearAuditLog();
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const policy = _smokeMakePolicy({ id: 'p1' });
  const artifact = _smokeBuildPortableArtifact({
    policy,
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const out = importUserPolicy({
    userId: 'u1',
    artifact,
    mode: 'merge_deep',
    dryRun: false,
    consentProof: _smokeConsent('u1'),
    primaryKey: key,
    registry: emptyRegistry(),
  });
  const passed = out.result.applied && out.audit.result === 'success';
  return { name: 'importer-portability', passed, notes: `applied=${out.result.applied}` };
}

export function smokeSacredCosignerRequired(): SmokeScenarioResult {
  const chain = {
    primary: buildSigner({ id: 's1', role: 'curator', displayName: 'A', publicKey: utf8ToBytes('k1') }),
    secondary: buildSigner({ id: 's2', role: 'compliance-officer', displayName: 'B', publicKey: utf8ToBytes('k2') }),
  };
  const r = validateSignerChain(chain, true);
  return { name: 'sacred-cosigner-required', passed: r.valid, notes: 'dual signer accepted for sacred text' };
}

export function smokeVersionSkewRejection(): SmokeScenarioResult {
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const artifact = _smokeBuildPortableArtifact({
    policy: _smokeMakePolicy({}),
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const r = validateArtifact(artifact, { primaryKey: key, supportedVersions: [1] });
  const passed = !r.valid;
  return { name: 'version-skew-rejection', passed, notes: `envelope=2, supported=1 → rejected` };
}

export function smokeDryRunNoSideEffect(): SmokeScenarioResult {
  clearAuditLog();
  const key = _smokeMakeKey();
  const signer = buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key });
  const policy = _smokeMakePolicy({ id: 'p1' });
  const artifact = _smokeBuildPortableArtifact({
    policy,
    signerChain: { primary: signer },
    primaryKey: key,
  });
  const out = importUserPolicy({
    userId: 'u1',
    artifact,
    mode: 'merge_deep',
    dryRun: true,
    consentProof: _smokeConsent('u1'),
    primaryKey: key,
    registry: emptyRegistry(),
  });
  const passed = !out.result.applied;
  return { name: 'dry-run', passed, notes: `applied=${out.result.applied}` };
}

export function smokeCanonicalJsonStability(): SmokeScenarioResult {
  const a = canonicalJson({ b: 1, a: 2, c: [3, 2, 1] });
  const b = canonicalJson({ c: [3, 2, 1], a: 2, b: 1 });
  return { name: 'canonical-json', passed: a === b, notes: `len=${a.length}` };
}

export function smokeRoundTripMigration(): SmokeScenarioResult {
  const v1 = _smokeMakePolicy({ id: 'rt' });
  const up = migrateV1toV2(v1);
  const down = migrateV2toV1(up.output as ImportRedactionPolicyV2);
  const lost = detectLostSacredProtection(v1, down.output);
  const passed = up.output.version === 'v2' && down.output.version === 'v1' && !down.blocked && !lost;
  return { name: 'round-trip-migration', passed, notes: `lost=${lost}` };
}

export function smokeAll(): readonly SmokeScenarioResult[] {
  return [
    smokeHmacRoundtrip(),
    smokeIntegrityMismatch(),
    smokeSignatureChainSingle(),
    smokeSignatureChainDual(),
    smokeExpiryCheck(),
    smokeSacredPreservedOnImport(),
    smokeSacredStripped(),
    smokeMigrationBothDirections(),
    smokeCompatibilityV1V2(),
    smokeCompatibilitySacred(),
    smokeCompatibilityMissingLgpd(),
    smokeApplyReplace(),
    smokeApplyMergeDeep(),
    smokeApplyUnionRules(),
    smokeApplyShadowOnly(),
    smokeAuditShape(),
    smokePurgeById(),
    smokeImporterPortability(),
    smokeSacredCosignerRequired(),
    smokeVersionSkewRejection(),
    smokeDryRunNoSideEffect(),
    smokeCanonicalJsonStability(),
    smokeRoundTripMigration(),
  ];
}

export function summarizeSmoke(results: readonly SmokeScenarioResult[]): {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
} {
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  return { total, passed, failed, passRate: total === 0 ? 0 : passed / total };
}

// ============================================================================
// SECTION 30 — Public re-exports + version metadata
// ============================================================================

export const w53 = {
  IMP_001_SIGNATURE_INVALID,
  IMP_002_EXPIRY_EXCEEDED,
  IMP_003_VERSION_INCOMPATIBLE,
  IMP_004_SACRED_PROTECTION_STRIPPED,
  IMP_005_MIGRATION_BREAKS_RULE,
  IMP_006_SHADOW_CONFLICT,
  sha256,
  sha256Hex,
  hmacSha256,
  hmacSha256Hex,
  hmacSha256Base64Url,
  canonicalJson,
  hashIntegrity,
  verifySignature,
  verifyWithChain,
  chainSigners,
  validateSignerChain,
  checkExpiry,
  validateExpiry,
  checkCompatibility,
  validateCompatibility,
  defaultMigrationMap,
  migrateV1toV2,
  migrateV2toV1,
  portableV1ToNative,
  portableV2ToNative,
  nativeToPortableV1,
  nativeToPortableV2,
  sacredAwareMigrate,
  validateArtifact,
  validateSignature,
  validateIntegrity,
  validateVersion,
  validateSacredPreservation,
  validateImportMode,
  validateConsent,
  applyPolicy,
  mergePoliciesDeep,
  unionRules,
  applyShadow,
  computeImportDiff,
  importUserPolicy,
  purgeImportedPolicy,
  checkSacredGuard,
  consentToImport,
} as const;

export const W53_VERSION = '0.1.0' as const;
export const W53_BUILD = 'cycle-53-2026-06-29' as const;
export const W53_SUPPORTED_ENVELOPE_VERSIONS_DEFAULT: readonly number[] = W53_SUPPORTED_ENVELOPE_VERSIONS;
export const W53_LGPD_ARTICLES_COVERED: readonly ImportLgpdArticleRef['article'][] = ['7', '18', '20'] as const;
export const W53_IMPORT_MODES: readonly ImportMode[] = IMPORT_MODES;
export const W53_MAX_PAYLOAD_BYTES = DEFAULT_MAX_PAYLOAD_BYTES;
export const W53_DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30;
export const W53_DESCRIBE_IMPORT_ERROR = describeImportErrorCode;
export const W53_MAKE_IMPORT_ERROR = makeImportError;
export const W53_IS_IMPORT_ERROR = isImportValidationError;

// ============================================================================
// End of policy-import-validator.ts
// ============================================================================
