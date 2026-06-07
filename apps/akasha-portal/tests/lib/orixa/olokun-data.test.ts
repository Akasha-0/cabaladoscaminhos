import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/olokun-data';

describe('orixa/olokun-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
