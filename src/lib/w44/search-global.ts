// ============================================================================
// SEARCH GLOBAL + FILTERS — Wave 44
// ----------------------------------------------------------------------------
// Motor de busca federado para `community | marketplace | events | all`.
// Implementação in-memory (Map<term, Set<docId>>) para sandbox + fixtures
// + feature flag `W44_SEARCH_GLOBAL`. NÃO substitui o índice GIN do
// Postgres (`lib/search/filters.ts`); é uma camada de quick-match que
// roda no servidor de borda.
//
// Features (brief W44):
//   1. Full-text cross-domain (posts/users/listings/events)
//   2. Faceted filters (type, tradition, language, date, level, price,
//      modality, rating)
//   3. Typo tolerance (Levenshtein, max 2 edits)
//   4. Recent / popular / suggested / relevance
//   5. Ranking: text (BM25) + recency + engagement + tradition affinity
//   6. Highlighted snippets (`<mark>`)
//   7. Saved searches + alerts
//   8. Empty-state suggestions
//
// Decisões:
//   - Pure TS, sem JSX/React. UI fica em outro wave.
//   - Unicode NFC + diacritic strip (PT-BR: candomblé, xamanismo, ã, ç).
//   - BM25 simplificado (k1=1.5, b=0.75) — bom até ~10k docs.
//   - 4 sinais de ranking com pesos configuráveis via `RankingWeights`.
//   - Snippet HTML é escapado; entradas do usuário nunca viram HTML cru.
//
// Limites:
//   - `add()` escala bem até ~100k docs; acima disso use Postgres GIN.
//   - `query()` retorna no máximo `limit` (default 20, max 200).
//   - `typoCorrect()` é O(|V|) por termo; vocabulários > 50k pedem BK-tree.
// ============================================================================

// ============================================================================
// Tipos públicos
// ============================================================================

/** Escopo federado da busca.
 * @example new SearchIndex('community') // só posts + users */
export type SearchScope = 'community' | 'marketplace' | 'events' | 'all';

/** Tipo de documento indexável. */
export type SearchDocType = 'post' | 'user' | 'listing' | 'event';

/** Tradição espiritual (espelha `lib/events/types.ts`). */
export type Tradition =
  | 'cabala' | 'ifa' | 'astrologia' | 'tantra' | 'reiki' | 'meditacao'
  | 'xamanismo' | 'cristianismo-mistico' | 'sufismo' | 'taoismo'
  | 'umbanda' | 'candomble' | 'umbanda-candomble' | 'tarot' | 'cigano';

/** Modalidade de evento / curso. */
export type Modality = 'online' | 'presencial' | 'hybrid';

/** Nível (curso OU evidência de artigo). */
export type Level =
  | 'beginner' | 'intermediate' | 'advanced'
  | 'ANECDOTAL' | 'LOW' | 'MEDIUM' | 'HIGH';

