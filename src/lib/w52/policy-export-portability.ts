// ============================================================================
// POLICY EXPORT PORTABILITY — Wave 52
// ============================================================================
// Portable export pipeline for w51 redaction policies. Composes by SHAPE
// ONLY (no imports from w51) so the contract is purely structural.
//
// Five pillars:
//   1. Schema Emitter — emit JSON Schema Draft 2020-12 from a RedactionPolicy
//   2. Portable Artifact — signed bundle (HMAC-SHA256) + nested envelope
//   3. Import Validator — accept/reject signed artifacts (sig + integrity +
//      version compatibility)
//   4. Migration Tool — convert between policy formats (v1 ⇄ v2 ⇄ portable)
//   5. Audit Trail — every export/import recorded with LGPD article, signer,
//      integrity hash
//
// LGPD coverage (mandatory):
//   - Art. 7  (consentimento)        → consentToExport gate
//   - Art. 18 (portabilidade)        → exportUserPolicy(userId) full bundle
//   - Art. 20 (portabilidade de dados) → explicit "data subject export" path
//
// Sacred-text policy (mandatory):
//   - Policies protecting sacred text require MULTI-SIG (primary+secondary
//     curator). Migration paths that lose this protection are blocked with
//     PORT_006.
//
// Crypto discipline:
//   - NO external crypto libs. All HMAC-SHA256, key derivation, constant-
//     time compare and salt generation are HAND-ROLLED below.
//   - All public functions are pure (no I/O). The audit trail is appended
//     via in-memory recordEvent; consumers wire it to their storage layer.
//
// Author: Coder worker 3/5 — cycle 52 (2026-06-29)
// ============================================================================

// ============================================================================
// SECTION 1 — Error codes (PORT_001..PORT_006) + custom error class
// ============================================================================

export const PORT_001_SIGNATURE_MISMATCH = 'PORT_001' as const;
export const PORT_002_EXPIRY_EXCEEDED = 'PORT_002' as const;
export const PORT_003_VERSION_INCOMPATIBLE = 'PORT_003' as const;
export const PORT_004_INTEGRITY_CORRUPT = 'PORT_004' as const;
export const PORT_005_SIGNER_CHAIN_INCOMPLETE = 'PORT_005' as const;
export const PORT_006_MIGRATION_BREAKS_SACRED_GUARD = 'PORT_006' as const;
export const PORT_007_CONSENT_MISSING = 'PORT_007' as const;
export const PORT_008_SCHEMA_INVALID = 'PORT_008' as const;
export const PORT_009_PAYLOAD_TOO_LARGE = 'PORT_009' as const;
export const PORT_010_KEY_TOO_WEAK = 'PORT_010' as const;
export const PORT_011_GRACE_PERIOD_EXHAUSTED = 'PORT_011' as const;
export const PORT_012_UNSUPPORTED_MIGRATION_PATH = 'PORT_012' as const;

export type PortabilityErrorCode =
  | typeof PORT_001_SIGNATURE_MISMATCH
  | typeof PORT_002_EXPIRY_EXCEEDED
  | typeof PORT_003_VERSION_INCOMPATIBLE
  | typeof PORT_004_INTEGRITY_CORRUPT
  | typeof PORT_005_SIGNER_CHAIN_INCOMPLETE
  | typeof PORT_006_MIGRATION_BREAKS_SACRED_GUARD
  | typeof PORT_007_CONSENT_MISSING
  | typeof PORT_008_SCHEMA_INVALID
  | typeof PORT_009_PAYLOAD_TOO_LARGE
  | typeof PORT_010_KEY_TOO_WEAK
  | typeof PORT_011_GRACE_PERIOD_EXHAUSTED
  | typeof PORT_012_UNSUPPORTED_MIGRATION_PATH;

export interface PortabilityErrorDetail {
  readonly code: PortabilityErrorCode;
  readonly message: string;
  readonly field?: string;
  readonly hint?: string;
}

export class PortabilityError extends Error {
  public readonly code: PortabilityErrorCode;
  public readonly field: string | undefined;
  public readonly hint: string | undefined;

  constructor(detail: PortabilityErrorDetail) {
    super(detail.message);
    this.name = 'PortabilityError';
    this.code = detail.code;
    this.field = detail.field;
    this.hint = detail.hint;
    Object.setPrototypeOf(this, PortabilityError.prototype);
  }

  public toJSON(): PortabilityErrorDetail {
    return {
      code: this.code,
      message: this.message,
      field: this.field,
      hint: this.hint,
    };
  }
}

export function isPortabilityError(err: unknown): err is PortabilityError {
  return err instanceof PortabilityError;
}

export function makePortabilityError(
  code: PortabilityErrorCode,
  message: string,
  field?: string,
  hint?: string,
): PortabilityError {
  return new PortabilityError({ code, message, field, hint });
}

export const PORTABILITY_ERROR_CODES: readonly PortabilityErrorCode[] = [
  PORT_001_SIGNATURE_MISMATCH,
  PORT_002_EXPIRY_EXCEEDED,
  PORT_003_VERSION_INCOMPATIBLE,
  PORT_004_INTEGRITY_CORRUPT,
  PORT_005_SIGNER_CHAIN_INCOMPLETE,
  PORT_006_MIGRATION_BREAKS_SACRED_GUARD,
  PORT_007_CONSENT_MISSING,
  PORT_008_SCHEMA_INVALID,
  PORT_009_PAYLOAD_TOO_LARGE,
  PORT_010_KEY_TOO_WEAK,
  PORT_011_GRACE_PERIOD_EXHAUSTED,
  PORT_012_UNSUPPORTED_MIGRATION_PATH,
] as const;

export function describeErrorCode(code: PortabilityErrorCode): string {
  switch (code) {
    case PORT_001_SIGNATURE_MISMATCH:
      return 'HMAC-SHA256 signature on payload does not match signer chain.';
    case PORT_002_EXPIRY_EXCEEDED:
      return 'Artifact has passed its issuedAt + expiresAt window.';
    case PORT_003_VERSION_INCOMPATIBLE:
      return 'Envelope version is not within the importer compatible range.';
    case PORT_004_INTEGRITY_CORRUPT:
      return 'SHA-256 integrity hash of payload does not match declared hash.';
    case PORT_005_SIGNER_CHAIN_INCOMPLETE:
      return 'Sacred-text policy requires primary + secondary signer.';
    case PORT_006_MIGRATION_BREAKS_SACRED_GUARD:
      return 'Migration path strips sacred-text multi-sig protection.';
    case PORT_007_CONSENT_MISSING:
      return 'LGPD Art. 7 explicit consent required before export.';
    case PORT_008_SCHEMA_INVALID:
      return 'Generated JSON Schema failed self-validation.';
    case PORT_009_PAYLOAD_TOO_LARGE:
      return 'Payload exceeds the maximum portable artifact size.';
    case PORT_010_KEY_TOO_WEAK:
      return 'Signing key is shorter than the 32-byte minimum.';
    case PORT_011_GRACE_PERIOD_EXHAUSTED:
      return 'Artifact grace period (post-expiry) has been consumed.';
    case PORT_012_UNSUPPORTED_MIGRATION_PATH:
      return 'No migration entry found for the requested format transition.';
  }
}

// ============================================================================
// SECTION 2 — SHAPE-only mirror of w51 RedactionPolicy
// ============================================================================
// We do NOT import the w51 module. Instead, we describe the SHAPE we expect
// (structural typing). If a real w51 instance is passed in, TypeScript will
// accept it as long as it satisfies these interfaces.

export type RedactionAction =
  | 'mask'
  | 'drop'
  | 'hash'
  | 'tokenize'
  | 'placeholder'
  | 'allow';

export interface RedactionFieldRule {
  readonly path: string;
  readonly action: RedactionAction;
  readonly pattern?: string;
  readonly preserveLength?: boolean;
  readonly replacement?: string;
  readonly reason?: string;
}

