/**
 * @akasha/graphrag — public entry (Wave 31.1)
 *
 * Barrel re-exports principais para consumers (UI portal, scripts).
 * Imports granulares: usar subpath exports `@akasha/graphrag/retriever`,
 * `@akasha/graphrag/seed` para reduzir superfície.
 */

export * from "./types";

export { HybridRetriever } from "./retriever/hybrid";
export {
  PgGraphBackend,
  InMemoryBackend,
  cosineSimilarity,
} from "./retriever/postgres-backend";
export { HashEmbedder, OpenAIEmbedder } from "./retriever/embedder";

export { buildPilaresSeed } from "./seed/index";
