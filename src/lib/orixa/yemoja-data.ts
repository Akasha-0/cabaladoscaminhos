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
    rulingPlanet: 'Lua',
    sacredAnimals: ['peixe', ' tartaruga', 'cavalo-marinho', 'baleia'],
    plants: ['colônia', 'alcaparra', 'lágrima-de-nossa-senhora', 'pata-de-vaca', 'erva-de-santa-luzia'],
    offerings: ['água salgada', 'flores brancas e azuis', 'canjica', 'queijo', 'perfume floral', 'espelho'],
    chants: ['Odoyá!', 'Ora ô ô Yemanjá!', 'Yê Yê Yê!'],
    symbols: ['espelho oval', 'pente de osso', 'navio', 'meia lua', 'ondas do mar'],
    mythology:
      'Yemoja é a mãe de todos os orixás, a origem do axé sagrado. Ela habita as águas salgadas e é a protetora das crianças, das mulheres e dos pescadores. Sua energia representa a nutrição primordial, o ventre que alimenta toda a criação. É conhecida como a Grande Mãe Iorubá, senhora das profundezas e dos mistérios ocultos.',
    spiritualLesson:
      'Aprenda a nutrição sem possessão. Permita que o amor flua como as águas do mar - sempre em movimento, sempre renovando, sem apego ao controle. A verdadeira maternidade é dar espaço para que cada ser encontre seu próprio caminho, assim como o mar acolhe todos os rios sem perguntar它们的目的地.',
    affirmation: 'Eu sou a corrente sagrada que nutre e protege. Minhas águas carregam bênçãos para todos os que来找我.',
    meditation:
      'Descanse nas profundezas calmas do mar interior. Sinta a energia de Yemoja envolvendo você como as águas maternas. Permita que ela lave suas preocupações e traga paz aos lugares mais profundos da sua alma.',
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
    qualities: [
      'criação',
      'fecundidade',
      'equilíbrio emocional',
      'orientação',
      'guia espiritual',
      'regeneração',
    ],
    challenges: [
      'dependência emocional',
      'medo do abandono',
      'dificuldade em estabelecer limites',
    ],
    rulingPlanet: 'Lua',
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
      'Visualize as águas profundas de Yemoja. Você é o receptáculo sagrado onde ela deposita suas bênçãos. Permita que essa energiaflua através de você, trazendo cura e renovação.',
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