/**
 * synastry-advanced.smoke.ts — W75-D self-running smoke harness
 * Standalone runner (no spec imports). Inline checks only.
 * Pattern: cycle 73 smoke harness — sequential, noit() registration.
 */

import {
  computeCompatibility,
  highlightAspect,
  renderCoupleMesaReal,
  exportAudit,
  derivePairId,
  fnv1a32,
  userId,
  SACRED_TRADITIONS,
  ZODIAC_SIGNS,
  MESA_REAL_HOUSES,
  CROSS_ASPECT_CATALOG,
  ORIXA_COMPATIBILITY,
  CIGANO_CARD_AFFINITY,
  MASTER_NUMBERS,
  WEAK_ASPECT_THRESHOLD,
  __resetAuditForTests,
  type PersonChart,
} from './synastry-advanced.ts';

// ============================================================================
// Assert helpers
// ============================================================================

let ASSERTIONS = 0;
let FAILS = 0;

function assertTrue(cond: boolean, label: string): void {
  ASSERTIONS++;
  if (!cond) {
    FAILS++;
    console.error('FAIL :: ' + label);
  }
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  ASSERTIONS++;
  if (actual !== expected) {
    FAILS++;
    console.error('FAIL :: ' + label + ' :: expected ' + JSON.stringify(expected) + ' got ' + JSON.stringify(actual));
  }
}

function assertInRange(value: number, min: number, max: number, label: string): void {
  ASSERTIONS++;
  if (value < min || value > max) {
    FAILS++;
    console.error('FAIL :: ' + label + ' :: ' + value + ' not in [' + min + ', ' + max + ']');
  }
}

// ============================================================================
// Fixtures
// ============================================================================

const ALICE: PersonChart = {
  userId: userId('user_alice_001'),
  name: 'Alice',
  birthDate: '1990-04-15',
  westernChart: {
    sun: { sign: 'Aries', house: 1 },
    moon: { sign: 'Leao', house: 5 },
    ascendant: { sign: 'Sagitario' },
    venus: { sign: 'Touro', house: 2 },
    mars: { sign: 'Escorpiao', house: 8 },
    mercury: { sign: 'Aries', house: 1 },
  },
  numerology: { lifePath: 7, expression: 11, soulUrge: 3 },
  ciganoCards: [
    { card: 1, position: 1, reversed: false },
    { card: 22, position: 2, reversed: false },
    { card: 10, position: 3, reversed: true },
    { card: 13, position: 4, reversed: false },
  ],
  orixaHead: 'Oxala',
};

const BETO: PersonChart = {
  userId: userId('user_beto_002'),
  name: 'Beto',
  birthDate: '1988-09-22',
  westernChart: {
    sun: { sign: 'Virgem', house: 6 },
    moon: { sign: 'Touro', house: 2 },
    ascendant: { sign: 'Capricornio' },
    venus: { sign: 'Libra', house: 7 },
    mars: { sign: 'Leao', house: 5 },
    mercury: { sign: 'Virgem', house: 6 },
  },
  numerology: { lifePath: 9, expression: 6, soulUrge: 5 },
  ciganoCards: [
    { card: 22, position: 1, reversed: false },
    { card: 13, position: 2, reversed: true },
    { card: 28, position: 3, reversed: false },
    { card: 7, position: 4, reversed: false },
  ],
  orixaHead: 'Iemanja',
};

const CARLA: PersonChart = {
  ...ALICE,
  userId: userId('user_carla_003'),
  orixaHead: 'Ogum',
  numerology: { lifePath: 11, expression: 4, soulUrge: 7 },
};

// ============================================================================
// Smoke: FNV hash
// ============================================================================

function smokeHash(): void {
  console.log('\n== Smoke: FNV hash ==');
  const h1 = fnv1a32('alice|beto');
  assertEqual(h1.length, 8, '8-hex output');
  assertEqual(fnv1a32('alice|beto'), h1, 'deterministic');
  assertTrue(fnv1a32('alice|beto') !== fnv1a32('beto|alice'), 'distinct raw inputs distinct hashes');
}

// ============================================================================
// Smoke: pairId symmetry
// ============================================================================

function smokePairId(): void {
  console.log('\n== Smoke: pairId symmetry ==');
  __resetAuditForTests();
  const pid1 = derivePairId('user_a', 'user_b');
  const pid2 = derivePairId('user_b', 'user_a');
  assertEqual(pid1, pid2, 'pairId symmetric across order');
  assertTrue(String(pid1).startsWith('pair_'), 'pair_ prefix');
}

