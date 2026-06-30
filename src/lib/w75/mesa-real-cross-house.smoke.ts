/**
 * ════════════════════════════════════════════════════════════════════════════
 * W75-A — MESA REAL CROSS-HOUSE · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Inline checks that mirror the production engine logic without depending
 * on a test runner. ≥15 inline assertions covering regex, SHA-256, master
 * numbers, table integrity, and end-to-end cross-house interpret.
 *
 * Run with: node --experimental-strip-types mesa-real-cross-house.smoke.ts
 */

// @ts-ignore — node-stubs.d.ts provides globals.
import {
  crossHouseInterpret,
  listMesaRealHouses,
  exportAudit,
  hashCacheKey,
  mrh,
  topic,
  reduceWithMasters,
  sacredMatch,
  sha256HexSync,
  canonicalJson,
  _resetAuditForTests,
  type MesaRealHouseNumber,
  type MesaRealTopic,
} from './mesa-real-cross-house.ts';

// `process` is not declared in node-stubs.d.ts worktree tsconfig. Declare inline.
declare const process: { exit(code: number): never };

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean): void {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    console.log(`  ✗ ${label}`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Inline checks
// ════════════════════════════════════════════════════════════════════════════

console.log('W75-A Mesa Real Cross-House — Smoke Harness\n');

// Section 1 — Branded primitives
check('mrh(1) returns branded 1', mrh(1) === 1);
check('mrh(12) returns branded 12', mrh(12) === 12);
let threw = false;
try { mrh(0); } catch { threw = true; }
check('mrh(0) throws', threw);
threw = false;
try { mrh(13); } catch { threw = true; }
check('mrh(13) throws', threw);
check('topic("sexualidade") passes', topic('sexualidade') === 'sexualidade');
threw = false;
try { topic('xyz'); } catch { threw = true; }
check('topic("xyz") throws', threw);

// Section 2 — Master-number preservation (cycle 72)
check('reduceWithMasters(11) === 11', reduceWithMasters(11) === 11);
check('reduceWithMasters(22) === 22', reduceWithMasters(22) === 22);
check('reduceWithMasters(33) === 33', reduceWithMasters(33) === 33);
check('reduceWithMasters(29) === 11', reduceWithMasters(29) === 11);
check('reduceWithMasters(38) === 11', reduceWithMasters(38) === 11);
check('reduceWithMasters(13) === 4', reduceWithMasters(13) === 4);
check('reduceWithMasters(18) === 9', reduceWithMasters(18) === 9);

// Section 3 — Sacred token regex
check('sacredMatch("Lilith em Escorpião", "Lilith") === true',
  sacredMatch('Lilith em Escorpião', 'Lilith'));
check('sacredMatch("Oxum", "Ogum") === false',
  !sacredMatch('Oxum', 'Ogum'));
check('sacredMatch("Lilithiane", "Lilith") === false (boundary)',
  !sacredMatch('Lilithiane', 'Lilith'));

// Section 4 — SHA-256 fixtures
check('sha256HexSync("") === known empty',
  sha256HexSync('') === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
check('sha256HexSync("abc") === known abc',
  sha256HexSync('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
check('sha256HexSync output length === 64', sha256HexSync('foo').length === 64);

// Section 5 — Canonical JSON (cycle 67)
check('canonicalJson sorts object keys',
  canonicalJson({ b: 2, a: 1 }) === '{"a":1,"b":2}');
check('canonicalJson of null === "null"', canonicalJson(null) === 'null');
check('canonicalJson recurses into arrays',
  canonicalJson([1, { y: 1, x: 2 }]) === '[1,{"x":2,"y":1}]');

// Section 6 — Table integrity (12 houses, 7 traditions woven)
const all = listMesaRealHouses();
check('listMesaRealHouses().length === 12', all.length === 12);
const allBonus = new Set<string>();
for (const h of all) {
  for (const t of h.bonusTraditions) allBonus.add(t);
}
const requiredTraditions = ['Orixás', 'Cabala & Tantra', 'Tarot', 'Runas'];
for (const t of requiredTraditions) {
  check(`tradition "${t}" appears in bonus traditions`,
    allBonus.has(t));
}

// Section 7 — End-to-end cross-house interpret
_resetAuditForTests();
const out = crossHouseInterpret({
  mesaRealHouseNumber: 8 as MesaRealHouseNumber,
  topic: 'sexualidade' as MesaRealTopic,
  westernNatalChart: {
    casa8: { casa: 8, sign: 'Escorpião', planetsInside: ['Plutão'], summary: 'Sexualidade intensa, transformação.' },
  },
  lilith: { sign: 'Escorpião', house: 8, aspects: [{ body: 'Plutão', type: 'conjunção', orb: 1.2 }] },
  numerologyAspects: { lifePath: 11, expression: 22, soulUrge: 33, personalYear: 7 },
  akashicContext: { previousSessions: [{ date: '2026-06-01', houseNumber: 8, insight: 'ok' }] },
});
check('crossHouseInterpret house 8 → mesaRealHouseNumber 8',
  out.mesaRealHouseNumber === 8);
check('output.surface contains "Caixão"', out.surface.includes('Caixão'));
check('output.depthAstrologia contains "Plutão"',
  out.depthAstrologia.includes('Plutão'));
check('output.depthLilith contains "Lilith"', out.depthLilith.includes('Lilith'));
check('output.depthNumerologia contains "LifePath 11"',
  out.depthNumerologia.includes('LifePath 11'));
check('output.confidence === "high" (no gaps)', out.confidence === 'high');
check('output.traditionsUsed includes 5+ traditions',
  out.traditionsUsed.length >= 5);
check('output.unifiedReading includes Cabala & Tantra',
  out.unifiedReading.includes('Cabala & Tantra'));
check('output.unifiedReading includes Tarot',
  out.unifiedReading.includes('Tarot'));
check('output.meta.cacheKey matches /^w75a:[0-9a-f]{32}$/',
  /^w75a:[0-9a-f]{32}$/.test(out.meta.cacheKey));
check('output is Object.isFrozen', Object.isFrozen(out));
check('output.bonusWeaves is Object.isFrozen', Object.isFrozen(out.bonusWeaves));
check('output.dataGaps is Object.isFrozen', Object.isFrozen(out.dataGaps));
check('output.traditionsUsed is Object.isFrozen', Object.isFrozen(out.traditionsUsed));

// Section 8 — Cache key stability
const k1 = hashCacheKey({
  mesaRealHouseNumber: 8 as MesaRealHouseNumber,
  topic: 'sexualidade' as MesaRealTopic,
  westernNatalChart: { casa8: { casa: 8, sign: 'Escorpião', planetsInside: [], summary: '' } },
  lilith: { sign: 'Escorpião', house: 8, aspects: [] },
  numerologyAspects: { lifePath: 1, expression: 1, soulUrge: 1, personalYear: 1 },
});
const k2 = hashCacheKey({
  mesaRealHouseNumber: 8 as MesaRealHouseNumber,
  topic: 'sexualidade' as MesaRealTopic,
  westernNatalChart: { casa8: { casa: 8, sign: 'Escorpião', planetsInside: [], summary: '' } },
  lilith: { sign: 'Escorpião', house: 8, aspects: [] },
  numerologyAspects: { lifePath: 1, expression: 1, soulUrge: 1, personalYear: 1 },
});
check('cache key stable for identical input', k1 === k2);
const k3 = hashCacheKey({
  mesaRealHouseNumber: 8 as MesaRealHouseNumber,
  topic: 'sexualidade' as MesaRealTopic,
  westernNatalChart: {},
  lilith: { sign: 'Escorpião', house: 8, aspects: [] },
  numerologyAspects: { lifePath: 1, expression: 1, soulUrge: 1, personalYear: 1 },
});
check('cache key differs when chart differs', k1 !== k3);

// Section 9 — Audit log
_resetAuditForTests();
crossHouseInterpret({
  mesaRealHouseNumber: 1 as MesaRealHouseNumber,
  topic: 'comunicacao' as MesaRealTopic,
  westernNatalChart: {},
  lilith: { sign: 'Áries', house: 1, aspects: [] },
  numerologyAspects: { lifePath: 1, expression: 1, soulUrge: 1, personalYear: 1 },
});
crossHouseInterpret({
  mesaRealHouseNumber: 2 as MesaRealHouseNumber,
  topic: 'financas' as MesaRealTopic,
  westernNatalChart: {},
  lilith: { sign: 'Touro', house: 2, aspects: [] },
  numerologyAspects: { lifePath: 2, expression: 2, soulUrge: 2, personalYear: 2 },
});
const audit = exportAudit();
check('audit log has 2 entries', audit.length === 2);
for (const entry of audit) {
  check(`audit entry house ${entry.mesaRealHouseNumber} is frozen`,
    Object.isFrozen(entry));
}

// Section 10 — Confidence gap accounting
_resetAuditForTests();
const cHigh = crossHouseInterpret({
  mesaRealHouseNumber: 5 as MesaRealHouseNumber,
  topic: 'saude' as MesaRealTopic,
  westernNatalChart: {
    casa6: { casa: 6, sign: 'Virgem', planetsInside: [], summary: 'Saúde.' },
  },
  lilith: { sign: 'Leão', house: 5, aspects: [{ body: 'Sol', type: 'conjunção', orb: 0.5 }] },
  numerologyAspects: { lifePath: 3, expression: 3, soulUrge: 3, personalYear: 3 },
  akashicContext: { previousSessions: [{ date: '2026-06-01', houseNumber: 5, insight: 'x' }] },
});
check('full input → confidence high', cHigh.confidence === 'high');

const cLow = crossHouseInterpret({
  mesaRealHouseNumber: 5 as MesaRealHouseNumber,
  topic: 'saude' as MesaRealTopic,
  westernNatalChart: {},
  lilith: { sign: 'Leão', house: 5, aspects: [] },
  numerologyAspects: { lifePath: 3, expression: 3, soulUrge: 3, personalYear: 3 },
});
check('empty chart + empty aspects → confidence low', cLow.confidence === 'low');

// ════════════════════════════════════════════════════════════════════════════
// Report
// ════════════════════════════════════════════════════════════════════════════

console.log('');
console.log(`  SMOKE RESULT: ${passes} PASS · ${fails} FAIL · ${passes + fails} total`);
if (fails > 0) {
  process.exit(1);
}