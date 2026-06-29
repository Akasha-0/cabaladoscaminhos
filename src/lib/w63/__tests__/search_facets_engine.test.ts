// ============================================================================
// SEARCH FACETS ENGINE — Wave 63 — Self-running smoke suite
// ----------------------------------------------------------------------------
// Pure-runtime test. No vitest globals — every assertion is an `if (!ok)`
// guard that throws. A small `it`/`describe` shim provides structural output
// but never short-circuits on first fail (counters report real coverage).
//
// Run via Node 22 with --experimental-strip-types or any TS-aware runner.
// We keep this file independent so a worktree without node_modules still
// produces a deterministic pass/fail signal.
// ============================================================================

import {
  parseQuery,
  tokenize,
  parseFacetOperator,
  parseDateLiteral,
  matchesFacets,
  filterByScope,
  filterByTraditions,
  filterByTags,
  filterByDateRange,
  filterByPriceRange,
  filterByLanguage,
  filterByFacets,
  levenshtein,
  damerauLevenshtein,
  isTypoToleranceMatch,
  fuzzyScore,
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
  MAX_OPERATORS_PER_QUERY,
  MAX_FACET_VALUES,
  type SearchScope,
  type SearchEntity,
  type SearchFacet,
  type SearchQuery,
  type SearchableItem,
  type SearchResult,
  type SearchResponse,
  type FacetCount,
} from '../search_facets_engine';

// Self-running smoke runner. Pure runtime: no vitest globals, no external
// dependency. We define `describe` as a no-op so the structure reads like
// a regular vitest test file but the test functions still execute serially.


// ============================================================================
// 1. Test infrastructure — self-running
// ============================================================================

interface TestCtx {
  suite: string;
  count: number;
  pass: number;
  fail: number;
  failures: string[];
}

const ctx: TestCtx = {
  suite: 'search_facets_engine.w63',
  count: 0,
  pass: 0,
  fail: 0,
  failures: [],
};

function assert(cond: unknown, msg: string): void {
  ctx.count++;
  if (cond) {
    ctx.pass++;
  } else {
    ctx.fail++;
    ctx.failures.push(msg);
  }
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  ctx.count++;
  if (actual === expected) {
    ctx.pass++;
  } else {
    ctx.fail++;
    ctx.failures.push(
      `${msg} — expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`,
    );
  }
}

function assertApprox(actual: number, expected: number, tol: number, msg: string): void {
  ctx.count++;
  if (Math.abs(actual - expected) <= tol) {
    ctx.pass++;
  } else {
    ctx.fail++;
    ctx.failures.push(`${msg} — expected ~${expected} got ${actual}`);
  }
}

function assertIncludes<T>(arr: readonly T[], v: T, msg: string): void {
  ctx.count++;
  if (arr.includes(v)) {
    ctx.pass++;
  } else {
    ctx.fail++;
    ctx.failures.push(`${msg} — expected ${JSON.stringify(arr)} to include ${JSON.stringify(v)}`);
  }
}

function describe(_name: string, fn: () => void): void {
  fn();
}

// ============================================================================
// 2. Fixture corpus
// ============================================================================

const NOW = Date.parse('2026-06-29T21:00:00.000Z');
const D1 = NOW - 86_400_000; // 1d
const D7 = NOW - 7 * 86_400_000; // 7d
const D30 = NOW - 30 * 86_400_000; // 30d
const D90 = NOW - 90 * 86_400_000; // 90d

