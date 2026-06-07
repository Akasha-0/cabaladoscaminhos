import { describe, it, expect } from 'vitest';
import { getPatterns, getPattern, getPatternDuration } from '@/lib/breathwork/breath-patterns';

describe('breath-patterns', () => {
  it('returns array of patterns', () => {
    const patterns = getPatterns();
    expect(Array.isArray(patterns)).toBe(true);
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('gets pattern by id', () => {
    const patterns = getPatterns();
    const id = patterns[0].id;
    const pattern = getPattern(id);
    expect(pattern).toBeDefined();
    expect(pattern?.id).toBe(id);
  });

  it('calculates pattern duration', () => {
    const patterns = getPatterns();
    const duration = getPatternDuration(patterns[0]);
    expect(duration).toBeGreaterThan(0);
  });
});
