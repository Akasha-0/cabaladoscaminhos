import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/olofin-data';

describe('orixa/olofin-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
