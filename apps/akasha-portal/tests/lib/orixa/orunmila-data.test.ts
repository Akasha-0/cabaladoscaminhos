import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/orunmila-data';

describe('orixa/orunmila-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
