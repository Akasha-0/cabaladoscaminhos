// src/app/api/oxaguia/data/route.ts
// Oxaguiã API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OxaguiaLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OxaguiaQuery {
  level?: OxaguiaLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oxaguia {
  id: string;
  name: string;
  level: OxaguiaLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OXAGUIÃ DATA
// ============================================================

const oxaguiaData: Oxaguia[] = [
  {
    id: 'oxaguia-001',
    name: 'Primeiro Oxaguiã',
    level: 'initiate',
    description: 'A essência primordial de Oxaguiã, representando o fogo sagrado e a purificação inicial.',
    practices: ['meditacao-fogo', 'purificacao-interna'],
    symbol: '🔥',
    element: 'fogo-sagrado'
  },
  {
    id: 'oxaguia-002',
    name: 'Oxaguiã das Chamas',
    level: 'practitioner',
    description: 'Chama ardente que consome obstáculos e transforma a energia Vital em progresso.',
    practices: ['chama-ardente', 'transformacao-fogo'],
    symbol: '🌡️',
    element: 'chama'
  },
  {
    id: 'oxaguia-003',
    name: 'Oxaguiã Justo',
    level: 'adept',
    description: 'Luz Celestial que ilumina o caminho da justiça e da verdade, governante das chamas celestiais.',
    practices: ['luz-justa', 'verdade-interior'],
    symbol: '⚡',
    element: 'luz-celeste'
  },
  {
    id: 'oxaguia-004',
    name: 'Oxaguiã Supremo',
    level: 'master',
    description: 'Mestria completa sobre todas as chamas de Oxaguiã, transcendendo a matéria pelo fogo interior.',
    practices: ['uniao-cosmica', 'renascimento-fogo'],
    symbol: '💫',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOxaguia(): Oxaguia[] {
  return oxaguiaData;
}

function getOxaguiaById(id: string): Oxaguia | undefined {
  return oxaguiaData.find(o => o.id === id);
}

function filterOxaguia(query: OxaguiaQuery): Oxaguia[] {
  let results = [...oxaguiaData];

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

function getLevels(): { level: OxaguiaLevel; count: number }[] {
  const levels: OxaguiaLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oxaguiaData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oxaguia/data
 * Retrieve oxaguia data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OxaguiaQuery = {
      level: searchParams.get('level') as OxaguiaLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oxaguia = getOxaguiaById(id);
      if (!oxaguia) {
        return NextResponse.json(
          { error: 'Oxaguiã not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oxaguia });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOxaguia(query);
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
