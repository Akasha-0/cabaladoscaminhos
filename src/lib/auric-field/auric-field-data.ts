/**
 * Auric Field Data Module
 * Provides foundational data for auric field calculations and interpretations.
 */

export interface AuricLayer {
  id: string;
  name: string;
  color: string;
  frequencyHz: number;
  chakra?: string;
  description: string;
}

export interface AuricFieldData {
  layers: AuricLayer[];
  metadata: {
    version: string;
    lastUpdated: string;
  };
}

const AURIC_LAYERS: AuricLayer[] = [
  {
    id: 'etheric',
    name: 'Etheric Template',
    color: '#4a9eff',
    frequencyHz: 720,
    chakra: 'root',
    description: 'Closest to the physical body; foundation of health and vitality.',
  },
  {
    id: 'emotional',
    name: 'Emotional Body',
    color: '#ff6b6b',
    frequencyHz: 600,
    chakra: 'sacral',
    description: 'Holds feelings and emotional experiences; color-coded.',
  },
  {
    id: 'mental',
    name: 'Mental Body',
    color: '#ffd93d',
    frequencyHz: 500,
    chakra: 'solar',
    description: 'Processes thoughts, beliefs, and mental patterns.',
  },
  {
    id: 'astral',
    name: 'Astral Template',
    color: '#c792ea',
    frequencyHz: 450,
    chakra: 'heart',
    description: 'Bridge between lower and higher selves; love and connection.',
  },
  {
    id: 'celestial',
    name: 'Celestial Body',
    color: '#c3e88d',
    frequencyHz: 250,
    chakra: 'third-eye',
    description: 'Transpersonal realm; spiritual insight and wisdom.',
  },
  {
    id: 'ketheric',
    name: 'Ketheric Template',
    color: '#ffffff',
    frequencyHz: 150,
    chakra: 'crown',
    description: 'Highest template; divine blueprint and soul origin.',
  },
];

const FIELD_DATA: AuricFieldData = {
  layers: AURIC_LAYERS,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2026-05-28',
  },
};

/**
 * Returns the complete auric field dataset.
 */
export function getData(): AuricFieldData {
  return FIELD_DATA;
}

export default getData;