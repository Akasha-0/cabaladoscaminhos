
export interface Frequency {
  id: string;
  hz: number;
  note: string;
  name: string;
  color: string;
  chakra: number | null;
  element: string | null;
  sefirot: string | null;
  benefits: string[];
  applications: string[];
  mantra: string;
  description: string;
}

export interface FrequencyCategory {
  id: string;
  name: string;
  description: string;
  frequencies: Frequency[];
}

const SOLFEGGIO_FREQUENCIES: Frequency[] = [
  {
    id: 'sol-174',
    hz: 174,
    note: 'F#',
    name: 'Foundation',
    color: '#8B4513',
    chakra: 1,
    element: 'Earth',
    sefirot: 'Malkuth',
    benefits: ['Pain relief', 'Strengthens body tissues', 'Grounding energy'],
    applications: ['Meditation', 'Physical healing', 'Pain management'],
    mantra: 'Om',
    description: 'Known as the foundation frequency, it provides a natural墙角 of the body and acts as an analgesic.',
  },
  {
    id: 'sol-285',
    hz: 285,
    note: 'G',
    name: 'Tissue Regeneration',
    color: '#228B22',
    chakra: 2,
    element: 'Water',
    sefirot: 'Yesod',
    benefits: ['Stimulates tissue regeneration', 'Heals wounds', 'Energizes the body'],
    applications: ['Healing', 'Rejuvenation', 'Energy work'],
    mantra: 'Om Shanti',
    description: 'Signals the body to rebuild itself by energizing damaged organs and tissues.',
  },
  {
    id: 'sol-396',
    hz: 396,
    note: 'G#',
    name: 'Liberation',
    color: '#4169E1',
    chakra: 3,
    element: 'Fire',
    sefirot: 'Hod',
    benefits: ['Releases guilt and fear', 'Transforms negative emotions', 'Opens mindset'],
    applications: ['Emotional healing', 'Letting go', 'Inner work'],
    mantra: 'Om Gam',
    description: 'Liberates the mind from fear and guilt, facilitating emotional transformation.',
  },
  {
    id: 'sol-417',
    hz: 417,
    note: 'A',
    name: 'Change',
    color: '#FFA500',
    chakra: 4,
    element: 'Air',
    sefirot: 'Netzach',
    benefits: ['Facilitates change', 'Dissolves difficult situations', 'Encourages innovation'],
    applications: ['Transformation', 'New beginnings', 'Problem solving'],
    mantra: 'Om Ram',
    description: 'Facilitates change by dissolving external occurrences and situations that have been difficult to transform.',
  },
  {
    id: 'sol-528',
    hz: 528,
    note: 'A#',
    name: 'Miracle',
    color: '#FFD700',
    chakra: 5,
    element: 'Ether',
    sefirot: 'Tiferet',
    benefits: ['DNA repair', 'Promotes miracles', 'Clears negativity'],
    applications: ['DNA healing', 'Meditation', 'Spiritual awakening'],
    mantra: 'Om Yam',
    description: 'The miracle frequency known for DNA repair and transformation, used in ancient civilizations.',
  },
  {
    id: 'sol-639',
    hz: 639,
    note: 'B',
    name: 'Harmony',
    color: '#87CEEB',
    chakra: 6,
    element: 'Light',
    sefirot: 'Hod',
    benefits: ['Enhances communication', 'Promotes harmony in relationships', 'Reduces tension'],
    applications: ['Relationships', 'Communication', 'Teamwork'],
    mantra: 'Om Hum',
    description: 'Enhances communication and promotes harmony in relationships and group dynamics.',
  },
  {
    id: 'sol-741',
    hz: 741,
    note: 'C',
    name: 'Awakening',
    color: '#9370DB',
    chakra: 7,
    element: 'Cosmic',
    sefirot: 'Chesed',
    benefits: ['Purifies cells', 'Awakens intuition', 'Expands consciousness'],
    applications: ['Spiritual awakening', 'Meditation', 'Intuitive development'],
    mantra: 'Om Ksham',
    description: 'Awakens intuition and expands consciousness by purifying and awakening the mind.',
  },
  {
    id: 'sol-852',
    hz: 852,
    note: 'C#',
    name: 'Third Eye',
    color: '#4B0082',
    chakra: null,
    element: 'Cosmic',
    sefirot: 'Binah',
    benefits: ['Activates third eye', 'Restores spiritual awareness', 'Promotes clarity'],
    applications: ['Spiritual practice', 'Meditation', 'Inner vision'],
    mantra: 'Om Om',
    description: 'Activates the third eye and restores spiritual awareness, promoting inner knowing.',
  },
  {
    id: 'sol-963',
    hz: 963,
    note: 'D',
    name: 'Divine Connection',
    color: '#FFFFFF',
    chakra: null,
    element: 'Divine',
    sefirot: 'Kether',
    benefits: ['Connects to divine source', 'Perfect state restoration', 'Enlightenment'],
    applications: ['Spiritual enlightenment', 'Divine connection', 'Oneness'],
    mantra: 'Om Namah Shivaya',
    description: 'Connects directly to the divine source and restores the perfect state of original perfection.',
  },
];

