// @ts-nocheck
// SKIP_LINT

/**
 * Irosun/Oyeku Data Module
 * Spiritual data for Irosun, Odu number 4 - The Warning, spiritual vision, blood in the veins
 */

export interface IrosunOfferings {
  primary: string[];
  secondary: string[];
  forbidden: string[];
}

export interface IrosunSymbols {
  key: string;
  ikin: string;
  divination: string;
  alter: string;
  connection: string;
}

export interface IrosunMythology {
  origin: string;
  story: string;
  teaching: string;
}

export interface IrosunRitual {
  name: string;
  description: string;
  timing: string;
  steps: string[];
}

export interface IrosunData {
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
  offerings: IrosunOfferings;
  chants: string[];
  symbols: IrosunSymbols;
  mythology: IrosunMythology;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  rituals: IrosunRitual[];
  nature: string;
  meaning: string;
  eshemus: string[];
  awose: string[];
  numero: number;
  significado: string;
  orixaRegente: string[];
  quizilas: string[];
  preceptos: string[];
  ebos: string[];
}

const IROSUN_DATA: IrosunData[] = [
  {
    id: 'irosun',
    name: 'Irosun',
    nameYoruba: 'Irosun',
    namePortuguese: 'O Aviso',
    path: 'Odu',
    element: 'Fogo / Terra',
    colors: ['Branco', 'Vermelho', 'Preto'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 12, 16],
    greeting: 'Eshu!',
    archetype: 'O Mensageiro da Visão Espiritual',
    qualities: ['Aviso', 'Visão espiritual', 'Intuição', 'Sangue', 'O futuro', 'Proteção'],

    challenges: ['Mentira', 'Desatenção aos sinais', 'Ingorância espiritual'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Egum (espírito)', 'Coruja', 'Cobra'],
    plants: ['Colônia', 'Saião', 'Boldo'],
    offerings: {
      primary: ['Alimentos brancos', 'Canjica', 'Velas brancas'],
      secondary: ['Farinha de mandioca', 'Mel', 'Agua de colônia'],
      forbidden: ['Carne bovina', 'Sal em excesso', 'Pimenta']
    },
    chants: ['Irosun lo dara!', 'Egum e gbo!', 'Iemanjá Ó!'],
    symbols: {
      key: 'Odu do aviso e da visão espiritual',
      ikin: 'Quatro Ikins (castanhas/kieler)',
      divination: 'Irosun revela mensagens dos ancestrais e avisos sobre o caminho a seguir',
      alter: 'Sagrário de Iemanjá',
      connection: 'Conecta com Iemanjá, Oxóssi e Egum'
    },
    mythology: {
      origin: 'Irosun emergiu quando os orixás distribuíram os avisos pelos caminhos da vida',
      story: 'Irosun é o Odu que traz as mensagens dos eguns (ancestrais). Quando aparece, os mortos estão tentando falar através de sonhos e visões. Este Odu ensina que o sangue carrega a memória dos antepassados e que a visão espiritual é um dom precioso.',
      teaching: 'O verdadeiro aviso vem quando você aprende a ouvir o que não é dito com palavras.'
    },
    spiritualLesson: 'A visão espiritual requer atenção aos sinais, aos sonhos e à saúde do corpo',
    affirmation: 'Eu abro meus olhos espirituais. Eu escuto os avisos dos meus ancestrais.',
    meditation: 'Sinto o sangue correndo em minhas veias, carregando a sabedoria dos meus antepassados. Visualize mensagens sendo reveladas em sonhos.',
    rituals: [
      {
        name: 'Itutu Irosun',
        description: 'Ritual para desenvolver a visão espiritual e receber avisos',
        timing: 'Quarta-feira à noite',
        steps: [
          'Prepare um local sagrado com toalha branca',
          'Coloque alimentos brancos ao centro (canjica)',
          'Acenda velas brancas nos quatro cantos',
          'Recite os cantos de Irosun',
          'Ofereça água de colônia na beira-mar para Iemanjá',
          'Peça aos eguns que revelem mensagens importantes'
        ]
      },
      {
        name: 'Banho de Folhas Frias',
        description: 'Ritual de proteção e clareza espiritual',
        timing: 'Qualquer dia de manhã',
        steps: [
          'Ferva folhas de colônia e saião em água',
          'Deixe esfriar naturalmente',
          'Banhe-se do pescoço para baixo',
          'Recite orações para Oxóssi e Iemanjá',
          'Agradeça pela proteção recebida'
        ]
      }
    ],
    nature: 'Irosun é o princípio do aviso e da visão espiritual. Ele governa o sangue que corre nas veias e a capacidade de ver além do mundo material. Este Odu traz a mensagem de que existem forças ancestrais tentando proteger e guiar quem sabe ouvir.',
    meaning: 'Irosun fala sobre avisos, sonhos, sangue, visão espiritual e o futuro. Sua mensagem principal é que os ancestrais estão tentando comunicarse e que é preciso desenvolver a intuição.',
    eshemus: ['Iemanjá', 'Oxóssi', 'Egum', 'Oxalá'],
    awose: ['Aviso', 'Visão', 'Sangue', 'Futuro', 'Sonho', 'Ancestral', 'Proteção'],
    numero: 4,
    significado: 'O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.',
    orixaRegente: ['Iemanjá', 'Oxóssi', 'Egum'],
    quizilas: [
      'Olhar para buracos vazios',
      'Usar roupas muito vermelhas em momentos de crise',
      'Mentira'
    ],
    preceptos: [
      'Desenvolver a intuição',
      'Não ignorar avisos e sonhos',
      'Cuidar da saúde do sangue e dos olhos'
    ],
    ebos: [
      'Alimentos brancos',
      'Canjica na beira-mar para Iemanjá',
      'Banhos de folhas frias (colônia, saião)'
    ]
  }
];

export function getData(): IrosunData[] {
  return IROSUN_DATA;
}

export function getDataById(id: string): IrosunData | undefined {
  return IROSUN_DATA.find((o) => o.id === id);
}

export function searchData(query: string): IrosunData[] {
  const lowerQuery = query.toLowerCase();
  return IROSUN_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery) ||
      o.awose.some((a) => a.toLowerCase().includes(lowerQuery))
  );
}

export function getIrosunByElement(element: string): IrosunData[] {
  return IROSUN_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

export function getIrosunByPlanet(planet: string): IrosunData[] {
  return IROSUN_DATA.filter((o) => o.rulingPlanet.toLowerCase().includes(planet.toLowerCase()));
}