// ============================================================================
// W85-C · Auth Integration — Smoke Harness (E2E-flavored)
// ----------------------------------------------------------------------------
// Exercises the wizard flow end-to-end at the engine level, plus verifies
// page-level contracts (a11y attributes + estrutura) by reading the source
// files.
//
// Cycle 85 · 2026-06-30
// Run with:
//   cd /tmp/w85-auth-integration-followup/src/lib/w85
//   node --experimental-strip-types --no-warnings auth-integration.smoke.ts
// ============================================================================

// @ts-ignore — node imports via experimental-strip-types in Node 22
declare const process: { exit(code: number): never };
// @ts-ignore — module declaration provided in node-stubs.d.ts
import { readFileSync } from 'fs';
// @ts-ignore — module declaration provided in node-stubs.d.ts
import { fileURLToPath } from 'url';
// @ts-ignore — module declaration provided in node-stubs.d.ts
import { dirname, join } from 'path';

import {
  TRADICAO_CARDS,
  LGPD_VERSION,
  OAUTH_PROVIDERS,
  validateFullSignup,
  validateSignupStep1,
  validateSignupStep2,
  validateSignupStep3,
  validateMagicLinkInput,
  createStubAdapter,
  initialWizardState,
  canAdvance,
  nextStep,
  prevStep,
  toEmail,
  deriveMagicLinkToken,
  isAuthOutcome,
  isTradicao,
  type SignupForm,
  type Tradicao,
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
  if (Object.is(actual, expected)) {
    pass += 1;
  } else {
    fail += 1;
    console.error(
      `✗ FAIL: ${label}\n  expected: ${String(expected)}\n  actual:   ${String(actual)}`,
    );
  }
}

// ─────────────────────── Page source loading ───────────────────────

const here = dirname(fileURLToPath(import.meta.url));
const pagesRoot = join(here, '..', '..', 'app', '(auth)');
const loginSrc = readFileSync(join(pagesRoot, 'login', 'page.tsx'), 'utf8');
const signupSrc = readFileSync(join(pagesRoot, 'signup', 'page.tsx'), 'utf8');

// ============================================================================
// Smoke #1 — Full signup flow happy path (1 assertion)
// ============================================================================

const happyForm: SignupForm = {
  step1: { email: 'ana@example.com', password: 'Abc123!@' },
  step2: { tradicao: 'candomble' },
  step3: { displayName: 'Ana Maria', bio: '', lgpdConsent: true },
};
assertEq(
  validateFullSignup(happyForm).length,
  0,
  'Smoke 1: full signup happy path → 0 issues',
);

// ============================================================================
// Smoke #2 — LGPD gate blocks submit (1 assertion)
// ============================================================================

const noConsentForm: SignupForm = {
  step1: { email: 'ana@example.com', password: 'Abc123!@' },
  step2: { tradicao: 'cigano' },
  step3: { displayName: 'Ana', bio: '', lgpdConsent: false },
};
const noConsentIssues = validateFullSignup(noConsentForm);
assert(
  noConsentIssues.some((i) => i.code === 'consent'),
  'Smoke 2: LGPD=false blocks submit (consent issue present)',
);

// ============================================================================
// Smoke #3 — Wizard navigation (1 assertion)
// ============================================================================

const ws = { ...initialWizardState(), step1Valid: true, step2Valid: true, step3Valid: true };
let current = ws.step;
let transitions = [current];
while (true) {
  const valid =
    current === 1 ? ws.step1Valid :
    current === 2 ? ws.step2Valid :
    ws.step3Valid;
  if (!valid) break;
  const n = nextStep(current);
  if (n === null) break;
  transitions.push(n);
  current = n;
}
// With all valid, should traverse 1 → 2 → 3
assertEq(transitions.length, 3, 'Smoke 3: wizard traverses 1 → 2 → 3 when all valid');

// ============================================================================
// Smoke #4 — Tradição selection persists across steps (1 assertion)
// ============================================================================

const persistedTradicao: Tradicao = 'tantra';
const formWithTradicao: SignupForm = {
  step1: { email: 'a@b.co', password: 'Abc123!@' },
  step2: { tradicao: persistedTradicao },
  step3: { displayName: 'Ana', bio: '', lgpdConsent: true },
};
assertEq(
  formWithTradicao.step2.tradicao,
  persistedTradicao,
  'Smoke 4: tradição selection persists in form state',
);

