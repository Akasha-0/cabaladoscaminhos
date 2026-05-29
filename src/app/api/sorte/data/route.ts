// src/app/api/sorte/data/route.ts
// Sorte API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type SorteLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface SorteQuery {
  level?: SorteLevel;
  type?: 'fortune' | 'luck' | 'destiny';
  search?: string;
  page?: number;
  limit?: number;
}

export interface Sorte {
  id: string;
  name: string;
  level: SorteLevel;
  type: 'fortune' | 'luck' | 'destiny';
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// SORTE DATA
// ============================================================

const sorteData: Sorte[] = [
  {
    id: 'sorte-001',
    name: 'Fortuna Inicial',
    level: 'initiate',
    type: 'fortune',
    description: 'Primeira essência da sorte, representando oportunidades que surgem naturalmente.',
    practices: ['gratidao-diária', 'reconhecimento-de-sinais'],
    symbol: '🍀',
    element: 'oportunidade'
  },
  {
    id: 'sorte-002',
    name: 'Sorte do Início',
    level: 'initiate',
    type: 'luck',
    description: 'Pequenos golpes de sorte no cotidiano, momentos felizes que surgem sem esforço.',
    practices: ['meditacao-sorte', 'afirmacoes-de-abundancia'],
    symbol: '✨',
    element: 'felicidade'
  },
  {
    id: 'sorte-003',
    name: 'Destino Certo',
    level: 'practitioner',
    type: 'destiny',
    description: 'Conexão com o destino positivo, atraindo situações favoráveis e encontros significativos.',
    practices: ['visualizacao-positiva', 'afirmacoes-de-destino'],
    symbol: '⭐',
    element: 'destino'
  },
  {
    id: 'sorte-004',
    name: 'Fortuna Flutuante',
    level: 'practitioner',
    type: 'fortune',
    description: 'Mobilidade da sorte que flui entre diferentes áreas da vida, trazendo fartura.',
    practices: ['ritual-de-fluxo', 'harmonia-ciclica'],
    symbol: '🌊',
    element: 'fluxo'
  },
  {
    id: 'sorte-005',
    name: 'Sorte Manifesta',
    level: 'adept',
    type: 'luck',
    description: 'Capacidade de manifestar sorte através de práticas espirituais e intenção correta.',
    practices: ['ritual-de-manifestacao', 'Lei-da-Atração'],
    symbol: '🌟',
    element: 'manifestacao'
  },
  {
    id: 'sorte-006',
    name: 'Destino Majestoso',
    level: 'adept',
    type: 'destiny',
    description: 'Soberania sobre o próprio destino, criando o futuro com clareza e propósito.',
    practices: ['coroa-de-destino', 'proposito-maior'],
    symbol: '👑',
    element: 'proposito'
  },
  {
    id: 'sorte-007',
    name: 'Fortuna Eterna',
    level: 'master',
    type: 'fortune',
    description: 'Mestria completa sobre as energias da sorte, transcendendo局限 e alcançando-abundancia-perene.',
    practices: ['uniao-cosmica', 'abundancia-eterna'],
    symbol: '🌈',
    element: 'eternidade'
  },
  {
    id: 'sorte-008',
    name: 'Destino Cósmico',
    level: 'master',
    type: 'destiny',
    description: 'Conexão com o destino cósmico, alinhando-se com a sorte universal e infinita.',
    practices: ['harmonia-cUniversal', 'sincronicidade-plena'],
    symbol: '🌌',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllSorte(): Sorte[] {
  return sorteData;
}

function getSorteById(id: string): Sorte | undefined {
  return sorteData.find(s => s.id === id);
}

function filterSorte(query: SorteQuery): Sorte[] {
  let results = [...sorteData];

  if (query.level) {
    results = results.filter(s => s.level === query.level);
  }

  if (query.type) {
    results = results.filter(s => s.type === query.type);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(searchLower) ||
      s.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: SorteLevel; count: number }[] {
  const levels: SorteLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: sorteData.filter(s => s.level === level).length
  }));
}

function getTypes(): { type: 'fortune' | 'luck' | 'destiny'; count: number }[] {
  const types: ('fortune' | 'luck' | 'destiny')[] = ['fortune', 'luck', 'destiny'];
  return types.map(type => ({
    type,
    count: sorteData.filter(s => s.type === type).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/sorte/data
 * Retrieve sorte data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: SorteQuery = {
      level: searchParams.get('level') as SorteLevel | undefined,
      type: searchParams.get('type') as 'fortune' | 'luck' | 'destiny' | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const sorte = getSorteById(id);
      if (!sorte) {
        return NextResponse.json(
          { error: 'Sorte not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: sorte });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Check for types summary
    const showTypes = searchParams.get('types');
    if (showTypes === 'true') {
      return NextResponse.json({ data: getTypes() });
    }

    // Filter and paginate results
    const filtered = filterSorte(query);
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
