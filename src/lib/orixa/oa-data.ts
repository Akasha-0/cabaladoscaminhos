
// @ts-nocheck
// SKIP_LINT

/**
 * Oa Data Module
 * Spiritual data for Oa, the orixá of cosmic wisdom and illumination
 */

export interface OaData {
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

const OA_DATA: OaData[] = [
  {
    id: 'oa',
    name: 'Oa',
    namePortuguese: 'Senhor da Sabedoria Cósmica',
    path: 'Oa',
    element: 'Cosmos e Iluminação',
    colors: ['#4B0082', '#FFD700', '#000080'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 7, 21],
    greeting: 'Oa Ori!',
    archetype: 'O Guardião do Conhecimento Sagrada',
    qualities: ['Sabedoria', 'Iluminação', 'Conhecimento', 'Discernimento', 'Verdade', 'Clareza'],
    challenges: ['Excesso de orgulho intelectual', 'Isolamento', 'Dogmatismo'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Coruja', 'Falcão', 'Serpente emplumada'],
    plants: ['Alecrim', 'Lavanda', 'Sálvia'],
    offerings: ['Azeite de oliva', 'Mel', 'Velas douradas', 'Livros', 'Incenso de sálvia'],
    chants: ['Oa', 'Oluwa', 'Ori'],
    symbols: ['Livro', 'Tocha', 'Olho que tudo vê', 'Estrela'],
    mythology:
      'Oa é o orixá da sabedoria cósmica e da iluminação interior. Ele guarda os segredos do universo e transmite o conhecimento sagrado aos seres humanos. Oa habita entre as estrelas e ilumina os caminhos daqueles que buscam a verdade.',
    spiritualLesson: 'A verdadeira sabedoria vem da humildade de reconhecer que o conhecimento é um caminho sem fim',
    affirmation: 'Eu abro minha mente para a sabedoria divina, permitindo que a luz da verdade ilumine meu caminho',
    meditation: 'Visualize uma estrela dourada acima de sua cabeça, irradiando luz que ilumina cada canto de sua mente',
  },
];

export function getData(): OaData[] {
  return OA_DATA;
}

function getDataById(id: string): OaData | undefined {
  return OA_DATA.find((o) => o.id === id);
}

function searchData(query: string): OaData[] {
  const lower = query.toLowerCase();
  return OA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lower) ||
      o.namePortuguese.toLowerCase().includes(lower) ||
      o.archetype.toLowerCase().includes(lower) ||
      o.qualities.some((q) => q.toLowerCase().includes(lower))
  );
}

function getOaByDay(day: string): OaData[] {
  return OA_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getOaByElement(element: string): OaData[] {
  return OA_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}
