import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/loja-data';

describe('orixa/loja-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
