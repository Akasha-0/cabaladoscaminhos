// EVENTS / WORKSHOPS — Wave 47 surface (in-person, online, hybrid)
// Complements (does NOT replace) the existing community/events.ts.
// Covers multi-session workshops, recurrence, ICS, capacity + waitlist,
// verified-organizer gating, payout stubs, mutual-events discovery.

export const EVENT_TYPES = ['in_person', 'online', 'hybrid'] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export const EVENT_STATUSES = ['draft', 'scheduled', 'live', 'ended', 'cancelled'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
export const RSVP_STATUSES = ['going', 'maybe', 'waitlist', 'declined'] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];
export const RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];
export const ATTENDANCE_STATUSES = ['going', 'no_show', 'late'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export const VERIFICATION_LEVELS = ['none', 'email_verified', 'identity_verified', 'tradition_verified'] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];
export const MAX_SESSIONS_PER_WORKSHOP = 24;
export const MAX_CAPACITY = 2_000;
export const MIN_DURATION_MIN = 5;
export const MAX_DURATION_MIN = 60 * 24;
export const MIN_RECURRENCE_COUNT = 1;
export const MAX_RECURRENCE_COUNT = 365;
export const MAX_TAGS_PER_EVENT = 12;
export const MAX_PREREQUISITES_PER_SESSION = 8;
export const RSVP_LIST_PAGE_SIZE = 50;
export const RSVP_LIST_MAX_PAGE_SIZE = 200;

export interface Money { amount: number; currency: 'BRL' | 'USD' | 'EUR'; }
export interface SessionResource { kind: 'pdf' | 'audio' | 'video' | 'link'; url: string; label: string; }
export interface Venue { name: string; address: string; city: string; country: string; latitude: number | null; longitude: number | null; capacity: number | null; accessibility: string | null; }
export interface RecurrenceRule {
  freq: RecurrenceFrequency;
  interval: number;
  byDay?: string[];
  byMonthDay?: number;
  count?: number;
  until?: string;
  exDates?: string[];
}
export interface Organizer {
  id: string;
  displayName: string;
  bio: string;
  defaultTimezone: string;
  verification: VerificationLevel;
  traditions: string[];
  reputation: number;
  payout: PayoutHook | null;
  createdAt: string;
  updatedAt: string;
}
export interface EventSession {
  id: string;
  eventId: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  location: string | null;
  meetingUrl: string | null;
  prerequisites: string[];
  facilitatorId: string | null;
  resources: SessionResource[];
  order: number;
}
export interface Curriculum {
  workshopId: string;
  sessions: EventSession[];
  totalMinutes: number;
  liveHours: number;
  estimatedAsyncHours: number;
}
export interface RsvpCounts { going: number; maybe: number; waitlist: number; declined: number; }
export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  tradition: string;
  tags: string[];
  language: string;
  timezone: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  isPublic: boolean;
  venue: Venue | null;
  meetingUrl: string | null;
  price: Money | null;
  coverImageUrl: string | null;
  recurrence: RecurrenceRule | null;
  sessions: EventSession[];
  rsvpCounts?: RsvpCounts;
  views24h: number;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
}
export type Workshop = Event;
export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  status: RsvpStatus;
  promotedAt: string | null;
  createdAt: string;
  updatedAt: string;
  note: string | null;
  guestCount: number;
}
export interface WaitlistEntry {
  id: string;
  eventId: string;
  userId: string;
  position: number;
  priority: number;
  addedAt: string;
  reason: string | null;
}
export interface PayoutHook {
  provider: 'stripe' | 'mercadopago' | 'pix_manual';
  accountId: string;
  commissionBps: number | null;
  enabled: boolean;
}
export interface CreateEventInput {
  organizerId: string;
  title: string;
  description: string;
  type: EventType;
  tradition: string;
  language?: string;
  timezone: string;
  startsAt: string;
  endsAt: string;
  capacity?: number;
  isPublic?: boolean;
  venue?: Venue | null;
  meetingUrl?: string | null;
  price?: Money | null;
  coverImageUrl?: string | null;
  recurrence?: RecurrenceRule | null;
  tags?: string[];
}
export interface UpdateEventPatch {
  title?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  capacity?: number;
  venue?: Venue | null;
  meetingUrl?: string | null;
  price?: Money | null;
  coverImageUrl?: string | null;
  tags?: string[];
  language?: string;
  timezone?: string;
  status?: EventStatus;
  isPublic?: boolean;
}
export interface RsvpOptions {
  status?: RsvpStatus;
  note?: string;
  guestCount?: number;
  forceWaitlist?: boolean;
  idempotencyKey?: string;
}
export interface GetRsvpListOptions {
  status?: RsvpStatus | RsvpStatus[];
  page?: number;
  pageSize?: number;
  ascending?: boolean;
}
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number; hasMore: boolean; }
export interface EventCapacityInfo {
  current: number;
  max: number;
  available: number;
  waitlistCount: number;
  isUnlimited: boolean;
}
export interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  markedAt: string;
  markedBy: string;
}
export interface EventAnalytics {
  eventId: string;
  views: number;
  rsvps: number;
  attendees: number;
  noShows: number;
  conversionRate: number;
  waitlistPromotions: number;
  cancellationCount: number;
}
export interface CalendarExportFormat {
  format: 'ics' | 'google' | 'outlook';
  reminderMinutes?: number;
}
export interface CalendarExportResult {
  format: 'ics' | 'google' | 'outlook';
  content: string;
  filename: string;
}
export interface ImportedCalendarEvent {
  uid: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  location: string | null;
  url: string | null;
  organizerEmail: string | null;
  raw: Record<string, string>;
}
export interface RecurrenceExpansion {
  originalEventId: string;
  recurrenceId: string;
  startsAt: string;
  endsAt: string;
  isException: boolean;
}
export interface ReportReason {
  category: 'spam' | 'harassment' | 'unsafe' | 'fraud' | 'copyright' | 'other';
  description: string;
  evidenceUrls: string[];
}
export interface EventReport {
  id: string;
  eventId: string;
  reporterId: string;
  reason: ReportReason;
  createdAt: string;
  resolved: boolean;
}
export interface ModerationAction {
  action: 'unpublish' | 'delete' | 'flag_for_review' | 'clear';
  reason: string;
  byAdminId: string;
  notifyOrganizer: boolean;
}
export interface SearchEventsFilters {
  tradition?: string;
  type?: EventType;
  language?: string;
  startsAfter?: string;
  startsBefore?: string;
  isFree?: boolean;
  tags?: string[];
  organizerId?: string;
  onlyUpcoming?: boolean;
}

