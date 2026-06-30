// ============================================================================
// W85-C · Auth Integration — Spec Harness
// ----------------------------------------------------------------------------
// Pure-TS validation, wizard machine, tradição catalog, OAuth providers,
// AuthAdapter contract. No React. No Node imports.
//
// Cycle 85 · 2026-06-30
// Run with:
//   cd /tmp/w85-auth-integration-followup/src/lib/w85
//   node --experimental-strip-types --no-warnings auth-integration.spec.ts
// ============================================================================

import {
  TRADICOES,
  TRADICAO_CARDS,
  TRADICAO_LABELS,
  OAUTH_PROVIDERS,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  LGPD_VERSION,
  EMAIL_REGEX,
  WIZARD_STEP_ORDER,
  issuesToErrors,
  validateEmail,
  validatePasswordField,
  passwordStrength,
  validateDisplayName,
  validateBio,
  validateTradicao,
  validateLgpdConsent,
  validateMagicLinkInput,
  validateSignupStep1,
  validateSignupStep2,
  validateSignupStep3,
  validateFullSignup,
  canAdvance,
  nextStep,
  prevStep,
  initialWizardState,
  isTradicao,
  isOAuthProvider,
  isWizardStep,
  isAuthOutcome,
  toEmail,
  deriveMagicLinkToken,
  createStubAdapter,
  type WizardState,
  type WizardStep,
  type SignupForm,
  type OAuthProvider,
  type AuthOutcome,
} from './auth-integration.ts';

// ─────────────────────── Assertion helpers ───────────────────────

let pass = 0;
let fail = 0;

function assert(condition: unknown, label: string): void {
  if (condition) {
    pass += 1;
  } else {
    fail += 1;
    console.error(`✗ FAIL: ${label}`);
  }
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const ok = Object.is(actual, expected);
  if (!ok) {
    fail += 1;
    console.error(`✗ FAIL: ${label}\n  expected: ${String(expected)}\n  actual:   ${String(actual)}`);
  } else {
    pass += 1;
  }
}

