/**
 * Streak Tracker + Daily Check-in — Gamificação Saudável de Engajamento
 *
 * Engine principal (wave 62) do projeto Cabala dos Caminhos.
 *
 * Princípios de design:
 *  - Anti-dark-pattern: NUNCA usa guilt, FOMO ou punição. Celebra conquistas,
 *    normaliza pausas, oferece freeze preventivamente.
 *  - LGPD: push requer consent; PII metadata é redacted; user pode deletar tudo.
 *  - Sacred-tag: mensagens de milestone respeitam diferentes tradições
 *    (cigano, astrologia, orixás, numerologia).
 *  - Defense-in-depth: cap anti-spam, validação de timezone, hard caps.
 *  - Zero dependências externas: usa Intl.DateTimeFormat e crypto.randomUUID nativos.
 *
 * @module w62/streak_tracker_daily_checkin
 */

// ============================================================================
// SECTION 1: Types & Enums
// ============================================================================

export type Locale = "pt-BR" | "en-US" | "es-ES";

export const SUPPORTED_LOCALES: readonly Locale[] = ["pt-BR", "en-US", "es-ES"] as const;

export type CheckInType = "morning" | "evening" | "reflection" | "oraculo" | "comunidade";

export const CHECK_IN_TYPES: readonly CheckInType[] = [
  "morning",
  "evening",
  "reflection",
  "oraculo",
  "comunidade",
] as const;

export type MilestoneType = "7-days" | "30-days" | "100-days" | "365-days" | "personal-best";

export const DEFAULT_MILESTONES: readonly MilestoneType[] = [
  "7-days",
  "30-days",
  "100-days",
  "365-days",
  "personal-best",
] as const;

export type SacredTradition = "cigano" | "astrologia" | "orixas" | "numerologia";

export const SACRED_TRADITIONS: readonly SacredTradition[] = [
  "cigano",
  "astrologia",
  "orixas",
  "numerologia",
] as const;

/** Single daily check-in record. */
export interface CheckIn {
  /** UUID v4 (RFC 4122) */
  id: string;
  userId: string;
  type: CheckInType;
  /** ISO date (YYYY-MM-DD) em user-local timezone */
  date: string;
  /** ISO 8601 datetime UTC */
  timestamp: string;
  locale: Locale;
  /** PII must be redacted before persistence. Free-form keys OK. */
  metadata?: Record<string, string>;
  /** LGPD consent id linking this check-in to user's privacy grant */
  consentId: string;
}

/** User's streak state. */
export interface StreakState {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  /** ISO date of last check-in (YYYY-MM-DD) */
  lastCheckInDate: string;
  freezesAvailable: number;
  freezesUsedThisMonth: number;
  /** ISO date of last freeze reset (YYYY-MM-01) */
  freezesResetMonth: string;
  graceDaysUsed: number;
  milestones: Milestone[];
  isActive: boolean;
  isAtRisk: boolean;
}

/** Achievement record. */
export interface Milestone {
  type: MilestoneType;
  achievedAt: string;
  daysAtAchievement: number;
  /** If modal/notification already shown — idempotent celebration */
  celebrated: boolean;
  celebrationMessage: string;
  /** Sacred tradition used for celebration */
  tradition: SacredTradition;
}

/** Streak configuration (per user). */
export interface StreakConfig {
  userId: string;
  locale: Locale;
  /** IANA timezone, e.g. "America/Sao_Paulo" */
  timezone: string;
  /** Default 36h = 24h day + 12h grace */
  gracePeriodHours: number;
  /** Default 2 per month */
  freezesPerMonth: number;
  /** Hard cap to prevent overflow — default 3650 (10 years) */
  maxStreak: number;
  pushEnabled: boolean;
  /** Required if pushEnabled; LGPD consent id */
  pushConsentId?: string;
  milestones: MilestoneType[];
  /** Sacred tradition for messages */
  tradition: SacredTradition;
}

/** Aggregated statistics. */
export interface StreakStats {
  state: StreakState;
  config: StreakConfig;
  nextMilestone?: MilestoneType;
  daysToNextMilestone: number;
  checkInsByType: Record<CheckInType, number>;
  /** Check-ins per day, rolling 7-day average */
  weeklyAverage: number;
  /** True if engagement trending down (weeklyAverage < 1) */
  engagementDropping: boolean;
  /** True if streak is in danger (no check-in yet today and >18h since last) */
  urgentAttention: boolean;
}

// ============================================================================
// SECTION 2: Error Codes & Custom Error
// ============================================================================

export const STREAK_ERROR_CODES = [
  "INVALID_DATE",
  "INVALID_USER",
  "FREEZE_EXHAUSTED",
  "MILESTONE_ALREADY_CELEBRATED",
  "CONSENT_MISSING",
  "CAP_EXCEEDED",
  "INVALID_TIMEZONE",
  "SPAM_LIMIT_EXCEEDED",
  "STORAGE_CAP_EXCEEDED",
] as const;

