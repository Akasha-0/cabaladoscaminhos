// ============================================================================
// SACRED SOUND — HEALING PROTOCOL SPEC
// ============================================================================
// 50+ assertions covering: protocol catalog shape, condition lookups,
// tradition lookups, recommendation engine, custom protocol builder,
// audit helpers.
// ============================================================================

import { buildHarness } from "./harness.ts";
import {
  PROTOCOLS,
  protocolCount,
  getProtocol,
  getProtocolForCondition,
  getProtocolsForCondition,
  getProtocolsByTradition,
  recommendProtocol,
  customProtocol,
  auditProtocolCatalog,
} from "../healing-protocol.ts";
import type { FrequencyId } from "../frequencies.ts";

const USER_ID = "user-test-001" as any;

export async function runHealingProtocolSpec(h = buildHarness()): Promise<void> {
  await h.describe("Protocol — Catalog shape", async () => {
    await h.it("PROTOCOLS is frozen", () => {
      h.expect(Object.isFrozen(PROTOCOLS)).toBe(true);
    });
    await h.it("has ≥ 20 protocols", () => {
      h.expect(protocolCount()).toBeGreaterThanOrEqual(20);
      h.expect(Object.keys(PROTOCOLS).length).toBeGreaterThanOrEqual(20);
    });
    await h.it("All IDs are unique", () => {
      const ids = Object.keys(PROTOCOLS);
      h.expect(new Set(ids).size).toBe(ids.length);
    });
    await h.it("All protocols have ≥ 1 frequency + ≥ 1 mantra", () => {
      for (const p of Object.values(PROTOCOLS)) {
        h.expect(p.frequencies.length).toBeGreaterThanOrEqual(1);
        h.expect(p.mantras.length).toBeGreaterThanOrEqual(1);
      }
    });
    await h.it("All protocols have valid duration (30..7200)", () => {
      for (const p of Object.values(PROTOCOLS)) {
        h.expect(p.duration).toBeGreaterThanOrEqual(30);
        h.expect(p.duration).toBeLessThanOrEqual(7200);
        h.expect(Number.isInteger(p.duration)).toBe(true);
      }
    });
    await h.it("All protocols have non-empty citation", () => {
      for (const p of Object.values(PROTOCOLS)) {
        h.expect(p.citation.length).toBeGreaterThan(5);
      }
    });
    await h.it("All protocols reference valid tradition", () => {
      const VALID = new Set(["cigano", "orixas", "astrologia", "cabala", "numerologia", "tantra", "tarot"]);
      for (const p of Object.values(PROTOCOLS)) {
        h.expect(VALID.has(p.tradition)).toBe(true);
      }
    });
  });

  await h.describe("Protocol — Condition coverage", async () => {
    const conditions = [
      "anxiety",
      "insomnia",
      "low-energy",
      "grief",
      "concentration",
      "grounding",
      "heartbreak",
      "creativity-block",
      "fear",
      "anger",
      "self-doubt",
      "trauma",
      "isolation",
      "sadness",
      "overwhelm",
      "compassion-fatigue",
      "decision-paralysis",
      "spirituality-disconnect",
    ] as const;
    for (const c of conditions) {
      await h.it(`condition '${c}' has ≥ 1 protocol`, () => {
        h.expect(getProtocolForCondition(c)).toBeDefined();
      });
    }
    await h.it("getProtocolsForCondition(anxiety) returns 2", () => {
      const list = getProtocolsForCondition("anxiety");
      h.expect(list.length).toBe(2);
    });
    await h.it("getProtocolForCondition returns deterministic result (sorted by id)", () => {
      const a = getProtocolForCondition("insomnia");
      const b = getProtocolForCondition("insomnia");
      h.expect(a!.id).toBe(b!.id);
    });
    await h.it("getProtocolForCondition returns undefined for unknown condition", () => {
      // Cast to bypass type system to test runtime guard
      h.expect(getProtocolForCondition("unknown-condition" as any)).toBeUndefined();
    });
  });

  await h.describe("Protocol — Tradition coverage", async () => {
    const traditions = ["cigano", "tarot", "astrologia", "numerologia", "cabala", "orixas", "tantra"] as const;
    for (const t of traditions) {
      await h.it(`tradition '${t}' has ≥ 1 protocol`, () => {
        h.expect(getProtocolsByTradition(t).length).toBeGreaterThanOrEqual(1);
      });
    }
    await h.it("getProtocolsByTradition returns sorted by id", () => {
      const list = getProtocolsByTradition("tantra");
      for (let i = 1; i < list.length; i++) {
        h.expect(list[i]!.id.localeCompare(list[i - 1]!.id)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  await h.describe("Protocol — Lookup helpers", async () => {
    await h.it("getProtocol('proto-anxiety-001') returns Anxiety protocol", () => {
      const p = getProtocol("proto-anxiety-001" as any);
      h.expect(p).toBeDefined();
      h.expect(p!.condition).toBe("anxiety");
    });
    await h.it("getProtocol('nope') returns undefined", () => {
      h.expect(getProtocol("nope-999" as any)).toBeUndefined();
    });
  });

  await h.describe("Protocol — Recommendation engine", async () => {
    await h.it("empty state returns ≤ 3 protocols", () => {
      const r = recommendProtocol({});
      h.expect(r.length).toBeLessThanOrEqual(3);
    });
    await h.it("anxiety emotion → anxiety protocol on top", () => {
      const r = recommendProtocol({ currentEmotion: "anxiety" });
      h.expect(r.length).toBeGreaterThan(0);
      h.expect(r[0]!.condition).toBe("anxiety");
    });
    await h.it("insomnia emotion → insomnia protocol", () => {
      const r = recommendProtocol({ currentEmotion: "insomnia" });
      h.expect(r.length).toBeGreaterThan(0);
      h.expect(r[0]!.condition).toBe("insomnia");
    });
    await h.it("low energy + energy=2 → low-energy wins", () => {
      const r = recommendProtocol({ currentEmotion: "low-energy", energyLevel: 2 });
      h.expect(r[0]!.condition).toBe("low-energy");
    });
    await h.it("high energy (9) → grounding ranked higher", () => {
      const r = recommendProtocol({ currentEmotion: "grounding", energyLevel: 9 });
      h.expect(r[0]!.condition).toBe("grounding");
    });
    await h.it("Anahata chakra → heartbreak ranked higher", () => {
      const r = recommendProtocol({ currentEmotion: "heartbreak", dominantChakra: "Anahata" });
      h.expect(r[0]!.condition).toBe("heartbreak");
    });
    await h.it("Ajna chakra → concentration ranked higher", () => {
      const r = recommendProtocol({ currentEmotion: "concentration", dominantChakra: "Ajna" });
      h.expect(r[0]!.condition).toBe("concentration");
    });
    await h.it("Muladhara chakra → grounding ranked higher", () => {
      const r = recommendProtocol({ currentEmotion: "grounding", dominantChakra: "Muladhara" });
      h.expect(r[0]!.condition).toBe("grounding");
    });
    await h.it("intention=love + heartbreak → heartbreak", () => {
      const r = recommendProtocol({ currentEmotion: "heartbreak", intention: "love" });
      h.expect(r[0]!.condition).toBe("heartbreak");
    });
    await h.it("intention=clarity + concentration → concentration", () => {
      const r = recommendProtocol({ currentEmotion: "concentration", intention: "clarity" });
      h.expect(r[0]!.condition).toBe("concentration");
    });
    await h.it("intention=healing + trauma → trauma", () => {
      const r = recommendProtocol({ currentEmotion: "trauma", intention: "healing" });
      h.expect(r[0]!.condition).toBe("trauma");
    });
    await h.it("returns top 3 for highly-distinct state", () => {
      const r = recommendProtocol({ currentEmotion: "anxiety", intention: "healing", energyLevel: 5 });
      h.expect(r.length).toBeGreaterThan(0);
      h.expect(r.length).toBeLessThanOrEqual(3);
    });
    await h.it("tied scores broken by id (deterministic)", () => {
      const a = recommendProtocol({ currentEmotion: "anxiety" });
      const b = recommendProtocol({ currentEmotion: "anxiety" });
      h.expect(a[0]!.id).toBe(b[0]!.id);
    });
    await h.it("no matching condition returns empty array (no crash)", () => {
      const r = recommendProtocol({ currentEmotion: "unicorn-rainbow" });
      h.expect(r.length).toBe(0);
    });
  });

  await h.describe("Protocol — customProtocol builder", async () => {
    await h.it("builds a custom protocol", () => {
      const p = customProtocol({
        condition: "anxiety",
        frequencies: ["528hz", "285hz"] as unknown as readonly FrequencyId[],
        mantras: ["tan-011" as any, "cab-003" as any],
        duration: 1200,
        tradition: "tantra",
        citation: "Test protocol",
      });
      h.expect(p.id.startsWith("custom-anxiety-")).toBe(true);
      h.expect(p.frequencies.length).toBe(2);
      h.expect(p.mantras.length).toBe(2);
      h.expect(p.duration).toBe(1200);
      h.expect(p.tradition).toBe("tantra");
      h.expect(p.citation).toBe("Test protocol");
    });
    await h.it("uses default citation when omitted", () => {
      const p = customProtocol({
        condition: "anxiety",
        frequencies: ["528hz"] as unknown as readonly FrequencyId[],
        mantras: ["tan-011" as any],
        duration: 600,
        tradition: "tantra",
      });
      h.expect(p.citation).toBe("User-defined custom protocol");
    });
    await h.it("throws on empty frequencies", () => {
      let threw = false;
      try {
        customProtocol({
          condition: "anxiety",
          frequencies: [] as unknown as readonly FrequencyId[],
          mantras: ["tan-011" as any],
          duration: 600,
          tradition: "tantra",
        });
      } catch {
        threw = true;
      }
      h.expect(threw).toBe(true);
    });
    await h.it("throws on empty mantras", () => {
      let threw = false;
      try {
        customProtocol({
          condition: "anxiety",
          frequencies: ["528hz"] as unknown as readonly FrequencyId[],
          mantras: [],
          duration: 600,
          tradition: "tantra",
        });
      } catch {
        threw = true;
      }
      h.expect(threw).toBe(true);
    });
    await h.it("throws on duration < 30", () => {
      let threw = false;
      try {
        customProtocol({
          condition: "anxiety",
          frequencies: ["528hz"] as unknown as readonly FrequencyId[],
          mantras: ["tan-011" as any],
          duration: 29,
          tradition: "tantra",
        });
      } catch {
        threw = true;
      }
      h.expect(threw).toBe(true);
    });
    await h.it("throws on duration > 7200", () => {
      let threw = false;
      try {
        customProtocol({
          condition: "anxiety",
          frequencies: ["528hz"] as unknown as readonly FrequencyId[],
          mantras: ["tan-011" as any],
          duration: 7201,
          tradition: "tantra",
        });
      } catch {
        threw = true;
      }
      h.expect(threw).toBe(true);
    });
    await h.it("two custom protocols get different IDs", () => {
      const p1 = customProtocol({
        condition: "anxiety",
        frequencies: ["528hz"] as unknown as readonly FrequencyId[],
        mantras: ["tan-011" as any],
        duration: 600,
        tradition: "tantra",
      });
      const p2 = customProtocol({
        condition: "anxiety",
        frequencies: ["528hz"] as unknown as readonly FrequencyId[],
        mantras: ["tan-011" as any],
        duration: 600,
        tradition: "tantra",
      });
      h.expect(p1.id).not.toBe(p2.id);
    });
  });

  await h.describe("Protocol — Audit", async () => {
    await h.it("auditProtocolCatalog returns correct total", () => {
      const a = auditProtocolCatalog();
      h.expect(a.total).toBe(protocolCount());
    });
    await h.it("audit byCondition covers 18 conditions", () => {
      const a = auditProtocolCatalog();
      h.expect(Object.keys(a.byCondition).length).toBe(18);
      const sum = Object.values(a.byCondition).reduce((acc, v) => acc + v, 0);
      h.expect(sum).toBe(a.total);
    });
    await h.it("audit byTradition spans all 7 traditions", () => {
      const a = auditProtocolCatalog();
      h.expect(Object.keys(a.byTradition).length).toBe(7);
    });
  });
}

if (typeof process !== "undefined" && process.argv[1]?.endsWith("healing-protocol.spec.ts")) {
  const h = buildHarness();
  runHealingProtocolSpec(h).then(() => {
    const failed = h.results.filter((r) => !r.passed);
    if (failed.length) {
      console.error(`${failed.length}/${h.results.length} FAILED`);
      for (const f of failed) console.error(`  ✗ ${f.name}: ${f.error}`);
      process.exit(1);
    }
    console.log(`✓ ${h.results.length}/${h.results.length} passed`);
  });
}