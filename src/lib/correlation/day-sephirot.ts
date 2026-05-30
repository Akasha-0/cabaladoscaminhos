/**
 * Day-Sephirot Spiritual Correlation Module
 * Maps days of the week to their ruling Sephiroth on the Tree of Life
 * Based on classical Kabbalistic and Western esoteric traditions
 */

import type { Elemento } from './sephirot-element';

/**
 * Represents the correlation between a day of the week and its ruling Sephirah
 */
export interface DaySephirot {
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Associated Sephirah name in Hebrew/English */
  sephirah: string;
  /** Hebrew name transliteration */
  nome_hebraico: string;
  /** Element connection from the Sephirah */
  elemento: Elemento;
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Ruling planet of the day */
  planeta: string;
  /** Zodiac sign of the day */
  signo: string;
  /** Spiritual energy and quality of the day-sephirot connection */
  energia_espiritual: string;
  /** Sacred color(s) of the day */
  cor: string;
  /** Mystical theme and energetic focus */
  mystere: string;
  /** Recommended spiritual practices for the day */
  praticas_espirituais: string[];
}

// ─── Day-to-Sephirot Mapping ─────────────────────────────────────────────────

/**
 * Day-to-Sephirot mapping based on classical Kabbalistic correspondences
 * Each day is ruled by a specific Sephirah, forming a complete cycle
 */
