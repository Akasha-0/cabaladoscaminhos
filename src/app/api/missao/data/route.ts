// ============================================================
// MISSAO API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Missao data
// - Life purpose and spiritual mission
// - Cosmic direction and soul calling
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed Missao data for spiritual practice
const MISSAO_DATA = [
  {
    id: 'life-purpose-meditation',
    name: 'Life Purpose Meditation',
    namePt: 'Meditação do Propósito de Vida',
    description: 'Contemplative practice for discovering and aligning with your soul mission',
    category: 'meditation',
    aspect: 'purpose',
    level: 'intermediate',
    duration: '30-45 minutes',
    practice: 'discovering_soul_mission',
    elements: ['inner_listening', 'silence', 'intuition'],
    benefits: ['clarity', 'direction', 'alignment'],
    invocation: 'Missao, guide of my soul path, reveal my true purpose',
  },
  {
    id: 'soul-calling-practice',
    name: 'Soul Calling Practice',
    namePt: 'Prática do Chamado da Alma',
    description: 'Practice for connecting with your highest soul calling',
    category: 'practice',
    aspect: 'calling',
    level: 'advanced',
    duration: '40-60 minutes',
    practice: 'hearing_soul_whispers',
    elements: ['deep_contemplation', 'heart_opening', 'divine_reception'],
    benefits: ['purpose_clarity', 'soul_alignment', 'mission_clarity'],
    invocation: 'Missao, voice of my soul, speak your truth through me',
  },
  {
    id: 'divine-mission-ritual',
    name: 'Divine Mission Ritual',
    namePt: 'Ritual da Missão Divina',
    description: 'Sacred ritual for dedicating your life to divine purpose',
    category: 'ritual',
    aspect: 'mission',
    level: 'intermediate',
    duration: '30-45 minutes',
    practice: 'consecrating_life_purpose',
    elements: ['altar', 'candle', 'written_intention', 'sacred_space'],
    bestTime: ['new_moon', 'personal_anniversary'],
    benefits: [' consecrated_direction', 'divine_support', 'soul_fulfillment'],
    invocation: 'Missao, consecractor of purpose, bless my sacred mission',
  },
  {
    id: 'cosmic-destiny-prayer',
    name: 'Prayer for Cosmic Destiny',
    namePt: 'Oração pelo Destino Cósmico',
    description: 'Spiritual supplication for alignment with cosmic destiny',
    category: 'prayer',
    aspect: 'destiny',
    level: 'beginner',
    practice: 'aligning_with_cosmic_plan',
    elements: ['surrender', 'faith', 'trust_in_universe'],
    conditions: ['openness_to_change', 'release_of_ego'],
    benefits: ['destined_path', 'cosmic_support', 'soul_fulfillment'],
    invocation: 'Missao, weaver of destiny, guide me to my cosmic calling',
  },
  {
    id: 'sacred-contract-meditation',
    name: 'Sacred Contract Meditation',
    namePt: 'Meditação do Contrato Sagrado',
    description: 'Meditation for accessing your soul agreements and sacred commitments',
    category: 'meditation',
    aspect: 'contract',
    level: 'advanced',
    duration: '35-50 minutes',
    practice: 'remembering_soul_agreements',
    technique: ['deep_relaxation', 'past_life_recall', 'soul_memory', 'recommitment'],
    benefits: ['soul_memory', 'life_purpose', 'karmic_direction'],
    invocation: 'Missao, keeper of soul contracts, help me remember my sacred vows',
  },
];

const MISSAO_OFFERINGS = [
  {
    id: 'candle-gold-white',
    name: 'Gold and White Candle',
    namePt: 'Vela Dourada e Branca',
    type: 'sacred',
    form: 'flame',
    significance: 'represents divine purpose and soul light',
    timing: ['purpose_work', 'soul_connection'],
    offeringPractice: 'light_candles_while_focusing_on_life_purpose',
  },
  {
    id: 'incense-lavender',
    name: 'Lavender Incense',
    namePt: 'Incenso de Lavanda',
    type: 'sacred',
    form: 'smoke',
    significance: 'opens intuition for hearing soul guidance',
    timing: ['meditation', 'contemplation'],
    offeringPractice: 'burn_incense_during_purpose_meditation',
  },
  {
    id: 'amethyst-crystal',
    name: 'Amethyst Crystal',
    namePt: 'Cristal de Ametista',
    type: 'sacred_object',
    form: 'crystal',
    significance: 'enhances spiritual connection and divine guidance',
    timing: ['intuitive_work', 'soul_exploration'],
    offeringPractice: 'hold_or_place_crystal_during_contemplation',
  },
  {
    id: 'written-declaration',
    name: 'Written Declaration of Purpose',
    namePt: 'Declaração Escrita de Propósito',
    type: 'symbolic',
    form: 'writing',
    significance: 'physically manifests your soul mission',
    timing: ['new_beginnings', 'commitment_moments'],
    offeringPractice: 'write_your_purpose_and_place_at_sacred_space',
  },
  {
    id: 'rose-quartz-heart',
    name: 'Rose Quartz Heart',
    namePt: 'Coração de Quartzo Rosa',
    type: 'offering',
    form: 'heart_stone',
    significance: 'opens heart to loving service and soul purpose',
    timing: ['heart_work', 'service_dedication'],
    offeringPractice: 'hold_heart_stone_while_dedicating_to_service',
  },
];

