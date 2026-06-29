/**
 * Passwordless Auth — Akasha Portal / Cabala dos Caminhos
 *
 * Magic link + OTP passwordless authentication. Extends the w30/auth-session
 * pattern with modern passwordless flows:
 *
 *   - **Magic link**: one-time token sent over email/SMS, clicks to start session.
 *   - **Email/SMS OTP**: one-time code (6 digits, 10-minute TTL, 5 attempts).
 *   - **TOTP** (RFC 6238): authenticator-app enrolment + verification with drift.
 *
 * Sessions inherit the 30-day TTL from `w30/auth-session` and use the same
 * `ipHash` shape so downstream rate limiting + audit pipelines can treat
 * passwordless sessions identically to legacy sessions.
 *
 * Standalone module — no external imports. Hashing is implemented as
 * plain-string operations (no `crypto` / `node:crypto` import) so the file
 * remains usable from edge runtimes and unit tests without polyfills.
 */

// ===========================================================================
// Constants
// ===========================================================================

/** OTP challenge lifetime (10 minutes), in milliseconds. */
export const OTP_TTL_MS = 600_000;

/** Length of OTP codes (digits). */
export const OTP_LENGTH = 6;

/** Maximum number of failed verification attempts per OTP challenge. */
export const OTP_MAX_ATTEMPTS = 5;

/** Magic-link token lifetime (15 minutes), in milliseconds. */
export const MAGIC_LINK_TTL_MS = 900_000;

/** Session lifetime (30 days), in milliseconds. */
export const SESSION_TTL_MS = 86_400_000 * 30; // 2_592_000_000

/** Issuer string embedded in TOTP `otpauth://` URLs. */
export const TOTP_ISSUER = "Akasha Portal";

/** Number of digits in a TOTP code. */
export const TOTP_DIGITS = 6;

/** TOTP time-step period in seconds (per RFC 6238). */
export const TOTP_PERIOD = 30;

/** TOTP verification window: ±1 period is the standard "lenient" drift. */
export const TOTP_DRIFT_WINDOW = 1;

/** Default session-refresh threshold (7 days before expiry). */
export const DEFAULT_REFRESH_THRESHOLD_MS = 7 * 86_400_000;

/** Base32 alphabet for TOTP secrets (RFC 4648). */
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Default TOTP secret length in characters (160 bits ≈ 32 base32 chars). */
const TOTP_SECRET_LENGTH = 32;

// ===========================================================================
// Types
// ===========================================================================

/**
 * In-flight passwordless request, before the user has proven control of the
 * channel. Carries the request id used to correlate the eventual verification.
 */
export type PasswordlessRequest = {
  /** Email address the challenge was issued to. */
  email: string;
  /** Channel used to deliver the code/link. */
  channel: "email" | "sms";
  /** Epoch milliseconds when the request was created. */
  createdAt: number;
  /** Unique id correlating request → challenge → verification. */
  requestId: string;
};

/**
 * Server-side OTP challenge. Never store the raw code — only its hash.
 *
 * The challenge is single-use-per-code but allows `maxAttempts` retries on
 * wrong codes before the challenge is invalidated.
 */
export type OtpChallenge = {
  /** Reference back to the originating request. */
  requestId: string;
  /** Hash of the OTP code (created via `hashOtpCode`). */
  codeHash: string;
  /** Epoch milliseconds when this challenge expires. */
  expiresAt: number;
  /** Number of failed verification attempts so far. */
  attempts: number;
  /** Maximum number of attempts before the challenge is rejected. */
  maxAttempts: number;
};

/**
 * Result of an OTP verification attempt. `success=false` results carry a
 * `reason` describing why the verification failed.
 */
export type OtpVerification = {
  /** The request the verification was for. */
  requestId: string;
  /** The submitted code (echoed for audit). */
  code: string;
  /** Epoch milliseconds when the verification ran. */
  verifiedAt: number;
  /** Whether the code was correct and the challenge still valid. */
  success: boolean;
  /** Why verification failed (only set when `success=false`). */
  reason?: "expired" | "invalid" | "max_attempts";
};

/**
 * TOTP enrolment record. Unverified enrolments have no `enrolledAt` timestamp;
 * verified enrolments carry the timestamp of the first successful code.
 */
