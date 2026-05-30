import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/dharma/dharma-data';

describe('dharma/dharma-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
