import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/profecia-data';

describe('orixa/profecia-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