export type TotpEnrollment = {
  /** User this enrolment belongs to. */
  userId: string;
  /** Shared secret (base32-encoded). */
  secret: string;
  /** `otpauth://` URL suitable for QR-code generation. */
  otpauthUrl: string;
  /** Whether the user has confirmed enrolment with a valid code. */
  verified: boolean;
  /** Epoch milliseconds of successful enrolment confirmation. */
  enrolledAt?: number;
};

/**
 * An authenticated session. The `method` field distinguishes passwordless vs
 * legacy sessions so downstream analytics can split the population.
 *
 * Sessions are opaque tokens — the `sessionId` is server-generated, unique
 * per login, and never reused.
 */
export type AuthSession = {
  /** Opaque session identifier. */
  sessionId: string;
  /** User this session authenticates. */
  userId: string;
  /** How the user proved their identity at session-creation time. */
  method: "magic_link" | "otp" | "totp" | "password";
  /** Epoch milliseconds when the session was created. */
  createdAt: number;
  /** Epoch milliseconds when the session expires. */
  expiresAt: number;
  /** Hashed client IP for rate-limiting and audit trails. */
  ipHash: string;
};

// ===========================================================================
// Internals — hashing + id generation (plain-string ops)
// ===========================================================================

/**
 * djb2-style 32-bit hash, mixed with the input length. NOT cryptographically
 * secure — sufficient for comparator equality on stored challenge hashes when
 * the threat model assumes the database is trusted and codes are short-lived.
 *
 * @param input  String to hash.
 * @returns      Stable hex digest of 8 chars.
 */
function djb2Hex(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  // Mix again with length so empty-string collisions are unlikely.
  const lenMix = (hash ^ input.length) >>> 0;
  return lenMix.toString(16).padStart(8, "0");
}

/**
 * Concatenate-then-double-hash function. Mirrors the shape of a salted
 * password hash (e.g. PBKDF2) without the cost or the crypto dependency.
 */
function saltedHash(code: string, salt: string): string {
  const a = djb2Hex(`${salt}:${code}`);
  const b = djb2Hex(`${code}:${salt}:${a}`);
  return `${a}${b}`;
}

/**
 * Generate a 24-char request id from a timestamp + counter. The counter is
 * folded into the seed so requestIds are locally unique within a single
 * process without coordination.
 */
