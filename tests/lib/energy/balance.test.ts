import { describe, it, expect, beforeEach } from 'vitest';
import { calculateBalance, EnergyTracker, type EnergyBalance, type EnergyReading } from '@/lib/energy/balance';

describe('calculateBalance', () => {
  it('returns dormant distribution for empty input', () => {
    const result = calculateBalance({});
    
    expect(result.total).toBe(0);
    expect(result.average).toBe(0);
    expect(result.distribution).toBe('dormant');
    expect(result.dominantEnergy).toBe(null);
    expect(result.weakestEnergy).toBe(null);
    expect(result.recommendation).toContain('low across all areas');
  });

  it('returns harmonious distribution when energy is balanced', () => {
    const energy = { physical: 50, emotional: 50, mental: 50, spiritual: 50 };
    const result = calculateBalance(energy);
    
    expect(result.total).toBe(200);
    expect(result.average).toBe(50);
    expect(result.distribution).toBe('harmonious');
    expect(result.dominantEnergy).toBe('physical');
    expect(result.weakestEnergy).toBe('physical');
    expect(result.recommendation).toContain('well-balanced');
  });

  it('returns focused distribution when one energy is dominant', () => {
    const energy = { physical: 80, emotional: 10, mental: 10, spiritual: 10 };
    const result = calculateBalance(energy);
    expect(result.distribution).toBe('focused');
    expect(result.dominantEnergy).toBe('physical');
    expect(result.weakestEnergy).toBe('emotional');
    expect(result.recommendation).toContain('dominant');
  });

  it('returns scattered distribution when multiple energies are active', () => {
    const energy = { physical: 80, emotional: 60, mental: 70, spiritual: 30 };
    const result = calculateBalance(energy);
    
    expect(result.distribution).toBe('scattered');
    expect(result.dominantEnergy).toBe('physical');
    expect(result.weakestEnergy).toBe('spiritual');
    expect(result.recommendation).toContain('scattered');
  });

  it('handles partial energy input', () => {
    const energy = { physical: 40 };
    const result = calculateBalance(energy);
    
    expect(result.total).toBe(40);
    expect(result.average).toBe(10);
    expect(result.dominantEnergy).toBe('physical');
    expect(result.weakestEnergy).toBe('physical');
  });

  it('returns null dominant when all energies are zero', () => {
    const result = calculateBalance({ physical: 0, emotional: 0, mental: 0, spiritual: 0 });
    
    expect(result.dominantEnergy).toBe(null);
    expect(result.weakestEnergy).toBe(null);
  });

  it('rounds total and average to two decimal places', () => {
    const energy = { physical: 33.333, emotional: 33.333, mental: 33.333, spiritual: 33.333 };
    const result = calculateBalance(energy);
    
    expect(result.total).toBe(133.33);
    expect(result.average).toBe(33.33);
  });

  it('returns dormant distribution for low mean values', () => {
    const energy = { physical: 10, emotional: 10, mental: 10, spiritual: 10 };
    const result = calculateBalance(energy);
    
    expect(result.distribution).toBe('dormant');
    expect(result.recommendation).toContain('low across all areas');
  });

  it('handles asymmetric but valid energy distribution', () => {
    const energy = { physical: 100, emotional: 30, mental: 50, spiritual: 20 };
    const result = calculateBalance(energy);
    
    expect(result.distribution).toBe('scattered');
    expect(result.dominantEnergy).toBe('physical');
  });
});

