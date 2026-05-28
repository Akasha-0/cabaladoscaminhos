// ============================================================
// EMBODIMENT DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for embodiment data
// - List all embodiment data (states and stages)
// - Get specific state by ID
// - Get specific stage by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/embodiment/embodiment-data';

// GET /api/embodiment/data - Get embodiment data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('state');
    const stageId = searchParams.get('stage');

    const data = getData();

    // Return specific state by ID
    if (stateId) {
      const state = data.states.find((s) => s.id === stateId);
      if (!state) {
        return NextResponse.json(
          { success: false, error: 'Embodiment state not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: state });
    }

    // Return specific stage by ID
    if (stageId) {
      const stage = data.stages.find((s) => s.id === stageId);
      if (!stage) {
        return NextResponse.json(
          { success: false, error: 'Embodiment stage not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: stage });
    }

    // Default — return all data
    return NextResponse.json({ success: true, data });
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
