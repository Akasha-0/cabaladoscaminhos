/**
 * ingest-runner.ts — orquestrador do cron semanal de ingestão PubMed.
 *
 * Wave 23.1 — ADR-013 (consciência viva). Esta é a função "pura" chamada
 * pelo route handler e pelo script shell. Toda a lógica fica aqui para
 * facilitar testes com mocks (pubmed-client + prisma).
 *
 * Fluxo (por query):
 *   1. ESearch PubMed → lista de PMIDs (reldate=7d)
 *   2. Para cada PMID:
 *      a. ESummary → metadata + abstract + DOI
 *      b. Se DOI já existe em LiteraturePaper → skip
 *      c. embedText(abstract) → 1536-dim vector (graceful degradation)
 *      d. prisma.literaturePaper.create() (upsert-safe via DOI unique)
 *   3. CronLog row append-only registra o delta (inserted/skipped/errors)
 *
 * Performance alvo: < 5min/semana. Com throttle 350ms × (7 queries ×
 * 20 papers) ≈ 50s só de E-utilities. Embedding via OpenAI ~200ms ×
 * ~140 papers ≈ 30s. Total ~80s + DB writes. Bem dentro do budget.
 *
 * LGPD: sem PII em logs. Erros guardam apenas pmid/stage/message —
 * nunca abstracts (já estão públicos via PubMed, mas mantemos logs
 * enxutos por consistência com AuditLog/PrivacyConsent).
 */

import { prisma } from '@/lib/infrastructure/prisma';
import {
  type PubmedSearchOptions,
  type PubmedSummary,
  SEED_QUERIES,
  fetchPubmedSummary,
  searchPubmed,
} from '@/lib/application/literature/pubmed-client';
import { safeEmbedAbstract } from '@/lib/application/literature/embeddings';

/** Forma do erro armazenado em `CronLog.errors.items[]`. */
export interface CronItemError {
  pmid: string;
  stage: 'search' | 'fetch' | 'embed' | 'persist';
  message: string;
}

/** Resultado agregado de uma execução completa do cron. */
export interface CronRunResult {
  /** ID da row CronLog criada. */
  logId: string;
  /** Papers inseridos nesta execução. */
  inserted: number;
  /** Papers pulados por duplicata (DOI já existia). */
  skipped: number;
  /** Erros não-fatais acumulados. */
  errors: CronItemError[];
  /** Status final. */
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
}

export interface IngestRunnerOptions {
  /** Override do fetch (para testes). Default: global fetch. */
  fetchFn?: PubmedSearchOptions['fetchFn'];
  /** Sleep entre chamadas (0 em testes). Default: 350ms. */
  throttleMs?: number;
  /** Override de queries. Default: SEED_QUERIES do Wave 23.1. */
  queries?: readonly string[];
  /** Logger — default console. */
  logger?: Pick<Console, 'log' | 'warn' | 'error'>;
  /** Clock — injetável em testes. Default: () => new Date(). */
  now?: () => Date;
  /** Job name — default 'literature-ingest'. */
  jobName?: string;
}

/**
 * Executa o ciclo completo de ingestão. Cria 1 CronLog row.
 *
 * @throws Nunca lança — todos os erros são capturados e acumulados em
 *         `CronLog.errors`. A função SEMPRE retorna um CronRunResult.
 */
