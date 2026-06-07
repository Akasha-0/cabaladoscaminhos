import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/harmonizacao-data';

describe('orixa/harmonizacao-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