const HEALING_FREQUENCIES: Frequency[] = [
  {
    id: 'heal-70',
    hz: 70,
    note: 'C2',
    name: 'Earth Frequency',
    color: '#8B4513',
    chakra: 1,
    element: 'Earth',
    sefirot: 'Malkuth',
    benefits: ['Deep grounding', 'Earth connection', 'Stability'],
    applications: ['Grounding', 'Nature meditation', 'Physical balance'],
    mantra: 'Om Lam',
    description: 'Resonates with the natural frequency of Earth, providing deep grounding and stability.',
  },
  {
    id: 'heal-110',
    hz: 110,
    note: 'A2',
    name: 'Heart Coherence',
    color: '#FF69B4',
    chakra: 4,
    element: 'Water',
    sefirot: 'Tiferet',
    benefits: ['Heart coherence', 'Emotional balance', 'Love frequency'],
    applications: ['Heart meditation', 'Emotional healing', 'Compassion practice'],
    mantra: 'Om Yam',
    description: 'Aligns with the heart frequency, promoting emotional balance and coherent heart rhythm.',
  },
  {
    id: 'heal-432',
    hz: 432,
    note: 'A4',
    name: 'Natural Tuning',
    color: '#00CED1',
    chakra: null,
    element: 'Nature',
    sefirot: 'Chesed',
    benefits: ['Natural harmony', 'Stress reduction', 'Peaceful state'],
    applications: ['Relaxation', 'Nature connection', 'Meditation'],
    mantra: 'Om Shanti',
    description: 'The natural tuning frequency of the universe, known for promoting harmony and peace.',
  },
  {
    id: 'heal-440',
    hz: 440,
    note: 'A4',
    name: 'Standard Tuning',
    color: '#C0C0C0',
    chakra: null,
    element: 'Air',
    sefirot: 'Hod',
    benefits: ['Standard reference', 'Mental clarity', 'Alertness'],
    applications: ['Music tuning', 'Mental focus', 'Learning'],
    mantra: 'Om',
    description: 'The standard tuning frequency used in modern music, promoting mental alertness.',
  },
  {
    id: 'heal-528',
    hz: 528,
    note: 'C5',
    name: 'Love Frequency',
    color: '#FF1493',
    chakra: 4,
    element: 'Heart',
    sefirot: 'Gevurah',
    benefits: ['DNA repair', 'Love activation', 'Transformation'],
    applications: ['DNA healing', 'Heart opening', 'Spiritual growth'],
    mantra: 'Om HRIM',
    description: 'The love frequency associated with transformation and DNA repair capabilities.',
  },
  {
    id: 'heal-639',
    hz: 639,
    note: 'E5',
    name: 'Relationship Healing',
    color: '#FFB6C1',
    chakra: 4,
    element: 'Air',
    sefirot: 'Netzach',
    benefits: ['Relationship harmony', 'Communication', 'Unity'],
    applications: ['Partner healing', 'Family harmony', 'Group unity'],
    mantra: 'Om Hum Namah',
    description: 'Heals relationships by promoting understanding, communication, and unity.',
  },
  {
    id: 'heal-741',
    hz: 741,
    note: 'F#5',
    name: 'Expression Healing',
    color: '#9370DB',
    chakra: 5,
    element: 'Ether',
    sefirot: 'Chesed',
    benefits: ['Expression clarity', 'Throat activation', 'Truth speaking'],
    applications: ['Communication healing', 'Creative expression', 'Truth work'],
    mantra: 'Om Ham',
    description: 'Activates clear expression and truth-speaking, healing the throat chakra.',
  },
  {
    id: 'heal-852',
    hz: 852,
    note: 'A#5',
    name: 'Intuition Activation',
    color: '#8A2BE2',
    chakra: 6,
    element: 'Cosmic',
    sefirot: 'Hokhmah',
    benefits: ['Third eye activation', 'Intuition enhancement', 'Inner vision'],
    applications: ['Intuitive development', 'Third eye meditation', 'Psychic opening'],
    mantra: 'Om Ksham',
    description: 'Activates the third eye and enhances intuitive and psychic abilities.',
  },
  {
    id: 'heal-963',
    hz: 963,
    note: 'B5',
    name: 'Crown Activation',
    color: '#E6E6FA',
    chakra: 7,
    element: 'Divine',
    sefirot: 'Kether',
    benefits: ['Crown activation', 'Divine connection', 'Enlightenment'],
    applications: ['Spiritual awakening', 'Divine communion', 'Transcendence'],
    mantra: 'Om Namah Shivaya',
    description: 'Activates the crown chakra and facilitates divine connection and enlightenment.',
  },
  {
    id: 'heal-111',
    hz: 111,
    note: 'A#2',
    name: 'New Beginnings',
    color: '#FFE4E1',
    chakra: null,
    element: 'Light',
    sefirot: 'Kether',
    benefits: ['New beginnings', 'Creation energy', 'Hope'],
    applications: ['New projects', 'Starting fresh', 'Manifestation'],
    mantra: 'Om Soham',
    description: 'The frequency of new beginnings and creation, associated with hope and fresh starts.',
  },
  {
    id: 'heal-117',
    hz: 117,
    note: 'B2',
    name: 'Cellular Regeneration',
    color: '#E0FFFF',
    chakra: null,
    element: 'Life',
    sefirot: 'Chesed',
    benefits: ['Cellular repair', 'Vitality', 'Life force'],
    applications: ['Healing', 'Rejuvenation', 'Energy boost'],
    mantra: 'Om Hraam',
    description: 'Supports cellular regeneration and restores vital life force energy.',
  },
  {
    id: 'heal-147',
    hz: 147,
    note: 'D3',
    name: 'Sleep Restoration',
    color: '#191970',
    chakra: null,
    element: 'Night',
    sefirot: 'Yesod',
    benefits: ['Deep sleep', 'Restoration', 'Night healing'],
    applications: ['Sleep preparation', 'Night meditation', 'Recovery'],
    mantra: 'Om Shum Shum',
    description: 'Promotes deep, restorative sleep and facilitates healing during rest.',
  },
  {
    id: 'heal-159',
    hz: 159,
    note: 'D#3',
    name: 'Brain Entrainment',
    color: '#000080',
    chakra: 6,
    element: 'Mind',
    sefirot: 'Daat',
    benefits: ['Brainwave entrainment', 'Focus', 'Mental clarity'],
    applications: ['Study', 'Work focus', 'Meditation states'],
    mantra: 'Om Dhum',
    description: 'Entrains brainwaves to desired states, supporting focus and mental clarity.',
  },
  {
    id: 'heal-174',
    hz: 174,
    note: 'F3',
    name: 'Pain Relief',
    color: '#FFA07A',
    chakra: 1,
    element: 'Earth',
    sefirot: 'Malkuth',
    benefits: ['Natural pain relief', 'Tissue healing', 'Comfort'],
    applications: ['Chronic pain', 'Injury recovery', 'Comfort work'],
    mantra: 'Om Lam Lam',
    description: 'The natural analgesic frequency that provides relief from physical pain.',
  },
  {
    id: 'heal-183',
    hz: 183,
    note: 'F#3',
    name: 'Thyroid Support',
    color: '#DEB887',
    chakra: 5,
    element: 'Air',
    sefirot: 'Gevurah',
    benefits: ['Thyroid balance', 'Metabolism', 'Hormonal harmony'],
    applications: ['Thyroid healing', 'Metabolism support', 'Hormone balance'],
    mantra: 'Om Hrim Hrim',
    description: 'Supports thyroid function and helps balance metabolism and hormones.',
  },
  {
    id: 'heal-204',
    hz: 204,
    note: 'G#3',
    name: 'Pineal Activation',
    color: '#483D8B',
    chakra: 6,
    element: 'Light',
    sefirot: 'Hokhmah',
    benefits: ['Pineal activation', 'Melatonin production', 'Spiritual insight'],
    applications: ['Pineal gland work', 'Circadian rhythm', 'Spiritual practice'],
    mantra: 'Om KLEEM',
    description: 'Activates the pineal gland and supports healthy melatonin production.',
  },
  {
    id: 'heal-285',
    hz: 285,
    note: 'C#4',
    name: 'Adrenal Support',
    color: '#8FBC8F',
    chakra: null,
    element: 'Earth',
    sefirot: 'Malkuth',
    benefits: ['Adrenal balance', 'Stress response', 'Energy'],
    applications: ['Adrenal fatigue', 'Stress management', 'Energy work'],
    mantra: 'Om Strim Strim',
    description: 'Supports adrenal function and helps balance the stress response system.',
  },
];

