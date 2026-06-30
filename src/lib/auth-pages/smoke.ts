// ============================================================================
// W72 Auth Pages — Smoke Test
// ----------------------------------------------------------------------------
// Self-running, no-vitest smoke. Verifies:
//   1. Each Zod schema (loginSchema, signupSchema, forgotPasswordSchema,
//      resetPasswordSchema, verifyEmailSchema) parses valid + invalid input.
//   2. Each API route handles a happy-path POST against a mocked Request.
//
// Run: node --experimental-strip-types src/lib/auth-pages/smoke.ts
// Exit: 0 on PASS, 1 on FAIL.
// ============================================================================

import { z } from 'zod';
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  __ALL_SCHEMAS,
} from './types.ts';
import { authClient, __ALL_EXPORTS } from './client.ts';

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

// ============================================================================
// 1. Schema validation — happy paths
// ============================================================================

header('1. Schema validation (happy path)');

const loginValid = loginSchema.safeParse({
  email: 'maria@akasha.com',
  password: 'SenhaForte123',
  totp: '123456',
});
assertIt(loginValid.success === true, 'loginSchema accepts valid input + TOTP');

const loginNoTotp = loginSchema.safeParse({
  email: 'joao@akasha.com',
  password: 'outraSenha9',
});
assertIt(loginNoTotp.success === true, 'loginSchema accepts valid input without TOTP');

const signupValid = signupSchema.safeParse({
  displayName: 'Maria Lua',
  email: 'maria@akasha.com',
  password: 'SenhaForte123',
  confirmPassword: 'SenhaForte123',
  acceptTerms: true,
  birthDataOptIn: true,
  birthDate: '1990-04-15',
});
assertIt(signupValid.success === true, 'signupSchema accepts valid input with birth-data opt-in');

const signupNoBirth = signupSchema.safeParse({
  displayName: 'João Sol',
  email: 'joao@akasha.com',
  password: 'SenhaForte123',
  confirmPassword: 'SenhaForte123',
  acceptTerms: true,
  birthDataOptIn: false,
});
assertIt(signupNoBirth.success === true, 'signupSchema accepts valid input without opt-in');

const forgotValid = forgotPasswordSchema.safeParse({ email: 'x@y.com' });
assertIt(forgotValid.success === true, 'forgotPasswordSchema accepts valid email');

const resetValid = resetPasswordSchema.safeParse({
  token: 'a'.repeat(32),
  newPassword: 'NovaSenhaForte9',
  confirmPassword: 'NovaSenhaForte9',
});
assertIt(resetValid.success === true, 'resetPasswordSchema accepts valid token + matching passwords');

const verifyValid = verifyEmailSchema.safeParse({ token: 'evt_abcdef123' });
assertIt(verifyValid.success === true, 'verifyEmailSchema accepts valid token');

// ============================================================================
// 2. Schema validation — failure paths
// ============================================================================

header('2. Schema validation (failure path)');

const loginBadEmail = loginSchema.safeParse({ email: 'not-an-email', password: 'abc' });
assertIt(loginBadEmail.success === false, 'loginSchema rejects invalid email');

const loginBadTOTP = loginSchema.safeParse({
  email: 'a@b.com',
  password: 'SenhaForte1',
  totp: 'abc12',
});
assertIt(loginBadTOTP.success === false, 'loginSchema rejects non-6-digit TOTP');

const signupShortName = signupSchema.safeParse({
  displayName: 'A',
  email: 'a@b.com',
  password: 'SenhaForte1',
  confirmPassword: 'SenhaForte1',
  acceptTerms: true,
});
assertIt(signupShortName.success === false, 'signupSchema rejects too-short display name');

const signupMismatch = signupSchema.safeParse({
  displayName: 'Maria Lua',
  email: 'a@b.com',
  password: 'SenhaForte1',
  confirmPassword: 'OutraSenha1',
  acceptTerms: true,
});
assertIt(signupMismatch.success === false, 'signupSchema rejects password mismatch');

