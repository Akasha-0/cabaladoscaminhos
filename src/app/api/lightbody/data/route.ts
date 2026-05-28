// ============================================================
// LIGHTBODY DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for lightbody data access
// ============================================================
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';

// Lightbody data definitions
const LIGHTBODY_LEVELS = [
  {
    id: 1,
    name: ' Crystalline Core',
    description: 'Establishing the foundational lightbody structure',
    activationLevel: 10,
    chakra: 'Root',
    symbols: ['Metatron', 'Seed'],
    meditation: 'Grounding visualization with white light',
  },
  {
    id: 2,
    name: 'Radiant Grid',
    description: 'Activating the light matrix within the body',
    activationLevel: 20,
    chakra: 'Sacral',
    symbols: ['MerKaBa', 'Grid'],
    meditation: 'Sexual energy transmutation practices',
  },
  {
    id: 3,
    name: 'Solar Ignition',
    description: 'Igniting the solar fire centers',
    activationLevel: 30,
    chakra: 'Solar Plexus',
    symbols: ['Phoenix', 'Fire'],
    meditation: 'Breath of fire and inner flame activation',
  },
  {
    id: 4,
    name: 'Heart Expansion',
    description: 'Opening the heart to universal love',
    activationLevel: 40,
    chakra: 'Heart',
    symbols: ['Anahata', 'Heart'],
    meditation: 'Loving-kindness and heart opening',
  },
  {
    id: 5,
    name: 'Throat Illumination',
    description: 'Activating voice and creative expression',
    activationLevel: 50,
    chakra: 'Throat',
    symbols: ['Saraswati', 'Sound'],
    meditation: 'Sacred sound and chanting practices',
  },
  {
    id: 6,
    name: 'Third Eye Activation',
    description: 'Awakening inner vision and intuition',
    activationLevel: 60,
    chakra: 'Third Eye',
    symbols: ['Third Eye', 'Vision'],
    meditation: 'Trataka and inner sight development',
  },
  {
    id: 7,
    name: 'Crown Transcendence',
    description: 'Connecting to divine consciousness',
    activationLevel: 70,
    chakra: 'Crown',
    symbols: ['Sahasrara', 'Unity'],
    meditation: 'Crown opening and unity consciousness',
  },
  {
    id: 8,
    name: 'Soul Star Activation',
    description: 'Activating the soul star chakra above crown',
    activationLevel: 80,
    chakra: 'Soul Star',
    symbols: ['Soul Star', 'Gateway'],
    meditation: 'Stellar activation and soul integration',
  },
  {
    id: 9,
    name: 'Causal Body Mastery',
    description: 'Mastering the causal body template',
    activationLevel: 85,
    chakra: 'Causal',
    symbols: ['Akasha', 'Template'],
    meditation: 'Akashic records access',
  },
  {
    id: 10,
    name: 'Ketheric Body Completion',
    description: 'Full lightbody activation and divine union',
    activationLevel: 100,
    chakra: 'Ketheric',
    symbols: ['Kether', 'Divine'],
    meditation: 'Divine union and complete ascension',
  },
];

const LIGHTBODY_CHAKRAS = [
  {
    id: 'root',
    name: 'Root Chakra',
    sanskrit: 'Muladhara',
    color: 'Red',
    vibration: 'hz_396',
    element: 'Earth',
    affirmation: 'I am grounded in divine presence',
  },
  {
    id: 'sacral',
    name: 'Sacral Chakra',
    sanskrit: 'Svadhisthana',
    color: 'Orange',
    vibration: 'hz_417',
    element: 'Water',
    affirmation: 'I flow with creative life force',
  },
  {
    id: 'solar',
    name: 'Solar Plexus',
    sanskrit: 'Manipura',
    color: 'Yellow',
    vibration: 'hz_528',
    element: 'Fire',
    affirmation: 'I am filled with inner power',
  },
  {
    id: 'heart',
    name: 'Heart Chakra',
    sanskrit: 'Anahata',
    color: 'Green',
    vibration: 'hz_639',
    element: 'Air',
    affirmation: 'I open to unconditional love',
  },
  {
    id: 'throat',
    name: 'Throat Chakra',
    sanskrit: 'Vishuddha',
    color: 'Blue',
    vibration: 'hz_741',
    element: 'Ether',
    affirmation: 'I speak my divine truth',
  },
  {
    id: 'third-eye',
    name: 'Third Eye',
    sanskrit: 'Ajna',
    color: 'Indigo',
    vibration: 'hz_852',
    element: 'Light',
    affirmation: 'I see with inner vision',
  },
  {
    id: 'crown',
    name: 'Crown Chakra',
    sanskrit: 'Sahasrara',
    color: 'Violet',
    vibration: 'hz_963',
    element: 'Cosmic',
    affirmation: 'I am one with divine consciousness',
  },
  {
    id: 'soul-star',
    name: 'Soul Star',
    sanskrit: 'Sahasrara-Purva',
    color: 'White',
    vibration: 'hz_1111',
    element: 'Stellar',
    affirmation: 'I am connected to my soul purpose',
  },
  {
    id: 'earth-star',
    name: 'Earth Star',
    sanskrit: 'Muladhara-Dasha',
    color: 'Brown',
    vibration: 'hz_174',
    element: 'Core',
    affirmation: 'I am deeply rooted in Mother Earth',
  },
];

const LIGHTBODY_FREQUENCIES = [
  { name: 'Solfeggio', value: 396, description: 'Liberation from fear and guilt' },
  { name: 'Solfeggio', value: 417, description: 'Facilitating change and transmutation' },
  { name: 'Solfeggio', value: 528, description: 'DNA repair and transformation' },
  { name: 'Solfeggio', value: 639, description: 'Harmony and relationships' },
  { name: 'Solfeggio', value: 741, description: 'Expression and solutions' },
  { name: 'Solfeggio', value: 852, description: 'Intuition and spiritual order' },
  { name: 'Solfeggio', value: 963, description: 'Divine connection and perfection' },
  { name: 'Christ', value: 1111, description: 'Master frequency for ascension' },
  { name: 'Om', value: 136, description: 'Fundamental cosmic om frequency' },
  { name: 'Shamanic', value: 174, description: 'Foundation and grounding frequency' },
];

// GET /api/lightbody/data - Get all lightbody data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return specific data type if requested
    if (type === 'levels') {
      return NextResponse.json({
        data: LIGHTBODY_LEVELS,
        meta: { count: LIGHTBODY_LEVELS.length, type: 'levels' },
      });
    }

    if (type === 'chakras') {
      return NextResponse.json({
        data: LIGHTBODY_CHAKRAS,
        meta: { count: LIGHTBODY_CHAKRAS.length, type: 'chakras' },
      });
    }

    if (type === 'frequencies') {
      return NextResponse.json({
        data: LIGHTBODY_FREQUENCIES,
        meta: { count: LIGHTBODY_FREQUENCIES.length, type: 'frequencies' },
      });
    }

    // Return all lightbody data
    return NextResponse.json({
      data: {
        levels: LIGHTBODY_LEVELS,
        chakras: LIGHTBODY_CHAKRAS,
        frequencies: LIGHTBODY_FREQUENCIES,
      },
      meta: {
        levelsCount: LIGHTBODY_LEVELS.length,
        chakrasCount: LIGHTBODY_CHAKRAS.length,
        frequenciesCount: LIGHTBODY_FREQUENCIES.length,
        type: 'lightbody',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch lightbody data', details: String(error) },
      { status: 500 }
    );
  }
}