 
/* prettier-ignore */

// @ts-nocheck
// SKIP_LINT

/**
 * Baba Data Module
 * Spiritual data for Baba, Orixá of fatherhood, wisdom, and ancestral authority
 */

export interface BabaData {
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
  sacredGeometry: string[];
}

const BABA_DATA: BabaData[] = [
  {
    id: 'baba',
    name: 'Baba',
    namePortuguese: 'Pai Ancestral',
    path: 'Opolo',
    element: 'Ar e Terra',
    colors: ['#FFFFFF', '#F5F5DC', '#8B4513'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 8, 12],
    greeting: 'Baba Ewu!',
    archetype: 'O Patriarca',
    qualities: ['Sabedoria', 'Autoridade', 'Proteção', 'Disciplina', 'Tradição', 'Guia'],
    challenges: ['Rigidez', 'Distância emocional', 'Excesso de controle'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Leão', 'Cavalo branco', 'Águia'],
    plants: ['Algodoeiro', 'Moringa', 'Pau-brasil'],
    offerings: ['Akassá (farinha)', 'Vinho de palma', 'Alimentos brancos', 'Mel'],
    chants: ['Baba', 'Olorun', 'Orun'],
    symbols: ['Bengala', 'Coroa branca', 'Trono'],
    mythology:
      'Baba representa a figura paterna ancestral, o guia que desceu do céu para iluminar o caminho dos mortais. Assim como Oludumare é o pai celestial de todos os orixás, Baba personifica a autoridade sábia e a tradição que conecta gerações. Ele é invocado para obter orientação nos momentos de dúvida e para fortalecer laços familiares.',
    spiritualLesson:
      'A verdadeira autoridade vem da sabedoria compartilhada, não do medo imposto. O pai interior guia com luz, não com sombras.',
    affirmation:
      'Eu Honro a sabedoria dos meus ancestrais e guio com amor e discernimento. Baba ilumina meu caminho.',
    meditation:
      'Sente-se em posição de meditação. Visualize uma luz branca emanando do topo da sua cabeça, descendo pelo seu corpo como uma corrente de ouro. Essa luz representa a sabedoria ancestral de Baba fluindo através de você, conectando-o com todas as gerações passadas e futuras. Permita que essa energia traga clareza e propósito.',
    sacredGeometry: ['Círculo', 'Triângulo ascendente', 'Hexágono'],
  },
];

export function getData(): BabaData[] {
  return BABA_DATA;
}

function getDataById(id: string): BabaData | undefined {
  return BABA_DATA.find((b) => b.id === id);
}

function searchData(query: string): BabaData[] {
  const lowerQuery = query.toLowerCase();
  return BABA_DATA.filter(
    (b) =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.namePortuguese.toLowerCase().includes(lowerQuery) ||
      b.archetype.toLowerCase().includes(lowerQuery) ||
      b.qualities.some((q: string) => q.toLowerCase().includes(lowerQuery))
  );
}

function getBabaByDay(day: string): BabaData[] {
  return BABA_DATA.filter((b) => b.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getBabaByElement(element: string): BabaData[] {
  return BABA_DATA.filter((b) => b.element.toLowerCase().includes(element.toLowerCase()));
}
