// ============================================================================
// SACRED SYMBOLS REGISTRY — CABALA DOS CAMINHOS (Wave 48 / w48)
// ============================================================================
//
// Catálogo curado (imagem apenas como METADADO — sem bytes binários aqui) de
// símbolos sagrados de múltiplas tradições religiosas e espirituais, com tags
// de tradição, contexto de uso, restrições culturais e diretrizes de uso
// respeitoso.
//
// Complementa e referencia:
//   - w45/tradition-cross-references (correlação entre tradições)
//   - w45/admin-moderation-queue (fila de moderação)
//
// Princípios:
//   - SEMPRE atribuir fonte/origem quando conhecida
//   - SEMPRE respeitar restrições (sagrado, iniciação, comunidade-controlada)
//   - SEMPRE sinalizar símbolos frequentemente apropriados
//   - NUNCA renderizar símbolos de iniciação para não-iniciados
//   - NUNCA usar símbolos sagrados em marketing sem permissão
//
// LGPD Art. 18: coleções pessoais são exportáveis/deletáveis pelo titular.
// ============================================================================

// ============================================================================
// TIPOS PÚBLICOS
// ============================================================================

/**
 * Tradição religiosa/espiritual da qual o símbolo provém.
 * - `syncretic` indica fusão entre tradições (ex.: Hamsa).
 * - `indigenous` refere-se a povos tradicionais brasileiros (Huni Kuin,
 *   Yawanawá, Krahô etc.).
 */
export type SymbolTradition =
  | 'christianity'
  | 'islam'
  | 'judaism'
  | 'buddhism'
  | 'hinduism'
  | 'candomble'
  | 'ifa'
  | 'umbanda'
  | 'taoism'
  | 'indigenous'
  | 'syncretic'
  | 'spiritualist';

/** Sub-tradição específica dentro da tradição principal. */
export type SymbolSubTradition =
  | 'catholic'
  | 'orthodox'
  | 'protestant'
  | 'sunni'
  | 'shia'
  | 'sufi'
  | 'ashkenazi'
  | 'sephardic'
  | 'theravada'
  | 'mahayana'
  | 'vajrayana'
  | 'shaivite'
  | 'vaishnavite'
  | 'shakte'
  | 'ketu'
  | 'nagô'
  | 'jeje'
  | 'angola'
  | 'yawanawa'
  | 'huni-kuin'
  | 'kraho'
  | 'guarani'
  | 'umbanda-caboclo'
  | 'umbanda-preto-velho'
  | 'none';

/** Forma visual alternativa reconhecida do mesmo símbolo. */
export interface SymbolVariant {
  /** Identificador kebab-case único da variante. */
  readonly id: string;
  /** Nome descritivo da variante em português. */
  readonly name: string;
  /** Descrição técnica (proporção, traço, materiais). */
  readonly description: string;
  /** Quando esta variante é a preferida vs. proibida. */
  readonly preferredContexts: readonly string[];
}

/** Tipo de contexto onde o símbolo pode/deve aparecer. */
export type SymbolContextType =
  | 'prayer'
  | 'ritual'
  | 'meditation'
  | 'architecture'
  | 'jewelry'
  | 'tattoo'
  | 'digital-art'
  | 'illustration'
  | 'clothing'
  | 'ceramic'
  | 'calligraphy'
  | 'liturgy'
  | 'education'
  | 'commemoration'
  | 'initiation';

/** Restrição cultural/legal sobre o uso do símbolo. */
export type SymbolRestriction =
  | 'sacred-only'
  | 'no-commercial'
  | 'permission-required'
  | 'initiation-only'
  | 'community-controlled'
  | 'no-tattoo'
  | 'no-modification'
  | 'attribution-required'
  | 'context-specific'
  | 'age-restricted';

/** Forma/caso de uso proposto pela pessoa que deseja usar o símbolo. */
export type SymbolUseCase =
  | 'meditation-app'
  | 'community-post'
  | 'educational-content'
  | 'commercial-product'
  | 'tattoo-design'
  | 'public-art'
  | 'marketing'
  | 'personal-practice'
  | 'liturgical-use'
  | 'academic-publication';

/** Origem histórica e crédito cultural do símbolo. */
export interface SymbolAttribution {
  /** Nome da fonte primária (livro, tradição oral, museu, povo, seita). */
  readonly source: string;
  /** URL opcional para referência externa. */
  readonly sourceUrl?: string;
  /** Ano/período aproximado da primeira documentação. */
  readonly originPeriod?: string;
  /** Como creditar em uso público (frase pronta). */
  readonly creditLine: string;
  /** Notas adicionais de proveniência. */
  readonly provenanceNotes?: string;
}

/** Escala de sensibilidade cultural 1-5.
 *  - 1: universalmente reconhecido, sem controvérsia (ex.: Lotus decorativo).
 *  - 2: amplamente conhecido, baixa controvérsia.
 *  - 3: significado profundo, requer contexto.
 *  - 4: usado em rituais específicos, cuidado recomendado.
 *  - 5: estritamente sagrado/iniciação, comunidade-controlada.
 */
export type CulturalSensitivityLevel = 1 | 2 | 3 | 4 | 5;

/** Entrada completa do registro para um símbolo. */
export interface SacredSymbol {
  /** Identificador único kebab-case. */
  readonly id: string;
  /** Nome principal (canônico) em português. */
  readonly name: string;
  /** Nomes alternativos / apelidos. */
  readonly aliases: readonly string[];
  /** Tradição principal. */
  readonly tradition: SymbolTradition;
  /** Sub-tradição (ou 'none'). */
  readonly subTradition: SymbolSubTradition;
  /** Descrição factual (>= 50 chars), objetiva e sem juízo. */
  readonly description: string;
  /** Aspectos de significado (frases curtas, pt-BR). */
  readonly meanings: readonly string[];
  /** Contextos em que o símbolo aparece legitimamente. */
  readonly contexts: readonly SymbolContextType[];
  /** Restrições aplicáveis. */
  readonly restrictions: readonly SymbolRestriction[];
  /** Variantes visuais reconhecidas. */
  readonly variants: readonly SymbolVariant[];
  /** Fonte e crédito. */
  readonly attribution: SymbolAttribution;
  /** Sensibilidade cultural 1-5. */
  readonly culturalSensitivity: CulturalSensitivityLevel;
  /** Justificativa da nota acima. */
  readonly sensitivityRationale: string;
  /** É frequentemente apropriado por culturas externas? */
  readonly isAppropriated: boolean;
  /** Notas históricas/culturais extras. */
  readonly culturalNotes?: string;
  /** Tags adicionais (kebab-case) para busca. */
  readonly tags: readonly string[];
  /** Símbolos relacionados por proximidade visual OU semântica. */
  readonly relatedSymbols: readonly string[];
}

/** Entrada para criar uma coleção pessoal de símbolos. */
export interface SymbolCollection {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly description: string;
  readonly symbolIds: readonly string[];
  readonly isPublic: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Adicionar/remover item da coleção. */
export interface SymbolCollectionItem {
  readonly collectionId: string;
  readonly symbolId: string;
  readonly addedAt: string;
  readonly note?: string;
}

/** Parâmetros de busca no registro. */
export interface SymbolSearchQuery {
  /** Texto livre (nome, descrição, tags). */
  readonly text?: string;
  /** Filtrar por tradição. */
  readonly tradition?: SymbolTradition;
  /** Filtrar por sensibilidade máxima. */
  readonly maxSensitivity?: CulturalSensitivityLevel;
  /** Filtrar por contexto de uso. */
  readonly context?: SymbolContextType;
  /** Filtrar marcados como apropriados. */
  readonly onlyAppropriated?: boolean;
  /** Filtrar com restrições de comunidade-controlada. */
  readonly communityControlledOnly?: boolean;
  /** Limite de resultados (1-100). */
  readonly limit?: number;
}

/** Resultado de busca. */
export interface SymbolSearchResult {
  readonly symbols: readonly SacredSymbol[];
  readonly totalMatches: number;
  readonly query: SymbolSearchQuery;
}

/** Contexto de uso retornado por `getContext`. */
export interface SymbolContext {
  readonly symbolId: string;
  readonly contextType: SymbolContextType;
  readonly isAppropriate: boolean;
  readonly guidance: string;
  readonly warnings: readonly string[];
}

/** Resultado da checagem de uso apropriado. */
export interface AppropriatenessCheck {
  readonly symbolId: string;
  readonly useCase: SymbolUseCase;
  readonly isAppropriate: boolean;
  readonly reason: string;
  readonly requiredActions: readonly string[];
}

/** Equivalente sincrético identificado. */
export interface SyncreticEquivalent {
  readonly symbolId: string;
  readonly sharedMeaning: string;
  /** Tradições envolvidas (usa `SymbolTradition` quando aplicável; permite tags livres como 'sufi', 'jainism' para fins descritivos). */
  readonly traditionsInvolved: readonly string[];
  readonly notes: string;
}

/** Especificação de renderização para UI consumers. */
export interface SymbolRenderSpec {
  readonly symbolId: string;
  readonly minWidthPx: number;
  readonly minHeightPx: number;
  readonly colorProfile: 'monochrome' | 'duotone' | 'full-color' | 'metallic' | 'natural';
  readonly doNotModify: readonly string[];
  readonly safeAreaRules: readonly string[];
  readonly backgroundAllowed: readonly string[];
  readonly notes: string;
}

/** Relato de uso indevido (aponta para moderation queue). */
export interface SymbolMisuseReport {
  readonly id: string;
  readonly symbolId: string;
  readonly contextUrl?: string;
  readonly contextDescription: string;
  readonly reportedBy?: string;
  readonly reportedAt: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

/** Solicitação de acesso a símbolo controlado pela comunidade. */
export interface SymbolAccessRequest {
  readonly id: string;
  readonly symbolId: string;
  readonly requesterId: string;
  readonly purpose: string;
  readonly status: 'pending' | 'granted' | 'denied';
  readonly decidedBy?: string;
  readonly decidedAt?: string;
}

/** Erros tipados para o registry. */
export class SymbolNotFoundError extends Error {
  public readonly code = 'SYMBOL_NOT_FOUND' as const;
  public readonly symbolId: string;
  constructor(symbolId: string) {
    super(`Symbol not found: ${symbolId}`);
    this.symbolId = symbolId;
    Object.setPrototypeOf(this, SymbolNotFoundError.prototype);
  }
}

export class RestrictedContextError extends Error {
  public readonly code = 'RESTRICTED_CONTEXT' as const;
  public readonly symbolId: string;
  public readonly contextType: SymbolContextType;
  constructor(symbolId: string, contextType: SymbolContextType) {
    super(`Symbol ${symbolId} cannot be used in context ${contextType}`);
    this.symbolId = symbolId;
    this.contextType = contextType;
    Object.setPrototypeOf(this, RestrictedContextError.prototype);
  }
}

export class UnauthorizedAccessError extends Error {
  public readonly code = 'UNAUTHORIZED_ACCESS' as const;
  public readonly symbolId: string;
  constructor(symbolId: string) {
    super(`Unauthorized access to symbol ${symbolId}`);
    this.symbolId = symbolId;
    Object.setPrototypeOf(this, UnauthorizedAccessError.prototype);
  }
}

export class CulturalViolationError extends Error {
  public readonly code = 'CULTURAL_VIOLATION' as const;
  public readonly symbolId: string;
  public readonly violation: string;
  constructor(symbolId: string, violation: string) {
    super(`Cultural violation on ${symbolId}: ${violation}`);
    this.symbolId = symbolId;
    this.violation = violation;
    Object.setPrototypeOf(this, CulturalViolationError.prototype);
  }
}

export class CommunityControlledAccessError extends Error {
  public readonly code = 'COMMUNITY_CONTROLLED' as const;
  public readonly symbolId: string;
  constructor(symbolId: string) {
    super(`Symbol ${symbolId} requires community permission`);
    this.symbolId = symbolId;
    Object.setPrototypeOf(this, CommunityControlledAccessError.prototype);
  }
}

export class InvalidSensitivityLevelError extends Error {
  public readonly code = 'INVALID_SENSITIVITY' as const;
  constructor(public readonly value: unknown) {
    super(`Invalid sensitivity level: ${String(value)}`);
    Object.setPrototypeOf(this, InvalidSensitivityLevelError.prototype);
  }
}

export class EmptySearchQueryError extends Error {
  public readonly code = 'EMPTY_SEARCH_QUERY' as const;
  constructor() {
    super('Search query text must not be empty');
    Object.setPrototypeOf(this, EmptySearchQueryError.prototype);
  }
}

export class CollectionNotFoundError extends Error {
  public readonly code = 'COLLECTION_NOT_FOUND' as const;
  public readonly collectionId: string;
  constructor(collectionId: string) {
    super(`Collection not found: ${collectionId}`);
    this.collectionId = collectionId;
    Object.setPrototypeOf(this, CollectionNotFoundError.prototype);
  }
}

export class DuplicateCollectionItemError extends Error {
  public readonly code = 'DUPLICATE_ITEM' as const;
  public readonly collectionId: string;
  public readonly symbolId: string;
  constructor(collectionId: string, symbolId: string) {
    super(`Symbol ${symbolId} already in collection ${collectionId}`);
    this.collectionId = collectionId;
    this.symbolId = symbolId;
    Object.setPrototypeOf(this, DuplicateCollectionItemError.prototype);
  }
}

export class InvalidAttributionSourceError extends Error {
  public readonly code = 'INVALID_ATTRIBUTION' as const;
  public readonly symbolId: string;
  public readonly source: string;
  constructor(symbolId: string, source: string) {
    super(`Unverified attribution source for ${symbolId}: ${source}`);
    this.symbolId = symbolId;
    this.source = source;
    Object.setPrototypeOf(this, InvalidAttributionSourceError.prototype);
  }
}

export class AttributionLedgerTamperedError extends Error {
  public readonly code = 'ATTRIBUTION_LEDGER_TAMPERED' as const;
  public readonly symbolId: string;
  constructor(symbolId: string) {
    super(`Attribution ledger for ${symbolId} has been tampered with`);
    this.symbolId = symbolId;
    Object.setPrototypeOf(this, AttributionLedgerTamperedError.prototype);
  }
}

export class SymbolRegistryError extends Error {
  public readonly code = 'SYMBOL_REGISTRY_ERROR' as const;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SymbolRegistryError.prototype);
  }
}

