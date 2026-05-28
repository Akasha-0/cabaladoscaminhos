 
// @ts-nocheck

/**
 * Elegba Data Module
 * Spiritual data for Elegba, the orixá of crossroads and destiny
 */

export interface ElegbaData {
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
}

const ELEGBA_DATA: ElegbaData[] = [
  {
    id: 'elegba',
    name: 'Elegba',
    namePortuguese: 'Senhor dos Caminhos',
    path: 'Egun',
    element: 'Fogo e Terra',
    colors: ['#000000', '#FF0000'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [3, 7, 21],
    greeting: 'Eo!',
    archetype: 'O Abridor de Caminhos',
    qualities: ['Comunicação', 'Destino', 'Flexibilidade', 'Iniciativa', 'Energia', 'Confiança'],
    challenges: ['Manipulação', 'Rebeldia', 'Impaciência'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Cão', 'Bode'],
    plants: ['Pau-brasil', 'Arruda'],
    offerings: ['Azeite de dendê', 'Maçã', 'Fumo', 'Dinheiro', 'Pimenta'],
    chants: ['Eo', 'Elegba', 'Laroyê'],
    symbols: ['Chave', 'CADEIRA de três pés', 'Argolas'],
    mythology:
      'Elegba é o primeiro orixá a ser invocado em qualquer ritual. Ele abre os caminhos e guarda as encruzilhadas, sendo mensageiro entre os mundos.',
    spiritualLesson: 'Cada caminho oferece uma oportunidade de crescimento e transformação',
    affirmation: 'Eu Abro novos caminhos com coragem e destruo obstáculos que bloqueiam meu destino',
    meditation: 'Visualize uma encruzilhada iluminada, onde cada direção oferece possibilidades infinitas',
  },
  {
    id: 'elegba-ona',
    name: 'Elegba Ona',
    namePortuguese: 'Elegba das Estradas',
    path: 'Egun',
    element: 'Terra',
    colors: ['#8B4513', '#000000'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 9],
    greeting: 'Eo!',
    archetype: 'O Guardião das Vias',
    qualities: ['Determinação', 'Conexão', 'Movimento', 'Propósito', 'Vitalidade', 'Determinismo'],
    challenges: ['Teimosia', 'Inflexibilidade', 'Medo do novo'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Burro', 'Caracol'],
    plants: ['Palmeira', 'Girassol'],
    offerings: ['Amendoim', 'Coco', 'Melancia', 'Fio vermelho'],
    chants: ['Eo Ona', 'Kaka'],
    symbols: ['Estrada', 'Fio de contas', 'Pedras'],
    mythology:
      'Elegba Ona é a manifestação que governa todas as estradas e caminhos. Ele determina quais destinos serão seguidos.',
    spiritualLesson: 'O caminho certo se revela quando temos coragem de percorrê-lo',
    affirmation: 'Eu sigo meu destino com firmeza, sabendo que cada passo me aproxima da minha verdade',
    meditation: 'Sinta seus pés firmes no chão enquanto trilha seu caminho com propósito e clareza',
  },
];

export function getData(): ElegbaData[] {
  return ELEGBA_DATA;
}

export function getDataById(id: string): ElegbaData | undefined {
  return ELEGBA_DATA.find((e) => e.id === id);
}

export function searchData(query: string): ElegbaData[] {
  const lowerQuery = query.toLowerCase();
  return ELEGBA_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.namePortuguese.toLowerCase().includes(lowerQuery) ||
      e.archetype.toLowerCase().includes(lowerQuery) ||
      e.qualities.some((q) => q.toLowerCase().includes(lowerQuery))
  );
}