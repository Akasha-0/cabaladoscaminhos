// fallow-ignore-file unused-file
/**
 * Meditation analytics — session stats and engagement tracking.
 */

export interface MeditationAnalyticsEvent {
  type: 'start' | 'complete' | 'skip' | 'pause';
  sessionId: string;
  duration?: number;
  meditationType?: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export interface MeditationSessionStats {
  totalSessions: number;
  completedSessions: number;
  skippedSessions: number;
  totalMinutes: number;
  averageSessionMinutes: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  byType: Record<string, number>;
  lastSession: number | null;
  periodStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

const events: MeditationAnalyticsEvent[] = [];

/**
 * Track a meditation analytics event.
 */
export function trackMeditationEvent(
  event: Omit<MeditationAnalyticsEvent, 'timestamp'>
): void {
  events.push({ ...event, timestamp: Date.now() });
}

/**
 * Calculate session streak (consecutive days with at least one completed session).
 */
// fallow-ignore-next-line complexity
function calculateStreak(sessions: MeditationAnalyticsEvent[]): { current: number; longest: number } {
  const completed = sessions
    .filter((e) => e.type === 'complete')
    .sort((a, b) => a.timestamp - b.timestamp);

  if (completed.length === 0) {
    return { current: 0, longest: 0 };
  }

  const dayKey = (ts: number) => new Date(ts).toISOString().split('T')[0];
  const uniqueDays = [...new Set(completed.map((e) => dayKey(e.timestamp)))].sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]).getTime();
    const curr = new Date(uniqueDays[i]).getTime();
    if (curr - prev === 86400000) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  if (uniqueDays.includes(today) || uniqueDays.includes(yesterday)) {
    let tempStreak = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      const prev = new Date(uniqueDays[i - 1]).getTime();
      const curr = new Date(uniqueDays[i]).getTime();
      if (curr - prev === 86400000) {
        tempStreak++;
      } else {
        break;
      }
    }
    currentStreak = tempStreak;
  }

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Retrieve meditation analytics / session stats.
// fallow-ignore-next-line complexity
 */
export function getAnalytics(): MeditationSessionStats {
  const completed = events.filter((e) => e.type === 'complete');
  const skipped = events.filter((e) => e.type === 'skip');
  const totalSessions = completed.length + skipped.length + events.filter((e) => e.type === 'start').length;

  const totalMinutes = completed.reduce((sum, e) => sum + (e.duration ?? 0), 0) / 60000;
  const averageSessionMinutes = completed.length > 0 ? totalMinutes / completed.length : 0;
  const completionRate = totalSessions > 0 ? (completed.length / totalSessions) * 100 : 0;

  const byType: Record<string, number> = {};
  for (const e of completed) {
    const type = e.meditationType ?? 'default';
    byType[type] = (byType[type] ?? 0) + 1;
  }

  const { current, longest } = calculateStreak(events);

  const lastSession = completed.length > 0
    ? Math.max(...completed.map((e) => e.timestamp))
    : null;

  const dayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = dayStart - (new Date(dayStart).getDay() * 86400000);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  const periodStats = {
    today: completed.filter((e) => e.timestamp >= dayStart).length,
    thisWeek: completed.filter((e) => e.timestamp >= weekStart).length,
    thisMonth: completed.filter((e) => e.timestamp >= monthStart).length,
  };

  return {
    totalSessions,
    completedSessions: completed.length,
    skippedSessions: skipped.length,
    totalMinutes: Math.round(totalMinutes * 100) / 100,
    averageSessionMinutes: Math.round(averageSessionMinutes * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
    currentStreak: current,
    longestStreak: longest,
    byType,
    lastSession,
    periodStats,
  };
}

/**
 * Reset analytics state (for testing only).
 */
export function _resetMeditationAnalytics(): void {
  events.length = 0;
}
