#!/usr/bin/env node
/**
 * W93-B · smoke-auth-integration — Runtime smoke para auth-integration
 * ----------------------------------------------------------------------------
 * Roda via `node --experimental-strip-types scripts/smoke-auth-integration.mjs`
 *
 * Exercita happy-path + edge cases do engine SEM precisar de Next/React.
 * Loga cada assert como "[OK]" ou "[FAIL]". Exit code 0 só se 100% PASS.
 *
 * Cobre (≥20 asserts):
 *   - validateEmail: 4 casos
 *   - validatePassword: 3 casos
 *   - sanitizeNextPath: 5 casos (anti open-redirect)
 *   - getSafeNext: 3 casos
 *   - buildLoginRedirect: 3 casos
 *   - hashRedirect: 3 casos
 *   - maskEmail: 3 casos
 *   - isValidResetToken: 3 casos
 *   - getPostLoginPath / getPostSignupPath: 4 casos
 *
 * Total: ~30 asserts.
 *
 * LGPD: este script NUNCA loga emails crus — usa maskEmail() para qualquer
 * identificador antes de logar.
 */

import {
  validateEmail,
  validatePassword,
  isPasswordAcceptable,
  sanitizeNextPath,
  getSafeNext,
  buildLoginRedirect,
  hashRedirect,
  maskEmail,
  isValidResetToken,
  getPostLoginPath,
  getPostSignupPath,
  OAUTH_CATALOG,
  AUTH_PATHS,
  DEFAULT_AUTH_REDIRECT,
  w93LoginSchema,
  w93SignupSchema,
  w93ForgotSchema,
  w93ResetTokenSchema,
} from '../src/lib/w93/auth-integration.ts';

