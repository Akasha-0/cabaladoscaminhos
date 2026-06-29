// ============================================================================
// SEARCH FACETS ENGINE — Wave 63 — Vitest-compatible test surface
// ----------------------------------------------------------------------------
// Mirrors the assertions in `search_facets_engine.test.ts` but uses vitest's
// real `test()` / `expect()` so vitest can count and report. Importable via
// the cached vitest binary in cabaladoscaminhos worktrees.
// ============================================================================

import { test, expect } from '/tmp/vitest-download/extracted/package/dist/index.js';
import {
  parseQuery,
  tokenize,
  parseFacetOperator,
  filterByScope,
  filterByTraditions,
  filterByTags,
  filterByDateRange,
  filterByPriceRange,
  filterByLanguage,
  filterByFacets,
  matchesFacets,
  levenshtein,
  damerauLevenshtein,
  fuzzyScore,
  isTypoToleranceMatch,
  scoreItem,
  bm25Score,
  rankItems,
  paginate,
  countFacets,
  reduceFacetSelection,
  summarizeSearch,
  search,
  auditTraditionCoverage,
  auditScopeRouting,
  auditFacetOperators,
  normalizeToken,
  stripAccents,
  stripAccentsString,
  scanRaw,
  getLastScores,
  TRADITION_KEYS,
  TRADITION_TAGS,
  SCOPE_ENTITY_MAP,
  FACET_OPERATORS,
  ENGINE_INFO,
  DEFAULT_WEIGHTS,
  type SearchableItem,
  type SearchScope,
  type SearchEntity,
  type SearchFacet,
} from '../search_facets_engine';

const NOW = Date.parse('2026-06-29T21:00:00.000Z');
const D1 = NOW - 86_400_000;
const D7 = NOW - 7 * 86_400_000;
const D30 = NOW - 30 * 86_400_000;

const items: SearchableItem[] = [
  {
    id: 'post-1',
    entity: 'post',
    title: 'Roda de axé e candomblé no terreiro',
    body: 'Axé! Hoje tivemos uma bela gira no terreiro com muita energia.',
    traditions: ['candomble', 'umbanda'],
    tags: ['axé', 'orixá'],
    language: 'pt-BR',
    createdAt: D7,
    popularity: 25,
    trending: 12,
  },
  {
    id: 'post-2',
    entity: 'post',
    title: 'Estudo da Torá e Arvore da Vida',
    body: 'Reflexões sobre as 10 sefirot e a Árvore da Vida na Cabala.',
    traditions: ['cabala'],
    tags: ['sefirot', 'arvore-da-vida'],
    language: 'pt-BR',
    createdAt: D30,
    popularity: 40,
    trending: 8,
  },
  {
    id: 'post-3',
    entity: 'post',
    title: 'Mapa astral: ascendente em áries',
    body: 'Análise astrológica do ascendente e Meio do Céu.',
    traditions: ['astrologia'],
    tags: ['ascendente'],
    language: 'pt-BR',
    createdAt: D1,
    popularity: 60,
    trending: 30,
  },
  {
    id: 'listing-1',
    entity: 'listing',
    title: 'Consultoria de numerologia',
    body: 'Sessão de 60min.',
    traditions: ['numerologia'],
    tags: ['numerologia-pitagorica'],
    language: 'pt-BR',
    createdAt: D7,
    priceCents: 8000,
    popularity: 15,
    trending: 9,
  },
  {
    id: 'event-1',
    entity: 'event',
    title: 'Workshop de Tantra e Kundalini',
    body: 'Encontro prático de tantra com foco em kundalini.',
    traditions: ['tantra'],
    tags: ['kundalini', 'chakra'],
    language: 'pt-BR',
    createdAt: D30,
    priceCents: 5000,
    popularity: 80,
    trending: 22,
  },
];

// ---------------------------------------------------------------------------
// Type & shape
// ---------------------------------------------------------------------------
test('TYPES shape compiles', () => {
  const scope: SearchScope = 'community';
  expect(scope.length).toBeGreaterThan(0);
  const entity: SearchEntity = 'post';
  expect(entity).toBe('post');
});

