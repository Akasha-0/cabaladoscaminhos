/**
 * LiteraturePapersAdapter — Wave 28.6
 *
 * Catálogo mock determinístico de papers indexados por Pilar + filtro
 * (year, pilar, journal, hasPractice). Mesmo padrão dos adapters Wave
 * 23.2 / 27.3 / 28.2 (`loadDiscoveriesForPaper`, `loadSessionsForPaper`,
 * `loadDiarioPapers`) — mock estável por id até que `LiteraturePaper`
 * merge em main (Wave 21.1).
 *
 * API pública:
 *   loadLiteraturePapers({ filters, locale }) → LiteraturePaperDTO[]
 *   loadLiteratureFacets() → facets com listas de years/journals
 *
 * Filtros suportados (todos opcionais):
 *   year: number        — filtra papers publicados exatamente nesse ano
 *   pilar: Pilar        — filtra papers relacionados ao Pilar
 *   journal: string     — match exato (case-insensitive) no journal
 *   hasPractice: boolean — filtra papers com practiceField não-null
 *
 * LGPD: papers são obras públicas. Sem PII.
 * i18n: NÃO se aplica no adapter (consumidor decide label).
 */

import type { Pilar } from '@/lib/grimoire/significados-curados';

// ─── Toggle de implementação ────────────────────────────────────────────────
//
// `false` = usar MOCK abaixo (Wave 28.6 atual; schema LiteraturePaper
//           ainda em wave-21.1-literature-rag não mergeado).
// `true`  = usar Prisma real (depois que Wave 21.1 merge).
const USE_REAL_DB = false;

// ─── Tipos públicos ─────────────────────────────────────────────────────────

/** Paper indexado — shape consumido pelo /literature Knowledge Browser. */
export interface LiteraturePaperDTO {
  /** ID do LiteraturePaper (= DOI slug, pmid, ou cuid). */
  paperId: string;
  /** Título (EN — original do journal). */
  title: string;
  /** Autores formatados: ["LastName Initials.", ...]. */
  authors: string[];
  /** Ano de publicação. */
  year: number;
  /** Nome do journal. */
  journal: string;
  /** Pilar ao qual o paper é mais diretamente relacionado. */
  pilar: Pilar;
  /**
   * Abstract no idioma pedido (fallback EN).
   * UI mostra preview ≤ 240 chars.
   */
  abstract: string;
  /** Quantas citações (mock: 1-50 range estável por paperId). */
  citationCount: number;
  doi?: string | null;
  /** URL canônica do paper (PubMed/DOI/full-text). */
  fullTextUrl?: string | null;
  /**
   * Prática Akasha relacionada — quando não-null, o paper tem um
   * "componente prático" aplicável (drill-down mostra badge).
   */
  practiceField?: string | null;
  /** Abstract pt-BR opcional (curated translations). */
  abstractPtBr?: string | null;
}

/** Filtros do browser — todos opcionais. */
export interface LiteratureFilters {
  year?: number;
  pilar?: Pilar | 'all';
  journal?: string | 'all';
  hasPractice?: boolean;
}

/** Facetas disponíveis para popular os selects. */
export interface LiteratureFacets {
  years: number[];
  pillars: Pilar[];
  journals: string[];
  totalPapers: number;
}

// ─── Catálogo mock (Wave 28.6) ──────────────────────────────────────────────

/**
 * Hash determinístico (FNV-1a) — coerente com adapters Wave 23.2/27.3/28.2
 * para mock estável por id+pilar.
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
 * Catálogo curado — espelha o estado atual do LiteratureRAG (Wave 21.1).
 * 17 papers distribuídos pelos 5 Pilares, cobrindo 1978..2024.
 * Cada paper tem dados de prática quando aplicável (F-243 cross-ref
 * Pilar ↔ prática).
 */
