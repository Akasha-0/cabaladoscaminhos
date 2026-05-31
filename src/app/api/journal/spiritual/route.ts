import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

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

// GET /api/journal/spiritual - Retrieve all journal entries
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const { data, error } = await supabase
      .from('spiritual_journal')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Error fetching spiritual journal entries:', error);
      return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
    }
    const entries: JournalEntry[] = data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      content: item.content,
      mood: item.mood,
      theme: item.theme,
      insights: item.insights,
      gratitude: item.gratitude,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
    return NextResponse.json({ success: true, entries, count: entries.length });
  } catch (error) {
    console.error('Error in GET /api/journal/spiritual:', error);
    return NextResponse.json({ error: 'Erro ao processar diário espiritual' }, { status: 500 });
  }
}

// POST /api/journal/spiritual - Create a new journal entry
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const parseResult = JournalEntrySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { title, content, mood, theme, insights, gratitude } = parseResult.data;
    const { data, error: insertError } = await supabase
      .from('spiritual_journal')
      .insert({
        user_id: session.user.id,
        title,
        content: content || null,
        mood: mood || null,
        theme: theme || null,
        insights: insights || null,
        gratitude: gratitude || null,
      })
      .select()
      .single();
    if (insertError) {
      console.error('Error creating spiritual journal entry:', insertError);
      return NextResponse.json({ error: 'Erro ao criar entrada do diário espiritual' }, { status: 500 });
    }
    const entry: JournalEntry = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      content: data.content,
      mood: data.mood,
      theme: data.theme,
      insights: data.insights,
      gratitude: data.gratitude,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/journal/spiritual:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
