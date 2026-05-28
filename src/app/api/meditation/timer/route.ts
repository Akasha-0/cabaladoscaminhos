import { NextRequest, NextResponse } from 'next/server';

export interface MeditationTimer {
  id: string;
  meditationId?: string;
  meditationName: string;
  targetSeconds: number;
  elapsedSeconds: number;
  status: 'running' | 'paused' | 'completed' | 'cancelled';
  startedAt: string;
  pausedAt?: string;
  endedAt?: string;
  userId?: string;
}

// In-memory store (replace with DB in production)
const timers: Map<string, MeditationTimer> = new Map();

function generateId(): string {
  return `mt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');

  if (id) {
    const timer = timers.get(id);
    if (!timer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }
    return NextResponse.json(timer);
  }

  let allTimers = Array.from(timers.values());

  if (userId) {
    allTimers = allTimers.filter(t => t.userId === userId);
  }

  if (status) {
    allTimers = allTimers.filter(t => t.status === status);
  }

  // Sort by most recent first
  allTimers.sort((a, b) =>
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return NextResponse.json({ timers: allTimers });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { meditationId, meditationName, targetSeconds, userId } = body;

  if (!targetSeconds || typeof targetSeconds !== 'number' || targetSeconds <= 0) {
    return NextResponse.json(
      { error: 'targetSeconds must be a positive number' },
      { status: 400 }
    );
  }

  const id = generateId();

  const timer: MeditationTimer = {
    id,
    meditationId: meditationId || undefined,
    meditationName: meditationName || 'Meditation',
    targetSeconds,
    elapsedSeconds: 0,
    status: 'running',
    startedAt: new Date().toISOString(),
    userId: userId || undefined,
  };

  timers.set(id, timer);

  // Auto-complete after targetSeconds
  setTimeout(() => {
    const t = timers.get(id);
    if (t && t.status === 'running') {
      t.status = 'completed';
      t.elapsedSeconds = t.targetSeconds;
      t.endedAt = new Date().toISOString();
    }
  }, targetSeconds * 1000);

  return NextResponse.json(timer, { status: 201 });
}