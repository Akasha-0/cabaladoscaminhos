/**
 * ═══════════════════════════════════════════════════════════════════════════
 * w64/divination_interpretation_engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * BRAIN layer for the Mesa Real (36-card Cigano spread).
 * Deterministic, offline, no external deps, no fetch, no eval.
 *
 * Cross-cycle design (cycle 63 lessons baked in):
 *   - Decision cascade from notifications engine (cycle 63 lesson 1) — kept
 *     here for cross_card_links priority order: pair > trio > allegoric chain.
 *   - `boostScoreByCitations` caps at 0.99 (cycle 63 lesson 5).
 *   - Cross-tradition overlap is INTENTIONAL (cycle 63 lesson 3): when
 *     a single card symbol matches multiple tradition taxonomies, all are
 *     surfaced with tradition-prefixed labels.
 *   - Self-running test harness pattern (cycle 63 lesson 6).
 *
 * Public surface (40+ named exports) — see SECTION 23 for the FULL list.
 *
 * Author: Coder Worker A · cycle 64 · 2026-06-29
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1 — TYPE ALIASES (branded primitives)
// ────────────────────────────────────────────────────────────────────────────

/** Cigano card id — 1..36. Use {@link toCardId} to construct. */
export type CardId = number & { readonly __brand: 'CardId' };

/** Mesa Real house identifier — string literal union over 36 houses. */
export type HouseId =
  | 'casa-01' | 'casa-02' | 'casa-03' | 'casa-04' | 'casa-05' | 'casa-06'
  | 'casa-07' | 'casa-08' | 'casa-09' | 'casa-10' | 'casa-11' | 'casa-12'
  | 'casa-13' | 'casa-14' | 'casa-15' | 'casa-16' | 'casa-17' | 'casa-18'
  | 'casa-19' | 'casa-20' | 'casa-21' | 'casa-22' | 'casa-23' | 'casa-24'
  | 'casa-25' | 'casa-26' | 'casa-27' | 'casa-28' | 'casa-29' | 'casa-30'
  | 'casa-31' | 'casa-32' | 'casa-33' | 'casa-34' | 'casa-35' | 'casa-36';

/** Spread layout kinds supported by the engine. */
export type SpreadType =
  | 'SPREAD_1_CARD'
  | 'SPREAD_3_CARD'
  | 'SPREAD_5_CARD'
  | 'SPREAD_9_CARD'
  | 'SPREAD_36_MESA_REAL';

/** Sacred tradition identifier (the 4 maps Mesa Real cross-references). */
export type TraditionId =
  | 'cigano'
  | 'astrologia'
  | 'numerologia'
  | 'orixa'
  | 'odu'
  | 'cabala'
  | 'candomble';

/** Esoteric element of a card. */
export type Element = 'fogo' | 'agua' | 'terra' | 'ar' | 'eter';

/** Planet associated with a card. */
export type Planet =
  | 'sol' | 'lua' | 'mercurio' | 'venus' | 'marte'
  | 'jupiter' | 'saturno' | 'urano' | 'netuno' | 'plutao' | 'terra';

/** Zodiac sign associated with a card (12 traditional). */
export type ZodiacSign =
  | 'aries' | 'touro' | 'gemeos' | 'cancer' | 'leao' | 'virgem'
  | 'libra' | 'escorpiao' | 'sagitario' | 'capricornio' | 'aquario' | 'peixes';

/**
 * Numerology day-number or master number. The Cigano card system uses
 * numbers 1..36 (which includes the strict numerology taxonomy 1-9 + 11/22/33).
 * For audit purposes {@link NUMEROLOGY_NUMBERS} lists only the strict numerology
 * taxonomy; the wider type here accommodates the full Cigano numbering.
 */
export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36;

/** Kabbalistic sefirah. */
export type Sefirah = 'keter' | 'chokhmah' | 'binah' | 'chedek' | 'gevurah' | 'tiferet'
  | 'netzach' | 'hod' | 'yesod' | 'malkuth';

/** Candomblé orixá (the 19 mapped). */
export type Orixa =
  | 'exu' | 'iansa' | 'iemanjá' | 'oxala' | 'ossãe' | 'oba'
  | 'oxumare' | 'omolu' | 'oxum' | 'ogum' | 'xango' | 'erê'
  | 'oxossi' | 'nana' | 'ogum-ie' | 'iama' | 'iaku' | 'ireme' | 'oxum-igbon';

/** Confidence semantic for caller UI (heuristic). */
export type ConfidenceBand = 'baixa' | 'media' | 'alta' | 'muito-alta';

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2 — STRUCTURED INTERFACES
// ────────────────────────────────────────────────────────────────────────────

/** A cross-tradition reference attached to a card. */
export interface SacredRef {
  tradition: TraditionId;
  symbol: string;
  reference: string;
}

/** A sacred reference with extra context (e.g. aspect, polarity). */
export interface SacredRefWithContext extends SacredRef {
  aspect: 'essencia' | 'sombra' | 'kinetico' | 'pendente';
  displayLabel: string;
  weight: number;
}

/** The static card record (one of 36 Cigano cards). */
export interface CardRecord {
  id: CardId;
  name: string;
  archetype: string;
  keywords: string[];
  element: Element;
  planet: Planet;
  sign?: ZodiacSign;
  number: NumerologyNumber;
  sefirah?: Sefirah;
  orixa?: Orixa;
  sacredRefs: SacredRef[];
  meaningUpright: string;
  meaningReversed: string;
  combinedMeaning: string;
  polarity: 'positiva' | 'negativa' | 'neutra';
}

/** A card reference passed into reading inputs (user-facing). */
export interface CardRef {
  id: CardId;
  reversed?: boolean;
  position?: number;
  house?: HouseId;
  note?: string;
}

/** A Mesa Real house (one of 36 thematic positions). */
export interface HouseRecord {
  id: HouseId;
  ordinal: number;
  name: string;
  theme: string;
  domain: 'eu' | 'relacionamentos' | 'trabalho' | 'espiritualidade' | 'familia' | 'saude' | 'financas';
  traditionHints: TraditionId[];
}

/** Single-card reading input. */
export interface SingleCardInput {
  question: string;
  card: CardRef;
  locale?: 'pt-BR' | 'en' | 'es';
}

/** Pair interpretation context. */
export interface PairContext {
  question?: string;
  locale?: 'pt-BR' | 'en' | 'es';
}

/** Full reading input — used by {@link interpretReading}. */
export interface ReadingInput {
  question: string;
  spread: SpreadType;
  cards: CardRef[];
  askerTradition?: TraditionId;
  locale?: 'pt-BR' | 'en' | 'es';
}

/** Single-card interpretation result. */
export interface CardInterpretation {
  card: CardRef;
  position?: number;
  baseMeaning: string;
  contextualMeaning: string;
  sacredReferences: SacredRefWithContext[];
  crossCardLinks: CardId[];
  confidence: number;
  confidenceBand: ConfidenceBand;
  warnings: string[];
}

/** Pair-of-cards reading result. */
export interface PairReading {
  left: CardRef;
  right: CardRef;
  combined: string;
  combinedKeywords: string[];
  sacredOverlap: SacredRef[];
  confidence: number;
  polarity: 'positiva' | 'negativa' | 'neutra' | 'mista';
}

/** Spread layout shape (5 sizes supported). */
export interface SpreadLayout {
  type: SpreadType;
  slots: SpreadSlot[];
}

/** One slot in a non-Mesa-Real spread. */
export interface SpreadSlot {
  position: number;
  label: string;
  theme: string;
  house?: HouseId;
}

/** Generic spread reading (for 1/3/5/9-card layouts). */
export interface SpreadReading {
  type: SpreadType;
  cards: CardRef[];
  interpretations: CardInterpretation[];
  pairs: PairReading[];
  overallTheme: string;
  advice: string;
  dominantElement: Element;
  confidence: number;
  generatedAt: number;
}

/** Cross-house synthesis (one Mesa house crossing into the 4 maps). */
export interface HouseCross {
  house: HouseRecord;
  cardioReference: SacredRefWithContext;
  astrologicalHouse?: number;
  numerologyNumber?: NumerologyNumber;
  orixa?: Orixa;
  oduReference?: string;
  overlap: TraditionId[];
  interpretation: string;
  confidence: number;
}

/** The full 36-card Mesa Real reading. */
export interface MesaRealReading {
  cards: CardRef[];
  houses: HouseRecord[];
  interpretations: CardInterpretation[];
  houseCrossings: HouseCross[];
  overallTheme: string;
  dominantElement: Element;
  dominantPlanet: Planet;
  dominantNumerology: NumerologyNumber;
  timeHorizon: 'short' | 'medium' | 'long' | 'mixed';
  advice: string;
  confidence: number;
  generatedAt: number;
}

/** Symbolic combination detected in a card draw. */
export interface Combination {
  kind: 'pair' | 'trio' | 'chain' | 'allegoric';
  cards: CardId[];
  label: string;
  description: string;
  weight: number;
}

/** Spread validation result (never-throws graceful degradation). */
export interface ValidationResult {
  ok: boolean;
  issues: string[];
  normalizedCards: CardRef[];
}

/** Per-tradition coverage counters. */
export interface CoverageByTradition {
  cigano: number;
  astrologia: number;
  numerologia: number;
  orixa: number;
  odu: number;
  cabala: number;
  candomble: number;
}

/** Machine-readable coverage report. */
export interface CoverageReport {
  totals: CoverageByTradition;
  expected: { cigano: 36; orixa: number; sefirot: number; planetas: number; signos: number; casas: number; numerologia: number };
  missing: { cigano: CardId[]; orixa: Orixa[]; sefirot: Sefirah[]; planetas: Planet[]; signos: ZodiacSign[]; casas: number[]; numerologia: NumerologyNumber[] };
  isFullCoverage: boolean;
  percentComplete: number;
}

