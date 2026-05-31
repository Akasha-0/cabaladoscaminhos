// ============================================================
// DAILY PRACTICE API - CABALA DOS CAMINHOS
// ============================================================
// GET fetch today's practice
// POST complete/log a practice session
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const PracticeTypeSchema = z.enum([
  'meditation', 'breathwork', 'affirmation', 'gratitude',
  'visualization', 'ritual', 'chakra', 'manifestation', 'yoga'
]);

const DailyPracticeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  practiceType: PracticeTypeSchema,
  duration: z.number().int().positive(),
  completed: z.boolean(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

const PracticeTemplateSchema = z.object({
  type: PracticeTypeSchema,
  duration: z.number().int().positive(),
  description: z.string(),
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
  chakra: z.array(z.number()).optional(),
  tradicao: z.string().optional(),
  numeroSagrado: z.number().optional(),
  beneficios: z.array(z.string()).optional(),
});

const DailyPracticeQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: PracticeTypeSchema.optional(),
  orixa: z.string().optional(),
  sefirot: z.string().optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
});

export type DailyPractice = z.infer<typeof DailyPracticeSchema>;
export type PracticeTemplate = z.infer<typeof PracticeTemplateSchema>;
export const dynamic = 'force-dynamic';

// ─── Daily Practice Templates with Spiritual Correlations ──────────────────────────────────────────
const practiceTemplates: PracticeTemplate[] = [
  {
    type: 'meditation',
    duration: 15,
    description: 'Meditação guiada',
    sefirot: ['Kether', 'Tipheret'],
    chakra: [6, 7],
    tradicao: 'Vipassana/Mindfulness',
    numeroSagrado: 1,
    beneficios: ['Clareza mental', 'Redução do estresse', 'Conexão espiritual', 'Foco aprimorado'],
  },
  {
    type: 'breathwork',
    duration: 10,
    description: 'Respirações conscientes',
    sefirot: ['Gevurah'],
    chakra: [3, 4],
    tradicao: 'Pranayama/Yoga',
    numeroSagrado: 4,
    beneficios: ['Regulação do sistema nervoso', 'Energia vital', 'Calma interior', 'Vitalidade'],
  },
  {
    type: 'affirmation',
    duration: 5,
    description: 'Afirmações positivas',
    sefirot: ['Chokhmah'],
    chakra: [5, 6],
    tradicao: 'Neo-Spiritualidade',
    numeroSagrado: 3,
    beneficios: ['Reprogramação mental', 'Autoestima', 'Foco positivo', 'Manifestação'],
  },
  {
    type: 'gratitude',
    duration: 5,
    description: 'Prática de gratidão',
    sefirot: ['Netzach'],
    chakra: [4],
    tradicao: 'Spiritualidade Universal',
    numeroSagrado: 7,
    beneficios: ['Felicidade Aumentada', 'Abundância', 'Conexão emocional', 'Satisfação'],
  },
  {
    type: 'visualization',
    duration: 10,
    description: 'Visualização criativa',
    sefirot: ['Binah'],
    chakra: [6],
    tradicao: 'Visualização Criativa',
    numeroSagrado: 11,
    beneficios: ['Manifestação de objetivos', 'Imaginação ativa', 'Clareza de visão', 'Criatividade'],
  },
  {
    type: 'ritual',
    duration: 15,
    description: 'Ritual espiritual',
    sefirot: ['Malkuth', 'Yesod'],
    orixa: 'Oxalá',
    chakra: [1, 2],
    tradicao: 'Tradições Afro-Brasileiras',
    numeroSagrado: 8,
    beneficios: ['Conexão espiritual', 'Proteção energética', 'Harmonização', 'Ancestralidade'],
  },
  {
    type: 'chakra',
    duration: 20,
    description: 'Trabalho com chakras',
    sefirot: ['Tipheret', 'Chesed', 'Gevurah'],
    chakra: [1, 2, 3, 4, 5, 6, 7],
    tradicao: 'Tantra/Yoga',
    numeroSagrado: 7,
    beneficios: ['Equilíbrio energético', 'Harmonização dos centros', 'Fluxo de prana', 'Saúde holística'],
  },
  {
    type: 'manifestation',
    duration: 10,
    description: 'Prática de manifestação',
    sefirot: ['Chesed', 'Netzach'],
    chakra: [4, 6],
    tradicao: 'Law of Attraction',
    numeroSagrado: 11,
    beneficios: ['Atração de abundância', 'Alinhamento energético', 'Propósito claro', 'Ação inspirada'],
  },
  {
    type: 'yoga',
    duration: 30,
    description: 'Prática de yoga',
    sefirot: ['Gevurah', 'Chesed', 'Tipheret'],
    chakra: [1, 2, 3, 4, 5, 6, 7],
    tradicao: 'Yoga Tradicional',
    numeroSagrado: 8,
    beneficios: ['Flexibilidade', 'Força', 'Equilíbrio corpo-mente', 'Prana vital'],
  },
];

