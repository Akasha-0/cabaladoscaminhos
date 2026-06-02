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
// §2.2 KabalisticMap — Numerologia Cabalística
// ============================================================================

export interface KabalisticMap {
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
  pinnacles?: { first: { number: number; ageEnd: number }; second: { number: number; ageStart: number; ageEnd: number }; third: { number: number; ageStart: number; ageEnd: number }; fourth: { number: number; ageStart: number } };
  karmicLessons?: number[];
  karmaicDebts?: number[];
  rulingArcana?: { lifePathArcana: number; expressionArcana: number };
  lifeCycles?: { first: { number: number; ageStart: number; ageEnd: number }; second: { number: number; ageStart: number; ageEnd: number }; third: { number: number; ageStart: number } };
  personalCycles?: { personalYear: number; personalMonth: number; personalDay: number; referenceDate: string };
  hebrewLetter: string;
  sefirotPath: string;
  vibrationalNumber: number;
  chaliceNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  hiddenPassionNumber: number;
  maturityNumber: number;
  balanceNumber: number;
  minorCycles: {
    years: number[];
    months: number[];
    days: number[];
  };
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  nameHistory: Array<{
    name: string;
    meaning: string;
    source: string;
  }>;
}

// ============================================================================
// §2.3 TantricMap — Numerologia Tântrica
// ============================================================================

export interface TantricMap {
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
  bodies?: readonly { id: number; name: string; essence: string }[];
  sacredGeometry: {
    merkabaActive: boolean;
    merkabahFields: string[];
    flowerOfLife: string[];
    torusEnergy: {
      active: boolean;
      frequency: number;
      intensity: number;
    };
  };
  chakraStates: Array<{
    chakra: string;
    name: string;
    element: string;
    frequency: number;
    state: 'balanced' | 'overactive' | 'underactive';
    affirmation: string;
  }>;
  energyMatrix: {
    physicalBody: number;
    emotionalBody: number;
    mentalBody: number;
    spiritualBody: number;
  };
  elementBalances: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    ether: number;
  };
  kundaliniState: {
    active: boolean;
    primaryChakra: string;
    secondaryChakras: string[];
    kundaliniMessage: string;
  };
}

// ============================================================================
// §2.4 OduBirth — Odu de Nascimento
// ============================================================================

export interface OduBirth {
  oduNumber?: number;
  oduName?: string;
  odu?: string;
  meaning?: string;
  sign?: string;
  animal?: string;
  owner?: string;
  ebwe?: string;
  message?: string;
  initiationPath?: string;
  prohibitions?: string[];
  orixaRegency?: string[];
  elementalForce?: string;
  lifeLesson?: string;
  provisional?: boolean;
  birthOdu?: Array<{
    dayOfBirth: string;
    oduNumber: number;
    meaning: string;
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
    workAndMoney: string;
    homeAndFamily: string;
    loveAndRelationships: string;
    spiritualPath: string;
    finalVerdict: string;
  };
  generatedAt: string;
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
