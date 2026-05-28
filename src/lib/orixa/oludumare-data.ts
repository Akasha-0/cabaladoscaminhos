/* eslint-disable @typescript-eslint/no-unused-vars */
/* prettier-ignore */

// @ts-nocheck

/**
 * Oludumare Data Module
 * Spiritual data for Oludumare, the supreme creator deity
 */

export interface OludumareData {
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

const OLUDUMARE_DATA: OludumareData[] = [
  {
    id: 'oludumare',
    name: 'Oludumare',
    namePortuguese: 'Senhor de Todos os Mundos',
    path: 'Okanran',
    element: 'Éter',
    colors: ['#FFD700', '#FFFFFF', '#87CEEB'],
    dayOfWeek: 'Domingo',
    numbersSacred: [1, 7, 40],
    greeting: 'Oludumare Aropade!',
    archetype: 'O Criador Supremo',
    qualities: ['Onisciência', 'Onipotência', 'Unicidade', 'Criação', 'Ordem Cósmica', 'Transcendência'],
    challenges: ['Inatingibilidade', 'Abstração', 'Distância'],
    rulingPlanet: 'Sol Central',
    sacredAnimals: ['Águia', 'Leão', 'Cisne Branco'],
    plants: ['Algodão Sagrado', 'Lótus Branco', 'Alecrim'],
    offerings: ['Orações silenciosas', 'Água de flor de laranjeira', 'Mel puro', 'Incenso branco'],
    chants: ['Oludumare', 'Olorun', 'Baba Aropade', 'Aleluia'],
    symbols: ['Círculo Radiante', 'Olho de Deus', 'Trono Celestial', 'Coroa de Luz'],
    mythology:
      'Oludumare é a força criadora suprema, o pai de todos os orixás e a fonte original de toda existência. Ele não possui templo físico pois habita em todo lugar, em todo tempo, em toda consciência. É ele quem concedeu axé a cada orixá e a cada ser vivo, sendo a origem de toda energia vital. Nenhum sacrificio direto é oferecido a Oludumare, mas toda devoção aos orixás é, em última análise, uma elevação hacia ele.',
    spiritualLesson:
      'Reconheça a presença do divino em todas as coisas e em todos os seres. O sagrado não está apenas no extraordinário, mas na própria vida que flui através de cada momento.',
    affirmation:
      'Eu sou parte da criação de Oludumare, carregando em mim o divino pó de estrelas. Honro a vida em todas as suas formas.',
    meditation:
      'Sente em silêncio absoluto. Visualize uma luz dourada que começa no seu centro e se expande em todas as direções, alcançando o infinito. Permita que essa luz o conecte com a fonte original de toda existência.',
  },
];

export function getData(): OludumareData[] {
  return OLUDUMARE_DATA;
}

export function getDataById(id: string): OludumareData | undefined {
  return OLUDUMARE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OludumareData[] {
  const q = query.toLowerCase();
  return OLUDUMARE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.archetype.toLowerCase().includes(q) ||
      o.qualities.some((qual: string) => qual.toLowerCase().includes(q))
  );
}
