import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/integracao-data';

describe('orixa/integracao-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
