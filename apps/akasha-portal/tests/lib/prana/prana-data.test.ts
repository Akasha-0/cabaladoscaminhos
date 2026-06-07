import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/prana/prana-data';

describe('prana/prana-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
