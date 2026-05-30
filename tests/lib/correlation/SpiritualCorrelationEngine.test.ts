import { describe, it, expect } from 'vitest';
import { getTodayCorrelation, getCorrelationByDay, getWeekCorrelations } from '@/lib/correlation/SpiritualCorrelationEngine';

describe('correlation/SpiritualCorrelationEngine', () => {
  describe('getWeekCorrelations', () => {
    it('returns 7 days', () => {
      const week = getWeekCorrelations();
      expect(week.length).toBe(7);
    });

    it('each day has required fields', () => {
      for (const day of getWeekCorrelations()) {
        expect(day.dayName).toBeTruthy();
        expect(day.dayNamePt).toBeTruthy();
        expect(day.orixa).toBeTruthy();
        expect(day.chakra).toBeTruthy();
        expect(day.planet).toBeTruthy();
        expect(day.sefirah).toBeTruthy();
        expect(day.element).toBeTruthy();
        expect(day.elementEmoji).toBeTruthy();
        expect(day.primaryColor).toBeTruthy();
        expect(day.secondaryColor).toBeTruthy();
        expect(day.mystery).toBeTruthy();
      }
    });

    it('days are unique', () => {
      const week = getWeekCorrelations();
      const names = week.map(d => d.dayName);
      const unique = names.filter((n, i) => names.indexOf(n) === i);
      expect(unique.length).toBe(7);
    });
  });

  describe('getCorrelationByDay', () => {
    it('finds segunda-feira', () => {
      const c = getCorrelationByDay('segunda');
      expect(c).toBeDefined();
      expect(c?.dayName).toBeTruthy();
    });

    it('finds domingo', () => {
      const c = getCorrelationByDay('domingo');
      expect(c).toBeDefined();
    });

    it('returns null for unknown day', () => {
      expect(getCorrelationByDay('xyzday')).toBeNull();
    });
  });

  describe('getTodayCorrelation', () => {
    it('returns a valid correlation', () => {
      const today = getTodayCorrelation();
      expect(today.dayName).toBeTruthy();
      expect(today.orixa).toBeTruthy();
    });
  });

  describe('correlation integrity', () => {
    it('each day has valid chakra name', () => {
      for (const day of getWeekCorrelations()) {
        expect(day.chakra.length).toBeGreaterThan(0);
      }
    });

    it('each day has valid orixa name', () => {
      for (const day of getWeekCorrelations()) {
        expect(day.orixa.length).toBeGreaterThan(0);
      }
    });

    it('each day has valid sefirah name', () => {
      for (const day of getWeekCorrelations()) {
        expect(day.sefirah.length).toBeGreaterThan(0);
      }
    });
  });
});
