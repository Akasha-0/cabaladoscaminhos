// biorhythm.spec.ts — self-running test harness
// Run: node --experimental-strip-types biorhythm.spec.ts

import {
  calculateBiorhythm,
  getCyclePhase,
  getCriticalDays,
  getCriticalDaysBetween,
  BIORHYTHM_PERIODS,
  parseDate,
  phaseValue,
  isCriticalDay,
  auditBiorhythmEdgeCases,
  __TEST__,
} from './biorhythm.ts';

// ─── Inline test harness (no vitest) ─────────────────────────────────────
let passed = 0, failed = 0;
function expectEqual<T>(actual: T, expected: T, label = ''): void {
  if (actual === expected || (Number.isNaN(actual as any) && Number.isNaN(expected as any))) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ ${label || 'expectEqual'}\n      actual  : ${JSON.stringify(actual)}\n      expected: ${JSON.stringify(expected)}`);
  }
}
function expectClose(actual: number, expected: number, tol: number, label = ''): void {
  if (Math.abs(actual - expected) <= tol) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ ${label || 'expectClose'}\n      actual  : ${actual}\n      expected: ${expected} (±${tol})`);
  }
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

// ─── Group: parseDate ────────────────────────────────────────────────────
console.log('group: parseDate');
expectEqual(parseDate('1990-01-01').toISOString(), '1990-01-01T00:00:00.000Z', 'parses ISO date');
expectEqual(parseDate('1990-12-31').toISOString(), '1990-12-31T00:00:00.000Z', 'parses year-end');
expectEqual(parseDate('2000-02-29').toISOString(), '2000-02-29T00:00:00.000Z', 'parses leap day 2000');
expectThrows(() => parseDate('1990-13-01'), 'rejects month 13');
expectThrows(() => parseDate('1990-02-30'), 'rejects Feb 30');
// Note: 1990-1-1 is allowed (regex is \d{1,2}); test the bad-format case instead.
expectThrows(() => parseDate('not-a-date'), 'rejects "not-a-date"');
expectEqual(parseDate('1990/01/01').toISOString(), '1990-01-01T00:00:00.000Z', 'accepts slash separator');
expectEqual(parseDate('1990-1-1').toISOString(), '1990-01-01T00:00:00.000Z', 'accepts single-digit month');

// ─── Group: phaseValue (pure math) ───────────────────────────────────────
console.log('group: phaseValue');
expectClose(phaseValue(0, 23), 0,                       0.0001, 'day 0 = 0');
// sin(2π · T/4 / T) = sin(π/2) = 1, not √2/2
expectClose(phaseValue(23 / 4, 23), 1,                  0.0001, '¼ period (5.75d) = 1 (peak)');
expectClose(phaseValue(23 / 8, 23), Math.SQRT2 / 2,      0.0001, 'day 2.875 (⅛ period) ≈ √2/2');
expectClose(phaseValue(23 / 2, 23), 0,                  0.0001, 'half period = 0');
expectClose(phaseValue(23 * 3 / 4, 23), -1,             0.0001, '¾ period = -1 (trough)');
expectClose(phaseValue(23 * 5 / 8, 23), -Math.SQRT2 / 2, 0.0001, 'day 14.375 (⅝ period) ≈ -√2/2');
expectClose(phaseValue(23, 23), 0,                       0.0001, 'full period = 0');

// ─── Group: isCriticalDay ─────────────────────────────────────────────────
console.log('group: isCriticalDay');
expectTrue(isCriticalDay(0, 23), 'day 0 is critical (zero crossing)');
expectTrue(isCriticalDay(23, 23), 'day 23 is critical (full cycle zero)');
expectTrue(isCriticalDay(46, 23), 'day 46 is critical (2×)');
expectFalse(isCriticalDay(11.5, 23), 'day 11.5 is NOT critical (mid-cycle)');
expectFalse(isCriticalDay(1, 23),   'day 1 is NOT critical (close to 0 but outside ±0.5)');

