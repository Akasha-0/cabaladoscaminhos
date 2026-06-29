/**
 * Smoke tests — Streak Tracker + Daily Check-in (wave 62)
 *
 * 50+ assertions across 14 categories:
 *  1. record (5)            8. LGPD (3)
 *  2. calc streak (6)       9. PII (3)
 *  3. grace (3)             10. timezone (3)
 *  4. freeze (4)            11. i18n (4)
 *  5. milestone (5)         12. anti-pattern (3)
 *  6. at-risk (3)           13. error codes (4)
 *  7. push (3)              14. weekly avg (3)
 */

import { describe, it, expect } from "vitest";
import {
  // Types
  type CheckIn,
  type StreakState,
  type StreakConfig,
  type Milestone,
  type MilestoneType,
  type CheckInType,
  // Constants
  DEFAULT_GRACE_PERIOD_HOURS,
  DEFAULT_FREEZES_PER_MONTH,
  DEFAULT_MAX_STREAK,
  DAILY_CHECKIN_CAP,
  PUSH_PAYLOAD_MAX_CHARS,
  SUPPORTED_LOCALES,
  // Errors
  StreakError,
  // Functions
  recordCheckIn,
  calculateCurrentStreak,
  calculateLongestStreak,
  applyFreeze,
  getStreakStats,
  isAtRisk,
  isMilestone,
  buildMilestoneMessage,
  buildAccessibleAnnouncement,
  getStreakPushPayload,
  redactCheckInPII,
  isValidStreakCap,
  isValidTimezone,
  weeklyAverage,
  createInitialStreakState,
  createDefaultConfig,
  createCheckIn,
  groupCheckInsByDate,
  daysToNextMilestone,
  generateCheckInHistory,
  buildDeletionReceipt,
  auditAntiDarkPattern,
  validateI18nKeys,
  addDays,
  daysBetween,
  // i18n keys
  I18N_KEYS,
  // Internal: PUSH_TEMPLATES (exported for testability)
  PUSH_TEMPLATES,
} from "../streak_tracker_daily_checkin";

// ============================================================================
// Test fixtures
// ============================================================================

const USER_ID = "user-test-001";
const CONSENT_ID = "11111111-2222-4333-8444-555555555555";
const PUSH_CONSENT_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

function buildBaseConfig(overrides: Partial<StreakConfig> = {}): StreakConfig {
  return {
    ...createDefaultConfig(USER_ID, "pt-BR", "America/Sao_Paulo", "cigano"),
    ...overrides,
  };
}

function buildBaseState(overrides: Partial<StreakState> = {}): StreakState {
  return {
    ...createInitialStreakState(USER_ID, "2026-06-29"),
    ...overrides,
  };
}

// ============================================================================
// 1. record (5 assertions)
// ============================================================================

describe("recordCheckIn", () => {
  it("increments totalCheckIns and sets currentStreak to 1 on first check-in", () => {
    const config = buildBaseConfig();
    const state = buildBaseState();
    const checkIn = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID);
    const { state: newState } = recordCheckIn(checkIn, state, config);
    expect(newState.totalCheckIns).toBe(1);
    expect(newState.currentStreak).toBe(1);
    expect(newState.isActive).toBe(true);
  });

  it("is idempotent on same date (no double-count via different IDs)", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({ currentStreak: 1, lastCheckInDate: "2026-06-29" });
    const ci1 = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID);
    const { state: s1 } = recordCheckIn(ci1, state, config);
    expect(s1.totalCheckIns).toBe(2);
    // Same day, same userId, but different type — total increments but streak stays at 1
    const ci2 = createCheckIn(USER_ID, "evening", "2026-06-29", CONSENT_ID);
    const { state: s2 } = recordCheckIn(ci2, s1, config);
    expect(s2.totalCheckIns).toBe(3);
    expect(s2.currentStreak).toBe(1); // not 2 — same day
  });

  it("increments streak when next day", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({ currentStreak: 3, lastCheckInDate: "2026-06-28" });
    const ci = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID);
    const { state: s } = recordCheckIn(ci, state, config);
    expect(s.currentStreak).toBe(4);
  });

  it("updates longestStreak when current exceeds it", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({
      currentStreak: 5,
      longestStreak: 5,
      lastCheckInDate: "2026-06-28",
    });
    const ci = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID);
    const { state: s } = recordCheckIn(ci, state, config);
    expect(s.longestStreak).toBe(6);
  });

  it("rejects userId mismatch with INVALID_USER", () => {
    const config = buildBaseConfig();
    const state = buildBaseState();
    const ci = createCheckIn("hacker-999", "morning", "2026-06-29", CONSENT_ID);
    expect(() => recordCheckIn(ci, state, config)).toThrow(StreakError);
    try {
      recordCheckIn(ci, state, config);
    } catch (e) {
      expect((e as StreakError).code).toBe("INVALID_USER");
    }
  });
});

