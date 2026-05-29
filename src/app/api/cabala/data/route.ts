import { NextResponse } from 'next/server';
import { getMeanings } from '@/lib/cabala/sefirot-meanings';

export async function GET() {
  const meanings = getMeanings();
  const sefirot = Object.entries(meanings).map(([key, value]) => ({
    id: key,
    ...value,
  }));
  return NextResponse.json({ sefirot });
}