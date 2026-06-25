/**
 * @akasha/graphrag/retriever/postgres-backend — Wave 31.1
 *
 * Implementação `PgGraphBackend` — Postgres + pgvector + recursive CTE.
 *
 * Realiza:
 * - `vectorSearch`: cosine via operador `<=>` do pgvector
 * - `graphTraverse`: BFS N-hops via `WITH RECURSIVE`
 *
 * Requer:
 * - Conexão `pg` (DATABASE_URL)
 * - Migration `20260626000000_wave_31_1_graphrag` aplicada
 *   (schema `kg_nodes` + `kg_edges`)
 *
 * Graceful degradation: se conexão falha ou tabela ausente, retorna
 * arrays vazios com warning (não quebra consumers).
 */

import { Pool, type PoolClient, type PoolConfig } from "pg";

import type {
  Embedder,
  GraphBackend,
  KgEdge,
  KgNode,
  KgNodeLabel,
  KgRelation,
} from "../types";

/**
 * Parse pgvector string ("[1.2,3.4,...]") → number[].
 * pgvector retorna vetor em formato textual.
 */
function parsePgVector(raw: unknown): number[] {
  if (Array.isArray(raw)) return raw as number[];
  if (typeof raw !== "string") return [];
  const trimmed = raw.trim().replace(/^\[/, "").replace(/\]$/, "");
  if (!trimmed) return [];
  return trimmed.split(",").map((s) => Number.parseFloat(s.trim())).filter((n) => Number.isFinite(n));
}

interface PgGraphBackendOptions {
  pool: Pool;
  embedder: Embedder;
  /** Tabelas reais do schema. Default `kg_nodes` + `kg_edges`. */
  nodesTable?: string;
  edgesTable?: string;
}

export class PgGraphBackend implements GraphBackend {
  private readonly pool: Pool;
  private readonly embedder: Embedder;
  private readonly nodesTable: string;
  private readonly edgesTable: string;
  private warnedMissing = false;

  constructor(opts: PgGraphBackendOptions) {
    this.pool = opts.pool;
    this.embedder = opts.embedder;
    this.nodesTable = opts.nodesTable ?? "kg_nodes";
    this.edgesTable = opts.edgesTable ?? "kg_edges";
  }

  /**
   * Helper: cria Pool a partir de DATABASE_URL.
   */
  static fromEnv(embedder: Embedder, overrides: Partial<PoolConfig> = {}): PgGraphBackend {
    const url = process.env["DATABASE_URL"] ?? process.env["DIRECT_URL"];
    if (!url) {
      throw new Error("PgGraphBackend.fromEnv: DATABASE_URL (or DIRECT_URL) is required");
    }
    const pool = new Pool({ connectionString: url, ...overrides });
    return new PgGraphBackend({ pool, embedder });
  }

  async upsertNode(node: KgNode): Promise<void> {
    const sql = `
      INSERT INTO ${this.nodesTable}
        (id, label, name, name_normalized, description, metadata, embedding, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7::vector, NOW(), NOW())
      ON CONFLICT (label, name_normalized) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        metadata = EXCLUDED.metadata,
        embedding = EXCLUDED.embedding,
        updated_at = NOW()
    `;
    const embeddingLiteral = node.embedding
      ? `[${node.embedding.join(",")}]`
      : null;
    await this.safeQuery(sql, [
      node.id,
      node.label,
      node.name,
      node.nameNormalized,
      node.description ?? null,
      JSON.stringify(node.metadata),
      embeddingLiteral,
    ]);
  }

  async upsertEdge(edge: KgEdge): Promise<void> {
    const sql = `
      INSERT INTO ${this.edgesTable}
        (id, source_id, target_id, relation, weight, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (source_id, target_id, relation) DO UPDATE SET
        weight = EXCLUDED.weight,
        metadata = EXCLUDED.metadata
    `;
    await this.safeQuery(sql, [
      edge.id,
      edge.sourceId,
      edge.targetId,
      edge.relation,
      edge.weight,
      JSON.stringify(edge.metadata),
    ]);
  }

