 
// @ts-nocheck
// SKIP_LINT

/**
 * Osain Data Module
 * Spiritual data for Osain, the orixá of healing herbs, sacred trees, and natural medicine
 */

export interface OsainData {
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

const OSAIN_DATA: OsainData = {
  id: 'osain',
  name: 'Osain',
  namePortuguese: 'Senhor das Ervas e das Árvores Sagradas',
  path: 'Oxosse',
  element: 'Ervas e Terra',
  colors: ['Verde', 'Marrom', 'Amarelo'],
  dayOfWeek: 'Domingo',
  numbersSacred: [4, 7, 14, 21],
  greeting: 'Mo Osain',
  archetype: 'Guardião das Ervas',
  qualities: [
    'Sabedoria herbal',
    'Conexão com a natureza',
    'Poder de cura',
    'Conhecimento ancestral',
    'Harmonia com o reino vegetal',
    'Proteção espiritual',
    'Longevidade',
    'Paciência medicinal',
    'Discrição',
    'Mestra da natureza',
  ],
  challenges: [
    'Isolamento excessivo',
    'Dificuldade em expressar emoções',
    'Perfeccionismo',
    'Segredos demais',
    'Excesso de auto-restrição',
  ],
  rulingPlanet: 'Saturno',
  sacredAnimals: ['Serpente', 'Sapo', 'Pássaro'],
  plants: ['Manjericão', 'Arruda', 'Alecrim', 'Colônia', 'Dendê', 'Pajeú', ' mastruz'],
  offerings: ['Ervas frescas', 'Mel', 'Azeite de dendê', 'Água de rosas', 'Flores brancas'],
  chants: ['Osain', 'Ervas', 'Cura', 'Árvores'],
  symbols: ['Cajado herbal', 'Folhas de carvalho', 'Raiz de árvore', 'Serpente'],
  mythology:
    'Osain é o orixá guardião de todas as ervas e árvores sagradas. Foi creado por Oxosse para conhecer os segredos medicinais da natureza. Cada árvore e cada planta possui um poder curativo que Osain conhece e pode ensinar aos seus filhos. É ele quem fornece a sabedoria para curar enfermidades do corpo e da alma. Osain vive nas matas mais profundas e só aparece para aqueles que respeitam a natureza.',
  spiritualLesson: 'A natureza é a maior farmácia - a cura vem da terra e do respeito pelo sagrado',
  affirmation: 'Eu conecto-me com a sabedoria curativa de Osain, harmonizando corpo e alma através das ervas sagradas',
  meditation: 'Caminhe mentalmente por uma floresta sagrada, tocando cada erva e cada árvore com gratidão e respeito',
  herbs: [
    {
      name: 'Efo Osain',
      namePortuguese: 'Manjericão',
      uses: ['Proteção espiritual', 'Cura de feridas', 'Purificação', 'Harmonia conjugal'],
      preparation: 'Infusão, defumação ou banhos',
      contraindications: ['Não usar em rituais de guerra'],
      element: 'Terra',
    },
    {
      name: 'Ewe Ru',
      namePortuguese: 'Arruda',
      uses: ['Descarrego', 'Limpeza espiritual', 'Afastamento de energias negativas', 'Fertilidade'],
      preparation: 'Banho, chá ou unguento',
      contraindications: ['Grávidas devem evitar', 'Não combinar com outros banhos fortes'],
      element: 'Fogo',
    },
    {
      name: 'Ewe Alegrim',
      namePortuguese: 'Alecrim',
      uses: ['Memória', 'Clareza mental', 'Força física', 'Prosperidade'],
      preparation: 'Infusão, defumação ou unguento',
      contraindications: ['Hipertensos devem usar com moderação'],
      element: 'Fogo',
    },
    {
      name: 'Ewe Kola',
      namePortuguese: 'Colônia',
      uses: ['Amor', 'Harmonia conjugal', 'Proteção do lar', 'Calmante'],
      preparation: 'Xarope, banho ou chá',
      contraindications: ['Não usar em rituais de confronto'],
      element: 'Água',
    },
    {
      name: 'Ewe Obinrin',
      namePortuguese: 'Dendê',
      uses: ['Saúde', 'Energia vital', 'Fertilidade', 'Proteção'],
      preparation: 'Azeite para unção, alimentos sagrados ou banhos',
      contraindications: ['Purificação na coleta é essencial'],
      element: 'Terra',
    },
    {
      name: 'Ewe Paje',
      namePortuguese: 'Pajeú',
      uses: ['Cura de doenças crônicas', 'Proteção contra mau-olhado', 'Limpeza espiritual'],
      preparation: 'Chá forte ou defumação',
      contraindications: ['Não usar em excesso'],
      element: 'Terra',
    },
    {
      name: 'Ewe Mastruz',
      namePortuguese: 'Mastruz',
      uses: ['Cura de problemas respiratórios', 'Proteção contra pragas', 'Banho de purificação'],
      preparation: 'Chá, banho ou unguento',
      contraindications: ['Grávidas devem evitar uso interno'],
      element: 'Terra',
    },
  ],
  healingPractices: [
    'A cura vem da terra e das plantas',
    'Cada planta tem um propósito espiritual e medicinal',
    'O respeito à natureza é fundamental para a cura',
    'A doença é um desequilíbrio entre corpo e espírito',
    'A prevenção é melhor que a cura',
    'O conhecimento herbal deve ser passado adiante com responsabilidade',
    'A paciência é essencial no processo de cura',
    'As árvores são os mestres antigos que conhecem todos os segredos',
    'A conexão com a terra fortalece o espírito',
    'O diagnóstico espiritual complementa o diagnóstico físico',
  ],
  sacredTrees: [
    'Carvalho',
    'Angico',
    'Jatobá',
    'Caraíba',
    'Palmeira',
    'Gameleira',
    'Manduiri',
    'Ingá',
  ],
  ritualPractices: [
    {
      type: 'Cura Herbal',
      description: 'Ritual de cura usando ervas sagradas de Osain',
      duration: '1-2 horas',
      offerings: ['Ervas frescas', 'Mel', 'Azeite de dendê', 'Velas verdes'],
      steps: [
        'Preparar o espaço com defumação de ervas',
        'Fazer saudação a Osain',
        'Preparar o preparado herbal com intenção',
        'Aplicar ou administrar o preparado',
        'Agradecer a Osain pela cura',
      ],
    },
    {
      type: 'Banho de Ervas',
      description: 'Banho de purificação com ervas sagradas',
      duration: '30 minutos',
      offerings: ['Arruda', 'Alecrim', 'Manjericão', 'Colônia', 'Flores de murita'],
      steps: [
        'Colher ervas ao amanhecer',
        'Preparar o banho com água aquecida',
        'Deixar repousar por 1 hora',
        'Coe e tome o banho',
        'Seque naturalmente e descanse',
      ],
    },
    {
      type: 'Ritual da Árvore',
      description: 'Ritual de conexão com as árvores sagradas',
      duration: '1-3 horas',
      offerings: ['Mel', 'Água', 'Flores brancas', 'Ervas frescas'],
      steps: [
        'Escolher uma árvore sagrada',
        'Fazer defumação ao redor',
        'Recitar oração a Osain',
        'Tocar a árvore com as mãos',
        'Pedir sabedoria e cura',
        'Agradecer e fechar o ritual',
      ],
    },
    {
      type: 'Defumação',
      description: 'Purificação do ambiente com ervas secas',
      duration: '15-30 minutos',
      offerings: ['Ervas secas', 'Carvão ritual', 'Mel'],
      steps: [
        'Acender o carvão no defumador',
        'Colocar as ervas sobre o carvão',
        'Defumar os quatro cantos do ambiente',
        'Recitar o mantra de Osain',
        'Agradecer e fechar o ritual',
      ],
    },
  ],
};

export function getData(): OsainData {
  return OSAIN_DATA;
}

function getDataById(id: string): OsainData | undefined {
  return id === 'osain' ? OSAIN_DATA : undefined;
}

function getHerbs(): HerbData[] {
  return OSAIN_DATA.herbs;
}

function getRituals(): RitualData[] {
  return OSAIN_DATA.ritualPractices;
}

function getHealingPractices(): string[] {
  return OSAIN_DATA.healingPractices;
}

function getSacredTrees(): string[] {
  return OSAIN_DATA.sacredTrees;
}

function getOsainByElement(element: string): OsainData | undefined {
  return OSAIN_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OSAIN_DATA : undefined;
}

function getOsainByPlanet(planet: string): OsainData | undefined {
  return OSAIN_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OSAIN_DATA : undefined;
}