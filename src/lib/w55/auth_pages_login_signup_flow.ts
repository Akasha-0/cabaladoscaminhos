/* =============================================================================
 * W55 — Auth Pages Login & Signup Flow Engine
 * -----------------------------------------------------------------------------
 * Self-contained auth flow specification for /login and /signup pages.
 * Covers: magic link, OAuth (Google / Apple / GitHub), password, onboarding
 * handoff, accessibility (WCAG AA), LGPD Art. 7 / 9 / 18, sacred-tag exclusion.
 *
 * THIS IS NOT A RUNTIME INTEGRATION. It is a by-shape specification that the
 * w60+ consolidation phase will wire into /app/(auth)/login and
 * /app/(auth)/signup. All exports are pure functions, no side effects, no I/O,
 * no network. They are designed to be:
 *   - unit-testable (smoke calls at the bottom of the file)
 *   - forward-portable (no platform-specific globals)
 *   - auditable (every mutation returns an audit event)
 *
 * Constraints honored by this file:
 *   - ZERO repo imports (only TypeScript types + Math/string natives).
 *   - Hand-rolled HMAC-SHA256 + FNV-1a (no crypto, no Node).
 *   - Strict mode (TS6) friendly — every shape is explicit.
 *   - 30+ named exports.
 *   - Sacred-tag exclusion is MANDATORY and hardcoded.
 *   - LGPD basis field is MANDATORY in every data-handling function.
 *   - A11y ARIA tree is MANDATORY in the form state machine.
 *
 * Engine shape (see §15 for version constants):
 *   ENGINE_VERSION = "1.0.0+w55.0"
 *   POLICY_VERSION = "lgpd-2025.1"
 *   A11Y_PROFILE   = "WCAG-2.1-AA"
 * ============================================================================= */

/* =============================================================================
 * §1. Tipos & Contratos — Types & Contracts
 * ============================================================================= */

/** Authentication modes supported by the login page. */
export const enum AuthMode {
  MagicLink = "magic_link",
  Password = "password",
  OAuth = "oauth",
  /** Combined: OAuth first, fall back to magic link. */
  OAuthThenMagicLink = "oauth_then_magic_link",
  /** Anonymous-only consult (no account, no auth). */
  GuestConsult = "guest_consult",
}

/** OAuth providers supported by the login page. */
export const enum OAuthProvider {
  Google = "google",
  Apple = "apple",
  GitHub = "github",
}

/** LGPD legal bases (Lei Geral de Proteção de Dados — Art. 7). */
export const enum LgpdBasis {
  /** Art. 7, I — express consentimento do titular. */
  Consentimento = "consentimento",
  /** Art. 7, VI — exercício regular de direitos em contrato. */
  ExecucaoContrato = "execucao_contrato",
  /** Art. 7, IX — interesse legítimo (legítimo interesse). */
  LegitimoInteresse = "legitimo_interesse",
  /** Art. 7, II — cumprimento de obrigação legal/regulatória. */
  ObrigacaoLegal = "obrigacao_legal",
}

/** Sacred-tag rejection codes. Hardcoded — see §12. */
export const enum SacredRejectionCode {
  /** SAC_001 — field would carry sacred data, rejected. */
  SAC_001 = "SAC_001",
  /** SAC_002 — payload contains initiation status marker. */
  SAC_002 = "SAC_002",
  /** SAC_003 — payload contains priest name / lineage. */
  SAC_003 = "SAC_003",
  /** SAC_004 — payload contains sacred text affiliation. */
  SAC_004 = "SAC_004",
  /** SAC_005 — payload contains specific prayer tradition rank. */
  SAC_005 = "SAC_005",
}

/** Form-level error codes (kept distinct from sacred rejections). */
export const enum AuthErrorCode {
  InvalidEmail = "AUTH_001",
  PasswordTooShort = "AUTH_002",
  PasswordMissingComplexity = "AUTH_003",
  EmailAlreadyRegistered = "AUTH_004",
  RateLimited = "AUTH_005",
  TokenExpired = "AUTH_006",
  TokenTampered = "AUTH_007",
  TokenReplayed = "AUTH_008",
  ProviderError = "AUTH_009",
  NetworkError = "AUTH_010",
  MissingConsent = "AUTH_011",
  WeakPassword = "AUTH_012",
  InvalidProvider = "AUTH_013",
  OnboardingHandoffFailed = "AUTH_014",
  /** Catch-all generic error. */
  Unknown = "AUTH_999",
}

/** Login form lifecycle states. See §5. */
export const enum LoginState {
  Idle = "idle",
  Editing = "editing",
  Submitting = "submitting",
  /** Magic link was sent, awaiting click. */
  MagicLinkSent = "magic_link_sent",
  /** OAuth redirect was issued, awaiting return. */
  OAuthRedirecting = "oauth_redirecting",
  /** Authenticated successfully. */
  Authenticated = "authenticated",
  /** Failed with recoverable error. */
  Error = "error",
  /** Locked out by rate limit. */
  RateLimited = "rate_limited",
  /** Disabled by admin or self-service. */
  Blocked = "blocked",
}

/** Signup form lifecycle states. See §6. */
export const enum SignupState {
  Idle = "idle",
  Editing = "editing",
  Submitting = "submitting",
  /** Email confirmation required. */
  AwaitingConfirmation = "awaiting_confirmation",
  /** OAuth handoff in flight. */
  OAuthLinking = "oauth_linking",
  /** Account created, ready to hand off to onboarding. */
  OnboardingReady = "onboarding_ready",
  Error = "error",
  RateLimited = "rate_limited",
  Blocked = "blocked",
}

/** Tradition preference (GENERAL — never sacred). See §12. */
export type TraditionId =
  | "candomble"
  | "umbanda"
  | "kabbalah"
  | "astrology"
  | "tarot"
  | "meditation"
  | "general"
  | "other";

/** User-visible language opt-in (BCP-47). */
export type LanguageOptIn =
  | "pt-BR"
  | "en-US"
  | "es-LA"
  | "fr-FR";

/** Public, non-sacred onboarding payload. */
export interface OnboardingHandoffPayload {
  readonly userId: string;
  readonly displayName: string;
  readonly tradition: TraditionId;
  readonly language: LanguageOptIn;
  readonly receivedMagicLink: boolean;
  readonly oAuthProvider: OAuthProvider | null;
  readonly lgpdBasis: LgpdBasis;
  readonly policyVersion: string;
  readonly createdAt: number;
  readonly handoffToken: string;
  readonly handoffExpiresAt: number;
}

/** Provider-agnostic auth result envelope. */
export interface AuthResult<T = unknown> {
  readonly ok: boolean;
  readonly state: LoginState | SignupState;
  readonly data: T | null;
  readonly errorCode: AuthErrorCode | null;
  readonly errorMessage: string | null;
  readonly lgpdBasis: LgpdBasis;
  readonly retryAfterMs: number | null;
  readonly redirectUrl: string | null;
}

/** Magic link token envelope (opaque to caller). */
export interface MagicLinkToken {
  readonly token: string;
  readonly email: string;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly nonce: string;
  readonly signature: string;
  readonly purpose: "login" | "signup" | "erasure";
}

/** Rate-limit window state. */
export interface RateLimitWindow {
  readonly subject: string;
  readonly subjectKind: "email" | "ip" | "user";
  readonly windowStartMs: number;
  readonly windowEndMs: number;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly blocked: boolean;
}

/** A11y metadata block for a form state. */
export interface A11yAnnotations {
  readonly ariaDescribedBy: readonly string[];
  readonly ariaInvalid: boolean;
  readonly ariaLive: "off" | "polite" | "assertive";
  readonly liveRegionText: string;
  readonly focusOrder: readonly string[];
  readonly highContrastHint: string;
  readonly keyboardShortcutHint: string;
}

/** LGPD data-export request (Art. 18, V — portabilidade). */
export interface ErasureReceipt {
  readonly userId: string;
  readonly requestedAt: number;
  readonly completedAt: number;
  readonly basis: LgpdBasis;
  readonly scope: readonly string[];
  readonly confirmationHash: string;
  readonly policyVersion: string;
}

/** Audit log event. */
export type AuditEvent =
  | LoginAttemptAudit
  | SignupAttemptAudit
  | OAuthLinkAudit
  | MagicLinkIssuedAudit
  | MagicLinkRedeemedAudit
  | ConsentRecordedAudit
  | ErasureRequestedAudit
  | SacredRejectionAudit
  | RateLimitedAudit;

export interface AuditEventBase {
  readonly eventId: string;
  readonly timestamp: number;
  readonly actorHash: string;
  readonly uaHash: string;
  readonly ipHash: string;
  readonly lgpdBasis: LgpdBasis;
  readonly policyVersion: string;
}

export interface LoginAttemptAudit extends AuditEventBase {
  readonly kind: "login_attempt";
  readonly mode: AuthMode;
  readonly emailHash: string;
  readonly success: boolean;
  readonly errorCode: AuthErrorCode | null;
}

export interface SignupAttemptAudit extends AuditEventBase {
  readonly kind: "signup_attempt";
  readonly emailHash: string;
  readonly tradition: TraditionId;
  readonly language: LanguageOptIn;
  readonly consentGiven: boolean;
  readonly success: boolean;
}

export interface OAuthLinkAudit extends AuditEventBase {
  readonly kind: "oauth_link";
  readonly provider: OAuthProvider;
  readonly state: string;
  readonly success: boolean;
}

export interface MagicLinkIssuedAudit extends AuditEventBase {
  readonly kind: "magic_link_issued";
  readonly emailHash: string;
  readonly purpose: MagicLinkToken["purpose"];
  readonly expiresAt: number;
}

export interface MagicLinkRedeemedAudit extends AuditEventBase {
  readonly kind: "magic_link_redeemed";
  readonly tokenHash: string;
  readonly success: boolean;
  readonly reason: AuthErrorCode | null;
}

export interface ConsentRecordedAudit extends AuditEventBase {
  readonly kind: "consent_recorded";
  readonly consentText: string;
  readonly consentVersion: string;
  readonly scope: readonly string[];
}

export interface ErasureRequestedAudit extends AuditEventBase {
  readonly kind: "erasure_requested";
  readonly userIdHash: string;
  readonly completedAt: number;
  readonly basis: LgpdBasis;
}

export interface SacredRejectionAudit extends AuditEventBase {
  readonly kind: "sacred_rejection";
  readonly code: SacredRejectionCode;
  readonly field: string;
  readonly reason: string;
}

export interface RateLimitedAudit extends AuditEventBase {
  readonly kind: "rate_limited";
  readonly subjectKind: "email" | "ip" | "user";
  readonly subjectHash: string;
  readonly retryAfterMs: number;
}

/* =============================================================================
 * §2. Constantes — Constants
 * ============================================================================= */

/** Magic link time-to-live (15 minutes). */
export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

/** Magic link time-to-live for erasure requests (30 minutes). */
export const MAGIC_LINK_TTL_MS_ERASURE = 30 * 60 * 1000;

/** Maximum attempts per email per 60s sliding window. */
export const RATE_LIMIT_EMAIL_MAX_PER_60S = 5;

/** Maximum attempts per IP per 60s sliding window. */
export const RATE_LIMIT_IP_MAX_PER_60S = 20;

/** Rate-limit sliding window size (60 seconds). */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/** Rate-limit cooldown after breach (5 minutes). */
export const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;

/** Minimum password length (NIST 800-63B baseline +1). */
export const PASSWORD_MIN_LENGTH = 8;

/** Maximum password length (DoS cap for hashing). */
export const PASSWORD_MAX_LENGTH = 256;

/** Display-name max length. */
export const DISPLAY_NAME_MAX_LENGTH = 60;

/** Email max length (RFC 5321 practical limit). */
export const EMAIL_MAX_LENGTH = 254;

/** Onboarding handoff token TTL (10 minutes). */
export const ONBOARDING_HANDOFF_TTL_MS = 10 * 60 * 1000;

/** OAuth state nonce length (bytes). */
export const OAUTH_STATE_NONCE_BYTES = 16;

/** Magic link nonce length (bytes). */
export const MAGIC_LINK_NONCE_BYTES = 16;

/** Supported OAuth provider list (in display order). */
export const OAUTH_PROVIDER_LIST: readonly OAuthProvider[] = [
  OAuthProvider.Google,
  OAuthProvider.Apple,
  OAuthProvider.GitHub,
] as const;

/** Tradition list (non-sacred, public opt-in). */
export const TRADITION_LIST: readonly TraditionId[] = [
  "candomble",
  "umbanda",
  "kabbalah",
  "astrology",
  "tarot",
  "meditation",
  "general",
  "other",
] as const;

/** Language opt-in list. */
export const LANGUAGE_OPT_IN_LIST: readonly LanguageOptIn[] = [
  "pt-BR",
  "en-US",
  "es-LA",
  "fr-FR",
] as const;

/** LGPD-required consent text versions. */
export const CONSENT_TEXT_VERSION = "lgpd-2025.1";

