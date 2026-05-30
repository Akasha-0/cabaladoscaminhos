import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/marma/marma-data';

describe('marma/marma-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
