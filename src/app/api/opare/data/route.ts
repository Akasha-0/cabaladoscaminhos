// src/app/api/opare/data/route.ts
// Oparé API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OpareLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OpareQuery {
  level?: OpareLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Opare {
  id: string;
  name: string;
  level: OpareLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OPARE DATA
// ============================================================

const opareData: Opare[] = [
  {
    id: 'opare-001',
    name: 'Oparé Primordial',
    level: 'initiate',
    description: 'A essência primordial de Oparé, representando o início da criação e a alegria de viver.',
    practices: ['saberes-basicos', 'introducao-a-agua'],
    symbol: '💧',
    element: 'agua-pura'
  },
  {
    id: 'opare-002',
    name: 'Oparé das Águas',
    level: 'practitioner',
    description: 'Guardiã das águas doces e salgadas, fluindo entre os mundos visível e invisível.',
    practices: ['fluxo-agua', 'conexao-marinhas'],
    symbol: '🌊',
    element: 'agua-viva'
  },
  {
    id: 'opare-003',
    name: 'Oparé da Fertilidade',
    level: 'adept',
    description: 'Mestra da fertilidade e da abundância, abençoando nascimentos e colheitas.',
    practices: ['ritual-abundancia', 'bencao-fertilidade'],
    symbol: '🌺',
    element: 'fertilidade'
  },
  {
    id: 'opare-004',
    name: 'Oparé Suprema',
    level: 'master',
    description: 'Mestria completa sobre a energia feminina sagrada, a sensualidade e o poder de criação.',
    practices: ['energia-feminina-cosmica', 'criacao-sagrada'],
    symbol: '✨',
    element: 'criacao'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOpare(): Opare[] {
  return opareData;
}

function getOpareById(id: string): Opare | undefined {
  return opareData.find(o => o.id === id);
}

function filterOpare(query: OpareQuery): Opare[] {
  let results = [...opareData];

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

function getLevels(): { level: OpareLevel; count: number }[] {
  const levels: OpareLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: opareData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/opare/data
 * Retrieve opare data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OpareQuery = {
      level: searchParams.get('level') as OpareLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const opare = getOpareById(id);
      if (!opare) {
        return NextResponse.json(
          { error: 'Oparé not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: opare });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOpare(query);
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