export async function runLiteratureIngest(
  opts: IngestRunnerOptions = {}
): Promise<CronRunResult> {
  const logger = opts.logger ?? console;
  const now = opts.now ?? (() => new Date());
  const jobName = opts.jobName ?? 'literature-ingest';
  const queries = opts.queries ?? SEED_QUERIES;

  const startedAt = now();
  const logRow = await prisma.cronLog.create({
    data: {
      jobName,
      startedAt,
      status: 'RUNNING',
      inserted: 0,
      skipped: 0,
      errors: { items: [] },
    },
    select: { id: true },
  });

  const errors: CronItemError[] = [];
  let inserted = 0;
  let skipped = 0;
  const seenPmids = new Set<string>();

  try {
    for (const query of queries) {
      logger.log?.(`[literature-ingest] query=${JSON.stringify(query)}`);

      let pmids: string[] = [];
      try {
        pmids = await searchPubmed(query, {
          fetchFn: opts.fetchFn,
          throttleMs: opts.throttleMs,
        });
      } catch (err) {
        errors.push({
          pmid: query,
          stage: 'search',
          message: err instanceof Error ? err.message : String(err),
        });
        continue;
      }

      for (const pmid of pmids) {
        if (seenPmids.has(pmid)) continue; // dedup intra-run
        seenPmids.add(pmid);

        const result = await ingestOnePaper(pmid, {
          fetchFn: opts.fetchFn,
          throttleMs: opts.throttleMs,
          logger,
        });

        if (result.kind === 'inserted') inserted++;
        else if (result.kind === 'skipped') skipped++;
        else errors.push(result.error);
      }
    }
  } catch (err) {
    // Erro fatal (ex: DB indisponível). Loga e marca como FAILED.
    logger.error?.(
      `[literature-ingest] fatal: ${err instanceof Error ? err.message : String(err)}`
    );
    errors.push({
      pmid: 'N/A',
      stage: 'persist',
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const status = computeStatus(inserted, errors);
  const finishedAt = now();

  await prisma.cronLog.update({
    where: { id: logRow.id },
    data: {
      finishedAt,
      status,
      inserted,
      skipped,
      errors: { items: errors },
    },
  });

  logger.log?.(
    `[literature-ingest] done status=${status} inserted=${inserted} skipped=${skipped} errors=${errors.length}`
  );

  return { logId: logRow.id, inserted, skipped, errors, status };
}

/**
 * Processa 1 paper: fetch → embed → upsert-skip-duplicate.
 * Retorna um union discriminada para o caller agregar no CronLog.
 */
type IngestOneResult =
  | { kind: 'inserted'; pmid: string }
  | { kind: 'skipped'; pmid: string; reason: 'duplicate-doi' | 'duplicate-pmid' }
  | { kind: 'error'; error: CronItemError };

async function ingestOnePaper(
  pmid: string,
  opts: Pick<IngestRunnerOptions, 'fetchFn' | 'throttleMs' | 'logger'>
): Promise<IngestOneResult> {
  const logger = opts.logger ?? console;

  // 1. Fetch metadata + abstract
  let summary: PubmedSummary | null;
  try {
    summary = await fetchPubmedSummary(pmid, {
      fetchFn: opts.fetchFn,
      throttleMs: opts.throttleMs,
    });
  } catch (err) {
    return {
      kind: 'error',
      error: {
        pmid,
        stage: 'fetch',
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }

  if (!summary) {
    return {
      kind: 'error',
      error: { pmid, stage: 'fetch', message: 'empty ESummary response' },
    };
  }

  if (!summary.title) {
    return {
      kind: 'error',
      error: { pmid, stage: 'fetch', message: 'missing title' },
    };
  }

  // 2. Skip por DOI (Wave 21.1 unique constraint)
  if (summary.doi) {
    const existing = await prisma.literaturePaper.findUnique({
      where: { doi: summary.doi },
      select: { id: true },
    });
    if (existing) {
      logger.log?.(`[literature-ingest] skip dup-doi pmid=${pmid} doi=${summary.doi}`);
      return { kind: 'skipped', pmid, reason: 'duplicate-doi' };
    }
  } else {
    // Sem DOI: tenta por PMID como secondary unique
    const existing = await prisma.literaturePaper.findFirst({
      where: { pmid },
      select: { id: true },
    });
    if (existing) {
      logger.log?.(`[literature-ingest] skip dup-pmid pmid=${pmid}`);
      return { kind: 'skipped', pmid, reason: 'duplicate-pmid' };
    }
  }

  // 3. Embed (graceful degradation: falha → vetor de zeros, paper é inserido)
  let embedding: number[] = [];
  try {
    const res = await safeEmbedAbstract(summary.abstract || summary.title);
    embedding = res.embedding;
  } catch (err) {
    return {
      kind: 'error',
      error: {
        pmid,
        stage: 'embed',
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }

  // 4. Persist (skip on race: unique constraint pode disparar P2002)
  try {
    await prisma.literaturePaper.create({
      data: {
        pmid,
        doi: summary.doi,
        title: summary.title,
        authors: summary.authors,
        year: summary.year,
        journal: summary.journal,
        abstract: summary.abstract,
        fullTextUrl: summary.urlPubmed,
        embedding,
        tags: [], // populado depois via /api/literature/papers/[id] PATCH
        source: 'pubmed-cron',
      },
    });
    logger.log?.(`[literature-ingest] inserted pmid=${pmid} doi=${summary.doi ?? 'none'}`);
    return { kind: 'inserted', pmid };
  } catch (err) {
    // P2002 = unique constraint violation (race com cron paralelo ou manual ingest)
    if (isPrismaUniqueError(err)) {
      logger.log?.(`[literature-ingest] skip race-dup pmid=${pmid}`);
      return { kind: 'skipped', pmid, reason: 'duplicate-doi' };
    }
    return {
      kind: 'error',
      error: {
        pmid,
        stage: 'persist',
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Status final:
 *   - SUCCESS: zero erros, ≥0 inserções
 *   - PARTIAL_SUCCESS: ≥1 inserção E ≥1 erro não-fatal
 *   - FAILED: zero inserções E ≥1 erro
 */
function computeStatus(
  inserted: number,
  errors: CronItemError[]
): CronRunResult['status'] {
  if (errors.length === 0) return 'SUCCESS';
  if (inserted > 0) return 'PARTIAL_SUCCESS';
  return 'FAILED';
}

/** Type guard para Prisma unique constraint error (P2002). */
function isPrismaUniqueError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const code = (err as { code?: unknown }).code;
  return code === 'P2002';
}