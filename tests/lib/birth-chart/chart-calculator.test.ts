import { describe, it, expect } from 'vitest';
import { calculate, getPlanetPositions, getDominantElement, getDominantPlanet } from '@/lib/birth-chart/chart-calculator';

describe('chart-calculator', () => {
  it('should calculate birth chart', () => {
    const chart = calculate(
      new Date('1990-06-15'),
      '10:30',
      -23.5505,
      -46.6333
    );
    expect(chart).toBeDefined();
    expect(chart.planeta).toBeDefined();
  });

  it('should get planet positions', () => {
    const chart = calculate(new Date('1990-06-15'), '10:30', -23.5505, -46.6333);
    const positions = getPlanetPositions(chart);
    expect(Array.isArray(positions)).toBe(true);
    expect(positions.length).toBeGreaterThan(0);
  });

  it('should get dominant element', () => {
    const chart = calculate(new Date('1990-06-15'), '10:30', -23.5505, -46.6333);
    const dominant = getDominantElement(chart);
    expect(dominant).toBeDefined();
    expect(dominant.elemento).toBeDefined();
  });
});
