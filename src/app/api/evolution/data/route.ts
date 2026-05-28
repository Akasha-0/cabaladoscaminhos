import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Evolution data endpoint' });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return NextResponse.json({ received: body }, { status: 201 });
}
