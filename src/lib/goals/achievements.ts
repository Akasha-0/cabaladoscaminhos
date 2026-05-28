/**
 * Goals achievement system
 * Tracks and unlocks achievements based on user goal progress and milestones
 */

const STORAGE_KEY = 'goals_achievements';

export type AchievementCategory = 'goal' | 'milestone' | 'streak' | 'mastery';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xp: number;
  unlockedAt: string | null;
  progress?: number;
  target?: number;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xp: number;
  target: number;
}

const achievementDefinitions: AchievementDefinition[] = [
  // Goal achievements
  {
    id: 'first-goal',
    name: 'Início da Jornada',
    description: 'Crie seu primeiro objetivo',
    category: 'goal',
    rarity: 'common',
    icon: '🎯',
    xp: 10,
    target: 1,
  },
  {
    id: 'five-goals',
    name: 'Planejador',
    description: 'Crie 5 objetivos',
    category: 'goal',
    rarity: 'rare',
    icon: '📋',
    xp: 50,
    target: 5,
  },
  {
    id: 'ten-goals',
    name: 'Arquiteto de Sonhos',
    description: 'Crie 10 objetivos',
    category: 'goal',
    rarity: 'epic',
    icon: '🏗️',
    xp: 100,
    target: 10,
  },
  {
    id: 'twenty-goals',
    name: 'Mestre Planejador',
    description: 'Crie 20 objetivos',
    category: 'goal',
    rarity: 'legendary',
    icon: '👑',
    xp: 250,
    target: 20,
  },
  // Milestone achievements
  {
    id: 'first-completed',
    name: 'Primeiro Passo',
    description: 'Complete seu primeiro objetivo',
    category: 'milestone',
    rarity: 'common',
    icon: '✅',
    xp: 25,
    target: 1,
  },
  {
    id: 'five-completed',
    name: 'Conquistador',
    description: 'Complete 5 objetivos',
    category: 'milestone',
    rarity: 'rare',
    icon: '🏆',
    xp: 75,
    target: 5,
  },
  {
    id: 'ten-completed',
    name: 'Realizador',
    description: 'Complete 10 objetivos',
    category: 'milestone',
    rarity: 'epic',
    icon: '⭐',
    xp: 150,
    target: 10,
  },
  {
    id: 'twenty-five-completed',
    name: 'Lenda da Produtividade',
    description: 'Complete 25 objetivos',
    category: 'milestone',
    rarity: 'legendary',
    icon: '🌟',
    xp: 300,
    target: 25,
  },
  {
    id: 'fifty-completed',
    name: 'Mestre das Conquistas',
    description: 'Complete 50 objetivos',
    category: 'milestone',
    rarity: 'legendary',
    icon: '💎',
    xp: 500,
    target: 50,
  },
  // Streak achievements
  {
    id: 'three-day-streak',
    name: 'Consistência Inicial',
    description: 'Mantenha uma sequência de 3 dias',
    category: 'streak',
    rarity: 'common',
    icon: '🔥',
    xp: 30,
    target: 3,
  },
  {
    id: 'seven-day-streak',
    name: 'Semana Perfeita',
    description: 'Mantenha uma sequência de 7 dias',
    category: 'streak',
    rarity: 'rare',
    icon: '🔥',
    xp: 70,
    target: 7,
  },
  {
    id: 'fourteen-day-streak',
    name: 'Duas Semanas de Foco',
    description: 'Mantenha uma sequência de 14 dias',
    category: 'streak',
    rarity: 'epic',
    icon: '🔥',
    xp: 140,
    target: 14,
  },
  {
    id: 'thirty-day-streak',
    name: 'Mês de Ouro',
    description: 'Mantenha uma sequência de 30 dias',
    category: 'streak',
    rarity: 'legendary',
    icon: '🔥',
    xp: 300,
    target: 30,
  },
  {
    id: 'sixty-day-streak',
    name: 'Guardião da Determinação',
    description: 'Mantenha uma sequência de 60 dias',
    category: 'streak',
    rarity: 'legendary',
    icon: '🔥',
    xp: 600,
    target: 60,
  },
  {
    id: 'hundred-day-streak',
    name: 'Lenda Eterna',
    description: 'Mantenha uma sequência de 100 dias',
    category: 'streak',
    rarity: 'legendary',
    icon: '🔥',
    xp: 1000,
    target: 100,
  },
  // Mastery achievements
  {
    id: 'category-master',
    name: 'Especialista',
    description: 'Complete 10 objetivos de uma categoria',
    category: 'mastery',
    rarity: 'epic',
    icon: '🎓',
    xp: 200,
    target: 10,
  },
  {
    id: 'all-categories',
    name: 'Sabedoria Universal',
    description: 'Complete objetivos de todas as categorias',
    category: 'mastery',
    rarity: 'legendary',
    icon: '🧙',
    xp: 400,
    target: 1,
  },
  {
    id: 'early-bird',
    name: 'Madrugador',
    description: 'Complete um objetivo antes das 8h',
    category: 'mastery',
    rarity: 'rare',
    icon: '🌅',
    xp: 50,
    target: 1,
  },
  {
    id: 'night-owl',
    name: 'Coruja Noturna',
    description: 'Complete um objetivo após as 22h',
    category: 'mastery',
    rarity: 'rare',
    icon: '🦉',
    xp: 50,
    target: 1,
  },
];

