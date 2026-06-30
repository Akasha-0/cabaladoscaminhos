// ============================================================================
// MENTORSHIP AVAILABILITY — Spec (Wave 68, 2026-06-30)
// ============================================================================
// Self-running test harness. 25+ assertions.
// ============================================================================

import {
  Availability,
  clearAvailabilityStore,
  ConcreteSlot,
  DayOfWeek,
  deleteAvailability,
  findCommonSlots,
  getAvailableMentors,
  getAvailability,
  getTimezoneOffsetHours,
  InvalidMentorError,
  InvalidSlotError,
  isAvailability,
  isTimeSlot,
  listAllAvailability,
  localHourToUtcHour,
  materializeAvailability,
  materializeSlots,
  setAvailability,
  TimeSlot,
  validateSlot,
  validateSlots,
} from "../mentorship-availability.ts";

// ============================================================================
// TEST HARNESS
// ============================================================================

let _passed = 0;
let _failed = 0;
const _failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, msg: string): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    _passed += 1;
  } else {
    _failed += 1;
    _failures.push(
      `${msg}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    );
  }
}

function expectClose(actual: number, expected: number, tol: number, msg: string): void {
  if (Math.abs(actual - expected) <= tol) {
    _passed += 1;
  } else {
    _failed += 1;
    _failures.push(`${msg}\n  expected: ${expected} (±${tol})\n  actual:   ${actual}`);
  }
}

function expectThrows(fn: () => unknown, name: string, ctor: new (...args: never[]) => Error): void {
  try {
    fn();
    _failed += 1;
    _failures.push(`${name}: expected throw, did not`);
  } catch (e) {
    if (e instanceof ctor) _passed += 1;
    else {
      _failed += 1;
      _failures.push(`${name}: wrong error type: ${(e as Error).name}`);
    }
  }
}

function expectTrue(cond: boolean, msg: string): void {
  if (cond) _passed += 1;
  else {
    _failed += 1;
    _failures.push(`${msg}: expected true, got false`);
  }
}

// ============================================================================
// FIXTURES
// ============================================================================

const slotWeekday: TimeSlot = {
  dayOfWeek: 1, // Monday
  startHour: 18,
  endHour: 21,
  timezone: "America/Sao_Paulo",
};

const slotWeekend: TimeSlot = {
  dayOfWeek: 6, // Saturday
  startHour: 10,
  endHour: 12,
  timezone: "America/Sao_Paulo",
};

// ============================================================================
// SECTION 1 — Timezone offsets
// ============================================================================

function testTimezones(): void {
  // 1.1 — Brazil UTC-3
  expectEqual(getTimezoneOffsetHours("America/Sao_Paulo"), -3, "SP offset");
  // 1.2 — Lisbon UTC+0
  expectEqual(getTimezoneOffsetHours("Europe/Lisbon"), 0, "Lisbon offset");
  // 1.3 — Paris UTC+1
  expectEqual(getTimezoneOffsetHours("Europe/Paris"), 1, "Paris offset");
  // 1.4 — New York UTC-5
  expectEqual(getTimezoneOffsetHours("America/New_York"), -5, "NY offset");
  // 1.5 — Unknown timezone → 0
  expectEqual(getTimezoneOffsetHours("Mars/Olympus_Mons"), 0, "unknown tz → 0");
  // 1.6 — localHourToUtcHour (SP 18h local → 21h UTC in winter)
  // In Brazil (UTC-3), 18h local = 21h UTC
  const utcHour = localHourToUtcHour(18, new Date("2026-07-06T00:00:00Z"), "America/Sao_Paulo");
  expectEqual(utcHour, 21, "SP 18h local = 21h UTC");
}

// ============================================================================
// SECTION 2 — Slot validation
// ============================================================================

function testSlotValidation(): void {
  // 2.1 — Valid slot
  validateSlot(slotWeekday); // no throw
  expectTrue(true, "valid slot accepted");
  // 2.2 — End before start
  expectThrows(
    () =>
      validateSlot({
        dayOfWeek: 1,
        startHour: 18,
        endHour: 17,
        timezone: "UTC",
      }),
    "end before start",
    InvalidSlotError,
  );
  // 2.3 — End equals start
  expectThrows(
    () =>
      validateSlot({
        dayOfWeek: 1,
        startHour: 18,
        endHour: 18,
        timezone: "UTC",
      }),
    "end = start",
    InvalidSlotError,
  );
  // 2.4 — Invalid day (use `as any` to bypass the literal type check at compile time)
  expectThrows(
    () =>
      validateSlot({
        dayOfWeek: 7 as unknown as DayOfWeek,
        startHour: 18,
        endHour: 21,
        timezone: "UTC",
      }),
    "invalid day",
    InvalidSlotError,
  );
  // 2.5 — Invalid hour
  expectThrows(
    () =>
      validateSlot({
        dayOfWeek: 1,
        startHour: 24,
        endHour: 25,
        timezone: "UTC",
      }),
    "invalid hour",
    InvalidSlotError,
  );
  // 2.6 — Validate array
  validateSlots([slotWeekday, slotWeekend]); // no throw
  expectTrue(true, "valid slots array accepted");
  expectThrows(
    () =>
      validateSlots([
        slotWeekday,
        { ...slotWeekend, startHour: 12, endHour: 10 },
      ]),
    "invalid slot in array",
    InvalidSlotError,
  );
}

// ============================================================================
// SECTION 3 — Type guards
// ============================================================================

function testTypeGuards(): void {
  // 3.1 — Valid slot
  expectTrue(isTimeSlot(slotWeekday), "valid slot");
  // 3.2 — Invalid day (string)
  expectTrue(!isTimeSlot({ ...slotWeekday, dayOfWeek: "Monday" }), "string day");
  // 3.3 — Invalid hour (float)
  expectTrue(!isTimeSlot({ ...slotWeekday, startHour: 18.5 }), "float hour");
  // 3.4 — Missing timezone
  expectTrue(!isTimeSlot({ ...slotWeekday, timezone: "" }), "empty tz");
  // 3.5 — Valid availability
  const a: Availability = {
    mentorId: "m1",
    slots: [slotWeekday],
    updatedAt: new Date().toISOString(),
  };
  expectTrue(isAvailability(a), "valid availability");
  // 3.6 — Missing updatedAt
  expectTrue(!isAvailability({ ...a, updatedAt: undefined }), "missing updatedAt");
}

// ============================================================================
// SECTION 4 — Materialize slots
// ============================================================================

function testMaterialize(): void {
  // 4.1 — Monday slot within 1 week range
  const start = new Date("2026-07-06T00:00:00Z"); // Monday
  const end = new Date("2026-07-13T00:00:00Z"); // next Monday
  const slots = materializeSlots(slotWeekday, start, end);
  expectEqual(slots.length, 1, "1 monday slot");
  // 4.2 — Saturday slot within same range
  const satSlots = materializeSlots(slotWeekend, start, end);
  expectEqual(satSlots.length, 1, "1 saturday slot");
  // 4.3 — Materialize availability (2 slots)
  const a: Availability = {
    mentorId: "m1",
    slots: [slotWeekday, slotWeekend],
    updatedAt: new Date().toISOString(),
  };
  const all = materializeAvailability(a, start, end);
  expectEqual(all.length, 2, "2 slots materialized");
  // 4.4 — Empty range
  expectEqual(
    materializeSlots(slotWeekday, end, start).length,
    0,
    "empty range → 0",
  );
  // 4.5 — Duration is correct
  expectEqual(slots[0]!.durationMinutes, 180, "3 hours = 180 min");
}

// ============================================================================
// SECTION 5 — CRUD
// ============================================================================

function testCRUD(): void {
  clearAvailabilityStore();
  // 5.1 — Set and get
  const a = setAvailability("m1", [slotWeekday]);
  expectEqual(a.mentorId, "m1", "set returns correct mentorId");
  expectEqual(a.slots.length, 1, "set returns slots");
  const got = getAvailability("m1");
  expectEqual(got?.mentorId, "m1", "get returns set record");
  // 5.2 — Replace existing
  setAvailability("m1", [slotWeekend]);
  const got2 = getAvailability("m1");
  expectEqual(got2?.slots[0]!.dayOfWeek, 6, "replaced with weekend");
  // 5.3 — Delete
  const delResult = deleteAvailability("m1");
  expectTrue(delResult, "delete returns true");
  expectEqual(getAvailability("m1"), undefined, "deleted");
  // 5.4 — Delete missing
  expectTrue(!deleteAvailability("nope"), "delete missing returns false");
  // 5.5 — List all
  setAvailability("m1", [slotWeekday]);
  setAvailability("m2", [slotWeekend]);
  const list = listAllAvailability();
  expectEqual(list.length, 2, "list all → 2");
  // 5.6 — Empty mentorId throws
  expectThrows(
    () => setAvailability("", [slotWeekday]),
    "empty mentorId",
    InvalidMentorError,
  );
  // 5.7 — Invalid slot throws
  expectThrows(
    () =>
      setAvailability("m1", [
        { ...slotWeekday, startHour: 21, endHour: 18 },
      ]),
    "invalid slot in set",
    InvalidSlotError,
  );
}

// ============================================================================
// SECTION 6 — findCommonSlots
// ============================================================================

function testFindCommonSlots(): void {
  clearAvailabilityStore();
  const mentorId = "mentor-c1";
  const menteeId = "mentee-c1";
  const mondayEvening: TimeSlot = {
    dayOfWeek: 1, // Monday
    startHour: 18,
    endHour: 21,
    timezone: "America/Sao_Paulo",
  };
  const mentorAvail = setAvailability(mentorId, [mondayEvening]);
  const menteeAvail = setAvailability(menteeId, [mondayEvening]);
  const now = new Date("2026-07-05T00:00:00Z"); // Sunday (so Monday is 2026-07-06)
  // 6.1 — Common slot found
  const common = findCommonSlots(mentorId, menteeId, 60, 14, mentorAvail, menteeAvail, now);
  expectTrue(common.length > 0, "common slots found");
  // 6.2 — Each slot is exactly 60 minutes
  for (const slot of common) {
    expectEqual(slot.durationMinutes, 60, "60min chunks");
  }
  // 6.3 — Slots on Monday only (dayOfWeek=1)
  for (const slot of common) {
    expectEqual(slot.dayOfWeek, 1, "all on Monday");
  }
  // 6.4 — Non-overlapping availability
  const mentorAvail2: Availability = {
    mentorId,
    slots: [{ ...mondayEvening, dayOfWeek: 2 }], // Tuesday
    updatedAt: new Date().toISOString(),
  };
  setAvailability(mentorId, mentorAvail2.slots);
  const noCommon = findCommonSlots(mentorId, menteeId, 60, 14, mentorAvail2, menteeAvail, now);
  expectEqual(noCommon.length, 0, "no common → 0");
  // 6.5 — Missing availability throws
  expectThrows(
    () => findCommonSlots("missing-mentor", menteeId, 60, 14, undefined, menteeAvail, now),
    "missing mentor avail",
    InvalidMentorError,
  );
  // 6.6 — Invalid duration
  setAvailability(mentorId, [mondayEvening]);
  expectThrows(
    () => findCommonSlots(mentorId, menteeId, 0, 14, mentorAvail, menteeAvail, now),
    "duration 0",
    InvalidSlotError,
  );
  // 6.7 — Mismatched IDs throws
  expectThrows(
    () => findCommonSlots(mentorId, menteeId, 60, 14, mentorAvail, { ...menteeAvail, mentorId: "wrong" }, now),
    "mentee ID mismatch",
    InvalidMentorError,
  );
}

// ============================================================================
// SECTION 7 — getAvailableMentors
// ============================================================================

function testGetAvailableMentors(): void {
  clearAvailabilityStore();
  setAvailability("m1", [slotWeekday]);
  setAvailability("m2", [slotWeekday, slotWeekend]);
  setAvailability("m3", [slotWeekend]);
  // 7.1 — All mentors
  const all = getAvailableMentors();
  expectEqual(all.length, 3, "all 3 mentors");
  // 7.2 — Filter by day
  const mondayOnly = getAvailableMentors({ dayOfWeek: 1 });
  expectEqual(mondayOnly.length, 2, "monday only: 2");
  expectEqual(mondayOnly[0], "m2", "m2 has more slots");
  // 7.3 — Filter by min slots
  const min2 = getAvailableMentors({ minSlots: 2 });
  expectEqual(min2.length, 1, "min 2 slots: 1");
  expectEqual(min2[0], "m2", "m2 has 2 slots");
  // 7.4 — Filter by timezone
  const sp = getAvailableMentors({ timezone: "America/Sao_Paulo" });
  expectEqual(sp.length, 3, "SP tz: 3");
}

// ============================================================================
// RUNNER
// ============================================================================

export function runMentorshipAvailabilitySpec(): { passed: number; failed: number } {
  _passed = 0;
  _failed = 0;
  _failures.length = 0;
  testTimezones();
  testSlotValidation();
  testTypeGuards();
  testMaterialize();
  testCRUD();
  testFindCommonSlots();
  testGetAvailableMentors();
  return { passed: _passed, failed: _failed };
}

export function getMentorshipAvailabilityFailures(): readonly string[] {
  return _failures;
}

if (typeof require !== "undefined" && require.main === module) {
  clearAvailabilityStore();
  const result = runMentorshipAvailabilitySpec();
  console.log(`mentorship-availability: ${result.passed} passed, ${result.failed} failed`);
  for (const f of _failures) console.log(`  ✗ ${f}`);
  process.exit(result.failed === 0 ? 0 : 1);
}