import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const JourneyTypeSchema = z.enum([
  'awakening', 'shadow_work', 'initiation', 'integration',
  'ancestral_healing', 'orixa_encounter'
]);
const JourneyPhaseSchema = z.enum(['preparation', 'active', 'integration', 'completed']);
const JourneyQuerySchema = z.object({
  userId: z.string().optional(),
  type: JourneyTypeSchema.optional(),
  phase: JourneyPhaseSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});
const CreateJourneySchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  type: JourneyTypeSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  orixa: z.string().optional(),
  phase: JourneyPhaseSchema.optional().default('preparation'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  keyInsights: z.array(z.string()).optional(),
  practices: z.array(z.string()).optional(),
});

// ─── Journey Type Spiritual Correlations ──────────────────────────────────────────
const JOURNEY_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  phases: Record<string, {
    description: string;
    practices: string[];
    affirmation: string;
  }>;
}> = {
  awakening: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Desperto para minha verdadeira essência',
    frequency: '963 Hz',
    phases: {
      preparation: {
        description: 'Preparando a mente e o coração para o despertar',
        practices: ['Meditação profunda', 'Journaling espiritual', 'Respiração holotrópica'],
        affirmation: 'Preparo meu ser para o despertar',
      },
      active: {
        description: 'Ativando a consciência superior',
        practices: ['Contemplação', 'Prática de presença', 'Despertar da Kundalini'],
        affirmation: 'Minha consciência se expande',
      },
      integration: {
        description: 'Integrando a luz do despertar',
        practices: ['Reflexão', 'Arte sagrada', 'Compartilhamento'],
        affirmation: 'Integro a sabedoria do despertar',
      },
      completed: {
        description: 'Despertar completo realizado',
        practices: ['Serviço', 'Ensino', 'Iluminação'],
        affirmation: 'Sou um ser desperto',
      },
    },
  },
  shadow_work: {
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'Encontro luz nas minhas sombras',
    frequency: '396 Hz',
    phases: {
      preparation: {
        description: 'Preparando-se para enfrentar a sombra',
        practices: ['Terapia de sombra', 'Trabalho com dreams', 'Ritual de confronto'],
        affirmation: 'Tenho coragem de enfrentar minha sombra',
      },
      active: {
        description: 'Processando traumas e sombras',
        practices: ['Inner work', 'Meditação de confronto', 'Journaling sombras'],
        affirmation: 'A luz dissipa minhas sombras',
      },
      integration: {
        description: 'Integrando partes de si mesmo',
        practices: ['Auto-observação', 'Compaixão', 'Perdão'],
        affirmation: 'Aceito todas as partes de mim',
      },
      completed: {
        description: 'Sombra integrada',
        practices: ['Transformação', 'Amor próprio', 'Liberdade'],
        affirmation: 'Sou inteiro em minha totalidade',
      },
    },
  },
  initiation: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Recebo a sabedoria dos iniciados',
    frequency: '741 Hz',
    phases: {
      preparation: {
        description: 'Preparando-se para a iniciação',
        practices: ['Ritual de passagem', 'Jejum espiritual', 'Meditação de isolamento'],
        affirmation: 'Preparo-me para.crossroads o sagrado',
      },
      active: {
        description: 'Experienciando a iniciação',
        practices: ['Ritual de iniciação', 'Purificação', 'Desidentificação'],
        affirmation: 'Minha alma aceita a iniciação',
      },
      integration: {
        description: 'Integrando a energia iniciática',
        practices: ['Contemplação', 'Prática sagrada', 'Comunidade iniciática'],
        affirmation: 'Integro a sabedoria iniciática',
      },
      completed: {
        description: 'Iniciação completada',
        practices: ['Serviço sagrado', 'Guardião de mistérios', 'Transmissão'],
        affirmation: 'Sou um iniciado nos mistérios',
      },
    },
  },
  integration: {
    sefirot: ['Tipheret', 'Malkuth'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Integro todas as experiências em unidade',
    frequency: '528 Hz',
    phases: {
      preparation: {
        description: 'Preparando para integração',
        practices: ['Contemplação', 'Arte sagrada', 'Comunidade'],
        affirmation: 'Preparo meu ser para a integração',
      },
      active: {
        description: 'Integrando experiências de vida',
        practices: ['Meditação', 'Arte', 'Serviço'],
        affirmation: 'Tudo se integra em meu ser',
      },
      integration: {
        description: 'Fortalecendo a integração',
        practices: ['Prática consistente', 'Reflexão', 'Amor'],
        affirmation: 'A integração fortalece meu ser',
      },
      completed: {
        description: 'Integração completa',
        practices: ['Maestria', 'Unidade', 'Paz'],
        affirmation: 'Sou uno com tudo',
      },
    },
  },
  ancestral_healing: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    element: 'Água',
    orixa: 'Nanã',
    affirmation: 'Honro e libero meus ancestrais',
    frequency: '285 Hz',
    phases: {
      preparation: {
        description: 'Conectando com a ancestralidade',
        practices: ['Trabalho ancestral', 'Genealogia espiritual', 'Ritual de cura'],
        affirmation: 'Conecto-me com minha linhagem',
      },
      active: {
        description: 'Curando feridas ancestrais',
        practices: ['Ritual de cura', 'Ancestral meditation', 'Perdão'],
        affirmation: 'A cura flui através de mim',
      },
      integration: {
        description: 'Integrando cura ancestral',
        practices: ['Honrar ancestrais', 'Prática de cura', 'Serviço ancestral'],
        affirmation: 'Integro a cura dos meus ancestrais',
      },
      completed: {
        description: 'Cura ancestral completa',
        practices: ['Linhagem curada', 'Força ancestral', 'Proteção'],
        affirmation: 'Minha linhagem está curada',
      },
    },
  },
  orixa_encounter: {
    sefirot: ['Tipheret', 'Chesed', 'Gevurah'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Encontro meus Orixás em paz',
    frequency: '528 Hz',
    phases: {
      preparation: {
        description: 'Preparando-se para o encontro com o Orixá',
        practices: ['Ejulação', 'Banho de ervas', 'Oferenda', 'Meditação'],
        affirmation: 'Preparo-me para encontrar meu Orixá',
      },
      active: {
        description: 'Experienciando o encontro com o Orixá',
        practices: ['Ritual de invocação', 'Cânticos', 'Dança sagrada'],
        affirmation: 'Meu Orixá se manifesta em mim',
      },
      integration: {
        description: 'Integrando a energia do Orixá',
        practices: ['Contemplação', 'Prática do Orixá', 'Harmonização'],
        affirmation: 'Integro a energia do meu Orixá',
      },
      completed: {
        description: 'Encontro com o Orixá completo',
        practices: ['Caminho do Orixá', 'Harmonia', 'Proteção'],
        affirmation: 'Caminho com meu Orixá em paz',
      },
    },
  },
};

