/**
 * Bandha practice — energetic lock techniques in the Himalayan tradition.
 */

export type BandhaName = 'mula-bandha' | 'uddiyana-bandha' | 'jalandhara-bandha' | 'maha-bandha';

export interface BandhaPracticeOptions {
  name: BandhaName;
  durationSeconds?: number;
  repetitions?: number;
}

export interface BandhaPracticeResult {
  name: BandhaName;
  performedAt: Date;
  durationSeconds: number;
  repetitions: number;
}

/**
 * Performs a Bandha practice.
 *
 * In the classical model, each bandha is a specific muscular lock that redirects
 * pranic flow.  Mula Bandha (root lock) engages the pelvic floor; Uddiyana Bandha
 * (flying-up lock) lifts the diaphragm; Jalandhara Bandha (throat lock) chin-tucks
 * the chin to the sternum.  Maha Bandha combines all three.
 *
 * This implementation records the intent and metadata of the practice session.
 * Real pranic activation requires live instruction; the library handles state
 * tracking and sequence logic only.
 */
export function performPractice(options: BandhaPracticeOptions): BandhaPracticeResult {
  const { name, durationSeconds = 30, repetitions = 1 } = options;

  validateBandha(name);

  return {
    name,
    performedAt: new Date(),
    durationSeconds,
    repetitions,
  };
}

function validateBandha(name: BandhaName): void {
  const valid: BandhaName[] = ['mula-bandha', 'uddiyana-bandha', 'jalandhara-bandha', 'maha-bandha'];
  if (!valid.includes(name)) {
    throw new Error(`Unknown bandha: "${name}". Valid values are: ${valid.join(', ')}`);
  }
}
