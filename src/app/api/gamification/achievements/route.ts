// ============================================================
// GAMIFICATION ACHIEVEMENTS API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for gamification achievements
// - List all achievements with user progress
// - Get specific achievement details
// - Get achievements by category
// - Achievement unlocking and progress tracking
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type AchievementCategory = 'prática' | 'conhecimento' | 'streak';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  target: number;
  progress?: number;
  unlockedAt: string | null;
}

export interface AchievementsResponse {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
}

// ============================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================

const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  // Prática achievements
  {
    id: 'first-consultation',
    name: 'Primeiros Passos',
    description: 'Complete sua primeira consulta',
    icon: '✨',
    category: 'prática',
    rarity: 'common',
    target: 1,
  },
  {
    id: 'ten-consultations',
    name: 'Iniciante',
    description: 'Complete 10 consultas',
    icon: '📜',
    category: 'prática',
    rarity: 'common',
    target: 10,
  },
  {
    id: 'fifty-consultations',
    name: 'Explorador',
    description: 'Complete 50 consultas',
    icon: '🔮',
    category: 'prática',
    rarity: 'uncommon',
    target: 50,
  },
  {
    id: 'hundred-consultations',
    name: 'Mestre',
    description: 'Complete 100 consultas',
    icon: '👑',
    category: 'prática',
    rarity: 'rare',
    target: 100,
  },

  // Conhecimento achievements
  {
    id: 'first-meditation',
    name: 'Calma Interior',
    description: 'Complete sua primeira meditação',
    icon: '🧘',
    category: 'conhecimento',
    rarity: 'common',
    target: 1,
  },
  {
    id: 'ten-meditations',
    name: 'Praticante',
    description: 'Complete 10 медитаций',
    icon: '🕉️',
    category: 'conhecimento',
    rarity: 'common',
    target: 10,
  },
  {
    id: 'fifty-meditations',
    name: 'Meditador',
    description: 'Complete 50 meditações',
    icon: '🌟',
    category: 'conhecimento',
    rarity: 'uncommon',
    target: 50,
  },
  {
    id: 'hundred-meditations',
    name: 'Mestre da Mente',
    description: 'Complete 100 meditações',
    icon: '🧠',
    category: 'conhecimento',
    rarity: 'rare',
    target: 100,
  },
  {
    id: 'hour-of-meditation',
    name: 'Hora da Paz',
    description: 'Medite por um total de 1 hora',
    icon: '⏰',
    category: 'conhecimento',
    rarity: 'uncommon',
    target: 60,
  },
  {
    id: 'ten-hours-meditation',
    name: 'Dedicação',
    description: 'Medite por um total de 10 horas',
    icon: '💫',
    category: 'conhecimento',
    rarity: 'rare',
    target: 600,
  },

  // Streak achievements
  {
    id: 'streak-3',
    name: 'Consistência',
    description: 'Mantenha uma sequência de 3 dias',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    target: 3,
  },
  {
    id: 'streak-7',
    name: 'Dedicado',
    description: 'Mantenha uma sequência de 7 dias',
    icon: '🔥',
    category: 'streak',
    rarity: 'uncommon',
    target: 7,
  },
  {
    id: 'streak-14',
    name: 'Comprometido',
    description: 'Mantenha uma sequência de 14 dias',
    icon: '⚡',
    category: 'streak',
    rarity: 'rare',
    target: 14,
  },
  {
    id: 'streak-30',
    name: 'Devoto',
    description: 'Mantenha uma sequência de 30 dias',
    icon: '💎',
    category: 'streak',
    rarity: 'legendary',
    target: 30,
  },
  {
    id: 'streak-100',
    name: 'Lenda',
    description: 'Mantenha uma sequência de 100 dias',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    target: 100,
  },
];

// ============================================================
// STORAGE HELPERS (localStorage simulation)
// ============================================================

const STORAGE_KEY = 'gamification_achievements';

interface AchievementStore {
  unlocked: Record<string, string>; // achievementId -> unlockedAt ISO string
  progress: Record<string, number>; // achievementId -> current progress
}

function getStore(): AchievementStore {
  if (typeof window === 'undefined') {
    return { unlocked: {}, progress: {} };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { unlocked: {}, progress: {} };
}

function saveStore(store: AchievementStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function buildAchievementWithProgress(
  def: Omit<Achievement, 'unlockedAt' | 'progress'>,
  store: AchievementStore
): Achievement {
  return {
    ...def,
    progress: store.progress[def.id] ?? 0,
    unlockedAt: store.unlocked[def.id] ?? null,
  };
}

function calculateCompletionPercentage(unlocked: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((unlocked / total) * 100);
}

// ============================================================
// GET ALL ACHIEVEMENTS
// ============================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as AchievementCategory | null;
  const achievementId = searchParams.get('id');
  const stats = searchParams.get('stats');
  const recent = searchParams.get('recent');

  const store = getStore();

  // Get single achievement by ID
  if (achievementId) {
    const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!def) {
      return NextResponse.json(
        { error: 'Achievement not found', achievementId },
        { status: 404 }
      );
    }
    const achievement = buildAchievementWithProgress(def, store);
    return NextResponse.json({ achievement });
  }

  // Get recent achievements
  if (recent) {
    const limit = Math.min(parseInt(recent, 10) || 5, 20);
    const allAchievements = ACHIEVEMENTS.map((def) =>
      buildAchievementWithProgress(def, store)
    );
    const recentUnlocked = allAchievements
      .filter((a) => a.unlockedAt !== null)
      .sort(
        (a, b) =>
          new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
      )
      .slice(0, limit);
    return NextResponse.json({ achievements: recentUnlocked });
  }

  // Filter by category or return all
  let filteredDefinitions = ACHIEVEMENTS;
  if (category && ['prática', 'conhecimento', 'streak'].includes(category)) {
    filteredDefinitions = ACHIEVEMENTS.filter((a) => a.category === category);
  }

  const achievements = filteredDefinitions.map((def) =>
    buildAchievementWithProgress(def, store)
  );

  const unlockedCount = Object.keys(store.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = calculateCompletionPercentage(
    unlockedCount,
    totalCount
  );

  // Include stats if requested
  if (stats === 'true') {
    return NextResponse.json({
      achievements,
      stats: {
        unlockedCount,
        totalCount,
        completionPercentage,
        byCategory: {
          prática: achievements.filter((a) => a.category === 'prática'),
          conhecimento: achievements.filter((a) => a.category === 'conhecimento'),
          streak: achievements.filter((a) => a.category === 'streak'),
        },
        byRarity: {
          common: achievements.filter((a) => a.rarity === 'common'),
          uncommon: achievements.filter((a) => a.rarity === 'uncommon'),
          rare: achievements.filter((a) => a.rarity === 'rare'),
          legendary: achievements.filter((a) => a.rarity === 'legendary'),
        },
      },
    } as AchievementsResponse & {
      stats: {
        unlockedCount: number;
        totalCount: number;
        completionPercentage: number;
        byCategory: Record<AchievementCategory, Achievement[]>;
        byRarity: Record<AchievementRarity, Achievement[]>;
      };
    });
  }

  return NextResponse.json({
    achievements,
    unlockedCount,
    totalCount,
    completionPercentage,
  } as AchievementsResponse);
}