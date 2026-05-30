import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/samadhi/samadhi-practice';

describe('samadhi-practice', () => {
  it('performPractice returns samadhi result', () => {
    const result = performPractice();
    expect(result).toHaveProperty('state');
    expect(result).toHaveProperty('depth');
  });

  it('returns default samadhi state', () => {
    const result = performPractice();
    expect(result.state).toBe('samadhi');
    expect(result.depth).toBe(0);
  });
});
