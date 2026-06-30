// ============================================================================
// SPIRITUAL JOURNAL — journal.spec.ts (Wave 70, 2026-06-30)
// Self-running spec for journal CRUD + LGPD + export.
// 50+ assertions across multiple sections.
// ============================================================================

import {
  check,
  section,
  expectEqual,
  expectDeepEqual,
  expectThrows,
  expectArrayLength,
  expectArrayContains,
  getLog,
  getStats,
} from "./harness.ts";

import {
  asUserId,
  asEntryId,
  asOduRef,
  asTimestamp,
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
  setHmacSecret,
  clearHmacSecret,
  clearAllStores as clearJournalStores,
  JournalValidationError,
  EntryNotFoundError,
  MOODS,
  TRADITIONS,
  type JournalEntry,
  type UserId,
  type EntryId,
  type Tag,
  type Mood,
} from "../journal.ts";

// ============================================================================
// FIXTURES
// ============================================================================

const USER_A = asUserId("user-a-spec");
const USER_B = asUserId("user-b-spec");
const USER_C = asUserId("user-c-spec");

const TAG_OXALA: Tag = Object.freeze({
  id: "tag:orixas-oxala",
  label: "Oxalá",
  tradition: "Orixás",
  sacredRef: "Oxalá",
});

const TAG_MESA: Tag = Object.freeze({
  id: "tag:cigano-mesa-real",
  label: "Mesa Real",
  tradition: "Cigano",
  sacredRef: "Mesa Real",
});

function reset(): void {
  setHmacSecret("spec-secret-journal");
  clearJournalStores();
}

reset();

// ============================================================================
// SECTION 1 — VALIDATION
// ============================================================================

function validation(): void {
  section("VALIDATION");

  const ok = validateEntryContent("Olá, hoje tive uma reflexão profunda.");
  expectEqual("valid content.valid", ok.valid, true);
  expectEqual("valid content.sanitized has text", (ok.sanitized ?? "").length > 0, true);

  const empty = validateEntryContent("   ");
  expectEqual("empty content.invalid", empty.valid, false);

  const longContent = "x".repeat(50_001);
  const tooLong = validateEntryContent(longContent);
  expectEqual("too long content.invalid", tooLong.valid, false);

  const short = validateEntryContent("hi");
  expectEqual("short content.warning issued", short.warnings.length > 0, true);
  expectEqual("short content.still valid", short.valid, true);
}

// ============================================================================
// SECTION 2 — CREATE
// ============================================================================

function create(): void {
  section("CREATE ENTRY");
  reset();

  const e1 = createEntry(USER_A, "Hoje a Cigana me trouxe uma mensagem sobre paz.", {
    mood: "calm",
    energy: 7,
    tradition: "Cigano",
    tags: [TAG_MESA],
  });
  expectEqual("createEntry id is string", typeof e1.id, "string");
  expectEqual("createEntry userId matches", e1.userId, USER_A);
  expectEqual("createEntry mood = calm", e1.mood, "calm");
  expectEqual("createEntry energy = 7", e1.energy, 7);
  expectEqual("createEntry tradition = Cigano", e1.tradition, "Cigano");
  expectEqual("createEntry tags = 1", e1.tags.length, 1);
  expectEqual("createEntry has contentHash (HMAC on)", typeof e1.contentHash, "string");
  expectEqual("createEntry frozen", Object.isFrozen(e1), true);
  expectEqual("createEntry tags frozen", Object.isFrozen(e1.tags), true);

  const e2 = createEntry(USER_B, "Reflexão sobre Oxalá e a paz interior.", {
    mood: "joyful",
    energy: 8,
    tradition: "Orixás",
    tags: [TAG_OXALA],
    oduRef: asOduRef("Oxalá-1"),
  });
  expectEqual("user B separate from A", e2.userId, USER_B);
  expectEqual("oduRef set", e2.oduRef, asOduRef("Oxalá-1"));

  // Empty content throws
  expectThrows(
    "empty content throws JournalValidationError",
    () => createEntry(USER_A, ""),
    "JournalValidationError",
  );

  // Long content throws
  expectThrows(
    "long content throws",
    () => createEntry(USER_A, "x".repeat(50_001)),
    "JournalValidationError",
  );
}

// ============================================================================
// SECTION 3 — GET + LIST
// ============================================================================

