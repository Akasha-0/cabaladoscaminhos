import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMeditations, getMeditationById, MeditationCategory } from '@/lib/meditation/library';
import { getTypes } from '@/lib/meditation/types';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const MeditationLibraryQuerySchema = z.object({
  category: z.enum(['cura', 'sono', 'foco', 'energia', 'sagrado']).optional(),
  id: z.string().optional(),
  types: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Meditation Library Categories ──────────────────────────────────────────
const CATEGORY_SPIRITUAL_CORRELATIONS: Record<MeditationCategory, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  cura: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Que a luz da cura flua através de mim',
    frequency: '528 Hz',
  },
  sono: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Iemanjá',
    affirmation: 'Entrego meu sono à proteção divina',
    frequency: '285 Hz',
  },
  foco: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Minha mente está clara e focada',
    frequency: '528 Hz',
  },
  energia: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A energia vital flui através de mim',
    frequency: '528 Hz',
  },
  sagrado: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Conecto-me com a consciência divina',
    frequency: '963 Hz',
  },
};

const VALID_CATEGORIES: MeditationCategory[] = ['cura', 'sono', 'foco', 'energia', 'sagrado'];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = MeditationLibraryQuerySchema.safeParse({
    category: searchParams.get('category'),
    id: searchParams.get('id'),
    types: searchParams.get('types'),
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

  const { category, id, types, sefirot, chakra, element, orixa } = parseResult.data;

  if (id) {
    const meditation = getMeditationById(id);
    if (!meditation) {
      return NextResponse.json(
        { error: 'Meditation not found', id },
        { status: 404 }
      );
    }
    // Add spiritual correlations based on category
    const correlations = CATEGORY_SPIRITUAL_CORRELATIONS[meditation.category as MeditationCategory] || CATEGORY_SPIRITUAL_CORRELATIONS.sagrado;
    return NextResponse.json({
      success: true,
      meditation: {
        ...meditation,
        ...correlations,
        spiritualCorrelations: correlations,
      },
      spiritualCorrelations: correlations,
    });
  }

  if (category) {
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category', valid: VALID_CATEGORIES },
        { status: 400 }
      );
    }
    const meditations = getMeditations().filter((m) => m.category === category);
    const correlations = CATEGORY_SPIRITUAL_CORRELATIONS[category];
    
    // Add spiritual correlations to all meditations in this category
    const enhancedMeditations = meditations.map(m => ({
      ...m,
      ...correlations,
      spiritualCorrelations: correlations,
    }));

    return NextResponse.json({
      success: true,
      category,
      meditations: enhancedMeditations,
      count: enhancedMeditations.length,
      spiritualCorrelations: correlations,
    });
  }

  if (types === true) {
    return NextResponse.json({
      success: true,
      types: getTypes(),
      spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS,
    });
  }

  const meditations = getMeditations();
  const byCategory = VALID_CATEGORIES.reduce((acc, cat) => {
    const catMeditations = meditations.filter((m) => m.category === cat);
    const correlations = CATEGORY_SPIRITUAL_CORRELATIONS[cat];
    acc[cat] = catMeditations.map(m => ({
      ...m,
      ...correlations,
      spiritualCorrelations: correlations,
    }));
    return acc;
  }, {} as Record<MeditationCategory, typeof meditations>);

  // Calculate spiritual stats
  const spiritualStats = {
    byCategory: VALID_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = meditations.filter((m) => m.category === cat).length;
      return acc;
    }, {} as Record<string, number>),
    bySefirot: Object.values(CATEGORY_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
      c.sefirot.forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: Object.values(CATEGORY_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
      acc[c.chakra] = (acc[c.chakra] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: Object.values(CATEGORY_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
      acc[c.element] = (acc[c.element] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: Object.values(CATEGORY_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
      acc[c.orixa] = (acc[c.orixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    meditations,
    categories: VALID_CATEGORIES,
    byCategory,
    total: meditations.length,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS,
    spiritualStats,
  });
}