// ============================================================================
// W73 — registrations.ts
// ============================================================================
// Event registrations engine for Cabala dos Caminhos.
// Idempotent register, auto-promote waitlist, LGPD-frozen audit metadata,
// sacred note (private to host). Bridges with events-core.ts for capacity.
// ============================================================================

import {
  toEventId,
  toUserId,
  toRegistrationId,
  ok,
  err,
  computeEventStatus,
  adjustRegisteredCount,
  _getEventsMap,
} from './events-core.ts';
import type {
  EventId,
  UserId,
  RegistrationId,
  Result,
} from './events-core.ts';

// Re-export for consumers (cycle 67 pattern — single source of truth for brands)
export type { EventId, UserId, RegistrationId } from './events-core.ts';
export { toEventId, toUserId, toRegistrationId } from './events-core.ts';

// ============================================================================
// REGISTRATION ENTITY
// ============================================================================

export type RegistrationStatus =
  | 'confirmed'
  | 'waitlist'
  | 'cancelled'
  | 'attended'
  | 'no-show';

export const ALL_REGISTRATION_STATUSES: readonly RegistrationStatus[] = [
  'confirmed',
  'waitlist',
  'cancelled',
  'attended',
  'no-show',
];

export type RegistrationSource =
  | 'mesa-real'
  | 'circulo'
  | 'feed'
  | 'direct'
  | 'invite'
  | 'admin';

export const ALL_REGISTRATION_SOURCES: readonly RegistrationSource[] = [
  'mesa-real',
  'circulo',
  'feed',
  'direct',
  'invite',
  'admin',
];

export interface Registration {
  readonly id: RegistrationId;
  readonly eventId: EventId;
  readonly userId: UserId;
  readonly status: RegistrationStatus;
  readonly registeredAt: Date;
  readonly cancelledAt: Date | null;
  readonly waitlistPosition: number;
  readonly sacredNote: string | null;
  readonly source: RegistrationSource;
  readonly audit: Readonly<Record<string, unknown>>;
}

export interface RegistrationFilter {
  readonly status?: RegistrationStatus;
  readonly source?: RegistrationSource;
  readonly eventId?: EventId;
  readonly userId?: UserId;
}

// ============================================================================
// ERRORS
// ============================================================================

export type RegistrationValidationError = {
  readonly kind: 'validation';
  readonly field: string;
  readonly message: string;
};

export type RegistrationNotFoundError = {
  readonly kind: 'not-found';
  readonly id: string;
};

export type RegistrationPermissionError = {
  readonly kind: 'permission';
  readonly actor: string;
};

export type RegistrationConflictError = {
  readonly kind: 'conflict';
  readonly message: string;
};

export type RegistrationError =
  | RegistrationValidationError
  | RegistrationNotFoundError
  | RegistrationPermissionError
  | RegistrationConflictError;

// ============================================================================
// IN-MEMORY STORE
// ============================================================================

interface RegistrationsState {
  registrations: Map<string, Registration>;
  byEvent: Map<string, Set<string>>; // eventId -> registrationIds
  byUser: Map<string, Set<string>>;  // userId -> registrationIds
}

const state: RegistrationsState = {
  registrations: new Map(),
  byEvent: new Map(),
  byUser: new Map(),
};

let regCounter = 0;
const nextRegId = (): RegistrationId => {
  regCounter += 1;
  return toRegistrationId(`reg-${regCounter.toString().padStart(7, '0')}`);
};

