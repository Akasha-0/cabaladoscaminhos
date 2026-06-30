// ============================================================================
// W73 — events-core.spec.ts (self-running harness, cycle 60+ pattern)
// ============================================================================
// 30+ assertions covering create, validation, list, status, conflicts.
// Uses expectEqual/expectTrue/expectThrows — no vitest, no jest.
// ============================================================================

import {
  toEventId,
  toUserId,
  createEvent,
  getEventBySlug,
  listEvents,
  getUpcomingEvents,
  getEventsByHost,
  computeEventStatus,
  getEventConflicts,
  updateEvent,
  cancelEvent,
  resetEventsCore,
  auditSacredContent,
  auditEventValidation,
  auditKindTraditionMatrix,
} from './events-core.ts';
import type {
  EventId,
  UserId,
  CreateEventInput,
  EventKind,
  EventTradition,
  Result,
} from './events-core.ts';
import { getEventById, ALL_EVENT_KINDS, ALL_TRADITIONS, SACRED_TAGS_BY_TRADITION, EVENT_THEMES } from './events-core.ts';

// ============================================================================
// HARNESS
// ============================================================================

let totalAssertions = 0;
let passedAssertions = 0;
const failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, label: string): void {
  totalAssertions += 1;
  const aJson = JSON.stringify(actual, (_k, v) => {
    if (v instanceof Date) return v.toISOString();
    return v;
  });
  const eJson = JSON.stringify(expected, (_k, v) => {
    if (v instanceof Date) return v.toISOString();
    return v;
  });
  if (aJson === eJson) {
    passedAssertions += 1;
  } else {
    failures.push(`FAIL ${label}: expected ${eJson} got ${aJson}`);
  }
}

function expectTrue(actual: unknown, label: string): void {
  totalAssertions += 1;
  if (actual === true) {
    passedAssertions += 1;
  } else {
    failures.push(`FAIL ${label}: expected true got ${actual}`);
  }
}

function expectFalse(actual: unknown, label: string): void {
  totalAssertions += 1;
  if (actual === false) {
    passedAssertions += 1;
  } else {
    failures.push(`FAIL ${label}: expected false got ${actual}`);
  }
}

