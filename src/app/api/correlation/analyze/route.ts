import { NextResponse } from 'next/server';
import { analyzeDay, getWeeklyCycle } from '@/lib/correlation/day-portal-analyzer';
import { getLunarPhase, getPhaseForRitual, getRitualGuidance } from '@/lib/correlation/lunar-phase-analyzer';
import { ODU_TAROT_CORRELATIONS, getOduCorrelations } from '@/lib/correlation/correlation-types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'day';
  const value = searchParams.get('value') || new Date().toLocaleDateString('pt-BR', { weekday: 'long' });

  try {
    switch (type) {
      case 'day': {
        const dayAnalysis = analyzeDay(value);
        return NextResponse.json({
          success: true,
          data: dayAnalysis,
        });
      }

      case 'week': {
        const weeklyCycle = getWeeklyCycle();
        return NextResponse.json({
          success: true,
          data: weeklyCycle,
        });
      }

      case 'lunar': {
        const phase = getLunarPhase(new Date(value as unknown as string));
        return NextResponse.json({
          success: true,
          data: phase,
        });
      }

      case 'ritual': {
        const phase = getPhaseForRitual((value as any) || 'manifestation');
        const guidance = getRitualGuidance(phase, 'progresso espiritual');
        return NextResponse.json({
          success: true,
          data: { phase, guidance },
        });
      }

      case 'odu': {
        const oduNumber = parseInt(searchParams.get('odu') || '1', 10);
        const correlations = getOduCorrelations(oduNumber);
        return NextResponse.json({
          success: true,
          data: {
            odu: oduNumber,
            tarot: ODU_TAROT_CORRELATIONS[oduNumber] || 'Unknown',
            correlations,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Use: day, week, lunar, ritual, odu',
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}