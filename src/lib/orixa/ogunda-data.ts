// @ts-nocheck
// SKIP_LINT

/**
 * Ogunda Data Module
 * Spiritual data for Ogunda, the orixá of choices, destiny, and paths
 */

export interface OgundaData {
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

const OGUNDA_DATA: OgundaData = {
  id: 'ogunda',
  name: 'Ogunda',
  namePortuguese: 'Senhor das Decisoes e Destinos',
  nameYoruba: 'Ogunda',
  path: 'Mestre dos Caminhos e Escolhas',
  element: 'Fogo e Ar',
  colors: ['Vermelho', 'Preto', 'Amarelo'],
  dayOfWeek: 'Segunda-feira',
  numbersSacred: [4, 8, 16, 24],
  greeting: 'Ebooo! ou Akodun!',
  archetype: 'O Abridor de Caminhos',
  qualities: [
    'Determinacao inabalavel',
    'Coragem nas decisoes',
    'Protecao espiritual',
    'Conexao com Ifa',
    'Clareza de proposito',
    'Forca de vontade',
    'Capacidade de escolha',
    'Conhecimento dos caminhos',
    'Transformacao e mudanca',
    'Determinacao'
  ],
  challenges: [
    'Indecisao paralisante',
    'Medo de errar',
    'Rigidez na escolhas',
    'Impatiencia',
    'Teimosia excessiva',
    'Fuga das responsabilidades',
    'Procrastinacao nas decisoes'
  ],
  rulingPlanet: 'Marte',
  sacredAnimals: ['Cao', 'Cavalo', 'Abelha', 'Cobra'],
  plants: ['Pau-brasil', 'Aroeira', 'Mandacaru', 'Babosa', 'Erva-cidreira'],
  offerings: [
    'Velas vermelhas e pretas',
    'Flores amarelas e vermelhas',
    'Mel',
    'Farinha de mandioca',
    'Dende',
    'Garrafadas',
    'Pau-brasil',
    'Aroeira',
    'Cachorro',
    'Galinha negra'
  ],
  chants: [
    'Ogunda eeee!',
    'Ogunda oko ologbon!',
    'Aboru Aboye!',
    'Ogunda ose oluwa!',
    'Akodun loore!',
    'Orixa das escolhas, guia meu destino!'
  ],
  symbols: [
    'Pau de Ogunda',
    'Espada de Ogun',
    'Circulo de destinos',
    'Cruz de Ifa',
    'Mao abencoada',
    'Chave dos caminhos',
    'Alabe'
  ],
  mythology: 'Ogunda e um dos Odu mais importantes de Ifa, representando o momento critico da escolha humana. Este orixa governa todas as encruzilhadas da existencia, onde o ser humano deve decidir entre diferentes caminhos. Ogunda e conhecido como o abridor de caminhos, aquele que remove os obstaculos e permite que a pessoa veja claramente suas opcoes. Ogunda e tambem conectado com o fogo transformador que queima o antigo para dar lugar ao novo. Este orixa ensina que cada escolha carrega consecuencias e que a coragem de decidir e essencial para o crescimento espiritual. Ogunda e invocado quando alguém precisa de orientacao em momentos cruciais de decisao.',
  spiritualLesson: 'A vida e feita de escolhas, e Ogunda nos ensina que fugir das decisoes e tambem uma escolha, geralmente a pior delas. Cada caminho tem suas consecuencias, mas e melhor escolher com coragem do que permanecer paralisado pelo medo da duvida.',
  affirmation: 'Eu abraco a energia de Ogunda para tomar decisoes com coragem e clareza. Que os caminhos se abram diante de mim e que minha escolha me conduza ao destino correto.',
  meditation: 'Sinto a presenca de Ogunda no cruzamento da minha vida. Ele segura a espada da clareza e corta as duvidas. Vejo os caminhos abertos diante de mim e escolho com determinacao, confiando que cada escolha me aproxima do meu destino.',
  herbs: [
    {
      name: 'aroeira',
      namePortuguese: 'Aroeira',
      uses: ['Protecao', 'Forca fisica', 'Limpeza espiritual', 'Abertura de caminhos'],
      preparation: 'Banhos deimersao, defumacoes, cha para forca',
      contraindications: ['Gestantes', 'Pessoas com pressao alta'],
      element: 'Fogo'
    },
    {
      name: 'babosa',
      namePortuguese: 'Babosa',
      uses: ['Protecao do lar', 'Harmonizacao', 'Forca', 'Curacao'],
      preparation: 'Gel para ambiente, banhos, unguentos',
      contraindications: ['Uso interno excessivo', 'Gestantes'],
      element: 'Fogo'
    },
    {
      name: 'mandacaru',
      namePortuguese: 'Mandacaru',
      uses: ['Resistencia', 'Protecao', 'Determinacao', 'Forca de vontade'],
      preparation: 'Banhos de imersao, defumacoes',
      contraindications: ['Pessoas com sensibilidade cutanea'],
      element: 'Fogo'
    },
    {
      name: 'pau-brasil',
      namePortuguese: 'Pau-brasil',
      uses: ['Protecao contra inimigos', 'Justica', 'Forca', 'Transformacao'],
      preparation: 'Defumacoes, banhos de protecao, agua ritual',
      contraindications: ['Uso interno sem orientacao'],
      element: 'Fogo'
    }
  ],
  healingPractices: [
    'Banhos de aroeira para protecao e forca',
    'Defumacoes com pau-brasil para abertura de caminhos',
    'Oferendas de mel e dende ao orixa',
    'Canticos e rez as no estilo de Ogunda',
    'Ritual de escolha para decisoes importantes',
    'Banho de babosa para protecao do lar',
    'Leitura de Ifa para orientacao nas decisoes'
  ],
  sacredTrees: ['Aroeira', 'Pau-brasil', 'Mandacaru', 'Gameleira', 'Carne-de-vaca', 'Ipe'],
  ritualPractices: [
    {
      type: 'Ritual de Escolha',
      description: 'Ritual para tomar decisoes importantes com clareza e protecao',
      duration: '1 dia',
      offerings: ['Velas vermelhas', 'Mel', 'Flores amarelas', 'Aroeira', 'Farinha de mandioca'],
      steps: [
        'Preparar o local sagrado com toalha vermelha',
        'Acender velas vermelhas nos quatro pontos cardeais',
        'Colocar mel no centro como oferenda',
        'Queimar aroeira para protecao',
        'Fazer o ponto de Ogunda com dende',
        'Cantar os canticos de Ogunda',
        'Pedir clareza para a decisao necessaria',
        'Oferecer flores amarelas ao orixa',
        'Agradecer a protecao e orientacao recebida'
      ]
    },
    {
      type: 'Ritual de Abertura de Caminhos',
      description: 'Ritual para remover obstaculos e abrir novos caminhos',
      duration: '3 dias',
      offerings: ['Pau-brasil', 'Velas pretas e vermelhas', 'Mel', 'Dende', 'Farinha'],
      steps: [
        'Primeiro dia: jejum e banhos de limpeza com aroeira',
        'Segundo dia: defumacao com pau-brasil ao amanhecer',
        'No local sagrado, formar circulo com farinha de mandioca',
        'Colocar velas pretas nos cantos e vermelha no centro',
        'Oferecer mel e dende a Ogunda',
        'Cantar canticos de abertura de caminhos',
        'Pedir que os obstaculos sejam removidos',
        'Terceiro dia: banhos de protecao com babosa',
        'Agradecer ao orixa pelos caminhos abertos'
      ]
    },
    {
      type: 'Ritual de Determinacao',
      description: 'Ritual para fortalecer a vontade e tomar decisoes dificeis',
      duration: '7 dias',
      offerings: ['Velas vermelhas', 'Aroeira', 'Mel', 'Flores vermelhas', 'Pau-brasil'],
      steps: [
        'Iniciar jejum parcial na semana do ritual',
        'Banho diario de aroeira ao amanhecer',
        'Acender vela vermelha diariamente',
        'Fazer oracoes de determinacao cada manha',
        'Defumar com pau-brasil todas as noites',
        'Oferecer mel a Ogunda no setimo dia',
        'Cantar canticos de forca e coragem',
        'Pedir determinacao para seguir o caminho escolhido',
        'Fazer promessa de comprometer-se com a decisao',
        'Agradecer ao orixa pela forca recebida'
      ]
    }
  ]
};

export function getData(): OgundaData {
  return OGUNDA_DATA;
}

export function getDataById(id: string): OgundaData | undefined {
  return id === 'ogunda' ? OGUNDA_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return OGUNDA_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return OGUNDA_DATA.ritualPractices;
}

export function getHealingPractices(): string[] {
  return OGUNDA_DATA.healingPractices;
}

export function getSacredTrees(): string[] {
  return OGUNDA_DATA.sacredTrees;
}

export function getOgundaByElement(element: string): OgundaData | undefined {
  return OGUNDA_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OGUNDA_DATA : undefined;
}

export function getOgundaByPlanet(planet: string): OgundaData | undefined {
  return OGUNDA_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OGUNDA_DATA : undefined;
}