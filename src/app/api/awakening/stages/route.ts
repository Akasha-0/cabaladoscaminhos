// ============================================================
// AWAKENING STAGES API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for awakening stages
// - List all awakening stages
// - Get specific stage by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getStages } from '@/lib/journey/journey-stages';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('id');

    const stages = getStages();

    if (stageId) {
      const stage = stages.find((s) => s.id === stageId);
      if (!stage) {
        return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
      }
      return NextResponse.json({ stage });
    }

    return NextResponse.json({ stages });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve stages' }, { status: 500 });
  }
}