export class EventError extends Error {
  readonly code: string;
  readonly details: Record<string, unknown>;
  constructor(code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'EventError';
    this.code = code;
    this.details = details;
  }
}
export const EVENT_ERROR_CODES = {
  NOT_FOUND: 'EVENT_NOT_FOUND',
  ORGANIZER_REQUIRED: 'EVENT_ORGANIZER_REQUIRED',
  NOT_ORGANIZER: 'EVENT_NOT_ORGANIZER',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  EVENT_ENDED: 'EVENT_ENDED',
  EVENT_FULL: 'EVENT_FULL',
  NOT_RSVPED: 'EVENT_NOT_RSVPED',
  INVALID_DATES: 'EVENT_INVALID_DATES',
  INVALID_CAPACITY: 'EVENT_INVALID_CAPACITY',
  INVALID_INPUT: 'EVENT_INVALID_INPUT',
  VERIFICATION_REQUIRED: 'EVENT_VERIFICATION_REQUIRED',
  SESSION_LOCKED: 'EVENT_SESSION_LOCKED',
  CONFLICT: 'EVENT_CONFLICT',
  RECURRENCE_BOUNDS_EXCEEDED: 'EVENT_RECURRENCE_BOUNDS_EXCEEDED',
  ICS_PARSE_FAILED: 'EVENT_ICS_PARSE_FAILED',
} as const;
export type EventErrorCode = (typeof EVENT_ERROR_CODES)[keyof typeof EVENT_ERROR_CODES];

interface EventStore {
  events: Map<string, Event>;
  rsvps: Map<string, RSVP>;
  waitlists: Map<string, WaitlistEntry>;
  attendance: Map<string, AttendanceRecord>;
  organizers: Map<string, Organizer>;
  reports: Map<string, EventReport>;
  rsvpByUser: Map<string, string>;
  waitlistByUser: Map<string, string>;
  idempotency: Map<string, string>;
}
declare global { var __akasha_events_store__: EventStore | undefined; }
function getStore(): EventStore {
  if (!globalThis.__akasha_events_store__) {
    globalThis.__akasha_events_store__ = {
      events: new Map(),
      rsvps: new Map(),
      waitlists: new Map(),
      attendance: new Map(),
      organizers: new Map(),
      reports: new Map(),
      rsvpByUser: new Map(),
      waitlistByUser: new Map(),
      idempotency: new Map(),
    };
  }
  return globalThis.__akasha_events_store__;
}
export function _resetEventStore(): void {
  globalThis.__akasha_events_store__ = {
    events: new Map(),
    rsvps: new Map(),
    waitlists: new Map(),
    attendance: new Map(),
    organizers: new Map(),
    reports: new Map(),
    rsvpByUser: new Map(),
    waitlistByUser: new Map(),
    idempotency: new Map(),
  };
}

