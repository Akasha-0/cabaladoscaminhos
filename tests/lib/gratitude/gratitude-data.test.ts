import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/gratitude/practice/gratitude-data';

describe('gratitude/gratitude-data', () => {
  it('returns gratitude practice data', () => {
    const data = getData();
    expect(data).toBeDefined();
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('sections');
  });

  it('includes sections with content', () => {
    const data = getData();
    expect(Array.isArray(data.sections)).toBe(true);
    expect(data.sections.length).toBeGreaterThan(0);
  });
});