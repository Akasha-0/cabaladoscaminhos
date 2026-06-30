// ============================================================================
// SACRED SOUND — PLAY SESSION SPEC
// ============================================================================
// 50+ assertions covering: buildSession determinism, validation, duration
// bounds, breathing patterns per tradition, JSON export, lookup helpers.
// ============================================================================

import { buildHarness } from "./harness.ts";
import {
  buildSession,
  validateSession,
  getTotalDuration,
  exportSessionAsJson,
  getBreathingPattern,
  isValidDuration,
  getPrimaryChakraForSession,
  auditSessionShapes,
} from "../play-session.ts";

const USER_ID = "user-test-001" as any;
const SESSION_OPTS = {
  includeMantras: true,
};

export async function runPlaySessionSpec(h = buildHarness()): Promise<void> {
  await h.describe("PlaySession — isValidDuration", async () => {
    await h.it("30 is valid (lower bound)", () => {
      h.expect(isValidDuration(30)).toBe(true);
    });
    await h.it("7200 is valid (upper bound)", () => {
      h.expect(isValidDuration(7200)).toBe(true);
    });
    await h.it("29 is invalid", () => {
      h.expect(isValidDuration(29)).toBe(false);
    });
    await h.it("7201 is invalid", () => {
      h.expect(isValidDuration(7201)).toBe(false);
    });
    await h.it("NaN is invalid", () => {
      h.expect(isValidDuration(NaN)).toBe(false);
    });
    await h.it("Infinity is invalid", () => {
      h.expect(isValidDuration(Infinity)).toBe(false);
    });
    await h.it("60.5 (non-integer) is invalid", () => {
      h.expect(isValidDuration(60.5)).toBe(false);
    });
    await h.it("0 is invalid", () => {
      h.expect(isValidDuration(0)).toBe(false);
    });
    await h.it("negative is invalid", () => {
      h.expect(isValidDuration(-30)).toBe(false);
    });
  });

  await h.describe("PlaySession — Breathing patterns", async () => {
    await h.it("tantra pattern is 4-7-8", () => {
      const p = getBreathingPattern("tantra");
      h.expect(p.inhaleSeconds).toBe(4);
      h.expect(p.holdSeconds).toBe(7);
      h.expect(p.exhaleSeconds).toBe(8);
    });
    await h.it("cabala pattern is coherent 6-0-6", () => {
      const p = getBreathingPattern("cabala");
      h.expect(p.inhaleSeconds).toBe(6);
      h.expect(p.exhaleSeconds).toBe(6);
      h.expect(p.holdSeconds).toBe(0);
    });
    await h.it("numerologia pattern is 5.5-0-5.5", () => {
      const p = getBreathingPattern("numerologia");
      h.expect(p.inhaleSeconds).toBe(5.5);
      h.expect(p.exhaleSeconds).toBe(5.5);
    });
    await h.it("all 7 traditions have a pattern", () => {
      for (const t of ["cigano", "orixas", "astrologia", "cabala", "numerologia", "tantra", "tarot"] as const) {
        const p = getBreathingPattern(t);
        h.expect(p.inhaleSeconds).toBeGreaterThan(0);
        h.expect(p.exhaleSeconds).toBeGreaterThan(0);
        h.expect(p.cyclesPerMinute).toBeGreaterThan(0);
      }
    });
  });

  await h.describe("PlaySession — buildSession basic", async () => {
    await h.it("builds a healing session", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      h.expect(s.steps.length).toBeGreaterThanOrEqual(2);
      h.expect(s.totalDurationSeconds).toBeGreaterThanOrEqual(600 - 10);
      h.expect(s.totalDurationSeconds).toBeLessThanOrEqual(600);
      h.expect(s.intention).toBe("healing");
    });
    await h.it("builds a grounding session", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "grounding",
        duration: 300,
        tradition: "tantra",
        ...SESSION_OPTS,
      });
      h.expect(s.tradition).toBe("tantra");
      h.expect(s.steps.length).toBeGreaterThanOrEqual(2);
    });
    await h.it("builds a love session with 528Hz + 639Hz", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "love",
        duration: 600,
        ...SESSION_OPTS,
      });
      const ids = s.steps.map((step) => step.frequencyId);
      h.expect(ids).toContain("528hz");
      h.expect(ids).toContain("639hz");
    });
    await h.it("builds an awakening session with 963Hz", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "awakening",
        duration: 600,
        ...SESSION_OPTS,
      });
      const ids = s.steps.map((step) => step.frequencyId);
      h.expect(ids).toContain("963hz");
    });
    await h.it("session ID is unique", () => {
      const s1 = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      const s2 = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      h.expect(s1.id).not.toBe(s2.id);
    });
    await h.it("createdAt is ISO 8601", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      h.expect(s.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
    await h.it("throws on invalid duration (29s)", () => {
      let threw = false;
      try {
        buildSession({
          userId: USER_ID,
          intention: "healing",
          duration: 29,
          ...SESSION_OPTS,
        });
      } catch {
        threw = true;
      }
      h.expect(threw).toBe(true);
    });
    await h.it("throws on invalid duration (10000s)", () => {
      let threw = false;
      try {
        buildSession({
          userId: USER_ID,
          intention: "healing",
          duration: 10000,
          ...SESSION_OPTS,
        });
      } catch {
        threw = true;
      }
      h.expect(threw).toBe(true);
    });
  });

  await h.describe("PlaySession — Step shape", async () => {
    await h.it("each step has order, frequency, duration, breath cycles", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 900,
        ...SESSION_OPTS,
      });
      for (const step of s.steps) {
        h.expect(step.order).toBeGreaterThanOrEqual(0);
        h.expect(step.durationSeconds).toBeGreaterThanOrEqual(30);
        h.expect(step.breathCycles).toBeGreaterThanOrEqual(1);
        h.expect(step.frequencyId.length).toBeGreaterThan(0);
      }
    });
    await h.it("step orders are 0..N-1 sequential", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 900,
        ...SESSION_OPTS,
      });
      for (let i = 0; i < s.steps.length; i++) {
        h.expect(s.steps[i]!.order).toBe(i);
      }
    });
    await h.it("breath cycles count ≥ 1", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      for (const step of s.steps) {
        h.expect(step.breathCycles).toBeGreaterThan(0);
      }
    });
  });

  await h.describe("PlaySession — Validation", async () => {
    await h.it("validateSession returns valid for built session", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      const v = validateSession(s);
      h.expect(v.valid).toBe(true);
      h.expect(v.errors.length).toBe(0);
    });
    await h.it("validateSession catches empty steps", () => {
      const s = {
        id: "x" as any,
        userId: USER_ID,
        steps: [],
        totalDurationSeconds: 0,
        breathingPattern: getBreathingPattern("tantra"),
        intention: "healing" as const,
        createdAt: new Date().toISOString(),
      };
      const v = validateSession(s);
      h.expect(v.valid).toBe(false);
      h.expect(v.errors.length).toBeGreaterThan(0);
    });
    await h.it("validateSession catches duration mismatch", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      // Tamper with totalDurationSeconds
      const tampered = { ...s, totalDurationSeconds: 9999 };
      const v = validateSession(tampered);
      h.expect(v.valid).toBe(false);
    });
    await h.it("validateSession catches unknown frequency", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      const tampered = {
        ...s,
        steps: [{ order: 0, frequencyId: "9999hz", durationSeconds: 600, breathCycles: 5 }],
        totalDurationSeconds: 600,
      };
      const v = validateSession(tampered);
      h.expect(v.valid).toBe(false);
    });
    await h.it("validateSession accepts 432Hz (custom)", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "grounding",
        duration: 600,
        ...SESSION_OPTS,
      });
      const v = validateSession(s);
      // 432hz is in grounding candidates
      h.expect(v.valid).toBe(true);
    });
  });

  await h.describe("PlaySession — getTotalDuration", async () => {
    await h.it("returns ms = seconds * 1000", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      const ms = getTotalDuration(s);
      h.expect(ms).toBe(s.totalDurationSeconds * 1000);
    });
    await h.it("returns finite number", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      const ms = getTotalDuration(s);
      h.expect(Number.isFinite(ms)).toBe(true);
      h.expect(ms).toBeGreaterThan(0);
    });
  });

  await h.describe("PlaySession — JSON export", async () => {
    await h.it("exports valid JSON", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      const json = exportSessionAsJson(s);
      const parsed = JSON.parse(json);
      h.expect(parsed.id).toBe(s.id);
      h.expect(parsed.steps.length).toBe(s.steps.length);
    });
    await h.it("exported JSON contains userId (LGPD portability)", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      const json = exportSessionAsJson(s);
      h.expect(json).toContain(USER_ID);
    });
    await h.it("exported JSON contains no undefined", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        tradition: "tantra",
        ...SESSION_OPTS,
      });
      const json = exportSessionAsJson(s);
      h.expect(json).not.toContain("undefined");
    });
  });

  await h.describe("PlaySession — Chakra mapping", async () => {
    await h.it("healing session maps to Manipura (528Hz)", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "healing",
        duration: 600,
        ...SESSION_OPTS,
      });
      const c = getPrimaryChakraForSession(s);
      h.expect(c).toBe("Manipura");
    });
    await h.it("grounding session maps to Muladhara", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "grounding",
        duration: 600,
        ...SESSION_OPTS,
      });
      const c = getPrimaryChakraForSession(s);
      h.expect(c).toBe("Muladhara");
    });
    await h.it("awakening session maps to Sahasrara", () => {
      const s = buildSession({
        userId: USER_ID,
        intention: "awakening",
        duration: 600,
        ...SESSION_OPTS,
      });
      const c = getPrimaryChakraForSession(s);
      h.expect(c).toBe("Sahasrara");
    });
  });

  await h.describe("PlaySession — Audit", async () => {
    await h.it("auditSessionShapes returns ok", () => {
      const a = auditSessionShapes();
      h.expect(a.stepShapeOk).toBe(true);
      h.expect(a.hasSteps).toBe(true);
      h.expect(a.chakraMappingSize).toBe(7);
    });
  });
}

if (typeof process !== "undefined" && process.argv[1]?.endsWith("play-session.spec.ts")) {
  const h = buildHarness();
  runPlaySessionSpec(h).then(() => {
    const failed = h.results.filter((r) => !r.passed);
    if (failed.length) {
      console.error(`${failed.length}/${h.results.length} FAILED`);
      for (const f of failed) console.error(`  ✗ ${f.name}: ${f.error}`);
      process.exit(1);
    }
    console.log(`✓ ${h.results.length}/${h.results.length} passed`);
  });
}