/**
 * Tipos canônicos do sistema Cabala dos Caminhos.
 * Coordenação centralizada de tipos para todo o sistema.
 */

// ============================================================================
// §2.1 AstrologyMap — Mapa Astral calculado uma única vez no cadastro
// ============================================================================

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  house: number;
}

export interface HouseCuspPosition {
  house: number;
  sign: string;
  degree: number;
}

export interface AstrologyMap {
  planets: PlanetPosition[];
  houses: HouseCuspPosition[];
  ascendant: string;
  midheaven: string;
  lunarPhase: string;
  elementalChart: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modality: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  quality: {
    individual: number;
    relational: number;
    transform: number;
    social: number;
    traditional: number;
  };
  dominantPlanet: string;
  signRuler: string;
  houseRuler: string;
}

// ============================================================================
// §2.4 OduBirth — Odu de Nascimento
// ============================================================================

export interface OduBirth {
  oduNumber?: number;
  oduName?: string;
  orixaRegency?: string[];
  elementalForce?: string;
  lifeLesson?: string;
  provisional?: boolean;
  birthOdu?: Array<{
    dayOfBirth: string;
    oduNumber: number;
    meaning: string;
  }>;
  // ────────────────────────────────────────────────────────────────────────
  // @provisional — campos abaixo ainda não são produzidos por
  // `calculateBirthOdu` (Doc 23 §2.3). Marcados opcionais + flag
  // `provisional` indica que aguarda tabela de linhagem (D3) e
  // expansão futura. Nenhum consumidor atual depende deles.
  // ────────────────────────────────────────────────────────────────────────
  sign?: string;
  animal?: string;
  owner?: string;
  ebwe?: string;
  message?: string;
  initiationPath?: string;
  prohibitions?: string[];
  // nameHistory também não é produzido (Doc 23 §2.3 declara como morto)
  nameHistory?: Array<{
    name: string;
    meaning: string;
    source: string;
  }>;
}

// ============================================================================
// §3 MatrixData — Conteúdo do grid 9x4
// ============================================================================

export interface MatrixEntry {
  house: number;
  carta: number;
  odu: number;
}

export type MatrixData = {
  [houseNumber: string]: MatrixEntry;
};

// ============================================================================
// §2.2 KabalisticMap — Numerologia Cabalística (enriched)
// ============================================================================
export interface KabalisticMap {
  // ─── Campos realmente produzidos por buildKabalisticMap (Doc 04 §2.2) ────
  // Life path and expression numbers
  lifePath?: number;
  lifePathMaster?: boolean;
  mission?: number;
  expression?: number;
  expressionMaster?: boolean;
  motivation?: number;
  impression?: number;
  nativeDayNumber?: number;
  challenges?: { first: number; second: number; main: number; last: number };
  pinnacles?: {
    first: { number: number; ageEnd: number; meaning: string };
    second: { number: number; ageStart: number; ageEnd: number; meaning: string };
    third: { number: number; ageStart: number; ageEnd: number; meaning: string };
    fourth: { number: number; ageStart: number; meaning: string };
  };
  karmicLessons?: number[];
  karmicDebts?: number[];
  rulingArcana?: {
    lifePath: { major: number; name: string; meaning: string };
    expression: { major: number; name: string; meaning: string };
  };
  lifeCycles?: {
    first: { number: number; ageStart: number; ageEnd: number };
    second: { number: number; ageStart: number; ageEnd: number };
    third: { number: number; ageStart: number };
  };
  personalCycles?: {
    personalYear: number;
    personalMonth: number;
    personalDay: number;
    referenceDate: string;
  };

