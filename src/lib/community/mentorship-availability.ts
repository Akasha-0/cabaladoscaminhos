// ============================================================================
// MENTORSHIP AVAILABILITY — Recurring weekly slots (Wave 68, 2026-06-30)
// ============================================================================
// Pure-logic availability engine (no DB, no React) — gerenciar slots
// recorrentes semanais de mentores e encontrar interseções com mentees.
//
// Design decisions:
//   - Slots are RECURRING WEEKLY (dayOfWeek 0-6, hours, timezone)
//   - findCommonSlots expands to a date range and intersects
//   - All time math in UTC (callers convert via timezone field)
//   - In-memory store keyed by mentorId (caller persists externally)
// ============================================================================

// ============================================================================
// TYPES — Public availability types
// ============================================================================

/** Day of week, 0=Sunday, 6=Saturday (matches JavaScript Date.getDay()). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** A recurring weekly availability slot. Times are in `timezone` local hours. */
export interface TimeSlot {
  readonly dayOfWeek: DayOfWeek;
  /** Start hour, 0-23, in `timezone`. */
  readonly startHour: number;
  /** End hour, 0-23, in `timezone`. Must be > startHour. */
  readonly endHour: number;
  /** IANA timezone (e.g., "America/Sao_Paulo"). */
  readonly timezone: string;
}

/** A mentor's full availability record. */
export interface Availability {
  readonly mentorId: string;
  readonly slots: readonly TimeSlot[];
  readonly updatedAt: string; // ISO datetime
}

/** A materialized concrete time slot (after expanding recurring → specific date). */
export interface ConcreteSlot {
  readonly start: string; // ISO datetime in UTC
  readonly end: string; // ISO datetime in UTC
  readonly durationMinutes: number;
  /** Original dayOfWeek (for grouping/explanation). */
  readonly dayOfWeek: DayOfWeek;
}

/** Criteria for getAvailableMentors. */
export interface AvailabilityCriteria {
  readonly dayOfWeek?: DayOfWeek;
  readonly hourMin?: number;
  readonly hourMax?: number;
  readonly timezone?: string;
  readonly minSlots?: number;
}

// ============================================================================
// CONSTANTS — Defaults
// ============================================================================

/** Default meeting duration in minutes. */
export const DEFAULT_MEETING_MINUTES = 60;

/** Default look-ahead window in days. */
export const DEFAULT_LOOKAHEAD_DAYS = 14;

/** Hours per day. */
const HOURS_PER_DAY = 24;

/** Minutes per hour. */
const MINUTES_PER_HOUR = 60;

/** IANA timezone → fixed offset (hours) — small built-in table.
 *  Covers Brazil + US + Europe + Cabo Verde. Production callers should use
 *  Intl.DateTimeFormat for arbitrary timezones, but this engine avoids
 *  Intl quirks by accepting a "reference week" via `now` parameter. */
const TIMEZONE_OFFSETS: Readonly<Record<string, number>> = Object.freeze({
  "America/Sao_Paulo": -3,
  "America/Rio_Branco": -5,
  "America/Manaus": -4,
  "America/Belem": -3,
  "America/Recife": -3,
  "America/New_York": -5,
  "America/Chicago": -6,
  "America/Denver": -7,
  "America/Los_Angeles": -8,
  "Europe/Lisbon": 0,
  "Europe/London": 0,
  "Europe/Paris": 1,
  "Europe/Berlin": 1,
  "Atlantic/Cape_Verde": -1,
  UTC: 0,
});

// ============================================================================
// ERRORS — Typed error classes
// ============================================================================

export class InvalidSlotError extends Error {
  constructor(reason: string) {
    super(`Invalid time slot: ${reason}`);
    this.name = "InvalidSlotError";
  }
}

export class InvalidMentorError extends Error {
  constructor(reason: string) {
    super(`Invalid mentor: ${reason}`);
    this.name = "InvalidMentorError";
  }
}

// ============================================================================
// TYPE GUARDS — Defensive validation
// ============================================================================

