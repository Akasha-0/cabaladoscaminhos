/**
 * pubmed-client.ts — fetch de papers científicos da PubMed (E-utilities API).
 *
 * Wave 23.1 — Ingestion cron. ADR-013: papers novos toda semana para que
 * o LiteratureRAG (Wave 21.1) não fique estagnado nos 15 hardcoded.
 *
 * Endpoints usados (NCBI E-utilities, gratuitos + sem auth para volumes baixos):
 *   - ESearch: listar PMIDs por query + janela temporal
 *     https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi
 *   - ESummary: metadata + abstract de um PMID
 *     https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi
 *
 * LGPD: PubMed metadata é pública (papers open-access). NÃO carrega PII
 * de pacientes; carrega apenas nomes de AUTORES (PII teórica mas pública
 * — autores assinam papers com afiliação). Sem `efetch` com PHI.
 *
 * Rate limit NCBI: 3 req/s sem API key. Implementamos sleep 350ms entre
 * chamadas para ficar bem abaixo do limite.
 *
 * Testado com: vi.mock('node:fetch', ...) — vê __tests__/pubmed-client.test.ts.
 */

export const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * Query seed do Wave 23.1. Cada string é uma query ESearch (termos AND/OR
 * suportados pela sintaxe PubMed). `reldate=7` filtra papers publicados
 * nos últimos 7 dias — papers "novos" no sentido cronológico.
 */
export const SEED_QUERIES: readonly string[] = [
  'ayahuasca OR DMT',
  'meditation AND well-being',
  'psychedelic therapy',
  'spiritual practice AND health',
  'energy medicine',
  'I Ching research',
  'ayurveda',
] as const;

/** Janela de tempo (dias) — papers publicados nos últimos N dias. */
export const REL_DATE_DAYS = 7;

/** Máximo de papers por query — protege contra burst em semanas cheias. */
export const RETMAX_PER_QUERY = 20;

/** Sleep entre chamadas E-utilities (ms) — respeita rate limit 3 req/s. */
export const PUBMED_THROTTLE_MS = 350;

/** Custom fetch (injetável em testes). Default: global fetch. */
export type FetchFn = typeof fetch;

export interface PubmedSearchOptions {
  /** Override do fetch (para testes). */
  fetchFn?: FetchFn;
  /** Sleep customizado (para testes — pode ser 0). */
  throttleMs?: number;
  /** Max papers por query — default 20. */
  retmax?: number;
  /** Janela em dias — default 7. */
  reldateDays?: number;
  /** Override de queries — default SEED_QUERIES. */
  queries?: readonly string[];
  /** Logger — default console. */
  logger?: Pick<Console, 'log' | 'warn' | 'error'>;
}

export interface PubmedSummary {
  /** PubMed unique identifier. */
  pmid: string;
  /** Título do paper. */
  title: string;
  /** Lista de autores (LastName Initials). */
  authors: string[];
  /** Ano de publicação (4 dígitos). Pode ser null se não encontrado. */
  year: number | null;
  /** Nome do journal. */
  journal: string | null;
  /** DOI normalizado. Pode ser null para papers sem DOI. */
  doi: string | null;
  /** Abstract em texto puro. Vazio se PubMed não retornou. */
  abstract: string;
  /** URL canônica do paper no PubMed. */
  urlPubmed: string;
}

/**
 * Executa ESearch para uma query e retorna os PMIDs encontrados.
 *
 * URL exemplo:
 *   esearch.fcgi?db=pubmed&term=ayahuasca+OR+DMT&reldate=7&retmax=20&retmode=json
 */