/** Tipo união para erros tipados. */
export type SymbolLookupError =
  | SymbolNotFoundError
  | RestrictedContextError
  | UnauthorizedAccessError
  | CulturalViolationError
  | CommunityControlledAccessError
  | InvalidSensitivityLevelError
  | EmptySearchQueryError
  | CollectionNotFoundError
  | DuplicateCollectionItemError
  | InvalidAttributionSourceError
  | AttributionLedgerTamperedError
  | SymbolRegistryError;

// ============================================================================
// CONSTANTES — Diretrizes de Uso Respeitoso
// ============================================================================

/** Regras de uso respeitoso (pt-BR) — referenciadas em treinamentos/menus. */
export const RESPECTFUL_USE_GUIDELINES: ReadonlyArray<{
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: 'required' | 'recommended' | 'advisory';
}> = [
  {
    id: 'rule-attribute',
    title: 'Sempre atribuir a fonte',
    description:
      'Todo símbolo deve trazer crédito visível à tradição de origem, autor ou povo quando conhecido. Não atribuir é prática colonial.',
    severity: 'required',
  },
  {
    id: 'rule-no-commercial',
    title: 'Não usar símbolos sagrados em marketing sem permissão',
    description:
      'Símbolos com restrição `no-commercial` não devem aparecer em materiais de venda, anúncios ou embalagens sem autorização da comunidade de origem.',
    severity: 'required',
  },
  {
    id: 'rule-initiation-only',
    title: 'Não expor símbolos de iniciação a não-iniciados',
    description:
      'Símbolos restritos a iniciados (ex.: certas insígnias de Ifá, símbolos de alta magia cerimonial) não devem ser renderizados em UI pública.',
    severity: 'required',
  },
  {
    id: 'rule-tattoo-respect',
    title: 'Respeitar restrições de tatuagem',
    description:
      'Muitos símbolos sagrados não devem ser tatuados (ex.: Ganesh, Orixás, símbolos de Ifá). Informar a pessoa usuária antes do uso.',
    severity: 'required',
  },
  {
    id: 'rule-context-respect',
    title: 'Respeitar o contexto ritual',
    description:
      'Símbolos usados em liturgia/ritual perdem o sentido quando descontextualizados. Não misturar com memes, decoração banal ou produtos descartáveis.',
    severity: 'required',
  },
  {
    id: 'rule-no-modification',
    title: 'Não modificar proporcionalmente',
    description:
      'Alterar proporção, cor canônica ou composição de um símbolo pode invalidar seu significado. Para variações estilizadas, criar nova arte não-canônica.',
    severity: 'recommended',
  },
  {
    id: 'rule-community-consult',
    title: 'Consultar comunidades para símbolos sensíveis',
    description:
      'Símbolos de sensibilidade 4-5 ou `community-controlled` exigem consulta direta com a comunidade de origem antes do uso em produto.',
    severity: 'required',
  },
  {
    id: 'rule-no-appropriation',
    title: 'Combater apropriação cultural',
    description:
      'Símbolos marcados com `isAppropriated` foram historicamente cooptados. Recuperar com crédito e contexto, nunca re-apropriar.',
    severity: 'required',
  },
  {
    id: 'rule-label-clearly',
    title: 'Rotular claramente a tradição',
    description:
      'Em qualquer UI que apresente um símbolo, exibir sua tradição de origem (não só o nome) para que a pessoa usuária entenda o contexto.',
    severity: 'required',
  },
  {
    id: 'rule-edu-context-only',
    title: 'Uso educacional vem com fonte',
    description:
      'Conteúdo educacional pode renderizar símbolos sagrados desde que acompanhado de fonte verificável e descrição cultural adequada.',
    severity: 'recommended',
  },
  {
    id: 'rule-respect-prohibitions',
    title: 'Respeitar proibições religiosas',
    description:
      'Algumas tradições proíbem representações específicas (ex.: ausência de imagem antropomórfica na tradição islâmica sunni ortodoxa). Honrar.',
    severity: 'required',
  },
  {
    id: 'rule-lgpd-minimal',
    title: 'Minimizar dados de uso',
    description:
      'Coletar apenas dados necessários ao cumprimento espiritual (LGPD Art. 6º, princípio da necessidade). Não rastrear uso pessoal em logs.',
    severity: 'recommended',
  },
];

/** Idiomas suportados para nomes localizados. */
export type SupportedLocale = 'pt-BR' | 'en-US' | 'es-ES';

/** Nomes localizados (carregados progressivamente sob demanda). */
export const LOCALIZED_NAMES: Readonly<Record<SupportedLocale, Readonly<Record<string, string>>>> = {
  'pt-BR': {
    'symbol.christianity.cross': 'Cruz',
    'symbol.christianity.ichthys': 'Ictis (Peixe)',
    'symbol.christianity.dove': 'Pomba',
    'symbol.christianity.lamb': 'Cordeiro',
    'symbol.christianity.chi-rho': 'Chi-Rho',
    'symbol.christianity.alpha-omega': 'Alfa e Ômega',
    'symbol.islam.crescent-star': 'Lua Crescente e Estrela',
    'symbol.islam.bismillah': 'Bismillah (caligrafia)',
    'symbol.islam.ninety-nine-names': 'Noventa e Nove Nomes',
    'symbol.judaism.star-of-david': 'Estrela de Davi',
    'symbol.judaism.menorah': 'Menorá',
    'symbol.judaism.hamsa': 'Hamsá (Mão de Fátima)',
    'symbol.judaism.chai': 'Chai',
    'symbol.judaism.tree-of-life': 'Árvore da Vida',
    'symbol.buddhism.dharma-wheel': 'Roda do Dharma',
    'symbol.buddhism.lotus': 'Lótus',
    'symbol.buddhism.bodhi-leaf': 'Folha de Bodhi',
    'symbol.buddhism.mandala': 'Mandalá',
    'symbol.buddhism.buddha-eyes': 'Olhos do Buda',
    'symbol.hinduism.om': 'Om/Aum',
    'symbol.hinduism.swastika': 'Swastika (tradicional)',
    'symbol.hinduism.trishul': 'Trishul',
    'symbol.hinduism.ganesh': 'Ganesha',
    'symbol.candomble.oxala': 'Símbolo de Oxalá',
    'symbol.candomble.yemanja': 'Símbolo de Iemanjá',
    'symbol.candomble.shango': 'Machado de Xangô',
    'symbol.ifa.opon-ifa': 'Opón Ifá',
    'symbol.ifa.merindilogun': 'Merindilogun (16 búzios)',
    'symbol.umbanda.crucifix-umbanda': 'Crucifixo Umbandista',
    'symbol.taoism.yin-yang': 'Yin-Yang (Taijitu)',
    'symbol.taoism.bagua': 'Bagua',
    'symbol.indigenous.kene-huni-kuin': 'Kene Huni Kuin',
    'symbol.indigenous.yawanawa-pattern': 'Padrão Yawanawá',
    'symbol.indigenous.kraho-circle': 'Círculo Krahô',
    'symbol.syncretic.ankh': 'Ankh (egípcio)',
    'symbol.syncretic.eye-of-horus': 'Olho de Hórus',
  },
  'en-US': {
    'symbol.christianity.cross': 'Cross',
    'symbol.christianity.ichthys': 'Ichthys (Fish)',
    'symbol.christianity.dove': 'Dove',
    'symbol.christianity.lamb': 'Lamb',
    'symbol.christianity.chi-rho': 'Chi-Rho',
    'symbol.christianity.alpha-omega': 'Alpha and Omega',
    'symbol.islam.crescent-star': 'Crescent and Star',
    'symbol.islam.bismillah': 'Bismillah (calligraphy)',
    'symbol.islam.ninety-nine-names': '99 Names of Allah',
    'symbol.judaism.star-of-david': 'Star of David',
    'symbol.judaism.menorah': 'Menorah',
    'symbol.judaism.hamsa': 'Hamsa (Hand of Fatima)',
    'symbol.judaism.chai': 'Chai',
    'symbol.judaism.tree-of-life': 'Tree of Life',
    'symbol.buddhism.dharma-wheel': 'Dharma Wheel',
    'symbol.buddhism.lotus': 'Lotus',
    'symbol.buddhism.bodhi-leaf': 'Bodhi Leaf',
    'symbol.buddhism.mandala': 'Mandala',
    'symbol.buddhism.buddha-eyes': 'Buddha Eyes',
    'symbol.hinduism.om': 'Om/Aum',
    'symbol.hinduism.swastika': 'Swastika (traditional)',
    'symbol.hinduism.trishul': 'Trishul',
    'symbol.hinduism.ganesh': 'Ganesha',
    'symbol.candomble.oxala': 'Oxalá symbol',
    'symbol.candomble.yemanja': 'Yemanjá symbol',
    'symbol.candomble.shango': 'Shango axe',
    'symbol.ifa.opon-ifa': 'Opón Ifá',
    'symbol.ifa.merindilogun': 'Merindilogun (16 cowries)',
    'symbol.umbanda.crucifix-umbanda': 'Umbanda Crucifix',
    'symbol.taoism.yin-yang': 'Yin-Yang (Taijitu)',
    'symbol.taoism.bagua': 'Bagua',
    'symbol.indigenous.kene-huni-kuin': 'Huni Kuin Kene',
    'symbol.indigenous.yawanawa-pattern': 'Yawanawá pattern',
    'symbol.indigenous.kraho-circle': 'Krahô circle',
    'symbol.syncretic.ankh': 'Ankh (Egyptian)',
    'symbol.syncretic.eye-of-horus': 'Eye of Horus',
  },
  'es-ES': {
    'symbol.christianity.cross': 'Cruz',
    'symbol.christianity.ichthys': 'Ictis (Pez)',
    'symbol.christianity.dove': 'Paloma',
    'symbol.christianity.lamb': 'Cordero',
    'symbol.christianity.chi-rho': 'Chi-Rho',
    'symbol.christianity.alpha-omega': 'Alfa y Omega',
    'symbol.islam.crescent-star': 'Media Luna y Estrella',
    'symbol.islam.bismillah': 'Bismillah (caligrafía)',
    'symbol.islam.ninety-nine-names': '99 Nombres de Alá',
    'symbol.judaism.star-of-david': 'Estrella de David',
    'symbol.judaism.menorah': 'Menorá',
    'symbol.judaism.hamsa': 'Jamsá (Mano de Fátima)',
    'symbol.judaism.chai': 'Chai',
    'symbol.judaism.tree-of-life': 'Árbol de la Vida',
    'symbol.buddhism.dharma-wheel': 'Rueda del Dharma',
    'symbol.buddhism.lotus': 'Loto',
    'symbol.buddhism.bodhi-leaf': 'Hoja de Bodhi',
    'symbol.buddhism.mandala': 'Mandalá',
    'symbol.buddhism.buddha-eyes': 'Ojos del Buda',
    'symbol.hinduism.om': 'Om/Aum',
    'symbol.hinduism.swastika': 'Swastika (tradicional)',
    'symbol.hinduism.trishul': 'Trishul',
    'symbol.hinduism.ganesh': 'Ganesha',
    'symbol.candomble.oxala': 'Símbolo de Oxalá',
    'symbol.candomble.yemanja': 'Símbolo de Yemanyá',
    'symbol.candomble.shango': 'Hacha de Shango',
    'symbol.ifa.opon-ifa': 'Opón Ifá',
    'symbol.ifa.merindilogun': 'Merindilogun (16 cauris)',
    'symbol.umbanda.crucifix-umbanda': 'Crucifijo Umbandista',
    'symbol.taoism.yin-yang': 'Yin-Yang (Taijitu)',
    'symbol.taoism.bagua': 'Bagua',
    'symbol.indigenous.kene-huni-kuin': 'Kene Huni Kuin',
    'symbol.indigenous.yawanawa-pattern': 'Patrón Yawanawá',
    'symbol.indigenous.kraho-circle': 'Círculo Krahô',
    'symbol.syncretic.ankh': 'Ankh (egipcio)',
    'symbol.syncretic.eye-of-horus': 'Ojo de Horus',
  },
};

// ============================================================================
// REGISTRO PRINCIPAL — 36 símbolos (>= 30)
// ============================================================================

