import { describe, it, expect } from 'vitest';
import { getSymbols } from '@/lib/reiki/reiki-symbols';

describe('reiki/reiki-symbols', () => {
  it('returns data', () => {
    const data = getSymbols();
    expect(Array.isArray(data) || typeof data === 'object').toBe(true);
  });
});
