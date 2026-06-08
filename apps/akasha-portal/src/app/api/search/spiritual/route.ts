import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { orixas, odus } from '@/lib/domain/data/spiritual-data';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SpiritualSearchQuerySchema = z.object({
  q: z.string().min(1, 'Query é obrigatória'),
  type: z.enum(['odus', 'orixas', 'affirmations', 'rituals', 'numerology', 'cycles', 'all']).optional().default('all'),
  category: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});
// ============================================================
// TYPES
// ============================================================
export interface SpiritualSearchResult {
  type: 'odu' | 'orixa' | 'ritual' | 'afirmation' | 'numerology' | 'cicle';
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  relevance: number;
  metadata?: Record<string, string | string[]>;
}

// fallow-ignore-next-line unused-type
export interface SpiritualSearchResponse {
  query: string;
  results: SpiritualSearchResult[];
  total: number;
  filters: {
    categories: string[];
    elements: string[];
    orixas: string[];
  };
  timestamp: string;
}

// ============================================================
// SPIRITUAL DATA
// ============================================================

const spiritualData = {
  affirmations: [
    { id: 'oxala-paz', title: 'Afirmação de Oxalá', text: 'Eu sou luz, paz e equilíbrio. Oxalá guia meus passos com amor e serenidade.', orixas: ['Oxalá'], elements: ['Luz'] },
    { id: 'ogum-forca', title: 'Afirmação de Ogum', text: 'Tenho força e coragem para superar todos os obstáculos. Ogum me protege em minha jornada.', orixas: ['Ogum'], elements: ['Fogo'] },
    { id: 'iemanja-protecao', title: 'Afirmação de Iemanjá', text: 'Sou protegido pela mãe do mar. Iemanjá abraça minha alma com paz e amor.', orixas: ['Iemanjá'], elements: ['Água'] },
    { id: 'oxum-amor', title: 'Afirmação de Oxum', text: 'O amor flui em minha vida como as águas do rio. Oxum abençoa meu coração.', orixas: ['Oxum'], elements: ['Água'] },
    { id: 'xango-justica', title: 'Afirmação de Xangô', text: 'A justiça divina guia minhas ações. Xangô me dá força e equilíbrio.', orixas: ['Xangô'], elements: ['Fogo'] },
    { id: 'iansa-mudanca', title: 'Afirmação de Iansã', text: 'Abraço as mudanças com coragem e sabedoria. Iansã desperta minha força interior.', orixas: ['Iansã'], elements: ['Fogo', 'Ar'] },
    { id: 'obatala-pureza', title: 'Afirmação de Obatalá', text: ' Minha mente é clara e pura. Obatalá ilumina meu caminho com sabedoria.', orixas: ['Obatalá'], elements: ['Luz'] },
    { id: 'omolu-saude', title: 'Afirmação de Omolu', text: 'Sou saudável e protegido de todas as doenças. Omolu cura meu corpo e alma.', orixas: ['Omolu'], elements: ['Terra'] },
  ],
  rituals: [
    { id: 'ebo-caminho', title: 'Ebó de Caminho', subtitle: 'Abertura de caminhos', description: 'Ebó para abrir caminhos bloqueados, com despachos em encruzilhadas, moedas e pipoca.', elementos: ['Terra', 'Fogo'], orixas: ['Exu', 'Omolu'] },
    { id: 'ebo-prosperidade', title: 'Ebó de Prosperidade', subtitle: 'Atração de fartura', description: 'Ebó para atrair prosperidade com doces, frutas e comidas leves em praças.', elementos: ['Ar', 'Terra'], orixas: ['Ibeji', 'Ogum'] },
    { id: 'ebo-defesa', title: 'Ebó de Defesa', subtitle: 'Proteção espiritual', description: 'Ebó de proteção com inhames, paliteiros de Ogum e limpeza com folhas.', elementos: ['Fogo', 'Terra'], orixas: ['Ogum', 'Obaluaê'] },
    { id: 'boro-cabeca', title: 'Bori - Oferecimento à Cabeça', subtitle: 'Alimentar o Ori', description: 'Ritual de alimentação da cabeça com oferendas de canjica, algodão e velas brancas.', elementos: ['Ar', 'Luz'], orixas: ['Oxalá'] },
    { id: 'xorire-egungun', title: 'Xorire - Saudação aos Orixás', subtitle: 'Reverência ancestral', description: 'Cerimônia de reverência aos orixás com ebós específicos para cada divindade.', elementos: ['Fogo', 'Água'], orixas: ['Oxalá', 'Iemanjá'] },
  ],
  numerology: [
    { id: 'numero-1', title: 'Número 1 - Liderança', description: 'Iniciativa, independência, originalidade. O número do líder e pioneiro.', elements: ['Fogo'], orixas: ['Ogum'] },
    { id: 'numero-2', title: 'Número 2 - Parceria', description: 'Cooperação, adaptação, diplomatia. O número do diplomata e mediador.', elements: ['Água'], orixas: ['Iemanjá'] },
    { id: 'numero-3', title: 'Número 3 - Expressão', description: 'Comunicação, criatividade, sociabilidade. O número do artista e comunicador.', elements: ['Fogo'], orixas: ['Iansã'] },
    { id: 'numero-4', title: 'Número 4 - Estabilidade', description: 'Praticidade, organização, trabalho. O número do construtor e executor.', elements: ['Terra'], orixas: ['Obatalá'] },
    { id: 'numero-5', title: 'Número 5 - Liberdade', description: 'Adaptabilidade, liberdade, aventura. O número do explorador e innovador.', elements: ['Ar'], orixas: ['Iansã'] },
    { id: 'numero-6', title: 'Número 6 - Harmonia', description: 'Responsabilidade, família, serviço. O número do cuidador e harmonizador.', elements: ['Água'], orixas: ['Oxum'] },
    { id: 'numero-7', title: 'Número 7 - Percepção', description: 'Análise, espiritualidade, introspecção. O número do buscador e filósofo.', elements: ['Luz'], orixas: ['Oxalá'] },
    { id: 'numero-8', title: 'Número 8 - Abundância', description: 'Poder, autoridade, prosperidade. O número do gestor e empreendedor.', elements: ['Fogo'], orixas: ['Xangô'] },
    { id: 'numero-9', title: 'Número 9 - Compaixão', description: 'Humanitarismo, altruísmo, sabedoria. O número do mestre e libertador.', elements: ['Fogo'], orixas: ['Omolu'] },
  ],
  cycles: [
    { id: 'ciclo-7', title: 'Ciclo de 7 Anos', description: 'Cada 7 anos completa-se um ciclo de transformação física, emocional e espiritual.', elements: ['Água'], orixas: ['Oxalá'] },
    { id: 'ciclo-12', title: 'Ciclo de 12 Anos', description: 'Ciclo de amadurecimento kármico, relacionado aos signos do zodíaco.', elements: ['Fogo'], orixas: ['Xangô'] },
    { id: 'ciclo-lunar', title: 'Ciclo Lunar', description: 'Ciclo de 28 dias conectado às fases da lua e às energias femininas.', elements: ['Água'], orixas: ['Iemanjá', 'Oxum'] },
    { id: 'ciclo-solar', title: 'Ciclo Solar', description: 'Ciclo de 365 dias conectado à energia de Oxalá e à luz solar.', elements: ['Luz'], orixas: ['Oxalá'] },
  ],
};

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

