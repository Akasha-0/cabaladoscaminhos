import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/aura/aura-data';

describe('aura/aura-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
