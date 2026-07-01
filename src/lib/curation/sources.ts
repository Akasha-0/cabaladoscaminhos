/**
 * AI Curation Engine — Source Registry (Wave 29)
 *
 * 7 reliable sources for articles about spirituality, contemplative practices,
 * plant medicines, and traditional healing. Each source has a fetcher and a
 * normalizer that returns CandidateArticle objects the engine can score.
 *
 * Sources are real, public APIs or RSS feeds. No scraping of paywalled or
 * copyrighted content — only what the publisher exposes openly.
 */

import type { CurationSource } from "./engine";

// ---------------------------------------------------------------------------
// Re-export so callers can import from a single path
// ---------------------------------------------------------------------------

export type { CurationSource };

// ---------------------------------------------------------------------------
// Source registry
// ---------------------------------------------------------------------------

export const DEFAULT_SOURCES: CurationSource[] = [
  // 1. PubMed — biomedical literature (NCBI E-utilities API, free, requires email)
  {
    name: "pubmed-meditation",
    type: "pubmed",
    query:
      "(meditation OR mindfulness OR contemplative) AND (clinical trial OR meta-analysis OR systematic review) AND (\"last 30 days\"[PDat])",
    tradition: "Meditação contemplativa",
    maxPerRun: 25,
  },
  {
    name: "pubmed-psychedelics",
    type: "pubmed",
    query:
      "(psilocybin OR ayahuasca OR mdma OR ibogaine OR mescaline) AND (clinical trial OR safety OR efficacy OR therapy) AND (\"last 30 days\"[PDat])",
    tradition: "Medicinas psicodélicas",
    maxPerRun: 25,
  },

  // 2. SciELO — Latin American research (open API, free, no key)
  {
    name: "scielo-saude-espiritual",
    type: "scielo",
    query:
      '("saúde espiritual" OR "espiritualidade" OR "medicina tradicional" OR "religiosidade") AND ("últimos 30 dias")',
    tradition: "Espiritualidade e saúde pública",
    maxPerRun: 20,
  },

  // 3. Crossref — DOI registry (REST API, free, polite pool with email)
  {
    name: "crossref-integrative",
    type: "crossref",
    query:
      '"integrative medicine" OR "traditional medicine" OR "complementary therapies"',
    tradition: "Medicina integrativa",
    maxPerRun: 30,
  },

  // 4. arXiv — preprints (free API)
  {
    name: "arxiv-consciousness",
    type: "arxiv",
    query:
      'cat:q-bio.NC AND (abs:"consciousness" OR abs:"meditation" OR abs:"neurophenomenology")',
    tradition: "Neurociência contemplativa",
    maxPerRun: 15,
  },

  // 5. MAPS — Multidisciplinary Association for Psychedelic Studies (RSS)
  {
    name: "maps-research",
    type: "rss",
    query: "https://maps.org/news/research",
    tradition: "Pesquisa psicodélica",
    maxPerRun: 10,
  },

  // 6. Chacruna Institute — ayahuasca & plant medicine community (RSS)
  {
    name: "chacruna-ayahuasca",
    type: "rss",
    query: "https://chacruna-institute.org/feed/",
    tradition: "Ayahuasca e medicinas de plantas",
    maxPerRun: 10,
  },

  // 7. ICEERS — ibogaine/sananga/kambo research (RSS)
  {
    name: "iceers-ibogaine",
    type: "rss",
    query: "https://www.iceers.org/feed/",
    tradition: "Ibogaína e medicinas amazônicas",
    maxPerRun: 10,
  },
];

// ---------------------------------------------------------------------------
// Per-source fetchers
//
// Each fetcher returns CandidateArticle[] (the engine's normalized shape).
// Real HTTP calls live behind try/catch — fetchers MUST NOT throw, just
// return []. Engine logs source-level errors and continues.
// ---------------------------------------------------------------------------

export interface CandidateArticle {
  source: string; // matches CurationSource.name
  sourceType: CurationSource["type"];
  externalId: string; // PMID / DOI / arXiv ID / URL hash
  title: string;
  authors?: string;
  abstract?: string;
  url: string;
  doi?: string;
  pmid?: string;
  publishedDate?: string;
  tradition?: string;
}

/** Minimal rate-limited fetch helper. 200ms between calls per host. */
const lastFetchByHost = new Map<string, number>();