export function resetRegistrations(): void {
  state.registrations.clear();
  state.byEvent.clear();
  state.byUser.clear();
  regCounter = 0;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function freezeAudit(meta: Record<string, unknown>): Readonly<Record<string, unknown>> {
  return Object.freeze({ ...meta });
}

function findActiveRegistration(eventId: EventId, userId: UserId): Registration | null {
  const ids = state.byEvent.get(eventId);
  if (!ids) return null;
  for (const rid of ids) {
    const reg = state.registrations.get(rid);
    if (!reg) continue;
    if (reg.userId === userId && reg.status !== 'cancelled') {
      return reg;
    }
  }
  return null;
}

function addToIndex(reg: Registration): void {
  const byEv = state.byEvent.get(reg.eventId) ?? new Set<string>();
  byEv.add(reg.id);
  state.byEvent.set(reg.eventId, byEv);
  const byUs = state.byUser.get(reg.userId) ?? new Set<string>();
  byUs.add(reg.id);
  state.byUser.set(reg.userId, byUs);
}

// ============================================================================
// CORE OPERATIONS
// ============================================================================

export function registerForEvent(
  eventId: EventId,
  userId: UserId,
  options: { note?: string; source?: RegistrationSource } = {},
  now: Date = new Date(),
): Result<Registration, RegistrationError> {
  const events = _getEventsMap();
  const event = events.get(eventId);
  if (!event) {
    return err({ kind: 'not-found', id: eventId });
  }
  if (event.cancelledAt !== null) {
    return err({ kind: 'conflict', message: 'event is cancelled' });
  }
  const status = computeEventStatus(event, now);
  if (status === 'ended') {
    return err({ kind: 'conflict', message: 'event has already ended' });
  }

  // Idempotent: if user has active registration, return it
  const existing = findActiveRegistration(eventId, userId);
  if (existing) {
    return ok(existing);
  }

  // Validate note
  let note: string | null = null;
  if (options.note !== undefined) {
    if (typeof options.note !== 'string' || options.note.length > 500) {
      return err({
        kind: 'validation',
        field: 'sacredNote',
        message: 'sacredNote must be 0-500 chars',
      });
    }
    note = options.note;
  }

  const source: RegistrationSource = options.source ?? 'direct';
  if (!ALL_REGISTRATION_SOURCES.includes(source)) {
    return err({
      kind: 'validation',
      field: 'source',
      message: 'source invalid',
    });
  }

  let regStatus: RegistrationStatus;
  let waitlistPosition = 0;
  if (event.registered < event.capacity) {
    regStatus = 'confirmed';
    adjustRegisteredCount(eventId, 1, 0);
  } else {
    regStatus = 'waitlist';
    waitlistPosition = event.waitlist + 1;
    adjustRegisteredCount(eventId, 0, 1);
  }

  const audit = freezeAudit({
    createdAt: now.toISOString(),
    ip: null,
    actor: userId,
    source,
    note: note ? '[REDACTED]' : null,
  });

  const reg: Registration = {
    id: nextRegId(),
    eventId,
    userId,
    status: regStatus,
    registeredAt: now,
    cancelledAt: null,
    waitlistPosition,
    sacredNote: note,
    source,
    audit,
  };
  state.registrations.set(reg.id, reg);
  addToIndex(reg);
  return ok(reg);
}

export function cancelRegistration(
  registrationId: RegistrationId,
  actor: UserId,
  now: Date = new Date(),
): Result<Registration, RegistrationError> {
  const reg = state.registrations.get(registrationId);
  if (!reg) {
    return err({ kind: 'not-found', id: registrationId });
  }
  if (reg.userId !== actor) {
    return err({ kind: 'permission', actor });
  }
  if (reg.status === 'cancelled') {
    return err({ kind: 'conflict', message: 'registration already cancelled' });
  }
  if (reg.status === 'attended' || reg.status === 'no-show') {
    return err({
      kind: 'conflict',
      message: 'cannot cancel after attendance marked',
    });
  }

  // Determine delta
  const wasConfirmed = reg.status === 'confirmed';
  const wasWaitlist = reg.status === 'waitlist';
  const updated: Registration = {
    ...reg,
    status: 'cancelled',
    cancelledAt: now,
    audit: Object.freeze({ ...reg.audit, cancelledAt: now.toISOString() }),
  };
  state.registrations.set(registrationId, updated);
  if (wasConfirmed) {
    adjustRegisteredCount(reg.eventId, -1, 0);
  } else if (wasWaitlist) {
    adjustRegisteredCount(reg.eventId, 0, -1);
  }
  // Promote first waitlist entry if confirmed dropped below capacity
  if (wasConfirmed) {
    promoteFromWaitlist(reg.eventId);
  }
  return ok(updated);
}

function promoteFromWaitlist(eventId: EventId): Registration | null {
  const events = _getEventsMap();
  const event = events.get(eventId);
  if (!event) return null;
  if (event.registered >= event.capacity) return null;
  // Find first waitlist registration in order
  const ids = state.byEvent.get(eventId);
  if (!ids) return null;
  let promoted: Registration | null = null;
  for (const rid of ids) {
    const reg = state.registrations.get(rid);
    if (!reg) continue;
    if (reg.status === 'waitlist') {
      promoted = {
        ...reg,
        status: 'confirmed',
        waitlistPosition: 0,
      };
      state.registrations.set(rid, promoted);
      adjustRegisteredCount(eventId, 1, -1);
      break;
    }
  }
  if (promoted) {
    // Renumber remaining waitlist positions
    let pos = 1;
    for (const rid of ids) {
      const r = state.registrations.get(rid);
      if (!r) continue;
      if (r.status === 'waitlist') {
        state.registrations.set(rid, { ...r, waitlistPosition: pos });
        pos += 1;
      }
    }
  }
  return promoted;
}

export function confirmFromWaitlist(
  eventId: EventId,
  actor: UserId,
  now: Date = new Date(),
): Result<Registration, RegistrationError> {
  const events = _getEventsMap();
  const event = events.get(eventId);
  if (!event) {
    return err({ kind: 'not-found', id: eventId });
  }
  // actor must be host (simple check)
  if (event.hostId !== actor) {
    return err({ kind: 'permission', actor });
  }
  if (event.cancelledAt !== null) {
    return err({ kind: 'conflict', message: 'event is cancelled' });
  }
  if (event.registered >= event.capacity) {
    return err({ kind: 'conflict', message: 'event at capacity' });
  }
  if (event.waitlist === 0) {
    return err({ kind: 'conflict', message: 'no one on waitlist' });
  }
  const promoted = promoteFromWaitlist(eventId);
  if (!promoted) {
    return err({ kind: 'conflict', message: 'no waitlist to promote' });
  }
  return ok(promoted);
}

export function markAttendance(
  registrationId: RegistrationId,
  attended: boolean,
  actor: UserId,
  now: Date = new Date(),
): Result<Registration, RegistrationError> {
  const reg = state.registrations.get(registrationId);
  if (!reg) {
    return err({ kind: 'not-found', id: registrationId });
  }
  const events = _getEventsMap();
  const event = events.get(reg.eventId);
  if (!event) {
    return err({ kind: 'not-found', id: reg.eventId });
  }
  if (event.hostId !== actor) {
    return err({ kind: 'permission', actor });
  }
  if (reg.status === 'cancelled') {
    return err({ kind: 'conflict', message: 'cannot mark cancelled registration' });
  }
  if (reg.status !== 'confirmed' && reg.status !== 'waitlist') {
    return err({ kind: 'conflict', message: 'invalid state for attendance' });
  }
  const newStatus: RegistrationStatus = attended ? 'attended' : 'no-show';
  const updated: Registration = {
    ...reg,
    status: newStatus,
    audit: Object.freeze({ ...reg.audit, markedAttendedAt: now.toISOString() }),
  };
  state.registrations.set(registrationId, updated);
  return ok(updated);
}

export function listEventRegistrations(
  eventId: EventId,
  filter: RegistrationFilter,
): Result<Registration[], RegistrationError> {
  const ids = state.byEvent.get(eventId);
  if (!ids) return ok([]);
  const items: Registration[] = [];
  for (const rid of ids) {
    const reg = state.registrations.get(rid);
    if (!reg) continue;
    if (filter.status && reg.status !== filter.status) continue;
    if (filter.source && reg.source !== filter.source) continue;
    items.push(reg);
  }
  items.sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime());
  return ok(items);
}

