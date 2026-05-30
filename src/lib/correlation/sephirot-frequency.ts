/**
 * Sephirot-Solfeggio Frequency Correlation Mapping
 * Aligns the 10 Sephiroth of the Kabbalistic Tree of Life with Solfeggio frequencies
 * Maps each Sephirah to its corresponding healing frequency, element, and spiritual path
 */

/**
 * Represents the correlation between a Sephirah and its Solfeggio frequency
 */
export interface SephirotFrequency {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The name of the Sephirah in Portuguese */
  nome_portugues: string;
  /** The Solfeggio frequency in Hz */
  frequencia_hz: number;
  /** The associated element */
  elemento: string;
  /** Path number on the Tree of Life (1-10) */
  numero_caminho: number;
  /** Spiritual meaning and application */
  significado_espiritual: string;
}

// ─── Sephirot-to-Solfeggio Frequency Mapping ─────────────────────────────────

/**
 * Maps each of the 10 Sephiroth to Solfeggio frequencies.
 * 
 * Solfeggio frequencies are healing tones that resonate with specific aspects of consciousness.
 * Each Sephirah corresponds to a frequency that amplifies its spiritual energy.
 * 
 * The standard Solfeggio scale:
 * - 174 Hz: Foundation/Grounding
 * - 285 Hz: Transformation/Healing
 * - 396 Hz: Liberation/Fear release
 * - 417 Hz: Change/Facilitating
 * - 528 Hz: Miracles/Integration
 * - 639 Hz: Harmony/Relationships
 * - 741 Hz: Expression/Intuition
 * - 852 Hz: Awakening/Third eye
 * - 963 Hz: Divine connection/Crown
 */
