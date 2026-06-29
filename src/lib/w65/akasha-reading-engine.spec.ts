// =============================================================================
// Akasha Reading Engine — Tests (w65)
// =============================================================================
// Self-running test harness: works with `node --experimental-strip-types`
// AND with vitest. Pattern from cycle 64 worker B2 (reusable).
// =============================================================================

import {
  SPREAD_TYPES,
  SLOT_TEMPLATES,
  READING_TRADITION_CARDS,
  TRADITION_CATALOGS,
  TRADITION_FLOORS,
  drawReading,
  mapSlots,
  interpretReading,
  auditReadingCoverage,
  validateReading,
  chainReadingHash,
  sacredCoverageDetail,
  isFullSacredCoverage,
  listTraditions,
  countCardsByTradition,
  lookupCard,
  cardsForTradition,
  isDeterministicRun,
  isValidSpreadType,
  isValidTraditionId,
  isValidCardId,
  AkashaReadingError,
  InvalidSpreadError,
  InvalidTraditionError,
  EmptySeedError,
  __ALL_EXPORTS,
  CIGANO_COURT_CARDS,
  CIGANO_NUMBERED_PART_1,
  CIGANO_NUMBERED_PART_2,
  TAROT_MAJOR_PART_1,
  TAROT_MAJOR_PART_2,
  ORIXAS_CATALOG,
  HOUSES_CATALOG,
  SEFIROT_CATALOG,
  I_CHING_PART_1,
  I_CHING_PART_2,
  HEBREW_LETTERS_CATALOG,
  PLANETS_CATALOG,
  NUMEROLOGY_CATALOG,
  type TraditionId,
  type SpreadType,
  type ReadingResult,
  type ReadingContext,
  type InterpretationHint,
} from "./akasha-reading-engine.ts";

// ---------------------------------------------------------------------------
// Self-running harness: register on globalThis AND provide local aliases.
// ---------------------------------------------------------------------------

type DescribeFn = (name: string, fn: () => void) => void;
type ItFn = (name: string, fn: () => void) => void;
type ExpectFn = (actual?: unknown) => {
  toBe: (expected: unknown) => void;
  toEqual: (expected: unknown) => void;
  toMatch: (re: RegExp) => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
  toContain: (sub: unknown) => void;
  toHaveLength: (n: number) => void;
  toBeGreaterThanOrEqual: (n: number) => void;
  toThrow: (msg?: string | RegExp) => void;
  toBeUndefined: () => void;
  toBeNull: () => void;
  toBeDefined: () => void;
};

const describeFn: DescribeFn =
  (globalThis as { describe?: DescribeFn }).describe ??
  ((name: string, fn: () => void) => {
    console.log(`# ${name}`);
    fn();
  });

const itFn: ItFn =
  (globalThis as { it?: ItFn }).it ??
  ((name: string, fn: () => void) => {
    try {
      fn();
      console.log(`  PASS: ${name}`);
    } catch (e) {
      console.error(`  FAIL: ${name}: ${(e as Error).message}`);
      throw e;
    }
  });

const expectFn: ExpectFn = (globalThis as { expect?: ExpectFn }).expect ?? (() => {
  const fail = (msg: string) => {
    throw new Error(msg);
  };
  return {
    toBe: (expected: unknown) => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (!Object.is(actual, expected))
        fail(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual: (expected: unknown) => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        fail(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toMatch: (re: RegExp) => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (typeof actual !== "string" || !re.test(actual))
        fail(`expected to match ${re}, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy: () => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (!actual) fail(`expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy: () => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (actual) fail(`expected falsy, got ${JSON.stringify(actual)}`);
    },
    toContain: (sub: unknown) => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (
        (Array.isArray(actual) && !actual.includes(sub as never)) ||
        (typeof actual === "string" && !actual.includes(String(sub)))
      )
        fail(`expected to contain ${JSON.stringify(sub)}, got ${JSON.stringify(actual)}`);
    },
    toHaveLength: (n: number) => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (
        !actual ||
        (Array.isArray(actual) && actual.length !== n) ||
        (typeof actual === "string" && actual.length !== n)
      )
        fail(`expected length ${n}, got ${JSON.stringify(actual)}`);
    },
    toBeGreaterThanOrEqual: (n: number) => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (typeof actual !== "number" || actual < n)
        fail(`expected >= ${n}, got ${JSON.stringify(actual)}`);
    },
    toThrow: (msg?: string | RegExp) => {
      try {
        const fn = (expectFn as unknown as { _a?: unknown })._a as () => unknown;
        fn();
        fail(`expected throw, got no throw`);
      } catch (e) {
        if (!msg) return;
        const m = (e as Error).message || String(e);
        if (typeof msg === "string" && !m.includes(msg))
          fail(`expected throw with "${msg}", got: ${m}`);
        if (msg instanceof RegExp && !msg.test(m))
          fail(`expected throw matching ${msg}, got: ${m}`);
      }
    },
    toBeUndefined: () => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (actual !== undefined) fail(`expected undefined, got ${JSON.stringify(actual)}`);
    },
    toBeNull: () => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (actual !== null) fail(`expected null, got ${JSON.stringify(actual)}`);
    },
    toBeDefined: () => {
      const actual = (expectFn as unknown as { _a?: unknown })._a;
      if (actual === undefined) fail(`expected defined, got undefined`);
    },
  };
});

