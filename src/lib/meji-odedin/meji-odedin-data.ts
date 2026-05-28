// Meji-Odedin Data - Ifa Divination System - Cabala Dos Caminhos
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Meji-Odedin data interface
 */
export interface MejiOdedinData {
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
  ebos: MejiOdedinEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Meji-Odedin
 */
export interface MejiOdedinEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Meji-Odedin data
 */
export const mejiOdedinData: MejiOdedinData = {
  id: 'meji-odedin-256',
  name: 'Meji-Odedin',
  namePt: 'Meji-Odedin - Duplo Destino',
  nameEn: 'Meji-Odedin - Double Destiny',
  yoruba: 'Méjì-Òdìdín',
  numero: 256,
  simbolo: '⚊⚊|⚊⚊',
  linhas: [true, true, true, true, false, false, false, false],
  significado: 'Duplo destino, reflexão, equilíbrio, mudança de direção, renovação',
  description:
    'Meji-Odedin é um Odu de grande profundidade espiritual que representa a união de dois destinos entrelaçados. Este Odu surge quando Orixáala, o criador supremo,manifesta sua sabedoria através da reflexão e do equilíbrio. Meji-Odedin ensina que cada ação carrega consequências que reverberam através do tempo, e que a verdadeira sabedoria está em compreender como os caminhos se cruzam e se transformam. Este é um Odu de renovação interior, onde o consulente é chamado a examinar suas escolhas passadas e a alinhar-se com seu destino superior.',
  keywords: ['double', 'destiny', 'reflection', 'balance', 'change', 'renewal', 'transformation', 'wisdom'],
  oduPrinciples: ['Destino', 'Reflexão', 'Equilíbrio', 'Renovação', 'Transformação', 'Sabedoria'],
  spiritualGuidance: [
    'Examine suas escolhas passadas com compaixão e sabedoria.',
    'O equilíbrio entre ação e contemplação é a chave.',
    'Cada decisão cria ondas que afetam seu destino.',
    'A renovação interior vem através da aceitação.',
    'Busque harmonia entre o que foi e o que será.',
  ],
  ritualPractices: ['Ebo de renovação', 'Oferendas a Orixáala', 'Reflexão meditativa', 'Purificação espiritual'],
  ebos: [
    {
      tipo: 'Ebo de Renovação',
      descricao: 'Sacrifício para iniciar um novo capítulo na vida',
      elementos: ['akará', 'vinho de palma', 'flores brancas', 'incenso', 'dinheiro'],
    },
    {
      tipo: 'Ebo de Equilíbrio',
      descricao: 'Sacrifício para harmonizar forças opostas',
      elementos: ['dois cocos', 'azeite de dendê', 'farinha de milho', 'velas brancas', 'água'],
    },
    {
      tipo: 'Ebo de Destino',
      descricao: 'Sacrifício para alinhar-se com o destino superior',
      elementos: ['cabrito', 'vinho de palma', 'obí', 'ekura', 'colares brancos'],
    },
  ],
  quizilas: [
    'Não agir impulsivamente em decisões importantes',
    'Não ignorar os sinais do destino',
    'Respeitar o equilíbrio entre trabalho e descanso',
    'Não temer a mudança quando ela é necessária',
    'Manter a honestidade em todas as épocas da vida',
  ],
  orixas: ['Orixáala', 'Orunmila', 'Obatala', 'Iemanjá'],
  sacredFrequencies: ['396 Hz (Libertação)', '432 Hz (Fundação)', '528 Hz (Transformação)', '639 Hz (Harmonia)'],
  elements: ['Luz', 'Água', 'Terra', 'Equilíbrio'],
  dayOfWeek: 'Domingo',
  colors: ['#FFFFFF', '#FFD700', '#87CEEB', '#E6E6FA'],
};

/**
 * Get all Meji-Odedin data
 */
export function getData(): MejiOdedinData {
  return mejiOdedinData;
}

/**
 * Get Meji-Odedin by identifier
 */
export function getMejiOdedinById(id: string): MejiOdedinData | undefined {
  if (mejiOdedinData.id === id) {
    return mejiOdedinData;
  }
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Meji-Odedin
 */
export function getQuizilas(): string[] {
  return mejiOdedinData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Meji-Odedin
 */
export function getEbós(): MejiOdedinEbo[] {
  return mejiOdedinData.ebos;
}

/**
 * Get all Orixás associated with Meji-Odedin
 */
export function getOrixas(): string[] {
  return mejiOdedinData.orixas;
}

/**
 * Get sacred frequencies for Meji-Odedin
 */
export function getSacredFrequencies(): string[] {
  return mejiOdedinData.sacredFrequencies;
}

export default getData;
