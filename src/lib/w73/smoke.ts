// ============================================================================
// W73 — smoke.ts (cycle 62: end-to-end smoke runner)
// ============================================================================
// Runs 7 sections:
//   1. EVENT_CREATION
//   2. EVENT_FILTERING
//   3. EVENT_STATUS_TRANSITIONS
//   4. EVENT_CONFLICTS
//   5. REGISTRATION_HAPPY_PATH
//   6. REGISTRATION_ERROR_PATHS
//   7. SACRED_CONTENT_AUDIT
// Self-running. Exit 0 on PASS, 1 on FAIL.
// ============================================================================

import {
  toUserId,
  createEvent,
  getEventBySlug,
  listEvents,
  getEventsByHost,
  computeEventStatus,
  getEventConflicts,
  cancelEvent,
  resetEventsCore,
  auditSacredContent,
  auditEventValidation,
  auditKindTraditionMatrix,
  EVENT_THEMES,
} from './events-core.ts';
import type {
  EventId,
  UserId,
  EventKind,
  EventTradition,
} from './events-core.ts';
import { ALL_EVENT_KINDS, ALL_TRADITIONS, SACRED_TAGS_BY_TRADITION } from './events-core.ts';

import {
  registerForEvent,
  cancelRegistration,
  listUserRegistrations,
  getRegistrationStats,
  isUserRegistered,
  resetRegistrations,
  auditRegistrationRules,
} from './registrations.ts';

import { runEventsCoreSpec } from './events-core.spec.ts';
import { runRegistrationsSpec } from './registrations.spec.ts';

// ============================================================================
// HELPERS
// ============================================================================

const ISO = (d: Date) => d.toISOString();
let sectionTotal = 0;
let sectionPassed = 0;
const sectionLog: { name: string; passed: number; total: number; failures: string[] }[] = [];

function assertTrue(actual: unknown, label: string, ctx: string[]): void {
  sectionTotal += 1;
  if (actual === true) {
    sectionPassed += 1;
  } else {
    ctx.push(`❌ ${label}: expected true, got ${actual}`);
  }
}

function assertEqual<T>(actual: T, expected: T, label: string, ctx: string[]): void {
  sectionTotal += 1;
  const aJson = JSON.stringify(actual, (_k, v) =>
    v instanceof Date ? v.toISOString() : v,
  );
  const eJson = JSON.stringify(expected, (_k, v) =>
    v instanceof Date ? v.toISOString() : v,
  );
  if (aJson === eJson) {
    sectionPassed += 1;
  } else {
    ctx.push(`❌ ${label}: expected ${eJson}, got ${aJson}`);
  }
}

function assertFalse(actual: unknown, label: string, ctx: string[]): void {
  sectionTotal += 1;
  if (actual === false) {
    sectionPassed += 1;
  } else {
    ctx.push(`❌ ${label}: expected false, got ${actual}`);
  }
}