  async vectorSearch(
    embedding: number[],
    options: { label?: KgNodeLabel[]; limit: number }
  ): Promise<Array<{ node: KgNode; similarity: number }>> {
    const literal = `[${embedding.join(",")}]`;
    const labels = options.label ?? [];
    const labelClause =
      labels.length > 0
        ? `AND label = ANY($3::text[])`
        : "";
    const params: unknown[] = [literal, options.limit];
    if (labels.length > 0) params.push(labels);

    const sql = `
      SELECT id, label, name, name_normalized, description, metadata,
             embedding::text AS embedding_text,
             1 - (embedding <=> $1::vector) AS similarity
      FROM ${this.nodesTable}
      WHERE embedding IS NOT NULL
        ${labelClause}
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `;
    const rows = await this.safeQueryRows<RawNodeRow>(sql, params);
    return rows.map((r) => ({ node: this.rowToNode(r), similarity: Number(r.similarity) }));
  }

  async graphTraverse(
    startNodeId: string,
    options: { maxDepth: number; labels?: KgNodeLabel[]; limit: number }
  ): Promise<Array<{ node: KgNode; depth: number }>> {
    const labels = options.labels ?? [];
    const labelClause =
      labels.length > 0
        ? `AND n.label = ANY($3::text[])`
        : "";
    const params: unknown[] = [startNodeId, options.limit];
    if (labels.length > 0) params.push(labels);

    const sql = `
      WITH RECURSIVE bfs(node_id, depth) AS (
        SELECT id, 0 FROM ${this.nodesTable} WHERE id = $1
        UNION ALL
        SELECT e.target_id, b.depth + 1
        FROM bfs b
        JOIN ${this.edgesTable} e ON e.source_id = b.node_id
        WHERE b.depth < $4
      )
      SELECT n.id, n.label, n.name, n.name_normalized, n.description,
             n.metadata, n.embedding::text AS embedding_text,
             MIN(b.depth) AS depth
      FROM bfs b
      JOIN ${this.nodesTable} n ON n.id = b.node_id
      WHERE n.id != $1
        ${labelClause}
      GROUP BY n.id, n.label, n.name, n.name_normalized, n.description,
               n.metadata, n.embedding
      ORDER BY depth, n.name
      LIMIT $2
    `;
    const paramsFinal: unknown[] = labels.length > 0 ? params : [startNodeId, options.limit, null, options.maxDepth];
    const rows = await this.safeQueryRows<RawNodeRow & { depth: number }>(sql, paramsFinal);
    return rows.map((r) => ({ node: this.rowToNode(r), depth: Number(r.depth) }));
  }

  async getNode(id: string): Promise<KgNode | null> {
    const sql = `
      SELECT id, label, name, name_normalized, description, metadata,
             embedding::text AS embedding_text
      FROM ${this.nodesTable}
      WHERE id = $1
      LIMIT 1
    `;
    const rows = await this.safeQueryRows<RawNodeRow>(sql, [id]);
    if (rows.length === 0) return null;
    return this.rowToNode(rows[0]!);
  }

  async truncate(): Promise<void> {
    await this.safeQuery(`TRUNCATE ${this.edgesTable}, ${this.nodesTable} RESTART IDENTITY CASCADE`, []);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // ─── Helpers internos ────────────────────────────────────────────────────

  private rowToNode(r: RawNodeRow): KgNode {
    return {
      id: r.id,
      label: r.label as KgNodeLabel,
      name: r.name,
      nameNormalized: r.name_normalized,
      description: r.description ?? undefined,
      metadata: (r.metadata as Record<string, unknown>) ?? {},
      embedding: r.embedding_text ? parsePgVector(r.embedding_text) : undefined,
      createdAt: r.created_at ?? new Date().toISOString(),
    };
  }

  private async safeQuery(sql: string, params: unknown[]): Promise<void> {
    try {
      await this.pool.query(sql, params);
    } catch (err) {
      this.warnIfMissing(err);
    }
  }

  private async safeQueryRows<T extends Record<string, unknown>>(
    sql: string,
    params: unknown[]
  ): Promise<T[]> {
    try {
      const res = await this.pool.query<T>(sql, params);
      return res.rows;
    } catch (err) {
      this.warnIfMissing(err);
      return [];
    }
  }

  private warnIfMissing(err: unknown): void {
    if (this.warnedMissing) return;
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("relation") && msg.includes("does not exist")) {
      console.warn(
        `[PgGraphBackend] kg_* tables missing — graceful degradation. ` +
          `Apply migration packages/graphrag/migrations/20260626000000_wave_31_1_graphrag/ ` +
          `and restart. Error: ${msg.split("\n")[0]}`
      );
      this.warnedMissing = true;
    } else if (!this.warnedMissing) {
      console.warn(`[PgGraphBackend] query error: ${msg.split("\n")[0]}`);
    }
  }

