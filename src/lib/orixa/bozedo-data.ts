/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Bozedo Data Module
 * Spiritual data for Bozedo, the spirit of crossroads and transformation
 */

export interface BozedoData {
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

const BOZEDO_DATA: BozedoData[] = [
  {
    id: 'bozedo',
    name: 'Bozedo',
    namePortuguese: 'Senhor dos Caminhos',
    path: 'Ogbe',
    element: 'Transição',
    colors: ['#8B0000', '#000000', '#FFD700'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [3, 7, 15],
    greeting: 'Bozedo Laroyê!',
    archetype: 'O Guardião dos Cruzamentos',
    qualities: [
      'Transformação',
      'Liberdade',
      'Iniciativa',
      'Adaptabilidade',
      'Desbloqueio',
      'Coragem',
      'Movimento',
      'Proteção nos caminhos',
      'Superação de obstáculos'
    ],
    challenges: [
      'Impaciência',
      'Irreflexão',
      'Infidelidade',
      'Inconstância',
      'Manipulação'
    ],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Cavalo', 'Cão', 'Corvo'],
    plants: ['Arruda', 'Guiné', 'Alecrim', 'Pau-brasil'],
    ofertas: ['Cigarro', 'Aguardente', 'Pimenta', 'Carvão', 'Velas vermelhas e pretas', 'Dinheiro'],
    chants: ['Bozedo', 'Laroyê', 'Ogunhê'],
    symbols: ['Cruz', 'Faca', 'Cajado', 'Charuto', 'Garrafa'],
    mythology:
      'Bozedo é o espírito dos cruzamentos e das encruzilhadas, aquele que abre os caminhos fechados e conduz os viajantes pelas sendas mais seguras. Ele é o guardião das passagens, o mestre das transformações e o protetor de todos aqueles que caminham entre mundos. Bozedo habita nas encruzilhadas onde as vidas se cruzam, nos becos sem saída que se tornam passagens secretas, e nas noites escuras onde a luz precisa emergir. Ele é quem limpa o caminho para que novos destinos possam ser alcançados,拿走ando obstáculos e abrindo portas que pareciam seladas para sempre.',
    spiritualLesson: 'Em cada encruzilhada há uma oportunidade de transformação e renascimento',
    affirmation: 'Eu invoco Bozedo para abrir os caminhos fechados e conduzir meus passos para minha verdadeira destino',
    meditation: 'Visualize-se em uma encruzilhada iluminada por velas vermelhas, onde Bozedo abre um caminho de luz diante de você enquanto oferece proteção em todas as direções'
  },
  {
    id: 'bozedo-treme-terra',
    name: 'Bozedo Treme-Terra',
    namePortuguese: 'Senhor do Tremor e Movimento',
    path: 'Ogbe',
    element: 'Terra e Fogo',
    colors: ['#8B4513', '#FF4500', '#000000'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [5, 9, 21],
    greeting: 'Treme-Terra!',
    archetype: 'O Deus da Transformação Súbita',
    qualities: ['Poder', 'Força', 'Mudança radical', 'Despertar', 'Renovação', 'Destruição criativa', 'Movimento sísmico'],
    challenges: ['Destruição descontrolada', 'Violência', 'Revolução sem propósito', 'Colapso emocional'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Touro', 'Búfalo', 'Tatu'],
    plants: ['Mandacaru', 'Xique-xique', 'Caraíba'],
    ofertas: ['Cachação', 'Café passado', 'Fogo', 'Pedras', 'Sal grosso', 'Velas laranja e vermelha'],
    chants: ['Treme', 'Treme-Terra', 'Ogundá'],
    symbols: ['Martelo', 'Enxada', 'Machado', 'Pedras empilhadas'],
    mythology:
      'Bozedo Treme-Terra é a face poderosa de Bozedo que faz a terra tremer e os alicerces vacilar. Ele é o espírito da transformação radical que destrói para reconstruir, que abala para edificar sobre bases mais sólidas. Quando os caminhos se mostram impossíveis, Treme-Terra abre novos rumos através do poder bruto da mudança. Ele ensina que algumas estruturas precisam ruir para que outras possam nascer.',
    spiritualLesson: 'A destruição não é o fim, mas o recomeço necessário para um novo começo',
    affirmation: 'Eu Permito que Treme-Terra sacuda minha vida, derrubando o que precisa ser removido para meu crescimento',
    meditation: 'Sinta a força da terra abaixo de você, deixe-a tremer e sacudir tudo que não serve mais, enquanto novas bases se formam para sustenta-lo'
  }
];

export function getData(): BozedoData[] {
  return BOZEDO_DATA;
}

export function getDataById(id: string): BozedoData | undefined {
  return BOZEDO_DATA.find((e) => e.id === id);
}

export function searchData(query: string): BozedoData[] {
  const lowerQuery = query.toLowerCase();
  return BOZEDO_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.namePortuguese.toLowerCase().includes(lowerQuery) ||
      e.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      e.element.toLowerCase().includes(lowerQuery) ||
      e.mythology.toLowerCase().includes(lowerQuery)
  );
}

export function getBozedoByDay(day: string): BozedoData[] {
  return BOZEDO_DATA.filter((e) => e.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getBozedoByElement(element: string): BozedoData[] {
  return BOZEDO_DATA.filter((e) => e.element.toLowerCase().includes(element.toLowerCase()));
}