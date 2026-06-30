#!/usr/bin/env node
// ============================================================================
// W93-D — EVENTS + WORKSHOPS · SMOKE HARNESS
// ----------------------------------------------------------------------------
// Inline runtime asserts (sem test framework) cobrindo:
//   - Events engine: create / list / RSVP / cancel / waitlist / capacity
//   - Workshops engine: create / attend / waitlist / progress / addSession
//   - iCal export: VCALENDAR/VEVENT shell, CRLF, UTC, escape
//   - Notification hook: EventsNotification emitido, LGPD-safe
//
// Roda com: node --experimental-strip-types scripts/smoke-events-workshops.mjs
// ============================================================================

import { EventsEngine, computeSignupStatus, makeHost } from '../src/lib/w93/events-engine.ts';
import { WorkshopsEngine } from '../src/lib/w93/workshops-engine.ts';
import {
  eventToIcs,
  workshopToIcs,
  formatUtc,
  escapeIcsText,
  isValidIcsShell,
  hasCrlf,
} from '../src/lib/w93/ics-export.ts';
import {
  eventsNotificationToCreateInput,
  assertNoPiiInNotification,
} from '../src/lib/w93/notification-hook.ts';
import {
  eventId,
  userId,
  workshopId,
  sessionId,
  EventsError,
  type Event,
  type EventDraft,
  type Workshop,
  type WorkshopDraft,
} from '../src/lib/w93/events-types.ts';

let passes = 0;
let fails = 0;
const failures = [];

function check(label, cond, detail) {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    const msg = detail ? ` — ${detail}` : '';
    failures.push(`${label}${msg}`);
    console.log(`  ✗ ${label}${msg}`);
  }
}

console.log('W93-D Events + Workshops — Smoke Harness\n');

// ============================================================================
// Section 1 — Events engine
// ============================================================================

console.log('Section 1: Events engine');

const NOW_MS = Date.parse('2026-08-01T12:00:00Z');
let idSeq = 0;
const fakeId = () => `id-${(++idSeq).toString().padStart(4, '0')}-aaaa-bbbb-cccc-dddddddddddd`;

const notifs = [];
const engine = new EventsEngine({
  now: () => NOW_MS,
  idFactory: fakeId,
  notifier: (n) => notifs.push(n),
});

const host = makeHost({
  id: userId('host-1'),
  displayName: 'Iá Helena',
  handle: 'ia-helena',
  traditionLine: 'Candomblé · Umbanda',
  bio: 'Ialorixá do Ilê Axé Ogum Megê.',
});

const draft = {
  id: eventId(fakeId()),
  slug: 'roda-de-cabala-setembro-2026',
  title: 'Roda de Cabala — Os 72 Shemot',
  description: 'Roda de estudo sobre os 72 nomes divinos.',
  kind: 'roda',
  tradition: 'cabala',
  startsAt: new Date(NOW_MS + 7 * 86400_000).toISOString(),
  endsAt: new Date(NOW_MS + 7 * 86400_000 + 90 * 60_000).toISOString(),
  durationMin: 90,
  location: { kind: 'online', platform: 'Zoom' },
  capacity: 20,
  priceCents: null,
  coverImage: '/event-covers/roda-cabala.jpg',
  coverAlt: 'Roda de Cabala online',
  host,
  language: 'pt-BR',
};

const ev = engine.create(draft);
check('create() insere evento', ev.id === draft.id);
check('evento criado tem signupStatus open', ev.signupStatus === 'open');
check('evento criado tem confirmedCount=0', ev.confirmedCount === 0);

// Validation
let threw = false;
try {
  engine.create({ ...draft, id: eventId(fakeId()), slug: 'bad', endsAt: draft.startsAt });
} catch (e) {
  threw = e instanceof EventsError && e.code === 'INVALID_DATES';
}
check('create() rejeita endsAt <= startsAt', threw);

threw = false;
try {
  engine.create({ ...draft, id: eventId(fakeId()), slug: 'bad2', capacity: -1 });
} catch (e) {
  threw = e instanceof EventsError && e.code === 'INVALID_CAPACITY';
}
check('create() rejeita capacity negativa', threw);

