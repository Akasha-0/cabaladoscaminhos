import { NextRequest, NextResponse } from 'next/server';

// GET /api/iote/data
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Iote API endpoint ready' },
    { status: 200 }
  );
}
