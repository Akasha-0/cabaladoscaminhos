/**
 * AI Curation Engine — Main Orchestrator (Wave 29)
 *
 * curateDaily() pulls candidate articles from registered sources, scores each
 * one with the LLM (relevance / evidence / safety / universalism / citations),
 * persists ACCEPT/REVIEW articles to the knowledge base, and returns a
 * per-source summary.
 *
 * Hard rules (non-negotiable):
 *  - NEVER invent articles. Only real fetches from registered sources.
 *  - NEVER upsert without a real DOI/PMID/URL.
 *  - NEVER bypass the score threshold (0.7 for AUTO-ACCEPT).
 *  - 8 Akasha IA ethical rules apply throughout.
 *  - One LLM call per article. 8 concurrent max. Retry on 429/5xx.
 */

import {
  CURATION_SYSTEM_PROMPT,
  buildCurationUserPrompt,
  safeParseScore,
  aggregateScore,
  ACCEPT_THRESHOLD,
  REVIEW_THRESHOLD,
  type CurationScore,
} from "../ai/curation-prompt";
import {
  DEFAULT_SOURCES,
  fetchFromSource,
  type CandidateArticle,
} from "./sources";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface CurationSource {
  name: string;
  type: "pubmed" | "scielo" | "crossref" | "arxiv" | "rss";
  query: string;
  tradition?: string;
  maxPerRun: number;
}

export interface CurationResult {
  sourceName: string;
  fetched: number;
  curated: number;
  rejected: number;
  review: number;
  errors: string[];
  durationMs: number;
}

export interface CuratedArticleRecord {
  source: string;
  externalId: string;
  title: string;
  url: string;
  doi?: string;
  pmid?: string;
  tradition?: string;
  score: CurationScore;
  aggregate: number;
  curatedAt: string;
}

// ---------------------------------------------------------------------------
// LLM client — reuses the Wave-12 minimax wrapper if available, otherwise
// calls OpenAI directly. Both modules are optional and dynamically imported
// so this engine compiles even before the LLM client is configured.
// ---------------------------------------------------------------------------

interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  opts: LLMOptions = {}
): Promise<string> {
  // Try minimax first (project's preferred wrapper)
  try {
    const mod = (await import("../ai/minimax")).default;
    if (typeof mod === "function") {
      const result = await mod({
        system: systemPrompt,
        user: userPrompt,
        temperature: opts.temperature ?? 0,
        maxTokens: opts.maxTokens ?? 600,
        model: opts.model,
        responseFormat: "json",
      });
      if (typeof result === "string") return result;
      if (result && typeof result === "object" && "content" in result) {
        return String((result as { content: unknown }).content ?? "");
      }
    }
  } catch {
    // minimax not configured — fall through to OpenAI
  }

  // Fallback: direct OpenAI call
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No LLM client available (minimax module missing AND OPENAI_API_KEY unset). Cannot score articles."
    );
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? process.env.CURATION_MODEL ?? "gpt-4o-mini",
      temperature: opts.temperature ?? 0,
      max_tokens: opts.maxTokens ?? 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content ?? "";
}

// ---------------------------------------------------------------------------
// Concurrency limiter — 8 LLM calls at a time
// ---------------------------------------------------------------------------

async function pMap<T, R>(items: T[], fn: (item: T) => Promise<R>, concurrency = 8): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Persistence — upserts to DB if Prisma is configured, otherwise to a
// JSONL ledger on disk. Either way the engine never throws on persistence
// failures; it returns the records so the caller can retry or alert.
// ---------------------------------------------------------------------------

