// Cosmic Data API
import { NextResponse } from 'next/server';
import { getData, COSMIC_DATASET, CosmicData } from '@/lib/cosmic/cosmic-data';

export type { CosmicData };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const type = url.searchParams.get('type');

  const data = getData();

  if (id) {
    const item = data.find(d => d.id === id);
    if (!item) {
      return NextResponse.json({ error: 'Cosmic data not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  }

  if (type) {
    const filtered = data.filter(d => d.type === type);
    return NextResponse.json({ data: filtered, total: filtered.length });
  }

  return NextResponse.json({ data, total: data.length });
}
