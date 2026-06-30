// ============================================================================
// W72 Auth Pages — API Smoke Test
// ----------------------------------------------------------------------------
// Calls handleLogin/handleSignup/handleForgotPassword/handleResetPassword/
// handleVerifyEmail directly (no Next.js runtime, no real server). Each
// test:
//   1. Calls the handler with a typed input
//   2. Asserts the returned { status, body }
//
// This exercises the same business logic the /api/auth/* route handlers
// use; the route files are thin HTTP adapters.
// ============================================================================

import {
  handleLogin,
  handleSignup,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
} from './api-handlers.ts';
import { clearAllUsersForTest } from './user-store.ts';
import {
  clearRateLimitsForTest,
  resetPasswordRecoveryEngine,
  requestPasswordReset,
} from '../auth/password-recovery.ts';
import { setSessionHmacSecret, resetSessionEngine } from '../auth/session-engine.ts';
import { issueEmailVerificationToken, bootstrapAuthEngines as bootstrapEngines } from './server-bootstrap.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertIt(condition: unknown, label: string): void {
  if (condition) {
    passed += 1;
    process.stdout.write(`  ✓ ${label}\n`);
  } else {
    failed += 1;
    failures.push(label);
    process.stdout.write(`  ✗ ${label}\n`);
  }
}

function header(title: string): void {
  process.stdout.write(`\n── ${title} ──\n`);
}

setSessionHmacSecret('a-very-long-test-secret-for-smoke-32+');
function freshState() {
  clearAllUsersForTest();
  clearRateLimitsForTest();
  resetPasswordRecoveryEngine();
  resetSessionEngine();
  // Re-set secret after reset (reset clears it)
  setSessionHmacSecret('a-very-long-test-secret-for-smoke-32+');
  // Re-bootstrap reset secret via api-handlers
  bootstrapEngines(true);
}

const TEST_EMAIL = `smoke+${Date.now()}@akasha.test`;
const TEST_PASSWORD = 'SenhaForte123';

// ============================================================================
// handleSignup
// ============================================================================

header('handleSignup');

freshState();

const r1 = await handleSignup({
  displayName: 'Smoke Test',
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  confirmPassword: TEST_PASSWORD,
  acceptTerms: true,
  birthDataOptIn: true,
  birthDate: '1990-04-15',
});
assertIt(r1.status === 200, 'signup: returns 200');
assertIt((r1.body as { ok?: boolean }).ok === true, 'signup: ok=true');
assertIt((r1.body as { email?: string }).email === TEST_EMAIL, `signup: echoes email (got ${(r1.body as { email?: string }).email})`);
const signupUserId = (r1.body as { userId?: string }).userId;
assertIt(typeof signupUserId === 'string', 'signup: returns userId');

const r1b = await handleSignup({
  displayName: 'Bad',
  email: 'not-an-email',
  password: TEST_PASSWORD,
  confirmPassword: TEST_PASSWORD,
  acceptTerms: true,
});
assertIt(r1b.status === 400, 'signup: rejects bad email with 400');

const r1c = await handleSignup({
  displayName: 'Smoke Test',
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  confirmPassword: TEST_PASSWORD,
  acceptTerms: true,
});
assertIt(r1c.status === 409, 'signup: rejects duplicate with 409');
assertIt((r1c.body as { code?: string }).code === 'EMAIL_TAKEN', 'signup: returns EMAIL_TAKEN code');

// ============================================================================
// handleLogin
// ============================================================================

header('handleLogin');

const r2 = await handleLogin({ email: TEST_EMAIL, password: TEST_PASSWORD });
assertIt(r2.status === 200, 'login: returns 200');
assertIt((r2.body as { ok?: boolean }).ok === true, 'login: ok=true');
const sessionToken = (r2.body as { sessionToken?: string }).sessionToken;
assertIt(typeof sessionToken === 'string' && sessionToken.length > 16, 'login: returns sessionToken');
assertIt((r2.body as { userId?: string }).userId === signupUserId, 'login: userId matches signup');