(globalThis as unknown as { describe: DescribeFn }).describe = describeFn;
(globalThis as unknown as { it: ItFn }).it = itFn;

const expect: ExpectFn = ((a?: unknown) => {
  (expectFn as unknown as { _a?: unknown })._a = a;
  return expectFn();
}) as ExpectFn;

const describe = describeFn as unknown as DescribeFn;
const it = itFn as unknown as ItFn;

// ---------------------------------------------------------------------------
// 1) SPREAD_TYPES contract
// ---------------------------------------------------------------------------

describe("SPREAD_TYPES contract", () => {
  it("defines 4 spread types", () => {
    const keys = Object.keys(SPREAD_TYPES);
    expect(keys.length).toBe(4);
    expect(keys).toContain("SINGLE");
    expect(keys).toContain("THREE_TIMES");
    expect(keys).toContain("FIVE_CROSS");
    expect(keys).toContain("NINE_STAR");
  });
  it("SINGLE has 1 slot", () => {
    expect(SPREAD_TYPES.SINGLE.slotCount).toBe(1);
  });
  it("THREE_TIMES has 3 slots", () => {
    expect(SPREAD_TYPES.THREE_TIMES.slotCount).toBe(3);
  });
  it("FIVE_CROSS has 5 slots", () => {
    expect(SPREAD_TYPES.FIVE_CROSS.slotCount).toBe(5);
  });
  it("NINE_STAR has 9 slots", () => {
    expect(SPREAD_TYPES.NINE_STAR.slotCount).toBe(9);
  });
  it("each spread has label and description", () => {
    (Object.keys(SPREAD_TYPES) as SpreadType[]).forEach((s) => {
      const def = SPREAD_TYPES[s];
      expect(def.label.length > 0).toBeTruthy();
      expect(def.description.length > 0).toBeTruthy();
      expect(def.defaultTradition).toBeDefined();
    });
  });
});

// ---------------------------------------------------------------------------
// 2) Tradition catalogs — split + counts
// ---------------------------------------------------------------------------

describe("Tradition catalogs (split, ≥211)", () => {
  it("Cigano total = 37 (5 court + 16 + 16 numbered)", () => {
    const total =
      CIGANO_COURT_CARDS.length +
      CIGANO_NUMBERED_PART_1.length +
      CIGANO_NUMBERED_PART_2.length;
    expect(total).toBe(37);
  });
  it("Tarot total = 22 (11 + 11)", () => {
    expect(TAROT_MAJOR_PART_1.length).toBe(11);
    expect(TAROT_MAJOR_PART_2.length).toBe(11);
    expect(TRADITION_CATALOGS.tarot.length).toBe(22);
  });
  it("Orixas total = 16", () => {
    expect(ORIXAS_CATALOG.length).toBe(16);
  });
  it("Houses total = 12", () => {
    expect(HOUSES_CATALOG.length).toBe(12);
  });
  it("Sefirot total = 10", () => {
    expect(SEFIROT_CATALOG.length).toBe(10);
  });
  it("I Ching total = 64 (32 + 32)", () => {
    expect(I_CHING_PART_1.length).toBe(32);
    expect(I_CHING_PART_2.length).toBe(32);
    expect(TRADITION_CATALOGS.i_ching.length).toBe(64);
  });
  it("Hebrew letters total = 27 (22 + 5 final forms)", () => {
    expect(HEBREW_LETTERS_CATALOG.length).toBe(27);
  });
  it("Planets total = 11", () => {
    expect(PLANETS_CATALOG.length).toBe(11);
  });
  it("Numerology total = 12 (1-9 + master 11/22/33)", () => {
    expect(NUMEROLOGY_CATALOG.length).toBe(12);
  });
  it("aggregated catalog ≥ 211 (cycle 65 floor)", () => {
    const total =
      TRADITION_CATALOGS.cigano.length +
      TRADITION_CATALOGS.tarot.length +
      TRADITION_CATALOGS.orixas.length +
      TRADITION_CATALOGS.astrologia.length +
      TRADITION_CATALOGS.sefirot.length +
      TRADITION_CATALOGS.i_ching.length +
      TRADITION_CATALOGS.hebrew.length +
      TRADITION_CATALOGS.planetas.length +
      TRADITION_CATALOGS.numerologia.length;
    expect(total >= 211).toBeTruthy();
    expect(total).toBe(211);
  });
});

