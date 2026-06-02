/**
 * Osha Data Module
 * Spiritual data for Osha (Oshá), the orixá of wisdom, knowledge, and spiritual medicine
 */

export interface OshaData {
  id: string;
  name: string;
  namePortuguese: string;
  nameYoruba: string;
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
  herbs: HerbData[];
  healingPractices: string[];
  sacredTrees: string[];
  ritualPractices: RitualData[];
}

export interface HerbData {
  name: string;
  namePortuguese: string;
  uses: string[];
  preparation: string;
  contraindications: string[];
  element: string;
}

export interface RitualData {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
}

const OSHA_DATA: OshaData = {
  id: 'osha',
  name: 'Osha',
  namePortuguese: 'Senhor da Sabedoria e da Medicina Sagrada',
  nameYoruba: 'Oshá',
  path: 'Conhecimento Ancestral',
  element: 'Sabedoria e Terra',
  colors: ['Branco', 'Amarelo', 'Verde'],
  dayOfWeek: 'Domingo',
  numbersSacred: [4, 7, 13, 17],
  greeting: 'Mo Osha',
  archetype: 'Guardião do Conhecimento Sagrada',
  qualities: [
    'Sabedoria profunda',
    'Conhecimento ancestral',
    'Poder de cura',
    'Discernimento espiritual',
    'Paciência',
    'Meditação',
    'Conexão com ancestrais',
    'Medicina natural',
    'Proteção espiritual',
    'Humildade',
  ],
  challenges: [
    'Perfeccionismo excessivo',
    'Isolamento',
    'Dificuldade em delegar',
    'Excesso de auto-exigência',
    'Tendência ao segredo',
  ],
  rulingPlanet: 'Sol',
  sacredAnimals: ['Coruja', 'Serpente', 'Ibis'],
  plants: ['Alcachofra', 'Girassol', 'Alecrim', 'Arruda', 'Mastruz'],
  offerings: ['Alimentos brancos', 'Mel', 'Azeite', 'Flores amarelas', 'Água limpa'],
  chants: ['Osha', 'Sabedoria', 'Cura', 'Conhecimento'],
  symbols: ['Cajado de madeira', 'Livro sagrado', 'Ervas secas', 'Pena de coruja'],
  mythology:
    'Osha é o orixá guardião do conhecimento ancestral e da medicina sagrada. Foi creado por Olodumare para conhecer todos os segredos da cura e da sabedoria. Cada ervas e cada raiz possui um poder que Osha conhece e pode ensinar aos seus filhos. É ele quem fornece a sabedoria para curar enfermidades do corpo e da alma. Osha vive nas matas mais profundas e só aparece para aqueles que respeitam o conhecimento sagrado.',
  spiritualLesson: 'A verdadeira sabedoria vem da conexão com o conhecimento ancestral e o respeito pelo sagrado',
  affirmation: 'Eu conecto-me com a sabedoria curativa de Osha, abrindo meu coração para o conhecimento ancestral',
  meditation: 'Sente-se em silêncio e visualize uma luz dourada emanando do topo da sua cabeça, iluminando todos os seus caminhos',
  herbs: [
    {
      name: 'Efo Osha',
      namePortuguese: 'Alecrim',
      uses: ['Proteção espiritual', 'Clareza mental', 'Purificação', 'Cura de males'],
      preparation: 'Infusão, defumação ou banhos',
      contraindications: ['Não usar em excesso durante a gestação'],
      element: 'Fogo e Ar',
    },
    {
      name: 'Ogba Osha',
      namePortuguese: 'Arruda',
      uses: ['Proteção contra mau-olhado', 'Limpeza espiritual', 'Fortalecimento'],
      preparation: 'Banho, defumação ou chá',
      contraindications: ['Gestantes devem evitar', 'Não ingerir em grandes quantidades'],
      element: 'Terra',
    },
  ],
  healingPractices: [
    'Meditação silenciosa',
    'Ritual de chá de ervas',
    'Defumação com ervas sagradas',
    'Oração ancestral',
    'Banho de folhas',
    'Unção com azeite sagrado',
  ],
  sacredTrees: ['Carvalho', 'Gameleira', 'Iroko', 'Pau-brasil'],
  ritualPractices: [
    {
      type: 'Iniciação',
      description: 'Ritual de abertura para o caminho de Osha',
      duration: '3 dias',
      offerings: ['Alimentos brancos', 'Mel', 'Água de cheiro'],
      steps: [
        'Purificação com banho de ervas',
        'Oração a Osha',
        'Oferecimento de alimentos',
        'Abertura do caminho',
      ],
    },
    {
      type: 'Cura',
      description: 'Ritual para cura de enfermidades',
      duration: '1 dia',
      offerings: ['Ervas frescas', 'Mel', 'Flores amarelas'],
      steps: [
        'Preparação do espaço sagrado',
        'Defumação com ervas',
        'Ritual de cura',
        'Encerramento com oração',
      ],
    },
  ],
};

export function getData(): OshaData {
  return OSHA_DATA;
}

function getDataById(id: string): OshaData | undefined {
  return id === 'osha' ? OSHA_DATA : undefined;
}

function getHerbs(): HerbData[] {
  return OSHA_DATA.herbs;
}

function getRituals(): RitualData[] {
  return OSHA_DATA.ritualPractices;
}

function getHealingPractices(): string[] {
  return OSHA_DATA.healingPractices;
}

function getSacredTrees(): string[] {
  return OSHA_DATA.sacredTrees;
}

function getOshaByElement(element: string): OshaData | undefined {
  return OSHA_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OSHA_DATA : undefined;
}

function getOshaByPlanet(planet: string): OshaData | undefined {
  return OSHA_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OSHA_DATA : undefined;
}