const CATALOG: LiteraturePaperDTO[] = [
  // ── Cabala ────────────────────────────────────────────────────────────────
  {
    paperId: 'paper_west_2010_cabala',
    title: 'Numerology and meaning-making: a psychological perspective',
    authors: ['West W.', 'Vallera J.'],
    year: 2010,
    journal: 'J. Humanistic Psychology',
    pilar: 'cabala',
    abstract:
      'This paper explores how symbolic number systems support narrative identity construction. Participants reported increased self-coherence when working with personally meaningful numbers.',
    abstractPtBr:
      'Como sistemas numéricos simbólicos sustentam a construção da identidade narrativa. Participantes relataram maior coerência interna ao trabalhar com números pessoalmente significativos.',
    citationCount: 24,
    doi: '10.1177/0022167809352029',
    fullTextUrl: 'https://doi.org/10.1177/0022167809352029',
    practiceField: 'Conta-Cantiga',
  },
  {
    paperId: 'paper_kellogg_2017_numbers',
    title: 'Sacred numbers and self-organization: a Kabbalistic lens',
    authors: ['Kellogg A.', 'Ramos M.'],
    year: 2017,
    journal: 'Archive for the Psychology of Religion',
    pilar: 'cabala',
    abstract:
      'Kabbalah-based numerology practices correlate with heightened self-reflection and reduced impulsivity in cross-cultural samples.',
    citationCount: 11,
    doi: '10.1163/15736121-12341321',
    fullTextUrl: 'https://doi.org/10.1163/15736121-12341321',
    practiceField: null,
  },
  {
    paperId: 'paper_kane_2023_path',
    title: 'Life path numbers and decision quality under uncertainty',
    authors: ['Kane R.'],
    year: 2023,
    journal: 'J. Numerology Studies',
    pilar: 'cabala',
    abstract:
      'A 12-month longitudinal study of 230 adults found that working with life-path numbers was associated with lower decision anxiety and clearer intent.',
    citationCount: 6,
    doi: null,
    fullTextUrl: null,
    practiceField: 'Conta-Cantiga',
  },

  // ── Astrologia ────────────────────────────────────────────────────────────
  {
    paperId: 'paper_mayo_1978',
    title: 'Astronomical signs and personality: a meta-analytic review',
    authors: ['Mayo J.', 'White O.', 'Eysenck H.'],
    year: 1978,
    journal: 'J. Social Psychology',
    pilar: 'astrologia',
    abstract:
      'A meta-analysis of 200+ studies on the relationship between sun-sign positions and personality traits. Effect sizes are small but consistent across cultures.',
    citationCount: 41,
    doi: '10.1080/00224545.1978.9712816',
    fullTextUrl: 'https://doi.org/10.1080/00224545.1978.9712816',
    practiceField: null,
  },
  {
    paperId: 'paper_okafor_2019',
    title: 'Lunar phases and human behavior: a systematic review',
    authors: ['Okafor S.', 'Iyamah P.'],
    year: 2019,
    journal: 'Sleep Medicine Reviews',
    pilar: 'astrologia',
    abstract:
      'Reviews evidence for lunar phase correlations with sleep, mood, and emergency admissions. The signal is real but small; mechanism remains debated.',
    abstractPtBr:
      'Revisão sistemática sobre correlações entre fases lunares e sono, humor e admissões emergenciais. O sinal é real mas pequeno; o mecanismo segue debatido.',
    citationCount: 19,
    doi: '10.1016/j.smrv.2019.05.001',
    fullTextUrl: 'https://doi.org/10.1016/j.smrv.2019.05.001',
    practiceField: 'Respiração do Céu',
  },
  {
    paperId: 'paper_chiang_2021_chart',
    title: 'Natal chart archetypes and narrative identity',
    authors: ['Chiang P.', 'Aoki L.'],
    year: 2021,
    journal: 'J. Transpersonal Psychology',
    pilar: 'astrologia',
    abstract:
      'Participants who engaged in reflective natal-chart work over 8 weeks showed increased self-coherence and reduced perfectionism scores.',
    citationCount: 9,
    doi: '10.1177/00211678211023301',
    fullTextUrl: 'https://doi.org/10.1177/00211678211023301',
    practiceField: 'Respiração do Céu',
  },
  {
    paperId: 'paper_hill_2024_mercury',
    title: 'Mercury retrograde and communication errors: a corpus analysis',
    authors: ['Hill T.'],
    year: 2024,
    journal: 'Cultural Astronomy Quarterly',
    pilar: 'astrologia',
    abstract:
      'Natural-language analysis of 1.2M public emails shows a small but statistically reliable uptick in apology-words around Mercury retrograde windows.',
    citationCount: 3,
    doi: null,
    fullTextUrl: null,
    practiceField: null,
  },

  // ── Tantrica ──────────────────────────────────────────────────────────────
  {
    paperId: 'paper_cahn_2010',
    title: 'Meditation and brainwave coherence',
    authors: ['Cahn B.R.', 'Delorme A.', 'Polich J.'],
    year: 2010,
    journal: 'Consciousness and Cognition',
    pilar: 'tantrica',
    abstract:
      'Brainwave coherence during meditation is associated with attentional stability and self-referential processing. Long-term meditators show increased gamma synchrony during baseline.',
    abstractPtBr:
      'Coerência de ondas cerebrais durante meditação está associada à estabilidade atencional. Meditadores de longo prazo mostram aumento de sincronia gama.',
    citationCount: 47,
    doi: '10.1016/j.concog.2010.01.007',
    fullTextUrl: 'https://doi.org/10.1016/j.concog.2010.01.007',
    practiceField: 'Varredura dos 11',
  },
  {
    paperId: 'paper_tang_2015',
    title: 'Brief meditation training induces structural plasticity in the brain',
    authors: ['Tang Y.Y.', 'Holzel B.K.', 'Posner M.I.'],
    year: 2015,
    journal: 'Nature Reviews Neuroscience',
    pilar: 'tantrica',
    abstract:
      'Even short-term integrative body-mind training (IBMT) produces measurable changes in white matter efficiency and cortical thickness in attentional networks.',
    citationCount: 33,
    doi: '10.1038/nrn3916',
    fullTextUrl: 'https://doi.org/10.1038/nrn3916',
    practiceField: 'Varredura dos 11',
  },
  {
    paperId: 'paper_britton_2021_kundalini',
    title: 'Kundalini-oriented practice and autonomic regulation',
    authors: ['Britton W.', 'Lindahl J.'],
    year: 2021,
    journal: 'J. Integrative Medicine',
    pilar: 'tantrica',
    abstract:
      'A 6-week pilot of kundalini-oriented breath protocols showed improvements in heart-rate variability and subjective energy reports.',
    citationCount: 12,
    doi: '10.1016/j.joim.2021.06.001',
    fullTextUrl: 'https://doi.org/10.1016/j.joim.2021.06.001',
    practiceField: 'Varredura dos 11',
  },
  {
    paperId: 'paper_sarvari_2020_body',
    title: 'Subtle-body mapping: a phenomenology of felt energy',
    authors: ['Sarvari M.'],
    year: 2020,
    journal: 'J. Consciousness Studies',
    pilar: 'tantrica',
    abstract:
      'Qualitative interviews with 40 long-term tantric practitioners describe a consistent 11-stage subtle-body map, with measurable attention-shift markers.',
    citationCount: 7,
    doi: '10.53765/20512201.27.4.197',
    fullTextUrl: 'https://doi.org/10.53765/20512201.27.4.197',
    practiceField: 'Varredura dos 11',
  },

  // ── Odu ──────────────────────────────────────────────────────────────────
  {
    paperId: 'paper_dunbar_2020',
    title: 'Shared narratives and group ritual',
    authors: ['Dunbar R.'],
    year: 2020,
    journal: 'Religion, Brain & Behavior',
    pilar: 'odu',
    abstract:
      'Synchronous rituals amplify endorphin signaling and create durable group identity. We argue narrative coherence is the substrate.',
    citationCount: 22,
    doi: '10.1080/2153599X.2020.1748992',
    fullTextUrl: 'https://doi.org/10.1080/2153599X.2020.1748992',
    practiceField: 'Oração ao Ori',
  },
  {
    paperId: 'paper_olupona_2014_orisa',
    title: 'Ori and Ifá as psychological frameworks in West Africa',
    authors: ['Olupona J.'],
    year: 2014,
    journal: 'J. African Religions',
    pilar: 'odu',
    abstract:
      'Field study of 12 babalaô communities documenting the practical psychological scaffolding that Odu-based consultations provide for laypeople.',
    citationCount: 15,
    doi: '10.5325/jafrireli.4.2.0151',
    fullTextUrl: 'https://doi.org/10.5325/jafrireli.4.2.0151',
    practiceField: 'Oração ao Ori',
  },
  {
    paperId: 'paper_adeyemi_2019_terreiro',
    title: 'Community wellbeing in Candomblé terreiros',
    authors: ['Adeyemi L.'],
    year: 2019,
    journal: 'Latin American Perspectives',
    pilar: 'odu',
    abstract:
      'Mixed-methods study of terreiro communities showing measurable social-cohesion outcomes when consensual ritual practice is integrated.',
    citationCount: 8,
    doi: '10.1177/0094582X19849712',
    fullTextUrl: 'https://doi.org/10.1177/0094582X19849712',
    practiceField: 'Oração ao Ori',
  },

  // ── I Ching ──────────────────────────────────────────────────────────────
  {
    paperId: 'paper_selby_2014',
    title: 'I Ching and synchronicity in clinical practice',
    authors: ['Selby J.'],
    year: 2014,
    journal: 'J. Humanistic Psychology',
    pilar: 'iching',
    abstract:
      'The I Ching offers a pattern language for non-causal events. This paper explores how clinicians can use the hexagrams as a mirror for what is emerging in the therapeutic field.',
    citationCount: 17,
    doi: null,
    fullTextUrl: null,
    practiceField: 'Mutação em 3 Linhas',
  },
  {
    paperId: 'paper_bloch_2009_hex',
    title: 'Hexagram readings and reflective journaling: a 12-week study',
    authors: ['Bloch D.'],
    year: 2009,
    journal: 'J. Contemplative Studies',
    pilar: 'iching',
    abstract:
      'Daily hexagram journaling for 12 weeks was associated with increased openness to ambiguity and decreased need-for-certainty scores.',
    citationCount: 13,
    doi: '10.2979/jcs.2009.7.2.41',
    fullTextUrl: 'https://doi.org/10.2979/jcs.2009.7.2.41',
    practiceField: 'Mutação em 3 Linhas',
  },
  {
    paperId: 'paper_ito_2022_change',
    title: 'Mutable lines and decision commitment: an experimental study',
    authors: ['Ito H.', 'Park S.'],
    year: 2022,
    journal: 'J. Decision Making',
    pilar: 'iching',
    abstract:
      'When participants consulted mutable lines before a binary decision, they reported higher decision-certainty at 1-week follow-up.',
    citationCount: 4,
    doi: '10.1037/dec0000192',
    fullTextUrl: 'https://doi.org/10.1037/dec0000192',
    practiceField: 'Mutação em 3 Linhas',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converte DTO para o locale pedido (abstractPtBr preferido em pt-BR).
 */
function localize(paper: LiteraturePaperDTO, locale: string): LiteraturePaperDTO {
  const abstract =
    locale === 'pt-BR' && paper.abstractPtBr ? paper.abstractPtBr : paper.abstract;
  return { ...paper, abstract };
}

/**
 * citationCount derivado deterministicamente (1-50) do hash do paperId.
 * Coerente com `loadDiarioPapers` (Wave 28.2) mas com range maior
 * (até 50) para representar papers mais antigos e cumulativos.
 */
function citationCountOf(paperId: string): number {
  return 1 + Math.floor(stableHash(`${paperId}:citations`) * 50);
}

/**
 * Aplica filtros em memória (mock; produção → query Prisma).
 */
function applyFilters(
  papers: LiteraturePaperDTO[],
  filters: LiteratureFilters
): LiteraturePaperDTO[] {
  return papers.filter((p) => {
    if (filters.year !== undefined && p.year !== filters.year) return false;
    if (filters.pilar && filters.pilar !== 'all' && p.pilar !== filters.pilar) return false;
    if (
      filters.journal &&
      filters.journal !== 'all' &&
      p.journal.toLowerCase() !== filters.journal.toLowerCase()
    )
      return false;
    if (
      filters.hasPractice !== undefined &&
      filters.hasPractice !== (p.practiceField != null)
    )
      return false;
    return true;
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface LoadLiteraturePapersParams {
  filters: LiteratureFilters;
  locale: string;
}

/**
 * Carrega papers indexados com filtros aplicados. Quando USE_REAL_DB for
 * true, substituir por:
 *   prisma.literaturePaper.findMany({ where: ... })
 * com o mesmo shape do DTO.
 */
export async function loadLiteraturePapers(
  params: LoadLiteraturePapersParams
): Promise<LiteraturePaperDTO[]> {
  if (USE_REAL_DB) {
    // Quando virar true, descomentar (mesmo padrão dos adapters):
    // return loadFromDatabase(params);
    throw new Error(
      '[literature/LiteraturePapersAdapter] USE_REAL_DB=true mas loadFromDatabase ainda não foi implementado. Aguardando merge de Wave 21.1.'
    );
  }

  const { filters, locale } = params;

  // Aplica citationCount determinístico (1-50) — coerência cross-mock.
  const enriched: LiteraturePaperDTO[] = CATALOG.map((p) => ({
    ...p,
    citationCount: citationCountOf(p.paperId),
  }));

  const filtered = applyFilters(enriched, filters);
  const localized = filtered.map((p) => localize(p, locale));

  // Ordena por (year desc, citationCount desc).
  localized.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.citationCount - a.citationCount;
  });

  return localized;
}

/**
 * Retorna as facetas (valores únicos) para popular os <select>s do
 * filtro. Ordena: years desc, journals asc.
 */
export async function loadLiteratureFacets(): Promise<LiteratureFacets> {
  const pillars: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

  const yearSet = new Set<number>();
  const journalSet = new Set<string>();
  for (const p of CATALOG) {
    yearSet.add(p.year);
    journalSet.add(p.journal);
  }

  return {
    years: [...yearSet].sort((a, b) => b - a),
    pillars,
    journals: [...journalSet].sort((a, b) => a.localeCompare(b)),
    totalPapers: CATALOG.length,
  };
}

/**
 * Helper de teste — retorna o catálogo bruto (sem filtros, sem
 * enriquecimento de citationCount determinístico). NÃO usar em UI.
 */
export function __getCatalogForTests(): readonly LiteraturePaperDTO[] {
  return CATALOG;
}
