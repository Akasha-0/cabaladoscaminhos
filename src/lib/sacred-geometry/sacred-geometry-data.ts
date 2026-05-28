// Sacred Geometry Data - Core geometric and spiritual mappings
// @ts-nocheck

export interface SacredGeometryData {
  platonicSolids: PlatonicSolidData[];
  sacredConstants: SacredConstant[];
  goldenRatios: GoldenRatioData;
  vesicaMeasurements: VesicaPiscisData[];
  metatronCube: MetatronCubeData;
  treeOfLifePositions: TreeOfLifeData[];
  merkabaStellations: MerkabaData[];
  merkabaActivation: MerkabaActivation;
}

export interface PlatonicSolidData {
  id: string;
  name: string;
  nameEnglish: string;
  faces: number;
  vertices: number;
  edges: number;
  element: string;
  ray: string;
  chakra: number;
  color: string;
  spiritualQuality: string;
}

export interface SacredConstant {
  name: string;
  symbol: string;
  value: number;
  description: string;
  occurrences: string[];
}

export interface GoldenRatioData {
  phi: number;
  divine: string;
  applications: string[];
  proportions: ProportionData[];
}

export interface ProportionData {
  name: string;
  ratio: string;
  spiritualMeaning: string;
  application: string;
}

export interface VesicaPiscisData {
  id: string;
  name: string;
  description: string;
  widthRatio: string;
  areaRatio: string;
  sacredUse: string;
}

export interface MetatronCubeData {
  description: string;
  circles: number;
  lines: number;
  includedSolids: string[];
  healingProperties: string[];
}

export interface TreeOfLifeData {
  sefira: string;
  path: number;
  meaning: string;
  attribute: string;
  associatedGeometry: string;
}

export interface MerkabaData {
  name: string;
  description: string;
  rotation: string;
  purpose: string;
}

export interface MerkabaActivation {
  prerequisite: string;
  preparation: string[];
  activationSteps: string[];
  colors: {
    upper: string;
    lower: string;
  };
}

const platonicSolids: PlatonicSolidData[] = [
  {
    id: 'tetrahedron',
    name: 'Tetraedro',
    nameEnglish: 'Tetrahedron',
    faces: 4,
    vertices: 4,
    edges: 6,
    element: 'Fogo',
    ray: 'Terceiro Raio',
    chakra: 3,
    color: '#FF4500',
    spiritualQuality: 'Transformação, força de vontade',
  },
  {
    id: 'hexahedron',
    name: 'Hexaedro',
    nameEnglish: 'Hexahedron (Cube)',
    faces: 6,
    vertices: 8,
    edges: 12,
    element: 'Terra',
    ray: 'Sexto Raio',
    chakra: 1,
    color: '#8B4513',
    spiritualQuality: 'Estabilidade, manifestação',
  },
  {
    id: 'octahedron',
    name: 'Octaedro',
    nameEnglish: 'Octahedron',
    faces: 8,
    vertices: 6,
    edges: 12,
    element: 'Ar',
    ray: 'Segundo Raio',
    chakra: 4,
    color: '#87CEEB',
    spiritualQuality: 'Equilíbrio, comunicação',
  },
  {
    id: 'icosahedron',
    name: 'Icosaedro',
    nameEnglish: 'Icosahedron',
    faces: 20,
    vertices: 12,
    edges: 30,
    element: 'Água',
    ray: 'Quinto Raio',
    chakra: 2,
    color: '#1E90FF',
    spiritualQuality: 'Fluxo, sacralidade',
  },
  {
    id: 'dodecahedron',
    name: 'Dodecaedro',
    nameEnglish: 'Dodecahedron',
    faces: 12,
    vertices: 20,
    edges: 30,
    element: 'Éter',
    ray: 'Primeiro Raio',
    chakra: 7,
    color: '#9932CC',
    spiritualQuality: 'Conexão divina, integração cósmica',
  },
];