// ============================================================================
// Smoke: computeCompatibility top-level
// ============================================================================

function smokeCompatibility(): void {
  console.log('\n== Smoke: computeCompatibility ==');
  __resetAuditForTests();
  const r = computeCompatibility(ALICE, BETO);
  assertEqual(typeof r.compatibilityScore, 'number', 'score is number');
  assertInRange(r.compatibilityScore, 0, 100, 'score in [0,100]');
  assertEqual(r.aspects.length, 7, '7 aspects');
  assertTrue(Object.isFrozen(r), 'reading frozen');
  assertTrue(Object.isFrozen(r.aspects), 'aspects frozen');
  assertTrue(Object.isFrozen(r.weakAspects), 'weakAspects frozen');
  assertTrue(Object.isFrozen(r.riskAreas), 'riskAreas frozen');

  // highlighting
  let max = -Infinity;
  for (const a of r.aspects) if (a.strength > max) max = a.strength;
  assertEqual(r.definingAspect.strength, max, 'definingAspect is strongest');
  const hlCount = r.aspects.filter((x) => x.highlighted).length;
  assertEqual(hlCount, 1, 'exactly 1 highlighted');
}

// ============================================================================
// Smoke: Aspect types all detected
// ============================================================================

function smokeAspectTypes(): void {
  console.log('\n== Smoke: aspect types ==');
  __resetAuditForTests();
  const r = computeCompatibility(ALICE, BETO);
  const typesFound = new Set(r.aspects.map((a) => a.type));
  const expected = [
    'sun-moon', 'venus-mars', 'mercury-venus', 'ascendant-moon',
    'life-path-resonance', 'cigano-resonance', 'orixa-compatibility',
  ];
  for (const e of expected) {
    assertTrue((typesFound as Set<string>).has(e), 'type ' + e + ' detected');
  }
}

// ============================================================================
// Smoke: weak aspects
// ============================================================================

function smokeWeakAspects(): void {
  console.log('\n== Smoke: weak aspects ==');
  __resetAuditForTests();
  const r = computeCompatibility(ALICE, BETO);
  for (const a of r.weakAspects) {
    assertTrue(a.strength < WEAK_ASPECT_THRESHOLD, 'weak aspect < ' + WEAK_ASPECT_THRESHOLD);
  }
  // mutual: any with strength < threshold must be in weakAspects
  for (const a of r.aspects) {
    if (a.strength < WEAK_ASPECT_THRESHOLD) {
      assertTrue(r.weakAspects.includes(a), 'weak aspect captured');
    }
  }
}

// ============================================================================
// Smoke: tradition breakdown
// ============================================================================

function smokeTraditionBreakdown(): void {
  console.log('\n== Smoke: tradition breakdown ==');
  __resetAuditForTests();
  const r = computeCompatibility(ALICE, BETO);
  const keys = Object.keys(r.traditionBreakdown);
  assertEqual(keys.length, 7, '7 traditions');
  for (const t of SACRED_TRADITIONS) {
    assertTrue(keys.includes(t), 'tradition ' + t);
  }
  assertEqual(r.traditionBreakdown['Astrologia'].aspects, 4, 'Astrologia has 4');
  assertEqual(r.traditionBreakdown['Numerologia'].aspects, 1, 'Numerologia has 1');
}

// ============================================================================
// Smoke: coupleMesaReal
// ============================================================================

function smokeMesaReal(): void {
  console.log('\n== Smoke: coupleMesaReal ==');
  __resetAuditForTests();
  const r = computeCompatibility(ALICE, BETO);
  assertEqual(r.coupleMesaReal.length, 12, '12 houses');
  for (let i = 0; i < 12; i++) {
    assertEqual(r.coupleMesaReal[i].house, i + 1, 'house ' + (i + 1));
    assertTrue(r.coupleMesaReal[i].reading.length > 10, 'reading non-trivial house ' + (i + 1));
  }
}

// ============================================================================
// Smoke: recommendation + spiritualGuidance
// ============================================================================

function smokeRecommendation(): void {
  console.log('\n== Smoke: recommendation + spiritualGuidance ==');
  __resetAuditForTests();
  const r = computeCompatibility(ALICE, BETO);
  assertTrue(r.recommendation.length > 20, 'recommendation non-trivial');
  assertTrue(/Score/.test(r.recommendation), 'rec mentions Score');
  assertTrue(/aspecto definidor/.test(r.recommendation), 'rec mentions defining aspect');
  assertTrue(r.spiritualGuidance.length > 30, 'spiritualGuidance non-trivial');
  assertTrue(/Cabala|Tantra|Orixa/.test(r.spiritualGuidance) || r.spiritualGuidance.includes('Tiferet') || r.spiritualGuidance.includes('maithuna'), 'spiritual touches');
}

