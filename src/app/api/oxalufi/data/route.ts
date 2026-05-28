// src/app/api/oxalufi/data/route.ts
// Oxalufi API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OxalufiLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OxalufiQuery {
  level?: OxalufiLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oxalufi {
  id: string;
  name: string;
  level: OxalufiLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OXALUFI DATA
// ============================================================

const oxalufiData: Oxalufi[] = [
  {
    id: 'oxalufi-001',
    name: 'Primeiro Oxalufi',
    level: 'initiate',
    description: 'A essência primordial de Oxalufi, representando as águas doces e a fertilidade inicial.',
    practices: ['meditacao-agua', 'afirmações-de-abundancia'],
    symbol: '💧',
    element: 'agua-doce'
  },
  {
    id: 'oxalufi-002',
    name: 'Oxalufi das Correntes',
    level: 'practitioner',
    description: 'Fluxo contínuo de energia financeira e emocional, conectando recursos e relationships.',
    practices: ['fluxo-de-rio', 'harmonia-relacional'],
    symbol: '🌊',
    element: 'correnteza'
  },
  {
    id: 'oxalufi-003',
    name: 'Oxalufi Rainha',
    level: 'adept',
    description: 'Soberania sobre recursos materiais e emocionais, governanta das águas terrenais.',
    practices: ['coroa-de-luz', 'realeza-interior'],
    symbol: '👑',
    element: 'reino'
  },
  {
    id: 'oxalufi-004',
    name: 'Oxalufi Supremo',
    level: 'master',
    description: 'Mestria completa sobre todos os fluxos de Oxalufi, transcendendo a manifestação material.',
    practices: ['uniao-cosmica', 'transformacao-total'],
    symbol: '✨',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOxalufi(): Oxalufi[] {
  return oxalufiData;
}

function getOxalufiById(id: string): Oxalufi | undefined {
  return oxalufiData.find(o => o.id === id);
}

function filterOxalufi(query: OxalufiQuery): Oxalufi[] {
  let results = [...oxalufiData];

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

function getLevels(): { level: OxalufiLevel; count: number }[] {
  const levels: OxalufiLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oxalufiData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oxalufi/data
 * Retrieve oxalufi data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OxalufiQuery = {
      level: searchParams.get('level') as OxalufiLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oxalufi = getOxalufiById(id);
      if (!oxalufi) {
        return NextResponse.json(
          { error: 'Oxalufi not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oxalufi });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOxalufi(query);
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