function searchOdus(query: string): SpiritualSearchResult[] {
  const results: SpiritualSearchResult[] = [];

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

function searchOrixas(query: string): SpiritualSearchResult[] {
  const results: SpiritualSearchResult[] = [];

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

function searchAffirmations(query: string): SpiritualSearchResult[] {
  const results: SpiritualSearchResult[] = [];

  for (const aff of spiritualData.affirmations) {
    const searchFields = [aff.title, aff.text, aff.orixas.join(' '), aff.elements.join(' ')].join(' ');
    const relevance = calculateRelevance(query, searchFields);

    if (relevance > 0) {
      results.push({
        type: 'afirmation',
        id: aff.id,
        title: aff.title,
        description: aff.text,
        relevance,
        metadata: {
          orixas: aff.orixas,
          elementos: aff.elements,
        },
      });
    }
  }

  return results;
}

function searchRituals(query: string): SpiritualSearchResult[] {
  const results: SpiritualSearchResult[] = [];

  for (const ritual of spiritualData.rituals) {
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

function searchNumerology(query: string): SpiritualSearchResult[] {
  const results: SpiritualSearchResult[] = [];

  for (const num of spiritualData.numerology) {
    const searchFields = [num.title, num.description, num.elements.join(' ')].join(' ');
    const relevance = calculateRelevance(query, searchFields);

    if (relevance > 0) {
      results.push({
        type: 'numerology',
        id: num.id,
        title: num.title,
        description: num.description,
        relevance,
        metadata: {
          elementos: num.elements,
          orixas: num.orixas,
        },
      });
    }
  }

  return results;
}

function searchCycles(query: string): SpiritualSearchResult[] {
  const results: SpiritualSearchResult[] = [];

  for (const cycle of spiritualData.cycles) {
    const searchFields = [cycle.title, cycle.description, cycle.elements.join(' ')].join(' ');
    const relevance = calculateRelevance(query, searchFields);

    if (relevance > 0) {
      results.push({
        type: 'cicle',
        id: cycle.id,
        title: cycle.title,
        description: cycle.description,
        relevance,
        metadata: {
          elementos: cycle.elements,
          orixas: cycle.orixas,
        },
      });
    }
  }

  return results;
}

function filterResults(
  results: SpiritualSearchResult[],
  filters: {
    categories?: string[];
    elements?: string[];
    orixas?: string[];
  }
): SpiritualSearchResult[] {
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

function getAvailableFilters(): SpiritualSearchResponse['filters'] {
  const elements = new Set<string>();
  const orixaNames = new Set<string>();

  for (const odu of odus) {
    odu.elementos.split(' / ').forEach((el) => elements.add(el.trim()));
    odu.orixas.forEach((o) => orixaNames.add(o));
  }

  for (const ritual of spiritualData.rituals) {
    ritual.elementos.forEach((el) => elements.add(el));
    ritual.orixas.forEach((o) => orixaNames.add(o));
  }

  for (const aff of spiritualData.affirmations) {
    aff.elements.forEach((el) => elements.add(el));
    aff.orixas.forEach((o) => orixaNames.add(o));
  }

  for (const num of spiritualData.numerology) {
    num.elements.forEach((el) => elements.add(el));
    num.orixas.forEach((o) => orixaNames.add(o));
  }

  for (const cycle of spiritualData.cycles) {
    cycle.elements.forEach((el) => elements.add(el));
    cycle.orixas.forEach((o) => orixaNames.add(o));
  }

  return {
    categories: ['odu', 'orixa', 'ritual', 'afirmation', 'numerology', 'cicle'],
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

  let allResults: SpiritualSearchResult[] = [];

  if (query) {
    const [oduResults, orixaResults, ritualResults, affirmationResults, numerologyResults, cycleResults] = await Promise.all([
      Promise.resolve(searchOdus(query)),
      Promise.resolve(searchOrixas(query)),
      Promise.resolve(searchRituals(query)),
      Promise.resolve(searchAffirmations(query)),
      Promise.resolve(searchNumerology(query)),
      Promise.resolve(searchCycles(query)),
    ]);

    allResults = [...oduResults, ...orixaResults, ...ritualResults, ...affirmationResults, ...numerologyResults, ...cycleResults];
  }

  const filteredResults = filterResults(allResults, { categories, elements, orixas });

  filteredResults.sort((a, b) => b.relevance - a.relevance);

  const response: SpiritualSearchResponse = {
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