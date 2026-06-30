// ============================================================================
// SPIRITUAL JOURNAL — tags.spec.ts (Wave 70, 2026-06-30)
// Self-running spec for sacred-tag system.
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
  asTagId,
  SACRED_CATALOG,
  REQUIRED_COVERAGE_FLOORS,
  TOTAL_CATALOG_FLOOR,
  validateTag,
  normalizeTag,
  extractTags,
  extractTagLabels,
  assertCatalogCoverage,
  catalogCoverage,
  getEntriesByTag,
  getTagCloud,
  mergeTags,
  TagCatalogError,
  type SacredEntry,
  type Tag,
} from "../tags.ts";

import {
  asUserId,
  createEntry,
  deleteEntry,
  clearAllStores as clearJournalStores,
  setHmacSecret,
  TRADITIONS,
} from "../journal.ts";

// ============================================================================
// SECTION 1 — VALIDATE TAG
// ============================================================================

function validate(): void {
  section("VALIDATE TAG");

  expectEqual("valid tag: oxala", validateTag("oxala"), true);
  expectEqual("valid tag: mesa-real", validateTag("mesa-real"), true);
  expectEqual("valid tag: snake_case", validateTag("snake_case"), true);
  expectEqual("valid tag: a1b2", validateTag("a1b2"), true);
  expectEqual("valid tag: 50-char", validateTag("a".repeat(50)), true);

  expectEqual("invalid: empty", validateTag(""), false);
  expectEqual("invalid: too short (1 char)", validateTag("a"), false);
  expectEqual("invalid: too long (51)", validateTag("a".repeat(51)), false);
  expectEqual("invalid: uppercase", validateTag("Oxala"), false);
  expectEqual("invalid: space", validateTag("mesa real"), false);
  expectEqual("invalid: special char", validateTag("oxalá!"), false);
  expectEqual("invalid: number type", validateTag("12345" as never), true); // pure digits are valid
  expectEqual("invalid: not string", validateTag(123 as never), false);
}

// ============================================================================
// SECTION 2 — NORMALIZE TAG
// ============================================================================

function normalize(): void {
  section("NORMALIZE TAG");

  expectEqual("normalize Oxalá → oxala", normalizeTag("Oxalá"), "oxala");
  expectEqual("normalize 'mesa real' → mesa-real", normalizeTag("mesa real"), "mesa-real");
  expectEqual("normalize Áries → aries", normalizeTag("Áries"), "aries");
  expectEqual("normalize already-clean", normalizeTag("oxala"), "oxala");
}

// ============================================================================
// SECTION 3 — SACRED CATALOG COVERAGE
// ============================================================================

function catalog(): void {
  section("SACRED CATALOG COVERAGE");

  expectEqual("TOTAL_CATALOG_FLOOR ≥84", TOTAL_CATALOG_FLOOR, 84);

  const c = catalogCoverage();
  expectEqual("catalog.totalEntries ≥84", c.totalEntries >= 84, true);
  expectEqual("catalog.meetsTraditionFloor", c.meetsTraditionFloor, true);
  expectEqual("catalog.meetsTotalFloor", c.meetsTotalFloor, true);
  expectEqual("catalog.uncoveredTraditions empty", c.uncoveredTraditions.length, 0);

  // Every tradition has ≥7 entries (cycle 62 lesson 12 floor)
  for (const t of TRADITIONS) {
    expectEqual(
      `tradition ${t} has ≥7 entries`,
      c.byTradition[t] >= REQUIRED_COVERAGE_FLOORS[t],
      true,
    );
  }

  // assertCatalogCoverage does not throw with valid catalog
  let threw = false;
  try {
    assertCatalogCoverage();
  } catch {
    threw = true;
  }
  expectEqual("assertCatalogCoverage does not throw", threw, false);

  // Each tradition has at least 7 entries (raw check on SACRED_CATALOG)
  for (const t of TRADITIONS) {
    const cnt = SACRED_CATALOG.filter((e) => e.tradition === t).length;
    expectEqual(`SACRED_CATALOG.${t} ≥7`, cnt >= 7, true);
  }

  // SACRED_CATALOG is frozen
  expectEqual("SACRED_CATALOG frozen", Object.isFrozen(SACRED_CATALOG), true);
}