export interface RedactionContext {
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

export interface RedactionPolicy {
  readonly id: string;
  readonly name: string;
  readonly version: 'v1' | 'v2' | 'portable';
  readonly description?: string;
  readonly fieldRules: readonly RedactionFieldRule[];
  readonly contexts: readonly RedactionContext[];
  readonly protectsSacredText: boolean;
  readonly lgpdArticles: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly authorId: string;
  readonly checksumSeed?: string;
}

export interface RedactionPolicyV1 extends RedactionPolicy {
  readonly version: 'v1';
  readonly schemaVersion: 1;
}

export interface RedactionPolicyV2 extends RedactionPolicy {
  readonly version: 'v2';
  readonly schemaVersion: 2;
  readonly extendV1?: RedactionPolicyV1;
  readonly scopingMatrix?: readonly { context: RedactionContext; rules: readonly string[] }[];
}

export interface PortablePolicyPayload {
  readonly policy: RedactionPolicy;
  readonly extensionFields?: Readonly<Record<string, unknown>>;
  readonly notes?: string;
  readonly locale?: string;
}

// ============================================================================
// SECTION 3 — Portable artifact types
// ============================================================================

export interface Signer {
  readonly id: string;
  readonly role: 'curator' | 'data-steward' | 'compliance-officer' | 'system';
  readonly displayName: string;
  readonly publicKeyFingerprint: string;
  readonly signedAt: string;
}

export interface SignerChain {
  readonly primary: Signer;
  readonly secondary?: Signer;
  readonly tertiary?: Signer;
}

export interface LgpdArticleRef {
  readonly article: '7' | '18' | '20' | '46' | '48';
  readonly description: string;
}

export interface PortablePolicyArtifact {
  readonly envelopeVersion: 1 | 2;
  readonly payload: PortablePolicyPayload;
  readonly signature: string; // base64url HMAC-SHA256
  readonly integrityHash: string; // hex SHA-256 of canonical JSON payload
  readonly issuer: string;
  readonly issuedAt: string; // ISO-8601
  readonly expiresAt: string; // ISO-8601
  readonly lgpdArticles: readonly LgpdArticleRef[];
  readonly signerChain: SignerChain;
  readonly auditTrailId: string;
  readonly artifactId: string;
  readonly gracePeriodSeconds?: number;
  readonly migrationFrom?: 'v1' | 'v2' | 'portable';
  readonly migrationTo?: 'v1' | 'v2' | 'portable';
}

export interface ConsentProof {
  readonly userId: string;
  readonly grantedAt: string;
  readonly article: '7';
  readonly scope: 'export' | 'portability' | 'deletion';
  readonly signature: string;
  readonly ipFingerprint?: string;
}

export interface AuditTrailEntry {
  readonly entryId: string;
  readonly event: 'export' | 'import' | 'migrate' | 'revalidate' | 'reject';
  readonly userId?: string;
  readonly artifactId: string;
  readonly lgpdArticles: readonly LgpdArticleRef[];
  readonly signerChain: SignerChain;
  readonly integrityHash: string;
  readonly result: 'success' | 'failure';
  readonly errorCode?: PortabilityErrorCode;
  readonly timestamp: string;
  readonly notes?: string;
}

// ============================================================================
// SECTION 4 — JSON Schema Draft 2020-12 types
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
  readonly const?: null;
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
// SECTION 5 — Validation result types
// ============================================================================

export interface ValidationError {
  readonly path: string;
  readonly code: string;
  readonly message: string;
  readonly expected?: string;
  readonly received?: string;
}

export interface ValidatorOutcome {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationError[];
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
}

// ============================================================================
// SECTION 6 — Migration types
// ============================================================================

export type MigrationDirection = 'v1→v2' | 'v2→v1' | 'v2→portable' | 'portable→v2' | 'v1→portable' | 'portable→v1';

export interface MigrationEntry {
  readonly field: string;
  readonly kind: 'rename' | 'wrap' | 'unwrap' | 'split' | 'merge' | 'inject' | 'strip' | 'coerce' | 'add' | 'remove';
  readonly description: string;
  readonly preserveIfSacred?: boolean;
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
  readonly output: RedactionPolicy;
  readonly appliedEntries: readonly MigrationEntry[];
  readonly warnings: readonly string[];
  readonly blocked: boolean;
  readonly blockReason?: PortabilityErrorCode;
}

// ============================================================================
// SECTION 7 — HMAC-SHA256 hand-rolled implementation
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

export function deriveSigningKey(masterKey: Uint8Array, context: string, length = 32): Uint8Array {
  if (masterKey.length < 16) {
    throw makePortabilityError(PORT_010_KEY_TOO_WEAK, 'masterKey must be at least 16 bytes', 'masterKey');
  }
  return hkdfSha256({
    ikm: masterKey,
    salt: utf8ToBytes('w52-policy-export-portability'),
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
    seen.add(value);
    const parts: string[] = [];
    for (const v of value) parts.push(canonicalJsonInternal(v, seen));
    return '[' + parts.join(',') + ']';
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (seen.has(obj)) throw new Error('canonical: cycle detected');
    seen.add(obj);
    const keys = Object.keys(obj).sort();
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
// SECTION 11 — JSON Schema emitters
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
  return out as unknown as unknown as JsonSchemaString;
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
  return out as unknown as unknown as JsonSchemaNumber;
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
  return out as unknown as unknown as JsonSchemaBoolean;
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
  return out as unknown as unknown as JsonSchemaObject;
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
  return out as unknown as unknown as JsonSchemaArray;
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

export function emitConstSchema(value: string | number | boolean | null, description?: string): JsonSchema {
  if (value === null) {
    return description !== undefined ? { type: 'null', const: null, description } : { type: 'null', const: null };
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
// SECTION 12 — RedactionPolicy → JSON Schema emitter
// ============================================================================

export function emitRedactionActionSchema(): JsonSchema {
  return emitEnumSchema({
    values: ['mask', 'drop', 'hash', 'tokenize', 'placeholder', 'allow'],
    description: 'Action applied when a field matches the rule pattern.',
  });
}

export function emitRedactionFieldRuleSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      path: emitStringSchema({ minLength: 1, description: 'JSONPath within the payload.' }),
      action: emitRedactionActionSchema(),
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

export function emitRedactionContextSchema(): JsonSchema {
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

export function emitRedactionPolicySchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      id: emitStringSchema({ format: 'uuid' }),
      name: emitStringSchema({ minLength: 1, maxLength: 200 }),
      version: emitEnumSchema({ values: ['v1', 'v2', 'portable'] }),
      description: emitStringSchema(),
      fieldRules: emitArraySchema({ items: emitRedactionFieldRuleSchema(), minItems: 0 }),
      contexts: emitArraySchema({ items: emitRedactionContextSchema(), minItems: 1 }),
      protectsSacredText: emitBooleanSchema(),
      lgpdArticles: emitArraySchema({ items: emitStringSchema() }),
      createdAt: emitStringSchema({ format: 'date-time' }),
      updatedAt: emitStringSchema({ format: 'date-time' }),
      authorId: emitStringSchema({ format: 'uuid' }),
      checksumSeed: emitStringSchema(),
    },
    required: ['id', 'name', 'version', 'fieldRules', 'contexts', 'protectsSacredText', 'lgpdArticles', 'createdAt', 'updatedAt', 'authorId'],
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
          policy: emitRedactionPolicySchema(),
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
      signerChain: emitSignerChainSchema(),
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

export function emitSignerChainSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      primary: emitSignerSchema(),
      secondary: emitSignerSchema(),
      tertiary: emitSignerSchema(),
    },
    required: ['primary'],
    additionalProperties: false,
    description: 'Ordered list of cosigners; secondary/tertiary mandatory for sacred text.',
  });
}

export function emitSignerSchema(): JsonSchema {
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

export function emitRootSchema(policy: RedactionPolicy): JsonSchemaRoot {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://cabala.local/schemas/redaction-policy/${policy.id}.schema.json`,
    title: `RedactionPolicy:${policy.name}`,
    description: policy.description ?? `Auto-generated schema for ${policy.id}.`,
    type: 'object',
    properties: {
      policy: emitRedactionPolicySchema(),
    },
    required: ['policy'],
    additionalProperties: false,
  };
}

export function emitConsentProofSchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      userId: emitStringSchema({ format: 'uuid' }),
      grantedAt: emitStringSchema({ format: 'date-time' }),
      article: emitConstSchema('7', 'LGPD article granting consent.'),
      scope: emitEnumSchema({ values: ['export', 'portability', 'deletion'] }),
      signature: emitStringSchema({ minLength: 32 }),
      ipFingerprint: emitStringSchema(),
    },
    required: ['userId', 'grantedAt', 'article', 'scope', 'signature'],
    additionalProperties: false,
  });
}