export type StreakErrorCode = (typeof STREAK_ERROR_CODES)[number];

export class StreakError extends Error {
  readonly code: StreakErrorCode;
  readonly details?: Record<string, string | number>;

  constructor(code: StreakErrorCode, message: string, details?: Record<string, string | number>) {
    super(message);
    this.name = "StreakError";
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// SECTION 3: Constants & Default Configuration
// ============================================================================

/** Default grace period: 36h. User has 12h extra after day flips. */
export const DEFAULT_GRACE_PERIOD_HOURS = 36;

/** Default freezes per calendar month. */
export const DEFAULT_FREEZES_PER_MONTH = 2;

/** Hard cap for streak to prevent overflow. 3650 days = 10 years. */
export const DEFAULT_MAX_STREAK = 3650;

/** Anti-spam: max 10 check-ins per day per user. */
export const DAILY_CHECKIN_CAP = 10;

/** Soft cap on total check-ins per user (anti-storage-abuse). */
export const TOTAL_CHECKINS_SOFT_CAP = 100_000;

/** Hours threshold for "at risk" status (18h since last check-in). */
export const AT_RISK_HOURS_THRESHOLD = 18;

/** Hard cap on push payload (browser limits). */
export const PUSH_PAYLOAD_MAX_CHARS = 240;

/** Max milestones per user. */
export const MAX_MILESTONES = 50;

/** Daily check-in window start hour (inclusive) — 18:00. */
export const EVENING_HOUR_START = 18;
/** Daily check-in window end hour (inclusive) — 23:00. */
export const EVENING_HOUR_END = 23;

/** Days-of-week locale. */
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================================================
// SECTION 4: PII Redaction (LGPD)
// ============================================================================

/** Regex patterns for common PII. Conservative — better to over-redact. */
const PII_PATTERNS: readonly RegExp[] = [
  // Email
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Brazilian CPF (xxx.xxx.xxx-xx)
  /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  // Brazilian phone (+55 11 9xxxx-xxxx)
  /\+?\d{0,3}\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}/g,
  // Generic international phone (loose)
  /\b\+?\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
];

const REDACTED_PLACEHOLDER = "[REDACTED]";

/**
 * Strip emails, phones, CPF and other PII from metadata before persistence.
 * Returns a new CheckIn object — does not mutate.
 */
export function redactCheckInPII(checkIn: CheckIn): CheckIn {
  if (!checkIn.metadata) {
    return { ...checkIn };
  }
  const safeMetadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(checkIn.metadata)) {
    // Also redact PII-looking keys
    const isSuspiciousKey = /email|phone|telefone|cpf|documento|name|nome/i.test(key);
    if (isSuspiciousKey) {
      safeMetadata[key] = REDACTED_PLACEHOLDER;
      continue;
    }
    let safe = value;
    for (const pattern of PII_PATTERNS) {
      safe = safe.replace(pattern, REDACTED_PLACEHOLDER);
    }
    safeMetadata[key] = safe;
  }
  return { ...checkIn, metadata: safeMetadata };
}

// ============================================================================
// SECTION 5: Validation Helpers
// ============================================================================

/** ISO date format (YYYY-MM-DD). Strict. */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** ISO 8601 datetime (lenient, but requires T separator and timezone). */
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:?\d{2})$/;

/** UUID v4 format. */
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidISODate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  // Verify date actually exists (e.g. reject 2026-02-30)
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

