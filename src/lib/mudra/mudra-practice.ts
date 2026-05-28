/**
 * Mudra practice — sacred hand gestures for energy direction and spiritual attunement.
 */

export type MudraName = 
  | 'gyan-mudra'
  | 'prana-mudra'
  | 'agni-mudra'
  | 'apana-mudra'
  | 'vayu-mudra'
  | 'shunya-mudra'
  | 'surya-mudra'
  | 'chandra-mudra'
  | 'prithvi-mudra'
  | 'varuna-mudra'
  | 'matsya-mudra'
  | 'hridaya-mudra'
  | 'garuda-mudra'
  | 'maha-mudra';

export interface MudraPracticeOptions {
  name: MudraName;
  durationSeconds?: number;
  repetitions?: number;
}

export interface MudraPracticeResult {
  name: MudraName;
  performedAt: Date;
  durationSeconds: number;
  repetitions: number;
}

/**
 * Performs a Mudra practice.
 *
 * Mudras are sacred hand gestures used throughout Yoga and Tantric traditions
 * to redirect energy flow, balance elemental forces, and facilitate states of
 * meditation and spiritual receptivity.
 *
 * Each mudra engages specific pressure points on the fingers and palms, 
 * creating energetic circuits that affect the body-mind complex. Regular
 * practice amplifies their effect on pranic flow and consciousness.
 *
 * This implementation records the intent and metadata of the practice session.
 * Real energetic activation is supported through structured practice.
 */
export function performPractice(options: MudraPracticeOptions): MudraPracticeResult {
  const { name, durationSeconds = 30, repetitions = 1 } = options;

  validateMudra(name);

  return {
    name,
    performedAt: new Date(),
    durationSeconds,
    repetitions,
  };
}

function validateMudra(name: MudraName): void {
  const valid: MudraName[] = [
    'gyan-mudra',
    'prana-mudra',
    'agni-mudra',
    'apana-mudra',
    'vayu-mudra',
    'shunya-mudra',
    'surya-mudra',
    'chandra-mudra',
    'prithvi-mudra',
    'varuna-mudra',
    'matsya-mudra',
    'hridaya-mudra',
    'garuda-mudra',
    'maha-mudra',
  ];
  if (!valid.includes(name)) {
    throw new Error(`Unknown mudra: "${name}". Valid values are: ${valid.join(', ')}`);
  }
}