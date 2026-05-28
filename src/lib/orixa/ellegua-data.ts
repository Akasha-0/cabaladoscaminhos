// @ts-nocheck
// SKIP_LINT

/**
 * Ellegua Data Module
 * Spiritual data and configurations for Ellegua, Orixá das Encruzilhadas e Protector of Paths
 */

// Interface definitions
export interface ElleguaOfferings {
  primary: string[];
  secondary: string[];
  forbidden: string[];
}

export interface ElleguaSymbols {
  key: string;
  mãoDeOxê: string;
  crossroad: string;
  chain: string;
  redStone: string;
  goatSkull: string;
}

export interface ElleguaMythology {
  origin: string;
  story: string;
  teaching: string;
}

export interface ElleguaRitual {
  name: string;
  description: string;
  timing: string;
  steps: string[];
}

export interface ElleguaAspect {
  type: string;
  description: string;
  practice: string;
}

export interface ElleguaData {
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
  offerings: ElleguaOfferings;
  chants: string[];
  symbols: ElleguaSymbols;
  mythology: ElleguaMythology;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  rituals: ElleguaRitual[];
  aspects: ElleguaAspect[];
}

// Main data object
const ELLEGUA_DATA: ElleguaData = {
  id: 'ellegua',
  name: 'Ellegua',
  nameYoruba: 'Elegbara',
  namePortuguese: 'Senhor dos Caminhos',
  path: 'Iwori',
  element: 'Portal e Encruzilhada',
  colors: ['#B22222', '#000000', '#8B4513'],
  dayOfWeek: 'Segunda-feira',
  numbersSacred: [1, 3, 7, 11, 13],
  greeting: 'Ekô Ellegua!',
  archetype: 'O Guardião dos Caminhos',
  qualities: [
    'Proteção',
    'Abertura de caminhos',
    'Comunicação espiritual',
    'Flexibilidade',
    'Guia dos viajantes',
    'Desbloqueio',
    'Iniciação',
    'Transição',
  ],
  challenges: [
    'Bloqueios materiais',
    'Obstáculos no caminho',
    'Mau-olhado',
    'Encantamentos negativos',
    'Prisões invisíveis',
  ],
  rulingPlanet: 'Mercúrio',
  sacredAnimals: ['Cão', 'Corvo', 'Raposa', 'Bode'],
  plants: ['Mamona', 'Arruda', 'Pimenta', 'Alho'],
  offerings: {
    primary: ['Milho', 'Fumo', 'Azeite de dendê', 'Moedas', 'Mel', 'Pimenta'],
    secondary: ['Pão', 'Café', 'Gengibre', 'Cana', 'Côco'],
    forbidden: [
      'Alimentos dedicados a outros orixás',
      'Comida estragada',
      'Mentiras e falsidades',
      'Ofertas sem respeito',
    ],
  },
  chants: ['Ellegua', 'Ekú', 'Oxê', 'Oriki Ellegua', 'Eleye', 'Abebi'],
  symbols: {
    key: 'Chave de ferro que abre todas as portas do destino',
    mãoDeOxê: 'Mão de Oxê - ferramenta de manipulação do destino e proteção',
    crossroad: 'Encruzilhada - ponto de decisão e transição entre mundos',
    chain: 'Correntes - representação dos caminhos entrelaçados do destino',
    redStone: 'Pedra vermelha - proteção contra mau-olhado e bloqueios',
    goatSkull: 'Crânio de bode - símbolo da superação de obstáculos',
  },
  mythology: {
    origin:
      'Ellegua é uma das faces de Elegba/Elegua, o Orixá dos caminhos e encruzilhadas. Criado por Olodumare para ser o primeiro mensageiro entre o mundo espiritual e o humano.',
    story:
      'Ellegua é o guardião que protege todos os caminhos. Sem ele, nada pode começar ou terminar. Ele é quem abre as portas e também quem pode fechá-las. Cada encruzilhada que encontramos é um portal sagrado onde Ellegua aguarda para nos guiar. Ele conhece todos os caminhos - os fáceis e os perigosos, os que levam à luz e os que levam à escuridão.',
    teaching:
      'Na encruzilhada da vida, cada escolha abre um novo caminho. Ellegua nos ensina que não existe caminho errado, apenas diferentes lições a aprender. O importante é avançar com respeito e intenção.',
  },
  spiritualLesson:
    'Cada encruzilhada é um portal de transformação onde a escolha consciente abre novos caminhos',
  affirmation:
    'Eu peço a Ellegua que abra todos os meus caminhos, removendo obstáculos e protegendo minha jornada',
  meditation:
    'Visualize-se em uma grande encruzilhada coberta por estrelas, onde Ellegua aguarda com sua chave de ferro para abrir os caminhos que levam ao seu destino',
  rituals: [
    {
      name: 'Abertura de Caminho',
      description: 'Ritual ancestral para abrir novos caminhos quando obstáculos parecem intransponíveis',
      timing: 'Segunda-feira ao amanhecer',
      steps: [
        'Vá a uma encruzilhada significativa ao amanhecer',
        'Acenda uma vela vermelha como sinal de respeito',
        'Coloque moedas nos quatro cantos da encruzilhada',
        'Ofereça milho torrado e fumo',
        'Recite: "Ellegua, abre este caminho para mim"',
        'Peça proteção para sua jornada',
        'Deixe a oferenda até o anoitecer',
        'Colete as moedas restantes como amuleto de proteção',
      ],
    },
    {
      name: 'Proteção de Viagem',
      description: 'Ritual para proteção antes de viagens importantes ou mudanças de vida',
      timing: 'Antes de qualquer viagem ou transição',
      steps: [
        'Prepare um pequeno saco com milho, moedas e sal',
        'Adicione um pedaço de pano vermelho',
        'Faze prece a Ellegua pedindo proteção',
        'Passe o saco pelo corpo três vezes em direção anti-horária',
        'Guarde-o junto ao corpo durante toda a jornada',
        'Ao retornar, despeje o conteúdo em uma encruzilhada',
        'Agradeça a Ellegua pela proteção recebida',
      ],
    },
    {
      name: 'Desbloqueio de Destino',
      description: 'Ritual para remover bloqueios e prisões invisíveis no caminho da vida',
      timing: 'Quando sentir estagnação ou impedimento',
      steps: [
        'Identifique claramente o caminho bloqueado',
        'Vá a uma encruzilhada às sextas-feiras à noite',
        'Enterre uma chave enferrujada simbolizando a abertura',
        'Coloque azeite de dendê sobre a chave',
        'Fale suas intenções claramente para Ellegua',
        'Caminhe para trás saindo da encruzilhada sem olhar para trás',
        'Não retorne à encruzilhada pelo mesmo caminho',
      ],
    },
    {
      name: 'Saudação a Ellegua',
      description: 'Saudação diária para manter os caminhos abertos e protegidos',
      timing: 'Todas as manhãs',
      steps: [
        'Levante as mãos em direção ao céu',
        'Diga: "Ekô Ellegua!" três vezes',
        'Toque a testa com a mão direita',
        'Peça proteção para o dia que começa',
        'Entregue-se à orientação de Ellegua',
      ],
    },
  ],
  aspects: [
    {
      type: 'Guardião dos Caminhos',
      description:
        'Ellegua protege todos os que viajam, seja fisicamente ou espiritualmente, garantindo passagem segura pelos obstáculos',
      practice:
        'Recite sua saudação antes de qualquer jornada ou decisão importante',
    },
    {
      type: 'Abridor de Portas',
      description:
        'Ellegua abre os caminhos fechados e remove os bloqueios que impedem o progresso',
      practice:
        'Quando enfrentar portas fechadas, peça a Ellegua que abra o caminho necessário',
    },
    {
      type: 'Protetor Contra Mau-olhado',
      description:
        'Ellegua protege contra olhar malévolo e encantamentos negativos que causam bloqueios',
      practice:
        'Use sal e fumo para proteção, especialmente em ambientes com energia negativa',
    },
  ],
};

