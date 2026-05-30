import { describe, it, expect } from 'vitest';
import { getHerbData } from '@/lib/herb/herb-data';

describe('herb/herb-data', () => {
  it('returns data', () => {
    expect(getHerbData().length).toBeGreaterThan(0);
  });
});
