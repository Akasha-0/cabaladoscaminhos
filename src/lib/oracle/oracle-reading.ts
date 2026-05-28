/**
 * Oracle reading — spiritual guidance through sacred oracle cards
 */

import { getAllOracleCards, getRandomOracleCard, OracleCard } from '../divination/oracle-cards';

export interface OracleReading {
  id: string;
  cards: OracleCard[];
  date: string;
  question?: string;
  interpretation: string;
  affirmation: string;
}

export interface ReadingSpread {
  name: string;
  count: number;
  description: string;
}

const SPREADS: ReadingSpread[] = [
  { name: 'single', count: 1, description: 'A single card for today\'s guidance' },
  { name: 'past-present-future', count: 3, description: 'Three cards revealing your journey through time' },
  { name: 'guidance', count: 3, description: 'Guidance for mind, heart, and spirit' },
  { name: 'cross', count: 4, description: 'A cross spread for deeper insight' },
  { name: 'five-elements', count: 5, description: 'Balance through the elements' },
];

/**
 * Get available reading spreads
 */
export function getSpreads(): ReadingSpread[] {
  return SPREADS;
}

/**
 * Get a spread by name
 */
export function getSpreadByName(name: string): ReadingSpread | undefined {
  return SPREADS.find(s => s.name === name);
}

/**
 * Select cards for a reading based on spread
 */
function selectCards(spread: ReadingSpread): OracleCard[] {
  const allCards = getAllOracleCards();
  const selected: OracleCard[] = [];
  const available = [...allCards];

  for (let i = 0; i < spread.count; i++) {
    const index = Math.floor(Math.random() * available.length);
    selected.push(available[index]);
    available.splice(index, 1);
  }

  return selected;
}

/**
 * Generate interpretation from selected cards
 */
function generateInterpretation(cards: OracleCard[], spread: ReadingSpread): string {
  if (cards.length === 1) {
    return cards[0].message;
  }

  const messages = cards.map(card => card.message);
  return messages.join(' ');
}

/**
 * Generate affirmation from selected cards
 */
function generateAffirmation(cards: OracleCard[]): string {
  const affirmations = cards.map(card => card.affirmation);
  if (affirmations.length === 1) {
    return affirmations[0];
  }
  return affirmations.join(' ');
}

/**
 * Perform an oracle reading
 */
export function performReading(
  spreadName: string = 'single',
  question?: string
): OracleReading {
  const spread = getSpreadByName(spreadName) ?? SPREADS[0];
  const cards = selectCards(spread);
  const interpretation = generateInterpretation(cards, spread);
  const affirmation = generateAffirmation(cards);

  return {
    id: crypto.randomUUID(),
    cards,
    date: new Date().toISOString(),
    question,
    interpretation,
    affirmation,
  };
}
