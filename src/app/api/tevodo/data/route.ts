// ============================================================
// TEVODO API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Tevodo data
// - Orixá of transitions, crossroads, and duality
// - Spiritual practice and guidance for navigating change
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed Tevodo data for spiritual practice
const TEVODO_DATA = [
  {
    id: 'transition-meditation',
    name: 'Transition Meditation',
    namePt: 'Meditação de Transição',
    description: 'A contemplative practice for navigating life transitions with awareness and grace',
    category: 'meditation',
    aspect: 'transitions',
    level: 'intermediate',
    duration: '15-30 minutes',
    practice: 'consciousness_of_change',
    elements: ['stillness', 'breath_awareness', 'intention'],
    benefits: ['clarity_during_change', 'acceptance', 'inner_peace'],
    invocation: 'Tevodo, lord of crossroads, guide my passage',
  },
  {
    id: 'duality-balance',
    name: 'Duality Balance Practice',
    namePt: 'Prática de Equilíbrio da Dualidade',
    description: 'Working with the balance between opposites - light and dark, giving and receiving',
    category: 'practice',
    aspect: 'duality',
    level: 'advanced',
    duration: '30-45 minutes',
    practice: 'integrating_opposites',
    elements: ['yin Yang visualization', 'breath_balance', ' polarized affirmations'],
    benefits: ['wholeness', 'integration', 'psychological_balance'],
    invocation: 'Tevodo, harmonizer of opposites, unite my duality',
  },
  {
    id: 'crossroads-ritual',
    name: 'Crossroads Ritual',
    namePt: 'Ritual do Cruzamento',
    description: 'Sacred ritual for decision-making at pivotal moments',
    category: 'ritual',
    aspect: 'crossroads',
    level: 'intermediate',
    duration: '20-40 minutes',
    practice: 'decision_guided_by_divine',
    elements: [' offerings', ' candles', ' consultation', ' ritual circle'],
    bestTime: ['midnight', 'crossroads_hour'],
    benefits: [' clarity', ' guidance', ' aligned_decisions'],
    invocation: 'Tevodo, keeper of paths, reveal the right way',
  },
  {
    id: 'passage-prayer',
    name: 'Prayer for Passage',
    namePt: 'Oração de Passagem',
    description: 'Spiritual supplication for smooth transitions between life phases',
    category: 'prayer',
    aspect: 'transitions',
    level: 'beginner',
    practice: 'surrender_and_trust',
    elements: [' intention', ' gratitude_for_phase_ending', ' openness_to_new'],
    conditions: ['endings_honored', 'new_phase_prepared'],
    benefits: ['smooth_transition', 'blessings_on_path', 'protection'],
    invocation: 'Tevodo, guardian of passages, carry me safely through',
  },
  {
    id: 'shadow-light-integration',
    name: 'Shadow-Light Integration',
    namePt: 'Integração Sombra-Luz',
    description: 'Integrating rejected aspects with conscious self for wholeness',
    category: 'meditation',
    aspect: 'duality',
    level: 'advanced',
    duration: '45-60 minutes',
    practice: 'shadow_work_with_light',
    phases: ['shadow identification', 'light recognition', 'integration'],
    benefits: ['wholeness', 'inner_peace', 'authentic_power'],
    invocation: 'Tevodo, weaver of light and shadow, help me embrace all I am',
  },
  {
    id: 'decision-meditation',
    name: 'Decision at the Crossroads',
    namePt: 'Decisão no Cruzamento',
    description: 'Meditative practice for making important choices with spiritual alignment',
    category: 'meditation',
    aspect: 'crossroads',
    level: 'intermediate',
    duration: '20-30 minutes',
    practice: 'discernment_through_stillness',
    technique: ['sit_in_center', 'present_options', 'ask_for_guidance', 'listen_for_answer'],
    benefits: ['clarity', 'confidence', 'aligned_action'],
    invocation: 'Tevodo, opener of paths, illuminate my choice',
  },
  {
    id: 'life-phase-blessing',
    name: 'Life Phase Blessing',
    namePt: 'Bênção de Fase de Vida',
    description: 'Ceremony to bless endings and beginnings in life cycles',
    category: 'ritual',
    aspect: 'transitions',
    level: 'beginner',
    duration: '15-25 minutes',
    practice: 'honoring_cycles',
    elements: [' gratitude for_ending_phase', ' acknowledgment_of_lessons', ' intention_for_new_phase'],
    occasions: ['birthday', 'new_year', 'significant change'],
    benefits: ['completion', 'continuation_blessings', 'purpose_clarification'],
    invocation: 'Tevodo, keeper of cycles, bless my new beginning',
  },
  {
    id: 'opposing-forces-meditation',
    name: 'Opposing Forces Meditation',
    namePt: 'Meditação das Forças Opostas',
    description: 'Sitting with tension between opposing forces until resolution emerges',
    category: 'meditation',
    aspect: 'duality',
    level: 'intermediate',
    duration: '25-35 minutes',
    practice: 'wrestling_with_paradox',
    technique: ['identify_tension', 'sit_with_both_poles', 'breathe_through_paradox', 'await_synthesis'],
    benefits: ['wisdom', 'tolerance_of_ambiguity', 'creative_resolution'],
    invocation: 'Tevodo, resolver of conflicts, bring harmony to my struggle',
  },
];