const MISSAO_SYMBOLS = [
  {
    id: 'compass-soul',
    name: 'Soul Compass',
    namePt: 'Bússola da Alma',
    description: 'Symbol of inner direction and spiritual navigation',
    meaning: 'inner_truth_and_direction',
    usage: ['meditation_focus', 'purpose_art', 'intention_setting'],
  },
  {
    id: 'path-way',
    name: 'Sacred Path',
    namePt: 'Caminho Sagrado',
    description: 'Symbol of the illuminated spiritual journey',
    meaning: 'Divine_Guidance_and_Purpose',
    usage: ['visualization', 'intention_art', 'soul_journey'],
  },
  {
    id: 'flaming-heart',
    name: 'Flaming Heart',
    namePt: 'Coração Flamante',
    description: 'Symbol of passionate purpose and soul fire',
    meaning: 'living_purpose_and_passion',
    usage: ['devotion', 'heart_work', 'mission_art'],
  },
  {
    id: 'crown-light',
    name: 'Crown of Light',
    namePt: 'Coroa de Luz',
    description: 'Symbol of Connection to divine mission',
    meaning: 'Divine_Empowerment_and_Calling',
    usage: ['initiation', 'dedication', 'coronation_rituals'],
  },
  {
    id: 'star-guidance',
    name: 'Guiding Star',
    namePt: 'Estrela Guia',
    description: 'Symbol of celestial direction and cosmic alignment',
    meaning: 'Divine_Purpose_and_Destination',
    usage: ['navigation', 'celestial_work', 'star_meditation'],
  },
];

const MISSAO_MEDITATIONS = [
  {
    id: 'purpose-meditation',
    name: 'Purpose Discovery Meditation',
    namePt: 'Meditação de Descoberta do Propósito',
    description: 'Practice for uncovering your deepest life purpose',
    duration: '35 minutes',
    technique: ['settle_into_silence', 'ask_soul_question', 'receive_impressions', 'journal_insights'],
  },
  {
    id: 'mission-meditation',
    name: 'Divine Mission Meditation',
    namePt: 'Meditação da Missão Divina',
    description: 'Practice for connecting with your divine life mission',
    duration: '40 minutes',
    technique: ['center_on_purpose', 'open_to_divine_revelation', 'receive_mission', 'consecrate_it'],
  },
  {
    id: 'destiny-meditation',
    name: 'Cosmic Destiny Meditation',
    namePt: 'Meditação do Destino Cósmico',
    description: 'Practice for aligning with your highest destiny',
    duration: '30 minutes',
    technique: ['release_expectations', 'open_to_largest_plan', 'feel_cosmic_flow', 'surrender_to_path'],
  },
];

// GET /api/missao/data - Get all Missao data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single type data
    if (type === 'practices') {
      return NextResponse.json(
        { data: MISSAO_DATA, count: MISSAO_DATA.length },
        { status: 200 }
      );
    }

    if (type === 'offerings') {
      return NextResponse.json(
        { data: MISSAO_OFFERINGS, count: MISSAO_OFFERINGS.length },
        { status: 200 }
      );
    }

    if (type === 'symbols') {
      return NextResponse.json(
        { data: MISSAO_SYMBOLS, count: MISSAO_SYMBOLS.length },
        { status: 200 }
      );
    }

    if (type === 'meditations') {
      return NextResponse.json(
        { data: MISSAO_MEDITATIONS, count: MISSAO_MEDITATIONS.length },
        { status: 200 }
      );
    }

    if (type === 'config') {
      return NextResponse.json({
        name: 'Missao',
        odu: 'missao',
        description: 'Life purpose, spiritual mission, cosmic destiny and soul calling',
        aspect: 'destiny_and_purpose',
        type: 'concept',
      });
    }

    // Default — return all Missao data
    return NextResponse.json(
      {
        data: {
          config: {
            name: 'Missao',
            odu: 'missao',
            description: 'Life purpose, spiritual mission, cosmic destiny and soul calling',
            aspect: 'destiny_and_purpose',
            type: 'concept',
          },
          practices: MISSAO_DATA,
          offerings: MISSAO_OFFERINGS,
          symbols: MISSAO_SYMBOLS,
          meditations: MISSAO_MEDITATIONS,
        },
        count: {
          practices: MISSAO_DATA.length,
          offerings: MISSAO_OFFERINGS.length,
          symbols: MISSAO_SYMBOLS.length,
          meditations: MISSAO_MEDITATIONS.length,
        },
      },
      { status: 200 }
    );
  } catch (_error) {
    console.error('Missao API Error:', _error);
    return NextResponse.json(
      { error: 'Failed to retrieve Missao data' },
      { status: 500 }
    );
  }
}
