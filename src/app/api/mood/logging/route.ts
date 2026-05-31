import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const MoodQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const MoodEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  mood: z.string().min(1, 'Humor é obrigatório'),
  intensity: z.number().int().min(1).max(10).optional(),
  emotions: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Spiritual Correlations for Mood Types ──────────────────────────────────────────
const MOOD_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  alegre: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Eu irradio alegria e luz',
    frequency: '528 Hz',
  },
  triste: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Permito que a tristeza flua e libere',
    frequency: '417 Hz',
  },
  ansioso: {
    sefirot: ['Hod', 'Gevurah'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Ogum',
    affirmation: 'Eu respiro com calma e confiança',
    frequency: '741 Hz',
  },
  irritado: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'Transformo a irritação em força positiva',
    frequency: '528 Hz',
  },
  calmo: {
    sefirot: ['Binah', 'Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A paz interior me sustenta',
    frequency: '963 Hz',
  },
  esperancoso: {
    sefirot: ['Chokhmah', 'Chesed'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A esperança ilumina meu caminho',
    frequency: '528 Hz',
  },
  grato: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Gratidão abre as portas da abundância',
    frequency: '528 Hz',
  },
  energizado: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A energia flui através de mim',
    frequency: '528 Hz',
  },
};

// ─── Mood Types with Spiritual Correlations ──────────────────────────────────────────
const MOOD_TYPES = [
  {
    id: 'alegre',
    name: 'Alegre',
    namePt: 'Alegre',
    element: 'Fogo',
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    orixa: ['Oxum', 'Iansã'],
    vibration: 9,
    description: 'Estado de alegria e entusiasmo que eleva a frequência vibracional.',
    affirmations: ['Eu irradio alegria e luz', 'A felicidade flui através de mim'],
    spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS['alegre'],
  },
  {
    id: 'triste',
    name: 'Triste',
    namePt: 'Triste',
    element: 'Água',
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    orixa: ['Iemanjá', 'Oxum'],
    vibration: 4,
    description: 'Estado de tristeza que permite cura e limpeza emocional.',
    affirmations: ['Permito que a tristeza flua e libere', 'A dor é passageira e traz sabedoria'],
    spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS['triste'],
  },
  {
    id: 'ansioso',
    name: 'Ansioso',
    namePt: 'Ansioso',
    element: 'Ar',
    sefirot: ['Hod', 'Gevurah'],
    chakra: 5,
    orixa: ['Ogum', 'Oxalá'],
    vibration: 5,
    description: 'Estado de inquietação mental que requer ancoramento.',
    affirmations: ['Eu respiro com calma e confiança', 'Estabeleço paz em minha mente'],
    spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS['ansioso'],
  },
  {
    id: 'irritado',
    name: 'Irritado',
    namePt: 'Irritado',
    element: 'Fogo',
    sefirot: ['Gevurah'],
    chakra: 3,
    orixa: ['Xangô', 'Ogum'],
    vibration: 5,
    description: 'Estado de tensão que pode indicar necessidade de purificação.',
    affirmations: ['Transformo a irritação em força positiva', 'Libero a tensão e abraço a paz'],
    spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS['irritado'],
  },
  {
    id: 'calmo',
    name: 'Calmo',
    namePt: 'Calmo',
    element: 'Éter',
    sefirot: ['Binah', 'Kether'],
    chakra: 7,
    orixa: ['Oxalá'],
    vibration: 8,
    description: 'Estado de paz interior e serenidade espiritual.',
    affirmations: ['A paz interior me sustenta', 'Sou um canal de calma divina'],
    spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS['calmo'],
  },
  {
    id: 'esperancoso',
    name: 'Esperançoso',
    namePt: 'Esperançoso',
    element: 'Fogo',
    sefirot: ['Chokhmah', 'Chesed'],
    chakra: 6,
    orixa: ['Oxum'],
    vibration: 7,
    description: 'Estado de esperança e otimismo em relação ao futuro.',
    affirmations: ['A esperança ilumina meu caminho', 'O futuro traz bênçãos'],
    spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS['esperancoso'],
  },
  {
    id: 'grato',
    name: 'Grato',
    namePt: 'Grato',
    element: 'Fogo',
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    orixa: ['Oxum'],
    vibration: 8,
    description: 'Estado de gratidão que atrai abundância e boas energias.',
    affirmations: ['Gratidão abre as portas da abundância', 'Sou grato por tudo em minha vida'],
    spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS['grato'],
  },
  {
    id: 'energizado',
    name: 'Energizado',
    namePt: 'Energizado',
    element: 'Fogo',
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    orixa: ['Ogum'],
    vibration: 8,
    description: 'Estado de alta energia e motivação para ação.',
    affirmations: ['A energia flui através de mim', 'Tenho força para conquistar'],
    spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS['energizado'],
  },
];

// In-memory mood entries (would be database in production)
const moodEntries: Array<{
  id: string;
  date: string;
  mood: string;
  intensity?: number;
  emotions?: string[];
  notes?: string;
  tags?: string[];
  createdAt: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}> = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = MoodQuerySchema.safeParse({
      date: searchParams.get('date'),
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

    const { date, sefirot, chakra, element, orixa } = parseResult.data;
    let entries = [...moodEntries];

    if (date) {
      entries = entries.filter(e => e.date === date);
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

    // Calculate spiritual stats
    const spiritualStats = {
      byMood: entries.reduce((acc, e) => {
        acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgIntensity: entries.reduce((sum, e) => sum + (e.intensity || 0), 0) / (entries.length || 1),
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
      moodTypes: MOOD_TYPES,
      count: entries.length,
      spiritualCorrelations: MOOD_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { date, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = MoodEntrySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { date, mood, intensity, emotions, notes, tags } = parseResult.data;

    // Find mood type correlations
    const moodType = MOOD_TYPES.find(m => m.id === mood);
    const spiritualCorrelations = moodType?.spiritualCorrelations || MOOD_SPIRITUAL_CORRELATIONS['calmo'];

    const entry = {
      id: crypto.randomUUID(),
      date,
      mood,
      intensity,
      emotions,
      notes,
      tags,
      createdAt: new Date().toISOString(),
      spiritualCorrelations,
    };

    moodEntries.push(entry);

    return NextResponse.json({
      success: true,
      entry,
      spiritualCorrelations,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}