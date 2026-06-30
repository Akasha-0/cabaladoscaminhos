// Auth Password Recovery Engine — wave 68
// Password hashing (scrypt), reset-token lifecycle (request, validate, consume).
// - Hash: scrypt(N=2^14, r=8, p=1, dkLen=64) → 'scrypt$N$r$p$saltB64$hashB64'
// - Reset token: <id>.<hmac> where hmac = HMAC-SHA256(secret, id+userId+expiresAt).
//
// Sections:
//  1. Types (PasswordResetRequest, branded ResetToken, hashed password format)
//  2. Errors
//  3. Constants
//  4. Crypto helpers — scrypt hash, HMAC tokens
//  5. In-memory store for reset requests + per-user lockout guard
//  6. Public API: hashPassword, verifyPassword, requestPasswordReset, validateResetToken, consumeResetToken
//  7. Default export audit

import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

/* ───────────────────────── 1. Types ───────────────────────── */

export type ResetToken = string & { readonly __brand: 'ResetToken' };

export interface PasswordResetRequest {
  readonly id: string;
  readonly userId: string;
  readonly email: string;
  readonly token: ResetToken;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly consumedAt: Date | null;
  readonly ip: string | null;
}

export interface PasswordResetRequestOptions {
  readonly ip?: string | null;
  readonly ttlMs?: number;
}

export interface ConsumedResetResult {
  readonly userId: string;
  readonly email: string;
  readonly consumedAt: Date;
  readonly newPasswordHash: string;
}

export interface PasswordPolicy {
  readonly minLength: number;
  readonly maxLength: number;
  readonly requireDigit: boolean;
  readonly requireUpper: boolean;
  readonly requireLower: boolean;
  readonly requireSymbol: boolean;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireDigit: true,
  requireUpper: true,
  requireLower: true,
  requireSymbol: false,
};

/* ───────────────────────── 2. Errors ───────────────────────── */

export class PasswordRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordRecoveryError';
  }
}

