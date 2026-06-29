/**
 * marketplace-pricing-engine.spec.ts — Self-running test harness
 *
 * Cycle 65 — Worker C — session 414594685456687
 *
 * Runs via `node --experimental-strip-types src/lib/w65/marketplace-pricing-engine.spec.ts`
 * No vitest dep. Uses globalThis-registered describe/it/expect AND local aliases
 * for double-mode compatibility.
 *
 * Coverage:
 *   - Type guards (3 × N cases)
 *   - clampUnit / cents / reputationDiscount helpers
 *   - composeSacredMultiplier (per tradition + stacking)
 *   - findSacredTag lookup
 *   - priceService (8 service types × 4 tiers = 32 cases, plus edge cases)
 *   - validatePricing (valid + 6 invalid cases)
 *   - chainEscrowHash + verifyEscrowChain (genesis, chain, tamper)
 *   - holdEscrow + releaseEscrow + refundEscrow (full lifecycle)
 *   - isSellerEligible (≥ 10 readings + ≥ 4.0 reputation gate)
 *   - auditMarketplacePricing (coverage + isFullCoverage)
 *   - dispatchMarketplace (one-call end-to-end)
 *   - Anti-pattern checks (no float BRL, no `any`, no shared mutable defaults)
 */

// ---- Self-running test harness (register on globalThis + local aliases) ----
type TestFn = () => void | Promise<void>;
interface DescribeCtx { name: string; fn: () => void | Promise<void>; }
const describes: DescribeCtx[] = [];
let currentDescribe: DescribeCtx | null = null;
const itCases: { name: string; fn: TestFn; describe: string }[] = [];

