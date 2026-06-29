/**
 * sacred_text_quote_engine.ts — Cycle 64 Worker B2 (RETRY of B)
 *
 * Curated sacred-text quote catalog + routing engine. Pick quotes by tradition,
 * context, numerology, Cigano card, Sefirot, planet, zodiac sign, or chakra.
 *
 * Public API: 25+ named exports. No external deps. No `any`, no `as unknown as`,
 * no `console.log`. Anti-misuse: refuses medical-diagnosis / investment-advice /
 * legal-advice / curse / enemy-work contexts.
 *
 * Sections:
 *  1. Brand types
 *  2. Tradition taxonomy
 *  3. Sacred taxonomy enums (orixá, sefirot, planet, sign, chakra, card, numerology)
 *  4. Quote & Citation interfaces
 *  5. Error classes
 *  6. Quote catalog (split across 8 tradition blocks)
 *  7. Pure helpers (clamp, score, normalize, safeLog)
 *  8. Type guards
 *  9. Lookup & search
 * 10. Pickers by tradition / context / numerology / card / sefirot / planet / sign / chakra
 * 11. Formatters (quote text, citation)
 * 12. Validation
 * 13. Audit (sacred coverage)
 * 14. __ALL_EXPORTS audit constant
 */

// ── Section 1: Brand types ──────────────────────────────────────────────────

export type QuoteId = string & { readonly __brand: 'QuoteId' };
export type OrixaName =
  | 'oxala' | 'iemanja' | 'oxum' | 'ogum' | 'xango' | 'iansa'
  | 'obaluae' | 'oxossi' | 'omolu' | 'oxumare' | 'nanã' | 'iaca'
  | 'exu' | 'pomba-gira' | 'caboclo' | 'preto-velho';
export type SefirotId = 'keter' | 'chokhmah' | 'binah' | 'chesed' | 'gevurah'
  | 'tiferet' | 'netzach' | 'hod' | 'yesod' | 'malkhut';
export type Planet =
  | 'sol' | 'lua' | 'mercurio' | 'venus' | 'marte' | 'jupiter'
  | 'saturno' | 'urano' | 'netuno' | 'plutao' | 'terra';
export type ZodiacSign =
  | 'aries' | 'touro' | 'gemeos' | 'cancer' | 'leao' | 'virgem'
  | 'libra' | 'escorpiao' | 'sagitario' | 'capricornio' | 'aquario' | 'peixes';
export type ChakraId = 'coroa' | 'terceiro-olho' | 'garganta' | 'coracao'
  | 'plexo-solar' | 'sacral' | 'raiz';
export type CardId = number & { readonly __brand: 'CardId' };
export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;
export type Locale = 'pt-BR' | 'en' | 'es';

// ── Section 2: Tradition taxonomy ────────────────────────────────────────────

export type TraditionId =
  | 'candomble' | 'ifa' | 'umbanda' | 'cabala' | 'astrologia'
  | 'tantra' | 'numerologia' | 'cigano-ramiro' | 'tarot' | 'sagradas-escrituras';

export interface Tradition {
  id: TraditionId;
  name: string;
  region: string;
  language: Locale;
  family: 'afro-brasileira' | 'esoterica-ocidental' | 'esoterica-oriental' | 'mesopotamica' | 'tradicao-cigana';
  description: string;
}

export const TRADITIONS: Record<TraditionId, Tradition> = {
  candomble: { id: 'candomble', name: 'Candomblé', region: 'Brasil/África', language: 'pt-BR', family: 'afro-brasileira', description: 'Religião de matriz Yorubá com foco em orixás, axé e terreiro.' },
  ifa: { id: 'ifa', name: 'Ifá', region: 'África Ocidental', language: 'pt-BR', family: 'afro-brasileira', description: 'Sistema divinatório Yorubá baseado nos 256 Odu e no babalaô.' },
  umbanda: { id: 'umbanda', name: 'Umbanda', region: 'Brasil', language: 'pt-BR', family: 'afro-brasileira', description: 'Religião brasileira sincrética com guias, caboclos e orixás.' },
  cabala: { id: 'cabala', name: 'Cabala', region: 'Mediterrâneo', language: 'pt-BR', family: 'esoterica-ocidental', description: 'Tradição mística judaica: Sefirot, Árvore da Vida, letras hebraicas.' },
  astrologia: { id: 'astrologia', name: 'Astrologia', region: 'Mediterrâneo', language: 'pt-BR', family: 'esoterica-ocidental', description: 'Linguagem dos astros: signos, planetas, casas e aspectos.' },
  tantra: { id: 'tantra', name: 'Tantra', region: 'Índia/Himalaia', language: 'pt-BR', family: 'esoterica-oriental', description: 'Tradição tântrica indiana: kundalini, chakras, Shiva-Shakti.' },
  numerologia: { id: 'numerologia', name: 'Numerologia', region: 'Universal', language: 'pt-BR', family: 'esoterica-ocidental', description: 'Estudo do simbolismo dos números 1-9 + mestres 11/22/33.' },
  'cigano-ramiro': { id: 'cigano-ramiro', name: 'Cigano Ramiro', region: 'Brasil/Espanha', language: 'pt-BR', family: 'tradicao-cigana', description: 'Método cigano pessoal de Ramiro: 36 cartas + Mesa Real + cruzamentos.' },
  tarot: { id: 'tarot', name: 'Tarot', region: 'Europa', language: 'pt-BR', family: 'esoterica-ocidental', description: 'Sistema simbólico de 78 arcanos.' },
  'sagradas-escrituras': { id: 'sagradas-escrituras', name: 'Sagradas Escrituras', region: 'Oriente Médio', language: 'pt-BR', family: 'mesopotamica', description: 'Textos bíblicos, evangélicos e sapienciais de tradição abraâmica.' },
};

// ── Section 3: Sacred taxonomy enums ────────────────────────────────────────

export const ORIXAS: readonly OrixaName[] = [
  'oxala', 'iemanja', 'oxum', 'ogum', 'xango', 'iansa', 'obaluae',
  'oxossi', 'omolu', 'oxumare', 'nanã', 'iaca', 'exu', 'pomba-gira',
  'caboclo', 'preto-velho',
];

export const SEFIROT: readonly SefirotId[] = [
  'keter', 'chokhmah', 'binah', 'chesed', 'gevurah',
  'tiferet', 'netzach', 'hod', 'yesod', 'malkhut',
];

export const PLANETS: readonly Planet[] = [
  'sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter',
  'saturno', 'urano', 'netuno', 'plutao', 'terra',
];

export const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
  'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes',
];

export const CHAKRAS: readonly ChakraId[] = [
  'coroa', 'terceiro-olho', 'garganta', 'coracao',
  'plexo-solar', 'sacral', 'raiz',
];

export const NUMEROLOGY_NUMBERS: readonly NumerologyNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33,
];
// ── Section 4: Quote & Citation interfaces ───────────────────────────────────

export interface SacredRef {
  kind: 'orixa' | 'sefirah' | 'planet' | 'sign' | 'chakra' | 'card' | 'numerology';
  value: string;
}

export interface Citation {
  tradition: TraditionId;
  book?: string;
  chapter?: string;
  page?: string;
  orixa?: OrixaName;
  card?: CardId;
  sefirah?: SefirotId;
  planet?: Planet;
  sign?: ZodiacSign;
  chakra?: ChakraId;
}

export interface Quote {
  id: QuoteId;
  text: string;
  author?: string;
  source: string;
  tradition: TraditionId;
  topic: string;
  language: Locale;
  sacredRefs: SacredRef[];
  tags: string[];
  mood?: 'alegre' | 'reflexivo' | 'intenso' | 'suave' | 'celebratorio';
  context?: 'orixa-day' | 'season' | 'card-reading' | 'numerology' | 'meditation';
  citation: Citation;
}

export interface QuoteQuery {
  text?: string;
  tradition?: TraditionId;
  topic?: string;
  tags?: string[];
  mood?: Quote['mood'];
  context?: Quote['context'];
  sacredRef?: SacredRef;
  locale?: Locale;
  limit?: number;
}

export interface QuoteResult {
  quote: Quote;
  score: number;
  matchedFields: string[];
}

export interface PickOpts {
  topic?: string;
  mood?: Quote['mood'];
  context?: Quote['context'];
  tag?: string;
}

export interface PickContext {
  situation?: 'opening' | 'closing' | 'crisis' | 'celebration' | 'mourning' | 'decision';
  orixa?: OrixaName;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  mood?: Quote['mood'];
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface CoverageReport {
  totals: number;
  expected: number;
  missing: string[];
  isFullCoverage: boolean;
  percentComplete: number;
  byTradition: Record<TraditionId, number>;
}

export interface TraditionSummary {
  id: TraditionId;
  name: string;
  count: number;
  language: Locale;
}

// ── Section 5: Error classes ────────────────────────────────────────────────

export class QuoteError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'QuoteError';
    this.code = code;
  }
}

export class InvalidQuoteError extends QuoteError {
  constructor(message: string) {
    super('INVALID_QUOTE', `INVALID_QUOTE: ${message}`);
    this.name = 'InvalidQuoteError';
  }
}

export class InvalidTraditionError extends QuoteError {
  constructor(message: string) {
    super('INVALID_TRADITION', `INVALID_TRADITION: ${message}`);
    this.name = 'InvalidTraditionError';
  }
}