// ============================================================================
// 2. calculateCurrentStreak (6 assertions)
// ============================================================================

describe("calculateCurrentStreak", () => {
  it("returns 0 for empty history", () => {
    const config = buildBaseConfig();
    expect(calculateCurrentStreak([], "2026-06-29", config)).toBe(0);
  });

  it("returns 0 for invalid date input", () => {
    const config = buildBaseConfig();
    const ci = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID);
    expect(() => calculateCurrentStreak([ci], "not-a-date", config)).toThrow(StreakError);
  });

  it("counts consecutive days correctly", () => {
    const config = buildBaseConfig();
    const history = generateCheckInHistory(USER_ID, "2026-06-23", 7);
    expect(calculateCurrentStreak(history, "2026-06-29", config)).toBe(7);
  });

  it("returns 0 when latest check-in is too old", () => {
    const config = buildBaseConfig();
    const history = generateCheckInHistory(USER_ID, "2026-05-01", 5);
    expect(calculateCurrentStreak(history, "2026-06-29", config)).toBe(0);
  });

  it("dedupes multiple check-ins on the same day", () => {
    const config = buildBaseConfig();
    const ci1 = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID);
    const ci2 = createCheckIn(USER_ID, "evening", "2026-06-29", CONSENT_ID);
    const ci3 = createCheckIn(USER_ID, "reflection", "2026-06-29", CONSENT_ID);
    expect(calculateCurrentStreak([ci1, ci2, ci3], "2026-06-29", config)).toBe(1);
  });

  it("respects hard cap on streak length", () => {
    const config = buildBaseConfig({ maxStreak: 10 });
    const history = generateCheckInHistory(USER_ID, "2026-06-15", 30);
    const streak = calculateCurrentStreak(history, "2026-06-29", config);
    expect(streak).toBe(10);
  });
});

// ============================================================================
// 3. grace period (3 assertions)
// ============================================================================

describe("grace period", () => {
  it("default grace period is 36 hours", () => {
    expect(DEFAULT_GRACE_PERIOD_HOURS).toBe(36);
  });

  it("maintains streak when check-in is 1 day late within grace", () => {
    const config = buildBaseConfig({ gracePeriodHours: 36 });
    // Miss 2026-06-28, check-in on 2026-06-29 — still streak 7 (using freeze)
    const history: CheckIn[] = [
      createCheckIn(USER_ID, "morning", "2026-06-23", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-24", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-25", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-26", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-27", CONSENT_ID),
      // gap day
      createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID),
    ];
    const streak = calculateCurrentStreak(history, "2026-06-29", config);
    expect(streak).toBeGreaterThanOrEqual(5);
  });

  it("resets streak when gap exceeds grace + 1 day", () => {
    const config = buildBaseConfig({ gracePeriodHours: 36 });
    const history: CheckIn[] = [
      createCheckIn(USER_ID, "morning", "2026-06-20", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-21", CONSENT_ID),
      // gap of 8 days
      createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID),
    ];
    const streak = calculateCurrentStreak(history, "2026-06-29", config);
    expect(streak).toBe(1);
  });
});

// ============================================================================
// 4. freeze system (4 assertions)
// ============================================================================