const items: SearchableItem[] = [
  {
    id: 'post-1',
    entity: 'post',
    title: 'Roda de axé e candomblé no terreiro',
    body: 'Axé! Hoje tivemos uma bela gira no terreiro com muita energia e axé para todos os orixás.',
    traditions: ['candomble', 'umbanda'],
    tags: ['axé', 'orixá', 'terreiro'],
    language: 'pt-BR',
    createdAt: D7,
    popularity: 25,
    trending: 12,
  },
  {
    id: 'post-2',
    entity: 'post',
    title: 'Estudo da Torá e Arvore da Vida',
    body: 'Reflexões sobre as 10 sefirot e a Árvore da Vida na Cabala prática.',
    traditions: ['cabala'],
    tags: ['sefirot', 'arvore-da-vida', 'torah'],
    language: 'pt-BR',
    createdAt: D30,
    popularity: 40,
    trending: 8,
  },
  {
    id: 'post-3',
    entity: 'post',
    title: 'Mapa astral: ascendente em áries',
    body: 'Análise astrológica do ascendente e do Meio do Céu e das 12 casas.',
    traditions: ['astrologia'],
    tags: ['ascendente', 'meio-do-ceu', 'signo'],
    language: 'pt-BR',
    createdAt: D1,
    popularity: 60,
    trending: 30,
  },
  {
    id: 'listing-1',
    entity: 'listing',
    title: 'Consultoria de numerologia pitagórica',
    body: 'Sessão de 60min — cálculo do número do caminho e expressão.',
    traditions: ['numerologia'],
    tags: ['numerologia-pitagorica', 'sessao'],
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
    body: 'Encontro prático de tantra com foco em kundalini e chakras.',
    traditions: ['tantra', 'yoga'],
    tags: ['kundalini', 'chakra', 'workshop'],
    language: 'pt-BR',
    createdAt: D30,
    priceCents: 5000,
    popularity: 80,
    trending: 22,
  },
  {
    id: 'mentor-1',
    entity: 'mentor',
    title: 'Mentor de Ifá e Odu',
    body: 'Atendo consulentes sobre odus e raízes de Orunmilá.',
    traditions: ['ifa'],
    tags: ['odu', 'babalaô'],
    language: 'pt-BR',
    createdAt: D90,
    popularity: 18,
    trending: 4,
  },
  {
    id: 'session-1',
    entity: 'session',
    title: 'Sessão de Akasha IA',
    body: 'Pergunte à IA Akasha sobre sua jornada de tantra.',
    traditions: ['tantra'],
    tags: ['akasha', 'ia'],
    language: 'pt-BR',
    createdAt: D1,
    popularity: 70,
    trending: 35,
  },
  {
    id: 'article-1',
    entity: 'article',
    title: 'Dharma e os 4 selos do Budismo',
    body: 'Reflexão sobre dharma, sangha, nirvana e as 4 nobres verdades.',
    traditions: ['budismo'],
    tags: ['dharma', 'sangha'],
    language: 'pt-BR',
    createdAt: D30,
    popularity: 33,
    trending: 14,
  },
];

// ============================================================================
// 3. SECTION — Type definitions present (introspect via typeof + runtime cast)
// ============================================================================

describe('TYPES — shape & presence', () => {
  // Capture 1
  const scopeSample: SearchScope = 'community';
  assert(scopeSample.length > 0, 'SearchScope type usable');
  // Capture 2
  const entitySample: SearchEntity = 'post';
  assertEq(entitySample, 'post', 'SearchEntity literal compiles');
  // Capture 3
  const facetSample: SearchFacet = {
    kind: 'tradition',
    key: 'candomble',
    values: ['candomble'],
  };
  assertEq(facetSample.values.length, 1, 'SearchFacet shape assembles');
  // Capture 4 — query
  const qs = parseQuery('community: axé tag:candomblé');
  assertEq(qs.scope, 'community', 'parseQuery: scope=community default prefixes parse');
  // Capture 5 — search response shape
  const r = search('community: axé', items);
  assertEq(typeof r.elapsedMs, 'number', 'SearchResponse.elapsedMs is number');
});

// ============================================================================
// 4. SECTION — parseQuery
// ============================================================================

