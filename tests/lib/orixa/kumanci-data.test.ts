import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/kumanci-data';

describe('orixa/kumanci-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
