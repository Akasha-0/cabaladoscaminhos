import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/kundalini/kundalini-data';

describe('kundalini/kundalini-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
