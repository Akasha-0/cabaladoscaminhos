import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/channel/channel-data';

describe('channel/channel-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