/** Engajamento agregado. */
export interface Engagement {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

/** Documento indexável. Apenas `id`, `type`, `title`, `body`, `createdAt` são obrigatórios.
 * @example
 *   index.add({ id: 'p1', type: 'post', title: 'Candomblé', body: '...',
 *     createdAt: Date.now(), tradition: 'candomble' }); */
export interface SearchDocument {
  id: string;
  type: SearchDocType;
  title: string;
  body: string;
  tradition?: Tradition;
  language?: string;
  createdAt: number | Date;
  updatedAt?: number | Date;
  engagement?: Engagement;
  rating?: number;
  priceCents?: number;
  modality?: Modality;
  level?: Level;
  authorId?: string;
  authorTradition?: Tradition;
  tags?: string[];
  extraFields?: Record<string, string | number | undefined>;
}

/** Filtros facetados (todos opcionais). */
export interface SearchFacets {
  tradition?: Tradition | Tradition[];
  language?: string | string[];
  dateFrom?: number | Date;
  dateTo?: number | Date;
  level?: Level | Level[];
  priceMin?: number;
  priceMax?: number;
  modality?: Modality | Modality[];
  ratingMin?: number;
  /** Lista branca de tipos (sobrescreve o escopo do índice). */
  types?: SearchDocType[];
}

/** Pesos do ranking — ajustáveis por query. */
export interface RankingWeights {
  text: number;
  recency: number;
  engagement: number;
  traditionAffinity: number;
  titleBoost: number;
  tagBoost: number;
}

/** Query de busca. `q` pode conter facet-syntax (`"cabala tradition:candomble"`).
 * @example index.query({ q: 'meditação tradition:cabala', scope: 'all' }) */
export interface SearchQuery {
  q: string;
  scope?: SearchScope;
  facets?: SearchFacets;
  mode?: 'recent' | 'popular' | 'suggested' | 'relevance';
  userTradition?: Tradition;
  limit?: number;
  offset?: number;
  typoTolerance?: boolean;
  highlight?: boolean;
  weights?: Partial<RankingWeights>;
}

/** Hit retornado. */
export interface SearchHit {
  id: string;
  type: SearchDocType;
  title: string;
  snippet: string;
  score: number;
  scoreBreakdown: {
    text: number;
    recency: number;
    engagement: number;
    traditionAffinity: number;
  };
  matchedTerms: string[];
  correctedTerms: string[];
  tradition?: Tradition;
  createdAt: string;
  doc: SearchDocument;
}

/** Bucket de faceta. */
export interface FacetBucket { value: string; count: number; }

/** Resultado de `query()`. */
export interface SearchResult {
  hits: SearchHit[];
  total: number;
  facets: Record<keyof SearchFacets, FacetBucket[]>;
  suggestions: string[];
  took: number;
}

/** Busca salva. */
export interface SavedSearch {
  id: string;
  userId: string;
  query: string;
  parsed: Omit<SearchQuery, 'limit' | 'offset'>;
  createdAt: number;
  lastUsedAt: number;
  alertEnabled: boolean;
  lastAlertAt?: number;
}

// ============================================================================
// Constantes
// ============================================================================

/** Stopwords PT — curtas, alta frequência, baixo sinal semântico. */
const STOPWORDS_PT = new Set<string>([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
  'para', 'por', 'com', 'sem', 'sob', 'sobre',
  'e', 'ou', 'mas', 'que', 'se', 'ja',
  'eu', 'tu', 'ele', 'ela', 'nos', 'vos', 'eles', 'elas',
  'meu', 'minha', 'teu', 'tua', 'seu', 'sua', 'nosso', 'nossa',
  'este', 'esta', 'isto', 'esse', 'essa', 'isso',
  'aquele', 'aquela', 'aquilo',
  'foi', 'era', 'ser', 'ter', 'haver', 'fazer',
  'muito', 'muita', 'pouco', 'pouca', 'mais', 'menos',
  'tambem', 'ainda', 'sempre', 'nunca', 'talvez',
  'aqui', 'ali', 'la', 'ca', 'onde', 'quando', 'como', 'porque',
]);

/** Pesos default. */
export const DEFAULT_WEIGHTS: RankingWeights = {
  text: 0.55, recency: 0.20, engagement: 0.15, traditionAffinity: 0.10,
  titleBoost: 2.5, tagBoost: 1.8,
};

const BM25_K1 = 1.5;
const BM25_B = 0.75;
const RECENCY_HALF_LIFE_DAYS = 14;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;
const MAX_TYPO_DISTANCE = 2;

/** Mapa de "tradições irmãs" — usado pelo affinity score. */
const TRADITION_SISTERS: Record<Tradition, Tradition[]> = {
  cabala: ['cristianismo-mistico', 'sufismo', 'taoismo'],
  ifa: ['candomble', 'umbanda'],
  candomble: ['ifa', 'umbanda', 'umbanda-candomble'],
  umbanda: ['candomble', 'umbanda-candomble', 'ifa'],
  'umbanda-candomble': ['candomble', 'umbanda'],
  astrologia: ['tarot', 'cabala'],
  tantra: ['meditacao', 'cristianismo-mistico'],
  reiki: ['meditacao', 'tantra'],
  meditacao: ['tantra', 'reiki', 'cristianismo-mistico'],
  xamanismo: ['cristianismo-mistico'],
  'cristianismo-mistico': ['cabala', 'sufismo', 'meditacao'],
  sufismo: ['cabala', 'cristianismo-mistico'],
  taoismo: ['cabala', 'meditacao'],
  tarot: ['astrologia', 'cabala'],
  cigano: ['tarot', 'astrologia'],
};

/** Mapa de tradição → label legível. */
const TRADITION_LABELS: Record<Tradition, string> = {
  cabala: 'Cabala', ifa: 'Ifá', astrologia: 'Astrologia',
  tantra: 'Tantra', reiki: 'Reiki', meditacao: 'Meditação',
  xamanismo: 'Xamanismo', 'cristianismo-mistico': 'Cristianismo Místico',
  sufismo: 'Sufismo', taoismo: 'Taoísmo', umbanda: 'Umbanda',
  candomble: 'Candomblé', 'umbanda-candomble': 'Umbanda & Candomblé',
  tarot: 'Tarot', cigano: 'Cigano',
};

// ============================================================================
// Normalização / tokenização
// ============================================================================

/** Normaliza: NFC + lowercase + strip de diacríticos + ç → c.
 * @example normalizeText('Candomblé') // 'candomble' */
export function normalizeText(input: string): string {
  if (!input) return '';
  const nfc = typeof input.normalize === 'function' ? input.normalize('NFC') : input;
  return nfc
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c');
}

/** Tokeniza removendo stopwords PT. */
export function tokenize(input: string): string[] {
  if (!input) return [];
  const normalized = normalizeText(input);
  const raw = normalized.split(/[^a-z0-9-]+/i).filter(Boolean);
  return raw.filter((t) => t.length > 1 && !STOPWORDS_PT.has(t));
}

/** Tokeniza sem filtrar stopwords (preserva frase natural). */
export function tokenizeSoft(input: string): string[] {
  if (!input) return [];
  return normalizeText(input).split(/[^a-z0-9-]+/i).filter(Boolean);
}

// ============================================================================
// Levenshtein + typo correction
// ============================================================================

/** Distância de Levenshtein entre duas strings (2-row rolling).
 * @example levenshteinDistance('candomble', 'candoble') // 1 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const m = a.length, n = b.length;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const ac = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ac === b.charCodeAt(j - 1) ? 0 : 1;
      const del = prev[j]! + 1;
      const ins = curr[j - 1]! + 1;
      const sub = prev[j - 1]! + cost;
      curr[j] = Math.min(del, ins, sub);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n]!;
}

/** Corrige um termo contra o vocabulário conhecido.
 * @example typoCorrect('candoble', vocab) // 'candomble' */
export function typoCorrect(
  term: string,
  vocabulary: Set<string>,
  maxDistance: number = MAX_TYPO_DISTANCE
): string {
  if (!term || vocabulary.has(term)) return term;
  let best: string | null = null;
  let bestDist = maxDistance + 1;
  for (const candidate of vocabulary) {
    if (Math.abs(candidate.length - term.length) > maxDistance) continue;
    const d = levenshteinDistance(term, candidate);
    if (d > maxDistance) continue;
    if (d < bestDist) {
      best = candidate; bestDist = d;
    } else if (d === bestDist && best) {
      if (candidate.startsWith(term) && !best.startsWith(term)) {
        best = candidate;
      }
    }
  }
  return best ?? term;
}

// ============================================================================
// parseQuery — extrai facets inline
// ============================================================================

/** Faz parsing de query com facet-syntax (`key:value`, `key:"multi"`, `key:[a,b]`).
 * @example parseQuery('candomblé tradition:ifa level:HIGH')
 *   // { q: 'candomblé', facets: { tradition: 'ifa', level: 'HIGH' } } */
export function parseQuery(raw: string): { q: string; facets: SearchFacets } {
  const qParts: string[] = [];
  const facets: SearchFacets = {};
  const tokenRegex = /([a-zA-Z_]+):(?:"([^"]+)"|'([^']+)'|\[([^\]]+)\]|([^\s]+))/g;
  const recognized = new Set([
    'type', 'types', 'tradition', 'traditions',
    'language', 'languages', 'level', 'levels',
    'modality', 'modalities', 'rating',
    'price', 'date', 'from', 'to', 'tag', 'tags',
  ]);
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(raw)) !== null) {
    const [full, key, qval, sval, lval, tval] = match;
    if (cursor < match.index) qParts.push(raw.slice(cursor, match.index));
    cursor = match.index + full.length;
    if (!recognized.has(key)) { qParts.push(full); continue; }
    const value = qval ?? sval ?? lval ?? tval ?? '';
    if (key === 'type' || key === 'types') {
      facets.types = ((lval ?? value).split(',').map((s) => s.trim()).filter(Boolean)) as SearchDocType[];
    } else if (key === 'tradition' || key === 'traditions') {
      const arr = (lval ?? value).split(',').map((s) => s.trim()).filter(Boolean) as Tradition[];
      facets.tradition = arr.length === 1 ? arr[0] : arr;
    } else if (key === 'language' || key === 'languages') {
      const arr = (lval ?? value).split(',').map((s) => s.trim()).filter(Boolean);
      facets.language = arr.length === 1 ? arr[0] : arr;
    } else if (key === 'level' || key === 'levels') {
      const arr = (lval ?? value).split(',').map((s) => s.trim()).filter(Boolean) as Level[];
      facets.level = arr.length === 1 ? arr[0] : arr;
    } else if (key === 'modality' || key === 'modalities') {
      const arr = (lval ?? value).split(',').map((s) => s.trim()).filter(Boolean) as Modality[];
      facets.modality = arr.length === 1 ? arr[0] : arr;
    } else if (key === 'rating') {
      facets.ratingMin = Number(value);
    } else if (key === 'price') {
      const range = value.match(/^(\d+)\s*-\s*(\d+)$/);
      const plus = value.match(/^(\d+)\+$/);
      if (range) { facets.priceMin = Number(range[1]); facets.priceMax = Number(range[2]); }
      else if (plus) { facets.priceMin = Number(plus[1]); }
      else { facets.priceMax = Number(value); }
    } else if (key === 'date' || key === 'from') {
      facets.dateFrom = new Date(value).getTime();
    } else if (key === 'to') {
      facets.dateTo = new Date(value).getTime();
    } else if (key === 'tag' || key === 'tags') {
      qParts.push(value);
    }
  }
  if (cursor < raw.length) qParts.push(raw.slice(cursor));
  return { q: qParts.join(' ').trim(), facets };
}

