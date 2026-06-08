import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/ayurveda/ayurveda-data';

describe('ayurveda/ayurveda-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
