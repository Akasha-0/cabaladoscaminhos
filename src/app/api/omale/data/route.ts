// src/app/api/omale/data/route.ts
// Omale API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OmaleLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OmaleQuery {
  level?: OmaleLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Omale {
  id: string;
  name: string;
  level: OmaleLevel;
  description: string;
  practices: string[];
  symbol: string;
  aspect: string;
}

// ============================================================
// OMALE DATA
// ============================================================

const omaleData: Omale[] = [
  {
    id: 'omale-001',
    name: 'Omale Primordial',
    level: 'initiate',
    description: 'A essência primordial de Omale, representando a unidade original antes da separação em dualidade.',
    practices: ['unidade-origem', 'antes-da-divisao'],
    symbol: '◉',
    aspect: 'unicidade'
  },
  {
    id: 'omale-002',
    name: 'Omale da Totalidade',
    level: 'practitioner',
    description: 'Guardião da completude e integridade, mantendo a visão do todo antes da manifestação.',
    practices: ['visao-total', 'integridade-caminho'],
    symbol: '◎',
    aspect: 'totalidade'
  },
  {
    id: 'omale-003',
    name: 'Omale do Equilíbrio',
    level: 'adept',
    description: 'Mestre do equilíbrio entre os opostos,harmonizando os caminhos que se bifurcam.',
    practices: ['equilibrio-opostos', 'harmonia-bifurcacao'],
    symbol: '⟳',
    aspect: 'equilibrio'
  },
  {
    id: 'omale-004',
    name: 'Omale Supremo',
    level: 'master',
    description: 'Mestria completa sobre a unidade primordial, transcendendo a divisão e retornando à fonte original.',
    practices: ['retorno-fonte', 'transcendenciadivisao'],
    symbol: '∞',
    aspect: 'transcendência'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOmale(): Omale[] {
  return omaleData;
}

function getOmaleById(id: string): Omale | undefined {
  return omaleData.find(o => o.id === id);
}

function filterOmale(query: OmaleQuery): Omale[] {
  let results = [...omaleData];

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

function getLevels(): { level: OmaleLevel; count: number }[] {
  const levels: OmaleLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: omaleData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/omale/data
 * Retrieve omale data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OmaleQuery = {
      level: searchParams.get('level') as OmaleLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const omale = getOmaleById(id);
      if (!omale) {
        return NextResponse.json(
          { error: 'Omale not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: omale });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOmale(query);
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