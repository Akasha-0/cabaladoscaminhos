/**
 * Planet-Frequency Spiritual Correlation Module
 * Maps the 7 classical planets to Solfeggio frequencies
 * Based on traditional spiritual and astrological correspondences
 */

/**
 * Represents the correlation between a planet and its Solfeggio frequency
 */
export interface PlanetFrequencyMapping {
  /** The classical planet name */
  planeta: string;
  /** Associated Solfeggio frequency in Hz */
  frequencia: number;
  /** The element associated with this planet-frequency correlation (Fire, Water, Air, Earth) */
  elemento_conexao: string;
  /** Spiritual meaning and vibrational signature */
  significado_espiritual: string;
  /** Chakra associated with this planetary energy */
  chakra: string;
  /** Orixá associated with this planetary energy */
  orixa: string;
  /** Sephirah on the Tree of Life */
  sephirah: string;
}

// ─── Planet-to-Solfeggio Frequency Mapping ─────────────────────────────────────

export const PLANET_FREQUENCY_MAPPINGS: Record<string, PlanetFrequencyMapping> = {
  Sol: {
    planeta: 'Sol',
    frequencia: 528,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Amor, transformação, curaDNA e ressonância com o propósito de vida. A frequência da criação e do renascimento. Transforma resistência em liberação.',
    chakra: 'Plexo Solar',
    orixa: 'Oxum',
    sephirah: 'Tiferet',
  },
  Lua: {
    planeta: 'Lua',
    frequencia: 417,
    elemento_conexao: 'Água',
    significado_espiritual: 'Facilitação de mudanças, liberação de traumas e superação de situações impossíveis. Conexão com o inconsciente e os ciclos emocionais.',
    chakra: 'Plexo Solar',
    orixa: 'Iemanjá',
    sephirah: 'Yesod',
  },
  Marte: {
    planeta: 'Marte',
    frequencia: 396,
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Liberação do medo e da culpa, transformação da energia marcial em ação positiva. Coragem para enfrentar obstáculos e quebrar resistências.',
    chakra: 'Raiz',
    orixa: 'Ogum',
    sephirah: 'Hod',
  },
  Mercurio: {
    planeta: 'Mercúrio',
    frequencia: 741,
    elemento_conexao: 'Ar',
    significado_espiritual: 'Despertar da intuição, expansão da consciência e comunicação espiritual. Favorece a expressão criativa e a conexão com dimensões superiores.',
    chakra: 'Pescoço',
    orixa: 'Oxalá',
    sephirah: 'Hesed',
  },
  Jupiter: {
    planeta: 'Júpiter',
    frequencia: 639,
    elemento_conexao: 'Ar',
    significado_espiritual: 'Harmonização das relações, reconciliação e perdão. Restaura a paz interior e fortalece conexões espirituais e humanas.',
    chakra: 'Coração',
    orixa: 'Xangô',
    sephirah: 'Gevurah',
  },
  Venus: {
    planeta: 'Vênus',
    frequencia: 852,
    elemento_conexao: 'Terra',
    significado_espiritual: 'Despertar do terceiro olho, intuição espiritual avançada e percepção além dos limites físicos. Acesso a realidades transcendentes.',
    chakra: 'Terceiro Olho',
    orixa: 'Iansã',
    sephirah: 'Netzah',
  },
  Saturno: {
    planeta: 'Saturno',
    frequencia: 963,
    elemento_conexao: 'Terra',
    significado_espiritual: 'Frequência do milagre, elevação da consciência ao estado perfeito. Conexão com a energia divina e os planos mais elevados da existência.',
    chakra: 'Coroa',
    orixa: 'Nanã',
    sephirah: 'Keter',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_FREQUENCY_MAPPINGS);
// Freeze nested objects
Object.values(PLANET_FREQUENCY_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the planet-to-frequency correlation mapping
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetFrequency(planeta: string): PlanetFrequencyMapping | null {
  return PLANET_FREQUENCY_MAPPINGS[planeta] ?? null;
}

/**
 * Get the frequency corresponding to a planet
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Saturno')
 * @returns The frequency in Hz or null if not found
 */
export function getFrequencyByPlanet(planeta: string): number | null {
  return PLANET_FREQUENCY_MAPPINGS[planeta]?.frequencia ?? null;
}

/**
 * Get the planet corresponding to a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns The planet name or null if not found
 */
export function getFrequencyPlanet(frequencia: number): string | null {
  const entry = Object.values(PLANET_FREQUENCY_MAPPINGS).find(m => m.frequencia === frequencia);
  return entry?.planeta ?? null;
}

/**
 * Get the frequency mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns The correlation mapping or null if not found
 */
export function getFrequencyMapping(frequencia: number): PlanetFrequencyMapping | null {
  const entry = Object.values(PLANET_FREQUENCY_MAPPINGS).find(m => m.frequencia === frequencia);
  return entry ?? null;
}

/**
 * Get all available planet-frequency mappings
 * @returns Array of all correlation mappings
 */
export function getAllPlanetFrequencies(): PlanetFrequencyMapping[] {
  return Object.values(PLANET_FREQUENCY_MAPPINGS);
}

/**
 * Get all planet names
 * @returns Array of planet names
 */
export function getAllPlanets(): string[] {
  return Object.keys(PLANET_FREQUENCY_MAPPINGS);
}

/**
 * Check if a planet exists in the mapping
 * @param planeta - Planet name to check
 * @returns True if planet exists in mapping
 */
export function hasPlanetFrequency(planeta: string): boolean {
  return planeta in PLANET_FREQUENCY_MAPPINGS;
}

/**
 * Get frequencies by their element association
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of PlanetFrequencyMapping
 */
export function getFrequenciesByElement(elemento: string): PlanetFrequencyMapping[] {
  return Object.values(PLANET_FREQUENCY_MAPPINGS).filter(
    m => m.elemento_conexao.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get planet by frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns The planet name or null if not found
 */
export function getPlanetByFrequency(frequencia: number): string | null {
  return getFrequencyPlanet(frequencia);
}

/**
 * Get all Solfeggio frequencies used in the mapping
 * @returns Array of unique frequencies
 */
export function getAllFrequencies(): number[] {
  return [...new Set(Object.values(PLANET_FREQUENCY_MAPPINGS).map(m => m.frequencia))].sort((a, b) => a - b);
}

export default {
  getPlanetFrequency,
  getFrequencyPlanet,
  getFrequencyByPlanet,
  getFrequencyMapping,
  getAllPlanetFrequencies,
  getAllPlanets,
  hasPlanetFrequency,
  getFrequenciesByElement,
  getPlanetByFrequency,
  getAllFrequencies,
  PLANET_FREQUENCY_MAPPINGS,
};