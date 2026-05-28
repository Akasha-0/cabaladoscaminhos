/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Edim Data Module
 * Spiritual data for Edim, the Orixá of beauty, vanity and aesthetics
 */

export interface EdimData {
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
  beauty: BeautyData;
  aesthetics: AestheticsData;
  vanityPrinciples: string[];
  ritualPractices: RitualData[];
}

export interface BeautyData {
  meaning: string;
  aspects: string[];
  practices: string[];
  guidance: string;
}

export interface AestheticsData {
  definition: string;
  elements: string[];
  expressions: string[];
  guidance: string;
}

export interface RitualData {
  name: string;
  description: string;
  frequency: string;
  purpose: string;
}

const EDIM_DATA: EdimData = {
  id: 'edim',
  name: 'Edim',
  namePortuguese: 'A Bonita',
  path: 'Ori',
  element: 'Água e Ar',
  colors: ['#FFB6C1', '#FF69B4', '#DDA0DD', '#E6E6FA', '#FFC0CB'],
  dayOfWeek: 'Sábado',
  numbersSacred: [5, 15, 25],
  greeting: 'Laroyê Edim!',
  archetype: 'A Flor que Abre',
  qualities: [
    'Beleza',
    'Charme',
    'Elegância',
    'Sedução',
    'Delicadeza',
    'Vaidade positiva',
    'Amor próprio',
    'Expressão artística'
  ],
  challenges: ['Vaidade excessiva', 'Superficialidade', 'Orgulho', 'Inveja'],
  rulingPlanet: 'Vênus',
  sacredAnimals: ['Pavão', 'Borboleta', 'Cisne', 'Colhereiro'],
  plants: ['Rosa', 'Jasmim', 'Hibisco', 'Violeta', 'Lótus'],
  offerings: [
    'Perfume floral',
    'Rosas cor-de-rosa',
    'Mel',
    'Cosmético cheiroso',
    'Espelho novo',
    'Pente ornamental',
    'Água de flor'
  ],
  chants: [
    'Laroyê Edim',
    'Edim bonita que seduz',
    'Flor que se abre ao sol',
    'Beleza que ilumina'
  ],
  symbols: [
    'Espelho',
    'Pente de ouro',
    'Rosa',
    'Pavão',
    'Perfume',
    'Jóias',
    'Cosmético'
  ],
  mythology:
    'Edim é a Orixá da beleza e da vaidade sagrada. É conhecida como "A Flor que Abre", manifestando a importância do amor próprio e do cuidado com a aparência como forma de honrar o divino. Rege a estética, a sedução gentil e a arte de se presentar ao mundo com graça e elegância.',
  spiritualLesson:
    'A verdadeira beleza nasce do amor próprio cultivado com graça. Cuidar de si mesma é um ato de devoção que reflete a luz divina em cada gesto.',
  affirmation:
    'Eu honro a beleza divina em mim e deixo minha luz brilhar com elegância e graça em cada momento',
  meditation:
    'Visualize-se como uma rosa que se abre lentamente ao amanhecer, cada pétala revelando uma camada de sua beleza interior. Sinta o perfume da sua própria essência florescendo.',
  beauty: {
    meaning:
      'Edim ensina que a beleza é uma expressão sagrada do divino. Não se trata de padrões externos, mas de reconhecer e cultivas a luz interior que se manifesta através do corpo, gestos e presença.',
    aspects: [
      'Beleza física como reflexo da alma',
      'Beleza nos gestos e movimentos',
      'Beleza na palavra e na voz',
      'Beleza no ambiente ao redor',
      'Beleza nos pensamentos e intenções',
      'Beleza na conexão com a natureza'
    ],
    practices: [
      'Cuidar do corpo com amor e respeito',
      'Usar roupas que expressam sua essência',
      'Praticar a arte da apresentação dignificada',
      'Criar ambientes bonitos ao redor',
      'Falar com gentileza e clareza',
      'Cultivar pensamentos elevados'
    ],
    guidance:
      'A beleza que Edim ensina não tem a ver com perfeição externa, mas com a harmonia entre o interior e o exterior. Quando nos cuidamos com amor, permitimos que a luz divina se manifeste através de nós.'
  },
  aesthetics: {
    definition:
      'Para Edim, a estética é uma linguagem sagrada que comunica nossa essência ao mundo. A forma como nos apresentamos, o ambiente que criamos e os detalhes que escolhemos são formas de oração e expressão espiritual.',
    elements: [
      'Harmonia de cores e texturas',
      'Equilíbrio entre simplicidade e detalhe',
      'Expressão da personalidade através do visual',
      'Atenção aos detalhes significativos',
      'Cuidado com o espaço físico',
      'Presença e postura dignificada'
    ],
    expressions: [
      'Arranjo pessoal com intenção',
      'Decoração do espaço sagrado',
      'Seleção cuidadosa de aromas',
      'Combinação de tecidos e acessórios',
      'Cuidado com a voz e dicção',
      'Postura de dignidade e graça'
    ],
    guidance:
      'Pratique a estética como meditação em movimento. Cada escolha de roupa, cada aroma, cada detalhe do seu ambiente pode ser uma oração que honra o divino em você e ao seu redor.'
  },
  vanityPrinciples: [
    'Cuidar de si é honrar o divino que habita em você',
    'A vaidade negativa é o ego; a positiva é o amor próprio sagrado',
    'Sua aparência é uma carta de apresentação da sua alma',
    'A beleza exterior reflete a beleza interior cultivada',
    'Cada gesto de cuidado consigo é um ato de devoção',
    'A elegância nasce da autenticidade, não da imitação',
    'Quando você se ama, irradia luz que beneficia todos ao seu redor'
  ],
  ritualPractices: [
    {
      name: 'Banho de Beleza de Edim',
      description:
        'Ritual de purificação e embelezamento usando água de rosas, jasmim e mel para limpar, perfumar e energizar o corpo e a aura.',
      frequency: 'Semanalmente ou antes de momentos importantes',
      purpose: 'Renovar a beleza interior e exterior, energizar a aura com charme e graciosidade'
    },
    {
      name: 'Oração ao Espelho',
      description:
        'Prática de se olhar no espelho com amor e gratidão, recitando affirmations de autoaceitação e beleza divina enquanto se arruma com intenção sagrada.',
      frequency: 'Diariamente ao se preparar para o dia',
      purpose: 'Cultivar amor próprio, aceitar a própria beleza e honrar o divino no corpo'
    },
    {
      name: 'Altar de Beleza',
      description:
        'Criação de um espaço sagrado dedicado a Edim com espelho, flores frescas, perfumes e itens de cuidado pessoal para oferecer e receber bênçãos de beleza e charme.',
      frequency: 'Permanente, com renovações semanais',
      purpose: 'Conectar-se com a energia de Edim e convidar beleza e graça para o cotidiano'
    }
  ]
};

export function getData(): EdimData {
  return EDIM_DATA;
}

export function getDataById(id: string): EdimData | undefined {
  return id === 'edim' ? EDIM_DATA : undefined;
}

export function getBeauty(): BeautyData {
  return EDIM_DATA.beauty;
}

export function getAesthetics(): AestheticsData {
  return EDIM_DATA.aesthetics;
}

export function getRituals(): RitualData[] {
  return EDIM_DATA.ritualPractices;
}

export function getVanityPrinciples(): string[] {
  return EDIM_DATA.vanityPrinciples;
}