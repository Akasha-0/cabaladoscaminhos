/**
 * Sacred Patterns - Geometria Sagrada
 * Padrões geométricos sagrados com propriedades espirituais
 */

export interface SacredPattern {
  id: string;
  nome: string;
  nomeIngles: string;
  descricao: string;
  simbolismo: string;
  elementos: string[];
  sefirots: string[];
  chakras: number[];
  cor: string;
  formulaMatematica: string;
  anguloSimetria: number;
  nivelFrequencia: number;
}

export const PATTERNS: SacredPattern[] = [
  {
    id: 'flower-of-life-completo',
    nome: 'Flor da Vida Completo',
    nomeIngles: 'Complete Flower of Life',
    descricao: 'Padrão completo da Flor da Vida com 19 círculos, representando a totalidade da criação e todos os estados de existência.',
    simbolismo: 'Totalidade cósmica,creation infinito, grids de ressonância planetária.',
    elementos: ['19 círculos primários', '36 círculos secundários', '7 Tageis', 'Hexagrama central'],
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Tiferet'],
    chakras: [4, 6, 7],
    cor: '#FFD700',
    formulaMatematica: 'r = R × φ^n (n = 0..6)',
    anguloSimetria: 360,
    nivelFrequencia: 432,
  },
  {
    id: 'seed-of-life-expandido',
    nome: 'Semente da Vida Expandida',
    nomeIngles: 'Expanded Seed of Life',
    descricao: 'Sete círculos igualmente espaçados representando os sete dias da criação, expandidos para revelar os 7 Tageis.',
    simbolismo: 'Germinação espiritual, potencial latente, início do ciclo de manifestação.',
    elementos: ['7 círculos principais', '6 overlaps', 'Centro irradiante'],
    sefirots: ['Kether', 'Chokmah'],
    chakras: [1, 7],
    cor: '#7B68EE',
    formulaMatematica: 'θ = 360°/7 × n (n = 0..6)',
    anguloSimetria: 360,
    nivelFrequencia: 396,
  },
  {
    id: 'metatron-expandido',
    nome: 'Cubo de Metatron Expandido',
    nomeIngles: 'Expanded Metatron Cube',
    descricao: '13 círculos conectados formando a estrutura que contém todos os 5 sólidos platônicos e suas relações geométricas.',
    simbolismo: 'Fluxo energético divino, proteção archangelical, mediação entre dimensões.',
    elementos: ['13 círculos', '78 linhas de conexão', '5 sólidos platônicos'],
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet'],
    chakras: [1, 3, 5, 7],
    cor: '#4169E1',
    formulaMatematica: 'V(13,2) = 78 conexões',
    anguloSimetria: 180,
    nivelFrequencia: 528,
  },
  {
    id: 'tree-of-life-mapa',
    nome: 'Árvore da Vida Completa',
    nomeIngles: 'Complete Tree of Life',
    descricao: 'Mapa completo das 10 sefirots conectadas pelos 22 caminhos da Árvore da Vida na Cabala.',
    simbolismo: 'Caminho de ascensão, estrutura da consciência divina, mapa da realidade.',
    elementos: ['10 sefirots', '22 caminhos', '3 pilares', 'Abismo'],
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    cor: '#32CD32',
    formulaMatematica: '22 = 10 × 3 - 8 (trinário perfeito)',
    anguloSimetria: 36,
    nivelFrequencia: 432,
  },
  {
    id: 'vesica-piscis-mandala',
    nome: 'Vesica Piscis Mandala',
    nomeIngles: 'Vesica Piscis Mandala',
    descricao: 'Interseção de dois círculos criando a forma vesica, base para o quadrado duplo e padrões de merkaba.',
    simbolismo: 'Interseção do divino, luz e escuridão, maternidade divina, dualidade transcendida.',
    elementos: ['2 círculos iguais', 'Lentícula central', 'Diagonal sagrada'],
    sefirots: ['Binah', 'Chokmah', 'Tiferet'],
    chakras: [6, 7],
    cor: '#9370DB',
    formulaMatematica: 'd = √3 × r (diagonal do hexágono)',
    anguloSimetria: 180,
    nivelFrequencia: 417,
  },
  {
    id: 'sri-yantra-completo',
    nome: 'Sri Yantra Completo',
    nomeIngles: 'Complete Sri Yantra',
    descricao: 'Diagrama sagrado Hindu com 9 triângulos entrelaçados, 43 triângulos menores, 4 pétalas de lótus.',
    simbolismo: 'Expansão cósmica, integração das energias shiva-shakti, realização divina.',
    elementos: ['9 triângulos principais', '43 triângulos menores', '4 pétalas', '9 circuitos'],
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Tiferet'],
    chakras: [5, 6, 7],
    cor: '#FF6347',
    formulaMatematica: '9 + 9 + 9 + 9 + 7 = 43 triângulos',
    anguloSimetria: 72,
    nivelFrequencia: 480,
  },
  {
    id: 'merkaba-estrela',
    nome: 'Merkaba Estelar',
    nomeIngles: 'Stellar Merkaba',
    descricao: 'Dois tetraedros entrelaçados formando estrela de 8 pontas, veículo de luz para ascensão dimensional.',
    simbolismo: 'Ascensão, proteção divina, veículo de luz, equilíbrio luz-escuridão.',
    elementos: ['2 tetraedros', 'Estrela de 8 pontas', 'Centro estelar'],
    sefirots: ['Kether', 'Chokmah', 'Tiferet'],
    chakras: [4, 5, 6, 7],
    cor: '#E6E6FA',
    formulaMatematica: '2 × Tetraedro = 8 faces triangulares',
    anguloSimetria: 45,
    nivelFrequencia: 444,
  },
  {
    id: 'torus-energetico',
    nome: 'Toro Energético',
    nomeIngles: 'Energetic Torus',
    descricao: 'Campo toroidal representando o fluxo contínuo de energia vital, análogo ao campo eletromagnético do coração.',
    simbolismo: 'Fluxo eterno, auto-sustentação, integração do eu, respiração cósmica.',
    elementos: ['Centro oco', 'Superfície contínua', 'Fluxo espiral', 'Singularidade'],
    sefirots: ['Tiferet', 'Netzach', 'Yesod'],
    chakras: [4, 6],
    cor: '#00CED1',
    formulaMatematica: 'r_torus = R_major / R_minor = φ',
    anguloSimetria: 360,
    nivelFrequencia: 432,
  },
  {
    id: 'pentagonal-estrela',
    nome: 'Estrela Pentagonal',
    nomeIngles: 'Pentagonal Star',
    descricao: 'Pentagrama contendo a proporção áurea, encontrado em cristais, flores e na geometria do corpo humano.',
    simbolismo: 'Proporção áurea, vida, saúde, proteção, microcosmo.',
    elementos: ['5 pontos', '5 intervalos', 'Proporção φ', 'Pentágono central'],
    sefirots: ['Netzach', 'Hod', 'Yesod'],
    chakras: [4, 6],
    cor: '#FF69B4',
    formulaMatematica: 'φ = (1 + √5) / 2 ≈ 1.618',
    anguloSimetria: 72,
    nivelFrequencia: 417,
  },
  {
    id: 'hexagonal-colmeia',
    nome: 'Hexagonal Colmeia',
    nomeIngles: 'Honeycomb Hexagon',
    descricao: 'Padrão hexagonal infinito representando a forma mais eficiente de organização espacial na natureza.',
    simbolismo: 'Eficiência divina, comunidade, cooperação, estrutura perfeita.',
    elementos: ['6 lados', '6 ângulos de 120°', '3 eixos de simetria'],
    sefirots: ['Chesed', 'Gevurah', 'Tiferet'],
    chakras: [3, 4],
    cor: '#F4A460',
    formulaMatematica: '6 × 120° = 720° / 2 = 360°',
    anguloSimetria: 60,
    nivelFrequencia: 384,
  },
  {
    id: 'espiral-dourada',
    nome: 'Espiral Dourada',
    nomeIngles: 'Golden Spiral',
    descricao: 'Espiral logarítmica baseada na proporção áurea, encontrada em conchas, galáxias e na estrutura humana.',
    simbolismo: 'Crescimento natural, evolução, consciência expandida, fractal divino.',
    elementos: ['Espiral logarítmica', 'Proporção φ', 'Expansão infinita', 'Autossimilaridade'],
    sefirots: ['Chokmah', 'Netzach', 'Tiferet'],
    chakras: [2, 6, 7],
    cor: '#DAA520',
    formulaMatematica: 'r = φ^(θ/90°)',
    anguloSimetria: 360,
    nivelFrequencia: 432,
  },
  {
    id: 'estrela-davi',
    nome: 'Estrela de Davi',
    nomeIngles: 'Star of David',
    descricao: 'Dois triângulos eqüiláteros entrelaçados, criando hexagrama que representa a união céu-terra e masculino-feminino.',
    simbolismo: 'União, proteção, covenant, integração de opostos.',
    elementos: ['2 triângulos', '6 pontas', 'Hexágono central', 'Davidic shield'],
    sefirots: ['Kether', 'Chokmah', 'Binah'],
    chakras: [6, 7],
    cor: '#4682B4',
    formulaMatematica: '2 × triângulo eqüilátero = hexagrama',
    anguloSimetria: 60,
    nivelFrequencia: 408,
  },
  {
    id: 'cubo-sagrado',
    nome: 'Cubo Sagrado',
    nomeIngles: 'Sacred Cube',
    descricao: 'Cubo representando o mundo material e os 6 direçãos do espaço, com centro geométrico divino.',
    simbolismo: 'Terra, matéria, estabilidade, 6 direções, presença divina no mundo físico.',
    elementos: ['6 faces', '8 vértices', '12 arestas', 'Centro'],
    sefirots: ['Malkuth', 'Yesod', 'Tiferet'],
    chakras: [1, 2, 3, 4],
    cor: '#8B4513',
    formulaMatematica: 'V = 8, E = 12, F = 6 (fórmula de Euler)',
    anguloSimetria: 90,
    nivelFrequencia: 360,
  },
  {
    id: 'octaedro-estrelar',
    nome: 'Octaedro Estrelar',
    nomeIngles: 'Stellar Octahedron',
    descricao: 'Dois tetraedros unidos pela base formando 8 faces triangulares, representando a ponte entre céus e terra.',
    simbolismo: 'Equilíbrio dimensional, integração luz-escuridão, veículo de transformação.',
    elementos: ['8 faces', '6 vértices', '12 arestas', 'Eixo central'],
    sefirots: ['Kether', 'Tiferet', 'Malkuth'],
    chakras: [5, 6, 7],
    cor: '#9932CC',
    formulaMatematica: '8 × triângulo eqüilátero',
    anguloSimetria: 90,
    nivelFrequencia: 456,
  },
  {
    id: 'dodecaedro-cosmico',
    nome: 'Dodecaedro Cósmico',
    nomeIngles: 'Cosmic Dodecahedron',
    descricao: 'Sólido platônico de 12 faces pentagonais representando o universo e a estrutura do éter.',
    simbolismo: 'Universo, éter, inconsciente coletivo, logos cósmico.',
    elementos: ['12 faces pentagonais', '20 vértices', '30 arestas'],
    sefirots: ['Chokmah', 'Binah', 'Kether'],
    chakras: [6, 7],
    cor: '#B22222',
    formulaMatematica: 'V=20, E=30, F=12, χ=2',
    anguloSimetria: 36,
    nivelFrequencia: 480,
  },
  {
    id: 'icosaedro-vida',
    nome: 'Icosaedro da Vida',
    nomeIngles: 'Icosahedron of Life',
    descricao: 'Sólido platônico de 20 faces triangulares representando a água e o princípio da transformação.',
    simbolismo: 'Água, transformação, mudança, fluidez consciencial.',
    elementos: ['20 faces triangulares', '12 vértices', '30 arestas'],
    sefirots: ['Yesod', 'Netzach', 'Chesed'],
    chakras: [2, 3, 4],
    cor: '#20B2AA',
    formulaMatematica: 'V=12, E=30, F=20, χ=2',
    anguloSimetria: 36,
    nivelFrequencia: 432,
  },
];

/**
 * Returns all sacred geometry patterns.
 */
export function getPatterns(): SacredPattern[] {
  return PATTERNS;
}

/**
 * Returns a pattern by its ID.
 */
export function getPatternById(id: string): SacredPattern | undefined {
  return PATTERNS.find((pattern) => pattern.id === id);
}

/**
 * Returns patterns associated with a specific sefirot.
 */
export function getPatternsBySefirot(sefirot: string): SacredPattern[] {
  return PATTERNS.filter((pattern) => pattern.sefirots.includes(sefirot));
}

/**
 * Returns patterns associated with a specific chakra.
 */
export function getPatternsByChakra(chakra: number): SacredPattern[] {
  return PATTERNS.filter((pattern) => pattern.chakras.includes(chakra));
}

/**
 * Returns patterns by frequency level.
 */
export function getPatternsByFrequency(frequencia: number): SacredPattern[] {
  return PATTERNS.filter((pattern) => pattern.nivelFrequencia === frequencia);
}

/**
 * Returns patterns by symmetry angle.
 */
export function getPatternsBySymmetry(angulo: number): SacredPattern[] {
  return PATTERNS.filter((pattern) => pattern.anguloSimetria === angulo);
}