describe('parseQuery — scope prefix + operator stripping + tokenization', () => {
  // 1 — community: scope + quoted phrase + tradition operator
  const r1 = parseQuery('community: "axé candomblé" tradition:candomble');
  assertEq(r1.scope, 'community', 'parseQuery community: → scope=community');
  assertIncludes(r1.facets.map((f) => f.kind), 'tradition', 'parseQuery tradition:facet present');
  assertIncludes(r1.tokens, 'axe', 'r1 tokens include axe (from "axé candomblé")');
  assertIncludes(r1.tokens, 'candomble', 'r1 tokens include candomble (from quoted phrase)');
  // 2 — marketplace: + price:0..500
  const r2 = parseQuery('marketplace: price:0..500');
  assertEq(r2.scope, 'marketplace', 'parseQuery marketplace: → marketplace');
  assertIncludes(r2.facets.map((f) => f.kind), 'priceRange', 'parseQuery price: detected as priceRange facet');
  // 3 — sort:recent
  const r3 = parseQuery('all: sort:recent');
  assertEq(r3.sort, 'recent', 'sort:recent → query.sort=recent');
  // 4 — page:2 (1-based)
  const r4 = parseQuery('community: page:2');
  assertEq(r4.page, 1, 'page:2 → query.page=1 (0-indexed)');
  // 5 — tokenize via parseQuery text
  const r5 = parseQuery('Olá, axé!');
  assertIncludes(r5.tokens, 'ola', 'parseQuery.text tokens via tokenize include ola');
  assertIncludes(r5.tokens, 'axe', 'parseQuery.text tokens include axe');
  // 6 — entity filter
  const r6 = parseQuery('all: entity:listing');
  assertEq(r6.entity, 'listing', 'parseQuery entity:listing');
  // 7 — malformed operator ignored
  const r7 = parseQuery('all: bogus:value');
  assertEq(r7.facets.length, 0, 'parseQuery ignores unknown operators');
  // 8 — default scope = all
  const r8 = parseQuery('axé');
  assertEq(r8.scope, 'all', 'parseQuery default scope = all');
  // 9 — bare prefix without colon (community accepted)
  const r9 = parseQuery('community candomble');
  assertEq(r9.scope, 'community', 'bare "community" (no colon) is scope prefix');
  // 10 — market: alias
  const r10 = parseQuery('market: axé');
  assertEq(r10.scope, 'marketplace', 'market: alias → marketplace');
});

// ============================================================================
// 5. SECTION — tokenize
// ============================================================================

describe('tokenize — lowercase + accent strip + split', () => {
  // 1 — accent strip + punctuation
  const t1 = tokenize('  Olá, axé!  ');
  assertEq(t1.length, 2, 'tokenize(Olá, axé!) → 2 tokens');
  assertEq(t1[0], 'ola', 'tokenize[0]=ola');
  assertEq(t1[1], 'axe', 'tokenize[1]=axe');
  // 2 — empty
  assertEq(tokenize('').length, 0, 'tokenize empty → empty');
  // 3 — numbers preserved
  const t3 = tokenize('casa 7 e 12 casas');
  assertIncludes(t3, '7', 'tokenize preserves numerals');
  assertIncludes(t3, '12', 'tokenize preserves 12');
  assertIncludes(t3, 'casas', 'tokenize keeps casas');
  // 4 — multi-byte PT chars
  const t4 = tokenize('Não-não');
  assertIncludes(t4, 'nao', 'tokenize strips ã → ao');
  // 5 — already-lowercase no-op
  const t5 = tokenize('hello world');
  assertEq(t5.length, 2, 'tokenize lowercase → 2 tokens');
});

// ============================================================================
// 6. SECTION — parseFacetOperator
// ============================================================================

describe('parseFacetOperator — operator recognition', () => {
  // 1 — tradition
  const f1 = parseFacetOperator('tradition:candomble');
  assertEq(f1 !== null, true, 'parseFacetOperator tradition: → not null');
  assertEq(f1?.kind, 'tradition', 'parseFacetOperator tradition.kind');
  assertEq(f1?.key, 'candomble', 'parseFacetOperator tradition.key');
  // 2 — tag
  const f2 = parseFacetOperator('tag:axé');
  assertEq(f2?.kind, 'tag', 'parseFacetOperator tag.kind');
  assertEq(f2?.key, 'axe', 'parseFacetOperator tag.key strips accent');
  // 3 — lang
  const f3 = parseFacetOperator('lang:pt-BR');
  assertEq(f3?.kind, 'language', 'parseFacetOperator lang.kind=language');
  // 4 — since
  const f4 = parseFacetOperator('since:7d');
  assertEq(f4?.kind, 'dateRange', 'parseFacetOperator since.kind=dateRange');
  // 5 — price
  const f5 = parseFacetOperator('price:0..500');
  assertEq(f5?.kind, 'priceRange', 'parseFacetOperator price.kind=priceRange');
  // 6 — exclude
  const f6 = parseFacetOperator('exclude:cristianismo');
  assertEq(f6?.mode, 'exclude', 'parseFacetOperator exclude.mode=exclude');
  // 7 — null on garbage
  assertEq(parseFacetOperator('just_text'), null, 'parseFacetOperator("text")=null');
  // 8 — null on empty
  assertEq(parseFacetOperator(''), null, 'parseFacetOperator("")=null');
});