/** Catálogo curado de símbolos sagrados. */
export const SACRED_SYMBOLS: ReadonlyArray<SacredSymbol> = [
  // -------- Christianity (6) --------
  {
    id: 'cross',
    name: 'Cruz',
    aliases: ['Cruz Latina', 'Crucifixo'],
    tradition: 'christianity',
    subTradition: 'catholic',
    description:
      'Símbolo central do cristianismo, representa o instrumento da crucificação de Jesus de Nazaré e, metaforicamente, o sacrifício e a ressurreição. Variantes incluem a cruz latina, grega, patriarcal e ansata.',
    meanings: [
      'Sacrifício redentor',
      'Fé cristã professada',
      'Ressurreição e vida eterna',
    ],
    contexts: ['prayer', 'architecture', 'jewelry', 'liturgy', 'clothing', 'commemoration'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'latin-cross',
        name: 'Cruz Latina',
        description: 'Braço vertical mais longo; a forma mais comum no Ocidente.',
        preferredContexts: ['architecture', 'liturgy'],
      },
      {
        id: 'greek-cross',
        name: 'Cruz Grega',
        description: 'Quatro braços iguais; comum na tradição ortodoxa.',
        preferredContexts: ['architecture', 'commemoration'],
      },
      {
        id: 'crucifix',
        name: 'Crucifixo',
        description: 'Cruz com corpo de Cristo; central no catolicismo.',
        preferredContexts: ['liturgy', 'prayer'],
      },
    ],
    attribution: {
      source: 'Tradição cristã primitiva',
      originPeriod: 'séc. I',
      creditLine: 'Símbolo da tradição cristã. Uso litúrgico livre.',
    },
    culturalSensitivity: 2,
    sensitivityRationale:
      'Amplamente reconhecido e usado na cultura ocidental, mas seu uso em contextos não-cristãos deve vir com explicação.',
    isAppropriated: false,
    tags: ['cristianismo', 'cruz', 'fé', 'liturgia'],
    relatedSymbols: ['chi-rho', 'ichthys', 'crucifix-umbanda'],
  },
  {
    id: 'ichthys',
    name: 'Ictis (Peixe)',
    aliases: ['Peixe de Jesus', 'Jesus Fish'],
    tradition: 'christianity',
    subTradition: 'catholic',
    description:
      'Símbolo paleocristão em forma de peixe, com acróstico ICHTHYS (Ἰησοῦς Χριστὸς Θεοῦ Υἱός Σωτήρ) — "Jesus Cristo, Filho de Deus, Salvador".',
    meanings: ['Identidade cristã secreta', 'Pregação do Evangelho'],
    contexts: ['jewelry', 'illustration', 'digital-art', 'clothing'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'simple-fish',
        name: 'Peixe simples',
        description: 'Contorno curvilíneo, sem detalhes.',
        preferredContexts: ['jewelry', 'digital-art'],
      },
    ],
    attribution: {
      source: 'Inscrições paleocristãs romanas',
      originPeriod: 'séc. II',
      creditLine: 'Símbolo paleocristão tradicional.',
    },
    culturalSensitivity: 2,
    sensitivityRationale: 'Símbolo cristão antigo, uso livre com atribuição.',
    isAppropriated: false,
    tags: ['cristianismo', 'peixe', 'paleocristão'],
    relatedSymbols: ['cross', 'chi-rho'],
  },
  {
    id: 'dove',
    name: 'Pomba',
    aliases: ['Pomba do Espírito Santo', 'Columba'],
    tradition: 'christianity',
    subTradition: 'catholic',
    description:
      'Representação da pomba que, no relato do Evangelho, desceu sobre Jesus no batismo, simbolizando o Espírito Santo. Também aparece na narrativa da arca de Noé.',
    meanings: ['Espírito Santo', 'Paz e reconciliação', 'Pureza'],
    contexts: ['prayer', 'architecture', 'liturgy', 'illustration'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'olive-branch-dove',
        name: 'Pomba com ramo de oliveira',
        description: 'Ícone clássico de paz.',
        preferredContexts: ['commemoration', 'illustration'],
      },
    ],
    attribution: {
      source: 'Evangelhos e tradição iconográfica cristã',
      originPeriod: 'séc. I',
      creditLine: 'Símbolo cristão do Espírito Santo.',
    },
    culturalSensitivity: 2,
    sensitivityRationale: 'Uso livre com atenção ao contexto teológico.',
    isAppropriated: false,
    tags: ['cristianismo', 'pomba', 'espírito-santo', 'paz'],
    relatedSymbols: ['lamb', 'cross'],
  },
  {
    id: 'lamb',
    name: 'Cordeiro (Agnus Dei)',
    aliases: ['Cordeiro de Deus', 'Agnus Dei'],
    tradition: 'christianity',
    subTradition: 'catholic',
    description:
      'Representação do cordeiro sacrificial, evocando o sacrifício pascal e, na cristologia, Jesus como "Cordeiro de Deus que tira o pecado do mundo" (Jo 1:29).',
    meanings: ['Sacrifício expiatório', 'Inocência', 'Páscoa cristã'],
    contexts: ['liturgy', 'prayer', 'illustration', 'architecture'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'lamb-banner',
        name: 'Cordeiro com estandarte',
        description: 'Agnus Dei com bandeira de vitória.',
        preferredContexts: ['liturgy'],
      },
    ],
    attribution: {
      source: 'Evangelho de João e tradição litúrgica',
      originPeriod: 'séc. I',
      creditLine: 'Símbolo cristão do Cordeiro Pascal.',
    },
    culturalSensitivity: 2,
    sensitivityRationale: 'Símbolo litúrgico central, uso respeitoso recomendado.',
    isAppropriated: false,
    tags: ['cristianismo', 'cordeiro', 'páscoa'],
    relatedSymbols: ['dove', 'cross'],
  },
  {
    id: 'chi-rho',
    name: 'Chi-Rho',
    aliases: ['Crismon', 'Labarum'],
    tradition: 'christianity',
    subTradition: 'catholic',
    description:
      'Monograma de Cristo formado pelas letras gregas Chi (Χ) e Rho (Ρ), as duas primeiras de ΧΡΙΣΤΟΣ (Christos). Adotado por Constantino no séc. IV.',
    meanings: ['Identidade cristã imperial', 'Vitória da fé'],
    contexts: ['architecture', 'liturgy', 'jewelry', 'illustration'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'chi-rho-plain',
        name: 'Chi-Rho simples',
        description: 'Sobreposição das letras gregas sem adornos.',
        preferredContexts: ['jewelry', 'illustration'],
      },
      {
        id: 'chi-rho-constantine',
        name: 'Chi-Rho de Constantino',
        description: 'Versão com letras dentro de círculo, vista no Labarum.',
        preferredContexts: ['architecture', 'liturgy'],
      },
    ],
    attribution: {
      source: 'Lactâncio, "Sobre a morte dos perseguidores" (séc. IV)',
      originPeriod: 'séc. IV',
      creditLine: 'Monograma cristão imperial romano.',
    },
    culturalSensitivity: 2,
    sensitivityRationale: 'Símbolo histórico com peso imperial, uso livre com contexto.',
    isAppropriated: false,
    tags: ['cristianismo', 'monograma', 'constantino'],
    relatedSymbols: ['cross', 'ichthys'],
  },
  {
    id: 'alpha-omega',
    name: 'Alfa e Ômega',
    aliases: ['Α e Ω'],
    tradition: 'christianity',
    subTradition: 'catholic',
    description:
      'Primeira e última letras do alfabeto grego, usadas no Livro do Apocalipse para designar Cristo como "o princípio e o fim".',
    meanings: ['Eternidade divina', 'Totalidade', 'Onipresença'],
    contexts: ['liturgy', 'jewelry', 'architecture', 'illustration'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'alpha-omega-circle',
        name: 'Alfa e Ômega em círculo',
        description: 'Letras gregas circundadas, comuns em ícones bizantinos.',
        preferredContexts: ['architecture', 'liturgy'],
      },
    ],
    attribution: {
      source: 'Apocalipse 1:8',
      originPeriod: 'séc. I',
      creditLine: 'Símbolo cristão da eternidade divina.',
    },
    culturalSensitivity: 2,
    sensitivityRationale: 'Uso litúrgico e devocional, sem restrição maior.',
    isAppropriated: false,
    tags: ['cristianismo', 'eternidade', 'apocalipse'],
    relatedSymbols: ['chi-rho', 'cross'],
  },

  // -------- Islam (3) --------
  {
    id: 'crescent-star',
    name: 'Lua Crescente e Estrela',
    aliases: ['Hilal e estrela'],
    tradition: 'islam',
    subTradition: 'sunni',
    description:
      'O crescente lunar (hilal) com estrela é amplamente associado ao Islã, embora não seja mencionado no Alcorão. Tornou-se símbolo do calendário islâmico e da ummah.',
    meanings: ['Calendário lunar islâmico', 'Unidade da ummah'],
    contexts: ['architecture', 'commemoration', 'jewelry'],
    restrictions: ['attribution-required', 'context-specific'],
    variants: [
      {
        id: 'ottoman-crescent',
        name: 'Crescente otomano',
        description: 'Estrela de 8 pontas acima do crescente; usado no Império Otomano.',
        preferredContexts: ['commemoration'],
      },
    ],
    attribution: {
      source: 'Tradição otomana e simbolismo do calendário hégira',
      originPeriod: 'séc. VII em diante',
      creditLine: 'Símbolo associado ao Islã, especialmente na tradição otomana.',
    },
    culturalSensitivity: 2,
    sensitivityRationale: 'Uso livre com atribuição; evitar associação com extremismo.',
    isAppropriated: false,
    tags: ['islã', 'crescente', 'hijri'],
    relatedSymbols: ['bismillah'],
  },
  {
    id: 'bismillah',
    name: 'Bismillah (Caligrafia)',
    aliases: ['Bismillâh al-Rahmân al-Rahîm'],
    tradition: 'islam',
    subTradition: 'sufi',
    description:
      'Caligrafia da frase "Em nome de Deus, o Clemente, o Misericordioso", primeira frase do Alcorão. A caligrafia islâmica é considerada forma de adoração.',
    meanings: ['Invocação divina', 'Arte como adoração', 'Abertura de toda ação'],
    contexts: ['calligraphy', 'illustration', 'architecture', 'education'],
    restrictions: ['attribution-required', 'no-modification'],
    variants: [
      {
        id: 'thuluth-bismillah',
        name: 'Bismillah em Thuluth',
        description: 'Estilo caligráfico cúfico/Thuluth, comum em mesquitas.',
        preferredContexts: ['architecture', 'calligraphy'],
      },
    ],
    attribution: {
      source: 'Alcorão, Fatihah 1:1',
      originPeriod: 'séc. VII',
      creditLine: 'Caligrafia islâmica tradicional — arte sacra.',
    },
    culturalSensitivity: 3,
    sensitivityRationale:
      'Texto sagrado escrito à mão; respeitar calígrafo e contexto litúrgico.',
    isAppropriated: false,
    tags: ['islã', 'caligrafia', 'alcorão', 'basmala'],
    relatedSymbols: ['crescent-star', 'ninety-nine-names'],
  },
  {
    id: 'ninety-nine-names',
    name: 'Noventa e Nove Nomes',
    aliases: ['Asmâ ul-Husnâ'],
    tradition: 'islam',
    subTradition: 'sunni',
    description:
      'Os 99 nomes/atributos de Deus na tradição islâmica. Tradicionalmente organizados em arranjos geométricos para meditação (dhikr).',
    meanings: ['Atributos divinos', 'Meditação dhikr', 'Contemplação'],
    contexts: ['meditation', 'calligraphy', 'illustration', 'education'],
    restrictions: ['attribution-required', 'no-modification'],
    variants: [
      {
        id: 'rosary-99',
        name: 'Rosário dos 99 nomes',
        description: 'Disposição circular dos nomes para contagem.',
        preferredContexts: ['meditation'],
      },
    ],
    attribution: {
      source: 'Hadith narrated by Tirmidhi',
      originPeriod: 'séc. VII-IX',
      creditLine: 'Lista tradicional islâmica dos 99 nomes de Deus.',
    },
    culturalSensitivity: 3,
    sensitivityRationale: 'Atributos divinos tratados com reverência; evitar uso banal.',
    isAppropriated: false,
    tags: ['islã', 'dhikr', 'atributos', 'meditação'],
    relatedSymbols: ['bismillah'],
  },

  // -------- Judaism (5) --------
  {
    id: 'star-of-david',
    name: 'Estrela de Davi',
    aliases: ['Magen David', 'Escudo de Davi'],
    tradition: 'judaism',
    subTradition: 'ashkenazi',
    description:
      'Estrela de seis pontas formada por dois triângulos sobrepostos. Adotada como símbolo do judaísmo e do Estado de Israel a partir do séc. XIX.',
    meanings: ['Identidade judaica', 'Proteção divina', 'União dos opostos'],
    contexts: ['architecture', 'jewelry', 'commemoration', 'illustration'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'magendavid-plain',
        name: 'Estrela de Davi simples',
        description: 'Triângulos sobrepostos sem decoração.',
        preferredContexts: ['jewelry', 'architecture'],
      },
      {
        id: 'star-of-david-medallion',
        name: 'Medalhão Estrela',
        description: 'Estrela inscrita em círculo com文字 hebraicas.',
        preferredContexts: ['commemoration'],
      },
    ],
    attribution: {
      source: 'Tradição cabalística e simbolismo judaico medieval',
      originPeriod: 'Idade Média',
      creditLine: 'Símbolo judaico tradicional — Magen David.',
    },
    culturalSensitivity: 2,
    sensitivityRationale:
      'Símbolo central do judaísmo; evitar associar a contextos negativos.',
    isAppropriated: false,
    tags: ['judaísmo', 'estrela', 'davi', 'identidade'],
    relatedSymbols: ['menorah', 'chai', 'hamsa'],
  },
  {
    id: 'menorah',
    name: 'Menorá',
    aliases: ['Candelabro de sete braços'],
    tradition: 'judaism',
    subTradition: 'ashkenazi',
    description:
      'Candelabro de sete braços descrito em Êxodo 25. Originalmente iluminado no Tabernáculo e no Templo de Jerusalém. Símbolo do Estado de Israel.',
    meanings: ['Luz divina', 'Presença de Deus', 'Continuidade do povo judeu'],
    contexts: ['architecture', 'liturgy', 'commemoration', 'illustration'],
    restrictions: ['attribution-required', 'context-specific'],
    variants: [
      {
        id: 'temple-menorah',
        name: 'Menorá do Templo',
        description: 'Reprodução exata do candelabro descrito em Êxodo.',
        preferredContexts: ['architecture', 'commemoration'],
      },
      {
        id: 'hanukkah-menorah',
        name: 'Hanukkiah',
        description: 'Candelabro de 9 braços para Hanukkah — distinto da Menorá.',
        preferredContexts: ['liturgy'],
      },
    ],
    attribution: {
      source: 'Torá, Êxodo 25:31-40',
      originPeriod: 'séc. XIII a.C.',
      creditLine: 'Símbolo judaico milenar; menorá do Templo.',
    },
    culturalSensitivity: 3,
    sensitivityRationale: 'Não confundir com a hanukkiah (9 braços). Uso respeitoso.',
    isAppropriated: false,
    tags: ['judaísmo', 'candelabro', 'templo'],
    relatedSymbols: ['star-of-david'],
  },
  {
    id: 'hamsa',
    name: 'Hamsá (Mão de Fátima)',
    aliases: ['Mão de Miriam', 'Khamsa'],
    tradition: 'syncretic',
    subTradition: 'sephardic',
    description:
      'Mão estilizada com olho no centro. Símbolo compartilhado pelo judaísmo sefardita (chamada Mão de Miriam) e pelo Islã (chamada Mão de Fátima), representando proteção.',
    meanings: ['Proteção contra o mau-olhado', 'Bênção', 'Sincretismo cultural'],
    contexts: ['jewelry', 'architecture', 'illustration', 'commemoration'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'jewish-hamsa',
        name: 'Hamsá judaica',
        description: 'Com sinos e文字 hebraicas, sem olho central se estritamente haláchico.',
        preferredContexts: ['jewelry', 'commemoration'],
      },
      {
        id: 'muslim-hamsa',
        name: 'Hamsá islâmica',
        description: 'Com olho central e caligrafia islâmica, chamado Mão de Fátima.',
        preferredContexts: ['jewelry', 'architecture'],
      },
    ],
    attribution: {
      source: 'Tradição sefardita e magrebina',
      originPeriod: 'Idade Média',
      creditLine: 'Símbolo compartilhado judaico-islâmico — proteger do mau-olhado.',
    },
    culturalSensitivity: 3,
    sensitivityRationale:
      'Símbolo sincrético com variantes — respeitar a tradição de uso em cada contexto.',
    isAppropriated: true,
    tags: ['sincrético', 'hamsa', 'proteção', 'judaísmo', 'islã'],
    relatedSymbols: ['star-of-david', 'eye-of-horus'],
  },
  {
    id: 'chai',
    name: 'Chai',
    aliases: ['חי'],
    tradition: 'judaism',
    subTradition: 'ashkenazi',
    description:
      'As letras hebraicas Chet (ח) e Yod (י) formam a palavra "chai" (vida). Frequentemente usada em pingentes e decoração judaica.',
    meanings: ['Vida como valor central', 'Bênção (lechaim)'],
    contexts: ['jewelry', 'illustration', 'commemoration'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'chai-script',
        name: 'Chai cursivo',
        description: 'Caligrafia cursiva das letras.',
        preferredContexts: ['jewelry'],
      },
    ],
    attribution: {
      source: 'Tradição talmúdica e cabalística',
      originPeriod: 'Idade Média',
      creditLine: 'Símbolo judaico da vida — chai.',
    },
    culturalSensitivity: 2,
    sensitivityRationale: 'Uso devocional e decorativo judeu; sem controvérsia maior.',
    isAppropriated: false,
    tags: ['judaísmo', 'chai', 'vida'],
    relatedSymbols: ['star-of-david', 'menorah'],
  },
  {
    id: 'tree-of-life',
    name: 'Árvore da Vida',
    aliases: ['Etz Chaim', 'Sephirot'],
    tradition: 'judaism',
    subTradition: 'ashkenazi',
    description:
      'Na Cabala, a Árvore da Vida (Etz Chaim) representa as 10 sephirot e os caminhos entre elas. Também usada como metáfora em Provérbios e Gênesis.',
    meanings: ['Estrutura da criação', 'Caminhos espirituais', 'Torá como árvore'],
    contexts: ['meditation', 'calligraphy', 'illustration', 'education'],
    restrictions: ['attribution-required', 'context-specific'],
    variants: [
      {
        id: 'kabbalistic-tree',
        name: 'Árvore cabalística',
        description: 'Diagrama das 10 sephirot com 22 caminhos.',
        preferredContexts: ['meditation', 'education'],
      },
      {
        id: 'stylized-tree',
        name: 'Árvore estilizada',
        description: 'Representação artística simplificada.',
        preferredContexts: ['illustration', 'jewelry'],
      },
    ],
    attribution: {
      source: 'Tradição cabalística, Zohar',
      originPeriod: 'séc. XIII',
      creditLine: 'Símbolo cabalístico — Árvore da Vida.',
    },
    culturalSensitivity: 3,
    sensitivityRationale:
      'Diagrama esotérico respeitado; respeitar uso meditativo.',
    isAppropriated: false,
    tags: ['judaísmo', 'cabala', 'sephirot', 'árvore'],
    relatedSymbols: ['star-of-david', 'chai'],
  },

  // -------- Buddhism (5) --------
  {
    id: 'dharma-wheel',
    name: 'Roda do Dharma',
    aliases: ['Dharmachakra', 'Rota de oito raios'],
    tradition: 'buddhism',
    subTradition: 'theravada',
    description:
      'Roda com oito raios representando o Nobre Caminho Óctuplo, ensinada no primeiro sermão de Buda em Sarnath. Um dos símbolos mais antigos do budismo.',
    meanings: ['Ensinamento do Buda', 'Nobre Caminho Óctuplo', 'Impermanência'],
    contexts: ['liturgy', 'architecture', 'meditation', 'illustration'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'navyavihara-wheel',
        name: 'Roda tibetana',
        description: 'Variante tibetana com hub central decorado.',
        preferredContexts: ['meditation', 'architecture'],
      },
    ],
    attribution: {
      source: 'Sutra do Dhammacakkappavattana',
      originPeriod: 'séc. V a.C.',
      creditLine: 'Símbolo budista da roda do ensinamento.',
    },
    culturalSensitivity: 2,
    sensitivityRationale:
      'Símbolo universal do budismo; uso com reverência mas amplamente decorativo.',
    isAppropriated: false,
    tags: ['budismo', 'dharma', 'roda'],
    relatedSymbols: ['lotus', 'buddha-eyes', 'mandala'],
  },
  {
    id: 'lotus',
    name: 'Lótus',
    aliases: ['Padma', 'Lótus de oito pétalas'],
    tradition: 'buddhism',
    subTradition: 'mahayana',
    description:
      'Flor de lótus é central no budismo e hinduísmo. Simboliza pureza emergindo de águas turvas — a mente desperta apesar do sofrimento.',
    meanings: ['Pureza', 'Despertar', 'Renascimento espiritual'],
    contexts: ['meditation', 'illustration', 'architecture', 'jewelry', 'tattoo'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'eight-petaled-lotus',
        name: 'Lótus de oito pétalas',
        description: 'Forma simétrica comum em mandalas tibetanos.',
        preferredContexts: ['meditation', 'illustration'],
      },
    ],
    attribution: {
      source: 'Tradição budista e hindu',
      originPeriod: '3000+ anos',
      creditLine: 'Símbolo de pureza — tradição budista e hindu.',
    },
    culturalSensitivity: 2,
    sensitivityRationale:
      'Compartilhado entre budismo e hinduísmo; uso decorativo amplo permitido com contexto.',
    isAppropriated: true,
    tags: ['budismo', 'hinduísmo', 'lótus', 'pureza'],
    relatedSymbols: ['dharma-wheel', 'mandala', 'bodhi-leaf'],
  },
  {
    id: 'bodhi-leaf',
    name: 'Folha de Bodhi',
    aliases: ['Folha da Iluminação'],
    tradition: 'buddhism',
    subTradition: 'theravada',
    description:
      'Folha da árvore Ficus religiosa sob a qual Buda Siddhartha atingiu a iluminação. Forma alongada com ponta característica.',
    meanings: ['Iluminação', 'Despertar', 'Tradição Theravada'],
    contexts: ['meditation', 'illustration', 'calligraphy', 'architecture'],
    restrictions: ['attribution-required', 'no-tattoo'],
    variants: [
      {
        id: 'heart-tipped-bodhi',
        name: 'Folha Bodhi com ponta em coração',
        description: 'Variante com ponta em coração, comum no Sri Lanka.',
        preferredContexts: ['architecture', 'illustration'],
      },
    ],
    attribution: {
      source: 'Tradição budista, Bodh Gaya',
      originPeriod: 'séc. V a.C.',
      creditLine: 'Folha da árvore da iluminação — tradição bodhi.',
    },
    culturalSensitivity: 3,
    sensitivityRationale: 'Associada à iluminação; respeitar não tatuar.',
    isAppropriated: false,
    tags: ['budismo', 'bodhi', 'folha', 'iluminação'],
    relatedSymbols: ['dharma-wheel', 'lotus'],
  },
  {
    id: 'mandala',
    name: 'Mandalá',
    aliases: ['Círculo Sagrado'],
    tradition: 'buddhism',
    subTradition: 'vajrayana',
    description:
      'Diagrama geométrico circular usado como ferramenta de meditação no budismo tântrico. Representa a morada de uma divindade e o cosmos.',
    meanings: ['Universo', 'Meditação visual', 'Residência divina'],
    contexts: ['meditation', 'calligraphy', 'illustration', 'architecture'],
    restrictions: ['attribution-required', 'no-modification', 'context-specific'],
    variants: [
      {
        id: 'sand-mandala',
        name: 'Mandalá de areia',
        description: 'Construída com areia colorida e dissolvida após ritual.',
        preferredContexts: ['meditation', 'liturgy'],
      },
    ],
    attribution: {
      source: 'Tradição vajrayana tibetana',
      originPeriod: 'séc. VIII',
      creditLine: 'Mandalá budista tibetano — círculo de meditação.',
    },
    culturalSensitivity: 4,
    sensitivityRationale:
      'Mandalas específicos são associados a divindades tutelares; respeitar iniciação.',
    isAppropriated: true,
    tags: ['budismo', 'mandalá', 'vajrayana', 'meditação'],
    relatedSymbols: ['dharma-wheel', 'lotus'],
  },
  {
    id: 'buddha-eyes',
    name: 'Olhos do Buda',
    aliases: ['Olhos da Sabedoria', 'Wisdom Eyes'],
    tradition: 'buddhism',
    subTradition: 'vajrayana',
    description:
      'Pares de olhos estilizados pintados nos stupa e monastérios. Representam a onisciência do Buda. O símbolo entre eles é o número um em sânscrito.',
    meanings: ['Onisciência', 'Vigilância', 'Buda observando'],
    contexts: ['architecture', 'illustration', 'commemoration'],
    restrictions: ['attribution-required', 'no-modification'],
    variants: [
      {
        id: 'stupa-eyes',
        name: 'Olhos do Stupa',
        description: 'Estilo decorativo pintado em estupas nepalesas.',
        preferredContexts: ['architecture'],
      },
    ],
    attribution: {
      source: 'Iconografia budista tântrica',
      originPeriod: 'séc. VIII em diante',
      creditLine: 'Símbolo budista da onisciência.',
    },
    culturalSensitivity: 4,
    sensitivityRationale: 'Ícone religioso respeitado; evitar apropriação decorativa banal.',
    isAppropriated: false,
    tags: ['budismo', 'olhos', 'stupa'],
    relatedSymbols: ['dharma-wheel', 'mandala'],
  },

  // -------- Hinduism (4) --------
  {
    id: 'om',
    name: 'Om/Aum',
    aliases: ['ॐ', 'Aum'],
    tradition: 'hinduism',
    subTradition: 'shaivite',
    description:
      'Sílaba sagrada Om (AUM) representa o som primordial do universo. Aparece no início de muitos mantras e textos védicos.',
    meanings: ['Som primordial', 'Brahman', 'Tríade (A-U-M)'],
    contexts: ['meditation', 'calligraphy', 'jewelry', 'liturgy'],
    restrictions: ['attribution-required', 'context-specific'],
    variants: [
      {
        id: 'devanagari-om',
        name: 'Om em devanagari',
        description: 'Forma cursiva em script devanagari.',
        preferredContexts: ['meditation', 'calligraphy'],
      },
      {
        id: 'stylized-om',
        name: 'Om estilizado',
        description: 'Versão artística com ornamentos.',
        preferredContexts: ['jewelry', 'illustration'],
      },
    ],
    attribution: {
      source: 'Upanishads e Mandukya Upanishad',
      originPeriod: '1500+ a.C.',
      creditLine: 'Sílaba sagrada hindu — Om.',
    },
    culturalSensitivity: 3,
    sensitivityRationale:
      'Sílaba sagrada; respeitar pronúncia correta (AUM) e contexto devocional.',
    isAppropriated: true,
    tags: ['hinduísmo', 'om', 'mantra', 'som-primordial'],
    relatedSymbols: ['ganesh', 'trishul', 'swastika'],
  },
  {
    id: 'swastika',
    name: 'Swastika (tradicional)',
    aliases: ['Svastika', 'Sauwastika'],
    tradition: 'hinduism',
    subTradition: 'vaishnavite',
    description:
      'Cruz gamada presente em hinduísmo, budismo e jainismo há milhares de anos. Significa "bem-estar" (su-asti). Na tradição védica, símbolo auspicioso de Ganesha.',
    meanings: ['Auspiciosidade', 'Bem-estar', 'Sol em movimento'],
    contexts: ['architecture', 'ceramic', 'commemoration', 'ritual'],
    restrictions: ['attribution-required', 'no-commercial'],
    variants: [
      {
        id: 'right-handed-swastika',
        name: 'Swastika dextrógira',
        description: 'Braços curvando-se para a direita.',
        preferredContexts: ['ritual', 'architecture'],
      },
    ],
    attribution: {
      source: 'Civilização do Vale do Indo e tradição védica',
      originPeriod: '3000+ a.C.',
      creditLine: 'Símbolo hindu, budista e jainista de auspiciosidade.',
    },
    culturalSensitivity: 5,
    sensitivityRationale:
      'Apropriação nazista histórica exige extremo cuidado e contexto educacional explícito.',
    isAppropriated: true,
    tags: ['hinduísmo', 'swastika', 'auspicioso', 'veda'],
    relatedSymbols: ['om', 'ganesh'],
  },
  {
    id: 'trishul',
    name: 'Trishul',
    aliases: ['Tridente de Shiva'],
    tradition: 'hinduism',
    subTradition: 'shaivite',
    description:
      'Tridente empunhado por Shiva. Representa os três gunas (sattva, rajas, tamas) ou três aspectos do tempo (passado, presente, futuro).',
    meanings: ['Shiva', 'Tríade dos gunas', 'Destruição-transformação'],
    contexts: ['ritual', 'architecture', 'jewelry', 'illustration'],
    restrictions: ['attribution-required', 'context-specific'],
    variants: [
      {
        id: 'shiva-trishul',
        name: 'Trishul com Damaru',
        description: 'Tridente com pequeno tambor, associado à dança cósmica.',
        preferredContexts: ['ritual', 'meditation'],
      },
    ],
    attribution: {
      source: 'Tradição Shaiva, Puranas',
      originPeriod: 'séc. V em diante',
      creditLine: 'Símbolo Shaiva — Tridente de Shiva.',
    },
    culturalSensitivity: 4,
    sensitivityRationale:
      'Ícone ritual de Shiva; não tatuar sem iniciação devocional.',
    isAppropriated: false,
    tags: ['hinduísmo', 'shiva', 'tridente', 'trishul'],
    relatedSymbols: ['om', 'ganesh'],
  },
  {
    id: 'ganesh',
    name: 'Ganesha',
    aliases: ['Ganesh', 'Ganapati'],
    tradition: 'hinduism',
    subTradition: 'shaivite',
    description:
      'Representação do deus Ganesha, removedor de obstáculos. Cabeça de elefante, corpo humano, frequentemente sentado ou dançando.',
    meanings: ['Remoção de obstáculos', 'Sabedoria', 'Início auspicioso'],
    contexts: ['architecture', 'illustration', 'jewelry', 'ceramic'],
    restrictions: ['attribution-required', 'no-tattoo'],
    variants: [
      {
        id: 'sitting-ganesh',
        name: 'Ganesha sentado',
        description: 'Pose clássica lalitasana.',
        preferredContexts: ['architecture', 'illustration'],
      },
      {
        id: 'dancing-ganesh',
        name: 'Ganesha dançando',
        description: 'Nritya Ganapati, em movimento.',
        preferredContexts: ['meditation', 'illustration'],
      },
    ],
    attribution: {
      source: 'Puranas, Mudgala Purana',
      originPeriod: 'séc. V em diante',
      creditLine: 'Ícone Shaiva — Ganesha, removedor de obstáculos.',
    },
    culturalSensitivity: 4,
    sensitivityRationale:
      'Representação divina hindu; não tatuar (respeito devocional).',
    isAppropriated: true,
    tags: ['hinduísmo', 'ganesha', 'elefante'],
    relatedSymbols: ['om', 'trishul'],
  },

  // -------- Candomblé (3) --------
  {
    id: 'oxala-symbol',
    name: 'Símbolo de Oxalá',
    aliases: ['Oxaguiã', 'Símbolo da paz'],
    tradition: 'candomble',
    subTradition: 'nagô',
    description:
      'Representação gráfica associada a Oxalá, orixá da criação e da paz. Traços brancos ou em cruz estilizada; o cruzeiro é figura comum.',
    meanings: ['Criação', 'Paz', 'Pureza'],
    contexts: ['ritual', 'architecture', 'illustration', 'commemoration'],
    restrictions: [
      'sacred-only',
      'permission-required',
      'community-controlled',
      'initiation-only',
    ],
    variants: [
      {
        id: 'oxala-cross',
        name: 'Cruz de Oxalá',
        description: 'Cruz estilizada com braços abertos.',
        preferredContexts: ['ritual'],
      },
    ],
    attribution: {
      source: 'Tradição nagô-iorubá',
      originPeriod: 'séc. XIX',
      creditLine: 'Símbolo de Oxalá — tradição do Candomblé. Uso restrito à comunidade religiosa.',
    },
    culturalSensitivity: 5,
    sensitivityRationale:
      'Símbolo de iniciação; somente comunidade praticante pode expor.',
    isAppropriated: true,
    tags: ['candomblé', 'oxalá', 'iorubá', 'nagô'],
    relatedSymbols: ['yemanja-symbol', 'shango-symbol'],
  },
  {
    id: 'yemanja-symbol',
    name: 'Símbolo de Iemanjá',
    aliases: ['Yemanjá', 'Iemanjá Ogunté'],
    tradition: 'candomble',
    subTradition: 'nagô',
    description:
      'Representação simbólica de Iemanjá, orixá do mar e mãe. Símbolo inclui ondas, espelho e abebé (leque ritual).',
    meanings: ['Mãe dos orixás', 'Mar e fertilidade'],
    contexts: ['ritual', 'commemoration', 'illustration'],
    restrictions: ['sacred-only', 'permission-required', 'community-controlled'],
    variants: [
      {
        id: 'yemanja-abebe',
        name: 'Iemanjá com abebé',
        description: 'Representação com leque e espelho.',
        preferredContexts: ['ritual'],
      },
    ],
    attribution: {
      source: 'Tradição nagô-iorubá',
      originPeriod: 'séc. XIX',
      creditLine: 'Símbolo de Iemanjá — tradição do Candomblé.',
    },
    culturalSensitivity: 5,
    sensitivityRationale: 'Símbolo orixá; somente comunidade pode expor.',
    isAppropriated: true,
    tags: ['candomblé', 'iemanjá', 'mar', 'mãe'],
    relatedSymbols: ['oxala-symbol', 'shango-symbol'],
  },
  {
    id: 'shango-symbol',
    name: 'Machado de Xangô',
    aliases: ['Oxé de Xangô'],
    tradition: 'candomble',
    subTradition: 'nagô',
    description:
      'Machado de dois gumes (oxé) é o atributo ritual de Xangô, orixá do trovão e da justiça. Representa o raio e o poder decisório.',
    meanings: ['Justiça', 'Trovão', 'Autoridade'],
    contexts: ['ritual', 'commemoration', 'architecture'],
    restrictions: [
      'sacred-only',
      'permission-required',
      'community-controlled',
      'no-tattoo',
    ],
    variants: [
      {
        id: 'double-axe',
        name: 'Machado de dois gumes',
        description: 'Forma ritual do oxé xangotiano.',
        preferredContexts: ['ritual'],
      },
    ],
    attribution: {
      source: 'Tradição nagô-iorubá',
      originPeriod: 'séc. XIX',
      creditLine: 'Símbolo de Xangô — tradição do Candomblé.',
    },
    culturalSensitivity: 5,
    sensitivityRationale: 'Atributo ritual orixá; não tatuar sem iniciação.',
    isAppropriated: true,
    tags: ['candomblé', 'xangô', 'machado', 'trovão'],
    relatedSymbols: ['oxala-symbol', 'yemanja-symbol'],
  },

  // -------- Ifá (2) --------
  {
    id: 'opon-ifa',
    name: 'Opón Ifá',
    aliases: ['Tabuleiro de Ifá'],
    tradition: 'ifa',
    subTradition: 'nagô',
    description:
      'Tabuleiro ritual de Ifá usado pelos babalawô para consulta. Desenhos geométricos específicos marcam as posições dos odus. Considerado sagrado e iniciado.',
    meanings: ['Sistema oracular', 'Os 16 odus principais'],
    contexts: ['ritual', 'commemoration'],
    restrictions: [
      'sacred-only',
      'permission-required',
      'initiation-only',
      'community-controlled',
    ],
    variants: [
      {
        id: 'opon-wood',
        name: 'Opón de madeira',
        description: 'Tabuleiro esculpido em madeira sagrada.',
        preferredContexts: ['ritual'],
      },
    ],
    attribution: {
      source: 'Tradição Ifá, Iorubá',
      originPeriod: 'pré-colonial',
      creditLine: 'Ferramenta oracular de Ifá. Acesso restrito a iniciados.',
    },
    culturalSensitivity: 5,
    sensitivityRationale:
      'Ferramenta oracular — somente babalawô iniciados podem manusear.',
    isAppropriated: false,
    tags: ['ifá', 'opón', 'odus', 'babalawô'],
    relatedSymbols: ['merindilogun'],
  },
  {
    id: 'merindilogun',
    name: 'Merindilogun (16 búzios)',
    aliases: ['Jogo dos 16 búzios', 'Oráculo dos búzios'],
    tradition: 'ifa',
    subTradition: 'nagô',
    description:
      'Sistema oracular iorubano que utiliza 16 búzios (cowries) jogados para revelar a energia dos odus. Lido por ogãs e ialorixás treinados.',
    meanings: ['Odus secundários', 'Consulta oracular'],
    contexts: ['ritual', 'commemoration'],
    restrictions: ['permission-required', 'initiation-only', 'community-controlled'],
    variants: [
      {
        id: 'cowries-16',
        name: '16 búzios em linha',
        description: 'Arranjo tradicional dos odus secundários.',
        preferredContexts: ['ritual'],
      },
    ],
    attribution: {
      source: 'Tradição iorubana',
      originPeriod: 'pré-colonial',
      creditLine: 'Sistema oracular iorubano com 16 búzios.',
    },
    culturalSensitivity: 5,
    sensitivityRationale:
      'Sistema oracular sagrado; prática requer iniciação formal.',
    isAppropriated: true,
    tags: ['ifá', 'búzios', 'odus', 'oráculo'],
    relatedSymbols: ['opon-ifa'],
  },

  // -------- Umbanda (1) --------
  {
    id: 'crucifix-umbanda',
    name: 'Crucifixo Umbandista',
    aliases: ['Crucifixo com pemba'],
    tradition: 'umbanda',
    subTradition: 'umbanda-caboclo',
    description:
      'Crucifixo cristão sincretizado com pemba (giz ritual) na Umbanda, representando a presença simultânea de Cristo e entidades afro-brasileiras (Caboclos, Pretos-Velhos).',
    meanings: ['Sincretismo cristão-afro-brasileiro', 'Proteção', 'Cura'],
    contexts: ['ritual', 'commemoration', 'illustration'],
    restrictions: ['attribution-required', 'permission-required', 'no-commercial'],
    variants: [
      {
        id: 'crucifix-pemba',
        name: 'Crucifixo com pemba',
        description: 'Cruz com riscos de pemba branca.',
        preferredContexts: ['ritual'],
      },
    ],
    attribution: {
      source: 'Tradição Umbandista brasileira',
      originPeriod: 'séc. XX',
      creditLine: 'Símbolo sincrético da Umbanda brasileira.',
    },
    culturalSensitivity: 4,
    sensitivityRationale:
      'Símbolo sincrético sensível; respeitar comunidades umbandistas.',
    isAppropriated: false,
    tags: ['umbanda', 'crucifixo', 'pemba', 'sincrético'],
    relatedSymbols: ['cross', 'oxala-symbol'],
  },

  // -------- Taoism (2) --------
  {
    id: 'yin-yang',
    name: 'Yin-Yang (Taijitu)',
    aliases: ['Taijitu', 'Tai Chi'],
    tradition: 'taoism',
    subTradition: 'none',
    description:
      'Diagrama circular representando a interdependência de opostos complementares (yin/yang). Central no taoísmo e na medicina tradicional chinesa.',
    meanings: ['Dualidade complementar', 'Equilíbrio cósmico', 'Fluxo do Tao'],
    contexts: ['meditation', 'illustration', 'jewelry', 'architecture', 'education'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'taijitu-classic',
        name: 'Taijitu clássico',
        description: 'Curva em S separando as metades com pequenos círculos.',
        preferredContexts: ['meditation', 'illustration'],
      },
    ],
    attribution: {
      source: 'Tradição taoísta, I Ching',
      originPeriod: 'séc. III a.C.',
      creditLine: 'Símbolo taoísta do yin-yang.',
    },
    culturalSensitivity: 2,
    sensitivityRationale: 'Amplamente usado na cultura; respeito ao contexto taoísta recomendado.',
    isAppropriated: true,
    tags: ['taoísmo', 'yin-yang', 'taijitu', 'equilíbrio'],
    relatedSymbols: ['bagua'],
  },
  {
    id: 'bagua',
    name: 'Bagua',
    aliases: ['Pakua', 'Os oito trigramas'],
    tradition: 'taoism',
    subTradition: 'none',
    description:
      'Diagrama dos oito trigramas (bagua) do I Ching, representando estados fundamentais da realidade. Combinado ao taijitu forma a base do feng shui.',
    meanings: ['Oito estados da mudança', 'Ordem cósmica', 'Feng shui'],
    contexts: ['meditation', 'illustration', 'architecture', 'education'],
    restrictions: ['attribution-required', 'no-modification'],
    variants: [
      {
        id: 'fushou-bagua',
        name: 'Bagua espelho',
        description: 'Versão octogonal usada em feng shui de proteção.',
        preferredContexts: ['architecture'],
      },
    ],
    attribution: {
      source: 'I Ching, tradição taoísta',
      originPeriod: 'séc. XI a.C.',
      creditLine: 'Símbolo taoísta dos oito trigramas.',
    },
    culturalSensitivity: 3,
    sensitivityRationale:
      'Símbolo complexo; respeitar tradições de feng shui.',
    isAppropriated: true,
    tags: ['taoísmo', 'bagua', 'iching', 'fengshui'],
    relatedSymbols: ['yin-yang'],
  },

  // -------- Indigenous Brazilian (3) --------
  {
    id: 'kene-huni-kuin',
    name: 'Kene Huni Kuin',
    aliases: ['Kene Kaxinawá', 'Padrões Huni Kuin'],
    tradition: 'indigenous',
    subTradition: 'huni-kuin',
    description:
      'Sistema gráfico do povo Huni Kuin (Kaxinawá) do Acre, Brasil. Padrões geométricos em linhas entrelaçadas representam narrativas, animais e plantas espirituais. Arte sagrada e identitária.',
    meanings: [
      'Identidade Huni Kuin',
      'História do povo',
      'Conexão com a floresta e espíritos',
    ],
    contexts: ['ceramic', 'illustration', 'education', 'tattoo'],
    restrictions: [
      'community-controlled',
      'permission-required',
      'attribution-required',
      'no-commercial',
    ],
    variants: [
      {
        id: 'kene-linear',
        name: 'Kene linear',
        description: 'Padrões com linhas finas entrelaçadas.',
        preferredContexts: ['ceramic', 'illustration'],
      },
      {
        id: 'kene-body',
        name: 'Kene corporal',
        description: 'Padrões aplicados ao corpo em grafismo.',
        preferredContexts: ['ritual'],
      },
    ],
    attribution: {
      source: 'Povo Huni Kuin (Kaxinawá), Terra Indígena Kaxinawá, Acre',
      originPeriod: 'tradição milenar',
      creditLine:
        'Arte gráfica do povo Huni Kuin — Terra Indígena Kaxinawá, Acre. Uso requer consulta à comunidade.',
      provenanceNotes:
        'Sistema gráfico registrado como patrimônio cultural. Cada padrão tem significado narrativo.',
    },
    culturalSensitivity: 5,
    sensitivityRationale:
      'Padrões são propriedade cultural; uso fora da comunidade requer autorização direta do povo Huni Kuin.',
    isAppropriated: true,
    tags: ['indígena', 'huni-kuin', 'kene', 'acre', 'povo-kaxinawá'],
    relatedSymbols: ['yawanawa-pattern', 'kraho-circle'],
  },
  {
    id: 'yawanawa-pattern',
    name: 'Padrão Yawanawá',
    aliases: ['Yawanawá kene', 'Padrões gráficos Yawanawá'],
    tradition: 'indigenous',
    subTradition: 'yawanawa',
    description:
      'Sistema gráfico do povo Yawanawá do Acre, Brasil. Padrões geométricos pintados no corpo e em objetos rituais. Cada motivo carrega uma história da floresta.',
    meanings: ['Identidade Yawanawá', 'Conexão com a floresta', 'História do povo'],
    contexts: ['ceramic', 'illustration', 'education', 'tattoo'],
    restrictions: [
      'community-controlled',
      'permission-required',
      'attribution-required',
      'no-commercial',
    ],
    variants: [
      {
        id: 'yawanawa-circular',
        name: 'Padrão circular Yawanawá',
        description: 'Motivos circulares concêntricos.',
        preferredContexts: ['illustration', 'ceramic'],
      },
    ],
    attribution: {
      source: 'Povo Yawanawá, Terra Indígena Yawanawá, Acre',
      originPeriod: 'tradição milenar',
      creditLine:
        'Padrões gráficos Yawanawá — Terra Indígena Yawanawá, Acre. Autorização comunitária obrigatória.',
    },
    culturalSensitivity: 5,
    sensitivityRationale:
      'Patrimônio cultural Yawanawá; uso requer autorização direta.',
    isAppropriated: true,
    tags: ['indígena', 'yawanawá', 'acre', 'povo-yawanawá'],
    relatedSymbols: ['kene-huni-kuin', 'kraho-circle'],
  },
  {
    id: 'kraho-circle',
    name: 'Círculo Krahô',
    aliases: ['Krahô circle', 'Pyka'],
    tradition: 'indigenous',
    subTradition: 'kraho',
    description:
      'Arranjo circular dos Krahô (povo Timbira do Tocantins), onde homens e mulheres se organizam em roda com cordões durante a corrida de tora (Pyka). Representa a dualidade complementar.',
    meanings: [
      'Dualidade complementar',
      'União dos clãs',
      'Ritual Pyka',
    ],
    contexts: ['ritual', 'education', 'illustration'],
    restrictions: [
      'community-controlled',
      'permission-required',
      'attribution-required',
      'no-commercial',
    ],
    variants: [
      {
        id: 'pyka-circle',
        name: 'Roda Pyka',
        description: 'Configuração ritual da corrida de tora.',
        preferredContexts: ['ritual'],
      },
    ],
    attribution: {
      source: 'Povo Krahô (Timbira), Tocantins, Brasil',
      originPeriod: 'tradição milenar',
      creditLine:
        'Arranjo cerimonial do povo Krahô — uso requer autorização comunitária.',
    },
    culturalSensitivity: 5,
    sensitivityRationale:
      'Configuração ritual Krahô; qualquer uso externo exige consentimento comunitário.',
    isAppropriated: true,
    tags: ['indígena', 'krahô', 'timbira', 'tocantins', 'pyka'],
    relatedSymbols: ['kene-huni-kuin'],
  },

  // -------- Syncretic/Egyptian (2) --------
  {
    id: 'ankh',
    name: 'Ankh (Egípcio)',
    aliases: ['Chave da Vida', 'Crux Ansata'],
    tradition: 'syncretic',
    subTradition: 'none',
    description:
      'Símbolo hieroglífico egípcio representando a vida eterna. Popular em religiões afro-diaspóricas e na cultura pop. Símbolo antigo compartilhado por Kemetismo e tradições esotéricas.',
    meanings: ['Vida eterna', 'Imortalidade', 'Respiração'],
    contexts: ['jewelry', 'illustration', 'architecture', 'meditation'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'ankh-plain',
        name: 'Ankh simples',
        description: 'Cruz com ansa superior.',
        preferredContexts: ['jewelry', 'illustration'],
      },
    ],
    attribution: {
      source: 'Iconografia egípcia antiga',
      originPeriod: '3000+ a.C.',
      creditLine: 'Símbolo egípcio da vida — ankh.',
    },
    culturalSensitivity: 3,
    sensitivityRationale: 'Símbolo antigo frequentemente apropriado pela cultura pop; crédito histórico importante.',
    isAppropriated: true,
    tags: ['egito', 'ankh', 'vida-eterna', 'sincrético'],
    relatedSymbols: ['eye-of-horus', 'hamsa'],
  },
  {
    id: 'eye-of-horus',
    name: 'Olho de Hórus',
    aliases: ['Wedjat', 'Udyat'],
    tradition: 'syncretic',
    subTradition: 'none',
    description:
      'Símbolo hieroglífico egípcio representando proteção, saúde e restauração. Associado ao deus Hórus. Usado em religiões afro-diaspóricas e keméticas modernas.',
    meanings: ['Proteção', 'Cura', 'Visão espiritual'],
    contexts: ['jewelry', 'illustration', 'architecture', 'meditation'],
    restrictions: ['attribution-required'],
    variants: [
      {
        id: 'wedjat-classic',
        name: 'Wedjat clássico',
        description: 'Olho estilizado com traços e marca de lágrima.',
        preferredContexts: ['jewelry', 'illustration'],
      },
    ],
    attribution: {
      source: 'Iconografia egípcia antiga',
      originPeriod: '3000+ a.C.',
      creditLine: 'Símbolo egípcio de proteção — Olho de Hórus / Wedjat.',
    },
    culturalSensitivity: 3,
    sensitivityRationale: 'Símbolo antigo; atribuição histórica necessária.',
    isAppropriated: true,
    tags: ['egito', 'olho', 'hórus', 'proteção'],
    relatedSymbols: ['ankh', 'hamsa'],
  },
];

