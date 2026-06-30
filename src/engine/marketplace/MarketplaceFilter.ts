/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-B — MARKETPLACE · FILTER COMPOSE (UI-side)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 86 · 2026-06-30
 * Author: W86-B Coder (Mavis orchestrator session 414771624312944)
 *
 * Composable multi-criteria filter for the /marketplace page. Sits on top of
 * the W85-B engine's `listOfferings(filter)` to provide UI-side composition
 * for facets that the engine does not own (price range slider, debounced
 * text search, tag intersection, sacred-only toggle, verified-only toggle).
 *
 * Composition rule: ALL filters AND-compose. A predicate that returns `true`
 * is a no-op (passes everything). A predicate that returns `false` excludes.
 *
 * Patterns:
 *   - `composeFilters(f1, f2, f3)(items)` → `items` filtered by all three
 *   - `intersectTags(offering, selectedTags)` → tag set-membership check
 *   - `normalizeQuery(s)` → NFD + lowercase + trim (mirrors engine search)
 *
 * Why a separate compose layer?
 *   - Engine exposes typed `OfferingFilter` for persistence-tier filtering.
 *   - Page UI needs *additional* facets that are pure presentation:
 *     tag multi-select, verified-only, sacred-only.
 *   - Keeping the compose layer separate means the engine API stays stable
 *     and the page can compose its own filter chain without bloating the
 *     engine's filter shape.
 *
 * Sacred-cultural sensitivity:
 *   - "Amarre de amor" / "vinculação amorosa" intentionally NOT a tag.
 *   - Sacred-only filter is opt-in (user explicitly toggles) to avoid
 *     presenting sacred work in casual browsing contexts.
 *   - Verified-only filter mirrors engine's booking-time gate (UI hint).
 */

import type { Offering, OfferingType, Tradicao } from '../../lib/engines/marketplace/marketplace-engine.ts';

// ════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════

export type FilterPredicate<T> = (item: T) => boolean;

export interface FilterStep<T> {
  readonly id: string;
  readonly label: string;
  readonly predicate: FilterPredicate<T>;
}

export type FilterChain<T> = ReadonlyArray<FilterStep<T>>;

/** Page-side filter shape (orthogonal to engine's `OfferingFilter`). */
export interface PageFilter {
  readonly tradicao?: Tradicao | 'all';
  readonly type?: OfferingType | 'all';
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly verifiedOnly?: boolean;
  readonly sacredOnly?: boolean;
  readonly tags?: ReadonlyArray<string>;
  readonly query?: string;
}

// ════════════════════════════════════════════
// QUERY NORMALIZATION (mirrors engine pattern)
// ════════════════════════════════════════════

