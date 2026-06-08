import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/integration/integration-data';

describe('integration/integration-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
