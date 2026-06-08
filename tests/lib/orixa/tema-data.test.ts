import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/tema-data';

describe('orixa/tema-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