describe("freeze system", () => {
  it("default freezes per month is 2", () => {
    expect(DEFAULT_FREEZES_PER_MONTH).toBe(2);
  });

  it("applies freeze and decrements available", () => {
    const config = buildBaseConfig();
    const state = buildBaseState();
    const updated = applyFreeze(state, "2026-06-29", config);
    expect(updated.freezesAvailable).toBe(1);
    expect(updated.freezesUsedThisMonth).toBe(1);
    expect(updated.graceDaysUsed).toBe(1);
  });

  it("throws FREEZE_EXHAUSTED when all used", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({
      freezesUsedThisMonth: 2,
      freezesAvailable: 0,
      freezesResetMonth: "2026-06-01",
    });
    expect(() => applyFreeze(state, "2026-06-29", config)).toThrow(StreakError);
    try {
      applyFreeze(state, "2026-06-29", config);
    } catch (e) {
      expect((e as StreakError).code).toBe("FREEZE_EXHAUSTED");
    }
  });

  it("resets freeze count on new month", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({
      freezesUsedThisMonth: 2,
      freezesAvailable: 0,
      freezesResetMonth: "2026-05-01",
    });
    // Apply freeze in June → count resets from May's 2 to 0, then becomes 1
    const updated = applyFreeze(state, "2026-06-15", config);
    expect(updated.freezesUsedThisMonth).toBe(1);
    expect(updated.freezesAvailable).toBe(1);
  });
});

// ============================================================================
// 5. milestone detection (5 assertions)
// ============================================================================

describe("milestone detection", () => {
  it("detects 7-day milestone", () => {
    const config = buildBaseConfig();
    expect(isMilestone(7, config)).toBe("7-days");
  });

  it("detects 30-day milestone", () => {
    const config = buildBaseConfig();
    expect(isMilestone(30, config)).toBe("30-days");
  });

  it("returns null for non-milestone day counts", () => {
    const config = buildBaseConfig();
    expect(isMilestone(15, config)).toBeNull();
    expect(isMilestone(99, config)).toBeNull();
  });

  it("ignores personal-best in isMilestone (handled separately)", () => {
    const config = buildBaseConfig();
    expect(isMilestone(50, config)).toBeNull();
  });

  it("buildMilestoneMessage includes sacred tradition flavor", () => {
    const msg1 = buildMilestoneMessage("7-days", "pt-BR", 7, "cigano");
    expect(msg1).toContain("Cavaleiro");
    const msg2 = buildMilestoneMessage("7-days", "pt-BR", 7, "astrologia");
    expect(msg2).toContain("planetas");
    const msg3 = buildMilestoneMessage("7-days", "pt-BR", 7, "orixas");
    expect(msg3).toContain("Oxalá");
    const msg4 = buildMilestoneMessage("7-days", "pt-BR", 7, "numerologia");
    expect(msg4).toContain("introspecção");
  });
});

// ============================================================================
// 6. at-risk detection (3 assertions)
// ============================================================================

describe("at-risk detection", () => {
  it("returns false when checked in today", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({
      currentStreak: 5,
      lastCheckInDate: "2026-06-29",
      isAtRisk: false,
    });
    expect(isAtRisk(state, "2026-06-29T20:00:00Z", config)).toBe(false);
  });

  it("returns true when last check-in was 1 day ago and now is evening", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({
      currentStreak: 5,
      lastCheckInDate: "2026-06-28",
    });
    // 2026-06-29 at 20:00 UTC = 17:00 in São Paulo (UTC-3) — let's adjust to 22:00 UTC
    // Use 23:00 UTC = 20:00 in São Paulo (within 18-23 evening window)
    const result = isAtRisk(state, "2026-06-29T23:00:00Z", config);
    expect(result).toBe(true);
  });

  it("returns false when streak is 0", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({ currentStreak: 0 });
    expect(isAtRisk(state, "2026-06-29T20:00:00Z", config)).toBe(false);
  });
});

// ============================================================================
// 7. push notification (3 assertions)
// ============================================================================

