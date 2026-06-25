/**
 * @akasha/graphrag — public types (Wave 31.1)
 *
 * Contratos públicos do GraphRAG MVP. Mantidos em arquivo isolado
 * para que consumers possam importar sem triggar carregamento de
 * driver `pg` (lazy via subpath exports).
 */

/**
 * Rótulos de nodes no grafo de conhecimento. Alinhado com
 * `KgNodeLabel` no relatório Wave 30.3 §4.1.
 *
 * MVP subset: os 5 tipos mais úteis para "related discoveries"
 * MVP note: 'conceito' é cross-pilar (e.g. "vazio fértil", "axé").
 */
export type KgNodeLabel =
  | "discovery"
  | "pilar"
  | "odu"
  | "hexagrama"
  | "sefira"
  | "planeta"
  | "signo"
  | "conceito"
  | "medicina"
  | "zelador"
  | "consulente";

/**
 * Tipos de relação entre nodes. Subset do enum completo Wave 30.3
 * §4.1 (12 valores). MVP usa 7 mais relevantes.
 */
export type KgRelation =
  | "RELACIONA_COM"
  | "CITA"
  | "INFLUENCIA"
  | "CONFIRMA"
  | "EXPLICA"
  | "TEM_PILAR"
  | "DERIVA_DE";

/**
 * Node no grafo. Pode ter embedding (vector) e metadata JSONB.
 *
 * `embedding` é `number[]` em runtime (768d por padrão); persistido
 * como `vector(768)` no Postgres via pgvector.
 */
export interface KgNode {
  id: string;
  label: KgNodeLabel;
  name: string;
  /** Lowercased + accent-stripped para deduplicação. */
  nameNormalized: string;
  description?: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
  createdAt: string;
}

/**
 * Edge direcionada (source -> target) com peso e relation tipada.
 *
 * MVP: arestas são unidirecionais. Para "também X RELACIONA Y",
 * indexer cria duas edges (X→Y e Y→X) com mesmo `relation`.
 */
export interface KgEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relation: KgRelation;
  weight: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Triplet extraído via OpenIE-style (audit trail LGPD Art. 37).
 * MVP: pre-populado pelo seed; em Wave 31.2+ virá de LLM extraction.
 */
export interface KgTriplet {
  id: string;
  source: string;
  relation: string;
  target: string;
  sourceDocId?: string;
  confidence: number;
  extractedAt: string;
}

/**
 * Candidate retornado pelo retriever. Inclui score RRF final + sinais
 * intermediários (vector sim + graph hops) para explicabilidade
 * (ADR-013 universalismo: Zelador vê a chain-of-thought).
 */
export interface RelatedCandidate {
  node: KgNode;
  /** RRF score final (hybrid). Maior = mais related. */
  rrfScore: number;
  /** Cosine similarity do signal vector (0..1). */
  vectorScore?: number;
  /** Profundidade mínima no grafo a partir do seed. 0 = mesmo node. */
  graphDepth?: number;
  /** De qual sinal veio: 'vector' | 'graph' | 'both'. */
  source: "vector" | "graph" | "both";
}

/**
 * Mode de retrieval. MVP suporta os 3.
 */
export type RetrievalMode = "hybrid" | "vector" | "graph";

/**
 * Configuração do retriever.
 */
export interface GraphRagConfig {
  /** Quantos candidates finais. Default 5 (per task spec). */
  topK: number;
  /** Mode de fusão. Default 'hybrid'. */
  mode: RetrievalMode;
  /** Constante RRF k. Default 60 (Cormack et al. 2009). */
  rrfK: number;
  /** Max hops no grafo. Default 2. */
  maxGraphDepth: number;
  /** Quantos candidates buscar em cada signal antes de fundir. Default 20. */
  fetchLimit: number;
}

export const DEFAULT_GRAPH_RAG_CONFIG: GraphRagConfig = {
  topK: 5,
  mode: "hybrid",
  rrfK: 60,
  maxGraphDepth: 2,
  fetchLimit: 20,
};

/**
 * Interface do embedder. MVP tem `HashEmbedder` (determinístico).
 * Wave 31.2+ terá `OpenAIEmbedder` (text-embedding-3-small, 1536d).
 */
export interface Embedder {
  readonly dim: number;
  /** Embed a string. Retorna vetor de dimensão `dim`. */
  embed(text: string): Promise<number[]>;
  /**
   * Síncrono (opcional). Útil para seed/test onde o embedder é
   * determinístico e não precisa de I/O. Lança se não implementado.
   */
  computeVector?(text: string): number[];
}

/**
 * Interface do backend de grafo. Implementações: `PgGraphBackend`
 * (Postgres+pgvector+CTE), `FalkorBackend` (Wave 5+ condicional).
 *
 * Consumers SEMPRE dependem desta interface — não da classe concreta.
 */
export interface GraphBackend {
  /** Insere/atualiza um node (idempotente por `nameNormalized`). */
  upsertNode(node: KgNode): Promise<void>;
  /** Insere/atualiza uma edge (idempotente por (source, target, relation)). */
  upsertEdge(edge: KgEdge): Promise<void>;
  /** Busca nodes por embedding (cosine). */
  vectorSearch(
    embedding: number[],
    options: { label?: KgNodeLabel[]; limit: number }
  ): Promise<Array<{ node: KgNode; similarity: number }>>;
  /** Traversal N-hops a partir de um node inicial. */
  graphTraverse(
    startNodeId: string,
    options: { maxDepth: number; labels?: KgNodeLabel[]; limit: number }
  ): Promise<Array<{ node: KgNode; depth: number }>>;
  /** Lookup por id. Retorna `null` se não existe. */
  getNode(id: string): Promise<KgNode | null>;
  /** Limpa tudo (test only). */
  truncate(): Promise<void>;
}
