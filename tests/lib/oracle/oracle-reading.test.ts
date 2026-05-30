import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSpreads,
  getSpreadByName,
  performReading,
  type OracleReading,
  type ReadingSpread,
} from '@/lib/oracle/oracle-reading';
import { getAllOracleCards } from '@/lib/divination/oracle-cards';

describe('oracle-reading', () => {
  // Mock crypto.randomUUID for consistent IDs
  beforeEach(() => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-1234');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSpreads', () => {
    it('returns an array of reading spreads', () => {
      const spreads = getSpreads();
      expect(Array.isArray(spreads)).toBe(true);
      expect(spreads.length).toBeGreaterThan(0);
    });

    it('each spread has name, count, and description', () => {
      const spreads = getSpreads();
      for (const spread of spreads) {
        expect(spread).toHaveProperty('name');
        expect(spread).toHaveProperty('count');
        expect(spread).toHaveProperty('description');
        expect(typeof spread.name).toBe('string');
        expect(typeof spread.count).toBe('number');
        expect(typeof spread.description).toBe('string');
      }
    });

    it('returns expected spread names', () => {
      const spreads = getSpreads();
      const names = spreads.map(s => s.name);
      expect(names).toContain('single');
      expect(names).toContain('past-present-future');
      expect(names).toContain('guidance');
      expect(names).toContain('cross');
      expect(names).toContain('five-elements');
    });
  });

  describe('getSpreadByName', () => {
    it('returns spread for valid name', () => {
      const spread = getSpreadByName('single');
      expect(spread).toBeDefined();
      expect(spread?.name).toBe('single');
    });

    it('returns undefined for invalid name', () => {
      const spread = getSpreadByName('nonexistent-spread');
      expect(spread).toBeUndefined();
    });

    it('returns past-present-future spread with count 3', () => {
      const spread = getSpreadByName('past-present-future');
      expect(spread).toBeDefined();
      expect(spread?.count).toBe(3);
      expect(spread?.description).toBe('Three cards revealing your journey through time');
    });

    it('returns guidance spread with count 3', () => {
      const spread = getSpreadByName('guidance');
      expect(spread).toBeDefined();
      expect(spread?.count).toBe(3);
      expect(spread?.description).toBe('Guidance for mind, heart, and spirit');
    });

    it('returns cross spread with count 4', () => {
      const spread = getSpreadByName('cross');
      expect(spread).toBeDefined();
      expect(spread?.count).toBe(4);
      expect(spread?.description).toBe('A cross spread for deeper insight');
    });

    it('returns five-elements spread with count 5', () => {
      const spread = getSpreadByName('five-elements');
      expect(spread).toBeDefined();
      expect(spread?.count).toBe(5);
      expect(spread?.description).toBe('Balance through the elements');
    });
  });

  describe('performReading', () => {
    it('returns an OracleReading object', () => {
      const reading = performReading();
      expect(reading).toHaveProperty('id');
      expect(reading).toHaveProperty('cards');
      expect(reading).toHaveProperty('date');
      expect(reading).toHaveProperty('interpretation');
      expect(reading).toHaveProperty('affirmation');
    });

    it('returns consistent UUID when mocked', () => {
      const reading = performReading();
      expect(reading.id).toBe('test-uuid-1234');
    });

    it('returns ISO date string', () => {
      const reading = performReading();
      expect(typeof reading.date).toBe('string');
      expect(reading.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    describe('single card spread (default)', () => {
      it('returns exactly 1 card by default', () => {
        const reading = performReading();
        expect(reading.cards).toHaveLength(1);
      });

      it('can accept explicit spreadName', () => {
        const reading = performReading('single');
        expect(reading.cards).toHaveLength(1);
      });

      it('returns card with required properties', () => {
        const reading = performReading('single');
        const card = reading.cards[0];
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('theme');
        expect(card).toHaveProperty('message');
        expect(card).toHaveProperty('affirmation');
      });

      it('interpretation is the card message', () => {
        const reading = performReading('single');
        expect(reading.interpretation).toBe(reading.cards[0].message);
      });

      it('affirmation is the card affirmation', () => {
        const reading = performReading('single');
        expect(reading.affirmation).toBe(reading.cards[0].affirmation);
      });
    });

    describe('past-present-future spread', () => {
      it('returns exactly 3 cards', () => {
        const reading = performReading('past-present-future');
        expect(reading.cards).toHaveLength(3);
      });

      it('cards are unique (no duplicates)', () => {
        const reading = performReading('past-present-future');
        const ids = reading.cards.map(c => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(3);
      });
    });

    describe('guidance spread', () => {
      it('returns exactly 3 cards', () => {
        const reading = performReading('guidance');
        expect(reading.cards).toHaveLength(3);
      });
    });

    describe('cross spread', () => {
      it('returns exactly 4 cards', () => {
        const reading = performReading('cross');
        expect(reading.cards).toHaveLength(4);
      });

      it('cards are unique', () => {
        const reading = performReading('cross');
        const ids = reading.cards.map(c => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(4);
      });
    });

    describe('five-elements spread', () => {
      it('returns exactly 5 cards', () => {
        const reading = performReading('five-elements');
        expect(reading.cards).toHaveLength(5);
      });

      it('cards are unique', () => {
        const reading = performReading('five-elements');
        const ids = reading.cards.map(c => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(5);
      });
    });

    describe('interpretation generation', () => {
      it('for single card, interpretation is just the card message', () => {
        const reading = performReading('single');
        expect(reading.interpretation).toBe(reading.cards[0].message);
      });

      it('for multiple cards, interpretation joins all messages with spaces', () => {
        const reading = performReading('guidance');
        const expectedInterpretation = reading.cards.map(c => c.message).join(' ');
        expect(reading.interpretation).toBe(expectedInterpretation);
      });
    });

    describe('affirmation generation', () => {
      it('for single card, affirmation is just the card affirmation', () => {
        const reading = performReading('single');
        expect(reading.affirmation).toBe(reading.cards[0].affirmation);
      });

      it('for multiple cards, affirmation joins all affirmations with spaces', () => {
        const reading = performReading('guidance');
        const expectedAffirmation = reading.cards.map(c => c.affirmation).join(' ');
        expect(reading.affirmation).toBe(expectedAffirmation);
      });
    });

    describe('question parameter', () => {
      it('returns reading without question when not provided', () => {
        const reading = performReading();
        expect(reading.question).toBeUndefined();
      });

      it('stores the question when provided', () => {
        const reading = performReading('single', 'What is my path today?');
        expect(reading.question).toBe('What is my path today?');
      });

      it('stores empty string question', () => {
        const reading = performReading('single', '');
        expect(reading.question).toBe('');
      });
    });

    describe('fallback behavior', () => {
      it('uses single spread for unknown spread name', () => {
        const reading = performReading('unknown-spread');
        expect(reading.cards).toHaveLength(1);
      });

      it('uses single spread for invalid spread name', () => {
        const reading = performReading('!!!invalid!!!');
        expect(reading.cards).toHaveLength(1);
      });
    });

    describe('random selection', () => {
      it('can return different cards on multiple calls (tests randomization)', () => {
        const allCards = getAllOracleCards();
        const seenCards = new Set<string>();
        let differentCardsSeen = false;

        // Try multiple times to get different cards
        for (let i = 0; i < 10; i++) {
          const reading = performReading('single');
          const cardId = reading.cards[0].id;
          if (seenCards.has(cardId)) continue;
          seenCards.add(cardId);
          if (seenCards.size > 1) {
            differentCardsSeen = true;
            break;
          }
        }

        // With 36 cards and 10 attempts, probability of same card is very low
        expect(differentCardsSeen).toBe(true);
      });
    });
  });
});