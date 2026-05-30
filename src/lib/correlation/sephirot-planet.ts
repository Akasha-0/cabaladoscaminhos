/**
 * Sephirot-Planet Correlation Mapping
 * Based on IDEIA.md Tree of Life relationships
 * Maps the 10 Sephiroth of the Kabbalistic Tree of Life to classical planets,
 * path numbers, Hebrew letters, and vibrational qualities
 */

/**
 * Represents the correlation between a Sephirah and its planetary correspondence
 */
export interface SephirotPlanet {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The ruling planet for this Sephirah */
  planeta_regente: string;
  /** Path number on the Tree of Life (1-22 for the Major Arcana paths) */
  numero_caminho: number;
  /** Hebrew letter associated with this Sephirah */
  letra_hebraica: string;
  /** Vibrational quality / spiritual attribute */
  qualidade_vibracional: string;
}

// ─── Sephirot-to-Planet Mapping ─────────────────────────────────────────────

export const SEPHIROT_PLANET_MAPPINGS: Record<string, SephirotPlanet> = {
  // 1. Kether (Corona) - O Louco (0) / O Imperador - Vênus - 11
  Kether: {
    sephirah: 'Kether',
    planeta_regente: 'Vênus',
    numero_caminho: 11,
    letra_hebraica: 'א',
    qualidade_vibracional: 'Pureza / Conexão Divina',
  },

  // 2. Chokmah (Sabedoria) - O Mago (I) / A Imperatriz - Vênus - 12
  Chokmah: {
    sephirah: 'Chokmah',
    planeta_regente: 'Vênus',
    numero_caminho: 12,
    letra_hebraica: 'ב',
    qualidade_vibracional: 'Impulso Primordial / Dinamismo',
  },

  // 3. Binah (Entendimento) - A Imperatriz - Saturno - 3
  Binah: {
    sephirah: 'Binah',
    planeta_regente: 'Saturno',
    numero_caminho: 3,
    letra_hebraica: 'ג',
    qualidade_vibracional: 'Forma / Limitação / Discernimento',
  },

  // 4. Chesed (Misericórdia) - O Hierofante - Júpiter - 4
  Chesed: {
    sephirah: 'Chesed',
    planeta_regente: 'Júpiter',
    numero_caminho: 4,
    letra_hebraica: 'ד',
    qualidade_vibracional: 'Expansão / Abundância / Lei',
  },

  // 5. Geburah (Severidade) - O Carro - Marte - 5
  Geburah: {
    sephirah: 'Geburah',
    planeta_regente: 'Marte',
    numero_caminho: 5,
    letra_hebraica: 'ה',
    qualidade_vibracional: 'Força / Cortante / Guerra',
  },

  // 6. Tiphereth (Beleza) - O Sol - Sol - 6
  Tiphereth: {
    sephirah: 'Tiphereth',
    planeta_regente: 'Sol',
    numero_caminho: 6,
    letra_hebraica: 'ו',
    qualidade_vibracional: 'Harmonia / Brilho / Propósito',
  },

  // 7. Netzach (Vitória) - Os Enamorados - Vênus - 7
  Netzach: {
    sephirah: 'Netzach',
    planeta_regente: 'Vênus',
    numero_caminho: 7,
    letra_hebraica: 'ז',
    qualidade_vibracional: 'Vitória Emocional / Amor',
  },

  // 8. Hod (Glória) - A Justiça / O Eremita - Mercúrio - 8
  Hod: {
    sephirah: 'Hod',
    planeta_regente: 'Mercúrio',
    numero_caminho: 8,
    letra_hebraica: 'ח',
    qualidade_vibracional: 'Intelecto / Comunicação / Verdade',
  },

  // 9. Yesod (Fundação) - A Força / O Eremita - Lua - 9
  Yesod: {
    sephirah: 'Yesod',
    planeta_regente: 'Lua',
    numero_caminho: 9,
    letra_hebraica: 'ט',
    qualidade_vibracional: 'Imaginação / Base Subconsciente',
  },

  // 10. Malkuth (Reino) - O Mundo - Terra - 10
  Malkuth: {
    sephirah: 'Malkuth',
    planeta_regente: 'Terra',
    numero_caminho: 10,
    letra_hebraica: 'י',
    qualidade_vibracional: 'Manifestação / Aterramento / Matéria',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_PLANET_MAPPINGS);

/**
 * Get the Sephirot-planet correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotPlanet(sephirah: string): SephirotPlanet | null {
  return SEPHIROT_PLANET_MAPPINGS[sephirah] ?? null;
}

/**
 * Get all available Sephirot-planet mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotPlanetMappings(): SephirotPlanet[] {
  return Object.values(SEPHIROT_PLANET_MAPPINGS);
}

/**
 * Get all Sephirah names
 * @returns Array of Sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_PLANET_MAPPINGS);
}

/**
 * Check if a Sephirah exists in the mapping
 * @param sephirah - The name of the Sephirah to check
 * @returns True if Sephirah exists in mapping
 */
export function hasSephirotPlanet(sephirah: string): boolean {
  return sephirah in SEPHIROT_PLANET_MAPPINGS;
}

/**
 * Get Sephirah by path number
 * @param path - The path number (1-22)
 * @returns The Sephirah mapping or null if not found
 */
export function getSephirotByPath(path: number): SephirotPlanet | null {
  const found = Object.values(SEPHIROT_PLANET_MAPPINGS).find(
    (mapping) => mapping.numero_caminho === path
  );
  return found ?? null;
}

/**
 * Get Sephirah by Hebrew letter
 * @param letter - The Hebrew letter (e.g., 'א', 'ב')
 * @returns The Sephirah mapping or null if not found
 */
export function getSephirotByLetter(letter: string): SephirotPlanet | null {
  const found = Object.values(SEPHIROT_PLANET_MAPPINGS).find(
    (mapping) => mapping.letra_hebraica === letter
  );
  return found ?? null;
}