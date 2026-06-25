# @akasha/graphrag DOX

## Purpose

GraphRAG MVP do Akasha OS — `@akasha/graphrag`. Hybrid retrieval (graph
+ vector) sobre **PostgreSQL + pgvector**, estilo LightRAG (Guo et al.
2024, arXiv:2410.05779).

Esta é a camada de **extração de conhecimento** referida em
`/.hermes/reports/wave-30.3-graphrag-vector-hybrid.md` (Wave 30.3
research, ADR-0005).

## Why Postgres + pgvector (not Neo4j/FalkorDB)?

A spec do Wave 31.1 sugeria FalkorDB "preferred". Decisão do MVP:
**Postgres + pgvector + recursive CTE**, conforme
`wave-30.3-graphrag-vector-hybrid.md` §"Decisão arquitetural" e §"ADR-0005".

Justificativa:
- pgvector já está em produção (768d, HNSW indexado). Acrescentar
  FalkorDB exigiria novo binário + Docker Compose + monitoramento.
- Volume esperado do MVP: ~50 nodes, ~100 edges (corpus canônico
  dos 5 Pilares + medicinas + 10 discoveries exemplo). Trigger para
  FalkorDB/Neo4j = kg_nodes > 500k OU multi-hop > 4 (ADR-0005).
- Wave 30.3 research já rejeitou Neo4j para esta fase.

Swap futuro para FalkorDB = 1 arquivo (`falkor-backend.ts`
implementando `GraphBackend`), sem refactor nos consumers.

## Public API

| Export | Descrição |
|---|---|
| `GraphBackend` (interface) | Abstração sobre store de grafo |
| `PgGraphBackend` (class) | Implementação pgvector + recursive CTE |
| `InMemoryBackend` (class) | Mesmo interface, usado em testes |
| `HybridRetriever` (class) | Fusão RRF de vector + graph |
| `HashEmbedder` (class) | Embedder determinístico (MVP placeholder) |
| `OpenAIEmbedder` (class) | Stub para Wave 31.2 (text-embedding-3-small) |
| `buildPilaresSeed()` (fn) | Popula corpus canônico (idempotente) |
| `KgNode`, `KgEdge`, `RelatedCandidate`, `GraphRagConfig`, `RetrievalMode` (types) | Contratos públicos |

## Usage

```ts
import {
  HybridRetriever, PgGraphBackend, HashEmbedder,
} from "@akasha/graphrag/retriever";
import { buildPilaresSeed } from "@akasha/graphrag/seed";

const embedder = new HashEmbedder();
const backend = PgGraphBackend.fromEnv(embedder); // uses DATABASE_URL
await buildPilaresSeed(backend, embedder);

const retriever = new HybridRetriever(backend, embedder);
const related = await retriever.findRelated("pilar:cabala", {
  topK: 5,
  mode: "hybrid",
  labels: ["sefira", "odu", "hexagrama"],
});
// → RelatedCandidate[] sorted by rrfScore desc
```

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│ Portal API (/api/akasha/discoveries/related/[id])        │
│        ↓                                                  │
│   HybridRetriever.findRelated(startId, { mode, topK })  │
│        ├──→ Embedder.embed(startText) → Vector          │
│        ├──→ GraphBackend.vectorSearch(vec)  (cosine)    │
│        ├──→ GraphBackend.graphTraverse(startId, depth)  │
│        └──→ Reciprocal Rank Fusion → sorted output       │
│                                                          │
│   GraphBackend (interface)                               │
│        ├──→ PgGraphBackend (pgvector + recursive CTE)   │
│        └──→ InMemoryBackend (tests, no DB)              │
│                                                          │
│   Seed: buildPilaresSeed() → canonical corpus           │
│        (5 Pilares + 15 Odus + 10 Sefirot + 6 Hex +     │
│         5 conceitos + 4 medicinas + 10 discoveries)     │
└──────────────────────────────────────────────────────────┘
```

## Constraints (do not violate)

1. **No invented correspondences** — every edge must be anchored
   to canonical source (R-022, D-044, Wilhelm/Baynes, Yogi Bhajan,
   CORRELATION_MAP). See `corpus.ts` for sourcing.

2. **No PII in graph** — never include user birth data, name, email.
   Only canonical nodes (Pilar, Odu, Sefira, Hexagrama, Medicina,
   generic Discovery).

3. **Idempotent seed** — `buildPilaresSeed` can run N times. Uses
   `ON CONFLICT (label, name_normalized) DO NOTHING` pattern.

4. **Graceful degradation** — if DB unavailable, API returns
   `{ related: [], available: false, reason }` with HTTP 200.
   Never throw 500 for infra issues.

5. **Migration is PROPOSAL ONLY** — per
   `apps/akasha-portal/prisma/AGENTS.md` §Work Guidance 1, the SQL
   migration in `migrations/` is a proposal. A human applies it
   via:
   ```
   pnpm --filter akasha-portal exec prisma migrate dev \
     --name wave_31_1_graphrag
   ```

## Hybrid RRF formula

Cormack et al. 2009 / LightRAG (Guo et al. 2024):

```
score(d) = Σ_signal 1 / (k + rank_signal(d))
```

Onde `k = 60` (constante RRF padrão). Signals:
- **vector**: cosine ranking over embedding similarity
- **graph**: BFS traversal order from start node (depth ascending)

## Performance

MVP targets (Wave 31.1):
- Seed time: <5s for canonical corpus (~50 nodes)
- Query latency p95: <50ms (vector only), <100ms (hybrid)
- Memory: <200MB (no graph-state caching beyond Node cache)

## References

- Guo et al. 2024. "LightRAG: Simple and Fast Retrieval-Augmented
  Generation." arXiv:2410.05779.
- Cormack et al. 2009. "Reciprocal Rank Fusion outperforms Condorcet
  and individual Rank Learning Methods." SIGIR.
- Wave 30.3 research: `.hermes/reports/wave-30.3-graphrag-vector-hybrid.md`.
- ADR-0005 (graph backend trigger threshold).
