import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/gratitude/practice/gratitude-practice';

describe('gratitude/gratitude-practice', () => {
  it('performs practice without errors', async () => {
    await expect(performPractice()).resolves.not.toThrow();
  });
});