// Export functions
export function getData(): ElleguaData {
  return ELLEGUA_DATA;
}

export function getOfferings(): ElleguaOfferings {
  return ELLEGUA_DATA.offerings;
}

export function getRituals(): ElleguaRitual[] {
  return ELLEGUA_DATA.rituals;
}

export function getSymbols(): ElleguaSymbols {
  return ELLEGUA_DATA.symbols;
}

export function getMythology(): ElleguaMythology {
  return ELLEGUA_DATA.mythology;
}

export function getChants(): string[] {
  return ELLEGUA_DATA.chants;
}

export function getQualities(): string[] {
  return ELLEGUA_DATA.qualities;
}

export function getSacredNumbers(): number[] {
  return ELLEGUA_DATA.numbersSacred;
}

export function getSacredAnimals(): string[] {
  return ELLEGUA_DATA.sacredAnimals;
}

export function getPlants(): string[] {
  return ELLEGUA_DATA.plants;
}

export function getGreeting(): string {
  return ELLEGUA_DATA.greeting;
}

export function getSpiritualLesson(): string {
  return ELLEGUA_DATA.spiritualLesson;
}

export function getAffirmation(): string {
  return ELLEGUA_DATA.affirmation;
}

export function getMeditation(): string {
  return ELLEGUA_DATA.meditation;
}

export function getAspects(): ElleguaAspect[] {
  return ELLEGUA_DATA.aspects;
}

export function getChallenges(): string[] {
  return ELLEGUA_DATA.challenges;
}

export function getElement(): string {
  return ELLEGUA_DATA.element;
}

export function getPath(): string {
  return ELLEGUA_DATA.path;
}

export function getArchetype(): string {
  return ELLEGUA_DATA.archetype;
}