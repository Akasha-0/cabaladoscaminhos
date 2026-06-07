import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/choice/choice-practice';

describe('choice/choice-practice', () => {
  it('performPractice runs without error', () => {
    expect(() => performPractice()).not.toThrow();
  });
});
