import { describe, it, expect } from 'vitest';
import { getDailyAffirmation } from '@/lib/affirmations/daily';

describe('affirmations/daily', () => {
  it('returns a string', () => {
    const affirmation = getDailyAffirmation();
    expect(typeof affirmation).toBe('string');
    expect(affirmation.length).toBeGreaterThan(0);
  });
});
