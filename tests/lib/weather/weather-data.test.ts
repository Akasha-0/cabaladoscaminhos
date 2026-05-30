import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/weather/weather-data';

describe('weather/weather-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
