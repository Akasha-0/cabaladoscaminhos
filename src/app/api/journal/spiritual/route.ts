import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const JournalEntrySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional().default(''),
  mood: z.enum(['joyful', 'peaceful', 'grateful', 'anxious', 'sad', 'angry', 'neutral']).optional(),
  theme: z.string().optional(),
  insights: z.string().optional(),
  gratitude: z.string().optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const JournalQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  mood: z.enum(['joyful', 'peaceful', 'grateful', 'anxious', 'sad', 'angry', 'neutral']).optional(),
  theme: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
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
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
  created_at: string;
  updated_at?: string;
}

// ─── Spiritual Correlations for Journal Moods ──────────────────────────────────────────
const MOOD_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  joyful: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Alegria irradia do meu ser',
    frequency: '528 Hz',
  },
  peaceful: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Oxalá',
    affirmation: 'Paz profunda habita em mim',
    frequency: '639 Hz',
  },
  grateful: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Gratidão transforma minha realidade',
    frequency: '528 Hz',
  },
  anxious: {
    sefirot: ['Gevurah', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Libero a ansiedade e abraço a confiança',
    frequency: '741 Hz',
  },
  sad: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A tristeza é passageira, a luz permanece',
    frequency: '285 Hz',
  },
  angry: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'Transformo a raiva em força justa',
    frequency: '396 Hz',
  },
  neutral: {
    sefirot: ['Tipheret', 'Malkuth'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'Minha mente está em equilíbrio',
    frequency: '741 Hz',
  },
};

const mockEntries: JournalEntry[] = [];

// fallow-ignore-next-line complexity
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parseResult = JournalQuerySchema.safeParse({
      limit: searchParams.get('limit'),
      mood: searchParams.get('mood'),
      theme: searchParams.get('theme'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { limit, mood, theme, sefirot, chakra, element, orixa } = parseResult.data;

    let entries = [...mockEntries];

    if (mood) {
      entries = entries.filter(e => e.mood === mood);
    }

    if (theme) {
      entries = entries.filter(e => e.theme?.toLowerCase().includes(theme.toLowerCase()));
    }

    if (sefirot) {
      entries = entries.filter(e => e.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      entries = entries.filter(e => e.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      entries = entries.filter(e => e.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      entries = entries.filter(e => e.spiritualCorrelations?.orixa === orixa);
    }

    if (limit && entries.length > limit) {
      entries = entries.slice(0, limit);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byMood: entries.reduce((acc, e) => {
        if (e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: entries.reduce((acc, e) => {
        e.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: entries.reduce((acc, e) => {
        const c = e.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: entries.reduce((acc, e) => {
        const el = e.spiritualCorrelations?.element;
        if (el) acc[el] = (acc[el] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: entries.reduce((acc, e) => {
        const o = e.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length,
      spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { limit, mood, theme, sefirot, chakra, element, orixa },
      },
    });
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
        success: false,
        error: 'Invalid request',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { title, content, mood, theme, insights, gratitude } = parseResult.data;

    const moodCorr = mood ? MOOD_SPIRITUAL_CORRELATIONS[mood] : MOOD_SPIRITUAL_CORRELATIONS['neutral'];

    const entry: JournalEntry = {
      id: `entry_${Date.now()}`,
      user_id: 'demo_user',
      title,
      content,
      mood,
      theme,
      insights,
      gratitude,
      spiritualCorrelations: moodCorr,
      created_at: new Date().toISOString(),
    };
    mockEntries.unshift(entry);
    return NextResponse.json({
      success: true,
      entry,
      spiritualCorrelations: moodCorr,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/journal/spiritual:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}