// ─── API Routes ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = DailyPracticeQuerySchema.safeParse({
      date: searchParams.get('date'),
      type: searchParams.get('type'),
      orixa: searchParams.get('orixa'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { date, type, orixa, sefirot, chakra } = parseResult.data;
    const today = date || new Date().toISOString().split('T')[0];
    const userId = request.headers.get('x-user-id');

    // Filter templates by spiritual criteria
    let filteredTemplates = [...practiceTemplates];

    if (type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === type);
    }

    if (orixa) {
      filteredTemplates = filteredTemplates.filter(t =>
        t.orixa?.toLowerCase().includes(orixa.toLowerCase())
      );
    }

    if (sefirot) {
      filteredTemplates = filteredTemplates.filter(t =>
        t.sefirot?.some(sf => sf.toLowerCase().includes(sefirot.toLowerCase()))
      );
    }

    if (chakra) {
      filteredTemplates = filteredTemplates.filter(t =>
        t.chakra?.includes(chakra)
      );
    }

    // Calculate spiritual guidance based on day
    const dayOfWeek = new Date(today).getDay();
    const spiritualGuidance = getSpiritualGuidance(dayOfWeek);

    // Statistics
    const stats = {
      totalTemplates: practiceTemplates.length,
      byType: practiceTemplates.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byTradicao: practiceTemplates.reduce((acc, t) => {
        if (t.tradicao) acc[t.tradicao] = (acc[t.tradicao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalDuration: practiceTemplates.reduce((sum, t) => sum + t.duration, 0),
      byChakra: practiceTemplates.reduce((acc, t) => {
        t.chakra?.forEach(c => {
          acc[c] = (acc[c] || 0) + 1;
        });
        return acc;
      }, {} as Record<number, number>),
    };

    return NextResponse.json({
      success: true,
      date: today,
      dayOfWeek,
      templates: filteredTemplates,
      spiritualGuidance,
      progress: {
        completed: 0,
        total: filteredTemplates.length,
        percentage: 0,
      },
      stats,
      filters: { type, orixa, sefirot, chakra },
      meta: {
        userId: userId || null,
        hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID required',
      }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Validate practice type
    const practiceTypeParse = PracticeTypeSchema.safeParse(body.practiceType);
    if (!practiceTypeParse.success) {
      return NextResponse.json({
        success: false,
        error: 'Tipo de prática inválido',
        validTypes: PracticeTypeSchema.options,
      }, { status: 400 });
    }

    const practice: DailyPractice = {
      id: crypto.randomUUID(),
      userId,
      date: body.date || today,
      practiceType: practiceTypeParse.data,
      duration: body.duration || 10,
      completed: body.completed ?? true,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      practice,
      message: 'Prática registrada com sucesso',
      spiritualCorrelation: getPracticeCorrelation(practiceTypeParse.data),
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}

// ─── Helper Functions ──────────────────────────────────────────────────────────────
function getSpiritualGuidance(dayOfWeek: number): {
  message: string;
  orixa: string;
  sefirot: string[];
  chakra: number;
  affirmation: string;
} {
  const guidances = [
    // Sunday (0) - Sol/Oxalá
    {
      message: 'Dia de regeneração e clareza spiritual',
      orixa: 'Oxalá',
      sefirot: ['Kether', 'Tipheret'],
      chakra: 7,
      affirmation: 'Eu sou luz, eu sou paz, eu sou amor divino',
    },
    // Monday (1) - Lua/Iemanjá
    {
      message: 'Dia de reflexão emocional e conexão interior',
      orixa: 'Iemanjá',
      sefirot: ['Yesod'],
      chakra: 2,
      affirmation: 'Permito que minhas emoções fluam com sabedoria',
    },
    // Tuesday (2) - Marte/Ogum ou Xangô
    {
      message: 'Dia de ação, coragem e determinação',
      orixa: 'Ogum',
      sefirot: ['Gevurah'],
      chakra: 3,
      affirmation: 'Atuo com coragem e determinação sagrada',
    },
    // Wednesday (3) - Mercúrio/Exu
    {
      message: 'Dia de comunicação e aprendizado',
      orixa: 'Exu',
      sefirot: ['Hod'],
      chakra: 5,
      affirmation: 'Comunico com clareza e verdade',
    },
    // Thursday (4) - Júpiter/Oxum
    {
      message: 'Dia de abundância e expansão',
      orixa: 'Oxum',
      sefirot: ['Chesed', 'Netzach'],
      chakra: 4,
      affirmation: 'Sou abundante em todas as áreas da vida',
    },
    // Friday (5) - Vênus/Oxum
    {
      message: 'Dia de amor,harmonia e relações',
      orixa: 'Oxum',
      sefirot: ['Netzach', 'Tipheret'],
      chakra: 4,
      affirmation: 'Amo e sou amado de forma saudável',
    },
    // Saturday (6) - Saturno/Omolu
    {
      message: 'Dia de disciplina e purificação',
      orixa: 'Omolu',
      sefirot: ['Binah', 'Malkuth'],
      chakra: 1,
      affirmation: 'Aceito as lições do tempo com paciência',
    },
  ];

  return guidances[dayOfWeek];
}

function getPracticeCorrelation(practiceType: string): {
  sefirot: string[];
  orixa: string;
  chakra: number[];
  tradicao: string;
} {
  const template = practiceTemplates.find(t => t.type === practiceType);
  return {
    sefirot: template?.sefirot || ['Tipheret'],
    orixa: template?.orixa || 'Oxalá',
    chakra: template?.chakra || [4],
    tradicao: template?.tradicao || 'Spiritualidade Universal',
  };
}