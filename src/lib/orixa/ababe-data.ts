 
/* prettier-ignore */

// @ts-nocheck

/**
 * Ababe Data Module
 * Spiritual data for Ababe, Orixá of transformation and mystery
 */

export interface AbabeData {
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
  transformationStages: string[];
  sacredGeometry: string[];
}

const ABABE_DATA: AbabeData[] = [
  {
    id: 'ababe',
    name: 'Ababe',
    namePortuguese: 'Senhor da Transformação',
    path: 'Mansu',
    element: 'Fogo e Água',
    colors: ['#800080', '#4B0082', '#FFD700'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 12],
    greeting: 'Ababe Ora!',
    archetype: 'O Transformador Misterioso',
    qualities: ['Misterio', 'Transformação', 'Dualidade', 'Metamorfose', 'Recriação', 'Transição'],
    challenges: ['Incerteza', 'Medo da mudança', 'Instabilidade'],
    rulingPlanet: 'Plutão',
    sacredAnimals: ['Cobra', 'Borboleta', 'Fênix'],
    plants: ['Mandrágora', 'Pinhão Roxo', 'Guiné'],
    offerings: ['Velas roxas', 'Cera negra', 'Água de味道', 'Fumo de rolo'],
    chants: ['Ababe', 'Mansu', 'Ora Ababe', 'Transformação'],
    symbols: ['Cobra mordendo o próprio rabo', 'Borboleta', 'Espiral', 'Lua Nova'],
    mythology:
      'Ababe é o orixá que habita o limiar entre a morte e o renascimento. Ele guarda os portais de transformação, guiando as almas através das metamorfoses necessárias para a evolução espiritual. É ele quem transforma o chumbo em ouro e a dor em sabedoria.',
    spiritualLesson:
      'A verdadeira transformação exige a morte simbólica do antigo para que o novo possa nascer. Abrace a mudança como parte natural do caminho.',
    affirmation:
      'Eu me transformo a cada momento, shedding o que não mais me serve e abraçando minha evolução com coragem e confiança.',
    meditation:
      'Visualize-se em uma espiral ascendente de luz, onde cada volta representa uma etapa de sua transformação. Permita que Ababe ilumine o caminho da sua metamorfose.',
    transformationStages: [
      'Dissolução - Soltar o antigo',
      'Caos - Abrir-se ao desconhecido',
      'Reorganização - Recompor a essência',
      'Renascimento - Emergir transformado',
    ],
    sacredGeometry: ['Espiral Dupla', 'Círculo Serpentino', 'Hexagrama Invertido'],
  },
];

export function getData(): AbabeData[] {
  return ABABE_DATA;
}

export function getDataById(id: string): AbabeData | undefined {
  return ABABE_DATA.find((a) => a.id === id);
}

export function searchData(query: string): AbabeData[] {
  const lowerQuery = query.toLowerCase();
  return ABABE_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.namePortuguese.toLowerCase().includes(lowerQuery) ||
      a.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      a.element.toLowerCase().includes(lowerQuery) ||
      a.mythology.toLowerCase().includes(lowerQuery)
  );
}

export function getAbabeByDay(day: string): AbabeData[] {
  return ABABE_DATA.filter((a) => a.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getAbabeByElement(element: string): AbabeData[] {
  return ABABE_DATA.filter((a) => a.element.toLowerCase().includes(element.toLowerCase()));
}
