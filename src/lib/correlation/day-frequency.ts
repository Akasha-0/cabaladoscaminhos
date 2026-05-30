/**
 * Day-Frequency Spiritual Correlation Module
 * Maps days of the week to Solfeggio frequencies with element connections and healing properties.
 * Source: Cabala dos Caminhos spiritual system
 */

import type { Elemento } from './element-sign';

/** The seven days of the week in Portuguese */
export type DiaSemana =
  | 'Domingo'
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado';

/**
 * Represents the correlation between a day of the week and a Solfeggio frequency
 */
export interface DayFrequencyMapping {
  /** Day name in Portuguese */
  dia: DiaSemana;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Associated classical element */
  elemento: Elemento;
  /** Planetary ruler of the day */
  planeta: string;
  /** Healing and spiritual properties */
  propriedades_healing: {
    fisico: string;
    emocional: string;
    mental_espiritual: string;
    melhor_epoca: string;
  };
}

/**
 * Complete mapping of the 7 days of the week to their Solfeggio frequency correspondences.
 * Based on elemental correspondences, planetary rulership, and spiritual properties from
 * the Cabala dos Caminhos system. Each day carries the vibrational signature of its
 * corresponding frequency, amplified by its ruling planet and elemental nature.
 */
export const DAY_FREQUENCY_MAP: Record<DiaSemana, DayFrequencyMapping> = {
  /** Sol - Fogo - 528Hz - vitality and purpose */
  Domingo: {
    dia: 'Domingo',
    frequencia: 528,
    elemento: 'Fogo',
    planeta: 'Sol',
    propriedades_healing: {
      fisico: 'Estimula vitalidade, fortalece sistema cardíaco e metabolismo',
      emocional: 'Transforma orgulho em amor próprio genuíno, promove alegria autêntica',
      mental_espiritual: 'Ativa propósito de vida, brilho pessoal e expressão criativa',
      melhor_epoca: 'Dias de recarga energética, início de projetos importantes, celebrações',
    },
  },
  /** Lua - Água - 417Hz - emotional healing and intuition */
  'Segunda-feira': {
    dia: 'Segunda-feira',
    frequencia: 417,
    elemento: 'Água',
    planeta: 'Lua',
    propriedades_healing: {
      fisico: 'Hidrata tecidos, melhora sono e equilibra sistema nervoso',
      emocional: 'Libera traumas emocionais, acolhe a criança interior e nutre a alma',
      mental_espiritual: 'Desperta intuição profunda, facilita adaptação e flexibilidade emocional',
      melhor_epoca: 'Períodos de introspecção, cura emocional, práticas lunares e meditação',
    },
  },
  /** Marte - Fogo - 741Hz - courage and transformation */
  'Terça-feira': {
    dia: 'Terça-feira',
    frequencia: 741,
    elemento: 'Fogo',
    planeta: 'Marte',
    propriedades_healing: {
      fisico: 'Estimula sistema circulatório, aumenta energia vital e força física',
      emocional: 'Transforma raiva em ação construtiva, promove coragem e determinação',
      mental_espiritual: 'Ativa WILL POWER e capacidade de romper barreiras mentais',
      melhor_epoca: 'Dias de ação decisiva, início de projetos勇敢, rituais de proteção',
    },
  },
  /** Mercúrio - Ar - 852Hz - communication and intellect */
  'Quarta-feira': {
    dia: 'Quarta-feira',
    frequencia: 852,
    elemento: 'Ar',
    planeta: 'Mercúrio',
    propriedades_healing: {
      fisico: 'Melhora funções cerebrais, memória e capacidade de aprendizado',
      emocional: 'Promove clareza mental, comunicação assertiva e adaptabilidade',
      mental_espiritual: 'Ativa sabedoria interior, percepção clara e expressão autêntica',
      melhor_epoca: 'Dias de estudos, negociações, busca pela verdade e comunicação espiritual',
    },
  },
  /** Júpiter - Fogo - 528Hz - expansion and abundance */
  'Quinta-feira': {
    dia: 'Quinta-feira',
    frequencia: 528,
    elemento: 'Fogo',
    planeta: 'Júpiter',
    propriedades_healing: {
      fisico: 'Fortalece fígado, sistema digestivo e expande energia vital',
      emocional: 'Promove otimismo, gratidão e expansão da consciência emocional',
      mental_espiritual: 'Ativa sabedoria superior, filosófica e busca pelo conhecimento divino',
      melhor_epoca: 'Dias de expansão de projetos, rituais de fartura e busca espiritual',
    },
  },
  /** Vênus - Terra - 396Hz - love and grounding */
  'Sexta-feira': {
    dia: 'Sexta-feira',
    frequencia: 396,
    elemento: 'Terra',
    planeta: 'Vênus',
    propriedades_healing: {
      fisico: 'Fortalece rins, sistema linfático e promove relaxamento profundo',
      emocional: 'Liberta apegos e medos de perda, promove harmonia em relacionamentos',
      mental_espiritual: 'Cultiva paz interior, gratidão e conexão com o divino',
      melhor_epoca: 'Dias de purificação absoluta, alinhamento espiritual e rituais de paz',
    },
  },
  /** Saturno - Terra - 639Hz - structure and wisdom */
  Sábado: {
    dia: 'Sábado',
    frequencia: 639,
    elemento: 'Água',
    planeta: 'Saturno',
    propriedades_healing: {
      fisico: 'Fortalece ossos, articulações e estrutura física do corpo',
      emocional: 'Promove inteligência emocional, maturidade e amor incondicional',
      mental_espiritual: 'Desperta sabedoria profunda, fé e conexão com a eternidade',
      melhor_epoca: 'Dias de cura emocional, rituais de fertilidade e trabalho com ancestrais',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(DAY_FREQUENCY_MAP);
Object.values(DAY_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies
 */
export const SOLFEGGIO_FREQUENCIES_DAY = [528, 417, 741, 852, 528, 396, 639] as const;

/**
 * All 7 days of the week
 */
export const TODOS_DIAS: readonly DiaSemana[] = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

/**
 * Normalizes day name for consistent lookup.
 * Handles variations like accents, case, hyphens, and common alternatives.
 */
function normalizarDia(dia: string): DiaSemana | null {
  if (!dia || typeof dia !== 'string') return null;

  const normalized = dia
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritics
    .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]/g, '') // Remove superscripts
    .replace(/[-–— ]/g, '') // Remove hyphens, dashes, spaces
    .toLowerCase()
    .trim();

  const dayMap: Record<string, DiaSemana> = {
    domingo: 'Domingo',
    segundafeira: 'Segunda-feira',
    segunda: 'Segunda-feira',
    tercafeira: 'Terça-feira',
    terca: 'Terça-feira',
    quartafeira: 'Quarta-feira',
    quarta: 'Quarta-feira',
    quintafeira: 'Quinta-feira',
    quinta: 'Quinta-feira',
    sextafeira: 'Sexta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    // Common variations
    dom: 'Domingo',
    seg: 'Segunda-feira',
    ter: 'Terça-feira',
    qua: 'Quarta-feira',
    qui: 'Quinta-feira',
    sex: 'Sexta-feira',
    sab: 'Sábado',
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };
  return dayMap[normalized] ?? null;
}

/**
 * Get the day-frequency mapping for a given day name.
 * @param dia - Day name (e.g., 'Domingo', 'Segunda-feira')
 * @returns DayFrequencyMapping or null if not found
 */
export function getDayFrequency(dia: string): DayFrequencyMapping | null {
  const normalized = normalizarDia(dia);
  if (!normalized) return null;
  return DAY_FREQUENCY_MAP[normalized] ?? null;
}

/**
 * Get the day associated with a given frequency.
 * @param frequencia - Solfeggio frequency in Hz
 * @returns DiaSemana or null if not found
 */
export function getFrequencyDay(frequencia: number): DiaSemana | null {
  for (const [day, mapping] of Object.entries(DAY_FREQUENCY_MAP)) {
    if (mapping.frequencia === frequencia) {
      return day as DiaSemana;
    }
  }
  return null;
}

/**
 * Get the frequency for a given day name.
 * @param dia - Day name
 * @returns Frequency in Hz or null if not found
 */
export function getFrequenciaFromDia(dia: string): number | null {
  return getDayFrequency(dia)?.frequencia ?? null;
}

/**
 * Get all day-frequency mappings.
 * @returns Array of all correlation mappings
 */
export function getAllDayFrequencies(): DayFrequencyMapping[] {
  return Object.values(DAY_FREQUENCY_MAP);
}

/**
 * Get the element for a given day.
 * @param dia - Day name
 * @returns Elemento or null if not found
 */
export function getElementFromDia(dia: string): Elemento | null {
  return getDayFrequency(dia)?.elemento ?? null;
}

/**
 * Get the healing properties for a given day.
 * @param dia - Day name
 * @returns Healing properties or null if not found
 */
export function getHealingFromDia(dia: string): DayFrequencyMapping['propriedades_healing'] | null {
  return getDayFrequency(dia)?.propriedades_healing ?? null;
}

/**
 * Get all days associated with a specific frequency.
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of DayFrequencyMapping or empty array if not found
 */
export function getDaysByFrequencia(frequencia: number): DayFrequencyMapping[] {
  return Object.values(DAY_FREQUENCY_MAP).filter((m) => m.frequencia === frequencia);
}

/**
 * Get the best epoch/time for healing practice on a given day.
 * @param dia - Day name
 * @returns Best epoch string or null if not found
 */
export function getBestEpochFromDia(dia: string): string | null {
  return getDayFrequency(dia)?.propriedades_healing.melhor_epoca ?? null;
}

/**
 * Get all days mapped to a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of DayFrequencyMapping
 */
export function getDaysByElement(elemento: string): DayFrequencyMapping[] {
  const normalizedElement = elemento.charAt(0).toUpperCase() + elemento.slice(1).toLowerCase();
  return Object.values(DAY_FREQUENCY_MAP).filter((m) => m.elemento === normalizedElement);
}

/**
 * Get the planet for a given day.
 * @param dia - Day name
 * @returns Planet name or null if not found
 */
export function getPlanetFromDia(dia: string): string | null {
  return getDayFrequency(dia)?.planeta ?? null;
}

/**
 * Get all days of the week.
 * @returns Array of day names
 */
export function getAllDays(): DiaSemana[] {
  return Object.values(DAY_FREQUENCY_MAP).map((m) => m.dia);
}

/**
 * Get day-frequency mapping by day name (case-insensitive).
 * @param dia - Day name
 * @returns DayFrequencyMapping or null if not found
 */
export function getDayFrequencyByName(dia: string): DayFrequencyMapping | null {
  return getDayFrequency(dia);
}

/**
 * Default export for convenience
 */
export default {
  getDayFrequency,
  getFrequencyDay,
  getAllDayFrequencies,
  getFrequenciaFromDia,
  getElementFromDia,
  getHealingFromDia,
  getDaysByFrequencia,
  getBestEpochFromDia,
  getDaysByElement,
  getPlanetFromDia,
  getAllDays,
  getDayFrequencyByName,
  DAY_FREQUENCY_MAP,
  SOLFEGGIO_FREQUENCIES_DAY,
  TODOS_DIAS,
};