import { describe, it, expect } from 'vitest';
import { getCard, drawCards, TAROT_DECK, MAJOR_ARCANA, MINOR_ARCANA } from '../../../src/lib/tarot/cards';

describe('tarot-cards', () => {
  it('TAROT_DECK contains all 78 cards', () => {
    expect(TAROT_DECK.cards.length).toBe(78);
  });

  it('MAJOR_ARCANA has 22 cards', () => {
    expect(MAJOR_ARCANA.length).toBe(22);
  });

  it('MINOR_ARCANA has 56 cards', () => {
    expect(MINOR_ARCANA.length).toBe(56);
  });

  it('getCard finds card by id', () => {
    const card = getCard(1);
    expect(card).toBeDefined();
    expect(card?.id).toBe(1);
  });

  it('getCard finds card by name', () => {
    const card = getCard('The Fool');
    expect(card).toBeDefined();
    expect(card?.name).toBe('The Fool');
  });

  it('drawCards returns requested number of cards', () => {
    const drawn = drawCards(3);
    expect(drawn.length).toBe(3);
  });
});
