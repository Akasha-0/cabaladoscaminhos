import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const HealthQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const HealthEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  mood: z.string().optional(),
  energy: z.number().int().min(1).max(10).optional(),
  sleep: z.number().optional(),
  water: z.number().optional(),
  exercise: z.boolean().optional(),
  meditation: z.boolean().optional(),
  notes: z.string().optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(SefirotSchema),
    chakra: ChakraSchema,
    element: ElementSchema,
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

// ─── Spiritual Correlations for Health ──────────────────────────────────────────
const HEALTH_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  high_energy: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Minha energia flui em abundância',
    frequency: '528 Hz',
  },
  low_energy: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'O descanso restaura minha energia vital',
    frequency: '396 Hz',
  },
  meditation_practice: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A meditação eleva minha consciência',
    frequency: '963 Hz',
  },
  exercise_practice: {
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O movimento sagrado fortalece meu corpo',
    frequency: '528 Hz',
  },
  good_sleep: {
    sefirot: ['Yesod', 'Binah'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'O sono restaurador renova minha alma',
    frequency: '417 Hz',
  },
  hydration: {
    sefirot: ['Yesod', 'Binah'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A água sagrada purifica meu corpo',
    frequency: '417 Hz',
  },
};

// ─── Health Entry Interface ────────────────────────────────────────────────────────
interface HealthEntry {
  id: string;
  date: string;
  mood?: string;
  energy?: number;
  sleep?: number;
  water?: number;
  exercise?: boolean;
  meditation?: boolean;
  notes?: string;
  createdAt: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const healthData: HealthEntry[] = [];

function getHealthCorrelations(entry: Partial<HealthEntry>) {
  const correlations: { sefirot: string[]; chakra: number; element: string; orixa: string; affirmation: string; frequency: string }[] = [];

  if (entry.energy && entry.energy >= 7) {
    correlations.push(HEALTH_SPIRITUAL_CORRELATIONS['high_energy']);
  } else if (entry.energy && entry.energy < 4) {
    correlations.push(HEALTH_SPIRITUAL_CORRELATIONS['low_energy']);
  }

  if (entry.meditation) {
    correlations.push(HEALTH_SPIRITUAL_CORRELATIONS['meditation_practice']);
  }

  if (entry.exercise) {
    correlations.push(HEALTH_SPIRITUAL_CORRELATIONS['exercise_practice']);
  }

  if (entry.sleep && entry.sleep >= 7) {
    correlations.push(HEALTH_SPIRITUAL_CORRELATIONS['good_sleep']);
  }

  if (entry.water && entry.water >= 2) {
    correlations.push(HEALTH_SPIRITUAL_CORRELATIONS['hydration']);
  }

  return correlations[0] || HEALTH_SPIRITUAL_CORRELATIONS['low_energy'];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = HealthQuerySchema.safeParse({
      date: searchParams.get('date'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { date, sefirot, chakra, element, orixa } = parseResult.data;
    let entries = date
      ? healthData.filter((e) => e.date === date)
      : healthData;

    // Calculate spiritual stats
    const spiritualStats = {
      byDate: entries.reduce((acc, e) => {
        acc[e.date] = (acc[e.date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgEnergy: entries.reduce((sum, e) => sum + (e.energy || 0), 0) / (entries.length || 1),
      avgSleep: entries.reduce((sum, e) => sum + (e.sleep || 0), 0) / (entries.length || 1),
      totalMeditation: entries.filter(e => e.meditation).length,
      totalExercise: entries.filter(e => e.exercise).length,
    };

    return NextResponse.json({
      entries,
      total: entries.length,
      spiritualCorrelations: HEALTH_SPIRITUAL_CORRELATIONS,
      spiritualStats,
 meta: {
        filters: { date, sefirot, chakra, element, orixa },
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = HealthEntrySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const entry: HealthEntry = {
      id: crypto.randomUUID(),
      ...parseResult.data,
      createdAt: new Date().toISOString(),
      spiritualCorrelations: getHealthCorrelations(parseResult.data),
    };

    healthData.push(entry);

    return NextResponse.json({
      entry,
      spiritualCorrelations: entry.spiritualCorrelations,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}