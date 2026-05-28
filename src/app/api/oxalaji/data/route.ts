import { NextRequest, NextResponse } from 'next/server';

// GET /api/oxalaji/data
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Oxalaji API endpoint ready' },
    { status: 200 }
  );
}