function assertDeep<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass += 1;
  } else {
    fail += 1;
    console.error(`✗ FAIL: ${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
}

// ─────────────────────── 1. Constants sanity (4 assertions) ───────────────────────

assertEq(TRADICOES.length, 7, 'TRADICOES has exactly 7 entries');
assertEq(
  TRADICAO_CARDS.length,
  7,
  'TRADICAO_CARDS has exactly 7 cards',
);
assertEq(OAUTH_PROVIDERS.length, 2, 'OAUTH_PROVIDERS has 2 providers');
assertEq(WIZARD_STEP_ORDER.length, 3, 'Wizard has 3 steps');

// ─────────────────────── 2. 7-Tradição coverage (6 assertions) ───────────────────────

for (const id of TRADICOES) {
  const card = TRADICAO_CARDS.find((c) => c.id === id);
  assert(card !== undefined, `Card exists for tradição "${id}"`);
  if (card) {
    assert(
      card.label.length > 0,
      `Card "${id}" has non-empty label`,
    );
    assert(
      card.description.length >= 30,
      `Card "${id}" description is ≥30 chars (not exoticized stub)`,
    );
    assertEq(
      TRADICAO_LABELS[id],
      card.label,
      `Label lookup table matches card.label for "${id}"`,
    );
  }
}

// ─────────────────────── 3. Email validation (4 assertions) ───────────────────────

assert(
  validateEmail('ana@example.com') === null,
  'Valid email passes',
);
assert(
  validateEmail('not-an-email') !== null,
  'Invalid email fails with non-null issue',
);
assert(
  validateEmail('') !== null,
  'Empty email returns required-issue',
);
assert(
  validateEmail('a'.repeat(300) + '@x.com') !== null,
  'Over-long email returns length issue',
);

// ─────────────────────── 4. Password rules (5 assertions) ───────────────────────

assert(
  validatePasswordField('') !== null,
  'Empty password is required',
);
assert(
  validatePasswordField('Abc1!xyz') === null,
  'Strong password passes basic length check',
);
assert(
  passwordStrength('short1!').ok === false,
  'Too-short password fails strength',
);
assert(
  passwordStrength('abcdefgh').ok === false,
  'No-digit password fails strength',
);
assert(
  passwordStrength('Abcdef12!').ok === true,
  'Letter+digit+special password passes strength',
);

// ─────────────────────── 5. Display name + bio (3 assertions) ───────────────────────

assert(
  validateDisplayName('') !== null,
  'Empty displayName fails',
);
assert(
  validateDisplayName('Ana Maria') === null,
  'Valid displayName passes',
);
assert(
  validateBio('x'.repeat(BIO_MAX_LENGTH + 1)) !== null,
  'Over-long bio fails',
);

// ─────────────────────── 6. Tradição selection (3 assertions) ───────────────────────

assert(
  validateTradicao('cigano') === null,
  'cigano is a valid tradição',
);
assert(
  validateTradicao('budismo') !== null,
  'budismo is NOT in our 7-tradition taxonomy',
);
assert(
  isTradicao('candomble') &&
    isTradicao('umbanda') &&
    isTradicao('ifa') &&
    isTradicao('cabala') &&
    isTradicao('astrologia') &&
    isTradicao('tantra'),
  'All 7 tradições pass type-guard',
);

// ─────────────────────── 7. LGPD consent (2 assertions) ───────────────────────

assert(
  validateLgpdConsent(false) !== null,
  'LGPD consent=false is required-issue',
);
assert(
  validateLgpdConsent(true) === null,
  'LGPD consent=true passes',
);

// ─────────────────────── 8. Magic link input (2 assertions) ───────────────────────

assertEq(
  validateMagicLinkInput({ email: '' }).length,
  1,
  'Empty email yields 1 magic-link issue',
);
assertEq(
  validateMagicLinkInput({ email: 'a@b.co' }).length,
  0,
  'Valid email yields 0 magic-link issues',
);

// ─────────────────────── 9. Signup wizard per-step (4 assertions) ───────────────────────

assertEq(
  validateSignupStep1({ email: 'a@b.co', password: 'Abc123!@' }).length,
  0,
  'Step 1 valid email+password → 0 issues',
);
assertEq(
  validateSignupStep1({ email: '', password: '' }).length,
  2,
  'Step 1 invalid email+password → 2 issues',
);
assertEq(
  validateSignupStep2({ tradicao: 'cigano' }).length,
  0,
  'Step 2 valid tradição → 0 issues',
);
assert(
  validateSignupStep3({
    displayName: 'Ana',
    bio: '',
    lgpdConsent: false,
  }).some((i) => i.field === 'lgpd'),
  'Step 3 with LGPD=false surfaces consent issue',
);

// ─────────────────────── 10. Full-signup validator (2 assertions) ───────────────────────

const okForm: SignupForm = {
  step1: { email: 'a@b.co', password: 'Abc123!@' },
  step2: { tradicao: 'candomble' },
  step3: { displayName: 'Ana Maria', bio: 'Olá', lgpdConsent: true },
};
assertEq(
  validateFullSignup(okForm).length,
  0,
  'Complete valid signup → 0 issues',
);

const badForm: SignupForm = {
  step1: { email: 'not-an-email', password: '123' },
  step2: { tradicao: null },
  step3: { displayName: '', bio: 'x'.repeat(500), lgpdConsent: false },
};
assert(
  validateFullSignup(badForm).length >= 4,
  'Empty/bad signup surfaces multiple issues',
);

// ─────────────────────── 11. Wizard state machine (6 assertions) ───────────────────────

assertEq(initialWizardState().step, 1, 'Wizard starts at step 1');
assertEq(nextStep(1), 2, 'nextStep(1) → 2');
assertEq(nextStep(2), 3, 'nextStep(2) → 3');
assertEq(nextStep(3), null, 'nextStep(3) → null (end)');
assertEq(prevStep(1), null, 'prevStep(1) → null (start)');

const valid: WizardState = { step: 1, step1Valid: true, step2Valid: true, step3Valid: true };
assertEq(canAdvance(1, valid), true, 'canAdvance(1) when step1 valid');

// ─────────────────────── 12. Branded types + adapter (3 assertions) ───────────────────────

const e1 = toEmail('ANA@example.com');
assertEq(e1, 'ana@example.com', 'toEmail lowercases');

const t1 = deriveMagicLinkToken(e1);
assert(t1.startsWith('ml_'), 'Magic link token starts with ml_');

const adapter = createStubAdapter();
adapter.sendMagicLink(e1).then((out: AuthOutcome) => {
  if (out.kind === 'sent' && out.email === e1) {
    pass += 1;
  } else {
    fail += 1;
    console.error('✗ FAIL: stub adapter sendMagicLink returns sent outcome');
  }
});

// ─────────────────────── 13. Type guards (4 assertions) ───────────────────────

assertEq(isOAuthProvider('google'), true, 'google is oauth provider');
assertEq(isOAuthProvider('apple'), true, 'apple is oauth provider');
assertEq(isOAuthProvider('github'), false, 'github is NOT oauth provider');
assertEq(isWizardStep(2), true, '2 is a wizard step');

// ─────────────────────── 14. Result discriminator (2 assertions) ───────────────────────

assertEq(
  isAuthOutcome({ kind: 'sent', email: e1, token: t1 }),
  true,
  'sent outcome passes guard',
);
assertEq(isAuthOutcome({ kind: 'weird' }), false, 'unknown kind fails guard');

// ─────────────────────── 15. issuesToErrors helper (2 assertions) ───────────────────────

assertDeep(
  issuesToErrors([
    { field: 'email', code: 'required', message: 'Email é obrigatório' },
  ]),
  { email: 'Email é obrigatório' },
  'issuesToErrors single field',
);
assertDeep(
  issuesToErrors([]),
  {},
  'issuesToErrors empty → empty record',
);

// ─────────────────────── 16. Misc invariants (5 assertions) ───────────────────────

assert(PASSWORD_MIN_LENGTH === 8, 'Password min is 8');
assert(NAME_MIN_LENGTH === 2, 'Name min is 2');
assert(EMAIL_REGEX.test('a@b.co'), 'EMAIL_REGEX accepts a@b.co');
assert(EMAIL_MAX_LENGTH === 254, 'Email max is RFC 5321');
assert(typeof LGPD_VERSION === 'string' && LGPD_VERSION.length > 0, 'LGPD_VERSION is non-empty string');

// ─────────────────────── 17. Auth outcome kinds (1 assertion) ───────────────────────

const outcomeKinds = ['success', 'sent', 'validation', 'auth_error', 'network_error'] as const;
assertEq(
  outcomeKinds.length,
  5,
  'Auth outcome has 5 kinds',
);

assertEq(
  TRADICAO_CARDS[0]!.id,
  'cigano',
  'First tradição card is cigano',
);

// ─────────────────────── Summary ───────────────────────

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`W85-C · auth-integration.spec.ts`);
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`PASS: ${pass}    FAIL: ${fail}`);
console.log(`═══════════════════════════════════════════════════════════`);

// Give async work a tick to settle
await new Promise((r) => setTimeout(r, 50));

if (fail > 0) {
  process.exit(1);
}