export class SacredBoundaryError extends QuoteError {
  constructor(message: string) {
    super('SACRED_BOUNDARY', `SACRED_BOUNDARY: ${message}`);
    this.name = 'SacredBoundaryError';
  }
}

export class EmptyCatalogError extends QuoteError {
  constructor(message: string) {
    super('EMPTY_CATALOG', `EMPTY_CATALOG: ${message}`);
    this.name = 'EmptyCatalogError';
  }
}

// ── Section 6: Quote catalog ────────────────────────────────────────────────
// Split into 8 tradition blocks (≤ 50 lines each) to avoid response-size ceiling
// that killed Worker B (a 200+ single-block response hit finish_reason="error").

// ── 6.1 Candomblé — 15 quotes ────────────────────────────────────────────────

export const QUOTES_CANDOMBLE: Quote[] = [
  { id: 'cd-01' as QuoteId, text: 'Oxalá é o pai maior. Branco como a paz que cobre o mundo antes da tempestade.', source: 'Orixá Oxalá — ladainha do dia de São João', tradition: 'candomble', topic: 'paz', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'oxala' }], tags: ['paz', 'paternidade', 'axé'], mood: 'suave', context: 'orixa-day', citation: { tradition: 'candomble', orixa: 'oxala', book: 'O Segredo das Folhas', chapter: '3' } },
  { id: 'cd-02' as QuoteId, text: 'Iemanjá reina nas águas salgadas, mãe que recolhe os filhos da beira do mar.', source: 'Cantiga para Iemanjá', tradition: 'candomble', topic: 'maternidade', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'iemanja' }], tags: ['mãe', 'mar', 'acolhimento'], mood: 'suave', context: 'orixa-day', citation: { tradition: 'candomble', orixa: 'iemanja' } },
  { id: 'cd-03' as QuoteId, text: 'Oxum dourada, rainha das águas doces, cuida do amor e da fertilidade da terra.', source: 'Orixás da Nação Ketu', tradition: 'candomble', topic: 'amor', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'oxum' }], tags: ['amor', 'doçura', 'ouro'], mood: 'celebratorio', citation: { tradition: 'candomble', orixa: 'oxum' } },
  { id: 'cd-04' as QuoteId, text: 'Ogum abre os caminhos com seu ferro e sua coragem. Antes dele, a mata era fechada.', source: 'Tradição oral do terreiro', tradition: 'candomble', topic: 'coragem', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'ogum' }], tags: ['caminho', 'ferro', 'guerra'], mood: 'intenso', citation: { tradition: 'candomble', orixa: 'ogum' } },
  { id: 'cd-05' as QuoteId, text: 'Xangô é a justiça que desce do céu em forma de raio. Juiz dos homens e dos orixás.', source: 'Cantigas de Xangô', tradition: 'candomble', topic: 'justiça', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'xango' }], tags: ['justiça', 'raio', 'juiz'], mood: 'intenso', citation: { tradition: 'candomble', orixa: 'xango' } },
  { id: 'cd-06' as QuoteId, text: 'Iansã sopra os raios com seu vento. Senhora dos temporais e das paixões.', source: 'Memórias do Candomblé', tradition: 'candomble', topic: 'vento', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'iansa' }], tags: ['vento', 'tempestade', 'paixão'], mood: 'intenso', citation: { tradition: 'candomble', orixa: 'iansa' } },
  { id: 'cd-07' as QuoteId, text: 'Obaluaiê se veste de palha. Quem o toca sem respeito pega a doença; quem o respeita ganha a cura.', source: 'Orixá Obaluaiê', tradition: 'candomble', topic: 'cura', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'obaluae' }], tags: ['cura', 'doença', 'respeito'], mood: 'reflexivo', citation: { tradition: 'candomble', orixa: 'obaluae' } },
  { id: 'cd-08' as QuoteId, text: 'Oxossi caça com o arco e a flecha. É o rei das matas, senhor dos búfalos.', source: 'Cantigas do Caçador', tradition: 'candomble', topic: 'natureza', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'oxossi' }], tags: ['caça', 'mata', 'provisão'], mood: 'celebratorio', citation: { tradition: 'candomble', orixa: 'oxossi' } },
  { id: 'cd-09' as QuoteId, text: 'Nanã carrega a lama dos começos. Antes do mundo ser forma, era o barro nas mãos dela.', source: 'Orixás da Criação', tradition: 'candomble', topic: 'origem', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'nanã' }], tags: ['origem', 'barro', 'anciã'], mood: 'reflexivo', context: 'meditation', citation: { tradition: 'candomble', orixa: 'nanã' } },
  { id: 'cd-10' as QuoteId, text: 'Exu é o guardião da encruzilhada. Sem ele, nenhuma oferenda chega ao seu destino.', source: 'Exu — o Guardião', tradition: 'candomble', topic: 'comunicação', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'exu' }], tags: ['exu', 'encruzilhada', 'mensagem'], mood: 'intenso', citation: { tradition: 'candomble', orixa: 'exu' } },
  { id: 'cd-11' as QuoteId, text: 'O axé não se vende, não se compra — se recebe, se cuida, se compartilha.', source: 'Provérbio do Terreiro', tradition: 'candomble', topic: 'axé', language: 'pt-BR', sacredRefs: [], tags: ['axé', 'sabedoria', 'terreiro'], mood: 'reflexivo', citation: { tradition: 'candomble' } },
  { id: 'cd-12' as QuoteId, text: 'Quem não conhece o próprio Ori, não conhece o próprio caminho.', source: 'Sabedoria Yorubá', tradition: 'candomble', topic: 'autoconhecimento', language: 'pt-BR', sacredRefs: [], tags: ['ori', 'caminho', 'si-mesmo'], mood: 'reflexivo', context: 'meditation', citation: { tradition: 'candomble' } },
  { id: 'cd-13' as QuoteId, text: 'Omolu cobre o corpo com palha para esconder a luz que é dele. Mas quem chega perto sente a cura.', source: 'Obaluaiê e Omolu', tradition: 'candomble', topic: 'cura', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'omolu' }], tags: ['cura', 'palha', 'mistério'], mood: 'reflexivo', citation: { tradition: 'candomble', orixa: 'omolu' } },
  { id: 'cd-14' as QuoteId, text: 'Oxumarê desenha o arco-íris sobre as águas. Liga o céu e a terra em curva.', source: 'Orixá da Transformação', tradition: 'candomble', topic: 'transformação', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'oxumare' }], tags: ['arco-íris', 'ligação', 'transformação'], mood: 'celebratorio', citation: { tradition: 'candomble', orixa: 'oxumare' } },
  { id: 'cd-15' as QuoteId, text: 'Iacê (Iaô) é a rainha do jogo do bicho, das ruas e do terreiro. Senha da simplicidade.', source: 'Cantigas de Iaô', tradition: 'candomble', topic: 'singeleza', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'iaca' }], tags: ['singeleza', 'rua', 'criança'], mood: 'alegre', citation: { tradition: 'candomble', orixa: 'iaca' } },
];

// ── 6.2 Ifá — 12 quotes ─────────────────────────────────────────────────────

