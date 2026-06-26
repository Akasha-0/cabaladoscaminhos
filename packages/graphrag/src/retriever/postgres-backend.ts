/**
 * @akasha/graphrag/retriever/postgres-backend — Wave 31.1
 *
 * Implementação `PgGraphBackend` — Postgres + pgvector + recursive CTE.
 *
 * Realiza:
 * - `vectorSearch`: cosine via operador `<=>` (cosine distance).
 * - `graphTraverse`: BFS N-hop via recursive CTE.
 * - `upsertNode`: INSERT ... ON CONFLICT DO UPDATE.
 * - `upsertEdge`: INSERT ... ON CONFLICT DO NOTHING.
 *
 * Conector: `pg` (Pool), queries parametrizadas.
 *
 * LGPD: nenhuma query inclui user_id, birth_date, email, etc.
 */

import { Pool, type PoolClient, type PoolConfig } from "pg";

import type {
  Embedder,
  GraphBackend,
  GraphSignal,
  KgNode,
  KgEdge,
  KgNodeLabel,
  UpsertEdgeOptions,
  UpsertNodeOptions,
  VectorSignal,
} from "../types";
import { GraphRagError, nodeId, normalizeName } from "../types";

const NODES_TABLE_DEFAULT = "kg_nodes";
const EDGES_TABLE_DEFAULT = "kg_edges";

/** Cosine similarity from cosine distance (1 - distance). */
export function cosineSimilarity(distance: number): number {
  // pgvector operator `<=>` returns cosine distance = 1 - cosine_similarity
  // (since pgvector 0.7+). Clamp to [0, 1].
  const s = 1 - distance;
  if (s < 0) return 0;
  if (s > 1) return 1;
  return s;
}

export class PgGraphBackend implements GraphBackend {
  private readonly pool: Pool;
  private readonly nodesTable: string;
  private readonly edgesTable: string;

  constructor(
    pool: Pool,
    opts: { nodesTable?: string; edgesTable?: string } = {}
  ) {
    this.pool = pool;
    this.nodesTable = opts.nodesTable ?? NODES_TABLE_DEFAULT;
    this.edgesTable = opts.edgesTable ?? EDGES_TABLE_DEFAULT;
  }

