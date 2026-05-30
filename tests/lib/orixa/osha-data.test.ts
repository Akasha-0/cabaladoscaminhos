import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/osha-data';

describe('orixa/osha-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
