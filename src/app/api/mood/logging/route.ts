import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const MoodQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
});
const MoodEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  mood: z.string().min(1, 'Humor é obrigatório'),
  intensity: z.number().int().min(1).max(10).optional(),
  emotions: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
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
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = MoodQuerySchema.safeParse({
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
      ? moodData.filter((e) => e.date === date)
      : moodData;
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
    const parseResult = MoodEntrySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      ...parseResult.data,
      createdAt: new Date().toISOString(),
    };
    moodData.push(entry);
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
