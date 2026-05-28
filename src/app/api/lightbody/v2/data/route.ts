// ============================================================
// LIGHTBODY DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for lightbody v2 data access
// - List all lightbody levels, frequencies, and practices
// - Get specific lightbody level by ID or number
// - Lightbody activation stages and ascension data
// ============================================================
 
 

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed lightbody levels data
const LIGHTBODY_LEVELS = [
  {
    id: 'crystalline-core',
    number: 1,
    name: 'Crystalline Core',
    description: 'Establishing the foundational lightbody structure through cellular regeneration and light encoding',
    activationLevel: 10,
    chakra: 'Root',
    symbols: ['Metatron', 'Seed Crystal'],
    meditation: 'Grounding visualization with white light integration',
    practices: ['Light breathing', 'Crystal visualization', 'Grounding meditation'],
    timeframe: '3-6 months',
  },
  {
    id: 'radiant-grid',
    number: 2,
    name: 'Radiant Grid',
    description: 'Activating the light matrix within the body, building the light body scaffold',
    activationLevel: 20,
    chakra: 'Sacral',
    symbols: ['MerKaBa', 'Light Grid'],
    meditation: 'Sexual energy transmutation practices',
    practices: ['Kundalini preparation', 'Sexual energy work', 'Taoist practices'],
    timeframe: '6-12 months',
  },
  {
    id: 'solar-ignition',
    number: 3,
    name: 'Solar Ignition',
    description: 'Igniting the solar fire centers, activating personal power and transformation',
    activationLevel: 30,
    chakra: 'Solar Plexus',
    symbols: ['Phoenix', 'Sacred Fire'],
    meditation: 'Breath of fire and inner flame activation',
    practices: ['Breath of fire', 'Fire ceremonies', 'Power meditation'],
    timeframe: '12-18 months',
  },
  {
    id: 'heart-expansion',
    number: 4,
    name: 'Heart Expansion',
    description: 'Opening the heart to universal love, expanding emotional capacity',
    activationLevel: 40,
    chakra: 'Heart',
    symbols: ['Anahata', 'Heart Chakra'],
    meditation: 'Loving-kindness and heart opening',
    practices: ['Metta meditation', 'Heart opening exercises', 'Unconditional love work'],
    timeframe: '18-24 months',
  },
  {
    id: 'throat-illumination',
    number: 5,
    name: 'Throat Illumination',
    description: 'Activating voice and creative expression, speaking light language',
    activationLevel: 50,
    chakra: 'Throat',
    symbols: ['Saraswati', 'Sound Light'],
    meditation: 'Sacred sound and chanting practices',
    practices: ['Chanting', 'Light language', 'Sacred sound work'],
    timeframe: '2-3 years',
  },
  {
    id: 'third-eye-activation',
    number: 6,
    name: 'Third Eye Activation',
    description: 'Awakening inner vision and intuition, developing clairvoyance',
    activationLevel: 60,
    chakra: 'Third Eye',
    symbols: ['Third Eye', 'Vision Circle'],
    meditation: 'Trataka and inner sight development',
    practices: ['Trataka', 'Third eye meditation', 'Inner vision exercises'],
    timeframe: '3-4 years',
  },
  {
    id: 'crown-transcendence',
    number: 7,
    name: 'Crown Transcendence',
    description: 'Connecting to divine consciousness, channeling cosmic light',
    activationLevel: 70,
    chakra: 'Crown',
    symbols: ['Sahasrara', 'Unity Consciousness'],
    meditation: 'Crown opening and unity consciousness',
    practices: ['Union meditation', 'Cosmic connection', 'Divine channeling'],
    timeframe: '4-5 years',
  },
  {
    id: 'soul-star-activation',
    number: 8,
    name: 'Soul Star Activation',
    description: 'Activating the soul star chakra above crown, accessing soul frequency',
    activationLevel: 80,
    chakra: 'Soul Star',
    symbols: ['Soul Star', 'Gateway'],
    meditation: 'Stellar activation and soul integration',
    practices: ['Stellar meditation', 'Soul integration', 'Akashic access'],
    timeframe: '5-7 years',
  },
  {
    id: 'causal-body-mastery',
    number: 9,
    name: 'Causal Body Mastery',
    description: 'Mastering the causal body template, accessing Akashic records',
    activationLevel: 85,
    chakra: 'Causal',
    symbols: ['Akasha', 'Template Body'],
    meditation: 'Akashic records access and causal body work',
    practices: ['Akashic reading', 'Causal body integration', 'Timeline work'],
    timeframe: '7-10 years',
  },
  {
    id: 'ketheric-body-completion',
    number: 10,
    name: 'Ketheric Body Completion',
    description: 'Full lightbody activation and divine union, complete ascension',
    activationLevel: 100,
    chakra: 'Ketheric',
    symbols: ['Kether', 'Divine Union'],
    meditation: 'Divine union and complete ascension integration',
    practices: ['Divine union meditation', 'Full ascension integration', 'Multi-dimensional existence'],
    timeframe: 'Lifetime practice',
  },
];

