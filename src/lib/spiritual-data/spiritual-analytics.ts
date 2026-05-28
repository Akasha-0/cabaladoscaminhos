/**
 * Spiritual analytics — track spiritual practice engagement and trends.
 */

export interface SpiritualEvent {
  type:
    | 'ritual_complete'
    | 'meditation_complete'
    | 'divination_draw'
    | 'affirmation_set'
    | 'chakra_balance'
    | 'prayer_offer'
    | 'journal_entry'
    | 'tarot_read';
  category: 'ritual' | 'meditation' | 'divination' | 'affirmation' | 'energy' | 'prayer' | 'journal' | 'tarot';
  timestamp: number;
  meta?: {
    duration?: number;
    dayOfWeek?: number;
    lunarPhase?: string;
    orixaAssociated?: string;
    score?: number;
    notes?: string;
  };
}

export interface TrendData {
  date: string;
  count: number;
  categoryCounts: Record<string, number>;
}

export interface SpiritualTrend {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  totalEvents: number;
  trends: TrendData[];
  categoryBreakdown: Record<string, number>;
  peakDay: string;
  avgPerDay: number;
  growthRate: number; // percentage change vs previous period
}

export interface SpiritualAnalyticsData {
  totalEvents: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  streakCurrent: number;
  streakLongest: number;
  lastActivity: number | null;
  trends: {
    daily: SpiritualTrend;
    weekly: SpiritualTrend;
    monthly: SpiritualTrend;
  };
  topOrixas: string[];
  lunarCorrelations: Record<string, number>;
}

const events: SpiritualEvent[] = [];

/**
 * Track a spiritual event.
 */
export function trackSpiritualEvent(event: Omit<SpiritualEvent, 'timestamp'>): void {
  events.push({ ...event, timestamp: Date.now() });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

function calculateStreak(category?: string): { current: number; longest: number } {
  if (events.length === 0) return { current: 0, longest: 0 };

  const filtered = category
    ? events.filter((e) => !category || e.category === category)
    : [...events].sort((a, b) => a.timestamp - b.timestamp);

  if (filtered.length === 0) return { current: 0, longest: 0 };

  const dates = [...new Set(filtered.map((e) => formatDate(e.timestamp)))].sort();
  let current = 1;
  let longest = 1;
  let temp = 1;

  const today = formatDate(Date.now());
  const yesterday = formatDate(Date.now() - 86400000);
  const lastDate = dates[dates.length - 1];

  if (lastDate !== today && lastDate !== yesterday) {
    current = 0;
  }

  for (let i = dates.length - 1; i > 0; i--) {
    const diff =
      new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime();
    if (diff <= 86400000 * 2) {
      if (dates[i] === today || dates[i] === yesterday) current = temp + 1;
      temp++;
    } else {
      temp = 1;
    }
    longest = Math.max(longest, temp);
  }

  return { current, longest };
}

function buildTrend(
  periodStart: number,
  periodEnd: number,
  periodLabel: 'day' | 'week' | 'month' | 'year'
): SpiritualTrend {
  const periodEvents = events.filter(
    (e) => e.timestamp >= periodStart && e.timestamp <= periodEnd
  );

  const prevStart = periodStart - (periodEnd - periodStart);
  const prevEvents = events.filter(
    (e) => e.timestamp >= prevStart && e.timestamp < periodStart
  );

  const dailyCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const orixas: string[] = [];
  const lunarPhases: Record<string, number> = {};

  periodEvents.forEach((e) => {
    const day = formatDate(e.timestamp);
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;

    if (e.meta?.orixaAssociated) orixas.push(e.meta.orixaAssociated);
    if (e.meta?.lunarPhase) {
      lunarPhases[e.meta.lunarPhase] = (lunarPhases[e.meta.lunarPhase] || 0) + 1;
    }
  });

  const trends: TrendData[] = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      const dayEvents = periodEvents.filter((e) => formatDate(e.timestamp) === date);
      const categoryCountMap: Record<string, number> = {};
      dayEvents.forEach((e) => {
        categoryCountMap[e.category] = (categoryCountMap[e.category] || 0) + 1;
      });
      return { date, count, categoryCounts: categoryCountMap };
    });

  const totalDays = Math.max(1, (periodEnd - periodStart) / 86400000);
  const avgPerDay = Math.round((periodEvents.length / totalDays) * 100) / 100;
  const growthRate =
    prevEvents.length > 0
      ? Math.round(((periodEvents.length - prevEvents.length) / prevEvents.length) * 100)
      : 0;

  const orixaCount: Record<string, number> = {};
  orixas.forEach((o) => {
    orixaCount[o] = (orixaCount[o] || 0) + 1;
  });
  const _topOrixas = Object.entries(orixaCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  const peakDay = Object.entries(dailyCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '';

  return {
    period: periodLabel,
    startDate: formatDate(periodStart),
    endDate: formatDate(periodEnd),
    totalEvents: periodEvents.length,
    trends,
    categoryBreakdown: categoryCounts,
    peakDay,
    avgPerDay,
    growthRate,
  };
}

/**
 * Get spiritual analytics data with trend analysis.
 */
export function getAnalytics(): SpiritualAnalyticsData {
  const categoryCount: Record<string, number> = {};
  const typeCount: Record<string, number> = {};
  const orixaList: string[] = [];
  const lunarCorr: Record<string, number> = {};

  events.forEach((e) => {
    categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
    typeCount[e.type] = (typeCount[e.type] || 0) + 1;
    if (e.meta?.orixaAssociated) orixaList.push(e.meta.orixaAssociated);
    if (e.meta?.lunarPhase) {
      lunarCorr[e.meta.lunarPhase] = (lunarCorr[e.meta.lunarPhase] || 0) + 1;
    }
  });

  const streak = calculateStreak();
  const now = Date.now();
  const dayMs = 86400000;
  const weekMs = dayMs * 7;
  const monthMs = dayMs * 30;

  const daily = buildTrend(now - dayMs, now, 'day');
  const weekly = buildTrend(now - weekMs, now, 'week');
  const monthly = buildTrend(now - monthMs, now, 'month');

  const orixaCount: Record<string, number> = {};
  orixaList.forEach((o) => {
    orixaCount[o] = (orixaCount[o] || 0) + 1;
  });
  const topOrixas = Object.entries(orixaCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  return {
    totalEvents: events.length,
    byCategory: categoryCount,
    byType: typeCount,
    streakCurrent: streak.current,
    streakLongest: streak.longest,
    lastActivity: events.length > 0 ? events[events.length - 1].timestamp : null,
    trends: { daily, weekly, monthly },
    topOrixas,
    lunarCorrelations: lunarCorr,
  };
}

/**
 * Reset analytics state (for testing only).
 */
export function _resetSpiritualAnalytics(): void {
  events.length = 0;
}