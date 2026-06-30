// ============================================================================
// SPIRITUAL JOURNAL — linking.spec.ts (Wave 70, 2026-06-30)
// Self-running spec for bidirectional linking.
// 50+ assertions.
// ============================================================================

import {
  check,
  section,
  expectEqual,
  expectThrows,
  getLog,
  getStats,
} from "./harness.ts";

import {
  asReadingId,
  asRitualId,
  asCheckinId,
  setHmacSecret,
  clearHmacSecret,
  clearAllStores as clearLinkingStores,
  linkToReading,
  linkToRitual,
  linkToCheckin,
  getLinkedEntries,
  getLinkedEntities,
  getLinksByEntity,
  getLinksByEntry,
  unlink,
  assertLinkIntegrity,
  LinkValidationError,
  type ReadingId,
  type RitualId,
  type CheckinId,
} from "../linking.ts";

import {
  asLinkId,
} from "../journal.ts";

import {
  asUserId,
  asEntryId,
  createEntry,
  deleteEntry,
  clearAllStores as clearJournalStores,
  setHmacSecret as setJournalHmac,
} from "../journal.ts";

// ============================================================================
// FIXTURES
// ============================================================================

function reset(): void {
  setHmacSecret("linking-spec-secret");
  setJournalHmac("linking-spec-secret");
  clearLinkingStores();
  clearJournalStores();
}

const USER_A = asUserId("user-a-linking");
const USER_B = asUserId("user-b-linking");

reset();

// ============================================================================
// SECTION 1 — LINK TO READING
// ============================================================================

function linkReading(): void {
  section("LINK TO READING");
  reset();

  const entry = createEntry(USER_A, "Reflexão após leitura de tarot.", { mood: "calm" });
  const readingId = asReadingId("reading_abc_123");

  const link = linkToReading(entry.id, readingId);
  expectEqual("linkToReading returns Link", typeof link.id, "string");
  expectEqual("link.sourceEntryId", link.sourceEntryId, entry.id);
  expectEqual("link.targetEntityId", link.targetEntityId, readingId);
  expectEqual("link.targetEntityType", link.targetEntityType, "reading");
  expectEqual("link.id starts with lnk_", link.id.startsWith("lnk_"), true);

  // Idempotency: linking same entry+entity twice returns same link
  const link2 = linkToReading(entry.id, readingId);
  expectEqual("linkToReading idempotent", link2.id, link.id);
}

// ============================================================================
// SECTION 2 — LINK TO RITUAL
// ============================================================================

function linkRitual(): void {
  section("LINK TO RITUAL");
  reset();

  const entry = createEntry(USER_A, "Reflexão sobre ritual de limpeza.", { mood: "neutral" });
  const ritualId = asRitualId("ritual_xyz_789");

  const link = linkToRitual(entry.id, ritualId);
  expectEqual("link.targetEntityType = ritual", link.targetEntityType, "ritual");
  expectEqual("link.targetEntityId", link.targetEntityId, ritualId);
}

// ============================================================================
// SECTION 3 — LINK TO CHECKIN
// ============================================================================

function linkCheckin(): void {
  section("LINK TO CHECKIN");
  reset();

  const entry = createEntry(USER_A, "Reflexão sobre check-in de hoje.", { mood: "joyful" });
  const checkinId = asCheckinId("checkin_def_456");

  const link = linkToCheckin(entry.id, checkinId);
  expectEqual("link.targetEntityType = checkin", link.targetEntityType, "checkin");
  expectEqual("link.targetEntityId", link.targetEntityId, checkinId);
}

// ============================================================================
// SECTION 4 — GET LINKED ENTRIES (reverse: entity → entries)
// ============================================================================

function getLinkedEntriesFn(): void {
  section("GET LINKED ENTRIES");
  reset();

  const e1 = createEntry(USER_A, "Entry 1.", { mood: "calm" });
  const e2 = createEntry(USER_A, "Entry 2.", { mood: "joyful" });
  const e3 = createEntry(USER_A, "Entry 3.", { mood: "neutral" });

  const readingId = asReadingId("reading_linked_1");
  linkToReading(e1.id, readingId);
  linkToReading(e2.id, readingId);
  linkToRitual(e3.id, asRitualId("ritual_linked_1"));

  const fromReading = getLinkedEntries(readingId, "reading");
  expectEqual("reading → 2 entries", fromReading.length, 2);

  const fromRitual = getLinkedEntries("ritual_linked_1", "ritual");
  expectEqual("ritual → 1 entry", fromRitual.length, 1);

  // Wrong type → 0
  const wrongType = getLinkedEntries(readingId, "ritual");
  expectEqual("wrong type → 0 entries", wrongType.length, 0);

  // Nonexistent
  const none = getLinkedEntries("nonexistent", "reading");
  expectEqual("nonexistent → 0 entries", none.length, 0);
}

