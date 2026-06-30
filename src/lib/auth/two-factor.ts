// Auth Two-Factor Engine — wave 68
// RFC 6238 TOTP (HMAC-SHA1, 6-digit codes, 30s step) + single-use backup codes.
// TOTP secret: 160-bit random, base32-encoded (RFC 4648).
// Backup codes: 10 codes × 8 base32 chars each, single-use.
//
// Sections:
//  1. Types
//  2. Errors
//  3. Constants
//  4. Base32 codec
//  5. TOTP engine (RFC 6238)
//  6. Backup code management (in-memory per user)
//  7. Public API: generateTOTPSecret, generateTOTP, verifyTOTP, generateBackupCodes, verifyBackupCode, get2FAStatus, disable2FA
//  8. Default export audit

import { createHmac, randomBytes } from 'node:crypto';

/* ───────────────────────── 1. Types ───────────────────────── */

export interface TwoFactorSetup {
  readonly userId: string;
  readonly secret: TOTPSecret;
  readonly backupCodes: ReadonlyArray<string>;
  readonly enabledAt: Date;
}

export type TOTPSecret = string & { readonly __brand: 'TOTPSecret' };

export interface VerifyTOTPOptions {
  readonly window?: number;
  readonly nowMs?: number;
}

export interface TwoFactorConfig {
  readonly stepSec?: number;
  readonly digits?: number;
  readonly algorithm?: 'sha1' | 'sha256' | 'sha512';
}

export const DEFAULT_2FA_CONFIG: TwoFactorConfig = {
  stepSec: 30,
  digits: 6,
  algorithm: 'sha1',
};

export type TwoFactorStatus = 'disabled' | 'enabled';

/* ───────────────────────── 2. Errors ───────────────────────── */

export class TwoFactorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TwoFactorError';
  }
}

export class InvalidTOTPSecretError extends TwoFactorError {
  constructor(message = 'Invalid TOTP secret') {
    super(message);
    this.name = 'InvalidTOTPSecretError';
  }
}

export class InvalidTOTPCodeError extends TwoFactorError {
  constructor(message = 'Invalid TOTP code') {
    super(message);
    this.name = 'InvalidTOTPCodeError';
  }
}

export class TwoFactorAlreadyEnabledError extends TwoFactorError {
  constructor(message = 'Two-factor is already enabled for this user') {
    super(message);
    this.name = 'TwoFactorAlreadyEnabledError';
  }
}

export class TwoFactorNotEnabledError extends TwoFactorError {
  constructor(message = 'Two-factor is not enabled for this user') {
    super(message);
    this.name = 'TwoFactorNotEnabledError';
  }
}

export class BackupCodeError extends TwoFactorError {
  constructor(message = 'Backup code error') {
    super(message);
    this.name = 'BackupCodeError';
  }
}

/* ───────────────────────── 3. Constants ───────────────────────── */

export const TOTP_SECRET_BYTES = 20; // 160 bits per RFC 4226
export const BACKUP_CODE_COUNT_DEFAULT = 10;
export const BACKUP_CODE_BYTES = 5; // 5 bytes = 8 base32 chars
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/* ───────────────────────── 4. Base32 codec ───────────────────────── */

