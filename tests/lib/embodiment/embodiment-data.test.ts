import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/embodiment/embodiment-data';

describe('embodiment/embodiment-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