interface AchievementStore {
  unlocked: Record<string, string>; // id -> unlockedAt timestamp
  progress: Record<string, number>; // id -> current progress
}

function readStorage(): AchievementStore {
  if (typeof window === 'undefined') {
    return { unlocked: {}, progress: {} };
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { unlocked: {}, progress: {} };
    }
    return JSON.parse(data);
  } catch {
    return { unlocked: {}, progress: {} };
  }
}

function writeStorage(data: AchievementStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Get all achievements with their current state
 */
export function getAchievements(): Achievement[] {
  const store = readStorage();
  return achievementDefinitions.map((def) => ({
    ...def,
    unlockedAt: store.unlocked[def.id] || null,
    progress: store.progress[def.id] ?? 0,
    target: def.target,
  }));
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return getAchievements().find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return getAchievements().filter((a) => a.category === category);
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return getAchievements().filter((a) => a.rarity === rarity);
}

/**
 * Unlock an achievement by ID
 * Returns true if newly unlocked, false if already unlocked or not found
 */
export function unlockAchievement(id: string, progress?: number): boolean {
  const store = readStorage();

  // Already unlocked
  if (store.unlocked[id]) {
    return false;
  }

  const def = achievementDefinitions.find((d) => d.id === id);
  if (!def) {
    return false;
  }

  // Update progress if provided
  if (progress !== undefined) {
    store.progress[id] = progress;
  }

  // Mark as unlocked
  store.unlocked[id] = new Date().toISOString();
  writeStorage(store);

  return true;
}

/**
 * Update progress for an achievement
 * Automatically unlocks if progress meets target
 */
export function updateProgress(id: string, progress: number): void {
  const store = readStorage();
  const def = achievementDefinitions.find((d) => d.id === id);

  if (!def) return;

  store.progress[id] = progress;
  writeStorage(store);

  // Auto-unlock if target reached and not already unlocked
  if (progress >= def.target && !store.unlocked[id]) {
    store.unlocked[id] = new Date().toISOString();
    writeStorage(store);
  }
}

/**
 * Get count of unlocked achievements
 */
export function getUnlockedCount(): number {
  return getAchievements().filter((a) => a.unlockedAt).length;
}

/**
 * Get total achievements count
 */
export function getTotalCount(): number {
  return achievementDefinitions.length;
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(): number {
  const total = getTotalCount();
  if (total === 0) return 0;
  return Math.round((getUnlockedCount() / total) * 100);
}

/**
 * Get recent achievements (most recently unlocked first)
 */
export function getRecentAchievements(limit: number = 5): Achievement[] {
  return getAchievements()
    .filter((a) => a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, limit);
}

/**
 * Get total XP from unlocked achievements
 */
export function getTotalXP(): number {
  return getAchievements()
    .filter((a) => a.unlockedAt)
    .reduce((sum, a) => sum + a.xp, 0);
}

/**
 * Get next achievement to unlock based on progress
 */
export function getNextAchievement(): Achievement | null {
  const achievements = getAchievements();
  const unlockedIds = new Set(achievements.filter((a) => a.unlockedAt).map((a) => a.id));

  // Find achievements that have progress but aren't unlocked
  const withProgress = achievements
    .filter((a) => !unlockedIds.has(a.id) && a.progress !== undefined && a.progress > 0)
    .sort((a, b) => (b.progress ?? 0) / (b.target ?? 1) - (a.progress ?? 0) / (a.target ?? 1));

  if (withProgress.length > 0) {
    return withProgress[0];
  }

  // Return first locked achievement
  const locked = achievements.filter((a) => !unlockedIds.has(a.id));
  return locked.length > 0 ? locked[0] : null;
}

/**
 * Get achievements filtered by unlock status
 */
export function getUnlockedAchievements(): Achievement[] {
  return getAchievements().filter((a) => a.unlockedAt);
}

export function getLockedAchievements(): Achievement[] {
  return getAchievements().filter((a) => !a.unlockedAt);
}

/**
 * Reset all achievement progress and unlocks
 */
export function resetAchievements(): void {
  writeStorage({ unlocked: {}, progress: {} });
}