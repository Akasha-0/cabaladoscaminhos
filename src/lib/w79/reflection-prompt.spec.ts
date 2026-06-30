/**
 * ════════════════════════════════════════════════════════════════════════════
 * W79-A — REFLECTION PROMPT · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running test harness. ≥30 assertions covering:
 *   - 28-prompt coverage (7 traditions × 4 phases)
 *   - Vocabulary authenticity per tradition
 *   - dailyReflectionSet routing for all 4 phases
 *   - SHA-256 cache key canonicalization
 *   - Frozen integrity
 */

declare const process: { exit(code: number): never };

import {
  listReflectionPrompts,
  listTraditions,
  listPhases,
  getReflectionPrompt,
  mapPhase,
  dailyReflectionSet,
  vocabularyCoverage,
  hashCacheKey,
  SACRED_TRADITIONS,
  CYCLE_PHASES,
  type SacredTradition,
  type CyclePhase,
  type BiorhythmContext,
} from './reflection-prompt.ts';

// ─── Harness ─────────────────────────────────────────────────────────────
interface SpecEntry { name: string; run: () => void | Promise<void>; }
const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  if (!Object.is(actual, expected) && JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`assertEqual FAILED${label ? ` (${label})` : ''}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(cond: boolean, label?: string): void {
  if (!cond) throw new Error(`assertTrue FAILED${label ? ` (${label})` : ''}`);
}

function assertMatch(s: string, re: RegExp, label?: string): void {
  if (!re.test(s)) throw new Error(`assertMatch FAILED${label ? ` (${label})` : ''}: "${s}" does not match ${re}`);
}

// ════════════════════════════════════════════════════════════════════════════
// Section 1 — Coverage shape
// ════════════════════════════════════════════════════════════════════════════

it('listReflectionPrompts returns 28 entries', () => {
  const all = listReflectionPrompts();
  assertEqual(all.length, 28);
});

it('listTraditions returns 7 traditions', () => {
  const t = listTraditions();
  assertEqual(t.length, 7);
  for (const trad of SACRED_TRADITIONS) {
    assertTrue(t.includes(trad));
  }
});

it('listPhases returns 4 phases', () => {
  const p = listPhases();
  assertEqual(p.length, 4);
  for (const ph of CYCLE_PHASES) {
    assertTrue(p.includes(ph));
  }
});

it('listReflectionPrompts covers every (tradition, phase) pair exactly once', () => {
  const all = listReflectionPrompts();
  const slugs = new Set<string>();
  for (const p of all) {
    assertTrue(!slugs.has(p.slug), `duplicate slug ${p.slug}`);
    slugs.add(p.slug);
  }
  assertEqual(slugs.size, 28);
});

it('all 7 traditions have prompts in all 4 phases', () => {
  for (const trad of SACRED_TRADITIONS) {
    for (const phase of CYCLE_PHASES) {
      const p = getReflectionPrompt(trad, phase);
      assertTrue(p !== null, `${trad}/${phase} should exist`);
      assertEqual(p!.tradition, trad);
      assertEqual(p!.phase, phase);
    }
  }
});

// ════════════════════════════════════════════════════════════════════════════
// Section 2 — Prompt structure
// ════════════════════════════════════════════════════════════════════════════

it('every prompt has non-empty prompt/practice/journalQuestion', () => {
  const all = listReflectionPrompts();
  for (const p of all) {
    assertTrue(p.prompt.length > 30, `${p.slug} prompt too short`);
    assertTrue(p.practice.length > 20, `${p.slug} practice too short`);
    assertTrue(p.journalQuestion.length > 10, `${p.slug} journalQuestion too short`);
  }
});

it('every prompt has at least 2 vocabulary tokens', () => {
  const all = listReflectionPrompts();
  for (const p of all) {
    assertTrue(p.vocabulary.length >= 2, `${p.slug} has too few vocab tokens`);
  }
});

it('no prompt uses generic "reflect on yourself"', () => {
  const all = listReflectionPrompts();
  for (const p of all) {
    const text = (p.prompt + ' ' + p.practice + ' ' + p.journalQuestion).toLowerCase();
    assertTrue(!text.includes('reflect on yourself'), `${p.slug} has generic text`);
    assertTrue(!text.includes('reflita sobre você'), `${p.slug} has generic text in PT`);
  }
});

it('every prompt slug matches tradition-phase pattern', () => {
  const all = listReflectionPrompts();
  const slugRe = /^[a-z]+-[a-z]+$/;
  for (const p of all) {
    assertMatch(p.slug, slugRe, `${p.slug} slug`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// Section 3 — Authentic tradition vocabulary
// ════════════════════════════════════════════════════════════════════════════

it('Candomblé prompts reference Orixás', () => {
  const all = listReflectionPrompts().filter((p) => p.tradition === 'Candomblé');
  const text = all.map((p) => p.prompt + ' ' + p.practice).join(' ');
  // At least one Orixá reference
  const orixas = ['Oxum', 'Ogum', 'Xangô', 'Iansã', 'Iemanjá', 'Nanã', 'Oxalá'];
  const found = orixas.filter((o) => text.includes(o));
  assertTrue(found.length >= 3, `Candomblé should reference ≥3 Orixás, found: ${found.join(', ')}`);
});

it('Umbanda prompts reference Caboclos, Pretos-Velhos, Ciganas', () => {
  const all = listReflectionPrompts().filter((p) => p.tradition === 'Umbanda');
  const text = all.map((p) => p.prompt + ' ' + p.practice).join(' ');
  assertTrue(text.includes('Caboclos') || text.includes('Caboclo'), 'Caboclo missing');
  assertTrue(text.includes('Pretos-Velhos') || text.includes('Preto-Velho'), 'Preto-Velho missing');
  assertTrue(text.includes('Ciganas') || text.includes('Cigana'), 'Cigana missing');
  assertTrue(text.includes('gira'), 'gira missing');
});

it('Ifá prompts reference Orunmila and odus', () => {
  const all = listReflectionPrompts().filter((p) => p.tradition === 'Ifá');
  const text = all.map((p) => p.prompt + ' ' + p.practice).join(' ');
  assertTrue(text.includes('Orunmila'), 'Orunmila missing');
  const odus = ['Ogbe', 'Oyeku', 'Ofun', 'Odi', 'Ejionile'];
  const found = odus.filter((o) => text.includes(o));
  assertTrue(found.length >= 2, `Ifá should reference ≥2 odus, found: ${found.join(', ')}`);
});

it('Cabala prompts reference Sefirot/Nefesh/Ruach/Neshamá', () => {
  const all = listReflectionPrompts().filter((p) => p.tradition === 'Cabala');
  const text = all.map((p) => p.prompt + ' ' + p.practice).join(' ');
  const cabalaTerms = ['Keter', 'Chokhmah', 'Binah', 'Tiferet', 'Malkuth', 'Nefesh', 'Neshamá', 'Tikkun'];
  const found = cabalaTerms.filter((t) => text.includes(t));
  assertTrue(found.length >= 4, `Cabala should reference ≥4 terms, found: ${found.join(', ')}`);
});

it('Astrologia prompts reference signs, planets, aspects', () => {
  const all = listReflectionPrompts().filter((p) => p.tradition === 'Astrologia');
  const text = all.map((p) => p.prompt + ' ' + p.practice).join(' ');
  const astroTerms = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Lilith', 'Meio do Céu', 'conjunção', 'trígono', 'quadratura'];
  const found = astroTerms.filter((t) => text.includes(t));
  assertTrue(found.length >= 4, `Astrologia should reference ≥4 terms, found: ${found.join(', ')}`);
});

it('Tantra prompts reference chakras, prana, kundalini', () => {
  const all = listReflectionPrompts().filter((p) => p.tradition === 'Tantra');
  const text = all.map((p) => p.prompt + ' ' + p.practice).join(' ');
  const tantraTerms = ['chakra', 'prana', 'kundalini', 'mantra', 'Pranayama', 'dhyana', 'Muladhara', 'Sahasrara', 'Anahata'];
  const found = tantraTerms.filter((t) => text.toLowerCase().includes(t.toLowerCase()));
  assertTrue(found.length >= 4, `Tantra should reference ≥4 terms, found: ${found.join(', ')}`);
});

it('Cigano prompts reference Cigano Ramiro and cartas', () => {
  const all = listReflectionPrompts().filter((p) => p.tradition === 'Cigano');
  const text = all.map((p) => p.prompt + ' ' + p.practice).join(' ');
  assertTrue(text.includes('Cigano Ramiro'), 'Cigano Ramiro missing');
  const cartas = ['Cavaleiro', 'Foice', 'Estrela', 'Coração', 'Trevo', 'Torre', 'Livro'];
  const found = cartas.filter((c) => text.includes(c));
  assertTrue(found.length >= 4, `Cigano should reference ≥4 cartas, found: ${found.join(', ')}`);
});

// ════════════════════════════════════════════════════════════════════════════
// Section 4 — Phase mapping
// ════════════════════════════════════════════════════════════════════════════

it('mapPhase returns peak for high positive', () => {
  assertEqual(mapPhase(0.95, false, 0.1), 'peak');
});

it('mapPhase returns trough for high negative', () => {
  assertEqual(mapPhase(-0.95, false, -0.1), 'trough');
});

it('mapPhase returns ascending for positive slope mid', () => {
  assertEqual(mapPhase(0.4, false, 0.8), 'ascending');
});

it('mapPhase returns descending for negative slope mid', () => {
  assertEqual(mapPhase(-0.4, false, -0.8), 'descending');
});

it('mapPhase returns trough for critical days', () => {
  assertEqual(mapPhase(0.1, true, 0.5), 'trough');
});

// ════════════════════════════════════════════════════════════════════════════
// Section 5 — dailyReflectionSet
// ════════════════════════════════════════════════════════════════════════════

it('dailyReflectionSet produces 7 prompts (one per tradition)', () => {
  const ctx: BiorhythmContext = {
    birthDate: '1985-03-15',
    date: '2025-01-15',
    physical: 0.9,
    emotional: 0.2,
    intellectual: 0.1,
    physicalCritical: false,
    emotionalCritical: false,
    intellectualCritical: false,
    physicalSlope: 0.1,
    emotionalSlope: 0.5,
    intellectualSlope: 0.5,
  };
  const set = dailyReflectionSet(ctx);
  assertEqual(set.prompts.length, 7);
  assertEqual(set.dominantCycle, 'physical'); // 0.9 > 0.2 > 0.1
});

it('dailyReflectionSet dominant phase = peak when physical high', () => {
  const ctx: BiorhythmContext = {
    birthDate: '1985-03-15',
    date: '2025-01-15',
    physical: 0.95,
    emotional: 0.1,
    intellectual: 0.1,
    physicalCritical: false,
    emotionalCritical: false,
    intellectualCritical: false,
    physicalSlope: 0.1,
    emotionalSlope: 0.5,
    intellectualSlope: 0.5,
  };
  const set = dailyReflectionSet(ctx);
  assertEqual(set.dominantPhase, 'peak');
  for (const p of set.prompts) {
    assertEqual(p.phase, 'peak');
  }
});

it('dailyReflectionSet dominant phase = trough when emotional critical', () => {
  const ctx: BiorhythmContext = {
    birthDate: '1985-03-15',
    date: '2025-01-15',
    physical: 0.1,
    emotional: 0.05,
    intellectual: 0.05,
    physicalCritical: false,
    emotionalCritical: true,
    intellectualCritical: false,
    physicalSlope: 0.5,
    emotionalSlope: 0.0,
    intellectualSlope: 0.5,
  };
  // emotional has highest abs value (0.05) only because critical, but absolute value is tiny
  // Actually physical = 0.1 dominates — let's fix: make physical smaller.
  const ctx2: BiorhythmContext = {
    ...ctx,
    physical: 0.02,
  };
  const set = dailyReflectionSet(ctx2);
  assertEqual(set.dominantCycle, 'emotional');
  assertEqual(set.dominantPhase, 'trough');
});

it('dailyReflectionSet produces date in summary', () => {
  const ctx: BiorhythmContext = {
    birthDate: '1985-03-15',
    date: '2026-06-30',
    physical: 0.5,
    emotional: 0.5,
    intellectual: 0.5,
    physicalCritical: false,
    emotionalCritical: false,
    intellectualCritical: false,
    physicalSlope: 0.5,
    emotionalSlope: 0.5,
    intellectualSlope: 0.5,
  };
  const set = dailyReflectionSet(ctx);
  assertTrue(set.summary.includes('2026-06-30'));
});

// ════════════════════════════════════════════════════════════════════════════
// Section 6 — vocabularyCoverage
// ════════════════════════════════════════════════════════════════════════════

it('vocabularyCoverage returns 7 traditions', () => {
  const cov = vocabularyCoverage();
  assertEqual(Object.keys(cov.coverage).length, 7);
});

it('vocabularyCoverage Candomblé has at least 50% tokens present', () => {
  const cov = vocabularyCoverage();
  assertTrue(cov.coverage['Candomblé'] >= 0.5, `coverage ${cov.coverage['Candomblé']}`);
});

it('vocabularyCoverage Cabala has at least 50% tokens present', () => {
  const cov = vocabularyCoverage();
  assertTrue(cov.coverage['Cabala'] >= 0.5, `coverage ${cov.coverage['Cabala']}`);
});

it('vocabularyCoverage Astrologia has at least 50% tokens present', () => {
  const cov = vocabularyCoverage();
  assertTrue(cov.coverage['Astrologia'] >= 0.5, `coverage ${cov.coverage['Astrologia']}`);
});

it('vocabularyCoverage Tantra has at least 50% tokens present', () => {
  const cov = vocabularyCoverage();
  assertTrue(cov.coverage['Tantra'] >= 0.5, `coverage ${cov.coverage['Tantra']}`);
});

// ════════════════════════════════════════════════════════════════════════════
// Section 7 — SHA-256 cache key
// ════════════════════════════════════════════════════════════════════════════

it('hashCacheKey is deterministic', () => {
  const k1 = hashCacheKey({ a: 1, b: 2 });
  const k2 = hashCacheKey({ a: 1, b: 2 });
  assertEqual(k1, k2);
});

it('hashCacheKey is canonical (order-independent)', () => {
  const k1 = hashCacheKey({ x: 1, y: 2, z: 3 });
  const k2 = hashCacheKey({ z: 3, y: 2, x: 1 });
  assertEqual(k1, k2);
});

it('hashCacheKey returns 64-char hex', () => {
  const k = hashCacheKey({ test: true });
  assertEqual(k.length, 64);
  assertMatch(k, /^[0-9a-f]{64}$/);
});

// ════════════════════════════════════════════════════════════════════════════
// Section 8 — Frozen integrity
// ════════════════════════════════════════════════════════════════════════════

it('listReflectionPrompts result is frozen', () => {
  const all = listReflectionPrompts();
  assertTrue(Object.isFrozen(all));
});

it('getReflectionPrompt result is frozen', () => {
  const p = getReflectionPrompt('Candomblé', 'peak');
  assertTrue(Object.isFrozen(p));
});

it('dailyReflectionSet result is frozen', () => {
  const ctx: BiorhythmContext = {
    birthDate: '1985-03-15',
    date: '2025-01-15',
    physical: 0.5,
    emotional: 0.5,
    intellectual: 0.5,
    physicalCritical: false,
    emotionalCritical: false,
    intellectualCritical: false,
    physicalSlope: 0.5,
    emotionalSlope: 0.5,
    intellectualSlope: 0.5,
  };
  const set = dailyReflectionSet(ctx);
  assertTrue(Object.isFrozen(set));
  assertTrue(Object.isFrozen(set.prompts));
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  let passes = 0;
  let fails = 0;
  const failed: string[] = [];
  for (const entry of SPEC_REGISTRY) {
    try {
      await entry.run();
      passes++;
      console.log(`  ✓ ${entry.name}`);
    } catch (err) {
      fails++;
      const msg = err instanceof Error ? err.message : String(err);
      failed.push(`${entry.name}: ${msg}`);
      console.log(`  ✗ ${entry.name}: ${msg}`);
    }
  }
  console.log(`\n${passes} passed, ${fails} failed (${SPEC_REGISTRY.length} total)`);
  if (fails > 0) {
    console.error('\nFailures:');
    for (const f of failed) console.error(`  ${f}`);
    process.exit(1);
  }
  if (fails === 0) console.log('0 failures');
  process.exit(0);
}

await main();