function newId(prefix: string): string {
  const c = globalThis.crypto;
  const uuid = typeof c?.randomUUID === 'function' ? c.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}_${uuid}`;
}
const nowIso = (): string => new Date().toISOString();
function assertIsoDate(value: string, field: string): void {
  if (!value || Number.isNaN(Date.parse(value))) {
    throw new EventError(EVENT_ERROR_CODES.INVALID_DATES, `Campo ${field} deve ser ISO 8601`, { field, value });
  }
}
function assertRange(start: string, end: string): void {
  assertIsoDate(start, 'startsAt');
  assertIsoDate(end, 'endsAt');
  if (Date.parse(end) <= Date.parse(start)) {
    throw new EventError(EVENT_ERROR_CODES.INVALID_DATES, 'endsAt deve ser maior que startsAt', { startsAt: start, endsAt: end });
  }
  const minMs = MIN_DURATION_MIN * 60_000;
  const maxMs = MAX_DURATION_MIN * 60_000;
  const dur = Date.parse(end) - Date.parse(start);
  if (dur < minMs) throw new EventError(EVENT_ERROR_CODES.INVALID_DATES, `Duração mínima ${MIN_DURATION_MIN} min`, { dur });
  if (dur > maxMs) throw new EventError(EVENT_ERROR_CODES.INVALID_DATES, `Duração máxima ${MAX_DURATION_MIN} min`, { dur });
}
function isOrganizerVerified(o: Organizer): boolean {
  return o.verification === 'identity_verified' || o.verification === 'tradition_verified';
}
function isOrganizerVerifiedById(organizerId: string): boolean {
  const o = getStore().organizers.get(organizerId);
  return !!o && isOrganizerVerified(o);
}
function computeRsvpCounts(eventId: string): RsvpCounts {
  const store = getStore();
  const acc: RsvpCounts = { going: 0, maybe: 0, waitlist: 0, declined: 0 };
  for (const r of store.rsvps.values()) if (r.eventId === eventId) acc[r.status] += 1 + r.guestCount;
  for (const w of store.waitlists.values()) if (w.eventId === eventId) acc.waitlist += 1;
  return acc;
}
function attachRsvpCounts(ev: Event): Event {
  ev.rsvpCounts = computeRsvpCounts(ev.id);
  return ev;
}
const isLive = (ev: Event): boolean => { const now = Date.now(); return Date.parse(ev.startsAt) <= now && Date.parse(ev.endsAt) >= now; };
const isPast = (ev: Event): boolean => Date.parse(ev.endsAt) < Date.now();
const isUpcoming = (ev: Event): boolean => Date.parse(ev.startsAt) > Date.now();
export function isEventLive(ev: Event): boolean { return isLive(ev); }
export function isEventUpcoming(ev: Event): boolean { return isUpcoming(ev); }
export function isEventPast(ev: Event): boolean { return isPast(ev); }
export function isWorkshop(ev: Event): boolean { return ev.sessions.length > 1; }

// ORGANIZER
export function registerOrganizer(input: { id: string; displayName: string; bio?: string; defaultTimezone?: string; traditions?: string[]; }): Organizer {
  const store = getStore();
  const existing = store.organizers.get(input.id);
  if (existing) return existing;
  const created: Organizer = {
    id: input.id,
    displayName: input.displayName,
    bio: input.bio ?? '',
    defaultTimezone: input.defaultTimezone ?? 'UTC',
    verification: 'none',
    traditions: input.traditions ?? [],
    reputation: 0,
    payout: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.organizers.set(input.id, created);
  return created;
}
export function getOrganizer(organizerId: string): Organizer | null {
  return getStore().organizers.get(organizerId) ?? null;
}
export function verifyOrganizer(
  organizerId: string,
  byAdminId: string,
  credentials: { level: VerificationLevel; notes?: string; traditions?: string[]; }
): Organizer {
  if (!byAdminId || typeof byAdminId !== 'string') {
    throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'byAdminId obrigatório', { byAdminId });
  }
  const store = getStore();
  const o = store.organizers.get(organizerId);
  if (!o) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Organizador não encontrado', { organizerId });
  o.verification = credentials.level;
  if (credentials.traditions?.length) o.traditions = Array.from(new Set([...o.traditions, ...credentials.traditions]));
  o.updatedAt = nowIso();
  return o;
}
export function isVerifiedOrganizer(organizerId: string): boolean { return isOrganizerVerifiedById(organizerId); }
export function setOrganizerPayout(organizerId: string, payout: PayoutHook): Organizer {
  const store = getStore();
  const o = store.organizers.get(organizerId);
  if (!o) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Organizador não encontrado', { organizerId });
  o.payout = payout;
  o.updatedAt = nowIso();
  return o;
}

// CREATE / UPDATE / CANCEL
function normalizeCreateEventInput(input: CreateEventInput) {
  if (!input.organizerId) throw new EventError(EVENT_ERROR_CODES.ORGANIZER_REQUIRED, 'organizerId obrigatório');
  if (!input.title || input.title.trim().length < 3) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'title mínimo 3 caracteres');
  if (input.title.length > 140) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'title máximo 140');
  if (!input.description || input.description.trim().length < 10) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'description mínimo 10');
  if (!EVENT_TYPES.includes(input.type)) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `type deve ser ${EVENT_TYPES.join(',')}`, { type: input.type });
  if (!input.tradition || input.tradition.trim().length < 2) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'tradition obrigatória');
  if (!input.timezone) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'timezone obrigatória');
  assertRange(input.startsAt, input.endsAt);
  const capacity = input.capacity ?? 0;
  if (capacity < 0 || capacity > MAX_CAPACITY) throw new EventError(EVENT_ERROR_CODES.INVALID_CAPACITY, `capacity fora [0,${MAX_CAPACITY}]`, { capacity });
  if ((input.type === 'in_person' || input.type === 'hybrid') && !input.venue) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'venue obrigatório para in_person/hybrid', { type: input.type });
  if ((input.type === 'online' || input.type === 'hybrid') && !input.meetingUrl) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'meetingUrl obrigatório para online/hybrid', { type: input.type });
  if (input.tags && input.tags.length > MAX_TAGS_PER_EVENT) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `máximo ${MAX_TAGS_PER_EVENT} tags`);
  if (input.price && input.price.amount > 0 && !isOrganizerVerifiedById(input.organizerId)) {
    throw new EventError(EVENT_ERROR_CODES.VERIFICATION_REQUIRED, 'Eventos pagos exigem organizador verificado', { organizerId: input.organizerId });
  }
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    language: (input.language ?? 'pt-BR').trim(),
    capacity,
    isPublic: input.isPublic ?? true,
    venue: input.venue ?? null,
    meetingUrl: input.meetingUrl ?? null,
    price: input.price ?? null,
    coverImageUrl: input.coverImageUrl ?? null,
    recurrence: input.recurrence ?? null,
    tags: (input.tags ?? []).slice(0, MAX_TAGS_PER_EVENT),
  };
}
export function createEvent(organizerId: string, eventInput: CreateEventInput): Event {
  if (!getStore().organizers.has(organizerId)) {
    registerOrganizer({
      id: organizerId,
      displayName: organizerId,
      defaultTimezone: eventInput.timezone,
      traditions: [eventInput.tradition],
    });
  }
  const norm = normalizeCreateEventInput(eventInput);
  const eventId = newId('evt');
  const now = nowIso();
  const syntheticSession: EventSession = {
    id: newId('ses'), eventId,
    title: eventInput.title.trim(), description: eventInput.description.trim(),
    startsAt: eventInput.startsAt, endsAt: eventInput.endsAt, timezone: eventInput.timezone,
    location: norm.venue?.name ?? null, meetingUrl: norm.meetingUrl,
    prerequisites: [], facilitatorId: organizerId, resources: [], order: 0,
  };
  const event: Event = {
    id: eventId, organizerId,
    title: norm.title, description: norm.description,
    type: eventInput.type, status: 'draft',
    tradition: eventInput.tradition.trim(), tags: norm.tags, language: norm.language,
    timezone: eventInput.timezone, startsAt: eventInput.startsAt, endsAt: eventInput.endsAt,
    capacity: norm.capacity, isPublic: norm.isPublic,
    venue: norm.venue, meetingUrl: norm.meetingUrl, price: norm.price, coverImageUrl: norm.coverImageUrl,
    recurrence: norm.recurrence, sessions: [syntheticSession],
    rsvpCounts: { going: 0, maybe: 0, waitlist: 0, declined: 0 },
    views24h: 0, createdAt: now, updatedAt: now, cancelledAt: null, cancellationReason: null,
  };
  getStore().events.set(eventId, event);
  return event;
}
export function updateEvent(eventId: string, byOrganizerId: string, patch: UpdateEventPatch): Event {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  if (ev.status === 'cancelled') throw new EventError(EVENT_ERROR_CODES.EVENT_CANCELLED, 'Evento cancelado não pode ser editado', { eventId });
  if (patch.title !== undefined) {
    if (patch.title.length < 3 || patch.title.length > 140) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'title 3..140');
    ev.title = patch.title.trim();
  }
  if (patch.description !== undefined) {
    if (patch.description.length < 10) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'description >= 10');
    ev.description = patch.description.trim();
  }
  if (patch.capacity !== undefined) {
    if (patch.capacity < 0 || patch.capacity > MAX_CAPACITY) throw new EventError(EVENT_ERROR_CODES.INVALID_CAPACITY, `capacity fora [0,${MAX_CAPACITY}]`);
    ev.capacity = patch.capacity;
  }
  if (patch.venue !== undefined) ev.venue = patch.venue;
  if (patch.meetingUrl !== undefined) ev.meetingUrl = patch.meetingUrl;
  if (patch.price !== undefined) ev.price = patch.price;
  if (patch.coverImageUrl !== undefined) ev.coverImageUrl = patch.coverImageUrl;
  if (patch.tags !== undefined) ev.tags = patch.tags.slice(0, MAX_TAGS_PER_EVENT);
  if (patch.language !== undefined) ev.language = patch.language;
  if (patch.timezone !== undefined) ev.timezone = patch.timezone;
  if (patch.isPublic !== undefined) ev.isPublic = patch.isPublic;
  if (patch.status !== undefined) {
    if (!EVENT_STATUSES.includes(patch.status)) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `status inválido: ${patch.status}`);
    if (patch.status === 'cancelled') throw new EventError(EVENT_ERROR_CODES.CONFLICT, 'Use cancelEvent para cancelar', { eventId });
    ev.status = patch.status;
  }
  if (patch.startsAt !== undefined || patch.endsAt !== undefined) {
    const newStart = patch.startsAt ?? ev.startsAt;
    const newEnd = patch.endsAt ?? ev.endsAt;
    assertRange(newStart, newEnd);
    ev.startsAt = newStart;
    ev.endsAt = newEnd;
    const first = ev.sessions[0];
    if (first && first.order === 0) { first.startsAt = newStart; first.endsAt = newEnd; }
  }
  ev.updatedAt = nowIso();
  return ev;
}
export function cancelEvent(eventId: string, byOrganizerId: string, reason: string): Event {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  if (ev.status === 'cancelled') throw new EventError(EVENT_ERROR_CODES.CONFLICT, 'Evento já cancelado', { eventId });
  if (!reason || reason.length < 3) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'reason >= 3 caracteres');
  ev.status = 'cancelled';
  ev.cancelledAt = nowIso();
  ev.cancellationReason = reason;
  ev.updatedAt = ev.cancelledAt;
  refundAllRsvps(eventId, reason);
  return ev;
}
function refundAllRsvps(eventId: string, reason: string): void {
  const store = getStore();
  let refunded = 0;
  for (const rsvp of store.rsvps.values()) {
    if (rsvp.eventId === eventId && rsvp.status === 'going') {
      rsvp.status = 'declined';
      rsvp.updatedAt = nowIso();
      refunded += 1;
    }
  }
  if (typeof console !== 'undefined') console.info('[events] cancelEvent', { eventId, reason, refunded });
}

// RSVP + WAITLIST
export function rsvp(eventId: string, userId: string, options: RsvpOptions = {}): { rsvp: RSVP; promoted: boolean } {
  if (!userId) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'userId obrigatório');
  const store = getStore();
  const ev = store.events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.status === 'cancelled') throw new EventError(EVENT_ERROR_CODES.EVENT_CANCELLED, 'Evento cancelado', { eventId });
  if (ev.status === 'ended') throw new EventError(EVENT_ERROR_CODES.EVENT_ENDED, 'Evento encerrado', { eventId });
  if (options.idempotencyKey) {
    const seen = store.idempotency.get(options.idempotencyKey);
    if (seen) {
      const existing = store.rsvps.get(seen);
      if (existing) return { rsvp: existing, promoted: false };
    }
  }
  const desired: RsvpStatus = options.status ?? 'going';
  if (!RSVP_STATUSES.includes(desired)) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `status inválido: ${desired}`);
  const rsvpKey = `${eventId}:${userId}`;
  const existing = store.rsvps.get(store.rsvpByUser.get(rsvpKey) ?? '');
  const guestCount = Math.max(0, options.guestCount ?? 0);
  if (existing) {
    if (existing.status === desired && existing.note === (options.note ?? null)) return { rsvp: existing, promoted: false };
    const wasCounting = existing.status === 'going';
    existing.status = desired;
    existing.note = options.note ?? existing.note;
    existing.guestCount = guestCount;
    existing.updatedAt = nowIso();
    let promoted = false;
    if (wasCounting && desired !== 'going') promoted = promoteFromWaitlist(eventId, { organizerOnly: false }) !== null;
    return { rsvp: existing, promoted };
  }
  const counts = computeRsvpCounts(eventId);
  let statusToPersist: RsvpStatus = desired;
  if (desired === 'going' && ev.capacity > 0 && counts.going + guestCount >= ev.capacity && !options.forceWaitlist) {
    throw new EventError(EVENT_ERROR_CODES.EVENT_FULL, 'Evento lotado; entre na lista de espera', { eventId, capacity: ev.capacity, current: counts.going });
  }
  if (desired === 'going' && ev.capacity > 0 && counts.going + guestCount >= ev.capacity && options.forceWaitlist) {
    statusToPersist = 'waitlist';
  }
  const r: RSVP = {
    id: newId('rsvp'), eventId, userId, status: statusToPersist, promotedAt: null,
    createdAt: nowIso(), updatedAt: nowIso(), note: options.note ?? null, guestCount,
  };
  store.rsvps.set(r.id, r);
  store.rsvpByUser.set(rsvpKey, r.id);
  if (statusToPersist === 'waitlist') addToWaitlist(eventId, userId, null, null);
  if (options.idempotencyKey) store.idempotency.set(options.idempotencyKey, r.id);
  return { rsvp: r, promoted: false };
}
export function cancelRsvp(eventId: string, userId: string): { cancelled: boolean; promoted: RSVP | null } {
  const store = getStore();
  const rsvpKey = `${eventId}:${userId}`;
  const rsvpId = store.rsvpByUser.get(rsvpKey);
  if (!rsvpId) throw new EventError(EVENT_ERROR_CODES.NOT_RSVPED, 'Sem RSVP para cancelar', { eventId, userId });
  const rsvp = store.rsvps.get(rsvpId);
  if (!rsvp) throw new EventError(EVENT_ERROR_CODES.NOT_RSVPED, 'RSVP órfão', { eventId, userId });
  const wasCounting = rsvp.status === 'going';
  store.rsvps.delete(rsvpId);
  store.rsvpByUser.delete(rsvpKey);
  const wlId = store.waitlistByUser.get(rsvpKey);
  if (wlId) { store.waitlists.delete(wlId); store.waitlistByUser.delete(rsvpKey); }
  let promoted: RSVP | null = null;
  if (wasCounting) promoted = promoteFromWaitlist(eventId, { organizerOnly: false });
  return { cancelled: true, promoted };
}
export function getRsvpList(eventId: string, options: GetRsvpListOptions = {}, viewerId?: string): Paginated<RSVP> {
  const store = getStore();
  const ev = store.events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (!ev.isPublic && viewerId !== ev.organizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Lista restrita ao organizador', { eventId });
  const all = Array.from(store.rsvps.values()).filter((r) => r.eventId === eventId);
  const filtered = options.status
    ? all.filter((r) => Array.isArray(options.status) ? options.status.includes(r.status) : r.status === options.status)
    : all;
  filtered.sort((a, b) => options.ascending ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt));
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(RSVP_LIST_MAX_PAGE_SIZE, Math.max(1, options.pageSize ?? RSVP_LIST_PAGE_SIZE));
  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize, hasMore: start + pageSize < filtered.length };
}
export function getWaitlist(eventId: string): WaitlistEntry[] {
  const all = Array.from(getStore().waitlists.values()).filter((w) => w.eventId === eventId);
  return all.sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : a.addedAt.localeCompare(b.addedAt));
}
function addToWaitlist(eventId: string, userId: string, priority: number | null, reason: string | null): WaitlistEntry {
  const store = getStore();
  const key = `${eventId}:${userId}`;
  const existingId = store.waitlistByUser.get(key);
  if (existingId) {
    const existing = store.waitlists.get(existingId);
    if (existing) {
      if (priority !== null) existing.priority = priority;
      if (reason !== null) existing.reason = reason;
      return existing;
    }
  }
  const position = Array.from(store.waitlists.values()).filter((w) => w.eventId === eventId).length;
  const entry: WaitlistEntry = {
    id: newId('wl'), eventId, userId, position, priority: priority ?? position, addedAt: nowIso(), reason,
  };
  store.waitlists.set(entry.id, entry);
  store.waitlistByUser.set(key, entry.id);
  return entry;
}
export function promoteFromWaitlist(eventId: string, options: { organizerOnly: boolean }): RSVP | null {
  const store = getStore();
  const ev = store.events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  const counts = computeRsvpCounts(eventId);
  if (ev.capacity > 0 && counts.going >= ev.capacity) return null;
  const wl = getWaitlist(eventId)[0];
  if (!wl) return null;
  store.waitlists.delete(wl.id);
  store.waitlistByUser.delete(`${eventId}:${wl.userId}`);
  const rsvpKey = `${eventId}:${wl.userId}`;
  const existingId = store.rsvpByUser.get(rsvpKey);
  let rsvp: RSVP | null = null;
  if (existingId) {
    const existing = store.rsvps.get(existingId);
    if (existing) {
      existing.status = 'going';
      existing.promotedAt = nowIso();
      existing.updatedAt = nowIso();
      rsvp = existing;
    }
  }
  if (!rsvp) {
    rsvp = {
      id: newId('rsvp'), eventId, userId: wl.userId, status: 'going',
      promotedAt: nowIso(), createdAt: nowIso(), updatedAt: nowIso(), note: null, guestCount: 0,
    };
    store.rsvps.set(rsvp.id, rsvp);
    store.rsvpByUser.set(rsvpKey, rsvp.id);
  }
  if (typeof console !== 'undefined') console.info('[events] waitlist promoted', { eventId, userId: wl.userId, auto: !options.organizerOnly });
  return rsvp;
}
export function checkCapacity(eventId: string): EventCapacityInfo {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  const counts = computeRsvpCounts(eventId);
  const isUnlimited = ev.capacity === 0;
  return {
    current: counts.going, max: ev.capacity,
    available: isUnlimited ? Number.POSITIVE_INFINITY : Math.max(0, ev.capacity - counts.going),
    waitlistCount: counts.waitlist, isUnlimited,
  };
}

// SESSIONS + CURRICULUM
export function addSession(eventId: string, byOrganizerId: string, session: Omit<EventSession, 'id' | 'eventId' | 'order'>): EventSession {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  if (ev.sessions.length >= MAX_SESSIONS_PER_WORKSHOP) throw new EventError(EVENT_ERROR_CODES.CONFLICT, `Limite de ${MAX_SESSIONS_PER_WORKSHOP} sessões`, { eventId });
  assertIsoDate(session.startsAt, 'startsAt');
  assertIsoDate(session.endsAt, 'endsAt');
  if (Date.parse(session.endsAt) <= Date.parse(session.startsAt)) throw new EventError(EVENT_ERROR_CODES.INVALID_DATES, 'endsAt > startsAt');
  if (session.prerequisites.length > MAX_PREREQUISITES_PER_SESSION) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `máximo ${MAX_PREREQUISITES_PER_SESSION} pré-requisitos`);
  for (const prereqId of session.prerequisites) {
    if (!ev.sessions.some((s) => s.id === prereqId)) {
      throw new EventError(EVENT_ERROR_CODES.SESSION_LOCKED, `Pré-requisito não pertence: ${prereqId}`, { eventId, prereqId });
    }
  }
  const created: EventSession = {
    id: newId('ses'), eventId,
    title: session.title, description: session.description,
    startsAt: session.startsAt, endsAt: session.endsAt, timezone: session.timezone,
    location: session.location, meetingUrl: session.meetingUrl,
    prerequisites: session.prerequisites, facilitatorId: session.facilitatorId,
    resources: session.resources, order: ev.sessions.length,
  };
  ev.sessions.push(created);
  ev.updatedAt = nowIso();
  return created;
}
export function removeSession(eventId: string, byOrganizerId: string, sessionId: string): { removed: boolean } {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  if (ev.sessions.length <= 1) throw new EventError(EVENT_ERROR_CODES.CONFLICT, 'Não pode remover a única sessão', { eventId, sessionId });
  const before = ev.sessions.length;
  ev.sessions = ev.sessions.filter((s) => s.id !== sessionId);
  ev.sessions.forEach((s) => { s.prerequisites = s.prerequisites.filter((p) => p !== sessionId); });
  ev.sessions.forEach((s, i) => (s.order = i));
  ev.updatedAt = nowIso();
  return { removed: ev.sessions.length < before };
}
export function reorderSessions(eventId: string, byOrganizerId: string, orderedIds: string[]): EventSession[] {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  const ids = new Set(ev.sessions.map((s) => s.id));
  if (orderedIds.length !== ids.size || !orderedIds.every((id) => ids.has(id))) {
    throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'orderedIds deve conter todos os IDs na nova ordem');
  }
  const byId = new Map(ev.sessions.map((s) => [s.id, s]));
  ev.sessions = orderedIds.map((id, i) => {
    const s = byId.get(id);
    if (!s) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, `Sessão ${id} não encontrada`);
    s.order = i;
    return s;
  });
  ev.updatedAt = nowIso();
  return ev.sessions;
}
export function getCurriculum(workshopId: string): Curriculum {
  const ev = getStore().events.get(workshopId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Workshop não encontrado', { workshopId });
  const sessions = [...ev.sessions].sort((a, b) => a.order - b.order);
  let totalMinutes = 0;
  for (const s of sessions) totalMinutes += Math.round((Date.parse(s.endsAt) - Date.parse(s.startsAt)) / 60_000);
  const liveHours = +(totalMinutes / 60).toFixed(2);
  const estimatedAsyncHours = +(sessions.reduce((acc, s) => acc + s.resources.length, 0) * 0.5).toFixed(2);
  return { workshopId, sessions, totalMinutes, liveHours, estimatedAsyncHours };
}
export function setPrerequisites(eventId: string, byOrganizerId: string, sessionId: string, prerequisiteSessionIds: string[]): EventSession {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  if (prerequisiteSessionIds.length > MAX_PREREQUISITES_PER_SESSION) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `máximo ${MAX_PREREQUISITES_PER_SESSION} pré-requisitos`);
  const target = ev.sessions.find((s) => s.id === sessionId);
  if (!target) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Sessão não encontrada', { sessionId });
  if (prerequisiteSessionIds.includes(sessionId)) throw new EventError(EVENT_ERROR_CODES.CONFLICT, 'Sessão não pode ser pré-requisito de si mesma');
  for (const prereqId of prerequisiteSessionIds) {
    if (!ev.sessions.some((s) => s.id === prereqId)) throw new EventError(EVENT_ERROR_CODES.SESSION_LOCKED, `Pré-requisito inválido: ${prereqId}`);
  }
  target.prerequisites = [...prerequisiteSessionIds];
  ev.updatedAt = nowIso();
  return target;
}

// ATTENDANCE
export function markAttendance(eventId: string, byOrganizerId: string, userId: string, status: AttendanceStatus): AttendanceRecord {
  if (!ATTENDANCE_STATUSES.includes(status)) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `attendance status inválido: ${status}`);
  const store = getStore();
  const ev = store.events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  if (!store.rsvpByUser.has(`${eventId}:${userId}`)) throw new EventError(EVENT_ERROR_CODES.NOT_RSVPED, 'Usuário sem RSVP', { eventId, userId });
  const id = newId('att');
  const record: AttendanceRecord = { id, eventId, userId, status, markedAt: nowIso(), markedBy: byOrganizerId };
  store.attendance.set(id, record);
  return record;
}
export function getAttendanceReport(eventId: string): {
  eventId: string; total: number; going: number; late: number; noShow: number; noShowRate: number;
} {
  const store = getStore();
  if (!store.events.has(eventId)) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  const records = Array.from(store.attendance.values()).filter((a) => a.eventId === eventId);
  const going = records.filter((a) => a.status === 'going').length;
  const late = records.filter((a) => a.status === 'late').length;
  const noShow = records.filter((a) => a.status === 'no_show').length;
  return { eventId, total: records.length, going, late, noShow, noShowRate: records.length === 0 ? 0 : +(noShow / records.length).toFixed(3) };
}

// CALENDAR EXPORT / IMPORT (RFC 5545)
function toIcsDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}
function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
function unescapeIcs(s: string): string {
  return s.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}
export function generateIcsContent(event: Event, sessions: EventSession[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Akasha Portal//Events//PT-BR',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
  ];
  for (const session of sessions) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${session.id}@akasha.events`,
      `DTSTAMP:${toIcsDate(nowIso())}`,
      `DTSTART:${toIcsDate(session.startsAt)}`,
      `DTEND:${toIcsDate(session.endsAt)}`,
      `SUMMARY:${escapeIcs(event.title)} — ${escapeIcs(session.title)}`,
      `DESCRIPTION:${escapeIcs(session.description)}`,
      session.location ? `LOCATION:${escapeIcs(session.location)}` : '',
      session.meetingUrl ? `URL:${escapeIcs(session.meetingUrl)}` : '',
      `ORGANIZER;CN=${escapeIcs(event.organizerId)}:mailto:${event.organizerId}@akasha.events`,
      `CATEGORIES:${escapeIcs(event.tradition)}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}
function splitIcsFields(body: string): Record<string, string> {
  const unfolded = body.replace(/\r?\n[ \t]/g, '');
  const out: Record<string, string> = {};
  for (const rawLine of unfolded.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const fullKey = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const semi = fullKey.indexOf(';');
    const key = (semi < 0 ? fullKey : fullKey.slice(0, semi)).toUpperCase();
    out[key] = value;
  }
  return out;
}
function parseIcsDate(value: string): string {
  if (!value) return nowIso();
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?Z?$/);
  if (!m) return value;
  const [, y, mo, d, h = '00', mi = '00', s = '00'] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
}
export function exportCalendar(eventId: string, _userId: string, options: CalendarExportFormat): CalendarExportResult {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  const sessions = [...ev.sessions].sort((a, b) => a.order - b.order);
  if (options.format === 'ics') {
    return { format: 'ics', content: generateIcsContent(ev, sessions), filename: `${slugify(ev.title)}.ics` };
  }
  const first = sessions[0];
  if (!first) throw new EventError(EVENT_ERROR_CODES.CONFLICT, 'Evento sem sessões', { eventId });
  const text = `${ev.title} — ${first.title}`;
  const details = ev.description;
  if (options.format === 'google') {
    const dates = `${toIcsDate(first.startsAt)}/${toIcsDate(first.endsAt)}`;
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(text)}` +
      `&dates=${dates}` +
      `&details=${encodeURIComponent(details)}` +
      (first.location ? `&location=${encodeURIComponent(first.location)}` : '');
    return { format: 'google', content: url, filename: `${slugify(ev.title)}.google-calendar-url` };
  }
  const url =
    `https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent` +
    `&subject=${encodeURIComponent(text)}` +
    `&body=${encodeURIComponent(details)}` +
    `&startdt=${encodeURIComponent(first.startsAt)}` +
    `&enddt=${encodeURIComponent(first.endsAt)}` +
    (first.location ? `&location=${encodeURIComponent(first.location)}` : '');
  return { format: 'outlook', content: url, filename: `${slugify(ev.title)}.outlook-url` };
}
export function parseIcsImport(icsText: string): ImportedCalendarEvent[] {
  if (!icsText || typeof icsText !== 'string') throw new EventError(EVENT_ERROR_CODES.ICS_PARSE_FAILED, 'Conteúdo ICS vazio ou inválido');
  const blocks = icsText.split(/BEGIN:VEVENT/i).slice(1);
  const events: ImportedCalendarEvent[] = [];
  for (const blk of blocks) {
    const end = blk.search(/END:VEVENT/i);
    if (end < 0) continue;
    const fields = splitIcsFields(blk.slice(0, end));
    const uid = fields.UID ?? newId('imp');
    const start = parseIcsDate(fields.DTSTART ?? '');
    const finish = parseIcsDate(fields.DTEND ?? '') || start;
    events.push({
      uid,
      title: unescapeIcs(fields.SUMMARY ?? ''),
      description: unescapeIcs(fields.DESCRIPTION ?? ''),
      startsAt: start, endsAt: finish, timezone: 'UTC',
      location: fields.LOCATION ? unescapeIcs(fields.LOCATION) : null,
      url: fields.URL ?? null,
      organizerEmail: fields.ORGANIZER?.match(/mailto:([^:]+)/i)?.[1] ?? null,
      raw: fields,
    });
  }
  if (events.length === 0) throw new EventError(EVENT_ERROR_CODES.ICS_PARSE_FAILED, 'Nenhum VEVENT encontrado');
  return events;
}
function slugify(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

// RECURRENCE (RRULE-lite)
export function setRecurrence(eventId: string, byOrganizerId: string, rule: RecurrenceRule): Event {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  if (!RECURRENCE_FREQUENCIES.includes(rule.freq)) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `freq inválida: ${rule.freq}`);
  if (rule.interval && rule.interval < 1) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'interval >= 1');
  if (rule.count !== undefined && (rule.count < MIN_RECURRENCE_COUNT || rule.count > MAX_RECURRENCE_COUNT)) {
    throw new EventError(EVENT_ERROR_CODES.RECURRENCE_BOUNDS_EXCEEDED, `count fora [${MIN_RECURRENCE_COUNT},${MAX_RECURRENCE_COUNT}]`);
  }
  if (rule.until && Number.isNaN(Date.parse(rule.until))) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'until ISO 8601');
  if (rule.byDay && rule.freq !== 'WEEKLY') throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'byDay só com FREQ=WEEKLY');
  if (rule.byMonthDay && rule.freq !== 'MONTHLY') throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'byMonthDay só com FREQ=MONTHLY');
  ev.recurrence = rule;
  ev.updatedAt = nowIso();
  return ev;
}
const WEEKDAY_MAP: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
function nextOccurrence(ms: number, freq: RecurrenceFrequency, interval: number, byDay?: string[], byMonthDay?: number): number {
  const d = new Date(ms);
  switch (freq) {
    case 'DAILY': d.setUTCDate(d.getUTCDate() + interval); return d.getTime();
    case 'WEEKLY': {
      d.setUTCDate(d.getUTCDate() + 7 * interval);
      if (byDay && byDay.length > 0) {
        const target = byDay.map((c) => WEEKDAY_MAP[c.toUpperCase()] ?? -1);
        for (let i = 0; i < 7; i += 1) {
          if (target.includes(d.getUTCDay())) return d.getTime();
          d.setUTCDate(d.getUTCDate() + 1);
        }
      }
      return d.getTime();
    }
    case 'MONTHLY':
      d.setUTCMonth(d.getUTCMonth() + interval);
      if (byMonthDay) d.setUTCDate(Math.min(byMonthDay, new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()));
      return d.getTime();
    case 'YEARLY': d.setUTCFullYear(d.getUTCFullYear() + interval); return d.getTime();
  }
}
export function expandRecurrences(eventId: string, rangeStart: string, rangeEnd: string): RecurrenceExpansion[] {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  assertIsoDate(rangeStart, 'rangeStart');
  assertIsoDate(rangeEnd, 'rangeEnd');
  if (Date.parse(rangeEnd) <= Date.parse(rangeStart)) throw new EventError(EVENT_ERROR_CODES.INVALID_DATES, 'rangeEnd > rangeStart');
  if (!ev.recurrence) return [];
  const rule = ev.recurrence;
  const exSet = new Set(rule.exDates ?? []);
  const out: RecurrenceExpansion[] = [];
  const interval = rule.interval || 1;
  const startMs = Date.parse(ev.startsAt);
  const durationMs = Date.parse(ev.endsAt) - startMs;
  const rangeStartMs = Date.parse(rangeStart);
  const rangeEndMs = Date.parse(rangeEnd);
  let cursorMs = startMs;
  let count = 0;
  const maxIterations = (rule.count ?? MAX_RECURRENCE_COUNT) + 1;
  while (count < maxIterations) {
    if (rule.until && cursorMs > Date.parse(rule.until)) break;
    if (cursorMs > rangeEndMs) break;
    if (cursorMs >= rangeStartMs) {
      const iso = new Date(cursorMs).toISOString();
      if (!exSet.has(iso)) {
        out.push({
          originalEventId: eventId, recurrenceId: `${eventId}#${count}`,
          startsAt: iso, endsAt: new Date(cursorMs + durationMs).toISOString(), isException: false,
        });
      }
    }
    count += 1;
    if (rule.count && count >= rule.count) break;
    cursorMs = nextOccurrence(cursorMs, rule.freq, interval, rule.byDay, rule.byMonthDay);
  }
  return out;
}

