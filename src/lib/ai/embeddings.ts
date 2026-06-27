// ============================================================================
// Akasha Portal — Embeddings + pgvector helpers
// ============================================================================
// Helpers para gerar embeddings (OpenAI) e buscar artigos similares via
// pgvector. Usado pelo Akasha IA RAG.
//
// Refs:
// - prisma/migrations/20260627_000000_pgvector_enable/migration.sql
// - docs/AI-PROMPT-base.md §Akasha IA (consciousness translator)
// ============================================================================

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;

// Singleton OpenAI client (lazy)
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY nao configurada. Defina em .env.local.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Gera embedding (vetor 1536-dim) para um texto usando OpenAI.
 * Texto eh truncado para ~8000 chars (limite seguro do modelo).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const truncated = text.slice(0, 8000);
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: truncated,
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIM) {
    throw new Error(`Embedding invalido: esperado ${EMBEDDING_DIM} dims, recebi ${embedding?.length ?? 0}`);
  }
  return embedding;
}

/**
 * Gera e persiste embedding para um Article.
 * Idempotente — se ja tem embedding, sobrescreve.
 */
export async function embedArticle(articleId: string): Promise<void> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, title: true, abstract: true, content: true },
  });
  if (!article) throw new Error(`Article ${articleId} nao encontrado`);

  const text = [article.title, article.abstract, article.content].filter(Boolean).join('\n\n');
  const embedding = await generateEmbedding(text);

  // pgvector aceita o vetor como string '[0.1,0.2,...]'
  const vectorStr = `[${embedding.join(',')}]`;

  await prisma.$executeRawUnsafe(
    `UPDATE "Article" SET embedding = $1::vector WHERE id = $2`,
    vectorStr,
    articleId,
  );
}

/**
 * Busca artigos similares a um texto via pgvector.
 * Retorna ate `limit` artigos com similarity > threshold.
 */
export async function searchSimilarArticles(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    tradition?: string;
  } = {},
): Promise<Array<{ id: string; title: string; slug: string; similarity: number }>> {
  const { limit = 10, threshold = 0.7, tradition = null } = options;

  const queryEmbedding = await generateEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  const rows = await prisma.$queryRawUnsafe<
    Array<{ id: string; title: string; slug: string; similarity: number }>
  >(
    `SELECT id, title, slug, similarity
     FROM search_similar_articles($1::vector, $2, $3, $4)`,
    vectorStr,
    threshold,
    limit,
    tradition,
  );

  return rows;
}

/**
 * Helper para gerar embeddings em batch (usado em seeds / backfill).
 */
export async function embedArticlesBatch(articleIds: string[]): Promise<{
  succeeded: number;
  failed: Array<{ id: string; error: string }>;
}> {
  const failed: Array<{ id: string; error: string }> = [];
  let succeeded = 0;

  for (const id of articleIds) {
    try {
      await embedArticle(id);
      succeeded++;
    } catch (err) {
      failed.push({ id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return { succeeded, failed };
}