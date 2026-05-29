// src/app/api/otin/data/route.ts
// Otin API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OtinLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OtinQuery {
  level?: OtinLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Otin {
  id: string;
  name: string;
  level: OtinLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OTIN DATA
// ============================================================

const otinData: Otin[] = [
  {
    id: 'otin-001',
    name: 'Otin Primordial',
    level: 'initiate',
    description: 'A essência fundamental de Otin, representando a sabedoria silenciosa que tudo permeia.',
    practices: ['meditacao-silencio', 'afirmacoes-sabedor'],
    symbol: '🌙',
    element: 'luz'
  },
  {
    id: 'otin-002',
    name: 'Otin Guardião',
    level: 'practitioner',
    description: 'Guardião das tradições ancestrais, canalizando forças de proteção e conhecimento.',
    practices: ['ritual-protecao', 'ancestralidade'],
    symbol: '🛡️',
    element: 'protecao'
  },
  {
    id: 'otin-003',
    name: 'Otin Arcano',
    level: 'adept',
    description: 'Mestria sobre os saberes ocultos, revelando mistérios entre dimensões.',
    practices: ['ritual-arcano', 'desvelamento'],
    symbol: '🔮',
    element: 'sabedoria'
  },
  {
    id: 'otin-004',
    name: 'Otin Supremo',
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

function getAllOtin(): Otin[] {
  return otinData;
}

function getOtinById(id: string): Otin | undefined {
  return otinData.find(o => o.id === id);
}

function filterOtin(query: OtinQuery): Otin[] {
  let results = [...otinData];

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

function getLevels(): { level: OtinLevel; count: number }[] {
  const levels: OtinLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: otinData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/otin/data
 * Retrieve otin data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OtinQuery = {
      level: searchParams.get('level') as OtinLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const otin = getOtinById(id);
      if (!otin) {
        return NextResponse.json(
          { error: 'Otin not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: otin });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOtin(query);
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