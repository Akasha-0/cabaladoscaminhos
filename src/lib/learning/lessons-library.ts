/**
 * Lessons Library
 * Educational content organized by difficulty levels
 */

export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: LessonLevel;
  category: string;
  content: string;
  duration: number; // minutes
}

const lessons: Lesson[] = [
  // Beginner level
  {
    id: 'intro-cabala-1',
    title: 'Introdução à Cabala',
    description: 'Conceitos fundamentais da tradição cabalística',
    level: 'beginner',
    category: 'cabala',
    content: 'A Cabala é uma tradição mística judaica que busca compreender a natureza divina...',
    duration: 15,
  },
  {
    id: 'intro-numerologia-1',
    title: 'Fundamentos da Numerologia',
    description: 'Aprenda os princípios básicos da numerologia',
    level: 'beginner',
    category: 'numerologia',
    content: 'A numerologia estuda a relação entre números e energia...',
    duration: 10,
  },
  {
    id: 'intro-orixas-1',
    title: 'Conhecendo os Orixás',
    description: 'Introdução aos orixás e suas representações',
    level: 'beginner',
    category: 'orixas',
    content: 'Os orixás são entidades espirituais na tradição Yorubá...',
    duration: 20,
  },
  {
    id: 'intro-tarot-1',
    title: 'Arcanos Maiores do Tarot',
    description: 'Introdução aos 22 arcanos maiores',
    level: 'beginner',
    category: 'tarot',
    content: 'O Tarot é um sistema simbólico古老的 que revela padrões...',
    duration: 25,
  },

  // Intermediate level
  {
    id: 'inter-cabala-1',
    title: 'Árvore da Vida',
    description: 'Os dez sefirot e suas conexões',
    level: 'intermediate',
    category: 'cabala',
    content: 'A Árvore da Vida representa a estrutura do universo...',
    duration: 30,
  },
  {
    id: 'inter-numerologia-1',
    title: 'Cálculo do Número de Vida',
    description: 'Como calcular e interpretar o número de vida',
    level: 'intermediate',
    category: 'numerologia',
    content: 'O número de vida revela seu propósito espiritual...',
    duration: 20,
  },
  {
    id: 'inter-orixas-1',
    title: 'Ervas e Orixás',
    description: 'A relação entre ervas sagradas e orixás',
    level: 'intermediate',
    category: 'orixas',
    content: 'Cada orixá possui ervas associadas para ritual...',
    duration: 25,
  },
  {
    id: 'inter-tarot-1',
    title: 'Arcanos Menores',
    description: 'As quatro suits e seus significados',
    level: 'intermediate',
    category: 'tarot',
    content: 'Os arcanos menores representam situações cotidianas...',
    duration: 30,
  },

  // Advanced level
  {
    id: 'adv-cabala-1',
    title: 'Gematria',
    description: 'Análise numérica dos textos sagrados',
    level: 'advanced',
    category: 'cabala',
    content: 'Gematria é a prática de associar valores numéricos a palavras...',
    duration: 45,
  },
  {
    id: 'adv-numerologia-1',
    title: 'Ciclos de Vida',
    description: 'Interpretação avançada dos ciclos temporais',
    level: 'advanced',
    category: 'numerologia',
    content: 'Os ciclos de vida revelam as tendências de cada período...',
    duration: 40,
  },
  {
    id: 'adv-orixas-1',
    title: 'Ifá e Divinação',
    description: 'O sistema de Ifá para tomada de decisões',
    level: 'advanced',
    category: 'orixas',
    content: 'Ifá é o sistema de divinação tradicional Yorubá...',
    duration: 50,
  },
  {
    id: 'adv-tarot-1',
    title: 'Leituras Avançadas',
    description: 'Técnicas avançadas de interpretação',
    level: 'advanced',
    category: 'tarot',
    content: 'Mergulhe profundamente nas técnicas de leitura...',
    duration: 60,
  },
];

/**
 * Get all lessons
 */
export function getLessons(): Lesson[] {
  return lessons;
}

/**
 * Get lessons by level
 */
export function getLessonsByLevel(level: LessonLevel): Lesson[] {
  return lessons.filter((lesson) => lesson.level === level);
}

/**
 * Get lessons by category
 */
export function getLessonsByCategory(category: string): Lesson[] {
  return lessons.filter((lesson) => lesson.category === category);
}

/**
 * Get a single lesson by ID
 */
export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}