  // ────────────────────────────────────────────────────────────────────────
  // @provisional — campos abaixo NUNCA foram produzidos por
  // `buildKabalisticMap` (Doc 23 §2.1 classifica como "expectativas
  // falsas"). Marcados opcionais para não quebrar type-checking de
  // consumidores que assumem sua presença, mas o guardião de completude
  // (`tests/calculators/map-completeness.test.ts`) NÃO os exige.
  //
  // Quando forem implementados de fato, mover para a seção "Campos
  // realmente produzidos" e adicionar teste em buildKabalisticMap.
  // ────────────────────────────────────────────────────────────────────────
  hebrewLetter?: string;
  sefirotPath?: string;
  vibrationalNumber?: number;
  chaliceNumber?: number;
  destinyNumber?: number;
  soulUrgeNumber?: number;
  personalityNumber?: number;
  hiddenPassionNumber?: number;
  maturityNumber?: number;
  balanceNumber?: number;
  minorCycles?: {
    years: number[];
    months: number[];
    days: number[];
  };
  personalYear?: number;
  personalMonth?: number;
  personalDay?: number;
  nameHistory?: Array<{
    name: string;
    meaning: string;
    source: string;
  }>;
}
// ============================================================================
// §2.3 TantricMap — Numerologia Tântrica (enriched)
// ============================================================================
export interface TantricMap {
  // ─── Campos realmente produzidos por buildTantricMap (Doc 04 §2.3) ──────
  // Tantric body properties
  soul?: number;
  soulBody?: number;
  soulDescription?: string;
  karma?: number;
  karmaBody?: number;
  karmaDescription?: string;
  divineGift?: number;
  divineGiftBody?: number;
  divineGiftDescription?: string;
  destiny?: number;
  tantricPath?: number;
  tantricBodies?: Record<string, unknown>;
  bodies?: {
    fisico: { number: number; description: string; qualities: string[] };
    pranic: { number: number; description: string; qualities: string[] };
    emocional: { number: number; description: string; qualities: string[] };
    mental: { number: number; description: string; qualities: string[] };
    espiritual: { number: number; description: string; qualities: string[] };
  };

  // ────────────────────────────────────────────────────────────────────────
  // @provisional — campos abaixo NUNCA foram produzidos por
  // `buildTantricMap` (Doc 23 §2.2 classifica como "5 campos mortos
  // no tipo"). Marcados opcionais para que buildTantricMap não precise
  // retornar stubs vazios. Quando forem implementados, mover para a
  // seção "Campos realmente produzidos" e adicionar teste no guardião.
  // ────────────────────────────────────────────────────────────────────────
  sacredGeometry?: {
    merkabaActive: boolean;
    merkabahFields: string[];
    flowerOfLife: string[];
    torusEnergy: {
      active: boolean;
      frequency: number;
      intensity: number;
    };
  };
  chakraStates?: Array<{
    chakra: string;
    name: string;
    element: string;
    frequency: number;
    state: 'balanced' | 'overactive' | 'underactive';
    affirmation: string;
  }>;
  energyMatrix?: {
    physicalBody: number;
    emotionalBody: number;
    mentalBody: number;
    spiritualBody: number;
  };
  elementBalances?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    ether: number;
  };
  kundaliniState?: {
    active: boolean;
    primaryChakra: string;
    secondaryChakras: string[];
    kundaliniMessage: string;
  };
}

// ============================================================================
// §2.5 ForestMedicineMap — Recomendações de Medicinas da Floresta
// ============================================================================
export interface ForestMedicineMap {
  ayahuascaProtocol: {
    name: string;
    dosage: string;
    rationale: string;
  };
  recomendedRapes: Array<{
    name: string;
    purpose: string;
    indication: string;
  }>;
  spiritualWarning: string;
}

// ============================================================================
// §2.6 EnergyHealingMap — Recomendações de Cura Energética (Reiki/Apometria)
// ============================================================================
export interface EnergyHealingMap {
  reikiSymbols: Array<{
    symbol: string;
    name: string;
    purpose: string;
    chakraTarget: string;
  }>;
  groundingProtocol: {
    technique: string;
    purpose: string;
    rationale: string;
  };
}

