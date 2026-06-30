// ============================================================================
// W85-C · Auth Integration — Page Source Spec
// ----------------------------------------------------------------------------
// Pure-TS spec that asserts structural properties of the /login and /signup
// page source code (a11y attributes, role usage, 7-tradição coverage, LGPD
// consent gate). Reads the .tsx files as text and verifies via regex.
//
// Cycle 85 · 2026-06-30
// Run with:
//   cd /tmp/w85-auth-integration-followup/src/lib/w85
//   node --experimental-strip-types --no-warnings auth-integration.pages.spec.ts
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
  TRADICOES,
  LGPD_VERSION,
  WIZARD_STEP_ORDER,
  OAUTH_PROVIDERS,
  PASSWORD_MIN_LENGTH,
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

function assertMatches(haystack: string, regex: RegExp, label: string): void {
  if (regex.test(haystack)) {
    pass += 1;
  } else {
    fail += 1;
    console.error(`✗ FAIL: ${label}\n  regex: ${regex}`);
  }
}

function assertNotMatches(
  haystack: string,
  regex: RegExp,
  label: string,
): void {
  if (!regex.test(haystack)) {
    pass += 1;
  } else {
    fail += 1;
    console.error(`✗ FAIL: ${label}\n  unexpected match: ${regex}`);
  }
}

// ─────────────────────── Load page sources ───────────────────────

const here = dirname(fileURLToPath(import.meta.url));
// __tests__ directory is in the same folder as engine (src/lib/w85)
const pagesRoot = join(here, '..', '..', 'app', '(auth)');
const loginSrc = readFileSync(join(pagesRoot, 'login', 'page.tsx'), 'utf8');
const signupSrc = readFileSync(join(pagesRoot, 'signup', 'page.tsx'), 'utf8');

// ============================================================================
// /login assertions (8 assertions)
// ============================================================================

