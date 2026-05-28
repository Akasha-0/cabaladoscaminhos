// ============================================================
// SEARCH API - CABALA DOS CAMINHOS
// ============================================================
// Search across: Odús, Orixás, rituals, tarot
// Includes filters by category, element, orixa
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
  metadata?: Record<string, string | string[]>;
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
    orixas: ['Omolu', 'Oxumaré', 'Exu'],
  },
  {
    id: 'ebo-alinhamento',
    type: 'ritual' as const,
    title: 'Ebó de Alinhamento (Bori)',
    subtitle: 'Cura da Cabeça',
    description: 'Ebó para alinhamento espiritual com oferendas de canjica branca, algodão e velas brancas para Oxalá.',
    elementos: ['Ar', 'Água'],
    orixas: ['Oxalá', 'Jagun'],
  },
  {
    id: 'ebo-limpeza-astral',
    type: 'ritual' as const,
    title: 'Ebó de Limpeza Astral',
    subtitle: 'Purificação da aura',
    description: 'Ebó para limpeza astral com sacudimentos de folhas de fumo e oferendas de acarajé para Iansã.',
    elementos: ['Ar', 'Água'],
    orixas: ['Iansã', 'Iemanjá'],
  },
  {
    id: 'ebo-alivio',
    type: 'ritual' as const,
    title: 'Ebó de Alívio/Saúde',
    subtitle: 'Cura e paz',
    description: 'Ebó para alívio de doenças e cura espiritual com frutas brancas, banhos de leite de cabra e rezas mansas.',
    elementos: ['Ar', 'Água'],
    orixas: ['Oxalá', 'Obá'],
  },
  {
    id: 'ebo-movimento',
    type: 'ritual' as const,
    title: 'Ebó de Movimento',
    subtitle: 'Desbloqueio de energias',
    description: 'Ebó para movimento e desbloqueio com chaves girando, velas nas esquinas e banhos de guiné com arruda.',
    elementos: ['Fogo', 'Ar'],
    orixas: ['Iansã', 'Exu', 'Ogum'],
  },
  {
    id: 'ebo-justica',
    type: 'ritual' as const,
    title: 'Ebó de Justiça',
    subtitle: 'Equilíbrio kármico',
    description: 'Ebó para justiça com pedras de raio, amalá quente e firmeza espiritual.',
    elementos: ['Fogo'],
    orixas: ['Xangô', 'Obá'],
  },
  {
    id: 'ebo-evolucao',
    type: 'ritual' as const,
    title: 'Ebó de Evolução',
    subtitle: 'Crescimento espiritual',
    description: 'Ebó para evolução espiritual com oferendas na lama para Nanã, feijão preto e velas lilases.',
    elementos: ['Terra', 'Água'],
    orixas: ['Nanã', 'Omolu'],
  },
  {
    id: 'ebo-renovacao',
    type: 'ritual' as const,
    title: 'Ebó de Renovação',
    subtitle: 'Novo ciclo',
    description: 'Ebó para renovação com banhos de folhas de fortuna, dinheiro-em-penca e fitas coloridas.',
    elementos: ['Água', 'Terra'],
    orixas: ['Oxumaré', 'Ossain'],
  },
  {
    id: 'banho-ervas',
    type: 'ritual' as const,
    title: 'Banho de Ervas',
    subtitle: 'Purificação básica',
    description: 'Banho purificador com folhas específicas para cada necessidade espiritual.',
    elementos: ['Água'],
    orixas: [],
  },
  {
    id: 'defumacao',
    type: 'ritual' as const,
    title: 'Defumação',
    subtitle: 'Limpeza energética',
    description: 'Defumação com ervas secas e resinas para limpeza de ambientes e pessoas.',
    elementos: ['Fogo', 'Ar'],
    orixas: [],
  },
  {
    id: 'oracao-oxala',
    type: 'ritual' as const,
    title: 'Oração a Oxalá',
    subtitle: 'Paz e equilíbrio',
    description: 'Oração de paz e equilíbrio para invocar a energia de Oxalá.',
    elementos: ['Ar', 'Luz'],
    orixas: ['Oxalá'],
  },
  {
    id: 'firmeza-ogum',
    type: 'ritual' as const,
    title: 'Firmeza de Ogum',
    subtitle: 'Força e proteção',
    description: 'Ritual de firmeza para proteção e força espiritual com espada-de-são-jorge.',
    elementos: ['Fogo', 'Terra'],
    orixas: ['Ogum'],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function calculateRelevance(query: string, text: string): number {
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);

  if (normalizedText.includes(normalizedQuery)) {
    return 1.0;
  }

  const queryWords = normalizedQuery.split(/\s+/);
  const textWords = normalizedText.split(/\s+/);

  let matchCount = 0;
  for (const word of queryWords) {
    if (word.length >= 2 && textWords.some((tw) => tw.includes(word))) {
      matchCount++;
    }
  }

  return queryWords.length > 0 ? matchCount / queryWords.length : 0;
}

function searchOdus(query: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (const odu of odus) {
    const searchFields = [
      odu.nome,
      odu.significado,
      odu.elementos,
      odu.orixas.join(' '),
      odu.quizilas?.join(' ') || '',
      odu.preceitos || '',
      odu.ebo || '',
    ].join(' ');

    const relevance = calculateRelevance(query, searchFields);
    if (relevance > 0) {
      results.push({
        type: 'odu',
        id: `odu-${odu.numero}`,
        title: `${odu.numero} - ${odu.nome}`,
        subtitle: odu.elementos,
        description: odu.significado,
        relevance,
        metadata: {
          elementos: odu.elementos,
          orixas: odu.orixas,
          quizilas: odu.quizilas || [],
          preceitos: odu.preceitos || '',
          ebo: odu.ebo || '',
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
      orixa.dia,
      orixa.cores.join(' '),
      orixa.ervas.join(' '),
      orixa.planeta || '',
      orixa.saudacao || '',
      orixa.quizilas?.join(' ') || '',
    ].join(' ');

    const relevance = calculateRelevance(query, searchFields);
    if (relevance > 0) {
      results.push({
        type: 'orixa',
        id: `orixa-${orixa.nome.toLowerCase().replace(/\s+/g, '-')}`,
        title: orixa.nome,
        subtitle: orixa.dia,
        description: orixa.misterio,
        relevance,
        metadata: {
          dia: orixa.dia,
          cores: orixa.cores,
          chakra: orixa.chakra || '',
          planeta: orixa.planeta || '',
          ervas: orixa.ervas,
          quizilas: orixa.quizilas || [],
          saudacao: orixa.saudacao || '',
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
  const orixas = searchParams.get('orixas')?.split(',').filter(Boolean) || [];

  if (!query && !categories.length && !elements.length && !orixas.length) {
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

  const filteredResults = filterResults(allResults, { categories, elements, orixas });

  filteredResults.sort((a, b) => b.relevance - a.relevance);

  const response: SearchResponse = {
    query,
    results: filteredResults,
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
