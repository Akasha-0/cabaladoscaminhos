import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ogunhle-data';

describe('orixa/ogunhle-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
