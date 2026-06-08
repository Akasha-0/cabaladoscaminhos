import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/cosmic/cosmic-data';

describe('cosmic/cosmic-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
