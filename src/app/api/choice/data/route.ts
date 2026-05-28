// ============================================================
// CHOICE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for choice data
// - Retrieve all choice records
// - Retrieve single choice entry by ID
// - Retrieve choice types with weights
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData, type ChoiceEntity, type ChoiceType } from '@/lib/choice/choice-data';

// GET /api/choice/data - Get choice data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    const data = getData();

    // Return single choice entry by ID
    if (id) {
      const entry = data.choices.find((e) => e.id === id);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Choice entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    // Return choice types with weights
    if (type === 'types') {
      return NextResponse.json({ success: true, data: data.types });
    }

    // Return choice records only
    if (type === 'choices') {
      return NextResponse.json({ success: true, data: data.choices });
    }

    // Default — return all choice data
    return NextResponse.json({
      success: true,
      data: {
        choices: data.choices,
        types: data.types,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch choice data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}