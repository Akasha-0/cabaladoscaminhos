// ============================================================
// ABEBE API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Abebe data
// - Spiritual essence and divine connection
// - Path of transcendence and unity
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed Abebe data for spiritual practice
const ABEBE_DATA = [
  {
    id: 'divine-union-meditation',
    name: 'Divine Union Meditation',
    namePt: 'Meditação da União Divina',
    description: 'A contemplative practice for experiencing oneness with the divine essence',
    category: 'meditation',
    aspect: 'unity',
    level: 'intermediate',
    duration: '25-40 minutes',
    practice: 'consciousness_of_divinity',
    elements: ['stillness', 'inner_awareness', 'surrender'],
    benefits: ['transcendence', 'unity', 'divine_connection'],
    invocation: 'Abebe, bridge between worlds, guide me to divine union',
  },
  {
    id: 'essence-awakening',
    name: 'Essence Awakening Practice',
    namePt: 'Prática de Despertar da Essência',
    description: 'Working to awaken the divine spark within and recognize cosmic identity',
    category: 'practice',
    aspect: 'essence',
    level: 'advanced',
    duration: '35-50 minutes',
    practice: 'recognizing_divinity_within',
    elements: ['inner journey', 'divine recognition', 'integration'],
    benefits: ['self_realization', 'cosmic_awareness', 'transcendent_purpose'],
    invocation: 'Abebe, awakener of essence, help me remember my divine origin',
  },
  {
    id: 'sacred-connection-ritual',
    name: 'Sacred Connection Ritual',
    namePt: 'Ritual de Conexão Sagrada',
    description: 'Sacred ritual for establishing direct communion with higher dimensions',
    category: 'ritual',
    aspect: 'connection',
    level: 'intermediate',
    duration: '30-45 minutes',
    practice: 'opening_divine_channel',
    elements: ['prayer', 'candles', 'visualization', 'sacred_space'],
    bestTime: ['dawn', 'midnight'],
    benefits: ['clarity', 'divine_guidance', 'spiritual_alignment'],
    invocation: 'Abebe, opener of celestial gates, grant me access to higher realms',
  },
  {
    id: 'transcendence-prayer',
    name: 'Prayer for Transcendence',
    namePt: 'Oração pela Transcendência',
    description: 'Spiritual supplication for liberation from limitations and cosmic expansion',
    category: 'prayer',
    aspect: 'transcendence',
    level: 'beginner',
    practice: 'expansion_beyond_limits',
    elements: ['intention', 'devotion', 'opening_to_infinity'],
    conditions: ['willingness_to_grow', 'release_of_attachment'],
    benefits: ['liberation', 'expansion', 'cosmic_consciousness'],
    invocation: 'Abebe, liberator from limits, expand my consciousness to infinity',
  },
  {
    id: 'divine-light-meditation',
    name: 'Divine Light Meditation',
    namePt: 'Meditação da Luz Divina',
    description: 'Meditative practice for attuning to divine luminous energy',
    category: 'meditation',
    aspect: 'light',
    level: 'intermediate',
    duration: '20-35 minutes',
    practice: 'channeling_divine_light',
    technique: ['centeredness', 'breath_awareness', 'light_invocation', 'integration'],
    benefits: ['illumination', 'divine_alignment', 'energetic_purification'],
    invocation: 'Abebe, bearer of divine light, illuminate my path',
  },
  {
    id: 'cosmic-self-meditation',
    name: 'Cosmic Self Meditation',
    namePt: 'Meditação do Eu Cósmico',
    description: 'Practice for expanding identity beyond individual to universal',
    category: 'meditation',
    aspect: 'cosmic',
    level: 'advanced',
    duration: '40-55 minutes',
    practice: 'dissolving_limited_identity',
    technique: ['breath_focus', 'identity_expansion', 'cosmic_immersion', 'integration'],
    benefits: ['ego_transcendence', 'universal_awareness', 'oneness'],
    invocation: 'Abebe, expander of consciousness, show me my cosmic nature',
  },
  {
    id: 'celestial-blessing',
    name: 'Celestial Blessing',
    namePt: 'Bênção Celestial',
    description: 'Ceremony to receive blessing from celestial hierarchies',
    category: 'ritual',
    aspect: 'blessing',
    level: 'beginner',
    duration: '15-25 minutes',
    practice: 'receiving_divine_grace',
    elements: ['reverence', 'openness', 'gratitude', 'devotion'],
    occasions: ['new_cycles', 'spiritual_landmarks', 'transitional_moments'],
    benefits: ['divine_favor', 'spiritual_protection', 'cosmic_guidance'],
    invocation: 'Abebe, channel of celestial grace, bless my spiritual journey',
  },
  {
    id: 'oneness-practice',
    name: 'Oneness Practice',
    namePt: 'Prática da Unidade',
    description: 'Practice for experiencing unity with all existence',
    category: 'practice',
    aspect: 'unity',
    level: 'advanced',
    duration: '45-60 minutes',
    practice: 'experiencing_interconnectedness',
    technique: ['compassion_sending', 'boundary_dissolving', 'unity_restoration', 'integration'],
    benefits: ['compassion', 'non_separation', 'enlightened_awareness'],
    invocation: 'Abebe, unifier of all, help me see the one in the many',
  },
];

