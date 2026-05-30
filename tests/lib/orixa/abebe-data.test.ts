import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/abebe-data';

describe('orixa/abebe-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
