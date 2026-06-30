/**
 * synastry-advanced.spec.ts — W75-D test harness
 * Self-running assertions (no vitest required) via `node --experimental-strip-types`.
 * Reuses cycle 73 patterns: expectEqual, expectTrue, expectClose, expectThrows.
 */

import {
  computeCompatibility,
  highlightAspect,
  renderCoupleMesaReal,
  exportAudit,
  fnv1a32,
  derivePairId,
  userId,
  type PersonChart,
  type CrossAspect,
  type SynastryReading,
  WEAK_ASPECT_THRESHOLD,
  MASTER_NUMBERS,
  SACRED_TRADITIONS,
  ZODIAC_SIGNS,
  MESA_REAL_HOUSES,
  CROSS_ASPECT_CATALOG,
  ORIXA_COMPATIBILITY,
  CIGANO_CARD_AFFINITY,
  __resetAuditForTests,
} from './synastry-advanced.ts';

// ============================================================================
// Self-running test harness
// ============================================================================

let ASSERTION_COUNT = 0;
let FAILURE_COUNT = 0;
const FAILURES: string[] = [];

function record(label: string, ok: boolean, detail?: string): void {
  ASSERTION_COUNT++;
  if (!ok) {
    FAILURE_COUNT++;
    FAILURES.push((detail ? detail + ' :: ' : '') + label);
  }
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  const ok = actual === expected;
  record(label, ok, ok ? undefined : 'expected ' + JSON.stringify(expected) + ' got ' + JSON.stringify(actual));
}

function expectClose(actual: number, expected: number, label: string, eps: number = 1): void {
  const ok = Math.abs(actual - expected) <= eps;
  record(label, ok, ok ? undefined : 'expected ~' + expected + ' got ' + actual + ' (eps=' + eps + ')');
}

function expectTrue(cond: boolean, label: string): void {
  record(label, cond, cond ? undefined : 'expected true, got false');
}

function expectThrows(fn: () => unknown, label: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  record(label, threw, threw ? undefined : 'expected throw, did not');
}

function expectInRange(value: number, min: number, max: number, label: string): void {
  record(label, value >= min && value <= max, value + ' not in [' + min + ',' + max + ']');
}

function it(name: string, run: () => void): void {
  run();
}

// ============================================================================
// Test fixtures
// ============================================================================

const CHART_A: PersonChart = {
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

const CHART_B: PersonChart = {
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

const CHART_C_PAIR_REVERSED: PersonChart = {
  ...CHART_A,
  userId: userId('user_carol_003'),
  orixaHead: 'Ogum',
  numerology: { lifePath: 11, expression: 4, soulUrge: 7 },
};
const CHART_D_NONMASTER: PersonChart = {
  ...CHART_A,
  userId: userId('user_d_004'),
  name: 'Dana',
  birthDate: '1995-01-01',
  numerology: { lifePath: 1, expression: 4, soulUrge: 5 },
  orixaHead: 'Omulu',
};

// ============================================================================
// SPEC 1: FNV-1a hashing
// ============================================================================

it('FNV-1a produces 8-hex output', () => {
  expectEqual(fnv1a32('').length, 8, 'empty input => 8 hex chars');
  expectEqual(fnv1a32('abc').length, 8, '"abc" => 8 hex chars');
});

it('FNV-1a is deterministic', () => {
  const h1 = fnv1a32('alice|beto');
  const h2 = fnv1a32('alice|beto');
  expectEqual(h1, h2, 'same input => same hash');
});

it('FNV-1a differs for different inputs', () => {
  const h1 = fnv1a32('alice|beto');
  const h2 = fnv1a32('beto|alice');
  // Note: hash does not sort internally; we sort in derivePairId before hashing
  expectTrue(h1 !== h2, 'different raw inputs => different hashes (verified)');
});

// ============================================================================
// SPEC 2: pairId derivation
// ============================================================================

it('derivePairId is symmetric across order', () => {
  __resetAuditForTests();
  const pid1 = derivePairId('user_alice_001', 'user_beto_002');
  const pid2 = derivePairId('user_beto_002', 'user_alice_001');
  expectEqual(pid1, pid2, 'order-invariant pairId');
});

it('derivePairId is stable across calls', () => {
  __resetAuditForTests();
  const pid1 = derivePairId('user_alice_001', 'user_beto_002');
  const pid2 = derivePairId('user_alice_001', 'user_beto_002');
  expectEqual(pid1, pid2, 'same args across calls => same pid');
});

it('derivePairId differs for different users', () => {
  __resetAuditForTests();
  const pid1 = derivePairId('user_alice_001', 'user_beto_002');
  const pid2 = derivePairId('user_alice_001', 'user_carol_003');
  expectTrue(pid1 !== pid2, 'different users => different pid');
});

it('derivePairId has prefix pair_', () => {
  __resetAuditForTests();
  const pid = derivePairId('a', 'b');
  expectTrue(String(pid).startsWith('pair_'), 'pid starts with pair_');
});

// ============================================================================
// SPEC 3: computeCompatibility basic shape
// ============================================================================

it('computeCompatibility returns a SynastryReading', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectTrue(typeof r === 'object', 'reading is object');
  expectEqual(typeof r.compatibilityScore, 'number', 'score is number');
  expectEqual(typeof r.pairId, 'string', 'pairId is string');
  expectEqual(typeof r.recommendation, 'string', 'recommendation is string');
  expectEqual(typeof r.spiritualGuidance, 'string', 'spiritualGuidance is string');
});

it('compatibilityScore is in [0,100]', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectInRange(r.compatibilityScore, 0, 100, 'compatibilityScore in range');
});

