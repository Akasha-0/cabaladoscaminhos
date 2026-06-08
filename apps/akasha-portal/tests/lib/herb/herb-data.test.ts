import { describe, it, expect } from 'vitest';
import herbs from '@/lib/herb/herb-data';
describe('herb/herb-data', () => {
  it('has herb data', () => {
    expect(herbs).toBeDefined();
  });
});
