// ============================================================
// ABSOLUTE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for absolute data
// - List all absolute data
// - Get specific practice by id
// - Get practice by type
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { performPractice, type AbsolutePracticeResult } from '@/lib/absolute/absolute-practice';

// GET /api/absolute/data - Get absolute data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    // Return practice by id
    if (id) {
      const practice = performPractice();
      if (!practice) {
        return NextResponse.json(
          { success: false, error: 'Absolute practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: practice });
    }

    // Return practice by type
    if (type) {
      const practice = performPractice();
      if (!practice) {
        return NextResponse.json(
          { success: false, error: 'Absolute practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: practice });
    }

    // Default — return all absolute data
    const practice = performPractice();
    return NextResponse.json({ success: true, data: practice });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch absolute data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