async function persistArticle(record: CuratedArticleRecord): Promise<void> {
  // Try Prisma first
  try {
    const prismaMod = await import("@prisma/client").catch(() => null);
    if (prismaMod?.PrismaClient) {
      const { PrismaClient } = prismaMod;
      const prisma = new PrismaClient();
      try {
        await prisma.curatedArticle.upsert({
          where: {
            source_externalId: {
              source: record.source,
              externalId: record.externalId,
            },
          },
          update: {
            title: record.title,
            url: record.url,
            doi: record.doi,
            pmid: record.pmid,
            tradition: record.tradition,
            score: JSON.stringify(record.score),
            aggregate: record.aggregate,
            curatedAt: new Date(record.curatedAt),
          },
          create: {
            source: record.source,
            externalId: record.externalId,
            title: record.title,
            url: record.url,
            doi: record.doi,
            pmid: record.pmid,
            tradition: record.tradition,
            score: JSON.stringify(record.score),
            aggregate: record.aggregate,
            curatedAt: new Date(record.curatedAt),
          },
        });
        await prisma.$disconnect();
        return;
      } catch (e) {
        await prisma.$disconnect().catch(() => {});
        throw e;
      }
    }
  } catch {
    // Fall through to JSONL
  }

  // Fallback: append to JSONL ledger
  const fs = await import("fs/promises");
  const path = process.env.CURATION_LEDGER_PATH ?? "/tmp/cabaladoscaminhos-curation.jsonl";
  await fs.mkdir(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  await fs.appendFile(path, JSON.stringify(record) + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// Per-article scoring
// ---------------------------------------------------------------------------

interface ScoredArticle {
  candidate: CandidateArticle;
  score: CurationScore;
  aggregate: number;
  decision: "ACCEPT" | "REVIEW" | "REJECT";
}

async function scoreArticle(candidate: CandidateArticle): Promise<ScoredArticle | null> {
  const userPrompt = buildCurationUserPrompt({
    title: candidate.title,
    authors: candidate.authors,
    abstract: candidate.abstract,
    source: candidate.source,
    url: candidate.url,
    publishedDate: candidate.publishedDate,
    doi: candidate.doi,
    pmid: candidate.pmid,
  });

  // 3 retries with exponential backoff for LLM hiccups
  let raw = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      raw = await callLLM(CURATION_SYSTEM_PROMPT, userPrompt, {
        temperature: 0,
        maxTokens: 600,
      });
      break;
    } catch (e) {
      if (attempt === 2) {
        console.error(`[curation:score] LLM failed for "${candidate.title.slice(0, 60)}":`, e);
        return null;
      }
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }

  const score = safeParseScore(raw);
  if (!score) {
    console.warn(`[curation:score] Bad JSON for "${candidate.title.slice(0, 60)}" — REJECT`);
    return null;
  }

  const agg = aggregateScore(score);
  // Override the LLM recommendation based on aggregate if the LLM
  // misclassifies. Strict rules: any sub-score < 0.4 → REJECT.
  let decision: "ACCEPT" | "REVIEW" | "REJECT" = score.recommendation;
  if (
    score.relevance < REVIEW_THRESHOLD ||
    score.evidence < REVIEW_THRESHOLD ||
    score.safety < REVIEW_THRESHOLD ||
    score.universalism < REVIEW_THRESHOLD ||
    score.citations < REVIEW_THRESHOLD
  ) {
    decision = "REJECT";
  } else if (agg >= ACCEPT_THRESHOLD && decision === "REVIEW") {
    decision = "ACCEPT";
  } else if (agg < ACCEPT_THRESHOLD && decision === "ACCEPT") {
    decision = "REVIEW";
  }

  return { candidate, score, aggregate: agg, decision };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export interface CurateDailyOptions {
  sources?: CurationSource[];
  /** If true, also persist REVIEW articles for human triage. */
  includeReview?: boolean;
  /** Optional log sink (Sentry, console, etc). */
  logger?: {
    info: (msg: string, meta?: Record<string, unknown>) => void;
    error: (msg: string, meta?: Record<string, unknown>) => void;
  };
}

export async function curateDaily(
  options: CurateDailyOptions = {}
): Promise<CurationResult[]> {
  const sources = options.sources ?? DEFAULT_SOURCES;
  const includeReview = options.includeReview ?? false;
  const log = options.logger ?? {
    info: (msg, meta) => console.log(msg, meta ?? ""),
    error: (msg, meta) => console.error(msg, meta ?? ""),
  };

  const startAll = Date.now();
  log.info("[curation] starting daily run", {
    sourcesCount: sources.length,
    includeReview,
  });

  const results: CurationResult[] = [];

  for (const source of sources) {
    const sourceStart = Date.now();
    const errors: string[] = [];
    let fetched = 0;
    let curated = 0;
    let rejected = 0;
    let review = 0;

    try {
      log.info("[curation:fetch] starting", { source: source.name });
      const candidates = await fetchFromSource(source);
      fetched = candidates.length;
      log.info("[curation:fetch] done", { source: source.name, fetched });

      if (candidates.length === 0) {
        results.push({
          sourceName: source.name,
          fetched: 0,
          curated: 0,
          rejected: 0,
          review: 0,
          errors: [],
          durationMs: Date.now() - sourceStart,
        });
        continue;
      }

      const scored = await pMap(candidates, scoreArticle, 8);

      for (const s of scored) {
        if (!s) {
          rejected++;
          continue;
        }
        if (s.decision === "ACCEPT") {
          const record: CuratedArticleRecord = {
            source: s.candidate.source,
            externalId: s.candidate.externalId,
            title: s.candidate.title,
            url: s.candidate.url,
            doi: s.candidate.doi,
            pmid: s.candidate.pmid,
            tradition: s.candidate.tradition ?? source.tradition,
            score: s.score,
            aggregate: s.aggregate,
            curatedAt: new Date().toISOString(),
          };
          try {
            await persistArticle(record);
            curated++;
          } catch (e) {
            errors.push(`persist:${s.candidate.externalId}:${(e as Error).message}`);
            rejected++;
          }
        } else if (s.decision === "REVIEW" && includeReview) {
          // Same persistence — REVIEW goes to the same table, with a flag
          const record: CuratedArticleRecord = {
            source: `review:${s.candidate.source}`,
            externalId: s.candidate.externalId,
            title: s.candidate.title,
            url: s.candidate.url,
            doi: s.candidate.doi,
            pmid: s.candidate.pmid,
            tradition: s.candidate.tradition ?? source.tradition,
            score: s.score,
            aggregate: s.aggregate,
            curatedAt: new Date().toISOString(),
          };
          try {
            await persistArticle(record);
            review++;
          } catch (e) {
            errors.push(`persist:review:${s.candidate.externalId}:${(e as Error).message}`);
          }
        } else {
          rejected++;
        }
      }
    } catch (e) {
      errors.push((e as Error).message);
      log.error("[curation] source failed", {
        source: source.name,
        error: (e as Error).message,
      });
    }

    const durationMs = Date.now() - sourceStart;
    results.push({
      sourceName: source.name,
      fetched,
      curated,
      rejected,
      review,
      errors,
      durationMs,
    });
    log.info("[curation] source done", {
      source: source.name,
      fetched,
      curated,
      rejected,
      review,
      durationMs,
    });
  }

  const totalDuration = Date.now() - startAll;
  log.info("[curation] daily run complete", {
    totalDurationMs: totalDuration,
    sources: results.length,
  });

  return results;
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/** Run curation for a single source (used by the CLI script). */
export async function curateSource(
  sourceName: string,
  options: Omit<CurateDailyOptions, "sources"> = {}
): Promise<CurationResult | null> {
  const source = DEFAULT_SOURCES.find((s) => s.name === sourceName);
  if (!source) {
    console.error(`[curation] source "${sourceName}" not found in registry`);
    return null;
  }
  const results = await curateDaily({ ...options, sources: [source] });
  return results[0] ?? null;
}

/** Returns the list of registered sources (CLI / cron / docs). */
export function listSources(): CurationSource[] {
  return [...DEFAULT_SOURCES];
}