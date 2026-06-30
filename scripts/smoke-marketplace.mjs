#!/usr/bin/env node
// ============================================================================
// W86-B — MARKETPLACE · SMOKE (E2E-flavored)
// ----------------------------------------------------------------------------
// Run: node --experimental-strip-types scripts/smoke-marketplace.mjs
// Asserts engine + page invariants at the cross-package level:
//   1. Filter compose (AND) narrows correctly across multiple criteria
//   2. Sacred-cultural gate: sacred offerings require verified practitioner
//   3. Price range filters by [min, max] bounds
//   4. Search debounce: query normalizes diacritics and matches title
//   5. ARIA contracts: aria-live, role=dialog, aria-modal, aria-busy present
//   6. LGPD gate: consent required before submit (cannot bypass via code path)
//   7. Mobile breakpoint: grid-cols-1 / sm:grid-cols-2 / lg:grid-cols-3
//   8. Card click → modal: data-testid wiring present
//   9. Tag set intersection: any-match semantics
//  10. Verified-only filter excludes unverified practitioner offerings
//  11. Empty filter is identity (returns full sample)
//  12. Sacred-cultural own-term preservation (Orixá, Ori, Sefirá, Caboclo, etc.)
// ============================================================================

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SAMPLE_OFFERINGS,
  SAMPLE_PRACTITIONERS,
  TRADICOES,
  OFFERING_TYPES,
  createMarketplaceEngine,
  InMemoryMarketplaceAdapter,
  listOfferings,
  isTradicao,
  isOfferingType,
} from '../src/lib/engines/marketplace/marketplace-engine.ts';
import {
  applyPageFilter,
  buildFilterChain,
  composeFilters,
  PRICE_RANGE_PRESETS,
  byQuery,
  byTradicao,
  bySacredOnly,
  byVerifiedOnly,
} from '../src/engine/marketplace/MarketplaceFilter.ts';

// ── Harness ──

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);

let passed = 0;
let failed = 0;
const failures = [];

function check(label, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${label}`);
  } catch (err) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${label}: ${msg}`);
    console.log(`  ✗ ${label}`);
    console.log(`    ${msg}`);
  }
}

function assertTrue(v, label) {
  if (!v) throw new Error(`assertTrue${label ? ' (' + label + ')' : ''}: falsy ${String(v)}`);
}
function assertEqual(a, b, label) {
  const ok = Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b);
  if (!ok) {
    throw new Error(
      `assertEqual${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`,
    );
  }
}
function assertIncludes(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(
      `assertIncludes${label ? ' (' + label + ')' : ''}: missing "${needle}"`,
    );
  }
}

// ── Build verified set ──

const verifiedSet = new Set(
  SAMPLE_PRACTITIONERS.filter((p) => p.verified).map((p) => p.id),
);

// ── Page source for contract assertions ──

const pageSource = readFileSync(
  join(ROOT, 'src/app/marketplace/MarketplacePageClient.tsx'),
  'utf8',
);

// ════════════════════════════════════════════
// SMOKE ASSERTIONS
// ════════════════════════════════════════════

check('1. filter compose (AND) narrows correctly across multiple criteria', () => {
  const out = applyPageFilter(
    SAMPLE_OFFERINGS,
    { tradicao: 'cigano', type: 'leitura', maxPrice: 200 },
    verifiedSet,
  );
  assertTrue(out.length >= 1, 'should have ≥1 match');
  for (const o of out) {
    assertEqual(o.tradicao, 'cigano');
    assertEqual(o.type, 'leitura');
    assertTrue(o.priceBRL <= 200);
  }
});

check('2. sacred-cultural gate: sacred offerings require verified practitioner', () => {
  const engine = createMarketplaceEngine(new InMemoryMarketplaceAdapter());
  const sacredOfferings = SAMPLE_OFFERINGS.filter((o) => o.sacred);
  assertTrue(sacredOfferings.length >= 1);
  for (const o of sacredOfferings) {
    const practitioner = engine.getPractitioner(o.practitionerId);
    assertTrue(practitioner !== null, 'practitioner exists');
    assertTrue(practitioner.verified === true, `practitioner ${o.practitionerId} must be verified for sacred offering ${o.id}`);
  }
});

check('3. price range filters by [min, max] bounds', () => {
  const lo = applyPageFilter(SAMPLE_OFFERINGS, { minPrice: 0, maxPrice: 150 }, verifiedSet);
  const hi = applyPageFilter(SAMPLE_OFFERINGS, { minPrice: 300 }, verifiedSet);
  for (const o of lo) assertTrue(o.priceBRL <= 150);
  for (const o of hi) assertTrue(o.priceBRL >= 300);
});

check('4. search debounce: query normalizes diacritics and matches title', () => {
  const out = applyPageFilter(SAMPLE_OFFERINGS, { query: 'CANDOMBLÉ' }, verifiedSet);
  assertTrue(out.length >= 1, 'should find ≥1 with diacritic query');
  const out2 = applyPageFilter(SAMPLE_OFFERINGS, { query: 'mentoria' }, verifiedSet);
  assertTrue(out2.length >= 1, 'should find ≥1 with simple query');
  // Debounce constant present in page source
  assertIncludes(pageSource, 'DEBOUNCE_MS = 250', 'debounce constant present');
});

