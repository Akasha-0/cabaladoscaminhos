/**
 * w31/events-detail
 *
 * Builds the canonical "event detail" view-model from raw event + ticket
 * tier + facilitator data. Aggregates w27/events-workshops (event core)
 * with w28/events-discovery (search/filter metadata) to produce a single
 * payload that the /events/[id] page can render without re-querying.
 *
 * PURE module: transforms + aggregates. No I/O.
 */

export type EventModality = "presencial" | "online" | "hibrido";
export type EventStatus = "draft" | "upcoming" | "live" | "past" | "cancelled";

export interface EventWorkshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  facilitatorIds: string[];
  modality: EventModality;
  status: EventStatus;
  cancelled: boolean;
  tradition: string;
  topics: string[];
  language: "pt-BR" | "en" | "es";
  createdAt: string;
  updatedAt: string;
}

export interface EventDiscoveryFacet {
  field: "tradition" | "modality" | "language" | "price" | "topic";
  values: { value: string; count: number }[];
}

export interface EventDiscoveryHit {
  eventId: string;
  score: number;
  matchedFacets: string[];
}

export interface FacilitatorProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  traditions: string[];
  ratingAvg: number;
  ratingCount: number;
  guidesCount: number;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  description: string;
  priceCents: number;
  currency: "BRL" | "USD" | "EUR";
  capacity: number;
  sold: number;
  salesEndsAt: string | null;
  perks: string[];
}

export interface EventSession {
  id: string;
  eventId: string;
  startsAt: string;
  endsAt: string;
  title: string;
  description: string;
  modality: EventModality;
  location: string | null;
  streamUrl: string | null;
}

export interface EventReview {
  id: string;
  eventId: string;
  authorId: string;
  authorDisplayName: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface EventDetail {
  event: EventWorkshop;
  facilitators: FacilitatorProfile[];
  tiers: TicketTier[];
  sessions: EventSession[];
  reviews: EventReview[];
  summary: {
    nextSessionAt: string | null;
    totalCapacity: number;
    totalSold: number;
    occupancyPercent: number;
    lowestPriceCents: number;
    highestPriceCents: number;
    averageRating: number;
    reviewCount: number;
    hasLiveStream: boolean;
    status: EventStatus;
  };
  related: EventDiscoveryHit[];
  facets: EventDiscoveryFacet[];
}

export function deriveStatus(
  event: EventWorkshop,
  sessions: EventSession[],
  now: Date = new Date(),
): EventStatus {
  if (event.cancelled) return "cancelled";
  const sessionDates = sessions.map((s) => new Date(s.startsAt).getTime());
  if (sessionDates.length === 0) return event.status ?? "draft";
  const first = Math.min(...sessionDates);
  const last = Math.max(...sessionDates.map((d, i) => {
    const end = sessions[i]?.endsAt;
    return end ? new Date(end).getTime() : d;
  }));
  const t = now.getTime();
  if (t < first) return "upcoming";
  if (t >= first && t <= last) return "live";
  return "past";
}

export function computeOccupancy(tiers: TicketTier[]): { sold: number; capacity: number; pct: number } {
  const sold = tiers.reduce((a, t) => a + t.sold, 0);
  const capacity = tiers.reduce((a, t) => a + t.capacity, 0);
  const pct = capacity === 0 ? 0 : Math.min(100, Math.round((sold / capacity) * 100));
  return { sold, capacity, pct };
}

export function computePriceRange(tiers: TicketTier[]): { lo: number; hi: number } {
  if (tiers.length === 0) return { lo: 0, hi: 0 };
  const prices = tiers.map((t) => t.priceCents);
  return {
    lo: Math.min(...prices),
    hi: Math.max(...prices),
  };
}

export function computeAverageRating(reviews: EventReview[]): { avg: number; count: number } {
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return { avg: sum / reviews.length, count: reviews.length };
}

export function nextSession(sessions: EventSession[], now: Date = new Date()): EventSession | null {
  const t = now.getTime();
  const upcoming = sessions
    .filter((s) => new Date(s.startsAt).getTime() >= t)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  return upcoming[0] ?? null;
}

export function buildEventDetail(args: {
  event: EventWorkshop;
  facilitators: FacilitatorProfile[];
  tiers: TicketTier[];
  sessions: EventSession[];
  reviews: EventReview[];
  related?: EventDiscoveryHit[];
  facets?: EventDiscoveryFacet[];
  now?: Date;
}): EventDetail {
  const now = args.now ?? new Date();
  const occ = computeOccupancy(args.tiers);
  const price = computePriceRange(args.tiers);
  const rating = computeAverageRating(args.reviews);
  const next = nextSession(args.sessions, now);
  const status = deriveStatus(args.event, args.sessions, now);
  const hasLiveStream = args.sessions.some((s) => s.modality === "online" && !!s.streamUrl);

  return {
    event: { ...args.event, status },
    facilitators: args.facilitators,
    tiers: args.tiers,
    sessions: args.sessions,
    reviews: args.reviews,
    summary: {
      nextSessionAt: next?.startsAt ?? null,
      totalCapacity: occ.capacity,
      totalSold: occ.sold,
      occupancyPercent: occ.pct,
      lowestPriceCents: price.lo,
      highestPriceCents: price.hi,
      averageRating: rating.avg,
      reviewCount: rating.count,
      hasLiveStream,
      status,
    },
    related: args.related ?? [],
    facets: args.facets ?? [],
  };
}

export function ctaForEvent(detail: EventDetail, now: Date = new Date()): {
  label: string;
  disabled: boolean;
  reason: string | null;
} {
  if (detail.summary.status === "cancelled") {
    return { label: "Evento cancelado", disabled: true, reason: "cancelled" };
  }
  if (detail.summary.status === "past") {
    return { label: "Evento encerrado", disabled: true, reason: "past" };
  }
  if (detail.summary.occupancyPercent >= 100) {
    return { label: "Esgotado", disabled: true, reason: "sold_out" };
  }
  if (detail.summary.status === "live") {
    return { label: "Entrar agora", disabled: false, reason: null };
  }
  return { label: "Garantir vaga", disabled: false, reason: null };
}

export function formatOccupancy(pct: number): string {
  if (pct >= 100) return "Esgotado";
  if (pct >= 80) return `Quase lotado — ${pct}%`;
  if (pct >= 50) return `${pct}% ocupado`;
  return `${pct}% ocupado`;
}

export function formatPriceRange(lo: number, hi: number, currency: "BRL" | "USD" | "EUR"): string {
  if (lo === 0 && hi === 0) return "—";
  if (lo === hi) return formatPrice(lo, currency);
  return `${formatPrice(lo, currency)} – ${formatPrice(hi, currency)}`;
}

function formatPrice(cents: number, currency: "BRL" | "USD" | "EUR"): string {
  const symbol = currency === "BRL" ? "R$" : currency === "USD" ? "$" : "€";
  const amount = (cents / 100).toFixed(2).replace(".", ",");
  return cents === 0 ? "Gratuito" : `${symbol} ${amount}`;
}
