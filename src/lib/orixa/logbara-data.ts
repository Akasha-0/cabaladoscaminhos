// @ts-nocheck
// SKIP_LINT

/**
 * Logbara Data Module
 * Spiritual data for Logbara (Oxum Logbará), the orixá of rivers, beauty, love, and golden waters
 */

export interface LogbaraData {
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

const LOGBARA_DATA: LogbaraData = {
  id: 'logbara',
  name: 'Logbara',
  namePortuguese: 'Rainha das Águas Douradas',
  nameYoruba: 'Oxum Logbará',
  path: 'Senhora das Correntes Douradas',
  element: 'Água e Ouro',
  colors: ['Amarelo', 'Dourado', 'Azul'],
  dayOfWeek: 'Sábado',
  numbersSacred: [3, 6, 9, 15, 21],
  greeting: 'Oiá! ou Oriá!',
  archetype: 'A Mãe das Águas Ricas',
  qualities: [
    'Beleza',
    'Riqueza',
    'Amor próprio',
    'Fertilidade',
    'Sabedoria feminina',
    'Sensibilidade',
    'Intuição',
    'Generosidade',
    'Elegância',
    'Poder de sedução'
  ],
  challenges: [
    'Vaidade excessiva',
    'Ambição desmedida',
    'Ciúmes',
    'Manipulação emocional',
    'Orgulho',
    'Inveja',
    'Superficialidade'
  ],
  rulingPlanet: 'Vênus',
  sacredAnimals: ['Peixe', 'Mariposa', 'Cavalo', 'Bode'],
  plants: ['Margarida', 'Rosa', 'Dama-da-noite', 'Alamanda', 'Girassol'],
  offerings: [
    'Água de colônia',
    'Perfume floral',
    'Flores amarelas e douradas',
    'Mel',
    'Açúcar',
    'Ovos',
    'Milho',
    'Banana',
    'Vinho doce',
    'Colares dourados',
    'Espelhos',
    'Pente'
  ],
  chants: [
    'Oiá, Oxum Logbará!',
    'Logbara ô, mãe da riqueza!',
    'Águas douradas me banhem!',
    'Oxum me dá prosperidade!',
    'Rainha das correntes, abre meu caminho!'
  ],
  symbols: [
    'Espelho',
    'Pente',
    'Roupas douradas',
    'Colares de ouro',
    'Vaso de água',
    'Leque',
    'Abano decorated'
  ],
  mythology: `Logbara, também conhecida como Oxum Logbará, é uma manifestação especial de Oxum,
a grande mãe das águas doces e da riqueza. Ela é a senhora das águas douradas que fluem
com abundância e prosperidade. Logbara representa o poder feminino em sua expressão mais
radiante, combinando a doçura de Oxum com a opulência e a influência política.
Ela é invocada para questões de amor, mas também para atraír riqueza, posição social
e reconhecimento. Logbara é a mãe que abençoa seus filhos com beleza, charme e
recursos materiais para viverem com dignidade e elegância.`,
  spiritualLesson: 'A verdadeira riqueza vem da conexão com sua essência divina.',
  affirmation: 'Eu sou merecedor(a) de toda a prosperidade e beleza que a vida oferece.',
  herbs: [
    {
      name: 'margarida',
      namePortuguese: 'Margarida',
      uses: ['Beleza', 'Juventude', 'Amor próprio', 'Purificação', 'Proteção'],
      preparation: 'Banhos de imersão, água de cabelo, chás para limpeza espiritual',
      contraindications: ['Gestantes', 'Pessoas com alergias a margaridas'],
      element: 'Água'
    },
    {
      name: 'rosa',
      namePortuguese: 'Rosa Amarela ou Dourada',
      uses: ['Amor', 'Prosperidade', 'Beleza', 'Harmonia', 'Agradecimentos a Oxum'],
      preparation: 'Arranjos no altar, banhos com pétalas, água perfumada',
      contraindications: ['Pessoas com pele sensível', 'Uso interno sem orientação'],
      element: 'Água'
    },
    {
      name: 'dama-da-noite',
      namePortuguese: 'Dama-da-noite',
      uses: ['Amor', 'Sedição', 'Atração', 'Prosperidade', 'Fertilidade'],
      preparation: 'Defumações, banhos de amor, água de запах',
      contraindications: ['Gestantes', 'Uso interno não recomendado'],
      element: 'Água'
    },
    {
      name: 'alamanda',
      namePortuguese: 'Alamanda',
      uses: ['Amor', 'Prosperidade', 'Alegría', 'Proteção', 'Sorte'],
      preparation: 'Banhos, defumações, chás ritualísticos',
      contraindications: ['Gestantes', 'Lactantes', 'Uso interno em excesso'],
      element: 'Água'
    },
    {
      name: 'girassol',
      namePortuguese: 'Girassol',
      uses: ['Prosperidade', 'Vitalidade', 'Beleza', 'Felicidade', 'Energia positiva'],
      preparation: 'Banhos de sol com flores, arranjos no altar, chás',
      contraindications: ['Pessoas com sensibilidade ao sol', 'Gestantes'],
      element: 'Ouro'
    }
  ],
  healingPractices: [
    'Banho de flores amarelas e douradas para beleza e prosperidade',
    'Oferendas de mel e açúcar às águas correntes',
    'Cânticos e orações no estilo de Logbara',
    'Banho de água de colônia perfumada',
    'Ritual de espelho para despertar a beleza interior',
    'Oferecer flores frescas no altar de Oxum',
    'Banho de girassol para vitalidade e prosperidade'
  ],
  sacredTrees: ['Gameleira', 'Mangueira', 'Ipê-amarelo', 'Jatobá', 'Castanheira', 'Pau-brasil'],
  ritualPractices: [
    {
      type: 'Oferenda de Águas Douradas',
      description: 'Oferenda especial para Logbara com elementos aquosos e dourados',
      duration: 'Vária',
      offerings: ['Água de colônia', 'Mel', 'Flores amarelas', 'Vinho doce', 'Ovos'],
      steps: [
        'Preparar o local sagrado com toalha amarela e azul',
        'Colocar um vaso com água fresca no centro',
        'Adicionar gotas de água de colônia na água',
        'Oferecer flores amarelas ao redor do vaso',
        'Colocar mel e açúcar em recipientes separados',
        'Acender velas amarela e dourada',
        'Fazer o ponto de Oxum com mel',
        'Cantar os cânticos de Logbara',
        'Pedir prosperidade e beleza',
        'Agradecer ao orixá e aspergir água abençoada'
      ]
    },
    {
      type: 'Ritual de Beleza e Amor',
      description: 'Ritual para despertar a beleza interior e atrair amor próprio',
      duration: '1 dia',
      offerings: ['Espelho novo', 'Pente', 'Perfume floral', 'Flores', 'Roupas novas'],
      steps: [
        'Banho de limpeza com ervas ao amanhecer',
        'No local sagrado, estender toalha amarela',
        'Colocar espelho novo coberto com pano dourado',
        'Oferecer flores frescas em volta do espelho',
        'Aplicar perfume nas bordas do espelho',
        'Recitar orações de beleza e amor próprio',
        'Olhar no espelho e affirmar qualidades positives',
        'Usar roupas novas e limpas',
        'Agradecer a Logbara pela bênção',
        'Guardar o espelho em lugar de honra'
      ]
    },
    {
      type: 'Ritual de Prosperidade nas Águas',
      description: 'Ritual para atrair abundância financeira e recursos',
      duration: '3 dias',
      offerings: ['Moedas douradas', 'Mel', 'Açúcar', 'Flores amarelas', 'Vinho doce'],
      steps: [
        'Primeiro dia: jejum parcial e banhos de limpeza',
        'Segundo dia: visita a um rio, lago ou fonte',
        'Oferecer moedas e flores às águas',
        'Lançar mel e açúcar na correnteza',
        'Fazer orações pedindo prosperidade',
        'Terceiro dia: ritual no altar caseiro',
        'Acender velas douradas',
        'Cantar cânticos de Logbara',
        'Pedir sabedoria para administrar recursos',
        'Agradecer ao orixá pelas bênçãos recebidas'
      ]
    },
    {
      type: 'Ritual do Espelho Dourado',
      description: 'Ritual para purificação e renovação da beleza espiritual',
      duration: '7 dias',
      offerings: ['Espelho', 'Pente', 'Perfume', 'Flores', 'Água de colônia'],
      steps: [
        'Escolher um espelho limpo para o ritual',
        'Primeiro dia: purificar o espelho com água e sal',
        'Banho de margaridas ao amanhecer',
        'Olhar no espelho e recitar orações de beleza',
        'Aplicar perfume nas bordas do espelho',
        'Oferecer flores frescas diariamente',
        'Renovar a água no vaso do altar',
        'No sétimo dia, usar o espelho para meditação final',
        'Pedir a Logbara que purge toda negatividade',
        'Agradecer e guardar o espelho em lugar sagrado'
      ]
    }
  ]
};

export function getData(): LogbaraData {
  return LOGBARA_DATA;
}

function getDataById(id: string): LogbaraData | undefined {
  return id === 'logbara' ? LOGBARA_DATA : undefined;
}

function getHerbs(): HerbData[] {
  return LOGBARA_DATA.herbs;
}

function getRituals(): RitualData[] {
  return LOGBARA_DATA.ritualPractices;
}

function getHealingPractices(): string[] {
  return LOGBARA_DATA.healingPractices;
}

function getSacredTrees(): string[] {
  return LOGBARA_DATA.sacredTrees;
}

function getLogbaraByElement(element: string): LogbaraData | undefined {
  return LOGBARA_DATA.element.toLowerCase().includes(element.toLowerCase()) ? LOGBARA_DATA : undefined;
}

function getLogbaraByPlanet(planet: string): LogbaraData | undefined {
  return LOGBARA_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? LOGBARA_DATA : undefined;
}
