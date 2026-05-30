import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/kereci-data';

describe('orixa/kereci-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