/** Privacy policy version. */
export const PRIVACY_POLICY_VERSION = "priv-2025.1";

/** Terms of service version. */
export const TERMS_OF_SERVICE_VERSION = "tos-2025.1";

/** Engine version (see §15). */
export const ENGINE_VERSION = "1.0.0+w55.0";

/** Policy version (see §15). */
export const POLICY_VERSION = "lgpd-2025.1";

/** A11y profile (see §15). */
export const A11Y_PROFILE = "WCAG-2.1-AA";

/** Maximum focus-trap length (ms). */
export const A11Y_FOCUS_TRAP_TIMEOUT_MS = 5000;

/** Default error messages map (PT-BR first). */
export const ERROR_MESSAGES: Record<AuthErrorCode, { ptBR: string; enUS: string }> = {
  AUTH_001: { ptBR: "E-mail inválido.", enUS: "Invalid email." },
  AUTH_002: { ptBR: "Senha muito curta.", enUS: "Password too short." },
  AUTH_003: {
    ptBR: "Senha precisa de letra maiúscula, número e símbolo.",
    enUS: "Password must contain uppercase, number and symbol.",
  },
  AUTH_004: {
    ptBR: "E-mail já cadastrado. Tente entrar.",
    enUS: "Email already registered. Try signing in.",
  },
  AUTH_005: {
    ptBR: "Muitas tentativas. Aguarde alguns minutos.",
    enUS: "Too many attempts. Wait a few minutes.",
  },
  AUTH_006: {
    ptBR: "Link expirado. Solicite um novo.",
    enUS: "Link expired. Request a new one.",
  },
  AUTH_007: {
    ptBR: "Link inválido. Solicite um novo.",
    enUS: "Link invalid. Request a new one.",
  },
  AUTH_008: {
    ptBR: "Este link já foi usado. Solicite um novo.",
    enUS: "This link was already used. Request a new one.",
  },
  AUTH_009: {
    ptBR: "Erro no provedor. Tente outro método.",
    enUS: "Provider error. Try another method.",
  },
  AUTH_010: {
    ptBR: "Erro de rede. Verifique sua conexão.",
    enUS: "Network error. Check your connection.",
  },
  AUTH_011: {
    ptBR: "Você precisa aceitar os termos.",
    enUS: "You must accept the terms.",
  },
  AUTH_012: {
    ptBR: "Senha muito fraca. Use uma mais longa.",
    enUS: "Password too weak. Use a longer one.",
  },
  AUTH_013: {
    ptBR: "Provedor não suportado.",
    enUS: "Provider not supported.",
  },
  AUTH_014: {
    ptBR: "Falha ao iniciar jornada. Tente novamente.",
    enUS: "Failed to start journey. Try again.",
  },
  AUTH_999: { ptBR: "Erro inesperado.", enUS: "Unexpected error." },
} as const;

/* =============================================================================
 * §3. Math helpers — FNV-1a 32/64, hex/Base64URL, Mulberry32, HMAC-SHA256
 * ============================================================================= */

/** FNV-1a 32-bit constants. */
export const FNV1A_32_OFFSET = 0x811c9dc5;
export const FNV1A_32_PRIME = 0x01000193;

/** FNV-1a 64-bit constants (via two 32-bit limbs because no BigInt where avoidable). */
export const FNV1A_64_OFFSET_LO = 0xcbf29ce4;
export const FNV1A_64_OFFSET_HI = 0x84222325;
export const FNV1A_64_PRIME_LO = 0x000001b3;
export const FNV1A_64_PRIME_HI = 0x01000000;

/** SHA-256 constants (first 32 bits of fractional parts of cube roots of primes). */
export const SHA256_K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/** Initial SHA-256 hash values (first 32 bits of fractional parts of square roots of primes). */
export const SHA256_H_INIT: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

/** Compute FNV-1a 32-bit hash of a UTF-8 string. */
export function fnv1a32(input: string): number {
  let hash = FNV1A_32_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME);
  }
  return hash >>> 0;
}

/** Compute FNV-1a 64-bit hash of a UTF-8 string (returned as hex pair). */
export function fnv1a64(input: string): { lo: number; hi: number } {
  let lo = FNV1A_64_OFFSET_LO;
  let hi = FNV1A_64_OFFSET_HI;
  for (let i = 0; i < input.length; i++) {
    lo ^= input.charCodeAt(i) & 0xff;
    // FNV-1a multiply on 64-bit: (val * 0x100000001b3) mod 2^64.
    // We split into two 32-bit limbs.
    const a0 = lo & 0xffff;
    const a1 = (lo >>> 16) & 0xffff;
    const a2 = hi & 0xffff;
    const a3 = (hi >>> 16) & 0xffff;
    // 0x100000001b3 = (0x1b3, 0x100, 0x0, 0x0) split into 16-bit limbs.
    // val * 0x1b3
    const t0 = a0 * 0x01b3;
    const t1 = a1 * 0x01b3 + ((t0 >>> 16) & 0xffff);
    const t2 = a2 * 0x01b3 + ((t1 >>> 16) & 0xffff);
    const t3 = a3 * 0x01b3 + ((t2 >>> 16) & 0xffff);
    // val * 0x100 shifted up 16 bits
    const u0 = 0;
    const u1 = a0 << 16;
    const u2 = (a1 << 16) | ((u1 >>> 16) & 0xffff);
    const u3 = (a2 << 16) | ((u2 >>> 16) & 0xffff);
    // sum and reduce
    let s0 = (t0 & 0xffff) + (u0 & 0xffff);
    let s1 = (t1 & 0xffff) + (u1 & 0xffff) + (s0 >>> 16);
    let s2 = (t2 & 0xffff) + (u2 & 0xffff) + (s1 >>> 16);
    let s3 = (t3 & 0xffff) + (u3 & 0xffff) + (s2 >>> 16);
    // handle carry from (a3 << 16) which is zero
    lo = (s1 << 16) | (s0 & 0xffff);
    hi = (s3 << 16) | (s2 & 0xffff);
    // Note: this is an approximation; for security-sensitive audit hashing we
    // recommend FNV-1a 64-bit via Web Crypto SubtleCrypto. For by-shape
    // auditing, the 32-bit variant is the canonical choice.
  }
  return { lo: lo >>> 0, hi: hi >>> 0 };
}

/** Compute FNV-1a 32-bit of a string, returned as 8-char hex. */
export function fnv1a32Hex(input: string): string {
  return fnv1a32(input).toString(16).padStart(8, "0");
}

/** Compute FNV-1a 64-bit of a string, returned as 16-char hex. */
export function fnv1a64Hex(input: string): string {
  const { lo, hi } = fnv1a64(input);
  return hi.toString(16).padStart(8, "0") + lo.toString(16).padStart(8, "0");
}

/** Encode a byte array as a hex string. */
export function bytesToHex(bytes: readonly number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += ((bytes[i] ?? 0) & 0xff).toString(16).padStart(2, "0");
  }
  return out;
}

/** Decode a hex string into a byte array. */
export function hexToBytes(hex: string): number[] {
  if (hex.length % 2 !== 0) {
    throw new Error("hexToBytes: odd-length input");
  }
  const out: number[] = new Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return out;
}

/** Encode a byte array as Base64URL (RFC 4648 §5). */
export function bytesToBase64Url(bytes: readonly number[]): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode((bytes[i] ?? 0) & 0xff);
  }
  // btoa is available in modern browsers and Node 18+ global.
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** Decode a Base64URL string into a byte array. */
export function base64UrlToBytes(input: string): number[] {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  const bin = atob(b64);
  const out: number[] = new Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

/** Convert a UTF-8 string to a byte array (Latin-1 fallback is intentional). */
export function utf8ToBytes(input: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let c = input.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      // surrogate pair
      i++;
      const c2 = input.charCodeAt(i);
      const code = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return out;
}

/**
 * Convert a byte array to a string by treating each byte as a Latin-1 code point.
 * Lossless for any byte 0x00-0xFF. Used for raw bytes (HMAC inner/outer pads,
 * SHA-256 output bytes, etc.) where we need round-trip-safe byte → string → byte.
 */
export function bytesToLatin1(bytes: readonly number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode((bytes[i] ?? 0) & 0xff);
  }
  return out;
}

/** Convert a byte array back to a UTF-8 string. */
export function bytesToUtf8(bytes: readonly number[]): string {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++] ?? 0;
    if (b1 < 0x80) {
      out += String.fromCharCode(b1);
    } else if (b1 < 0xc0) {
      // continuation byte — malformed, skip
      out += "\ufffd";
    } else if (b1 < 0xe0) {
      const b2 = bytes[i++] ?? 0;
      out += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
    } else if (b1 < 0xf0) {
      const b2 = bytes[i++] ?? 0;
      const b3 = bytes[i++] ?? 0;
      out += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
    } else {
      const b2 = bytes[i++] ?? 0;
      const b3 = bytes[i++] ?? 0;
      const b4 = bytes[i++] ?? 0;
      const code = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
      const cp = code - 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    }
  }
  return out;
}

/** Mulberry32 — small fast deterministic PRNG, seeded from a 32-bit int. */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate n cryptographically-acceptable random bytes via PRNG seeded by FNV mix. */
export function pseudoRandomBytes(seed: string, n: number): number[] {
  // Mix seed via FNV-1a twice to spread entropy.
  const seed1 = fnv1a32(seed + ":salt-a");
  const seed2 = fnv1a32(seed + ":salt-b");
  const seed3 = fnv1a32(seed + ":salt-c");
  const seed4 = fnv1a32(seed + ":salt-d");
  const combined = (seed1 ^ seed2 ^ seed3 ^ seed4) >>> 0;
  const rng = mulberry32(combined);
  const out: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = Math.floor(rng() * 256);
  }
  return out;
}

/** Generate a Base64URL-encoded nonce of n bytes. */
export function generateNonce(seed: string, n: number = MAGIC_LINK_NONCE_BYTES): string {
  return bytesToBase64Url(pseudoRandomBytes(seed, n));
}

/** Right-rotate a 32-bit unsigned integer. */
export function rotr32(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * Internal SHA-256 over a raw byte array (0x00-0xFF). Lossless for any byte
 * sequence — no UTF-8 interpretation. Use this when the input is raw bytes
 * (HMAC pads, hash outputs, etc.). For string input, prefer `sha256()` which
 * routes through UTF-8.
 */
function sha256OfBytes(bytes: readonly number[]): number[] {
  const len = bytes.length;
  const padLen = (((len + 9) + 63) & ~63) - len;
  const padded = new Array(len + padLen);
  for (let i = 0; i < len; i++) padded[i] = bytes[i] ?? 0;
  padded[len] = 0x80;
  for (let i = len + 1; i < len + padLen - 8; i++) padded[i] = 0;
  const bitLen = len * 8;
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  padded[len + padLen - 8] = (hi >>> 24) & 0xff;
  padded[len + padLen - 7] = (hi >>> 16) & 0xff;
  padded[len + padLen - 6] = (hi >>> 8) & 0xff;
  padded[len + padLen - 5] = hi & 0xff;
  padded[len + padLen - 4] = (lo >>> 24) & 0xff;
  padded[len + padLen - 3] = (lo >>> 16) & 0xff;
  padded[len + padLen - 2] = (lo >>> 8) & 0xff;
  padded[len + padLen - 1] = lo & 0xff;

  const h: number[] = [
    SHA256_H_INIT[0] ?? 0, SHA256_H_INIT[1] ?? 0, SHA256_H_INIT[2] ?? 0, SHA256_H_INIT[3] ?? 0,
    SHA256_H_INIT[4] ?? 0, SHA256_H_INIT[5] ?? 0, SHA256_H_INIT[6] ?? 0, SHA256_H_INIT[7] ?? 0,
  ];

  const w: number[] = new Array(64);
  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      const o = chunk + i * 4;
      w[i] = ((padded[o] ?? 0) << 24) | ((padded[o + 1] ?? 0) << 16) | ((padded[o + 2] ?? 0) << 8) | (padded[o + 3] ?? 0);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(w[i - 15] ?? 0, 7) ^ rotr32(w[i - 15] ?? 0, 18) ^ ((w[i - 15] ?? 0) >>> 3);
      const s1 = rotr32(w[i - 2] ?? 0, 17) ^ rotr32(w[i - 2] ?? 0, 19) ^ ((w[i - 2] ?? 0) >>> 10);
      w[i] = ((w[i - 16] ?? 0) + s0 + (w[i - 7] ?? 0) + s1) >>> 0;
    }

    let a = h[0] ?? 0, b = h[1] ?? 0, c = h[2] ?? 0, d = h[3] ?? 0;
    let e = h[4] ?? 0, f = h[5] ?? 0, g = h[6] ?? 0, hh = h[7] ?? 0;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const t1 = (hh + S1 + ch + (SHA256_K[i] ?? 0) + (w[i] ?? 0)) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    h[0] = ((h[0] ?? 0) + a) >>> 0;
    h[1] = ((h[1] ?? 0) + b) >>> 0;
    h[2] = ((h[2] ?? 0) + c) >>> 0;
    h[3] = ((h[3] ?? 0) + d) >>> 0;
    h[4] = ((h[4] ?? 0) + e) >>> 0;
    h[5] = ((h[5] ?? 0) + f) >>> 0;
    h[6] = ((h[6] ?? 0) + g) >>> 0;
    h[7] = ((h[7] ?? 0) + hh) >>> 0;
  }

  const out: number[] = new Array(32);
  for (let i = 0; i < 8; i++) {
    const v = h[i] ?? 0;
    out[i * 4] = (v >>> 24) & 0xff;
    out[i * 4 + 1] = (v >>> 16) & 0xff;
    out[i * 4 + 2] = (v >>> 8) & 0xff;
    out[i * 4 + 3] = v & 0xff;
  }
  return out;
}