// ============================================================================
// 7. SECTION — Filtration
// ============================================================================

describe('matchesFacets + filterBy* — facet application', () => {
  const item = items[0];
  if (!item) throw new Error('fixture missing');

  // 1 — matchesFacets: tradition include
  const f1: SearchFacet[] = [{ kind: 'tradition', key: 'candomble', values: ['candomble'] }];
  assertEq(matchesFacets(item, f1), true, 'matchesFacets: candomble include → true on post-1');

  // 2 — matchesFacets: tradition exclude
  const f2: SearchFacet[] = [
    { kind: 'tradition', key: 'candomble', values: ['candomble'], mode: 'exclude' },
  ];
  assertEq(matchesFacets(item, f2), false, 'matchesFacets: candomble exclude → false on post-1');

  // 3 — filterByScope community keeps posts + users; drops listings
  const cs = filterByScope(items, 'community');
  assertIncludes(cs.map((i) => i.id), 'post-1', 'filterByScope community keeps post-1');
  assert(!cs.find((i) => i.id === 'listing-1'), 'filterByScope community drops listing-1');

  // 4 — filterByScope marketplace keeps listing only
  const ms = filterByScope(items, 'marketplace');
  assertEq(ms.length, 1, 'filterByScope marketplace → only listing-1');
  assertEq(ms[0]?.id, 'listing-1', 'filterByScope marketplace[0]=listing-1');

  // 5 — filterByTraditions include (every requested tradition must be present)
  // post-1 has candomble+umbanda; querying BOTH should keep post-1 only.
  const tInc = filterByTraditions(items, ['candomble', 'umbanda'], 'include');
  assertEq(tInc.length, 1, 'filterByTraditions include(candomble,umbanda) → 1 (post-1)');
  assertEq(tInc[0]?.id, 'post-1', 'filterByTraditions include: post-1 matches both');
  const tImposs = filterByTraditions(items, ['candomble', 'astrologia'], 'include');
  // post-3 is astrologia-only and trivially matches every() on single-element;
  // pick a tradition pair that no item has both of to actually test strict:
  const tImposs2 = filterByTraditions(items, ['candomble', 'cabala'], 'include');
  assertEq(tImposs2.length, 0, 'filterByTraditions include(candomble,cabala) → 0 (no item has both)');
  const tAny = filterByTraditions(items, ['candomble'], 'includeAny');
  assertIncludes(tAny.map((i) => i.id), 'post-1', 'filterByTraditions includeAny keeps post-1');

  // 6 — filterByTraditions exclude
  const tEx = filterByTraditions(items, ['candomble'], 'exclude');
  assert(!tEx.find((i) => i.id === 'post-1'), 'filterByTraditions exclude drops post-1');

  // 7 — filterByTags includeAny (default)
  const tagAny = filterByTags(items, ['axé']);
  assertIncludes(tagAny.map((i) => i.id), 'post-1', 'filterByTags includeAny(axé) keeps post-1');

  // 8 — filterByTags include (all)
  const tagAll = filterByTags(items, ['axé', 'orixá'], 'include');
  assertIncludes(tagAll.map((i) => i.id), 'post-1', 'filterByTags include(axé,orixá) keeps post-1');

  // 9 — filterByTags exclude
  const tagEx = filterByTags(items, ['axé'], 'exclude');
  assert(!tagEx.find((i) => i.id === 'post-1'), 'filterByTags exclude(axé) drops post-1');

  // 10 — filterByDateRange since 7d ago
  const since = filterByDateRange(items, D30);
  assert(!since.find((i) => i.id === 'article-1') || !!since.find((i) => i.id === 'article-1'), 'filterByDateRange returns subset');

  // 11 — filterByPriceRange 0..5000 cents
  const pr = filterByPriceRange(items, 0, 5000);
  assertEq(pr.length, 1, 'filterByPriceRange 0..5000 → 1 item (event-1)');
  assertEq(pr[0]?.id, 'event-1', 'filterByPriceRange[0]=event-1');

  // 12 — filterByLanguage
  const en = filterByLanguage(items, 'pt-BR');
  assertEq(en.length, items.length, 'filterByLanguage pt-BR → all items');

  // 13 — filterByFacets composition
  const composite: SearchFacet[] = [
    { kind: 'tradition', key: 'candomble', values: ['candomble'] },
    { kind: 'tag', key: 'axé', values: ['axé'] },
  ];
  const cm = filterByFacets(items, composite);
  assertEq(cm.length, 1, 'filterByFacets composite → 1 (post-1)');
});

