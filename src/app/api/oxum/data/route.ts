// src/app/api/oxum/data/route.ts
// Oxum API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OxumLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OxumQuery {
  level?: OxumLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oxum {
  id: string;
  name: string;
  level: OxumLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OXUM DATA
// ============================================================

const oxumData: Oxum[] = [
  {
    id: 'oxum-001',
    name: 'Primeiro Oxum',
    level: 'initiate',
    description: 'A essência primordial de Oxum, representando as águas doces e a fertilidade inicial.',
    practices: ['meditacao-agua', 'afirmações-de-abundancia'],
    symbol: '💧',
    element: 'agua-doce'
  },
  {
    id: 'oxum-002',
    name: 'Oxum das Correntes',
    level: 'practitioner',
    description: 'Fluxo contínuo de energia financeira e emocional, conectando recursos e relationships.',
    practices: ['fluxo-de-rio', 'harmonia-relacional'],
    symbol: '🌊',
    element: 'correnteza'
  },
  {
    id: 'oxum-003',
    name: 'Oxum Rainha',
    level: 'adept',
    description: 'Soberania sobre recursos materiais e emocionais, governanta das águas terrenais.',
    practices: ['coroa-de-luz', 'realeza-interior'],
    symbol: '👑',
    element: 'reino'
  },
  {
    id: 'oxum-004',
    name: 'Oxum Supremo',
    level: 'master',
    description: 'Mestria completa sobre todos os fluxos de Oxum, transcendendo a manifestação material.',
    practices: ['uniao-cosmica', 'transformacao-total'],
    symbol: '✨',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOxum(): Oxum[] {
  return oxumData;
}

function getOxumById(id: string): Oxum | undefined {
  return oxumData.find(o => o.id === id);
}

function filterOxum(query: OxumQuery): Oxum[] {
  let results = [...oxumData];

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

function getLevels(): { level: OxumLevel; count: number }[] {
  const levels: OxumLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oxumData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oxum/data
 * Retrieve oxum data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OxumQuery = {
      level: searchParams.get('level') as OxumLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oxum = getOxumById(id);
      if (!oxum) {
        return NextResponse.json(
          { error: 'Oxum not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oxum });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOxum(query);
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