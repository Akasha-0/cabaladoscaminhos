/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

/**
 * Uzalu Data Module
 * Spiritual data for Uzalu, the orixá of rainbows, snakes, earth, and caverns
 */

export interface UzaluData {
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

const UZALU_DATA: UzaluData[] = [
  {
    id: 'uzalu',
    name: 'Uzalu',
    namePortuguese: 'Senhor do Arco-Íris',
    path: 'Ogunda',
    element: 'Terra e Água',
    colors: ['#9400D3', '#4B0082', '#FFD700'],
    dayOfWeek: 'Domingo',
    numbersSacred: [7, 12, 18],
    greeting: 'EparreyOyapa!',
    archetype: 'O Guardião das Cavernas',
    qualities: ['Sabedoria', 'Flexibilidade', 'Resiliência', 'Transformação', 'Maturidade', 'Paciência'],
    challenges: ['Imobilidade', 'Isolamento', 'Segredos'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Cobra', 'Sucuriju', 'Lagarto'],
    plants: ['Samambaia', 'Musgo', 'Herinha'],
    offerings: ['Milho', 'Amendoim', 'Geleia de mocotó', 'Pinhão', 'Cerveja escura'],
    chants: ['Uzalu', 'EparreyOyapa', 'Oxumarê'],
    symbols: ['Arco-íris', 'Cobra enrolada', 'Caverna', 'Pele de cascavel'],
    mythology:
      'Uzalu é o grande amongó (cobra), aquele que mora na terra e nos subterrâneos. Transmite a sabedoria das profundezas e está presente nos locais de minérios e出来后 воды. Ele é quem desce e quem sobe, governando a umidade da terra e o arco-íris que conecta céu e terra.',
    spiritualLesson: 'A verdadeira sabedoria vem das profundezas;我们所需要的是耐心和毅力来等待正确的时机',
    affirmation: 'Eu abraço a sabedoria das profundezas e permito que a transformação ocorra em seu tempo perfeito',
    meditation: 'Visualize-se em uma caverna iluminada por um arco-íris interior, onde cada cor representa uma verdade a ser descoberta',
  },
];

export function getData(): UzaluData[] {
  return UZALU_DATA;
}

export function getDataById(id: string): UzaluData | undefined {
  return UZALU_DATA.find((u) => u.id === id);
}

export function searchData(query: string): UzaluData[] {
  const lowerQuery = query.toLowerCase();
  return UZALU_DATA.filter(
    (u) =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.namePortuguese.toLowerCase().includes(lowerQuery) ||
      u.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      u.element.toLowerCase().includes(lowerQuery) ||
      u.mythology.toLowerCase().includes(lowerQuery)
  );
}