function getList(): void {
  section("GET + LIST");
  reset();

  const a1 = createEntry(USER_A, "Primeira reflexão.", { mood: "calm" });
  const a2 = createEntry(USER_A, "Segunda reflexão.", { mood: "joyful" });
  const a3 = createEntry(USER_A, "Terceira reflexão.", { mood: "anxious", tradition: "Cigano" });
  createEntry(USER_B, "Reflexão do user B.", { mood: "neutral" });

  expectEqual("getEntry returns a1", getEntry(a1.id)?.id, a1.id);
  expectEqual("getEntry null for missing", getEntry(asEntryId("nonexistent")), null);

  const listA = listEntries(USER_A);
  expectEqual("listEntries(USER_A) count = 3", listA.length, 3);
  expectEqual("listEntries excludes USER_B", listA.some((e) => e.userId === USER_B), false);

  // Newest first
  expectEqual("listEntries newest first", listA[0]?.id, a3.id);

  // Filter by mood
  const calmOnly = listEntries(USER_A, { mood: ["calm"] });
  expectEqual("mood filter: calm only", calmOnly.length, 1);
  expectEqual("mood filter: calm is the calm entry", calmOnly[0]?.id, a1.id);

  // Filter by tradition
  const cigano = listEntries(USER_A, { tradition: "Cigano" });
  expectEqual("tradition filter: Cigano count = 1", cigano.length, 1);
  expectEqual("tradition filter: returns a3", cigano[0]?.id, a3.id);

  // Filter by energy range
  const e5 = createEntry(USER_A, "Quarta, energia 4.", { energy: 4 });
  const lowEnergy = listEntries(USER_A, { energyMin: 1, energyMax: 5 });
  expectEqual("energy range: includes e5", lowEnergy.some((e) => e.id === e5.id), true);
  expectEqual("energy range: excludes calm (energy undefined)", lowEnergy.some((e) => e.id === a1.id), false);

  // Filter by tags
  const withTag = createEntry(USER_A, "Reflexão com tag.", { tags: [TAG_OXALA] });
  const oxalaFilter = listEntries(USER_A, { tags: ["tag:orixas-oxala"] });
  expectEqual("tags filter: includes oxala entry", oxalaFilter.some((e) => e.id === withTag.id), true);
}

// ============================================================================
// SECTION 4 — PAGINATION
// ============================================================================

function pagination(): void {
  section("PAGINATION");
  reset();

  for (let i = 0; i < 7; i++) {
    createEntry(USER_C, `Entry ${i}.`, { mood: "neutral" });
  }
  createEntry(USER_B, "noise", { mood: "neutral" });

  const page1 = listEntriesPaginated(USER_C, 1, 3);
  expectEqual("page1.entries.length = 3", page1.entries.length, 3);
  expectEqual("page1.totalCount = 7", page1.totalCount, 7);
  expectEqual("page1.hasMore = true", page1.hasMore, true);
  expectEqual("page1.page = 1", page1.page, 1);
  expectEqual("page1.pageSize = 3", page1.pageSize, 3);

  const page2 = listEntriesPaginated(USER_C, 2, 3);
  expectEqual("page2.entries.length = 3", page2.entries.length, 3);
  expectEqual("page2.hasMore = true", page2.hasMore, true);

  const page3 = listEntriesPaginated(USER_C, 3, 3);
  expectEqual("page3.entries.length = 1", page3.entries.length, 1);
  expectEqual("page3.hasMore = false", page3.hasMore, false);

  // Pages should be disjoint
  const allIds = new Set([
    ...page1.entries.map((e) => e.id),
    ...page2.entries.map((e) => e.id),
    ...page3.entries.map((e) => e.id),
  ]);
  expectEqual("pages disjoint", allIds.size, 7);
}

// ============================================================================
// SECTION 5 — UPDATE
// ============================================================================

function update(): void {
  section("UPDATE ENTRY");
  reset();

  const e = createEntry(USER_A, "Original content.", { mood: "neutral", energy: 5 });
  const updated = updateEntry(e.id, { mood: "joyful", energy: 8 });
  expectEqual("updateEntry.id stable", updated.id, e.id);
  expectEqual("updateEntry.mood changed", updated.mood, "joyful");
  expectEqual("updateEntry.energy changed", updated.energy, 8);
  expectEqual("updateEntry.content preserved", updated.content, "Original content.");
  expectEqual("updateEntry.createdAt preserved", updated.createdAt, e.createdAt);
  expectEqual("updateEntry.updatedAt advanced", updated.updatedAt > e.updatedAt, true);
  expectEqual("updateEntry frozen", Object.isFrozen(updated), true);

  // Update content
  const updated2 = updateEntry(e.id, { content: "Updated content." });
  expectEqual("updateEntry.content changed", updated2.content, "Updated content.");

  // Update nonexistent throws
  expectThrows(
    "update nonexistent throws EntryNotFoundError",
    () => updateEntry(asEntryId("nope"), { mood: "calm" }),
    "EntryNotFoundError",
  );

  // Update deleted throws
  deleteEntry(e.id);
  expectThrows(
    "update deleted throws",
    () => updateEntry(e.id, { mood: "calm" }),
    "JournalValidationError",
  );
}

// ============================================================================
// SECTION 6 — DELETE (soft) + ERASE (hard LGPD)
// ============================================================================

