/* eslint-disable */

/**
 * Symbol patterns library
 * Sacred symbol patterns with geometric and mystical configurations
 */

export interface SymbolPattern {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  category: 'geometric' | 'sacred' | 'alchemical' | 'mystical' | 'elemental';
  svg: string;
  symmetries: number[];
  associatedSefirot: string[];
  associatedChakras: number[];
  frequencyHz: number;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'ether';
  planet?: string;
}

const SYMBOL_PATTERNS: Record<string, SymbolPattern> = {
  flowerOfLife: {
    id: 'flower-of-life',
    name: 'Flower of Life',
    namePt: 'Flor da Vida',
    description: 'Ancient sacred geometry pattern of overlapping circles creating the fundamental form of existence. Contains all geometric shapes in the universe.',
    descriptionPt: 'Padrão geométrico sagrado antigo de círculos sobrepostos criando a forma fundamental da existência. Contém todas as formas geométricas do universo.',
    category: 'sacred',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="50" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="75" cy="67" r="50" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="125" cy="67" r="50" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="50" cy="100" r="50" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="150" cy="100" r="50" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="75" cy="133" r="50" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="125" cy="133" r="50" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [6, 12],
    associatedSefirot: ['Keter', 'Chokhmah', 'Binah'],
    associatedChakras: [7, 6],
    frequencyHz: 432,
    element: 'ether',
  },
  metatronsCube: {
    id: 'metatrons-cube',
    name: 'Metatron\'s Cube',
    namePt: 'Cubo de Metatron',
    description: 'Sacred geometry containing all five Platonic solids. Created by Archangel Metatron to oversee the flow of energy in the universe.',
    descriptionPt: 'Geometria sagrada contendo todos os cinco sólidos platônicos. Criado pelo Arcanjo Metatron para supervisionar o fluxo de energia no universo.',
    category: 'sacred',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="50" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="50" cy="100" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="150" cy="100" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="50" cy="150" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="150" cy="150" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="100" cy="150" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="100" cy="100" r="15" stroke="currentColor" stroke-width="2" fill="none"/><line x1="100" y1="50" x2="50" y2="100" stroke="currentColor" stroke-width="1"/><line x1="100" y1="50" x2="150" y2="100" stroke="currentColor" stroke-width="1"/><line x1="100" y1="50" x2="100" y2="100" stroke="currentColor" stroke-width="1"/><line x1="50" y1="100" x2="150" y2="100" stroke="currentColor" stroke-width="1"/><line x1="50" y1="100" x2="50" y2="150" stroke="currentColor" stroke-width="1"/><line x1="50" y1="100" x2="100" y2="150" stroke="currentColor" stroke-width="1"/><line x1="150" y1="100" x2="100" y2="150" stroke="currentColor" stroke-width="1"/><line x1="150" y1="100" x2="150" y2="150" stroke="currentColor" stroke-width="1"/><line x1="50" y1="150" x2="150" y2="150" stroke="currentColor" stroke-width="1"/></svg>`,
    symmetries: [6, 12],
    associatedSefirot: ['Keter', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    associatedChakras: [7, 6, 5, 4, 3, 2, 1],
    frequencyHz: 528,
    element: 'ether',
  },
  treeOfLife: {
    id: 'tree-of-life',
    name: 'Tree of Life',
    namePt: 'Árvore da Vida',
    description: 'Cabalistic map of ten divine emanations. Represents the path through which energy flows from the infinite to the physical realm.',
    descriptionPt: 'Mapa cabalístico de dez emanações divinas. Representa o caminho pelo qual a energia flui do infinito para o reino físico.',
    category: 'mystical',
    svg: `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="30" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="60" cy="80" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="140" cy="80" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="30" cy="140" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="100" cy="140" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="170" cy="140" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="60" cy="200" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="140" cy="200" r="15" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="100" cy="230" r="15" stroke="currentColor" stroke-width="2" fill="none"/><line x1="100" y1="45" x2="60" y2="65" stroke="currentColor" stroke-width="1"/><line x1="100" y1="45" x2="140" y2="65" stroke="currentColor" stroke-width="1"/><line x1="60" y1="95" x2="30" y2="125" stroke="currentColor" stroke-width="1"/><line x1="60" y1="95" x2="100" y2="125" stroke="currentColor" stroke-width="1"/><line x1="140" y1="95" x2="100" y2="125" stroke="currentColor" stroke-width="1"/><line x1="140" y1="95" x2="170" y2="125" stroke="currentColor" stroke-width="1"/><line x1="100" y1="155" x2="60" y2="185" stroke="currentColor" stroke-width="1"/><line x1="100" y1="155" x2="140" y2="185" stroke="currentColor" stroke-width="1"/><line x1="60" y1="215" x2="100" y2="215" stroke="currentColor" stroke-width="1"/></svg>`,
    symmetries: [1],
    associatedSefirot: ['Keter', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    associatedChakras: [7, 6, 5, 4, 3, 2, 1],
    frequencyHz: 396,
    element: 'ether',
  },
  vesicaPiscis: {
    id: 'vesica-piscis',
    name: 'Vesica Piscis',
    namePt: 'Vesica Piscis',
    description: 'Two overlapping circles creating an almond shape. Represents the intersection of the spiritual and physical worlds.',
    descriptionPt: 'Dois círculos sobrepostos criando uma forma de amêndoa. Representa a interseção dos mundos espiritual e físico.',
    category: 'sacred',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="100" rx="50" ry="86.6" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="50" cy="100" r="50" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="150" cy="100" r="50" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [2, 4],
    associatedSefirot: ['Binah', 'Chokhmah', 'Tiferet'],
    associatedChakras: [7, 6, 4],
    frequencyHz: 417,
    element: 'ether',
  },
  pentagram: {
    id: 'pentagram',
    name: 'Pentagram',
    namePt: 'Pentagrama',
    description: 'Five-pointed star representing the five elements and human microcosm. Symbol of balance between spiritual and physical.',
    descriptionPt: 'Estrela de cinco pontas representando os cinco elementos e o microcosmo humano. Símbolo de equilíbrio entre o espiritual e o físico.',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><polygon points="100,20 125,80 190,80 140,120 160,180 100,145 40,180 60,120 10,80 75,80" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [5, 10],
    associatedSefirot: ['Gevurah', 'Chesed'],
    associatedChakras: [5, 4, 3],
    frequencyHz: 528,
    element: 'ether',
  },
  hexagram: {
    id: 'hexagram',
    name: 'Hexagram',
    namePt: 'Hexagrama',
    description: 'Six-pointed star formed by two triangles. Represents the union of opposites and the balance of masculine and feminine energies.',
    descriptionPt: 'Estrela de seis pontas formada por dois triângulos. Representa a união dos opostos e o equilíbrio das energias masculina e feminina.',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><polygon points="100,20 173,60 173,140 100,180 27,140 27,60" stroke="currentColor" stroke-width="2" fill="none"/><line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" stroke-width="1"/><line x1="27" y1="60" x2="173" y2="140" stroke="currentColor" stroke-width="1"/><line x1="173" y1="60" x2="27" y2="140" stroke="currentColor" stroke-width="1"/></svg>`,
    symmetries: [6, 12],
    associatedSefirot: ['Tiferet', 'Yesod'],
    associatedChakras: [4, 3],
    frequencyHz: 432,
    planet: 'venus',
  },
  septagram: {
    id: 'septagram',
    name: 'Septagram',
    namePt: 'Setegrama',
    description: 'Seven-pointed star associated with mystical traditions and spiritual completion. Represents the seven days of creation and seven planets.',
    descriptionPt: 'Estrela de sete pontas associada a tradições místicas e conclusão espiritual. Representa os sete dias da criação e sete planetas.',
    category: 'mystical',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><polygon points="100,10 115,60 165,45 140,90 180,110 130,130 150,180 100,150 50,180 70,130 20,110 60,90 35,45 85,60" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [7],
    associatedSefirot: ['Netzach', 'Hod'],
    associatedChakras: [7, 6],
    frequencyHz: 741,
    planet: 'moon',
  },
  merkaba: {
    id: 'merkaba',
    name: 'Merkaba',
    namePt: 'Merkaba',
    description: 'Two interlocking tetrahedrons representing the light body. A vehicle of light used for spiritual ascension and interdimensional travel.',
    descriptionPt: 'Dois tetraedros entrelaçados representando o corpo de luz. Um veículo de luz usado para ascensão espiritual e viagem interdimensional.',
    category: 'sacred',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><polygon points="100,20 180,150 20,150" stroke="currentColor" stroke-width="2" fill="none"/><polygon points="100,180 20,50 180,50" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [3, 6],
    associatedSefirot: ['Chokhmah'],
    associatedChakras: [7, 6, 5],
    frequencyHz: 963,
    element: 'ether',
  },
  toroid: {
    id: 'toroid',
    name: 'Toroid',
    namePt: 'Toroide',
    description: 'Doughnut-shaped energy pattern representing the fundamental flow pattern of energy in the universe. Found in sacred geometry and physics.',
    descriptionPt: 'Padrão energético em forma de rosquinha representando o padrão de fluxo fundamental de energia no universo. Encontrado em geometria sagrada e física.',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="100" rx="70" ry="30" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="100" cy="100" rx="30" ry="70" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="100" cy="100" rx="50" ry="50" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [4, 8],
    associatedSefirot: ['Tiferet'],
    associatedChakras: [4, 3],
    frequencyHz: 285,
    element: 'ether',
  },
  goldenSpiral: {
    id: 'golden-spiral',
    name: 'Golden Spiral',
    namePt: 'Espiral Dourada',
    description: 'Spiral based on the golden ratio, found throughout nature. Represents growth, expansion, and the divine proportion.',
    descriptionPt: 'Espiral baseada na proporção áurea, encontrada em toda a natureza. Representa crescimento, expansão e a proporção divina.',
    category: 'geometric',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100,100 Q100,50 150,50 Q200,50 200,100 Q200,150 150,150 Q100,150 100,200" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [1],
    associatedSefirot: ['Chokhmah'],
    associatedChakras: [5, 4],
    frequencyHz: 528,
    planet: 'venus',
  },
  trinitySymbol: {
    id: 'trinity-symbol',
    name: 'Trinity Symbol',
    namePt: 'Símbolo da Trindade',
    description: 'Three interlocking circles representing the trinity principle. Symbolizes unity, trinity, and the divine threefold nature.',
    descriptionPt: 'Três círculos entrelaçados representando o princípio da trindade. Simboliza unidade, trindade e a natureza divina trifoliada.',
    category: 'sacred',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="60" r="40" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="60" cy="130" r="40" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="140" cy="130" r="40" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [3],
    associatedSefirot: ['Keter', 'Chokhmah', 'Binah'],
    associatedChakras: [7, 6],
    frequencyHz: 396,
    element: 'ether',
  },
  caduceus: {
    id: 'caduceus',
    name: 'Caduceus',
    namePt: 'Caduceu',
    description: 'Staff entwined by two serpents with wings. Represents healing, transformation, and the kundalini energy rising through the spine.',
    descriptionPt: 'Cajado entrelaçado por duas serpentes com asas. Representa cura, transformação e a energia kundalini subindo pela coluna.',
    category: 'mystical',
    svg: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><line x1="100" y1="20" x2="100" y2="280" stroke="currentColor" stroke-width="3"/><path d="M70,80 Q100,120 70,160 Q100,200 70,240" stroke="currentColor" stroke-width="2" fill="none"/><path d="M130,80 Q100,120 130,160 Q100,200 130,240" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="100" cy="50" rx="40" ry="20" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [1, 2],
    associatedSefirot: ['Yesod', 'Malkuth'],
    associatedChakras: [7, 6, 5, 4, 3, 2, 1],
    frequencyHz: 528,
    planet: 'mercury',
  },
  ankh: {
    id: 'ankh',
    name: 'Ankh',
    namePt: 'Ankh',
    description: 'Egyptian symbol of life. Represents the union of masculine and feminine principles and eternal life.',
    descriptionPt: 'Símbolo egípcio da vida. Representa a união dos princípios masculino e feminino e a vida eterna.',
    category: 'mystical',
    svg: `<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="30" rx="20" ry="25" stroke="currentColor" stroke-width="3" fill="none"/><line x1="50" y1="55" x2="50" y2="140" stroke="currentColor" stroke-width="3"/><line x1="25" y1="85" x2="75" y2="85" stroke="currentColor" stroke-width="3"/></svg>`,
    symmetries: [1],
    associatedSefirot: ['Tiferet'],
    associatedChakras: [4, 3],
    frequencyHz: 417,
    element: 'water',
  },
  triquetra: {
    id: 'triquetra',
    name: 'Triquetra',
    namePt: 'Triquetra',
    description: 'Three interlocking loops representing the triple goddess and the trinity. Symbol of protection, unity, and eternal life.',
    descriptionPt: 'Três alças entrelaçadas representando a tripla deusa e a trindade. Símbolo de proteção, unidade e vida eterna.',
    category: 'sacred',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100,40 Q140,70 100,100 Q60,70 100,40" stroke="currentColor" stroke-width="2" fill="none"/><path d="M55,130 Q95,100 145,130 Q95,160 55,130" stroke="currentColor" stroke-width="2" fill="none"/><path d="M145,130 Q145,70 100,100 Q55,130 55,70 Q55,160 100,100 Q145,160 145,70" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [3],
    associatedSefirot: ['Binah'],
    associatedChakras: [6, 5, 4],
    frequencyHz: 396,
    element: 'water',
  },
  seedOfLife: {
    id: 'seed-of-life',
    name: 'Seed of Life',
    namePt: 'Semente da Vida',
    description: 'Seven circles representing the seven days of creation. Foundation from which the Flower of Life emerges.',
    descriptionPt: 'Sete círculos representando os sete dias da criação. Fundação da qual a Flor da Vida emerge.',
    category: 'sacred',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="40" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="70" cy="70" r="40" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="130" cy="70" r="40" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="70" cy="130" r="40" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="130" cy="130" r="40" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="100" cy="55" r="40" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="100" cy="145" r="40" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    symmetries: [6, 12],
    associatedSefirot: ['Keter'],
    associatedChakras: [7, 6],
    frequencyHz: 432,
    element: 'ether',
  },
};

