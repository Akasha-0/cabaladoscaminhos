/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

/**
 * Tevodo Data Module
 * Spiritual data for Tevodo, the orixá of hunting, warfare and loyal companions
 */

export interface TevodoData {
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

const TEVODO_DATA: TevodoData[] = [
  {
    id: 'tevodo',
    name: 'Tevodo',
    namePortuguese: 'Senhor da Caça',
    path: 'Ogunda',
    element: 'Fogo e Ar',
    colors: ['#8B0000', '#2F4F4F'],
    dayOfWeek: 'Domingo',
    numbersSacred: [4, 8, 12],
    greeting: 'Olorun!',
    archetype: 'O Caçador Leal',
    qualities: ['Lealdade', 'Coragem', 'Persistência', 'Instinto', 'Determinação', 'Proteção'],
    challenges: ['Agitação', 'Impaciência', 'Competitividade'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cachorro', 'Raposa', 'Veado'],
    plants: ['Boldo', 'Eucalipto', 'Alecrim'],
    offerings: ['Carne assada', 'Fígado', 'Cerveja escura', 'Fumo de palha'],
    chants: ['Olorun', 'Tevodo', 'Eminé'],
    symbols: ['Arco e flecha', 'Foice de caça', 'Peles de animais'],
    mythology:
      'Tevodo é o grande caçador dos orixás, companheiro de Oxum e guardião das matas. Ele lidera as perseguições e nunca abandona sua presa ou sua matilha.',
    spiritualLesson: 'A verdadeira força está em perseguir nossos objetivos com persistência e lealdade aos que nos acompanham',
    affirmation: 'Eu persigo meus sonhos com coragem inabalável e mantenho lealdade àqueles que caminham comigo',
    meditation: 'Visualize-se atravessando a floresta com firme propósito e companheiros leais ao seu lado',
  },
];

export function getData(): TevodoData[] {
  return TEVODO_DATA;
}

export function getDataById(id: string): TevodoData | undefined {
  return TEVODO_DATA.find((t) => t.id === id);
}

export function searchData(query: string): TevodoData[] {
  const lowerQuery = query.toLowerCase();
  return TEVODO_DATA.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.namePortuguese.toLowerCase().includes(lowerQuery) ||
      t.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      t.element.toLowerCase().includes(lowerQuery) ||
      t.mythology.toLowerCase().includes(lowerQuery)
  );
}
