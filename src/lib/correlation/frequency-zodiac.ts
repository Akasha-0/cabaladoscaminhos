/**
 * Frequency-Zodiac Spiritual Correlation Module
 * Based on Solfeggio frequencies mapped to zodiac signs
 * Source: Cabala dos Caminhos spiritual system
 */

import type { Elemento } from './element-sign';

/** The twelve zodiac signs in Portuguese */
export type SignoZodiac =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

/**
 * Represents the correlation between a Solfeggio frequency and zodiac sign
 */
export interface FrequencyZodiacMapping {
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Associated zodiac sign */
  signo: SignoZodiac;
  /** Element connection */
  elemento: Elemento;
  /** Healing properties for this frequency-sign combination */
  propriedades_healing: {
    /** Physical healing focus */
    fisico: string;
    /** Emotional healing focus */
    emocional: string;
    /** Mental/spiritual healing focus */
    mental_espiritual: string;
    /** Best time for practice */
    melhor_epoca: string;
  };
}

/**
 * Complete mapping of the 7 Solfeggio frequencies to their zodiac correspondences.
 * Based on elemental correspondences and spiritual properties from the Cabala dos Caminhos system.
 * Each frequency carries the vibrational signature of its corresponding zodiac sign.
 */
export const FREQUENCY_ZODIAC_MAP: Record<number, FrequencyZodiacMapping> = {
  396: {
    frequencia: 396,
    signo: 'Touro',
    elemento: 'Terra',
    propriedades_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e saúde geral',
      emocional: 'Dissolve medos de perda e insegurança material',
      mental_espiritual: 'Promove estabilidade mental e paciência',
      melhor_epoca: 'Períodos de mudança económica, necessidades de base',
    },
  },
  417: {
    frequencia: 417,
    signo: 'Câncer',
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Hidrata tecidos e melhora saúde emocional',
      emocional: 'Libera traumas familiares e medos ancestrais',
      mental_espiritual: 'Facilita cura emocional profunda e adaptação',
      melhor_epoca: 'Fases de transição familiar, cura de feridas emocionais',
    },
  },
  528: {
    frequencia: 528,
    signo: 'Leão',
    elemento: 'Fogo',
    propriedades_healing: {
      fisico: 'Estimula coração, sistema nervoso e vitalidade',
      emocional: 'Transforma orgulho em amor próprio genuíno',
      mental_espiritual: 'Ativa criatividade, expressão e propósito de vida',
      melhor_epoca: 'Momento de buscar reconhecimento, expressing individualidade',
    },
  },
  639: {
    frequencia: 639,
    signo: 'Libra',
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Equilibra sistema hormonal e circulatório',
      emocional: 'Harmoniza relacionamentos e resolve conflitos',
      mental_espiritual: 'Promove justiça, equilíbrio e diplomatía',
      melhor_epoca: 'Decisões sobre parcerias, busca de harmonia em relações',
    },
  },
  741: {
    frequencia: 741,
    signo: 'Aquário',
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Limpa garganta e vias respiratórias',
      emocional: 'Liberta pensamiento rígido e rebelião interior',
      mental_espiritual: 'Desperta pensamento humanitário e inovação',
      melhor_epoca: 'Trabalhos para comunidade, buscas por liberdade individual',
    },
  },
  852: {
    frequencia: 852,
    signo: 'Escorpião',
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Equilibra sistema nervoso e glandular',
      emocional: 'Dissipa ilusões e revela verdades ocultas',
      mental_espiritual: 'Desperta intuição profunda e transformação radical',
      melhor_epoca: 'Períodos de regeneração, busca de verdades escondidas',
    },
  },
  963: {
    frequencia: 963,
    signo: 'Peixes',
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Restaura padrão original do corpo e regeneração',
      emocional: 'Promove compaixão universal e paz interior',
      mental_espiritual: 'Conexão com o divino e transcendência do ego',
      melhor_epoca: 'Méditação profunda, busca espiritual, dissolução de límites',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(FREQUENCY_ZODIAC_MAP);
Object.values(FREQUENCY_ZODIAC_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-zodiac mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyZodiacMapping or null if not found
 */
export function getFrequencyZodiac(frequencia: number): FrequencyZodiacMapping | null {
  return FREQUENCY_ZODIAC_MAP[frequencia] ?? null;
}

/**
 * Get the zodiac sign associated with a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns SignoZodiac or null if not found
 */
export function getZodiacFrequency(frequencia: number): SignoZodiac | null {
  return FREQUENCY_ZODIAC_MAP[frequencia]?.signo ?? null;
}

/**
 * Get all available frequency-zodiac mappings
 * @returns Array of all correlation mappings
 */
export function getAllFrequencyZodiacs(): FrequencyZodiacMapping[] {
  return Object.values(FREQUENCY_ZODIAC_MAP);
}

/**
 * Get the element for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Elemento or null if not found
 */
export function getFrequencyZodiacElement(frequencia: number): Elemento | null {
  return FREQUENCY_ZODIAC_MAP[frequencia]?.elemento ?? null;
}

/**
 * Get the healing properties for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Healing properties or null if not found
 */
export function getFrequencyZodiacHealing(frequencia: number): FrequencyZodiacMapping['propriedades_healing'] | null {
  return FREQUENCY_ZODIAC_MAP[frequencia]?.propriedades_healing ?? null;
}

/**
 * Get all frequencies associated with a specific zodiac sign
 * @param signo - Zodiac sign name
 * @returns Array of FrequencyZodiacMapping or empty array if not found
 */
export function getFrequenciesBySigno(signo: string): FrequencyZodiacMapping[] {
  return Object.values(FREQUENCY_ZODIAC_MAP).filter(
    (mapping) => mapping.signo.toLowerCase() === signo.toLowerCase()
  );
}

/**
 * Get the best epoch/time for healing practice with a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Best epoch string or null if not found
 */
export function getFrequencyZodiacBestEpoch(frequencia: number): string | null {
  return FREQUENCY_ZODIAC_MAP[frequencia]?.propriedades_healing.melhor_epoca ?? null;
}

/**
 * Get all frequencies mapped to a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of FrequencyZodiacMapping
 */
export function getFrequenciesZodiacByElement(elemento: string): FrequencyZodiacMapping[] {
  return Object.values(FREQUENCY_ZODIAC_MAP).filter(
    (mapping) => mapping.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get all zodiac signs used in the mapping
 * @returns Array of unique sign names
 */
export function getAllZodiacSigns(): SignoZodiac[] {
  const signs = new Set<SignoZodiac>();
  Object.values(FREQUENCY_ZODIAC_MAP).forEach((mapping) => {
    signs.add(mapping.signo);
  });
  return Array.from(signs);
}

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarSigno(signo: string): SignoZodiac | null {
  const mapa: Record<string, SignoZodiac> = {
    aries: 'Áries',
    touro: 'Touro',
    taurinus: 'Touro',
    gemeos: 'Gémeos',
    gêmeos: 'Gémeos',
    cancer: 'Câncer',
    cancro: 'Câncer',
    leao: 'Leão',
    leão: 'Leão',
    virgem: 'Virgem',
    libra: 'Libra',
    escorpiao: 'Escorpião',
    escorpião: 'Escorpião',
    sagitario: 'Sagitário',
    sagitário: 'Sagitário',
    capricornio: 'Capricórnio',
    capricórnio: 'Capricórnio',
    aquario: 'Aquário',
    aquário: 'Aquário',
    peixes: 'Peixes',
  };
  const normalizado = mapa[signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')];
  return normalizado ?? null;
}

/**
 * Get frequency mapping by zodiac sign name (case-insensitive)
 * @param signo - Zodiac sign name
 * @returns FrequencyZodiacMapping or null if not found
 */
export function getFrequencyZodiacBySigno(signo: string): FrequencyZodiacMapping | null {
  const normalizado = normalizarSigno(signo);
  if (!normalizado) return null;
  
  const found = Object.values(FREQUENCY_ZODIAC_MAP).find(
    (mapping) => mapping.signo === normalizado
  );
  return found ?? null;
}

// fallow-ignore-next-line unused-export
export default {
  getFrequencyZodiac,
  getZodiacFrequency,
  getAllFrequencyZodiacs,
  getFrequencyZodiacElement,
  getFrequencyZodiacHealing,
  getFrequenciesBySigno,
  getFrequencyZodiacBestEpoch,
  getFrequenciesZodiacByElement,
  getAllZodiacSigns,
  getFrequencyZodiacBySigno,
};