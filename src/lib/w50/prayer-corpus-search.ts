/**
 * w50/prayer-corpus-deep-search
 * -----------------------------------------------------------------------------
 * In-memory deep search engine over the multi-tradition prayer / chant corpus
 * shipped by w49/tradition-prayer-corpus (34 prayers × pt-BR / en-US / es-ES,
 * plus reserved slots gated by sacred-text policy).
 *
 * This module is a pure-data layer. It does NOT import w49 directly — the
 * calling app passes the corpus (as a `readonly Prayer[]`) into the engine
 * and consumes a list of `SearchResult` rows.
 *
 * Architecture
 *  • Trigram inverted index for sub-millisecond lexical search across titles
 *    and bodies (hand-rolled; no external deps).
 *  • Levenshtein for small-edit fuzzy matching (locale-aware token fold).
 *  • n-gram shingling + Jaccard similarity for cheap semantic clustering.
 *  • Hybrid mode linearly combines lexical, fuzzy, semantic, recency,
 *    resonance and exact-phrase signals into a final 0..1 score.
 *  • Multi-factor score breakdown is exposed on each result so the UI can
 *    render a "why this matched" panel without re-running the engine.
 *
 * Sacred-text policy
 *  • Reserved slots (initiation-gated, sacredness 4-5) are NEVER returned in
 *    public search results. Callers MUST pass `includeReserved: true` AND be
 *    authenticated as a curator for those rows to surface.
 *
 * LGPD
 *  • `respectSearchLogOptIn` enforces Art. 7 (consent before processing).
 *  • `deleteSearchHistory` enforces Art. 18 (right to deletion).
 *  • `redactSearchLog` enforces Art. 18 (right to portability / export).
 *  • The engine never persists a search log implicitly; log writes are
 *    gated on `userOptInLogging === true`.
 *
 * Compositional contract with w49
 *  • w49 owns the corpus shape (`Prayer`, `Tradition`, `PrayerCategory`,
 *    `LocaleId`, `SacrednessLevel`, `RESONANCE_TABLE`, `findResonantPrayers`).
 *  • w50 owns the SEARCH layer. It does not duplicate w49 functions; instead
 *    it expands the cross-tradition resonance idea with boost signals
 *    (`TRADITION_AFFINITY_BOOSTS`) and a multi-factor ranking.
 *
 * @module w50/prayer-corpus-deep-search
 */

// ─────────────────────────────────────────────────────────────────────────────
// §1  CORE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search mode the engine should run. `hybrid` (default) combines all three
 * core signals with the configured weight matrix.
 *
 *  • `lexical`   — trigram posting-list walk (fast, exact substring).
 *  • `fuzzy`     — Levenshtein distance on tokens (typo tolerance).
 *  • `semantic`  — n-gram shingling + Jaccard (cheap semantic proxy).
 *  • `hybrid`    — combined, default.
 *  • `exact`     — phrase-only, no fuzzy / semantic fallback.
 */
export type SearchMode = "lexical" | "fuzzy" | "semantic" | "hybrid" | "exact";

/**
 * Final ordering. `relevance` uses the multi-factor score; the others
 * bypass relevance and sort on a single facet.
 */
export type SortOrder =
  | "relevance"
  | "recency_desc"
  | "tradition_asc"
  | "sensitivity_asc"
  | "locale_asc";

/**
 * Local copy of the tradition union — we keep w50 standalone so it can be
 * validated without resolving the w49 import graph at type-check time.
 */
export type Tradition =
  | "candomble"
  | "ifa"
  | "umbanda"
  | "buddhism"
  | "hinduism"
  | "christianity"
  | "islam"
  | "judaism"
  | "taoism"
  | "indigenous_brazilian"
  | "syncretic"
  | "secular_mystical";

/**
 * Local copy of the prayer-category union (mirrors w47 PRAYER_SLOTS + the
 * w49 corpus).
 */
export type PrayerCategory =
  | "morning"
  | "evening"
  | "gratitude"
  | "grounding"
  | "healing"
  | "protection"
  | "forgiveness"
  | "intention"
  | "gratitude_petition"
  | "meditation"
  | "ancestor_veneration"
  | "orixa_invocation";

/**
 * Local copy of the locale union. pt-BR / en-US / es-ES are the only
 * locales bundled with the corpus.
 */
export type LocaleId = "pt-BR" | "en-US" | "es-ES";

/**
 * Sacredness 1 (secular) → 5 (initiation-gated). Mirrors w49.
 */
export type SacrednessLevel = 1 | 2 | 3 | 4 | 5;

/**
 * The atomic prayer record expected by the engine. We intentionally keep
 * this SHALLOW relative to w49's full `Prayer` so w50 stays decoupled.
 * Anything w50 needs for ranking + snippet generation must be present
 * here. Caller can pass w49's full Prayer directly because structural
 * typing matches.
 */
export interface SearchablePrayer {
  readonly id: string;
  readonly title: string;
  readonly tradition: Tradition;
  readonly category: PrayerCategory;
  readonly locale: LocaleId;
  readonly text: string;
  readonly attribution: string;
  readonly sacredness_level: SacrednessLevel;
  readonly reserved: boolean;
  /** ISO date the row was added / last curated; used by recency boost. */
  readonly created_at_iso?: string;
}

/**
 * Cross-tradition resonance link. w49 owns a richer shape; w50 keeps a
 * minimal projection sufficient to surface a "you might also resonate
 * with" list from the corpus.
 */
export interface ResonanceLink {
  readonly from_id: string;
  readonly to_id: string;
  readonly reason:
    | "thematic_equivalent"
    | "syncretic_figure"
    | "shared_intent"
    | "same_symbol"
    | "same_occasion";
  readonly strength: 1 | 2 | 3;
}

/**
 * Single term extracted from the user's raw query.
 */
export interface QueryTerm {
  readonly text: string;
  readonly boost: number;
  readonly position: number;
}

/**
 * Parsed view of a raw query string. The parser handles:
 *   - bare terms            ("axé" → term)
 *   - phrase                ("\"pai nosso\"" → requiredPhrases)
 *   - NOT                   ("-ruido" → excludedTerms)
 *   - AND / OR              (case-insensitive; default is implicit AND)
 *   - facet filters         (locale:pt-BR, tradition:ifo, category:grounding)
 *
 * Anything else is treated as a term.
 */
export interface ParsedQuery {
  readonly terms: readonly QueryTerm[];
  readonly excludedTerms: readonly string[];
  readonly requiredPhrases: readonly string[];
  readonly localeFilter?: LocaleId;
  readonly traditionFilter?: readonly Tradition[];
  readonly categoryFilter?: readonly PrayerCategory[];
}

/**
 * The full user-facing search request. Defaults are filled in by
 * `validateQuery` so the engine sees a complete, normalised shape.
 */
export interface SearchQuery {
  /** Original user input. Kept verbatim for LGPD audit logs. */
  readonly raw: string;
  /** Parsed structure derived from `raw`. */
  readonly parsed: ParsedQuery;
  /** Which mode the engine should run. */
  readonly mode: SearchMode;
  /** Restrict to one locale. */
  readonly locale?: LocaleId;
  /** Restrict to a set of traditions. */
  readonly traditions?: readonly Tradition[];
  /** Restrict to a set of categories. */
  readonly categories?: readonly PrayerCategory[];
  /** Filter out rows with sacredness strictly greater than this. */
  readonly sensitivityMax?: number;
  /** Curator-only escape hatch — exposes reserved slots. */
  readonly includeReserved?: boolean;
  /** Maximum Levenshtein distance accepted by fuzzy matching. */
  readonly fuzzyMaxDistance?: number;
  /** Default 20. Hard cap at 200 to keep engine bounded. */
  readonly limit: number;
  /** Default 0. Used together with `limit` to paginate. */
  readonly offset: number;
  /** Final sort order. Default `relevance`. */
  readonly sort: SortOrder;
  /** Highlight opening marker. Default `<mark>`. */
  readonly highlightPre?: string;
  /** Highlight closing marker. Default `</mark>`. */
  readonly highlightPost?: string;
  /** Snippet cap in characters. Default 240. */
  readonly snippetMaxLength?: number;
  /** LGPD Art. 7 — caller MUST be a verified consent record. */
  readonly userOptInLogging: boolean;
}

/**
 * A single contributing factor to a result's final score. The UI can
 * render the factors array as a "why this matched" panel.
 */
export interface SearchFactor {
  readonly name:
    | "lexical"
    | "fuzzy"
    | "semantic"
    | "recency"
    | "resonance"
    | "exact_phrase";
  /** 0..1 raw score for this factor. */
  readonly score: number;
  /** 0..1 weight applied by the multi-factor model. */
  readonly weight: number;
  /** score × weight — contribution to the final relevance. */
  readonly contribution: number;
}

/**
 * A single match returned to the caller.
 */
export interface SearchResult {
  readonly prayerId: string;
  readonly locale: LocaleId;
  /** Final score after multi-factor weighting; 0..1. */
  readonly score: number;
  /** Breakdown of every contributing factor. */
  readonly factors: readonly SearchFactor[];
  /** Snippet with highlight markers wrapping matched substrings. */
  readonly snippet: string;
  /** Title for convenience (always unhighlighted; the UI can re-render). */
  readonly title: string;
  readonly tradition: Tradition;
  readonly category: PrayerCategory;
  readonly sensitivityLevel: SacrednessLevel;
  /**
   * For each matched term, the [start, end) char offsets in the snippet.
   * The UI can use these to add tooltips / accessibility annotations.
   */
  readonly matchedPositions: readonly (readonly [number, number])[];
  readonly isReservedSlot: boolean;
  /** Human-readable explanation when the row is a reserved slot. */
  readonly reservedSlotReason?: string;
}

/**
 * Aggregation of how the result set distributes across key facets.
 */
export interface FacetAggregations {
  readonly byTradition: Readonly<Record<Tradition, number>>;
  readonly byCategory: Readonly<Record<PrayerCategory, number>>;
  readonly byLocale: Readonly<Record<LocaleId, number>>;
  readonly bySensitivityLevel: Readonly<Record<SacrednessLevel, number>>;
  readonly totalResults: number;
  readonly reservedHits: number;
}

/**
 * Posting-list entry inside the trigram inverted index.
 */
export interface PostingEntry {
  readonly prayerId: string;
  readonly locale: LocaleId;
  /** Char positions of this trigram's last character in the source field. */
  readonly positions: readonly number[];
  /** Per-field boost: title=2, body=1, attribution=1.5. */
  readonly fieldBoost: number;
}

/**
 * One bucket of the trigram inverted index.
 */
export interface TrigramIndex {
  readonly trigram: string;
  readonly postingList: readonly PostingEntry[];
  readonly docFreq: number;
}

/**
 * The full index, plus book-keeping for diffing / merging.
 */
export interface PrayerSearchIndex {
  readonly trigrams: ReadonlyMap<string, TrigramIndex>;
  readonly docs: ReadonlyMap<string, SearchablePrayer>;
  readonly indexedAtIso: string;
  readonly locale: LocaleId;
  readonly totalDocs: number;
}

/**
 * Configuration for the multi-factor ranking model. Weights sum to 1.0
 * but the engine is tolerant of off-by-floating-point sums.
 */
export interface SearchConfig {
  readonly lexicalWeight: number;
  readonly fuzzyWeight: number;
  readonly semanticWeight: number;
  readonly recencyWeight: number;
  readonly resonanceWeight: number;
  readonly exactPhraseWeight: number;
  /** Title match multiplier on top of lexical score. */
  readonly titleBoost: number;
  /** Fuzzy score drop per unit Levenshtein distance. */
  readonly fuzzyDistancePenalty: number;
  /** Half-life in days for recency decay. */
  readonly recencyHalfLifeDays: number;
  /** Cap on fuzzy matches considered per query term. */
  readonly fuzzyCandidateCap: number;
  /** Cap on n-gram shingles collected per document. */
  readonly shingleCap: number;
}

/**
 * Audit-log row. Caller persists into the LGPD-compliant log store.
 */
export interface SearchLogEntry {
  readonly user_id: string;
  readonly query_raw: string;
  readonly query_parsed: ParsedQuery;
  readonly mode: SearchMode;
  readonly result_count: number;
  readonly result_ids: readonly string[];
  readonly facet: FacetAggregations;
  readonly captured_at_iso: string;
  readonly redacted: boolean;
}

/**
 * LGPD Art. 18 export envelope for a single user.
 */
