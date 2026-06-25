# @akasha/graphrag

GraphRAG MVP for Akasha OS — Wave 31.1.

**What it does**: builds a knowledge graph over the 5 Pillars (Kabalah,
Astrology, Tantra, Odu, I Ching) + ancestral medicines + sample
discoveries, then runs **hybrid retrieval** (vector cosine + graph
traversal, fused via Reciprocal Rank Fusion) to find related entities.

**Backend**: PostgreSQL + pgvector + recursive CTE. NOT Neo4j/FalkorDB
in this MVP — see [AGENTS.md](./AGENTS.md) §"Why Postgres".

## Quickstart

```bash
# 1. Apply migration (PROPOSAL — human applies)
pnpm --filter akasha-portal exec prisma migrate dev \
  --name wave_31_1_graphrag

# 2. Seed canonical corpus
pnpm --filter @akasha/graphrag seed

# 3. Use it
const { HybridRetriever, PgGraphBackend, HashEmbedder } =
  await import("@akasha/graphrag/retriever");
const embedder = new HashEmbedder();
const backend = PgGraphBackend.fromEnv(embedder);
const retriever = new HybridRetriever(backend, embedder);
const related = await retriever.findRelated("pilar:cabala", { topK: 5 });
```

## API: `/api/akasha/discoveries/related/[id]`

```
GET /api/akasha/discoveries/related/pilar:cabala
    ?mode=hybrid   (hybrid|vector|graph)
    &limit=5
    &labels=pilar,sefira,odu
```

Returns:
```json
{
  "related": [
    {
      "id": "sefira:tiferet",
      "label": "sefira",
      "name": "Tiferet",
      "description": "Beleza, equilíbrio, Verbo Encarnado",
      "rrfScore": 0.032,
      "vectorScore": 0.78,
      "graphDepth": 1,
      "source": "hybrid",
      "requiresConsent": false
    }
  ],
  "available": true,
  "mode": "hybrid",
  "limit": 5
}
```

## Tests

```bash
pnpm --filter @akasha/graphrag test
# 8/8 passing
```

## Files

- `src/types/index.ts` — public contracts
- `src/retriever/` — HybridRetriever, PgGraphBackend, InMemoryBackend, Embedders
- `src/seed/` — canonical corpus (corpus.ts) + seed builder + CLI
- `migrations/` — PROPOSAL SQL migration
- `__tests__/` — integration tests (in-memory, no DB needed)
