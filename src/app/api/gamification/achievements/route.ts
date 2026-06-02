import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const AchievementCategorySchema = z.enum(['prática', 'conhecimento', 'streak', 'ritual', 'meditation']);
const AchievementRaritySchema = z.enum(['common', 'uncommon', 'rare', 'legendary', 'mythic']);

const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: AchievementCategorySchema,
  rarity: AchievementRaritySchema,
  target: z.number().int().positive(),
  progress: z.number().int().min(0).optional(),
  unlockedAt: z.string().nullable(),
  // Spiritual correlations
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
  chakra: z.array(z.number()).optional(),
  tradicao: z.string().optional(),
  numeroSagrado: z.number().optional(),
});

const AchievementsResponseSchema = z.object({
  achievements: z.array(AchievementSchema),
  unlockedCount: z.number().int().min(0),
  totalCount: z.number().int().min(0),
  completionPercentage: z.number().min(0).max(100),
});

const AchievementsQuerySchema = z.object({
  category: AchievementCategorySchema.optional(),
  rarity: AchievementRaritySchema.optional(),
  userId: z.string().optional(),
  orixa: z.string().optional(),
  sefirot: z.string().optional(),
});

// fallow-ignore-next-line unused-type
export type AchievementCategory = z.infer<typeof AchievementCategorySchema>;
// fallow-ignore-next-line unused-type
export type AchievementRarity = z.infer<typeof AchievementRaritySchema>;
// fallow-ignore-end unused-type

// fallow-ignore-next-line unused-type
export interface AchievementsResponse {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
}

