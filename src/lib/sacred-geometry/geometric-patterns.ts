export type PatternCategory = 
  | 'platonic' 
  | 'stellar' 
  | 'flower' 
  | 'knot' 
  | 'spiral';

export type MetatronRelation = 
  | 'cube' 
  | 'merkaba' 
  | 'tree' 
  | 'flower';

export interface GeometricPattern {
  id: string;
  name: string;
  nameEnglish: string;
  category: PatternCategory;
  description: string;
  symbolism: string;
  color: string;
  vertices: number;
  edges: number;
  faces?: number;
  metatronRelation: MetatronRelation;
  sefirots: string[];
  chakras: number[];
  frequencies: string[];
  elements: string[];
 阴阳: string;
  planets?: string[];
  meditation: string;
}

export const GEOMETRIC_PATTERNS: GeometricPattern[] = [
  {
    id: 'tetrahedron',
    name: 'Tetraedro',
    nameEnglish: 'Tetrahedron',
    category: 'platonic',
    description: 'Sólido platônico com 4 faces triangulares, 4 vértices e 6 arestas. È o elemento fogo na tradição elemental.',
    symbolism: 'Elemento fogo, força de vontade, ação rápida, transformação, acesso ao terceiro raio da inteligência espiritual.',
    color: '#FF4500',
    vertices: 4,
    edges: 6,
    faces: 4,
    metatronRelation: 'cube',
    sefirots: ['Geburah'],
    chakras: [3],
    frequencies: ['417 Hz', '528 Hz'],
    elements: ['Fogo'],
    阴阳: 'Yang',
    planets: ['Marte'],
    meditation: 'Visualize um tetraedro com base no chão e vértice apontando para o céu, respirando energia de transformação.',
  },
  {
    id: 'hexahedron',
    name: 'Hexaedro',
    nameEnglish: 'Hexahedron (Cube)',
    category: 'platonic',
    description: 'Sólido platônico com 6 faces quadradas, 8 vértices e 12 arestas. È o elemento terra na tradição elemental.',
    symbolism: 'Elemento terra, estabilidade, manifestação física, estrutura, os 6 dias da criação antes do shabbat.',
    color: '#8B4513',
    vertices: 8,
    edges: 12,
    faces: 6,
    metatronRelation: 'cube',
    sefirots: ['Malkuth'],
    chakras: [1],
    frequencies: ['396 Hz', '432 Hz'],
    elements: ['Terra'],
    阴阳: 'Yin',
    planets: ['Saturno'],
    meditation: 'Medite sobre um cubo ancorado, permitindo que a energia da terra estabilize sua prática espiritual.',
  },
  {
    id: 'octahedron',
    name: 'Octaedro',
    nameEnglish: 'Octahedron',
    category: 'platonic',
    description: 'Sólido platônico com 8 faces triangulares, 6 vértices e 12 arestas. È o elemento ar na tradição elemental.',
    symbolism: 'Elemento ar, mente, intelecto, comunicação, equilíbrio entre o céu e a terra. Forma sagrada do segundo raio.',
    color: '#87CEEB',
    vertices: 6,
    edges: 12,
    faces: 8,
    metatronRelation: 'cube',
    sefirots: ['Chesed'],
    chakras: [4],
    frequencies: ['528 Hz', '639 Hz'],
    elements: ['Ar'],
    阴阳: 'Yang',
    planets: ['Mercúrio'],
    meditation: 'Permita que o ar elemental purifique seu espaço interior, respirando através das 8 faces luminosas.',
  },
  {
    id: 'icosahedron',
    name: 'Icosaedro',
    nameEnglish: 'Icosahedron',
    category: 'platonic',
    description: 'Sólido platônico com 20 faces triangulares, 12 vértices e 30 arestas. È o elemento água na tradição elemental.',
    symbolism: 'Elemento água, emoção, fluxo, sacralidade, o quinto elemento (éter/quintessência). Portão para dimensões superiores.',
    color: '#1E90FF',
    vertices: 12,
    edges: 30,
    faces: 20,
    metatronRelation: 'cube',
    sefirots: ['Gevurah'],
    chakras: [2],
    frequencies: ['417 Hz', '741 Hz'],
    elements: ['Água'],
    阴阳: 'Yin',
    planets: ['Vênus'],
    meditation: 'Sinta a água sagrada fluindo através das 20 faces, carregando suas emoções para a transformação.',
  },
  {
    id: 'dodecahedron',
    name: 'Dodecaedro',
    nameEnglish: 'Dodecahedron',
    category: 'platonic',
    description: 'Sólido platônico com 12 faces pentagonais, 20 vértices e 30 arestas. Associado ao cosmos e à consciência superior.',
    symbolism: 'Cosmos, universo, o divino masculino, o Akasha, acesso aos mistérios da criação. Forma do duodécimo raio.',
    color: '#9932CC',
    vertices: 20,
    edges: 30,
    faces: 12,
    metatronRelation: 'cube',
    sefirots: ['Chokmah'],
    chakras: [6],
    frequencies: ['528 Hz', '963 Hz'],
    elements: ['Éter'],
    阴阳: 'Yang',
    planets: ['Júpiter'],
    meditation: 'Desça através das 12 faces pentagonais para alcançar a consciência cósmica e a sabedoria do universo.',
  },
  {
    id: 'metatrons-cube',
    name: 'Cubo de Metatron',
    nameEnglish: "Metatron's Cube",
    category: 'platonic',
    description: 'Estrutura geométrica sagrada composta por 13 círculos conectados por linhas, representando todos os sólidos platônicos.',
    symbolism: 'Porta para dimensões superiores, purificação da energia, cura arcangélica, o veículo de luz de Metatron.',
    color: '#FFD700',
    vertices: 13,
    edges: 78,
    faces: 0,
    metatronRelation: 'cube',
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakras: [4, 5, 6, 7],
    frequencies: ['528 Hz', '639 Hz', '741 Hz', '852 Hz', '963 Hz'],
    elements: ['Fogo', 'Ar', 'Água', 'Terra', 'Éter'],
    阴阳: 'Equilíbrio',
    planets: ['Sol'],
    meditation: 'Visualize o Cubo de Metatron emanando luz dorada, transformando negative energia em luz sagrada.',
  },
  {
    id: 'flower-of-life',
    name: 'Flor da Vida',
    nameEnglish: 'Flower of Life',
    category: 'flower',
    description: 'Padrão de círculos sobrepostos igualmente espaçados formando uma flor de 19 pétalas, padrão primordial da criação.',
    symbolism: 'Unicidade de toda vida, creación primordial, campos morfogenéticos, a matrix da existência. Template para todos os sólidos platônicos.',
    color: '#FFD700',
    vertices: 19,
    edges: 0,
    faces: 0,
    metatronRelation: 'flower',
    sefirots: ['Kether', 'Binah'],
    chakras: [7, 6],
    frequencies: ['528 Hz', '639 Hz'],
    elements: ['Éter'],
    阴阳: 'Yang',
    planets: ['Sol'],
    meditation: 'Contemple o padrão infinito da Flor da Vida, permitindo que sua energia de criação preencha seu ser.',
  },
  {
    id: 'seed-of-life',
    name: 'Semente da Vida',
    nameEnglish: 'Seed of Life',
    category: 'flower',
    description: 'Primeiros 7 círculos do padrão Flor da Vida, representando os 7 dias da criação. Semente de toda geometria sagrada.',
    symbolism: 'Os 7 dias da criação, os 7 chakras principais, os 7 raios da cura, o início da manifestação física.',
    color: '#FFA500',
    vertices: 7,
    edges: 0,
    faces: 0,
    metatronRelation: 'flower',
    sefirots: ['Kether'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    frequencies: ['285 Hz', '396 Hz', '417 Hz', '528 Hz', '639 Hz', '741 Hz', '852 Hz'],
    elements: ['Éter'],
    阴阳: 'Yang',
    planets: ['Sol', 'Lua'],
    meditation: 'Sinta os 7 círculos emanando do seu centro, cada um expandindo consciência e cura através dos chakras.',
  },
  {
    id: 'egg-of-life',
    name: 'Ovo da Vida',
    nameEnglish: 'Egg of Life',
    category: 'flower',
    description: 'Oito círculos que formam uma estrutura semelhante a um embrião humano de 8 células. Fase intermediária da criação.',
    symbolism: 'Desenvolvimento embrionário, criação da forma física, os 8 estágios da formação humana, expansão da vida.',
    color: '#FFC0CB',
    vertices: 8,
    edges: 0,
    faces: 0,
    metatronRelation: 'flower',
    sefirots: ['Chesed'],
    chakras: [2, 3, 4],
    frequencies: ['528 Hz', '639 Hz'],
    elements: ['Água'],
    阴阳: 'Yin',
    planets: ['Lua'],
    meditation: 'Visualize o Ovo da Vida dentro do seu campo energético, nutindo sua forma espiritual e física.',
  },
  {
    id: 'tree-of-life',
    name: 'Árvore da Vida',
    nameEnglish: 'Tree of Life',
    category: 'knot',
    description: 'Diagrama místico de 10 sefirots conectados por 22 caminhos, mapa da consciência e da criação no Kabbalah.',
    symbolism: 'O mapa do universo, a descida da consciência divina, os 10 aspectos de Ein Sof, a estrutura da realidade.',
    color: '#9ACD32',
    vertices: 10,
    edges: 22,
    faces: 0,
    metatronRelation: 'tree',
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    frequencies: ['396 Hz', '417 Hz', '528 Hz', '639 Hz', '741 Hz', '852 Hz', '963 Hz'],
    elements: ['Fogo', 'Ar', 'Água', 'Terra', 'Éter'],
    阴阳: 'Equilíbrio',
    planets: ['Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'],
    meditation: 'Trace a Árvore da Vida da base ao topo, ativando cada sefirot em sua jornada espiritual.',
  },
  {
    id: 'merkaba',
    name: 'Merkaba',
    nameEnglish: 'Merkaba',
    category: 'stellar',
    description: 'Estrela tetraédrica de luz - duas pirâmides tetraédricas interconectadas, criando um veículo de luz para ascensão.',
    symbolism: 'Veículo de luz, ascensão dimensional, fusão do masculino e feminino sagrado, portão para outros planos.',
    color: '#00CED1',
    vertices: 8,
    edges: 12,
    faces: 8,
    metatronRelation: 'merkaba',
    sefirots: ['Tiphereth', 'Kether'],
    chakras: [4, 7],
    frequencies: ['528 Hz', '741 Hz', '963 Hz'],
    elements: ['Fogo', 'Ar'],
    阴阳: 'Equilíbrio',
    planets: ['Sol'],
    meditation: 'Gire os campos eletromagnéticos do merkaba, ativando sua ascensão através dos reinos da luz.',
  },
  {
    id: 'star-tetrahedron',
    name: 'Estrela Tetraédrica',
    nameEnglish: 'Star Tetrahedron',
    category: 'stellar',
    description: 'Forma estelar composta por dois tetraedros sobrepostos, um apontando para cima e outro para baixo.',
    symbolism: 'Equilíbrio entre opostos, céu e terra, luz e escuridão, a polaridade divina manifestada.',
    color: '#9400D3',
    vertices: 8,
    edges: 12,
    faces: 8,
    metatronRelation: 'merkaba',
    sefirots: ['Tiphereth'],
    chakras: [4, 5],
    frequencies: ['528 Hz', '639 Hz'],
    elements: ['Fogo'],
    阴阳: 'Equilíbrio',
    planets: ['Marte'],
    meditation: 'Sinta os dois tetraedros girando em direções opostas, equilibrando as energias masculina e feminina.',
  },
  {
    id: 'hexagram',
    name: 'Hexagrama',
    nameEnglish: 'Hexagram',
    category: 'stellar',
    description: 'Estrela de seis pontas formada por dois triângulos sobrepostos, representando a união de opostos complementares.',
    symbolism: 'União do masculino (fogo) e feminino (água), macrocosmo e microcosmo, o homem celestial, a criação.',
    color: '#4169E1',
    vertices: 6,
    edges: 12,
    faces: 2,
    metatronRelation: 'flower',
    sefirots: ['Tiphereth', 'Chesed', 'Gevurah'],
    chakras: [4, 5],
    frequencies: ['417 Hz', '528 Hz'],
    elements: ['Fogo', 'Água'],
    阴阳: 'Equilíbrio',
    planets: ['Vênus'],
    meditation: 'Contemple a estrela de seis pontas, integrando as forças do fogo ascendente e da água descendente.',
  },
  {
    id: 'pentagram',
    name: 'Pentagrama',
    nameEnglish: 'Pentagram',
    category: 'stellar',
    description: 'Estrela de cinco pontas criada por uma linha contínua de cinco interseções, polígono mais antigo conhecido.',
    symbolism: 'Humano, microcosmo, os 5 elementos, proteção, magia cerimonial, os 5 sentidos, a estrela do homem.',
    color: '#32CD32',
    vertices: 5,
    edges: 5,
    faces: 0,
    metatronRelation: 'flower',
    sefirots: ['Malkuth'],
    chakras: [1, 2, 3],
    frequencies: ['528 Hz', '741 Hz'],
    elements: ['Terra', 'Água', 'Fogo', 'Ar', 'Espírito'],
    阴阳: 'Yang',
    planets: ['Vênus'],
    meditation: 'Desenhe mentalmente o pentagrama, invocando a proteção dos 5 elementos ao seu redor.',
  },
  {
    id: 'vesica-piscis',
    name: 'Vesica Piscis',
    nameEnglish: 'Vesica Piscis',
    category: 'flower',
    description: 'Forma intersection de dois círculos com o mesmo raio, um centrado no perímetro do outro.',
    symbolism: 'Interseção do divino e do humano, o nascimento da luz, visão interior, acesso ao terceiro olho.',
    color: '#E6E6FA',
    vertices: 2,
    edges: 0,
    faces: 0,
    metatronRelation: 'flower',
    sefirots: ['Binah', 'Chokmah'],
    chakras: [6],
    frequencies: ['639 Hz', '852 Hz'],
    elements: ['Água'],
    阴阳: 'Yin',
    planets: ['Lua'],
    meditation: 'Olhe através da vesica piscis como se fosse uma janela para o plano espiritual, abrindo sua visão interior.',
  },
  {
    id: 'golden-spiral',
    name: 'Espiral Dourada',
    nameEnglish: 'Golden Spiral',
    category: 'spiral',
    description: 'Espiral baseada na proporção áurea (phi = 1.618), padrão que aparece em conchas, galáxias e no corpo humano.',
    symbolism: 'Crescimento divino, proporção áurea, a mão de Deus em criação, expansão infinita, o número de ouro.',
    color: '#FFD700',
    vertices: 0,
    edges: 0,
    faces: 0,
    metatronRelation: 'flower',
    sefirots: ['Chokmah'],
    chakras: [6, 7],
    frequencies: ['528 Hz', '963 Hz'],
    elements: ['Éter'],
    阴阳: 'Yang',
    planets: ['Sol'],
    meditation: 'Siga a espiral dourada até o seu centro, encontrando o ponto de无限 possibilities dentro de você.',
  },
  {
    id: 'fibonacci-spiral',
    name: 'Espiral de Fibonacci',
    nameEnglish: 'Fibonacci Spiral',
    category: 'spiral',
    description: 'Spiral construída a partir de quadrados com lados representando números de Fibonacci (1, 1, 2, 3, 5, 8...).',
    symbolism: 'Sequência divina da criação, crescimento natural, os mistérios da matemática no universo, os 8(masculino) e 3(feminino).',
    color: '#FF6347',
    vertices: 0,
    edges: 0,
    faces: 0,
    metatronRelation: 'flower',
    sefirots: ['Netzach'],
    chakras: [3, 6],
    frequencies: ['528 Hz', '639 Hz'],
    elements: ['Ar'],
    阴阳: 'Equilíbrio',
    planets: ['Mercúrio'],
    meditation: 'Visualize os quadrados de Fibonacci expandindo-se do seu centro, crescendo em proporção divina.',
  },
  {
    id: 'fruit-of-life',
    name: 'Fruto da Vida',
    nameEnglish: 'Fruit of Life',
    category: 'flower',
    description: '13 círculos que representam o Fruto da Vida, a feminina geométrica sagrada que gera o Cubo de Metatron.',
    symbolism: 'A geração da forma, o femenino sagrado, oorsprong van alle dimensies, a estrutura do universo antes da diferenciação.',
    color: '#FF69B4',
    vertices: 13,
    edges: 0,
    faces: 0,
    metatronRelation: 'flower',
    sefirots: ['Binah'],
    chakras: [5, 6],
    frequencies: ['639 Hz', '741 Hz', '852 Hz'],
    elements: ['Água'],
    阴阳: 'Yin',
    planets: ['Vênus', 'Lua'],
    meditation: 'Desbloqueie o Fruto da Vida dentro de você, permitindo que a sabedoria feminina do cosmos flua.',
  },
  {
    id: 'christ-grid',
    name: 'Grade de Cristo',
    nameEnglish: 'Christ Grid',
    category: 'knot',
    description: 'Padrão de ressonância harmônica de 144 linhas(12 x 12), grid de ascensão que cobre a Terra.',
    symbolism: 'Luz crística, consciéncia crística, ressonância de 144hz, a nova terra, ascensão coletiva.',
    color: '#FFFFFF',
    vertices: 144,
    edges: 144,
    faces: 0,
    metatronRelation: 'tree',
    sefirots: ['Kether', 'Tiphereth'],
    chakras: [7, 8],
    frequencies: ['144 Hz', '432 Hz', '528 Hz', '963 Hz'],
    elements: ['Éter'],
    阴阳: 'Yang',
    planets: ['Sol'],
    meditation: 'Alinhe-se com a Grade de Cristo, permitindo que a luz crística flua através do seu sistema de energia.',
  },
];

export function getPatterns(): GeometricPattern[] {
  return GEOMETRIC_PATTERNS;
}

export function getPatternById(id: string): GeometricPattern | undefined {
  return GEOMETRIC_PATTERNS.find(p => p.id === id);
}

export function getPatternsByCategory(category: PatternCategory): GeometricPattern[] {
  return GEOMETRIC_PATTERNS.filter(p => p.category === category);
}

export function getPatternsBySefirot(sefirot: string): GeometricPattern[] {
  return GEOMETRIC_PATTERNS.filter(p => p.sefirots.includes(sefirot));
}

export function getPatternsByChakra(chakra: number): GeometricPattern[] {
  return GEOMETRIC_PATTERNS.filter(p => p.chakras.includes(chakra));
}

export function getPatternsByMetatronRelation(relation: MetatronRelation): GeometricPattern[] {
  return GEOMETRIC_PATTERNS.filter(p => p.metatronRelation === relation);
}

export function getPatternsByElement(element: string): GeometricPattern[] {
  return GEOMETRIC_PATTERNS.filter(p => p.elements.includes(element));
}

export function getPatternsByYinYang(yinYang: string): GeometricPattern[] {
  return GEOMETRIC_PATTERNS.filter(p => p.阴阳 === yinYang || p.阴阳 === 'Equilíbrio');
}

export function getPatternsByPlanet(planet: string): GeometricPattern[] {
  return GEOMETRIC_PATTERNS.filter(p => p.planets?.includes(planet));
}

export function getPatternsByFrequency(frequency: string): GeometricPattern[] {
  return GEOMETRIC_PATTERNS.filter(p => p.frequencies.includes(frequency));
}

export function getPatternCategories(): PatternCategory[] {
  return ['platonic', 'stellar', 'flower', 'knot', 'spiral'];
}

export function getMetatronRelations(): MetatronRelation[] {
  return ['cube', 'merkaba', 'tree', 'flower'];
}

export function getAllElements(): string[] {
  return ['Fogo', 'Ar', 'Água', 'Terra', 'Éter'];
}

export function getAllPlanets(): string[] {
  return ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
}

export function getAllSefirots(): string[] {
  return ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
}

export function getAllChakras(): number[] {
  return [1, 2, 3, 4, 5, 6, 7];
}