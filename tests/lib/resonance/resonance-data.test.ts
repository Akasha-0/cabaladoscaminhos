import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/resonance/resonance-data';

describe('resonance/resonance-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
