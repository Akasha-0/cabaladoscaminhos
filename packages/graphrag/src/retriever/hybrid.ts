/**
 * @akasha/graphrag/retriever/hybrid — Wave 31.1
 *
 * HybridRetriever: combina vector + graph via Reciprocal Rank Fusion
 * (Cormack et al. 2009), conforme LightRAG (Guo et al. 2024).
 *
 * MVP: depth-first BFS graph traversal + cosine vector search.
 * Wave 31.3+: PPR (Personalized PageRank) proxy para hippoRAG-style
 * queries multi-hop.
 */

import type {
  Embedder,
  GraphBackend,
  GraphRagConfig,
  KgNodeLabel,
  RelatedCandidate,
  RetrievalMode,
} from "../types";
import { DEFAULT_GRAPH_RAG_CONFIG } from "../types";

export class HybridRetriever {
  constructor(
    private readonly backend: GraphBackend,
    private readonly embedder: Embedder,
    private readonly config: Partial<GraphRagConfig> = {}
  ) {}

  async findRelated(
    startId: string,
    options: Partial<GraphRagConfig> = {}
  ): Promise<RelatedCandidate[]> {
    const cfg: GraphRagConfig = {
      ...DEFAULT_GRAPH_RAG_CONFIG,
      ...this.config,
      ...options,
    };
    const fetchLimit = Math.max(cfg.topK * 5, 25);
    const labels = cfg.labels;

    // Verifica se start node existe (fail-fast).
    const startNode = await this.backend.getNode(startId);
    if (!startNode) return [];

    const includeVector = cfg.mode === "hybrid" || cfg.mode === "vector";
    const includeGraph = cfg.mode === "hybrid" || cfg.mode === "graph";

    // Embedding da start node (sempre temos via backend ou embedder).
    const startVec =
      startNode.embedding ?? this.embedder.computeVector(startNode.name);

    // Vetor: cosine ranking.
    const vectorResults = includeVector
      ? await this.backend.vectorSearch(startVec, {
          limit: cfg.vectorFetchLimit ?? fetchLimit,
          labels,
        })
      : [];

    // Grafo: BFS N-hop.
    const graphResults = includeGraph
      ? await this.backend.graphTraverse(startId, {
          maxDepth: cfg.maxGraphDepth,
          labels,
          limit: cfg.graphFetchLimit ?? fetchLimit,
        })
      : [];

    return fuse(startId, startNode, vectorResults, graphResults, cfg);
  }

  async findRelatedByText(
    text: string,
    options: Partial<GraphRagConfig> = {}
  ): Promise<RelatedCandidate[]> {
    const cfg = { ...DEFAULT_GRAPH_RAG_CONFIG, ...this.config, ...options };
    const labels = cfg.labels;
    const vec = this.embedder.computeVector(text);
    const includeGraph = cfg.mode === "hybrid" || cfg.mode === "graph";

    const vectorResults = await this.backend.vectorSearch(vec, {
      limit: cfg.vectorFetchLimit ?? cfg.topK * 5,
      labels,
    });

    // Se houver sinal de grafo, pegamos top-1 vector como start.
    const graphResults: Awaited<ReturnType<GraphBackend["graphTraverse"]>> = [];
    if (includeGraph && vectorResults.length > 0) {
      const topId = vectorResults[0]!.node.id;
      graphResults.push(
        ...(await this.backend.graphTraverse(topId, {
          maxDepth: cfg.maxGraphDepth,
          labels,
          limit: cfg.graphFetchLimit ?? cfg.topK * 5,
        }))
      );
    }

    // Para findRelatedByText não temos startNode — passamos um node "virtual".
    const synthetic: import("../types").KgNode = {
      id: "__text_query__",
      label: "conceito",
      name: text,
      nameNormalized: text,
      description: "",
      embedding: vec,
      metadata: {},
      createdAt: new Date().toISOString(),
    };
    return fuse("__text_query__", synthetic, vectorResults, graphResults, cfg);
  }
}

function fuse(
  startId: string,
  _startNode: import("../types").KgNode,
  vector: import("../types").VectorSignal[],
  graph: import("../types").GraphSignal[],
  cfg: GraphRagConfig
): RelatedCandidate[] {
  const byNode = new Map<
    string,
    RelatedCandidate & { _vectorRank: number | null; _graphRank: number | null }
  >();
  const k = cfg.rrfConstant;

  // Vector signal.
  for (const v of vector) {
    if (v.node.id === startId) continue;
    const existing = byNode.get(v.node.id);
    const contrib = 1 / (k + v.rank);
    if (existing) {
      // Mutate readonly fields via type assertion: intermediate working state.
      (existing as { rrfScore: number }).rrfScore += contrib;
      (existing as { vectorScore: number | null }).vectorScore = v.similarity;
    } else {
      byNode.set(v.node.id, {
        node: v.node,
        rrfScore: contrib,
        vectorScore: v.similarity,
        graphDepth: null,
        source: cfg.mode === "vector" ? "vector" : "hybrid",
        _vectorRank: v.rank,
        _graphRank: null,
      });
    }
  }

  // Graph signal.
  for (const g of graph) {
    if (g.node.id === startId) continue;
    const contrib = 1 / (k + g.rank);
    const existing = byNode.get(g.node.id);
    if (existing) {
      existing.rrfScore += contrib;
      existing._graphRank = g.rank;
      // Mutate readonly fields via type assertion: intermediate working state.
      (existing as { graphDepth: number | null }).graphDepth = g.depth;
    } else {
      byNode.set(g.node.id, {
        node: g.node,
        rrfScore: contrib,
        vectorScore: null,
        graphDepth: g.depth,
        source: cfg.mode === "graph" ? "graph" : "hybrid",
        _vectorRank: null,
        _graphRank: g.rank,
      });
    }
  }

  // Ordena por rrfScore desc, desempate por label/nameNormalized.
  const out = Array.from(byNode.values()).sort((a, b) => {
    if (b.rrfScore !== a.rrfScore) return b.rrfScore - a.rrfScore;
    if (a.node.label !== b.node.label) return a.node.label.localeCompare(b.node.label);
    return a.node.nameNormalized.localeCompare(b.node.nameNormalized);
  });

  // Limpa campos internos.
  return out.slice(0, cfg.topK).map((c) => {
    const cleaned: RelatedCandidate = {
      node: c.node,
      rrfScore: Number.parseFloat(c.rrfScore.toFixed(6)),
      vectorScore: c.vectorScore,
      graphDepth: c.graphDepth,
      source: c.source as RetrievalMode | "hybrid",
    };
    return cleaned;
  });
}
