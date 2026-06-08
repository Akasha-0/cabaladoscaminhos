import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/vibration/vibration-data';

describe('vibration/vibration-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
