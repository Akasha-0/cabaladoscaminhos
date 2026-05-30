/**
 * Zodiac-Chakra Spiritual Correlation
 * Maps each zodiac sign to its primary and secondary chakra, elemental alignment, and spiritual practices.
 * Based on the Cabala dos Caminhos system integrating Western astrology with Eastern chakra wisdom.
 */

import type { Elemento } from './element-sign';
import type { ChakraName } from './chakra-element';

/** The twelve zodiac signs */
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

/**
 * Spiritual practices associated with zodiac-chakra work
 */
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

/**
 * Complete zodiac-to-chakra mapping with spiritual attributes.
 * Each sign influences specific chakras based on its elemental nature
 * and astrological archetype.
 */
export interface ZodiacChakraMapping {
  /** Zodiac sign name */
  signo: Signo;
  /** Primary chakra influenced by this sign */
  chakra_primario: ChakraName;
  /** Secondary chakra with lesser influence */
  chakra_secundario: ChakraName;
  /** Elemental alignment of the sign */
  elemento: Elemento;
  /** Recommended spiritual practices for this sign-chakra combination */
  praticas: PraticaEspiritual[];
}

/**
 * Complete mapping of all 12 zodiac signs with their chakra correspondences.
 * Based on classical Western astrology correlated with Hindu chakra system
 * through the Cabala dos Caminhos framework.
 */
export const ZODIAC_CHAKRA_MAPPINGS: Readonly<Record<Signo, ZodiacChakraMapping>> = {
  /** Áries - Fogo - Plexo Solar primary (willpower, identity) */
  Áries: {
    signo: 'Áries',
    chakra_primario: 'Manipura',
    chakra_secundario: 'Muladhara',
    elemento: 'Fogo',
    praticas: ['Meditação', 'Respiração', 'Autosugestão', 'Pranayama'],
  },

  /** Touro - Terra - Cardíaco primary (love, stability) and Básico (grounding) */
  Touro: {
    signo: 'Touro',
    chakra_primario: 'Anahata',
    chakra_secundario: 'Muladhara',
    elemento: 'Terra',
    praticas: ['Gratidão', 'Yoga', 'Contemplação', 'Banhos Ritualísticos'],
  },

  /** Gémeos - Ar - Laríngeo primary (communication) and Frontal (intuition) */
  Gémeos: {
    signo: 'Gémeos',
    chakra_primario: 'Vishuddha',
    chakra_secundario: 'Ajna',
    elemento: 'Ar',
    praticas: ['Mantras', 'Journaling', 'Meditação', 'Afirmações'],
  },

  /** Caranguejo - Água - Frontal primary (intuition, emotions) and Sacro (creativity) */
  Caranguejo: {
    signo: 'Caranguejo',
    chakra_primario: 'Ajna',
    chakra_secundario: 'Svadhisthana',
    elemento: 'Água',
    praticas: ['Meditação', 'Visualização', 'Caminhada', 'Contemplação'],
  },

  /** Leão - Fogo - Plexo Solar primary (ego, vitality) and Cardíaco (love, creativity) */
  Leão: {
    signo: 'Leão',
    chakra_primario: 'Manipura',
    chakra_secundario: 'Anahata',
    elemento: 'Fogo',
    praticas: ['Autosugestão', 'Yoga', 'Gratidão', 'Pranayama'],
  },

  /** Virgem - Terra - Sacro primary (purity, service) and Plexo Solar (discrimination) */
  Virgem: {
    signo: 'Virgem',
    chakra_primario: 'Svadhisthana',
    chakra_secundario: 'Manipura',
    elemento: 'Terra',
    praticas: ['Journaling', 'Yoga', 'Contemplação', 'Defumação'],
  },

  /** Balança - Ar - Cardíaco primary (relationships, harmony) and Frontal (balance) */
  Balança: {
    signo: 'Balança',
    chakra_primario: 'Anahata',
    chakra_secundario: 'Ajna',
    elemento: 'Ar',
    praticas: ['Meditação', 'Yoga', 'Gratidão', 'Afirmações'],
  },

  /** Escorpião - Água - Sacro primary (transformation, intensity) and Básico (regeneration) */
  Escorpião: {
    signo: 'Escorpião',
    chakra_primario: 'Svadhisthana',
    chakra_secundario: 'Muladhara',
    elemento: 'Água',
    praticas: ['Visualização', 'Meditação', 'Respiração', 'Banhos Ritualísticos'],
  },

  /** Sagitário - Fogo - Coronário primary (wisdom, expansion) and Plexo Solar (purpose) */
  Sagitário: {
    signo: 'Sagitário',
    chakra_primario: 'Sahasrara',
    chakra_secundario: 'Manipura',
    elemento: 'Fogo',
    praticas: ['Meditação', 'Pranayama', 'Contemplação', 'Autosugestão'],
  },

  /** Capricórnio - Terra - Básico primary (ambition, structure) and Cardíaco (mastery) */
  Capricórnio: {
    signo: 'Capricórnio',
    chakra_primario: 'Muladhara',
    chakra_secundario: 'Anahata',
    elemento: 'Terra',
    praticas: ['Yoga', 'Meditação', 'Autosugestão', 'Gratidão'],
  },

  /** Aquário - Ar - Frontal primary (individuality, enlightenment) and Laríngeo (expression) */
  Aquário: {
    signo: 'Aquário',
    chakra_primario: 'Ajna',
    chakra_secundario: 'Vishuddha',
    elemento: 'Ar',
    praticas: ['Meditação', 'Pranayama', 'Mantras', 'Caminhada'],
  },

  /** Peixes - Água - Coronário primary (compassion, unity) and Frontal (dreams) */
  Peixes: {
    signo: 'Peixes',
    chakra_primario: 'Sahasrara',
    chakra_secundario: 'Ajna',
    elemento: 'Água',
    praticas: ['Meditação', 'Visualização', 'Contemplação', 'Gratidão'],
  },
} as const;