async function rateLimitedFetch(url: string): Promise<Response> {
  const host = new URL(url).host;
  const last = lastFetchByHost.get(host) ?? 0;
  const wait = Math.max(0, 200 - (Date.now() - last));
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastFetchByHost.set(host, Date.now());

  // 3 retries with exponential backoff (network is flaky in sandbox)
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "CabalaDosCaminhos/1.0 (curation)" },
      });
      if (res.ok) return res;
      if (res.status >= 500) {
        // retry on 5xx
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        continue;
      }
      return res; // 4xx — let caller handle
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------------------
// PubMed fetcher (NCBI E-utilities)
// Docs: https://www.ncbi.nlm.nih.gov/books/NBK25500/
// ---------------------------------------------------------------------------

export async function fetchPubMed(source: CurationSource): Promise<CandidateArticle[]> {
  const out: CandidateArticle[] = [];
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmax=${source.maxPerRun}&retmode=json&term=${encodeURIComponent(source.query)}`;
    const searchRes = await rateLimitedFetch(searchUrl);
    if (!searchRes.ok) return out;
    const searchJson = (await searchRes.json()) as {
      esearchresult?: { idlist?: string[] };
    };
    const ids = searchJson.esearchresult?.idlist ?? [];
    if (ids.length === 0) return out;

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`;
    const summaryRes = await rateLimitedFetch(summaryUrl);
    if (!summaryRes.ok) return out;
    const summaryJson = (await summaryRes.json()) as {
      result?: Record<string, unknown>;
    };
    const result = summaryJson.result ?? {};
    for (const id of ids) {
      const u = (result[`uids`] as string[] | undefined)?.includes(id) ? null : id;
      const r = (result as Record<string, Record<string, unknown>>)[u ?? id];
      if (!r || typeof r !== "object") continue;
      const title = (r.title as string | undefined) ?? "";
      const authorsArr = r.authors as Array<{ name: string }> | undefined;
      const authors = authorsArr?.map((a) => a.name).join(", ") ?? undefined;
      const pubdate = (r.pubdate as string | undefined) ?? undefined;
      const articleids = r.articleids as
        | Array<{ idtype: string; value: string }>
        | undefined;
      const doi = articleids?.find((a) => a.idtype === "doi")?.value;
      out.push({
        source: source.name,
        sourceType: "pubmed",
        externalId: `pmid:${id}`,
        title,
        authors,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        doi,
        pmid: id,
        publishedDate: pubdate,
        tradition: source.tradition,
      });
    }
  } catch (e) {
    console.error(`[curation:pubmed:${source.name}]`, e);
  }
  return out;
}

// ---------------------------------------------------------------------------
// SciELO fetcher (open API)
// Docs: https://api.scielo.org/
// ---------------------------------------------------------------------------

export async function fetchSciELO(source: CurationSource): Promise<CandidateArticle[]> {
  const out: CandidateArticle[] = [];
  try {
    const url = `https://api.scielo.org/v1/articles?q=${encodeURIComponent(source.query)}&count=${source.maxPerRun}&format=json`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return out;
    const json = (await res.json()) as {
      articles?: Array<{
        title?: string;
        authors?: string[];
        abstract?: string;
        doi?: string;
        publication_date?: string;
        url?: string;
      }>;
    };
    for (const a of json.articles ?? []) {
      if (!a.title) continue;
      out.push({
        source: source.name,
        sourceType: "scielo",
        externalId: a.doi ?? a.url ?? a.title.slice(0, 80),
        title: a.title,
        authors: a.authors?.join(", "),
        abstract: a.abstract,
        url: a.url ?? `https://doi.org/${a.doi ?? ""}`,
        doi: a.doi,
        publishedDate: a.publication_date,
        tradition: source.tradition,
      });
    }
  } catch (e) {
    console.error(`[curation:scielo:${source.name}]`, e);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Crossref fetcher (REST API)
// Docs: https://api.crossref.org/swagger-ui/index.html
// ---------------------------------------------------------------------------

export async function fetchCrossref(source: CurationSource): Promise<CandidateArticle[]> {
  const out: CandidateArticle[] = [];
  try {
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(source.query)}&rows=${source.maxPerRun}&sort=published&order=desc`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return out;
    const json = (await res.json()) as {
      message?: {
        items?: Array<{
          DOI?: string;
          title?: string[];
          author?: Array<{ given?: string; family?: string }>;
          abstract?: string;
          URL?: string;
          "published-print"?: { "date-parts"?: number[][] };
          "published-online"?: { "date-parts"?: number[][] };
        }>;
      };
    };
    for (const item of json.message?.items ?? []) {
      const title = item.title?.[0];
      if (!title) continue;
      const authors = item.author
        ?.map((a) => [a.given, a.family].filter(Boolean).join(" "))
        .join(", ");
      const dateParts =
        item["published-print"]?.["date-parts"]?.[0] ??
        item["published-online"]?.["date-parts"]?.[0];
      const publishedDate = dateParts
        ? `${dateParts[0]}-${String(dateParts[1] ?? 1).padStart(2, "0")}-${String(dateParts[2] ?? 1).padStart(2, "0")}`
        : undefined;
      // Strip JATS XML tags from abstract
      const abstract = item.abstract?.replace(/<[^>]+>/g, "").trim();
      out.push({
        source: source.name,
        sourceType: "crossref",
        externalId: item.DOI ?? item.URL ?? title.slice(0, 80),
        title,
        authors,
        abstract,
        url: item.URL ?? `https://doi.org/${item.DOI ?? ""}`,
        doi: item.DOI,
        publishedDate,
        tradition: source.tradition,
      });
    }
  } catch (e) {
    console.error(`[curation:crossref:${source.name}]`, e);
  }
  return out;
}