export interface SearchLogExport {
  readonly user_id: string;
  readonly entries: readonly SearchLogEntry[];
  readonly format: "json" | "csv";
  readonly byte_size: number;
  readonly generated_at_iso: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// §2  TYPED ERRORS (PS_001..PS_007)
// ─────────────────────────────────────────────────────────────────────────────

export class PrayerSearchError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;
  public constructor(
    code: string,
    message: string,
    context: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "PrayerSearchError";
    this.code = code;
    this.context = context;
  }
}

/** PS_001 — caller submitted an unsupported locale. */
export class InvalidLocaleError extends PrayerSearchError {
  public constructor(locale: string) {
    super(
      "PS_001",
      `Unsupported locale "${locale}". Engine supports pt-BR / en-US / es-ES.`,
      { locale },
    );
    this.name = "InvalidLocaleError";
  }
}

/** PS_002 — sacred-text policy refused the result set because reserved slots leaked. */
export class SacredTextPolicyError extends PrayerSearchError {
  public constructor(prayerId: string, reason: string) {
    super(
      "PS_002",
      `Sacred-text policy blocked prayer "${prayerId}": ${reason}`,
      { prayerId, reason },
    );
    this.name = "SacredTextPolicyError";
  }
}

/** PS_003 — query failed schema validation. */
export class QueryValidationError extends PrayerSearchError {
  public constructor(field: string, reason: string) {
    super(
      "PS_003",
      `Query validation failed on field "${field}": ${reason}`,
      { field, reason },
    );
    this.name = "QueryValidationError";
  }
}

/** PS_004 — caller tried to log without LGPD opt-in. */
export class LgpdOptInMissingError extends PrayerSearchError {
  public constructor(userId: string) {
    super(
      "PS_004",
      `LGPD Art. 7 opt-in missing for user "${userId}". Search logging refused.`,
      { userId },
    );
    this.name = "LgpdOptInMissingError";
  }
}

/** PS_005 — index was given an invalid document (missing id, etc). */
export class IndexDocumentError extends PrayerSearchError {
  public constructor(reason: string) {
    super("PS_005", `Index document rejected: ${reason}`, { reason });
    this.name = "IndexDocumentError";
  }
}

/** PS_006 — index serialization round-trip mismatch. */
export class IndexSerializationError extends PrayerSearchError {
  public constructor(reason: string) {
    super("PS_006", `Index serialization failed: ${reason}`, { reason });
    this.name = "IndexSerializationError";
  }
}

/** PS_007 — fuzzy / Levenshtein call asked for an unsafe distance. */
export class InvalidFuzzyDistanceError extends PrayerSearchError {
  public constructor(distance: number) {
    super(
      "PS_007",
      `Fuzzy distance must be a non-negative integer <= 3; got "${distance}".`,
      { distance },
    );
    this.name = "InvalidFuzzyDistanceError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// §3  CONSTANTS & DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_LOCALES: readonly LocaleId[] = [
  "pt-BR",
  "en-US",
  "es-ES",
] as const;

export const SUPPORTED_TRADITIONS: readonly Tradition[] = [
  "candomble",
  "ifa",
  "umbanda",
  "buddhism",
  "hinduism",
  "christianity",
  "islam",
  "judaism",
  "taoism",
  "indigenous_brazilian",
  "syncretic",
  "secular_mystical",
] as const;

export const SUPPORTED_CATEGORIES: readonly PrayerCategory[] = [
  "morning",
  "evening",
  "gratitude",
  "grounding",
  "healing",
  "protection",
  "forgiveness",
  "intention",
  "gratitude_petition",
  "meditation",
  "ancestor_veneration",
  "orixa_invocation",
] as const;

/** Minimum trigram length. Three chars is the standard trigram window. */
export const TRIGRAM_MIN_LENGTH: number = 3;

/** Default fuzzy Levenshtein distance. */
export const FUZZY_MAX_DISTANCE_DEFAULT: number = 2;

/** Cap on fuzzy distance to keep the engine bounded. */
export const FUZZY_MAX_DISTANCE_HARD_CAP: number = 3;

/** Default snippet length in characters. */
export const SNIPPET_MAX_LENGTH_DEFAULT: number = 240;

/** Default page size for `SearchQuery.limit`. */
export const SEARCH_RESULT_DEFAULT_LIMIT: number = 20;

/** Hard cap on `SearchQuery.limit` to bound engine work. */
export const SEARCH_RESULT_HARD_LIMIT: number = 200;

/** Default offset for pagination. */
export const SEARCH_RESULT_DEFAULT_OFFSET: number = 0;

/** Default sort order. */
export const DEFAULT_SORT_ORDER: SortOrder = "relevance";

/** Highlight opening marker. */
export const DEFAULT_HIGHLIGHT_PRE: string = "<mark>";

/** Highlight closing marker. */
export const DEFAULT_HIGHLIGHT_POST: string = "</mark>";

/** Default recency half-life. */
export const DEFAULT_RECENCY_HALF_LIFE_DAYS: number = 180;

/** Default fuzzy candidate cap per query term. */
export const DEFAULT_FUZZY_CANDIDATE_CAP: number = 64;

/** Default shingle cap per document. */
export const DEFAULT_SHINGLE_CAP: number = 4096;

/**
 * Default multi-factor weight matrix. Weights are normalised by the
 * engine before being applied; they don't have to sum to 1.0.
 */
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  lexicalWeight: 0.30,
  fuzzyWeight: 0.10,
  semanticWeight: 0.20,
  recencyWeight: 0.05,
  resonanceWeight: 0.20,
  exactPhraseWeight: 0.15,
  titleBoost: 2.0,
  fuzzyDistancePenalty: 0.35,
  recencyHalfLifeDays: DEFAULT_RECENCY_HALF_LIFE_DAYS,
  fuzzyCandidateCap: DEFAULT_FUZZY_CANDIDATE_CAP,
  shingleCap: DEFAULT_SHINGLE_CAP,
} as const;

/**
 * Cross-tradition boost matrix. Used by `boostByTradition` to nudge the
 * score up when a result belongs to one of the user's preferred
 * traditions, and to nudge down when it doesn't (with a soft floor).
 *
 * Pairs are intentionally conservative; the engine is for devotional
 * reading, not for ranking religious authority.
 */
export const TRADITION_AFFINITY_BOOSTS: Readonly<Record<Tradition, number>> = {
  candomble: 1.00,
  ifa: 1.00,
  umbanda: 1.00,
  buddhism: 1.00,
  hinduism: 1.00,
  christianity: 1.00,
  islam: 1.00,
  judaism: 1.00,
  taoism: 1.00,
  indigenous_brazilian: 1.00,
  syncretic: 1.05,
  secular_mystical: 1.00,
} as const;

/**
 * Syncretic resonance pairs used by `boostByResonance` when the caller
 * does NOT supply a `RESONANCE_TABLE`. These mirror the strongest
 * entries in w49's RESONANCE_TABLE. (w50 deliberately keeps a
 * small subset here so it's useful without importing w49.)
 */
export const DEFAULT_RESONANCE_PAIRS: readonly ResonanceLink[] = [
  {
    from_id: "syncretic-oxala-pai-nosso-pt",
    to_id: "christianity-lords-prayer-pt",
    reason: "syncretic_figure",
    strength: 3,
  },
  {
    from_id: "syncretic-iemanja-mar-pt",
    to_id: "christianity-hail-mary-evening-pt",
    reason: "syncretic_figure",
    strength: 3,
  },
  {
    from_id: "buddhism-metta-lovingkindness-excerpt-pt",
    to_id: "secular-heart-coherence-morning-pt",
    reason: "thematic_equivalent",
    strength: 2,
  },
  {
    from_id: "judaism-shema-morning-pt",
    to_id: "islam-al-fatiha-morning-pt",
    reason: "shared_intent",
    strength: 2,
  },
  {
    from_id: "taoism-wei-wu-wei-grounding-pt",
    to_id: "buddhism-refuge-three-jewels-pt",
    reason: "thematic_equivalent",
    strength: 2,
  },
  {
    from_id: "hinduism-gayatri-mantra-morning-pt",
    to_id: "buddhism-refuge-three-jewels-pt",
    reason: "shared_intent",
    strength: 2,
  },
] as const;

/**
 * Portuguese (Brazil) stopwords. Trimmed aggressively to keep the
 * semantic / lexical signals meaningful for Portuguese religious text.
 */
export const STOPWORDS_PT_BR: ReadonlySet<string> = new Set([
  "a", "o", "as", "os", "um", "uma", "uns", "umas",
  "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos",
  "para", "por", "com", "sem", "sob", "sobre",
  "e", "ou", "mas", "que", "se",
  "eu", "tu", "ele", "ela", "nós", "vós", "eles", "elas",
  "me", "te", "se", "lhe", "nos", "vos",
  "meu", "minha", "teu", "tua", "seu", "sua", "nosso", "nossa",
  "este", "esta", "isto", "esse", "essa", "isso", "aquele", "aquela", "aquilo",
  "é", "são", "foi", "ser", "estar", "tem", "tém",
  "não", "sim", "muito", "pouco", "mais", "menos",
  "já", "ainda", "sempre", "nunca",
]);

/**
 * English stopwords (kept small on purpose).
 */
export const STOPWORDS_EN: ReadonlySet<string> = new Set([
  "a", "an", "the",
  "and", "or", "but", "if", "then",
  "of", "to", "in", "on", "at", "by", "for", "with", "without",
  "is", "are", "was", "were", "be", "been", "being",
  "i", "you", "he", "she", "it", "we", "they",
  "my", "your", "his", "her", "its", "our", "their",
  "this", "that", "these", "those",
  "not", "no", "yes",
  "as", "so", "too", "very",
  "from", "into", "onto", "off", "out",
]);

/**
 * Spanish (Spain) stopwords.
 */
export const STOPWORDS_ES: ReadonlySet<string> = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas",
  "de", "del", "en", "a", "por", "para", "con", "sin", "sobre", "bajo",
  "y", "o", "u", "pero", "si",
  "yo", "tú", "él", "ella", "nosotros", "vosotros", "ellos", "ellas",
  "me", "te", "se", "le", "nos", "os",
  "mi", "tu", "su", "nuestro", "vuestro",
  "este", "esta", "esto", "ese", "esa", "eso", "aquel", "aquella", "aquello",
  "es", "son", "fue", "ser", "estar", "ha", "han",
  "no", "sí", "mucho", "poco", "más", "menos",
  "ya", "aún", "siempre", "nunca",
]);

/**
 * Stopword lookup keyed by locale.
 */