  /** Expõe o pool para transações multi-statement (seed). */
  getPool(): Pool {
    return this.pool;
  }

  /** Helper para seed em transação. */
  async withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  }
}

interface RawNodeRow extends Record<string, unknown> {
  id: string;
  label: string;
  name: string;
  name_normalized: string;
  description: string | null;
  metadata: Record<string, unknown> | string;
  embedding_text?: string | null;
  created_at?: string;
}

/**
 * Backend in-memory para tests + dev sem Postgres.
 * Implementa mesma interface `GraphBackend` mas guarda tudo em Map.
 */
export class InMemoryBackend implements GraphBackend {
  private readonly nodes = new Map<string, KgNode>();
  private readonly edges = new Map<string, KgEdge>();
  private readonly indexByNormalized = new Map<string, string>(); // `${label}::${normalized}` -> id

  constructor(private readonly embedder: Embedder) {}

  async upsertNode(node: KgNode): Promise<void> {
    const key = `${node.label}::${node.nameNormalized}`;
    const existingId = this.indexByNormalized.get(key);
    if (existingId && existingId !== node.id) {
      // Reaponta para id novo.
      this.nodes.delete(existingId);
    }
    this.nodes.set(node.id, node);
    this.indexByNormalized.set(key, node.id);
  }

  async upsertEdge(edge: KgEdge): Promise<void> {
    const key = `${edge.sourceId}|${edge.targetId}|${edge.relation}`;
    const existing = this.findEdgeByKey(key);
    if (existing) {
      this.edges.set(existing.id, { ...existing, ...edge, id: existing.id });
    } else {
      this.edges.set(edge.id, edge);
    }
  }

  private findEdgeByKey(key: string): KgEdge | undefined {
    for (const e of this.edges.values()) {
      if (`${e.sourceId}|${e.targetId}|${e.relation}` === key) return e;
    }
    return undefined;
  }

  async vectorSearch(
    embedding: number[],
    options: { label?: KgNodeLabel[]; limit: number }
  ): Promise<Array<{ node: KgNode; similarity: number }>> {
    const allowed = new Set(options.label ?? []);
    const scored: Array<{ node: KgNode; similarity: number }> = [];
    for (const node of this.nodes.values()) {
      if (allowed.size > 0 && !allowed.has(node.label)) continue;
      if (!node.embedding) continue;
      const sim = cosineSimilarity(embedding, node.embedding);
      scored.push({ node, similarity: sim });
    }
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, options.limit);
  }

  async graphTraverse(
    startNodeId: string,
    options: { maxDepth: number; labels?: KgNodeLabel[]; limit: number }
  ): Promise<Array<{ node: KgNode; depth: number }>> {
    const allowed = new Set(options.labels ?? []);
    const visited = new Map<string, number>(); // id -> minDepth
    visited.set(startNodeId, 0);
    const queue: Array<{ id: string; depth: number }> = [{ id: startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= options.maxDepth) continue;
      for (const edge of this.edges.values()) {
        if (edge.sourceId !== current.id) continue;
        const nextId = edge.targetId;
        const nextDepth = current.depth + 1;
        const prev = visited.get(nextId);
        if (prev === undefined || nextDepth < prev) {
          visited.set(nextId, nextDepth);
          queue.push({ id: nextId, depth: nextDepth });
        }
      }
    }

    const out: Array<{ node: KgNode; depth: number }> = [];
    for (const [id, depth] of visited) {
      if (id === startNodeId) continue;
      const node = this.nodes.get(id);
      if (!node) continue;
      if (allowed.size > 0 && !allowed.has(node.label)) continue;
      out.push({ node, depth });
    }
    out.sort((a, b) => a.depth - b.depth || a.node.name.localeCompare(b.node.name));
    return out.slice(0, options.limit);
  }

  async getNode(id: string): Promise<KgNode | null> {
    return this.nodes.get(id) ?? null;
  }

  async truncate(): Promise<void> {
    this.nodes.clear();
    this.edges.clear();
    this.indexByNormalized.clear();
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

// Suprime warning de unused para `KgRelation` quando import tree-shaken.
export type { KgRelation };
