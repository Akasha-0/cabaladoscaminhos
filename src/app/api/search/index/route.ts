// ============================================================
// SEARCH INDEX API - CABALA DOS CAMINHOS
// ============================================================
// Core search endpoint for spiritual content discovery
// Searches across: Odús, Orixás, rituals, tarot, affirmations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
import { orixas, odus } from '@/lib/data/spiritual-data';
import { TAROT_DECK } from '@/lib/tarot/cards';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const SearchQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(['odu', 'orixa', 'ritual', 'tarot', 'all']).optional(),
  element: ElementSchema.optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Search Results ──────────────────────────────────────────
const TYPE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  odu: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'O destino se revela através dos Odús',
    frequency: '741 Hz',
  },
  orixa: {
    sefirot: ['Tipheret', 'Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Os Orixás me guiam na luz',
    frequency: '963 Hz',
  },
  ritual: {
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O ritual me conecta às forças sagradas',
    frequency: '528 Hz',
  },
  tarot: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'As cartas revelam minha verdade interior',
    frequency: '639 Hz',
  },
};

// ============================================================
// TYPES
// ============================================================

export interface SearchResult {
  type: 'odu' | 'orixa' | 'ritual' | 'tarot';
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  relevance: number;
  metadata?: Record<string, unknown>;
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

// fallow-ignore-next-line unused-type
export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  filters: {
    categories: string[];
    elements: string[];
    orixas: string[];
  };
  timestamp: string;
  spiritualCorrelations: Record<string, {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  }>;
  spiritualStats: {
    byType: Record<string, number>;
    bySefirot: Record<string, number>;
    byChakra: Record<string, number>;
    byElement: Record<string, number>;
    byOrixa: Record<string, number>;
  };
}

// ============================================================
// RITUALS DATA
// ============================================================