export const QUOTES_IFA: Quote[] = [
  { id: 'if-01' as QuoteId, text: 'O Odu Ofun revela o mistério do começo. Tudo o que nasce carrega o destino de sua origem.', source: 'Odu Ofun — Ifá Tradicional', tradition: 'ifa', topic: 'origem', language: 'pt-BR', sacredRefs: [], tags: ['odu', 'ofun', 'começo'], mood: 'reflexivo', context: 'meditation', citation: { tradition: 'ifa', book: 'Odù Ifá', chapter: 'Ofun' } },
  { id: 'if-02' as QuoteId, text: 'No Ogbe, o fogo primordial que separa e une. A dualidade é o começo do movimento.', source: 'Odu Ogbe — Ifá', tradition: 'ifa', topic: 'dualidade', language: 'pt-BR', sacredRefs: [], tags: ['odu', 'ogbe', 'movimento'], mood: 'reflexivo', citation: { tradition: 'ifa', book: 'Odù Ifá', chapter: 'Ogbe' } },
  { id: 'if-03' as QuoteId, text: 'Quem consulta Ifá com verdade recebe o que precisa, não o que quer.', source: 'Sabedoria do Babalaô', tradition: 'ifa', topic: 'consulta', language: 'pt-BR', sacredRefs: [], tags: ['babalaô', 'verdade', 'consulta'], mood: 'reflexivo', citation: { tradition: 'ifa' } },
  { id: 'if-04' as QuoteId, text: 'Iroke Ifá é a varinha que toca o destino. Não corta, marca.', source: 'Objetos Litúrgicos de Ifá', tradition: 'ifa', topic: 'destino', language: 'pt-BR', sacredRefs: [], tags: ['iroke', 'destino', 'rito'], mood: 'intenso', citation: { tradition: 'ifa' } },
  { id: 'if-05' as QuoteId, text: 'Orunmila vê o que foi, o que é e o que será. Quem ouve o babalaô ouve o oráculo.', source: 'Orunmila — Sabedoria', tradition: 'ifa', topic: 'oráculo', language: 'pt-BR', sacredRefs: [], tags: ['orunmila', 'oráculo', 'sabedoria'], mood: 'reflexivo', citation: { tradition: 'ifa' } },
  { id: 'if-06' as QuoteId, text: 'O opelê (ou opira) cai 16 vezes no jogo. Cada queda, uma lição.', source: 'Jogo de Ifá', tradition: 'ifa', topic: 'jogo', language: 'pt-BR', sacredRefs: [], tags: ['opelê', 'jogo', 'lição'], mood: 'reflexivo', context: 'card-reading', citation: { tradition: 'ifa' } },
  { id: 'if-07' as QuoteId, text: 'No Odu Iroso, a planta da folha cura antes do machado cortar. Cuidado vem antes da batalha.', source: 'Odu Iroso — Ifá', tradition: 'ifa', topic: 'cautela', language: 'pt-BR', sacredRefs: [], tags: ['odu', 'iroso', 'folha'], mood: 'reflexivo', citation: { tradition: 'ifa', book: 'Odù Ifá', chapter: 'Iroso' } },
  { id: 'if-08' as QuoteId, text: 'No Odu Owanrin, a justiça não distingue coroa de escravo. A balança de Xangô pesa todos.', source: 'Odu Owanrin — Ifá', tradition: 'ifa', topic: 'justiça', language: 'pt-BR', sacredRefs: [], tags: ['odu', 'owanrin', 'justiça'], mood: 'intenso', citation: { tradition: 'ifa', book: 'Odù Ifá', chapter: 'Owanrin' } },
  { id: 'if-09' as QuoteId, text: 'Ewé (folhas) carregam ebó (sacrifício) e ire (bênção). Quem conhece a folha conhece o caminho.', source: 'Folhas de Ifá', tradition: 'ifa', topic: 'natureza', language: 'pt-BR', sacredRefs: [], tags: ['ewé', 'ebó', 'ire'], mood: 'reflexivo', citation: { tradition: 'ifa' } },
  { id: 'if-10' as QuoteId, text: 'Esú abre a estrada, mas cobra pedágio. Respeitar Exu é abrir caminho sem tropeço.', source: 'Exu em Ifá', tradition: 'ifa', topic: 'respeito', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'exu' }], tags: ['exu', 'estrada', 'respeito'], mood: 'intenso', citation: { tradition: 'ifa', orixa: 'exu' } },
  { id: 'if-11' as QuoteId, text: 'O Akoda (iniciado) aprende que escutar vale mais que falar. Três anos de silêncio para entrar no mistério.', source: 'Iniciação em Ifá', tradition: 'ifa', topic: 'iniciação', language: 'pt-BR', sacredRefs: [], tags: ['iniciação', 'silêncio', 'aprendizado'], mood: 'reflexivo', citation: { tradition: 'ifa' } },
  { id: 'if-12' as QuoteId, text: 'O Odu que cai hoje não é acaso: é o que seu Ori precisava ouvir.', source: 'Tradição Oral — Babalaô', tradition: 'ifa', topic: 'destino', language: 'pt-BR', sacredRefs: [], tags: ['ori', 'odu', 'destino'], mood: 'reflexivo', citation: { tradition: 'ifa' } },
];

// ── 6.3 Umbanda — 12 quotes ──────────────────────────────────────────────────

export const QUOTES_UMBANDA: Quote[] = [
  { id: 'um-01' as QuoteId, text: 'Na Umbanda, todo espírito tem vez. Preto-velho, caboclo, criança — ninguém fica sem terreiro.', source: 'Fundamentos da Umbanda', tradition: 'umbanda', topic: 'inclusão', language: 'pt-BR', sacredRefs: [], tags: ['inclusão', 'espírito', 'terreiro'], mood: 'celebratorio', citation: { tradition: 'umbanda' } },
  { id: 'um-02' as QuoteId, text: 'Preto-Velho carrega o cachimbo e a paciência. Ensina que o tempo da colheita não se apressa.', source: 'Linha de Pretos-Velhos', tradition: 'umbanda', topic: 'paciência', language: 'pt-BR', sacredRefs: [], tags: ['preto-velho', 'paciência', 'cachimbo'], mood: 'suave', citation: { tradition: 'umbanda' } },
  { id: 'um-03' as QuoteId, text: 'Caboclo vem da mata com a força do verde. Lembra que a cura mora no simples.', source: 'Linha dos Caboclos', tradition: 'umbanda', topic: 'natureza', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'caboclo' }], tags: ['caboclo', 'mata', 'simples'], mood: 'celebratorio', citation: { tradition: 'umbanda', orixa: 'caboclo' } },
  { id: 'um-04' as QuoteId, text: 'Pomba-Gira dança na encruzilhada da noite. Governa paixões e ambições — sem medo, sem julgamento.', source: 'Linha de Pomba-Gira', tradition: 'umbanda', topic: 'paixão', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'pomba-gira' }], tags: ['pomba-gira', 'paixão', 'encruzilhada'], mood: 'intenso', citation: { tradition: 'umbanda', orixa: 'pomba-gira' } },
  { id: 'um-05' as QuoteId, text: 'A gira é o momento em que o espírito baixa e o médium vira casa. Acolher é parte da missão.', source: 'Gira de Umbanda', tradition: 'umbanda', topic: 'mediunidade', language: 'pt-BR', sacredRefs: [], tags: ['gira', 'mediunidade', 'acolhimento'], mood: 'celebratorio', citation: { tradition: 'umbanda' } },
  { id: 'um-06' as QuoteId, text: 'Não se faz Umbanda com medo de Exu. Ele abre a porta por onde entram todos os outros.', source: 'Exu na Umbanda', tradition: 'umbanda', topic: 'exu', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'exu' }], tags: ['exu', 'porta', 'respeito'], mood: 'intenso', citation: { tradition: 'umbanda', orixa: 'exu' } },
  { id: 'um-07' as QuoteId, text: 'Defumação limpa o corpo antes da gira. Limpeza é o primeiro passo da caridade.', source: 'Rituais de Umbanda', tradition: 'umbanda', topic: 'limpeza', language: 'pt-BR', sacredRefs: [], tags: ['defumação', 'limpeza', 'caridade'], mood: 'suave', citation: { tradition: 'umbanda' } },
  { id: 'um-08' as QuoteId, text: 'A caridade na Umbanda não é moeda. É tempo, escuta, vela acesa, copo d\'água gelado.', source: 'Doutrina da Caridade', tradition: 'umbanda', topic: 'caridade', language: 'pt-BR', sacredRefs: [], tags: ['caridade', 'serviço', 'simples'], mood: 'suave', citation: { tradition: 'umbanda' } },
  { id: 'um-09' as QuoteId, text: 'Ogum de Umbanda abre os caminhos da espada. Quem carrega ferro carrega coragem.', source: 'Ogum na Umbanda', tradition: 'umbanda', topic: 'coragem', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'ogum' }], tags: ['ogum', 'ferro', 'coragem'], mood: 'intenso', citation: { tradition: 'umbanda', orixa: 'ogum' } },
  { id: 'um-10' as QuoteId, text: 'Criança (Erê) ri para lembrar que espírito leve também ensina. Não leve só é leveza.', source: 'Linha das Crianças', tradition: 'umbanda', topic: 'alegria', language: 'pt-BR', sacredRefs: [], tags: ['criança', 'erê', 'alegria'], mood: 'alegre', citation: { tradition: 'umbanda' } },
  { id: 'um-11' as QuoteId, text: 'Sete linhas, sete forças. Nenhuma é mais importante que outra — todas se completam.', source: 'As Sete Linhas', tradition: 'umbanda', topic: 'sete linhas', language: 'pt-BR', sacredRefs: [], tags: ['linhas', 'complementar', 'forças'], mood: 'reflexivo', citation: { tradition: 'umbanda' } },
  { id: 'um-12' as QuoteId, text: 'Mestre Iansã vem com o vento que limpa. Antes dela, o mal não fica — depois dela, recomeço.', source: 'Iansã na Umbanda', tradition: 'umbanda', topic: 'renovação', language: 'pt-BR', sacredRefs: [{ kind: 'orixa', value: 'iansa' }], tags: ['iansa', 'vento', 'recomeço'], mood: 'celebratorio', citation: { tradition: 'umbanda', orixa: 'iansa' } },
];

// ── 6.4 Cabala — 12 quotes ───────────────────────────────────────────────────

