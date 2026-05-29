// src/app/api/oja/data/route.ts
// Oja API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OjaLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OjaQuery {
  level?: OjaLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oja {
  id: string;
  name: string;
  level: OjaLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OJA DATA
// ============================================================

const ojaData: Oja[] = [
  {
    id: 'oja-001',
    name: 'Primeiro Oja',
    level: 'initiate',
    description: 'A essência primordial de Oja, representando a abundância inicial e a semente da prosperidade.',
    practices: ['meditacao-abundancia', 'afirmacoes-de-prosperidade'],
    symbol: '🌱',
    element: 'semente'
  },
  {
    id: 'oja-002',
    name: 'Oja das Riquezas',
    level: 'practitioner',
    description: 'Fluxo contínuo de prosperidade material e espiritual, conectando recursos e oportunidades.',
    practices: ['fluxo-de-riqueza', 'gratidao-diaria'],
    symbol: '💰',
    element: 'abundancia'
  },
  {
    id: 'oja-003',
    name: 'Oja Guardião',
    level: 'adept',
    description: 'Soberania sobre recursos materiais e proteção das bênçãos, guardião das portas da prosperidade.',
    practices: ['protecao-da-bencao', 'harmonia-financeira'],
    symbol: '🛡️',
    element: 'guarda'
  },
  {
    id: 'oja-004',
    name: 'Oja Supremo',
    level: 'master',
    description: 'Mestria completa sobre todos os fluxos de Oja, transcendendo a manifestação material para a abundância espiritual.',
    practices: ['uniao-cosmica', 'prosperidade-infinita'],
    symbol: '✨',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOja(): Oja[] {
  return ojaData;
}

function getOjaById(id: string): Oja | undefined {
  return ojaData.find(o => o.id === id);
}

function filterOja(query: OjaQuery): Oja[] {
  let results = [...ojaData];

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

function getLevels(): { level: OjaLevel; count: number }[] {
  const levels: OjaLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: ojaData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oja/data
 * Retrieve oja data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OjaQuery = {
      level: searchParams.get('level') as OjaLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oja = getOjaById(id);
      if (!oja) {
        return NextResponse.json(
          { error: 'Oja not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oja });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOja(query);
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