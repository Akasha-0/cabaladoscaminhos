// ============================================================
// SPIRITUAL PROGRESS API - CABALA DOS CAMINHOS
// ============================================================
// GET spiritual progress with stats and achievements
// - User progress tracking
// - Achievement system with milestones
// - Statistics aggregation
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CategorySchema = z.enum([
  'readings', 'rituals', 'meditation', 'credits', 'streaks', 'exploration'
]);
const RaritySchema = z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']);

const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.string().nullable(),
  progress: z.number().int().nonnegative(),
  target: z.number().int().positive(),
  category: CategorySchema,
  rarity: RaritySchema,
});

const ProgressQuerySchema = z.object({
  userId: z.string().optional(),
  achievements: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  stats: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

const ProgressStatsSchema = z.object({
  level: z.number().int().positive(),
  experience: z.number().int().nonnegative(),
  experienceToNextLevel: z.number().int().positive(),
  totalPoints: z.number().int().nonnegative(),
});

const ReadingProgressSchema = z.object({
  total: z.number().int().nonnegative(),
  byType: z.record(z.string(), z.number().int()),
  thisWeek: z.number().int().nonnegative(),
  thisMonth: z.number().int().nonnegative(),
});

const RitualProgressSchema = z.object({
  totalCompletions: z.number().int().nonnegative(),
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  completionRate: z.number().min(0).max(100),
  favoriteRitual: z.string().nullable(),
});

const MeditationProgressSchema = z.object({
  totalSessions: z.number().int().nonnegative(),
  totalMinutes: z.number().int().nonnegative(),
  averageSessionLength: z.number().positive(),
  currentMeditationStreak: z.number().int().nonnegative(),
  longestMeditationStreak: z.number().int().nonnegative(),
});

const CreditsProgressSchema = z.object({
  totalEarned: z.number().int().nonnegative(),
  totalSpent: z.number().int().nonnegative(),
  currentBalance: z.number().int(),
  mostExpensiveFeature: z.string().nullable(),
});

export type Achievement = z.infer<typeof AchievementSchema>;
export type ProgressStats = z.infer<typeof ProgressStatsSchema>;
export type ReadingProgress = z.infer<typeof ReadingProgressSchema>;
export type RitualProgress = z.infer<typeof RitualProgressSchema>;
export type MeditationProgress = z.infer<typeof MeditationProgressSchema>;
export type CreditsProgress = z.infer<typeof CreditsProgressSchema>;
export const dynamic = 'force-dynamic';

// ─── Achievement Definitions ──────────────────────────────────────────────────────────
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
  { id: 'ritual_master', name: 'Mestre dos Rituais', description: 'Complete 100 rituais', icon: '🏆', target: 100, category: 'rituals', rarity: 'epic' },
  
  // Meditation achievements
  { id: 'meditation_first', name: 'Calma Interior', description: 'Complete sua primeira meditação', icon: '🧘', target: 1, category: 'meditation', rarity: 'common' },
  { id: 'meditation_hour', name: 'Meditador Horário', description: 'Medite por um total de 1 hora', icon: '⏰', target: 60, category: 'meditation', rarity: 'uncommon' },
  { id: 'meditation_master', name: 'Mestre da Mente', description: 'Medite por um total de 100 horas', icon: '🧠', target: 6000, category: 'meditation', rarity: 'legendary' },
  
  // Credit achievements
  { id: 'first_purchase', name: 'Investidor Espiritual', description: 'Faça sua primeira compra', icon: '💰', target: 1, category: 'credits', rarity: 'common' },
  { id: 'vip_member', name: 'Membro VIP', description: 'Adquira créditos pela primeira vez', icon: '👑', target: 1, category: 'credits', rarity: 'uncommon' },
  
  // Exploration achievements
  { id: 'orixa_explorer', name: 'Explorador dos Orixás', description: 'Descubra 5 Orixás diferentes', icon: '🌊', target: 5, category: 'exploration', rarity: 'uncommon' },
  { id: 'numerology_explorer', name: 'Mestre dos Números', description: 'Calcule 10 mapas numerológicos', icon: '🔢', target: 10, category: 'exploration', rarity: 'uncommon' },
  { id: 'tarot_explorer', name: 'Leitor de Tarô', description: 'Faça 20 leituras de tarô', icon: '🃏', target: 20, category: 'exploration', rarity: 'rare' },
  { id: 'astrology_explorer', name: 'Astrologista', description: 'Calcule 10 mapas astrológicos', icon: '⭐', target: 10, category: 'exploration', rarity: 'rare' },
  { id: 'sacred_geometry_explorer', name: 'Geômetra Sagrado', description: 'Explore todas as formas geométricas', icon: '🔷', target: 10, category: 'exploration', rarity: 'epic' },
];

// ─── Achievement Helper Functions ──────────────────────────────────────────────────────────
function calculateLevel(experience: number): { level: number; expToNext: number } {
  const baseExp = 100;
  const multiplier = 1.5;
  let level = 1;
  let totalExp = 0;
  
  while (totalExp + baseExp * Math.pow(multiplier, level - 1) <= experience) {
    totalExp += baseExp * Math.pow(multiplier, level - 1);
    level++;
  }
  
  const expToNext = baseExp * Math.pow(multiplier, level - 1);
  return { level, expToNext };
}

function enrichAchievement(
  base: Omit<Achievement, 'unlockedAt' | 'progress'>,
  currentProgress: number,
  unlockedAt: string | null
): Achievement {
  return {
    ...base,
    progress: currentProgress,
    unlockedAt,
 };
}

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não autenticado',
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const parseResult = ProgressQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      achievements: searchParams.get('achievements') as 'true' | 'false' | null,
      stats: searchParams.get('stats') as 'true' | 'false' | null,
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { achievements: includeAchievements, stats: includeStats } = parseResult.data;

    // Fetch user data from multiple sources
    const [userProgress, userAchievements, readingsData, ritualsData] = await Promise.all([
      // User progress
      supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
      // User achievements
      supabase.from('user_achievements').select('*').eq('user_id', user.id),
      // Readings count
      supabase.from('leituras_historico').select('tipo', { count: 'exact' }).eq('user_id', user.id),
      // Rituals completed
      supabase.from('rituals_completed').select('*', { count: 'exact' }).eq('user_id', user.id),
    ]);

    // Calculate stats
    const totalReadings = readingsData.count || 0;
    const readingsByType = (readingsData.data || []).reduce((acc, r) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRituals = ritualsData.count || 0;

    // Build progress stats
    const totalPoints = totalReadings * 10 + totalRituals * 15;
    const { level, expToNext } = calculateLevel(totalPoints);

    const progressStats: ProgressStats = {
      level,
      experience: totalPoints,
      experienceToNextLevel: expToNext,
      totalPoints,
    };

    // Build achievements
    const userAchievementMap = new Map(
      (userAchievements.data || []).map(a => [a.achievement_id, a])
    );

    const enrichedAchievements: Achievement[] = ACHIEVEMENTS.map(a => {
      const userAch = userAchievementMap.get(a.id);
      return enrichAchievement(
        a,
        userAch?.progress || 0,
        userAch?.unlocked_at || null
      );
    });

    // Build reading progress
    const readingProgress: ReadingProgress = {
      total: totalReadings,
      byType: readingsByType,
      thisWeek: 0, // Would need date filtering
      thisMonth: 0, // Would need date filtering
    };

    // Build ritual progress
    const ritualProgress: RitualProgress = {
      totalCompletions: totalRituals,
      currentStreak: 0, // Would need date calculation
      longestStreak: 0,
      completionRate: 0,
      favoriteRitual: null,
    };

    // Build meditation progress
    const meditationProgress: MeditationProgress = {
      totalSessions: 0, // Would need meditation tracking
      totalMinutes: 0,
      averageSessionLength: 0,
      currentMeditationStreak: 0,
      longestMeditationStreak: 0,
    };

    // Build credits progress
    const creditsProgress: CreditsProgress = {
      totalEarned: 0,
      totalSpent: 0,
      currentBalance: 0,
      mostExpensiveFeature: null,
    };

    // Response
    const response: Record<string, unknown> = {
      success: true,
      userId: user.id,
      lastActive: new Date().toISOString(),
    };

    if (includeStats !== false) {
      response.stats = progressStats;
      response.readings = readingProgress;
      response.rituals = ritualProgress;
      response.meditation = meditationProgress;
      response.credits = creditsProgress;
    }

    if (includeAchievements) {
      response.achievements = enrichedAchievements;
      response.achievementStats = {
        total: enrichedAchievements.length,
        unlocked: enrichedAchievements.filter(a => a.unlockedAt !== null).length,
        byRarity: {
          common: enrichedAchievements.filter(a => a.rarity === 'common').length,
          uncommon: enrichedAchievements.filter(a => a.rarity === 'uncommon').length,
          rare: enrichedAchievements.filter(a => a.rarity === 'rare').length,
          epic: enrichedAchievements.filter(a => a.rarity === 'epic').length,
          legendary: enrichedAchievements.filter(a => a.rarity === 'legendary').length,
        },
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    const err = error as Error;
    console.error('Erro ao buscar progresso:', err);
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}