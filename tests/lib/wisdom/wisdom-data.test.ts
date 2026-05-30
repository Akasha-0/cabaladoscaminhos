import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/wisdom/wisdom-data';

describe('wisdom/wisdom-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