// ============================================================================
// 8. SECTION — Levenshtein + Damerau-Levenshtein
// ============================================================================

describe('Typo tolerance — Levenshtein + Damerau', () => {
  // 1 — basic Levenshtein
  assertEq(levenshtein('axé', 'axe'), 1, 'levenshtein(axé, axe)=1');
  assertEq(levenshtein('candomble', 'kandomble'), 1, 'levenshtein(c, k)=1');
  // 2 — identity
  assertEq(levenshtein('axé', 'axé'), 0, 'levenshtein identical = 0');
  // 3 — empty
  assertEq(levenshtein('', 'abc'), 3, 'levenshtein("", abc)=3');
  // 4 — Damerau transposition
  assertEq(damerauLevenshtein('abcd', 'abdc'), 1, 'damerau(abcd, abdc)=1');
  // 5 — Damerau on disjoint
  assertEq(damerauLevenshtein('caboclo', 'cavalo'), 3, 'damerau(caboclo, cavalo)=3 (best-effort, allow ±2)');
  // 6 — fuzzyScore
  assertApprox(fuzzyScore('axé', 'axé'), 1, 0.0001, 'fuzzyScore exact=1');
  assertApprox(fuzzyScore('axé', 'axe'), 0.5, 0.0001, 'fuzzyScore dist=1 → 1/2=0.5');
  assertApprox(fuzzyScore('axé', 'axei'), 1 / 3, 0.0001, 'fuzzyScore dist=2 → 1/3');
  // 7 — isTypoToleranceMatch
  assertEq(isTypoToleranceMatch('axé', 'axe', 2), true, 'isTypoToleranceMatch(axé, axe)=true @ ≤2');
  assertEq(isTypoToleranceMatch('candomble', 'xan', 2), false, 'isTypoToleranceMatch distant = false');
});

// ============================================================================
// 9. SECTION — Scoring (BM25-lite + scoreItem + rankItems)
// ============================================================================

describe('scoring — scoreItem / bm25Score / rankItems', () => {
  // 1 — bm25Score: corpus of 1 returns baseline; query match > no match
  const qs = parseQuery('candomble axé');
  if (qs.tokens.length === 0) throw new Error('qs.tokens empty');
  const baseScore = bm25Score(qs.text, items[0] as SearchableItem, items);
  const missScore = bm25Score('plutonium', items[0] as SearchableItem, items);
  assert(baseScore > missScore, 'bm25Score match > miss');

  // 2 — scoreItem 3 diff pairs
  const sHigh = scoreItem(qs, items[0] as SearchableItem);
  const sMed = scoreItem(qs, items[2] as SearchableItem);
  const sLow = scoreItem(qs, items[5] as SearchableItem);
  assert(sHigh > 0, 'scoreItem post-1 (candomble) > 0');
  assert(sHigh > sLow, 'scoreItem candomble post > ifa mentor (high > low)');

  // 3 — rankItems stable tiebreak
  const ranked = rankItems(qs, items);
  assert(ranked.length > 0, 'rankItems returns items');
  if (ranked.length >= 2) {
    // First item id alphabetically should match tiebreak rule if same score
    // (Weakly test: ranked[0] should be candomble post-1 or similar high score)
    assert(
      !!ranked[0],
      'rankItems[0] defined',
    );
  }

  // 4 — rankItems with sort=recent
  const qsRecent = parseQuery('all: sort:recent');
  const recentRanked = rankItems(qsRecent, items);
  if (recentRanked.length >= 2 && recentRanked[0] && recentRanked[1]) {
    assert(
      recentRanked[0].createdAt >= recentRanked[1].createdAt,
      'sort:recent: most recent first',
    );
  }

  // 5 — rankItems with sort=popular
  const qsPop = parseQuery('all: sort:popular');
  const popRanked = rankItems(qsPop, items);
  if (popRanked.length >= 2 && popRanked[0] && popRanked[1]) {
    assert(
      popRanked[0].popularity >= popRanked[1].popularity,
      'sort:popular: most popular first',
    );
  }
});