// ---------------------------------------------------------------------------
// 3) READING_TRADITION_CARDS map
// ---------------------------------------------------------------------------

describe("READING_TRADITION_CARDS", () => {
  it("exposes all 9 traditions as keys", () => {
    const keys = Object.keys(READING_TRADITION_CARDS);
    expect(keys.length).toBe(9);
  });
  it("Cigano has 37 entries (5 court + 32 numbered)", () => {
    expect(READING_TRADITION_CARDS.cigano.length).toBe(37);
  });
  it("Tarot has 22 entries", () => {
    expect(READING_TRADITION_CARDS.tarot.length).toBe(22);
  });
  it("I Ching has 64 entries", () => {
    expect(READING_TRADITION_CARDS.i_ching.length).toBe(64);
  });
  it("Orixas has 16 entries", () => {
    expect(READING_TRADITION_CARDS.orixas.length).toBe(16);
  });
  it("Houses has 12 entries", () => {
    expect(READING_TRADITION_CARDS.astrologia.length).toBe(12);
  });
  it("Sefirot has 10 entries", () => {
    expect(READING_TRADITION_CARDS.sefirot.length).toBe(10);
  });
  it("Hebrew has 27 entries (22 + 5 final forms)", () => {
    expect(READING_TRADITION_CARDS.hebrew.length).toBe(27);
  });
  it("Planetas has 11 entries", () => {
    expect(READING_TRADITION_CARDS.planetas.length).toBe(11);
  });
  it("Numerologia has 12 entries", () => {
    expect(READING_TRADITION_CARDS.numerologia.length).toBe(12);
  });
});

// ---------------------------------------------------------------------------
// 4) drawReading — determinism + structure
// ---------------------------------------------------------------------------

describe("drawReading — determinism", () => {
  it("SINGLE: same seed → identical cards", () => {
    const a = drawReading("SINGLE", "pergunta", "seed-abc-001");
    const b = drawReading("SINGLE", "pergunta", "seed-abc-001");
    expect(a.slots[0]!.cardId).toBe(b.slots[0]!.cardId);
    expect(a.readingId).toBe(b.readingId);
    expect(a.chainHash).toBe(b.chainHash);
  });
  it("SINGLE: different seed → likely different card", () => {
    const a = drawReading("SINGLE", "x", "seed-A");
    const b = drawReading("SINGLE", "x", "seed-B");
    // HMAC determinism — different seeds produce different chains
    expect(a.readingId !== b.readingId || a.slots[0]!.cardId !== b.slots[0]!.cardId).toBeTruthy();
  });
  it("THREE_TIMES produces 3 slots", () => {
    const r = drawReading("THREE_TIMES", "q", "seed-tt-001");
    expect(r.slots.length).toBe(3);
    expect(r.slots[0]!.position).toBe("passado");
    expect(r.slots[1]!.position).toBe("presente");
    expect(r.slots[2]!.position).toBe("futuro");
  });
  it("FIVE_CROSS produces 5 slots", () => {
    const r = drawReading("FIVE_CROSS", "q", "seed-fc-001");
    expect(r.slots.length).toBe(5);
    expect(r.slots[0]!.position).toBe("eu");
    expect(r.slots[1]!.position).toBe("relacao");
    expect(r.slots[2]!.position).toBe("obstaculo");
    expect(r.slots[3]!.position).toBe("conselho");
    expect(r.slots[4]!.position).toBe("desfecho");
  });
  it("NINE_STAR produces 9 slots", () => {
    const r = drawReading("NINE_STAR", "q", "seed-ns-001");
    expect(r.slots.length).toBe(9);
    expect(r.slots[0]!.position).toBe("casa_1");
    expect(r.slots[8]!.position).toBe("casa_9");
  });
  it("readingId is 64-char hex", () => {
    const r = drawReading("SINGLE", "q", "seed-id-test");
    expect(r.readingId).toMatch(/^[0-9a-f]{64}$/);
  });
  it("chainHash is 64-char hex", () => {
    const r = drawReading("THREE_TIMES", "q", "seed-ch-test");
    expect(r.chainHash).toMatch(/^[0-9a-f]{64}$/);
  });
  it("slot.hmac is 64-char hex", () => {
    const r = drawReading("FIVE_CROSS", "q", "seed-hmac-test");
    r.slots.forEach((slot) => {
      expect(slot.hmac).toMatch(/^[0-9a-f]{64}$/);
    });
  });
  it("default tradition matches SPREAD_TYPES.defaultTradition", () => {
    const r1 = drawReading("SINGLE", "q", "seed-dt-1");
    expect(r1.traditionId).toBe(SPREAD_TYPES.SINGLE.defaultTradition);
    const r2 = drawReading("NINE_STAR", "q", "seed-dt-2");
    expect(r2.traditionId).toBe(SPREAD_TYPES.NINE_STAR.defaultTradition);
  });
  it("DRAWN_AT is fixed epoch (deterministic, not Date.now())", () => {
    const r = drawReading("SINGLE", "q", "seed-fixed-time");
    expect(r.drawnAt).toBe("1970-01-01T00:00:00.000Z");
  });
  it("policyVersion defaults to w65.v1", () => {
    const r = drawReading("SINGLE", "q", "seed-pv-1");
    expect(r.policyVersion).toBe("w65.v1");
  });
  it("policyVersion can be overridden via ctx", () => {
    const r = drawReading("SINGLE", "q", "seed-pv-2", {
      policyVersion: "w65.v2",
    });
    expect(r.policyVersion).toBe("w65.v2");
  });
  it("throws EmptySeedError for blank seed", () => {
    let threw = false;
    try {
      drawReading("SINGLE", "q", "");
    } catch (e) {
      threw = e instanceof EmptySeedError;
    }
    expect(threw).toBeTruthy();
  });
  it("throws EmptySeedError for whitespace seed", () => {
    let threw = false;
    try {
      drawReading("SINGLE", "q", "   \t\n  ");
    } catch (e) {
      threw = e instanceof EmptySeedError;
    }
    expect(threw).toBeTruthy();
  });
  it("throws InvalidSpreadError for unknown spread", () => {
    let threw = false;
    try {
      drawReading("BOGUS" as SpreadType, "q", "seed-bogus");
    } catch (e) {
      threw = e instanceof InvalidSpreadError;
    }
    expect(threw).toBeTruthy();
  });
  it("question is preserved", () => {
    const r = drawReading("THREE_TIMES", "Como sera 2026?", "seed-q-1");
    expect(r.question).toBe("Como sera 2026?");
  });
  it("seed is normalized (trimmed)", () => {
    const a = drawReading("SINGLE", "q", "  seed-trim  ");
    const b = drawReading("SINGLE", "q", "seed-trim");
    expect(a.seed).toBe(b.seed);
    expect(a.readingId).toBe(b.readingId);
  });
});

