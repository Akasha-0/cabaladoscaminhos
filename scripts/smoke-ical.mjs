#!/usr/bin/env node
/**
 * Smoke tests for iCal export.
 */
import {
  formatIcsDateUtc,
  escapeIcsText,
  foldLine,
  formatRrule,
  expandRecurrence,
  buildVevent,
  buildIcs,
  expandRecurringToIcs,
  CALENDAR_HEADER,
  CALENDAR_FOOTER,
} from '../src/lib/community/ical-export.ts';

let passed = 0;
let failed = 0;
const run = (name, fn) => {
  try { fn(); passed++; console.log(`✓ ${name}`); }
  catch (e) { failed++; console.error(`✗ ${name}: ${e.message}`); }
};

// formatIcsDateUtc
run('formatIcsDateUtc: 2026-06-30T15:00:00Z', () => {
  const r = formatIcsDateUtc(new Date('2026-06-30T15:00:00Z'));
  if (r !== '20260630T150000Z') throw new Error(`got ${r}`);
});

// escapeIcsText
run('escapeIcsText: vírgula', () => {
  if (escapeIcsText('a, b') !== 'a\\, b') throw new Error('expected escape');
});
run('escapeIcsText: ponto-e-vírgula', () => {
  if (escapeIcsText('a; b') !== 'a\\; b') throw new Error('expected escape');
});
run('escapeIcsText: newline', () => {
  if (escapeIcsText('a\nb') !== 'a\\nb') throw new Error('expected escape');
});
run('escapeIcsText: backslash', () => {
  if (escapeIcsText('a\\b') !== 'a\\\\b') throw new Error('expected double escape');
});

// foldLine
run('foldLine: linha curta sem fold', () => {
  if (foldLine('SHORT').length > 75) throw new Error('should not fold');
});
run('foldLine: linha longa com fold', () => {
  const long = 'X'.repeat(200);
  const folded = foldLine(long);
  const firstLine = folded.split('\r\n')[0];
  if (firstLine.length !== 75) throw new Error(`first line len ${firstLine.length}`);
  if (!folded.includes('\r\n')) throw new Error('should have CRLF');
});

// RRULE
run('formatRrule: DAILY', () => {
  const r = formatRrule({ freq: 'DAILY', count: 7 });
  if (r !== 'FREQ=DAILY;COUNT=7') throw new Error(`got ${r}`);
});
run('formatRrule: WEEKLY com BYDAY', () => {
  const r = formatRrule({ freq: 'WEEKLY', count: 4, byDay: ['MO', 'WE'] });
  if (r !== 'FREQ=WEEKLY;COUNT=4;BYDAY=MO,WE') throw new Error(`got ${r}`);
});
run('formatRrule: MONTHLY com BYMONTHDAY', () => {
  const r = formatRrule({ freq: 'MONTHLY', interval: 2, byMonthDay: 15 });
  if (r !== 'FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=15') throw new Error(`got ${r}`);
});

// expandRecurrence
run('expandRecurrence: DAILY x 3', () => {
  const start = new Date('2026-06-30T15:00:00Z');
  const end = new Date('2026-06-30T16:00:00Z');
  const occs = expandRecurrence(start, end, { freq: 'DAILY', count: 3 });
  if (occs.length !== 3) throw new Error(`expected 3, got ${occs.length}`);
  if (occs[0].startUtc.toISOString() !== '2026-06-30T15:00:00.000Z') throw new Error('first wrong');
  if (occs[1].startUtc.toISOString() !== '2026-07-01T15:00:00.000Z') throw new Error('second wrong');
  if (occs[2].startUtc.toISOString() !== '2026-07-02T15:00:00.000Z') throw new Error('third wrong');
  if ((occs[0].endUtc.getTime() - occs[0].startUtc.getTime()) !== 3600000) throw new Error('duration wrong');
});

