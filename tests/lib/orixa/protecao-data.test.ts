import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/protecao-data';

describe('orixa/protecao-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