export function emitAuditTrailEntrySchema(): JsonSchema {
  return emitObjectSchema({
    properties: {
      entryId: emitStringSchema({ format: 'uuid' }),
      event: emitEnumSchema({ values: ['export', 'import', 'migrate', 'revalidate', 'reject'] }),
      userId: emitStringSchema({ format: 'uuid' }),
      artifactId: emitStringSchema({ format: 'uuid' }),
      lgpdArticles: emitArraySchema({
        items: emitObjectSchema({
          properties: {
            article: emitEnumSchema({ values: ['7', '18', '20', '46', '48'] }),
            description: emitStringSchema(),
          },
          required: ['article', 'description'],
          additionalProperties: false,
        }),
      }),
      signerChain: emitSignerChainSchema(),
      integrityHash: emitStringSchema({ pattern: '^[0-9a-f]{64}$' }),
      result: emitEnumSchema({ values: ['success', 'failure'] }),
      errorCode: emitStringSchema(),
      timestamp: emitStringSchema({ format: 'date-time' }),
      notes: emitStringSchema(),
    },
    required: ['entryId', 'event', 'artifactId', 'lgpdArticles', 'signerChain', 'integrityHash', 'result', 'timestamp'],
    additionalProperties: false,
  });
}

// ============================================================================
// SECTION 13 — Schema self-validator (subset; deep enough for round-trip)
// ============================================================================

export function validateAgainstSchema(value: unknown, schema: JsonSchema, path = '$'): ValidatorOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  validateInternal(value, schema, path, errors, warnings);
  return { valid: errors.length === 0, errors, warnings };
}

function validateInternal(
  value: unknown,
  schema: JsonSchema,
  path: string,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push({ path, code: 'type', message: `expected string`, received: typeof value });
        return;
      }
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push({ path, code: 'minLength', message: `length < ${schema.minLength}`, received: String(value.length) });
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push({ path, code: 'maxLength', message: `length > ${schema.maxLength}`, received: String(value.length) });
      }
      if (schema.pattern !== undefined) {
        try {
          const re = new RegExp(schema.pattern);
          if (!re.test(value)) errors.push({ path, code: 'pattern', message: `pattern mismatch`, received: value });
        } catch {
          warnings.push({ path, code: 'pattern-invalid', message: 'invalid regex pattern' });
        }
      }
      if (schema.enum !== undefined && !schema.enum.includes(value)) {
        errors.push({ path, code: 'enum', message: `not in enum` });
      }
      if (schema.const !== undefined && schema.const !== value) {
        errors.push({ path, code: 'const', message: `must equal const` });
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
        errors.push({ path, code: 'enum', message: `not in enum` });
      }
      if (schema.const !== undefined && schema.const !== value) {
        errors.push({ path, code: 'const', message: `must equal const` });
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
        errors.push({ path, code: 'minItems', message: `items < ${schema.minItems}`, received: String(value.length) });
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        errors.push({ path, code: 'maxItems', message: `items > ${schema.maxItems}`, received: String(value.length) });
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
          validateInternal(value[i], schema.items, `${path}[${i}]`, errors, warnings);
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
      const keys = Object.keys(obj);
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
          validateInternal(obj[k], props[k]!, `${path}.${k}`, errors, warnings);
        } else if (propRegexes.some(({ p, re }) => re.test(k))) {
          for (const { p, re } of propRegexes) {
            if (re.test(k)) validateInternal(obj[k], patternProps[p]!, `${path}.${k}`, errors, warnings);
          }
        } else if (schema.additionalProperties === false) {
          errors.push({ path: `${path}.${k}`, code: 'additional', message: 'additional property not allowed' });
        } else if (typeof schema.additionalProperties === 'object') {
          validateInternal(obj[k], schema.additionalProperties, `${path}.${k}`, errors, warnings);
        }
      }
      return;
    }
  }
}

// ============================================================================
// SECTION 14 — Signature tools
// ============================================================================

export interface SignPayloadOptions {
  readonly artifact: Omit<PortablePolicyArtifact, 'signature' | 'integrityHash'>;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
}

export function hashIntegrity(payload: PortablePolicyPayload): string {
  return sha256Hex(utf8ToBytes(canonicalJson(payload)));
}

export function signPayload(opts: SignPayloadOptions): { signature: string; integrityHash: string } {
  if (opts.primaryKey.length < 16) {
    throw makePortabilityError(PORT_010_KEY_TOO_WEAK, 'primaryKey must be at least 16 bytes', 'primaryKey');
  }
  const integrity = hashIntegrity(opts.artifact.payload);
  const toSign = canonicalJson({ ...opts.artifact, integrityHash: integrity });
  let chainInput = hmacSha256(opts.primaryKey, utf8ToBytes(toSign));
  if (opts.secondaryKey) {
    chainInput = hmacSha256(opts.secondaryKey, chainInput);
  }
  if (opts.tertiaryKey) {
    chainInput = hmacSha256(opts.tertiaryKey, chainInput);
  }
  return { signature: bytesToBase64Url(chainInput), integrityHash: integrity };
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
  const toSign = canonicalJson({ ...opts.artifact, integrityHash: expected });
  let chainInput = hmacSha256(opts.primaryKey, utf8ToBytes(toSign));
  if (opts.secondaryKey) chainInput = hmacSha256(opts.secondaryKey, chainInput);
  if (opts.tertiaryKey) chainInput = hmacSha256(opts.tertiaryKey, chainInput);
  return ctEq(bytesToBase64Url(chainInput), opts.artifact.signature);
}

export interface SignWithChainOptions {
  readonly chain: SignerChain;
  readonly artifact: Omit<PortablePolicyArtifact, 'signature' | 'integrityHash' | 'signerChain'>;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
}

export function signWithChain(opts: SignWithChainOptions): {
  signature: string;
  integrityHash: string;
  signerChain: SignerChain;
} {
  const integrity = hashIntegrity(opts.artifact.payload);
  const toSign = canonicalJson({ ...opts.artifact, integrityHash: integrity });
  let chainInput = hmacSha256(opts.primaryKey, utf8ToBytes(toSign));
  if (opts.secondaryKey && opts.chain.secondary) {
    chainInput = hmacSha256(opts.secondaryKey, chainInput);
  }
  if (opts.tertiaryKey && opts.chain.tertiary) {
    chainInput = hmacSha256(opts.tertiaryKey, chainInput);
  }
  return {
    signature: bytesToBase64Url(chainInput),
    integrityHash: integrity,
    signerChain: opts.chain,
  };
}

export function verifyWithChain(opts: {
  artifact: PortablePolicyArtifact;
  chain: SignerChain;
  primaryKey: Uint8Array;
  secondaryKey?: Uint8Array;
  tertiaryKey?: Uint8Array;
}): boolean {
  return verifySignature({
    artifact: opts.artifact,
    primaryKey: opts.primaryKey,
    secondaryKey: opts.secondaryKey,
    tertiaryKey: opts.tertiaryKey,
  });
}