/**
 * Returns the complete zodiac-chakra mapping for a given sign name.
 *
 * @param signo - The zodiac sign name (case-insensitive, accent-tolerant)
 * @returns The ZodiacChakraMapping or null if sign not found
 */
export function getZodiacChakra(signo: string): ZodiacChakraMapping | null {
  const normalizado = normalizarSigno(signo);
  if (normalizado && normalizado in ZODIAC_CHAKRA_MAPPINGS) {
    return ZODIAC_CHAKRA_MAPPINGS[normalizado as Signo] ?? null;
  }
  return null;
}

/**
 * Returns the zodiac sign associated with a given chakra.
 * Since multiple signs can influence the same chakra, returns the most significant one.
 *
 * @param chakra - The chakra name (case-insensitive)
 * @returns The primary sign for this chakra or null if not found
 */
export function getChakraZodiac(chakra: string): ZodiacChakraMapping | null {
  const normalizado = normalizarChakra(chakra);
  if (!normalizado) return null;

  for (const mapping of Object.values(ZODIAC_CHAKRA_MAPPINGS)) {
    if (mapping.chakra_primario === normalizado) {
      return mapping;
    }
  }
  return null;
}

/**
 * Returns all zodiac-chakra mappings for a given chakra.
 * Unlike getChakraZodiac, this returns ALL signs that have the chakra
 * as primary or secondary.
 *
 * @param chakra - The chakra name (case-insensitive)
 * @returns Array of all ZodiacChakraMapping with this chakra
 */
export function getChakraZodiacs(chakra: string): ZodiacChakraMapping[] {
  const normalizado = normalizarChakra(chakra);
  if (!normalizado) return [];

  return Object.values(ZODIAC_CHAKRA_MAPPINGS).filter(
    (mapping) =>
      mapping.chakra_primario === normalizado ||
      mapping.chakra_secundario === normalizado
  );
}

/**
 * Returns all zodiac-chakra mappings.
 *
 * @returns Array of all ZodiacChakraMapping
 */
export function getAllZodiacChakras(): ZodiacChakraMapping[] {
  return Object.values(ZODIAC_CHAKRA_MAPPINGS);
}

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common aliases.
 */
function normalizarSigno(signo: string): Signo | null {
  const mapa: Record<string, Signo> = {
    'aries': 'Áries',
    'touro': 'Touro',
    'gemeos': 'Gémeos',
    'gémeos': 'Gémeos',
    'caranguejo': 'Caranguejo',
    'leão': 'Leão',
    'leao': 'Leão',
    'virgem': 'Virgem',
    'balança': 'Balança',
    'balanca': 'Balança',
    'escorpião': 'Escorpião',
    'escorpiao': 'Escorpião',
    'sagitário': 'Sagitário',
    'sagitario': 'Sagitário',
    'capricórnio': 'Capricórnio',
    'capricornio': 'Capricórnio',
    'aquário': 'Aquário',
    'aquario': 'Aquário',
    'peixes': 'Peixes',
  };

  const normalizado = signo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  return mapa[normalizado] ?? null;
}

/**
 * Normalizes chakra name to match ChakraName type.
 */
function normalizarChakra(chakra: string): ChakraName | null {
  const mapa: Record<string, ChakraName> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    'coronário': 'Sahasrara',
    'coronario': 'Sahasrara',
    'frontal': 'Ajna',
    'terceiro': 'Manipura',
    'laríngeo': 'Vishuddha',
    'laringeo': 'Vishuddha',
    'cardíaco': 'Anahata',
    'cardiaco': 'Anahata',
    'sacro': 'Svadhisthana',
    'básico': 'Muladhara',
    'basico': 'Muladhara',
  };

  const normalizado = chakra
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  return mapa[normalizado] ?? null;
}
