// ============================================================
// SEARCH INDEX API - CABALA DOS CAMINHOS
// ============================================================
// Core search endpoint for spiritual content discovery
// Searches across: Odús, Orixás, rituals, tarot, affirmations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { orixas, odus } from '@/lib/data/spiritual-data';
import { TAROT_DECK } from '@/lib/tarot/cards';

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
}

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
  },
  {
    id: 'limpeza-energetica',
    title: 'Ritual de Limpeza Energética',
    elementos: ['Água'],
    orixas: ['Oxum', 'Nanã'],
    descricao: 'Ritual para limpeza e purificação de energias negativas',
  },
  {
    id: 'protecao',
    title: 'Ritual de Proteção',
    elementos: ['Terra', 'Fogo'],
    orixas: ['Ogum', 'Iansã'],
    descricao: 'Ritual para proteção espiritual e física',
  },
  {
    id: 'amor-prosperidade',
    title: 'Ritual de Amor e Prosperidade',
    elementos: ['Água', 'Fogo'],
    orixas: ['Oxum', 'Xara'],
    descricao: 'Ritual para atrair amor e prosperidade',
  },
  {
    id: 'ancestral',
    title: 'Ritual de Conexão Ancestral',
    elementos: ['Terra'],
    orixas: ['Nanã', 'Ewa'],
    descricao: 'Ritual para conexão com ancestrais e forças espirituais',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateRelevance(query: string, text: string): number {
  if (!query || !text) return 0;
  
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);
  
  if (normalizedText.includes(normalizedQuery)) {
    const indexOfMatch = normalizedText.indexOf(normalizedQuery);
    const positionBonus = 1 - (indexOfMatch / normalizedText.length);
    return 0.5 + (positionBonus * 0.5);
  }
  
  const queryWords = normalizedQuery.split(' ').filter(Boolean);
  let matches = 0;
  
  for (const word of queryWords) {
    if (normalizedText.includes(word)) {
      matches++;
    }
  }
  
  return matches / queryWords.length;
}

// ============================================================
// SEARCH FUNCTIONS
// ============================================================

function searchOdus(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const odu of odus) {
    const titleRelevance = calculateRelevance(query, odu.nome);
    const descRelevance = calculateRelevance(query, odu.significado);
    const elementoRelevance = calculateRelevance(query, odu.elementos);
    
    const relevance = Math.max(titleRelevance, descRelevance, elementoRelevance);
    
    if (relevance > 0.1) {
      results.push({
        type: 'odu',
        id: String(odu.numero),
        title: odu.nome,
        subtitle: `Ogbe - ${odu.significado}`,
        description: odu.significado,
        relevance,
        metadata: {
          elementos: odu.elementos,
          orixas: odu.orixas,
          significado: odu.significado,
        },
      });
    }
  }
  
  return results;
}

function searchOrixas(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const orixa of orixas) {
    const titleRelevance = calculateRelevance(query, orixa.nome);
    const descRelevance = calculateRelevance(query, orixa.misterio);
    const dominioRelevance = calculateRelevance(query, orixa.misterio || '');
    
    const relevance = Math.max(titleRelevance, descRelevance, dominioRelevance);
    
    if (relevance > 0.1) {
      results.push({
        type: 'orixa',
        id: String(orixa.nome),
        title: orixa.nome,
        subtitle: orixa.misterio,
        description: orixa.misterio,
        relevance,
        metadata: {
          elementos: [orixa.elemento ?? ''],
          dia: orixa.dia,
          cores: orixa.cores,
          numero: String(orixa.numero ?? ''),
        },
      });
    }
  }
  
  return results;
}

function searchRituals(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const ritual of ritualsData) {
    const titleRelevance = calculateRelevance(query, ritual.title);
    const descRelevance = calculateRelevance(query, ritual.descricao);
    
    const relevance = Math.max(titleRelevance, descRelevance);
    
    if (relevance > 0.1) {
      results.push({
        type: 'ritual',
        id: ritual.id,
        title: ritual.title,
        description: ritual.descricao,
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
    const titleRelevance = calculateRelevance(query, card.name);
    const uprightText = card.upright?.join(' ') || '';
    const descRelevance = calculateRelevance(query, uprightText);
    const relevance = Math.max(titleRelevance, descRelevance);
    
    if (relevance > 0.1) {
      results.push({
        type: 'tarot',
        id: String(card.id),
        title: card.name,
        subtitle: `${card.arcana} Arcana`,
        description: uprightText.substring(0, 200),
        relevance,
        metadata: {
          suit: card.suit ?? undefined,
          arcana: card.arcana,
          element: card.element,
        },
      });
    }
  }
  
  return results;
}

// ============================================================
// FILTER FUNCTIONS
// ============================================================

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
        ? (result.metadata.elementos as string[])
        : [String(result.metadata.elementos)];
      if (!filters.elements.some((el) => elementList.includes(el))) {
        return false;
      }
    }

    if (filters.orixas?.length && result.metadata?.orixas) {
      const orixaList = Array.isArray(result.metadata.orixas)
        ? (result.metadata.orixas as string[])
        : [String(result.metadata.orixas)];
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
    odu.elementos.split(' / ').forEach((el) => elements.add(el.trim()));
    odu.orixas.forEach((o) => orixaNames.add(o));
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

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || searchParams.get('query') || '';
  const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const elements = searchParams.get('elements')?.split(',').filter(Boolean) || [];
  const orixasParam = searchParams.get('orixas')?.split(',').filter(Boolean) || [];
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // Return available filters when no query
  if (!query && !categories.length && !elements.length && !orixasParam.length) {
    return NextResponse.json(
      {
        query: '',
        results: [],
        total: 0,
        filters: getAvailableFilters(),
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      }
    );
  }

  let allResults: SearchResult[] = [];

  if (query) {
    const [oduResults, orixaResults, ritualResults, tarotResults] = await Promise.all([
      Promise.resolve(searchOdus(query)),
      Promise.resolve(searchOrixas(query)),
      Promise.resolve(searchRituals(query)),
      Promise.resolve(searchTarot(query)),
    ]);

    allResults = [...oduResults, ...orixaResults, ...ritualResults, ...tarotResults];
  }

  const filteredResults = filterResults(allResults, { categories, elements, orixas: orixasParam });

  filteredResults.sort((a, b) => b.relevance - a.relevance);

  const paginatedResults = filteredResults.slice(offset, offset + limit);

  const response: SearchResponse = {
    query,
    results: paginatedResults,
    total: filteredResults.length,
    filters: getAvailableFilters(),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}