describe('EnergyTracker', () => {
  let tracker: EnergyTracker;

  beforeEach(() => {
    tracker = new EnergyTracker();
  });

  describe('addReading', () => {
    it('adds a reading with provided timestamp', () => {
      const reading: EnergyReading = { timestamp: 1000, physical: 50, emotional: 50 };
      tracker.addReading(reading);
      
      const readings = tracker.getReadings();
      expect(readings).toHaveLength(1);
      expect(readings[0].timestamp).toBe(1000);
    });

    it('adds a reading with current timestamp when not provided', () => {
      const before = Date.now();
      tracker.addReading({ physical: 50 });
      const after = Date.now();
      
      const readings = tracker.getReadings();
      expect(readings[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(readings[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('getReadings', () => {
    it('returns empty array when no readings exist', () => {
      expect(tracker.getReadings()).toEqual([]);
    });

    it('returns all readings when no limit specified', () => {
      tracker.addReading({ timestamp: 1, physical: 10 });
      tracker.addReading({ timestamp: 2, physical: 20 });
      tracker.addReading({ timestamp: 3, physical: 30 });
      
      const readings = tracker.getReadings();
      expect(readings).toHaveLength(3);
    });

    it('returns limited number of readings from the end', () => {
      tracker.addReading({ timestamp: 1, physical: 10 });
      tracker.addReading({ timestamp: 2, physical: 20 });
      tracker.addReading({ timestamp: 3, physical: 30 });
      
      const readings = tracker.getReadings(2);
      expect(readings).toHaveLength(2);
      expect(readings[0].timestamp).toBe(2);
      expect(readings[1].timestamp).toBe(3);
    });

    it('returns copy of readings array', () => {
      tracker.addReading({ physical: 10 });
      
      const readings1 = tracker.getReadings();
      readings1.push({ timestamp: 999, physical: 999 });
      
      const readings2 = tracker.getReadings();
      expect(readings2).toHaveLength(1);
    });
  });

  describe('getLatest', () => {
    it('returns null when no readings exist', () => {
      expect(tracker.getLatest()).toBe(null);
    });

    it('returns the most recent reading', () => {
      tracker.addReading({ timestamp: 1, physical: 10 });
      tracker.addReading({ timestamp: 2, physical: 20 });
      
      const latest = tracker.getLatest();
      expect(latest?.timestamp).toBe(2);
    });
  });

  describe('clear', () => {
    it('removes all readings', () => {
      tracker.addReading({ physical: 10 });
      tracker.addReading({ physical: 20 });
      
      tracker.clear();
      
      expect(tracker.getReadings()).toHaveLength(0);
      expect(tracker.getLatest()).toBe(null);
    });
  });

  describe('analyze', () => {
    it('returns dormant result for empty tracker', () => {
      const result = tracker.analyze();
      
      expect(result.distribution).toBe('dormant');
      expect(result.total).toBe(0);
    });

    it('analyzes latest reading by default', () => {
      tracker.addReading({ physical: 80, emotional: 10, mental: 10, spiritual: 10 });
      const result = tracker.analyze();
      expect(result.distribution).toBe('focused');
      expect(result.dominantEnergy).toBe('physical');
    });
    it('analyzes limited readings from the end', () => {
      tracker.addReading({ timestamp: 1, physical: 30, emotional: 30, mental: 30, spiritual: 30 });
      tracker.addReading({ timestamp: 2, physical: 80, emotional: 10, mental: 10, spiritual: 10 });
      const result = tracker.analyze(1);
      expect(result.distribution).toBe('focused');
      expect(result.dominantEnergy).toBe('physical');
    });
  });

  describe('getAverage', () => {
    it('returns default energy when no readings exist', () => {
      const avg = tracker.getAverage();
      
      expect(avg.physical).toBe(0);
      expect(avg.emotional).toBe(0);
      expect(avg.mental).toBe(0);
      expect(avg.spiritual).toBe(0);
    });

    it('calculates average across all readings', () => {
      tracker.addReading({ physical: 40, emotional: 20 });
      tracker.addReading({ physical: 60, emotional: 40 });
      
      const avg = tracker.getAverage();
      
      expect(avg.physical).toBe(50);
      expect(avg.emotional).toBe(30);
    });

    it('calculates average with limit', () => {
      tracker.addReading({ physical: 20 });
      tracker.addReading({ physical: 40 });
      tracker.addReading({ physical: 60 });
      
      const avg = tracker.getAverage(2);
      
      expect(avg.physical).toBe(50);
    });
    it('ignores undefined values in average calculation', () => {
      tracker.addReading({ physical: 50 });
      tracker.addReading({ physical: 100, emotional: 50 });
      const avg = tracker.getAverage();
      // Divides by total readings (2), not by count of defined values
      expect(avg.physical).toBe(75); // (50 + 100) / 2
      expect(avg.emotional).toBe(25); // (0 + 50) / 2
      expect(avg.mental).toBe(0);
    });
  });
});