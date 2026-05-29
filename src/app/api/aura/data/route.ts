import { NextRequest, NextResponse } from 'next/server';
import { getColors } from '@/lib/aura/aura-colors';

// GET /api/aura/data - Get aura data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = getColors();

    // Return single aura record by ID
    if (id) {
      const record = data.find((r) => r.name.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Aura record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return all records
    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (_error) {
    console.error('Aura API error:', _error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch aura data' },
      { status: 500 }
    );
  }
}