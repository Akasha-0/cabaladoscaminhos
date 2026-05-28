// Vibration data for spiritual frequencies and resonance

export interface VibrationData {
  id: string;
  name: string;
  frequency: number;
  unit: string;
  description: string;
  category: string;
  timestamp: number;
}

export const VIBRATION_DATASET: VibrationData[] = [
  {
    id: 'vib-001',
    name: 'Universal Baseline',
    frequency: 528,
    unit: 'Hz',
    description: 'Love frequency and DNA repair',
    category: 'healing',
    timestamp: Date.now(),
  },
  {
    id: 'vib-002',
    name: 'Solfeggio Freedom',
    frequency: 396,
    unit: 'Hz',
    description: 'Liberating guilt and fear',
    category: 'liberation',
    timestamp: Date.now(),
  },
  {
    id: 'vib-003',
    name: 'Sacred Harmonic',
    frequency: 432,
    unit: 'Hz',
    description: 'Natural tuning and harmony',
    category: 'harmony',
    timestamp: Date.now(),
  },
  {
    id: 'vib-004',
    name: 'Activation Energy',
    frequency: 639,
    unit: 'Hz',
    description: 'Connecting relationships',
    category: 'connection',
    timestamp: Date.now(),
  },
  {
    id: 'vib-005',
    name: 'Insight Frequency',
    frequency: 741,
    unit: 'Hz',
    description: 'Awakening intuition and expression',
    category: 'wisdom',
    timestamp: Date.now(),
  },
  {
    id: 'vib-006',
    name: 'Ascension Tone',
    frequency: 963,
    unit: 'Hz',
    description: 'Crown chakra activation',
    category: 'transcendence',
    timestamp: Date.now(),
  },
  {
    id: 'vib-007',
    name: 'Earth Resonance',
    frequency: 7.83,
    unit: 'Hz',
    description: 'Schumann resonance frequency',
    category: 'grounding',
    timestamp: Date.now(),
  },
  {
    id: 'vib-008',
    name: 'Om Vibration',
    frequency: 136.1,
    unit: 'Hz',
    description: 'Sacred om mantra frequency',
    category: 'meditation',
    timestamp: Date.now(),
  },
];

export function getData(): VibrationData[] {
  return [...VIBRATION_DATASET];
}
