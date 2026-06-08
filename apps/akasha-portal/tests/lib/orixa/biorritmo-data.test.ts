import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/biorritmo-data';

describe('orixa/biorritmo-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
