// @ts-nocheck
// SKIP_LINT

/**
 * Ogun Data Module
 * Spiritual data for Ogun (Ogum), the orixá of iron, war, and civilization
 */

export interface OgunData {
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

const OGUN_DATA: OgunData = {
  id: 'ogun',
  name: 'Ogun',
  namePortuguese: 'Senhor do Ferro e do Trabalho',
  nameYoruba: 'Ogún',
  path: 'Ferreiro dos Campos',
  element: 'Metal e Fogo',
  colors: ['Verde', 'Preto'],
  dayOfWeek: 'Sexta-feira',
  numbersSacred: [3, 7, 9, 12],
  greeting: 'Ogunê! ou Oriê!',
  archetype: 'O Guerreiro Artesão',
  qualities: [
    'Força',
    'Coragem',
    'Determinação',
    'Proteção',
    'Justiça',
    'Honestidade',
    'Persistência',
    'Criatividade',
    'Trabalho',
    'Vitória'
  ],
  challenges: [
    'Guerra desnecessária',
    'Violência',
    'Destruição',
    'Rancor',
    'Vingança',
    'Impaciência',
    'Teimosia excessiva'
  ],
  rulingPlanet: 'Marte',
  sacredAnimals: ['Cavalo', 'Cão', 'Galo', 'Porco-espinho'],
  plants: ['Mastruz', 'Pimenta-de-macaco', 'Aipo', 'Artemísia', 'Alecrim'],
  offerings: [
    'Ferro',
    'Facas',
    'Facões',
    'Dinheiro',
    'Rapadura',
    'Dendeze',
    'Farinha de mandioca',
    'Fumo de corda',
    'Vinho de palma',
    'Coco'
  ],
  chants: [
    'Ogunê! Ogum!',
    'Ogum le ibo le o!',
    'Ogum a xêrêê!',
    'Ogun vai na frente!'
  ],
  symbols: [
    'Espada',
    'Facão',
    'Enxada',
    'Machado',
    'Bigorna',
    'Martelo',
    'Chave',
    'Foice'
  ],
  mythology: `Ogum é o orixá do ferro, patrono dos ferreiros e dos guerreiros. 
É considerado o primeiro rei de Ifé antes de Obatalá, e foi ele quem trouxe 
o fogo e as ferramentas de metal para a humanidade. Ogum abre os caminhos 
com sua espada e protege contra inimigos visíveis e invisíveis. 
Seu império estende-se por todas as ferramentas de trabalho e 
pelos trilhos de trem, sendo invocado para todas as obras humanas.`,
  spiritualLesson: 'O trabalho honesto e a persistência vencem todos os obstáculos.',
  affirmation: 'Eu tenho força e coragem para conquistar meus objetivos.',
  herbs: [
    {
      name: 'mastruz',
      namePortuguese: 'Mastruz ou Erva-de-santa-maria',
      uses: ['Proteção contra energias negativas', 'Limpeza espiritual', 'Fortificação do campo protetor'],
      preparation: 'Infusão com folhas frescas ou banhos de imersão',
      contraindications: ['Grávidas', 'Pessoas com pele sensível'],
      element: 'Metal'
    },
    {
      name: 'pimenta-de-macaco',
      namePortuguese: 'Pimenta-de-macaco ou Jambre',
      uses: ['Abertura de caminhos', 'Proteção contra feitiçaria', 'Força e coragem'],
      preparation: 'Tintura, banhos ou defumações',
      contraindications: ['Pessoas com pressão alta', 'Gestantes'],
      element: 'Fogo'
    },
    {
      name: 'alecrim',
      namePortuguese: 'Alecrim',
      uses: ['Proteção', 'Purificação', 'Força mental', 'Memória'],
      preparation: 'Infusão para banhos, defumações ou chá',
      contraindications: ['Epilépticos', 'Pessoas com sensibilidade ao alecrim'],
      element: 'Metal'
    },
    {
      name: 'artemisia',
      namePortuguese: 'Artemísia ou Nau',
      uses: ['Proteção geral', 'Harmonização', 'Alegria'],
      preparation: 'Banhos, defumações, infusões',
      contraindications: ['Gestantes', 'Pessoas com condições neurológicas'],
      element: 'Metal'
    },
    {
      name: 'aipo',
      namePortuguese: 'Aipo ou Salsão',
      uses: ['Força física', 'Coragem', 'Vitalidade'],
      preparation: 'Suco, infusão ou banhos',
      contraindications: ['Pessoas com pressão baixa', 'Gestantes'],
      element: 'Metal'
    }
  ],
  healingPractices: [
    'Banhos de ervas com mastruz e artemísia',
    'Defumações com palha de ferro',
    'Oferendas de facas e ferramentas ao orixá',
    'Oração e cânticos de proteção',
    'Amarrar ferramentas com fita verde e preta',
    'Colocar faca sob o travesseiro para proteção noturna',
    'Banho de descarrego com fumo de corda'
  ],
  sacredTrees: ['Mastruz', 'Mangueira', 'Gameleira', 'Pau-brasil', 'Ipê'],
  ritualPractices: [
    {
      type: 'Oferenda Regular',
      description: 'Oferenda semanal para Ogum com elementos de ferro e doces',
      duration: 'Vária',
      offerings: ['Ferro', 'Rapadura', 'Dendeze', 'Fumo', 'Dinheiro'],
      steps: [
        'Preparar o local sagrado com toalha verde e preta',
        'Colocar as ferramentas de ferro sobre a toalha',
        'Oferecer rapadura e dendeze',
        'Acender velas verde e preta',
        'Fazer o ponto de Ogum com dendê',
        'Cantar os cânticos de Ogum',
        'Pedir proteção e abertura de caminhos',
        'Agradecer ao orixá'
      ]
    },
    {
      type: 'Abertura de Caminhos',
      description: 'Ritual para abrir caminhos bloqueados e conquistar objetivos',
      duration: '1 dia',
      offerings: ['Facão', 'Dinheiro', 'Farinha de mandioca', 'Vinho de palma', 'Fumo de corda'],
      steps: [
        'Jejum parcial desde a manhã',
        'Banho de limpeza com mastruz ao amanhecer',
        'Colocar o facão no chão com a lâmina virada para o leste',
        'Passar dendê na lâmina',
        'Colocar farinha formando um círculo ao redor do facão',
        'Oferecer dinheiro dentro do círculo',
        'Acender velas e cânticos',
        'Deixar offerings até o anoitecer',
        'Enterrar offerings ou deixar em local sagrado'
      ]
    },
    {
      type: 'Proteção e Defesa',
      description: 'Ritual de proteção contra inimigos e energias negativas',
      duration: '1 semana',
      offerings: ['Espada pequena', 'Facas', 'Correntes', 'Fumo', 'Pimenta'],
      steps: [
        'Coletar sete facas pequenas ou pregos de ferro',
        'Amarrar com fita verde e preta',
        'Benedicar cada peça com oração',
        'Colocar em agua de mastruz por sete dias',
        'Renovar o banho diariamente',
        'No sétimo dia, fazer oferenda de fumo e pimenta',
        'Enterrar as facas em cruz na entrada da casa',
        'Acender velas pretas para proteção permanente'
      ]
    },
    {
      type: 'Iniciação de Ferreiro',
      description: 'Ritual para aqueles que trabalham com metal e ferramentas',
      duration: '3 dias',
      offerings: ['Martelo', 'Bigorna', 'Ferro em barra', 'Dendeze', 'Farinha'],
      steps: [
        'Primeiro dia: jejum e banhos de limpeza',
        'Segundo dia: meditação sobre o significado do trabalho',
        'Terceiro dia: oferenda solene ao fogo sagrado',
        'Colocar as ferramentas sobre a bigorna',
        'Bater o ferro três vezes',
        'Oferecer dendê e farinha ao fogo',
        'Receber a bênção de Ogum para o trabalho',
        'Fazer promessa de honestidade e dedicação'
      ]
    }
  ]
};

export function getData(): OgunData {
  return OGUN_DATA;
}

export function getDataById(id: string): OgunData | undefined {
  return id === 'ogun' ? OGUN_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return OGUN_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return OGUN_DATA.ritualPractices;
}

export function getHealingPractices(): string[] {
  return OGUN_DATA.healingPractices;
}

export function getSacredTrees(): string[] {
  return OGUN_DATA.sacredTrees;
}

export function getOgunByElement(element: string): OgunData | undefined {
  return OGUN_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OGUN_DATA : undefined;
}

export function getOgunByPlanet(planet: string): OgunData | undefined {
  return OGUN_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OGUN_DATA : undefined;
}
