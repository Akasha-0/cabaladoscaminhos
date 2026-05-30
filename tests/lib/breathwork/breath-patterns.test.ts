import { describe, it, expect } from 'vitest';
import { getPatterns, getPattern, getPatternsByCategory, getPatternDuration } from '@/lib/breathwork/breath-patterns';

describe('breath-patterns', () => {
  it('getPatterns returns array of patterns', () => {
    const patterns = getPatterns();
    expect(Array.isArray(patterns)).toBe(true);
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('getPattern finds pattern by id', () => {
    const pattern = getPattern('box-breathing');
    expect(pattern).toBeDefined();
    expect(pattern?.id).toBe('box-breathing');
  });

  it('getPatternDuration returns positive number', () => {
    const pattern = getPattern('box-breathing');
    const duration = getPatternDuration(pattern!);
    expect(duration).toBeGreaterThan(0);
  });
});