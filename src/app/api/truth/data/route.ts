// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@/lib/truth/truth-data')

import { NextRequest, NextResponse } from 'next/server';

// GET /api/truth/data - Get truth data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getData } = require('@/lib/truth/truth-data');
    const data = getData();

    // Return single truth entry by ID
    if (id) {
      const entry = data[id];
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Truth entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    // Return all truth data
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch truth data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
