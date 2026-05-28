// ============================================================
// TRANSCENDENCE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for transcendence data
// - Get all transcendence data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/transcendence/transcendence-data';

// GET /api/transcendence/data - Get transcendence data
export async function GET(request: NextRequest) {
  try {
    const data = getData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transcendence data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}