/**
 * Tipos canônicos do sistema Cabala dos Caminhos.
 *
 * Estas estruturas refletem EXATAMENTE o Documento 04 — Modelo de Dados.
 * São as estruturas JSON que ficam armazenadas nos campos `Json` do
 * Prisma e trafegam entre o backend e o motor de IA.
 *
 * @see docs/04_data-model.md
 */

// ============================================================================
// §2.1 AstrologyMap — Mapa Astral calculado uma única vez no cadastro
// ============================================================================

export interface PlanetPosition {
  sign: string;        // Ex: "Leo"
  degree: number;      // Ex: 27.5
  house: number;       // Ex: 10
  retrograde: boolean;
}

export interface HouseCuspPosition {
  sign: string;
  degree: number;
}

export interface AstrologyMap {
  /** Sol natal */
  sun: { sign: string; degree: number; house: number };
  /** Lua natal */
  moon: { sign: string; degree: number; house: number };
  /** Ascendente (signo e grau) */
  ascendant: { sign: string; degree: number };

  /** 10 planetas clássicos + Quíron + Lilith */
  planets: {
    mercury: PlanetPosition;
    venus: PlanetPosition;
    mars: PlanetPosition;
    jupiter: PlanetPosition;
    saturn: PlanetPosition;
    uranus: PlanetPosition;
    neptune: PlanetPosition;
    pluto: PlanetPosition;
    chiron: PlanetPosition;  // Ferida e cura
    lilith: PlanetPosition;  // Sombra e poder oculto
  };

  /** Nodos Lunares (karma e destino) */
  northNode: { sign: string; house: number };
  southNode: { sign: string; house: number };

  /** Signo regente de cada uma das 12 casas astrológicas */
  houses: {
    1: string; 2: string; 3: string; 4: string; 5: string; 6: string;
    7: string; 8: string; 9: string; 10: string; 11: string; 12: string;
  };

  /** Cuspides das 12 casas (para cruzar com o PromptBuilder) */
  housesCusp?: {
    [houseNumber: number]: HouseCuspPosition;
  };

  /** Planetas em casas específicas para lookup rápido */
  planetsInHouses: {
    [houseNumber: string]: string[];
  };

  /** Aspectos principais entre planetas */
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
    orb: number;
  }>;

  /** Sinaliza se o mapa foi calculado com dados completos */
  incomplete?: boolean;
}

// ============================================================================
// §2.2 KabalisticMap — Numerologia Cabalística
// ============================================================================

export interface KabalisticMap {
  lifePath: number;
  lifePathMaster: boolean;     // true se for 11, 22 ou 33

  mission: number;
  expression: number;
  expressionMaster: boolean;

  motivation: number;

  /** Número de Impressão — apenas consoantes do nome (Doc 11 §2.4). */
  impression?: number;

  /** Dons Nativos (dia de nascimento não reduzido) */
  nativeDayNumber: number;     // Ex: 20

  challenges: {
    first: number;
    second: number;
    main: number;
    last: number;
  };

  /** Pináculos / Ciclos de Realização (Doc 11 §2.6). */
  pinnacles?: {
    first: { number: number; ageEnd: number };
    second: { number: number; ageStart: number; ageEnd: number };
    third: { number: number; ageStart: number; ageEnd: number };
    fourth: { number: number; ageStart: number };
  };

  /** Lições Kármicas — números de 1-9 AUSENTES no nome (Doc 11 §2.4). */
  karmicLessons?: number[];

  /** Dívidas Kármicas — presença de 13/14/16/19 nos totais intermediários (Doc 11 §2.4). */
  karmaicDebts: number[];

  /** Arcanos Regentes — correspondência com o Tarô (Doc 11/Doc 04 §2.2). */
  rulingArcana?: { lifePathArcana: number; expressionArcana: number };

