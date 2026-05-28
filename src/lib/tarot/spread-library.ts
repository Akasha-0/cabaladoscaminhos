export interface SpreadPosition {
  index: number;
  name: string;
  meaning: string;
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  positions: SpreadPosition[];
}

const SINGLE_SPREAD: Spread = {
  id: 'single',
  name: 'Single Card',
  description: 'A quick insight from one card.',
  positions: [
    { index: 0, name: 'The Card', meaning: 'Your current situation or the answer to your question.' },
  ],
};

const THREE_CARD_SPREAD: Spread = {
  id: 'three-card',
  name: 'Three Card',
  description: 'Past, present, and future.',
  positions: [
    { index: 0, name: 'Past', meaning: 'What has led to this moment.' },
    { index: 1, name: 'Present', meaning: 'The current situation or challenge.' },
    { index: 2, name: 'Future', meaning: 'What is unfolding ahead.' },
  ],
};

const CELTIC_CROSS_SPREAD: Spread = {
  id: 'celtic-cross',
  name: 'Celtic Cross',
  description: 'A comprehensive ten-card spread covering the heart of the matter.',
  positions: [
    { index: 0, name: 'The Significator', meaning: 'The central issue or the seeker themselves.' },
    { index: 1, name: 'The Challenge', meaning: 'The obstacle or influence crossing the situation.' },
    { index: 2, name: 'The Foundation', meaning: 'The subconscious basis of the question.' },
    { index: 3, name: 'The Past', meaning: 'Recent events or past influences.' },
    { index: 4, name: 'The Crown', meaning: 'The conscious mind or the best possible outcome.' },
    { index: 5, name: 'The Future', meaning: 'What is approaching or the likely outcome.' },
    { index: 6, name: 'The Near Future', meaning: 'Just around the corner — the immediate trend.' },
    { index: 7, name: 'The Self', meaning: 'The seeker\'s position or attitude.' },
    { index: 8, name: 'The External', meaning: 'Surroundings, environment, or others\' influence.' },
    { index: 9, name: 'The Hopes/Fears', meaning: 'What the querent wishes for or dreads.' },
  ],
};

const spreads: Spread[] = [SINGLE_SPREAD, THREE_CARD_SPREAD, CELTIC_CROSS_SPREAD];

export function getSpreads(): Spread[] {
  return spreads;
}

export function getSpreadByName(name: string): Spread | undefined {
  return spreads.find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
}
