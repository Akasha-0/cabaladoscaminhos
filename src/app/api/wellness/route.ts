import { NextRequest, NextResponse } from 'next/server';

interface WellnessEntry {
  id: string;
  type: 'meditation' | 'breathing' | 'gratitude' | 'journaling' | 'exercise';
  duration?: number;
  notes?: string;
  createdAt: string;
}

const wellnessData: WellnessEntry[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  const entries = type
    ? wellnessData.filter((e) => e.type === type)
    : wellnessData;

  return NextResponse.json({
    entries,
    total: entries.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !['meditation', 'breathing', 'gratitude', 'journaling', 'exercise'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Use: meditation, breathing, gratitude, journaling, exercise' },
        { status: 400 }
      );
    }

    const entry: WellnessEntry = {
      id: crypto.randomUUID(),
      type: body.type,
      duration: body.duration,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };

    wellnessData.push(entry);

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
