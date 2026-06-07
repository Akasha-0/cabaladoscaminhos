import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/alaketu-data';

describe('orixa/alaketu-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
