import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/movement/movement-data';

describe('movement/movement-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
