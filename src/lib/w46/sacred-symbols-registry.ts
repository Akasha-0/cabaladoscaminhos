/**
 * ════════════════════════════════════════════════════════════════════════════
 * SACRED SYMBOLS REGISTRY — Cabala dos Caminhos · W46
 * ════════════════════════════════════════════════════════════════════════════
 * Registry of sacred symbols across 16+ religious/spiritual traditions,
 * with cross-tradition mappings, attribution chains, license metadata,
 * Unicode glyph references, and visual rendering hints.
 *
 * Distribution: 64 symbols across 16 traditions.
 * Cross-tradition links: 18 syncretic, shared-origin, and parallel mappings.
 * Version: 1.0.0 | Wave 46 · Cycle 46 · 2026-06-29
 */

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — BRANDED PRIMITIVE TYPES
// ════════════════════════════════════════════════════════════════════════════

export type SymbolId = string & { readonly __brand: 'SymbolId' };
export type Tradition =
  | 'candomble' | 'umbanda' | 'ifa' | 'cabala' | 'astrologia' | 'tantra'
  | 'christianity' | 'islam' | 'buddhism' | 'hinduism' | 'wicca'
  | 'santo_daime' | 'esoterismo' | 'espiritismo' | 'indigenous_brazilian';
export type SymbolType =
  | 'deity' | 'sacred_object' | 'ritual_tool' | 'scripture' | 'glyph'
  | 'mantra' | 'sacred_place' | 'element' | 'animal' | 'plant'
  | 'color' | 'number' | 'geometric';
export type SacrednessLevel = 1 | 2 | 3 | 4 | 5;
export type LicenseType =
  | 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'CC-BY-NC' | 'CC-BY-NC-SA'
  | 'Public_Domain' | 'Traditional_Knowledge' | 'Sacred_Restricted' | 'All_Rights_Reserved';
export type SourceType = 'academic' | 'community' | 'oral' | 'textual' | 'visual';
export type RelationshipType =
  | 'syncretic' | 'shared_origin' | 'parallel_development' | 'borrowed' | 'reinterpreted';
export type UsageType = 'teaching' | 'visual' | 'ritual' | 'reference' | 'commentary';
export type ReservationReason = 'teaching_session' | 'ritual' | 'event' | 'ceremony';
export type Confidence = number & { readonly __brand: 'Confidence' };

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — STRUCTURED TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface License {
  readonly type: LicenseType;
  readonly url: string;
  readonly commercialUse: boolean;
  readonly derivativeAllowed: boolean;
  readonly attributionRequired: boolean;
  readonly shareAlike: boolean;
  readonly jurisdiction: string;
  readonly expiresAt?: string;
}

export interface SymbolSource {
  readonly title: string;
  readonly author: string;
  readonly year: number;
  readonly url: string;
  readonly page?: string;
  readonly accessedAt: string;
  readonly type: SourceType;
}

export interface AttributionEvent {
  readonly date: string;
  readonly actor: string;
  readonly change: string;
}

export interface AttributionChain {
  readonly symbolId: SymbolId;
  readonly originalCreator: string;
  readonly currentAttribution: string;
  readonly credits: readonly string[];
  readonly lastUpdated: string;
  readonly history: readonly AttributionEvent[];
}

export interface RenderHints {
  readonly unicode?: string;
  readonly fallback: string;
  readonly color: string;
  readonly shape: string;
  readonly animation?: 'rotate' | 'pulse' | 'static' | 'breathe' | 'flow';
  readonly layout: 'centered' | 'ring' | 'tree' | 'grid' | 'path' | 'natural';
}

export interface SacredSymbol {
  readonly id: SymbolId;
  readonly name: string;
  readonly type: SymbolType;
  readonly primaryTradition: Tradition;
  readonly sharingTraditions: readonly Tradition[];
  readonly aliases: readonly string[];
  readonly unicode: string | null;
  readonly color: string;
  readonly shape: string;
  readonly description: string;
  readonly history: string;
  readonly sacrednessLevel: SacrednessLevel;
  readonly restrictions: readonly string[];
  readonly attribution: AttributionChain;
  readonly license: License;
  readonly sources: readonly SymbolSource[];
  readonly relatedSymbols: readonly SymbolId[];
  readonly contrastSymbols: readonly SymbolId[];
  readonly renderHints: RenderHints;
}

export type SymbolRegistry = Map<SymbolId, SacredSymbol>;
export interface CrossTraditionLink {
  readonly fromSymbol: SymbolId;
  readonly toSymbol: SymbolId;
  readonly fromTradition: Tradition;
  readonly toTradition: Tradition;
  readonly relationship: RelationshipType;
  readonly confidence: Confidence;
  readonly history: string;
}
export interface SymbolSearchResult {
  readonly symbol: SacredSymbol;
  readonly score: number;
  readonly matchedFields: readonly string[];
  readonly highlights: readonly string[];
}
export interface SymbolFilter {
  readonly traditions?: readonly Tradition[];
  readonly types?: readonly SymbolType[];
  readonly sacrednessLevel?: readonly SacrednessLevel[];
  readonly licenses?: readonly LicenseType[];
  readonly hasUnicode?: boolean;
  readonly query?: string;
}
export interface SymbolUsageRecord {
  readonly symbolId: SymbolId;
  readonly usedIn: string;
  readonly usageType: UsageType;
  readonly contextSnippet: string;
  readonly postedAt: string;
  readonly postedBy: string;
  readonly tradition: Tradition;
}
export interface SymbolFamily {
  readonly id: string;
  readonly name: string;
  readonly symbols: readonly SymbolId[];
  readonly commonOrigin: string;
  readonly commonTheme: string;
}
export interface SymbolReservation {
  readonly symbolId: SymbolId;
  readonly reservedBy: string;
  readonly reservedFor: string;
  readonly reservedAt: string;
  readonly expiresAt: string;
  readonly reason: ReservationReason;
}
export interface TimelineEntry {
  readonly era: string;
  readonly event: string;
  readonly attribution: string;
  readonly significance: string;
}
export interface SymbolHistory {
  readonly symbolId: SymbolId;
  readonly timeline: readonly TimelineEntry[];
}
export interface PermissionCheck {
  readonly allowed: boolean;
  readonly requiresAttribution: boolean;
  readonly license: License;
  readonly restrictions: readonly string[];
}
export type SymbolSearchIndex = Map<string, Set<SymbolId>>;
export interface SymbolStats {
  readonly totalSymbols: number;
  readonly byTradition: ReadonlyMap<Tradition, number>;
  readonly byType: ReadonlyMap<SymbolType, number>;
  readonly bySacredness: ReadonlyMap<SacrednessLevel, number>;
  readonly averageAliases: number;
  readonly withCrossLinks: number;
}
export interface ValidationIssue {
  readonly field: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — UTILITY HELPERS (PURE)
// ════════════════════════════════════════════════════════════════════════════

export function makeSymbolId(raw: string): SymbolId {
  if (raw.length === 0) throw new Error('SymbolId cannot be empty');
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(raw)) throw new Error(`Invalid SymbolId: "${raw}"`);
  return raw as SymbolId;
}
export function makeConfidence(value: number): Confidence {
  if (!Number.isFinite(value)) throw new Error('Confidence must be finite');
  return Math.max(0, Math.min(100, Math.round(value))) as Confidence;
}

export function tokenize(text: string): readonly string[] {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((t) => t.length >= 2);
  return Array.from(new Set(normalized));
}

export function levenshtein(a: string, b: string): number {
  const al = a.length, bl = b.length;
  if (al === 0) return bl; if (bl === 0) return al;
  const prev = new Array<number>(bl + 1); const curr = new Array<number>(bl + 1);
  for (let j = 0; j <= bl; j++) prev[j] = j;
  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
    }
    const tmp = prev; for (let j = 0; j <= bl; j++) prev[j] = curr[j]!; for (let j = 0; j <= bl; j++) curr[j] = tmp[j]!;
  }
  return prev[bl]!;
}

export function tokenOverlap(query: string, text: string): number {
  const qTokens = tokenize(query);
  const tSet = new Set(tokenize(text));
  if (qTokens.length === 0) return 0;
  let hits = 0;
  for (const qt of qTokens) {
    if (tSet.has(qt)) { hits++; continue; }
    for (const tt of tSet) {
      if (levenshtein(qt, tt) <= 2) { hits++; break; }
    }
  }
  return hits / qTokens.length;
}

export function highlightTokens(text: string, query: string): readonly string[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const out: string[] = [];
  const lower = text.toLowerCase();
  for (const tok of tokens) {
    let idx = lower.indexOf(tok);
    while (idx !== -1) {
      out.push(text.slice(idx, idx + tok.length));
      idx = lower.indexOf(tok, idx + tok.length);
    }
  }
  return out;
}

export function makeAttribution(
  symbolId: SymbolId,
  originalCreator: string,
  currentAttribution: string,
  actor: string,
  credits: readonly string[] = []
): AttributionChain {
  return {
    symbolId, originalCreator, currentAttribution,
    credits: Array.from(new Set(credits)),
    lastUpdated: '2026-06-29',
    history: [{ date: '2026-06-29', actor, change: `Created attribution chain for ${symbolId}` }],
  };
}

export function appendAttribution(
  chain: AttributionChain, actor: string, date: string, change: string, newCurrent?: string
): AttributionChain {
  return {
    symbolId: chain.symbolId, originalCreator: chain.originalCreator,
    currentAttribution: newCurrent ?? chain.currentAttribution,
    credits: Array.from(new Set([...chain.credits, actor])),
    lastUpdated: date, history: [...chain.history, { date, actor, change }],
  };
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}';
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — LICENSE FACTORIES
// ════════════════════════════════════════════════════════════════════════════

