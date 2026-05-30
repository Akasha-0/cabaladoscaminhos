import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/reincarnation/reincarnation-practice';

describe('reincarnation/reincarnation-practice', () => {
  it('performs practice and returns result', () => {
    const result = performPractice();
    expect(result).toBe('reincarnation practice');
  });
});