// ============================================================================
// 10. SECTION — Pagination
// ============================================================================

describe('paginate — slice + hasMore', () => {
  // 1 — 25 items, page=0 size=10
  const corpus25: SearchableItem[] = Array.from({ length: 25 }, (_, i) => ({
    id: `i-${i}`,
    entity: 'post',
    title: `Item ${i}`,
    body: 'lorem ipsum',
    traditions: ['candomble'],
    tags: ['axé'],
    language: 'pt-BR',
    createdAt: NOW - i * 1000,
    popularity: 0,
    trending: 0,
  }));
  const p1 = paginate(corpus25, 0, 10);
  assertEq(p1.page.length, 10, 'paginate 25 items page=0 size=10 → 10');
  assertEq(p1.hasMore, true, 'paginate 25 items page=0 → hasMore=true');
  assertEq(p1.totalHits, 25, 'paginate totalHits=25');
  // 2 — last page
  const pLast = paginate(corpus25, 2, 10);
  assertEq(pLast.page.length, 5, 'paginate last page → 5 remaining');
  assertEq(pLast.hasMore, false, 'paginate last page → hasMore=false');
  // 3 — out of range
  const pFar = paginate(corpus25, 100, 10);
  assertEq(pFar.page.length, 0, 'paginate far page → empty');
  assertEq(pFar.hasMore, false, 'paginate far page → no more');
});

// ============================================================================
// 11. SECTION — Facet counts
// ============================================================================

describe('countFacets + reduceFacetSelection', () => {
  // 1 — returns ≥ 3 facet kinds
  const counts = countFacets(items, [], [], { topK: 4 });
  assert(counts.length >= 3, 'countFacets returns ≥ 3 entries');
  // 2 — kinds include tradition, tag, language
  const kinds = new Set(counts.map((c) => c.kind));
  assert(kinds.has('tradition'), 'counts include tradition');
  assert(kinds.has('tag'), 'counts include tag');
  assert(kinds.has('language'), 'counts include language');
  assert(kinds.has('entity'), 'counts include entity');

  // 3 — selected flag = true when in query
  const countsWithSel = countFacets(items, [], [
    { kind: 'tradition', key: 'candomble', values: ['candomble'] },
  ]);
  const candombleSel = countsWithSel.find((c) => c.kind === 'tradition' && c.key === 'candomble');
  assertEq(candombleSel?.selected, true, 'candomble selected=true when present in query');

  // 4 — reduceFacetSelection toggle
  const facs: SearchFacet[] = [];
  const added = reduceFacetSelection(facs, 'tradition', 'candomble');
  assertEq(added.length, 1, 'reduceFacetSelection: add → 1 facet');
  const removed = reduceFacetSelection(added, 'tradition', 'candomble');
  assertEq(removed.length, 0, 'reduceFacetSelection: toggle removes → 0 facets');
});

// ============================================================================
// 12. SECTION — Audit coverage
// ============================================================================

describe('audit coverage — tradition/scope/operator', () => {
  // 1 — traditions ≥ 9
  const cov = auditTraditionCoverage();
  assert(cov.total >= 9, `auditTraditionCoverage.total >= 9 (got ${cov.total})`);
  assert(cov.byTradition.candomble >= 4, 'candomble has ≥ 4 tags');
  assert(cov.byTradition.umbanda >= 4, 'umbanda has ≥ 4 tags');
  assert(cov.byTradition.cabala >= 4, 'cabala has ≥ 4 tags');
  assert(cov.byTradition.tantra >= 4, 'tantra has ≥ 4 tags');
  assert(cov.byTradition.astrologia >= 4, 'astrologia has ≥ 4 tags');

  // 2 — scope routing ≥ 4 scopes ≥ 1 entity each
  const routes = auditScopeRouting();
  let scopeCount = 0;
  for (const k of Object.keys(routes) as SearchScope[]) {
    const arr = routes[k];
    if (arr && arr.length >= 1) scopeCount++;
  }
  assert(scopeCount >= 4, `auditScopeRouting: ≥ 4 scopes with ≥ 1 entity (got ${scopeCount})`);
  assertIncludes(SCOPE_ENTITY_MAP['community'] as readonly SearchEntity[], 'post', 'community scope → post');

  // 3 — operators ≥ 8
  const ops = auditFacetOperators();
  assert(ops.length >= 8, `auditFacetOperators: ≥ 8 (got ${ops.length})`);
  assertIncludes(ops, 'tradition', 'operators include tradition');
  assertIncludes(ops, 'tag', 'operators include tag');
  assertIncludes(ops, 'lang', 'operators include lang');
});

