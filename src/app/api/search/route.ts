// ============================================================
// SEARCH API - CABALA DOS CAMINHOS
// ============================================================
// Search across: Odús, Orixás, rituals, tarot
// Includes filters by category, element, orixa
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { orixas, odus } from '@/lib/data/spiritual-data';
import { TAROT_DECK } from '@/lib/tarot/cards';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SearchTypeSchema = z.enum(['odu', 'orixa', 'ritual', 'tarot']);
const ElementSchema = z.enum(['Terra', 'Fogo', 'Água', 'Ar', 'Éter']);

const SearchResultSchema = z.object({
  type: SearchTypeSchema,
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  relevance: z.number().min(0).max(100),
  metadata: z.record(z.union([z.string(), z.array(z.string())])).optional(),
});

const SearchQuerySchema = z.object({
  q: z.string().optional(),
  query: z.string().optional(),
  categories: z.string().optional(),
  elements: z.string().optional(),
  orixas: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const SearchFiltersSchema = z.object({
  categories: z.array(SearchTypeSchema).optional(),
  elements: z.array(z.string()).optional(),
  orixas: z.array(z.string()).optional(),
});

// fallow-ignore-next-line unused-type
export type SearchResult = z.infer<typeof SearchResultSchema>;
export const dynamic = 'force-dynamic';

// ─── Types ──────────────────────────────────────────────────────────────
interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  filters: {
    categories: string[];
    elements: string[];
    orixas: string[];
  };
  timestamp: string;
}

// ─── Rituals Data ──────────────────────────────────────────────────────────────
const ritualsData = [
  {
    id: 'ebo-caminho',
    type: 'ritual' as const,
    title: 'Ebó de Caminho',
    subtitle: 'Abertura de caminhos',
    description: 'Ebó realizado para abrir caminhos bloqueados, com despachos em encruzilhadas, moedas, pipoca e panos escuros.',
    elementos: ['Terra', 'Fogo'],
    orixas: ['Exu', 'Omolu'],
  },
  {
    id: 'ebo-prosperidade',
    type: 'ritual' as const,
    title: 'Ebó de Prosperidade',
    subtitle: 'Atração de fartura',
    description: 'Ebó para atrair prosperidade e fartura, com doces, frutas e comidas leves em praças ou jardins.',
    elementos: ['Ar', 'Terra'],
    orixas: ['Ibeji', 'Ogum'],
  },
  {
    id: 'ebo-defesa',
    type: 'ritual' as const,
    title: 'Ebó de Defesa',
    subtitle: 'Proteção espiritual',
    description: 'Ebó de proteção contra energias negativas, com inhames assados, paliteiros de Ogum e limpeza com folhas.',
    elementos: ['Fogo', 'Terra'],
    orixas: ['Ogum', 'Obaluaê'],
  },
  {
    id: 'ebo-protecao',
    type: 'ritual' as const,
    title: 'Ebó de Proteção',
    subtitle: 'Escudo espiritual',
    description: 'Ebó para proteção espiritual com alimentos brancos, canjica na beira-mar para Iemanjá e banhos de folhas frias.',
    elementos: ['Fogo', 'Terra'],
    orixas: ['Iemanjá', 'Oxóssi', 'Egum'],
  },
  {
    id: 'ebo-atracao',
    type: 'ritual' as const,
    title: 'Ebó de Atração/Ouro',
    subtitle: 'Riqueza e doçura',
    description: 'Ebó para atrair riqueza e amor, com banhos de mel, caldas de frutas e oferendas com moedas douradas.',
    elementos: ['Água'],
    orixas: ['Oxum', 'Logun Edé'],
  },
  {
    id: 'ebo-fartura',
    type: 'ritual' as const,
    title: 'Ebó de Fartura',
    subtitle: 'Abundância material',
    description: 'Ebó para fartura com seis tipos de frutas, amalá para Xangô e partilha de banquetes.',
    elementos: ['Ar', 'Fogo'],
    orixas: ['Xangô', 'Oxóssi', 'Logun Edé'],
  },
  {
    id: 'ebo-transmutacao',
    type: 'ritual' as const,
    title: 'Ebó de Transmutação',
    subtitle: 'Transformação de energias',
    description: 'Ebó para transmutar energias pesadas com pipoca para Omolu, banhos de lama e defumações pesadas.',
    elementos: ['Terra', 'Água'],
    orixas: ['Omolu', 'Xangô'],
  },
  {
    id: 'ebo-amor',
    type: 'ritual' as const,
    title: 'Ebó de Amor',
    subtitle: 'Harmonia afetiva',
    description: 'Ebó para questões amorosas com flores roses, mel, velas rosas e banhos de alecrim.',
    elementos: ['Água', 'Fogo'],
    orixas: ['Oxum', 'Iemanjá'],
  },
  {
    id: 'ebo-saude',
    type: 'ritual' as const,
    title: 'Ebó de Saúde',
    subtitle: 'Cura física e espiritual',
    description: 'Ebó para cura de doenças com banhos de ervas, velas verdes, e ervas de cura.',
    elementos: ['Terra', 'Água'],
    orixas: ['Oxumar', 'Nanã'],
  },
  {
    id: 'ebo-ancestral',
    type: 'ritual' as const,
    title: 'Ebó Ancestral',
    subtitle: 'Conexão com antepassados',
    description: 'Ebó para honrar antepassados com alimentos simples, velas brancas e oferendas na terra.',
    elementos: ['Terra'],
    orixas: ['Iemanjá', 'Omolu'],
  },
];

// ─── Search Functions ──────────────────────────────────────────────────────────────
function calculateRelevance(query: string, text: string): number {
  if (!query || !text) return 0;
  
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  const textWords = normalizedText.split(/\s+/);
  
  let matches = 0;
  for (const word of queryWords) {
    if (normalizedText.includes(word)) {
      matches++;
    }
  }
  
  if (matches === 0) return 0;
  
  const exactMatch = normalizedText.includes(normalizedQuery) ? 50 : 0;
  const wordMatch = (matches / queryWords.length) * 30;
  const lengthPenalty = Math.max(0, 20 - Math.abs(textWords.length - queryWords.length) * 2);
  
  return Math.min(100, exactMatch + wordMatch + lengthPenalty);
}

function searchOdus(query: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (const odu of odus) {
    const searchFields = [
      odu.nome,
      odu.significado,
      odu.orixas[0],
      odu.elementos,
      odu.ebo,
    ].join(' ');

    const relevance = calculateRelevance(query, searchFields);
    if (relevance > 0) {
      results.push({
        type: 'odu',
        id: `odu-${odu.numero}`,
        title: odu.nome,
        subtitle: `Odú ${odu.numero}`,
        description: odu.significado,
        relevance,
        metadata: {
          elementos: odu.elementos,
          orixas: odu.orixas,
          ebo: odu.ebo,
        },
      });
    }
  }

  return results;
}

function searchOrixas(query: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (const orixa of orixas) {
    const searchFields = [
      orixa.nome,
      orixa.misterio,
      orixa.elemento || '',
      orixa.cores[0],
      orixa.dia,
      orixa.saudacao,
    ].join(' ');

    const relevance = calculateRelevance(query, searchFields);
    if (relevance > 0) {
      results.push({
        type: 'orixa',
        id: orixa.nome.toLowerCase().replace(/\s+/g, '-'),
        title: orixa.nome,
        subtitle: orixa.elemento || '',
        description: orixa.misterio,
        relevance,
        metadata: {
          elemento: orixa.elemento || '',
          cores: orixa.cores,
          dia: orixa.dia,
          planeta: orixa.planeta,
        },
      });
    }
  }

  return results;
}

function searchRituals(query: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (const ritual of ritualsData) {
    const searchFields = [
      ritual.title,
      ritual.subtitle || '',
      ritual.description,
      ritual.elementos.join(' '),
      ritual.orixas.join(' '),
    ].join(' ');

    const relevance = calculateRelevance(query, searchFields);
    if (relevance > 0) {
      results.push({
        type: 'ritual',
        id: ritual.id,
        title: ritual.title,
        subtitle: ritual.subtitle,
        description: ritual.description,
        relevance,
        metadata: {
          elementos: ritual.elementos,
          orixas: ritual.orixas,
        },
      });
    }
  }

  return results;
}

function searchTarot(query: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (const card of TAROT_DECK.cards) {
    const searchFields = [
      card.name,
      card.arcana,
      card.suit || '',
      card.element || '',
      card.astro || '',
      card.upright.join(' '),
      card.reversed.join(' '),
    ].join(' ');

    const relevance = calculateRelevance(query, searchFields);
    if (relevance > 0) {
      results.push({
        type: 'tarot',
        id: `tarot-${card.id}`,
        title: card.name,
        subtitle: card.arcana === 'major' ? 'Arcana Maior' : card.suit || 'Minor',
        description: card.upright.slice(0, 2).join('. '),
        relevance,
        metadata: {
          arcana: card.arcana,
          suit: card.suit || '',
          number: card.number?.toString() || '',
          element: card.element || '',
          astro: card.astro || '',
        },
      });
    }
  }

  return results;
}

function filterResults(
  results: SearchResult[],
  filters: {
    categories?: string[];
    elements?: string[];
    orixas?: string[];
  }
): SearchResult[] {
  if (!filters.categories?.length && !filters.elements?.length && !filters.orixas?.length) {
    return results;
  }

  return results.filter((result) => {
    if (filters.categories?.length && !filters.categories.includes(result.type)) {
      return false;
    }

    if (filters.elements?.length && result.metadata?.elementos) {
      const elementList = Array.isArray(result.metadata.elementos)
        ? result.metadata.elementos
        : [result.metadata.elementos as string];
      if (!filters.elements.some((el) => elementList.includes(el))) {
        return false;
      }
    }

    if (filters.orixas?.length && result.metadata?.orixas) {
      const orixaList = Array.isArray(result.metadata.orixas)
        ? result.metadata.orixas
        : [result.metadata.orixas as string];
      if (!filters.orixas.some((o) => orixaList.includes(o))) {
        return false;
      }
    }

    return true;
  });
}

function getAvailableFilters(): SearchResponse['filters'] {
  const elements = new Set<string>();
  const orixaNames = new Set<string>();

  for (const odu of odus) {
    odu.elementos.split(' / ').forEach((el: string) => elements.add(el.trim()));
    odu.orixas.forEach((o: string) => orixaNames.add(o));
  }

  for (const ritual of ritualsData) {
    ritual.elementos.forEach((el) => elements.add(el));
    ritual.orixas.forEach((o) => orixaNames.add(o));
  }

  return {
    categories: ['odu', 'orixa', 'ritual', 'tarot'],
    elements: Array.from(elements).sort(),
    orixas: Array.from(orixaNames).sort(),
  };
}

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = SearchQuerySchema.safeParse({
      q: searchParams.get('q'),
      query: searchParams.get('query'),
      categories: searchParams.get('categories'),
      elements: searchParams.get('elements'),
      orixas: searchParams.get('orixas'),
      limit: searchParams.get('limit'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { q, query, categories, elements, orixas, limit } = parseResult.data;
    const searchQuery = q || query || '';
    const categoryList = categories?.split(',').filter(Boolean) || [];
    const elementList = elements?.split(',').filter(Boolean) || [];
    const orixaList = orixas?.split(',').filter(Boolean) || [];

    if (!searchQuery && !categoryList.length && !elementList.length && !orixaList.length) {
      return NextResponse.json({
        success: true,
        query: '',
        results: [],
        total: 0,
        filters: getAvailableFilters(),
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      });
    }

    let allResults: SearchResult[] = [];

    if (searchQuery) {
      const [oduResults, orixaResults, ritualResults, tarotResults] = await Promise.all([
        Promise.resolve(searchOdus(searchQuery)),
        Promise.resolve(searchOrixas(searchQuery)),
        Promise.resolve(searchRituals(searchQuery)),
        Promise.resolve(searchTarot(searchQuery)),
      ]);

      allResults = [...oduResults, ...orixaResults, ...ritualResults, ...tarotResults];
    }

    const filteredResults = filterResults(allResults, {
      categories: categoryList,
      elements: elementList,
      orixas: orixaList,
    });

    filteredResults.sort((a, b) => b.relevance - a.relevance);

    // Apply limit
    const limitedResults = limit ? filteredResults.slice(0, limit) : filteredResults;

    // Statistics
    const stats = {
      byType: filteredResults.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalSearched: allResults.length,
      matched: filteredResults.length,
    };

    const response: SearchResponse = {
      query: searchQuery,
      results: limitedResults,
      total: limitedResults.length,
      filters: getAvailableFilters(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      ...response,
      stats,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}