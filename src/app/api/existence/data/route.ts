// ============================================================
// EXISTENCE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for existence data
// - Retrieve all existence records
// - Retrieve single existence entry by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/existence/existence-data';

// GET /api/existence/data - Get existence data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = getData();

    // Return single existence entry by ID
    if (id) {
      const entry = data[id];
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Existence entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    // Return all existence data
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch existence data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
