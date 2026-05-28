const STORAGE_KEY = 'journey_milestones';

export type MilestoneCategory = 'prática' | 'conhecimento' | 'transformação';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  completedAt?: string;
}

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
}

const milestoneDefinitions: MilestoneDefinition[] = [
  // Prática
  {
    id: 'pratica-ritual-iniciacao',
    title: 'Ritual de Iniciação',
    description: 'Completou o primeiro ritual de abertura do caminho',
    category: 'prática',
  },
  {
    id: 'pratica-meditation-7-dias',
    title: 'Sete Dias de Meditação',
    description: 'Manteve prática de meditação por 7 dias consecutivos',
    category: 'prática',
  },
  {
    id: 'pratica-reflexao-30-dias',
    title: 'Mês de Reflexão',
    description: 'Completou 30 dias de exercícios reflexivos',
    category: 'prática',
  },
  {
    id: 'pratica-oracao-matinal',
    title: 'Oração Matinal',
    description: 'Estabeleceu prática de oração matinal',
    category: 'prática',
  },
  {
    id: 'pratica-gratidao-diario',
    title: 'Diário de Gratidão',
    description: 'Completou 21 dias de registro de gratidão',
    category: 'prática',
  },

  // Conhecimento
  {
    id: 'conhecimento-sefirot-completo',
    title: 'Camino das Sefirot',
    description: 'Estudou todas as 10 sefirot',
    category: 'conhecimento',
  },
  {
    id: 'conhecimento-arvore-vida',
    title: 'Árvore da Vida',
    description: 'Compreendeu a estrutura da Árvore da Vida',
    category: 'conhecimento',
  },
  {
    id: 'conhecimento-22-caminhos',
    title: 'Os 22 Caminhos',
    description: 'Estudou os 22 caminhos da Árvore',
    category: 'conhecimento',
  },
  {
    id: 'conhecimento-cabala-textos',
    title: 'Textos Cabalísticos',
    description: 'Leu os textos fundamentais da cabala',
    category: 'conhecimento',
  },
  {
    id: 'conhecimento-tres-pilares',
    title: 'Três Pilares',
    description: 'Compreendeu os três pilares da Árvore',
    category: 'conhecimento',
  },

  // Transformação
  {
    id: 'transformacao-identidade',
    title: 'Renascimento Interior',
    description: 'Completou jornada de autodescoberta',
    category: 'transformação',
  },
  {
    id: 'transformacao-intencao',
    title: 'Poder da Intenção',
    description: 'Definiu intenção clara para seu caminho',
    category: 'transformação',
  },
  {
    id: 'transformacao-equilibrio',
    title: 'Equilíbrio Interior',
    description: 'Encontrou harmonia entre os opostos',
    category: 'transformação',
  },
  {
    id: 'transformacao-proposito',
    title: 'Descoberta do Propósito',
    description: 'Identificou seu propósito de vida',
    category: 'transformação',
  },
  {
    id: 'transformacao-liberacao',
    title: 'Libertação Interior',
    description: 'Libertou-se de crenças limitantes',
    category: 'transformação',
  },
];

function readStorage(): Record<string, string | undefined> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: Record<string, string | undefined>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function getMilestones(): Milestone[] {
  const completed = readStorage();
  return milestoneDefinitions.map((def) => ({
    ...def,
    completedAt: completed[def.id],
  }));
}

export function getMilestonesByCategory(
  category: MilestoneCategory
): Milestone[] {
  return getMilestones().filter((m) => m.category === category);
}

export function markMilestone(id: string, completed: boolean = true): void {
  const data = readStorage();
  if (completed) {
    data[id] = new Date().toISOString();
  } else {
    delete data[id];
  }
  writeStorage(data);
}

export function getMilestoneProgress(): {
  completed: number;
  total: number;
  byCategory: Record<MilestoneCategory, { completed: number; total: number }>;
} {
  const milestones = getMilestones();
  const completed = milestones.filter((m) => m.completedAt !== undefined);

  const byCategory = (
    ['prática', 'conhecimento', 'transformação'] as MilestoneCategory[]
  ).reduce(
    (acc, cat) => {
      const catMilestones = milestones.filter((m) => m.category === cat);
      const catCompleted = catMilestones.filter((m) => m.completedAt !== undefined);
      acc[cat] = { completed: catCompleted.length, total: catMilestones.length };
      return acc;
    },
    {} as Record<MilestoneCategory, { completed: number; total: number }>
  );

  return {
    completed: completed.length,
    total: milestones.length,
    byCategory,
  };
}