export const STOPWORDS_BY_LOCALE: Readonly<Record<LocaleId, ReadonlySet<string>>> = {
  "pt-BR": STOPWORDS_PT_BR,
  "en-US": STOPWORDS_EN,
  "es-ES": STOPWORDS_ES,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// §4  TOKENIZATION & NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unicode-friendly accent stripper. Maps common Latin diacritics to their
 * base letter so "axé", "axe" and "axè" all normalise to "axe".
 */
export function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Plural-fold for Portuguese (drops a terminal 's' on tokens >= 4 chars)
 * and English (drops terminal 's' / 'es' on tokens >= 4 chars). Spanish
 * is similar to PT-BR. Empty strings return unchanged.
 *
 * Conservative on purpose: false positives (e.g. "Jesus" → "jesu") are
 * surfaced by the fuzzy matcher as a near-miss rather than collapsing
 * them together.
 */
export function foldPlural(token: string, locale: LocaleId): string {
  if (token.length < 4) return token;
  if (token.endsWith("ões") || token.endsWith("aes")) {
    return token.slice(0, -3) + (locale === "pt-BR" ? "ao" : "a");
  }
  if (token.endsWith("es") && token.length >= 4) {
    const stem = token.slice(0, -2);
    if (locale === "pt-BR" && /(ões|aes|res|les|des|zes)$/.test(token)) {
      return stem;
    }
    return stem;
  }
  if (token.endsWith("s") && token.length >= 4) {
    return token.slice(0, -1);
  }
  return token;
}

/**
 * Lower-case, strip accents, optionally fold plurals, and trim. The
 * returned string is the canonical form used by every downstream
 * algorithm (trigram extraction, fuzzy matching, semantic shingles).
 */
export function normalizeToken(raw: string, locale: LocaleId): string {
  if (typeof raw !== "string") throw new TypeError("normalizeToken: raw must be a string");
  assertLocale(locale);
  let s = raw.trim().toLowerCase();
  if (s.length === 0) return s;
  s = stripAccents(s);
  s = foldPlural(s, locale);
  s = s.replace(/[^\p{L}\p{N}]+/gu, "");
  return s;
}

/**
 * Split a string into raw tokens. Handles whitespace, hyphens, em-dashes,
 * apostrophes and ellipses. Returns empty array on empty input.
 */
export function rawSplit(text: string): readonly string[] {
  if (text.length === 0) return [];
  const cleaned = text
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...");
  const out: string[] = [];
  const buf: string[] = [];
  for (let i = 0; i < cleaned.length; i += 1) {
    const c = cleaned[i] as string;
    if (c === undefined) continue;
    const code = c.charCodeAt(0);
    const isWs = code === 0x20 || code === 0x09 || code === 0x0a || code === 0x0d;
    const isSep = c === "-" || c === "_" || c === "/" || c === "|";
    if (isWs || isSep) {
      if (buf.length > 0) {
        out.push(buf.join(""));
        buf.length = 0;
      }
      continue;
    }
    if (c === "." || c === "," || c === ";" || c === ":" || c === "!" || c === "?") {
      if (buf.length > 0) {
        out.push(buf.join(""));
        buf.length = 0;
      }
      continue;
    }
    buf.push(c);
  }
  if (buf.length > 0) out.push(buf.join(""));
  return out;
}

/**
 * Tokenize text in a locale-aware way: split raw, drop stopwords,
 * normalise each token. Returns an array of normalised tokens. Empty
 * tokens (after normalisation) are filtered out.
 */
export function tokenize(text: string, locale: LocaleId): readonly string[] {
  assertLocale(locale);
  const raw = rawSplit(text);
  const stop = STOPWORDS_BY_LOCALE[locale];
  const out: string[] = [];
  for (const r of raw) {
    const norm = normalizeToken(r, locale);
    if (norm.length === 0) continue;
    if (stop.has(norm)) continue;
    out.push(norm);
  }
  return out;
}

/**
 * Tokenize a text but KEEP stopwords. Useful for snippet generation
 * where the surrounding grammar matters for readability.
 */
export function tokenizeKeepStopwords(
  text: string,
  locale: LocaleId,
): readonly string[] {
  assertLocale(locale);
  const raw = rawSplit(text);
  const out: string[] = [];
  for (const r of raw) {
    const norm = normalizeToken(r, locale);
    if (norm.length === 0) continue;
    out.push(norm);
  }
  return out;
}

/**
 * Heuristic: is this token a stopword for the given locale?
 */
export function isStopword(token: string, locale: LocaleId): boolean {
  assertLocale(locale);
  const norm = normalizeToken(token, locale);
  if (norm.length === 0) return true;
  return STOPWORDS_BY_LOCALE[locale].has(norm);
}

// ─────────────────────────────────────────────────────────────────────────────
// §5  TRIGRAM INDEX
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract trigrams from a string. We pad with one leading and two trailing
 * spaces so trigrams at the boundary are still meaningful (the test in the
 * spec asserts `extractTrigrams("axé")` → `[" ax", "axé", "xé ", "é  "`]).
 *
 * Trigrams shorter than `TRIGRAM_MIN_LENGTH` chars return [].
 */
export function extractTrigrams(text: string): readonly string[] {
  if (text.length < TRIGRAM_MIN_LENGTH) return [];
  const padded = ` ${text}  `;
  const out: string[] = [];
  for (let i = 0; i + TRIGRAM_MIN_LENGTH <= padded.length; i += 1) {
    out.push(padded.slice(i, i + TRIGRAM_MIN_LENGTH));
  }
  return out;
}

/**
 * Internal helper used by `indexPrayer`. We always build the trigram
 * buckets ourselves; this function does NOT mutate any external index.
 */
function buildTrigramBucketsForField(
  field: string,
  fieldBoost: number,
  prayerId: string,
  locale: LocaleId,
): ReadonlyMap<string, { positions: number[]; fieldBoost: number; prayerId: string; locale: LocaleId }> {
  const buckets = new Map<string, { positions: number[]; fieldBoost: number; prayerId: string; locale: LocaleId }>();
  // Strip accents + lowercase so query trigrams (which are normalised)
  // intersect with index trigrams correctly. Refúgio / refugio match.
  const normalizedField = stripAccents(field.toLowerCase());
  const grams = extractTrigrams(normalizedField);
  grams.forEach((g, idx) => {
    const charPos = idx; // char offset of trigram start in the padded buffer
    let entry = buckets.get(g);
    if (!entry) {
      entry = { positions: [], fieldBoost, prayerId, locale };
      buckets.set(g, entry);
    }
    entry.positions.push(charPos);
  });
  return buckets;
}

/**
 * Build the inverted trigram index for an entire corpus. Returns an
 * immutable `PrayerSearchIndex` snapshot suitable for caching.
 *
 * The caller MUST pass a `locale` for the canonical search; the engine
 * indexes all rows regardless of their own `locale` but tags every
 * posting with the document's locale so multi-locale queries can
 * post-filter.
 */
export function buildInvertedIndex(
  corpus: readonly SearchablePrayer[],
  locale: LocaleId = "pt-BR",
  nowIso: string = new Date().toISOString(),
): PrayerSearchIndex {
  assertLocale(locale);
  const trigrams = new Map<string, TrigramIndex>();
  const docs = new Map<string, SearchablePrayer>();

  for (const p of corpus) {
    validateDocument(p);
    docs.set(p.id, p);
    indexPrayerInternal(p, trigrams);
  }

  return {
    trigrams,
    docs,
    indexedAtIso: nowIso,
    locale,
    totalDocs: docs.size,
  };
}

/**
 * Internal mutating helper: adds one prayer's trigram postings to a
 * trigram map in-place. Caller wraps the result in `PrayerSearchIndex`.
 */
function indexPrayerInternal(
  p: SearchablePrayer,
  trigrams: Map<string, TrigramIndex>,
): void {
  const titleBuckets = buildTrigramBucketsForField(p.title, 2.0, p.id, p.locale);
  const attributionBuckets = buildTrigramBucketsForField(p.attribution, 1.5, p.id, p.locale);
  const bodyBuckets = buildTrigramBucketsForField(p.reserved ? p.attribution : p.text, 1.0, p.id, p.locale);

  const merged = new Map<string, { positions: number[]; fieldBoost: number; prayerId: string; locale: LocaleId }>();
  for (const [g, b] of titleBuckets) mergeBucket(merged, g, b);
  for (const [g, b] of attributionBuckets) mergeBucket(merged, g, b);
  for (const [g, b] of bodyBuckets) mergeBucket(merged, g, b);

  for (const [g, b] of merged) {
    let idx = trigrams.get(g);
    if (!idx) {
      idx = { trigram: g, postingList: [], docFreq: 0 };
      trigrams.set(g, idx);
    }
    const posting: PostingEntry = {
      prayerId: b.prayerId,
      locale: b.locale,
      positions: [...b.positions],
      fieldBoost: b.fieldBoost,
    };
    // We have to widen the readonly array to a mutable one for the in-place index build.
    (idx.postingList as PostingEntry[]).push(posting);
  }

  // Recompute docFreq lazily; cheaper to count distinct docIds when the
  // index is materialised. We bump the counter on first occurrence per doc.
  for (const [, idx] of trigrams) {
    const seen = new Set<string>();
    let n = 0;
    for (const p of idx.postingList) {
      if (!seen.has(p.prayerId)) {
        seen.add(p.prayerId);
        n += 1;
      }
    }
    (idx as { docFreq: number }).docFreq = n;
  }
}

function mergeBucket(
  acc: Map<string, { positions: number[]; fieldBoost: number; prayerId: string; locale: LocaleId }>,
  g: string,
  b: { positions: number[]; fieldBoost: number; prayerId: string; locale: LocaleId },
): void {
  const existing = acc.get(g);
  if (existing) {
    existing.positions.push(...b.positions);
    if (b.fieldBoost > existing.fieldBoost) existing.fieldBoost = b.fieldBoost;
  } else {
    acc.set(g, {
      positions: [...b.positions],
      fieldBoost: b.fieldBoost,
      prayerId: b.prayerId,
      locale: b.locale,
    });
  }
}

/**
 * Public re-index helper. Returns a NEW `PrayerSearchIndex` with the
 * prayer added. Existing postings for the same prayer id are removed
 * first (idempotent re-index).
 */
export function indexPrayer(
  prayer: SearchablePrayer,
  baseIndex: PrayerSearchIndex,
): PrayerSearchIndex {
  validateDocument(prayer);
  const without = removePrayerFromIndexInternal(prayer.id, baseIndex);
  const docs = new Map(without.docs);
  docs.set(prayer.id, prayer);
  const trigrams = new Map(without.trigrams);
  indexPrayerInternal(prayer, trigrams);
  return {
    trigrams,
    docs,
    indexedAtIso: baseIndex.indexedAtIso,
    locale: baseIndex.locale,
    totalDocs: docs.size,
  };
}

/**
 * Remove a prayer's postings from the index. Returns a NEW index without
 * the prayer in the docs map and without any of its postings.
 */
export function removePrayerFromIndex(
  prayerId: string,
  baseIndex: PrayerSearchIndex,
): PrayerSearchIndex {
  const without = removePrayerFromIndexInternal(prayerId, baseIndex);
  return without;
}

function removePrayerFromIndexInternal(
  prayerId: string,
  baseIndex: PrayerSearchIndex,
): PrayerSearchIndex {
  const docs = new Map(baseIndex.docs);
  docs.delete(prayerId);
  const trigrams = new Map<string, TrigramIndex>();
  for (const [g, idx] of baseIndex.trigrams) {
    const filtered: PostingEntry[] = [];
    for (const p of idx.postingList) {
      if (p.prayerId !== prayerId) filtered.push(p);
    }
    if (filtered.length > 0) {
      const seen = new Set<string>();
      let n = 0;
      for (const p of filtered) {
        if (!seen.has(p.prayerId)) {
          seen.add(p.prayerId);
          n += 1;
        }
      }
      trigrams.set(g, { trigram: g, postingList: filtered, docFreq: n });
    }
  }
  return {
    trigrams,
    docs,
    indexedAtIso: baseIndex.indexedAtIso,
    locale: baseIndex.locale,
    totalDocs: docs.size,
  };
}

/**
 * Serialise the index to a plain JSON-friendly shape. The format is
 * forward-compatible (the engine refuses to deserialise older snapshots
 * missing the `version` field).
 */
export function serializeIndex(index: PrayerSearchIndex): SerializedIndex {
  const trigrams: SerializedTrigram[] = [];
  for (const [g, idx] of index.trigrams) {
    trigrams.push({
      trigram: g,
      docFreq: idx.docFreq,
      postings: idx.postingList.map((p) => ({
        prayerId: p.prayerId,
        locale: p.locale,
        positions: [...p.positions],
        fieldBoost: p.fieldBoost,
      })),
    });
  }
  const docs: SerializedDoc[] = [];
  for (const p of index.docs.values()) {
    docs.push({
      id: p.id,
      title: p.title,
      tradition: p.tradition,
      category: p.category,
      locale: p.locale,
      text: p.text,
      attribution: p.attribution,
      sacredness_level: p.sacredness_level,
      reserved: p.reserved,
      created_at_iso: p.created_at_iso,
    });
  }
  return {
    version: 1,
    indexedAtIso: index.indexedAtIso,
    locale: index.locale,
    totalDocs: index.totalDocs,
    trigrams,
    docs,
  };
}

/**
 * Restore a `PrayerSearchIndex` from `serializeIndex`'s output.
 * Throws `IndexSerializationError` if the payload is malformed.
 */
export function deserializeIndex(json: SerializedIndex): PrayerSearchIndex {
  if (json.version !== 1) {
    throw new IndexSerializationError(`unsupported version ${json.version}`);
  }
  if (!Array.isArray(json.trigrams) || !Array.isArray(json.docs)) {
    throw new IndexSerializationError("missing trigrams or docs array");
  }
  const trigrams = new Map<string, TrigramIndex>();
  for (const t of json.trigrams) {
    if (typeof t.trigram !== "string" || !Array.isArray(t.postings)) {
      throw new IndexSerializationError(`malformed trigram entry "${String(t.trigram)}"`);
    }
    trigrams.set(t.trigram, {
      trigram: t.trigram,
      docFreq: t.docFreq,
      postingList: t.postings.map((p: SerializedTrigram['postings'][number]) => ({
        prayerId: p.prayerId,
        locale: p.locale,
        positions: [...p.positions],
        fieldBoost: p.fieldBoost,
      })),
    });
  }
  const docs = new Map<string, SearchablePrayer>();
  for (const d of json.docs) {
    docs.set(d.id, {
      id: d.id,
      title: d.title,
      tradition: d.tradition,
      category: d.category,
      locale: d.locale,
      text: d.text,
      attribution: d.attribution,
      sacredness_level: d.sacredness_level,
      reserved: d.reserved,
      created_at_iso: d.created_at_iso,
    });
  }
  return {
    trigrams,
    docs,
    indexedAtIso: json.indexedAtIso,
    locale: json.locale,
    totalDocs: json.totalDocs,
  };
}

