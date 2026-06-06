// ============================================================
// TAROT SPREAD CALCULATOR - CABALA DOS CAMINHOS
// ============================================================
// Utility functions for calculating tarot spreads and
// spiritual correlations.
//
// Clone group: 63ac2acf (43 lines, 3 instances)
// Pattern: Tarot routes with spread calculation
// Files: divine/connection, tarot/consulta, tarot/reading routes
// ============================================================

import type { SpiritualCorrelations } from '@/lib/api/spiritual-correlations';
interface SpreadPosition {
  index: number;
  name: string;
  description: string;
  element?: string;
  chakra?: number;
  sefira?: string;
}

// fallow-ignore-next-line unused-type
export interface Spread {
  id: string;
  name: string;
  description?: string;
  totalCards: number;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  position: number;
  positionName: string;
  positionDescription: string;
  isReversed: boolean;
  uprightMeaning: string;
  reversedMeaning: string;
  spiritualCorrelations: SpiritualCorrelations;
}

export interface TarotReadingResult {
  spread: {
    id: string;
    name: string;
    description: string;
    totalCards: number;
  };
  cards: DrawnCard[];
  spiritualStats: {
    bySefirot: Record<string, number>;
    byChakra: Record<string, number>;
    byElement: Record<string, number>;
    byOrixa: Record<string, number>;
  };
}

/**
 * Generate spiritual stats from drawn cards
 */
export function calculateSpreadSpiritualStats(cards: DrawnCard[]): TarotReadingResult['spiritualStats'] {
  const spiritualStats = {
    bySefirot: {} as Record<string, number>,
    byChakra: {} as Record<string, number>,
    byElement: {} as Record<string, number>,
    byOrixa: {} as Record<string, number>,
  };
  for (const card of cards) {
    const corr = card.spiritualCorrelations;
    accumulateCorrelation(spiritualStats.bySefirot, corr.sefirot);
    if (corr.chakra != null) {
      spiritualStats.byChakra[String(corr.chakra)] = (spiritualStats.byChakra[String(corr.chakra)] || 0) + 1;
    }
    accumulateCorrelation(spiritualStats.byElement, corr.element ? [corr.element] : []);
    accumulateCorrelation(spiritualStats.byOrixa, corr.orixa ? [corr.orixa] : []);
  }
  return spiritualStats;
}
/**
 * Accumulate counts for array-based correlations (sefirot, elements, orixas)
 */
function accumulateCorrelation(
  stats: Record<string, number>,
  values: string[] | undefined
): void {
  if (!values) return;
  for (const value of values) {
    stats[value] = (stats[value] || 0) + 1;
  }
}

function buildDrawnCard(
  card: {
    id: number;
    name: string;
    arcana: 'major' | 'minor';
    upright: string[];
    reversed: string[];
  },
  position: number,
  spreadPosition: SpreadPosition,
  spiritualCorr: SpiritualCorrelations,
  isReversed: boolean
): DrawnCard {
  return {
    id: card.id,
    name: card.name,
    arcana: card.arcana,
    position,
    positionName: spreadPosition.name,
    positionDescription: spreadPosition.description,
    isReversed,
    uprightMeaning: card.upright.join(' '),
    reversedMeaning: card.reversed.join(' '),
    spiritualCorrelations: spiritualCorr,
  };
}

function generateReadingSummary(
  spread: Spread,
  cards: DrawnCard[],
  options: {
    reversedCount?: number;
    majorArcanaCount?: number;
  } = {}
): string {
  const { reversedCount = 0, majorArcanaCount = 0 } = options;
  const totalCards = cards.length;

  let summary = `Leitura de ${spread.name} com ${totalCards} cartas.`;

  if (majorArcanaCount > 0) {
    summary += ` ${majorArcanaCount} carta(s) do Arcanjo Maior indicam mudanças significativas.`;
  }

  if (reversedCount > 0) {
    summary += ` ${reversedCount} carta(s) invertida(s) sugere energia internalizada.`;
  }

  return summary;
}
