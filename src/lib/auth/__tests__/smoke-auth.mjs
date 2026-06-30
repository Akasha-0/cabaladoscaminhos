// Auth Smoke — wave 68
// Runtime smoke using node --experimental-strip-types.
// Exercises critical paths end-to-end without test runners.

import { performance } from 'node:perf_hooks';

const results = [];
let totalChecks = 0;
let passedChecks = 0;

function check(label, cond) {
  totalChecks += 1;
  if (cond) passedChecks += 1;
  else results.push(`FAIL: ${label}`);
}

async function main() {
  const t0 = performance.now();

  // ── 1. Session lifecycle ──
  const sessionMod = await import('../session-engine.ts');
  sessionMod.resetSessionEngine();
  sessionMod.setSessionHmacSecret('a'.repeat(32));
  const s = await sessionMod.createSession('smoke-user', { metadata: { ip: '127.0.0.1', userAgent: 'smoke', deviceFingerprint: null } });
  check('1.1 createSession returns token with 4 parts', s.token.split('.').length === 4);
  check('1.2 validateSession returns valid for fresh token', (await sessionMod.validateSession(s.token)).status === 'valid');
  const v1 = await sessionMod.validateSession(s.token);
  check('1.3 validate valid returns same session', v1.status === 'valid' && v1.session.id === s.id);
  const refreshed = await sessionMod.refreshSession(s.token, { ttlMs: 60_000 });
  check('1.4 refresh extends expiry to a new token', refreshed.refreshed && refreshed.session.token !== s.token);
  check('1.5 refreshed token validates', (await sessionMod.validateSession(refreshed.session.token)).status === 'valid');
  const r = await sessionMod.revokeSession(refreshed.session.token);
  check('1.6 revoke sets revokedAt', r.revokedAt !== null);
  check('1.7 revoked token reports revoked', (await sessionMod.validateSession(refreshed.session.token)).status === 'revoked');

  // ── 2. Password hash + verify ──
  const pwMod = await import('../password-recovery.ts');
  pwMod.clearUserRegistryForTest();
  const hashed = await pwMod.hashPassword('SmokePass123');
  check('2.1 hash is scrypt-formatted', hashed.startsWith('scrypt$16384$8$1$'));
  check('2.2 correct password verifies', await pwMod.verifyPassword('SmokePass123', hashed));
  check('2.3 wrong password rejects', !(await pwMod.verifyPassword('Wrong', hashed)));

  // ── 3. Reset request + consume ──
  pwMod.setPasswordResetSecret('e'.repeat(32));
  pwMod.upsertUserForTest({ userId: 'smoke-user', email: 'smoke@example.com', passwordHash: hashed });
  pwMod.clearRateLimitsForTest();
  const req = await pwMod.requestPasswordReset('smoke@example.com');
  check('3.1 reset token is 4-part branded', req.token.split('.').length === 4 && pwMod.isResetToken(req.token));
  const consumed = await pwMod.consumeResetToken({ token: req.token, newPassword: 'NewSmoke456' });
  check('3.2 consume returns scrypt hash', consumed.newPasswordHash.startsWith('scrypt$'));
  check('3.3 consumed invalidates token', pwMod.validateResetToken(req.token).status === 'consumed');

  // ── 4. TOTP generate + verify ──
  const totpMod = await import('../two-factor.ts');
  totpMod.resetTwoFactorEngine();
  const secret = totpMod.generateTOTPSecret();
  check('4.1 secret is base32 long', secret.length >= 32);
  const code = totpMod.generateTOTP(secret);
  check('4.2 code is 6 digits', /^\d{6}$/.test(code));
  check('4.3 verifyTOTP true for fresh code', totpMod.verifyTOTP(secret, code));
  check('4.4 verifyTOTP false for wrong code', !totpMod.verifyTOTP(secret, '000000', {}, { window: 0 }));

  // ── 5. 2FA enable + backup code ──
  const setup = totpMod.enableTwoFactor('smoke-user', { count: 10 });
  check('5.1 backupCodes count 10', setup.backupCodes.length === 10);
  check('5.2 backup code format matches 4-4 base32', setup.backupCodes.every(c => /^[A-Z2-7]{4}-[A-Z2-7]{4}$/.test(c)));
  const consumed1 = setup.backupCodes[0];
  check('5.3 verifyBackupCode true first use', totpMod.verifyBackupCode('smoke-user', consumed1));
  check('5.4 verifyBackupCode false second use', !totpMod.verifyBackupCode('smoke-user', consumed1));

  // ── 6. OAuth state machine ──
  const oauthMod = await import('../oauth-callback.ts');
  oauthMod.resetOAuthEngine();
  oauthMod.setOAuthStateSecret('e'.repeat(32));
  const state = oauthMod.issueOAuthState({ provider: 'github' });
  check('6.1 state is 2-part', state.token.split('.').length === 2);
  const v = oauthMod.validateOAuthState(state.token);
  check('6.2 state valid on issue', v.valid);
  await oauthMod.handleOAuthCallback({ provider: 'github', code: 'smoke-code', state: state.token });
  check('6.3 state consumed after callback', !oauthMod.validateOAuthState(state.token).valid);
  const cb = await oauthMod.handleOAuthCallback({ provider: 'github', code: 'smoke-code', state: oauthMod.issueOAuthState({ provider: 'github' }).token });
  check('6.4 second callback links_existing', cb.status === 'linked_existing');

  // ── 7. Audit log ──
  const auditMod = await import('../audit.ts');
  auditMod.resetAuditLog();
  auditMod.logAuthEvent({ userId: 'smoke-audit', type: 'login', ip: '127.0.0.1', metadata: { method: 'password' } });
  auditMod.logAuthEvent({ userId: 'smoke-audit', type: 'login_failed', ip: '127.0.0.1', metadata: { reason: 'wrong_password' } });
  auditMod.logAuthEvent({ userId: 'smoke-audit', type: '2fa_enabled', ip: '127.0.0.1' });
  const qAll = await auditMod.queryAuthEvents({ userId: 'smoke-audit' });
  check('7.1 query returns 3 events', qAll.events.length === 3 && qAll.total === 3);
  const qType = await auditMod.queryAuthEvents({ userId: 'smoke-audit', filter: { types: ['login_failed'] } });
  check('7.2 type filter returns 1', qType.events.length === 1 && qType.events[0].type === 'login_failed');
  const c = auditMod.countByType('smoke-audit');
  check('7.3 countByType.login_failed === 1', c.login_failed === 1);

  const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
  console.log(`\n=== AUTH SMOKE ${passedChecks}/${totalChecks} PASS (${elapsed}s) ===`);
  if (passedChecks !== totalChecks) {
    for (const r of results) console.error(r);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('SMOKE CRASHED:', err);
  process.exit(1);
});
