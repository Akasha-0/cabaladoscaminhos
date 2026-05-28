import { NextRequest, NextResponse } from 'next/server';

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
}

const healthData: HealthEntry[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');

  const entries = date
    ? healthData.filter((e) => e.date === date)
    : healthData;

  return NextResponse.json({
    entries,
    total: entries.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.date) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      );
    }

    const entry: HealthEntry = {
      id: crypto.randomUUID(),
      date: body.date,
      mood: body.mood,
      energy: body.energy,
      sleep: body.sleep,
      water: body.water,
      exercise: body.exercise,
      meditation: body.meditation,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };

    healthData.push(entry);

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
