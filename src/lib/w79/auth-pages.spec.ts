/**
 * Auth Pages Helpers Spec — wave 79
 * Self-running harness (no vitest needed) — cycle 60+ pattern.
 * Mirrors W68 audit.spec.ts shape: async run() + process.exit() at end.
 */

import {
  validateEmail, validatePasswordField, passwordStrength, validatePasswordConfirm,
  validateName, validateConsent, validateLoginForm, validateSignupForm,
  isLoginValid, isSignupValid, submitLogin, submitSignup, isSuccess,
  errorMessage, redirectFor, passwordVisibilityHint, issuesToMap,
  toUserId, toSessionToken,
  PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, NAME_MIN_LENGTH, NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH, EMAIL_REGEX, LGPD_VERSION,
  DEFAULT_LOGIN_REDIRECT, DEFAULT_SIGNUP_REDIRECT,
} from './auth-pages.ts';
import AuthPages from './auth-pages.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (Object.is(actual, expected)) {
    passed += 1;
  } else {
    failed += 1;
    failures.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function expectTrue(cond: boolean, label: string): void {
  if (cond) passed += 1;
  else { failed += 1; failures.push(label); }
}

function expectFalse(cond: boolean, label: string): void {
  if (!cond) passed += 1;
  else { failed += 1; failures.push(`${label}: expected false, got true`); }
}

function expectThrow(fn: () => unknown, msgIncludes: string, label: string): void {
  let caught: unknown = null;
  try { fn(); } catch (err) { caught = err; }
  if (caught === null) { failed += 1; failures.push(`${label}: no throw`); return; }
  const msg = (caught as Error).message;
  if (msg.includes(msgIncludes)) passed += 1;
  else { failed += 1; failures.push(`${label}: threw "${msg}", expected to include "${msgIncludes}"`); }
}

async function run(): Promise<void> {
  // ── 1. constants ──
  expectEqual(PASSWORD_MIN_LENGTH, 8, 'PASSWORD_MIN_LENGTH = 8');
  expectEqual(PASSWORD_MAX_LENGTH, 128, 'PASSWORD_MAX_LENGTH = 128');
  expectEqual(NAME_MIN_LENGTH, 2, 'NAME_MIN_LENGTH = 2');
  expectEqual(NAME_MAX_LENGTH, 80, 'NAME_MAX_LENGTH = 80');
  expectEqual(EMAIL_MAX_LENGTH, 254, 'EMAIL_MAX_LENGTH = 254');
  expectEqual(LGPD_VERSION, 'lgpd-v1-2026-01', 'LGPD_VERSION is set');
  expectEqual(DEFAULT_LOGIN_REDIRECT, '/dashboard', 'login redirect = /dashboard');
  expectEqual(DEFAULT_SIGNUP_REDIRECT, '/onboarding', 'signup redirect = /onboarding');
  expectTrue(EMAIL_REGEX instanceof RegExp, 'EMAIL_REGEX is RegExp');

  // ── 2. email validation ──
  const eNull = validateEmail(null);
  expectTrue(eNull !== null && eNull.field === 'email' && eNull.code === 'required', 'email null → required');
  const eUndef = validateEmail(undefined);
  expectEqual(eUndef?.code, 'required', 'email undefined → required');
  const eNum = validateEmail(123);
  expectEqual(eNum?.code, 'required', 'email number → required');
  const eEmpty = validateEmail('');
  expectEqual(eEmpty?.code, 'required', 'email empty → required');
  const eWs = validateEmail('   ');
  expectEqual(eWs?.code, 'required', 'email whitespace → required');
  expectEqual(validateEmail('not-an-email')?.code, 'format', 'email no @ → format');
  expectEqual(validateEmail('foo@bar')?.code, 'format', 'email no TLD → format');
  expectEqual(validateEmail('foo@bar.c')?.code, 'format', 'email TLD 1-char → format');
  expectEqual(validateEmail('@bar.com')?.code, 'format', 'email no local-part → format');
  expectEqual(validateEmail('a'.repeat(255) + '@b.co')?.code, 'length', 'email oversize → length');
  expectEqual(validateEmail('user@example.com'), null, 'email valid → null');
  expectEqual(validateEmail('USER@EXAMPLE.COM'), null, 'email uppercase → null (case-insensitive)');
  expectEqual(validateEmail('user.name+tag@sub.example.co'), null, 'email + . in local → null');
  expectEqual(validateEmail('  user@example.com  '), null, 'email trimmed → null');

  // ── 3. password field validation ──
  expectEqual(validatePasswordField(null)?.code, 'required', 'password null → required');
  expectEqual(validatePasswordField('')?.code, 'required', 'password empty → required');
  expectEqual(validatePasswordField('', { required: false }), null, 'password empty with required=false → null');
  expectEqual(validatePasswordField('a'.repeat(129))?.code, 'length', 'password oversize → length');
  expectEqual(validatePasswordField('short'), null, 'password short but valid length → null');

  // ── 4. password strength ──
  const s1 = passwordStrength('short');
  expectFalse(s1.ok, 'strength: "short" not ok');
  expectTrue(s1.issues.length >= 1, 'strength: "short" has issues');
  const s2 = passwordStrength('longpassword');
  expectFalse(s2.ok, 'strength: no digit/special → not ok');
  const s3 = passwordStrength('12345678');
  expectFalse(s3.ok, 'strength: digits only → not ok');
  const s4 = passwordStrength('ABCDEFG!');
  expectFalse(s4.ok, 'strength: no digit → not ok');
  const s5 = passwordStrength('abcdefg1');
  expectFalse(s5.ok, 'strength: no special → not ok');
  const s6 = passwordStrength('Abcdefg1!');
  expectTrue(s6.ok, 'strength: valid → ok');
  expectEqual(s6.issues.length, 0, 'strength: valid issues empty');

  // ── 5. password confirm ──
  expectEqual(validatePasswordConfirm('abc', '')?.code, 'required', 'confirm empty → required');
  expectEqual(validatePasswordConfirm('abc', 'xyz')?.code, 'mismatch', 'confirm mismatch → mismatch');
  expectEqual(validatePasswordConfirm('abc', 'abc'), null, 'confirm match → null');

  // ── 6. name validation ──
  expectEqual(validateName(null)?.code, 'required', 'name null → required');
  expectEqual(validateName('')?.code, 'length', 'name empty → length');
  expectEqual(validateName('A')?.code, 'length', 'name 1-char → length');
  expectEqual(validateName('a'.repeat(81))?.code, 'length', 'name 81-char → length');
  expectEqual(validateName('  Ana Silva  '), null, 'name trimmed valid → null');
  expectEqual(validateName('Bo'), null, 'name exactly 2 chars → null');

  // ── 7. consent ──
  expectEqual(validateConsent(false)?.code, 'consent', 'consent false → consent');
  expectEqual(validateConsent(undefined)?.code, 'consent', 'consent undefined → consent');
  expectEqual(validateConsent('yes')?.code, 'consent', 'consent string → consent');
  expectEqual(validateConsent(true), null, 'consent true → null');

  // ── 8. validateLoginForm ──
  const lf0 = validateLoginForm({});
  expectEqual(lf0.issues.length, 2, 'login empty: 2 issues (email + password)');
  expectEqual(lf0.byField.email, 'Email é obrigatório', 'login empty: byField.email');
  expectEqual(lf0.byField.password, 'Senha é obrigatória', 'login empty: byField.password');
  expectFalse(isLoginValid(lf0), 'login empty: isLoginValid false');
  expectTrue(Object.isFrozen(lf0), 'login empty: frozen');
  expectTrue(Object.isFrozen(lf0.issues), 'login empty: issues frozen');
  expectTrue(Object.isFrozen(lf0.byField), 'login empty: byField frozen');

  const lf1 = validateLoginForm({ email: 'invalid', password: 'short' });
  expectTrue(lf1.byField.email !== undefined, 'login invalid email: email set');
  expectEqual(lf1.byField.password, undefined, 'login short pw: no length-min error (login does not require strength)');

  const lf2 = validateLoginForm({ email: 'user@example.com', password: 'Abcdefg1!' });
  expectEqual(lf2.issues.length, 0, 'login valid: 0 issues');
  expectTrue(isLoginValid(lf2), 'login valid: isLoginValid true');

  // ── 9. validateSignupForm ──
  const sf0 = validateSignupForm({});
  expectEqual(sf0.issues.length, 5, 'signup empty: 5 issues');
  expectFalse(isSignupValid(sf0), 'signup empty: isSignupValid false');

  const sf1 = validateSignupForm({
    name: 'A',
    email: 'bad',
    password: 'short',
    confirmPassword: 'short',
    lgpdConsent: false,
  });
  expectTrue(sf1.byField.name !== undefined, 'signup short name → name error');
  expectTrue(sf1.byField.email !== undefined, 'signup bad email → email error');
  expectTrue(sf1.byField.password !== undefined, 'signup weak pw → password error');
  expectTrue(sf1.byField.lgpdConsent !== undefined, 'signup no consent → consent error');

  const sf2 = validateSignupForm({
    name: 'Bo',
    email: 'a@b.co',
    password: 'Abcdefg1!',
    confirmPassword: 'Abcdefg1!',
    lgpdConsent: true,
  });
  expectEqual(sf2.issues.length, 0, 'signup valid: 0 issues');
  expectTrue(isSignupValid(sf2), 'signup valid: isSignupValid true');

  const sf3 = validateSignupForm({
    name: 'Bo',
    email: 'a@b.co',
    password: 'Abcdefg1!',
    confirmPassword: 'DIFFERENT',
    lgpdConsent: true,
  });
  expectEqual(sf3.byField.confirmPassword, 'As senhas não coincidem', 'signup mismatch → confirmPassword');

  // ── 10. submitLogin short-circuit on validation fail ──
  let adapterCalls = 0;
  const failAdapter = {
    signIn: async () => { adapterCalls += 1; return { kind: 'auth_error' as const, code: 'invalid_credentials' as const, message: 'x' }; },
    signUp: async () => { adapterCalls += 1; return { kind: 'auth_error' as const, code: 'email_taken' as const, message: 'x' }; },
  };
  const r1 = await submitLogin({ email: '', password: '' }, failAdapter);
  expectEqual(adapterCalls, 0, 'submitLogin invalid: adapter NOT called');
  expectEqual(r1.result, null, 'submitLogin invalid: result null');
  expectEqual(r1.errors.email, 'Email é obrigatório', 'submitLogin invalid: byField.email');
  expectTrue(r1.issues.length > 0, 'submitLogin invalid: issues present');
  expectTrue(Object.isFrozen(r1), 'submitLogin invalid: result frozen');

  // ── 11. submitLogin success ──
  const okAdapter = {
    signIn: async (input: { email: string; password: string }) => {
      const userId = toUserId('u_user_1');
      const token = toSessionToken('tok_abc123_def456_ghi789_jkl012');
      return Object.freeze({
        kind: 'success' as const,
        userId,
        email: input.email,
        token,
        redirectTo: '/dashboard',
      });
    },
    signUp: async () => ({ kind: 'auth_error' as const, code: 'email_taken' as const, message: 'x' }),
  };
  const r2 = await submitLogin({ email: '  user@example.com  ', password: 'Abcdefg1!' }, okAdapter);
  expectEqual(r2.result?.kind, 'success', 'submitLogin valid: result.kind === success');
  if (r2.result && r2.result.kind === 'success') {
    expectEqual(r2.result.email, 'user@example.com', 'submitLogin valid: email trimmed');
    expectEqual(r2.result.redirectTo, '/dashboard', 'submitLogin valid: redirectTo /dashboard');
    expectEqual(r2.errors.email, undefined, 'submitLogin valid: no email error');
    expectEqual(r2.issues.length, 0, 'submitLogin valid: no issues');
  }

  // ── 12. submitLogin auth_error ──
  const badAdapter = {
    signIn: async () => Object.freeze({ kind: 'auth_error' as const, code: 'invalid_credentials' as const, message: 'Senha incorreta' }),
    signUp: async () => ({ kind: 'auth_error' as const, code: 'email_taken' as const, message: 'x' }),
  };
  const r3 = await submitLogin({ email: 'user@example.com', password: 'Abcdefg1!' }, badAdapter);
  expectEqual(r3.result?.kind, 'auth_error', 'submitLogin auth_error: kind');
  expectTrue(errorMessage(r3.result).includes('Senha incorreta'), 'submitLogin auth_error: message readable');

  // ── 13. submitLogin network_error ──
  const netAdapter = {
    signIn: async () => Object.freeze({ kind: 'network_error' as const, message: 'offline' }),
    signUp: async () => ({ kind: 'network_error' as const, message: 'offline' }),
  };
  const r4 = await submitLogin({ email: 'user@example.com', password: 'Abcdefg1!' }, netAdapter);
  expectEqual(r4.result?.kind, 'network_error', 'submitLogin network_error: kind');
  expectEqual(errorMessage(r4.result), 'offline', 'submitLogin network_error: message');

  // ── 14. submitSignup short-circuit ──
  const r5 = await submitSignup({ name: '', email: '', password: '', confirmPassword: '', lgpdConsent: false }, failAdapter);
  expectEqual(adapterCalls, 0, 'submitSignup invalid: adapter NOT called');
  expectEqual(r5.result, null, 'submitSignup invalid: result null');
  expectTrue(r5.errors.lgpdConsent !== undefined, 'submitSignup invalid: consent error');

  // ── 15. submitSignup success ──
  const okAdapter2 = {
    signIn: async () => ({ kind: 'auth_error' as const, code: 'invalid_credentials' as const, message: 'x' }),
    signUp: async (input: { name: string; email: string; password: string; confirmPassword: string; lgpdConsent: boolean }) => {
      const userId = toUserId('u_user_2');
      const token = toSessionToken('tok_xyz789_abc456_def123_ghi789');
      return Object.freeze({
        kind: 'success' as const,
        userId,
        email: input.email,
        token,
        redirectTo: '/onboarding',
      });
    },
  };
  const r6 = await submitSignup({
    name: '  Ana Silva  ',
    email: '  ana@example.com  ',
    password: 'Abcdefg1!',
    confirmPassword: 'Abcdefg1!',
    lgpdConsent: true,
  }, okAdapter2);
  expectEqual(r6.result?.kind, 'success', 'submitSignup valid: kind');
  if (r6.result && r6.result.kind === 'success') {
    expectEqual(r6.result.redirectTo, '/onboarding', 'submitSignup valid: redirectTo /onboarding');
  }
  expectEqual(r6.errors.name, undefined, 'submitSignup valid: name trimmed');

  // ── 16. submitSignup email_taken ──
  const takenAdapter = {
    signIn: async () => ({ kind: 'auth_error' as const, code: 'invalid_credentials' as const, message: 'x' }),
    signUp: async () => Object.freeze({ kind: 'auth_error' as const, code: 'email_taken' as const, message: 'Email já cadastrado' }),
  };
  const r7 = await submitSignup({
    name: 'Bo', email: 'a@b.co', password: 'Abcdefg1!', confirmPassword: 'Abcdefg1!', lgpdConsent: true,
  }, takenAdapter);
  expectEqual(r7.result?.kind, 'auth_error', 'submitSignup email_taken: kind');
  if (r7.result && r7.result.kind === 'auth_error') {
    expectEqual(r7.result.code, 'email_taken', 'submitSignup email_taken: code');
  }

  // ── 17. isSuccess guard ──
  expectTrue(isSuccess(r2.result), 'isSuccess(r2 success) true');
  expectFalse(isSuccess(null), 'isSuccess(null) false');
  expectFalse(isSuccess(r3.result), 'isSuccess(r3 auth_error) false');
  expectFalse(isSuccess(r4.result), 'isSuccess(r4 network_error) false');

  // ── 18. redirectFor ──
  if (r2.result && r2.result.kind === 'success') {
    expectEqual(redirectFor(r2.result), '/dashboard', 'redirectFor success');
  }
  expectEqual(redirectFor({ kind: 'auth_error', code: 'invalid_credentials', message: 'x' }), '/login', 'redirectFor auth_error → /login');

  // ── 19. errorMessage ──
  expectEqual(errorMessage(null), '', 'errorMessage(null) empty');
  expectEqual(errorMessage(r2.result), '', 'errorMessage(success) empty');
  expectEqual(errorMessage(r3.result), 'Senha incorreta', 'errorMessage(auth_error) message');
  expectEqual(errorMessage(r4.result), 'offline', 'errorMessage(network_error) message');

  // ── 20. passwordVisibilityHint ──
  expectEqual(passwordVisibilityHint(true), 'Ocultar senha', 'hint when visible');
  expectEqual(passwordVisibilityHint(false), 'Mostrar senha', 'hint when hidden');

  // ── 21. issuesToMap ──
  const m0 = issuesToMap([]);
  expectEqual(Object.keys(m0).length, 0, 'issuesToMap empty: no keys');
  const m1 = issuesToMap([
    { field: 'a', code: 'required', message: 'A required' },
    { field: 'b', code: 'format', message: 'B format' },
  ]);
  expectEqual(m1.a, 'A required', 'issuesToMap: a → A required');
  expectEqual(m1.b, 'B format', 'issuesToMap: b → B format');
  const m2 = issuesToMap([
    { field: 'a', code: 'required', message: 'A first' },
    { field: 'a', code: 'format', message: 'A second' },
  ]);
  expectEqual(m2.a, 'A first', 'issuesToMap: first wins for same field');
  expectTrue(Object.isFrozen(m1), 'issuesToMap result frozen');

  // ── 22. branded type validators ──
  expectEqual(toUserId('u_abc'), 'u_abc', 'toUserId valid');
  expectThrow(() => toUserId('not-prefixed'), 'Invalid UserId', 'toUserId rejects bad format');
  expectThrow(() => toUserId('u_A'), 'Invalid UserId', 'toUserId rejects uppercase');
  expectThrow(() => toUserId('u_a'), 'Invalid UserId', 'toUserId rejects too short');
  expectEqual(toSessionToken('tok_abc123_def456_ghi789_jkl012'), 'tok_abc123_def456_ghi789_jkl012', 'toSessionToken valid');
  expectThrow(() => toSessionToken('short'), 'Invalid SessionToken', 'toSessionToken too short');
  expectThrow(() => toSessionToken('x'.repeat(2000)), 'Invalid SessionToken', 'toSessionToken too long');

  // ── 23. AuthPages namespace ──
  expectEqual(typeof AuthPages.validateEmail, 'function', 'namespace: validateEmail');
  expectEqual(typeof AuthPages.passwordStrength, 'function', 'namespace: passwordStrength');
  expectEqual(typeof AuthPages.validateLoginForm, 'function', 'namespace: validateLoginForm');
  expectEqual(typeof AuthPages.submitLogin, 'function', 'namespace: submitLogin');
  expectEqual(typeof AuthPages.submitSignup, 'function', 'namespace: submitSignup');
  expectEqual(AuthPages.PASSWORD_MIN_LENGTH, 8, 'namespace: PASSWORD_MIN_LENGTH');
  expectEqual(AuthPages.LGPD_VERSION, 'lgpd-v1-2026-01', 'namespace: LGPD_VERSION');
  expectTrue(Object.isFrozen(AuthPages), 'namespace: frozen');

  // ── 24. SubmitResult freeze invariants ──
  const fr = await submitLogin({ email: '', password: '' }, failAdapter);
  expectTrue(Object.isFrozen(fr), 'SubmitResult frozen');
  expectTrue(Object.isFrozen(fr.errors), 'SubmitResult.errors frozen');
  expectTrue(Object.isFrozen(fr.issues), 'SubmitResult.issues frozen');

  // ── Summary ──
  console.log(`auth-pages.spec.ts: ${passed}/${passed + failed} PASS`);
  if (failed > 0) {
    console.error('FAILURES:');
    for (const f of failures) console.error('  -', f);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('auth-pages.spec.ts: harness crashed:', err);
  process.exit(1);
});