// ============================================================================
// §2.7 IChingMap — 5º sistema oracular (v0.0.5 Fase 1, Doc 14 §2)
// ============================================================================
//
// Espelha `@akasha/core-iching/src/types.ts::IChingMap` para que o portal
// B2C consuma o tipo sem importar o package agnóstico (mantém `types/`
// zero-dependência, conforme `packages/types/package.json`).
//
// Fonte única de verdade: `packages/core-iching/src/types.ts`.
// Se divergir, REGENERE este bloco a partir de lá (Doc 24 §8 — fonte única).

export type IChingTrigramId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface IChingMap {
  /** Hexagrama natal (1-64) ou null se dados inválidos. */
  hexagramNumber: number | null;
  /** Nome do hexagrama em PT-BR. */
  hexagramName: string | null;
  /** Nome do hexagrama em chinês (pinyin). */
  hexagramChineseName: string | null;
  /** Trigrama superior (1-8) ou null. */
  upperTrigram: IChingTrigramId | null;
  /** Trigrama inferior (1-8) ou null. */
  lowerTrigram: IChingTrigramId | null;
  /** Nome do trigrama superior em PT-BR. */
  upperTrigramName: string | null;
  /** Nome do trigrama inferior em PT-BR. */
  lowerTrigramName: string | null;
  /** 6 linhas (de baixo para cima, true=yang). */
  lines: boolean[];
  /** Aspectos espirituais para extração no PromptBuilder. */
  aspects: string[];
  /** YYYY-MM-DD ou null. */
  birthDate: string | null;
  /** HH:MM ou null. */
  birthTime: string | null;
  /** Tag do algoritmo (auditoria/rollback). */
  algorithm: string;
  /** True se cálculo foi feito com data incompleta. */
  provisional: boolean;
  /** Mensagem de erro se cálculo falhou (do contrário undefined). */
  error?: string;
}



// ============================================================================
// §X Akasha Interpretation Engine — Modelo de Interpretação Profunda
// Baseado em: Gene Keys (Shadow→Gift→Siddhi) + Human Design (Strategy+Authority)
// + pesquisa de benchmark (Astrolink, Mirofox) — Ciclo 517
// ============================================================================

/**
 * Níveis de frequência de expressão Akasha.
 * Inspirado nos Gene Keys (Shadow/Gift/Siddhi) mas renomeado para
 * não parecer "copy-paste" e manter identidade Akasha.
 *
 * shadow  = padrão inconsciente, reativo, herdado (frequência baixa)
 * gift    = talento consciente, recurso disponível (frequência média)
 * siddhi  = estado desperto, o que você É, não o que você FAZ (frequência alta)
 */
export type AkashaLevel = 'shadow' | 'gift' | 'siddhi';

/**
 * Área da vida coberta pelo modelo Akasha (espelha pirâmide de Maslow
 * até a autorrealização — see AGENTS.md §Visão de produto 3).
 */
export type LifeArea =
  | 'proposito'       // Para que você existe
  | 'destino'         // Para onde você vai
  | 'dons'            // O que você tem para oferecer
  | 'relacionamentos' // Como você se conecta
  | 'sexualidade'     // Quais seus padrões e desejos
  | 'carreira'        // Onde você manifesta
  | 'financas'        // Como o fluxo opera
  | 'saude'           // Onde seu corpo pede atenção
  | 'espiritualidade'; // Seu caminho de integração

/** Rótulos PT-BR para cada LifeArea. */
export const LIFE_AREA_LABELS: Record<LifeArea, string> = {
  proposito: 'Propósito',
  destino: 'Destino',
  dons: 'Dons e Talentos',
  relacionamentos: 'Relacionamentos',
  sexualidade: 'Sexualidade',
  carreira: 'Carreira e Vocação',
  financas: 'Finanças e Prosperidade',
  saude: 'Saúde e Corpo',
  espiritualidade: 'Espiritualidade',
};

