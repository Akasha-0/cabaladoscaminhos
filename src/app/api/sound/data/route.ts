import { NextRequest, NextResponse } from 'next/server';
import { getSoundscapes } from '@/lib/audio/soundscapes';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const soundscape = getSoundscapes().find(s => s.id === id);
    if (!soundscape) {
      return NextResponse.json({ error: 'Soundscape not found' }, { status: 404 });
    }
    return NextResponse.json(soundscape);
  }

  return NextResponse.json({ soundscapes: getSoundscapes() });
}
