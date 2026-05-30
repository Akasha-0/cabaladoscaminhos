import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/past-life/past-life-practice';

describe('past-life/past-life-practice', () => {
  it('performs practice and returns result', () => {
    const result = performPractice();
    expect(result).toBe('past-life practice');
  });
});