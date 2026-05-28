// Meji-Odi Data - Ifa Divination System - Cabala Dos Caminhos
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Meji-Odi data interface
 */
export interface MejiOdiData {
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
  ebos: MejiOdiEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Meji-Odi
 */
export interface MejiOdiEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Meji-Odi data
 */
export const mejiOdiData: MejiOdiData = {
  id: 'meji-odi-255',
  name: 'Meji-Odi',
  namePt: 'Meji-Odi - Destino Invertido',
  nameEn: 'Meji-Odi - Inverted Destiny',
  yoruba: 'Méjì-Òdì',
  numero: 255,
  simbolo: '⚊⚊|⚊⚋',
  linhas: [true, true, true, true, false, false, false, true],
  significado: 'Destino invertido, adversidade, luta, proteção, perseverança',
  description:
    'Meji-Odi é um Odu de grande importância espiritual que representa os desafios e adversidades que devem ser enfrentados para alcançar a verdadeira iluminação. Este Odu surge quando Orixáala manifesta sua vontade através das dificuldades, ensinando que a perseverança é a chave para a transformação. Meji-Odi lembra que toda luta carrega consigo uma oportunidade de crescimento e que a proteção divina está presente mesmo nos momentos mais sombrios. É um Odu de resistência e renovação através da superação.',
  keywords: ['inverted', 'adversity', 'struggle', 'protection', 'perseverance', 'resistance', 'overcoming', 'strength'],
  oduPrinciples: ['Adversidade', 'Proteção', 'Perseverança', 'Luta', 'Resistência', 'Superação'],
  spiritualGuidance: [
    'A adversidade é um professor poderoso - aprenda com ela.',
    'Sua força interior é maior que qualquer obstáculo.',
    'A proteção divina acompanha sua jornada.',
    'Cada batalha enfrentada traz sabedoria.',
    'A perseverança transforma desafios em conquistas.',
  ],
  ritualPractices: ['Ebo de proteção', 'Oferendas de resistência', 'Purificação contra energias negativas', 'Ritual de força'],
  ebos: [
    {
      tipo: 'Ebo de Proteção',
      descricao: 'Sacrifício para fortalecer a proteção espiritual',
      elementos: ['ekura', 'vinho de palma', 'cabrito branco', 'incenso de elemi', 'azeite de dendê'],
    },
    {
      tipo: 'Ebo de Resistência',
      descricao: 'Sacrifício para aumentar a capacidade de superar desafios',
      elementos: ['obí', 'ogun', 'farinha de arroz', 'velas vermelhas', 'água de chuva'],
    },
    {
      tipo: 'Ebo de Renovação',
      descricao: 'Sacrifício para transformar adversidade em oportunidade',
      elementos: ['akará', 'mel', 'flores amarelas', 'colares de contas', 'dinheiro'],
    },
  ],
  quizilas: [
    'Não desistir diante das dificuldades',
    'Não ignorar os avisos de Orixá',
    'Respeitar a proteção oferecida',
    'Não subestimar o poder da perseverança',
    'Manter a fé nos momentos de prova',
  ],
  orixas: ['Ogun', 'Sango', 'Exu', 'Orixáala'],
  sacredFrequencies: ['174 Hz (Força)', '285 Hz (Proteção)', '396 Hz (Libertação)', '417 Hz (Mudança)'],
  elements: ['Fogo', 'Terra', 'Ferro', 'Resistência'],
  dayOfWeek: 'Terça-feira',
  colors: ['#FF4500', '#FFD700', '#8B0000', '#FFA500'],
};

/**
 * Get all Meji-Odi data
 */
export function getData(): MejiOdiData {
  return mejiOdiData;
}

/**
 * Get Meji-Odi by identifier
 */
export function getMejiOdiById(id: string): MejiOdiData | undefined {
  if (id === mejiOdiData.id || id === 'meji-odi' || id === 'Meji-Odi') {
    return mejiOdiData;
  }
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Meji-Odi
 */
export function getQuizilas(): string[] {
  return mejiOdiData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Meji-Odi
 */
export function getEbós(): MejiOdiEbo[] {
  return mejiOdiData.ebos;
}

/**
 * Get all Orixás associated with Meji-Odi
 */
export function getOrixas(): string[] {
  return mejiOdiData.orixas;
}

/**
 * Get sacred frequencies for Meji-Odi
 */
export function getSacredFrequencies(): string[] {
  return mejiOdiData.sacredFrequencies;
}

export default getData;
