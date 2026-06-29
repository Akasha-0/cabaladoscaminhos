// ============================================================================
// DAILY REFLECTION STREAKS + FREEZE TOKENS + MILESTONE REWARDS (W34)
// ============================================================================
// Pure TypeScript. No runtime imports from app code. Dates are YYYY-MM-DD UTC.
// Composes at call-site with src/lib/w27/daily-reflection.ts +
// src/lib/w32/daily-reflection-calendar.ts.
// ============================================================================

export interface ReflectionEntry {
  userId: string;
  date: string;   // YYYY-MM-DD UTC
  content: string;
  mood: string;    // 'calm' | 'anxious' | 'grateful' | ...
  createdAt: string; // ISO 8601
}

export interface Streak {
  userId: string;
  current: number;
  longest: number;
  lastEntryDate: string | null;
  freezesAvailable: number;
  freezesUsed: number;
}

export interface StreakMilestone {
  days: number;
  reward: string;
  badgeName: string;
  badgeColor: string;
}

export interface FreezeToken {
  userId: string;
  source: "earned" | "purchased" | "gifted";
  earnedAt: string; // ISO 8601
  usedAt?: string;
  usedForDate?: string; // YYYY-MM-DD covered
}

export const FREEZE_TOKENS_AT_START = 2;
export const FREEZE_TOKENS_PER_MILESTONE = 1;

export const STREAK_MILESTONES: ReadonlyArray<StreakMilestone> = [
  { days: 3,   reward: "badge_3day",   badgeName: "Broto",  badgeColor: "#7BC47F" },
  { days: 7,   reward: "badge_7day",   badgeName: "Raiz",   badgeColor: "#5A8E5E" },
  { days: 30,  reward: "badge_30day",  badgeName: "Flor",   badgeColor: "#D4AF37" },
  { days: 90,  reward: "badge_90day",  badgeName: "Fruto",  badgeColor: "#C76B30" },
  { days: 180, reward: "badge_180day", badgeName: "Árvore", badgeColor: "#8B5A2B" },
  { days: 365, reward: "badge_365day", badgeName: "Mata",   badgeColor: "#3A2F1F" },
];

// ── Date helpers ────────────────────────────────────────────────────────────

export function toDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toUtcDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y as number, (m as number) - 1, d as number));
}

export function dayDiff(a: string, b: string): number {
  return Math.round((toUtcDate(b).getTime() - toUtcDate(a).getTime()) / 86_400_000);
}

export function addDays(key: string, days: number): string {
  const d = toUtcDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateKey(d);
}

// ── Entry normalization ─────────────────────────────────────────────────────

export function uniqueByDate(entries: ReflectionEntry[]): ReflectionEntry[] {
  const seen = new Set<string>();
  const out: ReflectionEntry[] = [];
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  for (const e of sorted) {
    const k = `${e.userId}::${e.date}`;
    if (!seen.has(k)) { seen.add(k); out.push(e); }
  }
  return out;
}

// ── calculateStreak ─────────────────────────────────────────────────────────
// Pure consecutive-day counter. Does NOT consume freeze tokens — caller
// invokes useFreezeToken first to bridge 1-day gaps if desired.

export function calculateStreak(
  entries: ReflectionEntry[],
  today: string,
): { current: number; longest: number; lastEntryDate: string | null } {
  const sorted = uniqueByDate(entries).filter((e) => e.date <= today);
  if (sorted.length === 0) return { current: 0, longest: 0, lastEntryDate: null };

  const lastDate = (sorted[sorted.length - 1] as ReflectionEntry).date;
  let current = 0;
  let expectedPrior = addDays(lastDate, -1);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const e = sorted[i] as ReflectionEntry;
    if (e.date === expectedPrior || e.date === lastDate) {
      current += 1;
      expectedPrior = addDays(e.date, -1);
    } else if (e.date < expectedPrior) break;
  }

  let longest = Math.max(1, current);
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = dayDiff((sorted[i - 1] as ReflectionEntry).date, (sorted[i] as ReflectionEntry).date);
    if (diff === 1) { run += 1; if (run > longest) longest = run; }
    else if (diff > 1) run = 1;
  }
  return { current, longest, lastEntryDate: lastDate };
}

// ── Milestone helpers ───────────────────────────────────────────────────────

export function awardMilestoneReward(
  _streak: Streak,
  newStreakDays: number,
): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.days === newStreakDays) ?? null;
}

export function getNextMilestone(currentDays: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.days > currentDays) ?? null;
}