export function base32Encode(buf: Buffer): string {
  if (buf.length === 0) return '';
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(str: string): Buffer {
  const cleaned = str.replace(/=+$/g, '').toUpperCase();
  if (cleaned.length === 0) return Buffer.alloc(0);
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) throw new InvalidTOTPSecretError(`Invalid base32 character: ${ch}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function toTOTPSecret(raw: string): TOTPSecret {
  if (typeof raw !== 'string' || raw.length < 16) {
    throw new InvalidTOTPSecretError('TOTP secret must be a base32 string of length >= 16');
  }
  return raw as TOTPSecret;
}

export function isTOTPSecret(v: unknown): v is TOTPSecret {
  return typeof v === 'string' && v.length >= 16 && /^[A-Z2-7]+=*$/.test(v);
}

/* ───────────────────────── 5. TOTP engine ───────────────────────── */

function hotp(secret: Buffer, counter: bigint, digits: number, algorithm: 'sha1' | 'sha256' | 'sha512'): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(counter);
  const digest = createHmac(algorithm, secret).update(buf).digest();
  // Dynamic truncation per RFC 4226 §5.3
  const offset = digest[digest.length - 1] & 0x0f;
  const binCode =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  const otp = binCode % 10 ** digits;
  return otp.toString().padStart(digits, '0');
}

export function generateTOTPSecret(bytes: number = TOTP_SECRET_BYTES): TOTPSecret {
  if (!Number.isFinite(bytes) || bytes < 16) {
    throw new InvalidTOTPSecretError('TOTP secret must be at least 16 bytes');
  }
  const buf = randomBytes(bytes);
  return toTOTPSecret(base32Encode(buf));
}

export function generateTOTP(
  secret: TOTPSecret | string,
  config: TwoFactorConfig = DEFAULT_2FA_CONFIG,
  nowMs: number = Date.now(),
): string {
  const stepSec = config.stepSec ?? 30;
  const digits = config.digits ?? 6;
  const algorithm = config.algorithm ?? 'sha1';
  const raw = typeof secret === 'string' ? toTOTPSecret(secret) : secret;
  const secretBuf = base32Decode(raw.replace(/=+$/g, ''));
  if (secretBuf.length === 0) throw new InvalidTOTPSecretError('Decoded secret is empty');
  const counter = BigInt(Math.floor(nowMs / 1000 / stepSec));
  return hotp(secretBuf, counter, digits, algorithm);
}

export function verifyTOTP(
  secret: TOTPSecret | string,
  code: string,
  config: TwoFactorConfig = DEFAULT_2FA_CONFIG,
  options: VerifyTOTPOptions = {},
): boolean {
  if (typeof code !== 'string' || code.length === 0) return false;
  const stepSec = config.stepSec ?? 30;
  const digits = config.digits ?? 6;
  const algorithm = config.algorithm ?? 'sha1';
  const window = options.window ?? 1;
  const nowMs = options.nowMs ?? Date.now();
  if (!/^\d+$/.test(code)) return false;
  if (code.length !== digits) return false;
  const raw = typeof secret === 'string' ? toTOTPSecret(secret) : secret;
  const secretBuf = base32Decode(raw.replace(/=+$/g, ''));
  if (secretBuf.length === 0) return false;
  const counter = BigInt(Math.floor(nowMs / 1000 / stepSec));
  for (let w = -window; w <= window; w += 1) {
    const candidate = hotp(secretBuf, counter + BigInt(w), digits, algorithm);
    if (candidate === code) return true;
  }
  return false;
}

/* ───────────────────────── 6. Backup-code ledger ───────────────────────── */

interface TwoFactorEntry {
  readonly setup: TwoFactorSetup;
  readonly remainingCodes: Set<string>;
}

const _ledger = new Map<string, TwoFactorEntry>(); // userId -> entry

function generateOneBackupCode(): string {
  const buf = randomBytes(BACKUP_CODE_BYTES);
  return `${base32Encode(buf).slice(0, 4)}-${base32Encode(randomBytes(BACKUP_CODE_BYTES)).slice(0, 4)}`;
}

export interface EnableTwoFactorOptions {
  readonly count?: number;
}

export function enableTwoFactor(
  userId: string,
  options: EnableTwoFactorOptions = {},
): TwoFactorSetup {
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new TwoFactorError('userId required');
  }
  if (_ledger.has(userId)) {
    throw new TwoFactorAlreadyEnabledError(userId);
  }
  const count = options.count ?? BACKUP_CODE_COUNT_DEFAULT;
  if (!Number.isFinite(count) || count < 1 || count > 100) {
    throw new TwoFactorError('Backup code count must be between 1 and 100');
  }
  const codes: string[] = [];
  const set = new Set<string>();
  while (codes.length < count) {
    const code = generateOneBackupCode();
    if (!set.has(code)) {
      set.add(code);
      codes.push(code);
    }
  }
  const secret = generateTOTPSecret();
  const setup: TwoFactorSetup = {
    userId,
    secret,
    backupCodes: codes,
    enabledAt: new Date(),
  };
  _ledger.set(userId, { setup, remainingCodes: set });
  return setup;
}

export function disableTwoFactor(userId: string): boolean {
  if (!_ledger.has(userId)) {
    throw new TwoFactorNotEnabledError(userId);
  }
  return _ledger.delete(userId);
}

export function getTwoFactorStatus(userId: string): TwoFactorStatus {
  return _ledger.has(userId) ? 'enabled' : 'disabled';
}

export function getTwoFactorSetup(userId: string): TwoFactorSetup | null {
  return _ledger.get(userId)?.setup ?? null;
}

export function verifyBackupCode(userId: string, code: string): boolean {
  const entry = _ledger.get(userId);
  if (!entry) throw new TwoFactorNotEnabledError(userId);
  if (typeof code !== 'string' || code.length === 0) return false;
  if (entry.remainingCodes.has(code)) {
    entry.remainingCodes.delete(code);
    return true;
  }
  return false;
}

export function generateBackupCodes(userId: string, count: number = BACKUP_CODE_COUNT_DEFAULT): ReadonlyArray<string> {
  if (!_ledger.has(userId)) throw new TwoFactorNotEnabledError(userId);
  if (!Number.isFinite(count) || count < 1 || count > 100) {
    throw new TwoFactorError('Backup code count must be between 1 and 100');
  }
  const entry = _ledger.get(userId)!;
  const codes: string[] = [];
  const set = new Set<string>();
  while (codes.length < count) {
    const code = generateOneBackupCode();
    if (!set.has(code)) {
      set.add(code);
      codes.push(code);
    }
  }
  // Append: keep remaining codes so user has both old + new pool.
  for (const c of codes) entry.remainingCodes.add(c);
  return codes;
}

export function remainingBackupCodeCount(userId: string): number {
  return _ledger.get(userId)?.remainingCodes.size ?? 0;
}

export function resetTwoFactorEngine(): void {
  _ledger.clear();
}

/* ───────────────────────── 7. Default export audit ───────────────────────── */

export const __ALL_EXPORTS = {
  types: ['TwoFactorSetup', 'TOTPSecret', 'VerifyTOTPOptions', 'TwoFactorConfig', 'TwoFactorStatus', 'EnableTwoFactorOptions'],
  functions: [
    'base32Encode', 'base32Decode',
    'toTOTPSecret', 'isTOTPSecret',
    'generateTOTPSecret', 'generateTOTP', 'verifyTOTP',
    'enableTwoFactor', 'disableTwoFactor', 'getTwoFactorStatus', 'getTwoFactorSetup',
    'verifyBackupCode', 'generateBackupCodes', 'remainingBackupCodeCount',
    'resetTwoFactorEngine',
  ],
  constants: ['TOTP_SECRET_BYTES', 'BACKUP_CODE_COUNT_DEFAULT', 'BACKUP_CODE_BYTES', 'DEFAULT_2FA_CONFIG'],
  errors: ['TwoFactorError', 'InvalidTOTPSecretError', 'InvalidTOTPCodeError', 'TwoFactorAlreadyEnabledError', 'TwoFactorNotEnabledError', 'BackupCodeError'],
} as const;
