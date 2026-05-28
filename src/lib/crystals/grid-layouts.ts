// Crystal grid layouts - skipped linting and formatting

export type GridPattern =
  | 'flower_of_life'
  | 'seed_of_life'
  | 'metatron_cube'
  | 'merkaba'
  | 'sri_yantra'
  | 'chakra_alignment'
  | 'protection_circle'
  | 'healing_grid'
  | 'manifestation_square'
  | 'three_sisters';

export type CrystalPlacement =
  | 'corner'
  | 'edge'
  | 'inner'
  | 'outer'
  | 'center'
  | 'intersection';

export interface GridPosition {
  x: number;
  y: number;
  crystal: string;
  purpose: string;
  placement: CrystalPlacement;
  chakraAssociation?: string;
  direction?: 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW' | 'center';
}

export interface GridLayout {
  id: string;
  name: string;
  pattern: GridPattern;
  description: string;
  positions: GridPosition[];
  baseCrystals: string[];
  intention: string;
  sacredGeometry: string;
  activationSequence: number[];
}

export interface CrystalGrid {
  id: string;
  name: string;
  layouts: GridLayout[];
  keywords: string[];
  createdAt: Date;
}

export interface GridLibrary {
  grids: CrystalGrid[];
  total: number;
}

// Flower of Life Grid Pattern
const flowerOfLifeLayout: GridLayout = {
  id: 'flower-of-life',
  name: 'Flor da Vida',
  pattern: 'flower_of_life',
  description: 'Padrão sagrado de 19 círculos sobrepostos representando a criação universal.',
  baseCrystals: ['Quartzo Master', 'Ametista', 'Quartzo Rosa'],
  intention: 'Harmonização, proteção e conexão com a energia criativa universal.',
  sacredGeometry: '19 círculos interconectados formando o padrão da Flor da Vida',
  positions: [
    { x: 50, y: 50, crystal: 'Quartzo Master', purpose: 'Centro irradiante', placement: 'center', direction: 'center' },
    { x: 50, y: 30, crystal: 'Ametista', purpose: 'Expansão espiritual', placement: 'inner', direction: 'N' },
    { x: 70, y: 40, crystal: 'Quartzo Rosa', purpose: 'Amor universal', placement: 'inner', direction: 'NE' },
    { x: 70, y: 60, crystal: 'Quartzo Rosa', purpose: 'Amor universal', placement: 'inner', direction: 'SE' },
    { x: 50, y: 70, crystal: 'Ametista', purpose: 'Expansão espiritual', placement: 'inner', direction: 'S' },
    { x: 30, y: 60, crystal: 'Quartzo Rosa', purpose: 'Amor universal', placement: 'inner', direction: 'SW' },
    { x: 30, y: 40, crystal: 'Quartzo Rosa', purpose: 'Amor universal', placement: 'inner', direction: 'NW' },
    { x: 50, y: 15, crystal: 'Quartzo Master', purpose: 'Ponto central superior', placement: 'outer', direction: 'N' },
    { x: 80, y: 50, crystal: 'Quartzo Master', purpose: 'Ponto leste', placement: 'outer', direction: 'E' },
    { x: 50, y: 85, crystal: 'Quartzo Master', purpose: 'Ponto central inferior', placement: 'outer', direction: 'S' },
    { x: 20, y: 50, crystal: 'Quartzo Master', purpose: 'Ponto oeste', placement: 'outer', direction: 'W' },
  ],
  activationSequence: [0, 1, 2, 3, 4, 5, 6],
};

