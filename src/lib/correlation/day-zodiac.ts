/**
 * Day-Zodiac Correlation Module
 * Maps days of the week to spiritual astrological correspondences
 * Based on classical Western astrology and the seven classical planets
 */

export interface DayZodiac {
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day index (0 = Sunday, 1 = Monday, etc.) */
  indice: number;
  /** Ruling planet of the day */
  planeta: string;
  /** Primary associated zodiac sign */
  signo: string;
  /** Element of the day */
  elemento: 'fogo' | 'água' | 'ar' | 'terra';
  /** Spiritual significance and energetic theme of the day */
  significado_espiritual: string;
  /** Quality of the element (cardinal/fixed/mutable) */
  qualidade: string;
  /** Sacred color(s) of the day */
  cor: string;
  /** Associated tarot archetype for the day */
  arcano: string;
}

/** Day-to-Zodiac mapping based on classical astrology traditions */
const DAY_ZODIAC_MAP: Record<string, DayZodiac> = {
  'Domingo': {
    dia: 'Domingo',
    indice: 0,
    planeta: 'Sol',
    signo: 'Leão',
    elemento: 'fogo',
    qualidade: 'fixed',
    cor: 'Dourado / Amarelo',
    significado_espiritual: 'Dia de recarregar a energia vital, focar no poder pessoal, brilho próprio e propósito de vida. Reinar com coração generoso e irradiar luz interior.',
    arcano: 'O Sol',
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    indice: 1,
    planeta: 'Lua',
    signo: 'Câncer',
    elemento: 'água',
    qualidade: 'cardinal',
    cor: 'Prata / Branco',
    significado_espiritual: 'Dia de introspecção, sensibilidade emocional e conexão com a criança interior. Acolher as emoções, nutrir-se e cultivar a intuíção profunda.',
    arcano: 'A Sacerdotisa',
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    indice: 2,
    planeta: 'Marte',
    signo: 'Áries',
    elemento: 'fogo',
    qualidade: 'cardinal',
    cor: 'Vermelho / Laranja',
    significado_espiritual: 'Dia de força, coragem e ação decisiva. Romper barreiras, iniciar projetos audazes e canalizar a energia guerreira para a transformação.',
    arcano: 'O Carro',
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    indice: 3,
    planeta: 'Mercúrio',
    signo: 'Gêmeos',
    elemento: 'ar',
    qualidade: 'mutable',
    cor: 'Amarelo / Cinzento',
    significado_espiritual: 'Dia da mente ágil, comunicação clara e versatilidade intelectual. Comunicar-se com clareza, estudar, negociar e adaptar-se às circunstâncias.',
    arcano: 'O Mago',
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    indice: 4,
    planeta: 'Júpiter',
    signo: 'Sagitário',
    elemento: 'fogo',
    qualidade: 'mutable',
    cor: 'Azul / Roxo',
    significado_espiritual: 'Dia de expansão, abundância e busca pelo conhecimento superior. Expandir horizontes, agradecer pelas bênçãos e философствовать sobre o sentido da vida.',
    arcano: 'A Fortuna',
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    indice: 5,
    planeta: 'Vênus',
    signo: 'Touro',
    elemento: 'terra',
    qualidade: 'fixed',
    cor: 'Verde / Rosa',
    significado_espiritual: 'Dia de amor, harmonia e beleza. Cultivar relações, apreciar a natureza, dedicar-se à arte e encontrar prazer nas coisas simples da vida.',
    arcano: 'O Hierofante',
  },
  'Sábado': {
    dia: 'Sábado',
    indice: 6,
    planeta: 'Saturno',
    signo: 'Capricórnio',
    elemento: 'terra',
    qualidade: 'cardinal',
    cor: 'Preto / Azul Escuro',
    significado_espiritual: 'Dia de estruturação, disciplina e respeito aos limites. Construir bases sólidas, responsabilidades assumir e maturidade espiritual cultivar.',
    arcano: 'O Mundo',
  },
};

/**
 * Get zodiac correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Segunda-feira', 'Terça-feira', 'Domingo')
 * @returns DayZodiac mapping or undefined if day not found
 */
export function getDayZodiac(dia: string): DayZodiac | undefined {
  return DAY_ZODIAC_MAP[dia];
}

/**
 * Get zodiac sign by day name
 * @param dia - Day name in Portuguese
 * @returns Zodiac sign name or undefined
 */
export function getZodiacByDay(dia: string): string | undefined {
  return DAY_ZODIAC_MAP[dia]?.signo;
}

/**
 * Get element for a specific day
 * @param dia - Day name in Portuguese
 * @returns Element or undefined if day not found
 */
export function getDayElement(dia?: string): string | undefined {
  if (!dia) {
    // Return all day-element pairs
    return undefined;
  }
  return DAY_ZODIAC_MAP[dia]?.elemento;
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_ZODIAC_MAP);
}

/**
 * Get the ruling planet for a specific day
 * @param dia - Day name in Portuguese
 * @returns Planet name or undefined
 */
export function getDayPlanet(dia: string): string | undefined {
  return DAY_ZODIAC_MAP[dia]?.planeta;
}

/**
 * Get days associated with a specific zodiac sign
 * @param signo - Zodiac sign name
 * @returns Array of day names
 */
export function getDaysBySigno(signo: string): string[] {
  return Object.values(DAY_ZODIAC_MAP)
    .filter(dayZodiac => dayZodiac.signo.toLowerCase() === signo.toLowerCase())
    .map(dayZodiac => dayZodiac.dia);
}

/**
 * Get days associated with a specific element
 * @param elemento - Element name ('fogo', 'água', 'ar', 'terra')
 * @returns Array of day names
 */
export function getDaysByElemento(elemento: string): string[] {
  return Object.values(DAY_ZODIAC_MAP)
    .filter(dayZodiac => dayZodiac.elemento === elemento)
    .map(dayZodiac => dayZodiac.dia);
}

/**
 * Get the spiritual significance of a day
 * @param dia - Day name in Portuguese
 * @returns Spiritual significance text or undefined
 */
export function getDaySignificado(dia: string): string | undefined {
  return DAY_ZODIAC_MAP[dia]?.significado_espiritual;
}

/**
 * Get all day-zodiac correlations
 * @returns Array of all DayZodiac mappings
 */
export function getAllDayZodiacs(): DayZodiac[] {
  return Object.values(DAY_ZODIAC_MAP);
}

export default {
  getDayZodiac,
  getZodiacByDay,
  getDayElement,
  getAllDays,
  getDayPlanet,
  getDaysBySigno,
  getDaysByElemento,
  getDaySignificado,
  getAllDayZodiacs,
};