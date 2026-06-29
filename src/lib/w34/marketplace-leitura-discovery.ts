// ============================================================================
// MARKETPLACE LEITURA DISCOVERY — Wave 34
// ============================================================================
// Composição com w31 (catálogo), w32 (reviews), w33 (checkout).
// Pure TS, sem runtime imports. Toda função é pura.
// ============================================================================

export interface LeituraItem {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  priceCents: number;
  currency: string;
  rating: number;
  reviewCount: number;
  authorId: string;
  coverUrl: string;
  tags: string[];
  publishedAt: string;
  isFeatured: boolean;
}

export interface DiscoveryFilters {
  categories?: string[];
  languages?: string[];
  minPriceCents?: number;
  maxPriceCents?: number;
  minRating?: number;
  tags?: string[];
}

export type SortOption =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popular";

export type CarouselLayout = "grid" | "carousel" | "hero";

export interface FeaturedCarousel {
  id: string;
  title: string;
  subtitle: string;
  itemIds: string[];
  layout: CarouselLayout;
  order: number;
}

export type ForYouReason =
  | "recent_views"
  | "history"
  | "matching_interests"
  | "trending";

export interface ForYouFeed {
  userId: string;
  itemIds: string[];
  generatedAt: string;
  reason: ForYouReason;
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface DiscoverySummary {
  total: number;
  avgPrice: number;
  avgRating: number;
  topCategory: string | null;
  topLanguage: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_CAROUSEL_ITEMS = 12;
const FOR_YOU_LIMIT = 24;

// ---------------------------------------------------------------------------
// Filtros + validação
// ---------------------------------------------------------------------------

export function applyFilters(items: LeituraItem[], f: DiscoveryFilters): LeituraItem[] {
  return items.filter((it) => {
    if (f.categories?.length && !f.categories.includes(it.category)) return false;
    if (f.languages?.length && !f.languages.includes(it.language)) return false;
    if (f.minPriceCents !== undefined && it.priceCents < f.minPriceCents) return false;
    if (f.maxPriceCents !== undefined && it.priceCents > f.maxPriceCents) return false;
    if (f.minRating !== undefined && it.rating < f.minRating) return false;
    if (f.tags?.length && !f.tags.some((t) => it.tags.includes(t))) return false;
    return true;
  });
}

export function validateFilters(f: DiscoveryFilters): ValidationResult {
  const errors: string[] = [];
  if (f.minPriceCents !== undefined && f.maxPriceCents !== undefined && f.maxPriceCents < f.minPriceCents) {
    errors.push("Preço máximo não pode ser menor que o preço mínimo.");
  }
  if (f.minPriceCents !== undefined && f.minPriceCents < 0) errors.push("Preço mínimo não pode ser negativo.");
  if (f.minRating !== undefined && (f.minRating < 0 || f.minRating > 5)) errors.push("Rating mínimo deve estar entre 0 e 5.");
  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Ordenação — relevance = rating × log(reviewCount + 1) + freshnessBoost(0..1)
// ---------------------------------------------------------------------------

export function applySort(items: LeituraItem[], sort: SortOption): LeituraItem[] {
  const cmp = (k: keyof LeituraItem, dir: 1 | -1 = 1) => (a: LeituraItem, b: LeituraItem) =>
    dir * (a[k] === b[k] ? 0 : (a[k] > b[k] ? 1 : -1));
  const copy = items.slice();
  switch (sort) {
    case "newest": return copy.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    case "price_asc": return copy.sort(cmp("priceCents"));
    case "price_desc": return copy.sort(cmp("priceCents", -1));
    case "rating": return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "popular": return copy.sort(cmp("reviewCount", -1));
    case "relevance":
    default: return copy.sort((a, b) => relevanceScore(b) - relevanceScore(a));
  }
}

function relevanceScore(it: LeituraItem): number {
  const ageDays = (Date.now() - new Date(it.publishedAt).getTime()) / 86_400_000;
  const freshness = Math.max(0, 1 - ageDays / 30);
  return it.rating * Math.log(it.reviewCount + 1) + freshness;
}

// ---------------------------------------------------------------------------
// Carrosséis destaque
// ---------------------------------------------------------------------------

export function buildFeaturedCarousels(items: LeituraItem[], maxCarousels = 6): FeaturedCarousel[] {
  if (items.length === 0 || maxCarousels <= 0) return [];
  const seen = new Set<string>();
  const out: FeaturedCarousel[] = [];
  let order = 0;
  const push = (c: Omit<FeaturedCarousel, "order">, ids: string[]) => {
    out.push({ ...c, order: order++ });
    ids.forEach((id) => seen.add(id));
  };

  const featured = items.filter((it) => it.isFeatured).slice(0, MAX_CAROUSEL_ITEMS);
  if (featured.length > 0) {
    const ids = featured.map((it) => it.id);
    push({ id: "featured-curated", title: "Destaques da semana", subtitle: "Selecionados pelo time editorial", itemIds: ids, layout: "hero" }, ids);
  }

  const topRated = applySort(items, "rating").filter((it) => !seen.has(it.id)).slice(0, MAX_CAROUSEL_ITEMS);
  if (topRated.length > 0) {
    const ids = topRated.map((it) => it.id);
    push({ id: "top-rated", title: "Mais bem avaliados", subtitle: "Nota alta combinada com volume de avaliações", itemIds: ids, layout: "carousel" }, ids);
  }

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
  const fresh = items.filter((it) => new Date(it.publishedAt).getTime() >= thirtyDaysAgo)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, MAX_CAROUSEL_ITEMS);
  if (fresh.length > 0) {
    const ids = fresh.map((it) => it.id);
    push({ id: "fresh-arrivals", title: "Recém-chegados", subtitle: "Publicadas nas últimas semanas", itemIds: ids, layout: "carousel" }, ids);
  }

  // Categorias na ordem de popularidade (itens ainda não cobertos)
  const catCount = new Map<string, number>();
  for (const it of items) if (!seen.has(it.id)) catCount.set(it.category, (catCount.get(it.category) ?? 0) + 1);
  const cats = [...catCount.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);

  for (const category of cats) {
    if (out.length >= maxCarousels) break;
    const catItems = items.filter((it) => it.category === category && !seen.has(it.id)).slice(0, MAX_CAROUSEL_ITEMS);
    if (catItems.length === 0) continue;
    const ids = catItems.map((it) => it.id);
    push({ id: `cat-${slugify(category)}`, title: buildCarouselTitle(category), subtitle: `Explora a curadoria de ${category}`, itemIds: ids, layout: "carousel" }, ids);
  }
  return out.slice(0, maxCarousels);
}

export function buildCarouselTitle(category: string): string {
  const t = category.trim();
  return t.length === 0 ? "Leituras em destaque" : `Leituras de ${t}`;
}

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Para Você — match por interesse + rating-weighted shuffle
// ---------------------------------------------------------------------------

export function generateForYouFeed(userId: string, viewHistory: string[], interests: string[], allItems: LeituraItem[]): ForYouFeed {
  const seen = new Set(viewHistory);
  const candidates = allItems.filter((it) => !seen.has(it.id));
  const matched = candidates
    .filter((it) => interests.includes(it.category) || it.tags.some((tag) => interests.includes(tag)))
    .sort((a, b) => b.rating - a.rating);
  const matchedIds = new Set(matched.map((it) => it.id));
  const rest = candidates.filter((it) => !matchedIds.has(it.id));
  const filler = rest.map((it) => ({ it, score: it.rating + Math.random() }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, FOR_YOU_LIMIT - matched.length))
    .map((s) => s.it);
  return {
    userId,
    itemIds: [...matched, ...filler].slice(0, FOR_YOU_LIMIT).map((it) => it.id),
    generatedAt: new Date().toISOString(),
    reason: matched.length > 0 ? "matching_interests" : "trending",
  };
}

// ---------------------------------------------------------------------------
// Paginação, busca, relacionados, sumário
// ---------------------------------------------------------------------------

export function paginateItems(items: LeituraItem[], page: number, pageSize: number = DEFAULT_PAGE_SIZE): PaginatedResult<LeituraItem> {
  const safePage = page < 1 ? 1 : Math.floor(page);
  const safeSize = pageSize < 1 ? DEFAULT_PAGE_SIZE : Math.floor(pageSize);
  const totalItems = items.length;
  const start = (safePage - 1) * safeSize;
  const end = start + safeSize;
  return {
    items: items.slice(start, end),
    hasMore: end < totalItems,
    totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / safeSize),
    currentPage: safePage,
    totalItems,
  };
}

export function searchItems(items: LeituraItem[], query: string): LeituraItem[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return items.slice();
  return items.filter((it) =>
    it.title.toLowerCase().includes(q) ||
    it.description.toLowerCase().includes(q) ||
    it.tags.some((tag) => tag.toLowerCase().includes(q)));
}

export function getRelatedItems(item: LeituraItem, allItems: LeituraItem[], limit: number = 5): LeituraItem[] {
  const itemTags = new Set(item.tags);
  return allItems
    .filter((o) => o.id !== item.id && o.category === item.category && o.tags.some((t) => itemTags.has(t)))
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, Math.max(0, limit));
}

export function summarizeDiscovery(items: LeituraItem[]): DiscoverySummary {
  if (items.length === 0) return { total: 0, avgPrice: 0, avgRating: 0, topCategory: null, topLanguage: null };
  let sumPrice = 0, sumRating = 0;
  const cats = new Map<string, number>();
  const langs = new Map<string, number>();
  for (const it of items) {
    sumPrice += it.priceCents;
    sumRating += it.rating;
    cats.set(it.category, (cats.get(it.category) ?? 0) + 1);
    langs.set(it.language, (langs.get(it.language) ?? 0) + 1);
  }
  return {
    total: items.length,
    avgPrice: sumPrice / items.length,
    avgRating: sumRating / items.length,
    topCategory: topKey(cats),
    topLanguage: topKey(langs),
  };
}

function topKey(m: Map<string, number>): string | null {
  let best: string | null = null;
  let max = -1;
  for (const [k, v] of m) if (v > max) { best = k; max = v; }
  return best;
}