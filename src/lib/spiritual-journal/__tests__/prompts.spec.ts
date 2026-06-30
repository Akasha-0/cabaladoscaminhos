// ============================================================================
// SPIRITUAL JOURNAL — prompts.spec.ts (Wave 70, 2026-06-30)
// Self-running spec for prompts engine.
// 50+ assertions.
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
  asPromptId,
  PROMPTS,
  PROMPT_CATEGORIES,
  LOCALES,
  getDailyPrompt,
  getPromptsByCategory,
  getPromptsByTradition,
  getRandomPrompt,
  localizePrompt,
  auditPromptCatalog,
  PromptNotFoundError,
  type Locale,
  type Prompt,
  type UserState,
} from "../prompts.ts";

// ============================================================================
// SECTION 1 — CATALOG
// ============================================================================

function catalog(): void {
  section("PROMPTS CATALOG");

  expectEqual("PROMPTS has ≥50 entries", PROMPTS.length >= 50, true);
  expectEqual("PROMPT_CATEGORIES has 8 entries", PROMPT_CATEGORIES.length, 8);
  expectEqual("LOCALES has 3 entries", LOCALES.length, 3);

  // Every prompt has 3-locale i18n
  let allI18nOk = true;
  for (const p of PROMPTS) {
    if (!p.i18n["pt-BR"] || !p.i18n.en || !p.i18n.es) {
      allI18nOk = false;
      break;
    }
  }
  expectEqual("every prompt has 3-locale i18n", allI18nOk, true);

  // Every prompt has a valid category
  let catsOk = true;
  for (const p of PROMPTS) {
    if (!PROMPT_CATEGORIES.includes(p.category)) {
      catsOk = false;
      break;
    }
  }
  expectEqual("every prompt has valid category", catsOk, true);

  // Prompt IDs are unique
  const ids = new Set(PROMPTS.map((p) => p.id));
  expectEqual("prompt IDs unique", ids.size, PROMPTS.length);

  // PROMPTS is frozen
  expectEqual("PROMPTS is frozen", Object.isFrozen(PROMPTS), true);

  // Has prompts from all 7 traditions
  const cigano = PROMPTS.filter((p) => p.tradition === "Cigano");
  const orixas = PROMPTS.filter((p) => p.tradition === "Orixás");
  const astro = PROMPTS.filter((p) => p.tradition === "Astrologia");
  const cabala = PROMPTS.filter((p) => p.tradition === "Cabala");
  const numer = PROMPTS.filter((p) => p.tradition === "Numerologia");
  const tantra = PROMPTS.filter((p) => p.tradition === "Tantra");
  const tarot = PROMPTS.filter((p) => p.tradition === "Tarot");
  expectEqual("Cigano prompts ≥5", cigano.length >= 5, true);
  expectEqual("Orixás prompts ≥5", orixas.length >= 5, true);
  expectEqual("Astrologia prompts ≥5", astro.length >= 5, true);
  expectEqual("Cabala prompts ≥5", cabala.length >= 5, true);
  expectEqual("Numerologia prompts ≥5", numer.length >= 5, true);
  expectEqual("Tantra prompts ≥5", tantra.length >= 5, true);
  expectEqual("Tarot prompts ≥5", tarot.length >= 5, true);

  // Universal prompts
  const universal = PROMPTS.filter((p) => p.tradition === "universal");
  expectEqual("Universal prompts ≥5", universal.length >= 5, true);

  // All 8 categories represented
  for (const cat of PROMPT_CATEGORIES) {
    const arr = PROMPTS.filter((p) => p.category === cat);
    expectEqual(`category ${cat} has ≥1 prompt`, arr.length >= 1, true);
  }
}

// ============================================================================
// SECTION 2 — GET BY CATEGORY
// ============================================================================

function byCategory(): void {
  section("GET BY CATEGORY");

  const reflection = getPromptsByCategory("reflection");
  expectEqual("reflection has ≥3", reflection.length >= 3, true);
  expectEqual("reflection all have category", reflection.every((p) => p.category === "reflection"), true);

  const gratitude = getPromptsByCategory("gratitude");
  expectEqual("gratitude ≥3", gratitude.length >= 3, true);

  const shadow = getPromptsByCategory("shadow-work");
  expectEqual("shadow-work ≥2", shadow.length >= 2, true);

  // Returned is frozen
  expectEqual("getPromptsByCategory frozen", Object.isFrozen(reflection), true);
}

// ============================================================================
// SECTION 3 — GET BY TRADITION
// ============================================================================

function byTradition(): void {
  section("GET BY TRADITION");

  const cigano = getPromptsByTradition("Cigano");
  expectEqual("Cigano prompts ≥5", cigano.length >= 5, true);
  expectEqual("all Cigano", cigano.every((p) => p.tradition === "Cigano"), true);

  const orixas = getPromptsByTradition("Orixás");
  expectEqual("Orixás prompts ≥5", orixas.length >= 5, true);

  const tarot = getPromptsByTradition("Tarot");
  expectEqual("Tarot prompts ≥5", tarot.length >= 5, true);

  const numer = getPromptsByTradition("Numerologia");
  expectEqual("Numerologia prompts ≥5", numer.length >= 5, true);

  const tantra = getPromptsByTradition("Tantra");
  expectEqual("Tantra prompts ≥5", tantra.length >= 5, true);
}

