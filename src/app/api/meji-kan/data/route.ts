import { NextResponse } from 'next/server';

// GET /api/meji-kan/data
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Meji-kan data API is operational',
  });
}