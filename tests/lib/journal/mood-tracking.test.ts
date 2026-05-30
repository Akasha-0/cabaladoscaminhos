import { describe, it, expect } from 'vitest';
import { trackMood, getMoodHistory } from '@/lib/journal/mood-tracking';

describe('journal/mood-tracking', () => {
  it('tracks a mood entry', () => {
    const entry = trackMood(4, 'Feeling good');
    expect(entry).toBeDefined();
    expect(entry.mood).toBe(4);
    expect(entry.note).toBe('Feeling good');
  });

  it('clamps mood to valid range', () => {
    const entryHigh = trackMood(10);
    expect(entryHigh.mood).toBe(5);
    const entryLow = trackMood(0);
    expect(entryLow.mood).toBe(1);
  });

  it('getMoodHistory returns an array', () => {
    const history = getMoodHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});