const DAY_SEPHIROT_MAP: Record<string, DaySephirot> = {
  'Domingo': {
    dia: 'Domingo',
    indice: 0,
    sephirah: 'Tiphereth',
    nome_hebraico: 'תפארת',
    elemento: 'Fogo',
    numero_caminho: 6,
    planeta: 'Sol',
    signo: 'Leão',
    energia_espiritual: 'Harmonia / Brilho Solar / Propósito de Vida',
    cor: 'Dourado / Amarelo',
    mystere: 'Dia de recarregar a energia vital, brilhar com autenticidade e alinhar-se com o propósito de vida. Tiphereth representa a beleza central da Árvore, o ponto de equilíbrio entre Kether e Malkuth.',
    praticas_espirituais: [
      'Exposição solar consciente (tomar sol com intenção)',
      'Meditação com visualização dourada no coração',
      'Rituais de consagração de amuletos e talismãs',
      'Práticas de autorrealização e propósito de vida',
      'Gratidão pela vida e pelo caminho percorrido',
    ],
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    indice: 1,
    sephirah: 'Yesod',
    nome_hebraico: 'יסוד',
    elemento: 'Água',
    numero_caminho: 9,
    planeta: 'Lua',
    signo: 'Câncer',
    energia_espiritual: 'Imaginação / Base Subconsciente / Lua',
    cor: 'Prata / Branco',
    mystere: 'Dia de introspecção profunda, conexão com o inconsciente e cultivo da imaginação ativa. Yesod é a fundação do mundo arquetípico, o receptáculo lunar das águas superiores.',
    praticas_espirituais: [
      'Banhos de limpeza energética com ervas receptivas',
      'Meditação lunar (especialmente no luar)',
      'Diário de sonhos e visualizações criativas',
      'Práticas de autoacolhimento e autocuidado',
      'Conexão com ancestrais e memórias do sangue',
    ],
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    indice: 2,
    sephirah: 'Geburah',
    nome_hebraico: 'גבורה',
    elemento: 'Fogo',
    numero_caminho: 5,
    planeta: 'Marte',
    signo: 'Áries',
    energia_espiritual: 'Força / Guerra Santa / Cortante',
    cor: 'Vermelho / Laranja',
    mystere: 'Dia de força, coragem e ação decisiva. Geburah representa a severidade divina, a força cortante que remove o que não serve e abre espaço para o novo.',
    praticas_espirituais: [
      'Rituais de proteção e banimento',
      'Corte de demandas e laços energéticos',
      'Queima de firmezas e patuás negativados',
      'Práticas de coragem e autodefesa espiritual',
      'Ação decisiva com foco na transformação',
    ],
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    indice: 3,
    sephirah: 'Hod',
    nome_hebraico: 'הוד',
    elemento: 'Ar',
    numero_caminho: 8,
    planeta: 'Mercúrio',
    signo: 'Gêmeos',
    energia_espiritual: 'Intelecto / Comunicação / Verdade Divina',
    cor: 'Amarelo / Cinzento',
    mystere: 'Dia da mente ágil, comunicação clara e busca pela verdade. Hod representa a glória do intelecto divino, a capacidade de articular o conhecimento com precisão e clareza.',
    praticas_espirituais: [
      'Defumações com alecrim e estoraque para clareza mental',
      'Práticas de comunicação assertiva e verdadeira',
      'Estudos e meditações sobre a verdade',
      'Rituais de agilidade nos negócios e contratos',
      'Exercícios de equilíbrio entre razão e intuição',
    ],
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    indice: 4,
    sephirah: 'Chesed',
    nome_hebraico: 'חסד',
    elemento: 'Água',
    numero_caminho: 4,
    planeta: 'Júpiter',
    signo: 'Sagitário',
    energia_espiritual: 'Expansão / Abundância / Misericórdia Divina',
    cor: 'Azul / Roxo',
    mystere: 'Dia de expansão, abundância e graça divina. Chesed representa a misericórdia infinita, a expansão generosa que verte bênçãos sobre todos os seres.',
    praticas_espirituais: [
      'Rituais de fartura e prosperidade',
      'Orações de agradecimento e expansão',
      'Estudos filosóficos e espirituais profundos',
      'Busca por mentores e guias iluminados',
      'Práticas de generosidade e distribuição de bênçãos',
    ],
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    indice: 5,
    sephirah: 'Netzach',
    nome_hebraico: 'נצח',
    elemento: 'Água',
    numero_caminho: 7,
    planeta: 'Vênus',
    signo: 'Touro',
    energia_espiritual: 'Vitória Emocional / Amor Universal',
    cor: 'Verde / Rosa',
    mystere: 'Dia de amor, harmonia e beleza. Netzach representa a vitória do amor sobre a forma, a eternidade emocional que conecta todos os seres na rede da vida.',
    praticas_espirituais: [
      'Banhos de mel e rosas para magnetismo pessoal',
      'Práticas de amor próprio e autoapreciação',
      'Rituais de harmonização do lar e dos relacionamentos',
      'Conexão com a natureza e os espíritos da terra',
      'Cultivo de prazer e gratidão pelos sentidos',
    ],
  },
  'Sábado': {
    dia: 'Sábado',
    indice: 6,
    sephirah: 'Malkuth',
    nome_hebraico: 'מלכות',
    elemento: 'Terra',
    numero_caminho: 10,
    planeta: 'Saturno',
    signo: 'Capricórnio',
    energia_espiritual: 'Manifestação / Aterramento / Matéria',
    cor: 'Preto / Azul Escuro',
    mystere: 'Dia de encerramento de ciclos, disciplina espiritual e trabalho interno profundo. Malkuth é o Reino, a manifestação final da Árvore, onde toda energia se concretiza na matéria.',
    praticas_espirituais: [
      'Rituais de encerramento e despedida de ciclos',
      'Limpeza kármica e descarregos pesados',
      'Trabalho com ancestrais e espíritos da terra',
      'Práticas de ancoramento e aterramento profundo',
      'Organização material e espiritual do espaço sagrado',
    ],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(DAY_SEPHIROT_MAP);

/**
 * Get Sephirot correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Domingo', 'Segunda-feira', 'Terça-feira')
 * @returns DaySephirot mapping or undefined if day not found
 */
export function getDaySephirot(dia: string): DaySephirot | undefined {
  return DAY_SEPHIROT_MAP[dia];
}

/**
 * Get the Sephirah for a specific day
 * @param dia - Day name in Portuguese
 * @returns Sephirah name or undefined if day not found
 */
export function getSephirotByDay(dia: string): string | undefined {
  return DAY_SEPHIROT_MAP[dia]?.sephirah;
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_SEPHIROT_MAP);
}

/**
 * Get all day-Sephirot correlations
 * @returns Array of all DaySephirot mappings
 */
export function getAllDaySephiroth(): DaySephirot[] {
  return Object.values(DAY_SEPHIROT_MAP);
}

/**
 * Get days associated with a specific Sephirah
 * @param sephirah - The Sephirah name (e.g., 'Tiphereth', 'Geburah')
 * @returns Array of day names or empty array if not found
 */
export function getDaysBySephirah(sephirah: string): string[] {
  return Object.entries(DAY_SEPHIROT_MAP)
    .filter(([, value]) => value.sephirah === sephirah)
    .map(([key]) => key);
}

/**
 * Get the element connection for a specific day
 * @param dia - Day name in Portuguese
 * @returns Element name or undefined if day not found
 */
export function getElementByDay(dia: string): Elemento | undefined {
  return DAY_SEPHIROT_MAP[dia]?.elemento;
}

/**
 * Get the path number for a specific day
 * @param dia - Day name in Portuguese
 * @returns Path number or undefined if day not found
 */
export function getPathByDay(dia: string): number | undefined {
  return DAY_SEPHIROT_MAP[dia]?.numero_caminho;
}

/**
 * Get spiritual practices for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of spiritual practices or undefined if day not found
 */
export function getDayPractices(dia: string): string[] | undefined {
  return DAY_SEPHIROT_MAP[dia]?.praticas_espirituais;
}

/**
 * Get the mystical theme for a specific day
 * @param dia - Day name in Portuguese
 * @returns Mystical theme or undefined if day not found
 */
export function getDayMystere(dia: string): string | undefined {
  return DAY_SEPHIROT_MAP[dia]?.mystere;
}

/**
 * Get the Sephirah for a specific day (alias for getSephirotByDay)
 * @param dia - Day name in Portuguese
 * @returns Sephirah name or undefined if day not found
 */
export function getSephirotDay(dia: string): string | undefined {
  return DAY_SEPHIROT_MAP[dia]?.sephirah;
}

// Default export for convenience
export default {
  getDaySephirot,
  getSephirotByDay,
  getSephirotDay,
  getAllDays,
  getAllDaySephiroth,
  getDaysBySephirah,
  getElementByDay,
  getPathByDay,
  getDayPractices,
  getDayMystere,
};
