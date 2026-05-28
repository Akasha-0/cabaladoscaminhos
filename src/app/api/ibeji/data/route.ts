// ============================================================
// IBEJI API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Ibeji data
// - Twin orixá of duality and divine children
// - Path of partnership and balance
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed Ibeji data for spiritual practice
const IBEJI_DATA = [
  {
    id: 'twin-spirit-meditation',
    name: 'Twin Spirit Meditation',
    namePt: 'Meditação do Espírito Gêmeo',
    description: 'A contemplative practice for connecting with the twin spirit of Ibeji',
    category: 'meditation',
    aspect: 'duality',
    level: 'intermediate',
    duration: '20-35 minutes',
    practice: 'connecting_with_twin_essence',
    elements: ['stillness', 'inner_balance', 'harmony'],
    benefits: ['partnership', 'harmony', 'twin_connection'],
    invocation: 'Ibeji, divine twins, guide me to balance and partnership',
  },
  {
    id: 'child-spirit-awakening',
    name: 'Child Spirit Awakening',
    namePt: 'Despertar do Espírito Criança',
    description: 'Reconnecting with the innocent child spirit within',
    category: 'practice',
    aspect: 'innocence',
    level: 'beginner',
    duration: '15-25 minutes',
    practice: 'reconnecting_with_joy',
    elements: ['playfulness', 'spontaneity', 'wonder'],
    benefits: ['joy', 'spontaneity', 'inner_peace'],
    invocation: 'Ibeji, keepers of innocence, help me remember the joy within',
  },
  {
    id: 'partnership-ritual',
    name: 'Sacred Partnership Ritual',
    namePt: 'Ritual de Parceria Sagrada',
    description: 'Ritual for strengthening partnerships and alliances',
    category: 'ritual',
    aspect: 'partnership',
    level: 'intermediate',
    duration: '25-40 minutes',
    practice: 'strengthening_bonds',
    elements: ['candles', 'sweet_foods', 'flowers', 'community'],
    bestTime: ['Saturday', 'any_twin_hour'],
    benefits: ['partnership', 'loyalty', 'mutual_support'],
    invocation: 'Ibeji, divine partners, bless and strengthen all my sacred alliances',
  },
  {
    id: 'balance-prayer',
    name: 'Prayer for Balance',
    namePt: 'Oração pelo Equilíbrio',
    description: 'Spiritual supplication for balance between dualities',
    category: 'prayer',
    aspect: 'balance',
    level: 'beginner',
    practice: 'balancing_dualities',
    elements: ['intention', 'devotion', 'harmony'],
    conditions: ['willingness_to_balance'],
    benefits: ['equilibrium', 'peace', 'wisdom'],
    invocation: 'Ibeji, masters of duality, grant me balance between all opposites',
  },
  {
    id: 'prosperity-blessing',
    name: 'Prosperity Blessing Practice',
    namePt: 'Prática de Bênção da Prosperidade',
    description: 'Attracting abundance through the gifts of Ibeji',
    category: 'practice',
    aspect: 'prosperity',
    level: 'beginner',
    duration: '15-30 minutes',
    practice: 'attracting_abundance',
    elements: ['sweet_foods', 'fruits', 'candies', 'joyful_intention'],
    benefits: ['abundance', 'prosperity', 'generosity'],
    invocation: 'Ibeji, bringers of sweetness, pour your blessings of abundance upon me',
  },
  {
    id: 'unity-meditation',
    name: 'Unity in Duality Meditation',
    namePt: 'Meditação da Unidade na Dualidade',
    description: 'Understanding that opposites are unified in the divine',
    category: 'meditation',
    aspect: 'unity',
    level: 'advanced',
    duration: '30-45 minutes',
    practice: 'embracing_unity',
    elements: ['deep_contemplation', 'breath_work', 'visualization'],
    benefits: ['wisdom', 'understanding', 'transcendence'],
    invocation: 'Ibeji, reveal to me the unity within all duality',
  },
  {
    id: 'protection-prayer',
    name: 'Protection for Children',
    namePt: 'Proteção para Crianças',
    description: 'Prayer for the protection and blessing of children',
    category: 'prayer',
    aspect: 'protection',
    level: 'beginner',
    practice: 'protecting_youth',
    elements: ['devotion', 'flowers', 'white_candles'],
    conditions: ['care_for_children'],
    benefits: ['protection', 'blessing', 'guidance'],
    invocation: 'Ibeji, guardians of children, protect and guide the young ones',
  },
  {
    id: 'joy-ritual',
    name: 'Ritual of Joy',
    namePt: 'Ritual da Alegria',
    description: 'Ritual for reclaiming joy and maintaining inner happiness',
    category: 'ritual',
    aspect: 'joy',
    level: 'beginner',
    duration: '20-30 minutes',
    practice: 'cultivating_joy',
    elements: ['music', 'dance', 'sweet_foods', 'bright_colors'],
    bestTime: ['Saturday', 'childrens_day'],
    benefits: ['joy', 'happiness', 'positive_outlook'],
    invocation: 'Ibeji, keepers of joy, fill my heart with eternal happiness',
  },
];

