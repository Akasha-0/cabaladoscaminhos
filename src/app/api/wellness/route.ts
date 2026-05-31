import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const WellnessTypeSchema = z.enum(['meditation', 'breathing', 'gratitude', 'journaling', 'exercise']);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);

const WellnessQuerySchema = z.object({
  type: WellnessTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
  orixa: z.string().optional(),
});

const CreateWellnessSchema = z.object({
  type: WellnessTypeSchema,
  duration: z.number().int().positive().optional(),
  notes: z.string().optional(),
  mood: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
});

const WellnessEntrySchema = z.object({
  id: z.string(),
  type: WellnessTypeSchema,
  duration: z.number().int().positive().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  mood: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
  chakra: z.number().int().min(1).max(7).optional(),
  sefirot: SefirotSchema.optional(),
});

export type WellnessEntry = z.infer<typeof WellnessEntrySchema>;
export const dynamic = 'force-dynamic';

// ─── Wellness Practice Templates with Spiritual Correlations ──────────────────────────────────────────
const wellnessPractices = {
  meditation: [
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      description: 'Presença plena e consciência do momento presente',
      chakra: 6,
      sefirot: 'Kether',
      orixa: 'Oxalá',
      duration: 15,
      benefits: ['Clareza mental', 'Redução do estresse', 'Conexão espiritual'],
    },
    {
      id: 'kundalini',
      name: 'Kundalini',
      description: 'Despertar da energia serpente na base da coluna',
      chakra: 1,
      sefirot: 'Malkuth',
      orixa: 'Omolu',
      duration: 20,
      benefits: ['Vitalidade', 'Desperta criatividade', 'Ascensão kundalini'],
    },
    {
      id: 'zen',
      name: 'Zen',
      description: 'Meditação sentado em silêncio absoluto',
      chakra: 7,
      sefirot: 'Tipheret',
      orixa: 'Oxalá',
      duration: 30,
      benefits: ['Iluminação', 'Sábedoria', 'Paz interior'],
    },
  ],
  breathing: [
    {
      id: 'pranayama',
      name: 'Pranayama',
      description: 'Controle da energia vital através da respiração',
      chakra: 4,
      sefirot: 'Chesed',
      orixa: 'Iemanjá',
      duration: 10,
      benefits: ['Regulação do prana', 'Calma', 'Vitalidade'],
    },
    {
      id: 'holotropic',
      name: 'Holotrópica',
      description: 'Respiração rápida para estados alterados',
      chakra: 3,
      sefirot: 'Gevurah',
      orixa: 'Ogum',
      duration: 15,
      benefits: ['Cura emocional', 'Liberação de trauma', 'Desperta poder'],
    },
  ],
  gratitude: [
    {
      id: 'gratitude-journal',
      name: 'Diário de Gratidão',
      description: 'Registrar 3 coisas pelas quais é grato diariamente',
      chakra: 4,
      sefirot: 'Netzach',
      orixa: 'Oxum',
      duration: 5,
      benefits: ['Felicidade', 'Abundância', 'Satisfação'],
    },
    {
      id: 'gratitude-ritual',
      name: 'Ritual de Gratidão',
      description: 'Agradecimento aos Orixás ao amanhecer',
      chakra: 5,
      sefirot: 'Hod',
      orixa: 'Oxalá',
      duration: 10,
      benefits: ['Conexão espiritual', 'Humildade', 'Bênçãos'],
    },
  ],
  journaling: [
    {
      id: 'shadow-work',
      name: 'Shadow Work',
      description: 'Exploração dos aspectos ocultos de si mesmo',
      chakra: 1,
      sefirot: 'Binah',
      orixa: 'Omolu',
      duration: 20,
      benefits: ['Auto-conhecimento', 'Integração', 'Transformação'],
    },
    {
      id: 'dream-journal',
      name: 'Diário de Sonhos',
      description: 'Registro e interpretação de sonhos',
      chakra: 6,
      sefirot: 'Yesod',
      orixa: 'Iemanjá',
      duration: 10,
      benefits: ['Intuição', 'Mensagens do inconsciente', 'Profecia'],
    },
  ],
  exercise: [
    {
      id: 'yoga',
      name: 'Yoga',
      description: 'Prática de posturas para corpo e mente',
      chakra: 3,
      sefirot: 'Gevurah',
      orixa: 'Ogum',
      duration: 30,
      benefits: ['Flexibilidade', 'Força', 'Equilíbrio'],
    },
    {
      id: 'tai-chi',
      name: 'Tai Chi',
      description: 'Movimentos lentos e fluidos para energia vital',
      chakra: 4,
      sefirot: 'Tipheret',
      orixa: 'Iemanjá',
      duration: 25,
      benefits: ['Calma', 'Fluidez', 'Harmonia'],
    },
  ],
};

// ─── In-memory store ──────────────────────────────────────────────────────────────
const wellnessData: WellnessEntry[] = [];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = WellnessQuerySchema.safeParse({
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, limit, startDate, endDate, chakra, sefirot, orixa } = parseResult.data;

    let entries = [...wellnessData];

    if (type) {
      entries = entries.filter((e) => e.type === type);
    }

    if (startDate) {
      const start = new Date(startDate);
      entries = entries.filter(e => new Date(e.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      entries = entries.filter(e => new Date(e.createdAt) <= end);
    }

    if (limit) {
      entries = entries.slice(0, limit);
    }

    // Return wellness practices template if no entries
    if (entries.length === 0 && type) {
      const practices = wellnessPractices[type as keyof typeof wellnessPractices] || [];
      return NextResponse.json({
        success: true,
        practices,
        entries: [],
        total: 0,
        filters: { type, chakra, sefirot, orixa },
      });
    }

    // Statistics
    const stats = {
      byType: wellnessData.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: wellnessData.reduce((acc, e) => {
        if (e.chakra) acc[e.chakra] = (acc[e.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      totalEntries: wellnessData.length,
    };

    return NextResponse.json({
      success: true,
      entries,
      total: entries.length,
      filters: { type, startDate, endDate, chakra, sefirot, orixa },
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro ao processar requisição: ${err.message}`,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = CreateWellnessSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const entry: WellnessEntry = {
      id: crypto.randomUUID(),
      type: parseResult.data.type,
      duration: parseResult.data.duration,
      notes: parseResult.data.notes,
      mood: parseResult.data.mood,
      energy: parseResult.data.energy,
      chakra: parseResult.data.chakra,
      sefirot: parseResult.data.sefirot,
      createdAt: new Date().toISOString(),
    };

    wellnessData.push(entry);

    return NextResponse.json({
      success: true,
      entry,
      message: 'Registro de bem-estar criado com sucesso',
 }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro ao processar requisição: ${err.message}`,
    }, { status: 500 });
  }
}