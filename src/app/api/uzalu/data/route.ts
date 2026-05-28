// ============================================================
// UZALU API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Uzalu data
// - Spiritual practice and guidance
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed Uzalu data for spiritual practice
const UZALU_DATA = [
  {
    id: 'wisdom-practice',
    name: 'Wisdom Practice',
    namePt: 'Prática de Sabedoria',
    description: 'A contemplative practice for cultivating inner wisdom and discernment',
    category: 'meditation',
    aspect: 'wisdom',
    level: 'intermediate',
    duration: '15-30 minutes',
    practice: 'inner_knowledge',
    elements: ['stillness', 'introspection', 'discernment'],
    benefits: ['clarity', 'wisdom', 'inner_peace'],
    invocation: 'Uzalu, source of wisdom, guide my understanding',
  },
  {
    id: 'ancestral-connection',
    name: 'Ancestral Connection',
    namePt: 'Conexão Ancestral',
    description: 'Working with the wisdom of ancestors for guidance and healing',
    category: 'practice',
    aspect: 'ancestry',
    level: 'intermediate',
    duration: '20-35 minutes',
    practice: 'connecting_with_ancestors',
    elements: ['gratitude', 'reverence', 'listening'],
    benefits: ['guidance', 'healing', 'lineage_strength'],
    invocation: 'Uzalu, keeper of ancestral wisdom, open the channel',
  },
  {
    id: 'divination-ritual',
    name: 'Divination Ritual',
    namePt: 'Ritual de Divinação',
    description: 'Sacred ritual for seeking divine guidance through spiritual practices',
    category: 'ritual',
    aspect: 'divination',
    level: 'advanced',
    duration: '30-45 minutes',
    practice: 'seeking_divine_guidance',
    elements: ['altar preparation', 'offerings', 'consultation', 'interpretation'],
    bestTime: ['dawn', 'dusk', 'quiet_moments'],
    benefits: ['clarity', 'guidance', 'aligned_decisions'],
    invocation: 'Uzalu, oracle of truth, reveal the hidden paths',
  },
  {
    id: 'protection-prayer',
    name: 'Protection Prayer',
    namePt: 'Oração de Proteção',
    description: 'Spiritual supplication for protection and spiritual shielding',
    category: 'prayer',
    aspect: 'protection',
    level: 'beginner',
    practice: 'spiritual_shielding',
    elements: ['intention', 'invocation', 'visualization'],
    conditions: ['clarity_of_purpose', 'sincerity_of_heart'],
    benefits: ['protection', 'shielding', 'spiritual_security'],
    invocation: 'Uzalu, guardian of light, shield my path',
  },
  {
    id: 'healing-meditation',
    name: 'Healing Meditation',
    namePt: 'Meditação de Cura',
    description: 'Meditative practice for healing on physical, emotional, and spiritual levels',
    category: 'meditation',
    aspect: 'healing',
    level: 'intermediate',
    duration: '25-40 minutes',
    practice: 'spiritual_healing',
    phases: ['acknowledgment', 'release', 'renewal', 'integration'],
    benefits: ['wholeness', 'restoration', 'vitality'],
    invocation: 'Uzalu, source of healing light, restore my balance',
  },
  {
    id: 'guidance-meditation',
    name: 'Guidance Meditation',
    namePt: 'Meditação de Orientação',
    description: 'Meditative practice for receiving spiritual guidance on life decisions',
    category: 'meditation',
    aspect: 'guidance',
    level: 'intermediate',
    duration: '20-30 minutes',
    practice: 'receiving_divine_guidance',
    technique: ['center_yourself', 'ask_clear_question', 'open_to_answer', 'trust_the_download'],
    benefits: ['clarity', 'confidence', 'aligned_action'],
    invocation: 'Uzalu, voice of wisdom, speak through my heart',
  },
  {
    id: 'shadow-work-practice',
    name: 'Shadow Work Practice',
    namePt: 'Prática de Trabalho com a Sombra',
    description: 'Practice for confronting and integrating shadow aspects',
    category: 'practice',
    aspect: 'shadow',
    level: 'advanced',
    duration: '45-60 minutes',
    practice: 'shadow_integration',
    elements: ['honest_self_examination', 'witnessing', 'compassionate_acceptance'],
    phases: ['identification', 'acknowledgment', 'integration'],
    benefits: ['wholeness', 'authentic_power', 'inner_peace'],
    invocation: 'Uzalu, illuminator of shadows, help me see and embrace all I am',
  },
  {
    id: 'ceremony-blessing',
    name: 'Ceremony of Blessing',
    namePt: 'Cerimônia de Bênção',
    description: 'Sacred ceremony for blessing intentions, spaces, or life transitions',
    category: 'ritual',
    aspect: 'blessing',
    level: 'beginner',
    duration: '15-25 minutes',
    practice: 'setting_sacred_intention',
    elements: ['purification', 'invocation', 'intention_setting', 'gratitude'],
    occasions: ['new_beginnings', 'life_transitions', 'space_cleansing'],
    benefits: ['sacred_space', 'divine_blessing', 'purpose_clarification'],
    invocation: 'Uzalu, blesser of paths, sanctify this intention',
  },
];

