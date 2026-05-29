// ============================================================
// ABSOLUTE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for absolute data
// - List all absolute data
// - Get specific data by id
// - Get data count
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData, getDataLength, type AbsoluteData } from '@/lib/absolute/absolute-data';

// GET /api/absolute/data - Get absolute data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const count = searchParams.get('count');

    // Return count of data items
    if (count !== null) {
      const dataLength = getDataLength();
      return NextResponse.json({ success: true, data: { count: dataLength } });
    }

    // Return data by specific id
    if (id) {
      const allData = getData();
      const item = allData.find((d: AbsoluteData) => d.id === id);
      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Absolute data not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: item });
    }

    // Default — return all absolute data
    const allData = getData();
    return NextResponse.json({ success: true, data: allData });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch absolute data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}