// @ts-nocheck
/* eslint-disable */
// lightbody-data.ts — Lightbody activation data and energy field configurations

export interface LightbodyFrequency {
  id: string;
  level: number;
  name: string;
  portugueseName: string;
  frequency: number;
  color: string;
  chakraActivation: number[];
  sephirot: string[];
  manifestationTime: string;
  symptoms: string[];
  practices: string[];
}

export interface LightbodyLayer {
  id: string;
  name: string;
  portugueseName: string;
  frequency: number;
  color: string;
  element: string;
  description: string;
  activationSigns: string[];
  clearingPractices: string[];
  integrationPoints: string[];
}

const LIGHTBODY_FREQUENCIES: LightbodyFrequency[] = [
  {
    id: 'lb-freq-1',
    level: 1,
    name: 'Ground State',
    portugueseName: 'Estado Fundamental',
    frequency: 174,
    color: '#8B4513',
    chakraActivation: [1],
    sephirot: ['Malkuth'],
    manifestationTime: '1-3 months',
    symptoms: ['Fatigue', 'Body aches', 'Emotional sensitivity'],
    practices: ['Grounding meditations', 'Nature walks', 'Breathwork'],
  },
  {
    id: 'lb-freq-2',
    level: 2,
    name: 'Emotional Gateway',
    portugueseName: 'Portal Emocional',
    frequency: 285,
    color: '#228B22',
    chakraActivation: [1, 2],
    sephirot: ['Malkuth', 'Yesod'],
    manifestationTime: '3-6 months',
    symptoms: ['Mood swings', 'Vivid dreams', 'Heart opening'],
    practices: ['Emotional release', 'Journaling', 'Water rituals'],
  },
  {
    id: 'lb-freq-3',
    level: 3,
    name: 'Mental Expansion',
    portugueseName: 'Expansão Mental',
    frequency: 396,
    color: '#4169E1',
    chakraActivation: [2, 3, 4],
    sephirot: ['Malkuth', 'Yesod', 'Hod'],
    manifestationTime: '6-12 months',
    symptoms: ['Clarity', 'Intuition surge', 'Synchronicities'],
    practices: ['Visualization', 'Affirmations', 'Sacred geometry'],
  },
  {
    id: 'lb-freq-4',
    level: 4,
    name: 'Heart Coherence',
    portugueseName: 'Coerência Cardíaca',
    frequency: 417,
    color: '#FF69B4',
    chakraActivation: [4],
    sephirot: ['Tiphereth'],
    manifestationTime: '12-18 months',
    symptoms: ['Unconditional love', 'Empathy expansion', 'Compassion'],
    practices: ['Heart meditation', 'Loving-kindness', 'Service'],
  },
  {
    id: 'lb-freq-5',
    level: 5,
    name: 'Voice Activation',
    portugueseName: 'Ativação Vocal',
    frequency: 528,
    color: '#FFD700',
    chakraActivation: [5, 4],
    sephirot: ['Geburah', 'Tiphereth'],
    manifestationTime: '18-24 months',
    symptoms: ['Chakra sounds', 'Channeling ability', 'Sound healing'],
    practices: ['Chanting', 'Sound baths', 'Voice work'],
  },
  {
    id: 'lb-freq-6',
    level: 6,
    name: 'Third Eye Illumination',
    portugueseName: 'Iluminação Terceiro Olho',
    frequency: 639,
    color: '#6A0DAD',
    chakraActivation: [6],
    sephirot: ['Daath', 'Chochmah'],
    manifestationTime: '24-36 months',
    symptoms: ['Clairvoyance', 'Inner vision', 'Dream reality'],
    practices: ['Third eye meditation', 'Candle gazing', 'Trance work'],
  },
  {
    id: 'lb-freq-7',
    level: 7,
    name: 'Crown Connection',
    portugueseName: 'Conexão Coroada',
    frequency: 741,
    color: '#FFFFFF',
    chakraActivation: [7],
    sephirot: ['Kether'],
    manifestationTime: '36-48 months',
    symptoms: ['Unity consciousness', 'Oneness experiences', 'Cosmic awareness'],
    practices: ['Silence practice', 'Contemplation', 'Divine connection'],
  },
  {
    id: 'lb-freq-8',
    level: 8,
    name: 'Soul Star Activation',
    portugueseName: 'Ativação Estrela da Alma',
    frequency: 852,
    color: '#E6E6FA',
    chakraActivation: [7, 8],
    sephirot: ['Kether', 'Chochmah'],
    manifestationTime: '48-60 months',
    symptoms: ['Akashic access', 'Past life recall', 'Soul mission clarity'],
    practices: ['Soul star meditation', 'Past life regression', 'Mission clarity'],
  },
  {
    id: 'lb-freq-9',
    level: 9,
    name: 'Divine Gateway',
    portugueseName: 'Portal Divino',
    frequency: 963,
    color: '#FFD700',
    chakraActivation: [7, 8, 9],
    sephirot: ['Kether', 'Binah', 'Chochmah'],
    manifestationTime: '60-72 months',
    symptoms: ['Ascension symptoms', 'Light body emergence', 'Multidimensional perception'],
    practices: ['Ascension ceremonies', 'Light integration', 'Higher self connection'],
  },
];

