/**
 * @akasha/graphrag — public types (Wave 31.1)
 *
 * Contratos públicos do GraphRAG MVP. Mantidos em arquivo isolado
 * para que consumers possam importar sem triggar carregamento de
 * driver `pg` (imports circulares em retriever/index.ts).
 */

/** Tipos canônicos de node no grafo. */
export const KG_NODE_LABELS = [
  "pilar",
  "conceito",
  "odu",
  "hexagrama",
  "sefira",
  "planeta",
  "signo",
  "medicina",
  "discovery",
  "zelador",
  "consulente",
] as const;

export type KgNodeLabel = (typeof KG_NODE_LABELS)[number];

/** Tipos canônicos de relação entre nodes. */
export const KG_RELATIONS = [
  "TEM_PILAR",
  "RELACIONA_COM",
  "DERIVA_DE",
  "EXPLICA",
  "PARA",
  "OPOE_A",
  "COMPLEMENTA",
  "TEM_HEXAGRAMA",
  "GOBERNADO_POR",
  "TEM_ODU",
  "MEDICINA_RELACIONADA",
] as const;

export type KgRelation = (typeof KG_RELATIONS)[number];

/** Node do grafo (id = `${label}:${normalized(name)}`). */
export interface KgNode {
  readonly id: string;
  readonly label: KgNodeLabel;
  readonly name: string;
  readonly nameNormalized: string;
  readonly description: string;
  readonly embedding: number[] | null;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string; // ISO 8601
}

/** Edge do grafo. */
export interface KgEdge {
  readonly id: number | null;     // null em backends sem PK explícita (ex: in-memory)
  readonly sourceId: string;
  readonly targetId: string;
  readonly relation: KgRelation;
  readonly weight: number;        // 0..1
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

/** Sinal puro de similaridade por cosine. */
export interface VectorSignal {
  readonly node: KgNode;
  readonly similarity: number;    // 0..1
  readonly rank: number;          // 1-based position no ranking
}

/** Sinal puro de traversal por grafo (BFS a partir de startId). */
export interface GraphSignal {
  readonly node: KgNode;
  readonly depth: number;         // 0 = self, 1 = direct neighbor, ...
  readonly relationPath: ReadonlyArray<KgRelation>;
  readonly rank: number;
}

/** Item retornado por HybridRetriever.findRelated(). */
export interface RelatedCandidate {
  readonly node: KgNode;
  rrfScore: number;
  vectorScore: number | null;
  graphDepth: number | null;
  source: RetrievalMode | "hybrid";
}

/** Configuração do retriever híbrido. */

/** Configuração do retriever híbrido. */
export interface GraphRagConfig {
  readonly topK: number;          // 1..50
  readonly mode: RetrievalMode;
  readonly maxGraphDepth: number; // 1..4 (ADR-0005 trigger se >4)
  readonly labels?: ReadonlyArray<KgNodeLabel>;
  readonly vectorFetchLimit: number;
  readonly graphFetchLimit: number;
  readonly rrfConstant: number;   // padrão 60 (Cormack 2009)
}

export type RetrievalMode = "hybrid" | "vector" | "graph";

export const DEFAULT_GRAPH_RAG_CONFIG: GraphRagConfig = {
  topK: 5,
  mode: "hybrid",
  maxGraphDepth: 2,
  vectorFetchLimit: 50,
  graphFetchLimit: 50,
  rrfConstant: 60,
};

/** Opções de inserção. */
export interface UpsertNodeOptions {
  readonly label: KgNodeLabel;
  readonly name: string;
  readonly description?: string;
  readonly embedding?: number[] | null;
  readonly metadata?: Record<string, unknown>;
}

export interface UpsertEdgeOptions {
  readonly sourceId: string;
  readonly targetId: string;
  readonly relation: KgRelation;
  readonly weight?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Interface do embedder. MVP tem `HashEmbedder` (determinístico).
 * Wave 31.2+ terá `OpenAIEmbedder` (text-embedding-3-small, 1536d).
 */
export interface Embedder {
  readonly dim: number;
  embed(text: string): Promise<number[]>;
  /** Sync fast-path para seed/test contexts. Default = hash.embed sync. */
  computeVector(text: string): number[];
}

/**
 * Interface `GraphBackend` — implementações: `PgGraphBackend` (pgvector),
 * `InMemoryBackend` (testes). FalkorDB/Neo4j viriam como novos
 * implementadores no futuro (sem refactor nos consumers).
 */
export interface GraphBackend {
  upsertNode(opts: UpsertNodeOptions): Promise<KgNode>;
  upsertEdge(opts: UpsertEdgeOptions): Promise<KgEdge>;
  getNode(id: string): Promise<KgNode | null>;
  vectorSearch(
    queryVector: number[],
    opts: { limit: number; labels?: ReadonlyArray<KgNodeLabel> }
  ): Promise<VectorSignal[]>;
  graphTraverse(
    startId: string,
    opts: { maxDepth: number; labels?: ReadonlyArray<KgNodeLabel>; limit: number }
  ): Promise<GraphSignal[]>;
  truncate(): Promise<void>;
  close(): Promise<void>;
}

/** Erros do módulo (para classificação no API gateway). */
export type GraphRagErrorKind =
  | "BACKEND_INIT_FAILED"
  | "NODE_NOT_FOUND"
  | "RETRIEVAL_FAILED"
  | "INVALID_INPUT";

export class GraphRagError extends Error {
  constructor(
    public readonly kind: GraphRagErrorKind,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "GraphRagError";
  }
}

/** Normaliza nome para usar como `name_normalized` (chave única). */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Constrói ID canônico: `label:normalized`. */
export function nodeId(label: KgNodeLabel, name: string): string {
  return `${label}:${normalizeName(name)}`;
}
