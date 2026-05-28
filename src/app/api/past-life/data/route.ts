import { NextRequest, NextResponse } from 'next/server';

// GET /api/past-life/data - Return past-life data summary
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Past-life API data endpoint',
      timestamp: new Date().toISOString(),
    },
  });
}
