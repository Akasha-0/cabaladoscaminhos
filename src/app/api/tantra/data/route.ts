// ============================================================
// TANTRA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Tantra data
// - Sacred sexuality and spiritual practice
// - Chakras, mantras, rituals, energy work
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed Tantra practices for spiritual development
const TANTRIC_PRACTICES = [
  {
    id: 'maithuna',
    name: 'Maithuna',
    namePt: 'Maithuna (União Sagrada)',
    sanskrit: 'मैथुन',
    description: 'Sacred union practice combining physical and spiritual dimensions of intimacy',
    category: 'practice',
    level: 'advanced',
    aspects: ['physical', 'emotional', 'spiritual', 'energetic'],
    benefits: ['energy_transformation', 'consciousness_expansion', 'union_with_divine'],
    precautions: ['requires_preparation', 'sacred_space_required', 'spiritual_guidance'],
    type: 'union',
  },
  {
    id: 'yab-yum',
    name: 'Yab-Yum',
    namePt: 'Yab-Yum (Posição do Abraço)',
    sanskrit: 'यब्ज्म्',
    description: 'Tantric tantric meditation posture representing the union of wisdom and compassion',
    category: 'posture',
    level: 'intermediate',
    aspects: ['meditative', 'energetic', 'sacred'],
    benefits: ['energy_circulation', 'heart_openness', 'spiritual_connection'],
    practice: 'sitting_face_to_face_knee_to_knee',
    visualization: 'light_stream_between_partners',
  },
  {
    id: '_bindu',
    name: 'Bindu Meditation',
    namePt: 'Meditação Bindu',
    sanskrit: 'बिन्दु',
    description: 'Focus on the sacred point of consciousness at the crown chakra',
    category: 'meditation',
    level: 'intermediate',
    aspects: ['consciousness', 'energy', 'transcendence'],
    benefits: ['consciousness_expansion', 'samadhi', 'energy_conservation'],
    technique: 'focus_on_crown_point_with_breath',
    visualization: 'white_lotus_at_sahasrara',
  },
  {
    id: 'amrita',
    name: 'Amrita Meditation',
    namePt: 'Meditação Amrita',
    sanskrit: 'अमृत',
    description: 'Practicing the flow of immortal nectar through the body',
    category: 'meditation',
    level: 'intermediate',
    aspects: ['nectar', 'immortality', 'purification'],
    benefits: ['rejuvenation', 'spiritual_awakening', 'energy_cleansing'],
    technique: 'reverse_khechari_with_nectar_swallowing',
    contraindicated: 'during_menses',
  },
  {
    id: 'kundalini_awakening',
    name: 'Kundalini Awakening',
    namePt: 'Despertar da Kundalini',
    sanskrit: 'कुण्डलिनी',
    description: 'Activating the dormant spiritual energy at the base of the spine',
    category: 'energy_work',
    level: 'advanced',
    aspects: ['energy', 'transformation', 'liberation'],
    benefits: ['spiritual_awakening', 'consciousness_expansion', 'energy_circuit_completion'],
    prerequisites: ['purification', 'energy_balance', 'spiritual_preparation'],
    risks: ['requires_experienced_teacher'],
  },
  {
    id: 'tantric_breathing',
    name: 'Tantric Breathing',
    namePt: 'Respiração Tantrica',
    description: 'Deep breathing techniques to channel sexual energy upward',
    category: 'pranayama',
    level: 'beginner',
    aspects: ['breath', 'energy', 'awakening'],
    techniques: ['deep_abdominal', 'alternate_nostril', 'energy_circulation'],
    benefits: ['energy_mobilization', 'relaxation', 'pranic_cleansing'],
  },
  {
    id: 'chakra_activation',
    name: 'Chakra Activation',
    namePt: 'Ativação dos Chakras',
    description: 'Activating and balancing the seven main energy centers',
    category: 'energy_work',
    level: 'intermediate',
    aspects: ['energy_centers', 'consciousness', 'balance'],
    sequence: ['muladhara', 'svadhisthana', 'manipura', 'anahata', 'vishuddha', 'ajna', 'sahasrara'],
    benefits: ['energy_balance', 'consciousness_development', 'spiritual_growth'],
  },
  {
    id: 'sahasrara_union',
    name: 'Sahasrara Union',
    namePt: 'União com Sahasrara',
    sanskrit: 'सहस्रार',
    description: 'Achieving union with the crown chakra and divine consciousness',
    category: 'meditation',
    level: 'advanced',
    aspects: ['divine', 'transcendence', 'union'],
    prerequisites: ['lower_chakras_balanced', 'kundalini_awakened'],
    benefits: ['enlightenment', 'divine_union', 'consciousness_transcendence'],
  },
  {
    id: 'sacred_mantra',
    name: 'Sacred Mantra Practice',
    namePt: 'Prática de Mantras Sagrados',
    description: 'Chanting sacred sounds for spiritual transformation',
    category: 'mantra',
    level: 'beginner',
    mantras: ['om', 'shakti', 'kundalini', 'saraswati'],
    aspects: ['sound', 'vibration', 'transformation'],
    benefits: ['energy_awakening', 'consciousness_expansion', 'spiritual_protection'],
  },
  {
    id: 'ritual_offering',
    name: 'Tantric Ritual',
    namePt: 'Ritual Tantrico',
    description: 'Sacred rituals for honoring divine energy',
    category: 'ritual',
    level: 'intermediate',
    aspects: ['devotion', 'transformation', 'sacred_space'],
    elements: ['mandala', 'offerings', 'fire_ceremony', 'mudra'],
    benefits: ['spiritual_purification', 'energy_blessing', 'divine_connection'],
  },
];