// ============================================================================
// SECTION 5 — GET LINKED ENTITIES (forward: entry → entities)
// ============================================================================

function getLinkedEntitiesFn(): void {
  section("GET LINKED ENTITIES");
  reset();

  const entry = createEntry(USER_A, "Multi-link entry.", { mood: "neutral" });
  const r1 = asReadingId("r1");
  const ri1 = asRitualId("ri1");
  const c1 = asCheckinId("c1");

  linkToReading(entry.id, r1);
  linkToRitual(entry.id, ri1);
  linkToCheckin(entry.id, c1);

  const entities = getLinkedEntities(entry.id);
  expectEqual("3 linked entities", entities.length, 3);

  const types = new Set(entities.map((e) => e.type));
  expectEqual("3 distinct types", types.size, 3);
  expectEqual("includes reading", types.has("reading"), true);
  expectEqual("includes ritual", types.has("ritual"), true);
  expectEqual("includes checkin", types.has("checkin"), true);

  // LinkedEntity structure
  const firstReading = entities.find((e) => e.type === "reading");
  expectEqual("LinkedEntity.id", firstReading?.id, r1);
  expectEqual("LinkedEntity.entryId", firstReading?.entryId, entry.id);
  expectEqual("LinkedEntity.linkId starts with lnk_", firstReading?.linkId.startsWith("lnk_"), true);

  // Nonexistent entry
  const none = getLinkedEntities(asEntryId("nope"));
  expectEqual("nonexistent entry → empty", none.length, 0);
}

// ============================================================================
// SECTION 6 — GET LINKS BY ENTITY / BY ENTRY
// ============================================================================

function getLinksBy(): void {
  section("GET LINKS BY ENTITY / BY ENTRY");
  reset();

  const e1 = createEntry(USER_A, "Entry.", { mood: "calm" });
  const readingId = asReadingId("r_q");

  const link = linkToReading(e1.id, readingId);

  const byEntity = getLinksByEntity(readingId);
  expectEqual("getLinksByEntity = 1", byEntity.length, 1);
  expectEqual("link.id match", byEntity[0]?.id, link.id);

  const byEntityTyped = getLinksByEntity(readingId, "reading");
  expectEqual("getLinksByEntity typed = 1", byEntityTyped.length, 1);

  const byEntityWrong = getLinksByEntity(readingId, "ritual");
  expectEqual("getLinksByEntity wrong type = 0", byEntityWrong.length, 0);

  const byEntry = getLinksByEntry(e1.id);
  expectEqual("getLinksByEntry = 1", byEntry.length, 1);
}

// ============================================================================
// SECTION 7 — UNLINK
// ============================================================================

function unlinkFn(): void {
  section("UNLINK");
  reset();

  const e1 = createEntry(USER_A, "Entry.", { mood: "calm" });
  const readingId = asReadingId("r_unlink");

  const link = linkToReading(e1.id, readingId);
  expectEqual("initial getLinksByEntity = 1", getLinksByEntity(readingId).length, 1);

  const removed = unlink(link.id);
  expectEqual("unlink returns true", removed, true);
  expectEqual("after unlink: getLinksByEntity = 0", getLinksByEntity(readingId).length, 0);
  expectEqual("after unlink: getLinkedEntities = 0", getLinkedEntities(e1.id).length, 0);

  // Unlink nonexistent
  const removedAgain = unlink(link.id);
  expectEqual("unlink again returns false", removedAgain, false);

  const fakeId = asLinkId("lnk_fake");
  const removedFake = unlink(fakeId);
  expectEqual("unlink fake returns false", removedFake, false);
}

// ============================================================================
// SECTION 8 — INTEGRITY CHECK
// ============================================================================

