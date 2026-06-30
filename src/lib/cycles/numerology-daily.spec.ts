// numerology-daily.spec.ts — self-running test harness
// Run: node --experimental-strip-types numerology-daily.spec.ts

import {
  getDailySignature,
  reduceToSingle,
  ciganoCardForDay,
  oduRegenteForComposite,
  planetaryRuler,
  DAY_ARCHETYPES,
  CHAKRA_BY_DAY,
  MASTER_NUMBERS,
  auditNumerologyDaily,
  parseDateStrict,
  __TEST__,
} from './numerology-daily.ts';

// ─── Inline test harness ─────────────────────────────────────────────────
let passed = 0, failed = 0;
function expectEqual<T>(actual: T, expected: T, label = ''): void {
  if (actual === expected) { passed++; return; }
  failed++;
  console.error(`  ✗ ${label || 'expectEqual'}\n      actual  : ${JSON.stringify(actual)}\n      expected: ${JSON.stringify(expected)}`);
}
function expectTrue(cond: boolean, label = ''): void {
  if (cond) passed++; else { failed++; console.error(`  ✗ ${label || 'expectTrue'} — condition was false`); }
}
function expectFalse(cond: boolean, label = ''): void {
  if (!cond) passed++; else { failed++; console.error(`  ✗ ${label || 'expectFalse'} — condition was true`); }
}
function expectThrows(fn: () => unknown, label = ''): void {
  try { fn(); failed++; console.error(`  ✗ ${label || 'expectThrows'} — did not throw`); }
  catch { passed++; }
}

// ─── Group: reduceToSingle ────────────────────────────────────────────────
console.log('group: reduceToSingle');
{
  // Identity for 1-9
  for (let n = 1; n <= 9; n++) {
    const r = reduceToSingle(n);
    expectEqual(r.reduced, n, `n=${n} reduced to ${n}`);
    expectEqual(r.isMaster, false, `n=${n} not master`);
    expectEqual(r.master, null, `n=${n} master=null`);
  }
  // 10-18 → 1-9
  for (let n = 10; n <= 18; n++) {
    const r = reduceToSingle(n);
    expectEqual(r.reduced, n - 9, `n=${n} reduced to ${n - 9}`);
  }
  // Master preservation
  expectEqual(reduceToSingle(11, { preserveMasters: true }).reduced, 2, '11 → 2 (preserve)');
  expectEqual(reduceToSingle(11, { preserveMasters: true }).master, 11, '11 → master=11');
  expectEqual(reduceToSingle(11, { preserveMasters: true }).isMaster, true, '11 → isMaster=true');
  expectEqual(reduceToSingle(22, { preserveMasters: true }).reduced, 4, '22 → 4');
  expectEqual(reduceToSingle(22, { preserveMasters: true }).master, 22, '22 → master=22');
  expectEqual(reduceToSingle(33, { preserveMasters: true }).reduced, 6, '33 → 6');
  expectEqual(reduceToSingle(33, { preserveMasters: true }).master, 33, '33 → master=33');
  // Without preservation: 11 → 2, 22 → 4, 33 → 6 (multi-step)
  expectEqual(reduceToSingle(11).reduced, 2, '11 (no preserve) → 2');
  expectEqual(reduceToSingle(22).reduced, 4, '22 (no preserve) → 4');
  expectEqual(reduceToSingle(33).reduced, 6, '33 (no preserve) → 6');
  // 0 → 9 (digital root convention)
  expectEqual(reduceToSingle(0).reduced, 9, '0 → 9');
  // Negative
  expectEqual(reduceToSingle(-7).reduced, 7, '-7 → 7');
  // 100 → 1
  expectEqual(reduceToSingle(100).reduced, 1, '100 → 1');
  // 999 → 9 (9+9+9 = 27 → 2+7 = 9)
  expectEqual(reduceToSingle(999).reduced, 9, '999 → 9');
  expectThrows(() => reduceToSingle(Number.NaN), 'NaN throws');
  expectThrows(() => reduceToSingle(Number.POSITIVE_INFINITY), 'Infinity throws');
}

// ─── Group: parseDateStrict ──────────────────────────────────────────────
console.log('group: parseDateStrict');
expectEqual(parseDateStrict('1990-01-01').toISOString(), '1990-01-01T00:00:00.000Z', 'parses ISO');
expectEqual(parseDateStrict('2000-02-29').toISOString(), '2000-02-29T00:00:00.000Z', 'parses leap day 2000');
expectThrows(() => parseDateStrict('1990-02-29'), 'rejects 1990-02-29 (not leap)');
expectThrows(() => parseDateStrict('1990-13-01'), 'rejects month 13');
expectThrows(() => parseDateStrict('foo'), 'rejects "foo"');

