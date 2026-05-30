/**
 * Moon-Sephirot Spiritual Correlation Mapping
 * Maps the 8 lunar phases to the 10 Sephiroth of the Tree of Life
 * Based on traditional Kabbalistic correspondences and lunar cycle mysticism
 */

import type { Elemento } from './sephirot-element';

/**
 * Represents the correlation between a lunar phase and its associated Sephirah
 */
export interface MoonSephirot {
  /** The lunar phase name in Portuguese */
  fase: string;
  /** The associated Sephirah name (Hebrew) */
  sephirah: string;
  /** The corresponding classical element */
  elemento: Elemento;
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Quality of the phase-sephirah energetic connection */
  qualidade_energetica: string;
  /** Symbolic meaning of this lunar-sephirotic alignment */
  simbolismo: string;
  /** Traditional Hebrew letter associated with this path */
  letra_hebraica: string;
}

// ─── Moon Phase to Sephirah Mapping ─────────────────────────────────────────

/**
 * The 8 lunar phases mapped to Sephiroth, elements, and Kabbalistic paths
 * Each phase embodies the energetic quality of its associated Sephirah
 */
export const MOON_SEPHIROT_MAP: Record<string, MoonSephirot> = {
  // 1. Lua Nova → Netzach (Victory)
  // Water element - New beginnings, planting seeds of intention
  'lua-nova': {
    fase: 'Lua Nova',
    sephirah: 'Netzach',
    elemento: 'Água',
    numero_caminho: 7,
    qualidade_energetica: 'Receptiva / Plantio de Intenções',
    simbolismo: 'Nascimento espiritual, renovação de ciclos, intentions puras',
    letra_hebraica: 'Vav',
  },

  // 2. Lua Crescente → Hod (Glory)
  // Air element - Building momentum, intellect and communication
  'lua-crescente': {
    fase: 'Lua Crescente',
    sephirah: 'Hod',
    elemento: 'Ar',
    numero_caminho: 8,
    qualidade_energetica: 'Expansiva / Direção e Propósito',
    simbolismo: 'Crescimento consciente, clareza mental, definição de metas',
    letra_hebraica: 'Zayin',
  },

  // 3. Quarto Crescente → Chesed (Mercy)
  // Water element - Expansion, abundance, building structure
  'quarto-crescente': {
    fase: 'Quarto Crescente',
    sephirah: 'Chesed',
    elemento: 'Água',
    numero_caminho: 4,
    qualidade_energetica: 'Estruturante / Abundância e Misericórdia',
    simbolismo: 'Expansão de recursos, graça divina, construção de abundance',
    letra_hebraica: 'Daleth',
  },

  // 4. Lua Cheia → Tiphereth (Beauty)
  // Fire element - Illumination, harmony, the central sun path
  'lua-cheia': {
    fase: 'Lua Cheia',
    sephirah: 'Tiphereth',
    elemento: 'Fogo',
    numero_caminho: 6,
    qualidade_energetica: 'Radiante / Iluminação e Harmonia',
    simbolismo: 'Culmination of intentions, spiritual revelation, wholeness',
    letra_hebraica: 'Vav',
  },

  // 5. Quarto Minguante → Geburah (Severity)
  // Fire element - Release, discernment, cutting away
  'quarto-minguante': {
    fase: 'Quarto Minguante',
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 5,
    qualidade_energetica: 'Cortante / Libertação e Discernimento',
    simbolismo: 'Release of what no longer serves, purification by fire',
    letra_hebraica: 'He',
  },

  // 6. Lua Minguante → Binah (Understanding)
  // Air element - Introspection, structured transformation
  'lua-minguante': {
    fase: 'Lua Minguante',
    sephirah: 'Binah',
    elemento: 'Ar',
    numero_caminho: 3,
    qualidade_energetica: 'Contemplativa / Limitação e Forma',
    simbolismo: 'Deep reflection, structured grief, understanding through limitation',
    letra_hebraica: 'Gimel',
  },

  // 7. Quarto Descrescente → Chokmah (Wisdom)
  // Aether element - Wisdom accumulation, dynamic impulse
  'quarto-descrescente': {
    fase: 'Quarto Descrescente',
    sephirah: 'Chokmah',
    elemento: 'Éter',
    numero_caminho: 12,
    qualidade_energetica: 'Impulsiva / Sabedoria Dinâmica Primordial',
    simbolismo: 'Accumulated wisdom, dynamic transformation, primordial impulse',
    letra_hebraica: 'Yud',
  },

  // 8. Lua Velha ( Balsamic ) → Yesod (Foundation)
  // Water element - Subconscious purification, imagination
  'lua-velha': {
    fase: 'Lua Velha',
    sephirah: 'Yesod',
    elemento: 'Água',
    numero_caminho: 9,
    qualidade_energetica: 'Purificadora / Imaginação e Base Subconsciente',
    simbolismo: 'Subconscious cleansing, dream work, preparation for rebirth',
    letra_hebraica: 'Samech',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(MOON_SEPHIROT_MAP);

/**
 * Get the Moon-Sephirot correlation mapping for a given lunar phase
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonSephirot mapping or null if not found
 */
export function getMoonSephirot(fase: string): MoonSephirot | null {
  const normalized = fase.toLowerCase().trim().replace(/\s+/g, '-');
  return MOON_SEPHIROT_MAP[normalized] ?? null;
}

/**
 * Get the Sephirah associated with a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The Sephirah name or null if not found
 */
export function getSephirotMoon(fase: string): string | null {
  return MOON_SEPHIROT_MAP[fase.toLowerCase().trim()]?.sephirah ?? null;
}

/**
 * Get all available Moon-Sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllMoonSephiroth(): MoonSephirot[] {
  return Object.values(MOON_SEPHIROT_MAP);
}

/**
 * Get all lunar phases associated with a specific Sephirah
 * @param sephirah - The Sephirah name (e.g., 'Netzach', 'Tiphereth')
 * @returns Array of MoonSephirot mappings for the given Sephirah
 */
export function getMoonPhasesBySephirah(sephirah: string): MoonSephirot[] {
  return Object.values(MOON_SEPHIROT_MAP).filter(
    (mapping) => mapping.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
}

/**
 * Get all lunar phases aligned with a specific element
 * Useful for elemental ritual planning
 * @param elemento - The element name (e.g., 'Água', 'Fogo', 'Ar', 'Éter')
 * @returns Array of MoonSephirot mappings for the given element
 */
export function getMoonPhasesByElement(elemento: string): MoonSephirot[] {
  return Object.values(MOON_SEPHIROT_MAP).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Get the path number for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The path number or null if not found
 */
export function getPathNumberByPhase(fase: string): number | null {
  return MOON_SEPHIROT_MAP[fase.toLowerCase().trim()]?.numero_caminho ?? null;
}

/**
 * Get the Hebrew letter associated with a lunar phase
 * @param fase - The lunar phase identifier
 * @returns The Hebrew letter or null if not found
 */
export function getHebrewLetterByPhase(fase: string): string | null {
  return MOON_SEPHIROT_MAP[fase.toLowerCase().trim()]?.letra_hebraica ?? null;
}