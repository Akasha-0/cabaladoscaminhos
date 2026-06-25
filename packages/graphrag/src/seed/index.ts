/**
 * @akasha/graphrag/seed — Wave 31.1
 *
 * `buildPilaresSeed()` popula o grafo com o corpus canônico
 * dos 5 Pilares + medicinas ancestrais + 10 discoveries.
 *
 * Idempotente: reroda sem duplicar (faz truncate antes se clear=true).
 */

import type {
  Embedder,
  KgEdge,
  KgNode,
} from "../types";
import { nodeId } from "../types";
import type { GraphBackend } from "../types";
import { getAllEdgeSpecs, getAllNodeSpecs } from "./corpus";

export interface SeedOptions {
  includeEmbeddings: boolean;
  includeDiscoveries: boolean;
  clear: boolean;
}

export interface SeedSummary {
  nodes: number;
  edges: number;
  includeEmbeddings: boolean;
  includeDiscoveries: boolean;
}

export async function buildPilaresSeed(
  backend: GraphBackend,
  embedder: Embedder,
  options: Partial<SeedOptions> = {}
): Promise<SeedSummary> {
  const opts: SeedOptions = {
    includeEmbeddings: true,
    includeDiscoveries: true,
    clear: true,
    ...options,
  };

  if (opts.clear) {
    await backend.truncate?.();
  }

  const allNodeSpecs = getAllNodeSpecs();
  const nodeSpecs = opts.includeDiscoveries
    ? allNodeSpecs
    : allNodeSpecs.filter((n) => n.label !== "discovery");

  // 1) Nodes.
  const allNodes: KgNode[] = nodeSpecs.map((n) => ({
    id: nodeId(n.label, n.name),
    label: n.label,
    name: n.name,
    nameNormalized: n.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
    description: n.description,
    metadata: n.metadata ?? {},
    embedding: opts.includeEmbeddings
      ? embedder.computeVector(`${n.label}:${n.name}`)
      : null,
    createdAt: new Date().toISOString(),
  }));

  for (const n of allNodes) {
    await backend.upsertNode({
      label: n.label,
      name: n.name,
      description: n.description,
      embedding: n.embedding,
      metadata: { ...n.metadata },
    });
  }

  // 2) Edges (only edges whose endpoints exist).
  const nodeIdSet = new Set(allNodes.map((n) => n.id));
  const allEdgeSpecs = getAllEdgeSpecs();
  const validEdgeSpecs = allEdgeSpecs.filter((e) => {
    const sId = nodeId(e.source.label, e.source.name);
    const tId = nodeId(e.target.label, e.target.name);
    return nodeIdSet.has(sId) && nodeIdSet.has(tId);
  });

  const allEdges: KgEdge[] = validEdgeSpecs.map((e) => ({
    id: null,
    sourceId: nodeId(e.source.label, e.source.name),
    targetId: nodeId(e.target.label, e.target.name),
    relation: e.relation,
    weight: e.weight,
    metadata: e.metadata ?? {},
    createdAt: new Date().toISOString(),
  }));

  for (const e of allEdges) {
    await backend.upsertEdge({
      sourceId: e.sourceId,
      targetId: e.targetId,
      relation: e.relation,
      weight: e.weight,
      metadata: { ...e.metadata },
    });
  }

  const summary: SeedSummary = {
    nodes: allNodes.length,
    edges: allEdges.length,
    includeEmbeddings: opts.includeEmbeddings,
    includeDiscoveries: opts.includeDiscoveries,
  };
  // eslint-disable-next-line no-console
  console.log("[graphrag seed] done", summary);
  return summary;
}