// ─── Achievement Definitions with Spiritual Correlations ──────────────────────────────────────────────
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
    sefirot: ['Tipheret'],
    tradicao: 'Consulta Espiritual',
    numeroSagrado: 1,
  },
  {
    id: 'ten-consultations',
    name: 'Iniciante',
    description: 'Complete 10 consultas',
    icon: '📜',
    category: 'prática',
    rarity: 'common',
    target: 10,
    sefirot: ['Chesed'],
    tradicao: 'Consulta Espiritual',
    numeroSagrado: 10,
  },
  {
    id: 'fifty-consultations',
    name: 'Explorador',
    description: 'Complete 50 consultas',
    icon: '🔮',
    category: 'prática',
    rarity: 'uncommon',
    target: 50,
    sefirot: ['Netzach'],
    tradicao: 'Consulta Espiritual',
    numeroSagrado: 50,
  },
  {
    id: 'hundred-consultations',
    name: 'Mestre',
    description: 'Complete 100 consultas',
    icon: '👑',
    category: 'prática',
    rarity: 'rare',
    target: 100,
    sefirot: ['Kether'],
    tradicao: 'Consulta Espiritual',
    numeroSagrado: 100,
  },

  // Conhecimento achievements
  {
    id: 'first-meditation',
    name: 'Calma Interior',
    description: 'Complete sua primeira meditação',
    icon: '🧘',
    category: 'meditation',
    rarity: 'common',
    target: 1,
    sefirot: ['Kether', 'Tipheret'],
    chakra: [7, 6],
    tradicao: 'Meditação',
    numeroSagrado: 1,
  },
  {
    id: 'ten-meditations',
    name: 'Praticante',
    description: 'Complete 10 meditações',
    icon: '🕉️',
    category: 'meditation',
    rarity: 'common',
    target: 10,
    sefirot: ['Chokhmah'],
    chakra: [6],
    tradicao: 'Meditação',
    numeroSagrado: 10,
  },
  {
    id: 'fifty-meditations',
    name: 'Meditador',
    description: 'Complete 50 meditações',
    icon: '🌟',
    category: 'meditation',
    rarity: 'uncommon',
    target: 50,
    sefirot: ['Binah'],
    chakra: [7],
    tradicao: 'Meditação',
    numeroSagrado: 50,
  },
  {
    id: 'hundred-meditations',
    name: 'Mestre da Mente',
    description: 'Complete 100 meditações',
    icon: '🧠',
    category: 'meditation',
    rarity: 'rare',
    target: 100,
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: [6, 7],
    tradicao: 'Meditação Avançada',
    numeroSagrado: 100,
  },
  {
    id: 'hour-of-meditation',
    name: 'Hora da Paz',
    description: 'Medite por um total de 1 hora',
    icon: '⏰',
    category: 'meditation',
    rarity: 'uncommon',
    target: 60,
    sefirot: ['Tipheret'],
    chakra: [4],
    tradicao: 'Meditação',
    numeroSagrado: 11,
  },
  {
    id: 'ten-hours-meditation',
    name: 'Dedicação',
    description: 'Medite por um total de 10 horas',
    icon: '💫',
    category: 'meditation',
    rarity: 'rare',
    target: 600,
    sefirot: ['Netzach', 'Hod'],
    chakra: [5, 6],
    tradicao: 'Meditação Profunda',
    numeroSagrado: 22,
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
    sefirot: ['Gevurah'],
    chakra: [3],
    tradicao: 'Disciplina',
    numeroSagrado: 3,
  },
  {
    id: 'streak-7',
    name: 'Dedicado',
    description: 'Mantenha uma sequência de 7 dias',
    icon: '🔥',
    category: 'streak',
    rarity: 'uncommon',
    target: 7,
    sefirot: ['Gevurah', 'Chesed'],
    chakra: [3, 4],
    tradicao: 'Disciplina',
    numeroSagrado: 7,
  },
  {
    id: 'streak-14',
    name: 'Comprometido',
    description: 'Mantenha uma sequência de 14 dias',
    icon: '⚡',
    category: 'streak',
    rarity: 'rare',
    target: 14,
    sefirot: ['Tipheret'],
    chakra: [4, 6],
    tradicao: 'Devoção',
    numeroSagrado: 14,
  },
  {
    id: 'streak-30',
    name: 'Devoto',
    description: 'Mantenha uma sequência de 30 dias',
    icon: '💎',
    category: 'streak',
    rarity: 'legendary',
    target: 30,
    sefirot: ['Chokhmah', 'Binah'],
    chakra: [6, 7],
    tradicao: 'Devoção',
    numeroSagrado: 30,
  },
  {
    id: 'streak-100',
    name: 'Lenda',
    description: 'Mantenha uma sequência de 100 dias',
    icon: '👑',
    category: 'streak',
    rarity: 'mythic',
    target: 100,
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret'],
    chakra: [1, 2, 3, 4, 5, 6, 7],
    tradicao: 'Mestria Espiritual',
    numeroSagrado: 100,
  },

  // Ritual achievements
  {
    id: 'first-ritual',
    name: 'Iniciante Ritual',
    description: 'Complete seu primeiro ritual',
    icon: '🕯️',
    category: 'ritual',
    rarity: 'common',
    target: 1,
    sefirot: ['Malkuth'],
    orixa: 'Oxalá',
    chakra: [1],
    tradicao: 'Ritual',
    numeroSagrado: 1,
  },
  {
    id: 'ten-rituals',
    name: 'Praticante de Ritual',
    description: 'Complete 10 rituais',
    icon: '⚜️',
    category: 'ritual',
    rarity: 'uncommon',
    target: 10,
    sefirot: ['Yesod'],
    orixa: 'Ogum',
    chakra: [1, 2],
    tradicao: 'Ritual',
    numeroSagrado: 10,
  },
  {
    id: 'ritual-oxum',
    name: 'Devoto de Oxum',
    description: 'Complete rituais de Oxum',
    icon: '💧',
    category: 'ritual',
    rarity: 'rare',
    target: 5,
    sefirot: ['Netzach', 'Tipheret'],
    orixa: 'Oxum',
    chakra: [2, 4],
    tradicao: 'Candomblé',
    numeroSagrado: 11,
  },
  {
    id: 'ritual-ogum',
    name: 'Guerreiro de Ogum',
    description: 'Complete rituais de Ogum',
    icon: '⚔️',
    category: 'ritual',
    rarity: 'rare',
    target: 5,
    sefirot: ['Gevurah'],
    orixa: 'Ogum',
    chakra: [1, 3],
    tradicao: 'Candomblé',
    numeroSagrado: 7,
  },
  {
    id: 'ritual-oxala',
    name: 'Filho de Oxalá',
    description: 'Complete rituais de Oxalá',
    icon: '☀️',
    category: 'ritual',
    rarity: 'legendary',
    target: 10,
    sefirot: ['Kether', 'Chokhmah'],
    orixa: 'Oxalá',
    chakra: [6, 7],
    tradicao: 'Candomblé',
    numeroSagrado: 33,
  },
];

