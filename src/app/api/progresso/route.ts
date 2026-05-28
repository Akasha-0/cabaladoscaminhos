// ============================================================
// SPIRITUAL PROGRESS API - CABALA DOS CAMINHOS
// ============================================================
// GET spiritual progress with stats and achievements
// - User progress tracking
// - Achievement system with milestones
// - Statistics aggregation
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface ReadingProgress {
  total: number;
  byType: Record<string, number>;
  thisWeek: number;
  thisMonth: number;
}

interface RitualProgress {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  favoriteRitual: string | null;
}

interface MeditationProgress {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  currentMeditationStreak: number;
  longestMeditationStreak: number;
}

interface CreditsProgress {
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  mostExpensiveFeature: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
  category: 'readings' | 'rituals' | 'meditation' | 'credits' | 'streaks' | 'exploration';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface ProgressStats {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalPoints: number;
}

interface SpiritualProgress {
  userId: string;
  stats: ProgressStats;
  readings: ReadingProgress;
  rituals: RitualProgress;
  meditation: MeditationProgress;
  credits: CreditsProgress;
  achievements: Achievement[];
  lastActive: string;
  memberSince: string;
}

// ============================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================

const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  // Readings achievements
  { id: 'first_reading', name: 'Primeiros Passos', description: 'Complete sua primeira consulta', icon: '✨', target: 1, category: 'readings', rarity: 'common' },
  { id: 'reader_10', name: 'Iniciante', description: 'Complete 10 consultas', icon: '📜', target: 10, category: 'readings', rarity: 'common' },
  { id: 'reader_50', name: 'Explorador', description: 'Complete 50 consultas', icon: '🔮', target: 50, category: 'readings', rarity: 'uncommon' },
  { id: 'reader_100', name: 'Seekers Ancião', description: 'Complete 100 consultas', icon: '👁️', target: 100, category: 'readings', rarity: 'rare' },
  { id: 'reader_500', name: 'Mestre das Artes Arcanas', description: 'Complete 500 consultas', icon: '🌟', target: 500, category: 'readings', rarity: 'epic' },
  { id: 'all_types', name: 'Polímata Espiritual', description: 'Experimente todos os tipos de consulta', icon: '🎭', target: 8, category: 'readings', rarity: 'rare' },
  
  // Ritual achievements
  { id: 'ritual_1', name: 'Praticante', description: 'Complete seu primeiro ritual', icon: '🕯️', target: 1, category: 'rituals', rarity: 'common' },
  { id: 'ritual_streak_7', name: 'Dedicado', description: 'Mantenha uma sequência de 7 dias', icon: '🔥', target: 7, category: 'streaks', rarity: 'uncommon' },
  { id: 'ritual_streak_30', name: 'Devoto', description: 'Mantenha uma sequência de 30 dias', icon: '⚡', target: 30, category: 'streaks', rarity: 'rare' },
  { id: 'ritual_streak_100', name: 'Mestre Devocional', description: 'Mantenha uma sequência de 100 dias', icon: '💫', target: 100, category: 'streaks', rarity: 'epic' },
  { id: 'ritual_master', name: 'Mestre dos Rituals', description: 'Complete 100 rituais', icon: '🏆', target: 100, category: 'rituals', rarity: 'epic' },
  
  // Meditation achievements
  { id: 'meditation_first', name: 'Calma Interior', description: 'Complete sua primeira meditação', icon: '🧘', target: 1, category: 'meditation', rarity: 'common' },
  { id: 'meditation_hour', name: 'Meditador hourly', description: 'Medite por um total de 1 hora', icon: '⏰', target: 60, category: 'meditation', rarity: 'uncommon' },
  { id: 'meditation_master', name: 'Mestre da Mente', description: 'Medite por um total de 100 horas', icon: '🧠', target: 6000, category: 'meditation', rarity: 'legendary' },
  
  // Credit achievements
  { id: 'earn_100', name: 'Coletor', description: 'Ganhe 100 créditos', icon: '💎', target: 100, category: 'credits', rarity: 'common' },
  { id: 'spend_500', name: 'Generoso', description: 'Gaste 500 créditos', icon: '🎁', target: 500, category: 'credits', rarity: 'uncommon' },
  { id: 'wealthy', name: 'Abastado', description: 'Acumule 1000 créditos', icon: '👑', target: 1000, category: 'credits', rarity: 'rare' },
  