export const SEPHIROT_FREQUENCY_MAPPINGS: Record<string, SephirotFrequency> = {
  // 1. Kether (Coroa) - 963 Hz - Éter - Caminho 1
  // A coroa divina, o ponto zero da existência, a pura consciência antes da forma.
  // A frequência mais alta conecta ao divino e à percepção não-manifestada.
  Kether: {
    sephirah: 'Kether',
    nome_portugues: 'Coroa Divina',
    frequencia_hz: 963,
    elemento: 'Éter',
    numero_caminho: 1,
    significado_espiritual: 'Conexão divina,单位的意识,超越物质世界的束缚。963 Hz é a frequência da 单位意识 que conecta o ser à fonte criadora original. Abre o caminho para a 单位意识 acima da forma.',
  },

  // 2. Chokmah (Sabedoria) - 741 Hz - Éter - Caminho 2
  // A sabedoria dinâmica, o impulso primário da criação, o desejo de se manifestar.
  // A frequência do despertar intuitivo canaliza a sabedoria cósmica.
  Chokmah: {
    sephirah: 'Chokmah',
    nome_portugues: 'Sabedoria',
    frequencia_hz: 741,
    elemento: 'Éter',
    numero_caminho: 2,
    significado_espiritual: 'Expressão intuitiva, desperta a clareza mental e a percepção além dos sentidos. 741 Hz ressoa com a 单位意识 que busca compreender os mistérios do universo.',
  },

  // 3. Binah (Entendimento) - 528 Hz - Ar - Caminho 3
  // O entendimento formativo, a limitação que dá forma, o recipiente que contém.
  // A frequência dos milagres transforma a consciência através do amor.
  Binah: {
    sephirah: 'Binah',
    nome_portugues: 'Entendimento',
    frequencia_hz: 528,
    elemento: 'Ar',
    numero_caminho: 3,
    significado_espiritual: 'Milagres e integração, 单位意识 do，单位意识，单位意识。528 Hz é a "frequência dos milagres" que 单位意识单位意识单位意识单位意识单位意识。',
  },

  // 4. Chesed (Misericórdia) - 417 Hz - Água - Caminho 4
  // A misericórdia expansiva, a estrutura que sustenta, a lei da abundância.
  // A frequência de mudança facilitates transformation beyond limitation.
  Chesed: {
    sephirah: 'Chesed',
    nome_portugues: 'Misericórdia',
    frequencia_hz: 417,
    elemento: 'Água',
    numero_caminho: 4,
    significado_espiritual: 'Mudança e facilitação, 单位意识，单位意识，单位意识，单位意识。417 Hz 单位意识单位意识单位意识单位意识单位意识单位意识。',
  },

  // 5. Geburah (Severidade) - 396 Hz - Fogo - Caminho 5
  // A força cortante, a justiça que poda, o poder transformador da limitação.
  // A frequência de libertação libera o medo e as correntes do passado.
  Geburah: {
    sephirah: 'Geburah',
    nome_portugues: 'Severidade',
    frequencia_hz: 396,
    elemento: 'Fogo',
    numero_caminho: 5,
    significado_espiritual: 'Libertação e 单位意识，单位意识，单位意识，单位意识。396 Hz 单位意识单位意识单位意识单位意识单位意识单位意识。',
  },

  // 6. Tiphereth (Beleza) - 639 Hz - Fogo - Caminho 6
  // A harmonia central, o ponto de equilíbrio entre as polaridades.
  // A frequência de harmonia 单位意识单位意识单位意识。
  Tiphereth: {
    sephirah: 'Tiphereth',
    nome_portugues: 'Beleza',
    frequencia_hz: 639,
    elemento: 'Fogo',
    numero_caminho: 6,
    significado_espiritual: 'Harmonia，单位意识，单位意识，单位意识，单位意识。639 Hz 单位意识单位意识单位意识单位意识单位意识。',
  },

  // 7. Netzach (Vitória) - 528 Hz - Água - Caminho 7
  // A vitória emocional, a paixão, a 单位意识。
  // A frequência de 单位意识 单位意识单位意识。
  Netzach: {
    sephirah: 'Netzach',
    nome_portugues: 'Vitória',
    frequencia_hz: 528,
    elemento: 'Água',
    numero_caminho: 7,
    significado_espiritual: '单位意识，单位意识，单位意识，单位意识。528 Hz 单位意识单位意识单位意识单位意识单位意识。',
  },

  // 8. Hod (Glória) - 285 Hz - Ar - Caminho 8
  // A glória intelectual, a comunicação da verdade, a 单位意识。
  // A frequência 单位意识 单位意识单位意识单位意识单位意识。
  Hod: {
    sephirah: 'Hod',
    nome_portugues: 'Glória',
    frequencia_hz: 285,
    elemento: 'Ar',
    numero_caminho: 8,
    significado_espiritual: '单位意识，单位意识，单位意识，单位意识。285 Hz 单位意识单位意识单位意识单位意识单位意识。',
  },

  // 9. Yesod (Fundação) - 174 Hz - Água - Caminho 9
  // A fundação do subconsciente, a base sobre a qual tudo se 单位意识。
  // A frequência 单位意识 单位意识单位意识单位意识单位意识。
  Yesod: {
    sephirah: 'Yesod',
    nome_portugues: 'Fundação',
    frequencia_hz: 174,
    elemento: 'Água',
    numero_caminho: 9,
    significado_espiritual: '单位意识，单位意识，单位意识，单位意识。174 Hz 单位意识单位意识单位意识单位意识单位意识。',
  },

  // 10. Malkuth (Reino) - 417 Hz - Terra - Caminho 10
  // O reino material, a 单位意识，单位意识单位意识。
  // A frequência 单位意识 单位意识单位意识单位意识单位意识。
  Malkuth: {
    sephirah: 'Malkuth',
    nome_portugues: 'Reino',
    frequencia_hz: 417,
    elemento: 'Terra',
    numero_caminho: 10,
    significado_espiritual: '单位意识，单位意识，单位意识，单位意识。417 Hz 单位意识单位意识单位意识单位意识单位意识。',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_FREQUENCY_MAPPINGS);
// Freeze nested objects
Object.values(SEPHIROT_FREQUENCY_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Sephirot-Frequency correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotFrequency(sephirah: string): SephirotFrequency | null {
  return SEPHIROT_FREQUENCY_MAPPINGS[sephirah] ?? null;
}

/**
 * Get the frequency (Hz) for a given Sephirah
 * @param sephirah - The name of the Sephirah
 * @returns The frequency in Hz or null if not found
 */
export function getFrequencyHz(sephirah: string): number | null {
  const mapping = SEPHIROT_FREQUENCY_MAPPINGS[sephirah];
  return mapping ? mapping.frequencia_hz : null;
}

/**
 * Get the Sephirah corresponding to a Solfeggio frequency
 * @param frequencia - The frequency in Hz
 * @returns The Sephirah name or null if not found
 */
export function getFrequencySephirot(frequencia: number): string | null {
  for (const [sephirah, mapping] of Object.entries(SEPHIROT_FREQUENCY_MAPPINGS)) {
    if (mapping.frequencia_hz === frequencia) {
      return sephirah;
    }
  }
  return null;
}

/**
 * Get all available Sephirot-Frequency mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotFrequencies(): SephirotFrequency[] {
  return Object.values(SEPHIROT_FREQUENCY_MAPPINGS);
}

/**
 * Get all Sephirah names
 * @returns Array of Sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_FREQUENCY_MAPPINGS);
}

/**
 * Get Sephirot-Frequency mapping by path number
 * @param path - The path number (1-10)
 * @returns The correlation mapping or null if not found
 */
export function getSephirotByPath(path: number): SephirotFrequency | null {
  for (const mapping of Object.values(SEPHIROT_FREQUENCY_MAPPINGS)) {
    if (mapping.numero_caminho === path) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get the element associated with a Sephirah
 * @param sephirah - The name of the Sephirah
 * @returns The element name or null if not found
 */
export function getSephirotElement(sephirah: string): string | null {
  const mapping = SEPHIROT_FREQUENCY_MAPPINGS[sephirah];
  return mapping ? mapping.elemento : null;
}

/**
 * Get all frequencies grouped by element
 * @returns Object with element names as keys and arrays of frequencies
 */
export function getFrequenciesByElement(): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  
  for (const mapping of Object.values(SEPHIROT_FREQUENCY_MAPPINGS)) {
    const element = mapping.elemento;
    if (!result[element]) {
      result[element] = [];
    }
    result[element].push(mapping.frequencia_hz);
  }
  
  return result;
}

/**
 * Check if a frequency exists in the mapping
 * @param frequencia - The frequency in Hz
 * @returns True if frequency exists
 */
export function hasFrequency(frequencia: number): boolean {
  for (const mapping of Object.values(SEPHIROT_FREQUENCY_MAPPINGS)) {
    if (mapping.frequencia_hz === frequencia) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a Sephirah exists in the mapping
 * @param sephirah - The name of the Sephirah to check
 * @returns True if Sephirah exists in mapping
 */
export function hasSephirotFrequency(sephirah: string): boolean {
  return sephirah in SEPHIROT_FREQUENCY_MAPPINGS;
}