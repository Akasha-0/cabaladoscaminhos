// src/app/api/oxosse/data/route.ts
// Oxosse API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OxosseLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OxosseQuery {
  level?: OxosseLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oxosse {
  id: string;
  name: string;
  level: OxosseLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OXOSSE DATA
// ============================================================

const oxosseData: Oxosse[] = [
  {
    id: 'oxosse-001',
    name: 'Primeiro Oxosse',
    level: 'initiate',
    description: 'A essência primordial de Oxosse, representando as águas doces e a fertilidade inicial.',
    practices: ['meditacao-agua', 'afirmações-de-abundancia'],
    symbol: '💧',
    element: 'agua-doce'
  },
  {
    id: 'oxosse-002',
    name: 'Oxosse das Correntes',
    level: 'practitioner',
    description: 'Fluxo contínuo de energia financeira e emocional, conectando recursos e relationships.',
    practices: ['fluxo-de-rio', 'harmonia-relacional'],
    symbol: '🌊',
    element: 'correnteza'
  },
  {
    id: 'oxosse-003',
    name: 'Oxosse Rainha',
    level: 'adept',
    description: 'Soberania sobre recursos materiais e emocionais, governanta das águas terrenais.',
    practices: ['coroa-de-luz', 'realeza-interior'],
    symbol: '👑',
    element: 'reino'
  },
  {
    id: 'oxosse-004',
    name: 'Oxosse Supremo',
    level: 'master',
    description: 'Mestria completa sobre todos os fluxos de Oxosse, transcendendo a manifestação material.',
    practices: ['uniao-cosmica', 'transformacao-total'],
    symbol: '✨',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOxosse(): Oxosse[] {
  return oxosseData;
}

function getOxosseById(id: string): Oxosse | undefined {
  return oxosseData.find(o => o.id === id);
}

function filterOxosse(query: OxosseQuery): Oxosse[] {
  let results = [...oxosseData];

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

function getLevels(): { level: OxosseLevel; count: number }[] {
  const levels: OxosseLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oxosseData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oxosse/data
 * Retrieve oxosse data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OxosseQuery = {
      level: searchParams.get('level') as OxosseLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oxosse = getOxosseById(id);
      if (!oxosse) {
        return NextResponse.json(
          { error: 'Oxosse not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oxosse });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOxosse(query);
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
