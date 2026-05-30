import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/odu-data';

describe('orixa/odu-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
