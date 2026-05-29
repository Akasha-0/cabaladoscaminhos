import { NextResponse } from 'next/server';
import { GEOMETRIC_PATTERNS } from '@/lib/sacred-geometry/geometric-patterns';
import { SOLFEGGIO_FREQUENCIES } from '@/lib/frequency/frequency-data';
import { analyzeDay, getDayName } from '@/lib/correlation/day-portal-analyzer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const chakra = searchParams.get('chakra');

  try {
    if (type === 'today') {
      const today = new Date();
      const dayName = getDayName(today);
      const dayAnalysis = analyzeDay(dayName);
      // Access chakra from portals.chakra array
      const dayChakra = dayAnalysis.portals.chakra[0]?.split('º')[0].trim() || '1';
      const chakraNum = parseInt(dayChakra);

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
          chakra: dayAnalysis.portals.chakra[0],
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

    if (type === 'chakra' && chakra) {
      const chakraNum = parseInt(chakra);
      const patterns = GEOMETRIC_PATTERNS.filter(p =>
        p.chakras.includes(chakraNum)
      );
      const frequencies = SOLFEGGIO_FREQUENCIES.filter(f =>
        f.chakra === chakraNum
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