export const QUOTES_CABALA: Quote[] = [
  { id: 'cb-01' as QuoteId, text: 'Keter é a coroa que não se vê. Está antes de tudo, mas tudo começa dela.', source: 'Sefirot — Keter', tradition: 'cabala', topic: 'keter', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'keter' }], tags: ['keter', 'coroa', 'origem'], mood: 'reflexivo', context: 'meditation', citation: { tradition: 'cabala', sefirah: 'keter', book: 'Árvore da Vida' } },
  { id: 'cb-02' as QuoteId, text: 'Chokhmah é o relâmpago da sabedoria. Não espera, não demora.', source: 'Sefirot — Chokhmah', tradition: 'cabala', topic: 'sabedoria', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'chokhmah' }], tags: ['chokhmah', 'sabedoria', 'relâmpago'], mood: 'intenso', citation: { tradition: 'cabala', sefirah: 'chokhmah' } },
  { id: 'cb-03' as QuoteId, text: 'Binah é a compreensão que carrega o peso do parto. Mãe de todas as formas.', source: 'Sefirot — Binah', tradition: 'cabala', topic: 'compreensão', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'binah' }], tags: ['binah', 'compreensão', 'mãe'], mood: 'reflexivo', citation: { tradition: 'cabala', sefirah: 'binah' } },
  { id: 'cb-04' as QuoteId, text: 'Chesed é a mão aberta que dá sem cálculo. Misericórdia pura.', source: 'Sefirot — Chesed', tradition: 'cabala', topic: 'misericórdia', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'chesed' }], tags: ['chesed', 'misericórdia', 'dar'], mood: 'celebratorio', citation: { tradition: 'cabala', sefirah: 'chesed' } },
  { id: 'cb-05' as QuoteId, text: 'Gevurah é o fio da espada que corta o excesso. Disciplina sem crueldade.', source: 'Sefirot — Gevurah', tradition: 'cabala', topic: 'disciplina', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'gevurah' }], tags: ['gevurah', 'disciplina', 'espada'], mood: 'intenso', citation: { tradition: 'cabala', sefirah: 'gevurah' } },
  { id: 'cb-06' as QuoteId, text: 'Tiferet é o coração da Árvore. Onde misericórdia encontra disciplina e nasce a beleza.', source: 'Sefirot — Tiferet', tradition: 'cabala', topic: 'beleza', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'tiferet' }], tags: ['tiferet', 'coração', 'beleza'], mood: 'celebratorio', context: 'meditation', citation: { tradition: 'cabala', sefirah: 'tiferet' } },
  { id: 'cb-07' as QuoteId, text: 'Netzach é a vitória que persiste. Vence sem ferir, dura sem cansar.', source: 'Sefirot — Netzach', tradition: 'cabala', topic: 'vitória', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'netzach' }], tags: ['netzach', 'vitória', 'persistência'], mood: 'intenso', citation: { tradition: 'cabala', sefirah: 'netzach' } },
  { id: 'cb-08' as QuoteId, text: 'Hod é o eco da forma. Onde Netzach sente, Hod pronuncia.', source: 'Sefirot — Hod', tradition: 'cabala', topic: 'palavra', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'hod' }], tags: ['hod', 'palavra', 'forma'], mood: 'reflexivo', citation: { tradition: 'cabala', sefirah: 'hod' } },
  { id: 'cb-09' as QuoteId, text: 'Yesod é o fundamento onde todas as energias se encontram antes de virar mundo.', source: 'Sefirot — Yesod', tradition: 'cabala', topic: 'fundamento', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'yesod' }], tags: ['yesod', 'fundamento', 'lua'], mood: 'reflexivo', citation: { tradition: 'cabala', sefirah: 'yesod' } },
  { id: 'cb-10' as QuoteId, text: 'Malkhut é o Reino, onde o céu se faz terra. Toda Sefirá se cumpre aqui.', source: 'Sefirot — Malkhut', tradition: 'cabala', topic: 'reino', language: 'pt-BR', sacredRefs: [{ kind: 'sefirah', value: 'malkhut' }], tags: ['malkhut', 'reino', 'terra'], mood: 'celebratorio', citation: { tradition: 'cabala', sefirah: 'malkhut' } },
  { id: 'cb-11' as QuoteId, text: 'A Árvore da Vida não se explica com palavras — se lê respirando.', source: 'Tradição Oral — Cabalista', tradition: 'cabala', topic: 'prática', language: 'pt-BR', sacredRefs: [], tags: ['árvore', 'prática', 'respiração'], mood: 'reflexivo', context: 'meditation', citation: { tradition: 'cabala' } },
  { id: 'cb-12' as QuoteId, text: 'O Zohar é a veste do texto: por fora, narrativa; por dentro, luz.', source: 'O Zohar — Comentários', tradition: 'cabala', topic: 'estudo', language: 'pt-BR', sacredRefs: [], tags: ['zohar', 'texto', 'luz'], mood: 'reflexivo', citation: { tradition: 'cabala', book: 'Zohar' } },
];

// ── 6.5 Astrologia — 12 quotes ───────────────────────────────────────────────

export const QUOTES_ASTROLOGIA: Quote[] = [
  { id: 'as-01' as QuoteId, text: 'O Sol no mapa é quem você veio ser. A Lua é quem você foi antes de virar gente.', source: 'Mapa Astral — Sol e Lua', tradition: 'astrologia', topic: 'identidade', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'sol' }, { kind: 'planet', value: 'lua' }], tags: ['sol', 'lua', 'essência'], mood: 'reflexivo', context: 'meditation', citation: { tradition: 'astrologia', planet: 'sol' } },
  { id: 'as-02' as QuoteId, text: 'Mercúrio rege a palavra e a ponte. Sem Mercúrio, o pensamento fica em casa.', source: 'Planetas — Mercúrio', tradition: 'astrologia', topic: 'comunicação', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'mercurio' }], tags: ['mercúrio', 'palavra', 'mente'], mood: 'reflexivo', citation: { tradition: 'astrologia', planet: 'mercurio' } },
  { id: 'as-03' as QuoteId, text: 'Vênus ensina que amar é saber o que vale. Não só o que se quer — o que se honra.', source: 'Planetas — Vênus', tradition: 'astrologia', topic: 'amor', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'venus' }], tags: ['vênus', 'amor', 'valor'], mood: 'celebratorio', citation: { tradition: 'astrologia', planet: 'venus' } },
  { id: 'as-04' as QuoteId, text: 'Marte é a brasa que ninguém apagou. Coragem é fogo transformado em ação.', source: 'Planetas — Marte', tradition: 'astrologia', topic: 'coragem', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'marte' }], tags: ['marte', 'coragem', 'ação'], mood: 'intenso', citation: { tradition: 'astrologia', planet: 'marte' } },
  { id: 'as-05' as QuoteId, text: 'Júpiter abre a porta grande. Quem cruza essa porta encontra o sentido.', source: 'Planetas — Júpiter', tradition: 'astrologia', topic: 'expansão', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'jupiter' }], tags: ['júpiter', 'expansão', 'sentido'], mood: 'celebratorio', citation: { tradition: 'astrologia', planet: 'jupiter' } },
  { id: 'as-06' as QuoteId, text: 'Saturno ensina com o tempo. O que se constrói com paciência, vento não derruba.', source: 'Planetas — Saturno', tradition: 'astrologia', topic: 'tempo', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'saturno' }], tags: ['saturno', 'tempo', 'estrutura'], mood: 'reflexivo', citation: { tradition: 'astrologia', planet: 'saturno' } },
  { id: 'as-07' as QuoteId, text: 'Urano quebra o velho pra deixar entrar o novo. Às vezes o relâmpago é a cura.', source: 'Planetas — Urano', tradition: 'astrologia', topic: 'revolução', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'urano' }], tags: ['urano', 'revolução', 'novo'], mood: 'intenso', citation: { tradition: 'astrologia', planet: 'urano' } },
  { id: 'as-08' as QuoteId, text: 'Netuno dissolve o que estava duro pra você poder sonhar de novo.', source: 'Planetas — Netuno', tradition: 'astrologia', topic: 'sonho', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'netuno' }], tags: ['netuno', 'sonho', 'dissolução'], mood: 'reflexivo', citation: { tradition: 'astrologia', planet: 'netuno' } },
  { id: 'as-09' as QuoteId, text: 'Plutão é o que morre e o que nasce. Nada é desperdiçado, só transformado.', source: 'Planetas — Plutão', tradition: 'astrologia', topic: 'transformação', language: 'pt-BR', sacredRefs: [{ kind: 'planet', value: 'plutao' }], tags: ['plutão', 'morte', 'renascimento'], mood: 'intenso', citation: { tradition: 'astrologia', planet: 'plutao' } },
  { id: 'as-10' as QuoteId, text: 'Áries começa. Touro sustenta. Gêmeos pergunta. Câncer cuida.', source: 'Os Signos — Começo', tradition: 'astrologia', topic: 'signos', language: 'pt-BR', sacredRefs: [{ kind: 'sign', value: 'aries' }, { kind: 'sign', value: 'touro' }, { kind: 'sign', value: 'gemeos' }, { kind: 'sign', value: 'cancer' }], tags: ['signos', 'início', 'zodíaco'], mood: 'reflexivo', citation: { tradition: 'astrologia', sign: 'aries' } },
  { id: 'as-11' as QuoteId, text: 'Leão brilha. Virgem serve. Libra equilibra. Escorpião aprofunda.', source: 'Os Signos — Meio', tradition: 'astrologia', topic: 'signos', language: 'pt-BR', sacredRefs: [{ kind: 'sign', value: 'leao' }, { kind: 'sign', value: 'virgem' }, { kind: 'sign', value: 'libra' }, { kind: 'sign', value: 'escorpiao' }], tags: ['signos', 'meio', 'zodíaco'], mood: 'reflexivo', citation: { tradition: 'astrologia', sign: 'leao' } },
  { id: 'as-12' as QuoteId, text: 'Sagitário busca. Capricórnio constrói. Aquário inova. Peixes dissolve no amor.', source: 'Os Signos — Fim', tradition: 'astrologia', topic: 'signos', language: 'pt-BR', sacredRefs: [{ kind: 'sign', value: 'sagitario' }, { kind: 'sign', value: 'capricornio' }, { kind: 'sign', value: 'aquario' }, { kind: 'sign', value: 'peixes' }], tags: ['signos', 'fim', 'zodíaco'], mood: 'celebratorio', citation: { tradition: 'astrologia', sign: 'sagitario' } },
];

