import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getShapes, getShapeById, getShapesBySefirot, getShapesByChakra, SacredShape } from '@/lib/geometria-sagrada/shapes';
import { FORMAS_SAGRADAS, getFormaPorSefirot, getFormaPorChakra } from '@/lib/geometria-sagrada/dados';
import { generateMandala, EstiloMandala, MandalaGerado } from '@/lib/geometria-sagrada/mandala-generator';
import { generateCrystalGrid, Intencao, CristalGrid } from '@/lib/geometria-sagrada/crystal-grid';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SacredGeometryQuerySchema = z.object({
  resource: z.enum(['shapes', 'formas', 'mandala', 'crystal-grid']).optional(),
  id: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
  estilo: z.enum(['tradicional', 'orgânico', 'geométrico', 'cósmico']).optional(),
  centros: z.coerce.number().int().min(1).max(5).optional(),
  aneis: z.coerce.number().int().min(1).max(12).optional(),
  espirais: z.coerce.number().int().min(1).max(8).optional(),
  intencao: z.enum(['cura', 'protecao', 'prosperidade', 'amor', 'sabedoria', 'equilibrio']).optional(),
});

// ─── Spiritual Correlations for Sacred Geometry Shapes ──────────────────────────────────────────
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
  torus: {
    sefirot: ['Yesod'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A energia flui através de mim',
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
  seed_of_life: {
    sefirot: ['Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A semente da vida germina em mim',
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
  metatron: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Metatron me guia na luz',
    frequency: '963 Hz',
  },
  vesica_piscis: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A união do divino e do humano',
    frequency: '639 Hz',
  },
};

function parseIntSafe(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parseResult = SacredGeometryQuerySchema.safeParse({
    resource: searchParams.get('resource'),
    id: searchParams.get('id'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
    estilo: searchParams.get('estilo'),
    centros: searchParams.get('centros'),
    aneis: searchParams.get('aneis'),
    espirais: searchParams.get('espirais'),
    intencao: searchParams.get('intencao'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { resource, id, sefirot, chakra, element, orixa, estilo, centros, aneis, espirais, intencao } = parseResult.data;
  const resourceType = resource ?? 'shapes';

  try {
    switch (resourceType) {
      case 'shapes': {
        if (id) {
          const shape = getShapeById(id);
          if (!shape) {
            return NextResponse.json({ error: 'Shape not found' }, { status: 404 });
          }
          // Add spiritual correlations
          const correlations = SHAPE_SPIRITUAL_CORRELATIONS[id] || SHAPE_SPIRITUAL_CORRELATIONS.torus;
          return NextResponse.json({
            success: true,
            shape: {
              ...shape,
              ...correlations,
              spiritualCorrelations: correlations,
            },
            spiritualCorrelations: correlations,
          });
        }

        if (sefirot) {
          const shapes = getShapesBySefirot(sefirot);
          const enhancedShapes = shapes.map(s => ({
            ...s,
            ...(SHAPE_SPIRITUAL_CORRELATIONS[s.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus),
            spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS[s.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus,
          }));
          return NextResponse.json({
            success: true,
            shapes: enhancedShapes,
            count: enhancedShapes.length,
            spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
          });
        }

        if (chakra) {
          const chakraNum = parseIntSafe(String(chakra), -1);
          const shapes = getShapesByChakra(chakraNum);
          const enhancedShapes = shapes.map(s => ({
            ...s,
            ...(SHAPE_SPIRITUAL_CORRELATIONS[s.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus),
            spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS[s.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus,
          }));
          return NextResponse.json({
            success: true,
            shapes: enhancedShapes,
            count: enhancedShapes.length,
            spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
          });
        }

        const shapes = getShapes();
        const enhancedShapes = shapes.map(s => ({
          ...s,
          ...(SHAPE_SPIRITUAL_CORRELATIONS[s.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus),
          spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS[s.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus,
        }));

        // Calculate spiritual stats
        const spiritualStats = {
          bySefirot: enhancedShapes.reduce((acc, s) => {
            s.spiritualCorrelations.sefirot.forEach(sf => {
              acc[sf] = (acc[sf] || 0) + 1;
            });
            return acc;
          }, {} as Record<string, number>),
          byChakra: enhancedShapes.reduce((acc, s) => {
            const c = s.spiritualCorrelations.chakra;
            if (c) acc[c] = (acc[c] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byElement: enhancedShapes.reduce((acc, s) => {
            const e = s.spiritualCorrelations.element;
            if (e) acc[e] = (acc[e] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byOrixa: enhancedShapes.reduce((acc, s) => {
            const o = s.spiritualCorrelations.orixa;
            if (o) acc[o] = (acc[o] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };

        return NextResponse.json({
          success: true,
          shapes: enhancedShapes,
          count: enhancedShapes.length,
          spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
          spiritualStats,
        });
      }

      case 'formas': {
        if (id) {
          const forma = FORMAS_SAGRADAS.find(f => f.id === id);
          if (!forma) {
            return NextResponse.json({ error: 'Forma não encontrada' }, { status: 404 });
          }
          const correlations = SHAPE_SPIRITUAL_CORRELATIONS[id] || SHAPE_SPIRITUAL_CORRELATIONS.torus;
          return NextResponse.json({
            success: true,
            forma: {
              ...forma,
              ...correlations,
              spiritualCorrelations: correlations,
            },
            spiritualCorrelations: correlations,
          });
        }

        if (sefirot) {
          const formas = getFormaPorSefirot(sefirot);
          const enhancedFormas = formas.map(f => ({
            ...f,
            ...(SHAPE_SPIRITUAL_CORRELATIONS[f.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus),
            spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS[f.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus,
          }));
          return NextResponse.json({
            success: true,
            formas: enhancedFormas,
            count: enhancedFormas.length,
 spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
          });
        }

        if (chakra) {
          const chakraNum = parseIntSafe(String(chakra), -1);
          const formas = getFormaPorChakra(chakraNum);
          const enhancedFormas = formas.map(f => ({
            ...f,
            ...(SHAPE_SPIRITUAL_CORRELATIONS[f.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus),
            spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS[f.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus,
          }));
          return NextResponse.json({
            success: true,
            formas: enhancedFormas,
            count: enhancedFormas.length,
            spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
          });
        }

        const enhancedFormas = FORMAS_SAGRADAS.map(f => ({
          ...f,
          ...(SHAPE_SPIRITUAL_CORRELATIONS[f.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus),
          spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS[f.id] || SHAPE_SPIRITUAL_CORRELATIONS.torus,
        }));

        return NextResponse.json({
          success: true,
          formas: enhancedFormas,
          count: enhancedFormas.length,
          spiritualCorrelations: SHAPE_SPIRITUAL_CORRELATIONS,
        });
      }

      case 'mandala': {
        const mandala = generateMandala(
          estilo as EstiloMandala || 'tradicional',
          centros || 1,
          aneis || 6,
          espirais || 3
        );

        return NextResponse.json({
          success: true,
          mandala,
          spiritualCorrelations: {
            sefirot: ['Tipheret', 'Yesod'],
            chakra: 6,
            element: 'Fogo',
            orixa: 'Oxum',
            affirmation: 'A beleza sagrada me envolve',
            frequency: '528 Hz',
          },
        });
      }

      case 'crystal-grid': {
        const grid = generateCrystalGrid(intencao as Intencao || 'equilibrio');

        return NextResponse.json({
          success: true,
          grid,
          spiritualCorrelations: {
            sefirot: ['Malkuth', 'Yesod'],
            chakra: 1,
            element: 'Terra',
            orixa: 'Nanã',
            affirmation: 'A energia dos cristais me fortalece',
            frequency: '396 Hz',
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Recurso inválido',
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}