/**
 * Interpretação profunda para UMA área da vida.
 * Segue o modelo de 4 camadas validado na pesquisa:
 *   dado → significado → padrão → aplicação
 *
 * Inspirado em: Gene Keys (Shadow→Gift→Siddhi) +
 *               Human Design (Strategy/Authority) +
 *               Astrolink/Mirofox (interpretação prática por área).
 */
export interface AreaInterpretation {
  /** Área da vida a que esta interpretação se refere. */
  area: LifeArea;
  /** Número/nível Akasha (shadow | gift | siddhi). */
  nivel: AkashaLevel;
  /** Código canônico, ex: "vida-11-shadow". Usado para tracking. */
  codigo: string;
  /** Cabeçalho POOL-READY: "Seu Dom de [Área]" — max 8 palavras. */
  tituloPool: string;
  /**
   * Camada 1 — DADO:
   * "Seu número de Vida é 11" (o que o dado ASTROLÓGICO diz).
   * Frase FROZEN — não usar diretamente na UI, usar tituloPool + aplicacao.
   */
  dado: string;
  /**
   * Camada 2 — SIGNIFICADO:
   * "O 11 é o Visionário — você vê o que outros não veem."
   * Significado central do número/tradição.
   */
  significado: string;
  /**
   * Camada 3 — PADRÃO (a chain de raciocínio central):
   * "Seu padrão é IDEALIZAR: você projeta perfectionismo em tudo,
   *  especialmente em parceiros e em você mesmo."
   * É aqui que o usuário se RECONHECE.
   * Max ~150 palavras.
   */
  padrao: string;
  /**
   * Camada 4 — APLICAÇÃO POR SUBCATEGORIA:
   * Como este padrão se manifesta em cada subcategoria da área.
   * Segue o modelo "no [contexto], você [padrão], [consequência], [indício]".
   * Max ~80 palavras por entrada.
   */
  aplicacao: Partial<Record<LifeArea, string>>;
  /**
   * Frase de conexão com outro Pilar (cross-validation).
   * Ex: "Este 11 ressoa com seu Odu Ogbe (odu-01): ambos falam de INICIAR."
   * Máximo 60 palavras.
   */
  conexao?: string;
  /**
   * Ação prática 3-2-1 (estilo coaching) para mover do nível atual.
   * 3 coisas que amplificam / 2 armadilhas a evitar / 1 ritual mínimo.
   */
  acaoPratica?: {
    amplificar: string[];
    evitar: string[];
    ritual: string;
  };
  /**
   * Afirmação PT-BR no presente (estilo Mirofox/Numerologia - Redescubra-se).
   * Max 30 palavras.
   */
  afirmacao: string;
  /**
   * Mapa deOther Pilares que corroboram esta interpretação.
   * key = pilar ('astrologia'|'tantrica'|'odu'|'iching')
   * value = descrição curta da correlação (max 40 palavras)
   */
  corroboracao?: Partial<Record<string, string>>;
}

/**
 * Interpretação de Número de Vida (Pilar 1 — Cabala Numérica).
 * Este é o PILOTO do motor de interpretação Akasha.
 * Expande o shallow "número X" em AreaInterpretation completa.
 */
export interface VidaInterpretation {
  /** O número de vida (1-9 | 11 | 22 | 33). */
  numero: number;
  /** É master number (reduzido a 2 mas mantido por decisão de interpretação)? */
  isMaster: boolean;
  /** Interpretação completa para cada nível. */
  levels: {
    shadow: AreaInterpretation;
    gift: AreaInterpretation;
    siddhi: AreaInterpretation;
  };
  /** Síntese Akasha: o "MANDATO" — frase que unifica os 3 níveis. */
  mandato: string;
  /** Nome arquetípico Akasha (não "Líder" — algo mais profundo). */
  arquetipoAkasha: string;
}
