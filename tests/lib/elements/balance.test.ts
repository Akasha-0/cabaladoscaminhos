import { describe, it, expect } from 'vitest';
import { calculateBalance, getElementColor, getElementSymbol } from '~/lib/elements/balance';

describe('balance', () => {
  it('should calculate balance from signs', () => {
    const result = calculateBalance({
      signs: ['aries', 'leo', 'sagittarius', 'sun'],
    });
    expect(result).toBeDefined();
    expect(result.balanced).toBeDefined();
  });

  it('should return element colors', () => {
    expect(getElementColor('fogo')).toBe('#FF6B35');
    expect(getElementColor('agua')).toBe('#4A90D9');
  });

  it('should return element symbols', () => {
    expect(getElementSymbol('fogo')).toBe('△');
    expect(getElementSymbol('agua')).toBe('▽');
  });
});
