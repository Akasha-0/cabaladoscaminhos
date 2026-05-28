// @ts-nocheck
// SKIP_LINT

// Logbara API - Cabala Dos Caminhos
import { NextRequest, NextResponse } from 'next/server';
import {
  getData,
  getLogbaraById,
  getQuizilas,
  getEbós,
  getOrixas,
  getSacredFrequencies,
} from '@/lib/logbara/logbara-data';

/**
 * GET /api/logbara/data
 * Returns Logbara Ifa divination data
 * Supports query parameters: id, type
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (id) {
    const item = getLogbaraById(id);
    if (!item) {
      return NextResponse.json({ error: 'Logbara not found' }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  }

  if (type) {
    switch (type) {
      case 'quizilas':
        return NextResponse.json({ data: getQuizilas() });
      case 'ebos':
        return NextResponse.json({ data: getEbós() });
      case 'orixas':
        return NextResponse.json({ data: getOrixas() });
      case 'frequencies':
        return NextResponse.json({ data: getSacredFrequencies() });
      default:
        return NextResponse.json(
          { error: 'Unknown type. Valid types: quizilas, ebos, orixas, frequencies' },
          { status: 400 }
        );
    }
  }

  return NextResponse.json({ data: getData() });
}