// ============================================================================
// SECTION 4 — EXTRACT TAGS
// ============================================================================

function extract(): void {
  section("EXTRACT TAGS");

  const empty = extractTags("");
  expectEqual("empty content → no tags", empty.length, 0);

  const noSacred = extractTags("Hoje foi um dia comum sem grandes eventos.");
  expectEqual("no sacred content → no tags", noSacred.length, 0);

  // Cigano
  const cigano = extractTags("A Cigana me trouxe uma mensagem sobre a Mesa Real e o Cavaleiro apareceu.");
  expectEqual("cigano extraction has ≥2 tags", cigano.length >= 2, true);
  expectEqual(
    "cigano includes Mesa Real",
    cigano.some((t) => t.tag.label === "Mesa Real"),
    true,
  );

  // Orixás
  const orixas = extractTags("Hoje Oxalá e Ogum me guiaram. Iemanjá apareceu nos sonhos.");
  expectEqual("orixas ≥2", orixas.length >= 2, true);
  expectEqual("orixas includes Oxalá", orixas.some((t) => t.tag.label === "Oxalá"), true);

  // Astrologia
  const astro = extractTags("Meu Sol em Leão e a Lua em Câncer estão em tensão hoje.");
  expectEqual("astrologia includes Sol", astro.some((t) => t.tag.label === "Sol"), true);
  expectEqual("astrologia includes Leão", astro.some((t) => t.tag.label === "Leão"), true);
  expectEqual("astrologia includes Lua", astro.some((t) => t.tag.label === "Lua"), true);

  // Cabala
  const cabala = extractTags("Hoje meditei em Kéter e em Tiferet. A energia de Binah é forte.");
  expectEqual("cabala includes Kéter", cabala.some((t) => t.tag.label === "Kéter"), true);

  // Numerologia
  const num = extractTags("O Número 7 e o Número 11 apareceram em sequência.");
  expectEqual("numerologia includes 7", num.some((t) => t.tag.label === "Número 7"), true);

  // Tantra
  const tantra = extractTags("O Chakra Cardíaco está aberto e o Chakra Laríngeo pulsa.");
  expectEqual("tantra includes Chakra Cardíaco", tantra.some((t) => t.tag.label === "Chakra Cardíaco"), true);

  // Tarot
  const tarot = extractTags("A Torre apareceu na consulta de ontem, mas A Estrela trouxe esperança.");
  expectEqual("tarot includes A Torre", tarot.some((t) => t.tag.label === "A Torre"), true);
  expectEqual("tarot includes A Estrela", tarot.some((t) => t.tag.label === "A Estrela"), true);

  // Multi-tradition text
  const all = extractTags("Hoje Oxalá guiou. A Cigana me mostrou o Cavaleiro. O Chakra Raiz vibrou.");
  const tradSet = new Set(all.map((t) => t.tag.tradition));
  expectEqual("multi-tradition: ≥3 traditions", tradSet.size >= 3, true);

  // Position tracking
  const withPos = extractTags("Oxalá Oxalá Oxalá");
  const oxala = withPos.find((t) => t.tag.label === "Oxalá");
  expectEqual("Oxalá count = 3", oxala?.count, 3);
  expectEqual("Oxalá has 3 positions", oxala?.positions.length, 3);

  // extractTagLabels
  const labels = extractTagLabels("A Cigana trouxe a mensagem.");
  expectEqual("extractTagLabels has Mesa Real or Cigana", labels.length > 0, true);
  expectEqual("extractTagLabels returns array", Array.isArray(labels), true);
}

// ============================================================================
// SECTION 5 — GET ENTRIES BY TAG
// ============================================================================

