// src/lib/w28/events-discovery.ts
// Cycle 28 — Events discovery page (list + filters).
// Extends w27/events-workshops (WorkshopEvent domain) with search/filter/sort types.

import type { WorkshopEvent } from "@/lib/w27/events-workshops";

export type EventCategory = "circulo" | "ritual" | "meditacao" | "curso" | "terapia";
export type EventModality = "presencial" | "online" | "hibrido";
export type EventPriceFilter = "gratuito" | "pago" | "qualquer";

export interface EventFilters {
  query: string;
  category: EventCategory | "todas";
  modality: EventModality | "qualquer";
  priceFilter: EventPriceFilter;
  startDate: string | null; // ISO date
  endDate: string | null;
  cityId: string | null;
}

export type EventSort = "data_proxima" | "data_futura" | "preco_asc" | "preco_desc" | "popularidade";

export interface EventsDiscoveryResult {
  events: WorkshopEvent[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  query: "",
  category: "todas",
  modality: "qualquer",
  priceFilter: "qualquer",
  startDate: null,
  endDate: null,
  cityId: null,
};

export const DEFAULT_EVENT_SORT: EventSort = "data_proxima";

/** Pure filter — runs client-side or server-side. */
export function filterEvents(
  events: WorkshopEvent[],
  filters: EventFilters,
  sort: EventSort
): WorkshopEvent[] {
  const filtered = events.filter((e) => {
    if (filters.query && !e.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
    if (filters.category !== "todas" && e.category !== filters.category) return false;
    if (filters.modality !== "qualquer" && e.modality !== filters.modality) return false;
    if (filters.priceFilter === "gratuito" && e.priceCents > 0) return false;
    if (filters.priceFilter === "pago" && e.priceCents === 0) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (sort === "data_proxima") return a.startsAt.localeCompare(b.startsAt);
    if (sort === "preco_asc") return a.priceCents - b.priceCents;
    if (sort === "preco_desc") return b.priceCents - a.priceCents;
    return 0;
  });
}