const r2b = await handleLogin({ email: TEST_EMAIL, password: 'WrongPass1234' });
assertIt(r2b.status === 401, 'login: rejects wrong password with 401');

const r2c = await handleLogin({ email: 'nobody@nowhere.test', password: 'abcdefgh1' });
assertIt(r2c.status === 401, 'login: rejects unknown user with 401');

// ============================================================================
// handleForgotPassword
// ============================================================================

header('handleForgotPassword');

const r3 = await handleForgotPassword({ email: TEST_EMAIL });
assertIt(r3.status === 200, 'forgot-password: returns 200');
assertIt((r3.body as { ok?: boolean; sent?: boolean }).sent === true, 'forgot-password: returns sent=true');

const r3b = await handleForgotPassword({ email: 'bad' });
assertIt(r3b.status === 400, 'forgot-password: rejects bad email');

// ============================================================================
// handleResetPassword
// ============================================================================

header('handleResetPassword');

// Use a fresh email for the direct engine call (handleForgotPassword already
// rate-limited TEST_EMAIL above)
const RESET_EMAIL = `reset+${Date.now()}@akasha.test`;
await handleSignup({
  displayName: 'Reset User',
  email: RESET_EMAIL,
  password: TEST_PASSWORD,
  confirmPassword: TEST_PASSWORD,
  acceptTerms: true,
});
const resetRecord = await requestPasswordReset(RESET_EMAIL, { ttlMs: 5 * 60_000 });

const r4 = await handleResetPassword({
  token: resetRecord.token,
  newPassword: 'NovaSenhaForte9',
  confirmPassword: 'NovaSenhaForte9',
});
assertIt(r4.status === 200, 'reset-password: returns 200');
assertIt((r4.body as { ok?: boolean }).ok === true, 'reset-password: ok=true');
assertIt((r4.body as { email?: string }).email === RESET_EMAIL, 'reset-password: returns email');

const r4b = await handleResetPassword({
  token: resetRecord.token,
  newPassword: 'NovaSenhaForte9',
  confirmPassword: 'NovaSenhaForte9',
});
assertIt(r4b.status === 400, 'reset-password: rejects consumed token');

const r4c = await handleResetPassword({
  token: 'short',
  newPassword: 'OutraSenha123',
  confirmPassword: 'OutraSenha123',
});
assertIt(r4c.status === 400, 'reset-password: rejects bad token format');

const r4d = await handleResetPassword({
  token: 'a'.repeat(32),
  newPassword: 'Senha1aaa',
  confirmPassword: 'Senha2bbb',
});
assertIt(r4d.status === 400, 'reset-password: rejects mismatched passwords');

// ============================================================================
// handleVerifyEmail
// ============================================================================

header('handleVerifyEmail');

const verification = issueEmailVerificationToken({ userId: 'fake-user', email: 'verify@akasha.test' });

const r5 = await handleVerifyEmail({ token: verification.token });
assertIt(r5.status === 200, 'verify-email: returns 200');
assertIt((r5.body as { verified?: boolean }).verified === true, 'verify-email: returns verified=true');

const r5b = await handleVerifyEmail({ token: verification.token });
assertIt(r5b.status === 400, 'verify-email: rejects consumed token');

const r5c = await handleVerifyEmail({ token: 'bad' });
assertIt(r5c.status === 400, 'verify-email: rejects bad token');

// ============================================================================
// Summary
// ============================================================================

process.stdout.write(`\n${'='.repeat(60)}\n`);
process.stdout.write(
  `  Auth-Pages API Smoke: ${passed} passed, ${failed} failed (of ${passed + failed})\n`,
);
process.stdout.write(`${'='.repeat(60)}\n`);

if (failed > 0) {
  process.stdout.write(`\nFailures:\n${failures.map((f) => `  - ${f}`).join('\n')}\n\n`);
  process.exit(1);
}

process.stdout.write('\nAUTH-PAGES API SMOKE PASS\n');
process.exit(0);
