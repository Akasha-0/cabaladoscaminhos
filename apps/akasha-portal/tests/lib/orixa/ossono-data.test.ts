import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ossono-data';

describe('orixa/ossono-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