run('expandRecurrence: UNTIL stop', () => {
  const start = new Date('2026-06-30T15:00:00Z');
  const end = new Date('2026-06-30T16:00:00Z');
  const until = new Date('2026-07-02T15:00:00Z');
  const occs = expandRecurrence(start, end, { freq: 'DAILY', until });
  if (occs.length !== 3) throw new Error(`expected 3, got ${occs.length}`);
});

run('expandRecurrence: cap em maxOccurrences', () => {
  const start = new Date('2026-06-30T15:00:00Z');
  const end = new Date('2026-06-30T16:00:00Z');
  const occs = expandRecurrence(start, end, { freq: 'DAILY', count: 1000 }, 5);
  if (occs.length !== 5) throw new Error(`expected 5, got ${occs.length}`);
});

// buildVevent
const sampleEvent = {
  uid: 'event-1@cabaladoscaminhos.app',
  title: 'Círculo de Cabala',
  description: 'Estudo do Zohar',
  location: 'Online',
  startUtc: new Date('2026-07-01T19:00:00Z'),
  endUtc: new Date('2026-07-01T21:00:00Z'),
  organizerName: 'Aisha',
  organizerEmail: 'aisha@example.com',
  timezone: 'America/Sao_Paulo',
  status: 'CONFIRMED',
  tradition: 'Cabala',
};

run('buildVevent: tem BEGIN/END', () => {
  const v = buildVevent(sampleEvent);
  if (!v.startsWith('BEGIN:VEVENT')) throw new Error('missing BEGIN');
  if (!v.endsWith('END:VEVENT')) throw new Error('missing END');
  if (!v.includes('UID:event-1@cabaladoscaminhos.app')) throw new Error('missing UID');
  if (!v.includes('SUMMARY:Círculo de Cabala')) throw new Error('missing SUMMARY');
  if (!v.includes('CATEGORIES:Cabala')) throw new Error('missing CATEGORIES');
});

run('buildVevent: com RRULE', () => {
  const v = buildVevent({ ...sampleEvent, rrule: { freq: 'WEEKLY', count: 4 } });
  if (!v.includes('RRULE:FREQ=WEEKLY;COUNT=4')) throw new Error('missing RRULE');
});

// buildIcs
run('buildIcs: 2 events', () => {
  const ics = buildIcs([sampleEvent, { ...sampleEvent, uid: 'event-2@cabaladoscaminhos.app' }]);
  if (!ics.includes(CALENDAR_HEADER)) throw new Error('missing header');
  if (!ics.includes(CALENDAR_FOOTER)) throw new Error('missing footer');
  if ((ics.match(/BEGIN:VEVENT/g) || []).length !== 2) throw new Error('expected 2 VEVENT');
  if ((ics.match(/END:VEVENT/g) || []).length !== 2) throw new Error('expected 2 END VEVENT');
});

run('buildIcs: vazio ainda tem header/footer', () => {
  const ics = buildIcs([]);
  if (!ics.includes(CALENDAR_HEADER)) throw new Error('missing header');
  if (!ics.includes(CALENDAR_FOOTER)) throw new Error('missing footer');
});

// expandRecurringToIcs
run('expandRecurringToIcs: sem RRULE = 1 evento', () => {
  const events = expandRecurringToIcs(sampleEvent);
  if (events.length !== 1) throw new Error(`expected 1, got ${events.length}`);
});

run('expandRecurringToIcs: DAILY x 3 = 3 eventos', () => {
  const events = expandRecurringToIcs({ ...sampleEvent, rrule: { freq: 'DAILY', count: 3 } });
  if (events.length !== 3) throw new Error(`expected 3, got ${events.length}`);
  if (events[1].uid !== 'event-1@cabaladoscaminhos.app-1') throw new Error('uid wrong');
  if (events[1].rrule !== undefined) throw new Error('rrule should be removed');
});

console.log(`\n${passed}/${passed + failed} testes passaram`);
if (failed > 0) process.exit(1);