const sacredConstants: SacredConstant[] = [
  {
    name: 'Pi',
    symbol: 'π',
    value: 3.14159265358979,
    description: 'Razão entre a circunferência e o diâmetro de qualquer círculo.',
    occurrences: [
      'Circunferência',
      'Flores',
      'DNA',
      'Movimentos celestiais',
      'Arco-íris',
    ],
  },
  {
    name: 'Número Áureo',
    symbol: 'φ',
    value: 1.61803398874989,
    description: 'Proporção divina presente na natureza e na arte.',
    occurrences: [
      'Espiral dourada',
      'Proporções humanas',
      'Arquitatura sagrada',
      'Galáxias',
      'Padrões botanicos',
    ],
  },
  {
    name: 'Raiz de 2',
    symbol: '√2',
    value: 1.41421356237309,
    description: 'Diagonal do quadrado unitário, proporção do Estado de Phi.',
    occurrences: [
      'Diagonal do quadrado',
      'Papel proporção A',
      'Pythagorean tuning',
    ],
  },
  {
    name: 'Raiz de 3',
    symbol: '√3',
    value: 1.73205080756887,
    description: 'Presente na proporção da Vesica Piscis e Trindade sagrada.',
    occurrences: [
      'Vesica Piscis',
      'Hexagrama',
      'Frequência 432 Hz',
      'Triangulação',
    ],
  },
  {
    name: 'Número de Euler',
    symbol: 'e',
    value: 2.71828182845904,
    description: 'Base do logaritmo natural, presente em processos de crescimento.',
    occurrences: [
      'Crescimento biológico',
      'Juros compostos',
      'Probabilidade',
      'Spirais naturais',
    ],
  },
  {
    name: 'Unidade Imaginária',
    symbol: 'i',
    value: Math.sqrt(-1),
    description: 'Raiz quadrada de menos um, conexão entre real e espiritual.',
    occurrences: [
      'Mecânica quântica',
      'Transformadas de Fourier',
      'Sistemas ondulatórios',
    ],
  },
];

const goldenRatios: GoldenRatioData = {
  phi: 1.61803398874989,
  divine: 'Proporção que representa a autocriação do universo e a expansão infinita.',
  applications: [
    'Construção de templos sagrados',
    'Composição artística',
    'Design de instrumentos musicais',
    'Arquitetura proporções',
    'Sequência de Fibonacci e natureza',
  ],
  proportions: [
    {
      name: 'Proporção Áurea',
      ratio: '1:φ (1:1.618)',
      spiritualMeaning: 'Equilíbrio entre o finito e o infinito, harmonia cósmica',
      application: 'Composição visual, arquitetura, design proporcional',
    },
    {
      name: 'Secção Áurea',
      ratio: 'a:b = a+b:a',
      spiritualMeaning: 'Fragmentação perfeita que mantém a integridade do todo',
      application: 'Cortes黄金比例, divisões harmônicas',
    },
    {
      name: 'Retângulo de Ouro',
      ratio: 'Largura:Comprimento = 1:φ',
      spiritualMeaning: 'Forma que atrai naturalmente o olhar e acalma a mente',
      application: 'Design de páginas, telas, layouts sagrados',
    },
    {
      name: 'Espiral Dourada',
      ratio: 'Crescimento exponencial baseado em φ',
      spiritualMeaning: 'Expansão infinita a partir de um ponto central, evolução espiritual',
      application: 'Naturaza, arte, meditative design',
    },
  ],
};

const vesicaMeasurements: VesicaPiscisData[] = [
  {
    id: 'vesica-basic',
    name: 'Vesica Piscis',
    description: 'Forma criada pela interseção de dois círculos iguais com raios iguais à distância entre seus centros.',
    widthRatio: '√3 : 1',
    areaRatio: '(π√3)/6 : 1',
    sacredUse: 'Fundamento do Pião de Pescador, símbolo de Cristo, base geométrica da Flor da Vida',
  },
  {
    id: 'vesica-seed',
    name: 'Semente da Vida',
    description: 'Sete círculos congruentes representando os sete dias da criação.',
    widthRatio: '1:1',
    areaRatio: '7πr²:1',
    sacredUse: 'Símbolo de criação, primeiro estágio da Flor da Vida, proteção espiritual',
  },
  {
    id: 'vesica-tree',
    name: 'Árvore da Vida',
    description: 'Dez círculos interconectados representando os dez sefirots da Cabala.',
    widthRatio: 'Varía según patrón',
    areaRatio: '10πr²:1',
    sacredUse: 'Meditação cabalística, mapear consciência, conexão com dimensões superiores',
  },
];

const metatronCube: MetatronCubeData = {
  description: 'Cubo de Metatron: estrutura geométrica sagrada derivada da Flor da Vida, contendo todos os 5 sólidos platônicos em suas proporções exatas.',
  circles: 13,
  lines: 78,
  includedSolids: [
    'Tetraedro (Fogo)',
    'Hexaedro (Terra)',
    'Octaedro (Ar)',
    'Icosaedro (Água)',
    'Dodecaedro (Éter)',
  ],
  healingProperties: [
    'Limpeza de energias densas',
    'Ativação da glândula pineal',
    'Expansão da consciência',
    'Conexão com anjos e mestres ascendidos',
    'Equilíbrio dos corpos sutis',
    'Proteção contra radiações negativas',
  ],
};

