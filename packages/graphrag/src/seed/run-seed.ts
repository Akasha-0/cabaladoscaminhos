#!/usr/bin/env tsx
/**
 * @akasha/graphrag — Seed CLI
 *
 * Roda: `pnpm --filter @akasha/graphrag seed`
 *
 * Requer:
 * - DATABASE_URL (Postgres com pgvector)
 * - Migration wave_31_1_graphrag aplicada
 */

import { HashEmbedder } from "../retriever/embedder";
import { PgGraphBackend } from "../retriever/postgres-backend";
import { buildPilaresSeed } from "./index";

async function main() {
  const embedder = new HashEmbedder();
  let backend: PgGraphBackend;
  try {
    backend = PgGraphBackend.fromEnv(embedder);
  } catch (err) {
    console.error("[seed] Failed to create backend:", err);
    process.exit(1);
  }

  console.log("[seed] Building knowledge graph (5 Pilares + medicinas + discoveries)...");
  const report = await buildPilaresSeed(backend, embedder);
  console.log("[seed] Done:", report);

  await backend.close();
}

main().catch((err) => {
  console.error("[seed] Unhandled error:", err);
  process.exit(1);
});
