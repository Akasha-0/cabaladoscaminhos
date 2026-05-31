/**
 * Sephirot-Numerology Spiritual Correlation Mapping
 * Maps the ten Sephiroth of the Tree of Life to numerology numbers
 * Based on traditional Kabbalistic correspondences
 */

/** Numerology number types */
export type Numerologia = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Represents the correlation between a Sephirah and its numerological properties
 */
export interface SephirotNumerology {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The numerology number associated with this Sephirah (1-10) */
  numero: Numerologia;
  /** The corresponding classical element */
  elemento: 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Spiritual energy and quality of the sephirah-numerology connection */
  energia_espiritual: string;
}

// ─── Sephirot-to-Numerology Mapping ───────────────────────────────────────────

export const SEPHIROT_NUMEROLOGY_MAPPINGS: Record<string, SephirotNumerology> = {
  // 1. Kether (Corona) - 1 - Éter - Pureza Divina
  Kether: {
    sephirah: 'Kether',
    numero: 1,
    elemento: 'Éter',
    numero_caminho: 11,
    energia_espiritual: 'Pureza Primordial / Unidade Absoluta / Coroa Divina',
  },

  // 2. Chokmah (Sabedoria) - 2 - Éter - Impulso Dinâmico
  Chokmah: {
    sephirah: 'Chokmah',
    numero: 2,
    elemento: 'Éter',
    numero_caminho: 12,
    energia_espiritual: 'Impulso Primordial / Dinamismo Criativo / Força Vital',
  },

  // 3. Binah (Entendimento) - 3 - Ar - Discernimento Estruturado
  Binah: {
    sephirah: 'Binah',
    numero: 3,
    elemento: 'Ar',
    numero_caminho: 3,
    energia_espiritual: 'Forma / Limitação / Discernimento Superior / Compreensão',
  },

  // 4. Chesed (Misericórdia) - 4 - Água - Expansão Abundante
  Chesed: {
    sephirah: 'Chesed',
    numero: 4,
    elemento: 'Água',
    numero_caminho: 4,
    energia_espiritual: 'Expansão / Abundância / Misericórdia Divina / Graça',
  },

  // 5. Geburah (Severidade) - 5 - Fogo - Força Cortante
  Geburah: {
    sephirah: 'Geburah',
    numero: 5,
    elemento: 'Fogo',
    numero_caminho: 5,
    energia_espiritual: 'Força / Guerra Santa / Cortante / Rigidês Divina',
  },

  // 6. Tiphereth (Beleza) - 6 - Fogo - Harmonia Vital
  Tiphereth: {
    sephirah: 'Tiphereth',
    numero: 6,
    elemento: 'Fogo',
    numero_caminho: 6,
    energia_espiritual: 'Harmonia / Brilho Solar / Propósito de Vida / Beleza',
  },

  // 7. Netzach (Vitória) - 7 - Água - Amor Emocional
  Netzach: {
    sephirah: 'Netzach',
    numero: 7,
    elemento: 'Água',
    numero_caminho: 7,
    energia_espiritual: 'Vitória Emocional / Amor Universal / Triunfo',
  },

  // 8. Hod (Glória) - 8 - Ar - Intelecto Superior
  Hod: {
    sephirah: 'Hod',
    numero: 8,
    elemento: 'Ar',
    numero_caminho: 8,
    energia_espiritual: 'Intelecto / Comunicação / Verdade Divina / Glória',
  },

  // 9. Yesod (Fundação) - 9 - Água - Imaginação Subconsciente
  Yesod: {
    sephirah: 'Yesod',
    numero: 9,
    elemento: 'Água',
    numero_caminho: 9,
    energia_espiritual: 'Imaginação / Base Subconsciente / Lua / Fundação',
  },

  // 10. Malkuth (Reino) - 10 - Terra - Manifestação Material
  Malkuth: {
    sephirah: 'Malkuth',
    numero: 10,
    elemento: 'Terra',
    numero_caminho: 10,
    energia_espiritual: 'Manifestação / Aterramento / Matéria / Reino',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_NUMEROLOGY_MAPPINGS);

/**
 * Get the Sephirot-numerology correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotNumerology(sephirah: string): SephirotNumerology | null {
  return SEPHIROT_NUMEROLOGY_MAPPINGS[sephirah] ?? null;
}

/**
 * Get all Sephiroth associated with a specific numerology number
 * @param numero - The numerology number (1-10)
 * @returns Array of SephirotNumerology mappings for the given number
 */
export function getNumerologySephirot(numero: number): SephirotNumerology[] {
  return Object.values(SEPHIROT_NUMEROLOGY_MAPPINGS).filter(
    (mapping) => mapping.numero === numero,
  );
}

/**
 * Get all available Sephirot-numerology mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotNumerology(): SephirotNumerology[] {
  return Object.values(SEPHIROT_NUMEROLOGY_MAPPINGS);
}
/**
 * @returns Array of all correlation mappings
 */
export function getAllSephirotNumerologies(): SephirotNumerology[] {
  return getAllSephirotNumerology();
}
}
}