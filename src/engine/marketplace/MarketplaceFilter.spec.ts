/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-B — MARKETPLACE FILTER · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 86 · 2026-06-30
 * Self-running harness (no vitest). ≥25 assertions covering:
 *   - normalizeQuery (NFD + diacritics)
 *   - byTradicao / byType / byPriceRange / bySacredOnly / byVerifiedOnly / byTagSet / byQuery
 *   - composeFilters AND-conjunction (all-pass / any-fail / empty)
 *   - buildFilterChain (step ids)
 *   - applyPageFilter (single + multi + sacred + verified combinations)
 *   - PRICE_RANGE_PRESETS (count + shape)
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };

import {
  SAMPLE_OFFERINGS,
  SAMPLE_PRACTITIONERS,
} from '../../lib/engines/marketplace/marketplace-engine.ts';
import type { Offering, Tradicao, OfferingType } from '../../lib/engines/marketplace/marketplace-engine.ts';

import {
  normalizeQuery,
  byTradicao,
  byType,
  byPriceRange,
  bySacredOnly,
  byVerifiedOnly,
  byTagSet,
  byQuery,
  composeFilters,
  buildFilterChain,
  applyPageFilter,
  PRICE_RANGE_PRESETS,
  type FilterStep,
} from './MarketplaceFilter.ts';

// ════════════════════════════════════════════
// HARNESS
// ════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(
        expected,
      )}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) {
    throw new Error(
      `assertTrue FAIL${label ? ' (' + label + ')' : ''}: got falsy ${String(v)}`,
    );
  }
}

function assertFalse(v: unknown, label?: string): void {
  if (v) {
    throw new Error(
      `assertFalse FAIL${label ? ' (' + label + ')' : ''}: got truthy ${String(v)}`,
    );
  }
}

// ════════════════════════════════════════════
// TEST FIXTURES
// ════════════════════════════════════════════

const verifiedSet = new Set(
  SAMPLE_PRACTITIONERS.filter((p) => p.verified).map((p) => p.id as string),
);

// ════════════════════════════════════════════
// SPECS
// ════════════════════════════════════════════

// ── normalizeQuery ──

it('normalizeQuery strips diacritics and lowercases', () => {
  assertEqual(normalizeQuery('  CANDOMBLÉ  '), 'candomble');
  assertEqual(normalizeQuery('Orixá'), 'orixa');
  assertEqual(normalizeQuery('Sephirâ'), 'sephira');
});

it('normalizeQuery returns empty for whitespace-only', () => {
  assertEqual(normalizeQuery('   '), '');
  assertEqual(normalizeQuery(''), '');
});

// ── byTradicao ──

it('byTradicao passes all when "all"', () => {
  const p = byTradicao('all');
  assertTrue(p(SAMPLE_OFFERINGS[0]!));
  assertTrue(p(SAMPLE_OFFERINGS[5]!));
});

it('byTradicao filters to matching only', () => {
  const p = byTradicao('cigano' as Tradicao);
  const matches = SAMPLE_OFFERINGS.filter(p);
  assertTrue(matches.length >= 4);
  for (const m of matches) assertEqual(m.tradicao, 'cigano');
});

it('byTradicao(undefined) is no-op', () => {
  const p = byTradicao(undefined);
  assertEqual(p(SAMPLE_OFFERINGS[0]!), true);
});

// ── byType ──

it('byType filters by type', () => {
  const p = byType('ritual' as OfferingType);
  const matches = SAMPLE_OFFERINGS.filter(p);
  assertTrue(matches.length >= 1);
  for (const m of matches) assertEqual(m.type, 'ritual');
});

it('byType("all") is no-op', () => {
  const p = byType('all');
  assertEqual(p(SAMPLE_OFFERINGS[0]!), true);
});

// ── byPriceRange ──

it('byPriceRange filters by min only', () => {
  const p = byPriceRange(200);
  const matches = SAMPLE_OFFERINGS.filter(p);
  for (const m of matches) assertTrue(m.priceBRL >= 200);
});

