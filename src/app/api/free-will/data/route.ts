import { NextRequest, NextResponse } from 'next/server';

// GET /api/free-will/data - Return free-will data summary
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Free-will API data endpoint',
      timestamp: new Date().toISOString(),
    },
  });
}
