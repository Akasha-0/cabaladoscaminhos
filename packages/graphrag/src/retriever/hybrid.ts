/**
 * @akasha/graphrag/retriever/hybrid — Wave 31.1
 *
 * HybridRetriever: combina vector + graph via Reciprocal Rank Fusion
 * (Cormack et al. 2009), conforme LightRAG (Guo et al. 2024).
 *
 * MVP: top-K related a partir de um `startNodeId`. Retorna
 * `RelatedCandidate[]` ordenadas por RRF score.
 *
 * Implementação agnóstica de backend — opera sobre qualquer
 * `GraphBackend` (Postgres, FalkorDB, in-memory).
 */

import type {
  Embedder,
  GraphBackend,
  GraphRagConfig,
  KgNodeLabel,
  RelatedCandidate,
} from "../types";
import { DEFAULT_GRAPH_RAG_CONFIG } from "../types";

export class HybridRetriever {
  constructor(
    private readonly backend: GraphBackend,
    private readonly embedder: Embedder,
    private readonly config: Partial<GraphRagConfig> = {}
  ) {}

  /**
   * Busca os top-K nodes relacionados a `startNodeId`.
   *
   * Algoritmo:
   * 1. Vector signal: top-N nodes por cosine similarity do embedding
   *    do node inicial (skip o próprio node).
   * 2. Graph signal: BFS N-hops a partir do node inicial, excluindo
   *    ele mesmo.
   * 3. RRF fusion: score(d) = Σ 1/(k + rank_i(d)).
   * 4. Retorna top-K por RRF score.
   */
  async findRelated(
    startNodeId: string,
    options: Partial<GraphRagConfig> & { labels?: KgNodeLabel[] } = {}
  ): Promise<RelatedCandidate[]> {
    const cfg: GraphRagConfig = { ...DEFAULT_GRAPH_RAG_CONFIG, ...this.config, ...options };
    const startNode = await this.backend.getNode(startNodeId);
    if (!startNode) return [];

    const labels = options.labels;
    const fetchLimit = cfg.fetchLimit;

    const mode = cfg.mode;

    // Vector signal
    let vectorRanked: RelatedCandidate[] = [];
    if (mode === "hybrid" || mode === "vector") {
      let queryVec: number[];
      if (startNode.embedding && startNode.embedding.length > 0) {
        queryVec = startNode.embedding;
      } else {
        queryVec = await this.embedder.embed(`${startNode.label}:${startNode.name}`);
      }
      const vectorResults = await this.backend.vectorSearch(queryVec, {
        label: labels,
        limit: fetchLimit + 1, // +1 porque o próprio node vai aparecer
      });
      vectorRanked = vectorResults
        .filter((r) => r.node.id !== startNodeId)
        .slice(0, fetchLimit)
        .map((r, i) => ({
          node: r.node,
          rrfScore: 0, // calculado depois
          vectorScore: r.similarity,
          graphDepth: undefined,
          source: "vector" as const,
          _rank: i + 1,
        }));
    }

    // Graph signal
    let graphRanked: RelatedCandidate[] = [];
    if (mode === "hybrid" || mode === "graph") {
      const graphResults = await this.backend.graphTraverse(startNodeId, {
        maxDepth: cfg.maxGraphDepth,
        labels,
        limit: fetchLimit,
      });
      graphRanked = graphResults.map((r, i) => ({
        node: r.node,
        rrfScore: 0,
        vectorScore: undefined,
        graphDepth: r.depth,
        source: "graph" as const,
        _rank: i + 1,
      }));
    }

    // RRF fusion
    const byNode = new Map<string, RelatedCandidate & { _rank?: number }>();
    const addSignal = (cand: RelatedCandidate & { _rank: number }) => {
      const existing = byNode.get(cand.node.id);
      const rrfContribution = 1.0 / (cfg.rrfK + cand._rank);
      if (existing) {
        existing.rrfScore += rrfContribution;
        if (cand.vectorScore !== undefined) existing.vectorScore = cand.vectorScore;
        if (cand.graphDepth !== undefined) existing.graphDepth = cand.graphDepth;
        existing.source = "both";
      } else {
        byNode.set(cand.node.id, { ...cand, rrfScore: rrfContribution });
      }
    };
    (vectorRanked as Array<RelatedCandidate & { _rank: number }>).forEach(addSignal);
    (graphRanked as Array<RelatedCandidate & { _rank: number }>).forEach(addSignal);

    const fused: RelatedCandidate[] = Array.from(byNode.values())
      .map((c) => {
        // Strip _rank do output público.
        const { ...rest } = c as RelatedCandidate & { _rank?: number };
        return rest;
      })
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, cfg.topK);

    return fused;
  }

  /**
   * Helper: busca relacionado a partir de um texto (não-id).
   * Útil para UI tipo "discovery related to 'Odu 7 pacificação'".
   * Embed o texto e usa como vector query; não tem graph signal.
   */
  async findRelatedByText(
    query: string,
    options: Partial<GraphRagConfig> & { labels?: KgNodeLabel[] } = {}
  ): Promise<RelatedCandidate[]> {
    const cfg: GraphRagConfig = { ...DEFAULT_GRAPH_RAG_CONFIG, ...this.config, ...options };
    const vec = await this.embedder.embed(query);
    const results = await this.backend.vectorSearch(vec, {
      label: options.labels,
      limit: cfg.fetchLimit,
    });
    return results.map((r, i) => ({
      node: r.node,
      rrfScore: 1.0 / (cfg.rrfK + i + 1),
      vectorScore: r.similarity,
      source: "vector",
    }));
  }
}