// ── 6.6 Tantra — 10 quotes ───────────────────────────────────────────────────

export const QUOTES_TANTRA: Quote[] = [
  { id: 'tn-01' as QuoteId, text: 'Shiva e Shakti dançam. Sem um, o outro não gira. O mundo nasce desse encontro.', source: 'Tradição Tântrica — Shiva Shakti', tradition: 'tantra', topic: 'união', language: 'pt-BR', sacredRefs: [], tags: ['shiva', 'shakti', 'dança'], mood: 'celebratorio', citation: { tradition: 'tantra' } },
  { id: 'tn-02' as QuoteId, text: 'Kundalini acorda de baixo pra cima. Quando sobe, encontra o céu dentro do chão.', source: 'Kundalini — Tradição', tradition: 'tantra', topic: 'kundalini', language: 'pt-BR', sacredRefs: [], tags: ['kundalini', 'subida', 'energia'], mood: 'intenso', context: 'meditation', citation: { tradition: 'tantra' } },
  { id: 'tn-03' as QuoteId, text: 'Muladhara (raiz) ancora. Se você voa sem ancorar, cai mais fundo.', source: 'Chakra Raiz', tradition: 'tantra', topic: 'chakra raiz', language: 'pt-BR', sacredRefs: [{ kind: 'chakra', value: 'raiz' }], tags: ['muladhara', 'raiz', 'âncora'], mood: 'reflexivo', citation: { tradition: 'tantra', chakra: 'raiz' } },
  { id: 'tn-04' as QuoteId, text: 'Svadhisthana (sacral) lembra que sentir não é fraqueza. Sentir é permissão.', source: 'Chakra Sacral', tradition: 'tantra', topic: 'chakra sacral', language: 'pt-BR', sacredRefs: [{ kind: 'chakra', value: 'sacral' }], tags: ['svadhisthana', 'sacral', 'sentir'], mood: 'suave', citation: { tradition: 'tantra', chakra: 'sacral' } },
  { id: 'tn-05' as QuoteId, text: 'Manipura (plexo solar) é o fogo da vontade. Queima a mentira, deixa o ouro.', source: 'Chakra Plexo Solar', tradition: 'tantra', topic: 'chakra plexo', language: 'pt-BR', sacredRefs: [{ kind: 'chakra', value: 'plexo-solar' }], tags: ['manipura', 'fogo', 'vontade'], mood: 'intenso', citation: { tradition: 'tantra', chakra: 'plexo-solar' } },
  { id: 'tn-06' as QuoteId, text: 'Anahata (coração) é onde o peito aprende a amar sem se perder.', source: 'Chakra Coração', tradition: 'tantra', topic: 'chakra coração', language: 'pt-BR', sacredRefs: [{ kind: 'chakra', value: 'coracao' }], tags: ['anahata', 'coração', 'amor'], mood: 'suave', context: 'meditation', citation: { tradition: 'tantra', chakra: 'coracao' } },
  { id: 'tn-07' as QuoteId, text: 'Vishuddha (garganta) sussurra a verdade. Não grita — sussurra até virar som.', source: 'Chakra Garganta', tradition: 'tantra', topic: 'chakra garganta', language: 'pt-BR', sacredRefs: [{ kind: 'chakra', value: 'garganta' }], tags: ['vishuddha', 'verdade', 'voz'], mood: 'reflexivo', citation: { tradition: 'tantra', chakra: 'garganta' } },
  { id: 'tn-08' as QuoteId, text: 'Ajna (terceiro olho) vê o que os olhos não veem. Mas só quando você fecha os outros dois.', source: 'Chakra Terceiro Olho', tradition: 'tantra', topic: 'chakra terceiro olho', language: 'pt-BR', sacredRefs: [{ kind: 'chakra', value: 'terceiro-olho' }], tags: ['ajna', 'visão', 'intuição'], mood: 'reflexivo', citation: { tradition: 'tantra', chakra: 'terceiro-olho' } },
  { id: 'tn-09' as QuoteId, text: 'Sahasrara (coroa) é mil pétalas — uma pra cada pensamento de luz. Aberta, você lembra quem é.', source: 'Chakra Coroa', tradition: 'tantra', topic: 'chakra coroa', language: 'pt-BR', sacredRefs: [{ kind: 'chakra', value: 'coroa' }], tags: ['sahasrara', 'coroa', 'mil pétalas'], mood: 'celebratorio', citation: { tradition: 'tantra', chakra: 'coroa' } },
  { id: 'tn-10' as QuoteId, text: 'Tantra não é só sexo. É qualquer prática onde o ordinário vira portal pro divino.', source: 'Tantra — Definição Viva', tradition: 'tantra', topic: 'prática', language: 'pt-BR', sacredRefs: [], tags: ['tantra', 'prática', 'portal'], mood: 'reflexivo', citation: { tradition: 'tantra' } },
];

// ── 6.7 Numerologia — 12 quotes ─────────────────────────────────────────────

export const QUOTES_NUMEROLOGIA: Quote[] = [
  { id: 'nu-01' as QuoteId, text: 'O número 1 começa. Quem começa aceita ser único. Sem isso, não nasce nada.', source: 'Numerologia — 1', tradition: 'numerologia', topic: '1 - início', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '1' }], tags: ['1', 'início', 'liderança'], mood: 'intenso', context: 'numerology', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '1' } },
  { id: 'nu-02' as QuoteId, text: 'O 2 é a pausa entre dois mundos. Par, dual, lunar. Aprender a esperar.', source: 'Numerologia — 2', tradition: 'numerologia', topic: '2 - dualidade', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '2' }], tags: ['2', 'dualidade', 'lua'], mood: 'reflexivo', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '2' } },
  { id: 'nu-03' as QuoteId, text: '3 é a trindade criadora. Onde 1 e 2 se encontram, nasce a criança.', source: 'Numerologia — 3', tradition: 'numerologia', topic: '3 - criação', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '3' }], tags: ['3', 'criação', 'trindade'], mood: 'celebratorio', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '3' } },
  { id: 'nu-04' as QuoteId, text: '4 é a base quadrada. A casa, a estrutura, o alicerce que ninguém vê mas segura tudo.', source: 'Numerologia — 4', tradition: 'numerologia', topic: '4 - base', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '4' }], tags: ['4', 'base', 'estrutura'], mood: 'reflexivo', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '4' } },
  { id: 'nu-05' as QuoteId, text: '5 é a estrela de cinco pontas. Liberdade, movimento, o viajante que volta pra contar.', source: 'Numerologia — 5', tradition: 'numerologia', topic: '5 - movimento', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '5' }], tags: ['5', 'liberdade', 'movimento'], mood: 'alegre', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '5' } },
  { id: 'nu-06' as QuoteId, text: '6 é o lar que acolhe. Harmonia, beleza, responsabilidade — e o amor que não cansa.', source: 'Numerologia — 6', tradition: 'numerologia', topic: '6 - harmonia', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '6' }], tags: ['6', 'harmonia', 'lar'], mood: 'suave', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '6' } },
  { id: 'nu-07' as QuoteId, text: '7 é a busca que fecha o ciclo simples. Quem chega aqui começa a ouvir o invisível.', source: 'Numerologia — 7', tradition: 'numerologia', topic: '7 - busca', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '7' }], tags: ['7', 'busca', 'mistério'], mood: 'reflexivo', context: 'meditation', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '7' } },
  { id: 'nu-08' as QuoteId, text: '8 é o carma justo. O que você planta, o oito devolve — multiplicado.', source: 'Numerologia — 8', tradition: 'numerologia', topic: '8 - justiça', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '8' }], tags: ['8', 'karma', 'justiça'], mood: 'intenso', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '8' } },
  { id: 'nu-09' as QuoteId, text: '9 é o fim compassivo. Quem termina aqui aprende que soltar é amar também.', source: 'Numerologia — 9', tradition: 'numerologia', topic: '9 - conclusão', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '9' }], tags: ['9', 'conclusão', 'soltar'], mood: 'reflexivo', citation: { tradition: 'numerologia', book: 'Caminhos dos Números', chapter: '9' } },
  { id: 'nu-10' as QuoteId, text: '11 é o mestre do portal. Quem carrega 11 ouve o que os outros ainda não escutam.', source: 'Numerologia — 11', tradition: 'numerologia', topic: '11 - mestre', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '11' }], tags: ['11', 'mestre', 'portal'], mood: 'intenso', context: 'meditation', citation: { tradition: 'numerologia', book: 'Números Mestres', chapter: '11' } },
  { id: 'nu-11' as QuoteId, text: '22 é o mestre construtor. Sonha grande e ainda acha tempo de assentar tijolo.', source: 'Numerologia — 22', tradition: 'numerologia', topic: '22 - mestre', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '22' }], tags: ['22', 'construtor', 'mestre'], mood: 'celebratorio', citation: { tradition: 'numerologia', book: 'Números Mestres', chapter: '22' } },
  { id: 'nu-12' as QuoteId, text: '33 é o mestre que cura pelo exemplo. Onde 33 pisa, algo floresce.', source: 'Numerologia — 33', tradition: 'numerologia', topic: '33 - mestre', language: 'pt-BR', sacredRefs: [{ kind: 'numerology', value: '33' }], tags: ['33', 'cura', 'mestre'], mood: 'celebratorio', citation: { tradition: 'numerologia', book: 'Números Mestres', chapter: '33' } },
];

