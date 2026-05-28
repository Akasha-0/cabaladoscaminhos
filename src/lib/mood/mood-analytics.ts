/**
 * Mood analytics — mood tracking stats and insights.
 */

export interface MoodEntry {
  id: string;
  mood: number;
  note?: string;
  timestamp: number;
}

export interface MoodAnalytics {
  totalEntries: number;
  averageMood: number;
  moodDistribution: Record<number, number>;
  highestMood: number | null;
  lowestMood: number | null;
  currentStreak: number;
  longestStreak: number;
  lastEntry: number | null;
  weeklyAverage: number;
  trend: 'improving' | 'declining' | 'stable';
  periodStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

const STORAGE_KEY = 'mood_entries';

function getEntries(): MoodEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MoodEntry[]) : [];
  } catch {
    return [];
  }
}

function calculateStreak(entries: MoodEntry[]): { current: number; longest: number } {
  if (entries.length === 0) return { current: 0, longest: 0 };

  const dayMs = 24 * 60 * 60 * 1000;

  function getDay(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  const days = Array.from(new Set(entries.map(e => getDay(e.timestamp)))).sort().reverse();

  let current = 0;
  let longest = 0;
  let streak = 0;
  const today = getDay(Date.now());
  const yesterday = getDay(Date.now() - dayMs);

  if (days[0] === today || days[0] === yesterday) {
    for (let i = 0; i < days.length; i++) {
      const expected = getDay(Date.now() - i * dayMs);
      if (days[i] === expected || days[i] === getDay(Date.now() - i * dayMs)) {
        streak++;
      } else {
        break;
      }
    }
    current = streak;
  }

  streak = 0;
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(days[0]).getTime() - i * dayMs;
    if (getDay(expected) === days[i]) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }

  return { current, longest };
}

function getMoodTrend(entries: MoodEntry[]): 'improving' | 'declining' | 'stable' {
  if (entries.length < 4) return 'stable';

  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const recent = sorted.slice(-Math.min(7, Math.floor(sorted.length / 2)));
  const older = sorted.slice(0, recent.length);

  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
  const olderAvg = older.reduce((sum, e) => sum + e.mood, 0) / older.length;

  const diff = recentAvg - olderAvg;
  if (diff > 0.3) return 'improving';
  if (diff < -0.3) return 'declining';
  return 'stable';
}

function getPeriodStats(entries: MoodEntry[]): MoodAnalytics['periodStats'] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = now - 7 * dayMs;
  const monthAgo = now - 30 * dayMs;

  const todayEntries = entries.filter(e => new Date(e.timestamp).toISOString().split('T')[0] === today);
  const weekEntries = entries.filter(e => e.timestamp >= weekAgo);
  const monthEntries = entries.filter(e => e.timestamp >= monthAgo);

  return {
    today: todayEntries.length > 0 ? todayEntries.reduce((s, e) => s + e.mood, 0) / todayEntries.length : 0,
    thisWeek: weekEntries.length > 0 ? weekEntries.reduce((s, e) => s + e.mood, 0) / weekEntries.length : 0,
    thisMonth: monthEntries.length > 0 ? monthEntries.reduce((s, e) => s + e.mood, 0) / monthEntries.length : 0,
  };
}

export function getAnalytics(): MoodAnalytics {
  const entries = getEntries();

  if (entries.length === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      highestMood: null,
      lowestMood: null,
      currentStreak: 0,
      longestStreak: 0,
      lastEntry: null,
      weeklyAverage: 0,
      trend: 'stable',
      periodStats: { today: 0, thisWeek: 0, thisMonth: 0 },
    };
  }

  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const moods = entries.map(e => e.mood);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const mood of moods) {
    distribution[mood] = (distribution[mood] || 0) + 1;
  }

  const { current, longest } = calculateStreak(entries);
  const weekEntries = entries.filter(e => e.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000);

  return {
    totalEntries: entries.length,
    averageMood: moods.reduce((s, m) => s + m, 0) / moods.length,
    moodDistribution: distribution,
    highestMood: Math.max(...moods),
    lowestMood: Math.min(...moods),
    currentStreak: current,
    longestStreak: longest,
    lastEntry: sorted[0]?.timestamp ?? null,
    weeklyAverage: weekEntries.length > 0 ? weekEntries.reduce((s, e) => s + e.mood, 0) / weekEntries.length : 0,
    trend: getMoodTrend(entries),
    periodStats: getPeriodStats(entries),
  };
}

export function _resetMoodAnalytics(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
