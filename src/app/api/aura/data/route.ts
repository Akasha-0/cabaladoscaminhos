// ============================================================
// AURA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for aura data
// - Retrieve all aura colors
// - Retrieve single aura by ID
// - Retrieve aura categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getColors, type AuraColor } from '@/lib/aura/aura-colors';

interface AuraCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/aura/data - Get aura data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const data = getColors();

    // Return single aura record by ID
    if (id) {
      const record = data.find((r) => r.name.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Aura record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return aura categories with weights
    if (type === 'categories') {
      const categories: AuraCategory[] = [
        { name: 'white', description: 'Pure spirit, enlightenment, truth', weight: 3 },
        { name: 'yellow', description: 'Intellect, creativity, joy', weight: 3 },
        { name: 'orange', description: 'Vitality, ambition, transformation', weight: 2 },
        { name: 'pink', description: 'Compassion, love, tenderness', weight: 2 },
        { name: 'red', description: 'Strength, passion, grounding', weight: 2 },
        { name: 'blue', description: 'Calm, wisdom, depth', weight: 2 },
        { name: 'violet', description: 'Intuition, mysticism, the divine', weight: 1 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return aura records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data });
    }

    // Default — return all aura data
    return NextResponse.json({
      success: true,
      data: {
        records: data,
        categories: [
          { name: 'white', description: 'Pure spirit, enlightenment, truth', weight: 3 },
          { name: 'yellow', description: 'Intellect, creativity, joy', weight: 3 },
          { name: 'orange', description: 'Vitality, ambition, transformation', weight: 2 },
          { name: 'pink', description: 'Compassion, love, tenderness', weight: 2 },
          { name: 'red', description: 'Strength, passion, grounding', weight: 2 },
          { name: 'blue', description: 'Calm, wisdom, depth', weight: 2 },
          { name: 'violet', description: 'Intuition, mysticism, the divine', weight: 1 },
        ] as AuraCategory[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch aura data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