// ── 6.8 Cigano Ramiro — 15 quotes (mapa pessoal do usuário) ─────────────────

export const QUOTES_CIGANO_RAMIRO: Quote[] = [
  { id: 'cr-01' as QuoteId, text: 'A Mesa Real não mente. Ela mostra o que o consulente já sabe — mas não quer ver.', source: 'Método Pessoal — Cigano Ramiro', tradition: 'cigano-ramiro', topic: 'mesa real', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '1' }], tags: ['mesa real', 'verdade', 'cigano'], mood: 'reflexivo', context: 'card-reading', citation: { tradition: 'cigano-ramiro', card: 1 as CardId } },
  { id: 'cr-02' as QuoteId, text: 'O Cavaleiro abre caminhos. Quando ele aparece, a estrada está se abrindo.', source: 'Carta 1 — O Cavaleiro', tradition: 'cigano-ramiro', topic: 'cavaleiro', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '1' }], tags: ['cavaleiro', 'caminho', 'cigano'], mood: 'celebratorio', context: 'card-reading', citation: { tradition: 'cigano-ramiro', card: 1 as CardId } },
  { id: 'cr-03' as QuoteId, text: 'O Trevo lembra que a sorte vem, mas você tem que pisar nela.', source: 'Carta 2 — O Trevo', tradition: 'cigano-ramiro', topic: 'trevo', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '2' }], tags: ['trevo', 'sorte', 'cigano'], mood: 'alegre', citation: { tradition: 'cigano-ramiro', card: 2 as CardId } },
  { id: 'cr-04' as QuoteId, text: 'O Navio atravessa distância. Quem embarca nele aceita virar outro no caminho.', source: 'Carta 3 — O Navio', tradition: 'cigano-ramiro', topic: 'navio', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '3' }], tags: ['navio', 'viagem', 'cigano'], mood: 'intenso', citation: { tradition: 'cigano-ramiro', card: 3 as CardId } },
  { id: 'cr-05' as QuoteId, text: 'A Casa é o que fica. Onde você volta, mesmo que demore.', source: 'Carta 4 — A Casa', tradition: 'cigano-ramiro', topic: 'casa', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '4' }], tags: ['casa', 'lar', 'cigano'], mood: 'suave', citation: { tradition: 'cigano-ramiro', card: 4 as CardId } },
  { id: 'cr-06' as QuoteId, text: 'A Árvore carrega raízes antigas. Ela demora pra crescer, mas não derruba.', source: 'Carta 5 — A Árvore', tradition: 'cigano-ramiro', topic: 'árvore', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '5' }], tags: ['árvore', 'raiz', 'cigano'], mood: 'reflexivo', citation: { tradition: 'cigano-ramiro', card: 5 as CardId } },
  { id: 'cr-07' as QuoteId, text: 'As Nuvens vêm antes da clareira. Não se preocupe com o que ainda não viu.', source: 'Carta 6 — As Nuvens', tradition: 'cigano-ramiro', topic: 'nuvens', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '6' }], tags: ['nuvens', 'mistério', 'cigano'], mood: 'reflexivo', citation: { tradition: 'cigano-ramiro', card: 6 as CardId } },
  { id: 'cr-08' as QuoteId, text: 'A Serpente carrega sabedoria e veneno. Use o olho, não o bote.', source: 'Carta 7 — A Serpente', tradition: 'cigano-ramiro', topic: 'serpente', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '7' }], tags: ['serpente', 'sabedoria', 'cigano'], mood: 'intenso', citation: { tradition: 'cigano-ramiro', card: 7 as CardId } },
  { id: 'cr-09' as QuoteId, text: 'O Caixão é fim que vira começo. O que morre no caixão abre espaço pro que nasce.', source: 'Carta 8 — O Caixão', tradition: 'cigano-ramiro', topic: 'caixão', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '8' }], tags: ['caixão', 'fim', 'cigano'], mood: 'reflexivo', citation: { tradition: 'cigano-ramiro', card: 8 as CardId } },
  { id: 'cr-10' as QuoteId, text: 'O Buquê é o que se oferece sem pedir. Amor sem condição de volta.', source: 'Carta 9 — O Buquê', tradition: 'cigano-ramiro', topic: 'buquê', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '9' }], tags: ['buquê', 'amor', 'cigano'], mood: 'celebratorio', citation: { tradition: 'cigano-ramiro', card: 9 as CardId } },
  { id: 'cr-11' as QuoteId, text: 'A Foice corta o que não serve. Às vezes ceifar é misericórdia.', source: 'Carta 10 — A Foice', tradition: 'cigano-ramiro', topic: 'foice', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '10' }], tags: ['foice', 'corte', 'cigano'], mood: 'intenso', citation: { tradition: 'cigano-ramiro', card: 10 as CardId } },
  { id: 'cr-12' as QuoteId, text: 'O Chicote é a lição que dói. Sem dor de aprender, o caminho não firma.', source: 'Carta 11 — O Chicote', tradition: 'cigano-ramiro', topic: 'chicote', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '11' }], tags: ['chicote', 'lição', 'cigano'], mood: 'intenso', citation: { tradition: 'cigano-ramiro', card: 11 as CardId } },
  { id: 'cr-13' as QuoteId, text: 'Os Pássaros voam em bando. Conselho vem em vários, ouça o que repete.', source: 'Carta 12 — Os Pássaros', tradition: 'cigano-ramiro', topic: 'pássaros', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '12' }], tags: ['pássaros', 'conselho', 'cigano'], mood: 'reflexivo', citation: { tradition: 'cigano-ramiro', card: 12 as CardId } },
  { id: 'cr-14' as QuoteId, text: 'A Criança ri sem motivo. Não precisa de motivo pra estar vivo.', source: 'Carta 13 — A Criança', tradition: 'cigano-ramiro', topic: 'criança', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '13' }], tags: ['criança', 'alegria', 'cigano'], mood: 'alegre', citation: { tradition: 'cigano-ramiro', card: 13 as CardId } },
  { id: 'cr-15' as QuoteId, text: 'A Raposa é esperta. Quem ouve a raposa não cai na primeira armadilha.', source: 'Carta 14 — A Raposa', tradition: 'cigano-ramiro', topic: 'raposa', language: 'pt-BR', sacredRefs: [{ kind: 'card', value: '14' }], tags: ['raposa', 'astúcia', 'cigano'], mood: 'reflexivo', citation: { tradition: 'cigano-ramiro', card: 14 as CardId } },
];

// ── 6.9 Aggregate catalog ───────────────────────────────────────────────────

export const ALL_QUOTES: readonly Quote[] = [
  ...QUOTES_CANDOMBLE,
  ...QUOTES_IFA,
  ...QUOTES_UMBANDA,
  ...QUOTES_CABALA,
  ...QUOTES_ASTROLOGIA,
  ...QUOTES_TANTRA,
  ...QUOTES_NUMEROLOGIA,
  ...QUOTES_CIGANO_RAMIRO,
];

export const ALL_TRADITION_IDS: readonly TraditionId[] = [
  'candomble', 'ifa', 'umbanda', 'cabala', 'astrologia',
  'tantra', 'numerologia', 'cigano-ramiro',
];

// ── 6.10 Anti-misuse context denylist ────────────────────────────────────────

export const FORBIDDEN_CONTEXTS: readonly string[] = [
  'medical-diagnosis', 'investment-advice', 'legal-advice',
  'curse', 'enemy-work', 'lottery-numbers',
];

// ── Section 7: Pure helpers ──────────────────────────────────────────────────

export function clampUnit(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function safeId(input: unknown, prefix: string): string {
  if (typeof input !== 'string') return `${prefix}-anon`;
  const trimmed = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 64);
  return trimmed.length > 0 ? `${prefix}-${trimmed}` : `${prefix}-anon`;
}

export function truncateSacredText(text: string, maxLen: number): string {
  if (typeof text !== 'string') return '';
  const len = Math.max(1, Math.floor(maxLen));
  if (text.length <= len) return text;
  return text.slice(0, Math.max(1, len - 1)).trimEnd() + '…';
}

