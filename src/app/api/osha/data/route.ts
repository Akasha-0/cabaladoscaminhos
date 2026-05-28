import { NextResponse } from 'next/server';
import { getData } from '@/lib/osha/osha-data';

/**
 * GET /api/osha/data
 * Returns Osha-related data including path details and spiritual values
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');

  const data = getData();

  // Get single value by id
  if (id) {
    const value = data.values.find((v) => v.id === id);

    if (!value) {
      return NextResponse.json(
        { error: 'Value not found', id },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: value });
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data });

    case 'name':
      return NextResponse.json({ data: { name: data.name, description: data.description } });

    case 'values':
      return NextResponse.json({ data: data.values });

    case 'colors':
      return NextResponse.json({ data: data.colors });

    case 'symbols':
      return NextResponse.json({ data: data.symbols });

    default:
      return NextResponse.json({ data });
  }
}