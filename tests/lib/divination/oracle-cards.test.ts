import { describe, it, expect } from 'vitest';
import {
  getOracleCards,
  getAllOracleCards,
  getOracleCardById,
  getRandomOracleCard,
  getOracleCardsByTheme,
  type OracleCard,
  type OracleDeck,
} from '@/lib/divination/oracle-cards';

describe('oracle-cards', () => {
  describe('getOracleCards', () => {
    it('returns an OracleDeck object', () => {
      const deck = getOracleCards();
      expect(deck).toBeDefined();
      expect(typeof deck).toBe('object');
    });

    it('deck has cards array', () => {
      const deck = getOracleCards();
      expect(deck).toHaveProperty('cards');
      expect(Array.isArray(deck.cards)).toBe(true);
    });

    it('deck contains 36 cards', () => {
      const deck = getOracleCards();
      expect(deck.cards.length).toBe(36);
    });
  });

  describe('getAllOracleCards', () => {
    it('returns an array', () => {
      const cards = getAllOracleCards();
      expect(Array.isArray(cards)).toBe(true);
    });

    it('returns 36 cards', () => {
      const cards = getAllOracleCards();
      expect(cards.length).toBe(36);
    });

    it('cards have required properties', () => {
      const cards = getAllOracleCards();
      const card = cards[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('message');
      expect(card).toHaveProperty('affirmation');
      expect(card).toHaveProperty('theme');
    });

    it('card ids are unique', () => {
      const cards = getAllOracleCards();
      const ids = cards.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('matches getOracleCards().cards', () => {
      const cards = getAllOracleCards();
      const deck = getOracleCards();
      expect(cards).toEqual(deck.cards);
    });
  });

  describe('getOracleCardById', () => {
    it('returns a card for valid id', () => {
      const card = getOracleCardById('oracle-001');
      expect(card).toBeDefined();
      expect(card?.id).toBe('oracle-001');
    });

    it('returns undefined for invalid id', () => {
      const card = getOracleCardById('invalid-id');
      expect(card).toBeUndefined();
    });

    it('returns undefined for null/undefined', () => {
      expect(getOracleCardById('')).toBeUndefined();
      expect(getOracleCardById('oracle-000')).toBeUndefined();
      expect(getOracleCardById('oracle-999')).toBeUndefined();
    });

    it('can retrieve all 36 cards by id', () => {
      const cards = getAllOracleCards();
      for (const card of cards) {
        const found = getOracleCardById(card.id);
        expect(found).toEqual(card);
      }
    });
  });

  describe('getRandomOracleCard', () => {
    it('returns an OracleCard', () => {
      const card = getRandomOracleCard();
      expect(card).toBeDefined();
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
    });

    it('returns a card from the deck', () => {
      const card = getRandomOracleCard();
      const cards = getAllOracleCards();
      const found = cards.find(c => c.id === card.id);
      expect(found).toBeDefined();
    });

    it('can return different cards across multiple calls', () => {
      const cards = getAllOracleCards();
      if (cards.length > 1) {
        const results = new Set<string>();
        for (let i = 0; i < 50; i++) {
          const card = getRandomOracleCard();
          results.add(card.id);
        }
        expect(results.size).toBeGreaterThan(1);
      }
    });
  });

  describe('getOracleCardsByTheme', () => {
    it('returns an array', () => {
      const result = getOracleCardsByTheme('renewal');
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns cards for existing theme', () => {
      const cards = getOracleCardsByTheme('renewal');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0].theme).toBe('renewal');
    });

    it('returns empty array for non-existent theme', () => {
      const cards = getOracleCardsByTheme('non-existent-theme');
      expect(cards).toEqual([]);
    });

    it('returns empty array for empty string theme', () => {
      const cards = getOracleCardsByTheme('');
      expect(cards).toEqual([]);
    });

    it('all returned cards match the theme', () => {
      const allThemes = ['renewal', 'shadow-work', 'ancestry', 'intuition', 'grounding'];
      for (const theme of allThemes) {
        const cards = getOracleCardsByTheme(theme);
        for (const card of cards) {
          expect(card.theme).toBe(theme);
        }
      }
    });
  });
});