// ─── Group: ciganoCardForDay ─────────────────────────────────────────────
console.log('group: ciganoCardForDay');
{
  const c1 = ciganoCardForDay(1);
  expectEqual(c1.number, 1, 'day 1 → card #1');
  expectEqual(c1.name, 'O Cavaleiro', 'day 1 → O Cavaleiro');
  const c28 = ciganoCardForDay(28);
  expectEqual(c28.number, 28, 'day 28 → card #28');
  expectEqual(c28.name, 'O Cigano', 'day 28 → O Cigano');
  // Wrap-around: day 29 wraps to day 1
  const c29 = ciganoCardForDay(29);
  expectEqual(c29.number, 1, 'day 29 → wraps to card #1');
  expectEqual(c29.name, 'O Cavaleiro', 'day 29 → wraps to O Cavaleiro');
  // Negative wraps: standard modular arithmetic — d=-1 maps to card 27.
  expectEqual(ciganoCardForDay(-1).number, 27, 'day -1 → wraps to #27 (modular)');
  // All 28 unique
  const seen = new Set<string>();
  for (let d = 1; d <= 28; d++) seen.add(ciganoCardForDay(d).name);
  expectEqual(seen.size, 28, 'all 28 cards unique');
}

// ─── Group: oduRegenteForComposite ───────────────────────────────────────
console.log('group: oduRegenteForComposite');
{
  expectEqual(oduRegenteForComposite(1).id, 1, 'composite 1 → Odu 1 (Ogbe)');
  expectEqual(oduRegenteForComposite(9).id, 9, 'composite 9 → Odu 9 (Ossá)');
  expectEqual(oduRegenteForComposite(10).id, 10, 'composite 10 → Odu 10 (Ofun)');
  expectEqual(oduRegenteForComposite(16).id, 16, 'composite 16 → Odu 16 (Ofurufu)');
  expectEqual(oduRegenteForComposite(17).id, 1, 'composite 17 wraps to Odu 1');
  expectEqual(oduRegenteForComposite(11).id, 1, 'master 11 → Odu 1 (Ogbe)');
  expectEqual(oduRegenteForComposite(22).id, 8, 'master 22 → Odu 8 (Ejionile)');
  expectEqual(oduRegenteForComposite(33).id, 16, 'master 33 → Odu 16 (Ofurufu)');
}

// ─── Group: planetaryRuler ──────────────────────────────────────────────
console.log('group: planetaryRuler');
{
  // 2024-01-07 is a Sunday
  const sun = planetaryRuler(new Date(Date.UTC(2024, 0, 7)));
  expectEqual(sun.planet, 'Sol', 'Sunday → Sol');
  expectEqual(sun.element, 'fogo', 'Sunday → fogo');
  expectEqual(sun.weekday, 'Domingo', 'Sunday weekday name');
  // 2024-01-08 is Monday
  const mon = planetaryRuler(new Date(Date.UTC(2024, 0, 8)));
  expectEqual(mon.planet, 'Lua', 'Monday → Lua');
  expectEqual(mon.element, 'água', 'Monday → água');
  // 2024-01-13 is Saturday
  const sat = planetaryRuler(new Date(Date.UTC(2024, 0, 13)));
  expectEqual(sat.planet, 'Saturno', 'Saturday → Saturno');
  expectEqual(sat.element, 'terra', 'Saturday → terra');
}