export function isTimeSlot(value: unknown): value is TimeSlot {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.dayOfWeek !== "number") return false;
  if (v.dayOfWeek < 0 || v.dayOfWeek > 6 || !Number.isInteger(v.dayOfWeek))
    return false;
  if (typeof v.startHour !== "number") return false;
  if (v.startHour < 0 || v.startHour > 23 || !Number.isInteger(v.startHour))
    return false;
  if (typeof v.endHour !== "number") return false;
  if (v.endHour < 0 || v.endHour > 23 || !Number.isInteger(v.endHour))
    return false;
  if (typeof v.timezone !== "string" || v.timezone.length === 0) return false;
  return true;
}

export function isAvailability(value: unknown): value is Availability {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.mentorId !== "string" || v.mentorId.length === 0) return false;
  if (!Array.isArray(v.slots)) return false;
  if (typeof v.updatedAt !== "string") return false;
  return v.slots.every((s) => isTimeSlot(s));
}

// ============================================================================
// SLOT VALIDATION — Hard rules
// ============================================================================

/** Validate a TimeSlot. Throws InvalidSlotError if not. */
export function validateSlot(slot: TimeSlot): void {
  if (!isTimeSlot(slot)) {
    throw new InvalidSlotError("not a valid TimeSlot shape");
  }
  if (slot.endHour <= slot.startHour) {
    throw new InvalidSlotError(
      `endHour (${slot.endHour}) must be > startHour (${slot.startHour})`,
    );
  }
  if (slot.endHour - slot.startHour < 1) {
    throw new InvalidSlotError("slot must be at least 1 hour long");
  }
}

/** Validate an array of slots (all must be valid). */
export function validateSlots(slots: readonly TimeSlot[]): void {
  for (const slot of slots) validateSlot(slot);
}

// ============================================================================
// TIMEZONE UTILS — Local hour → UTC hour
// ============================================================================

/**
 * Get the UTC offset for a timezone (hours).
 * Uses built-in table. Returns 0 for unknown timezones (safe fallback).
 */
export function getTimezoneOffsetHours(timezone: string): number {
  return TIMEZONE_OFFSETS[timezone] ?? 0;
}

/**
 * Convert a local-time hour on a specific date to UTC.
 * Does NOT handle DST (intentional — keeps engine deterministic).
 */
export function localHourToUtcHour(
  localHour: number,
  date: Date,
  timezone: string,
): number {
  const offset = getTimezoneOffsetHours(timezone);
  let utcHour = localHour - offset;
  if (utcHour < 0) utcHour += HOURS_PER_DAY;
  if (utcHour >= HOURS_PER_DAY) utcHour -= HOURS_PER_DAY;
  return utcHour;
}

// ============================================================================
// MATERIALIZATION — Recurring slots → concrete dates
// ============================================================================

/**
 * Expand a recurring TimeSlot into concrete dates within a range.
 * - startDate: beginning of range (UTC)
 * - endDate: end of range (UTC)
 * - Returns ISO datetime pairs in UTC.
 */
