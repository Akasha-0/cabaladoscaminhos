/**
 * Smoke tests — Daily Reflection Prompt
 * ======================================
 * Target: 50+ assertions.
 *
 * Sections:
 *   A. Pool build (4)
 *   B. Rotation (3)
 *   C. Reflection fetch (3 per tradition × 6 = 18)
 *   D. Push payload (4)
 *   E. LGPD (3)
 *   F. PII redaction (4)
 *   G. Timezone (3)
 *   H. i18n (4)
 *   I. Error codes (4)
 *   J. Time-of-day adaptation (5)
 *
 * Total: 52 assertions.
 */

import { describe, it, expect } from "vitest";
import {
  buildReflectionPool,
  rotateReflectionPool,
  getDailyReflection,
  getReflectionForTradition,
  buildPushPayload,
  requiresLGPDConsent,
  assertLGPDConsent,
  redactReflectionPII,
  redactPIIFromString,
  isValidTimezone,
  resolveTimezone,
  isValidISODate,
  isValidISODateTime,
  isValidUUIDv4,
  isValidSacredRef,
  sanitizeSacredRefs,
  adaptToTimeOfDay,
  getLocalizedReflectionTime,
  t,
  ReflectionError,
  TRADITIONS,
  LOCALES,
  TIMES_OF_DAY,
  CIGANO_CARDS,
  ASTRO_SIGNS,
  SEFIROT,
  CHAKRAS,
  NUMEROLOGY_NUMBERS,
  ORIXAS_KNOWN,
  CITATION_SOURCES,
  I18N_BUNDLE,
  type Tradition,
  type Locale,
  type ReflectionSchedule,
  type TimeOfDay,
} from "../daily_reflection_prompt";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const VALID_DATE = "2026-06-29";

const baseSchedule: ReflectionSchedule = {
  userId: "user-001",
  locale: "pt-BR",
  preferredTraditions: ["cigano", "astrologia", "orixas", "cabala", "tantra", "numerologia"],
  preferredTimes: ["morning", "evening"],
  pushEnabled: true,
  pushConsentId: "550e8400-e29b-41d4-a716-446655440000", // valid UUID v4
  emailEnabled: true,
  emailConsentId: "550e8400-e29b-41d4-a716-446655440001",
  timezone: "America/Sao_Paulo",
};

// ---------------------------------------------------------------------------
// A. Pool build (4 assertions)
// ---------------------------------------------------------------------------

describe("A. buildReflectionPool", () => {
  it("produces 30 entries by default (4 traditions × ceil)", () => {
    const pool = buildReflectionPool(42, "pt-BR", ["cigano", "astrologia", "orixas", "cabala"], 30);
    expect(pool.entries).toHaveLength(30);
    expect(pool.rotationSeed).toBe(42);
    expect(pool.entries[0]?.locale).toBe("pt-BR");
  });

  it("distributes entries across all requested traditions", () => {
    const pool = buildReflectionPool(7, "en-US", TRADITIONS, 36);
    const seen = new Set(pool.entries.map((e) => e.tradition));
    expect(seen.size).toBe(TRADITIONS.length);
  });

  it("is deterministic for the same seed", () => {
    const a = buildReflectionPool(99, "pt-BR", ["cigano"], 12);
    const b = buildReflectionPool(99, "pt-BR", ["cigano"], 12);
    expect(a.entries.map((e) => e.id)).toEqual(b.entries.map((e) => e.id));
  });

  it("rejects invalid pool size > 1000", () => {
    expect(() => buildReflectionPool(1, "pt-BR", ["cigano"], 1001)).toThrow(ReflectionError);
  });
});

// ---------------------------------------------------------------------------
// B. Rotation (3 assertions)
// ---------------------------------------------------------------------------

