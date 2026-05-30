/**
 * Planet-Zodiac Correlation Mapping
 * Based on classical Western astrology traditions
 * Aligns the 7 classical planets with zodiac signs, dignities, and qualities
 */

export interface PlanetZodiacMapping {
  planeta: string;
  signos_regidos: string[];
  domicilio: string;
  exaltação: string;
  queda: string;
  exilio: string;
  qualidade: 'cardinal' | 'fixed' | 'mutable';
}

// ─── Planet-to-Zodiac Mapping ──────────────────────────────────────────────────

export const PLANET_ZODIAC_MAPPINGS: Record<string, PlanetZodiacMapping> = {
  Sol: {
    planeta: 'Sol',
    signos_regidos: ['Leão'],
    domicilio: 'Leão',
    exaltação: 'Áries',
    queda: 'Aquário',
    exilio: 'Libra',
    qualidade: 'fixed',
  },
  Lua: {
    planeta: 'Lua',
    signos_regidos: ['Câncer'],
    domicilio: 'Câncer',
    exaltação: 'Touro',
    queda: 'Capricórnio',
    exilio: 'Capricórnio',
    qualidade: 'cardinal',
  },
  Mercúrio: {
    planeta: 'Mercúrio',
    signos_regidos: ['Gêmeos', 'Virgem'],
    domicilio: 'Gêmeos',
    exaltação: 'Aquário',
    queda: 'Sagitário',
    exilio: 'Peixes',
    qualidade: 'mutable',
  },
  Vênus: {
    planeta: 'Vênus',
    signos_regidos: ['Touro', 'Libra'],
    domicilio: 'Touro',
    exaltação: 'Peixes',
    queda: 'Áries',
    exilio: 'Escorpião',
    qualidade: 'fixed',
  },
  Marte: {
    planeta: 'Marte',
    signos_regidos: ['Áries', 'Escorpião'],
    domicilio: 'Áries',
    exaltação: 'Capricórnio',
    queda: 'Câncer',
    exilio: 'Touro',
    qualidade: 'cardinal',
  },
  Júpiter: {
    planeta: 'Júpiter',
    signos_regidos: ['Sagitário', 'Peixes'],
    domicilio: 'Sagitário',
    exaltação: 'Câncer',
    queda: 'Capricórnio',
    exilio: 'Gêmeos',
    qualidade: 'mutable',
  },
  Saturno: {
    planeta: 'Saturno',
    signos_regidos: ['Capricórnio', 'Aquário'],
    domicilio: 'Capricórnio',
    exaltação: 'Libra',
    queda: 'Áries',
    exilio: 'Câncer',
    qualidade: 'cardinal',
  },
};

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
 * Get all available planet-zodiac mappings
 * @returns Array of all correlation mappings
 */
export function getAllPlanetZodiacMappings(): PlanetZodiacMapping[] {
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