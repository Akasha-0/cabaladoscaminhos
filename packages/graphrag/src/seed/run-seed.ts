#!/usr/bin/env tsx
/**
 * @akasha/graphrag — Seed CLI executable.
 *
 * Run: pnpm --filter @akasha/graphrag seed
 *
 * Requires DATABASE_URL env (Postgres with pgvector).
 * Idempotent: truncates kg_edges + kg_nodes before insert.
 */

import { HashEmbedder, PgGraphBackend } from "../retriever";
import { buildPilaresSeed } from ".";

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL nao definida — abort.");
    process.exit(1);
  }
  const backend = await PgGraphBackend.connect({ connectionString: databaseUrl });
  const embedder = new HashEmbedder();
  try {
    await buildPilaresSeed(backend, embedder, {
      includeEmbeddings: true,
      includeDiscoveries: true,
      clear: true,
    });
  } finally {
    await backend.close();
  }
}

main().catch((err) => {
  console.error("[graphrag seed] falhou:", err);
  process.exit(2);
});