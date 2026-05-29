// src/app/api/avanga/data/route.ts
// Avanga API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type AvangaLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface AvangaQuery {
  level?: AvangaLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Avanga {
  id: string;
  name: string;
  level: AvangaLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// AVANGA DATA
// ============================================================

const avangaData: Avanga[] = [
  {
    id: 'avanga-001',
    name: 'Avanga Primordial',
    level: 'initiate',
    description: 'A essência fundamental de Avanga, representando a sabedoria ancestral que conecta passado e futuro.',
    practices: ['meditacao-sabedoria', 'ritual-conexao-ancestral'],
    symbol: '🌿',
    element: 'Ancestralidade'
  },
  {
    id: 'avanga-002',
    name: 'Avanga Protetor',
    level: 'practitioner',
    description: 'Guardião das tradições, Canalizando energias protetoras e sabedoria herdada.',
    practices: ['protecao-sagrada', 'invocacao-guardiao'],
    symbol: '🛡️',
    element: 'Proteção'
  },
  {
    id: 'avanga-003',
    name: 'Avanga Curador',
    level: 'adept',
    description: 'Mestria na arte de curar almas, restaurando equilíbro espiritual e harmonia interior.',
    practices: ['cura-espiritual', 'restauracao-karmica'],
    symbol: '💚',
    element: 'Cura'
  },
  {
    id: 'avanga-004',
    name: 'Avanga Supremo',
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

function getAllAvanga(): Avanga[] {
  return avangaData;
}

function getAvangaById(id: string): Avanga | undefined {
  return avangaData.find(a => a.id === id);
}

function filterAvanga(query: AvangaQuery): Avanga[] {
  let results = [...avangaData];

  if (query.level) {
    results = results.filter(a => a.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(a =>
      a.name.toLowerCase().includes(searchLower) ||
      a.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: AvangaLevel; count: number }[] {
  const levels: AvangaLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: avangaData.filter(a => a.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/avanga/data
 * Retrieve avanga data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: AvangaQuery = {
      level: searchParams.get('level') as AvangaLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const avanga = getAvangaById(id);
      if (!avanga) {
        return NextResponse.json(
          { error: 'Avanga not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: avanga });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterAvanga(query);
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
