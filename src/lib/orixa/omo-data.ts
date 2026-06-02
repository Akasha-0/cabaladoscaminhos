// @ts-nocheck
// SKIP_LINT

/**
 * Omo Data Module
 * Spiritual data and configurations for Omo, the orixá of children, initiates, and new beginnings
 */

// Interface definitions
export interface OmoOfferings {
  required: string[];
  optional: string[];
  forbidden: string[];
}

export interface OmoSymbols {
  primary: string[];
  secondary: string[];
  sacred: string[];
}

export interface OmoMythology {
  origin: string;
  stories: string[];
  sacredPlaces: string[];
}

export interface OmoRitual {
  name: string;
  description: string;
  frequency: string;
  elements: string[];
}

export interface OmoAspect {
  name: string;
  description: string;
  qualities: string[];
}

export interface OmoData {
  name: string;
  description: string;
  greeting: string;
  qualities: string[];
  element: string;
  path: string;
  archetype: string;
  numbersSacred: number[];
  daysSacred: string[];
  colors: string[];
  foods: string[];
  offerings: OmoOfferings;
  symbols: OmoSymbols;
  mythology: OmoMythology;
  rituals: OmoRitual[];
  chants: string[];
  sacredAnimals: string[];
  plants: string[];
  affirmation: string;
  meditation: string;
  spiritualLesson: string;
  challenges: string[];
  aspects: OmoAspect[];
}

// Main data object
const OMO_DATA: OmoData = {
  name: 'Omo',
  description: 'Omo é o orixá das crianças, dos iniciados e dos novos começos. Representa a pureza, a inocência e o potencial infinito de cada ser. É quem abençoa novos nascimentos e protege os mais jovens.',
  greeting: 'Ewu Omo! (Saúde da criança!)',
  qualities: [
    'pureza',
    'inocência',
    'potencial',
    'renovação',
    'proteção',
    'juventude',
    'esperança',
    'criatividade',
    'espontaneidade',
    'confiança',
  ],
  element: 'água',
  path: 'Iniciação e Novos Caminhos',
  archetype: 'O Recém-Nascido Espiritual',
  numbersSacred: [3, 7, 12],
  daysSacred: ['segunda-feira', 'quinta-feira'],
  colors: ['branco', 'amarelo', 'dourado'],
  foods: ['doce de coco', 'pamonha', 'canjica', 'frutas tropicais'],
  offerings: {
    required: [
      'Água fresca',
      'Flores brancas',
      'Doces de coco',
      'Pão branco',
    ],
    optional: [
      'Frutas tropicais',
      'Leite',
      'Mel',
      'Perfume floral',
    ],
    forbidden: [
      'Carnes escuras',
      'Bebidas alcoólicas',
      'Comidas muito condimentadas',
    ],
  },
  symbols: {
    primary: ['bebê', 'berço', 'ovo'],
    secondary: ['ber清凉', 'água', 'flor de algodão'],
    sacred: ['colher de madeira', 'panela branca', 'fio branco'],
  },
  mythology: {
    origin: 'Omo é filho(a) de Yemoja, a Mãe das Águas. Cada criança que nasce traz consigo uma porção da energia de Omo, representando o ciclo contínuo de vida e renovação espiritual.',
    stories: [
      'Omo nasceu das lágrimas de Yemoja ao ver a primeira criança chorar de fome. Ao tocar as lágrimas no chão, nasceu Omo, que trouxe a abundância para a terra.',
      'Quando os orixás crearon as obrigações, foi Omo quem ensinou os humanos a cuidar de suas crianças, estabelecendo os rituais de proteção.',
      'Omo ajuda todo ser humano a encontrar sua criança interior, rezando para que o coração mantenha a pureza e a esperança.',
    ],
    sacredPlaces: [
      'Lagos de água doce',
      'Fontes de água limpa',
      'Ramos de árvores frutíferas',
      'Quintais de casas com crianças',
    ],
  },
  rituals: [
    {
      name: 'Saída do berço',
      description: 'Ritual realizado quando uma criança faz seu primeiro ano, simbolizando a transição da infância para uma nova fase espiritual.',
      frequency: 'Anual',
      elements: ['Água de Omo', 'Flores brancas', 'Pãozinho', 'Oração de proteção'],
    },
    {
      name: 'Abençoar novos projetos',
      description: 'Ritual para pedir proteção e pureza em novos empreendimentos, invocando a energia de novos começos.',
      frequency: 'A cada novo começo',
      elements: ['Água', 'Branco', 'Semente', 'Intenção pura'],
    },
    {
      name: 'Proteção infantil',
      description: 'Ritual para proteger crianças de influências negativas e fortalezas sua conexão espiritual desde cedo.',
      frequency: 'Mensal',
      elements: ['Flor de algodão', 'Fio branco', 'Oração', 'Água abençoada'],
    },
    {
      name: 'Renovação da criança interior',
      description: 'Ritual para adultos que desejam reconectar-se com sua pureza infantil e encontrar renovação espiritual.',
      frequency: 'Anual ou quando necessário',
      elements: ['Espelho', 'Água', 'Flores', 'Confissão de pureza'],
    },
  ],
  chants: [
    'Omo, Omo, água fresca!',
    'Criança sagrada, protegei-nos!',
    'Ewu Omo, saúde da criança!',
    'Omo Yemoja, dai-nos pureza!',
    'Berço de bênçãos, protegei-nos!',
  ],
  sacredAnimals: [
    'pomba branca',
    'borboleta branca',
    'garça',
    'peixe-de-água-doce',
  ],
  plants: [
    'flor de algodão',
    'lírio branco',
    'jasmim',
    'cravo branco',
    'alamanda branca',
  ],
  affirmation: 'Eu sou puro em minha essência. Cada novo dia traz renovação e possibilidade infinita. Permito que a criança interior floresça em mim.',
  meditation: 'Sente-se em paz. Imagine-se como uma criança nos braços de Yemoja, cercado por águas puras e brancas. Sinta a proteção e a pureza envolvendo seu ser. Permita que toda preocupação e peso se dissolvam como gotas de água pura.',
  spiritualLesson: 'Omo ensina que cada novo começo carrega a pureza e o potencial do início. Não importa quantas vezes tentamos falhar - a criança interior sempre pode renascer com esperança e frescor. A verdadeira sabedoria está em manter um coração puro como o de uma criança.',
  challenges: [
    'Perder a pureza e esperança com o tempo',
    'Ignorar a criança interior',
    'Fechar-se para novos começos',
    'Tornar-se amargo com experiências negativas',
  ],
  aspects: [
    {
      name: 'Omo-Ibeji',
      description: 'Omo conectado aos gêmeos sagrados, representando a proteção de crianças gêmeas.',
      qualities: ['proteção gêmea', 'dualidade sagrada', 'equilíbrio'],
    },
    {
      name: 'Omo-Oba',
      description: 'Omo criança de Oxum, trazendo beleza e delicadeza aos novos inícios.',
      qualities: ['beleza', 'delicadeza', ' ternura'],
    },
    {
      name: 'Omo-Ogun',
      description: 'Omo criança de Ogum, representando a coragem nos novos caminhos.',
      qualities: ['coragem', 'força inicial', 'determinação'],
    },
    {
      name: 'Omo-Exu',
      description: 'Omo criança de Exu, representando a adaptação e flexibilidade nos novos começos.',
      qualities: ['adaptabilidade', 'flexibilidade', 'comunicação'],
    },
  ],
};

