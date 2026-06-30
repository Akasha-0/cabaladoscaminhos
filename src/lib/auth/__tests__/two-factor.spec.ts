/**
 * Two-Factor Spec — wave 68
 * Self-running harness.
 *
 * Covers: base32 codec, TOTPSecret branding, generateTOTPSecret,
 * generateTOTP (RFC 6238 math), verifyTOTP (window drift, length checks),
 * enableTwoFactor, disableTwoFactor, getTwoFactorStatus,
 * generateBackupCodes, verifyBackupCode (atomic single-use),
 * resetTwoFactorEngine.
 */

import {
  base32Encode, base32Decode, toTOTPSecret, isTOTPSecret,
  generateTOTPSecret, generateTOTP, verifyTOTP,
  enableTwoFactor, disableTwoFactor, getTwoFactorStatus, getTwoFactorSetup,
  verifyBackupCode, generateBackupCodes, remainingBackupCodeCount,
  resetTwoFactorEngine,
  BACKUP_CODE_COUNT_DEFAULT, TOTP_SECRET_BYTES, DEFAULT_2FA_CONFIG,
  InvalidTOTPSecretError, InvalidTOTPCodeError, TwoFactorAlreadyEnabledError, TwoFactorNotEnabledError, BackupCodeError, TwoFactorError,
} from '../two-factor.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual === expected) passed += 1;
  else { failed += 1; failures.push(`${label}: expected ${String(expected)}, got ${String(actual)}`); }
}
function expectTrue(cond: boolean, label: string): void {
  if (cond) passed += 1;
  else { failed += 1; failures.push(label); }
}
async function expectThrows(fn: () => unknown | Promise<unknown>, ctor: new (...a: never[]) => Error, label: string): Promise<void> {
  let caught: unknown = null;
  try { await fn(); } catch (err) { caught = err; }
  if (caught === null) { failed += 1; failures.push(`${label}: no throw`); return; }
  if (caught instanceof ctor) passed += 1;
  else { failed += 1; failures.push(`${label}: threw ${(caught as Error).name}, not ${ctor.name}`); }
}