/** Total de símbolos no registro (sincronizado com a constante acima). */
export const TOTAL_SYMBOLS: number = SACRED_SYMBOLS.length;

// ============================================================================
// ÍNDICE INTERNO — busca O(1) por ID
// ============================================================================

const SYMBOL_INDEX: ReadonlyMap<string, SacredSymbol> = new Map(
  SACRED_SYMBOLS.map((s) => [s.id, s] as const)
);

const TRADITION_INDEX: ReadonlyMap<SymbolTradition, readonly SacredSymbol[]> = (() => {
  const m = new Map<SymbolTradition, SacredSymbol[]>();
  for (const s of SACRED_SYMBOLS) {
    const list = m.get(s.tradition) ?? [];
    list.push(s);
    m.set(s.tradition, list);
  }
  return m;
})();

// ============================================================================
// ESTADO INTERNO — coleções, acessos, ledger (com seeds)
// ============================================================================

interface MutableCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  symbolIds: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const COLLECTIONS: Map<string, MutableCollection> = new Map();

const ACCESS_REQUESTS: Map<string, SymbolAccessRequest> = new Map();

const MISUSE_REPORTS: Map<string, SymbolMisuseReport> = new Map();

/** Ledger imutável de atribuições — checksum SHA-like simples. */
interface AttributionLedgerEntry {
  readonly symbolId: string;
  readonly source: string;
  readonly checksum: string;
  readonly verifiedAt: string;
}