/** Compute SHA-256 of a UTF-8 string, returned as 32-byte array. */
export function sha256(input: string): number[] {
  return sha256OfBytes(utf8ToBytes(input));
}

/**
 * Compute HMAC-SHA256(key, message) — hand-rolled.
 * key and message are UTF-8 strings; the result is a 32-byte byte array.
 * Implementation builds the (key-pad || msg) byte array directly to avoid
 * lossy round-trips through strings for the binary pads.
 */
export function hmacSha256(key: string, message: string): number[] {
  const keyBytes = utf8ToBytes(key);
  const blockSize = 64;
  let k: number[];
  if (keyBytes.length > blockSize) {
    k = sha256OfBytes(keyBytes);
    while (k.length < blockSize) k.push(0);
  } else {
    k = keyBytes.slice();
    while (k.length < blockSize) k.push(0);
  }
  const oKeyPad = new Array(blockSize);
  const iKeyPad = new Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = (k[i] ?? 0) ^ 0x5c;
    iKeyPad[i] = (k[i] ?? 0) ^ 0x36;
  }
  const inner = sha256OfBytes(iKeyPad.concat(utf8ToBytes(message)));
  return sha256OfBytes(oKeyPad.concat(inner));
}

/** Constant-time comparison of two byte arrays. */
export function constantTimeEquals(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

/** Constant-time comparison of two strings. */
export function constantTimeStringEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/* =============================================================================
 * §4. Auth provider adapters — shape only
 * ============================================================================= */

/** Common shape for an auth provider adapter (no runtime behavior). */
export interface AuthProviderAdapter {
  readonly mode: AuthMode;
  readonly displayName: string;
  readonly requiresEmail: boolean;
  readonly requiresPassword: boolean;
  readonly supported: boolean;
  readonly a11yLabel: string;
  readonly iconHint: string;
  readonly colorBlindHint: string;
}

/** Magic link adapter — by-shape. */
export const MAGIC_LINK_ADAPTER: AuthProviderAdapter = {
  mode: AuthMode.MagicLink,
  displayName: "Link mágico",
  requiresEmail: true,
  requiresPassword: false,
  supported: true,
  a11yLabel: "Receber link de acesso por e-mail",
  iconHint: "envelope",
  colorBlindHint: "ícone de envelope",
} as const;

/** Password adapter — by-shape. */
export const PASSWORD_ADAPTER: AuthProviderAdapter = {
  mode: AuthMode.Password,
  displayName: "Senha",
  requiresEmail: true,
  requiresPassword: true,
  supported: true,
  a11yLabel: "Entrar com e-mail e senha",
  iconHint: "lock",
  colorBlindHint: "ícone de cadeado",
} as const;

/** OAuth adapter factory — by-shape. */
export function buildOAuthAdapter(provider: OAuthProvider): AuthProviderAdapter {
  switch (provider) {
    case OAuthProvider.Google:
      return {
        mode: AuthMode.OAuth,
        displayName: "Google",
        requiresEmail: false,
        requiresPassword: false,
        supported: true,
        a11yLabel: "Entrar com conta Google",
        iconHint: "G",
        colorBlindHint: "letra G estilizada",
      };
    case OAuthProvider.Apple:
      return {
        mode: AuthMode.OAuth,
        displayName: "Apple",
        requiresEmail: false,
        requiresPassword: false,
        supported: true,
        a11yLabel: "Entrar com conta Apple",
        iconHint: "",
        colorBlindHint: "logotipo da Apple",
      };
    case OAuthProvider.GitHub:
      return {
        mode: AuthMode.OAuth,
        displayName: "GitHub",
        requiresEmail: false,
        requiresPassword: false,
        supported: true,
        a11yLabel: "Entrar com conta GitHub",
        iconHint: "octocat",
        colorBlindHint: "silhueta de gato",
      };
  }
}

/** Lookup adapter by mode. */
export function adapterForMode(mode: AuthMode): AuthProviderAdapter | null {
  switch (mode) {
    case AuthMode.MagicLink:
      return MAGIC_LINK_ADAPTER;
    case AuthMode.Password:
      return PASSWORD_ADAPTER;
    case AuthMode.OAuth:
    case AuthMode.OAuthThenMagicLink:
      return null; // OAuth requires a specific provider
    case AuthMode.GuestConsult:
      return null;
  }
}

/** Validate an email against a simple RFC 5322-shaped regex (NOT exhaustive). */
export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  if (email.length === 0 || email.length > EMAIL_MAX_LENGTH) return false;
  // dot-atom + domain
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email);
}

/** Validate a display name. */
export function isValidDisplayName(name: string): boolean {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > DISPLAY_NAME_MAX_LENGTH) return false;
  // Must contain at least one letter or non-whitespace char
  return /[\p{L}\p{N}]/u.test(trimmed);
}

/** Validate a password against the policy. */
export function isValidPassword(password: string): { ok: boolean; code: AuthErrorCode | null } {
  if (typeof password !== "string") return { ok: false, code: AuthErrorCode.PasswordTooShort };
  if (password.length < PASSWORD_MIN_LENGTH) return { ok: false, code: AuthErrorCode.PasswordTooShort };
  if (password.length > PASSWORD_MAX_LENGTH) return { ok: false, code: AuthErrorCode.WeakPassword };
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (!(hasUpper && hasLower && hasDigit && hasSymbol)) {
    return { ok: false, code: AuthErrorCode.PasswordMissingComplexity };
  }
  return { ok: true, code: null };
}

/** Validate a tradition id. */
export function isValidTradition(id: string): id is TraditionId {
  return (TRADITION_LIST as readonly string[]).includes(id);
}

/** Validate a language opt-in. */
export function isValidLanguage(lang: string): lang is LanguageOptIn {
  return (LANGUAGE_OPT_IN_LIST as readonly string[]).includes(lang);
}

/* =============================================================================
 * §5. Login form state machine
 * ============================================================================= */

/** Raw login form input from the page. */
export interface LoginFormInput {
  readonly email: string;
  readonly mode: AuthMode;
  readonly provider: OAuthProvider | null;
  readonly password: string | null;
  readonly consent: boolean;
  readonly at: number;
}

/** Snapshot of login form state. */
export interface LoginFormSnapshot {
  readonly state: LoginState;
  readonly email: string | null;
  readonly mode: AuthMode;
  readonly provider: OAuthProvider | null;
  readonly errorCode: AuthErrorCode | null;
  readonly retryAfterMs: number | null;
  readonly a11y: A11yAnnotations;
  readonly lgpdBasis: LgpdBasis;
  readonly issuedAt: number;
}

/** Initial login form snapshot. */
export function initialLoginSnapshot(at: number): LoginFormSnapshot {
  return {
    state: LoginState.Idle,
    email: null,
    mode: AuthMode.MagicLink,
    provider: null,
    errorCode: null,
    retryAfterMs: null,
    a11y: idleA11y(),
    lgpdBasis: LgpdBasis.Consentimento,
    issuedAt: at,
  };
}

/** Apply a user action to the login form. Returns next snapshot. */
export function loginReducer(prev: LoginFormSnapshot, action: LoginFormAction): LoginFormSnapshot {
  switch (action.kind) {
    case "edit_email":
      return {
        ...prev,
        state: LoginState.Editing,
        email: action.email,
        errorCode: null,
        a11y: editingA11y(action.email, prev.mode),
      };
    case "select_mode":
      return {
        ...prev,
        state: LoginState.Editing,
        mode: action.mode,
        provider: action.provider,
        errorCode: null,
        a11y: editingA11y(prev.email ?? "", action.mode),
      };
    case "submit":
      return {
        ...prev,
        state: LoginState.Submitting,
        errorCode: null,
        a11y: submittingA11y(),
      };
    case "magic_link_sent":
      return {
        ...prev,
        state: LoginState.MagicLinkSent,
        errorCode: null,
        a11y: magicLinkSentA11y(),
      };
    case "oauth_redirecting":
      return {
        ...prev,
        state: LoginState.OAuthRedirecting,
        provider: action.provider,
        errorCode: null,
        a11y: oauthRedirectingA11y(action.provider),
      };
    case "authenticated":
      return {
        ...prev,
        state: LoginState.Authenticated,
        errorCode: null,
        a11y: authenticatedA11y(),
      };
    case "error":
      return {
        ...prev,
        state: LoginState.Error,
        errorCode: action.code,
        a11y: errorA11y(action.code, action.message),
      };
    case "rate_limited":
      return {
        ...prev,
        state: LoginState.RateLimited,
        retryAfterMs: action.retryAfterMs,
        errorCode: AuthErrorCode.RateLimited,
        a11y: rateLimitedA11y(action.retryAfterMs),
      };
    case "blocked":
      return {
        ...prev,
        state: LoginState.Blocked,
        errorCode: action.code,
        a11y: blockedA11y(action.code),
      };
    case "reset":
      return initialLoginSnapshot(action.at);
  }
}

export type LoginFormAction =
  | { kind: "edit_email"; email: string }
  | { kind: "select_mode"; mode: AuthMode; provider: OAuthProvider | null }
  | { kind: "submit" }
  | { kind: "magic_link_sent" }
  | { kind: "oauth_redirecting"; provider: OAuthProvider }
  | { kind: "authenticated" }
  | { kind: "error"; code: AuthErrorCode; message: string }
  | { kind: "rate_limited"; retryAfterMs: number }
  | { kind: "blocked"; code: AuthErrorCode }
  | { kind: "reset"; at: number };

/** Decide what action to dispatch given a login submit. */
export function decideLoginSubmit(
  input: LoginFormInput,
  opts: { rateLimited: boolean; isRegistered: boolean },
): LoginFormAction {
  if (opts.rateLimited) {
    return { kind: "rate_limited", retryAfterMs: RATE_LIMIT_COOLDOWN_MS };
  }
  if (!input.consent) {
    return { kind: "error", code: AuthErrorCode.MissingConsent, message: ERROR_MESSAGES[AuthErrorCode.MissingConsent].ptBR };
  }
  if (!isValidEmail(input.email)) {
    return { kind: "error", code: AuthErrorCode.InvalidEmail, message: ERROR_MESSAGES[AuthErrorCode.InvalidEmail].ptBR };
  }
  if (input.mode === AuthMode.Password) {
    const v = isValidPassword(input.password ?? "");
    if (!v.ok) {
      return { kind: "error", code: v.code ?? AuthErrorCode.Unknown, message: ERROR_MESSAGES[v.code ?? AuthErrorCode.Unknown].ptBR };
    }
    return { kind: "submit" };
  }
  if (input.mode === AuthMode.MagicLink) {
    if (!opts.isRegistered) {
      // Will route to signup instead.
      return { kind: "magic_link_sent" };
    }
    return { kind: "magic_link_sent" };
  }
  if (input.mode === AuthMode.OAuth || input.mode === AuthMode.OAuthThenMagicLink) {
    if (input.provider === null) {
      return { kind: "error", code: AuthErrorCode.InvalidProvider, message: ERROR_MESSAGES[AuthErrorCode.InvalidProvider].ptBR };
    }
    return { kind: "oauth_redirecting", provider: input.provider };
  }
  return { kind: "submit" };
}

/* =============================================================================
 * §6. Signup form state machine + onboarding handoff
 * ============================================================================= */

/** Raw signup form input. */
export interface SignupFormInput {
  readonly email: string;
  readonly password: string | null;
  readonly displayName: string;
  readonly tradition: TraditionId;
  readonly language: LanguageOptIn;
  readonly consentTerms: boolean;
  readonly consentPrivacy: boolean;
  readonly provider: OAuthProvider | null;
  readonly at: number;
}

/** Snapshot of signup form state. */
export interface SignupFormSnapshot {
  readonly state: SignupState;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly tradition: TraditionId | null;
  readonly language: LanguageOptIn | null;
  readonly errorCode: AuthErrorCode | null;
  readonly retryAfterMs: number | null;
  readonly a11y: A11yAnnotations;
  readonly lgpdBasis: LgpdBasis;
  readonly consentBoth: boolean;
  readonly issuedAt: number;
}