export function normalizeQuery(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// ════════════════════════════════════════════
// INDIVIDUAL PREDICATES
// ════════════════════════════════════════════

export function byTradicao(t: Tradicao | 'all' | undefined): FilterPredicate<Offering> {
  if (t === undefined || t === 'all') return () => true;
  return (o) => o.tradicao === t;
}

export function byType(t: OfferingType | 'all' | undefined): FilterPredicate<Offering> {
  if (t === undefined || t === 'all') return () => true;
  return (o) => o.type === t;
}

export function byPriceRange(min?: number, max?: number): FilterPredicate<Offering> {
  if (min === undefined && max === undefined) return () => true;
  return (o) => {
    if (min !== undefined && o.priceBRL < min) return false;
    if (max !== undefined && o.priceBRL > max) return false;
    return true;
  };
}

export function bySacredOnly(enabled: boolean | undefined): FilterPredicate<Offering> {
  if (!enabled) return () => true;
  return (o) => o.sacred === true;
}

export function byVerifiedOnly(
  enabled: boolean | undefined,
  verifiedPractitionerIds: ReadonlySet<string>,
): FilterPredicate<Offering> {
  if (!enabled) return () => true;
  return (o) => verifiedPractitionerIds.has(o.practitionerId);
}

export function byTagSet(tags: ReadonlyArray<string> | undefined): FilterPredicate<Offering> {
  if (tags === undefined || tags.length === 0) return () => true;
  const wanted = new Set(tags.map((t) => normalizeQuery(t)));
  return (o) => {
    for (const t of o.tags) {
      if (wanted.has(normalizeQuery(t))) return true;
    }
    return false;
  };
}

export function byQuery(q: string | undefined): FilterPredicate<Offering> {
  if (q === undefined) return () => true;
  const nq = normalizeQuery(q);
  if (nq.length === 0) return () => true;
  return (o) => {
    // Include tradição so users can search "candomble" and get candomblé offerings
    const haystack = [o.title, o.description, o.practitionerName, o.tradicao as string, ...o.tags]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return haystack.includes(nq);
  };
}

// ════════════════════════════════════════════
// COMPOSE — AND-conjunction
// ════════════════════════════════════════════

/**
 * AND-compose an arbitrary number of filter steps.
 * Each step has an `id` and `label` for UI/debug; the predicate is the
 * actual filter. A step whose predicate is `() => true` is a no-op.
 */
export function composeFilters<T>(
  steps: ReadonlyArray<FilterStep<T>>,
): (items: ReadonlyArray<T>) => ReadonlyArray<T> {
  return (items) => {
    const out: T[] = [];
    for (const item of items) {
      let pass = true;
      for (const step of steps) {
        if (!step.predicate(item)) {
          pass = false;
          break;
        }
      }
      if (pass) out.push(item);
    }
    return Object.freeze(out);
  };
}

/** Build a filter chain from a `PageFilter` + a pre-computed verified set. */
export function buildFilterChain(
  filter: PageFilter,
  verifiedPractitionerIds: ReadonlySet<string>,
): FilterChain<Offering> {
  const steps: FilterStep<Offering>[] = [];
  if (filter.tradicao !== undefined) {
    steps.push({
      id: 'tradicao',
      label: `Tradição: ${filter.tradicao}`,
      predicate: byTradicao(filter.tradicao),
    });
  }
  if (filter.type !== undefined) {
    steps.push({
      id: 'type',
      label: `Tipo: ${filter.type}`,
      predicate: byType(filter.type),
    });
  }
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    steps.push({
      id: 'price',
      label: `Preço: ${filter.minPrice ?? 0}–${filter.maxPrice ?? '∞'}`,
      predicate: byPriceRange(filter.minPrice, filter.maxPrice),
    });
  }
  if (filter.sacredOnly) {
    steps.push({ id: 'sacred', label: 'Apenas sagrados', predicate: bySacredOnly(true) });
  }
  if (filter.verifiedOnly) {
    steps.push({
      id: 'verified',
      label: 'Apenas verificados',
      predicate: byVerifiedOnly(true, verifiedPractitionerIds),
    });
  }
  if (filter.tags !== undefined && filter.tags.length > 0) {
    steps.push({ id: 'tags', label: `Tags: ${filter.tags.join(', ')}`, predicate: byTagSet(filter.tags) });
  }
  if (filter.query !== undefined) {
    steps.push({ id: 'query', label: `Busca: ${filter.query}`, predicate: byQuery(filter.query) });
  }
  return Object.freeze(steps);
}

/** Apply a `PageFilter` to an offering collection in one call. */
export function applyPageFilter(
  offerings: ReadonlyArray<Offering>,
  filter: PageFilter,
  verifiedPractitionerIds: ReadonlySet<string>,
): ReadonlyArray<Offering> {
  const chain = buildFilterChain(filter, verifiedPractitionerIds);
  return composeFilters(chain)(offerings);
}

// ════════════════════════════════════════════
// PRICE RANGE PRESETS (PT-BR)
// ════════════════════════════════════════════

export interface PriceRangePreset {
  readonly id: string;
  readonly label: string;
  readonly min?: number;
  readonly max?: number;
}

export const PRICE_RANGE_PRESETS: ReadonlyArray<PriceRangePreset> = Object.freeze([
  { id: 'all', label: 'Todos os preços' },
  { id: '0-150', label: 'Até R$ 150', min: 0, max: 150 },
  { id: '150-300', label: 'R$ 150 — R$ 300', min: 150, max: 300 },
  { id: '300+', label: 'Acima de R$ 300', min: 300 },
]);