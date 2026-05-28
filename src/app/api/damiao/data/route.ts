// src/app/api/damiao/data/route.ts
// Damiao API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type DamiaoLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface DamiaoQuery {
  level?: DamiaoLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Damiao {
  id: string;
  name: string;
  level: DamiaoLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// DAMIAO DATA
// ============================================================

const damiaoData: Damiao[] = [
  {
    id: 'damiao-001',
    name: 'Damiao Primordial',
    level: 'initiate',
    description: 'A essência fundamental de Damiao, representando a sabedoria ancestral que conecta passado e futuro.',
    practices: ['meditacao-sabedoria', 'ritual-conexao-ancestral'],
    symbol: '🌿',
    element: 'Ancestralidade'
  },
  {
    id: 'damiao-002',
    name: 'Damiao Protetor',
    level: 'practitioner',
    description: 'Guardião das tradições, Canalizando energias protetoras e sabedoria herdada.',
    practices: ['protecao-sagrada', 'invocacao-guardiao'],
    symbol: '🛡️',
    element: 'Proteção'
  },
  {
    id: 'damiao-003',
    name: 'Damiao Curador',
    level: 'adept',
    description: 'Mestria na arte de curar almas, restaurando equilíbro espiritual e harmonia interior.',
    practices: ['cura-espiritual', 'restauracao-karmica'],
    symbol: '💚',
    element: 'Cura'
  },
  {
    id: 'damiao-004',
    name: 'Damiao Supremo',
    level: 'master',
    description: 'Transcendência total, fundindo-se com a sabedoria cósmica ancestral do universo.',
    practices: ['sabedoria-cosmica', 'uniao-ancestral'],
    symbol: '🌟',
    element: 'Cosmos'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllDamiao(): Damiao[] {
  return damiaoData;
}

function getDamiaoById(id: string): Damiao | undefined {
  return damiaoData.find(d => d.id === id);
}

function filterDamiao(query: DamiaoQuery): Damiao[] {
  let results = [...damiaoData];

  if (query.level) {
    results = results.filter(d => d.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(d =>
      d.name.toLowerCase().includes(searchLower) ||
      d.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: DamiaoLevel; count: number }[] {
  const levels: DamiaoLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: damiaoData.filter(d => d.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/damiao/data
 * Retrieve damiao data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: DamiaoQuery = {
      level: searchParams.get('level') as DamiaoLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const damiao = getDamiaoById(id);
      if (!damiao) {
        return NextResponse.json(
          { error: 'Damiao not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: damiao });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterDamiao(query);
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

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}