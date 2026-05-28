import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ practice: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ practice: body });
}