 
// @ts-nocheck
// SKIP_LINT

/**
 * Aroni Data Module
 * Comprehensive spiritual data for Aroni, Orixá of the Head, Consciousness and Intellect
 */

export interface AroniData {
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
  consciousness: ConsciousnessData;
  mentalPractices: MentalPracticeData[];
  ritualPractices: RitualData[];
}

export interface ConsciousnessData {
  description: string;
  aspects: string[];
  functions: string[];
  connection: string;
}

export interface MentalPracticeData {
  name: string;
  description: string;
  benefit: string;
  frequency: string;
}

export interface RitualData {
  name: string;
  description: string;
  frequency: string;
  purpose: string;
}

const ARONI_DATA: AroniData = {
  id: 'aroni',
  name: 'Aroni',
  namePortuguese: 'Senhor da Cabeça',
  path: 'Ori',
  element: 'Éter e Ar',
  colors: ['#FFFFFF', '#F5F5DC', '#87CEEB', '#D4AF37'],
  dayOfWeek: 'Segunda-feira',
  numbersSacred: [3, 9, 27],
  greeting: 'Euphe Aroni!',
  archetype: 'O Guardião da Mente',
  qualities: [
    'Sabedoria',
    'Discernimento',
    'Clareza mental',
    'Equilíbrio emocional',
    'Pensamento profundo',
    'Meditação',
    'Conhecimento intuitivo',
    'Alinhamento espiritual'
  ],
  challenges: ['Teimosia mental', 'Excesso de orgulho intelectual', 'Rigidez de pensamento', 'Fuga da realidade'],
  rulingPlanet: 'Mercury',
  sacredAnimals: ['Coruja', 'Cavalo branco', 'Pomba'],
  plants: ['Alfazema', 'Alecrim', 'Girassol'],
  offerings: [
    'Inhame branco',
    'Canjica',
    'Flores brancas',
    'Leite de coco',
    'Água de rosas',
    'Milho branco',
    'Algodão'
  ],
  chants: [
    'Euphe Aroni',
    'Ori mi o',
    'Aroni abre minha mente',
    'Cabeça clara e coração puro'
  ],
  symbols: [
    'Cabeça humana',
    'Alabê (cetros)',
    'Ofá (arco)',
    'Vela branca',
    'Espelho',
    'Água clara'
  ],
  mythology:
    'Aroni é o orixá que governa a consciência e o intelecto. É considerado o guardião do Ori, a cabeça espiritual que abriga o destino de cada ser. Diferente de Oxalá que é o criador, Aroni é o mantenedor da clareza mental e do pensamento equilibrado. Ele ensina que a verdadeira sabedoria começa quando reconocemos nossos próprios limites mentais e nos abrimos para a orientação divina.',
  spiritualLesson:
    'A cabeça é o trono onde a divindade se manifesta. Cuidar do Ori é cuidar da capacidade de distinguir o essencial do ilusório, o verdadeiro do falso.',
  affirmation:
    'Minha mente está clara e meu pensamento está alinhado com a vontade divina. Eu escolho a sabedoria sobre a ignorância em cada momento',
  meditation:
    'Sente em silêncio com as mãos sobre a cabeça. Visualize uma luz branca que entra pelo topo do crânio, preenchendo todo o espaço mental com clareza e paz. Permita que pensamentos venham e vão como nuvens passageiras.',
  consciousness: {
    description:
      'Aroni representa a consciência desperta e o intelecto purificado. Ele governa a capacidade humana de raciocinar, escolher e criar significado.',
    aspects: [
      'Mente racional',
      'Mente intuitiva',
      'Mente espiritual',
      'Memória',
      'Imaginação criativa',
      'Vontade e determinação'
    ],
    functions: [
      'Discernimento entre verdadeiro e falso',
      'Capacidade de análise e síntese',
      'Memória e aprendizado',
      'Imaginação e criatividade',
      'Intuição e percepção sutil',
      'Vontade e autodisciplina'
    ],
    connection:
      'Aroni conecta o plano físico da mente com o plano espiritual do Ori. Quando há equilíbrio, a pessoa acessa a sabedoria divina através do pensamento purificado.'
  },
  mentalPractices: [
    {
      name: 'Borí Mental',
      description:
        'Ritual de alimentação e fortalecimento da cabeça espiritual através de oferendas de alimentos brancos e preces específicas.',
      benefit: 'Fortalece a memória, clareza mental e intuição',
      frequency: 'Anualmente ou em momentos de confusão mental'
    },
    {
      name: 'Silêncio Interior',
      description:
        'Prática de permanecer em silêncio por períodos crescentes, observando os pensamentos sem apego ou julgamento.',
      benefit: 'Desenvolve a witness consciousness e o discernimento',
      frequency: 'Diariamente por 15-30 minutos'
    },
    {
      name: 'Lâmina do Pensamento',
      description:
        'Meditação que usa a metáfora da espada para cortar pensamentos obsessivos e crenças limitantes.',
      benefit: 'Liberta a mente de padrões repetitivos e ilusões',
      frequency: 'Diariamente ao amanhecer'
    },
    {
      name: 'Jogo de Búzios Consciente',
      description:
        'Prática divinatória onde Aroni é invocado para clareza na interpretação das mensagens.',
      benefit: 'Fornece orientação espiritual para decisões importantes',
      frequency: 'Quando necessário para decisões cruciais'
    }
  ],
  ritualPractices: [
    {
      name: 'Ayonná (Saudação à Cabeça)',
      description:
        'Ritual diário de reverência ao Ori, incluindo toques suaves na cabeça e preces de agradecimento pela capacidade de pensar e escolher.',
      frequency: 'Diariamente ao acordar',
      purpose: 'Alinhar a mente com o destino espiritual e cultivar gratidão'
    },
    {
      name: 'Ibadá de Oxalá com Aroni',
      description:
        'Cerimônia especial para fortalecer o Ori, oferecida em dias de segunda-feira com alimentos brancos e velas.',
      frequency: 'Mensalmente na segunda-feira',
      purpose: 'Purificar a mente, fortalecer a memória e abrir caminho para a sabedoria'
    },
    {
      name: 'Adição de Inhame (Comer Inhame para o Ori)',
      description:
        'Ritual de alimentação do Ori onde inhame branco é preparado com preces específicas e oferecido primeiramente a Aroni.',
      frequency: 'Semanalmente às segundas-feiras',
      purpose: 'Nutrir o corpo mental e espiritual, prevenir doenças da mente'
    }
  ]
};

export function getData(): AroniData {
  return ARONI_DATA;
}

function getDataById(id: string): AroniData | undefined {
  return id === 'aroni' ? ARONI_DATA : undefined;
}

function getConsciousness(): ConsciousnessData {
  return ARONI_DATA.consciousness;
}

function getMentalPractices(): MentalPracticeData[] {
  return ARONI_DATA.mentalPractices;
}

function getRituals(): RitualData[] {
  return ARONI_DATA.ritualPractices;
}

function getGreeting(): string {
  return ARONI_DATA.greeting;
}

function getPath(): string {
  return ARONI_DATA.path;
}