const TANTRIC_MANTRAS = [
  {
    id: 'om_shakti',
    mantra: 'Om Shakti',
    meaning: 'Invocation of divine feminine energy',
    meaningPt: 'Invocação da energia divina feminina',
    syllables: ['Om', 'Shak', 'ti'],
    chakra: 'sahasrara',
    practice: 'chant_with_breath_awareness',
    effects: ['energy_awakening', 'feminine_divine_access'],
    times: ['dawn', 'dusk'],
  },
  {
    id: 'kundalini_mantra',
    mantra: 'Om Kundalini Shakti',
    meaning: 'Call to dormant spiritual energy',
    meaningPt: 'Chamado à energia espiritual adormecida',
    syllables: ['Om', 'Kun', 'da', 'li', 'ni', 'Shak', 'ti'],
    chakra: 'muladhara',
    practice: 'chant_while_visualizing_serpent',
    effects: ['kundalini_awakening', 'energy_mobilization'],
    times: ['sunrise'],
  },
  {
    id: 'saraswati_mantra',
    mantra: 'Om Saraswati Namah',
    meaning: 'Homage to the goddess of wisdom',
    meaningPt: 'Homenagem à deusa da sabedoria',
    syllables: ['Om', 'Sa', 'ra', 'swa', 'ti', 'Na', 'mah'],
    chakra: 'vishuddha',
    practice: 'chant_with_water_offering',
    effects: ['wisdom_awakening', 'creativity_enhancement'],
    times: ['any'],
  },
  {
    id: 'tripura_sundari',
    mantra: 'Om Tripura Sundari',
    meaning: 'Invocation of the beauty of the three worlds',
    meaningPt: 'Invocação da beleza dos três mundos',
    syllables: ['Om', 'Tri', 'pu', 'ra', 'Sun', 'da', 'ri'],
    chakra: 'ajna',
    practice: 'chant_with_yantra_focus',
    effects: ['third_eye_awakening', 'inner_beauty_recognition'],
    times: ['moonrise'],
  },
  {
    id: 'lakshmi_mantra',
    mantra: 'Om Shrim Mahalakshmai Namah',
    meaning: 'Homage to the goddess of abundance',
    meaningPt: 'Homenagem à deusa da abundância',
    syllables: ['Om', 'Shrim', 'Ma', 'ha', 'Lakh', 'shmai', 'Na', 'mah'],
    chakra: 'manipura',
    practice: 'chant_with_offering',
    effects: ['abundance_attraction', 'prosperity_energy'],
    times: ['friday'],
  },
];