const IBEJI_OFFERINGS = [
  {
    id: 'candle-golden',
    name: 'Golden Candle',
    namePt: 'Vela Dourada',
    type: 'sacred',
    form: 'flame',
    significance: 'light representing divine twins and joy',
    timing: ['Saturday', 'twin_hours'],
    offeringPractice: 'light_candle_with_joyful_prayer',
  },
  {
    id: 'candle-white',
    name: 'White Candle',
    namePt: 'Vela Branca',
    type: 'sacred',
    form: 'flame',
    significance: 'purity and innocence of the divine children',
    timing: ['protection_rituals', 'childrens_blessing'],
    offeringPractice: 'light_for_protection',
  },
  {
    id: 'sweet-fruits',
    name: 'Sweet Fruits',
    namePt: 'Frutas Doces',
    type: 'food',
    form: 'solid',
    significance: 'sweets for the children Ibeji, especially tropical fruits',
    timing: ['prosperity_rituals', 'Saturday'],
    offeringPractice: 'offer_fruits_with_prayer',
  },
  {
    id: 'candy-milk',
    name: 'Milk Candy',
    namePt: 'Doce de Leite',
    type: 'food',
    form: 'solid',
    significance: 'sweet offering representing childhood sweetness',
    timing: ['any_devotional_moment'],
    offeringPractice: 'offer_sweets_while_praying',
  },
  {
    id: 'flowers-yellow',
    name: 'Yellow Flowers',
    namePt: 'Flores Amarelas',
    type: 'floral',
    form: 'living',
    significance: 'joy and sunshine associated with Ibeji',
    timing: ['joy_rituals', 'Saturday'],
    offeringPractice: 'arrange_flowers_with_love',
  },
  {
    id: 'flower-white',
    name: 'White Flowers',
    namePt: 'Flores Brancas',
    type: 'floral',
    form: 'living',
    significance: 'purity and innocence',
    timing: ['childrens_blessing', 'protection'],
    offeringPractice: 'offer_white_flowers',
  },
  {
    id: 'honey',
    name: 'Honey',
    namePt: 'Mel',
    type: 'food',
    form: 'liquid',
    significance: 'sweetness and joy of life',
    timing: ['prosperity', 'joy_rituals'],
    offeringPractice: 'offer_honey_with_prayer',
  },
  {
    id: 'seven-fruits',
    name: 'Seven Fruits',
    namePt: 'Sete Frutas',
    type: 'food',
    form: 'solid',
    significance: 'abundance and completeness',
    timing: ['prosperity_blessing', 'Saturday'],
    offeringPractice: 'offer_seven_different_fruits',
  },
];

