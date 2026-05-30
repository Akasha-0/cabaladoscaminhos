import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/frequency/frequency-data';

describe('frequency/frequency-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
