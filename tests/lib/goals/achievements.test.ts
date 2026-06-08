import { describe, it, expect } from 'vitest';
import { getAchievements, getAchievementById, getAchievementsByCategory, getUnlockedCount, getTotalCount, getCompletionPercentage } from '@/lib/goals/achievements';

describe('goals/achievements', () => {
  it('returns achievements list', () => {
    const achievements = getAchievements();
    expect(achievements.length).toBeGreaterThan(0);
  });

  it('finds achievement by id', () => {
    const ach = getAchievementById('first-goal');
    expect(ach).toBeDefined();
    expect(ach?.id).toBe('first-goal');
  });

  it('returns total and unlocked counts', () => {
    const total = getTotalCount();
    const unlocked = getUnlockedCount();
    expect(total).toBeGreaterThan(0);
    expect(unlocked).toBeGreaterThanOrEqual(0);
    expect(getCompletionPercentage()).toBeLessThanOrEqual(100);
  });
});