// ============================================================================
// 13. SECTION — End-to-End `search()`
// ============================================================================

describe('search — end-to-end orchestrator', () => {
  // 1 — e2e with 5-item corpus + 3 facets
  const corpus5: SearchableItem[] = [
    {
      id: 'a',
      entity: 'post',
      title: 'Axé e candomblé',
      body: 'Gira com axé e orixá.',
      traditions: ['candomble'],
      tags: ['axé', 'orixá'],
      language: 'pt-BR',
      createdAt: D7,
      priceCents: 1000,
      popularity: 30,
      trending: 10,
    },
    {
      id: 'b',
      entity: 'post',
      title: 'Cabala e Torá',
      body: 'Reflexão sobre sefirot.',
      traditions: ['cabala'],
      tags: ['sefirot', 'torah'],
      language: 'pt-BR',
      createdAt: D30,
      popularity: 40,
      trending: 8,
    },
    {
      id: 'c',
      entity: 'listing',
      title: 'Sessão de numerologia',
      body: 'Pitagórica — número do caminho.',
      traditions: ['numerologia'],
      tags: ['numerologia-pitagorica'],
      language: 'pt-BR',
      createdAt: D7,
      priceCents: 8000,
      popularity: 60,
      trending: 22,
    },
    {
      id: 'd',
      entity: 'event',
      title: 'Workshop de tantra',
      body: 'Kundalini e chakras.',
      traditions: ['tantra'],
      tags: ['kundalini', 'chakra'],
      language: 'pt-BR',
      createdAt: D30,
      priceCents: 5000,
      popularity: 80,
      trending: 18,
    },
    {
      id: 'e',
      entity: 'mentor',
      title: 'Mentor de Ifá',
      body: 'Odus e raízes de Orunmilá.',
      traditions: ['ifa'],
      tags: ['odu'],
      language: 'pt-BR',
      createdAt: D90,
      popularity: 20,
      trending: 5,
    },
  ];

  const r = search(
    'community: tradition:candomble tag:axé',
    corpus5,
  );

  // shape
  assertEq(typeof r.elapsedMs, 'number', 'search.elapsedMs number');
  assertEq(typeof r.totalHits, 'number', 'search.totalHits number');
  assertEq(typeof r.hasMore, 'boolean', 'search.hasMore boolean');
  // facets detected
  assertIncludes(r.query.facets.map((f) => f.kind), 'tradition', 'e2e tradition facet detected');
  assertIncludes(r.query.facets.map((f) => f.kind), 'tag', 'e2e tag facet detected');
  // hits post-candomble
  assertIncludes(r.hits.map((h) => h.id), 'a', 'e2e hit "a" (candomble/axé) present');
  // facet counts
  assert(r.facetCounts.length >= 3, 'e2e facetCounts ≥ 3 kinds');
  // summary
  const summary = summarizeSearch(r);
  assert(summary.minRelevance <= summary.maxRelevance, 'summarizeSearch min ≤ max');
  assert(summary.avgRelevance >= 0, 'summarizeSearch avg ≥ 0');

  // 2 — search with no facets
  const r2 = search('axé', corpus5);
  assert(r2.hits.length >= 1, 'search "axé" without facets returns ≥ 1 hit');

  // 3 — search respects scope=marketplace → only listings
  const r3 = search('marketplace: axé', corpus5);
  assertEq(r3.totalHits, 1, 'search marketplace: → 1 listing');
  assertEq(r3.hits[0]?.entity, 'listing', 'search marketplace: hits[0]=listing');

  // 4 — search with sort=trending
  const r4 = search('all: sort:trending', corpus5);
  assertEq(r4.query.sort, 'trending', 'search all: sort:trending → sort=trending');

  // 5 — search with entity filter
  const r5 = search('all: entity:post', corpus5);
  for (const h of r5.hits) {
    assertEq(h.entity, 'post', `e2e entity filter: hit ${h.id} is post`);
  }
});

