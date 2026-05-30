/**
 * Chakra-Zodiac Spiritual Correlation
 * Maps each chakra to its primary and secondary zodiac sign, elemental alignment, and spiritual practices.
 * Based on the Cabala dos Caminhos system integrating Eastern chakra wisdom with Western astrology.
 */

import type { Elemento } from './chakra-element';
import type { ChakraName } from './chakra-element';

export type Signo =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Caranguejo'
  | 'Leão'
  | 'Virgem'
  | 'Balança'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

export type PraticaEspiritual =
  | 'Meditação'
  | 'Yoga'
  | 'Pranayama'
  | 'Visualização'
  | 'Mantras'
  | 'Afirmações'
  | 'Journaling'
  | 'Banhos Ritualísticos'
  | 'Defumação'
  | 'Gratidão'
  | 'Autosugestão'
  | 'Respiração'
  | 'Caminhada'
  | 'Contemplação';

export interface ChakraZodiacMapping {
  /** Chakra number and name */
  chakra: ChakraName;
  /** Primary zodiac sign most aligned with this chakra */
  signo_primario: Signo;
  /** Secondary zodiac sign with lesser influence */
  signo_secundario: Signo;
  /** Elemental alignment of the chakra */
  elemento: Elemento;
  /** Recommended spiritual practices for this chakra-sign combination */
  praticas: PraticaEspiritual[];
}

/**
 * Complete mapping of all 7 chakras with their zodiac correspondences.
 * Based on classical Hindu chakra system correlated with Western astrology
 * through the Cabala dos Caminhos framework.
 */
export const CHAKRA_ZODIAC_MAPPINGS: Readonly<Record<ChakraName, ChakraZodiacMapping>> = {
  /** Muladhara (1º) - Raiz - Terra - Capricórnio primary, Touro secondary */
  Muladhara: {
    chakra: 'Muladhara',
    signo_primario: 'Capricórnio',
    signo_secundario: 'Touro',
    elemento: 'Terra',
    praticas: ['Yoga', 'Meditação', 'Gratidão', 'Autosugestão'],
  },

  /** Svadhisthana (2º) - Sacral - Água - Escorpião primary, Virgem secondary */
  Svadhisthana: {
    chakra: 'Svadhisthana',
    signo_primario: 'Escorpião',
    signo_secundario: 'Virgem',
    elemento: 'Água',
    praticas: ['Visualização', 'Meditação', 'Respiração', 'Banhos Ritualísticos'],
  },

  /** Manipura (3º) - Plexo Solar - Fogo - Áries primary, Leão secondary */
  Manipura: {
    chakra: 'Manipura',
    signo_primario: 'Áries',
    signo_secundario: 'Leão',
    elemento: 'Fogo',
    praticas: ['Meditação', 'Respiração', 'Autosugestão', 'Pranayama'],
  },

  /** Anahata (4º) - Cardíaco - Ar - Balança primary, Touro secondary */
  Anahata: {
    chakra: 'Anahata',
    signo_primario: 'Balança',
    signo_secundario: 'Touro',
    elemento: 'Ar',
    praticas: ['Meditação', 'Yoga', 'Gratidão', 'Afirmações'],
  },

  /** Vishuddha (5º) - Laríngeo - Éter - Gémeos primary, Aquário secondary */
  Vishuddha: {
    chakra: 'Vishuddha',
    signo_primario: 'Gémeos',
    signo_secundario: 'Aquário',
    elemento: 'Éter',
    praticas: ['Mantras', 'Journaling', 'Meditação', 'Afirmações'],
  },

  /** Ajna (6º) - Frontal - Ar - Aquário primary, Caranguejo secondary */
  Ajna: {
    chakra: 'Ajna',
    signo_primario: 'Aquário',
    signo_secundario: 'Caranguejo',
    elemento: 'Ar',
    praticas: ['Meditação', 'Pranayama', 'Mantras', 'Caminhada'],
  },

  /** Sahasrara (7º) - Coronário - Éter - Sagitário primary, Peixes secondary */
  Sahasrara: {
    chakra: 'Sahasrara',
    signo_primario: 'Sagitário',
    signo_secundario: 'Peixes',
    elemento: 'Éter',
    praticas: ['Meditação', 'Pranayama', 'Contemplação', 'Autosugestão'],
  },
} as const;

