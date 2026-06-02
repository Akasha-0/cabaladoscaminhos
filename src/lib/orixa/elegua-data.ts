 
// @ts-nocheck
/**
 * Elegua Data Module
 * Spiritual data and configurations for Elegua, Orixá of the Crossroads
 */

export interface EleguaOfferings {
  primary: string[];
  secondary: string[];
  forbidden: string[];
}

export interface EleguaSymbols {
  key: string;
  mãoDeOxê: string;
  crossroad: string;
  chain: string;
  redStone: string;
}

export interface EleguaMythology {
  origin: string;
  story: string;
  teaching: string;
}

export interface EleguaRitual {
  name: string;
  description: string;
  timing: string;
  steps: string[];
}

export interface EleguaData {
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
  offerings: EleguaOfferings;
  chants: string[];
  symbols: EleguaSymbols;
  mythology: EleguaMythology;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  rituals: EleguaRitual[];
}

const ELEGUA_DATA: EleguaData = {
  id: 'elegua',
  name: 'Elegua',
  nameYoruba: 'Elegbara',
  namePortuguese: 'Senhor dos Caminhos',
  path: 'Ogbe',
  element: 'Portal',
  colors: ['#8B0000', '#000000', '#FF4500'],
  dayOfWeek: 'Segunda-feira',
  numbersSacred: [1, 3, 7, 13],
  greeting: 'Ekô!',
  archetype: 'O Trickster',
  qualities: [
    'Comunicação',
    'Oportunidade',
    'Flexibilidade',
    'Iniciação',
    'Energia',
    'Dualidade',
    'Transformação',
    'Destino',
  ],
  challenges: ['Manipulação', 'Caos', 'Traição', 'Inconstância', 'Provocação'],
  rulingPlanet: 'Mercúrio',
  sacredAnimals: ['Cachorro', 'Corvo', 'Raposa'],
  plants: ['Mamona', 'Bordão', 'Palmeira'],
  offerings: {
    primary: ['Milho', 'Fumo', 'Azeite de dendê', 'Moedas', 'Mel'],
    secondary: ['Pão', 'Guloseimas', 'Vinho', 'Gengibre', 'Cana'],
    forbidden: ['Alimentos dedicados a outros orixás', 'Comida estragada', 'Mentiras'],
  },
  chants: ['Elegba', 'Ekú', 'Oxê', 'Oriki Elegua', 'Eleye'],
  symbols: {
    key: 'Chave que abre todas as portas',
    mãoDeOxê: 'Mão de Oxê - símbolo de proteção e manipulação do destino',
    crossroad: 'Encruzilhada - local de tomada de decisões',
    chain: 'Corrente - representação dos caminhos entrelaçados',
    redStone: 'Pedra vermelha - proteção contra mau-olhado',
  },
  mythology: {
    origin: 'Elegua é um dos Orixás mais antigos, criado por Olodumare para ser o mensageiro entre o mundo espiritual e o humano.',
    story: 'Elegua trouxe o sistema de Ifá para a Terra. Conhece todos os caminhos, até os mais obscuros. É invocado primeiro em qualquer ritual, pois sem ele nada acontece. Ele é o primeiro a chegar e o último a partir. Elegua abre os caminhos mas também pode fechá-los se não for devidamente honrarado.',
    teaching: 'Cada encruzilhada é uma oportunidade de escolha consciente. O destino não está escrito, mas pode ser direcionado.',
  },
  spiritualLesson: 'Cada encruzilhada é uma oportunidade de escolha consciente',
  affirmation: 'Eu Abro novos caminhos com a energia de Elegua, transformando obstáculos em oportunidades',
  meditation: 'Visualize uma encruzilhada iluminada, onde cada direção promessa crescimento',
  rituals: [
    {
      name: 'Abertura de Caminho',
      description: 'Ritual para abrir novos caminhos quando obstacles parecem intransponíveis',
      timing: 'Segunda-feira ao amanhecer',
      steps: [
        'Acenda uma vela vermelha na encruzilhada',
        'Coloque moedas nos quatro cantos',
        'Ofereça milho e fumo',
        'Recite: "Elegua, abre este caminho para mim"',
        'Deixe a oferenda até o anoitecer',
        'Colete as moedas restantes como proteção',
      ],
    },
    {
      name: 'Proteção de Viagem',
      description: 'Ritual para proteção antes de viagens importantes',
      timing: 'Antes de qualquer viagem',
      steps: [
        'Carregue um pequeno saco com milho e moedas',
        'Faze prece a Elegua pedindo proteção',
        'Passe o saco pelo corpo três vezes',
        'Guarde-o perto do corpo durante a viagem',
        'Ao retornar, despeje o conteúdo na encruzilhada mais próxima',
      ],
    },
    {
      name: 'Desbloqueio de Destino',
      description: 'Ritual para remover bloqueios no caminho da vida',
      timing: 'Quando sentir estagnação ou impedimento',
      steps: [
        'Identifique o caminho bloqueado',
        'Vá a uma encruzilhada às sextas-feiras',
        'Enterre uma chave enferrujada simbolizando a abertura',
        'Coloque azeite de dendê sobre a chave',
        'Fale suas intenções para Elegua',
        'Caminhe para trás saindo da encruzilhada',
      ],
    },
  ],
};

export function getData(): EleguaData {
  return ELEGUA_DATA;
}

function getOfferings(): EleguaOfferings {
  return ELEGUA_DATA.offerings;
}

function getRituals(): EleguaRitual[] {
  return ELEGUA_DATA.rituals;
}

function getSymbols(): EleguaSymbols {
  return ELEGUA_DATA.symbols;
}

function getMythology(): EleguaMythology {
  return ELEGUA_DATA.mythology;
}

function getChants(): string[] {
  return ELEGUA_DATA.chants;
}

function getQualities(): string[] {
  return ELEGUA_DATA.qualities;
}

function getSacredNumbers(): number[] {
  return ELEGUA_DATA.numbersSacred;
}

function getSacredAnimals(): string[] {
  return ELEGUA_DATA.sacredAnimals;
}

function getPlants(): string[] {
  return ELEGUA_DATA.plants;
}

function getGreeting(): string {
  return ELEGUA_DATA.greeting;
}

function getSpiritualLesson(): string {
  return ELEGUA_DATA.spiritualLesson;
}

function getAffirmation(): string {
  return ELEGUA_DATA.affirmation;
}

function getMeditation(): string {
  return ELEGUA_DATA.meditation;
}