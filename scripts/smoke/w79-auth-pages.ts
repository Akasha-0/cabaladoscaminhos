// Smoke — W79-B auth-pages helpers
// Sync runtime smoke (no test runner). Mirrors W68 smoke-auth.mjs shape.
// Verifies that the helpers can be imported under node --experimental-strip-types,
// and that the public API surfaces a minimum contract.

import { performance } from 'node:perf_hooks';

const results: string[] = [];
let totalChecks = 0;
let passedChecks = 0;

function check(label: string, cond: boolean): void {
  totalChecks += 1;
  if (cond) passedChecks += 1;
  else results.push(`FAIL: ${label}`);
}

function expectThrow(fn: () => unknown, msgIncludes: string, label: string): void {
  let caught: unknown = null;
  try { fn(); } catch (err) { caught = err; }
  totalChecks += 1;
  if (caught !== null && (caught as Error).message.includes(msgIncludes)) {
    passedChecks += 1;
  } else {
    results.push(`FAIL: ${label} (got ${caught === null ? 'no throw' : (caught as Error).message})`);
  }
}

async function main(): Promise<void> {
  const t0 = performance.now();

  // ── 1. module loads under --experimental-strip-types ──
  const mod = await import('../../src/lib/w79/auth-pages.ts');
  check('1.1 module exports validateEmail', typeof mod.validateEmail === 'function');
  check('1.2 module exports passwordStrength', typeof mod.passwordStrength === 'function');
  check('1.3 module exports validateLoginForm', typeof mod.validateLoginForm === 'function');
  check('1.4 module exports validateSignupForm', typeof mod.validateSignupForm === 'function');
  check('1.5 module exports submitLogin', typeof mod.submitLogin === 'function');
  check('1.6 module exports submitSignup', typeof mod.submitSignup === 'function');
  check('1.7 module exports toUserId', typeof mod.toUserId === 'function');
  check('1.8 module exports toSessionToken', typeof mod.toSessionToken === 'function');
  check('1.9 module exports default namespace', typeof mod.default === 'object' && mod.default !== null);
  check('1.10 default namespace is frozen', Object.isFrozen(mod.default));

  // ── 2. constants ──
  check('2.1 PASSWORD_MIN_LENGTH = 8', mod.PASSWORD_MIN_LENGTH === 8);
  check('2.2 PASSWORD_MAX_LENGTH = 128', mod.PASSWORD_MAX_LENGTH === 128);
  check('2.3 EMAIL_MAX_LENGTH = 254', mod.EMAIL_MAX_LENGTH === 254);
  check('2.4 LGPD_VERSION = lgpd-v1-2026-01', mod.LGPD_VERSION === 'lgpd-v1-2026-01');
  check('2.5 DEFAULT_LOGIN_REDIRECT = /dashboard', mod.DEFAULT_LOGIN_REDIRECT === '/dashboard');
  check('2.6 DEFAULT_SIGNUP_REDIRECT = /onboarding', mod.DEFAULT_SIGNUP_REDIRECT === '/onboarding');

  // ── 3. email quick checks ──
  check('3.1 email valid → null', mod.validateEmail('user@example.com') === null);
  check('3.2 email empty → required', mod.validateEmail('')?.code === 'required');
  check('3.3 email bad format → format', mod.validateEmail('foo')?.code === 'format');

  // ── 4. password strength quick ──
  check('4.1 strong password → ok', mod.passwordStrength('Abcdefg1!').ok === true);
  check('4.2 weak password → not ok', mod.passwordStrength('short').ok === false);
  check('4.3 weak password has issues', mod.passwordStrength('short').issues.length >= 1);

  // ── 5. form-level short-circuits ──
  const login = mod.validateLoginForm({});
  check('5.1 login empty → 2 issues', login.issues.length === 2);
  check('5.2 login valid → 0 issues', mod.validateLoginForm({ email: 'u@b.co', password: 'Abcdefg1!' }).issues.length === 0);

  const signup = mod.validateSignupForm({});
  check('5.3 signup empty → 5 issues', signup.issues.length === 5);
  const validSignup = mod.validateSignupForm({
    name: 'Bo', email: 'u@b.co', password: 'Abcdefg1!', confirmPassword: 'Abcdefg1!', lgpdConsent: true,
  });
  check('5.4 signup valid → 0 issues', validSignup.issues.length === 0);
  const mismatch = mod.validateSignupForm({
    name: 'Bo', email: 'u@b.co', password: 'Abcdefg1!', confirmPassword: 'DIFFERENT', lgpdConsent: true,
  });
  check('5.5 signup mismatch → confirmPassword error', mismatch.byField.confirmPassword !== undefined);

  // ── 6. submitLogin short-circuit (adapter not called) ──
  let calls = 0;
  const failAdapter = {
    signIn: async () => { calls += 1; return { kind: 'auth_error' as const, code: 'invalid_credentials' as const, message: 'x' }; },
    signUp: async () => { calls += 1; return { kind: 'auth_error' as const, code: 'email_taken' as const, message: 'x' }; },
  };
  const r1 = await mod.submitLogin({ email: '', password: '' }, failAdapter);
  check('6.1 submitLogin invalid → adapter not called', calls === 0);
  check('6.2 submitLogin invalid → result null', r1.result === null);
  check('6.3 submitLogin invalid → SubmitResult frozen', Object.isFrozen(r1));

  // ── 7. branded types ──
  check('7.1 toUserId valid', mod.toUserId('u_user_1') === 'u_user_1');
  expectThrow(() => mod.toUserId('bad'), 'Invalid UserId', '7.2 toUserId rejects');
  check('7.3 toSessionToken valid', mod.toSessionToken('tok_abc123_def456_ghi789_jkl012') === 'tok_abc123_def456_ghi789_jkl012');
  expectThrow(() => mod.toSessionToken('short'), 'Invalid SessionToken', '7.4 toSessionToken rejects');

  // ── Summary ──
  const t1 = performance.now();
  const ms = (t1 - t0).toFixed(2);
  console.log(`\nW79-B auth-pages smoke: ${passedChecks}/${totalChecks} checks PASS in ${ms}ms`);
  if (results.length > 0) {
    for (const r of results) console.log(`  ${r}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch(err => {
  console.error('w79-auth-pages smoke crashed:', err);
  process.exit(1);
});