// ─── Group: calculateBiorhythm (classic known values) ────────────────────
console.log('group: calculateBiorhythm');
{
  const r = calculateBiorhythm('1990-01-01', '1990-01-24'); // day 23
  expectClose(r.physical, 0, 0.001, 'day 23 → physical = 0');
  expectClose(r.emotional, Math.sin(2 * Math.PI * 23 / 28), 0.001, 'day 23 → emotional');
  expectClose(r.intellectual, Math.sin(2 * Math.PI * 23 / 33), 0.001, 'day 23 → intellectual');
  expectTrue(r.physicalCritical, 'day 23 → physical critical');
  expectTrue(r.emotionalCritical === false, 'day 23 → emotional not critical');
}
{
  const r = calculateBiorhythm('1990-01-01', '1990-01-01'); // day 0
  expectEqual(r.dayOfLife, 0, 'dayOfLife = 0 on birthday');
  expectClose(r.physical, 0, 0.001, 'day 0 physical = 0');
  expectClose(r.emotional, 0, 0.001, 'day 0 emotional = 0');
  expectClose(r.intellectual, 0, 0.001, 'day 0 intellectual = 0');
  expectTrue(r.physicalCritical && r.emotionalCritical && r.intellectualCritical, 'day 0 all critical');
  expectEqual(r.weekday, 'Segunda', '1990-01-01 is Monday (Segunda)');
  expectEqual(r.planet, 'Lua', 'Monday ruled by Lua');
  expectEqual(r.element, 'água', 'Monday = água element');
}
{
  const r = calculateBiorhythm('2000-01-01', '2024-01-01');
  // 24 years × 365.25 ≈ 8766 days. We just sanity-check values in [-1, 1] and summary non-empty.
  expectTrue(r.dayOfLife > 8000 && r.dayOfLife < 9000, 'day-of-life ~ 24 years');
  expectTrue(r.physical >= -1 && r.physical <= 1, 'physical in [-1, 1]');
  expectTrue(r.emotional >= -1 && r.emotional <= 1, 'emotional in [-1, 1]');
  expectTrue(r.intellectual >= -1 && r.intellectual <= 1, 'intellectual in [-1, 1]');
  expectTrue(r.summary.length > 50, 'summary non-trivial');
  expectTrue(r.ciganoCard.length > 0, 'cigano card present');
  expectTrue(r.chakra.name.length > 0, 'chakra present');
  expectTrue(r.oduEssence.length > 0, 'Odu essence present');
  expectTrue(r.numerologyRoot >= 1 && r.numerologyRoot <= 9, 'numerology root 1-9');
}

// ─── Group: getCyclePhase (trend + critical) ─────────────────────────────
console.log('group: getCyclePhase');
{
  const phases = getCyclePhase('1990-01-01', '1990-01-12'); // day 11
  expectEqual(phases.physical.period, 23, 'physical period = 23');
  expectEqual(phases.emotional.period, 28, 'emotional period = 28');
  expectEqual(phases.intellectual.period, 33, 'intellectual period = 33');
  // day 11 is ascending for physical (sin slope at d=11/23 → cos(2π·11/23))
  // We just check the trend enum is valid:
  expectTrue(['ascending', 'descending', 'peak', 'trough'].includes(phases.physical.trend), 'physical trend valid');
  expectTrue(['ascending', 'descending', 'peak', 'trough'].includes(phases.emotional.trend), 'emotional trend valid');
  expectTrue(['ascending', 'descending', 'peak', 'trough'].includes(phases.intellectual.trend), 'intellectual trend valid');
}
{
  const phases = getCyclePhase('1990-01-01', '1990-01-24'); // day 23 — physical critical
  expectTrue(phases.physical.isCritical, 'day 23 → physical critical via phase');
  // At exact zero crossing, |v|=0 (not >0.999), and slope=cos(2π)=+1>0 → 'ascending'.
  expectEqual(phases.physical.trend, 'ascending', 'day 23 → physical ascending (zero crossing with + slope)');
}
{
  // Test 'peak' detection: phaseValue returns 1 at quarter-period (sin(π/2)=1).
  // We can use the internal __TEST__ helper or compute via date. The test for peak/trough
  // shape is covered by the phaseValue tests above. Here we just verify that 'peak' is a
  // valid trend enum returned for any phase we check.
  const phases = getCyclePhase('1990-01-01', '1990-01-12'); // day 11
  // The trend enum is valid (we already checked above); this is a smoke for completeness.
  expectTrue(typeof phases.physical.trend === 'string', 'physical.trend is a string');
}

