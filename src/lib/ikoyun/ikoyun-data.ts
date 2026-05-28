// Ikoyun Data - Ancestral Wisdom System - Cabala Dos Caminhos
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Ikoyun data interface
 */
export interface IkoyunData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  yoruba: string;
  greeting: string;
  numero: number;
  simbolo: string;
  significado: string;
  description: string;
  keywords: string[];
  ancestralPrinciples: string[];
  spiritualGuidance: string[];
  ritualPractices: string[];
  ebos: IkoyunEbo[];
  taboos: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Ikoyun
 */
export interface IkoyunEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Ikoyun data
 */
export const ikoyunData: IkoyunData = {
  id: 'ikoyun-001',
  name: 'Ikoyun',
  namePt: 'Ikoyun - Guardião dos Segredos Ancestrais',
  nameEn: 'Ikoyun - Guardian of Ancestral Secrets',
  yoruba: 'Ikoyun',
  greeting: 'E ku itoju!',
  numero: 1,
  simbolo: '🔮',
  significado: 'Segredos ancestrais, sabedoria oculta, conexão com os orixás',
  description:
    'Ikoyun é o guardião dos segredos ancestrais e da sabedoria oculta. Representa a conexão profunda com os orixás e a tradição oral sagrada. Simboliza proteção, transmissão de conhecimento ancestral e开门 de caminhos espirituais. Quando Ikoyun aparece, os ancestrais desejam transmitir sabedoria e abrir portais de conexão divina.',
  keywords: ['ancestral', 'secrets', 'wisdom', 'protection', 'divine connection', 'tradition', 'mystery'],
  ancestralPrinciples: ['Ancestralidade', 'Tradição', 'Proteção', 'Sabedoria Oculta', 'Conexão Divina', 'Transmissão'],
  spiritualGuidance: [
    'Honre seus ancestrais e peça orientação aos guardiões da tradição.',
    'Os segredos sagrados serão revelados quando sua intenção for pura.',
    'A sabedoria dos orixás flui através do sangue ancestral.',
    'Proteja seus pensamentos e palavras com intenção sagrada.',
    'A conexão com o divino fortalece através da prática devocional.',
  ],
  ritualPractices: [
    'Oração aos ancestrais ao amanhecer',
    'Oferendas de alimentos sagrados',
    'Meditação em silêncio profundo',
    'Purificação com ervas protectoras',
    'Cerimônia de abertura de caminhos',
  ],
  ebos: [
    {
      tipo: 'Ebo de Proteção Ancestral',
      descricao: 'Sacrifício para invocar proteção dos ancestrais',
      elementos: ['karité', 'coco fresco', 'ervas sagradas', 'água de florais', 'velas brancas'],
    },
    {
      tipo: 'Ebo de Sabedoria',
      descricao: 'Sacrifício para abrir a mente e receber conhecimento oculto',
      elementos: ['ink (tinta sagrada)', 'papel de arroz', ' ervas de conhecimento', 'franco-incienso', 'peitoral'],
    },
    {
      tipo: 'Ebo de Conexão',
      descricao: 'Sacrifício para fortalecer a conexão com os orixás',
      elementos: ['flores brancas', 'incenso de olibano', 'mel de abelha', 'akara frito', 'coco ralado'],
    },
  ],
  taboos: [
    'Não revelar segredos sagrados a pessoas não iniciadas',
    'Respeitar a tradição oral sem modificações',
    'Manter a purity of intention during rituals',
    'Não cruzar encruzilhadas sem salutation',
    'Honrar os mais velhos e seus ensinamentos',
  ],
  orixas: ['Olodumare', 'Orunmila', 'Obatala', 'Oshein'],
  sacredFrequencies: ['432 Hz (Ancestral)', '528 Hz (Transmutação)', '639 Hz (Conexão)', '741 Hz (Revelação)'],
  elements: ['Terra', 'Água', 'Fogo', 'Ar', 'Espírito Ancestral'],
  dayOfWeek: 'Domingo',
  colors: ['#FFD700', '#C0C0C0', '#8B4513', '#FFFFFF'],
};

/**
 * Get all Ikoyun data
 */
export function getData(): IkoyunData {
  return ikoyunData;
}

/**
 * Get Ikoyun by identifier
 */
export function getIkoyunById(id: string): IkoyunData | undefined {
  if (ikoyunData.id === id) {
    return ikoyunData;
  }
  return undefined;
}

/**
 * Get all Taboos for Ikoyun
 */
export function getTaboos(): string[] {
  return ikoyunData.taboos;
}

/**
 * Get all Ebós (sacrifices) for Ikoyun
 */
export function getEbós(): IkoyunEbo[] {
  return ikoyunData.ebos;
}

/**
 * Get all Orixás associated with Ikoyun
 */
export function getOrixas(): string[] {
  return ikoyunData.orixas;
}

/**
 * Get sacred frequencies for Ikoyun
 */
export function getSacredFrequencies(): string[] {
  return ikoyunData.sacredFrequencies;
}

export default getData;