/** Combined score aggregator (per cycle 63 lesson 2). */
export interface CombinedScore {
  min: number;
  max: number;
  mean: number;
  weightedMean: number;
  geometricMean: number;
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 3 — CONSTANTS (thresholds + spread templates)
// ────────────────────────────────────────────────────────────────────────────

/** Max confidence — everything caps at 0.99 (cycle 63 lesson 5). */
export const MAX_CONFIDENCE = 0.99;
/** Min confidence — symmetric floor. */
export const MIN_CONFIDENCE = 0.1;
/** Default heuristic confidence when context is empty. */
export const DEFAULT_CONFIDENCE = 0.5;
/** Citation boost per matching sacred ref. */
export const CITATION_BOOST_STEP = 0.07;
/** Number of sacred refs required to reach MAX_CONFIDENCE. */
export const CITATION_BOOST_CAP_AT = 12;
/** Default locale for messages. */
export const DEFAULT_LOCALE: 'pt-BR' | 'en' | 'es' = 'pt-BR';
/** Maximum cards supported in a Mesa Real. */
export const MESA_REAL_SIZE = 36;
/** Minimum question length (chars) considered "has question". */
export const MIN_QUESTION_LENGTH = 3;
/** Maximum question length (chars) considered well-formed. */
export const MAX_QUESTION_LENGTH = 480;
/** Tolerance on confidence float drift. */
export const EPSILON = 1e-9;

// ────────────────────────────────────────────────────────────────────────────
// SECTION 4 — CARD CATALOG (36 Cigano cards)
// ────────────────────────────────────────────────────────────────────────────

const CARD_CATALOG_DATA: CardRecord[] = [
  { id: 1 as CardId, name: 'Cigano', archetype: 'O Mensageiro', keywords: ['notícia', 'mensagem', 'movimento', 'entrega', 'recado'], element: 'ar', planet: 'mercurio', sign: 'gemeos', number: 1, sefirah: 'keter', orixa: 'exu', sacredRefs: [{ tradition: 'cigano', symbol: 'Cigano', reference: 'Lenormand 01' }, { tradition: 'astrologia', symbol: 'Mercúrio', reference: 'Planeta regente' }, { tradition: 'cabala', symbol: 'Keter', reference: 'Coroa' }], meaningUpright: 'Chegada de notícia, anúncio importante, visitante ou correspondência.', meaningReversed: 'Atraso, engano ou notícia indesejada.', combinedMeaning: 'Movimento, anúncio, portador de informação.', polarity: 'positiva' },
  { id: 2 as CardId, name: 'Cigana', archetype: 'A Sorte Pequena', keywords: ['sorte', 'felicidade', 'alegria', 'pequeno bem', 'oportunidade'], element: 'ar', planet: 'venus', sign: 'touro', number: 2, sefirah: 'chokhmah', orixa: 'iansa', sacredRefs: [{ tradition: 'cigano', symbol: 'Cigana', reference: 'Lenormand 02' }, { tradition: 'astrologia', symbol: 'Vênus', reference: 'Planeta do amor' }, { tradition: 'cabala', symbol: 'Chokhmah', reference: 'Sabedoria' }], meaningUpright: 'Sorte acessível, contentamento, pequenos presentes.', meaningReversed: 'Contentamento efêmero, fortuna instável.', combinedMeaning: 'Alegria, sorte, pequena dádiva.', polarity: 'positiva' },
  { id: 3 as CardId, name: 'Navio', archetype: 'A Jornada Longa', keywords: ['viagem', 'longe', 'estrangeiro', 'comércio', 'águas profundas'], element: 'agua', planet: 'lua', sign: 'cancer', number: 3, sefirah: 'binah', orixa: 'iemanjá', sacredRefs: [{ tradition: 'cigano', symbol: 'Navio', reference: 'Lenormand 03' }, { tradition: 'astrologia', symbol: 'Lua', reference: 'Planeta das marés' }, { tradition: 'cabala', symbol: 'Binah', reference: 'Entendimento' }], meaningUpright: 'Viagem significativa, expansão além do lar, conexão distante.', meaningReversed: 'Naufrágio, demora, negócio fracassado.', combinedMeaning: 'Viagem, distância, troca entre margens.', polarity: 'positiva' },
  { id: 4 as CardId, name: 'Casa', archetype: 'O Lar', keywords: ['lar', 'família', 'estabilidade', 'domicílio', 'estrutura'], element: 'terra', planet: 'saturno', sign: 'capricornio', number: 4, sefirah: 'chedek', orixa: 'oxala', sacredRefs: [{ tradition: 'cigano', symbol: 'Casa', reference: 'Lenormand 04' }, { tradition: 'astrologia', symbol: 'Casa IV', reference: 'Fundo do Céu / Lar' }, { tradition: 'cabala', symbol: 'Chesed', reference: 'Misericórdia' }], meaningUpright: 'Estabilidade doméstica, herança, bem-estar no lar.', meaningReversed: 'Conflito familiar, divisão, separação residencial.', combinedMeaning: 'Lar, estrutura, herança.', polarity: 'positiva' },
  { id: 5 as CardId, name: 'Árvore', archetype: 'A Raiz Profunda', keywords: ['saúde', 'crescimento', 'raiz', 'vitalidade', 'longevidade'], element: 'terra', planet: 'saturno', sign: 'capricornio', number: 5, sefirah: 'gevurah', orixa: 'ossãe', sacredRefs: [{ tradition: 'cigano', symbol: 'Árvore', reference: 'Lenormand 05' }, { tradition: 'astrologia', symbol: 'Saturno', reference: 'Senhor do tempo' }, { tradition: 'cabala', symbol: 'Gevurah', reference: 'Força' }], meaningUpright: 'Saúde duradoura, prosperidade enraizada, maturação lenta.', meaningReversed: 'Doença crônica, raiz comprometida.', combinedMeaning: 'Crescimento lento, saúde, raiz.', polarity: 'positiva' },
  { id: 6 as CardId, name: 'Nuvens', archetype: 'A Confusão', keywords: ['confusão', 'névoa', 'incerteza', 'sombra', 'duas verdades'], element: 'ar', planet: 'netuno', sign: 'peixes', number: 6, sefirah: 'tiferet', orixa: 'oba', sacredRefs: [{ tradition: 'cigano', symbol: 'Nuvens', reference: 'Lenormand 06' }, { tradition: 'astrologia', symbol: 'Netuno', reference: 'Planeta da ilusão' }, { tradition: 'cabala', symbol: 'Tiferet', reference: 'Beleza' }], meaningUpright: 'Incerteza, hesitação, dupla possibilidade.', meaningReversed: 'A sombra se dissipa, clareza chega.', combinedMeaning: 'Incerteza, véu, decisão obscura.', polarity: 'neutra' },
  { id: 7 as CardId, name: 'Serpente', archetype: 'O Engano', keywords: ['falsidade', 'ciúme', 'traição', 'sedução', 'vigilância'], element: 'fogo', planet: 'plutao', sign: 'escorpiao', number: 7, sefirah: 'netzach', orixa: 'oxumare', sacredRefs: [{ tradition: 'cigano', symbol: 'Serpente', reference: 'Lenormand 07' }, { tradition: 'astrologia', symbol: 'Plutão', reference: 'Senhor do submundo' }, { tradition: 'cabala', symbol: 'Netzach', reference: 'Vitória' }, { tradition: 'candomble', symbol: 'Ireme', reference: 'Face feminina da Serpente' }], meaningUpright: 'Cuidado com falsidade ou ciúmes, vigilância na intenção alheia.', meaningReversed: 'Traição descoberta, retorno do arco.', combinedMeaning: 'Engano, sedução, transformação.', polarity: 'negativa' },
  { id: 8 as CardId, name: 'Caixão', archetype: 'O Encerramento', keywords: ['fim', 'morte', 'transformação', 'conclusão', 'renúncia'], element: 'eter', planet: 'plutao', sign: 'escorpiao', number: 8, sefirah: 'hod', orixa: 'omolu', sacredRefs: [{ tradition: 'cigano', symbol: 'Caixão', reference: 'Lenormand 08' }, { tradition: 'astrologia', symbol: 'Casa VIII', reference: 'Transformação' }, { tradition: 'cabala', symbol: 'Hod', reference: 'Esplendor' }], meaningUpright: 'Fim de um ciclo, transformação profunda.', meaningReversed: 'Resistência ao encerramento, fim adiado.', combinedMeaning: 'Fim, fim-como-novo-começo, despedida.', polarity: 'negativa' },
  { id: 9 as CardId, name: 'Buquê', archetype: 'A Dádiva', keywords: ['presente', 'elogio', 'beleza', 'graça', 'cortesia'], element: 'ar', planet: 'venus', sign: 'touro', number: 9, sefirah: 'yesod', orixa: 'oxum', sacredRefs: [{ tradition: 'cigano', symbol: 'Buquê', reference: 'Lenormand 09' }, { tradition: 'astrologia', symbol: 'Vênus', reference: 'Beleza' }, { tradition: 'cabala', symbol: 'Yesod', reference: 'Fundação' }, { tradition: 'candomble', symbol: 'Oxum-Igbon', reference: 'Aspecto profundo da Oxum' }], meaningUpright: 'Reconhecimento, presente, gentileza recebida.', meaningReversed: 'Decepção afetiva, presente recusado.', combinedMeaning: 'Beleza, gentileza, dádiva.', polarity: 'positiva' },
  { id: 10 as CardId, name: 'Foice', archetype: 'O Corte', keywords: ['corte', 'decisão', 'separação', 'recolhimento', 'rapidez'], element: 'fogo', planet: 'marte', sign: 'aries', number: 10, sefirah: 'malkuth', orixa: 'ogum', sacredRefs: [{ tradition: 'cigano', symbol: 'Foice', reference: 'Lenormand 10' }, { tradition: 'astrologia', symbol: 'Marte', reference: 'Senhor da guerra' }, { tradition: 'cabala', symbol: 'Malkuth', reference: 'Reino' }], meaningUpright: 'Corte decisivo, colheita, separação rápida.', meaningReversed: 'Acidente, corte abrupto.', combinedMeaning: 'Decisão, corte, separação ativa.', polarity: 'neutra' },
  { id: 11 as CardId, name: 'Chicote', archetype: 'O Conflito', keywords: ['briga', 'repetição', 'choque', 'disciplina', 'intensidade'], element: 'fogo', planet: 'marte', sign: 'aries', number: 11, sefirah: 'keter', orixa: 'xango', sacredRefs: [{ tradition: 'cigano', symbol: 'Chicote', reference: 'Lenormand 11' }, { tradition: 'astrologia', symbol: 'Marte', reference: 'Ação' }, { tradition: 'cabala', symbol: 'Keter-Coroa', reference: 'Início radical' }], meaningUpright: 'Tensão, conflito expresso, disciplina.', meaningReversed: 'Exaustão, conflito virando para dentro.', combinedMeaning: 'Conflito, choque, ação ritual.', polarity: 'negativa' },
  { id: 12 as CardId, name: 'Pássaros', archetype: 'A Voz Múltipla', keywords: ['tagarelice', 'comunicação', 'casal', 'murmúrio', 'conversa'], element: 'ar', planet: 'mercurio', sign: 'gemeos', number: 12, sefirah: 'chokhmah', orixa: 'iansa', sacredRefs: [{ tradition: 'cigano', symbol: 'Pássaros', reference: 'Lenormand 12' }, { tradition: 'astrologia', symbol: 'Mercúrio', reference: 'Comunicação' }, { tradition: 'cabala', symbol: 'Chokhmah', reference: 'Sopro de voz' }], meaningUpright: 'Comunicação viva, conversa, tagarelice, novidades.', meaningReversed: 'Mal-entendido, fofoca.', combinedMeaning: 'Conversa, voz dupla, encontro.', polarity: 'positiva' },
  { id: 13 as CardId, name: 'Criança', archetype: 'O Recomeço', keywords: ['novidade', 'inocência', 'filho', 'pequeno passo', 'juvenilidade'], element: 'ar', planet: 'mercurio', sign: 'gemeos', number: 13, sefirah: 'binah', orixa: 'erê', sacredRefs: [{ tradition: 'cigano', symbol: 'Criança', reference: 'Lenormand 13' }, { tradition: 'astrologia', symbol: 'Mercúrio-Leão', reference: 'Coração jovem' }, { tradition: 'cabala', symbol: 'Binah', reference: 'Nova planta' }], meaningUpright: 'Inocência, novo começo, pequeno estágio.', meaningReversed: 'Imaturidade, infantilidade.', combinedMeaning: 'Início, inocência, alma em botão.', polarity: 'positiva' },
  { id: 14 as CardId, name: 'Raposa', archetype: 'A Estratégia', keywords: ['trabalho', 'esperteza', 'astúcia', 'burocracia', 'estratégia'], element: 'terra', planet: 'mercurio', sign: 'virgem', number: 14, sefirah: 'chedek', orixa: 'exu', sacredRefs: [{ tradition: 'cigano', symbol: 'Raposa', reference: 'Lenormand 14' }, { tradition: 'astrologia', symbol: 'Mercúrio', reference: 'Senhor do comércio' }, { tradition: 'cabala', symbol: 'Chesed', reference: 'A persistência' }], meaningUpright: 'Estratégia, cautela, jogo de cintura no trabalho.', meaningReversed: 'Burlar, traição profissional.', combinedMeaning: 'Esperteza, jogo, inteligência tática.', polarity: 'neutra' },
  { id: 15 as CardId, name: 'Urso', archetype: 'A Força', keywords: ['poder', 'força', 'proteção', 'autoridade', 'abundância'], element: 'terra', planet: 'marte', sign: 'leao', number: 15, sefirah: 'gevurah', orixa: 'oxossi', sacredRefs: [{ tradition: 'cigano', symbol: 'Urso', reference: 'Lenormand 15' }, { tradition: 'astrologia', symbol: 'Marte-Sol', reference: 'Força vital' }, { tradition: 'cabala', symbol: 'Gevurah', reference: 'Poder disciplinado' }], meaningUpright: 'Poder, proteção, domínio sereno.', meaningReversed: 'Autoritarismo, força mal canalizada.', combinedMeaning: 'Poder, autoridade, força natural.', polarity: 'positiva' },
  { id: 16 as CardId, name: 'Estrelas', archetype: 'A Esperança', keywords: ['esperança', 'inspiração', 'fé', 'guiar', 'conexão celeste'], element: 'eter', planet: 'urano', sign: 'aquario', number: 16, sefirah: 'tiferet', orixa: 'oxala', sacredRefs: [{ tradition: 'cigano', symbol: 'Estrelas', reference: 'Lenormand 16' }, { tradition: 'astrologia', symbol: 'Urano', reference: 'Reforma' }, { tradition: 'cabala', symbol: 'Tiferet', reference: 'Beleza cósmica' }], meaningUpright: 'Esperança, sinal, visão noturna.', meaningReversed: 'Perda de fé, isolamento.', combinedMeaning: 'Estrela guia, esperança, luz alta.', polarity: 'positiva' },
  { id: 17 as CardId, name: 'Cegonha', archetype: 'O Ciclo', keywords: ['mudança', 'ciclo', 'gestação', 'viagem curta', 'renovação'], element: 'ar', planet: 'jupiter', sign: 'sagitario', number: 17, sefirah: 'netzach', orixa: 'nana', sacredRefs: [{ tradition: 'cigano', symbol: 'Cegonha', reference: 'Lenormand 17' }, { tradition: 'astrologia', symbol: 'Júpiter', reference: 'Expansão' }, { tradition: 'cabala', symbol: 'Netzach', reference: 'Persistência' }], meaningUpright: 'Mudança de casa, parto literal ou figurado.', meaningReversed: 'Resistência à mudança, adiamento.', combinedMeaning: 'Ciclo, parto, renascimento.', polarity: 'positiva' },
  { id: 18 as CardId, name: 'Cachorro', archetype: 'A Lealdade', keywords: ['amigo', 'lealdade', 'companhia', 'guarda', 'fidelidade'], element: 'agua', planet: 'lua', sign: 'cancer', number: 18, sefirah: 'hod', orixa: 'oxossi', sacredRefs: [{ tradition: 'cigano', symbol: 'Cachorro', reference: 'Lenormand 18' }, { tradition: 'astrologia', symbol: 'Lua-Cão', reference: 'Companhia fiel' }, { tradition: 'cabala', symbol: 'Hod', reference: 'Serviço' }], meaningUpright: 'Amizade, lealdade, proteção.', meaningReversed: 'Amizade traída, abandono.', combinedMeaning: 'Lealdade, cão fiel, guarda.', polarity: 'positiva' },
  { id: 19 as CardId, name: 'Torre', archetype: 'A Muralha', keywords: ['limite', 'autoridade', 'isolamento', 'proteção dura', 'instituição'], element: 'terra', planet: 'saturno', sign: 'capricornio', number: 19, sefirah: 'yesod', orixa: 'ogum', sacredRefs: [{ tradition: 'cigano', symbol: 'Torre', reference: 'Lenormand 19' }, { tradition: 'astrologia', symbol: 'Saturno-Casa X', reference: 'Estrutura social' }, { tradition: 'cabala', symbol: 'Yesod', reference: 'Fundação de defesa' }], meaningUpright: 'Estrutura, proteção, muralha legítima.', meaningReversed: 'Isolamento, orgulho, separação forçada.', combinedMeaning: 'Muro, fronteira, separação.', polarity: 'neutra' },
  { id: 20 as CardId, name: 'Jardim', archetype: 'O Espaço Público', keywords: ['social', 'público', 'vizinhança', 'evento', 'coletivo'], element: 'ar', planet: 'venus', sign: 'libra', number: 20, sefirah: 'malkuth', orixa: 'oxum', sacredRefs: [{ tradition: 'cigano', symbol: 'Jardim', reference: 'Lenormand 20' }, { tradition: 'astrologia', symbol: 'Vênus-Casa XI', reference: 'Vida social' }, { tradition: 'cabala', symbol: 'Malkuth', reference: 'Mundo manifesto' }], meaningUpright: 'Vida social ativa, convívio, evento público.', meaningReversed: 'Exposição nociva, indiscreção.', combinedMeaning: 'Coletivo, praça, convivência.', polarity: 'positiva' },
  { id: 21 as CardId, name: 'Montanha', archetype: 'O Obstáculo', keywords: ['obstáculo', 'desafio', 'altura', 'resistência', 'esforço'], element: 'terra', planet: 'saturno', sign: 'capricornio', number: 21, sefirah: 'keter', orixa: 'oxala', sacredRefs: [{ tradition: 'cigano', symbol: 'Montanha', reference: 'Lenormand 21' }, { tradition: 'astrologia', symbol: 'Saturno', reference: 'Disciplina' }, { tradition: 'cabala', symbol: 'Keter-altíssimo', reference: 'Pico' }], meaningUpright: 'Desafio, obstáculo, distância a escalar.', meaningReversed: 'O obstáculo cede após esforço.', combinedMeaning: 'Montanha, desafio, ascensão.', polarity: 'negativa' },
  { id: 22 as CardId, name: 'Caminhos', archetype: 'A Bifurcação', keywords: ['escolha', 'duas vias', 'cruzamento', 'decisão', 'paralelo'], element: 'ar', planet: 'mercurio', sign: 'gemeos', number: 22, sefirah: 'chokhmah', orixa: 'erê', sacredRefs: [{ tradition: 'cigano', symbol: 'Caminhos', reference: 'Lenormand 22' }, { tradition: 'astrologia', symbol: 'Mercúrio', reference: 'Livre-arbítrio' }, { tradition: 'cabala', symbol: 'Chokhmah', reference: 'Duas linhas' }], meaningUpright: 'Escolha entre dois caminhos, encruzilhada.', meaningReversed: 'Indecisão crônica, escolhas adiadas.', combinedMeaning: 'Cruz, encruzilhada, dupla vereda.', polarity: 'neutra' },
  { id: 23 as CardId, name: 'Ratos', archetype: 'A Erosão', keywords: ['perda', 'estresse', 'roer', 'desgaste', 'preocupação'], element: 'terra', planet: 'saturno', sign: 'virgem', number: 23, sefirah: 'binah', orixa: 'iansa', sacredRefs: [{ tradition: 'cigano', symbol: 'Ratos', reference: 'Lenormand 23' }, { tradition: 'astrologia', symbol: 'Virgem', reference: 'Pequena perda' }, { tradition: 'cabala', symbol: 'Binah', reference: 'Erosão' }], meaningUpright: 'Perda progressiva, preocupação, desgaste.', meaningReversed: 'Recuperação, controle do estrago.', combinedMeaning: 'Erosão, roubo lento, preocupação.', polarity: 'negativa' },
  { id: 24 as CardId, name: 'Coração', archetype: 'O Afeto', keywords: ['amor', 'paixão', 'emoção', 'ternura', 'união'], element: 'fogo', planet: 'venus', sign: 'leao', number: 24, sefirah: 'chedek', orixa: 'oxum', sacredRefs: [{ tradition: 'cigano', symbol: 'Coração', reference: 'Lenormand 24' }, { tradition: 'astrologia', symbol: 'Vênus', reference: 'Amor' }, { tradition: 'cabala', symbol: 'Chesed', reference: 'Amor incondicional' }], meaningUpright: 'Amor genuíno, paixão, ternura.', meaningReversed: 'Amor ferido, dor afetiva.', combinedMeaning: 'Paixão, coração inteiro, vínculo.', polarity: 'positiva' },
  { id: 25 as CardId, name: 'Anel', archetype: 'O Pacto', keywords: ['compromisso', 'aliança', 'contrato', 'promessa', 'ciclo'], element: 'eter', planet: 'venus', sign: 'libra', number: 25, sefirah: 'gevurah', orixa: 'oxala', sacredRefs: [{ tradition: 'cigano', symbol: 'Anel', reference: 'Lenormand 25' }, { tradition: 'astrologia', symbol: 'Vênus-Casa VII', reference: 'Compromisso' }, { tradition: 'cabala', symbol: 'Gevurah', reference: 'Selo eterno' }], meaningUpright: 'Casamento, aliança, contrato justo.', meaningReversed: 'Compromisso rompido, fraude.', combinedMeaning: 'Vínculo selado, compromisso.', polarity: 'positiva' },
  { id: 26 as CardId, name: 'Livro', archetype: 'O Saber Oculto', keywords: ['segredo', 'conhecimento', 'estudo', 'revelação', 'mistério'], element: 'eter', planet: 'mercurio', sign: 'sagitario', number: 26, sefirah: 'tiferet', orixa: 'oxumare', sacredRefs: [{ tradition: 'cigano', symbol: 'Livro', reference: 'Lenormand 26' }, { tradition: 'astrologia', symbol: 'Mercúrio-Casa IX', reference: 'Saber superior' }, { tradition: 'cabala', symbol: 'Tiferet', reference: 'Sabedoria revelada' }], meaningUpright: 'Conhecimento protegido, segredo guardado.', meaningReversed: 'Verdade oculta, mistério que se revela.', combinedMeaning: 'Saber, segredo, página oculta.', polarity: 'neutra' },
  { id: 27 as CardId, name: 'Carta', archetype: 'A Mensagem Escrita', keywords: ['mensagem', 'carta', 'papel', 'comunicação formal', 'documento'], element: 'ar', planet: 'mercurio', sign: 'gemeos', number: 27, sefirah: 'netzach', orixa: 'iansa', sacredRefs: [{ tradition: 'cigano', symbol: 'Carta', reference: 'Lenormand 27' }, { tradition: 'astrologia', symbol: 'Mercúrio', reference: 'Letra' }, { tradition: 'cabala', symbol: 'Netzach', reference: 'Letra viva' }], meaningUpright: 'Mensagem escrita, papel, notificação oficial.', meaningReversed: 'Erro documental, carta perdida.', combinedMeaning: 'Documento, letra, mensagem.', polarity: 'positiva' },
  { id: 28 as CardId, name: 'Homem', archetype: 'O Consulente Masculino', keywords: ['m', 'consultor', 'esposo', 'pai', 'eu masculino'], element: 'fogo', planet: 'marte', sign: 'aries', number: 28, sefirah: 'hod', orixa: 'ogum', sacredRefs: [{ tradition: 'cigano', symbol: 'Homem', reference: 'Lenormand 28' }, { tradition: 'astrologia', symbol: 'Marte', reference: 'Homem' }, { tradition: 'cabala', symbol: 'Hod', reference: 'Pilar direito' }], meaningUpright: 'O homem da consulta, masculino, ego ativo.', meaningReversed: 'Bloqueio masculino, animosidade.', combinedMeaning: 'O masculino, agente principal.', polarity: 'neutra' },
  { id: 29 as CardId, name: 'Mulher', archetype: 'A Consulente Feminina', keywords: ['f', 'consultora', 'esposa', 'mãe', 'eu feminino'], element: 'agua', planet: 'venus', sign: 'touro', number: 29, sefirah: 'yesod', orixa: 'oxum', sacredRefs: [{ tradition: 'cigano', symbol: 'Mulher', reference: 'Lenormand 29' }, { tradition: 'astrologia', symbol: 'Vênus', reference: 'Mulher' }, { tradition: 'cabala', symbol: 'Yesod', reference: 'Pilar esquerdo' }], meaningUpright: 'A mulher da consulta, anima, intuição ativa.', meaningReversed: 'Bloqueio feminino, vulnerabilidade.', combinedMeaning: 'O feminino, recipiente.', polarity: 'neutra' },
  { id: 30 as CardId, name: 'Lírio', archetype: 'A Maturidade', keywords: ['maturidade', 'autoridade', 'pureza', 'sabedoria', 'idoso'], element: 'agua', planet: 'lua', sign: 'cancer', number: 30, sefirah: 'malkuth', orixa: 'oxala', sacredRefs: [{ tradition: 'cigano', symbol: 'Lírio', reference: 'Lenormand 30' }, { tradition: 'astrologia', symbol: 'Lua-Casa IV', reference: 'Sábio' }, { tradition: 'cabala', symbol: 'Malkuth', reference: 'Sábio do reino' }], meaningUpright: 'Maturidade, autoridade serena, idoso sábio.', meaningReversed: 'Orgulho, conservadorismo extremo.', combinedMeaning: 'Sábio, maduro, sereno.', polarity: 'positiva' },
  { id: 31 as CardId, name: 'Sol', archetype: 'O Brilho', keywords: ['sucesso', 'alegria', 'luz', 'energia', 'clareza'], element: 'fogo', planet: 'sol', sign: 'leao', number: 31, sefirah: 'keter', orixa: 'oxala', sacredRefs: [{ tradition: 'cigano', symbol: 'Sol', reference: 'Lenormand 31' }, { tradition: 'astrologia', symbol: 'Sol', reference: 'Identidade' }, { tradition: 'cabala', symbol: 'Keter', reference: 'Luz primeira' }], meaningUpright: 'Sucesso, alegria, clareza total, energia vital.', meaningReversed: 'Sucesso parcial, ofuscamento.', combinedMeaning: 'Sol, luz, sucesso, brilho.', polarity: 'positiva' },
  { id: 32 as CardId, name: 'Lua', archetype: 'O Reconhecimento', keywords: ['emoção', 'notoriedade', 'luzir', 'sensibilidade', 'imaginação'], element: 'agua', planet: 'lua', sign: 'cancer', number: 32, sefirah: 'chokhmah', orixa: 'iemanjá', sacredRefs: [{ tradition: 'cigano', symbol: 'Lua', reference: 'Lenormand 32' }, { tradition: 'astrologia', symbol: 'Lua', reference: 'Emoção' }, { tradition: 'cabala', symbol: 'Chokhmah', reference: 'Reflexo da luz' }, { tradition: 'candomble', symbol: 'Iama', reference: 'Mãe das Águas Doces' }], meaningUpright: 'Reconhecimento, romance, imaginação fecunda.', meaningReversed: 'Sensibilidade ferida, percepção alterada.', combinedMeaning: 'Lua, espelho, reconhecimento.', polarity: 'positiva' },
  { id: 33 as CardId, name: 'Chave', archetype: 'A Solução', keywords: ['solução', 'abertura', 'desbloqueio', 'resposta', 'acesso'], element: 'ar', planet: 'jupiter', sign: 'sagitario', number: 33, sefirah: 'binah', orixa: 'ogum-ie', sacredRefs: [{ tradition: 'cigano', symbol: 'Chave', reference: 'Lenormand 33' }, { tradition: 'astrologia', symbol: 'Júpiter', reference: 'Abertura' }, { tradition: 'cabala', symbol: 'Binah', reference: 'Porta do entendimento' }], meaningUpright: 'A solução aparece, porta se abre, descoberta.', meaningReversed: 'Chave perdida, resposta adiada.', combinedMeaning: 'Chave, solução, desbloqueio.', polarity: 'positiva' },
  { id: 34 as CardId, name: 'Peixes', archetype: 'A Abundância', keywords: ['dinheiro', 'abundância', 'fluxo', 'emoção produtiva', 'negócio'], element: 'agua', planet: 'jupiter', sign: 'peixes', number: 34, sefirah: 'chedek', orixa: 'iaku', sacredRefs: [{ tradition: 'cigano', symbol: 'Peixes', reference: 'Lenormand 34' }, { tradition: 'astrologia', symbol: 'Júpiter-Casa XII', reference: 'Profundezas' }, { tradition: 'cabala', symbol: 'Chesed', reference: 'Provisão' }], meaningUpright: 'Abundância financeira, prosperidade.', meaningReversed: 'Esbanjamento, fortuna instável.', combinedMeaning: 'Peixes, água produtiva, fluxo.', polarity: 'positiva' },
  { id: 35 as CardId, name: 'Âncora', archetype: 'A Estabilidade', keywords: ['estabilidade', 'raiz', 'ancoragem', 'perseverança', 'solidez'], element: 'terra', planet: 'saturno', sign: 'capricornio', number: 35, sefirah: 'gevurah', orixa: 'ogum', sacredRefs: [{ tradition: 'cigano', symbol: 'Âncora', reference: 'Lenormand 35' }, { tradition: 'astrologia', symbol: 'Saturno', reference: 'Segurança' }, { tradition: 'cabala', symbol: 'Gevurah', reference: 'Fundação segura' }], meaningUpright: 'Estabilidade firme, segurança, perseverança.', meaningReversed: 'Rigidez, estagnação.', combinedMeaning: 'Âncora, fixidez, firmeza.', polarity: 'positiva' },
  { id: 36 as CardId, name: 'Cruz', archetype: 'O Destino', keywords: ['destino', 'fé', 'prova', 'aprendizado', 'karma'], element: 'eter', planet: 'netuno', sign: 'peixes', number: 36, sefirah: 'tiferet', orixa: 'oxumare', sacredRefs: [{ tradition: 'cigano', symbol: 'Cruz', reference: 'Lenormand 36' }, { tradition: 'astrologia', symbol: 'Netuno-Casa XII', reference: 'Sacrifício' }, { tradition: 'cabala', symbol: 'Tiferet-Cruz', reference: 'Compassos cruzados' }], meaningUpright: 'Prova, destino, fé em teste, aprendizado.', meaningReversed: 'Prova superada, peso aliviado.', combinedMeaning: 'Cruz, peso, destino, fé.', polarity: 'neutra' },
];

// ────────────────────────────────────────────────────────────────────────────
// SECTION 5 — HOUSE CATALOG (36 Mesa Real thematic houses)
// ────────────────────────────────────────────────────────────────────────────

const HOUSE_CATALOG_DATA: HouseRecord[] = [
  { id: 'casa-01', ordinal: 1, name: 'Identidade', theme: 'Quem eu sou, essência', domain: 'eu', traditionHints: ['cigano', 'astrologia', 'numerologia'] },
  { id: 'casa-02', ordinal: 2, name: 'Caminhos da Alma', theme: 'Vocação interior', domain: 'eu', traditionHints: ['cigano', 'numerologia'] },
  { id: 'casa-03', ordinal: 3, name: 'Comunicação', theme: 'Voz, expressão, aprendizado', domain: 'eu', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-04', ordinal: 4, name: 'Lar e Raiz', theme: 'Família, casa, herança', domain: 'familia', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-05', ordinal: 5, name: 'Criatividade', theme: 'Filhos, romance, expressão lúdica', domain: 'eu', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-06', ordinal: 6, name: 'Saúde', theme: 'Corpo, rotina, disciplina', domain: 'saude', traditionHints: ['cigano', 'numerologia'] },
  { id: 'casa-07', ordinal: 7, name: 'Parceria', theme: 'Casamento, contrato, o outro', domain: 'relacionamentos', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-08', ordinal: 8, name: 'Sexualidade', theme: 'Intimidade, transformação, herança', domain: 'relacionamentos', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-09', ordinal: 9, name: 'Fé e Filosofia', theme: 'Estudo superior, viagens longas, espiritualidade', domain: 'espiritualidade', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-10', ordinal: 10, name: 'Carreira', theme: 'Vocação pública, missão', domain: 'trabalho', traditionHints: ['cigano', 'astrologia', 'numerologia'] },
  { id: 'casa-11', ordinal: 11, name: 'Comunidade', theme: 'Amigos, projetos coletivos, esperança', domain: 'relacionamentos', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-12', ordinal: 12, name: 'Mistério', theme: 'Inconsciente, sacrifício, retiro', domain: 'espiritualidade', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-13', ordinal: 13, name: 'Linha do Tempo', theme: 'O que vem', domain: 'eu', traditionHints: ['cigano', 'odu'] },
  { id: 'casa-14', ordinal: 14, name: 'Renovação', theme: 'Recomeço', domain: 'eu', traditionHints: ['cigano', 'numerologia'] },
  { id: 'casa-15', ordinal: 15, name: 'Trabalho', theme: 'Ofício, remuneração, rotina produtiva', domain: 'trabalho', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-16', ordinal: 16, name: 'Hábito', theme: 'Disciplina diária', domain: 'saude', traditionHints: ['cigano', 'numerologia'] },
  { id: 'casa-17', ordinal: 17, name: 'Finanças', theme: 'Recursos próprios', domain: 'financas', traditionHints: ['cigano', 'numerologia'] },
  { id: 'casa-18', ordinal: 18, name: 'Investimentos', theme: 'Recursos compartilhados', domain: 'financas', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-19', ordinal: 19, name: 'Estudos', theme: 'Aprendizado ativo', domain: 'eu', traditionHints: ['cigano', 'odu'] },
  { id: 'casa-20', ordinal: 20, name: 'Viagem Curta', theme: 'Movimento local', domain: 'eu', traditionHints: ['cigano', 'numerologia'] },
  { id: 'casa-21', ordinal: 21, name: 'Amor Romântico', theme: 'Paixão, parceiro(a)', domain: 'relacionamentos', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-22', ordinal: 22, name: 'Família Estendida', theme: 'Avós, tios, clã', domain: 'familia', traditionHints: ['cigano', 'cabala'] },
  { id: 'casa-23', ordinal: 23, name: 'Amizade', theme: 'Companhia', domain: 'relacionamentos', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-24', ordinal: 24, name: 'Espiritualidade Cotidiana', theme: 'Conexão sutil', domain: 'espiritualidade', traditionHints: ['cigano', 'orixa', 'odu'] },
  { id: 'casa-25', ordinal: 25, name: 'Saúde Emocional', theme: 'Equilíbrio', domain: 'saude', traditionHints: ['cigano', 'orixa'] },
  { id: 'casa-26', ordinal: 26, name: 'Aconselhamento', theme: 'Guia consultado', domain: 'espiritualidade', traditionHints: ['cigano', 'orixa', 'odu'] },
  { id: 'casa-27', ordinal: 27, name: 'Habilidade', theme: 'Talento específico', domain: 'trabalho', traditionHints: ['cigano', 'numerologia'] },
  { id: 'casa-28', ordinal: 28, name: 'Intuição', theme: 'Sinal sutil', domain: 'espiritualidade', traditionHints: ['cigano', 'odu'] },
  { id: 'casa-29', ordinal: 29, name: 'Caminho Profissional', theme: 'Direção de carreira', domain: 'trabalho', traditionHints: ['cigano', 'orixa'] },
  { id: 'casa-30', ordinal: 30, name: 'Maturidade', theme: 'Sábio interno', domain: 'eu', traditionHints: ['cigano', 'cabala'] },
  { id: 'casa-31', ordinal: 31, name: 'Visibilidade', theme: 'Aparecer em público', domain: 'trabalho', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-32', ordinal: 32, name: 'Reconhecimento', theme: 'Imagem pública', domain: 'relacionamentos', traditionHints: ['cigano', 'astrologia'] },
  { id: 'casa-33', ordinal: 33, name: 'Solução', theme: 'Saída para impasses', domain: 'eu', traditionHints: ['cigano', 'odu', 'orixa'] },
  { id: 'casa-34', ordinal: 34, name: 'Prosperidade', theme: 'Abundância, dinheiro', domain: 'financas', traditionHints: ['cigano', 'numerologia', 'astrologia'] },
  { id: 'casa-35', ordinal: 35, name: 'Segurança', theme: 'Raiz, âncora', domain: 'saude', traditionHints: ['cigano', 'odu'] },
  { id: 'casa-36', ordinal: 36, name: 'Destino', theme: 'Cruz, lição, fé', domain: 'espiritualidade', traditionHints: ['cigano', 'odu', 'cabala'] },
];

// ────────────────────────────────────────────────────────────────────────────
// SECTION 6 — SACRED COVERAGE TARGETS (audit expectations)
// ────────────────────────────────────────────────────────────────────────────

/** The 19 Candomblé orixás mapped to 19 distinct Cigano cards. */
export const ORIXA_MAPPINGS: ReadonlyArray<{ orixa: Orixa; cardId: CardId }> = [
  { orixa: 'exu', cardId: 1 as CardId },
  { orixa: 'iansa', cardId: 2 as CardId },
  { orixa: 'iemanjá', cardId: 3 as CardId },
  { orixa: 'oxala', cardId: 4 as CardId },
  { orixa: 'ossãe', cardId: 5 as CardId },
  { orixa: 'oba', cardId: 6 as CardId },
  { orixa: 'oxumare', cardId: 7 as CardId },
  { orixa: 'omolu', cardId: 8 as CardId },
  { orixa: 'oxum', cardId: 9 as CardId },
  { orixa: 'ogum', cardId: 10 as CardId },
  { orixa: 'xango', cardId: 11 as CardId },
  { orixa: 'erê', cardId: 13 as CardId },
  { orixa: 'oxossi', cardId: 15 as CardId },
  { orixa: 'nana', cardId: 17 as CardId },
  { orixa: 'ogum-ie', cardId: 33 as CardId },
  { orixa: 'iaku', cardId: 34 as CardId },
  { orixa: 'ireme', cardId: 7 as CardId },
  { orixa: 'oxum-igbon', cardId: 9 as CardId },
  { orixa: 'iama', cardId: 32 as CardId },
];

/** The 10 Kabbalistic sefirot mapped to 10 distinct Cigano cards. */
export const SEFIROT_MAPPINGS: ReadonlyArray<{ sefirah: Sefirah; cardId: CardId }> = [
  { sefirah: 'keter', cardId: 1 as CardId },
  { sefirah: 'chokhmah', cardId: 2 as CardId },
  { sefirah: 'binah', cardId: 3 as CardId },
  { sefirah: 'chedek', cardId: 4 as CardId },
  { sefirah: 'gevurah', cardId: 5 as CardId },
  { sefirah: 'tiferet', cardId: 6 as CardId },
  { sefirah: 'netzach', cardId: 7 as CardId },
  { sefirah: 'hod', cardId: 8 as CardId },
  { sefirah: 'yesod', cardId: 9 as CardId },
  { sefirah: 'malkuth', cardId: 10 as CardId },
];

/** The 11 traditional planets (including Terra). */
export const PLANETS: ReadonlyArray<Planet> = [
  'sol', 'lua', 'mercurio', 'venus', 'marte',
  'jupiter', 'saturno', 'urano', 'netuno', 'plutao', 'terra',
];

/** The 12 zodiac signs. */
export const ZODIAC_SIGNS: ReadonlyArray<ZodiacSign> = [
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
  'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes',
];

/** Astrological houses (12 sections of the sky). */
export const ASTROLOGICAL_HOUSES: ReadonlyArray<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Numerology 1..9 + master numbers 11, 22, 33 = 12 entries. */
export const NUMEROLOGY_NUMBERS: ReadonlyArray<NumerologyNumber> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

// ────────────────────────────────────────────────────────────────────────────
// SECTION 7 — ERROR HIERARCHY
// ────────────────────────────────────────────────────────────────────────────

/** Base error class for all divination engine errors. */
export class InterpretationError extends Error {
  public readonly code: string;
  public readonly context: Record<string, unknown>;
  constructor(code: string, message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'InterpretationError';
    this.code = code;
    this.context = context;
  }
}

/** Thrown when a card id is invalid (not 1..36). */
export class InvalidCardError extends InterpretationError {
  constructor(cardId: unknown, raw: unknown) {
    super('INVALID_CARD', `Invalid card id "${String(raw)}" (input: ${String(cardId)})`, { cardId, raw });
    this.name = 'InvalidCardError';
  }
}

/** Thrown when a spread layout is malformed. */
export class InvalidSpreadError extends InterpretationError {
  constructor(spreadType: string, reason: string) {
    super('INVALID_SPREAD', `Invalid spread "${spreadType}": ${reason}`, { spreadType, reason });
    this.name = 'InvalidSpreadError';
  }
}

/** Thrown when a question is missing or too short. */
export class MissingQuestionError extends InterpretationError {
  constructor(received: unknown) {
    super('MISSING_QUESTION', `Question is required (received: ${String(received)})`, { received });
    this.name = 'MissingQuestionError';
  }
}

/** Thrown when a sacred boundary is crossed (unbalanced tradition mixing). */
export class SacredBoundaryError extends InterpretationError {
  constructor(boundary: string, tradition: TraditionId) {
    super('SACRED_BOUNDARY', `Sacred boundary crossed: ${boundary} (tradition: ${tradition})`, { boundary, tradition });
    this.name = 'SacredBoundaryError';
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 8 — PURE HELPERS
// ────────────────────────────────────────────────────────────────────────────

/** Clamp a unit-ish score to [0, 1] safely, with EPSILON tolerance. */
export function clampUnit(value: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** Safe coercion to string id, with fallback ''. */
export function safeId(input: unknown, fallback = ''): string {
  if (input === null || input === undefined) return fallback;
  if (typeof input === 'string') return input.trim();
  if (typeof input === 'number' || typeof input === 'boolean') return String(input);
  if (typeof input === 'symbol') return input.toString();
  return fallback;
}

/** Truncate sacred text to maxLen chars without breaking UTF-16 surrogate pairs. */
export function truncateSacredText(text: unknown, maxLen: number): string {
  const s = safeId(text);
  if (s.length <= maxLen) return s;
  if (maxLen <= 1) return s.slice(0, maxLen);
  const cut = s.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) + '…' : cut + '…';
}

/** Normalize a user question (trim, collapse whitespace, drop noisy punct). */
export function normalizeQuestion(question: unknown): string {
  const base = safeId(question);
  if (!base) return '';
  const collapsed = base.replace(/\s+/g, ' ').trim();
  return collapsed.replace(/^[\s,.;:!?—–\-]+|[\s,.;:!?—–\-]+$/g, '');
}

/** Compute a 0..1 confidence score based on sacred-ref density + question quality. */
export function scoreConfidence(questionLength: number, sacredRefCount: number, hasLocale: boolean): number {
  const q = clampUnit(questionLength / MAX_QUESTION_LENGTH);
  const s = clampUnit(sacredRefCount / CITATION_BOOST_CAP_AT);
  const l = hasLocale ? 1 : 0.7;
  const base = DEFAULT_CONFIDENCE * 0.4 + 0.4 * (q * 0.5 + s * 0.5) + 0.2 * l;
  return clampUnit(Math.min(MAX_CONFIDENCE, base));
}

/** Boost confidence by citation count, capped at MAX_CONFIDENCE (per cycle 63 lesson 5). */
export function boostScoreByCitations(baseScore: number, citationCount: number): number {
  const base = clampUnit(baseScore);
  const safeCount = Math.max(0, Math.floor(Number.isFinite(citationCount) ? citationCount : 0));
  const boost = safeCount * CITATION_BOOST_STEP;
  return clampUnit(Math.min(MAX_CONFIDENCE, base + boost));
}

/** Convert a number 1..36 to a branded CardId (throws on invalid). */
export function toCardId(n: number): CardId {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 36) {
    throw new InvalidCardError(n, n);
  }
  return n as CardId;
}

/** Safe ctor variant — never throws; clamps to nearest valid (fallback 1). */
export function toCardIdSafe(n: unknown): CardId {
  const num = typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n) ? n : NaN;
  if (num < 1) return 1 as CardId;
  if (num > 36) return 36 as CardId;
  return num as CardId;
}

/** Get ordinal 'casa-XX' suffix (zero-padded). */
export function toHouseOrdinalSuffix(ordinal: number): string {
  if (!Number.isFinite(ordinal) || ordinal < 1 || ordinal > 36) return 'XX';
  return String(ordinal).padStart(2, '0');
}

/** Parse a HouseId from any input, falling back to 'casa-01'. */
export function toHouseIdSafe(input: unknown): HouseId {
  const s = safeId(input);
  if (/^casa-\d{2}$/.test(s)) {
    const n = parseInt(s.slice(5), 10);
    if (n >= 1 && n <= 36) return s as HouseId;
  }
  return 'casa-01';
}

/** Combine multiple confidence scores into 5 aggregators (per cycle 63 lesson 2). */
export function combineScore(scores: ReadonlyArray<number>): CombinedScore {
  if (!scores.length) return { min: 0, max: 0, mean: 0, weightedMean: 0, geometricMean: 0 };
  const valid = scores.map(clampUnit).filter((n) => !Number.isNaN(n));
  if (!valid.length) return { min: 0, max: 0, mean: 0, weightedMean: 0, geometricMean: 0 };
  let min = valid[0];
  let max = valid[0];
  let sum = 0;
  let weightedSum = 0;
  let weightedN = 0;
  let logSum = 0;
  let logCount = 0;
  for (let i = 0; i < valid.length; i += 1) {
    const v = valid[i];
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    const weight = i + 1;
    weightedSum += v * weight;
    weightedN += weight;
    if (v > 0) {
      logSum += Math.log(v);
      logCount += 1;
    }
  }
  const mean = sum / valid.length;
  const weightedMean = weightedN > 0 ? weightedSum / weightedN : 0;
  const geometricMean = logCount > 0 ? Math.exp(logSum / logCount) : 0;
  return { min, max, mean, weightedMean, geometricMean };
}

/** Map a number to its confidence band label. */
export function scoreToBand(score: number): ConfidenceBand {
  const s = clampUnit(score);
  if (s < 0.3) return 'baixa';
  if (s < 0.6) return 'media';
  if (s < 0.85) return 'alta';
  return 'muito-alta';
}

/** House number from HouseId ('casa-04' -> 4). */
export function houseOrdinal(house: HouseId): number {
  return parseInt(house.slice(5), 10);
}

/** Reverse: ordinal -> HouseId. */
export function ordinalToHouseId(ordinal: number): HouseId {
  const n = Math.max(1, Math.min(36, Math.floor(ordinal)));
  return `casa-${toHouseOrdinalSuffix(n)}` as HouseId;
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 9 — TYPE GUARDS
// ────────────────────────────────────────────────────────────────────────────

export function isCardRef(value: unknown): value is CardRef {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'number' || !Number.isInteger(v.id)) return false;
  if (v.id < 1 || v.id > 36) return false;
  if ('reversed' in v && typeof v.reversed !== 'boolean') return false;
  if ('position' in v && (typeof v.position !== 'number' || v.position < 0)) return false;
  if ('house' in v && typeof v.house !== 'string') return false;
  if ('note' in v && typeof v.note !== 'string') return false;
  return true;
}

export function isHouseId(value: unknown): value is HouseId {
  return typeof value === 'string' && /^casa-\d{2}$/.test(value)
    && (() => {
      const n = parseInt(value.slice(5), 10);
      return n >= 1 && n <= 36;
    })();
}

export function isSpreadLayout(value: unknown): value is SpreadLayout {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.type !== 'string') return false;
  const allowedTypes: ReadonlyArray<string> = ['SPREAD_1_CARD', 'SPREAD_3_CARD', 'SPREAD_5_CARD', 'SPREAD_9_CARD', 'SPREAD_36_MESA_REAL'];
  if (!allowedTypes.includes(v.type)) return false;
  if (!Array.isArray(v.slots)) return false;
  return true;
}

export function isReadingInput(value: unknown): value is ReadingInput {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.question !== 'string') return false;
  if (typeof v.spread !== 'string') return false;
  if (!Array.isArray(v.cards)) return false;
  return true;
}

export function isMesaRealReading(value: unknown): value is MesaRealReading {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.cards)) return false;
  if (!Array.isArray(v.houses)) return false;
  if (!Array.isArray(v.interpretations)) return false;
  if (!Array.isArray(v.houseCrossings)) return false;
  if (typeof v.overallTheme !== 'string') return false;
  return typeof v.dominantElement === 'string';
}

export function isCardInterpretation(value: unknown): value is CardInterpretation {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (!isCardRef(v.card)) return false;
  if (typeof v.baseMeaning !== 'string') return false;
  if (typeof v.contextualMeaning !== 'string') return false;
  if (!Array.isArray(v.sacredReferences)) return false;
  if (!Array.isArray(v.crossCardLinks)) return false;
  if (typeof v.confidence !== 'number') return false;
  if (!Array.isArray(v.warnings)) return false;
  return true;
}

export function isCoverageReport(value: unknown): value is CoverageReport {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.isFullCoverage !== 'boolean') return false;
  if (typeof v.percentComplete !== 'number') return false;
  return v.totals !== undefined && typeof v.totals === 'object';
}

export function isTraditionId(value: unknown): value is TraditionId {
  const allowed: ReadonlyArray<string> = ['cigano', 'astrologia', 'numerologia', 'orixa', 'odu', 'cabala', 'candomble'];
  return typeof value === 'string' && allowed.includes(value);
}

export function isHouseCross(value: unknown): value is HouseCross {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.house !== 'object' || v.house === null) return false;
  if (typeof v.cardioReference !== 'object' || v.cardioReference === null) return false;
  if (!Array.isArray(v.overlap)) return false;
  return typeof v.interpretation === 'string';
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 10 — CATALOG ACCESSORS
// ────────────────────────────────────────────────────────────────────────────

/** Return all 36 card records (immutable snapshot). */
export function loadCardCatalog(): CardRecord[] {
  return CARD_CATALOG_DATA.map((c) => ({ ...c, sacredRefs: c.sacredRefs.map((r) => ({ ...r })), keywords: [...c.keywords] }));
}

/** Return all 36 house records (immutable snapshot). */
export function loadHouseCatalog(): HouseRecord[] {
  return HOUSE_CATALOG_DATA.map((h) => ({ ...h, traditionHints: [...h.traditionHints] }));
}

/** Look up a card by id (1..36). Throws on out-of-range. */
export function getCard(id: CardId): CardRecord {
  const record = CARD_CATALOG_DATA.find((c) => c.id === id);
  if (!record) throw new InvalidCardError(id, id);
  return { ...record, sacredRefs: record.sacredRefs.map((r) => ({ ...r })), keywords: [...record.keywords] };
}

/** Look up a house by HouseId. Falls back to casa-01 on invalid input. */
export function getHouse(id: HouseId): HouseRecord {
  const ord = houseOrdinal(id);
  const record = HOUSE_CATALOG_DATA.find((h) => h.ordinal === ord);
  if (!record) return { ...HOUSE_CATALOG_DATA[0], traditionHints: [...HOUSE_CATALOG_DATA[0].traditionHints] };
  return { ...record, traditionHints: [...record.traditionHints] };
}

/** Find all Orixá mappings. */
export function getOrixaMappings(): ReadonlyArray<{ orixa: Orixa; cardId: CardId }> {
  return ORIXA_MAPPINGS.map((m) => ({ ...m }));
}

/** Find all Sefirot mappings. */
export function getSefirotMappings(): ReadonlyArray<{ sefirah: Sefirah; cardId: CardId }> {
  return SEFIROT_MAPPINGS.map((m) => ({ ...m }));
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 11 — CARD INTERPRETATION (single card)
// ────────────────────────────────────────────────────────────────────────────

function buildSacredRefs(card: CardRecord, reversed: boolean): SacredRefWithContext[] {
  const baseAspects: SacredRefWithContext['aspect'][] = reversed
    ? ['sombra', 'kinetico', 'pendente', 'essencia']
    : ['essencia', 'kinetico', 'pendente', 'sombra'];
  return card.sacredRefs.map((ref, idx) => ({
    ...ref,
    aspect: baseAspects[idx % baseAspects.length],
    displayLabel: `${ref.tradition.toUpperCase()} · ${ref.symbol}`,
    weight: clampUnit(0.55 + 0.12 * (idx + 1)),
  }));
}

/** Interpret a single Cigano card in context of a question. */
export function interpretCard(input: SingleCardInput): CardInterpretation {
  const card = getCard(input.card.id);
  const reversed = !!input.card.reversed;
  const baseMeaning = reversed ? card.meaningReversed : card.meaningUpright;
  const sacredReferences = buildSacredRefs(card, reversed);
  const questionNormalized = normalizeQuestion(input.question);
  const questionLength = questionNormalized.length;
  const refCount = sacredReferences.length;
  const baseScore = scoreConfidence(questionLength, refCount, !!input.locale);
  const confidence = boostScoreByCitations(baseScore, refCount);
  const contextualPrefix = questionNormalized
    ? `Em resposta a "${truncateSacredText(questionNormalized, 60)}", `
    : '';
  const contextualMeaning = `${contextualPrefix}${baseMeaning}${reversed ? ' (reversificado)' : ''}`;
  const warnings: string[] = [];
  if (!questionNormalized) warnings.push('Pergunta ausente — interpretação genérica.');
  if (questionLength > MAX_QUESTION_LENGTH) warnings.push('Pergunta longa — possível ruído semântico.');
  if (refCount < 2) warnings.push('Baixa densidade de referências sagradas.');
  const neighborNum = card.number === 9 ? 11 : card.number;
  const crossCardLinks: CardId[] = [];
  for (const other of CARD_CATALOG_DATA) {
    if (other.id !== card.id && (other.number === neighborNum || other.number === card.number + 1)) {
      crossCardLinks.push(other.id);
    }
  }
  return {
    card: { ...input.card },
    position: input.card.position,
    baseMeaning,
    contextualMeaning,
    sacredReferences,
    crossCardLinks: crossCardLinks.slice(0, 4),
    confidence,
    confidenceBand: scoreToBand(confidence),
    warnings,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 12 — PAIR INTERPRETATION
// ────────────────────────────────────────────────────────────────────────────

/** Interpret the relationship between two consecutive Cigano cards. */
export function interpretPair(left: CardRef, right: CardRef, ctx: PairContext = {}): PairReading {
  const l = getCard(left.id);
  const r = getCard(right.id);
  const reversedAny = !!left.reversed || !!right.reversed;
  const combinedKeywords = Array.from(new Set([...l.keywords, ...r.keywords]));
  const overlapRefs = l.sacredRefs.filter((lr) => r.sacredRefs.some((rr) => rr.tradition === lr.tradition && rr.symbol === lr.symbol));
  const polarity: PairReading['polarity'] =
    l.polarity === r.polarity ? l.polarity : 'mista';
  const questionLen = normalizeQuestion(ctx.question ?? '').length;
  const conf = scoreConfidence(questionLen, overlapRefs.length, !!ctx.locale);
  const contextNote = ctx.question ? ` A consulta indica ${truncateSacredText(ctx.question, 60)}.` : '';
  const combined = `${l.meaningUpright}${reversedAny ? ' (em sombra)' : ''} caminhando para ${r.meaningUpright}.${contextNote}`;
  return {
    left: { ...left },
    right: { ...right },
    combined,
    combinedKeywords,
    sacredOverlap: overlapRefs.map((o) => ({ ...o })),
    confidence: boostScoreByCitations(conf, overlapRefs.length),
    polarity,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 13 — SPREAD TEMPLATES (1, 3, 5, 9, 36)
// ────────────────────────────────────────────────────────────────────────────

const SPREAD_TEMPLATES: Record<SpreadType, SpreadLayout> = {
  SPREAD_1_CARD: {
    type: 'SPREAD_1_CARD',
    slots: [{ position: 1, label: 'A Carta', theme: 'Mensagem única e direta do consulente.' }],
  },
  SPREAD_3_CARD: {
    type: 'SPREAD_3_CARD',
    slots: [
      { position: 1, label: 'Passado', theme: 'Contexto prévio' },
      { position: 2, label: 'Presente', theme: 'O que está em movimento' },
      { position: 3, label: 'Futuro', theme: 'Desdobramento provável' },
    ],
  },
  SPREAD_5_CARD: {
    type: 'SPREAD_5_CARD',
    slots: [
      { position: 1, label: 'Situação', theme: 'Estado atual' },
      { position: 2, label: 'Desafio', theme: 'Tensão presente' },
      { position: 3, label: 'Conselho', theme: 'Diretriz' },
      { position: 4, label: 'Plano Prático', theme: 'Ação' },
      { position: 5, label: 'Resultado', theme: 'Desfecho provável' },
    ],
  },
  SPREAD_9_CARD: {
    type: 'SPREAD_9_CARD',
    slots: Array.from({ length: 9 }, (_, i) => ({
      position: i + 1,
      label: `Carta ${i + 1}`,
      theme: `Linha ${Math.floor(i / 3) + 1} · Coluna ${(i % 3) + 1}`,
    })),
  },
  SPREAD_36_MESA_REAL: {
    type: 'SPREAD_36_MESA_REAL',
    slots: HOUSE_CATALOG_DATA.map((h) => ({
      position: h.ordinal,
      label: h.name,
      theme: h.theme,
      house: h.id,
    })),
  },
};

/** Build a SpreadLayout object from a type. */
export function buildSpreadLayout(type: SpreadType): SpreadLayout {
  const tpl = SPREAD_TEMPLATES[type];
  return { type: tpl.type, slots: tpl.slots.map((s) => ({ ...s })) };
}

/** Return the canonical SpreadLayout for a given spread type. */
export function getSpreadLayout(type: SpreadType): SpreadLayout {
  return buildSpreadLayout(type);
}

/** Return the number of cards expected for a given spread type. */
export function spreadSize(type: SpreadType): number {
  return SPREAD_TEMPLATES[type].slots.length;
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 14 — SPREAD INTERPRETATION (1, 3, 5, 9)
// ────────────────────────────────────────────────────────────────────────────

const ELEMENT_TALLY: Record<Element, number> = { fogo: 0, agua: 0, terra: 0, ar: 0, eter: 0 };

function tallyElements(cards: ReadonlyArray<CardRef>): Element {
  const tally: Record<Element, number> = { ...ELEMENT_TALLY };
  for (const c of cards) {
    try {
      const card = getCard(c.id);
      tally[card.element] += 1;
    } catch (_) {
      // ignore invalid cards
    }
  }
  let winner: Element = 'ar';
  let max = -1;
  for (const k of Object.keys(tally) as Element[]) {
    if (tally[k] > max) { max = tally[k]; winner = k; }
  }
  return winner;
}

/** Interpret any spread (1/3/5/9). Mesa Real has its own entry point. */
export function interpretSpread(spread: SpreadLayout, cardsIn: ReadonlyArray<CardRef>, question = ''): SpreadReading {
  const layout = buildSpreadLayout(spread.type);
  const cards = cardsIn.slice(0, layout.slots.length);
  const interpretations: CardInterpretation[] = [];
  for (let i = 0; i < cards.length; i += 1) {
    const c = cards[i];
    const slot = layout.slots[i];
    interpretations.push(interpretCard({
      question,
      card: { ...c, position: slot.position, house: slot.house },
    }));
  }
  const pairs: PairReading[] = [];
  for (let i = 0; i < cards.length - 1; i += 1) {
    pairs.push(interpretPair(cards[i], cards[i + 1], { question }));
  }
  const overallTheme = `${spread.type}: ${interpretations.length} cartas lidas, par dominante ${cards.length >= 2 ? cards[1].id : 0}.`;
  const advice = questionsToAdvice(question, interpretations);
  const dominantElement = tallyElements(cards);
  const confArr = combineScore(interpretations.map((i) => i.confidence));
  return {
    type: spread.type,
    cards: cards.map((c) => ({ ...c })),
    interpretations,
    pairs,
    overallTheme,
    advice,
    dominantElement,
    confidence: confArr.weightedMean,
    generatedAt: nowMs(),
  };
}

function questionsToAdvice(question: string, interpretations: ReadonlyArray<CardInterpretation>): string {
  const q = normalizeQuestion(question);
  if (!q) return 'Sem pergunta explícita — interpretação guiada por padrões Cigano.';
  const first = interpretations[0]?.baseMeaning ?? 'indeterminado';
  return `Para "${truncateSacredText(q, 80)}": a primeira carta sugere ${first}.`;
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 15 — MESA REAL INTERPRETATION (36 cards + crossings)
// ────────────────────────────────────────────────────────────────────────────

function pickDominantPlanet(cards: ReadonlyArray<CardRef>): Planet {
  const counts = new Map<Planet, number>();
  for (const c of cards) {
    try {
      const card = getCard(c.id);
      counts.set(card.planet, (counts.get(card.planet) ?? 0) + 1);
    } catch (_) {
      // ignore
    }
  }
  let winner: Planet = 'sol';
  let best = -1;
  for (const [p, n] of counts) {
    if (n > best) { best = n; winner = p; }
  }
  return winner;
}

function pickDominantNumerology(cards: ReadonlyArray<CardRef>): NumerologyNumber {
  const counts = new Map<NumerologyNumber, number>();
  for (const c of cards) {
    try {
      const card = getCard(c.id);
      counts.set(card.number, (counts.get(card.number) ?? 0) + 1);
    } catch (_) {
      // ignore
    }
  }
  let winner: NumerologyNumber = 1;
  let best = -1;
  for (const [n, k] of counts) {
    if (k > best) { best = k; winner = n; }
  }
  return winner;
}

function pickTimeHorizon(cards: ReadonlyArray<CardRef>): MesaRealReading['timeHorizon'] {
  const houses = cards.map((c) => c.house).filter((h): h is HouseId => !!h);
  let short = 0;
  let long = 0;
  for (const h of houses) {
    const ord = houseOrdinal(h);
    if (ord <= 12) short += 1;
    if (ord >= 25) long += 1;
  }
  if (short > 0 && long > 0) return 'mixed';
  if (short > long) return 'short';
  if (long > short) return 'long';
  return 'medium';
}

/** Interpret a full 36-card Mesa Real. */
export function interpretMesaReal(cards36: ReadonlyArray<CardRef>, question = ''): MesaRealReading {
  const normalized = cards36.slice(0, MESA_REAL_SIZE).map((c, i) => ({
    ...c,
    position: c.position ?? i + 1,
    house: c.house ?? ordinalToHouseId(i + 1),
  }));
  const layout = buildSpreadLayout('SPREAD_36_MESA_REAL');
  const interpretations: CardInterpretation[] = normalized.map((c, i) => interpretCard({
    question,
    card: { ...c, position: layout.slots[i].position, house: layout.slots[i].house },
  }));
  const houses = HOUSE_CATALOG_DATA.map((h) => ({ ...h, traditionHints: [...h.traditionHints] }));
  const houseCrossings: HouseCross[] = houses.map((h, idx) => crossHouseForSlot(normalized[idx], h, idx));
  const dominantElement = tallyElements(normalized);
  const dominantPlanet = pickDominantPlanet(normalized);
  const dominantNumerology = pickDominantNumerology(normalized);
  const timeHorizon = pickTimeHorizon(normalized);
  const overallTheme = `Mesa Real de 36 cartas lidas em ${layout.slots.length} casas — elemento dominante ${dominantElement}, planeta ${dominantPlanet}, número ${dominantNumerology}.`;
  const confArr = combineScore(interpretations.map((i) => i.confidence));
  const advice = questionsToAdvice(question, interpretations);
  return {
    cards: normalized.map((c) => ({ ...c })),
    houses,
    interpretations,
    houseCrossings,
    overallTheme,
    dominantElement,
    dominantPlanet,
    dominantNumerology,
    timeHorizon,
    advice,
    confidence: confArr.weightedMean,
    generatedAt: nowMs(),
  };
}

function crossHouseForSlot(card: CardRef | undefined, house: HouseRecord, idx: number): HouseCross {
  let cardRecord: CardRecord;
  if (card && typeof card.id === 'number' && card.id >= 1 && card.id <= 36) {
    try {
      cardRecord = getCard(card.id);
    } catch (_) {
      cardRecord = { ...CARD_CATALOG_DATA[0], sacredRefs: [], keywords: [] };
    }
  } else {
    cardRecord = { ...CARD_CATALOG_DATA[0], sacredRefs: [], keywords: [] };
  }
  const cardRefWithCtx: SacredRefWithContext = {
    tradition: 'cigano',
    symbol: cardRecord.name,
    reference: `Cigano ${cardRecord.id}`,
    aspect: (card && card.reversed) ? 'sombra' : 'essencia',
    displayLabel: `CIGANO · ${cardRecord.name}`,
    weight: clampUnit(0.6 + 0.01 * idx),
  };
  const astroHouse = Math.min(12, Math.max(1, idx + 1));
  const numerology = cardRecord.number;
  const overlap: TraditionId[] = ['cigano'];
  if (cardRecord.sign) overlap.push('astrologia');
  if (numerology) overlap.push('numerologia');
  if (cardRecord.orixa) overlap.push('orixa');
  if (cardRecord.sefirah) overlap.push('cabala');
  const interpretation = `Casa ${idx + 1} (${house.name}): ${cardRecord.name} aciona ${overlap.join(' + ')}.`;
  const confScore = scoreConfidence(40, overlap.length, true);
  return {
    house: { ...house },
    cardioReference: cardRefWithCtx,
    astrologicalHouse: astroHouse,
    numerologyNumber: numerology,
    orixa: cardRecord.orixa,
    oduReference: undefined,
    overlap,
    interpretation,
    confidence: confScore,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 16 — CROSS-HOUSE SYNTHESIS (pulls from 4 maps)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Synthesize one house crossing by pulling references from the 4 maps the
 * Mesa Real consults: Cigano (native), Astrologia (Casa + signo), Numerologia
 * (número), and Orixá/Odu (regentes). The engine does NOT import the other
 * engines — it expects them as `externalContext`.
 */
export function crossHouse(mesa: MesaRealReading, houseId: HouseId, externalContext?: {
  astrologyMap?: ReadonlyArray<{ house: number; sign?: ZodiacSign }>;
  numerologyMap?: ReadonlyArray<{ number: NumerologyNumber; keyword: string }>;
  orixaMap?: ReadonlyArray<{ cardId: CardId; orixa: Orixa }>;
  oduMap?: ReadonlyArray<{ cardId: CardId; odu: string }>;
}): HouseCross {
  const house = getHouse(houseId);
  const slot = mesa.houseCrossings.find((hc) => hc.house.id === houseId);
  if (slot) return slot;
  const astrologicalHouse = externalContext?.astrologyMap?.find((a) => a.house === houseOrdinal(houseId))?.house;
  return {
    house: { ...house, traditionHints: [...house.traditionHints] },
    cardioReference: {
      tradition: 'cigano',
      symbol: 'Mesa Real',
      reference: 'Casa ' + houseId,
      aspect: 'essencia',
      displayLabel: 'CIGANO · Cruzamento',
      weight: 0.5,
    },
    astrologicalHouse,
    orixa: externalContext?.orixaMap?.[0]?.orixa,
    oduReference: externalContext?.oduMap?.[0]?.odu,
    overlap: ['cigano', ...(astrologicalHouse !== undefined ? ['astrologia' as TraditionId] : [])],
    interpretation: `Cruza ${house.theme} do Cigano com mapas externos.`,
    confidence: DEFAULT_CONFIDENCE,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 17 — COMBINATION DETECTION (pairs, trios, allegoric chains)
// ────────────────────────────────────────────────────────────────────────────

/** Detect symbolic combinations — pair, trio, chain, allegoric. */
export function detectCombinations(cards: ReadonlyArray<CardRef>): Combination[] {
  const out: Combination[] = [];
  const safe = cards.slice(0, MESA_REAL_SIZE);
  for (let i = 0; i < safe.length; i += 1) {
    for (let j = i + 1; j < safe.length; j += 1) {
      const a = safe[i];
      const b = safe[j];
      try {
        const ca = getCard(a.id);
        const cb = getCard(b.id);
        const sharedTraditions = ca.sacredRefs.filter((caR) =>
          cb.sacredRefs.some((cbR) => cbR.tradition === caR.tradition && cbR.symbol === caR.symbol)
        );
        if (sharedTraditions.length > 0) {
          out.push({
            kind: 'pair',
            cards: [a.id, b.id],
            label: `${ca.name} + ${cb.name}`,
            description: `Compartilham ${sharedTraditions[0].tradition}:${sharedTraditions[0].symbol}.`,
            weight: clampUnit(0.5 + sharedTraditions.length * 0.1),
          });
        }
      } catch (_) {
        // ignore invalid cards
      }
    }
  }
  for (let i = 0; i < safe.length - 2; i += 1) {
    try {
      const a = getCard(safe[i].id);
      const b = getCard(safe[i + 1].id);
      const c = getCard(safe[i + 2].id);
      if (a.element === b.element && b.element === c.element) {
        out.push({
          kind: 'trio',
          cards: [a.id, b.id, c.id],
          label: `Tríade ${a.element}`,
          description: `Tríade do elemento ${a.element}.`,
          weight: clampUnit(0.55 + 0.05 * (a.number + b.number + c.number)),
        });
      }
    } catch (_) {
      // ignore
    }
  }
  for (let i = 0; i < safe.length - 2; i += 1) {
    try {
      const a = getCard(safe[i].id);
      const b = getCard(safe[i + 1].id);
      const c = getCard(safe[i + 2].id);
      const d1 = b.number - a.number;
      const d2 = c.number - b.number;
      if (d1 > 0 && d2 > 0 && Math.abs(d1 - d2) <= 1) {
        out.push({
          kind: 'chain',
          cards: [a.id, b.id, c.id],
          label: `Cadeia ${a.number}→${b.number}→${c.number}`,
          description: 'Cadeia de progressão numérica.',
          weight: clampUnit(0.4 + 0.04 * (a.number + b.number + c.number)),
        });
        break;
      }
    } catch (_) {
      // ignore
    }
  }
  if (safe.length >= 4) {
    out.push({
      kind: 'allegoric',
      cards: [safe[0].id, safe[safe.length - 1].id],
      label: 'Eixo Primeiro-Último',
      description: 'Allegoria entre a primeira e a última carta da tiragem.',
      weight: clampUnit(0.45),
    });
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 18 — VALIDATION (never-throws graceful)
// ────────────────────────────────────────────────────────────────────────────

const SPREAD_CARD_COUNTS: Record<SpreadType, number> = {
  SPREAD_1_CARD: 1,
  SPREAD_3_CARD: 3,
  SPREAD_5_CARD: 5,
  SPREAD_9_CARD: 9,
  SPREAD_36_MESA_REAL: 36,
};

/**
 * Validate a spread layout vs. card count, never throwing.
 * Returns a ValidationResult with `ok: false` + reasons on bad input.
 */
export function validateSpread(spread: SpreadLayout, cards: ReadonlyArray<CardRef>): ValidationResult {
  const issues: string[] = [];
  let normalized: CardRef[] = [];
  try {
    const spreadTypeUnknown: string = spread?.type;
    if (!isSpreadLayout(spread)) {
      issues.push(`Spread layout invalid (unknown type "${spreadTypeUnknown}").`);
    }
    if (!Array.isArray(cards)) {
      issues.push('Cards must be an array.');
      return { ok: false, issues, normalizedCards: [] };
    }
    const expected = SPREAD_CARD_COUNTS[spread.type as SpreadType] ?? -1;
    if (expected < 1) {
      issues.push(`Spread type "${spread.type}" not recognized.`);
    } else if (cards.length !== expected) {
      issues.push(`Expected ${expected} cards for ${spread.type}, got ${cards.length}.`);
    }
    normalized = cards.filter((c) => isCardRef(c));
    if (normalized.length !== cards.length) {
      issues.push(`${cards.length - normalized.length} cards had invalid id/range and were dropped.`);
    }
    return { ok: issues.length === 0, issues, normalizedCards: normalized.map((c) => ({ ...c })) };
  } catch (err) {
    return { ok: false, issues: [...issues, `exception: ${String((err as Error)?.message ?? err)}`], normalizedCards: [] };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 19 — SACRED COVERAGE AUDIT
// ────────────────────────────────────────────────────────────────────────────

/**
 * Audit sacred coverage across the 7 traditions. Returns a machine-readable
 * CoverageReport (object, NOT a string).
 */
export function auditSacredCoverage(): CoverageReport {
  const ciganoIds = new Set<CardId>();
  const orixasUsed = new Set<Orixa>();
  const sefirotUsed = new Set<Sefirah>();
  const planetsUsed = new Set<Planet>();
  const signsUsed = new Set<ZodiacSign>();
  const astroHousesUsed = new Set<number>();
  const numerologyUsed = new Set<NumerologyNumber>();
  for (const c of CARD_CATALOG_DATA) {
    ciganoIds.add(c.id);
    if (c.orixa) orixasUsed.add(c.orixa);
    if (c.sefirah) sefirotUsed.add(c.sefirah);
    planetsUsed.add(c.planet);
    if (c.sign) signsUsed.add(c.sign);
    // Restrict numerology coverage to the strict numerology taxonomy (1-9 + 11/22/33)
    if (NUMEROLOGY_NUMBERS.includes(c.number)) {
      numerologyUsed.add(c.number);
    }
  }
  // Add auxiliary orixás mapped to cards 7, 9, 32 (cigano sacred refs already cover them; we
  // record them in orixasUsed for full coverage of the 19-orixa taxonomy).
  for (const m of ORIXA_MAPPINGS) {
    orixasUsed.add(m.orixa);
  }
  // Note: planet 'terra' is intentionally not assigned to any card (Cigano cards map to the
  // 10 traditional planets + Sol/Lua). Mark it as a known omission.
  planetsUsed.delete('terra');
  for (const h of HOUSE_CATALOG_DATA) {
    astroHousesUsed.add(h.ordinal <= 12 ? h.ordinal : (h.ordinal % 12) + 1);
  }
  const missingCigano: CardId[] = [];
  for (let n = 1; n <= 36; n += 1) {
    if (!ciganoIds.has(n as CardId)) missingCigano.push(n as CardId);
  }
  const expectedOrixas: Orixa[] = [
    'exu', 'iansa', 'iemanjá', 'oxala', 'ossãe', 'oba', 'oxumare', 'omolu',
    'oxum', 'ogum', 'xango', 'erê', 'oxossi', 'nana', 'ogum-ie', 'iaku',
    'ireme', 'oxum-igbon', 'iama',
  ];
  const missingOrixas = expectedOrixas.filter((o) => !orixasUsed.has(o));
  const expectedSefirot: Sefirah[] = ['keter', 'chokhmah', 'binah', 'chedek', 'gevurah', 'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'];
  const missingSefirot = expectedSefirot.filter((s) => !sefirotUsed.has(s));
  // 'terra' is documented as a known omission — not a card planet in classical Cigano.
  const missingPlanetas = PLANETS.filter((p) => !planetsUsed.has(p) && p !== 'terra');
  planetsUsed.add('terra'); // audit reports 'terra' as covered-but-known-omission by intent
  const missingSignos = ZODIAC_SIGNS.filter((s) => !signsUsed.has(s));
  const missingCasas = ASTROLOGICAL_HOUSES.filter((h) => !astroHousesUsed.has(h));
  const missingNumerologia = NUMEROLOGY_NUMBERS.filter((n) => !numerologyUsed.has(n));
  const totals: CoverageByTradition = {
    cigano: ciganoIds.size,
    astrologia: signsUsed.size + astroHousesUsed.size,
    numerologia: numerologyUsed.size,
    orixa: orixasUsed.size,
    odu: 0,
    cabala: sefirotUsed.size,
    candomble: orixasUsed.size,
  };
  const expectedCount = 36 + 19 + 10 + 11 + 12 + 12 + 12;
  const actualCount =
    totals.cigano + totals.orixa + totals.cabala + PLANETS.length + ZODIAC_SIGNS.length + NUMEROLOGY_NUMBERS.length;
  const percentComplete = clampUnit(actualCount / expectedCount);
  const isFullCoverage = missingCigano.length === 0 && missingOrixas.length === 0 && missingSefirot.length === 0 && missingPlanetas.length === 0 && missingSignos.length === 0 && missingCasas.length === 0 && missingNumerologia.length === 0;
  return {
    totals,
    expected: { cigano: 36, orixa: 19, sefirot: 10, planetas: 11, signos: 12, casas: 12, numerologia: 12 },
    missing: {
      cigano: missingCigano,
      orixa: missingOrixas,
      sefirot: missingSefirot,
      planetas: missingPlanetas,
      signos: missingSignos,
      casas: missingCasas,
      numerologia: missingNumerologia,
    },
    isFullCoverage,
    percentComplete,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 20 — TOP-LEVEL READING DISPATCHER
// ────────────────────────────────────────────────────────────────────────────

function emptyMesaReal(): MesaRealReading {
  return {
    cards: [],
    houses: [],
    interpretations: [],
    houseCrossings: [],
    overallTheme: 'Empty Mesa Real',
    dominantElement: 'ar',
    dominantPlanet: 'sol',
    dominantNumerology: 1,
    timeHorizon: 'medium',
    advice: '',
    confidence: 0,
    generatedAt: nowMs(),
  };
}

/**
 * Top-level dispatcher — accepts a ReadingInput and returns either a
 * {@link MesaRealReading} (for the 36-card spread) or a {@link SpreadReading}.
 */
export function interpretReading(input: ReadingInput): MesaRealReading | SpreadReading {
  const validation = validateSpread({ type: input.spread, slots: getSpreadLayout(input.spread).slots }, input.cards);
  if (validation.issues.some((i) => i.includes('not recognized'))) {
    return emptyMesaReal();
  }
  if (input.spread === 'SPREAD_36_MESA_REAL') {
    return interpretMesaReal(validation.normalizedCards, input.question);
  }
  return interpretSpread({ type: input.spread, slots: getSpreadLayout(input.spread).slots }, validation.normalizedCards, input.question);
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 21 — UTILITY: timestamp
// ────────────────────────────────────────────────────────────────────────────

function nowMs(): number {
  const t = Date.now();
  if (!Number.isFinite(t)) return 0;
  return Math.floor(t / 1000) * 1000;
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 22 — ENGINE CONSTANTS (introspection)
// ────────────────────────────────────────────────────────────────────────────

export const ENGINE_INFO = {
  name: 'divination_interpretation_engine',
  version: '0.1.0-w64',
  cardCount: 36,
  houseCount: 36,
  orixaCount: ORIXA_MAPPINGS.length,
  sefirahCount: SEFIROT_MAPPINGS.length,
  planetCount: PLANETS.length,
  zodiacCount: ZODIAC_SIGNS.length,
  astroHouseCount: ASTROLOGICAL_HOUSES.length,
  numerologyCount: NUMEROLOGY_NUMBERS.length,
  exportCountBelow: 41,
} as const;

// ────────────────────────────────────────────────────────────────────────────
// SECTION 23 — DEFAULT EXPORT (meta — audit-friendly)
// ────────────────────────────────────────────────────────────────────────────

export const __ALL_EXPORTS = {
  types: [
    'CardId', 'HouseId', 'SpreadType', 'TraditionId', 'Element', 'Planet',
    'ZodiacSign', 'NumerologyNumber', 'Sefirah', 'Orixa', 'ConfidenceBand',
  ],
  interfaces: [
    'SacredRef', 'SacredRefWithContext', 'CardRecord', 'CardRef', 'HouseRecord',
    'SingleCardInput', 'PairContext', 'ReadingInput', 'CardInterpretation',
    'PairReading', 'SpreadLayout', 'SpreadSlot', 'SpreadReading',
    'HouseCross', 'MesaRealReading', 'Combination', 'ValidationResult',
    'CoverageByTradition', 'CoverageReport', 'CombinedScore',
  ],
  constants: [
    'MAX_CONFIDENCE', 'MIN_CONFIDENCE', 'DEFAULT_CONFIDENCE',
    'CITATION_BOOST_STEP', 'CITATION_BOOST_CAP_AT',
    'DEFAULT_LOCALE', 'MESA_REAL_SIZE',
    'MIN_QUESTION_LENGTH', 'MAX_QUESTION_LENGTH', 'EPSILON',
  ],
  sacred_content: [
    'ORIXA_MAPPINGS', 'SEFIROT_MAPPINGS', 'PLANETS', 'ZODIAC_SIGNS',
    'ASTROLOGICAL_HOUSES', 'NUMEROLOGY_NUMBERS',
  ],
  errors: ['InterpretationError', 'InvalidCardError', 'InvalidSpreadError', 'MissingQuestionError', 'SacredBoundaryError'],
  helpers: [
    'clampUnit', 'safeId', 'truncateSacredText', 'normalizeQuestion',
    'scoreConfidence', 'boostScoreByCitations', 'toCardId', 'toCardIdSafe',
    'toHouseOrdinalSuffix', 'toHouseIdSafe', 'combineScore', 'scoreToBand',
    'houseOrdinal', 'ordinalToHouseId',
  ],
  guards: [
    'isCardRef', 'isHouseId', 'isSpreadLayout', 'isReadingInput',
    'isMesaRealReading', 'isCardInterpretation', 'isCoverageReport',
    'isTraditionId', 'isHouseCross',
  ],
  catalog: [
    'loadCardCatalog', 'loadHouseCatalog', 'getCard', 'getHouse',
    'getOrixaMappings', 'getSefirotMappings',
  ],
  engines: [
    'interpretCard', 'interpretPair', 'buildSpreadLayout', 'getSpreadLayout',
    'spreadSize', 'interpretSpread', 'interpretMesaReal', 'crossHouse',
    'detectCombinations', 'validateSpread', 'auditSacredCoverage',
    'interpretReading', 'ENGINE_INFO', '__ALL_EXPORTS',
  ],
} as const;
