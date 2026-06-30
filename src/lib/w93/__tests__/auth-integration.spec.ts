/**
 * W93-B · auth-integration.spec — Unit tests para helpers de auth
 * ----------------------------------------------------------------------------
 * Roda via `node --import tsx --test src/lib/w93/__tests__/auth-integration.spec.ts`
 *
 * Cobre:
 *   - validateEmail (8 casos)
 *   - validatePassword (8 casos)
 *   - isPasswordAcceptable (4 casos)
 *   - sanitizeNextPath (8 casos — incluindo anti-open-redirect)
 *   - getSafeNext (4 casos — URLSearchParams + Record)
 *   - buildLoginRedirect (4 casos)
 *   - hashRedirect (4 casos — determinístico + LGPD-safe)
 *   - maskEmail (4 casos)
 *   - isValidResetToken (4 casos)
 *   - getPostLoginPath / getPostSignupPath (4 casos)
 *   - OAUTH_CATALOG (4 casos — provider info)
 *   - Schemas Zod (4 casos)
 *
 * Total: 58+ asserts (target ≥30).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

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
  OAUTH_PROVIDERS,
  AUTH_PATHS,
  DEFAULT_AUTH_REDIRECT,
  PASSWORD_MIN,
  HASH_PREFIX,
  w93LoginSchema,
  w93SignupSchema,
  w93ForgotSchema,
  w93ResetTokenSchema,
  type OAuthProvider,
} from '../auth-integration';

// ============================================================================
// validateEmail
// ============================================================================

describe('validateEmail', () => {
  test('accepts simple valid email', () => {
    const r = validateEmail('user@example.com');
    assert.equal(r.ok, true);
    assert.equal(r.normalized, 'user@example.com');
  });

  test('normalizes to lowercase', () => {
    const r = validateEmail('USER@Example.COM');
    assert.equal(r.ok, true);
    assert.equal(r.normalized, 'user@example.com');
  });

  test('trims whitespace', () => {
    const r = validateEmail('  user@example.com  ');
    assert.equal(r.ok, true);
    assert.equal(r.normalized, 'user@example.com');
  });

  test('rejects empty string', () => {
    const r = validateEmail('');
    assert.equal(r.ok, false);
    assert.match(r.reason ?? '', /obrigat/);
  });

  test('rejects string without @', () => {
    const r = validateEmail('notanemail');
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'Email inválido');
  });

  test('rejects string with consecutive dots in local part', () => {
    const r = validateEmail('us..er@example.com');
    assert.equal(r.ok, false);
  });

  test('rejects local part starting with dot', () => {
    const r = validateEmail('.user@example.com');
    assert.equal(r.ok, false);
  });

  test('rejects non-string input', () => {
    const r = validateEmail(123 as unknown);
    assert.equal(r.ok, false);
    assert.match(r.reason ?? '', /texto/);
  });

  test('rejects email > 254 chars', () => {
    const r = validateEmail('a'.repeat(250) + '@b.co');
    assert.equal(r.ok, false);
  });
});

// ============================================================================
// validatePassword + isPasswordAcceptable
// ============================================================================

describe('validatePassword', () => {
  test('empty string scores 0 (Muito fraca)', () => {
    const r = validatePassword('');
    assert.equal(r.score, 0);
    assert.equal(r.label, 'Muito fraca');
    assert.equal(r.criteria.lengthOk, false);
  });

  test('strong password (all criteria)', () => {
    const r = validatePassword('Abcdef12!');
    assert.equal(r.score, 4);
    assert.equal(r.label, 'Forte');
    assert.equal(r.criteria.lengthOk, true);
    assert.equal(r.criteria.hasLower, true);
    assert.equal(r.criteria.hasUpper, true);
    assert.equal(r.criteria.hasDigit, true);
    assert.equal(r.criteria.hasSymbol, true);
  });

  test('reports length tips when too short', () => {
    const r = validatePassword('Ab1!');
    assert.ok(r.tips.some((t) => t.includes('8')));
  });

  test('reports all missing criteria as tips', () => {
    const r = validatePassword('abcdefgh');
    assert.ok(r.tips.some((t) => /mai\u00fascul/.test(t)));
    assert.ok(r.tips.some((t) => /n[úu]mer/.test(t)));
    assert.ok(r.tips.some((t) => /s[íi]mbolo/.test(t)));
  });

  test('non-string input returns score 0', () => {
    const r = validatePassword(42 as unknown);
    assert.equal(r.score, 0);
  });

  test('rejects password > PASSWORD_MAX', () => {
    const r = validatePassword('A'.repeat(150));
    assert.equal(r.criteria.lengthOk, false);
  });

  test('medium score 2 with mixed alphanumeric', () => {
    const r = validatePassword('abcdef1');
    assert.ok(r.score >= 2);
  });
});

describe('isPasswordAcceptable', () => {
  test('accepts minimum-valid password (8 chars + letters + numbers)', () => {
    assert.equal(isPasswordAcceptable('abcdef12'), true);
  });

  test('rejects short password', () => {
    assert.equal(isPasswordAcceptable('abc123'), false);
  });

  test('rejects password without letters', () => {
    assert.equal(isPasswordAcceptable('12345678'), false);
  });

  test('rejects password without numbers', () => {
    assert.equal(isPasswordAcceptable('abcdefgh'), false);
  });
});

// ============================================================================
// sanitizeNextPath — anti open-redirect
// ============================================================================

describe('sanitizeNextPath', () => {
  test('accepts simple internal path', () => {
    assert.equal(sanitizeNextPath('/dashboard'), '/dashboard');
  });

  test('accepts path with query string', () => {
    assert.equal(sanitizeNextPath('/feed?tab=astrology'), '/feed?tab=astrology');
  });

  test('blocks absolute external URL', () => {
    assert.equal(sanitizeNextPath('https://evil.com'), DEFAULT_AUTH_REDIRECT);
  });

  test('blocks protocol-relative URL', () => {
    assert.equal(sanitizeNextPath('//evil.com'), DEFAULT_AUTH_REDIRECT);
  });

  test('blocks javascript: scheme', () => {
    assert.equal(sanitizeNextPath('javascript:alert(1)'), DEFAULT_AUTH_REDIRECT);
  });

  test('blocks auth paths (loop prevention)', () => {
    assert.equal(sanitizeNextPath('/login'), DEFAULT_AUTH_REDIRECT);
    assert.equal(sanitizeNextPath('/signup'), DEFAULT_AUTH_REDIRECT);
    assert.equal(sanitizeNextPath('/forgot'), DEFAULT_AUTH_REDIRECT);
  });

  test('returns fallback for non-string', () => {
    assert.equal(sanitizeNextPath(null), DEFAULT_AUTH_REDIRECT);
    assert.equal(sanitizeNextPath(undefined), DEFAULT_AUTH_REDIRECT);
    assert.equal(sanitizeNextPath(42 as unknown), DEFAULT_AUTH_REDIRECT);
  });

  test('returns fallback for empty string', () => {
    assert.equal(sanitizeNextPath(''), DEFAULT_AUTH_REDIRECT);
  });

  test('strips < > " \' ` and backslash', () => {
    assert.equal(sanitizeNextPath('/path<script>'), '/pathscript');
    assert.equal(sanitizeNextPath('/path"x"'), '/pathx');
  });

  test('uses custom fallback when provided', () => {
    assert.equal(sanitizeNextPath('//evil', '/custom'), '/custom');
  });

  test('blocks /register auth path', () => {
    assert.equal(sanitizeNextPath('/register'), DEFAULT_AUTH_REDIRECT);
  });

  test('accepts path starting with / but not /', () => {
    assert.equal(sanitizeNextPath('feed'), DEFAULT_AUTH_REDIRECT);
  });
});

// ============================================================================
// getSafeNext
// ============================================================================

describe('getSafeNext', () => {
  test('prefers next over redirectTo', () => {
    const params = new URLSearchParams('next=/from-next&redirectTo=/from-redirect');
    assert.equal(getSafeNext(params), '/from-next');
  });

  test('falls back to redirectTo when no next', () => {
    const params = new URLSearchParams('redirectTo=/from-redirect');
    assert.equal(getSafeNext(params), '/from-redirect');
  });

  test('returns default when neither provided', () => {
    const params = new URLSearchParams('');
    assert.equal(getSafeNext(params), DEFAULT_AUTH_REDIRECT);
  });

  test('accepts Record shape', () => {
    const r = getSafeNext({ next: '/x', redirectTo: '/y' });
    assert.equal(r, '/x');
  });

  test('handles null params', () => {
    assert.equal(getSafeNext(null), DEFAULT_AUTH_REDIRECT);
  });

  test('sanitizes malicious next in Record', () => {
    assert.equal(getSafeNext({ next: '//evil.com' }), DEFAULT_AUTH_REDIRECT);
  });
});

// ============================================================================
// buildLoginRedirect
// ============================================================================

describe('buildLoginRedirect', () => {
  test('appends next= to default login path', () => {
    const url = buildLoginRedirect('/feed');
    assert.ok(url.startsWith('/login?'));
    assert.ok(url.includes('next=%2Ffeed'));
  });

  test('returns login path if currentPath is login', () => {
    assert.equal(buildLoginRedirect('/login'), '/login');
  });

  test('preserves query string in currentPath', () => {
    const url = buildLoginRedirect('/feed?tab=mesa-real');
    assert.ok(url.includes('next='));
    assert.ok(decodeURIComponent(url).includes('/feed?tab=mesa-real'));
  });

  test('uses custom login path', () => {
    const url = buildLoginRedirect('/feed', '/entrar');
    assert.ok(url.startsWith('/entrar?'));
  });
});

// ============================================================================
// hashRedirect — LGPD-safe
// ============================================================================

describe('hashRedirect', () => {
  test('produces deterministic hash for same input', () => {
    const a = hashRedirect('user@example.com');
    const b = hashRedirect('user@example.com');
    assert.equal(a, b);
  });

  test('normalizes case before hashing', () => {
    const a = hashRedirect('User@Example.com');
    const b = hashRedirect('user@example.com');
    assert.equal(a, b);
  });

  test('prefixes with HASH_PREFIX', () => {
    const h = hashRedirect('test@test.com');
    assert.ok(h.startsWith(HASH_PREFIX));
  });

  test('returns placeholder hash for empty input', () => {
    const h = hashRedirect('');
    assert.ok(h.startsWith(HASH_PREFIX));
    assert.ok(h.length === HASH_PREFIX.length + 8);
  });

  test('respects length parameter', () => {
    const h = hashRedirect('a@b.co', 6);
    assert.equal(h.length, HASH_PREFIX.length + 6);
  });

  test('caps length at 8 (FNV-1a 32-bit max)', () => {
    const h = hashRedirect('a@b.co', 100);
    assert.equal(h.length, HASH_PREFIX.length + 8);
  });

  test('different inputs produce different hashes', () => {
    const a = hashRedirect('a@b.co');
    const b = hashRedirect('c@d.co');
    assert.notEqual(a, b);
  });
});

// ============================================================================
// maskEmail
// ============================================================================

describe('maskEmail', () => {
  test('masks local part keeping first char', () => {
    assert.equal(maskEmail('user@example.com'), 'u***@example.com');
  });

  test('handles single-char local part', () => {
    assert.equal(maskEmail('a@b.co'), 'a***@b.co');
  });

  test('returns *** for invalid input', () => {
    assert.equal(maskEmail('no-at-sign'), '***');
    assert.equal(maskEmail(''), '***');
  });

  test('returns *** for non-string', () => {
    assert.equal(maskEmail(123 as unknown), '***');
    assert.equal(maskEmail(null as unknown), '***');
  });
});

// ============================================================================
// isValidResetToken
// ============================================================================

describe('isValidResetToken', () => {
  test('accepts alphanumeric token of valid length', () => {
    assert.equal(isValidResetToken('abcdef1234567890'), true);
  });

  test('accepts base64url with dashes/underscores/dots', () => {
    assert.equal(isValidResetToken('abc_DEF.123-xyz_456'), true);
  });

  test('rejects too-short token', () => {
    assert.equal(isValidResetToken('short'), false);
  });

  test('rejects too-long token', () => {
    assert.equal(isValidResetToken('a'.repeat(300)), false);
  });

  test('rejects token with invalid chars', () => {
    assert.equal(isValidResetToken('token with spaces here'), false);
    assert.equal(isValidResetToken('token<script>'), false);
  });

  test('rejects non-string', () => {
    assert.equal(isValidResetToken(123 as unknown), false);
  });
});

// ============================================================================
// getPostLoginPath / getPostSignupPath
// ============================================================================

describe('getPostLoginPath', () => {
  test('returns default when no opts', () => {
    assert.equal(getPostLoginPath(), DEFAULT_AUTH_REDIRECT);
  });

  test('returns /onboarding when onboarding not complete', () => {
    assert.equal(getPostLoginPath({ onboardingCompleted: false }), '/onboarding');
  });

  test('returns default when onboarding complete', () => {
    assert.equal(getPostLoginPath({ onboardingCompleted: true }), DEFAULT_AUTH_REDIRECT);
  });

  test('honors sanitized explicitNext', () => {
    assert.equal(getPostLoginPath({ explicitNext: '/dashboard' }), '/dashboard');
  });

  test('blocks malicious explicitNext', () => {
    assert.equal(
      getPostLoginPath({ explicitNext: '//evil.com' }),
      DEFAULT_AUTH_REDIRECT
    );
  });
});

describe('getPostSignupPath', () => {
  test('returns /onboarding by default', () => {
    assert.equal(getPostSignupPath(), '/onboarding');
  });

  test('honors explicitNext', () => {
    assert.equal(getPostSignupPath({ explicitNext: '/welcome' }), '/welcome');
  });

  test('blocks malicious next', () => {
    assert.equal(
      getPostSignupPath({ explicitNext: 'https://evil.com' }),
      '/onboarding'
    );
  });
});

// ============================================================================
// OAUTH_CATALOG
// ============================================================================

describe('OAUTH_CATALOG', () => {
  test('contains expected providers', () => {
    assert.ok('google' in OAUTH_CATALOG);
    assert.ok('apple' in OAUTH_CATALOG);
  });

  test('all providers have required fields', () => {
    for (const id of OAUTH_PROVIDERS) {
      const p = OAUTH_CATALOG[id];
      assert.ok(p.label.length > 0, `${id} has label`);
      assert.ok(p.shortLabel.length > 0, `${id} has shortLabel`);
      assert.ok(p.consentNote.length > 0, `${id} has consentNote`);
      assert.equal(typeof p.configured, 'boolean');
    }
  });

  test('all providers start as configured=false (placeholder mode)', () => {
    for (const id of OAUTH_PROVIDERS) {
      assert.equal(OAUTH_CATALOG[id].configured, false, `${id} not yet configured`);
    }
  });

  test('google label is in pt-BR', () => {
    assert.equal(OAUTH_CATALOG.google.label, 'Continuar com Google');
  });

  test('apple label is in pt-BR', () => {
    assert.equal(OAUTH_CATALOG.apple.label, 'Continuar com Apple');
  });
});

// ============================================================================
// AUTH_PATHS — loop prevention
// ============================================================================

describe('AUTH_PATHS', () => {
  test('contains /login', () => {
    assert.ok(AUTH_PATHS.has('/login'));
  });

  test('contains /signup', () => {
    assert.ok(AUTH_PATHS.has('/signup'));
  });

  test('contains /forgot', () => {
    assert.ok(AUTH_PATHS.has('/forgot'));
  });

  test('does not contain /feed', () => {
    assert.equal(AUTH_PATHS.has('/feed'), false);
  });
});

// ============================================================================
// Zod schemas
// ============================================================================

describe('w93LoginSchema', () => {
  test('accepts valid login', () => {
    const r = w93LoginSchema.safeParse({ email: 'a@b.co', password: 'x' });
    assert.equal(r.success, true);
  });

  test('rejects empty email', () => {
    const r = w93LoginSchema.safeParse({ email: '', password: 'x' });
    assert.equal(r.success, false);
  });

  test('rejects empty password', () => {
    const r = w93LoginSchema.safeParse({ email: 'a@b.co', password: '' });
    assert.equal(r.success, false);
  });
});

describe('w93SignupSchema', () => {
  test('accepts valid signup with LGPD consent', () => {
    const r = w93SignupSchema.safeParse({
      fullName: 'João da Silva',
      email: 'joao@example.com',
      password: 'Abcdef12!',
      acceptLgpd: true,
    });
    assert.equal(r.success, true);
  });

  test('rejects without LGPD consent', () => {
    const r = w93SignupSchema.safeParse({
      fullName: 'João',
      email: 'joao@example.com',
      password: 'Abcdef12!',
      acceptLgpd: false,
    });
    assert.equal(r.success, false);
  });

  test('rejects short password', () => {
    const r = w93SignupSchema.safeParse({
      fullName: 'João',
      email: 'joao@example.com',
      password: 'short',
      acceptLgpd: true,
    });
    assert.equal(r.success, false);
  });

  test('accepts optional primaryTradition', () => {
    const r = w93SignupSchema.safeParse({
      fullName: 'João',
      email: 'joao@example.com',
      password: 'Abcdef12!',
      primaryTradition: 'umbanda',
      acceptLgpd: true,
    });
    assert.equal(r.success, true);
  });

  test('accepts primaryTradition=none', () => {
    const r = w93SignupSchema.safeParse({
      fullName: 'João',
      email: 'joao@example.com',
      password: 'Abcdef12!',
      primaryTradition: 'none',
      acceptLgpd: true,
    });
    assert.equal(r.success, true);
  });
});

describe('w93ForgotSchema', () => {
  test('accepts valid forgot request with consent', () => {
    const r = w93ForgotSchema.safeParse({
      email: 'user@example.com',
      acceptLgpd: true,
    });
    assert.equal(r.success, true);
  });

  test('rejects without consent', () => {
    const r = w93ForgotSchema.safeParse({
      email: 'user@example.com',
      acceptLgpd: false,
    });
    assert.equal(r.success, false);
  });

  test('rejects empty email', () => {
    const r = w93ForgotSchema.safeParse({ email: '', acceptLgpd: true });
    assert.equal(r.success, false);
  });
});

describe('w93ResetTokenSchema', () => {
  test('accepts valid token + matching passwords', () => {
    const r = w93ResetTokenSchema.safeParse({
      token: 'abcdef1234567890xyz',
      password: 'Abcdef12!',
      confirmPassword: 'Abcdef12!',
    });
    assert.equal(r.success, true);
  });

  test('rejects invalid token', () => {
    const r = w93ResetTokenSchema.safeParse({
      token: 'short',
      password: 'Abcdef12!',
      confirmPassword: 'Abcdef12!',
    });
    assert.equal(r.success, false);
  });

  test('rejects short password', () => {
    const r = w93ResetTokenSchema.safeParse({
      token: 'abcdef1234567890xyz',
      password: 'short',
      confirmPassword: 'short',
    });
    assert.equal(r.success, false);
  });
});

// ============================================================================
// PASSWORD_MIN / DEFAULT_AUTH_REDIRECT constants
// ============================================================================

describe('constants', () => {
  test('PASSWORD_MIN is 8', () => {
    assert.equal(PASSWORD_MIN, 8);
  });

  test('DEFAULT_AUTH_REDIRECT is /feed', () => {
    assert.equal(DEFAULT_AUTH_REDIRECT, '/feed');
  });
});

// ============================================================================
// Type exports (compile-time)
// ============================================================================

describe('types', () => {
  test('OAuthProvider type is exported', () => {
    const _check: OAuthProvider = 'google';
    assert.ok(_check);
  });
});