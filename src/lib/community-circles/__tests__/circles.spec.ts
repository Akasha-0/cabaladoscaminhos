// ============================================================================
// COMMUNITY CIRCLES — circles.spec.ts (Wave 69, 2026-06-30)
// ============================================================================
// Self-running test harness (expectEqual/expectTrue/expectClose/expectThrows).
// Mirrors smoke runtime check pattern; vitest can run identical specs
// once the binary is available. ~45 assertions across multiple sections.
// ============================================================================

import {
  THEMES,
  TRADITIONS,
  LOCALES,
  asCircleId,
  asUserId,
  auditCircleTaxonomy,
  createCircle,
  getCircle,
  getCircleBySlug,
  listCircles,
  updateCircle,
  archiveCircle,
  incrementMemberCount,
  setHmacSecret as setHmacSecretCircles,
  clearHmacSecret,
  clearAllStores,
  CircleNotFoundError,
  CircleValidationError,
  CircleForbiddenError,
  ThemeNotFoundError,
} from "../circles.ts";

import type {
  Circle,
  Visibility,
  JoinPolicy,
  Tradition,
  CircleId,
} from "../circles.ts";

// ============================================================================
// HARNESS
// ============================================================================

let _passed = 0;
let _failed = 0;
const _log: string[] = [];

function check(label: string, cond: boolean): void {
  if (cond) {
    _passed += 1;
    _log.push(`  ✓ ${label}`);
  } else {
    _failed += 1;
    _log.push(`  ✗ ${label}`);
  }
}

function section(name: string): void {
  _log.push(`\n[${name}]`);
}

function expectEqual<T>(label: string, actual: T, expected: T): void {
  check(label, actual === expected);
}

function expectThrows(label: string, fn: () => unknown, expectedName?: string): void {
  try {
    fn();
    _failed += 1;
    _log.push(`  ✗ ${label} (did not throw)`);
  } catch (e) {
    if (expectedName) {
      check(`${label} (${expectedName})`, (e as Error).name === expectedName);
    } else {
      _passed += 1;
      _log.push(`  ✓ ${label} (threw ${(e as Error).message.slice(0, 80)})`);
    }
  }
}

// ============================================================================
// FIXTURES
// ============================================================================

const CREATOR = asUserId("creator-circles-spec");
const OTHER = asUserId("other-circles-spec");
let c1: Circle;
let c2: Circle;

// ============================================================================
// SECTION 1 — THEMES REGISTRY
// ============================================================================

function themes(): void {
  section("THEMES REGISTRY");

  expectEqual("THEMES has 15+ entries", THEMES.length >= 15, true);
  expectEqual("TRADITIONS has 7 entries", TRADITIONS.length, 7);

  const ids = new Set(THEMES.map((t) => t.id));
  expectEqual("all theme IDs are unique", ids.size, THEMES.length);

  const requiredThemes = [
    "cigano-ramiro-iniciacao",
    "orixas-afoxe",
    "cabala-sefirot",
    "tarot-arcanos-maiores",
    "numerologia-caminho-vida",
    "astrologia-mapa-natal",
    "tantra-chakras",
  ];
  for (const id of requiredThemes) {
    check(`theme exists: ${id}`, THEMES.some((t) => t.id === id));
  }

  const tradSet = new Set(THEMES.map((t) => t.tradition));
  for (const t of TRADITIONS) {
    check(`tradition has at least 1 theme: ${t}`, tradSet.has(t));
  }

  // Locale coverage
  let localesOk = true;
  for (const theme of THEMES) {
    const keys = Object.keys(theme.names);
    if (!theme.names["pt-BR"] || !theme.names.en || !theme.names.es) {
      localesOk = false;
      break;
    }
    if (keys.length < LOCALES.length) {
      localesOk = false;
      break;
    }
  }
  expectEqual("all themes have pt-BR + en + es names", localesOk, true);

  // Sacred refs ≥ 3
  let refsOk = true;
  for (const theme of THEMES) {
    if (theme.sacredRefs.length < 3) {
      refsOk = false;
      break;
    }
  }
  expectEqual("all themes have ≥3 sacred refs", refsOk, true);

  // Each theme has min/max members in [5, 50]
  let capacitiesOk = true;
  for (const theme of THEMES) {
    if (theme.minMembers !== 5 || theme.maxMembers !== 50) {
      capacitiesOk = false;
      break;
    }
  }
  expectEqual("all themes have minMembers=5 and maxMembers=50", capacitiesOk, true);
}

