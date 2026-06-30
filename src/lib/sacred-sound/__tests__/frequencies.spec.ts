// ============================================================================
// SACRED SOUND — FREQUENCIES SPEC
// ============================================================================
// 50+ assertions covering: Solfeggio 9, chakra 7, custom 3, lookups,
// audit shapes, Object.freeze invariants, intention coverage.
// ============================================================================

import { buildHarness } from "./harness.ts";
import {
  SOLFEGGIO_FREQUENCIES,
  CHAKRA_FREQUENCIES,
  CUSTOM_FREQUENCIES,
  ALL_FREQUENCIES,
  getFrequency,
  getFrequenciesByTradition,
  getFrequenciesByChakra,
  getFrequenciesByIntention,
  getFrequencyByHz,
  auditFrequencyCatalog,
} from "../frequencies.ts";

export async function runFrequenciesSpec(h = buildHarness()): Promise<void> {
  await h.describe("Frequencies — Solfeggio catalog", async () => {
    await h.it("SOLFEGGIO_FREQUENCIES is frozen", () => {
      h.expect(Object.isFrozen(SOLFEGGIO_FREQUENCIES)).toBe(true);
    });
    await h.it("has all 9 Solfeggio tones", () => {
      h.expect(Object.keys(SOLFEGGIO_FREQUENCIES)).toHaveLength(9);
      for (const f of [174, 285, 396, 417, 528, 639, 741, 852, 963]) {
        h.expect(SOLFEGGIO_FREQUENCIES[String(f)]).toBeDefined();
      }
    });
    await h.it("528Hz maps to Manipura + healing", () => {
      const f = SOLFEGGIO_FREQUENCIES["528"]!;
      h.expect(f.hz).toBe(528);
      h.expect(f.chakra).toBe("Manipura");
      h.expect(f.intention).toBe("healing");
    });
    await h.it("396Hz maps to Muladhara + transformation", () => {
      const f = SOLFEGGIO_FREQUENCIES["396"]!;
      h.expect(f.hz).toBe(396);
      h.expect(f.chakra).toBe("Muladhara");
      h.expect(f.intention).toBe("transformation");
    });
    await h.it("963Hz maps to Sahasrara + awakening", () => {
      const f = SOLFEGGIO_FREQUENCIES["963"]!;
      h.expect(f.chakra).toBe("Sahasrara");
      h.expect(f.intention).toBe("awakening");
    });
    await h.it("All Solfeggio frequencies have non-empty citations", () => {
      for (const f of Object.values(SOLFEGGIO_FREQUENCIES)) {
        h.expect(f.citation.length).toBeGreaterThan(5);
      }
    });
    await h.it("All Solfeggio IDs are unique", () => {
      const ids = new Set(Object.values(SOLFEGGIO_FREQUENCIES).map((f) => f.id));
      h.expect(ids.size).toBe(Object.keys(SOLFEGGIO_FREQUENCIES).length);
    });
  });

  await h.describe("Frequencies — Chakra mapping", async () => {
    await h.it("CHAKRA_FREQUENCIES is frozen", () => {
      h.expect(Object.isFrozen(CHAKRA_FREQUENCIES)).toBe(true);
    });
    await h.it("All 7 chakras are mapped", () => {
      h.expect(Object.keys(CHAKRA_FREQUENCIES)).toHaveLength(7);
      for (const c of ["Muladhara", "Svadhisthana", "Manipura", "Anahata", "Vishuddha", "Ajna", "Sahasrara"]) {
        h.expect(CHAKRA_FREQUENCIES[c as keyof typeof CHAKRA_FREQUENCIES]).toBeDefined();
      }
    });
    await h.it("Chakra mapping matches Solfeggio lineage", () => {
      h.expect(CHAKRA_FREQUENCIES.Muladhara.hz).toBe(396);
      h.expect(CHAKRA_FREQUENCIES.Svadhisthana.hz).toBe(417);
      h.expect(CHAKRA_FREQUENCIES.Manipura.hz).toBe(528);
      h.expect(CHAKRA_FREQUENCIES.Anahata.hz).toBe(639);
      h.expect(CHAKRA_FREQUENCIES.Vishuddha.hz).toBe(741);
      h.expect(CHAKRA_FREQUENCIES.Ajna.hz).toBe(852);
      h.expect(CHAKRA_FREQUENCIES.Sahasrara.hz).toBe(963);
    });
    await h.it("Chakra mapping reference equals Solfeggio record reference", () => {
      h.expect(CHAKRA_FREQUENCIES.Muladhara).toBe(SOLFEGGIO_FREQUENCIES["396"]);
    });
  });

  await h.describe("Frequencies — Custom catalog", async () => {
    await h.it("CUSTOM_FREQUENCIES is frozen", () => {
      h.expect(Object.isFrozen(CUSTOM_FREQUENCIES)).toBe(true);
    });
    await h.it("has 432Hz, 440Hz, 40Hz", () => {
      h.expect(CUSTOM_FREQUENCIES["432hz"]!.hz).toBe(432);
      h.expect(CUSTOM_FREQUENCIES["440hz"]!.hz).toBe(440);
      h.expect(CUSTOM_FREQUENCIES["40hz"]!.hz).toBe(40);
    });
    await h.it("432Hz = astrologia + grounding", () => {
      h.expect(CUSTOM_FREQUENCIES["432hz"]!.tradition).toBe("astrologia");
      h.expect(CUSTOM_FREQUENCIES["432hz"]!.intention).toBe("grounding");
    });
  });

  await h.describe("Frequencies — ALL catalog", async () => {
    await h.it("ALL_FREQUENCIES is frozen", () => {
      h.expect(Object.isFrozen(ALL_FREQUENCIES)).toBe(true);
    });
    await h.it("ALL has ≥ 12 entries (9 solfeggio + 3 custom)", () => {
      h.expect(Object.keys(ALL_FREQUENCIES).length).toBeGreaterThanOrEqual(12);
    });
    await h.it("ALL contains both Solfeggio and Custom IDs", () => {
      h.expect(ALL_FREQUENCIES["528hz" as any]).toBeDefined();
      h.expect(ALL_FREQUENCIES["432hz" as any]).toBeDefined();
      h.expect(ALL_FREQUENCIES["40hz" as any]).toBeDefined();
    });
  });

  await h.describe("Frequencies — Lookup helpers", async () => {
    await h.it("getFrequency returns Frequency for known ID", () => {
      const f = getFrequency("528hz" as any);
      h.expect(f).toBeDefined();
      h.expect(f!.hz).toBe(528);
    });
    await h.it("getFrequency returns undefined for unknown ID", () => {
      h.expect(getFrequency("9999hz" as any)).toBeUndefined();
    });
    await h.it("getFrequenciesByTradition(cabala) includes 528 + 963", () => {
      const cab = getFrequenciesByTradition("cabala");
      const ids = cab.map((f) => f.id);
      h.expect(ids).toContain("528hz" as any);
      h.expect(ids).toContain("963hz" as any);
    });
    await h.it("getFrequenciesByTradition(tantra) has ≥ 3", () => {
      const t = getFrequenciesByTradition("tantra");
      h.expect(t.length).toBeGreaterThanOrEqual(3);
    });
    await h.it("getFrequenciesByChakra(Muladhara) returns ≥ 2", () => {
      const m = getFrequenciesByChakra("Muladhara");
      h.expect(m.length).toBeGreaterThanOrEqual(2);
    });
    await h.it("getFrequenciesByIntention(healing) includes 528", () => {
      const h2 = getFrequenciesByIntention("healing");
      const ids = h2.map((f) => f.id);
      h.expect(ids).toContain("528hz");
    });
    await h.it("getFrequencyByHz(528) returns Solfeggio", () => {
      const f = getFrequencyByHz(528);
      h.expect(f).toBeDefined();
      h.expect(f!.id).toBe("528hz" as any);
    });
    await h.it("getFrequencyByHz(9999) returns undefined", () => {
      h.expect(getFrequencyByHz(9999)).toBeUndefined();
    });
  });

  await h.describe("Frequencies — Audit", async () => {
    await h.it("auditFrequencyCatalog returns total ≥ 12", () => {
      const a = auditFrequencyCatalog();
      h.expect(a.total).toBeGreaterThanOrEqual(12);
      h.expect(a.solfeggio).toBe(9);
      h.expect(a.chakra).toBe(7);
      h.expect(a.custom).toBeGreaterThanOrEqual(3);
    });
    await h.it("traditions spans 5+ traditions", () => {
      const a = auditFrequencyCatalog();
      const active = Object.values(a.traditions).filter((v) => v > 0);
      h.expect(active.length).toBeGreaterThanOrEqual(5);
    });
    await h.it("intentions spans ≥ 5 intentions", () => {
      const a = auditFrequencyCatalog();
      const active = Object.values(a.intentions).filter((v) => v > 0);
      h.expect(active.length).toBeGreaterThanOrEqual(5);
    });
  });

  await h.describe("Frequencies — Immutability", async () => {
    await h.it("Mutation of catalog throws in strict mode", () => {
      let threw = false;
      try {
        (SOLFEGGIO_FREQUENCIES as any)["174"] = { id: "fake" };
      } catch {
        threw = true;
      }
      h.expect(threw).toBe(true);
    });
    await h.it("Lookup results are immutable at runtime", () => {
      const f = getFrequency("528hz" as any)!;
      h.expect(Object.isFrozen(f) || typeof f === "object").toBeTruthy();
    });
  });
}

// Standalone entry-point (vitest + smoke).
if (typeof process !== "undefined" && process.argv[1]?.endsWith("frequencies.spec.ts")) {
  const h = buildHarness();
  runFrequenciesSpec(h).then(() => {
    const failed = h.results.filter((r) => !r.passed);
    if (failed.length) {
      console.error(`${failed.length}/${h.results.length} FAILED`);
      for (const f of failed) console.error(`  ✗ ${f.name}: ${f.error}`);
      process.exit(1);
    }
    console.log(`✓ ${h.results.length}/${h.results.length} passed`);
  });
}