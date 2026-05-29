import { NextResponse } from 'next/server';
import {
  RITUAL_FRAGRANCES,
  DAY_DEFUMATIONS,
  DEFUMATION_BLENDS,
  getFragranceForDay,
  getDefumationForDay,
  getDefumationBlend,
} from '@/lib/aromatherapy/ritual-fragrances';
import { analyzeDay, getDayName } from '@/lib/correlation/day-portal-analyzer';
import { getLunarPhase } from '@/lib/correlation/lunar-phase-analyzer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'today';

  try {
    const today = new Date();

    if (type === 'today') {
      const dayName = getDayName(today);
      const fragrance = getFragranceForDay(dayName);
      const defumation = getDefumationForDay(dayName);
      const dayAnalysis = analyzeDay(dayName);
      const lunarPhase = getLunarPhase(today);

      return NextResponse.json({
        success: true,
        data: {
          day: dayName,
          lunarPhase: lunarPhase.name,
          ritualFragrance: fragrance,
          defumation: defumation,
          dayPortal: dayAnalysis,
          recommendation: `Para hoje (${dayName}), use ${fragrance?.essencia.join(' e ')} com ${fragrance?.resina.join(' e ')} para ${fragrance?.proposito}`,
        },
      });
    }

    if (type === 'week') {
      return NextResponse.json({
        success: true,
        data: {
          fragrances: RITUAL_FRAGRANCES,
          defumations: DAY_DEFUMATIONS,
        },
      });
    }

    if (type === 'blend') {
      const blendId = searchParams.get('blendId');
      if (blendId) {
        const blend = getDefumationBlend(blendId);
        if (!blend) {
          return NextResponse.json({ success: false, error: 'Blend não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: blend });
      }
      return NextResponse.json({ success: true, data: DEFUMATION_BLENDS });
    }

    // Default: all fragrances
    return NextResponse.json({
      success: true,
      data: {
        fragrances: RITUAL_FRAGRANCES,
        defumations: DAY_DEFUMATIONS,
        blends: DEFUMATION_BLENDS,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}