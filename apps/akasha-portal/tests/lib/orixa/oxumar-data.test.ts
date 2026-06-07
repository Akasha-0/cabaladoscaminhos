import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oxumar-data';

describe('orixa/oxumar-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
