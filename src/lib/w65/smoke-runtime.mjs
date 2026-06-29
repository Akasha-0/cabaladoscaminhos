/**
 * smoke-runtime.mjs — runtime smoke test (6/6 scenarios)
 *
 * Runs via `node src/lib/w65/smoke-runtime.mjs` (after tsc strip-types compile).
 * Validates the 6 critical paths end-to-end against real engine code.
 */
import {
  priceService,
  holdEscrow,
  releaseEscrow,
  refundEscrow,
  isSellerEligible,
  auditMarketplacePricing,
  validatePricing,
  chainEscrowHash,
  verifyEscrowChain,
  resetEscrowLedgerForTest,
  dispatchMarketplace,
  GENESIS_LEDGER_HASH,
  CIGANO_CARDS,
  ORIXAS,
  CHAKRAS,
  SEFIROT,
  HOUSES,
  SELLER_MIN_READINGS,
  SELLER_MIN_REPUTATION,
} from "./marketplace-pricing-engine.ts";

let passed = 0;
let failed = 0;
const errors = [];

function check(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`);
    failed++;
    errors.push(name + ": " + e.message);
  }
}

const ctx = (reps = new Map(), reads = new Map()) => ({
  escrowSecret: "smoke-secret-w65",
  reputationByUser: reps,
  readingsCountByUser: reads,
});

console.log("\n=== W65 marketplace-pricing-engine smoke 6/6 ===");

// Smoke 1: pricing across all 8 service types × 4 tiers
check("smoke-1: priceService computes valid integer cents for 8×4 matrix", () => {
  const types = ["LEITURA_CIGANO", "CONSULTA_TAROT", "MENTORIA_ESPIRITUAL", "RITUAL_GUIA", "MESA_REAL", "CONSULTA_ASTRO", "ESTUDO_CABALA", "TERAPIA_TANTRA"];
  const tiers = ["BASIC", "INTERMEDIATE", "ADVANCED", "MASTER"];
  let n = 0;
  for (const t of types) for (const ti of tiers) {
    const r = priceService({ serviceType: t, tier: ti, sacredTags: ["Cigano 1 Paus"], sellerId: "s", buyerId: "b" }, ctx());
    if (!Number.isInteger(r.finalCents)) throw new Error(`non-integer cents for ${t}/${ti}: ${r.finalCents}`);
    const v = validatePricing(r);
    if (!v.ok) throw new Error(`validatePricing failed for ${t}/${ti}: ${v.errors.join(";")}`);
    n++;
  }
  if (n !== 32) throw new Error(`expected 32, got ${n}`);
});

// Smoke 2: HMAC chain genesis → hold → release → verify
check("smoke-2: HMAC chain holds, releases, verifies end-to-end", () => {
  resetEscrowLedgerForTest();
  const c = ctx();
  const e1 = holdEscrow("tx_smoke_a", 5500, c);
  if (e1.prevHash !== GENESIS_LEDGER_HASH) throw new Error("e1.prevHash should be GENESIS");
  if (!/^[0-9a-f]{64}$/.test(e1.ledgerHash)) throw new Error("e1.ledgerHash invalid hex");
  const r1 = releaseEscrow(e1.escrowId, c);
  if (!r1.released) throw new Error("release failed");
  const e2 = holdEscrow("tx_smoke_b", 10000, c);
  if (e2.prevHash !== r1.ledgerHash) throw new Error("e2.prevHash should be r1.ledgerHash");
  const v = verifyEscrowChain([{ ...e1, ledgerHash: r1.ledgerHash, status: "RELEASED" }, e2], c.escrowSecret);
  if (!v.ok) throw new Error(`verify failed: ${v.reason} @ ${v.brokenAt}`);
});

// Smoke 3: refund with reason + escrow ledger integrity
check("smoke-3: refundEscrow with reason flips status to REFUNDED + chain still verifies", () => {
  resetEscrowLedgerForTest();
  const c = ctx();
  const e = holdEscrow("tx_smoke_refund", 8000, c);
  const r = refundEscrow(e.escrowId, "buyer requested", c);
  if (!r.refunded) throw new Error("refund failed");
  if (e.status !== "HELD") throw new Error("e1 should be HELD before refund");
  const v = verifyEscrowChain([{ ...e, ledgerHash: r.ledgerHash, status: "REFUNDED" }], c.escrowSecret);
  if (!v.ok) throw new Error(`verify failed: ${v.reason} @ ${v.brokenAt}`);
});

// Smoke 4: seller eligibility gates (≥10 readings + ≥4.0 reputation)
check("smoke-4: isSellerEligible gates correctly on ≥10 + ≥4.0", () => {
  const ok = isSellerEligible("ok_seller", ctx(new Map([["ok_seller", 4.5]]), new Map([["ok_seller", 15]])));
  if (!ok.eligible) throw new Error("ok_seller should be eligible");
  const lowReads = isSellerEligible("low_seller", ctx(new Map([["low_seller", 4.5]]), new Map([["low_seller", 5]])));
  if (lowReads.eligible) throw new Error("low_seller should NOT be eligible");
  const lowRep = isSellerEligible("rep_seller", ctx(new Map([["rep_seller", 3.5]]), new Map([["rep_seller", 15]])));
  if (lowRep.eligible) throw new Error("rep_seller should NOT be eligible");
  if (SELLER_MIN_READINGS !== 10) throw new Error("SELLER_MIN_READINGS drift");
  if (SELLER_MIN_REPUTATION !== 4.0) throw new Error("SELLER_MIN_REPUTATION drift");
});

// Smoke 5: audit + sacred coverage
check("smoke-5: auditMarketplacePricing reports full coverage (≥ 8 + 5 sacred floors)", () => {
  const a = auditMarketplacePricing();
  if (a.totalListings < 8) throw new Error(`totalListings too low: ${a.totalListings}`);
  if (!a.isFullCoverage) throw new Error("isFullCoverage should be true");
  const total = CIGANO_CARDS.length + ORIXAS.length + CHAKRAS.length + SEFIROT.length + HOUSES.length;
  if (total < 81) throw new Error(`sacred coverage too low: ${total} (floor 81)`);
});

// Smoke 6: end-to-end dispatch (price + escrow in one call)
check("smoke-6: dispatchMarketplace prices + holds in single call", () => {
  resetEscrowLedgerForTest();
  const c = ctx(new Map([["seller_x", 4.8]]), new Map([["seller_x", 50]]));
  const r = dispatchMarketplace(
    { serviceType: "MESA_REAL", tier: "MASTER", sacredTags: ["Casa 1", "Casa 4"], sellerId: "seller_x", buyerId: "buyer_x" },
    "tx_smoke_dispatch",
    c,
  );
  if (!r.pricing) throw new Error("pricing missing");
  if (!r.escrow) throw new Error("escrow missing");
  if (r.escrowError) throw new Error("escrowError: " + r.escrowError);
  if (r.escrow.amountCents !== r.pricing.finalCents) throw new Error("escrow amount != price");
  if (r.escrow.status !== "HELD") throw new Error("escrow status not HELD");
});

console.log(`\n=== smoke result: ${passed}/6 passed ===`);
if (failed > 0) {
  for (const e of errors) console.log("  - " + e);
  process.exit(1);
}
console.log("✅ all 6 smoke scenarios PASS");