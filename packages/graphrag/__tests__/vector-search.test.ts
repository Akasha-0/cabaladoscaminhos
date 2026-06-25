/**
 * @akasha/graphrag — vector search integration test (Wave 31.1)
 *
 * Verifica que `findRelatedByText` (sem precisar de nodeId) retorna
 * nodes semanticamente próximos via cosine do HashEmbedder.
 */

import { describe, it, expect } from "vitest";

import { HashEmbedder, HybridRetriever, InMemoryBackend } from "../src/retriever";
import { buildPilaresSeed } from "../src/seed";

describe("findRelatedByText (Wave 31.1)", () => {
  it("finds Odu-related nodes for an Odu-themed query", async () => {
    const embedder = new HashEmbedder();
    const backend = new InMemoryBackend(embedder);
    await buildPilaresSeed(backend, embedder);
    const retriever = new HybridRetriever(backend, embedder);

    const results = await retriever.findRelatedByText("Odu Obar pacifica firme", {
      topK: 5,
      labels: ["odu", "discovery"],
    });

    expect(results.length).toBeGreaterThan(0);
    // cosine >= 0 → returns.
    for (const r of results) {
      expect(r.vectorScore).toBeGreaterThanOrEqual(0);
    }
  });

  it("finds Hexagrama-related nodes for an I Ching query", async () => {
    const embedder = new HashEmbedder();
    const backend = new InMemoryBackend(embedder);
    await buildPilaresSeed(backend, embedder);
    const retriever = new HybridRetriever(backend, embedder);

    const results = await retriever.findRelatedByText("Hex Kan abismo agua perigo", {
      topK: 5,
      labels: ["hexagrama", "discovery"],
    });

    expect(results.length).toBeGreaterThan(0);
  });
});
