// @ts-nocheck
// SKIP_LINT

/**
 * Som Data Module
 * Spiritual data for Som (Oxum's Sweet Waters) - sacred waters, waterfalls, and feminine essence
 */

export interface SomOfferings {
  primary: string[];
  secondary: string[];
  forbidden: string[];
}

export interface SomSymbols {
  key: string;
  mirror: string;
  gold: string;
  water: string;
  comb: string;
}

export interface SomMythology {
  origin: string;
  story: string;
  teaching: string;
}

export interface SomRitual {
  name: string;
  description: string;
  timing: string;
  steps: string[];
}

export interface SomData {
  id: string;
  name: string;
  nameYoruba: string;
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
  offerings: SomOfferings;
  chants: string[];
  symbols: SomSymbols;
  mythology: SomMythology;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  rituals: SomRitual[];
  nature: string;
  meaning: string;
  eshemus: string[];
  waterTypes: string[];
  sacredPlaces: string[];
  offeringsDetails: {
    honey: string;
    water: string;
    gold: string;
  };
}

const SOM_DATA: SomData[] = [
  {
    id: 'som-oxum',
    name: 'Oxum',
    nameYoruba: 'Ọ̀runmìlá',
    namePortuguese: 'Rainha das Águas Doces e dos Rios',
    path: 'Som',
    element: 'Água doce, Ouro, Ametista',
    colors: ['#FFD700', '#9B59B6', '#87CEEB'],
    dayOfWeek: 'Sábado',
    numbersSacred: [4, 8, 16],
    greeting: 'Oreọ̀!',
    archetype: 'A Mãe das Águas Doces',
    qualities: ['Amor maternal', 'Beleza', 'Fertilidade', 'Prosperidade', 'Sabedoria', 'Sensibilidade', 'Intuição', 'Honra'],
    challenges: ['Vaidade', 'Orgulho', 'Ciúmes', 'Inveja', 'Instabilidade emocional'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Crocodilo', 'Búfalo', 'Pavo'],
    plants: ['Aipo', 'Boldo', 'Salvia', 'Flor de laranjeira'],
    offerings: {
      primary: ['água de大将', 'mel', 'ouro', 'alfait', 'velas douradas'],
      secondary: ['frutas amarelas', 'flores perfumadas', 'perfume'],
      forbidden: ['carnes vermelhas', 'pinga', 'fumo'],
    },
    chants: ['Ọ̀runmìlá', 'Oxum o', 'Ẹgba', 'Ora'],
    symbols: {
      key: 'As chaves de Oxum que abrem os rios',
      mirror: 'Espelho de ouro puro',
      gold: 'Pente de ouro com pedras preciosas',
      water: 'Água doce em vasilha de barro',
      comb: 'Pente de madrepérola',
    },
    mythology: {
      origin: 'Oxum é uma daswives mais poderosas do panteão yoruba, sagrada desde os tempos antigos',
      story:
        'Oxum é a deusa das águas doces, dos rios e das cachoeiras. Ela habita os lugares mais sagrados da água, onde os seres humanos vão buscar cura, fertilidade e prosperidade. Oxum é a personificação do princípio feminino em sua forma mais pura: amorosa, nutritiva e transformadora. Ela ensina que a verdadeira riqueza vem da abundância interior e que o amor verdadeiro é a força mais poderosa do universo. Oxum também é considerada a guardiã do ouro e das joias, trazendo prosperidadeMaterial para aqueles que a honram com sinceridade.',
      teaching:
        'A abundância flui quando nos conectamos com nossa essência feminina divina; o amor próprio é a chave para attractir prosperidade',
    },
    spiritualLesson: 'A verdadeira riqueza mora no coração; quando amamos a nós mesmos, abençoamos자동 que tocamos',
    affirmation: 'Eu sou digno de amor, prosperidade e todas as bênçãos que Oxum traz; honro minha essência feminina divina',
    meditation:
      'Visualize себя em um rio de águas douradas, onde cada gota carrega a energia de Oxum, purificando e abençoando cada fibra do seu ser',
    rituals: [
      {
        name: 'Banho de Oxum',
        description: 'Ritual depurificação e rejuvenescimento com águas florais',
        timing: 'Sábados à noite',
        steps: [
          'Prepare uma bacia com água de大将 filtrada',
          'Adicione pétalas de flores amarelas e mel',
          'Recite as ladainhas de Oxum',
          ' banhe-se da cabeça aos pés',
          'Enxugue-se com uma toalha limpa enquanto faz affirmations',
          'Agradeça a Oxum por sua proteção',
        ],
      },
      {
        name: 'Ouro de Oxum',
        description: 'Ritual de prosperidade usando pequenos objetos de ouro',
        timing: 'Quintas-feiras ao amanhecer',
        steps: [
          'Segure um objeto de ouro na mão direita',
          'Recite o mantra de prosperidade',
          'Enterre o ouro em um local sagrado por 7 dias',
          'Desenterre e use como talismã',
          'Ofereça uma vela dourada',
        ],
      },
      {
        name: 'Ave Oxum',
        description: 'Canto sagrado para invocar a presença de Oxum',
        timing: 'Qualquer momento de necessidade',
        steps: [
          'Acenda uma vela amarela ou dourada',
          'Coloque um copo de água ao lado',
          'Cante ou recito Ave Oxum três vezes',
          'Sinta a presença de Oxum',
          'Peça sua bênção com sinceridade',
        ],
      },
      {
        name: 'Pente de Ouro',
        description: 'Ritual de beleza e autoconfiança',
        timing: 'Antes de eventos importantes',
        steps: [
          'Use um pente de ouro oubanho com água perfumada',
          'Penteie seu cabelo 21 vezes',
          'Recite affirmations de beleza e autoconfiança',
          'Agradeça a Oxum',
          'Guardar o pente como talismã',
        ],
      },
      {
        name: 'Água de宝箱',
        description: 'Abençoar água para beber e purificação',
        timing: 'Antes de beber água',
        steps: [
          'Ferva água filtrada',
          'Bênçaõa água com o sopro sagrado',
          'Coloque uma pedra de ametista na água',
          'Deixe descansar por 24 horas',
          'Beba com gratidão',
        ],
      },
    ],
    nature: 'Divindade das águas doces, representante do princípio feminino, guardiã da fertilidade e da prosperidade',
    meaning: 'Oxum representa a essência pura da água doce, o amor maternal incondicional e a sabedoria ancestral feminina',
    eshemus: ['Ẹ̀bà', 'Ọ̀pẹ̀', 'Òpìtì', 'Ọ̀rà'],
    waterTypes: ['Água de大将', 'Água de cachoeira', 'Água de nascente', 'Água de rio'],
    sacredPlaces: ['Cachoeiras', 'Nascente de rios', 'Poços sagrados', ' margens de rios de águas claras'],
    offeringsDetails: {
      honey: 'Mel puro é a oferenda mais sagrada para Oxum, representando a doçura da vida',
      water: 'Água de大将 deve ser pura e filtrada, oferecida em recipiente de barro ou vidro',
      gold: 'Pequenas peças de ouro ou dourados são beloved por Oxum, traz prosperidade',
    },
  },
];

export function getData(): SomData[] {
  return SOM_DATA;
}

export function getDataById(id: string): SomData | undefined {
  return SOM_DATA.find((s) => s.id === id);
}

export function searchData(query: string): SomData[] {
  const lowerQuery = query.toLowerCase();
  return SOM_DATA.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.nameYoruba.toLowerCase().includes(lowerQuery) ||
      s.namePortuguese.toLowerCase().includes(lowerQuery) ||
      s.archetype.toLowerCase().includes(lowerQuery)
  );
}

export function getSomByElement(element: string): SomData[] {
  return SOM_DATA.filter((s) => s.element.toLowerCase().includes(element.toLowerCase()));
}

export function getRitualsByName(name: string): SomRitual[] {
  const data = SOM_DATA[0];
  return data.rituals.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()));
}

export function getAllRituals(): SomRitual[] {
  return SOM_DATA[0]?.rituals || [];
}