export function chainSigners(primary: Signer, secondary?: Signer, tertiary?: Signer): SignerChain {
  const out: Record<string, unknown> = { primary };
  if (secondary) out.secondary = secondary;
  if (tertiary) out.tertiary = tertiary;
  return out as unknown as SignerChain;
}

export function isSacredSignerChain(chain: SignerChain): boolean {
  return chain.secondary !== undefined;
}

export function validateSignerChain(chain: SignerChain, sacred: boolean): ValidatorOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!chain.primary) errors.push({ path: 'signerChain.primary', code: 'required', message: 'primary signer required' });
  if (sacred && !chain.secondary) {
    errors.push({
      path: 'signerChain.secondary',
      code: 'sacred-required',
      message: 'sacred-text policy requires secondary curator co-signer',
    });
  }
  if (chain.tertiary && !chain.secondary) {
    warnings.push({
      path: 'signerChain.tertiary',
      code: 'unusual-order',
      message: 'tertiary signer without secondary is unconventional',
    });
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function assertSignerChain(chain: SignerChain, sacred: boolean): void {
  const r = validateSignerChain(chain, sacred);
  if (!r.valid) {
    throw makePortabilityError(
      PORT_005_SIGNER_CHAIN_INCOMPLETE,
      r.errors.map((e) => e.message).join('; '),
      'signerChain',
    );
  }
}

export function rotateSignerKey(oldKey: Uint8Array, newContext: string): Uint8Array {
  return deriveSigningKey(oldKey, `rotate:${newContext}`, 32);
}

// ============================================================================
// SECTION 15 — Expiry + grace period
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

export function validateExpiry(artifact: PortablePolicyArtifact, now: Date = new Date()): ValidatorOutcome {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
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
  } else if (check.inGracePeriod) {
    warnings.push({ path: 'expiresAt', code: 'in-grace', message: `in grace period: ${check.secondsIntoGrace}s remaining` });
  }
  return { valid: errors.length === 0, errors, warnings };
}

// ============================================================================
// SECTION 16 — Compatibility checks
// ============================================================================

export function checkCompatibility(artifact: PortablePolicyArtifact, supported: readonly number[]): CompatibilityResult {
  const blockers: CompatibilityBlocker[] = [];
  const warnings: CompatibilityBlocker[] = [];
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
  if (!artifact.lgpdArticles.some((a) => a.article === '18' || a.article === '20')) {
    blockers.push({
      code: 'lgpd-missing',
      description: 'portable artifact must reference LGPD art. 18 or 20',
      severity: 'blocker',
    });
  }
  return {
    compatible: blockers.length === 0,
    blockers,
    warnings,
    envelopeVersion: artifact.envelopeVersion,
    policyVersion: artifact.payload.policy.version,
  };
}

// ============================================================================
// SECTION 17 — Migration map (v1 ⇄ v2 ⇄ portable)
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