// ============================================================================
// Smoke: highlightAspect
// ============================================================================

function smokeHighlightAspect(): void {
  console.log('\n== Smoke: highlightAspect ==');
  __resetAuditForTests();
  const r = computeCompatibility(ALICE, BETO);
  const asp = highlightAspect(r.aspects);
  let max = -Infinity;
  for (const a of r.aspects) if (a.strength > max) max = a.strength;
  assertEqual(asp.strength, max, 'highest');
}

// ============================================================================
// Smoke: renderCoupleMesaReal standalone
// ============================================================================

function smokeMesaRealStandalone(): void {
  console.log('\n== Smoke: renderCoupleMesaReal standalone ==');
  const m = renderCoupleMesaReal(ALICE, BETO);
  assertEqual(m.length, 12, '12 houses');
  assertTrue(Object.isFrozen(m), 'frozen');
  assertTrue(m[0].reading.includes('Aries'), 'house 1 mentions Aries sun');
}

// ============================================================================
// Smoke: master number bonus
// ============================================================================

function smokeMasterBonus(): void {
  console.log('\n== Smoke: master number bonus ==');
  __resetAuditForTests();
  const master = computeCompatibility(ALICE, CARLA); // 7 × 11 (master)
  const nonMaster = computeCompatibility(BETO, ALICE); // 9 × 7
  const lpMaster = master.aspects.find((a) => a.type === 'life-path-resonance');
  const lpNon = nonMaster.aspects.find((a) => a.type === 'life-path-resonance');
  assertTrue((lpMaster?.strength ?? 0) >= 78, 'master aspect >= 78');
  assertTrue((lpNon?.strength ?? 0) >= 50, 'non-master aspect >= 50');
}

// ============================================================================
// Smoke: audit export frozen
// ============================================================================

function smokeAudit(): void {
  console.log('\n== Smoke: audit export ==');
  __resetAuditForTests();
  computeCompatibility(ALICE, BETO);
  computeCompatibility(ALICE, CARLA);
  const audit = exportAudit();
  assertTrue(Object.isFrozen(audit), 'audit frozen');
  assertEqual(audit.length, 2, '2 audit entries');
  assertTrue(typeof audit[0].pairId === 'string', 'pairId string');
  assertTrue(typeof audit[0].computedAt === 'number', 'computedAt number');
  assertTrue(typeof audit[0].score === 'number', 'score number');
}

// ============================================================================
// Smoke: catalog sizes
// ============================================================================

function smokeCatalogs(): void {
  console.log('\n== Smoke: catalogs ==');
  assertEqual(SACRED_TRADITIONS.length, 7, '7 traditions');
  assertEqual(ZODIAC_SIGNS.length, 12, '12 signs');
  assertEqual(MESA_REAL_HOUSES.length, 12, '12 houses');
  assertEqual(CROSS_ASPECT_CATALOG.length, 7, '7 catalog entries');
  assertTrue(Object.keys(ORIXA_COMPATIBILITY).length >= 8, '>=8 orixa entries');
  assertTrue(Object.keys(CIGANO_CARD_AFFINITY).length >= 28, '>=28 cigano pairs');
  assertTrue(MASTER_NUMBERS.length === 3, '3 master numbers');
}

// ============================================================================
// Run all
// ============================================================================

function runAll(): void {
  console.log('### W75-D synastry-advanced smoke ###');
  smokeHash();
  smokePairId();
  smokeCompatibility();
  smokeAspectTypes();
  smokeWeakAspects();
  smokeTraditionBreakdown();
  smokeMesaReal();
  smokeRecommendation();
  smokeHighlightAspect();
  smokeMesaRealStandalone();
  smokeMasterBonus();
  smokeAudit();
  smokeCatalogs();
  console.log('\n=== SMOKE ===');
  console.log('Assertions: ' + ASSERTIONS);
  console.log('Failures:   ' + FAILS);
  if (FAILS > 0) {
    console.log('SMOKE FAILED');
    process.exit(1);
  }
  console.log('SMOKE PASS: ' + ASSERTIONS + '/' + ASSERTIONS);
}

runAll();
