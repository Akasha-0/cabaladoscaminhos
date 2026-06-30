/**
 * ════════════════════════════════════════════════════════════════════════════
 * W79-A — BIORHYTHM CALENDAR · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Inline checks mirroring engine logic. Run with:
 *   node --experimental-strip-types --no-warnings scripts/smoke/w79-biorhythm-calendar.ts
 *
 * Cycle 78 lessons: process.exit declared inline; check/expectThrow idiom.
 */

declare const process: { exit(code: number): never };

import {
  buildMonthGridView,
  buildWeekStripView,
  buildDayDetailView,
  summarizeCriticalDays,
  exportIcs,
  buildPhaseRibbon,
  listTraditions,
  hashCacheKey,
  calculateDayReading,
  phaseValue,
  isCriticalDay,
  digitalRoot,
  parseDate,
  BIORHYTHM_PERIODS,
  SACRED_TRADITIONS,
  CIGANO_28,
  __TEST__,
} from '../../src/lib/w79/biorhythm-calendar.ts';

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

function expectThrow(label: string, fn: () => unknown): void {
  let threw = false;
  try { fn(); } catch { threw = true; }
  check(label, threw);
}

console.log('W79-A Biorhythm Calendar — Smoke Harness\n');

// ── Section 1: Biorhythm constants & math ───────────────────────────────
check('BIORHYTHM_PERIODS.physical === 23', BIORHYTHM_PERIODS.physical === 23);
check('BIORHYTHM_PERIODS.emotional === 28', BIORHYTHM_PERIODS.emotional === 28);
check('BIORHYTHM_PERIODS.intellectual === 33', BIORHYTHM_PERIODS.intellectual === 33);
check('phaseValue(0, 23) ≈ 0', Math.abs(phaseValue(0, 23)) < 1e-9);
check('phaseValue(5.75, 23) ≈ 1 (peak)', Math.abs(phaseValue(5.75, 23) - 1) < 1e-9);
check('isCriticalDay(0, 23)', isCriticalDay(0, 23));
check('isCriticalDay(23, 23)', isCriticalDay(23, 23));
check('!isCriticalDay(11.5, 23)', !isCriticalDay(11.5, 23));
check('digitalRoot(11) preserves master 11', digitalRoot(11) === 11);
check('digitalRoot(22) preserves master 22', digitalRoot(22) === 22);
check('digitalRoot(29) → 11', digitalRoot(29) === 11);

// ── Section 2: Date parsing ─────────────────────────────────────────────
check('parseDate("1985-03-15")', parseDate('1985-03-15').getUTCFullYear() === 1985);
check('parseDate leap year 2024-02-29', parseDate('2024-02-29').getUTCDate() === 29);
expectThrow('parseDate rejects 1985-13-01', () => parseDate('1985-13-01'));
expectThrow('parseDate rejects 1985-02-30', () => parseDate('1985-02-30'));
expectThrow('parseDate rejects invalid format', () => parseDate('not a date'));

// ── Section 3: Day reading ──────────────────────────────────────────────
const r = calculateDayReading('1985-03-15', '2025-01-15');
check('calculateDayReading returns frozen', Object.isFrozen(r));
check('calculateDayReading weekday present', r.weekday.length > 0);
check('calculateDayReading planet present', r.planet.length > 0);
check('calculateDayReading ciganoCard in CIGANO_28', CIGANO_28.includes(r.ciganoCard));
check('calculateDayReading odu.id in 1..16', r.odu.id >= 1 && r.odu.id <= 16);
check('calculateDayReading summary has keyword "Dia"', r.summary.includes('Dia'));

// ── Section 4: Sacred tables ────────────────────────────────────────────
const t = listTraditions();
check('listTraditions returns 7', t.length === 7);
check('SACRED_TRADITIONS includes Astrologia', SACRED_TRADITIONS.includes('Astrologia'));
check('SACRED_TRADITIONS includes Cigano', SACRED_TRADITIONS.includes('Cigano'));
check('SACRED_TRADITIONS includes Orixás', SACRED_TRADITIONS.includes('Orixás'));
check('SACRED_TRADITIONS includes Cabala', SACRED_TRADITIONS.includes('Cabala'));
check('SACRED_TRADITIONS includes Tantra', SACRED_TRADITIONS.includes('Tantra'));
check('SACRED_TRADITIONS includes Ifá', SACRED_TRADITIONS.includes('Ifá'));
check('SACRED_TRADITIONS includes Numerologia Cabalística', SACRED_TRADITIONS.includes('Numerologia Cabalística'));
check('CIGANO_28 has 28 cards', CIGANO_28.length === 28);

