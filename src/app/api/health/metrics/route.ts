import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import type { SpiritualCorrelations } from '@/lib/api/spiritual-correlations';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether',
  'Chokhmah',
  'Binah',
  'Chesed',
  'Gevurah',
  'Tipheret',
  'Netzach',
  'Hod',
  'Yesod',
  'Malkuth',
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const HealthMetricSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  metricType: z.string().min(1, 'Tipo de métrica é obrigatório'),
  value: z.number(),
  unit: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const HealthMetricsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD')
    .optional(),
  type: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Health Metrics ──────────────────────────────────────────
const METRIC_SPIRITUAL_CORRELATIONS: Record<
  string,
  {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  }
> = {
  energy: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Minha energia vital flui abundantemente',
    frequency: '528 Hz',
  },
  sleep: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Iemanjá',
    affirmation: 'O sono restaurador me renova',
    frequency: '285 Hz',
  },
  mood: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A harmonia emocional me sustenta',
    frequency: '528 Hz',
  },
  stress: {
    sefirot: ['Binah', 'Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Libero o estresse e abraço a paz',
    frequency: '417 Hz',
  },
  meditation: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'A clareza mental me guia',
    frequency: '639 Hz',
  },
  hydration: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'As águas purificam meu corpo e alma',
    frequency: '417 Hz',
  },
  exercise: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O corpo são é templo do espírito',
    frequency: '528 Hz',
  },
  nutrition: {
    sefirot: ['Malkuth', 'Chesed'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'Nutro meu corpo com alimentos sagrados',
    frequency: '396 Hz',
  },
};

interface HealthMetric {
  id: string;
  date: string;
  metricType: string;
  value: number;
  unit?: string;
  source?: string;
  notes?: string;
  createdAt: string;
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: SpiritualCorrelations;
}

const metricsData: HealthMetric[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = HealthMetricsQuerySchema.safeParse({
    date: searchParams.get('date'),
    type: searchParams.get('type'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { date, type, sefirot, chakra, element, orixa } = parseResult.data;
  let entries = [...metricsData];

  if (date) {
    entries = entries.filter((e) => e.date === date);
  }

  if (type) {
    entries = entries.filter((e) => e.metricType === type);
  }

  if (sefirot) {
    entries = entries.filter((e) => e.spiritualCorrelations?.sefirot.includes(sefirot));
  }

  if (chakra) {
    entries = entries.filter((e) => e.spiritualCorrelations?.chakra === chakra);
  }

  if (element) {
    entries = entries.filter((e) => e.spiritualCorrelations?.element === element);
  }

  if (orixa) {
    entries = entries.filter((e) => e.spiritualCorrelations?.orixa === orixa);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    byType: entries.reduce(
      (acc, e) => {
        acc[e.metricType] = (acc[e.metricType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    avgValue: entries.reduce((sum, e) => sum + e.value, 0) / (entries.length || 1),
    bySefirot: entries.reduce(
      (acc, e) => {
        e.spiritualCorrelations?.sefirot.forEach((s) => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    ),
    byChakra: entries.reduce(
      (acc, e) => {
        const c = e.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byElement: entries.reduce(
      (acc, e) => {
        const el = e.spiritualCorrelations?.element;
        if (el) acc[el] = (acc[el] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byOrixa: entries.reduce(
      (acc, e) => {
        const o = e.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return NextResponse.json({
    success: true,
    entries,
    total: entries.length,
    spiritualCorrelations: METRIC_SPIRITUAL_CORRELATIONS,
    spiritualStats,
    meta: {
      filters: { date, type, sefirot, chakra, element, orixa },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = HealthMetricSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { date, metricType, value, unit, source, notes, sefirot, chakra, element, orixa } =
      parseResult.data;

    // Get spiritual correlations based on metric type
    const baseCorrelations =
      METRIC_SPIRITUAL_CORRELATIONS[metricType] || METRIC_SPIRITUAL_CORRELATIONS.energy;

    const metric: HealthMetric = {
      id: crypto.randomUUID(),
      date,
      metricType,
      value,
      unit,
      source,
      notes,
      createdAt: new Date().toISOString(),
      sefirot: sefirot || baseCorrelations.sefirot,
      chakra: chakra || baseCorrelations.chakra,
      element: element || baseCorrelations.element,
      orixa: orixa || baseCorrelations.orixa,
      affirmation: baseCorrelations.affirmation,
      frequency: baseCorrelations.frequency,
      spiritualCorrelations: baseCorrelations,
    };

    metricsData.push(metric);

    return NextResponse.json(
      {
        success: true,
        metric,
        spiritualCorrelations: baseCorrelations,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar requisição',
      },
      { status: 500 }
    );
  }
}