const ritualsData = [
  {
    id: 'abrir-caminhos',
    title: 'Ritual de Abertura de Caminhos',
    elementos: ['Ar', 'Fogo'],
    orixas: ['Ogum', 'Oxóssi'],
    descricao: 'Ritual para abrir novos caminhos e remover obstáculos',
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Ogum',
    affirmation: 'Abro meu caminho com coragem',
    frequency: '528 Hz',
  },
  {
    id: 'limpeza-energetica',
    title: 'Ritual de Limpeza Energética',
    elementos: ['Água'],
    orixas: ['Oxum', 'Nanã'],
    descricao: 'Ritual para limpeza e purificação de energias negativas',
    sefirot: ['Binah', 'Yesod'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'As águas purificam meu ser',
    frequency: '417 Hz',
  },
  {
    id: 'protecao',
    title: 'Ritual de Proteção',
    elementos: ['Terra', 'Fogo'],
    orixas: ['Ogum', 'Iansã'],
    descricao: 'Ritual para proteção espiritual e física',
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'A proteção divina me envolve',
    frequency: '396 Hz',
  },
  {
    id: 'amor-prosperidade',
    title: 'Ritual de Amor e Prosperidade',
    elementos: ['Água', 'Fogo'],
    orixas: ['Oxum', 'Xara'],
    descricao: 'Ritual para atrair amor e prosperidade',
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Amor e abundância fluem para mim',
    frequency: '528 Hz',
  },
  {
    id: 'ancestral',
    title: 'Ritual de Conexão Ancestral',
    elementos: ['Terra'],
    orixas: ['Nanã', 'Ewa'],
    descricao: 'Ritual para conexão com ancestrais e forças espirituais',
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'Meus ancestrais me guiam',
    frequency: '396 Hz',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function searchRituals(query: string, filters: { element?: string; orixa?: string }): SearchResult[] {
  const q = query.toLowerCase();
  return ritualsData
// fallow-ignore-next-line complexity
    .filter(r => {
      if (q && !r.title.toLowerCase().includes(q) && !r.descricao.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.element && !r.elementos.includes(filters.element)) {
        return false;
      }
      if (filters.orixa && !r.orixas.includes(filters.orixa)) {
        return false;
      }
      return true;
    })
    .map(r => ({
      type: 'ritual' as const,
      id: r.id,
      title: r.title,
      description: r.descricao,
      relevance: q ? (r.title.toLowerCase().includes(q) ? 1 : 0.5) : 1,
      sefirot: r.sefirot,
      chakra: r.chakra,
      element: r.element,
      orixa: r.orixa,
      affirmation: r.affirmation,
      frequency: r.frequency,
      spiritualCorrelations: TYPE_SPIRITUAL_CORRELATIONS.ritual,
    }));
}

function searchOrixas(query: string): SearchResult[] {
  const q = query.toLowerCase();
  return orixas
    .filter(o => q === '' || o.nome.toLowerCase().includes(q) || o.misterio.toLowerCase().includes(q))
    .map(o => ({
      type: 'orixa' as const,
      id: o.id || o.nome,
      title: o.nome,
      description: o.misterio,
      relevance: q ? (o.nome.toLowerCase().includes(q) ? 1 : 0.5) : 1,
      sefirot: ['Tipheret', 'Kether'],
      chakra: 7,
      element: 'Éter',
      orixa: o.nome,
      affirmation: `Os ${o.nome} me guiam na luz`,
      frequency: '963 Hz',
      spiritualCorrelations: TYPE_SPIRITUAL_CORRELATIONS.orixa,
    }));
}

function searchOdus(query: string): SearchResult[] {
  const q = query.toLowerCase();
  return odus
    .filter(o => q === '' || o.nome.toLowerCase().includes(q) || o.significado.toLowerCase().includes(q))
    .map(o => ({
      type: 'odu' as const,
      id: String(o.numero) || o.nome,
      title: o.nome,
      description: o.significado,
      relevance: q ? (o.nome.toLowerCase().includes(q) ? 1 : 0.5) : 1,
      sefirot: ['Binah', 'Chokhmah'],
      chakra: 6,
      element: 'Fogo',
      orixa: 'Orunmilá',
      affirmation: 'O destino se revela através dos Odús',
      frequency: '741 Hz',
      spiritualCorrelations: TYPE_SPIRITUAL_CORRELATIONS.odu,
    }));
}

function searchTarot(query: string): SearchResult[] {
  const q = query.toLowerCase();
  return TAROT_DECK.cards
// fallow-ignore-next-line complexity
    .filter((c) => q === '' || c.name.toLowerCase().includes(q) || (c as any).significado?.toLowerCase().includes(q))
    .map((c) => ({
      type: 'tarot' as const,
      id: String(c.id),
      title: c.name,
      subtitle: (c as any).arcano || '',
      description: (c as any).significado || c.reversed[0] || c.upright[0] || '',
      relevance: q ? (c.name.toLowerCase().includes(q) ? 1 : 0.5) : 1,
      sefirot: ['Chokhmah', 'Netzach'],
      chakra: 6,
      element: 'Fogo',
      orixa: 'Oxum',
      affirmation: 'As cartas revelam minha verdade interior',
      frequency: '639 Hz',
      spiritualCorrelations: TYPE_SPIRITUAL_CORRELATIONS.tarot,
    }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parseResult = SearchQuerySchema.safeParse({
      q: url.searchParams.get('q'),
      type: url.searchParams.get('type'),
      element: url.searchParams.get('element'),
      sefirot: url.searchParams.get('sefirot'),
      chakra: url.searchParams.get('chakra'),
      orixa: url.searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { q, type, element, sefirot, chakra, orixa } = parseResult.data;
    const query = q || '';
    let results: SearchResult[] = [];

    if (type === 'all' || !type) {
      results = [
        ...searchOrixas(query),
        ...searchOdus(query),
        ...searchRituals(query, { element, orixa }),
        ...searchTarot(query),
      ];
    } else if (type === 'orixa') {
      results = searchOrixas(query);
    } else if (type === 'odu') {
      results = searchOdus(query);
    } else if (type === 'ritual') {
      results = searchRituals(query, { element, orixa });
    } else if (type === 'tarot') {
      results = searchTarot(query);
    }

    // Filter by spiritual dimensions
    if (sefirot) {
      results = results.filter(r => r.spiritualCorrelations.sefirot.includes(sefirot));
    }
    if (chakra) {
      results = results.filter(r => r.spiritualCorrelations.chakra === chakra);
    }
    if (element) {
      results = results.filter(r => r.spiritualCorrelations.element === element);
    }
    if (orixa) {
      results = results.filter(r => r.spiritualCorrelations.orixa === orixa);
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Calculate spiritual stats
    const spiritualStats = {
      byType: results.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: results.reduce((acc, r) => {
        r.spiritualCorrelations.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: results.reduce((acc, r) => {
        const c = r.spiritualCorrelations.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: results.reduce((acc, r) => {
        const e = r.spiritualCorrelations.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: results.reduce((acc, r) => {
        const o = r.spiritualCorrelations.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Extract unique filters
    const filters = {
      categories: [...new Set(results.map(r => r.type))],
      elements: [...new Set(results.map(r => r.spiritualCorrelations.element).filter(Boolean))],
      orixas: [...new Set(results.map(r => r.spiritualCorrelations.orixa).filter(Boolean))],
    };

    return NextResponse.json({
      query,
      results,
      total: results.length,
      filters,
      timestamp: new Date().toISOString(),
      spiritualCorrelations: TYPE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    }, { status: 500 });
  }
}