// ============================================================================
// buildSnippet — highlight com <mark>
// ============================================================================

/** Gera snippet do texto ao redor do primeiro match, escapando HTML.
 * @example buildSnippet('Ritual de Candomblé em Salvador', ['candomble'], 30)
 *   // '…Ritual de <mark>Candomblé</mark> em Salvador' */
export function buildSnippet(text: string, terms: string[], maxLength: number = 160): string {
  if (!text) return '';
  if (!terms.length) {
    return escapeHtml(text.slice(0, maxLength)) + (text.length > maxLength ? '…' : '');
  }
  const normalized = normalizeText(text);
  let bestStart = -1;
  let bestTerm = '';
  for (const t of terms) {
    const idx = normalized.indexOf(t);
    if (idx >= 0 && (bestStart === -1 || idx < bestStart)) {
      bestStart = idx; bestTerm = t;
    }
  }
  if (bestStart === -1) {
    return escapeHtml(text.slice(0, maxLength)) + (text.length > maxLength ? '…' : '');
  }
  const half = Math.floor((maxLength - bestTerm.length) / 2);
  const start = Math.max(0, bestStart - half);
  const end = Math.min(text.length, start + maxLength);
  const window = text.slice(start, end);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  const escaped = escapeHtml(window);
  const normalizedWindow = normalizeText(escaped);
  let result = '';
  let cursor = 0;
  const matchRegex = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'g');
  let m: RegExpExecArray | null;
  while ((m = matchRegex.exec(normalizedWindow)) !== null) {
    result += escaped.slice(cursor, m.index);
    result += `<mark>${escaped.slice(m.index, m.index + m[0].length)}</mark>`;
    cursor = m.index + m[0].length;
  }
  result += escaped.slice(cursor);
  return prefix + result + suffix;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Facet matching
