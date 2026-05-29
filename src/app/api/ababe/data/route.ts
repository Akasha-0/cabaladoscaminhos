// ============================================================
// ABABE API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Ababe data
// - Orixá of hidden truths and spiritual perception
// - Spiritual practice and guidance for unveiling essence
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed Ababe data for spiritual practice
const ABABE_DATA = [
  {
    id: 'inner-truth-meditation',
    name: 'Inner Truth Meditation',
    namePt: 'Meditação da Verdade Interior',
    description: 'A contemplative practice for unveiling the hidden self and discovering authentic essence',
    category: 'meditation',
    aspect: 'truth',
    level: 'intermediate',
    duration: '20-35 minutes',
    practice: 'consciousness_of_essence',
    elements: ['stillness', 'inner_listening', 'surrender'],
    benefits: ['authenticity', 'self_knowledge', 'inner_clarity'],
    invocation: 'Ababe, revealer of hidden truths, show me what I truly am',
  },
  {
    id: 'essence-revelation',
    name: 'Essence Revelation Practice',
    namePt: 'Prática de Revelação da Essência',
    description: 'Working to uncover the core self beneath layers of conditioning and masks',
    category: 'practice',
    aspect: 'essence',
    level: 'advanced',
    duration: '30-45 minutes',
    practice: 'removing_masks',
    elements: ['inner journey', 'truth confrontation', 'acceptance'],
    benefits: ['wholeness', 'integration', 'authentic_power'],
    invocation: 'Ababe, remover of masks, help me see my true self',
  },
  {
    id: 'spiritual-perception-ritual',
    name: 'Spiritual Perception Ritual',
    namePt: 'Ritual de Percepção Espiritual',
    description: 'Sacred ritual for awakening inner sight and deepening spiritual perception',
    category: 'ritual',
    aspect: 'perception',
    level: 'intermediate',
    duration: '25-40 minutes',
    practice: 'awakening_inner_sight',
    elements: [' offerings', ' candles', ' visualization', ' ritual circle'],
    bestTime: ['twilight', 'dawn'],
    benefits: ['clarity', 'spiritual_vision', 'deeper_understanding'],
    invocation: 'Ababe, opener of hidden eyes, grant me spiritual sight',
  },
  {
    id: 'truth-prayer',
    name: 'Prayer for Truth',
    namePt: 'Oração pela Verdade',
    description: 'Spiritual supplication for the courage to face and accept truth',
    category: 'prayer',
    aspect: 'truth',
    level: 'beginner',
    practice: 'courage_and_honesty',
    elements: [' intention', ' humility', ' openness_to_truth'],
    conditions: ['willingness_to_face_truth', 'acceptance_of_what_is'],
    benefits: ['courage', 'honesty', 'liberation'],
    invocation: 'Ababe, keeper of truths, give me courage to see and accept',
  },
  {
    id: 'hidden-self-integration',
    name: 'Hidden Self Integration',
    namePt: 'Integração do Eu Oculto',
    description: 'Integrating suppressed and hidden aspects of self for wholeness',
    category: 'meditation',
    aspect: 'essence',
    level: 'advanced',
    duration: '45-60 minutes',
    practice: 'bringing_light_to_shadows',
    phases: ['shadow identification', 'truth recognition', 'integration'],
    benefits: ['wholeness', 'inner_peace', 'authentic_presence'],
    invocation: 'Ababe, weaver of hidden truths, help me embrace all I am',
  },
  {
    id: 'perception-clearing-meditation',
    name: 'Perception Clearing Meditation',
    namePt: 'Meditação de Desobstrução da Percepção',
    description: 'Meditative practice for clearing inner barriers to true perception',
    category: 'meditation',
    aspect: 'perception',
    level: 'intermediate',
    duration: '20-30 minutes',
    practice: 'clearing_inner_eyes',
    technique: ['sit_in_stillness', 'breathe_deeply', 'release_barriers', 'open_to_truth'],
    benefits: ['clarity', 'discernment', 'pure_awareness'],
    invocation: 'Ababe, clearer of perception, remove what obstructs my sight',
  },
  {
    id: 'essence-blessing',
    name: 'Essence Blessing',
    namePt: 'Bênção da Essência',
    description: 'Ceremony to honor and bless the authentic self',
    category: 'ritual',
    aspect: 'essence',
    level: 'beginner',
    duration: '15-25 minutes',
    practice: 'honoring_self',
    elements: [' gratitude for authentic self', ' acknowledgment_of_hidden_gifts', ' intention_to_remain_true'],
    occasions: ['new beginning', 'identity transition', 'self-discovery'],
    benefits: ['self-acceptance', 'authentic living', 'inner_peace'],
    invocation: 'Ababe, blesser of essence, honor the truth of my being',
  },
  {
    id: 'veils-removal-meditation',
    name: 'Veils Removal Meditation',
    namePt: 'Meditação da Removedora de Véus',
    description: 'Sitting with illusions until truth emerges from beneath',
    category: 'meditation',
    aspect: 'truth',
    level: 'intermediate',
    duration: '25-35 minutes',
    practice: 'releasing_illusions',
    technique: ['identify_veils', 'sit_with_truth', 'breathe_through_revelation', 'acceptance'],
    benefits: ['wisdom', 'discernment', 'liberation'],
    invocation: 'Ababe, remover of veils, reveal what lies beneath',
  },
];

