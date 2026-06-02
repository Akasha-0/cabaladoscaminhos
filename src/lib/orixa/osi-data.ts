/* prettier-ignore */

// @ts-nocheck

/**
 * OSI Data Module
 * Spiritual data for OSI, the orixá of layers, interconnection, and boundaries
 */

export interface OsiData {
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

const OSI_DATA: OsiData[] = [
  {
    id: 'osi',
    name: 'Osi',
    namePortuguese: 'Senhor das Camadas',
    path: 'Osi',
    element: 'Ar e Éter',
    colors: ['#4A5568', '#718096', '#A0AEC0', '#CBD5E0'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [7, 14, 21],
    greeting: 'Euphe Osi!',
    archetype: 'Guardião das Fronteiras',
    qualities: [
      'Conexão',
      'Limiares',
      'Intermediação',
      'Camadas',
      'Membranas',
      'Mediação',
      'Transição',
      'União'
    ],
    challenges: [
      'Separação artificial',
      'Rigidez de fronteiras',
      'Incapacidade de mediacao',
      'Confusao de limites'
    ],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Cobra', 'Lagarto', 'Tartaruga'],
    plants: ['Musgo', 'Samambaia', 'Hera', 'Bromelia'],
    offerings: [
      'Agua de chuva',
      'Cristal de quartzo',
      'Plumas brancas',
      'Teias de aranha',
      'Pedras camadas',
      'Cascas secas',
      'Musgo verde'
    ],
    chants: ['Euphe Osi', 'Osi mi o', 'Camadas se abrem', 'Limiar sagrado'],
    symbols: [
      'Camadas concêntricas',
      'Teia de aranha',
      'Onda',
      'Manto',
      'Cascas',
      'Membranas'
    ],
    mythology:
      'Osi é o orixá que governa os espaços entre - os limiares, camadas e fronteiras que conectam diferentes planos da existência. Ele habita onde uma coisa encontra outra, onde o céu toca a terra, onde o visível encontra o invisível. Osi é o mediador cósmico, aquele que permite que energias diferentes se encontrem e interajam sem se destruir. Cada camada da realidade - física, emocional, mental, espiritual - tem seu Osi, mantendo a integridade enquanto permite a comunicação entre elas.',
    spiritualLesson:
      'A sabedoria de Osi ensina que toda fronteira é também um ponto de encontro. Não há separação absoluta na criação; há apenas interfaces onde a magia acontece. Conhecer Osi é desenvolver a capacidade de mediar entre opostos, de manter limites sagrados enquanto se permanece aberto ao fluxo.',
    affirmation: 'Eu movimento entre as camadas com sabedoria, mantendo minha integridade enquanto me conecto com todo o ser.',
    meditation: 'Sente em silêncio e visualize себя como uma série de camadas concêntricas - do centro mais profundo até a periferia. Observe como cada camada se conecta com a próxima, permitindo que energia flua através de você enquanto mantém sua essência intacta.'
  }
];

export function getData(): OsiData[] {
  return OSI_DATA;
}

function getDataById(id: string): OsiData | undefined {
  return OSI_DATA.find((o) => o.id === id);
}

function searchData(query: string): OsiData[] {
  const q = query.toLowerCase();
  return OSI_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q)) ||
      o.symbols.some((s) => s.toLowerCase().includes(q))
  );
}

function getOsiByElement(element: string): OsiData[] {
  return OSI_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

function getOsiByDay(day: string): OsiData[] {
  return OSI_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}