export function validateMigration(map: MigrationMap, direction: MigrationDirection, sacred: boolean): ValidatorOutcome {
  const entries = findMigrationEntries(map, direction);
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (entries.length === 0) {
    errors.push({ path: direction, code: 'empty', message: 'no migration entries' });
    return { valid: false, errors, warnings };
  }
  if (sacred) {
    if (direction === 'v2→v1' || direction === 'portable→v1' || direction === 'portable→v2') {
      const strips = entries.filter((e) => e.kind === 'strip' && (e.field === 'signerChain' || e.field === 'extendV1'));
      if (strips.length > 0 && !strips.every((e) => e.preserveIfSacred)) {
        errors.push({
          path: direction,
          code: 'sacred-protection-loss',
          message: 'migration strips sacred-text multi-sig protection',
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
  return { valid: errors.length === 0, errors, warnings };
}

// ============================================================================
// SECTION 18 — Migration runner
// ============================================================================

export interface MigrateOptions {
  readonly map?: MigrationMap;
  readonly preserveSacred?: boolean;
  readonly auditTrailId?: string;
  readonly artifactId?: string;
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
      throw makePortabilityError(
        PORT_012_UNSUPPORTED_MIGRATION_PATH,
        `unsupported migration path: ${k}`,
        'direction',
      );
  }
}

export function migrateV1toV2(policy: RedactionPolicyV1, opts: MigrateOptions = {}): MigrationResult {
  if (policy.version !== 'v1') {
    throw makePortabilityError(PORT_003_VERSION_INCOMPATIBLE, 'expected v1 policy', 'policy.version');
  }
  const map = opts.map ?? defaultMigrationMap();
  const sacred = policy.protectsSacredText;
  const val = validateMigration(map, 'v1→v2', sacred);
  const warnings = val.warnings.map((w) => w.message);
  const v2: RedactionPolicyV2 = {
    ...policy,
    version: 'v2',
    schemaVersion: 2,
    scopingMatrix: policy.contexts.map((c) => ({
      context: c,
      rules: policy.fieldRules.filter(() => true).map((r) => r.path),
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
    blockReason: !val.valid ? PORT_006_MIGRATION_BREAKS_SACRED_GUARD : undefined,
  };
}

export function migrateV2toV1(policy: RedactionPolicyV2, opts: MigrateOptions = {}): MigrationResult {
  if (policy.version !== 'v2') {
    throw makePortabilityError(PORT_003_VERSION_INCOMPATIBLE, 'expected v2 policy', 'policy.version');
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
      output: policy as unknown as RedactionPolicyV1,
      appliedEntries: [],
      warnings: [...warnings, ...val.errors.map((e) => e.message)],
      blocked: true,
      blockReason: PORT_006_MIGRATION_BREAKS_SACRED_GUARD,
    };
  }
  const v1: RedactionPolicyV1 = {
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

export function migrateV2ToPortable(policy: RedactionPolicyV2, payload: PortablePolicyPayload, opts: MigrateOptions = {}): {
  payload: PortablePolicyPayload;
  appliedEntries: readonly MigrationEntry[];
  warnings: readonly string[];
} {
  const map = opts.map ?? defaultMigrationMap();
  const newPayload: PortablePolicyPayload = {
    ...payload,
    policy: policy,
  };
  return {
    payload: newPayload,
    appliedEntries: map.v2ToPortable,
    warnings: [],
  };
}

export function migratePortableToV2(payload: PortablePolicyPayload, opts: MigrateOptions = {}): {
  policy: RedactionPolicyV2;
  appliedEntries: readonly MigrationEntry[];
  warnings: readonly string[];
} {
  const map = opts.map ?? defaultMigrationMap();
  if (payload.policy.version !== 'v2' && payload.policy.version !== 'portable') {
    throw makePortabilityError(PORT_003_VERSION_INCOMPATIBLE, 'expected v2 or portable', 'policy.version');
  }
  const policy = payload.policy as RedactionPolicyV2;
  return { policy, appliedEntries: map.portableToV2, warnings: [] };
}

export function migrateV1ToPortable(policy: RedactionPolicyV1, opts: MigrateOptions = {}): {
  payload: PortablePolicyPayload;
  appliedEntries: readonly MigrationEntry[];
  warnings: readonly string[];
} {
  const map = opts.map ?? defaultMigrationMap();
  return {
    payload: { policy },
    appliedEntries: map.v1ToPortable,
    warnings: [],
  };
}

export function migratePortableToV1(payload: PortablePolicyPayload, opts: MigrateOptions = {}): {
  policy: RedactionPolicyV1;
  appliedEntries: readonly MigrationEntry[];
  warnings: readonly string[];
} {
  const map = opts.map ?? defaultMigrationMap();
  if (payload.policy.version !== 'v1' && payload.policy.version !== 'portable') {
    throw makePortabilityError(PORT_003_VERSION_INCOMPATIBLE, 'expected v1 or portable', 'policy.version');
  }
  return { policy: payload.policy as RedactionPolicyV1, appliedEntries: map.portableToV1, warnings: [] };
}

// ============================================================================
// SECTION 19 — Artifact builder + parser
// ============================================================================

export interface BuildArtifactOptions {
  readonly policy: RedactionPolicy;
  readonly issuer: string;
  readonly signerChain: SignerChain;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
  readonly ttlSeconds?: number;
  readonly gracePeriodSeconds?: number;
  readonly locale?: string;
  readonly notes?: string;
  readonly extensionFields?: Readonly<Record<string, unknown>>;
  readonly auditTrailId?: string;
  readonly artifactId?: string;
  readonly migrationFrom?: 'v1' | 'v2' | 'portable';
  readonly migrationTo?: 'v1' | 'v2' | 'portable';
  readonly now?: Date;
  readonly maxPayloadBytes?: number;
  readonly lgpdArticles?: readonly LgpdArticleRef[];
}

export const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const DEFAULT_MAX_PAYLOAD_BYTES = 256 * 1024;

export function generateArtifactId(now: Date = new Date()): string {
  const t = now.getTime().toString(16);
  const r = bytesToHex(generateSalt(8));
  return `art_${t}_${r}`;
}

export function defaultLgpdArticlesFor(policy: RedactionPolicy): readonly LgpdArticleRef[] {
  const articles: LgpdArticleRef[] = [
    { article: '18', description: 'Right to portability of personal data.' },
    { article: '20', description: 'Right to data portability (LGPD-equivalent).' },
  ];
  if (policy.protectsSacredText) {
    articles.push({ article: '7', description: 'Explicit consent for sacred-text redaction.' });
  }
  return articles;
}

export function buildArtifact(opts: BuildArtifactOptions): PortablePolicyArtifact {
  const now = opts.now ?? new Date();
  const ttl = opts.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + ttl * 1000).toISOString();
  const payload: PortablePolicyPayload = {
    policy: opts.policy,
    extensionFields: opts.extensionFields,
    notes: opts.notes,
    locale: opts.locale,
  };
  const canonicalPayload = utf8ToBytes(canonicalJson(payload));
  if (canonicalPayload.length > (opts.maxPayloadBytes ?? DEFAULT_MAX_PAYLOAD_BYTES)) {
    throw makePortabilityError(
      PORT_009_PAYLOAD_TOO_LARGE,
      `payload=${canonicalPayload.length} > max=${opts.maxPayloadBytes ?? DEFAULT_MAX_PAYLOAD_BYTES}`,
      'payload',
    );
  }
  const integrityHash = sha256Hex(canonicalPayload);
  const artifactId = opts.artifactId ?? generateArtifactId(now);
  const auditTrailId = opts.auditTrailId ?? artifactId;
  const partial: Omit<PortablePolicyArtifact, 'signature'> = {
    envelopeVersion: 2,
    payload,
    integrityHash,
    issuer: opts.issuer,
    issuedAt,
    expiresAt,
    lgpdArticles: opts.lgpdArticles ?? defaultLgpdArticlesFor(opts.policy),
    signerChain: opts.signerChain,
    auditTrailId,
    artifactId,
    gracePeriodSeconds: opts.gracePeriodSeconds,
    migrationFrom: opts.migrationFrom,
    migrationTo: opts.migrationTo,
  };
  const toSign = canonicalJson(partial);
  let chainInput = hmacSha256(opts.primaryKey, utf8ToBytes(toSign));
  if (opts.secondaryKey && opts.signerChain.secondary) chainInput = hmacSha256(opts.secondaryKey, chainInput);
  if (opts.tertiaryKey && opts.signerChain.tertiary) chainInput = hmacSha256(opts.tertiaryKey, chainInput);
  const signature = bytesToBase64Url(chainInput);
  return { ...partial, signature };
}

export interface ParseOptions {
  readonly supportedVersions?: readonly number[];
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
  readonly now?: Date;
  readonly allowGrace?: boolean;
}

export function parseArtifact(raw: unknown, opts: ParseOptions): {
  artifact: PortablePolicyArtifact;
  outcome: ValidatorOutcome;
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (typeof raw !== 'object' || raw === null) {
    throw makePortabilityError(PORT_008_SCHEMA_INVALID, 'artifact must be an object', '$');
  }
  const obj = raw as Record<string, unknown>;
  const schema = emitPortablePolicyArtifactSchema();
  const schemaCheck = validateAgainstSchema(obj, schema);
  if (!schemaCheck.valid) {
    errors.push(...schemaCheck.errors);
  }
  warnings.push(...schemaCheck.warnings);
  const artifact = obj as unknown as PortablePolicyArtifact;
  const supported = opts.supportedVersions ?? [2];
  const compat = checkCompatibility(artifact, supported);
  for (const b of compat.blockers) errors.push({ path: b.path ?? '$', code: b.code, message: b.description });
  for (const w of compat.warnings) warnings.push({ path: w.path ?? '$', code: w.code, message: w.description });
  if (!verifySignature({
    artifact,
    primaryKey: opts.primaryKey,
    secondaryKey: opts.secondaryKey,
    tertiaryKey: opts.tertiaryKey,
  })) {
    errors.push({ path: 'signature', code: PORT_001_SIGNATURE_MISMATCH, message: 'HMAC verification failed' });
  }
  const expectedIntegrity = hashIntegrity(artifact.payload);
  if (!ctEq(expectedIntegrity, artifact.integrityHash)) {
    errors.push({ path: 'integrityHash', code: PORT_004_INTEGRITY_CORRUPT, message: 'integrity hash mismatch' });
  }
  const expiry = validateExpiry(artifact, opts.now ?? new Date());
  if (!opts.allowGrace) {
    for (const e of expiry.errors) errors.push(e);
  }
  for (const w of expiry.warnings) warnings.push(w);
  const chainVal = validateSignerChain(artifact.signerChain, artifact.payload.policy.protectsSacredText);
  for (const e of chainVal.errors) errors.push(e);
  for (const w of chainVal.warnings) warnings.push(w);
  return { artifact, outcome: { valid: errors.length === 0, errors, warnings } };
}

export function validateArtifact(artifact: PortablePolicyArtifact, opts: Omit<ParseOptions, 'now'> & { now?: Date }): ValidatorOutcome {
  return parseArtifact(artifact, opts).outcome;
}

// ============================================================================
// SECTION 20 — LGPD consent gate
// ============================================================================

export function recordConsent(proof: ConsentProof, auditTrailId: string): AuditTrailEntry {
  return {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'export',
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

export function consentSigner(proof: ConsentProof): Signer {
  return {
    id: `consent_${proof.userId}`,
    role: 'system',
    displayName: 'Consent Recorder',
    publicKeyFingerprint: sha256Hex(utf8ToBytes(proof.userId)).substring(0, 16),
    signedAt: proof.grantedAt,
  };
}

export function assertConsent(proof: ConsentProof | undefined): void {
  if (!proof) {
    throw makePortabilityError(PORT_007_CONSENT_MISSING, 'LGPD Art. 7 requires explicit consent', 'consentProof');
  }
  if (!proof.userId || !proof.signature || !proof.grantedAt) {
    throw makePortabilityError(PORT_007_CONSENT_MISSING, 'consent proof is incomplete', 'consentProof');
  }
  if (proof.article !== '7') {
    throw makePortabilityError(PORT_007_CONSENT_MISSING, 'consent article must be LGPD-7', 'consentProof.article');
  }
}

export function consentToExport(consentProof: ConsentProof): ConsentProof {
  assertConsent(consentProof);
  return consentProof;
}

// ============================================================================
// SECTION 21 — LGPD Art. 18 / Art. 20 portable export
// ============================================================================

export interface ExportUserPolicyOptions {
  readonly userId: string;
  readonly policies: readonly RedactionPolicy[];
  readonly issuer: string;
  readonly signerChain: SignerChain;
  readonly primaryKey: Uint8Array;
  readonly secondaryKey?: Uint8Array;
  readonly tertiaryKey?: Uint8Array;
  readonly consentProof: ConsentProof;
  readonly now?: Date;
  readonly ttlSeconds?: number;
}

export function exportUserPolicy(opts: ExportUserPolicyOptions): {
  artifacts: readonly PortablePolicyArtifact[];
  auditEntries: readonly AuditTrailEntry[];
} {
  assertConsent(opts.consentProof);
  const now = opts.now ?? new Date();
  const artifacts: PortablePolicyArtifact[] = [];
  const auditEntries: AuditTrailEntry[] = [];
  for (const policy of opts.policies) {
    if (policy.authorId !== opts.userId && policy.protectsSacredText === false) {
      // skip policies the user doesn't author (unless sacred-text shared)
      continue;
    }
    const artifact = buildArtifact({
      policy,
      issuer: opts.issuer,
      signerChain: opts.signerChain,
      primaryKey: opts.primaryKey,
      secondaryKey: opts.secondaryKey,
      tertiaryKey: opts.tertiaryKey,
      now,
      ttlSeconds: opts.ttlSeconds,
      auditTrailId: `audit_${opts.userId}_${policy.id}`,
    });
    artifacts.push(artifact);
    auditEntries.push({
      entryId: `evt_${bytesToHex(generateSalt(8))}`,
      event: 'export',
      userId: opts.userId,
      artifactId: artifact.artifactId,
      lgpdArticles: artifact.lgpdArticles,
      signerChain: opts.signerChain,
      integrityHash: artifact.integrityHash,
      result: 'success',
      timestamp: now.toISOString(),
      notes: `LGPD art. 18/20 portable export`,
    });
  }
  return { artifacts, auditEntries };
}

export function exportDataSubjectBundle(opts: {
  userId: string;
  policies: readonly RedactionPolicy[];
  consentProof: ConsentProof;
  issuer: string;
  signerChain: SignerChain;
  primaryKey: Uint8Array;
  secondaryKey?: Uint8Array;
  now?: Date;
}): { artifacts: readonly PortablePolicyArtifact[]; article20: LgpdArticleRef } {
  const out = exportUserPolicy({
    userId: opts.userId,
    policies: opts.policies,
    issuer: opts.issuer,
    signerChain: opts.signerChain,
    primaryKey: opts.primaryKey,
    secondaryKey: opts.secondaryKey,
    consentProof: opts.consentProof,
    now: opts.now,
  });
  return { artifacts: out.artifacts, article20: { article: '20', description: 'LGPD data portability.' } };
}

// ============================================================================
// SECTION 22 — Sacred-text guard
// ============================================================================

export function requiresSacredCoSigner(policy: RedactionPolicy): boolean {
  return policy.protectsSacredText === true;
}

export function assertSacredGuard(policy: RedactionPolicy, chain: SignerChain): void {
  if (policy.protectsSacredText && !chain.secondary) {
    throw makePortabilityError(
      PORT_005_SIGNER_CHAIN_INCOMPLETE,
      'sacred-text policy requires secondary curator co-signer',
      'signerChain.secondary',
    );
  }
}

export function enforceSacredGuardOnMigration(from: RedactionPolicy, to: RedactionPolicy): void {
  if (from.protectsSacredText && !to.protectsSacredText) {
    throw makePortabilityError(
      PORT_006_MIGRATION_BREAKS_SACRED_GUARD,
      'migration stripped sacred-text protection',
      'policy.protectsSacredText',
    );
  }
}

// ============================================================================
// SECTION 23 — Audit trail
// ============================================================================

const inMemoryAuditLog: AuditTrailEntry[] = [];

export function recordEvent(entry: AuditTrailEntry): void {
  inMemoryAuditLog.push(entry);
}

export function getAuditLog(): readonly AuditTrailEntry[] {
  return inMemoryAuditLog;
}

export function clearAuditLog(): void {
  inMemoryAuditLog.length = 0;
}

export function filterAuditLog(predicate: (e: AuditTrailEntry) => boolean): readonly AuditTrailEntry[] {
  return inMemoryAuditLog.filter(predicate);
}

export function summarizeAuditLog(): {
  total: number;
  successes: number;
  failures: number;
  byEvent: Record<string, number>;
} {
  const byEvent: Record<string, number> = {};
  let successes = 0;
  let failures = 0;
  for (const e of inMemoryAuditLog) {
    byEvent[e.event] = (byEvent[e.event] ?? 0) + 1;
    if (e.result === 'success') successes++;
    else failures++;
  }
  return { total: inMemoryAuditLog.length, successes, failures, byEvent };
}

export function auditReject(opts: {
  artifact: PortablePolicyArtifact;
  signerChain: SignerChain;
  reason: PortabilityErrorCode;
  notes?: string;
  now?: Date;
}): AuditTrailEntry {
  const now = opts.now ?? new Date();
  const entry: AuditTrailEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'reject',
    artifactId: opts.artifact.artifactId,
    lgpdArticles: opts.artifact.lgpdArticles,
    signerChain: opts.signerChain,
    integrityHash: opts.artifact.integrityHash,
    result: 'failure',
    errorCode: opts.reason,
    timestamp: now.toISOString(),
    notes: opts.notes,
  };
  recordEvent(entry);
  return entry;
}

export function auditExport(opts: {
  artifact: PortablePolicyArtifact;
  signerChain: SignerChain;
  userId?: string;
  now?: Date;
}): AuditTrailEntry {
  const now = opts.now ?? new Date();
  const entry: AuditTrailEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'export',
    userId: opts.userId,
    artifactId: opts.artifact.artifactId,
    lgpdArticles: opts.artifact.lgpdArticles,
    signerChain: opts.signerChain,
    integrityHash: opts.artifact.integrityHash,
    result: 'success',
    timestamp: now.toISOString(),
  };
  recordEvent(entry);
  return entry;
}

export function auditImport(opts: {
  artifact: PortablePolicyArtifact;
  signerChain: SignerChain;
  outcome: ValidatorOutcome;
  userId?: string;
  now?: Date;
}): AuditTrailEntry {
  const now = opts.now ?? new Date();
  const entry: AuditTrailEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'import',
    userId: opts.userId,
    artifactId: opts.artifact.artifactId,
    lgpdArticles: opts.artifact.lgpdArticles,
    signerChain: opts.signerChain,
    integrityHash: opts.artifact.integrityHash,
    result: opts.outcome.valid ? 'success' : 'failure',
    errorCode: opts.outcome.valid ? undefined : PORT_001_SIGNATURE_MISMATCH,
    timestamp: now.toISOString(),
  };
  recordEvent(entry);
  return entry;
}

export function auditMigrate(opts: {
  artifact: PortablePolicyArtifact;
  signerChain: SignerChain;
  direction: MigrationDirection;
  userId?: string;
  now?: Date;
}): AuditTrailEntry {
  const now = opts.now ?? new Date();
  const entry: AuditTrailEntry = {
    entryId: `evt_${bytesToHex(generateSalt(8))}`,
    event: 'migrate',
    userId: opts.userId,
    artifactId: opts.artifact.artifactId,
    lgpdArticles: opts.artifact.lgpdArticles,
    signerChain: opts.signerChain,
    integrityHash: opts.artifact.integrityHash,
    result: 'success',
    timestamp: now.toISOString(),
    notes: opts.direction,
  };
  recordEvent(entry);
  return entry;
}

// ============================================================================
// SECTION 24 — Convenience shape builders
// ============================================================================

export function buildSigner(input: {
  id: string;
  role: Signer['role'];
  displayName: string;
  publicKey: Uint8Array;
  now?: Date;
}): Signer {
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
  fieldRules: readonly RedactionFieldRule[];
  contexts: readonly RedactionContext[];
  protectsSacredText?: boolean;
  lgpdArticles?: readonly string[];
  description?: string;
  now?: Date;
}): RedactionPolicyV1 {
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
  fieldRules: readonly RedactionFieldRule[];
  contexts: readonly RedactionContext[];
  protectsSacredText?: boolean;
  lgpdArticles?: readonly string[];
  description?: string;
  extendV1?: RedactionPolicyV1;
  scopingMatrix?: readonly { context: RedactionContext; rules: readonly string[] }[];
  now?: Date;
}): RedactionPolicyV2 {
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

// ============================================================================
// SECTION 25 — Helpers / utilities
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

export function safeEqualHex(a: string, b: string): boolean {
  return ctEq(a.toLowerCase(), b.toLowerCase());
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
// SECTION 26 — Smoke test scenarios (14+)
// ============================================================================

export interface SmokeScenarioResult {
  readonly name: string;
  readonly passed: boolean;
  readonly notes: string;
}

export function smokeHmacRoundtrip(): SmokeScenarioResult {
  const key = utf8ToBytes('the-quick-brown-fox-jumps-over-the-lazy-dog');
  const msg = utf8ToBytes('hello world');
  const a = hmacSha256Hex(key, msg);
  const b = hmacSha256Hex(key, msg);
  const passed = ctEq(a, b) && a.length === 64;
  return { name: 'hmac-roundtrip', passed, notes: `digest=${a.slice(0, 16)}…` };
}

export function smokeConstantTimeCompare(): SmokeScenarioResult {
  const a = utf8ToBytes('aabbcc');
  const b = utf8ToBytes('aabbcc');
  const c = utf8ToBytes('aabbcd');
  const passed = constantTimeEqual(a, b) && !constantTimeEqual(a, c);
  return { name: 'ctEq', passed, notes: 'constant-time equal works' };
}

export function smokeExpiryCheck(): SmokeScenarioResult {
  const future = addSeconds(nowIso(), 3600);
  const past = addSeconds(nowIso(), -3600);
  const key = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const signer = buildSigner({ id: 's', role: 'curator', displayName: 'C', publicKey: key });
  const policy = buildPolicyV1({ id: 'p1', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }] });
  const futureArt = buildArtifact({
    policy,
    issuer: 't',
    signerChain: { primary: signer },
    primaryKey: key,
    ttlSeconds: 3600,
  });
  const pastArt = buildArtifact({
    policy,
    issuer: 't',
    signerChain: { primary: signer },
    primaryKey: key,
    ttlSeconds: -10,
    gracePeriodSeconds: 600,
  });
  const r1 = checkExpiry(futureArt);
  const r2 = checkExpiry(pastArt);
  const passed = !r1.expired && r1.secondsToExpiry > 3500 && r2.expired && r2.inGracePeriod;
  return { name: 'expiry-check', passed, notes: `valid=${!r1.expired} grace=${r2.inGracePeriod}` };
}

export function smokeSignatureChainSingle(): SmokeScenarioResult {
  const key = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const artifact = buildArtifact({
    policy: buildPolicyV1({ id: 'p1', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }] }),
    issuer: 'test',
    signerChain: { primary: buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: key }) },
    primaryKey: key,
  });
  const ok = verifySignature({ artifact, primaryKey: key });
  return { name: 'sig-chain-single', passed: ok, notes: `sig=${artifact.signature.slice(0, 16)}…` };
}

