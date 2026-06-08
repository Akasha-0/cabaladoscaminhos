import { describe, it, expect } from 'vitest';
import { getAllMeanings, getCardMeaning, tarotDeck } from '../../../src/lib/tarot/meanings';

describe('tarot-meanings', () => {
  it('getAllMeanings returns all 78 card meanings', () => {
    const meanings = getAllMeanings();
    expect(meanings.length).toBe(78);
  });

  it('each meaning has upright and reversed text', () => {
    const meanings = getAllMeanings();
    const meaning = meanings[0];
    expect(meaning).toHaveProperty('name');
    expect(meaning).toHaveProperty('upright');
    expect(meaning).toHaveProperty('reversed');
  });

  it('getCardMeaning finds card by name (case-insensitive)', () => {
    const meaning = getCardMeaning('FOOL');
    expect(meaning).toBeDefined();
    expect(meaning?.name.toLowerCase()).toContain('fool');
  });

  it('tarotDeck has major and minor arcana', () => {
    expect(tarotDeck).toHaveProperty('majorArcana');
    expect(tarotDeck).toHaveProperty('minorArcana');
    expect(Array.isArray(tarotDeck.majorArcana)).toBe(true);
    expect(tarotDeck.minorArcana).toHaveProperty('wands');
    expect(tarotDeck.minorArcana).toHaveProperty('cups');
    expect(tarotDeck.minorArcana).toHaveProperty('swords');
    expect(tarotDeck.minorArcana).toHaveProperty('pentacles');
  });
});
