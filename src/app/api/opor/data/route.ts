// ============================================================
// OPOR API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Opor data
// - Spiritual gathering and collection practice
// - Integration of wisdom and transformation
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed Opor data for spiritual practice
const OPOR_DATA = [
  {
    id: 'collective-gathering-practice',
    name: 'Collective Gathering Practice',
    namePt: 'Prática de Reunião Coletiva',
    description: 'Sacred practice for gathering spiritual energies and harmonizing collective consciousness',
    category: 'practice',
    aspect: 'community',
    level: 'intermediate',
    duration: '30-45 minutes',
    practice: 'harmonic_gathering',
    elements: ['unity_circle', 'shared_intention', 'energy_merging'],
    benefits: ['collective_strength', 'shared_wisdom', 'unified_purpose'],
    invocation: 'Opor, gatherer of spirits, unite us in sacred harmony',
  },
  {
    id: 'wisdom-accumulation-meditation',
    name: 'Wisdom Accumulation Meditation',
    namePt: 'Meditação de Acumulação de Sabedoria',
    description: 'Meditative practice for gathering and integrating accumulated spiritual wisdom',
    category: 'meditation',
    aspect: 'wisdom',
    level: 'advanced',
    duration: '40-55 minutes',
    practice: 'wisdom_integration',
    elements: ['stillness', 'knowledge_drawing', 'inner_storehouse'],
    benefits: ['expanded_knowledge', 'deeper_understanding', 'wisdom_anchoring'],
    invocation: 'Opor, keeper of gathered wisdom, pour your knowledge into my being',
  },
  {
    id: 'energy-harmonization-ritual',
    name: 'Energy Harmonization Ritual',
    namePt: 'Ritual de Harmonização de Energia',
    description: 'Sacred ritual for harmonizing diverse spiritual energies into unified flow',
    category: 'ritual',
    aspect: 'harmony',
    level: 'intermediate',
    duration: '35-50 minutes',
    practice: 'energy_integration',
    elements: [' offerings', ' visualization', ' breath_work', ' ritual_circle'],
    bestTime: ['new moon', 'full moon'],
    benefits: ['energy_balance', 'harmonious_flow', 'unified_presence'],
    invocation: 'Opor, unifier of energies, bring harmony to all aspects of my being',
  },
  {
    id: 'transformation-gathering',
    name: 'Transformation Gathering',
    namePt: 'Reunião de Transformação',
    description: 'Practice for gathering the transformative power needed for personal evolution',
    category: 'practice',
    aspect: 'transformation',
    level: 'advanced',
    duration: '45-60 minutes',
    practice: 'transformation_collection',
    phases: ['releasing_old_patterns', 'gathering_new_energy', 'integration'],
    benefits: ['personal_evolution', 'energy_renewal', 'transformative_power'],
    invocation: 'Opor, collector of transformation, gather the power for my evolution',
  },
  {
    id: 'spiritual-abundance-practice',
    name: 'Spiritual Abundance Practice',
    namePt: 'Prática de Abundância Espiritual',
    description: 'Practice for gathering spiritual abundance and recognizing multiplied blessings',
    category: 'practice',
    aspect: 'abundance',
    level: 'beginner',
    duration: '20-30 minutes',
    practice: 'abundance_recognition',
    elements: ['gratitude', 'multiplication_awareness', 'blessing_reception'],
    benefits: ['abundance_mindset', 'blessing_recognition', 'spiritual_wealth'],
    invocation: 'Opor, gatherer of abundance, multiply my blessings and open my eyes to wealth',
  },
  {
    id: 'essence-combining-meditation',
    name: 'Essence Combining Meditation',
    namePt: 'Meditação de Combinação de Essências',
    description: 'Deep meditation for combining and harmonizing fragmented aspects of self',
    category: 'meditation',
    aspect: 'integration',
    level: 'advanced',
    duration: '50-70 minutes',
    practice: 'essence_unification',
    technique: ['identify_fragmented_parts', 'bring_together', 'harmonize', 'unified_whole'],
    benefits: ['wholeness', 'inner_unity', 'integrated_power'],
    invocation: 'Opor, unifier of essences, bring together all parts of my being',
  },
  {
    id: 'knowledge-gathering-prayer',
    name: 'Knowledge Gathering Prayer',
    namePt: 'Oração de Reunião de Conhecimento',
    description: 'Spiritual supplication for gathering knowledge from all directions',
    category: 'prayer',
    aspect: 'wisdom',
    level: 'beginner',
    practice: 'knowledge_invocation',
    elements: ['openness', 'receptivity', 'humble_asking'],
    conditions: ['willingness_to_learn', 'humble_spirit'],
    benefits: ['knowledge_expansion', 'wisdom_reception', 'learning_grace'],
    invocation: 'Opor, gatherer of all knowledge, bring wisdom from the four directions',
  },
  {
    id: 'multiplication-practice',
    name: 'Multiplication Practice',
    namePt: 'Prática de Multiplicação',
    description: 'Practice for multiplying spiritual gifts and blessings through gathered energy',
    category: 'practice',
    aspect: 'abundance',
    level: 'intermediate',
    duration: '25-40 minutes',
    practice: 'energy_multiplication',
    technique: ['gather_initial_energy', 'amplify_through_intention', 'multiply_blessings', 'distribute_gracefully'],
    benefits: ['multiplied_gifts', 'increased_blessings', 'generosity_expansion'],
    invocation: 'Opor, multiplier of gifts, expand what I have received to bless many',
  },
];