const ABEBE_OFFERINGS = [
  {
    id: 'candle-golden',
    name: 'Golden Candle',
    namePt: 'Vela Dourada',
    type: 'sacred',
    form: 'flame',
    significance: 'light representing divine presence and illumination',
    timing: ['divine_connections', 'spiritual_work'],
    offeringPractice: 'light_candle_with_devotional_prayer',
  },
  {
    id: 'incense-sandalwood',
    name: 'Sandalwood Incense',
    namePt: 'Incenso de Pau-Brasil',
    type: 'sacred',
    form: 'smoke',
    significance: 'sacred fragrance for raising vibration',
    timing: ['meditation', 'ritual_ceremony'],
    offeringPractice: 'burn_incense_during_sacred_practice',
  },
  {
    id: 'clear-quartz',
    name: 'Clear Quartz Crystal',
    namePt: 'Cristal de Quartzo Cristal',
    type: 'sacred_object',
    form: 'crystal',
    significance: 'amplifier of divine energy and spiritual clarity',
    timing: ['energy_work', 'divine_communion'],
    offeringPractice: 'hold_crystal_during_meditation',
  },
  {
    id: 'sacred-water',
    name: 'Sacred Water',
    namePt: 'Água Sagrada',
    type: 'purification',
    form: 'liquid',
    significance: 'cleansing and blessing medium',
    timing: ['purification', 'blessing_ceremonies'],
    offeringPractice: 'sprinkle_water_while_invoking_divine_light',
  },
  {
    id: 'flower-white',
    name: 'White Flower',
    namePt: 'Flor Branca',
    type: 'offering',
    form: 'bloom',
    significance: 'purity and spiritual devotion',
    timing: ['sacred_occasions', 'divine_honoring'],
    offeringPractice: 'place_flowers_at_sacred_space',
  },
];

