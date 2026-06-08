import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/suporte-data';

describe('orixa/suporte-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