// ============================================================================
// SECTION 2 — TAXONOMY AUDIT
// ============================================================================

function audit(): void {
  section("TAXONOMY AUDIT");
  const r = auditCircleTaxonomy();
  expectEqual("audit themesCount = THEMES.length", r.themesCount, THEMES.length);
  expectEqual("audit traditionsCount = 7", r.traditionsCount, 7);
  expectEqual("audit localitiesSupported includes pt-BR", r.localitiesSupported.includes("pt-BR"), true);
  expectEqual("audit allThemesHaveSacredRefs", r.allThemesHaveSacredRefs, true);
  expectEqual("audit allThemesHave3Locales", r.allThemesHave3Locales, true);
  expectEqual("audit maxMembersDefault=50", r.maxMembersDefault, 50);
  expectEqual("audit minMembersDefault=5", r.minMembersDefault, 5);
  expectEqual("audit visibilityOptions public/private", r.visibilityOptions.length, 2);
  expectEqual("audit joinPolicyOptions 3 entries", r.joinPolicyOptions.length, 3);
  expectEqual("audit governanceOptions 2 entries", r.governanceOptions.length, 2);
}

// ============================================================================
// SECTION 3 — CREATE CIRCLE
// ============================================================================

function create(): void {
  section("CREATE CIRCLE");
  setHmacSecretCircles("test-secret-circles");
  clearAllStores();

  c1 = createCircle(CREATOR, "cigano-ramiro-iniciacao", {
    visibility: "public",
    joinPolicy: "open",
    name: "Mesa Iniciantes",
    description: "Para iniciantes da Mesa Real",
  });

  expectEqual("createCircle returns id", typeof c1.id, "string");
  expectEqual("createCircle slug is derived from name", c1.slug, "mesa-iniciantes");
  expectEqual("createCircle tradition = Cigano", c1.tradition, "Cigano");
  expectEqual("createCircle visibility = public", c1.visibility, "public");
  expectEqual("createCircle joinPolicy = open", c1.joinPolicy, "open");
  expectEqual("createCircle governance default = creator-decides", c1.governance, "creator-decides");
  expectEqual("createCircle sacredRefs has 5", c1.sacredRefs.length, 5);
  expectEqual("createCircle memberCount = 1", c1.memberCount, 1);
  expectEqual("createCircle status = active", c1.status, "active");
  expectEqual("createCircle createdBy = CREATOR", c1.createdBy, CREATOR);
  expectEqual("createCircle themeId propagated", c1.themeId, "cigano-ramiro-iniciacao");

  // Default name from theme when not provided
  const c2obj = createCircle(CREATOR, "orixas-afoxe", {
    visibility: "private",
    joinPolicy: "invite",
  });
  expectEqual("createCircle default name = theme names[pt-BR]", c2obj.name, "Orixás — Afoxé");
  c2 = c2obj;
}

// ============================================================================
// SECTION 4 — CREATE CIRCLE VALIDATION
// ============================================================================

