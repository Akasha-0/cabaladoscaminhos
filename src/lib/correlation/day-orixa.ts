/**
 * Day-Orixá Correlation Module
 * Maps days of the week to spiritual Orixá correspondences
 * Based on IDEIA.md 'Calendário e Janelas de Ativação Energética' and 'Orixás' tables
 */

export interface DayOrixa {
  /** Day name (e.g., 'Segunda-feira') */
  dia: string;
  /** Main Orixá governing the day */
  orixa_principal: string;
  /** Secondary Orixá or alternative vibration */
  orixa_secundario: string | null;
  /** Element associated with the day's energy */
  elemento: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  /** Sacred color(s) of the day */
  cor: string;
  /** Sacred number (Odú principal) */
  numero_sagrado: number;
  /** Chakra(s) associated with the day */
  chakra: string;
  /** Planet(s) regent of the day */
  planeta: string;
  /** Mystical theme and spiritual action of the day */
  mystere: string;
}

/** Day-to-Orixá mapping based on IDEIA.md */
const DAY_ORIXA_MAP: Record<string, DayOrixa> = {
  'Segunda-feira': {
    dia: 'Segunda-feira',
    orixa_principal: 'Omolu',
    orixa_secundario: 'Exu',
    elemento: 'terra',
    cor: 'Vermelho / Branco e Preto',
    numero_sagrado: 1,
    chakra: '1º Básico / 6º Frontal',
    planeta: 'Lua / Saturno',
    mystere: 'Dia de aterramento, limpeza espiritual, transmutação e respeito às almas e antepassados.',
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    orixa_principal: 'Iansã',
    orixa_secundario: 'Ogum',
    elemento: 'fogo',
    cor: 'Laranja / Vermelho',
    numero_sagrado: 7,
    chakra: '2º Sacro',
    planeta: 'Marte / Plutão',
    mystere: 'Dia de força, movimento, coragem, corte de demandas e quebra de energias paradas.',
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    orixa_principal: 'Xangô',
    orixa_secundario: 'Iansã',
    elemento: 'fogo',
    cor: 'Amarelo',
    numero_sagrado: 3,
    chakra: '3º Plexo Solar',
    planeta: 'Mercúrio',
    mystere: 'Dia da justiça divina, dos estudos, da mente concreta, da verdade e da razão.',
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    orixa_principal: 'Oxóssi',
    orixa_secundario: null,
    elemento: 'ar',
    cor: 'Verde',
    numero_sagrado: 1,
    chakra: '4º Cardíaco',
    planeta: 'Júpiter',
    mystere: 'Dia da fartura, da busca por conhecimento, da expansão e da cura através das matas.',
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    orixa_principal: 'Oxalá',
    orixa_secundario: null,
    elemento: 'ar',
    cor: 'Branco / Violeta',
    numero_sagrado: 8,
    chakra: '7º Coronário',
    planeta: 'Vênus',
    mystere: 'Dia da paz, da pureza, do silêncio, da gratidão e da conexão direta com o Divino.',
  },
  'Sábado': {
    dia: 'Sábado',
    orixa_principal: 'Oxum',
    orixa_secundario: 'Iemanjá',
    elemento: 'água',
    cor: 'Rosa / Azul Escuro',
    numero_sagrado: 5,
    chakra: '4º Cardíaco / 6º Frontal',
    planeta: 'Saturno / Urano',
    mystere: 'Dia das Grandes Mães. Rege o amor incondicional, a intuição, a fertilidade e as águas geradoras.',
  },
  'Domingo': {
    dia: 'Domingo',
    orixa_principal: 'Xangô',
    orixa_secundario: null,
    elemento: 'fogo',
    cor: 'Amarelo / Dourado',
    numero_sagrado: 6,
    chakra: '3º Plexo Solar',
    planeta: 'Sol',
    mystere: 'Dia de recarregar a energia vital, focar no poder pessoal, no brilho próprio e no propósito de vida.',
  },
};

/**
 * Get Orixá correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns DayOrixa mapping or undefined if day not found
 */
export function getDayOrixa(dia: string): DayOrixa | undefined {
  return DAY_ORIXA_MAP[dia];
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_ORIXA_MAP);
}

/**
 * Get Orixás for a specific day
 * @param dia - Day name
 * @returns Array of Orixá names associated with that day
 */
export function getOrixasForDay(dia: string): string[] {
  const dayMapping = DAY_ORIXA_MAP[dia];
  if (!dayMapping) return [];
  
  const orixas: string[] = [dayMapping.orixa_principal];
  if (dayMapping.orixa_secundario) {
    orixas.push(dayMapping.orixa_secundario);
  }
  return orixas;
}

/**
 * Get days associated with a specific Orixá
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns Array of day names
 */
export function getDaysByOrixa(orixa: string): string[] {
  const normalizedOrixa = orixa.toLowerCase();
  return Object.entries(DAY_ORIXA_MAP)
    .filter(([_, data]) => {
      const principalMatch = data.orixa_principal.toLowerCase() === normalizedOrixa;
      const secundarioMatch = data.orixa_secundario?.toLowerCase() === normalizedOrixa;
      return principalMatch || secundarioMatch;
    })
    .map(([dayName]) => dayName);
}
export function getOrixaDay(): Record<string, DayOrixa> {
  return { ...DAY_ORIXA_MAP };
}
export function getAllDayOrixas(): DayOrixa[] {
  return Object.values(DAY_ORIXA_MAP);
}
export default {
  getDayOrixa,
  getOrixaDay,
  getAllDays,
  getAllDayOrixas,
  getOrixasForDay,
  getDaysByOrixa,
};