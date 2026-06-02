// fallow-ignore-file unused-file
const STORAGE_KEY = 'progress_achievements';

export type AchievementCategory = 
  | 'milestone' 
  | 'streak' 
  | 'exploration' 
  | 'mastery' 
  | 'special';

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  unlockedAt?: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
}

interface AchievementStore {
  unlocked: string[];
}

const achievementDefinitions: AchievementDefinition[] = [
  // Milestone achievements
  {
    id: 'first-step',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira prática',
    category: 'milestone',
    icon: '🌱',
  },
  {
    id: 'week-warrior',
    name: 'Guerreiro da Semana',
    description: 'Pratique por 7 dias consecutivos',
    category: 'milestone',
    icon: '⚔️',
  },
  {
    id: 'month-master',
    name: 'Mestre do Mês',
    description: 'Mantenha um streak de 30 dias',
    category: 'milestone',
    icon: '🏆',
  },

  // Streak achievements
  {
    id: 'streak-7',
    name: 'Sete Dias',
    description: 'Acumule 7 dias de prática',
    category: 'streak',
    icon: '🔥',
  },
  {
    id: 'streak-30',
    name: 'Flamante',
    description: 'Acumule 30 dias de prática',
    category: 'streak',
    icon: '✨',
  },
  {
    id: 'streak-100',
    name: 'Cem Dias de Fogo',
    description: 'Acumule 100 dias de prática',
    category: 'streak',
    icon: '💫',
  },

  // Exploration achievements
  {
    id: 'full-map',
    name: 'Cartógrafo',
    description: 'Explore todos os mapas natais',
    category: 'exploration',
    icon: '🗺️',
  },
  {
    id: 'all-planets',
    name: 'Explorador Cósmico',
    description: 'Visualize todos os planetas',
    category: 'exploration',
    icon: '🪐',
  },

  // Mastery achievements
  {
    id: 'deep-dive',
    name: 'Mergulho Profundo',
    description: 'Aprofunde-se em um aspecto por 10 sessões',
    category: 'mastery',
    icon: '🌊',
  },
  {
    id: 'wisdom-seeker',
    name: 'Buscador da Sabedoria',
    description: 'Complete 50 lições',
    category: 'mastery',
    icon: '📚',
  },

  // Special achievements
  {
    id: 'early-adopter',
    name: 'Pioneiro',
    description: 'Participe do período de beta',
    category: 'special',
    icon: '🚀',
  },
  {
    id: 'feedback-hero',
    name: 'Herói do Feedback',
    description: 'Envie feedback construtivo',
    category: 'special',
    icon: '💬',
  },
];

function readStorage(): AchievementStore {
  if (typeof window === 'undefined') {
    return { unlocked: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { unlocked: [] };
  } catch {
    return { unlocked: [] };
  }
}

function writeStorage(data: AchievementStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function getAchievements(): AchievementBadge[] {
  const store = readStorage();
  return achievementDefinitions.map((def) => ({
    ...def,
    unlockedAt: store.unlocked.includes(def.id)
      ? store.unlocked[store.unlocked.indexOf(def.id) + 1] || undefined
      : undefined,
  }));
}

export function getAchievementsByCategory(category: AchievementCategory): AchievementBadge[] {
  return getAchievements().filter((a) => a.category === category);
}

export function getAchievementById(id: string): AchievementBadge | undefined {
  return getAchievements().find((a) => a.id === id);
}

export function unlockAchievement(id: string): boolean {
  const store = readStorage();
  if (store.unlocked.includes(id)) {
    return false;
  }
  store.unlocked.push(id, new Date().toISOString());
  writeStorage(store);
  return true;
}

export function getUnlockedCount(): number {
  const store = readStorage();
  return store.unlocked.filter((item, index) => index % 2 === 0).length;
}

export function getTotalCount(): number {
  return achievementDefinitions.length;
}

export function getCompletionPercentage(): number {
  const total = getTotalCount();
  if (total === 0) return 0;
  return Math.round((getUnlockedCount() / total) * 100);
}

export function getRecentAchievements(limit: number = 5): AchievementBadge[] {
  const store = readStorage();
  const achievements: AchievementBadge[] = [];
  
  for (let i = 0; i < store.unlocked.length; i += 2) {
    const id = store.unlocked[i];
    const date = store.unlocked[i + 1];
    const def = achievementDefinitions.find((d) => d.id === id);
    if (def) {
      achievements.push({ ...def, unlockedAt: date });
    }
  }
  
  return achievements
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, limit);
}