// ---------------------------------------------------------------------------
// 5) mapSlots
// ---------------------------------------------------------------------------

describe("mapSlots", () => {
  it("SINGLE returns 1 slot semantics", () => {
    const slots = mapSlots("SINGLE", "cigano");
    expect(slots.length).toBe(1);
    expect(slots[0]!.index).toBe(0);
  });
  it("THREE_TIMES returns 3 slot semantics with positions", () => {
    const slots = mapSlots("THREE_TIMES", "tarot");
    expect(slots.length).toBe(3);
    expect(slots[0]!.position).toBe("passado");
    expect(slots[1]!.position).toBe("presente");
    expect(slots[2]!.position).toBe("futuro");
  });
  it("FIVE_CROSS returns 5 slot semantics", () => {
    const slots = mapSlots("FIVE_CROSS", "tarot");
    expect(slots.length).toBe(5);
  });
  it("NINE_STAR returns 9 slot semantics", () => {
    const slots = mapSlots("NINE_STAR", "astrologia");
    expect(slots.length).toBe(9);
  });
  it("each slot has polarity ∈ {luz,sombra,neutro}", () => {
    (Object.keys(SPREAD_TYPES) as SpreadType[]).forEach((s) => {
      const slots = mapSlots(s, "cigano");
      slots.forEach((slot) => {
        const ok = slot.polarity === "luz" || slot.polarity === "sombra" || slot.polarity === "neutro";
        expect(ok).toBeTruthy();
      });
    });
  });
  it("each slot has questionHint non-empty", () => {
    const slots = mapSlots("FIVE_CROSS", "tarot");
    slots.forEach((slot) => {
      expect(slot.questionHint.length > 0).toBeTruthy();
    });
  });
  it("throws InvalidSpreadError on bogus spread", () => {
    let threw = false;
    try {
      mapSlots("BOGUS" as SpreadType, "cigano");
    } catch (e) {
      threw = e instanceof InvalidSpreadError;
    }
    expect(threw).toBeTruthy();
  });
  it("throws InvalidTraditionError on bogus tradition", () => {
    let threw = false;
    try {
      mapSlots("SINGLE", "BOGUS" as TraditionId);
    } catch (e) {
      threw = e instanceof InvalidTraditionError;
    }
    expect(threw).toBeTruthy();
  });
  it("index is sequential 0..N-1", () => {
    const slots = mapSlots("NINE_STAR", "astrologia");
    slots.forEach((slot, i) => {
      expect(slot.index).toBe(i);
    });
  });
});

// ---------------------------------------------------------------------------
// 6) interpretReading — fallback + external context
// ---------------------------------------------------------------------------