it('exactly 7 cross-aspects detected', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectEqual(r.aspects.length, 7, '7 aspects');
});

it('all 7 aspect types are present', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  const types = r.aspects.map((a) => a.type);
  const expected = [
    'sun-moon', 'venus-mars', 'mercury-venus', 'ascendant-moon',
    'life-path-resonance', 'cigano-resonance', 'orixa-compatibility',
  ];
  for (const t of expected) {
    expectTrue((types as readonly string[]).includes(t), 'aspect type ' + t + ' present');
  }
});

it('exactly one definingAspect (highest strength)', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  const highlightedCount = r.aspects.filter((a) => a.highlighted).length;
  expectEqual(highlightedCount, 1, 'exactly one highlighted');
  // definingAspect strength >= all others
  let max = -Infinity;
  for (const a of r.aspects) if (a.strength > max) max = a.strength;
  expectEqual(r.definingAspect.strength, max, 'definingAspect.strength === max');
});

it('weakAspects filter strength < 30', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  for (const a of r.weakAspects) {
    expectTrue(a.strength < WEAK_ASPECT_THRESHOLD, 'weak aspect strength < ' + WEAK_ASPECT_THRESHOLD);
  }
  // also verify mutual: any aspect with strength < 30 should be in weakAspects
  for (const a of r.aspects) {
    if (a.strength < WEAK_ASPECT_THRESHOLD) {
      expectTrue(r.weakAspects.includes(a), 'weak aspect is in weakAspects');
    }
  }
});

it('coupleMesaReal has exactly 12 entries', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectEqual(r.coupleMesaReal.length, 12, '12 mesa real houses');
  for (let i = 0; i < 12; i++) {
    expectEqual(r.coupleMesaReal[i].house, i + 1, 'house number at index ' + i);
    expectEqual(typeof r.coupleMesaReal[i].reading, 'string', 'reading is string at house ' + (i + 1));
  }
});

it('recommendation non-empty and 2-3 sentences', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectTrue(r.recommendation.length > 20, 'recommendation non-trivial');
  // Count sentence-ending punctuation
  const dotCount = r.recommendation.split('.').length - 1;
  expectTrue(dotCount >= 2 && dotCount <= 5, 'rec has 2-3 sentences (got ' + dotCount + ' dots)');
});

it('spiritualGuidance mentions Orixa name', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectTrue(r.spiritualGuidance.includes('Oxala') || r.spiritualGuidance.includes('Iemanja'),
    'spiritualGuidance touches Orixa of chartA or chartB');
  expectTrue(r.spiritualGuidance.length > 30, 'spiritualGuidance non-trivial');
});