const ATTRIBUTION_LEDGER: Map<string, AttributionLedgerEntry[]> = new Map();

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return `chk_${(h >>> 0).toString(16).padStart(8, '0')}`;
}

// Seed ledger with current attribution sources.
(function seedLedger(): void {
  for (const s of SACRED_SYMBOLS) {
    const entries: AttributionLedgerEntry[] = [
      {
        symbolId: s.id,
        source: s.attribution.source,
        checksum: simpleHash(s.attribution.source),
        verifiedAt: '2026-06-29T00:00:00Z',
      },
    ];
    ATTRIBUTION_LEDGER.set(s.id, entries);
  }
})();

// ============================================================================
// FUNÇÕES DE BUSCA / CONSULTA
// ============================================================================

/**
 * Busca símbolos por texto livre, tradição, contexto, sensibilidade.
 *
 * @param query Parâmetros de busca (vide `SymbolSearchQuery`).
 * @returns Resultado com símbolos e contagem total.
 * @throws `EmptySearchQueryError` se `text` for vazio quando fornecido.
 */
export function searchSymbols(query: SymbolSearchQuery): SymbolSearchResult {
  if (query.text !== undefined && query.text.trim().length === 0) {
    throw new EmptySearchQueryError();
  }
  const limit = Math.max(1, Math.min(query.limit ?? 50, 100));
  const textLower = query.text?.toLowerCase();
  const matches: SacredSymbol[] = [];

  for (const s of SACRED_SYMBOLS) {
    if (query.tradition && s.tradition !== query.tradition) continue;
    if (query.maxSensitivity !== undefined && s.culturalSensitivity > query.maxSensitivity) {
      continue;
    }
    if (query.context && !s.contexts.includes(query.context)) continue;
    if (query.onlyAppropriated === true && !s.isAppropriated) continue;
    if (query.communityControlledOnly === true) {
      const cc = s.restrictions.includes('community-controlled');
      if (!cc) continue;
    }
    if (textLower) {
      const haystack = [
        s.name,
        s.description,
        ...s.aliases,
        ...s.meanings,
        ...s.tags,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(textLower)) continue;
    }
    matches.push(s);
    if (matches.length >= limit) break;
  }

  return {
    symbols: matches,
    totalMatches: matches.length,
    query,
  };
}