/**
 * Merge two indexes into a single one. When the same prayer id appears
 * in both, the second index wins (last-write semantics). Postings from
 * both indexes are unioned for the trigram buckets.
 */
export function mergeIndexes(a: PrayerSearchIndex, b: PrayerSearchIndex): PrayerSearchIndex {
  const docs = new Map<string, SearchablePrayer>();
  for (const p of a.docs.values()) docs.set(p.id, p);
  for (const p of b.docs.values()) docs.set(p.id, p);

  const trigrams = new Map<string, TrigramIndex>();
  for (const [g, idx] of a.trigrams) trigrams.set(g, idx);
  for (const [g, idx] of b.trigrams) {
    const existing = trigrams.get(g);
    if (!existing) {
      trigrams.set(g, idx);
      continue;
    }
    const seen = new Set<string>();
    const merged: PostingEntry[] = [];
    for (const p of [...existing.postingList, ...idx.postingList]) {
      if (!seen.has(`${p.prayerId}|${p.locale}|${p.fieldBoost}`)) {
        seen.add(`${p.prayerId}|${p.locale}|${p.fieldBoost}`);
        merged.push(p);
      }
    }
    const docSeen = new Set<string>();
    let n = 0;
    for (const p of merged) {
      if (!docSeen.has(p.prayerId)) {
        docSeen.add(p.prayerId);
        n += 1;
      }
    }
    trigrams.set(g, { trigram: g, postingList: merged, docFreq: n });
  }
  const latestIndexed = a.indexedAtIso > b.indexedAtIso ? a.indexedAtIso : b.indexedAtIso;
  return {
    trigrams,
    docs,
    indexedAtIso: latestIndexed,
    locale: a.locale,
    totalDocs: docs.size,
  };
}

/**
 * Intersect two posting lists (AND semantics). Returns the unique
 * prayer ids appearing in BOTH lists. We collapse multiple locales to
 * the intersection entry's first occurrence.
 */
