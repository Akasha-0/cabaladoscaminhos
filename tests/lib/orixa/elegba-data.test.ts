import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/elegba-data';

describe('orixa/elegba-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
