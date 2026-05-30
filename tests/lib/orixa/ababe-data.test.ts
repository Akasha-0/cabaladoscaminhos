import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ababe-data';

describe('orixa/ababe-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
