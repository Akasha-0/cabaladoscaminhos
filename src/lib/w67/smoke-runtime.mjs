// =============================================================================
// smoke-runtime.mjs — Cycle 67 Worker D
// Self-running harness via `node --experimental-strip-types`.
// Exercises 8 mandatory paths + 1 audit gate.
// =============================================================================

import {
  detectSacredTerms,
  rankByConfidence,
  linkifyText,
  validateAutoLinkCoverage,
  chainAutoLinkHash,
  auditAutoLinkerCoverage,
  filterByTradition,
  redactSacredTermsForLGPD,
  sanitizeForSacredScan,
  toSacredTermHit,
  toGlossarySlug,
  verifyAutoLinkHash,
  emptyLinkifyResult,
  CONFIDENCE_THRESHOLDS,
} from "./sacred-symbol-autolinker.ts";

let passed = 0;
let failed = 0;
const failures = [];

const check = (name, cond, detail) => {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push({ name, detail });
    console.log(`  ✗ ${name} — ${detail ?? "failed"}`);
  }
};

// ---------------------------------------------------------------------------
console.log("\n[1] detectSacredTerms — finds Oxalá + Ogum + Kether in multi-term text");
// ---------------------------------------------------------------------------
{
  const text = "Oxalá e Ogum caminham juntos em Kether.";
  const hits = detectSacredTerms(text);
  check("returns ≥3 hits", hits.length >= 3, `got ${hits.length}`);
  const trads = new Set(hits.map((h) => h.tradition));
  check("hits orixas + sefirot", trads.has("orixas") && trads.has("sefirot"));
  check("all have lookaroundBoundary=true", hits.every((h) => h.lookaroundBoundary));
}

// ---------------------------------------------------------------------------
console.log("\n[2] rankByConfidence — highest confidence first");
// ---------------------------------------------------------------------------
{
  const hits = [
    toSacredTermHit("Oxalá", "Oxalá", 10, "orixas", toGlossarySlug("/a"), 0.7, true, "partial"),
    toSacredTermHit("O Sol", "O Sol", 20, "cigano", toGlossarySlug("/b"), 1.0, true, "exact"),
  ];
  const ranked = rankByConfidence(hits);
  check("highest confidence first", ranked[0].confidence === 1.0);
  check("ranked[0] is O Sol", ranked[0].term === "O Sol");
}

// ---------------------------------------------------------------------------
console.log("\n[3] linkifyText — emits text + link segments");
// ---------------------------------------------------------------------------
{
  const text = "Ogum, abre os caminhos.";
  const hits = detectSacredTerms(text);
  const segs = linkifyText(text, hits);
  check("emits ≥2 segments", segs.length >= 2, `got ${segs.length}`);
  const link = segs.find((s) => s.type === "link");
  check("contains a link segment", !!link);
  if (link && link.type === "link") {
    check("link content is Ogum", link.content === "Ogum");
    check("linkData.tradition is orixas", link.linkData.tradition === "orixas");
  }
}

// ---------------------------------------------------------------------------
console.log("\n[4] validateAutoLinkCoverage — never-throws, ok:true for valid hits");
// ---------------------------------------------------------------------------
{
  const hits = detectSacredTerms("Oxalá guia.");
  const r = validateAutoLinkCoverage(hits);
  check("ok=true for valid hits", r.ok === true, JSON.stringify(r.errors));
  const r2 = validateAutoLinkCoverage("garbage");
  check("ok=false on garbage (no throw)", r2.ok === false);
}

// ---------------------------------------------------------------------------
console.log("\n[5] chainAutoLinkHash — 64-char hex HMAC-SHA256");
// ---------------------------------------------------------------------------
{
  const hits = detectSacredTerms("Oxalá guia.");
  const hash = chainAutoLinkHash("Oxalá guia.", hits, "k");
  check("hash is 64-char hex", /^[0-9a-f]{64}$/.test(hash), `got ${hash}`);
  check("deterministic", chainAutoLinkHash("Oxalá guia.", hits, "k") === hash);
  const tampered = hash.substring(0, 63) + "0";
  check("verifyAutoLinkHash detects tampered", verifyAutoLinkHash("Oxalá guia.", hits, tampered, "k") === false);
}

// ---------------------------------------------------------------------------
console.log("\n[6] auditAutoLinkerCoverage — 141 symbols across 8 traditions");
// ---------------------------------------------------------------------------
{
  const r = auditAutoLinkerCoverage();
  check("total ≥ 141", r.total >= 141, `got ${r.total}`);
  check("isFullCoverage=true", r.isFullCoverage === true);
  check("missing=[]", r.missing.length === 0);
  check("cigano=36", r.cigano === 36);
  check("orixas=16", r.orixas === 16);
  check("tarot=22", r.tarot === 22);
  check("sefirot=10", r.sefirot === 10);
  check("chakras=7", r.chakras === 7);
  check("astrologia=12", r.astrologia === 12);
  check("hebrew=22", r.hebrew === 22);
  check("ifa=16", r.ifa === 16);
}

// ---------------------------------------------------------------------------
console.log("\n[7] filterByTradition — orixas only");
// ---------------------------------------------------------------------------
{
  const hits = detectSacredTerms("Oxalá e Ogum em Kether sobre Anahata.");
  const orixas = filterByTradition(hits, ["orixas"]);
  check("all results are orixas", orixas.every((h) => h.tradition === "orixas"));
  check("≥1 result", orixas.length >= 1);
}

// ---------------------------------------------------------------------------
console.log("\n[8] redactSacredTermsForLGPD — opt-in redaction (cycle 60 lesson C-5)");
// ---------------------------------------------------------------------------
{
  const text = "Oxalá guia meu caminho.";
  const hits = detectSacredTerms(text);
  const optOut = redactSacredTermsForLGPD(text, hits);
  check("opt-out returns text unchanged", optOut === text);
  const optIn = redactSacredTermsForLGPD(text, hits, true);
  check("opt-in contains [sacred-redacted]", optIn.includes("[sacred-redacted]"));
  check("opt-in does NOT contain Oxalá", !optIn.includes("Oxalá"));
}

// ---------------------------------------------------------------------------
console.log("\n[9] EXTRA — sanitizeForSacredScan redacts emails before detect (cycle 62)");
// ---------------------------------------------------------------------------
{
  const text = "Escrevi para teste@x.com.br sobre Oxalá.";
  const sanitized = sanitizeForSacredScan(text);
  check("sanitized contains [email-redacted]", sanitized.includes("[email-redacted]"));
  const hits = detectSacredTerms(sanitized);
  check("still detects Oxalá after sanitize", hits.some((h) => h.term === "Oxalá"));
}

// ---------------------------------------------------------------------------
console.log("\n[10] EXTRA — emptyLinkifyResult + toGlossarySlug + toSacredTermHit");
// ---------------------------------------------------------------------------
{
  const a = emptyLinkifyResult();
  const b = emptyLinkifyResult();
  check("emptyLinkifyResult returns fresh arrays", a !== b && a.length === 0);
  const slug = toGlossarySlug("/x");
  check("toGlossarySlug round-trips", slug === "/x");
  const h = toSacredTermHit("Ogum", "Ogum", 0, "orixas", toGlossarySlug("/y"), CONFIDENCE_THRESHOLDS.EXACT, true, "exact");
  check("toSacredTermHit has id", typeof h.id === "string" && h.id.startsWith("hit-"));
  check("toSacredTermHit is frozen", Object.isFrozen(h));
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n=== SMOKE: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) {
  for (const f of failures) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
process.exit(0);