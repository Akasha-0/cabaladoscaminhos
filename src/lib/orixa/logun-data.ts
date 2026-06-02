// @ts-nocheck
// SKIP_LINT

/**
 * Logun Data Module
 * Spiritual data for Logun (Logune), the orixa of communication, wisdom, and waters
 */

export interface LogunData {
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

const LOGUN_DATA: LogunData[] = [
  {
    id: 'logun',
    name: 'Logun',
    namePortuguese: 'Senhor das Aguas e da Comunicacao',
    path: 'Logun',
    element: 'Agua e Ar',
    colors: ['#1E90FF', '#00CED1', '#F5F5DC'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 7, 12],
    greeting: 'Ia Logune!',
    archetype: 'O Mensageiro das Aguas',
    qualities: ['Comunicacao', 'Sabedoria', 'Inteligencia', 'Protecao', 'Conexao ancestral', 'Equilibrio'],
    challenges: ['Superficialidade', 'Desonestidade', 'Medo de falar a verdade'],
    rulingPlanet: 'Mercurio',
    sacredAnimals: ['Pomba branca', 'Cachorro', 'Peixe'],
    plants: ['Milho', 'Amendoim', 'Ervas verdes', 'Eucalipto'],
    offerings: ['Milho torrado', 'Amendoim torrado', 'Mel', 'Farinha de mandioca', 'Eko de obi', 'Fumo de charuto'],
    chants: ['Logune, Logune ye yeo', 'Ia Logune! Ia Logune mojuba', 'Logune me da ouvidos', 'E sourcei!'],
    symbols: ['Lanca', 'Escudo', 'Adaga cerimonial', 'Fio de contas azuis e brancas'],
    mythology:
      'Logun e o orixa da comunicacao, da sabedoria e das aguas. E filho de Oxum e Obaluaye, conhecido como mensageiro entre o ceu e a terra. Logun protege contra feiticos e mau-olhado, e trabalha em conjunto com Oxum para o equilibrio espiritual dos iniciados.',
    spiritualLesson: 'A verdadeira comunicacao vem do alinhamento entre o coracao e a mente, mediada pelas aguas da sabedoria',
    affirmation: 'Eu falo com clareza e verdade, aberto a sabedoria ancestral que flui atraves de mim',
    meditation: 'Visualize aguas cristalinasabridocaminho, levando consigo todas as palavras nao ditas e abrindo novos caminhos de expressao',
  },
];

export function getData(): LogunData[] {
  return LOGUN_DATA;
}

function getDataById(id: string): LogunData | undefined {
  return LOGUN_DATA.find((l) => l.id === id);
}

function searchData(query: string): LogunData[] {
  const lower = query.toLowerCase();
  return LOGUN_DATA.filter(
    (l) =>
      l.name.toLowerCase().includes(lower) ||
      l.namePortuguese.toLowerCase().includes(lower) ||
      l.archetype.toLowerCase().includes(lower) ||
      l.qualities.some((q) => q.toLowerCase().includes(lower))
  );
}

function getLogunByDay(day: string): LogunData[] {
  return LOGUN_DATA.filter((l) => l.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getLogunByElement(element: string): LogunData[] {
  return LOGUN_DATA.filter((l) => l.element.toLowerCase().includes(element.toLowerCase()));
}