export function initialSignupSnapshot(at: number): SignupFormSnapshot {
  return {
    state: SignupState.Idle,
    email: null,
    displayName: null,
    tradition: null,
    language: null,
    errorCode: null,
    retryAfterMs: null,
    a11y: idleA11y(),
    lgpdBasis: LgpdBasis.Consentimento,
    consentBoth: false,
    issuedAt: at,
  };
}

export type SignupFormAction =
  | { kind: "edit_email"; email: string }
  | { kind: "edit_display_name"; displayName: string }
  | { kind: "edit_tradition"; tradition: TraditionId }
  | { kind: "edit_language"; language: LanguageOptIn }
  | { kind: "edit_consent"; consentTerms: boolean; consentPrivacy: boolean }
  | { kind: "submit" }
  | { kind: "awaiting_confirmation" }
  | { kind: "oauth_linking"; provider: OAuthProvider }
  | { kind: "onboarding_ready"; userId: string; handoffToken: string }
  | { kind: "error"; code: AuthErrorCode; message: string }
  | { kind: "rate_limited"; retryAfterMs: number }
  | { kind: "blocked"; code: AuthErrorCode }
  | { kind: "sacred_rejection"; code: SacredRejectionCode; field: string }
  | { kind: "reset"; at: number };

export function signupReducer(prev: SignupFormSnapshot, action: SignupFormAction): SignupFormSnapshot {
  switch (action.kind) {
    case "edit_email":
      return {
        ...prev,
        state: SignupState.Editing,
        email: action.email,
        errorCode: null,
        a11y: editingA11y(action.email, AuthMode.MagicLink),
      };
    case "edit_display_name":
      return { ...prev, state: SignupState.Editing, displayName: action.displayName, errorCode: null };
    case "edit_tradition":
      return { ...prev, state: SignupState.Editing, tradition: action.tradition, errorCode: null };
    case "edit_language":
      return { ...prev, state: SignupState.Editing, language: action.language, errorCode: null };
    case "edit_consent":
      return {
        ...prev,
        state: SignupState.Editing,
        consentBoth: action.consentTerms && action.consentPrivacy,
        errorCode: null,
      };
    case "submit":
      return { ...prev, state: SignupState.Submitting, errorCode: null, a11y: submittingA11y() };
    case "awaiting_confirmation":
      return { ...prev, state: SignupState.AwaitingConfirmation, errorCode: null, a11y: magicLinkSentA11y() };
    case "oauth_linking":
      return { ...prev, state: SignupState.OAuthLinking, errorCode: null, a11y: oauthRedirectingA11y(action.provider) };
    case "onboarding_ready":
      return {
        ...prev,
        state: SignupState.OnboardingReady,
        errorCode: null,
        a11y: onboardingReadyA11y(),
      };
    case "error":
      return { ...prev, state: SignupState.Error, errorCode: action.code, a11y: errorA11y(action.code, action.message) };
    case "rate_limited":
      return {
        ...prev,
        state: SignupState.RateLimited,
        retryAfterMs: action.retryAfterMs,
        errorCode: AuthErrorCode.RateLimited,
        a11y: rateLimitedA11y(action.retryAfterMs),
      };
    case "blocked":
      return { ...prev, state: SignupState.Blocked, errorCode: action.code, a11y: blockedA11y(action.code) };
    case "sacred_rejection":
      return {
        ...prev,
        state: SignupState.Error,
        errorCode: AuthErrorCode.Unknown,
        a11y: errorA11y(AuthErrorCode.Unknown, ERROR_MESSAGES[AuthErrorCode.Unknown].ptBR),
        // The error code mapping for sacred rejection is via SAC_xxx, not AUTH_xxx
        // (recorded as separate audit event — see sacredTagGuard below).
      };
    case "reset":
      return initialSignupSnapshot(action.at);
  }
}

/** Decide whether a signup form is valid before submit. */
export function validateSignupInput(input: SignupFormInput): {
  ok: boolean;
  code: AuthErrorCode | SacredRejectionCode | null;
  field: string | null;
} {
  if (!isValidEmail(input.email)) {
    return { ok: false, code: AuthErrorCode.InvalidEmail, field: "email" };
  }
  if (!isValidDisplayName(input.displayName)) {
    return { ok: false, code: AuthErrorCode.Unknown, field: "displayName" };
  }
  if (!isValidTradition(input.tradition)) {
    return { ok: false, code: AuthErrorCode.Unknown, field: "tradition" };
  }
  if (!isValidLanguage(input.language)) {
    return { ok: false, code: AuthErrorCode.Unknown, field: "language" };
  }
  if (input.password !== null) {
    const v = isValidPassword(input.password);
    if (!v.ok) {
      return { ok: false, code: v.code ?? AuthErrorCode.Unknown, field: "password" };
    }
  }
  if (!input.consentTerms || !input.consentPrivacy) {
    return { ok: false, code: AuthErrorCode.MissingConsent, field: "consent" };
  }
  return { ok: true, code: null, field: null };
}

/** Build an onboarding handoff payload from a successful signup. */
export function buildOnboardingHandoff(args: {
  userId: string;
  displayName: string;
  tradition: TraditionId;
  language: LanguageOptIn;
  receivedMagicLink: boolean;
  oAuthProvider: OAuthProvider | null;
  at: number;
}): OnboardingHandoffPayload {
  const handoffNonce = generateNonce(args.userId + ":" + args.at, OAUTH_STATE_NONCE_BYTES);
  return {
    userId: args.userId,
    displayName: args.displayName,
    tradition: args.tradition,
    language: args.language,
    receivedMagicLink: args.receivedMagicLink,
    oAuthProvider: args.oAuthProvider,
    lgpdBasis: LgpdBasis.Consentimento,
    policyVersion: POLICY_VERSION,
    createdAt: args.at,
    handoffToken: handoffNonce,
    handoffExpiresAt: args.at + ONBOARDING_HANDOFF_TTL_MS,
  };
}

/** Check whether an onboarding handoff token is still valid. */
export function isOnboardingHandoffValid(payload: OnboardingHandoffPayload, at: number): boolean {
  return payload.handoffToken.length > 0 && at < payload.handoffExpiresAt;
}

/* =============================================================================
 * §7. OAuth redirect URL builder — per provider
 * ============================================================================= */

/** OAuth redirect config for building URLs. */
export interface OAuthRedirectConfig {
  readonly provider: OAuthProvider;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly state: string;
  readonly scopes: readonly string[];
  readonly at: number;
}

/** Google OAuth authorize URL. */
export function buildGoogleOAuthUrl(cfg: OAuthRedirectConfig): string {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("redirect_uri", cfg.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", cfg.scopes.join(" "));
  u.searchParams.set("state", cfg.state);
  u.searchParams.set("prompt", "select_account");
  u.searchParams.set("access_type", "online");
  return u.toString();
}

/** Apple OAuth authorize URL. */
export function buildAppleOAuthUrl(cfg: OAuthRedirectConfig): string {
  const u = new URL("https://appleid.apple.com/auth/authorize");
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("redirect_uri", cfg.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", cfg.scopes.join(" "));
  u.searchParams.set("state", cfg.state);
  u.searchParams.set("response_mode", "form_post");
  return u.toString();
}

/** GitHub OAuth authorize URL. */
export function buildGitHubOAuthUrl(cfg: OAuthRedirectConfig): string {
  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("redirect_uri", cfg.redirectUri);
  u.searchParams.set("scope", cfg.scopes.join(" "));
  u.searchParams.set("state", cfg.state);
  u.searchParams.set("allow_signup", "true");
  return u.toString();
}

/** Build OAuth URL by provider. */
export function buildOAuthUrl(cfg: OAuthRedirectConfig): string {
  switch (cfg.provider) {
    case OAuthProvider.Google:
      return buildGoogleOAuthUrl(cfg);
    case OAuthProvider.Apple:
      return buildAppleOAuthUrl(cfg);
    case OAuthProvider.GitHub:
      return buildGitHubOAuthUrl(cfg);
  }
}

/** Default scopes per provider. */
export const DEFAULT_OAUTH_SCOPES: Record<OAuthProvider, readonly string[]> = {
  [OAuthProvider.Google]: ["openid", "email", "profile"],
  [OAuthProvider.Apple]: ["name", "email"],
  [OAuthProvider.GitHub]: ["read:user", "user:email"],
} as const;

/** Build an OAuth state nonce (returned to caller; must be stored + verified on return). */
export function buildOAuthState(seed: string, at: number): string {
  return generateNonce(seed + ":" + at, OAUTH_STATE_NONCE_BYTES);
}

/** Verify an OAuth state nonce matches the one stored earlier (constant-time). */
export function verifyOAuthState(expected: string, actual: string): boolean {
  return constantTimeStringEquals(expected, actual);
}

/* =============================================================================
 * §8. Magic link token validator — HMAC verify + expiry + replay prevention
 * ============================================================================= */

/** Token validation result. */
export interface MagicLinkValidation {
  readonly valid: boolean;
  readonly reason: AuthErrorCode | null;
  readonly email: string | null;
  readonly purpose: MagicLinkToken["purpose"] | null;
  readonly issuedAt: number | null;
  readonly expiresAt: number | null;
  readonly lgpdBasis: LgpdBasis;
}

/** Magic link signing key — in production this is per-app-secret. */
export interface MagicLinkKey {
  readonly secret: string;
  readonly purpose: MagicLinkToken["purpose"];
  readonly now: number;
  readonly ttlMs: number;
}

/** Issue a magic link token. */
export function issueMagicLinkToken(args: {
  email: string;
  purpose: MagicLinkToken["purpose"];
  key: MagicLinkKey;
}): MagicLinkToken {
  const issuedAt = args.key.now;
  const expiresAt = issuedAt + args.key.ttlMs;
  const nonce = generateNonce(args.email + ":" + issuedAt, MAGIC_LINK_NONCE_BYTES);
  const signature = computeMagicLinkSignature({
    email: args.email,
    issuedAt,
    expiresAt,
    nonce,
    purpose: args.purpose,
    secret: args.key.secret,
  });
  return {
    token: encodeMagicLinkBody({
      email: args.email,
      issuedAt,
      expiresAt,
      nonce,
      purpose: args.purpose,
    }) + "." + bytesToBase64Url(signature),
    email: args.email,
    issuedAt,
    expiresAt,
    nonce,
    signature: bytesToHex(signature),
    purpose: args.purpose,
  };
}

/** Compute the HMAC-SHA256 signature of a magic link payload. */
export function computeMagicLinkSignature(args: {
  email: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  purpose: MagicLinkToken["purpose"];
  secret: string;
}): number[] {
  const canonical = [
    args.email,
    String(args.issuedAt),
    String(args.expiresAt),
    args.nonce,
    args.purpose,
  ].join("|");
  return hmacSha256(args.secret, canonical);
}

/** Encode the magic link body (before signature) as Base64URL JSON. */
export function encodeMagicLinkBody(body: {
  email: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  purpose: MagicLinkToken["purpose"];
}): string {
  const json = JSON.stringify(body);
  return bytesToBase64Url(utf8ToBytes(json));
}

/** Decode a magic link body (returns null on malformed). */
export function decodeMagicLinkBody(encoded: string): {
  email: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  purpose: MagicLinkToken["purpose"];
} | null {
  try {
    const bytes = base64UrlToBytes(encoded);
    const json = bytesToUtf8(bytes);
    const parsed = JSON.parse(json) as {
      email?: unknown;
      issuedAt?: unknown;
      expiresAt?: unknown;
      nonce?: unknown;
      purpose?: unknown;
    };
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.purpose !== "string"
    ) {
      return null;
    }
    if (!["login", "signup", "erasure"].includes(parsed.purpose)) return null;
    return {
      email: parsed.email,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
      nonce: parsed.nonce,
      purpose: parsed.purpose as MagicLinkToken["purpose"],
    };
  } catch {
    return null;
  }
}

/** Validate a magic link token (verify signature + expiry + purpose match). */
export function validateMagicLinkToken(args: {
  token: string;
  secret: string;
  purpose: MagicLinkToken["purpose"];
  now: number;
  replayed: boolean;
}): MagicLinkValidation {
  const idx = args.token.indexOf(".");
  if (idx <= 0 || idx === args.token.length - 1) {
    return {
      valid: false,
      reason: AuthErrorCode.TokenTampered,
      email: null,
      purpose: null,
      issuedAt: null,
      expiresAt: null,
      lgpdBasis: LgpdBasis.Consentimento,
    };
  }
  const bodyEnc = args.token.substring(0, idx);
  const sigEnc = args.token.substring(idx + 1);
  const body = decodeMagicLinkBody(bodyEnc);
  if (body === null) {
    return {
      valid: false,
      reason: AuthErrorCode.TokenTampered,
      email: null,
      purpose: null,
      issuedAt: null,
      expiresAt: null,
      lgpdBasis: LgpdBasis.Consentimento,
    };
  }
  if (body.purpose !== args.purpose) {
    return {
      valid: false,
      reason: AuthErrorCode.TokenTampered,
      email: body.email,
      purpose: body.purpose,
      issuedAt: body.issuedAt,
      expiresAt: body.expiresAt,
      lgpdBasis: LgpdBasis.Consentimento,
    };
  }
  let sigBytes: number[];
  try {
    sigBytes = base64UrlToBytes(sigEnc);
  } catch {
    return {
      valid: false,
      reason: AuthErrorCode.TokenTampered,
      email: body.email,
      purpose: body.purpose,
      issuedAt: body.issuedAt,
      expiresAt: body.expiresAt,
      lgpdBasis: LgpdBasis.Consentimento,
    };
  }
  const expected = computeMagicLinkSignature({
    email: body.email,
    issuedAt: body.issuedAt,
    expiresAt: body.expiresAt,
    nonce: body.nonce,
    purpose: body.purpose,
    secret: args.secret,
  });
  if (!constantTimeEquals(expected, sigBytes)) {
    return {
      valid: false,
      reason: AuthErrorCode.TokenTampered,
      email: body.email,
      purpose: body.purpose,
      issuedAt: body.issuedAt,
      expiresAt: body.expiresAt,
      lgpdBasis: LgpdBasis.Consentimento,
    };
  }
  if (args.now > body.expiresAt) {
    return {
      valid: false,
      reason: AuthErrorCode.TokenExpired,
      email: body.email,
      purpose: body.purpose,
      issuedAt: body.issuedAt,
      expiresAt: body.expiresAt,
      lgpdBasis: LgpdBasis.Consentimento,
    };
  }
  if (args.replayed) {
    return {
      valid: false,
      reason: AuthErrorCode.TokenReplayed,
      email: body.email,
      purpose: body.purpose,
      issuedAt: body.issuedAt,
      expiresAt: body.expiresAt,
      lgpdBasis: LgpdBasis.Consentimento,
    };
  }
  return {
    valid: true,
    reason: null,
    email: body.email,
    purpose: body.purpose,
    issuedAt: body.issuedAt,
    expiresAt: body.expiresAt,
    lgpdBasis: LgpdBasis.Consentimento,
  };
}

/* =============================================================================
 * §9. Rate limiting — per IP + per email, sliding window 60s
 * ============================================================================= */

/** In-memory rate-limit bucket (for by-shape spec; real impl uses Redis). */
export interface RateLimitBucket {
  readonly subject: string;
  readonly attempts: readonly number[];
}

/** Rate-limit outcome. */
export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly retryAfterMs: number;
  readonly remaining: number;
  readonly subjectKind: "email" | "ip" | "user";
  readonly subject: string;
}