export class InvalidPasswordError extends PasswordRecoveryError {
  constructor(message = 'Password does not meet policy') {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

export class InvalidResetTokenError extends PasswordRecoveryError {
  constructor(message = 'Invalid reset token') {
    super(message);
    this.name = 'InvalidResetTokenError';
  }
}

export class ExpiredResetTokenError extends PasswordRecoveryError {
  constructor(message = 'Reset token has expired') {
    super(message);
    this.name = 'ExpiredResetTokenError';
  }
}

export class ResetTokenAlreadyConsumedError extends PasswordRecoveryError {
  constructor(message = 'Reset token has already been consumed') {
    super(message);
    this.name = 'ResetTokenAlreadyConsumedError';
  }
}

export class UserNotFoundError extends PasswordRecoveryError {
  constructor(message = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class PasswordRateLimitError extends PasswordRecoveryError {
  constructor(message = 'Too many reset requests for this email — try again later') {
    super(message);
    this.name = 'PasswordRateLimitError';
  }
}

/* ───────────────────────── 3. Constants ───────────────────────── */

export const DEFAULT_RESET_TTL_MS = 1000 * 60 * 30; // 30 min
export const PASSWORD_RESET_RATE_LIMIT_MS = 1000 * 60; // 1 reset per minute per email
export const SCRYPT_N = 16384;
export const SCRYPT_R = 8;
export const SCRYPT_P = 1;
export const SCRYPT_DK_LEN = 64;
export const SCRYPT_SALT_BYTES = 16;

const HMAC_ALGO = 'sha256';
let _resetSecret = '';
let _nextIdCounter = 0;
function nextResetId(): string {
  _nextIdCounter = (_nextIdCounter + 1) >>> 0;
  return `${Date.now().toString(36)}${_nextIdCounter.toString(36)}${randomBytes(6).toString('hex')}`;
}

export function setPasswordResetSecret(secret: string): void {
  if (typeof secret !== 'string' || secret.length < 16) {
    throw new PasswordRecoveryError('Password reset secret must be >= 16 chars');
  }
  _resetSecret = secret;
}

export function getPasswordResetSecretFingerprint(): string {
  return createHmac(HMAC_ALGO, 'cabala-password-reset').update(_resetSecret).digest('base64url').slice(0, 12);
}

export function resetPasswordRecoveryEngine(): void {
  _resetSecret = '';
  _nextIdCounter = 0;
  _resetStore.clear();
  _lastResetByEmail.clear();
}

export function clearRateLimitsForTest(): void {
  _lastResetByEmail.clear();
}

export function toResetToken(raw: string): ResetToken {
  if (typeof raw !== 'string' || raw.split('.').length !== 4) {
    throw new InvalidResetTokenError('Reset token must be a 4-part dot-separated string');
  }
  return raw as ResetToken;
}

export function isResetToken(value: unknown): value is ResetToken {
  return typeof value === 'string' && value.split('.').length === 4;
}

/* ───────────────────────── 4. Crypto helpers ───────────────────────── */

export async function hashPassword(plain: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): Promise<string> {
  validatePasswordPolicy(plain, policy);
  const salt = randomBytes(SCRYPT_SALT_BYTES);
  const hash = (await scryptAsync(plain.normalize('NFKC'), salt, SCRYPT_DK_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })) as Buffer;
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (typeof plain !== 'string' || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const saltB64 = parts[4];
  const hashB64 = parts[5];
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;
  if (!saltB64 || !hashB64) return false;
  const salt = Buffer.from(saltB64, 'base64');
  if (salt.length === 0) return false;
  const expected = Buffer.from(hashB64, 'base64');
  if (expected.length === 0) return false;
  const actual = (await scryptAsync(plain.normalize('NFKC'), salt, expected.length, {
    N, r, p,
  })) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function validatePasswordPolicy(plain: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): void {
  if (typeof plain !== 'string') throw new InvalidPasswordError('Password must be a string');
  const len = [...plain.normalize('NFKC')].length;
  if (len < policy.minLength) throw new InvalidPasswordError(`Password must be at least ${policy.minLength} chars`);
  if (len > policy.maxLength) throw new InvalidPasswordError(`Password must be at most ${policy.maxLength} chars`);
  if (policy.requireDigit && !/\p{Nd}/u.test(plain)) throw new InvalidPasswordError('Password must contain a digit');
  if (policy.requireUpper && !/\p{Lu}/u.test(plain)) throw new InvalidPasswordError('Password must contain an uppercase letter');
  if (policy.requireLower && !/\p{Ll}/u.test(plain)) throw new InvalidPasswordError('Password must contain a lowercase letter');
  if (policy.requireSymbol && !/[\p{S}\p{P}]/u.test(plain)) throw new InvalidPasswordError('Password must contain a symbol');
}

function buildResetPayload(id: string, userId: string, expiresAtMs: number): string {
  return `${id}.${userId}.${expiresAtMs}`;
}

function computeResetHmac(payload: string): string {
  if (_resetSecret.length === 0) {
    throw new PasswordRecoveryError('Reset secret not configured — call setPasswordResetSecret first');
  }
  return createHmac(HMAC_ALGO, _resetSecret).update(payload).digest('base64url');
}

function encodeResetToken(id: string, userId: string, expiresAtMs: number, hmac: string): ResetToken {
  return toResetToken(`${id}.${userId}.${expiresAtMs}.${hmac}`);
}

function decodeResetToken(token: ResetToken): { id: string; userId: string; expiresAtMs: number; hmac: string } {
  const parts = token.split('.');
  if (parts.length !== 4) throw new InvalidResetTokenError('Reset token must have 4 dot parts');
  const [id, userId, expiresAtRaw, hmac] = parts;
  if (!id || !userId || !expiresAtRaw || !hmac) throw new InvalidResetTokenError('Reset token parts cannot be empty');
  const expiresAtMs = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) throw new InvalidResetTokenError('Reset token expiry must be positive');
  return { id, userId, expiresAtMs: Math.trunc(expiresAtMs), hmac };
}

/* ───────────────────────── 5. In-memory store + user registry ───────────────────────── */

const _resetStore = new Map<string, PasswordResetRequest>(); // key = id
const _lastResetByEmail = new Map<string, number>();         // email -> last requested ms

// Simulated user registry. Production swaps this for Prisma.
const _userRegistry = new Map<string, { email: string; passwordHash: string }>(); // userId -> record
const _userIndexByEmail = new Map<string, string>(); // email -> userId

export interface UpsertUserInput {
  readonly userId: string;
  readonly email: string;
  readonly passwordHash: string;
}

export function upsertUserForTest(input: UpsertUserInput): void {
  if (!input.userId || !input.email || !input.passwordHash) {
    throw new PasswordRecoveryError('userId, email, passwordHash required');
  }
  _userRegistry.set(input.userId, { email: input.email.toLowerCase(), passwordHash: input.passwordHash });
  _userIndexByEmail.set(input.email.toLowerCase(), input.userId);
}

export function clearUserRegistryForTest(): void {
  _userRegistry.clear();
  _userIndexByEmail.clear();
}

export function findUserByEmail(email: string): { userId: string; email: string; passwordHash: string } | null {
  const norm = email.toLowerCase();
  const userId = _userIndexByEmail.get(norm);
  if (!userId) return null;
  const rec = _userRegistry.get(userId);
  if (!rec) return null;
  return { userId, email: rec.email, passwordHash: rec.passwordHash };
}

export function findUserById(userId: string): { userId: string; email: string; passwordHash: string } | null {
  const rec = _userRegistry.get(userId);
  if (!rec) return null;
  return { userId, email: rec.email, passwordHash: rec.passwordHash };
}

export function setUserPasswordHash(userId: string, hash: string): void {
  if (!_userRegistry.has(userId)) throw new UserNotFoundError(userId);
  const rec = _userRegistry.get(userId)!;
  _userRegistry.set(userId, { email: rec.email, passwordHash: hash });
}

/* ───────────────────────── 6. Public API ───────────────────────── */

export interface RequestPasswordResetInput {
  readonly email: string;
  readonly options?: PasswordResetRequestOptions;
}

export async function requestPasswordReset(
  email: string,
  options: PasswordResetRequestOptions = {},
): Promise<PasswordResetRequest> {
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new PasswordRecoveryError('Email must be a valid address');
  }
  const norm = email.toLowerCase();
  const user = findUserByEmail(norm);
  if (!user) {
    // Run-rate-limit must still happen, but we silently return a fake request to avoid enumeration.
    const id = nextResetId();
    const expiresAtMs = Date.now() + (options.ttlMs ?? DEFAULT_RESET_TTL_MS);
    const hmac = computeResetHmac(buildResetPayload(id, 'unknown_user', expiresAtMs));
    const fakeToken = encodeResetToken(id, 'unknown_user', expiresAtMs, hmac);
    const now = Date.now();
    const last = _lastResetByEmail.get(norm) ?? 0;
    if (now - last < PASSWORD_RESET_RATE_LIMIT_MS) {
      throw new PasswordRateLimitError();
    }
    _lastResetByEmail.set(norm, now);
    return {
      id,
      userId: 'unknown_user',
      email: norm,
      token: fakeToken,
      expiresAt: new Date(expiresAtMs),
      createdAt: new Date(now),
      consumedAt: null,
      ip: options.ip ?? null,
    };
  }
  const now = Date.now();
  const last = _lastResetByEmail.get(norm) ?? 0;
  if (now - last < PASSWORD_RESET_RATE_LIMIT_MS) {
    throw new PasswordRateLimitError();
  }
  _lastResetByEmail.set(norm, now);
  const id = nextResetId();
  const ttlMs = options.ttlMs ?? DEFAULT_RESET_TTL_MS;
  const expiresAtMs = now + ttlMs;
  const hmac = computeResetHmac(buildResetPayload(id, user.userId, expiresAtMs));
  const token = encodeResetToken(id, user.userId, expiresAtMs, hmac);
  const request: PasswordResetRequest = {
    id,
    userId: user.userId,
    email: norm,
    token,
    expiresAt: new Date(expiresAtMs),
    createdAt: new Date(now),
    consumedAt: null,
    ip: options.ip ?? null,
  };
  _resetStore.set(id, request);
  return request;
}

export type ValidateResetTokenResult =
  | { readonly status: 'valid'; readonly request: PasswordResetRequest }
  | { readonly status: 'expired'; readonly request: PasswordResetRequest }
  | { readonly status: 'consumed'; readonly request: PasswordResetRequest }
  | { readonly status: 'invalid'; readonly reason: string };

export function validateResetToken(token: string | ResetToken): ValidateResetTokenResult {
  let decoded;
  try {
    decoded = decodeResetToken(toResetToken(typeof token === 'string' ? token : (token as string)));
  } catch (err) {
    return { status: 'invalid', reason: err instanceof Error ? err.message : 'decode failed' };
  }
  const expected = computeResetHmac(buildResetPayload(decoded.id, decoded.userId, decoded.expiresAtMs));
  const ab = Buffer.from(expected);
  const bb = Buffer.from(decoded.hmac);
  if (ab.length !== bb.length || !timingSafeEqual(ab, bb)) {
    return { status: 'invalid', reason: 'hmac mismatch' };
  }
  const request = _resetStore.get(decoded.id);
  if (!request) return { status: 'invalid', reason: 'not found' };
  if (request.consumedAt) return { status: 'consumed', request };
  if (request.expiresAt.getTime() <= Date.now()) return { status: 'expired', request };
  return { status: 'valid', request };
}

export interface ConsumeResetTokenInput {
  readonly token: string | ResetToken;
  readonly newPassword: string;
  readonly policy?: PasswordPolicy;
}

export async function consumeResetToken(input: ConsumeResetTokenInput): Promise<ConsumedResetResult> {
  if (!input || typeof input.newPassword !== 'string') {
    throw new InvalidPasswordError('newPassword is required');
  }
  const result = validateResetToken(input.token);
  if (result.status === 'invalid') throw new InvalidResetTokenError(result.reason);
  if (result.status === 'consumed') throw new ResetTokenAlreadyConsumedError();
  if (result.status === 'expired') throw new ExpiredResetTokenError();
  const user = findUserById(result.request.userId);
  if (!user) throw new UserNotFoundError(result.request.userId);
  const newHash = await hashPassword(input.newPassword, input.policy);
  setUserPasswordHash(user.userId, newHash);
  const consumedAt = new Date();
  const updated: PasswordResetRequest = { ...result.request, consumedAt };
  _resetStore.set(updated.id, updated);
  return { userId: user.userId, email: user.email, consumedAt, newPasswordHash: newHash };
}

/* ───────────────────────── 7. Default export audit ───────────────────────── */

export const __ALL_EXPORTS = {
  types: ['ResetToken', 'PasswordResetRequest', 'PasswordResetRequestOptions', 'ConsumedResetResult', 'PasswordPolicy', 'RequestPasswordResetInput', 'ConsumeResetTokenInput', 'ValidateResetTokenResult'],
  functions: [
    'setPasswordResetSecret', 'getPasswordResetSecretFingerprint', 'resetPasswordRecoveryEngine',
    'toResetToken', 'isResetToken',
    'hashPassword', 'verifyPassword', 'validatePasswordPolicy',
    'upsertUserForTest', 'clearUserRegistryForTest', 'findUserByEmail', 'findUserById', 'setUserPasswordHash',
    'requestPasswordReset', 'validateResetToken', 'consumeResetToken',
  ],
  constants: ['DEFAULT_RESET_TTL_MS', 'PASSWORD_RESET_RATE_LIMIT_MS', 'SCRYPT_N', 'SCRYPT_R', 'SCRYPT_P', 'SCRYPT_DK_LEN', 'SCRYPT_SALT_BYTES', 'DEFAULT_PASSWORD_POLICY'],
  errors: ['PasswordRecoveryError', 'InvalidPasswordError', 'InvalidResetTokenError', 'ExpiredResetTokenError', 'ResetTokenAlreadyConsumedError', 'UserNotFoundError', 'PasswordRateLimitError'],
} as const;
