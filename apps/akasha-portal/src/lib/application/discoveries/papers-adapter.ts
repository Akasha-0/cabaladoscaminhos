/**
 * discoveries/papers-adapter.ts — Wave 27.3
 *
 * Adapter que retorna a lista de papers cited num discovery específico
 * para alimentar `/api/discoveries/[id]/papers` (endpoint fino focado em
 * Wave 27 drill-down — Zelador clica no chip "papers" do ThoughtChainView
 * e vê a lista completa com abstract preview).
 *
 * Fonte de verdade (Wave 21.1, ainda em `wave-21.1-literature-rag` não
 * mergeado em main):
 *
 *   LiteraturePaper { id, title, authors[], year, journal, doi,
 *                     abstractEn, abstractPtBr, fullTextUrl, openAccess,
 *                     tags[], embedding }
 *   LiteratureCitation { id, paperId → LiteraturePaper,
 *                         discoveryChainId (sem FK), context, createdAt }
 *
 * Estratégia Wave 27.3:
 *   - MOCK determinístico por enquanto (mesma flag USE_REAL_DB do
 *     adapter Wave 23.2). O schema Wave 21.1 não está em main ainda.
 *   - Quando Wave 21.1+ mergearem em main, basta:
 *       1. Implementar `loadFromDatabase()` abaixo.
 *       2. Trocar USE_REAL_DB para true.
 *       3. Adicionar integration tests com mock Prisma.
 *
 * LGPD:
 *   - Papers são obras públicas (sem PII).
 *   - `citationCount` é derivado de `LiteratureCitation.discoveryChainId`
 *     agrupado por `paperId` — não carrega userId.
 *
 * i18n: NÃO se aplica — é data layer (papers são em inglês; abstractPtBr
 * é o campo opcional de tradução).
 */

import type { ThoughtChainPaper } from '@/components/akasha/discoveries/shared';

// ─── Toggle de implementação ────────────────────────────────────────────────
//
// `false` = usar MOCK_FALLBACK abaixo (Wave 27.3 atual, schema Wave 21.1
//           ainda em branch separado não mergeado em main).
// `true`  = usar Prisma real (quando Wave 21.1+ mergearem).
//
// Quando virar `true`, basta:
//   1. Implementar `loadFromDatabase()` abaixo (queries reais).
//   2. Trocar a constante `USE_REAL_DB` para `true`.
//   3. Adicionar tests de integração com mock Prisma.
const USE_REAL_DB = false;

// ─── Shape público do endpoint ─────────────────────────────────────────────

/**
 * Paper cited num discovery — shape consumido por
 * `/api/discoveries/[id]/papers` (Wave 27.3).
 *
 * Diferente de `ThoughtChainPaper` (Wave 23.2):
 *   - `paperId` (não `id`) — explícito que é FK.
 *   - `abstract` (não `abstractEn` + `abstractPtBr`) — endpoint decide
 *     qual idioma servir baseado em `?locale=` ou fallback para EN.
 *   - `citationCount` — quantos discoveries citaram este paper (inverso,
 *     útil pra UI mostrar "cited by N outros discoveries").
 */
export interface DiscoveryPaperDTO {
  /** FK para LiteraturePaper.id (= ThoughtChainPaper.id). */
  paperId: string;
  /** Título do paper (sempre em inglês — fonte canônica). */
  title: string;
  /** Autores formatados: ["Riba J.", "Rodriguez-Fornells A.", "et al"] */
  authors: string[];
  year: number;
  journal: string;
  /**
   * Abstract no idioma pedido (ou fallback EN).
   * UI mostra preview ≤ 200 chars + "ver mais".
   */
  abstract: string;
  /**
   * Quantos outros discoveries citaram este paper.
   * 0 se for a primeira vez. Útil para a UI mostrar
   * "citado por 3 outros discoveries" (visceral + universalista).
   */
  citationCount: number;
  /** DOI canônico (opcional). */
  doi?: string | null;
  /** URL open-access (opcional). */
  fullTextUrl?: string | null;
}

// ─── MOCK determinístico (Wave 27.3 — atual) ────────────────────────────────

/**
 * Hash determinístico de string → número 0..1. Mesmo algoritmo do
 * adapter Wave 23.2 (FNV-1a) para coerência — mock estável por id.
 */
function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

/**
 * Pick determinístico baseado no id + slot.
 * Retorna elemento do array baseado em hash(id + slot).
 */
function pickFromId<T>(id: string, slot: number, items: T[]): T {
  const h = stableHash(`${id}:${slot}`);
  const idx = Math.floor(h * items.length) % items.length;
  return items[idx]!;
}

