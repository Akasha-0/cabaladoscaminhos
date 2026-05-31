import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const WellnessTypeSchema = z.enum(['meditation', 'breathing', 'gratitude', 'journaling', 'exercise']);
const WellnessQuerySchema = z.object({
  type: WellnessTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
const CreateWellnessSchema = z.object({
  type: WellnessTypeSchema,
  duration: z.number().int().positive().optional(),
  notes: z.string().optional(),
  mood: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
});
interface WellnessEntry {
  id: string;
  type: 'meditation' | 'breathing' | 'gratitude' | 'journaling' | 'exercise';
  duration?: number;
  notes?: string;
  createdAt: string;
  mood?: number;
  energy?: number;
}
const wellnessData: WellnessEntry[] = [];
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = WellnessQuerySchema.safeParse({
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type, limit, startDate, endDate } = parseResult.data;
    let entries = [...wellnessData];
    if (type) {
      entries = entries.filter((e) => e.type === type);
    }
    if (startDate) {
      const start = new Date(startDate);
      entries = entries.filter(e => new Date(e.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      entries = entries.filter(e => new Date(e.createdAt) <= end);
    }
    if (limit) {
      entries = entries.slice(0, limit);
    }
    return NextResponse.json({
      entries,
      total: entries.length,
      filters: { type, startDate, endDate },
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateWellnessSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const entry: WellnessEntry = {
      id: crypto.randomUUID(),
      type: parseResult.data.type,
      duration: parseResult.data.duration,
      notes: parseResult.data.notes,
      mood: parseResult.data.mood,
      energy: parseResult.data.energy,
      createdAt: new Date().toISOString(),
    };
    wellnessData.push(entry);
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
