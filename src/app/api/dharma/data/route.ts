// ============================================================
// DHARMA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for dharma data
// - Retrieve all dharma records
// - Retrieve dharma cycles
// - Retrieve principles with descriptions
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData, type DharmaRecord, type DharmaCycle } from '@/lib/dharma/dharma-data';

interface DharmaCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/dharma/data - Get dharma data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const { dharmaRecords, cycles } = getData();

    // Return single dharma record by ID
    if (id) {
      const record = dharmaRecords.find((r) => r.id === id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Dharma record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return dharma categories with weights
    if (type === 'categories') {
      const categories: DharmaCategory[] = [
        { name: 'truth', description: 'Living in alignment with cosmic truth and integrity', weight: 3 },
        { name: 'nonviolence', description: 'Practicing harmlessness in thought, word, and deed', weight: 3 },
        { name: 'righteousness', description: 'Walking the path of right action and ethical living', weight: 3 },
        { name: 'compassion', description: 'Feeling with others and responding to suffering with love', weight: 2 },
        { name: 'detachment', description: 'Holding lightly to outcomes while acting with full commitment', weight: 2 },
        { name: 'discernment', description: 'Discriminating between the real and the unreal', weight: 1 },
        { name: 'contentment', description: 'Finding peace and fulfillment in the present moment', weight: 1 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return cycles only
    if (type === 'cycles') {
      return NextResponse.json({ success: true, data: cycles });
    }

    // Return dharma records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: dharmaRecords });
    }

    // Default — return all dharma data
    return NextResponse.json({
      success: true,
      data: {
        records: dharmaRecords,
        cycles,
        categories: [
          { name: 'truth', description: 'Living in alignment with cosmic truth and integrity', weight: 3 },
          { name: 'nonviolence', description: 'Practicing harmlessness in thought, word, and deed', weight: 3 },
          { name: 'righteousness', description: 'Walking the path of right action and ethical living', weight: 3 },
          { name: 'compassion', description: 'Feeling with others and responding to suffering with love', weight: 2 },
          { name: 'detachment', description: 'Holding lightly to outcomes while acting with full commitment', weight: 2 },
          { name: 'discernment', description: 'Discriminating between the real and the unreal', weight: 1 },
          { name: 'contentment', description: 'Finding peace and fulfillment in the present moment', weight: 1 },
        ] as DharmaCategory[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dharma data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}