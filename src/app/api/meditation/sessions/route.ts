import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const MeditationSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  meditationId: z.string().optional(),
  meditationName: z.string(),
  duration: z.number().int().positive(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  completed: z.boolean(),
  notes: z.string().optional(),
  category: z.string(),
  createdAt: z.string(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
  frequency: z.string().optional(),
 affirmation: z.string().optional(),
});

const CreateSessionSchema = z.object({
  userId: z.string(),
  meditationId: z.string().optional(),
  meditationName: z.string().min(1),
  duration: z.number().int().positive(),
  category: z.string(),
  notes: z.string().optional(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Meditation Sessions ──────────────────────────────────────────
const SESSION_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  focused: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Minha mente está clara e focada',
    frequency: '528 Hz',
  },
  breathing: {
    sefirot: ['Binah', 'Kether'],
    chakra: 4,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A respiração me ancora no presente',
    frequency: '417 Hz',
  },
  'body-scan': {
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Aceito e honro cada parte de meu corpo',
    frequency: '396 Hz',
  },
  visualization: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Eu crio minha realidade com clareza',
    frequency: '741 Hz',
  },
  sleep: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Iemanjá',
    affirmation: 'Entrego meu sono à luz divina',
    frequency: '285 Hz',
  },
  compassion: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Amor e compaixão fluem através de mim',
    frequency: '528 Hz',
  },
  mindfulness: {
    sefirot: ['Binah', 'Tipheret'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Estou presente neste momento',
    frequency: '639 Hz',
  },
  gratitude: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Sou grato por todas as bênçãos',
    frequency: '528 Hz',
  },
};

export type MeditationSession = z.infer<typeof MeditationSessionSchema>;
export type CreateSession = z.infer<typeof CreateSessionSchema>;

const sessions: MeditationSession[] = [];

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const sessionId = searchParams.get('id');
  const category = searchParams.get('category');
  const sefirot = searchParams.get('sefirot');
  const chakra = searchParams.get('chakra');
  const element = searchParams.get('element');
  const orixa = searchParams.get('orixa');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (sessionId) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found', id: sessionId },
        { status: 404 }
      );
    }
    return NextResponse.json(session);
  }

  let filteredSessions = [...sessions];

  if (userId) {
    filteredSessions = filteredSessions.filter((s) => s.userId === userId);
  }

  if (category) {
    filteredSessions = filteredSessions.filter((s) => s.category === category);
  }

  if (sefirot) {
    filteredSessions = filteredSessions.filter((s) => s.sefirot?.includes(sefirot as typeof s.sefirot[number]));
  }

  if (chakra) {
    filteredSessions = filteredSessions.filter((s) => s.chakra === parseInt(chakra));
  }

  if (element) {
    filteredSessions = filteredSessions.filter((s) => s.element === element);
  }

  if (orixa) {
    filteredSessions = filteredSessions.filter((s) => s.orixa === orixa);
  }

  filteredSessions.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const total = filteredSessions.length;
  const paginatedSessions = filteredSessions.slice(offset, offset + limit);

  // Calculate spiritual stats
  const spiritualStats = {
    byCategory: filteredSessions.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySefirot: filteredSessions.reduce((acc, s) => {
      s.sefirot?.forEach((sf: string) => {
        acc[sf] = (acc[sf] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: filteredSessions.reduce((acc, s) => {
      const c = s.chakra;
      if (c) acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: filteredSessions.reduce((acc, s) => {
      const e = s.element;
      if (e) acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: filteredSessions.reduce((acc, s) => {
      const o = s.orixa;
      if (o) acc[o] = (acc[o] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const stats = {
    totalSessions: sessions.filter((s) => !userId || s.userId === userId).length,
    completedSessions: sessions.filter((s) => (!userId || s.userId === userId) && s.completed).length,
    totalMinutes: sessions
      .filter((s) => (!userId || s.userId === userId) && s.completed)
      .reduce((acc, s) => acc + s.duration, 0),
  };

  return NextResponse.json({
    sessions: paginatedSessions,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
    stats,
    spiritualCorrelations: SESSION_SPIRITUAL_CORRELATIONS,
    spiritualStats,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateSessionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { userId, meditationId, meditationName, duration, category, notes, sefirot, chakra, element, orixa } = parseResult.data;

    // Get spiritual correlations based on category
    const spiritualCorrelations = SESSION_SPIRITUAL_CORRELATIONS[category] || SESSION_SPIRITUAL_CORRELATIONS.mindfulness;

    const session: MeditationSession = {
      id: generateId(),
      userId,
      meditationId,
      meditationName,
      duration,
      startedAt: new Date().toISOString(),
      completed: false,
      notes,
      category,
      createdAt: new Date().toISOString(),
      sefirot: sefirot || (spiritualCorrelations.sefirot as MeditationSession['sefirot']),
      chakra: chakra ?? spiritualCorrelations.chakra,
      element: element ?? (spiritualCorrelations.element as MeditationSession['element']),
      orixa: orixa || spiritualCorrelations.orixa,
      frequency: spiritualCorrelations.frequency,
      affirmation: spiritualCorrelations.affirmation,
    };

    sessions.push(session);

    return NextResponse.json({
      success: true,
      session,
      spiritualCorrelations,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body.id;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'ID da sessão é obrigatório',
      }, { status: 400 });
    }

    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Sessão não encontrada',
      }, { status: 404 });
    }

    const session = sessions[sessionIndex];
    const updatedSession: MeditationSession = {
      ...session,
      ...body,
      endedAt: body.completed ? new Date().toISOString() : session.endedAt,
    };

    sessions[sessionIndex] = updatedSession;

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}