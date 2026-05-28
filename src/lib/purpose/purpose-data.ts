// Purpose data

export interface PurposeEntity {
  id: string;
  name: string;
  description: string;
  dimension?: string;
}

export interface PurposeData {
  entities: PurposeEntity[];
}

const purposeEntities: PurposeEntity[] = [
  {
    id: 'life-purpose',
    name: 'Life Purpose',
    description: 'The central intention that gives direction and meaning to existence.',
    dimension: 'existential',
  },
  {
    id: 'soul-mission',
    name: 'Soul Mission',
    description: 'The sacred contract agreed upon before incarnation.',
    dimension: 'transcendental',
  },
  {
    id: 'dharma',
    name: 'Dharma',
    description: 'One\'s sacred duty and the path of right action.',
    dimension: 'spiritual',
  },
  {
    id: 'sacred-calling',
    name: 'Sacred Calling',
    description: 'A profound summons from the divine to serve a higher cause.',
    dimension: 'mystical',
  },
  {
    id: 'divine-assignment',
    name: 'Divine Assignment',
    description: 'The unique role each soul plays in the cosmic unfolding.',
    dimension: 'cosmic',
  },
];

export function getData(): PurposeData {
  return {
    entities: purposeEntities,
  };
}