check('5. ARIA contracts present in page source', () => {
  assertIncludes(pageSource, 'aria-live="polite"', 'aria-live polite');
  assertIncludes(pageSource, 'role="dialog"', 'role dialog');
  assertIncludes(pageSource, 'aria-modal="true"', 'aria-modal');
  assertIncludes(pageSource, 'aria-busy={isFetching}', 'aria-busy');
  assertIncludes(pageSource, 'aria-required="true"', 'aria-required');
  assertIncludes(pageSource, 'role="radio"', 'radio role (filter chips)');
  assertIncludes(pageSource, 'role="switch"', 'switch role (toggles)');
  assertIncludes(pageSource, 'role="status"', 'status role');
});

check('6. LGPD gate: consent required before submit (cannot bypass via code path)', () => {
  // source-level: canSubmit requires lgpd
  assertIncludes(pageSource, 'const canSubmit = dateTimeValid && notesValid && lgpd;');
  // button is disabled when canSubmit is false
  assertIncludes(pageSource, 'disabled={!canSubmit}');
  // LGPD checkbox is required
  assertIncludes(pageSource, 'id="booking-lgpd"');
  assertIncludes(pageSource, 'aria-required="true"');
});

check('7. mobile breakpoint: grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3', () => {
  assertIncludes(pageSource, 'grid-cols-1');
  assertIncludes(pageSource, 'sm:grid-cols-2');
  assertIncludes(pageSource, 'lg:grid-cols-3');
  // breakpoint constants present
  assertIncludes(pageSource, 'MOBILE_BREAKPOINT_PX = 640');
  assertIncludes(pageSource, 'TABLET_BREAKPOINT_PX = 1024');
});

check('8. card click → modal: data-testid wiring present', () => {
  assertIncludes(pageSource, 'data-testid="offering-card"');
  assertIncludes(pageSource, 'data-testid="booking-dialog"');
  assertIncludes(pageSource, 'data-testid="booking-form"');
  assertIncludes(pageSource, 'data-testid="booking-submit"');
  assertIncludes(pageSource, 'data-testid="booking-lgpd"');
});

check('9. tag set intersection: any-match semantics', () => {
  const out = applyPageFilter(
    SAMPLE_OFFERINGS,
    { tags: ['caboclo', 'orixá'] },
    verifiedSet,
  );
  // Should match offerings tagged 'caboclo' OR 'orixá'
  assertTrue(out.length >= 1, 'should match at least one');
});

check('10. verified-only filter excludes unverified practitioner offerings', () => {
  const out = applyPageFilter(
    SAMPLE_OFFERINGS,
    { verifiedOnly: true },
    verifiedSet,
  );
  for (const o of out) {
    assertTrue(verifiedSet.has(o.practitionerId), `${o.id} practitioner must be verified`);
  }
  // The unverified practitioner (pract-newcomer-099) should not appear
  const newcomerOff = out.filter((o) => o.practitionerId === 'pract-newcomer-099');
  assertEqual(newcomerOff.length, 0, 'unverified practitioner excluded');
});

check('11. empty filter is identity (returns full sample)', () => {
  const out = applyPageFilter(SAMPLE_OFFERINGS, {}, verifiedSet);
  assertEqual(out.length, SAMPLE_OFFERINGS.length);
});

check('12. sacred-cultural own-term preservation in sample data', () => {
  // Own-term vocabulary must appear in sacred offerings
  const ownTerms = ['orixá', 'ori', 'caboclo', 'axé', 'candomblé', 'umbanda', 'preto-velho'];
  let hits = 0;
  for (const o of SAMPLE_OFFERINGS) {
    const haystack = (o.title + ' ' + o.description + ' ' + o.tags.join(' ')).toLowerCase();
    for (const term of ownTerms) {
      if (haystack.includes(term)) {
        hits++;
        break;
      }
    }
  }
  assertTrue(hits >= 7, `expected ≥7 sacred offerings with own-term vocab, got ${hits}`);
  // Banned vocabulary absent
  const banned = ['amarre de amor', 'vinculação amorosa', 'trabalho para prejudicar'];
  for (const o of SAMPLE_OFFERINGS) {
    const haystack = (o.title + ' ' + o.description).toLowerCase();
    for (const b of banned) {
      if (haystack.includes(b)) {
        throw new Error(`banned term "${b}" found in offering ${o.id}`);
      }
    }
  }
});

// ── Summary ──

console.log('');
console.log(`  SMOKE RESULT: ${passed} PASS · ${failed} FAIL · ${passed + failed} total`);

if (failed > 0) {
  console.log('');
  console.log('  Failures:');
  for (const f of failures) console.log(`    · ${f}`);
  process.exit(1);
} else {
  process.exit(0);
}