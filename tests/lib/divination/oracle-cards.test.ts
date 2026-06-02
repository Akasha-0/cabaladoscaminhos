import { describe, it, expect } from 'vitest';
import {
  LENORMAND_CARDS,
  getLenormandCardById,
  type LenormandCard,
} from '@/lib/constants/lenormand-cards';

/** Number-based ID used in canonical source */
function cardId(n: number): number {
  return n;
}

/** Random card helper (mirrors the old getRandomOracleCard intent) */
function getRandomLenormandCard(): LenormandCard {
  return LENORMAND_CARDS[Math.floor(Math.random() * LENORMAND_CARDS.length)];
}

describe('lenormand-cards (canonical)', () => {
  describe('LENORMAND_CARDS constant', () => {
    it('returns an array of 36 cards', () => {
      expect(Array.isArray(LENORMAND_CARDS)).toBe(true);
      expect(LENORMAND_CARDS.length).toBe(36);
    });

    it('cards have required properties (id, name, keywords, baseMeaning, shadow)', () => {
      const card = LENORMAND_CARDS[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('keywords');
      expect(card).toHaveProperty('baseMeaning');
      expect(card).toHaveProperty('shadow');
    });

    it('card ids are unique (1..36)', () => {
      const ids = LENORMAND_CARDS.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(36);
    });

    it('ids are sequential 1..36', () => {
      const ids = LENORMAND_CARDS.map((c) => c.id);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]);
    });
  });

  describe('getLenormandCardById', () => {
    it('returns a card for valid id', () => {
      const card = getLenormandCardById(1);
      expect(card).toBeDefined();
      expect(card?.id).toBe(1);
    });

    it('returns undefined for invalid id', () => {
      expect(getLenormandCardById(0)).toBeUndefined();
      expect(getLenormandCardById(-1)).toBeUndefined();
      expect(getLenormandCardById(37)).toBeUndefined();
    });

    it('returns undefined for null/undefined-equivalent out-of-range ids', () => {
      expect(getLenormandCardById(999)).toBeUndefined();
      expect(getLenormandCardById(-999)).toBeUndefined();
    });

    it('can retrieve all 36 cards by id', () => {
      for (let i = 1; i <= 36; i++) {
        const found = getLenormandCardById(i);
        expect(found).toBeDefined();
        expect(found?.id).toBe(i);
      }
    });
  });

  describe('getRandomLenormandCard', () => {
    it('returns a LenormandCard', () => {
      const card = getRandomLenormandCard();
      expect(card).toBeDefined();
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
    });

    it('returns a card from the deck', () => {
      const card = getRandomLenormandCard();
      const found = LENORMAND_CARDS.find((c) => c.id === card.id);
      expect(found).toBeDefined();
    });

    it('can return different cards across multiple calls', () => {
      const results = new Set<number>();
      for (let i = 0; i < 50; i++) {
        const card = getRandomLenormandCard();
        results.add(card.id);
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });
});