// ============================================================================
// SECTION 4 — GET DAILY PROMPT
// ============================================================================

function daily(): void {
  section("GET DAILY PROMPT");

  // Deterministic per day
  const day1 = getDailyPrompt({ dayKey: "2026-06-30" });
  const day2 = getDailyPrompt({ dayKey: "2026-06-30" });
  expectEqual("same day → same prompt", day1.id, day2.id);

  const dayA = getDailyPrompt({ dayKey: "2026-06-30" });
  const dayB = getDailyPrompt({ dayKey: "2026-07-01" });
  // Different days may or may not differ; allow either but assert valid
  expectEqual("daily prompt has text", dayA.text.length > 0, true);
  expectEqual("daily prompt B has text", dayB.text.length > 0, true);

  // Tradition filter
  const cigano = getDailyPrompt({
    dayKey: "2026-07-15",
    tradition: "Cigano",
  });
  expectEqual("tradition filter: Cigano", cigano.tradition === "Cigano", true);

  const orixas = getDailyPrompt({
    dayKey: "2026-07-15",
    tradition: "Orixás",
  });
  expectEqual("tradition filter: Orixás", orixas.tradition === "Orixás", true);

  // Different odu = potentially different prompt (not guaranteed, but
  // both should be valid)
  const oduA = getDailyPrompt({ dayKey: "2026-07-20", currentOdu: "Oxalá" as never });
  const oduB = getDailyPrompt({ dayKey: "2026-07-20", currentOdu: "Ogum" as never });
  expectEqual("oduA valid", oduA.text.length > 0, true);
  expectEqual("oduB valid", oduB.text.length > 0, true);
}

// ============================================================================
// SECTION 5 — GET RANDOM PROMPT (deterministic by seed)
// ============================================================================

function random(): void {
  section("GET RANDOM PROMPT");

  // Same seed → same prompt
  const r1 = getRandomPrompt(42);
  const r2 = getRandomPrompt(42);
  expectEqual("same seed → same prompt", r1.id, r2.id);

  const r3 = getRandomPrompt(12345);
  const r4 = getRandomPrompt(99999);
  // Different seeds → likely different prompts (not strict)
  expectEqual("r3 valid", r3.text.length > 0, true);
  expectEqual("r4 valid", r4.text.length > 0, true);

  // Distribution check (100 seeds, should hit ≥10 distinct)
  const distinctIds = new Set<string>();
  for (let i = 0; i < 100; i++) distinctIds.add(getRandomPrompt(i).id);
  expectEqual("100 seeds → ≥10 distinct prompts", distinctIds.size >= 10, true);
}

// ============================================================================
// SECTION 6 — LOCALIZE PROMPT
// ============================================================================

function localize(): void {
  section("LOCALIZE PROMPT");

  const firstPrompt = PROMPTS[0];
  if (!firstPrompt) throw new Error("no prompts");

  const pt = localizePrompt(firstPrompt.id, "pt-BR");
  const en = localizePrompt(firstPrompt.id, "en");
  const es = localizePrompt(firstPrompt.id, "es");

  expectEqual("localize pt-BR has text", pt.length > 0, true);
  expectEqual("localize en has text", en.length > 0, true);
  expectEqual("localize es has text", es.length > 0, true);

  // Unknown prompt throws
  expectThrows(
    "localize unknown prompt throws PromptNotFoundError",
    () => localizePrompt(asPromptId("nope-prompt"), "pt-BR"),
    "PromptNotFoundError",
  );
}

// ============================================================================
// SECTION 7 — AUDIT
// ============================================================================

function audit(): void {
  section("PROMPTS AUDIT");

  const a = auditPromptCatalog();
  expectEqual("audit.totalPrompts ≥50", a.totalPrompts >= 50, true);
  expectEqual("audit.allHave3Locales", a.allHave3Locales, true);
  expectEqual("audit.allHaveCategory", a.allHaveCategory, true);
  expectEqual("audit.allHaveId", a.allHaveId, true);

  // All 7 traditions represented in byTradition
  const expectedTraditions = [
    "Cigano", "Orixás", "Astrologia", "Cabala",
    "Numerologia", "Tantra", "Tarot", "universal",
  ];
  for (const t of expectedTraditions) {
    expectEqual(`byTradition.${t} ≥1`, (a.byTradition[t] ?? 0) >= 1, true);
  }

  // All 8 categories represented in byCategory
  for (const c of PROMPT_CATEGORIES) {
    expectEqual(`byCategory.${c} ≥1`, a.byCategory[c] >= 1, true);
  }
}

// ============================================================================
// RUN-ALL
// ============================================================================

export function runPromptsSpec(): { passed: number; failed: number } {
  catalog();
  byCategory();
  byTradition();
  daily();
  random();
  localize();
  audit();
  return getStats();
}

export function logPromptsSpec(): readonly string[] {
  return getLog();
}