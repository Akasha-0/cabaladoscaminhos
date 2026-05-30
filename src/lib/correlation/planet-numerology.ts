/**
 * Planet-Numerology Spiritual Correlation Module
 * Maps classical planets to their numerological associations
 * Based on traditional astrological and mystical correspondences
 */

/** Numerology number types (1-9, master numbers not used in this system) */
export type Numerologia =1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Represents the correlation between a planet and its numerological properties
 */
export interface PlanetNumerologyMapping {
  /** The name of the planet */
  planeta: string;
  /** The numerology number associated with this planet (1-9) */
  numero: Numerologia;
  /** The corresponding classical element */
  elemento: 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';
  /** The spiritual meaning and energy of this planet-number correlation */
  significado_espiritual: string;
  /** Quality of the numerological energy */
  qualidade_numerologica: 'Yang (Expressivo)' | 'Yin (Receptivo)' | 'Neutro (Equilibrado)';
  /** Associated life area this number-planet governs */
  area_vida: string;
}

// ─── Planet-to-Numerology Mapping ─────────────────────────────────────────────

const PLANET_NUMEROLOGY_MAP: Record<string, PlanetNumerologyMapping> = {
  Sol: {
    planeta: 'Sol',
    numero: 1,
    elemento: 'Fogo',
    significado_espiritual: 'Iniciação, propósito divino, poder pessoal, individualidade, liderança espiritual, clareza mental e propósito de vida. O Sol representa o núcleo do ser e a essência divina que ilumina o caminho.',
    qualidade_numerologica: 'Yang (Expressivo)',
    area_vida: 'Identidade e Propósito',
  },
  Lua: {
    planeta: 'Lua',
    numero: 2,
    elemento: 'Água',
    significado_espiritual: 'Intuição profunda, receptividade, emocionalidade, conexão com o inconsciente e ancestrais. A Lua representa a alma, os ciclos e a sabedoria emocional que vem do mundo sutil.',
    qualidade_numerologica: 'Yin (Receptivo)',
    area_vida: 'Emocionalidade e Intuição',
  },
  Marte: {
    planeta: 'Marte',
    numero: 9,
    elemento: 'Fogo',
    significado_espiritual: 'Coragem, transformação, força vital, ação e determinação. Marte representa a energia de combate aos obstáculos, limpeza de traumas e transmutação da energia em poder criativo.',
    qualidade_numerologica: 'Yang (Expressivo)',
    area_vida: 'Ação e Transformação',
  },
  Mercurio: {
    planeta: 'Mercúrio',
    numero: 5,
    elemento: 'Ar',
    significado_espiritual: 'Comunicação, mudança, adaptabilidade, mente racional e agilidade mental. Mercúrio representa a mente que conecta o céu e a terra, abrindo caminhos através da palavra e do pensamento.',
    qualidade_numerologica: 'Neutro (Equilibrado)',
    area_vida: 'Comunicação e Mente',
  },
  Jupiter: {
    planeta: 'Júpiter',
    numero: 3,
    elemento: 'Fogo',
    significado_espiritual: 'Expansão, abundância, sabedoria,Otimismo e crescimento espiritual. Júpiter representa a fartura cósmica, o conhecimento dos mestres e a bênção divina que expande a consciência.',
    qualidade_numerologica: 'Yang (Expressivo)',
    area_vida: 'Abundância e Conhecimento',
  },
  Venus: {
    planeta: 'Vênus',
    numero: 6,
    elemento: 'Água',
    significado_espiritual: 'Amor, harmonia, beleza, doçura e magnetismo. Vênus representa o amor incondicional, a paz divina e a capacidade de magnetizar experiências de harmonia e belOzena através da频道.',
    qualidade_numerologica: 'Yin (Receptivo)',
    area_vida: 'Amor e Harmonia',
  },
  Saturno: {
    planeta: 'Saturno',
    numero: 8,
    elemento: 'Terra',
    significado_espiritual: 'Disciplina, karma, responsabilidade, encerramento de ciclos e mestreia terrena. Saturno representa o师长 que traz provas para o crescimento, a limpeza kármica e a renovação através da paciência.',
    qualidade_numerologica: 'Yin (Receptivo)',
    area_vida: 'Disciplina e Realização',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_NUMEROLOGY_MAP);

/**
 * Normalizes planet name to standard form with proper accent handling
 */
function normalizePlanetName(planeta: string): string {
  const normalized = planeta.trim().toLowerCase();
  const mapping: Record<string, string> = {
    sol: 'Sol',
    lua: 'Lua',
    marte: 'Marte',
    mercurio: 'Mercurio',
    mercúrio: 'Mercurio',
    jupiter: 'Jupiter',
    júpiter: 'Jupiter',
    venus: 'Venus',
    vênus: 'Venus',
    Vénus: 'Venus',
    saturno: 'Saturno',
  };
  return mapping[normalized] ?? planeta;
}

/**
 * Get planet-numerology correlation mapping
 * @param planeta - Name of the planet (e.g., 'Sol', 'Lua', 'Marte')
 * @returns PlanetNumerologyMapping or undefined if not found
 */
export function getPlanetNumerology(planeta: string): PlanetNumerologyMapping | undefined {
  const normalized = normalizePlanetName(planeta);
  return PLANET_NUMEROLOGY_MAP[normalized];
}

/**
 * Get reverse mapping: numerology number to associated planets
 * @returns Record mapping each numerology number to its associated planets
 */
export function getNumerologyPlanet(): Record<Numerologia, string[]> {
  const result: Partial<Record<Numerologia, string[]>> = {};

  for (const mapping of Object.values(PLANET_NUMEROLOGY_MAP)) {
    const numero = mapping.numero;
    if (!result[numero]) {
      result[numero] = [];
    }
    if (!result[numero]!.includes(mapping.planeta)) {
      result[numero]!.push(mapping.planeta);
    }
  }

  return result as Record<Numerologia, string[]>;
}

/**
 * Get all planet-numerology mappings
 * @returns Array of all PlanetNumerologyMapping objects
 */
export function getAllPlanetNumerology(): PlanetNumerologyMapping[] {
  return Object.values(PLANET_NUMEROLOGY_MAP);
}

export default {
  getPlanetNumerology,
  getNumerologyPlanet,
  getAllPlanetNumerology,
};