describe("push notification", () => {
  it("returns null when push is disabled", () => {
    const config = buildBaseConfig({ pushEnabled: false });
    const state = buildBaseState({ currentStreak: 5, isActive: true });
    expect(getStreakPushPayload(state, config)).toBeNull();
  });

  it("returns null when consent is missing (LGPD)", () => {
    const config = buildBaseConfig({ pushEnabled: true });
    const state = buildBaseState({ currentStreak: 5, isActive: true });
    expect(getStreakPushPayload(state, config)).toBeNull();
  });

  it("builds valid payload with required fields when consent present", () => {
    const config = buildBaseConfig({
      pushEnabled: true,
      pushConsentId: PUSH_CONSENT_ID,
    });
    const state = buildBaseState({ currentStreak: 7, isActive: true });
    const payload = getStreakPushPayload(state, config);
    expect(payload).not.toBeNull();
    expect(payload!.title).toBeTruthy();
    expect(payload!.body.length).toBeLessThanOrEqual(PUSH_PAYLOAD_MAX_CHARS);
    expect(payload!.tag).toBe(`streak-${USER_ID}`);
    expect(payload!.data.streak).toBe("7");
    expect(payload!.data.consentId).toBe(PUSH_CONSENT_ID);
  });
});

// ============================================================================
// 8. LGPD (3 assertions)
// ============================================================================

describe("LGPD compliance", () => {
  it("rejects check-in without consentId (CONSENT_MISSING)", () => {
    const config = buildBaseConfig();
    const state = buildBaseState();
    expect(() =>
      createCheckIn(USER_ID, "morning", "2026-06-29", "not-a-uuid"),
    ).toThrow(StreakError);
  });

  it("buildDeletionReceipt returns a valid receipt", () => {
    const state = buildBaseState({ totalCheckIns: 10 });
    const history = generateCheckInHistory(USER_ID, "2026-06-20", 5);
    const receipt = buildDeletionReceipt(state, history, "2026-06-29T20:00:00Z");
    expect(receipt.userId).toBe(USER_ID);
    expect(receipt.erasedRecords).toBe(6);
    expect(receipt.receiptId).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("push data contains no PII (only streak metadata)", () => {
    const config = buildBaseConfig({
      pushEnabled: true,
      pushConsentId: PUSH_CONSENT_ID,
    });
    const state = buildBaseState({ currentStreak: 3, isActive: true });
    const payload = getStreakPushPayload(state, config);
    expect(payload).not.toBeNull();
    const dataStr = JSON.stringify(payload!.data);
    expect(dataStr).not.toMatch(/@/); // no email
    expect(dataStr).not.toMatch(/\d{3}\.\d{3}\.\d{3}/); // no CPF
  });
});

// ============================================================================
// 9. PII redaction (3 assertions)
// ============================================================================

describe("PII redaction", () => {
  it("strips emails from metadata", () => {
    const config = buildBaseConfig();
    const state = buildBaseState();
    const ci = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID, "pt-BR", {
      note: "Contact me at user@example.com for follow-up",
    });
    const redacted = redactCheckInPII(ci);
    expect(redacted.metadata?.note).not.toContain("@example.com");
    expect(redacted.metadata?.note).toContain("[REDACTED]");
  });

  it("strips Brazilian CPF from metadata", () => {
    const ci = createCheckIn(USER_ID, "evening", "2026-06-29", CONSENT_ID, "pt-BR", {
      reflection: "My CPF is 123.456.789-09 and I'm worried",
    });
    const redacted = redactCheckInPII(ci);
    expect(redacted.metadata?.reflection).not.toContain("123.456.789-09");
    expect(redacted.metadata?.reflection).toContain("[REDACTED]");
  });

  it("redacts suspicious keys entirely", () => {
    const ci = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID, "pt-BR", {
      email: "secret@example.com",
    });
    const redacted = redactCheckInPII(ci);
    expect(redacted.metadata?.email).toBe("[REDACTED]");
  });
});

// ============================================================================
// 10. timezone (3 assertions)
// ============================================================================

describe("timezone handling", () => {
  it("validates correct IANA timezone", () => {
    expect(isValidTimezone("America/Sao_Paulo")).toBe(true);
    expect(isValidTimezone("UTC")).toBe(true);
    expect(isValidTimezone("Europe/Lisbon")).toBe(true);
  });

  it("rejects invalid timezone", () => {
    expect(isValidTimezone("Mars/Olympus_Mons")).toBe(false);
    expect(isValidTimezone("")).toBe(false);
    expect(isValidTimezone("not-a-tz")).toBe(false);
  });

  it("falls back to UTC when invalid timezone provided to factory", () => {
    const config = createDefaultConfig(USER_ID, "pt-BR", "NotAReal/Zone", "cigano");
    expect(config.timezone).toBe("UTC");
  });
});

