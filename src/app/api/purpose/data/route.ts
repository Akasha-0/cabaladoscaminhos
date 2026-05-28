// ============================================================
// PURPOSE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for purpose data
// - Retrieve all purpose records
// - Retrieve single purpose entry by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/purpose/purpose-data';

// GET /api/purpose/data - Get purpose data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = getData();

    // Return single purpose entry by ID
    if (id) {
      const entry = data.entities.find((e) => e.id === id);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Purpose entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    // Return all purpose data
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch purpose data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}