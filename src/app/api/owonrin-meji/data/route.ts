import { NextResponse } from 'next/server';

// GET /api/owonrin-meji/data
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Owonrin Meji data API is operational',
  });
}