// ─── Storage Helpers ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'gamification_achievements';

interface AchievementStore {
  unlocked: Record<string, string>;
  progress: Record<string, number>;
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

// ─── Helper Functions ──────────────────────────────────────────────────────────────
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

// ─── API Route ─────────────────────────────────────────────────────────────
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = AchievementsQuerySchema.safeParse({
      category: searchParams.get('category'),
      rarity: searchParams.get('rarity'),
      userId: searchParams.get('userId'),
      orixa: searchParams.get('orixa'),
      sefirot: searchParams.get('sefirot'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { category, rarity, orixa, sefirot } = parseResult.data;
    const achievementId = searchParams.get('id');
    const stats = searchParams.get('stats');
    const recent = searchParams.get('recent');

    const store = getStore();

    // Get single achievement by ID
    if (achievementId) {
      const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!def) {
        return NextResponse.json({
          success: false,
          error: 'Achievement not found',
          achievementId,
        }, { status: 404 });
      }
      const achievement = buildAchievementWithProgress(def, store);
      return NextResponse.json({ success: true, achievement });
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
      return NextResponse.json({ success: true, achievements: recentUnlocked });
    }

    // Filter achievements
    let filteredDefinitions = ACHIEVEMENTS;
    
    if (category && ['prática', 'conhecimento', 'streak', 'ritual', 'meditation'].includes(category)) {
      filteredDefinitions = filteredDefinitions.filter((a) => a.category === category);
    }

    if (rarity) {
      filteredDefinitions = filteredDefinitions.filter((a) => a.rarity === rarity);
    }

    if (orixa) {
      filteredDefinitions = filteredDefinitions.filter((a) =>
        a.orixa?.toLowerCase().includes(orixa.toLowerCase())
      );
    }

    if (sefirot) {
      filteredDefinitions = filteredDefinitions.filter((a) =>
        a.sefirot?.some(sf => sf.toLowerCase().includes(sefirot.toLowerCase()))
      );
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

    // Statistics
    const statsByCategory = ACHIEVEMENTS.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statsByRarity = ACHIEVEMENTS.reduce((acc, a) => {
      acc[a.rarity] = (acc[a.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statsByTradicao = ACHIEVEMENTS.reduce((acc, a) => {
      if (a.tradicao) acc[a.tradicao] = (acc[a.tradicao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statsByOrixa = ACHIEVEMENTS.reduce((acc, a) => {
      if (a.orixa) acc[a.orixa] = (acc[a.orixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Include stats if requested
    if (stats === 'true') {
      return NextResponse.json({
        success: true,
        achievements,
        stats: {
          unlockedCount,
          totalCount,
          completionPercentage,
          byCategory: statsByCategory,
          byRarity: statsByRarity,
          byTradicao: statsByTradicao,
          byOrixa: statsByOrixa,
        },
      });
    }

    return NextResponse.json({
      success: true,
      achievements,
      unlockedCount,
      totalCount,
      completionPercentage,
      meta: {
        filters: { category, rarity, orixa, sefirot },
        spiritualFilters: ['orixa', 'sefirot'],
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}