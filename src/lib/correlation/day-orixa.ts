/**
 * Day-Orixá Correlation Module
 * Maps days of the week to Orixás with their elemental, spiritual, and mystical correspondences
 * Based on Afro-Brazilian spiritual traditions and Cabala dos Caminhos framework
 */

/** Supported elements in the tradition */
export type Element = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

/**
 * Day-Orixá correlation mapping
 */
export interface DayOrixa {
  /** Day name in Portuguese */
  dia: string;
  /** Primary associated Orixá */
  orixa_principal: string;
  /** Secondary associated Orixá (may be null) */
  orixa_secundario: string | null;
  /** Associated element */
  elemento: Element;
  /** Color correspondence */
  cor: string;
  /** Sacred number for the day/Orixá */
  numero_sagrado: number;
  /** Associated chakra */
  chakra: string;
  /** Planetary ruler */
  planeta: string;
  /** Spiritual mystery/mysticism description */
  mystere: string;
}

/** Day-to-Orixá mapping based on Afro-Brazilian spiritual traditions */
const DAY_ORIXA_DATA: DayOrixa[] = [
  {
    dia: 'Segunda-feira',
    orixa_principal: 'Omolu',
    orixa_secundario: 'Exu',
    elemento: 'terra',
    cor: 'Roxo / Marrom',
    numero_sagrado: 13,
    chakra: '1º Raiz',
    planeta: 'Lua',
    mystere: 'Omolu, senhor das doenças e curas, governa a Segunda-feira com Exu como guardião das encruzilhadas. Dia propício para trabalho de cura, limpeza de energias densas e proteção contra mau-olhado. A terra firme oferece estabilidade para processos de transformação interior.',
  },
  {
    dia: 'Terça-feira',
    orixa_principal: 'Iansã',
    orixa_secundario: 'Ogum',
    elemento: 'fogo',
    cor: 'Vermelho / Laranja',
    numero_sagrado: 7,
    chakra: '3º Plexo Solar',
    planeta: 'Marte',
    mystere: 'Iansã, guerreira dos ventos e tempestades, domina a Terça-feira ao lado de Ogum. Dia de grande energia para ação, conquista de objetivos e trabalho de proteção. O fogo da guerra sagrada queima obstáculos e abre caminhos com coragem e determinação.',
  },
  {
    dia: 'Quarta-feira',
    orixa_principal: 'Xangô',
    orixa_secundario: 'Iansã',
    elemento: 'fogo',
    cor: 'Amarelo',
    numero_sagrado: 6,
    chakra: '5º Laríngeo',
    planeta: 'Mercúrio',
    mystere: 'Xangô, rei da justiça e dos raios, governa a Quarta-feira em aliança com Iansã. Dia de equilíbrio entre razão e emoção, ideal para decisões importantes, julgamentos e manifestações de poder pessoal. A energia Mercuriana favorece comunicação e estratégia.',
  },
  {
    dia: 'Quinta-feira',
    orixa_principal: 'Oxóssi',
    orixa_secundario: null,
    elemento: 'ar',
    cor: 'Verde',
    numero_sagrado: 9,
    chakra: '4º Cardíaco',
    planeta: 'Júpiter',
    mystere: 'Oxóssi, caçador celeste e senhor das matas, reigns supreme on Thursday. Day of abundance, prosperity magic, and hunting of dreams and goals. Jupiterian expansion opens doors to success, wisdom, and spiritual knowledge. The green of vegetation symbolizes growth in all endeavors.',
  },
  {
    dia: 'Sexta-feira',
    orixa_principal: 'Oxalá',
    orixa_secundario: null,
    elemento: 'ar',
    cor: 'Branco / Violeta',
    numero_sagrado: 8,
    chakra: '6º Frontal',
    planeta: 'Vênus',
    mystere: 'Oxalá, creator Father and lord of all Orixás, blesses Friday with his peaceful energy. Day for reconciliation, healing, mercy, and spiritual elevation. Venusian harmony brings love, beauty, and artistic inspiration. The white light purifies and elevates consciousness to higher realms.',
  },
  {
    dia: 'Sábado',
    orixa_principal: 'Oxum',
    orixa_secundario: 'Iemanjá',
    elemento: 'água',
    cor: 'Rosa / Azul Escuro',
    numero_sagrado: 5,
    chakra: '2º Sacro',
    planeta: 'Saturno',
    mystere: 'Oxum, the precious honey and Iemanjá, the great mother of waters, rule Saturday together. Day of emotional depth, fertility, beauty rituals, and connection to the divine feminine. Saturnian discipline meets oceanic fluidity for transformation through love and wisdom.',
  },
  {
    dia: 'Domingo',
    orixa_principal: 'Xangô',
    orixa_secundario: null,
    elemento: 'fogo',
    cor: 'Amarelo / Dourado',
    numero_sagrado: 6,
    chakra: '3º Plexo Solar',
    planeta: 'Sol',
    mystere: 'Xangô Solar, the majestic king amplified by the Sun, shines on Sunday with golden power. Day of vitality, leadership, personal power, and manifestation through willpower. Solar energy activates creativity, confidence, and the fire of purpose in all endeavors.',
  },
];

/** Create lookup map by day name */
const DAY_ORIXA_MAP: Record<string, DayOrixa> = Object.fromEntries(
  DAY_ORIXA_DATA.map((d) => [d.dia, d])
);

/**
 * Get Orixá correlation for a specific day of the week
 * @param dia - Day name in Portuguese (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns DayOrixa mapping or undefined if day not found
 */
export function getDayOrixa(dia: string): DayOrixa | undefined {
  return DAY_ORIXA_MAP[dia];
}

/**
 * Get all day-Orixá mappings as an object keyed by day name
 * @returns Record mapping day names to DayOrixa objects
 */
export function getOrixaDay(): Record<string, DayOrixa> {
  return { ...DAY_ORIXA_MAP };
}

/**
 * Get all days of the week
 * @returns Array of day names in Portuguese
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_ORIXA_MAP);
}

/**
 * Get all day-Orixá mappings as an array
 * @returns Array of all DayOrixa objects
 */
export function getAllDayOrixas(): DayOrixa[] {
  return [...DAY_ORIXA_DATA];
}

/**
 * Get Orixás associated with a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of Orixá names for that day
 */
export function getOrixasForDay(dia: string): string[] {
  const mapping = DAY_ORIXA_MAP[dia];
  if (!mapping) return [];
  return [mapping.orixa_principal, mapping.orixa_secundario].filter(
    (o): o is string => o !== null
  );
}

/**
 * Get days associated with a specific Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Array of day names where this Orixá appears
 */
export function getDaysByOrixa(orixa: string): string[] {
  const orixaLower = orixa.toLowerCase();
  return DAY_ORIXA_DATA.filter(
    (d) =>
      d.orixa_principal.toLowerCase() === orixaLower ||
      d.orixa_secundario?.toLowerCase() === orixaLower
  ).map((d) => d.dia);
}

export default {
  getDayOrixa,
  getOrixaDay,
  getAllDays,
  getAllDayOrixas,
  getOrixasForDay,
  getDaysByOrixa,
};