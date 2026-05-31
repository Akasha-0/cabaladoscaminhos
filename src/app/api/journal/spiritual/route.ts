import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const JournalEntrySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional().default(''),
  mood: z.enum(['joyful', 'peaceful', 'grateful', 'anxious', 'sad', 'angry', 'neutral']).optional(),
  theme: z.string().optional(),
  insights: z.string().optional(),
  gratitude: z.string().optional(),
});

interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  mood?: string;
  theme?: string;
  insights?: string;
  gratitude?: string;
  created_at: string;
  updated_at?: string;
}

const mockEntries: JournalEntry[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const entries = mockEntries.slice(0, limit);
    return NextResponse.json({ success: true, entries, count: entries.length });
  } catch (error) {
    console.error('Error in GET /api/journal/spiritual:', error);
    return NextResponse.json({ error: 'Erro ao processar diário espiritual' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = JournalEntrySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { title, content, mood, theme, insights, gratitude } = parseResult.data;
    const entry: JournalEntry = {
      id: `entry_${Date.now()}`,
      user_id: 'demo_user',
      title,
      content,
      mood,
      theme,
      insights,
      gratitude,
      created_at: new Date().toISOString(),
    };
    mockEntries.unshift(entry);
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/journal/spiritual:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