// RSVP happy path
const r1 = engine.rsvp({ eventId: ev.id, userId: userId('u1') });
check('rsvp() cria Rsvp confirmed', r1.status === 'confirmed');
check('rsvp() confirmedCount incrementa', engine.get(ev.id).confirmedCount === 1);

// RSVP duplicate
threw = false;
try {
  engine.rsvp({ eventId: ev.id, userId: userId('u1') });
} catch (e) {
  threw = e instanceof EventsError && e.code === 'DUPLICATE_RSVP';
}
check('rsvp() rejeita duplicado', threw);

// Waitlist
const wEv = engine.create({
  ...draft,
  id: eventId(fakeId()),
  slug: 'lotado',
  capacity: 2,
});
engine.rsvp({ eventId: wEv.id, userId: userId('w1') });
engine.rsvp({ eventId: wEv.id, userId: userId('w2') });
const w3 = engine.rsvp({ eventId: wEv.id, userId: userId('w3') });
check('rsvp() em evento lotado → waitlist', w3.status === 'waitlist');
check('waitlist position = 1', w3.waitlistPosition === 1);

// Cancel + promotion
const { promoted } = engine.cancel(engine.listRsvps(wEv.id).find((r) => r.userId === userId('w1')).id);
check('cancel() de confirmed promove primeiro da waitlist', promoted?.userId === userId('w3'));
check('promoted.status === "confirmed"', promoted?.status === 'confirmed');

// List with filters
const allEvents = engine.list();
check('list() retorna todos', allEvents.length === 2);
const onlyRodas = engine.list({ kind: 'roda' });
check('list({ kind }) filtra', onlyRodas.length === 2);
const onlyOnline = engine.list({ modality: 'online' });
check('list({ modality }) filtra', onlyOnline.length === 2);
const onlyCandomble = engine.list({ tradition: 'candomble' });
check('list({ tradition }) filtra (0 hits)', onlyCandomble.length === 0);

// computeSignupStatus standalone
const cap = computeSignupStatus({
  capacity: 10,
  confirmedCount: 5,
  waitlistCount: 0,
  startsAt: new Date(NOW_MS + 86400_000).toISOString(),
  nowMs: NOW_MS,
});
check('computeSignupStatus → open', cap.status === 'open');
check('computeSignupStatus remainingSeats', cap.remainingSeats === 5);

const past = computeSignupStatus({
  capacity: 10,
  confirmedCount: 5,
  waitlistCount: 0,
  startsAt: new Date(NOW_MS - 86400_000).toISOString(),
  nowMs: NOW_MS,
});
check('computeSignupStatus → closed quando passado', past.status === 'closed');

// LGPD
const allRsvps = engine.listRsvps(wEv.id);
const rsvpBlob = JSON.stringify(allRsvps);
check('listRsvps() NÃO contém @', !rsvpBlob.includes('@'));
check('listRsvps() NÃO contém "email"', !rsvpBlob.toLowerCase().includes('email'));

// ============================================================================
// Section 2 — Workshops engine
// ============================================================================

console.log('\nSection 2: Workshops engine');

let wsIdSeq = 0;
const wsFakeId = () => `ws-${(++wsIdSeq).toString().padStart(4, '0')}-aaaa-bbbb-cccc-dddddddddddd`;

const wsEngine = new WorkshopsEngine({
  now: () => NOW_MS,
  idFactory: wsFakeId,
});

const t0 = NOW_MS + 14 * 86400_000;
const wsDraft = {
  id: workshopId(wsFakeId()),
  slug: 'curso-tantra-set-2026',
  title: 'Curso de Tantra — Módulo 1',
  description: 'Curso introdutório de tantra em 3 aulas.',
  tradition: 'tantra',
  host: makeHost({
    id: userId('host-shakti'),
    displayName: 'Maestra Shakti Devi',
    handle: 'maestra-shakti',
    traditionLine: 'Tântrica',
    bio: 'Facilitadora de tantra.',
  }),
  coverImage: '/event-covers/tantra.jpg',
  coverAlt: 'Curso de Tantra',
  capacity: 10,
  priceCents: 40000,
  language: 'pt-BR',
  sessions: [
    {
      title: 'Aula 1',
      startsAt: new Date(t0).toISOString(),
      endsAt: new Date(t0 + 120 * 60_000).toISOString(),
      capacityOverride: 5,
      order: 1,
    },
    {
      title: 'Aula 2',
      startsAt: new Date(t0 + 7 * 86400_000).toISOString(),
      endsAt: new Date(t0 + 7 * 86400_000 + 120 * 60_000).toISOString(),
      capacityOverride: 5,
      order: 2,
    },
    {
      title: 'Aula 3',
      startsAt: new Date(t0 + 14 * 86400_000).toISOString(),
      endsAt: new Date(t0 + 14 * 86400_000 + 120 * 60_000).toISOString(),
      capacityOverride: 5,
      order: 3,
    },
  ],
};