const TEVODO_OFFERINGS = [
  {
    id: 'tobacco',
    name: 'Tobacco',
    namePt: 'Fumo',
    type: 'sacred',
    form: 'smoking',
    significance: 'sacred smoke for communication with spirit',
    timing: ['transition_moments', 'crossroads_decisions'],
    offeringPractice: 'offer_smoke_while_stating_intention',
  },
  {
    id: 'candy_slave',
    name: 'Candy Slave',
    namePt: 'Doce de Acarajé',
    type: 'food',
    form: 'sweet',
    significance: 'sweetness for balancing duality',
    offeringPractice: 'offer_sweetness_with_gratitude',
  },
  {
    id: 'coconut_water',
    name: 'Coconut Water',
    namePt: 'Água de Coco',
    type: 'beverage',
    form: 'liquid',
    significance: 'purification for transition',
    offeringPractice: 'pour_at_crossroads_as_offering',
  },
  {
    id: 'iron',
    name: 'Iron Object',
    namePt: 'Objeto de Ferro',
    type: 'mineral',
    form: 'metal',
    significance: 'iron for strength at crossroads',
    offeringPractice: 'place_iron_at_crossroads_or_doorway',
  },
  {
    id: 'black_and_white',
    name: 'Black and White Candles',
    namePt: 'Velas Preta e Branca',
    type: 'light',
    form: 'candles',
    significance: 'duality represented in light',
    offeringPractice: 'light_both_candles_during_meditation',
  },
];

const TEVODO_SYMBOLS = [
  {
    id: 'crossroads',
    name: 'Crossroads',
    namePt: 'Cruzamento',
    meaning: 'the meeting point of paths, where decisions are made',
    significance: 'moment of choice and divine guidance',
  },
  {
    id: 'fork',
    name: 'Forked Path',
    namePt: 'Caminho Bifurcado',
    meaning: 'diverging options, the branching of fate',
    significance: 'decision point, alternative possibilities',
  },
  {
    id: 'bridge',
    name: 'Bridge',
    namePt: 'Ponte',
    meaning: 'connection between states of being',
    significance: 'transition from one phase to another',
  },
  {
    id: 'doorway',
    name: 'Doorway',
    namePt: 'Porta',
    meaning: 'threshold between inside and outside, known and unknown',
    significance: 'portal of transformation',
  },
  {
    id: 'yin_yang',
    name: 'Yin Yang',
    namePt: 'Yin Yang',
    meaning: 'interdependence of opposites',
    significance: 'dynamic balance, complementary forces',
  },
  {
    id: 'scale',
    name: 'Scale Balance',
    namePt: 'Balança',
    meaning: 'equilibrium between dual forces',
    significance: 'justice, discernment, fair judgment',
  },
];

