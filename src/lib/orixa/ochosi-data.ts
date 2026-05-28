
// @ts-nocheck
// SKIP_LINT

/**
 * Ochosi Data Module
 * Spiritual data for Ochosi, the orixá of hunting, fishing, and forest wisdom
 */

export interface OchosiData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  huntingRituals: string[];
  fishingRituals: string[];
  forestWisdom: string[];
}

export interface HuntingPractice {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
}

export interface FishingPractice {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
}

const OCHOSI_DATA: OchosiData = {
  id: 'ochosi',
  name: 'Ochosi',
  namePortuguese: 'Caçador das Matas e dos Mares',
  path: 'Oxosse',
  element: 'Floresta e Água',
  colors: ['Verde', 'Azul', 'Marrom'],
  dayOfWeek: 'Terça-feira',
  numbersSacred: [3, 7, 9, 21],
  greeting: 'Epareme',
  archetype: 'Mestre da Caça',
  qualities: [
    'Paciência na espera',
    'Visão clara',
    'Determinação firme',
    'Independência',
    'Olhar perspicaz',
    'Sabedoria da floresta',
    'Conexão com os animais',
    'Esperteza',
    'Precisão',
    'Conhecimento do oculto',
  ],
  challenges: [
    'Impaciência nas relações',
    'Tendência à solidão',
    'Ceticismo excessivo',
    'Dificuldade em confiar',
    'Rigidez de pensamento',
  ],
  rulingPlanet: 'Júpiter',
  sacredAnimals: ['Cachorro', 'Veado', 'Falcão', 'Gavião'],
  plants: ['Alho', 'Pimenta', 'Guiné', 'Barbatimão', 'Copaíba', 'Ipê'],
  offerings: ['Cachorro', 'Mel', 'Fumo', 'Farinha de mandioca', 'Água'],
  chants: ['Ochosi', 'Caça', 'Visão', 'Mata'],
  symbols: ['Arco e flecha', 'Rede de pescar', 'Cão de caça', 'Mala'],
  mythology:
    'Ochosi é o orixá caçador que vive nas matas e conhece todos os segredos das presas e dos mares. Vive emCompanhia de Oxosse e Obaluaye, sendo irmãos na caminhada. Foi fundado em Ifé e espalhado pelo mundo através de suas setas. Cada flecha disparada por Ochosi carrega o destino de seus filhos, guiando-os sempre para a visão clara da vida. É ele quem abre os caminhos e revela o que está oculto na escuridão.',
  spiritualLesson: 'A caça espiritual é a busca do autoconhecimento através da visão clara e da paciência',
  affirmation: 'Eu abro meu olhar para a visão clara de Ochosi, alcançando meus objetivos com determinação e sabedoria',
  meditation: 'Percorra a floresta com os olhos de Ochosi, vendo além das apparências e encontrando seu caminho',
  huntingRituals: [
    'Desapeamento de Ochosi',
    'Acendimento de dias ímpares',
    'Oferecer mel junto ao arco',
    'Puxar sete flechas no iaô',
    'Amarrar一块 de ipê no pulso',
  ],
  fishingRituals: [
    'Lançamento de redes em aguas paradas',
    'Pescar com linha de algodão',
    'Oferecer fumo às aguas',
    'Pedir licença aos peixes',
  ],
  forestWisdom: [
    'Conhecer as trilhas escondidas',
    'Ler os sinais do animal',
    'Entender o comportamento da presa',
    'Ter paciência para a espera',
    'Saber cuándo avançar e cuándo recuar',
  ],
};

export function getData(): OchosiData {
  return OCHOSI_DATA;
}

export function getDataById(id: string): OchosiData | undefined {
  return id === 'ochosi' ? OCHOSI_DATA : undefined;
}

export function getHuntingRituals(): string[] {
  return OCHOSI_DATA.huntingRituals;
}

export function getFishingRituals(): string[] {
  return OCHOSI_DATA.fishingRituals;
}

export function getForestWisdom(): string[] {
  return OCHOSI_DATA.forestWisdom;
}

export function searchOchosi(query: string): OchosiData | undefined {
  const q = query.toLowerCase();
  if (OCHOSI_DATA.name.toLowerCase().includes(q) || OCHOSI_DATA.id.includes(q)) {
    return OCHOSI_DATA;
  }
  return undefined;
}

export function getOchosiByDay(day: string): OchosiData | undefined {
  return OCHOSI_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase())
    ? OCHOSI_DATA
    : undefined;
}

export function getOchosiByElement(element: string): OchosiData | undefined {
  return OCHOSI_DATA.element.toLowerCase().includes(element.toLowerCase())
    ? OCHOSI_DATA
    : undefined;
}
