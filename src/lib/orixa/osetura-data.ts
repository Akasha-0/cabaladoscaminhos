// @ts-nocheck
// SKIP_LINT

/**
 * Osetura Data Module
 * Spiritual data for Osetura, the orixá of wisdom, crossroads, and divine alignment
 */

export interface OseturaData {
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

const OSETURA_DATA: OseturaData = {
  id: 'osetura',
  name: 'Osetura',
  namePortuguese: 'Senhor dos Destinos e Cruzadas',
  nameYoruba: 'Òsétùrá',
  path: 'Guardião dos Caminhos e Decisões',
  element: 'Ar e Éter',
  colors: ['Azul', 'Branco', 'Roxo'],
  dayOfWeek: 'Domingo',
  numbersSacred: [3, 7, 12, 21],
  greeting: 'Eparrei! ou O货币政策!',
  archetype: 'O Guardião dos Caminhos',
  qualities: [
    'Sabedoria divina',
    'Discernimento',
    'Alinhamento espiritual',
    'Conexão com o Sagrado',
    'Clareza mental',
    'Orientação nos momentos de decisão',
    'Proteção nos cruzamentos da vida',
    'Compreensão dos mistérios',
    'Paciência',
    'Humildade'
  ],
  challenges: [
    'Indecisão crônica',
    'Medo das mudanças',
    'Superstição excessiva',
    'Rigidez mental',
    'Isolamento espiritual',
    'Procrastinação nas decisões importantes',
    'Autossabotagem'
  ],
  rulingPlanet: 'Mercúrio',
  sacredAnimals: ['Coruja', 'Raposa', 'Gato', 'Cobra'],
  plants: ['Alfa-vaca', 'Manjericão', 'Alecrim', 'Flor de beija-flor', 'Erva-doce'],
  offerings: [
    'Flores brancas e azuis',
    'Velas azuis e roxas',
    'Água de flor de laranja',
    'Alfa-vaca',
    'Obí (nozes de ifá)',
    'Palhas processional',
    'Farinha de mandioca',
    'Mel',
    'Dendê',
    'Dinheiro'
  ],
  chants: [
    'Eparrei, Osetura!',
    'Osetura ó,ogun malê!',
    'Imu Osetura ibeji!',
    'O货币政策 ara iyá!',
    'Aboru Aboye!',
    'Orixá que abre os caminhos, guia meus passos!'
  ],
  symbols: [
    'Obí (nozes de ifá)',
    'Ervanário ritual',
    'Toalha processional',
    'Vara de comando',
    'Prancha de divinação',
    'Casa de Ogun tiwa',
    'Mão de Osetura'
  ],
  mythology: `Osetura é um orixá de grande importância na tradição iorubá, 
conhecido como o guardião dos cruzamentos e dos caminhos da vida. 
É considerado um dos orixás mais próximos de Olodumare, o Deus criador, 
e possui a capacidade de revelar os caminhos corretos a serem seguidos. 
Osetura é invoked em momentos de decisões importantes, quando alguém 
precisa de clareza espiritual para escolher entre diferentes opções. 
Ele habita os cruzamentos, os momentos de transição, e as encruzilhadas 
da vida, onde却很 intervém para guiar os seres humanos em direção ao 
seu destino correto. Conectado à tradição de Ifá, Osetura conhece todos 
os oduns (segredos sagrados) e pode revelar o que está oculto aos olhos comuns.`,
  spiritualLesson: `Nas encruzilhadas da vida, a sabedoria está em pedir 
orientação antes de agir. Osetura nos ensina que toda decisão deve ser 
tomada com clareza espiritual ehumildade, reconhecendo que há forças 
maiores guiando nossos caminhos.`,
  affirmation: `Eu clamo a sabedoria de Osetura para guiar meus passos. 
Que a clareza divina ilumine meu caminho e me conduite ao destino correto.`,
  meditation: `Sinto a presença de Osetura no cruzamento da minha vida. 
Ele segura a tocha da sabedoria e ilumina cada escolha. Penso nas decisões 
que preciso tomar e peço sua orientação para seguir pelo caminho certo.`,
  herbs: [
    {
      name: 'alfavaca',
      namePortuguese: 'Alfa-vaca ou Alfavaca',
      uses: ['Clareza mental', 'Orientação espiritual', 'Proteção em viagens', 'Harmonização do ambiente'],
      preparation: 'Banhos de imersão, defumações, infusões para banhos de ambiente',
      contraindications: ['Gestantes', 'Pessoas com pele sensível', 'Uso interno em excesso'],
      element: 'Éter'
    },
    {
      name: 'manjericão',
      namePortuguese: 'Manjericão ou Alfavaca',
      uses: ['Sabedoria', 'Proteção', 'Harmonização', 'Conexão espiritual'],
      preparation: 'Banhos, defumações, chá para proteção do ambiente',
      contraindications: ['Gestantes', 'Pessoas com pressão baixa'],
      element: 'Ar'
    },
    {
      name: 'alecrim',
      namePortuguese: 'Alecrim',
      uses: ['Dissipar negativas', 'Fortaleza mental', 'Prosperidade', 'Purificação'],
      preparation: 'Banhos de limpeza, defumações, infusões para limpeza espiritual',
      contraindications: ['Pessoas com epilepsia', 'Gestantes em excesso'],
      element: 'Ar'
    },
    {
      name: 'erva-doce',
      namePortuguese: 'Erva-doce',
      uses: ['Harmonização', 'Suavização de conflitos', 'Proteção', 'Atração de boas energias'],
      preparation: 'Chás, banhos, defumações com轻柔 movimento',
      contraindications: ['Pessoas com sensibilidade digestiva'],
      element: 'Ar'
    }
  ],
  healingPractices: [
    'Banhos de alfa-vaca para clareza mental',
    'Defumações com alecrim para proteção',
    'Oferendas de obí e flores ao orixá',
    'Cânticos e orações no estilo de Osetura',
    'Ritual de十字路口 para atrair orientação divina',
    'Banho de flores com água de laranja',
    'Leitura de Ifá para decisões importantes'
  ],
  sacredTrees: ['Gameleira', 'Oitizeiro', 'Barriguda', 'Manga', 'Jatobá', 'Cajueiro'],
  ritualPractices: [
    {
      type: 'Oferenda de Orientação',
      description: 'Oferenda para pedir clareza divina em momentos de decisão',
      duration: 'Vária',
      offerings: ['Flores brancas', 'Velas azuis', 'Obí', 'Mel', 'Farinha de mandioca'],
      steps: [
        'Preparar o local sagrado com toalha azul e branca',
        'Colocar as nozes de obí sobre a toalha em sagrado',
        'Oferecer flores brancas como símbolo de pureza',
        'Colocar mel em recipiente de cerâmica',
        'Acender velas azul e roxa',
        'Fazer o ponto de Osetura com dendê',
        'Cantar os cânticos de Osetura',
        'Pedir sabedoria na tomada de decisão',
        'Agradecer ao orixá por sua orientação'
      ]
    },
    {
      type: 'Ritual do Cruzamento',
      description: 'Ritual de proteção espiritual quando se enfrenta uma encruzilhada',
      duration: '1 dia',
      offerings: ['Flores azuis', 'Água de flor de laranja', 'Palha processional', 'Alfa-vaca'],
      steps: [
        'Jejum espiritual desde a manhã',
        'Banho de limpeza com alfa-vaca ao amanhecer',
        'No local sagrado, colocar toalha azul no chão',
        'Formar um círculo com farinha de mandioca',
        'No centro, colocar água de flor de laranja',
        'Ao redor, disposição de flores azuis',
        'Acender velas e fazer cânticos de Osetura',
        'Pedir proteção no cruzamento da vida',
        'Deixar oferendas até o próximo dia',
        'Tomar decisão com clareza recebida'
      ]
    },
    {
      type: 'Ritual de Sabedoria',
      description: 'Ritual para receber orientação divina em dúvidas importantes',
      duration: '3 dias',
      offerings: ['Obí', 'Alecrim', 'Mel', 'Flores brancas', 'Velas roxas'],
      steps: [
        'Primeiro dia: jejum e banhos de limpeza com alfa-vaca',
        'Segundo dia: oferenda de obí e alecrim com orações',
        'Terceiro dia: defumação com alecrim e flores brancas',
        'Cantar cânticos de Osetura em busca de sabedoria',
        'Pedir orientação para os caminhos a seguir',
        'Fazer promessa de seguir a orientação recebida',
        'Agradecer ao orixá por sua presença'
      ]
    }
  ]
};

export function getData(): OseturaData {
  return OSETURA_DATA;
}

export function getDataById(id: string): OseturaData | undefined {
  return id === 'osetura' ? OSETURA_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return OSETURA_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return OSETURA_DATA.ritualPractices;
}

export function getHealingPractices(): string[] {
  return OSETURA_DATA.healingPractices;
}

export function getSacredTrees(): string[] {
  return OSETURA_DATA.sacredTrees;
}

export function getOseturaByElement(element: string): OseturaData | undefined {
  return OSETURA_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OSETURA_DATA : undefined;
}

export function getOseturaByPlanet(planet: string): OseturaData | undefined {
  return OSETURA_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OSETURA_DATA : undefined;
}
