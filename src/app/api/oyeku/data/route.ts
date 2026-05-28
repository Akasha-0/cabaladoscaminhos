import { NextResponse } from 'next/server';
import { getInterpretation, getInterpretations } from '@/lib/ifa/interpretations';

/**
 * GET /api/oyeku/data
 * Returns Oyeku-specific data from Ifá interpretations
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  const interpretations = getInterpretations();
  const oyeku = interpretations.oyeku;

  if (!oyeku) {
    return NextResponse.json(
      { error: 'Oyeku data not found' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'full':
      return NextResponse.json({
        data: oyeku,
      });

    case 'keywords':
      return NextResponse.json({
        data: oyeku.keywords,
      });

    case 'guidance':
      return NextResponse.json({
        data: oyeku.spiritualGuidance,
      });

    case 'warnings':
      return NextResponse.json({
        data: oyeku.warnings,
      });

    case 'blessings':
      return NextResponse.json({
        data: oyeku.blessings,
      });

    case 'orishas':
      return NextResponse.json({
        data: oyeku.orishas,
      });

    case 'essence':
      return NextResponse.json({
        data: {
          name: oyeku.name,
          yoruba: oyeku.yoruba,
          meaning: oyeku.meaning,
        },
      });

    default:
      return NextResponse.json({
        data: {
          name: oyeku.name,
          yoruba: oyeku.yoruba,
          keywords: oyeku.keywords,
          meaning: oyeku.meaning,
          spiritualGuidance: oyeku.spiritualGuidance,
          warnings: oyeku.warnings,
          blessings: oyeku.blessings,
          orishas: oyeku.orishas,
        },
      });
  }
}