const ABEBE_SYMBOLS = [
  {
    id: 'divine-eye',
    name: 'Divine Eye',
    namePt: 'Olho Divino',
    description: 'Symbol of spiritual vision and divine awareness',
    meaning: 'inner_sight_beyond_illusion',
    usage: ['meditation_focus', 'spiritual_art', 'sacred_spaces'],
  },
  {
    id: 'cosmic-spiral',
    name: 'Cosmic Spiral',
    namePt: 'Espiral Cósmica',
    description: 'Symbol of expanding consciousness and cosmic evolution',
    meaning: 'expansion_and_ascension',
    usage: ['visualization', 'sacred_art', 'contemplation'],
  },
  {
    id: 'lotus-radiant',
    name: 'Radiant Lotus',
    namePt: 'Lótus Radiante',
    description: 'Symbol of spiritual emergence and divine blossoming',
    meaning: 'transcendence_through_purity',
    usage: ['offering_symbol', 'meditation_anchor', 'divine_honor'],
  },
  {
    id: 'celestial-gate',
    name: 'Celestial Gate',
    namePt: 'Portão Celestial',
    description: 'Symbol of passage between earthly and divine realms',
    meaning: 'portal_to_transcendence',
    usage: ['ritual_boundary', 'transition_work', 'spiritual_journey'],
  },
  {
    id: 'star-cosmic',
    name: 'Cosmic Star',
    namePt: 'Estrela Cósmica',
    description: 'Symbol of divine guidance and celestial navigation',
    meaning: 'divine_light_and_direction',
    usage: ['spiritual_compass', 'celestial_honoring', 'guidance_work'],
  },
];

const ABEBE_MEDITATIONS = [
  {
    id: 'divine-presence-meditation',
    name: 'Divine Presence Meditation',
    namePt: 'Meditação da Presença Divina',
    description: 'Practice for experiencing the divine presence within and without',
    duration: '30 minutes',
    technique: ['settle_into_stillness', 'open_to_divine_presence', 'rest_in_awareness', 'receive_grace'],
  },
  {
    id: 'cosmic-consciousness-meditation',
    name: 'Cosmic Consciousness Meditation',
    namePt: 'Meditação da Consciência Cósmica',
    description: 'Practice for expanding awareness to cosmic dimensions',
    duration: '35 minutes',
    technique: ['breathe_cosmic_breath', 'expand_awareness_outward', 'merge_with_universe', 'rest_in_infinity'],
  },
  {
    id: 'divine-love-meditation',
    name: 'Divine Love Meditation',
    namePt: 'Meditação do Amor Divino',
    description: 'Practice for opening heart to divine unconditional love',
    duration: '25 minutes',
    technique: ['open_heart_center', 'invoke_divine_love', 'bathe_in_divine_radiance', 'merge_with_love'],
  },
];

// GET /api/abebe/data - Get all Abebe data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single type data
    if (type === 'practices') {
      return NextResponse.json(
        { data: ABEBE_DATA, count: ABEBE_DATA.length },
        { status: 200 }
      );
    }

    if (type === 'offerings') {
      return NextResponse.json(
        { data: ABEBE_OFFERINGS, count: ABEBE_OFFERINGS.length },
        { status: 200 }
      );
    }

    if (type === 'symbols') {
      return NextResponse.json(
        { data: ABEBE_SYMBOLS, count: ABEBE_SYMBOLS.length },
        { status: 200 }
      );
    }

    if (type === 'meditations') {
      return NextResponse.json(
        { data: ABEBE_MEDITATIONS, count: ABEBE_MEDITATIONS.length },
        { status: 200 }
      );
    }

    if (type === 'config') {
      return NextResponse.json({
        name: 'Abebe',
        odu: 'abebe',
        description: 'Spiritual essence, divine connection, transcendence and unity',
        aspect: 'divine_connection',
        type: 'orixa',
      });
    }

    // Default — return all Abebe data
    return NextResponse.json(
      {
        data: {
          config: {
            name: 'Abebe',
            odu: 'abebe',
            description: 'Spiritual essence, divine connection, transcendence and unity',
            aspect: 'divine_connection',
            type: 'orixa',
          },
          practices: ABEBE_DATA,
          offerings: ABEBE_OFFERINGS,
          symbols: ABEBE_SYMBOLS,
          meditations: ABEBE_MEDITATIONS,
        },
        count: {
          practices: ABEBE_DATA.length,
          offerings: ABEBE_OFFERINGS.length,
          symbols: ABEBE_SYMBOLS.length,
          meditations: ABEBE_MEDITATIONS.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Abebe API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Abebe data' },
      { status: 500 }
    );
  }
}