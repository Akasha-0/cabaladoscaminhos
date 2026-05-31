/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getShapes, getShapeById, getShapesBySefirot, getShapesByChakra, SacredShape } from '@/lib/geometria-sagrada/shapes';
import { getPatterns, getPatternById, getPatternsBySefirot, getPatternsByChakra, SacredPattern } from '@/lib/geometria-sagrada/sacred-patterns';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SacredShapesQuerySchema = z.object({
  resource: z.enum(['shapes', 'patterns', 'all']).optional(),
  id: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Sacred Shapes ──────────────────────────────────────────
const SHAPE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  tetrahedron: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A força do fogo me fortalece',
    frequency: '528 Hz',
  },
  cube: {
    sefirot: ['Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'A terra me ancora na realidade',
    frequency: '396 Hz',
  },
  octahedron: {
    sefirot: ['Tipheret'],
    chakra: 4,
    element: 'Ar',
    orixa: 'Oxum',
    affirmation: 'A harmonia do ar me equilibra',
    frequency: '528 Hz',
  },
  dodecahedron: {
    sefirot: ['Chokhmah'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A sabedoria cósmica me ilumina',
    frequency: '741 Hz',
  },
  icosahedron: {
    sefirot: ['Binah'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'As águas da vida me purificam',
    frequency: '417 Hz',
  },
  merkaba: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Sou envolvido pela luz divina',
    frequency: '963 Hz',
  },
  flower_of_life: {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A vida floresce em mim',
    frequency: '528 Hz',
  },
  tree_of_life: {
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Sou conectado à árvore da vida',
    frequency: '963 Hz',
  },
};

function parseChakra(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

function addSpiritualCorrelations(item: SacredShape | SacredPattern) {
  const id = (item as SacredShape).id || (item as SacredPattern).id;
  const correlations = SHAPE_SPIRITUAL_CORRELATIONS[id] || SHAPE_SPIRITUAL_CORRELATIONS.tetrahedron;
  return {
    ...item,
    sefirot: correlations.sefirot,
    chakra: correlations.chakra,
    element: correlations.element,
    orixa: correlations.orixa,
    affirmation: correlations.affirmation,
    frequency: correlations.frequency,
    spiritualCorrelations: correlations,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parseResult = SacredShapesQuerySchema.safeParse({
    resource: searchParams.get('resource'),
    id: searchParams.get('id'),
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

  const { resource, id, sefirot, chakra, element, orixa } = parseResult.data;
  const resourceType = resource || 'shapes';

  try {
    if (resourceType === 'patterns') {
      if (id) {
        const pattern = getPatternById(id);
        if (!pattern) {
          return NextResponse.json({ error: 'Padrão não encontrado' }, { status: 404 });
        }
        return NextResponse.json({
          success: true,
          pattern: addSpiritualCorrelations(pattern),
          spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
        });
      }

      if (sefirot) {
        const patterns = getPatternsBySefirot(sefirot);
        return NextResponse.json({
          success: true,
          patterns: patterns.map(addSpiritualCorrelations),
          count: patterns.length,
          spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
        });
      }

      if (chakra !== undefined) {
        const chakraNum = parseChakra(String(chakra));
        if (chakraNum !== undefined) {
          const patterns = getPatternsByChakra(chakraNum);
          return NextResponse.json({
            success: true,
            patterns: patterns.map(addSpiritualCorrelations),
            count: patterns.length,
            spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
          });
        }
      }

      const patterns = getPatterns();
      return NextResponse.json({
        success: true,
        patterns: patterns.map(addSpiritualCorrelations),
        count: patterns.length,
        spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
      });
    }

    if (resourceType === 'all') {
      const shapes = getShapes().map(addSpiritualCorrelations);
      const patterns = getPatterns().map(addSpiritualCorrelations);

      // Filter by spiritual dimensions
      let filteredShapes = shapes;
      let filteredPatterns = patterns;

      if (sefirot) {
        filteredShapes = filteredShapes.filter(s => s.spiritualCorrelations.sefirot.includes(sefirot));
        filteredPatterns = filteredPatterns.filter(p => p.spiritualCorrelations.sefirot.includes(sefirot));
      }

      if (chakra !== undefined) {
        const chakraNum = parseChakra(String(chakra));
        if (chakraNum !== undefined) {
          filteredShapes = filteredShapes.filter(s => s.spiritualCorrelations.chakra === chakraNum);
          filteredPatterns = filteredPatterns.filter(p => p.spiritualCorrelations.chakra === chakraNum);
        }
      }

      if (element) {
        filteredShapes = filteredShapes.filter(s => s.spiritualCorrelations.element === element);
        filteredPatterns = filteredPatterns.filter(p => p.spiritualCorrelations.element === element);
      }

      if (orixa) {
        filteredShapes = filteredShapes.filter(s => s.spiritualCorrelations.orixa === orixa);
        filteredPatterns = filteredPatterns.filter(p => p.spiritualCorrelations.orixa === orixa);
      }

      // Calculate spiritual stats
      const spiritualStats = {
        bySefirot: [...filteredShapes, ...filteredPatterns].reduce((acc, item) => {
          item.spiritualCorrelations.sefirot.forEach(s => {
            acc[s] = (acc[s] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>),
        byChakra: [...filteredShapes, ...filteredPatterns].reduce((acc, item) => {
          const c = item.spiritualCorrelations.chakra;
          if (c) acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byElement: [...filteredShapes, ...filteredPatterns].reduce((acc, item) => {
          const e = item.spiritualCorrelations.element;
          if (e) acc[e] = (acc[e] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byOrixa: [...filteredShapes, ...filteredPatterns].reduce((acc, item) => {
          const o = item.spiritualCorrelations.orixa;
          if (o) acc[o] = (acc[o] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return NextResponse.json({
        success: true,
        shapes: filteredShapes,
        patterns: filteredPatterns,
        count: filteredShapes.length + filteredPatterns.length,
        spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
        spiritualStats,
        meta: {
          filters: { resource: resourceType, id, sefirot, chakra, element, orixa },
        },
      });
    }

    // Default: shapes
    if (id) {
      const shape = getShapeById(id);
      if (!shape) {
        return NextResponse.json({ error: 'Forma não encontrada' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        shape: addSpiritualCorrelations(shape),
        spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
      });
    }

    if (sefirot) {
      const shapes = getShapesBySefirot(sefirot);
      return NextResponse.json({
        success: true,
        shapes: shapes.map(addSpiritualCorrelations),
        count: shapes.length,
        spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
      });
    }

    if (chakra !== undefined) {
      const chakraNum = parseChakra(String(chakra));
      if (chakraNum !== undefined) {
        const shapes = getShapesByChakra(chakraNum);
        return NextResponse.json({
          success: true,
          shapes: shapes.map(addSpiritualCorrelations),
          count: shapes.length,
          spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
        });
      }
    }

    const shapes = getShapes();
    return NextResponse.json({
      success: true,
      shapes: shapes.map(addSpiritualCorrelations),
      count: shapes.length,
      spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}