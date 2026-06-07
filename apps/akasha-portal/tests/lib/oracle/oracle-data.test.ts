import { describe, it, expect, beforeAll } from 'vitest';
import {
  getData,
  getOracleDataById,
  getOracleDataByElement,
  getOracleDataByOrixa,
  getOracleDataBySephirah,
  getRandomOracleData,
  getOracleDataCount,
  type OracleData,
} from '@/lib/oracle/oracle-data';

describe('oracle-data module', () => {
  describe('getData', () => {
    it('should return an array of oracle data', () => {
      const data = getData();
      expect(Array.isArray(data)).toBe(true);
 });

    it('should return all oracle cards', () => {
      const data = getData();
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return oracle cards with required properties', () => {
      const data = getData();
      const card = data[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('meaning');
      expect(card).toHaveProperty('element');
      expect(card).toHaveProperty('affirmation');
      expect(card).toHaveProperty('message');
      expect(card).toHaveProperty('keywords');
    });

    it('should return consistent data on multiple calls', () => {
      const data1 = getData();
      const data2 = getData();
      expect(data1).toEqual(data2);
    });
  });

  describe('getOracleDataById', () => {
    it('should return oracle data for valid id', () => {
      const card = getOracleDataById('oracle-001');
      expect(card).toBeDefined();
      expect(card?.id).toBe('oracle-001');
    });

    it('should return undefined for non-existent id', () => {
      const card = getOracleDataById('non-existent-id');
      expect(card).toBeUndefined();
    });

    it('should return oracle card with all properties', () => {
      const card = getOracleDataById('oracle-001');
      expect(card).toHaveProperty('id', 'oracle-001');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('nameEn');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('meaning');
      expect(card).toHaveProperty('element');
      expect(card).toHaveProperty('sephirah');
      expect(card).toHaveProperty('affirmation');
      expect(card).toHaveProperty('message');
      expect(card).toHaveProperty('keywords');
    });

    it('should return oracle card with optional orixa property', () => {
      const card = getOracleDataById('oracle-003');
      expect(card).toBeDefined();
      expect(card?.orixa).toBe('Omolu');
    });
  });

  describe('getOracleDataByElement', () => {
    it('should return oracle cards matching the element', () => {
      const cards = getOracleDataByElement('Fogo');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
      cards.forEach((card) => {
        expect(card.element.toLowerCase()).toBe('fogo');
      });
    });

    it('should be case insensitive', () => {
      const upperCase = getOracleDataByElement('FOGO');
      const lowerCase = getOracleDataByElement('fogo');
      const mixedCase = getOracleDataByElement('FoGo');
      expect(upperCase).toEqual(lowerCase);
      expect(lowerCase).toEqual(mixedCase);
    });

    it('should return empty array for non-existent element', () => {
      const cards = getOracleDataByElement('NonExistentElement');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(0);
    });

    it('should return oracle cards with Éter element', () => {
      const cards = getOracleDataByElement('Éter');
      expect(Array.isArray(cards)).toBe(true);
      cards.forEach((card) => {
        expect(card.element.toLowerCase()).toBe('éter');
      });
    });
  });

  describe('getOracleDataByOrixa', () => {
    it('should return oracle cards matching the orixá', () => {
      const cards = getOracleDataByOrixa('Omolu');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
      cards.forEach((card) => {
        expect(card.orixa?.toLowerCase()).toBe('omolu');
      });
    });

    it('should be case insensitive', () => {
      const upperCase = getOracleDataByOrixa('OMOLU');
      const lowerCase = getOracleDataByOrixa('omolu');
      expect(upperCase).toEqual(lowerCase);
    });

    it('should return empty array for non-existent orixá', () => {
      const cards = getOracleDataByOrixa('NonExistentOrixa');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(0);
    });

    it('should return oracle cards with Oxóssi orixá', () => {
      const cards = getOracleDataByOrixa('Oxóssi');
      expect(Array.isArray(cards)).toBe(true);
      cards.forEach((card) => {
        expect(card.orixa?.toLowerCase()).toBe('oxóssi');
      });
    });
  });

  describe('getOracleDataBySephirah', () => {
    it('should return oracle cards matching the sephirah', () => {
      const cards = getOracleDataBySephirah('Kether');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
      cards.forEach((card) => {
        expect(card.sephirah?.toLowerCase()).toBe('kether');
      });
    });

    it('should be case insensitive', () => {
      const upperCase = getOracleDataBySephirah('KETHER');
      const lowerCase = getOracleDataBySephirah('kether');
      expect(upperCase).toEqual(lowerCase);
    });

    it('should return empty array for non-existent sephirah', () => {
      const cards = getOracleDataBySephirah('NonExistentSephirah');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(0);
    });

    it('should return oracle cards with Malkuth sephirah', () => {
      const cards = getOracleDataBySephirah('Malkuth');
      expect(Array.isArray(cards)).toBe(true);
      cards.forEach((card) => {
        expect(card.sephirah?.toLowerCase()).toBe('malkuth');
      });
    });
  });

  describe('getRandomOracleData', () => {
    it('should return a valid oracle data object', () => {
      const card = getRandomOracleData();
      expect(card).toBeDefined();
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('meaning');
      expect(card).toHaveProperty('element');
      expect(card).toHaveProperty('affirmation');
      expect(card).toHaveProperty('message');
      expect(card).toHaveProperty('keywords');
    });

    it('should return a card from the oracle deck', () => {
      const card = getRandomOracleData();
      const allData = getData();
      const found = allData.some((c) => c.id === card.id);
      expect(found).toBe(true);
    });

    it('should return different cards on multiple calls (statistical)', () => {
      const results = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const card = getRandomOracleData();
        results.add(card.id);
      }
      // With36 cards and50 draws, probability of single card is very low
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('getOracleDataCount', () => {
    it('should return the correct count of oracle cards', () => {
      const count = getOracleDataCount();
      const data = getData();
      expect(count).toBe(data.length);
    });

    it('should return a positive number', () => {
      const count = getOracleDataCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should return36 for the complete oracle deck', () => {
      const count = getOracleDataCount();
      expect(count).toBe(36);
    });
  });
});
