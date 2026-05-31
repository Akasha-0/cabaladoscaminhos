import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ShadowWorkCategorySchema = z.enum(['integration', 'inner-child', 'triggers', 'patterns', 'projections']);

const ShadowWorkQuerySchema = z.object({
  category: ShadowWorkCategorySchema.optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const ShadowWorkPracticeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: ShadowWorkCategorySchema,
  duration: z.string(),
  steps: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const ShadowWorkResponseSchema = z.object({
  success: z.boolean(),
  practices: z.array(ShadowWorkPracticeSchema),
  categories: z.array(z.object({
    name: ShadowWorkCategorySchema,
    description: z.string(),
    weight: z.number(),
    spiritualCorrelations: z.object({
      sefirot: z.array(z.string()),
      chakra: z.number(),
      element: z.string(),
      orixa: z.string(),
      affirmation: z.string(),
    }),
 })),
  spiritualStats: z.object({
    bySefirot: z.record(z.string(), z.number()),
    byChakra: z.record(z.string(), z.number()),
    byElement: z.record(z.string(), z.number()),
    byOrixa: z.record(z.string(), z.number()),
  }).optional(),
});

// ─── Spiritual Correlations for Shadow Work Categories ──────────────────────────────────────────
const SHADOW_WORK_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  integration: {
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'Integro todas as partes de mim em harmonia',
    frequency: '396 Hz',
  },
  'inner-child': {
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Honro e cuido da minha criança interior',
    frequency: '528 Hz',
  },
  triggers: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Reconheço meus gatilhos com compaixão',
    frequency: '741 Hz',
  },
  patterns: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Quebro padrões que não me servem',
    frequency: '174 Hz',
  },
  projections: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Oxalá',
    affirmation: 'Percebo minhas projeções com clareza',
    frequency: '639 Hz',
  },
};