  /** Constructor estático a partir de DATABASE_URL. Async porque conecta. */
  static async connect(
    opts: {
      connectionString?: string;
      nodesTable?: string;
      edgesTable?: string;
    } = {}
  ): Promise<PgGraphBackend> {
    const url =
      opts.connectionString ??
      process.env["DATABASE_URL"] ??
      process.env["DIRECT_URL"];
    if (!url) {
      throw new GraphRagError(
        "BACKEND_INIT_FAILED",
        "DATABASE_URL (or DIRECT_URL or opts.connectionString) must be set"
      );
    }
    const pool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 30_000 });
    // Sanity ping.
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
    } finally {
      client.release();
    }
    return new PgGraphBackend(pool, opts);
  }

  /** Constrói a partir de DATABASE_URL env var (sync). */
  static fromEnv(
    _embedder: Embedder,
    opts: { nodesTable?: string; edgesTable?: string } = {}
  ): PgGraphBackend {
    const url =
      process.env["DATABASE_URL"] ?? process.env["DIRECT_URL"];
    if (!url) {
      throw new GraphRagError(
        "BACKEND_INIT_FAILED",
        "DATABASE_URL (or DIRECT_URL) must be set"
      );
    }
    return new PgGraphBackend(
      new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 30_000 }),
      opts
    );
  }

  /** Construtor alternativo para testes (injeta pool mockável). */
  static fromPool(pool: Pool, opts?: { nodesTable?: string; edgesTable?: string }): PgGraphBackend {
    return new PgGraphBackend(pool, opts);
  }

  private async safeQuery<T extends Record<string, unknown>>(
    sql: string,
    params: unknown[]
  ): Promise<T[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      const res = await client.query(sql, params);
      return res.rows as T[];
    } finally {
      client.release();
    }
  }

  async upsertNode(opts: UpsertNodeOptions): Promise<KgNode> {
    const id = nodeId(opts.label, opts.name);
    const nameNorm = normalizeName(opts.name);
    const embedding = opts.embedding ?? null;
    const description = opts.description ?? "";
    const metadata = opts.metadata ?? {};
    const embeddingLiteral = embedding
      ? `[${embedding.join(",")}]`
      : null;

    const sql = `
      INSERT INTO ${this.nodesTable}
        (id, label, name, name_normalized, description, embedding, metadata)
      VALUES ($1, $2, $3, $4, $5, $6::vector, $7::jsonb)
      ON CONFLICT (label, name_normalized) DO UPDATE SET
        description = EXCLUDED.description,
        embedding = COALESCE(EXCLUDED.embedding, ${this.nodesTable}.embedding),
        metadata = ${this.nodesTable}.metadata || EXCLUDED.metadata
      RETURNING id, label, name, name_normalized, description,
                embedding::text AS embedding_text, metadata, created_at
    `;
    const rows = await this.safeQuery<{
      id: string;
      label: KgNodeLabel;
      name: string;
      name_normalized: string;
      description: string;
      embedding_text: string | null;
      metadata: Record<string, unknown>;
      created_at: Date;
    }>(sql, [id, opts.label, opts.name, nameNorm, description, embeddingLiteral, JSON.stringify(metadata)]);

    const row = rows[0];
    if (!row) {
      throw new GraphRagError("BACKEND_INIT_FAILED", "upsertNode returned no row");
    }
    return rowToNode(row);
  }

  async upsertEdge(opts: UpsertEdgeOptions): Promise<KgEdge> {
    const weight = opts.weight ?? 1.0;
    const metadata = opts.metadata ?? {};
    const sql = `
      INSERT INTO ${this.edgesTable}
        (source_id, target_id, relation, weight, metadata)
      VALUES ($1, $2, $3, $4, $5::jsonb)
      ON CONFLICT (source_id, target_id, relation) DO UPDATE SET
        weight = EXCLUDED.weight,
        metadata = ${this.edgesTable}.metadata || EXCLUDED.metadata
      RETURNING id, source_id, target_id, relation, weight, metadata, created_at
    `;
    const rows = await this.safeQuery<{
      id: number;
      source_id: string;
      target_id: string;
      relation: string;
      weight: number;
      metadata: Record<string, unknown>;
      created_at: Date;
    }>(sql, [opts.sourceId, opts.targetId, opts.relation, weight, JSON.stringify(metadata)]);

    const row = rows[0];
    if (!row) {
      throw new GraphRagError("BACKEND_INIT_FAILED", "upsertEdge returned no row");
    }
    return {
      id: row.id,
      sourceId: row.source_id,
      targetId: row.target_id,
      relation: row.relation as KgEdge["relation"],
      weight: row.weight,
      metadata: row.metadata,
      createdAt: row.created_at.toISOString(),
    };
  }

  async getNode(id: string): Promise<KgNode | null> {
    const rows = await this.safeQuery<{
      id: string;
      label: KgNodeLabel;
      name: string;
      name_normalized: string;
      description: string;
      embedding_text: string | null;
      metadata: Record<string, unknown>;
      created_at: Date;
    }>(
      `SELECT id, label, name, name_normalized, description,
              embedding::text AS embedding_text, metadata, created_at
         FROM ${this.nodesTable} WHERE id = $1`,
      [id]
    );
    const row = rows[0];
    return row ? rowToNode(row) : null;
  }

  async vectorSearch(
    queryVector: number[],
    opts: { limit: number; labels?: ReadonlyArray<KgNodeLabel> }
  ): Promise<VectorSignal[]> {
    const labels = opts.labels ?? [];
    const vecLit = `[${queryVector.join(",")}]`;
    const sql = labels.length > 0
      ? `
        SELECT id, label, name, name_normalized, description,
               embedding::text AS embedding_text, metadata, created_at,
               embedding <=> $1::vector AS distance
          FROM ${this.nodesTable}
         WHERE label = ANY($2::text[])
           AND embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector ASC
         LIMIT $3
      `
      : `
        SELECT id, label, name, name_normalized, description,
               embedding::text AS embedding_text, metadata, created_at,
               embedding <=> $1::vector AS distance
          FROM ${this.nodesTable}
         WHERE embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector ASC
         LIMIT $2
      `;
    const params = labels.length > 0
      ? [vecLit, labels as string[], opts.limit]
      : [vecLit, opts.limit];
    const rows = await this.safeQuery<{
      id: string;
      label: KgNodeLabel;
      name: string;
      name_normalized: string;
      description: string;
      embedding_text: string | null;
      metadata: Record<string, unknown>;
      created_at: Date;
      distance: number;
    }>(sql, params);

    return rows.map((row, i) => ({
      node: rowToNode(row),
      similarity: cosineSimilarity(row.distance),
      rank: i + 1,
    }));
  }

  async graphTraverse(
    startId: string,
    opts: { maxDepth: number; labels?: ReadonlyArray<KgNodeLabel>; limit: number }
  ): Promise<GraphSignal[]> {
    const maxDepth = Math.max(1, Math.min(4, opts.maxDepth));
    const labels = opts.labels ?? [];
    const sql = labels.length > 0
      ? `
        WITH RECURSIVE walk(source_id, target_id, relation, depth, path) AS (
          SELECT source_id, target_id, relation, 1, ARRAY[relation]
            FROM ${this.edgesTable}
           WHERE source_id = $1
          UNION ALL
          SELECT e.source_id, e.target_id, e.relation, w.depth + 1,
                 w.path || e.relation
            FROM ${this.edgesTable} e
            JOIN walk w ON e.source_id = w.target_id
           WHERE w.depth < $2
        )
        SELECT n.id, n.label, n.name, n.name_normalized, n.description,
               n.embedding::text AS embedding_text, n.metadata, n.created_at,
               MIN(w.depth) AS depth,
               (ARRAY_AGG(w.relation ORDER BY w.depth))[1:MIN(w.depth)] AS relation_path
          FROM walk w
          JOIN ${this.nodesTable} n ON n.id = w.target_id
         WHERE n.label = ANY($3::text[])
         GROUP BY n.id, n.label, n.name, n.name_normalized, n.description,
                  n.embedding, n.metadata, n.created_at
         ORDER BY depth ASC, n.id ASC
         LIMIT $4
      `
      : `
        WITH RECURSIVE walk(source_id, target_id, relation, depth, path) AS (
          SELECT source_id, target_id, relation, 1, ARRAY[relation]
            FROM ${this.edgesTable}
           WHERE source_id = $1
          UNION ALL
          SELECT e.source_id, e.target_id, e.relation, w.depth + 1,
                 w.path || e.relation
            FROM ${this.edgesTable} e
            JOIN walk w ON e.source_id = w.target_id
           WHERE w.depth < $2
        )
        SELECT n.id, n.label, n.name, n.name_normalized, n.description,
               n.embedding::text AS embedding_text, n.metadata, n.created_at,
               MIN(w.depth) AS depth,
               (ARRAY_AGG(w.relation ORDER BY w.depth))[1:MIN(w.depth)] AS relation_path
          FROM walk w
          JOIN ${this.nodesTable} n ON n.id = w.target_id
         GROUP BY n.id, n.label, n.name, n.name_normalized, n.description,
                  n.embedding, n.metadata, n.created_at
         ORDER BY depth ASC, n.id ASC
         LIMIT $3
      `;
    const params = labels.length > 0
      ? [startId, maxDepth, labels as string[], opts.limit]
      : [startId, maxDepth, opts.limit];
    const rows = await this.safeQuery<{
      id: string;
      label: KgNodeLabel;
      name: string;
      name_normalized: string;
      description: string;
      embedding_text: string | null;
      metadata: Record<string, unknown>;
      created_at: Date;
      depth: number;
      relation_path: string[];
    }>(sql, params);

    return rows.map((row, i) => ({
      node: rowToNode(row),
      depth: row.depth,
      relationPath: row.relation_path as KgEdge["relation"][],
      rank: i + 1,
    }));
  }

  async truncate(): Promise<void> {
    await this.safeQuery(
      `TRUNCATE ${this.edgesTable}, ${this.nodesTable} RESTART IDENTITY CASCADE`,
      []
    );
  }

  async close(): Promise<void> {
    await this.pool.end().catch(() => undefined);
  }
}

