// ============================================================
// AWAKENING DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for awakening data
// - List all awakening data
// - Get specific stage by ID
// - Get stages by number
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getStages, getStageById, getStageByNumber, type AwakeningStageId } from '@/lib/awakening/awakening-stages';

// GET /api/awakening/data - Get awakening data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const number = searchParams.get('number');

    // Return stage by specific ID
    if (id) {
      const stage = getStageById(id as AwakeningStageId);
      if (!stage) {
        return NextResponse.json(
          { success: false, error: 'Awakening stage not found' },
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
          { success: false, error: 'Awakening stage not found' },
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
        error: 'Failed to fetch awakening data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}