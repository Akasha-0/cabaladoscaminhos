/* prettier-ignore */
// @ts-nocheck
// SKIP_LINT

/**
 * Xingo Data Module
 * Spiritual data for Xingo, the orixá of sacred knowledge, divine signs, and messenger paths
 */

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

export interface XingoData {
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

const XINGO_DATA: XingoData = {
  id: 'xingo',
  name: 'Xingo',
  namePortuguese: 'Senhor dos Caminhos e dos Sinais Sagrados',
  nameYoruba: 'Xángó',
  path: 'Mensageiro dos Caminhos Divinos',
  element: 'Ar e Fogo',
  colors: ['Branco', 'Amarelo', 'Vermelho'],
  dayOfWeek: 'Quarta-feira',
  numbersSacred: [3, 6, 9, 12],
  greeting: 'Ewbá! Xingo Arô!',
  archetype: 'O Guardião dos Caminhos',
  qualities: [
    'Sabedoria',
    'Orientação',
    'Discernimento',
    'Comunicação divina',
    'Proteção dos caminhos',
    'Iluminação',
    'Verdade',
    'Justiça',
    'Determinação',
    'Força espiritual'
  ],
  challenges: [
    'Irritabilidade',
    'Impulsividade',
    'Orgulho excessivo',
    'Justiceiro em excesso',
    'Temperamento forte',
    'Intolerância',
    'Inveja'
  ],
  rulingPlanet: 'Marte',
  sacredAnimals: ['Bode', 'Cavalo', 'Galo', 'Papagaio'],
  plants: ['Pau-brasil', 'Manjericão', 'Arruda', 'Alecrim', 'Guiné'],
  offerings: [
    'Galinha',
    'Pombo',
    'Quiabo',
    'Farinha de mandioca',
    'Vinho tinto',
    'Fumo de rolo',
    'Dente de alho',
    'Pimenta',
    'Cachaça',
    'Ebó especial'
  ],
  chants: [
    'Ewbá, Xingo!',
    'Xingo arô!',
    'Lalailaiô, Xingo!',
    'Xingo tem poder!',
    'Xingo é o senhor dos caminhos!',
    'Abore, Xingo!'
  ],
  symbols: [
    'Machado de dois敢',
    'Bola de fogo',
    'Espada',
    'Pedras rituais',
    'Balanço',
    'Prancha de Xingo',
    'Maraca'
  ],
  mythology: `Xingo é o orixá do raio, do trovão e dos caminhos. Conhecido por sua força, justiceiro e protetor, Xingo é o orixá que abre os caminhos e traz a verdade. É considerado o mais poderoso dos orixás em termos de força bruta e poder de transformação. Xingo está associado aos elementos de fogo e raio, representando a purificação e a iluminação espiritual. Como guardião dos caminhos, ele é invocado para abrir portas fechadas, afastar inimigos e trazer vitória nas batalhas espirituais. Sua energia é intensa e transformadora, capaz de destruir o que não serve mais para dar espaço a algo novo. Xingo é também o orixá da justiça divina, que pune os maus e protege os justos.`,
  spiritualLesson: 'A verdadeira força está em usar o poder com sabedoria e justiça. O raio de Xingo ilumina os caminhos escuros, mas deve ser canalizado com discernimento para não destruir o que deveria ser preservado.',
  affirmation: 'Eu tenho força para superar todos os obstáculos. Xingo abre meus caminhos e ilumina minha mente com a verdade divina.',
  meditation: 'Sinto o calor do raio de Xingo purificando minha aura, abrindo os caminhos bloqueados e trazendo luz aos momentos de escuridão. Sua energia me fortalece e me guia pelo caminho da verdade.',
  herbs: [
    {
      name: 'manjericao',
      namePortuguese: 'Manjericão ou Alfavaca',
      uses: ['Proteção', 'Purificação', 'Atração de prosperidade', 'Harmonização espiritual'],
      preparation: 'Banhos, defumações, infusões para ritual, água de côco com manjericão',
      contraindications: ['Gestantes', 'Pessoas com pressão arterial alta'],
      element: 'Fogo'
    },
    {
      name: 'arruda',
      namePortuguese: 'Arruda',
      uses: ['Proteção contra energias negativas', 'Limpeza espiritual', 'Afastamento de inimigos', 'Purificação'],
      preparation: 'Banhos de imersão, defumações, sacudimento nas quatro direções',
      contraindications: ['Gestantes', 'Pessoas com pele sensível', 'Uso interno excessivo'],
      element: 'Fogo'
    },
    {
      name: 'guine',
      namePortuguese: 'Guiné ou Malícia',
      uses: ['Proteção contra mau-olhado', 'Amarração', 'Afastamento de feitiçaria', 'Força espiritual'],
      preparation: 'Banhos, defumações, amarrações,ushinctérios',
      contraindications: ['Gestantes', 'Pessoas com condições cardíacas'],
      element: 'Terra'
    },
    {
      name: 'alecrim',
      namePortuguese: 'Alecrim',
      uses: ['Purificação', 'Clareza mental', 'Proteção', 'Desenvolvimento espiritual'],
      preparation: 'Banhos, defumações, infusões, água de alecrim para limpeza',
      contraindications: ['Pessoas com epilepsia', 'Gestantes em excesso'],
      element: 'Ar'
    },
    {
      name: 'pau-brasil',
      namePortuguese: 'Pau-brasil',
      uses: ['Energia vital', 'Força', 'Prosperidade', 'Proteção contra inimigos'],
      preparation: 'Defumações com a madeira, banhos com infusão, colocá-lo no ebó',
      contraindications: ['Uso interno sem orientação especializada'],
      element: 'Fogo'
    }
  ],
  healingPractices: [
    'Banho de arruda e manjericão para proteção e purificação',
    'Defumações com pau-brasil para afastar energias negativas',
    'Oferendas de galinha ou pombo ao orixá',
    'Cânticos e orações no estilo de Xingo',
    'Ritual de abertura de caminhos com Quiabo',
    'Banho de sete portais com ervas sagradas',
    'Protesto e desataço com Guiné',
    'Amarração de ebó especial para proteção'
  ],
  sacredTrees: ['Pau-brasil', 'Gameleira', 'Mangueira', 'Iju', 'Cajueiro', 'Carvalho'],
  ritualPractices: [
    {
      type: 'Abertura de Caminhos',
      description: 'Ritual para abrir caminhos bloqueados e receber a proteção de Xingo',
      duration: '1 dia',
      offerings: ['Galinha', 'Quiabo', 'Farinha de mandioca', 'Vinho tinto', 'Pimenta'],
      steps: [
        'Preparar o local sagrado com toalha branca no chão',
        'Colocar estátua ou imagem de Xingo no centro',
        'Oferecer galinha ou pombo como sacrifício',
        'Colocar quiabo e farinha nos recipientes',
        'Acender velas branca, amarela e vermelha',
        'Fazer o ponto de Xingo com dendê',
        'Cantar os cânticos de Xingo',
        'Pedir abertura de caminhos e proteção',
        'Deixar oferendas até o outro dia',
        'Agradecer ao orixá'
      ]
    },
    {
      type: 'Protesto e Desataço',
      description: 'Ritual para desatar trabalhos negativos e feitiçarias',
      duration: '3 dias',
      offerings: ['Guiné', 'Alho', 'Pimenta', 'Fumo de rolo', 'EBó especial'],
      steps: [
        'Primeiro dia: jejum e banhos de limpeza com arruda',
        'Segundo dia: coleta de Guiné fresco ao amanhecer',
        'No local sagrado, colocar toalha branca',
        'Fazer um círculo com as folhas de Guiné',
        'Colocar alho e pimenta no centro',
        'Defumar com pau-brasil e fumo de rolo',
        'Cantar cânticos de desataço',
        'Pedir a Xingo que destrua toda feitiçaria',
        'Terce dia: banhar-se com água de Guiné',
        'Enterrar os restos da oferenda em terra virgem'
      ]
    },
    {
      type: 'Ritual de Purificação pelo Fogo',
      description: 'Ritual para purificar energias densas e recibir iluminação',
      duration: '1 noite',
      offerings: ['Lenha sagrada', 'Velas', 'Fumo de rolo', 'Vinho'],
      steps: [
        'Escolher um local aberto para a fogueira ritual',
        'Juntar lenha de pau-brasil e gameleira',
        'Acender a fogueira ao entardecer',
        'Colocar estátua de Xingo próxima ao fogo',
        'Acender velas nos quatro pontos cardeais',
        'Defumar com fumo de rolo ao redor do fogo',
        'Cantar cânticos de Xingo enquanto o fogo queima',
        'Pedir purificação e iluminação',
        'Saltar sobre o fogo (para os iniciados)',
        'Deixar o fogo apagar naturalmente'
      ]
    },
    {
      type: 'Ritual de Proteção dos Caminhos',
      description: 'Ritual para proteção espiritual antes de jornadas importantes',
      duration: '1 dia',
      offerings: ['Galinha branca', 'Farinha', 'Mel', 'Vinho doce', 'Manjericão'],
      steps: [
        'Tomar banho de limpeza com arruda ao amanhecer',
        'Preparar o local sagrado em casa',
        'Colocar toalha branca no chão',
        'Formar um círculo com farinha',
        'No centro, colocar estátua de Xingo',
        'Oferecer galinha branca',
        'Colocar manjericão e mel ao redor',
        'Acender velas nas quatro direções',
        'Fazer orações pedindo proteção nos caminhos',
        'Levar um galho de manjericão na jornada',
        'Agradecer e fechar o ritual'
      ]
    }
  ]
};

export function getData(): XingoData {
  return XINGO_DATA;
}

function getDataById(id: string): XingoData | undefined {
  return id === 'xingo' ? XINGO_DATA : undefined;
}

function getHerbs(): HerbData[] {
  return XINGO_DATA.herbs;
}

function getRituals(): RitualData[] {
  return XINGO_DATA.ritualPractices;
}

function getHealingPractices(): string[] {
  return XINGO_DATA.healingPractices;
}

function getSacredTrees(): string[] {
  return XINGO_DATA.sacredTrees;
}

function getXingoByElement(element: string): XingoData | undefined {
  return XINGO_DATA.element.toLowerCase().includes(element.toLowerCase()) ? XINGO_DATA : undefined;
}

function getXingoByPlanet(planet: string): XingoData | undefined {
  return XINGO_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? XINGO_DATA : undefined;
}

export default {
  getData,
  getDataById,
  getHerbs,
  getRituals,
  getHealingPractices,
  getSacredTrees,
  getXingoByElement,
  getXingoByPlanet,
};