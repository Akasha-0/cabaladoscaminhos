/**
 * @akasha/graphrag — public entry (Wave 31.1)
 *
 * Barrel re-exports principais para consumers (UI portal, scripts).
 * Imports granulares: usar subpath exports `@akasha/graphrag/retriever`,
 * `@akasha/graphrag/seed`, `@akasha/graphrag/types` para tree-shaking.
 */

export type {
  KgNode,
  KgEdge,
  KgTriplet,
  KgNodeLabel,
  KgRelation,
  RelatedCandidate,
  RetrievalMode,
  GraphRagConfig,
  Embedder,
  GraphBackend,
} from "./types";
export { DEFAULT_GRAPH_RAG_CONFIG } from "./types";

export {
  HybridRetriever,
  PgGraphBackend,
  InMemoryBackend,
  HashEmbedder,
  OpenAIEmbedder,
  cosineSimilarity,
} from "./retriever";

export { buildPilaresSeed } from "./seed";
export type { SeedReport } from "./seed";
