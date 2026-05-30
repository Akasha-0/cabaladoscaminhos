import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/bhakti/bhakti-data';

describe('bhakti/bhakti-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