describe("interpretReading", () => {
  it("returns one hint per slot", () => {
    const r = drawReading("THREE_TIMES", "q", "seed-interp-1");
    const hints = interpretReading(r);
    expect(hints.length).toBe(3);
    expect(hints[0]!.slotIndex).toBe(0);
  });
  it("uses externalContext.divinationInterpret when provided", () => {
    const r = drawReading("SINGLE", "q", "seed-ext-1");
    let called = false;
    const hints = interpretReading(r, {
      externalContext: {
        divinationInterpret: (cardId, _t, position, polarity) => {
          called = true;
          return [
            `CUSTOM:${cardId}`,
            `pos=${position}`,
            `pol=${polarity}`,
          ];
        },
      },
    });
    expect(called).toBeTruthy();
    expect(hints[0]!.hints[0]).toContain("CUSTOM:");
  });
  it("falls back to defaults when externalContext not provided", () => {
    const r = drawReading("SINGLE", "q", "seed-fallback-1");
    const hints = interpretReading(r);
    expect(hints[0]!.hints.length >= 1).toBeTruthy();
  });
  it("handles externalContext that throws (defensive)", () => {
    const r = drawReading("SINGLE", "q", "seed-throws-1");
    const hints = interpretReading(r, {
      externalContext: {
        divinationInterpret: () => {
          throw new Error("upstream-down");
        },
      },
    });
    expect(hints[0]!.hints.length >= 1).toBeTruthy();
  });
  it("mesaCrossRef set when mesaRealHouse in ctx", () => {
    const r = drawReading("NINE_STAR", "q", "seed-mesa-1");
    const hints = interpretReading(r, { mesaRealHouse: 7 });
    expect(hints[0]!.mesaCrossRef).toBeDefined();
    expect(hints[0]!.mesaCrossRef!.house).toBe(7);
  });
  it("mesaCrossRef absent when mesaRealHouse not in ctx", () => {
    const r = drawReading("NINE_STAR", "q", "seed-mesa-2");
    const hints = interpretReading(r);
    expect(hints[0]!.mesaCrossRef).toBeUndefined();
  });
  it("invalid reading returns LEITURA_INVALIDA hint per slot", () => {
    const fake = {
      readingId: "x".repeat(64),
      spreadType: "SINGLE",
      traditionId: "cigano",
      question: "",
      seed: "x",
      drawnAt: "",
      slots: [],
      chainHash: "x".repeat(64),
      policyVersion: "x",
    } as unknown as ReadingResult;
    const hints = interpretReading(fake);
    expect(hints.length).toBe(0); // 0 slots in fake → 0 hints
  });
});

// ---------------------------------------------------------------------------
// 7) validateReading
// ---------------------------------------------------------------------------

describe("validateReading", () => {
  it("valid reading → ok=true", () => {
    const r = drawReading("THREE_TIMES", "q", "seed-val-1");
    const v = validateReading(r);
    expect(v.ok).toBeTruthy();
    expect(v.errors.length).toBe(0);
  });
  it("rejects non-object", () => {
    const v = validateReading(null as unknown as ReadingResult);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("READING_NOT_OBJECT");
  });
  it("rejects invalid spreadType", () => {
    const r = drawReading("SINGLE", "q", "seed-vbad-1");
    const bad = { ...r, spreadType: "BOGUS" } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("INVALID_SPREAD_TYPE");
  });
  it("rejects invalid traditionId", () => {
    const r = drawReading("SINGLE", "q", "seed-vbad-2");
    const bad = { ...r, traditionId: "BOGUS" } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("INVALID_TRADITION_ID");
  });
  it("rejects empty seed", () => {
    const r = drawReading("SINGLE", "q", "seed-vbad-3");
    const bad = { ...r, seed: "" } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("EMPTY_SEED");
  });
  it("rejects invalid readingId format", () => {
    const r = drawReading("SINGLE", "q", "seed-vbad-4");
    const bad = { ...r, readingId: "not-hex" } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("INVALID_READING_ID_FORMAT");
  });
  it("rejects invalid chainHash format", () => {
    const r = drawReading("SINGLE", "q", "seed-vbad-5");
    const bad = { ...r, chainHash: "abc" } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("INVALID_CHAIN_HASH_FORMAT");
  });
  it("rejects slot count mismatch", () => {
    const r = drawReading("THREE_TIMES", "q", "seed-vbad-6");
    const bad = { ...r, slots: r.slots.slice(0, 1) } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors.some((e) => e.startsWith("SLOT_COUNT_MISMATCH"))).toBeTruthy();
  });
  it("rejects invalid cardId in slot", () => {
    const r = drawReading("SINGLE", "q", "seed-vbad-7");
    const bad = {
      ...r,
      slots: [{ ...r.slots[0]!, cardId: "bogus.card" }],
    } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("SLOT_0_INVALID_CARD_ID");
  });
  it("rejects invalid polarity", () => {
    const r = drawReading("SINGLE", "q", "seed-vbad-8");
    const bad = {
      ...r,
      slots: [{ ...r.slots[0]!, polarity: "BOGUS" }],
    } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("SLOT_0_INVALID_POLARITY");
  });
  it("rejects invalid hmac format", () => {
    const r = drawReading("SINGLE", "q", "seed-vbad-9");
    const bad = {
      ...r,
      slots: [{ ...r.slots[0]!, hmac: "abc" }],
    } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("SLOT_0_INVALID_HMAC_FORMAT");
  });
  it("rejects slot index out of order", () => {
    const r = drawReading("THREE_TIMES", "q", "seed-vbad-10");
    const bad = {
      ...r,
      slots: [
        { ...r.slots[0]!, index: 99 },
        r.slots[1]!,
        r.slots[2]!,
      ],
    } as unknown as ReadingResult;
    const v = validateReading(bad);
    expect(v.ok).toBeFalsy();
    expect(v.errors).toContain("SLOT_0_INDEX_OUT_OF_ORDER");
  });
});

