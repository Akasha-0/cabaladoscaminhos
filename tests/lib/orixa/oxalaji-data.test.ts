import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oxalaji-data';

describe('orixa/oxalaji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
