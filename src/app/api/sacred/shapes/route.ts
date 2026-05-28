/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { getShapes, getShapeById, getShapesBySefirot, getShapesByChakra, SacredShape } from '@/lib/geometria-sagrada/shapes';
import { getPatterns, getPatternById, getPatternsBySefirot, getPatternsByChakra, SacredPattern } from '@/lib/geometria-sagrada/sacred-patterns';

/**
 * GET /api/sacred/shapes
 * Query params:
 *   - resource: 'shapes' | 'patterns' (default: shapes)
 *   - id: shape/pattern ID
 *   - sefirot: filter by sefirot
 *   - chakra: filter by chakra number (1-7)
 */
interface QueryParams {
  resource?: string;
  id?: string;
  sefirot?: string;
  chakra?: string;
}

function parseChakra(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource') as QueryParams['resource'] || 'shapes';
  const id = searchParams.get('id') || undefined;
  const sefirot = searchParams.get('sefirot') || undefined;
  const chakra = parseChakra(searchParams.get('chakra') || undefined);

  if (resource === 'patterns') {
    if (id) {
      const pattern = getPatternById(id);
      if (!pattern) {
        return NextResponse.json({ error: 'Padrão não encontrado' }, { status: 404 });
      }
      return NextResponse.json(pattern);
    }

    if (sefirot) {
      return NextResponse.json(getPatternsBySefirot(sefirot));
    }

    if (chakra !== undefined) {
      return NextResponse.json(getPatternsByChakra(chakra));
    }

    return NextResponse.json(getPatterns());
  }

  if (id) {
    const shape = getShapeById(id);
    if (!shape) {
      return NextResponse.json({ error: 'Forma não encontrada' }, { status: 404 });
    }
    return NextResponse.json(shape);
  }

  if (sefirot) {
    return NextResponse.json(getShapesBySefirot(sefirot));
  }

  if (chakra !== undefined) {
    return NextResponse.json(getShapesByChakra(chakra));
  }

  return NextResponse.json(getShapes());
}