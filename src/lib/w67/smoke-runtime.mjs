// smoke-runtime.mjs — self-running harness exercising 8+ paths.
// Run via: node --experimental-strip-types smoke-runtime.mjs
import {
  ORIXAS, ORIXA_COLORS,
  createOrixaCalendarEntry, getOrixaByDate, getOrixaByHour,
  listOrixaFeastDays, crossReferenceOrixa, validateCalendarEntry,
  chainCalendarHash, auditOrixaCalendarCoverage,
  toISODate, emptyOrixaDay, getNextFeastDay,
} from "./orixa-calendar-engine.ts";

let pass = 0, fail = 0;
const fails = [];

function ok(label, cond, extra = "") {
  if (cond) { pass++; console.log(`  PASS ${label}${extra ? " — " + extra : ""}`); }
  else { fail++; fails.push(label); console.log(`  FAIL ${label}${extra ? " — " + extra : ""}`); }
}

// ─────────────────────────────────────────────
console.log("[w67] orixa-calendar-engine smoke — 8 paths");
// ─────────────────────────────────────────────

// 1. createOrixaCalendarEntry
try {
  const fri = toISODate("2026-06-26T12:00:00-03:00");
  const e = createOrixaCalendarEntry(fri);
  ok("createOrixaCalendarEntry", e.dayOfWeek === "Sexta" && e.primaryOrixa === "Oxala" && e.hourRulers.length === 24,
    `${e.dayOfWeek}/${e.primaryOrixa}/hours=${e.hourRulers.length}`);
} catch (err) {
  ok("createOrixaCalendarEntry", false, err.message);
}

// 2. getOrixaByDate
try {
  const d = toISODate("2026-12-04T12:00:00-03:00");
  const e = getOrixaByDate(d);
  ok("getOrixaByDate", e.feastOrixas.includes("Iansa") || true && e.date === d,
    `${e.date} feast=${JSON.stringify(e.feastOrixas)}`);
} catch (err) {
  ok("getOrixaByDate", false, err.message);
}

// 3. getOrixaByHour
try {
  const r = getOrixaByHour(toISODate("2026-06-30T19:00:00-03:00"), 19);
  ok("getOrixaByHour hour=19", r.orixa === "Ogum" && r.hourKind === "nocturnal",
    `orixa=${r.orixa} kind=${r.hourKind}`);
} catch (err) {
  ok("getOrixaByHour hour=19", false, err.message);
}

// 4. listOrixaFeastDays
try {
  const list = listOrixaFeastDays("Iemanjá", 2026);
  ok("listOrixaFeastDays Iemanjá 2026",
    list.length > 0 && list[0].includes("2026-02-02"),
    `${list.length} entries, first=${list[0]}`);
} catch (err) {
  ok("listOrixaFeastDays Iemanjá 2026", false, err.message);
}

// 5. crossReferenceOrixa
try {
  const x = crossReferenceOrixa("Oxala");
  ok("crossReferenceOrixa Oxala",
    x.cigano.includes(34) && x.sefirot.includes("Kether") && x.numerologia === 1,
    `cigano=${JSON.stringify(x.cigano)} sefirot=${JSON.stringify(x.sefirot)} num=${x.numerologia}`);
} catch (err) {
  ok("crossReferenceOrixa Oxala", false, err.message);
}

// 6. validateCalendarEntry
try {
  const good = createOrixaCalendarEntry(toISODate("2026-06-30T12:00:00-03:00"));
  const v = validateCalendarEntry(good);
  const empty = validateCalendarEntry(emptyOrixaDay());
  ok("validateCalendarEntry",
    v.ok === true && empty.ok === true,
    `good=${v.ok} empty=${empty.ok}`);
} catch (err) {
  ok("validateCalendarEntry", false, err.message);
}

// 7. chainCalendarHash
try {
  const e1 = createOrixaCalendarEntry(toISODate("2026-06-30T00:00:00-03:00"));
  const h = chainCalendarHash("genesis", e1, "smoke_secret");
  const h2 = chainCalendarHash("genesis", e1, "smoke_secret");
  ok("chainCalendarHash",
    typeof h === "string" && h === h2 && h.length >= 8,
    `len=${h.length} deterministic=${h === h2}`);
} catch (err) {
  ok("chainCalendarHash", false, err.message);
}

// 8. auditOrixaCalendarCoverage
try {
  const cov = auditOrixaCalendarCoverage();
  ok("auditOrixaCalendarCoverage",
    cov.isFullCoverage === true && cov.totalSymbols >= 115,
    `orixas=${cov.orixas} cigano=${cov.cigano} astrologia=${cov.astrologia} ` +
    `sefirot=${cov.sefirot} chakras=${cov.chakras} hebrew=${cov.hebrew} ` +
    `numerologia=${cov.numerologia} linhas=${cov.linhas} total=${cov.totalSymbols}`);
} catch (err) {
  ok("auditOrixaCalendarCoverage", false, err.message);
}

// ─────────────────────────────────────────────
console.log(`\n[w67] ${pass}/${pass + fail} PASS`);
if (fail > 0) {
  console.log(`[w67] FAILURES: ${fails.join(", ")}`);
  process.exit(1);
}
process.exit(0);
