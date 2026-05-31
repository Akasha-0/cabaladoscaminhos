import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const HealthQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
});
const HealthEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  mood: z.string().optional(),
  energy: z.number().int().min(1).max(10).optional(),
  sleep: z.number().optional(),
  water: z.number().optional(),
  exercise: z.boolean().optional(),
  meditation: z.boolean().optional(),
  notes: z.string().optional(),
});
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
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = HealthQuerySchema.safeParse({
      date: searchParams.get('date'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { date } = parseResult.data;
    const entries = date
      ? healthData.filter((e) => e.date === date)
      : healthData;
    return NextResponse.json({
      entries,
      total: entries.length,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = HealthEntrySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const entry: HealthEntry = {
      id: crypto.randomUUID(),
      ...parseResult.data,
      createdAt: new Date().toISOString(),
    };
    healthData.push(entry);
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