// ─── Group: getDailySignature (composite reading) ───────────────────────
console.log('group: getDailySignature');
{
  // Fixed case: 1990-01-15 → 2024-06-15
  const sig = getDailySignature('1990-01-15', '2024-06-15');
  // Day = 15 + 1 + 2024 + 6 + 15 = 2061; reduce: 2+0+6+1 = 9
  expectEqual(sig.day, 9, 'day = 9 for 15+1+2024+6+15=2061');
  // Month = 6 → 6
  expectEqual(sig.month, 6, 'month = 6');
  // Year = 2024 → 2+0+2+4 = 8
  expectEqual(sig.year, 8, 'year = 8 for 2024');
  // Composite = 9 + 6 + 8 = 23 → 2+3 = 5
  expectEqual(sig.composite, 5, 'composite = 5 for 9+6+8=23');
  // Day 9 archetype
  expectEqual(sig.archetype.name, 'O Sábio', 'day 9 archetype = O Sábio');
  expectEqual(sig.archetype.keyword, 'ENCERRAR', 'day 9 keyword');
  // Cigano card for day 9 → #9 (Os Buquês)
  expectEqual(sig.ciganoCard.number, 9, 'cigano card #9');
  expectEqual(sig.ciganoCard.name, 'Os Buquês', 'cigano card name');
  // Odu regente for composite 5 → Odu 5 (Oxê)
  expectEqual(sig.oduRegente.id, 5, 'Odu #5 for composite 5');
  expectEqual(sig.oduRegente.name, 'Oxê', 'Odu name');
  // Chakra for day 9 → key ((9-1) % 7) + 1 = 2 (Terceiro-Olho)
  expectEqual(sig.chakra.name, 'Terceiro-Olho', 'day 9 chakra (7-day rotation → 2)');
  // Summary non-empty
  expectTrue(sig.summary.length > 100, 'summary length > 100');
  // Weekday
  expectTrue(typeof sig.weekday === 'string', 'weekday is string');
  expectTrue(typeof sig.planet === 'string', 'planet is string');
}
{
  // Master-day test: pick dates that sum to 11/22/33.
  // birth=2000-09-11, target=2024-08-29: day = 11+9+2024+8+29 = 2081 → 2+0+8+1 = 11 (MASTER!)
  const master = getDailySignature('2000-09-11', '2024-08-29');
  expectEqual(master.day, 2, 'master 11 reduces to 2 in main flow');
  expectEqual(master.dayMaster, 11, 'dayMaster = 11');
  // Composite: 2 + month + year
  // month = 8 → 8; year = 2024 → 8; composite = 2+8+8 = 18 → 9
  expectEqual(master.composite, 9, 'master 11 composite 9');
  // Odu for master 11 → Odu 1 (Ogbe)
  expectEqual(master.oduRegente.id, 1, 'master 11 → Odu 1 (Ogbe)');
}
{
  // Birth-year edge: same date as birth (day-of-life 0)
  const sig = getDailySignature('1990-06-15', '1990-06-15');
  // day = 15+6+1990+6+15 = 2032 → 2+0+3+2 = 7
  expectEqual(sig.day, 7, 'birthday day = 7 for 15+6+1990+6+15=2032');
  expectEqual(sig.month, 6, 'birthday month = 6');
  // year 1990: 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1
  expectEqual(sig.year, 1, 'year 1990 reduces to 1');
  // composite = 7 + 6 + 1 = 14 → 5
  expectEqual(sig.composite, 5, 'composite = 5');
}
expectThrows(() => getDailySignature('1990-06-15', '1980-01-01'), 'target before birth throws');

// ─── Group: auditNumerologyDaily ──────────────────────────────────────────
console.log('group: auditNumerologyDaily');
{
  const a = auditNumerologyDaily();
  expectTrue(a.reduceConsistent, 'reduce consistent for 1-9 and 10-18');
  expectTrue(a.masterPreservationCorrect, 'master preservation correct');
  expectEqual(a.archetypeCoverage, 9, '9 archetypes');
  expectEqual(a.chakraRotation.length, 7, '7 chakras in rotation');
  expectEqual(a.ciganoCoverage, 28, '28 unique cigano cards');
  expectTrue(a.traditionsCount >= 5, `≥ 5 traditions (got ${a.traditionsCount})`);
  expectTrue(a.traditionsList.includes('Numerologia Cabalística'), 'tradition 1');
  expectTrue(a.traditionsList.includes('Cigano'), 'tradition 2');
  expectTrue(a.traditionsList.includes('Astrologia'), 'tradition 3');
  expectTrue(a.traditionsList.includes('Orixás'), 'tradition 4');
  expectTrue(a.traditionsList.includes('Tantra/Cabala'), 'tradition 5');
}

// ─── Group: cross-engine integration (summary mentions all 5 traditions) ─
console.log('group: cross-engine integration');
{
  const sig = getDailySignature('1990-01-15', '2024-06-15');
  expectTrue(sig.summary.includes('Numerologia Cabalística') || sig.summary.includes('Dia pessoal') || sig.summary.includes('Mês') || sig.summary.includes('Ano'), 'summary has numerology content');
  expectTrue(sig.summary.includes('Carta-cigana'), 'summary mentions Cigano');
  expectTrue(sig.summary.includes('regido por'), 'summary mentions Astrologia');
  expectTrue(sig.summary.includes('Orixá regente'), 'summary mentions Orixás');
  expectTrue(sig.summary.includes('Chakra'), 'summary mentions Tantra/Cabala');
}

// ─── Summary ─────────────────────────────────────────────────────────────
console.log(`\nnumerology-daily.spec.ts: ${passed} passed, ${failed} failed`);
if (failed > 0) { console.error('SPEC FAIL'); process.exit(1); }
console.log('SPEC PASS');
