# @akasha/graphrag

GraphRAG MVP for Akasha OS — Wave 31.1.

**What it does**: builds a knowledge graph over the 5 Pillars (Kabalah,
Astrology, Tantra, Odu, I Ching) + ancestral medicines + sample
discoveries, and exposes hybrid retrieval (vector + graph traversal
fused via RRF).

**Backend**: PostgreSQL + pgvector + recursive CTE (per Wave 30.3
research recommendation). Pluggable `GraphBackend` interface allows
future migration to FalkorDB/Neo4j without consumer changes.

## Quickstart

```ts
import {
  HashEmbedder,
  InMemoryBackend,
  HybridRetriever,
} from "@akasha/graphrag/retriever";
import { buildPilaresSeed } from "@akasha/graphrag/seed";

const backend = new InMemoryBackend(new HashEmbedder());
await buildPilaresSeed(backend);
const retriever = new HybridRetriever(backend, new HashEmbedder());

const related = await retriever.findRelated("discovery:consulente com odu 7 (obar) busca firmeza em ansiedade", { topK: 5 });
console.log(related);
```

## Seed

```bash
# Idempotent. Re-run safely.
pnpm --filter @akasha/graphrag seed
```

## Production migration (WAVES 31.1+)

The SQL migration lives in
`packages/graphrag/migrations/20260626000000_wave_31_1_graphrag/migration.sql`.
**It is a PROPOSAL** — per
`apps/akasha-portal/prisma/AGENTS.md` Work Guidance §1, humans apply
it via:

```bash
pnpm --filter akasha-portal exec prisma migrate dev --name wave_31_1_graphrag
```

## API contract

`GET /api/akasha/discoveries/related/[id]` → `{ related: RelatedCandidate[] }`

See `apps/akasha-portal/src/app/api/akasha/discoveries/related/[id]/route.ts`.

## License

Internal — Wave 31.1 (Akasha OS).
