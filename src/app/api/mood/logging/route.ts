import { NextRequest, NextResponse } from 'next/server';

interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  intensity?: number;
  emotions?: string[];
  notes?: string;
  tags?: string[];
  createdAt: string;
}

const moodData: MoodEntry[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');

  const entries = date
    ? moodData.filter((e) => e.date === date)
    : moodData;

  return NextResponse.json({
    entries,
    total: entries.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.date || !body.mood) {
      return NextResponse.json(
        { error: 'Data e humor são obrigatórios' },
        { status: 400 }
      );
    }

    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      date: body.date,
      mood: body.mood,
      intensity: body.intensity,
      emotions: body.emotions,
      notes: body.notes,
      tags: body.tags,
      createdAt: new Date().toISOString(),
    };

    moodData.push(entry);

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