assertMatches(loginSrc, /role=["']form["']/, '/login uses role="form"');
assertMatches(
  loginSrc,
  /aria-live=["']polite["']/,
  '/login has aria-live="polite" status banner',
);
assertMatches(
  loginSrc,
  /autoComplete=["']email["']|autoComplete=\{"email"\}/,
  '/login sets autoComplete="email"',
);
assertMatches(
  loginSrc,
  /inputMode=["']email["']/,
  '/login uses inputMode="email" (mobile keyboard)',
);
assertMatches(
  loginSrc,
  /minHeight:\s*['"]48px/,
  '/login has 48px min tap targets',
);
assertMatches(
  loginSrc,
  /href=["']\/signup["']/,
  '/login has Sign up link to /signup',
);
assertMatches(
  loginSrc,
  /aria-label/,
  '/login uses aria-label',
);
assertMatches(
  loginSrc,
  /['"]use client['"]/,
  '/login is a client component ("use client")',
);

// ============================================================================
// /signup assertions (17 assertions)
// ============================================================================

assertMatches(signupSrc, /['"]use client['"]/, '/signup is a client component');
assertMatches(
  signupSrc,
  /aria-current=["']step["']/,
  '/signup sets aria-current="step" on active step',
);
assertMatches(
  signupSrc,
  /role=["']radiogroup["']/,
  '/signup uses role="radiogroup" for tradição cards',
);
assertMatches(
  signupSrc,
  /role=["']radio["']/,
  '/signup uses role="radio" on each tradição card',
);
assertMatches(
  signupSrc,
  /aria-checked/,
  '/signup uses aria-checked on tradição cards',
);
assertMatches(
  signupSrc,
  /aria-required=["']true["']/,
  '/signup sets aria-required="true" on required fields',
);

// Wizard steps covered
assertMatches(signupSrc, /wizard\.step/, '/signup uses wizard.step');
assertMatches(
  signupSrc,
  /canAdvance\(/,
  '/signup uses canAdvance() gate',
);

// LGPD consent gate
assertMatches(signupSrc, /lgpdConsent/, '/signup references lgpdConsent state');
assertMatches(
  signupSrc,
  /validateLgpdConsent|LGPD_VERSION/,
  '/signup references LGPD validator + version',
);
assertMatches(
  signupSrc,
  /type=["']checkbox["']/,
  '/signup has a checkbox (LGPD)',
);
assert(
  signupSrc.includes('LGPD_VERSION'),
  '/signup imports LGPD_VERSION constant',
);
assert(
  signupSrc.includes(LGPD_VERSION) || signupSrc.includes('LGPD_VERSION'),
  '/signup references LGPD_VERSION (constant or value)',
);

// All 7 tradições rendered as cards (via TRADICAO_CARDS array)
assert(
  signupSrc.includes('TRADICAO_CARDS') &&
    signupSrc.includes('.map((card) =>'),
  '/signup iterates TRADICAO_CARDS.map((card) => ...) to render 7 cards',
);
// Confirm the engine actually has all 7 (page just iterates the imported array)
assertEq(TRADICAO_CARDS.length, 7, 'TRADICAO_CARDS.length === 7');

function assertEq<T>(actual: T, expected: T, label: string): void {
  if (Object.is(actual, expected)) {
    pass += 1;
  } else {
    fail += 1;
    console.error(`✗ FAIL: ${label}\n  expected: ${String(expected)}\n  actual:   ${String(actual)}`);
  }
}

// Description curation (no exoticizing) — descriptions live in the engine,
// the page just references them. Verify the engine descriptions are NOT
// exoticizing (no "magia", "exotica", "tribal" etc.)
const bannedWords = ['exotica', 'exotic', 'primitiva', 'tribal magic', 'mística ancestral'];
let bannedFound = 0;
for (const card of TRADICAO_CARDS) {
  const lower = card.description.toLowerCase();
  for (const w of bannedWords) {
    if (lower.includes(w)) bannedFound += 1;
  }
}
assertEq(bannedFound, 0, 'No banned exoticizing words in tradição descriptions');

// All 3 wizard steps in stepper
assertMatches(signupSrc, /step=\{1\}/, '/signup stepper renders step 1');
assertMatches(signupSrc, /step=\{2\}/, '/signup stepper renders step 2');
assertMatches(signupSrc, /step=\{3\}/, '/signup stepper renders step 3');

// ============================================================================
// Cross-page contract (5 assertions)
// ============================================================================

assertMatches(loginSrc, /validateMagicLinkInput/, '/login uses validateMagicLinkInput');
assertMatches(signupSrc, /validateSignupStep1/, '/signup uses validateSignupStep1');
assertMatches(signupSrc, /validateSignupStep2/, '/signup uses validateSignupStep2');
assertMatches(signupSrc, /validateSignupStep3/, '/signup uses validateSignupStep3');
assertMatches(loginSrc, /OAUTH_PROVIDERS/, '/login references OAUTH_PROVIDERS');

// OAuth providers (visual only)
assert(
  OAUTH_PROVIDERS.length === 2,
  'OAUTH_PROVIDERS has 2 entries (Google, Apple)',
);

// Wizard step order constant
assertEq(WIZARD_STEP_ORDER.length, 3, 'Wizard has 3 steps');

// LGPD consent gate is REQUIRED before submit
assert(
  signupSrc.includes('lgpdConsent') &&
    signupSrc.includes('validateLgpdConsent') === false &&
    signupSrc.includes('validateSignupStep3'),
  '/signup LGPD gate is enforced via step 3 validator',
);

// Final assertion
assert(PASSWORD_MIN_LENGTH === 8, 'Password min is 8 chars');

// ============================================================================
// Summary
// ============================================================================

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`W85-C · auth-integration.pages.spec.ts`);
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`PASS: ${pass}    FAIL: ${fail}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (fail > 0) process.exit(1);