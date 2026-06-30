// W78-D: Energy + Mood Flow smoke harness — sync, fast, ≥20 checks
import * as EMF from './energy-mood-flow.ts';
import { sha256Hex, hashCacheKey } from './energy-mood-flow.hash.ts';

const _internal = (EMF as unknown as { _internal: { _resetAllForTests: () => void } })._internal;

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(label: string, cond: boolean): void {
  if (cond) passed++;
  else { failed++; failures.push(label); console.error(`FAIL: ${label}`); }
}

function expectThrow(label: string, fn: () => void, msgFragment?: string): void {
  try { fn(); failed++; failures.push(label + ' (did not throw)'); console.error(`FAIL: ${label} (did not throw)`); }
  catch (e) {
    if (msgFragment && !String(e).includes(msgFragment)) {
      failed++; failures.push(label + ` (msg mismatch: ${String(e)})`);
      console.error(`FAIL: ${label} (msg mismatch)`);
    } else {
      passed++;
    }
  }
}

_internal._resetAllForTests();

// 1. logEntry happy path
const u1 = 'smoke-user' as EMF.UserId;
const r1 = EMF.logEntry(u1, {
  date: '2024-06-01' as EMF.ISODate,
  mood: 4 as EMF.MoodLevel,
  energy: 7 as EMF.EnergyLevel,
  note: EMF.none<string>(),
  traditionPractice: EMF.none<EMF.TraditionPractice>(),
});
check('logEntry ok', r1.ok);

// 2. invalid mood
const r2 = EMF.logEntry(u1, {
  date: '2024-06-02' as EMF.ISODate,
  mood: 6 as unknown as EMF.MoodLevel,
  energy: 5 as EMF.EnergyLevel,
  note: EMF.none(), traditionPractice: EMF.none(),
});
check('invalid mood rejected', !r2.ok);

// 3. invalid energy
const r3 = EMF.logEntry(u1, {
  date: '2024-06-03' as EMF.ISODate,
  mood: 3 as EMF.MoodLevel,
  energy: 11 as unknown as EMF.EnergyLevel,
  note: EMF.none(), traditionPractice: EMF.none(),
});
check('invalid energy rejected', !r3.ok);

// 4. lunar phase
check('new moon 2024-01-11', EMF.getLunarPhase('2024-01-11' as EMF.ISODate) === 'new');
check('full moon 2024-01-28', EMF.getLunarPhase('2024-01-28' as EMF.ISODate) === 'full');

// 5. moon name
check('Lua Cheia pt-BR', EMF.getMoonPhaseName('full', 'pt-BR') === 'Lua Cheia');
check('Full Moon en', EMF.getMoonPhaseName('full', 'en') === 'Full Moon');
check('Luna Llena es', EMF.getMoonPhaseName('full', 'es') === 'Luna Llena');

// 6. eclipse lookup
const e1 = EMF.getEclipsesInRange({ start: '2024-04-08' as EMF.ISODate, end: '2024-04-08' as EMF.ISODate });
check('eclipse on 2024-04-08', e1.length === 1 && e1[0]!.type === 'solar');

// 7. heatmap
const hm = EMF.generateHeatmap(u1, '2024-06' as EMF.YearMonth);
check('heatmap 30 days', hm.length === 30);
check('heatmap day 1 has entries (2024-06-01)', hm[0]!.entryCount === 1);

// 8. heatmap color
check('color low red', EMF.getHeatmapColor(0.05, 'light') === '#fee2e2');
check('color high purple', EMF.getHeatmapColor(0.95, 'dark') === '#4c1d95');

// 9. all traditions
const all = EMF.getAllTraditionSuggestions({ mood: 3 as EMF.MoodLevel, energy: 5 as EMF.EnergyLevel });
check('all traditions count 7', all.length === 7);
const traditions = new Set(all.map(t => t.tradition));
check('contains candomble', traditions.has('candomble'));
check('contains cigano-ramiro', traditions.has('cigano-ramiro'));

// 10. streak
const s1 = EMF.recordCheckIn(u1, '2024-08-01' as EMF.ISODate);
check('streak first day', s1.streak.currentDays === 1);
const s2 = EMF.recordCheckIn(u1, '2024-08-02' as EMF.ISODate);
check('streak consecutive', s2.streak.currentDays === 2);

// 11. export
const json = EMF.exportAsJson(u1, { start: '2024-06-01' as EMF.ISODate, end: '2024-12-31' as EMF.ISODate });
check('json parseable', (() => { try { JSON.parse(json); return true; } catch { return false; } })());
const csv = EMF.exportAsCsv(u1, { start: '2024-06-01' as EMF.ISODate, end: '2024-12-31' as EMF.ISODate });
check('csv has header', csv.startsWith('id,date'));