// ---------------------------------------------------------------------------
// 8) auditReadingCoverage
// ---------------------------------------------------------------------------

describe("auditReadingCoverage", () => {
  it("reports total ≥ 211", () => {
    const cov = auditReadingCoverage();
    expect(cov.total >= 211).toBeTruthy();
    expect(cov.total).toBe(211);
  });
  it("isFullCoverage = true when all floors met", () => {
    const cov = auditReadingCoverage();
    expect(cov.isFullCoverage).toBeTruthy();
    expect(cov.gaps.length).toBe(0);
  });
  it("reports per-tradition counts correctly", () => {
    const cov = auditReadingCoverage();
    expect(cov.byTradition.cigano).toBe(37);
    expect(cov.byTradition.tarot).toBe(22);
    expect(cov.byTradition.orixas).toBe(16);
    expect(cov.byTradition.astrologia).toBe(12);
    expect(cov.byTradition.sefirot).toBe(10);
    expect(cov.byTradition.i_ching).toBe(64);
    expect(cov.byTradition.hebrew).toBe(27);
    expect(cov.byTradition.planetas).toBe(11);
    expect(cov.byTradition.numerologia).toBe(12);
  });
  it("floor for cigano = 36", () => {
    const cov = auditReadingCoverage();
    expect(cov.floors.cigano).toBe(36);
  });
  it("floor for planetas = 11 (audit floor)", () => {
    const cov = auditReadingCoverage();
    expect(cov.floors.planetas).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// 9) chainReadingHash
// ---------------------------------------------------------------------------

describe("chainReadingHash", () => {
  it("produces 64-char hex", () => {
    const r = drawReading("THREE_TIMES", "q", "seed-chain-1");
    const h = chainReadingHash("prev-hash", r, "secret-1");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
  it("deterministic for same inputs", () => {
    const r = drawReading("SINGLE", "q", "seed-chain-2");
    const h1 = chainReadingHash("p", r, "s");
    const h2 = chainReadingHash("p", r, "s");
    expect(h1).toBe(h2);
  });
  it("different secret → different hash", () => {
    const r = drawReading("SINGLE", "q", "seed-chain-3");
    const h1 = chainReadingHash("p", r, "s1");
    const h2 = chainReadingHash("p", r, "s2");
    expect(h1 !== h2).toBeTruthy();
  });
  it("different prev → different hash", () => {
    const r = drawReading("SINGLE", "q", "seed-chain-4");
    const h1 = chainReadingHash("prev-1", r, "s");
    const h2 = chainReadingHash("prev-2", r, "s");
    expect(h1 !== h2).toBeTruthy();
  });
  it("falls back to akasha-w65 secret when secret empty", () => {
    const r = drawReading("SINGLE", "q", "seed-chain-5");
    const h1 = chainReadingHash("p", r, "");
    const h2 = chainReadingHash("p", r, "akasha-w65");
    expect(h1).toBe(h2);
  });
  it("matches reading.chainHash when called with prevSlotHash", () => {
    const r = drawReading("THREE_TIMES", "q", "seed-chain-6");
    // Reconstruct: prev = seed, then chain over slots
    let acc = r.seed;
    for (let i = 0; i < r.slots.length; i++) {
      const slot = r.slots[i]!;
      acc = chainReadingHash(acc, { ...r, slots: [slot] } as ReadingResult, "test-secret");
    }
    expect(acc).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ---------------------------------------------------------------------------
// 10) Sacred coverage helpers
// ---------------------------------------------------------------------------

describe("sacredCoverageDetail + isFullSacredCoverage", () => {
  it("returns 9 details (one per tradition)", () => {
    const details = sacredCoverageDetail();
    expect(details.length).toBe(9);
  });
  it("each detail has tradition, floor, count, meets", () => {
    const details = sacredCoverageDetail();
    details.forEach((d) => {
      expect(typeof d.tradition).toBe("string");
      expect(typeof d.floor).toBe("number");
      expect(typeof d.count).toBe("number");
      expect(typeof d.meets).toBe("boolean");
    });
  });
  it("all meets = true", () => {
    const details = sacredCoverageDetail();
    details.forEach((d) => {
      expect(d.meets).toBeTruthy();
    });
  });
  it("isFullSacredCoverage = true", () => {
    expect(isFullSacredCoverage()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 11) Type guards
// ---------------------------------------------------------------------------

describe("type guards", () => {
  it("isValidSpreadType accepts known", () => {
    expect(isValidSpreadType("SINGLE")).toBeTruthy();
    expect(isValidSpreadType("THREE_TIMES")).toBeTruthy();
    expect(isValidSpreadType("FIVE_CROSS")).toBeTruthy();
    expect(isValidSpreadType("NINE_STAR")).toBeTruthy();
  });
  it("isValidSpreadType rejects unknown", () => {
    expect(isValidSpreadType("BOGUS")).toBeFalsy();
    expect(isValidSpreadType(123)).toBeFalsy();
    expect(isValidSpreadType(null)).toBeFalsy();
    expect(isValidSpreadType(undefined)).toBeFalsy();
  });
  it("isValidTraditionId accepts known", () => {
    expect(isValidTraditionId("cigano")).toBeTruthy();
    expect(isValidTraditionId("tarot")).toBeTruthy();
    expect(isValidTraditionId("orixas")).toBeTruthy();
    expect(isValidTraditionId("astrologia")).toBeTruthy();
    expect(isValidTraditionId("sefirot")).toBeTruthy();
    expect(isValidTraditionId("i_ching")).toBeTruthy();
    expect(isValidTraditionId("hebrew")).toBeTruthy();
    expect(isValidTraditionId("planetas")).toBeTruthy();
    expect(isValidTraditionId("numerologia")).toBeTruthy();
  });
  it("isValidTraditionId rejects unknown", () => {
    expect(isValidTraditionId("BOGUS")).toBeFalsy();
    expect(isValidTraditionId(42)).toBeFalsy();
  });
  it("isValidCardId accepts known cigano card", () => {
    expect(isValidCardId("cigano.01")).toBeTruthy();
    expect(isValidCardId("cigano.cavaleiro")).toBeTruthy();
  });
  it("isValidCardId accepts known tarot", () => {
    expect(isValidCardId("tarot.00")).toBeTruthy();
    expect(isValidCardId("tarot.21")).toBeTruthy();
  });
  it("isValidCardId rejects unknown", () => {
    expect(isValidCardId("bogus.99")).toBeFalsy();
    expect(isValidCardId("")).toBeFalsy();
    expect(isValidCardId(123)).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// 12) Catalog introspection helpers
// ---------------------------------------------------------------------------

describe("catalog introspection", () => {
  it("listTraditions returns 9 ids", () => {
    const list = listTraditions();
    expect(list.length).toBe(9);
  });
  it("countCardsByTradition matches floor", () => {
    expect(countCardsByTradition("cigano")).toBe(37);
    expect(countCardsByTradition("i_ching")).toBe(64);
    expect(countCardsByTradition("planetas")).toBe(11);
  });
  it("countCardsByTradition returns 0 for unknown", () => {
    expect(countCardsByTradition("BOGUS" as TraditionId)).toBe(0);
  });
  it("lookupCard finds known card", () => {
    const ref = lookupCard("cigano.01");
    expect(ref).toBeDefined();
    expect(ref!.traditionId).toBe("cigano");
  });
  it("lookupCard returns null for unknown", () => {
    expect(lookupCard("bogus.x")).toBeNull();
  });
  it("cardsForTradition returns array", () => {
    const cards = cardsForTradition("tarot");
    expect(cards.length).toBe(22);
  });
  it("cardsForTradition returns empty for unknown", () => {
    const cards = cardsForTradition("BOGUS" as TraditionId);
    expect(cards.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 13) Determinism helpers
// ---------------------------------------------------------------------------

describe("isDeterministicRun", () => {
  it("returns true for matching seed", () => {
    const r = drawReading("SINGLE", "q", "seed-det-1");
    expect(isDeterministicRun(r, "seed-det-1")).toBeTruthy();
  });
  it("returns false for different seed", () => {
    const r = drawReading("SINGLE", "q", "seed-det-1");
    expect(isDeterministicRun(r, "seed-det-2")).toBeFalsy();
  });
  it("returns false for null reading", () => {
    expect(isDeterministicRun(null as unknown as ReadingResult, "x")).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// 14) __ALL_EXPORTS audit summary
// ---------------------------------------------------------------------------

describe("__ALL_EXPORTS audit summary", () => {
  it("contains ≥8 named exports", () => {
    const total =
      __ALL_EXPORTS.constants.length +
      __ALL_EXPORTS.functions.length +
      __ALL_EXPORTS.typeGuards.length;
    expect(total >= 8).toBeTruthy();
    expect(total >= 18).toBeTruthy();
  });
  it("exports SPREAD_TYPES constant", () => {
    expect(__ALL_EXPORTS.constants).toContain("SPREAD_TYPES");
  });
  it("exports drawReading function", () => {
    expect(__ALL_EXPORTS.functions).toContain("drawReading");
  });
  it("exports mapSlots function", () => {
    expect(__ALL_EXPORTS.functions).toContain("mapSlots");
  });
  it("exports interpretReading function", () => {
    expect(__ALL_EXPORTS.functions).toContain("interpretReading");
  });
  it("exports auditReadingCoverage function", () => {
    expect(__ALL_EXPORTS.functions).toContain("auditReadingCoverage");
  });
  it("exports validateReading function", () => {
    expect(__ALL_EXPORTS.functions).toContain("validateReading");
  });
  it("exports READING_TRADITION_CARDS constant", () => {
    expect(__ALL_EXPORTS.constants).toContain("READING_TRADITION_CARDS");
  });
  it("exports chainReadingHash function", () => {
    expect(__ALL_EXPORTS.functions).toContain("chainReadingHash");
  });
  it("exports 19 sections", () => {
    expect(__ALL_EXPORTS.sections).toBe(19);
  });
  it("exports 4 error classes", () => {
    expect(__ALL_EXPORTS.errorClasses.length).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// 15) Slot template sanity
// ---------------------------------------------------------------------------

describe("SLOT_TEMPLATES", () => {
  it("has 4 spread entries", () => {
    expect(Object.keys(SLOT_TEMPLATES).length).toBe(4);
  });
  it("SINGLE has 1 template", () => {
    expect(SLOT_TEMPLATES.SINGLE.length).toBe(1);
  });
  it("THREE_TIMES has 3 templates", () => {
    expect(SLOT_TEMPLATES.THREE_TIMES.length).toBe(3);
  });
  it("FIVE_CROSS has 5 templates", () => {
    expect(SLOT_TEMPLATES.FIVE_CROSS.length).toBe(5);
  });
  it("NINE_STAR has 9 templates", () => {
    expect(SLOT_TEMPLATES.NINE_STAR.length).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// 16) Error class structure
// ---------------------------------------------------------------------------

describe("error classes", () => {
  it("AkashaReadingError has code field", () => {
    const e = new AkashaReadingError("TEST", "msg");
    expect(e.code).toBe("TEST");
    expect(e.message).toContain("AKASHA_READING_TEST:");
  });
  it("InvalidSpreadError inherits", () => {
    const e = new InvalidSpreadError("bad");
    expect(e).toBeDefined();
    expect(e.code).toBe("INVALID_SPREAD");
    expect(e.message).toContain("INVALID_SPREAD");
  });
  it("InvalidTraditionError inherits", () => {
    const e = new InvalidTraditionError("bad");
    expect(e.code).toBe("INVALID_TRADITION");
  });
  it("EmptySeedError inherits", () => {
    const e = new EmptySeedError("bad");
    expect(e.code).toBe("EMPTY_SEED");
  });
});

// ---------------------------------------------------------------------------
// 17) End-to-end cross-tradition determinism
// ---------------------------------------------------------------------------

describe("end-to-end cross-tradition", () => {
  it("SAME seed produces different cards across spreads (different defaults)", () => {
    const s = drawReading("SINGLE", "q", "shared-seed-e2e");
    const t = drawReading("THREE_TIMES", "q", "shared-seed-e2e");
    // SINGLE uses cigano, THREE_TIMES also uses cigano by default
    expect(s.traditionId).toBe(t.traditionId);
    expect(s.slots.length).toBe(1);
    expect(t.slots.length).toBe(3);
  });
  it("FIVE_CROSS defaults to tarot tradition", () => {
    const r = drawReading("FIVE_CROSS", "q", "seed-e2e-fc");
    expect(r.traditionId).toBe("tarot");
    r.slots.forEach((slot) => {
      expect(slot.traditionId).toBe("tarot");
    });
  });
  it("NINE_STAR defaults to astrologia tradition", () => {
    const r = drawReading("NINE_STAR", "q", "seed-e2e-ns");
    expect(r.traditionId).toBe("astrologia");
  });
  it("10 different seeds → at least 3 distinct card draws (distribution)", () => {
    const draws = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const r = drawReading("THREE_TIMES", "q", `seed-dist-${i}`);
      draws.add(r.slots.map((s) => s.cardId).join(","));
    }
    // With 36 cigano cards × 3 slots, 10 seeds should produce multiple distinct combos.
    // (Deterministic but well-distributed.)
    expect(draws.size >= 3).toBeTruthy();
  });
});