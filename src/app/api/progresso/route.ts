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
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────
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
  sefirot: z.array(SefirotSchema).optional(),
  chakra: z.number().int().min(1).max(7).optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
  affirmation: z.string().optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(SefirotSchema),
    chakra: z.number().int().min(1).max(7),
    element: ElementSchema,
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const ProgressQuerySchema = z.object({
  userId: z.string().optional(),
  achievements: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  stats: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
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

// fallow-ignore-next-line unused-type
export type Achievement = z.infer<typeof AchievementSchema>;
// fallow-ignore-next-line unused-type
export type ProgressStats = z.infer<typeof ProgressStatsSchema>;
// fallow-ignore-next-line unused-type
export type ReadingProgress = z.infer<typeof ReadingProgressSchema>;
// fallow-ignore-next-line unused-type
export type RitualProgress = z.infer<typeof RitualProgressSchema>;
// fallow-ignore-next-line unused-type
export type MeditationProgress = z.infer<typeof MeditationProgressSchema>;
// fallow-ignore-end unused-type
export const dynamic = 'force-dynamic';

// ─── Achievement Spiritual Correlations ──────────────────────────────────────────
const ACHIEVEMENT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  first_reading: {
    sefirot: ['Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Meu primeiro passo na jornada espiritual',
    frequency: '963 Hz',
  },
  reader_10: {
    sefirot: ['Chokhmah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria se acumula em mim',
    frequency: '741 Hz',
  },
  reader_50: {
    sefirot: ['Binah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A profundidade da compreensão cresce',
    frequency: '639 Hz',
  },
  reader_100: {
    sefirot: ['Tipheret'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Mestre da sabedoria arcana',
    frequency: '528 Hz',
  },
  reader_500: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Iluminação total alcançada',
    frequency: '963 Hz',
  },
  all_types: {
    sefirot: ['Chokhmah', 'Binah', 'Tipheret'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Polímata espiritual completo',
    frequency: '741 Hz',
  },
  ritual_1: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'Canal de luz sagrada',
    frequency: '528 Hz',
  },
  ritual_streak_7: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Disciplina fortalece minha prática',
    frequency: '528 Hz',
  },
  ritual_streak_30: {
    sefirot: ['Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Iansã',
    affirmation: 'Devoção ardente me transforma',
    frequency: '528 Hz',
  },
  ritual_streak_100: {
    sefirot: ['Gevurah', 'Netzach', 'Tipheret'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Mestre devocional iluminado',
    frequency: '639 Hz',
  },
  ritual_master: {
    sefirot: ['Chesed', 'Gevurah', 'Tipheret'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Mestre dos rituais sagrados',
    frequency: '528 Hz',
  },
  meditation_first: {
    sefirot: ['Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Calma interior alcançada',
    frequency: '963 Hz',
  },
  meditation_hour: {
    sefirot: ['Chokhmah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'Uma hora de paz infinita',
    frequency: '741 Hz',
  },
  meditation_master: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Mestre da mente e do silêncio',
    frequency: '963 Hz',
  },
  first_purchase: {
    sefirot: ['Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Oxum',
    affirmation: 'Investimento na minha evolução',
    frequency: '396 Hz',
  },
  vip_member: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Membro honored da comunidade',
    frequency: '528 Hz',
  },
  orixa_explorer: {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Explorador dos Orixás sagrado',
    frequency: '528 Hz',
  },
  numerology_explorer: {
    sefirot: ['Chokhmah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Mestre dos números celestiais',
    frequency: '741 Hz',
  },
  tarot_explorer: {
    sefirot: ['Binah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'Leitor de tarô habilidoso',
    frequency: '639 Hz',
  },
  astrology_explorer: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Astrologista das estrelas',
    frequency: '528 Hz',
  },
  sacred_geometry_explorer: {
    sefirot: ['Kether', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Geômetra do cosmos sagrado',
    frequency: '963 Hz',
  },
};

// ─── Achievement Definitions with Spiritual Correlations ──────────────────────────────────────────
interface AchievementBase {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  category: z.infer<typeof CategorySchema>;
  rarity: z.infer<typeof RaritySchema>;
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const ACHIEVEMENTS: AchievementBase[] = [
  // Readings achievements
  { id: 'first_reading', name: 'Primeiros Passos', description: 'Complete sua primeira consulta', icon: '✨', target: 1, category: 'readings', rarity: 'common', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['first_reading'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['first_reading'] },
  { id: 'reader_10', name: 'Iniciante', description: 'Complete 10 consultas', icon: '📜', target: 10, category: 'readings', rarity: 'common', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['reader_10'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['reader_10'] },
  { id: 'reader_50', name: 'Explorador', description: 'Complete 50 consultas', icon: '🔮', target: 50, category: 'readings', rarity: 'uncommon', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['reader_50'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['reader_50'] },
  { id: 'reader_100', name: 'Seekers Ancião', description: 'Complete 100 consultas', icon: '👁️', target: 100, category: 'readings', rarity: 'rare', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['reader_100'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['reader_100'] },
  { id: 'reader_500', name: 'Mestre das Artes Arcanas', description: 'Complete 500 consultas', icon: '🌟', target: 500, category: 'readings', rarity: 'epic', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['reader_500'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['reader_500'] },
  { id: 'all_types', name: 'Polímata Espiritual', description: 'Experimente todos os tipos de consulta', icon: '🎭', target: 8, category: 'readings', rarity: 'rare', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['all_types'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['all_types'] },
  
  // Ritual achievements
  { id: 'ritual_1', name: 'Praticante', description: 'Complete seu primeiro ritual', icon: '🕯️', target: 1, category: 'rituals', rarity: 'common', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_1'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_1'] },
  { id: 'ritual_streak_7', name: 'Dedicado', description: 'Mantenha uma sequência de 7 dias', icon: '🔥', target: 7, category: 'streaks', rarity: 'uncommon', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_streak_7'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_streak_7'] },
  { id: 'ritual_streak_30', name: 'Devoto', description: 'Mantenha uma sequência de 30 dias', icon: '⚡', target: 30, category: 'streaks', rarity: 'rare', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_streak_30'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_streak_30'] },
  { id: 'ritual_streak_100', name: 'Mestre Devocional', description: 'Mantenha uma sequência de 100 dias', icon: '💫', target: 100, category: 'streaks', rarity: 'epic', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_streak_100'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_streak_100'] },
  { id: 'ritual_master', name: 'Mestre dos Rituais', description: 'Complete 100 rituais', icon: '🏆', target: 100, category: 'rituals', rarity: 'epic', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_master'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['ritual_master'] },
  
  // Meditation achievements
  { id: 'meditation_first', name: 'Calma Interior', description: 'Complete sua primeira meditação', icon: '🧘', target: 1, category: 'meditation', rarity: 'common', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['meditation_first'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['meditation_first'] },
  { id: 'meditation_hour', name: 'Meditador Horário', description: 'Medite por um total de 1 hora', icon: '⏰', target: 60, category: 'meditation', rarity: 'uncommon', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['meditation_hour'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['meditation_hour'] },
  { id: 'meditation_master', name: 'Mestre da Mente', description: 'Medite por um total de 100 horas', icon: '🧠', target: 6000, category: 'meditation', rarity: 'legendary', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['meditation_master'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['meditation_master'] },
  
  // Credit achievements
  { id: 'first_purchase', name: 'Investidor Espiritual', description: 'Faça sua primeira compra', icon: '💰', target: 1, category: 'credits', rarity: 'common', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['first_purchase'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['first_purchase'] },
  { id: 'vip_member', name: 'Membro VIP', description: 'Adquira créditos pela primeira vez', icon: '👑', target: 1, category: 'credits', rarity: 'uncommon', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['vip_member'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['vip_member'] },
  
  // Exploration achievements
  { id: 'orixa_explorer', name: 'Explorador dos Orixás', description: 'Descubra 5 Orixás diferentes', icon: '🌊', target: 5, category: 'exploration', rarity: 'uncommon', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['orixa_explorer'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['orixa_explorer'] },
  { id: 'numerology_explorer', name: 'Mestre dos Números', description: 'Calcule 10 mapas numerológicos', icon: '🔢', target: 10, category: 'exploration', rarity: 'uncommon', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['numerology_explorer'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['numerology_explorer'] },
  { id: 'tarot_explorer', name: 'Leitor de Tarô', description: 'Faça 20 leituras de tarô', icon: '🃏', target: 20, category: 'exploration', rarity: 'rare', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['tarot_explorer'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['tarot_explorer'] },
  { id: 'astrology_explorer', name: 'Astrologista', description: 'Calcule 10 mapas astrológicos', icon: '⭐', target: 10, category: 'exploration', rarity: 'rare', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['astrology_explorer'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['astrology_explorer'] },
  { id: 'sacred_geometry_explorer', name: 'Geômetra Sagrado', description: 'Explore todas as formas geométricas', icon: '🔷', target: 10, category: 'exploration', rarity: 'epic', ...ACHIEVEMENT_SPIRITUAL_CORRELATIONS['sacred_geometry_explorer'], spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS['sacred_geometry_explorer'] },
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
  base: AchievementBase,
  currentProgress: number,
  unlockedAt: string | null
): Achievement {
  return {
    id: base.id,
    name: base.name,
    description: base.description,
    icon: base.icon,
    progress: currentProgress,
    target: base.target,
    category: base.category,
    rarity: base.rarity,
    unlockedAt,
    sefirot: base.spiritualCorrelations.sefirot,
    chakra: base.spiritualCorrelations.chakra,
    element: base.spiritualCorrelations.element,
    orixa: base.spiritualCorrelations.orixa,
    affirmation: base.spiritualCorrelations.affirmation,
    spiritualCorrelations: base.spiritualCorrelations,
  } as Achievement;
}

function calculateSpiritualStats(achievements: Achievement[]) {
  return {
    bySefirot: achievements.reduce((acc, a) => {
      if (a.spiritualCorrelations) {
        a.spiritualCorrelations.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>),
    byChakra: achievements.reduce((acc, a) => {
      if (a.spiritualCorrelations?.chakra) {
        const c = a.spiritualCorrelations.chakra;
        acc[c] = (acc[c] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    byElement: achievements.reduce((acc, a) => {
      if (a.spiritualCorrelations?.element) {
        const e = a.spiritualCorrelations.element;
        acc[e] = (acc[e] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    byOrixa: achievements.reduce((acc, a) => {
      if (a.spiritualCorrelations?.orixa) {
        const o = a.spiritualCorrelations.orixa;
        acc[o] = (acc[o] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    byRarity: achievements.reduce((acc, a) => {
      acc[a.rarity] = (acc[a.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCategory: achievements.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
// fallow-ignore-next-line complexity
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
      achievements: searchParams.get('achievements'),
      stats: searchParams.get('stats'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { achievements: includeAchievements, stats: includeStats, sefirot, chakra, element, orixa } = parseResult.data;

    // Get user progress from database
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('Error fetching progress:', progressError);
    }

    const experience = progressData?.experience || 0;
    const { level, expToNext } = calculateLevel(experience);

    const stats: ProgressStats = {
      level,
      experience,
      experienceToNextLevel: expToNext,
      totalPoints: progressData?.total_points || 0,
    };

    // Get achievement progress
    const { data: achievementData } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id);

    const achievementProgress = new Map<string, { progress: number; unlockedAt: string | null }>();
    if (achievementData) {
      achievementData.forEach((a: { achievement_id: string; progress: number; unlocked_at: string | null }) => {
        achievementProgress.set(a.achievement_id, {
          progress: a.progress,
          unlockedAt: a.unlocked_at,
        });
      });
    }

    let enrichedAchievements = ACHIEVEMENTS.map(a => {
      const progress = achievementProgress.get(a.id);
      return enrichAchievement(a, progress?.progress || 0, progress?.unlockedAt || null);
    });

    // Apply spiritual filters
    if (sefirot) {
      enrichedAchievements = enrichedAchievements.filter(a => 
        a.spiritualCorrelations?.sefirot.includes(sefirot)
      );
    }
    if (chakra) {
      enrichedAchievements = enrichedAchievements.filter(a => 
        a.spiritualCorrelations?.chakra === chakra
      );
    }
    if (element) {
      enrichedAchievements = enrichedAchievements.filter(a => 
        a.spiritualCorrelations?.element === element
      );
    }
    if (orixa) {
      enrichedAchievements = enrichedAchievements.filter(a => 
        a.spiritualCorrelations?.orixa === orixa
      );
    }

    // Calculate spiritual stats
    const spiritualStats = calculateSpiritualStats(enrichedAchievements);

    const response: Record<string, unknown> = {
      success: true,
      userId: user.id,
      spiritualCorrelations: ACHIEVEMENT_SPIRITUAL_CORRELATIONS,
    };

    if (includeStats !== false) {
      response.stats = stats;
      response.readings = {
        total: progressData?.readings_count || 0,
        byType: progressData?.readings_by_type || {},
        thisWeek: progressData?.readings_this_week || 0,
        thisMonth: progressData?.readings_this_month || 0,
      } as ReadingProgress;
      response.rituals = {
        totalCompletions: progressData?.rituals_count || 0,
        currentStreak: progressData?.rituals_streak || 0,
        longestStreak: progressData?.rituals_longest_streak || 0,
        completionRate: progressData?.rituals_completion_rate || 0,
        favoriteRitual: progressData?.favorite_ritual || null,
      } as RitualProgress;
      response.meditation = {
        totalSessions: progressData?.meditation_sessions || 0,
        totalMinutes: progressData?.meditation_minutes || 0,
        averageSessionLength: progressData?.meditation_sessions 
          ? Math.round(progressData.meditation_minutes / progressData.meditation_sessions)
          : 0,
        currentMeditationStreak: progressData?.meditation_streak || 0,
        longestMeditationStreak: progressData?.meditation_longest_streak || 0,
      } as MeditationProgress;
      response.credits = {
        totalEarned: progressData?.credits_earned || 0,
        totalSpent: progressData?.credits_spent || 0,
        currentBalance: progressData?.credits_balance || 0,
        mostExpensiveFeature: progressData?.most_expensive_feature || null,
      } as CreditsProgress;
    }

    if (includeAchievements !== false) {
      response.achievements = enrichedAchievements;
      response.unlockedCount = enrichedAchievements.filter(a => a.unlockedAt !== null).length;
      response.totalCount = enrichedAchievements.length;
    }

    response.spiritualStats = spiritualStats;
    response.meta = {
      filters: { sefirot, chakra, element, orixa },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao buscar progresso',
    }, { status: 500 });
  }
}