// ─── Group: getCriticalDaysBetween (deterministic window) ────────────────
console.log('group: getCriticalDaysBetween');
{
  // From 1990-01-01 to 1990-01-24 (+30 days = 54 total window)
  // physical zeros at d=0,23,46 → all in window
  // emotional zeros at d=0,28 → 0,28 in window (28 < 54)
  // intellectual zeros at d=0,33 → 0,33 in window
  const r = getCriticalDaysBetween('1990-01-01', '1990-01-01', '1990-01-24', 30);
  expectEqual(r.rangeDays, 30, 'rangeDays = 30');
  expectTrue(r.criticalDays.length >= 4, `at least 4 critical days found (got ${r.criticalDays.length})`);
  // Day 0 (birthday) should appear with all 3 cycles.
  const day0 = r.criticalDays.find((c) => c.dayOfLife === 0);
  expectTrue(day0 !== undefined, 'day 0 critical day exists');
  expectEqual(day0!.cycles.length, 3, 'day 0 has 3 cycles');
  // Day 23 should be critical for physical only.
  const day23 = r.criticalDays.find((c) => c.dayOfLife === 23);
  expectTrue(day23 !== undefined, 'day 23 critical day exists');
  expectEqual(day23!.cycles.length, 1, 'day 23 has 1 cycle (physical)');
  expectEqual(day23!.cycles[0], 'physical', 'day 23 cycle = physical');
}
{
  // Empty window: from 1990-01-01 to 1990-01-01, rangeDays=0
  const r = getCriticalDaysBetween('1990-01-01', '1990-01-01', '1990-01-01', 0);
  // Window is [0, 0] inclusive; only day 0 critical.
  expectTrue(r.criticalDays.length >= 1, 'day 0 critical in zero-range window');
  expectEqual(r.criticalDays[0]!.dayOfLife, 0, 'first critical is day 0');
}
expectThrows(() => getCriticalDaysBetween('1990-01-01', '1990-01-01', '1990-01-01', -1), 'rejects negative rangeDays');
expectThrows(() => getCriticalDaysBetween('1990-01-01', '1990-01-01', '1990-01-01', Number.NaN), 'rejects NaN rangeDays');

// ─── Group: getCriticalDays (wrapper, not time-asserted) ─────────────────
console.log('group: getCriticalDays');
{
  // We can't time-assert this since it uses "now", but we can check shape.
  const r = getCriticalDays('1990-01-01', 7);
  expectEqual(r.rangeDays, 7, 'rangeDays = 7');
  expectTrue(Array.isArray(r.criticalDays), 'criticalDays is array');
  expectTrue(typeof r.summary === 'string', 'summary is string');
}

// ─── Group: auditBiorhythmEdgeCases ──────────────────────────────────────
console.log('group: auditBiorhythmEdgeCases');
{
  const a = auditBiorhythmEdgeCases(500);
  expectTrue(a.periodsValid, 'periods valid (23/28/33)');
  expectTrue(a.phaseRange.min >= -1.001 && a.phaseRange.min <= 1.001, 'phase min in [-1, 1]');
  expectTrue(a.phaseRange.max >= -1.001 && a.phaseRange.max <= 1.001, 'phase max in [-1, 1]');
  expectTrue(a.criticalAccuracy >= 0.95, `critical detection accuracy ≥ 95% (got ${a.criticalAccuracy})`);
  expectTrue(a.traditionsCovered >= 5, `≥ 5 traditions (covered=${a.traditionsCovered})`);
  expectTrue(a.traditionsList.includes('Astrologia'), 'Astrologia in traditions');
  expectTrue(a.traditionsList.includes('Cigano'), 'Cigano in traditions');
  expectTrue(a.traditionsList.includes('Orixás'), 'Orixás in traditions');
}

// ─── Group: cross-engine integration ─────────────────────────────────────
console.log('group: cross-engine integration');
{
  const r = calculateBiorhythm('1990-01-01', '1990-01-01');
  // Summary must mention all 5 tradition names (or at least the 5 categories)
  expectTrue(r.summary.includes('Dia'), 'summary mentions Dia');
  expectTrue(r.summary.includes('Carta-cigana'), 'summary mentions Carta-cigana');
  expectTrue(r.summary.includes('Numerologia cabalística'), 'summary mentions Numerologia');
  expectTrue(r.summary.includes('Odu regente'), 'summary mentions Odu regente');
  expectTrue(r.summary.includes('Chakra'), 'summary mentions Chakra');
  expectTrue(r.summary.includes('regido por'), 'summary mentions planetary ruler');
  expectEqual(r.summary.length > 100, true, 'summary length > 100');
}

// ─── Summary ─────────────────────────────────────────────────────────────
console.log(`\nbiorhythm.spec.ts: ${passed} passed, ${failed} failed`);
if (failed > 0) { console.error('SPEC FAIL'); process.exit(1); }
console.log('SPEC PASS');
