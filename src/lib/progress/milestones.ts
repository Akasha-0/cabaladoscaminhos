// fallow-ignore-file unused-file
const STORAGE_KEY = 'progress_milestones';

export type MilestoneCategory = 'ritual' | 'estudo' | 'crescimento' | 'conexao';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  unlockedAt?: string;
}

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
}

interface MilestoneStore {
  [milestoneId: string]: {
    unlockedAt: string;
  };
}

const milestoneDefinitions: MilestoneDefinition[] = [
  // Ritual
  {
    id: 'first-ritual',
    title: 'Primeiro Ritual',
    description: 'Complete seu primeiro ritual de abertura',
    category: 'ritual',
  },
  {
    id: 'ritual-seven',
    title: 'Sete Luzes',
    description: 'Complete 7 rituais de abertura',
    category: 'ritual',
  },
  {
    id: 'ritual-twenty-one',
    title: 'Compromisso Sagrado',
    description: 'Complete 21 rituais de abertura',
    category: 'ritual',
  },
  {
    id: 'ritual-forty',
    title: 'Guardiao do Camino',
    description: 'Complete 40 rituais de abertura',
    category: 'ritual',
  },
  {
    id: 'ritual-hundred',
    title: 'Mestre Ritual',
    description: 'Complete 100 rituais de abertura',
    category: 'ritual',
  },

  // Estudo
  {
    id: 'sefirot-first',
    title: 'Primeira Sefira',
    description: 'Estude a primeira sefira da arvore',
    category: 'estudo',
  },
  {
    id: 'sefirot-five',
    title: 'Camino das Cinco',
    description: 'Estude 5 sefirot',
    category: 'estudo',
  },
  {
    id: 'sefirot-all',
    title: 'Arvore Completa',
    description: 'Estude todas as 10 sefirot',
    category: 'estudo',
  },
  {
    id: 'paths-first',
    title: 'Primeiro Caminho',
    description: 'Estude o primeiro caminho da Arvore da Vida',
    category: 'estudo',
  },
  {
    id: 'paths-eleven',
    title: 'Metade do Caminho',
    description: 'Estude 11 caminhos da Arvore da Vida',
    category: 'estudo',
  },
  {
    id: 'paths-all',
    title: 'Mestre dos Caminhos',
    description: 'Estude todos os 22 caminhos da Arvore da Vida',
    category: 'estudo',
  },

  // Crescimento
  {
    id: 'mapa-natal-done',
    title: 'Autoconhecimento Natal',
    description: 'Gere seu primeiro mapa natal',
    category: 'crescimento',
  },
  {
    id: 'numerologia-done',
    title: 'Numero de Vida',
    description: 'Calcule sua numerologia pessoal',
    category: 'crescimento',
  },
  {
    id: 'ciclos-done',
    title: 'Ritmo de Vida',
    description: 'Explore seus ciclos de vida',
    category: 'crescimento',
  },
  {
    id: 'intencao-set',
    title: 'Intencao Estabelecida',
    description: 'Defina sua intencao de caminho',
    category: 'crescimento',
  },
  {
    id: 'transformacao-first',
    title: 'Primeira Transformacao',
    description: 'Complete seu primeiro exercicio de transformacao',
    category: 'crescimento',
  },

  // Conexao
  {
    id: 'meditation-first',
    title: 'Silencio Interior',
    description: 'Complete sua primeira meditacao',
    category: 'conexao',
  },
  {
    id: 'meditation-ten',
    title: 'Dez Sessoes',
    description: 'Complete 10 sessoes de meditacao',
    category: 'conexao',
  },
  {
    id: 'meditation-fifty',
    title: 'Caminhante Interior',
    description: 'Complete 50 sessoes de meditacao',
    category: 'conexao',
  },
  {
    id: 'tarot-first',
    title: 'Primeira Leitura',
    description: 'Receba sua primeira leitura de tarot',
    category: 'conexao',
  },
  {
    id: 'tarot-ten',
    title: 'Explorador do Sagrado',
    description: 'Receba 10 leituras de tarot',
    category: 'conexao',
  },
  {
    id: 'affirmation-seven',
    title: 'Sete Dias de Renovacao',
    description: 'Use affirmations por 7 dias consecutivos',
    category: 'conexao',
  },
  {
    id: 'affirmation-thirty',
    title: 'Mes de Renovacao',
    description: 'Use affirmations por 30 dias consecutivos',
    category: 'conexao',
  },
];

function readStorage(): MilestoneStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: MilestoneStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function getMilestones(): Milestone[] {
  const store = readStorage();
  return milestoneDefinitions.map((def) => {
    const stored = store[def.id];
    return {
      ...def,
      unlockedAt: stored?.unlockedAt,
    };
  });
}

export function getMilestonesByCategory(category: MilestoneCategory): Milestone[] {
  return getMilestones().filter((m) => m.category === category);
}

export function getMilestoneById(id: string): Milestone | undefined {
  return getMilestones().find((m) => m.id === id);
}

export function unlockMilestone(id: string): boolean {
  const store = readStorage();
  if (!milestoneDefinitions.find((d) => d.id === id)) return false;
  if (store[id]?.unlockedAt) return false;

  store[id] = {
    unlockedAt: new Date().toISOString(),
  };
  writeStorage(store);
  return true;
}

export function getUnlockedCount(): number {
  return getMilestones().filter((m) => m.unlockedAt).length;
}

export function getTotalCount(): number {
  return milestoneDefinitions.length;
}

export function getCompletionPercentage(): number {
  const total = getTotalCount();
  if (total === 0) return 0;
  return Math.round((getUnlockedCount() / total) * 100);
}

export function getRecentMilestones(limit: number = 5): Milestone[] {
  return getMilestones()
    .filter((m) => m.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, limit);
}