// DISCOVERY
function applyEventFilters(ev: Event, filters: SearchEventsFilters, upcomingOnly: boolean): boolean {
  if (upcomingOnly) { if (!isUpcoming(ev) && !isLive(ev)) return false; } else { if (!isPast(ev)) return false; }
  if (filters.tradition && ev.tradition !== filters.tradition) return false;
  if (filters.type && ev.type !== filters.type) return false;
  if (filters.language && ev.language !== filters.language) return false;
  if (filters.organizerId && ev.organizerId !== filters.organizerId) return false;
  if (filters.isFree !== undefined) {
    const isFree = !ev.price || ev.price.amount === 0;
    if (filters.isFree !== isFree) return false;
  }
  if (filters.tags && filters.tags.length > 0 && !filters.tags.every((t) => ev.tags.includes(t))) return false;
  if (filters.startsAfter && Date.parse(ev.startsAt) < Date.parse(filters.startsAfter)) return false;
  if (filters.startsBefore && Date.parse(ev.startsAt) > Date.parse(filters.startsBefore)) return false;
  return true;
}
export function getUpcomingEvents(filters: SearchEventsFilters = {}): Event[] {
  const all = Array.from(getStore().events.values()).filter((ev) => ev.isPublic && ev.status !== 'draft' && ev.status !== 'cancelled');
  return all.filter((ev) => applyEventFilters(ev, filters, true));
}
export function getPastEvents(filters: SearchEventsFilters = {}): Event[] {
  const all = Array.from(getStore().events.values()).filter((ev) => ev.isPublic && ev.status !== 'draft' && ev.status !== 'cancelled');
  return all.filter((ev) => applyEventFilters(ev, filters, false)).reverse();
}
export function getEvent(eventId: string): Event | null {
  const ev = getStore().events.get(eventId);
  if (!ev) return null;
  ev.views24h += 1;
  return attachRsvpCounts(ev);
}
export function getEventsByTradition(tradition: string, filters: SearchEventsFilters = {}): Event[] {
  return getUpcomingEvents({ ...filters, tradition });
}
export function getEventsByOrganizer(organizerId: string): Event[] {
  return Array.from(getStore().events.values())
    .filter((ev) => ev.organizerId === organizerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function searchEvents(query: string, filters: SearchEventsFilters = {}): Event[] {
  const q = query.trim().toLowerCase();
  if (!q) return getUpcomingEvents(filters);
  const candidates = Array.from(getStore().events.values()).filter((ev) => ev.isPublic && ev.status !== 'draft' && ev.status !== 'cancelled');
  const scored: { ev: Event; score: number }[] = [];
  for (const ev of candidates) {
    if (!applyEventFilters(ev, filters, true)) continue;
    let score = 0;
    if (ev.title.toLowerCase().includes(q)) score += 5;
    if (ev.description.toLowerCase().includes(q)) score += 2;
    if (ev.tradition.toLowerCase().includes(q)) score += 3;
    const org = getStore().organizers.get(ev.organizerId);
    if (org?.displayName.toLowerCase().includes(q)) score += 2;
    if (ev.tags.some((t) => t.toLowerCase().includes(q))) score += 1;
    if (score > 0) scored.push({ ev, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.ev);
}

// PAYOUT HOOK (stub for w50 integration)
export function payoutHook(eventId: string, organizerId: string, amount: number, currency: 'BRL' | 'USD' | 'EUR'): {
  queued: boolean; paymentId: string; scheduledFor: string; organizerId: string; amount: number; currency: 'BRL' | 'USD' | 'EUR';
} {
  const store = getStore();
  const ev = store.events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== organizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'organizerId diverge');
  const org = store.organizers.get(organizerId);
  if (!org?.payout) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'Organizador sem payout');
  if (!org.payout.enabled) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'Payout desabilitado');
  if (!Number.isInteger(amount) || amount <= 0) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'amount inteiro positivo (centavos)');
  const paymentId = newId('pay');
  if (typeof console !== 'undefined') console.info('[events] payoutHook', { eventId, organizerId, provider: org.payout.provider, amount, currency, paymentId });
  return { queued: true, paymentId, scheduledFor: nowIso(), organizerId, amount, currency };
}