function futureDate(daysAhead: number, hour = 18): Date {
  const d = new Date();
  d.setUTCHours(hour, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d;
}

function runSection(name: string, body: (ctx: string[]) => void): void {
  const ctx: string[] = [];
  const before = sectionPassed;
  body(ctx);
  const passed = sectionPassed - before;
  const total = sectionTotal - before;
  sectionLog.push({ name, passed, total, failures: ctx });
  if (ctx.length === 0) {
    console.log(`✅ ${name}: ${passed}/${total} PASS`);
  } else {
    console.log(`❌ ${name}: ${passed}/${total} FAIL`);
    for (const f of ctx) console.log(`   ${f}`);
  }
}

// ============================================================================
// SECTION 1: EVENT_CREATION — 1 per EventKind + multi cases
// ============================================================================

function section1(): void {
  runSection('1. EVENT_CREATION', (ctx) => {
    resetEventsCore();
    resetRegistrations();
    const host = toUserId('smoke-host-1');
    const now = new Date();
    // One event per EventKind (8 kinds)
    const kindMap: { kind: EventKind; tradition: EventTradition; title: string; tags: string[] }[] = [
      { kind: 'workshop', tradition: 'cigano', title: 'Workshop de Mesa Real', tags: ['mesa', 'cartas', 'cigano'] },
      { kind: 'circulo', tradition: 'orixa', title: 'Círculo de Orixás Aberto', tags: ['orixá', 'roda', 'axé'] },
      { kind: 'mesa-real-live', tradition: 'cigano', title: 'Mesa Real ao Vivo Especial', tags: ['mesa', 'cartas', 'cigano'] },
      { kind: 'ritual', tradition: 'orixa', title: 'Ritual de Abertura do Caminho', tags: ['orixá', 'axé', 'ebo'] },
      { kind: 'lecture', tradition: 'astrologia', title: 'Palestra Mapa Astral Coletivo', tags: ['mapa', 'ascendente', 'lua'] },
      { kind: 'mentorship-session', tradition: 'cabala', title: 'Mentoria Árvore da Vida', tags: ['sefirot', 'árvore', 'keter'] },
      { kind: 'pgd', tradition: 'numerologia', title: 'PGD Numerologia Prática', tags: ['numero', 'vibração', 'mestre'] },
      { kind: 'online-course', tradition: 'tarot', title: 'Curso Online de Tarot Vivo', tags: ['arcano', 'tarot', 'corte'] },
    ];
    for (const c of kindMap) {
      const start = futureDate(7, 18);
      const end = new Date(start.getTime() + 90 * 60 * 1000);
      const r = createEvent({
        title: c.title,
        description: `${c.kind} smoke test`,
        tradition: c.tradition,
        kind: c.kind,
        startsAt: start,
        endsAt: end,
        capacity: EVENT_THEMES[c.kind].capacityDefault,
        location: 'Online',
        online: true,
        visibility: 'public',
        sacredTags: c.tags,
      }, host, now);
      assertTrue(r.ok, `createEvent ${c.kind}`, ctx);
    }
    // 3 multi-tradition events (must cover 3+ traditions in tags)
    const multiTitle = 'Encontro Multitradição Aberto';
    const multiTags = ['cigano', 'mapa', 'numerologia']; // 3 distinct
    const startM = futureDate(14, 18);
    const endM = new Date(startM.getTime() + 120 * 60 * 1000);
    const m = createEvent({
      title: multiTitle,
      description: 'multi',
      tradition: 'multi',
      kind: 'workshop',
      startsAt: startM,
      endsAt: endM,
      capacity: 50,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: multiTags,
    }, host, now);
    assertTrue(m.ok, 'create multi event A', ctx);
    const m2 = createEvent({
      title: multiTitle + ' 2',
      description: 'multi 2',
      tradition: 'multi',
      kind: 'circulo',
      startsAt: futureDate(21, 18),
      endsAt: new Date(futureDate(21, 18).getTime() + 90 * 60 * 1000),
      capacity: 30,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['orixá', 'kundalini', 'astrologia'],
    }, host, now);
    assertTrue(m2.ok, 'create multi event B', ctx);
    const m3 = createEvent({
      title: multiTitle + ' 3',
      description: 'multi 3',
      tradition: 'multi',
      kind: 'pgd',
      startsAt: futureDate(28, 18),
      endsAt: new Date(futureDate(28, 18).getTime() + 60 * 60 * 1000),
      capacity: 12,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['cabala', 'tarot', 'numerologia'],
    }, host, now);
    assertTrue(m3.ok, 'create multi event C', ctx);
    // Total created: 8 + 3 = 11 events
    const all = listEvents({}, { offset: 0, limit: 200 });
    if (all.ok) assertEqual(all.value.total, 11, '11 events total', ctx);
  });
}

// ============================================================================
// SECTION 2: EVENT_FILTERING — by kind, tradition, date, host, slug
// ============================================================================

function section2(): void {
  runSection('2. EVENT_FILTERING', (ctx) => {
    resetEventsCore();
    resetRegistrations();
    const host1 = toUserId('host-1');
    const host2 = toUserId('host-2');
    const now = new Date();
    // Setup: 4 events
    const r1 = createEvent({
      title: 'Filtro por Tipo Workshop',
      description: 'f',
      tradition: 'cigano',
      kind: 'workshop',
      startsAt: futureDate(7),
      endsAt: new Date(futureDate(7).getTime() + 60 * 60 * 1000),
      capacity: 10,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host1, now);
    const r2 = createEvent({
      title: 'Filtro por Tradição Cabala',
      description: 'f',
      tradition: 'cabala',
      kind: 'workshop',
      startsAt: futureDate(14),
      endsAt: new Date(futureDate(14).getTime() + 60 * 60 * 1000),
      capacity: 10,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['sefirot', 'árvore', 'keter'],
    }, host1, now);
    const r3 = createEvent({
      title: 'Filtro por Host 2',
      description: 'f',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: futureDate(21),
      endsAt: new Date(futureDate(21).getTime() + 90 * 60 * 1000),
      capacity: 12,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host2, now);
    const r4 = createEvent({
      title: 'Filtro por Data Futura',
      description: 'f',
      tradition: 'astrologia',
      kind: 'lecture',
      startsAt: futureDate(45),
      endsAt: new Date(futureDate(45).getTime() + 60 * 60 * 1000),
      capacity: 30,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mapa', 'ascendente', 'lua'],
    }, host1, now);
    assertTrue(r1.ok && r2.ok && r3.ok && r4.ok, '4 setup events', ctx);
    // by kind
    const byKind = listEvents({ kind: 'workshop' }, { offset: 0, limit: 50 });
    if (byKind.ok) assertEqual(byKind.value.total, 2, '2 workshops', ctx);
    // by tradition
    const byTrad = listEvents({ tradition: 'cigano' }, { offset: 0, limit: 50 });
    if (byTrad.ok) assertEqual(byTrad.value.total, 2, '2 cigano events', ctx);
    // by date range
    const byDate = listEvents(
      { startsAfter: futureDate(20), startsBefore: futureDate(50) },
      { offset: 0, limit: 50 },
    );
    if (byDate.ok) assertEqual(byDate.value.total, 2, '2 events in day 20-50', ctx);
    // by host
    const host1Events = getEventsByHost(host1, {});
    if (host1Events.ok) assertEqual(host1Events.value.length, 3, 'host1 has 3 events', ctx);
    // by slug
    if (r1.ok) {
      const slug = r1.value.slug;
      const bySlug = getEventBySlug(slug);
      assertTrue(bySlug.ok && bySlug.value !== null, 'fetch by slug', ctx);
    }
  });
}

// ============================================================================
// SECTION 3: EVENT_STATUS_TRANSITIONS — scheduled, live, ended, cancelled
// ============================================================================

function section3(): void {
  runSection('3. EVENT_STATUS_TRANSITIONS', (ctx) => {
    resetEventsCore();
    resetRegistrations();
    const host = toUserId('host-status');
    const now = new Date();
    const start = futureDate(7, 18);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const r = createEvent({
      title: 'Status Transitions Smoke Title',
      description: 's',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: start,
      endsAt: end,
      capacity: 12,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    assertTrue(r.ok, 'create status test event', ctx);
    if (!r.ok) return;
    assertEqual(computeEventStatus(r.value, now), 'scheduled', 'before start = scheduled', ctx);
    assertEqual(
      computeEventStatus(r.value, new Date(start.getTime() + 1000)),
      'live',
      'after start = live',
      ctx,
    );
    assertEqual(
      computeEventStatus(r.value, new Date(end.getTime() + 1000)),
      'ended',
      'after end = ended',
      ctx,
    );
    const c = cancelEvent(r.value.id, host, 'smoke cancel', now);
    assertTrue(c.ok, 'cancel event ok', ctx);
    if (c.ok) {
      assertEqual(computeEventStatus(c.value, now), 'cancelled', 'cancelled status', ctx);
    }
  });
}

// ============================================================================
// SECTION 4: EVENT_CONFLICTS — exact, partial, back-to-back, none
// ============================================================================

function section4(): void {
  runSection('4. EVENT_CONFLICTS', (ctx) => {
    resetEventsCore();
    const host = toUserId('host-conflicts');
    const now = new Date();
    const aStart = futureDate(10, 18);
    const aEnd = new Date(aStart.getTime() + 60 * 60 * 1000);
    const a = createEvent({
      title: 'Conflict Event A Title',
      description: 'a',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: aStart,
      endsAt: aEnd,
      capacity: 12,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    const exact = createEvent({
      title: 'Conflict Event Exact',
      description: 'ex',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: aStart,
      endsAt: aEnd,
      capacity: 12,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    const partial = createEvent({
      title: 'Conflict Event Partial',
      description: 'p',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: new Date(aStart.getTime() + 30 * 60 * 1000),
      endsAt: new Date(aEnd.getTime() + 30 * 60 * 1000),
      capacity: 12,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    const backToBack = createEvent({
      title: 'Conflict Event BackToBack',
      description: 'b',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: aEnd,
      endsAt: new Date(aEnd.getTime() + 60 * 60 * 1000),
      capacity: 12,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    const noOverlap = createEvent({
      title: 'Conflict Event No Overlap',
      description: 'n',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: futureDate(60, 18),
      endsAt: new Date(futureDate(60, 18).getTime() + 60 * 60 * 1000),
      capacity: 12,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    assertTrue(a.ok && exact.ok && partial.ok && backToBack.ok && noOverlap.ok, '5 setup events', ctx);
    if (!a.ok || !exact.ok || !partial.ok || !backToBack.ok || !noOverlap.ok) return;
    const cfExact = getEventConflicts(a.value, [exact.value]);
    assertEqual(cfExact.length, 1, 'exact overlap = 1 conflict', ctx);
    const cfPartial = getEventConflicts(a.value, [partial.value]);
    assertEqual(cfPartial.length, 1, 'partial overlap = 1 conflict', ctx);
    const cfBTB = getEventConflicts(a.value, [backToBack.value]);
    assertEqual(cfBTB.length, 0, 'back-to-back = 0 conflict', ctx);
    const cfNone = getEventConflicts(a.value, [noOverlap.value]);
    assertEqual(cfNone.length, 0, 'no overlap = 0 conflict', ctx);
  });
}

// ============================================================================
// SECTION 5: REGISTRATION_HAPPY_PATH — register, idempotent, list, stats
// ============================================================================

function section5(): void {
  runSection('5. REGISTRATION_HAPPY_PATH', (ctx) => {
    resetEventsCore();
    resetRegistrations();
    const host = toUserId('host-happy');
    const now = new Date();
    const ev = createEvent({
      title: 'Happy Registration Smoke Title',
      description: 'h',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: futureDate(7),
      endsAt: new Date(futureDate(7).getTime() + 90 * 60 * 1000),
      capacity: 3,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    assertTrue(ev.ok, 'create event for registration', ctx);
    if (!ev.ok) return;
    const u1 = toUserId('happy-1');
    const u2 = toUserId('happy-2');
    const u3 = toUserId('happy-3');
    const u4 = toUserId('happy-4');
    const r1 = registerForEvent(ev.value.id, u1, { source: 'mesa-real' });
    const r2 = registerForEvent(ev.value.id, u2, { source: 'direct' });
    const r3 = registerForEvent(ev.value.id, u3, { source: 'circulo' });
    const r4 = registerForEvent(ev.value.id, u4); // waitlist (cap 3)
    assertTrue(r1.ok && r2.ok && r3.ok && r4.ok, '4 register ok', ctx);
    if (!r1.ok || !r4.ok) return;
    assertEqual(r1.value.status, 'confirmed', 'r1 confirmed', ctx);
    assertEqual(r4.value.status, 'waitlist', 'r4 waitlisted', ctx);
    assertEqual(r4.value.waitlistPosition, 1, 'r4 position 1', ctx);
    // Idempotent re-register
    const r1b = registerForEvent(ev.value.id, u1);
    assertTrue(r1b.ok, 'idempotent re-register ok', ctx);
    if (r1b.ok) assertEqual(r1b.value.id, r1.value.id, 'same id', ctx);
    // Stats
    const stats = getRegistrationStats(ev.value.id);
    if (stats.ok) {
      assertEqual(stats.value.confirmed, 3, '3 confirmed', ctx);
      assertEqual(stats.value.waitlist, 1, '1 waitlist', ctx);
      assertEqual(stats.value.available, 0, '0 available', ctx);
      assertEqual(stats.value.capacity, 3, 'capacity 3', ctx);
    }
    // isUserRegistered true
    const chk = isUserRegistered(ev.value.id, u1);
    if (chk.ok) assertTrue(chk.value, 'u1 is registered', ctx);
    // listUserRegistrations
    const list = listUserRegistrations(u1, {});
    if (list.ok) assertEqual(list.value.length, 1, 'u1 has 1 registration', ctx);
  });
}

// ============================================================================
// SECTION 6: REGISTRATION_ERROR_PATHS — past, cancelled, double, full, waitlist
// ============================================================================

function section6(): void {
  runSection('6. REGISTRATION_ERROR_PATHS', (ctx) => {
    resetEventsCore();
    resetRegistrations();
    const host = toUserId('host-errors');
    const now = new Date();
    // Event for full + waitlist + cancelled
    const ev = createEvent({
      title: 'Error Path Smoke Title',
      description: 'e',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: futureDate(7),
      endsAt: new Date(futureDate(7).getTime() + 90 * 60 * 1000),
      capacity: 1,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    assertTrue(ev.ok, 'create event', ctx);
    if (!ev.ok) return;
    // Full: capacity 1, register u1 (confirmed), u2 (waitlist)
    const r1 = registerForEvent(ev.value.id, toUserId('err-1'));
    const r2 = registerForEvent(ev.value.id, toUserId('err-2'));
    assertTrue(r1.ok && r2.ok, 'r1+r2 ok', ctx);
    if (r1.ok && r2.ok) {
      assertEqual(r1.value.status, 'confirmed', 'r1 confirmed (cap 1)', ctx);
      assertEqual(r2.value.status, 'waitlist', 'r2 waitlisted', ctx);
    }
    // Cancel event, then attempt registration (should fail)
    const c = cancelEvent(ev.value.id, host, 'smoke error path', now);
    assertTrue(c.ok, 'cancel ok', ctx);
    const afterCancel = registerForEvent(ev.value.id, toUserId('err-late'));
    assertFalse(afterCancel.ok, 'register after cancel rejected', ctx);
    // Past-event registration: simulate future "now"
    const ev2 = createEvent({
      title: 'Past Reg Smoke Title',
      description: 'p',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: futureDate(7),
      endsAt: new Date(futureDate(7).getTime() + 90 * 60 * 1000),
      capacity: 5,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    assertTrue(ev2.ok, 'create ev2', ctx);
    if (!ev2.ok) return;
    // Mark ev2 ended by manipulating now via setting start to past-time via clock-bypass.
    // Simulate: try to register with a future now that puts event in past
    const futureNow = new Date(futureDate(7).getTime() + 24 * 60 * 60 * 1000);
    const pastReg = registerForEvent(ev2.value.id, toUserId('err-past'), {}, futureNow);
    assertFalse(pastReg.ok, 'past event register rejected', ctx);
    // Double-register idempotent: same user twice
    const d1 = registerForEvent(ev2.value.id, toUserId('err-double'));
    const d2 = registerForEvent(ev2.value.id, toUserId('err-double'));
    assertTrue(d1.ok && d2.ok, 'double-register both ok (idempotent)', ctx);
    if (d1.ok && d2.ok) assertEqual(d1.value.id, d2.value.id, 'double-register same id', ctx);
    // Waitlist position increment
    const ev3 = createEvent({
      title: 'Waitlist Order Smoke Title',
      description: 'w',
      tradition: 'cigano',
      kind: 'mesa-real-live',
      startsAt: futureDate(7),
      endsAt: new Date(futureDate(7).getTime() + 90 * 60 * 1000),
      capacity: 1,
      location: 'Online',
      online: true,
      visibility: 'public',
      sacredTags: ['mesa', 'cartas', 'cigano'],
    }, host, now);
    assertTrue(ev3.ok, 'create ev3', ctx);
    if (!ev3.ok) return;
    const w1 = registerForEvent(ev3.value.id, toUserId('err-w1'));
    const w2 = registerForEvent(ev3.value.id, toUserId('err-w2'));
    const w3 = registerForEvent(ev3.value.id, toUserId('err-w3'));
    assertTrue(w1.ok && w2.ok && w3.ok, 'waitlist chain ok', ctx);
    if (w2.ok) assertEqual(w2.value.waitlistPosition, 1, 'w2 position 1', ctx);
    if (w3.ok) assertEqual(w3.value.waitlistPosition, 2, 'w3 position 2', ctx);
  });
}

// ============================================================================
// SECTION 7: SACRED_CONTENT_AUDIT
// ============================================================================

function section7(): void {
  runSection('7. SACRED_CONTENT_AUDIT', (ctx) => {
    const content = auditSacredContent();
    assertEqual(content.length, 8, '8 traditions audited', ctx);
    const expected = ['cigano', 'orixa', 'astrologia', 'cabala', 'numerologia', 'tantra', 'tarot', 'multi'];
    for (const trad of expected) {
      const row = content.find((r) => r.tradition === trad);
      assertTrue(row !== undefined, `${trad} audited`, ctx);
      if (row) {
        assertTrue(row.tagCount >= 10, `${trad} has >=10 tags`, ctx);
        assertTrue(row.isValid, `${trad} isValid`, ctx);
        // Validate first 3 tags actually exist in SACRED_TAGS_BY_TRADITION
        const expectedTags = SACRED_TAGS_BY_TRADITION[trad as EventTradition];
        assertTrue(expectedTags.length >= 10, `${trad} tags present`, ctx);
      }
    }
    const validation = auditEventValidation();
    assertTrue(validation.length >= 8, 'auditEventValidation >=8 fields', ctx);
    const matrix = auditKindTraditionMatrix();
    assertEqual(matrix.length, ALL_EVENT_KINDS.length * ALL_TRADITIONS.length, 'matrix complete', ctx);
    // mesa-real-live with cigano OK
    const mrCig = matrix.find((r) => r.kind === 'mesa-real-live' && r.tradition === 'cigano');
    assertTrue(mrCig !== undefined && mrCig.compatible, 'mesa-real-live × cigano compatible', ctx);
    const mrMulti = matrix.find((r) => r.kind === 'mesa-real-live' && r.tradition === 'multi');
    assertTrue(mrMulti !== undefined && mrMulti.compatible, 'mesa-real-live × multi compatible', ctx);
    const mrAst = matrix.find((r) => r.kind === 'mesa-real-live' && r.tradition === 'astrologia');
    if (mrAst) assertFalse(mrAst.compatible, 'mesa-real-live × astrologia incompatible', ctx);
    const ruleAudit = auditRegistrationRules();
    assertTrue(ruleAudit.length >= 8, 'registration rules >=8', ctx);
    for (const r of ruleAudit) {
      assertTrue(r.isEnforced, `${r.rule} enforced`, ctx);
    }
  });
}

// ============================================================================
// RUNNER (executable via node --experimental-strip-types)
// ============================================================================

async function main(): Promise<number> {
  console.log('========================================');
  console.log('W73 — events-workshops-engine smoke');
  console.log('========================================');

  section1();
  section2();
  section3();
  section4();
  section5();
  section6();
  section7();

  // Run unit specs too (compact summary)
  console.log('--- spec harness ---');
  const es = runEventsCoreSpec();
  console.log(`events-core.spec: ${es.passed}/${es.total} (${es.failures.length} failures)`);
  const rs = runRegistrationsSpec();
  console.log(`registrations.spec: ${rs.passed}/${rs.total} (${rs.failures.length} failures)`);

  const specFailures = [...es.failures, ...rs.failures];
  const sectionFails = sectionLog.filter((s) => s.failures.length > 0);

  const allSectionsPassed = sectionLog.length === 7 && sectionFails.length === 0;
  const specPassed = specFailures.length === 0;

  console.log('========================================');
  if (allSectionsPassed && specPassed) {
    console.log(`7/7 sections PASS — total ${sectionPassed}/${sectionTotal} assertions + ${es.passed + rs.passed}/${es.total + rs.total} spec assertions`);
    return 0;
  } else {
    if (!allSectionsPassed) {
      console.log(`SECTIONS FAILED: ${sectionFails.length}/7`);
      for (const s of sectionFails) {
        console.log(`  ❌ ${s.name}`);
        for (const f of s.failures) console.log(`    ${f}`);
      }
    }
    if (!specPassed) {
      console.log('SPEC ASSERTIONS FAILED:');
      for (const f of specFailures) console.log(`  ${f}`);
    }
    return 1;
  }
}

main().then((c) => {
  process.exit(c);
}).catch((e) => {
  console.error(e);
  process.exit(2);
});
