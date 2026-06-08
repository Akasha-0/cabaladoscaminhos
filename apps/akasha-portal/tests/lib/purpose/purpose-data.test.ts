import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/purpose/purpose-data';

describe('purpose/purpose-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
