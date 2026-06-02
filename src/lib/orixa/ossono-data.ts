// @ts-nocheck
// SKIP_LINT

/**
 * Ossono Data Module
 * Spiritual data for Ossono, the orixá of wisdom, divination, and cosmic knowledge
 */

export interface OssonoData {
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

const OSSONO_DATA: OssonoData[] = [
  {
    id: 'ossono',
    name: 'Ossono',
    namePortuguese: 'Senhor do Destino',
    path: 'Ossono',
    element: 'Conhecimento e Sabedoria',
    colors: ['#800080', '#4B0082', '#9370DB'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Ossono!',
    archetype: 'O Guardião do Destino',
    qualities: ['Sabedoria', 'Intuição', 'Visão', 'Conhecimento', 'Previsão', 'Discernimento'],
    challenges: ['Segredos demais', 'Isolamento', 'Cansaço mental'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Coruja', 'Falcão', 'Jacaré'],
    plants: ['Arruda', 'Pau-brasil', 'Alecrim'],
    offerings: ['Azeite de dendê roxo', 'Velas roxas', 'Farinha de mandioca', 'Dois real', 'Água de cheiro'],
    chants: ['Ossono', 'Egun', 'Awon'],
    symbols: ['Espelho mágico', 'Livro do destino', 'Colar de contas', 'Balança cósmica'],
    mythology:
      'Ossono é o orixá que conhece todos os caminhos do destino humano. Ele é o eterno estudante do universo, aquele que observa e registra cada escolha feita pelos mortais. Ossono caminha entre os mundos, conectando passado, presente e futuro em uma teia infinita de possibilidades.',
    spiritualLesson: 'O verdadeiro conhecimento vem do entendimento de que cada destino é uma escolha consciente',
    affirmation: 'Eu acesso a sabedoria ancestral e compreendo meu caminho com clareza e propósito divino',
    meditation: 'Visualize um espelho antigo diante de você, refletindo não apenas sua imagem, mas todos os seus caminhos possíveis',
  },
];

export function getData(): OssonoData[] {
  return OSSONO_DATA;
}

function getDataById(id: string): OssonoData | undefined {
  return OSSONO_DATA.find((o) => o.id === id);
}

function searchData(query: string): OssonoData[] {
  const q = query.toLowerCase();
  return OSSONO_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(query.toLowerCase())) ||
      o.mythology.toLowerCase().includes(q)
  );
}

function getOssonoByDay(day: string): OssonoData[] {
  return OSSONO_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getOssonoByElement(element: string): OssonoData[] {
  return OSSONO_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}