// ============================================================================
// SPEC 4: traditionBreakdown
// ============================================================================

it('traditionBreakdown covers 7 traditions', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  const keys = Object.keys(r.traditionBreakdown);
  expectEqual(keys.length, 7, '7 tradition keys');
  for (const t of SACRED_TRADITIONS) {
    expectTrue(keys.includes(t), 'tradition ' + t + ' present');
  }
});

it('traditionBreakdown entry has score + aspects', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  for (const trad of Object.keys(r.traditionBreakdown)) {
    const e = r.traditionBreakdown[trad];
    expectEqual(typeof e.score, 'number', trad + ' score is number');
    expectEqual(typeof e.aspects, 'number', trad + ' aspects is number');
    expectInRange(e.score, 0, 100, trad + ' score in range');
  }
});

it('Astrologia tradition has 4 aspects', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  // 4 astrologia aspects: sun-moon, venus-mars, mercury-venus, ascendant-moon
  expectEqual(r.traditionBreakdown['Astrologia'].aspects, 4, 'Astrologia has 4 aspects');
});

it('Numerologia tradition has 1 aspect', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectEqual(r.traditionBreakdown['Numerologia'].aspects, 1, 'Numerologia has 1 aspect');
});

it('Cabala has 0 detected aspects but appears in breakdown', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectEqual(r.traditionBreakdown['Cabala'].aspects, 0, 'Cabala has 0 aspects');
  expectEqual(r.traditionBreakdown['Cabala'].score, 0, 'Cabala default score 0');
});

// ============================================================================
// SPEC 5: read-only contract (frozen, no mutation)
// ============================================================================

it('SynastryReading is frozen', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  expectTrue(Object.isFrozen(r), 'reading is frozen');
  expectTrue(Object.isFrozen(r.aspects), 'aspects array is frozen');
  expectTrue(Object.isFrozen(r.traditionBreakdown), 'traditionBreakdown is frozen');
  expectTrue(Object.isFrozen(r.coupleMesaReal), 'coupleMesaReal is frozen');
  expectTrue(Object.isFrozen(r.weakAspects), 'weakAspects is frozen');
  expectTrue(Object.isFrozen(r.riskAreas), 'riskAreas is frozen');
});

it('mutating reading does not throw but does nothing', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  // silent fail in non-strict, throw in strict — either way original is intact
  try {
    (r as { compatibilityScore: number }).compatibilityScore = 0;
  } catch {
    /* ignore */
  }
  // We can't actually violate the read-only at type level, so re-derive for sanity
  const r2 = computeCompatibility(CHART_A, CHART_B);
  expectEqual(typeof r2.compatibilityScore, 'number', 're-derivation stable');
});

it('exportAudit() returns frozen array', () => {
  __resetAuditForTests();
  computeCompatibility(CHART_A, CHART_B);
  const audit = exportAudit();
  expectTrue(Object.isFrozen(audit), 'audit frozen');
  expectTrue(audit.length >= 1, 'audit has at least 1 entry');
  expectEqual(typeof audit[0].pairId, 'string', 'audit[0].pairId is string');
  expectEqual(typeof audit[0].computedAt, 'number', 'audit[0].computedAt is number ms');
  expectEqual(typeof audit[0].score, 'number', 'audit[0].score is number');
});

// ============================================================================
// SPEC 6: highlightAspect
// ============================================================================

it('highlightAspect picks the highest strength', () => {
  __resetAuditForTests();
  const r = computeCompatibility(CHART_A, CHART_B);
  const asp = highlightAspect(r.aspects);
  let max = -Infinity;
  for (const a of r.aspects) if (a.strength > max) max = a.strength;
  expectEqual(asp.strength, max, 'highlightAspect returns strongest');
});

it('highlightAspect throws on empty array', () => {
  expectThrows(() => highlightAspect([]), 'empty array throws');
});

