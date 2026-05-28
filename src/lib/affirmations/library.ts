import type { Affirmation, Category } from './categories';

const affirmations: Affirmation[] = [
  // Cabala affirmations
  {
    id: 'cab-001',
    category: 'cabala',
    text: 'Eu sou uma expressão sagrada da luz divina fluindo através das dezsefirot.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'cab-002',
    category: 'cabala',
    text: 'Minha alma está conectada à árvore da vida, e cada sefirá ilumina meu caminho.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'cab-003',
    category: 'cabala',
    text: 'Eu permito que a energia de Chesed me ensina a dar com compaixão.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'cab-004',
    category: 'cabala',
    text: 'Gevurá me fortalece a tomar decisões com sabedoria e coragem.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'cab-005',
    category: 'cabala',
    text: 'A harmonia de Tiferet flui através de mim, trazendo equilíbrio ao meu ser.',
    createdAt: new Date('2024-01-01'),
  },

  // Numerologia affirmations
  {
    id: 'num-001',
    category: 'numerologia',
    text: 'Meu número de vida ressoa com a frequência da abundância e propósito.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'num-002',
    category: 'numerologia',
    text: 'As vibrações numéricas guiam meus passos hacia minha missão de alma.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'num-003',
    category: 'numerologia',
    text: 'Eu compreendo que cada número carrega uma mensagem sagrada para minha evolução.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'num-004',
    category: 'numerologia',
    text: 'Minha data de nascimento contém os códigos divinos da minha verdade interior.',
    createdAt: new Date('2024-01-01'),
  },

  // Orixás affirmations
  {
    id: 'ori-001',
    category: 'orixas',
    text: 'Oxum ilumina meu caminho com a luz dourada da prosperidade e do amor.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ori-002',
    category: 'orixas',
    text: 'Ogum me dá força para abrir os caminhos e conquistar meus objetivos.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ori-003',
    category: 'orixas',
    text: 'Iemanjá envolve minha família em ondas de paz e proteção divina.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ori-004',
    category: 'orixas',
    text: 'Xangô traz justiça e equilíbrio às minhas relações e decisões.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'ori-005',
    category: 'orixas',
    text: 'Oxum me conecta com a energia da fertilidade, da beleza e da sabedoria.',
    createdAt: new Date('2024-01-01'),
  },

  // Tarot affirmations
  {
    id: 'tar-001',
    category: 'tarot',
    text: 'A sabedoria do Louco me lembra que cada jornada começa com um passo de fé.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'tar-002',
    category: 'tarot',
    text: 'O Mago desperta em mim a habilidade de manifestar meus sonhos com intenção.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'tar-003',
    category: 'tarot',
    text: 'A Sacerdotisa revela os mistérios internos que guiam minha intuição.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'tar-004',
    category: 'tarot',
    text: 'A Imperatriz abençoa minha vida com criatividade, abundância e natureza.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'tar-005',
    category: 'tarot',
    text: 'O Carro me impulsa a avançar com determinação hacia a vitória.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'tar-006',
    category: 'tarot',
    text: 'A Justiça me recorda que cada ação gera uma consequência kármica perfeita.',
    createdAt: new Date('2024-01-01'),
  },
];

/**
 * Returns all affirmations from the library.
 */
export function getAffirmations(): Affirmation[] {
  return affirmations;
}

/**
 * Returns affirmations filtered by category.
 */
export function getAffirmationsByCategory(category: Category): Affirmation[] {
  return affirmations.filter((a) => a.category === category);
}

/**
 * Returns a random affirmation.
 */
export function getRandomAffirmation(): Affirmation {
  const index = Math.floor(Math.random() * affirmations.length);
  return affirmations[index];
}

/**
 * Returns a random affirmation from a specific category.
 */
export function getRandomAffirmationByCategory(category: Category): Affirmation | null {
  const filtered = getAffirmationsByCategory(category);
  if (filtered.length === 0) return null;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
}
