// ============================================================
// COMPARTILHAR DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for compartilhar (sharing) data
// - Retrieve all sharing records
// - Retrieve single sharing record by ID
// - Retrieve sharing categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface CompartilharCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/compartilhar/data - Get compartilhar data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const compartilhamentos = [
      { id: 'oracoes', name: 'Orações', element: 'Spirit', category: 'spiritual', vibration: 7 },
      { id: 'mantras', name: 'Mantras', element: 'Sound', category: 'spiritual', vibration: 8 },
      { id: 'afirmacoes', name: 'Afirmações', element: 'Light', category: 'mental', vibration: 6 },
      { id: 'meditacoes', name: 'Meditações', element: 'Air', category: 'spiritual', vibration: 7 },
      { id: 'rituais', name: 'Rituais', element: 'Fire', category: 'ceremonial', vibration: 5 },
      { id: 'oracoes-sagradas', name: 'Orações Sagradas', element: 'Spirit', category: 'spiritual', vibration: 9 },
      { id: 'preces', name: 'Preces', element: 'Water', category: 'spiritual', vibration: 6 },
      { id: 'invocacoes', name: 'Invocações', element: 'Fire', category: 'ceremonial', vibration: 8 },
      { id: 'bencos', name: 'Benções', element: 'Light', category: 'spiritual', vibration: 7 },
      { id: 'canticos', name: 'Canticos', element: 'Sound', category: 'spiritual', vibration: 6 },
      { id: 'devoes', name: 'Devoções', element: 'Earth', category: 'spiritual', vibration: 5 },
      { id: 'reflexoes', name: 'Reflexões', element: 'Air', category: 'mental', vibration: 6 },
      { id: 'visualizacoes', name: 'Visualizações', element: 'Light', category: 'mental', vibration: 7 },
      { id: 'journaling', name: 'Journaling', element: 'Earth', category: 'mental', vibration: 5 },
      { id: 'gratidao', name: 'Gratidão', element: 'Light', category: 'mental', vibration: 8 },
    ];

    // Return single compartilhar record by ID
    if (id) {
      const record = compartilhamentos.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Compartilhar record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return compartilhar categories
    if (type === 'categories') {
      const categories: CompartilharCategory[] = [
        { name: 'spiritual', description: 'Spiritual practices, prayers, mantras', weight: 3 },
        { name: 'mental', description: 'Mental practices, affirmations, visualization', weight: 3 },
        { name: 'ceremonial', description: 'Ceremonial practices, rituals, invocations', weight: 2 },
        { name: 'contemplative', description: 'Contemplative practices, meditation, reflection', weight: 2 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return compartilhar records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: compartilhamentos });
    }

    // Default — return all compartilhar data
    return NextResponse.json({
      success: true,
      data: {
        records: compartilhamentos,
        categories: [
          { name: 'spiritual', description: 'Spiritual practices, prayers, mantras', weight: 3 },
          { name: 'mental', description: 'Mental practices, affirmations, visualization', weight: 3 },
          { name: 'ceremonial', description: 'Ceremonial practices, rituals, invocations', weight: 2 },
          { name: 'contemplative', description: 'Contemplative practices, meditation, reflection', weight: 2 },
        ] as CompartilharCategory[],
      },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch compartilhar data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}