// ============================================================================

/** Verifica se um doc satisfaz todas as facetas. `excludeFacet` é usado por
 * `facetCounts` para não aplicar a faceta que está sendo contabilizada. */
export function matchesFacets(
  doc: SearchDocument,
  facets: SearchFacets,
  excludeFacet?: keyof SearchFacets
): boolean {
  if (excludeFacet !== 'types' && facets.types && facets.types.length > 0) {
    if (!facets.types.includes(doc.type)) return false;
  }
  if (excludeFacet !== 'tradition' && facets.tradition) {
    const allowed = Array.isArray(facets.tradition) ? facets.tradition : [facets.tradition];
    if (!doc.tradition || !allowed.includes(doc.tradition)) return false;
  }
  if (excludeFacet !== 'language' && facets.language) {
    const allowed = Array.isArray(facets.language) ? facets.language : [facets.language];
    if (!doc.language || !allowed.includes(doc.language)) return false;
  }
  if (excludeFacet !== 'dateFrom' && facets.dateFrom != null) {
    if (toEpoch(doc.createdAt) < toEpoch(facets.dateFrom)) return false;
  }
  if (excludeFacet !== 'dateTo' && facets.dateTo != null) {
    if (toEpoch(doc.createdAt) > toEpoch(facets.dateTo)) return false;
  }
  if (excludeFacet !== 'level' && facets.level) {
    const allowed = Array.isArray(facets.level) ? facets.level : [facets.level];
    if (!doc.level || !allowed.includes(doc.level)) return false;
  }
  if (excludeFacet !== 'priceMin' && facets.priceMin != null) {
    if (doc.priceCents == null || doc.priceCents < facets.priceMin) return false;
  }
  if (excludeFacet !== 'priceMax' && facets.priceMax != null) {
    if (doc.priceCents == null || doc.priceCents > facets.priceMax) return false;
  }
  if (excludeFacet !== 'modality' && facets.modality) {
    const allowed = Array.isArray(facets.modality) ? facets.modality : [facets.modality];
    if (!doc.modality || !allowed.includes(doc.modality)) return false;
  }
  if (excludeFacet !== 'ratingMin' && facets.ratingMin != null) {
    if (doc.rating == null || doc.rating < facets.ratingMin) return false;
  }
  return true;
}

/** Converte `number | Date` para epoch ms. */
export function toEpoch(v: number | Date): number {
  return typeof v === 'number' ? v : v.getTime();
}

// ============================================================================
// Ranking — BM25 + recency + engagement + affinity
// ============================================================================

