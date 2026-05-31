// ============================================================
// SPIRITUAL STATS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ReadingTypeSchema = z.enum([
  'tarot',
  'numerologia',
  'astrologia',
  'ifá',
  'lenormand',
  'orixá',
  'cabala',
]);
const FeatureSchema = z.enum([
  'mapa-alma',
  'mapa-caminho',
  'ritual',
  'meditacao',
  'afirmacoes',
  'divinacao',
  'numerologia',
  'tarot',
  'orixá',
  'correlacao',
]);
const StatsQuerySchema = z.object({
  userId: z.string().optional(),
  type: ReadingTypeSchema.optional(),
  period: z.enum(['day', 'week', 'month', 'year', 'all']).optional().default('month'),
});
const ActivityBodySchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  feature: FeatureSchema,
  metadata: z.record(z.any()).optional(),
});
interface ReadingStats {
  total: number;
  byType: Record<string, number>;
}
interface RitualStats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  recentCompletions: Array<{
    id: string;
    completedAt: string;
  }>;
}
function recordFeature(activity: ActivityRecord, feature: string) {
  activity.lastActive = new Date().toISOString();
  const count = activity.features.get(feature) || 0;
  activity.features.set(feature, count + 1);
}
function getFavoriteFeature(features: Map<string, number>): string | null {
  if (features.size === 0) return null;
  let maxCount = 0;
  let favorite = '';
  features.forEach((count, feature) => {
    if (count > maxCount) {
      maxCount = count;
      favorite = feature;
    }
  });
  return favorite || null;
}

export async function GET(request: NextRequest) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    );
  }

  try {
    // Fetch reading stats from Supabase
    const { data: readingsData, error: readingsError } = await supabase
      .from('leituras_historico')
      .select('tipo')
      .eq('user_id', user.id);

    if (readingsError) {
      console.error('Error fetching readings:', readingsError);
    }

    const readingsByType: Record<string, number> = {};
    let totalReadings = 0;
    
    if (readingsData) {
      readingsData.forEach((reading: { tipo: string }) => {
        const tipo = reading.tipo || 'unknown';
        readingsByType[tipo] = (readingsByType[tipo] || 0) + 1;
        totalReadings++;
      });
    }

    // Fetch ritual stats
    const { data: ritualData, error: ritualError } = await supabase
      .from('ritual_completions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (ritualError) {
      console.error('Error fetching rituals:', ritualError);
    }

    const ritualStats: RitualStats = {
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      recentCompletions: []
    };

    if (ritualData && ritualData.length > 0) {
      ritualStats.totalCompletions = ritualData.length;
      
      // Calculate streaks from ritual completions
      const completionDates = ritualData
        .map((r: { completed_at: string }) => new Date(r.completed_at))
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());
      
      const uniqueDays = [...new Set(
        completionDates.map((d: Date) => d.toISOString().split('T')[0])
      )].map(d => new Date(d));

      // Current streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;

      if (uniqueDays.length > 0) {
        const lastDay = uniqueDays[uniqueDays.length - 1];
        const lastDayNormalized = new Date(lastDay);
        lastDayNormalized.setHours(0, 0, 0, 0);

        const isActiveToday = lastDayNormalized.getTime() === today.getTime();
        const isActiveYesterday = lastDayNormalized.getTime() === yesterday.getTime();

        if (isActiveToday || isActiveYesterday) {
          for (let i = uniqueDays.length - 2; i >= 0; i--) {
            const diff = (uniqueDays[i + 1].getTime() - uniqueDays[i].getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
          currentStreak++;
        }

        // Longest streak
        for (let i = 1; i < uniqueDays.length; i++) {
          const diff = (uniqueDays[i].getTime() - uniqueDays[i - 1].getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      ritualStats.currentStreak = currentStreak;
      ritualStats.longestStreak = longestStreak;
      ritualStats.completionRate = Math.min(100, (currentStreak / 7) * 100);

      ritualStats.recentCompletions = ritualData.slice(0, 10).map((r: { ritual_id: string; completed_at: string; duration: number }) => ({
        ritualId: r.ritual_id,
        date: r.completed_at,
        duration: r.duration || 0
      }));
    }

    // Get activity stats
    const activity = getUserActivity(user.id);
    const activityStats: ActivityStats = {
      totalSessions: activity?.sessions || 0,
      lastActive: activity?.lastActive || null,
      favoriteFeature: activity ? getFavoriteFeature(activity.features) : null
    };

    // Build response
    const stats: SpiritualStats = {
      readings: {
        total: totalReadings,
        byType: readingsByType
      },
      rituals: ritualStats,
      streak: {
        current: ritualStats.currentStreak,
        longest: ritualStats.longestStreak
      },
      activity: activityStats,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error generating spiritual stats:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar estatísticas espirituais' },
      { status: 500 }
    );
  }
}

// Track activity for a feature
export async function POST(request: NextRequest) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { feature } = body;

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature é obrigatória' },
        { status: 400 }
      );
    }

    recordActivity(user.id, feature);

    return NextResponse.json({
      success: true,
      message: 'Atividade registrada'
    });

  } catch (error) {
    console.error('Error recording activity:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar atividade' },
      { status: 500 }
    );
  }
}