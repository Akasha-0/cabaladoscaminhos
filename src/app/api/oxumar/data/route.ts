// src/app/api/oxumar/data/route.ts
// Oxumar API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OxumarLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OxumarQuery {
  level?: OxumarLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oxumar {
  id: string;
  name: string;
  level: OxumarLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OXUMAR DATA
// ============================================================

const oxumarData: Oxumar[] = [
  {
    id: 'oxumar-001',
    name: 'Oxumar Primordial',
    level: 'initiate',
    description: 'A essência fundamental de Oxumar, representando o arco-íris que conecta céu e terra.',
    practices: ['meditacao-arco-iris', 'afirmacoes-celestes'],
    symbol: '🌈',
    element: 'arco-iris'
  },
  {
    id: 'oxumar-002',
    name: 'Oxumar das Cores',
    level: 'practitioner',
    description: 'Fluxo das cores cósmicas, canalizando energias vibracionais e frequências luminosas.',
    practices: ['cromoterapia', 'harmonia-cromatica'],
    symbol: '🎨',
    element: 'cores'
  },
  {
    id: 'oxumar-003',
    name: 'Oxumar Arcano',
    level: 'adept',
    description: 'Mestria sobre os mistérios ocultos, revelando segredos entre dimensões.',
    practices: ['ritual-arcano', 'desvelamento'],
    symbol: '🔮',
    element: 'misterio'
  },
  {
    id: 'oxumar-004',
    name: 'Oxumar Supremo',
    level: 'master',
    description: 'Transcendência total, fundindo-se com a luz primordial do cosmos.',
    practices: ['uniao-cosmica', 'luz-transcendental'],
    symbol: '✨',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOxumar(): Oxumar[] {
  return oxumarData;
}

function getOxumarById(id: string): Oxumar | undefined {
  return oxumarData.find(o => o.id === id);
}

function filterOxumar(query: OxumarQuery): Oxumar[] {
  let results = [...oxumarData];

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

function getLevels(): { level: OxumarLevel; count: number }[] {
  const levels: OxumarLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oxumarData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oxumar/data
 * Retrieve oxumar data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OxumarQuery = {
      level: searchParams.get('level') as OxumarLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oxumar = getOxumarById(id);
      if (!oxumar) {
        return NextResponse.json(
          { error: 'Oxumar not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oxumar });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOxumar(query);
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
