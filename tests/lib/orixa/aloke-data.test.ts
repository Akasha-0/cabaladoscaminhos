import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/aloke-data';

describe('orixa/aloke-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
