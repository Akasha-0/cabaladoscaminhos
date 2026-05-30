import { describe, it, expect } from 'vitest';
import { getCard, drawCards, TAROT_DECK } from '@/lib/tarot/cards';

describe('tarot/cards', () => {
  it('TAROT_DECK has 78 cards', () => {
    expect(TAROT_DECK.cards.length).toBe(78);
  });

  it('TAROT_DECK has 22 major arcana', () => {
    const major = TAROT_DECK.cards.filter(c => c.arcana === 'major');
    expect(major.length).toBe(22);
  });

  it('TAROT_DECK has 56 minor arcana', () => {
    const minor = TAROT_DECK.cards.filter(c => c.arcana === 'minor');
    expect(minor.length).toBe(56);
  });

  it('each card has upright and reversed meanings', () => {
    for (const card of TAROT_DECK.cards) {
      expect(Array.isArray(card.upright)).toBe(true);
      expect(card.upright.length).toBeGreaterThan(0);
      expect(Array.isArray(card.reversed)).toBe(true);
      expect(card.reversed.length).toBeGreaterThan(0);
    }
  });

  it('getCard finds fool by id 0', () => {
    const fool = getCard(0);
    expect(fool).toBeDefined();
    expect(fool?.arcana).toBe('major');
  });

  it('getCard finds magician by id 1', () => {
    const magician = getCard(1);
    expect(magician).toBeDefined();
    expect(magician?.arcana).toBe('major');
  });

  it('getCard by string name works', () => {
    expect(getCard('The Fool')?.id).toBe(0);
  });

  it('drawCards draws 3 cards', () => {
    expect(drawCards(3).length).toBe(3);
  });

  it('major arcana numbered 0-21', () => {
    const major = TAROT_DECK.cards.filter(c => c.arcana === 'major');
    for (const c of major) {
      expect(c.id).toBeGreaterThanOrEqual(0);
      expect(c.id).toBeLessThan(22);
    }
  });

  it('minor arcana have suits', () => {
    const minor = TAROT_DECK.cards.filter(c => c.arcana === 'minor');
    for (const c of minor) {
      expect(c.suit).toBeTruthy();
    }
  });
});