/**
 * Catálogo mock de papers — espelha o MOCK_PAPERS do adapter Wave 23.2
 * para coerência (mesmo discovery → mesmos papers).
 *
 * Em produção real, virá de `prisma.literaturePaper.findMany` via
 * `loadFromDatabase()`.
 */
const MOCK_PAPERS: ThoughtChainPaper[] = [
  {
    id: 'paper_riba_2003',
    title: 'Ayahuasca pharmacology and personality profiles',
    authors: ['Riba J.', 'Rodriguez-Fornells A.', 'et al'],
    year: 2003,
    journal: 'J. Psychopharmacology',
    doi: '10.1177/0269881103170500',
    abstractEn:
      'Ayahuasca is a South American hallucinogenic brew traditionally used for divinative and religious purposes. The present study investigated the acute and subacute psychological effects of ayahuasca in a double-blind, placebo-controlled study.',
    abstractPtBr: null,
    fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/12618548/',
  },
  {
    id: 'paper_selby_2014',
    title: 'I Ching and synchronicity in clinical practice',
    authors: ['Selby J.'],
    year: 2014,
    journal: 'J. Humanistic Psychology',
    doi: null,
    abstractEn:
      'The I Ching offers a pattern language for non-causal events. This paper explores how clinicians can use the hexagrams as a mirror for what is emerging in the therapeutic field.',
    abstractPtBr: null,
    fullTextUrl: 'https://example.com/selby-2014',
  },
  {
    id: 'paper_cahn_2010',
    title: 'Meditation and brainwave coherence',
    authors: ['Cahn B.R.', 'Delorme A.', 'Polich J.'],
    year: 2010,
    journal: 'Consciousness and Cognition',
    doi: '10.1016/j.concog.2010.01.007',
    abstractEn:
      'Brainwave coherence during meditation is associated with attentional stability and self-referential processing. Long-term meditators show increased gamma synchrony during baseline.',
    abstractPtBr:
      'Coerência de ondas cerebrais durante meditação está associada à estabilidade atencional. Meditadores de longo prazo mostram aumento de sincronia gama.',
    fullTextUrl: 'https://doi.org/10.1016/j.concog.2010.01.007',
  },
  {
    id: 'paper_dunbar_2020',
    title: 'Shared narratives and group ritual',
    authors: ['Dunbar R.'],
    year: 2020,
    journal: 'Religion, Brain & Behavior',
    doi: '10.1080/2153599X.2020.1748992',
    abstractEn:
      'Synchronous rituals amplify endorphin signaling and create durable group identity. We argue narrative coherence is the substrate.',
    abstractPtBr: null,
    fullTextUrl: 'https://doi.org/10.1080/2153599X.2020.1748992',
  },
  {
    id: 'paper_polanczyk_2014',
    title: 'Adverse effects of ayahuasca in a ritual context',
    authors: ['Polanczyk G.V.', 'et al'],
    year: 2014,
    journal: 'Psychiatry Research',
    doi: '10.1016/j.psychres.2014.03.014',
    abstractEn:
      'This paper documents transient adverse psychological effects observed in ritual ayahuasca users, including depersonalization and derealization. Long-term outcomes were generally positive.',
    abstractPtBr: null,
    fullTextUrl: 'https://doi.org/10.1016/j.psychres.2014.03.014',
  },
  {
    id: 'paper_sharon_2017',
    title: 'Ayahuasca, benzedrine and the construction of meaning',
    authors: ['Sharon D.'],
    year: 2017,
    journal: 'Anthropology of Consciousness',
    doi: '10.1111/anoc.12055',
    abstractEn:
      'How ritual contexts construct meaning around altered states. Neurochemistry alone cannot explain the persistence of visionary experience.',
    abstractPtBr: null,
    fullTextUrl: 'https://doi.org/10.1111/anoc.12055',
  },
];

/**
 * Constrói uma lista mock determinística de papers cited num discovery.
 *
 * - 1-4 papers por discovery (range razoável — não paper-dump).
 * - Lista pode ter duplicatas (mesmo paper citado múltiplas vezes por
 *   chains diferentes é registrado em LiteratureCitation) — mas o endpoint
 *   retorna apenas 1 entrada por paper único (deduplicado), e o
 *   `citationCount` reflete o total de citações no DB.
 * - citationCount: derivado deterministicamente do hash do paperId
 *   (0-12 range, simulando uso real).
 */
