/**
 * Day-Chakra Spiritual Correlation Module
 * Maps days of the week to their corresponding chakras and spiritual significance
 * Based on Cabala dos Caminhos vibrational healing traditions (IDEIA.md)
 */

import type { ChakraName } from './chakra-element';

export type DayNamePt = 
  | 'Domingo'
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado';

export type DayNameEn = 
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export interface DayChakraMapping {
  /** Day name in Portuguese */
  dia: DayNamePt;
  /** Day name in English */
  dia_en: DayNameEn;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Chakra name (Sanskrit) */
  chakra: ChakraName;
  /** Chakra number and position label */
  chakra_numero: string;
  /** Associated color */
  cor: string;
  /** Spiritual meaning and mystical significance */
  significado_espiritual: string;
  /** Recommended spiritual practices */
  praticas_rituais: string[];
  /** Keywords for the day's vibration */
  palavras_chave: string[];
}

/** Day-to-Chakra mapping based on Cabala dos Caminhos vibrational traditions */
export const DAY_CHAKRA_MAP: Record<DayNamePt, DayChakraMapping> = {
  'Domingo': {
    dia: 'Domingo',
    dia_en: 'Sunday',
    indice: 0,
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    cor: 'Laranja',
    significado_espiritual: 'Domingo associado à garganta - expressão da verdade e comunicação sagrada. Energia solar para expresar mensagens divinas através da voz e da criatividade.',
    praticas_rituais: [
      'Canto de mantras e cânticos sagrados',
      'Escrita criativa e expressão artística',
      'Incienso de sálvia para purificação vocal',
      'Exercícios de respiração pranayama',
      'Rituais de comunicação com guias',
      'Jóias de fogo para amplificar expressão',
    ],
    palavras_chave: ['verdade', 'expressão', 'comunicação', 'criatividade', 'autenticidade', 'sagrado'],
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    dia_en: 'Monday',
    indice: 1,
    chakra: 'Muladhara',
    chakra_numero: '1º Básico (Raiz)',
    cor: 'Vermelho',
    significado_espiritual: 'Segunda-feira associada ao básico - aterramento, segurança existencial e ancestralidade. Energia lunar para conexão com a terra e os ancestrais.',
    praticas_rituais: [
      'Meditação de aterramento visualizing raízes',
      'Banhos de arruda e assa-peixe para ancoramento',
      'Rituais de limpeza kármica',
      'Conexão com ancestrais e spirits da terra',
      'Decocção de canela-de-velho para lavar pés',
      'Práticas de encerramento de ciclos',
    ],
    palavras_chave: ['aterramento', 'segurança', 'ancestralidade', 'estabilidade', 'raízes', 'presente'],
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    dia_en: 'Tuesday',
    indice: 2,
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacral (Esplênico)',
    cor: 'Laranja',
    significado_espiritual: 'Terça-feira associada ao sacral - criatividade, transformação e força vital. Energia marciana para ação decisiva e transmutação de energia estancada.',
    praticas_rituais: [
      'Pranayama (respiração intensa)',
      'Rituais de transmutação criativa',
      'Limpeza de traumas e bloqueios emocionais',
      'Exercícios físicos ritualísticos',
      'Trabalho com elementos de fogo e água',
      'Práticas de тантрическая energia',
    ],
    palavras_chave: ['criatividade', 'transformação', 'força vital', 'ação', 'transmutação', 'fluidez'],
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    dia_en: 'Wednesday',
    indice: 3,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    cor: 'Amarelo',
    significado_espiritual: 'Quarta-feira associada ao plexo solar - poder pessoal, clareza mental e abertura de caminhos. Energia mercurial para comunicação verdadeira e justiça espiritual.',
    praticas_rituais: [
      'Meditação para clareza mental',
      'Práticas de comunicação verdadeira',
      'Estudos espirituais e filosóficos',
      'Trabalho com elementais e guias',
      'Rituais de abertura de caminhos',
      'Visualização solar para poder pessoal',
    ],
    palavras_chave: ['poder pessoal', 'clareza', 'comunicação', 'justiça', 'intenção', 'transformação'],
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    dia_en: 'Thursday',
    indice: 4,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco (Coração)',
    cor: 'Verde',
    significado_espiritual: 'Quinta-feira associada ao cardíaco - amor incondicional, compaixão e conexão universal. Energia jupiteriana para expansão da consciência e sabedoria.',
    praticas_rituais: [
      'Meditação deharmonia em relaciones',
      'Práticas de conexão com seres queridos',
      'Ejercicios de expansão de consciencia',
      'Afirmações de sabedoria y tolerancia',
      'Trabalho com relações familiares y de pareja',
      'Abertura do coração para amar sem medo',
    ],
    palavras_chave: ['amor', 'compaixão', 'harmonia', 'expansão', 'sabedoria', ' Conexão'],
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    dia_en: 'Friday',
    indice: 5,
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário (Coroa)',
    cor: 'Roxo / Branco',
    significado_espiritual: 'Sexta-feira associada à coroa - iluminação espiritual, conexão com o divino e trascendência. Energia venusiana para despertar da consciência superior.',
    praticas_rituais: [
      'Meditação de terceiro olho',
      'Práticas de conexão espiritual profunda',
      'Ejercicios de recebimento de guía interior',
      'Trabalho com a coroa para acessar sabedoria superior',
      'Rituais de desapego e sabedoria',
      'Ouvir 963 Hz em meditações de trascendencia',
    ],
    palavras_chave: ['iluminação', 'divino', 'sabedoria', 'transcendência', 'desapego', 'consciência'],
  },
  'Sábado': {
    dia: 'Sábado',
    dia_en: 'Saturday',
    indice: 6,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco (Coração)',
    cor: 'Verde / Rosa',
    significado_espiritual: 'Sábado associado ao cardíaco - amor unconditional e conexão espiritual profunda. Energia saturnina para disciplina sagrada e búsqueda de sabedoria através do coração.',
    praticas_rituais: [
      'Meditação de开门 do coração',
      'Práticas de compaixão radical',
      'Rituais de cura para relationships',
      'Trabalho com элементы земли e ar',
      'Ejercicios de perdão y aceptación',
      'Conexão com mestres ascensionados',
    ],
    palavras_chave: ['coração', 'compaixão', 'conexão', ' disciplina', 'sabedoria', 'amor'],
  },
};

