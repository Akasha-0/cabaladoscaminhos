 
// @ts-nocheck
// SKIP_LINT

/**
 * Oxumar Data Module
 * Comprehensive spiritual data for Oxumar, Orixá of the Rainbow, Dreams and Divination
 */

export interface OxumarData {
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
  dreams: DreamData;
  divination: DivinationData;
  rainbowPrinciples: string[];
  ritualPractices: RitualData[];
}

export interface DreamData {
  interpretation: string;
  symbols: string[];
  practices: string[];
  guidance: string;
}

export interface DivinationData {
  methods: string[];
  tools: string[];
  purpose: string;
  guidance: string;
}

export interface RitualData {
  name: string;
  description: string;
  frequency: string;
  purpose: string;
}

const OXUMAR_DATA: OxumarData = {
  id: 'oxumar',
  name: 'Oxumar',
  namePortuguese: 'Arco-Íris Vivente',
  path: 'Ori',
  element: 'Água e Luz',
  colors: ['#9400D3', '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082'],
  dayOfWeek: 'Domingo',
  numbersSacred: [7, 21, 77],
  greeting: 'Laroyê Oxumar!',
  archetype: 'O Mensageiro dos Mistérios',
  qualities: [
    'Intuição',
    'Visão',
    'Transformação',
    'Esperança',
    'Mistério',
    'Promessa',
    'Conhecimento oculto',
    'Sonhos proféticos'
  ],
  challenges: ['Ilusão', 'Superstição', 'Excessiva fantasia', 'Procrastinação'],
  rulingPlanet: 'Netuno',
  sacredAnimals: ['Borboleta', 'Colibri', 'Sapo'],
  plants: ['Flor de laranjeira', 'Magnólia', 'Erva-doce'],
  offerings: [
    'Mel',
    'Canela',
    'Flores amarelas e roxas',
    'Água de flor de laranja',
    'Coco ralado',
    'Pimenta-da-bahia',
    'Fio de contas em arco-íris'
  ],
  chants: [
    'Laroyê Oxumar',
    'Oxumar me mostra o caminho',
    'Arco-íris que ilumina',
    'Sonho que se revela'
  ],
  symbols: [
    'Arco-íris',
    'Cristal',
    'Espelho',
    'Pena de pavão',
    'Conchas do mar',
    'Água corrente'
  ],
  mythology:
    'Oxumar é o orixá do arco-íris, representando a ponte entre o céu e a terra. É filhos de Oxum e Oxumar, manifestando-se como a promessa de que após a tempestade vem a esperança. Governa os sonhos, a divinação e os mistérios ocultos, conectando o mundo material ao espiritual.',
  spiritualLesson:
    'A vida é um arco-íris de experiências que se conectam através das cores da alma. Cada arco-íris é uma promessa de renovação e transformação.',
  affirmation:
    'Eu vejo através das cores da minha alma e encontro o arco-íris da minha verdade interior em cada momento',
  meditation:
    'Visualize um arco-íris que emerge das suas mãos, irradiando cores curativas através de cada célula do seu corpo. Sinta-se conectado ao fluxo infinito de possibilidades.',
  dreams: {
    interpretation:
      'Oxumar governs the realm of dreams and prophetic visions. Dreams under his guidance often carry messages of transformation, hidden truths, and spiritual awakening.',
    symbols: [
      'Arco-íris em sonhos',
      'Cores que mudam',
      'Voar sobre paisagens',
      'Águas cristalinas',
      'Portais luminosos',
      'Pássaros coloridos'
    ],
    practices: [
      'Manter diário de sonhos',
      'Meditar antes de dormir',
      'Pedir orientação a Oxumar',
      'Acordar em silêncio para lembrar',
      'Usar cristais sob o travesseiro'
    ],
    guidance:
      'Preste atenção aos sonhos repetitivos e às cores predominantes. Elas revelam seu estado espiritual e mensagens dos guias.'
  },
  divination: {
    methods: [
      'Ifá tradicional',
      'Jogo de búzios',
      'Tarot das cores',
      'Interpretação de arco-íris',
      'Leitura de sueños'
    ],
    tools: [
      'Opele Ifá',
      'Búzios',
      'Cartas do tarot',
      'Cristais',
      'Água consagrada',
      'Flores frescas'
    ],
    purpose:
      'Oxumar ensina que a divinação é uma ferramenta para clareza interior, não para previsões determinísticas. Os sinais coloridos guiam o consulente hacia autoconhecimento.',
    guidance:
      'Ao consultar Oxumar, prepare-se para mensagens transformadoras disguised as mistérios. Abrace a ambiguidade como caminho para a sabedoria.'
  },
  rainbowPrinciples: [
    'Cada cor representa uma facet da verdade',
    'O arco-íris surge após a chuva - há esperança após a dor',
    'A luz branca contém todas as cores - a unidade na diversidade',
    'O arco-íris é um puente entre mundos',
    'As cores mais brilhantes aparecem após a tempestade',
    'Cada pessoa vê seu propio arco-íris baseado em sua perspectiva'
  ],
  ritualPractices: [
    {
      name: 'Lavagem de Oxumar',
      description:
        'Ritual de purificação usando água com flores coloridas, mel e canela para limpar a aura e abrir canais divinatórios.',
      frequency: 'Quinzenalmente ou em momentos de necessidade',
      purpose: 'Purificação espiritual e abertura de visão interior'
    },
    {
      name: 'Tenda de Sonhos',
      description:
        'Prática de dormir em ambiente preparado com cristais, flores e velas para receber mensagens de Oxumar durante o sono.',
      frequency: 'Mensalmente em luna cheia',
      purpose: 'Receber guidance e cura através dos sonhos proféticos'
    },
    {
      name: 'Arco-Íris de Gratidão',
      description:
        'Cerimônia de agradecer pelas cores da vida, reconhecendo tanto as alegrias quanto as tristezas como partes do arco-íris existencial.',
      frequency: 'Diariamente ao amanhecer',
      purpose: 'Cultivar esperança, gratidão e perspectiva colorida da vida'
    }
  ]
};

export function getData(): OxumarData {
  return OXUMAR_DATA;
}

export function getDataById(id: string): OxumarData | undefined {
  return id === 'oxumar' ? OXUMAR_DATA : undefined;
}

export function getDreams(): DreamData {
  return OXUMAR_DATA.dreams;
}

export function getDivination(): DivinationData {
  return OXUMAR_DATA.divination;
}

export function getRituals(): RitualData[] {
  return OXUMAR_DATA.ritualPractices;
}

export function getRainbowPrinciples(): string[] {
  return OXUMAR_DATA.rainbowPrinciples;
}