// ============================================================
// HARMONY DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for element harmony data
// - Retrieve all element harmonies
// - Retrieve specific element pair harmony
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { Element, HarmonyResult } from '@/lib/elements/harmony';
import { ELEMENT_HARMONIES, calculateHarmony } from '@/lib/elements/harmony';

const VALID_ELEMENTS: Element[] = ['water', 'fire', 'air', 'earth'];

// GET /api/harmony/data - Get all harmony data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dominant = searchParams.get('dominant') as Element | null;
    const supporting = searchParams.get('supporting') as Element | null;

    // Specific pair query
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

    // Single element query — return all harmonies involving this element
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

    // Default — return all
    return NextResponse.json({ success: true, data: ELEMENT_HARMONIES });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch harmony data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
