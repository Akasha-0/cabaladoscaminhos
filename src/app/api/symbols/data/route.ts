// ============================================================
// SYMBOLS DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for astrological symbol data
// - Zodiac signs, planets, and aspects with SVG graphics
// ============================================================

import { NextResponse } from 'next/server';
import {
  getSymbol,
  getSymbolNames,
  symbolExists,
} from '@/lib/astrologia/symbols';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Return available endpoints if no type specified
  if (!type) {
    return NextResponse.json({
      endpoints: {
        zodiac: '/api/symbols/data?type=zodiac',
        planets: '/api/symbols/data?type=planet',
        aspects: '/api/symbols/data?type=aspect',
      },
      message: 'Use type parameter to fetch specific symbol data',
    });
  }

  // Normalize type
  const normalizedType = type.toLowerCase() as 'zodiac' | 'planet' | 'aspect';

  // Validate type
  if (!['zodiac', 'planet', 'aspect'].includes(normalizedType)) {
    return NextResponse.json(
      { error: 'Invalid type. Use: zodiac, planet, aspect' },
      { status: 400 }
    );
  }

  // Specific symbol query
  if (name) {
    if (!symbolExists(normalizedType, name)) {
      return NextResponse.json(
        { error: `Symbol '${name}' not found for type '${normalizedType}'` },
        { status: 404 }
      );
    }
    const svg = getSymbol(normalizedType, name);
    return NextResponse.json({
      type: normalizedType,
      name: name.toLowerCase(),
      svg,
    });
  }

  // Return all symbols for the type
  const symbols = getSymbolNames(normalizedType);
  return NextResponse.json({
    type: normalizedType,
    symbols: symbols.map((sym) => ({
      name: sym,
      svg: getSymbol(normalizedType, sym),
    })),
    total: symbols.length,
  });
}
