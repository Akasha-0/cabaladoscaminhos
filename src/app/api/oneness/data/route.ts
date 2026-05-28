// ============================================================
// ONENESS DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for oneness data
// - Get all oneness data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData, type OnenessData } from '@/lib/oneness/oneness-data';

// GET /api/oneness/data - Get oneness data
export async function GET(_request: NextRequest) {
  try {
    const data = getData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch oneness data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
