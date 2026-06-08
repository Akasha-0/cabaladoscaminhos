import { describe, it, expect } from 'vitest';
import { trackGoal, getGoalProgress, completeGoal, updateGoalProgress, getActiveGoals, getCompletedGoals } from '@/lib/goals/tracking';

describe('goals/tracking', () => {
  it('tracks a goal', () => {
    const goal = trackGoal('test-goal-1', 'Learn Cabala');
    expect(goal.id).toBe('test-goal-1');
    expect(goal.title).toBe('Learn Cabala');
    expect(goal.status).toBe('active');
  });

  it('updates goal progress', () => {
    trackGoal('test-goal-2', 'Practice Meditation');
    const updated = updateGoalProgress('test-goal-2', 50);
    expect(updated).not.toBeNull();
    expect(updated?.progress).toBe(50);
  });

  it('completes a goal', () => {
    trackGoal('test-goal-3', 'Read one chapter');
    const completed = completeGoal('test-goal-3');
    expect(completed).not.toBeNull();
    expect(completed?.status).toBe('completed');
  });
});
