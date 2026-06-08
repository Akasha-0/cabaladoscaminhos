import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/jnana/jnana-data';

describe('jnana/jnana-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