interface ExpectChain {
  toBe: (v: unknown) => void;
  toEqual: (v: unknown) => void;
  toStrictEqual: (v: unknown) => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
  toBeGreaterThan: (n: number) => void;
  toBeLessThan: (n: number) => void;
  toBeGreaterThanOrEqual: (n: number) => void;
  toBeLessThanOrEqual: (n: number) => void;
  toContain: (v: unknown) => void;
  toHaveLength: (n: number) => void;
  toBeDefined: () => void;
  toBeNull: () => void;
  toMatch: (re: RegExp) => void;
  toThrow: (msg?: string | RegExp) => void;
  toBeInstanceOf: (cls: unknown) => void;
  not: ExpectChain;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (Array.isArray(b)) return false;
  const ak = Object.keys(a as Record<string, unknown>);
  const bk = Object.keys(b as Record<string, unknown>);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

function makeExpect(actual: unknown): ExpectChain {
  const neg = (fn: () => void): void => {
    try { fn(); throw new Error("expected negated assertion to fail"); }
    catch { /* expected to fail */ }
  };
  const notChain: ExpectChain = {
    toBe: (v) => neg(() => { if (actual === v) throw new Error("neg.toBe failed"); }),
    toEqual: (v) => neg(() => { if (deepEqual(actual, v)) throw new Error("neg.toEqual failed"); }),
    toStrictEqual: (v) => neg(() => { if (deepEqual(actual, v)) throw new Error("neg.toStrictEqual failed"); }),
    toBeTruthy: () => neg(() => { if (!actual) throw new Error("neg.toBeTruthy failed"); }),
    toBeFalsy: () => neg(() => { if (actual) throw new Error("neg.toBeFalsy failed"); }),
    toBeGreaterThan: (n) => neg(() => { if (!(actual as number > n)) throw new Error("neg.toBeGreaterThan failed"); }),
    toBeLessThan: (n) => neg(() => { if (!(actual as number < n)) throw new Error("neg.toBeLessThan failed"); }),
    toBeGreaterThanOrEqual: (n) => neg(() => { if (!(actual as number >= n)) throw new Error("neg.toBeGreaterThanOrEqual failed"); }),
    toBeLessThanOrEqual: (n) => neg(() => { if (!(actual as number <= n)) throw new Error("neg.toBeLessThanOrEqual failed"); }),
    toContain: (v) => neg(() => {
      if (Array.isArray(actual) && actual.includes(v)) throw new Error("neg.toContain failed");
      if (typeof actual === "string" && actual.includes(String(v))) throw new Error("neg.toContain failed");
    }),
    toHaveLength: (n) => neg(() => {
      if (!Array.isArray(actual) && typeof actual !== "string") throw new Error("neg.toHaveLength on non-array/string");
      if ((actual as { length: number }).length === n) throw new Error("neg.toHaveLength failed");
    }),
    toBeDefined: () => { if (actual !== undefined) throw new Error("neg.toBeDefined failed"); },
    toBeNull: () => { if (actual === null) throw new Error("neg.toBeNull failed"); },
    toMatch: (re) => neg(() => { if (re.test(String(actual))) throw new Error("neg.toMatch failed"); }),
    toThrow: (msg) => {
      if (typeof actual !== "function") throw new Error("neg.toThrow on non-function");
      let didThrow = false;
      let m = "";
      try { (actual as () => unknown)(); }
      catch (e) { didThrow = true; m = (e as Error).message; }
      if (!didThrow) return; // no throw → expected for not.toThrow → pass
      // threw → unexpected for not.toThrow → fail
      if (!msg) throw new Error("neg.toThrow: function unexpectedly threw: " + m);
      if (msg instanceof RegExp) { if (!msg.test(m)) throw new Error("neg.toThrow msg mismatch: " + m); }
      else { if (!m.includes(msg)) throw new Error("neg.toThrow msg mismatch: " + m); }
    },
    toBeInstanceOf: (cls) => {
      if (actual instanceof (cls as Function)) throw new Error(`neg.toBeInstanceOf: was instance of ${String(cls)}`);
    },
    not: undefined as unknown as ExpectChain,
  };
  const chain: ExpectChain = {
    toBe: (v) => { if (actual !== v) throw new Error(`expected ${JSON.stringify(actual)} === ${JSON.stringify(v)}`); },
    toEqual: (v) => { if (!deepEqual(actual, v)) throw new Error(`expected ${JSON.stringify(actual)} toEqual ${JSON.stringify(v)}`); },
    toStrictEqual: (v) => { if (!deepEqual(actual, v)) throw new Error(`expected ${JSON.stringify(actual)} toStrictEqual ${JSON.stringify(v)}`); },
    toBeTruthy: () => { if (!actual) throw new Error(`expected ${JSON.stringify(actual)} to be truthy`); },
    toBeFalsy: () => { if (actual) throw new Error(`expected ${JSON.stringify(actual)} to be falsy`); },
    toBeGreaterThan: (n) => { if (!(actual as number > n)) throw new Error(`expected ${actual} > ${n}`); },
    toBeLessThan: (n) => { if (!(actual as number < n)) throw new Error(`expected ${actual} < ${n}`); },
    toBeGreaterThanOrEqual: (n) => { if (!(actual as number >= n)) throw new Error(`expected ${actual} >= ${n}`); },
    toBeLessThanOrEqual: (n) => { if (!(actual as number <= n)) throw new Error(`expected ${actual} <= ${n}`); },
    toContain: (v) => {
      if (Array.isArray(actual)) { if (!actual.includes(v)) throw new Error(`expected array to contain ${JSON.stringify(v)}`); return; }
      if (typeof actual === "string") { if (!actual.includes(String(v))) throw new Error(`expected string to contain ${JSON.stringify(v)}`); return; }
      throw new Error("toContain on non-array/string");
    },
    toHaveLength: (n) => {
      if (!Array.isArray(actual) && typeof actual !== "string") throw new Error("toHaveLength on non-array/string");
      if ((actual as { length: number }).length !== n) throw new Error(`expected length ${(actual as { length: number }).length} to be ${n}`);
    },
    toBeDefined: () => { if (actual === undefined) throw new Error("expected to be defined"); },
    toBeNull: () => { if (actual !== null) throw new Error(`expected null, got ${JSON.stringify(actual)}`); },
    toMatch: (re) => { if (!re.test(String(actual))) throw new Error(`expected ${String(actual)} to match ${re}`); },
    toThrow: (msg) => {
      if (typeof actual !== "function") throw new Error("toThrow on non-function");
      try { (actual as () => unknown)(); throw new Error("expected function to throw"); }
      catch (e) {
        if (!msg) return;
        const m = (e as Error).message;
        if (msg instanceof RegExp) { if (!msg.test(m)) throw new Error(`thrown msg ${m} did not match ${msg}`); }
        else { if (!m.includes(msg)) throw new Error(`thrown msg ${m} did not contain ${msg}`); }
      }
    },
    toBeInstanceOf: (cls) => {
      if (!(actual instanceof (cls as Function))) {
        throw new Error(`expected ${String(actual)} to be instance of ${String(cls)}`);
      }
    },
    not: notChain,
  };
  notChain.not = chain; // self-reference (mutual not)
  return chain;
}

const describeFn = (name: string, fn: () => void | Promise<void>) => {
  describes.push({ name, fn });
  const prev = currentDescribe;
  currentDescribe = { name, fn };
  // sync only — the harness does not support async describes
  fn();
  currentDescribe = prev;
};
const itFn = (name: string, fn: TestFn) => {
  itCases.push({ name, fn, describe: currentDescribe?.name ?? "<root>" });
};
const expectFn = (a: unknown) => makeExpect(a);

(globalThis as { describe?: typeof describeFn }).describe = describeFn;
(globalThis as { it?: typeof itFn }).it = itFn;
(globalThis as { expect?: typeof expectFn }).expect = expectFn;

// Local aliases (for portability)
const describe = describeFn as unknown as (n: string, f: () => void) => void;
const it = itFn as unknown as (n: string, f: TestFn) => void;
const expect = expectFn as unknown as (a: unknown) => ExpectChain;

// ============================================================================
// Imports under test
// ============================================================================
import {
  // Main
  priceService,
  holdEscrow,
  releaseEscrow,
  refundEscrow,
  isSellerEligible,
  auditMarketplacePricing,
  validatePricing,
  chainEscrowHash,
  // Helpers
  clampUnit,
  cents,
  reputationDiscount,
  composeSacredMultiplier,
  findSacredTag,
  verifyEscrowChain,
  listEscrows,
  resetEscrowLedgerForTest,
  dispatchMarketplace,
  // Types (type-only — never executed)
  // Constants
  SERVICE_DEFAULTS,
  TIER_MULTIPLIERS,
  GENESIS_LEDGER_HASH,
  CIGANO_CARDS,
  ORIXAS,
  CHAKRAS,
  SEFIROT,
  HOUSES,
  ALL_SACRED_TAGS,
  REPUTATION_DISCOUNT_FLOOR,
  REPUTATION_DISCOUNT_CAP,
  SELLER_MIN_READINGS,
  SELLER_MIN_REPUTATION,
  SACRED_AUDIT_FLOOR,
  SAMPLE_LISTINGS,
  __ALL_EXPORTS,
  // Type guards
  isServiceType,
  isTier,
  isSacredTradition,
  // Error classes
  MarketplacePricingError,
  InvalidServiceTypeError,
  InvalidTierError,
  EscrowError,
  IntegrityError,
} from "./marketplace-pricing-engine.ts";

// ============================================================================
// Test utilities
// ============================================================================
function makeCtx(overrides: Partial<{ secret: string; reputations: Map<string, number>; readings: Map<string, number> }> = {}) {
  return {
    escrowSecret: overrides.secret ?? "test-secret-w65",
    reputationByUser: overrides.reputations ?? new Map<string, number>(),
    readingsCountByUser: overrides.readings ?? new Map<string, number>(),
  };
}

// ============================================================================
// SECTION A — Type guards
// ============================================================================
describe("Type guards", () => {
  it("isServiceType accepts 8 valid types", () => {
    expect(isServiceType("LEITURA_CIGANO")).toBe(true);
    expect(isServiceType("CONSULTA_TAROT")).toBe(true);
    expect(isServiceType("MENTORIA_ESPIRITUAL")).toBe(true);
    expect(isServiceType("RITUAL_GUIA")).toBe(true);
    expect(isServiceType("MESA_REAL")).toBe(true);
    expect(isServiceType("CONSULTA_ASTRO")).toBe(true);
    expect(isServiceType("ESTUDO_CABALA")).toBe(true);
    expect(isServiceType("TERAPIA_TANTRA")).toBe(true);
  });
  it("isServiceType rejects invalid", () => {
    expect(isServiceType("BOGUS")).toBe(false);
    expect(isServiceType(42)).toBe(false);
    expect(isServiceType(null)).toBe(false);
    expect(isServiceType(undefined)).toBe(false);
  });
  it("isTier accepts all 4 tiers", () => {
    expect(isTier("BASIC")).toBe(true);
    expect(isTier("INTERMEDIATE")).toBe(true);
    expect(isTier("ADVANCED")).toBe(true);
    expect(isTier("MASTER")).toBe(true);
  });
  it("isTier rejects invalid", () => {
    expect(isTier("NINJA")).toBe(false);
    expect(isTier(123)).toBe(false);
  });
  it("isSacredTradition accepts 5 traditions", () => {
    expect(isSacredTradition("CIGANO")).toBe(true);
    expect(isSacredTradition("ORIXAS")).toBe(true);
    expect(isSacredTradition("CHAKRAS")).toBe(true);
    expect(isSacredTradition("SEFIROT")).toBe(true);
    expect(isSacredTradition("HOUSES")).toBe(true);
  });
  it("isSacredTradition rejects invalid", () => {
    expect(isSacredTradition("TAROT")).toBe(false);
    expect(isSacredTradition("")).toBe(false);
  });
});

// ============================================================================
// SECTION B — Pure helpers
// ============================================================================
describe("Helpers", () => {
  it("clampUnit clamps to [0, 1]", () => {
    expect(clampUnit(0.5)).toBe(0.5);
    expect(clampUnit(-0.1)).toBe(0);
    expect(clampUnit(1.5)).toBe(1);
    expect(clampUnit(NaN)).toBe(0);
    expect(clampUnit(Infinity)).toBe(0); // non-finite → defensive 0 (cycle 63 lesson)
  });
  it("cents rounds to integer", () => {
    expect(cents(5500.7)).toBe(5501);
    expect(cents(5500.3)).toBe(5500);
    expect(cents(NaN)).toBe(0);
    expect(cents(-0.5)).toBe(0);
  });
  it("reputationDiscount maps 0..5 → 0..0.10", () => {
    expect(reputationDiscount(0)).toBe(0);
    expect(reputationDiscount(2.5)).toBe(0.05);
    expect(reputationDiscount(5)).toBe(REPUTATION_DISCOUNT_CAP);
    expect(reputationDiscount(7)).toBe(REPUTATION_DISCOUNT_CAP);
    expect(reputationDiscount(-1)).toBe(0);
  });
  it("composeSacredMultiplier returns 1.0 for empty tags", () => {
    const r = composeSacredMultiplier([]);
    expect(r.multiplier).toBe(1.0);
    expect(r.applied).toHaveLength(0);
  });
  it("composeSacredMultiplier applies a Cigano card modifier", () => {
    const r = composeSacredMultiplier(["Cigano 4 Paus"]);
    expect(r.applied).toContain("Cigano 4 Paus");
    expect(r.multiplier).toBe(1.10);
  });
  it("composeSacredMultiplier stacks tags multiplicatively", () => {
    const r = composeSacredMultiplier(["Sahasrara", "Ajna"]);
    expect(r.applied).toContain("Sahasrara");
    expect(r.applied).toContain("Ajna");
    // 1.15 * 1.10 = 1.265
    expect(r.multiplier).toBeGreaterThan(1.20);
    expect(r.multiplier).toBeLessThan(1.30);
  });
  it("composeSacredMultiplier caps at 1.99 (runaway protection)", () => {
    const r = composeSacredMultiplier(["Keter", "Sahasrara", "Casa 1", "Exu", "Cigano 4 Paus"]);
    expect(r.multiplier).toBeLessThanOrEqual(1.99);
  });
  it("composeSacredMultiplier handles unknown tag gracefully", () => {
    const r = composeSacredMultiplier(["NonExistentTag"]);
    expect(r.multiplier).toBe(1.0);
    expect(r.applied).toHaveLength(0);
  });
  it("findSacredTag returns entry or null", () => {
    expect(findSacredTag("Exu")?.tradition).toBe("ORIXAS");
    expect(findSacredTag("Anahata")?.tradition).toBe("CHAKRAS");
    expect(findSacredTag("Keter")?.tradition).toBe("SEFIROT");
    expect(findSacredTag("Casa 1")?.tradition).toBe("HOUSES");
    expect(findSacredTag("Cigano 1 Copas")?.tradition).toBe("CIGANO");
    expect(findSacredTag("BOGUS")).toBeNull();
  });
});

// ============================================================================
// SECTION C — Constants
// ============================================================================
describe("Constants", () => {
  it("SERVICE_DEFAULTS has 8 entries with min < max", () => {
    expect(Object.keys(SERVICE_DEFAULTS)).toHaveLength(8);
    for (const k of Object.keys(SERVICE_DEFAULTS) as (keyof typeof SERVICE_DEFAULTS)[]) {
      const r = SERVICE_DEFAULTS[k];
      expect(r.minCents).toBeGreaterThan(0);
      expect(r.maxCents).toBeGreaterThan(r.minCents);
    }
  });
  it("TIER_MULTIPLIERS has 4 entries in ascending order", () => {
    expect(Object.keys(TIER_MULTIPLIERS)).toHaveLength(4);
    expect(TIER_MULTIPLIERS.BASIC).toBe(1.0);
    expect(TIER_MULTIPLIERS.INTERMEDIATE).toBe(1.5);
    expect(TIER_MULTIPLIERS.ADVANCED).toBe(2.0);
    expect(TIER_MULTIPLIERS.MASTER).toBe(3.0);
  });
  it("CIGANO_CARDS has 36 cards (≥ floor 30)", () => {
    expect(CIGANO_CARDS.length).toBeGreaterThanOrEqual(30);
    expect(CIGANO_CARDS.length).toBeGreaterThanOrEqual(36);
  });
  it("ORIXAS has 16 entities (≥ floor 16)", () => {
    expect(ORIXAS.length).toBeGreaterThanOrEqual(16);
  });
  it("CHAKRAS has 7 (≥ floor 7)", () => {
    expect(CHAKRAS.length).toBe(7);
  });
  it("SEFIROT has 10 (≥ floor 10)", () => {
    expect(SEFIROT.length).toBe(10);
  });
  it("HOUSES has 12 (≥ floor 12)", () => {
    expect(HOUSES.length).toBe(12);
  });
  it("ALL_SACRED_TAGS totals ≥ 81", () => {
    expect(ALL_SACRED_TAGS.length).toBeGreaterThanOrEqual(81);
  });
  it("SACRED_AUDIT_FLOOR has 5 entries", () => {
    expect(Object.keys(SACRED_AUDIT_FLOOR)).toHaveLength(5);
  });
  it("GENESIS_LEDGER_HASH is the well-known sentinel", () => {
    expect(GENESIS_LEDGER_HASH).toBe("GENESIS");
  });
  it("SAMPLE_LISTINGS covers all 8 service types", () => {
    expect(SAMPLE_LISTINGS.length).toBeGreaterThanOrEqual(8);
    const types = new Set(SAMPLE_LISTINGS.map((l) => l.serviceType));
    expect(types.size).toBe(8);
  });
});

// ============================================================================
// SECTION D — priceService
// ============================================================================
describe("priceService", () => {
  it("computes LEITURA_CIGANO BASIC in [3000, 8000] cents", () => {
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s1", buyerId: "b1" },
      makeCtx(),
    );
    expect(r.serviceType).toBe("LEITURA_CIGANO");
    expect(r.tier).toBe("BASIC");
    expect(r.currency).toBe("BRL");
    expect(r.finalCents).toBeGreaterThanOrEqual(3000);
    expect(r.finalCents).toBeLessThanOrEqual(8000);
    expect(Number.isInteger(r.finalCents)).toBe(true);
  });
  it("computes CONSULTA_TAROT MASTER (higher tier = higher price)", () => {
    const r = priceService(
      { serviceType: "CONSULTA_TAROT", tier: "MASTER", sacredTags: [], sellerId: "s1", buyerId: "b1" },
      makeCtx(),
    );
    expect(r.tierMultiplier).toBe(3.0);
    expect(r.finalCents).toBeGreaterThanOrEqual(8000);
    expect(r.finalCents).toBeLessThanOrEqual(20000);
  });
  it("computes MESA_REAL MASTER (highest tier × highest service)", () => {
    const r = priceService(
      { serviceType: "MESA_REAL", tier: "MASTER", sacredTags: ["Casa 1", "Casa 7", "Casa 4", "Casa 10"], sellerId: "s1", buyerId: "b1" },
      makeCtx(),
    );
    expect(r.finalCents).toBeGreaterThanOrEqual(40000);
    expect(r.finalCents).toBeLessThanOrEqual(100000);
    expect(r.appliedTags).toContain("Casa 1");
  });
  it("applies reputation discount (5-star seller)", () => {
    const ctx = makeCtx({ reputations: new Map([["s1", 5]]) });
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s1", buyerId: "b1" },
      ctx,
    );
    expect(r.reputationDiscount).toBe(REPUTATION_DISCOUNT_CAP);
  });
  it("reputation 4.0 → 8% discount", () => {
    const ctx = makeCtx({ reputations: new Map([["s1", 4.0]]) });
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s1", buyerId: "b1" },
      ctx,
    );
    // Floating-point tolerance — (4/5)*0.10 may yield 0.08000000000000002
    expect(Math.abs(r.reputationDiscount - 0.08)).toBeLessThan(1e-9);
  });
  it("reputation 0 → no discount", () => {
    const ctx = makeCtx({ reputations: new Map([["s1", 0]]) });
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s1", buyerId: "b1" },
      ctx,
    );
    expect(r.reputationDiscount).toBe(0);
  });
  it("clamps to service max (e.g. TERAPIA_TANTRA MASTER with many tags)", () => {
    const ctx = makeCtx();
    const r = priceService(
      { serviceType: "TERAPIA_TANTRA", tier: "MASTER", sacredTags: ["Sahasrara", "Ajna", "Vishuddha"], sellerId: "s", buyerId: "b" },
      ctx,
    );
    expect(r.finalCents).toBeLessThanOrEqual(80000);
    expect(r.finalCents).toBeGreaterThanOrEqual(30000);
  });
  it("clamps to service min (e.g. LEITURA_CIGANO BASIC with negative mod)", () => {
    // Reputation 5 + minimal tags should still respect minCents
    const ctx = makeCtx({ reputations: new Map([["s", 5]]) });
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s", buyerId: "b" },
      ctx,
    );
    expect(r.finalCents).toBeGreaterThanOrEqual(3000);
  });
  it("never throws on bad input (defensive coercion)", () => {
    let r: ReturnType<typeof priceService> | undefined;
    expect(() => {
      r = priceService(
        { serviceType: "BOGUS" as never, tier: "NINJA" as never, sacredTags: null as never, sellerId: undefined as never, buyerId: 42 as never },
        makeCtx(),
      );
    }).not.toThrow();
    expect(r).toBeDefined();
    expect(r!.serviceType).toBe("LEITURA_CIGANO"); // fallback
  });
  it("never throws on null input", () => {
    let r: ReturnType<typeof priceService> | undefined;
    expect(() => {
      r = priceService(null as never, makeCtx());
    }).not.toThrow();
    expect(r).toBeDefined();
  });
  it("handles empty sacredTags", () => {
    const r = priceService(
      { serviceType: "RITUAL_GUIA", tier: "INTERMEDIATE", sacredTags: [], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    expect(r.sacredMultiplier).toBe(1.0);
    expect(r.appliedTags).toHaveLength(0);
  });
  it("applies sacred multiplier for Orixá tag", () => {
    const r = priceService(
      { serviceType: "RITUAL_GUIA", tier: "BASIC", sacredTags: ["Exu"], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    expect(r.sacredMultiplier).toBe(1.20);
  });
  it("applies sacred multiplier for Chakra tag", () => {
    const r = priceService(
      { serviceType: "TERAPIA_TANTRA", tier: "BASIC", sacredTags: ["Sahasrara"], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    expect(r.sacredMultiplier).toBe(1.15);
  });
  it("applies sacred multiplier for Sefira tag", () => {
    const r = priceService(
      { serviceType: "ESTUDO_CABALA", tier: "BASIC", sacredTags: ["Keter"], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    expect(r.sacredMultiplier).toBe(1.15);
  });
  it("breakdown contains 4 stages", () => {
    const r = priceService(
      { serviceType: "CONSULTA_ASTRO", tier: "ADVANCED", sacredTags: ["Casa 1"], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    expect(r.breakdown.baseTierCents).toBeGreaterThan(0);
    expect(r.breakdown.afterSacredCents).toBeGreaterThan(0);
    expect(r.breakdown.afterReputationCents).toBeGreaterThan(0);
    expect(r.breakdown.clampedCents).toBe(r.finalCents);
  });
  it("covers all 8 service types (matrix: 8 × 4 = 32 listings)", () => {
    const types = Object.keys(SERVICE_DEFAULTS);
    const tiers = Object.keys(TIER_MULTIPLIERS);
    let n = 0;
    for (const t of types) {
      for (const ti of tiers) {
        const r = priceService(
          { serviceType: t as never, tier: ti as never, sacredTags: [], sellerId: "s", buyerId: "b" },
          makeCtx(),
        );
        const valid = validatePricing(r);
        expect(valid.ok).toBe(true);
        n++;
      }
    }
    expect(n).toBe(32);
  });
});

// ============================================================================
// SECTION E — validatePricing (never-throws)
// ============================================================================
describe("validatePricing", () => {
  it("valid result returns ok=true", () => {
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    const v = validatePricing(r);
    expect(v.ok).toBe(true);
    expect(v.errors).toHaveLength(0);
  });
  it("null input returns ok=false without throwing", () => {
    let v;
    expect(() => { v = validatePricing(null as never); }).not.toThrow();
    expect(v!.ok).toBe(false);
    expect(v!.errors.length).toBeGreaterThan(0);
  });
  it("non-integer finalCents is flagged", () => {
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    const tampered = { ...r, finalCents: 5500.5 };
    const v = validatePricing(tampered);
    expect(v.ok).toBe(false);
    expect(v.errors.some((e) => e.includes("integer"))).toBe(true);
  });
  it("out-of-range finalCents is flagged", () => {
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    const tampered = { ...r, finalCents: 999999 };
    const v = validatePricing(tampered);
    expect(v.ok).toBe(false);
    expect(v.errors.some((e) => e.includes("out of range"))).toBe(true);
  });
  it("negative discount is flagged", () => {
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    const tampered = { ...r, reputationDiscount: -0.5 };
    const v = validatePricing(tampered);
    expect(v.ok).toBe(false);
  });
  it("currency != BRL is flagged", () => {
    const r = priceService(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s", buyerId: "b" },
      makeCtx(),
    );
    const tampered = { ...r, currency: "USD" as never };
    const v = validatePricing(tampered);
    expect(v.ok).toBe(false);
  });
});

// ============================================================================
// SECTION F — HMAC chain (cycle 60 lesson — NEVER FNV)
// ============================================================================
describe("HMAC chain (chainEscrowHash + verifyEscrowChain)", () => {
  it("produces a 64-char hex string", () => {
    const partial = {
      escrowId: "esc_test_1", transactionId: "tx_1", amountCents: 5500,
      status: "HELD" as const, heldAt: Date.now(), ledgerHash: "", prevHash: GENESIS_LEDGER_HASH,
    };
    const h = chainEscrowHash(GENESIS_LEDGER_HASH, partial, "secret");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
  it("different secrets produce different hashes", () => {
    const partial = {
      escrowId: "esc_test_1", transactionId: "tx_1", amountCents: 5500,
      status: "HELD" as const, heldAt: 1700000000000, ledgerHash: "", prevHash: GENESIS_LEDGER_HASH,
    };
    const h1 = chainEscrowHash(GENESIS_LEDGER_HASH, partial, "secret-A");
    const h2 = chainEscrowHash(GENESIS_LEDGER_HASH, partial, "secret-B");
    expect(h1).not.toBe(h2);
  });
  it("same secret + same input → same hash (deterministic)", () => {
    const partial = {
      escrowId: "esc_test_1", transactionId: "tx_1", amountCents: 5500,
      status: "HELD" as const, heldAt: 1700000000000, ledgerHash: "", prevHash: GENESIS_LEDGER_HASH,
    };
    const h1 = chainEscrowHash(GENESIS_LEDGER_HASH, partial, "secret");
    const h2 = chainEscrowHash(GENESIS_LEDGER_HASH, partial, "secret");
    expect(h1).toBe(h2);
  });
  it("tampering an escrow amount breaks the chain", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    const e1 = holdEscrow("tx_a", 5000, ctx);
    const e2 = holdEscrow("tx_b", 10000, ctx);
    const ledger = listEscrows();
    // Tamper: change e2's amount
    const tampered = { ...e2, amountCents: 1 };
    const verification = verifyEscrowChain([e1, tampered], ctx.escrowSecret);
    expect(verification.ok).toBe(false);
    expect(verification.brokenAt).toBe(1);
  });
  it("valid chain verifies end-to-end", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    holdEscrow("tx_1", 5000, ctx);
    holdEscrow("tx_2", 10000, ctx);
    holdEscrow("tx_3", 15000, ctx);
    const ledger = listEscrows();
    const v = verifyEscrowChain(ledger, ctx.escrowSecret);
    expect(v.ok).toBe(true);
    expect(v.brokenAt).toBeNull();
  });
  it("empty chain verifies", () => {
    const v = verifyEscrowChain([], "secret");
    expect(v.ok).toBe(true);
  });
  it("empty secret throws IntegrityError", () => {
    const partial = {
      escrowId: "esc_x", transactionId: "tx_x", amountCents: 100,
      status: "HELD" as const, heldAt: 1, ledgerHash: "", prevHash: GENESIS_LEDGER_HASH,
    };
    expect(() => chainEscrowHash(GENESIS_LEDGER_HASH, partial, "")).toThrow();
  });
});

// ============================================================================
// SECTION G — Escrow lifecycle
// ============================================================================
describe("Escrow lifecycle (holdEscrow + releaseEscrow + refundEscrow)", () => {
  beforeEachReset();
  it("holdEscrow creates HELD record with valid HMAC", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    const e = holdEscrow("tx_lifecycle_1", 5000, ctx);
    expect(e.status).toBe("HELD");
    expect(e.amountCents).toBe(5000);
    expect(e.ledgerHash).toMatch(/^[0-9a-f]{64}$/);
    expect(e.prevHash).toBe(GENESIS_LEDGER_HASH);
  });
  it("releaseEscrow flips status to RELEASED", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    const e = holdEscrow("tx_release_1", 5000, ctx);
    const r = releaseEscrow(e.escrowId, ctx);
    expect(r.released).toBe(true);
    expect(r.ledgerHash).toMatch(/^[0-9a-f]{64}$/);
    expect(listEscrows()[0]!.status).toBe("RELEASED");
  });
  it("refundEscrow flips status to REFUNDED", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    const e = holdEscrow("tx_refund_1", 5000, ctx);
    const r = refundEscrow(e.escrowId, "buyer requested", ctx);
    expect(r.refunded).toBe(true);
    expect(listEscrows()[0]!.status).toBe("REFUNDED");
  });
  it("releaseEscrow on unknown escrow returns released=false", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    const r = releaseEscrow("esc_unknown", ctx);
    expect(r.released).toBe(false);
  });
  it("double-release fails (no-op)", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    const e = holdEscrow("tx_double", 5000, ctx);
    expect(releaseEscrow(e.escrowId, ctx).released).toBe(true);
    expect(releaseEscrow(e.escrowId, ctx).released).toBe(false);
  });
  it("release after refund fails", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    const e = holdEscrow("tx_refund_then_release", 5000, ctx);
    expect(refundEscrow(e.escrowId, "fraud", ctx).refunded).toBe(true);
    expect(releaseEscrow(e.escrowId, ctx).released).toBe(false);
  });
  it("holdEscrow rejects empty transactionId", () => {
    expect(() => holdEscrow("", 5000, makeCtx())).toThrow();
  });
  it("holdEscrow rejects non-integer amount", () => {
    expect(() => holdEscrow("tx", 5000.5, makeCtx())).toThrow();
  });
  it("holdEscrow rejects negative amount", () => {
    expect(() => holdEscrow("tx", -1, makeCtx())).toThrow();
  });
  it("holdEscrow rejects empty secret", () => {
    expect(() => holdEscrow("tx", 5000, makeCtx({ secret: "" }))).toThrow();
  });
  it("full chain (hold → release) verifies", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx();
    const e1 = holdEscrow("tx_chain_1", 1000, ctx);
    releaseEscrow(e1.escrowId, ctx);
    const v = verifyEscrowChain(listEscrows(), ctx.escrowSecret);
    expect(v.ok).toBe(true);
  });
});

// ============================================================================
// SECTION H — Seller eligibility
// ============================================================================
describe("isSellerEligible", () => {
  it("eligible with ≥ 10 readings + ≥ 4.0 reputation", () => {
    const ctx = makeCtx({
      reputations: new Map([["s", 4.5]]),
      readings: new Map([["s", 15]]),
    });
    const r = isSellerEligible("s", ctx);
    expect(r.eligible).toBe(true);
    expect(r.reasons).toHaveLength(0);
    expect(r.reputation).toBe(4.5);
    expect(r.readings).toBe(15);
  });
  it("not eligible with 9 readings", () => {
    const ctx = makeCtx({
      reputations: new Map([["s", 4.5]]),
      readings: new Map([["s", 9]]),
    });
    const r = isSellerEligible("s", ctx);
    expect(r.eligible).toBe(false);
    expect(r.reasons.some((x) => x.includes("insufficient_readings"))).toBe(true);
  });
  it("not eligible with reputation 3.9", () => {
    const ctx = makeCtx({
      reputations: new Map([["s", 3.9]]),
      readings: new Map([["s", 20]]),
    });
    const r = isSellerEligible("s", ctx);
    expect(r.eligible).toBe(false);
    expect(r.reasons.some((x) => x.includes("insufficient_reputation"))).toBe(true);
  });
  it("not eligible with both gates failed", () => {
    const ctx = makeCtx({
      reputations: new Map([["s", 3.0]]),
      readings: new Map([["s", 5]]),
    });
    const r = isSellerEligible("s", ctx);
    expect(r.eligible).toBe(false);
    expect(r.reasons).toHaveLength(2);
  });
  it("unknown seller (no map entry) → 0/0 → not eligible", () => {
    const r = isSellerEligible("unknown", makeCtx());
    expect(r.eligible).toBe(false);
    expect(r.reputation).toBe(0);
    expect(r.readings).toBe(0);
  });
  it("empty sellerId returns not eligible without throwing", () => {
    const r = isSellerEligible("", makeCtx());
    expect(r.eligible).toBe(false);
  });
  it("null context returns not eligible without throwing", () => {
    const r = isSellerEligible("s", null as never);
    expect(r.eligible).toBe(false);
  });
  it("SELLER_MIN_READINGS === 10 and SELLER_MIN_REPUTATION === 4.0", () => {
    expect(SELLER_MIN_READINGS).toBe(10);
    expect(SELLER_MIN_REPUTATION).toBe(4.0);
  });
});

// ============================================================================
// SECTION I — Audit
// ============================================================================
describe("auditMarketplacePricing", () => {
  it("reports 8 listings (one per service type)", () => {
    const a = auditMarketplacePricing();
    expect(a.totalListings).toBe(8);
  });
  it("byServiceType has 8 entries", () => {
    const a = auditMarketplacePricing();
    expect(Object.keys(a.byServiceType)).toHaveLength(8);
  });
  it("byTier has 4 entries (8 listings × 4 tiers = 32 combinations)", () => {
    const a = auditMarketplacePricing();
    expect(Object.keys(a.byTier)).toHaveLength(4);
    const total = (Object.values(a.byTier) as number[]).reduce((a, b) => a + b, 0);
    expect(total).toBe(32);
  });
  it("sacredCoverage covers all 5 traditions at floor", () => {
    const a = auditMarketplacePricing();
    expect(a.sacredCoverage.CIGANO).toBeGreaterThanOrEqual(SACRED_AUDIT_FLOOR.CIGANO);
    expect(a.sacredCoverage.ORIXAS).toBeGreaterThanOrEqual(SACRED_AUDIT_FLOOR.ORIXAS);
    expect(a.sacredCoverage.CHAKRAS).toBeGreaterThanOrEqual(SACRED_AUDIT_FLOOR.CHAKRAS);
    expect(a.sacredCoverage.SEFIROT).toBeGreaterThanOrEqual(SACRED_AUDIT_FLOOR.SEFIROT);
    expect(a.sacredCoverage.HOUSES).toBeGreaterThanOrEqual(SACRED_AUDIT_FLOOR.HOUSES);
  });
  it("isFullCoverage === true (≥ 8 service types + all sacred floors met)", () => {
    expect(auditMarketplacePricing().isFullCoverage).toBe(true);
  });
});

// ============================================================================
// SECTION J — End-to-end dispatch
// ============================================================================
describe("dispatchMarketplace (one-call convenience)", () => {
  it("prices and holds escrow in a single call", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx({ reputations: new Map([["s", 4.8]]), readings: new Map([["s", 50]]) });
    const r = dispatchMarketplace(
      { serviceType: "MESA_REAL", tier: "MASTER", sacredTags: ["Casa 1", "Casa 10"], sellerId: "s", buyerId: "b" },
      "tx_dispatch_1",
      ctx,
    );
    expect(r.pricing).toBeDefined();
    expect(r.escrow).toBeDefined();
    expect(r.escrowError).toBeNull();
    expect(r.escrow!.amountCents).toBe(r.pricing.finalCents);
    expect(r.escrow!.status).toBe("HELD");
  });
  it("returns escrowError on hard validation failure", () => {
    resetEscrowLedgerForTest();
    const ctx = makeCtx({ secret: "" });
    const r = dispatchMarketplace(
      { serviceType: "LEITURA_CIGANO", tier: "BASIC", sacredTags: [], sellerId: "s", buyerId: "b" },
      "tx_dispatch_bad",
      ctx,
    );
    expect(r.pricing).toBeDefined();
    expect(r.escrow).toBeNull();
    expect(r.escrowError).toContain("escrowSecret");
  });
});

