/**
 * events-ticketing-calendar.ts
 *
 * Event ticketing, RSVP, waitlist management, and ICS calendar export (RFC 5545)
 * for Akasha Portal. Extends w31/events-workshops + w30/livestream +
 * w32/livestream-recording with: tiered ticketing, free/paid flows, capacity
 * tracking, waitlist auto-promotion, and calendar download.
 *
 * Standalone module — no external imports. All types are local. Functional API
 * (pure where possible) with deterministic side-effects on input objects.
 */

// ============================================================================
// Types
// ============================================================================

/** A pricing tier for an event. Capacity is hard; sold/reserved are mutable. */
export interface TicketTier {
  /** Stable tier identifier (UUID / ULID). */
  tierId: string;
  /** Display name shown to buyers ("Early Bird", "VIP", "Social"). */
  name: string;
  /** Long-form description shown on the tier card. */
  description: string;
  /** Price in cents. 0 = free / cortesia. */
  priceCents: number;
  /** Maximum tickets that may be sold for this tier (hard cap). */
  capacity: number;
  /** Tickets confirmed sold (paid + reserved+confirmed). */
  sold: number;
  /** Tickets held temporarily (checkout pending). */
  reserved: number;
  /** Inclusions / perks list (e.g. "Bebida", "Acesso ao camarim"). */
  perks: string[];
  /** Display order; lower = appears first. */
  sortOrder: number;
}

/** A ticket purchased by a user for a specific event + tier. */
export interface EventTicket {
  /** Stable ticket identifier. */
  ticketId: string;
  /** Event this ticket grants access to. */
  eventId: string;
  /** Tier this ticket belongs to. */
  tierId: string;
  /** Buyer user id. */
  userId: string;
  /** Final price paid in cents (may differ from tier.priceCents after discount). */
  priceCents: number;
  /** Epoch ms when purchase completed. */
  purchasedAt: number;
  /** Lifecycle status of the ticket. */
  status: "valid" | "used" | "refunded" | "cancelled";
  /** QR code payload — prefixed with QR_CODE_PREFIX so check-in scanners parse it. */
  qrCode: string;
}

/** An RSVP response for an event (free-tier / no-payment attendees). */
export interface RsvpEntry {
  /** Stable RSVP identifier. */
  rsvpId: string;
  /** Event being responded to. */
  eventId: string;
  /** Responder user id. */
  userId: string;
  /** Intent / outcome of the response. */
  status: "going" | "maybe" | "not_going" | "waitlist";
  /** Epoch ms of the latest response. */
  respondedAt: number;
  /** Number of guests the user is bringing (0..MAX_PLUS_ONES). */
  plusOnes: number;
  /** Optional free-form note shown to organizers only. */
  note?: string;
}

/** A user waiting for a sold-out tier to free up. */
export interface WaitlistEntry {
  /** Stable waitlist entry id. */
  waitlistId: string;
  /** Event for which the user is waiting. */
  eventId: string;
  /** Tier the user wants to join. */
  tierId: string;
  /** Waiting user id. */
  userId: string;
  /** 1-based position in queue (1 = next up). */
  position: number;
  /** Epoch ms when join was requested. */
  joinedAt: number;
  /** Epoch ms when user was notified of available slot (null until promoted). */
  notifiedAt?: number;
  /** Epoch ms when user was promoted to confirmed ticket (null until done). */
  promotedAt?: number;
}

/** RFC 5545 VEVENT shape (minimal subset Akasha actually uses). */
export interface IcsEvent {
  /** Stable UID for the event (must be unique per calendar). */
  uid: string;
  /** Short title (SUMMARY in ICS). */
  summary: string;
  /** Long-form description (DESCRIPTION in ICS). */
  description: string;
  /** Where the event happens (LOCATION in ICS). */
  location: string;
  /** Start time as epoch ms (UTC). */
  startUtc: number;
  /** End time as epoch ms (UTC). */
  endUtc: number;
  /** Organizer name + email ("Name <email@host>"). */
  organizer: string;
  /** RFC 5545 STATUS. */
  status: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
  /** Optional URL for the event page. */
  url?: string;
}