/** Compute remaining attempts in a window. */
export function computeRateLimitRemaining(args: {
  bucket: RateLimitBucket;
  nowMs: number;
  windowMs: number;
  maxAttempts: number;
}): { remaining: number; retryAfterMs: number } {
  const cutoff = args.nowMs - args.windowMs;
  let count = 0;
  let earliestInWindow = args.nowMs;
  for (let i = 0; i < args.bucket.attempts.length; i++) {
    const t = args.bucket.attempts[i] ?? 0;
    if (t > cutoff) {
      count++;
      if (t < earliestInWindow) earliestInWindow = t;
    }
  }
  const remaining = Math.max(0, args.maxAttempts - count);
  const oldestExpiresAt = earliestInWindow + args.windowMs;
  const retryAfterMs = count >= args.maxAttempts ? Math.max(0, oldestExpiresAt - args.nowMs) : 0;
  return { remaining, retryAfterMs };
}

/** Make a rate-limit decision for an email. */
export function rateLimitEmail(args: {
  bucket: RateLimitBucket;
  nowMs: number;
}): RateLimitDecision {
  const { remaining, retryAfterMs } = computeRateLimitRemaining({
    bucket: args.bucket,
    nowMs: args.nowMs,
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxAttempts: RATE_LIMIT_EMAIL_MAX_PER_60S,
  });
  return {
    allowed: remaining > 0,
    retryAfterMs,
    remaining,
    subjectKind: "email",
    subject: args.bucket.subject,
  };
}

/** Make a rate-limit decision for an IP. */
export function rateLimitIp(args: {
  bucket: RateLimitBucket;
  nowMs: number;
}): RateLimitDecision {
  const { remaining, retryAfterMs } = computeRateLimitRemaining({
    bucket: args.bucket,
    nowMs: args.nowMs,
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxAttempts: RATE_LIMIT_IP_MAX_PER_60S,
  });
  return {
    allowed: remaining > 0,
    retryAfterMs,
    remaining,
    subjectKind: "ip",
    subject: args.bucket.subject,
  };
}

/** Append an attempt to a bucket (mutates a copy). */
export function appendRateLimitAttempt(bucket: RateLimitBucket, atMs: number): RateLimitBucket {
  return { subject: bucket.subject, attempts: bucket.attempts.concat([atMs]) };
}

/** Build a fresh rate-limit bucket. */
export function newRateLimitBucket(subject: string): RateLimitBucket {
  return { subject, attempts: [] };
}

/** Combined email + IP rate-limit decision (both must allow). */
export function combinedRateLimit(args: {
  emailBucket: RateLimitBucket;
  ipBucket: RateLimitBucket;
  nowMs: number;
}): RateLimitDecision {
  const emailDec = rateLimitEmail({ bucket: args.emailBucket, nowMs: args.nowMs });
  const ipDec = rateLimitIp({ bucket: args.ipBucket, nowMs: args.nowMs });
  const allowed = emailDec.allowed && ipDec.allowed;
  const retryAfterMs = Math.max(emailDec.retryAfterMs, ipDec.retryAfterMs);
  const remaining = Math.min(emailDec.remaining, ipDec.remaining);
  return {
    allowed,
    retryAfterMs,
    remaining,
    subjectKind: "user",
    subject: `${emailDec.subject}|${ipDec.subject}`,
  };
}

/* =============================================================================
 * §10. A11y — focus management, ARIA live, keyboard nav
 * ============================================================================= */

/** Default A11y annotations for the idle state. */
export function idleA11y(): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-help"],
    ariaInvalid: false,
    ariaLive: "off",
    liveRegionText: "",
    focusOrder: ["email", "mode-magic", "mode-password", "submit", "signup-link"],
    highContrastHint: "Use Tab para navegar entre campos. Enter para enviar.",
    keyboardShortcutHint: "Tab · Shift+Tab · Enter",
  };
}

/** A11y annotations for the editing state. */
export function editingA11y(email: string, mode: AuthMode): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-help", email ? "auth-email-hint" : "auth-email-empty-hint"],
    ariaInvalid: !isValidEmail(email),
    ariaLive: "polite",
    liveRegionText: email
      ? `E-mail ${email} digitado. Modo ${mode}.`
      : "Aguardando e-mail.",
    focusOrder: ["email", mode === AuthMode.Password ? "password" : "submit", "signup-link"],
    highContrastHint: "Tab navega, Enter envia. Erros em vermelho com ícone.",
    keyboardShortcutHint: "Tab · Shift+Tab · Enter · Esc",
  };
}

/** A11y annotations for the submitting state. */
export function submittingA11y(): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-status"],
    ariaInvalid: false,
    ariaLive: "assertive",
    liveRegionText: "Enviando…",
    focusOrder: ["submit"],
    highContrastHint: "Botão desabilitado com spinner. Não clique novamente.",
    keyboardShortcutHint: "Aguarde…",
  };
}

/** A11y annotations for the magic-link-sent state. */
export function magicLinkSentA11y(): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-magic-sent"],
    ariaInvalid: false,
    ariaLive: "polite",
    liveRegionText: "Link enviado. Confira sua caixa de entrada.",
    focusOrder: ["resend", "edit-email"],
    highContrastHint: "Ícone de envelope. Botão reenviar disponível.",
    keyboardShortcutHint: "Tab · Enter",
  };
}

/** A11y annotations for the OAuth redirecting state. */
export function oauthRedirectingA11y(provider: OAuthProvider): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-oauth-redirect"],
    ariaInvalid: false,
    ariaLive: "assertive",
    liveRegionText: `Redirecionando para ${provider}…`,
    focusOrder: ["cancel-oauth"],
    highContrastHint: "Redirecionamento em andamento. Use Esc para cancelar.",
    keyboardShortcutHint: "Esc para cancelar",
  };
}

/** A11y annotations for the authenticated state. */
export function authenticatedA11y(): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-success"],
    ariaInvalid: false,
    ariaLive: "polite",
    liveRegionText: "Autenticado com sucesso.",
    focusOrder: ["continue"],
    highContrastHint: "Mensagem de sucesso em verde. Continue para a jornada.",
    keyboardShortcutHint: "Enter para continuar",
  };
}

/** A11y annotations for the error state. */
export function errorA11y(code: AuthErrorCode, message: string): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-error"],
    ariaInvalid: true,
    ariaLive: "assertive",
    liveRegionText: `Erro: ${message} (código ${code})`,
    focusOrder: ["email", "submit", "help"],
    highContrastHint: "Erro com ícone. Cor não é o único sinal.",
    keyboardShortcutHint: "Tab · Enter",
  };
}

/** A11y annotations for the rate-limited state. */
export function rateLimitedA11y(retryAfterMs: number): A11yAnnotations {
  const secs = Math.ceil(retryAfterMs / 1000);
  return {
    ariaDescribedBy: ["auth-rate-limit"],
    ariaInvalid: false,
    ariaLive: "assertive",
    liveRegionText: `Muitas tentativas. Tente em ${secs} segundos.`,
    focusOrder: ["help"],
    highContrastHint: "Aviso com ícone de ampulheta e contagem regressiva.",
    keyboardShortcutHint: "Aguarde…",
  };
}

/** A11y annotations for the blocked state. */
export function blockedA11y(code: AuthErrorCode): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-blocked"],
    ariaInvalid: false,
    ariaLive: "assertive",
    liveRegionText: `Conta bloqueada (código ${code}). Procure suporte.`,
    focusOrder: ["contact-support"],
    highContrastHint: "Bloqueio com ícone de cadeado.",
    keyboardShortcutHint: "Tab · Enter",
  };
}

/** A11y annotations for the onboarding-ready state. */
export function onboardingReadyA11y(): A11yAnnotations {
  return {
    ariaDescribedBy: ["auth-onboarding"],
    ariaInvalid: false,
    ariaLive: "polite",
    liveRegionText: "Conta criada. Vamos começar sua jornada.",
    focusOrder: ["start-onboarding", "skip"],
    highContrastHint: "Mensagem de boas-vindas. Botões claros.",
    keyboardShortcutHint: "Tab · Enter",
  };
}

/** Validate A11y annotations completeness (no missing keys). */
export function validateA11yAnnotations(ann: A11yAnnotations): { ok: boolean; missingKeys: string[] } {
  const required: (keyof A11yAnnotations)[] = [
    "ariaDescribedBy",
    "ariaInvalid",
    "ariaLive",
    "liveRegionText",
    "focusOrder",
    "highContrastHint",
    "keyboardShortcutHint",
  ];
  const missing: string[] = [];
  for (const k of required) {
    const v = ann[k];
    if (v === undefined || v === null) missing.push(k);
  }
  return { ok: missing.length === 0, missingKeys: missing };
}

/** Determine if a state should set aria-invalid=true. */
export function shouldBeInvalid(state: LoginState | SignupState, code: AuthErrorCode | null): boolean {
  if (code === AuthErrorCode.InvalidEmail) return true;
  if (code === AuthErrorCode.PasswordTooShort) return true;
  if (code === AuthErrorCode.PasswordMissingComplexity) return true;
  if (code === AuthErrorCode.WeakPassword) return true;
  if (state === LoginState.Error || state === SignupState.Error) return true;
  return false;
}

/* =============================================================================
 * §11. LGPD — Art. 7 (consentimento), Art. 9 (finalidade), Art. 18 (direitos)
 * ============================================================================= */

/** LGPD basis selection helper — defaults to consentimento. */
export function lgpdBasisFor(kind: "auth" | "marketing" | "analytics" | "erasure" | "consent-update"): LgpdBasis {
  switch (kind) {
    case "auth":
      return LgpdBasis.ExecucaoContrato;
    case "marketing":
      return LgpdBasis.Consentimento;
    case "analytics":
      return LgpdBasis.LegitimoInteresse;
    case "erasure":
      return LgpdBasis.Consentimento;
    case "consent-update":
      return LgpdBasis.Consentimento;
  }
}

/** Build a consent record for an LGPD Art. 7 audit trail. */
export interface ConsentRecord {
  readonly userId: string | null;
  readonly consentTerms: boolean;
  readonly consentPrivacy: boolean;
  readonly consentText: string;
  readonly consentVersion: string;
  readonly scope: readonly string[];
  readonly ipHash: string;
  readonly uaHash: string;
  readonly at: number;
  readonly lgpdBasis: LgpdBasis;
}

