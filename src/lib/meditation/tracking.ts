/**
 * Meditation tracking module.
 * Tracks duration, frequency, and statistics for meditation sessions.
 */

export interface MeditationSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes: number;
  type?: string;
  notes?: string;
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  averageDuration: number;
  longestStreak: number;
  currentStreak: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  lastSession?: Date;
}

const sessions: MeditationSession[] = [];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function calculateStreaks(sessions: MeditationSession[]): { current: number; longest: number } {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  const sorted = [...sessions].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  const dates = sorted.map((s) => getDateKey(s.startedAt));
  const uniqueDates = [...new Set(dates)].sort().reverse();

  const today = getDateKey(new Date());
  const yesterday = getDateKey(new Date(Date.now() - 86400000));

  let current = 0;
  let longest = 0;
  let streak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of [...uniqueDates].sort()) {
    const d = new Date(dateStr);
    if (prevDate === null) {
      streak = 1;
      if (dateStr === today || dateStr === yesterday) {
        current = 1;
      }
    } else {
      const diff = (d.getTime() - prevDate.getTime()) / 86400000;
      if (diff === 1) {
        streak++;
        if (current > 0) current++;
      } else {
        longest = Math.max(longest, streak);
        streak = 1;
      }
    }
    prevDate = d;
  }
  longest = Math.max(longest, streak);

  return { current, longest };
}

function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Track a completed meditation session.
 */
export function trackMeditation(params: {
  durationMinutes: number;
  type?: string;
  notes?: string;
}): MeditationSession {
  const session: MeditationSession = {
    id: generateId(),
    startedAt: new Date(),
    durationMinutes: params.durationMinutes,
    type: params.type,
    notes: params.notes,
  };

  session.endedAt = new Date();
  sessions.push(session);
  return session;
}

/**
 * Get statistics for all meditation sessions.
 */
export function getMeditationStats(): MeditationStats {
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const averageDuration = totalSessions > 0 ? totalMinutes / totalSessions : 0;

  const { current, longest } = calculateStreaks(sessions);

  const week = getWeekRange();
  const month = getMonthRange();
  const sessionsThisWeek = sessions.filter(
    (s) => s.startedAt >= week.start && s.startedAt <= week.end
  ).length;
  const sessionsThisMonth = sessions.filter(
    (s) => s.startedAt >= month.start && s.startedAt <= month.end
  ).length;

  const sorted = [...sessions].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  const lastSession = sorted.length > 0 ? sorted[0].startedAt : undefined;

  return {
    totalSessions,
    totalMinutes,
    averageDuration,
    longestStreak: longest,
    currentStreak: current,
    sessionsThisWeek,
    sessionsThisMonth,
    lastSession,
  };
}
