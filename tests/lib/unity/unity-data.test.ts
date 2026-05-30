import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/unity/unity-data';

describe('unity/unity-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
