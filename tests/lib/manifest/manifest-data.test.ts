import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/manifest/manifest-data';

describe('manifest/manifest-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
