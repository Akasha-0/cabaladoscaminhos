import { NextRequest, NextResponse } from 'next/server';
import { getShapes, getShapeById, getShapesBySefirot, getShapesByChakra, SacredShape } from '@/lib/geometria-sagrada/shapes';
import { FORMAS_SAGRADAS, getFormaPorSefirot, getFormaPorChakra } from '@/lib/geometria-sagrada/dados';
import { generateMandala, EstiloMandala, MandalaGerado } from '@/lib/geometria-sagrada/mandala-generator';
import { generateCrystalGrid, Intencao, CristalGrid } from '@/lib/geometria-sagrada/crystal-grid';

/**
 * GET /api/sacred/geometry
 * Query params:
 *   - resource: 'shapes' | 'formas' | 'mandala' | 'crystal-grid'
 *   - id: shape ID (for shapes/formas)
 *   - sefirot: filter by sefirot
 *   - chakra: filter by chakra number
 *   - estilo: mandala style (for mandala)
 *   - centros: number of centers (for mandala, default 1)
 *   - aneis: number of rings (for mandala, default 6)
 *   - espirais: number of spirals (for mandala, default 3)
 *   - intencao: crystal grid intention (for crystal-grid)
 */

interface ShapeQuery {
  id?: string;
  sefirot?: string;
  chakra?: string;
}

interface FormaQuery {
  id?: string;
  sefirot?: string;
  chakra?: string;
}

interface MandalaQuery {
  estilo?: EstiloMandala;
  centros?: string;
  aneis?: string;
  espirais?: string;
}

interface CrystalGridQuery {
  intencao?: Intencao;
}

function parseIntSafe(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource') ?? 'shapes';

  try {
    switch (resource) {
      case 'shapes': {
        const query: ShapeQuery = {
          id: searchParams.get('id') ?? undefined,
          sefirot: searchParams.get('sefirot') ?? undefined,
          chakra: searchParams.get('chakra') ?? undefined,
        };

        if (query.id) {
          const shape = getShapeById(query.id);
          if (!shape) {
            return NextResponse.json({ error: 'Shape not found' }, { status: 404 });
          }
          return NextResponse.json(shape);
        }

        if (query.sefirot) {
          return NextResponse.json(getShapesBySefirot(query.sefirot));
        }

        if (query.chakra) {
          const chakraNum = parseIntSafe(query.chakra, -1);
          return NextResponse.json(getShapesByChakra(chakraNum));
        }

        return NextResponse.json(getShapes());
      }

      case 'formas': {
        const query: FormaQuery = {
          id: searchParams.get('id') ?? undefined,
          sefirot: searchParams.get('sefirot') ?? undefined,
          chakra: searchParams.get('chakra') ?? undefined,
        };

        if (query.id) {
          const forma = FORMAS_SAGRADAS.find((f) => f.id === query.id);
          if (!forma) {
            return NextResponse.json({ error: 'Forma not found' }, { status: 404 });
          }
          return NextResponse.json(forma);
        }

        if (query.sefirot) {
          return NextResponse.json(getFormaPorSefirot(query.sefirot));
        }

        if (query.chakra) {
          const chakraNum = parseIntSafe(query.chakra, -1);
          return NextResponse.json(getFormaPorChakra(chakraNum));
        }

        return NextResponse.json(FORMAS_SAGRADAS);
      }

      case 'mandala': {
        const query: MandalaQuery = {
          estilo: searchParams.get('estilo') as EstiloMandala | undefined,
          centros: searchParams.get('centros') ?? undefined,
          aneis: searchParams.get('aneis') ?? undefined,
          espirais: searchParams.get('espirais') ?? undefined,
        };

        const estilo = query.estilo ?? 'sagrado';
        const centros = parseIntSafe(query.centros, 1);
        const aneis = parseIntSafe(query.aneis, 6);
        const espirais = parseIntSafe(query.espirais, 3);

        const mandala = generateMandala(estilo, centros, aneis, espirais);
        return NextResponse.json(mandala);
      }

      case 'crystal-grid': {
        const query: CrystalGridQuery = {
          intencao: searchParams.get('intencao') as Intencao | undefined,
        };

        if (!query.intencao) {
          return NextResponse.json({ error: 'intencao is required' }, { status: 400 });
        }

        const grid = generateCrystalGrid(query.intencao);
        return NextResponse.json(grid);
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
    }
  } catch (error) {
    console.error('Sacred geometry API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}