const IBEJI_SYMBOLS = [
  {
    id: 'twin-stones',
    name: 'Twin Stones',
    namePt: 'Pedras Gêmeas',
    symbolism: 'representing the duality and partnership of Ibeji',
    usage: 'altar_decoration, meditation_focus',
  },
  {
    id: 'golden-crown',
    name: 'Golden Crown',
    namePt: 'Coroa Dourada',
    symbolism: 'royal status and divine nature of the twins',
    usage: 'ritual_headwear, altar_display',
  },
  {
    id: 'mirror',
    name: 'Mirror',
    namePt: 'Espelho',
    symbolism: 'reflection of unity within duality',
    usage: 'divination, self_reflection_practice',
  },
  {
    id: 'twin-dolls',
    name: 'Twin Dolls',
    namePt: 'Bonecas Gêmeas',
    symbolism: 'physical representation of Ibeji for worship',
    usage: 'altar_centerpiece, ritual_connection',
  },
  {
    id: 'sweets-bowl',
    name: 'Sweets Bowl',
    namePt: 'Pote de Doces',
    symbolism: 'offerings of joy and sweetness',
    usage: 'altar_container, offering_placement',
  },
  {
    id: 'twin-birds',
    name: 'Twin Birds',
    namePt: 'Pássaros Gêmeos',
    symbolism: 'freedom and joy of the spirit',
    usage: 'artwork, meditation_visualization',
  },
  {
    id: 'double-star',
    name: 'Double Star',
    namePt: 'Estrela Dupla',
    symbolism: 'celestial presence of the divine twins',
    usage: 'star_gazing, constellation_focus',
  },
  {
    id: 'flower-garland',
    name: 'Flower Garland',
    namePt: 'Guirlanda de Flores',
    symbolism: 'beauty, joy, and celebration',
    usage: 'altar_decoration, celebration',
  },
];

const IBEJI_MEDITATIONS = [
  {
    id: 'twin-visualization',
    name: 'Twin Soul Visualization',
    namePt: 'Visualização da Alma Gêmea',
    description: 'Visualize two flames within your heart, representing balance and partnership',
    duration: '15 minutes',
    technique: ['breathe_deeply', 'visualize_twin_flames', 'feel_balance', 'integrate_wholeness'],
  },
  {
    id: 'child-within',
    name: 'Connecting with the Child Within',
    namePt: 'Conexão com a Criança Interior',
    description: 'Return to innocence and joy through guided visualization',
    duration: '20 minutes',
    technique: ['center_yourself', 'invoke_innocence', 'play_like_child', 'embrace_joy'],
  },
  {
    id: 'partnership-blessing',
    name: 'Blessing of Sacred Partnership',
    namePt: 'Bênção da Parceria Sagrada',
    description: 'Meditation for blessing and strengthening partnerships',
    duration: '15 minutes',
    technique: ['call_for_ibeji', 'visualize_partner', 'share_energy', 'bind_with_love'],
  },
  {
    id: 'duality-embrace',
    name: 'Embracing Duality',
    namePt: 'Abraçando a Dualidade',
    description: 'Understanding opposites as complementary forces',
    duration: '20 minutes',
    technique: ['identify_dualities', 'see_complementarity', 'integrate_both_sides', 'find_balance'],
  },
  {
    id: 'prosperity-flow',
    name: 'Prosperity Flow Meditation',
    namePt: 'Meditação do Fluxo da Prosperidade',
    description: 'Attracting abundance through the energy of Ibeji',
    duration: '15 minutes',
    technique: ['open_heart', 'visualize_abundance', 'receive_blessings', 'express_gratitude'],
  },
];

// GET /api/ibeji/data - Get all Ibeji data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single type data
    if (type === 'practices') {
      return NextResponse.json(
        { data: IBEJI_DATA, count: IBEJI_DATA.length },
        { status: 200 }
      );
    }

    if (type === 'offerings') {
      return NextResponse.json(
        { data: IBEJI_OFFERINGS, count: IBEJI_OFFERINGS.length },
        { status: 200 }
      );
    }

    if (type === 'symbols') {
      return NextResponse.json(
        { data: IBEJI_SYMBOLS, count: IBEJI_SYMBOLS.length },
        { status: 200 }
      );
    }

    if (type === 'meditations') {
      return NextResponse.json(
        { data: IBEJI_MEDITATIONS, count: IBEJI_MEDITATIONS.length },
        { status: 200 }
      );
    }

    // Return all data by default
    return NextResponse.json(
      {
        data: {
          practices: IBEJI_DATA,
          offerings: IBEJI_OFFERINGS,
          symbols: IBEJI_SYMBOLS,
          meditations: IBEJI_MEDITATIONS,
        },
        count: {
          practices: IBEJI_DATA.length,
          offerings: IBEJI_OFFERINGS.length,
          symbols: IBEJI_SYMBOLS.length,
          meditations: IBEJI_MEDITATIONS.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve Ibeji data' },
      { status: 500 }
    );
  }
}