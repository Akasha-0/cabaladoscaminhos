/**
 * Sephirot-Element Spiritual Correlation Module
 * Maps the ten Sephiroth of the Tree of Life to classical elements
 * Based on traditional Kabbalistic correspondences
 */

export type ElementoTipo = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

/**
 * Represents the correlation between a Sephirah and its element
 */
export interface SephirotElement {
  /** The name of the Sephirah (e.g., 'Kether', 'Chokmah') */
  sephirah: string;
  /** The classical element associated with this Sephirah */
  elemento: ElementoTipo;
  /** The element display name in Portuguese */
  elemento_nome: string;
  /** Spiritual meaning of this Sephirah-Element correlation */
  significado_espiritual: string;
}

// ─── Sephirot-to-Element Mapping ─────────────────────────────────────────────
// Maps the 10 Sephiroth to their elemental correspondences.
// Element assignments based on traditional Kabbalistic correspondences:
// Éter - divine essence, spirit, purest element (upper sephiroth)
// Ar - intellect, breath, expansion (upper-middle sephiroth)
// Água - emotion, flow, wisdom (middle sephiroth)
// Fogo - transformation, will, power (middle sephiroth)
// Terra - manifestation, grounding, material world (lower sephiroth)

export const SEPHIROT_ELEMENT_MAPPINGS: Record<string, SephirotElement> = {
  // 1. Kether (Crown) - Éter - Divine Purity
  // Highest sephirah - pure divine light, closest to Ein Sof
  Kether: {
    sephirah: 'Kether',
    elemento: 'éter',
    elemento_nome: 'Éter',
    significado_espiritual: 'Coroa Divina / Pureza Primordial / União com o Source / Essência Espiritual Pura',
  },

  // 2. Chokmah (Wisdom) - Éter - Dynamic Impulse
  // First burst of creative energy, cosmic wisdom
  Chokmah: {
    sephirah: 'Chokmah',
    elemento: 'éter',
    elemento_nome: 'Éter',
    significado_espiritual: 'Sabedoria Cósmica / Impulso Dinâmico / Criação Primordial / Intuição Pura',
  },

  // 3. Binah (Understanding) - Ar - Structured Discernment
  // Form-giving, limitation, superior discrimination
  Binah: {
    sephirah: 'Binah',
    elemento: 'ar',
    elemento_nome: 'Ar',
    significado_espiritual: 'Entendimento Superior / Formatação da Matéria / Discernimento Estruturado /Limit Divino',
  },

  // 4. Chesed (Mercy) - Água - Abundant Expansion
  // Divine mercy, expansion, abundance, grace
  Chesed: {
    sephirah: 'Chesed',
    elemento: 'água',
    elemento_nome: 'Água',
    significado_espiritual: 'Misericórdia Divina / Abundância / Expansão Espiritual / Graça Infinita',
  },

  // 5. Geburah (Severity) - Fogo - Cutting Force
  // Strength, righteous judgment, transformative power
  Geburah: {
    sephirah: 'Geburah',
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    significado_espiritual: 'Severidade Divina / Força Transformadora / Guerra Santa / Poder de Mudança',
  },

  // 6. Tiphereth (Beauty) - Fogo - Vital Harmony
  // Central sun, harmony, life purpose, healing center
  Tiphereth: {
    sephirah: 'Tiphereth',
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    significado_espiritual: 'Beleza Central / Harmonia Solar / Propósito de Vida / Centro de Cura',
  },

  // 7. Netzach (Victory) - Água - Emotional Victory
  // Emotional love, universal love, triumph of feelings
  Netzach: {
    sephirah: 'Netzach',
    elemento: 'água',
    elemento_nome: 'Água',
    significado_espiritual: 'Vitória Emocional / Amor Universal / Triunfo dos Sentimentos / Beleza Eterna',
  },

  // 8. Hod (Glory) - Ar - Superior Intellect
  // Intellect, communication, divine truth
  Hod: {
    sephirah: 'Hod',
    elemento: 'ar',
    elemento_nome: 'Ar',
    significado_espiritual: 'Glória Divina / Intelecto Superior / Comunicação com o Divino / Verdade Revelada',
  },

  // 9. Yesod (Foundation) - Água - Subconscious Imagination
  // Subconscious mind, imagination, lunar connection
  Yesod: {
    sephirah: 'Yesod',
    elemento: 'água',
    elemento_nome: 'Água',
    significado_espiritual: 'Fundação Subconsciente / Imaginação Divina / Conexão Lunar / Base Invisível',
  },

  // 10. Malkuth (Kingdom) - Terra - Material Manifestation
  // Physical world, manifestation, grounding
  Malkuth: {
    sephirah: 'Malkuth',
    elemento: 'terra',
    elemento_nome: 'Terra',
    significado_espiritual: 'Reino Material / Manifestação Física / Aterramento / Sabedoria Terrestre',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_ELEMENT_MAPPINGS);
Object.values(SEPHIROT_ELEMENT_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * All 5 classical elements used in Sephirot mapping
 */
export const ELEMENTOS = ['fogo', 'água', 'ar', 'terra', 'éter'] as const;

/**
 * Get the Sephirot-element correlation mapping for a given sephirah
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotElement(sephirah: string): SephirotElement | null {
  return SEPHIROT_ELEMENT_MAPPINGS[sephirah] ?? null;
}

/**
 * Get the element sephiroth mapping
 * @param elemento - The element type (fogo, água, ar, terra, éter)
 * @returns All Sephiroth that correspond to this element
 */
export function getElementSephirot(elemento: string): SephirotElement[] {
  return Object.values(SEPHIROT_ELEMENT_MAPPINGS).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Get all available Sephirot-element mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotElements(): SephirotElement[] {
  return Object.values(SEPHIROT_ELEMENT_MAPPINGS);
}

/**
 * Get all sephirah names
 * @returns Array of sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_ELEMENT_MAPPINGS);
}

/**
 * Check if a sephirah exists in the mapping
 * @param sephirah - Sephirah name to check
 * @returns True if sephirah exists in mapping
 */
export function hasSephirotElement(sephirah: string): boolean {
  return sephirah in SEPHIROT_ELEMENT_MAPPINGS;
}

/**
 * Get the element associated with a sephirah
 * @param sephirah - The sephirah name
 * @returns Element type or null if not found
 */
export function getElementBySephirah(sephirah: string): ElementoTipo | null {
  return SEPHIROT_ELEMENT_MAPPINGS[sephirah]?.elemento ?? null;
}

/**
 * Get the element display name for a sephirah
 * @param sephirah - The sephirah name
 * @returns Element display name or null if not found
 */
export function getElementNameBySephirah(sephirah: string): string | null {
  return SEPHIROT_ELEMENT_MAPPINGS[sephirah]?.elemento_nome ?? null;
}

/**
 * Get all sephiroth for a specific element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Array of SephirotElement mappings with this element
 */
export function getSephirothByElement(elemento: string): SephirotElement[] {
  return Object.values(SEPHIROT_ELEMENT_MAPPINGS).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Get all elements used in sephirot mapping
 * @returns Array of unique element types
 */
export function getAllElements(): ElementoTipo[] {
  return [...ELEMENTOS];
}

/**
 * Get the spiritual meaning for a sephirah-element correlation
 * @param sephirah - The sephirah name
 * @returns Spiritual meaning or null if not found
 */
export function getSpiritualMeaning(sephirah: string): string | null {
  return SEPHIROT_ELEMENT_MAPPINGS[sephirah]?.significado_espiritual ?? null;
}

// Default export for convenience
export default {
  getSephirotElement,
  getElementSephirot,
  getAllSephirotElements,
  getAllSephiroth,
  hasSephirotElement,
  getElementBySephirah,
  getElementNameBySephirah,
  getSephirothByElement,
  getAllElements,
  getSpiritualMeaning,
  SEPHIROT_ELEMENT_MAPPINGS,
  ELEMENTOS,
};