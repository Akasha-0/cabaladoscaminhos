// ============================================================
// SPIRITUAL MEANINGS API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual meanings
// - All meanings, by category, by name, or search
// ============================================================

import { NextResponse } from 'next/server';
import {
  getMeanings,
  getMeaningByCategory,
  getMeaningByName,
  searchMeanings,
  SpiritualMeaning,
} from '@/lib/spiritual/meanings';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const name = url.searchParams.get('name');
  const query = url.searchParams.get('q');

  // Return all meanings if no params
  if (!category && !name && !query) {
    const allMeanings = getMeanings();
    const categories = [...new Set(allMeanings.map((m) => m.category))];

    return NextResponse.json({
      total: allMeanings.length,
      categories,
      endpoints: {
        all: '/api/spiritual/meanings',
        byCategory: '/api/spiritual/meanings?category=<category>',
        byName: '/api/spiritual/meanings?name=<name>',
        search: '/api/spiritual/meanings?q=<query>',
      },
    });
  }

  // Search by query
  if (query) {
    const results = searchMeanings(query);
    return NextResponse.json({
      query,
      count: results.length,
      data: results,
    });
  }

  // Get by name
  if (name) {
    const meaning = getMeaningByName(name);
    if (!meaning) {
      return NextResponse.json(
        { error: `Meaning not found: ${name}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: meaning });
  }

  // Get by category
  if (category) {
    const meanings = getMeaningByCategory(category);
    if (meanings.length === 0) {
      const allCategories = [...new Set(getMeanings().map((m) => m.category))];
      return NextResponse.json(
        { error: `Invalid category. Available: ${allCategories.join(', ')}` },
        { status: 400 }
      );
    }
    return NextResponse.json({
      category,
      count: meanings.length,
      data: meanings,
    });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}