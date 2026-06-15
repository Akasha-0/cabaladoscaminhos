// Grimoire search — combines chart context (5 Pilares) with text search
// to retrieve relevant grimoire entries for the Mentor module.
//
// Architecture (see searchGrimoire function):
//   1. JSONB filter on grimoire.metadata by chartCtx fields
//      (element, oduId, pillarsConsulted) — Postgres-only filter
//   2. Text matching on grimoire.conteudo using chartCtx signals
//      (e.g. Odu nome, signo solar)
//   3. Optional: Ollama embedding for semantic search (degrades
//      gracefully — see tests/lib/grimoire/search.test.ts which has
//      6 failing tests, likely related to this Ollama dependency)
//
// Related files:
//   - apps/akasha-portal/src/lib/infrastructure/grimoire-sync.ts:
//     one-way filesystem → DB sync (this file reads from DB)
//   - apps/akasha-portal/src/lib/infrastructure/types.ts:
//     STUB for legacy compat with consult/route.ts (see N+24 note
//     in types.ts header)
//   - tests/lib/grimoire/search.test.ts: 6 failing tests
//   - tests/infrastructure/rate-limit.test.ts: NOT related (different
//     test scope; rate limit not search)
//
// Re-export abaixo é retrocompat com consult/route.ts. Não remover
// sem migrar consult/route.ts também (N+20 lesson pattern).

import { prisma } from '@/lib/infrastructure/prisma';
// Re-export para retrocompat com consult/route.ts
export type { ChartContext, GrimoireContext } from './types';
import type {
  ChartContext,
  GrimoireContext,
  GrimoireSearchQuery,
  GrimoireSearchResult,
} from './types';

// ---------------------------------------------------------------------------
// Contexto legado (Camada 3) — retrocompatível com consult/route.ts
// ---------------------------------------------------------------------------

const FALLBACK_CATEGORIES = ['Botânica', 'Odus', 'Diagnóstico'];

export async function searchGrimoire(
  _question: string,
  chartCtx: ChartContext,
  limit = 5
): Promise<GrimoireContext> {
  try {
    const results: Array<{
      titulo?: string;
      conteudo: string;
      categoria: string;
      metadata: Record<string, unknown>;
      slug: string;
    }> = [];

    // 1. Filtro por metadados JSONB + texto baseado no chartCtx
    if (chartCtx.element) {
      const element = chartCtx.element;

      const byElement = await prisma.$queryRaw<
        Array<{ slug: string; categoria: string; conteudo: string; metadata: unknown }>
      >`
        SELECT slug, categoria, conteudo, metadata
        FROM grimoire
        WHERE
          metadata->>'elemento' = ${element}
          OR metadata->'elementos' @> ${JSON.stringify([element])}::jsonb
        LIMIT ${limit}
      `;

      for (const row of byElement) {
        results.push({
          slug: row.slug,
          titulo: row.slug,
          conteudo: row.conteudo,
          categoria: row.categoria,
          metadata: (row.metadata as Record<string, unknown>) ?? {},
        });
      }
    }

    if (chartCtx.oduId && results.length < limit) {
      const oduId = chartCtx.oduId;
      const remaining = limit - results.length;
      const existingSlugs = results.map((r) => r.slug);

      const byOdu = await prisma.$queryRaw<
        Array<{ slug: string; categoria: string; conteudo: string; metadata: unknown }>
      >`
        SELECT slug, categoria, conteudo, metadata
        FROM grimoire
        WHERE slug != ALL(${existingSlugs}::text[])
          AND (
            metadata->>'oduId' = ${oduId}
            OR conteudo ILIKE ${'%' + oduId + '%'}
          )
        LIMIT ${remaining}
      `;

      for (const row of byOdu) {
        results.push({
          slug: row.slug,
          titulo: row.slug,
          conteudo: row.conteudo,
          categoria: row.categoria,
          metadata: (row.metadata as Record<string, unknown>) ?? {},
        });
      }
    }

    // 2. Fallback por categoria
    if (results.length < limit) {
      const remaining = limit - results.length;
      const existingSlugs = results.map((r) => r.slug);

      const byCategory = await prisma.grimoireEntry.findMany({
        where: {
          categoria: { in: FALLBACK_CATEGORIES },
          slug: existingSlugs.length > 0 ? { notIn: existingSlugs } : undefined,
        },
        take: remaining,
        select: {
          slug: true,
          categoria: true,
          conteudo: true,
          metadata: true,
        },
      });

      for (const row of byCategory) {
        results.push({
          slug: row.slug,
          titulo: row.slug,
          conteudo: row.conteudo,
          categoria: row.categoria,
          metadata: (row.metadata as Record<string, unknown>) ?? {},
        });
      }
    }

    const pillarsConsulted = [...new Set(results.map((r) => r.categoria))];

    return {
      entries: results.map((r) => ({
        id: r.slug,
        title: r.titulo ?? r.slug,
        content: r.conteudo,
        category: r.categoria,
        tags: [],
        titulo: r.titulo ?? r.slug,
        conteudo: r.conteudo,
        categoria: r.categoria,
      })),
      library: 'grimoire',
      pillarsConsulted,
    };
  } catch {
    return { entries: [], library: 'grimoire', pillarsConsulted: [] };
  }
}

