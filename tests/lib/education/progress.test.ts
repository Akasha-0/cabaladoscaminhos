import { describe, it, expect } from 'vitest';
import { trackProgress, getProgress, calculateCompletion } from '@/lib/education/progress';

describe('education/progress', () => {
  it('tracks progress for a topic', () => {
    trackProgress('cabala-basics');
    const result = getProgress('cabala-basics') as unknown[];
    expect(result.length).toBeGreaterThan(0);
  });

  it('calculates completion percentage', () => {
    trackProgress('test-topic');
    const completion = calculateCompletion('test-topic', 5);
    expect(completion).toBeGreaterThan(0);
    expect(completion).toBeLessThanOrEqual(100);
  });
});
