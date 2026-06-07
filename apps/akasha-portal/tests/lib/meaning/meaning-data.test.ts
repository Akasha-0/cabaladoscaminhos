import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/meaning/meaning-data';

describe('meaning/meaning-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