/**
 * Get chakra correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Domingo', 'Segunda-feira')
 * @returns DayChakraMapping or undefined if day not found
 */
export function getDayChakra(dia: string): DayChakraMapping | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt];
}

/**
 * Get the chakra name for a specific day
 * @param dia - Day name in Portuguese
 * @returns Chakra name or undefined if day not found
 */
export function getChakraDay(dia: string): ChakraName | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt]?.chakra;
}

/**
 * Get all days of the week
 * @returns Array of day names in Portuguese
 */
export function getAllDays(): DayNamePt[] {
  return Object.keys(DAY_CHAKRA_MAP) as DayNamePt[];
}

/**
 * Get all day-chakra correlations
 * @returns Array of all DayChakraMapping
 */
export function getAllDayChakras(): DayChakraMapping[] {
  return Object.values(DAY_CHAKRA_MAP);
}

/**
 * Get chakra number for a specific day
 * @param dia - Day name in Portuguese
 * @returns Chakra number label or undefined if day not found
 */
export function getChakraNumberDay(dia: string): string | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt]?.chakra_numero;
}

/**
 * Get color for a specific day
 * @param dia - Day name in Portuguese
 * @returns Color or undefined if day not found
 */
export function getColorByDay(dia: string): string | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt]?.cor;
}

/**
 * Get spiritual meaning for a specific day
 * @param dia - Day name in Portuguese
 * @returns Spiritual meaning or undefined if day not found
 */
export function getDaySpiritualMeaning(dia: string): string | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt]?.significado_espiritual;
}

/**
 * Get ritual practices for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of ritual practices or undefined if day not found
 */
export function getDayRitualPractices(dia: string): string[] | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt]?.praticas_rituais;
}

/**
 * Get keywords for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of keywords or undefined if day not found
 */
export function getDayKeywords(dia: string): string[] | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt]?.palavras_chave;
}

/**
 * Get day index (0-6) for a day name
 * @param dia - Day name in Portuguese
 * @returns Day index or undefined if day not found
 */
export function getDayIndex(dia: string): number | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt]?.indice;
}

/**
 * Get English day name for a Portuguese day name
 * @param dia - Day name in Portuguese
 * @returns English day name or undefined if day not found
 */
export function getDayEnglishName(dia: string): string | undefined {
  return DAY_CHAKRA_MAP[dia as DayNamePt]?.dia_en;
}

/**
 * Get days associated with a specific chakra
 * @param chakra - Chakra name (Sanskrit or Portuguese number format)
 * @returns Array of day names
 */
export function getDaysForChakra(chakra: string): DayNamePt[] {
  const normalizedChakra = normalizeChakraName(chakra);
  return getAllDayChakras()
    .filter(m => m.chakra === normalizedChakra)
    .map(m => m.dia);
}

/**
 * Normalize chakra name to match ChakraName type
 */
function normalizeChakraName(chakra: string): ChakraName | null {
  const normalized = chakra.trim().toLowerCase();
  
  const chakraMap: Record<string, ChakraName> = {
    'muladhara': 'Muladhara',
    '1º básico': 'Muladhara',
    '1º básico (raiz)': 'Muladhara',
    'raiz': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    '2º sacral': 'Svadhisthana',
    '2º sacral (esplênico)': 'Svadhisthana',
    'sacral': 'Svadhisthana',
    'manipura': 'Manipura',
    '3º plexo solar': 'Manipura',
    'plexo solar': 'Manipura',
    'anahata': 'Anahata',
    '4º cardíaco': 'Anahata',
    '4º cardíaco (coração)': 'Anahata',
    'cardíaco': 'Anahata',
    'coração': 'Anahata',
    'vishuddha': 'Vishuddha',
    '5º laríngeo': 'Vishuddha',
    'laríngeo': 'Vishuddha',
    'garganta': 'Vishuddha',
    'ajna': 'Ajna',
    '6º frontal': 'Ajna',
    'frontal': 'Ajna',
    'terceiro olho': 'Ajna',
    'sahasrara': 'Sahasrara',
    '7º coronário': 'Sahasrara',
    '7º coronário (coroa)': 'Sahasrara',
    'coronário': 'Sahasrara',
    'coroa': 'Sahasrara',
    'corona': 'Sahasrara',
  };

  return chakraMap[normalized] || null;
}

// Default export with main functions
