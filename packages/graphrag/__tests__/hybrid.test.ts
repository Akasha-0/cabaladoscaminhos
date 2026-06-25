/**
 * @akasha/graphrag — hybrid retrieval integration test (Wave 31.1)
 *
 * Roda InMemoryBackend (sem Postgres) + HybridRetriever para verificar:
 * 1. seed popula nodes/edges conforme corpus canônico
 * 2. `findRelated` retorna top-K ordenado por RRF
 * 3. nodes com mesmo Pilar (relacionados via `TEM_PILAR`) aparecem
 *    com `source: "both"` (vector + graph)
 * 4. RRF k=60 produz scores monotônicos decrescentes
 *
 * Honra constraint LGPD by design: nenhum dado de usuário real é
 * necessário — corpus é canônico/curado.
 */

import { describe, it, expect, beforeAll } from "vitest";

import {
  HashEmbedder,
  HybridRetriever,
  InMemoryBackend,
} from "../src/retriever";
import { buildPilaresSeed } from "../src/seed";

describe("HybridRetriever (Wave 31.1)", () => {
  let backend: InMemoryBackend;
  let embedder: HashEmbedder;
  let retriever: HybridRetriever;

  beforeAll(async () => {
    embedder = new HashEmbedder();
    backend = new InMemoryBackend(embedder);
    const report = await buildPilaresSeed(backend, embedder);
    expect(report.nodes).toBeGreaterThan(30);
    expect(report.edges).toBeGreaterThan(30);
    retriever = new HybridRetriever(backend, embedder, { topK: 5 });
  });

  it("returns top-5 related discoveries for the Odu 7 / Obara case", async () => {
    const startId = "discovery:consulente com odu 7 (obara) busca firmeza em ansiedade";
    const related = await retriever.findRelated(startId);

    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(5);

    // Pelo menos 1 Odu-relacionado (Pilar 4) deve aparecer.
    const hasOdu = related.some((c) =>
      c.node.label === "odu" || c.node.label === "discovery"
    );
    expect(hasOdu).toBe(true);

    // Scores devem ser monotônicos decrescentes.
    for (let i = 1; i < related.length; i++) {
      const prev = related[i - 1]!.rrfScore;
      const curr = related[i]!.rrfScore;
      expect(curr).toBeLessThanOrEqual(prev);
    }
  });

  it("combines vector + graph signals into RRF when both fire", async () => {
    const startId = "discovery:pilar 3 vata + odu 7 + i ching hex 29";
    const related = await retriever.findRelated(startId, { topK: 5 });

    // Pelo menos um candidate deve ter `source: "both"` (vector + graph).
    const bothHits = related.filter((c) => c.source === "both");
    expect(bothHits.length).toBeGreaterThan(0);
  });

  it("respects labels filter (only return nodes of given labels)", async () => {
    // Sefira Tiferet → só Sefiras vizinhas (Chesed/Guevurah/Yesod) + outras Sefiras via vector.
    const startId = "sefira:tiferet";
    const related = await retriever.findRelated(startId, {
      topK: 10,
      labels: ["sefira"],
    });
    expect(related.length).toBeGreaterThan(0);
    for (const c of related) {
      expect(c.node.label).toBe("sefira");
    }
  });

  it("returns [] for unknown id", async () => {
    const related = await retriever.findRelated("discovery:does-not-exist");
    expect(related).toEqual([]);
  });

  it("mode='vector' returns only vector signal", async () => {
    const startId = "discovery:sincronicidade e mandato do dia";
    const related = await retriever.findRelated(startId, {
      topK: 5,
      mode: "vector",
    });
    expect(related.length).toBeGreaterThan(0);
    for (const c of related) {
      expect(c.source).toBe("vector");
      expect(c.vectorScore).toBeDefined();
    }
  });

  it("mode='graph' returns only graph signal", async () => {
    const startId = "discovery:sincronicidade e mandato do dia";
    const related = await retriever.findRelated(startId, {
      topK: 5,
      mode: "graph",
    });
    expect(related.length).toBeGreaterThan(0);
    for (const c of related) {
      expect(c.source).toBe("graph");
      expect(c.graphDepth).toBeDefined();
    }
  });
});
