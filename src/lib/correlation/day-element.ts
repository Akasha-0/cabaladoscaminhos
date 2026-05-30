/**
 * Day-Element Spiritual Correlation Module
 * Maps days of the week to classical elements with chakra connections and spiritual meaning.
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

/** Sanskrit chakra names */
export type ChakraName =
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

/**
 * Represents the correlation between a day of the week and its elemental nature
 */
export interface DayElementMapping {
  /** Day name in Portuguese */
  dia: DiaSemana;
  /** Associated classical element */
  elemento: Elemento;
  /** Primary chakra associated with this day's energy */
  chakra: ChakraName;
  /** Secondary chakra for days with dual nature */
  chakraSecundario: ChakraName | null;
  /** Planetary ruler of the day */
  planeta: string;
  /** Core spiritual meaning and energy signature */
  significado_espiritual: {
    /** Primary spiritual theme */
    tema: string;
    /** Emotional and psychological aspect */
    emocional: string;
    /** Mental and intellectual quality */
    mental: string;
    /** Physical energy manifestation */
    fisico: string;
  };
  /** Affirmations for aligning with the day's energy */
  affirmation: string;
  /** Best activities for the day */
  atividades: string[];
}

/**
 * Complete mapping of the 7 days of the week to their elemental correspondences.
 * Based on the classical tradition of planetary rulership and elemental attributions.
 * Each day carries the vibrational signature of its ruling planet, amplified by
 * its elemental nature and chakra associations from the Cabala dos Caminhos system.
 */