// ANALYTICS
export function getEventAnalytics(eventId: string): EventAnalytics {
  const store = getStore();
  const ev = store.events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  const rsvpCount = Array.from(store.rsvps.values()).filter((r) => r.eventId === eventId).length;
  const report = getAttendanceReport(eventId);
  const waitlistPromotions = Array.from(store.rsvps.values()).filter((r) => r.eventId === eventId && r.promotedAt !== null).length;
  const cancellations = Array.from(store.rsvps.values()).filter((r) => r.eventId === eventId && r.status === 'declined').length;
  const views = ev.views24h;
  return {
    eventId, views, rsvps: rsvpCount,
    attendees: report.going + report.late, noShows: report.noShow,
    conversionRate: views === 0 ? 0 : +(rsvpCount / views).toFixed(3),
    waitlistPromotions, cancellationCount: cancellations,
  };
}

// REMINDERS (w43 hook)
export function sendEventReminder(eventId: string, scheduledFor: string): { eventId: string; scheduledFor: string; scheduledCount: number } {
  const store = getStore();
  const ev = store.events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  assertIsoDate(scheduledFor, 'scheduledFor');
  const count = Array.from(store.rsvps.values()).filter((r) => r.eventId === eventId && r.status === 'going').length;
  if (typeof console !== 'undefined') console.info('[events] sendEventReminder', { eventId, scheduledFor, recipientCount: count });
  return { eventId, scheduledFor, scheduledCount: count };
}