async function run(): Promise<void> {
  resetTwoFactorEngine();

  // ── base32 codec ──
  const encoded = base32Encode(Buffer.from([0x00, 0xff, 0x7f, 0x80, 0xab]));
  expectTrue(encoded.length > 0, 'base32 encoded');
  const decoded = base32Decode(encoded);
  expectTrue(decoded[0] === 0x00 && decoded[1] === 0xff && decoded[2] === 0x7f && decoded[3] === 0x80 && decoded[4] === 0xab, 'base32 roundtrip');
  const empty = base32Decode('');
  expectEqual(empty.length, 0, 'base32 empty decoded');
  const empty2 = base32Encode(Buffer.alloc(0));
  expectEqual(empty2, '', 'base32 empty encoded');
  await expectThrows(() => base32Decode('!!'), InvalidTOTPSecretError, 'invalid base32 char throws');

  // ── branded TOTPSecret ──
  expectTrue(isTOTPSecret('ABCDEFGHIJKLMNOP'), 'valid branded');
  expectEqual(isTOTPSecret('abc'), false, 'short not branded');
  expectEqual(isTOTPSecret(123), false, 'number not branded');
  await expectThrows(() => toTOTPSecret('short'), InvalidTOTPSecretError, 'short raw rejected');

  // ── generateTOTPSecret ──
  const secret1 = generateTOTPSecret();
  expectTrue(secret1.length >= 32, 'secret is base32 long');
  expectEqual(getTwoFactorStatus('user-1'), 'disabled', 'user starts disabled');
  await expectThrows(() => generateTOTPSecret(4), InvalidTOTPSecretError, 'tiny bytes rejected');

  // ── generateTOTP math ──
  const code = generateTOTP(secret1);
  expectEqual(code.length, 6, 'default code is 6 digits');
  expectEqual(/^\d{6}$/.test(code), true, 'code is 6 digits');
  expectEqual(verifyTOTP(secret1, code), true, 'fresh code verifies');

  // ── drift window ──
  const stepSec = DEFAULT_2FA_CONFIG.stepSec ?? 30;
  const nowMinus30 = generateTOTP(secret1, {}, Date.now() - stepSec * 1000);
  expectEqual(verifyTOTP(secret1, nowMinus30, {}, { window: 1 }), true, '30s-drift accepted with window=1');
  const farInPast = generateTOTP(secret1, {}, Date.now() - 5 * 60 * 1000);
  expectEqual(verifyTOTP(secret1, farInPast, {}, { window: 1 }), false, 'old code rejected');

  // ── bad code → false (not throw) ──
  expectEqual(verifyTOTP(secret1, '000000', {}, { window: 0 }), false, '000000 not in window 0 unless lucky');
  expectEqual(verifyTOTP(secret1, 'abc'), false, 'non-digit code false');
  expectEqual(verifyTOTP(secret1, ''), false, 'empty code false');

  // ── enable 2FA ──
  const setup = enableTwoFactor('user-1', { count: 12 });
  expectEqual(setup.userId, 'user-1', 'setup.userId');
  expectTrue(setup.backupCodes.length === 12, 'backup codes count 12');
  expectTrue(setup.backupCodes.every(c => /^[A-Z2-7]{4}-[A-Z2-7]{4}$/.test(c)), 'backup codes match pattern');
  expectTrue(isTOTPSecret(setup.secret), 'setup secret is branded');
  expectEqual(getTwoFactorStatus('user-1'), 'enabled', 'status enabled after setup');
  expectEqual(getTwoFactorSetup('user-1')?.userId, 'user-1', 'getTwoFactorSetup returns setup');

  // ── enable twice throws ──
  await expectThrows(() => enableTwoFactor('user-1'), TwoFactorAlreadyEnabledError, 'double enable throws');

  // ── backup code consume ──
  const c0 = setup.backupCodes[0]!;
  expectEqual(verifyBackupCode('user-1', c0), true, 'first backup code verifies');
  expectEqual(verifyBackupCode('user-1', c0), false, 'second use of same code fails');
  expectEqual(remainingBackupCodeCount('user-1'), 11, '11 remaining after 1 use');

  // ── invalid backup code ──
  expectEqual(verifyBackupCode('user-1', 'WRONG-CODE'), false, 'invalid backup code false');

  // ── generate new backup codes (appends pool) ──
  const newCodes = generateBackupCodes('user-1', 5);
  expectEqual(newCodes.length, 5, 'new codes count 5');
  const c1 = newCodes[0]!;
  expectEqual(verifyBackupCode('user-1', c1), true, 'new code verifies');
  // Original codes (except used) still work
  expectEqual(verifyBackupCode('user-1', setup.backupCodes[1]!), true, 'original code 2 still works');

  // ── disable 2FA ──
  expectEqual(disableTwoFactor('user-1'), true, 'disable returns true');
  expectEqual(getTwoFactorStatus('user-1'), 'disabled', 'status disabled after disable');

  // ── disable throws when not enabled ──
  await expectThrows(() => disableTwoFactor('user-1'), TwoFactorNotEnabledError, 'disable not-enabled throws');
  await expectThrows(() => verifyBackupCode('user-1', 'any'), TwoFactorNotEnabledError, 'verifyBackup on not-enabled throws');

  // ── resetTwoFactorEngine ──
  enableTwoFactor('user-reset');
  resetTwoFactorEngine();
  expectEqual(getTwoFactorStatus('user-reset'), 'disabled', 'reset clears all users');

  // ── enable w/ invalid count ──
  await expectThrows(() => enableTwoFactor('user-2', { count: 0 }), TwoFactorError, 'count 0 throws');
  await expectThrows(() => enableTwoFactor('user-2', { count: 999 }), TwoFactorError, 'count 999 throws');

  // ── Summary ──
  console.log(`two-factor.spec.ts: ${passed}/${passed + failed} PASS`);
  if (failed > 0) {
    console.error('FAILURES:');
    for (const f of failures) console.error('  -', f);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('two-factor.spec.ts: harness crashed:', err);
  process.exit(1);
});