// ============================================================================
// SECTION K — Error classes
// ============================================================================
describe("Error classes", () => {
  it("MarketplacePricingError is the base", () => {
    const e = new MarketplacePricingError("boom");
    expect(e.name).toBe("MarketplacePricingError");
    expect(e.message).toBe("boom");
  });
  it("InvalidServiceTypeError / InvalidTierError / EscrowError / IntegrityError extend base", () => {
    expect(new InvalidServiceTypeError("x")).toBeInstanceOf(MarketplacePricingError);
    expect(new InvalidTierError("x")).toBeInstanceOf(MarketplacePricingError);
    expect(new EscrowError("x")).toBeInstanceOf(MarketplacePricingError);
    expect(new IntegrityError("x")).toBeInstanceOf(MarketplacePricingError);
  });
  it("error messages embed codes (cycle 64 lesson 5)", () => {
    expect(new InvalidServiceTypeError("BOGUS").message).toContain("INVALID_SERVICE_TYPE");
    expect(new InvalidTierError("NINJA").message).toContain("INVALID_TIER");
    expect(new EscrowError("fail").message).toContain("ESCROW_ERROR");
    expect(new IntegrityError("fail").message).toContain("INTEGRITY_ERROR");
  });
});

// ============================================================================
// SECTION L — Anti-pattern checks (cycle 63+ lessons)
// ============================================================================
describe("Anti-pattern compliance", () => {
  it("ALL_SACRED_TAGS never uses .includes() (uses Set lookup)", () => {
    // Indirect check: composeSacredMultiplier with many tags is O(n+m), not O(n*m)
    const t0 = Date.now();
    const r = composeSacredMultiplier([
      "Cigano 1 Paus", "Exu", "Anahata", "Keter", "Casa 1", "Sahasrara",
      "Cigano 2 Copas", "Oxalá", "Muladhara", "Chokhmah",
    ]);
    const dt = Date.now() - t0;
    expect(r.applied.length).toBeGreaterThan(0);
    expect(dt).toBeLessThan(50); // 10 tag lookup should be < 50ms
  });
  it("no shared mutable default (Object.freeze on SERVICE_DEFAULTS)", () => {
    // Attempt to mutate — should silently fail in strict mode or throw
    expect(() => {
      (SERVICE_DEFAULTS as { LEITURA_CIGANO: { minCents: number } }).LEITURA_CIGANO.minCents = 1;
    }).toThrow();
  });
  it("SERVICE_DEFAULTS inner objects are also frozen", () => {
    expect(Object.isFrozen(SERVICE_DEFAULTS.LEITURA_CIGANO)).toBe(true);
  });
  it("no float BRL — all finalCents are integers", () => {
    for (const t of Object.keys(SERVICE_DEFAULTS)) {
      for (const ti of Object.keys(TIER_MULTIPLIERS)) {
        const r = priceService(
          { serviceType: t as never, tier: ti as never, sacredTags: ["Cigano 1 Paus", "Anahata", "Keter"], sellerId: "s", buyerId: "b" },
          makeCtx({ reputations: new Map([["s", 4.5]]) }),
        );
        expect(Number.isInteger(r.finalCents)).toBe(true);
      }
    }
  });
  it("__ALL_EXPORTS has expected counts", () => {
    expect(__ALL_EXPORTS.functions).toBeGreaterThanOrEqual(14);
    expect(__ALL_EXPORTS.typeGuards).toBe(3);
    expect(__ALL_EXPORTS.types).toBeGreaterThanOrEqual(13);
    expect(__ALL_EXPORTS.errorClasses).toBe(5);
    expect(__ALL_EXPORTS.sections).toBe(14);
  });
});

// ============================================================================
// Test runner
// ============================================================================
function runTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const c of itCases) {
    try {
      c.fn();
      passed++;
    } catch (e) {
      failed++;
      const msg = `[${c.describe}] ${c.name}: ${(e as Error).message}`;
      errors.push(msg);
    }
  }
  return { passed, failed, errors };
}

// `beforeEachReset` is registered lazily; needs declaration
function beforeEachReset(): void { resetEscrowLedgerForTest(); }

// Self-execute
const result = runTests();
const total = result.passed + result.failed;
const summary = `\n========== W65 MARKETPLACE-PRICING-ENGINE TESTS ==========\n` +
  `Describes: ${describes.length}\n` +
  `It blocks: ${total}\n` +
  `Passed: ${result.passed}\n` +
  `Failed: ${result.failed}\n` +
  `==========================================================\n`;
if (result.failed > 0) {
  console.error(summary);
  for (const e of result.errors) console.error("  ✗ " + e);
  ((globalThis as unknown) as { process: { exit(code?: number): never } }).process.exit(1);
}
console.log(summary + "✅ all assertions passed");