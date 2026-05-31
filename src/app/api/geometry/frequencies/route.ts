import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GEOMETRIC_PATTERNS } from '@/lib/sacred-geometry/geometric-patterns';
import { SOLFEGGIO_FREQUENCIES } from '@/lib/frequency/frequency-data';
import { getDayName } from '@/lib/correlation/day-portal-analyzer';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const GeometryFrequenciesQuerySchema = z.object({
  type: z.enum(['all', 'today', 'chakra']).optional().default('all'),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = GeometryFrequenciesQuerySchema.safeParse({
      type: searchParams.get('type'),
      chakra: searchParams.get('chakra'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, chakra } = parseResult.data;

    if (type === 'today') {
      const today = new Date();
      const dayName = getDayName(today);
      const chakraNum = 1;

      const patterns = GEOMETRIC_PATTERNS.filter(p =>
        p.chakras.includes(chakraNum)
      );
      const frequencies = SOLFEGGIO_FREQUENCIES.filter(f =>
        f.chakra === chakraNum
      );

      return NextResponse.json({
        success: true,
        data: {
          day: dayName,
          chakra: chakraNum,
          patterns,
          frequencies,
          recommendations: {
            poliedro: patterns[0]?.name,
            frequency: frequencies[0]?.hz ? `${frequencies[0].hz} Hz` : null,
            mantram: frequencies[0]?.mantram,
            divindade: frequencies[0]?.divindade,
          }
        }
      });
    }

    if (type === 'chakra' && chakra !== undefined) {
      const patterns = GEOMETRIC_PATTERNS.filter(p =>
        p.chakras.includes(chakra)
      );
      const frequencies = SOLFEGGIO_FREQUENCIES.filter(f =>
        f.chakra === chakra
      );
      return NextResponse.json({
        success: true,
        data: { patterns, frequencies }
      });
    }

    // Default: all with mapping
    return NextResponse.json({
      success: true,
      data: {
        patterns: GEOMETRIC_PATTERNS,
        frequencies: SOLFEGGIO_FREQUENCIES,
        mapping: SOLFEGGIO_FREQUENCIES.map(f => ({
          hz: f.hz,
          chakra: f.chakra,
          poliedro: f.poliedro,
          mantram: f.mantram,
          divindade: f.divindade,
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}