// src/app/api/ori/data/route.ts
// Ori API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OriLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OriQuery {
  level?: OriLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Ori {
  id: string;
  name: string;
  level: OriLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// ORI DATA
// ============================================================

const oriData: Ori[] = [
  {
    id: 'ori-001',
    name: 'Primeiro Ori',
    level: 'initiate',
    description: 'A essência primordial de Ori, representando a cabeça e o destino individual que guia a vida.',
    practices: ['meditacao-cabeca', 'afirmacoes-de-proposito'],
    symbol: '🧠',
    element: 'destino'
  },
  {
    id: 'ori-002',
    name: 'Ori das Decisoes',
    level: 'practitioner',
    description: 'Guia das escolhas e caminhos, conectando intenção com ação e determinando rumos.',
    practices: ['oracoes-de-decisao', 'reflexao-dirigida'],
    symbol: '🔮',
    element: 'escolha'
  },
  {
    id: 'ori-003',
    name: 'Ori Consciente',
    level: 'adept',
    description: 'Despertar da consciência de destino, alinhando vontade pessoal com propósito divino.',
    practices: ['expansao-de-consciencia', 'alinhamento-cosmico'],
    symbol: '👁️',
    element: 'visao'
  },
  {
    id: 'ori-004',
    name: 'Ori Supremo',
    level: 'master',
    description: 'Mestria sobre o destino, transcendendo limitações e manifestando a vontade divina.',
    practices: ['uniao-com-o-destino', 'transcendência-espiritual'],
    symbol: '⭐',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOri(): Ori[] {
  return oriData;
}

function getOriById(id: string): Ori | undefined {
  return oriData.find(o => o.id === id);
}

function filterOri(query: OriQuery): Ori[] {
  let results = [...oriData];

  if (query.level) {
    results = results.filter(o => o.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(o =>
      o.name.toLowerCase().includes(searchLower) ||
      o.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: OriLevel; count: number }[] {
  const levels: OriLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oriData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/ori/data
 * Retrieve ori data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OriQuery = {
      level: searchParams.get('level') as OriLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const ori = getOriById(id);
      if (!ori) {
        return NextResponse.json(
          { error: 'Ori not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: ori });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOri(query);
    const page = query.page || 1;
    const limit = query.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = filtered.slice(start, end);

    return NextResponse.json({
      data: paginatedResults,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    });

} catch (_error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}