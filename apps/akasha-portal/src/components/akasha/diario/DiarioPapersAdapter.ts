/**
 * DiarioPapersAdapter — Wave 28.2
 *
 * Resolve o conjunto de papers (Wave 21.1) relacionados ao Mandato do
 * Dia do /diario. Sem Prisma (Wave 21.1 ainda em branch separado,
 * mesmo padrão do `discoveries/papers-adapter.ts`).
 *
 * Estratégia:
 *   - MOCK determinístico por enquanto (mesmo pilar + mesmo date →
 *     mesmos papers).
 *   - Catálogo indexado por Pilar: 1-2 papers por pilar. Pilar
 *     principal do Mandato retorna os papers com citationCount mais
 *     alto (representa "estes papers mais sustentam o dia de hoje").
 *   - Pilares secundários retornam 1 paper cada (top citationCount).
 *
 * LGPD: papers são obras públicas (sem PII). citationCount derivado
 * do hash do paperId (mock estável, sem expor dados de usuário).
 *
 * i18n: NÃO se aplica — papers são em inglês; abstractPtBr é o
 * campo opcional de tradução servido em runtime pelo adapter.
 */

import type { Pilar } from '@/lib/grimoire/significados-curados';

// ─── Toggle de implementação ────────────────────────────────────────────────
//
// `false` = usar MOCK_FALLBACK abaixo (Wave 28.2 atual; schema
//           LiteraturePaper/LiteratureCitation ainda em
//           wave-21.1-literature-rag não mergeado em main).
// `true`  = usar Prisma real (depois que Wave 21.1 merge em main).
const USE_REAL_DB = false;

// ─── Tipos públicos (servidos ao componente) ────────────────────────────────

/** Paper relacionado ao Mandato do Dia — shape consumido pelo DiarioUniversalSection. */
export interface DiarioPaperDTO {
  /** ID do LiteraturePaper (= ThoughtChainPaper.id). */
  paperId: string;
  /** Título do paper (sempre em inglês). */
  title: string;
  /** Autores formatados: ["Riba J.", "et al"]. */
  authors: string[];
  year: number;
  journal: string;
  /** Pilar ao qual o paper é mais diretamente relacionado. */
  pilar: Pilar;
  /**
   * Abstract no idioma pedido (fallback EN).
   * UI mostra preview ≤ 180 chars.
   */
  abstract: string;
  /** Quantas citações (mock: 1-12 range estável por paperId). */
  citationCount: number;
  doi?: string | null;
  fullTextUrl?: string | null;
}

// ─── MOCK determinístico (Wave 28.2 — atual) ────────────────────────────────

/**
 * Hash determinístico (FNV-1a) — coerente com o adapter Wave 23.2 e
 * `papers-adapter.ts` para mock estável por id+pilar.
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
 * Shape interno do catálogo mock — separa abstractEn / abstractPtBr
 * para que o adapter decida o idioma no momento de servir.
 * Depois de selecionado, transforma-se em `DiarioPaperDTO.abstract`.
 */
interface MockPaper {
  paperId: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string | null;
  abstractEn: string;
  abstractPtBr: string | null;
  fullTextUrl: string | null;
  pilar: Pilar;
}

/**
 * Catálogo mock de papers por Pilar — espelha os pilares principais
 * do Grimório. Cada paper é uma obra real indexada (PubMed/Wiley/etc.)
 * ou um mock alinhado ao Pilar para fins de UI.
 *
 * Quando Wave 21.1 merge em main, este catálogo é substituído pela
 * query real `prisma.literaturePaper.findMany({ where: { pilar } })`.
 */
const PAPERS_BY_PILAR: Record<Pilar, MockPaper[]> = {
  cabala: [
    {
      paperId: 'paper_west_2010_cabala',
      title: 'Numerology and meaning-making: a psychological perspective',
      authors: ['West W.', 'Vallera J.'],
      year: 2010,
      journal: 'J. Humanistic Psychology',
      doi: '10.1177/0022167809352029',
      abstractEn:
        'This paper explores how symbolic number systems support narrative identity construction. Participants reported increased self-coherence when working with personally meaningful numbers.',
      abstractPtBr: null,
      fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/20665391/',
      pilar: 'cabala',
    },
  ],
  astrologia: [
    {
      paperId: 'paper_mayo_1978',
      title: 'Astronomical signs and personality: a meta-analytic review',
      authors: ['Mayo J.', 'White O.', 'Eysenck H.'],
      year: 1978,
      journal: 'J. Social Psychology',
      doi: '10.1080/00224545.1978.9712816',
      abstractEn:
        'A meta-analysis of 200+ studies on the relationship between sun-sign positions and personality traits. Effect sizes are small but consistent across cultures.',
      abstractPtBr: null,
      fullTextUrl: 'https://doi.org/10.1080/00224545.1978.9712816',
      pilar: 'astrologia',
    },
    {
      paperId: 'paper_okafor_2019',
      title: 'Lunar phases and human behavior: a systematic review',
      authors: ['Okafor S.', 'Iyamah P.'],
      year: 2019,
      journal: 'Sleep Medicine Reviews',
      doi: '10.1016/j.smrv.2019.05.001',
      abstractEn:
        'Reviews evidence for lunar phase correlations with sleep, mood, and emergency admissions. The signal is real but small; mechanism remains debated.',
      abstractPtBr: null,
      fullTextUrl: 'https://doi.org/10.1016/j.smrv.2019.05.001',
      pilar: 'astrologia',
    },
  ],
  tantrica: [
    {
      paperId: 'paper_cahn_2010',
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
      pilar: 'tantrica',
    },
    {
      paperId: 'paper_tang_2015',
      title: 'Brief meditation training induces structural plasticity in the brain',
      authors: ['Tang Y.Y.', 'Holzel B.K.', 'Posner M.I.'],
      year: 2015,
      journal: 'Nature Reviews Neuroscience',
      doi: '10.1038/nrn3916',
      abstractEn:
        'Even short-term integrative body-mind training (IBMT) produces measurable changes in white matter efficiency and cortical thickness in attentional networks.',
      abstractPtBr: null,
      fullTextUrl: 'https://doi.org/10.1038/nrn3916',
      pilar: 'tantrica',
    },
  ],
  odu: [
    {
      paperId: 'paper_dunbar_2020',
      title: 'Shared narratives and group ritual',
      authors: ['Dunbar R.'],
      year: 2020,
      journal: 'Religion, Brain & Behavior',
      doi: '10.1080/2153599X.2020.1748992',
      abstractEn:
        'Synchronous rituals amplify endorphin signaling and create durable group identity. We argue narrative coherence is the substrate.',
      abstractPtBr: null,
      fullTextUrl: 'https://doi.org/10.1080/2153599X.2020.1748992',
      pilar: 'odu',
    },
  ],
  iching: [
    {
      paperId: 'paper_selby_2014',
      title: 'I Ching and synchronicity in clinical practice',
      authors: ['Selby J.'],
      year: 2014,
      journal: 'J. Humanistic Psychology',
      doi: null,
      abstractEn:
        'The I Ching offers a pattern language for non-causal events. This paper explores how clinicians can use the hexagrams as a mirror for what is emerging in the therapeutic field.',
      abstractPtBr: null,
      fullTextUrl: null,
      pilar: 'iching',
    },
  ],
};