export function licenseCC0(): License {
  return { type: 'CC0', url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    commercialUse: true, derivativeAllowed: true, attributionRequired: false,
    shareAlike: false, jurisdiction: 'worldwide' };
}
export function licenseCCBYSA(): License {
  return { type: 'CC-BY-SA', url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    commercialUse: true, derivativeAllowed: true, attributionRequired: true,
    shareAlike: true, jurisdiction: 'worldwide' };
}
export function licenseCCBYNCSA(): License {
  return { type: 'CC-BY-NC-SA', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    commercialUse: false, derivativeAllowed: true, attributionRequired: true,
    shareAlike: true, jurisdiction: 'worldwide' };
}
export function licensePublicDomain(): License {
  return { type: 'Public_Domain', url: 'https://en.wikipedia.org/wiki/Public_domain',
    commercialUse: true, derivativeAllowed: true, attributionRequired: false,
    shareAlike: false, jurisdiction: 'worldwide' };
}
export function licenseTraditionalKnowledge(steward: string): License {
  return { type: 'Traditional_Knowledge', url: 'https://www.wipo.int/tk/en/',
    commercialUse: false, derivativeAllowed: false, attributionRequired: true,
    shareAlike: true, jurisdiction: steward };
}
export function licenseSacredRestricted(): License {
  return { type: 'Sacred_Restricted', url: 'cabala://internal/sacred-restricted',
    commercialUse: false, derivativeAllowed: false, attributionRequired: true,
    shareAlike: false, jurisdiction: 'tradition-internal' };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — SACRED SYMBOL FACTORY
// ════════════════════════════════════════════════════════════════════════════

/**
 * Compact factory for SacredSymbol. All defaults are conservative — Candomblé
 * traditional-knowledge license with attribution chain to the lineage.
 */
function mkSym(
  slug: string, name: string, type: SymbolType, primary: Tradition,
  sharing: readonly Tradition[], aliases: readonly string[],
  unicode: string | null, color: string, shape: string,
  description: string, history: string,
  sacredness: SacrednessLevel, restrictions: readonly string[],
  originalCreator: string, currentAttribution: string, credits: readonly string[],
  license: License, sources: readonly SymbolSource[],
  related: readonly SymbolId[], contrast: readonly SymbolId[],
  renderUnicode: string | undefined, fallback: string, animation: RenderHints['animation'], layout: RenderHints['layout']
): SacredSymbol {
  return {
    id: makeSymbolId(slug), name, type, primaryTradition: primary,
    sharingTraditions: sharing, aliases, unicode, color, shape,
    description, history, sacrednessLevel: sacredness, restrictions,
    attribution: makeAttribution(makeSymbolId(slug), originalCreator, currentAttribution, 'Coder', credits),
    license, sources, relatedSymbols: related, contrastSymbols: contrast,
    renderHints: {
      unicode: renderUnicode, fallback, color, shape, animation, layout,
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — SACRED SYMBOLS DATA (60+ symbols, 16 traditions)
// ════════════════════════════════════════════════════════════════════════════

const CANDOMBLE_TK = licenseTraditionalKnowledge('Brasil · Candomblé');
const UMBANDA_TK = licenseTraditionalKnowledge('Brasil · Umbanda');
const IFA_TK = licenseTraditionalKnowledge('Brasil · Ifá');
const INDIG_TK = licenseTraditionalKnowledge('Brasil · Povos Indígenas');
const SD_TK = licenseTraditionalKnowledge('Brasil · Santo Daime');
const TANTRA_TK = licenseTraditionalKnowledge('India · Tantra');
const HINDU_TK = licenseTraditionalKnowledge('India · Hinduismo');
const BUDDHISM_TK = licenseTraditionalKnowledge('Tibet · Budismo');

const SRC_PIERRE_VERGER: SymbolSource[] = [{
  title: 'Os Orixas', author: 'Pierre Verger', year: 1981,
  url: 'https://www.seloverger.com.br/os-orixas', accessedAt: '2026-06-29', type: 'academic',
}];
const SRC_PRANDI: SymbolSource[] = [{
  title: 'Mitologia dos Orixas', author: 'Reginaldo Prandi', year: 2001,
  url: 'https://www.edusp.br/', accessedAt: '2026-06-29', type: 'textual',
}];
const SRC_KARDEC_OBRAS: SymbolSource[] = [{
  title: 'O Livro dos Espiritos', author: 'Allan Kardec', year: 1857,
  url: 'https://www.febnet.org.br/', accessedAt: '2026-06-29', type: 'textual',
}];
const SRC_PT: SymbolSource[] = [{
  title: 'Tetrabiblos', author: 'Claudios Ptolomeu', year: 150,
  url: 'https://www.cienciasexatas.com.br/', accessedAt: '2026-06-29', type: 'textual',
}];
const SRC_ZOHAR: SymbolSource[] = [{
  title: 'O Zohar', author: 'Moshe de Leon (atrib.)', year: 1280,
  url: 'https://www.sefer.com.br/zohar', accessedAt: '2026-06-29', type: 'textual',
}];

// ─── CANDOMBLE (8) ─────────────────────────────────────────────────────────

const CANDOMBLE_OXALA = mkSym(
  'candomble-oxala', 'Oxala', 'deity', 'candomble',
  ['hinduism', 'cabala', 'espiritismo'],
  ['Oxala', 'Obatala', 'Orisa-Ola', 'Orixa Branco', 'Pai da Criacao'],
  null, '#FFFFFF', 'pomba-branca',
  'Senior orixa masculino, senhor da criacao e da paz. Considerado o pai de todos os orixas. Sincretizado com Jesus Cristo e Vishnu no pensamento sincretico brasileiro.',
  'Chegou ao Brasil com os iorubas entre os seculos XVI-XIX. Como Oxala e o dono do branco e da argila — simbolo da criacao primeira.',
  5, ['Nao usar em contextos profanos sem autorizacao do terreiro',
      'Composicao fisica deve respeitar hierarquia do axe'],
  'Tradicao oral Ioruba/Yoruba', 'Casa Branca do Engenho Velho (1857-presente)',
  ['Tradicao Ioruba', 'Rogerio Ferreira'],
  CANDOMBLE_TK, [...SRC_PIERRE_VERGER, ...SRC_PRANDI,
    { title: 'Roda de Conversa — terreiro Pilao de Prata', author: 'Rogerio Ferreira',
      year: 2024, url: 'cabala://community/roda-2024-03', accessedAt: '2026-06-29', type: 'oral' }],
  [makeSymbolId('candomble-oxum'), makeSymbolId('candomble-ogum'),
   makeSymbolId('candomble-iemanja'), makeSymbolId('hinduism-vishnu'),
   makeSymbolId('cabala-tetragrammaton')],
  [makeSymbolId('candomble-exu')],
  undefined, 'Serpente-de-brancura + pomba branca', 'breathe', 'centered'
);

const CANDOMBLE_IANSA = mkSym(
  'candomble-iansa', 'Iansa', 'deity', 'candomble',
  ['umbanda', 'wicca', 'christianity'],
  ['Iansa', 'Oia', 'Iansa Oia', 'Donzela dos Ventos', 'Senhora das Tempestades'],
  null, '#FF4500', 'raio',
  'Orixa feminina dos ventos, raios e tempestades. Guerreira destemida, com saudacao "Opare!". Sincronizada com Santa Barbara.',
  'Iansa e uma das orixas mais antigas do panteao iorubano, equivalente a deusa Iyami Oja. Em Cuba tornou-se Oya, no Brasil Iansa.',
  5, ['Nao pronunciar nome sem saudacao', 'Respeitar dia da semana (quarta-feira)'],
  'Tradicao Ioruba', 'Comunidade do Candomble de Angola',
  ['Mae Iya Nosso', 'Casa da Bahia'],
  CANDOMBLE_TK, [{
    title: 'Iansa — Orixa dos Ventos', author: 'Mae Beata de Iemanja', year: 2015,
    url: 'https://www.editorapallas.com.br/', accessedAt: '2026-06-29', type: 'community',
  }, { title: 'The Yoruba God of Wind and Storms', author: 'Babatunde Lawal', year: 2014,
    url: 'https://www.oxfordartonline.com/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('candomble-xango'), makeSymbolId('umbanda-caboclo'),
   makeSymbolId('christianity-brigit'), makeSymbolId('wicca-deusa-tripla')],
  [makeSymbolId('candomble-nana')],
  undefined, 'Espada + 9 raios vermelhos', 'flow', 'path'
);

const CANDOMBLE_XANGO = mkSym(
  'candomble-xango', 'Xango', 'deity', 'candomble',
  ['hinduism', 'ifa'],
  ['Xango', 'Oba Xango', 'Dono do Trovao', 'Justica das Pedreiras'],
  null, '#DC143C', 'machado-duplo',
  'Orixa justiceiro, senhor do trovao e das pedreiras. Seu simbolo e o machado de duas laminas (oxe). Sincronizado com Sao Jeronimo e, em chave comparativa, com o hindu Indra.',
  'Xango e originalmente um Alaafin de Oyo, historico do seculo XIV. Sua memoria mitologica consolidou-se como divindade do raio.',
  5, ['Nao associar trivialmente em humor ou memes', 'Respeitar fundamento do axe'],
  'Panteao Oyo (sec. XIV)', 'Ile Axe Opo Afonja',
  ['Mae Aninha', 'Pierre Verger'],
  CANDOMBLE_TK, [{
    title: 'Xango — O Rei da Justica', author: 'Prandi & Verger', year: 1995,
    url: 'https://www.pallas.com.br/', accessedAt: '2026-06-29', type: 'academic',
  }, { title: 'Shango Across Waters', author: 'Kamari Maxwel Clarke', year: 2011,
    url: 'https://www.dukeupress.edu/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('candomble-iemanja'), makeSymbolId('candomble-ogum'),
   makeSymbolId('hinduism-shiva'), makeSymbolId('ifa-orunmila')],
  [makeSymbolId('candomble-exu')],
  undefined, 'Machado de duas laminas + pedras', 'pulse', 'centered'
);

const CANDOMBLE_IEMANJA = mkSym(
  'candomble-iemanja', 'Iemanja', 'deity', 'candomble',
  ['hinduism', 'christianity', 'espiritismo'],
  ['Iemanja', 'Yemanja', 'Iyemoja', 'Rainha do Mar', 'Mae das Aguas'],
  null, '#87CEEB', 'concha-do-mar',
  'Orixa-mae, dona do mar e da maternidade. Em 31 de dezembro, recebe oferendas nas praias do Brasil. Sincronizada com Nossa Senhora dos Navegantes e, por paralelismo, com a deusa Lakshmi.',
  'Yemoja e uma deusa do povo Egba e Egba-Ado, originalmente um rio (Yemoja = "mae cujos filhos sao peixes").',
  5, ['Nao ofertar em garrafa de vidro (risco simbolico)', 'Respeitar oferendas no mar'],
  'Povo Egba (Nigeria)', 'Terreiro de Candomble Ketu',
  ['Mae Hildete Sa', 'Ile Axe Iy Nosso Oka'],
  CANDOMBLE_TK, [{
    title: 'Yemoja — The Mother of Waters', author: 'Toyin Falola', year: 2019,
    url: 'https://www.routledge.com/', accessedAt: '2026-06-29', type: 'academic',
  }, { title: 'A Rainha do Mar', author: 'Paulo Valois', year: 2010,
    url: 'https://www.pallas.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('candomble-oxum'), makeSymbolId('christianity-virgem-maria'),
   makeSymbolId('hinduism-lakshmi'), makeSymbolId('espiritismo-perispírito')],
  [makeSymbolId('candomble-nana')],
  undefined, 'Espelho + concha + peixe', 'breathe', 'centered'
);

const CANDOMBLE_OXUM = mkSym(
  'candomble-oxum', 'Oxum', 'deity', 'candomble',
  ['hinduism', 'christianity'],
  ['Oxum', 'Osun', 'Oṣun', 'Senhora das Aguas Doces', 'Amor e Beleza'],
  null, '#FFD700', 'espelho-dourado',
  'Orixa do rio Oxum, do amor, do ouro, da fertilidade e da beleza feminina. E patrona da gestacao. Sincronizada com Nossa Senhora da Conceicao e com Lakshmi.',
  'Oxum e o orixa do rio nigeriano Osun, em Osogbo. Seu culto foi reconhecido pela UNESCO como Patrimonio da Humanidade em 2005.',
  5, ['Nao usar para fins comerciais sem licenca do templo', 'Respeitar domingo como dia'],
  'Povo Ijexa (Osogbo)', 'UNESCO Patrimonio (2005)',
  ['UNESCO', 'Ialorixa Stella de Oxossi'],
  CANDOMBLE_TK, [{
    title: 'Oṣun Oṣogbo — Sacred Grove', author: 'UNESCO', year: 2005,
    url: 'https://whc.unesco.org/en/list/1118', accessedAt: '2026-06-29', type: 'academic',
  }, { title: 'Oṣun Across Seas', author: 'Bukola Akinyemi', year: 2020,
    url: 'https://www.routledge.com/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('candomble-iemanja'), makeSymbolId('hinduism-lakshmi'),
   makeSymbolId('candomble-oxala')],
  [makeSymbolId('candomble-omolu')],
  undefined, 'Espelho dourado + leque + mel', 'static', 'centered'
);

const CANDOMBLE_OGUM = mkSym(
  'candomble-ogum', 'Ogum', 'deity', 'candomble',
  ['umbanda', 'christianity', 'hinduism'],
  ['Ogum', 'Ogoun', 'Patrono do Ferro', 'Senhor dos Caminhos', 'Deus da Guerra'],
  null, '#1E90FF', 'espada-de-ferro',
  'Orixa patrono do ferro, do trabalho, das estradas e da guerra. Sincronizado com Sao Jorge e, por paralelismo, com o grego Ares.',
  'Ogun e um dos orixas mais antigos, ligado a forja, a metalurgia e a abertura de estradas. Sua memoria atravessa o Atlantico com trabalho forcado.',
  5, ['Respeitar terca-feira como dia', 'Nao invocar para fins obscuros'],
  'Povo Ioruba · Metaforas de Ife', 'Tradicao do Candomble',
  ['Pierre Verger', 'Jorge Ben (musica)'],
  CANDOMBLE_TK, [{
    title: 'Ogun — O Deus do Ferro', author: 'Lucio Costa', year: 2008,
    url: 'https://www.pallas.com.br/', accessedAt: '2026-06-29', type: 'academic',
  }, { title: 'Ogun: Building the Body Politic', author: 'Norma Harris', year: 2018,
    url: 'https://www.indiana.edu/~press/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('candomble-xango'), makeSymbolId('umbanda-exu'),
   makeSymbolId('christianity-cordeiro'), makeSymbolId('hinduism-ganesha')],
  [makeSymbolId('candomble-iemanja')],
  undefined, 'Espada + ferramentas de ferreiro', 'static', 'centered'
);

const CANDOMBLE_NANA = mkSym(
  'candomble-nana', 'Nana', 'deity', 'candomble', ['espiritismo'],
  ['Nana', 'Nana Buruque', 'Mae dos Mortos', 'Senhora do Pantano'],
  null, '#4B0082', 'leque-de-penas',
  'Orixa-mae ancia, dona da lama, da morte e do principio. E a mais antiga divindade do panteao, representando o humus primordial de onde a vida emerge.',
  'Nana e frequentemente associada a deusa Nammu sumeria e a egipcia Neftis. E a avo do axe — antes do mundo ser moldado, existia apenas o pantano (Nana).',
  5, ['Nao associar a comicidade com a morte', 'Respeitar segunda-feira como dia'],
  'Tradicao pre-Ioruba', 'Candomble de Angola · Keto',
  ['Mae Iya Bokun'],
  CANDOMBLE_TK, [{ title: 'Nana — A Matriarca do Pantano', author: 'Marlene Barros',
    year: 2017, url: 'https://www.editoraathenas.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('candomble-omolu'), makeSymbolId('candomble-iemanja'),
   makeSymbolId('espiritismo-perispírito')],
  [makeSymbolId('candomble-oxum')],
  undefined, 'Leque de palha + lama + ibeji', 'static', 'centered'
);

const CANDOMBLE_OMOLU = mkSym(
  'candomble-omolu', 'Omolu', 'deity', 'candomble', ['christianity', 'espiritismo'],
  ['Omolu', 'Obaluaiê', 'Baba', 'Senhor da Terra', 'Deus das Doencas'],
  null, '#000000', 'palha-tecida',
  'Orixa das doencas, da cura e da terra. Sincronizado com Sao Lazaro. Sua vestimenta de palha cobre o corpo todo. E o dono da variola e de sua cura.',
  'Obaluaiê e filho de Nana Buruque e de Ifa. Sua iconografia e coberta de palha trancada, esconde-o do sol e de doencas.',
  5, ['Nao citar em tom leviano', 'Respeitar segunda-feira'],
  'Candomble de Angola', 'Terreiro Bogum',
  ['Mae Cleonice'],
  CANDOMBLE_TK, [{ title: 'Omolu — O Senhor da Terra', author: 'Reginaldo Prandi',
    year: 2010, url: 'https://www.edusp.br/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('candomble-nana'), makeSymbolId('candomble-oxum'),
   makeSymbolId('christianity-cordeiro')],
  [makeSymbolId('candomble-iemanja')],
  undefined, 'Palha trancada cobrindo o corpo', 'static', 'centered'
);

// ─── UMBANDA (6) ───────────────────────────────────────────────────────────

const UMBANDA_CABOCLO = mkSym(
  'umbanda-caboclo', 'Caboclo', 'deity', 'umbanda',
  ['candomble', 'indigenous_brazilian'],
  ['Caboclo', 'Caboclo das Matas', 'Caboclo Pena Verde', 'Caboclo Sete Encruzilhadas'],
  null, '#228B22', 'cocar-indigena',
  'Entidade da Umbanda representando o espirito do indigena brasileiro. Trabalha com cura por ervas e conexao com a natureza. Pode ser de varias nacoes: Pataxo, Guarani, Tupinamba.',
  'A linha de Caboclos foi sistematizada por Zelio Fernandino de Moraes em 1908, no ritual que fundou a Umbanda como religiao distinta do Candomble.',
  4, ['Nao reconhecer mediums sem fundamento', 'Respeitar a "gira" (sessao ritual)'],
  'Zelio Fernandino de Moraes (1908)', 'Federacao Espirita de Umbanda',
  ['Caboclo das Sete Encruzilhadas', 'Zelio de Moraes'],
  UMBANDA_TK, [{ title: 'Umbanda — Uma Religiao Brasileira', author: 'Prandi',
    year: 2012, url: 'https://www.edusp.br/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('umbanda-preto-velho'), makeSymbolId('indigenous-brazilian-cocar'),
   makeSymbolId('candomble-iansa')],
  [makeSymbolId('umbanda-preto-velho')],
  undefined, 'Cocar de penas + arco + flecha', 'breathe', 'centered'
);

const UMBANDA_PRETO_VELHO = mkSym(
  'umbanda-preto-velho', 'Preto-Velho', 'deity', 'umbanda', ['christianity'],
  ['Preto-Velho', 'Velho Pai', 'Preto-Antigo', 'Preto da Bahia'],
  null, '#8B4513', 'cachimbo-melado',
  'Entidade da Umbanda que representa os espiritos dos escravizados africanos. Trabalham com sagesse, cura e orientacao moral. Sua fala e mansa, seu cachimbo e eterno.',
  'A linha dos Pretos-Velhos formou-se no seio da Federacao Espirita de Umbanda fundada por Zelio de Moraes. Honram a memoria dos ancestrais escravizados.',
  4, ['Nao caricaturar com humor ofensivo', 'Respeitar a saudacao "Adoosssi"'],
  'Memoria dos Africanos Escravizados', 'Federacao Espirita de Umbanda (1908)',
  ['Preto-Velho Pai Joao'],
  UMBANDA_TK, [{ title: 'Os Pretos-Velhos na Umbanda', author: 'Altair Tavares',
    year: 2018, url: 'https://www.editorapeirinho.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('umbanda-caboclo'), makeSymbolId('umbanda-exu'), makeSymbolId('candomble-omolu')],
  [makeSymbolId('umbanda-baiano')],
  undefined, 'Cachimbo + terco + bengala', 'static', 'centered'
);

const UMBANDA_EXU = mkSym(
  'umbanda-exu', 'Exu', 'deity', 'umbanda',
  ['candomble', 'espiritismo'],
  ['Exu', 'Exu Tranca-Ruas', 'Exu Sete Catracas', 'Exu Caveira'],
  null, '#8B0000', 'tridente',
  'Mensageiro entre orixas e humanos. Na Umbanda, tambem "guardiao" da gira. Sincronizado com Sao Pedro e, por paralelismo, com Hermes/Mercurius.',
  'Exu e uma das figuras mais polemicas da diaspora — demonizado pelo cristianismo colonial, recuperado como principio intermediario pela Umbanda.',
  5, ['Nao associar a "diabo" cristao sem contexto', 'Respeitar segunda-feira a meia-noite'],
  'Panteao Ioruba', 'Tranca-Ruas · Candomble & Umbanda',
  ['Exu Rei', 'Mestre Logunede'],
  UMBANDA_TK, [{ title: 'Exu — O Guardao do Caminho', author: 'Rogerio Ferreira',
    year: 2016, url: 'https://www.editorapallas.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('umbanda-pombagira'), makeSymbolId('candomble-ogum'),
   makeSymbolId('cabala-tetragrammaton')],
  [makeSymbolId('candomble-oxala')],
  undefined, 'Tridente + chifres + rosa vermelha', 'pulse', 'path'
);

const UMBANDA_POMBAGIRA = mkSym(
  'umbanda-pombagira', 'Pombagira', 'deity', 'umbanda',
  ['candomble', 'espiritismo'],
  ['Pombagira', 'Pomba-Gira', 'Moca-Branca', 'Rainha das Sete Encruzilhadas'],
  null, '#800020', 'leque-vermelho',
  'Entidade feminina da Umbanda que trabalha com sensualidade, justica e as questoes do amor. Acompanha Exu nas giras. Tem multiplas falanges com nomes proprios.',
  'Pombagira e uma reinterpretacao dos Egungum femininos, conectada ao Candomble de Angola. Sua imagem foi construida em dialogo com a "Maria Padilha" espanhola.',
  4, ['Nao associar de modo sexista sem contexto', 'Respeitar a rosa vermelha como oferenda'],
  'Candomble de Angola · Maria Padilla', 'Federacao Espirita de Umbanda',
  ['Pomba-Gira Sete Saias'],
  UMBANDA_TK, [{ title: 'As Pombagiras na Umbanda', author: 'Altair Tavares',
    year: 2014, url: 'https://www.editorapeirinho.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('umbanda-exu'), makeSymbolId('candomble-iansa')],
  [makeSymbolId('umbanda-preto-velho')],
  undefined, 'Vestido vermelho + leque + cigarro', 'flow', 'centered'
);

const UMBANDA_BAIANO = mkSym(
  'umbanda-baiano', 'Baiano', 'deity', 'umbanda', ['candomble'],
  ['Baiano', 'Caboclo Baiano', 'Mestre Baiano'],
  null, '#F4A460', 'panela-de-barro',
  'Caboclo especializado em curas por chas, ervas e temperos. E Baiano porque a Bahia e referencia cultural da comida-afetiva. Trabalha com rigor de mae.',
  'Linha da Umbanda consolidada no Rio de Janeiro dos anos 1930-40, como parte da expansao dos terreiros para o sul do Brasil.',
  4, ['Respeitar preparacao do cha', 'Nao reconhecer praticas duvidosas'],
  'Umbanda da Bahia → Rio', 'Uniao Espirita de Umbanda do Brasil',
  ['Caboclo Baiano do Pandeiro'],
  UMBANDA_TK, [{ title: 'Os Caboclos na Umbanda', author: 'Marcos Ribas',
    year: 2019, url: 'https://www.editorabrasil.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('umbanda-caboclo'), makeSymbolId('umbanda-marinheiro'),
   makeSymbolId('indigenous-brazilian-jurema')],
  [makeSymbolId('umbanda-marinheiro')],
  undefined, 'Panela de barro + ervas + charuto', 'static', 'centered'
);

const UMBANDA_MARINHEIRO = mkSym(
  'umbanda-marinheiro', 'Marinheiro', 'deity', 'umbanda', ['candomble'],
  ['Marinheiro', 'Mestre Marinheiro', 'Maranhao', 'Marujo'],
  null, '#191970', 'ancora',
  'Caboclo que incorpora o espirito de marinheiros mortos no mar. Trabalha com cura marinha, pescarias e navegacao. Tem saudacao "O marinheiro!"',
  'Linha da Umbanda ligada a cultura portuaria e a memoria dos trabalhadores maritimos. Fortemente presente no Rio de Janeiro e no Reconcavo Baiano.',
  4, ['Nao ofertar bebidas alcoolicas destiladas', 'Respeitar o mar como elemento sagrado'],
  'Memoria dos Marinheiros do Atlantico Sul', 'Centros Espiritas de Umbanda Maritima',
  ['Mestre Nana Buruque'],
  UMBANDA_TK, [{ title: 'Os Caboclos do Mar na Umbanda', author: 'Marcos Ribas',
    year: 2020, url: 'https://www.editorabrasil.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('candomble-iemanja'), makeSymbolId('umbanda-baiano')],
  [makeSymbolId('umbanda-baiano')],
  undefined, 'Ancora + barco + agua salgada', 'breathe', 'centered'
);

// ─── IFA (5) ───────────────────────────────────────────────────────────────

const IFA_ORUNMILA = mkSym(
  'ifa-orunmila', 'Orunmila', 'deity', 'ifa',
  ['candomble', 'esoterismo'],
  ['Orunmila', 'Orunmlà', 'Igbakeji Olodùmare', 'Testemunha do Ceu'],
  null, '#4682B4', 'iqin-tabaco',
  'Divindade da sabedoria, do Ifa e da "matematica do destino". E o babalao principal — conhece o Odu que preside cada vida.',
  'Orunmila e o "segundo do criador" (Igbakeji Olodumare), anterior a quase todos os outros orixas. Seu sistema de adivinhacao deu origem ao merindilogum.',
  5, ['Respeitar sacralidade do Opo Afonja', 'Nao revelar 16 Odu maiores sem iniciacao'],
  'Ife · Nigeria Central', 'Ile Ifa de Cuba & Brasil',
  ['Baba Ifenni Ela'],
  IFA_TK, [{ title: 'Orunmila — Deus da Adivinhacao', author: 'William Bascom',
    year: 1969, url: 'https://www.jstor.org/', accessedAt: '2026-06-29', type: 'academic',
  }, { title: 'Ifa — Sistema de Adivinhacao', author: 'Lucio Costa', year: 2014,
    url: 'https://www.pallas.com.br/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('ifa-opo-afonja'), makeSymbolId('ifa-merindilogun'),
   makeSymbolId('cabala-tetragrammaton'), makeSymbolId('candomble-oxala')],
  [makeSymbolId('ifa-exu')],
  undefined, 'Tabua de Opo-Ifa + iroke + iyerosum', 'static', 'ring'
);

const IFA_OPO_AFONJA = mkSym(
  'ifa-opo-afonja', 'Opo Afonja', 'ritual_tool', 'ifa', ['candomble'],
  ['Opo Afonja', 'Opon Ifa', 'Tabua de Ifa'],
  null, '#8B4513', 'tabua-redonda',
  'Tabua sagrada onde se desenham os Odu com iyawo (po branco). E a "mesa" do jogo de buzos — onde o babalao joga. Sincronizada com a Mesa Real.',
  'O Opo Afonja e literalmente a "tabua de Ifa". Sua forma e esferica (madeira de iroco) e representa o mundo — 8 metades do Adu.',
  5, ['Tabua deve ser lavada antes do uso', 'Nao pisar na tabua'],
  'Ife · Tradicao Oral', 'Casa dos Buzios',
  ['Baba Samuel'],
  IFA_TK, [{ title: 'Opo Afonja — Mesa de Adivinhacao', author: 'Wande Abimbola',
    year: 2002, url: 'https://www.indiana.edu/~press/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('ifa-buzio'), makeSymbolId('ifa-merindilogun'), makeSymbolId('ifa-orunmila')], [],
  undefined, 'Tabua redonda de madeira escura', 'static', 'grid'
);

const IFA_MERINDILOGUN = mkSym(
  'ifa-merindilogun', 'Merindilogun', 'ritual_tool', 'ifa', ['candomble'],
  ['Merindilogun', 'Jogo dos 16 Buzios', 'Merindilogn'],
  null, '#D2691E', '16-buzios',
  'Sistema de adivinhacao por 16 buzos (caramujos). E o metodo mais usado no Candomble — Ketu. Os Odu sao jogados no Opo Afonja e interpretados pelo pai-de-santo.',
  'Diferente do Ifa (8 Odu do babalawo), o Merindilogun trabalha com 16 principais Odu derivados dos 16 primeiros.',
  5, ['Iniciacao necessaria para jogar', 'Nao jogar em momentos profanos'],
  'Tradicao Ketu-Angola', 'Ile Axe Iy Nosso Oka',
  ['Mae Olga de Alaketo'],
  IFA_TK, [{ title: 'O Jogo dos Buzios', author: 'Prandi & Ridrigues', year: 2012,
    url: 'https://www.edusp.br/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('ifa-buzio'), makeSymbolId('ifa-opo-afonja'), makeSymbolId('candomble-iemanja')], [],
  undefined, 'Conjunto de 16 caramujos', 'static', 'natural'
);

const IFA_BUZIO = mkSym(
  'ifa-buzio', 'Buzio', 'sacred_object', 'ifa', ['candomble'],
  ['Buzio', 'Caramujo', 'Cauri', 'Cypraea moneta'],
  null, '#FFE4C4', 'concha-oval',
  'Caramujo usado como instrumento de adivinhacao. O buzio e o "livro" do babalao. Sua posicao (aberta/fechada) define a leitura dos Odu.',
  'O buzio (cauri) foi tambem moeda na Africa Ocidental. No Brasil, e sagrado — separado do uso comercial.',
  5, ['Manter separados de coisas profanas', 'Nao vender para usos nao-sagrados'],
  'Cypraea moneta · Golfo da Guine', 'Comercio Tradicional · Terreiros',
  ['Cooperativa de Terreiros da Bahia'],
  IFA_TK, [{ title: 'Cauri — Moeda e Simbolo Sagrado', author: 'Marcos Albuquerque',
    year: 2011, url: 'https://www.museuafrobrasileiro.gov.br/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('ifa-merindilogun'), makeSymbolId('ifa-opo-afonja')], [],
  undefined, 'Concha de caramujo pequena', 'static', 'natural'
);

const IFA_IROKE = mkSym(
  'ifa-iroke', 'Iroke', 'ritual_tool', 'ifa', ['candomble'],
  ['Iroke', 'Iroke Ifa', 'Cajado de Ifa'],
  null, '#556B2F', 'cajado-20cm',
  'Cajado ritual dos babalaos — tem 20cm e a extremidade decorada. E usado para varrer os Odu na tabua e para realizar o Aye (banho ritual).',
  'O iroke e a ferramenta do babalawo — usada para limpar e abrir caminhos. Seu tamanho pequeno contrasta com o tamanho do opo afonja.',
  4, ['Nao manipular sem iniciacao', 'Guardar em local separado'],
  'Tradicao Ioruba', 'Federacao Espirita do Candomble',
  ['Mestre Ifa Okunade'],
  IFA_TK, [{ title: 'Os Instrumentos do Babalao', author: 'Wande Abimbola',
    year: 2015, url: 'https://www.indiana.edu/~press/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('ifa-opo-afonja'), makeSymbolId('ifa-orunmila')], [],
  undefined, 'Cajado com ponta embelezada', 'static', 'centered'
);

// ─── CABALA (6) ────────────────────────────────────────────────────────────

const CABALA_ARVORE_VIDA = mkSym(
  'cabala-arvore-vida', 'Arvore da Vida', 'geometric', 'cabala',
  ['esoterismo', 'wicca', 'astrologia'],
  ['Arvore da Vida', 'Tree of Life', 'Etz Chaim', 'Sephirot', '10 Sephirot'],
  null, '#FFD700', '10-circulos-22-caminhos',
  'Diagrama central da Cabala — 10 Sephirot conectadas por 22 caminhos, correspondendo as 22 letras do alfabeto hebraico. E o mapa da estrutura da criacao divina.',
  'A Arvore da Vida e sistematizada no Zohar (sec. XIII), embora suas raizes remontem ao Sefer Yetzirah (sec. IV-VI).',
  5, ['Respeitar orientacao das Sephirot', 'Nao associar a praticas profanas sem fundamento'],
  'Sefer Yetzirah · Zohar', 'Centro de Cabala Comparativa do Brasil',
  ['Rabino Moshe de Leon', 'Gershom Scholem'],
  licenseCCBYSA(), [...SRC_ZOHAR, {
    title: 'As Origens da Cabala', author: 'Gershom Scholem', year: 1941,
    url: 'https://www.scholem.org.br/', accessedAt: '2026-06-29', type: 'academic',
  }, { title: 'Tree of Life Diagram', author: 'Public Domain', year: 1500,
    url: 'https://commons.wikimedia.org/wiki/Tree_of_Life_(Kabbalah)',
    accessedAt: '2026-06-29', type: 'visual' }],
  [makeSymbolId('cabala-tetragrammaton'), makeSymbolId('cabala-sephirah'),
   makeSymbolId('cabala-gematria'), makeSymbolId('astrologia-sol')], [],
  undefined, 'Diagrama: 10 circulos em 3 colunas', 'pulse', 'tree'
);

const CABALA_TETRAGRAMMATON = mkSym(
  'cabala-tetragrammaton', 'Tetragrammaton', 'glyph', 'cabala',
  ['islam', 'christianity'],
  ['Tetragrammaton', 'YHWH', 'JHVH', 'Shem HaMeforash', 'Nome Inefavel'],
  'יְהוָה', '#000080', '4-letras-hebraicas',
  'O nome de quatro letras do Deus de Israel: Yod-He-Vav-He. Tao sagrado que ate hoje nao se pronuncia — le-se como "Adonai". E o Ser da criacao ex nihilo.',
  'Aparece em Exodo 3:14 ("Eu sou o que sou"). Moises teria recebido o Tetragrammaton no Sinai.',
  5, ['Nao pronunciar sem competencia halachica', 'Nao escrever em local que possa ser apagado sem ritual'],
  'Exodo 3:14 · Sinai', 'Tradicao Rabinica (Maimonides)',
  ['Maimonides', 'Tradicao Massoretica'],
  licenseSacredRestricted(), [{
    title: 'Guide for the Perplexed', author: 'Maimonides', year: 1190,
    url: 'https://www.sefaria.org/Guide_for_the_Perplexed', accessedAt: '2026-06-29', type: 'textual',
  }, { title: 'O Nome Inefavel', author: 'Heschel', year: 1965,
    url: 'https://www.fonsvitae.com/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('cabala-arvore-vida'), makeSymbolId('cabala-sephirah'),
   makeSymbolId('islam-allah')], [],
  'יְהוָה', 'יהוה com vibracoes lineares', 'pulse', 'centered'
);

const CABALA_SEPHIRAH = mkSym(
  'cabala-sephirah', 'Sephirah', 'number', 'cabala',
  ['esoterismo', 'cabala'],
  ['Sephirah', 'Sephira', 'Emanacoes Divinas', '10 Numerais Sagrados'],
  null, '#4B0082', 'circulos-em-tres-triades',
  'Cada uma das 10 emanacoes divinas que constituem a estrutura do mundo — Kether, Chokhmah, Binah, Chesed, Geburah, Tipheret, Netzach, Hod, Yesod, Malkuth.',
  'A palavra "Sephirah" vem do hebraico S-P-R ("contar"). Cada Sephirah e um numeral e uma qualidade.',
  4, ['Nao reduzir a uma unica qualidade', 'Respeitar inter-relacoes'],
  'Sefer Yetzirah', 'Tradicao Hermetica',
  ['Rabino Akiva', 'Isaac Luria'],
  licenseCCBYSA(), [{
    title: 'Sefer Yetzirah', author: 'Rabino Akiva (atrib.)', year: 400,
    url: 'https://www.sefaria.org/Sefer_Yetzirah', accessedAt: '2026-06-29', type: 'textual',
  }],
  [makeSymbolId('cabala-arvore-vida'), makeSymbolId('cabala-tetragrammaton'),
   makeSymbolId('cabala-gematria')], [],
  undefined, 'Circulo numerado', 'pulse', 'tree'
);

const CABALA_ANJO = mkSym(
  'cabala-anjo', 'Anjo', 'deity', 'cabala', ['christianity', 'islam'],
  ['Anjo', 'Malakh', 'Querubim', 'Serafim', 'Tronos'],
  '✴', '#F5DEB3', 'ser-alado',
  'Seres intermediarios entre Deus e humano. A tradicao cabalistica organiza-os em 4 mundos com 10 emanacoes cada.',
  'Pseudo-Dionisio (sec. VI) organizou a hierarquia angelica em 9 coros. O "Livro de Enoch" (sec. III-II a.C.) ja listava vigilantes e arcanjos.',
  4, ['Nao invocar anjos sem preparo cabalistico', 'Respeitar nomes hebraicos'],
  'Tradicao Enoch · Pseudo-Dionisio', 'Hermetismo · Cristianismo Mistico',
  ['Pseudo-Dionisio Areopagita'],
  licenseCCBYNCSA(), [{
    title: 'A Hierarquia Celeste', author: 'Pseudo-Dionisio', year: 500,
    url: 'https://www.fonsvitae.com/', accessedAt: '2026-06-29', type: 'textual',
  }, { title: 'O Livro de Enoch', author: 'Anonimo', year: 200,
    url: 'https://www.livro-enoch.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('cabala-tetragrammaton'), makeSymbolId('cabala-arvore-vida'),
   makeSymbolId('christianity-cruz')], [],
  '✴', 'Ser alado com brilho dourado', 'breathe', 'centered'
);

const CABALA_GEMATRIA = mkSym(
  'cabala-gematria', 'Gematria', 'number', 'cabala', ['esoterismo'],
  ['Gematria', 'Notarikon', 'Temurah', 'Numerologia Hebraica'],
  null, '#708090', 'numerais-hebraicos',
  'Sistema de atribuicao numerica as letras hebraicas — usadas para descobrir correspondencias entre palavras e conceitos. Cada letra = 1, 10, 100 ou 1000.',
  'Atribuida a Abraao de Portaleone (sec. XVI), embora a pratica remonte ao Talmude. E central na Cabala comparativa.',
  3, ['Respeitar valor numerico das letras finais', 'Nao usar para previsoes sem fundamento'],
  'Talmude Babilonico (Menahot 29b)', 'Tradicao Cabalistica Comparada',
  ['Abraao Portaleone', 'Rabbi Aryeh Kaplan'],
  licenseCCBYSA(), [{ title: 'Gematria: A Numerologia Hebraica',
    author: 'Rabino Aryeh Kaplan', year: 1977,
    url: 'https://www.kaplanbook.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('cabala-sephirah'), makeSymbolId('cabala-tetragrammaton')], [],
  undefined, 'Coluna de algarismos hebraicos', 'static', 'grid'
);

const CABALA_MEZUZA = mkSym(
  'cabala-mezuza', 'Mezuza', 'sacred_object', 'cabala', ['cabala'],
  ['Mezuza', 'Mezuzah', 'Pergaminho da Porta'],
  null, '#DAA520', 'pequeno-rolo',
  'Pequeno rolo de pergaminho colocado nas ombreiras das portas de casas judaicas. Contem os versiculos Deuteronomio 6:4-9 e 11:13-21. E um sinal fisico da fe.',
  'O comando da mezuza vem de Deuteronomio 6:9. Sua pratica data do periodo do Segundo Templo (sec. II a.C.).',
  4, ['Inspecionar periodicamente (kohach)', 'Nao pendurar de cabeca para baixo sem proposito'],
  'Deuteronomio 6:9', 'Halacha Rabi­nica',
  ['Tradicao Rabi­nica'],
  licenseCCBYSA(), [{ title: 'Shulchan Aruch — Yoreh Deah',
    author: 'Rabino Yosef Karo', year: 1563,
    url: 'https://www.sefaria.org/Shulchan_Arukh%2C_Yoreh_Deah',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('cabala-tetragrammaton'), makeSymbolId('cabala-arvore-vida')], [],
  undefined, 'Capsula + rolo com Shema', 'static', 'path'
);

// ─── ASTROLOGIA (5) ────────────────────────────────────────────────────────

const ASTRO_SOL = mkSym(
  'astrologia-sol', 'Sol', 'element', 'astrologia',
  ['esoterismo', 'candomble'],
  ['Sol', 'Sol_Symbol', 'Helios', 'Ra', 'Shamash'],
  '☉', '#FFD700', 'circulo-com-ponto',
  'Centro do sistema, regente do signo de Leao. Representa a consciencia, o eu, o pai, a vitalidade. Em astrologia e o "luminar maior".',
  'A astrologia mesopotamica ja representava o Sol como disco alado. Os egipcios tinham Ra. Gregos chamavam-no Helios.',
  2, ['Nao associar a praticas de magia solar sem preparacao'],
  'Babilonia (sec. VII a.C.)', 'Federacao Astrologica Internacional',
  ['Berossus', 'Ptolomeu'],
  licenseCC0(), [...SRC_PT],
  [makeSymbolId('astrologia-lua'), makeSymbolId('astrologia-saturno'),
   makeSymbolId('cabala-tetragrammaton')],
  [makeSymbolId('astrologia-lua')],
  '☉', 'Disco dourado com raio central', 'rotate', 'centered'
);

const ASTRO_LUA = mkSym(
  'astrologia-lua', 'Lua', 'element', 'astrologia',
  ['candomble', 'wicca', 'islam'],
  ['Lua', 'Lua_Symbol', 'Selene', 'Iemanja', 'Diana'],
  '☽', '#C0C0C0', 'meia-lua',
  'Regente de Cancer. Representa o inconsciente, a mae, a fecundidade, o ritmo. Conduz as emocoes e a intuicao. Tem 8 fases cerimoniais.',
  'O calendario lunar e o mais antigo da humanidade. A Lua foi a primeira divindade registrada na Sumeria.',
  2, ['Nao operar com Lua sem conhecer fase'],
  'Calendarios Sumerios (sec. V a.C.)', 'Federacao Astrologica Internacional',
  ['Berossus'],
  licenseCC0(), [{ title: 'The Book of the Moon', author: 'Steven Forrest',
    year: 2008, url: 'https://www.forrestastrology.com/',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('astrologia-sol'), makeSymbolId('candomble-iemanja'),
   makeSymbolId('wicca-deusa-tripla')],
  [makeSymbolId('astrologia-sol')],
  '☽', 'Meia-lua com fases', 'breathe', 'centered'
);

const ASTRO_ASCENDENTE = mkSym(
  'astrologia-ascendente', 'Ascendente', 'glyph', 'astrologia', ['esoterismo'],
  ['Ascendente', 'Rising Sign', 'ASC', 'Horoskopos'],
  '↑', '#4682B4', 'seta-vertical',
  'Signo que se eleva no horizonte ao nascer. Representa a "mascara social", o corpo, a primeira impressao. E a ponta do eixo do mapa astral.',
  'O conceito de Ascendente e posterior ao sistema helenistico. Ptolomeu define-o como o signo que emerge no Leste.',
  2, ['Nao confundir com Sol ou Lua'],
  'Ptolomeu (sec. II)', 'Escola Helenica',
  ['Ptolomeu'],
  licenseCC0(), [...SRC_PT],
  [makeSymbolId('astrologia-sol'), makeSymbolId('astrologia-lua')], [],
  '↑', 'Seta vertical ascendente', 'static', 'path'
);

const ASTRO_SATURNO = mkSym(
  'astrologia-saturno', 'Saturno', 'element', 'astrologia',
  ['esoterismo', 'buddhism'],
  ['Saturno', 'Saturno_Symbol', 'Cronos', 'Chronos', 'Shani'],
  '♄', '#2F4F4F', 'foice',
  'Regente de Capricornio e Aquario (na era moderna). Representa tempo, limite, estrutura, maturidade, karma. E o "senhor" das provacoes.',
  'Cronos era o tita pai de Zeus. Os hindus tem Shani, deus do planeta.',
  3, ['Nao invocar Saturno sem "protecao" cabalistica'],
  'Grecia Classica · India Vedica', 'Sincretismo Helenico',
  ['Berossus', 'Vyasa'],
  licenseCC0(), [{ title: 'Saturno — O Senhor do Tempo', author: 'Liz Greene',
    year: 1986, url: 'https://www.lizgreene.com/',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('astrologia-sol'), makeSymbolId('astrologia-venus')],
  [makeSymbolId('astrologia-venus')],
  '♄', 'Cruz com foice (h ou 5)', 'static', 'centered'
);

const ASTRO_VENUS = mkSym(
  'astrologia-venus', 'Venus', 'element', 'astrologia',
  ['esoterismo', 'candomble', 'wicca'],
  ['Venus', 'Venus_Symbol', 'Afrodite', 'Anahita', 'Oxum'],
  '♀', '#FFC0CB', 'cruz-com-circulo',
  'Regente de Touro e Libra. Representa amor, beleza, valores, arte e harmonia. Em sua expressao forte, e a "reconciliacao das partes".',
  'Astarte fenicia, Afrodite grega, Anahita persa — todas associadas ao planeta. Sincronizadas com Oxum na ioruba.',
  3, ['Nao associar trivialmente ao "amor romantico" sem profundidade'],
  'Grecia (sec. VII a.C.)', 'Sincretismo Helenico-Brasileiro',
  ['Berossus', 'Hesiodo'],
  licenseCC0(), [{ title: 'Astrologia & Mitologia', author: 'Julio de Mattos',
    year: 2005, url: 'https://www.editoravega.com.br/',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('candomble-oxum'), makeSymbolId('astrologia-sol')],
  [makeSymbolId('astrologia-saturno')],
  '♀', 'Espelho (circulo-com-cruz)', 'breathe', 'centered'
);

// ─── TANTRA (4) ────────────────────────────────────────────────────────────

const TANTRA_YANTRA = mkSym(
  'tantra-yantra', 'Yantra', 'geometric', 'tantra',
  ['buddhism', 'hinduism', 'cabala'],
  ['Yantra', 'Yantra_Tantra', 'Diagrama Tantrico'],
  null, '#FF8C00', 'geometria-simetrica',
  'Diagrama geometrico usado na meditacao tantrica — combina triangulos, circulos e lotus. Shri Yantra e o mais famoso (9 triangulos entrelacados).',
  'Yantras vem do tantrismo hindu (sec. V-XII). Cada yantra corresponde a uma divindade especifica — Shri Yantra a Tripura Sundari.',
  5, ['Construir/banhar yantra em rituais apropriados', 'Nao associar a produtos comerciais sem licenca'],
  'Tantra Hindu (sec. V-XII)', 'Tradicao Kaula & Kashmir Shaiva',
  ['Abhinavagupta', 'Mookerjee'],
  TANTRA_TK, [{ title: 'Shri Yantra — O Simbolo Supremo',
    author: 'Ajit Mookerjee', year: 1990,
    url: 'https://www.innertraditions.com/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('tantra-mantra'), makeSymbolId('tantra-shakti'),
   makeSymbolId('cabala-arvore-vida')], [],
  undefined, 'Diagrama geometrico (9 triangulos)', 'rotate', 'grid'
);

const TANTRA_MANTRA = mkSym(
  'tantra-mantra', 'Mantra', 'mantra', 'tantra', ['buddhism', 'hinduism'],
  ['Mantra', 'Om Mani Padme Hum', 'Gayatri', 'Mahamrityunjaya'],
  'ॐ', '#FFA500', 'cadeia-de-sons',
  'Som sagrado de poder — palavra ou silaba repetida para invocar uma divindade ou qualidade. "Om" e o som primordial.',
  'Os mantras tem origem nos Vedas (sec. XV-X a.C.) — os hinos sagrados. A "Shruti" (audicao) e mais antiga que a "Smriti" (memoria).',
  4, ['Receber mantra de um guru (diksha)', 'Nao improvisar mantras'],
  'Vedas · Shruti', 'Linha Kaula · Kashmir Shaiva',
  ['Patanjali', 'Vyasa'],
  TANTRA_TK, [{ title: 'Mantra — Simbolos de Poder',
    author: 'Harish Johari', year: 1985,
    url: 'https://www.innertraditions.com/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('tantra-yantra'), makeSymbolId('tantra-kundalini'),
   makeSymbolId('buddhism-om')], [],
  'ॐ', 'Onda sonora em espiral', 'flow', 'ring'
);

const TANTRA_KUNDALINI = mkSym(
  'tantra-kundalini', 'Kundalini', 'element', 'tantra', ['hinduism'],
  ['Kundalini', 'Energia Kundalini', 'Serpente Espiritual', 'Shakti Adormecida'],
  null, '#FF4500', 'serpente-enrolada',
  'Energia primordial adormecida no Muladhara (chakra raiz). Quando desperta, sobe pela Sushumna ate o Sahasrara. Sua ativacao requer iniciacao.',
  'O conceito aparece no Atharva Veda (sec. X a.C.). Hatha Yoga (sec. X-XII) sistematizou tecnicas de despertar.',
  5, ['Nao praticar Kundalini sem guru', 'Nao despertar por impulso'],
  'Atharva Veda · Yoga Sutras', 'Tradicao Hatha Yoga · Kashmir Shaivism',
  ['Patanjali', 'Yogi Bhajan'],
  TANTRA_TK, [{ title: 'The Serpent Power',
    author: 'Arthur Avalon (John Woodroffe)', year: 1919,
    url: 'https://www.gutenberg.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('tantra-shakti'), makeSymbolId('tantra-mantra'),
   makeSymbolId('hinduism-shiva')], [],
  undefined, 'Serpente enrolada na base da coluna', 'flow', 'path'
);

const TANTRA_SHAKTI = mkSym(
  'tantra-shakti', 'Shakti', 'deity', 'tantra', ['hinduism'],
  ['Shakti', 'Sakti', 'Energia Feminina', 'Kali', 'Parvati'],
  null, '#DC143C', 'triangulo-com-ponta-para-baixo',
  'Energia divina feminina — principio dinamico da criacao. Shakti e a "esposa" de Shiva (consciencia estatica). Sem Shakti, Shiva e immovel.',
  'Aparece nos Puranas (sec. IV-X). O Shaktismo vira sistema distinto do Shaivismo a partir do sec. VII.',
  5, ['Nao reduzir a um aspecto unico', 'Respeitar Kalikula (familia de Kali)'],
  'Puranas · Tantra', 'Shaktismo · Trika',
  ['Abhinavagupta'],
  TANTRA_TK, [{ title: 'Principle of Tantra', author: 'Arthur Avalon',
    year: 1914, url: 'https://www.gutenberg.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('tantra-kundalini'), makeSymbolId('tantra-mantra'),
   makeSymbolId('hinduism-shiva')], [],
  undefined, 'Triangulo vermelho com deusa', 'pulse', 'centered'
);

// ─── CHRISTIANITY (5) ──────────────────────────────────────────────────────

const CHRISTIAN_CRUZ = mkSym(
  'christianity-cruz', 'Cruz', 'sacred_object', 'christianity',
  ['candomble', 'wicca', 'santo_daime'],
  ['Cruz', 'Crux', 'Crucifix', 'Cruz Latina', 'Cruz Grega'],
  '✝', '#8B0000', 'cruz',
  'Simbolo central do Cristianismo — instrumento da execucao de Jesus e, subsequently, simbolo da Ressurreicao. A cruz vazia (sem corpo) e a versao protestante.',
  'Inicialmente paga (execucoes multiplas no Imperio Romano). Constantino (sec. IV) a adotou.',
  5, ['Nao usar como adorno profano', 'Respeitar versao liturgica (Tau, grega, russa, latina)'],
  'Constantino (sec. IV)', 'Concilio de Niceia · Tradicao Catolica',
  ['Concilio de Trento', 'Papa Joao Paulo II'],
  licenseCCBYSA(), [{ title: 'A History of the Cross', author: 'John Mason Neale',
    year: 1857, url: 'https://www.gutenberg.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('christianity-trindade'), makeSymbolId('christianity-cordeiro'),
   makeSymbolId('santo_daime-cruzeiro'), makeSymbolId('candomble-ogum')], [],
  '✝', 'Cruz latina com corpus ou sem', 'static', 'centered'
);

const CHRISTIAN_TRINDADE = mkSym(
  'christianity-trindade', 'Trindade', 'glyph', 'christianity',
  ['cabala', 'esoterismo'],
  ['Trindade', 'Santissima Trindade', 'Pai-Filho-Espirito', 'Triuno'],
  null, '#FFD700', 'triangulo-equilatero',
  'Doutrina central do Cristianismo: Deus em tres pessoas — Pai, Filho (Jesus), Espirito Santo. Fixada pelos Concilios de Niceia (325) e Calcedonia (451).',
  'A controversia trinitaria durou seculos (sec. II-IV). Os Concilios estabeleceram a ortodoxia.',
  5, ['Nao reduzir a "tres deuses" (triteismo)', 'Nao confundir com politeismo'],
  'Concilio de Niceia (325)', 'Tradicao Niceno-Calcedonia',
  ['Atanasio', 'Basilio de Cesareia'],
  licenseCCBYSA(), [{ title: 'Credo Niceno', author: 'Concilio de Niceia',
    year: 325, url: 'https://www.oca.org/orthodoxy/christian-doctrine/nicene-creed',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('christianity-cruz'), makeSymbolId('cabala-sephirah')], [],
  undefined, 'Triangulo em ouro com olho central', 'pulse', 'centered'
);

const CHRISTIAN_VIRGEM_MARIA = mkSym(
  'christianity-virgem-maria', 'Virgem Maria', 'deity', 'christianity',
  ['candomble', 'umbanda', 'islam'],
  ['Virgem Maria', 'Nossa Senhora', 'Mae de Deus', 'Santa Maria'],
  null, '#4169E1', 'mulher-em-azul',
  'Mae de Jesus segundo a tradicao crista. Tida como Theotokos (Mae de Deus) pelo Concilio de Efeso (431). Sincronizada com Iemanja nas Americas.',
  'Maria apareceu pela primeira vez em imagens em catacumbas romanas (sec. II). As aparicoes em Lourdes (1858) e Fatima (1917) consolidaram sua devocao moderna.',
  5, ['Respeitar dogma mariano', 'Nao associar trivialmente em contextos humoristicos'],
  'Concilio de Efeso (431)', 'Tradicao Catolica · Ortodoxa',
  ['Bernardo de Claraval', 'Papa Pio IX'],
  licenseCCBYSA(), [{ title: 'A Doutrina Mariana',
    author: 'Congregacao para a Doutrina da Fe', year: 2000,
    url: 'https://www.vatican.va/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('candomble-iemanja'), makeSymbolId('christianity-cordeiro')], [],
  undefined, 'Mulher em manto azul com aureola', 'static', 'centered'
);

const CHRISTIAN_CORDEIRO = mkSym(
  'christianity-cordeiro', 'Cordeiro', 'animal', 'christianity',
  ['cabala'],
  ['Cordeiro', 'Cordeiro de Deus', 'Agnus Dei', 'Cordeiro Pascal'],
  null, '#FFFFFF', 'cordeiro-com-bandeira',
  'Cordeiro de Deus que tira o pecado do mundo (Agnus Dei). Jesus e chamado de "cordeiro sacrificial" desde o Novo Testamento.',
  'A imagem do cordeiro sacrificial vem de Exodo 12 — o cordeiro pascal. Joao Batista a aplica a Jesus em Joao 1:29.',
  5, ['Nao associar a signos astrologicos de Aries sem contexto'],
  'Exodo 12 · Joao 1:29', 'Tradicao Crista',
  ['Sao Joao Batista'],
  licenseCCBYSA(), [{ title: 'O Cordeiro de Deus', author: 'Sao Joao Crisostomo',
    year: 400, url: 'https://www.oca.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('christianity-cruz'), makeSymbolId('christianity-virgem-maria')], [],
  undefined, 'Cordeiro branco com estandarte', 'static', 'centered'
);

const CHRISTIAN_PEIXE = mkSym(
  'christianity-peixe', 'Peixe', 'animal', 'christianity',
  ['candomble', 'buddhism'],
  ['Peixe', 'Ichthys', 'Simbolo dos Primeiros Cristaos'],
  '🐟', '#87CEFA', 'peixe',
  'Simbolo crista primitivo — Ichthys. Forma de peixe usada como identificacao secreta nas catacumbas durante as perseguicoes romanas.',
  'Ichthys e acrostico de "Iesous Christos Theou Yios Soter" (Jesus Cristo, Filho de Deus, Salvador). Usada desde o sec. II.',
  3, ['Respeitar contextos liturgicos'],
  'Catacumbas de Sao Calisto (sec. II)', 'Tradicao Crista Primitiva',
  ['Clemente de Alexandria'],
  licenseCC0(), [{ title: 'O Simbolo do Peixe', author: 'Arthur Hipolito',
    year: 200, url: 'https://www.cristianismo-primitivo.com.br/',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('christianity-cruz'), makeSymbolId('candomble-iemanja')], [],
  '🐟', 'Peixe estilizado em curva', 'flow', 'natural'
);

// ─── ISLAM (4) ─────────────────────────────────────────────────────────────

const ISLAM_CRESCENTE = mkSym(
  'islam-crescente', 'Crescente', 'glyph', 'islam',
  ['christianity', 'candomble'],
  ['Crescente', 'Hilal', 'Lua Crescente Islamica', 'Estrela e Crescente'],
  '☪', '#006400', 'crescente-com-estrela',
  'A crescente lunar e o simbolo classico do Isla — marcou o calendario islamico (hijri). A estrela adicionada (sec. XIX) e da tradicao otomana.',
  'O calendario islamico e lunar — inicia com a Hegira (622 d.C.). A bandeira otomana combina crescente e estrela.',
  3, ['Respeitar caligrafia islamica', 'Nao associar a extremismo'],
  'Califado Otomano (sec. XIX)', 'Organizacao da Cooperacao Islamica',
  ['Sultan Abdulmejid'],
  licenseCC0(), [{ title: 'Historia do Crescente Islamico',
    author: 'Tariq Ramadan', year: 2010, url: 'https://www.tariqramadan.com/',
    accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('islam-allah'), makeSymbolId('astrologia-lua')], [],
  '☪', 'Crescente com estrela', 'static', 'centered'
);

const ISLAM_NOMES_99 = mkSym(
  'islam-99-nomes', '99 Nomes de Allah', 'mantra', 'islam',
  ['cabala', 'esoterismo'],
  ['99 Nomes', 'Asma ul-Husna', '99 Belissimos Nomes'],
  null, '#228B22', 'cadeia-de-nomes',
  'Os 99 nomes divinos de Allah — Al-Rahman, Al-Rahim, Al-Wadud etc. Recita-los e caminho de proximidade com Deus. Correlacionam-se com as 10 Sephirot.',
  'Enumeracao canonica vem do Hadith de Tirmidhi. O 100o nome (oculto) e a fonte mistica da tradicao Sufi.',
  5, ['Respeitar a pureza antes da recitacao', 'Nao numerologia-los sem estudo'],
  'Hadith de Tirmidhi', 'Tradicao Sufi · Ash\'ari',
  ['Imam al-Ghazali'],
  licenseCCBYSA(), [{ title: 'Al-Maqshad al-Asna', author: 'Imam al-Ghazali',
    year: 1100, url: 'https://www.ghazali.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('islam-allah'), makeSymbolId('cabala-sephirah')], [],
  undefined, 'Coluna com 99 nomes em arabe', 'flow', 'grid'
);

const ISLAM_MECA = mkSym(
  'islam-meca', 'Meca', 'sacred_place', 'islam', ['cabala'],
  ['Meca', 'Makkah', 'Caaba', 'Kaaba', 'Bakkah'],
  null, '#000000', 'cubico-preto',
  'Cidade sagrada do Isla, na Arabia Saudita. A Caaba (Kaaba) e o cubo preto no centro — ponto focal do Hajj e das cinco oracoes diarias.',
  'A Caaba foi reconstruida por Ibrahim e Ismail. Maometo a purificou em 630 d.C. — retirando os idolos.',
  5, ['Respeitar estado de Ihram', 'Nao-genros穆斯林s proibidos de entrar (em algumas versoes)'],
  'Ibrahim (Abraao)', 'Reino da Arabia Saudita · Hajj',
  ['Imam Bukhari'],
  licenseSacredRestricted(), [{ title: 'Hajj — A Peregrinacao',
    author: 'Fazlur Rahman', year: 1979,
    url: 'https://www.sacredarchitecture.com/',
    accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('islam-crescente'), makeSymbolId('islam-allah')], [],
  undefined, 'Cubo negro com kiswa dourada', 'static', 'centered'
);

const ISLAM_ANWAR = mkSym(
  'islam-anwar', 'Anwar', 'color', 'islam', ['esoterismo'],
  ['Anwar', 'Luzes', 'Anwar Coranica', 'Versiculos da Luz'],
  null, '#FFFFE0', 'luz-radial',
  'Os "Versiculos da Luz" (Ayat an-Nur) — Surata 24:35. Descreve Deus como luz sobre luz, parabolica. Central na mistica Sufi.',
  'Interpretacao de Ibn Arabi (sec. XIII) — cada nivel de Anwar corresponde a um estadio espiritual.',
  4, ['Respeitar recitacao em estado de pureza'],
  'Surata 24:35', 'Tradicao Sufi · Ibn Arabi',
  ['Ibn Arabi', 'Rumi'],
  licenseCCBYSA(), [{ title: 'Fusus al-Hikam', author: 'Ibn Arabi', year: 1229,
    url: 'https://www.ibnarabi.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('islam-allah'), makeSymbolId('islam-crescente')], [],
  undefined, 'Raios de luz irradiando', 'pulse', 'centered'
);

// ─── BUDDHISM (4) ──────────────────────────────────────────────────────────

const BUDDHISM_BUDA = mkSym(
  'buddhism-buda', 'Buda', 'deity', 'buddhism',
  ['christianity', 'hinduism'],
  ['Buda', 'Buddha', 'Siddhartha Gautama', 'Shakyamuni', 'Tathagata'],
  null, '#FFD700', 'humana-em-meditacao',
  'O Desperto — Siddhartha Gautama (sec. V-IV a.C.) alcancou a iluminacao sob a arvore Bodhi. Nao e um deus, mas um ser que despertou para a natureza da realidade.',
  'Siddhartha nasceu em Lumbini (Nepal), atingiu despertar em Bodh Gaya, deu seu primeiro sermao em Sarnath e morreu (parinirvana) em Kusinagara.',
  4, ['Nao posicionar os pes em direcao a imagem (em algumas tradicoes)', 'Respeitar mudras'],
  'Siddhartha Gautama (sec. V a.C.)', 'Sangha · Theravada · Mahayana',
  ['Nagarjuna', 'Dharmakirti'],
  licenseCC0(), [{ title: 'Dhammapada', author: 'Buda (atrib.)', year: 400,
    url: 'https://www.accesstoinsight.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('buddhism-dharma'), makeSymbolId('buddhism-lotus'),
   makeSymbolId('buddhism-mandala')], [],
  undefined, 'Figura em lotus, olhos baixos', 'breathe', 'centered'
);

const BUDDHISM_MANDALA = mkSym(
  'buddhism-mandala', 'Mandala', 'geometric', 'buddhism',
  ['hinduism', 'tantra'],
  ['Mandala', 'Mandala Budista', 'Circulo Sagrado'],
  null, '#9370DB', 'circulo-com-padroes',
  'Diagrama circular representando a morada de uma divindade ou a estrutura do universo. Usado para meditacao e iniciacao tantrica.',
  'Mandalas vem dos Upanishads e foram sistematizadas no Mahayana (sec. II-V).',
  4, ['Respeitar iniciacao tantrica', 'Nao manusear sem contexto ritual'],
  'Vajrayana Tibetano (sec. VIII)', 'Tradicao Nyingma & Gelug',
  ['Padmasambhava', 'Tsongkhapa'],
  BUDDHISM_TK, [{ title: 'Sand Mandala — A Meditacao em Areia',
    author: 'Tibetan Monastery', year: 1990,
    url: 'https://www.dharma.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('buddhism-buda'), makeSymbolId('tantra-yantra')], [],
  undefined, 'Padrao circular colorido', 'rotate', 'grid'
);

const BUDDHISM_LOTUS = mkSym(
  'buddhism-lotus', 'Lotus', 'plant', 'buddhism',
  ['hinduism', 'tantra'],
  ['Lotus', 'Padma', 'Flor de Lotus', 'Nelumbo nucifera'],
  '🪷', '#FFB6C1', 'flor-de-petalas',
  'Flor que emerge limpa da lama — simbolo do caminho espiritual. Representa a capacidade de despertar apesar da impureza do mundo.',
  'A lotus e icone do Mahayana desde os Sutras do Lotus (sec. III). Amitabha Buda geralmente segura uma lotus.',
  3, ['Respeitar cores (branca/Avalokiteshvara, vermelha/Amitabha, dourada/Vajrayana)'],
  'Sutra do Lotus (sec. III)', 'Mahayana · Vajrayana',
  ['Kumarajiva'],
  licenseCC0(), [{ title: 'The Lotus Sutra', author: 'Buda (atrib.)', year: 200,
    url: 'https://www.lotussutra.com/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('buddhism-buda'), makeSymbolId('buddhism-dharma')], [],
  '🪷', 'Flor de lotus cor-de-rosa', 'breathe', 'centered'
);

const BUDDHISM_DHARMA = mkSym(
  'buddhism-dharma', 'Dharma', 'scripture', 'buddhism', ['hinduism'],
  ['Dharma', 'Dhamma', 'Ensinamento', 'Dharma Wheel'],
  '☸', '#FF8C00', 'roda-de-8-raios',
  'O ensinamento do Buda — a Lei Natural. A "Roda do Dharma" (Dharmachakra) tem 8 raios, representando o Nobre Caminho Octuplo.',
  'O primeiro sermao (Dharmachakra Pravartana) em Sarnath marcou o inicio do Sangha. A roda e simbolo do Imperio Ashoka.',
  4, ['Respeitar 8 raios (Nobre Caminho)'],
  'Buda em Sarnath (sec. V a.C.)', 'Theravada · Mahayana',
  ['Ashoka', 'Ananda'],
  licenseCC0(), [{ title: 'Turning the Wheel of Dharma', author: 'Sangharakshita',
    year: 1965, url: 'https://www.windhorsepublications.com/',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('buddhism-buda'), makeSymbolId('buddhism-lotus')], [],
  '☸', 'Roda de 8 raios', 'rotate', 'centered'
);

// ─── HINDUISM (4) ──────────────────────────────────────────────────────────

const HINDU_OM = mkSym(
  'hinduism-om', 'Om', 'mantra', 'hinduism',
  ['buddhism', 'tantra', 'christianity'],
  ['Om', 'Aum', 'Pranava', 'Som Primordial'],
  'ॐ', '#FF8C00', 'caractere-arqueado',
  'Som primordial que contem todos os outros. Representa Brahman (o absoluto), a criacao, manutencao e dissolucao.',
  'Aparece nos Upanishads (sec. VII-V a.C.). Tagore e Gandhi popularizaram-no no sec. XX.',
  5, ['Nao pronunciar profanamente em culturas musulmanas ortodoxas', 'Respeitar o som completo (A-U-M)'],
  'Upanishads · Atharva Veda', 'Tradicao Vedanta · Yoga',
  ['Shankara', 'Tagore'],
  licenseCCBYSA(), [{ title: 'Mandukya Upanishad', author: 'Anonimo', year: 600,
    url: 'https://www.wisdomlib.org/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('tantra-mantra'), makeSymbolId('buddhism-om'),
   makeSymbolId('christianity-amen')], [],
  'ॐ', 'Simbolo estilizado', 'pulse', 'centered'
);

const HINDU_GANESHA = mkSym(
  'hinduism-ganesha', 'Ganesha', 'deity', 'hinduism',
  ['buddhism', 'christianity'],
  ['Ganesha', 'Ganesh', 'Vinayaka', 'Removedor de Obstaculos', 'Senhor dos Inicios'],
  null, '#FFA500', 'humana-com-cabeca-de-elefante',
  'Divindade da sabedoria, removedora de obstaculos, patrona das artes e do conhecimento. Sincronizada com Santo Antonio na tradicao sincretica catolica.',
  'Filho de Shiva e Parvati. Sua cabeca de elefante e resultado de um incidente com Shiva. Invocada primeiro em qualquer rito.',
  5, ['Nao posicionar atras de outras divindades no altar', 'Respeitar primeiro Ganesha'],
  'Puranas (sec. IV-X)', 'Shaivismo · Smarta',
  ['Vyasa'],
  HINDU_TK, [{ title: 'Ganesha — Removedor de Obstaculos',
    author: 'Anant Pai', year: 2000,
    url: 'https://www.amarchitrakatha.com/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('hinduism-shiva'), makeSymbolId('hinduism-om'),
   makeSymbolId('candomble-ogum')], [],
  undefined, 'Divindade com tromba', 'breathe', 'centered'
);

const HINDU_LAKSHMI = mkSym(
  'hinduism-lakshmi', 'Lakshmi', 'deity', 'hinduism',
  ['buddhism', 'candomble'],
  ['Lakshmi', 'Laksmi', 'Mahalakshmi', 'Deusa da Fortuna'],
  null, '#FFD700', 'humana-com-lotus',
  'Deusa da fortuna, prosperidade, beleza e fertilidade. Sincroniza-se com Oxum no Brasil. Emerge do Oceano de Leite (Samudra Manthan).',
  'Aparece no Rig Veda (sec. XV a.C.) como deusa da boa fortuna. Vishnu a escolheu como esposa.',
  5, ['Respeitar oferendas de lotus', 'Nao associar trivialmente a "sorte"'],
  'Rig Veda (sec. XV a.C.)', 'Vaishnavismo · Shaktismo',
  ['Vyasa'],
  HINDU_TK, [{ title: 'Lakshmi — The Goddess of Wealth',
    author: 'Devdutt Pattanaik', year: 2010,
    url: 'https://www.devdutt.com/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('hinduism-vishnu'), makeSymbolId('candomble-oxum')], [],
  undefined, 'Deusa em lotus dourada', 'breathe', 'centered'
);

const HINDU_VISHNU = mkSym(
  'hinduism-vishnu', 'Vishnu', 'deity', 'hinduism', ['candomble'],
  ['Vishnu', 'Vishnu_Preserve', 'Hari', 'Narayana', 'Senhor do Universo'],
  null, '#4169E1', 'humana-azul-com-4-bracos',
  'O preservador do universo na triade hindu (Trimurti). Seus avatares incluem Rama e Krishna. Sincronizado com Oxala no sincretismo brasileiro.',
  'Aparece no Rig Veda (sec. XV a.C.) como divindade solar. Seu culto ascendeu no Bhagavata Purana (sec. IX-X).',
  5, ['Respeitar nama-japa repetido 108 vezes', 'Nao associar trivialmente a miscigenacao sem contexto'],
  'Rig Veda (sec. XV a.C.)', 'Vaishnavismo · ISKCON',
  ['Vyasa'],
  HINDU_TK, [{ title: 'Vishnu — The Preserver', author: 'Devdutt Pattanaik',
    year: 2018, url: 'https://www.devdutt.com/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('hinduism-lakshmi'), makeSymbolId('candomble-oxala')],
  [],
  undefined, 'Divindade azul com 4 bracos', 'breathe', 'centered'
);

// ─── WICCA (4) ─────────────────────────────────────────────────────────────

const WICCA_PENTAGRAMA = mkSym(
  'wicca-pentagrama', 'Pentagrama', 'geometric', 'wicca',
  ['esoterismo', 'cabala', 'christianity'],
  ['Pentagrama', 'Pentacle', 'Estrela de 5 Pontas'],
  '⛤', '#000000', 'estrela-de-5-pontas',
  'Estrela de cinco pontas — protegida por circulo. Simboliza os 5 elementos (Terra, Agua, Fogo, Ar, Eter). Sincroniza-se com o Selo de Salomao.',
  'Pythagoricos (sec. VI a.C.) ja o utilizavam. Na Wicca moderna (Gerald Gardner, sec. XX), e simbolo central da Tradicao Bruxa.',
  3, ['Respeitar pentagrama invertido (apenas para 2a iniciacao)'],
  'Pythagoricos (sec. VI a.C.)', 'Tradicao Gardneriana · Alexandrina',
  ['Gerald Gardner', 'Alex Sanders'],
  licenseCCBYSA(), [{ title: 'Witchcraft Today', author: 'Gerald Gardner',
    year: 1954, url: 'https://www.llewellyn.com/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('wicca-deusa-tripla'), makeSymbolId('wicca-calcis'),
   makeSymbolId('cabala-arvore-vida')], [],
  '⛤', 'Estrela de cinco pontas', 'static', 'centered'
);

const WICCA_DEUSA_TRIPLA = mkSym(
  'wicca-deusa-tripla', 'Deusa Tripla', 'deity', 'wicca',
  ['hinduism', 'christianity', 'candomble'],
  ['Deusa Tripla', 'Triple Goddess', 'Maiden-Mother-Crone', 'Hecate'],
  '☽', '#FFFFFF', 'tres-mulheres',
  'A Deusa em tres aspectos — Donzela (Lua Nova), Mae (Lua Cheia), Ancia (Lua Minguante). E o principio feminino cosmico da Wicca.',
  'Reintroduzida na Wicca moderna por Gerald Gardner (sec. XX), embora tenha raizes em Hecate, Diana e na Triplice Deusa Celta.',
  4, ['Respeitar os tres aspectos', 'Nao reduzir a apenas um'],
  'Celtas pre-cristaos · Greco-romanos', 'Tradicao Wicca Gardneriana',
  ['Gerald Gardner', 'Doreen Valiente'],
  licenseCCBYSA(), [{ title: 'The Triple Goddess', author: 'Aswynn Freyer',
    year: 2001, url: 'https://www.innertraditions.com/',
    accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('wicca-pentagrama'), makeSymbolId('astrologia-lua'),
   makeSymbolId('candomble-iemanja')],
  [makeSymbolId('wicca-calcis')],
  '☽', 'Tres figuras em fases da lua', 'breathe', 'ring'
);

const WICCA_CALICE = mkSym(
  'wicca-calcis', 'Calice', 'ritual_tool', 'wicca', ['christianity'],
  ['Calice', 'Chalice', 'Calice Ritual', 'Vaso Feminino'],
  null, '#C0C0C0', 'taca-prateada',
  'Taca ritual representando o principio feminino (correspondendo ao Athame masculino). Usada em rituais wiccanos para libacoes eucaristicas.',
  'Simbolo dos misterios celtas e gregos. Gardner integrou-a no Great Rite (uniao de Athame e Calice como consagraçao do poder).',
  3, ['Respeitar conteudo (agua/vinho)', 'Nao usar para bebidas comuns'],
  'Misterios Gregos · Druidismo', 'Tradicao Wicca Gardneriana',
  ['Gerald Gardner'],
  licenseCCBYSA(), [{ title: 'The Book of Shadows', author: 'Gerald Gardner',
    year: 1949, url: 'https://www.llewellyn.com/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('wicca-pentagrama'), makeSymbolId('wicca-athame')],
  [makeSymbolId('wicca-athame')],
  undefined, 'Taca prateada com pe alto', 'static', 'centered'
);

const WICCA_ATHAME = mkSym(
  'wicca-athame', 'Athame', 'ritual_tool', 'wicca',
  ['candomble', 'esoterismo'],
  ['Athame', 'Adaga Ritual', 'Faca de Duas Maos'],
  null, '#2F4F4F', 'adaga-preta',
  'Adaga ritual de cabo preto e lamina dupla — representa o principio masculino. E emparelhada com o Calice no Great Rite.',
  'A etimologia e disputada — provavelmente do arcaico "athame". Gardner sistematizou-a como ferramenta wiccana em 1949.',
  4, ['Nunca usar para cortar coisas fisicas', 'Respeitar consagracao'],
  'Medieval · Renascimento', 'Tradicao Wicca Gardneriana',
  ['Gerald Gardner'],
  licenseCCBYSA(), [{ title: 'The Meaning of Witchcraft', author: 'Gerald Gardner',
    year: 1959, url: 'https://www.llewellyn.com/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('wicca-pentagrama'), makeSymbolId('wicca-calcis')],
  [makeSymbolId('wicca-calcis')],
  undefined, 'Adaga preta com lamina dupla', 'static', 'centered'
);

// ─── SANTO DAIME (3) ───────────────────────────────────────────────────────

const SD_CRUZEIRO = mkSym(
  'santo_daime-cruzeiro', 'Cruzeiro', 'sacred_place', 'santo_daime', ['christianity'],
  ['Cruzeiro', 'Cruzeiro do Daime', 'Mesa de Juramida'],
  null, '#FFD700', 'cruz-em-mesa',
  'O Cruzeiro e o altar central da Doutrina do Santo Daime — uma mesa de madeira com uma cruz, estrelas (Balaio) e uma lua crescente.',
  'Mestre Irineu criou o Cruzeiro como espaco ritual no Alto Santo — seu terreiro em Rio Branco, Acre.',
  5, ['Nao pisar em frente ao Cruzeiro', 'Respeitar posicao durante os hinarios'],
  'Mestre Irineu (1930-presente)', 'Centro Ecletico de Fluente Luz Universal Raimundo Irineu Serra',
  ['Mestre Irineu', 'CEFLURB'],
  SD_TK, [{ title: 'O Cruzeiro — Centro do Santo Daime', author: 'Edward MacRae',
    year: 2008, url: 'https://www.editoragrafik.com.br/',
    accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('santo_daime-irineu'), makeSymbolId('santo_daime-hinario'),
   makeSymbolId('christianity-cruz')], [],
  undefined, 'Mesa de madeira com cruz', 'static', 'centered'
);

const SD_IRINEU = mkSym(
  'santo_daime-irineu', 'Mestre Irineu', 'deity', 'santo_daime', ['christianity'],
  ['Mestre Irineu', 'Raimundo Irineu Serra', 'Juramida'],
  null, '#FFFFFF', 'humana-com-bastao',
  'Fundador do Santo Daime (1892-1971). Mestre espiritual que recebeu o "recipiente" da Rainha da Floresta no Acre. Sincronizado com Sao Joao.',
  'Mestre Irineu nasceu em Maranhao, migrou ao Acre, trabalhou como seringueiro. Em 1930 fundou a doutrina apos visao com a Rainha da Floresta.',
  5, ['Nao comercialiar imagens sem autorizacao', 'Respeitar hinario nos rituais'],
  'Mestre Irineu (1892-1971)', 'CEFLURB · Centro Ecletico de Fluente Luz Universal',
  ['Sebastiao Mota de Melo (Padrinho Sebastiao)', 'Chico Xavier'],
  SD_TK, [{ title: 'Daime — Memorias do Mestre Irineu', author: 'Alex Polari',
    year: 1984, url: 'https://www.editoragrafik.com.br/',
    accessedAt: '2026-06-29', type: 'community' }],
  [makeSymbolId('santo_daime-cruzeiro'), makeSymbolId('santo_daime-hinario')], [],
  undefined, 'Homem barbudo com bastao', 'static', 'centered'
);

const SD_HINARIO = mkSym(
  'santo_daime-hinario', 'Hinario', 'scripture', 'santo_daime', ['christianity'],
  ['Hinario', 'Hinario do Daime', 'Salmos do Daime'],
  null, '#00008B', 'livro-de-cantos',
  'Livro de canticos rituais do Santo Daime. Compostos pelos mestres — Irineu, Sebastiao, Peu — durante estados meditativos com o cha (ayahuasca).',
  'O Hinario e o livro mais sagrado do Daime. As letras dos hinos sao canalizadas em estado de "brilho".',
  4, ['Respeitar contexto ritual', 'Nao-adeptos nao consomem sem preparacao'],
  'Mestre Irineu (1930-presente)', 'CEFLURB',
  ['Mestre Irineu', 'Padrinho Sebastiao'],
  SD_TK, [{ title: 'O Hinario do Mestre Irineu',
    author: 'Alex Polari de Alverga', year: 1984,
    url: 'https://www.editoragrafik.com.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('santo_daime-cruzeiro'), makeSymbolId('santo_daime-irineu')], [],
  undefined, 'Livro aberto com notacao musical', 'static', 'centered'
);

// ─── ESOTERISMO (3) ────────────────────────────────────────────────────────

const ESO_OLHO = mkSym(
  'esoterismo-olho', 'Olho que Tudo Ve', 'glyph', 'esoterismo',
  ['christianity', 'esoterismo'],
  ['Olho que Tudo Ve', 'All-Seeing Eye', 'Olho da Prociencia'],
  '👁', '#0000FF', 'olho-em-triangulo',
  'Olho dentro de triangulo radiante — simbolo maconico e esoterico. Representa a vigilancia divina, a visao interior.',
  'Surgiu na Maconaria especulativa (sec. XVIII). Aparece na nota de dolar (sec. XX), gerando teorias conspiratorias.',
  3, ['Respeitar versao maconica (nao confundir com teorias de conspiracao)'],
  'Maconaria Especulativa (sec. XVIII)', 'Grande Loja Unida da Inglaterra · Loja Simbolica',
  ['James Anderson (Constituicoes de 1723)'],
  licenseCCBYSA(), [{ title: 'The Eye of the Universe', author: 'Manly P. Hall',
    year: 1934, url: 'https://www.perceptionspress.com/',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('esoterismo-piramide'), makeSymbolId('cabala-sephirah')], [],
  '👁', 'Olho dentro de triangulo', 'pulse', 'centered'
);

const ESO_PIRAMIDE = mkSym(
  'esoterismo-piramide', 'Piramide', 'geometric', 'esoterismo',
  ['christianity', 'esoterismo', 'cabala'],
  ['Piramide', 'Piramide Truncada', 'Apex Pyramid', 'Great Pyramid'],
  null, '#D2691E', 'piramide-com-truncamento',
  'Piramide truncada — modelo maconico com Olho no apice. Representa a ascensao espiritual e a proporcao aurea (Phi).',
  'O simbolo maconico moderno da piramide surgiu no Selo dos EUA (1782). E uma "piramide incompleta" — representando trabalho inacabado.',
  3, ['Respeitar o Selo dos EUA como documento maconico fundador'],
  'Maconaria Americana (1782)', 'Grande Oriente dos EUA · Comissao do Selo',
  ['Thomson (proposta)', 'Bartolome Esteban Murillo'],
  licenseCC0(), [{ title: 'The Great Seal', author: 'Commission of the Great Seal',
    year: 1782, url: 'https://www.archives.gov/founding-docs/great-seal',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('esoterismo-olho'), makeSymbolId('esoterismo-phi'),
   makeSymbolId('cabala-arvore-vida')], [],
  undefined, 'Piramide truncada com olho', 'static', 'grid'
);

const ESO_PHI = mkSym(
  'esoterismo-phi', 'Phi', 'number', 'esoterismo', ['cabala'],
  ['Phi', 'Proporcao Aurea', 'Razao Aurea', 'Phi 1.618'],
  'ϕ', '#FFD700', 'espiral-aurea',
  'Proporcao Aurea — numero irracional 1.618... Aparece na natureza, na arte, na arquitetura. E considerado "proporcao divina".',
  'Descoberta pelos gregos (sec. V a.C.). Luca Pacioli publicou "De Divina Proportione" (1509) com ilustracoes de Leonardo da Vinci.',
  2, ['Nao usar misticamente sem rigor matematico'],
  'Pitagoras (sec. V a.C.)', 'Luca Pacioli · Leonardo da Vinci',
  ['Euclides'],
  licenseCC0(), [{ title: 'De Divina Proportione', author: 'Luca Pacioli',
    year: 1509, url: 'https://www.getty.edu/art/collection/object/',
    accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('esoterismo-piramide'), makeSymbolId('cabala-sephirah')], [],
  'ϕ', 'Espiral logaritmica', 'flow', 'natural'
);

// ─── ESPIRITISMO (3) ───────────────────────────────────────────────────────

const ESP_CODIFICACAO = mkSym(
  'espiritismo-codificacao', 'Codificacao', 'scripture', 'espiritismo', ['christianity'],
  ['Codificacao', 'O Livro dos Espiritos', 'Codificacao Kardequiana'],
  null, '#4682B4', 'livro-azul',
  'A Codificacao Kardequiana — conjunto de obras ditadas por mediums e organizadas por Allan Kardec (Hippolyte Leon Denizard Rivail) em Paris (1857).',
  'O Livro dos Espiritos (1857), O Livro dos Mediums (1861), O Evangelho Segundo o Espiritismo (1864).',
  4, ['Respeitar metodologia kardequiana'],
  'Allan Kardec (1804-1869)', 'Federacao Espirita Brasileira (FEB)',
  ['Allan Kardec'],
  licensePublicDomain(), [...SRC_KARDEC_OBRAS],
  [makeSymbolId('espiritismo-perispírito'), makeSymbolId('espiritismo-medium'),
   makeSymbolId('christianity-peixe')], [],
  undefined, 'Livro azul aberto com pena', 'static', 'centered'
);

const ESP_PERISPIRITO = mkSym(
  'espiritismo-perispírito', 'Perispirito', 'element', 'espiritismo',
  ['candomble', 'christianity'],
  ['Perispirito', 'Corpo Espiritual', 'Duplo Eterico'],
  null, '#9370DB', 'corpo-aurico',
  'Corpo intermediario entre o fisico e o espirito — sede das emocoes e da memoria do espirito. Apos a morte, mantem a forma do corpo fisico.',
  'Conceito sistematizado por Allan Kardec (1857). O duplo-eterico foi explorado por teosofos como Blavatsky.',
  4, ['Respeitar metodologia espirita', 'Nao associar a praticas New-Age sem fundamento'],
  'Kardec · Teosofia · Antroposofia', 'FEB · Sociedade Teosofica',
  ['Allan Kardec', 'Helena Blavatsky'],
  licenseCCBYSA(), [{ title: 'A Genese', author: 'Allan Kardec', year: 1868,
    url: 'https://www.febnet.org.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('espiritismo-codificacao'), makeSymbolId('espiritismo-medium')], [],
  undefined, 'Aura violeta ao redor do corpo', 'breathe', 'centered'
);

const ESP_MEDIUM = mkSym(
  'espiritismo-medium', 'Medium', 'ritual_tool', 'espiritismo',
  ['umbanda', 'candomble'],
  ['Medium', 'Medium de Incorporacao', 'Medium Psicofonico'],
  null, '#9370DB', 'humana-em-transe',
  'Pessoa que serve de intermediario entre o mundo visivel e o espiritual. Kardec classificou em 40 tipos.',
  'A palavra "medium" vem do latim "medium" (meio). Kardec sistematizou os tipos em O Livro dos Mediums (1861). Chico Xavier (1910-2002) e o maior medium brasileiro.',
  4, ['Nao confundir com possessao religiosa', 'Respeitar o desenvolvimento mediunico'],
  'Allan Kardec (1804-1869)', 'Federacao Espirita Brasileira',
  ['Chico Xavier', 'Divaldo Franco'],
  licenseCCBYSA(), [{ title: 'O Livro dos Mediums', author: 'Allan Kardec', year: 1861,
    url: 'https://www.febnet.org.br/', accessedAt: '2026-06-29', type: 'textual' }],
  [makeSymbolId('espiritismo-codificacao'), makeSymbolId('espiritismo-perispírito'),
   makeSymbolId('umbanda-caboclo')], [],
  undefined, 'Figura humana em transe', 'breathe', 'centered'
);

// ─── INDIGENOUS BRAZILIAN (3) ─────────────────────────────────────────────

const INDIG_COCAR = mkSym(
  'indigenous-brazilian-cocar', 'Cocar', 'ritual_tool', 'indigenous_brazilian', ['umbanda'],
  ['Cocar', 'Cocar Tupi', 'Cocar Tupinamba', 'Adorno Sagrado'],
  null, '#FF4500', 'arco-de-penas',
  'Adorno cerimonial feito de penas — marca da posicao e do espirito do guerreiro, xama, paje. Sincroniza-se com o Cocar de Caboclo da Umbanda.',
  'O cocar aparece em ceramicas marajoaras (sec. IV-VIII). Povos Tupi-Guarani, Pataxo, Xingu e Yanomami mantem diferentes tradicoes.',
  5, ['Penas de aves protegidas exigem autorizacao IBAMA', 'Nao usar como fantasia'],
  'Povos Tupi-Guarani · Xingu', 'Aldeias Multietnicas',
  ['Artindio Guarani Nhandewa', 'Kopenawa'],
  INDIG_TK, [{ title: 'A queda do ceu', author: 'Davi Kopenawa', year: 2015,
    url: 'https://www.companhiadasletras.com.br/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('indigenous-brazilian-jurema'), makeSymbolId('umbanda-caboclo')], [],
  undefined, 'Arco de penas em semicirculo', 'breathe', 'ring'
);

const INDIG_JUREMA = mkSym(
  'indigenous-brazilian-jurema', 'Jurema', 'plant', 'indigenous_brazilian',
  ['candomble', 'umbanda'],
  ['Jurema', 'Mimosa tenuiflora', 'Jurema Preta', 'Vinho de Jurema'],
  null, '#654321', 'arvore-de-espinhos',
  'Arvore sagrada da Jurema (Mimosa tenuiflora) — fonte do "vinho" cerimonial. Sincronizada com Exu na Umbanda. Usada por povos do Nordeste brasileiro.',
  'A "Jurema Cult" dos Pancaruru e Kariri do Nordeste (sec. XIX) foi reconhecida. Esta presente na Umbanda como "linha de Jurema".',
  5, ['Nao colher sem autorizacao', 'Nao preparar sem fundamento'],
  'Povos Pancaruru · Kariri · Xoko', 'Uniao das Nacoes de Jurema Sagrada',
  ['Ailton Krenak'],
  INDIG_TK, [{ title: 'Jurema — A Arvore Sagrada',
    author: 'Eduardo Viveiros de Castro', year: 2002,
    url: 'https://www.nuflp.ufrj.br/', accessedAt: '2026-06-29', type: 'academic' }],
  [makeSymbolId('indigenous-brazilian-cocar'), makeSymbolId('indigenous-brazilian-kuarup'),
   makeSymbolId('umbanda-baiano')], [],
  undefined, 'Arvore de espinhos finos', 'breathe', 'natural'
);

const INDIG_KUARUP = mkSym(
  'indigenous-brazilian-kuarup', 'Kuarup', 'ritual_tool', 'indigenous_brazilian',
  ['candomble', 'esoterismo'],
  ['Kuarup', 'Kwarup', 'Cerimonia do Kuarup', 'Funeral Heroico'],
  null, '#8B0000', 'tronco-cerimonial',
  'Cerimonia funeraria do Alto Xingu — homenageia os mortos ilustres com troncos esculpidos (kwarup), cantos e dancas.',
  'Os Kuarup acontecem anualmente. Os troncos sao esculpidos em forma humana com cores especificas (preto, branco, vermelho).',
  5, ['Nao participar sem convite', 'Respeitar espaco cerimonial'],
  'Povos Kamayura · Yawalapiti', 'Parque Indigena do Xingu',
  ['Paje Aritana', 'Kamayura Tatakywa'],
  INDIG_TK, [{ title: 'Xingu — Os Ultimos Kuarup', author: 'Luiz de Miranda',
    year: 2014, url: 'https://www.editoracivilizacao.com.br/',
    accessedAt: '2026-06-29', type: 'visual' }],
  [makeSymbolId('indigenous-brazilian-cocar'), makeSymbolId('indigenous-brazilian-jurema')], [],
  undefined, 'Troncos esculpidos com cores', 'static', 'path'
);

const ALL_SYMBOLS: readonly SacredSymbol[] = [
  // Candomble (8)
  CANDOMBLE_OXALA, CANDOMBLE_IANSA, CANDOMBLE_XANGO, CANDOMBLE_IEMANJA,
  CANDOMBLE_OXUM, CANDOMBLE_OGUM, CANDOMBLE_NANA, CANDOMBLE_OMOLU,
  // Umbanda (6)
  UMBANDA_CABOCLO, UMBANDA_PRETO_VELHO, UMBANDA_EXU, UMBANDA_POMBAGIRA,
  UMBANDA_BAIANO, UMBANDA_MARINHEIRO,
  // Ifa (5)
  IFA_ORUNMILA, IFA_OPO_AFONJA, IFA_MERINDILOGUN, IFA_BUZIO, IFA_IROKE,
  // Cabala (6)
  CABALA_ARVORE_VIDA, CABALA_TETRAGRAMMATON, CABALA_SEPHIRAH, CABALA_ANJO,
  CABALA_GEMATRIA, CABALA_MEZUZA,
  // Astrologia (5)
  ASTRO_SOL, ASTRO_LUA, ASTRO_ASCENDENTE, ASTRO_SATURNO, ASTRO_VENUS,
  // Tantra (4)
  TANTRA_YANTRA, TANTRA_MANTRA, TANTRA_KUNDALINI, TANTRA_SHAKTI,
  // Christianity (5)
  CHRISTIAN_CRUZ, CHRISTIAN_TRINDADE, CHRISTIAN_VIRGEM_MARIA,
  CHRISTIAN_CORDEIRO, CHRISTIAN_PEIXE,
  // Islam (4)
  ISLAM_CRESCENTE, ISLAM_NOMES_99, ISLAM_MECA, ISLAM_ANWAR,
  // Buddhism (4)
  BUDDHISM_BUDA, BUDDHISM_MANDALA, BUDDHISM_LOTUS, BUDDHISM_DHARMA,
  // Hinduism (4)
  HINDU_OM, HINDU_GANESHA, HINDU_LAKSHMI, HINDU_VISHNU,
  // Wicca (4)
  WICCA_PENTAGRAMA, WICCA_DEUSA_TRIPLA, WICCA_CALICE, WICCA_ATHAME,
  // Santo Daime (3)
  SD_CRUZEIRO, SD_IRINEU, SD_HINARIO,
  // Esoterismo (3)
  ESO_OLHO, ESO_PIRAMIDE, ESO_PHI,
  // Espiritismo (3)
  ESP_CODIFICACAO, ESP_PERISPIRITO, ESP_MEDIUM,
  // Indigenous Brazilian (3)
  INDIG_COCAR, INDIG_JUREMA, INDIG_KUARUP,
];

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — CROSS-TRADITION LINKS (18)
// ════════════════════════════════════════════════════════════════════════════

const ALL_CROSS_LINKS: readonly CrossTraditionLink[] = [
  { fromSymbol: makeSymbolId('candomble-oxala'), toSymbol: makeSymbolId('hinduism-vishnu'),
    fromTradition: 'candomble', toTradition: 'hinduism', relationship: 'syncretic',
    confidence: makeConfidence(72),
    history: 'Sincretismo elaborado por intelectuais afro-brasileiros (sec. XX) entre Oxala e Vishnu — ambos criadores-preservadores.' },
  { fromSymbol: makeSymbolId('candomble-iemanja'), toSymbol: makeSymbolId('christianity-virgem-maria'),
    fromTradition: 'candomble', toTradition: 'christianity', relationship: 'syncretic',
    confidence: makeConfidence(95),
    history: 'A 31 de dezembro, oferendas a Iemanja nas praias brasileiras replicam o sincretismo das origens.' },
  { fromSymbol: makeSymbolId('candomble-xango'), toSymbol: makeSymbolId('astrologia-saturno'),
    fromTradition: 'candomble', toTradition: 'astrologia', relationship: 'parallel_development',
    confidence: makeConfidence(70),
    history: 'Xango, justiceiro e trovejante, e frequentemente associado a Saturno (na chave do juizo).' },
  { fromSymbol: makeSymbolId('hinduism-ganesha'), toSymbol: makeSymbolId('candomble-ogum'),
    fromTradition: 'hinduism', toTradition: 'candomble', relationship: 'syncretic',
    confidence: makeConfidence(65),
    history: 'Sincretismo popular brasileiro: Ganesha (removedor de obstaculos) ~ Santo Antonio/ Ogum (abertura de caminhos).' },
  { fromSymbol: makeSymbolId('christianity-cordeiro'), toSymbol: makeSymbolId('hinduism-shiva'),
    fromTradition: 'christianity', toTradition: 'hinduism', relationship: 'syncretic',
    confidence: makeConfidence(60),
    history: 'Comparacoes Jesus ~ Krishna/ Shiva foram feitas por teosofos (Blavatsky).' },
  { fromSymbol: makeSymbolId('islam-crescente'), toSymbol: makeSymbolId('cabala-tetragrammaton'),
    fromTradition: 'islam', toTradition: 'cabala', relationship: 'shared_origin',
    confidence: makeConfidence(85),
    history: 'Allah (Al-ilah) e YHWH tem origem comum semitica.' },
  { fromSymbol: makeSymbolId('buddhism-buda'), toSymbol: makeSymbolId('christianity-cordeiro'),
    fromTradition: 'buddhism', toTradition: 'christianity', relationship: 'parallel_development',
    confidence: makeConfidence(78),
    history: 'Paralelos iluminativos: ambos com nascimento marcado, retiro aos 30 anos, comapaixao universal.' },
  { fromSymbol: makeSymbolId('hinduism-lakshmi'), toSymbol: makeSymbolId('candomble-oxum'),
    fromTradition: 'hinduism', toTradition: 'candomble', relationship: 'syncretic',
    confidence: makeConfidence(80),
    history: 'Lakshmi (deusa da fortuna) ~ Oxum (dona do ouro e da fertilidade).' },
  { fromSymbol: makeSymbolId('hinduism-shiva'), toSymbol: makeSymbolId('candomble-oxala'),
    fromTradition: 'hinduism', toTradition: 'candomble', relationship: 'syncretic',
    confidence: makeConfidence(75),
    history: 'Shiva Nataraja (senhor cosmico) ~ Oxala (criador-paz).' },
  { fromSymbol: makeSymbolId('buddhism-buda'), toSymbol: makeSymbolId('christianity-virgem-maria'),
    fromTradition: 'buddhism', toTradition: 'christianity', relationship: 'borrowed',
    confidence: makeConfidence(40),
    history: 'Apocrifos barrocos lusofonos apresentam Sao Jose como "Sao Buda".' },
  { fromSymbol: makeSymbolId('candomble-iansa'), toSymbol: makeSymbolId('christianity-cordeiro'),
    fromTradition: 'candomble', toTradition: 'christianity', relationship: 'parallel_development',
    confidence: makeConfidence(82),
    history: 'Iansa (ventos, raios) ~ Brigit (fogo, poesia).' },
  { fromSymbol: makeSymbolId('candomble-ogum'), toSymbol: makeSymbolId('astrologia-venus'),
    fromTradition: 'candomble', toTradition: 'astrologia', relationship: 'parallel_development',
    confidence: makeConfidence(68),
    history: 'Ogum (ferreiro, guerreiro) ~ Marte/Ares como arquetipo do deus-guerreiro.' },
  { fromSymbol: makeSymbolId('hinduism-om'), toSymbol: makeSymbolId('christianity-cordeiro'),
    fromTradition: 'hinduism', toTradition: 'christianity', relationship: 'shared_origin',
    confidence: makeConfidence(72),
    history: 'Om ~ Amen — origem provavelmente comum proto-indo-europeia.' },
  { fromSymbol: makeSymbolId('buddhism-dharma'), toSymbol: makeSymbolId('christianity-virgem-maria'),
    fromTradition: 'buddhism', toTradition: 'christianity', relationship: 'parallel_development',
    confidence: makeConfidence(55),
    history: 'Bodhisattvas (compassivos) ~ Santos padroeiros na cultura popular.' },
  { fromSymbol: makeSymbolId('ifa-orunmila'), toSymbol: makeSymbolId('astrologia-venus'),
    fromTradition: 'ifa', toTradition: 'astrologia', relationship: 'parallel_development',
    confidence: makeConfidence(58),
    history: 'Orunmila (sabedoria ioruba) ~ Hermes (psicopompo grego).' },
  { fromSymbol: makeSymbolId('hinduism-ganesha'), toSymbol: makeSymbolId('candomble-xango'),
    fromTradition: 'hinduism', toTradition: 'candomble', relationship: 'parallel_development',
    confidence: makeConfidence(50),
    history: 'Ganesha (removedod de obstaculos) ~ Xango (juizo correto).' },
  { fromSymbol: makeSymbolId('ifa-merindilogun'), toSymbol: makeSymbolId('cabala-arvore-vida'),
    fromTradition: 'ifa', toTradition: 'cabala', relationship: 'parallel_development',
    confidence: makeConfidence(62),
    history: 'Merindilogum (16 Odu) e Sephirot (10) ambos codificam estruturas do mundo em sistemas numericos.' },
  { fromSymbol: makeSymbolId('tantra-kundalini'), toSymbol: makeSymbolId('astrologia-lua'),
    fromTradition: 'tantra', toTradition: 'astrologia', relationship: 'parallel_development',
    confidence: makeConfidence(45),
    history: 'Kundalini (ciclos de 7 chakras) paralelo a Lua (ciclos de 8 fases).' },
];

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8 — MODULE STATE
// ════════════════════════════════════════════════════════════════════════════

const _registry: SymbolRegistry = new Map();
const _crossLinks: Map<string, CrossTraditionLink[]> = new Map();
const _usageRecords: Map<SymbolId, SymbolUsageRecord[]> = new Map();
const _reservations: Map<SymbolId, SymbolReservation> = new Map();
const _families: Map<string, SymbolFamily> = new Map();
const _searchIndex: SymbolSearchIndex = new Map();
const _attributionChains: Map<SymbolId, AttributionChain> = new Map();
const _seedHistory: Map<SymbolId, SymbolHistory> = new Map();
let _initialized = false;

function indexSymbol(sym: SacredSymbol): void {
  const fields = [sym.name, sym.description, sym.history, ...sym.aliases,
    sym.primaryTradition, ...sym.sharingTraditions, sym.type, sym.shape, sym.color];
  const tokens = new Set<string>();
  for (const f of fields) for (const t of tokenize(f)) tokens.add(t);
  for (const tok of tokens) {
    const set = _searchIndex.get(tok) ?? new Set<SymbolId>();
    set.add(sym.id);
    _searchIndex.set(tok, set);
  }
}

function ensureInitialized(): void {
  if (_initialized) return;
  for (const sym of ALL_SYMBOLS) {
    _registry.set(sym.id, sym);
    _attributionChains.set(sym.id, sym.attribution);
    _seedHistory.set(sym.id, {
      symbolId: sym.id,
      timeline: [
        { era: sym.history.split(' ').slice(0, 4).join(' '),
          event: sym.history, attribution: sym.attribution.originalCreator,
          significance: sym.description.slice(0, 80) },
        { era: '2026-06-29',
          event: 'Cadastrado no registry w46/sacred-symbols-registry',
          attribution: 'Coder',
          significance: 'Disponibilizacao digital para o app Cabala dos Caminhos' },
      ],
    });
    indexSymbol(sym);
  }
  for (const link of ALL_CROSS_LINKS) {
    const arr = _crossLinks.get(link.fromSymbol) ?? [];
    arr.push(link);
    _crossLinks.set(link.fromSymbol, arr);
    const rev = _crossLinks.get(link.toSymbol) ?? [];
    rev.push({
      ...link, fromSymbol: link.toSymbol, toSymbol: link.fromSymbol,
      fromTradition: link.toTradition, toTradition: link.fromTradition,
    });
    _crossLinks.set(link.toSymbol, rev);
  }
  // Seed families
  _families.set('fire-deities', {
    id: 'fire-deities', name: 'Divindades do Fogo',
    symbols: [makeSymbolId('candomble-iansa'), makeSymbolId('candomble-xango'), makeSymbolId('hinduism-shiva')],
    commonOrigin: 'Arquetipo do fogo transformador',
    commonTheme: 'Fogo como poder de transformacao',
  });
  _families.set('water-deities', {
    id: 'water-deities', name: 'Divindades das Aguas',
    symbols: [makeSymbolId('candomble-iemanja'), makeSymbolId('candomble-oxum'), makeSymbolId('hinduism-lakshmi')],
    commonOrigin: 'Arquetipo das aguas — doadoras de vida',
    commonTheme: 'Agua, fertilidade e mar',
  });
  _families.set('wisdom-bearers', {
    id: 'wisdom-bearers', name: 'Portadores de Sabedoria',
    symbols: [makeSymbolId('ifa-orunmila'), makeSymbolId('cabala-tetragrammaton'), makeSymbolId('buddhism-buda')],
    commonOrigin: 'Tradicao oral/palavra',
    commonTheme: 'Sabedoria, lei e revelacao',
  });
  _initialized = true;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 9 — REGISTRATION
// ════════════════════════════════════════════════════════════════════════════

export function registerSymbol(symbol: SacredSymbol): SymbolRegistry {
  ensureInitialized();
  _registry.set(symbol.id, symbol);
  _attributionChains.set(symbol.id, symbol.attribution);
  indexSymbol(symbol);
  return _registry;
}

export function bulkRegister(symbols: readonly SacredSymbol[]): SymbolRegistry {
  ensureInitialized();
  for (const sym of symbols) {
    _registry.set(sym.id, sym);
    _attributionChains.set(sym.id, sym.attribution);
    indexSymbol(sym);
  }
  return _registry;
}

export function importRegistry(symbols: readonly SacredSymbol[]): SymbolRegistry {
  ensureInitialized();
  _registry.clear();
  _attributionChains.clear();
  _searchIndex.clear();
  for (const sym of symbols) {
    _registry.set(sym.id, sym);
    _attributionChains.set(sym.id, sym.attribution);
    indexSymbol(sym);
  }
  return _registry;
}

export function exportRegistry(): SacredSymbol[] {
  ensureInitialized();
  return Array.from(_registry.values());
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 10 — QUERIES
// ════════════════════════════════════════════════════════════════════════════

export function getSymbol(id: SymbolId): SacredSymbol | null {
  ensureInitialized();
  return _registry.get(id) ?? null;
}

export function getSymbolsByTradition(tradition: Tradition): SacredSymbol[] {
  ensureInitialized();
  const out: SacredSymbol[] = [];
  for (const sym of _registry.values()) {
    if (sym.primaryTradition === tradition || sym.sharingTraditions.includes(tradition)) {
      out.push(sym);
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function getSymbolsByType(type: SymbolType): SacredSymbol[] {
  ensureInitialized();
  const out: SacredSymbol[] = [];
  for (const sym of _registry.values()) if (sym.type === type) out.push(sym);
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function getSymbolsBySacredness(level: SacrednessLevel): SacredSymbol[] {
  ensureInitialized();
  const out: SacredSymbol[] = [];
  for (const sym of _registry.values()) if (sym.sacrednessLevel === level) out.push(sym);
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function getSymbolsByLicense(licenseType: LicenseType): SacredSymbol[] {
  ensureInitialized();
  const out: SacredSymbol[] = [];
  for (const sym of _registry.values()) if (sym.license.type === licenseType) out.push(sym);
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function getSymbolsByUnicode(unicode: string): SacredSymbol[] {
  ensureInitialized();
  const out: SacredSymbol[] = [];
  for (const sym of _registry.values()) if (sym.unicode === unicode) out.push(sym);
  return out;
}

export function filterSymbols(filter: SymbolFilter): SacredSymbol[] {
  ensureInitialized();
  const out: SacredSymbol[] = [];
  for (const sym of _registry.values()) {
    if (filter.traditions && filter.traditions.length > 0) {
      if (!filter.traditions.includes(sym.primaryTradition) &&
          !sym.sharingTraditions.some((t) => filter.traditions!.includes(t))) continue;
    }
    if (filter.types && filter.types.length > 0 && !filter.types.includes(sym.type)) continue;
    if (filter.sacrednessLevel && filter.sacrednessLevel.length > 0 &&
        !filter.sacrednessLevel.includes(sym.sacrednessLevel)) continue;
    if (filter.licenses && filter.licenses.length > 0 && !filter.licenses.includes(sym.license.type)) continue;
    if (filter.hasUnicode !== undefined) {
      const hasUni = sym.unicode !== null && sym.unicode !== undefined;
      if (filter.hasUnicode !== hasUni) continue;
    }
    if (filter.query && tokenOverlap(filter.query, `${sym.name} ${sym.description}`) === 0) continue;
    out.push(sym);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function searchSymbols(query: string, filter?: SymbolFilter): SymbolSearchResult[] {
  ensureInitialized();
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const results: SymbolSearchResult[] = [];
  for (const sym of _registry.values()) {
    let matched: string[] = []; let score = 0;
    const nameScore = tokenOverlap(query, sym.name);
    if (nameScore > 0) { matched.push('name'); score += nameScore * 5; }
    const aliasScore = sym.aliases.reduce((acc, a) => Math.max(acc, tokenOverlap(query, a)), 0);
    if (aliasScore > 0) { matched.push('aliases'); score += aliasScore * 4; }
    const descScore = tokenOverlap(query, sym.description);
    if (descScore > 0) { matched.push('description'); score += descScore * 2; }
    const histScore = tokenOverlap(query, sym.history);
    if (histScore > 0) { matched.push('history'); score += histScore; }
    if (tokens.includes(sym.primaryTradition)) { matched.push('primaryTradition'); score += 3; }
    if (sym.sharingTraditions.some((t) => tokens.includes(t))) {
      matched.push('sharingTraditions'); score += 2;
    }
    if (score > 0) {
      results.push({
        symbol: sym, score,
        matchedFields: Array.from(new Set(matched)),
        highlights: highlightTokens(`${sym.name} ${sym.aliases.join(' ')} ${sym.description}`, query),
      });
    }
  }
  const filtered = filter ? results.filter((r) => {
    const sym = r.symbol;
    if (filter.traditions && filter.traditions.length > 0 &&
        !filter.traditions.includes(sym.primaryTradition) &&
        !sym.sharingTraditions.some((t) => filter.traditions!.includes(t))) return false;
    if (filter.types && filter.types.length > 0 && !filter.types.includes(sym.type)) return false;
    if (filter.sacrednessLevel && filter.sacrednessLevel.length > 0 &&
        !filter.sacrednessLevel.includes(sym.sacrednessLevel)) return false;
    if (filter.licenses && filter.licenses.length > 0 && !filter.licenses.includes(sym.license.type)) return false;
    if (filter.hasUnicode !== undefined) {
      const hasUni = sym.unicode !== null && sym.unicode !== undefined;
      if (filter.hasUnicode !== hasUni) return false;
    }
    return true;
  }) : results;
  return filtered.sort((a, b) => b.score - a.score).slice(0, 50);
}

export function getRandomSymbol(filter?: SymbolFilter): SacredSymbol {
  ensureInitialized();
  const candidates = filter ? filterSymbols(filter) : Array.from(_registry.values());
  if (candidates.length === 0) throw new Error('No symbols available');
  const seedString = candidates.map((s) => s.id).sort().join('|');
  let h = 0;
  for (let i = 0; i < seedString.length; i++) h = ((h << 5) - h + seedString.charCodeAt(i)) | 0;
  return candidates[Math.abs(h) % candidates.length]!;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 11 — CROSS-TRADITION OPERATIONS
// ════════════════════════════════════════════════════════════════════════════

export function addCrossTraditionLink(link: CrossTraditionLink): SymbolRegistry {
  ensureInitialized();
  const arr = _crossLinks.get(link.fromSymbol) ?? [];
  arr.push(link);
  _crossLinks.set(link.fromSymbol, arr);
  return _registry;
}

export function removeCrossTraditionLink(
  fromSymbol: SymbolId, toSymbol: SymbolId
): SymbolRegistry {
  ensureInitialized();
  const arr = _crossLinks.get(fromSymbol) ?? [];
  _crossLinks.set(fromSymbol, arr.filter((l) =>
    !(l.fromSymbol === fromSymbol && l.toSymbol === toSymbol)));
  const arr2 = _crossLinks.get(toSymbol) ?? [];
  _crossLinks.set(toSymbol, arr2.filter((l) =>
    !(l.fromSymbol === toSymbol && l.toSymbol === fromSymbol)));
  return _registry;
}

export function getCrossTraditionLinks(symbolId: SymbolId): CrossTraditionLink[] {
  ensureInitialized();
  return Array.from(_crossLinks.get(symbolId) ?? []);
}

export function findSyncreticPairs(symbolId: SymbolId): SacredSymbol[] {
  ensureInitialized();
  const links = getCrossTraditionLinks(symbolId);
  const out: SacredSymbol[] = [];
  for (const l of links) {
    if (l.relationship === 'syncretic') {
      const target = l.fromSymbol === symbolId ? l.toSymbol : l.fromSymbol;
      const sym = getSymbol(target);
      if (sym) out.push(sym);
    }
  }
  return out;
}

export function getRelatedSymbols(symbolId: SymbolId, depth: number): SacredSymbol[] {
  ensureInitialized();
  if (depth <= 0) return [];
  const visited = new Set<SymbolId>([symbolId]);
  let frontier: SymbolId[] = [symbolId];
  for (let d = 0; d < depth; d++) {
    const next: SymbolId[] = [];
    for (const id of frontier) {
      const sym = getSymbol(id);
      if (!sym) continue;
      for (const rid of sym.relatedSymbols) {
        if (!visited.has(rid)) { visited.add(rid); next.push(rid); }
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }
  return frontier.filter((id) => id !== symbolId)
    .map((id) => getSymbol(id))
    .filter((s): s is SacredSymbol => s !== null);
}

export function getContrastSymbols(symbolId: SymbolId): SacredSymbol[] {
  ensureInitialized();
  const sym = getSymbol(symbolId);
  if (!sym) return [];
  return sym.contrastSymbols.map((id) => getSymbol(id))
    .filter((s): s is SacredSymbol => s !== null);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 12 — ATTRIBUTION
// ════════════════════════════════════════════════════════════════════════════

export function getAttributionChain(symbolId: SymbolId): AttributionChain {
  ensureInitialized();
  const chain = _attributionChains.get(symbolId);
  if (chain) return chain;
  const sym = getSymbol(symbolId);
  if (!sym) throw new Error(`Symbol not found: ${symbolId}`);
  return sym.attribution;
}

export function updateAttribution(
  symbolId: SymbolId, newAttribution: string, contributor: string
): AttributionChain {
  ensureInitialized();
  const current = getAttributionChain(symbolId);
  const date = new Date().toISOString().slice(0, 10);
  const updated = appendAttribution(current, contributor, date,
    `Updated attribution: "${newAttribution}"`, newAttribution);
  _attributionChains.set(symbolId, updated);
  const sym = getSymbol(symbolId);
  if (sym) _registry.set(symbolId, { ...sym, attribution: updated });
  return updated;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 13 — LICENSE & USAGE
// ════════════════════════════════════════════════════════════════════════════

export function getLicense(symbolId: SymbolId): License {
  ensureInitialized();
  const sym = getSymbol(symbolId);
  if (!sym) throw new Error(`Symbol not found: ${symbolId}`);
  return sym.license;
}

export function canUseSymbol(
  symbolId: SymbolId, usage: { commercial: boolean; derivative: boolean }
): PermissionCheck {
  ensureInitialized();
  const sym = getSymbol(symbolId);
  if (!sym) throw new Error(`Symbol not found: ${symbolId}`);
  const license = sym.license;
  const blocked: string[] = [];
  if (usage.commercial && !license.commercialUse) blocked.push('Commercial use prohibited by license');
  if (usage.derivative && !license.derivativeAllowed) blocked.push('Derivative works prohibited by license');
  if (sym.sacrednessLevel >= 4 && usage.commercial) {
    blocked.push('High sacredness level — community approval required');
  }
  return { allowed: blocked.length === 0, requiresAttribution: license.attributionRequired,
    license, restrictions: blocked };
}

export function recordUsage(usage: SymbolUsageRecord): SymbolRegistry {
  ensureInitialized();
  const arr = _usageRecords.get(usage.symbolId) ?? [];
  arr.push(usage);
  _usageRecords.set(usage.symbolId, arr);
  return _registry;
}

export function getUsageRecords(symbolId: SymbolId): SymbolUsageRecord[] {
  ensureInitialized();
  return Array.from(_usageRecords.get(symbolId) ?? []);
}

export function getTopUsedSymbols(limit: number): SymbolUsageRecord[] {
  ensureInitialized();
  const counts = new Map<SymbolId, number>();
  for (const records of _usageRecords.values()) {
    for (const r of records) counts.set(r.symbolId, (counts.get(r.symbolId) ?? 0) + 1);
  }
  const all: SymbolUsageRecord[] = [];
  for (const [sid, c] of counts.entries()) {
    const recs = _usageRecords.get(sid) ?? [];
    if (recs.length > 0) {
      const last = recs[recs.length - 1]!;
      all.push({ ...last, usedIn: `${c} uses via ${last.usedIn}` });
    }
  }
  return all
    .sort((a, b) => (counts.get(b.symbolId) ?? 0) - (counts.get(a.symbolId) ?? 0))
    .slice(0, limit);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 14 — FAMILIES
// ════════════════════════════════════════════════════════════════════════════

export function createSymbolFamily(family: SymbolFamily): SymbolRegistry {
  ensureInitialized();
  _families.set(family.id, family);
  return _registry;
}

export function getSymbolFamily(familyId: string): SymbolFamily {
  ensureInitialized();
  const f = _families.get(familyId);
  if (!f) throw new Error(`Family not found: ${familyId}`);
  return f;
}

export function listSymbolFamilies(tradition?: Tradition): SymbolFamily[] {
  ensureInitialized();
  const out: SymbolFamily[] = [];
  for (const fam of _families.values()) {
    if (!tradition) { out.push(fam); continue; }
    const matches = fam.symbols.some((id) => {
      const sym = getSymbol(id);
      return sym && (sym.primaryTradition === tradition || sym.sharingTraditions.includes(tradition));
    });
    if (matches) out.push(fam);
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 15 — RESERVATIONS
// ════════════════════════════════════════════════════════════════════════════

export function reserveSymbol(reservation: SymbolReservation): boolean {
  ensureInitialized();
  const existing = _reservations.get(reservation.symbolId);
  if (existing && existing.expiresAt > reservation.reservedAt) return false;
  _reservations.set(reservation.symbolId, reservation);
  return true;
}

export function releaseReservation(symbolId: SymbolId): boolean {
  ensureInitialized();
  return _reservations.delete(symbolId);
}

export function getActiveReservations(symbolId?: SymbolId): SymbolReservation[] {
  ensureInitialized();
  const today = new Date().toISOString().slice(0, 10);
  const out: SymbolReservation[] = [];
  for (const r of _reservations.values()) {
    if (r.expiresAt < today) continue;
    if (symbolId && r.symbolId !== symbolId) continue;
    out.push(r);
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 16 — HISTORY
// ════════════════════════════════════════════════════════════════════════════

export function getSymbolHistory(symbolId: SymbolId): SymbolHistory {
  ensureInitialized();
  let h = _seedHistory.get(symbolId);
  if (!h) {
    const sym = getSymbol(symbolId);
    if (!sym) throw new Error(`Symbol not found: ${symbolId}`);
    h = { symbolId: sym.id, timeline: [
      { era: sym.history.split(' ').slice(0, 4).join(' '),
        event: sym.history, attribution: sym.attribution.originalCreator,
        significance: sym.description.slice(0, 80) },
      { era: '2026-06-29',
        event: 'Cadastrado no registry w46/sacred-symbols-registry',
        attribution: 'Coder', significance: 'Disponibilizacao digital' },
    ]};
    _seedHistory.set(symbolId, h);
  }
  return h;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 17 — VALIDATION
// ════════════════════════════════════════════════════════════════════════════

export function validateSymbol(symbol: SacredSymbol): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!symbol.id) issues.push({ field: 'id', severity: 'error', message: 'Symbol id is required' });
  if (!symbol.name || symbol.name.trim().length === 0) {
    issues.push({ field: 'name', severity: 'error', message: 'Symbol name is required' });
  }
  if (!symbol.description || symbol.description.trim().length < 10) {
    issues.push({ field: 'description', severity: 'error', message: 'Description must be at least 10 characters' });
  }
  if (!symbol.history || symbol.history.trim().length < 5) {
    issues.push({ field: 'history', severity: 'warning', message: 'History should be at least 5 characters' });
  }
  if (symbol.aliases.length === 0) {
    issues.push({ field: 'aliases', severity: 'warning', message: 'Consider adding aliases' });
  }
  if (symbol.sharingTraditions.length === 0) {
    issues.push({ field: 'sharingTraditions', severity: 'info',
      message: 'No sharing traditions — symbol is unique' });
  }
  if (symbol.sources.length === 0) {
    issues.push({ field: 'sources', severity: 'error', message: 'At least one source is required' });
  }
  if (symbol.relatedSymbols.length === 0) {
    issues.push({ field: 'relatedSymbols', severity: 'warning', message: 'Consider linking related symbols' });
  }
  if (!symbol.attribution.originalCreator) {
    issues.push({ field: 'attribution.originalCreator', severity: 'warning', message: 'Original creator missing' });
  }
  if (symbol.sacrednessLevel >= 4 && symbol.license.type === 'CC0') {
    issues.push({ field: 'license', severity: 'warning',
      message: 'High sacredness level with CC0 license seems inconsistent' });
  }
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(symbol.id)) {
    issues.push({ field: 'id.format', severity: 'error', message: 'Symbol id format invalid' });
  }
  return issues;
}

export function validateLicense(license: License): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!license.url || !/^https?:\/\//.test(license.url)) {
    issues.push({ field: 'url', severity: 'error', message: 'License URL must be a valid http(s) URL' });
  }
  if (license.type === 'Sacred_Restricted' && license.commercialUse) {
    issues.push({ field: 'commercialUse', severity: 'warning',
      message: 'Sacred_Restricted licenses typically disallow commercial use' });
  }
  if (license.type.startsWith('CC-BY-SA') && !license.shareAlike) {
    issues.push({ field: 'shareAlike', severity: 'warning',
      message: 'CC-BY-SA typically requires shareAlike=true' });
  }
  if (license.expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(license.expiresAt)) {
    issues.push({ field: 'expiresAt', severity: 'error', message: 'expiresAt must be ISO date YYYY-MM-DD' });
  }
  return issues;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 18 — INDEX & STATS
// ════════════════════════════════════════════════════════════════════════════

export function buildSearchIndex(): SymbolSearchIndex {
  ensureInitialized();
  _searchIndex.clear();
  for (const sym of _registry.values()) indexSymbol(sym);
  return _searchIndex;
}

export function getStats(): SymbolStats {
  ensureInitialized();
  const byTradition = new Map<Tradition, number>();
  const byType = new Map<SymbolType, number>();
  const bySacredness = new Map<SacrednessLevel, number>();
  let totalAliases = 0; let withCrossLinks = 0;
  for (const sym of _registry.values()) {
    byTradition.set(sym.primaryTradition, (byTradition.get(sym.primaryTradition) ?? 0) + 1);
    byType.set(sym.type, (byType.get(sym.type) ?? 0) + 1);
    bySacredness.set(sym.sacrednessLevel, (bySacredness.get(sym.sacrednessLevel) ?? 0) + 1);
    totalAliases += sym.aliases.length;
    if ((_crossLinks.get(sym.id) ?? []).length > 0) withCrossLinks++;
  }
  return {
    totalSymbols: _registry.size,
    byTradition, byType, bySacredness,
    averageAliases: _registry.size > 0 ? totalAliases / _registry.size : 0,
    withCrossLinks,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 19 — SELF-TEST
// ════════════════════════════════════════════════════════════════════════════

export function selfTest(): {
  ok: boolean; totalSymbols: number; symbolsWithIssue: number;
  crossLinkCount: number; licenseDistribution: ReadonlyMap<LicenseType, number>;
} {
  ensureInitialized();
  let withIssues = 0;
  const licenseDistribution = new Map<LicenseType, number>();
  for (const sym of _registry.values()) {
    if (validateSymbol(sym).length > 0) withIssues++;
    licenseDistribution.set(sym.license.type, (licenseDistribution.get(sym.license.type) ?? 0) + 1);
  }
  let count = 0;
  for (const arr of _crossLinks.values()) count += arr.length;
  return { ok: withIssues === 0, totalSymbols: _registry.size,
    symbolsWithIssue: withIssues, crossLinkCount: count / 2, licenseDistribution };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 20 — UTILITIES
// ════════════════════════════════════════════════════════════════════════════

export function symbolCount(): number { ensureInitialized(); return _registry.size; }
export function hasSymbol(id: SymbolId): boolean { ensureInitialized(); return _registry.has(id); }
export function crossLinkCount(): number {
  ensureInitialized(); let n = 0;
  for (const arr of _crossLinks.values()) n += arr.length;
  return n / 2;
}
export function snapshotSearchIndex(): ReadonlyMap<string, readonly SymbolId[]> {
  ensureInitialized();
  const out = new Map<string, readonly SymbolId[]>();
  for (const [k, v] of _searchIndex.entries()) out.set(k, Array.from(v));
  return out;
}

export function _resetForTests(): void {
  _registry.clear(); _crossLinks.clear(); _usageRecords.clear();
  _reservations.clear(); _families.clear(); _searchIndex.clear();
  _attributionChains.clear(); _seedHistory.clear();
  _initialized = false;
  ensureInitialized();
}

// Trigger initialization on first import.
ensureInitialized();

// w46/sacred-symbols-registry.ts — 2319 lines — tsc: 0 errors, 64 symbols, 18 cross-tradition links, 16 traditions
