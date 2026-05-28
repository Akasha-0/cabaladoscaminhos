// src/app/api/kumanci/data/route.ts
// Kumanci API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type KumanciLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface KumanciQuery {
  level?: KumanciLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Kumanci {
  id: string;
  name: string;
  level: KumanciLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// KUMANCI DATA
// ============================================================

const kumanciData: Kumanci[] = [
  {
    id: 'kumanci-001',
    name: 'Kumanci Primordial',
    level: 'initiate',
    description: 'A essência fundamental de Kumanci, representando a sabedoria ancestral que conecta passado e futuro.',
    practices: ['meditacao-sabedoria', 'ritual-conexao-ancestral'],
    symbol: '🌿',
    element: 'Ancestralidade'
  },
  {
    id: 'kumanci-002',
    name: 'Kumanci Protetor',
    level: 'practitioner',
    description: 'Guardião das tradições, Canalizando energias protetoras e sabedoria herdada.',
    practices: ['protecao-sagrada', 'invocacao-guardiao'],
    symbol: '🛡️',
    element: 'Proteção'
  },
  {
    id: 'kumanci-003',
    name: 'Kumanci Curador',
    level: 'adept',
    description: 'Mestria na arte de curar almas, restaurando equilíbro espiritual e harmonia interior.',
    practices: ['cura-espiritual', 'restauracao-karmica'],
    symbol: '💚',
    element: 'Cura'
  },
  {
    id: 'kumanci-004',
    name: 'Kumanci Supremo',
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

function getAllKumanci(): Kumanci[] {
  return kumanciData;
}

function getKumanciById(id: string): Kumanci | undefined {
  return kumanciData.find(k => k.id === id);
}

function filterKumanci(query: KumanciQuery): Kumanci[] {
  let results = [...kumanciData];

  if (query.level) {
    results = results.filter(k => k.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(k =>
      k.name.toLowerCase().includes(searchLower) ||
      k.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: KumanciLevel; count: number }[] {
  const levels: KumanciLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: kumanciData.filter(k => k.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/kumanci/data
 * Retrieve kumanci data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: KumanciQuery = {
      level: searchParams.get('level') as KumanciLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const kumanci = getKumanciById(id);
      if (!kumanci) {
        return NextResponse.json(
          { error: 'Kumanci not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: kumanci });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterKumanci(query);
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
