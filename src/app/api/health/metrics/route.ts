import { NextRequest, NextResponse } from 'next/server';

interface HealthMetric {
  id: string;
  date: string;
  metricType: string;
  value: number;
  unit?: string;
  source?: string;
  notes?: string;
  createdAt: string;
}

const metricsData: HealthMetric[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const type = searchParams.get('type');

  let entries = date
    ? metricsData.filter((e) => e.date === date)
    : metricsData;

  if (type) {
    entries = entries.filter((e) => e.metricType === type);
  }

  return NextResponse.json({
    entries,
    total: entries.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.date || !body.metricType || body.value === undefined) {
      return NextResponse.json(
        { error: 'Data, tipo de métrica e valor são obrigatórios' },
        { status: 400 }
      );
    }

    const metric: HealthMetric = {
      id: crypto.randomUUID(),
      date: body.date,
      metricType: body.metricType,
      value: body.value,
      unit: body.unit,
      source: body.source,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };

    metricsData.push(metric);

    return NextResponse.json({ metric }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
