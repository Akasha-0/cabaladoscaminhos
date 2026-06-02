import { applySpiritualFilters } from '@/lib/api/filter-utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createErrorResponse, createListResponse } from '@/lib/api/response-helpers';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const EnergyActionSchema = z.enum(['status', 'trend', 'history']);
const EnergyQuerySchema = z.object({
  action: EnergyActionSchema.optional().default('status'),
  days: z.coerce.number().int().positive().max(365).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});
const EnergyEntrySchema = z.object({
  level: z.number().int().min(1).max(10),
  note: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Energy Level Spiritual Correlations ──────────────────────────────────────────
const ENERGY_LEVEL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  recommendation: string;
}> = {
  1: { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Descanso e me restauro para reconstruir minha energia', recommendation: 'Pratique grounding com Ogum, use crystals de obsidiana' },
  2: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Respiração consciente renova minha vitalidade', recommendation: 'Pratique respiração 4-7-8, use incenso de salvio' },
  3: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O equilíbrio me sustenta em harmonia', recommendation: 'Pratique visualization com Oxum, use água de flor' },
  4: { sefirot: ['Gevurah', 'Chesed'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'Minha energia flui com propósito e força', recommendation: 'Pratique ritual de fogo com Xangô, use cinnamon' },
  5: { sefirot: ['Chokhmah', 'Tipheret'], chakra: 6, element: 'Ar', orixa: 'Oxum', affirmation: 'Clareza mental e emoção em equilíbrio', recommendation: 'Pratique meditação com Oxum, use quartzo rosa' },
  6: { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Sou um canal de energia divina em plenitude', recommendation: 'Pratique oração de Oxalá, use vela branca' },
};

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────
const ENERGY_LEVELS = {
  EXHAUSTED: 1,
  LOW: 2,
  MODERATE: 3,
  GOOD: 4,
  HIGH: 5,
  OPTIMAL: 6,
} as const;
type EnergyLevel = typeof ENERGY_LEVELS[keyof typeof ENERGY_LEVELS];

interface EnergySpiritualCorrelations {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  recommendation: string;
}

interface EnergyEntry {
  id: string;
  userId: string;
  level: EnergyLevel;
  timestamp: string;
  notes?: string;
  activities?: string[];
  spiritualCorrelations?: EnergySpiritualCorrelations;
}

interface EnergyTrend {
  period: string;
  averageLevel: number;
  peakTime: string;
  lowTime: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  spiritualCorrelations?: EnergySpiritualCorrelations;
}

interface EnergyInsight {
  type: 'tip' | 'warning' | 'recommendation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  spiritualCorrelations?: EnergySpiritualCorrelations;
}

// In-memory energy tracking
const energyStore: Map<string, EnergyEntry[]> = new Map();

function getUserEnergyEntries(userId: string): EnergyEntry[] {
  return energyStore.get(userId) || [];
}

function getSpiritualCorrelationsForLevel(level: number): EnergySpiritualCorrelations {
  return ENERGY_LEVEL_SPIRITUAL_CORRELATIONS[level.toString()] || ENERGY_LEVEL_SPIRITUAL_CORRELATIONS['3'];
}

function calculateEnergyTrend(entries: EnergyEntry[]): EnergyTrend {
  if (entries.length === 0) {
    const defaultCorr = getSpiritualCorrelationsForLevel(3);
    return {
      period: '7d',
      averageLevel: 3,
      peakTime: '10:00',
      lowTime: '14:00',
      trend: 'stable',
      spiritualCorrelations: defaultCorr,
    };
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const recentEntries = sortedEntries.slice(-7);
  const averageLevel = recentEntries.reduce((sum, e) => sum + e.level, 0) / recentEntries.length;

  const levelByHour = new Map<number, number[]>();
  recentEntries.forEach((entry) => {
    const hour = new Date(entry.timestamp).getHours();
    if (!levelByHour.has(hour)) levelByHour.set(hour, []);
    levelByHour.get(hour)!.push(entry.level);
  });

  let peakTime = '10:00';
  let lowTime = '14:00';
  let maxAvg = 0;
  let minAvg = Infinity;

  levelByHour.forEach((levels, hour) => {
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    if (avg > maxAvg) {
      maxAvg = avg;
      peakTime = `${hour.toString().padStart(2, '0')}:00`;
    }
    if (avg < minAvg) {
      minAvg = avg;
      lowTime = `${hour.toString().padStart(2, '0')}:00`;
    }
  });

  const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
  const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
  const firstAvg = firstHalf.reduce((sum, e) => sum + e.level, 0) / firstHalf.length || 0;
  const secondAvg = secondHalf.reduce((sum, e) => sum + e.level, 0) / secondHalf.length || 0;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (secondAvg > firstAvg + 0.5) trend = 'increasing';
  else if (secondAvg < firstAvg - 0.5) trend = 'decreasing';

  const spiritualCorr = getSpiritualCorrelationsForLevel(Math.round(averageLevel));

  return {
    period: '7d',
    averageLevel: Math.round(averageLevel * 10) / 10,
    peakTime,
    lowTime,
    trend,
    spiritualCorrelations: spiritualCorr,
  };
}

// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = EnergyQuerySchema.safeParse({
      action: searchParams.get('action'),
      days: searchParams.get('days'),
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

    const { action, days, sefirot, chakra, element, orixa } = parseResult.data;
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

    const entries = getUserEnergyEntries(user.id);

    switch (action) {
      case 'status': {
        const latestEntry = entries[entries.length - 1];
        const currentLevel = latestEntry?.level || 3;
        const spiritualCorr = getSpiritualCorrelationsForLevel(currentLevel);

        // Filter by spiritual correlations using shared utility
        const filteredEntries = applySpiritualFilters(entries as any, { sefirot, chakra, element, orixa });

        return NextResponse.json({
          success: true,
          status: {
            currentLevel,
            spiritualCorrelations: spiritualCorr,
            affirmation: spiritualCorr.affirmation,
            recommendation: spiritualCorr.recommendation,
          },
          meta: {
            filters: { sefirot, chakra, element, orixa },
          },
        });
      }

      case 'trend': {
        const trend = calculateEnergyTrend(entries);
        
        // Filter entries by spiritual correlations using shared utility
        const filteredEntries = applySpiritualFilters(entries as any, { sefirot, chakra, element, orixa });
        if (filteredEntries.length !== entries.length || sefirot || chakra || element || orixa) {
          return NextResponse.json({
            success: true,
            trend: calculateEnergyTrend(filteredEntries as unknown as EnergyEntry[]),
            meta: { filters: { sefirot, chakra, element, orixa } },
          });
        }

        return NextResponse.json({
          success: true,
          trend,
        });
      }

      case 'history': {
        // Filter by spiritual correlations using shared utility
        const historyEntries = applySpiritualFilters(entries as any, { sefirot, chakra, element, orixa });

        return NextResponse.json({
          success: true,
          history: historyEntries,
          count: historyEntries.length,
          spiritualCorrelations: ENERGY_LEVEL_SPIRITUAL_CORRELATIONS,
        });
      }

      default:
        return NextResponse.json({
          success: true,
          status: {
            currentLevel: 3,
            spiritualCorrelations: getSpiritualCorrelationsForLevel(3),
          },
        });
    }
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Erro interno',
      { status: 500 }
    );
  }
}
// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = EnergyEntrySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { level, note, timestamp, sefirot, chakra, element, orixa } = parseResult.data;
    const spiritualCorr = getSpiritualCorrelationsForLevel(level);

    const { affirmation, recommendation, ...restCorr } = spiritualCorr;
    const entry: EnergyEntry = {
      id: `energy-${Date.now()}`,
      userId: user.id,
      level: level as unknown as EnergyLevel,
      timestamp: timestamp || new Date().toISOString(),
      notes: note,
      spiritualCorrelations: (sefirot && chakra && element && orixa)
        ? { sefirot: [sefirot], chakra, element, orixa, affirmation, recommendation }
        : spiritualCorr,
    };

    const entries = getUserEnergyEntries(user.id);
    entries.push(entry);
    energyStore.set(user.id, entries);

    return NextResponse.json({
      success: true,
      entry,
      spiritualCorrelations: entry.spiritualCorrelations,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}