// ============================================================
// MEANING DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for meaning data
// - Retrieve all meaning records
// - Retrieve single meaning entry by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/meaning/meaning-data';

// GET /api/meaning/data - Get meaning data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = getData();

    // Return single meaning entry by ID
    if (id) {
      const entry = data.entities.find((e) => e.id === id);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Meaning entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    // Return all meaning data
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meaning data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}