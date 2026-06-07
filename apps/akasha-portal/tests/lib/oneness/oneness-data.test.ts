import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/oneness/oneness-data';

describe('oneness/oneness-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
