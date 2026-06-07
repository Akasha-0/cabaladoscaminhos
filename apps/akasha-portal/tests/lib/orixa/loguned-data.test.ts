import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/loguned-data';

describe('orixa/loguned-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