/** Filtra símbolos por tradição. */
export function filterByTradition(tradition: SymbolTradition): readonly SacredSymbol[] {
  return TRADITION_INDEX.get(tradition) ?? [];
}

/** Filtra símbolos por sensibilidade máxima (inclusive). */
export function filterBySensitivity(level: CulturalSensitivityLevel): readonly SacredSymbol[] {
  return SACRED_SYMBOLS.filter((s) => s.culturalSensitivity <= level);
}

/** Filtra símbolos por contexto de uso. */
export function filterByContext(context: SymbolContextType): readonly SacredSymbol[] {
  return SACRED_SYMBOLS.filter((s) => s.contexts.includes(context));
}

/** Recupera um símbolo por ID; lança `SymbolNotFoundError` se não existir. */
export function getSymbolById(id: string): SacredSymbol {
  const sym = SYMBOL_INDEX.get(id);
  if (!sym) throw new SymbolNotFoundError(id);
  return sym;
}

/** Recupera um símbolo por ID ou `null` se não existir. */
export function tryGetSymbolById(id: string): SacredSymbol | null {
  return SYMBOL_INDEX.get(id) ?? null;
}

/** Retorna símbolos relacionados (cross-references do registro + busca por tradição). */
export function getRelatedSymbols(symbolId: string): readonly SacredSymbol[] {
  const sym = tryGetSymbolById(symbolId);
  if (!sym) return [];
  const out: SacredSymbol[] = [];
  const seen: Set<string> = new Set([symbolId]);
  // 1) Related from registry
  for (const rid of sym.relatedSymbols) {
    const other = SYMBOL_INDEX.get(rid);
    if (other && !seen.has(other.id)) {
      out.push(other);
      seen.add(other.id);
    }
  }
  // 2) Other symbols of same tradition
  for (const other of TRADITION_INDEX.get(sym.tradition) ?? []) {
    if (!seen.has(other.id)) {
      out.push(other);
      seen.add(other.id);
    }
  }
  return out;
}

// ============================================================================
// LOOKUP DE CONTEXTO + CHECAGEM DE USO APROPRIADO
// ============================================================================