function createValidation(): void {
  section("CREATE — VALIDATION");

  expectThrows(
    "createCircle rejects unknown theme",
    () => createCircle(CREATOR, "nonexistent", { visibility: "public", joinPolicy: "open" }),
    "ThemeNotFoundError",
  );
  expectThrows(
    "createCircle rejects invalid visibility",
    () => createCircle(CREATOR, "cigano-ramiro-iniciacao", {
      visibility: "garbage" as Visibility,
      joinPolicy: "open",
    }),
    "CircleValidationError",
  );
  expectThrows(
    "createCircle rejects invalid joinPolicy",
    () => createCircle(CREATOR, "cigano-ramiro-iniciacao", {
      visibility: "public",
      joinPolicy: "garbage" as JoinPolicy,
    }),
    "CircleValidationError",
  );
  expectThrows(
    "createCircle rejects empty name",
    () => createCircle(CREATOR, "cigano-ramiro-iniciacao", {
      visibility: "public",
      joinPolicy: "open",
      name: "",
    }),
    "CircleValidationError",
  );
  expectThrows(
    "createCircle rejects name too long (>200)",
    () => createCircle(CREATOR, "cigano-ramiro-iniciacao", {
      visibility: "public",
      joinPolicy: "open",
      name: "x".repeat(201),
    }),
    "CircleValidationError",
  );
  expectThrows(
    "createCircle rejects description too long (>5000)",
    () => createCircle(CREATOR, "cigano-ramiro-iniciacao", {
      visibility: "public",
      joinPolicy: "open",
      description: "x".repeat(5001),
    }),
    "CircleValidationError",
  );
  expectThrows(
    "createCircle rejects invalid governance",
    () => createCircle(CREATOR, "cigano-ramiro-iniciacao", {
      visibility: "public",
      joinPolicy: "open",
      governance: "anarchy" as never,
    }),
    "CircleValidationError",
  );
}

// ============================================================================
// SECTION 5 — GET CIRCLE / LIST CIRCLES
// ============================================================================

function queries(): void {
  section("QUERIES — getCircle / listCircles");

  const fetched = getCircle(c1.id);
  expectEqual("getCircle returns same id", fetched.id, c1.id);

  expectThrows(
    "getCircle throws on unknown id",
    () => getCircle(asCircleId("nonexistent")),
    "CircleNotFoundError",
  );

  // listCircles
  const all = listCircles({ limit: 100 });
  expectEqual("listCircles total >= 2", all.total >= 2, true);
  const publicOnes = listCircles({ visibility: "public" });
  expectEqual("listCircles filter visibility=public total >= 1", publicOnes.total >= 1, true);
  const privateOnes = listCircles({ visibility: "private" });
  expectEqual("listCircles filter visibility=private includes c2", privateOnes.total >= 1, true);
  const tradFilter = listCircles({ tradition: "Cigano" as Tradition });
  expectEqual("listCircles filter tradition=Cigano includes c1", tradOnesSome(tradFilter, c1.id), true);
  const themeFilter = listCircles({ theme: "cigano-ramiro-iniciacao" });
  expectEqual("listCircles filter theme includes c1", tradOnesSome(themeFilter, c1.id), true);

  // Pagination
  const page = listCircles({ limit: 1, offset: 0 });
  expectEqual("listCircles limit=1 returns 1", page.circles.length, 1);
  expectEqual("listCircles limit=1 honors limit", page.limit, 1);
  expectEqual("listCircles limit=1 honors offset", page.offset, 0);

  expectThrows(
    "listCircles rejects limit<1",
    () => listCircles({ limit: 0 }),
    "CircleValidationError",
  );
  expectThrows(
    "listCircles rejects offset<0",
    () => listCircles({ offset: -1 }),
    "CircleValidationError",
  );

  // getCircleBySlug
  const bySlug = getCircleBySlug(c1.slug);
  expectEqual("getCircleBySlug returns same circle", bySlug.id, c1.id);
  expectThrows(
    "getCircleBySlug throws on missing",
    () => getCircleBySlug("no-such-slug"),
    "CircleNotFoundError",
  );
}

function tradOnesSome(list: { circles: readonly Circle[] }, id: CircleId): boolean {
  return list.circles.some((c) => c.id === id);
}

// ============================================================================
// SECTION 6 — UPDATE CIRCLE
// ============================================================================

