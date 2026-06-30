// ============================================================================
// SPIRITUAL JOURNAL — smoke-runtime.mjs (Wave 70, 2026-06-30)
// Run via: node --experimental-strip-types __tests__/smoke/smoke-runtime.mjs
// 12+ integration smoke checks covering the full engine flow.
// ============================================================================

import {
  asUserId,
  asEntryId,
  asOduRef,
  createEntry,
  getEntry,
  listEntries,
  listEntriesPaginated,
  updateEntry,
  deleteEntry,
  eraseAllEntries,
  exportEntries,
  validateEntryContent,
  auditJournal,
  setHmacSecret as setJournalHmac,
  clearAllStores as clearJournalStores,
} from "../../journal.ts";

import {
  PROMPTS,
  getDailyPrompt,
  getPromptsByCategory,
  getPromptsByTradition,
  getRandomPrompt,
  localizePrompt,
  auditPromptCatalog,
} from "../../prompts.ts";

import {
  SACRED_CATALOG,
  extractTags,
  assertCatalogCoverage,
  catalogCoverage,
  getEntriesByTag,
  getTagCloud,
  mergeTags,
  validateTag,
  normalizeTag,
} from "../../tags.ts";

import {
  asReadingId,
  asRitualId,
  asCheckinId,
  setHmacSecret as setLinkingHmac,
  clearAllStores as clearLinkingStores,
  linkToReading,
  linkToRitual,
  linkToCheckin,
  getLinkedEntries,
  getLinkedEntities,
  unlink,
  assertLinkIntegrity,
} from "../../linking.ts";

// ============================================================================
// HARNESS
// ============================================================================

let _passed = 0;
let _failed = 0;
const _log = [];

function check(label, cond) {
  if (cond) {
    _passed += 1;
    _log.push(`  ✓ ${label}`);
  } else {
    _failed += 1;
    _log.push(`  ✗ ${label}`);
  }
}

function section(name) {
  _log.push(`\n[${name}]`);
}

// ============================================================================
// INIT
// ============================================================================

section("INIT");
setJournalHmac("smoke-secret-journal");
setLinkingHmac("smoke-secret-linking");
clearJournalStores();
clearLinkingStores();
check("smoke init complete", true);

// ============================================================================
// S1 — TAXONOMY (catalogs)
// ============================================================================

section("S1 — TAXONOMY");
check("PROMPTS ≥50", PROMPTS.length >= 50);
check("SACRED_CATALOG ≥84", SACRED_CATALOG.length >= 84);

const audit = auditPromptCatalog();
check("audit.totalPrompts ≥50", audit.totalPrompts >= 50);
check("audit.allHave3Locales", audit.allHave3Locales);
check("audit.allHaveCategory", audit.allHaveCategory);

const cov = catalogCoverage();
check("cov.totalEntries ≥84", cov.totalEntries >= 84);
check("cov.meetsTraditionFloor", cov.meetsTraditionFloor);
check("cov.meetsTotalFloor", cov.meetsTotalFloor);
check("cov.uncoveredTraditions = 0", cov.uncoveredTraditions.length === 0);

// assertCatalogCoverage does not throw with valid catalog
let assertOk = true;
try { assertCatalogCoverage(); } catch { assertOk = false; }
check("assertCatalogCoverage does not throw", assertOk);

// ============================================================================
// S2 — END-TO-END LIFECYCLE
// ============================================================================

section("S2 — END-TO-END LIFECYCLE");
const user = asUserId("user-smoke");

const e1 = createEntry(user, "Hoje a Cigana me trouxe uma mensagem sobre paz e a Mesa Real.", {
  mood: "calm",
  energy: 7,
  tradition: "Cigano",
});
check("createEntry id assigned", typeof e1.id === "string");
check("createEntry mood=calm", e1.mood === "calm");

const e2 = createEntry(user, "Oxalá e Ogum me guiaram hoje. Chakra Cardíaco aberto.", {
  mood: "joyful",
  energy: 9,
  tradition: "Orixás",
});
check("createEntry mood=joyful", e2.mood === "joyful");

// Sacred tag extraction
const tags = extractTags(e2.content);
check("extractTags finds Oxalá", tags.some((t) => t.tag.label === "Oxalá"));
check("extractTags finds Ogum", tags.some((t) => t.tag.label === "Ogum"));
check("extractTags finds Chakra Cardíaco", tags.some((t) => t.tag.label === "Chakra Cardíaco"));

// ============================================================================
// S3 — LINKING (bidirectional)
// ============================================================================

section("S3 — LINKING");
const readingId = asReadingId("reading_smoke_1");
const ritualId = asRitualId("ritual_smoke_1");
const checkinId = asCheckinId("checkin_smoke_1");

const l1 = linkToReading(e1.id, readingId);
const l2 = linkToRitual(e1.id, ritualId);
const l3 = linkToCheckin(e2.id, checkinId);
check("linkToReading OK", typeof l1.id === "string");
check("linkToRitual OK", typeof l2.id === "string");
check("linkToCheckin OK", typeof l3.id === "string");

// Bidirectional: entity → entries
const fromReading = getLinkedEntries(readingId, "reading");
check("getLinkedEntries(reading) = 1", fromReading.length === 1);
check("fromReading is e1", fromReading[0]?.id === e1.id);