const USE_CASE_CONTEXT_MAP: Readonly<Record<SymbolUseCase, SymbolContextType>> = {
  'meditation-app': 'meditation',
  'community-post': 'illustration',
  'educational-content': 'education',
  'commercial-product': 'digital-art',
  'tattoo-design': 'tattoo',
  'public-art': 'architecture',
  marketing: 'illustration',
  'personal-practice': 'ritual',
  'liturgical-use': 'liturgy',
  'academic-publication': 'education',
};

const USE_CASE_RESTRICTIONS: ReadonlyArray<{
  useCase: SymbolUseCase;
  forbids: SymbolRestriction[];
  warns: SymbolRestriction[];
}> = [
  {
    useCase: 'commercial-product',
    forbids: ['no-commercial', 'sacred-only', 'community-controlled'],
    warns: ['permission-required'],
  },
  {
    useCase: 'marketing',
    forbids: ['no-commercial', 'sacred-only', 'community-controlled'],
    warns: ['permission-required'],
  },
  {
    useCase: 'tattoo-design',
    forbids: ['no-tattoo', 'sacred-only', 'community-controlled', 'initiation-only'],
    warns: ['no-commercial'],
  },
  {
    useCase: 'public-art',
    forbids: ['community-controlled', 'sacred-only'],
    warns: ['permission-required'],
  },
];

/**
 * Retorna o contexto de uso de um símbolo (se o contexto é apropriado,
 * orientações e avisos).
 *
 * @throws `SymbolNotFoundError` se o símbolo não existir.
 */
export function getContext(
  symbolId: string,
  contextType: SymbolContextType
): SymbolContext {
  const sym = getSymbolById(symbolId);
  const isAppropriate = sym.contexts.includes(contextType);
  const warnings: string[] = [];

  if (sym.restrictions.includes('no-modification')) {
    warnings.push('Símbolo não deve ser modificado proporcionalmente.');
  }
  if (sym.restrictions.includes('attribution-required')) {
    warnings.push('Sempre atribuir fonte e tradição.');
  }
  if (sym.restrictions.includes('context-specific') && !isAppropriate) {
    warnings.push('Contexto não-canônico; requer justificativa educacional.');
  }
  if (sym.culturalSensitivity >= 4) {
    warnings.push('Símbolo de alta sensibilidade — exige consulta comunitária.');
  }
  if (sym.restrictions.includes('initiation-only')) {
    warnings.push('Uso restrito a pessoas iniciadas.');
  }

  return {
    symbolId: sym.id,
    contextType,
    isAppropriate,
    guidance: isAppropriate
      ? `O símbolo "${sym.name}" pode aparecer legitimamente em contexto ${contextType}.`
      : `O símbolo "${sym.name}" não é tradicionalmente usado em contexto ${contextType}.`,
    warnings,
  };
}

/**
 * Verifica se um caso de uso proposto é respeitoso para o símbolo.
 */
export function isAppropriate(symbolId: string, useCase: SymbolUseCase): AppropriatenessCheck {
  const sym = tryGetSymbolById(symbolId);
  if (!sym) {
    return {
      symbolId,
      useCase,
      isAppropriate: false,
      reason: 'Símbolo não encontrado no registro.',
      requiredActions: ['Verificar identificador do símbolo'],
    };
  }

  const requiredActions: string[] = [];
  const rule = USE_CASE_RESTRICTIONS.find((r) => r.useCase === useCase);
  const mappedContext = USE_CASE_CONTEXT_MAP[useCase];

  // Hard forbids
  if (rule) {
    for (const r of rule.forbids) {
      if (sym.restrictions.includes(r)) {
        return {
          symbolId,
          useCase,
          isAppropriate: false,
          reason: `Restrição "${r}" proíbe este caso de uso.`,
          requiredActions: [
            `Não usar "${sym.name}" para ${useCase}.`,
            ...(r === 'community-controlled'
              ? ['Solicitar autorização via requestAccess() à comunidade de origem.']
              : []),
          ],
        };
      }
    }
  }

  // Symbolic-level: no context match
  if (mappedContext && !sym.contexts.includes(mappedContext)) {
    requiredActions.push(`Fora do contexto simbólico tradicional (${mappedContext}).`);
  }

  // Warnings/escalation
  if (sym.culturalSensitivity >= 4) {
    requiredActions.push('Consultar comunidade de origem antes do uso.');
  }
  if (rule) {
    for (const w of rule.warns) {
      if (sym.restrictions.includes(w)) {
        requiredActions.push(`Obter permissão explícita (${w}).`);
      }
    }
  }
  if (sym.restrictions.includes('attribution-required')) {
    requiredActions.push('Exibir crédito da fonte.');
  }
  if (sym.isAppropriated) {
    requiredActions.push('Reconhecer história de apropriação cultural no contexto.');
  }

  const isOK = requiredActions.length === 0 || sym.contexts.includes(mappedContext);
  return {
    symbolId,
    useCase,
    isAppropriate: isOK,
    reason: isOK
      ? `Uso apropriado para ${useCase}, com cuidados documentados.`
      : `Uso requer as ações indicadas para "${sym.name}".`,
    requiredActions,
  };
}

// ============================================================================
// EQUIVALENTES SINCRÉTICOS
// ============================================================================

const SYNCRETIC_GROUPS: ReadonlyArray<SyncreticEquivalent> = [
  {
    symbolId: 'hamsa',
    sharedMeaning: 'Proteção contra o mau-olhado em cultura judaica e islâmica',
    traditionsInvolved: ['judaism', 'islam', 'syncretic'],
    notes:
      'A Hamsá é compartilhada entre judeus sefarditas (Mão de Miriam) e muçulmanos (Mão de Fátima) com pequenas variantes iconográficas.',
  },
  {
    symbolId: 'lotus',
    sharedMeaning: 'Pureza emergindo de águas turvas',
    traditionsInvolved: ['buddhism', 'hinduism'],
    notes:
      'A lótus tem papel importante tanto no budismo (símbolo do despertar) quanto no hinduísmo (símbolo da beleza transcendental e da morada de divindades como Lakshmi).',
  },
  {
    symbolId: 'om',
    sharedMeaning: 'Som primordial que permeia toda a existência',
    traditionsInvolved: ['hinduism', 'buddhism', 'sufi'],
    notes:
      'Embora primariamente hindu, "Om" é reconhecido por tradições budistas e encontrado em诵经 sufis como invocação.',
  },
  {
    symbolId: 'yin-yang',
    sharedMeaning: 'Dualidade complementar',
    traditionsInvolved: ['taoism', 'buddhism'],
    notes:
      'O taijitu permeia toda a cosmologia taoísta e entra no budismo Chan/Zen via interações históricas.',
  },
  {
    symbolId: 'crucifix-umbanda',
    sharedMeaning: 'Sincretismo cristão com tradições afro-brasileiras',
    traditionsInvolved: ['christianity', 'candomble', 'umbanda'],
    notes:
      'O crucifixo umbandista sintetiza tradição cristã com orixás e entidades.',
  },
  {
    symbolId: 'swastika',
    sharedMeaning: 'Auspiciosidade e movimento solar',
    traditionsInvolved: ['hinduism', 'buddhism', 'jainism'],
    notes:
      'Símbolo milenar compartilhado por hinduísmo, budismo e jainismo, com variantes dextrógiras e sinistrógiras.',
  },
];

/** Retorna equivalentes sincréticos de um símbolo. */
export function getSyncreticEquivalents(symbolId: string): readonly SyncreticEquivalent[] {
  return SYNCRETIC_GROUPS.filter((g) => g.symbolId === symbolId);
}

/** Lista todos os grupos sincréticos conhecidos. */
export function listSyncreticGroups(): readonly SyncreticEquivalent[] {
  return SYNCRETIC_GROUPS;
}

// ============================================================================
// SCORING DE SENSIBILIDADE + LEDGER DE ATRIBUIÇÃO
// ============================================================================

/**
 * Pontua a sensibilidade cultural 1-5 (1 = amplamente seguro, 5 = iniciação).
 * Lança `InvalidSensitivityLevelError` para entradas fora de 1-5.
 */
export function scoreSensitivity(symbolId: string): CulturalSensitivityLevel {
  const sym = tryGetSymbolById(symbolId);
  if (!sym) throw new SymbolNotFoundError(symbolId);
  const v = sym.culturalSensitivity;
  if (v < 1 || v > 5) throw new InvalidSensitivityLevelError(v);
  return v;
}

/** Recupera a atribuição (fonte + crédito) de um símbolo. */
export function getSymbolAttribution(symbolId: string): SymbolAttribution {
  const sym = getSymbolById(symbolId);
  return sym.attribution;
}

/**
 * Verifica se uma fonte fornecida corresponde à fonte registrada (origem).
 * Lança `InvalidAttributionSourceError` se diferente ou `AttributionLedgerTamperedError`
 * se o ledger tiver checksum inválido.
 */
export function verifyAttribution(symbolId: string, source: string): boolean {
  const ledger = ATTRIBUTION_LEDGER.get(symbolId);
  if (!ledger || ledger.length === 0) {
    throw new InvalidAttributionSourceError(symbolId, source);
  }
  for (const entry of ledger) {
    const expected = simpleHash(entry.source);
    if (entry.checksum !== expected) {
      throw new AttributionLedgerTamperedError(symbolId);
    }
    if (entry.source === source) return true;
  }
  throw new InvalidAttributionSourceError(symbolId, source);
}

/** Adiciona uma nova fonte ao ledger (não-substitui; append-only). */
export function addAttributionSource(symbolId: string, source: string): void {
  if (!SYMBOL_INDEX.has(symbolId)) throw new SymbolNotFoundError(symbolId);
  if (typeof source !== 'string' || source.trim().length === 0) {
    throw new InvalidAttributionSourceError(symbolId, source);
  }
  const list = ATTRIBUTION_LEDGER.get(symbolId) ?? [];
  list.push({
    symbolId,
    source: source.trim(),
    checksum: simpleHash(source.trim()),
    verifiedAt: new Date().toISOString(),
  });
  ATTRIBUTION_LEDGER.set(symbolId, list);
}

/** Lista entradas do ledger de atribuição de um símbolo. */
export function listAttributionEntries(symbolId: string): readonly AttributionLedgerEntry[] {
  return ATTRIBUTION_LEDGER.get(symbolId) ?? [];
}

// ============================================================================
// GESTÃO DE COLEÇÕES PESSOAIS (LGPD Art. 18 — export/deleção)
// ============================================================================

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Cria uma coleção pessoal de símbolos. LGPD Art. 18: titular pode
 * exportar/deletar a qualquer momento.
 */
export function createCollection(input: {
  userId: string;
  name: string;
  description?: string;
  symbolIds?: readonly string[];
  isPublic?: boolean;
}): SymbolCollection {
  const symbolIds: string[] = [];
  if (input.symbolIds) {
    for (const id of input.symbolIds) {
      if (!SYMBOL_INDEX.has(id)) {
        throw new SymbolNotFoundError(id);
      }
      symbolIds.push(id);
    }
  }
  const id = newId('col');
  const now = nowIso();
  const collection: MutableCollection = {
    id,
    userId: input.userId,
    name: input.name,
    description: input.description ?? '',
    symbolIds,
    isPublic: input.isPublic ?? false,
    createdAt: now,
    updatedAt: now,
  };
  COLLECTIONS.set(id, collection);
  return collection;
}

/** Adiciona um símbolo à coleção (não duplica). */
export function addToCollection(collectionId: string, symbolId: string): SymbolCollectionItem {
  const coll = COLLECTIONS.get(collectionId);
  if (!coll) throw new CollectionNotFoundError(collectionId);
  if (!SYMBOL_INDEX.has(symbolId)) throw new SymbolNotFoundError(symbolId);
  if (coll.symbolIds.includes(symbolId)) {
    throw new DuplicateCollectionItemError(collectionId, symbolId);
  }
  coll.symbolIds.push(symbolId);
  coll.updatedAt = nowIso();
  return {
    collectionId,
    symbolId,
    addedAt: nowIso(),
  };
}

/** Remove um símbolo da coleção. */
export function removeFromCollection(collectionId: string, symbolId: string): void {
  const coll = COLLECTIONS.get(collectionId);
  if (!coll) throw new CollectionNotFoundError(collectionId);
  const idx = coll.symbolIds.indexOf(symbolId);
  if (idx === -1) {
    throw new SymbolNotFoundError(symbolId);
  }
  coll.symbolIds.splice(idx, 1);
  coll.updatedAt = nowIso();
}

/** Lista coleções de um usuário. */
export function listCollections(userId: string): readonly SymbolCollection[] {
  return Array.from(COLLECTIONS.values()).filter((c) => c.userId === userId);
}

/** Recupera uma coleção por ID. */
export function getCollection(collectionId: string): SymbolCollection {
  const coll = COLLECTIONS.get(collectionId);
  if (!coll) throw new CollectionNotFoundError(collectionId);
  return coll;
}

/** Compartilha uma coleção (muda visibilidade para pública). */
export function shareCollection(collectionId: string): SymbolCollection {
  const coll = COLLECTIONS.get(collectionId);
  if (!coll) throw new CollectionNotFoundError(collectionId);
  (coll as MutableCollection).isPublic = true;
  coll.updatedAt = nowIso();
  return coll;
}

/**
 * Exporta uma coleção em formato portável (LGPD Art. 18, direito de portabilidade).
 * Retorna um objeto JSON-serializável.
 */
export function exportCollection(collectionId: string): {
  collection: SymbolCollection;
  symbols: readonly SacredSymbol[];
  exportedAt: string;
  format: 'json';
} {
  const coll = COLLECTIONS.get(collectionId);
  if (!coll) throw new CollectionNotFoundError(collectionId);
  const symbols: SacredSymbol[] = [];
  for (const id of coll.symbolIds) {
    const sym = SYMBOL_INDEX.get(id);
    if (sym) symbols.push(sym);
  }
  return {
    collection: coll,
    symbols,
    exportedAt: nowIso(),
    format: 'json',
  };
}