function deleteErase(): void {
  section("DELETE + ERASE");
  reset();

  const e1 = createEntry(USER_A, "To soft-delete.", { mood: "calm" });
  const e2 = createEntry(USER_A, "To erase with all.", { mood: "calm" });
  createEntry(USER_A, "Survivor.", { mood: "joyful" });

  expectEqual("deleteEntry returns true", deleteEntry(e1.id), true);
  expectEqual("deleteEntry returns false on already-deleted", deleteEntry(e1.id), false);

  const softDeleted = getEntry(e1.id);
  expectEqual("soft-deleted entry has deletedAt", softDeleted?.deletedAt !== undefined, true);
  expectEqual("default listEntries excludes deleted", listEntries(USER_A).some((e) => e.id === e1.id), false);
  expectEqual("includeDeleted listEntries includes soft-deleted", listEntries(USER_A, { includeDeleted: true }).some((e) => e.id === e1.id), true);

  // Hard erase
  const erased = eraseAllEntries(USER_A);
  expectEqual("eraseAllEntries count = 3", erased, 3);
  expectEqual("after erase, list empty", listEntries(USER_A, { includeDeleted: true }).length, 0);

  // USER_B unaffected
  createEntry(USER_B, "B is safe.", { mood: "neutral" });
  eraseAllEntries(USER_A);
  expectEqual("USER_B unaffected by USER_A erase", listEntries(USER_B).length, 1);
}

// ============================================================================
// SECTION 7 — EXPORT (LGPD Art. 18 V data portability)
// ============================================================================

function exportFn(): void {
  section("EXPORT");
  reset();

  createEntry(USER_A, "Reflexão 1 sobre a Mesa Real.", { mood: "calm", tradition: "Cigano", tags: [TAG_MESA] });
  createEntry(USER_A, "Reflexão 2 sobre Oxalá.", { mood: "joyful", tradition: "Orixás", tags: [TAG_OXALA] });

  const json = exportEntries(USER_A, "json");
  expectEqual("JSON export starts with {", json.startsWith("{"), true);
  const parsed = JSON.parse(json) as { entries: JournalEntry[]; count: number };
  expectEqual("JSON export count = 2", parsed.count, 2);
  expectEqual("JSON export has 2 entries", parsed.entries.length, 2);

  const md = exportEntries(USER_A, "markdown");
  expectEqual("MD export has # header", md.includes("# Spiritual Journal"), true);
  expectEqual("MD export has Mesa Real", md.includes("Mesa Real"), true);
  expectEqual("MD export has Oxalá", md.includes("Oxalá"), true);
}

// ============================================================================
// SECTION 8 — HMAC CHAIN
// ============================================================================

function hmac(): void {
  section("HMAC CHAIN");
  reset();

  clearHmacSecret();
  const noHash = createEntry(USER_A, "Without HMAC.", { mood: "neutral" });
  expectEqual("no HMAC -> empty contentHash", noHash.contentHash, "");

  setHmacSecret("secret-1");
  const withHash = createEntry(USER_A, "With HMAC.", { mood: "neutral" });
  expectEqual("with HMAC -> hash is 8 hex chars", /^[0-9a-f]{8}$/.test(withHash.contentHash ?? ""), true);

  // Update changes hash (since content hash is over content+timestamp+userId)
  const updated = updateEntry(withHash.id, { content: "Updated content." });
  expectEqual("update regenerates hash", updated.contentHash !== withHash.contentHash, true);
}

// ============================================================================
// SECTION 9 — AUDIT
// ============================================================================

function audit(): void {
  section("AUDIT");
  reset();

  createEntry(USER_A, "Audit test.", { mood: "radiant", energy: 9, tradition: "Cabala" });
  createEntry(USER_A, "Another.", { mood: "calm", energy: 5, tradition: "Cigano" });
  createEntry(USER_B, "B audit.", { mood: "neutral", energy: 7 });

  const a = auditJournal();
  expectEqual("audit.totalEntries = 3", a.totalEntries, 3);
  expectEqual("audit.activeEntries = 3", a.activeEntries, 3);
  expectEqual("audit.uniqueUsers = 2", a.uniqueUsers, 2);
  expectEqual("audit.byTradition.Cigano = 1", a.byTradition.Cigano, 1);
  expectEqual("audit.byTradition.Cabala = 1", a.byTradition.Cabala, 1);
  expectEqual("audit.byTradition.Orixás = 0", a.byTradition.Orixás, 0);
  expectEqual("audit.byMood.radiant = 1", a.byMood.radiant, 1);
  expectEqual("audit.avgEnergy = 7", a.avgEnergy, 7);
  expectEqual("audit.hmacEnabled", a.hmacEnabled, true);

  // Soft-delete then audit
  const all = listEntries(USER_A, { includeDeleted: false });
  if (all[0]) deleteEntry(all[0].id);
  const a2 = auditJournal();
  expectEqual("after delete: active=2, deleted=1", a2.activeEntries === 2 && a2.softDeletedEntries === 1, true);
}

// ============================================================================
// RUN-ALL
// ============================================================================

export function runJournalSpec(): { passed: number; failed: number } {
  reset();
  validation();
  create();
  getList();
  pagination();
  update();
  deleteErase();
  exportFn();
  hmac();
  audit();
  return getStats();
}

export function logJournalSpec(): readonly string[] {
  return getLog();
}