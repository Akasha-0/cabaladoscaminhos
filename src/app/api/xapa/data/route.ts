import { NextRequest, NextResponse } from 'next/server';

// GET /api/xapa/data
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Xapa API endpoint ready' },
    { status: 200 }
  );
}
