// ============================================================
// IWORI DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Iwori Odu spiritual data
// - Iwori Odu interpretations from Ifá tradition
// - Reflection, truth, hidden knowledge, patience
// - Decision-making and wisdom practices
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getInterpretation, getInterpretations } from '@/lib/ifa/interpretations';

/**
 * GET /api/iwori/data
 * Returns Iwori-specific data from Ifá interpretations
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  const interpretations = getInterpretations();
  const iwori = interpretations.iwori;

  if (!iwori) {
    return NextResponse.json(
      { error: 'Iwori data not found' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'full':
      return NextResponse.json({
        data: iwori,
      });

    case 'keywords':
      return NextResponse.json({
        data: iwori.keywords,
      });

    case 'guidance':
      return NextResponse.json({
        data: iwori.spiritualGuidance,
      });

    case 'warnings':
      return NextResponse.json({
        data: iwori.warnings,
      });

    case 'blessings':
      return NextResponse.json({
        data: iwori.blessings,
      });

    case 'orishas':
      return NextResponse.json({
        data: iwori.orishas,
      });

    case 'essence':
      return NextResponse.json({
        data: {
          name: iwori.name,
          yoruba: iwori.yoruba,
          meaning: iwori.meaning,
        },
      });

    default:
      return NextResponse.json({
        data: {
          name: iwori.name,
          yoruba: iwori.yoruba,
          keywords: iwori.keywords,
          meaning: iwori.meaning,
          spiritualGuidance: iwori.spiritualGuidance,
          warnings: iwori.warnings,
          blessings: iwori.blessings,
          orishas: iwori.orishas,
        },
      });
  }
}