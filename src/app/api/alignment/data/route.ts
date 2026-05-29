// ============================================================
// ALIGNMENT DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for alignment data
// - Retrieve all alignment records
// - Retrieve single alignment by ID
// - Retrieve alignment categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData, type AlignmentData } from '@/lib/alignment/alignment-data';

interface AlignmentCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/alignment/data - Get alignment data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const data = getData();

    // Return single alignment record by ID
    if (id) {
      const record = data.find((r) => r.id === id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Alignment record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return alignment categories with weights
    if (type === 'categories') {
      const categories: AlignmentCategory[] = [
        { name: 'luz', description: 'Alinhamento baseado em clareza e verdade', weight: 3 },
        { name: 'reflexão', description: 'Alinhamento baseado em introspecção e sombra', weight: 2 },
        { name: 'estabilidade', description: 'Alinhamento baseado em fundamentação e nutrição', weight: 2 },
        { name: 'fluxo', description: 'Alinhamento baseado em adaptação e conexão', weight: 2 },
        { name: 'transformação', description: 'Alinhamento baseado em purificação e renovação', weight: 1 },
        { name: 'expansão', description: 'Alinhamento baseado em comunicação e liberdade', weight: 1 },
        { name: 'potencial', description: 'Alinhamento baseado em espaço e possibilidade', weight: 1 },
        { name: 'equilíbrio', description: 'Alinhamento baseado em integração e harmonia', weight: 1 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return alignment records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data });
    }

    // Default — return all alignment data
    return NextResponse.json({
      success: true,
      data: {
        records: data,
        categories: [
          { name: 'luz', description: 'Alinhamento baseado em clareza e verdade', weight: 3 },
          { name: 'reflexão', description: 'Alinhamento baseado em introspecção e sombra', weight: 2 },
          { name: 'estabilidade', description: 'Alinhamento baseado em fundamentação e nutrição', weight: 2 },
          { name: 'fluxo', description: 'Alinhamento baseado em adaptação e conexão', weight: 2 },
          { name: 'transformação', description: 'Alinhamento baseado em purificação e renovação', weight: 1 },
          { name: 'expansão', description: 'Alinhamento baseado em comunicação e liberdade', weight: 1 },
          { name: 'potencial', description: 'Alinhamento baseado em espaço e possibilidade', weight: 1 },
          { name: 'equilíbrio', description: 'Alinhamento baseado em integração e harmonia', weight: 1 },
        ] as AlignmentCategory[],
      },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alignment data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}