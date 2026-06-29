// smoke-runtime.mjs — Cycle 67 Worker B
// Self-running harness for dream-journal-engine. Runs via:
//   node --experimental-strip-types smoke-runtime.mjs
//
// 8+ paths exercised:
//   1. createDreamEntry (PII redaction + sacred hits)
//   2. extractSacredSymbols (all 7 traditions)
//   3. analyzeRecurringPatterns (counts + nightmare flag)
//   4. buildPersonalLexicon (aggregation)
//   5. interpretDream (suggested oracle)
//   6. redactPII (email/phone/CPF/URL)
//   7. chainDreamHash (HMAC-SHA256)
//   8. auditDreamCoverage (7 traditions = 125 total)
//
// Plus 2 bonus checks: forgetSymbol + classifyDreamCategory.

import {
  createDreamEntry,
  extractSacredSymbols,
  analyzeRecurringPatterns,
  buildPersonalLexicon,
  interpretDream,
  redactPII,
  chainDreamHash,
  verifyDreamHashLink,
  auditDreamCoverage,
  classifyDreamCategory,
  forgetSymbol,
  emptyLexicon,
  toUserId,
  DREAM_CATEGORIES,
  SACRED_TRADITIONS,
} from "./dream-journal-engine.ts";

let passed = 0;
let failed = 0;
const failures = [];

function check(label, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      passed += 1;
      console.log(`  ✓ ${label}`);
    } else {
      failed += 1;
      failures.push({ label, result });
      console.log(`  ✗ ${label} — got ${JSON.stringify(result)}`);
    }
  } catch (e) {
    failed += 1;
    failures.push({ label, error: e.message });
    console.log(`  ✗ ${label} — threw ${e.constructor.name}: ${e.message}`);
  }
}

console.log("🔥 dream-journal-engine smoke harness");
console.log("");

// -------- 1. createDreamEntry (PII + sacred extraction) --------
console.log("[1] createDreamEntry");
const entry = createDreamEntry({
  userId: "user_smoke_1",
  rawText: "meu email é teste@dominio.com e sonhei com uma cobra enorme e uma estrela brilhante",
  recordedAt: 1700000000000,
});
check("redacts email in sanitizedText", () => {
  if (entry.sanitizedText.includes("teste@dominio.com")) return false;
  return entry.sanitizedText.includes("[REDACTED]");
});
check("preserves sacred content in sanitizedText", () => {
  return entry.sanitizedText.includes("cobra") && entry.sanitizedText.includes("estrela");
});
check("detects A Serpente sacred hit", () => {
  return entry.sacredHits.some((h) => h.tradition === "cigano" && h.symbol === "A Serpente");
});
check("hashChain is 64-char hex", () => {
  return /^[0-9a-f]{64}$/.test(entry.hashChain);
});
check("category detected", () => {
  return DREAM_CATEGORIES.includes(entry.category);
});

// -------- 2. extractSacredSymbols (all 7 traditions) --------
console.log("\n[2] extractSacredSymbols");
const multiTradition = extractSacredSymbols(
  "vi uma cobra e Oxalá e Áries e a letra Aleph e Sahasrara e o diabo e Kether",
);
const traditionsFound = new Set(multiTradition.map((h) => h.tradition));
check("cigano tradition detected", () => traditionsFound.has("cigano"));
check("orixas tradition detected", () => traditionsFound.has("orixas"));
check("astrologia tradition detected", () => traditionsFound.has("astrologia"));
check("hebrew tradition detected", () => traditionsFound.has("hebrew"));
check("chakras tradition detected", () => traditionsFound.has("chakras"));
check("tarot tradition detected", () => traditionsFound.has("tarot"));
check("sefirot tradition detected", () => traditionsFound.has("sefirot"));
check("multi-tradition dream has >= 4 traditions", () => traditionsFound.size >= 4);

// -------- 3. analyzeRecurringPatterns --------
console.log("\n[3] analyzeRecurringPatterns");
const e1 = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
const e2 = createDreamEntry({ userId: "u1", rawText: "cobra outra vez", recordedAt: 200 });
const e3 = createDreamEntry({ userId: "u1", rawText: "cobra de novo", recordedAt: 300 });
const patterns = analyzeRecurringPatterns([e1, e2, e3]);
const serpente = patterns.find((p) => p.symbol === "A Serpente");
check("pattern count = 3 for cobra", () => serpente?.count === 3);
check("firstSeen < lastSeen", () => {
  if (!serpente) return false;
  return serpente.firstSeen < serpente.lastSeen;
});

// -------- 4. buildPersonalLexicon --------
console.log("\n[4] buildPersonalLexicon");
const lex = buildPersonalLexicon([e1, e2, e3]);
const lexSerpente = lex.symbols.find((s) => s.symbol === "A Serpente");
check("lexicon has A Serpente", () => lexSerpente !== undefined);
check("lexicon freq = 3", () => lexSerpente?.frequency === 3);
check("lexicon category = shadow", () => lexSerpente?.category === "shadow");

