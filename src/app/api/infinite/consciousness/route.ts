import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ConsciousnessDimensionSchema = z.object({
  id: z.string(),
  dimension: z.string(),
  level: z.number().int().min(1).max(10),
  frequency: z.number().int().min(1),
  description: z.string(),
  attributes: z.array(z.string()),
});
const ConsciousnessQuerySchema = z.object({
  id: z.string().optional(),
  level: z.coerce.number().int().min(1).max(10).optional(),
  minFrequency: z.coerce.number().int().positive().optional(),
});
interface ConsciousnessDimension {
  id: string;
  dimension: string;
  level: number;
  frequency: number;
  description: string;
  attributes: string[];
}
const CONSCIOUSNESS_DATA: ConsciousnessDimension[] = [
  {
    id: 'finite',
    dimension: 'Finite',
    level: 1,
    frequency: 100,
    description: 'Individual consciousness bound by physical perception',
    attributes: ['separation', 'duality', 'time-bound']
  },
  {
    id: 'Aware',
    dimension: 'Aware',
    level: 2,
    frequency: 200,
    description: 'Consciousness expanding through emotional awareness',
    attributes: ['feeling', 'connection', 'emotional intelligence']
  },
  {
    id: 'expanding',
    dimension: 'Expanding',
    level: 3,
    frequency: 300,
    description: 'Mental consciousness expanding beyond boundaries',
    attributes: ['thought', 'imagination', 'creativity']
  },
  {
    id: 'transcendent',
    dimension: 'Transcendent',
    level: 4,
    frequency: 400,
    description: 'Spiritual consciousness transcending individual self',
    attributes: ['wisdom', 'compassion', 'inner peace']
  },
  {
    id: 'infinite',
    dimension: 'Infinite',
    level: 5,
    frequency: 500,
    description: 'Infinite consciousness united with universal mind',
    attributes: ['unity', 'interconnectedness', 'oneness']
  },
  {
    id: 'eternal',
    dimension: 'Eternal',
    level: 6,
    frequency: 600,
    description: 'Eternal consciousness beyond time and space',
    attributes: ['timelessness', 'infinity', 'source']
  }
];

// GET /api/infinite/consciousness - Get all consciousness dimensions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = ConsciousnessQuerySchema.safeParse({
      id: searchParams.get('id'),
      level: searchParams.get('level'),
      minFrequency: searchParams.get('minFrequency'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { id, level, minFrequency } = parseResult.data;
    let consciousness = [...CONSCIOUSNESS_DATA];
    if (id) {
      const item = consciousness.find(c => c.id === id);
      if (!item) {
        return NextResponse.json(
          { error: 'Consciousness dimension not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ consciousness: item });
    }
    if (level !== undefined) {
      consciousness = consciousness.filter(c => c.level === level);
    }
    if (minFrequency !== undefined) {
      consciousness = consciousness.filter(c => c.frequency >= minFrequency);
    }
    return NextResponse.json({
      consciousness,
      total: consciousness.length
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to retrieve consciousness data' },
      { status: 500 }
    );
  }
}