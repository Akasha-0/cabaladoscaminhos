/**
 * ════════════════════════════════════════════════════════════════════════════
 * W75-A — MESA REAL CROSS-HOUSE · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running test harness — no vitest. Imports the engine directly and
 * registers assertions. The spec runner at the bottom executes them and
 * prints pass/fail counts. Exits with code 0 on full PASS.
 *
 * Cycle 73 lesson: wrap registered `it()` callbacks in a closure that calls
 * a `_reset()` BEFORE invoking the body, so state never leaks between
 * tests.
 *
 * Cycle 73 lesson: Result narrowing positive — `if (r.ok)` not `if (!r.ok)`.
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };
import {
  crossHouseInterpret,
  listMesaRealHouses,
  exportAudit,
  hashCacheKey,
  mrh,
  topic,
  reduceWithMasters,
  sacredMatch,
  sha256Hex,
  sha256HexSync,
  canonicalJson,
  hmacSha256,
  _resetAuditForTests,
  type CrossHouseInput,
  type CrossHouseOutput,
  type MesaRealHouse,
  type MesaRealHouseNumber,
  type MesaRealTopic,
  type NatalHouseReading,
  type Aspect,
} from './mesa-real-cross-house.ts';

// ════════════════════════════════════════════════════════════════════════════
// Tiny harness
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) throw new Error(`assertTrue FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertContains(haystack: string, needle: string, label?: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(
      `assertContains FAIL${label ? ' (' + label + ')' : ''}: ${JSON.stringify(needle)} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

function assertMatch(haystack: string, re: RegExp, label?: string): void {
  if (!re.test(haystack)) {
    throw new Error(
      `assertMatch FAIL${label ? ' (' + label + ')' : ''}: ${re} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Test data fixtures
// ════════════════════════════════════════════════════════════════════════════

function makeBaseNatalChart(): CrossHouseInput['westernNatalChart'] {
  return {
    casa1: { casa: 1, sign: 'Áries', planetsInside: ['Marte'], summary: 'Eu ativo, pioneirismo.' },
    casa2: { casa: 2, sign: 'Touro', planetsInside: ['Vênus'], summary: 'Recursos pelo valor estável.' },
    casa3: { casa: 3, sign: 'Gêmeos', planetsInside: ['Mercúrio'], summary: 'Comunicação rápida, irmãos.' },
    casa4: { casa: 4, sign: 'Câncer', planetsInside: ['Lua'], summary: 'Lar emocional, raízes profundas.' },
    casa5: { casa: 5, sign: 'Leão', planetsInside: ['Sol'], summary: 'Criatividade, filhos, romance.' },
    casa6: { casa: 6, sign: 'Virgem', planetsInside: [], summary: 'Rotina, saúde, serviço.' },
    casa7: { casa: 7, sign: 'Libra', planetsInside: ['Vênus'], summary: 'Parcerias, casamento, o outro.' },
    casa8: { casa: 8, sign: 'Escorpião', planetsInside: ['Plutão'], summary: 'Sexualidade, morte, herança, taboo.' },
    casa9: { casa: 9, sign: 'Sagitário', planetsInside: ['Júpiter'], summary: 'Viagens, filosofia, estrangeiro.' },
    casa10: { casa: 10, sign: 'Capricórnio', planetsInside: ['Saturno'], summary: 'Carreira, vocação pública, MC.' },
    casa11: { casa: 11, sign: 'Aquário', planetsInside: ['Urano'], summary: 'Amigos, grupos, causas coletivas.' },
    casa12: { casa: 12, sign: 'Peixes', planetsInside: ['Netuno'], summary: 'Inconsciente, espiritualidade, retiro.' },
  };
}

function makeBaseLilith(aspects: Aspect[] = []): CrossHouseInput['lilith'] {
  return {
    sign: 'Escorpião',
    house: 8,
    aspects,
  };
}

function makeBaseInput(overrides: Partial<CrossHouseInput> = {}): CrossHouseInput {
  const defaults: CrossHouseInput = {
    mesaRealHouseNumber: 8 as MesaRealHouseNumber,
    topic: 'sexualidade' as MesaRealTopic,
    westernNatalChart: makeBaseNatalChart(),
    lilith: makeBaseLilith([
      { body: 'Plutão', type: 'conjunção', orb: 1.2 },
      { body: 'Vênus', type: 'oposição', orb: 3.5 },
    ]),
    numerologyAspects: {
      lifePath: 11,
      expression: 22,
      soulUrge: 33,
      personalYear: 7,
    },
    akashicContext: {
      previousSessions: [
        { date: '2026-05-12', houseNumber: 8, insight: 'Transformação profunda na intimidade.' },
      ],
    },
  };
  return { ...defaults, ...overrides };
}

// ════════════════════════════════════════════════════════════════════════════
// SPECS
// ════════════════════════════════════════════════════════════════════════════

it('branded factory mrh accepts 1..12 and rejects 0/13/negative', () => {
  assertEqual(mrh(1), 1);
  assertEqual(mrh(12), 12);
  let threw = false;
  try { mrh(0); } catch { threw = true; }
  assertTrue(threw, 'mrh(0) should throw');
  threw = false;
  try { mrh(13); } catch { threw = true; }
  assertTrue(threw, 'mrh(13) should throw');
  threw = false;
  try { mrh(-1); } catch { threw = true; }
  assertTrue(threw, 'mrh(-1) should throw');
});

it('topic() factory accepts known topics and rejects unknown', () => {
  assertEqual(topic('sexualidade'), 'sexualidade');
  assertEqual(topic('trabalho'), 'trabalho');
  let threw = false;
  try { topic('astronomia'); } catch { threw = true; }
  assertTrue(threw, 'unknown topic should throw');
});

it('reduceWithMasters preserves 11, 22, 33 master numbers', () => {
  assertEqual(reduceWithMasters(11), 11);
  assertEqual(reduceWithMasters(22), 22);
  assertEqual(reduceWithMasters(33), 33);
  // Non-master reductions
  assertEqual(reduceWithMasters(29), 11, '29 → 11 (2+9) preserved');
  assertEqual(reduceWithMasters(38), 11, '38 → 11 (3+8) preserved');
  assertEqual(reduceWithMasters(58), 4, '58 → 13 (5+8) → 4 (1+3), no master step2');
  assertEqual(reduceWithMasters(13), 4, '13 → 4 (1+3)');
  assertEqual(reduceWithMasters(9), 9);
  assertEqual(reduceWithMasters(18), 9, '18 → 9');
  assertEqual(reduceWithMasters(27), 9, '27 → 9 (2+7)');
  assertEqual(reduceWithMasters(47), 11, '47 → 11 (4+7) preserved');
});

it('reduceWithMasters throws on negative / NaN / Infinity', () => {
  for (const bad of [-1, NaN, Infinity, -Infinity]) {
    let threw = false;
    try { reduceWithMasters(bad as number); } catch { threw = true; }
    assertTrue(threw, `should throw on ${bad}`);
  }
});

it('sacredMatch uses word boundaries, not bare substring', () => {
  assertTrue(sacredMatch('Lilith em Escorpião', 'Lilith'));
  assertTrue(sacredMatch('o Ogum vem', 'Ogum'));
  assertTrue(!sacredMatch('Lilithiane', 'Lilith'), 'should not match inside larger word');
  assertTrue(!sacredMatch('Ogumância', 'Ogum'));
  assertTrue(sacredMatch('Oxum e Iansã', 'Oxum'));
});

it('sha256HexSync matches known fixtures (empty + "abc")', () => {
  assertEqual(
    sha256HexSync(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'SHA-256 of empty string',
  );
  assertEqual(
    sha256HexSync('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    'SHA-256 of "abc"',
  );
});

it('canonicalJson sorts keys for stable caching', () => {
  assertEqual(canonicalJson({ b: 2, a: 1 }), '{"a":1,"b":2}');
  assertEqual(canonicalJson([3, { y: 1, x: 2 }]), '[3,{"x":2,"y":1}]');
  assertEqual(canonicalJson(null), 'null');
  assertEqual(canonicalJson(42), '42');
});

it('hashCacheKey is stable for same input, different for different input', () => {
  _resetAuditForTests();
  const a = makeBaseInput();
  const b = makeBaseInput();
  assertEqual(hashCacheKey(a), hashCacheKey(b), 'same input → same key');
  const c = makeBaseInput({ mesaRealHouseNumber: 1 });
  assertTrue(hashCacheKey(a) !== hashCacheKey(c), 'different house → different key');
  assertMatch(hashCacheKey(a), /^w75a:[0-9a-f]{32}$/);
});

it('listMesaRealHouses returns 12 frozen summaries', () => {
  const list = listMesaRealHouses();
  assertEqual(list.length, 12);
  for (const h of list) {
    assertTrue(Object.isFrozen(h), `house summary ${h.number} should be frozen`);
    assertTrue(h.number >= 1 && h.number <= 12);
    assertTrue(typeof h.ciganoCard === 'string' && h.ciganoCard.length > 0);
    assertTrue(typeof h.ciganoSurface === 'string' && h.ciganoSurface.length > 0);
    assertTrue(typeof h.topic === 'string' && h.topic.length > 0);
    assertTrue(h.astrologiaCasa >= 1 && h.astrologiaCasa <= 12);
  }
});

it('House 8 (Caixão / sexualidade) cross-house includes 5 traditions', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput());
  assertEqual(out.mesaRealHouseNumber, 8);
  assertEqual(out.topic, 'sexualidade');
  assertTrue(out.traditionsUsed.includes('Cigano'));
  assertTrue(out.traditionsUsed.includes('Astrologia'));
  assertTrue(out.traditionsUsed.includes('Numerologia Cabalística'));
  assertTrue(out.traditionsUsed.includes('Cabala & Tantra'));
  assertTrue(out.traditionsUsed.includes('Tarot'));
  assertTrue(out.traditionsUsed.length >= 5, `traditionsUsed length = ${out.traditionsUsed.length}`);
  assertContains(out.surface, 'Caixão');
  assertContains(out.surface, 'Casa 8');
});

it('House 1 (Cavaleiro / comunicacao) includes Orixás + Runas', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    mesaRealHouseNumber: 1,
    topic: 'comunicacao',
  }));
  assertEqual(out.mesaRealHouseNumber, 1);
  assertTrue(out.traditionsUsed.includes('Orixás'), 'house 1 must include Orixás');
  assertTrue(out.traditionsUsed.includes('Runas'), 'house 1 must include Runas');
  assertContains(out.unifiedReading, 'Ogum');
  assertContains(out.unifiedReading, 'Ehwaz');
});

it('House 4 (Casa / familia) weaves Orixás Oxum', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    mesaRealHouseNumber: 4,
    topic: 'familia',
  }));
  assertEqual(out.mesaRealHouseNumber, 4);
  assertEqual(out.topic, 'familia');
  assertContains(out.unifiedReading, 'Oxum');
  assertTrue(out.traditionsUsed.includes('Orixás'));
});

it('House 10 (Foice / trabalho) includes 5+ traditions and Iansã', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    mesaRealHouseNumber: 10,
    topic: 'trabalho',
  }));
  assertEqual(out.mesaRealHouseNumber, 10);
  assertEqual(out.topic, 'trabalho');
  assertContains(out.unifiedReading, 'Iansã');
  assertTrue(out.traditionsUsed.includes('Orixás'));
  assertTrue(out.traditionsUsed.includes('Numerologia Cabalística'));
});

it('All 12 Mesa Real houses iterate without throwing', () => {
  _resetAuditForTests();
  const allHouses: ReadonlyArray<MesaRealHouseNumber> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  for (const n of allHouses) {
    const seed = listMesaRealHouses().find((h) => h.number === n);
    assertTrue(seed, `house ${n} must exist in summary list`);
    const out = crossHouseInterpret(makeBaseInput({
      mesaRealHouseNumber: n,
      topic: seed!.topic,
    }));
    assertEqual(out.mesaRealHouseNumber, n);
    assertTrue(out.unifiedReading.length > 50, `house ${n} unified reading too short`);
    assertTrue(out.traditionsUsed.length >= 3, `house ${n} must use ≥3 traditions`);
  }
});

it('Every house touches ≥1 of {Orixás, Cabala & Tantra, Tarot, Runas} (bonus coverage)', () => {
  const all = listMesaRealHouses();
  for (const h of all) {
    const bonusSet = new Set(h.bonusTraditions);
    const touched =
      bonusSet.has('Orixás') ||
      bonusSet.has('Cabala & Tantra') ||
      bonusSet.has('Tarot') ||
      bonusSet.has('Runas');
    assertTrue(touched, `house ${h.number} (${h.ciganoCard}) lacks bonus tradition`);
  }
});

it('Lilith contribution includes sign + casa + aspects', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    mesaRealHouseNumber: 7,
    topic: 'relacionamentos',
  }));
  assertContains(out.depthLilith, 'Escorpião');
  assertContains(out.depthLilith, 'Casa 8');
  assertContains(out.depthLilith, 'Plutão');
  assertContains(out.depthLilith, 'Vênus');
  assertContains(out.depthLilith, 'conjunção');
});

it('Numerologia contribution preserves master numbers in display', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput());
  // base has LifePath=11, Expression=22, SoulUrge=33 — all should appear
  assertMatch(out.depthNumerologia, /LifePath 11/);
  assertMatch(out.depthNumerologia, /Expressão 22/);
  assertMatch(out.depthNumerologia, /Alma 33/);
  assertMatch(out.depthNumerologia, /Ano Pessoal 7/);
});

it('Astrologia depth uses the chart when casa is provided', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput());
  assertContains(out.depthAstrologia, 'Plutão', 'Casa 8 reading has Plutão inside');
  assertContains(out.depthAstrologia, 'Escorpião');
});

it('Astrologia depth gracefully handles missing casa (data gap)', () => {
  _resetAuditForTests();
  const chart = makeBaseNatalChart();
  delete (chart as Record<string, unknown>).casa8;
  const out = crossHouseInterpret(makeBaseInput({ westernNatalChart: chart }));
  assertContains(out.depthAstrologia, 'não foi fornecida');
});

it('Confidence: high when no gaps, medium when 1, low when ≥2', () => {
  _resetAuditForTests();
  // Full input → high
  const full = crossHouseInterpret(makeBaseInput());
  assertEqual(full.confidence, 'high');

  // Drop Lilith aspects → 1 gap → medium
  const noAspects = crossHouseInterpret(makeBaseInput({
    lilith: makeBaseLilith([]),
  }));
  assertEqual(noAspects.confidence, 'medium');

  // Drop everything optional → multiple gaps → low
  const minimal = crossHouseInterpret(makeBaseInput({
    lilith: makeBaseLilith([]),
    akashicContext: { previousSessions: [] },
  }));
  assertEqual(minimal.confidence, 'low');
});

it('dataGaps correctly reports missing akashic + Lilith aspects', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    akashicContext: { previousSessions: [] },
  }));
  assertTrue(out.dataGaps.includes('sessões akáshicas prévias'));
  const out2 = crossHouseInterpret(makeBaseInput({
    lilith: makeBaseLilith([]),
  }));
  assertTrue(out2.dataGaps.includes('aspectos de Lilith'));
});

it('cacheKey identical across runs for same input (deterministic)', () => {
  _resetAuditForTests();
  const a = makeBaseInput();
  const k1 = hashCacheKey(a);
  const k2 = hashCacheKey(a);
  assertEqual(k1, k2);
  // different lilith sign → different key
  const b = makeBaseInput({ lilith: { ...a.lilith, sign: 'Libra' } });
  assertTrue(hashCacheKey(a) !== hashCacheKey(b));
});

it('cacheKey differs when numerology changes', () => {
  _resetAuditForTests();
  const a = makeBaseInput();
  const b = makeBaseInput({ numerologyAspects: { ...a.numerologyAspects, lifePath: 7 } });
  assertTrue(hashCacheKey(a) !== hashCacheKey(b));
});

it('topic mismatch is recorded as data gap', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    mesaRealHouseNumber: 8,
    topic: 'trabalho', // wrong for house 8 (sexualidade)
  }));
  assertTrue(
    out.dataGaps.some((g) => g.includes('topic solicitado')),
    'topic mismatch should be in dataGaps',
  );
  // effective topic falls back to the house's own topic
  assertEqual(out.topic, 'sexualidade');
});

it('unifiedReading contains surface + astrology + lilith + numerology + bonus markers', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput());
  const u = out.unifiedReading.toLowerCase();
  assertTrue(u.includes('casa 8 da mesa real'));
  assertTrue(u.includes('caixão'));
  assertTrue(u.includes('lilith'));
  assertTrue(u.includes('lifepath'));
  assertTrue(u.includes('numerologia'));
  // bonus weaves for house 8: Cabala & Tantra + Tarot
  assertTrue(u.includes('cabala & tantra'));
  assertTrue(u.includes('tarot'));
});

it('audit log records every interpretation', () => {
  _resetAuditForTests();
  crossHouseInterpret(makeBaseInput({ mesaRealHouseNumber: 1, topic: 'comunicacao' }));
  crossHouseInterpret(makeBaseInput({ mesaRealHouseNumber: 8, topic: 'sexualidade' }));
  crossHouseInterpret(makeBaseInput({ mesaRealHouseNumber: 12, topic: 'espiritualidade' }));
  const log = exportAudit();
  assertEqual(log.length, 3);
  for (const entry of log) {
    assertTrue(Object.isFrozen(entry), 'audit entries must be frozen');
    assertTrue(Object.isFrozen(entry.bonusWeaves));
    assertTrue(Object.isFrozen(entry.dataGaps));
    assertTrue(Object.isFrozen(entry.traditionsUsed));
    assertTrue(Object.isFrozen(entry.meta));
  }
});

it('all 7 sacred traditions appear in the union of all 12 outputs', () => {
  _resetAuditForTests();
  const allTraditions = new Set<string>();
  const allHouses: ReadonlyArray<MesaRealHouseNumber> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  for (const n of allHouses) {
    const seed = listMesaRealHouses().find((h) => h.number === n)!;
    const out = crossHouseInterpret(makeBaseInput({
      mesaRealHouseNumber: n,
      topic: seed.topic,
    }));
    for (const t of out.traditionsUsed) allTraditions.add(t);
  }
  const required: ReadonlyArray<string> = [
    'Cigano', 'Astrologia', 'Numerologia Cabalística', 'Orixás', 'Cabala & Tantra', 'Tarot', 'Runas',
  ];
  for (const r of required) {
    assertTrue(allTraditions.has(r), `${r} must appear in at least one house`);
  }
});

it('crossHouseInterpret output is deeply frozen', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput());
  assertTrue(Object.isFrozen(out));
  assertTrue(Object.isFrozen(out.bonusWeaves));
  assertTrue(Object.isFrozen(out.dataGaps));
  assertTrue(Object.isFrozen(out.traditionsUsed));
  assertTrue(Object.isFrozen(out.meta));
  // Each bonus weave is also frozen
  for (const b of out.bonusWeaves) {
    assertTrue(Object.isFrozen(b));
  }
});

it('House 12 (Pássaros / espiritualidade) uses Cabala & Tantra + Tarot', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    mesaRealHouseNumber: 12,
    topic: 'espiritualidade',
  }));
  assertEqual(out.mesaRealHouseNumber, 12);
  assertEqual(out.topic, 'espiritualidade');
  assertTrue(out.traditionsUsed.includes('Cabala & Tantra'));
  assertTrue(out.traditionsUsed.includes('Tarot'));
  assertContains(out.unifiedReading, 'Chokhmah');
  assertContains(out.unifiedReading, 'Mago');
});

it('House 5 (Árvore / saude) weaves Tarot (Imperatriz/Força)', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    mesaRealHouseNumber: 5,
    topic: 'saude',
  }));
  assertEqual(out.mesaRealHouseNumber, 5);
  assertContains(out.unifiedReading, 'Imperatriz');
});

it('House 6 (Nuvens / autoconhecimento) weaves Runas (Perth/Isa)', () => {
  _resetAuditForTests();
  const out = crossHouseInterpret(makeBaseInput({
    mesaRealHouseNumber: 6,
    topic: 'autoconhecimento',
  }));
  assertEqual(out.mesaRealHouseNumber, 6);
  assertContains(out.unifiedReading, 'Perth');
  assertContains(out.unifiedReading, 'Isa');
});

it('crossHouseInterpret throws on invalid house number', () => {
  _resetAuditForTests();
  let threw = false;
  try {
    crossHouseInterpret(makeBaseInput({ mesaRealHouseNumber: 99 as MesaRealHouseNumber }));
  } catch {
    threw = true;
  }
  assertTrue(threw, 'house 99 must throw at mrh() factory');
});

it('hmacSha256 produces 64-hex output for known secret/message', async () => {
  const h = await hmacSha256('key', 'The quick brown fox jumps over the lazy dog');
  assertEqual(
    h,
    'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
    'HMAC-SHA-256 known fixture',
  );
  assertEqual(h.length, 64);
});

it('sha256Hex (async) matches sha256HexSync on a UTF-8 string', async () => {
  const sample = 'Akasha-0 · ciclo 75 · Cabala dos Caminhos';
  const sync = sha256HexSync(sample);
  const asyncRes = await sha256Hex(sample);
  assertEqual(sync, asyncRes, 'sync and async SHA-256 must agree');
  assertEqual(sync.length, 64);
});

it('V75-A version constants are exported and correct', async () => {
  // re-import to assert constants via spec
  const mod = await import('./mesa-real-cross-house.ts');
  assertEqual(mod.W75_A_VERSION, '1.0.0');
  assertEqual(mod.W75_A_CYCLE, 75);
  assertEqual(mod.W75_A_HOUSES_SHIPPED, 12);
  assertEqual(mod.W75_A_TRADITIONS_WOVEN, 7);
});

it('minimum 30 assertions target — verify spec length', () => {
  assertTrue(SPEC_REGISTRY.length >= 30, `registered ${SPEC_REGISTRY.length} specs, need ≥30`);
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const entry of SPEC_REGISTRY) {
    _resetAuditForTests();
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
  console.log(`  RESULT: ${passed} PASS · ${failed} FAIL · ${SPEC_REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    · ${f}`);
    process.exit(1);
  }
}

// Direct exec — node --experimental-strip-types mesa-real-cross-house.spec.ts
runSpecs().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(2);
});