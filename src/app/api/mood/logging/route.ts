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
  },
  {
    id: 'calmo',
    name: 'Calmo',
    namePt: 'Calmo',
    element: 'Água',
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    orixa: ['Oxalá', 'Iemanjá'],
    vibration: 8,
    description: 'Estado de serenidade que favorece práticas espirituais.',
    affirmations: ['Eu sou paz em todas as situações', 'A serenidade é meu estado natural'],
  },
  {
    id: 'esperancoso',
    name: 'Esperançoso',
    namePt: 'Esperançoso',
    element: 'Fogo',
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    orixa: ['Oxum', 'Oxalá'],
    vibration: 7,
    description: 'Estado de abertura para possibilidades futuras.',
    affirmations: ['O futuro traz experiências maravilhosas', 'Confio no plano divino para minha vida'],
  },
  {
    id: 'grato',
    name: 'Grato',
    namePt: 'Grato',
    element: 'Fogo',
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    orixa: ['Oxum', 'Iemanjá'],
    vibration: 9,
    description: 'Estado de gratidão que multiplica bênçãos e eleva a consciência.',
    affirmations: ['Sou grato por todas as bênçãos', 'A gratidão abre portas para mais abundância'],
  },
  {
    id: 'confuso',
    name: 'Confuso',
    namePt: 'Confuso',
    element: 'Ar',
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    orixa: ['Orunmilá', 'Oxalá'],
    vibration: 4,
    description: 'Estado de indefinição que pode indicar necessidade de consulta espiritual.',
    affirmations: ['Clareio minha mente com luz divina', 'A sabedoria certa surge no momento certo'],
  },
  {
    id: 'energizado',
    name: 'Energizado',
    namePt: 'Energizado',
    element: 'Fogo',
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    orixa: ['Ogum', 'Xangô'],
    vibration: 8,
    description: 'Estado de alta energia que favorece ação e conquista.',
    affirmations: ['Canalizo minha energia para propósitos elevados', 'Minha energia serve à luz'],
  },
  {
    id: 'exausto',
    name: 'Exausto',
    namePt: 'Exausto',
    element: 'Terra',
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    orixa: ['Omolu', 'Iemanjá'],
    vibration: 3,
    description: 'Estado de baixa energia que requer descanso e regeneração.',
    affirmations: ['Permito que meu corpo descanse e se regenera', 'Aceito o descanso como necessidade sagrada'],
  },
  {
    id: 'amoroso',
    name: 'Amoroso',
    namePt: 'Amoroso',
    element: 'Fogo',
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    orixa: ['Oxum', 'Iemanjá'],
    vibration: 10,
    description: 'Estado de amor incondicional que é a frequência mais alta.',
    affirmations: ['Eu sou amor', 'O amor flui através de mim sem limites'],
  },
  {
    id: 'medroso',
    name: 'Medroso',
    namePt: 'Medroso',
    element: 'Água',
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    orixa: ['Ogum', 'Oxalá'],
    vibration: 3,
    description: 'Estado de medo que pode indicar proteção necessária ou insight deancestral.',
    affirmations: ['Sou protegido por forças светлые', 'O medo não tem poder sobre mim'],
 },
];

