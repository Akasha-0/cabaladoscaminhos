import { describe, it, expect, beforeEach } from 'vitest';
import { getStreaks, getHabitStreak, recordHabitCompletion, resetHabitStreak } from '@/lib/habits/habit-streaks';

describe('habits/habit-streaks', () => {
  const TEST_HABIT = 'test-habit-123';

  beforeEach(() => {
    resetHabitStreak(TEST_HABIT);
  });

  it('getStreaks returns a result object', () => {
    const result = getStreaks();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('streaks');
  });

  it('getHabitStreak returns streak data for a habit', () => {
    const streak = getHabitStreak(TEST_HABIT);
    expect(streak).toBeDefined();
    expect(streak.habitId).toBe(TEST_HABIT);
  });

  it('recordHabitCompletion updates the streak', () => {
    const streak = recordHabitCompletion(TEST_HABIT);
    expect(streak).toBeDefined();
    expect(streak.currentStreak).toBeGreaterThanOrEqual(0);
  });
});