/**
 * Planet-Zodiac Correlation Mapping
 * Based on classical Western astrology and Cabala dos Caminhos spiritual traditions
 * Aligns the 7 classical planets with zodiac signs, dignities, and spiritual meanings
 */

export interface PlanetZodiacMapping {
  /** The classical planet name */
  planeta: string;
  /** The associated zodiac sign (domicile/ruling sign) */
  signo: string;
  /** The element associated with this planet-sign correlation (Fire, Water, Air, Earth) */
  elemento_conexao: string;
  /** The ruled signs */
  signos_regidos: string[];
  /** The domicile sign (where planet is strongest) */
  domicilio: string;
  /** The exaltation sign (where planet is honored) */
  exaltação: string;
  /** The fall sign (where planet is weakened) */
  queda: string;
  /** The exile sign (where planet is weakest) */
  exilio: string;
  /** Quality: cardinal, fixed, or mutable */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
}

// ─── Planet-to-Zodiac Mapping ──────────────────────────────────────────────────

export const PLANET_ZODIAC_MAPPINGS: Record<string, PlanetZodiacMapping> = {
  Sol: {
    planeta: 'Sol',
    signo: 'Leão',
    elemento_conexao: 'Fogo',
    signos_regidos: ['Leão'],
    domicilio: 'Leão',
    exaltação: 'Áries',
    queda: 'Aquário',
    exilio: 'Libra',
    qualidade: 'fixed',
    significado_espiritual: 'Centro do ser, propósito de vida, vitalidade e irradiância do eu autêntico. O Sol representa a alma individualizada e sua expressão no mundo.',
  },
  Lua: {
    planeta: 'Lua',
    signo: 'Câncer',
    elemento_conexao: 'Água',
    signos_regidos: ['Câncer'],
    domicilio: 'Câncer',
    exaltação: 'Touro',
    queda: 'Capricórnio',
    exilio: 'Capricórnio',
    qualidade: 'cardinal',
    significado_espiritual: 'Intuição, emoção, inconsciente e o divino feminino. A Lua revela os aspectos inconscientes, a memória ancestral e a necessidade de segurança emocional.',
  },
  Mercúrio: {
    planeta: 'Mercúrio',
    signo: 'Gêmeos',
    elemento_conexao: 'Ar',
    signos_regidos: ['Gêmeos', 'Virgem'],
    domicilio: 'Gêmeos',
    exaltação: 'Aquário',
    queda: 'Sagitário',
    exilio: 'Peixes',
    qualidade: 'mutable',
    significado_espiritual: 'Comunicação, mente, inteligência e a ponte entre consciente e inconsciente. Mercúrio é o mensageiro que conecta todos os reinos da existência.',
  },
  Vênus: {
    planeta: 'Vênus',
    signo: 'Touro',
    elemento_conexao: 'Terra',
    signos_regidos: ['Touro', 'Libra'],
    domicilio: 'Touro',
    exaltação: 'Peixes',
    queda: 'Áries',
    exilio: 'Escorpião',
    qualidade: 'fixed',
    significado_espiritual: 'Amor, beleza, harmonia e os prazeres terrenos. Vênus representa a capacidade de amar, cultivar relacionamentos e encontrar beleza em todas as coisas.',
  },
  Marte: {
    planeta: 'Marte',
    signo: 'Áries',
    elemento_conexao: 'Fogo',
    signos_regidos: ['Áries', 'Escorpião'],
    domicilio: 'Áries',
    exaltação: 'Capricórnio',
    queda: 'Câncer',
    exilio: 'Touro',
    qualidade: 'cardinal',
    significado_espiritual: 'Força de vontade, ação, coragem e a energia de transformação. Marte é o guerreiro interior que fighting para proteger e manifestar os desejos.',
  },
  Júpiter: {
    planeta: 'Júpiter',
    signo: 'Sagitário',
    elemento_conexao: 'Fogo',
    signos_regidos: ['Sagitário', 'Peixes'],
    domicilio: 'Sagitário',
    exaltação: 'Câncer',
    queda: 'Capricórnio',
    exilio: 'Gêmeos',
    qualidade: 'mutable',
    significado_espiritual: 'Expansão, sabedoria, fé e abundância espiritual. Júpiter abre os portais da consciência para a luz divina e a compreensão do propósito cósmico.',
  },
  Saturno: {
    planeta: 'Saturno',
    signo: 'Capricórnio',
    elemento_conexao: 'Terra',
    signos_regidos: ['Capricórnio', 'Aquário'],
    domicilio: 'Capricórnio',
    exaltação: 'Libra',
    queda: 'Áries',
    exilio: 'Câncer',
    qualidade: 'cardinal',
    significado_espiritual: 'Disciplina, LIMITES, tempo e a lei cósmica. Saturno é o mestre que ensina através de desafios, forjando karakter através de pruebas e restrições.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_ZODIAC_MAPPINGS);
// Freeze nested objects
Object.values(PLANET_ZODIAC_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the planet-to-zodiac correlation mapping
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetZodiac(planeta: string): PlanetZodiacMapping | null {
  return PLANET_ZODIAC_MAPPINGS[planeta] ?? null;
}

/**
 * Get the planet corresponding to a zodiac sign
 * @param signo - Zodiac sign name (e.g., 'Leão', 'Câncer', 'Áries')
 * @returns The planet name or null if not found
 */
export function getZodiacPlanet(signo: string): string | null {
  for (const [planeta, mapping] of Object.entries(PLANET_ZODIAC_MAPPINGS)) {
    if (mapping.signo === signo) {
      return planeta;
    }
  }
  return null;
}

/**
 * Get all available planet-zodiac mappings
 * @returns Array of all correlation mappings
 */
export function getAllPlanetZodiacs(): PlanetZodiacMapping[] {
  return Object.values(PLANET_ZODIAC_MAPPINGS);
}

/**
 * Get all planet names
 * @returns Array of planet names
 */
export function getAllPlanets(): string[] {
  return Object.keys(PLANET_ZODIAC_MAPPINGS);
}

/**
 * Check if a planet exists in the mapping
 * @param planeta - Planet name to check
 * @returns True if planet exists in mapping
 */
export function hasPlanetZodiac(planeta: string): boolean {
  return planeta in PLANET_ZODIAC_MAPPINGS;
}

/**
 * Get planet domicile sign
 * @param planeta - Planet name
 * @returns The domicile sign or null if not found
 */
export function getPlanetDomicilio(planeta: string): string | null {
  return PLANET_ZODIAC_MAPPINGS[planeta]?.domicilio ?? null;
}

/**
 * Get planet quality (cardinal/fixed/mutable)
 * @param planeta - Planet name
 * @returns The quality or null if not found
 */
export function getPlanetQualidade(planeta: string): string | null {
  return PLANET_ZODIAC_MAPPINGS[planeta]?.qualidade ?? null;
}

/**
 * Get planet element connection
 * @param planeta - Planet name
 * @returns The element or null if not found
 */
export function getPlanetElemento(planeta: string): string | null {
  return PLANET_ZODIAC_MAPPINGS[planeta]?.elemento_conexao ?? null;
}

export default {
  getPlanetZodiac,
  getZodiacPlanet,
  getAllPlanetZodiacs,
  getAllPlanets,
  hasPlanetZodiac,
  getPlanetDomicilio,
  getPlanetQualidade,
  getPlanetElemento,
};
