/**
 * Sacred Geometry - Mandala Library
 * 
 * Mandalas are sacred geometric patterns representing the universe,
 * used in contemplative practices across traditions.
 */

export type MandalaType = 
  | 'seed'
  | 'flower'
  | 'star'
  | 'chakras'
  | 'yantra'
  | 'sri'
  | 'torus';

export interface MandalaConfig {
  name: string;
  type: MandalaType;
  description: string;
  layers: number;
  symmetry: number;
  elements: string[];
  colors: string[];
  spiritualMeaning: string;
}

const mandalas: Record<MandalaType, MandalaConfig> = {
  seed: {
    name: 'Bija (Seed Mandala)',
    type: 'seed',
    description: 'Single-pointed geometric seed representing potential and beginning',
    layers: 1,
    symmetry: 1,
    elements: ['bindu', 'circle'],
    colors: ['golden', 'white'],
    spiritualMeaning: 'The point of consciousness before creation',
  },
  flower: {
    name: 'Padma (Lotus Mandala)',
    type: 'flower',
    description: 'Floral pattern with petal arrangements representing purity and enlightenment',
    layers: 8,
    symmetry: 8,
    elements: ['petals', 'center', 'ring'],
    colors: ['pink', 'white', 'gold'],
    spiritualMeaning: 'Purity rising from muddy waters',
  },
  star: {
    name: 'Tara (Star Mandala)',
    type: 'star',
    description: 'Multi-pointed star geometry representing cosmic guidance',
    layers: 12,
    symmetry: 12,
    elements: ['star', 'rays', 'circle'],
    colors: ['silver', 'blue', 'white'],
    spiritualMeaning: 'Divine light and celestial guidance',
  },
  chakras: {
    name: 'Chakra Mandala',
    type: 'chakras',
    description: 'Seven energy centers arranged vertically with their geometric signatures',
    layers: 7,
    symmetry: 4,
    elements: ['lotus', 'triangle', 'circle', 'cube'],
    colors: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'],
    spiritualMeaning: 'The seven wheels of spiritual energy',
  },
  yantra: {
    name: 'Yantra Mandala',
    type: 'yantra',
    description: 'Machine-like geometric instrument for meditation and manifestation',
    layers: 9,
    symmetry: 4,
    elements: ['triangle', 'square', 'circle', 'dot'],
    colors: ['gold', 'red', 'white', 'black'],
    spiritualMeaning: 'Sacred instrument for focusing consciousness',
  },
  sri: {
    name: 'Sri Yantra',
    type: 'sri',
    description: 'The king of yantras - nine interlocking triangles forming 43 triangles',
    layers: 9,
    symmetry: 4,
    elements: ['triangles', 'circles', 'petals', 'bindu'],
    colors: ['gold', 'yellow', 'white'],
    spiritualMeaning: 'Supreme geometric representation of the cosmos',
  },
  torus: {
    name: 'Torus Mandala',
    type: 'torus',
    description: 'Flowing energy patterns resembling a donut shape of infinite flow',
    layers: 12,
    symmetry: 36,
    elements: ['spirals', 'flows', 'rings'],
    colors: ['rainbow', 'gold', 'silver'],
    spiritualMeaning: 'The fundamental energy pattern of existence',
  },
};

/**
 * Get a mandala configuration by type
 */
export function getMandala(type: MandalaType): MandalaConfig {
  return mandalas[type] ?? mandalas.seed;
}

/**
 * List all available mandala types
 */
export function listMandalaTypes(): MandalaType[] {
  return Object.keys(mandalas) as MandalaType[];
}

/**
 * Get all mandalas as an array
 */
export function getAllMandalas(): MandalaConfig[] {
  return Object.values(mandalas);
}