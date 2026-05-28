// Truth data

export interface TruthEntity {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export interface TruthData {
  entities: TruthEntity[];
}

const truthEntities: TruthEntity[] = [
  {
    id: 'authentic-self',
    name: 'Authentic Self',
    description: 'The unchanging essence that transcends illusion and personal narrative.',
    category: 'fundamental',
  },
  {
    id: 'inner-wisdom',
    name: 'Inner Wisdom',
    description: 'Deep intuition that arises from connection with higher consciousness.',
    category: 'fundamental',
  },
  {
    id: 'universal-law',
    name: 'Universal Law',
    description: 'Immutable principles governing the cosmos and human experience.',
    category: 'cosmic',
  },
  {
    id: 'sacred-knowledge',
    name: 'Sacred Knowledge',
    description: 'Timeless wisdom passed through mystical traditions and direct revelation.',
    category: 'transcendental',
  },
  {
    id: 'divine-order',
    name: 'Divine Order',
    description: 'The underlying harmony that organizes chaos into meaningful patterns.',
    category: 'cosmic',
  },
];

export function getData(): TruthData {
  return {
    entities: truthEntities,
  };
}