// ─── In-memory journey store ──────────────────────────────────────────────────────────
interface Journey {
  id: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  orixa?: string;
  phase: string;
  startDate?: string;
  keyInsights?: string[];
  practices?: string[];
  spiritualCorrelations?: typeof JOURNEY_SPIRITUAL_CORRELATIONS[string];
  createdAt: string;
}

const journeyStore: Map<string, Journey[]> = new Map();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = JourneyQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      type: searchParams.get('type'),
      phase: searchParams.get('phase'),
      limit: searchParams.get('limit'),
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

    const { userId, type, phase, limit, sefirot, chakra, element, orixa } = parseResult.data;

    // Get journeys for user
    let journeys: Journey[] = [];
    if (userId) {
      journeys = journeyStore.get(userId) || [];
    }

    // Filter by type
    if (type) {
      journeys = journeys.filter(j => j.type === type);
    }

    // Filter by phase
    if (phase) {
      journeys = journeys.filter(j => j.phase === phase);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      journeys = journeys.filter(j => j.spiritualCorrelations?.sefirot.includes(sefirot));
    }
    if (chakra) {
      journeys = journeys.filter(j => j.spiritualCorrelations?.chakra === chakra);
    }
    if (element) {
      journeys = journeys.filter(j => j.spiritualCorrelations?.element === element);
    }
    if (orixa) {
      journeys = journeys.filter(j => j.spiritualCorrelations?.orixa === orixa);
    }

    // Apply limit
    if (limit && journeys.length > limit) {
      journeys = journeys.slice(0, limit);
    }

    // Get guidance
    const guidance = type ? JOURNEY_SPIRITUAL_CORRELATIONS[type] : null;

    // Statistics
    const stats = {
      byType: journeys.reduce((acc, j) => {
        acc[j.type] = (acc[j.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPhase: journeys.reduce((acc, j) => {
        acc[j.phase] = (acc[j.phase] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total: journeys.length,
    };

    return NextResponse.json({
      success: true,
      journeys,
      count: journeys.length,
      guidance: guidance || Object.values(JOURNEY_SPIRITUAL_CORRELATIONS),
      spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS,
      stats,
      meta: {
        filters: { userId, type, phase, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

// POST handler for creating journeys
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateJourneySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { userId, type, title, description, orixa, phase, startDate, keyInsights, practices } = parseResult.data;

    const spiritualCorr = JOURNEY_SPIRITUAL_CORRELATIONS[type];

    const journey: Journey = {
      id: `journey-${Date.now()}`,
      userId,
      type,
      title,
      description,
      orixa: orixa || spiritualCorr?.orixa,
      phase,
      startDate,
      keyInsights,
      practices,
      spiritualCorrelations: spiritualCorr,
      createdAt: new Date().toISOString(),
    };

    const userJourneys = journeyStore.get(userId) || [];
    userJourneys.push(journey);
    journeyStore.set(userId, userJourneys);

    return NextResponse.json({
      success: true,
      journey,
      spiritualCorrelations: spiritualCorr,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}