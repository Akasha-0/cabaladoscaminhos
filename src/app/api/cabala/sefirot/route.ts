// Cabala Sefirot API
import { NextRequest, NextResponse } from 'next/server';
import { getMeanings, SefiraMeaning } from '@/lib/cabala/sefirot-meanings';

export type { SefiraMeaning };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sefira = searchParams.get('sefira');

  const sefirot = getMeanings();

  if (sefira) {
    const normalizedSefira = sefira.charAt(0).toUpperCase() + sefira.slice(1).toLowerCase();
    if (sefirot[normalizedSefira as keyof typeof sefirot]) {
      return NextResponse.json(sefirot[normalizedSefira as keyof typeof sefirot]);
    }
    return NextResponse.json({ error: 'Sefira not found' }, { status: 404 });
  }

  return NextResponse.json(sefirot);
}
