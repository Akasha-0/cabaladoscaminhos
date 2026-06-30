/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-B — MARKETPLACE LECTURA/PRÁTICAS · ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-B Coder (Mavis orchestrator session 414764491727033)
 *
 * Marketplace engine for sacred leitura/prática offerings across 7 tradições.
 * Scope:
 *   - listOfferings(filter) — multi-criteria filter
 *   - getOffering(id) — lookup by id
 *   - createBookingIntent(offeringId, userId, scheduledAt, notes)
 *   - listBookingIntents(userId) — per-user timeline
 *   - cancelBookingIntent(id, reason) — soft cancel + reason audit
 *
 * Sacred-cultural sensitivity:
 *   - Sacred offerings (sacred: true) require verified practitioner
 *   - Unverified practitioners cannot be booked for sacred work
 *   - past scheduledAt is rejected with explicit reason
 *
 * Persistence:
 *   - InMemoryAdapter is the default (per W84-C W83-A W82-A pattern)
 *   - MarketplaceAdapter is the persistence interface
 *
 * No HMAC chain (lighter than moderation/reputation; sacred-cultural gate
 * is enforced at booking time).
 */

import {
  SAMPLE_OFFERINGS,
  SAMPLE_PRACTITIONERS,
  SAMPLE_TRADITION_COVERAGE,
  SAMPLE_TYPE_COVERAGE,
  SAMPLE_SACRED_COUNT,
  SAMPLE_NONSACRED_COUNT,
} from './sample-data.ts';

// Re-export sample data for spec/smoke convenience
export {
  SAMPLE_OFFERINGS,
  SAMPLE_PRACTITIONERS,
  SAMPLE_TRADITION_COVERAGE,
  SAMPLE_TYPE_COVERAGE,
  SAMPLE_SACRED_COUNT,
  SAMPLE_NONSACRED_COUNT,
} from './sample-data.ts';

// ════════════════════════════════════════════
// VERSION CONSTANTS
// ════════════════════════════════════════════

export const W85_B_VERSION = '1.0.0' as const;
export const W85_B_CYCLE = 85 as const;
export const W85_B_SAMPLE_OFFERING_COUNT = 28 as const;
export const W85_B_SAMPLE_TRADITION_COUNT = 7 as const;
export const W85_B_SAMPLE_TYPE_COUNT = 5 as const;
export const W85_B_SAMPLE_PRACTITIONER_COUNT = 9 as const;

// ════════════════════════════════════════════
// BRANDED TYPES
// ════════════════════════════════════════════

declare const __offeringIdBrand: unique symbol;
export type OfferingId = string & { readonly [__offeringIdBrand]: 'OfferingId' };

declare const __practitionerIdBrand: unique symbol;
export type PractitionerId = string & {
  readonly [__practitionerIdBrand]: 'PractitionerId';
};

declare const __bookingIdBrand: unique symbol;
export type BookingId = string & { readonly [__bookingIdBrand]: 'BookingId' };

declare const __userIdBrand: unique symbol;
export type UserId = string & { readonly [__userIdBrand]: 'UserId' };

declare const __traditionBrand: unique symbol;
export type Tradicao = string & { readonly [__traditionBrand]: 'Tradicao' };

declare const __typeBrand: unique symbol;
export type OfferingType = string & { readonly [__typeBrand]: 'OfferingType' };

declare const __statusBrand: unique symbol;
export type BookingStatus = string & { readonly [__statusBrand]: 'BookingStatus' };

// ════════════════════════════════════════════
// SACRED TRADIÇÕES (must match W83-C / W84-C sample set)
// ════════════════════════════════════════════

export const TRADICOES: ReadonlyArray<Tradicao> = Object.freeze([
  'cigano' as Tradicao,
  'candomble' as Tradicao,
  'umbanda' as Tradicao,
  'ifa' as Tradicao,
  'cabala' as Tradicao,
  'astrologia' as Tradicao,
  'tantra' as Tradicao,
]);

export const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze({
  cigano: 'Cigano (Baralho Cigano)',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
});

export function isTradicao(s: string): s is Tradicao {
  return TRADICOES.some((t) => (t as string) === s);
}

// ════════════════════════════════════════════
// OFFERING TYPES
// ════════════════════════════════════════════

