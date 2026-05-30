import { describe, it, expect } from 'vitest';
import { calculateBalance } from '@/lib/elements/element-balance';

describe('element-balance', () => {
  it('should calculate balance from element counts', () => {
    const result = calculateBalance({
      fogo: 2,
      terra: 1,
      ar: 1,
      agua: 1,
    });
    expect(result).toBeDefined();
    expect(result.status).toBeDefined();
  });

  it('should handle balanced input', () => {
    const result = calculateBalance({
      fogo: 1,
      terra: 1,
      ar: 1,
      agua: 1,
    });
    expect(result).toBeDefined();
    expect(result.status).toBe('balanced');
  });
});
