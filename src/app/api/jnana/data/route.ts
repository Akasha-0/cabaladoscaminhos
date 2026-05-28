import { NextRequest, NextResponse } from 'next/server';

// GET /api/jnana/data - Return jnana data
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Jnana API data endpoint',
      timestamp: new Date().toISOString(),
    },
  });
}