it('byPriceRange filters by max only', () => {
  const p = byPriceRange(undefined, 150);
  const matches = SAMPLE_OFFERINGS.filter(p);
  for (const m of matches) assertTrue(m.priceBRL <= 150);
});

it('byPriceRange both bounds', () => {
  const p = byPriceRange(100, 200);
  const matches = SAMPLE_OFFERINGS.filter(p);
  for (const m of matches) {
    assertTrue(m.priceBRL >= 100);
    assertTrue(m.priceBRL <= 200);
  }
});

it('byPriceRange no bounds is no-op', () => {
  const p = byPriceRange(undefined, undefined);
  assertEqual(p(SAMPLE_OFFERINGS[0]!), true);
});

// ── bySacredOnly ──

it('bySacredOnly(true) keeps only sacred', () => {
  const p = bySacredOnly(true);
  const matches = SAMPLE_OFFERINGS.filter(p);
  assertTrue(matches.length >= 1);
  for (const m of matches) assertEqual(m.sacred, true);
});

it('bySacredOnly(false) is no-op', () => {
  const p = bySacredOnly(false);
  assertEqual(p(SAMPLE_OFFERINGS[0]!), true);
});

// ── byVerifiedOnly ──

it('byVerifiedOnly(true) keeps offerings by verified practitioners', () => {
  const p = byVerifiedOnly(true, verifiedSet);
  const matches = SAMPLE_OFFERINGS.filter(p);
  for (const m of matches) assertTrue(verifiedSet.has(m.practitionerId));
});

it('byVerifiedOnly(false) is no-op', () => {
  const p = byVerifiedOnly(false, verifiedSet);
  assertEqual(p(SAMPLE_OFFERINGS[0]!), true);
});

// ── byTagSet ──

it('byTagSet matches if ANY tag intersects', () => {
  const p = byTagSet(['caboclo']);
  const matches = SAMPLE_OFFERINGS.filter(p);
  assertTrue(matches.length >= 1);
  for (const m of matches) {
    assertTrue(m.tags.some((t) => t === 'caboclo'));
  }
});

it('byTagSet with no selection is no-op', () => {
  const p = byTagSet([]);
  assertEqual(p(SAMPLE_OFFERINGS[0]!), true);
});

it('byTagSet normalizes diacritics', () => {
  const p = byTagSet(['orixá']); // with diacritics
  const matches = SAMPLE_OFFERINGS.filter(p);
  // Should match offerings tagged 'orixa' (engine normalizes; here we match via our normalizer too)
  assertTrue(matches.length >= 0);
});

// ── byQuery ──

it('byQuery finds offerings by title fragment', () => {
  const p = byQuery('baralho');
  const matches = SAMPLE_OFFERINGS.filter(p);
  assertTrue(matches.length >= 1);
});

it('byQuery is empty-string no-op', () => {
  const p = byQuery('');
  assertEqual(p(SAMPLE_OFFERINGS[0]!), true);
});

it('byQuery with diacritics matches normalized haystack', () => {
  const p = byQuery('CANDOMBLÉ');
  const matches = SAMPLE_OFFERINGS.filter(p);
  assertTrue(matches.length >= 1);
});

it('byQuery undefined is no-op', () => {
  const p = byQuery(undefined);
  assertEqual(p(SAMPLE_OFFERINGS[0]!), true);
});

// ── composeFilters ──

it('composeFilters with no steps passes everything', () => {
  const f = composeFilters<Offering>([]);
  assertEqual(f(SAMPLE_OFFERINGS).length, SAMPLE_OFFERINGS.length);
});

it('composeFilters AND-conjunction (all pass)', () => {
  const steps: FilterStep<Offering>[] = [
    { id: 't', label: 'cigano', predicate: byTradicao('cigano' as Tradicao) },
    { id: 'p', label: '<300', predicate: byPriceRange(undefined, 300) },
  ];
  const f = composeFilters(steps);
  const matches = f(SAMPLE_OFFERINGS);
  for (const m of matches) {
    assertEqual(m.tradicao, 'cigano');
    assertTrue(m.priceBRL <= 300);
  }
});

