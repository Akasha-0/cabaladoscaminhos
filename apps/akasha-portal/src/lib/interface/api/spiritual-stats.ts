/**
 * Inline spiritual stats calculator.
 * @deprecated Lógica deveria viver na domain layer.
 */

import type { SpiritualCorrelations } from '@/lib/domain/types/spiritual-correlations';

export function calculateSpiritualStatsInline(
  correlations: SpiritualCorrelations
): {
  dominantElement: string;
  dominantOrixa: string;
  hasAffirmation: boolean;
} {
  return {
    dominantElement: correlations.element,
    dominantOrixa: correlations.orixa,
    hasAffirmation: Boolean(correlations.affirmation),
  };
}