// Pre-computed lightbody frequencies
const LIGHTBODY_FREQUENCIES = [
  { name: 'Solfeggio 396Hz', value: 396, description: 'Liberation from fear and guilt', benefit: 'Emotional healing', color: 'Red' },
  { name: 'Solfeggio 417Hz', value: 417, description: 'Facilitating change and undoing situations', benefit: 'Transformation', color: 'Orange' },
  { name: 'Solfeggio 528Hz', value: 528, description: 'Love frequency, DNA repair and healing', benefit: 'Inner healing', color: 'Yellow' },
  { name: 'Solfeggio 639Hz', value: 639, description: 'Heart connections and relationships', benefit: 'Harmony', color: 'Green' },
  { name: 'Solfeggio 741Hz', value: 741, description: 'Expression and communication', benefit: 'Clarity', color: 'Blue' },
  { name: 'Solfeggio 852Hz', value: 852, description: 'Third eye activation and intuition', benefit: 'Intuition', color: 'Indigo' },
  { name: 'Solfeggio 963Hz', value: 963, description: 'Crown activation and unity consciousness', benefit: 'Unity', color: 'Violet' },
  { name: 'Cosmic 1111Hz', value: 1111, description: 'Light codes and new realities', benefit: 'Creation', color: 'White' },
  { name: 'Earth Star 174Hz', value: 174, description: 'Foundation and grounding frequency', benefit: 'Grounding', color: 'Brown' },
];

// Pre-computed lightbody chakras
const LIGHTBODY_CHAKRAS = [
  { id: 'root', name: 'Root Chakra', sanskrit: 'Muladhara', color: 'Red', vibration: 'hz_396', element: 'Earth', affirmation: 'I am grounded in divine presence', location: 'Base of spine' },
  { id: 'sacral', name: 'Sacral Chakra', sanskrit: 'Svadhisthana', color: 'Orange', vibration: 'hz_417', element: 'Water', affirmation: 'I flow with creative life force', location: 'Below navel' },
  { id: 'solar', name: 'Solar Plexus Chakra', sanskrit: 'Manipura', color: 'Yellow', vibration: 'hz_528', element: 'Fire', affirmation: 'I am filled with inner power', location: 'Upper abdomen' },
  { id: 'heart', name: 'Heart Chakra', sanskrit: 'Anahata', color: 'Green', vibration: 'hz_639', element: 'Air', affirmation: 'I open to unconditional love', location: 'Center chest' },
  { id: 'throat', name: 'Throat Chakra', sanskrit: 'Vishuddha', color: 'Blue', vibration: 'hz_741', element: 'Ether', affirmation: 'I speak my divine truth', location: 'Throat center' },
  { id: 'third-eye', name: 'Third Eye Chakra', sanskrit: 'Ajna', color: 'Indigo', vibration: 'hz_852', element: 'Light', affirmation: 'I see with inner vision', location: 'Between eyebrows' },
  { id: 'crown', name: 'Crown Chakra', sanskrit: 'Sahasrara', color: 'Violet', vibration: 'hz_963', element: 'Cosmic', affirmation: 'I am one with divine consciousness', location: 'Top of head' },
  { id: 'soul-star', name: 'Soul Star Chakra', sanskrit: 'Sahasrara-Purva', color: 'White', vibration: 'hz_1111', element: 'Stellar', affirmation: 'I am connected to my soul purpose', location: 'Above crown' },
  { id: 'earth-star', name: 'Earth Star Chakra', sanskrit: 'Muladhara-Dasha', color: 'Brown', vibration: 'hz_174', element: 'Core', affirmation: 'I am deeply rooted in Mother Earth', location: 'Below feet' },
];

// Pre-computed lightbody practices
const LIGHTBODY_PRACTICES = [
  { id: 'light-breathing', name: 'Light Breathing', description: 'Breathing in divine light and visualizing it filling every cell', category: 'meditation', duration: '15-30 min', level: 'beginner' },
  { id: 'crystal-visualization', name: 'Crystal Visualization', description: 'Visualizing crystals of light encoding your cellular structure', category: 'meditation', duration: '20 min', level: 'intermediate' },
  { id: 'merkabha-meditation', name: 'MerKabha Meditation', description: 'Activating the MerKaBa light body through sacred geometry', category: 'meditation', duration: '45 min', level: 'advanced' },
  { id: 'breath-of-fire', name: 'Breath of Fire', description: 'Rapid breathwork to ignite solar centers and activate kundalini', category: 'breathwork', duration: '15-20 min', level: 'intermediate' },
  { id: 'loving-kindness', name: 'Loving Kindness Meditation', description: 'Metta practice to expand heart capacity and open to unconditional love', category: 'meditation', duration: '20-30 min', level: 'beginner' },
  { id: 'light-language', name: 'Light Language Activation', description: 'Speaking and channeling sacred sounds and frequencies', category: 'sound', duration: '15 min', level: 'intermediate' },
  { id: 'akashic-access', name: 'Akashic Records Reading', description: 'Accessing the cosmic library of all experiences', category: 'channeling', duration: '30-60 min', level: 'advanced' },
  { id: 'trataka', name: 'Trataka Practice', description: 'Candle gazing meditation to activate third eye', category: 'meditation', duration: '10-20 min', level: 'intermediate' },
];

