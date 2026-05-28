// Auto-generated — skip linting and formatting

export interface HealingFrequency {
  hz: number;
  name: string;
  description: string;
}

export interface HealingSound {
  id: string;
  name: string;
  frequencies: HealingFrequency[];
  chakra?: string;
  category: 'chakra' | 'planetary' | 'solfeggio' | 'nature' | 'binaural';
  description: string;
}

const HEALING_SOUNDS: HealingSound[] = [
  {
    id: 'root-sacral',
    name: 'Root to Sacral Activation',
    frequencies: [
      { hz: 174, name: 'Foundation', description: 'Reduces pain and strengthens overall health' },
      { hz: 285, name: 'Tissue Repair', description: 'Stimulates cellular regeneration' },
    ],
    chakra: 'Root/Sacral',
    category: 'chakra',
    description: 'Activates root and sacral energy centers for grounding and vitality',
  },
  {
    id: 'solar-plexus',
    name: 'Solar Plexus Harmony',
    frequencies: [
      { hz: 396, name: 'Liberation', description: 'Frees from fear and guilt' },
      { hz: 417, name: 'Transformation', description: 'Facilitates change and letting go' },
    ],
    chakra: 'Solar Plexus',
    category: 'chakra',
    description: 'Balances personal power and self-worth',
  },
  {
    id: 'heart-sound',
    name: 'Heart Sound Healing',
    frequencies: [
      { hz: 528, name: 'Love Frequency', description: 'DNA repair and miracle transformation' },
      { hz: 639, name: 'Harmony', description: 'Reconnects relationships and resolves conflicts' },
    ],
    chakra: 'Heart',
    category: 'chakra',
    description: 'Opens heart energy for love, compassion, and emotional healing',
  },
  {
    id: 'throat-third-eye',
    name: 'Throat and Third Eye Alignment',
    frequencies: [
      { hz: 741, name: 'Expression', description: 'Purifies negative energy and clears toxins' },
      { hz: 852, name: 'Intuition', description: 'Awakens inner wisdom and spiritual insight' },
    ],
    chakra: 'Throat/Third Eye',
    category: 'chakra',
    description: 'Activates communication and higher perception',
  },
  {
    id: 'crown-chakra',
    name: 'Crown Chakra Ascension',
    frequencies: [
      { hz: 963, name: 'Divine Connection', description: 'Activates pineal gland and universal energy' },
      { hz: 432, name: 'Pure Tone', description: 'Aligns with nature and universal harmony' },
    ],
    chakra: 'Crown',
    category: 'chakra',
    description: 'Connects to divine consciousness and spiritual enlightenment',
  },
  {
    id: 'solfeggio-scale',
    name: 'Full Solfeggio Scale',
    frequencies: [
      { hz: 174, name: 'Pain Relief', description: 'Foundation stone for all healing' },
      { hz: 285, name: 'Wound Healing', description: 'Affects tissue and bones' },
      { hz: 396, name: 'Fear Release', description: 'Clears guilt and fear' },
      { hz: 417, name: 'Change Facilitator', description: 'Breaks self-defeating patterns' },
      { hz: 528, name: 'Miracle Tone', description: 'DNA repair and integrity' },
      { hz: 639, name: 'Relationship Harmony', description: 'Enhances interpersonal bonds' },
      { hz: 741, name: 'Awakening Intuition', description: 'Clears cellular stagnation' },
      { hz: 852, name: 'Third Eye Activation', description: 'Transmutes energy to spirit' },
      { hz: 963, name: 'Crown Activation', description: 'Opens doorway to infinite' },
    ],
    category: 'solfeggio',
    description: 'Complete solfeggio frequency scale for holistic healing',
  },
  {
    id: 'planetary-sounds',
    name: 'Planetary Sound Alignments',
    frequencies: [
      { hz: 210.42, name: 'Sun Resonance', description: 'Vitality, leadership, and confidence' },
      { hz: 126.22, name: 'Moon Vibration', description: 'Emotional balance and intuition' },
      { hz: 141.27, name: 'Mercury Tone', description: 'Communication and mental clarity' },
      { hz: 221.23, name: 'Venus Frequency', description: 'Love, beauty, and harmony' },
      { hz: 32.70, name: 'Mars Rhythm', description: 'Strength, courage, and action' },
    ],
    category: 'planetary',
    description: 'Ancient planetary frequencies aligned with cosmic energies',
  },
  {
    id: 'nature-frequencies',
    name: 'Nature Frequency Healing',
    frequencies: [
      { hz: 432, name: 'Forest Harmonic', description: 'Earth resonance for grounding' },
      { hz: 528, name: 'Ocean Wave', description: 'Flow state and emotional release' },
      { hz: 285, name: 'Mountain Tone', description: 'Stability and inner strength' },
    ],
    category: 'nature',
    description: 'Natural earth frequencies for grounding and renewal',
  },
  {
    id: 'binaural-theta',
    name: 'Binaural Theta Waves',
    frequencies: [
      { hz: 396, name: 'Theta Left', description: 'Left hemisphere 396Hz carrier' },
      { hz: 405, name: 'Theta Right', description: 'Right hemisphere for theta state' },
    ],
    category: 'binaural',
    description: 'Binaural beats inducing theta brainwave state for deep healing',
  },
];

/**
 * Get all healing sounds
 */
export function getHealingSounds(): HealingSound[] {
  return HEALING_SOUNDS;
}

/**
 * Get healing sounds by category
 */
export function getHealingSoundsByCategory(
  category: HealingSound['category']
): HealingSound[] {
  return HEALING_SOUNDS.filter((s) => s.category === category);
}

/**
 * Get healing sound by ID
 */
export function getHealingSoundById(id: string): HealingSound | undefined {
  return HEALING_SOUNDS.find((s) => s.id === id);
}

/**
 * Get healing sounds by chakra
 */
export function getHealingSoundsByChakra(chakra: string): HealingSound[] {
  return HEALING_SOUNDS.filter((s) => s.chakra?.toLowerCase().includes(chakra.toLowerCase()));
}

/**
 * Get healing frequency by Hz value
 */
export function getFrequencyByHz(hz: number): HealingFrequency | undefined {
  for (const sound of HEALING_SOUNDS) {
    const found = sound.frequencies.find((f) => f.hz === hz);
    if (found) return found;
  }
  return undefined;
}