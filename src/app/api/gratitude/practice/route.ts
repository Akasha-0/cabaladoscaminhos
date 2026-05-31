import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const GratitudeTypeSchema = z.enum(['daily', 'manifestation', 'orixa', 'sephirot', 'journey']);
const GratitudeQuerySchema = z.object({
  type: GratitudeTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  includeRitual: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Gratitude Types ──────────────────────────────────────────
const GRATITUDE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  daily: {
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A gratidão diária abre as portas da abundância',
    frequency: '528 Hz',
  },
  manifestation: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Gratidão é o magnetismo que atrai a realidade desejada',
    frequency: '639 Hz',
  },
  orixa: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Agradeço aos orixás pela proteção constante',
    frequency: '417 Hz',
  },
  sephirot: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Sou grato pela sabedoria das Sephirot',
    frequency: '963 Hz',
  },
  journey: {
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Cada passo da jornada é uma bênção',
    frequency: '528 Hz',
  },
};

// ─── Practice Data ─────────────────────────────────────────────────────────
interface GratitudePractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  affirmations: string[];
  sefirot: string[];
  chakra: string;
  orixa?: string;
  ritual?: {
    duration: number;
    steps: string[];
    materials?: string[];
  };
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const GRATITUDE_PRACTICES: GratitudePractice[] = [
  {
    id: 'daily-morning',
    type: 'daily',
    name: 'Gratidão Matinal',
    nameEn: 'Morning Gratitude',
    description: 'Prática de gratidão para iniciar o dia com luz e energia positiva.',
    affirmations: [
      'Agradeço pela oportunidade de mais um dia de vida',
      'Hoje, escolho ver a beleza em tudo ao meu redor',
      'Sou grato pela energia que me sustenta',
    ],
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 'Anahata (4º)',
    ritual: {
      duration: 10,
      steps: [
        'Acorde e tome uma respiração profunda',
        'Agradeça mentalmente por 3 coisas',
        'Visualize seu dia iluminado',
        'Defina uma intenção de gratidão',
        'Sussurre palavras de agradecimento',
      ],
    },
    spiritualCorrelations: GRATITUDE_SPIRITUAL_CORRELATIONS['daily'],
  },
  {
    id: 'daily-evening',
    type: 'daily',
    name: 'Gratidão Vespertina',
    nameEn: 'Evening Gratitude',
    description: 'Reflexão noturna para fechar o dia com paz e reconhecimento.',
    affirmations: [
      'Agradeço por tudo que vivi hoje',
      'Libero o que não preciso mais',
      'Cada experiência me trouxe aprendizados',
    ],
    sefirot: ['Netzach', 'Yesod'],
    chakra: 'Anahata (4º)',
    ritual: {
      duration: 15,
      steps: [
        'Sente-se confortavelmente antes de dormir',
        'Reviva mentalmente o dia com gratidão',
        'Agradeça por cada aprendizado',
        'Perdoe-se por erros cometidos',
        'Solicite proteção para a noite',
      ],
    },
    spiritualCorrelations: GRATITUDE_SPIRITUAL_CORRELATIONS['daily'],
  },
  {
    id: 'manifestation-abundance',
    type: 'manifestation',
    name: 'Gratidão Manifestadora',
    nameEn: 'Manifestation Gratitude',
    description: 'Gratidão como ferramenta de manifestação da realidade desejada.',
    affirmations: [
      'Sou grato pela abundância que flui em minha vida',
      'Agradeço pelo que tenho e pelo que está por vir',
      'A gratidão atrai mais prosperidade',
    ],
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 'Ajna (6º)',
    spiritualCorrelations: GRATITUDE_SPIRITUAL_CORRELATIONS['manifestation'],
  },
  {
    id: 'orixa-oxum',
    type: 'orixa',
    name: 'Gratidão a Oxum',
    nameEn: 'Gratitude to Oxum',
    description: 'Prática de gratidão dedicada a Oxum, orixá das águas e do amor.',
    affirmations: [
      'Oxum, agradeço pelo seu amor e proteção',
      'Sou grato pelas águas que purificam minha vida',
      'A prosperidade flui através de mim como as águas do rio',
    ],
    sefirot: ['Chesed', 'Hod'],
    chakra: 'Svadhisthana (2º)',
    orixa: 'Oxum',
    spiritualCorrelations: GRATITUDE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'orixa-oxala',
    type: 'orixa',
    name: 'Gratidão a Oxalá',
    nameEn: 'Gratitude to Oxalá',
    description: 'Prática de gratidão dedicada a Oxalá, orixá da luz e da paz.',
    affirmations: [
      'Oxalá, agradeço pela luz que ilumina meu caminho',
      'Sou grato pela paz que habita em meu coração',
      'A luz divina me guia em cada passo',
    ],
    sefirot: ['Kether', 'Tipheret'],
    chakra: 'Sahasrara (7º)',
    orixa: 'Oxalá',
    spiritualCorrelations: GRATITUDE_SPIRITUAL_CORRELATIONS['sephirot'],
  },
  {
    id: 'sephirot-mercy',
    type: 'sephirot',
    name: 'Gratidão a Chesed',
    nameEn: 'Gratitude to Chesed',
    description: 'Prática de gratidão para o sefirá Chesed (Misericórdia).',
    affirmations: [
      'Agradeço pela misericórdia divina que me sustenta',
      'Chesed, sou grato pela sua graça infinita',
      'A bondade do universo me cerca',
    ],
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 'Anahata (4º)',
    spiritualCorrelations: GRATITUDE_SPIRITUAL_CORRELATIONS['journey'],
  },
  {
    id: 'journey-gratitude',
    type: 'journey',
    name: 'Gratidão da Jornada',
    nameEn: 'Journey Gratitude',
    description: 'Gratidão pelas lições e desafios do caminho espiritual.',
    affirmations: [
      'Sou grato por cada lição da jornada',
      'Os desafios me fortalecem',
      'Cada passo me aproxima da iluminação',
    ],
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 'Manipura (3º)',
    spiritualCorrelations: GRATITUDE_SPIRITUAL_CORRELATIONS['journey'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = GratitudeQuerySchema.safeParse({
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
      includeRitual: searchParams.get('includeRitual'),
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

    const { type, limit, includeRitual, sefirot, chakra, element, orixa } = parseResult.data;

    let practices = [...GRATITUDE_PRACTICES];

    if (type) {
      practices = practices.filter(p => p.type === type);
    }

    if (limit) {
      practices = practices.slice(0, limit);
    }

    if (sefirot) {
      practices = practices.filter(p => p.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      practices = practices.filter(p => p.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      practices = practices.filter(p => p.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      practices = practices.filter(p => p.spiritualCorrelations?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byType: practices.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: practices.reduce((acc, p) => {
        p.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: practices.reduce((acc, p) => {
        const c = p.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: practices.reduce((acc, p) => {
        const e = p.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: practices.reduce((acc, p) => {
        const o = p.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      practices,
      count: practices.length,
      spiritualCorrelations: GRATITUDE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, limit, includeRitual, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}