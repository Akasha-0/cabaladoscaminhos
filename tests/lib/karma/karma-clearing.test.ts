import { describe, it, expect } from 'vitest';
import { clearKarma, type ClearingResult } from '@/lib/karma/karma-clearing';

describe('karma/karma-clearing', () => {
  it('clears karma with specified amount', () => {
    const result: ClearingResult = clearKarma(100, { amount: 30, reason: 'Test clearing' });
    expect(result.originalKarma).toBe(100);
    expect(result.clearedAmount).toBe(30);
    expect(result.newKarma).toBe(70);
  });

  it('handles zero amount gracefully', () => {
    const result = clearKarma(50, { amount: 0 });
    expect(result.clearedAmount).toBe(0);
    expect(result.newKarma).toBe(50);
  });

  it('caps cleared amount at current karma', () => {
    const result = clearKarma(20, { amount: 100 });
    expect(result.clearedAmount).toBe(20);
    expect(result.newKarma).toBe(0);
  });

  it('throws on negative amount', () => {
    expect(() => clearKarma(50, { amount: -10 })).toThrow(RangeError);
  });
});