// Seed of Life Grid Pattern
const seedOfLifeLayout: GridLayout = {
  id: 'seed-of-life',
  name: 'Semente da Vida',
  pattern: 'seed_of_life',
  description: 'Padrão de 7 círculos representando os 7 dias da criação.',
  baseCrystals: ['Quartzo Claro', 'Selenita', 'Crisocola'],
  intention: 'Renovação, fertilidade de ideias e novo começo.',
  sacredGeometry: '7 círculos emanando do centro, semente da vida',
  positions: [
    { x: 50, y: 50, crystal: 'Selenita', purpose: 'Canal divino central', placement: 'center', direction: 'center' },
    { x: 50, y: 35, crystal: 'Quartzo Claro', purpose: 'Clareza mental', placement: 'inner', direction: 'N' },
    { x: 62, y: 43, crystal: 'Crisocola', purpose: 'Comunicação', placement: 'inner', direction: 'NE' },
    { x: 62, y: 57, crystal: 'Crisocola', purpose: 'Comunicação', placement: 'inner', direction: 'SE' },
    { x: 50, y: 65, crystal: 'Quartzo Claro', purpose: 'Clareza mental', placement: 'inner', direction: 'S' },
    { x: 38, y: 57, crystal: 'Crisocola', purpose: 'Comunicação', placement: 'inner', direction: 'SW' },
    { x: 38, y: 43, crystal: 'Crisocola', purpose: 'Comunicação', placement: 'inner', direction: 'NW' },
  ],
  activationSequence: [0, 1, 2, 3, 4, 5, 6],
};