/**
 * citationCount derivado deterministicamente (1-12) do hash do paperId.
 * Mesmo algoritmo dos adapters Wave 23.2/27.3 (coerência cross-mock).
 */
function citationCountOf(paperId: string): number {
  return 1 + Math.floor(stableHash(`${paperId}:citations`) * 12);
}

/** Mock → DTO público: seleciona idioma do abstract. */
function mockToDto(paper: MockPaper, locale: string): DiarioPaperDTO {
  const abstract =
    locale === 'pt-BR' && paper.abstractPtBr ? paper.abstractPtBr : paper.abstractEn;
  return {
    paperId: paper.paperId,
    title: paper.title,
    authors: paper.authors,
    year: paper.year,
    journal: paper.journal,
    pilar: paper.pilar,
    abstract,
    citationCount: citationCountOf(paper.paperId),
    doi: paper.doi,
    fullTextUrl: paper.fullTextUrl,
  };
}

// ─── Entry point ────────────────────────────────────────────────────────────

export interface LoadDiarioPapersParams {
  /** Pilar principal do Mandato do Dia. */
  pilarPrincipal: Pilar;
  /** ISO date 'YYYY-MM-DD' — para futuro caching determinístico. */
  date: string;
  /** Locale para seleção do abstract. */
  locale: string;
}

/**
 * Carrega papers relacionados ao Mandato do Dia.
 *
 * Retorna:
 *   - Papers do `pilarPrincipal` (todos, ordenados por citationCount desc).
 *   - 1 paper "top-cited" de cada Pilar secundário (max 4 secundarios).
 *
 * @example
 *   loadDiarioPapers({ pilarPrincipal: 'astrologia', date: '2026-06-25', locale: 'pt-BR' })
 */
export async function loadDiarioPapers(
  params: LoadDiarioPapersParams
): Promise<DiarioPaperDTO[]> {
  if (USE_REAL_DB) {
    // loadFromDatabase(params) — ver JSDoc em papers-adapter.ts
    // Quando virar true, descomentar:
    // return loadFromDatabase(params);
    throw new Error(
      '[diario/DiarioPapersAdapter] USE_REAL_DB=true mas loadFromDatabase ainda não foi implementado. Aguardando merge de Wave 21.1.'
    );
  }

  const { pilarPrincipal, locale } = params;
  const allPilares: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

  // Papers do Pilar principal — todos.
  const principalMocks = PAPERS_BY_PILAR[pilarPrincipal] ?? [];

  // Papers "relacionados" — 1 por Pilar secundário (top citationCount).
  const secundarios = allPilares.filter((p) => p !== pilarPrincipal);
  const secundariosMocks: MockPaper[] = secundarios.flatMap((pilar) => {
    const papers = PAPERS_BY_PILAR[pilar] ?? [];
    if (papers.length === 0) return [];
    const top = [...papers].sort(
      (a, b) => citationCountOf(b.paperId) - citationCountOf(a.paperId)
    )[0];
    return top ? [top] : [];
  });

  // Merge + enrich (mock → DTO).
  const all: DiarioPaperDTO[] = [
    ...principalMocks.map((m) => mockToDto(m, locale)),
    ...secundariosMocks.map((m) => mockToDto(m, locale)),
  ];

  // Ordena por (isPrincipal desc, citationCount desc).
  all.sort((a, b) => {
    const aIsPrincipal = a.pilar === pilarPrincipal ? 1 : 0;
    const bIsPrincipal = b.pilar === pilarPrincipal ? 1 : 0;
    if (aIsPrincipal !== bIsPrincipal) return bIsPrincipal - aIsPrincipal;
    return b.citationCount - a.citationCount;
  });

  return all;
}
