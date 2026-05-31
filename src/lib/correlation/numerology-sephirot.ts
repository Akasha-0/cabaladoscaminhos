/**
 * Numerology-Sephirot Spiritual Correlation Mapping
 * Maps numerology numbers to the ten Sephiroth of the Tree of Life
 * Based on traditional Kabbalistic correspondences
 */

/** Numerology number types */
export type Numerologia = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Represents the correlation between a numerology number and its Sephiroth properties
 */
export interface NumerologySephirot {
  /** The numerology number (1-10) */
  numero: Numerologia;
  /** The name of the corresponding Sephirah in Hebrew/English */
  sephirah: string;
  /** The corresponding classical element */
  elemento: 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Spiritual energy and quality of the number-sephirah connection */
  energia_espiritual: string;
}

// ─── Numerology-to-Sephirot Mapping ───────────────────────────────────────────

export const NUMEROLOGY_SEPHIROT_MAPPINGS: Record<number, NumerologySephirot> = {
  // 1 - Kether (Corona) - Éter - Pureza Divina
  1: {
    numero: 1,
    sephirah: 'Kether',
    elemento: 'Éter',
    numero_caminho: 11,
    energia_espiritual: 'Pureza Primordial / Unidade Absoluta / Coroa Divina',
  },

  // 2 - Chokmah (Sabedoria) - Éter - Impulso Dinâmico
  2: {
    numero: 2,
    sephirah: 'Chokmah',
    elemento: 'Éter',
    numero_caminho: 12,
    energia_espiritual: 'Impulso Primordial / Dinamismo Criativo / Força Vital',
  },

  // 3 - Binah (Entendimento) - Ar - Discernimento Estruturado
  3: {
    numero: 3,
    sephirah: 'Binah',
    elemento: 'Ar',
    numero_caminho: 3,
    energia_espiritual: 'Forma / Limitação / Discernimento Superior / Compreensão',
  },

  // 4 - Chesed (Misericórdia) - Água - Expansão Abundante
  4: {
    numero: 4,
    sephirah: 'Chesed',
    elemento: 'Água',
    numero_caminho: 4,
    energia_espiritual: 'Expansão / Abundância / Misericórdia Divina / Graça',
  },

  // 5 - Geburah (Severidade) - Fogo - Força Cortante
  5: {
    numero: 5,
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 5,
    energia_espiritual: 'Força / Guerra Santa / Cortante / Rigidês Divina',
  },

  // 6 - Tiphereth (Beleza) - Fogo - Harmonia Vital
  6: {
    numero: 6,
    sephirah: 'Tiphereth',
    elemento: 'Fogo',
    numero_caminho: 6,
    energia_espiritual: 'Harmonia / Brilho Solar / Propósito de Vida / Beleza',
  },

  // 7 - Netzach (Vitória) - Água - Amor Emocional
  7: {
    numero: 7,
    sephirah: 'Netzach',
    elemento: 'Água',
    numero_caminho: 7,
    energia_espiritual: 'Vitória Emocional / Amor Universal / Triunfo',
  },

  // 8 - Hod (Glória) - Ar - Intelecto Superior
  8: {
    numero: 8,
    sephirah: 'Hod',
    elemento: 'Ar',
    numero_caminho: 8,
    energia_espiritual: 'Intelecto / Comunicação / Verdade Divina / Glória',
  },

  // 9 - Yesod (Fundação) - Água - Imaginação Subconsciente
  9: {
    numero: 9,
    sephirah: 'Yesod',
    elemento: 'Água',
    numero_caminho: 9,
    energia_espiritual: 'Imaginação / Base Subconsciente / Lua / Fundação',
  },

  // 10 - Malkuth (Reino) - Terra - Manifestação Material
  10: {
    numero: 10,
    sephirah: 'Malkuth',
    elemento: 'Terra',
    numero_caminho: 10,
    energia_espiritual: 'Manifestação / Aterramento / Matéria / Reino',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(NUMEROLOGY_SEPHIROT_MAPPINGS);

// Freeze nested objects
Object.values(NUMEROLOGY_SEPHIROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the numerology-Sephirot correlation mapping by number
 * @param numero - The numerology number (1-10)
 * @returns The correlation mapping or null if not found
 */
export function getNumerologySephirot(numero: number): NumerologySephirot | null {
  return NUMEROLOGY_SEPHIROT_MAPPINGS[numero] ?? null;
}

/**
 * Get the Sephirot associated with a specific numerology number
 * @param numero - The numerology number (1-10)
 * @returns The Sephirot name or null if not found
 */
export function getSephirotNumerology(numero: number): string | null {
  const mapping = NUMEROLOGY_SEPHIROT_MAPPINGS[numero];
  return mapping?.sephirah ?? null;
}

/**
 * Get all available numerology-Sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllNumerologySephiroths(): NumerologySephirot[] {
  return Object.values(NUMEROLOGY_SEPHIROT_MAPPINGS);
}