/** Top-level ICS calendar container. */
export interface IcsCalendar {
  /** X-WR-CALNAME — display name of the calendar. */
  calendarName: string;
  /** PRODID line per RFC 5545. */
  prodId: string;
  /** Events in this calendar. */
  events: IcsEvent[];
  /** Epoch ms when this snapshot was generated. */
  generatedAt: number;
}

/** Aggregated capacity summary across all tiers of an event. */
export interface EventCapacity {
  /** Event id. */
  eventId: string;
  /** Sum of capacity across all tiers. */
  totalCapacity: number;
  /** Sum of sold across all tiers. */
  totalSold: number;
  /** Sum of reserved (held, not paid) across all tiers. */
  totalReserved: number;
  /** Number of tickets that scanned-in successfully. */
  totalAttended: number;
  /** Seats still up for grabs (capacity - sold - reserved). */
  available: number;
  /** Number of users currently waiting. */
  waitlistSize: number;
  /** True when available <= 0. */
  soldOut: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/** PRODID line for Akasha events calendar. */
export const ICS_PROD_ID = "-//Akasha Portal//Events//PT-BR";

/** Format pattern used by formatIcsDate(). */
export const ICS_DATE_FORMAT = "YYYYMMDDTHHmmss[Z]";

/** Maximum tiers an event may expose (UI guard). */
export const MAX_TIERS_PER_EVENT = 5;

/** Maximum +1 guests a single RSVP may bring. */
export const MAX_PLUS_ONES = 3;

/** How many waitlist users a single promotion batch promotes. */
export const WAITLIST_AUTO_PROMOTE_BATCH = 3;

/** Prefix on every QR code payload for check-in scanner routing. */
export const QR_CODE_PREFIX = "akasha-event:";

/** Default event duration when caller doesn't specify (2 hours). */
export const EVENT_DEFAULT_DURATION_MS = 7200000;

// ============================================================================
// Tickets
// ============================================================================

/**
 * Build a new TicketTier with sensible defaults (no perks, sold/reserved=0,
 * sortOrder=0). Caller is responsible for assigning tierId.
 */
export function buildTicketTier(input: {
  tierId?: string;
  name: string;
  description: string;
  priceCents: number;
  capacity: number;
  perks?: string[];
  sortOrder?: number;
}): TicketTier {
  return {
    tierId: input.tierId ?? "",
    name: input.name,
    description: input.description,
    priceCents: input.priceCents,
    capacity: input.capacity,
    sold: 0,
    reserved: 0,
    perks: input.perks ?? [],
    sortOrder: input.sortOrder ?? 0,
  };
}

/**
 * Purchase a ticket from a tier. Pure-ish: returns updated copies rather than
 * mutating inputs. Refuses if the tier is sold out or not yet accepting sales.
 */
export function purchaseTicket(
  eventId: string,
  tier: TicketTier,
  userId: string,
  now: number,
): { ok: true; ticket: EventTicket; updatedTier: TicketTier } | { ok: false; reason: "sold_out" | "tier_closed" } {
  // Tier closed = free tier that closed RSVPs (sold == reserved == capacity).
  if (tier.sold + tier.reserved >= tier.capacity) {
    return { ok: false, reason: "sold_out" };
  }
  if (tier.capacity <= 0) {
    return { ok: false, reason: "tier_closed" };
  }
  const ticketId = `${eventId}-${tier.tierId}-${userId}-${now}`;
  const ticket: EventTicket = {
    ticketId,
    eventId,
    tierId: tier.tierId,
    userId,
    priceCents: tier.priceCents,
    purchasedAt: now,
    status: "valid",
    qrCode: `${QR_CODE_PREFIX}${ticketId}`,
  };
  const updatedTier: TicketTier = {
    ...tier,
    sold: tier.sold + 1,
  };
  return { ok: true, ticket, updatedTier };
}

/**
 * Refund a ticket. Returns the updated tier with sold decremented (capacity
 * reopens) and the ticket marked refunded. Idempotent: refunding an already
 * refunded ticket is a no-op.
 */
export function refundTicket(
  tier: TicketTier,
  ticket: EventTicket,
  now: number,
): { tier: TicketTier; ticket: EventTicket } {
  if (ticket.status === "refunded") {
    return { tier, ticket };
  }
  const updatedTicket: EventTicket = {
    ...ticket,
    status: "refunded",
  };
  const updatedTier: TicketTier = {
    ...tier,
    sold: Math.max(0, tier.sold - 1),
  };
  // Surface now so callers can audit; not stored on tier.
  void now;
  return { tier: updatedTier, ticket: updatedTicket };
}

// ============================================================================
// RSVP
// ============================================================================

/**
 * Create an RSVP entry. plusOnes is clamped to [0, MAX_PLUS_ONES].
 */
export function rsvp(
  eventId: string,
  userId: string,
  status: RsvpEntry["status"],
  plusOnes: number = 0,
  note?: string,
): RsvpEntry {
  const safePlusOnes = Math.max(0, Math.min(MAX_PLUS_ONES, Math.floor(plusOnes)));
  return {
    rsvpId: `${eventId}-${userId}-${Date.now()}`,
    eventId,
    userId,
    status,
    respondedAt: Date.now(),
    plusOnes: safePlusOnes,
    note,
  };
}

/**
 * Change the status (and optionally note) of an existing RSVP. The respondedAt
 * timestamp is refreshed to `now`.
 */
export function changeRsvp(
  entry: RsvpEntry,
  newStatus: RsvpEntry["status"],
  now: number,
): RsvpEntry {
  return {
    ...entry,
    status: newStatus,
    respondedAt: now,
  };
}

// ============================================================================
// Waitlist
// ============================================================================

/**
 * Append a user to a waitlist. Position is 1-based: position 1 = next up.
 */
export function joinWaitlist(
  eventId: string,
  tierId: string,
  userId: string,
  currentSize: number,
  now: number,
): { entry: WaitlistEntry; position: number } {
  const position = currentSize + 1;
  const entry: WaitlistEntry = {
    waitlistId: `${eventId}-${tierId}-${userId}-${now}`,
    eventId,
    tierId,
    userId,
    position,
    joinedAt: now,
  };
  return { entry, position };
}

/**
 * Promote the next `count` users off the waitlist (FIFO). Returns the promoted
 * entries (with notifiedAt + promotedAt stamped) and the remaining queue.
 * Promoted entries keep their position field for record-keeping.
 */
export function promoteFromWaitlist(
  waitlist: WaitlistEntry[],
  count: number,
  now: number,
): { promoted: WaitlistEntry[]; remaining: WaitlistEntry[] } {
  const take = Math.max(0, Math.min(count, waitlist.length));
  const sorted = [...waitlist].sort((a, b) => a.position - b.position);
  const promoted = sorted.slice(0, take).map((e): WaitlistEntry => ({
    ...e,
    notifiedAt: now,
    promotedAt: now,
  }));
  const remaining = sorted.slice(take);
  return { promoted, remaining };
}

// ============================================================================
// Capacity
// ============================================================================

/**
 * Compute aggregate capacity metrics for an event from its tiers, sold tickets,
 * and waitlist. `totalAttended` is derived from tickets whose status is "used".
 */
export function computeEventCapacity(
  eventId: string,
  tiers: TicketTier[],
  tickets: EventTicket[],
  waitlist: WaitlistEntry[],
): EventCapacity {
  const totalCapacity = tiers.reduce((sum, t) => sum + t.capacity, 0);
  const totalSold = tiers.reduce((sum, t) => sum + t.sold, 0);
  const totalReserved = tiers.reduce((sum, t) => sum + t.reserved, 0);
  const totalAttended = tickets.filter((t) => t.status === "used").length;
  const available = Math.max(0, totalCapacity - totalSold - totalReserved);
  return {
    eventId,
    totalCapacity,
    totalSold,
    totalReserved,
    totalAttended,
    available,
    waitlistSize: waitlist.length,
    soldOut: available === 0 && totalCapacity > 0,
  };
}

// ============================================================================
// ICS export
// ============================================================================

/**
 * Format an epoch-ms UTC timestamp as an ICS DATE-TIME string (RFC 5545 basic
 * form): "YYYYMMDDTHHmmssZ". Uses UTC explicitly.
 */
export function formatIcsDate(utcMs: number): string {
  const totalSeconds = Math.floor(utcMs / 1000);
  const ss = ((totalSeconds % 60) + 60) % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mm = ((totalMinutes % 60) + 60) % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hh = ((totalHours % 24) + 24) % 24;
  const dayTotal = Math.floor(totalHours / 24);
  const { y, m, d } = civilFromDays(dayTotal);
  const yyyy = y.toString().padStart(4, "0");
  const mo = m.toString().padStart(2, "0");
  const dd = d.toString().padStart(2, "0");
  const HH = hh.toString().padStart(2, "0");
  const MM = mm.toString().padStart(2, "0");
  const SS = ss.toString().padStart(2, "0");
  return `${yyyy}${mo}${dd}T${HH}${MM}${SS}Z`;
}

/** Internal: convert days-since-1970-01-01 into UTC y/m/d (Howard Hinnant's algorithm). */
function civilFromDays(z: number): { y: number; m: number; d: number } {
  const z2 = z + 719468;
  const era = Math.floor((z2 >= 0 ? z2 : z2 - 146096) / 146097);
  const doe = z2 - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return { y: m <= 2 ? y + 1 : y, m, d };
}

/**
 * Build a single IcsEvent with sane defaults. If `endUtc` < `startUtc`, the
 * end is auto-extended to startUtc + EVENT_DEFAULT_DURATION_MS.
 */
export function buildIcsEvent(input: {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startUtc: number;
  endUtc: number;
  organizer: string;
  url?: string;
  status?: IcsEvent["status"];
}): IcsEvent {
  const startUtc = input.startUtc;
  const endUtc = input.endUtc >= input.startUtc ? input.endUtc : input.startUtc + EVENT_DEFAULT_DURATION_MS;
  return {
    uid: input.uid,
    summary: input.summary,
    description: input.description,
    location: input.location,
    startUtc,
    endUtc,
    organizer: input.organizer,
    status: input.status ?? "CONFIRMED",
    url: input.url,
  };
}

/**
 * Build a calendar container (no string serialization yet — use exportIcsCalendar).
 */
export function buildIcsCalendar(calendarName: string, events: IcsEvent[]): IcsCalendar {
  return {
    calendarName,
    prodId: ICS_PROD_ID,
    events: [...events],
    generatedAt: Date.now(),
  };
}

/**
 * Escape an ICS text value per RFC 5545 section 3.3.11.
 * Backslash, semicolon, and comma get backslash-escaped; newlines become `\n`.
 */
function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * Serialize a calendar into a full RFC 5545 VCALENDAR document.
 * Line folding is intentionally omitted for v1 (acceptable per spec for
 * calendar apps tolerant of <75 octet lines).
 */
export function exportIcsCalendar(calendar: IcsCalendar): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:${calendar.prodId}`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push(`X-WR-CALNAME:${icsEscape(calendar.calendarName)}`);
  for (const ev of calendar.events) {
    lines.push(...serializeEvent(ev));
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/**
 * Serialize a single IcsEvent as a standalone ICS document (with VCALENDAR
 * wrapper). Useful for "Download single event" buttons.
 */
export function exportSingleEventIcs(event: IcsEvent): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:${ICS_PROD_ID}`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push(...serializeEvent(event));
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/** Internal: serialize one IcsEvent into VEVENT lines (no VCALENDAR wrapper). */
function serializeEvent(ev: IcsEvent): string[] {
  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${ev.uid}`);
  lines.push(`DTSTAMP:${formatIcsDate(Date.now())}`);
  lines.push(`DTSTART:${formatIcsDate(ev.startUtc)}`);
  lines.push(`DTEND:${formatIcsDate(ev.endUtc)}`);
  lines.push(`SUMMARY:${icsEscape(ev.summary)}`);
  lines.push(`DESCRIPTION:${icsEscape(ev.description)}`);
  lines.push(`LOCATION:${icsEscape(ev.location)}`);
  lines.push(`STATUS:${ev.status}`);
  lines.push(`ORGANIZER:${icsEscape(ev.organizer)}`);
  if (ev.url) {
    lines.push(`URL:${icsEscape(ev.url)}`);
  }
  lines.push("END:VEVENT");
  return lines;
}
