import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/herb/v2/herb-v2-practice';

describe('herb-v2-practice', () => {
  it('performPractice returns promise', async () => {
    const result = await performPractice({});
    expect(typeof result).toBe('object');
  });

  it('result has required fields', async () => {
    const result = await performPractice({});
    expect(result).toHaveProperty('completed');
    expect(result).toHaveProperty('herbsUsed');
    expect(result).toHaveProperty('practiceType');
  });

  it('returns completed practice', async () => {
    const result = await performPractice({});
    expect(result.completed).toBe(true);
    expect(Array.isArray(result.herbsUsed)).toBe(true);
  });
});