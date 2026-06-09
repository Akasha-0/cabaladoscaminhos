/**
 * @akasha/core-iching — Tipos canônicos do I-Ching
 * Agnóstico de framework. Sem dependências externas.
 *
 * Fonte: Doc 14 (Extensibilidade Oracular) §2 — I-Ching como 5º sistema
 * opt-in do Akasha. Sequência King Wen canônica (1-64).
 */

/**
 * Os 8 trigramas (Bagua). Ordem: ☰ Céu, ☷ Terra, ☵ Água, ☲ Fogo,
 * ☳ Trovão, ☶ Montanha, ☴ Vento, ☱ Lago (Fúria Prematura de Wen Wang,
 * sequência "Posterior ao Céu" / Fu Xi).
 */
export type TrigramId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Trigram {
  /** Identificador 1-8 (King Wen). */
  id: TrigramId;
  /** Nome em chinês (pinyin sem tom). */
  chineseName: string;
  /** Nome em português. */
  name: string;
  /** Nome em inglês. */
  nameEn: string;
  /** Glifo unicode. */
  glyph: string;
  /** Natureza yin/yang. */
  nature: 'yang' | 'yin';
  /** Elemento wu-xing associado. */
  element: 'metal' | 'earth' | 'water' | 'fire' | 'wood';
  /** Família (pai/mãe/filho/filha). */
  family: 'pai' | 'mae' | 'filho' | 'filha';
  /** Direção/qualidade. */
  direction: string;
  /** Atributo. */
  attribute: string;
  /** Linhas binárias (de baixo para cima), 3 valores. true = yang (—), false = yin (— —). */
  lines: [boolean, boolean, boolean];
}

/** Hexagrama King Wen (1-64). */
export interface Hexagram {
  /** Número King Wen (1-64). */
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
        | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
        | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
        | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
        | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50
        | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60
        | 61 | 62 | 63 | 64;
  /** Nome chinês (pinyin). */
  chineseName: string;
  /** Nome em português. */
  name: string;
  /** Nome em inglês. */
  nameEn: string;
  /** Caractere chinês principal. */
  character: string;
  /** Trigrama superior (1-8). */
  upperTrigram: TrigramId;
  /** Trigrama inferior (1-8). */
  lowerTrigram: TrigramId;
  /** Julgamento (texto curto). */
  judgment: string;
  /** Imagem (texto curto). */
  image: string;
  /** Aspectos espirituais (para extração no PromptBuilder). */
  aspects: string[];
  /** Linha de yin-yang das 6 linhas (de baixo para cima). true = yang, false = yin. */
  lines: [boolean, boolean, boolean, boolean, boolean, boolean];
  /** Tradição. */
  tradition: string;
}

/** Linha mutante de um hexagrama. */
export interface MutatingLine {
  /** Posição 1-6 (de baixo para cima). */
  position: 1 | 2 | 3 | 4 | 5 | 6;
  /** Linha original: yin (false) ou yang (true). */
  original: boolean;
  /** Linha mutada: yin (false) ou yang (true). */
  changed: boolean;
}

/** Mapa natal de I-Ching (cache, conforme Doc 09 §5.3). */
export interface IChingMap {
  /** Hexagrama natal (1-64) ou null se dados inválidos. */
  hexagramNumber: number | null;
  /** Nome do hexagrama em PT-BR. */
  hexagramName: string | null;
  /** Nome do hexagrama em chinês. */
  hexagramChineseName: string | null;
  /** Trigrama superior (1-8) ou null. */
  upperTrigram: TrigramId | null;
  /** Trigrama inferior (1-8) ou null. */
  lowerTrigram: TrigramId | null;
  /** Nome do trigrama superior em PT-BR. */
  upperTrigramName: string | null;
  /** Nome do trigrama inferior em PT-BR. */
  lowerTrigramName: string | null;
  /** As 6 linhas do hexagrama (de baixo para cima, true=yang). */
  lines: boolean[];
  /** Aspectos espirituais para extração (PromptBuilder). */
  aspects: string[];
  /** Sigla ISO da data de nascimento (YYYY-MM-DD) ou null. */
  birthDate: string | null;
  /** Hora de nascimento (HH:MM), ou null se desconhecida. */
  birthTime: string | null;
  /** Algoritmo usado (rotulagem/auditoria). */
  algorithm: 'akasha.v0.0.4.trigramas-mod8';
  /** Indica se é provisório (cálculo com data incompleta). */
  provisional: boolean;
  /** Mensagem de erro se cálculo falhou (do contrário undefined). */
  error?: string;
}

/** Argumentos de entrada para buildIchingMap. */
export interface BuildIchingMapArgs {
  birthDate: string | Date;
  birthTime?: string | null;
  /** Hexagrama de tiragem explícita (sobrescreve o cálculo natal). */
  overrideHexagram?: number;
}

/** Asa (Wing) do I Ching — comentário/tema que agrupa hexagramas. */
export interface Wing {
  /** Identificador 1-10. */
  id: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /** Nome em chinês (pinyin). */
  name: string;
  /** Nome em inglês. */
  nameEn: string;
  /** Descrição da Asa. */
  description: string;
  /** Temas principais. */
  themes: string[];
  /** Hexagramas pertencentes a esta Asa (1-64). */
  hexagrams: number[];
}

/** Hexagrama expandido com suas Asas. */
export interface HexagramWithWings extends Hexagram {
  /** Todas as Asas que contêm este hexagrama. */
  wings: Wing[];
  /** Asa principal (primeira a conter o hexagrama). */
  mainWing: Wing;
}

// ─── Práticas Integrativas ───────────────────────────────────────────────────

/** Os 5 elementos da tradição Wu-Xing expandida com madeira. */
export type Element = 'fogo' | 'agua' | 'terra' | 'ar' | 'madeira' | 'metal';

/** Categorias de práticas integrativas. */
export type PracticeCategory =
  | 'banho_de_ervas'
  | 'cha'
  | 'defumacao'
  | 'cristal'
  | 'cromoterapia'
  | 'oleo_essencial'
  | 'oracao'
  | 'abre_alas'
  | 'protecao';

/** Associações simbólicas de uma prática. */
export interface PracticeAssociations {
  element?: Element;
  orixa?: string;
  color?: string;
  planet?: string;
  chakra?: number;
  hexagrams?: number[];
}

/**
 * Prática integrativa — conexão entre I-Ching e tradições espirituais.
 * Cada prática tem associações com elementos, orixás e áreas da vida.
 */
export interface IntegrativePractice {
  /** Identificador único. */
  id: string;
  /** Nome da prática. */
  name: string;
  /** Tradição de origem. */
  tradition: string;
  /** Categoria da prática. */
  category: PracticeCategory;
  /** Associações simbólicas. */
  associations: PracticeAssociations;
  /** Áreas da vida que a prática impacta. */
  lifeAreas: string[];
  /** Como realizar a prática. */
  howTo: string;
  /** Frequência recomendada. */
  frequency: string;
  /** Se é uma prática segura para iniciantes. */
  isSafe: boolean;
  /** Avisos ou contraindicações, se houver. */
  warnings?: string[];
}