// Forward: entry → entities
const entities = getLinkedEntities(e1.id);
check("getLinkedEntities(e1) = 2", entities.length === 2);

// Unlink
const removed = unlink(l3.id);
check("unlink OK", removed === true);

// ============================================================================
// S4 — UPDATE + PAGINATION + FILTERS
// ============================================================================

section("S4 — UPDATE / PAGINATION / FILTERS");
const updated = updateEntry(e1.id, { mood: "joyful" });
check("updateEntry mood changed", updated.mood === "joyful");
check("updateEntry createdAt preserved", updated.createdAt === e1.createdAt);

// Add more entries for pagination
for (let i = 0; i < 5; i++) {
  createEntry(user, `Pagination entry ${i}.`, { mood: "neutral" });
}
const page = listEntriesPaginated(user, 1, 3);
check("page1.entries = 3", page.entries.length === 3);
check("page1.totalCount ≥7", page.totalCount >= 7);
check("page1.hasMore", page.hasMore === true);

// Filter by mood
const joyfulEntries = listEntries(user, { mood: ["joyful"] });
check("mood=joyful ≥2", joyfulEntries.length >= 2);

// Filter by tradition
const orixaEntries = listEntries(user, { tradition: "Orixás" });
check("tradition=Orixás = 1", orixaEntries.length === 1);

// ============================================================================
// S5 — TAGS + TAG CLOUD + VALIDATE
// ============================================================================

section("S5 — TAGS");
check("validateTag oxala", validateTag("oxala"));
check("validateTag Mesa Real → false (space)", !validateTag("Mesa Real"));
check("normalizeTag Oxalá → oxala", normalizeTag("Oxalá") === "oxala");
check("normalizeTag 'mesa real' → mesa-real", normalizeTag("mesa real") === "mesa-real");

// Tag cloud
const cloud = getTagCloud(user);
check("tag cloud is array", Array.isArray(cloud));
// (might be empty if no entries have tags, that's OK)

// ============================================================================
// S6 — PROMPTS (daily + category + random)
// ============================================================================

section("S6 — PROMPTS");
const daily = getDailyPrompt({ dayKey: "2026-06-30", tradition: "Cigano" });
check("getDailyPrompt returns Cigano tradition", daily.tradition === "Cigano");
check("getDailyPrompt has text", daily.text.length > 0);

const reflectionPrompts = getPromptsByCategory("reflection");
check("reflection prompts ≥3", reflectionPrompts.length >= 3);

const ciganoPrompts = getPromptsByTradition("Cigano");
check("Cigano prompts ≥5", ciganoPrompts.length >= 5);

const r1 = getRandomPrompt(42);
const r2 = getRandomPrompt(42);
check("getRandomPrompt deterministic", r1.id === r2.id);

const enText = localizePrompt(r1.id, "en");
check("localizePrompt en has text", enText.length > 0);

// ============================================================================
// S7 — LGPD (delete + erase + export)
// ============================================================================

section("S7 — LGPD");
const e3 = createEntry(user, "Entry to soft-delete.", { mood: "neutral" });
const delResult = deleteEntry(e3.id);
check("deleteEntry returns true", delResult === true);
check("soft-deleted has deletedAt", getEntry(e3.id)?.deletedAt !== undefined);
check("listEntries excludes deleted by default", !listEntries(user).some((e) => e.id === e3.id));

// Export JSON
const jsonExport = exportEntries(user, "json");
check("JSON export parses", !!JSON.parse(jsonExport));
check("JSON export has entries", JSON.parse(jsonExport).entries.length >= 1);

// Export Markdown
const mdExport = exportEntries(user, "markdown");
check("MD export has # header", mdExport.includes("# Spiritual Journal"));

// Erase all
const erasedCount = eraseAllEntries(user);
check("eraseAllEntries count >0", erasedCount > 0);
check("after erase, list empty", listEntries(user, { includeDeleted: true }).length === 0);

// ============================================================================
// S8 — INTEGRITY CHECK
// ============================================================================

section("S8 — INTEGRITY");
// Note: after erase, links become orphans (source entries deleted).
// Integrity check correctly flags this as a consistency violation.
const integrity = assertLinkIntegrity(user);
check("integrity.integrityOk = false (orphans from erase)", integrity.integrityOk === false);
check("integrity.orphanLinkIds > 0 (after erase)", integrity.orphanLinkIds.length > 0);

// ============================================================================
// S9 — VALIDATE ENTRY CONTENT
// ============================================================================

section("S9 — VALIDATE ENTRY CONTENT");
const okValidation = validateEntryContent("Olá, hoje meditei.");
check("validateEntryContent valid", okValidation.valid === true);
const emptyValidation = validateEntryContent("");
check("validateEntryContent empty invalid", emptyValidation.valid === false);
const longValidation = validateEntryContent("x".repeat(50001));
check("validateEntryContent too long invalid", longValidation.valid === false);

// ============================================================================
// FINAL
// ============================================================================

console.log("\n========= smoke-runtime.mjs =========\n" + _log.join("\n"));
console.log(`\n==== SMOKE: ${_passed}/${_passed + _failed} ====`);
if (_failed > 0) process.exit(1);