// Metatron's Cube Grid
const metatronCubeLayout: GridLayout = {
  id: 'metatron-cube',
  name: 'Cubo de Metatron',
  pattern: 'metatron_cube',
  description: 'Contém todos os 5 sólidos platônicos e representa a totalidade da criação.',
  baseCrystals: ['Quartzo Master', 'Ametista', 'Turmalina Negra', 'Citrino', 'Esmeralda'],
  intention: 'Equilíbrio dimensional, proteção contra energias negativas e ativação dos corpos sutis.',
  sacredGeometry: '13 círculos conectados por linhas, contendo os 5 sólidos platônicos',
  positions: [
    { x: 50, y: 50, crystal: 'Quartzo Master', purpose: 'Centro de equilíbrio', placement: 'center', direction: 'center', chakraAssociation: 'coroa' },
    { x: 50, y: 25, crystal: 'Ametista', purpose: 'Consciência superior', placement: 'inner', direction: 'N', chakraAssociation: 'terceiro olho' },
    { x: 75, y: 38, crystal: 'Esmeralda', purpose: 'Harmonia natural', placement: 'inner', direction: 'NE', chakraAssociation: 'coração' },
    { x: 75, y: 63, crystal: 'Citrino', purpose: 'Abundância', placement: 'inner', direction: 'SE', chakraAssociation: 'plexo solar' },
    { x: 50, y: 75, crystal: 'Ametista', purpose: 'Conexão terrestre', placement: 'inner', direction: 'S', chakraAssociation: 'raiz' },
    { x: 25, y: 63, crystal: 'Turmalina Negra', purpose: 'Proteção', placement: 'inner', direction: 'SW', chakraAssociation: 'raiz' },
    { x: 25, y: 38, crystal: 'Turmalina Negra', purpose: 'Proteção', placement: 'inner', direction: 'NW', chakraAssociation: 'raiz' },
    { x: 50, y: 10, crystal: 'Quartzo Master', purpose: 'Ponto superior', placement: 'outer', direction: 'N' },
    { x: 88, y: 50, crystal: 'Quartzo Master', purpose: 'Ponto leste', placement: 'outer', direction: 'E' },
    { x: 50, y: 90, crystal: 'Quartzo Master', purpose: 'Ponto inferior', placement: 'outer', direction: 'S' },
    { x: 12, y: 50, crystal: 'Quartzo Master', purpose: 'Ponto oeste', placement: 'outer', direction: 'W' },
  ],
  activationSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

// Merkaba Grid Pattern
const merkabaLayout: GridLayout = {
  id: 'merkaba',
  name: 'Merkaba',
  pattern: 'merkaba',
  description: 'Duas pirâmides tetraedro interconectadas para ascensão espiritual.',
  baseCrystals: ['Ametista', 'Quartzo Rosa', 'Quartzo Master'],
  intention: 'Ascensão, ativação da luz interior e conexão com dimensões superiores.',
  sacredGeometry: 'Duas estrelas tetraedro girando em sentidos opostos',
  positions: [
    { x: 50, y: 50, crystal: 'Quartzo Master', purpose: 'Ponto de fusão das luzes', placement: 'center', direction: 'center' },
    { x: 50, y: 20, crystal: 'Ametista', purpose: 'Luz divina superior', placement: 'inner', direction: 'N' },
    { x: 80, y: 50, crystal: 'Quartzo Rosa', purpose: 'Luz terrena inferior', placement: 'inner', direction: 'E' },
    { x: 50, y: 80, crystal: 'Ametista', purpose: 'Luz divina inferior', placement: 'inner', direction: 'S' },
    { x: 20, y: 50, crystal: 'Quartzo Rosa', purpose: 'Luz terrena superior', placement: 'inner', direction: 'W' },
    { x: 35, y: 35, crystal: 'Quartzo Master', purpose: 'Ponto de equilíbrio', placement: 'intersection', direction: 'NW' },
    { x: 65, y: 35, crystal: 'Quartzo Master', purpose: 'Ponto de equilíbrio', placement: 'intersection', direction: 'NE' },
    { x: 65, y: 65, crystal: 'Quartzo Master', purpose: 'Ponto de equilíbrio', placement: 'intersection', direction: 'SE' },
    { x: 35, y: 65, crystal: 'Quartzo Master', purpose: 'Ponto de equilíbrio', placement: 'intersection', direction: 'SW' },
  ],
  activationSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

// Sri Yantra Grid Pattern
const sriYantraLayout: GridLayout = {
  id: 'sri-yantra',
  name: 'Sri Yantra',
  pattern: 'sri_yantra',
  description: 'Diagrama sagrado hindu com 9 triângulos convergindo para o centro.',
  baseCrystals: ['Quartzo Master', 'Citrino', 'Ametista', 'Olho de Tigre'],
  intention: 'Abundância, realizzação divina e equilíbrio entre masculino e feminino sagrado.',
  sacredGeometry: '9 triângulos irradiando do centro, 4 apontando para cima, 5 para baixo',
  positions: [
    { x: 50, y: 50, crystal: 'Quartzo Master', purpose: 'Bindu - ponto central', placement: 'center', direction: 'center' },
    { x: 50, y: 25, crystal: 'Ametista', purpose: 'Triângulo superior - Shiva', placement: 'inner', direction: 'N' },
    { x: 50, y: 75, crystal: 'Olho de Tigre', purpose: 'Triângulo inferior - Shakti', placement: 'inner', direction: 'S' },
    { x: 25, y: 50, crystal: 'Citrino', purpose: 'Energia masculina leste', placement: 'inner', direction: 'E' },
    { x: 75, y: 50, crystal: 'Citrino', purpose: 'Energia feminina oeste', placement: 'inner', direction: 'W' },
    { x: 35, y: 35, crystal: 'Quartzo Master', purpose: 'Triângulo norte-leste', placement: 'intersection', direction: 'NE' },
    { x: 65, y: 35, crystal: 'Quartzo Master', purpose: 'Triângulo norte-oeste', placement: 'intersection', direction: 'NW' },
    { x: 35, y: 65, crystal: 'Quartzo Master', purpose: 'Triângulo sul-leste', placement: 'intersection', direction: 'SE' },
    { x: 65, y: 65, crystal: 'Quartzo Master', purpose: 'Triângulo sul-oeste', placement: 'intersection', direction: 'SW' },
  ],
  activationSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

// Chakra Alignment Grid
const chakraAlignmentLayout: GridLayout = {
  id: 'chakra-alignment',
  name: 'Alinhamento dos Chakras',
  pattern: 'chakra_alignment',
  description: 'Grade para equilibrar e harmonizar os 7 chakras principais.',
  baseCrystals: ['Quartzo Rosa', 'Citrino', 'Esmeralda', 'Turmalina Verde', 'Quartzo Azul', 'Quartzo Indigo', 'Ametista'],
  intention: 'Equilíbrio energético dos corpos sutis e ativação da coluna de luz.',
  sacredGeometry: 'Alinhamento vertical através do corpo, ativando cada chakra',
  positions: [
    { x: 50, y: 15, crystal: 'Ametista', purpose: 'Chakra Coroa - conexão divina', placement: 'center', direction: 'center', chakraAssociation: 'coroa' },
    { x: 50, y: 28, crystal: 'Quartzo Indigo', purpose: 'Chakra Terceiro Olho - intuição', placement: 'inner', direction: 'N', chakraAssociation: 'terceiro olho' },
    { x: 50, y: 42, crystal: 'Quartzo Azul', purpose: 'Chakra Laríngeo - comunicação', placement: 'inner', direction: 'N', chakraAssociation: 'laríngeo' },
    { x: 50, y: 50, crystal: 'Esmeralda', purpose: 'Chakra Cardíaco - amor', placement: 'center', direction: 'center', chakraAssociation: 'cardíaco' },
    { x: 50, y: 58, crystal: 'Turmalina Verde', purpose: 'Chakra Plexo Solar - poder pessoal', placement: 'inner', direction: 'S', chakraAssociation: 'plexo solar' },
    { x: 50, y: 72, crystal: 'Citrino', purpose: 'Chakra Sacral - criatividade', placement: 'inner', direction: 'S', chakraAssociation: 'sacral' },
    { x: 50, y: 85, crystal: 'Quartzo Rosa', purpose: 'Chakra Raiz - segurança e根基', placement: 'inner', direction: 'S', chakraAssociation: 'raiz' },
  ],
  activationSequence: [6, 5, 4, 3, 2, 1, 0],
};

// Protection Circle Grid
const protectionCircleLayout: GridLayout = {
  id: 'protection-circle',
  name: 'Círculo de Proteção',
  pattern: 'protection_circle',
  description: 'Grade circular para criar um espaço sagrado protegido.',
  baseCrystals: ['Turmalina Negra', 'Obsidiana', 'Quartzo Fumê', 'Shungite'],
  intention: 'Proteção contra energias negativas e criação de scredo sagrado.',
  sacredGeometry: 'Círculo perfeito com cristais em pontos cardeais',
  positions: [
    { x: 50, y: 50, crystal: 'Quartzo Fumê', purpose: 'Ancoragem central', placement: 'center', direction: 'center' },
    { x: 50, y: 15, crystal: 'Turmalina Negra', purpose: 'Proteção norte', placement: 'edge', direction: 'N' },
    { x: 85, y: 50, crystal: 'Obsidiana', purpose: 'Proteção leste', placement: 'edge', direction: 'E' },
    { x: 50, y: 85, crystal: 'Turmalina Negra', purpose: 'Proteção sul', placement: 'edge', direction: 'S' },
    { x: 15, y: 50, crystal: 'Obsidiana', purpose: 'Proteção oeste', placement: 'edge', direction: 'W' },
    { x: 75, y: 25, crystal: 'Shungite', purpose: 'Proteção nordeste', placement: 'corner', direction: 'NE' },
    { x: 75, y: 75, crystal: 'Shungite', purpose: 'Proteção sudeste', placement: 'corner', direction: 'SE' },
    { x: 25, y: 75, crystal: 'Shungite', purpose: 'Proteção sudoeste', placement: 'corner', direction: 'SW' },
    { x: 25, y: 25, crystal: 'Shungite', purpose: 'Proteção nororeste', placement: 'corner', direction: 'NW' },
  ],
  activationSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

// Healing Grid Pattern
const healingGridLayout: GridLayout = {
  id: 'healing-grid',
  name: 'Grade de Cura',
  pattern: 'healing_grid',
  description: 'Grade especializada em cura energética e reiki.',
  baseCrystals: ['Quartzo Rosa', 'Esmeralda', 'Crisocola', 'Aventurina', 'Jade'],
  intention: 'Cura de feridas emocionais, físicas e espirituais.',
  sacredGeometry: 'Padrão de cura em cruz com ponto central',
  positions: [
    { x: 50, y: 50, crystal: 'Quartzo Rosa', purpose: 'Centro de cura - amor incondicional', placement: 'center', direction: 'center' },
    { x: 50, y: 20, crystal: 'Esmeralda', purpose: 'Cura superior - cabeça', placement: 'inner', direction: 'N' },
    { x: 80, y: 50, crystal: 'Crisocola', purpose: 'Cura leste - braços', placement: 'inner', direction: 'E' },
    { x: 50, y: 80, crystal: 'Jade', purpose: 'Cura inferior - pernas', placement: 'inner', direction: 'S' },
    { x: 20, y: 50, crystal: 'Aventurina', purpose: 'Cura oeste - coração', placement: 'inner', direction: 'W' },
    { x: 35, y: 35, crystal: 'Quartzo Rosa', purpose: 'Suporte emocional NE', placement: 'intersection', direction: 'NE' },
    { x: 65, y: 35, crystal: 'Quartzo Rosa', purpose: 'Suporte emocional NW', placement: 'intersection', direction: 'NW' },
    { x: 65, y: 65, crystal: 'Quartzo Rosa', purpose: 'Suporte emocional SE', placement: 'intersection', direction: 'SE' },
    { x: 35, y: 65, crystal: 'Quartzo Rosa', purpose: 'Suporte emocional SW', placement: 'intersection', direction: 'SW' },
  ],
  activationSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

// Manifestation Square Grid
const manifestationSquareLayout: GridLayout = {
  id: 'manifestation-square',
  name: 'Quadrado de Manifestação',
  pattern: 'manifestation_square',
  description: 'Grade para manifestar intenções e desires com poder.',
  baseCrystals: ['Citrino', 'Quartzo Master', 'Pirita', 'Ágata de Fogo'],
  intention: 'Manifestação de sonhos, abundância e realizações materiais.',
  sacredGeometry: 'Quadrado mágico 3x3 com centro',
  positions: [
    { x: 50, y: 50, crystal: 'Quartzo Master', purpose: 'Amplificador central', placement: 'center', direction: 'center' },
    { x: 33, y: 33, crystal: 'Citrino', purpose: 'Intenção - pensamento criativo', placement: 'corner', direction: 'NW' },
    { x: 67, y: 33, crystal: 'Pirita', purpose: 'Intenção - poder e ação', placement: 'corner', direction: 'NE' },
    { x: 67, y: 67, crystal: 'Citrino', purpose: 'Intenção - gratidão', placement: 'corner', direction: 'SE' },
    { x: 33, y: 67, crystal: 'Pirita', purpose: 'Intenção - confiança', placement: 'corner', direction: 'SW' },
    { x: 50, y: 25, crystal: 'Ágata de Fogo', purpose: 'Intenção norte - propósito', placement: 'edge', direction: 'N' },
    { x: 75, y: 50, crystal: 'Ágata de Fogo', purpose: 'Intenção leste - abundancia', placement: 'edge', direction: 'E' },
    { x: 50, y: 75, crystal: 'Ágata de Fogo', purpose: 'Intenção sul - ancoragem', placement: 'edge', direction: 'S' },
    { x: 25, y: 50, crystal: 'Ágata de Fogo', purpose: 'Intenção oeste - receives', placement: 'edge', direction: 'W' },
  ],
  activationSequence: [0, 4, 3, 2, 1, 5, 6, 7, 8],
};

// Three Sisters Grid Pattern
const threeSistersLayout: GridLayout = {
  id: 'three-sisters',
  name: 'Três Irmãs',
  pattern: 'three_sisters',
  description: 'Três cristais principais cercados por apoiadores para tríades sagradas.',
  baseCrystals: ['Quartzo Rosa', 'Citrino', 'Ametista'],
  intention: 'Equilíbrio entre amor, sabedoria e ação - trindade criativa.',
  sacredGeometry: 'Tríade com 3 cristais principais e 6 de suporte',
  positions: [
    { x: 50, y: 25, crystal: 'Quartzo Rosa', purpose: 'Irmã do Amor - coração', placement: 'inner', direction: 'N', chakraAssociation: 'cardíaco' },
    { x: 25, y: 65, crystal: 'Citrino', purpose: 'Irmã da Sabedoria - mente', placement: 'inner', direction: 'SW', chakraAssociation: 'plexo solar' },
    { x: 75, y: 65, crystal: 'Ametista', purpose: 'Irmã da Ação - espírito', placement: 'inner', direction: 'SE', chakraAssociation: 'terceiro olho' },
    { x: 50, y: 50, crystal: 'Quartzo Master', purpose: 'Ponto de fusão das irmãs', placement: 'center', direction: 'center' },
    { x: 50, y: 12, crystal: 'Quartzo Rosa', purpose: 'Extensão amor - coroa', placement: 'outer', direction: 'N', chakraAssociation: 'coroa' },
    { x: 75, y: 40, crystal: 'Citrino', purpose: 'Extensão sabedoria - laríngeo', placement: 'outer', direction: 'E', chakraAssociation: 'laríngeo' },
    { x: 50, y: 88, crystal: 'Ametista', purpose: 'Extensão ação - raiz', placement: 'outer', direction: 'S', chakraAssociation: 'raiz' },
    { x: 25, y: 40, crystal: 'Quartzo Master', purpose: 'Conexão tríplice', placement: 'outer', direction: 'W' },
  ],
  activationSequence: [0, 1, 2, 3, 4, 5, 6, 7],
};

/**
 * Build grids list
 */
function buildGridsList(): CrystalGrid[] {
  const grids: CrystalGrid[] = [];

  grids.push({
    id: 'sacred-geometry-grids',
    name: 'Grades de Geometria Sagrada',
    layouts: [
      flowerOfLifeLayout,
      seedOfLifeLayout,
      metatronCubeLayout,
      merkabaLayout,
      sriYantraLayout,
    ],
    keywords: ['geometria', 'sagrada', 'criação', 'universal', 'platônico'],
    createdAt: new Date('2024-01-01'),
  });

  grids.push({
    id: 'chakra-energy-grids',
    name: 'Grades de Energia Chakral',
    layouts: [chakraAlignmentLayout],
    keywords: ['chakra', 'energia', 'equilíbrio', 'cura', 'coluna'],
    createdAt: new Date('2024-01-01'),
  });

  grids.push({
    id: 'intention-grids',
    name: 'Grades de Intenção',
    layouts: [
      protectionCircleLayout,
      healingGridLayout,
      manifestationSquareLayout,
      threeSistersLayout,
    ],
    keywords: ['proteção', 'cura', 'manifestação', 'intenção', 'abundância'],
    createdAt: new Date('2024-01-01'),
  });

  return grids;
}

/**
 * Get all layouts from all grids
 */
export function getLayouts(): GridLayout[] {
  const grids = buildGridsList();
  return grids.flatMap(grid => grid.layouts);
}

/**
 * Get all grids with complete information
 */
export function getGrids(): GridLibrary {
  const grids = buildGridsList();
  return {
    grids,
    total: grids.length,
  };
}

/**
 * Get layout by ID
 */
export function getLayoutById(id: string): GridLayout | undefined {
  return getLayouts().find(layout => layout.id === id);
}

/**
 * Get layouts by pattern
 */
export function getLayoutsByPattern(pattern: GridPattern): GridLayout[] {
  return getLayouts().filter(layout => layout.pattern === pattern);
}

/**
 * Get layouts by keyword
 */
export function getLayoutsByKeyword(keyword: string): GridLayout[] {
  const lowerKeyword = keyword.toLowerCase();
  return getLayouts().filter(
    layout =>
      layout.name.toLowerCase().includes(lowerKeyword) ||
      layout.description.toLowerCase().includes(lowerKeyword) ||
      layout.intention.toLowerCase().includes(lowerKeyword) ||
      layout.sacredGeometry.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get layouts for a specific chakra
 */
export function getLayoutsByChakra(chakra: string): GridLayout[] {
  return getLayouts().filter(layout =>
    layout.positions.some(pos => pos.chakraAssociation?.toLowerCase() === chakra.toLowerCase())
  );
}

/**
 * Get layouts by number of crystals
 */
export function getLayoutsByCrystalCount(count: number): GridLayout[] {
  return getLayouts().filter(layout => layout.positions.length === count);
}
