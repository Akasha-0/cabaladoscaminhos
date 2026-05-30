/**
 * Planet-Sephirot Correlation Mapping
 * Based on IDEIA.md Tree of Life relationships
 * Maps classical planets to the10 Sephiroth of the Kabbalistic Tree of Life,
 * including element connections and path numbers
 */

/**
 * Represents the correlation between a planet and its Sephirot correspondence
 */
export interface PlanetSephirot {
  /** The name of the planet */
  planeta: string;
  /** The associated Sephirah on the Tree of Life */
  sephirah: string;
  /** The element connection for this planet-Sephirah pair */
  elemento: string;
  /** Path number on the Tree of Life (1-22 for the Major Arcana paths) */
  numero_caminho: number;
}

// ─── Planet-to-Sephirot Mapping ─────────────────────────────────────────────

export const PLANET_SEPHIROT_MAPPINGS: Record<string, PlanetSephirot> = {
  // Saturn → Binah (Understanding) - Path 3
  Saturno: {
    planeta: 'Saturno',
    sephirah: 'Binah',
    elemento: 'Ar / Terra',
    numero_caminho: 3,
  },

  // Jupiter → Chesed (Mercy) - Path 4
  Júpiter: {
    planeta: 'Júpiter',
    sephirah: 'Chesed',
    elemento: 'Fogo / Ar',
    numero_caminho: 4,
  },

  // Mars → Geburah (Severity) - Path 5
  Marte: {
    planeta: 'Marte',
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 5,
  },

  // Sun → Tiphereth (Beauty) - Path 6
  Sol: {
    planeta: 'Sol',
    sephirah: 'Tiphereth',
    elemento: 'Fogo / Luz',
    numero_caminho: 6,
  },

  // Venus → Kether (Crown) - Path 11
  Vênus: {
    planeta: 'Vênus',
    sephirah: 'Kether',
    elemento: 'Ar / Éter',
    numero_caminho: 11,
  },

  // Mercury → Hod (Glory) - Path 8
  Mercúrio: {
    planeta: 'Mercúrio',
    sephirah: 'Hod',
    elemento: 'Ar / Mente',
    numero_caminho: 8,
  },

  // Moon → Yesod (Foundation) - Path 9
  Lua: {
    planeta: 'Lua',
    sephirah: 'Yesod',
    elemento: 'Água',
    numero_caminho: 9,
  },

  // Earth → Malkuth (Kingdom) - Path 10
  Terra: {
    planeta: 'Terra',
    sephirah: 'Malkuth',
    elemento: 'Terra',
    numero_caminho: 10,
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_SEPHIROT_MAPPINGS);

/**
 * Get the planet-Sephirot correlation mapping
 * @param planeta - The name of the planet (e.g., 'Saturno', 'Sol', 'Vênus')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetSephirot(planeta: string): PlanetSephirot | null {
  return PLANET_SEPHIROT_MAPPINGS[planeta] ?? null;
}

/**
 * Get the reverse mapping (Sephirot to planet)
 * @param sephirah - The name of the Sephirah (e.g., 'Binah', 'Tiphereth')
 * @returns The planet name or null if not found
 */
export function getSephirotPlanet(sephirah: string): string | null {
  const found = Object.values(PLANET_SEPHIROT_MAPPINGS).find(
    (mapping) => mapping.sephirah === sephirah
  );
  return found?.planeta ?? null;
}

/**
 * Get all available planet-Sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllPlanetSephiroth(): PlanetSephirot[] {
  return Object.values(PLANET_SEPHIROT_MAPPINGS);
}

/**
 * Get all planet names
 * @returns Array of planet names
 */
export function getAllPlanets(): string[] {
  return Object.keys(PLANET_SEPHIROT_MAPPINGS);
}

/**
 * Check if a planet exists in the mapping
 * @param planeta - The name of the planet to check
 * @returns True if planet exists in mapping
 */
export function hasPlanetSephirot(planeta: string): boolean {
  return planeta in PLANET_SEPHIROT_MAPPINGS;
}

/**
 * Get planet by path number
 * @param path - The path number (1-22)
 * @returns The planet mapping or null if not found
 */
export function getPlanetByPath(path: number): PlanetSephirot | null {
  const found = Object.values(PLANET_SEPHIROT_MAPPINGS).find(
    (mapping) => mapping.numero_caminho === path
  );
  return found ?? null;
}

/**
 * Get planet by element
 * @param elemento - The element to search for (e.g., 'Fogo', 'Água')
 * @returns Array of planet mappings that contain the element
 */
export function getPlanetsByElement(elemento: string): PlanetSephirot[] {
  return Object.values(PLANET_SEPHIROT_MAPPINGS).filter(
    (mapping) => mapping.elemento.toLowerCase().includes(elemento.toLowerCase())
  );
}
