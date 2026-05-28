import { NextResponse } from 'next/server';

export async GET() {
  return NextResponse.json({ paths: [] });
}