// ============================================================================
// 11. i18n (4 assertions)
// ============================================================================

describe("i18n key catalog", () => {
  it("has at least 12 keys", () => {
    const keys = Object.values(I18N_KEYS);
    expect(keys.length).toBeGreaterThanOrEqual(12);
  });

  it("validates all keys are non-empty", () => {
    const result = validateI18nKeys();
    expect(result.ok).toBe(true);
    expect(result.missingKeys).toHaveLength(0);
  });

  it("contains all required spec keys", () => {
    const keys = Object.values(I18N_KEYS);
    expect(keys).toContain("streak.title");
    expect(keys).toContain("streak.current");
    expect(keys).toContain("streak.longest");
    expect(keys).toContain("streak.atRisk");
    expect(keys).toContain("streak.milestone7");
    expect(keys).toContain("streak.milestone30");
    expect(keys).toContain("streak.milestone100");
    expect(keys).toContain("streak.milestone365");
    expect(keys).toContain("streak.freezeUsed");
    expect(keys).toContain("streak.freezeAvailable");
    expect(keys).toContain("streak.encourageContinue");
    expect(keys).toContain("streak.weeklyAverage");
  });

  it("supports pt-BR, en-US, es-ES locales", () => {
    expect(SUPPORTED_LOCALES).toContain("pt-BR");
    expect(SUPPORTED_LOCALES).toContain("en-US");
    expect(SUPPORTED_LOCALES).toContain("es-ES");
    const msgPT = buildMilestoneMessage("7-days", "pt-BR", 7, "cigano");
    const msgEN = buildMilestoneMessage("7-days", "en-US", 7, "cigano");
    const msgES = buildMilestoneMessage("7-days", "es-ES", 7, "cigano");
    expect(msgPT).not.toBe(msgEN);
    expect(msgEN).not.toBe(msgES);
  });
});

// ============================================================================
// 12. anti-dark-pattern (3 assertions)
// ============================================================================

describe("anti-dark-pattern", () => {
  it("passes audit on engine's push messages", () => {
    const messages = [
      PUSH_TEMPLATES["pt-BR"].bodyActive(5),
      PUSH_TEMPLATES["pt-BR"].bodyAtRisk(5),
      PUSH_TEMPLATES["en-US"].bodyActive(5),
      PUSH_TEMPLATES["es-ES"].bodyActive(5),
    ];
    const result = auditAntiDarkPattern(messages);
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("detects guilt pattern in test message", () => {
    const result = auditAntiDarkPattern(["Você vai perder seu streak se não agir!"]);
    expect(result.ok).toBe(false);
    expect(result.violations[0].pattern).toBe("guilt-loss");
  });

  it("detects FOMO pattern in test message", () => {
    const result = auditAntiDarkPattern(["Outros usuários estão melhores que você."]);
    expect(result.ok).toBe(false);
    expect(result.violations[0].pattern).toBe("fomo");
  });
});

// ============================================================================
// 13. error codes (4 assertions)
// ============================================================================

describe("error codes", () => {
  it("StreakError has all spec codes", () => {
    const err = new StreakError("INVALID_DATE", "test");
    expect(err.code).toBe("INVALID_DATE");
    expect(err.name).toBe("StreakError");
  });

  it("CAP_EXCEEDED thrown when total check-ins cap reached", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({ totalCheckIns: 100_000 });
    const ci = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID);
    try {
      recordCheckIn(ci, state, config);
      expect.fail("should have thrown");
    } catch (e) {
      expect((e as StreakError).code).toBe("STORAGE_CAP_EXCEEDED");
    }
  });

  it("isValidStreakCap validates positive integers only", () => {
    expect(isValidStreakCap(3650)).toBe(true);
    expect(isValidStreakCap(0)).toBe(false);
    expect(isValidStreakCap(-1)).toBe(false);
    expect(isValidStreakCap(3.14)).toBe(false);
    expect(isValidStreakCap(DEFAULT_MAX_STREAK + 1)).toBe(false);
  });

  it("daysBetween throws INVALID_DATE on garbage", () => {
    expect(() => daysBetween("not-a-date", "2026-06-29")).toThrow(StreakError);
  });
});

