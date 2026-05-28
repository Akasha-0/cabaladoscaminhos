/**
 * Energy Work Data - Spiritual practice data for Cabala dos Caminhos
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __dirname = import.meta.dirname;

// User energy work session data
export interface EnergyWorkData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  category: string;
  intensity: number;
  duration: number;
  timestamp: number;
}

const energyWorkData: EnergyWorkData[] = [
  {
    id: 'ew-meditation-001',
    name: 'Meditação Cabalística',
    namePt: 'Meditação Cabalística',
    nameEn: 'Kabbalah Meditation',
    category: 'meditation',
    intensity: 7,
    duration: 30,
    timestamp: Date.now(),
  },
  {
    id: 'ew-visualization-001',
    name: 'Visualização da Árvore',
    namePt: 'Visualização da Árvore',
    nameEn: 'Tree Visualization',
    category: 'visualization',
    intensity: 8,
    duration: 20,
    timestamp: Date.now(),
  },
  {
    id: 'ew-breathwork-001',
    name: 'Respiração Sagrada',
    namePt: 'Respiração Sagrada',
    nameEn: 'Sacred Breathing',
    category: 'breathwork',
    intensity: 6,
    duration: 15,
    timestamp: Date.now(),
  },
  {
    id: 'ew-affirmation-001',
    name: 'Afirmações das Sephiroth',
    namePt: 'Afirmações das Sephiroth',
    nameEn: 'Sephiroth Affirmations',
    category: 'affirmation',
    intensity: 5,
    duration: 10,
    timestamp: Date.now(),
  },
  {
    id: 'ew-contemplation-001',
    name: 'Contemplação dos Caminhos',
    namePt: 'Contemplação dos Caminhos',
    nameEn: 'Paths Contemplation',
    category: 'contemplation',
    intensity: 9,
    duration: 45,
    timestamp: Date.now(),
  },
  {
    id: 'ew-chakra-align-001',
    name: 'Alinhamento dos Chakras',
    namePt: 'Alinhamento dos Chakras',
    nameEn: 'Chakra Alignment',
    category: 'chakra',
    intensity: 8,
    duration: 25,
    timestamp: Date.now(),
  },
  {
    id: 'ew-mantra-001',
    name: 'Canto de Mantras',
    namePt: 'Canto de Mantras',
    nameEn: 'Mantra Chanting',
    category: 'mantra',
    intensity: 7,
    duration: 20,
    timestamp: Date.now(),
  },
  {
    id: 'ew-energy-flow-001',
    name: 'Fluxo de Energia Vital',
    namePt: 'Fluxo de Energia Vital',
    nameEn: 'Vital Energy Flow',
    category: 'flow',
    intensity: 9,
    duration: 30,
    timestamp: Date.now(),
  },
];

/**
 * Get all energy work data entries
 */
export function getData(): EnergyWorkData[] {
  return energyWorkData;
}

/**
 * Get energy work data entry by id
 */
export function getDataById(id: string): EnergyWorkData | undefined {
  return energyWorkData.find((d) => d.id === id);
}

/**
 * Get energy work data by category
 */
export function getDataByCategory(category: string): EnergyWorkData[] {
  return energyWorkData.filter((d) => d.category === category);
}