const TEVODO_MEDITATIONS = [
  {
    id: 'crossroads-visualization',
    name: 'Crossroads Visualization',
    namePt: 'Visualização do Cruzamento',
    type: 'guided',
    duration: '15-20 minutes',
    practice: 'imagine_self_at_literal_crossroads',
    steps: [
      'find_center_of_crossroads',
      'observe_paths_extending_in_four_directions',
      'feel_presence_of_Tevodo',
      'ask_for_guidance',
      'await_sign_or_intuition',
      'choose_path_with_confidence',
    ],
    benefits: ['clarity', 'guidance', 'courage_to_choose'],
  },
  {
    id: 'dual-polarity-breath',
    name: 'Dual Polarity Breath',
    namePt: 'Respiração de Polaridade Dual',
    type: 'pranayama',
    duration: '10-15 minutes',
    practice: 'alternate_inhalation_between_nostrils',
    technique: [
      'right_nostril_inhale_left_exhale (represents solar active)',
      'left_nostril_inhale_right_exhale (represents lunar receptive)',
      'alternate_for_5-10_minutes',
      'finish_with_both_nostrils_deep_breath',
    ],
    benefits: ['balance', 'nervous_system_harmony', 'duality_integration'],
  },
  {
    id: 'passage-body-scan',
    name: 'Passage Body Scan',
    namePt: 'Escaneamento Corporal de Passagem',
    type: 'somatic',
    duration: '20-30 minutes',
    practice: 'scan_body_for_transitions',
    technique: [
      'stand_at_threshold_or doorway',
      'scan_feet_connection_to_earth',
      'move_attention_upbody_noticing change_areas',
      'breathe_into_any_tension',
      'transform_tension_with breath',
      'step_through_imagined_doorway',
    ],
    benefits: ['embodied_transition', 'release_old_patterns', 'integration'],
  },
];

// GET /api/tevodo/data - Get all Tevodo data
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
            tevodo: {
              orixa: 'Tevodo',
              domain: ['transitions', 'crossroads', 'duality', 'balance'],
              description:
                'Tevodo is the orixá of transitions, crossroads, and duality. He governs the spaces between—withdrawing from the old while not yet arrived at the new.',
              practices: TEVODO_DATA,
              offerings: TEVODO_OFFERINGS,
              symbols: TEVODO_SYMBOLS,
              meditations: TEVODO_MEDITATIONS,
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
          return NextResponse.json({ success: true, data: TEVODO_DATA }, { status: 200 });
        case 'offerings':
          return NextResponse.json({ success: true, data: TEVODO_OFFERINGS }, { status: 200 });
        case 'symbols':
          return NextResponse.json({ success: true, data: TEVODO_SYMBOLS }, { status: 200 });
        case 'meditations':
          return NextResponse.json({ success: true, data: TEVODO_MEDITATIONS }, { status: 200 });
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid type. Valid types: practices, offerings, symbols, meditations' },
            { status: 400 }
          );
      }
    }

    // Filter by aspect
    if (aspect) {
      const validAspects = ['transitions', 'crossroads', 'duality'];
      if (!validAspects.includes(aspect)) {
        return NextResponse.json(
          { success: false, error: `Invalid aspect. Valid aspects: ${validAspects.join(', ')}` },
          { status: 400 }
        );
      }

      const filteredPractices = TEVODO_DATA.filter((p) => p.aspect === aspect);
      const filteredMeditations = TEVODO_MEDITATIONS.filter((m) => m.id.includes(aspect));

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
    console.error('Tevodo data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
