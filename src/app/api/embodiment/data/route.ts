// ============================================================
// EMBODIMENT DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for embodiment data
// - List all embodiment stages
// - Get specific stage by ID
// - Get stages by chaldean number
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getStages, getStageById, getStageByNumber, type EmbodimentStageId } from '@/lib/embodiment/embodiment-data';

// GET /api/embodiment/data - Get embodiment data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const number = searchParams.get('number');

    // Return stage by specific ID
    if (id) {
      const stage = getStageById(id as EmbodimentStageId);
      if (!stage) {
        return NextResponse.json(
          { success: false, error: 'Embodiment stage not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: stage });
    }

    // Return stage by chaldean number
    if (number) {
      const num = parseInt(number, 10);
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: 'Invalid stage number' },
          { status: 400 }
        );
      }
      const stage = getStageByNumber(num);
      if (!stage) {
        return NextResponse.json(
          { success: false, error: 'Embodiment stage not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: stage });
    }

    // Default — return all stages
    const stages = getStages();
    return NextResponse.json({ success: true, data: stages });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch embodiment data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
