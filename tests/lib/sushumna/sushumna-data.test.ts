import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/sushumna/sushumna-data';

describe('sushumna/sushumna-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
