/**
 * Orixá-Frequency Correlation Module
 * Maps Orixás to their corresponding Solfeggio frequencies
 * Based on IDEIA.md and the Cabala dos Caminhos framework
 */

/**
 * Represents the correlation between an Orixá and its Solfeggio frequency
 */
export interface OrixaFrequency {
  /** Orixá name */
  orixa: string;
  /** Associated Solfeggio frequency in Hz */
  frequencia: number;
  /** Spiritual property associated with this Orixá-frequency */
  propriedade: string;
  /** Element associated with this Orixá */
  elemento: string;
  /** Chakra associated with this Orixá-frequency */
  chakra: string;
}

/**
 * Complete mapping of Orixás to their Solfeggio frequency correspondences.
 * Based on frequency-orixa.ts as the source of truth.
 * Each Orixá carries the vibrational signature of its corresponding frequency.
 */
const ORIXA_FREQUENCY_MAP: Record<string, OrixaFrequency> = {
  'Oxalufã': {
    orixa: 'Oxalufã',
    frequencia: 396,
    propriedade: 'Firmeza, proteção e dissolução de medos de sobrevivência',
    elemento: 'Terra',
    chakra: '1º Básico (Muladhara)',
  },
  'Omulu': {
    orixa: 'Omulu',
    frequencia: 396,
    propriedade: 'Cura de doenças, transformação da escuridão em luz',
    elemento: 'Terra',
    chakra: '1º Básico (Muladhara)',
  },
  'Oxum': {
    orixa: 'Oxum',
    frequencia: 417,
    propriedade: 'Prosperidade, renovação emocional e fluidez',
    elemento: 'Água',
    chakra: '2º Sacro (Svadhisthana)',
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    frequencia: 417,
    propriedade: 'Nutrição, proteção maternal e ciclos de renovação',
    elemento: 'Água',
    chakra: '2º Sacro (Svadhisthana)',
  },
  'Xangô': {
    orixa: 'Xangô',
    frequencia: 528,
    propriedade: 'Justiça, força vital e transformação criativa',
    elemento: 'Fogo',
    chakra: '3º Plexo Solar (Manipura)',
  },
  'Logun Ede': {
    orixa: 'Logun Ede',
    frequencia: 528,
    propriedade: 'Equilíbrio entre masculino e feminino, beleza',
    elemento: 'Fogo',
    chakra: '3º Plexo Solar (Manipura)',
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    frequencia: 639,
    propriedade: 'Sabedoria, fartura e abertura de caminhos',
    elemento: 'Ar',
    chakra: '4º Cardíaco (Anahata)',
  },
  'Nanã Buruquá': {
    orixa: 'Nanã Buruquá',
    frequencia: 639,
    propriedade: 'Sabedoria ancestral, ancianidade e conhecimento oculto',
    elemento: 'Ar',
    chakra: '4º Cardíaco (Anahata)',
  },
  'Iansã': {
    orixa: 'Iansã',
    frequencia: 741,
    propriedade: 'Libertação, expressão autêntica e transformação',
    elemento: 'Ar',
    chakra: '5º Laríngeo (Vishuddha)',
  },
  'Obá': {
    orixa: 'Obá',
    frequencia: 741,
    propriedade: 'Força guerreira, proteção e batalha espiritual',
    elemento: 'Ar',
    chakra: '5º Laríngeo (Vishuddha)',
  },
  'Oxumaré': {
    orixa: 'Oxumaré',
    frequencia: 852,
    propriedade: 'Transformação completa, equilíbrio de opostos',
    elemento: 'Éter',
    chakra: '6º Frontal (Ajna)',
  },
  'Ossaim': {
    orixa: 'Ossaim',
    frequencia: 852,
    propriedade: 'Conhecimento das folhas, cura herbal e sabedoria verde',
    elemento: 'Éter',
    chakra: '6º Frontal (Ajna)',
  },
  'Ori': {
    orixa: 'Ori',
    frequencia: 963,
    propriedade: 'Iluminação interior, propósito de vida e conexão divina',
    elemento: 'Éter',
    chakra: '7º Coronário (Sahasrara)',
  },
  'Olokun': {
    orixa: 'Olokun',
    frequencia: 963,
    propriedade: 'Abundância das profundezas, mistérios do mar',
    elemento: 'Éter',
    chakra: '7º Coronário (Sahasrara)',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ORIXA_FREQUENCY_MAP);
Object.values(ORIXA_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get Orixá-frequency mapping for a given Orixá
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaFrequency mapping or undefined if not found
 */
export function getOrixaFrequency(orixa: string): OrixaFrequency | undefined {
  const normalized = orixa.trim();
  return (
    ORIXA_FREQUENCY_MAP[normalized] ||
    Object.values(ORIXA_FREQUENCY_MAP).find(
      entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
    )
  );
}

/**
 * Get the frequency corresponding to a given Orixá
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyOrixa(orixa: string): number | null {
  const mapping = getOrixaFrequency(orixa);
  return mapping?.frequencia ?? null;
}

/**
 * Get the property associated with a given Orixá
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns Property string or null if not found
 */
export function getOrixaProperty(orixa: string): string | null {
  const mapping = getOrixaFrequency(orixa);
  return mapping?.propriedade ?? null;
}

/**
 * Get all registered Orixás
 * @returns Array of all Orixá names
 */
export function getAllOrixas(): string[] {
  return Object.keys(ORIXA_FREQUENCY_MAP);
}

/**
 * Get Orixás by frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of OrixaFrequency mappings for that frequency
 */
export function getOrixasByFrequency(frequencia: number): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    entry => entry.frequencia === frequencia
  );
}

/**
 * Get Orixás by element
 * @param elemento - Element name (e.g., 'Terra', 'Água', 'Fogo', 'Ar', 'Éter')
 * @returns Array of OrixaFrequency mappings for that element
 */
export function getOrixasByElement(elemento: string): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    entry => entry.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get Orixás by chakra
 * @param chakra - Chakra name (case-insensitive)
 * @returns Array of OrixaFrequency mappings for that chakra
 */
export function getOrixasByChakra(chakra: string): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    entry => entry.chakra.toLowerCase().includes(chakra.toLowerCase())
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