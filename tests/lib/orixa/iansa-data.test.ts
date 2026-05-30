import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/iansa-data';

describe('orixa/iansa-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