// Pre-computed primary lightbody data
const LIGHTBODY_DATA = {
  name: 'Lightbody Activation',
  description: 'The process of raising your vibrational frequency from physical to light body form through spiritual practice and ascension work',
  totalLevels: LIGHTBODY_LEVELS.length,
  totalFrequencies: LIGHTBODY_FREQUENCIES.length,
  totalChakras: LIGHTBODY_CHAKRAS.length,
  totalPractices: LIGHTBODY_PRACTICES.length,
  keyConcepts: {
    lightBody: 'A body of light that exists beyond the physical form, capable of multi-dimensional travel',
    ascension: 'The process of raising consciousness and vibrational frequency to higher dimensions',
    merkabha: 'A vehicle of light composed of counter-rotating fields of light',
    crystalBody: 'A body of crystallized light that replaces the physical body at higher frequencies',
  },
  integrationNotes: 'Lightbody activation is a gradual process that requires consistent practice across all levels of being - physical, emotional, mental, and spiritual. Each level builds upon the previous, creating a stable foundation for higher activations.',
};

// GET /api/lightbody/v2/data - Get lightbody data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const searchType = searchParams.get('type');
    const level = searchParams.get('level');
    const practice = searchParams.get('practice');

    // Return specific lightbody level by number
    if (level) {
      const num = parseInt(level, 10);
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: 'Invalid level number' },
          { status: 400 }
        );
      }
      const levelData = LIGHTBODY_LEVELS.find((l) => l.number === num);
      if (!levelData) {
        return NextResponse.json(
          { success: false, error: 'Lightbody level not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: levelData });
    }

    // Return lightbody data by ID
    if (id) {
      if (id === 'levels') {
        return NextResponse.json({ success: true, data: LIGHTBODY_LEVELS });
      }
      if (id === 'frequencies') {
        return NextResponse.json({ success: true, data: LIGHTBODY_FREQUENCIES });
      }
      if (id === 'chakras') {
        return NextResponse.json({ success: true, data: LIGHTBODY_CHAKRAS });
      }
      if (id === 'practices') {
        return NextResponse.json({ success: true, data: LIGHTBODY_PRACTICES });
      }
      // Check levels
      const levelData = LIGHTBODY_LEVELS.find((l) => l.id === id);
      if (levelData) {
        return NextResponse.json({ success: true, data: levelData });
      }
      // Check frequencies
      const freqData = LIGHTBODY_FREQUENCIES.find((f) => f.name.toLowerCase().replace(/\s+/g, '-') === id);
      if (freqData) {
        return NextResponse.json({ success: true, data: freqData });
      }
      // Check chakras
      const chakraData = LIGHTBODY_CHAKRAS.find((c) => c.id === id);
      if (chakraData) {
        return NextResponse.json({ success: true, data: chakraData });
      }
      // Check practices
      const practiceData = LIGHTBODY_PRACTICES.find((p) => p.id === id);
      if (practiceData) {
        return NextResponse.json({ success: true, data: practiceData });
      }
      // Check primary data
      if (id === 'lightbody-primary' || id === 'primary') {
        return NextResponse.json({ success: true, data: LIGHTBODY_DATA });
      }
      return NextResponse.json(
        { success: false, error: 'Lightbody data not found' },
        { status: 404 }
      );
    }

    // Return specific practice by ID
    if (practice) {
      const practiceData = LIGHTBODY_PRACTICES.find((p) => p.id === practice);
      if (!practiceData) {
        return NextResponse.json(
          { success: false, error: 'Practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: practiceData });
    }

    // Return specific type of data
    if (searchType === 'levels') {
      return NextResponse.json({ success: true, data: LIGHTBODY_LEVELS });
    }
    if (searchType === 'frequencies') {
      return NextResponse.json({ success: true, data: LIGHTBODY_FREQUENCIES });
    }
    if (searchType === 'chakras') {
      return NextResponse.json({ success: true, data: LIGHTBODY_CHAKRAS });
    }
    if (searchType === 'practices') {
      return NextResponse.json({ success: true, data: LIGHTBODY_PRACTICES });
    }
    if (searchType === 'primary') {
      return NextResponse.json({ success: true, data: LIGHTBODY_DATA });
    }

    // Default: return all lightbody data
    return NextResponse.json({
      success: true,
      data: {
        lightbody: LIGHTBODY_DATA,
        levels: LIGHTBODY_LEVELS,
        frequencies: LIGHTBODY_FREQUENCIES,
        chakras: LIGHTBODY_CHAKRAS,
        practices: LIGHTBODY_PRACTICES,
      },
    });
  } catch (error) {
    console.error('Lightbody v2 API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
