import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/zezinho-data';

describe('orixa/zezinho-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