/**
 * Returns the complete chakra-zodiac mapping for a given chakra name.
 *
 * @param chakra - Chakra name (e.g., 'Muladhara', 'Ajna', 'Sahasrara')
 * @returns The ChakraZodiacMapping or null if not found
 */
export function getChakraZodiac(chakra: string): ChakraZodiacMapping | null {
  const normalized = normalizeChakra(chakra);
  if (!normalized) return null;
  return CHAKRA_ZODIAC_MAPPINGS[normalized] ?? null;
}

/**
 * Returns the chakra associated with a given zodiac sign.
 *
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro')
 * @returns The ChakraZodiacMapping for the primary chakra of this sign, or null
 */
export function getZodiacChakra(signo: string): ChakraZodiacMapping | null {
  const normalized = normalizeSigno(signo);

  // First try to find where this sign is primary
  for (const mapping of Object.values(CHAKRA_ZODIAC_MAPPINGS)) {
    if (mapping.signo_primario === normalized) {
      return mapping;
    }
  }
  // Then try secondary
  for (const mapping of Object.values(CHAKRA_ZODIAC_MAPPINGS)) {
    if (mapping.signo_secundario === normalized) {
      return mapping;
    }
  }
  return null;
}

/**
 * Returns all chakra-zodiac mappings.
 *
 * @returns Array of all ChakraZodiacMapping
 */
export function getAllChakraZodiacs(): ChakraZodiacMapping[] {
  return Object.values(CHAKRA_ZODIAC_MAPPINGS);
}

/**
 * Normalizes chakra name to match ChakraName type.
 */
function normalizeChakra(chakra: string): ChakraName | null {
  if (!chakra || typeof chakra !== 'string') return null;

  const normalized = chakra.trim().toLowerCase();

  const chakraMap: Record<string, ChakraName> = {
    muladhara: 'Muladhara',
    root: 'Muladhara',
    raiz: 'Muladhara',
    básico: 'Muladhara',
    '1º': 'Muladhara',
    primeiro: 'Muladhara',
    svadhisthana: 'Svadhisthana',
    sacro: 'Svadhisthana',
    '2º': 'Svadhisthana',
    segundo: 'Svadhisthana',
    manipura: 'Manipura',
    'plexo solar': 'Manipura',
    '3º': 'Manipura',
    terceiro: 'Manipura',
    anahata: 'Anahata',
    cardíaco: 'Anahata',
    '4º': 'Anahata',
    quarto: 'Anahata',
    vishuddha: 'Vishuddha',
    laríngeo: 'Vishuddha',
    '5º': 'Vishuddha',
    quinto: 'Vishuddha',
    ajna: 'Ajna',
    frontal: 'Ajna',
    'terceiro-olho': 'Ajna',
    '6º': 'Ajna',
    sexto: 'Ajna',
    sahasrara: 'Sahasrara',
    coronário: 'Sahasrara',
    '7º': 'Sahasrara',
    sétimo: 'Sahasrara',
  };

  return chakraMap[normalized] ?? null;
}

/**
 * Normalizes sign name for consistent lookup.
 */
function normalizeSigno(signo: string): Signo | null {
  if (!signo || typeof signo !== 'string') return null;

  const normalized = signo.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const signoMap: Record<string, Signo> = {
    aries: 'Áries',
    touro: 'Touro',
    gemeos: 'Gémeos',
    gémeos: 'Gémeos',
    geminis: 'Gémeos',
    caranguejo: 'Caranguejo',
    cancer: 'Caranguejo',
    leao: 'Leão',
    leão: 'Leão',
    virgem: 'Virgem',
    balanca: 'Balança',
    balança: 'Balança',
    escorpiao: 'Escorpião',
    escorpião: 'Escorpião',
    sagitario: 'Sagitário',
    sagitário: 'Sagitário',
    capricornio: 'Capricórnio',
    capricórnio: 'Capricórnio',
    aquario: 'Aquário',
    aquário: 'Aquário',
    peixes: 'Peixes',
    pisces: 'Peixes',
  };

  return signoMap[normalized] ?? null;
}