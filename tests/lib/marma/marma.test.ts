import { describe, it, expect } from 'vitest';
import { getData, getMarmaById, getMarmasByRegion } from '~/lib/marma/marma-data';
import { startPractice, completePractice, getMarmaPoints } from '~/lib/marma/marma-practice';

describe('marma', () => {
  it('getData returns array of marma points', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('getMarmaById finds marma point', () => {
    const marma = getMarmaById('hridaya');
    expect(marma).toBeDefined();
    expect(marma?.id).toBe('hridaya');
  });

  it('getMarmasByRegion filters correctly', () => {
    const data = getData();
    if (data.length > 0) {
      const region = data[0].region;
      const filtered = getMarmasByRegion(region);
      expect(Array.isArray(filtered)).toBe(true);
    }
  });

  it('startPractice creates session', () => {
    const session = startPractice(['hridaya']);
    expect(session).toHaveProperty('id');
    expect(session).toHaveProperty('startTime');
    expect(session.pointsTargeted).toContain('hridaya');
  });

  it('getMarmaPoints returns array', () => {
    const points = getMarmaPoints();
    expect(Array.isArray(points)).toBe(true);
    expect(points.length).toBeGreaterThan(0);
  });
});