// src/app/api/bozedo/data/route.ts
// Bozedo API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type BozedoLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface BozedoQuery {
  level?: BozedoLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Bozedo {
  id: string;
  name: string;
  level: BozedoLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// BOZEDO DATA
// ============================================================

const bozedoData: Bozedo[] = [
  {
    id: 'bozedo-001',
    name: 'Bozedo Primordial',
    level: 'initiate',
    description: 'A essência fundamental de Bozedo, representando a sabedoria silenciosa que tudo permeia.',
    practices: ['meditacao-silencio', 'afirmacoes-sabedor'],
    symbol: '🌙',
    element: 'luz'
  },
  {
    id: 'bozedo-002',
    name: 'Bozedo Guardião',
    level: 'practitioner',
    description: 'Guardião das tradições ancestrais, canalizando forças de proteção e conhecimento.',
    practices: ['ritual-protecao', 'ancestralidade'],
    symbol: '🛡️',
    element: 'protecao'
  },
  {
    id: 'bozedo-003',
    name: 'Bozedo Arcano',
    level: 'adept',
    description: 'Mestria sobre os saberes ocultos, revelando mistérios entre dimensões.',
    practices: ['ritual-arcano', 'desvelamento'],
    symbol: '🔮',
    element: 'sabedoria'
  },
  {
    id: 'bozedo-004',
    name: 'Bozedo Supremo',
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

function getAllBozedo(): Bozedo[] {
  return bozedoData;
}

function getBozedoById(id: string): Bozedo | undefined {
  return bozedoData.find(b => b.id === id);
}

function filterBozedo(query: BozedoQuery): Bozedo[] {
  let results = [...bozedoData];

  if (query.level) {
    results = results.filter(b => b.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(b =>
      b.name.toLowerCase().includes(searchLower) ||
      b.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: BozedoLevel; count: number }[] {
  const levels: BozedoLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: bozedoData.filter(b => b.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/bozedo/data
 * Retrieve bozedo data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: BozedoQuery = {
      level: searchParams.get('level') as BozedoLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const bozedo = getBozedoById(id);
      if (!bozedo) {
        return NextResponse.json(
          { error: 'Bozedo not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: bozedo });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterBozedo(query);
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