// ─── Emotion Correlations ──────────────────────────────────────────────
const EMOTION_CORRELATIONS: Record<string, { sefirot: string[], chakra: number, element: string, orixa: string[] }> = {
  'alegria': { sefirot: ['Tipheret', 'Netzach'], chakra: 4, element: 'Fogo', orixa: ['Oxum', 'Iansã'] },
  'tristeza': { sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: ['Iemanjá', 'Oxum'] },
  'raiva': { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: ['Xangô', 'Ogum'] },
  'medo': { sefirot: ['Gevurah', 'Malkuth'], chakra: 1, element: 'Terra', orixa: ['Ogum', 'Oxalá'] },
  'amor': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: ['Oxum', 'Iemanjá'] },
  'ansiedade': { sefirot: ['Hod', 'Gevurah'], chakra: 5, element: 'Ar', orixa: ['Ogum', 'Oxalá'] },
  'paz': { sefirot: ['Chesed', 'Tipheret'], chakra: 4, element: 'Água', orixa: ['Oxalá', 'Iemanjá'] },
  'frustracao': { sefirot: ['Hod', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: ['Xangô', 'Ogum'] },
  'esperanca': { sefirot: ['Chokhmah', 'Netzach'], chakra: 6, element: 'Fogo', orixa: ['Oxum', 'Oxalá'] },
  'gratidao': { sefirot: ['Chesed', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: ['Oxum', 'Iemanjá'] },
  'culpa': { sefirot: ['Gevurah', 'Malkuth'], chakra: 2, element: 'Terra', orixa: ['Omolu', 'Oxalá'] },
  'vergonha': { sefirot: ['Hod', 'Malkuth'], chakra: 3, element: 'Terra', orixa: ['Oxalá', 'Ogum'] },
  'inveja': { sefirot: ['Hod', 'Gevurah'], chakra: 4, element: 'Fogo', orixa: ['Exu', 'Xangô'] },
  'orgulho': { sefirot: ['Gevurah', 'Hod'], chakra: 3, element: 'Fogo', orixa: ['Ogum', 'Xangô'] },
  'surpresa': { sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', orixa: ['Orunmilá'] },
  'desprezo': { sefirot: ['Gevurah', 'Hod'], chakra: 5, element: 'Fogo', orixa: ['Exu', 'Ogum'] },
  'interesse': { sefirot: ['Chokhmah', 'Netzach'], chakra: 5, element: 'Ar', orixa: ['Orunmilá', 'Oxum'] },
  'nojo': { sefirot: ['Malkuth', 'Hod'], chakra: 3, element: 'Terra', orixa: ['Omolu', 'Iemanjá'] },
};

// ─── Mood Data Store ──────────────────────────────────────────────────────
interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  intensity?: number;
  emotions?: string[];
  notes?: string;
  tags?: string[];
  createdAt: string;
  sefirot?: string[];
  chakra?: number;
  element?: string;
 orixa?: string[];
}

const moodData: MoodEntry[] = [];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();

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

    let entries = [...moodData];

    // Filter by date
    if (date) {
      entries = entries.filter((e) => e.date === date);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      entries = entries.filter(e => e.sefirot?.includes(sefirot));
    }
    if (chakra) {
      entries = entries.filter(e => e.chakra === chakra);
    }
    if (element) {
      entries = entries.filter(e => e.element === element);
    }
    if (orixa) {
      entries = entries.filter(e => e.orixa?.some(o => o.toLowerCase().includes(orixa.toLowerCase())));
    }

    // Statistics
    const stats = {
      byMood: moodData.reduce((acc, e) => {
        acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: moodData.reduce((acc, e) => {
        if (e.element) {
          acc[e.element] = (acc[e.element] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      byChakra: moodData.reduce((acc, e) => {
        if (e.chakra) {
          acc[e.chakra] = (acc[e.chakra] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>),
      totalEntries: moodData.length,
    };

    return NextResponse.json({
      success: true,
      entries,
      total: entries.length,
      moodTypes: MOOD_TYPES,
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
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

    const { date, mood, intensity, emotions, notes, tags, sefirot, chakra, element } = parseResult.data;

    // Find mood type correlations
    const moodType = MOOD_TYPES.find(m => m.id === mood.toLowerCase() || m.namePt.toLowerCase() === mood.toLowerCase());

    // Calculate emotion correlations
    let emotionSefirot: string[] = [];
    let emotionChakra: number | undefined;
    let emotionElement: string | undefined;
    let emotionOrixa: string[] = [];

    if (emotions && emotions.length > 0) {
      emotions.forEach(emotion => {
        const corr = EMOTION_CORRELATIONS[emotion.toLowerCase()];
        if (corr) {
          emotionSefirot = [...new Set([...emotionSefirot, ...corr.sefirot])];
          emotionChakra = emotionChakra || corr.chakra;
          emotionElement = emotionElement || corr.element;
          emotionOrixa = [...new Set([...emotionOrixa, ...corr.orixa])];
        }
      });
    }

    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      date,
      mood,
      intensity,
      emotions,
      notes,
      tags,
      createdAt: new Date().toISOString(),
      sefirot: sefirot || moodType?.sefirot || emotionSefirot,
      chakra: chakra || moodType?.chakra || emotionChakra,
      element: element || moodType?.element || emotionElement,
      orixa: moodType?.orixa || emotionOrixa,
    };

    moodData.push(entry);

    return NextResponse.json({
      success: true,
      entry,
      spiritualCorrelations: {
        sefirot: entry.sefirot,
        chakra: entry.chakra,
        element: entry.element,
        orixa: entry.orixa,
        moodVibration: moodType?.vibration,
      },
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}