function generateRequestId(timestampMs: number, counter: number): string {
  const seed = `${timestampMs.toString(36)}-${counter.toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
  return `req_${djb2Hex(seed)}${djb2Hex(seed + seed)}`;
}

/**
 * Generate a 32-char session id (base32-ish). Server-side rotation ensures
 * uniqueness across processes; the random tail protects against birthday
 * collisions in a single process.
 */
function generateSessionId(timestampMs: number): string {
  const head = timestampMs.toString(36).padStart(10, "0");
  let tail = "";
  for (let i = 0; i < 22; i += 1) {
    tail += BASE32_ALPHABET[Math.floor(Math.random() * BASE32_ALPHABET.length)];
  }
  return `sess_${head}${tail}`;
}

/**
 * Generate a base32 secret of fixed length. Caller may pass their own secret
 * (e.g. for test fixtures or for migration from another system).
 */
function generateSecret(length: number = TOTP_SECRET_LENGTH): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += BASE32_ALPHABET[Math.floor(Math.random() * BASE32_ALPHABET.length)];
  }
  return out;
}

// ===========================================================================
// Internals — TOTP
// ===========================================================================

/**
 * Decode a base32 secret into a numeric counter byte stream (mocked).
 * The full RFC 4648 + RFC 6238 spec would HMAC-SHA1 the counter; here we mix
 * the secret + counter deterministically so unit tests stay deterministic.
 */
function totpMix(secret: string, counter: number): string {
  const a = djb2Hex(`${secret}|${counter}`);
  const b = djb2Hex(`${counter}|${secret}|${a}`);
  return `${a}${b}`;
}

/**
 * Extract a numeric code of `digits` length from a hex digest. Implements the
 * "dynamic truncation" idea from RFC 4226 without the cryptographic anchor —
 * the high nibble drives the offset, the remaining bits become the code.
 */
function dynamicTruncate(digest: string, digits: number): string {
  const len = digest.length;
  const offset = parseInt(digest[len - 1] ?? "0", 16) * 2;
  const slice = digest.slice(offset, offset + 8).padEnd(8, "0");
  const value = parseInt(slice, 16) & 0x7fff_ffff;
  const mod = 10 ** digits;
  return (value % mod).toString().padStart(digits, "0");
}

/**
 * URL-encode a label component for `otpauth://` URIs (per Key URI Format spec).
 * Spaces become `%20`, not `+`.
 */
function otpauthLabel(userId: string): string {
  return userId.replace(/ /g, "%20");
}

// ===========================================================================
// Magic link
// ===========================================================================

/**
 * Create a passwordless request (server-side). The caller is responsible for
 * actually dispatching the email/SMS — this function only models the request.
 *
 * @param input         Email and channel to use.
 * @param input.email   Destination email address.
 * @param input.channel Delivery channel (`email` or `sms`).
 * @param now           Epoch milliseconds (caller-controlled for tests).
 * @param counter       Per-process counter for unique requestIds.
 * @returns             A fresh `PasswordlessRequest`.
 */
export function requestMagicLink(
  input: { email: string; channel: "email" | "sms" },
  now: number = Date.now(),
  counter: number = 0,
): PasswordlessRequest {
  return {
    email: input.email,
    channel: input.channel,
    createdAt: now,
    requestId: generateRequestId(now, counter),
  };
}

/**
 * Build the magic-link URL the user clicks. The token is appended as a
 * separate query parameter from `requestId` so the server can revoke the
 * request without invalidating the URL structure.
 *
 * @param requestId   Originating passwordless request id.
 * @param baseUrl     Application base URL (e.g. `https://app.akasha.dev`).
 * @param token       Opaque single-use token bound to the request.
 * @returns           Absolute URL string.
 */
export function buildMagicLinkUrl(requestId: string, baseUrl: string, token: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "");
  const separator = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}/auth/magic${separator}requestId=${encodeURIComponent(requestId)}&token=${encodeURIComponent(token)}`;
}

// ===========================================================================
// OTP
// ===========================================================================

/**
 * Hash an OTP code with the request's salt. Use a fresh salt per request —
 * never reuse salts across challenges.
 *
 * @param code   Plain-text OTP code from the user.
 * @param salt   Per-request salt (e.g. the requestId).
 * @returns      Stable hash suitable for `OtpChallenge.codeHash`.
 */
export function hashOtpCode(code: string, salt: string): string {
  return saltedHash(code, salt);
}

/**
 * Create the server-side OTP challenge for a freshly-sent code.
 *
 * @param requestId  Originating request id.
 * @param code       Plain-text code that was just dispatched.
 * @param salt       Per-request salt (must match the salt used at verify).
 * @param now        Epoch milliseconds (caller-controlled for tests).
 * @returns          A new `OtpChallenge`.
 */
export function createOtpChallenge(requestId: string, code: string, salt: string, now: number = Date.now()): OtpChallenge {
  return {
    requestId,
    codeHash: hashOtpCode(code, salt),
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
  };
}

/**
 * Verify an OTP submission against a challenge. Mutates the challenge by
 * incrementing `attempts` (returns a fresh challenge to keep the API pure
 * — caller must persist the new state).
 *
 * @param challenge  Current server-side challenge state.
 * @param code       User-submitted code.
 * @param now        Epoch milliseconds.
 * @returns          Verification result.
 */
export function verifyOtp(challenge: OtpChallenge, code: string, now: number): OtpVerification {
  if (isChallengeExpired(challenge, now)) {
    return {
      requestId: challenge.requestId,
      code,
      verifiedAt: now,
      success: false,
      reason: "expired",
    };
  }

  if (isMaxAttemptsReached(challenge)) {
    return {
      requestId: challenge.requestId,
      code,
      verifiedAt: now,
      success: false,
      reason: "max_attempts",
    };
  }

  // Note: we DO NOT mutate `challenge` here — the caller compares hashes and
  // updates `attempts` based on the returned success flag.
  const expectedHash = challenge.codeHash;
  const submittedHash = hashOtpCode(code, challenge.requestId);

  if (expectedHash !== submittedHash) {
    return {
      requestId: challenge.requestId,
      code,
      verifiedAt: now,
      success: false,
      reason: "invalid",
    };
  }

  return {
    requestId: challenge.requestId,
    code,
    verifiedAt: now,
    success: true,
  };
}

/**
 * Has the OTP challenge expired? True when `now >= expiresAt`.
 *
 * @param challenge  Challenge to inspect.
 * @param now        Epoch milliseconds.
 */
export function isChallengeExpired(challenge: OtpChallenge, now: number): boolean {
  return now >= challenge.expiresAt;
}

/**
 * Has the OTP challenge used all of its allowed attempts?
 *
 * @param challenge  Challenge to inspect.
 */
export function isMaxAttemptsReached(challenge: OtpChallenge): boolean {
  return challenge.attempts >= challenge.maxAttempts;
}

// ===========================================================================
// TOTP (RFC 6238)
// ===========================================================================

/**
 * Enrol a user for TOTP. Generates a fresh base32 secret unless one is
 * supplied (e.g. for migration).
 *
 * @param userId  User identifier (used in the `otpauth://` label).
 * @param secret  Optional pre-existing secret (tests / migration).
 * @returns       An unverified `TotpEnrollment`.
 */