export function intersectPostings(
  a: readonly PostingEntry[],
  b: readonly PostingEntry[],
): readonly PostingEntry[] {
  const set = new Set<string>();
  const out: PostingEntry[] = [];
  for (const p of a) set.add(`${p.prayerId}|${p.locale}`);
  for (const p of b) {
    const k = `${p.prayerId}|${p.locale}`;
    if (set.has(k)) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Union two posting lists (OR semantics). De-duplicates by
 * (prayerId, locale, fieldBoost) composite key.
 */
export function unionPostings(
  a: readonly PostingEntry[],
  b: readonly PostingEntry[],
): readonly PostingEntry[] {
  const seen = new Set<string>();
  const out: PostingEntry[] = [];
  for (const p of [...a, ...b]) {
    const k = `${p.prayerId}|${p.locale}|${p.fieldBoost}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(p);
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// §6  FUZZY MATCHING (Levenshtein)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a fuzzy distance value. Caller passes this before asking for
 * fuzzy matching to fail loudly on bad input.
 */
export function validateFuzzyDistance(d: number): void {
  if (!Number.isFinite(d) || Math.floor(d) !== d || d < 0 || d > FUZZY_MAX_DISTANCE_HARD_CAP) {
    throw new InvalidFuzzyDistanceError(d);
  }
}

/**
 * Levenshtein edit distance. Uses a row-major DP over the shorter of
 * the two strings (always allocating m+1 cells, where m = |b|). Returns
 * an integer >= 0.
 */
export function computeLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure shorter string is on the column axis to keep memory bounded.
  const s1 = a.length <= b.length ? a : b;
  const s2 = a.length <= b.length ? b : a;
  const m = s1.length;

  let prev = new Array<number>(m + 1);
  let curr = new Array<number>(m + 1);
  for (let j = 0; j <= m; j += 1) prev[j] = j;

  for (let i = 1; i <= s2.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= m; j += 1) {
      const c1 = s2.charCodeAt(i - 1);
      const c2 = s1.charCodeAt(j - 1);
      const cost = c1 === c2 ? 0 : 1;
      const del = (prev[j] as number) + 1;
      const ins = (curr[j - 1] as number) + 1;
      const sub = (prev[j - 1] as number) + cost;
      const v = del < ins ? del : ins;
      curr[j] = v < sub ? v : sub;
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[m] as number;
}

/**
 * Compute Levenshtein but early-exit if distance exceeds `maxDistance`.
 * Useful inside fuzzySearch where we only care about tokens within a
 * small radius.
 */
export function computeLevenshteinBounded(a: string, b: string, maxDistance: number): number {
  validateFuzzyDistance(maxDistance);
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;

  const s1 = a.length <= b.length ? a : b;
  const s2 = a.length <= b.length ? b : a;
  const m = s1.length;
  const prev = new Array<number>(m + 1);
  const curr = new Array<number>(m + 1);
  for (let j = 0; j <= m; j += 1) prev[j] = j;

  for (let i = 1; i <= s2.length; i += 1) {
    curr[0] = i;
    let rowMin = curr[0] as number;
    for (let j = 1; j <= m; j += 1) {
      const c1 = s2.charCodeAt(i - 1);
      const c2 = s1.charCodeAt(j - 1);
      const cost = c1 === c2 ? 0 : 1;
      const del = (prev[j] as number) + 1;
      const ins = (curr[j - 1] as number) + 1;
      const sub = (prev[j - 1] as number) + cost;
      const v = del < ins ? del : ins;
      const chosen = v < sub ? v : sub;
      curr[j] = chosen;
      if (chosen < rowMin) rowMin = chosen;
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    for (let j = 0; j <= m; j += 1) prev[j] = curr[j] as number;
  }
  return prev[m] as number;
}

/**
 * Find the best fuzzy match for `term` in `vocabulary`. Returns null if
 * no token is within `maxDistance`. The fuzzy score in [0,1] is
 * 1 - distance/max(len(term), len(vocab)).
 */
export function bestFuzzyMatch(
  term: string,
  vocabulary: readonly string[],
  maxDistance: number = FUZZY_MAX_DISTANCE_DEFAULT,
  locale: LocaleId = "pt-BR",
): { match: string; distance: number; score: number } | null {
  assertLocale(locale);
  validateFuzzyDistance(maxDistance);
  if (term.length === 0) return null;
  const normTerm = normalizeToken(term, locale);
  if (normTerm.length === 0) return null;

  let best: { match: string; distance: number; score: number } | null = null;
  for (const v of vocabulary) {
    const normV = normalizeToken(v, locale);
    const d = computeLevenshteinBounded(normTerm, normV, maxDistance);
    if (d > maxDistance) continue;
    const denom = Math.max(normTerm.length, normV.length);
    const score = denom === 0 ? 0 : 1 - d / denom;
    if (best === null || score > best.score) {
      best = { match: normV, distance: d, score };
    }
  }
  return best;
}

/**
 * Return every vocabulary token within `maxDistance`. Ordered by score
 * descending, then alphabetically. Useful for snippet generation where
 * we want to show "did you mean …" candidates.
 */
export function listFuzzyMatches(
  term: string,
  vocabulary: readonly string[],
  maxDistance: number = FUZZY_MAX_DISTANCE_DEFAULT,
  locale: LocaleId = "pt-BR",
  cap: number = DEFAULT_FUZZY_CANDIDATE_CAP,
): readonly { match: string; distance: number; score: number }[] {
  assertLocale(locale);
  validateFuzzyDistance(maxDistance);
  if (term.length === 0 || cap <= 0) return [];
  const normTerm = normalizeToken(term, locale);
  if (normTerm.length === 0) return [];

  const results: { match: string; distance: number; score: number }[] = [];
  for (const v of vocabulary) {
    const normV = normalizeToken(v, locale);
    const d = computeLevenshteinBounded(normTerm, normV, maxDistance);
    if (d > maxDistance) continue;
    const denom = Math.max(normTerm.length, normV.length);
    const score = denom === 0 ? 0 : 1 - d / denom;
    results.push({ match: normV, distance: d, score });
    if (results.length >= cap) break;
  }
  results.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.match.localeCompare(b.match);
  });
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// §7  SEMANTIC CLUSTERING (n-gram shingles + Jaccard)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate k-gram shingles from a string. Each shingle is the k-char
 * substring (no padding — we use word-boundary trigrams for semantic
 * similarity to keep the set compact).
 *
 * We lowercase + strip accents but KEEP stopwords, because semantically
 * equivalent texts often swap stopwords while preserving content words.
 */
export function generateNGramsShingles(text: string, k: number = 3): readonly string[] {
  if (k < 1) return [];
  const norm = stripAccents(text.toLowerCase());
  if (norm.length < k) return [norm];
  const out: string[] = [];
  for (let i = 0; i + k <= norm.length; i += 1) {
    out.push(norm.slice(i, i + k));
  }
  return out;
}

/**
 * Set-similarity via Jaccard index. |A ∩ B| / |A ∪ B|. Returns 0 for two
 * empty sets (avoid divide-by-zero). Strings are tokenised by spaces so
 * callers can pass human-readable phrases.
 */
export function jaccardSimilarity(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set<string>();
  for (const x of a) setA.add(x);
  const setB = new Set<string>();
  for (const x of b) setB.add(x);
  let inter = 0;
  let uni = 0;
  // Use the smaller set as the iteration anchor for speed.
  const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  for (const x of small) {
    uni += 1;
    if (large.has(x)) inter += 1;
  }
  for (const x of large) {
    if (!small.has(x)) uni += 1;
  }
  if (uni === 0) return 0;
  return inter / uni;
}

/**
 * Compute Jaccard over k-shingled texts. Convenience wrapper that
 * shingles both strings at the same k before computing similarity.
 */
export function shingleJaccard(a: string, b: string, k: number = 3): number {
  return jaccardSimilarity(generateNGramsShingles(a, k), generateNGramsShingles(b, k));
}

/**
 * Find the most similar documents in the corpus to `queryText` using
 * shingle Jaccard. Caller can pass the pre-built `PrayerSearchIndex`.
 * Returns at most `topK` matches sorted by similarity descending.
 */
export function semanticSearch(
  queryText: string,
  index: PrayerSearchIndex,
  topK: number = 20,
  k: number = 3,
): readonly { prayerId: string; score: number; locale: LocaleId }[] {
  if (!(topK > 0)) throw new Error("topK must be > 0");
  if (!(k > 0)) throw new Error("k must be > 0");
  const queryShingles = generateNGramsShingles(queryText, k);
  if (queryShingles.length === 0) return [];
  const results: { prayerId: string; score: number; locale: LocaleId }[] = [];
  for (const p of index.docs.values()) {
    if (p.reserved) continue; // reserved slots never surface via semantic public search
    const target = `${p.title} ${p.attribution} ${p.text}`;
    const score = jaccardSimilarity(queryShingles, generateNGramsShingles(target, k));
    if (score > 0) results.push({ prayerId: p.id, score, locale: p.locale });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

// ─────────────────────────────────────────────────────────────────────────────
// §8  QUERY PARSER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pull a quoted phrase out of the head of the input. Returns the phrase
 * (without quotes) and the remainder of the input after the closing
 * quote, or null if no quoted phrase starts the input.
 */
function consumePhrase(input: string): { phrase: string; rest: string } | null {
  const trimmed = input.trimStart();
  if (trimmed.length === 0) return null;
  if (trimmed.charCodeAt(0) !== 0x22 /* " */) return null;
  let i = 1;
  let buf: string[] = [];
  while (i < trimmed.length) {
    const c = trimmed.charCodeAt(i);
    if (c === 0x22) {
      const rest = trimmed.slice(i + 1);
      return { phrase: buf.join(""), rest };
    }
    buf.push(trimmed[i] as string);
    i += 1;
  }
  return null;
}

/**
 * Try to consume a facet filter at the head of the input, e.g.
 * `locale:pt-BR`, `tradition:ifa`, `category:grounding`. Returns the
 * facet kind, value and remainder, or null.
 */
function consumeFacet(
  input: string,
): { kind: "locale" | "tradition" | "category"; value: string; rest: string } | null {
  const trimmed = input.trimStart();
  const m = /^(locale|tradition|category):([^\s]+)/i.exec(trimmed);
  if (m && m[1] && m[2]) {
    const rest = trimmed.slice(m[0].length);
    return {
      kind: m[1].toLowerCase() as "locale" | "tradition" | "category",
      value: m[2],
      rest,
    };
  }
  return null;
}

/**
 * Pull the next token from the input. Operators recognised:
 *  - "AND" / "OR" / "NOT" (case-insensitive)
 *  - "-" prefix (NOT)
 *  - quoted phrases (already consumed by `consumePhrase`)
 *  - bare word (until whitespace)
 */
function consumeToken(input: string): { kind: "term" | "and" | "or" | "not" | "bare-not"; text: string; rest: string } | null {
  const trimmed = input.trimStart();
  if (trimmed.length === 0) return null;

  if (trimmed.charCodeAt(0) === 0x2d /* - */) {
    // bare NOT marker.
    const next = trimmed.slice(1);
    const m = /^(\S+)/.exec(next);
    if (m && m[1]) {
      return { kind: "bare-not", text: m[1], rest: next.slice(m[1].length) };
    }
    return null;
  }

  const m = /^(\S+)/.exec(trimmed);
  if (!m || !m[1]) return null;
  const word = m[1];
  const upper = word.toUpperCase();
  if (upper === "AND") return { kind: "and", text: "AND", rest: trimmed.slice(m[0].length) };
  if (upper === "OR") return { kind: "or", text: "OR", rest: trimmed.slice(m[0].length) };
  if (upper === "NOT") {
    // Consume the next word too.
    const after = trimmed.slice(m[0].length).trimStart();
    const m2 = /^(\S+)/.exec(after);
    if (m2 && m2[1]) {
      return { kind: "not", text: m2[1], rest: after.slice(m2[1].length) };
    }
    return { kind: "not", text: "", rest: "" };
  }
  return { kind: "term", text: word, rest: trimmed.slice(m[0].length) };
}

/**
 * Parse a raw query string into a `ParsedQuery`. The parser is
 * permissive: unknown facet values are kept (validation happens in
 * `validateQuery`); bad structure yields empty term lists but never
 * throws.
 */
export function parseQuery(raw: string, locale: LocaleId = "pt-BR"): ParsedQuery {
  assertLocale(locale);
  if (typeof raw !== "string") throw new TypeError("parseQuery: raw must be a string");
  const terms: QueryTerm[] = [];
  const excluded: string[] = [];
  const phrases: string[] = [];
  let localeFilter: LocaleId | undefined;
  const tradFilter: Tradition[] = [];
  const catFilter: PrayerCategory[] = [];
  let position = 0;
  let next = raw;

  // Extract phrases + facets up-front, then walk terms.
  while (true) {
    const phrase = consumePhrase(next);
    if (phrase) {
      const normPhrase = stripAccents(phrase.phrase.trim().toLowerCase());
      if (normPhrase.length > 0) phrases.push(normPhrase);
      next = phrase.rest;
      continue;
    }
    const facet = consumeFacet(next);
    if (facet) {
      if (facet.kind === "locale") {
        const cand = facet.value as LocaleId;
        if (isLocale(cand)) localeFilter = cand;
      } else if (facet.kind === "tradition") {
        tradFilter.push(facet.value as Tradition);
      } else {
        catFilter.push(facet.value as PrayerCategory);
      }
      next = facet.rest;
      continue;
    }
    break;
  }

  while (next.trim().length > 0) {
    const tok = consumeToken(next);
    if (!tok) break;
    if (tok.kind === "term") {
      terms.push({ text: tok.text, boost: 1.0, position });
      position += 1;
    } else if (tok.kind === "bare-not" || tok.kind === "not") {
      if (tok.text.length > 0) {
        excluded.push(tok.text);
      }
    }
    // "and" / "or" are operator markers we currently ignore; the engine
    // treats all terms as implicit AND. We DO surface them in the parsed
    // shape so future engine iterations can honour them without
    // changing the parser API.
    next = tok.rest;
  }

  return {
    terms,
    excludedTerms: excluded,
    requiredPhrases: phrases,
    localeFilter,
    traditionFilter: tradFilter.length > 0 ? tradFilter : undefined,
    categoryFilter: catFilter.length > 0 ? catFilter : undefined,
  };
}

/**
 * Lightweight schema check for a `SearchQuery`. Fills defaults for any
 * missing optional fields. Throws `QueryValidationError` on hard failures.
 */
export function validateQuery(q: SearchQuery): SearchQuery {
  if (typeof q.raw !== "string") {
    throw new QueryValidationError("raw", "must be a string");
  }
  if (!q.parsed) {
    throw new QueryValidationError("parsed", "must be a ParsedQuery");
  }
  const validModes: SearchMode[] = ["lexical", "fuzzy", "semantic", "hybrid", "exact"];
  if (!validModes.includes(q.mode)) {
    throw new QueryValidationError("mode", `must be one of ${validModes.join(",")}`);
  }
  if (q.locale !== undefined && !isLocale(q.locale)) {
    throw new QueryValidationError("locale", `must be one of ${SUPPORTED_LOCALES.join(",")}`);
  }
  if (q.fuzzyMaxDistance !== undefined) {
    validateFuzzyDistance(q.fuzzyMaxDistance);
  }
  if (q.sensitivityMax !== undefined) {
    if (!Number.isFinite(q.sensitivityMax) || q.sensitivityMax < 1 || q.sensitivityMax > 5) {
      throw new QueryValidationError("sensitivityMax", "must be 1..5");
    }
  }
  if (!Number.isFinite(q.limit) || q.limit <= 0) {
    throw new QueryValidationError("limit", "must be > 0");
  }
  if (q.limit > SEARCH_RESULT_HARD_LIMIT) {
    throw new QueryValidationError("limit", `must be <= ${SEARCH_RESULT_HARD_LIMIT}`);
  }
  if (!Number.isFinite(q.offset) || q.offset < 0) {
    throw new QueryValidationError("offset", "must be >= 0");
  }
  if (q.userOptInLogging === undefined || q.userOptInLogging === null) {
    throw new QueryValidationError("userOptInLogging", "must be explicitly true or false");
  }

  return {
    raw: q.raw,
    parsed: q.parsed,
    mode: q.mode,
    locale: q.locale,
    traditions: q.traditions,
    categories: q.categories,
    sensitivityMax: q.sensitivityMax ?? 5,
    includeReserved: q.includeReserved ?? false,
    fuzzyMaxDistance: q.fuzzyMaxDistance ?? FUZZY_MAX_DISTANCE_DEFAULT,
    limit: Math.min(q.limit, SEARCH_RESULT_HARD_LIMIT),
    offset: q.offset,
    sort: q.sort ?? DEFAULT_SORT_ORDER,
    highlightPre: q.highlightPre ?? DEFAULT_HIGHLIGHT_PRE,
    highlightPost: q.highlightPost ?? DEFAULT_HIGHLIGHT_POST,
    snippetMaxLength: q.snippetMaxLength ?? SNIPPET_MAX_LENGTH_DEFAULT,
    userOptInLogging: q.userOptInLogging,
  };
}

/**
 * Validate a locale string. Throws if unsupported.
 */
export function validateLocale(locale: string): void {
  if (!isLocale(locale)) throw new InvalidLocaleError(locale);
}

/**
 * Type-guard for LocaleId.
 */
export function isLocale(value: string): value is LocaleId {
  return value === "pt-BR" || value === "en-US" || value === "es-ES";
}

/**
 * Assert that a locale is supported. Use internally as a precondition.
 */
export function assertLocale(locale: string): asserts locale is LocaleId {
  if (!isLocale(locale)) throw new InvalidLocaleError(locale);
}

/**
 * Validate that a document has the minimum shape required to index it.
 * Throws `IndexDocumentError` on bad input.
 */
export function validateDocument(doc: SearchablePrayer): void {
  if (typeof doc.id !== "string" || doc.id.length === 0) {
    throw new IndexDocumentError("id must be a non-empty string");
  }
  if (typeof doc.title !== "string") {
    throw new IndexDocumentError("title must be a string");
  }
  if (typeof doc.attribution !== "string") {
    throw new IndexDocumentError("attribution must be a string");
  }
  if (typeof doc.text !== "string") {
    throw new IndexDocumentError("text must be a string");
  }
  if (!SUPPORTED_TRADITIONS.includes(doc.tradition)) {
    throw new IndexDocumentError(`unsupported tradition "${String(doc.tradition)}"`);
  }
  if (!SUPPORTED_CATEGORIES.includes(doc.category)) {
    throw new IndexDocumentError(`unsupported category "${String(doc.category)}"`);
  }
  if (!isLocale(doc.locale)) {
    throw new IndexDocumentError(`unsupported locale "${doc.locale}"`);
  }
  const sacred = Number(doc.sacredness_level);
  if (!Number.isInteger(sacred) || sacred < 1 || sacred > 5) {
    throw new IndexDocumentError(`sacredness_level must be 1..5 (got ${String(doc.sacredness_level)})`);
  }
  if (!doc.reserved && doc.text.length === 0) {
    throw new IndexDocumentError("non-reserved prayer must have non-empty text");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// §9  SEARCH EXECUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Internal hit accumulator used by every search mode. Tracks:
 *  - which fields matched (title / attribution / body)
 *  - how many distinct terms matched
 *  - aggregate field boost
 *  - best fuzzy distance per term
 *  - exact-phrase hits
 */
export interface InternalHit {
  prayerId: string;
  locale: LocaleId;
  /** Distinct normalised terms that contributed. */
  matchedTerms: Set<string>;
  matchedFields: { title: number; body: number; attribution: number };
  /** Sum of field boosts from contributing postings. */
  fieldBoostSum: number;
  /** Best fuzzy score per matched term, 0..1. */
  fuzzyScore: number;
  /** Number of exact-phrase hits. */
  phraseHits: number;
}

function newHit(prayerId: string, locale: LocaleId): InternalHit {
  return {
    prayerId,
    locale,
    matchedTerms: new Set<string>(),
    matchedFields: { title: 0, body: 0, attribution: 0 },
    fieldBoostSum: 0,
    fuzzyScore: 0,
    phraseHits: 0,
  };
}

/**
 * Lexical (trigram posting walk) search. Walks each query term's
 * trigrams, finds docs that match a minimum threshold of those trigrams,
 * and unions the result across terms.
 *
 * Threshold logic: a doc must contain at least `requiredMatches` of the
 * query term's trigrams, where `requiredMatches = max(1, n - 1)` and
 * `n` is the number of trigrams in the padded query term. This makes
 * the matcher tolerate the boundary trigrams ("o  " etc.) that the
 * indexed text does not contain for word-internal positions, while
 * still preserving a strong phrase-match signal.
 */
export function lexicalSearch(
  query: SearchQuery,
  index: PrayerSearchIndex,
): readonly { hit: InternalHit; postingCount: number }[] {
  const hits = new Map<string, InternalHit>();
  let totalPostings = 0;

  for (const term of query.parsed.terms) {
    const norm = normalizeToken(term.text, query.locale ?? index.locale);
    if (norm.length < TRIGRAM_MIN_LENGTH) continue;
    const grams = extractTrigrams(norm);
    if (grams.length === 0) continue;
    const requiredMatches = Math.max(1, grams.length - 1);

    // Score each doc by the number of its query trigrams that match.
    const docMatchCounts = new Map<string, { posting: PostingEntry; matches: number; fieldBoostSum: number; titleHits: number; bodyHits: number; attributionHits: number }>();
    for (const g of grams) {
      const bucket = index.trigrams.get(g);
      if (!bucket) continue;
      totalPostings += bucket.postingList.length;
      for (const p of bucket.postingList) {
        const k = `${p.prayerId}|${p.locale}`;
        let entry = docMatchCounts.get(k);
        if (!entry) {
          entry = { posting: p, matches: 0, fieldBoostSum: 0, titleHits: 0, bodyHits: 0, attributionHits: 0 };
          docMatchCounts.set(k, entry);
        }
        entry.matches += 1;
        entry.fieldBoostSum += p.fieldBoost;
        if (p.fieldBoost >= 2.0) entry.titleHits += 1;
        else if (p.fieldBoost >= 1.5) entry.attributionHits += 1;
        else entry.bodyHits += 1;
      }
    }

    for (const [k, entry] of docMatchCounts) {
      if (entry.matches < requiredMatches) continue;
      let hit = hits.get(k);
      if (!hit) {
        // Use the original posting to recover prayerId/locale.
        const [prayerId, locale] = k.split("|") as [string, LocaleId];
        hit = newHit(prayerId, locale);
        hits.set(k, hit);
      }
      hit.matchedTerms.add(norm);
      hit.fieldBoostSum += entry.fieldBoostSum;
      hit.matchedFields.title += entry.titleHits;
      hit.matchedFields.body += entry.bodyHits;
      hit.matchedFields.attribution += entry.attributionHits;
    }
  }

  // Phrase hits (substring search across the original text — cheap).
  for (const phrase of query.parsed.requiredPhrases) {
    if (phrase.length === 0) continue;
    for (const p of index.docs.values()) {
      const hay = `${p.title}\n${p.attribution}\n${p.reserved ? "" : p.text}`.toLowerCase();
      const idx = hay.indexOf(stripAccents(phrase.toLowerCase()));
      if (idx >= 0) {
        const k = `${p.id}|${p.locale}`;
        let hit = hits.get(k);
        if (!hit) {
          hit = newHit(p.id, p.locale);
          hits.set(k, hit);
        }
        hit.phraseHits += 1;
        hit.matchedTerms.add(stripAccents(phrase.toLowerCase()));
      }
    }
  }

  return [...hits.values()].map((hit) => ({ hit, postingCount: totalPostings }));
}

/**
 * Fuzzy search. Builds a vocabulary from the indexed docs (title +
 * attribution + text), then for each query term finds the best
 * Levenshtein match within `fuzzyMaxDistance`. Returns hits with a
 * fuzzy score contribution.
 */
export function fuzzySearch(
  query: SearchQuery,
  index: PrayerSearchIndex,
  maxDistance: number = query.fuzzyMaxDistance ?? FUZZY_MAX_DISTANCE_DEFAULT,
): readonly { hit: InternalHit; matchedTerm: string }[] {
  validateFuzzyDistance(maxDistance);
  const hits = new Map<string, InternalHit>();

  // Build vocabulary (unique normalised tokens across all docs).
  const vocab = new Set<string>();
  for (const p of index.docs.values()) {
    const tokens = tokenizeKeepStopwords(`${p.title} ${p.attribution} ${p.text}`, p.locale);
    for (const t of tokens) vocab.add(t);
  }
  const vocabArr = [...vocab];

  const out: { hit: InternalHit; matchedTerm: string }[] = [];

  for (const term of query.parsed.terms) {
    const norm = normalizeToken(term.text, query.locale ?? index.locale);
    if (norm.length === 0) continue;
    const matches = listFuzzyMatches(
      norm,
      vocabArr,
      maxDistance,
      query.locale ?? index.locale,
      DEFAULT_FUZZY_CANDIDATE_CAP,
    );
    if (matches.length === 0) continue;
    const best = matches[0];
    if (!best) continue;
    // For each matched vocabulary word, find every doc that contains it.
    for (const p of index.docs.values()) {
      const tokens = tokenizeKeepStopwords(`${p.title} ${p.attribution} ${p.text}`, p.locale);
      if (!tokens.includes(best.match)) continue;
      const k = `${p.id}|${p.locale}`;
      let hit = hits.get(k);
      if (!hit) {
        hit = newHit(p.id, p.locale);
        hits.set(k, hit);
      }
      hit.fuzzyScore = Math.max(hit.fuzzyScore, best.score);
      hit.matchedTerms.add(best.match);
      out.push({ hit, matchedTerm: best.match });
    }
  }

  return out;
}

/**
 * Semantic search via k-shingle Jaccard over title + body. Returns hits
 * with a semantic score contribution.
 */
export function semanticSearchHits(
  query: SearchQuery,
  index: PrayerSearchIndex,
  topK: number = 100,
): readonly { hit: InternalHit; score: number }[] {
  const results = semanticSearch(query.raw, index, topK, 3);
  const hits = new Map<string, InternalHit>();
  for (const r of results) {
    const k = `${r.prayerId}|${r.locale}`;
    let hit = hits.get(k);
    if (!hit) {
      hit = newHit(r.prayerId, r.locale);
      hits.set(k, hit);
    }
    hit.matchedTerms.add(`semantic:${r.score.toFixed(3)}`);
    // Re-use fuzzyScore field to carry the semantic contribution; the
    // multi-factor model knows which signal to read.
    hit.fuzzyScore = Math.max(hit.fuzzyScore, r.score);
  }
  return [...hits.values()].map((hit) => ({ hit, score: hit.fuzzyScore }));
}

/**
 * Exact-phrase search. Substring scan across title/attribution/text,
 * normalised. Returns hits with a phraseHits count.
 */
export function exactPhraseSearch(
  phrase: string,
  index: PrayerSearchIndex,
): readonly InternalHit[] {
  if (phrase.length === 0) return [];
  const normPhrase = stripAccents(phrase.toLowerCase());
  const hits: InternalHit[] = [];
  for (const p of index.docs.values()) {
    const hay = `${p.title}\n${p.attribution}\n${p.reserved ? "" : p.text}`;
    if (stripAccents(hay.toLowerCase()).includes(normPhrase)) {
      const hit = newHit(p.id, p.locale);
      hit.phraseHits += 1;
      hit.matchedTerms.add(normPhrase);
      hits.push(hit);
    }
  }
  return hits;
}

/**
 * Hybrid search: runs lexical + fuzzy + semantic in parallel and
 * unions their hits by (prayerId, locale). Returns the merged hit map.
 */
export function hybridSearch(
  query: SearchQuery,
  index: PrayerSearchIndex,
): readonly { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }[] {
  const lexHits = lexicalSearch(query, index);
  const fuzHits = fuzzySearch(query, index);
  const semHits = semanticSearchHits(query, index);

  const merged = new Map<string, { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }>();

  // Lexical contribution: fieldBoostSum / (terms × 2).
  const maxLexical = Math.max(1, query.parsed.terms.length * 2);
  for (const { hit } of lexHits) {
    const k = `${hit.prayerId}|${hit.locale}`;
    let entry = merged.get(k);
    if (!entry) {
      entry = { hit: newHit(hit.prayerId, hit.locale), lexicalScore: 0, fuzzyScore: 0, semanticScore: 0 };
      merged.set(k, entry);
    }
    const score = Math.min(1, hit.fieldBoostSum / maxLexical);
    entry.lexicalScore = Math.max(entry.lexicalScore, score);
    // Accumulate matched fields + phrase hits from the lexical hit.
    entry.hit.matchedFields.title += hit.matchedFields.title;
    entry.hit.matchedFields.body += hit.matchedFields.body;
    entry.hit.matchedFields.attribution += hit.matchedFields.attribution;
    entry.hit.phraseHits += hit.phraseHits;
    // Accumulate field boost as the engine's lexical signal source.
    entry.hit.fieldBoostSum += hit.fieldBoostSum;
    for (const t of hit.matchedTerms) entry.hit.matchedTerms.add(t);
  }

  // Fuzzy contribution.
  for (const { hit } of fuzHits) {
    const k = `${hit.prayerId}|${hit.locale}`;
    let entry = merged.get(k);
    if (!entry) {
      entry = { hit: newHit(hit.prayerId, hit.locale), lexicalScore: 0, fuzzyScore: 0, semanticScore: 0 };
      merged.set(k, entry);
    }
    entry.fuzzyScore = Math.max(entry.fuzzyScore, hit.fuzzyScore);
    entry.hit.fuzzyScore = Math.max(entry.hit.fuzzyScore, hit.fuzzyScore);
    for (const t of hit.matchedTerms) entry.hit.matchedTerms.add(t);
  }

  // Semantic contribution (uses fuzzyScore field; here we surface it as semanticScore).
  for (const { hit, score } of semHits) {
    const k = `${hit.prayerId}|${hit.locale}`;
    let entry = merged.get(k);
    if (!entry) {
      entry = { hit: newHit(hit.prayerId, hit.locale), lexicalScore: 0, fuzzyScore: 0, semanticScore: 0 };
      merged.set(k, entry);
    }
    entry.semanticScore = Math.max(entry.semanticScore, score);
    entry.hit.fuzzyScore = Math.max(entry.hit.fuzzyScore, score);
    for (const t of hit.matchedTerms) entry.hit.matchedTerms.add(t);
  }

  return [...merged.values()];
}

// ─────────────────────────────────────────────────────────────────────────────
// §10  SCORING & RANKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply facet filters (locale, tradition, category, sensitivity,
 * reserved) to a hit map. Returns the surviving entries.
 */
export function applyFacetFilters(
  hits: readonly { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }[],
  query: SearchQuery,
  index: PrayerSearchIndex,
): readonly { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }[] {
  return hits.filter(({ hit }) => {
    const doc = index.docs.get(hit.prayerId);
    if (!doc) return false;
    if (query.locale && doc.locale !== query.locale) return false;
    if (query.traditions && !query.traditions.includes(doc.tradition)) return false;
    if (query.categories && !query.categories.includes(doc.category)) return false;
    if (query.sensitivityMax !== undefined && doc.sacredness_level > query.sensitivityMax) {
      return false;
    }
    if (doc.reserved && !query.includeReserved) return false;
    return true;
  });
}

/**
 * Apply excluded terms (NOT operator). A hit is dropped if any of its
 * matched terms matches an excluded term (after normalisation).
 */
export function applyExcludedTerms(
  hits: readonly { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }[],
  query: SearchQuery,
): readonly { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }[] {
  if (query.parsed.excludedTerms.length === 0) return hits;
  const excluded = new Set(
    query.parsed.excludedTerms.map((e) => normalizeToken(e, query.locale ?? "pt-BR")),
  );
  return hits.filter(({ hit }) => {
    for (const t of hit.matchedTerms) {
      if (excluded.has(t)) return false;
    }
    return true;
  });
}

/**
 * Multi-factor score for a single hit. Returns the final 0..1 score
 * and the factor breakdown. Weights are normalised so they always sum
 * to 1 inside the function.
 */
export function scoreResult(
  args: {
    hit: InternalHit;
    lexicalScore: number;
    fuzzyScore: number;
    semanticScore: number;
    phraseHits: number;
    doc: SearchablePrayer;
    query: SearchQuery;
    index: PrayerSearchIndex;
    config?: SearchConfig;
    userTradition?: Tradition | null;
    resonances?: readonly ResonanceLink[];
  },
): { score: number; factors: readonly SearchFactor[] } {
  const cfg = args.config ?? DEFAULT_SEARCH_CONFIG;
  const factors: SearchFactor[] = [];

  const lexicalScore = Math.min(1, Math.max(0, args.lexicalScore));
  const fuzzyScore = Math.min(1, Math.max(0, args.fuzzyScore));
  const semanticScore = Math.min(1, Math.max(0, args.semanticScore));
  const exactPhraseScore = Math.min(1, args.phraseHits / Math.max(1, args.query.parsed.requiredPhrases.length || 1));

  const recencyFactor = boostByRecency(args.doc, 1.0, Date.now());
  const resonanceFactor = boostByResonance(args.doc, args.resonances ?? []);
  const traditionFactor = boostByTradition(args.doc, 1.0, args.userTradition ?? null);
  const titleFactor = boostByTitle(args.hit.matchedFields.title, cfg.titleBoost);

  factors.push({ name: "lexical", score: lexicalScore, weight: cfg.lexicalWeight, contribution: lexicalScore * cfg.lexicalWeight });
  factors.push({ name: "fuzzy", score: fuzzyScore, weight: cfg.fuzzyWeight, contribution: fuzzyScore * cfg.fuzzyWeight });
  factors.push({ name: "semantic", score: semanticScore, weight: cfg.semanticWeight, contribution: semanticScore * cfg.semanticWeight });
  factors.push({ name: "recency", score: recencyFactor, weight: cfg.recencyWeight, contribution: recencyFactor * cfg.recencyWeight });
  factors.push({ name: "resonance", score: resonanceFactor, weight: cfg.resonanceWeight, contribution: resonanceFactor * cfg.resonanceWeight });
  factors.push({ name: "exact_phrase", score: exactPhraseScore, weight: cfg.exactPhraseWeight, contribution: exactPhraseScore * cfg.exactPhraseWeight });

  const weightSum = factors.reduce((acc, f) => acc + f.weight, 0) || 1;
  const baseScore = factors.reduce((acc, f) => acc + f.contribution, 0) / weightSum;
  const final = clamp01(baseScore * titleFactor * traditionFactor);

  return { score: final, factors };
}

/**
 * Rank and paginate hits.
 */
export function rankResults(
  hits: readonly { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }[],
  query: SearchQuery,
  index: PrayerSearchIndex,
  userTradition: Tradition | null = null,
  resonances: readonly ResonanceLink[] = DEFAULT_RESONANCE_PAIRS,
  config: SearchConfig = DEFAULT_SEARCH_CONFIG,
): readonly SearchResult[] {
  const filtered = applyExcludedTerms(hits, query);
  const faceted = applyFacetFilters(filtered, query, index);
  const scored: SearchResult[] = [];
  for (const entry of faceted) {
    const doc = index.docs.get(entry.hit.prayerId);
    if (!doc) continue;
    const { score, factors } = scoreResult({
      hit: entry.hit,
      lexicalScore: entry.lexicalScore,
      fuzzyScore: entry.fuzzyScore,
      semanticScore: entry.semanticScore,
      phraseHits: entry.hit.phraseHits,
      doc,
      query,
      index,
      config,
      userTradition,
      resonances,
    });
    const snippet = generateSnippet(doc, query, query.snippetMaxLength ?? SNIPPET_MAX_LENGTH_DEFAULT, query.highlightPre ?? DEFAULT_HIGHLIGHT_PRE, query.highlightPost ?? DEFAULT_HIGHLIGHT_POST);
    const matchedPositions = extractMatchedPositions(doc, query);
    scored.push({
      prayerId: doc.id,
      locale: doc.locale,
      score,
      factors,
      snippet,
      title: doc.title,
      tradition: doc.tradition,
      category: doc.category,
      sensitivityLevel: doc.sacredness_level,
      matchedPositions,
      isReservedSlot: doc.reserved,
      reservedSlotReason: doc.reserved
        ? "Reserved slot: metadata only. Sacred-text policy requires curator authentication (includeReserved=true) and respectfulUseChecklist verdict."
        : undefined,
    });
  }

  return sortResults(scored, query.sort, query.limit, query.offset);
}

/**
 * Sort results according to `sort`. Pagination is applied AFTER sorting.
 */
export function sortResults(
  results: readonly SearchResult[],
  sort: SortOrder,
  limit: number,
  offset: number,
): readonly SearchResult[] {
  const sorted = [...results];
  switch (sort) {
    case "relevance":
      sorted.sort((a, b) => b.score - a.score);
      break;
    case "recency_desc":
      sorted.sort((a, b) => b.sensitivityLevel - a.sensitivityLevel || b.score - a.score);
      break;
    case "tradition_asc":
      sorted.sort((a, b) => a.tradition.localeCompare(b.tradition) || b.score - a.score);
      break;
    case "sensitivity_asc":
      sorted.sort((a, b) => a.sensitivityLevel - b.sensitivityLevel || b.score - a.score);
      break;
    case "locale_asc":
      sorted.sort((a, b) => a.locale.localeCompare(b.locale) || b.score - a.score);
      break;
    default:
      sorted.sort((a, b) => b.score - a.score);
  }
  return sorted.slice(offset, offset + limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// §11  SNIPPET GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Walk the doc's text looking for the earliest match of any query term;
 * build a snippet around that match, capped at `maxLength`, with
 * highlight markers wrapping every matched substring.
 */
export function generateSnippet(
  doc: SearchablePrayer,
  query: SearchQuery,
  maxLength: number = SNIPPET_MAX_LENGTH_DEFAULT,
  pre: string = DEFAULT_HIGHLIGHT_PRE,
  post: string = DEFAULT_HIGHLIGHT_POST,
): string {
  if (doc.reserved) {
    return "[reserved slot · sacred-text policy]";
  }
  const text = doc.text;
  if (text.length === 0) return "";
  const terms = query.parsed.terms
    .map((t) => stripAccents(t.text.toLowerCase()))
    .filter((t) => t.length >= 2);
  const phrases = query.parsed.requiredPhrases;
  if (terms.length === 0 && phrases.length === 0) {
    return clampStr(text, maxLength);
  }

  const normText = stripAccents(text.toLowerCase());
  let earliest = -1;
  for (const t of terms) {
    const idx = normText.indexOf(t);
    if (idx >= 0 && (earliest === -1 || idx < earliest)) earliest = idx;
  }
  for (const p of phrases) {
    const idx = normText.indexOf(stripAccents(p.toLowerCase()));
    if (idx >= 0 && (earliest === -1 || idx < earliest)) earliest = idx;
  }
  if (earliest < 0) return clampStr(text, maxLength);

  // Build window centred on earliest match.
  const half = Math.max(40, Math.floor((maxLength - 10) / 2));
  const start = Math.max(0, earliest - half);
  const end = Math.min(text.length, earliest + half);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "…" + snippet;
  if (end < text.length) snippet = snippet + "…";

  // Apply highlights on the snippet.
  for (const t of terms) {
    snippet = highlightSubstr(snippet, t, pre, post, true);
  }
  for (const p of phrases) {
    snippet = highlightSubstr(snippet, p, pre, post, true);
  }
  return snippet;
}

/**
 * Wrap every (case- and accent-insensitive) occurrence of `needle` in
 * `pre`/`post`. If `ignoreAccents` is true we run a normalised pass.
 */
export function highlightSubstr(
  haystack: string,
  needle: string,
  pre: string,
  post: string,
  ignoreAccents: boolean,
): string {
  if (needle.length === 0) return haystack;
  if (!ignoreAccents) {
    return wrapAll(haystack, needle, pre, post);
  }
  const normHay = stripAccents(haystack.toLowerCase());
  const normNeedle = stripAccents(needle.toLowerCase());
  if (normNeedle.length === 0) return haystack;
  let out = "";
  let i = 0;
  let cursor = 0;
  while (i < normHay.length) {
    const idx = normHay.indexOf(normNeedle, cursor);
    if (idx < 0) {
      out += haystack.slice(i);
      break;
    }
    out += haystack.slice(i, idx);
    out += pre;
    out += haystack.slice(idx, idx + normNeedle.length);
    out += post;
    cursor = idx + normNeedle.length;
    i = cursor;
  }
  return out;
}

function wrapAll(haystack: string, needle: string, pre: string, post: string): string {
  if (needle.length === 0) return haystack;
  let out = "";
  let cursor = 0;
  const lowerHay = haystack.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  while (cursor < lowerHay.length) {
    const idx = lowerHay.indexOf(lowerNeedle, cursor);
    if (idx < 0) {
      out += haystack.slice(cursor);
      break;
    }
    out += haystack.slice(cursor, idx);
    out += pre;
    out += haystack.slice(idx, idx + lowerNeedle.length);
    out += post;
    cursor = idx + lowerNeedle.length;
  }
  return out;
}

/**
 * Extract the [start, end) char offsets of every matched substring
 * inside the doc's text. Positions are in the ORIGINAL (un-snipped)
 * text so the UI can re-locate matches in the full body.
 */
export function extractMatchedPositions(
  doc: SearchablePrayer,
  query: SearchQuery,
): readonly (readonly [number, number])[] {
  if (doc.reserved) return [];
  const text = doc.text;
  if (text.length === 0) return [];
  const normText = stripAccents(text.toLowerCase());
  const out: [number, number][] = [];
  const seen = new Set<string>();
  for (const t of query.parsed.terms) {
    const norm = stripAccents(t.text.toLowerCase());
    if (norm.length < 2) continue;
    let cursor = 0;
    while (cursor < normText.length) {
      const idx = normText.indexOf(norm, cursor);
      if (idx < 0) break;
      const key = `${idx}:${idx + norm.length}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push([idx, idx + norm.length]);
      }
      cursor = idx + norm.length;
    }
  }
  for (const p of query.parsed.requiredPhrases) {
    const norm = stripAccents(p.toLowerCase());
    if (norm.length < 2) continue;
    let cursor = 0;
    while (cursor < normText.length) {
      const idx = normText.indexOf(norm, cursor);
      if (idx < 0) break;
      const key = `${idx}:${idx + norm.length}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push([idx, idx + norm.length]);
      }
      cursor = idx + norm.length;
    }
  }
  out.sort((a, b) => a[0] - b[0]);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// §12  FACET AGGREGATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute facet counts across a result set. Returns zero-filled
 * records so the UI can render stable, complete facet panels.
 */
export function computeFacets(results: readonly SearchResult[]): FacetAggregations {
  const byTradition: Record<Tradition, number> = {
    candomble: 0, ifa: 0, umbanda: 0, buddhism: 0, hinduism: 0, christianity: 0,
    islam: 0, judaism: 0, taoism: 0, indigenous_brazilian: 0, syncretic: 0, secular_mystical: 0,
  };
  const byCategory: Record<PrayerCategory, number> = {
    morning: 0, evening: 0, gratitude: 0, grounding: 0, healing: 0, protection: 0,
    forgiveness: 0, intention: 0, gratitude_petition: 0, meditation: 0,
    ancestor_veneration: 0, orixa_invocation: 0,
  };
  const byLocale: Record<LocaleId, number> = { "pt-BR": 0, "en-US": 0, "es-ES": 0 };
  const bySensitivityLevel: Record<SacrednessLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let reserved = 0;
  for (const r of results) {
    byTradition[r.tradition] += 1;
    byCategory[r.category] += 1;
    byLocale[r.locale] += 1;
    bySensitivityLevel[r.sensitivityLevel] += 1;
    if (r.isReservedSlot) reserved += 1;
  }
  return {
    byTradition,
    byCategory,
    byLocale,
    bySensitivityLevel,
    totalResults: results.length,
    reservedHits: reserved,
  };
}

/**
 * Total number of unique prayers across the result set (deduped by id).
 */
export function countUniquePrayers(results: readonly SearchResult[]): number {
  const seen = new Set<string>();
  for (const r of results) seen.add(r.prayerId);
  return seen.size;
}

// ─────────────────────────────────────────────────────────────────────────────
// §13  SACRED-TEXT POLICY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Predicate used by `applySacredTextPolicy`. Always returns true for
 * non-reserved rows; returns true for reserved rows ONLY when the
 * caller is an authenticated curator (i.e. `includeReserved`).
 */
export function isReservedSlotFilter(includeReserved: boolean): (doc: SearchablePrayer) => boolean {
  return (doc: SearchablePrayer) => !doc.reserved || includeReserved;
}

/**
 * Apply the sacred-text policy to a result set. Drops any reserved slot
 * whose row is not explicitly authorised by the curator.
 *
 * If `strict` is true and the input set contained reserved slots that
 * we ended up dropping, we throw `SacredTextPolicyError` to alert the
 * caller that something downstream must have leaked a reserved row.
 */
export function applySacredTextPolicy(
  results: readonly SearchResult[],
  includeReserved: boolean,
  strict: boolean = false,
): readonly SearchResult[] {
  const before = results.filter((r) => r.isReservedSlot).length;
  const filtered = results.filter((r) => !r.isReservedSlot || includeReserved);
  if (strict && before > 0 && !includeReserved) {
    throw new SacredTextPolicyError(
      "multiple",
      `${before} reserved slot(s) encountered without includeReserved=true`,
    );
  }
  return filtered;
}

/**
 * Convenience: hard-remove ALL reserved rows from an index snapshot.
 * Used by the public-facing API path that never sees sacred text.
 */
export function stripReservedFromIndex(index: PrayerSearchIndex): PrayerSearchIndex {
  const docs = new Map(index.docs);
  for (const [id, p] of docs) {
    if (p.reserved) docs.delete(id);
  }
  const trigrams = new Map<string, TrigramIndex>();
  for (const [g, idx] of index.trigrams) {
    const filtered = idx.postingList.filter((p) => docs.has(p.prayerId));
    if (filtered.length > 0) {
      const seen = new Set<string>();
      let n = 0;
      for (const p of filtered) {
        if (!seen.has(p.prayerId)) {
          seen.add(p.prayerId);
          n += 1;
        }
      }
      trigrams.set(g, { trigram: g, postingList: filtered, docFreq: n });
    }
  }
  return {
    trigrams,
    docs,
    indexedAtIso: index.indexedAtIso,
    locale: index.locale,
    totalDocs: docs.size,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §14  BOOST HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Title boost. Multiplier of 1.0 by default; each title hit adds the
 * configured `boost` factor multiplicatively.
 */
export function boostByTitle(titleHits: number, boost: number = DEFAULT_SEARCH_CONFIG.titleBoost): number {
  if (titleHits <= 0) return 1.0;
  return Math.pow(boost, Math.min(titleHits, 3));
}

/**
 * Recency boost. Exponential decay with half-life `halfLifeDays`.
 * Rows older than 4× halfLife contribute near-zero boost.
 */
export function boostByRecency(
  doc: SearchablePrayer,
  baseScore: number,
  nowMs: number,
  halfLifeDays: number = DEFAULT_SEARCH_CONFIG.recencyHalfLifeDays,
): number {
  if (!doc.created_at_iso) return 1.0;
  const t = Date.parse(doc.created_at_iso);
  if (!Number.isFinite(t)) return 1.0;
  const ageDays = Math.max(0, (nowMs - t) / (1000 * 60 * 60 * 24));
  const factor = Math.pow(0.5, ageDays / halfLifeDays);
  return baseScore * factor;
}

/**
 * Tradition affinity boost. When the user has declared a tradition,
 * docs from that tradition get `TRADITION_AFFINITY_BOOSTS[t]` (>= 1.0);
 * other docs are mildly penalised (× 0.85).
 */
export function boostByTradition(
  doc: SearchablePrayer,
  baseScore: number,
  userTradition: Tradition | null,
): number {
  if (!userTradition) return baseScore;
  if (doc.tradition === userTradition) {
    const mult = TRADITION_AFFINITY_BOOSTS[doc.tradition] ?? 1.0;
    return baseScore * mult;
  }
  // Soft penalisation: keep cross-tradition resonance alive but nudge
  // the user's own tradition slightly higher.
  return baseScore * 0.85;
}

/**
 * Resonance boost. Score in [0,1]. The caller passes the resonance
 * table to inspect; we count any link from the doc's id (either as
 * from_id or to_id) and weight by `strength` (1..3).
 */
export function boostByResonance(
  doc: SearchablePrayer,
  resonances: readonly ResonanceLink[],
): number {
  if (resonances.length === 0) return 0;
  let maxStrength = 0;
  for (const r of resonances) {
    if (r.from_id === doc.id || r.to_id === doc.id) {
      if (r.strength > maxStrength) maxStrength = r.strength;
    }
  }
  return maxStrength === 0 ? 0 : maxStrength / 3;
}

/**
 * Combine two factors multiplicatively. Useful for chaining tradition
 * and recency boosts before plugging into the multi-factor model.
 */
export function chainBoosts(...factors: readonly number[]): number {
  let out = 1.0;
  for (const f of factors) out *= f;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// §15  LGPD COMPLIANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Capture the user's opt-in decision. Returns true if logging is
 * permitted, false if the user has not (yet) consented. The decision
 * is recorded with a captured_at_iso so the audit trail is durable.
 */
export function respectSearchLogOptIn(
  userId: string,
  decision: { opt_in: boolean; captured_at_iso?: string },
): { user_id: string; opt_in: boolean; captured_at_iso: string } {
  if (typeof userId !== "string" || userId.length === 0) {
    throw new LgpdOptInMissingError(userId);
  }
  return {
    user_id: userId,
    opt_in: decision.opt_in === true,
    captured_at_iso: decision.captured_at_iso ?? new Date().toISOString(),
  };
}

/**
 * Redact a search log entry for export. Strips the raw query (which may
 * contain sensitive phrases) when `fields.query_raw === false`.
 */
export function redactSearchLog(
  log: SearchLogEntry,
  fields: { query_raw?: boolean; parsed?: boolean; result_ids?: boolean } = {},
): SearchLogEntry {
  const keepRaw = fields.query_raw !== false;
  const keepParsed = fields.parsed !== false;
  const keepIds = fields.result_ids !== false;
  return {
    user_id: log.user_id,
    query_raw: keepRaw ? log.query_raw : "[redacted]",
    query_parsed: keepParsed ? log.query_parsed : emptyParsedQuery(),
    mode: log.mode,
    result_count: log.result_count,
    result_ids: keepIds ? log.result_ids : [],
    facet: log.facet,
    captured_at_iso: log.captured_at_iso,
    redacted: !keepRaw || !keepParsed || !keepIds,
  };
}

function emptyParsedQuery(): ParsedQuery {
  return {
    terms: [],
    excludedTerms: [],
    requiredPhrases: [],
  };
}

/**
 * Build a SearchLogEntry from a SearchQuery + result set + facet
 * counts. Caller MUST have already gated on `userOptInLogging=true`.
 */
export function buildSearchLogEntry(
  userId: string,
  query: SearchQuery,
  results: readonly SearchResult[],
  facets: FacetAggregations,
  capturedAtIso: string = new Date().toISOString(),
): SearchLogEntry {
  if (!query.userOptInLogging) {
    throw new LgpdOptInMissingError(userId);
  }
  return {
    user_id: userId,
    query_raw: query.raw,
    query_parsed: query.parsed,
    mode: query.mode,
    result_count: results.length,
    result_ids: results.map((r) => r.prayerId),
    facet: facets,
    captured_at_iso: capturedAtIso,
    redacted: false,
  };
}

/**
 * LGPD Art. 18 right to deletion. Returns a deletion receipt that the
 * caller can surface in the UI. The engine itself does NOT persist
 * logs — the caller passes its own in-memory `logs: Map` and we mutate
 * it in place.
 */
export function deleteSearchHistory(
  userId: string,
  retentionDays: number,
  logs: Map<string, SearchLogEntry[]>,
): { user_id: string; deleted_count: number; receipt_at_iso: string } {
  if (!Number.isFinite(retentionDays) || retentionDays < 0) {
    throw new QueryValidationError("retentionDays", "must be >= 0");
  }
  const before = logs.get(userId)?.length ?? 0;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const kept: SearchLogEntry[] = [];
  for (const entry of logs.get(userId) ?? []) {
    const t = Date.parse(entry.captured_at_iso);
    if (Number.isFinite(t) && t >= cutoff) kept.push(entry);
  }
  if (kept.length === 0) logs.delete(userId);
  else logs.set(userId, kept);
  return {
    user_id: userId,
    deleted_count: before - kept.length,
    receipt_at_iso: new Date().toISOString(),
  };
}

/**
 * LGPD Art. 18 right to portability. Returns an export envelope
 * suitable for download. Format can be `json` (default) or `csv`.
 */
export function getSearchHistory(
  userId: string,
  logs: ReadonlyMap<string, readonly SearchLogEntry[]>,
  options: { format?: "json" | "csv"; dateRange?: { fromIso: string; toIso: string } } = {},
): SearchLogExport {
  const format = options.format ?? "json";
  const fromT = options.dateRange ? Date.parse(options.dateRange.fromIso) : -Infinity;
  const toT = options.dateRange ? Date.parse(options.dateRange.toIso) : Infinity;
  const raw = logs.get(userId) ?? [];
  const entries: SearchLogEntry[] = [];
  for (const e of raw) {
    const t = Date.parse(e.captured_at_iso);
    if (Number.isFinite(t) && t >= fromT && t <= toT) entries.push(e);
  }
  let content: string;
  if (format === "json") {
    content = JSON.stringify(entries, null, 2);
  } else {
    const header = ["user_id", "captured_at_iso", "mode", "result_count", "query_raw", "result_ids"];
    const lines = [header.join(",")];
    for (const e of entries) {
      lines.push(
        [
          e.user_id,
          e.captured_at_iso,
          e.mode,
          e.result_count.toString(),
          `"${e.query_raw.replace(/"/g, '""')}"`,
          `"${[...e.result_ids].join('|')}"`,
        ].join(","),
      );
    }
    content = lines.join("\n");
  }
  return {
    user_id: userId,
    entries,
    format,
    byte_size: textByteLength(content),
    generated_at_iso: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §16  PUBLIC API — search() entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * High-level search entry point. Runs the requested mode, applies
 * sacred-text policy, then returns paginated `SearchResult` rows.
 *
 * Sacred-text policy is ALWAYS applied; reserved slots only surface
 * when the caller sets `includeReserved=true` (curator auth).
 */
export function search(
  query: SearchQuery,
  index: PrayerSearchIndex,
  options: {
    userTradition?: Tradition | null;
    resonances?: readonly ResonanceLink[];
    config?: SearchConfig;
    strictSacredText?: boolean;
  } = {},
): readonly SearchResult[] {
  const normalised = validateQuery(query);

  let rawHits: readonly { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }[];
  if (normalised.mode === "lexical") {
    rawHits = lexicalSearch(normalised, index).map(({ hit }) => ({
      hit,
      lexicalScore: Math.min(1, hit.fieldBoostSum / Math.max(1, normalised.parsed.terms.length * 2)),
      fuzzyScore: 0,
      semanticScore: 0,
    }));
  } else if (normalised.mode === "fuzzy") {
    rawHits = fuzzySearch(normalised, index).map(({ hit }) => ({
      hit,
      lexicalScore: 0,
      fuzzyScore: hit.fuzzyScore,
      semanticScore: 0,
    }));
  } else if (normalised.mode === "semantic") {
    rawHits = semanticSearchHits(normalised, index).map(({ hit }) => ({
      hit,
      lexicalScore: 0,
      fuzzyScore: 0,
      semanticScore: hit.fuzzyScore,
    }));
  } else if (normalised.mode === "exact") {
    const exactHits: { hit: InternalHit; lexicalScore: number; fuzzyScore: number; semanticScore: number }[] = [];
    for (const phrase of normalised.parsed.requiredPhrases) {
      for (const hit of exactPhraseSearch(phrase, index)) {
        exactHits.push({ hit, lexicalScore: 0, fuzzyScore: 0, semanticScore: 0 });
      }
    }
    rawHits = exactHits;
  } else {
    rawHits = hybridSearch(normalised, index);
  }

  const ranked = rankResults(
    rawHits,
    normalised,
    index,
    options.userTradition ?? null,
    options.resonances ?? DEFAULT_RESONANCE_PAIRS,
    options.config ?? DEFAULT_SEARCH_CONFIG,
  );

  return applySacredTextPolicy(ranked, normalised.includeReserved === true, options.strictSacredText === true);
}

/**
 * Convenience: build the index from a corpus, run a search, and return
 * the results. Throws on validation errors; never silently coerces.
 */
export function searchCorpus(
  corpus: readonly SearchablePrayer[],
  query: SearchQuery,
  options: {
    userTradition?: Tradition | null;
    resonances?: readonly ResonanceLink[];
    config?: SearchConfig;
    strictSacredText?: boolean;
  } = {},
): readonly SearchResult[] {
  const index = buildInvertedIndex(corpus);
  return search(query, index, options);
}

// ─────────────────────────────────────────────────────────────────────────────
// §17  INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function clampStr(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)) + "…";
}

