// ============================================================
// KARMA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for karma data
// - Retrieve all karma records
// - Retrieve karma cycles
// - Retrieve categories with weights
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData, type KarmaData, type KarmaCycle } from '@/lib/karma/karma-data';

interface KarmaCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/karma/data - Get karma data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const { karmaRecords, cycles } = getData();

    // Return single karma record by ID
    if (id) {
      const record = karmaRecords.find((r) => r.id === id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Karma record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return karma categories with weights
    if (type === 'categories') {
      const categories: KarmaCategory[] = [
        { name: 'ação', description: 'Peso baseado na intenção e impacto das ações', weight: 3 },
        { name: 'pensamento', description: 'Peso baseado na pureza e elevação dos pensamentos', weight: 2 },
        { name: 'palavra', description: 'Peso baseado na veracidade e gentileza das palavras', weight: 2 },
        { name: 'relação', description: 'Peso baseado na qualidade das conexões com outros', weight: 2 },
        { name: 'serviço', description: 'Peso baseado na dedicação ao bem comum', weight: 1 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return cycles only
    if (type === 'cycles') {
      return NextResponse.json({ success: true, data: cycles });
    }

    // Return karma records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: karmaRecords });
    }

    // Default — return all karma data
    return NextResponse.json({
      success: true,
      data: {
        records: karmaRecords,
        cycles,
        categories: [
          { name: 'ação', description: 'Peso baseado na intenção e impacto das ações', weight: 3 },
          { name: 'pensamento', description: 'Peso baseado na pureza e elevação dos pensamentos', weight: 2 },
          { name: 'palavra', description: 'Peso baseado na veracidade e gentileza das palavras', weight: 2 },
          { name: 'relação', description: 'Peso baseado na qualidade das conexões com outros', weight: 2 },
          { name: 'serviço', description: 'Peso baseado na dedicação ao bem comum', weight: 1 },
        ] as KarmaCategory[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch karma data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