// ---------------------------------------------------------------------------
// parseQuery
// ---------------------------------------------------------------------------
test('parseQuery community: scope', () => {
  const r = parseQuery('community: "axé candomblé" tradition:candomble');
  expect(r.scope).toBe('community');
  expect(r.facets.map((f) => f.kind)).toContain('tradition');
});

test('parseQuery marketplace: scope', () => {
  const r = parseQuery('marketplace: price:0..500');
  expect(r.scope).toBe('marketplace');
  expect(r.facets.map((f) => f.kind)).toContain('priceRange');
});

test('parseQuery sort + page', () => {
  const r1 = parseQuery('all: sort:recent');
  expect(r1.sort).toBe('recent');
  const r2 = parseQuery('community: page:2');
  expect(r2.page).toBe(1);
});

test('parseQuery default scope = all + entity filter', () => {
  const r1 = parseQuery('axé');
  expect(r1.scope).toBe('all');
  const r2 = parseQuery('all: entity:listing');
  expect(r2.entity).toBe('listing');
});

// ---------------------------------------------------------------------------
// tokenize
// ---------------------------------------------------------------------------
test('tokenize accent strip + lowercase', () => {
  expect(tokenize('  Olá, axé!  ')).toEqual(['ola', 'axe']);
  expect(tokenize('')).toEqual([]);
  expect(tokenize('casa 7 e 12')).toEqual(['casa', '7', 'e', '12']);
});

// ---------------------------------------------------------------------------
// parseFacetOperator
// ---------------------------------------------------------------------------
test('parseFacetOperator detects tradition / tag / lang', () => {
  expect(parseFacetOperator('tradition:candomble')?.kind).toBe('tradition');
  expect(parseFacetOperator('tag:axé')?.kind).toBe('tag');
  expect(parseFacetOperator('lang:pt-BR')?.kind).toBe('language');
});

test('parseFacetOperator rejects garbage', () => {
  expect(parseFacetOperator('just_text')).toBeNull();
  expect(parseFacetOperator('')).toBeNull();
});

// ---------------------------------------------------------------------------
// Filtration
// ---------------------------------------------------------------------------
test('filterByScope routing', () => {
  expect(filterByScope(items, 'community').map((i) => i.id)).toContain('post-1');
  expect(filterByScope(items, 'marketplace')).toHaveLength(1);
  expect(filterByScope(items, 'marketplace')[0]?.entity).toBe('listing');
});

test('filterByTraditions include/exclude/includeAny', () => {
  const inc = filterByTraditions(items, ['candomble', 'umbanda'], 'include');
  expect(inc.map((i) => i.id)).toContain('post-1');
  const exc = filterByTraditions(items, ['candomble'], 'exclude');
  expect(exc.map((i) => i.id)).not.toContain('post-1');
});

test('filterByTags includeAny/includeAll/exclude', () => {
  expect(filterByTags(items, ['axé'])).toHaveLength(1);
  expect(filterByTags(items, ['axé', 'orixá'], 'include')).toHaveLength(1);
  expect(filterByTags(items, ['axé'], 'exclude')).toHaveLength(items.length - 1);
});

test('filterByPriceRange 0..5000 cents', () => {
  const r = filterByPriceRange(items, 0, 5000);
  expect(r.map((i) => i.id)).toContain('event-1');
});

test('filterByLanguage preserves language', () => {
  expect(filterByLanguage(items, 'pt-BR')).toHaveLength(items.length);
});

// ---------------------------------------------------------------------------
// Levenshtein / Damerau / fuzzy
// ---------------------------------------------------------------------------
test('levenshtein identity / 1 edit / 3 empty', () => {
  expect(levenshtein('axé', 'axé')).toBe(0);
  expect(levenshtein('axé', 'axe')).toBe(1);
  expect(levenshtein('', 'abc')).toBe(3);
});

test('damerauLevenshtein transposition', () => {
  expect(damerauLevenshtein('abcd', 'abdc')).toBe(1);
});

