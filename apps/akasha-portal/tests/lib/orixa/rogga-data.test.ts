import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/rogga-data';

describe('orixa/rogga-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