function rowToNode(row: {
  id: string;
  label: KgNodeLabel;
  name: string;
  name_normalized: string;
  description: string;
  embedding_text: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}): KgNode {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    nameNormalized: row.name_normalized,
    description: row.description,
    embedding: row.embedding_text
      ? row.embedding_text
          .slice(1, -1)
          .split(",")
          .map((s) => Number.parseFloat(s))
          .filter((n) => !Number.isNaN(n))
      : null,
    metadata: row.metadata,
    createdAt: row.created_at.toISOString(),
  };
}

/* ============================================================================
 * InMemoryBackend — usado em testes. Mesma interface que PgGraphBackend.
 * ========================================================================== */

export class InMemoryBackend implements GraphBackend {
  private readonly nodes = new Map<string, KgNode>();
  private readonly edges = new Map<string, KgEdge>();
  private edgeSeq = 1;

  constructor(private readonly embedder?: Embedder) {}

  /** Lista todos os nodes (helper de teste). */
  async getAll(): Promise<KgNode[]> {
    return Array.from(this.nodes.values());
  }

  /** Conta nodes por label (helper de teste). */
  async countByLabel(): Promise<Record<string, number>> {
    const out: Record<string, number> = {};
    for (const n of this.nodes.values()) {
      out[n.label] = (out[n.label] ?? 0) + 1;
    }
    return out;
  }

