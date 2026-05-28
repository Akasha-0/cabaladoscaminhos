// src/app/api/obaxoxe/data/route.ts
// Obaxoxe API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type ObaxoxeLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface ObaxoxeQuery {
  level?: ObaxoxeLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Obaxoxe {
  id: string;
  name: string;
  level: ObaxoxeLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OBAXOXE DATA
// ============================================================

const obaxoxeData: Obaxoxe[] = [
  {
    id: 'obaxoxe-001',
    name: 'Primeiro Obaxoxe',
    level: 'initiate',
    description: 'A essência primordial de Obaxoxe, representando a transformação e renovação espiritual.',
    practices: ['renovacao-interior', 'transformacao-essencial'],
    symbol: '🌱',
    element: 'transformacao'
  },
  {
    id: 'obaxoxe-002',
    name: 'Obaxoxe das Transições',
    level: 'practitioner',
    description: 'Guia das mudanças e transições da vida, acompanhando nos momentos de metamorfose.',
    practices: ['transicao-consciente', 'guia-da-mudanca'],
    symbol: '🦋',
    element: 'metamorfose'
  },
  {
    id: 'obaxoxe-003',
    name: 'Obaxoxe Guardião',
    level: 'adept',
    description: 'Protetor dos mistérios ocultos e guardião das portas entre mundos.',
    practices: ['protecao-sagrada', 'guardiao-dos-mistérios'],
    symbol: '🔮',
    element: 'mistério'
  },
  {
    id: 'obaxoxe-004',
    name: 'Obaxoxe Supremo',
    level: 'master',
    description: 'Mestria completa sobre todos os aspectos da transformação, transcendendo limites materiais.',
    practices: ['uniao-transcendente', 'mestria-total'],
    symbol: '⚡',
    element: 'transcendência'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllObaxoxe(): Obaxoxe[] {
  return obaxoxeData;
}

function getObaxoxeById(id: string): Obaxoxe | undefined {
  return obaxoxeData.find(o => o.id === id);
}

function filterObaxoxe(query: ObaxoxeQuery): Obaxoxe[] {
  let results = [...obaxoxeData];

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

function getLevels(): { level: ObaxoxeLevel; count: number }[] {
  const levels: ObaxoxeLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: obaxoxeData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/obaxoxe/data
 * Retrieve obaxoxe data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: ObaxoxeQuery = {
      level: searchParams.get('level') as ObaxoxeLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const obaxoxe = getObaxoxeById(id);
      if (!obaxoxe) {
        return NextResponse.json(
          { error: 'Obaxoxe not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: obaxoxe });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterObaxoxe(query);
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