export function materializeSlots(
  slot: TimeSlot,
  startDate: Date,
  endDate: Date,
): ConcreteSlot[] {
  validateSlot(slot);
  if (endDate <= startDate) return [];

  const result: ConcreteSlot[] = [];
  const offsetHours = getTimezoneOffsetHours(slot.timezone);
  const startUtcMs = startDate.getTime();
  const endUtcMs = endDate.getTime();

  // Iterate day by day from startDate
  const cursor = new Date(startDate);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor.getTime() < endUtcMs) {
    const utcDay = cursor.getUTCDay();
    if (utcDay === slot.dayOfWeek) {
      // This day matches — create the concrete slot
      // Convert local hours to UTC by subtracting offset
      const startUtc = new Date(cursor);
      startUtc.setUTCHours(slot.startHour - offsetHours, 0, 0, 0);
      const endUtc = new Date(cursor);
      endUtc.setUTCHours(slot.endHour - offsetHours, 0, 0, 0);

      // Clamp to range
      if (startUtc.getTime() >= startUtcMs && endUtc.getTime() <= endUtcMs) {
        const durationMinutes =
          (endUtc.getTime() - startUtc.getTime()) / 60_000;
        result.push({
          start: startUtc.toISOString(),
          end: endUtc.toISOString(),
          durationMinutes,
          dayOfWeek: slot.dayOfWeek,
        });
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}

/**
 * Materialize all slots for an availability within a date range.
 */
export function materializeAvailability(
  availability: Availability,
  startDate: Date,
  endDate: Date,
): ConcreteSlot[] {
  validateSlots(availability.slots);
  const all: ConcreteSlot[] = [];
  for (const slot of availability.slots) {
    all.push(...materializeSlots(slot, startDate, endDate));
  }
  return all.sort((a, b) => a.start.localeCompare(b.start));
}

// ============================================================================
// SLOT INTERSECTION — Find overlapping windows
// ============================================================================

/**
 * Find concrete time slots when BOTH mentor and mentee are available.
 * - Expands both sets of recurring slots to concrete dates within range
 * - Splits each into durationMinutes chunks
 * - Returns intersection (slots where both are free)
 */
export function findCommonSlots(
  mentorId: string,
  menteeId: string,
  durationMinutes: number = DEFAULT_MEETING_MINUTES,
  daysAhead: number = DEFAULT_LOOKAHEAD_DAYS,
  mentorAvailability?: Availability,
  menteeAvailability?: Availability,
  now: Date = new Date(),
): ConcreteSlot[] {
  if (!mentorId || typeof mentorId !== "string") {
    throw new InvalidMentorError("mentorId is required");
  }
  if (!menteeId || typeof menteeId !== "string") {
    throw new InvalidMentorError("menteeId is required");
  }
  if (durationMinutes <= 0 || durationMinutes > HOURS_PER_DAY * MINUTES_PER_HOUR) {
    throw new InvalidSlotError("durationMinutes must be in (0, 1440]");
  }
  if (daysAhead <= 0 || daysAhead > 365) {
    throw new InvalidSlotError("daysAhead must be in (0, 365]");
  }
  if (!mentorAvailability) {
    throw new InvalidMentorError(`mentor ${mentorId} has no availability set`);
  }
  if (!menteeAvailability) {
    throw new InvalidMentorError(`mentee ${menteeId} has no availability set`);
  }
  if (mentorAvailability.mentorId !== mentorId) {
    throw new InvalidMentorError(
      `mentorAvailability.mentorId (${mentorAvailability.mentorId}) does not match mentorId (${mentorId})`,
    );
  }
  if (menteeAvailability.mentorId !== menteeId) {
    throw new InvalidMentorError(
      `menteeAvailability.mentorId (${menteeAvailability.mentorId}) does not match menteeId (${menteeId})`,
    );
  }

  const startDate = new Date(now);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + daysAhead);

  const mentorSlots = expandToChunks(
    materializeAvailability(mentorAvailability, startDate, endDate),
    durationMinutes,
  );
  const menteeSlots = expandToChunks(
    materializeAvailability(menteeAvailability, startDate, endDate),
    durationMinutes,
  );

  const menteeSet = new Set(menteeSlots.map((s) => s.start));
  return mentorSlots.filter((s) => menteeSet.has(s.start));
}

/**
 * Split concrete slots into chunks of `durationMinutes`.
 * E.g., a 3-hour slot (18:00-21:00) with 60min chunks → 18:00-19:00, 19:00-20:00, 20:00-21:00.
 */
function expandToChunks(
  slots: readonly ConcreteSlot[],
  durationMinutes: number,
): ConcreteSlot[] {
  const chunks: ConcreteSlot[] = [];
  for (const slot of slots) {
    const startMs = new Date(slot.start).getTime();
    const endMs = new Date(slot.end).getTime();
    const totalMinutes = (endMs - startMs) / 60_000;
    const numChunks = Math.floor(totalMinutes / durationMinutes);
    for (let i = 0; i < numChunks; i += 1) {
      const chunkStart = new Date(startMs + i * durationMinutes * 60_000);
      const chunkEnd = new Date(chunkStart.getTime() + durationMinutes * 60_000);
      chunks.push({
        start: chunkStart.toISOString(),
        end: chunkEnd.toISOString(),
        durationMinutes,
        dayOfWeek: slot.dayOfWeek,
      });
    }
  }
  return chunks;
}

// ============================================================================
// POINT-IN-TIME CHECK — Is mentor free at this moment?
// ============================================================================

/**
 * Check if a mentor is available at a specific datetime.
 * Returns the matching slot if found, undefined otherwise.
 */
export function isAvailableAt(
  mentorId: string,
  datetime: Date,
  availability: Availability,
): TimeSlot | undefined {
  if (availability.mentorId !== mentorId) return undefined;

  const dayOfWeek = datetime.getUTCDay() as DayOfWeek;
  const hour = datetime.getUTCHours();

  return availability.slots.find((slot) => {
    if (slot.dayOfWeek !== dayOfWeek) return false;
    const offset = getTimezoneOffsetHours(slot.timezone);
    // Convert UTC hour to local hour
    const localHour = hour - offset;
    const normalizedHour =
      localHour < 0 ? localHour + HOURS_PER_DAY : localHour >= HOURS_PER_DAY ? localHour - HOURS_PER_DAY : localHour;
    return normalizedHour >= slot.startHour && normalizedHour < slot.endHour;
  });
}

// ============================================================================
// CRUD — Set / Get availability (in-memory store)
// ============================================================================

/** Internal in-memory store keyed by mentorId. */
const AVAILABILITY_STORE = new Map<string, Availability>();

/**
 * Set a mentor's availability (replaces existing).
 * Returns the new Availability record.
 */
export function setAvailability(
  mentorId: string,
  slots: readonly TimeSlot[],
  now: Date = new Date(),
): Availability {
  if (!mentorId || typeof mentorId !== "string") {
    throw new InvalidMentorError("mentorId is required");
  }
  validateSlots(slots);
  const availability: Availability = {
    mentorId,
    slots,
    updatedAt: now.toISOString(),
  };
  AVAILABILITY_STORE.set(mentorId, availability);
  return availability;
}

/**
 * Get a mentor's availability. Returns undefined if not set.
 */
export function getAvailability(mentorId: string): Availability | undefined {
  return AVAILABILITY_STORE.get(mentorId);
}

/**
 * Delete a mentor's availability. Returns true if removed, false if not found.
 */
export function deleteAvailability(mentorId: string): boolean {
  return AVAILABILITY_STORE.delete(mentorId);
}

/**
 * Clear all stored availability. Test helper.
 */
export function clearAvailabilityStore(): void {
  AVAILABILITY_STORE.clear();
}

/**
 * Get all stored availability records.
 */
export function listAllAvailability(): Availability[] {
  return Array.from(AVAILABILITY_STORE.values());
}

// ============================================================================
// GET AVAILABLE MENTORS — Filter by criteria
// ============================================================================

/**
 * Get all mentors matching the availability criteria.
 * Returns list of mentor IDs sorted by slot count (descending).
 */
export function getAvailableMentors(
  criteria: AvailabilityCriteria = {},
): string[] {
  const all = listAllAvailability();
  const result: { mentorId: string; matchingSlots: number }[] = [];

  for (const avail of all) {
    let matchingSlots = 0;
    for (const slot of avail.slots) {
      if (criteria.dayOfWeek !== undefined && slot.dayOfWeek !== criteria.dayOfWeek)
        continue;
      if (criteria.hourMin !== undefined && slot.startHour < criteria.hourMin)
        continue;
      if (criteria.hourMax !== undefined && slot.endHour > criteria.hourMax)
        continue;
      if (criteria.timezone !== undefined && slot.timezone !== criteria.timezone)
        continue;
      matchingSlots += 1;
    }
    if (criteria.minSlots !== undefined && matchingSlots < criteria.minSlots)
      continue;
    result.push({ mentorId: avail.mentorId, matchingSlots });
  }

  return result
    .sort((a, b) => b.matchingSlots - a.matchingSlots || a.mentorId.localeCompare(b.mentorId))
    .map((r) => r.mentorId);
}

// ============================================================================
// INTERNAL EXPORTS — For testing / advanced callers
// ============================================================================

export const __internal = {
  AVAILABILITY_STORE,
  TIMEZONE_OFFSETS,
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  expandToChunks,
};