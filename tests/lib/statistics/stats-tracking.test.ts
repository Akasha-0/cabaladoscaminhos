import { describe, it, expect, vi } from 'vitest';
import { trackStats, setTracker } from '@/lib/statistics/stats-tracking';

describe('statistics/stats-tracking', () => {
  it('tracks a stats event', () => {
    const mockTracker = { track: vi.fn() };
    setTracker(mockTracker);
    trackStats({ name: 'test-event', value: 1 });
    expect(mockTracker.track).toHaveBeenCalledWith(expect.objectContaining({ name: 'test-event', value: 1 }));
    setTracker({ track: () => {} });
  });

  it('returns a result from trackStats', () => {
    const mockTracker = { track: vi.fn() };
    setTracker(mockTracker);
    trackStats({ name: 'quiz-completed', value: 85 });
    expect(mockTracker.track).toHaveBeenCalledTimes(1);
    setTracker({ track: () => {} });
  });
});
