import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/elements/element-data';

describe('elements/element-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