const ws = wsEngine.create(wsDraft);
check('workshop.create() gera 3 sessões', ws.sessions.length === 3);
check('sessões ordenadas por order', ws.sessions[0]?.order === 1 && ws.sessions[2]?.order === 3);

// Validation
threw = false;
try {
  wsEngine.create({ ...wsDraft, id: workshopId(wsFakeId()), sessions: [] });
} catch (e) {
  threw = e instanceof EventsError && e.code === 'NO_SESSIONS';
}
check('workshop rejeita sem sessões', threw);

// Attendance
const sess = ws.sessions[0];
const att = wsEngine.attend({ sessionId: sess.id, userId: userId('u1') });
check('attend() inscreve usuário', att.status === 'confirmed');
const attList = wsEngine.listAttendance(sess.id);
check('listAttendance() retorna u1', attList.length === 1 && attList[0] === userId('u1'));

// Capacity
for (let i = 2; i <= 5; i++) {
  wsEngine.attend({ sessionId: sess.id, userId: userId(`u${i}`) });
}
const sessCap = wsEngine.sessionCapacity(sess.id);
check('sessionCapacity.capacity = 5', sessCap.capacity === 5);
check('sessionCapacity.confirmedCount = 5', sessCap.confirmedCount === 5);

threw = false;
try {
  wsEngine.attend({ sessionId: sess.id, userId: userId('overflow') });
} catch (e) {
  threw = e instanceof EventsError && e.code === 'CAPACITY_FULL';
}
check('attend() rejeita lotado', threw);

// Waitlist + promotion
const wq = wsEngine.attend({
  sessionId: sess.id,
  userId: userId('wqueue'),
  allowWaitlist: true,
});
check('attend(allowWaitlist) adiciona à fila', wq.status === 'waitlist');

const removed = wsEngine.unattend({ sessionId: sess.id, userId: userId('u1') });
check('unattend() retorna true', removed === true);
const afterPromotion = wsEngine.listAttendance(sess.id);
check('unattend() promove da waitlist', afterPromotion.includes(userId('wqueue')));

// Progress
const prog = wsEngine.progress(ws.id);
check('progress() totalSessions = 3', prog.totalSessions === 3);
check('progress() pastSessions = 0', prog.pastSessions === 0);
check('progress() percent = 0', prog.percent === 0);

// Add session
const beforeAdd = wsEngine.get(ws.id).sessions.length;
wsEngine.addSession(ws.id, {
  title: 'Aula extra',
  startsAt: new Date(NOW_MS + 60 * 86400_000).toISOString(),
  endsAt: new Date(NOW_MS + 60 * 86400_000 + 90 * 60_000).toISOString(),
});
const afterAdd = wsEngine.get(ws.id).sessions.length;
check('addSession() adiciona', afterAdd === beforeAdd + 1);

// LGPD
const wsAtt = wsEngine.listWorkshopAttendance(ws.id);
const wsAttBlob = JSON.stringify(wsAtt);
check('listWorkshopAttendance() NÃO contém @', !wsAttBlob.includes('@'));

// ============================================================================
// Section 3 — iCal export
// ============================================================================

console.log('\nSection 3: iCal export');

