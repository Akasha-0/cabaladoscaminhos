/**
 * Password Recovery Spec — wave 68
 * Self-running harness.
 *
 * Covers: hashPassword + verifyPassword + format,
 * password policy enforcement (5 dimensions),
 * requestPasswordReset (existing + unknown user),
 * validateResetToken (valid / expired / consumed / hmac-mismatch),
 * consumeResetToken (atomic flow + invalidate),
 * rate limiting, reset engine.
 */

import {
  hashPassword, verifyPassword, validatePasswordPolicy,
  requestPasswordReset, validateResetToken, consumeResetToken,
  upsertUserForTest, clearUserRegistryForTest, findUserByEmail, findUserById,
  setPasswordResetSecret, resetPasswordRecoveryEngine, clearRateLimitsForTest,
  DEFAULT_PASSWORD_POLICY,
  InvalidPasswordError, InvalidResetTokenError, ExpiredResetTokenError, ResetTokenAlreadyConsumedError, UserNotFoundError, PasswordRateLimitError,
} from '../password-recovery.ts';

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
  resetPasswordRecoveryEngine();
  clearUserRegistryForTest();
  setPasswordResetSecret('d'.repeat(32));
  upsertUserForTest({ userId: 'user-1', email: 'alice@example.com', passwordHash: 'placeholder' });
  upsertUserForTest({ userId: 'user-2', email: 'bob@example.com', passwordHash: 'placeholder' });

  // ── password policy ──
  expectTrue(DEFAULT_PASSWORD_POLICY.minLength === 8, 'default min 8');
  await expectThrows(() => validatePasswordPolicy('abc'), InvalidPasswordError, 'too short');
  await expectThrows(() => validatePasswordPolicy('alllowercase'), InvalidPasswordError, 'no digit or uppercase');
  await expectThrows(() => validatePasswordPolicy('abcdefg1'), InvalidPasswordError, 'no uppercase');
  await expectThrows(() => validatePasswordPolicy('ABCDEFG1'), InvalidPasswordError, 'no lowercase');
  expectTrue(validatePasswordPolicy('Abcd1234') === undefined, 'valid password passes default policy');
  // symbol-required policy
  await expectThrows(() => validatePasswordPolicy('Abcd1234', { ...DEFAULT_PASSWORD_POLICY, requireSymbol: true }), InvalidPasswordError, 'no symbol when required');
  expectTrue(validatePasswordPolicy('Abcd12!@', { ...DEFAULT_PASSWORD_POLICY, requireSymbol: true }) === undefined, 'symbol policy accepts valid');

  // ── hash + verify ──
  const hash1 = await hashPassword('HelloWorld123');
  expectTrue(hash1.startsWith('scrypt$'), 'hash has scrypt prefix');
  const parts = hash1.split('$');
  expectEqual(parts.length, 6, 'hash has 6 parts');
  expectEqual(parts[1], '16384', 'hash has N=16384');
  expectEqual(parts[2], '8', 'hash has r=8');
  expectEqual(parts[3], '1', 'hash has p=1');
  expectEqual(await verifyPassword('HelloWorld123', hash1), true, 'verify correct password');
  expectEqual(await verifyPassword('WrongPassword', hash1), false, 'verify wrong password');
  expectEqual(await verifyPassword('HelloWorld123', 'garbage'), false, 'verify malformed hash');

  // ── different salts produce different hashes ──
  const hash2 = await hashPassword('HelloWorld123');
  expectTrue(hash1 !== hash2, 'different salt produces different hash');

  // ── requestPasswordReset for known user ──
  const req1 = await requestPasswordReset('alice@example.com', { ip: '1.2.3.4' });
  expectEqual(req1.userId, 'user-1', 'request resolves userId');
  expectEqual(req1.email, 'alice@example.com', 'request stores email');
  expectTrue(req1.token.split('.').length === 4, 'reset token has 4 parts');
  expectEqual(req1.ip, '1.2.3.4', 'ip captured');
  expectTrue(req1.consumedAt === null, 'consumedAt is null');

  // ── validate valid token ──
  const v1 = validateResetToken(req1.token);
  expectEqual(v1.status, 'valid', 'fresh reset token validates');

  // ── consume atomic flow ──
  const consumed = await consumeResetToken({ token: req1.token, newPassword: 'NewPass456' });
  expectEqual(consumed.userId, 'user-1', 'consumed.userId correct');
  expectTrue(consumed.newPasswordHash.startsWith('scrypt$'), 'new hash has scrypt prefix');
  expectEqual(consumed.consumedAt instanceof Date, true, 'consumedAt is Date');
  const updated = findUserById('user-1');
  expectEqual(updated?.passwordHash, consumed.newPasswordHash, 'user password hash updated');
  expectTrue(await verifyPassword('NewPass456', consumed.newPasswordHash), 'new password verifies');

  // ── reuse of consumed token rejected ──
  const vReuse = validateResetToken(req1.token);
  expectEqual(vReuse.status, 'consumed', 'consumed token reports consumed');
  let reuseErr = false;
  try { await consumeResetToken({ token: req1.token, newPassword: 'AnotherPass789' }); }
  catch (e) { if (e instanceof ResetTokenAlreadyConsumedError) reuseErr = true; }
  expectTrue(reuseErr, 'reusing consumed throws ResetTokenAlreadyConsumed');

  // ── invalid reset token ──
  const vInvalid = validateResetToken('not.a.real.token');
  expectEqual(vInvalid.status, 'invalid', 'malformed reset token invalid');

  // ── hmac mismatch token ──
  clearRateLimitsForTest();
  const req2 = await requestPasswordReset('bob@example.com');
  const tampered = req2.token.replace(/.[A-Za-z0-9_-]+$/, '.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  const vTamper = validateResetToken(tampered);
  expectEqual(vTamper.status, 'invalid', 'tampered token invalid');

  // ── expired token ──
  clearRateLimitsForTest();
  const req3 = await requestPasswordReset('bob@example.com', { ttlMs: 30 });
  await new Promise(r => setTimeout(r, 60));
  const vExpired = validateResetToken(req3.token);
  expectEqual(vExpired.status, 'expired', 'expired token reports expired');
  let expErr = false;
  try { await consumeResetToken({ token: req3.token, newPassword: 'ValidPass789' }); }
  catch (e) { if (e instanceof ExpiredResetTokenError) expErr = true; }
  expectTrue(expErr, 'consuming expired throws ExpiredResetToken');

  // ── unknown user enumeration-safe: returns fake but with rate limit ──
  // wait the rate limit window first
  clearRateLimitsForTest();
  await new Promise(r => setTimeout(r, 50));
  const req4 = await requestPasswordReset('unknown@example.com');
  expectEqual(req4.userId, 'unknown_user', 'unknown user produces unknown_user id');

  // ── rate limit ──
  clearRateLimitsForTest();
  await requestPasswordReset('alice@example.com'); // first request establishes the window
  let limitErr = false;
  try { await requestPasswordReset('alice@example.com'); } // second within window throws
  catch (e) { if (e instanceof PasswordRateLimitError) limitErr = true; }
  expectTrue(limitErr, 'rate limit fires for repeated requests');

  // ── empty email rejected ──
  let emailErr = false;
  try { await requestPasswordReset('not-an-email'); }
  catch (e) { if (e instanceof Error) emailErr = true; }
  expectTrue(emailErr, 'non-email rejected');

  // ── findUserByEmail / findUserById ──
  const found = findUserByEmail('alice@example.com');
  expectEqual(found?.userId, 'user-1', 'findUserByEmail works');
  expectEqual(findUserByEmail('nobody@example.com'), null, 'unknown email null');
  expectEqual(findUserById('user-1')?.email, 'alice@example.com', 'findUserById works');
  expectEqual(findUserById('unknown'), null, 'unknown user null');

  // ── invalid password on consume ──
  clearRateLimitsForTest();
  await new Promise(r => setTimeout(r, 1100));
  const req5 = await requestPasswordReset('bob@example.com');
  let passErr = false;
  try { await consumeResetToken({ token: req5.token, newPassword: 'abc' }); }
  catch (e) { if (e instanceof InvalidPasswordError) passErr = true; }
  expectTrue(passErr, 'consume with weak password throws InvalidPassword');

  // ── Summary ──
  console.log(`password-recovery.spec.ts: ${passed}/${passed + failed} PASS`);
  if (failed > 0) {
    console.error('FAILURES:');
    for (const f of failures) console.error('  -', f);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('password-recovery.spec.ts: harness crashed:', err);
  process.exit(1);
});