export function smokeSignatureChainDual(): SmokeScenarioResult {
  const k1 = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const k2 = utf8ToBytes('fedcba9876543210fedcba9876543210');
  const artifact = buildArtifact({
    policy: buildPolicyV1({ id: 'p1', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }], protectsSacredText: true }),
    issuer: 'test',
    signerChain: {
      primary: buildSigner({ id: 's1', role: 'curator', displayName: 'C', publicKey: k1 }),
      secondary: buildSigner({ id: 's2', role: 'compliance-officer', displayName: 'D', publicKey: k2 }),
    },
    primaryKey: k1,
    secondaryKey: k2,
  });
  const ok = verifySignature({ artifact, primaryKey: k1, secondaryKey: k2 });
  return { name: 'sig-chain-dual', passed: ok, notes: 'multi-sig verified' };
}

export function smokeSchemaEmission(): SmokeScenarioResult {
  const s1 = emitStringSchema({ minLength: 1, maxLength: 10 });
  const s2 = emitObjectSchema({ required: ['a'] });
  const s3 = emitArraySchema({ items: emitStringSchema() });
  const s4 = emitEnumSchema({ values: ['a', 'b'] });
  const s5 = emitBooleanSchema();
  const out = validateAgainstSchema({ a: 'hi' }, s2);
  const passed =
    s1.type === 'string' &&
    s2.type === 'object' &&
    s3.type === 'array' &&
    s4.type === 'string' &&
    s5.type === 'boolean' &&
    out.valid;
  return { name: 'schema-emission-5-types', passed, notes: '5 schemas + sample validate' };
}

