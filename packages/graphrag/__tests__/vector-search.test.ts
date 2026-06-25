/**
 * @akasha/graphrag — vector search integration test (Wave 31.1)
 *
 * Verifica que `findRelatedByText` retorna nodes semanticamente
 * proximos via cosine do HashEmbedder.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HashEmbedder, HybridRetriever, InMemoryBackend } from "../src/retriever";
import { buildPilaresSeed } from "../src/seed";

describe("Vector search (Wave 31.1)", () => {
  let backend: InMemoryBackend;
  let retriever: HybridRetriever;

  beforeEach(async () => {
    backend = new InMemoryBackend(new HashEmbedder());
    await buildPilaresSeed(backend, new HashEmbedder(), { clear: true });
    retriever = new HybridRetriever(backend, new HashEmbedder());
  });

  it("returns cosine-similar discoveries for text queries", async () => {
    const results = await retriever.findRelatedByText(
      "cabala sefirot",
      { topK: 5, mode: "vector" }
    );
    expect(results.length).toBeGreaterThan(0);
    // At least one Cabala/Sefira should appear.
    const labels = results.map((r) => r.node.label);
    expect(labels.some((l) => l === "pilar" || l === "sefira")).toBe(true);
  });

  it("returns empty when labels filter excludes all corpus", async () => {
    const results = await retriever.findRelatedByText("cabala", {
      topK: 5,
      labels: ["zelador"],
      mode: "vector",
    });
    expect(results).toEqual([]);
  });
});