import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/damiao-data';

describe('orixa/damiao-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