// ---------------------------------------------------------------------------
// arXiv fetcher (free API)
// Docs: https://arxiv.org/help/api
// ---------------------------------------------------------------------------

export async function fetchArXiv(source: CurationSource): Promise<CandidateArticle[]> {
  const out: CandidateArticle[] = [];
  try {
    const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(source.query)}&start=0&max_results=${source.maxPerRun}&sortBy=submittedDate&sortOrder=descending`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return out;
    const xml = await res.text();
    // Lightweight XML parsing — arXiv returns Atom. We extract <entry> blocks.
    const entries = xml.split(/<entry>/).slice(1);
    for (const entry of entries) {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
      if (!title) continue;
      const id = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim();
      const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim();
      const authorBlocks = entry.match(/<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g);
      const authors = authorBlocks
        ?.map((b) => b.match(/<name>([\s\S]*?)<\/name>/)?.[1]?.trim())
        .filter(Boolean)
        .join(", ");
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim();
      out.push({
        source: source.name,
        sourceType: "arxiv",
        externalId: id ?? title.slice(0, 80),
        title,
        authors,
        abstract: summary,
        url: id ?? "",
        publishedDate: published,
        tradition: source.tradition,
      });
    }
  } catch (e) {
    console.error(`[curation:arxiv:${source.name}]`, e);
  }
  return out;
}

// ---------------------------------------------------------------------------
// RSS fetcher (for MAPS, Chacruna, ICEERS)
// Uses a tiny regex-based parser to avoid pulling in a heavy dep.
// ---------------------------------------------------------------------------

export async function fetchRSS(source: CurationSource): Promise<CandidateArticle[]> {
  const out: CandidateArticle[] = [];
  try {
    const res = await rateLimitedFetch(source.query); // query is the RSS URL
    if (!res.ok) return out;
    const xml = await res.text();
    const items = xml.split(/<item>/).slice(1);
    for (const item of items.slice(0, source.maxPerRun)) {
      const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim();
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim();
      const desc = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.trim();
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
      if (!title || !link) continue;
      // Strip HTML tags from description
      const abstract = desc?.replace(/<[^>]+>/g, "").trim();
      out.push({
        source: source.name,
        sourceType: "rss",
        externalId: link,
        title,
        abstract,
        url: link,
        publishedDate: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : undefined,
        tradition: source.tradition,
      });
    }
  } catch (e) {
    console.error(`[curation:rss:${source.name}]`, e);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Dispatcher — pick the right fetcher by source type
// ---------------------------------------------------------------------------

export async function fetchFromSource(source: CurationSource): Promise<CandidateArticle[]> {
  switch (source.type) {
    case "pubmed":
      return fetchPubMed(source);
    case "scielo":
      return fetchSciELO(source);
    case "crossref":
      return fetchCrossref(source);
    case "arxiv":
      return fetchArXiv(source);
    case "rss":
      return fetchRSS(source);
    default: {
      // Exhaustiveness check
      const _exhaustive: never = source.type;
      void _exhaustive;
      return [];
    }
  }
}