// ============================================================
// COSMIC CONSCIOUSNESS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ConsciousnessLevelSchema = z.enum([
  'physical', 'emotional', 'mental', 'spiritual', 'cosmic', 'divine'
]);
const ConsciousnessQuerySchema = z.object({
  id: ConsciousnessLevelSchema.optional(),
  minFrequency: z.coerce.number().min(0).optional(),
  maxFrequency: z.coerce.number().max(1000).optional(),
});
interface ConsciousnessData {
  id: string;
  level: string;
  frequency: number;
  description: string;
  attributes: string[];
}

const CONSCIOUSNESS_DATA: ConsciousnessData[] = [
  {
    id: 'physical',
    level: 'Physical',
    frequency: 100,
    description: 'Material plane consciousness focused on physical existence',
    attributes: ['survival', 'stability', 'body awareness']
  },
  {
    id: 'emotional',
    level: 'Emotional',
    frequency: 200,
    description: 'Feeling consciousness connected to heart energy',
    attributes: ['emotions', 'relationships', 'intuition']
  },
  {
    id: 'mental',
    level: 'Mental',
    frequency: 300,
    description: 'Thinking consciousness of the mind',
    attributes: ['logic', 'reasoning', 'analysis']
  },
  {
    id: 'spiritual',
    level: 'Spiritual',
    frequency: 400,
    description: 'Higher consciousness connected to spirit',
    attributes: ['wisdom', 'compassion', 'truth']
  },
  {
    id: 'cosmic',
    level: 'Cosmic',
    frequency: 500,
    description: 'Universal consciousness beyond individual self',
    attributes: ['unity', 'interconnection', 'transcendence']
  },
  {
    id: 'divine',
    level: 'Divine',
    frequency: 600,
    description: 'Divine consciousness united with source',
  },
};
export async function GET(request: NextRequest) {
};
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = ConsciousnessQuerySchema.safeParse({
      id: searchParams.get('id'),
      minFrequency: searchParams.get('minFrequency'),
      maxFrequency: searchParams.get('maxFrequency'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { id, minFrequency, maxFrequency } = parseResult.data;
    if (id) {
      const item = CONSCIOUSNESS_DATA.find(c => c.id === id);
      if (!item) {
        return NextResponse.json({ error: 'Consciousness data not found' }, { status: 404 });
      }
      return NextResponse.json({ consciousness: item });
    }
    let filteredData = [...CONSCIOUSNESS_DATA];
    if (minFrequency !== undefined) {
      filteredData = filteredData.filter(c => c.frequency >= minFrequency);
    }
    if (maxFrequency !== undefined) {
      filteredData = filteredData.filter(c => c.frequency <= maxFrequency);
    }
    return NextResponse.json({
      consciousness: filteredData,
      total: filteredData.length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve consciousness data' }, { status: 500 });
  }
  }
}
}