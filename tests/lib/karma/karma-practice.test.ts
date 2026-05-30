import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/karma/karma-practice';

describe('karma/karma-practice', () => {
  it('performs practice without errors', () => {
    expect(() => performPractice()).not.toThrow();
  });
});