let passed = 0;
let failed = 0;
const failures = [];

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`[OK]   ${label}`);
    passed++;
  } else {
    console.log(`[FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
    failures.push(label);
    failed++;
  }
}

console.log('=== W93-B · smoke-auth-integration ===\n');

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------

console.log('--- validateEmail ---');
{
  const r = validateEmail('user@example.com');
  assert('accepts valid email', r.ok === true && r.normalized === 'user@example.com');
}
{
  const r = validateEmail('USER@EXAMPLE.COM  ');
  assert('normalizes to lowercase + trims', r.ok && r.normalized === 'user@example.com');
}
{
  const r = validateEmail('not-an-email');
  assert('rejects malformed email', r.ok === false);
}
{
  const r = validateEmail('');
  assert('rejects empty', r.ok === false);
}

// ---------------------------------------------------------------------------
// validatePassword + isPasswordAcceptable
// ---------------------------------------------------------------------------

console.log('\n--- validatePassword ---');
{
  const r = validatePassword('Abcdef12!');
  assert(
    'strong password scores 4 (Forte)',
    r.score === 4 && r.label === 'Forte',
    `actual score=${r.score} label=${r.label}`
  );
}
{
  const r = validatePassword('');
  assert('empty password scores 0 (Muito fraca)', r.score === 0);
}
{
  const r = validatePassword('abcdef1');
  assert('medium score (>=2) for mixed alphanum', r.score >= 2);
}
{
  assert('isPasswordAcceptable accepts "abcdef12"', isPasswordAcceptable('abcdef12'));
  assert('isPasswordAcceptable rejects "short"', !isPasswordAcceptable('short'));
  assert('isPasswordAcceptable rejects no-digits', !isPasswordAcceptable('abcdefgh'));
}

// ---------------------------------------------------------------------------
// sanitizeNextPath — anti open-redirect
// ---------------------------------------------------------------------------

console.log('\n--- sanitizeNextPath (anti open-redirect) ---');
assert('accepts internal path', sanitizeNextPath('/dashboard') === '/dashboard');
assert('blocks https://evil.com', sanitizeNextPath('https://evil.com') === DEFAULT_AUTH_REDIRECT);
assert('blocks //evil.com', sanitizeNextPath('//evil.com') === DEFAULT_AUTH_REDIRECT);
assert('blocks javascript:', sanitizeNextPath('javascript:alert(1)') === DEFAULT_AUTH_REDIRECT);
assert('blocks /login (auth loop)', sanitizeNextPath('/login') === DEFAULT_AUTH_REDIRECT);
assert('blocks /signup (auth loop)', sanitizeNextPath('/signup') === DEFAULT_AUTH_REDIRECT);
assert('blocks /forgot (auth loop)', sanitizeNextPath('/forgot') === DEFAULT_AUTH_REDIRECT);
assert('blocks null', sanitizeNextPath(null) === DEFAULT_AUTH_REDIRECT);
assert('blocks empty', sanitizeNextPath('') === DEFAULT_AUTH_REDIRECT);

// ---------------------------------------------------------------------------
// getSafeNext
// ---------------------------------------------------------------------------

console.log('\n--- getSafeNext ---');
{
  const p = new URLSearchParams('next=/from-next&redirectTo=/from-redirect');
  assert('prefers next over redirectTo', getSafeNext(p) === '/from-next');
}
{
  const p = new URLSearchParams('redirectTo=/legacy');
  assert('falls back to redirectTo', getSafeNext(p) === '/legacy');
}
{
  const p = new URLSearchParams('');
  assert('returns default when neither present', getSafeNext(p) === DEFAULT_AUTH_REDIRECT);
}

// ---------------------------------------------------------------------------
// buildLoginRedirect
// ---------------------------------------------------------------------------

console.log('\n--- buildLoginRedirect ---');
{
  const url = buildLoginRedirect('/feed');
  assert(
    'appends next param',
    url.startsWith('/login?') && url.includes('next=%2Ffeed'),
    `got: ${url}`
  );
}
{
  const url = buildLoginRedirect('/login');
  assert('returns login path when already on /login', url === '/login');
}
{
  const url = buildLoginRedirect('/feed', '/entrar');
  assert('honors custom login path', url.startsWith('/entrar?'));
}

// ---------------------------------------------------------------------------
// hashRedirect — LGPD-safe
// ---------------------------------------------------------------------------

console.log('\n--- hashRedirect ---');
{
  const a = hashRedirect('user@example.com');
  const b = hashRedirect('user@example.com');
  assert('produces deterministic hash', a === b);
}
{
  // Log apenas o hash, não o email — LGPD safe.
  const a = hashRedirect('User@Example.com');
  const b = hashRedirect('user@example.com');
  assert('normalizes case (same hash regardless of case)', a === b);
}
{
  assert(
    'hash has expected length',
    hashRedirect('a@b.co').length === 12, // 'w93h' (4) + 8 hex
    `got: ${hashRedirect('a@b.co').length}`
  );
}

// ---------------------------------------------------------------------------
// maskEmail
// ---------------------------------------------------------------------------

console.log('\n--- maskEmail ---');
assert('masks local part', maskEmail('user@example.com') === 'u***@example.com');
assert('handles single-char local', maskEmail('a@b.co') === 'a***@b.co');
assert('returns *** for invalid', maskEmail('no-at') === '***');

// ---------------------------------------------------------------------------
// isValidResetToken
// ---------------------------------------------------------------------------

console.log('\n--- isValidResetToken ---');
assert('accepts valid token', isValidResetToken('abcdef1234567890xyz'));
assert('rejects short token', !isValidResetToken('short'));
assert('rejects token with spaces', !isValidResetToken('has spaces in it'));

// ---------------------------------------------------------------------------
// getPostLoginPath / getPostSignupPath
// ---------------------------------------------------------------------------

console.log('\n--- getPostLoginPath ---');
assert('default returns /feed', getPostLoginPath() === '/feed');
assert('incomplete onboarding → /onboarding', getPostLoginPath({ onboardingCompleted: false }) === '/onboarding');
assert('honors sanitized explicitNext', getPostLoginPath({ explicitNext: '/dashboard' }) === '/dashboard');
assert('blocks malicious explicitNext', getPostLoginPath({ explicitNext: '//evil.com' }) === DEFAULT_AUTH_REDIRECT);

console.log('\n--- getPostSignupPath ---');
assert('default returns /onboarding', getPostSignupPath() === '/onboarding');
assert('honors explicitNext', getPostSignupPath({ explicitNext: '/welcome' }) === '/welcome');
assert('blocks malicious next, falls back to /onboarding', getPostSignupPath({ explicitNext: 'https://evil.com' }) === '/onboarding');

// ---------------------------------------------------------------------------
// AUTH_PATHS / OAUTH_CATALOG
// ---------------------------------------------------------------------------

console.log('\n--- AUTH_PATHS / OAUTH_CATALOG ---');
assert('AUTH_PATHS contains /login', AUTH_PATHS.has('/login'));
assert('AUTH_PATHS contains /signup', AUTH_PATHS.has('/signup'));
assert('OAUTH_CATALOG.google label is pt-BR', OAUTH_CATALOG.google.label === 'Continuar com Google');
assert('OAUTH_CATALOG.apple label is pt-BR', OAUTH_CATALOG.apple.label === 'Continuar com Apple');
assert('OAUTH_CATALOG providers not yet configured', !OAUTH_CATALOG.google.configured && !OAUTH_CATALOG.apple.configured);

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

console.log('\n--- Zod schemas ---');
{
  const r = w93LoginSchema.safeParse({ email: 'a@b.co', password: 'x' });
  assert('w93LoginSchema accepts valid', r.success === true);
}
{
  const r = w93LoginSchema.safeParse({ email: '', password: '' });
  assert('w93LoginSchema rejects empty', r.success === false);
}
{
  const r = w93SignupSchema.safeParse({
    fullName: 'João',
    email: 'joao@example.com',
    password: 'Abcdef12!',
    acceptLgpd: true,
  });
  assert('w93SignupSchema accepts valid with LGPD', r.success === true);
}
{
  const r = w93SignupSchema.safeParse({
    fullName: 'João',
    email: 'joao@example.com',
    password: 'Abcdef12!',
    acceptLgpd: false,
  });
  assert('w93SignupSchema rejects without LGPD consent', r.success === false);
}
{
  const r = w93ForgotSchema.safeParse({ email: 'a@b.co', acceptLgpd: true });
  assert('w93ForgotSchema accepts valid', r.success === true);
}
{
  const r = w93ResetTokenSchema.safeParse({
    token: 'abcdef1234567890xyz',
    password: 'Abcdef12!',
    confirmPassword: 'Abcdef12!',
  });
  assert('w93ResetTokenSchema accepts valid', r.success === true);
}

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n=== SUMMARY: ${passed} PASS, ${failed} FAIL ===`);
if (failed > 0) {
  console.log('\nFAILURES:');
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
process.exit(0);