const UZALU_OFFERINGS = [
  {
    id: 'white_candle',
    name: 'White Candle',
    namePt: 'Vela Branca',
    type: 'light',
    form: 'candle',
    significance: 'light for wisdom and purity',
    timing: ['daily practice', 'divination', 'guidance seeking'],
    offeringPractice: 'light_white_candle_during_meditation_with_intention',
  },
  {
    id: 'clean_water',
    name: 'Pure Water',
    namePt: 'Água Pura',
    type: 'beverage',
    form: 'liquid',
    significance: 'purification and clarity',
    offeringPractice: 'offer_clean_water_at_altar_with_gratitude',
  },
  {
    id: 'flowers_white',
    name: 'White Flowers',
    namePt: 'Flores Brancas',
    type: 'botanical',
    form: 'fresh_flowers',
    significance: 'beauty and spiritual offering',
    offeringPractice: 'place_white_flowers_at_sacred_space',
  },
  {
    id: 'incense',
    name: 'Sacred Incense',
    namePt: 'Incenso Sagrado',
    type: 'aromatic',
    form: 'burning',
    significance: 'purification and spiritual elevation',
    offeringPractice: 'burn_incense_during_ritual_with_prayer',
  },
  {
    id: 'honey',
    name: 'Honey',
    namePt: 'Mel',
    type: 'food',
    form: 'sweet',
    significance: 'sweetness for blessings',
    offeringPractice: 'offer_small_amount_of_honey_with_gratitude',
  },
];

const UZALU_SYMBOLS = [
  {
    id: 'eye',
    name: 'Eye',
    namePt: 'Olho',
    meaning: 'the all-seeing eye of wisdom and discernment',
    significance: 'inner vision, spiritual insight, clarity',
  },
  {
    id: 'spiral',
    name: 'Spiral',
    namePt: 'Espiral',
    meaning: 'the journey inward to wisdom',
    significance: 'transformation, evolution, seeking truth',
  },
  {
    id: 'light',
    name: 'Light',
    namePt: 'Luz',
    meaning: 'illumination and spiritual truth',
    significance: 'wisdom, guidance, inner light',
  },
  {
    id: 'book',
    name: 'Book of Knowledge',
    namePt: 'Livro do Conhecimento',
    meaning: 'recorded wisdom and ancient knowledge',
    significance: 'learning, study, spiritual education',
  },
  {
    id: 'mirror',
    name: 'Mirror',
    namePt: 'Espelho',
    meaning: 'reflection of truth and self',
    significance: 'self-knowledge, authenticity, inner truth',
  },
  {
    id: 'star',
    name: 'Guiding Star',
    namePt: 'Estrela Guiadora',
    meaning: 'celestial guidance and direction',
    significance: 'navigation, destiny, purpose',
  },
];