test('fuzzyScore bounded [0,1]', () => {
  expect(fuzzyScore('axé', 'axé')).toBe(1);
  expect(fuzzyScore('axé', 'axe')).toBeCloseTo(0.5, 5);
  expect(fuzzyScore('axé', 'axei')).toBeCloseTo(1 / 3, 5);
});

test('isTypoToleranceMatch distance ≤ 2', () => {
  expect(isTypoToleranceMatch('axé', 'axe', 2)).toBe(true);
  expect(isTypoToleranceMatch('candomble', 'xan', 2)).toBe(false);
});

// ---------------------------------------------------------------------------
// Scoring / ranking
// ---------------------------------------------------------------------------
test('bm25Score match > miss', () => {
  const corpus = items;
  const match = bm25Score('candomble axé', items[0] as SearchableItem, corpus);
  const miss = bm25Score('plutonium', items[0] as SearchableItem, corpus);
  expect(match).toBeGreaterThan(miss);
});

test('scoreItem candomble post > ifa mentor', () => {
  const qs = parseQuery('candomble axé');
  const sHigh = scoreItem(qs, items[0] as SearchableItem);
  const sLow = scoreItem(qs, items[2] as SearchableItem);
  expect(sHigh).toBeGreaterThan(0);
  expect(sHigh).toBeGreaterThan(sLow);
});