const CATEGORIES: FrequencyCategory[] = [
  {
    id: 'solfeggio',
    name: 'Solfeggio Frequencies',
    description: 'The original sound frequencies used in ancient Gregorian chants, believed to produce specific spiritual effects.',
    frequencies: SOLFEGGIO_FREQUENCIES,
  },
  {
    id: 'healing',
    name: 'Healing Frequencies',
    description: 'Additional healing frequencies used in sound therapy and vibrational medicine.',
    frequencies: HEALING_FREQUENCIES,
  },
];

export const FREQUENCY_DATA: FrequencyCategory[] = CATEGORIES;

export function getData(): FrequencyCategory[] {
  return FREQUENCY_DATA;
}

export function getAllFrequencies(): Frequency[] {
  return [...SOLFEGGIO_FREQUENCIES, ...HEALING_FREQUENCIES];
}

export function getFrequencyById(id: string): Frequency | undefined {
  return getAllFrequencies().find(f => f.id === id);
}

export function getFrequenciesByChakra(chakra: number): Frequency[] {
  return getAllFrequencies().filter(f => f.chakra === chakra);
}

export function getFrequenciesByElement(element: string): Frequency[] {
  return getAllFrequencies().filter(f => f.element === element);
}

export function getFrequenciesBySefirot(sefirot: string): Frequency[] {
  return getAllFrequencies().filter(f => f.sefirot === sefirot);
}

export function getCategoryById(id: string): FrequencyCategory | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getFrequenciesByHz(hz: number): Frequency[] {
  return getAllFrequencies().filter(f => f.hz === hz);
}

export function getFrequencyRange(minHz: number, maxHz: number): Frequency[] {
  return getAllFrequencies().filter(f => f.hz >= minHz && f.hz <= maxHz);
}