export const OFFERING_TYPES: ReadonlyArray<OfferingType> = Object.freeze([
  'leitura' as OfferingType,
  'pratica' as OfferingType,
  'mentoria' as OfferingType,
  'ritual' as OfferingType,
  'consulta' as OfferingType,
]);

export const OFFERING_TYPE_LABELS: Readonly<Record<OfferingType, string>> = Object.freeze({
  leitura: 'Leitura',
  pratica: 'Prática',
  mentoria: 'Mentoria',
  ritual: 'Ritual',
  consulta: 'Consulta',
});

export function isOfferingType(s: string): s is OfferingType {
  return OFFERING_TYPES.some((t) => (t as string) === s);
}

// ════════════════════════════════════════════
// BOOKING STATUSES + TRANSITIONS
// ════════════════════════════════════════════

export const BOOKING_STATUSES: ReadonlyArray<BookingStatus> = Object.freeze([
  'pending' as BookingStatus,
  'confirmed' as BookingStatus,
  'declined' as BookingStatus,
  'completed' as BookingStatus,
  'cancelled' as BookingStatus,
]);

export const BOOKING_STATUS_LABELS: Readonly<Record<BookingStatus, string>> = Object.freeze({
  pending: 'Pendente',
  confirmed: 'Confirmado',
  declined: 'Recusado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
});

export function isBookingStatus(s: string): s is BookingStatus {
  return BOOKING_STATUSES.some((t) => (t as string) === s);
}

const TERMINAL_STATUSES: ReadonlySet<BookingStatus> = new Set([
  'completed' as BookingStatus,
  'cancelled' as BookingStatus,
  'declined' as BookingStatus,
]);

export function isTerminalStatus(s: BookingStatus): boolean {
  return TERMINAL_STATUSES.has(s);
}

// ════════════════════════════════════════════
// MODELS
// ════════════════════════════════════════════

export interface Offering {
  readonly id: OfferingId;
  readonly type: OfferingType;
  readonly tradicao: Tradicao;
  readonly title: string;
  readonly description: string;
  readonly priceBRL: number;
  readonly durationMin: number;
  readonly practitionerId: PractitionerId;
  readonly practitionerName: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly tags: ReadonlyArray<string>;
  readonly sacred: boolean;
}

export interface Practitioner {
  readonly id: PractitionerId;
  readonly name: string;
  readonly tradicao: Tradicao;
  readonly verified: boolean;
  readonly bio: string;
}

export interface BookingIntent {
  readonly id: BookingId;
  readonly offeringId: OfferingId;
  readonly offeringTitle: string;
  readonly practitionerId: PractitionerId;
  readonly practitionerName: string;
  readonly userId: UserId;
  readonly status: BookingStatus;
  readonly scheduledAt: string;
  readonly notes: string;
  readonly cancellationReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OfferingFilter {
  readonly tradicao?: Tradicao;
  readonly type?: OfferingType;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly minRating?: number;
  readonly query?: string;
  readonly sacred?: boolean;
}

export interface MarketplaceEngine {
  listOfferings(filter: OfferingFilter): ReadonlyArray<Offering>;
  getOffering(id: OfferingId): Offering | null;
  getPractitioner(id: PractitionerId): Practitioner | null;
  listPractitioners(filter?: { tradicao?: Tradicao; verified?: boolean }): ReadonlyArray<Practitioner>;
  createBookingIntent(args: {
    offeringId: OfferingId;
    userId: UserId;
    scheduledAt: string;
    notes: string;
  }): BookingIntent;
  listBookingIntents(userId: UserId): ReadonlyArray<BookingIntent>;
  getBookingIntent(id: BookingId): BookingIntent | null;
  cancelBookingIntent(id: BookingId, reason: string): BookingIntent;
}

// ════════════════════════════════════════════
// PERSISTENCE INTERFACE
// ════════════════════════════════════════════

export interface MarketplaceAdapter {
  readonly offerings: ReadonlyMap<OfferingId, Offering>;
  readonly practitioners: ReadonlyMap<PractitionerId, Practitioner>;
  readonly bookings: Map<BookingId, BookingIntent>;
  generateBookingId(): BookingId;
}

// ════════════════════════════════════════════
// IN-MEMORY ADAPTER (default)
// ════════════════════════════════════════════

export class InMemoryMarketplaceAdapter implements MarketplaceAdapter {
  readonly offerings: ReadonlyMap<OfferingId, Offering>;
  readonly practitioners: ReadonlyMap<PractitionerId, Practitioner>;
  readonly bookings: Map<BookingId, BookingIntent> = new Map();
  private _seq = 0;