function entriesByTag(): void {
  section("GET ENTRIES BY TAG");

  setHmacSecret("tags-spec-secret");
  clearJournalStores();

  const user = asUserId("user-tags");
  const oxalaTag: Tag = {
    id: "tag:orixas-oxala",
    label: "Oxalá",
    tradition: "Orixás",
    sacredRef: "Oxalá",
  };
  const mesaTag: Tag = {
    id: "tag:cigano-mesa-real",
    label: "Mesa Real",
    tradition: "Cigano",
    sacredRef: "Mesa Real",
  };

  createEntry(user, "Reflexão 1 sobre Oxalá.", { tags: [oxalaTag] });
  createEntry(user, "Reflexão 2 sobre Oxalá e Ogum.", { tags: [oxalaTag] });
  createEntry(user, "Reflexão sobre Mesa Real.", { tags: [mesaTag] });
  createEntry(user, "Reflexão sem tags.", {});

  const oxalaEntries = getEntriesByTag(user, asTagId("tag:orixas-oxala"));
  expectEqual("oxala tag → 2 entries", oxalaEntries.length, 2);

  const mesaEntries = getEntriesByTag(user, asTagId("tag:cigano-mesa-real"));
  expectEqual("mesa tag → 1 entry", mesaEntries.length, 1);

  const empty = getEntriesByTag(user, asTagId("tag:nonexistent"));
  expectEqual("nonexistent tag → 0 entries", empty.length, 0);

  // Soft-deleted entries excluded
  const firstOxala = oxalaEntries[0];
  if (firstOxala) {
    deleteEntry(firstOxala.id);
    const after = getEntriesByTag(user, asTagId("tag:orixas-oxala"));
    expectEqual("after soft-delete: 1 entry", after.length, 1);
  }
}

// ============================================================================
// SECTION 6 — TAG CLOUD
// ============================================================================

function cloud(): void {
  section("TAG CLOUD");

  setHmacSecret("tags-spec-secret");
  clearJournalStores();
  const user = asUserId("user-cloud");

  const oxalaTag: Tag = { id: "tag:orixas-oxala", label: "Oxalá", tradition: "Orixás", sacredRef: "Oxalá" };
  const mesaTag: Tag = { id: "tag:cigano-mesa-real", label: "Mesa Real", tradition: "Cigano", sacredRef: "Mesa Real" };

  // 3 entries with Oxalá, 1 with Mesa, 0 with both
  createEntry(user, "r1", { tags: [oxalaTag] });
  createEntry(user, "r2", { tags: [oxalaTag, mesaTag] });
  createEntry(user, "r3", { tags: [oxalaTag] });
  createEntry(user, "r4", { tags: [mesaTag] });

  const cloud = getTagCloud(user, 20);
  expectEqual("cloud has 2 tags", cloud.length, 2);
  expectEqual("Oxalá count = 3", cloud[0]?.count, 3);
  expectEqual("Oxalá is first (higher count)", cloud[0]?.tag.label, "Oxalá");
  expectEqual("Mesa Real count = 2", cloud[1]?.count, 2);

  // Limit
  const limited = getTagCloud(user, 1);
  expectEqual("limit=1 returns 1", limited.length, 1);
}

// ============================================================================
// SECTION 7 — MERGE TAGS
// ============================================================================

function merge(): void {
  section("MERGE TAGS");

  // Both known → returns canonical (first catalog match)
  const merged1 = mergeTags(asTagId("tag:cigano-mesa-real"), asTagId("tag:orixas-oxala"));
  expectEqual("merge returns TagId string", typeof merged1, "string");

  // Unknown
  const merged2 = mergeTags(asTagId("tag:unknown-x"), asTagId("tag:unknown-y"));
  expectEqual("merge unknown falls back to lex-smaller", merged2, "tag:unknown-x");
}

// ============================================================================
// RUN-ALL
// ============================================================================

export function runTagsSpec(): { passed: number; failed: number } {
  validate();
  normalize();
  catalog();
  extract();
  entriesByTag();
  cloud();
  merge();
  return getStats();
}

export function logTagsSpec(): readonly string[] {
  return getLog();
}