describe("B. rotateReflectionPool", () => {
  it("stamps entries with the rotation date and rewrites IDs", () => {
    const pool = buildReflectionPool(11, "pt-BR", ["cigano"], 6);
    const rotated = rotateReflectionPool(pool, VALID_DATE);
    expect(rotated.entries[0]?.date).toBe(VALID_DATE);
    expect(rotated.entries[0]?.id).toContain(VALID_DATE);
  });

  it("produces stable IDs for same date + same rotationSeed", () => {
    const pool = buildReflectionPool(123, "pt-BR", ["cigano"], 4);
    const a = rotateReflectionPool(pool, VALID_DATE);
    const b = rotateReflectionPool(pool, VALID_DATE);
    expect(a.entries.map((e) => e.id)).toEqual(b.entries.map((e) => e.id));
  });

  it("attaches citations after rotation", () => {
    const pool = buildReflectionPool(7, "pt-BR", ["cigano", "cabala"], 8);
    const rotated = rotateReflectionPool(pool, VALID_DATE);
    const withCitation = rotated.entries.filter((e) => e.citation !== undefined);
    expect(withCitation.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// C. Reflection fetch (3 per tradition × 6 = 18 assertions)
// ---------------------------------------------------------------------------

describe("C. getReflectionForTradition", () => {
  const traditions: readonly Tradition[] = [
    "cigano",
    "astrologia",
    "orixas",
    "cabala",
    "tantra",
    "numerologia",
  ];
  for (const tr of traditions) {
    it(`${tr}: returns a non-empty prompt (max 280 chars)`, () => {
      const entry = getReflectionForTradition(tr, "pt-BR", VALID_DATE);
      expect(entry.prompt.length).toBeGreaterThan(0);
      expect(entry.prompt.length).toBeLessThanOrEqual(280);
    });
    it(`${tr}: returns a non-empty context (max 500 chars)`, () => {
      const entry = getReflectionForTradition(tr, "pt-BR", VALID_DATE);
      expect(entry.context.length).toBeGreaterThan(0);
      expect(entry.context.length).toBeLessThanOrEqual(500);
    });
    it(`${tr}: has valid sacred refs for the tradition`, () => {
      const entry = getReflectionForTradition(tr, "pt-BR", VALID_DATE);
      expect(entry.sacredRefs.length).toBeGreaterThan(0);
      for (const r of entry.sacredRefs) {
        expect(isValidSacredRef(tr, r)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// D. Push payload (4 assertions)
// ---------------------------------------------------------------------------

describe("D. buildPushPayload", () => {
  it("honors title max 65 chars and body max 240 chars", () => {
    const entry = getReflectionForTradition("cigano", "pt-BR", VALID_DATE);
    const payload = buildPushPayload(entry, baseSchedule);
    expect(payload.title.length).toBeLessThanOrEqual(65);
    expect(payload.body.length).toBeLessThanOrEqual(240);
  });

  it("includes a deep link, reflectionId, tradition, and locale in data", () => {
    const entry = getReflectionForTradition("cabala", "pt-BR", VALID_DATE);
    const payload = buildPushPayload(entry, baseSchedule);
    expect(payload.data.reflectionId).toBe(entry.id);
    expect(payload.data.tradition).toBe("cabala");
    expect(payload.data.locale).toBe("pt-BR");
    expect(payload.data.deepLink).toContain(entry.id);
  });

  it("uses the entry id as the tag (for dedup)", () => {
    const entry = getReflectionForTradition("astrologia", "pt-BR", VALID_DATE);
    const payload = buildPushPayload(entry, baseSchedule);
    expect(payload.tag).toBe(entry.id);
  });

  it("localizes title per locale", () => {
    const entry = getReflectionForTradition("cigano", "es-ES", VALID_DATE);
    const payload = buildPushPayload(entry, { ...baseSchedule, locale: "es-ES" });
    expect(payload.title).toContain("Reflexión");
  });
});

// ---------------------------------------------------------------------------
// E. LGPD (3 assertions)
// ---------------------------------------------------------------------------

describe("E. LGPD consent", () => {
  it("grants push+email when both consentIds are valid UUIDv4", () => {
    const gate = requiresLGPDConsent(baseSchedule);
    expect(gate.push).toBe(true);
    expect(gate.email).toBe(true);
  });

  it("denies push when pushConsentId is missing", () => {
    const gate = requiresLGPDConsent({ ...baseSchedule, pushConsentId: undefined });
    expect(gate.push).toBe(false);
  });

  it("denies email when emailConsentId is not a valid UUIDv4", () => {
    const gate = requiresLGPDConsent({ ...baseSchedule, emailConsentId: "not-a-uuid" });
    expect(gate.email).toBe(false);
    expect(() => assertLGPDConsent({ ...baseSchedule, emailConsentId: "not-a-uuid" }, "email")).toThrow(
      ReflectionError,
    );
  });
});

// ---------------------------------------------------------------------------
// F. PII redaction (4 assertions)
// ---------------------------------------------------------------------------

describe("F. PII redaction", () => {
  it("redacts email addresses from prompt and context", () => {
    const dirty = "Mande sua dúvida para fulano@example.com hoje.";
    const clean = redactPIIFromString(dirty);
    expect(clean).not.toContain("fulano@example.com");
    expect(clean).toContain("[REDACTED_EMAIL]");
  });

  it("redacts Brazilian phone numbers", () => {
    const dirty = "Ligue (11) 98765-4321 agora";
    const clean = redactPIIFromString(dirty);
    expect(clean).not.toContain("98765-4321");
    expect(clean).toContain("[REDACTED_PHONE]");
  });

  it("redacts CPF (Brazilian tax ID)", () => {
    const dirty = "Meu CPF é 123.456.789-09 e meu RG é 12.345.678-9";
    const clean = redactPIIFromString(dirty);
    expect(clean).not.toContain("123.456.789-09");
    expect(clean).toContain("[REDACTED_CPF]");
  });

  it("redacts credit-card-like sequences", () => {
    const dirty = "Pague com 4111 1111 1111 1111 ou 5500 0000 0000 0004";
    const clean = redactPIIFromString(dirty);
    expect(clean).not.toContain("4111 1111 1111 1111");
    expect(clean).toContain("[REDACTED_CC]");
  });
});

// ---------------------------------------------------------------------------
// G. Timezone (3 assertions)
// ---------------------------------------------------------------------------

describe("G. Timezone handling", () => {
  it("validates known IANA zones", () => {
    expect(isValidTimezone("America/Sao_Paulo")).toBe(true);
    expect(isValidTimezone("Europe/Lisbon")).toBe(true);
    expect(isValidTimezone("Asia/Tokyo")).toBe(true);
  });

  it("rejects unknown timezone strings", () => {
    expect(isValidTimezone("Atlantis/Deep_Sea")).toBe(false);
    expect(isValidTimezone("not-a-tz")).toBe(false);
  });

  it("returns a valid ISO datetime for a real timezone + date", () => {
    const iso = getLocalizedReflectionTime("morning", "America/Sao_Paulo", VALID_DATE);
    expect(isValidISODateTime(iso)).toBe(true);
    expect(iso.startsWith(VALID_DATE)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// H. i18n (4 assertions)
// ---------------------------------------------------------------------------

describe("H. i18n", () => {
  it("has 8 keys per locale", () => {
    for (const loc of LOCALES) {
      expect(Object.keys(I18N_BUNDLE[loc]).length).toBeGreaterThanOrEqual(8);
    }
  });

  it("returns localized title in pt-BR", () => {
    expect(t("pt-BR", "reflection.title")).toBe("Reflexão do Dia");
  });

  it("returns localized title in en-US", () => {
    expect(t("en-US", "reflection.title")).toBe("Daily Reflection");
  });

  it("returns localized title in es-ES", () => {
    expect(t("es-ES", "reflection.title")).toBe("Reflexión del Día");
  });
});

// ---------------------------------------------------------------------------
// I. Error codes (4 assertions)
// ---------------------------------------------------------------------------

describe("I. ReflectionError codes", () => {
  it("INVALID_DATE for bad date", () => {
    try {
      getReflectionForTradition("cigano", "pt-BR", "29-06-2026");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ReflectionError);
      expect((err as ReflectionError).code).toBe("INVALID_DATE");
    }
  });

  it("INVALID_LOCALE for unknown locale", () => {
    expect(() => buildReflectionPool(1, "fr-FR" as unknown as Locale, ["cigano"])).toThrow(ReflectionError);
  });

  it("INVALID_TRADITION for unknown tradition", () => {
    expect(() =>
      buildReflectionPool(1, "pt-BR", ["alquimia" as unknown as Tradition]),
    ).toThrow(ReflectionError);
  });

  it("POOL_EMPTY for zero-size pool", () => {
    expect(() => buildReflectionPool(1, "pt-BR", ["cigano"], 0)).toThrow(ReflectionError);
  });
});

// ---------------------------------------------------------------------------
// J. Time-of-day adaptation (5 assertions)
// ---------------------------------------------------------------------------

describe("J. adaptToTimeOfDay", () => {
  it("changes the timeOfDay field on the entry", () => {
    const entry = getReflectionForTradition("cigano", "pt-BR", VALID_DATE);
    const adapted = adaptToTimeOfDay(entry, "night");
    expect(adapted.timeOfDay).toBe("night");
  });

  it("prepends a localized prefix per time-of-day", () => {
    const entry = getReflectionForTradition("astrologia", "pt-BR", VALID_DATE);
    const night = adaptToTimeOfDay(entry, "night");
    expect(night.prompt).toMatch(/noite/i);
    const morning = adaptToTimeOfDay(entry, "morning");
    expect(morning.prompt).toMatch(/manhã/i);
  });

  it("appends the tone descriptor to the context", () => {
    const entry = getReflectionForTradition("cabala", "en-US", VALID_DATE);
    const dawn = adaptToTimeOfDay(entry, "dawn");
    expect(dawn.context).toMatch(/light and hopeful/);
  });

  it("preserves tradition, locale, sacredRefs", () => {
    const entry = getReflectionForTradition("orixas", "es-ES", VALID_DATE);
    const adapted = adaptToTimeOfDay(entry, "evening");
    expect(adapted.tradition).toBe("orixas");
    expect(adapted.locale).toBe("es-ES");
    expect(adapted.sacredRefs).toEqual(entry.sacredRefs);
  });

  it("keeps the prompt within the 280-char cap", () => {
    const entry = getReflectionForTradition("tantra", "pt-BR", VALID_DATE);
    for (const tod of TIMES_OF_DAY) {
      const adapted = adaptToTimeOfDay(entry, tod);
      expect(adapted.prompt.length).toBeLessThanOrEqual(280);
    }
  });
});

// ---------------------------------------------------------------------------
// K. Sacred refs (bonus) — covers spec §6 deeply
// ---------------------------------------------------------------------------

describe("K. Sacred refs validation", () => {
  it("Cigano accepts 1-cavaleiro through 36-cruz", () => {
    expect(isValidSacredRef("cigano", "1-cavaleiro")).toBe(true);
    expect(isValidSacredRef("cigano", "36-cruz")).toBe(true);
    expect(isValidSacredRef("cigano", "99-fantasma")).toBe(false);
  });

  it("Astrologia accepts planets, signs, houses, lilith, mc", () => {
    expect(isValidSacredRef("astrologia", "mercurio")).toBe(true);
    expect(isValidSacredRef("astrologia", "escorpiao")).toBe(true);
    expect(isValidSacredRef("astrologia", "casa-8")).toBe(true);
    expect(isValidSacredRef("astrologia", "lilith")).toBe(true);
    expect(isValidSacredRef("astrologia", "mc")).toBe(true);
  });

  it("Orixas accepts known entities, rejects unknown", () => {
    expect(isValidSacredRef("orixas", "exu")).toBe(true);
    expect(isValidSacredRef("orixas", "ogum")).toBe(true);
    expect(isValidSacredRef("orixas", "alien")).toBe(false);
  });

  it("Cabala accepts the 10 Sefirot + worlds", () => {
    for (const s of SEFIROT) {
      expect(isValidSacredRef("cabala", s)).toBe(true);
    }
    expect(isValidSacredRef("cabala", "atziluth")).toBe(true);
  });

  it("Tantra accepts 7 chakras + extras", () => {
    for (const c of CHAKRAS) {
      expect(isValidSacredRef("tantra", c)).toBe(true);
    }
    expect(isValidSacredRef("tantra", "kundalini")).toBe(true);
  });

  it("Numerologia accepts 1-9 + 11/22/33 only", () => {
    for (const n of NUMEROLOGY_NUMBERS) {
      expect(isValidSacredRef("numerologia", String(n))).toBe(true);
    }
    expect(isValidSacredRef("numerologia", "10")).toBe(false);
    expect(isValidSacredRef("numerologia", "44")).toBe(false);
  });

  it("sanitizeSacredRefs drops invalid + dedupes", () => {
    const out = sanitizeSacredRefs("cigano", ["1-cavaleiro", "99-fake", "1-cavaleiro"]);
    expect(out).toEqual(["1-cavaleiro"]);
  });
});

// ---------------------------------------------------------------------------
// L. Citation system (bonus)
// ---------------------------------------------------------------------------

describe("L. Citation system", () => {
  it("has at least 6 distinct sources", () => {
    expect(Object.keys(CITATION_SOURCES).length).toBeGreaterThanOrEqual(6);
  });

  it("includes recognized names", () => {
    expect("Tarot Cigano Ramiro" in CITATION_SOURCES).toBe(true);
    expect("Zohar" in CITATION_SOURCES).toBe(true);
    expect("Pitágoras" in CITATION_SOURCES).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// M. isValidISODate / isValidISODateTime / isValidUUIDv4 (bonus)
// ---------------------------------------------------------------------------

describe("M. Date / UUID validators", () => {
  it("isValidISODate accepts YYYY-MM-DD and rejects junk", () => {
    expect(isValidISODate("2026-06-29")).toBe(true);
    expect(isValidISODate("2026-13-01")).toBe(false);
    expect(isValidISODate("not-a-date")).toBe(false);
  });

  it("isValidISODateTime accepts ISO 8601 with offset", () => {
    expect(isValidISODateTime("2026-06-29T08:00:00Z")).toBe(true);
    expect(isValidISODateTime("2026-06-29T08:00:00-03:00")).toBe(true);
    expect(isValidISODateTime("hello")).toBe(false);
  });

  it("isValidUUIDv4 enforces version-4 shape", () => {
    expect(isValidUUIDv4("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUUIDv4("550e8400-e29b-11d4-a716-446655440000")).toBe(false); // v1
    expect(isValidUUIDv4("not-a-uuid")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// N. getDailyReflection end-to-end (bonus)
// ---------------------------------------------------------------------------

describe("N. getDailyReflection end-to-end", () => {
  it("returns entry + alternatives + nextScheduledAt", () => {
    const pool = buildReflectionPool(7, "pt-BR", TRADITIONS, 30);
    const daily = getDailyReflection(VALID_DATE, baseSchedule, pool);
    expect(daily.entry.id.length).toBeGreaterThan(0);
    expect(daily.nextScheduledAt.length).toBeGreaterThan(0);
    expect(daily.alternatives.length).toBeGreaterThanOrEqual(2);
    expect(daily.alternatives.length).toBeLessThanOrEqual(3);
  });

  it("is stable for same userId + date + pool", () => {
    const pool = buildReflectionPool(7, "pt-BR", TRADITIONS, 30);
    const a = getDailyReflection(VALID_DATE, baseSchedule, pool);
    const b = getDailyReflection(VALID_DATE, baseSchedule, pool);
    expect(a.entry.id).toBe(b.entry.id);
  });

  it("differs for different userIds", () => {
    const pool = buildReflectionPool(7, "pt-BR", TRADITIONS, 60);
    const a = getDailyReflection(VALID_DATE, baseSchedule, pool);
    const b = getDailyReflection(VALID_DATE, { ...baseSchedule, userId: "user-002" }, pool);
    // The entries can collide by chance but the *seed* differs
    expect(a.entry.id).not.toBe(b.entry.id);
  });
});

// ---------------------------------------------------------------------------
// O. Constants sanity (bonus)
// ---------------------------------------------------------------------------

describe("O. Constants", () => {
  it("CIGANO_CARDS has exactly 36 entries", () => {
    expect(CIGANO_CARDS).toHaveLength(36);
  });

  it("ASTRO_SIGNS has 12 entries", () => {
    expect(ASTRO_SIGNS).toHaveLength(12);
  });

  it("SEFIROT has 10 entries", () => {
    expect(SEFIROT).toHaveLength(10);
  });

  it("CHAKRAS has 7 entries", () => {
    expect(CHAKRAS).toHaveLength(7);
  });

  it("ORIXAS_KNOWN has at least 12 entries", () => {
    expect(ORIXAS_KNOWN.size).toBeGreaterThanOrEqual(12);
  });
});

// ---------------------------------------------------------------------------
// P. Time-of-day helpers (bonus)
// ---------------------------------------------------------------------------

describe("P. getLocalizedReflectionTime", () => {
  it("emits a valid ISO datetime for dawn in São Paulo", () => {
    const iso = getLocalizedReflectionTime("dawn", "America/Sao_Paulo", VALID_DATE);
    expect(isValidISODateTime(iso)).toBe(true);
  });

  it("emits different hours for dawn vs night", () => {
    const dawn = getLocalizedReflectionTime("dawn", "America/Sao_Paulo", VALID_DATE);
    const night = getLocalizedReflectionTime("night", "America/Sao_Paulo", VALID_DATE);
    expect(dawn).not.toBe(night);
  });

  it("emits different ISO strings for different timezones", () => {
    const sp = getLocalizedReflectionTime("morning", "America/Sao_Paulo", VALID_DATE);
    const lis = getLocalizedReflectionTime("morning", "Europe/Lisbon", VALID_DATE);
    // SP is UTC-3, Lisbon is UTC+1 (with DST) — instant differs
    expect(sp).not.toBe(lis);
  });
});

// ---------------------------------------------------------------------------
// Q. redactReflectionPII (bonus)
// ---------------------------------------------------------------------------

describe("Q. redactReflectionPII preserves metadata", () => {
  it("keeps id, tradition, locale, date, timeOfDay intact", () => {
    const entry = getReflectionForTradition("numerologia", "pt-BR", VALID_DATE);
    const clean = redactReflectionPII(entry);
    expect(clean.id).toBe(entry.id);
    expect(clean.tradition).toBe(entry.tradition);
    expect(clean.locale).toBe(entry.locale);
    expect(clean.date).toBe(entry.date);
    expect(clean.timeOfDay).toBe(entry.timeOfDay);
  });
});

// ---------------------------------------------------------------------------
// R. resolveTimezone (bonus)
// ---------------------------------------------------------------------------

describe("R. resolveTimezone", () => {
  it("returns the input if valid", () => {
    expect(resolveTimezone("America/Sao_Paulo")).toBe("America/Sao_Paulo");
  });

  it("falls back to America/Sao_Paulo for invalid input", () => {
    expect(resolveTimezone("Atlantis/Deep_Sea")).toBe("America/Sao_Paulo");
  });
});