/** Deleta uma coleção (LGPD Art. 18, direito ao esquecimento). */
export function deleteCollection(collectionId: string): boolean {
  return COLLECTIONS.delete(collectionId);
}

// ============================================================================
// COMUNIDADE-CONTROLADA + SOLICITAÇÃO DE ACESSO
// ============================================================================

/** Indica se o símbolo é controlado pela comunidade de origem. */
export function isCommunityControlled(symbolId: string): boolean {
  const sym = tryGetSymbolById(symbolId);
  if (!sym) return false;
  return sym.restrictions.includes('community-controlled');
}

/**
 * Solicita acesso a símbolo controlado pela comunidade.
 * Retorna o pedido criado com `status: 'pending'`.
 */
export function requestAccess(input: {
  symbolId: string;
  requesterId: string;
  purpose: string;
}): SymbolAccessRequest {
  if (!SYMBOL_INDEX.has(input.symbolId)) {
    throw new SymbolNotFoundError(input.symbolId);
  }
  if (!isCommunityControlled(input.symbolId)) {
    throw new SymbolRegistryError(
      `Símbolo ${input.symbolId} não é controlado por comunidade.`
    );
  }
  const id = newId('acc');
  const req: SymbolAccessRequest = {
    id,
    symbolId: input.symbolId,
    requesterId: input.requesterId,
    purpose: input.purpose,
    status: 'pending',
  };
  ACCESS_REQUESTS.set(id, req);
  return req;
}

/** Concede um pedido de acesso. */
export function grantAccess(requestId: string, decidedBy: string): SymbolAccessRequest {
  const req = ACCESS_REQUESTS.get(requestId);
  if (!req) throw new SymbolRegistryError(`Pedido de acesso não encontrado: ${requestId}`);
  const updated: SymbolAccessRequest = {
    ...req,
    status: 'granted',
    decidedBy,
    decidedAt: nowIso(),
  };
  ACCESS_REQUESTS.set(requestId, updated);
  return updated;
}

/** Nega um pedido de acesso. */
export function denyAccess(requestId: string, decidedBy: string): SymbolAccessRequest {
  const req = ACCESS_REQUESTS.get(requestId);
  if (!req) throw new SymbolRegistryError(`Pedido de acesso não encontrado: ${requestId}`);
  const updated: SymbolAccessRequest = {
    ...req,
    status: 'denied',
    decidedBy,
    decidedAt: nowIso(),
  };
  ACCESS_REQUESTS.set(requestId, updated);
  return updated;
}

/** Lista pedidos de acesso pendentes (para moderadores). */
export function listPendingAccessRequests(): readonly SymbolAccessRequest[] {
  return Array.from(ACCESS_REQUESTS.values()).filter((r) => r.status === 'pending');
}

// ============================================================================
// RELATOS DE USO INDEVIDO (link para moderation queue)
// ============================================================================

/** Reporta uso indevido de um símbolo. Liga-se a w45/admin-moderation-queue. */
export function reportMisuse(input: {
  symbolId: string;
  contextDescription: string;
  contextUrl?: string;
  reportedBy?: string;
  severity?: SymbolMisuseReport['severity'];
}): SymbolMisuseReport {
  if (!SYMBOL_INDEX.has(input.symbolId)) {
    throw new SymbolNotFoundError(input.symbolId);
  }
  const report: SymbolMisuseReport = {
    id: newId('mis'),
    symbolId: input.symbolId,
    contextUrl: input.contextUrl,
    contextDescription: input.contextDescription,
    reportedBy: input.reportedBy,
    reportedAt: nowIso(),
    severity: input.severity ?? 'medium',
  };
  MISUSE_REPORTS.set(report.id, report);
  return report;
}

/** Lista relatos de uso indevido (para fila de moderação). */
export function listMisuseReports(): readonly SymbolMisuseReport[] {
  return Array.from(MISUSE_REPORTS.values());
}

// ============================================================================
// RENDERIZAÇÃO — especificações para UI consumers
// ============================================================================

const DEFAULT_RENDER_SPEC: SymbolRenderSpec = {
  symbolId: '__default__',
  minWidthPx: 64,
  minHeightPx: 64,
  colorProfile: 'monochrome',
  doNotModify: ['Preservar proporções originais'],
  safeAreaRules: ['Margem mínima de 10% da largura do símbolo'],
  backgroundAllowed: ['transparente', 'neutro claro', 'neutro escuro'],
  notes: 'Especificação padrão para símbolos sem restrição.',
};

/** Retorna a especificação de renderização para um símbolo. */
export function getRenderSpec(symbolId: string): SymbolRenderSpec {
  const sym = tryGetSymbolById(symbolId);
  if (!sym) return DEFAULT_RENDER_SPEC;

  const minWidthPx = sym.culturalSensitivity >= 4 ? 128 : 64;
  const minHeightPx = minWidthPx;
  const colorProfile: SymbolRenderSpec['colorProfile'] =
    sym.tradition === 'taoism'
      ? 'duotone'
      : sym.tradition === 'christianity' || sym.tradition === 'hinduism'
      ? 'full-color'
      : 'monochrome';

  const doNotModify: string[] = [];
  if (sym.restrictions.includes('no-modification')) {
    doNotModify.push('Não modificar proporções canônicas');
    doNotModify.push('Não alterar orientação');
  }
  if (sym.tradition === 'hinduism' || sym.tradition === 'buddhism') {
    doNotModify.push('Não mesclar com símbolos de outras tradições sem contexto');
  }

  const safeAreaRules = [
    'Manter área de respiro mínima ao redor',
    'Não cobrir parcialmente com outros elementos',
  ];
  if (sym.culturalSensitivity >= 4) {
    safeAreaRules.push('Não combinar com símbolos de outra tradição no mesmo frame');
  }

  const backgroundAllowed =
    sym.tradition === 'candomble' || sym.tradition === 'ifa'
      ? ['branco', 'vermelho', 'azul escuro']
      : ['transparente', 'neutro claro', 'neutro escuro'];

  const notes =
    sym.culturalSensitivity >= 4
      ? 'Símbolo de alta sensibilidade — renderizar somente em contexto educacional ou espiritual explícito.'
      : sym.restrictions.includes('attribution-required')
      ? 'Sempre exibir crédito da fonte próximo à imagem.'
      : 'Símbolo de uso moderado.';

  return {
    symbolId: sym.id,
    minWidthPx,
    minHeightPx,
    colorProfile,
    doNotModify,
    safeAreaRules,
    backgroundAllowed,
    notes,
  };
}

// ============================================================================
// I18N — nomes localizados
// ============================================================================

/**
 * Recupera o nome localizado do símbolo no idioma solicitado.
 * Faz fallback para pt-BR se a chave não existir.
 */
export function getLocalizedName(symbolId: string, locale: SupportedLocale): string {
  const key = `symbol.${symbolId.replace(/-/g, '.').replace(/\./g, '.')}`;
  const table = LOCALIZED_NAMES[locale];
  const direct = (table as Record<string, string>)[key];
  if (direct) return direct;
  const fallback = (LOCALIZED_NAMES['pt-BR'] as Record<string, string>)[key];
  if (fallback) return fallback;
  const sym = SYMBOL_INDEX.get(symbolId);
  return sym ? sym.name : symbolId;
}

/** Lista todos os locale disponíveis. */
export function listSupportedLocales(): readonly SupportedLocale[] {
  return ['pt-BR', 'en-US', 'es-ES'];
}

// ============================================================================
// SMOKE TESTS
// ============================================================================

interface SmokeResult {
  readonly name: string;
  readonly ok: boolean;
  readonly detail?: string;
}

/**
 * Suite rápida de validação interna (não substitui testes completos).
 * Útil para verificar carregamento correto em build/dev.
 */
export function runSmokeTests(): { passed: number; failed: number; results: readonly SmokeResult[] } {
  const results: SmokeResult[] = [];
  const push = (name: string, ok: boolean, detail?: string) => {
    results.push({ name, ok, detail });
  };

  // 1) Registry has at least 30 symbols
  push('registry.count', SACRED_SYMBOLS.length >= 30, `count=${SACRED_SYMBOLS.length}`);

  // 2) All required traditions represented
  const required: SymbolTradition[] = [
    'christianity',
    'islam',
    'judaism',
    'buddhism',
    'hinduism',
    'candomble',
    'ifa',
    'taoism',
    'indigenous',
  ];
  for (const t of required) {
    push(
      `tradition.${t}`,
      (TRADITION_INDEX.get(t) ?? []).length > 0,
      `${(TRADITION_INDEX.get(t) ?? []).length} symbols`
    );
  }

  // 3) getSymbolById works / throws
  try {
    const c = getSymbolById('cross');
    push('get.byId.cross', c.id === 'cross');
  } catch {
    push('get.byId.cross', false);
  }
  let notFound = false;
  try {
    getSymbolById('non-existent');
  } catch (e) {
    notFound = e instanceof SymbolNotFoundError;
  }
  push('get.byId.notFound', notFound);

  // 4) search filters work
  const christianityHits = filterByTradition('christianity').length;
  push('search.tradition', christianityHits > 0, `${christianityHits} hits`);
  const safeHits = filterBySensitivity(2).length;
  push('search.sensitivity', safeHits > 0, `${safeHits} hits at level<=2`);
  const lotusHits = filterByContext('meditation').filter((s) => s.id === 'lotus').length;
  push('search.context.lotus', lotusHits === 1);

  // 5) Search by text
  try {
    const r = searchSymbols({ text: 'lótus' });
    push('search.text.lotus', r.totalMatches >= 1, `${r.totalMatches} matches`);
  } catch (e) {
    push('search.text.lotus', false, e instanceof Error ? e.message : 'unknown');
  }

  // 6) isAppropriate rules
  const cMark = isAppropriate('cross', 'community-post');
  push('appropriateness.cross.community', cMark.isAppropriate);
  const kMark = isAppropriate('kene-huni-kuin', 'commercial-product');
  push('appropriateness.kene.commercial', !kMark.isAppropriate);

  // 7) getContext
  const ctx = getContext('cross', 'architecture');
  push('context.cross.architecture', ctx.isAppropriate);
  const ctxBad = getContext('opon-ifa', 'jewelry');
  push('context.opon.jewelry.inappropriate', !ctxBad.isAppropriate);

  // 8) Sensitivity scoring
  const senOp = scoreSensitivity('opon-ifa');
  push('sensitivity.opon', senOp >= 4);

  // 9) Syncretic equivalents exist
  const syn = getSyncreticEquivalents('hamsa');
  push('syncretic.hamsa', syn.length > 0);

  // 10) Attribution
  const attr = getSymbolAttribution('cross');
  push('attribution.cross', attr.source.length > 0);
  try {
    const ok = verifyAttribution('cross', attr.source);
    push('verify.attribution.match', ok);
  } catch (e) {
    push('verify.attribution.match', false, e instanceof Error ? e.message : 'unknown');
  }

  // 11) Localized names
  const name = getLocalizedName('cross', 'en-US');
  push('i18n.cross.en', name.toLowerCase().includes('cross'));
  const nameEs = getLocalizedName('cross', 'es-ES');
  push('i18n.cross.es', nameEs.toLowerCase().includes('cruz'));

  // 12) Community-controlled
  push('community.kene.isCC', isCommunityControlled('kene-huni-kuin'));
  push('community.cross.notCC', !isCommunityControlled('cross'));

  // 13) Render spec
  const spec = getRenderSpec('kene-huni-kuin');
  push('render.kene.high', spec.minWidthPx >= 128);

  // 14) Collection lifecycle
  const col = createCollection({
    userId: 'user-1',
    name: 'Minha Coleção',
    symbolIds: ['cross', 'lotus'],
  });
  push('collection.create', col.symbolIds.length === 2);
  const item = addToCollection(col.id, 'tree-of-life');
  push('collection.add', item.symbolId === 'tree-of-life');
  removeFromCollection(col.id, 'lotus');
  const after = getCollection(col.id);
  push('collection.remove', after.symbolIds.length === 2 && !after.symbolIds.includes('lotus'));

  // 15) Misuse report
  const report = reportMisuse({
    symbolId: 'kene-huni-kuin',
    contextDescription: 'uso sem crédito em embalagem',
    severity: 'high',
  });
  push('misuse.report', report.id.length > 0);

  // 16) Empty search throws
  let emptyThrew = false;
  try {
    searchSymbols({ text: '' });
  } catch (e) {
    emptyThrew = e instanceof EmptySearchQueryError;
  }
  push('search.empty.throws', emptyThrew);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  return { passed, failed, results };
}

// ============================================================================
// EXPORT AUXILIAR PARA MÓDULOS CONSUMIDORES
// ============================================================================

/** Sumário agregado do registro, útil para dashboards. */
export function getRegistrySummary(): {
  total: number;
  byTradition: Readonly<Record<string, number>>;
  bySensitivity: Readonly<Record<string, number>>;
  communityControlledCount: number;
  appropriatedCount: number;
} {
  const byTradition: Record<string, number> = {};
  const bySensitivity: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  let communityControlledCount = 0;
  let appropriatedCount = 0;
  for (const s of SACRED_SYMBOLS) {
    byTradition[s.tradition] = (byTradition[s.tradition] ?? 0) + 1;
    bySensitivity[String(s.culturalSensitivity)] += 1;
    if (s.restrictions.includes('community-controlled')) communityControlledCount += 1;
    if (s.isAppropriated) appropriatedCount += 1;
  }
  return {
    total: SACRED_SYMBOLS.length,
    byTradition,
    bySensitivity,
    communityControlledCount,
    appropriatedCount,
  };
}

/** Versão do registry (semver). */
export const REGISTRY_VERSION: string = '1.0.0';
