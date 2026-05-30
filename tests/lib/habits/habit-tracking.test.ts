import { describe, it, expect } from 'vitest';
import { trackHabit, type TrackingResult } from '@/lib/habits/habit-tracking';

describe('habits/habit-tracking', () => {
  it('tracks a habit completion', async () => {
    const result: TrackingResult = await trackHabit('habit-123', '2026-05-30', true);
    expect(result.success).toBe(true);
    expect(result.record).toBeDefined();
    expect(result.record?.habitId).toBe('habit-123');
    expect(result.record?.completed).toBe(true);
  });

  it('tracks a habit with notes', async () => {
    const result = await trackHabit('habit-456', '2026-05-30', true, 'Test notes');
    expect(result.success).toBe(true);
    expect(result.record?.notes).toBe('Test notes');
  });
});