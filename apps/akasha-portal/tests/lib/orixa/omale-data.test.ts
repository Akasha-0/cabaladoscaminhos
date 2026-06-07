import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/omale-data';

describe('orixa/omale-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
