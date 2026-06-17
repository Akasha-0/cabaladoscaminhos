import { prisma } from '@/lib/infrastructure/prisma';

export interface KnowledgeEntry {
  id: string;
  slug: string;
  title?: string;
  content: string;
  categoria: string;
  biblioteca?: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
  distance?: number;
}

export interface SearchQuery {
  text: string;
  library?: string;
}

export interface SearchFilters {
  tags?: Record<string, unknown>;
  source?: string;
  elemento?: string;
  corpos_tantricos_alvo?: number[];
}

export interface SearchResult {
  entries: KnowledgeEntry[];
  context: {
    library: string;
    entries: KnowledgeEntry[];
  };
}

/**
 * Busca híbrida no Grimório (filtro JSONB + semântico pgvector)
 */
export async function searchGrimoireHybrid(
  query: SearchQuery & { tags?: Record<string, unknown>; limit?: number },
  filters?: SearchFilters
): Promise<SearchResult> {
  const limit = query.limit ?? 10;

  // Build JSONB containment filter from tags
  const tagFilter = query.tags ?? filters?.tags ?? {};

  try {
    const rows = await prisma.$queryRaw<KnowledgeEntry[]>`
      SELECT id, slug, title, conteudo as content, categoria, biblioteca,
             metadata, embedding
      FROM "GrimoireEntry"
      WHERE metadata @> ${JSON.stringify(tagFilter)}::jsonb
      LIMIT ${limit}
    ` as KnowledgeEntry[];

    // Fallback: if composite returns 0 and has elemento, try elemento-only query
    if (rows.length === 0 && tagFilter.elemento) {
      try {
        const elementoFallback = await (prisma.grimoireEntry as unknown as {
          findMany: (args: { where: Record<string, unknown>; take: number }) => Promise<KnowledgeEntry[]>;
        }).findMany({
          where: {
            metadata: { path: ['elemento'], equals: tagFilter.elemento },
          } as Record<string, unknown>,
          take: limit,
        });
        if (elementoFallback.length > 0) {
          return {
            entries: elementoFallback,
            context: { library: query.library ?? 'all', entries: elementoFallback },
          };
        }
      } catch {
        // fall through to empty
      }
    }

    // If Ollama is available and query.text is provided, re-rank by vector similarity
    if (query.text && process.env.OLLAMA_URL) {
      try {
        const embedRes = await fetch(process.env.OLLAMA_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text',
            prompt: query.text,
          }),
        });
        if (embedRes.ok) {
          const { embedding } = await embedRes.json() as { embedding: number[] };
          // Re-rank by cosine similarity (simple dot product)
          const ranked = rows
            .filter((r) => r.embedding && r.embedding.length === embedding.length)
            .map((r) => ({
              ...r,
              distance: r.embedding!.reduce((sum, v, i) => sum + v * embedding[i], 0) /
                (Math.sqrt(r.embedding!.reduce((s, v) => s + v * v, 0)) *
                  Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) + 1e-9),
            }))
            .sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0))
            .slice(0, limit);
          return {
            entries: ranked,
            context: { library: query.library ?? 'all', entries: ranked },
          };
        }
      } catch {
        // Ollama offline — fall through to JSONB results
      }
    }

    return {
      entries: rows,
      context: { library: query.library ?? 'all', entries: rows },
    };
  } catch {
    return {
      entries: [],
      context: { library: query.library ?? 'all', entries: [] },
    };
  }
}