const OPOR_OFFERINGS = [
  {
    id: 'candle-golden',
    name: 'Golden Candle',
    namePt: 'Vela Dourada',
    type: 'sacred',
    form: 'flame',
    significance: 'light for gathering and multiplying energies',
    timing: ['gathering rituals', 'abundance work'],
    offeringPractice: 'light_candle_with_gathering_intention',
  },
  {
    id: 'honey-sweet-offering',
    name: 'Sweet Honey Offering',
    namePt: 'Oferta de Mel Doce',
    type: 'food',
    form: 'sweet',
    significance: 'sweetness for attracting and gathering positive energies',
    offeringPractice: 'offer_honey_with_multiplication_prayer',
  },
  {
    id: 'incense-frankincense',
    name: 'Frankincense Incense',
    namePt: 'Incenso de Olibano',
    type: 'aromatic',
    form: 'smoke',
    significance: 'sacred smoke for spiritual gathering and elevation',
    offeringPractice: 'burn_incense_during_gathering_meditation',
  },
  {
    id: 'amber-crystal',
    name: 'Amber Crystal',
    namePt: 'Cristal de Âmbar',
    type: 'mineral',
    form: 'stone',
    significance: 'energy attraction and multiplication crystal',
    offeringPractice: 'hold_crystal_during_practice_for_attraction',
  },
  {
    id: 'corn-cobs',
    name: 'Corn Cobs',
    namePt: 'Espigas de Milho',
    type: 'nature',
    form: 'vegetation',
    significance: 'multiplication and harvest symbolism',
    offeringPractice: 'offer_corn_as_symbol_of_growth_and_abundance',
  },
];

const OPOR_SYMBOLS = [
  {
    id: 'gathered_light',
    name: 'Gathered Light',
    namePt: 'Luz Reunida',
    meaning: 'accumulated spiritual light and wisdom',
    element: 'illumination',
  },
  {
    id: 'unified_circle',
    name: 'Unified Circle',
    namePt: 'Círculo Unificado',
    meaning: 'collective harmony and unified purpose',
    element: 'community',
  },
  {
    id: 'multiplied_spark',
    name: 'Multiplied Spark',
    namePt: 'Centelha Multiplicada',
    meaning: 'energy multiplication and blessing expansion',
    element: 'abundance',
  },
  {
    id: 'harmonized_elements',
    name: 'Harmonized Elements',
    namePt: 'Elementos Harmonizados',
    meaning: 'diverse energies unified in harmony',
    element: 'integration',
  },
  {
    id: 'sacred_vessel',
    name: 'Sacred Vessel',
    namePt: 'Vaso Sagrado',
    meaning: 'container for gathered spiritual wisdom',
    element: 'wisdom',
  },
];

const OPOR_MEDITATIONS = [
  {
    id: 'gathering_the_great_light',
    name: 'Gathering the Great Light',
    namePt: 'Reunindo a Grande Luz',
    description: 'Deep meditation for gathering light from all directions of existence',
    duration: '45 minutes',
    technique: ['center_in_stillness', 'open_to_four_directions', 'draw_light_inward', 'hold_gathered_luminescence'],
    warnings: ['intense spiritual brightness'],
  },
  {
    id: 'essence_unification_process',
    name: 'Essence Unification Process',
    namePt: 'Processo de Unificação da Essência',
    description: 'Meditation for combining fragmented parts of self into unified whole',
    duration: '50 minutes',
    technique: ['identify_scattered_parts', 'call_them_together', 'harmonize_energies', 'integrate_into_whole'],
    warnings: ['emotional intensity during integration'],
  },
  {
    id: 'abundance_multiplication',
    name: 'Abundance Multiplication',
    namePt: 'Multiplicação da Abundância',
    description: 'Practice for multiplying and expanding spiritual and material abundance',
    duration: '35 minutes',
    technique: ['receive_initial_blessing', 'amplify_through_intention', 'multiply_in_all_directions', 'share_with_gratitude'],
    warnings: ['generosity required'],
  },
];

// GET /api/opor/data - Get all Opor data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single type data
    if (type === 'practices') {
      return NextResponse.json({
        success: true,
        data: OPOR_DATA,
        meta: { type: 'practices', count: OPOR_DATA.length }
      });
    }

    if (type === 'offerings') {
      return NextResponse.json({
        success: true,
        data: OPOR_OFFERINGS,
        meta: { type: 'offerings', count: OPOR_OFFERINGS.length }
      });
    }

    if (type === 'symbols') {
      return NextResponse.json({
        success: true,
        data: OPOR_SYMBOLS,
        meta: { type: 'symbols', count: OPOR_SYMBOLS.length }
      });
    }

    if (type === 'meditations') {
      return NextResponse.json({
        success: true,
        data: OPOR_MEDITATIONS,
        meta: { type: 'meditations', count: OPOR_MEDITATIONS.length }
      });
    }

    // Return all data by default
    return NextResponse.json({
      success: true,
      data: {
        practices: OPOR_DATA,
        offerings: OPOR_OFFERINGS,
        symbols: OPOR_SYMBOLS,
        meditations: OPOR_MEDITATIONS,
      },
      meta: {
        type: 'all',
        counts: {
          practices: OPOR_DATA.length,
          offerings: OPOR_OFFERINGS.length,
          symbols: OPOR_SYMBOLS.length,
          meditations: OPOR_MEDITATIONS.length,
        }
      }
    });

  } catch (error) {
    console.error('Opor API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve Opor data' },
      { status: 500 }
    );
  }
}