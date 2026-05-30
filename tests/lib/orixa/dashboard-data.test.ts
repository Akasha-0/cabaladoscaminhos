import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/dashboard-data';

describe('orixa/dashboard-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