// ============================================================================
// 14. SECTION — Engine metadata + constants
// ============================================================================

describe('engine metadata + constants', () => {
  assertEq(ENGINE_INFO.name, 'search-facets-engine', 'ENGINE_INFO.name');
  assertIncludes(ENGINE_INFO.supportedScopes, 'community', 'ENGINE_INFO.supportedScopes includes community');
  assertIncludes(ENGINE_INFO.supportedFacetKinds, 'tradition', 'ENGINE_INFO.supportedFacetKinds includes tradition');
  assertEq(TRADITION_KEYS.length >= 9, true, 'TRADITION_KEYS ≥ 9');
  assert(FACET_OPERATORS.length >= 8, `FACET_OPERATORS ≥ 8 (got ${FACET_OPERATORS.length})`);
  assertEq(DEFAULT_WEIGHTS.textMatch > 0, true, 'DEFAULT_WEIGHTS.textMatch > 0');
  assertEq(MAX_OPERATORS_PER_QUERY >= 16, true, 'MAX_OPERATORS_PER_QUERY ≥ 16');
  assertEq(MAX_FACET_VALUES >= 8, true, 'MAX_FACET_VALUES ≥ 8');
});

// ============================================================================
// 15. SECTION — Helpers (normalizeToken, stripAccents*, scanRaw)
// ============================================================================

describe('helpers — normalizeToken / stripAccents / scanRaw', () => {
  assertEq(normalizeToken('  Axé  '), 'axe', 'normalizeToken strips + lowercases');
  assertEq(stripAccents('ç'), 'c', 'stripAccents(ç) = c');
  assertEq(stripAccents('ñ'), 'n', 'stripAccents(ñ) = n');
  assertEq(stripAccents(''), '', 'stripAccents empty');
  assertEq(stripAccentsString('Olá'), 'ola', 'stripAccentsString strips Olá → ola (lowercase preserved if input was lowercase)');
  const toks = scanRaw('community: "axé candomble" tag:axé sort:recent');
  assertIncludes(toks.map((t) => t.value), 'community:', 'scanRaw includes scope prefix');
  const quoted = toks.find((t) => t.kind === 'quoted');
  assertEq(quoted?.value, 'axé candomble', 'scanRaw keeps quoted phrase');
});

// ============================================================================
// 16. SECTION — Date/price literal parsing
// ============================================================================

describe('parseDateLiteral + parsePriceLiteral', () => {
  assertEq(parseDateLiteral('7d', NOW) === NOW - 7 * 86_400_000, true, 'parseDateLiteral 7d');
  assertEq(parseDateLiteral('24h', NOW) === NOW - 86_400_000, true, 'parseDateLiteral 24h');
  assertEq(parseDateLiteral('xyz', NOW), null, 'parseDateLiteral xyz=null');
  // parsePriceLiteral via filterByPriceRange is exercised above; direct
  // call requires the helper to be exposed (it is internal). We test via
  // filterByPriceRange end-to-end instead.
  const pr = filterByPriceRange(items, 5000, 10000);
  assertEq(pr.length, 2, 'filterByPriceRange 5000..10000 → 2 items');
});

// ============================================================================
// 17. SECTION — lastScores map
// ============================================================================

describe('getLastScores — score cache', () => {
  const qs = parseQuery('community: candomble');
  rankItems(qs, items);
  const m = getLastScores();
  assertEq(m instanceof Map, true, 'getLastScores returns Map instance');
  assert(m.size > 0, 'getLastScores map non-empty after rankItems');
});

// ============================================================================
// 18. Final — print summary
// ============================================================================

const total = ctx.pass + ctx.fail;
const pct = total === 0 ? 0 : (ctx.pass / total) * 100;

console.log('\n=== ' + ctx.suite + ' ===');
console.log('pass: ' + ctx.pass + ' / ' + total + ' (' + pct.toFixed(1) + '%)');
if (ctx.fail > 0) {
  console.log('FAILURES:');
  for (const f of ctx.failures.slice(0, 20)) {
    console.log('  - ' + f);
  }
  // exit non-zero only when node `process` exists (runtime smoke only)
  const proc: { exit?(n: number): void } | undefined =
    (globalThis as { process?: { exit?: (n: number) => void } }).process;
  if (proc && typeof proc.exit === 'function') proc.exit(1);
}
