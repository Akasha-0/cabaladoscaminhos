// @ts-nocheck
// SKIP_LINT

/**
 * Yemoja Data Module
 * Spiritual data for Yemoja, the orixá of the sea, maternity, and generation
 */

export interface YemojaData {
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

const YEMOJA_DATA: YemojaData[] = [
  {
    id: 'yemoja-01',
    name: 'Yemoja',
    namePortuguese: 'Iemanjá',
    path: 'src/lib/orixa/yemoja-data.ts',
    element: 'água',
    colors: ['azul escuro', 'branco', 'azul celeste', 'prata'],
    dayOfWeek: 'sábado',
    numbersSacred: [2, 7, 9, 15],
    greeting: 'Odoyá!',
    archetype: 'A Mãe Divina / A Rainha das Águas',
    qualities: [
      'maternidade',
      'proteção',
      'intuição profunda',
      'geração',
      'fluidez emocional',
      'sabedoria ancestral',
      'compassão',
      'nutrição espiritual',
    ],
    challenges: [
      'excesso de emocionalidade',
      'dificuldade em soltar',
      'tendência ao martyr',
      'superproteção',
    ],
    rulingPlanet: 'Lua/Netuno',
    sacredAnimals: ['peixe', 'baleia', 'tartaruga'],
    plants: ['alcaparra', 'colônia', 'flor de lótus'],
    offerings: ['canjica branca', 'flores azuis', 'água do mar', 'vela branca', 'perfume'],
    chants: ['Odoyá Yemanjá!', 'Iêêê!'],
    symbols: ['mar', 'lua', 'navio', 'espelho'],
    mythology:
      'Yemoja é a mãe de todos os orixás. Ela é a origem das águas e a força geradora do universo. Os pescadores a invocam antes de zarpar, as mulheres a pedem por filhos, e todos buscam sua proteção nas horas de necessidade.',
    spiritualLesson:
      'A verdadeira geração não é apenas física - é a capacidade de criar vida em todos os níveis: ideias, projetos, relacionamentos. Permita que a energia criativa de Yemoja flua através de você, trazendo vida onde quer que você vá.',
    meditation:
      'Visualize as águas profundas de Yemoja. Você é o receptáculo sagrado onde ela deposita suas bênçãos. Permita que essa energia flua através de você, trazendo cura e renovação.',
  },
  {
    id: 'yemoja-02',
    name: 'Yemoja',
    namePortuguese: 'Iemanjá Rainha do Mar',
    path: 'src/lib/orixa/yemoja-data.ts',
    element: 'água',
    colors: ['azul escuro', 'branco', 'dourado'],
    dayOfWeek: 'sábado',
    numbersSacred: [2, 8, 13],
    greeting: 'Odoyá!',
    archetype: 'A Geradora Eterna',
    qualities: ['criação', 'fecundidade', 'equilíbrio emocional', 'orientação', 'guia espiritual', 'regeneração'],
    challenges: ['dependência emocional', 'medo do abandono', 'dificuldade em estabelecer limites'],
    rulingPlanet: 'Lua/Netuno',
    sacredAnimals: ['peixe', 'baleia', 'tartaruga'],
    plants: ['alcaparra', 'colônia', 'flor de lótus'],
    offerings: ['canjica branca', 'flores azuis', 'água do mar', 'vela branca', 'perfume'],
    chants: ['Odoyá Yemanjá!', 'Iêêê!'],
    symbols: ['mar', 'lua', 'navio', 'espelho'],
    mythology:
      'Yemoja é a mãe de todos os orixás. Ela é a origem das águas e a força geradora do universo. Os pescadores a invocam antes de zarpar, as mulheres a pedem por filhos, e todos buscam sua proteção nas horas de necessidade.',
    spiritualLesson:
      'A verdadeira geração não é apenas física - é a capacidade de criar vida em todos os níveis: ideias, projetos, relacionamentos. Permita que a energia criativa de Yemoja flua através de você, trazendo vida onde quer que você vá.',
    affirmation: 'Sou geradora de vida e protectora de todos os meus filhos.',
    meditation:
      'Visualize as águas profundas de Yemoja. Você é o receptáculo sagrado onde ela deposita suas bênçãos. Permita que essa energia flua através de você, trazendo cura e renovação.',
  },
];

export function getData(): YemojaData[] {
  return YEMOJA_DATA;
}

export function getDataById(id: string): YemojaData | undefined {
  return YEMOJA_DATA.find((y) => y.id === id);
}

export function searchData(query: string): YemojaData[] {
  const lowerQuery = query.toLowerCase();
  return YEMOJA_DATA.filter(
    (y) =>
      y.name.toLowerCase().includes(lowerQuery) ||
      y.namePortuguese.toLowerCase().includes(lowerQuery) ||
      y.qualidades.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      y.element.toLowerCase().includes(lowerQuery)
  );
}

export function getYemojaByDay(day: string): YemojaData[] {
  return YEMOJA_DATA.filter((y) => y.dayOfWeek.toLowerCase() === day.toLowerCase());
}

export function getYemojaByElement(element: string): YemojaData[] {
  return YEMOJA_DATA.filter((y) => y.element.toLowerCase() === element.toLowerCase());
}