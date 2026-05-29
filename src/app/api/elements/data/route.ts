// ============================================================
// ELEMENTS DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for element data
// - Retrieve all elements with meanings
// - Retrieve element harmonies
// - Retrieve harmony for specific element pair
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { Element } from '@/lib/elements/harmony';
import { ELEMENT_HARMONIES, calculateHarmony } from '@/lib/elements/harmony';
import { getMeanings } from '@/lib/elements/meanings';

const VALID_ELEMENTS: Element[] = ['water', 'fire', 'air', 'earth'];

// GET /api/elements/data - Get element data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dominant = searchParams.get('dominant') as Element | null;
    const supporting = searchParams.get('supporting') as Element | null;
    const type = searchParams.get('type');

    // Return harmonies for specific element pair
    if (dominant && supporting) {
      if (!VALID_ELEMENTS.includes(dominant) || !VALID_ELEMENTS.includes(supporting)) {
        return NextResponse.json(
          { success: false, error: 'Invalid elements provided' },
          { status: 400 }
        );
      }

      const result = calculateHarmony(dominant, supporting);
      return NextResponse.json({ success: true, data: result });
    }

    // Return meanings data
    if (type === 'meanings') {
      const meanings = getMeanings();
      return NextResponse.json({ success: true, data: meanings });
    }

    // Return all harmonies involving a specific element
    if (dominant) {
      if (!VALID_ELEMENTS.includes(dominant)) {
        return NextResponse.json(
          { success: false, error: 'Invalid element provided' },
          { status: 400 }
        );
      }

      const related = ELEMENT_HARMONIES.filter(
        (h) => h.dominant === dominant || h.supporting === dominant
      );
      return NextResponse.json({ success: true, data: related });
    }

    // Default — return all element data (harmonies + meanings)
    return NextResponse.json({
      success: true,
      data: {
        harmonies: ELEMENT_HARMONIES,
        meanings: getMeanings(),
      },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch elements data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