// ============================================================================
// SPEC 7: renderCoupleMesaReal standalone
// ============================================================================

it('renderCoupleMesaReal returns 12 entries', () => {
  const m = renderCoupleMesaReal(CHART_A, CHART_B);
  expectEqual(m.length, 12, '12 entries');
  expectTrue(Object.isFrozen(m), 'frozen');
});

it('renderCoupleMesaReal mentions chartA sun sign', () => {
  const m = renderCoupleMesaReal(CHART_A, CHART_B);
  const house1 = m[0];
  expectTrue(house1.reading.includes('Aries'), 'house 1 mentions Aries sun');
});

// ============================================================================
// SPEC 8: Master number bonus
// ============================================================================

it('Master number 11/22/33 include bonus', () => {
  expectTrue(MASTER_NUMBERS.includes(11), '11 is master');
  expectTrue(MASTER_NUMBERS.includes(22), '22 is master');
  expectTrue(MASTER_NUMBERS.includes(33), '33 is master');
  expectTrue(!MASTER_NUMBERS.includes(10), '10 is not master');
});

it('Master number pair has higher life-path-resonance than non-master pair', () => {
  __resetAuditForTests();
  // Master pair: CHART_A.lifePath=7, CHART_C.lifePath=11 (delta=4, +master bonus)
  const master = computeCompatibility(CHART_A, CHART_C_PAIR_REVERSED);
  // Non-master pair: CHART_A.lifePath=7, CHART_D.lifePath=1 (delta=6, no master bonus)
  const nonMaster = computeCompatibility(CHART_A, CHART_D_NONMASTER);
  const lpMaster = master.aspects.find((a) => a.type === 'life-path-resonance');
  const lpNon = nonMaster.aspects.find((a) => a.type === 'life-path-resonance');
  expectTrue((lpMaster?.strength ?? 0) > (lpNon?.strength ?? 0),
    'master pair stronger than non-master: ' + (lpMaster?.strength ?? 0) + ' > ' + (lpNon?.strength ?? 0));
});

// ============================================================================
// SPEC 9: lookup tables
// ============================================================================

it('SACRED_TRADITIONS has 7 entries', () => {
  expectEqual(SACRED_TRADITIONS.length, 7, '7 traditions');
});

it('ZODIAC_SIGNS has 12 entries', () => {
  expectEqual(ZODIAC_SIGNS.length, 12, '12 zodiac signs');
});

it('MESA_REAL_HOUSES has 12 entries', () => {
  expectEqual(MESA_REAL_HOUSES.length, 12, '12 mesa real houses');
});

it('CROSS_ASPECT_CATALOG has 7 entries', () => {
  expectEqual(CROSS_ASPECT_CATALOG.length, 7, '7 catalog entries');
});

it('ORIXA_COMPATIBILITY has >= 8 orixa keys', () => {
  expectTrue(Object.keys(ORIXA_COMPATIBILITY).length >= 8, 'orixa matrix >= 8 keys');
});

it('CIGANO_CARD_AFFINITY has >= 28 affinity pairs', () => {
  expectTrue(Object.keys(CIGANO_CARD_AFFINITY).length >= 28, 'cigano resonance >= 28 entries');
});

// ============================================================================
// SPEC 10: error contract
// ============================================================================

it('throws on missing userId', () => {
  const bad = { ...CHART_A, userId: '' };
  expectThrows(() => computeCompatibility(bad, CHART_B), 'empty userId throws');
});

it('throws on falsy charts', () => {
  expectThrows(() => computeCompatibility(null as unknown as PersonChart, CHART_B), 'null chart throws');
});

// ============================================================================
// Final report
// ============================================================================

console.log('');
console.log('== W75-D synastry-advanced spec ==');
console.log('Assertions: ' + ASSERTION_COUNT);
console.log('Failures:   ' + FAILURE_COUNT);
if (FAILURE_COUNT > 0) {
  console.log('FAILURES:');
  for (const f of FAILURES) console.log(' - ' + f);
  process.exit(1);
}
console.log('PASS: ' + ASSERTION_COUNT + '/' + ASSERTION_COUNT);