function integrity(): void {
  section("ASSERT LINK INTEGRITY");
  reset();

  const e1 = createEntry(USER_A, "e1", { mood: "calm" });
  const e2 = createEntry(USER_A, "e2", { mood: "calm" });
  const e3 = createEntry(USER_A, "e3", { mood: "calm" });

  linkToReading(e1.id, asReadingId("r_i1"));
  linkToRitual(e1.id, asRitualId("ri_i1"));
  linkToCheckin(e2.id, asCheckinId("c_i1"));

  const report = assertLinkIntegrity(USER_A);
  expectEqual("integrity.totalEntries = 3", report.totalEntries, 3);
  expectEqual("integrity.totalLinks = 3", report.totalLinks, 3);
  expectEqual("integrity.orphanLinkIds = 0", report.orphanLinkIds.length, 0);
  expectEqual("integrity.integrityOk", report.integrityOk, true);
  expectEqual("integrity.byEntityType.reading = 1", report.byEntityType.reading, 1);
  expectEqual("integrity.byEntityType.ritual = 1", report.byEntityType.ritual, 1);
  expectEqual("integrity.byEntityType.checkin = 1", report.byEntityType.checkin, 1);

  // Soft-delete an entry with links → orphan
  deleteEntry(e1.id);
  const report2 = assertLinkIntegrity(USER_A);
  expectEqual("after soft-delete: 2 orphan", report2.orphanLinkIds.length, 2);
  expectEqual("integrity.integrityOk = false", report2.integrityOk, false);
}

// ============================================================================
// SECTION 9 — ERROR PATHS
// ============================================================================

function errors(): void {
  section("ERROR PATHS");
  reset();

  // Link to nonexistent entry
  expectThrows(
    "link to nonexistent entry throws",
    () => linkToReading(asEntryId("nope"), asReadingId("r_x")),
    "LinkValidationError",
  );

  // Link to deleted entry
  const e = createEntry(USER_A, "to delete", { mood: "calm" });
  deleteEntry(e.id);
  expectThrows(
    "link to deleted entry throws",
    () => linkToReading(e.id, asReadingId("r_y")),
    "LinkValidationError",
  );

  // Empty entity ID
  const e2 = createEntry(USER_A, "active", { mood: "calm" });
  expectThrows(
    "empty entity ID throws",
    () => linkToReading(e2.id, "" as never),
    "LinkValidationError",
  );
}

// ============================================================================
// SECTION 10 — HMAC
// ============================================================================

function hmac(): void {
  section("HMAC");
  reset();

  clearHmacSecret();
  const e = createEntry(USER_A, "no hmac", { mood: "calm" });
  const link = linkToReading(e.id, asReadingId("r_h"));
  // Without HMAC secret, linkId is still generated (uses Date.now + random)
  expectEqual("linkId generated even without secret", typeof link.id, "string");

  setHmacSecret("secret");
  const link2 = linkToReading(e.id, asReadingId("r_h2"));
  expectEqual("link2 has lnk_ prefix", link2.id.startsWith("lnk_"), true);
}

// ============================================================================
// SECTION 11 — MULTIPLE ENTRIES, MULTIPLE LINKS
// ============================================================================

function multi(): void {
  section("MULTIPLE ENTRIES MULTIPLE LINKS");
  reset();

  const e1 = createEntry(USER_A, "e1", { mood: "calm" });
  const e2 = createEntry(USER_A, "e2", { mood: "joyful" });
  const e3 = createEntry(USER_B, "e3", { mood: "neutral" });

  const sharedReading = asReadingId("r_shared");
  linkToReading(e1.id, sharedReading);
  linkToReading(e2.id, sharedReading);
  linkToReading(e3.id, sharedReading);

  // USER_A sees 2 entries linked, USER_B sees 1
  const fromReading = getLinkedEntries(sharedReading, "reading");
  expectEqual("shared reading: 3 entries total", fromReading.length, 3);
}

// ============================================================================
// RUN-ALL
// ============================================================================

export function runLinkingSpec(): { passed: number; failed: number } {
  linkReading();
  linkRitual();
  linkCheckin();
  getLinkedEntriesFn();
  getLinkedEntitiesFn();
  getLinksBy();
  unlinkFn();
  integrity();
  errors();
  hmac();
  multi();
  return getStats();
}

export function logLinkingSpec(): readonly string[] {
  return getLog();
}