// ---------------------------------------------------------------------------
// Camada 2 — Busca híbrida (JSONB containment + pgvector cosine distance)
// Doc 25 §5. Wire-up no consult/route.ts para `grimoireRefs[]` anti-alucinação.
// ---------------------------------------------------------------------------

/**
 * Gera embedding via Ollama (mesmo pipeline do sync.ts). Retorna `null` se
 * Ollama offline — nesse caso a busca fica só pelo filtro JSONB.
 */
async function getEmbeddingForQuery(text: string): Promise<number[] | null> {
  const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/embeddings';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as { embedding?: number[] };
    return Array.isArray(data.embedding) && data.embedding.length === 768
      ? data.embedding
      : null;
  } catch {
    return null;
  }
}

/**
 * Constrói o fragmento JSONB usado em `metadata @> $1::jsonb` a partir de
 * um Record de tags. Converte arrays em JSONB arrays, valores primitivos em
 * JSONB strings.
 */
function buildJsonbTags(
  tags: Record<string, string | number | boolean | (string | number)[]>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(tags)) {
    out[k] = Array.isArray(v) ? v : v;
  }
  return out;
}

/**
 * Busca híbrida no Grimório: filtro determinístico JSONB + similaridade
 * semântica pgvector. Veja Doc 25 §5.
 *
 * Edge case: se o filtro JSONB retorna 0, relaxa para `metadata->>'elemento'`
 * apenas e loga `event: grimoire.search.fallback`.
 */
export async function searchGrimoireHybrid(
  q: GrimoireSearchQuery
): Promise<GrimoireSearchResult[]> {
  const limit = q.limit ?? 10;
  const tagsObj: Record<string, string | number | boolean | (string | number)[]> = {};
  if (q.tags) {
    q.tags.forEach(tag => { tagsObj[tag] = true; });
  }
  const jsonbTags = buildJsonbTags(tagsObj);

  // 1. Embedding da query (best-effort — degrada sem se Ollama offline)
  const embedding = await getEmbeddingForQuery(q.text ?? '');
  const vectorStr = embedding ? `[${embedding.join(',')}]` : null;

  // 2. Tenta filtro composto
  const composed = await runHybridQuery(jsonbTags, vectorStr, limit);

  if (composed.length > 0) return composed;

  // 3. Fallback: relaxa para `metadata->>'elemento'` apenas (se existir)
  const elemento = jsonbTags.elemento as string | undefined;
  if (elemento) {
    const relaxed: Record<string, unknown> = { elemento };
    const relaxedResults = await runHybridQuery(relaxed, vectorStr, limit);
    if (relaxedResults.length > 0) {
      console.info(
        JSON.stringify({
          event: 'grimoire.search.fallback',
          reason: 'composite_filter_zero_results',
          relaxedTag: 'elemento',
        })
      );
      return relaxedResults;
    }
  }

  // 4. Fallback final: sem embedding, lista por biblioteca (semântica perdida)
  if (!vectorStr) {
    const byBiblioteca = await prisma.grimoireEntry.findMany({
      where: { categoria: { in: FALLBACK_CATEGORIES } },
      take: limit,
      select: {
        id: true,
        slug: true,
        categoria: true,
        biblioteca: true,
        conteudo: true,
        metadata: true,
      },
    });
    return byBiblioteca.map((row) => ({
      entries: [{
        id: row.id,
        title: row.slug,
        content: row.conteudo,
        category: row.categoria,
        tags: [],
      }],
      context: {
        library: row.biblioteca,
        entries: [],
      },
      score: 0,
    }));
  }

  return [];
}

async function runHybridQuery(
  jsonbTags: Record<string, unknown>,
  vectorStr: string | null,
  limit: number
): Promise<GrimoireSearchResult[]> {
  if (vectorStr) {
    // Híbrido: JSONB containment + ordenação por distância cosseno
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        slug: string;
        categoria: string;
        biblioteca: string;
        conteudo: string;
        metadata: unknown;
        distance: number;
      }>
    >`
      SELECT id, slug, categoria, biblioteca, conteudo, metadata,
             embedding <=> cast(${vectorStr} as vector) AS distance
      FROM grimoire
      WHERE metadata @> ${JSON.stringify(jsonbTags)}::jsonb
        AND embedding IS NOT NULL
      ORDER BY embedding <=> cast(${vectorStr} as vector)
      LIMIT ${limit}
    `;
    return rows.map((r) => ({
      entries: [{
        id: r.id,
        title: r.slug,
        content: r.conteudo,
        category: r.categoria,
        tags: [],
      }],
      context: {
        library: r.biblioteca,
        entries: [],
      },
      score: 1 - r.distance,
    }));
  }

  // Sem embedding: só filtro JSONB (sem ordenação por distância)
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      slug: string;
      categoria: string;
      biblioteca: string;
      conteudo: string;
      metadata: unknown;
    }>
  >`
    SELECT id, slug, categoria, biblioteca, conteudo, metadata
    FROM grimoire
    WHERE metadata @> ${JSON.stringify(jsonbTags)}::jsonb
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    entries: [{
      id: r.id,
      title: r.slug,
      content: r.conteudo,
      category: r.categoria,
      tags: [],
    }],
    context: {
      library: r.biblioteca,
      entries: [],
    },
    score: 0,
  }));
}