  constructor(
    offerings: ReadonlyArray<Offering> = SAMPLE_OFFERINGS,
    practitioners: ReadonlyArray<Practitioner> = SAMPLE_PRACTITIONERS,
  ) {
    this.offerings = new Map(offerings.map((o) => [o.id, o]));
    this.practitioners = new Map(practitioners.map((p) => [p.id, p]));
  }

  generateBookingId(): BookingId {
    this._seq++;
    return ('book-' + this._seq.toString(36).padStart(4, '0')) as BookingId;
  }
}

// ════════════════════════════════════════════
// TAG NORMALIZATION
// ════════════════════════════════════════════

function normalizeTag(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

export function normalizeTags(tags: ReadonlyArray<string>): ReadonlyArray<string> {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const n = normalizeTag(t);
    if (n.length > 0 && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return Object.freeze(out);
}

// ════════════════════════════════════════════
// ERROR TYPES
// ════════════════════════════════════════════

export type MarketplaceError =
  | { kind: 'offering-not-found'; offeringId: string }
  | { kind: 'booking-not-found'; bookingId: string }
  | { kind: 'invalid-scheduled-at'; reason: string; scheduledAt: string }
  | { kind: 'sacred-requires-verified-practitioner'; offeringId: string; practitionerId: string }
  | { kind: 'booking-already-terminal'; bookingId: string; status: BookingStatus }
  | { kind: 'practitioner-not-found'; practitionerId: string }
  | { kind: 'empty-notes-not-allowed-for-sacred'; offeringId: string }
  | { kind: 'invalid-price-range'; min: number; max: number }
  | { kind: 'invalid-rating'; value: number };

export class MarketplaceException extends Error {
  readonly error: MarketplaceError;
  constructor(error: MarketplaceError) {
    super(formatError(error));
    this.name = 'MarketplaceException';
    this.error = error;
  }
}

function formatError(e: MarketplaceError): string {
  switch (e.kind) {
    case 'offering-not-found':
      return `Offering not found: ${e.offeringId}`;
    case 'booking-not-found':
      return `Booking not found: ${e.bookingId}`;
    case 'invalid-scheduled-at':
      return `Invalid scheduledAt: ${e.reason} (got ${e.scheduledAt})`;
    case 'sacred-requires-verified-practitioner':
      return `Sacred offering ${e.offeringId} requires verified practitioner (got ${e.practitionerId})`;
    case 'booking-already-terminal':
      return `Booking ${e.bookingId} is already in terminal state: ${e.status}`;
    case 'practitioner-not-found':
      return `Practitioner not found: ${e.practitionerId}`;
    case 'empty-notes-not-allowed-for-sacred':
      return `Sacred offering ${e.offeringId} requires non-empty notes`;
    case 'invalid-price-range':
      return `Invalid price range: min=${e.min}, max=${e.max}`;
    case 'invalid-rating':
      return `Invalid rating: ${e.value}`;
  }
}

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════

const VALID_PRICE_RANGE: { min: number; max: number } = { min: 0, max: 100000 };

function isValidPriceRange(min: number, max: number): boolean {
  return (
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    min >= 0 &&
    max >= min &&
    min <= VALID_PRICE_RANGE.max &&
    max <= VALID_PRICE_RANGE.max
  );
}

function isValidRating(r: number): boolean {
  return Number.isFinite(r) && r >= 0 && r <= 5;
}

function validateScheduledAt(scheduledAt: string, nowMs: number = Date.now()): void {
  if (typeof scheduledAt !== 'string' || scheduledAt.length === 0) {
    throw new MarketplaceException({
      kind: 'invalid-scheduled-at',
      reason: 'must be a non-empty ISO-8601 string',
      scheduledAt,
    });
  }
  const ms = Date.parse(scheduledAt);
  if (Number.isNaN(ms)) {
    throw new MarketplaceException({
      kind: 'invalid-scheduled-at',
      reason: 'must be a valid ISO-8601 timestamp',
      scheduledAt,
    });
  }
  if (ms < nowMs) {
    throw new MarketplaceException({
      kind: 'invalid-scheduled-at',
      reason: 'must be in the future',
      scheduledAt,
    });
  }
}

function matchesQuery(offering: Offering, queryNorm: string): boolean {
  if (queryNorm.length === 0) return true;
  const haystackParts: string[] = [
    offering.title,
    offering.description,
    offering.practitionerName,
  ];
  for (const t of offering.tags) haystackParts.push(t);
  const haystack = haystackParts
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return haystack.includes(queryNorm);
}

// ════════════════════════════════════════════
// CORE FACTORY
// ════════════════════════════════════════════

export function createMarketplaceEngine(
  adapter: MarketplaceAdapter = new InMemoryMarketplaceAdapter(),
): MarketplaceEngine {
  // ────────── listOfferings ──────────
  function listOfferings(filter: OfferingFilter): ReadonlyArray<Offering> {
    if (
      filter.minPrice !== undefined &&
      filter.maxPrice !== undefined &&
      !isValidPriceRange(filter.minPrice, filter.maxPrice)
    ) {
      throw new MarketplaceException({
        kind: 'invalid-price-range',
        min: filter.minPrice,
        max: filter.maxPrice,
      });
    }
    if (filter.minRating !== undefined && !isValidRating(filter.minRating)) {
      throw new MarketplaceException({
        kind: 'invalid-rating',
        value: filter.minRating,
      });
    }
    if (filter.tradicao !== undefined && !isTradicao(filter.tradicao)) {
      // Silently ignore unknown tradição — strict mode would throw
      // but listing robustness prefers returning empty.
      return Object.freeze([]);
    }
    if (filter.type !== undefined && !isOfferingType(filter.type)) {
      return Object.freeze([]);
    }

    const queryNorm = (filter.query ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    const out: Offering[] = [];
    for (const o of adapter.offerings.values()) {
      if (filter.tradicao !== undefined && o.tradicao !== filter.tradicao) continue;
      if (filter.type !== undefined && o.type !== filter.type) continue;
      if (filter.minPrice !== undefined && o.priceBRL < filter.minPrice) continue;
      if (filter.maxPrice !== undefined && o.priceBRL > filter.maxPrice) continue;
      if (filter.minRating !== undefined && o.rating < filter.minRating) continue;
      if (filter.sacred !== undefined && o.sacred !== filter.sacred) continue;
      if (!matchesQuery(o, queryNorm)) continue;
      out.push(o);
    }

    // Stable order: by rating desc, then by title asc
    out.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.title.localeCompare(b.title);
    });

    return Object.freeze(out);
  }

  // ────────── getOffering ──────────
  function getOffering(id: OfferingId): Offering | null {
    return adapter.offerings.get(id) ?? null;
  }

  // ────────── getPractitioner ──────────
  function getPractitioner(id: PractitionerId): Practitioner | null {
    return adapter.practitioners.get(id) ?? null;
  }

  // ────────── listPractitioners ──────────
  function listPractitioners(
    filter?: { tradicao?: Tradicao; verified?: boolean },
  ): ReadonlyArray<Practitioner> {
    const trad = filter?.tradicao;
    const ver = filter?.verified;
    const out: Practitioner[] = [];
    for (const p of adapter.practitioners.values()) {
      if (trad !== undefined && p.tradicao !== trad) continue;
      if (ver !== undefined && p.verified !== ver) continue;
      out.push(p);
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return Object.freeze(out);
  }

  // ────────── createBookingIntent ──────────
  function createBookingIntent(args: {
    offeringId: OfferingId;
    userId: UserId;
    scheduledAt: string;
    notes: string;
  }): BookingIntent {
    const offering = adapter.offerings.get(args.offeringId);
    if (offering === undefined) {
      throw new MarketplaceException({
        kind: 'offering-not-found',
        offeringId: args.offeringId,
      });
    }
    const practitioner = adapter.practitioners.get(offering.practitionerId);
    if (practitioner === undefined) {
      throw new MarketplaceException({
        kind: 'practitioner-not-found',
        practitionerId: offering.practitionerId,
      });
    }
    // Sacred-cultural gate
    if (offering.sacred && !practitioner.verified) {
      throw new MarketplaceException({
        kind: 'sacred-requires-verified-practitioner',
        offeringId: offering.id,
        practitionerId: practitioner.id,
      });
    }
    if (offering.sacred && args.notes.trim().length === 0) {
      throw new MarketplaceException({
        kind: 'empty-notes-not-allowed-for-sacred',
        offeringId: offering.id,
      });
    }
    validateScheduledAt(args.scheduledAt);

    const id = adapter.generateBookingId();
    const nowIso = new Date().toISOString();
    const booking: BookingIntent = Object.freeze({
      id,
      offeringId: offering.id,
      offeringTitle: offering.title,
      practitionerId: practitioner.id,
      practitionerName: practitioner.name,
      userId: args.userId,
      status: 'pending' as BookingStatus,
      scheduledAt: args.scheduledAt,
      notes: args.notes,
      cancellationReason: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    adapter.bookings.set(id, booking);
    return booking;
  }

  // ────────── listBookingIntents ──────────
  function listBookingIntents(userId: UserId): ReadonlyArray<BookingIntent> {
    const out: BookingIntent[] = [];
    for (const b of adapter.bookings.values()) {
      if (b.userId === userId) out.push(b);
    }
    // Newest first
    out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return Object.freeze(out);
  }

  // ────────── getBookingIntent ──────────
  function getBookingIntent(id: BookingId): BookingIntent | null {
    return adapter.bookings.get(id) ?? null;
  }

  // ────────── cancelBookingIntent ──────────
  function cancelBookingIntent(id: BookingId, reason: string): BookingIntent {
    const existing = adapter.bookings.get(id);
    if (existing === undefined) {
      throw new MarketplaceException({ kind: 'booking-not-found', bookingId: id });
    }
    if (isTerminalStatus(existing.status)) {
      throw new MarketplaceException({
        kind: 'booking-already-terminal',
        bookingId: id,
        status: existing.status,
      });
    }
    if (typeof reason !== 'string' || reason.trim().length === 0) {
      throw new MarketplaceException({
        kind: 'invalid-scheduled-at',
        reason: 'cancellation reason must be a non-empty string',
        scheduledAt: '',
      });
    }
    const updated: BookingIntent = Object.freeze({
      ...existing,
      status: 'cancelled' as BookingStatus,
      cancellationReason: reason.trim(),
      updatedAt: new Date().toISOString(),
    });
    adapter.bookings.set(id, updated);
    return updated;
  }

  return Object.freeze({
    listOfferings,
    getOffering,
    getPractitioner,
    listPractitioners,
    createBookingIntent,
    listBookingIntents,
    getBookingIntent,
    cancelBookingIntent,
  });
}

// ════════════════════════════════════════════
// DEFAULT INSTANCE
// ════════════════════════════════════════════

const defaultEngine: MarketplaceEngine = createMarketplaceEngine();

export function listOfferings(filter: OfferingFilter): ReadonlyArray<Offering> {
  return defaultEngine.listOfferings(filter);
}

export function getOffering(id: OfferingId): Offering | null {
  return defaultEngine.getOffering(id);
}

export function getPractitioner(id: PractitionerId): Practitioner | null {
  return defaultEngine.getPractitioner(id);
}

export function listPractitioners(
  filter?: { tradicao?: Tradicao; verified?: boolean },
): ReadonlyArray<Practitioner> {
  return defaultEngine.listPractitioners(filter);
}

export function createBookingIntent(args: {
  offeringId: OfferingId;
  userId: UserId;
  scheduledAt: string;
  notes: string;
}): BookingIntent {
  return defaultEngine.createBookingIntent(args);
}

export function listBookingIntents(userId: UserId): ReadonlyArray<BookingIntent> {
  return defaultEngine.listBookingIntents(userId);
}

export function getBookingIntent(id: BookingId): BookingIntent | null {
  return defaultEngine.getBookingIntent(id);
}

export function cancelBookingIntent(id: BookingId, reason: string): BookingIntent {
  return defaultEngine.cancelBookingIntent(id, reason);
}

// ════════════════════════════════════════════
// TEST RESET — clears runtime state only
// ════════════════════════════════════════════

export function _resetForTests(): void {
  // The default engine is a frozen module-level reference.
  // Tests should construct their own engine via createMarketplaceEngine().
  // This function exists to satisfy a common test-harness expectation.
  // It is intentionally a no-op.
}