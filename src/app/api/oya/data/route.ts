// src/app/api/oya/data/route.ts
// Oya API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OyaLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OyaQuery {
  level?: OyaLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oya {
  id: string;
  name: string;
  level: OyaLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OYA DATA
// ============================================================

const oyaData: Oya[] = [
  {
    id: 'oya-001',
    name: 'Primeira Oya',
    level: 'initiate',
    description: 'A essência primordial de Oya, representando as tempestades e os ventos que renovam.',
    practices: ['meditacao-vento', 'afirmações-de-mudanca'],
    symbol: '🌀',
    element: 'vento'
  },
  {
    id: 'oya-002',
    name: 'Oya das Tempestades',
    level: 'practitioner',
    description: 'Força transformadora das tempestades, limpando caminhos e destruindo obstáculos.',
    practices: ['tempestade-interior', 'renovacao-radical'],
    symbol: '⛈️',
    element: 'tempestade'
  },
  {
    id: 'oya-003',
    name: 'Oya Guardiã dos Cemitérios',
    level: 'adept',
    description: 'Senhora dos cemitérios e guardiã das passagens, governanta das transformações últimas.',
    practices: ['portal-da-lua', 'passagem-do-velho'],
    symbol: '🕯️',
    element: 'transicao'
  },
  {
    id: 'oya-004',
    name: 'Oya Suprema',
    level: 'master',
    description: 'Mestria completa sobre todos os ventos e tempestades, transcendendo a transformação material.',
    practices: ['uniao-cosmica', 'transformacao-total'],
    symbol: '🌪️',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOya(): Oya[] {
  return oyaData;
}

function getOyaById(id: string): Oya | undefined {
  return oyaData.find(o => o.id === id);
}

function filterOya(query: OyaQuery): Oya[] {
  let results = [...oyaData];

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

function getLevels(): { level: OyaLevel; count: number }[] {
  const levels: OyaLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oyaData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oya/data
 * Retrieve oya data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OyaQuery = {
      level: searchParams.get('level') as OyaLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oya = getOyaById(id);
      if (!oya) {
        return NextResponse.json(
          { error: 'Oya not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oya });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOya(query);
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