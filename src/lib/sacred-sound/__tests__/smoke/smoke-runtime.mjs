// ============================================================================
// SACRED SOUND — SMOKE RUNTIME (.mjs — no vitest binary required)
// ============================================================================
// Cycle 60+ lesson 6: dynamic import() of file: URL MUST NOT be wrapped in
// pathToFileURL — file: URL is already valid.
// Cycle 69 pattern confirmed.
// ============================================================================

import { buildHarness } from "../harness.ts";

const SPECS = [
  { name: "frequencies", fn: (await import("../frequencies.spec.ts")).runFrequenciesSpec },
  { name: "mantras", fn: (await import("../mantras.spec.ts")).runMantrasSpec },
  { name: "play-session", fn: (await import("../play-session.spec.ts")).runPlaySessionSpec },
  { name: "healing-protocol", fn: (await import("../healing-protocol.spec.ts")).runHealingProtocolSpec },
];

let totalPassed = 0;
let totalFailed = 0;
let totalAssertions = 0;
const failures = [];

const sectionHeader = (n, name) => console.log(`\n=== [${n}] ${name} ===`);

async function main() {
  let idx = 1;

  // ----- 1. SPEC AGGREGATION -----
  sectionHeader(idx++, "SPEC AGGREGATION");
  for (const spec of SPECS) {
    const h = buildHarness();
    try {
      await spec.fn(h);
      const passed = h.results.filter((r) => r.passed).length;
      const failed = h.results.filter((r) => !r.passed).length;
      totalPassed += passed;
      totalFailed += failed;
      totalAssertions += h.results.length;
      console.log(`  ✓ ${spec.name}: ${passed}/${h.results.length} passed (${failed} failed)`);
      for (const r of h.results.filter((x) => !x.passed)) {
        failures.push(`[${spec.name}] ${r.name}: ${r.error}`);
      }
    } catch (e) {
      totalFailed++;
      failures.push(`[${spec.name}] LOAD ERROR: ${e instanceof Error ? e.message : String(e)}`);
      console.log(`  ✗ ${spec.name}: LOAD ERROR — ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // ----- 2. CATALOG ASSERTIONS -----
  sectionHeader(idx++, "CATALOG ASSERTIONS");
  const { assertCatalogCoverage, mantraCount, auditMantraCatalog } = await import("../../mantras.ts");
  console.log(`  ✓ assertCatalogCoverage() did not throw`);
  assertCatalogCoverage();
  console.log(`  ✓ mantraCount() = ${mantraCount()}`);
  if (mantraCount() < 100) failures.push("mantraCount < 100");
  const aMantra = auditMantraCatalog();
  console.log(`  ✓ auditMantraCatalog: total=${aMantra.total}, traditions=`, JSON.stringify(aMantra.byTradition));
  for (const t of ["cigano", "tarot", "astrologia", "numerologia", "cabala", "orixas", "tantra"]) {
    if (aMantra.byTradition[t] < 12) failures.push(`tradition ${t} has ${aMantra.byTradition[t]} < 12`);
  }

  // ----- 3. FREQUENCY CATALOG -----
  sectionHeader(idx++, "FREQUENCY CATALOG");
  const { SOLFEGGIO_FREQUENCIES, CHAKRA_FREQUENCIES, CUSTOM_FREQUENCIES, auditFrequencyCatalog } = await import("../../frequencies.ts");
  console.log(`  ✓ Solfeggio count = ${Object.keys(SOLFEGGIO_FREQUENCIES).length}`);
  console.log(`  ✓ Chakra count = ${Object.keys(CHAKRA_FREQUENCIES).length}`);
  console.log(`  ✓ Custom count = ${Object.keys(CUSTOM_FREQUENCIES).length}`);
  const aFreq = auditFrequencyCatalog();
  console.log(`  ✓ auditFrequencyCatalog: total=${aFreq.total}`);
  if (aFreq.total < 12) failures.push("frequency total < 12");
  console.log(`  ✓ Solfeggio 528Hz = ${SOLFEGGIO_FREQUENCIES["528"].name}`);

  // ----- 4. PROTOCOL CATALOG -----
  sectionHeader(idx++, "PROTOCOL CATALOG");
  const { protocolCount, auditProtocolCatalog, recommendProtocol } = await import("../../healing-protocol.ts");
  console.log(`  ✓ protocolCount = ${protocolCount()}`);
  if (protocolCount() < 20) failures.push("protocolCount < 20");
  const aProto = auditProtocolCatalog();
  console.log(`  ✓ auditProtocolCatalog: total=${aProto.total}, traditions=`, JSON.stringify(aProto.byTradition));

  // ----- 5. PLAY SESSION END-TO-END -----
  sectionHeader(idx++, "PLAY SESSION END-TO-END");
  const { buildSession, validateSession, getTotalDuration, exportSessionAsJson } = await import("../../play-session.ts");
  const sess = buildSession({
    userId: "smoke-user-001",
    intention: "healing",
    duration: 600,
    includeMantras: true,
  });
  console.log(`  ✓ session.id = ${sess.id}`);
  console.log(`  ✓ session.steps = ${sess.steps.length}, totalSeconds = ${sess.totalDurationSeconds}`);
  const v = validateSession(sess);
  console.log(`  ✓ validateSession = ${v.valid ? "VALID" : "INVALID: " + v.errors.join(", ")}`);
  if (!v.valid) failures.push("validateSession invalid: " + v.errors.join("; "));
  const ms = getTotalDuration(sess);
  console.log(`  ✓ getTotalDuration = ${ms}ms`);
  const json = exportSessionAsJson(sess);
  console.log(`  ✓ exportSessionAsJson length = ${json.length} chars`);
  const parsed = JSON.parse(json);
  if (parsed.id !== sess.id) failures.push("JSON roundtrip id mismatch");

  // ----- 6. RECOMMENDATION ENGINE SMOKE -----
  sectionHeader(idx++, "RECOMMENDATION ENGINE SMOKE");
  const recs1 = recommendProtocol({ currentEmotion: "anxiety" });
  console.log(`  ✓ anxiety → ${recs1.length} protocols (top: ${recs1[0]?.condition})`);
  if (recs1.length === 0 || recs1[0].condition !== "anxiety") failures.push("anxiety top protocol wrong");
  const recs2 = recommendProtocol({ currentEmotion: "insomnia" });
  console.log(`  ✓ insomnia → ${recs2.length} protocols (top: ${recs2[0]?.condition})`);
  if (recs2.length === 0 || recs2[0].condition !== "insomnia") failures.push("insomnia top protocol wrong");
  const recs3 = recommendProtocol({});
  console.log(`  ✓ empty state → ${recs3.length} protocols`);

  // ----- 7. CUSTOM PROTOCOL SMOKE -----
  sectionHeader(idx++, "CUSTOM PROTOCOL SMOKE");
  const { customProtocol } = await import("../../healing-protocol.ts");
  const custom = customProtocol({
    condition: "anxiety",
    frequencies: ["528hz", "285hz"],
    mantras: ["tan-011", "cab-003"],
    duration: 1200,
    tradition: "cabala",
    citation: "Smoke test",
  });
  console.log(`  ✓ custom protocol.id = ${custom.id}`);
  console.log(`  ✓ custom protocol.frequencies = ${custom.frequencies.join(", ")}`);
  console.log(`  ✓ custom protocol.mantras = ${custom.mantras.join(", ")}`);

  // ----- 8. FREEZE INVARIANTS -----
  sectionHeader(idx++, "FREEZE INVARIANTS");
  console.log(`  ✓ SOLFEGGIO_FREQUENCIES isFrozen = ${Object.isFrozen(SOLFEGGIO_FREQUENCIES)}`);
  console.log(`  ✓ CHAKRA_FREQUENCIES isFrozen = ${Object.isFrozen(CHAKRA_FREQUENCIES)}`);
  console.log(`  ✓ CUSTOM_FREQUENCIES isFrozen = ${Object.isFrozen(CUSTOM_FREQUENCIES)}`);
  const { MANTRAS, PROTOCOLS } = await import("../../index.ts");
  console.log(`  ✓ MANTRAS isFrozen = ${Object.isFrozen(MANTRAS)}`);
  console.log(`  ✓ PROTOCOLS isFrozen = ${Object.isFrozen(PROTOCOLS)}`);

  // ----- 9. BREATHING PATTERNS SMOKE -----
  sectionHeader(idx++, "BREATHING PATTERNS");
  const { getBreathingPattern } = await import("../../play-session.ts");
  for (const t of ["tantra", "cabala", "numerologia", "cigano", "orixas", "astrologia", "tarot"]) {
    const p = getBreathingPattern(t);
    console.log(`  ✓ ${t}: ${p.name} (${p.inhaleSeconds}-${p.holdSeconds}-${p.exhaleSeconds})`);
  }

  // ----- 10. FINAL SUMMARY -----
  sectionHeader(idx++, "FINAL SUMMARY");
  console.log(`  Total assertions: ${totalAssertions}`);
  console.log(`  Total passed: ${totalPassed}`);
  console.log(`  Total failed: ${totalFailed}`);
  console.log(`  Sections: ${idx - 1}`);
  if (failures.length === 0) {
    console.log(`\n  ✅ ALL ${idx - 1} SECTIONS GREEN — Sacred Sound Engine smoke PASSED\n`);
    process.exit(0);
  } else {
    console.log(`\n  ❌ ${failures.length} FAILURE(S):`);
    for (const f of failures) console.log(`    - ${f}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(2);
});