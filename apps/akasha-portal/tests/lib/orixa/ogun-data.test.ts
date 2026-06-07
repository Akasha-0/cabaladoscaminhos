import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ogun-data';

describe('orixa/ogun-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
