import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/evolution/evolution-data';

describe('evolution/evolution-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
