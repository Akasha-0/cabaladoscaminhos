import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/panchakarma/panchakarma-data';

describe('panchakarma/panchakarma-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
