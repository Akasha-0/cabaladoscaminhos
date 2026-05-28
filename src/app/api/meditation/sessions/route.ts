import { NextRequest, NextResponse } from 'next/server';

export interface MeditationSession {
  id: string;
  userId: string;
  meditationId?: string;
  meditationName: string;
  duration: number;
  startedAt: string;
  endedAt?: string;
  completed: boolean;
  notes?: string;
  category: string;
  createdAt: string;
}

const sessions: MeditationSession[] = [];

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const sessionId = searchParams.get('id');
  const category = searchParams.get('category');
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

  filteredSessions.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const total = filteredSessions.length;
  const paginatedSessions = filteredSessions.slice(offset, offset + limit);

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
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      meditationId,
      meditationName,
      duration,
      category = 'general',
      notes,
    } = body;

    if (!userId || !meditationName || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, meditationName, duration' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const session: MeditationSession = {
      id: generateId(),
      userId,
      meditationId,
      meditationName,
      duration: parseInt(duration, 10),
      startedAt: body.startedAt || now,
      endedAt: body.endedAt,
      completed: body.completed ?? false,
      notes,
      category,
      createdAt: now,
    };

    sessions.push(session);

    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
