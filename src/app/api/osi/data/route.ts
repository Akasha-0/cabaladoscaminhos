// src/app/api/osi/data/route.ts
// Osi API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OsiLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OsiQuery {
  level?: OsiLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Osi {
  id: string;
  name: string;
  level: OsiLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OSI DATA
// ============================================================

const osiData: Osi[] = [
  {
    id: 'osi-001',
    name: 'Primeiro Osí',
    level: 'initiate',
    description: 'A essência primordial de Osí, representando a energia das águas doces e da prosperidade inicial.',
    practices: ['meditacao-agua-doce', 'afirmações-de-abundancia'],
    symbol: '💧',
    element: 'agua-doce'
  },
  {
    id: 'osi-002',
    name: 'Osí das Correntes',
    level: 'practitioner',
    description: 'Fluxo contínuo de energia financeira e emocional, conectando recursos e relationships.',
    practices: ['fluxo-de-rio', 'harmonia-relacional'],
    symbol: '🌊',
    element: 'correnteza'
  },
  {
    id: 'osi-003',
    name: 'Osí Rainha',
    level: 'adept',
    description: 'Soberania sobre recursos materiais e emocionais, governanta das águas terrenais.',
    practices: ['coroa-de-luz', 'realeza-interior'],
    symbol: '👑',
    element: 'reino'
  },
  {
    id: 'osi-004',
    name: 'Osí Supremo',
    level: 'master',
    description: 'Mestria completa sobre todos os fluxos de Osí, transcendendo a manifestação material.',
    practices: ['uniao-cosmica', 'transformacao-total'],
    symbol: '✨',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOsi(): Osi[] {
  return osiData;
}

function getOsiById(id: string): Osi | undefined {
  return osiData.find(o => o.id === id);
}

function filterOsi(query: OsiQuery): Osi[] {
  let results = [...osiData];

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

function getLevels(): { level: OsiLevel; count: number }[] {
  const levels: OsiLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: osiData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/osi/data
 * Retrieve osi data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OsiQuery = {
      level: searchParams.get('level') as OsiLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const osi = getOsiById(id);
      if (!osi) {
        return NextResponse.json(
          { error: 'Osi not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: osi });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOsi(query);
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