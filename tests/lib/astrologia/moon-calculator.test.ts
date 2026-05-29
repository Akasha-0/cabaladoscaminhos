import { describe, it, expect } from 'vitest';
import {
  getMoonAge,
  getMoonPhaseInfo,
  getNextPhases,
  getUpcoming7Days,
  isCurrentlyVoidOfCourse,
  getNextVoidOfCourse,
  getBestRitualTime,
} from '@/lib/astrologia/moon-calculator';

describe('Moon Calculator', () => {
  it('calculates moon age for known dates', () => {
    // Reference: known new moon at Jan 6, 2000 18:14 UTC
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const age1 = getMoonAge(knownNewMoon);
    expect(age1).toBeLessThan(0.1);

    // Full moon is approximately 14.77 days after new moon
    const fullMoonDate = new Date(Date.UTC(2000, 0, 21, 4, 0, 0));
    const age2 = getMoonAge(fullMoonDate);
    expect(age2).toBeGreaterThan(14);
    expect(age2).toBeLessThan(15);
  });

  it('returns valid moon phase info', () => {
    const today = new Date();
    const info = getMoonPhaseInfo(today);

    expect(info).toHaveProperty('phase');
    expect(info).toHaveProperty('name');
    expect(info).toHaveProperty('emoji');
    expect(info).toHaveProperty('illumination');
    expect(info).toHaveProperty('daysIntoPhase');
    expect(info).toHaveProperty('daysUntilNextPhase');
    expect(info).toHaveProperty('isWaxing');
    expect(info.illumination).toBeGreaterThanOrEqual(0);
    expect(info.illumination).toBeLessThanOrEqual(100);
  });

  it('phases cycle correctly', () => {
    const phases = getNextPhases(new Date(), 4);
    expect(phases.length).toBe(4);
  });

  it('provides 7 days of upcoming phases', () => {
    const upcoming = getUpcoming7Days(new Date());
    expect(upcoming.length).toBe(7);
  });

  it('void-of-course functions return expected types', () => {
    const today = new Date();
    const isVoid = isCurrentlyVoidOfCourse(today);
    expect(typeof isVoid).toBe('boolean');

    const nextVoid = getNextVoidOfCourse(today);
    expect(nextVoid === null || nextVoid instanceof Date).toBe(true);
  });

  it('best ritual time returns valid structure', () => {
    const today = new Date();
    const bestTime = getBestRitualTime(today);

    expect(bestTime).toHaveProperty('start');
    expect(bestTime).toHaveProperty('end');
    expect(bestTime).toHaveProperty('quality');
    expect(bestTime.start).toBeInstanceOf(Date);
    expect(bestTime.end).toBeInstanceOf(Date);
    expect(['optimal', 'good', 'avoid']).toContain(bestTime.quality);
  });
});
