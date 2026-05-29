// ============================================================
// HERB DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for herb data v2
// - Retrieve all herbs
// - Retrieve single herb by ID
// - Retrieve herb categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/herb/herb-data';

interface HerbCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/herb/v2/data - Get herb data v2
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const herbs = getData();
    const herbList = Object.entries(herbs).map(([key, data]) => ({
      id: key,
      ...data,
    }));

    // Return single herb by ID
    if (id) {
      const herb = herbs[id];
      if (!herb) {
        return NextResponse.json(
          { success: false, error: 'Herb not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: { id, ...herb },
      });
    }

    // Return herb categories
    if (type === 'categories') {
      const categories: HerbCategory[] = [
        { name: 'culinárias', description: 'Ervas usadas no preparo de alimentos', weight: 10 },
        { name: 'medicinais', description: 'Ervas com propriedades terapêuticas', weight: 8 },
        { name: 'aromáticas', description: 'Ervas utilizadas por seu aroma', weight: 6 },
        { name: 'digestivas', description: 'Ervas que auxiliam na digestão', weight: 7 },
        { name: 'anti-inflamatórias', description: 'Ervas com propriedades anti-inflamatórias', weight: 5 },
      ];
      return NextResponse.json({
        success: true,
        data: categories,
      });
    }

    // Return herb records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: herbList });
    }

    // Default — return all herb data
    return NextResponse.json({
      success: true,
      version: 'v2',
      data: herbList,
      meta: {
        total: herbList.length,
        types: ['records', 'categories'],
      },
    });
} catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        version: 'v2',
      },
      { status: 500 }
    );
  }
}