/** Calcula BM25 simplificado (com boosts opcionais para título/tags). */
export function bm25Score(
  tfByTerm: Map<string, number>,
  docLength: number,
  avgDocLength: number,
  dfByTerm: Map<string, number>,
  totalDocs: number,
  titleTfByTerm?: Map<string, number>,
  titleBoost: number = DEFAULT_WEIGHTS.titleBoost,
  tagTfByTerm?: Map<string, number>,
  tagBoost: number = DEFAULT_WEIGHTS.tagBoost
): number {
  if (tfByTerm.size === 0) return 0;
  let score = 0;
  for (const [term, tf] of tfByTerm) {
    const df = dfByTerm.get(term) ?? 0;
    if (df === 0) continue;
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
    const normTf = (tf * (BM25_K1 + 1)) /
      (tf + BM25_K1 * (1 - BM25_B + BM25_B * (docLength / Math.max(avgDocLength, 1))));
    score += idf * normTf;
    if (titleTfByTerm) {
      const titleTf = titleTfByTerm.get(term) ?? 0;
      if (titleTf > 0) {
        score += idf * (titleTf * (BM25_K1 + 1)) / (titleTf + BM25_K1) * titleBoost;
      }
    }
    if (tagTfByTerm) {
      const tagTf = tagTfByTerm.get(term) ?? 0;
      if (tagTf > 0) {
        score += idf * (tagTf * (BM25_K1 + 1)) / (tagTf + BM25_K1) * tagBoost;
      }
    }
  }
  return score;
}

/** Decay exponencial de recência (half-life customizável). */
export function recencyScore(
  createdAt: number,
  now: number = Date.now(),
  halfLifeDays: number = RECENCY_HALF_LIFE_DAYS
): number {
  const ageMs = Math.max(0, now - createdAt);
  return Math.pow(0.5, ageMs / (1000 * 60 * 60 * 24 * halfLifeDays));
}

/** Score de engagement normalizado (log-scale + sigmoid). */
export function engagementScore(eng?: Engagement): number {
  if (!eng) return 0;
  const weighted =
    Math.log1p(eng.views || 0) * 1 +
    Math.log1p(eng.likes || 0) * 3 +
    Math.log1p(eng.comments || 0) * 5 +
    Math.log1p(eng.shares || 0) * 8;
  return 1 - Math.exp(-weighted / 4);
}

/** Afinidade por tradição: 1.0 (match exato) / 0.6 (autor) / 0.3 (irmã). */
export function traditionAffinityScore(doc: SearchDocument, userTradition?: Tradition): number {
  if (!userTradition) return 0;
  if (doc.tradition === userTradition) return 1;
  if (doc.authorTradition === userTradition) return 0.6;
  const list = TRADITION_SISTERS[userTradition] ?? [];
  if (doc.tradition && list.includes(doc.tradition)) return 0.3;
  return 0;
}

/** Ranqueia candidatos in-place e converte para `SearchHit[]`. */
export function rankResults(
  candidates: ScoredCandidate[],
  query: SearchQuery,
  now: number = Date.now()
): SearchHit[] {
  const w = { ...DEFAULT_WEIGHTS, ...(query.weights ?? {}) };
  const maxText = candidates.reduce((m, c) => Math.max(m, c.textScore), 0) || 1;
  for (const c of candidates) {
    const textNorm = c.textScore / maxText;
    const recency = recencyScore(toEpoch(c.doc.createdAt), now);
    const engagement = engagementScore(c.doc.engagement);
    const affinity = traditionAffinityScore(c.doc, query.userTradition);
    c.scoreBreakdown = {
      text: textNorm * w.text,
      recency: recency * w.recency,
      engagement: engagement * w.engagement,
      traditionAffinity: affinity * w.traditionAffinity,
    };
    c.finalScore =
      c.scoreBreakdown.text + c.scoreBreakdown.recency +
      c.scoreBreakdown.engagement + c.scoreBreakdown.traditionAffinity;
  }
  candidates.sort((a, b) => {
    if (query.mode === 'recent') return toEpoch(b.doc.createdAt) - toEpoch(a.doc.createdAt);
    if (query.mode === 'popular') return (b.doc.engagement?.likes ?? 0) - (a.doc.engagement?.likes ?? 0);
    return b.finalScore - a.finalScore;
  });
  return candidates.map((c) => c.toHit(query));
}

/** Candidato pré-ranqueado (estrutura interna). */
interface ScoredCandidate {
  doc: SearchDocument;
  textScore: number;
  scoreBreakdown: SearchHit['scoreBreakdown'];
  finalScore: number;
  matchedTerms: string[];
  correctedTerms: string[];
  toHit(query: SearchQuery): SearchHit;
}