const LIGHTBODY_LAYERS: LightbodyLayer[] = [
  {
    id: 'layer-etheric',
    name: 'Etheric Template',
    portugueseName: 'Modelo Etérico',
    frequency: 396,
    color: '#0000FF',
    element: 'Ether',
    description: 'The blueprint body that organizes the physical form',
    activationSigns: ['Aura visibility', 'Energy sensitivity', 'Grounding changes'],
    clearingPractices: ['Salt baths', 'Sunlight exposure', 'Grounding exercises'],
    integrationPoints: ['Physical health', 'Energy channels', 'Chakra balance'],
  },
  {
    id: 'layer-emotional',
    name: 'Emotional Body',
    portugueseName: 'Corpo Emocional',
    frequency: 528,
    color: '#FF4500',
    element: 'Water',
    description: 'Processes and stores emotional experiences',
    activationSigns: ['Emotional amplification', 'Feeling others', 'Energy read'],
    clearingPractices: ['Emotional release', 'Water rituals', 'Breathwork'],
    integrationPoints: ['Heart center', 'Relationships', 'Self-expression'],
  },
  {
    id: 'layer-mental',
    name: 'Mental Body',
    portugueseName: 'Corpo Mental',
    frequency: 741,
    color: '#FFFF00',
    element: 'Air',
    description: 'Contains beliefs, thoughts, and mental patterns',
    activationSigns: ['Thought clarity', 'Pattern recognition', 'Mental synchronicities'],
    clearingPractices: ['Mindfulness', 'Affirmations', 'Mental diet'],
    integrationPoints: ['Third eye', 'Learning capacity', 'Decision making'],
  },
  {
    id: 'layer-astral',
    name: 'Astral Body',
    portugueseName: 'Corpo Astral',
    frequency: 852,
    color: '#9400D3',
    element: 'Fire',
    description: 'Vehicle for consciousness in non-physical dimensions',
    activationSigns: ['Out-of-body experiences', 'Dream recall', 'Astral travel'],
    clearingPractices: ['Astral projection', 'Lucid dreaming', 'Astral hygiene'],
    integrationPoints: ['Creative expression', 'Imagination', 'Spiritual travel'],
  },
  {
    id: 'layer-etheric-double',
    name: 'Etheric Double',
    portugueseName: 'Duplo Etérico',
    frequency: 417,
    color: '#00FF7F',
    element: 'Earth',
    description: 'Vital energy body that sustains physical life',
    activationSigns: ['Vitality increase', 'Healing ability', 'Energy circulation'],
    clearingPractices: ['Qi Gong', 'Reiki', 'Energy circulation'],
    integrationPoints: ['Physical vitality', 'Immune system', 'Life force'],
  },
  {
    id: 'layer-celestial',
    name: 'Celestial Body',
    portugueseName: 'Corpo Celestial',
    frequency: 963,
    color: '#FFFFFF',
    element: 'Light',
    description: 'Transcendent body of divine love and wisdom',
    activationSigns: ['Divine downloads', 'Channeling ability', 'Light language'],
    clearingPractices: ['Light meditation', 'Divine connection', 'Sacred geometry'],
    integrationPoints: ['Soul purpose', 'Divine mission', 'Higher guidance'],
  },
  {
    id: 'layer-ketherian',
    name: 'Ketherian Template',
    portugueseName: 'Template Ketheriano',
    frequency: 999,
    color: '#FFD700',
    element: 'Cosmic',
    description: 'Pure consciousness template of divine origin',
    activationSigns: ['Unity consciousness', 'Cosmic awareness', 'Infinite love'],
    clearingPractices: ['Unity meditation', 'Cosmic consciousness', 'Oneness practice'],
    integrationPoints: ['Ascension', 'Mastery', 'Divine embodiment'],
  },
];

export interface LightbodyData {
  frequencies: LightbodyFrequency[];
  layers: LightbodyLayer[];
  totalFrequencies: number;
  totalLayers: number;
}

function buildData(): LightbodyData {
  return {
    frequencies: LIGHTBODY_FREQUENCIES,
    layers: LIGHTBODY_LAYERS,
    totalFrequencies: LIGHTBODY_FREQUENCIES.length,
    totalLayers: LIGHTBODY_LAYERS.length,
  };
}

// Singleton cache
let cachedData: LightbodyData | null = null;

export function getData(): LightbodyData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getFrequencyByLevel(level: number): LightbodyFrequency | undefined {
  return LIGHTBODY_FREQUENCIES.find(f => f.level === level);
}

export function getFrequenciesByChakra(chakra: number): LightbodyFrequency[] {
  return LIGHTBODY_FREQUENCIES.filter(f => f.chakraActivation.includes(chakra));
}

export function getLayerById(id: string): LightbodyLayer | undefined {
  return LIGHTBODY_LAYERS.find(l => l.id === id);
}

export function getLayersByElement(element: string): LightbodyLayer[] {
  return LIGHTBODY_LAYERS.filter(l => l.element === element);
}