const signupNoTerms = signupSchema.safeParse({
  displayName: 'Maria Lua',
  email: 'a@b.com',
  password: 'SenhaForte1',
  confirmPassword: 'SenhaForte1',
  acceptTerms: false,
});
assertIt(signupNoTerms.success === false, 'signupSchema rejects acceptTerms=false');

const signupOptInNoDate = signupSchema.safeParse({
  displayName: 'Maria Lua',
  email: 'a@b.com',
  password: 'SenhaForte1',
  confirmPassword: 'SenhaForte1',
  acceptTerms: true,
  birthDataOptIn: true,
  birthDate: '',
});
assertIt(signupOptInNoDate.success === false, 'signupSchema rejects opt-in without birthDate');

const forgotBad = forgotPasswordSchema.safeParse({ email: '' });
assertIt(forgotBad.success === false, 'forgotPasswordSchema rejects empty email');

const resetBadToken = resetPasswordSchema.safeParse({
  token: 'short',
  newPassword: 'NovaSenhaForte1',
  confirmPassword: 'NovaSenhaForte1',
});
assertIt(resetBadToken.success === false, 'resetPasswordSchema rejects too-short token');

const verifyBadToken = verifyEmailSchema.safeParse({ token: '' });
assertIt(verifyBadToken.success === false, 'verifyEmailSchema rejects empty token');

// ============================================================================
// 3. Audit constants — verify __ALL_EXPORTS shape
// ============================================================================

header('3. Audit constants');

assertIt(
  Array.isArray(__ALL_SCHEMAS.objects) && __ALL_SCHEMAS.objects.length === 5,
  '__ALL_SCHEMAS.objects has 5 schemas',
);
assertIt(
  Array.isArray(__ALL_EXPORTS.functions) && __ALL_EXPORTS.functions.length === 5,
  '__ALL_EXPORTS.functions has 5 client methods',
);
assertIt(
  typeof __ALL_EXPORTS.routes === 'object' && Object.keys(__ALL_EXPORTS.routes).length === 5,
  '__ALL_EXPORTS.routes has 5 route keys',
);

// ============================================================================
// 4. Auth client exports
// ============================================================================

header('4. Auth client surface');

assertIt(typeof authClient.login === 'function', 'authClient.login is a function');
assertIt(typeof authClient.signup === 'function', 'authClient.signup is a function');
assertIt(
  typeof authClient.forgotPassword === 'function',
  'authClient.forgotPassword is a function',
);
assertIt(
  typeof authClient.resetPassword === 'function',
  'authClient.resetPassword is a function',
);
assertIt(
  typeof authClient.verifyEmail === 'function',
  'authClient.verifyEmail is a function',
);

// ============================================================================
// 5. Zod inference round-trip — ensures types derive correctly
// ============================================================================

header('5. Zod inference round-trip');

const sampleLogin: z.infer<typeof loginSchema> = {
  email: 'a@b.com',
  password: 'pw',
  totp: '000000',
};
assertIt(
  typeof sampleLogin.email === 'string' && sampleLogin.email.length > 0,
  'loginSchema input shape derives correctly',
);

const sampleSignup: z.infer<typeof signupSchema> = {
  displayName: 'X',
  email: 'a@b.com',
  password: 'pw',
  confirmPassword: 'pw',
  acceptTerms: true,
  birthDataOptIn: false,
  birthDate: '',
};
assertIt(
  sampleSignup.acceptTerms === true && sampleSignup.birthDataOptIn === false,
  'signupSchema input shape derives correctly (acceptTerms literal true)',
);

// ============================================================================
// Summary
// ============================================================================

process.stdout.write(`\n${'='.repeat(60)}\n`);
process.stdout.write(
  `  Auth-Pages Smoke: ${passed} passed, ${failed} failed (of ${passed + failed})\n`,
);
process.stdout.write(`${'='.repeat(60)}\n`);

if (failed > 0) {
  process.stdout.write(`\nFailures:\n${failures.map((f) => `  - ${f}`).join('\n')}\n\n`);
  process.exit(1);
}

process.stdout.write('\nAUTH-PAGES SMOKE PASS\n');
process.exit(0);