const UZALU_MEDITATIONS = [
  {
    id: 'wisdom-eye-meditation',
    name: 'Eye of Wisdom Meditation',
    namePt: 'Meditação do Olho da Sabedoria',
    type: 'guided',
    duration: '15-20 minutes',
    practice: 'visualize_inner_eye_opening',
    steps: [
      'center_yourself_in_silence',
      'visualize_light_gathering_at_third_eye',
      'feel_the_eye_opening_gradually',
      'ask_for_wisdom_on_specific_matter',
      'receive_insight_or_download',
      'ground_and_integrate_the_wisdom',
    ],
    benefits: ['inner_vision', 'discernment', 'clarity'],
  },
  {
    id: 'ancestor-connection-breath',
    name: 'Ancestor Connection Breath',
    namePt: 'Respiração de Conexão Ancestral',
    type: 'pranayama',
    duration: '10-15 minutes',
    practice: 'breathing_with_ancestral_intention',
    technique: [
      'sit_in_comfortable_position',
      'call_mind_to_ancestors_with_love',
      'inhale_deeply_visualizing_connection_line',
      'hold_breath_as_connection_forms',
      'exhale_releasing_any_blockages',
      'repeat_with_reverence_and_openness',
    ],
    benefits: ['lineage_strength', 'ancestral_guidance', 'healing'],
  },
  {
    id: 'light-body-activation',
    name: 'Light Body Activation',
    namePt: 'Ativação do Corpo de Luz',
    type: 'guided',
    duration: '20-30 minutes',
    practice: 'activating_spiritual_light_body',
    technique: [
      'ground_and_center',
      'visualize_white_light_entering_from_above',
      'feel_light_filling_crown_chakra',
      'allow_light_to_descend_through_all_chakras',
      '感受_light_integrating_with_physical_body',
      'invoke_Uzalu_for_blessing_and_activation',
    ],
    benefits: ['light_integration', 'spiritual_strength', 'illumination'],
  },
];

// GET /api/uzalu/data - Get all Uzalu data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const aspect = searchParams.get('aspect');

    if (!type && !aspect) {
      return NextResponse.json(
        {
          success: true,
          data: {
            uzalu: {
              name: 'Uzalu',
              domain: ['wisdom', 'guidance', 'ancestry', 'healing'],
              description:
                'Uzalu is a spiritual guide representing wisdom, ancestral connection, and divine guidance. Through meditation, ritual, and practice, one can connect with this energy for healing, protection, and spiritual illumination.',
              practices: UZALU_DATA,
              offerings: UZALU_OFFERINGS,
              symbols: UZALU_SYMBOLS,
              meditations: UZALU_MEDITATIONS,
            },
          },
        },
        { status: 200 }
      );
    }

    // Filter by type
    if (type) {
      switch (type) {
        case 'practices':
          return NextResponse.json({ success: true, data: UZALU_DATA }, { status: 200 });
        case 'offerings':
          return NextResponse.json({ success: true, data: UZALU_OFFERINGS }, { status: 200 });
        case 'symbols':
          return NextResponse.json({ success: true, data: UZALU_SYMBOLS }, { status: 200 });
        case 'meditations':
          return NextResponse.json({ success: true, data: UZALU_MEDITATIONS }, { status: 200 });
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid type. Valid types: practices, offerings, symbols, meditations' },
            { status: 400 }
          );
      }
    }

    // Filter by aspect
    if (aspect) {
      const validAspects = ['wisdom', 'ancestry', 'divination', 'protection', 'healing', 'guidance', 'shadow', 'blessing'];
      if (!validAspects.includes(aspect)) {
        return NextResponse.json(
          { success: false, error: `Invalid aspect. Valid aspects: ${validAspects.join(', ')}` },
          { status: 400 }
        );
      }

      const filteredPractices = UZALU_DATA.filter((p) => p.aspect === aspect);
      const filteredMeditations = UZALU_MEDITATIONS.filter((m) => m.id.includes(aspect));

      return NextResponse.json(
        {
          success: true,
          data: {
            aspect,
            practices: filteredPractices,
            meditations: filteredMeditations,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Provide either type or aspect query parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Uzalu data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}