  lifeCycles: {
    first: { number: number; ageStart: number; ageEnd: number };
    second: { number: number; ageStart: number; ageEnd: number };
    third: { number: number; ageStart: number };
  };

  /**
   * Ciclos Pessoais correntes (Doc 11 §2.4) — campo VOLÁTIL: depende da
   * data atual e é derivado sob demanda, não faz parte do mapa imutável.
   */
  personalCycles?: {
    personalYear: number;
    personalMonth: number;
    personalDay: number;
    referenceDate: string;   // ISO
  };
}

// ============================================================================
// §2.3 TantricMap — Numerologia Tântrica
// ============================================================================

export interface TantricMap {
  soul: number;                    // dia de nascimento reduzido
  soulDescription: string;         // Ex: "Corpo Negativo — Mente Protetora"

  karma: number;                   // mês de nascimento
  karmaDescription: string;

  divineGift: number;              // ano reduzido em dois passos
  divineGiftDescription: string;

  destiny: number;                 // ano de 4 dígitos reduzido

  tantricPath: number;             // soma total de dia+mês+ano reduzida

  /** Índices (1-11) dos corpos tântricos correspondentes a cada número (Doc 11 §3.2). */
  soulBody?: number;
  karmaBody?: number;
  divineGiftBody?: number;

  tantricBodies: {
    [key: number]: string;         // Ex: { 1: "Corpo da Alma", 2: "Corpo Negativo", ... }
  };

  /** Os 11 corpos explícitos como estrutura nomeada imutável (Doc 11 §3.2). */
  bodies?: ReadonlyArray<{ id: number; name: string; essence: string }>;
}

// ============================================================================
// §2.4 OduBirth — Odu de Nascimento
// ============================================================================

export interface OduBirth {
  oduNumber: number;            // 1..16
  oduName: string;              // Ex: "Ejionile"
  orixaRegency: string[];       // Ex: ["Xangô", "Oxalá"]
  elementalForce: string;       // Ex: "Justiça, Força, Liderança"
  lifeLesson: string;           // Síntese do ensinamento central
  /** true enquanto usar o algoritmo default (tabela de linhagem pendente — D3, Doc 11 §4). */
  provisional?: boolean;
}

// ============================================================================
// §3 MatrixData — Conteúdo do grid 9x4
// ============================================================================

export interface MatrixEntry {
  carta: number;       // 1..36
  cartaName: string;   // Ex: "A Torre"
  odu: number;         // 1..16
  oduName: string;     // Ex: "Osá"
}

export type MatrixData = {
  [houseNumber: string]: MatrixEntry;
};

// ============================================================================
// §4 ReportContent — Dossiê gerado pelo LLM
// ============================================================================

export interface HouseReport {
  houseNumber: number;
  houseName: string;
  carta: string;
  odu: string;
  /** Markdown gerado pelo LLM — três parágrafos obrigatórios */
  interpretation: string;
}

export interface ReportContent {
  houses: {
    [houseNumber: string]: HouseReport;
  };
  synthesis: {
    workAndMoney: string;        // Caminho do Trabalho e Dinheiro
    homeAndFamily: string;       // Caminho do Lar e Família
    loveAndRelationships: string;// Caminho do Amor e Relacionamentos
    spiritualPath: string;       // Grande Conselho Espiritual
    finalVerdict: string;        // Veredito Final e Direcionamento
  };
  generatedAt: string;           // ISO timestamp
  llmModel: string;
  totalHousesAnalyzed: number;
}

// ============================================================================
// Entidades Prisma (mínimo para o motor de IA)
// ============================================================================

export interface Client {
  id: string;
  fullName: string;
  birthDate: Date | string;
  birthTime: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  birthLatitude: number | null;
  birthLongitude: number | null;
  birthTimezone: string | null;
  astrologyMap: AstrologyMap | null;
  kabalisticMap: KabalisticMap | null;
  tantricMap: TantricMap | null;
  oduBirth: OduBirth | null;
  notes: string | null;
}