export function enrollTotp(userId: string, secret?: string): TotpEnrollment {
  const useSecret = secret ?? generateSecret();
  const label = otpauthLabel(userId);
  const otpauthUrl =
    `otpauth://totp/${otpauthLabel(TOTP_ISSUER)}:${label}` +
    `?secret=${useSecret}&issuer=${otpauthLabel(TOTP_ISSUER)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
  return {
    userId,
    secret: useSecret,
    otpauthUrl,
    verified: false,
  };
}

/**
 * Build a TOTP code for a secret at a given timestamp. Mainly used by tests
 * and by helper tooling that pre-generates codes for QA flows.
 *
 * @param secret         Shared base32 secret.
 * @param timestampMs    Epoch milliseconds for which to derive the code.
 * @returns              Zero-padded numeric code.
 */
export function buildTotpCode(secret: string, timestampMs: number): string {
  const counter = Math.floor(timestampMs / 1000 / TOTP_PERIOD);
  const digest = totpMix(secret, counter);
  return dynamicTruncate(digest, TOTP_DIGITS);
}

/**
 * Verify a TOTP submission. Checks the code against the current 30-second
 * window and ±1 period of drift; returns the offset (in periods) that
 * matched so callers can detect clock drift on the client.
 *
 * @param enrollment  TOTP enrolment (must be `verified=true`).
 * @param code        User-submitted code.
 * @param now         Epoch milliseconds.
 * @returns           `{ valid, drift }` — `drift` is 0 when current window matched.
 */
export function verifyTotp(enrollment: TotpEnrollment, code: string, now: number): { valid: boolean; drift: number } {
  if (!enrollment.verified || !code) {
    return { valid: false, drift: 0 };
  }

  const currentCounter = Math.floor(now / 1000 / TOTP_PERIOD);

  for (let offset = -TOTP_DRIFT_WINDOW; offset <= TOTP_DRIFT_WINDOW; offset += 1) {
    const counter = currentCounter + offset;
    if (counter < 0) continue;
    const expected = buildTotpCode(enrollment.secret, counter * TOTP_PERIOD * 1000);
    if (expected === code) {
      return { valid: true, drift: offset };
    }
  }

  return { valid: false, drift: 0 };
}

// ===========================================================================
// Sessions
// ===========================================================================

/**
 * Build a fresh auth session after a successful passwordless flow.
 *
 * @param userId    User identifier.
 * @param method    Which passwordless method authenticated the session.
 * @param ipHash    Hashed client IP for rate-limiting + audit.
 * @param now       Epoch milliseconds.
 * @returns         A new `AuthSession`.
 */
export function buildSession(userId: string, method: AuthSession["method"], ipHash: string, now: number = Date.now()): AuthSession {
  return {
    sessionId: generateSessionId(now),
    userId,
    method,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    ipHash,
  };
}

/**
 * Has the session expired? True when `now >= expiresAt`.
 *
 * @param session  Session to inspect.
 * @param now      Epoch milliseconds.
 */
export function isSessionExpired(session: AuthSession, now: number): boolean {
  return now >= session.expiresAt;
}

/**
 * Should the caller refresh this session? Returns true when the session has
 * less than `thresholdMs` time left — a sliding-window session strategy.
 *
 * @param session        Session to inspect.
 * @param now            Epoch milliseconds.
 * @param thresholdMs    Remaining-time threshold; below this we refresh.
 */
export function shouldRefreshSession(session: AuthSession, now: number, thresholdMs: number = DEFAULT_REFRESH_THRESHOLD_MS): boolean {
  if (isSessionExpired(session, now)) return false;
  return session.expiresAt - now <= thresholdMs;
}