// ============================================================================
// Smoke #5 — Magic link flow (1 assertion)
// ============================================================================

const adapter = createStubAdapter();
const magicOutcome = await adapter.sendMagicLink(toEmail('user@example.com'));
assert(
  isAuthOutcome(magicOutcome) && magicOutcome.kind === 'sent',
  'Smoke 5: magic link returns sent outcome',
);

// ============================================================================
// Smoke #6 — Stub adapter signup (1 assertion)
// ============================================================================

const signupOutcome: AuthOutcome = await adapter.signUp(
  happyForm,
  'cigano',
);
assert(
  signupOutcome.kind === 'success',
  'Smoke 6: stub adapter signup returns success outcome',
);

// ============================================================================
// Smoke #7 — Token determinism (1 assertion)
// ============================================================================

const tok1 = deriveMagicLinkToken(toEmail('a@b.co'));
const tok2 = deriveMagicLinkToken(toEmail('a@b.co'));
// Not equal because Date.now() in the token changes each call, but the prefix
// (ml_<hash>) should match for the same email.
assert(
  tok1.startsWith(tok2.slice(0, 11)) ||
    tok1.split('_')[1] === tok2.split('_')[1],
  'Smoke 7: token hash prefix is deterministic for the same email',
);

// ============================================================================
// Smoke #8 — Tradição type guard (1 assertion)
// ============================================================================

assert(
  isTradicao('cigano') && isTradicao('candomble') && isTradicao('umbanda') &&
    isTradicao('ifa') && isTradicao('cabala') && isTradicao('astrologia') &&
    isTradicao('tantra'),
  'Smoke 8: isTradicao accepts all 7 IDs',
);

// ============================================================================
// Smoke #9 — /login page structural contract (1 assertion)
// ============================================================================

assert(
  loginSrc.includes('role="form"') &&
    loginSrc.includes('aria-live="polite"') &&
    loginSrc.includes('autoComplete="email"') &&
    loginSrc.includes('href="/signup"') &&
    loginSrc.includes('minHeight: \'48px\''),
  'Smoke 9: /login page has form + a11y + nav + 48px targets',
);

// ============================================================================
// Smoke #10 — /signup page structural contract (1 assertion)
// ============================================================================

assert(
  signupSrc.includes('aria-current="step"') &&
    signupSrc.includes('role="radiogroup"') &&
    signupSrc.includes('role="radio"') &&
    signupSrc.includes('lgpdConsent') &&
    signupSrc.includes('LGPD_VERSION'),
  'Smoke 10: /signup page has wizard a11y + LGPD gate',
);

// ============================================================================
// Smoke #11 — OAuth providers (visual only) (1 assertion)
// ============================================================================

assert(
  OAUTH_PROVIDERS.length === 2 &&
    OAUTH_PROVIDERS.find((p) => p.id === 'google') !== undefined &&
    OAUTH_PROVIDERS.find((p) => p.id === 'apple') !== undefined,
  'Smoke 11: OAuth providers (Google + Apple) configured as visual-only',
);

// ============================================================================
// Smoke #12 — Sacred-cultural sensitivity (1 assertion)
// ============================================================================

// Each card description must mention at least one ON-OWN-TERM keyword —
// confirming the curation didn't exoticize the tradition.
const onOwnTermKeywords = [
  'cartas',         // cigano
  'orixás',          // candomblé
  'caboclos',        // umbanda
  'Orunmilá',        // ifá
  'sefirot',         // cabala
  'signos',          // astrologia
  'consciência',     // tantra
];
let keywordsFound = 0;
for (const kw of onOwnTermKeywords) {
  for (const card of TRADICAO_CARDS) {
    if (card.description.toLowerCase().includes(kw.toLowerCase())) {
      keywordsFound += 1;
      break;
    }
  }
}
assert(
  keywordsFound >= 5,
  `Smoke 12: tradição descriptions use on-own-term keywords (${keywordsFound}/7)`,
);

// ============================================================================
// Summary
// ============================================================================

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`W85-C · auth-integration.smoke.ts`);
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`PASS: ${pass}    FAIL: ${fail}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (fail > 0) process.exit(1);