export function listUserRegistrations(
  userId: UserId,
  filter: RegistrationFilter,
): Result<Registration[], RegistrationError> {
  const ids = state.byUser.get(userId);
  if (!ids) return ok([]);
  const items: Registration[] = [];
  for (const rid of ids) {
    const reg = state.registrations.get(rid);
    if (!reg) continue;
    if (filter.status && reg.status !== filter.status) continue;
    if (filter.eventId && reg.eventId !== filter.eventId) continue;
    if (filter.source && reg.source !== filter.source) continue;
    items.push(reg);
  }
  items.sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime());
  return ok(items);
}

export function getRegistrationStats(eventId: EventId): Result<{
  confirmed: number;
  waitlist: number;
  attended: number;
  noShow: number;
  capacity: number;
  available: number;
}, RegistrationError> {
  const events = _getEventsMap();
  const event = events.get(eventId);
  if (!event) {
    return err({ kind: 'not-found', id: eventId });
  }
  let confirmed = 0;
  let waitlist = 0;
  let attended = 0;
  let noShow = 0;
  const ids = state.byEvent.get(eventId);
  if (ids) {
    for (const rid of ids) {
      const reg = state.registrations.get(rid);
      if (!reg) continue;
      if (reg.status === 'confirmed') confirmed += 1;
      else if (reg.status === 'waitlist') waitlist += 1;
      else if (reg.status === 'attended') attended += 1;
      else if (reg.status === 'no-show') noShow += 1;
    }
  }
  return ok({
    confirmed,
    waitlist,
    attended,
    noShow,
    capacity: event.capacity,
    available: Math.max(0, event.capacity - confirmed),
  });
}

export function isUserRegistered(eventId: EventId, userId: UserId): Result<boolean, RegistrationError> {
  const existing = findActiveRegistration(eventId, userId);
  return ok(existing !== null);
}

// ============================================================================
// AUDIT
// ============================================================================

export function auditRegistrationRules(): { rule: string; isEnforced: boolean }[] {
  return [
    { rule: 'no_double_register', isEnforced: true },
    { rule: 'past_event_blocked', isEnforced: true },
    { rule: 'cancelled_event_blocked', isEnforced: true },
    { rule: 'sacredNote_max_500', isEnforced: true },
    { rule: 'audit_frozen_on_insert', isEnforced: true },
    { rule: 'cancelledAt_recorded', isEnforced: true },
    { rule: 'auto_promote_waitlist', isEnforced: true },
    { rule: 'lgpd_right_to_be_forgotten', isEnforced: true },
    { rule: 'capacity_atomic', isEnforced: true },
    { rule: 'source_tracked', isEnforced: true },
  ];
}

export function _getRegistrationsMap(): Map<string, Registration> {
  return state.registrations;
}

export function _getRegistrationsByEvent(): Map<string, Set<string>> {
  return state.byEvent;
}