function buildMockPapers(discoveryId: string, locale: string): DiscoveryPaperDTO[] {
  const count = 2 + Math.floor(stableHash(`${discoveryId}:papers:count`) * 3); // 2-4 papers
  const seen = new Set<string>();
  const result: DiscoveryPaperDTO[] = [];

  for (let i = 0; i < count; i++) {
    // Tenta pegar papers únicos (dedup)
    let paper: ThoughtChainPaper | undefined;
    for (let attempt = 0; attempt < 4; attempt++) {
      const candidate = pickFromId(discoveryId, i + attempt * 7, MOCK_PAPERS);
      if (!seen.has(candidate.id)) {
        paper = candidate;
        break;
      }
    }
    if (!paper) {
      // fallback: aceita duplicata (raro)
      paper = pickFromId(discoveryId, i, MOCK_PAPERS);
    }
    seen.add(paper.id);

    // abstract: prioriza PT-BR se locale=pt-BR e tradução existe
    const abstract =
      locale === 'pt-BR' && paper.abstractPtBr ? paper.abstractPtBr : paper.abstractEn;

    // citationCount: 1-12 citações em outros discoveries
    const citationCount = 1 + Math.floor(stableHash(`${paper.id}:citations`) * 12);

    result.push({
      paperId: paper.id,
      title: paper.title,
      authors: paper.authors,
      year: paper.year,
      journal: paper.journal,
      abstract,
      citationCount,
      doi: paper.doi,
      fullTextUrl: paper.fullTextUrl,
    });
  }

  // Ordena por citationCount desc (mais citados primeiro — UI universalista)
  result.sort((a, b) => b.citationCount - a.citationCount);

  return result;
}

// ─── Implementação Prisma real (placeholder) ────────────────────────────────

/**
 * Quando Wave 21.1 merge em main, esta função faz a query real:
 *
 * ```ts
 * import { prisma } from '@/lib/infrastructure/prisma';
 *
 * export async function loadFromDatabase(
 *   discoveryId: string,
 *   locale: string,
 * ): Promise<DiscoveryPaperDTO[]> {
 *   // Citations → papers
 *   const citations = await prisma.literatureCitation.findMany({
 *     where: { discoveryChainId: discoveryId },
 *     include: { paper: true },
 *     orderBy: { createdAt: 'asc' },
 *   });
 *
 *   // Agrupa por paperId + conta citations globais
 *   const paperIds = [...new Set(citations.map((c) => c.paperId))];
 *   const citationCounts = await prisma.literatureCitation.groupBy({
 *     by: ['paperId'],
 *     where: { paperId: { in: paperIds } },
 *     _count: { _all: true },
 *   });
 *   const countMap = new Map(citationCounts.map((c) => [c.paperId, c._count._all]));
 *
 *   // Deduplica por paperId
 *   const seen = new Set<string>();
 *   const result: DiscoveryPaperDTO[] = [];
 *   for (const c of citations) {
 *     if (seen.has(c.paperId)) continue;
 *     seen.add(c.paperId);
 *
 *     const abstract = locale === 'pt-BR' && c.paper.abstractPtBr
 *       ? c.paper.abstractPtBr
 *       : c.paper.abstractEn;
 *
 *     result.push({
 *       paperId: c.paper.id,
 *       title: c.paper.title,
 *       authors: c.paper.authors,
 *       year: c.paper.year,
 *       journal: c.paper.journal,
 *       abstract,
 *       citationCount: countMap.get(c.paperId) ?? 1,
 *       doi: c.paper.doi,
 *       fullTextUrl: c.paper.fullTextUrl,
 *     });
 *   }
 *
 *   result.sort((a, b) => b.citationCount - a.citationCount);
 *   return result;
 * }
 * ```
 *
 * Quando implementar, trocar `USE_REAL_DB` para `true`.
 */

// ─── Entry point ────────────────────────────────────────────────────────────

/**
 * Carrega papers cited num discovery.
 *
 * @param discoveryId - ID do DiscoveryChain
 * @param locale - 'pt-BR' | 'en' — controla seleção do abstract
 * @returns Array de `DiscoveryPaperDTO` ordenado por citationCount desc.
 *          Retorna `[]` se discovery não tem papers.
 */
export async function loadDiscoveryPapers(
  discoveryId: string,
  locale: string = 'pt-BR'
): Promise<DiscoveryPaperDTO[]> {
  if (USE_REAL_DB) {
    // loadFromDatabase(discoveryId, locale) — ver JSDoc acima
    // Quando virar true, descomentar a próxima linha:
    // return loadFromDatabase(discoveryId, locale);
    throw new Error(
      '[discoveries/papers-adapter] USE_REAL_DB=true mas loadFromDatabase ainda não foi implementado. Aguardando merge de Wave 21.1.'
    );
  }

  return buildMockPapers(discoveryId, locale);
}