/**
 * Orixá-Frequency Correlation Module
 * Maps Orixás to Solfeggio frequencies and spiritual properties
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export interface OrixaFrequency {
  /** Name of the Orixá */
  orixa: string;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Spiritual property associated with this Orixá-frequency correlation */
  propriedade: string;
  /** Associated classical element */
  elemento: string;
  /** Chakra associated with this frequency */
  chakra: string;
}

// ─── Orixá-to-Frequency Mapping ──────────────────────────────────────────────
// Maps Orixás to their vibrational frequency correspondences.
// Frequencies are assigned based on spiritual alignment:
// 396 Hz - Liberation from fear, grounding (Terra)
// 417 Hz - Transformation, prosperity, water energy (Água)
// 528 Hz - Miracles, justice, power (Fogo)
// 639 Hz - Harmony, wisdom, victory (Ar)
// 741 Hz - Awakening, expression, storms (Ar)
// 852 Hz - Third eye, transformation, cycles (Éter)
// 963 Hz - Divine connection, illumination (Éter)

const ORIXA_FREQUENCY_MAP: Record<string, OrixaFrequency> = {
  // Oxalufã - Terra - 396 Hz - Foundation, firmness, liberation from fear
  'Oxalufã': {
    orixa: 'Oxalufã',
    frequencia: 396,
    propriedade: 'Firmeza',
    elemento: 'Terra',
    chakra: 'Básico',
  },
  // Omulu - Terra - 396 Hz - Disease and healing, liberation
  'Omulu': {
    orixa: 'Omulu',
    frequencia: 396,
    propriedade: 'Libertação',
    elemento: 'Terra',
    chakra: 'Básico',
  },
  // Oxum - Água - 417 Hz - Prosperity, flow, creativity
  'Oxum': {
    orixa: 'Oxum',
    frequencia: 417,
    propriedade: 'Prosperidade',
    elemento: 'Água',
    chakra: 'Sacro',
  },
  // Iemanjá - Água - 417 Hz - Nurturing, intuition, transformation
  'Iemanjá': {
    orixa: 'Iemanjá',
    frequencia: 417,
    propriedade: 'Maternidade',
    elemento: 'Água',
    chakra: 'Sacro',
  },
  // Nanã - Água - 417 Hz - Wisdom, ancestors, purification
  'Nanã': {
    orixa: 'Nanã',
    frequencia: 417,
    propriedade: 'Sabedoria',
    elemento: 'Água',
    chakra: 'Sacro',
  },
  // Xangô - Fogo - 528 Hz - Justice, power, transformation, miracles
  'Xangô': {
    orixa: 'Xangô',
    frequencia: 528,
    propriedade: 'Justiça',
    elemento: 'Fogo',
    chakra: 'Plexo Solar',
  },
  // Ogum - Fogo - 528 Hz - Warrior, opening paths
  'Ogum': {
    orixa: 'Ogum',
    frequencia: 528,
    propriedade: 'Guerra',
    elemento: 'Fogo',
    chakra: 'Plexo Solar',
  },
  // Oxóssi - Ar - 639 Hz - Wisdom, hunting, seeking
  'Oxóssi': {
    orixa: 'Oxóssi',
    frequencia: 639,
    propriedade: 'Sabedoria',
    elemento: 'Ar',
    chakra: 'Cardíaco',
  },
  // Iansã - Ar - 741 Hz - Liberation, storms, transformation
  'Iansã': {
    orixa: 'Iansã',
    frequencia: 741,
    propriedade: 'Libertação',
    elemento: 'Ar',
    chakra: 'Laríngeo',
  },
  // Oxumaré - Éter - 852 Hz - Transformation, cycles, rainbow serpent
  'Oxumaré': {
    orixa: 'Oxumaré',
    frequencia: 852,
    propriedade: 'Transformação',
    elemento: 'Éter',
    chakra: 'Frontal',
  },
  // Oxalá - Éter - 963 Hz - Divine creation, purity, illumination
  'Oxalá': {
    orixa: 'Oxalá',
    frequencia: 963,
    propriedade: 'Iluminação',
    elemento: 'Éter',
    chakra: 'Coronário',
  },
  // Ori - Éter - 963 Hz - Personal destiny, inner head
  'Ori': {
    orixa: 'Ori',
    frequencia: 963,
    propriedade: 'Iluminação',
    elemento: 'Éter',
    chakra: 'Coronário',
  },
};

/**
 * Get Orixá-frequency correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaFrequency mapping or undefined if not found
 */
export function getOrixaFrequency(orixa: string): OrixaFrequency | undefined {
  const normalized = orixa.trim();
  return ORIXA_FREQUENCY_MAP[normalized] || Object.values(ORIXA_FREQUENCY_MAP).find(
    entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get the frequency associated with an Orixá
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyOrixa(orixa: string): number | null {
  const result = getOrixaFrequency(orixa);
  return result?.frequencia ?? null;
}

/**
 * Get the spiritual property associated with an Orixá
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns Property string or null if not found
 */
export function getOrixaProperty(orixa: string): string | null {
  const result = getOrixaFrequency(orixa);
  return result?.propriedade ?? null;
}

/**
 * Get all registered Orixás
 * @returns Array of all Orixá names
 */
export function getAllOrixas(): string[] {
  return Object.keys(ORIXA_FREQUENCY_MAP);
}

/**
 * Get all Orixás for a specific frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of OrixaFrequency mappings with this frequency
 */
export function getOrixasByFrequency(frequencia: number): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    entry => entry.frequencia === frequencia
  );
}

/**
 * Get all Orixás for a specific element
 * @param elemento - Element type (Terra, Água, Fogo, Ar, Éter)
 * @returns Array of OrixaFrequency mappings with this element
 */
export function getOrixasByElement(elemento: string): OrixaFrequency[] {
  const normalized = elemento.trim();
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    entry => entry.elemento.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get all Orixás for a specific chakra
 * @param chakra - Chakra name (case-insensitive)
 * @returns Array of OrixaFrequency mappings with this chakra
 */
export function getOrixasByChakra(chakra: string): OrixaFrequency[] {
  const normalized = chakra.trim().toLowerCase();
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    entry => entry.chakra.toLowerCase().includes(normalized)
  );
}

/**
 * Get all Orixá-frequency mappings
 * @returns Array of all OrixaFrequency objects
 */
export function getAllOrixaFrequencies(): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP);
}

export default {
  getOrixaFrequency,
  getFrequencyOrixa,
  getOrixaProperty,
  getAllOrixas,
  getOrixasByFrequency,
  getOrixasByElement,
  getOrixasByChakra,
  getAllOrixaFrequencies,
};
