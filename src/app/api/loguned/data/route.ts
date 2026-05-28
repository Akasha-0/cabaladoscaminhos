// Loguned API - Cabala Dos Caminhos
// GET endpoints for Loguned spiritual data

import { NextResponse } from 'next/server';
import { getData } from '@/lib/orixa/loguned-data';

/**
 * GET /api/loguned/data
 * Returns Loguned-related data
 * Supports query parameters: type, name
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Handle name-based lookup
  if (name) {
    if (name.toLowerCase() === 'loguned') {
      return NextResponse.json({
        data: getData(),
      });
    }
    return NextResponse.json(
      { error: 'Loguned not found by name' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'all':
      return NextResponse.json({
        data: [getData()],
        meta: { total: 1 },
      });

    case 'names':
      return NextResponse.json({
        data: ['Loguned'],
      });

    default:
      return NextResponse.json({
        data: getData(),
        meta: {
          types: ['all', 'names'],
        },
      });
  }
}