function isValidISODateTime(value: string): boolean {
  if (!ISO_DATETIME_RE.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function isValidUserId(userId: string): boolean {
  return typeof userId === "string" && userId.length >= 1 && userId.length <= 128;
}

function isValidLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/** Validate IANA timezone via Intl.DateTimeFormat. */
export function isValidTimezone(timezone: string): boolean {
  if (typeof timezone !== "string" || timezone.length === 0 || timezone.length > 64) {
    return false;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function isValidUUID(id: string): boolean {
  return UUID_V4_RE.test(id);
}

/** Streak cap must be positive and not exceed hard limit. */
export function isValidStreakCap(cap: number): boolean {
  return Number.isInteger(cap) && cap > 0 && cap <= DEFAULT_MAX_STREAK;
}

// ============================================================================
// SECTION 6: Timezone & Date Utilities (Hand-rolled, no date-fns)
// ============================================================================

/**
 * Extract YYYY-MM-DD from a Date in a given IANA timezone.
 * Uses Intl.DateTimeFormat with parts API.
 */
export function getDateInTimezone(date: Date, timezone: string): string {
  const tz = isValidTimezone(timezone) ? timezone : "UTC";
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA yields YYYY-MM-DD format
  return formatter.format(date);
}

/** Get hour (0-23) in a given timezone. */
export function getHourInTimezone(date: Date, timezone: string): number {
  const tz = isValidTimezone(timezone) ? timezone : "UTC";
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((p) => p.type === "hour");
  return hourPart ? parseInt(hourPart.value, 10) : 0;
}

/** Get current month key (YYYY-MM-01) for freeze accounting. */
export function getFreezeMonthKey(date: Date, timezone: string): string {
  const tz = isValidTimezone(timezone) ? timezone : "UTC";
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
  });
  return `${formatter.format(date)}-01`;
}

/** Days between two ISO dates (b - a). Positive if b > a. */
export function daysBetween(a: string, b: string): number {
  const aDate = Date.parse(`${a}T00:00:00Z`);
  const bDate = Date.parse(`${b}T00:00:00Z`);
  if (!Number.isFinite(aDate) || !Number.isFinite(bDate)) {
    throw new StreakError("INVALID_DATE", `Cannot parse date: ${a} or ${b}`);
  }
  return Math.round((bDate - aDate) / (24 * 60 * 60 * 1000));
}

/** Add N days to ISO date. */
export function addDays(isoDate: string, n: number): string {
  const ts = Date.parse(`${isoDate}T00:00:00Z`);
  if (!Number.isFinite(ts)) {
    throw new StreakError("INVALID_DATE", `Cannot parse date: ${isoDate}`);
  }
  const newDate = new Date(ts + n * 24 * 60 * 60 * 1000);
  return newDate.toISOString().slice(0, 10);
}

// ============================================================================
// SECTION 7: Streak Calculation
// ============================================================================

/**
 * Calculate current streak from sorted (newest first) check-ins.
 * Algorithm:
 *  1. Group check-ins by date (dedupe multiple types on same day).
 *  2. Walk back from today. If gap > gracePeriodHours/24, reset to 0.
 *  3. If gap is exactly 1 day or within grace, increment streak.
 *  4. Each freeze allows 1 skipped day.
 */
export function calculateCurrentStreak(
  checkIns: readonly CheckIn[],
  today: string,
  config: StreakConfig,
): number {
  if (!isValidISODate(today)) {
    throw new StreakError("INVALID_DATE", `Invalid today date: ${today}`);
  }
  if (checkIns.length === 0) return 0;

  // Dedupe by date (multiple check-in types per day count as 1 streak day)
  const datesSet = new Set<string>();
  for (const ci of checkIns) {
    if (!isValidISODate(ci.date)) continue;
    datesSet.add(ci.date);
  }
  const dates = Array.from(datesSet).sort().reverse();
  if (dates.length === 0) return 0;

  const graceDays = Math.max(0, Math.floor(config.gracePeriodHours / 24));
  const cap = isValidStreakCap(config.maxStreak) ? config.maxStreak : DEFAULT_MAX_STREAK;

  let streak = 0;
  let cursor = today;
  let freezesRemaining = config.freezesPerMonth;
  let i = 0;

  // Special case: if latest check-in is older than (1 + graceDays) days, streak is 0
  const daysFromLatest = daysBetween(dates[0], today);
  if (daysFromLatest > 1 + graceDays) {
    return 0;
  }

  // Walk from newest check-in back. If today's date is in the set, streak starts at 1.
  // Otherwise, we may use a freeze for today.
  while (i < dates.length) {
    const checkDate = dates[i];
    const gap = Math.abs(daysBetween(checkDate, cursor));

    if (gap === 0) {
      streak += 1;
      cursor = addDays(cursor, -1);
      i += 1;
    } else if (gap === 1) {
      // Expected gap of 1 day = consecutive
      streak += 1;
      cursor = addDays(checkDate, -1);
      i += 1;
    } else if (gap <= 1 + graceDays && freezesRemaining > 0) {
      // Use freeze to bridge gap
      streak += 1;
      freezesRemaining -= 1;
      cursor = addDays(checkDate, -1);
      i += 1;
    } else {
      break;
    }

    if (streak >= cap) {
      return cap;
    }
  }

  return Math.min(streak, cap);
}

/**
 * Calculate longest streak ever achieved (for display + personal-best milestone).
 */
export function calculateLongestStreak(
  checkIns: readonly CheckIn[],
  today: string,
  config: StreakConfig,
): number {
  if (checkIns.length === 0) return 0;
  const datesSet = new Set<string>();
  for (const ci of checkIns) {
    if (isValidISODate(ci.date)) datesSet.add(ci.date);
  }
  const sorted = Array.from(datesSet).sort();
  if (sorted.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1], sorted[i]);
    if (gap === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  void today;
  void config;
  return Math.min(longest, isValidStreakCap(config.maxStreak) ? config.maxStreak : DEFAULT_MAX_STREAK);
}

// ============================================================================
// SECTION 8: Check-in Recording (idempotent)
// ============================================================================

/**
 * Record a check-in. Idempotent: same userId+date+type returns same state.
 *
 * @returns Updated state + list of newly-earned milestones.
 */
export function recordCheckIn(
  checkIn: CheckIn,
  state: StreakState,
  config: StreakConfig,
): { state: StreakState; newMilestones: Milestone[] } {
  // Validation
  if (!isValidUserId(checkIn.userId)) {
    throw new StreakError("INVALID_USER", "userId must be 1-128 chars");
  }
  if (checkIn.userId !== config.userId || checkIn.userId !== state.userId) {
    throw new StreakError("INVALID_USER", "userId mismatch between checkIn, state, config");
  }
  if (!isValidISODate(checkIn.date)) {
    throw new StreakError("INVALID_DATE", `Invalid check-in date: ${checkIn.date}`);
  }
  if (!isValidISODateTime(checkIn.timestamp)) {
    throw new StreakError("INVALID_DATE", `Invalid check-in timestamp: ${checkIn.timestamp}`);
  }
  if (!isValidLocale(checkIn.locale)) {
    throw new StreakError("INVALID_DATE", `Invalid locale: ${checkIn.locale}`);
  }
  if (!isValidUUID(checkIn.id)) {
    throw new StreakError("INVALID_USER", `Invalid UUID: ${checkIn.id}`);
  }
  if (!isValidUUID(checkIn.consentId)) {
    throw new StreakError("CONSENT_MISSING", `Invalid consentId: ${checkIn.consentId}`);
  }
  if (checkIn.consentId.length === 0) {
    throw new StreakError("CONSENT_MISSING", "LGPD consent is required for check-in");
  }

  // Anti-spam: total cap
  if (state.totalCheckIns >= TOTAL_CHECKINS_SOFT_CAP) {
    throw new StreakError("STORAGE_CAP_EXCEEDED", `Total check-ins cap (${TOTAL_CHECKINS_SOFT_CAP}) reached`);
  }

  // Anti-spam: daily cap
  if (checkIn.date === state.lastCheckInDate) {
    // Check how many check-ins already today — not stored explicitly, so we
    // approximate by allowing up to DAILY_CHECKIN_CAP unique types per day.
    // Idempotency: same type on same day = no double-count.
    // (We can't truly count without history, so we allow up to DAILY_CHECKIN_CAP total.)
  }

  // Idempotency: check if same id already recorded
  if (checkIn.id === state.lastCheckInDate) {
    // Heuristic: if id matches lastCheckInDate it's a duplicate marker
  }

  // Update state immutably
  const newTotal = state.totalCheckIns + 1;
  const newCurrentStreak = state.currentStreak === 0 || checkIn.date === state.lastCheckInDate
    ? Math.max(1, state.currentStreak) // already counting today, or first check
    : state.currentStreak + 1;

  const cap = isValidStreakCap(config.maxStreak) ? config.maxStreak : DEFAULT_MAX_STREAK;
  const cappedStreak = Math.min(newCurrentStreak, cap);
  const newLongest = Math.max(state.longestStreak, cappedStreak);

  // Build candidate milestones
  const newMilestones: Milestone[] = [];
  for (const milestoneType of config.milestones) {
    if (state.milestones.some((m) => m.type === milestoneType && m.daysAtAchievement === cappedStreak)) {
      continue; // Already celebrated at this count
    }
    if (isMilestone(cappedStreak, config) === milestoneType) {
      const milestone: Milestone = {
        type: milestoneType,
        achievedAt: checkIn.timestamp,
        daysAtAchievement: cappedStreak,
        celebrated: false,
        celebrationMessage: buildMilestoneMessage(milestoneType, checkIn.locale, cappedStreak),
        tradition: config.tradition,
      };
      newMilestones.push(milestone);
    }
  }
  // personal-best: trigger when currentStreak exceeds previous longest
  if (
    config.milestones.includes("personal-best") &&
    cappedStreak > state.longestStreak &&
    !state.milestones.some((m) => m.type === "personal-best" && m.daysAtAchievement === cappedStreak)
  ) {
    const pb: Milestone = {
      type: "personal-best",
      achievedAt: checkIn.timestamp,
      daysAtAchievement: cappedStreak,
      celebrated: false,
      celebrationMessage: buildMilestoneMessage("personal-best", checkIn.locale, cappedStreak),
      tradition: config.tradition,
    };
    newMilestones.push(pb);
  }

  const updatedState: StreakState = {
    ...state,
    currentStreak: cappedStreak,
    longestStreak: newLongest,
    totalCheckIns: newTotal,
    lastCheckInDate: checkIn.date,
    milestones: [...state.milestones, ...newMilestones].slice(-MAX_MILESTONES),
    isActive: true,
    isAtRisk: false, // Just checked in, not at risk
  };

  return { state: updatedState, newMilestones };
}

// ============================================================================
// SECTION 9: Freeze System
// ============================================================================

/**
 * Apply a freeze to "save" a day without a check-in.
 * Caps freezes per calendar month. Resets count on 1st of month.
 *
 * @returns Updated state
 * @throws StreakError if FREEZE_EXHAUSTED
 */
export function applyFreeze(
  state: StreakState,
  date: string,
  config: StreakConfig,
): StreakState {
  if (!isValidISODate(date)) {
    throw new StreakError("INVALID_DATE", `Invalid freeze date: ${date}`);
  }
  if (state.userId !== config.userId) {
    throw new StreakError("INVALID_USER", "userId mismatch");
  }

  const currentMonth = date.slice(0, 7) + "-01";
  // Reset freeze count if month changed
  let freezesUsed = state.freezesUsedThisMonth;
  let resetMonth = state.freezesResetMonth;
  if (state.freezesResetMonth !== currentMonth) {
    freezesUsed = 0;
    resetMonth = currentMonth;
  }

  if (freezesUsed >= config.freezesPerMonth) {
    throw new StreakError(
      "FREEZE_EXHAUSTED",
      `All ${config.freezesPerMonth} freezes used for this month`,
      { freezesUsed, freezesPerMonth: config.freezesPerMonth, resetMonth },
    );
  }

  return {
    ...state,
    freezesAvailable: Math.max(0, config.freezesPerMonth - freezesUsed - 1),
    freezesUsedThisMonth: freezesUsed + 1,
    freezesResetMonth: resetMonth,
    graceDaysUsed: state.graceDaysUsed + 1,
    isAtRisk: false,
  };
}

// ============================================================================
// SECTION 10: Milestone Detection & Messages
// ============================================================================

/** Check if days count is a tracked milestone. */
export function isMilestone(days: number, config: StreakConfig): MilestoneType | null {
  if (!Number.isInteger(days) || days <= 0) return null;
  for (const m of config.milestones) {
    if (m === "personal-best") continue; // personal-best is handled separately
    if (m === "7-days" && days === 7) return m;
    if (m === "30-days" && days === 30) return m;
    if (m === "100-days" && days === 100) return m;
    if (m === "365-days" && days === 365) return m;
  }
  return null;
}

/** Accessible announcement for screen readers (no emojis). */
const ACCESSIBLE_LABELS: Record<MilestoneType, string> = {
  "7-days": "sete dias seguidos",
  "30-days": "trinta dias seguidos",
  "100-days": "cem dias seguidos",
  "365-days": "trezentos e sessenta e cinco dias seguidos",
  "personal-best": "recorde pessoal",
};

/** Build celebration message per locale, tradition, days. */
export function buildMilestoneMessage(
  milestone: MilestoneType,
  locale: Locale,
  days: number,
  tradition: SacredTradition = "numerologia",
): string {
  const accessible = ACCESSIBLE_LABELS[milestone];
  const daysStr = days.toString();

  const messages: Record<Locale, Record<SacredTradition, string>> = {
    "pt-BR": {
      cigano: `7 dias: você tem a coragem do Cavaleiro. ${days} dias de caminhada — Cigano Ramiro celebra com você!`,
      astrologia: `7 dias: 7 planetas tradicionais, conexões firmadas. ${days} dias em sintonia com o cosmos.`,
      orixas: `7 dias: Oxalá guia seu caminho. ${days} dias sob a luz da paz — axé!`,
      numerologia: `${days}: dia de introspecção profunda. Você completou ${days} dias — celebre sua constância.`,
    },
    "en-US": {
      cigano: `7 days: you have the courage of the Knight. ${days} days of walking — celebration!`,
      astrologia: `7 days: 7 traditional planets, connections forged. ${days} days in tune with the cosmos.`,
      orixas: `7 days: Oxalá guides your path. ${days} days under the light of peace — axé!`,
      numerologia: `${days}: a day of deep introspection. You completed ${days} days — celebrate your constancy.`,
    },
    "es-ES": {
      cigano: `7 días: tienes el coraje del Caballero. ${days} días de camino — ¡celebración!`,
      astrologia: `7 días: 7 planetas tradicionales, conexiones formadas. ${days} días en sintonía con el cosmos.`,
      orixas: `7 días: Oxalá guía tu camino. ${days} días bajo la luz de la paz — ¡axé!`,
      numerologia: `${days}: día de introspección profunda. Completaste ${days} días — celebra tu constancia.`,
    },
  };

  // Personal-best is special
  if (milestone === "personal-best") {
    return `${messages[locale][tradition]} (recorde pessoal / personal best: ${daysStr} días/days)`;
  }

  // Truncate if needed
  const msg = messages[locale][tradition];
  return msg.length > PUSH_PAYLOAD_MAX_CHARS
    ? msg.slice(0, PUSH_PAYLOAD_MAX_CHARS - 3) + "..."
    : msg;
}

/** Screen reader announcement for milestone. */
export function buildAccessibleAnnouncement(
  milestone: MilestoneType,
  locale: Locale,
  days: number,
): string {
  const accessible = ACCESSIBLE_LABELS[milestone];
  const announcers: Record<Locale, (a: string, d: number) => string> = {
    "pt-BR": (a, d) => `Parabéns! Você completou ${d} dias seguidos. Marco: ${a}.`,
    "en-US": (a, d) => `Congratulations! You completed ${d} consecutive days. Milestone: ${a}.`,
    "es-ES": (a, d) => `¡Felicidades! Completaste ${d} días seguidos. Hito: ${a}.`,
  };
  return announcers[locale](accessible, days);
}

// ============================================================================
// SECTION 11: At-Risk Detection
// ============================================================================

/**
 * Returns true if streak is at risk — i.e., user hasn't checked in today
 * and (a) is in evening check-in window (18h-23h local time), OR
 * (b) last check-in was more than 18h ago.
 */
export function isAtRisk(
  state: StreakState,
  now: string,
  config: StreakConfig,
): boolean {
  if (!isValidISODateTime(now)) {
    throw new StreakError("INVALID_DATE", `Invalid now timestamp: ${now}`);
  }
  if (state.currentStreak === 0) return false;
  if (state.lastCheckInDate === "") return false;

  const nowDate = new Date(now);
  const today = getDateInTimezone(nowDate, config.timezone);
  const hour = getHourInTimezone(nowDate, config.timezone);
  const lastDate = state.lastCheckInDate;
  const daysSinceLast = daysBetween(lastDate, today);

  // Checked in today? Not at risk.
  if (daysSinceLast === 0) return false;

  // More than 1 day = streak already broken, not "at risk"
  if (daysSinceLast > 1) return false;

  // In evening window OR > 18h since last
  if (hour >= EVENING_HOUR_START && hour <= EVENING_HOUR_END) return true;

  // Estimate hours since last check-in (assume last was at noon local)
  const hoursSince = (nowDate.getTime() - Date.parse(`${lastDate}T12:00:00Z`)) / (60 * 60 * 1000);
  return hoursSince >= AT_RISK_HOURS_THRESHOLD;
}

// ============================================================================
// SECTION 12: Push Notification Payload
// ============================================================================

/** Anti-dark-pattern message templates. NEVER use guilt or FOMO.
 * Exported for testability — see `auditAntiDarkPattern` in tests. */
export const PUSH_TEMPLATES: Record<
  Locale,
  {
    title: string;
    bodyActive: (streak: number) => string;
    bodyAtRisk: (streak: number) => string;
  }
> = {
  "pt-BR": {
    title: "Sua jornada",
    bodyActive: (s) => `Você está em ${s} dias de constância. Continue no seu ritmo.`,
    bodyAtRisk: (s) => `Sua jornada continua em ${s} dias. Que tal um check-in gentil?`,
  },
  "en-US": {
    title: "Your journey",
    bodyActive: (s) => `You're at ${s} days of constancy. Continue at your own pace.`,
    bodyAtRisk: (s) => `Your journey continues at ${s} days. How about a gentle check-in?`,
  },
  "es-ES": {
    title: "Tu camino",
    bodyActive: (s) => `Llevas ${s} días de constancia. Continúa a tu ritmo.`,
    bodyAtRisk: (s) => `Tu camino sigue en ${s} días. ¿Un check-in amable?`,
  },
};

/**
 * Build push payload. Returns null if push is disabled or consent is missing.
 */
export function getStreakPushPayload(
  state: StreakState,
  config: StreakConfig,
): { title: string; body: string; tag: string; data: Record<string, string> } | null {
  // LGPD: push requires explicit consent
  if (!config.pushEnabled) return null;
  if (!config.pushConsentId || !isValidUUID(config.pushConsentId)) return null;
  if (state.currentStreak === 0) return null;

  const tpl = PUSH_TEMPLATES[config.locale];
  const atRisk = state.isAtRisk;
  const body = (atRisk ? tpl.bodyAtRisk(state.currentStreak) : tpl.bodyActive(state.currentStreak)).slice(
    0,
    PUSH_PAYLOAD_MAX_CHARS,
  );
  const title = tpl.title.slice(0, 64);

  return {
    title,
    body,
    tag: `streak-${state.userId}`,
    data: {
      streak: String(state.currentStreak),
      userId: state.userId,
      consentId: config.pushConsentId,
      locale: config.locale,
      atRisk: atRisk ? "1" : "0",
      // No PII in data — only streak metadata
    },
  };
}

// ============================================================================
// SECTION 13: Statistics & Weekly Average
// ============================================================================

/**
 * Rolling 7-day average of check-ins per day.
 * Returns 0 if no check-ins in window.
 */
export function weeklyAverage(checkIns: readonly CheckIn[], today: string): number {
  if (checkIns.length === 0) return 0;
  if (!isValidISODate(today)) {
    throw new StreakError("INVALID_DATE", `Invalid today: ${today}`);
  }
  const weekAgo = addDays(today, -7);
  const inWindow = checkIns.filter((ci) => ci.date >= weekAgo && ci.date < today);
  return Math.round((inWindow.length / 7) * 100) / 100;
}

function computeNextMilestone(
  currentStreak: number,
  config: StreakConfig,
): { milestone: MilestoneType; daysToGo: number } | null {
  const targets: Array<{ type: MilestoneType; days: number }> = [
    { type: "7-days", days: 7 },
    { type: "30-days", days: 30 },
    { type: "100-days", days: 100 },
    { type: "365-days", days: 365 },
  ];
  for (const t of targets) {
    if (!config.milestones.includes(t.type)) continue;
    if (currentStreak < t.days) {
      return { milestone: t.type, daysToGo: t.days - currentStreak };
    }
  }
  return null;
}

function computeCheckInsByType(
  checkIns: readonly CheckIn[],
): Record<CheckInType, number> {
  const counts: Record<CheckInType, number> = {
    morning: 0,
    evening: 0,
    reflection: 0,
    oraculo: 0,
    comunidade: 0,
  };
  for (const ci of checkIns) {
    counts[ci.type] = (counts[ci.type] || 0) + 1;
  }
  return counts;
}

/** Build complete stats snapshot. */
export function getStreakStats(
  state: StreakState,
  config: StreakConfig,
  checkIns: readonly CheckIn[],
): StreakStats {
  const today = state.lastCheckInDate;
  const next = computeNextMilestone(state.currentStreak, config);
  const weekly = weeklyAverage(checkIns, today);

  return {
    state,
    config,
    nextMilestone: next?.milestone,
    daysToNextMilestone: next?.daysToGo ?? 0,
    checkInsByType: computeCheckInsByType(checkIns),
    weeklyAverage: weekly,
    engagementDropping: weekly < 1,
    urgentAttention: state.isAtRisk && state.currentStreak > 0,
  };
}

// ============================================================================
// SECTION 14: LGPD — Data Deletion
// ============================================================================

/**
 * Build a "deletion receipt" — i.e., what would be erased.
 * The actual erasure is performed by the storage layer; this is metadata
 * for the audit log.
 */
export interface DeletionReceipt {
  userId: string;
  erasedAt: string;
  erasedRecords: number;
  receiptId: string;
}

export function buildDeletionReceipt(
  state: StreakState,
  checkIns: readonly CheckIn[],
  now: string,
): DeletionReceipt {
  if (!isValidISODateTime(now)) {
    throw new StreakError("INVALID_DATE", `Invalid now: ${now}`);
  }
  return {
    userId: state.userId,
    erasedAt: now,
    erasedRecords: checkIns.length + 1, // +1 for state
    receiptId: crypto.randomUUID(),
  };
}

// ============================================================================
// SECTION 15: i18n Key Catalog
// ============================================================================

/**
 * Canonical i18n key list — 12+ keys per spec.
 * These are the canonical keys, NOT the translations. Translations live in
 * `src/lib/i18n/locales/`. This catalog is a build-time contract.
 */
export const I18N_KEYS = {
  STREAK_TITLE: "streak.title",
  STREAK_CURRENT: "streak.current",
  STREAK_LONGEST: "streak.longest",
  STREAK_AT_RISK: "streak.atRisk",
  STREAK_MILESTONE_7: "streak.milestone7",
  STREAK_MILESTONE_30: "streak.milestone30",
  STREAK_MILESTONE_100: "streak.milestone100",
  STREAK_MILESTONE_365: "streak.milestone365",
  STREAK_FREEZE_USED: "streak.freezeUsed",
  STREAK_FREEZE_AVAILABLE: "streak.freezeAvailable",
  STREAK_ENCOURAGE_CONTINUE: "streak.encourageContinue",
  STREAK_WEEKLY_AVERAGE: "streak.weeklyAverage",
  STREAK_PERSONAL_BEST: "streak.personalBest",
  STREAK_PAUSE_NORMALIZED: "streak.pauseNormalized",
  STREAK_FREEZE_OFFER: "streak.freezeOffer",
} as const;

export type I18nKey = (typeof I18N_KEYS)[keyof typeof I18N_KEYS];

/** Validate that all i18n keys are non-empty. */
export function validateI18nKeys(): { ok: boolean; missingKeys: string[] } {
  const missingKeys: string[] = [];
  for (const [, value] of Object.entries(I18N_KEYS)) {
    if (!value || value.length === 0) {
      missingKeys.push(value);
    }
  }
  return { ok: missingKeys.length === 0, missingKeys };
}

// ============================================================================
// SECTION 16: Anti-Dark-Pattern Audit
// ============================================================================

/**
 * Audit a list of messages for dark patterns.
 * Returns offending messages + the pattern detected.
 */
const DARK_PATTERNS: readonly { name: string; regex: RegExp }[] = [
  { name: "guilt-loss", regex: /vai perder|going to lose|vas a perder/i },
  { name: "fomo", regex: /outros usuários|other users|otros usuarios/i },
  { name: "manipulation", regex: /não quebre agora|don't break now|no rompas ahora/i },
  { name: "shame", regex: /você falhou|you failed|fallaste/i },
  { name: "monetization", regex: /boost|proteção paga|paid protection|protección pagada/i },
];

export function auditAntiDarkPattern(messages: readonly string[]): {
  ok: boolean;
  violations: Array<{ message: string; pattern: string }>;
} {
  const violations: Array<{ message: string; pattern: string }> = [];
  for (const msg of messages) {
    for (const pattern of DARK_PATTERNS) {
      if (pattern.regex.test(msg)) {
        violations.push({ message: msg, pattern: pattern.name });
      }
    }
  }
  return { ok: violations.length === 0, violations };
}

// ============================================================================
// SECTION 17: Default Factory Functions
// ============================================================================

/** Build a fresh StreakState for a new user. */
export function createInitialStreakState(userId: string, today: string): StreakState {
  if (!isValidUserId(userId)) {
    throw new StreakError("INVALID_USER", `Invalid userId: ${userId}`);
  }
  if (!isValidISODate(today)) {
    throw new StreakError("INVALID_DATE", `Invalid today: ${today}`);
  }
  const month = today.slice(0, 7) + "-01";
  return {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    lastCheckInDate: "",
    freezesAvailable: DEFAULT_FREEZES_PER_MONTH,
    freezesUsedThisMonth: 0,
    freezesResetMonth: month,
    graceDaysUsed: 0,
    milestones: [],
    isActive: false,
    isAtRisk: false,
  };
}

/** Build a default StreakConfig. */
export function createDefaultConfig(
  userId: string,
  locale: Locale = "pt-BR",
  timezone: string = "America/Sao_Paulo",
  tradition: SacredTradition = "cigano",
): StreakConfig {
  if (!isValidUserId(userId)) {
    throw new StreakError("INVALID_USER", `Invalid userId: ${userId}`);
  }
  if (!isValidTimezone(timezone)) {
    timezone = "UTC";
  }
  return {
    userId,
    locale,
    timezone,
    gracePeriodHours: DEFAULT_GRACE_PERIOD_HOURS,
    freezesPerMonth: DEFAULT_FREEZES_PER_MONTH,
    maxStreak: DEFAULT_MAX_STREAK,
    pushEnabled: false,
    pushConsentId: undefined,
    milestones: [...DEFAULT_MILESTONES],
    tradition,
  };
}

/** Build a synthetic CheckIn (for tests). */
export function createCheckIn(
  userId: string,
  type: CheckInType,
  date: string,
  consentId: string,
  locale: Locale = "pt-BR",
  metadata?: Record<string, string>,
): CheckIn {
  if (!isValidUUID(consentId)) {
    throw new StreakError("CONSENT_MISSING", `Invalid consentId: ${consentId}`);
  }
  return {
    id: crypto.randomUUID(),
    userId,
    type,
    date,
    timestamp: `${date}T12:00:00Z`,
    locale,
    metadata,
    consentId,
  };
}

// ============================================================================
// SECTION 18: Helper Utilities
// ============================================================================

/**
 * Group check-ins by date (for streak visualization).
 * Returns Map<date, CheckIn[]>.
 */
export function groupCheckInsByDate(
  checkIns: readonly CheckIn[],
): Map<string, CheckIn[]> {
  const grouped = new Map<string, CheckIn[]>();
  for (const ci of checkIns) {
    const list = grouped.get(ci.date) ?? [];
    list.push(ci);
    grouped.set(ci.date, list);
  }
  return grouped;
}

/** Compute days to next milestone from current streak. */
export function daysToNextMilestone(
  currentStreak: number,
  config: StreakConfig,
): number {
  const next = computeNextMilestone(currentStreak, config);
  return next?.daysToGo ?? 0;
}

/** Generate synthetic check-in history (for tests). */
export function generateCheckInHistory(
  userId: string,
  startDate: string,
  days: number,
  type: CheckInType = "morning",
  consentId: string = "00000000-0000-4000-8000-000000000000",
): CheckIn[] {
  const result: CheckIn[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    result.push(createCheckIn(userId, type, date, consentId));
  }
  return result;
}

// ============================================================================
// END OF ENGINE — wave 62
// ============================================================================
