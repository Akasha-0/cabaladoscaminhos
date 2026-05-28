// Meji-Teturupon Data - Ifa Divination System - Cabala Dos Caminhos
 

/**
 * Meji-Teturupon data interface
 */
export interface MejiTeturuponData {
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
  ebos: MejiTeturuponEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Meji-Teturupon
 */
export interface MejiTeturuponEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Meji-Teturupon data
 */
export const mejiTeturuponData: MejiTeturuponData = {
  id: 'meji-teturupon-253',
  name: 'Meji-Teturupon',
  namePt: 'Meji-Teturupon - Destino Revelado',
  nameEn: 'Meji-Teturupon - Revealed Destiny',
  yoruba: 'Méjì-Tétùrúpón',
  numero: 253,
  simbolo: '⚊⚊|⚊⚊ + ⚊|⚊⚊|⚊',
  linhas: [true, true, true, true, false, false, false, false, false, true, true, true, true, false, false, false],
  significado:
    'Destino revelado, conhecimento oculto, revelação espiritual, proteção divina, intuição sagrada',
  description:
    'Meji-Teturupon é um Odu de revelação e conhecimento oculto. Este Odu surge quando a energia de Meji se combina com a sabedoria de Teturupon para abrir as portas do saber secreto. Meji-Teturupon ensina que o destino não está oculto para sempre, mas se revela no momento certo para aqueles que buscam com sinceridade. Este Odu traz a proteção dos orixás e a bênção da sabedoria ancestral, indicando que conhecimento profundo está prestes a ser descoberto.',
  keywords: [
    'revealed',
    'destiny',
    'knowledge',
    'occult',
    'protection',
    'intuition',
    'wisdom',
    'sacred',
    'discovery',
  ],
  oduPrinciples: [
    'Destino Revelado',
    'Conhecimento Oculto',
    'Proteção Divina',
    'Intuição Sagrada',
    'Sabedoria Ancestral',
    'Portas do Saber',
  ],
  spiritualGuidance: [
    'O conhecimento que você busca já está ao seu alcance.',
    'A verdade se revelará no momento certo.',
    'Confie na proteção dos orixás sobre sua jornada.',
    'Sua intuição é a voz dos seus ancestrais.',
    'O destino revela-se para aqueles que perguntam com sinceridade.',
  ],
  ritualPractices: ['Ebo de revelação', 'Oferendas a Orunmila', 'Meditação divina', 'Purificação espiritual'],
  ebos: [
    {
      tipo: 'Ebo de Revelação',
      descricao: 'Sacrifício para abrir as portas do conhecimento oculto',
      elementos: ['kola nuts', 'akará', 'vinho de palma', 'flores amarelas', 'incenso de mirra'],
    },
    {
      tipo: 'Ebo de Proteção',
      descricao: 'Sacrifício para invocar a proteção divina',
      elementos: ['azeite de dendê', 'farinha de trigo', 'velas douradas', 'ouro', 'água de flor de laranja'],
    },
    {
      tipo: 'Ebo Ancestral',
      descricao: 'Sacrifício para conectar com a sabedoria dos ancestrais',
      elementos: ['cabrito branco', 'vinho de palma', 'obi', 'ekura', 'roupas amarelas', 'colares de contas douradas'],
    },
  ],
  quizilas: [
    'Não esconder conhecimento que pode ajudar outros',
    'Não ignorar os sinais divinos',
    'Respeitar o sagrado em todas as formas',
    'Não utilizar o conhecimento para causar dano',
    'Manter a humildade diante da sabedoria',
  ],
  orixas: ['Orunmila', 'Oxum', 'Iemanjá', 'Orixáala', 'Nanã Buruquê'],
  sacredFrequencies: [
    '396 Hz (Libertação do Karma)',
    '432 Hz (Fundação Universal)',
    '528 Hz (Transformação e Milagre)',
    '639 Hz (Harmonia nas Relações)',
    '741 Hz (Despertar Intuitivo)',
  ],
  elements: ['Ar', 'Água', 'Fogo', 'Terra', 'Akása (Éter)'],
  dayOfWeek: 'Segunda-feira',
  colors: ['Amarelo', 'Dourado', 'Branco', 'Laranja'],
};

/**
 * Get all Meji-Teturupon data
 */
export function getData(): MejiTeturuponData {
  return mejiTeturuponData;
}

/**
 * Get Meji-Teturupon by identifier
 */
export function getMejiTeturuponById(id: string): MejiTeturuponData | undefined {
  if (mejiTeturuponData.id === id) {
    return mejiTeturuponData;
  }
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Meji-Teturupon
 */
export function getQuizilas(): string[] {
  return mejiTeturuponData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Meji-Teturupon
 */
export function getEbós(): MejiTeturuponEbo[] {
  return mejiTeturuponData.ebos;
}

/**
 * Get all Orixás associated with Meji-Teturupon
 */
export function getOrixas(): string[] {
  return mejiTeturuponData.orixas;
}

/**
 * Get sacred frequencies for Meji-Teturupon
 */
export function getSacredFrequencies(): string[] {
  return mejiTeturuponData.sacredFrequencies;
}

export default getData;