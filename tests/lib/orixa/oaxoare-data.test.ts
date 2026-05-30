import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oaxoare-data';

describe('orixa/oaxoare-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