// TAGGING
export function tagEvent(eventId: string, byOrganizerId: string, tags: string[]): Event {
  const ev = getStore().events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (ev.organizerId !== byOrganizerId) throw new EventError(EVENT_ERROR_CODES.NOT_ORGANIZER, 'Apenas o organizador', { eventId });
  if (tags.length > MAX_TAGS_PER_EVENT) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, `máximo ${MAX_TAGS_PER_EVENT} tags`);
  ev.tags = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
  ev.updatedAt = nowIso();
  return ev;
}

// MODERATION (w45 hook)
export function moderateEvent(eventId: string, action: ModerationAction): { eventId: string; applied: ModerationAction['action']; appliedAt: string; notifyOrganizer: boolean; } {
  const store = getStore();
  const ev = store.events.get(eventId);
  if (!ev) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  const now = nowIso();
  switch (action.action) {
    case 'unpublish': ev.isPublic = false; ev.status = 'draft'; break;
    case 'delete': store.events.delete(eventId); break;
    case 'flag_for_review': ev.tags = Array.from(new Set([...ev.tags, '__flagged__'])); break;
    case 'clear': ev.tags = ev.tags.filter((t) => t !== '__flagged__'); break;
  }
  if (typeof console !== 'undefined') console.info('[events] moderateEvent', { eventId, action: action.action, byAdminId: action.byAdminId, reason: action.reason });
  return { eventId, applied: action.action, appliedAt: now, notifyOrganizer: action.notifyOrganizer };
}

