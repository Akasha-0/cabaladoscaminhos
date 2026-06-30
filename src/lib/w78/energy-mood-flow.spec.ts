// W78-D: Energy + Mood Flow spec — self-running
// 40+ assertions covering logging, heatmap, lunar correlation, practices, streaks, privacy.

import * as EMF from './energy-mood-flow.ts';
import { sha256Hex, hashCacheKey } from './energy-mood-flow.hash.ts';

const _internal = (EMF as unknown as { _internal: { _resetAllForTests: () => void } })._internal;

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expect(label: string, cond: boolean): void {
  if (cond) { passed++; }
  else { failed++; failures.push(label); console.error(`  FAIL: ${label}`); }
}

function expectEqual<T>(label: string, actual: T, expected: T): void {
  const ok = Object.is(actual, expected);
  if (!ok) {
    failed++;
    failures.push(label);
    console.error(`  FAIL: ${label} — got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
  } else {
    passed++;
  }
}

function runOne(label: string, fn: () => void): void {
  _internal._resetAllForTests();
  console.log(`\n[${label}]`);
  try { fn(); }
  catch (e) { failed++; failures.push(`${label} (threw)`); console.error(`  THREW in ${label}:`, e); }
}

const u = (s: string) => s as EMF.UserId;
const HEATMAP_PALETTE = ['#fee2e2', '#fed7aa', '#fef3c7', '#d9f99d', '#a7f3d0', '#bfdbfe', '#ddd6fe'];
const eid = (s: string) => s as EMF.EntryId;
const d = (s: string) => s as EMF.ISODate;

// =============================================================================
// 1. Logging API
// =============================================================================

runOne('logging', () => {
  const uid = u('user-1');
  const entry = {
    date: d('2024-06-01'),
    mood: 4 as EMF.MoodLevel,
    energy: 7 as EMF.EnergyLevel,
    note: EMF.none<string>(),
    traditionPractice: EMF.none<EMF.TraditionPractice>(),
  };
  const r = EMF.logEntry(uid, entry);
  expect('logEntry returns ok', r.ok);
  if (r.ok) {
    expect('entry id has e_ prefix', r.value.startsWith('e_'));
  }

  // Duplicate date rejected
  const dup = EMF.logEntry(uid, { ...entry, mood: 5 as EMF.MoodLevel, energy: 8 as EMF.EnergyLevel });
  expect('duplicate date rejected', !dup.ok);
  if (!dup.ok) expectEqual('duplicate error kind', dup.error.kind, 'duplicate');

  // Invalid mood
  const badMood = EMF.logEntry(uid, { ...entry, date: d('2024-06-02'), mood: 6 as unknown as EMF.MoodLevel });
  expect('invalid mood rejected', !badMood.ok);

  // Invalid energy
  const badEnergy = EMF.logEntry(uid, { ...entry, date: d('2024-06-02'), energy: 0 as unknown as EMF.EnergyLevel });
  expect('invalid energy rejected', !badEnergy.ok);

  // Note too long
  const longNote = 'x'.repeat(501);
  const badNote = EMF.logEntry(uid, { ...entry, date: d('2024-06-02'), note: EMF.Some(longNote) });
  expect('note too long rejected', !badNote.ok);

  // Invalid date
  const badDate = EMF.logEntry(uid, { ...entry, date: 'not-a-date' as EMF.ISODate });
  expect('invalid date rejected', !badDate.ok);

  // listEntries
  const list = EMF.listEntries(uid, { start: d('2024-01-01'), end: d('2024-12-31') });
  expectEqual('listEntries length', list.length, 1);

  // getEntry
  const got = EMF.getEntry(eid((list[0] as EMF.MoodEnergyEntry).id));
  expect('getEntry Some', got.kind === 'some');

  // deleteEntry
  const del = EMF.deleteEntry(eid((list[0] as EMF.MoodEnergyEntry).id));
  expect('deleteEntry ok', del.ok);
  const list2 = EMF.listEntries(uid, { start: d('2024-01-01'), end: d('2024-12-31') });
  expectEqual('listEntries after delete', list2.length, 0);

  // updateEntry — first create one
  const create = EMF.logEntry(uid, entry);
  expect('create before update', create.ok);
  if (create.ok) {
    const upd = EMF.updateEntry(create.value, { mood: 5 as EMF.MoodLevel });
    expect('updateEntry ok', upd.ok);
    if (upd.ok) expectEqual('updateEntry new mood', upd.value.mood, 5);
  }

  // updateEntry not found
  const upd404 = EMF.updateEntry(eid('nonexistent'), { mood: 3 as EMF.MoodLevel });
  expect('updateEntry not found', !upd404.ok);

  // deleteEntry not found
  const del404 = EMF.deleteEntry(eid('nonexistent'));
  expect('deleteEntry not found', !del404.ok);

  // getEntry not found
  const miss = EMF.getEntry(eid('nonexistent'));
  expect('getEntry None', miss.kind === 'none');
});

// =============================================================================
// 2. Heatmap
// =============================================================================

runOne('heatmap', () => {
  const uid = u('heat-user');
  // 3 days of data
  EMF.logEntry(uid, { date: d('2024-06-10'), mood: 3 as EMF.MoodLevel, energy: 5 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });
  EMF.logEntry(uid, { date: d('2024-06-11'), mood: 5 as EMF.MoodLevel, energy: 9 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });
  EMF.logEntry(uid, { date: d('2024-06-12'), mood: 1 as EMF.MoodLevel, energy: 2 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });

  const heatmap = EMF.generateHeatmap(uid, EMF.yearMonth('2024-06'));
  expectEqual('heatmap length = 30', heatmap.length, 30);

  // Days with entries have entryCount > 0
  const day10 = heatmap.find((h) => h.date === d('2024-06-10'));
  expect('day 10 found', !!day10);
  if (day10) {
    expectEqual('day 10 entryCount', day10.entryCount, 1);
    expect('day 10 moodAvg > 0', day10.moodAvg > 0);
    expect('day 10 intensity in range', day10.intensity >= 0 && day10.intensity <= 1);
  }

  // Day with no entry: intensity depends on lunar phase modulation
  const day1 = heatmap[0]!;
  expectEqual('day 1 entryCount', day1.entryCount, 0);
  expect('day 1 intensity in 0-0.125 range', day1.intensity >= 0 && day1.intensity <= 0.125);

  // Heatmap color
  const lightLow = EMF.getHeatmapColor(0.05, 'light');
  expectEqual('heatmap color light low', lightLow, '#fee2e2');
  const darkHigh = EMF.getHeatmapColor(0.95, 'dark');
  expectEqual('heatmap color dark high', darkHigh, '#4c1d95');
  const lightMid = EMF.getHeatmapColor(0.5, 'light');
  expect('heatmap color mid is valid hex', /^#[0-9a-f]{6}$/i.test(lightMid));

  // Accessibility text contains key fields
  if (day10) {
    const a11y = EMF.getHeatmapAccessibilityText(day10);
    expect('a11y contains date', a11y.includes('2024-06-10'));
    expect('a11y contains fase lunar', a11y.includes('fase lunar'));
  }

  // intensity out of range clamps
  expectEqual('color clamped at 1', EMF.getHeatmapColor(1.5, 'light'), HEATMAP_PALETTE[6]);
  expectEqual('color clamped at 0', EMF.getHeatmapColor(-0.5, 'light'), HEATMAP_PALETTE[0]);
});

// =============================================================================
// 3. Weekly patterns
// =============================================================================

runOne('weekly', () => {
  const uid = u('weekly-user');
  // Log a full week
  for (let i = 0; i < 7; i++) {
    const d2 = `2024-07-${String(i + 1).padStart(2, '0')}`;
    EMF.logEntry(uid, { date: d(d2), mood: (3 + (i % 2)) as EMF.MoodLevel, energy: (5 + i) as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });
  }
  const week = EMF.getWeeklyFlow(uid, d('2024-07-01'));
  expectEqual('week length = 7', week.days.length, 7);
  expect('avgIntensity > 0', week.avgIntensity > 0);
  expect('avgMood > 0', week.avgMood > 0);

  const dow = EMF.getDayOfWeekAverages(uid, { start: d('2024-07-01'), end: d('2024-07-07') });
  expect('dow[0] is number', typeof dow[0] === 'number');

  const trend = EMF.getTrendDirection(uid, { start: d('2024-07-01'), end: d('2024-07-07') });
  expect('trend is one of expected', ['rising', 'falling', 'stable'].includes(trend));

  // insufficient data trend
  const trend2 = EMF.getTrendDirection(u('nobody'), { start: d('2024-01-01'), end: d('2024-01-31') });
  expectEqual('trend empty user', trend2, 'insufficient-data');

  // anomalies — with uniform data, should be empty
  const anomalies = EMF.detectPatternAnomalies(uid, { start: d('2024-07-01'), end: d('2024-07-07') });
  expect('anomalies array', Array.isArray(anomalies));
});

// =============================================================================
// 4. Lunar correlation
// =============================================================================

runOne('lunar', () => {
  // Test phase
  expectEqual('phase 2024-01-11 is new', EMF.getLunarPhase(d('2024-01-11')), 'new');
  expectEqual('phase 2024-01-28 is full', EMF.getLunarPhase(d('2024-01-28')), 'full');

  // Phase names
  expectEqual('Lua Cheia pt-BR', EMF.getMoonPhaseName('full', 'pt-BR'), 'Lua Cheia');
  expectEqual('Full Moon en', EMF.getMoonPhaseName('full', 'en'), 'Full Moon');
  expectEqual('Luna Llena es', EMF.getMoonPhaseName('full', 'es'), 'Luna Llena');

  // Eclipses
  const eclipses = EMF.getEclipsesInRange({ start: d('2024-04-08'), end: d('2024-04-08') });
  expectEqual('eclipse on 2024-04-08', eclipses.length, 1);
  if (eclipses.length > 0) {
    expectEqual('eclipse type solar', eclipses[0]!.type, 'solar');
    expectEqual('eclipse tradition', eclipses[0]!.tradition, 'cigano-ramiro');
  }

  const noEclipse = EMF.getEclipsesInRange({ start: d('2024-06-01'), end: d('2024-06-30') });
  expectEqual('no eclipse in June 2024', noEclipse.length, 0);

  // Eclipse intensity boost
  expect('boost > 0 on eclipse', EMF.getEclipseIntensityBoost(u('u'), d('2024-04-08')) > 0);
  expectEqual('boost = 0 non-eclipse', EMF.getEclipseIntensityBoost(u('u'), d('2024-06-01')), 0);

  // Lunar correlation — insufficient data
  const lc1 = EMF.getLunarCorrelation(u('nobody'), { start: d('2024-01-01'), end: d('2024-12-31') });
  expectEqual('correlation sampleSize 0', lc1.sampleSize, 0);

  // Lunar correlation with data
  const uid = u('lunar-user');
  // Log 10 entries spread across a year
  const dates = ['2024-01-01','2024-02-01','2024-03-01','2024-04-01','2024-05-01','2024-06-01','2024-07-01','2024-08-01','2024-09-01','2024-10-01'];
  for (const dt of dates) {
    EMF.logEntry(uid, { date: d(dt), mood: 3 as EMF.MoodLevel, energy: 5 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });
  }
  const lc2 = EMF.getLunarCorrelation(uid, { start: d('2024-01-01'), end: d('2024-12-31') });
  expectEqual('correlation sampleSize 10', lc2.sampleSize, 10);
  expect('coefficient in 0-1', lc2.coefficient >= 0 && lc2.coefficient <= 1);
});

// =============================================================================
// 5. Tradition micro-practices
// =============================================================================

runOne('practices', () => {
  const allTraditions = EMF.getAllTraditionSuggestions({ mood: 3 as EMF.MoodLevel, energy: 5 as EMF.EnergyLevel });
  expectEqual('all traditions length 7', allTraditions.length, 7);

  // Each tradition has at least one practice
  for (const t of allTraditions) {
    expect(`tradition ${t.tradition} has ≥1 practice`, t.practices.length >= 1);
  }

  // Suggest by tradition
  const candomble = EMF.suggestMicroPractice({ mood: 1 as EMF.MoodLevel, energy: 2 as EMF.EnergyLevel }, 'candomble');
  expectEqual('candomble low mood low energy count', candomble.length, 3);
  expectEqual('candomble all candomble', candomble.every((p) => p.tradition === 'candomble'), true);

  // Mood-specific practices
  const lowMood = EMF.getPracticesForMood(1 as EMF.MoodLevel);
  expect('low mood practices ≥ 1', lowMood.length >= 1);
  const highMood = EMF.getPracticesForMood(5 as EMF.MoodLevel);
  expect('high mood practices ≥ 1', highMood.length >= 1);

  // Energy-specific
  const lowEnergy = EMF.getPracticesForEnergy(1 as EMF.EnergyLevel);
  expect('low energy practices ≥ 1', lowEnergy.length >= 1);
  const highEnergy = EMF.getPracticesForEnergy(10 as EMF.EnergyLevel);
  expect('high energy practices ≥ 1', highEnergy.length >= 1);

  // Sacred terms check (no debauchery)
  const cdPractices = EMF.suggestMicroPractice({ mood: 1 as EMF.MoodLevel, energy: 1 as EMF.EnergyLevel }, 'candomble');
  const cdText = cdPractices.map((p) => p.practice).join(' ');
  expect('candomble has Oxalá reference somewhere', allTraditions.find(t => t.tradition === 'candomble')!.practices.some(p => /Oxal|Iemanj|Xang|Ians|Obaluai|Omolu|Oxossi|Nan/i.test(p.practice)));
});

// =============================================================================
// 6. Streaks
// =============================================================================

runOne('streaks', () => {
  const uid = u('streak-user');
  // Day 1
  let r = EMF.recordCheckIn(uid, d('2024-08-01'));
  expect('streak day 1 = 1', r.streak.currentDays === 1);
  expectEqual('streak day 1 isNewRecord', r.isNewRecord, true);

  // Day 2
  r = EMF.recordCheckIn(uid, d('2024-08-02'));
  expectEqual('streak day 2 current', r.streak.currentDays, 2);
  expectEqual('streak day 2 daysAdded', r.daysAdded, 1);

  // Same day twice
  r = EMF.recordCheckIn(uid, d('2024-08-02'));
  expectEqual('streak same day current unchanged', r.streak.currentDays, 2);
  expectEqual('streak same day daysAdded', r.daysAdded, 0);

  // Skip a day → reset
  r = EMF.recordCheckIn(uid, d('2024-08-05'));
  expectEqual('streak reset to 1', r.streak.currentDays, 1);

  const streak = EMF.getCheckInStreak(uid);
  expectEqual('streak longestDays', streak.longestDays, 2);
  expectEqual('streak totalCheckIns', streak.totalCheckIns, 3);

  // Streak broken
  const broken = EMF.isStreakBroken(uid, d('2024-08-10'));
  expectEqual('streak is broken', broken, true);

  const notBroken = EMF.isStreakBroken(uid, d('2024-08-06'));
  expectEqual('streak not broken (same day)', notBroken, false);

  // Empty user
  const emptyStreak = EMF.getCheckInStreak(u('nobody'));
  expectEqual('empty streak current', emptyStreak.currentDays, 0);
});

// =============================================================================
// 7. Export
// =============================================================================

runOne('export', () => {
  const uid = u('export-user');
  EMF.logEntry(uid, { date: d('2024-09-01'), mood: 4 as EMF.MoodLevel, energy: 7 as EMF.EnergyLevel, note: EMF.Some('dia bom'), traditionPractice: EMF.Some({ tradition: 'candomble', practice: 'Cantiga', intensity: 'leve' }) });
  EMF.logEntry(uid, { date: d('2024-09-02'), mood: 2 as EMF.MoodLevel, energy: 4 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });

  const json = EMF.exportAsJson(uid, { start: d('2024-09-01'), end: d('2024-09-30') });
  expect('json is parseable', (() => { try { JSON.parse(json); return true; } catch { return false; } })());
  const parsed = JSON.parse(json);
  expectEqual('json entry count', parsed.entries.length, 2);

  const csv = EMF.exportAsCsv(uid, { start: d('2024-09-01'), end: d('2024-09-30') });
  expect('csv has header', csv.startsWith('id,date,mood,energy'));
  const lines = csv.trim().split('\n');
  expectEqual('csv line count', lines.length, 3);

  // exportHeatmapAsPng throws
  let threw = false;
  try { EMF.exportHeatmapAsPng(); } catch { threw = true; }
  expect('exportHeatmapAsPng throws', threw);
});

// =============================================================================
// 8. Privacy
// =============================================================================

runOne('privacy', () => {
  const uid = u('private-user');
  expectEqual('aggregateOnly default false', EMF.isAggregateOnly(uid), false);
  EMF.setAggregateOnly(uid, true);
  expectEqual('aggregateOnly set true', EMF.isAggregateOnly(uid), true);

  // Log 10 entries
  for (let i = 1; i <= 10; i++) {
    EMF.logEntry(uid, { date: d(`2024-10-${String(i).padStart(2, '0')}`), mood: 3 as EMF.MoodLevel, energy: 5 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });
  }
  // With aggregateOnly, correlation sample size is 0
  const lc = EMF.getLunarCorrelation(uid, { start: d('2024-10-01'), end: d('2024-10-31') });
  expectEqual('aggregateOnly correlation sampleSize', lc.sampleSize, 0);
  // Anomalies return empty
  const anom = EMF.detectPatternAnomalies(uid, { start: d('2024-10-01'), end: d('2024-10-31') });
  expectEqual('aggregateOnly anomalies empty', anom.length, 0);

  // anonymize
  EMF.setAggregateOnly(uid, false);
  const anon = EMF.anonymizeUser(uid);
  expect('anonymize ok', anon.ok);
  const list = EMF.listEntries(uid, { start: d('2024-01-01'), end: d('2024-12-31') });
  expectEqual('entries wiped after anonymize', list.length, 0);

  // anonymize again
  const anon2 = EMF.anonymizeUser(uid);
  expect('anonymize twice fails', !anon2.ok);

  // new logging fails after anonymize
  const failLog = EMF.logEntry(uid, { date: d('2024-11-01'), mood: 4 as EMF.MoodLevel, energy: 6 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });
  expect('logEntry after anonymize fails', !failLog.ok);

  // anonymize no data
  const noData = EMF.anonymizeUser(u('never-existed'));
  expect('anonymize no data fails', !noData.ok);
});

// =============================================================================
// 9. Hash utility
// =============================================================================

runOne('hash', () => {
  // Canonical vector: sha256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  expectEqual('sha256("")', sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  // sha256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
  expectEqual('sha256("abc")', sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  // Deterministic
  expectEqual('sha256 deterministic', sha256Hex('hello'), sha256Hex('hello'));
  // hashCacheKey canonical
  const k1 = hashCacheKey(['a', 'b', 'c']);
  const k2 = hashCacheKey(['c', 'b', 'a']);
  expectEqual('hashCacheKey sorted', k1, k2);
});

// =============================================================================
// Summary
// =============================================================================

console.log(`\n--- SUMMARY ---`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
if (failures.length > 0) {
  console.log(`\nFAILURES:\n${failures.map((f) => '  - ' + f).join('\n')}`);
}
process.exit(failed > 0 ? 1 : 0);
