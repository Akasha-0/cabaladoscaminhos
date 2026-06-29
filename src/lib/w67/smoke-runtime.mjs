// src/lib/w67/smoke-runtime.mjs
// Cycle 67 Worker A — CIGANO SPREAD VISUALIZER smoke harness
// Self-running via `node --experimental-strip-types smoke-runtime.mjs`.
// Validates: buildGrid, highlightSacred, gridToA11y, validateGrid,
// chainGridHash, auditGridCoverage.

import {
  CIGANO_DECK,
  GRID_LAYOUTS,
  buildGrid,
  highlightSacred,
  gridToA11y,
  validateGrid,
  chainGridHash,
  auditGridCoverage,
  verifyChainGridHash,
  toSacredTagSet,
  toCiganoCardIdFromNumber,
  normalizeSeed,
  shuffleForLayout,
  meaningsByCard,
  sacredTagsForTradition,
  redactSacredInString,
  safeFirstSacredConcept,
  REDACTED_PLACEHOLDER,
  SACRED_SYM_TOTAL,
} from "./cigano-spread-visualizer.ts";

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(msg);
    console.error("  ❌", msg);
  }
}

function assertEq(actual, expected, msg) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    failures.push(`${msg} (expected=${expected}, got=${actual})`);
    console.error(`  ❌ ${msg} (expected=${expected}, got=${actual})`);
  }
}

console.log("=== Cigano Spread Visualizer — smoke ===");

// ---- smoke-1: buildGrid deterministic + correct size ----
{
  const a = buildGrid("smoke-seed-1", GRID_LAYOUTS.STANDARD_6X6);
  const b = buildGrid("smoke-seed-1", GRID_LAYOUTS.STANDARD_6X6);
  assertEq(a.length, 36, "smoke-1 buildGrid STANDARD_6X6 returns 36");
  assertEq(
    a.map((p) => p.cardId).join(","),
    b.map((p) => p.cardId).join(","),
    "smoke-1 buildGrid deterministic on same seed"
  );
  console.log("✅ smoke-1: buildGrid (deterministic + 36 slots)");
}

// ---- smoke-2: highlightSacred applies highlight levels ----
{
  const grid = buildGrid("smoke-seed-2", GRID_LAYOUTS.STANDARD_6X6);
  const set = toSacredTagSet(["oxala", "ogum", "kether", "aries"]);
  const out = highlightSacred(grid, set);
  assertEq(out.length, grid.length, "smoke-2 highlightSacred preserves length");
  const levels = new Set(out.map((p) => p.highlightLevel ?? "none"));
  assert(levels.size > 1, "smoke-2 highlightSacred produces varied levels");
  console.log("✅ smoke-2: highlightSacred (varied highlight levels)");
}

// ---- smoke-3: gridToA11y builds pt-BR lines ----
{
  const grid = buildGrid("smoke-seed-3", GRID_LAYOUTS.LINE_OF_5);
  const desc = gridToA11y(grid);
  assertEq(desc.lines.length, 5, "smoke-3 gridToA11y lines.length === 5");
  assert(desc.lines[0].startsWith("Linha"), "smoke-3 gridToA11y line starts with 'Linha'");
  console.log("✅ smoke-3: gridToA11y (5 pt-BR lines)");
}

// ---- smoke-4: validateGrid accepts valid and rejects invalid ----
{
  const grid = buildGrid("smoke-seed-4", GRID_LAYOUTS.LINE_OF_5);
  const valid = validateGrid(grid);
  assertEq(valid.ok, true, "smoke-4 validateGrid(standard 5-slot) === ok");

  const empty = validateGrid([]);
  assertEq(empty.ok, false, "smoke-4 validateGrid([]) === not-ok");
  console.log("✅ smoke-4: validateGrid (accepts valid, rejects empty)");
}

// ---- smoke-5: chainGridHash HMAC + verifyChainGridHash ----
{
  const grid = buildGrid("smoke-seed-5", GRID_LAYOUTS.STANDARD_6X6);
  const chain = chainGridHash(grid, "smoke-seed-5");
  assertEq(chain.length, 36, "smoke-5 chainGridHash has 36 entries");
  // Verify HMAC-SHA256 length (64 hex chars)
  assertEq(chain[0].hash.length, 64, "smoke-5 hash is 64-char hex (SHA-256)");
  assert(verifyChainGridHash(chain, "smoke-seed-5", grid), "smoke-5 verifyChainGridHash accepts");
  console.log("✅ smoke-5: chainGridHash (HMAC + verify OK)");
}

// ---- smoke-6: auditGridCoverage isFullCoverage === true ----
{
  const audit = auditGridCoverage();
  assertEq(audit.cigano, 36, "smoke-6 auditGridCoverage.cigano === 36");
  assertEq(audit.orixas, 16, "smoke-6 auditGridCoverage.orixas === 16");
  assertEq(audit.sefirot, 10, "smoke-6 auditGridCoverage.sefirot === 10");
  assertEq(audit.astrologia, 12, "smoke-6 auditGridCoverage.astrologia === 12");
  assertEq(audit.chakras, 7, "smoke-6 auditGridCoverage.chakras === 7");
  assertEq(audit.total, 81, "smoke-6 auditGridCoverage.total === 81");
  assertEq(audit.isFullCoverage, true, "smoke-6 auditGridCoverage.isFullCoverage === true");
  console.log("✅ smoke-6: auditGridCoverage (5 traditions, 81 symbols, isFullCoverage=true)");
}

// ---- Bonus smoke-7: HMAC sensitivity + sacred redaction + sacred helpers ----
{
  const a = chainGridHash(
    buildGrid("smoke-7", GRID_LAYOUTS.LINE_OF_5),
    "alpha"
  );
  const b = chainGridHash(
    buildGrid("smoke-7", GRID_LAYOUTS.LINE_OF_5),
    "beta"
  );
  assert(a[0].hash !== b[0].hash, "smoke-7 chain hash is seed-sensitive");

  const redacted = redactSacredInString("Mensagem sobre Oxalá e Ogum");
  assert(redacted.includes(REDACTED_PLACEHOLDER), "smoke-7 redactSacredInString applies placeholder");
  assert(!redacted.toLowerCase().includes("oxalá"), "smoke-7 redact does not leak raw Oxalá");

  const concept = safeFirstSacredConcept("Consulta sobre Ogum");
  assert(concept !== null, "smoke-7 safeFirstSacredConcept finds term");
  assert(concept.includes("***"), "smoke-7 safeFirstSacredConcept returns redacted prefix");

  const tags = sacredTagsForTradition("chakras");
  assertEq(tags.tags.length, 7, "smoke-7 sacredTagsForTradition(chakras) returns 7");

  assertEq(SACRED_SYM_TOTAL, 81, "smoke-7 SACRED_SYM_TOTAL === 81");
  console.log("✅ smoke-7: HMAC sensitivity + sacred redaction + helpers");
}

console.log("");
console.log(`=== Total: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  console.error("Failures:");
  for (const f of failures) console.error("  -", f);
  process.exit(1);
} else {
  console.log("All smoke checks passed ✓");
  process.exit(0);
}