// ── Section 5: Month grid ───────────────────────────────────────────────
const grid = buildMonthGridView({ birthDate: '1985-03-15', monthAnchor: '2025-01-15', today: '2025-01-15' });
check('MonthGrid has 42 cells', grid.cells.length === 42);
check('MonthGrid label is "Janeiro 2025"', grid.monthLabel === 'Janeiro 2025');
check('MonthGrid cells are frozen', Object.isFrozen(grid.cells[0]!));
check('MonthGrid inMonth count for January = 31', grid.cells.filter((c) => c.inMonth).length === 31);

// ── Section 6: Week strip ───────────────────────────────────────────────
const week = buildWeekStripView({ birthDate: '1985-03-15', weekAnchor: '2025-01-15', today: '2025-01-15' });
check('WeekStrip has 7 cells', week.cells.length === 7);
check('WeekStrip starts on Sunday', week.cells[0]!.weekdayShort === 'Dom');
check('WeekStrip ends on Sábado', week.cells[6]!.weekdayShort === 'Sáb');

// ── Section 7: Day detail ───────────────────────────────────────────────
const detail = buildDayDetailView({ birthDate: '1985-03-15', date: '2025-01-15' });
check('DayDetail weaves 7 traditions', detail.sacredWeave.length === 7);
check('DayDetail uiTone is one of 4', ['critical', 'low', 'neutral', 'high'].includes(detail.uiTone));
check('DayDetail guidance non-empty', detail.guidance.length > 5);

// ── Section 8: Critical day summary ─────────────────────────────────────
const crit = summarizeCriticalDays({
  birthDate: '1985-03-15',
  from: '1985-04-01',
  to: '1985-05-31',
});
check('CriticalDaySummary is frozen', Object.isFrozen(crit));
check('CriticalDaySummary has at least 4 days', crit.totalCritical >= 4);
check('CriticalDaySummary perCycle sums match', crit.perCycle.physical + crit.perCycle.emotional + crit.perCycle.intellectual === crit.totalCritical);

// ── Section 9: ICS export ───────────────────────────────────────────────
const ics = exportIcs({ birthDate: '1985-03-15', from: '2025-01-01', to: '2025-01-03' });
check('ICS body starts with BEGIN:VCALENDAR', ics.body.startsWith('BEGIN:VCALENDAR\r\n'));
check('ICS body ends with END:VCALENDAR', ics.body.trimEnd().endsWith('END:VCALENDAR'));
check('ICS eventCount = 3', ics.eventCount === 3);
check('ICS filename includes date range', ics.filename.includes('2025-01-01') && ics.filename.includes('2025-01-03'));
check('ICS contentType is text/calendar', ics.contentType === 'text/calendar');
check('ICS body has DTSTART', ics.body.includes('DTSTART;VALUE=DATE:'));
check('ICS body is CRLF-terminated', ics.body.includes('\r\n'));

// ── Section 10: Phase ribbon ────────────────────────────────────────────
const ribbon = buildPhaseRibbon({ cycle: 'physical', startDay: 0, endDay: 23, samples: 20 });
check('PhaseRibbon path starts with M', ribbon.pathD.startsWith('M'));
check('PhaseRibbon path includes L', ribbon.pathD.includes('L'));
check('PhaseRibbon has 21 samples', ribbon.samples.length === 21);
check('PhaseRibbon width/height default', ribbon.width === 280 && ribbon.height === 60);

// ── Section 11: SHA-256 cache key ───────────────────────────────────────
const k1 = hashCacheKey({ a: 1, b: 2 });
const k2 = hashCacheKey({ a: 1, b: 2 });
const k3 = hashCacheKey({ b: 2, a: 1 });
check('hashCacheKey deterministic', k1 === k2);
check('hashCacheKey canonical (order-independent)', k1 === k3);
check('hashCacheKey length = 64', k1.length === 64);

// ── Section 12: SHA-256 vector parity ───────────────────────────────────
check('SHA-256("") = e3b0c4...', __TEST__.sha256HexSync('') === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
check('SHA-256("abc") = ba7816...', __TEST__.sha256HexSync('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
check('SHA-256("a") = ca9781...', __TEST__.sha256HexSync('a') === 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb');

// ── Section 13: Cross-engine integration ────────────────────────────────
const set = buildMonthGridView({ birthDate: '1985-03-15', monthAnchor: '2025-01-15', today: '2025-01-15' });
const todayCell = set.cells.find((c) => c.isToday);
check('Today cell exists in month grid', todayCell !== undefined);
check('Today cell date = 2025-01-15', todayCell!.date === '2025-01-15');

console.log(`\n${passes} passed, ${fails} failed (${passes + fails} total)`);
if (fails === 0) console.log('0 failures');
else process.exit(1);
