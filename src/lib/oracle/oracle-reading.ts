// src/lib/oracle/oracle-reading.ts
// Stub providing performReading, getSpreads, getSpreadByName for the oracle-reading test.
// Uses the canonical LENORMAND_CARDS source. Replaces the deprecated
// getAllOracleCards from @/lib/divination/oracle-cards.

import { LENORMAND_CARDS, type LenormandCard } from '@/lib/constants/lenormand-cards';

// Re-export canonical cards so existing callers don't need a separate import
export { LENORMAND_CARDS };

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ReadingSpread {
  name: string;
  count: number;
  description: string;
}

export interface OracleReading {
  id: string;
  cards: OracleCard[];
  date: string;
  interpretation: string;
  affirmation: string;
  question?: string;
}

interface OracleCard {
  id: number;
  name: string;
  theme: string;
  message: string;
  affirmation: string;
}

// ─── Spreads ─────────────────────────────────────────────────────────────────

const spreads: ReadingSpread[] = [
  { name: 'single', count: 1, description: 'A single card for quick insight' },
  { name: 'past-present-future', count: 3, description: 'Three cards revealing your journey through time' },
  { name: 'guidance', count: 3, description: 'Guidance for mind, heart, and spirit' },
  { name: 'cross', count: 4, description: 'A cross spread for deeper insight' },
  { name: 'five-elements', count: 5, description: 'Balance through the elements' },
];

export function getSpreads(): ReadingSpread[] {
  return spreads;
}

export function getSpreadByName(name: string): ReadingSpread | undefined {
  return spreads.find((s) => s.name === name);
}

// ─── Card mapping (LenormandCard → OracleCard) ───────────────────────────────

/** Derive a short theme label from the card keywords. */
function deriveTheme(keywords: string): string {
  const first = keywords.split(',')[0]?.trim().toLowerCase() ?? '';
  return first || 'general';
}

/** Map a LenormandCard to the OracleCard shape used by performReading. */
function toOracleCard(card: LenormandCard): OracleCard {
  return {
    id: card.id,
    name: card.name,
    theme: deriveTheme(card.keywords),
    message: card.baseMeaning,
    affirmation: card.baseMeaning, // baseMeaning is used as affirmation proxy
  };
}

// ─── Reading generation ───────────────────────────────────────────────────────

/** Pick n distinct random cards from LENORMAND_CARDS. */
function pickCards(n: number): OracleCard[] {
  const shuffled = [...LENORMAND_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map(toOracleCard);
}

export function performReading(
  spreadName: string = 'single',
  question?: string,
): OracleReading {
  const spread = getSpreadByName(spreadName) ?? getSpreadByName('single')!;
  const cards = pickCards(spread.count);
  const interpretation = cards.map((c) => c.message).join(' ');
  const affirmation = cards.map((c) => c.affirmation).join(' ');

  return {
    id: crypto.randomUUID(),
    cards,
    date: new Date().toISOString(),
    interpretation,
    affirmation,
    ...(question !== undefined ? { question } : {}),
  };
}