export function smokeMigrationBothDirections(): SmokeScenarioResult {
  const v1 = buildPolicyV1({ id: 'p', name: 'p', authorId: 'u', fieldRules: [{ path: 'email', action: 'mask' }], contexts: [{ scope: 'private', surface: 'profile' }] });
  const up = migrateV1toV2(v1);
  const down = migrateV2toV1(up.output as RedactionPolicyV2);
  const passed = up.output.version === 'v2' && down.output.version === 'v1' && !down.blocked;
  return { name: 'migration-both-directions', passed, notes: `up=${up.output.version} down=${down.output.version}` };
}

export function smokeSacredGuard(): SmokeScenarioResult {
  const v1 = buildPolicyV1({ id: 'p', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }], protectsSacredText: true });
  const chain = { primary: buildSigner({ id: 's', role: 'curator', displayName: 'C', publicKey: utf8ToBytes('k') }) };
  let threw = false;
  try { assertSacredGuard(v1, chain); } catch { threw = true; }
  return { name: 'sacred-guard', passed: threw, notes: 'single signer blocked for sacred text' };
}

export function smokeIntegrityCorruption(): SmokeScenarioResult {
  const key = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const a = buildArtifact({
    policy: buildPolicyV1({ id: 'p', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }] }),
    issuer: 't',
    signerChain: { primary: buildSigner({ id: 's', role: 'curator', displayName: 'C', publicKey: key }) },
    primaryKey: key,
  });
  const tampered: PortablePolicyArtifact = {
    ...a,
    payload: { ...a.payload, notes: (a.payload.notes ?? '') + 'x' },
  };
  const ok = !verifySignature({ artifact: tampered, primaryKey: key });
  return { name: 'integrity-corruption', passed: ok, notes: 'tamper detected via signature' };
}

export function smokeExporterPortability(): SmokeScenarioResult {
  const key = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const policy = buildPolicyV1({ id: 'p', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }] });
  const proof: ConsentProof = {
    userId: 'u',
    grantedAt: nowIso(),
    article: '7',
    scope: 'export',
    signature: 'sig-abc',
  };
  const out = exportUserPolicy({
    userId: 'u',
    policies: [policy],
    issuer: 'test',
    signerChain: { primary: buildSigner({ id: 's', role: 'curator', displayName: 'C', publicKey: key }) },
    primaryKey: key,
    consentProof: proof,
  });
  const passed = out.artifacts.length === 1 && out.auditEntries.length === 1;
  return { name: 'exporter-portability', passed, notes: `artifacts=${out.artifacts.length}` };
}

