import { describe, it, expect } from 'vitest';
import { trackStats, getStats } from '@/lib/stats/tracking';

describe('stats/tracking', () => {
  it('tracks a stats event', () => {
    const initial = getStats();
    const initialCount = initial.entries.length;
    trackStats('test-key', { value: 42 });
    const after = getStats();
    expect(after.entries.length).toBe(initialCount + 1);
    expect(after.entries[after.entries.length - 1].key).toBe('test-key');
  });

  it('getStats returns entries', () => {
    const stats = getStats();
    expect(Array.isArray(stats.entries)).toBe(true);
  });
});