// Export functions
export function getData(): OmoData {
  return OMO_DATA;
}

function getOfferings(): OmoOfferings {
  return OMO_DATA.offerings;
}

function getRituals(): OmoRitual[] {
  return OMO_DATA.rituals;
}

function getSymbols(): OmoSymbols {
  return OMO_DATA.symbols;
}

function getMythology(): OmoMythology {
  return OMO_DATA.mythology;
}

function getChants(): string[] {
  return OMO_DATA.chants;
}

function getQualities(): string[] {
  return OMO_DATA.qualities;
}

function getSacredNumbers(): number[] {
  return OMO_DATA.numbersSacred;
}

function getSacredAnimals(): string[] {
  return OMO_DATA.sacredAnimals;
}

function getPlants(): string[] {
  return OMO_DATA.plants;
}

function getGreeting(): string {
  return OMO_DATA.greeting;
}

function getSpiritualLesson(): string {
  return OMO_DATA.spiritualLesson;
}

function getAffirmation(): string {
  return OMO_DATA.affirmation;
}

function getMeditation(): string {
  return OMO_DATA.meditation;
}

function getAspects(): OmoAspect[] {
  return OMO_DATA.aspects;
}

function getChallenges(): string[] {
  return OMO_DATA.challenges;
}

function getElement(): string {
  return OMO_DATA.element;
}

function getPath(): string {
  return OMO_DATA.path;
}

function getArchetype(): string {
  return OMO_DATA.archetype;
}

function getColors(): string[] {
  return OMO_DATA.colors;
}

function getDaysSacred(): string[] {
  return OMO_DATA.daysSacred;
}

function getFoods(): string[] {
  return OMO_DATA.foods;
}