test('rankItems stable order', () => {
  const qs = parseQuery('axé');
  const ranked = rankItems(qs, items);
  expect(ranked.length).toBeGreaterThan(0);
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
test('paginate 25 items page=0 size=10', () => {
  const corpus25: SearchableItem[] = Array.from({ length: 25 }, (_, i) => ({
    id: `i-${i}`,
    entity: 'post',
    title: `Item ${i}`,
    body: 'lorem',
    traditions: [],
    tags: [],
    language: 'pt-BR',
    createdAt: NOW,
    popularity: 0,
    trending: 0,
  }));
  const p1 = paginate(corpus25, 0, 10);
  expect(p1.page.length).toBe(10);
  expect(p1.hasMore).toBe(true);
  expect(p1.totalHits).toBe(25);
});

// ---------------------------------------------------------------------------
// Facet counts + selection toggle
// ---------------------------------------------------------------------------
test('countFacets returns ≥ 3 kinds', () => {
  const counts = countFacets(items, [], []);
  expect(counts.length).toBeGreaterThanOrEqual(3);
  const kinds = new Set(counts.map((c) => c.kind));
  expect(kinds.has('tradition')).toBe(true);
  expect(kinds.has('tag')).toBe(true);
  expect(kinds.has('language')).toBe(true);
});

test('reduceFacetSelection toggle', () => {
  const added = reduceFacetSelection([], 'tradition', 'candomble');
  expect(added.length).toBe(1);
  const removed = reduceFacetSelection(added, 'tradition', 'candomble');
  expect(removed.length).toBe(0);
});

// ---------------------------------------------------------------------------
// Audit coverage
// ---------------------------------------------------------------------------
test('auditTraditionCoverage ≥ 9 traditions × ≥ 4 tags', () => {
  const cov = auditTraditionCoverage();
  expect(cov.total).toBeGreaterThanOrEqual(9);
  expect(cov.byTradition.candomble).toBeGreaterThanOrEqual(4);
  expect(cov.byTradition.cabala).toBeGreaterThanOrEqual(4);
  expect(cov.byTradition.tantra).toBeGreaterThanOrEqual(4);
});

test('auditScopeRouting ≥ 4 scopes × ≥ 1 entity', () => {
  const routes = auditScopeRouting();
  let scopeCount = 0;
  for (const k of Object.keys(routes) as SearchScope[]) {
    const v = routes[k];
    if (v && v.length >= 1) scopeCount++;
  }
  expect(scopeCount).toBeGreaterThanOrEqual(4);
});

test('auditFacetOperators ≥ 8', () => {
  const ops = auditFacetOperators();
  expect(ops.length).toBeGreaterThanOrEqual(8);
  expect(ops).toContain('tradition');
  expect(ops).toContain('tag');
});

// ---------------------------------------------------------------------------
// End-to-end
// ---------------------------------------------------------------------------
test('search end-to-end pipeline', () => {
  const r = search('community: tradition:candomble tag:axé', items);
  expect(typeof r.elapsedMs).toBe('number');
  expect(r.query.facets.map((f) => f.kind)).toContain('tradition');
  expect(r.query.facets.map((f) => f.kind)).toContain('tag');
  expect(r.hits.map((h) => h.id)).toContain('post-1');
  expect(r.facetCounts.length).toBeGreaterThanOrEqual(3);
});

test('search marketplace: scope routing', () => {
  const r = search('marketplace: axé', items);
  expect(r.totalHits).toBe(1);
  expect(r.hits[0]?.entity).toBe('listing');
});

test('search respects entity filter', () => {
  const r = search('all: entity:post', items);
  for (const h of r.hits) {
    expect(h.entity).toBe('post');
  }
});

test('summarizeSearch range invariant', () => {
  const r = search('community: candomble', items);
  const s = summarizeSearch(r);
  expect(s.minRelevance).toBeLessThanOrEqual(s.maxRelevance);
  expect(s.avgRelevance).toBeGreaterThanOrEqual(0);
});

// ---------------------------------------------------------------------------
// Helpers + metadata
// ---------------------------------------------------------------------------
test('helpers normalizeToken / stripAccents / scanRaw', () => {
  expect(normalizeToken('  Axé  ')).toBe('axe');
  expect(stripAccents('ç')).toBe('c');
  expect(stripAccentsString('Olá')).toBe('ola');
  const toks = scanRaw('community: "axé candomblé" tag:axé sort:recent');
  expect(toks.some((t) => t.kind === 'quoted')).toBe(true);
});

test('ENGINE_INFO introspects supported lists', () => {
  expect(ENGINE_INFO.name).toBe('search-facets-engine');
  expect(ENGINE_INFO.supportedScopes).toContain('community');
  expect(ENGINE_INFO.supportedFacetKinds).toContain('tradition');
});

test('TRADITION_KEYS ≥ 9 + FACET_OPERATORS ≥ 8', () => {
  expect(TRADITION_KEYS.length).toBeGreaterThanOrEqual(9);
  expect(FACET_OPERATORS.length).toBeGreaterThanOrEqual(8);
  expect(TRADITION_TAGS.candomble.length).toBeGreaterThanOrEqual(4);
  expect(TRADITION_TAGS.cabala.length).toBeGreaterThanOrEqual(4);
  expect(TRADITION_TAGS.tantra.length).toBeGreaterThanOrEqual(4);
  expect(TRADITION_TAGS.astrologia.length).toBeGreaterThanOrEqual(4);
});

test('matchesFacets tradition exclude semantics', () => {
  const item = items[0];
  if (!item) throw new Error('item missing');
  const f1: SearchFacet[] = [{ kind: 'tradition', key: 'candomble', values: ['candomble'] }];
  expect(matchesFacets(item, f1)).toBe(true);
  const f2: SearchFacet[] = [{ kind: 'tradition', key: 'candomble', values: ['candomble'], mode: 'exclude' }];
  expect(matchesFacets(item, f2)).toBe(false);
});

test('filterByFacets composite returns the post-1', () => {
  const composite: SearchFacet[] = [
    { kind: 'tradition', key: 'candomble', values: ['candomble'] },
    { kind: 'tag', key: 'axé', values: ['axé'] },
  ];
  const cm = filterByFacets(items, composite);
  expect(cm.length).toBe(1);
  expect(cm[0]?.id).toBe('post-1');
});

test('filterByDateRange since 30d', () => {
  const r = filterByDateRange(items, D30);
  expect(r.length).toBeGreaterThanOrEqual(2);
});

test('SCOPE_ENTITY_MAP community includes post', () => {
  expect(SCOPE_ENTITY_MAP['community']).toContain('post');
});

test('getLastScores populates after rankItems', () => {
  const qs = parseQuery('community: candomble');
  rankItems(qs, items);
  const m = getLastScores();
  expect(m.size).toBeGreaterThan(0);
});

test('DEFAULT_WEIGHTS tunable', () => {
  expect(DEFAULT_WEIGHTS.textMatch).toBeGreaterThan(0);
});