function makeScoredCandidate(
  doc: SearchDocument,
  textScore: number,
  matched: string[],
  corrected: string[]
): ScoredCandidate {
  return {
    doc, textScore,
    scoreBreakdown: { text: 0, recency: 0, engagement: 0, traditionAffinity: 0 },
    finalScore: 0,
    matchedTerms: matched,
    correctedTerms: corrected,
    toHit(this: ScoredCandidate, query: SearchQuery): SearchHit {
      return {
        id: this.doc.id,
        type: this.doc.type,
        title: this.doc.title,
        snippet: query.highlight !== false
          ? buildSnippet(this.doc.body, this.matchedTerms, 160)
          : this.doc.body.slice(0, 160),
        score: this.finalScore,
        scoreBreakdown: this.scoreBreakdown,
        matchedTerms: [...this.matchedTerms],
        correctedTerms: [...this.correctedTerms],
        tradition: this.doc.tradition,
        createdAt: new Date(toEpoch(this.doc.createdAt)).toISOString(),
        doc: this.doc,
      };
    },
  };
}

// ============================================================================
// Facet counts
// ============================================================================

/** Distribuição de valores por faceta (excluindo a faceta em si do filtro).
 * @example facetCounts(docs, { tradition: 'candomble' }).tradition
 *   // [{ value: 'candomble', count: 42 }, { value: 'umbanda', count: 17 }] */