const ABABE_OFFERINGS = [
  {
    id: 'candle-white',
    name: 'White Candle',
    namePt: 'Vela Branca',
    type: 'sacred',
    form: 'flame',
    significance: 'light for illuminating truth',
    timing: ['truth revealing moments', 'inner work'],
    offeringPractice: 'light_candle_while_stating_intention',
  },
  {
    id: 'honey',
    name: 'Honey',
    namePt: 'Mel',
    type: 'food',
    form: 'sweet',
    significance: 'sweetness for inner truth',
    offeringPractice: 'offer_honey_with_humility',
  },
  {
    id: 'incense-myrh',
    name: 'Myrrh Incense',
    namePt: 'Incenso de Mirra',
    type: 'aromatic',
    form: 'smoke',
    significance: 'purifying smoke for spiritual perception',
    offeringPractice: 'burn_incense_during_meditation',
  },
  {
    id: 'clear_quartz',
    name: 'Clear Quartz',
    namePt: 'Quartzo Cristal',
    type: 'mineral',
    form: 'stone',
    significance: 'clarity crystal for perception',
    offeringPractice: 'place_crystal_during_practice',
  },
  {
    id: 'mirror',
    name: 'Small Mirror',
    namePt: 'Espelho Pequeno',
    type: 'symbolic',
    form: 'reflective',
    significance: 'reflection of inner truth',
    offeringPractice: 'use_in_ritual_for_self-reflection',
  },
];

const ABABE_SYMBOLS = [
  {
    id: 'open_eye',
    name: 'Open Eye',
    namePt: 'Olho Aberto',
    meaning: 'spiritual perception and truth revelation',
    element: 'sight',
  },
  {
    id: 'unveiled_face',
    name: 'Unveiled Face',
    namePt: 'Rosto Desvelado',
    meaning: 'authentic self without masks',
    element: 'identity',
  },
  {
    id: 'revealed_heart',
    name: 'Revealed Heart',
    namePt: 'Coração Revelado',
    meaning: 'innermost truth and essence',
    element: 'truth',
  },
  {
    id: 'key',
    name: 'Key',
    namePt: 'Chave',
    meaning: 'unlocking hidden knowledge',
    element: 'wisdom',
  },
  {
    id: 'veil',
    name: 'Lifting Veil',
    namePt: ' Véu Levantando',
    meaning: 'removal of illusion to reveal truth',
    element: 'clarity',
  },
];

const ABABE_MEDITATIONS = [
  {
    id: 'essence_journey',
    name: 'Journey to the Core',
    namePt: 'Jornada ao Centro',
    description: 'Deep meditation traveling inward to discover authentic essence',
    duration: '45 minutes',
    technique: ['settle_into_stillness', 'travel_inward', 'pass_through_layers', 'rest_in_essence'],
    warnings: ['intensity of self-confrontation'],
  },
  {
    id: 'truth_facing',
    name: 'Facing Truth',
    namePt: 'Enfrentando a Verdade',
    description: 'Meditation to face difficult truths with courage',
    duration: '30 minutes',
    technique: ['identify_hidden_truth', 'breathe_with_courage', 'accept_what_is', 'transform_through_acceptance'],
    warnings: ['emotional intensity possible'],
  },
  {
    id: 'perception_deepening',
    name: 'Deepening Perception',
    namePt: 'Aprofundando a Percepção',
    description: 'Practice for deepening inner sight and spiritual awareness',
    duration: '25 minutes',
    technique: ['soften_outer_eyes', 'open_inner_eyes', 'observe_without_judgment', 'receive_insight'],
    warnings: ['spiritual intensity'],
  },
];

// GET /api/ababe/data - Get all Ababe data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single type data
    if (type === 'practices') {
      return NextResponse.json(
        { data: ABABE_DATA, count: ABABE_DATA.length },
        { status: 200 }
      );
    }

    if (type === 'offerings') {
      return NextResponse.json(
        { data: ABABE_OFFERINGS, count: ABABE_OFFERINGS.length },
        { status: 200 }
      );
    }

    if (type === 'symbols') {
      return NextResponse.json(
        { data: ABABE_SYMBOLS, count: ABABE_SYMBOLS.length },
        { status: 200 }
      );
    }

    if (type === 'meditations') {
      return NextResponse.json(
        { data: ABABE_MEDITATIONS, count: ABABE_MEDITATIONS.length },
        { status: 200 }
      );
    }

    if (type === 'config') {
      return NextResponse.json({
        name: 'Ababe',
        odu: 'ababe',
        description: 'Orixá of hidden truths, unveiling essence, and spiritual perception',
        aspect: 'truth_and_perception',
        type: 'orixa',
      });
    }

    // Default — return all Ababe data
    return NextResponse.json(
      {
        data: {
          config: {
            name: 'Ababe',
            odu: 'ababe',
            description: 'Orixá of hidden truths, unveiling essence, and spiritual perception',
            aspect: 'truth_and_perception',
            type: 'orixa',
          },
          practices: ABABE_DATA,
          offerings: ABABE_OFFERINGS,
          symbols: ABABE_SYMBOLS,
          meditations: ABABE_MEDITATIONS,
        },
        count: {
          practices: ABABE_DATA.length,
          offerings: ABABE_OFFERINGS.length,
          symbols: ABABE_SYMBOLS.length,
          meditations: ABABE_MEDITATIONS.length,
        },
      },
      { status: 200 }
    );
  } catch (_error) {
    console.error('Ababe API Error:', _error);
    return NextResponse.json(
      { error: 'Failed to retrieve Ababe data' },
      { status: 500 }
    );
  }
}