export function daysUntilNextMilestone(currentDays: number): number {
  const next = getNextMilestone(currentDays);
  return next ? next.days - currentDays : 0;
}

// ── updateStreakOnEntry ─────────────────────────────────────────────────────
// Same-day: idempotent. Future: dropped. Backwards: only bumps lastEntryDate.
// Milestone crossings grant one freeze (no double-grants on re-entry).

export function updateStreakOnEntry(
  streak: Streak,
  entry: ReflectionEntry,
  now: Date,
): Streak {
  const today = toDateKey(now);
  if (streak.lastEntryDate === entry.date) return streak;
  if (entry.date > today) return streak;

  const prev = streak.current;
  let current: number;
  const last = streak.lastEntryDate;

  if (last === null) current = 1;
  else if (entry.date === addDays(last, 1)) current = prev + 1;
  else if (entry.date > last) current = 1;       // unbridged gap, restart
  else return entry.date > last ? { ...streak, lastEntryDate: entry.date } : streak;

  const longest = Math.max(streak.longest, current);
  let freezesAvailable = streak.freezesAvailable;
  const ms = awardMilestoneReward(streak, current);
  if (ms !== null && prev < ms.days) freezesAvailable += FREEZE_TOKENS_PER_MILESTONE;

  return { ...streak, current, longest, lastEntryDate: entry.date, freezesAvailable };
}

// ── Freeze tokens ───────────────────────────────────────────────────────────

export function createFreezeToken(
  userId: string,
  source: FreezeToken["source"],
  now: Date,
): FreezeToken {
  return { userId, source, earnedAt: now.toISOString() };
}

export function canUseFreezeToken(streak: Streak, date: string): boolean {
  // Freeze valid when date ∈ [lastEntryDate, lastEntryDate + 1d], i.e.
  // covering today (no entry yet) or the just-elapsed gap day (yesterday).
  if (streak.freezesAvailable <= 0 || streak.lastEntryDate === null) return false;
  const diff = dayDiff(streak.lastEntryDate, date);
  return diff === 0 || diff === 1;
}

export function useFreezeToken(
  streak: Streak,
  missedDate: string,
  _now: Date,
): { success: boolean; updatedStreak: Streak; tokenUsed: boolean } {
  if (!canUseFreezeToken(streak, missedDate)) {
    return { success: false, updatedStreak: streak, tokenUsed: false };
  }
  const advanced =
    streak.lastEntryDate !== null && missedDate > streak.lastEntryDate
      ? missedDate
      : streak.lastEntryDate;
  return {
    success: true,
    tokenUsed: true,
    updatedStreak: {
      ...streak,
      freezesAvailable: streak.freezesAvailable - 1,
      freezesUsed: streak.freezesUsed + 1,
      lastEntryDate: advanced,
    },
  };
}

// ── Risk + repair ───────────────────────────────────────────────────────────

export function isStreakAtRisk(streak: Streak, today: string): boolean {
  if (streak.lastEntryDate === null || streak.current === 0) return false;
  return dayDiff(streak.lastEntryDate, today) === 1;
}

export function recalculateStreakAfterMissedDay(
  streak: Streak,
  today: string,
): { newStreak: Streak; broken: boolean; freezesUsed: number } {
  if (streak.lastEntryDate === null) {
    return { newStreak: streak, broken: false, freezesUsed: 0 };
  }
  const gap = dayDiff(streak.lastEntryDate, today);
  if (gap <= 1) return { newStreak: streak, broken: false, freezesUsed: 0 };
  if (gap === 2 && streak.freezesAvailable > 0) {
    const missed = addDays(streak.lastEntryDate, 1);
    const r = useFreezeToken(streak, missed, new Date(`${today}T12:00:00Z`));
    return { newStreak: r.updatedStreak, broken: false, freezesUsed: r.tokenUsed ? 1 : 0 };
  }
  return {
    newStreak: { ...streak, current: 0, lastEntryDate: streak.lastEntryDate },
    broken: true,
    freezesUsed: 0,
  };
}

// ── summarizeStreakHealth ───────────────────────────────────────────────────
// onFire: current ≥ 7  |  atRisk: active but no freezes left  |  broken: 0

export function summarizeStreakHealth(streak: Streak): {
  onFire: boolean; atRisk: boolean; broken: boolean; freezeCount: number;
} {
  const broken = streak.current === 0;
  return {
    onFire: streak.current >= 7,
    atRisk: !broken && streak.freezesAvailable === 0,
    broken,
    freezeCount: streak.freezesAvailable,
  };
}
