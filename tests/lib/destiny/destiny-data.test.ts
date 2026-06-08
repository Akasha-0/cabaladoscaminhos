import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/destiny/destiny-data';

describe('destiny/destiny-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