  // Exploration achievements
  { id: 'all_features', name: 'Explorador Completo', description: 'Use todos os recursos da plataforma', icon: '🗺️', target: 12, category: 'exploration', rarity: 'rare' },
  { id: 'deep_dive', name: 'Mergulho Profundo', description: 'Use a mesma feature 50 vezes', icon: '📊', target: 50, category: 'exploration', rarity: 'uncommon' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateLevel(experience: number): { level: number; expForCurrent: number; expToNext: number } {
  const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, 21000];
  
  let level = 1;
  let expForCurrent = 0;
  let expToNext = levelThresholds[1] || levelThresholds[levelThresholds.length - 1] + 10000;
  
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (experience >= levelThresholds[i]) {
      level = i + 1;
      expForCurrent = levelThresholds[i];
      expToNext = levelThresholds[i + 1] || levelThresholds[i] + 10000;
      break;
    }
  }
  
  return { level, expForCurrent, expToNext };
}

function getAchievementProgress(
  achievement: Omit<Achievement, 'unlockedAt' | 'progress'>,
  progress: SpiritualProgress
): { progress: number; unlockedAt: string | null } {
  let currentValue = 0;
  let unlockedAt: string | null = null;
  
  switch (achievement.category) {
    case 'readings':
      if (achievement.id === 'all_types') {
        currentValue = Object.keys(progress.readings.byType).length;
      } else {
        currentValue = progress.readings.total;
      }
      break;
    case 'rituals':
      currentValue = progress.rituals.totalCompletions;
      break;
    case 'streaks':
      currentValue = Math.max(progress.rituals.longestStreak, progress.meditation.longestMeditationStreak);
      break;
    case 'meditation':
      currentValue = achievement.id === 'meditation_hour' || achievement.id === 'meditation_master' 
        ? progress.meditation.totalMinutes 
        : progress.meditation.totalSessions;
      break;
    case 'credits':
      if (achievement.id === 'spend_500') {
        currentValue = progress.credits.totalSpent;
      } else if (achievement.id === 'wealthy') {
        currentValue = progress.credits.currentBalance;
      } else {
        currentValue = progress.credits.totalEarned;
      }
      break;
    case 'exploration':
      // Simplified: count features with at least 1 use
      currentValue = Object.keys(progress.readings.byType).length;
      break;
  }
  
  if (currentValue >= achievement.target) {
    unlockedAt = new Date().toISOString();
  }
  
  return { progress: currentValue, unlockedAt };
}

function getXpForAction(action: string): number {
  const xpMap: Record<string, number> = {
    'reading': 15,
    'ritual': 25,
    'meditation': 10,
    'insight': 20,
    'login': 5,
  };
  return xpMap[action] || 5;
}