// -------- 5. interpretDream --------
console.log("\n[5] interpretDream");
const interp = interpretDream(entry, lex);
check("interpretation has primarySymbol", () => typeof interp.primarySymbol === "string");
check("interpretation has suggestedOracle", () => {
  return ["cigano", "tarot", "astrologia", "odi", "numerologia"].includes(interp.suggestedOracle);
});

// -------- 6. redactPII --------
console.log("\n[6] redactPII");
check("redactPII strips email", () => {
  const out = redactPII("meu email é a@b.com.br e fim");
  return !out.includes("a@b.com.br");
});
check("redactPII strips CPF", () => {
  const out = redactPII("CPF 123.456.789-09 registrado");
  return !out.includes("123.456.789-09");
});
check("redactPII strips phone", () => {
  const out = redactPII("telefone (11) 98765-4321 depois");
  return !out.includes("98765-4321");
});
check("redactPII strips URL", () => {
  const out = redactPII("veja https://example.com/foo bar");
  return !out.includes("example.com");
});

// -------- 7. chainDreamHash --------
console.log("\n[7] chainDreamHash");
const h1 = chainDreamHash({
  redactedText: "cobra",
  userId: toUserId("u1"),
  recordedAt: 100,
});
check("hash is 64-char hex", () => /^[0-9a-f]{64}$/.test(h1));
const h1bis = chainDreamHash({
  redactedText: "cobra",
  userId: toUserId("u1"),
  recordedAt: 100,
});
check("hash deterministic for same input", () => h1 === h1bis);
check("verifyDreamHashLink accepts correct hash", () => {
  return verifyDreamHashLink(null, { redactedText: "cobra", userId: toUserId("u1"), recordedAt: 100 }, h1);
});

// -------- 8. auditDreamCoverage --------
console.log("\n[8] auditDreamCoverage");
const cov = auditDreamCoverage();
check("cigano = 36", () => cov.cigano === 36);
check("orixas = 16", () => cov.orixas === 16);
check("sefirot = 10", () => cov.sefirot === 10);
check("astrologia = 12", () => cov.astrologia === 12);
check("chakras = 7", () => cov.chakras === 7);
check("hebrew = 22", () => cov.hebrew === 22);
check("tarot = 22", () => cov.tarot === 22);
check("total = 125", () => cov.total === 125);
check("isFullCoverage = true", () => cov.isFullCoverage === true);
check("missing = []", () => Array.isArray(cov.missing) && cov.missing.length === 0);

// -------- Bonus: forgetSymbol + classifyDreamCategory --------
console.log("\n[Bonus] forgetSymbol");
const lexWithTwo = {
  userId: toUserId("u1"),
  symbols: [
    { symbol: "A Serpente", frequency: 5, lastSeen: 1, sacredTradition: "cigano", category: "shadow" },
    { symbol: "A Estrela", frequency: 3, lastSeen: 2, sacredTradition: "cigano", category: "light" },
  ],
  generatedAt: 1,
};
const after = forgetSymbol(lexWithTwo, "A Serpente");
check("forgetSymbol removes target", () => !after.symbols.find((s) => s.symbol === "A Serpente"));
check("forgetSymbol keeps other", () => !!after.symbols.find((s) => s.symbol === "A Estrela"));

console.log("\n[Bonus] classifyDreamCategory");
check("LUCID detected", () => classifyDreamCategory("sonho lúcido com controle") === "LUCID");
check("NIGHTMARE detected", () => classifyDreamCategory("pesadelo com monstros") === "NIGHTMARE");
check("PROPHETIC detected", () => classifyDreamCategory("visão profética do futuro") === "PROPHETIC");
check("ANXIETY detected", () => classifyDreamCategory("ansiedade e fugindo") === "ANXIETY");
check("NORMAL default", () => classifyDreamCategory("comprei pão") === "NORMAL");

console.log("\n[Bonus] constants");
check("SACRED_TRADITIONS length = 7", () => SACRED_TRADITIONS.length === 7);
check("emptyLexicon returns empty array", () => {
  const el = emptyLexicon(toUserId("u1"));
  return Array.isArray(el.symbols) && el.symbols.length === 0;
});

// -------- Summary --------
console.log("\n" + "─".repeat(40));
console.log(`PASS: ${passed}`);
console.log(`FAIL: ${failed}`);
console.log(`TOTAL: ${passed + failed}`);

if (failed > 0) {
  console.log("\nFailures:");
  for (const f of failures) {
    console.log(`  - ${f.label}: ${f.error ?? JSON.stringify(f.result)}`);
  }
  process.exit(1);
}

console.log("\n✅ all smoke checks passed");
process.exit(0);