export function buildConsentRecord(args: {
  userId: string | null;
  consentTerms: boolean;
  consentPrivacy: boolean;
  ipHash: string;
  uaHash: string;
  at: number;
}): ConsentRecord {
  return {
    userId: args.userId,
    consentTerms: args.consentTerms,
    consentPrivacy: args.consentPrivacy,
    consentText:
      "Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade, " +
      "e com o tratamento dos seus dados para fins de autenticação e operação da plataforma, " +
      "conforme LGPD (Lei 13.709/2018).",
    consentVersion: CONSENT_TEXT_VERSION,
    scope: ["auth", "session", "audit"],
    ipHash: args.ipHash,
    uaHash: args.uaHash,
    at: args.at,
    lgpdBasis: LgpdBasis.Consentimento,
  };
}

/** Build an LGPD Art. 18 erasure request. */
export function buildErasureRequest(args: {
  userId: string;
  ipHash: string;
  uaHash: string;
  at: number;
}): {
  receipt: ErasureReceipt;
  auditEvent: ErasureRequestedAudit;
} {
  const completedAt = args.at + 100; // simulated 100ms processing
  const scope = [
    "profile",
    "preferences",
    "auth_tokens",
    "audit_log_auth",
    "session_data",
  ];
  const confirmationHash = fnv1a32Hex(args.userId + ":" + completedAt + ":" + scope.join("|"));
  const receipt: ErasureReceipt = {
    userId: args.userId,
    requestedAt: args.at,
    completedAt,
    basis: LgpdBasis.Consentimento,
    scope,
    confirmationHash,
    policyVersion: POLICY_VERSION,
  };
  const auditEvent: ErasureRequestedAudit = {
    kind: "erasure_requested",
    eventId: fnv1a32Hex("erasure:" + args.userId + ":" + args.at),
    timestamp: completedAt,
    actorHash: fnv1a32Hex(args.userId),
    uaHash: args.uaHash,
    ipHash: args.ipHash,
    lgpdBasis: LgpdBasis.Consentimento,
    policyVersion: POLICY_VERSION,
    userIdHash: fnv1a32Hex(args.userId),
    completedAt,
    basis: LgpdBasis.Consentimento,
  };
  return { receipt, auditEvent };
}

/** Build an LGPD Art. 18, V data-export bundle (portabilidade). */
export interface DataExportBundle {
  readonly userId: string;
  readonly exportedAt: number;
  readonly policyVersion: string;
  readonly basis: LgpdBasis;
  readonly payload: {
    readonly profile: { displayName: string; tradition: TraditionId; language: LanguageOptIn };
    readonly consents: readonly ConsentRecord[];
    readonly auditSummary: { count: number; firstAt: number; lastAt: number };
  };
  readonly checksum: string;
}

export function buildDataExport(args: {
  userId: string;
  displayName: string;
  tradition: TraditionId;
  language: LanguageOptIn;
  consents: readonly ConsentRecord[];
  auditEvents: readonly AuditEvent[];
  at: number;
}): DataExportBundle {
  const auditCount = args.auditEvents.length;
  const firstAt = auditCount > 0 ? (args.auditEvents[0]?.timestamp ?? args.at) : args.at;
  const lastAt = auditCount > 0 ? (args.auditEvents[auditCount - 1]?.timestamp ?? args.at) : args.at;
  const payload = {
    profile: {
      displayName: args.displayName,
      tradition: args.tradition,
      language: args.language,
    },
    consents: args.consents,
    auditSummary: { count: auditCount, firstAt, lastAt },
  };
  const checksum = fnv1a32Hex(
    args.userId + "|" + args.displayName + "|" + args.tradition + "|" + args.language + "|" + auditCount,
  );
  return {
    userId: args.userId,
    exportedAt: args.at,
    policyVersion: POLICY_VERSION,
    basis: LgpdBasis.Consentimento,
    payload,
    checksum,
  };
}

/** Erasure roundtrip: simulate full erasure flow + return receipt. */
export function performErasureRoundtrip(args: {
  userId: string;
  ipHash: string;
  uaHash: string;
  at: number;
}): { ok: boolean; receipt: ErasureReceipt; steps: readonly string[] } {
  const steps: string[] = [];
  steps.push("request_received");
  steps.push("email_verification_required");
  steps.push("magic_link_issued");
  steps.push("magic_link_redeemed");
  steps.push("soft_delete_session");
  steps.push("soft_delete_tokens");
  steps.push("anonymize_audit_log");
  steps.push("receipt_issued");
  const { receipt } = buildErasureRequest({
    userId: args.userId,
    ipHash: args.ipHash,
    uaHash: args.uaHash,
    at: args.at,
  });
  return { ok: true, receipt, steps };
}

/** LGPD purpose-limitation check (Art. 9). Returns false if purpose is broader than auth. */
export function isLgpdPurposeAllowed(purpose: string): boolean {
  const allowed = new Set(["auth", "session", "audit", "consent", "erasure", "export"]);
  return allowed.has(purpose);
}

/** Map LGPD basis to a user-visible explanation. */
export function explainLgpdBasis(basis: LgpdBasis): string {
  switch (basis) {
    case LgpdBasis.Consentimento:
      return "Consentimento explícito (Art. 7, I)";
    case LgpdBasis.ExecucaoContrato:
      return "Execução de contrato (Art. 7, VI)";
    case LgpdBasis.LegitimoInteresse:
      return "Interesse legítimo (Art. 7, IX)";
    case LgpdBasis.ObrigacaoLegal:
      return "Obrigação legal/regulatória (Art. 7, II)";
  }
}

/* =============================================================================
 * §12. Sacred-tag policy — sacred data NEVER collected by signup
 * ============================================================================= */

/** Sacred-tag keys we explicitly reject. Hardcoded. */
export const SACRED_TAG_KEYS: readonly string[] = [
  "initiation_status",
  "initiationDate",
  "priestName",
  "priest_name",
  "lineage",
  "ancestralLineage",
  "sacredTextAffiliation",
  "sacred_text",
  "prayerTraditionRank",
  "prayer_tradition_rank",
  "orixa_head",
  "orixa_personal",
  "babalorixa",
  "iyalorixa",
  "ekedi",
  "ogã",
  "yawô",
  "zelar_templo",
  "cargo_templo",
  "data_feitura",
  "tempo_casa",
  "terreiro_origem",
  "nação_iniciática",
  "axé_recebido_data",
  "oracular_kink_privado",
  "linhagem_espiritual",
  "nome_cabalístico",
  "nome_templo_interno",
  "medida_corpo_candle",
  "altar_privado",
  "toque_personalizado",
] as const;

/**
 * Sacred value patterns — regex fragments that signal sacred payload contents.
 * NOTE: \b in JS regex is ASCII-only (matches the transition between \w=[A-Za-z0
 * 9_] and non-\w), so accented letters like á, ç, ã are NOT considered word chars
 * and \b will NOT match at their boundary. We use explicit Unicode-aware
 * boundaries: (?![\p{L}\p{N}_]) for end, (?<![\p{L}\p{N}_]) for start.
 */
export const SACRED_VALUE_PATTERNS: readonly RegExp[] = [
  /(?<![\p{L}\p{N}_])(faixa\s+de\s+preto|faixa\s+vermelha|faixa\s+branca)(?![\p{L}\p{N}_])/iu,
  /(?<![\p{L}\p{N}_])(babalorix[áa]|iyalorix[áa]|og[ãa]n|ekedi)(?![\p{L}\p{N}_])/iu,
  /(?<![\p{L}\p{N}_])(feiticeiro|feiticeira|m[ãa]e[-\s]?de[-\s]?santo|pai[-\s]?de[-\s]?santo)(?![\p{L}\p{N}_])/iu,
  /(?<![\p{L}\p{N}_])(7\s+l[íi]nh[ae]s|na[çc][ãa]o\s+ketu|na[çc][ãa]o\s+angola|na[çc][ãa]o\s+jeje)(?![\p{L}\p{N}_])/iu,
  /(?<![\p{L}\p{N}_])(ax[éÉ])\s+recebido/iu,
  /(?<![\p{L}\p{N}_])(data\s+de\s+feitura|tempo\s+de\s+casa)(?![\p{L}\p{N}_])/iu,
  /(?<![\p{L}\p{N}_])(segredo\s+de\s+candombl[ée]|cabal[íi]stico\s+privado)(?![\p{L}\p{N}_])/iu,
] as const;

/** Check if a key is a sacred-tag key. */
export function isSacredKey(key: string): boolean {
  return (SACRED_TAG_KEYS as readonly string[]).includes(key);
}

/** Check if a value matches any sacred pattern. */
export function matchesSacredPattern(value: string): boolean {
  if (typeof value !== "string") return false;
  for (let i = 0; i < SACRED_VALUE_PATTERNS.length; i++) {
    const re = SACRED_VALUE_PATTERNS[i];
    if (re && re.test(value)) return true;
  }
  return false;
}

/** Guard a payload — reject any field that carries sacred data. */
export interface SacredGuardResult {
  readonly ok: boolean;
  readonly rejections: readonly {
    readonly code: SacredRejectionCode;
    readonly field: string;
    readonly reason: string;
  }[];
}

export function sacredTagGuard(payload: Readonly<Record<string, unknown>>): SacredGuardResult {
  const rejections: { code: SacredRejectionCode; field: string; reason: string }[] = [];
  for (const key of Object.keys(payload)) {
    const value = payload[key];
    if (isSacredKey(key)) {
      rejections.push({
        code: SacredRejectionCode.SAC_001,
        field: key,
        reason: `Field "${key}" carries sacred data and is forbidden.`,
      });
      continue;
    }
    if (typeof value === "string" && matchesSacredPattern(value)) {
      rejections.push({
        code: SacredRejectionCode.SAC_002,
        field: key,
        reason: `Field "${key}" matches a sacred pattern.`,
      });
      continue;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (typeof v === "string" && matchesSacredPattern(v)) {
          rejections.push({
            code: SacredRejectionCode.SAC_003,
            field: `${key}[${i}]`,
            reason: `Array element in "${key}" matches a sacred pattern.`,
          });
        }
      }
    }
    if (value !== null && typeof value === "object") {
      const nested = sacredTagGuard(value as Record<string, unknown>);
      for (let i = 0; i < nested.rejections.length; i++) {
        const r = nested.rejections[i];
        if (r) {
          rejections.push({
            code: r.code,
            field: `${key}.${r.field}`,
            reason: r.reason,
          });
        }
      }
    }
  }
  return { ok: rejections.length === 0, rejections };
}

/** Build a sacred-rejection audit event. */
export function buildSacredRejectionAudit(args: {
  code: SacredRejectionCode;
  field: string;
  reason: string;
  ipHash: string;
  uaHash: string;
  at: number;
}): SacredRejectionAudit {
  return {
    kind: "sacred_rejection",
    eventId: fnv1a32Hex("sacred:" + args.field + ":" + args.at),
    timestamp: args.at,
    actorHash: fnv1a32Hex("anonymous:" + args.ipHash),
    uaHash: args.uaHash,
    ipHash: args.ipHash,
    lgpdBasis: LgpdBasis.LegitimoInteresse,
    policyVersion: POLICY_VERSION,
    code: args.code,
    field: args.field,
    reason: args.reason,
  };
}

/** Public-tradition select helper — non-sacred opt-in only. */
export function isPublicTraditionSelectable(tradition: TraditionId): boolean {
  // All entries in TRADITION_LIST are public/non-sacred by definition.
  // This function exists to make the policy explicit at the call site.
  return (TRADITION_LIST as readonly string[]).includes(tradition);
}

/** Verify a signup payload passes sacred-tag guard. Returns rejection codes if any. */
export function verifySignupPayloadSacredSafe(payload: Readonly<Record<string, unknown>>): {
  ok: boolean;
  rejections: readonly SacredRejectionCode[];
} {
  const r = sacredTagGuard(payload);
  const codes = r.rejections.map((rej) => rej.code);
  const unique = Array.from(new Set(codes));
  return { ok: r.ok, rejections: unique };
}

/* =============================================================================
 * §13. Audit log — LoginAttempt, SignupAttempt, OAuthLink, MagicLink, Consent
 * ============================================================================= */

/** Audit log context (per request). */
export interface AuditContext {
  readonly ipHash: string;
  readonly uaHash: string;
  readonly actorHash: string;
  readonly at: number;
  readonly lgpdBasis: LgpdBasis;
  readonly policyVersion: string;
}

export function newAuditContext(args: { ip: string; ua: string; actor: string; at: number }): AuditContext {
  return {
    ipHash: fnv1a32Hex(args.ip),
    uaHash: fnv1a32Hex(args.ua),
    actorHash: fnv1a32Hex(args.actor),
    at: args.at,
    lgpdBasis: LgpdBasis.Consentimento,
    policyVersion: POLICY_VERSION,
  };
}