export const DAY_ELEMENT_MAP: Record<DiaSemana, DayElementMapping> = {
  /**
   * Domingo - Sunday - Sol
   * Element: Fogo | Chakra: Anahata (Heart)
   * Theme: Purpose, vitality, spiritual fire
   */
  Domingo: {
    dia: 'Domingo',
    elemento: 'Fogo',
    chakra: 'Anahata',
    chakraSecundario: 'Manipura',
    planeta: 'Sol',
    significado_espiritual: {
      tema: 'Propósito e vitalidade',
      emocional: 'Alegria autêntica, amor próprio, brilho interior',
      mental: 'Clareza de propósito, confiança, expressão criativa',
      fisico: 'Energia revitalizante, saúde cardíaca, metabolismo ativo',
    },
    affirmation: 'Eu expresso minha essência verdadeira com alegria e confiança',
    atividades: ['Rituais solares', 'Meditação ao amanhecer', 'Exercícios energizantes', 'Criação artística'],
  },

  /**
   * Segunda-feira - Monday - Lua
   * Element: Água | Chakra: Svadhisthana (Sacral)
   * Theme: Emotional healing, intuition, nurturing
   */
  'Segunda-feira': {
    dia: 'Segunda-feira',
    elemento: 'Água',
    chakra: 'Svadhisthana',
    chakraSecundario: 'Ajna',
    planeta: 'Lua',
    significado_espiritual: {
      tema: 'Cura emocional e intuição',
      emocional: 'Acolhimento, nutrir a criança interior, compaixão',
      mental: 'Intuição profunda, sabedoria emocional, flexibilidade',
      fisico: 'Hidratação, sono reparador, equilíbrio nervoso',
    },
    affirmation: 'Eu honro minhas emoções e permito que elas fluam livremente',
    atividades: ['Práticas lunares', 'Journaling', 'Meditação water', 'Terapias holísticas'],
  },

  /**
   * Terça-feira - Tuesday - Marte
   * Element: Fogo | Chakra: Manipura (Solar Plexus)
   * Theme: Courage, action, transformation
   */
  'Terça-feira': {
    dia: 'Terça-feira',
    elemento: 'Fogo',
    chakra: 'Manipura',
    chakraSecundario: 'Muladhara',
    planeta: 'Marte',
    significado_espiritual: {
      tema: 'Coragem e ação transformadora',
      emocional: 'Determinação, força de vontade, superação do medo',
      mental: 'Assertividade, foco, capacidade de liderança',
      fisico: 'Energia física, sistema circulatório, vitalidade',
    },
    affirmation: 'Eu tenho força e coragem para transformar minha realidade',
    atividades: ['Exercícios intensos', 'Rituais de proteção', 'Ações decisiveis', 'Assertividade'],
  },

  /**
   * Quarta-feira - Wednesday - Mercúrio
   * Element: Ar | Chakra: Vishuddha (Throat)
   * Theme: Communication, intellect, clarity
   */
  'Quarta-feira': {
    dia: 'Quarta-feira',
    elemento: 'Ar',
    chakra: 'Vishuddha',
    chakraSecundario: 'Ajna',
    planeta: 'Mercúrio',
    significado_espiritual: {
      tema: 'Comunicação e clareza mental',
      emocional: 'Expressão autêntica, adaptabilidade, leveza',
      mental: 'Aprendizado, sabedoria, percepção clara',
      fisico: 'Funções cerebrais, comunicação celular, respiração',
    },
    affirmation: 'Eu expresso minha verdade com clareza e comunicação verdadeira',
    atividades: ['Estudos', 'Escrita criativa', 'Negociações', 'Meditação throat'],
  },

  /**
   * Quinta-feira - Thursday - Júpiter
   * Element: Fogo | Chakra: Anahata (Heart)
   * Theme: Expansion, abundance, faith
   */
  'Quinta-feira': {
    dia: 'Quinta-feira',
    elemento: 'Fogo',
    chakra: 'Anahata',
    chakraSecundario: null,
    planeta: 'Júpiter',
    significado_espiritual: {
      tema: 'Expansão e abundância',
      emocional: 'Otimismo, gratidão, fé no processo da vida',
      mental: 'Visão ampliada, sabedoria filosófica, crença em possibilidades',
      fisico: 'Expansão de energia, sistema hepático, crescimento',
    },
    affirmation: 'Eu abundo em todas as áreas da minha vida e espalho bênçãos',
    atividades: ['Gratidão', 'Oração', 'Estudos espirituais', 'Planejamento de longo prazo'],
  },

  /**
   * Sexta-feira - Friday - Vênus
   * Element: Terra | Chakra: Svadhisthana (Sacral)
   * Theme: Love, beauty, harmony
   */
  'Sexta-feira': {
    dia: 'Sexta-feira',
    elemento: 'Terra',
    chakra: 'Svadhisthana',
    chakraSecundario: 'Anahata',
    planeta: 'Vênus',
    significado_espiritual: {
      tema: 'Amor e harmonia',
      emocional: 'Amor próprio, relações harmoniosas,感性',
      mental: 'Apreciação da beleza, equilíbrio, senso estético refinado',
      fisico: 'Reprodução, sistema urogenital, sensualidade',
    },
    affirmation: 'Eu sou digno de amor e merecedor de todas as belezas da vida',
    atividades: ['Rituais de amor', 'Artes', 'Tempo com amigos', 'Auto-cuidado'],
  },

  /**
   * Sábado - Saturday - Saturno
   * Element: Terra | Chakra: Muladhara (Root)
   * Theme: Discipline, structure, karmic lessons
   */
  Sábado: {
    dia: 'Sábado',
    elemento: 'Terra',
    chakra: 'Muladhara',
    chakraSecundario: null,
    planeta: 'Saturno',
    significado_espiritual: {
      tema: 'Disciplina e lições cármicas',
      emocional: 'Paciência, perseverança, responsabilidade',
      mental: 'Foco em longo prazo, humildade, sabedoria através da experiência',
      fisico: 'Estrutura óssea, dentes, disciplina física',
    },
    affirmation: 'Eu abraço a disciplina com amor e transformo obstáculos em conquistas',
    atividades: ['Trabalho estruturado', 'Limpeza física e espiritual', 'Estudos profundos', 'Rituais de proteção'],
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(DAY_ELEMENT_MAP);
Object.values(DAY_ELEMENT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 days of the week
 */
export const TODOS_DIAS: readonly DiaSemana[] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

/**
 * All 4 classical elements
 */
export const TODOS_ELEMENTOS: readonly Elemento[] = ['Fogo', 'Terra', 'Ar', 'Água'];

/**
 * Normalizes day name for consistent lookup.
 * Handles variations like accents, case, hyphens, and common alternatives.
 */
function normalizarDia(dia: string): DiaSemana | null {
  if (!dia || typeof dia !== 'string') return null;

  const normalized = dia.trim().toLowerCase();

  const mappings: Record<string, DiaSemana> = {
    // Portuguese variations
    domingo: 'Domingo',
    'segunda-feira': 'Segunda-feira',
    'segunda': 'Segunda-feira',
    'terça-feira': 'Terça-feira',
    'terca-feira': 'Terça-feira',
    terça: 'Terça-feira',
    'quarta-feira': 'Quarta-feira',
    quarta: 'Quarta-feira',
    'quinta-feira': 'Quinta-feira',
    quinta: 'Quinta-feira',
    'sexta-feira': 'Sexta-feira',
    sexta: 'Sexta-feira',
    sábado: 'Sábado',
    sabado: 'Sábado',
    // English variations
    sunday: 'Domingo',
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    // Abbreviations
    dom: 'Domingo',
    seg: 'Segunda-feira',
    ter: 'Terça-feira',
    qua: 'Quarta-feira',
    qui: 'Quinta-feira',
    sex: 'Sexta-feira',
    sab: 'Sábado',
  };

  return mappings[normalized] ?? null;
}

/**
 * Get the day-element mapping for a given day name.
 * @param dia - Day name (e.g., 'Domingo', 'Segunda-feira', 'Sunday')
 * @returns DayElementMapping or null if not found
 */
export function getDayElement(dia: string): DayElementMapping | null {
  const normalized = normalizarDia(dia);
  if (!normalized) return null;
  return DAY_ELEMENT_MAP[normalized] ?? null;
}

/**
 * Get the day associated with a given element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns DiaSemana or null if not found
 */
export function getElementDay(elemento: string): DiaSemana | null {
  if (!elemento || typeof elemento !== 'string') return null;

  const normalized = elemento.trim().toLowerCase();

  const elementMap: Record<string, DiaSemana> = {
    fogo: 'Domingo',
    água: 'Quarta-feira',
    agua: 'Quarta-feira',
    ar: 'Quarta-feira',
    terra: 'Sexta-feira',
  };

  const dia = elementMap[normalized];
  return dia ? (DAY_ELEMENT_MAP[dia as DiaSemana] ? (dia as DiaSemana) : null) : null;
}

/**
 * Get all day-element mappings.
 * @returns Array of all correlation mappings
 */
export function getAllDayElements(): DayElementMapping[] {
  return Object.values(DAY_ELEMENT_MAP);
}

/**
 * Get the element for a given day.
 * @param dia - Day name
 * @returns Elemento or null if not found
 */
export function getElementFromDay(dia: string): Elemento | null {
  return getDayElement(dia)?.elemento ?? null;
}

/**
 * Get the chakra for a given day.
 * @param dia - Day name
 * @returns ChakraName or null if not found
 */
export function getChakraFromDay(dia: string): ChakraName | null {
  return getDayElement(dia)?.chakra ?? null;
}

/**
 * Get the affirmation for a given day.
 * @param dia - Day name
 * @returns Affirmation string or null if not found
 */
export function getAffirmationFromDay(dia: string): string | null {
  return getDayElement(dia)?.affirmation ?? null;
}

/**
 * Get the spiritual theme for a given day.
 * @param dia - Day name
 * @returns Spiritual theme or null if not found
 */
export function getSpiritualThemeFromDay(dia: string): string | null {
  return getDayElement(dia)?.significado_espiritual.tema ?? null;
}

/**
 * Get all days associated with a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of DayElementMapping
 */
export function getDaysByElement(elemento: string): DayElementMapping[] {
  if (!elemento || typeof elemento !== 'string') return [];

  const normalized = elemento.trim().toLowerCase();

  return Object.values(DAY_ELEMENT_MAP).filter((mapping) => {
    const elementNormalized = mapping.elemento.toLowerCase();
    return (
      elementNormalized === normalized ||
      (normalized === 'água' && elementNormalized === 'água')
    );
  });
}

/**
 * Get all days of the week.
 * @returns Array of day names
 */
export function getAllDays(): DiaSemana[] {
  return Object.values(DAY_ELEMENT_MAP).map((m) => m.dia);
}

/**
 * Get the planet for a given day.
 * @param dia - Day name
 * @returns Planet name or null if not found
 */
export function getPlanetFromDay(dia: string): string | null {
  return getDayElement(dia)?.planeta ?? null;
}

/**
 * Get activities recommended for a given day.
 * @param dia - Day name
 * @returns Array of activities or null if not found
 */
export function getActivitiesFromDay(dia: string): string[] | null {
  return getDayElement(dia)?.atividades ?? null;
}

/**
 * Default export for convenience
 */
export default {
  getDayElement,
  getElementDay,
  getAllDayElements,
  getElementFromDay,
  getChakraFromDay,
  getAffirmationFromDay,
  getSpiritualThemeFromDay,
  getDaysByElement,
  getAllDays,
  getPlanetFromDay,
  getActivitiesFromDay,
  DAY_ELEMENT_MAP,
  TODOS_DIAS,
  TODOS_ELEMENTOS,
};