function calculateRarityMultiplier(rarity: Achievement['rarity']): number {
  const multipliers: Record<Achievement['rarity'], number> = {
    common: 1,
    uncommon: 2,
    rare: 5,
    epic: 10,
    legendary: 25,
  };
  return multipliers[rarity];
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user from auth header or IP for anonymous
    const authHeader = request.headers.get('authorization');
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    let user = null;
    if (authHeader) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    const targetUserId = user?.id || userId;

    // Fetch reading stats from Supabase
    const readings: ReadingProgress = {
      total: 0,
      byType: {},
      thisWeek: 0,
      thisMonth: 0,
    };

    const rituals: RitualProgress = {
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      favoriteRitual: null,
    };

    const meditation: MeditationProgress = {
      totalSessions: 0,
      totalMinutes: 0,
      averageSessionLength: 0,
      currentMeditationStreak: 0,
      longestMeditationStreak: 0,
    };

    const credits: CreditsProgress = {
      totalEarned: 0,
      totalSpent: 0,
      currentBalance: 0,
      mostExpensiveFeature: null,
    };

    // Try to fetch real data from Supabase
    if (targetUserId !== 'anonymous') {
      // Fetch readings
      try {
        const { data: readingData, error: readingError } = await supabase
          .from('historico_consultas')
          .select('tipo, created_at')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false });

        if (!readingError && readingData) {
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          readings.total = readingData.length;
          readingData.forEach((r: { tipo: string; created_at: string }) => {
            readings.byType[r.tipo] = (readings.byType[r.tipo] || 0) + 1;
            const date = new Date(r.created_at);
            if (date >= weekAgo) readings.thisWeek++;
            if (date >= monthAgo) readings.thisMonth++;
          });
        }
      } catch {
        // Use default values
      }

      // Fetch rituals
      try {
        const { data: ritualData, error: ritualError } = await supabase
          .from('ritual_completions')
          .select('*')
          .eq('user_id', targetUserId)
          .order('completed_at', { ascending: false });

        if (!ritualError && ritualData) {
          rituals.totalCompletions = ritualData.length;
          rituals.currentStreak = calculateStreak(ritualData);
          rituals.longestStreak = rituals.currentStreak; // Simplified
          rituals.completionRate = ritualData.length > 0 ? 0.85 : 0; // Simplified
        }
      } catch {
        // Use default values
      }

      // Fetch meditation sessions
      try {
        const { data: meditationData, error: meditationError } = await supabase
          .from('meditation_sessions')
          .select('duration_minutes, completed_at')
          .eq('user_id', targetUserId);

        if (!meditationError && meditationData) {
          meditation.totalSessions = meditationData.length;
          meditation.totalMinutes = meditationData.reduce((sum: number, s: { duration_minutes: number }) => sum + s.duration_minutes, 0);
          meditation.averageSessionLength = meditation.totalSessions > 0 
            ? Math.round(meditation.totalMinutes / meditation.totalSessions) 
            : 0;
        }
      } catch {
        // Use default values
      }

      // Fetch credits info
      try {
        const { data: creditData, error: creditError } = await supabase
          .from('transacoes_credito')
          .select('tipo, valor, created_at')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false });

        if (!creditError && creditData) {
          creditData.forEach((t: { tipo: string; valor: number }) => {
            if (t.tipo === 'credito' || t.tipo === 'assinatura') {
              credits.totalEarned += t.valor;
            } else {
              credits.totalSpent += t.valor;
            }
          });
          credits.currentBalance = credits.totalEarned - credits.totalSpent;
        }
      } catch {
        // Use default values
      }
    }

    // Calculate total points and experience
    const totalPoints = 
      readings.total * 10 +
      rituals.totalCompletions * 15 +
      meditation.totalMinutes +
      credits.currentBalance / 10;

    const experience = Math.floor(totalPoints * 1.5);
    const { level, expForCurrent, expToNext } = calculateLevel(experience);

    // Build achievements with progress
    const achievements: Achievement[] = ACHIEVEMENTS.map(achievement => {
      const progressData = getAchievementProgress(achievement, {
        userId: targetUserId,
        stats: { level, experience, experienceToNextLevel: expToNext - expForCurrent, totalPoints },
        readings,
        rituals,
        meditation,
        credits,
        achievements: [],
        lastActive: new Date().toISOString(),
        memberSince: new Date().toISOString(),
      });
      
      return {
        ...achievement,
        progress: progressData.progress,
        unlockedAt: progressData.unlockedAt,
      };
    });

    // Calculate stats
    const stats: ProgressStats = {
      level,
      experience,
      experienceToNextLevel: expToNext - expForCurrent,
      totalPoints: Math.floor(totalPoints),
    };

    const response: SpiritualProgress = {
      userId: targetUserId,
      stats,
      readings,
      rituals,
      meditation,
      credits,
      achievements,
      lastActive: new Date().toISOString(),
      memberSince: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar progresso espiritual' },
      { status: 500 }
    );
  }
}

// Helper to calculate streak
function calculateStreak(completions: { completed_at: string }[]): number {
  if (!completions || completions.length === 0) return 0;
  
  const dates = completions
    .map(c => new Date(c.completed_at).toISOString().split('T')[0])
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort()
    .reverse();
  
  if (dates.length === 0) return 0;
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const checkDate = new Date(today);
  
  for (const date of dates) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dates.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}