export function facetCounts(
  docs: SearchDocument[],
  facets: SearchFacets
): Record<keyof SearchFacets, FacetBucket[]> {
  const facetKeys: (keyof SearchFacets)[] = [
    'types', 'tradition', 'language', 'level', 'modality',
    'dateFrom', 'dateTo', 'priceMin', 'priceMax', 'ratingMin',
  ];
  const out = {} as Record<keyof SearchFacets, FacetBucket[]>;
  for (const fk of facetKeys) {
    if (fk === 'dateFrom' || fk === 'dateTo' ||
        fk === 'priceMin' || fk === 'priceMax' || fk === 'ratingMin') {
      out[fk] = [];
      continue;
    }
    const buckets = new Map<string, number>();
    for (const doc of docs) {
      if (!matchesFacets(doc, facets, fk)) continue;
      const raw = (doc as unknown as Record<string, unknown>)[fk as string];
      if (Array.isArray(raw)) {
        for (const v of raw) {
          if (v == null) continue;
          const key = String(v);
          buckets.set(key, (buckets.get(key) ?? 0) + 1);
        }
      } else if (raw != null) {
        const key = String(raw);
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }
    out[fk] = Array.from(buckets.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }
  return out;
}

// ============================================================================
// SavedSearch
// ============================================================================

/** Salva uma busca (dedupe por userId+query). Recalcula o `parsed`. */
export function saveSearch(
  store: Map<string, SavedSearch>,
  userId: string,
  query: string,
  alertEnabled: boolean = false
): SavedSearch {
  const now = Date.now();
  for (const s of store.values()) {
    if (s.userId === userId && s.query === query) {
      s.lastUsedAt = now;
      s.alertEnabled = alertEnabled;
      return s;
    }
  }
  const id = `sr_${userId}_${now.toString(36)}`;
  const parsed = parseQuery(query);
  const saved: SavedSearch = {
    id, userId, query,
    parsed: { q: parsed.q, facets: parsed.facets },
    createdAt: now, lastUsedAt: now, alertEnabled,
  };
  store.set(id, saved);
  return saved;
}

/** Marca o alerta como enviado (chamado pelo worker de notificação). */
export function markAlertSent(s: SavedSearch, at: number = Date.now()): void {
  s.lastAlertAt = at;
}

// ============================================================================
// Empty-state suggestions
// ============================================================================

/** Sugestão individual para o empty state. */
export interface Suggestion {
  label: string;
  query: string;
  category: 'tradition' | 'topic' | 'recent' | 'trending';
  popularity: number;
}

/** Gera sugestões combinando tradições, tags, recent e trending terms.
 * @example getEmptyStateSuggestions(idx, { recentSearches: ['candomblé'] }) */
export function getEmptyStateSuggestions(
  index: SearchIndex,
  opts?: { recentSearches?: string[]; limit?: number }
): Suggestion[] {
  const limit = opts?.limit ?? 8;
  const out: Suggestion[] = [];

  // 1. Tradições presentes
  const tradCounts = new Map<Tradition, number>();
  for (const doc of index.allDocs()) {
    if (doc.tradition) tradCounts.set(doc.tradition, (tradCounts.get(doc.tradition) ?? 0) + 1);
  }
  const maxTrad = Math.max(1, ...Array.from(tradCounts.values()));
  for (const [trad, count] of tradCounts.entries()) {
    out.push({
      label: prettyTradition(trad),
      query: `tradition:${trad}`,
      category: 'tradition',
      popularity: count / maxTrad,
    });
  }

  // 2. Tópicos recorrentes (tags)
  const tagCounts = new Map<string, number>();
  for (const doc of index.allDocs()) {
    for (const t of doc.tags ?? []) {
      const norm = normalizeText(t);
      tagCounts.set(norm, (tagCounts.get(norm) ?? 0) + 1);
    }
  }
  const maxTag = Math.max(1, ...Array.from(tagCounts.values()));
  for (const [tag, count] of Array.from(tagCounts.entries()).slice(0, 20)) {
    out.push({
      label: tag, query: tag, category: 'topic',
      popularity: (count / maxTag) * 0.8,
    });
  }

  // 3. Buscas recentes
  for (const r of opts?.recentSearches ?? []) {
    out.push({ label: r, query: r, category: 'recent', popularity: 0.5 });
  }

  // 4. Trending terms (top 5 por engagement)
  const engByTerm = new Map<string, number>();
  for (const doc of index.allDocs()) {
    const eng = engagementScore(doc.engagement);
    if (eng === 0) continue;
    for (const t of tokenize(`${doc.title} ${doc.body}`)) {
      engByTerm.set(t, (engByTerm.get(t) ?? 0) + eng);
    }
  }
  const maxEng = Math.max(1, ...Array.from(engByTerm.values()));
  for (const [term, eng] of Array.from(engByTerm.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 5)) {
    out.push({
      label: term, query: term, category: 'trending',
      popularity: (eng / maxEng) * 0.7,
    });
  }

  return out.sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

/** Formata slug de tradição em label legível. */
export function prettyTradition(t: Tradition): string {
  return TRADITION_LABELS[t] ?? t;
}

// ============================================================================
// SearchIndex — classe principal
// ============================================================================

/** Índice invertido in-memory. Suporta add/remove/query com facets, typo
 * correction, BM25 + ranking combinado. Não-thread-safe.
 * @example
 *   const idx = new SearchIndex('all');
 *   idx.add({ id: 'p1', type: 'post', title: 'Candomblé', body: '...', createdAt: Date.now() });
 *   idx.query({ q: 'candomble' }); */
export class SearchIndex {
  readonly scope: SearchScope;
  private readonly index: Map<string, Map<string, number[]>> = new Map();
  private readonly docs: Map<string, SearchDocument> = new Map();
  private readonly vocab: Set<string> = new Set();
  private readonly dfCache: Map<string, number> = new Map();
  private totalDocLength = 0;
  /** Saved searches (separado do índice, mas mantido na mesma classe). */
  readonly savedSearches: Map<string, SavedSearch> = new Map();

  constructor(scope: SearchScope = 'all') {
    this.scope = scope;
  }

  /** Total de documentos. */
  size(): number { return this.docs.size; }

  /** Vocabulário (read-only). */
  getVocabulary(): ReadonlySet<string> { return this.vocab; }

  /** Lista todos os docs. */
  allDocs(): SearchDocument[] { return Array.from(this.docs.values()); }

  /** Recupera um doc pelo id. */
  getDoc(id: string): SearchDocument | undefined { return this.docs.get(id); }

  /** Limpa o índice (preserva savedSearches). */
  clear(): void {
    this.index.clear(); this.docs.clear(); this.vocab.clear();
    this.dfCache.clear(); this.totalDocLength = 0;
  }

  /** Adiciona (ou substitui) um documento. */
  add(doc: SearchDocument): void {
    if (this.docs.has(doc.id)) this.remove(doc.id);
    this.docs.set(doc.id, doc);
    const allTokens = this.tokensFor(doc);
    this.totalDocLength += allTokens.length;
    for (const tok of allTokens) {
      this.vocab.add(tok);
      let postings = this.index.get(tok);
      if (!postings) { postings = new Map(); this.index.set(tok, postings); }
      let positions = postings.get(doc.id);
      if (!positions) { positions = []; postings.set(doc.id, positions); }
      positions.push(allTokens.indexOf(tok));
    }
    for (const tok of new Set(allTokens)) {
      this.dfCache.set(tok, (this.dfCache.get(tok) ?? 0) + 1);
    }
  }

  /** Remove um documento. Idempotente. */
  remove(id: string): boolean {
    const doc = this.docs.get(id);
    if (!doc) return false;
    const allTokens = this.tokensFor(doc);
    for (const tok of new Set(allTokens)) {
      const postings = this.index.get(tok);
      if (postings) {
        postings.delete(id);
        if (postings.size === 0) this.index.delete(tok);
        this.dfCache.set(tok, Math.max(0, (this.dfCache.get(tok) ?? 0) - 1));
        if ((this.dfCache.get(tok) ?? 0) === 0) this.dfCache.delete(tok);
      }
    }
    this.totalDocLength -= allTokens.length;
    this.docs.delete(id);
    return true;
  }

  /** Executa uma busca. Retorna hits ranqueados + facets + sugestões. */
  query(input: SearchQuery): SearchResult {
    const start = performance.now();

    const parsed = parseQuery(input.q);
    const mergedFacets: SearchFacets = { ...parsed.facets, ...(input.facets ?? {}) };
    const q = parsed.q;
    const query: SearchQuery = { ...input, q, facets: mergedFacets };

    const qTokens = tokenize(q);
    const corrected: string[] = [];
    const finalTerms: string[] = [];
    if (query.typoTolerance !== false) {
      for (const t of qTokens) {
        const c = typoCorrect(t, this.vocab);
        finalTerms.push(c);
        if (c !== t) corrected.push(t);
      }
    } else {
      finalTerms.push(...qTokens);
    }
    const termSet = new Set(finalTerms);

    const candidateIds = new Set<string>();
    for (const t of termSet) {
      const postings = this.index.get(t);
      if (postings) for (const id of postings.keys()) candidateIds.add(id);
    }

    const candidates: ScoredCandidate[] = [];
    const avgDocLength = this.docs.size > 0 ? this.totalDocLength / this.docs.size : 1;
    const totalDocs = Math.max(1, this.docs.size);
    for (const id of candidateIds) {
      const doc = this.docs.get(id);
      if (!doc) continue;
      if (!this.inScope(doc.type)) continue;
      if (!matchesFacets(doc, mergedFacets, 'types')) continue;
      const textScore = this.scoreDoc(doc, termSet, avgDocLength, totalDocs);
      if (textScore > 0) {
        candidates.push(makeScoredCandidate(doc, textScore, [...termSet], corrected));
      }
    }

    if (qTokens.length === 0) {
      for (const doc of this.docs.values()) {
        if (!this.inScope(doc.type)) continue;
        if (!matchesFacets(doc, mergedFacets, 'types')) continue;
        candidates.push(makeScoredCandidate(doc, 0, [], []));
      }
    }

    const filteredArr: SearchDocument[] = [];
    for (const doc of this.docs.values()) {
      if (!this.inScope(doc.type)) continue;
      if (matchesFacets(doc, mergedFacets, 'types')) filteredArr.push(doc);
    }
    const facets = facetCounts(filteredArr, mergedFacets);

    const hits = rankResults(candidates, query);
    const offset = Math.max(0, query.offset ?? 0);
    const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
    const sliced = hits.slice(offset, offset + limit);

    return {
      hits: sliced, total: hits.length, facets,
      suggestions: corrected,
      took: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  // ---- internals ----

  private tokensFor(doc: SearchDocument): string[] {
    return [
      ...tokenize(doc.title),
      ...tokenize(doc.body),
      ...(doc.tags ?? []).flatMap((t) => tokenize(t)),
      ...(doc.extraFields
        ? Object.values(doc.extraFields)
            .filter((v): v is string => typeof v === 'string')
            .flatMap((v) => tokenize(v))
        : []),
    ];
  }

  private inScope(type: SearchDocType): boolean {
    if (this.scope === 'all') return true;
    if (this.scope === 'community') return type === 'post' || type === 'user';
    if (this.scope === 'marketplace') return type === 'listing';
    if (this.scope === 'events') return type === 'event';
    return true;
  }

  private scoreDoc(
    doc: SearchDocument,
    terms: Set<string>,
    avgDocLength: number,
    totalDocs: number
  ): number {
    const titleTokens = tokenize(doc.title);
    const bodyTokens = tokenize(doc.body);
    const tagTokens = (doc.tags ?? []).flatMap((t) => tokenize(t));
    const tf = new Map<string, number>();
    const titleTf = new Map<string, number>();
    const tagTf = new Map<string, number>();
    for (const t of bodyTokens) {
      if (!terms.has(t)) continue;
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    for (const t of titleTokens) {
      if (!terms.has(t)) continue;
      titleTf.set(t, (titleTf.get(t) ?? 0) + 1);
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    for (const t of tagTokens) {
      if (!terms.has(t)) continue;
      tagTf.set(t, (tagTf.get(t) ?? 0) + 1);
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    const docLength = titleTokens.length + bodyTokens.length + tagTokens.length;
    return bm25Score(
      tf, docLength, avgDocLength, this.dfCache, totalDocs,
      titleTf, DEFAULT_WEIGHTS.titleBoost,
      tagTf, DEFAULT_WEIGHTS.tagBoost,
    );
  }
}

// ============================================================================
// performance.now shim
// ============================================================================

const performance: { now: () => number } = (() => {
  if (typeof globalThis !== 'undefined' &&
      typeof (globalThis as { performance?: { now: () => number } }).performance?.now === 'function') {
    return (globalThis as { performance: { now: () => number } }).performance;
  }
  return { now: () => Date.now() };
})();

export default SearchIndex;