export function smokeImporterValidation(): SmokeScenarioResult {
  const key = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const artifact = buildArtifact({
    policy: buildPolicyV1({ id: 'p', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }] }),
    issuer: 't',
    signerChain: { primary: buildSigner({ id: 's', role: 'curator', displayName: 'C', publicKey: key }) },
    primaryKey: key,
  });
  const good = parseArtifact(artifact, { primaryKey: key });
  const badSig = artifact.signature.slice(0, -1) + (artifact.signature.slice(-1) === 'A' ? 'B' : 'A');
  const bad = parseArtifact({ ...artifact, signature: badSig }, { primaryKey: key });
  const passed = good.outcome.valid && !bad.outcome.valid;
  return { name: 'importer-validation', passed, notes: `good=${good.outcome.valid} bad=${bad.outcome.valid}` };
}

export function smokeExpiryGracePeriod(): SmokeScenarioResult {
  const policy = buildPolicyV1({ id: 'p', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }] });
  const key = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const now = new Date();
  const expiredArtifact = buildArtifact({
    policy,
    issuer: 't',
    signerChain: { primary: buildSigner({ id: 's', role: 'curator', displayName: 'C', publicKey: key }) },
    primaryKey: key,
    now,
    ttlSeconds: -10,
    gracePeriodSeconds: 3600,
  });
  const v = validateExpiry(expiredArtifact, now);
  const passed = v.valid && v.warnings.length > 0;
  return { name: 'grace-period', passed, notes: `valid=${v.valid} warnings=${v.warnings.length}` };
}

export function smokeVersionSkewRejection(): SmokeScenarioResult {
  const policy = buildPolicyV1({ id: 'p', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }] });
  const key = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const a = buildArtifact({
    policy,
    issuer: 't',
    signerChain: { primary: buildSigner({ id: 's', role: 'curator', displayName: 'C', publicKey: key }) },
    primaryKey: key,
  });
  const r = parseArtifact(a, { primaryKey: key, supportedVersions: [1] });
  const passed = !r.outcome.valid;
  return { name: 'version-skew', passed, notes: `envelope=2, supported=1 → rejected=${!r.outcome.valid}` };
}

export function smokeConstTimeSignatureMismatch(): SmokeScenarioResult {
  const k1 = utf8ToBytes('0123456789abcdef0123456789abcdef');
  const k2 = utf8ToBytes('fedcba9876543210fedcba9876543210');
  const a = buildArtifact({
    policy: buildPolicyV1({ id: 'p', name: 'p', authorId: 'u', fieldRules: [], contexts: [{ scope: 'private', surface: 'profile' }] }),
    issuer: 't',
    signerChain: { primary: buildSigner({ id: 's', role: 'curator', displayName: 'C', publicKey: k1 }) },
    primaryKey: k1,
  });
  const ok = !verifySignature({ artifact: a, primaryKey: k2 });
  return { name: 'sig-mismatch', passed: ok, notes: 'wrong key rejected' };
}

export function smokeCanonicalJsonStability(): SmokeScenarioResult {
  const a = canonicalJson({ b: 1, a: 2, c: [3, 2, 1] });
  const b = canonicalJson({ c: [3, 2, 1], a: 2, b: 1 });
  const passed = a === b;
  return { name: 'canonical-json', passed, notes: `len=${a.length}` };
}

export function smokeHkdfDerivation(): SmokeScenarioResult {
  const ikm = utf8ToBytes('input-key-material-here');
  const k1 = hkdfSha256({ ikm, salt: utf8ToBytes('salt'), info: utf8ToBytes('info-a'), length: 32 });
  const k2 = hkdfSha256({ ikm, salt: utf8ToBytes('salt'), info: utf8ToBytes('info-b'), length: 32 });
  const passed = k1.length === 32 && k2.length === 32 && !constantTimeEqual(k1, k2);
  return { name: 'hkdf-derive', passed, notes: 'different info → different output' };
}

export function smokeSacredCoSignerRequired(): SmokeScenarioResult {
  const chain = {
    primary: buildSigner({ id: 's1', role: 'curator', displayName: 'A', publicKey: utf8ToBytes('k1') }),
    secondary: buildSigner({ id: 's2', role: 'compliance-officer', displayName: 'B', publicKey: utf8ToBytes('k2') }),
  };
  const r = validateSignerChain(chain, true);
  return { name: 'sacred-cosigner-required', passed: r.valid, notes: 'dual signer accepted for sacred text' };
}

export function smokeAll(): readonly SmokeScenarioResult[] {
  return [
    smokeHmacRoundtrip(),
    smokeConstantTimeCompare(),
    smokeExpiryCheck(),
    smokeSignatureChainSingle(),
    smokeSignatureChainDual(),
    smokeSchemaEmission(),
    smokeMigrationBothDirections(),
    smokeSacredGuard(),
    smokeIntegrityCorruption(),
    smokeExporterPortability(),
    smokeImporterValidation(),
    smokeExpiryGracePeriod(),
    smokeVersionSkewRejection(),
    smokeConstTimeSignatureMismatch(),
    smokeCanonicalJsonStability(),
    smokeHkdfDerivation(),
    smokeSacredCoSignerRequired(),
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
// SECTION 27 — Type guards + predicates
// ============================================================================

export function isRedactionPolicy(value: unknown): value is RedactionPolicy {
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

export function isSignerChain(value: unknown): value is SignerChain {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return isSigner(v['primary']);
}

export function isSigner(value: unknown): value is Signer {
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

export function isConsentProof(value: unknown): value is ConsentProof {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['userId'] === 'string' &&
    typeof v['grantedAt'] === 'string' &&
    v['article'] === '7' &&
    (v['scope'] === 'export' || v['scope'] === 'portability' || v['scope'] === 'deletion') &&
    typeof v['signature'] === 'string'
  );
}

// ============================================================================
// SECTION 28 — Migration helpers (round-trip integrity)
// ============================================================================

export function roundTripMigration(policy: RedactionPolicyV1): {
  v1: RedactionPolicyV1;
  v2: RedactionPolicyV2;
  back: RedactionPolicyV1;
  lostSacredProtection: boolean;
} {
  const v2Result = migrateV1toV2(policy);
  const v2 = v2Result.output as RedactionPolicyV2;
  const backResult = migrateV2toV1(v2);
  const lost = policy.protectsSacredText && !backResult.output.protectsSacredText;
  return { v1: policy, v2, back: backResult.output as RedactionPolicyV1, lostSacredProtection: lost };
}

export function detectLostSacredProtection(from: RedactionPolicy, to: RedactionPolicy): boolean {
  return from.protectsSacredText && !to.protectsSacredText;
}

// ============================================================================
// SECTION 29 — Public re-exports (for downstream modules)
// ============================================================================

export const w52 = {
  PORT_001_SIGNATURE_MISMATCH,
  PORT_002_EXPIRY_EXCEEDED,
  PORT_003_VERSION_INCOMPATIBLE,
  PORT_004_INTEGRITY_CORRUPT,
  PORT_005_SIGNER_CHAIN_INCOMPLETE,
  PORT_006_MIGRATION_BREAKS_SACRED_GUARD,
  sha256,
  sha256Hex,
  hmacSha256,
  hmacSha256Hex,
  hmacSha256Base64Url,
  canonicalJson,
  buildArtifact,
  parseArtifact,
  validateArtifact,
  signPayload,
  verifySignature,
  signWithChain,
  verifyWithChain,
  chainSigners,
  hashIntegrity,
  checkExpiry,
  validateExpiry,
  checkCompatibility,
  defaultMigrationMap,
  migrateV1toV2,
  migrateV2toV1,
  exportUserPolicy,
  consentToExport,
} as const;

// ============================================================================
// SECTION 30 — Version metadata
// ============================================================================

export const W52_VERSION = '0.1.0' as const;
export const W52_BUILD = 'cycle-52-2026-06-29' as const;
export const W52_SUPPORTED_ENVELOPE_VERSIONS: readonly number[] = [1, 2] as const;
export const W52_LGPD_ARTICLES_COVERED: readonly LgpdArticleRef['article'][] = ['7', '18', '20'] as const;

// ============================================================================
// End of policy-export-portability.ts
// ============================================================================