// ─── Shadow work practices data with spiritual correlations ──────────────────────────────────────────
const SHADOW_WORK_PRACTICES: z.infer<typeof ShadowWorkPracticeSchema>[] = [
  {
    id: 'shadow-dialogue',
    name: 'Diálogo com a Sombra',
    description: 'Internal conversation with rejected aspects of self',
    category: 'integration',
    duration: '20-30 minutos',
    steps: [
      'Find a quiet space and center yourself',
      'Identify a rejected trait you want to explore',
      'Write a dialogue between yourself and that aspect',
      'Allow the shadow part to express itself freely',
      'Thank the aspect and integrate insights',
    ],
    warnings: ['May bring up intense emotions', 'Best done with professional support if trauma is present'],
    spiritualCorrelations: {
      sefirot: ['Gevurah', 'Tipheret'],
      chakra: 3,
      element: 'Fogo',
      orixa: 'Xangô',
      affirmation: 'Encontro luz nas minhas sombras',
      frequency: '396 Hz',
    },
  },
  {
    id: 'inner-child-healing',
    name: 'Cura da Criança Interior',
    description: 'Healing wounds from childhood by reconnecting with younger self',
    category: 'inner-child',
    duration: '30-45 minutos',
    steps: [
      'Visualize yourself at age 5-7',
      'Notice any wounds or unmet needs',
      'Speak to your inner child with compassion',
      'Offer the love and protection they needed',
      'Create a ritual of reparenting',
    ],
    spiritualCorrelations: {
      sefirot: ['Chesed', 'Tipheret'],
      chakra: 4,
      element: 'Água',
      orixa: 'Iemanjá',
      affirmation: 'A criança interior está segura e amada',
      frequency: '528 Hz',
    },
  },
  {
    id: 'trigger-identification',
    name: 'Identificação de Gatilhos',
    description: 'Mapping emotional triggers to uncover shadow patterns',
    category: 'triggers',
    duration: '15-20 minutos',
    steps: [
      'Notice when you feel strongly reactive',
      'Name the emotion without judgment',
      'Trace the reaction back to its origin',
      'Ask: what belief or wound does this trigger?',
      'Document patterns over time',
    ],
    spiritualCorrelations: {
      sefirot: ['Hod', 'Netzach'],
      chakra: 5,
      element: 'Ar',
      orixa: 'Orunmilá',
      affirmation: 'Compreendo a origem dos meus gatilhos',
      frequency: '741 Hz',
    },
  },
  {
    id: 'pattern-interruption',
    name: 'Interrupção de Padrões',
    description: 'Breaking unconscious behavioral patterns tied to shadow material',
    category: 'patterns',
    duration: ' ongoing practice',
    steps: [
      'Identify a recurring pattern that no longer serves',
      'Notice the trigger that initiates the pattern',
      'Choose an alternative response in advance',
      'Practice the new response when triggered',
      'Celebrate each successful interruption',
    ],
    spiritualCorrelations: {
      sefirot: ['Malkuth', 'Yesod'],
      chakra: 1,
      element: 'Terra',
      orixa: 'Ogum',
      affirmation: 'Tenho força para quebrar padrões antigos',
      frequency: '174 Hz',
    },
  },
  {
    id: 'projection-recognition',
    name: 'Reconhecimento de Projeções',
    description: 'Identifying when we attribute our own traits to others',
    category: 'projections',
    duration: '15-25 minutos',
    steps: [
      'Notice strong emotional reactions to others',
      'Ask: what part of myself might I be seeing in them?',
      'Write down the trait you are reacting to',
      'Turn the trait inward: how do I embody this?',
      'Accept the trait as part of your whole self',
    ],
    spiritualCorrelations: {
      sefirot: ['Binah', 'Chokhmah'],
      chakra: 6,
      element: 'Água',
      orixa: 'Oxalá',
      affirmation: 'Percebo minhas projeções com sabedoria',
      frequency: '639 Hz',
    },
  },
  {
    id: 'shadow-acceptance-ritual',
    name: 'Ritual de Aceitação da Sombra',
    description: 'Formal ritual to honor and integrate shadow aspects',
    category: 'integration',
    duration: '30-45 minutos',
    steps: [
      'Light a black or dark candle',
      'Speak aloud aspects of yourself you reject',
      'Thank each aspect for its protection',
      'Visualize integrating each into your whole self',
      'Extinguish candle with gratitude',
    ],
    spiritualCorrelations: {
      sefirot: ['Gevurah', 'Tipheret', 'Malkuth'],
      chakra: 3,
      element: 'Fogo',
      orixa: 'Xangô',
      affirmation: 'Aceito todas as partes de mim com amor',
      frequency: '396 Hz',
    },
  },
  {
    id: 'wound-work',
    name: 'Trabalho com Feridas',
    description: 'Deep processing of core wounds that shape shadow material',
    category: 'inner-child',
    duration: '45-60 minutos',
    steps: [
      'Identify a core wound (abandonment, betrayal, etc.)',
      'Trace its origin to a specific childhood event',
      'Feel the emotion without suppression',
      'Offer your adult self the protection the child needed',
      'Create a new narrative of healing',
    ],
    spiritualCorrelations: {
      sefirot: ['Chesed', 'Gevurah'],
      chakra: 4,
      element: 'Água',
      orixa: 'Iemanjá',
      affirmation: 'A cura flui através das minhas feridas',
      frequency: '528 Hz',
    },
  },
  {
    id: 'shadow-mirror',
    name: 'Espelho da Sombra',
    description: 'Using others as mirrors to see our shadow',
    category: 'projections',
    duration: '20-30 minutos',
    steps: [
      'Identify someone who triggers strong reactions',
      'List the qualities that bother you about them',
      'Ask: which of these do I reject in myself?',
      'Find evidence of these qualities in your own life',
      'Practice accepting this aspect',
    ],
    spiritualCorrelations: {
      sefirot: ['Binah', 'Tipheret'],
      chakra: 6,
      element: 'Água',
      orixa: 'Oxalá',
      affirmation: 'Os outros são meus espelhos sagrados',
      frequency: '639 Hz',
    },
  },
];

// ─── Category definitions with spiritual correlations ──────────────────────────────────────────
const SHADOW_WORK_CATEGORIES = [
  {
    name: 'integration' as const,
    description: 'Integration of shadow aspects into conscious self',
    weight: 5,
    spiritualCorrelations: SHADOW_WORK_SPIRITUAL_CORRELATIONS['integration'],
  },
  {
    name: 'inner-child' as const,
    description: 'Healing wounds from childhood',
    weight: 4,
    spiritualCorrelations: SHADOW_WORK_SPIRITUAL_CORRELATIONS['inner-child'],
  },
  {
    name: 'triggers' as const,
    description: 'Identifying and understanding emotional triggers',
    weight: 3,
    spiritualCorrelations: SHADOW_WORK_SPIRITUAL_CORRELATIONS['triggers'],
  },
  {
    name: 'patterns' as const,
    description: 'Breaking unconscious behavioral patterns',
    weight: 4,
    spiritualCorrelations: SHADOW_WORK_SPIRITUAL_CORRELATIONS['patterns'],
  },
  {
    name: 'projections' as const,
    description: 'Recognizing when we project shadow onto others',
    weight: 3,
    spiritualCorrelations: SHADOW_WORK_SPIRITUAL_CORRELATIONS['projections'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = ShadowWorkQuerySchema.safeParse({
      category: searchParams.get('category'),
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

    const { category, sefirot, chakra, element, orixa } = parseResult.data;

    // Filter practices
    let practices = [...SHADOW_WORK_PRACTICES];

    if (category) {
      practices = practices.filter(p => p.category === category);
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
      categories: SHADOW_WORK_CATEGORIES,
      spiritualCorrelations: SHADOW_WORK_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        total: practices.length,
        filters: { category, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}