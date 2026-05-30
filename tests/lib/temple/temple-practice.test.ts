import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/temple/temple-practice';

describe('temple/temple-practice', () => {
  it('performPractice returns a result', () => {
    const result = performPractice();
    expect(result.success).toBe(true);
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.energy).toBe(100);
  });
});
