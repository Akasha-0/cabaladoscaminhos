import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/lokoci-data';

describe('orixa/lokoci-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