const TANTRIC_CHAKRAS = [
  {
    id: 'muladhara_tantra',
    name: 'Muladhara',
    namePt: 'Raiz (Muladhara)',
    chakra: 1,
    element: 'earth',
    mantraSeed: 'Lam',
    color: 'red',
    location: 'base_of_spine',
    associatedOrgans: ['colon', 'legs', 'bones'],
    psychological: 'survival', 'grounding', 'security',
    tantric: 'kundalini_seat',
    practices: ['bandha_mula', 'standing_poses', 'root_lock'],
    affirmations: ['I am grounded', 'I am secure'],
  },
  {
    id: 'svadhisthana_tantra',
    name: 'Svadhisthana',
    namePt: 'Sagrado (Svadhisthana)',
    chakra: 2,
    element: 'water',
    mantraSeed: 'Vam',
    color: 'orange',
    location: 'sacrum',
    associatedOrgans: ['reproductive', 'kidneys', 'pelvis'],
    psychological: 'creativity', 'sexuality', 'emotions',
    tantric: 'creative_energy_center',
    practices: ['hip_openers', 'water_visualization', 'creative_visualization'],
    affirmations: ['I am creative', 'I honor my sexuality'],
  },
  {
    id: 'manipura_tantra',
    name: 'Manipura',
    namePt: 'Plexo Solar (Manipura)',
    chakra: 3,
    element: 'fire',
    mantraSeed: 'Ram',
    color: 'yellow',
    location: 'navel',
    associatedOrgans: ['stomach', 'liver', 'gallbladder'],
    psychological: 'willpower', 'personal_power', 'digestion',
    tantric: 'power_center',
    practices: ['solar_breathing', 'fire_meditation', 'core_strength'],
    affirmations: ['I am powerful', 'I transform energy'],
  },
  {
    id: 'anahata_tantra',
    name: 'Anahata',
    namePt: 'Coração (Anahata)',
    chakra: 4,
    element: 'air',
    mantraSeed: 'Yam',
    color: 'green',
    location: 'heart_center',
    associatedOrgans: ['heart', 'lungs', 'thymus'],
    psychological: 'love', 'compassion', 'balance',
    tantric: 'center_of_union',
    practices: ['heart_opening', 'loving_kindness', 'chest_expansion'],
    affirmations: ['I love unconditionally', 'I am balanced'],
  },
  {
    id: 'vishuddha_tantra',
    name: 'Vishuddha',
    namePt: 'Garganta (Vishuddha)',
    chakra: 5,
    element: 'ether',
    mantraSeed: 'Ham',
    color: 'blue',
    location: 'throat',
    associatedOrgans: ['throat', 'thyroid', 'neck'],
    psychological: 'expression', 'communication', 'truth',
    tantric: 'purification_center',
    practices: ['throat_opening', 'chanting', 'neck_stretches'],
    affirmations: ['I express my truth', 'I communicate with clarity'],
  },
  {
    id: 'ajna_tantra',
    name: 'Ajna',
    namePt: 'Terceiro Olho (Ajna)',
    chakra: 6,
    element: 'light',
    mantraSeed: 'Om',
    color: 'indigo',
    location: 'between_eyebrows',
    associatedOrgans: ['pituitary', 'brain', 'eyes'],
    psychological: 'intuition', 'wisdom', 'insight',
    tantric: 'command_center',
    practices: ['trataka', 'third_eye_focus', 'introspection'],
    affirmations: ['I trust my intuition', 'I see clearly'],
  },
  {
    id: 'sahasrara_tantra',
    name: 'Sahasrara',
    namePt: 'Coroa (Sahasrara)',
    chakra: 7,
    element: 'cosmic',
    mantraSeed: 'Silence',
    color: 'violet_gold',
    location: 'crown',
    associatedOrgans: ['pineal', 'cerebral_cortex'],
    psychological: 'enlightenment', 'divine_connection', 'transcendence',
    tantric: 'union_with_divine',
    practices: ['crown_focus', 'silence_meditation', 'surrender'],
    affirmations: ['I am divine', 'I am one with all'],
  },
];

const TANTRIC_ENERGIES = {
  shakti: {
    name: 'Shakti',
    description: 'Divine feminine energy, the active principle of the universe',
    aspects: ['kundalini', 'prana', 'consciousness'],
    expression: ['creative', 'transformative', 'nourishing'],
    practices: ['devotion', 'receptivity', 'surrender'],
  },
  shiva: {
    name: 'Shiva',
    description: 'Divine masculine consciousness, the witness principle',
    aspects: ['awareness', 'stillness', 'transcendence'],
    expression: ['witnessing', 'meditative', 'liberating'],
    practices: ['meditation', 'discernment', 'non_attachment'],
  },
  union: {
    name: 'Shiva-Shakti Union',
    description: 'The sacred marriage of consciousness and energy',
    expression: ['balance', 'integration', 'wholeness'],
    practices: ['maithuna', 'yab_yum', 'kundalini_circulation'],
  },
};

// GET /api/tantra/data - Get all Tantra data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'practices') {
      return NextResponse.json({
        success: true,
        data: TANTRIC_PRACTICES,
        count: TANTRIC_PRACTICES.length,
      });
    }

    if (type === 'mantras') {
      return NextResponse.json({
        success: true,
        data: TANTRIC_MANTRAS,
        count: TANTRIC_MANTRAS.length,
      });
    }

    if (type === 'chakras') {
      return NextResponse.json({
        success: true,
        data: TANTRIC_CHAKRAS,
        count: TANTRIC_CHAKRAS.length,
      });
    }

    if (type === 'energies') {
      return NextResponse.json({
        success: true,
        data: TANTRIC_ENERGIES,
      });
    }

    // Return all Tantra data
    return NextResponse.json({
      success: true,
      data: {
        practices: TANTRIC_PRACTICES,
        mantras: TANTRIC_MANTRAS,
        chakras: TANTRIC_CHAKRAS,
        energies: TANTRIC_ENERGIES,
      },
      counts: {
        practices: TANTRIC_PRACTICES.length,
        mantras: TANTRIC_MANTRAS.length,
        chakras: TANTRIC_CHAKRAS.length,
      },
    });
  } catch (error) {
    console.error('Error in Tantra data API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve Tantra data' },
      { status: 500 }
    );
  }
}