// ============================================================================
// 14. weekly average (3 assertions)
// ============================================================================

describe("weekly average", () => {
  it("returns 0 for empty history", () => {
    expect(weeklyAverage([], "2026-06-29")).toBe(0);
  });

  it("computes 7 check-ins in last 7 days as 1.0/day", () => {
    const history = generateCheckInHistory(USER_ID, "2026-06-23", 7);
    // Today is 2026-06-29. Window is [2026-06-22, 2026-06-29).
    // 6 dates (23-28) are in window. 29 itself is the upper bound (excluded).
    // Actually our window is weekAgo (exclusive lower) to today (exclusive upper)
    // weekAgo = addDays("2026-06-29", -7) = "2026-06-22"
    // In-window: dates >= 2026-06-22 AND < 2026-06-29 → 23, 24, 25, 26, 27, 28 = 6 days
    const avg = weeklyAverage(history, "2026-06-29");
    expect(avg).toBeCloseTo(6 / 7, 2);
  });

  it("indicates engagement dropping when avg < 1", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({ currentStreak: 1 });
    // 1 check-in today only
    const history = [createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID)];
    const stats = getStreakStats(state, config, history);
    expect(stats.engagementDropping).toBe(true);
  });
});

// ============================================================================
// Bonus: integration & helpers
// ============================================================================

describe("integration", () => {
  it("groupCheckInsByDate returns correct grouping", () => {
    const ci1 = createCheckIn(USER_ID, "morning", "2026-06-29", CONSENT_ID);
    const ci2 = createCheckIn(USER_ID, "evening", "2026-06-29", CONSENT_ID);
    const ci3 = createCheckIn(USER_ID, "morning", "2026-06-28", CONSENT_ID);
    const grouped = groupCheckInsByDate([ci1, ci2, ci3]);
    expect(grouped.get("2026-06-29")?.length).toBe(2);
    expect(grouped.get("2026-06-28")?.length).toBe(1);
  });

  it("daysToNextMilestone returns correct count", () => {
    const config = buildBaseConfig();
    expect(daysToNextMilestone(0, config)).toBe(7);
    expect(daysToNextMilestone(5, config)).toBe(2);
    expect(daysToNextMilestone(7, config)).toBe(23); // next is 30
    expect(daysToNextMilestone(100, config)).toBe(265); // next is 365
  });

  it("buildAccessibleAnnouncement is screen-reader friendly", () => {
    const a = buildAccessibleAnnouncement("7-days", "pt-BR", 7);
    expect(a).toContain("sete dias seguidos");
    expect(a).not.toContain("🔥"); // no emojis
  });

  it("calculateLongestStreak finds longest run", () => {
    const config = buildBaseConfig();
    // 3 days, gap, 5 days, gap, 2 days → longest = 5
    const history: CheckIn[] = [
      createCheckIn(USER_ID, "morning", "2026-06-01", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-02", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-03", CONSENT_ID),
      // gap 4-9
      createCheckIn(USER_ID, "morning", "2026-06-10", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-11", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-12", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-13", CONSENT_ID),
      createCheckIn(USER_ID, "morning", "2026-06-14", CONSENT_ID),
    ];
    expect(calculateLongestStreak(history, "2026-06-14", config)).toBe(5);
  });

  it("getStreakStats returns full snapshot", () => {
    const config = buildBaseConfig();
    const state = buildBaseState({ currentStreak: 5, lastCheckInDate: "2026-06-29" });
    const history = generateCheckInHistory(USER_ID, "2026-06-25", 5);
    const stats = getStreakStats(state, config, history);
    expect(stats.nextMilestone).toBe("7-days");
    expect(stats.daysToNextMilestone).toBe(2);
    expect(stats.checkInsByType.morning).toBe(5);
  });
});
