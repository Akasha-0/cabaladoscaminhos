import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/divine/divine-data';

describe('divine/divine-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