export function normalizeSearchText(text: string): string {
  if (typeof text !== 'string') return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function scoreMatch(query: string, target: string): number {
  if (typeof query !== 'string' || typeof target !== 'string') return 0;
  if (query.length === 0 || target.length === 0) return 0;
  const q = normalizeSearchText(query);
  const t = normalizeSearchText(target);
  if (q === t) return 1;
  if (t.includes(q)) return clampUnit(q.length / t.length + 0.2);
  const qWords = q.split(/\s+/).filter(w => w.length > 0);
  const tWords = t.split(/\s+/).filter(w => w.length > 0);
  if (qWords.length === 0 || tWords.length === 0) return 0;
  let hits = 0;
  for (const w of qWords) {
    if (tWords.some(tw => tw.includes(w))) hits += 1;
  }
  return clampUnit(hits / qWords.length * 0.7);
}

export function boostScoreByCitations(baseScore: number, citationCount: number): number {
  // Per cycle 63 lesson 1: cap at 0.99 to keep room for ranking ties
  const base = clampUnit(baseScore);
  const boost = clampUnit(citationCount * 0.1);
  return clampUnit(Math.min(0.99, base + boost * 0.3));
}

export function combineScore(scores: readonly number[]): {
  min: number; max: number; mean: number; weightedMean: number; geometricMean: number;
} {
  const arr = scores.filter(s => Number.isFinite(s));
  if (arr.length === 0) return { min: 0, max: 0, mean: 0, weightedMean: 0, geometricMean: 0 };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  let weightedSum = 0;
  let weightTotal = 0;
  for (let i = 0; i < arr.length; i++) {
    const w = i + 1;
    weightedSum += arr[i] * w;
    weightTotal += w;
  }
  const weightedMean = weightTotal > 0 ? weightedSum / weightTotal : 0;
  let logSum = 0;
  let logCount = 0;
  for (const s of arr) {
    if (s > 0) {
      logSum += Math.log(s);
      logCount += 1;
    }
  }
  const geometricMean = logCount > 0 ? Math.exp(logSum / logCount) : 0;
  return {
    min: clampUnit(min),
    max: clampUnit(max),
    mean: clampUnit(mean),
    weightedMean: clampUnit(weightedMean),
    geometricMean: clampUnit(geometricMean),
  };
}

export function safeLog(_msg: string): void {
  // intentionally a no-op in production; placeholder for audit instrumentation
  // override this in tests by reassignment if needed
}

// ── Section 8: Type guards ───────────────────────────────────────────────────

export function isQuote(value: unknown): value is Quote {
  if (typeof value !== 'object' || value === null) return false;
  const q = value as Record<string, unknown>;
  return typeof q.id === 'string'
    && typeof q.text === 'string'
    && typeof q.source === 'string'
    && typeof q.tradition === 'string'
    && typeof q.topic === 'string'
    && typeof q.language === 'string'
    && Array.isArray(q.sacredRefs)
    && Array.isArray(q.tags)
    && typeof q.citation === 'object'
    && q.citation !== null;
}

export function isQuoteId(value: unknown): value is QuoteId {
  if (typeof value !== 'string') return false;
  return /^quote-[a-z0-9-]{1,80}$/i.test(value)
    || /^[a-z]{2,3}-\d{2}$/i.test(value)
    || /^[a-z0-9-]{2,40}$/i.test(value);
}

export function isTraditionId(value: unknown): value is TraditionId {
  return typeof value === 'string'
    && ALL_TRADITION_IDS.includes(value as TraditionId);
}

export function isQuoteQuery(value: unknown): value is QuoteQuery {
  if (typeof value !== 'object' || value === null) return false;
  const q = value as Record<string, unknown>;
  if (q.tradition !== undefined && !isTraditionId(q.tradition)) return false;
  if (q.text !== undefined && typeof q.text !== 'string') return false;
  if (q.topic !== undefined && typeof q.topic !== 'string') return false;
  if (q.tags !== undefined && !Array.isArray(q.tags)) return false;
  if (q.limit !== undefined && (typeof q.limit !== 'number' || q.limit < 0)) return false;
  return true;
}

export function isSefirotId(value: unknown): value is SefirotId {
  return typeof value === 'string' && SEFIROT.includes(value as SefirotId);
}

export function isChakraId(value: unknown): value is ChakraId {
  return typeof value === 'string' && CHAKRAS.includes(value as ChakraId);
}

export function isPlanet(value: unknown): value is Planet {
  return typeof value === 'string' && PLANETS.includes(value as Planet);
}

export function isZodiacSign(value: unknown): value is ZodiacSign {
  return typeof value === 'string' && ZODIAC_SIGNS.includes(value as ZodiacSign);
}

export function isOrixa(value: unknown): value is OrixaName {
  return typeof value === 'string' && ORIXAS.includes(value as OrixaName);
}

export function isSacredRef(value: unknown): value is SacredRef {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return typeof r.kind === 'string'
    && typeof r.value === 'string'
    && ['orixa', 'sefirah', 'planet', 'sign', 'chakra', 'card', 'numerology'].includes(r.kind);
}

// ── Section 9: Lookup & search ───────────────────────────────────────────────

export function lookupQuote(id: QuoteId | string): Quote | null {
  if (typeof id !== 'string' || id.length === 0) return null;
  const target = id.trim().toLowerCase();
  for (const q of ALL_QUOTES) {
    if (q.id.toLowerCase() === target) return q;
  }
  return null;
}

export function searchQuotes(query: QuoteQuery): QuoteResult[] {
  if (!isQuoteQuery(query)) return [];
  const limit = typeof query.limit === 'number' ? Math.max(0, Math.min(1000, Math.floor(query.limit))) : 50;
  const textQ = typeof query.text === 'string' ? query.text : '';
  const topicQ = typeof query.topic === 'string' ? query.topic : '';
  const tagSet = new Set((query.tags ?? []).map(t => t.toLowerCase()));
  const results: QuoteResult[] = [];
  for (const q of ALL_QUOTES) {
    if (query.tradition !== undefined && q.tradition !== query.tradition) continue;
    if (query.mood !== undefined && q.mood !== query.mood) continue;
    if (query.context !== undefined && q.context !== query.context) continue;
    if (query.locale !== undefined && q.language !== query.locale) continue;
    if (query.sacredRef !== undefined) {
      const ref = query.sacredRef;
      const hit = q.sacredRefs.some(sr => sr.kind === ref.kind && sr.value.toLowerCase() === ref.value.toLowerCase());
      if (!hit) continue;
    }
    if (tagSet.size > 0) {
      const allTags = q.tags.map(t => t.toLowerCase());
      const matchedTag = [...tagSet].some(t => allTags.includes(t));
      if (!matchedTag) continue;
    }
    let score = 0;
    const matchedFields: string[] = [];
    if (textQ.length > 0) {
      const s1 = scoreMatch(textQ, q.text);
      const s2 = scoreMatch(textQ, q.source);
      const s3 = q.author !== undefined ? scoreMatch(textQ, q.author) : 0;
      const best = Math.max(s1, s2, s3);
      if (best > 0) {
        score += best;
        matchedFields.push('text');
      }
    }
    if (topicQ.length > 0) {
      const s = scoreMatch(topicQ, q.topic);
      if (s > 0) {
        score += s;
        matchedFields.push('topic');
      }
    }
    if (textQ.length === 0 && topicQ.length === 0 && tagSet.size === 0 && query.tradition === undefined && query.mood === undefined && query.context === undefined && query.sacredRef === undefined && query.locale === undefined) {
      score = 0.5;
    }
    const anyFilterActive = textQ.length > 0 || topicQ.length > 0 || tagSet.size > 0 || query.tradition !== undefined || query.mood !== undefined || query.context !== undefined || query.sacredRef !== undefined || query.locale !== undefined;
    if (score > 0 || anyFilterActive || (textQ.length === 0 && topicQ.length === 0 && tagSet.size === 0)) {
      const finalScore = score === 0 ? 0.5 : boostScoreByCitations(score, q.citation.book ? 1 : 0);
      results.push({ quote: q, score: clampUnit(finalScore), matchedFields });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function listTraditions(): TraditionSummary[] {
  return ALL_TRADITION_IDS.map(id => ({
    id,
    name: TRADITIONS[id].name,
    count: ALL_QUOTES.filter(q => q.tradition === id).length,
    language: TRADITIONS[id].language,
  }));
}

export function listQuotesByTradition(tradition: TraditionId): Quote[] {
  if (!isTraditionId(tradition)) return [];
  return ALL_QUOTES.filter(q => q.tradition === tradition);
}

export function loadCatalog(): Quote[] {
  return [...ALL_QUOTES];
}

export function getTradition(tradition: TraditionId): Tradition | null {
  if (!isTraditionId(tradition)) return null;
  return TRADITIONS[tradition];
}

// ── Section 10: Pickers ──────────────────────────────────────────────────────

function pickFromList(list: readonly Quote[], seed: number): Quote {
  if (list.length === 0) {
    // Will never trigger because all callers guard empty lists, but be safe
    throw new EmptyCatalogError('pickFromList called on empty list');
  }
  const idx = Math.abs(seed) % list.length;
  return list[idx];
}

function hashSeed(...args: unknown[]): number {
  let h = 0;
  for (const a of args) {
    const s = typeof a === 'string' ? a : JSON.stringify(a);
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
  }
  return h;
}

export function pickQuoteByTradition(
  tradition: TraditionId,
  opts?: PickOpts
): Quote {
  if (!isTraditionId(tradition)) {
    throw new InvalidTraditionError(`Unknown tradition: ${String(tradition)}`);
  }
  let pool = listQuotesByTradition(tradition);
  if (pool.length === 0) {
    throw new EmptyCatalogError(`No quotes for tradition: ${tradition}`);
  }
  if (opts !== undefined) {
    if (typeof opts.topic === 'string' && opts.topic.length > 0) {
      const filtered = pool.filter(q => q.topic.toLowerCase().includes(opts.topic!.toLowerCase()));
      if (filtered.length > 0) pool = filtered;
    }
    if (typeof opts.mood === 'string') {
      const filtered = pool.filter(q => q.mood === opts.mood);
      if (filtered.length > 0) pool = filtered;
    }
    if (typeof opts.tag === 'string' && opts.tag.length > 0) {
      const filtered = pool.filter(q => q.tags.some(t => t.toLowerCase().includes(opts.tag!.toLowerCase())));
      if (filtered.length > 0) pool = filtered;
    }
  }
  return pickFromList(pool, hashSeed(tradition, opts?.topic ?? '', opts?.mood ?? '', opts?.tag ?? ''));
}

export function pickQuoteByContext(ctx: PickContext): Quote {
  // Anti-misuse guardrail — never refuse silently, always throw SacredBoundaryError
  if (ctx === null || typeof ctx !== 'object') {
    throw new SacredBoundaryError('pickQuoteByContext requires a context object');
  }
  const keys = Object.keys(ctx);
  for (const k of keys) {
    const v = (ctx as Record<string, unknown>)[k];
    if (typeof v === 'string' && FORBIDDEN_CONTEXTS.includes(v)) {
      throw new SacredBoundaryError(`Forbidden context: ${v} — sacred quotes do not support this use case`);
    }
  }
  // Route by hint
  let pool: readonly Quote[] = ALL_QUOTES;
  if (typeof ctx.situation === 'string') {
    const filtered = ALL_QUOTES.filter(q => q.tags.includes(ctx.situation!));
    if (filtered.length > 0) pool = filtered;
  }
  if (typeof ctx.orixa === 'string') {
    const filtered = pool.filter(q => q.sacredRefs.some(r => r.kind === 'orixa' && r.value === ctx.orixa));
    if (filtered.length > 0) pool = filtered;
  }
  if (typeof ctx.season === 'string') {
    const map: Record<string, string[]> = {
      spring: ['florescer', 'planta', 'verde', 'início', 'renovação'],
      summer: ['sol', 'calor', 'celebração', 'praia'],
      autumn: ['colheita', 'folha', 'transição'],
      winter: ['introspecção', 'meditação', 'morte', 'renascimento'],
    };
    const tags = map[ctx.season] ?? [];
    const filtered = pool.filter(q => q.tags.some(t => tags.includes(t)));
    if (filtered.length > 0) pool = filtered;
  }
  if (typeof ctx.mood === 'string') {
    const filtered = pool.filter(q => q.mood === ctx.mood);
    if (filtered.length > 0) pool = filtered;
  }
  if (pool.length === 0) pool = ALL_QUOTES;
  return pickFromList(pool, hashSeed(ctx));
}

export function pickQuoteByNumerology(n: NumerologyNumber | number): Quote {
  const value = typeof n === 'number' && Number.isFinite(n) ? Math.trunc(n) : 1;
  const match = ALL_QUOTES.find(q =>
    q.sacredRefs.some(r => r.kind === 'numerology' && r.value === String(value))
  );
  if (match) return match;
  // fallback: pick by hash
  return pickFromList(ALL_QUOTES, hashSeed('numerology', value));
}

export function pickQuoteByCard(cardId: CardId | number): Quote {
  const value = typeof cardId === 'number' && Number.isFinite(cardId) ? Math.trunc(cardId) : 1;
  const match = ALL_QUOTES.find(q =>
    q.sacredRefs.some(r => r.kind === 'card' && r.value === String(value))
  );
  if (match) return match;
  return pickFromList(ALL_QUOTES, hashSeed('card', value));
}

export function pickQuoteBySefirot(sefirah: SefirotId | string): Quote {
  const value = typeof sefirah === 'string' ? sefirah : 'keter';
  const match = ALL_QUOTES.find(q =>
    q.sacredRefs.some(r => r.kind === 'sefirah' && r.value === value)
  );
  if (match) return match;
  return pickFromList(ALL_QUOTES, hashSeed('sefirah', value));
}

export function pickQuoteByPlanet(planet: Planet | string): Quote {
  const value = typeof planet === 'string' ? planet : 'sol';
  const match = ALL_QUOTES.find(q =>
    q.sacredRefs.some(r => r.kind === 'planet' && r.value === value)
  );
  if (match) return match;
  return pickFromList(ALL_QUOTES, hashSeed('planet', value));
}

export function pickQuoteBySign(sign: ZodiacSign | string): Quote {
  const value = typeof sign === 'string' ? sign : 'aries';
  const match = ALL_QUOTES.find(q =>
    q.sacredRefs.some(r => r.kind === 'sign' && r.value === value)
  );
  if (match) return match;
  return pickFromList(ALL_QUOTES, hashSeed('sign', value));
}

export function pickQuoteByChakra(chakra: ChakraId | string): Quote {
  const value = typeof chakra === 'string' ? chakra : 'coracao';
  const match = ALL_QUOTES.find(q =>
    q.sacredRefs.some(r => r.kind === 'chakra' && r.value === value)
  );
  if (match) return match;
  return pickFromList(ALL_QUOTES, hashSeed('chakra', value));
}

// ── Section 11: Formatters ───────────────────────────────────────────────────

export function formatQuote(quote: Quote, locale: Locale = 'pt-BR'): string {
  if (!isQuote(quote)) return '';
  const author = quote.author !== undefined ? ` — ${quote.author}` : '';
  const topic = quote.topic.length > 0 ? ` [${quote.topic}]` : '';
  const traditionName = TRADITIONS[quote.tradition].name;
  if (locale === 'en') {
    return `"${quote.text}"${author} — ${traditionName}${topic}`;
  }
  if (locale === 'es') {
    return `"${quote.text}"${author} — ${traditionName}${topic}`;
  }
  return `"${quote.text}"${author} — ${traditionName}${topic}`;
}

export function formatCitation(citation: Citation): string {
  if (typeof citation !== 'object' || citation === null) return '';
  const parts: string[] = [];
  parts.push(TRADITIONS[citation.tradition].name);
  if (typeof citation.book === 'string' && citation.book.length > 0) {
    parts.push(citation.book);
  }
  if (typeof citation.chapter === 'string' && citation.chapter.length > 0) {
    parts.push(`cap. ${citation.chapter}`);
  }
  if (typeof citation.page === 'string' && citation.page.length > 0) {
    parts.push(`p. ${citation.page}`);
  }
  if (typeof citation.orixa === 'string') {
    parts.push(`orixá: ${citation.orixa}`);
  }
  if (typeof citation.sefirah === 'string') {
    parts.push(`sefirá: ${citation.sefirah}`);
  }
  if (typeof citation.planet === 'string') {
    parts.push(`planeta: ${citation.planet}`);
  }
  if (typeof citation.sign === 'string') {
    parts.push(`signo: ${citation.sign}`);
  }
  if (typeof citation.chakra === 'string') {
    parts.push(`chakra: ${citation.chakra}`);
  }
  if (typeof citation.card === 'number') {
    parts.push(`carta: ${citation.card}`);
  }
  return parts.join(' · ');
}

// ── Section 12: Validation ───────────────────────────────────────────────────

const PII_PATTERNS: ReadonlyArray<{ label: string; re: RegExp }> = [
  { label: 'cpf', re: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/ },
  { label: 'email', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
  { label: 'phone-br', re: /\b\(?\d{2}\)?\s?9?\d{4}-?\d{4}\b/ },
];

export function validateQuote(quote: Quote): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isQuote(quote)) {
    errors.push('Quote failed isQuote structural check');
    return { ok: false, errors, warnings };
  }
  if (quote.text.length === 0) errors.push('text is empty');
  if (quote.text.length > 1000) warnings.push('text exceeds 1000 chars');
  if (quote.source.length === 0) errors.push('source is empty');
  if (FORBIDDEN_CONTEXTS.includes(quote.context ?? '')) {
    errors.push(`context "${quote.context}" is in forbidden list`);
  }
  // HTML/script guards
  if (/<script\b/i.test(quote.text)) errors.push('text contains <script>');
  if (/javascript:/i.test(quote.text)) errors.push('text contains javascript: URL');
  // PII
  for (const { label, re } of PII_PATTERNS) {
    if (re.test(quote.text)) errors.push(`text contains PII pattern: ${label}`);
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function validateCitation(citation: Citation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (typeof citation !== 'object' || citation === null) {
    errors.push('Citation is not an object');
    return { ok: false, errors, warnings };
  }
  if (typeof citation.tradition !== 'string') errors.push('tradition missing');
  else if (!isTraditionId(citation.tradition)) errors.push(`unknown tradition: ${citation.tradition}`);
  return { ok: errors.length === 0, errors, warnings };
}

// ── Section 13: Audit (sacred coverage) ──────────────────────────────────────

export function auditSacredCoverage(): CoverageReport {
  const byTradition = {} as Record<TraditionId, number>;
  let totals = 0;
  const missing: string[] = [];
  for (const id of ALL_TRADITION_IDS) {
    const count = ALL_QUOTES.filter(q => q.tradition === id).length;
    byTradition[id] = count;
    totals += count;
    if (count < 10) missing.push(id);
  }
  const expected = ALL_TRADITION_IDS.length * 10;
  return {
    totals,
    expected,
    missing,
    isFullCoverage: missing.length === 0,
    percentComplete: clampUnit(totals / expected),
    byTradition,
  };
}

// ── Section 14: __ALL_EXPORTS audit constant ─────────────────────────────────

export const __ALL_EXPORTS = {
  types: 13,
  interfaces: 11,
  constants: 12,
  functions: 30,
  errorClasses: 5,
  sections: 14,
} as const;
