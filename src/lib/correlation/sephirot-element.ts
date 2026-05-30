/**
 * Sephirot-Element Spiritual Correlation Mapping
 * Maps the ten Sephiroth of the Tree of Life to classical elements
 * Based on traditional Kabbalistic correspondences
 */

/** The five classical elements including quintessence (Éter) */
export type Elemento = 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';

/**
 * Represents the correlation between a Sephirah and its elemental correspondence
 */
export interface SephirotElement {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The corresponding classical element */
  elemento: Elemento;
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Spiritual energy and quality of the element-sephirah connection */
  energia_espiritual: string;
}

// ─── Sephirot-to-Element Mapping ─────────────────────────────────────────────

export const SEPHIROT_ELEMENT_MAPPINGS: Record<string, SephirotElement> = {
  // 1. Kether (Corona) - Éter - Pureza Divina
  Kether: {
    sephirah: 'Kether',
    elemento: 'Éter',
    numero_caminho: 11,
    energia_espiritual: 'Pureza Primordial / Conexão Divina Absoluta',
  },

  // 2. Chokmah (Sabedoria) - Éter - Impulso Dinâmico
  Chokmah: {
    sephirah: 'Chokmah',
    elemento: 'Éter',
    numero_caminho: 12,
    energia_espiritual: 'Impulso Primordial / Dinamismo Criativo',
  },

  // 3. Binah (Entendimento) - Ar - Discernimento Estruturado
  Binah: {
    sephirah: 'Binah',
    elemento: 'Ar',
    numero_caminho: 3,
    energia_espiritual: 'Forma / Limitação / Discernimento Superior',
  },

  // 4. Chesed (Misericórdia) - Água - Expansão Abundante
  Chesed: {
    sephirah: 'Chesed',
    elemento: 'Água',
    numero_caminho: 4,
    energia_espiritual: 'Expansão / Abundância / Misericórdia Divina',
  },

  // 5. Geburah (Severidade) - Fogo - Força Cortante
  Geburah: {
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 5,
    energia_espiritual: 'Força / Guerra Santa / Cortante',
  },

  // 6. Tiphereth (Beleza) - Fogo - Harmonia Vital
  Tiphereth: {
    sephirah: 'Tiphereth',
    elemento: 'Fogo',
    numero_caminho: 6,
    energia_espiritual: 'Harmonia / Brilho Solar / Propósito de Vida',
  },

  // 7. Netzach (Vitória) - Água - Amor Emocional
  Netzach: {
    sephirah: 'Netzach',
    elemento: 'Água',
    numero_caminho: 7,
    energia_espiritual: 'Vitória Emocional / Amor Universal',
  },

  // 8. Hod (Glória) - Ar - Intelecto Superior
  Hod: {
    sephirah: 'Hod',
    elemento: 'Ar',
    numero_caminho: 8,
    energia_espiritual: 'Intelecto / Comunicação / Verdade Divina',
  },

  // 9. Yesod (Fundação) - Água - Imaginação Subconsciente
  Yesod: {
    sephirah: 'Yesod',
    elemento: 'Água',
    numero_caminho: 9,
    energia_espiritual: 'Imaginação / Base Subconsciente / Lua',
  },

  // 10. Malkuth (Reino) - Terra - Manifestação Material
  Malkuth: {
    sephirah: 'Malkuth',
    elemento: 'Terra',
    numero_caminho: 10,
    energia_espiritual: 'Manifestação / Aterramento / Matéria',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_ELEMENT_MAPPINGS);

/**
 * Get the Sephirot-element correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotElement(sephirah: string): SephirotElement | null {
  return SEPHIROT_ELEMENT_MAPPINGS[sephirah] ?? null;
}

/**
 * Get all Sephiroth associated with a specific element
 * @param elemento - The element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of SephirotElement mappings for the given element
 */
export function getElementSephirot(elemento: string): SephirotElement[] {
  return Object.values(SEPHIROT_ELEMENT_MAPPINGS).filter(
    (mapping) => mapping.elemento === elemento,
  );
}

/**
 * Get all available Sephirot-element mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotElements(): SephirotElement[] {
  return Object.values(SEPHIROT_ELEMENT_MAPPINGS);
}