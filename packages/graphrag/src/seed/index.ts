/**
 * @akasha/graphrag/seed — Wave 31.1
 *
 * `buildPilaresSeed()` popula o grafo com o corpus canônico
 * dos 5 Pilares + medicinas ancestrais + 10 discoveries.
 *
 * Idempotente: reroda sem duplicar (usa `upsertNode` / `upsertEdge`
 * com constraints UNIQUE no schema).
 *
 * Embeddings são calculados via `HashEmbedder` (determinístico
 * placeholder). Para produção, plugar `OpenAIEmbedder`.
 */

import { HashEmbedder } from "../retriever/embedder";
import type { Embedder, GraphBackend, KgEdge, KgNode } from "../types";
import {
  CONCEITOS_SEED,
  DISCOVERIES_SEED,
  EDGES_SEED,
  HEXAGRAMAS_SEED,
  MEDICINAS_SEED,
  ODUS_15,
  PILARES,
  SEFIROT_10,
} from "./corpus";

export interface SeedReport {
  nodes: number;
  edges: number;
  byLabel: Record<string, number>;
}

/**
 * Popula o grafo com o corpus canônico.
 * Idempotente: reroda sem duplicar nodes ou edges.
 */
export async function buildPilaresSeed(
  backend: GraphBackend,
  embedder: Embedder = new HashEmbedder(),
  options: { includeEmbeddings?: boolean } = {}
): Promise<SeedReport> {
  const { includeEmbeddings = true } = options;

  const allNodesRaw: Array<Omit<KgNode, "createdAt">> = [
    ...PILARES,
    ...ODUS_15,
    ...HEXAGRAMAS_SEED,
    ...SEFIROT_10,
    ...CONCEITOS_SEED,
    ...MEDICINAS_SEED,
    ...DISCOVERIES_SEED,
  ];

  const allEdgesRaw: Array<Omit<KgEdge, "createdAt">> = [...EDGES_SEED];

  // Calcula embeddings se solicitado.
  const allNodes: KgNode[] = allNodesRaw.map((n) => ({
    ...n,
    createdAt: new Date().toISOString(),
    embedding: includeEmbeddings
      ? (embedder.computeVector?.(`${n.label}:${n.name}`) ?? [])
      : undefined,
  }));

  for (const node of allNodes) {
    await backend.upsertNode(node);
  }

  for (const edge of allEdgesRaw) {
    await backend.upsertEdge({
      ...edge,
      createdAt: new Date().toISOString(),
    });
  }

  const byLabel: Record<string, number> = {};
  for (const n of allNodes) {
    byLabel[n.label] = (byLabel[n.label] ?? 0) + 1;
  }

  return {
    nodes: allNodes.length,
    edges: allEdgesRaw.length,
    byLabel,
  };
}

export {
  PILARES,
  ODUS_15,
  HEXAGRAMAS_SEED,
  SEFIROT_10,
  CONCEITOS_SEED,
  MEDICINAS_SEED,
  DISCOVERIES_SEED,
  EDGES_SEED,
} from "./corpus";
