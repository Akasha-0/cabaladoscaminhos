// ============================================================
// ESSENCE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for essence data
// - Retrieve all essence records
// - Retrieve single essence entry by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/essence/essence-data';

// GET /api/essence/data - Get essence data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = getData();

    // Return single essence entry by ID
    if (id) {
      const entry = data.entities.find((e) => e.id === id);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Essence entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    // Return all essence data
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch essence data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}