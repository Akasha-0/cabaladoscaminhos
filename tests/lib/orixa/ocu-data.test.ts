import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ocu-data';

describe('orixa/ocu-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
