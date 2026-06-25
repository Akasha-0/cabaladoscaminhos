# @akasha/graphrag DOX

## Purpose

GraphRAG MVP do Akasha OS — `@akasha/graphrag`. Hybrid retrieval (graph
+ vector) sobre **PostgreSQL + pgvector**, estilo LightRAG (Guo et al.
2024, arXiv:2410.05779). Wave 31.1.

**Decisão arquitetural (racional):** Wave 30.3 research
(`.hermes/reports/wave-30.3-graphrag-vector-hybrid.md`) **explicitamente
recomendou NÃO adicionar Neo4j/FalkorDB agora** — gatilho quantitativo
ADR-0005 só dispara com `kg_nodes > 500k` ou queries multi-hop > 4 hops.
Este MVP implementa o **backend Postgres+pgvector+CTE** aprovado pelo
research, com **interface `GraphBackend` pluggable** para que uma
migração futura para FalkorDB/Neo4j seja trocar uma classe, não
reescrever consumers.

## Ownership

- `src/types/index.ts`: contratos públicos — `KgNode`, `KgEdge`,
  `KgRelation`, `KgNodeLabel`, `GraphBackend`, `RelatedCandidate`,
  `RetrievalMode`, `Embedder`, `GraphRagConfig`.
- `src/retriever/postgres-backend.ts`: implementação `PgGraphBackend`
  via driver `pg` (queries raw com `<=>` cosine + `WITH RECURSIVE`).
- `src/retriever/hybrid.ts`: `HybridRetriever` — RRF (Reciprocal Rank
  Fusion) sobre vector + graph signals. Mode: `'hybrid' | 'vector' | 'graph'`.
- `src/retriever/embedder.ts`: `HashEmbedder` determinístico (MVP) +
  `Embedder` interface (OpenAI plug-in pronto).
- `src/seed/index.ts`: `buildPilaresSeed()` — 5 Pilares + medicinas +
  10 discoveries de exemplo. Idempotente (upsert por `name_normalized`).
- `src/seed/run-seed.ts`: CLI `pnpm --filter @akasha/graphrag seed` que
  popula o grafo a partir de variáveis de ambiente.
- `src/index.ts`: barrel — entry point público.
- `migrations/20260626000000_wave_31_1_graphrag/migration.sql`: schema
  `kg_nodes` + `kg_edges` + `kg_triplets` (PROPOSAL — humano aplica
  via `pnpm --filter akasha-portal exec prisma migrate dev --name
  wave_31_1_graphrag`).
- `__tests__/hybrid.test.ts`: 1 teste de integração unitário usando
  `PgGraphBackend` com stub in-memory (sem Postgres real — viável em CI).

## Local Contracts

- **PROPOSAL ONLY**: `migrations/` é proposta. Conforme
  `apps/akasha-portal/prisma/AGENTS.md` (Work Guidance §1), **NÃO**
  rodar migration automaticamente. Após merge da branch, humano roda
  `pnpm --filter akasha-portal exec prisma migrate dev --name
  wave_31_1_graphrag`.
- **Pilar 4 ethics invariant**: nodes `odu` (15 canônicos D-044) são
  carregados com `metadata.requiresConsent: true`. Não inventar entry
  adicional — `buildPilaresSeed` valida contra a whitelist conhecida.
- **LGPD by design**: `kg_edges` tem `ON DELETE CASCADE`. `kg_triplets`
  é append-only (sem FK para `User`; index `source_doc_id` apenas).
- **Deterministic embedding**: `HashEmbedder` é hash 768d estável
  (mesmo `name` → mesmo vetor). NÃO usar para produção real — é
  placeholder até OpenAI text-embedding-3-small estar configurado.
- **Vector dim**: 768 (mesmo do `sessao_chunks` + `grimoire` — alinhado
  com schema atual; Wave 31.6 pode migrar para 1536 OpenAI).
- **RRF k**: `k=60` (Cormack et al. 2009, padrão LightRAG).
- **GraphBackend interface**: todo consumer depende desta interface,
  não da classe concreta. Trocar `PgGraphBackend` por `FalkorBackend`
  no futuro = mudar 1 import.

## Work Guidance

- **TypeScript estrito** (zero `any` em código novo)
- **Tests co-located** com código (`*.test.ts` ao lado)
- **Idempotência**: `seed()` pode rodar N vezes sem duplicar
  (constraint UNIQUE em `(label, name_normalized)` + upsert)
- **Não inventar correspondências** esotéricas (lesson N+15): edges
  entre Pilares usam apenas o `CORRELATION_MAP` exportado por
  `@akasha/core` (já curado)
- **Não bloquear**: se Postgres não disponível, `PgGraphBackend`
  retorna `EmptyBackend` com warning — UI mostra "grafo indisponível"

## Verification

- `pnpm --filter @akasha/graphrag typecheck` (0 errors)
- `pnpm --filter @akasha/graphrag test:run` (1 test mínimo verde)
- Antes de commit: typecheck + test
- Antes de merge: `pnpm --filter akasha-portal typecheck` (portal
  importa este package via path alias `@akasha/graphrag`)

## Imports

```ts
import { GraphRag, HashEmbedder, type KgNode } from '@akasha/graphrag';
// ou módulos específicos:
import { PgGraphBackend } from '@akasha/graphrag/retriever';
import { buildPilaresSeed } from '@akasha/graphrag/seed';
```

## Roadmap

- **Wave 31.1 (atual)**: MVP Postgres+pgvector+CTE, seed 5 Pilares,
  endpoint `/api/akasha/discoveries/related/[id]`.
- **Wave 31.2**: OpenIE extractor (LLM triplets) + entity linker
  fuzzy + indexação dos 50k papers PubMed (Wave 21.1).
- **Wave 31.3**: PPR proxy (hippoRAG-style) para queries > 4 hops.
- **Wave 5+ (se ADR-0005 trigger)**: migrar para FalkorDB/Neo4j via
  `GraphBackend` interface. Zero refactor de consumers.

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado no momento.)
