import { describe, it, expect } from 'vitest';
import { getDashboardData, calculateStreaks, generateWeeklyProgress, generateCategoryBreakdown, getDefaultAchievements } from '@/lib/stats/dashboard';

describe('stats/dashboard', () => {
  it('returns dashboard data', () => {
    const data = getDashboardData();
    expect(data.stats).toBeDefined();
    expect(data.visualization).toBeDefined();
    expect(data.lastUpdated).toBeDefined();
  });

  it('calculates streaks from activities', () => {
    const activities = [
      { date: new Date().toISOString().split('T')[0], sessions: 1, minutes: 10, type: 'meditation' as const },
    ];
    const streaks = calculateStreaks(activities);
    expect(streaks.current).toBeGreaterThanOrEqual(0);
    expect(streaks.longest).toBeGreaterThanOrEqual(0);
  });

  it('generates weekly progress', () => {
    const activities = [
      { date: new Date().toISOString().split('T')[0], sessions: 2, minutes: 30, type: 'meditation' as const },
    ];
    const weekly = generateWeeklyProgress(activities, 4);
    expect(weekly.length).toBe(4);
  });
});
