/**
 * Orixá-Zodiac Correlation Module
 * Maps Orixás to their corresponding zodiac signs, elements, and spiritual meanings
 * Based on IDEIA.md Cabala dos Caminhos framework
 * Reverse mapping of zodiac-orixa.ts
 */

import type { Signo } from './zodiac-signo';
import type { Elemento } from './element-sign';

/**
 * Orixá-to-Zodiac correlation mapping
 */
export interface OrixaZodiac {
  /** Orixá name */
  orixa: string;
  /** Primary zodiac sign */
  signo: Signo;
  /** Element correspondence */
  elemento: Elemento;
  /** Spiritual meaning of the correlation */
  significado_espiritual: string;
  /** Secondary zodiac signs associated */
  signos_secundarios?: Signo[];
  /** Sacred day */
  dia_sagrado: string;
  /** Planetary ruler */
  planeta_regente: string;
}

// ─── Orixá-to-Zodiac Mapping ───────────────────────────────────────────

/**
 * Mapping of each Orixá to their primary zodiac sign
 * Based on IDEIA.md spiritual correlations
 */
export const ORIXA_ZODIAC_MAP: Readonly<Record<string, OrixaZodiac>> = {
  /**
   * OXALÁ - Supremo Creator
   * Zodiac: Capricórnio
   * The老人家 wisdom and éter energy of Oxalá aligns with Capricórnio's disciplined spirituality
   */
  'Oxalá': {
    orixa: 'Oxalá',
    signo: 'Capricórnio',
    elemento: 'Éter',
    significado_espiritual: 'Oxalá-Capricórnio representa a sabedoria anciã que vem da perseverança e da disciplina espiritual. A energia etérea de Oxalá conecta-se à ambição terreana de Capricórnio, ensinando que a verdadeira elevação espiritual requer trabalho constante e reverência aos ancestrais.',
    signos_secundarios: ['Aquário'],
    dia_sagrado: 'Sexta-feira',
    planeta_regente: 'Sol',
  },

  /**
   * IEMANJÁ - Mother of Waters
   * Zodiac: Câncer
   * The maternal, nurturing water energy of Iemanjá perfectly aligns with Câncer's emotional depth
   */
  'Iemanjá': {
    orixa: 'Iemanjá',
    signo: 'Câncer',
    elemento: 'Água',
    significado_espiritual: 'Iemanjá-Câncer representa a mãe cósmica que guarda a memória ancestral. A energia hídrica de Iemanjá manifesta-se na profunda conexão emocional de Câncer, ensinando que o amor maternal é a força mais poderosa do universo.',
    signos_secundarios: ['Escorpião', 'Peixes'],
    dia_sagrado: 'Sábado',
    planeta_regente: 'Lua',
  },

  /**
   * OXUM - Goddess of Wealth and Love
   * Zodiac: Touro
   * The beauty, prosperity, and sensual water energy of Oxum aligns with Taurus's stability and abundance
   */
  'Oxum': {
    orixa: 'Oxum',
    signo: 'Touro',
    elemento: 'Água',
    significado_espiritual: 'Oxum-Touro representa a abundância sagrada que flui através da beleza e do trabalho paciente. A energia hídrica de Oxum manifesta-se na capacidade de Touro de atrair prosperidade através da elegância e do discernimento.',
    signos_secundarios: ['Libra'],
    dia_sagrado: 'Sábado',
    planeta_regente: 'Vénus',
  },

  /**
   * OGUM - Warrior of Paths
   * Zodiac: Áries
   * The pioneering, courageous fire/earth energy of Ogum aligns perfectly with Aries's warrior spirit
   */
  'Ogum': {
    orixa: 'Ogum',
    signo: 'Áries',
    elemento: 'Terra',
    significado_espiritual: 'Ogum-Áries representa o guerreiro cósmico que abre novos caminhos. A energia telúrica de Ogum manifesta-se na determinação inabalável de Áries, ensinando que a verdadeira força está em avançar mesmo quando o caminho é incerto.',
    signos_secundarios: ['Marte'],
    dia_sagrado: 'Terça-feira',
    planeta_regente: 'Marte',
  },

  /**
   * OXÓSSI - Hunter of Wisdom
   * Zodiac: Virgem
   * The analytical, wise earth energy of Oxóssi aligns with Virgo's pursuit of perfection and knowledge
   */
  'Oxóssi': {
    orixa: 'Oxóssi',
    signo: 'Virgem',
    elemento: 'Terra',
    significado_espiritual: 'Oxóssi-Virgem representa o caçador silencioso da sabedoria ancestral. A energia terrestre de Oxóssi manifesta-se na capacidade analítica de Virgem de discernir a verdade através da observação atenta e da pesquisa meticulosa.',
    signos_secundarios: ['Sagitário'],
    dia_sagrado: 'Quinta-feira',
    planeta_regente: 'Júpiter',
  },

  /**
   * XANGÔ - Lord of Justice and Thunder
   * Zodiac: Leão
   * The regal, powerful fire energy of Xangô aligns with Leo's royal, radiant leadership
   */
  'Xangô': {
    orixa: 'Xangô',
    signo: 'Leão',
    elemento: 'Fogo',
    significado_espiritual: 'Xangô-Leão representa o soberano divino que governa com sabedoria e justiça. A energia ígnea de Xangô manifesta-se na capacidade de Leão de irradiar luz própria e inspirar outros através de sua autoridade natural.',
    signos_secundarios: ['Áries'],
    dia_sagrado: 'Quarta-feira',
    planeta_regente: 'Sol',
  },

  /**
   * IANSÃ - Warrior of Storms
   * Zodiac: Escorpião
   * The transformative, fierce fire/air energy of Iansã aligns with Scorpio's deep transformation and power
   */
  'Iansã': {
    orixa: 'Iansã',
    signo: 'Escorpião',
    elemento: 'Fogo',
    significado_espiritual: 'Iansã-Escorpião representa a guerreira das transformações radicais que vem através das tempestades. A energia ígnea de Iansã manifesta-se na intensidade transformadora de Escorpião, ensinando que a verdadeira libertação vem do confronto com nossos medos mais profundos.',
    signos_secundarios: ['Áries'],
    dia_sagrado: 'Terça-feira',
    planeta_regente: 'Plutão',
  },

  /**
   * OMOLU - Lord of Disease and Healing
   * Zodiac: Capricórnio
   * The transformative earth energy of Omolu aligns with Capricorn's disciplined approach to karma and healing
   */
  'Omolu': {
    orixa: 'Omolu',
    signo: 'Capricórnio',
    elemento: 'Terra',
    significado_espiritual: 'Omolu-Capricórnio representa o confronto com a escuridão que precede a cura e o renascimento. A energia telúrica de Omolu manifesta-se na perseverança de Capricórnio através das provas do destino, ensinando que através do sofrimento encontramos a verdadeira transformação.',
    signos_secundarios: ['Saturno'],
    dia_sagrado: 'Segunda-feira',
    planeta_regente: 'Saturno',
  },

  /**
   * NANÃ - Ancient of Waters
   * Zodiac: Peixes
   * The wise, deep water energy of Nanã aligns with Pisces's spiritual surrender and ancient wisdom
   */
  'Nanã': {
    orixa: 'Nanã',
    signo: 'Peixes',
    elemento: 'Água',
    significado_espiritual: 'Nanã-Peixes representa a anciã que guarda os segredos ancestrais das águas profundas. A energia hídrica de Nanã manifesta-se na capacidade de Peixes de acessar a sabedoria dos antepassados e fluir com os mistérios do universo.',
    signos_secundarios: ['Câncer', 'Escorpião'],
    dia_sagrado: 'Terça-feira',
    planeta_regente: 'Netuno',
  },

  /**
   * OXUMARÉ - Rainbow Serpent
   * Zodiac: Gémeos
   * The duality, transformation, and air/water energy of Oxumaré aligns with Gemini's versatile intellect
   */
  'Oxumaré': {
    orixa: 'Oxumaré',
    signo: 'Gémeos',
    elemento: 'Ar',
    significado_espiritual: 'Oxumaré-Gémeos representa o arco-íris que une céus e terra, opostos e transformações. A energia dual de Oxumaré manifesta-se na mente ágil de Gémeos, ensinando que a verdadeira sabedoria está em entender que todos os caminhos levam à evolução.',
    signos_secundarios: ['Aquário'],
    dia_sagrado: 'Quarta-feira',
    planeta_regente: 'Mercúrio',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ORIXA_ZODIAC_MAP);
Object.values(ORIXA_ZODIAC_MAP).forEach(mapping => Object.freeze(mapping));

/**
 * Get Orixá-to-Zodiac correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaZodiac mapping or undefined if not found
 */
export function getOrixaZodiac(orixa: string): OrixaZodiac | undefined {
  const normalized = orixa.trim();
  return ORIXA_ZODIAC_MAP[normalized] || Object.values(ORIXA_ZODIAC_MAP).find(
    entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get the primary Orixá for a zodiac sign
 * @param signo - Zodiac sign name (case-insensitive)
 * @returns OrixaZodiac mapping or undefined if sign not found
 */
export function getZodiacOrixa(signo: string): OrixaZodiac | undefined {
  const normalized = signo.trim();
  return Object.values(ORIXA_ZODIAC_MAP).find(
    entry => entry.signo.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get all Orixá-to-Zodiac mappings
 * @returns Array of all OrixaZodiac objects
 */
export function getAllOrixaZodiacs(): OrixaZodiac[] {
  return Object.values(ORIXA_ZODIAC_MAP);
}

/**
 * Get all Orixá names
 * @returns Array of all Orixá names
 */
export function getAllOrixas(): string[] {
  return Object.keys(ORIXA_ZODIAC_MAP);
}

/**
 * Get zodiac sign by element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Array of OrixaZodiac objects with that element
 */
export function getOrixasByElement(elemento: OrixaZodiac['elemento']): OrixaZodiac[] {
  return Object.values(ORIXA_ZODIAC_MAP).filter(
    entry => entry.elemento === elemento
  );
}

/**
 * Get Orixá by sacred day
 * @param dia - Day of week (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns Array of OrixaZodiac objects associated with that day
 */
export function getOrixasByDay(dia: string): OrixaZodiac[] {
  return Object.values(ORIXA_ZODIAC_MAP).filter(
    entry => entry.dia_sagrado.toLowerCase() === dia.toLowerCase()
  );
}

/**
 * Get Orixá by planet
 * @param planeta - Planet name (e.g., 'Marte', 'Lua', 'Sol')
 * @returns Array of OrixaZodiac objects ruled by that planet
 */
export function getOrixasByPlaneta(planeta: string): OrixaZodiac[] {
  return Object.values(ORIXA_ZODIAC_MAP).filter(
    entry => entry.planeta_regente.toLowerCase() === planeta.toLowerCase()
  );
}

export default {
  getOrixaZodiac,
  getZodiacOrixa,
  getAllOrixaZodiacs,
  getAllOrixas,
  getOrixasByElement,
  getOrixasByDay,
  getOrixasByPlaneta,
};