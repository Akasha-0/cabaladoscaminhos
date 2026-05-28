// Meji-Odedin-Meji Data - Ifa Divination System - Cabala Dos Caminhos
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Meji-Odedin-Meji data interface
 */
export interface MejiOdedinMejiData {
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
  ebos: MejiOdedinMejiEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Meji-Odedin-Meji
 */
export interface MejiOdedinMejiEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Meji-Odedin-Meji data
 */
export const mejiOdedinMejiData: MejiOdedinMejiData = {
  id: 'meji-odedin-meji-256',
  name: 'Meji-Odedin-Meji',
  namePt: 'Meji-Odedin-Meji - Duplo Destino Refletido',
  nameEn: 'Meji-Odedin-Meji - Reflected Double Destiny',
  yoruba: 'Méjì-Òdìdín-Méjì',
  numero: 256,
  simbolo: '⚊⚊|⚊⚊ + ⚊⚊|⚊⚊',
  linhas: [true, true, true, true, false, false, false, false, true, true, true, true, false, false, false, false],
  significado:
    'Duplo destino refletido, espelho do destino, auto-reflexão, equilíbrio cósmico, karma ancestral',
  description:
    'Meji-Odedin-Meji é um Odu de profunda auto-reflexão e equilíbrio cósmico. Este Odu surge quando a energia de Odu Meji se manifesta em sua forma mais completa e reflexiva. A combinação de Meji com Odedin cria um espelho espiritual onde o consulente vê a si mesmo através das lentes do destino. Este é um Odu de despertar interior, onde as ações passadas são reveladas em sua verdadeira luz. Meji-Odedin-Meji ensina que o destino não é fixo, mas uma dança contínua entre escolha e consequência, livre-arbítrio e necessidade cósmica.',
  keywords: [
    'reflected',
    'double',
    'destiny',
    'mirror',
    'self-reflection',
    'cosmic',
    'balance',
    'karmic',
    'awakening',
  ],
  oduPrinciples: ['Destino Refletido', 'Auto-reflexão', 'Equilíbrio Cósmico', 'Karma', 'Despertar Interior', 'Sabedoria Espelhada'],
  spiritualGuidance: [
    'Olhe para o espelho do seu destino com coragem e compaixão.',
    'Suas ações passadas são professores, não juizes.',
    'O equilíbrio interno reflete-se no mundo externo.',
    'Cada escolha presente cria o destino futuro.',
    'A sabedoria vem quando você vê a si mesmo com clareza.',
  ],
  ritualPractices: ['Ebo de espelhamento', 'Oferendas a Orixáala', 'Meditação reflexiva', 'Purificação ancestral'],
  ebos: [
    {
      tipo: 'Ebo de Espelhamento',
      descricao: 'Sacrifício para revelar a verdade interior e alinhar o destino',
      elementos: ['dois espelhos', 'akará', 'vinho de palma', 'flores brancas', 'incenso de olibanum'],
    },
    {
      tipo: 'Ebo de Equilíbrio Cósmico',
      descricao: 'Sacrifício para harmonizar as forças do destino',
      elementos: ['azeite de dendê', 'farinha de arroz', 'velas douradas', 'ouro', 'água de flor de laranjeira'],
    },
    {
      tipo: 'Ebo Ancestral',
      descricao: 'Sacrifício para reconciliar o karma familiar',
      elementos: ['cabrito branco', 'vinho de palma', 'obí', 'ekura', 'roupas brancas', 'colares de contas'],
    },
  ],
  quizilas: [
    'Não fugir da verdade sobre si mesmo',
    'Não ignorar os padrões repetitivos da vida',
    'Respeitar o equilíbrio entre dar e receber',
    'Não julgar os outros sem primeiro examinar a si mesmo',
    'Manter a integridade em todas as reflexões',
  ],
  orixas: ['Orixáala', 'Orunmila', 'Obatala', 'Iemanjá', 'Oxum'],
  sacredFrequencies: [
    '396 Hz (Libertação do Karma)',
    '432 Hz (Fundação Universal)',
    '528 Hz (Transformação)',
    '639 Hz (Harmonia Relacional)',
    '741 Hz (Despertar Espiritual)',
  ],
  elements: ['Luz', 'Água', 'Terra', 'Espelho', 'Equilíbrio'],
  dayOfWeek: 'Domingo',
  colors: ['#FFFFFF', '#FFD700', '#C0C0C0', '#87CEEB', '#E6E6FA'],
};

/**
 * Get all Meji-Odedin-Meji data
 */
export function getData(): MejiOdedinMejiData {
  return mejiOdedinMejiData;
}

/**
 * Get Meji-Odedin-Meji by identifier
 */
export function getMejiOdedinMejiById(id: string): MejiOdedinMejiData | undefined {
  if (mejiOdedinMejiData.id === id) {
    return mejiOdedinMejiData;
  }
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Meji-Odedin-Meji
 */
export function getQuizilas(): string[] {
  return mejiOdedinMejiData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Meji-Odedin-Meji
 */
export function getEbós(): MejiOdedinMejiEbo[] {
  return mejiOdedinMejiData.ebos;
}

/**
 * Get all Orixás associated with Meji-Odedin-Meji
 */
export function getOrixas(): string[] {
  return mejiOdedinMejiData.orixas;
}

/**
 * Get sacred frequencies for Meji-Odedin-Meji
 */
export function getSacredFrequencies(): string[] {
  return mejiOdedinMejiData.sacredFrequencies;
}

export default getData;