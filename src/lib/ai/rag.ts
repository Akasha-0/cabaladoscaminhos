// ============================================================================
// Akasha Portal — RAG helper (Wave 10 — 2026-06-27)
// ============================================================================
// Wrapper sobre searchSimilarArticles() (pgvector) que:
//   - busca top N artigos similares à query do usuário
//   - hidrata cada hit com excerpt + tradição (para citação no prompt)
//   - degrada graceful quando pgvector não está disponível
//
// Não retorna Prisma types diretamente para o endpoint — devolve um shape
// neutro { id, title, slug, similarity, excerpt, tradition } que serve tanto
// pra injetar no system prompt quanto pra devolver como "sources" no JSON
// de resposta da API.
// ============================================================================

import { searchSimilarArticles } from './embeddings';
import { prisma } from '@/lib/prisma';
import {
  detectTradition,
  type AkashaTradition,
  type RagSource,
} from './prompts/akasha';

export interface RagSearchOptions {
  /** Texto da pergunta — vira embedding de busca */
  query: string;
  /** Tradição opcional para filtrar a busca semântica */
  tradition?: string | null;
  /** Quantos artigos pegar (default 5, max 10) */
  topK?: number;
  /** Limiar mínimo de similaridade (0..1, default 0.65) */
  threshold?: number;
}

export interface RagSearchResult {
  sources: RagSource[];
  /** Tradição usada na busca (explícita OU auto-detectada) */
  effectiveTradition: string | null;
  /** Se a tradição foi auto-detectada (vs explícita do usuário) */
  traditionWasAutoDetected: boolean;
  /** Tempo total em ms (busca + hidratação) */
  took_ms: number;
  /** Quando a busca foi pulada por algum motivo (sem Supabase, sem embedding, etc) */
  degraded: boolean;
  /** Motivo da degradação (se degraded=true) */
  reason?: string;
}

/**
 * Executa busca semântica + hidratação. Falha nunca é fatal — sempre devolve
 * um RagSearchResult, possivelmente com degraded=true e sources vazio.
 * O caller decide o que fazer com sources=[] (tipicamente: rodar sem RAG).
 */
export async function runRagSearch({
  query,
  tradition = null,
  topK = 5,
  threshold = 0.65,
}: RagSearchOptions): Promise<RagSearchResult> {
  const start = Date.now();

  // 1. Validação mínima
  if (!query || query.trim().length < 3) {
    return {
      sources: [],
      effectiveTradition: tradition ?? null,
      traditionWasAutoDetected: false,
      took_ms: Date.now() - start,
      degraded: true,
      reason: 'Query muito curta (< 3 chars)',
    };
  }

  const clampedK = Math.min(Math.max(1, topK), 10);

  // 2. Wave 18 — auto-detect tradição quando usuário não selecionou filtro.
  // Só usamos o auto-detect como filtro de RAG se o caller não passou tradição
  // explícita. Mesmo assim, devolvemos no resultado para o prompt usar.
  const detectedTradition: AkashaTradition | null = tradition
    ? null
    : detectTradition(query);
  const effectiveTradition =
    tradition ?? (detectedTradition as string | null) ?? null;

  // 3. Busca semântica via pgvector
  let hits: Array<{ id: string; title: string; slug: string; similarity: number }>;
  try {
    hits = await searchSimilarArticles(query, {
      limit: clampedK,
      threshold,
      tradition: effectiveTradition ?? undefined,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn('[RAG] searchSimilarArticles falhou, degradando:', reason);
    return {
      sources: [],
      effectiveTradition,
      traditionWasAutoDetected: !tradition && !!detectedTradition,
      took_ms: Date.now() - start,
      degraded: true,
      reason: `pgvector indisponível: ${reason.slice(0, 120)}`,
    };
  }

  if (hits.length === 0) {
    return {
      sources: [],
      effectiveTradition,
      traditionWasAutoDetected: !tradition && !!detectedTradition,
      took_ms: Date.now() - start,
      degraded: false,
    };
  }

  // 4. Hidratação: pega abstract + tradition + content (truncado) dos hits
  // para injetar como excerpt no prompt. Usa uma query em batch.
  let rows: Array<{
    id: string;
    tradition: string | null;
    abstract: string | null;
    content: string | null;
  }> = [];
  try {
    rows = await prisma.article.findMany({
      where: { id: { in: hits.map((h) => h.id) } },
      select: {
        id: true,
        tradition: true,
        abstract: true,
        // Não puxa content completo — só excerpt via abstract (economia de tokens)
      },
    });
  } catch (err) {
    // Falha de hidratação não derruba o RAG — devolvemos os hits sem excerpt
    const reason = err instanceof Error ? err.message : String(err);
    console.warn('[RAG] hidratação falhou (sem abstract):', reason);
    rows = [];
  }

  const byId = new Map(rows.map((r) => [r.id, r]));

  // 5. Merge + ordena por similarity desc (searchSimilarArticles já retorna
  // ordenado, mas garantimos após o map).
  const sources: RagSource[] = hits
    .map((h) => {
      const meta = byId.get(h.id);
      const abstract = meta?.abstract ?? null;
      return {
        id: h.id,
        title: h.title,
        slug: h.slug,
        similarity: h.similarity,
        excerpt: abstract ? abstract.slice(0, 600) : undefined,
        tradition: meta?.tradition ?? undefined,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  return {
    sources,
    effectiveTradition,
    traditionWasAutoDetected: !tradition && !!detectedTradition,
    took_ms: Date.now() - start,
    degraded: false,
  };
}