/**
 * Get all symbol patterns as an array
 */
export function getPatterns(): SymbolPattern[] {
  return Object.values(SYMBOL_PATTERNS);
}

/**
 * Get a specific pattern by id
 */
export function getPattern(id: string): SymbolPattern | undefined {
  return SYMBOL_PATTERNS[id];
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: SymbolPattern['category']): SymbolPattern[] {
  return getPatterns().filter((p) => p.category === category);
}

/**
 * Get patterns by symmetry count
 */
export function getPatternsBySymmetry(symmetries: number): SymbolPattern[] {
  return getPatterns().filter((p) => p.symmetries.includes(symmetries));
}

/**
 * Get patterns associated with a specific sefirot
 */
export function getPatternsBySefirot(sefirot: string): SymbolPattern[] {
  return getPatterns().filter((p) => p.associatedSefirot.includes(sefirot));
}

/**
 * Get patterns associated with a specific chakra
 */
export function getPatternsByChakra(chakra: number): SymbolPattern[] {
  return getPatterns().filter((p) => p.associatedChakras.includes(chakra));
}

/**
 * Get patterns by element
 */
export function getPatternsByElement(element: SymbolPattern['element']): SymbolPattern[] {
  return getPatterns().filter((p) => p.element === element);
}

/**
 * Get patterns by planet
 */
export function getPatternsByPlanet(planet: string): SymbolPattern[] {
  return getPatterns().filter((p) => p.planet === planet);
}
