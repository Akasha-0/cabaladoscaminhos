import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/meridian/meridian-data';

describe('meridian/meridian-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