// REPORTS
export function reportEvent(eventId: string, byUserId: string, reason: ReportReason): EventReport {
  const store = getStore();
  if (!store.events.has(eventId)) throw new EventError(EVENT_ERROR_CODES.NOT_FOUND, 'Evento não encontrado', { eventId });
  if (!reason.category) throw new EventError(EVENT_ERROR_CODES.INVALID_INPUT, 'reason.category obrigatório');
  const report: EventReport = { id: newId('rep'), eventId, reporterId: byUserId, reason, createdAt: nowIso(), resolved: false };
  store.reports.set(report.id, report);
  return report;
}
export function listEventReports(eventId: string): EventReport[] {
  return Array.from(getStore().reports.values()).filter((r) => r.eventId === eventId);
}

// DISCOVERY: MUTUAL EVENTS
export function getMutualEvents(userIdA: string, userIdB: string): Event[] {
  if (!userIdA || !userIdB || userIdA === userIdB) return [];
  const store = getStore();
  const a = new Set<string>();
  const b = new Set<string>();
  for (const r of store.rsvps.values()) {
    if (r.status !== 'going') continue;
    if (r.userId === userIdA) a.add(r.eventId);
    if (r.userId === userIdB) b.add(r.eventId);
  }
  const intersection: Event[] = [];
  for (const id of a) {
    if (!b.has(id)) continue;
    const ev = store.events.get(id);
    if (ev) intersection.push(attachRsvpCounts(ev));
  }
  return intersection.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

// PUBLIC DTOs
export interface PublicEventDto {
  id: string;
  title: string;
  description: string;
  type: EventType;
  tradition: string;
  tags: string[];
  timezone: string;
  startsAt: string;
  endsAt: string;
  isFree: boolean;
  capacity: number;
  isPublic: boolean;
  coverImageUrl: string | null;
  organizer: { id: string; displayName: string; verification: VerificationLevel; };
  sessionCount: number;
  rsvpCounts: RsvpCounts;
}
export function toPublicDto(ev: Event): PublicEventDto {
  const org = getStore().organizers.get(ev.organizerId);
  return {
    id: ev.id, title: ev.title, description: ev.description, type: ev.type,
    tradition: ev.tradition, tags: [...ev.tags], timezone: ev.timezone,
    startsAt: ev.startsAt, endsAt: ev.endsAt,
    isFree: !ev.price || ev.price.amount === 0,
    capacity: ev.capacity, isPublic: ev.isPublic,
    coverImageUrl: ev.coverImageUrl,
    organizer: { id: ev.organizerId, displayName: org?.displayName ?? ev.organizerId, verification: org?.verification ?? 'none' },
    sessionCount: ev.sessions.length,
    rsvpCounts: ev.rsvpCounts ?? { going: 0, maybe: 0, waitlist: 0, declined: 0 },
  };
}

// END — events-workshops (Wave 47). 40+ runtime exports, all required APIs above.
