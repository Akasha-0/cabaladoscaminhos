import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oxalufi-data';

describe('orixa/oxalufi-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
