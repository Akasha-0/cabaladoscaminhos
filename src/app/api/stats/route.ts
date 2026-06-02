import { handleAPIError } from '@/lib/api/error-handler';
// ============================================================
// SPIRITUAL STATS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const ReadingTypeSchema = z.enum([
  'tarot', 'numerologia', 'astrologia', 'ifá',
  'lenormand', 'orixá', 'cabala'
]);
const FeatureSchema = z.enum([
  'mapa-alma', 'mapa-caminho', 'ritual', 'meditacao',
  'afirmacoes', 'divinacao', 'numerologia', 'tarot',
  'orixá', 'correlacao', 'sacred-geometry', 'chakras', 'breathwork'
]);
const StatsQuerySchema = z.object({
  userId: z.string().optional(),
  type: ReadingTypeSchema.optional(),
  period: z.enum(['day', 'week', 'month', 'year', 'all']).optional().default('month'),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});
const ActivityBodySchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  feature: FeatureSchema,
  metadata: z.record(z.any()).optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()).optional(),
    chakra: z.number().optional(),
    element: z.string().optional(),
    orixa: z.string().optional(),
  }).optional(),
});

// ─── Feature Spiritual Correlations ──────────────────────────────────────────
const FEATURE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  'mapa-alma': { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: ' Meu mapa de alma revela minha verdade' },
  'mapa-caminho': { sefirot: ['Tipheret', 'Malkuth'], chakra: 5, element: 'Terra', orixa: 'Oxóssi', affirmation: 'O caminho se revela com clareza' },
  'ritual': { sefirot: ['Chesed', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'O ritual transforma minha energia' },
  'meditacao': { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: 'A meditação ancora minha mente' },
  'afirmacoes': { sefirot: ['Netzach', 'Hod'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Minhas afirmações criam minha realidade' },
  'divinacao': { sefirot: ['Chokhmah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Orunmilá', affirmation: 'A divinção revela verdades ocultas' },
  'numerologia': { sefirot: ['Binah', 'Chokhmah'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Os números guiam meu destino' },
  'tarot': { sefirot: ['Chokhmah', 'Hod'], chakra: 6, element: 'Água', orixa: 'Orunmilá', affirmation: 'As cartas iluminam meu caminho' },
  'orixá': { sefirot: ['Tipheret', 'Gevurah'], chakra: 4, element: 'Fogo', orixa: 'Ogum', affirmation: 'Honro os Orixás em minha jornada' },
  'correlacao': { sefirot: ['Kether', 'Malkuth'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A correlação revela unitividade' },
  'sacred-geometry': { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A geometria sagrada molda minha consciência' },
  'chakras': { sefirot: ['Kether', 'Malkuth'], chakra: 1, element: 'Fogo', orixa: 'Kundalini', affirmation: 'Meus chakras fluem em harmonia' },
  'breathwork': { sefirot: ['Tipheret', 'Binah'], chakra: 4, element: 'Ar', orixa: 'Oxalá', affirmation: 'A respiração conecta mente e espírito' },
};

// ─── Reading Type Spiritual Correlations ──────────────────────────────────────────
const READING_TYPE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
}> = {
  tarot: { sefirot: ['Chokhmah', 'Hod'], chakra: 6, element: 'Água', orixa: 'Orunmilá' },
  numerologia: { sefirot: ['Binah', 'Chokhmah'], chakra: 5, element: 'Ar', orixa: 'Orunmilá' },
  astrologia: { sefirot: ['Chokhmah', 'Tipheret'], chakra: 6, element: 'Ar', orixa: 'Oxum' },
  'ifá': { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá' },
  lenormand: { sefirot: ['Hod', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá' },
  'orixá': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Ogum' },
  cabala: { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá' },
};

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────
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

interface ActivityRecord {
  userId: string;
  lastActive: string;
  features: Map<string, number>;
  spiritualPath: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    dominantFeature: string;
  };
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

function getDominantSpiritualPath(features: Map<string, number>) {
  let maxCount = 0;
  let dominant = '';
  features.forEach((count, feature) => {
    if (count > maxCount) {
      maxCount = count;
      dominant = feature;
    }
  });
  
  const corr = FEATURE_SPIRITUAL_CORRELATIONS[dominant] || FEATURE_SPIRITUAL_CORRELATIONS['ritual'];
  return {
    sefirot: corr.sefirot,
    chakra: corr.chakra,
    element: corr.element,
    orixa: corr.orixa,
    dominantFeature: dominant,
  };
}

// In-memory activity store
const activityStore = new Map<string, ActivityRecord>();
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = StatsQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      type: searchParams.get('type'),
      period: searchParams.get('period'),
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

    const { userId, type, period, sefirot, chakra, element, orixa } = parseResult.data;

    // Get stats for authenticated user
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let user = null;
    if (!userId) {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    if (!user && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não autenticado',
      }, { status: 401 });
    }

    const effectiveUserId = (userId || user?.id) ?? '';

    // Get or create activity record
    let activity = activityStore.get(effectiveUserId);
    if (!activity) {
      activity = {
        userId: effectiveUserId,
        lastActive: new Date().toISOString(),
        features: new Map(),
        spiritualPath: { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', dominantFeature: 'ritual' },
      };
      activityStore.set(effectiveUserId, activity);
    }

    // Filter by spiritual correlations
    let filteredFeatures = Array.from(activity.features.entries());
    
    if (sefirot) {
      filteredFeatures = filteredFeatures.filter(([feature]) => {
        const corr = FEATURE_SPIRITUAL_CORRELATIONS[feature];
        return corr?.sefirot.includes(sefirot);
      });
    }
    if (chakra) {
      filteredFeatures = filteredFeatures.filter(([feature]) => {
        const corr = FEATURE_SPIRITUAL_CORRELATIONS[feature];
        return corr?.chakra === chakra;
      });
    }
    if (element) {
      filteredFeatures = filteredFeatures.filter(([feature]) => {
        const corr = FEATURE_SPIRITUAL_CORRELATIONS[feature];
        return corr?.element === element;
      });
    }
    if (orixa) {
      filteredFeatures = filteredFeatures.filter(([feature]) => {
        const corr = FEATURE_SPIRITUAL_CORRELATIONS[feature];
        return corr?.orixa === orixa;
      });
    }

    const totalActivities = filteredFeatures.reduce((sum, [, count]) => sum + count, 0);

    // Build stats by feature
    const statsByFeature: Record<string, number> = {};
    filteredFeatures.forEach(([feature, count]) => {
      statsByFeature[feature] = count;
    });

    // Spiritual correlations for all types
    const spiritualCorrelations = Object.entries(READING_TYPE_SPIRITUAL_CORRELATIONS).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, { sefirot: string[]; chakra: number; element: string; orixa: string }>);

    // Feature spiritual correlations
    const featureCorrelations = Object.entries(FEATURE_SPIRITUAL_CORRELATIONS).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, { sefirot: string[]; chakra: number; element: string; orixa: string; affirmation: string }>);

    // Statistics
    const stats = {
      totalActivities,
      byFeature: statsByFeature,
      favoriteFeature: getFavoriteFeature(activity.features),
      dominantSpiritualPath: getDominantSpiritualPath(activity.features),
      period,
      lastActive: activity.lastActive,
    };

    return NextResponse.json({
      success: true,
      stats,
      spiritualCorrelations: {
        byType: spiritualCorrelations,
        byFeature: featureCorrelations,
      },
      meta: {
        userId: effectiveUserId,
        filters: { sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

// POST - Record new activity
// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = ActivityBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { userId, feature, metadata, spiritualCorrelations } = parseResult.data;

    let activity = activityStore.get(userId);
    if (!activity) {
      activity = {
        userId,
        lastActive: new Date().toISOString(),
        features: new Map(),
        spiritualPath: { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', dominantFeature: 'ritual' },
      };
      activityStore.set(userId, activity);
    }

    recordFeature(activity, feature);

    // Update spiritual path if provided
    if (spiritualCorrelations) {
      activity.spiritualPath = {
        sefirot: spiritualCorrelations.sefirot || activity.spiritualPath.sefirot,
        chakra: spiritualCorrelations.chakra || activity.spiritualPath.chakra,
        element: spiritualCorrelations.element || activity.spiritualPath.element,
        orixa: spiritualCorrelations.orixa || activity.spiritualPath.orixa,
        dominantFeature: feature,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Atividade registrada',
      spiritualCorrelations: FEATURE_SPIRITUAL_CORRELATIONS[feature] || null,
      feature,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao registrar atividade',
    }, { status: 500 });
  }
}