function update(): void {
  section("UPDATE CIRCLE");

  const updated = updateCircle(c1.id, CREATOR, {
    name: "Mesa Avançada",
    description: "Para praticantes avançados",
  });
  expectEqual("updateCircle name replaced", updated.name, "Mesa Avançada");
  expectEqual("updateCircle description replaced", updated.description.startsWith("Para praticantes avançados"), true);

  const updated2 = updateCircle(c1.id, CREATOR, {
    visibility: "private",
    joinPolicy: "invite",
  });
  expectEqual("updateCircle visibility", updated2.visibility, "private");
  expectEqual("updateCircle joinPolicy", updated2.joinPolicy, "invite");

  // Forbidden: non-creator non-admin
  expectThrows(
    "updateCircle rejects non-creator non-admin",
    () => updateCircle(c1.id, OTHER, { name: "Hacked" }),
    "CircleForbiddenError",
  );

  // Admin override
  const adminUpdate = updateCircle(c1.id, OTHER, { name: "Admin Override" }, true);
  expectEqual("updateCircle admin can override", adminUpdate.name, "Admin Override");

  expectThrows(
    "updateCircle rejects empty name",
    () => updateCircle(c1.id, CREATOR, { name: "" }),
    "CircleValidationError",
  );
}

// ============================================================================
// SECTION 7 — ARCHIVE CIRCLE
// ============================================================================

function archive(): void {
  section("ARCHIVE CIRCLE");

  // Public archive (light scrub)
  const pub = createCircle(CREATOR, "cabala-sefirot", {
    visibility: "public",
    joinPolicy: "open",
    name: "Cabala Sefirot",
  });
  const archivedPublic = archiveCircle(pub.id, CREATOR, false);
  expectEqual("archiveCircle status=archived", archivedPublic.status, "archived");
  expectEqual("archiveCircle archivedAt set", typeof archivedPublic.archivedAt, "string");
  expectEqual("archiveCircle piiScrubbedAt set", typeof archivedPublic.piiScrubbedAt, "string");
  expectEqual("archiveCircle public — kept name (light scrub)", archivedPublic.name, "Cabala Sefirot");
  expectEqual("archiveCircle public — kept description", archivedPublic.description === "[conteúdo removido]", false);

  // Private archive (full purge)
  const priv = createCircle(CREATOR, "meditacao-diaria", {
    visibility: "private",
    joinPolicy: "invite",
    name: "Private Circle",
  });
  const archivedPriv = archiveCircle(priv.id, CREATOR);
  expectEqual("archiveCircle private — name replaced", archivedPriv.name.startsWith("[arquivado:"), true);
  expectEqual("archiveCircle private — desc scrubbed", archivedPriv.description, "[conteúdo removido]");
  expectEqual("archiveCircle private — memberCount reset to 0", archivedPriv.memberCount, 0);

  expectThrows(
    "archiveCircle rejects non-creator",
    () => archiveCircle(c1.id, OTHER),
    "CircleForbiddenError",
  );

  // Idempotent: archiving twice returns the same archived circle
  const archivedTwice = archiveCircle(archivedPublic.id, CREATOR, false);
  expectEqual("archiveCircle is idempotent", archivedTwice, archivedPublic);
}

// ============================================================================
// SECTION 8 — INCREMENT MEMBER COUNT
// ============================================================================

function memberCount(): void {
  section("INCREMENT MEMBER COUNT");
  const c = createCircle(CREATOR, "ayurveda", {
    visibility: "public",
    joinPolicy: "open",
    name: "Ayurveda Circle",
  });
  const c2 = incrementMemberCount(c.id, 1);
  expectEqual("incrementMemberCount +1 = 2", c2.memberCount, 2);
  const c0 = incrementMemberCount(c2.id, -1);
  expectEqual("incrementMemberCount -1 = 1", c0.memberCount, 1);
  const cUnchanged = incrementMemberCount(c0.id, 0);
  expectEqual("incrementMemberCount 0 = no change", cUnchanged.memberCount, 1);
}

// ============================================================================
// SECTION 9 — BRANDED TYPES
// ============================================================================

function brandedTypes(): void {
  section("BRANDED TYPES");
  const id = asCircleId("circle_x_y");
  expectEqual("asCircleId is string at runtime", typeof id, "string");
  expectEqual("asUserId is string at runtime", typeof asUserId("user_1"), "string");
}

// ============================================================================
// RUNNER
// ============================================================================

export function runCirclesSpec(): { passed: number; failed: number } {
  themes();
  audit();
  create();
  createValidation();
  queries();
  update();
  archive();
  memberCount();
  brandedTypes();
  clearHmacSecret();
  return { passed: _passed, failed: _failed };
}

export function logCirclesSpec(): readonly string[] {
  return _log;
}
