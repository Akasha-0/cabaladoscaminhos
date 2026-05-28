import { NextRequest, NextResponse } from 'next/server';

// GET/POST endpoints for spiritual banking
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Spiritual banking API' });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Spiritual banking API' });
}
