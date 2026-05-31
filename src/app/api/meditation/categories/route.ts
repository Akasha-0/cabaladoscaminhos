import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const MeditationCategoriesQuerySchema = z.object({
  id: z.string().optional(),
  popular: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Meditation Categories ──────────────────────────────────────────
const CATEGORY_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  focused: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Minha mente está clara e focada',
    frequency: '528 Hz',
  },
  breathing: {
    sefirot: ['Binah', 'Kether'],
    chakra: 4,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A respiração me ancora no presente',
    frequency: '417 Hz',
  },
  'body-scan': {
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Aceito e honro cada parte de meu corpo',
    frequency: '396 Hz',
  },
  visualization: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Eu crio minha realidade com clareza',
    frequency: '741 Hz',
  },
  sleep: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Iemanjá',
    affirmation: 'Entrego meu sono à luz divina',
    frequency: '285 Hz',
  },
  focus: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Minha concentração é poderosa',
    frequency: '528 Hz',
  },
  compassion: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Amor e compaixão fluem através de mim',
    frequency: '528 Hz',
  },
  mindfulness: {
    sefirot: ['Binah', 'Tipheret'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Estou presente neste momento',
    frequency: '639 Hz',
  },
  gratitude: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Sou grato por todas as bênçãos',
    frequency: '528 Hz',
  },
};

export interface MeditationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  meditationCount: number;
  popular: boolean;
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const categories: MeditationCategory[] = [
  {
    id: 'focused',
    name: 'Focused Attention',
    description: 'Cultivate deep concentration and mindfulness',
    icon: 'target',
    color: '#8b5cf6',
    meditationCount: 24,
    popular: true,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS.focused.sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS.focused.chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS.focused.element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS.focused.orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS.focused.affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS.focused.frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.focused,
  },
  {
    id: 'breathing',
    name: 'Breathing Exercises',
    icon: 'wind',
    description: 'Focused breathing techniques for stress relief',
    color: '#3b82f6',
    meditationCount: 18,
    popular: true,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS.breathing.sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS.breathing.chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS.breathing.element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS.breathing.orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS.breathing.affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS.breathing.frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.breathing,
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    description: 'Progressive relaxation from head to toe',
    icon: 'scan',
    color: '#10b981',
    meditationCount: 12,
    popular: false,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS['body-scan'].sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS['body-scan'].chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS['body-scan'].element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS['body-scan'].orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS['body-scan'].affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS['body-scan'].frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS['body-scan'],
  },
  {
    id: 'visualization',
    name: 'Visualization',
    description: 'Guided imagery and creative visualization',
    icon: 'eye',
    color: '#8b5cf6',
    meditationCount: 15,
    popular: true,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS.visualization.sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS.visualization.chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS.visualization.element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS.visualization.orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS.visualization.affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS.visualization.frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.visualization,
  },
  {
    id: 'sleep',
    name: 'Sleep Meditation',
    description: 'Deep relaxation for better sleep quality',
    icon: 'moon',
    color: '#3b82f6',
    meditationCount: 20,
    popular: true,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS.sleep.sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS.sleep.chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS.sleep.element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS.sleep.orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS.sleep.affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS.sleep.frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.sleep,
  },
  {
    id: 'focus',
    name: 'Focus& Concentration',
    description: 'Enhance mental clarity and concentration',
    icon: 'target',
    color: '#f59e0b',
    meditationCount: 10,
    popular: false,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS.focus.sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS.focus.chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS.focus.element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS.focus.orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS.focus.affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS.focus.frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.focus,
  },
  {
    id: 'compassion',
    name: 'Compassion & Love',
    description: 'Loving-kindness and compassion practices',
    icon: 'heart',
    color: '#ec4899',
    meditationCount: 8,
    popular: false,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS.compassion.sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS.compassion.chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS.compassion.element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS.compassion.orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS.compassion.affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS.compassion.frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.compassion,
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Present moment awareness practices',
    icon: 'eye',
    color: '#22c55e',
    meditationCount: 16,
    popular: true,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS.mindfulness.sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS.mindfulness.chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS.mindfulness.element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS.mindfulness.orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS.mindfulness.affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS.mindfulness.frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.mindfulness,
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    description: 'Practices to cultivate appreciation and thankfulness',
    icon: 'heart',
    color: '#f59e0b',
    meditationCount: 11,
    popular: true,
    sefirot: CATEGORY_SPIRITUAL_CORRELATIONS.gratitude.sefirot,
    chakra: CATEGORY_SPIRITUAL_CORRELATIONS.gratitude.chakra,
    element: CATEGORY_SPIRITUAL_CORRELATIONS.gratitude.element,
    orixa: CATEGORY_SPIRITUAL_CORRELATIONS.gratitude.orixa,
    affirmation: CATEGORY_SPIRITUAL_CORRELATIONS.gratitude.affirmation,
    frequency: CATEGORY_SPIRITUAL_CORRELATIONS.gratitude.frequency,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.gratitude,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = MeditationCategoriesQuerySchema.safeParse({
    id: searchParams.get('id'),
    popular: searchParams.get('popular'),
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

  const { id, popular, sefirot, chakra, element, orixa } = parseResult.data;
  let filteredCategories = [...categories];

  if (id) {
    filteredCategories = filteredCategories.filter(c => c.id === id);
  }

  if (popular !== undefined) {
    filteredCategories = filteredCategories.filter(c => c.popular === popular);
  }

  if (sefirot) {
    filteredCategories = filteredCategories.filter(c => c.spiritualCorrelations.sefirot.includes(sefirot));
  }

  if (chakra) {
    filteredCategories = filteredCategories.filter(c => c.spiritualCorrelations.chakra === chakra);
  }

  if (element) {
    filteredCategories = filteredCategories.filter(c => c.spiritualCorrelations.element === element);
  }

  if (orixa) {
    filteredCategories = filteredCategories.filter(c => c.spiritualCorrelations.orixa === orixa);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    byPopular: filteredCategories.reduce((acc, c) => {
      acc[c.popular ? 'popular' : 'regular'] = (acc[c.popular ? 'popular' : 'regular'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySefirot: filteredCategories.reduce((acc, c) => {
      c.spiritualCorrelations.sefirot.forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: filteredCategories.reduce((acc, c) => {
      const ch = c.spiritualCorrelations.chakra;
      if (ch) acc[ch] = (acc[ch] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: filteredCategories.reduce((acc, c) => {
      const e = c.spiritualCorrelations.element;
      if (e) acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: filteredCategories.reduce((acc, c) => {
      const o = c.spiritualCorrelations.orixa;
      if (o) acc[o] = (acc[o] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    categories: filteredCategories,
    count: filteredCategories.length,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS,
    spiritualStats,
  });
}