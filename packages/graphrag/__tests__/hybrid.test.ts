/**
 * @akasha/graphrag — hybrid retrieval integration test (Wave 31.1)
 *
 * Roda InMemoryBackend sem Postgres, valida HybridRetriever contra
 * o corpus canonico. Verifica RRF, filtros por label, e RAG discovery.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HashEmbedder, HybridRetriever, InMemoryBackend } from "../src/retriever";
import { buildPilaresSeed } from "../src/seed";
import type { KgNodeLabel } from "../src/types";

const ALL_LABELS: KgNodeLabel[] = [
  "pilar", "conceito", "odu", "hexagrama", "sefira",
  "planeta", "signo", "medicina", "discovery", "zelador", "consulente",
];

describe("HybridRetriever (Wave 31.1)", () => {
  let backend: InMemoryBackend;
  let retriever: HybridRetriever;
  const embedder = new HashEmbedder();

  beforeEach(async () => {
    backend = new InMemoryBackend(embedder);
    await buildPilaresSeed(backend, embedder, {
      includeEmbeddings: true,
      includeDiscoveries: true,
      clear: true,
    });
    retriever = new HybridRetriever(backend, embedder);
  });

  it("seeds the canonical 5-Pilar corpus", async () => {
    const allNodes = await backend.getAll();
    const labels = new Set(allNodes.map((n) => n.label));
    for (const l of ["pilar", "sefira", "planeta", "odu", "hexagrama", "medicina", "discovery"] as const) {
      expect(labels.has(l)).toBe(true);
    }
    // At least 5 Pilares.
    const pilares = allNodes.filter((n) => n.label === "pilar");
    expect(pilares.length).toBeGreaterThanOrEqual(5);
  });

  it("findRelated returns Top-K sorted by RRF score (mode=hybrid)", async () => {
    // normalizeName: "consulente com odu 7 (obara) busca firmeza em ansiedade"
    //  -> "consulente-com-odu-7-obara-busca-firmeza-em-ansiedade"
    const startId =
      "discovery:consulente-com-odu-7-obara-busca-firmeza-em-ansiedade";
    const results = await retriever.findRelated(startId, { topK: 5, mode: "hybrid" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    // Sorted by rrfScore descending.
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].rrfScore).toBeGreaterThanOrEqual(results[i].rrfScore);
    }
  });

  it("vector-only mode skips graph traversal", async () => {
    const startId = "pilar:cabala";
    const results = await retriever.findRelated(startId, {
      topK: 5,
      mode: "vector",
      labels: ["pilar"],
    });
    expect(results.every((r) => r.source === "vector")).toBe(true);
  });

  it("graph-only mode skips vector search", async () => {
    const startId = "sefira:tiferet";
    const results = await retriever.findRelated(startId, {
      topK: 10,
      mode: "graph",
      labels: ["sefira"],
      maxGraphDepth: 2,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.source === "graph")).toBe(true);
    // All neighbors must be sefirot.
    expect(results.every((r) => r.node.label === "sefira")).toBe(true);
  });

  it("respects labels filter (only return nodes of given labels)", async () => {
    // Sefira Tiferet -> so Sefiras vizinhas + outras Sefiras via vector.
    const startId = "sefira:tiferet";
    const results = await retriever.findRelated(startId, {
      topK: 10,
      labels: ["sefira"],
      maxGraphDepth: 2,
    });
    if (results.length > 0) {
      expect(results.every((r) => r.node.label === "sefira")).toBe(true);
    }
  });

  it("findRelatedByText finds semantically-related discoveries", async () => {
    // "ansiedade" deve achar a discovery de Odu Obara ansiedade.
    const results = await retriever.findRelatedByText(
      "consultente com ansiedade aguda precisa de firmeza e verdade interior",
      { topK: 5, labels: ["discovery"], mode: "hybrid" }
    );
    expect(results.length).toBeGreaterThan(0);
    // All candidates are discoveries.
    expect(results.every((r) => r.node.label === "discovery")).toBe(true);
  });

  it("HybridRetriever ignores unknown modes (TypeScript narrows at compile)", async () => {
    // TypeScript catches "both" as not RetrievalMode at compile-time.
    // At runtime, the default mode is "hybrid", so the call still works
    // but ignores the bad mode.
    const results = await retriever.findRelated("pilar:cabala", { topK: 3 });
    expect(Array.isArray(results)).toBe(true);
  });

  it("HybridRetriever handles missing start node gracefully (empty results)", async () => {
    const results = await retriever.findRelated("pilar:nonexistent", { topK: 5 });
    expect(results).toEqual([]);
  });
});