const ics = eventToIcs(ev);
check('eventToIcs começa com BEGIN:VCALENDAR\\r\\nVERSION:2.0\\r\\nPRODID:', /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:/.test(ics));
check('eventToIcs termina com END:VCALENDAR\\r\\n', ics.endsWith('END:VCALENDAR\r\n'));
check('eventToIcs contém BEGIN:VEVENT', ics.includes('BEGIN:VEVENT\r\n'));
check('eventToIcs contém END:VEVENT', ics.includes('END:VEVENT\r\n'));
check('eventToIcs usa CRLF', ics.includes('\r\n'));
check('eventToIcs tem DTSTART UTC', /DTSTART:\d{8}T\d{6}Z/.test(ics));
check('eventToIcs tem DTEND UTC', /DTEND:\d{8}T\d{6}Z/.test(ics));
check('eventToIcs tem SUMMARY', /^SUMMARY:/m.test(ics));
check('eventToIcs tem UID event-{slug}@akasha.local', ics.includes(`UID:event-${ev.slug}@akasha.local`));
check('eventToIcs tem STATUS:CONFIRMED', ics.includes('STATUS:CONFIRMED\r\n'));
check('eventToIcs tem CATEGORIES', /^CATEGORIES:/m.test(ics));
check('isValidIcsShell(eventToIcs) === true', isValidIcsShell(ics));

const wsIcs = workshopToIcs(ws);
check('workshopToIcs produz ≥2 VEVENT', (wsIcs.match(/BEGIN:VEVENT\r\n/g) ?? []).length === ws.sessions.length);
check('workshopToIcs tem UID por sessão', wsIcs.includes(`UID:workshop-${ws.slug}-session-1@akasha.local`));
check('workshopToIcs tem DTSTART de cada sessão', wsIcs.includes('DTSTART:') && (wsIcs.match(/DTSTART:/g) ?? []).length === ws.sessions.length);
check('workshopToIcs tem shell válido', isValidIcsShell(wsIcs));

// formatUtc standalone
check('formatUtc("2026-08-15T19:00:00Z") === "20260815T190000Z"', formatUtc('2026-08-15T19:00:00Z') === '20260815T190000Z');

// escape
check('escapeIcsText escapa vírgula', escapeIcsText('a,b') === 'a\\,b');
check('escapeIcsText escapa ;', escapeIcsText('a;b') === 'a\\;b');
check('escapeIcsText escapa \\\\', escapeIcsText('a\\b') === 'a\\\\b');
check('escapeIcsText escapa newline', escapeIcsText('a\nb') === 'a\\nb');

// hasCrlf
check('hasCrlf detecta \\r\\n', hasCrlf('a\r\nb'));
check('hasCrlf rejeita só \\n', !hasCrlf('a\nb'));

// Sacred-cultural
const sacredBlob = JSON.stringify(ev);
check('event NÃO contém "ceremony" (mantém "cerimonia")', !sacredBlob.toLowerCase().includes('ceremony'));
check('event contém "roda"', sacredBlob.includes('roda'));
const wsBlob = JSON.stringify(ws);
check('workshop NÃO contém "ritual" genérico', !wsBlob.toLowerCase().includes('"ritual"'));
check('workshop contém tradição "tantra"', wsBlob.includes('tantra'));

// ============================================================================
// Section 4 — Notification hook (LGPD)
// ============================================================================

console.log('\nSection 4: Notification hook');

const lastNotif = notifs[notifs.length - 1];
check('EventsNotification emitido no cancel()', lastNotif.kind === 'rsvp-cancelled' || lastNotif.kind === 'waitlist-promoted');

const input = eventsNotificationToCreateInput(lastNotif);
check('eventsNotificationToCreateInput gera type=SYSTEM_ALERT', input.type === 'SYSTEM_ALERT');
check('input tem payload.preview', typeof input.payload?.preview === 'string');
check('input NÃO tem email', !JSON.stringify(input).includes('@example.com'));

assertNoPiiInNotification(lastNotif);
check('assertNoPiiInNotification aceita notif limpa', true);

// ============================================================================
// Result
// ============================================================================

console.log('');
console.log(`  RESULT: ${passes} PASS · ${fails} FAIL`);

if (fails > 0) {
  console.log('');
  console.log('  Failures:');
  for (const f of failures) console.log(`    · ${f}`);
  process.exit(1);
}

console.log(`\n  Smoke total: ${passes} asserts.`);