  /** Hash embedder default para testes. */
  private getEmbedder(): Embedder {
    if (this.embedder) return this.embedder;
    throw new Error(
      "InMemoryBackend precisa de embedder para auto-embed. " +
        "Passe um embedder no constructor ou chame upsertNode com embedding."
    );
  }

  async upsertNode(opts: UpsertNodeOptions): Promise<KgNode> {
    const id = nodeId(opts.label, opts.name);
    const nameNorm = normalizeName(opts.name);
    const embedding =
      opts.embedding ??
      (this.embedder ? this.embedder.computeVector(`${opts.label}:${opts.name}`) : null);
    const node: KgNode = {
      id,
      label: opts.label,
      name: opts.name,
      nameNormalized: nameNorm,
      description: opts.description ?? "",
      embedding,
      metadata: opts.metadata ?? {},
      createdAt: new Date().toISOString(),
    };
    this.nodes.set(id, node);
    return node;
  }

  async upsertEdge(opts: UpsertEdgeOptions): Promise<KgEdge> {
    const key = `${opts.sourceId}|${opts.targetId}|${opts.relation}`;
    const existing = this.edges.get(key);
    if (existing) {
      const updated: KgEdge = {
        ...existing,
        weight: opts.weight ?? existing.weight,
        metadata: { ...existing.metadata, ...(opts.metadata ?? {}) },
      };
      this.edges.set(key, updated);
      return updated;
    }
    const edge: KgEdge = {
      id: this.edgeSeq++,
      sourceId: opts.sourceId,
      targetId: opts.targetId,
      relation: opts.relation,
      weight: opts.weight ?? 1.0,
      metadata: opts.metadata ?? {},
      createdAt: new Date().toISOString(),
    };
    this.edges.set(key, edge);
    return edge;
  }

  async getNode(id: string): Promise<KgNode | null> {
    return this.nodes.get(id) ?? null;
  }

  async vectorSearch(
    queryVector: number[],
    opts: { limit: number; labels?: ReadonlyArray<KgNodeLabel> }
  ): Promise<VectorSignal[]> {
    const labels = opts.labels;
    const candidates: Array<{ node: KgNode; sim: number }> = [];
    for (const node of this.nodes.values()) {
      if (labels && !labels.includes(node.label)) continue;
      if (!node.embedding) continue;
      const sim = cosine(this.embeddingOrZero(node), queryVector);
      candidates.push({ node, sim });
    }
    candidates.sort((a, b) => b.sim - a.sim);
    return candidates.slice(0, opts.limit).map((c, i) => ({
      node: c.node,
      similarity: c.sim,
      rank: i + 1,
    }));
  }

  async graphTraverse(
    startId: string,
    opts: { maxDepth: number; labels?: ReadonlyArray<KgNodeLabel>; limit: number }
  ): Promise<GraphSignal[]> {
    const maxDepth = Math.max(1, Math.min(4, opts.maxDepth));
    const labels = opts.labels;
    const visited = new Map<string, GraphSignal>();
    const queue: Array<{ id: string; depth: number; path: string[] }> = [
      { id: startId, depth: 1, path: [] },
    ];

    while (queue.length > 0 && visited.size < opts.limit) {
      const { id, depth, path } = queue.shift()!;
      if (visited.has(id)) continue;
      const node = this.nodes.get(id);
      if (!node) continue;
      if (depth > maxDepth) continue;

      if (id !== startId) {
        if (labels && !labels.includes(node.label)) continue;
        visited.set(id, {
          node,
          depth: depth - 1, // depth=0 = self (excluded from output)
          relationPath: path as KgEdge["relation"][],
          rank: visited.size + 1,
        });
      }

      if (depth < maxDepth) {
        for (const edge of this.edges.values()) {
          if (edge.sourceId === id) {
            queue.push({
              id: edge.targetId,
              depth: depth + 1,
              path: [...path, edge.relation],
            });
          }
        }
      }
    }

    return Array.from(visited.values()).sort((a, b) => a.rank - b.rank);
  }

  async truncate(): Promise<void> {
    this.nodes.clear();
    this.edges.clear();
    this.edgeSeq = 1;
  }

  async close(): Promise<void> {
    /* no-op */
  }

  /** Tamanhos para inspeção/teste. */
  get size(): { nodes: number; edges: number } {
    return { nodes: this.nodes.size, edges: this.edges.size };
  }

  private embeddingOrZero(node: KgNode): number[] {
    if (node.embedding) return node.embedding;
    const dim = this.embedder?.dim ?? 768;
    return new Array<number>(dim).fill(0);
  }
}

function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom > 0 ? dot / denom : 0;
}