export async function searchPubmed(
  query: string,
  opts: PubmedSearchOptions = {}
): Promise<string[]> {
  const fetchFn = opts.fetchFn ?? fetch;
  const reldate = opts.reldateDays ?? REL_DATE_DAYS;
  const retmax = opts.retmax ?? RETMAX_PER_QUERY;
  const throttle = opts.throttleMs ?? PUBMED_THROTTLE_MS;

  const url = new URL(`${PUBMED_BASE}/esearch.fcgi`);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('term', query);
  url.searchParams.set('reldate', String(reldate));
  url.searchParams.set('retmax', String(retmax));
  url.searchParams.set('retmode', 'json');

  const res = await fetchFn(url.toString());
  if (!res.ok) {
    throw new PubmedApiError(
      `ESearch failed: ${res.status} ${res.statusText}`,
      res.status
    );
  }
  const data = (await res.json()) as {
    esearchresult?: { idlist?: string[] };
  };
  const pmids = data.esearchresult?.idlist ?? [];
  if (throttle > 0) await sleep(throttle);
  return pmids;
}

/**
 * Executa ESummary para um PMID e retorna metadata + abstract parseado.
 *
 * URL exemplo:
 *   esummary.fcgi?db=pubmed&id=12345678&retmode=json
 */
export async function fetchPubmedSummary(
  pmid: string,
  opts: PubmedSearchOptions = {}
): Promise<PubmedSummary | null> {
  const fetchFn = opts.fetchFn ?? fetch;
  const throttle = opts.throttleMs ?? PUBMED_THROTTLE_MS;

  const url = new URL(`${PUBMED_BASE}/esummary.fcgi`);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('id', pmid);
  url.searchParams.set('retmode', 'json');

  const res = await fetchFn(url.toString());
  if (!res.ok) {
    throw new PubmedApiError(
      `ESummary failed for PMID ${pmid}: ${res.status} ${res.statusText}`,
      res.status
    );
  }
  const data = (await res.json()) as {
    result?: Record<string, unknown>;
    error?: string;
  };
  if (data.error || !data.result) {
    return null;
  }
  const record = data.result[pmid] as Record<string, unknown> | undefined;
  if (!record) return null;

  const summary = parseSummary(pmid, record);
  if (throttle > 0) await sleep(throttle);
  return summary;
}

/**
 * Faz o parse do payload ESummary (que tem shape irregular por versão).
 * Mantém tolerância a campos faltantes — todos opcionais exceto `pmid`.
 */
export function parseSummary(
  pmid: string,
  record: Record<string, unknown>
): PubmedSummary {
  const title = (record.title as string | undefined)?.trim() ?? '';
  const authors = Array.isArray(record.authors)
    ? (record.authors as Array<{ name?: string }>)
        .map((a) => (typeof a.name === 'string' ? a.name : ''))
        .filter(Boolean)
    : [];

  const pubdate = (record.pubdate as string | undefined) ?? '';
  const yearMatch = pubdate.match(/(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : null;

  const journal =
    typeof record.fulljournalname === 'string'
      ? record.fulljournalname
      : typeof record.source === 'string'
        ? record.source
        : null;

  // articleids é um array com DOI/PMC/PII entries
  const articleids = Array.isArray(record.articleids)
    ? (record.articleids as Array<{ idtype?: string; value?: string }>)
    : [];
  const doiEntry = articleids.find((a) => a.idtype === 'doi');
  const doi = doiEntry?.value ? normalizeDoi(doiEntry.value) : null;

  const abstractText =
    typeof record.Abstract === 'string' ? record.Abstract.trim() : '';

  return {
    pmid,
    title,
    authors,
    year,
    journal,
    doi,
    abstract: abstractText,
    urlPubmed: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  };
}

/**
 * Normaliza DOI: trim, lowercase, valida prefixo "10." (formato padrão).
 * Retorna null se não parecer DOI válido.
 */
export function normalizeDoi(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  // DOI deve começar com "10." (ex: 10.1038/nature12373)
  if (!/^10\.\d{4,9}\/\S+$/i.test(trimmed)) return null;
  return trimmed;
}

export class PubmedApiError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'PubmedApiError';
    this.status = status;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}