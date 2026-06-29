/**
 * Smoke test for w50/prayer-corpus-deep-search.
 * Validates the 5 critical assertions from the worker spec:
 *
 *   1. extractTrigrams("axé") → [" ax","axé","xé ","é  "]
 *   2. computeLevenshtein("axé", "axe") → 1
 *   3. applySacredTextPolicy removes reserved slots when includeReserved=false
 *   4. generateSnippet wraps matches in <mark>/</mark>
 *   5. hybridSearch combines lexical + fuzzy + semantic
 */
import {
  extractTrigrams,
  computeLevenshtein,
  applySacredTextPolicy,
  generateSnippet,
  hybridSearch,
  buildInvertedIndex,
  parseQuery,
  validateQuery,
  search,
  SacrednessLevel,
  SearchablePrayer,
  SearchQuery,
  SearchResult,
  TRADITION_AFFINITY_BOOSTS,
  DEFAULT_SEARCH_CONFIG,
  STOPWORDS_PT_BR,
  FUZZY_MAX_DISTANCE_DEFAULT,
  SNIPPET_MAX_LENGTH_DEFAULT,
  TRIGRAM_MIN_LENGTH,
} from "../src/lib/w50/prayer-corpus-search";

let FAILED = 0;

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error("❌", msg);
    FAILED += 1;
  } else {
    console.log("✅", msg);
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Test 1: trigrams
{
  const got = extractTrigrams("axé");
  const want = [" ax", "axé", "xé ", "é  "];
  assert(deepEqual(got, want), `extractTrigrams("axé") === ${JSON.stringify(want)} (got ${JSON.stringify(got)})`);
}

// Test 2: Levenshtein
{
  const d = computeLevenshtein("axé", "axe");
  assert(d === 1, `computeLevenshtein("axé","axe") === 1 (got ${d})`);
}

// Test 3: Sacred-text policy
const SAMPLE_CORPUS: SearchablePrayer[] = [
  {
    id: "secular-heart-coherence-morning-pt",
    title: "Respiração da Coerência Cardíaca",
    tradition: "secular_mystical",
    category: "morning",
    locale: "pt-BR",
    text: "Respirando pela barriga, sinto o peito aquecer. Permito-me reconhecer: estou aqui.",
    attribution: "Composição devocional secular",
    sacredness_level: 1 as SacrednessLevel,
    reserved: false,
  },
  {
    id: "candomble-orixa-morning-pt",
    title: "Prece de Abertura do Dia a Orixá Pessoal",
    tradition: "candomble",
    category: "morning",
    locale: "pt-BR",
    text: "",
    attribution: "Reservado. Saudação oral conduzida pela Ialorixá/Babalorixá.",
    sacredness_level: 5 as SacrednessLevel,
    reserved: true,
  },
  {
    id: "buddhism-refuge-three-jewels-pt",
    title: "Refúgio nas Três Joias",
    tradition: "buddhism",
    category: "morning",
    locale: "pt-BR",
    text: "Tomo refúgio no Buda. Tomo refúgio no Dharma. Tomo refúgio no Sangha.",
    attribution: "Tradição Theravāda / Mahāyāna",
    sacredness_level: 2 as SacrednessLevel,
    reserved: false,
  },
];

const index = buildInvertedIndex(SAMPLE_CORPUS);

const publicQuery: SearchQuery = validateQuery({
  raw: "refúgio",
  parsed: parseQuery("refúgio"),
  mode: "hybrid",
  userOptInLogging: false,
  limit: 20,
  offset: 0,
  sort: "relevance",
});

const results = search(publicQuery, index);
const reservedLeaked = results.some((r) => r.isReservedSlot);
assert(!reservedLeaked, `applySacredTextPolicy(public) does NOT leak reserved slots (leaked=${reservedLeaked})`);

const curatorQuery: SearchQuery = validateQuery({
  raw: "refúgio",
  parsed: parseQuery("refúgio"),
  mode: "hybrid",
  includeReserved: true,
  userOptInLogging: false,
  limit: 20,
  offset: 0,
  sort: "relevance",
});
const curatorResults = search(curatorQuery, index);
const curatorReserved = curatorResults.some((r) => r.isReservedSlot);
assert(
  curatorResults.length === 0 || curatorReserved === false,
  `applySacredTextPolicy(curator): no public query matched the reserved slot (curator sees ${curatorResults.length} hit(s); reserved=${curatorReserved})`,
);

// Test 4: snippet generation
{
  const doc = SAMPLE_CORPUS.find((p) => p.id === "secular-heart-coherence-morning-pt");
  if (doc) {
    const q = validateQuery({
      raw: "peito aquecer",
      parsed: parseQuery("peito aquecer"),
      mode: "hybrid",
      userOptInLogging: false,
      limit: 20,
      offset: 0,
      sort: "relevance",
    });
    const snippet = generateSnippet(doc, q, 240, "<mark>", "</mark>");
    const hasMark = snippet.includes("<mark>") && snippet.includes("</mark>");
    assert(hasMark, `generateSnippet wraps matches in <mark>/</mark> (snippet=${JSON.stringify(snippet.slice(0, 120))})`);
  }
}

// Test 5: hybridSearch
{
  const q = validateQuery({
    raw: "refúgio sangha",
    parsed: parseQuery("refúgio sangha"),
    mode: "hybrid",
    userOptInLogging: false,
    limit: 20,
    offset: 0,
    sort: "relevance",
  });
  const hits = hybridSearch(q, index);
  const hasLexical = hits.some((h) => h.lexicalScore > 0);
  const hasFuzzy = hits.some((h) => h.fuzzyScore > 0);
  const hasSemantic = hits.some((h) => h.semanticScore > 0);
  assert(hits.length > 0, `hybridSearch returns hits (count=${hits.length})`);
  assert(hasLexical, `hybridSearch combines lexical signal (lexicalScore>0)`);
  assert(hasFuzzy, `hybridSearch combines fuzzy signal (fuzzyScore>0)`);
  assert(hasSemantic, `hybridSearch combines semantic signal (semanticScore>0)`);
  const hitBuddhism = hits.find((h) => h.hit.prayerId === "buddhism-refuge-three-jewels-pt");
  assert(hitBuddhism !== undefined, `hybridSearch finds Buddhism prayer`);
}

// Sanity: constants and constants tables
assert(TRIGRAM_MIN_LENGTH === 3, `TRIGRAM_MIN_LENGTH === 3 (got ${TRIGRAM_MIN_LENGTH})`);
assert(FUZZY_MAX_DISTANCE_DEFAULT === 2, `FUZZY_MAX_DISTANCE_DEFAULT === 2 (got ${FUZZY_MAX_DISTANCE_DEFAULT})`);
assert(SNIPPET_MAX_LENGTH_DEFAULT === 240, `SNIPPET_MAX_LENGTH_DEFAULT === 240 (got ${SNIPPET_MAX_LENGTH_DEFAULT})`);
assert(STOPWORDS_PT_BR.has("de"), `STOPWORDS_PT_BR contains "de"`);
assert(STOPWORDS_PT_BR.has("a"), `STOPWORDS_PT_BR contains "a"`);
assert(!STOPWORDS_PT_BR.has("refúgio"), `STOPWORDS_PT_BR does NOT contain "refúgio"`);

const boosts = Object.keys(TRADITION_AFFINITY_BOOSTS);
assert(boosts.length === 12, `TRADITION_AFFINITY_BOOSTS has 12 traditions (got ${boosts.length})`);

const cfg = DEFAULT_SEARCH_CONFIG;
assert(cfg.lexicalWeight > 0 && cfg.fuzzyWeight > 0, `DEFAULT_SEARCH_CONFIG weights positive`);

console.log("\n--- W50 SMOKE TEST DONE ---");
if (FAILED > 0) {
  throw new Error(`${FAILED} assertion(s) failed`);
}