const treeOfLifePositions: TreeOfLifeData[] = [
  {
    sefira: 'Kether',
    path: 1,
    meaning: 'Coroa - Primeiro impulso divino',
    attribute: 'Vontade divina, propósito existencial',
    associatedGeometry: 'Círculo único, ponto de origem',
  },
  {
    sefira: 'Chokmah',
    path: 2,
    meaning: 'Sabedoria - Impulso criativo',
    attribute: 'Energia masculina, força formativa',
    associatedGeometry: 'Falo vertical, linha reta',
  },
  {
    sefira: 'Binah',
    path: 3,
    meaning: 'Compreensão - Forma receptiva',
    attribute: 'Energia feminina, substância primordial',
    associatedGeometry: 'Triângulo, círculo recipiente',
  },
  {
    sefira: 'Chesed',
    path: 4,
    meaning: 'Compaixão - Abundância ordenada',
    attribute: 'Misericórdia, expansão estruturada',
    associatedGeometry: 'Cubo, hexagrama vertical',
  },
  {
    sefira: 'Geburah',
    path: 5,
    meaning: 'Severidade - Julgamento',
    attribute: 'Poder, limitação necessária',
    associatedGeometry: 'Pentagrama, triângulo invertida',
  },
  {
    sefira: 'Tiphereth',
    path: 6,
    meaning: 'Beleza - Centro do equilíbrio',
    attribute: 'Harmonia, sacrificio redentor',
    associatedGeometry: 'Hexagrama central, solstício',
  },
  {
    sefira: 'Netzach',
    path: 7,
    meaning: 'Vitória - Persistência',
    attribute: 'Amor, desejo creativo',
    associatedGeometry: 'Pentágono, estrela de Vênus',
  },
  {
    sefira: 'Hod',
    path: 8,
    meaning: 'Glória - Manifestação',
    attribute: 'Glória, intelecto analítico',
    associatedGeometry: 'Octógono, mercúrio',
  },
  {
    sefira: 'Yesod',
    path: 9,
    meaning: 'Fundação - Portal',
    attribute: 'Imaginação, conexão lunar',
    associatedGeometry: 'Esfera, lua cheia',
  },
  {
    sefira: 'Malkuth',
    path: 10,
    meaning: 'Reino - Materialização',
    attribute: 'Presente terreno, manifestação física',
    associatedGeometry: 'Cubo, tetraedro',
  },
];

const merkabaStellations: MerkabaData[] = [
  {
    name: 'Estrela Tetraédrica',
    description: 'Duaspirâmides tetraédricas entrelaçadas, uma apontando para cima e outra para baixo.',
    rotation: 'Sentidos opostos, 1:1,618 de velocidade',
    purpose: 'Veículo de luz para viajes astrais e dimensões superiores',
  },
  {
    name: 'Campo Tórus',
    description: 'Campo eletromagnético em forma de torus gerado pela rotação do merkaba.',
    rotation: 'Auto-sustentável una vez ativado',
    purpose: 'Criar um espaço de proteção e expansão dimensional ao redor do corpo',
  },
];

const merkabaActivation: MerkabaActivation = {
  prerequisite: 'Purificação de corpo, mente e coração durante 9 meses de prática espiritual consistente',
  preparation: [
    'Desprendimento de energias densas e traumas',
    'Perdão de si mesmo e dos outros',
    'Compaixão incondicional',
    'Conexão com a luz divine',
  ],
  activationSteps: [
    '1. Sentar em meditação com coluna ereta',
    '2. Visualizar primeira estrela (tetraedro inferior) em vermelho escuro',
    '3. Começar a girar no sentido horário (visto de baixo)',
    '4. Visualizar segunda estrela (tetraedro superior) em azul profundo',
    '5. Começar a girar no sentido anti-horário (visto de cima)',
    '6. Permitir que ambas estrelas acelerem em direção à proporção áurea',
    '7. Sintonia: "Eu Sou um ser de luz polarizado (-), vehicular (-), servindo a luz (-) [DRYBINATION] activation",
  ],
  colors: {
    upper: '#4169E1',
    lower: '#DC143C',
  },
};

export function getData(): SacredGeometryData {
  return {
    platonicSolids,
    sacredConstants,
    goldenRatios,
    vesicaMeasurements,
    metatronCube,
    treeOfLifePositions,
    merkabaStellations,
    merkabaActivation,
  };
}