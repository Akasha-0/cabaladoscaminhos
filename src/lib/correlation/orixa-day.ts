/**
 * Orixá-Day Correlation Module
 * Maps Orixás to days of the week with spiritual correlations
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export interface OrixaDay {
  orixa: string;
  day: string;
  element: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  spiritual_meaning: string;
  energy: 'yang' | 'yin' | 'balanced';
  affirmation?: string;
  ritual_focus?: string;
}

// Main Orixá-Day mappings based on IDEIA.md
const ORIXAS_DAY_MAP: Record<string, OrixaDay> = {
  'Oxalá': {
    orixa: 'Oxalá',
    day: 'Sexta-feira',
    element: 'éter',
    spiritual_meaning: 'Paz, luz, reconciliação e renovação espiritual. O pai supremo que traz harmonia e cura através da transformação interior.',
    energy: 'balanced',
    affirmation: 'Eu sou luz, eu sou paz, eu sou reconciliação',
    ritual_focus: 'Saudação, cura espiritual, decisões importantes, casamentos'
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    day: 'Sábado',
    element: 'água',
    spiritual_meaning: 'Maternidade divina, proteção, fertilidade e intuição profunda. A rainha do mar que governa as emoções e os ciclos naturais.',
    energy: 'yin',
    affirmation: 'Eu sou protegida, eu sou nutriz, eu sou intuição',
    ritual_focus: 'Proteção familiar, sonhos, cura emocional, gratidão'
  },
  'Oxum': {
    orixa: 'Oxum',
    day: 'Sábado',
    element: 'água',
    spiritual_meaning: 'Amor, prosperidade, encantaria e sabedoria feminina. A doce senhora das águas doces que abençoa com abundância.',
    energy: 'yin',
    affirmation: 'Eu sou amada, eu sou próspera, eu sou encantada',
    ritual_focus: 'Amor, prosperidade financeira, beleza, saúde feminina'
  },
  'Ogum': {
    orixa: 'Ogum',
    day: 'Terça-feira',
    element: 'terra',
    spiritual_meaning: 'Força, coragem, determinação e conquista. O guerreiro que abre caminhos e remove obstáculos com poder e vontade.',
    energy: 'yang',
    affirmation: 'Eu sou forte, eu sou determinado, eu conquisto',
    ritual_focus: 'Abertura de caminhos, proteção, luta, trabalho'
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    day: 'Quinta-feira',
    element: 'terra',
    spiritual_meaning: 'Abundância, prosperidade, caça espiritual e conhecimento. O caçador céleste que busca a verdade e a riqueza interior.',
    energy: 'yang',
    affirmation: 'Eu sou abundante, eu busco a verdade, eu prospero',
    ritual_focus: 'Prosperidade, conhecimento, equilíbrio, fartura'
  },
  'Xangô': {
    orixa: 'Xangô',
    day: 'Quarta-feira',
    element: 'fogo',
    spiritual_meaning: 'Justiça, poder, transformação e equilíbrio. O rei do trovão que trazendo ordem e coragem através do fogo purificador.',
    energy: 'yang',
    affirmation: 'Eu sou justo, eu sou poderoso, eu transformo',
    ritual_focus: 'Justiça, equilíbrio, força, decisões importantes'
  },
  'Iansã': {
    orixa: 'Iansã',
    day: 'Terça-feira',
    element: 'fogo',
    spiritual_meaning: 'Libertação, transformação, renovação e libertação de padrões. A guerreira que transforma inimigos em aliados através da força interior.',
    energy: 'yang',
    affirmation: 'Eu libero, eu transformo, eu renovo',
    ritual_focus: 'Libertação de prisões, proteção, transformação, conquista'
  },
  'Omolu': {
    orixa: 'Omolu',
    day: 'Segunda-feira',
    element: 'terra',
    spiritual_meaning: 'Cura, proteção contra pragas, renovação e saúde. O senhor das doenças e da cura que transforma a escuridão em luz.',
    energy: 'balanced',
    affirmation: 'Eu sou curado, eu sou protegido, eu renasco',
    ritual_focus: 'Cura de doenças, proteção contra mal, renovação, saúde'
  },
  'Nanã': {
    orixa: 'Nanã',
    day: 'Terça-feira',
    element: 'água',
    spiritual_meaning: 'Humildade, sabedoria ancestral, fertilidade e respeito aos antepassados. A anciã que ensina através da paciência e do conhecimento.',
    energy: 'yin',
    affirmation: 'Eu sou humilde, eu honro meus antepassados, eu aprendo',
    ritual_focus: 'Fertilidade, respeito aos mortos, humildade, tradição'
  }
};

/**
 * Get Orixá day correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaDay mapping or undefined if not found
 */
export function getOrixaDay(orixa: string): OrixaDay | undefined {
  const normalized = orixa.toLowerCase().trim();
  const found = Object.entries(ORIXAS_DAY_MAP).find(
    ([key]) => key.toLowerCase() === normalized
  );
  return found ? found[1] : undefined;
}

/**
 * Get Orixá mapping for a specific day of the week
 * @param day - Day of the week (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns OrixaDay mapping or undefined if not found
 */
export function getDayOrixa(day: string): OrixaDay | undefined {
  const normalized = day.toLowerCase().trim();
  return Object.values(ORIXAS_DAY_MAP).find(
    (item) => item.day.toLowerCase() === normalized
  );
}

/**
 * Get all Orixá-day mappings
 * @returns Array of all OrixaDay objects
 */
export function getAllOrixaDays(): OrixaDay[] {
  return Object.values(ORIXAS_DAY_MAP);
}

export default {
  getOrixaDay,
  getDayOrixa,
  getAllOrixaDays
};