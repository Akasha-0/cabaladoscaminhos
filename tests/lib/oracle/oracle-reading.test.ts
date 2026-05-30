import { describe, it, expect } from 'vitest';
import { getSpreads, getSpreadByName, performReading } from '@/lib/oracle/oracle-reading';

describe('oracle/oracle-reading', () => {
  describe('getSpreads', () => {
    it('returns available spreads', () => {
      const spreads = getSpreads();
      expect(spreads.length).toBeGreaterThan(0);
    });

    it('each spread has required fields', () => {
      for (const spread of getSpreads()) {
        expect(spread.name).toBeTruthy();
        expect(typeof spread.count).toBe('number');
        expect(spread.description).toBeTruthy();
      }
    });
  });

  describe('getSpreadByName', () => {
    it('finds spread by name', () => {
      const spreads = getSpreads();
      if (spreads.length > 0) {
        const found = getSpreadByName(spreads[0].name);
        expect(found).toBeDefined();
      }
    });

    it('returns undefined for unknown spread', () => {
      expect(getSpreadByName('unknown-spread')).toBeUndefined();
    });
  });

  describe('performReading', () => {
    it('performs a reading', () => {
      const reading = performReading();
      expect(reading.cards).toBeDefined();
      expect(reading.cards.length).toBeGreaterThan(0);
    });

    it('includes affirmation in reading', () => {
      const reading = performReading();
      expect(reading.affirmation).toBeTruthy();
    });

    it('includes interpretation in reading', () => {
      const reading = performReading();
      expect(reading.interpretation).toBeTruthy();
    });

    it('returns cards with id and name', () => {
      const reading = performReading();
      for (const card of reading.cards) {
        expect(card.id).toBeTruthy();
        expect(card.name).toBeTruthy();
      }
    });
  });
});
