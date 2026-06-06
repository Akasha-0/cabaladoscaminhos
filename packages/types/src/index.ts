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