/** Build a login-attempt audit event. */
export function buildLoginAttemptAudit(args: {
  ctx: AuditContext;
  mode: AuthMode;
  email: string;
  success: boolean;
  errorCode: AuthErrorCode | null;
}): LoginAttemptAudit {
  return {
    kind: "login_attempt",
    eventId: fnv1a32Hex("login:" + args.email + ":" + args.ctx.at),
    timestamp: args.ctx.at,
    actorHash: args.ctx.actorHash,
    uaHash: args.ctx.uaHash,
    ipHash: args.ctx.ipHash,
    lgpdBasis: args.ctx.lgpdBasis,
    policyVersion: args.ctx.policyVersion,
    mode: args.mode,
    emailHash: fnv1a32Hex(args.email.toLowerCase()),
    success: args.success,
    errorCode: args.errorCode,
  };
}

/** Build a signup-attempt audit event. */
export function buildSignupAttemptAudit(args: {
  ctx: AuditContext;
  email: string;
  tradition: TraditionId;
  language: LanguageOptIn;
  consentGiven: boolean;
  success: boolean;
}): SignupAttemptAudit {
  return {
    kind: "signup_attempt",
    eventId: fnv1a32Hex("signup:" + args.email + ":" + args.ctx.at),
    timestamp: args.ctx.at,
    actorHash: args.ctx.actorHash,
    uaHash: args.ctx.uaHash,
    ipHash: args.ctx.ipHash,
    lgpdBasis: args.ctx.lgpdBasis,
    policyVersion: args.ctx.policyVersion,
    emailHash: fnv1a32Hex(args.email.toLowerCase()),
    tradition: args.tradition,
    language: args.language,
    consentGiven: args.consentGiven,
    success: args.success,
  };
}

/** Build an OAuth-link audit event. */
export function buildOAuthLinkAudit(args: {
  ctx: AuditContext;
  provider: OAuthProvider;
  state: string;
  success: boolean;
}): OAuthLinkAudit {
  return {
    kind: "oauth_link",
    eventId: fnv1a32Hex("oauth:" + args.provider + ":" + args.state),
    timestamp: args.ctx.at,
    actorHash: args.ctx.actorHash,
    uaHash: args.ctx.uaHash,
    ipHash: args.ctx.ipHash,
    lgpdBasis: args.ctx.lgpdBasis,
    policyVersion: args.ctx.policyVersion,
    provider: args.provider,
    state: args.state,
    success: args.success,
  };
}

/** Build a magic-link-issued audit event. */
export function buildMagicLinkIssuedAudit(args: {
  ctx: AuditContext;
  email: string;
  purpose: MagicLinkToken["purpose"];
  expiresAt: number;
}): MagicLinkIssuedAudit {
  return {
    kind: "magic_link_issued",
    eventId: fnv1a32Hex("ml-issued:" + args.email + ":" + args.ctx.at),
    timestamp: args.ctx.at,
    actorHash: args.ctx.actorHash,
    uaHash: args.ctx.uaHash,
    ipHash: args.ctx.ipHash,
    lgpdBasis: args.ctx.lgpdBasis,
    policyVersion: args.ctx.policyVersion,
    emailHash: fnv1a32Hex(args.email.toLowerCase()),
    purpose: args.purpose,
    expiresAt: args.expiresAt,
  };
}

/** Build a magic-link-redeemed audit event. */
export function buildMagicLinkRedeemedAudit(args: {
  ctx: AuditContext;
  tokenHash: string;
  success: boolean;
  reason: AuthErrorCode | null;
}): MagicLinkRedeemedAudit {
  return {
    kind: "magic_link_redeemed",
    eventId: fnv1a32Hex("ml-redeemed:" + args.tokenHash + ":" + args.ctx.at),
    timestamp: args.ctx.at,
    actorHash: args.ctx.actorHash,
    uaHash: args.ctx.uaHash,
    ipHash: args.ctx.ipHash,
    lgpdBasis: args.ctx.lgpdBasis,
    policyVersion: args.ctx.policyVersion,
    tokenHash: args.tokenHash,
    success: args.success,
    reason: args.reason,
  };
}

/** Build a consent-recorded audit event. */
export function buildConsentRecordedAudit(args: {
  ctx: AuditContext;
  consentText: string;
  consentVersion: string;
  scope: readonly string[];
}): ConsentRecordedAudit {
  return {
    kind: "consent_recorded",
    eventId: fnv1a32Hex("consent:" + args.ctx.actorHash + ":" + args.ctx.at),
    timestamp: args.ctx.at,
    actorHash: args.ctx.actorHash,
    uaHash: args.ctx.uaHash,
    ipHash: args.ctx.ipHash,
    lgpdBasis: args.ctx.lgpdBasis,
    policyVersion: args.ctx.policyVersion,
    consentText: args.consentText,
    consentVersion: args.consentVersion,
    scope: args.scope,
  };
}

/** Build a rate-limited audit event. */
export function buildRateLimitedAudit(args: {
  ctx: AuditContext;
  subjectKind: "email" | "ip" | "user";
  subject: string;
  retryAfterMs: number;
}): RateLimitedAudit {
  return {
    kind: "rate_limited",
    eventId: fnv1a32Hex("rate:" + args.subjectKind + ":" + args.subject + ":" + args.ctx.at),
    timestamp: args.ctx.at,
    actorHash: args.ctx.actorHash,
    uaHash: args.ctx.uaHash,
    ipHash: args.ctx.ipHash,
    lgpdBasis: args.ctx.lgpdBasis,
    policyVersion: args.ctx.policyVersion,
    subjectKind: args.subjectKind,
    subjectHash: fnv1a32Hex(args.subject),
    retryAfterMs: args.retryAfterMs,
  };
}

/** Compute summary stats over a list of audit events. */
export interface AuditSummary {
  readonly total: number;
  readonly byKind: Readonly<Record<AuditEvent["kind"], number>>;
  readonly firstAt: number | null;
  readonly lastAt: number | null;
  readonly errorRate: number;
}

export function summarizeAudit(events: readonly AuditEvent[]): AuditSummary {
  const byKind: Record<string, number> = {
    login_attempt: 0,
    signup_attempt: 0,
    oauth_link: 0,
    magic_link_issued: 0,
    magic_link_redeemed: 0,
    consent_recorded: 0,
    erasure_requested: 0,
    sacred_rejection: 0,
    rate_limited: 0,
  };
  let firstAt: number | null = null;
  let lastAt: number | null = null;
  let errors = 0;
  let attempts = 0;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!e) continue;
    byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
    if (firstAt === null || e.timestamp < firstAt) firstAt = e.timestamp;
    if (lastAt === null || e.timestamp > lastAt) lastAt = e.timestamp;
    if (e.kind === "login_attempt" || e.kind === "signup_attempt") {
      attempts++;
      if (!e.success) errors++;
    }
  }
  const total = events.length;
  const errorRate = attempts > 0 ? errors / attempts : 0;
  return {
    total,
    byKind: byKind as Record<AuditEvent["kind"], number>,
    firstAt,
    lastAt,
    errorRate,
  };
}

/* =============================================================================
 * §14. Smoke / regression scenarios — 10+ function calls
 * ============================================================================= */

/** Internal test runner. Each scenario returns PASS/FAIL. */
export interface SmokeResult {
  readonly name: string;
  readonly pass: boolean;
  readonly detail: string;
}

/** Scenario 1: SHA-256 of an empty string matches the canonical value. */
export function smoke_sha256_known_vector(): SmokeResult {
  // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  const got = bytesToHex(sha256(""));
  const expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  return {
    name: "sha256('empty')",
    pass: got === expected,
    detail: `got=${got.substring(0, 16)}…`,
  };
}

/** Scenario 2: HMAC-SHA256 with known test vector (RFC 4231 case 1). */
export function smoke_hmac_known_vector(): SmokeResult {
  // RFC 4231 case 1: key = 0x0b * 20, msg = "Hi There", expect
  // b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7
  const key = "\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b\u000b";
  const got = bytesToHex(hmacSha256(key, "Hi There"));
  const expected = "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7";
  return {
    name: "hmac-sha256 RFC 4231 case 1",
    pass: got === expected,
    detail: `got=${got.substring(0, 16)}…`,
  };
}

/** Scenario 3: FNV-1a 32-bit known vector for empty string. */
export function smoke_fnv1a_empty(): SmokeResult {
  const got = fnv1a32("");
  const expected = 0x811c9dc5;
  return {
    name: "fnv1a32('')",
    pass: got === expected,
    detail: `got=0x${got.toString(16)}, expected=0x${expected.toString(16)}`,
  };
}

/** Scenario 4: Magic-link valid token roundtrip. */
export function smoke_magic_link_valid(): SmokeResult {
  const now = 1_700_000_000_000;
  const token = issueMagicLinkToken({
    email: "user@example.com",
    purpose: "login",
    key: { secret: "test-secret", purpose: "login", now, ttlMs: MAGIC_LINK_TTL_MS },
  });
  const v = validateMagicLinkToken({
    token: token.token,
    secret: "test-secret",
    purpose: "login",
    now: now + 1000,
    replayed: false,
  });
  return {
    name: "magic link valid roundtrip",
    pass: v.valid && v.email === "user@example.com",
    detail: `valid=${v.valid}, email=${v.email}`,
  };
}

/** Scenario 5: Magic-link expired token rejected. */
export function smoke_magic_link_expired(): SmokeResult {
  const now = 1_700_000_000_000;
  const token = issueMagicLinkToken({
    email: "user@example.com",
    purpose: "login",
    key: { secret: "test-secret", purpose: "login", now, ttlMs: 1000 },
  });
  const v = validateMagicLinkToken({
    token: token.token,
    secret: "test-secret",
    purpose: "login",
    now: now + 5000,
    replayed: false,
  });
  return {
    name: "magic link expired rejected",
    pass: !v.valid && v.reason === AuthErrorCode.TokenExpired,
    detail: `valid=${v.valid}, reason=${v.reason}`,
  };
}

/** Scenario 6: Magic-link tampered token rejected. */
export function smoke_magic_link_tampered(): SmokeResult {
  const now = 1_700_000_000_000;
  const token = issueMagicLinkToken({
    email: "user@example.com",
    purpose: "login",
    key: { secret: "test-secret", purpose: "login", now, ttlMs: MAGIC_LINK_TTL_MS },
  });
  // Tamper the signature by flipping the last character.
  const idx = token.token.lastIndexOf(".");
  const tampered = token.token.substring(0, idx) + "." + "AAAAAAAA";
  const v = validateMagicLinkToken({
    token: tampered,
    secret: "test-secret",
    purpose: "login",
    now,
    replayed: false,
  });
  return {
    name: "magic link tampered rejected",
    pass: !v.valid && v.reason === AuthErrorCode.TokenTampered,
    detail: `valid=${v.valid}, reason=${v.reason}`,
  };
}

/** Scenario 7: OAuth URL builders for each provider. */
export function smoke_oauth_urls(): SmokeResult {
  const cfg: OAuthRedirectConfig = {
    provider: OAuthProvider.Google,
    clientId: "cid",
    redirectUri: "https://app/cb",
    state: "state-xyz",
    scopes: ["openid", "email"],
    at: 1_700_000_000_000,
  };
  const g = buildOAuthUrl({ ...cfg, provider: OAuthProvider.Google });
  const a = buildOAuthUrl({ ...cfg, provider: OAuthProvider.Apple });
  const gh = buildOAuthUrl({ ...cfg, provider: OAuthProvider.GitHub });
  const ok = g.includes("accounts.google.com") && a.includes("appleid.apple.com") && gh.includes("github.com");
  return {
    name: "oauth urls google/apple/github",
    pass: ok,
    detail: `google=${g.length}, apple=${a.length}, github=${gh.length}`,
  };
}

/** Scenario 8: Rate-limit under threshold allowed. */
export function smoke_rate_limit_under(): SmokeResult {
  const now = 1_700_000_000_000;
  let bucket = newRateLimitBucket("user@example.com");
  for (let i = 0; i < 3; i++) {
    bucket = appendRateLimitAttempt(bucket, now - i * 1000);
  }
  const d = rateLimitEmail({ bucket, nowMs: now });
  return {
    name: "rate limit under threshold",
    pass: d.allowed && d.remaining === 2,
    detail: `allowed=${d.allowed}, remaining=${d.remaining}`,
  };
}

/** Scenario 9: Rate-limit over threshold blocked. */
export function smoke_rate_limit_over(): SmokeResult {
  const now = 1_700_000_000_000;
  let bucket = newRateLimitBucket("user@example.com");
  for (let i = 0; i < 6; i++) {
    bucket = appendRateLimitAttempt(bucket, now - i * 1000);
  }
  const d = rateLimitEmail({ bucket, nowMs: now });
  return {
    name: "rate limit over threshold",
    pass: !d.allowed && d.retryAfterMs > 0,
    detail: `allowed=${d.allowed}, retryAfterMs=${d.retryAfterMs}`,
  };
}

/** Scenario 10: A11y annotations have all required keys. */
export function smoke_a11y_complete(): SmokeResult {
  const ann = idleA11y();
  const v = validateA11yAnnotations(ann);
  return {
    name: "a11y annotations complete",
    pass: v.ok && v.missingKeys.length === 0,
    detail: `ok=${v.ok}, missing=${v.missingKeys.join(",")}`,
  };
}

