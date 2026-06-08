import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/busca-data';

describe('orixa/busca-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
