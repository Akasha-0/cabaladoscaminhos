import { NextRequest, NextResponse } from 'next/server';

// GET /api/bhakti/data - Return Bhakti data summary
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Bhakti API data endpoint',
      timestamp: new Date().toISOString(),
    },
  });
}