// 12. exportHeatmapAsPng throws
expectThrow('png throws', () => EMF.exportHeatmapAsPng(), 'feature not implemented');

// 13. privacy
EMF.setAggregateOnly(u1, true);
check('aggregateOnly true', EMF.isAggregateOnly(u1) === true);
EMF.setAggregateOnly(u1, false);

// 14. hash
check('sha256 abc', sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
check('hashCacheKey canonical', hashCacheKey(['a','b','c']) === hashCacheKey(['c','b','a']));

// 15. anonymize
const u2 = 'smoke-anon' as EMF.UserId;
EMF.logEntry(u2, { date: '2024-09-01' as EMF.ISODate, mood: 3 as EMF.MoodLevel, energy: 5 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });
const ar = EMF.anonymizeUser(u2);
check('anonymize ok', ar.ok);
check('entries cleared', EMF.listEntries(u2, { start: '2024-01-01' as EMF.ISODate, end: '2024-12-31' as EMF.ISODate }).length === 0);
const ar2 = EMF.anonymizeUser(u2);
check('anonymize twice fails', !ar2.ok);

// 16. intensity helper
const sampleEntry: EMF.MoodEnergyEntry = Object.freeze({
  id: 'e_test' as EMF.EntryId,
  userId: u1,
  date: '2024-06-15' as EMF.ISODate,
  mood: 5 as EMF.MoodLevel,
  energy: 10 as EMF.EnergyLevel,
  note: EMF.none<string>(),
  traditionPractice: EMF.none<EMF.TraditionPractice>(),
  createdAt: '2024-06-15T00:00:00.000Z' as EMF.ISODateTime,
  updatedAt: '2024-06-15T00:00:00.000Z' as EMF.ISODateTime,
});
const intensity = EMF.getIntensity(sampleEntry);
check('intensity in range', intensity >= 0 && intensity <= 1);

// 17. trend insufficient
check('trend insufficient data', EMF.getTrendDirection('nobody' as EMF.UserId, { start: '2024-01-01' as EMF.ISODate, end: '2024-12-31' as EMF.ISODate }) === 'insufficient-data');

// 18. weekly flow 7 days
const weekly = EMF.getWeeklyFlow(u1, '2024-06-01' as EMF.ISODate);
check('weekly 7 days', weekly.days.length === 7);

// 19. day of week
const dow = EMF.getDayOfWeekAverages(u1, { start: '2024-06-01' as EMF.ISODate, end: '2024-06-30' as EMF.ISODate });
check('dow sunday is number', typeof dow[0] === 'number');

// 20. updateEntry
const u3 = 'smoke-update' as EMF.UserId;
const cr = EMF.logEntry(u3, { date: '2024-10-01' as EMF.ISODate, mood: 3 as EMF.MoodLevel, energy: 5 as EMF.EnergyLevel, note: EMF.none(), traditionPractice: EMF.none() });
if (cr.ok) {
  const up = EMF.updateEntry(cr.value, { mood: 5 as EMF.MoodLevel });
  check('updateEntry ok', up.ok);
}

// 21. deleteEntry
if (cr.ok) {
  const de = EMF.deleteEntry(cr.value);
  check('deleteEntry ok', de.ok);
}

// 22. lunar correlation
const lc = EMF.getLunarCorrelation(u1, { start: '2024-06-01' as EMF.ISODate, end: '2024-12-31' as EMF.ISODate });
check('lunar correlation has sampleSize', typeof lc.sampleSize === 'number');

// 23. practices for mood and energy
const pm = EMF.getPracticesForMood(1 as EMF.MoodLevel);
check('low mood practices', pm.length >= 1);
const pe = EMF.getPracticesForEnergy(1 as EMF.EnergyLevel);
check('low energy practices', pe.length >= 1);

// 24. streak broken
const sb = EMF.isStreakBroken(u1, '2024-12-31' as EMF.ISODate);
check('streak broken far date', sb === true);

// 25. eclipse intensity boost
check('eclipse boost > 0', EMF.getEclipseIntensityBoost(u1, '2024-04-08' as EMF.ISODate) > 0);
check('non-eclipse boost = 0', EMF.getEclipseIntensityBoost(u1, '2024-06-15' as EMF.ISODate) === 0);

console.log(`\nSMOKE: PASSED=${passed} FAILED=${failed}`);
if (failures.length > 0) {
  console.log(`FAILURES:\n${failures.map(f => '  - ' + f).join('\n')}`);
}
process.exit(failed > 0 ? 1 : 0);
