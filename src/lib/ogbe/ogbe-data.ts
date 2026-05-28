// Ogbe Data - Ifa Divination System - Cabala Dos Caminhos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Ogbe data interface
 */
export interface OgbeData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  yoruba: string;
  numero: number;
  simbolo: string;
  linhas: boolean[];
  significado: string;
  description: string;
  keywords: string[];
  oduPrinciples: string[];
  spiritualGuidance: string[];
  ritualPractices: string[];
  ebos: OgbeEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Ogbe
 */
export interface OgbeEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Ogbe data
 */
export const ogbeData: OgbeData = {
  id: 'ogbe-001',
  name: 'Ogbe',
  namePt: 'Ogbe - O Começo',
  nameEn: 'Ogbe - The Beginning',
  yoruba: 'Ògùndá',
  numero: 1,
  simbolo: '☰',
  linhas: [true, true, true],
  significado: 'Caminho aberto, inicio, movimento, prosperidade',
  description:
    'Ogbe é o primeiro Odu do Merindilogun, representando o princípio do começo, criação e luz. Simboliza victoria, sabedoria, prosperidade e liderança. Quando Ogbe aparece, Olódùmarè abre uma porta de possibilidade e concede ao consulente a clareza para agir com propósito. Fala do amanhecer após a escuridão, de sementes quebrando o solo, de impérios construídos a partir de ideias únicas manifestadas.',
  keywords: ['light', 'creation', 'new beginnings', 'victory', 'wisdom', 'prosperity', 'leadership'],
  oduPrinciples: ['Começo', 'Iniciação', 'Origem', 'Primeiro passo', 'Criação', 'Luz'],
  spiritualGuidance: [
    'Abraça novos começos com confiança e fé no divino.',
    'Busque clareza antes de agir; a névoa se dissipa onde entra a luz.',
    'A prosperidade está ao seu alcance quando age com propósito.',
    'Lidere com integridade e sabedoria sagrada.',
    'Semeie sementes de luz nos momentos de escuridão.',
  ],
  ritualPractices: [
    'Ebo de开门 para novos começos',
    'Oferendas a Orunmila',
    'Meditação ao amanhecer',
    'Purificação com água sagrada',
    'Oferecimento de milho e coco',
  ],
  ebos: [
    {
      tipo: 'Ebo de Abertura',
      descricao: 'Sacrifício para abrir caminhos e remover obstáculos',
      elementos: ['coco fresco', 'mel de abelha', 'farinha de inhame', 'ogbe frasco', 'dinheiro novo'],
    },
    {
      tipo: 'Ebo de Prosperidade',
      descricao: 'Sacrifício para abundância material e espiritual',
      elementos: ['dinheiro novo', 'akara frito', 'ogbe frasco', 'milho', 'oleo de palma'],
    },
    {
      tipo: 'Ebo de Vitória',
      descricao: 'Sacrifício para conquista e superação de desafios',
      elementos: ['cabrito manchado', 'ogbe frasco', 'palma oil', 'alecrim', 'kola nut'],
    },
  ],
  quizilas: [
    'Não crossing crossroads without salutation',
    'Não starting new ventures on Sundays',
    'Respeitar os mais velhos',
    'Não mentir para o Babalawo',
    'Manter a palavra dada',
  ],
  orixas: ['Olodumare', 'Orunmila', 'Obatala', 'Elegba'],
  sacredFrequencies: ['432 Hz (Origem)', '528 Hz (Criação)', '639 Hz (Conexão)', '741 Hz (Expressão)'],
  elements: ['Luz', 'Fogo', 'Ar', 'Força Masculina'],
  dayOfWeek: 'Segunda-feira',
  colors: ['#FFD700', '#FFA500', '#FFFFFF'],
};

/**
 * Get all Ogbe data
 */
export function getData(): OgbeData {
  return ogbeData;
}

/**
 * Get Ogbe by identifier
 */
export function getOgbeById(id: string): OgbeData | undefined {
  if (id === ogbeData.id) return ogbeData;
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Ogbe
 */
export function getQuizilas(): string[] {
  return ogbeData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Ogbe
 */
export function getEbós(): OgbeEbo[] {
  return ogbeData.ebos;
}

/**
 * Get all Orixás associated with Ogbe
 */
export function getOrixas(): string[] {
  return ogbeData.orixas;
}

/**
 * Get sacred frequencies for Ogbe
 */
export function getSacredFrequencies(): string[] {
  return ogbeData.sacredFrequencies;
}

export default getData;