function expectNull(actual: unknown, label: string): void {
  totalAssertions += 1;
  if (actual === null || actual === undefined) {
    passedAssertions += 1;
  } else {
    failures.push(`FAIL ${label}: expected null got ${actual}`);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function futureDate(daysAhead: number, hour = 12): Date {
  const d = new Date();
  d.setUTCHours(hour, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d;
}

function makeBaseInput(overrides: Partial<CreateEventInput> = {}): CreateEventInput {
  const startsAt = futureDate(7, 18); // 7 days from now at 18:00 UTC
  const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000); // +90 minutes
  return {
    title: 'Mesa Real ao Vivo — Edição Especial',
    description: 'Leitura coletiva aberta com o baralho cigano',
    tradition: 'cigano',
    kind: 'mesa-real-live',
    startsAt,
    endsAt,
    capacity: 12,
    location: 'Online (Zoom)',
    online: true,
    visibility: 'public',
    sacredTags: ['mesa', 'cartas', 'cigano'],
    ...overrides,
  };
}

// ============================================================================
// SECTION 1: CREATE EVENT — happy path
// ============================================================================

function testCreateHappyPath(): void {
  resetEventsCore();
  const host = toUserId('user-1');
  const result = createEvent(makeBaseInput(), host);
  expectTrue(result.ok, 'createEvent happy path returns ok');
  if (result.ok) {
    expectEqual(result.value.hostId, 'user-1', 'hostId matches');
    expectEqual(result.value.tradition, 'cigano', 'tradition matches');
    expectEqual(result.value.kind, 'mesa-real-live', 'kind matches');
    expectEqual(result.value.capacity, 12, 'capacity matches');
    expectEqual(result.value.registered, 0, 'registered starts at 0');
    expectEqual(result.value.waitlist, 0, 'waitlist starts at 0');
    expectEqual(result.value.cancelReason, null, 'cancelReason starts null');
    expectNull(result.value.cancelledAt, 'cancelledAt starts null');
    expectTrue(result.value.id.length > 0, 'event has id');
    expectTrue(result.value.slug.startsWith('mesa-real-ao-vivo'), 'slug generated');
  }
}

// ============================================================================
// SECTION 2: VALIDATION RULES
// ============================================================================

function testValidationRules(): void {
  resetEventsCore();
  const host = toUserId('user-1');
  const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const now = new Date();
  // title too short
  let r = createEvent(makeBaseInput({ title: 'abc' }), host, now);
  expectFalse(r.ok, 'title too short rejected');
  // title too long
  r = createEvent(makeBaseInput({ title: 'x'.repeat(201) }), host, now);
  expectFalse(r.ok, 'title too long rejected');
  // startsAt in past
  r = createEvent(makeBaseInput({ startsAt: past, endsAt: new Date(past.getTime() + 60_000) }), host, now);
  expectFalse(r.ok, 'startsAt in past rejected');
  // endsAt <= startsAt
  r = createEvent(
    makeBaseInput({ endsAt: new Date(futureDate(7).getTime() - 1000) }),
    host,
    now,
  );
  expectFalse(r.ok, 'endsAt <= startsAt rejected');
  // capacity < 1
  r = createEvent(makeBaseInput({ capacity: 0 }), host, now);
  expectFalse(r.ok, 'capacity 0 rejected');
  // capacity > 1000
  r = createEvent(makeBaseInput({ capacity: 1001 }), host, now);
  expectFalse(r.ok, 'capacity 1001 rejected');
  // invalid sacredTags for tradition
  r = createEvent(makeBaseInput({ tradition: 'cigano', sacredTags: ['cozinha'] }), host, now);
  expectFalse(r.ok, 'invalid sacred tag for cigano rejected');
  // kind+tradition incompatible
  r = createEvent(
    makeBaseInput({ kind: 'mesa-real-live', tradition: 'orixa' }),
    host,
    now,
  );
  expectFalse(r.ok, 'mesa-real-live with orixa rejected');
  // multi tradition must cover 3+ distinct traditions
  r = createEvent(
    makeBaseInput({
      title: 'Encontro Multitradição',
      tradition: 'multi',
      kind: 'workshop',
      sacredTags: ['cigano', 'mapa'],
    }),
    host,
    now,
  );
  expectFalse(r.ok, 'multi tradition with only 2 covered rejected');
}

// ============================================================================
// SECTION 3: LIST + FILTER
// ============================================================================

function testListAndFilter(): void {
  resetEventsCore();
  const host = toUserId('user-1');
  const now = new Date();
  // 4 events
  // Capture results so we can assert on creation success
  const createResults: Result<unknown, unknown>[] = [];
  const push = (r: Result<unknown, unknown>): void => { createResults.push(r); };
  push(createEvent(makeBaseInput({ title: 'Mesa Real A', tradition: 'cigano', kind: 'mesa-real-live' }), host, now));
  push(createEvent(makeBaseInput({
    title: 'Workshop Numerologia B', tradition: 'numerologia', kind: 'workshop',
    sacredTags: ['numerologia', 'numero', 'vibracao'],
  }), host, now));
  push(createEvent(makeBaseInput({
    title: 'Círculo Tantra C', tradition: 'tantra', kind: 'circulo',
    sacredTags: ['tantra', 'chacra', 'kundalini'],
  }), toUserId('user-2'), now));
  // Event D: starts at day 30, ends day 30 + 90min — must override both
  const dStart = futureDate(30, 18);
  push(createEvent(
    makeBaseInput({
      title: 'Leitura Astrologia D',
      tradition: 'astrologia',
      kind: 'lecture',
      startsAt: dStart,
      endsAt: new Date(dStart.getTime() + 90 * 60 * 1000),
      sacredTags: ['mapa', 'ascendente', 'lua'],
    }),
    host,
    now,
  ));
  // All 4 setups must succeed
  for (let i = 0; i < createResults.length; i += 1) {
    const r = createResults[i]!;
    if (!r.ok) {
      // r.error is well-typed here because of the !r.ok guard narrowing
      expectTrue(false, `setup event ${i} should succeed: ${JSON.stringify((r as { error: unknown }).error)}`);
    }
  }
  // by tradition
  const ciganoResult = listEvents({ tradition: 'cigano' }, { offset: 0, limit: 50 });
  expectTrue(ciganoResult.ok, 'listEvents by tradition ok');
  if (ciganoResult.ok) expectEqual(ciganoResult.value.total, 1, '1 cigano event');
  // by kind
  const workshopResult = listEvents({ kind: 'workshop' }, { offset: 0, limit: 50 });
  if (workshopResult.ok) expectEqual(workshopResult.value.total, 1, '1 workshop');
  // by host
  const hostResult = listEvents({ hostId: toUserId('user-1') }, { offset: 0, limit: 50 });
  if (hostResult.ok) {
    expectEqual(hostResult.value.total, 3, '3 events by host');
    expectEqual(hostResult.value.items.length, 3, '3 items returned');
  }
  // pagination
  const page = listEvents({}, { offset: 0, limit: 2 });
  if (page.ok) expectEqual(page.value.items.length, 2, 'pagination limits to 2');
  // date range
  const rangeResult = listEvents(
    { startsAfter: futureDate(15, 18) },
    { offset: 0, limit: 50 },
  );
  if (rangeResult.ok) expectEqual(rangeResult.value.total, 1, '1 event starts > day 15');
}

// ============================================================================
// SECTION 4: GET UPCOMING + SLUG
// ============================================================================

function testUpcomingAndSlug(): void {
  resetEventsCore();
  const host = toUserId('user-1');
  const now = new Date();
  createEvent(makeBaseInput({ title: 'Alpha Event Soon' }), host, now);
  createEvent(
    makeBaseInput({
      title: 'Beta Event Later',
      startsAt: futureDate(60, 18),
      endsAt: new Date(futureDate(60, 18).getTime() + 90 * 60 * 1000),
    }),
    host,
    now,
  );
  const upcoming = getUpcomingEvents('all', 10, now);
  if (upcoming.ok) {
    expectEqual(upcoming.value.length, 2, '2 upcoming events');
    if (upcoming.value.length >= 2) {
      const first = upcoming.value[0]!;
      const second = upcoming.value[1]!;
      expectTrue(
        first.startsAt.getTime() <= second.startsAt.getTime(),
        'upcoming sorted by startsAt asc',
      );
    }
  }
  // by slug
  const bySlug = getEventBySlug('alpha-event-soon');
  expectTrue(bySlug.ok, 'getEventBySlug ok');
  if (bySlug.ok) expectTrue(bySlug.value !== null, 'alpha slug found');
  const badSlug = getEventBySlug('not-real');
  if (badSlug.ok) expectNull(badSlug.value, 'bad slug returns null');
  const byId = getEventById(toEventId('evt-999999'));
  if (byId.ok) expectNull(byId.value, 'missing id returns null');
}

// ============================================================================
// SECTION 5: COMPUTE EVENT STATUS
// ============================================================================

function testStatusTransitions(): void {
  resetEventsCore();
  const host = toUserId('user-1');
  const now = new Date();
  const futureStart = futureDate(7, 18);
  const r = createEvent(makeBaseInput({ startsAt: futureStart }), host, now);
  if (!r.ok) {
    expectTrue(false, 'create future event for status test');
    return;
  }
  expectEqual(computeEventStatus(r.value, now), 'scheduled', 'future event = scheduled');
  expectEqual(
    computeEventStatus(r.value, new Date(futureStart.getTime() + 1000)),
    'live',
    'after start = live',
  );
  expectEqual(
    computeEventStatus(r.value, new Date(futureStart.getTime() + 91 * 60 * 1000)),
    'ended',
    'after end = ended',
  );
  // cancel
  const cancelRes = cancelEvent(r.value.id, host, 'host cancellation test', now);
  expectTrue(cancelRes.ok, 'cancelEvent ok');
  if (cancelRes.ok) {
    expectEqual(
      computeEventStatus(cancelRes.value, now),
      'cancelled',
      'cancelled event returns cancelled',
    );
  }
}

// ============================================================================
// SECTION 6: CONFLICTS
// ============================================================================

function testConflicts(): void {
  resetEventsCore();
  const host = toUserId('user-1');
  const now = new Date();
  const startA = futureDate(10, 18);
  const endA = new Date(startA.getTime() + 60 * 60 * 1000);
  const rA = createEvent(
    makeBaseInput({ title: 'Event A', startsAt: startA, endsAt: endA }),
    host,
    now,
  );
  const rB = createEvent(
    makeBaseInput({
      title: 'Event B',
      startsAt: new Date(startA.getTime() + 30 * 60 * 1000),
      endsAt: new Date(endA.getTime() + 30 * 60 * 1000),
      sacredTags: ['mapa', 'ascendente', 'lua'],
      tradition: 'astrologia',
      kind: 'workshop',
    }),
    host,
    now,
  );
  const rC = createEvent(
    makeBaseInput({
      title: 'Event C back-to-back',
      startsAt: endA,
      endsAt: new Date(endA.getTime() + 60 * 60 * 1000),
      sacredTags: ['numerologia', 'numero', 'vibracao'],
      tradition: 'numerologia',
      kind: 'workshop',
    }),
    host,
    now,
  );
  const rD = createEvent(
    makeBaseInput({
      title: 'Event D later',
      startsAt: futureDate(30, 18),
      endsAt: new Date(futureDate(30, 18).getTime() + 60 * 60 * 1000),
    }),
    host,
    now,
  );
  if (rA.ok && rB.ok && rC.ok && rD.ok) {
    const conflictsWithA = getEventConflicts(rA.value, [rB.value, rC.value, rD.value]);
    expectEqual(conflictsWithA.length, 1, 'A partial-overlap B only');
    if (conflictsWithA.length === 1) {
      expectEqual(conflictsWithA[0]!.id, rB.value.id, 'conflict is B');
    }
    // Back-to-back with A only (rC starts at endA — should not conflict with A)
    const onlyRABC = getEventConflicts(rC.value, [rA.value]);
    expectEqual(onlyRABC.length, 0, 'back-to-back with A: no overlap');
    const exactMatch = createEvent(
      makeBaseInput({
        title: 'Event A exact',
        startsAt: startA,
        endsAt: endA,
      }),
      host,
      now,
    );
    if (exactMatch.ok) {
      const exConflicts = getEventConflicts(rA.value, [exactMatch.value]);
      expectEqual(exConflicts.length, 1, 'exact match overlaps');
    }
  }
}

// ============================================================================
// SECTION 7: UPDATE EVENT
// ============================================================================

function testUpdateEvent(): void {
  resetEventsCore();
  const host = toUserId('user-1');
  const now = new Date();
  const r = createEvent(makeBaseInput(), host, now);
  if (!r.ok) {
    expectTrue(false, 'create for update test');
    return;
  }
  // host updates
  const patchResult = updateEvent(r.value.id, { title: 'Updated Title Long Enough' }, host);
  expectTrue(patchResult.ok, 'host update ok');
  if (patchResult.ok) {
    expectEqual(patchResult.value.title, 'Updated Title Long Enough', 'title updated');
    expectTrue(patchResult.value.updatedAt.getTime() >= r.value.updatedAt.getTime(), 'updatedAt advanced');
  }
  // non-host actor rejected
  const otherRes = updateEvent(r.value.id, { title: 'Hacked Title Long Enough' }, toUserId('intruder'));
  expectFalse(otherRes.ok, 'non-host cannot update');
  // cancel, then update rejected
  const cancel = cancelEvent(r.value.id, host, 'testing cancel', now);
  if (cancel.ok) {
    const afterCancel = updateEvent(cancel.value.id, { capacity: 50 }, host);
    expectFalse(afterCancel.ok, 'cannot update cancelled event');
  }
  // capacity shrink below registered rejected
  const r2 = createEvent(makeBaseInput({ capacity: 5, title: 'Cap Test Event Title' }), host, now);
  if (r2.ok) {
    const shrink = updateEvent(r2.value.id, { capacity: 0 }, host);
    expectFalse(shrink.ok, 'capacity 0 rejected');
  }
}

// ============================================================================
// SECTION 8: SACRED CONTENT AUDIT
// ============================================================================

function testSacredAudit(): void {
  const content = auditSacredContent();
  expectEqual(content.length, 8, '8 traditions covered');
  for (const row of content) {
    expectTrue(row.tagCount >= 10, `${row.tradition} has >=10 tags`);
    expectTrue(row.isValid, `${row.tradition} is valid`);
  }
  const validation = auditEventValidation();
  expectTrue(validation.length >= 8, 'validation fields audited');
  const matrix = auditKindTraditionMatrix();
  expectEqual(matrix.length, 8 * 8, 'matrix 8x8');
  // mesa-real-live must require cigano or multi (and not orixa)
  const mesaOrixa = matrix.find(
    (r) => r.kind === 'mesa-real-live' && r.tradition === 'orixa',
  );
  expectTrue(mesaOrixa !== undefined, 'mesa-real-live × orixa row exists');
  if (mesaOrixa) expectFalse(mesaOrixa.compatible, 'mesa-real-live × orixa incompatible');
  const mesaCigano = matrix.find(
    (r) => r.kind === 'mesa-real-live' && r.tradition === 'cigano',
  );
  if (mesaCigano) expectTrue(mesaCigano.compatible, 'mesa-real-live × cigano compatible');
}

// ============================================================================
// SECTION 9: BRANDED TYPE COERCION
// ============================================================================

function testBrandedTypes(): void {
  const id = toEventId('evt-test-1234');
  expectEqual((id as string), 'evt-test-1234', 'branded event id unwraps');
  const uid = toUserId('user-test-5678');
  expectEqual((uid as string), 'user-test-5678', 'branded user id unwraps');
}

// ============================================================================
// SECTION 10: KIND × TRADITION COVERAGE
// ============================================================================

function testKindTraditionCoverage(): void {
  // Every EventKind has a theme
  for (const k of ALL_EVENT_KINDS) {
    expectTrue(EVENT_THEMES[k] !== undefined, `${k} has theme`);
  }
  // Every tradition has tags
  for (const t of ALL_TRADITIONS) {
    expectTrue(SACRED_TAGS_BY_TRADITION[t].length > 0, `${t} has tags`);
  }
  // Every theme references at least one sacred symbol
  for (const k of ALL_EVENT_KINDS) {
    expectTrue(EVENT_THEMES[k].sacredSymbols.length >= 1, `${k} has sacred symbols`);
  }
}

// ============================================================================
// RUNNER
// ============================================================================

export function runEventsCoreSpec(): { passed: number; total: number; failures: string[] } {
  testCreateHappyPath();
  testValidationRules();
  testListAndFilter();
  testUpcomingAndSlug();
  testStatusTransitions();
  testConflicts();
  testUpdateEvent();
  testSacredAudit();
  testBrandedTypes();
  testKindTraditionCoverage();
  return { passed: passedAssertions, total: totalAssertions, failures };
}