function textByteLength(s: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(s).length;
  }
  let n = 0;
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    if (code < 0x80) n += 1;
    else if (code < 0x800) n += 2;
    else if (code >= 0xd800 && code <= 0xdbff) { n += 4; i += 1; }
    else n += 3;
  }
  return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// §18  SERIALIZED TYPES (for `serializeIndex` / `deserializeIndex`)
// ─────────────────────────────────────────────────────────────────────────────

export interface SerializedIndex {
  readonly version: 1;
  readonly indexedAtIso: string;
  readonly locale: LocaleId;
  readonly totalDocs: number;
  readonly trigrams: readonly SerializedTrigram[];
  readonly docs: readonly SerializedDoc[];
}

export interface SerializedTrigram {
  readonly trigram: string;
  readonly docFreq: number;
  readonly postings: readonly {
    readonly prayerId: string;
    readonly locale: LocaleId;
    readonly positions: readonly number[];
    readonly fieldBoost: number;
  }[];
}

export interface SerializedDoc {
  readonly id: string;
  readonly title: string;
  readonly tradition: Tradition;
  readonly category: PrayerCategory;
  readonly locale: LocaleId;
  readonly text: string;
  readonly attribution: string;
  readonly sacredness_level: SacrednessLevel;
  readonly reserved: boolean;
  readonly created_at_iso?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// §19  PUBLIC SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export interface EngineSummary {
  readonly totalDocs: number;
  readonly totalTrigrams: number;
  readonly totalPostings: number;
  readonly reservedDocs: number;
  readonly locales: readonly LocaleId[];
  readonly traditions: readonly Tradition[];
}

/**
 * Build a small summary of the current index. Useful for ops dashboards
 * and for the wave-spawner report.
 */
export function summariseIndex(index: PrayerSearchIndex): EngineSummary {
  let reserved = 0;
  const tradSet = new Set<Tradition>();
  const locSet = new Set<LocaleId>();
  for (const p of index.docs.values()) {
    if (p.reserved) reserved += 1;
    tradSet.add(p.tradition);
    locSet.add(p.locale);
  }
  let totalPostings = 0;
  for (const t of index.trigrams.values()) totalPostings += t.postingList.length;
  return {
    totalDocs: index.docs.size,
    totalTrigrams: index.trigrams.size,
    totalPostings,
    reservedDocs: reserved,
    locales: [...locSet].sort(),
    traditions: [...tradSet].sort(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §20  END — w50/prayer-corpus-deep-search
// ─────────────────────────────────────────────────────────────────────────────