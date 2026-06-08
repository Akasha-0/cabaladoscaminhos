import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/shadow/shadow-practice';

describe('shadow-practice', () => {
  it('performPractice does not throw', () => {
    expect(() => performPractice()).not.toThrow();
  });
});