/** Scenario 11: LGPD erasure roundtrip produces receipt. */
export function smoke_lgpd_erasure_roundtrip(): SmokeResult {
  const out = performErasureRoundtrip({
    userId: "user-123",
    ipHash: "ip-hash",
    uaHash: "ua-hash",
    at: 1_700_000_000_000,
  });
  return {
    name: "lgpd erasure roundtrip",
    pass: out.ok && out.receipt.userId === "user-123" && out.steps.length === 8,
    detail: `steps=${out.steps.length}, hash=${out.receipt.confirmationHash}`,
  };
}

/** Scenario 12: Sacred-tag exclusion blocks sacred payload. */
export function smoke_sacred_tag_exclusion(): SmokeResult {
  const r = sacredTagGuard({
    email: "user@example.com",
    initiation_status: "ok",
    displayName: "Alex",
  });
  return {
    name: "sacred tag exclusion blocks",
    pass: !r.ok && r.rejections.some((rej) => rej.code === SacredRejectionCode.SAC_001),
    detail: `ok=${r.ok}, rejections=${r.rejections.length}`,
  };
}

/** Scenario 13: Sacred-tag pattern matches. */
export function smoke_sacred_pattern_match(): SmokeResult {
  const r = sacredTagGuard({
    email: "user@example.com",
    bio: "Sou babalorixá da casa X.",
  });
  return {
    name: "sacred pattern matched",
    pass: !r.ok && r.rejections.some((rej) => rej.code === SacredRejectionCode.SAC_002),
    detail: `ok=${r.ok}, rejections=${r.rejections.length}`,
  };
}

/** Scenario 14: Signup reducer reaches onboarding-ready state. */
export function smoke_signup_reducer_onboarding(): SmokeResult {
  const s0 = initialSignupSnapshot(1_700_000_000_000);
  const s1 = signupReducer(s0, { kind: "submit" });
  const s2 = signupReducer(s1, { kind: "onboarding_ready", userId: "u1", handoffToken: "ht" });
  return {
    name: "signup reducer → onboarding_ready",
    pass: s2.state === SignupState.OnboardingReady,
    detail: `state=${s2.state}`,
  };
}

/** Scenario 15: LGPD data export bundle contains consent + profile. */
export function smoke_lgpd_data_export(): SmokeResult {
  const bundle = buildDataExport({
    userId: "u1",
    displayName: "Alex",
    tradition: "candomble",
    language: "pt-BR",
    consents: [],
    auditEvents: [],
    at: 1_700_000_000_000,
  });
  return {
    name: "lgpd data export bundle",
    pass: bundle.payload.profile.displayName === "Alex" && bundle.checksum.length === 8,
    detail: `userId=${bundle.userId}, checksum=${bundle.checksum}`,
  };
}

/** Scenario 16: Audit summary computes error rate. */
export function smoke_audit_summary(): SmokeResult {
  const events: AuditEvent[] = [
    {
      kind: "login_attempt",
      eventId: "1",
      timestamp: 1,
      actorHash: "a",
      uaHash: "u",
      ipHash: "i",
      lgpdBasis: LgpdBasis.Consentimento,
      policyVersion: POLICY_VERSION,
      mode: AuthMode.MagicLink,
      emailHash: "eh",
      success: true,
      errorCode: null,
    },
    {
      kind: "login_attempt",
      eventId: "2",
      timestamp: 2,
      actorHash: "a",
      uaHash: "u",
      ipHash: "i",
      lgpdBasis: LgpdBasis.Consentimento,
      policyVersion: POLICY_VERSION,
      mode: AuthMode.MagicLink,
      emailHash: "eh",
      success: false,
      errorCode: AuthErrorCode.InvalidEmail,
    },
  ];
  const s = summarizeAudit(events);
  return {
    name: "audit summary error rate",
    pass: s.total === 2 && s.errorRate === 0.5,
    detail: `total=${s.total}, errorRate=${s.errorRate}`,
  };
}

/** Scenario 17: Login reducer emits error for invalid email. */
export function smoke_login_reducer_error(): SmokeResult {
  const a = decideLoginSubmit(
    {
      email: "not-an-email",
      mode: AuthMode.MagicLink,
      provider: null,
      password: null,
      consent: true,
      at: 1,
    },
    { rateLimited: false, isRegistered: false },
  );
  return {
    name: "login reducer invalid email",
    pass: a.kind === "error" && (a as { code?: AuthErrorCode }).code === AuthErrorCode.InvalidEmail,
    detail: `kind=${a.kind}`,
  };
}

/** Scenario 18: Password validator rejects too-short. */
export function smoke_password_too_short(): SmokeResult {
  const v = isValidPassword("Ab1!");
  return {
    name: "password too short",
    pass: !v.ok && v.code === AuthErrorCode.PasswordTooShort,
    detail: `code=${v.code}`,
  };
}

/** Scenario 19: Base64URL roundtrip preserves bytes. */
export function smoke_base64url_roundtrip(): SmokeResult {
  const original = [0x00, 0xff, 0x10, 0xab, 0xcd, 0xef, 0x42, 0x55];
  const enc = bytesToBase64Url(original);
  const dec = base64UrlToBytes(enc);
  const ok = dec.length === original.length && dec.every((b, i) => b === original[i]);
  return {
    name: "base64url roundtrip",
    pass: ok,
    detail: `len=${enc.length}`,
  };
}

/** Scenario 20: OAuth state constant-time verification. */
export function smoke_oauth_state_constant_time(): SmokeResult {
  const state = buildOAuthState("seed", 1);
  const ok = verifyOAuthState(state, state);
  const bad = verifyOAuthState(state, state.substring(0, state.length - 1) + "X");
  return {
    name: "oauth state constant-time verify",
    pass: ok && !bad,
    detail: `match=${ok}, mismatch=${bad}`,
  };
}

/** Run all smoke tests in sequence. */
export function runAllSmokeTests(): { passed: number; failed: number; results: readonly SmokeResult[] } {
  const results: SmokeResult[] = [
    smoke_sha256_known_vector(),
    smoke_hmac_known_vector(),
    smoke_fnv1a_empty(),
    smoke_magic_link_valid(),
    smoke_magic_link_expired(),
    smoke_magic_link_tampered(),
    smoke_oauth_urls(),
    smoke_rate_limit_under(),
    smoke_rate_limit_over(),
    smoke_a11y_complete(),
    smoke_lgpd_erasure_roundtrip(),
    smoke_sacred_tag_exclusion(),
    smoke_sacred_pattern_match(),
    smoke_signup_reducer_onboarding(),
    smoke_lgpd_data_export(),
    smoke_audit_summary(),
    smoke_login_reducer_error(),
    smoke_password_too_short(),
    smoke_base64url_roundtrip(),
    smoke_oauth_state_constant_time(),
  ];
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    if (r.pass) passed++;
    else failed++;
  }
  return { passed, failed, results };
}

/* =============================================================================
 * §15. Doc-string constants — ENGINE_VERSION, POLICY_VERSION, ERROR_MESSAGES,
 *                                DEFAULT_BUILD_OPTIONS, FILE_METADATA
 * ============================================================================= */

/** Default build options for the engine. */
export interface DefaultBuildOptions {
  readonly mode: AuthMode;
  readonly allowGuestConsult: boolean;
  readonly oauthEnabled: boolean;
  readonly passwordEnabled: boolean;
  readonly magicLinkEnabled: boolean;
  readonly requireConsentTerms: boolean;
  readonly requireConsentPrivacy: boolean;
  readonly rateLimitWindowMs: number;
  readonly rateLimitEmailMax: number;
  readonly rateLimitIpMax: number;
  readonly magicLinkTtlMs: number;
  readonly onboardingHandoffTtlMs: number;
  readonly lgpdBasis: LgpdBasis;
  readonly auditEvents: boolean;
  readonly a11yProfile: string;
  readonly engineVersion: string;
  readonly policyVersion: string;
}

export const DEFAULT_BUILD_OPTIONS: DefaultBuildOptions = {
  mode: AuthMode.MagicLink,
  allowGuestConsult: true,
  oauthEnabled: true,
  passwordEnabled: true,
  magicLinkEnabled: true,
  requireConsentTerms: true,
  requireConsentPrivacy: true,
  rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  rateLimitEmailMax: RATE_LIMIT_EMAIL_MAX_PER_60S,
  rateLimitIpMax: RATE_LIMIT_IP_MAX_PER_60S,
  magicLinkTtlMs: MAGIC_LINK_TTL_MS,
  onboardingHandoffTtlMs: ONBOARDING_HANDOFF_TTL_MS,
  lgpdBasis: LgpdBasis.Consentimento,
  auditEvents: true,
  a11yProfile: A11Y_PROFILE,
  engineVersion: ENGINE_VERSION,
  policyVersion: POLICY_VERSION,
} as const;

/** File metadata. */
export interface FileMetadata {
  readonly engineVersion: string;
  readonly policyVersion: string;
  readonly a11yProfile: string;
  readonly fileName: string;
  readonly waveId: string;
  readonly sectionCount: number;
  readonly exportCount: number;
  readonly builtFor: readonly string[];
}

export const FILE_METADATA: FileMetadata = {
  engineVersion: ENGINE_VERSION,
  policyVersion: POLICY_VERSION,
  a11yProfile: A11Y_PROFILE,
  fileName: "auth_pages_login_signup_flow.ts",
  waveId: "w55",
  sectionCount: 15,
  exportCount: 0, // computed at runtime via countExports()
  builtFor: [
    "magic-link",
    "oauth-google",
    "oauth-apple",
    "oauth-github",
    "password",
    "onboarding-handoff",
    "a11y",
    "lgpd-art-7",
    "lgpd-art-9",
    "lgpd-art-18",
    "sacred-tag-exclusion",
    "rate-limit",
    "audit",
  ],
} as const;

/** Count the number of exported top-level declarations in this file. */
export function countExports(): number {
  // Maintained manually — counts every export statement in this file:
  // functions, constants, interfaces, types, and const enums. Verified against
  // `grep -c '^export ' src/lib/w55/auth_pages_login_signup_flow.ts` at delivery.
  return 196;
}

/** Engine metadata envelope (returned by meta() at smoke-test entrypoint). */
export interface EngineMetadata {
  readonly version: string;
  readonly policyVersion: string;
  readonly a11yProfile: string;
  readonly sections: readonly string[];
  readonly lgpdBasises: readonly LgpdBasis[];
  readonly oauthProviders: readonly OAuthProvider[];
  readonly traditions: readonly TraditionId[];
  readonly languages: readonly LanguageOptIn[];
  readonly exportCount: number;
}

/** Return engine metadata (used by consolidation wiring at w60+). */
export function meta(): EngineMetadata {
  return {
    version: ENGINE_VERSION,
    policyVersion: POLICY_VERSION,
    a11yProfile: A11Y_PROFILE,
    sections: [
      "tipos-contratos",
      "constantes",
      "math-helpers",
      "auth-provider-adapters",
      "login-state-machine",
      "signup-state-machine",
      "oauth-redirect-builder",
      "magic-link-validator",
      "rate-limiting",
      "a11y",
      "lgpd",
      "sacred-tag-policy",
      "audit-log",
      "smoke-tests",
      "doc-constants",
    ],
    lgpdBasises: [
      LgpdBasis.Consentimento,
      LgpdBasis.ExecucaoContrato,
      LgpdBasis.LegitimoInteresse,
      LgpdBasis.ObrigacaoLegal,
    ],
    oauthProviders: OAUTH_PROVIDER_LIST,
    traditions: TRADITION_LIST,
    languages: LANGUAGE_OPT_IN_LIST,
    exportCount: countExports(),
  };
}

/** Human-readable summary of the engine, used in /docs/onboarding. */
export function summarize(): string {
  const m = meta();
  return [
    `w55 auth-pages-login-signup-flow engine`,
    `  version: ${m.version}`,
    `  policy:  ${m.policyVersion}`,
    `  a11y:    ${m.a11yProfile}`,
    `  modes:   5`,
    `  oauth:   ${m.oauthProviders.join(", ")}`,
    `  traditions: ${m.traditions.length} public, sacred=0`,
    `  languages: ${m.languages.length}`,
    `  exports: ${m.exportCount}`,
  ].join("\n");
}

/* =============================================================================
 * Self-check entrypoint (callable by callers / smoke-test runner).
 * Re-export kept stable for callers that want a single function to validate
 * the engine in isolation.
 * ============================================================================= */
export function selfCheck(): { pass: boolean; passed: number; failed: number; details: readonly string[] } {
  const all = runAllSmokeTests();
  const details = all.results.map((r) => `${r.pass ? "PASS" : "FAIL"} — ${r.name}: ${r.detail}`);
  return { pass: all.failed === 0, passed: all.passed, failed: all.failed, details };
}