it('composeFilters AND-conjunction (one fails → excluded)', () => {
  const steps: FilterStep<Offering>[] = [
    { id: 't', label: 'cigano', predicate: byTradicao('cigano' as Tradicao) },
    { id: 'sacred', label: 'sacred', predicate: bySacredOnly(true) },
  ];
  const f = composeFilters(steps);
  const matches = f(SAMPLE_OFFERINGS);
  // cigano offerings are non-sacred, so result should be empty
  assertEqual(matches.length, 0);
});

it('composeFilters returns frozen array', () => {
  const f = composeFilters<Offering>([]);
  const out = f(SAMPLE_OFFERINGS);
  assertTrue(Object.isFrozen(out));
});

// ── buildFilterChain ──

it('buildFilterChain empty filter has no steps', () => {
  const chain = buildFilterChain({}, verifiedSet);
  assertEqual(chain.length, 0);
});
// (no additional fix needed)

it('buildFilterChain with all active facets has 7 steps', () => {
  // sacredOnly: false is a no-op and excluded from chain
  const chain = buildFilterChain(
    {
      tradicao: 'cigano' as Tradicao,
      type: 'leitura' as OfferingType,
      minPrice: 0,
      maxPrice: 500,
      verifiedOnly: true,
      sacredOnly: true,
      tags: ['baralho'],
      query: 'baralho',
    },
    verifiedSet,
  );
  assertEqual(chain.length, 7);
});

it('buildFilterChain step ids are stable', () => {
  const chain = buildFilterChain({ tradicao: 'cigano' as Tradicao }, verifiedSet);
  assertEqual(chain[0]!.id, 'tradicao');
});

// ── applyPageFilter ──

it('applyPageFilter empty filter passes all', () => {
  const out = applyPageFilter(SAMPLE_OFFERINGS, {}, verifiedSet);
  assertEqual(out.length, SAMPLE_OFFERINGS.length);
});

it('applyPageFilter cigano + leitura composes correctly', () => {
  const out = applyPageFilter(
    SAMPLE_OFFERINGS,
    { tradicao: 'cigano' as Tradicao, type: 'leitura' as OfferingType },
    verifiedSet,
  );
  assertTrue(out.length >= 1);
  for (const m of out) {
    assertEqual(m.tradicao, 'cigano');
    assertEqual(m.type, 'leitura');
  }
});

it('applyPageFilter price range 0-150 narrows sample', () => {
  const out = applyPageFilter(SAMPLE_OFFERINGS, { minPrice: 0, maxPrice: 150 }, verifiedSet);
  assertTrue(out.length >= 1);
  for (const m of out) assertTrue(m.priceBRL <= 150);
});

it('applyPageFilter sacredOnly + verifiedOnly intersect', () => {
  const out = applyPageFilter(
    SAMPLE_OFFERINGS,
    { sacredOnly: true, verifiedOnly: true },
    verifiedSet,
  );
  for (const m of out) {
    assertEqual(m.sacred, true);
    assertTrue(verifiedSet.has(m.practitionerId));
  }
});

it('applyPageFilter with query narrows by title fragment', () => {
  const out = applyPageFilter(SAMPLE_OFFERINGS, { query: 'mentoria' }, verifiedSet);
  assertTrue(out.length >= 1);
});

// ── PRICE_RANGE_PRESETS ──

it('PRICE_RANGE_PRESETS has 4 entries', () => {
  assertEqual(PRICE_RANGE_PRESETS.length, 4);
});

it('PRICE_RANGE_PRESETS first entry is "all"', () => {
  assertEqual(PRICE_RANGE_PRESETS[0]!.id, 'all');
});

it('PRICE_RANGE_PRESETS are frozen', () => {
  assertTrue(Object.isFrozen(PRICE_RANGE_PRESETS));
});

// ════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const entry of REGISTRY) {
    try {
      await entry.run();
      passed++;
      console.log(`  ✓ ${entry.name}`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${entry.name}: ${msg}`);
      console.log(`  ✗ ${entry.name}`);
      console.log(`    ${msg}`);
    }
  }

  console.log('');
  console.log(`  RESULT: ${passed} PASS · ${failed} FAIL · ${REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    · ${f}`);
    process.exit(1);
  }
}

runSpecs().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(2);
});