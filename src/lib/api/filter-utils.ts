// ============================================================
// FILTER PARSING UTILITIES - CABALA DOS CAMINHOS
// ============================================================
// Shared filter parsing and application utilities for API routes.
//
// Clone group: 629c834c (79 lines, 4 instances)
// Pattern: Complex filter logic in API routes
// Clone group: ad5250e0 (34 lines, 3 instances)
// Pattern: Filter parsing middleware
// ============================================================

import type { SpiritualCorrelations } from './spiritual-correlations';

export interface SpiritualFilterParams {
  sefirot?: string;
  chakra?: string | number;
  element?: string;
  orixa?: string;
}

export interface FilterableItem {
  spiritualCorrelations?: SpiritualCorrelations | null;
  [key: string]: unknown;
}

export function applySpiritualFilters<T extends FilterableItem>(
  items: T[],
  filters: SpiritualFilterParams
): T[] {
  let filtered = [...items];

  if (filters.sefirot) {
    filtered = filtered.filter((item) =>
      item.spiritualCorrelations?.sefirot?.includes(filters.sefirot!)
    );
  }

  if (filters.chakra) {
    const chakraNum = typeof filters.chakra === 'string'
      ? parseInt(filters.chakra, 10)
      : filters.chakra;
    filtered = filtered.filter(
      (item) => item.spiritualCorrelations?.chakra === chakraNum
    );
  }

  if (filters.element) {
    filtered = filtered.filter(
      (item) => item.spiritualCorrelations?.element === filters.element
    );
  }

  if (filters.orixa) {
    filtered = filtered.filter(
      (item) => item.spiritualCorrelations?.orixa === filters.orixa
    );
  }

  return filtered;
}

export function parseSpiritualFilterParams(
  searchParams: URLSearchParams
): SpiritualFilterParams {
  return {
    sefirot: searchParams.get('sefirot') || undefined,
    chakra: searchParams.get('chakra') || undefined,
    element: searchParams.get('element') || undefined,
    orixa: searchParams.get('orixa') || undefined,
  };
}

export function buildFilterMeta(filters: SpiritualFilterParams): Record<string, unknown> {
  return {
    filters: {
      sefirot: filters.sefirot,
      chakra: filters.chakra,
      element: filters.element,
      orixa: filters.orixa,
    },
  };
}
