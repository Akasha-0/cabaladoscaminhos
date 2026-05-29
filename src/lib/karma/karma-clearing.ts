/**
 * Karma clearing mechanics.
 */

export interface ClearingOptions {
  amount?: number;
  reason?: string;
  confidenceRating?: number;
}

export interface ClearingResult {
  originalKarma: number;
  clearedAmount: number;
  newKarma: number;
  timestamp: Date;
  reason: string;
}

/**
 * Clears karma from the user's account.
 */
export function clearKarma(
  currentKarma: number,
  options: ClearingOptions = {}
): ClearingResult {
  const {
    amount = 0,
    reason = 'No reason provided.',
  } = options;

  if (amount < 0) {
    throw new RangeError('Clearing amount must be non-negative.');
  }

  const clearedAmount = Math.min(currentKarma, amount);
  const originalKarma = currentKarma;
  const newKarma = currentKarma - clearedAmount;

  return {
    originalKarma,
    clearedAmount,
    newKarma,
    timestamp: new Date(),
    reason,
  };
}
