import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/energy/energy-data';

describe('energy/energy-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
